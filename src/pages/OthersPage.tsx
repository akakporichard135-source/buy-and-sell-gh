import { ArrowRight, PackageOpen, Search, Sparkles, X } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { isOthersProduct } from "../catalog/catalogueDiscovery";
import { useProductCatalog } from "../catalog/ProductCatalogContext";
import { SEO } from "../components/SEO";
import { StoreProductCard } from "../components/StoreProductCard";
import type { Product } from "../types/product";
import { whatsappUrl } from "../utils/whatsapp";
import "../styles/store.css";

type SortOption = "featured" | "price-asc" | "price-desc";

export function OthersPage() {
  const { activeProducts, loading } = useProductCatalog();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("All");
  const [sortBy, setSortBy] = useState<SortOption>("featured");

  // 1. Filter all published products belonging to Others marketplace
  const othersProducts = useMemo(() => {
    return activeProducts.filter(isOthersProduct);
  }, [activeProducts]);

  // 2. Extract dynamic list of brands present in the Others marketplace
  const availableBrands = useMemo(() => {
    const brandsSet = new Set<string>();
    for (const p of othersProducts) {
      if (p.brand && p.brand.trim()) {
        brandsSet.add(p.brand.trim());
      }
    }
    return ["All", ...Array.from(brandsSet).sort((a, b) => a.localeCompare(b))];
  }, [othersProducts]);

  // 3. Filter by search query and brand
  const filteredProducts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const queryTerms = query.split(/\s+/).filter(Boolean);

    let list = othersProducts.filter((product) => {
      // Brand filter
      if (selectedBrand !== "All" && product.brand?.trim().toLowerCase() !== selectedBrand.toLowerCase()) {
        return false;
      }

      // Search term filter
      if (queryTerms.length > 0) {
        const searchable = [
          product.name,
          product.brand,
          product.model,
          product.category,
          product.subcategory ?? "",
          product.condition,
          ...(product.storage ?? []),
          ...(product.colors ?? []),
          ...(product.tags ?? []),
        ]
          .join(" ")
          .toLowerCase();

        return queryTerms.every((term) => searchable.includes(term));
      }

      return true;
    });

    // 4. Sort results
    return list.sort((a, b) => {
      if (sortBy === "price-asc") {
        return a.price - b.price;
      }
      if (sortBy === "price-desc") {
        return b.price - a.price;
      }
      // Featured / Newest first
      if (Boolean(b.featured) !== Boolean(a.featured)) {
        return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
      }
      if (Boolean(b.newArrival) !== Boolean(a.newArrival)) {
        return (b.newArrival ? 1 : 0) - (a.newArrival ? 1 : 0);
      }
      const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      return timeB - timeA;
    });
  }, [othersProducts, searchQuery, selectedBrand, sortBy]);

  return (
    <div className="others-marketplace-page store-page bg-white min-h-screen text-[#1d1d1f]">
      <SEO
        title="Others — Gaming, Electronics & Tech Marketplace | Buy & Sell GH"
        description="Explore PlayStation consoles, Oraimo electronics, audio gear, smart accessories and gaming products from top brands at Buy & Sell GH in Accra."
      />

      {/* Hero Header — Apple-inspired clean white typography */}
      <header className="store-intro store-section border-b border-black/[0.06] bg-[#fafafa]/50 pt-10 pb-8 sm:pt-14 sm:pb-12">
        <div className="store-container">
          <p className="store-section-eyebrow text-[#d4af37] text-xs font-bold tracking-wider uppercase mb-2">
            Marketplace
          </p>
          <h1 className="text-[clamp(2.4rem,5.5vw,4.2rem)] font-bold tracking-tight text-[#1d1d1f] leading-[1.08] mb-3">
            Others.
          </h1>
          <p className="text-[clamp(1.15rem,2.2vw,1.6rem)] font-normal text-[#6e6e73] leading-snug max-w-3xl mb-4">
            More to discover. More to love.
          </p>
          <p className="text-sm sm:text-base text-[#6e6e73] max-w-2xl leading-relaxed">
            Consoles, audio gear, controllers, smart accessories, and premium tech from leading brands beyond Apple — genuine, guaranteed, and delivered across Ghana.
          </p>

          {/* Dynamic Brand Filter Pills */}
          {availableBrands.length > 2 && (
            <div className="flex flex-wrap items-center gap-2 mt-6 pt-4 border-t border-black/[0.05]">
              <span className="text-xs font-semibold text-[#86868b] mr-1">Brands:</span>
              {availableBrands.map((brandName) => {
                const isActive = selectedBrand === brandName;
                return (
                  <button
                    key={brandName}
                    type="button"
                    onClick={() => setSelectedBrand(brandName)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      isActive
                        ? "bg-[#1d1d1f] text-white shadow-xs"
                        : "bg-white border border-[#d2d2d7] text-[#1d1d1f] hover:bg-[#f5f5f7]"
                    }`}
                  >
                    {brandName}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </header>

      {/* Main Marketplace Grid Section */}
      <main className="store-section py-8 sm:py-12">
        <div className="store-container">
          {/* Marketplace Toolbar (Search & Sort) */}
          <div className="store-toolbar flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-8">
            {/* Search Input */}
            <div className="store-search-box relative flex-1 max-w-md flex items-center bg-[#f5f5f7] border border-transparent focus-within:border-[#1d1d1f]/20 rounded-xl px-3.5 py-2.5 transition-all">
              <Search size={18} className="text-[#86868b] shrink-0 mr-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products, brands, models..."
                className="w-full bg-transparent text-sm text-[#1d1d1f] placeholder-[#86868b] outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="text-[#86868b] hover:text-[#1d1d1f] p-1 ml-1"
                  aria-label="Clear search"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Counts & Sort Selector */}
            <div className="flex items-center justify-between sm:justify-end gap-3">
              <span className="text-xs text-[#86868b] font-medium whitespace-nowrap">
                {filteredProducts.length} {filteredProducts.length === 1 ? "product" : "products"}
              </span>

              <label className="flex items-center gap-2 text-xs font-medium text-[#6e6e73]">
                <span className="hidden sm:inline">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="bg-white border border-[#d2d2d7] text-[#1d1d1f] text-xs font-semibold rounded-lg px-2.5 py-2 outline-none cursor-pointer hover:border-[#86868b] transition-all"
                >
                  <option value="featured">Featured &amp; Newest</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                </select>
              </label>
            </div>
          </div>

          {/* Product Grid or Empty State */}
          {filteredProducts.length > 0 ? (
            <div className="store-catalogue-grid" role="region" aria-label="Others marketplace listings">
              {filteredProducts.map((product) => (
                <StoreProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="py-16 px-4 text-center max-w-lg mx-auto bg-[#fafafa] rounded-3xl border border-black/[0.04]">
              <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-white shadow-xs border border-black/[0.06] flex items-center justify-center text-[#86868b]">
                <PackageOpen size={28} />
              </div>
              <h2 className="text-xl font-bold text-[#1d1d1f] mb-2">
                {othersProducts.length === 0
                  ? "No marketplace listings published yet."
                  : "No products matched your search."}
              </h2>
              <p className="text-sm text-[#6e6e73] mb-6 leading-relaxed">
                {othersProducts.length === 0
                  ? "New gaming consoles, audio gear, and electronics are added regularly. You can also request any specific device directly."
                  : "Try clearing your search terms or filters to browse all available marketplace items."}
              </p>

              <div className="flex flex-wrap items-center justify-center gap-3">
                {(searchQuery || selectedBrand !== "All") && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedBrand("All");
                    }}
                    className="btn-store-card-primary px-4 py-2 text-xs font-semibold"
                  >
                    Reset Filters
                  </button>
                )}
                <Link to="/pre-order" className="btn-store-card-primary px-4 py-2 text-xs font-semibold">
                  Request a Device
                </Link>
                <Link to="/store" className="btn-store-card-secondary px-4 py-2 text-xs font-semibold">
                  Browse Apple Store
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Concierge & Device Request Banner */}
      <section className="store-section border-t border-black/[0.06] bg-[#fbfbfd] py-12">
        <div className="store-container">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 p-8 sm:p-10 rounded-3xl bg-white border border-black/[0.06] shadow-xs">
            <div className="max-w-xl">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#d4af37] uppercase tracking-wider mb-2">
                <Sparkles size={14} /> Buy &amp; Sell GH Sourcing
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#1d1d1f] tracking-tight mb-2">
                Looking for a specific device?
              </h2>
              <p className="text-sm text-[#6e6e73] leading-relaxed">
                Whether you need a custom gaming setup, specialized audio hardware, or non-Apple electronics, our Accra team sources genuine, verified devices with warranty and fast delivery.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <Link
                to="/pre-order"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-[#1d1d1f] text-white text-xs font-semibold hover:bg-black transition-all shadow-xs"
              >
                <span>Request a Device</span>
                <ArrowRight size={14} />
              </Link>
              <a
                href={whatsappUrl("Hello Buy & Sell GH, I am looking for a product in the Others marketplace. Can you help me check availability?")}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-white border border-[#d2d2d7] text-[#1d1d1f] text-xs font-semibold hover:bg-[#f5f5f7] transition-all"
              >
                <span>Chat on WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}