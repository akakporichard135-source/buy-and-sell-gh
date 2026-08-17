import { Filter, MessageCircle, Search, SlidersHorizontal, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ProductGrid } from "../components/ProductGrid";
import { SEO } from "../components/SEO";
import { WhatsAppButton } from "../components/WhatsAppButton";
import { useProductCatalog } from "../catalog/ProductCatalogContext";
import { categories, conditions, stockStatuses } from "../catalog/productCatalog";
import {
  accessoryFamilyOptions,
  airpodsGenerationOptions,
  categorySlugs,
  getAccessoryFamily,
  getAirpodsGeneration,
  getIphoneGeneration,
  getMacbookGeneration,
  iphoneGenerationOptions,
  macbookGenerationOptions,
  productMatchesCategorySlug,
} from "../utils/productPresentation";
import type { Product, ProductCategory } from "../types/product";
import { compareProductsNewest, mixProductsDeterministically } from "../utils/shopOrdering";
import { intentWhatsAppUrl } from "../utils/whatsapp";

type SortOption = "Recommended" | "Newest" | "Price: Low to High" | "Price: High to Low" | "Popular";

interface FiltersState {
  search: string;
  category: string;
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

const storageOptions = ["64GB", "128GB", "256GB", "512GB", "1TB", "2TB", "4TB", "8TB", "GPS", "GPS + Cellular", "USB-C Case"];
const deviceCategories = categories.filter((category) => category !== "UK Used Devices" && category !== "Brand New Devices");

export function ShopPage() {
  const { activeProducts: products, loading, error, refreshProducts } = useProductCatalog();
  const [params] = useSearchParams();
  const initialCategory = params.get("category") ?? "All";
  const [filters, setFilters] = useState<FiltersState>({
    ...defaultFilters,
    category: deviceCategories.includes(initialCategory as (typeof deviceCategories)[number]) ? initialCategory : "All",
    condition: initialCategory === "UK Used Devices" ? "UK Used" : initialCategory === "Brand New Devices" ? "Brand New" : "All",
    newArrival: params.get("newArrival") === "true",
    popular: params.get("popular") === "true",
  });
  const [sort, setSort] = useState<SortOption>("Recommended");
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    if (!drawerOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setDrawerOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [drawerOpen]);

  const activeFilters = useMemo(() => getActiveFilters(filters), [filters]);
  const activeFilterCount = activeFilters.length;

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
          product.condition,
          product.stockStatus,
          ...product.storage,
          ...product.colors,
          ...(product.tags ?? []),
          ...(product.badges ?? []),
        ].join(" ").toLowerCase();
        return terms.every((term) => searchable.includes(term));
      })
      .filter((product) => product.model.toLowerCase().includes(filters.model.toLowerCase()))
      .filter((product) => {
        if (filters.generation === "All") return true;
        if (filters.category === "MacBooks") return getMacbookGeneration(product) === filters.generation;
        if (filters.category === "AirPods") return getAirpodsGeneration(product) === filters.generation;
        if (filters.category === "iPhones") return getIphoneGeneration(product) === filters.generation;
        return true;
      })
      .filter((product) => filters.category !== "Accessories" || filters.accessoryFamily === "All" || getAccessoryFamily(product) === filters.accessoryFamily)
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
      if ((sort === "Price: Low to High" || sort === "Price: High to Low") && aPriceOnRequest !== bPriceOnRequest) return aPriceOnRequest ? 1 : -1;
      if (sort === "Price: Low to High") return a.price - b.price;
      if (sort === "Price: High to Low") return b.price - a.price;
      if (sort === "Popular") {
        const popularScore = Number(Boolean(b.popular || b.isPopular)) - Number(Boolean(a.popular || a.isPopular));
        if (popularScore !== 0) return popularScore;
      }
      return compareProductsNewest(a, b);
    });
  }, [filters, products, sort]);

  const updateFilter = <K extends keyof FiltersState>(key: K, value: FiltersState[K]) => {
    setFilters((current) => ({ ...current, [key]: value }));
  };

  const clearFilters = () => setFilters(defaultFilters);
  const removeFilter = (key: keyof FiltersState) => {
    setFilters((current) => ({ ...current, [key]: defaultFilters[key] }));
  };

  return (
    <>
      <SEO title="Shop Apple Devices in Ghana" description="Browse original iPhones, iPads, MacBooks, Apple Watches, AirPods and accessories from Buy & Sell GH in Accra." />
      <section className="page-hero shop-hero">
        <p className="eyebrow-dark">Shop</p>
        <h1>Original devices catalogue</h1>
        <p>Search, filter and compare available Apple devices. Buy & Sell GH confirms availability, final details and payment instructions before payment.</p>
        <div className="shop-trust-line">Inspected devices | Clear condition labels | WhatsApp support</div>
      </section>
      <section className="section shop-section">
        <div className="shop-layout">
          <aside className="filter-panel hidden lg:block">
            <FilterControls filters={filters} updateFilter={updateFilter} clearFilters={clearFilters} activeFilterCount={activeFilterCount} />
          </aside>
          <div className="shop-results">
            <div className="catalogue-toolbar">
              <p className="catalogue-count">{filtered.length} {filtered.length === 1 ? "product" : "products"}</p>
              <label className="search-inline catalogue-search">
                <Search size={18} />
                <input value={filters.search} onChange={(e) => updateFilter("search", e.target.value)} placeholder="Search iPhone 15, 256GB, Black..." />
                {filters.search && <button type="button" aria-label="Clear search" onClick={() => updateFilter("search", "")}><X size={18} /></button>}
              </label>
              <button className="btn-secondary catalogue-filter-button lg:hidden" type="button" onClick={() => setDrawerOpen(true)}>
                <Filter size={17} /> Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
              </button>
              <label className="catalogue-sort">Sort
                <select value={sort} onChange={(e) => setSort(e.target.value as SortOption)}>
                  <option>Recommended</option>
                  <option>Newest</option>
                  <option>Price: Low to High</option>
                  <option>Price: High to Low</option>
                  <option>Popular</option>
                </select>
              </label>
            </div>
            <ActiveFilterChips filters={activeFilters} removeFilter={removeFilter} clearFilters={clearFilters} />
            {loading ? (
              <div className="rounded-lg border border-black/7 bg-white p-8 text-center font-black text-ink/70">Loading products...</div>
            ) : error ? (
              <div className="rounded-lg border border-black/7 bg-white p-8 text-center">
                <p className="font-black text-ink">Catalogue is temporarily unavailable.</p>
                <button className="btn-secondary mt-4" type="button" onClick={() => void refreshProducts()}>Retry</button>
              </div>
            ) : filtered.length > 0 ? (
              <>
                <ProductGrid products={filtered} />
                {filtered.length <= 3 && <ShortResultsCta />}
              </>
            ) : (
              <NoResultsState clearFilters={clearFilters} />
            )}
          </div>
        </div>
      </section>
      {drawerOpen && (
        <div className="filter-drawer" role="dialog" aria-modal="true" aria-label="Product filters">
          <button className="filter-drawer-backdrop" type="button" aria-label="Close filters" onClick={() => setDrawerOpen(false)} />
          <div className="filter-drawer-panel">
            <div className="filter-drawer-header">
              <div>
                <p className="text-lg font-black text-ink">Filters</p>
                <p className="text-sm font-bold text-ink/60">{activeFilterCount} active</p>
              </div>
              <button autoFocus className="icon-button shrink-0" type="button" aria-label="Close filters" onClick={() => setDrawerOpen(false)}><X size={20} /></button>
            </div>
            <FilterControls filters={filters} updateFilter={updateFilter} clearFilters={clearFilters} activeFilterCount={activeFilterCount} />
            <div className="filter-drawer-actions">
              <button className="btn-primary" type="button" onClick={() => setDrawerOpen(false)}>Show {filtered.length} Products</button>
              <button className="btn-secondary" type="button" onClick={clearFilters}>Clear All</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function FilterControls({
  filters,
  updateFilter,
  clearFilters,
  activeFilterCount,
}: {
  filters: FiltersState;
  updateFilter: <K extends keyof FiltersState>(key: K, value: FiltersState[K]) => void;
  clearFilters: () => void;
  activeFilterCount: number;
}) {
  return (
    <div className="filter-controls">
      <div className="filter-panel-header">
        <span className="flex items-center gap-2"><SlidersHorizontal size={19} /> Filters</span>
        {activeFilterCount > 0 && <button type="button" onClick={clearFilters}>Clear All</button>}
      </div>
      <div className="filter-group">
        <label className="filter-label">Search<input value={filters.search} onChange={(e) => updateFilter("search", e.target.value)} placeholder="iPhone 15, AirPods..." /></label>
        <label className="filter-label">Category<select value={filters.category} onChange={(e) => {
          updateFilter("category", e.target.value);
          updateFilter("generation", "All");
          updateFilter("accessoryFamily", "All");
        }}><option>All</option>{deviceCategories.map((item) => <option key={item}>{item}</option>)}</select></label>
        {filters.category !== "Accessories" && <label className="filter-label">Model<input value={filters.model} placeholder="Type model" onChange={(e) => updateFilter("model", e.target.value)} /></label>}
        {filters.category === "iPhones" && <label className="filter-label">iPhone generation<select value={filters.generation} onChange={(e) => updateFilter("generation", e.target.value)}><option>All</option>{iphoneGenerationOptions.map((item) => <option key={item}>{item}</option>)}</select></label>}
        {filters.category === "MacBooks" && <label className="filter-label">Chip / Generation<select value={filters.generation} onChange={(e) => updateFilter("generation", e.target.value)}><option>All</option>{macbookGenerationOptions.map((item) => <option key={item}>{item}</option>)}</select></label>}
        {filters.category === "AirPods" && <label className="filter-label">Model / Generation<select value={filters.generation} onChange={(e) => updateFilter("generation", e.target.value)}><option>All</option>{airpodsGenerationOptions.map((item) => <option key={item}>{item}</option>)}</select></label>}
        {filters.category === "Accessories" && <label className="filter-label">Accessory Family<select value={filters.accessoryFamily} onChange={(e) => updateFilter("accessoryFamily", e.target.value)}><option value="All">All Accessories</option>{accessoryFamilyOptions.map((item) => <option key={item}>{item}</option>)}</select></label>}
      </div>
      <div className="filter-group">
        <label className="filter-label">Price: up to GHS {filters.maxPrice.toLocaleString()}<input type="range" min="2000" max={maxCataloguePrice} step="500" value={filters.maxPrice} onChange={(e) => updateFilter("maxPrice", Number(e.target.value))} /></label>
        <label className="filter-label">Condition<select value={filters.condition} onChange={(e) => updateFilter("condition", e.target.value)}><option>All</option>{conditions.map((item) => <option key={item}>{item}</option>)}</select></label>
        <label className="filter-label">Stock<select value={filters.availability} onChange={(e) => updateFilter("availability", e.target.value)}><option>All</option>{stockStatuses.map((item) => <option key={item}>{item}</option>)}</select></label>
      </div>
      {filters.category !== "Accessories" && <div className="filter-group">
        <label className="filter-label">Storage<select value={filters.storage} onChange={(e) => updateFilter("storage", e.target.value)}><option>All</option>{storageOptions.map((item) => <option key={item}>{item}</option>)}</select></label>
        <label className="filter-label">Colour<input value={filters.color} placeholder="Gold, Black, Blue..." onChange={(e) => updateFilter("color", e.target.value)} /></label>
      </div>}
      <div className="filter-group filter-check-grid">
        <FilterCheck label="New Arrivals" checked={filters.newArrival} onChange={(checked) => updateFilter("newArrival", checked)} />
        <FilterCheck label="Popular Choices" checked={filters.popular} onChange={(checked) => updateFilter("popular", checked)} />
      </div>
    </div>
  );
}

function FilterCheck({ label, checked, onChange }: { label: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <label className="filter-check">
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />
      {label}
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
    <div className="active-filter-row" aria-label="Active filters">
      {filters.map((filter) => (
        <button key={filter.key} type="button" onClick={() => removeFilter(filter.key)}>
          {filter.label} <X size={14} />
        </button>
      ))}
      <button className="clear-filter-chip" type="button" onClick={clearFilters}>Clear all</button>
    </div>
  );
}

function ShortResultsCta() {
  return (
    <section className="catalogue-continuation">
      <div>
        <p className="eyebrow-dark">Need something specific?</p>
        <h2>Can't find the device you want?</h2>
        <p>Send the model, storage, colour and budget you want. Availability can change quickly.</p>
      </div>
      <div className="catalogue-continuation-actions">
        <Link className="btn-primary" to="/pre-order">Pre-Order a Device</Link>
        <WhatsAppButton className="catalogue-whatsapp">Chat on WhatsApp</WhatsAppButton>
      </div>
    </section>
  );
}

function NoResultsState({ clearFilters }: { clearFilters: () => void }) {
  return (
    <section className="catalogue-empty-state">
      <Search size={28} />
      <h2>No devices match these filters.</h2>
      <p>Try removing a filter or pre-order an Apple device that is not currently available.</p>
      <div>
        <button className="btn-secondary" type="button" onClick={clearFilters}>Clear Filters</button>
        <Link className="btn-primary" to="/pre-order">Pre-Order a Device</Link>
        <a className="btn-ghost" href={intentWhatsAppUrl("request")} target="_blank" rel="noreferrer"><MessageCircle size={17} /> WhatsApp</a>
      </div>
    </section>
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
  if (filters.model) active.push({ key: "model", label: `Model: ${filters.model}` });
  if (filters.generation !== "All") active.push({ key: "generation", label: filters.generation });
  if (filters.accessoryFamily !== "All") active.push({ key: "accessoryFamily", label: filters.accessoryFamily });
  if (filters.maxPrice !== defaultFilters.maxPrice) active.push({ key: "maxPrice", label: `Up to GHS ${filters.maxPrice.toLocaleString()}` });
  if (filters.condition !== "All") active.push({ key: "condition", label: filters.condition });
  if (filters.storage !== "All") active.push({ key: "storage", label: filters.storage });
  if (filters.color) active.push({ key: "color", label: `Colour: ${filters.color}` });
  if (filters.availability !== "All") active.push({ key: "availability", label: filters.availability });
  if (filters.newArrival) active.push({ key: "newArrival", label: "New Arrivals" });
  if (filters.popular) active.push({ key: "popular", label: "Popular Choices" });
  return active;
}

function matchesShopCategory(product: Product, category: string) {
  if (category === "All") return true;
  const slug = categorySlugs[category as ProductCategory];
  return slug ? productMatchesCategorySlug(product, slug) : product.category === category;
}
