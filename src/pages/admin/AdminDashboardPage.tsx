import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Clock,
  DollarSign,
  Image as ImageIcon,
  Layers,
  Package,
  PackageCheck,
  PackageX,
  Plus,
  RefreshCw,
  ShoppingBag,
  Sparkles,
  Tag,
  TrendingUp,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { isProductImageEligible, isProductUnavailable, normalizeStockStatus } from "../../catalog/productCatalog";
import { useProductCatalog } from "../../catalog/ProductCatalogContext";
import { fetchAdminOrders } from "../../orders/supabaseOrderRepository";
import type { StoredOrderRequest } from "../../types/order";
import { isTestOrder } from "../../types/order";
import { formatGhs } from "../../utils/format";
import { requiresRealProductPhotos } from "../../utils/productImages";

export function AdminDashboardPage() {
  const { products, activeProducts, backendStatus, loading: catalogLoading } = useProductCatalog();
  const [orders, setOrders] = useState<StoredOrderRequest[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [ordersError, setOrdersError] = useState("");

  const loadOrders = () => {
    setOrdersLoading(true);
    setOrdersError("");
    fetchAdminOrders()
      .then((data) => {
        setOrders(data);
      })
      .catch(() => {
        setOrdersError("Order summaries could not be loaded from database.");
      })
      .finally(() => {
        setOrdersLoading(false);
      });
  };

  useEffect(() => {
    loadOrders();
  }, []);

  // Compute live metrics from verified data (excluding test/bot orders)
  const metrics = useMemo(() => {
    let totalVariants = 0;
    let activeVariants = 0;
    let lowStockVariants = 0;
    let outOfStockVariants = 0;
    let onSaleCount = 0;

    products.forEach((p) => {
      const vars = p.variants ?? [];
      totalVariants += vars.length;
      vars.forEach((v) => {
        if (v.available) activeVariants++;
        if (v.stockStatus === "Low Stock" || (v.stockQuantity > 0 && v.stockQuantity <= 3)) {
          lowStockVariants++;
        }
        if (v.stockStatus === "Out of Stock" || v.stockQuantity <= 0) {
          outOfStockVariants++;
        }
        if (v.isSale || (v.previousPrice && v.previousPrice > v.price)) {
          onSaleCount++;
        }
      });
      if (p.previousPrice && p.previousPrice > p.price) {
        onSaleCount++;
      }
    });

    const lowStockProducts = activeProducts.filter(
      (p) => normalizeStockStatus(p) === "Low Stock"
    ).length;
    const outOfStockProducts = activeProducts.filter((p) =>
      ["Out of Stock", "Sold"].includes(normalizeStockStatus(p))
    ).length;
    const photosNeeded = products.filter(requiresRealProductPhotos).length;
    const missingImageProducts = products.filter((p) => !isProductImageEligible(p)).length;

    // Isolate test/bot verification orders from live metrics
    const genuineOrders = orders.filter((o) => !isTestOrder(o));
    const testOrdersCount = orders.length - genuineOrders.length;

    const pendingOrders = genuineOrders.filter((o) => o.status === "Pending").length;
    const confirmedOrders = genuineOrders.filter((o) =>
      ["Confirmed", "Processing", "Delivered", "Completed"].includes(o.status)
    ).length;
    const totalOrderRequestValue = genuineOrders.reduce((sum, o) => sum + (o.total || 0), 0);

    return {
      publishedProducts: activeProducts.length,
      hiddenProducts: products.length - activeProducts.length,
      totalVariants,
      activeVariants,
      lowStockProducts,
      lowStockVariants,
      outOfStockProducts,
      outOfStockVariants,
      photosNeeded,
      missingImageProducts,
      pendingOrders,
      confirmedOrders,
      totalOrders: genuineOrders.length,
      totalLifetimeOrders: orders.length,
      testOrdersCount,
      totalOrderRequestValue,
      onSaleCount,
    };
  }, [products, activeProducts, orders]);

  const recentOrders = useMemo(() => {
    const genuine = orders.filter((o) => !isTestOrder(o));
    return genuine.slice(0, 6);
  }, [orders]);

  return (
    <div className="space-y-6">
      {/* 1. Header & Live Connection Status */}
      <div className="admin-header-card">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-[#d4af37]">
              Operations Overview
            </span>
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-slate-300" />
            <span className="text-xs font-semibold text-slate-500">Live Production System</span>
          </div>
          <h2>E-Commerce Command Center</h2>
          <p>
            Real-time catalog metrics, inventory health, authoritative pricing, and incoming customer
            order requests.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold border ${
              backendStatus === "supabase"
                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                : "bg-amber-50 text-amber-800 border-amber-200"
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                backendStatus === "supabase" ? "bg-emerald-500" : "bg-amber-500 animate-ping"
              }`}
            />
            <span>
              {backendStatus === "supabase"
                ? "Authoritative Supabase DB Connected"
                : "Checking Catalog Source..."}
            </span>
          </div>
          <button
            type="button"
            onClick={loadOrders}
            className="admin-btn admin-btn-secondary admin-btn-sm"
            title="Refresh Orders"
          >
            <RefreshCw size={14} className={ordersLoading ? "animate-spin" : ""} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* 2. Key Metrics Grid */}
      <section aria-label="Key business metrics" className="admin-metrics-grid">
        {/* Published Products */}
        <Link to="/admin/products" className="admin-metric-card">
          <div className="admin-metric-header">
            <span className="admin-metric-label">Published Devices</span>
            <div className="admin-metric-icon">
              <Package size={17} className="text-slate-600" />
            </div>
          </div>
          <div className="admin-metric-value">{metrics.publishedProducts}</div>
          <div className="admin-metric-hint">
            {metrics.hiddenProducts > 0
              ? `${metrics.hiddenProducts} hidden / archived`
              : "All catalog devices active"}
          </div>
        </Link>

        {/* Active Variants */}
        <Link to="/admin/pricing" className="admin-metric-card">
          <div className="admin-metric-header">
            <span className="admin-metric-label">Active Variants</span>
            <div className="admin-metric-icon">
              <Layers size={17} className="text-slate-600" />
            </div>
          </div>
          <div className="admin-metric-value">{metrics.activeVariants}</div>
          <div className="admin-metric-hint">
            Across {metrics.totalVariants} configuration tiers (Storage, Chip, Finish)
          </div>
        </Link>

        {/* Pending Orders */}
        <Link to="/admin/orders" className="admin-metric-card">
          <div className="admin-metric-header">
            <span className="admin-metric-label">Pending Orders</span>
            <div className="admin-metric-icon">
              <Clock size={17} className="text-amber-600" />
            </div>
          </div>
          <div className="admin-metric-value text-amber-600">
            {ordersLoading ? "..." : metrics.pendingOrders}
          </div>
          <div className="admin-metric-hint">
            {ordersLoading
              ? "Checking inbox..."
              : `${metrics.totalOrders} genuine customer requests ${
                  metrics.testOrdersCount > 0 ? `(${metrics.testOrdersCount} dev test isolated)` : ""
                }`}
          </div>
        </Link>

        {/* Gross Order Request Pipeline */}
        <Link to="/admin/orders" className="admin-metric-card">
          <div className="admin-metric-header">
            <span className="admin-metric-label">Order Pipeline</span>
            <div className="admin-metric-icon">
              <DollarSign size={17} className="text-emerald-600" />
            </div>
          </div>
          <div className="admin-metric-value text-slate-900 text-[1.6rem]">
            {ordersLoading ? "..." : formatGhs(metrics.totalOrderRequestValue)}
          </div>
          <div className="admin-metric-hint">
            Pipeline order requests (offline MoMo/COD payment confirmation)
          </div>
        </Link>

        {/* Low Stock Attention */}
        <Link to="/admin/pricing" className="admin-metric-card">
          <div className="admin-metric-header">
            <span className="admin-metric-label">Low Stock Variants</span>
            <div className="admin-metric-icon">
              <TrendingUp size={17} className="text-amber-500" />
            </div>
          </div>
          <div className="admin-metric-value text-amber-600">{metrics.lowStockVariants}</div>
          <div className="admin-metric-hint">
            {metrics.lowStockProducts} parent devices near depletion
          </div>
        </Link>

        {/* Out of Stock */}
        <Link to="/admin/pricing" className="admin-metric-card">
          <div className="admin-metric-header">
            <span className="admin-metric-label">Out of Stock</span>
            <div className="admin-metric-icon">
              <PackageX size={17} className="text-rose-500" />
            </div>
          </div>
          <div className="admin-metric-value text-rose-600">{metrics.outOfStockVariants}</div>
          <div className="admin-metric-hint">
            {metrics.outOfStockProducts} unpurchasable device models
          </div>
        </Link>

        {/* Active Promotions */}
        <Link to="/admin/promotions" className="admin-metric-card">
          <div className="admin-metric-header">
            <span className="admin-metric-label">Active Promos</span>
            <div className="admin-metric-icon">
              <Sparkles size={17} className="text-[#d4af37]" />
            </div>
          </div>
          <div className="admin-metric-value text-slate-900">{metrics.onSaleCount}</div>
          <div className="admin-metric-hint">Sale discounts currently published</div>
        </Link>

        {/* Missing Images (Hidden from Catalogue) */}
        <Link to="/admin/products?availability=MissingImages" className="admin-metric-card">
          <div className="admin-metric-header">
            <span className="admin-metric-label">Missing Images</span>
            <div className="admin-metric-icon">
              <ImageIcon size={17} className="text-amber-600" />
            </div>
          </div>
          <div className="admin-metric-value text-amber-600">{metrics.missingImageProducts}</div>
          <div className="admin-metric-hint">Hidden from catalogue until photos uploaded</div>
        </Link>
      </section>

      {/* Catalog Architecture Explainer */}
      <div className="p-4 rounded-xl bg-slate-900 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="text-[0.68rem] font-bold uppercase tracking-wider text-[#d4af37]">
              Catalogue Architecture
            </span>
            <span className="text-slate-400 text-xs">&bull;</span>
            <span className="text-xs font-semibold text-slate-300">
              {metrics.publishedProducts} Base Devices &bull; {metrics.totalVariants} Hardware Configurations
            </span>
          </div>
          <p className="text-xs text-slate-300">
            Base products define device models and public storefront catalogue presence. The 273 configuration variants define tier-specific authoritative pricing (storage, memory, finish, condition) and inventory in Supabase.
          </p>
        </div>
        <Link
          to="/admin/pricing"
          className="admin-btn admin-btn-secondary admin-btn-sm whitespace-nowrap text-slate-900 bg-white hover:bg-slate-100 shrink-0"
        >
          View Variant Pricing
        </Link>
      </div>

      {/* 3. Operational Quick Actions */}
      <section className="admin-card">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-3">
          Quick Management Actions
        </h3>
        <div className="flex flex-wrap gap-2.5">
          <Link to="/admin/products" className="admin-btn admin-btn-primary">
            <Plus size={16} />
            <span>Manage Products</span>
          </Link>
          <Link to="/admin/pricing" className="admin-btn admin-btn-secondary">
            <DollarSign size={16} className="text-[#d4af37]" />
            <span>Authoritative Pricing & Stock</span>
          </Link>
          <Link to="/admin/orders" className="admin-btn admin-btn-secondary">
            <ShoppingBag size={16} />
            <span>Review Customer Orders</span>
          </Link>
          <Link to="/admin/trade-ins" className="admin-btn admin-btn-secondary">
            <Tag size={16} />
            <span>Trade-In Inquiries</span>
          </Link>
          <Link to="/admin/promotions" className="admin-btn admin-btn-secondary">
            <Sparkles size={16} className="text-[#d4af37]" />
            <span>Review Promotions</span>
          </Link>
        </div>
      </section>

      {/* 4. Recent Order Requests Table */}
      <section className="admin-table-shell">
        <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">Recent Customer Order Requests</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Verified orders placed on buyandsellgh.com storefront.
            </p>
          </div>
          <Link to="/admin/orders" className="admin-btn admin-btn-secondary admin-btn-sm">
            <span>View All Orders</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        {ordersError && (
          <div className="m-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
            <AlertCircle size={16} />
            <span>{ordersError}</span>
          </div>
        )}

        <div className="admin-table-scroll">
          <table className="admin-data-table">
            <thead>
              <tr>
                <th>Reference</th>
                <th>Customer</th>
                <th>Total Value</th>
                <th>Fulfilment</th>
                <th>Payment Status</th>
                <th>Order Status</th>
                <th>Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {ordersLoading ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-slate-400 font-medium">
                    Loading verified orders from database...
                  </td>
                </tr>
              ) : recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-slate-400 font-medium">
                    No orders recorded yet.
                  </td>
                </tr>
              ) : (
                recentOrders.map((order) => {
                  const isPending = order.status === "Pending";
                  const isCompleted = ["Delivered", "Completed"].includes(order.status);
                  return (
                    <tr key={order.id}>
                      <td className="font-mono font-bold text-slate-900">
                        {order.referenceNumber}
                      </td>
                      <td>
                        <div className="font-semibold text-slate-900">{order.customer.fullName}</div>
                        <div className="text-xs text-slate-500">{order.customer.phone}</div>
                      </td>
                      <td className="font-semibold text-slate-900">{formatGhs(order.total)}</td>
                      <td>
                        <span className="admin-badge admin-badge-slate">
                          {order.customer.fulfilmentType === "delivery" ? "Delivery" : "Store Pickup"}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`admin-badge ${
                            order.paymentStatus === "Paid"
                              ? "admin-badge-emerald"
                              : "admin-badge-amber"
                          }`}
                        >
                          {order.paymentStatus}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`admin-badge ${
                            isCompleted
                              ? "admin-badge-emerald"
                              : isPending
                              ? "admin-badge-amber"
                              : "admin-badge-slate"
                          }`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="text-xs text-slate-500">
                        {new Date(order.createdAt).toLocaleDateString("en-GH", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>
                      <td>
                        <Link
                          to={`/admin/orders/${order.id}`}
                          className="admin-btn admin-btn-secondary admin-btn-sm"
                        >
                          View Details
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
