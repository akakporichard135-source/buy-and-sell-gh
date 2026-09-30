import { Filter, MessageCircle, Search, SlidersHorizontal, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { StoreProductCard } from "../components/StoreProductCard";
import { SEO } from "../components/SEO";
import { WhatsAppButton } from "../components/WhatsAppButton";
import { useProductCatalog } from "../catalog/ProductCatalogContext";
import { isAppleCatalogueProduct } from "../catalog/catalogueDiscovery";
import { conditions } from "../catalog/productCatalog";
import {
  categorySupportsStorage,
  getBrandFilterValue,
  getBrandOptions,
  getStorefrontCategory,
  normalizeStorefrontCategory,
  productMatchesStorefrontCategory,
} from "../catalog/storefrontTaxonomy";
import {
  accessoryFamilyOptions,
  airpodsGenerationOptions,
  getAccessoryFamily,
  getAirpodsGeneration,
  getIphoneGeneration,
  getMacbookGeneration,
  getMacbookGenerationOptions,
  iphoneGenerationOptions,
} from "../utils/productPresentation";
import type { Product } from "../types/product";
import { compareProductsNewest, mixProductsDeterministically } from "../utils/shopOrdering";
import { intentWhatsAppUrl } from "../utils/whatsapp";
import { STORE_BATCH_SIZE, storeFilterChoices } from "../utils/storePresentation";
import { StoreHeroIntro } from "../components/store/StoreHeroIntro";
import { StoreProductFamilyStrip } from "../components/store/StoreProductFamilyStrip";
import { StoreLatestCarousel } from "../components/store/StoreLatestCarousel";
import { StoreCategoryCards } from "../components/store/StoreCategoryCards";
import { StoreHelpCards } from "../components/store/StoreHelpCards";
import { StoreAccessoriesCarousel } from "../components/store/StoreAccessoriesCarousel";
import { StoreDifferenceCards } from "../components/store/StoreDifferenceCards";
import "../styles/store.css";

type SortOption = "Recommended" | "Newest" | "Price: Low to High" | "Price: High to Low" | "Popular";

interface FiltersState {
  search: string;
  category: string;
  brand: string;
  model: string;
  generation: string;
  accessoryFamily: string;
  maxPrice: number;
  storage: string;
  condition: string;
  color: string;
  availability: string;
  newArrival: boolean;
  popular: boolean;
}

const maxCataloguePrice = 50000;
const defaultFilters: FiltersState = {
  search: "",
  category: "All",
  brand: "All",
  model: "",
  generation: "All",
  accessoryFamily: "All",
  maxPrice: maxCataloguePrice,
  storage: "All",
  condition: "All",
  color: "",
  availability: "All",
  newArrival: false,
  popular: false,
};

export function ShopPage() {
  const { activeProducts, loading, error, refreshProducts } = useProductCatalog();
  const products = useMemo(() => activeProducts.filter(isAppleCatalogueProduct), [activeProducts]);
  const [params, setParams] = useSearchParams();
  const initialCategory = params.get("category") ?? "All";
  const initialGeneration = params.get("generation") ?? "All";
  const initialCondition = getConditionFromParams(params, initialCategory);

  const [filters, setFilters] = useState<FiltersState>({
    ...defaultFilters,
    category: normalizeStorefrontCategory(initialCategory),
    brand: getBrandFilterValue(params.get("brand")),
    generation: initialGeneration,
    condition: initialCondition,
    newArrival: params.get("newArrival") === "true",
    popular: params.get("popular") === "true",
  });

  const [sort, setSort] = useState<SortOption>("Recommended");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [showDesktopFilters, setShowDesktopFilters] = useState(true);
  const drawerRef = useRef<HTMLDivElement>(null);
  const filterButtonRef = useRef<HTMLButtonElement>(null);
  const [batch, setBatch] = useState({ key: "", count: STORE_BATCH_SIZE });
  const paramsKey = params.toString();

  useEffect(() => {
    const nextCategory = params.get("category") ?? "All";
    setBatch({ key: "", count: STORE_BATCH_SIZE });
    const nextBrand = params.get("brand");
    setFilters((current) => ({
      ...current,
      category: normalizeStorefrontCategory(nextCategory),
      brand: getBrandFilterValue(nextBrand),
      generation: params.get("generation") ?? "All",
      condition: getConditionFromParams(params, nextCategory),
      newArrival: params.get("newArrival") === "true",
      popular: params.get("popular") === "true",
    }));
  }, [paramsKey]);

  useEffect(() => {
    if (!drawerOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setDrawerOpen(false);
      if (event.key === "Tab") {
        const controls = Array.from(
          drawerRef.current?.querySelectorAll<HTMLElement>("button, input, select, a[href]") ?? [],
        ).filter((element) => element.getClientRects().length);
        const first = controls[0];
        const last = controls[controls.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", onKeyDown);
      filterButtonRef.current?.focus();
    };
  }, [drawerOpen]);

  const activeFilters = useMemo(() => getActiveFilters(filters), [filters]);
  const activeFilterCount = activeFilters.length;
  const brandOptions = useMemo(() => getBrandOptions(products, filters.brand), [filters.brand, products]);

  const dynamicIphoneGenerationOptions = useMemo(() => {
    const options = Array.from(
      new Set(
        products
          .filter((product) => product.brand === "Apple" && product.category === "iPhones")
          .map(getIphoneGeneration)
          .filter(Boolean),
      ),
    ).sort(compareGenerationLabelsNewest);
    return options.length ? options : iphoneGenerationOptions;
  }, [products]);

  const dynamicMacbookGenerationOptions = useMemo(() => getMacbookGenerationOptions(products), [products]);

  const inventoryChoices = useMemo(
    () => ({
      categories: storeFilterChoices(products.map(getStorefrontCategory), filters.category),
      storage: storeFilterChoices(
        products
          .filter((product) => matchesShopCategory(product, filters.category))
          .flatMap((product) => product.storage),
        filters.storage,
      ),
      conditions: storeFilterChoices(products.map((product) => product.condition), filters.condition),
      availability: storeFilterChoices(products.map((product) => product.stockStatus), filters.availability),
    }),
    [products, filters.category, filters.storage, filters.condition, filters.availability],
  );

  const filtered = useMemo(() => {
    const terms = filters.search.trim().toLowerCase().split(/\s+/).filter(Boolean);
    const list = products
      .filter((product) => {
        if (!terms.length) return true;
        const searchable = [
          product.name,
          product.model,
          product.generation ?? "",
          product.category,
          product.subcategory ?? "",
          product.brand,
          product.condition,
          product.stockStatus,
          ...product.storage,
          ...product.colors,
          ...(product.tags ?? []),
          ...(product.badges ?? []),
        ]
          .join(" ")
          .toLowerCase();
        return terms.every((term) => searchable.includes(term));
      })
      .filter((product) => filters.brand === "All" || product.brand === filters.brand)
      .filter((product) => product.model.toLowerCase().includes(filters.model.toLowerCase()))
      .filter((product) => {
        if (filters.generation === "All") return true;
        if (filters.category === "Laptops") return getMacbookGeneration(product) === filters.generation;
        if (filters.category === "Audio") return getAirpodsGeneration(product) === filters.generation;
        if (filters.category === "Phones") return getIphoneGeneration(product) === filters.generation;
        return true;
      })
      .filter(
        (product) =>
          filters.category !== "Accessories" ||
          filters.accessoryFamily === "All" ||
          getAccessoryFamily(product) === filters.accessoryFamily,
      )
      .filter((product) => product.colors.join(" ").toLowerCase().includes(filters.color.toLowerCase()))
      .filter((product) => matchesShopCategory(product, filters.category))
      .filter((product) => filters.condition === "All" || product.condition === filters.condition)
      .filter((product) => filters.storage === "All" || product.storage.includes(filters.storage))
      .filter((product) => filters.availability === "All" || product.stockStatus === filters.availability)
      .filter((product) => product.price <= filters.maxPrice)
      .filter((product) => !filters.newArrival || product.newArrival || product.isNewArrival)
      .filter((product) => !filters.popular || product.popular || product.isPopular);

    if (sort === "Recommended") return mixProductsDeterministically(list);

    return [...list].sort((a, b) => {
      const aPriceOnRequest = a.priceOnRequest || a.price <= 0;
      const bPriceOnRequest = b.priceOnRequest || b.price <= 0;
      if ((sort === "Price: Low to High" || sort === "Price: High to Low") && aPriceOnRequest !== bPriceOnRequest) {
        return aPriceOnRequest ? 1 : -1;
      }
      if (sort === "Price: Low to High") return a.price - b.price;
      if (sort === "Price: High to Low") return b.price - a.price;
      if (sort === "Popular") {
        const popularScore = Number(Boolean(b.popular || b.isPopular)) - Number(Boolean(a.popular || a.isPopular));
        if (popularScore !== 0) return popularScore;
      }
      return compareProductsNewest(a, b);
    });
  }, [filters, products, sort]);

  const resultKey = JSON.stringify([filters, sort]);
  const visibleCount = batch.key === resultKey ? batch.count : STORE_BATCH_SIZE;
  const visibleProducts = filtered.slice(0, visibleCount);

  const updateFilter = <K extends keyof FiltersState>(key: K, value: FiltersState[K]) => {
    setBatch({ key: "", count: STORE_BATCH_SIZE });
    setFilters((current) => ({ ...current, [key]: value }));
  };

  const clearFilters = () => {
    setBatch({ key: "", count: STORE_BATCH_SIZE });
    setFilters(defaultFilters);
  };

  const removeFilter = (key: keyof FiltersState) => {
    setBatch({ key: "", count: STORE_BATCH_SIZE });
    setFilters((current) => ({ ...current, [key]: defaultFilters[key] }));
  };

  return (
    <div className="store-page">
      <SEO
        title="Store - Buy & Sell GH | The Best Way to Buy the Products You Love"
        description="Shop confirmed iPhones, MacBooks, iPads, Apple Watches, AirPods and original accessories from Buy & Sell GH in Accra. Fast delivery and pickup available."
      />

      {/* 1. Bright Apple-Style Store Introduction */}
      <StoreHeroIntro />

      {/* 2. Horizontal Product-Family Strip */}
      <StoreProductFamilyStrip
        activeCategory={filters.category}
        onSelectCategory={(category) => {
          updateFilter("category", category);
          updateFilter("generation", "All");
          updateFilter("accessoryFamily", "All");
          updateFilter("storage", "All");
        }}
      />

      {/* 3. The Latest Cinematic Carousel */}
      <StoreLatestCarousel />

      {/* 4. Shop by Category Horizontal Cards */}
      <StoreCategoryCards
        onSelectCategory={(categoryKey) => {
          updateFilter("category", categoryKey);
          updateFilter("generation", "All");
          updateFilter("accessoryFamily", "All");
          updateFilter("storage", "All");
        }}
      />

      {/* 5. Help Is Here Personal Shopping Section */}
      <StoreHelpCards />

      {/* 6. Accessories Horizontal Carousel */}
      <StoreAccessoriesCarousel products={products} />

      {/* 7. The Buy & Sell GH Difference */}
      <StoreDifferenceCards />

      {/* 8. Real Store Inventory — All Products */}
      <section id="all-products" className="store-section store-inventory-section" aria-labelledby="store-inventory-title">
        <div className="store-container">
          <div className="store-inventory-header">
            <div>
              <p className="store-section-eyebrow">ALL PRODUCTS</p>
              <h2 id="store-inventory-title" className="store-section-title">
                Shop Buy &amp; Sell GH.
              </h2>
              <p className="store-section-subtitle">
                Explore confirmed devices with authentic pricing, condition reports, and immediate Accra availability.
              </p>
            </div>
          </div>

          {/* Premium Search and Toolbar (Full Width across catalog) */}
          <div className="store-toolbar">
            <div className="store-search-wrap">
              <Search size={18} className="store-search-icon" aria-hidden="true" />
              <input
                type="search"
                aria-label="Search Buy & Sell GH Store"
                value={filters.search}
                maxLength={100}
                onChange={(e) => updateFilter("search", e.target.value)}
                placeholder="Search Buy & Sell GH Store"
                className="store-search-input"
              />
              {filters.search && (
                <button
                  type="button"
                  aria-label="Clear search text"
                  onClick={() => updateFilter("search", "")}
                  className="store-search-clear"
                >
                  <X size={17} />
                </button>
              )}
            </div>

            <div className="store-toolbar-actions">
              <button
                ref={filterButtonRef}
                className="btn-store-toolbar-filter store-filter-mobile-btn"
                type="button"
                aria-haspopup="dialog"
                aria-expanded={drawerOpen}
                onClick={() => setDrawerOpen(true)}
              >
                <Filter size={16} /> Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
              </button>

              <button
                className="btn-store-toolbar-filter store-filter-desktop-btn"
                type="button"
                onClick={() => setShowDesktopFilters((prev) => !prev)}
                title={showDesktopFilters ? "Hide filter panel" : "Show filter panel"}
              >
                <SlidersHorizontal size={16} /> {showDesktopFilters ? "Hide Filters" : "Filters"}
              </button>

              <label className="store-sort-label">
                <span className="sr-only">Sort products</span>
                <select
                  value={sort}
                  onChange={(e) => {
                    setBatch({ key: "", count: STORE_BATCH_SIZE });
                    setSort(e.target.value as SortOption);
                  }}
                  className="store-sort-select"
                  aria-label="Sort products by"
                >
                  <option>Recommended</option>
                  <option>Newest</option>
                  <option>Price: Low to High</option>
                  <option>Price: High to Low</option>
                  <option>Popular</option>
                </select>
              </label>
            </div>
          </div>

          {/* Status and Active Filter Chips */}
          <div className="store-status-row">
            <p className="store-inventory-count" role="status">
              {loading
                ? "Loading products..."
                : `${filtered.length} ${filtered.length === 1 ? "product" : "products"}`}
            </p>
            <ActiveFilterChips
              filters={activeFilters}
              removeFilter={removeFilter}
              clearFilters={clearFilters}
            />
          </div>

          {/* Catalog Layout: Filter Sidebar (Left) + Product Results Grid (Right) */}
          <div className={`store-catalog-layout catalog-layout${showDesktopFilters ? " has-sidebar" : " no-sidebar"}`}>
            {/* Desktop Filters Sidebar */}
            {showDesktopFilters && (
              <aside className="store-filter-sidebar hidden lg:block" aria-label="Desktop product filters">
                <FilterControls
                  filters={filters}
                  updateFilter={updateFilter}
                  clearFilters={clearFilters}
                  activeFilterCount={activeFilterCount}
                  brandOptions={brandOptions}
                  iphoneGenerationChoices={dynamicIphoneGenerationOptions}
                  macbookGenerationChoices={dynamicMacbookGenerationOptions}
                  inventoryChoices={inventoryChoices}
                />
              </aside>
            )}

            <div className="store-product-results">
              {/* Product Grid Render */}
              {loading ? (
                <div className="store-state-box">
                  <p className="font-semibold text-ink/70">Loading confirmed store products...</p>
                </div>
              ) : error ? (
                <div className="store-state-box">
                  <p className="font-semibold text-ink">Catalogue is temporarily unavailable.</p>
                  <button className="btn-store-primary mt-4" type="button" onClick={() => void refreshProducts()}>
                    Retry
                  </button>
                </div>
              ) : filtered.length > 0 ? (
                <>
                  <div className="store-catalogue-grid" id="store-products">
                    {visibleProducts.map((product) => (
                      <StoreProductCard key={product.id} product={product} />
                    ))}
                  </div>

                  {filtered.length > STORE_BATCH_SIZE && (
                    <div className="store-load-more">
                      <p role="status">
                        Showing {visibleProducts.length} of {filtered.length} products
                      </p>
                      <button
                        className="btn-store-secondary"
                        type="button"
                        aria-controls="store-products"
                        disabled={visibleProducts.length === filtered.length}
                        onClick={() =>
                          setBatch({ key: resultKey, count: visibleCount + STORE_BATCH_SIZE })
                        }
                      >
                        {visibleProducts.length === filtered.length ? "All products shown" : "Load more products"}
                      </button>
                    </div>
                  )}

                  {filtered.length <= 3 && <ShortResultsCta />}
                </>
              ) : (
                <NoResultsState clearFilters={clearFilters} />
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Mobile Filter Drawer */}
      {drawerOpen && (
        <div className="store-filter-drawer" role="dialog" aria-modal="true" aria-label="Product filters">
          <button
            className="store-filter-drawer-backdrop"
            type="button"
            aria-label="Close filters"
            onClick={() => setDrawerOpen(false)}
          />
          <div className="store-filter-drawer-panel" ref={drawerRef}>
            <div className="store-filter-drawer-header">
              <div>
                <p className="text-lg font-bold text-ink">Filters</p>
                <p className="text-xs text-ink/60">{activeFilterCount} active</p>
              </div>
              <button
                autoFocus
                className="store-drawer-close-btn"
                type="button"
                aria-label="Close filters"
                onClick={() => setDrawerOpen(false)}
              >
                <X size={20} />
              </button>
            </div>
            <div className="store-filter-drawer-body">
              <FilterControls
                filters={filters}
                updateFilter={updateFilter}
                clearFilters={clearFilters}
                activeFilterCount={activeFilterCount}
                brandOptions={brandOptions}
                iphoneGenerationChoices={dynamicIphoneGenerationOptions}
                macbookGenerationChoices={dynamicMacbookGenerationOptions}
                inventoryChoices={inventoryChoices}
              />
            </div>
            <div className="store-filter-drawer-footer">
              <button className="btn-store-primary w-full" type="button" onClick={() => setDrawerOpen(false)}>
                Show {filtered.length} Products
              </button>
              {activeFilterCount > 0 && (
                <button className="btn-store-secondary w-full" type="button" onClick={clearFilters}>
                  Clear All
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function FilterControls({
  filters,
  updateFilter,
  clearFilters,
  activeFilterCount,
  brandOptions,
  iphoneGenerationChoices,
  macbookGenerationChoices,
  inventoryChoices,
}: {
  filters: FiltersState;
  updateFilter: <K extends keyof FiltersState>(key: K, value: FiltersState[K]) => void;
  clearFilters: () => void;
  activeFilterCount: number;
  brandOptions: string[];
  iphoneGenerationChoices: string[];
  macbookGenerationChoices: string[];
  inventoryChoices: { categories: string[]; storage: string[]; conditions: string[]; availability: string[] };
}) {
  return (
    <div className="store-filter-controls">
      <div className="store-filter-title-row">
        <span className="store-filter-title">Filters</span>
        {activeFilterCount > 0 && (
          <button type="button" className="store-filter-clear-link" onClick={clearFilters}>
            Clear all
          </button>
        )}
      </div>

      <div className="store-filter-section">
        <label className="store-filter-label">
          Category
          <select
            value={filters.category}
            onChange={(e) => {
              updateFilter("category", e.target.value);
              updateFilter("generation", "All");
              updateFilter("accessoryFamily", "All");
              updateFilter("storage", "All");
            }}
            className="store-filter-select"
          >
            <option>All</option>
            {inventoryChoices.categories.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>

        <label className="store-filter-label">
          Brand
          <select
            value={filters.brand}
            onChange={(e) => {
              updateFilter("brand", e.target.value);
              updateFilter("generation", "All");
            }}
            className="store-filter-select"
          >
            <option>All</option>
            {brandOptions.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>

        {filters.category !== "Accessories" && (
          <label className="store-filter-label">
            Model
            <input
              value={filters.model}
              maxLength={100}
              placeholder="e.g. Pro Max, Air..."
              onChange={(e) => updateFilter("model", e.target.value)}
              className="store-filter-input"
            />
          </label>
        )}

        {filters.category === "Phones" && (filters.brand === "All" || filters.brand === "Apple") && (
          <label className="store-filter-label">
            iPhone Generation
            <select
              value={filters.generation}
              onChange={(e) => updateFilter("generation", e.target.value)}
              className="store-filter-select"
            >
              <option>All</option>
              {iphoneGenerationChoices.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>
        )}

        {filters.category === "Laptops" && (filters.brand === "All" || filters.brand === "Apple") && (
          <label className="store-filter-label">
            Apple Chip
            <select
              value={filters.generation}
              onChange={(e) => updateFilter("generation", e.target.value)}
              className="store-filter-select"
            >
              <option>All</option>
              {macbookGenerationChoices.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>
        )}

        {filters.category === "Audio" && (filters.brand === "All" || filters.brand === "Apple") && (
          <label className="store-filter-label">
            Model / Generation
            <select
              value={filters.generation}
              onChange={(e) => updateFilter("generation", e.target.value)}
              className="store-filter-select"
            >
              <option>All</option>
              {airpodsGenerationOptions.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>
        )}

        {filters.category === "Accessories" && (
          <label className="store-filter-label">
            Accessory Family
            <select
              value={filters.accessoryFamily}
              onChange={(e) => updateFilter("accessoryFamily", e.target.value)}
              className="store-filter-select"
            >
              <option value="All">All Accessories</option>
              {accessoryFamilyOptions.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>
        )}
      </div>

      <div className="store-filter-section">
        <label className="store-filter-label">
          Price: up to GHS {filters.maxPrice.toLocaleString()}
          <input
            type="range"
            min="2000"
            max={maxCataloguePrice}
            step="500"
            value={filters.maxPrice}
            onChange={(e) => updateFilter("maxPrice", Number(e.target.value))}
            className="store-range-slider"
          />
        </label>

        <label className="store-filter-label">
          Condition
          <select
            value={filters.condition}
            onChange={(e) => updateFilter("condition", e.target.value)}
            className="store-filter-select"
          >
            <option>All</option>
            {inventoryChoices.conditions.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>

        <label className="store-filter-label">
          Availability
          <select
            value={filters.availability}
            onChange={(e) => updateFilter("availability", e.target.value)}
            className="store-filter-select"
          >
            <option>All</option>
            {inventoryChoices.availability.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>
      </div>

      {categorySupportsStorage(filters.category) && (
        <div className="store-filter-section">
          <label className="store-filter-label">
            Storage
            <select
              value={filters.storage}
              onChange={(e) => updateFilter("storage", e.target.value)}
              className="store-filter-select"
            >
              <option>All</option>
              {inventoryChoices.storage.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>

          <label className="store-filter-label">
            Colour
            <input
              value={filters.color}
              maxLength={80}
              placeholder="e.g. Natural Titanium, Midnight..."
              onChange={(e) => updateFilter("color", e.target.value)}
              className="store-filter-input"
            />
          </label>
        </div>
      )}

      <div className="store-filter-checks">
        <FilterCheck
          label="New Arrivals"
          checked={filters.newArrival}
          onChange={(checked) => updateFilter("newArrival", checked)}
        />
        <FilterCheck
          label="Popular Choices"
          checked={filters.popular}
          onChange={(checked) => updateFilter("popular", checked)}
        />
      </div>
    </div>
  );
}

function FilterCheck({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="store-filter-checkbox-label">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="store-checkbox"
      />
      <span>{label}</span>
    </label>
  );
}

function ActiveFilterChips({
  filters,
  removeFilter,
  clearFilters,
}: {
  filters: ActiveFilter[];
  removeFilter: (key: keyof FiltersState) => void;
  clearFilters: () => void;
}) {
  if (!filters.length) return null;
  return (
    <div className="store-active-chips" aria-label="Active filters">
      {filters.map((filter) => (
        <button
          key={filter.key}
          type="button"
          onClick={() => removeFilter(filter.key)}
          className="store-chip"
        >
          <span>{filter.label}</span>
          <X size={13} aria-hidden="true" />
        </button>
      ))}
      <button className="store-chip-clear" type="button" onClick={clearFilters}>
        Clear all
      </button>
    </div>
  );
}

function ShortResultsCta() {
  return (
    <div className="store-custom-request-card">
      <div className="store-custom-request-copy">
        <p className="store-section-eyebrow">CUSTOM REQUESTS</p>
        <h3 className="store-custom-request-title">Looking for a specific device?</h3>
        <p className="store-custom-request-desc">
          Tell us the exact model, storage capacity, and preferred colour you want. Our sourcing team in Accra
          confirms incoming stock daily.
        </p>
      </div>
      <div className="store-custom-request-actions">
        <Link className="btn-store-primary" to="/pre-order">
          Pre-Order a Device
        </Link>
        <WhatsAppButton className="btn-store-secondary">
          <MessageCircle size={16} /> Chat on WhatsApp
        </WhatsAppButton>
      </div>
    </div>
  );
}

function NoResultsState({ clearFilters }: { clearFilters: () => void }) {
  return (
    <div className="store-empty-card">
      <div className="store-empty-icon-wrap" aria-hidden="true">
        <Search size={32} />
      </div>
      <h3 className="store-empty-title">No products match your current filters.</h3>
      <p className="store-empty-desc">
        Try adjusting your search terms or clearing specific filters to view more confirmed inventory.
      </p>
      <div className="store-empty-actions">
        <button className="btn-store-primary" type="button" onClick={clearFilters}>
          Clear All Filters
        </button>
        <Link className="btn-store-secondary" to="/pre-order">
          Pre-Order Device
        </Link>
        <a
          className="btn-store-ghost"
          href={intentWhatsAppUrl("request")}
          target="_blank"
          rel="noopener noreferrer"
        >
          <MessageCircle size={16} /> WhatsApp Us
        </a>
      </div>
    </div>
  );
}

interface ActiveFilter {
  key: keyof FiltersState;
  label: string;
}

function getActiveFilters(filters: FiltersState): ActiveFilter[] {
  const active: ActiveFilter[] = [];
  if (filters.search) active.push({ key: "search", label: `Search: ${filters.search}` });
  if (filters.category !== "All") active.push({ key: "category", label: filters.category });
  if (filters.brand !== "All") active.push({ key: "brand", label: filters.brand });
  if (filters.model) active.push({ key: "model", label: `Model: ${filters.model}` });
  if (filters.generation !== "All") active.push({ key: "generation", label: filters.generation });
  if (filters.accessoryFamily !== "All") active.push({ key: "accessoryFamily", label: filters.accessoryFamily });
  if (filters.maxPrice !== defaultFilters.maxPrice) {
    active.push({ key: "maxPrice", label: `Up to GHS ${filters.maxPrice.toLocaleString()}` });
  }
  if (filters.condition !== "All") active.push({ key: "condition", label: filters.condition });
  if (filters.storage !== "All") active.push({ key: "storage", label: filters.storage });
  if (filters.color) active.push({ key: "color", label: `Colour: ${filters.color}` });
  if (filters.availability !== "All") active.push({ key: "availability", label: filters.availability });
  if (filters.newArrival) active.push({ key: "newArrival", label: "New Arrivals" });
  if (filters.popular) active.push({ key: "popular", label: "Popular Choices" });
  return active;
}

function getConditionFromParams(params: URLSearchParams, category: string) {
  const explicitCondition = params.get("condition");
  if (conditions.includes(explicitCondition as Product["condition"])) return explicitCondition!;
  if (category === "UK Used Devices") return "UK Used";
  if (category === "Brand New Devices") return "Brand New";
  return "All";
}

function matchesShopCategory(product: Product, category: string) {
  return productMatchesStorefrontCategory(product, category);
}

function compareGenerationLabelsNewest(a: string, b: string) {
  return generationNumberFromLabel(b) - generationNumberFromLabel(a);
}

function generationNumberFromLabel(label: string) {
  return Number(label.match(/\d+/)?.[0] ?? 0);
}
