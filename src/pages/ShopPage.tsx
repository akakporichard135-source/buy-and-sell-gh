import { Filter, Search, SlidersHorizontal, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ProductGrid } from "../components/ProductGrid";
import { SEO } from "../components/SEO";
import { categories, conditions, products } from "../data/products";

type SortOption = "Newest" | "Price: Low to High" | "Price: High to Low" | "Name" | "Availability";

interface FiltersState {
  search: string;
  category: string;
  model: string;
  maxPrice: number;
  storage: string;
  condition: string;
  color: string;
  availability: string;
  brandNew: boolean;
  ukUsed: boolean;
  newArrival: boolean;
  popular: boolean;
}

const defaultFilters: FiltersState = {
  search: "",
  category: "All",
  model: "",
  maxPrice: 22000,
  storage: "All",
  condition: "All",
  color: "",
  availability: "All",
  brandNew: false,
  ukUsed: false,
  newArrival: false,
  popular: false,
};

const storageOptions = ["64GB", "128GB", "256GB", "512GB", "1TB", "GPS", "GPS + Cellular", "USB-C Case"];
const availabilityOptions = ["In stock", "Limited stock", "Low stock", "On request", "Sold Out"];

export function ShopPage() {
  const [params] = useSearchParams();
  const [filters, setFilters] = useState<FiltersState>({
    ...defaultFilters,
    category: params.get("category") ?? "All",
    newArrival: params.get("newArrival") === "true",
  });
  const [sort, setSort] = useState<SortOption>("Newest");
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

  const activeFilterCount = useMemo(() => {
    return Object.entries(filters).filter(([key, value]) => value !== defaultFilters[key as keyof FiltersState]).length;
  }, [filters]);

  const filtered = useMemo(() => {
    const terms = filters.search.trim().toLowerCase().split(/\s+/).filter(Boolean);
    const list = products
      .filter((product) => {
        if (!terms.length) return true;
        const searchable = [
          product.name,
          product.model,
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
      .filter((product) => product.colors.join(" ").toLowerCase().includes(filters.color.toLowerCase()))
      .filter((product) => filters.category === "All" || product.category === filters.category)
      .filter((product) => filters.condition === "All" || product.condition === filters.condition)
      .filter((product) => filters.storage === "All" || product.storage.includes(filters.storage))
      .filter((product) => filters.availability === "All" || product.stockStatus === filters.availability)
      .filter((product) => product.price <= filters.maxPrice)
      .filter((product) => !filters.brandNew || product.condition === "Brand New" || product.category === "Brand New Devices")
      .filter((product) => !filters.ukUsed || product.condition === "UK Used" || product.category === "UK Used Devices")
      .filter((product) => !filters.newArrival || product.isNewArrival)
      .filter((product) => !filters.popular || product.isPopular);

    return [...list].sort((a, b) => {
      if (sort === "Price: Low to High") return a.price - b.price;
      if (sort === "Price: High to Low") return b.price - a.price;
      if (sort === "Name") return a.name.localeCompare(b.name);
      if (sort === "Availability") return b.stockQuantity - a.stockQuantity;
      return products.indexOf(a) - products.indexOf(b);
    });
  }, [filters, sort]);

  const updateFilter = <K extends keyof FiltersState>(key: K, value: FiltersState[K]) => {
    setFilters((current) => ({ ...current, [key]: value }));
  };

  const clearFilters = () => setFilters(defaultFilters);

  return (
    <>
      <SEO title="Shop Original iPhones in Ghana" description="Browse original iPhones, iPads, Apple Watches, AirPods and Apple gadgets from Buy & Sell GH in Accra." />
      <section className="page-hero shop-hero">
        <p className="eyebrow-dark">Shop</p>
        <h1>Original devices catalogue</h1>
        <p>Search, filter and compare available iPhones, iPads and Apple gadgets. Confirm availability and final details with Buy & Sell GH before payment.</p>
      </section>
      <section className="section shop-section grid gap-6 lg:grid-cols-[310px_1fr]">
        <aside className="filter-panel hidden lg:block">
          <FilterControls filters={filters} updateFilter={updateFilter} clearFilters={clearFilters} activeFilterCount={activeFilterCount} />
        </aside>
        <div>
          <div className="mb-5 grid gap-3 rounded-lg border border-black/7 bg-white p-4 shadow-card">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <p className="font-black">{filtered.length} products found</p>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <button className="btn-secondary lg:hidden" type="button" onClick={() => setDrawerOpen(true)}>
                  <Filter size={17} /> Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
                </button>
                <label className="flex items-center gap-3 text-sm font-black">Sort
                  <select className="rounded-lg border border-black/10 px-3 py-2" value={sort} onChange={(e) => setSort(e.target.value as SortOption)}>
                    <option>Newest</option>
                    <option>Price: Low to High</option>
                    <option>Price: High to Low</option>
                    <option>Name</option>
                    <option>Availability</option>
                  </select>
                </label>
              </div>
            </div>
            <label className="search-inline">
              <Search size={18} />
              <input value={filters.search} onChange={(e) => updateFilter("search", e.target.value)} placeholder="Search iPhone 15, 256GB, Black, UK Used..." />
              {filters.search && <button type="button" aria-label="Clear search" onClick={() => updateFilter("search", "")}><X size={18} /></button>}
            </label>
          </div>
          <ProductGrid products={filtered} />
        </div>
      </section>
      {drawerOpen && (
        <div className="filter-drawer" role="dialog" aria-modal="true" aria-label="Product filters">
          <button className="filter-drawer-backdrop" type="button" aria-label="Close filters" onClick={() => setDrawerOpen(false)} />
          <div className="filter-drawer-panel">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <p className="text-lg font-black text-ink">Filters</p>
                <p className="text-sm font-bold text-ink/60">{activeFilterCount} active</p>
              </div>
              <button className="icon-button shrink-0" type="button" aria-label="Close filters" onClick={() => setDrawerOpen(false)}><X size={20} /></button>
            </div>
            <FilterControls filters={filters} updateFilter={updateFilter} clearFilters={clearFilters} activeFilterCount={activeFilterCount} />
            <div className="filter-drawer-actions">
              <button className="btn-primary" type="button" onClick={() => setDrawerOpen(false)}>Apply Filters</button>
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
      <div className="mb-4 flex items-center justify-between gap-3 text-lg font-black">
        <span className="flex items-center gap-2"><SlidersHorizontal size={20} /> Filters</span>
        {activeFilterCount > 0 && <button className="text-sm font-black text-gold-dark" type="button" onClick={clearFilters}>Clear All</button>}
      </div>
      <label className="filter-label">Search<input value={filters.search} onChange={(e) => updateFilter("search", e.target.value)} placeholder="iPhone 15, AirPods..." /></label>
      <label className="filter-label">Category<select value={filters.category} onChange={(e) => updateFilter("category", e.target.value)}><option>All</option>{categories.map((item) => <option key={item}>{item}</option>)}</select></label>
      <label className="filter-label">Model<input value={filters.model} placeholder="Type model" onChange={(e) => updateFilter("model", e.target.value)} /></label>
      <label className="filter-label">Price: up to GHS {filters.maxPrice.toLocaleString()}<input type="range" min="2000" max="22000" step="500" value={filters.maxPrice} onChange={(e) => updateFilter("maxPrice", Number(e.target.value))} /></label>
      <label className="filter-label">Storage<select value={filters.storage} onChange={(e) => updateFilter("storage", e.target.value)}><option>All</option>{storageOptions.map((item) => <option key={item}>{item}</option>)}</select></label>
      <label className="filter-label">Condition<select value={filters.condition} onChange={(e) => updateFilter("condition", e.target.value)}><option>All</option>{conditions.map((item) => <option key={item}>{item}</option>)}</select></label>
      <label className="filter-label">Colour<input value={filters.color} placeholder="Gold, Black, Blue..." onChange={(e) => updateFilter("color", e.target.value)} /></label>
      <label className="filter-label">Stock status<select value={filters.availability} onChange={(e) => updateFilter("availability", e.target.value)}><option>All</option>{availabilityOptions.map((item) => <option key={item}>{item}</option>)}</select></label>
      <div className="mt-5 grid gap-3">
        <FilterCheck label="Brand New" checked={filters.brandNew} onChange={(checked) => updateFilter("brandNew", checked)} />
        <FilterCheck label="UK Used" checked={filters.ukUsed} onChange={(checked) => updateFilter("ukUsed", checked)} />
        <FilterCheck label="New Arrivals" checked={filters.newArrival} onChange={(checked) => updateFilter("newArrival", checked)} />
        <FilterCheck label="Popular Choices" checked={filters.popular} onChange={(checked) => updateFilter("popular", checked)} />
      </div>
    </div>
  );
}

function FilterCheck({ label, checked, onChange }: { label: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <label className="flex items-center gap-3 rounded-lg border border-black/10 bg-white px-3 py-3 text-sm font-black text-ink">
      <input className="h-4 w-4 accent-[var(--color-gold)]" type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />
      {label}
    </label>
  );
}
