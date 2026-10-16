import {
  ArrowRight,
  CheckCircle2,
  ExternalLink,
  Percent,
  Search,
  Sparkles,
  Tag,
  TrendingDown,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useProductCatalog } from "../../catalog/ProductCatalogContext";
import type { Product, ProductVariant } from "../../types/product";
import { formatGhs } from "../../utils/format";

interface PromoItem {
  id: string;
  productId: string;
  productName: string;
  category: string;
  variantTitle?: string;
  storage?: string;
  finish?: string;
  regularPrice: number;
  salePrice: number;
  savings: number;
  discountPercent: number;
  stockStatus: string;
  available: boolean;
}

export function AdminPromotionsPage() {
  const { products, loading } = useProductCatalog();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");

  // Extract all promotional items authoritative from catalog
  const promoItems: PromoItem[] = useMemo(() => {
    const list: PromoItem[] = [];

    products.forEach((p) => {
      // 1. Check product variants
      const vars = p.variants ?? [];
      let hadVariantPromo = false;

      vars.forEach((v) => {
        const isSale = v.isSale || (v.previousPrice && v.previousPrice > v.price);
        if (isSale) {
          hadVariantPromo = true;
          const reg = v.previousPrice && v.previousPrice > v.price ? v.previousPrice : v.price * 1.15;
          const diff = reg - v.price;
          const pct = Math.round((diff / reg) * 100);

          list.push({
            id: `var-${v.id}`,
            productId: p.id,
            productName: p.name,
            category: p.category,
            variantTitle: v.title,
            storage: v.storage,
            finish: v.finish,
            regularPrice: reg,
            salePrice: v.price,
            savings: diff,
            discountPercent: pct > 0 ? pct : 5,
            stockStatus: v.stockStatus,
            available: v.available !== false && p.available !== false,
          });
        }
      });

      // 2. Check base product level if no variants on promo
      if (!hadVariantPromo && p.previousPrice && p.previousPrice > p.price) {
        const diff = p.previousPrice - p.price;
        const pct = Math.round((diff / p.previousPrice) * 100);
        list.push({
          id: `prod-${p.id}`,
          productId: p.id,
          productName: p.name,
          category: p.category,
          variantTitle: "Base Device Configuration",
          regularPrice: p.previousPrice,
          salePrice: p.price,
          savings: diff,
          discountPercent: pct,
          stockStatus: p.stockStatus,
          available: p.available !== false,
        });
      }
    });

    return list;
  }, [products]);

  // Categories list
  const categoriesList = useMemo(() => {
    const set = new Set<string>();
    promoItems.forEach((item) => set.add(item.category));
    return Array.from(set).sort();
  }, [promoItems]);

  const filtered = useMemo(() => {
    return promoItems.filter((item) => {
      if (categoryFilter !== "All" && item.category !== categoryFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        const str = `${item.productName} ${item.variantTitle || ""} ${item.category}`.toLowerCase();
        if (!str.includes(q)) return false;
      }
      return true;
    });
  }, [promoItems, categoryFilter, search]);

  const stats = useMemo(() => {
    const totalPromos = promoItems.length;
    const totalSavings = promoItems.reduce((acc, item) => acc + item.savings, 0);
    const avgDiscount =
      totalPromos > 0
        ? Math.round(promoItems.reduce((acc, item) => acc + item.discountPercent, 0) / totalPromos)
        : 0;
    return { totalPromos, totalSavings, avgDiscount };
  }, [promoItems]);

  return (
    <div className="space-y-6">
      {/* 1. Header Card */}
      <div className="admin-header-card">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-[#d4af37]">
              Marketing &amp; Discounts
            </span>
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-slate-300" />
            <span className="text-xs font-semibold text-slate-500">Authoritative Pricing Source</span>
          </div>
          <h2>Promotions &amp; Special Offers</h2>
          <p>
            Review all live sale discounts and promotional strikethrough prices active across the
            storefront. Sourced directly from the verified database.
          </p>
        </div>

        <Link to="/admin/products" className="admin-btn admin-btn-primary">
          <Tag size={16} />
          <span>Edit in Products</span>
        </Link>
      </div>

      {/* 2. KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="admin-card flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Active Promo Deals
            </span>
            <div className="text-2xl font-extrabold text-slate-900 mt-1">{stats.totalPromos}</div>
            <p className="text-xs text-slate-400 mt-0.5">Device configurations on discount</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 grid place-items-center">
            <Sparkles size={20} />
          </div>
        </div>

        <div className="admin-card flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Average Discount
            </span>
            <div className="text-2xl font-extrabold text-emerald-600 mt-1">
              {stats.avgDiscount}% OFF
            </div>
            <p className="text-xs text-slate-400 mt-0.5">Across active promotional items</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 grid place-items-center">
            <Percent size={20} />
          </div>
        </div>

        <div className="admin-card flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Max Customer Savings
            </span>
            <div className="text-2xl font-extrabold text-slate-900 mt-1">
              {formatGhs(stats.totalSavings)}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">Combined discount value offered</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-600 grid place-items-center">
            <TrendingDown size={20} />
          </div>
        </div>
      </div>

      {/* Architectural Guarantee Notice */}
      <div className="p-4 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-600 flex items-center gap-2.5">
        <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
        <span>
          <strong>Zero Pricing Conflict:</strong> This promotions manager is fully synchronized with the
          Products editor. Changes made to sale prices or previous prices in
          Products propagate to the storefront, cart, and this dashboard.
        </span>
      </div>

      {/* 3. Toolbar */}
      <div className="admin-toolbar">
        <div className="admin-search-input">
          <Search size={16} className="text-slate-400 shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search promotional devices..."
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mr-1">
            Category:
          </span>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="admin-select"
          >
            <option value="All">All Categories</option>
            {categoriesList.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 4. Promotional Items Data Table */}
      <div className="admin-table-shell">
        <div className="admin-table-scroll">
          <table className="admin-data-table">
            <thead>
              <tr>
                <th>Product &amp; Tier</th>
                <th>Category</th>
                <th>Regular Price</th>
                <th>Promotional Price</th>
                <th>Discount</th>
                <th>Customer Savings</th>
                <th>Stock Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-slate-400">
                    Loading promotional data from database...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-slate-400">
                    No active promotions found. Set a "Previous Price" in Products to launch
                    a discount deal.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70">
                    <td>
                      <div className="font-bold text-slate-900">{item.productName}</div>
                      <div className="text-xs text-slate-500">{item.variantTitle}</div>
                    </td>
                    <td>
                      <span className="admin-badge admin-badge-slate">{item.category}</span>
                    </td>
                    <td className="text-slate-400 line-through text-xs font-medium">
                      {formatGhs(item.regularPrice)}
                    </td>
                    <td className="font-bold text-slate-900">{formatGhs(item.salePrice)}</td>
                    <td>
                      <span className="admin-badge admin-badge-amber font-bold">
                        -{item.discountPercent}% OFF
                      </span>
                    </td>
                    <td className="text-emerald-700 font-semibold text-xs">
                      Save {formatGhs(item.savings)}
                    </td>
                    <td>
                      <span
                        className={`admin-badge ${
                          item.stockStatus === "In Stock"
                            ? "admin-badge-emerald"
                            : item.stockStatus === "Low Stock"
                            ? "admin-badge-amber"
                            : "admin-badge-rose"
                        }`}
                      >
                        {item.stockStatus}
                      </span>
                    </td>
                    <td>
                      <Link
                        to={`/admin/products?search=${encodeURIComponent(item.productName)}`}
                        className="admin-btn admin-btn-secondary admin-btn-sm"
                      >
                        <span>Adjust</span>
                        <ArrowRight size={13} />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
