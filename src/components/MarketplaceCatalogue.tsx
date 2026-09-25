import { Eye, MapPin, MessageCircle, Search, SlidersHorizontal, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { isProductPurchasable } from "../catalog/productCatalog";
import { filterMarketplaceProducts, marketplaceOptions } from "../catalog/marketplaceCatalogue";
import { business } from "../config/business";
import type { Product } from "../types/product";
import { formatGhs } from "../utils/format";
import { resolveProductImage } from "../utils/productImages";
import { productWhatsAppUrl } from "../utils/whatsapp";

type MarketplaceCatalogueProps = {
  products: Product[];
  categoryLabels: Record<string, string>;
  getCategory: (product: Product) => string | undefined;
  loading: boolean;
  error: string;
  emptyTitle: string;
  onRetry: () => void;
};

export function MarketplaceCatalogue({ products, categoryLabels, getCategory, loading, error, emptyTitle, onRetry }: MarketplaceCatalogueProps) {
  const [params, setParams] = useSearchParams();
  const [filtersOpen, setFiltersOpen] = useState(false);
  // Preserve rapid filter edits while React Router commits the preceding URL update.
  const pendingParams = useRef(params);
  useEffect(() => { pendingParams.current = params; }, [params]);
  const category = params.get("category") ?? "all";
  const brand = params.get("brand")?.trim() ?? "all";
  const condition = params.get("condition") ?? "all";
  const storage = params.get("storage") ?? "all";
  const availability = params.get("availability") ?? "all";
  const maxPrice = params.get("maxPrice") ?? "";
  const sort = params.get("sort") ?? "newest";

  const brands = useMemo(() => marketplaceOptions(products.map((product) => product.brand)), [products]);
  const conditions = useMemo(() => marketplaceOptions(products.map((product) => product.condition)), [products]);
  const storageOptions = useMemo(() => marketplaceOptions(products.flatMap((product) => product.storage)), [products]);
  const availableCategories = useMemo(() => Object.entries(categoryLabels), [categoryLabels]);

  const filteredProducts = useMemo(() => filterMarketplaceProducts(products, params, getCategory), [getCategory, params, products]);

  const updateParam = (key: string, value: string) => {
    const next = new URLSearchParams(pendingParams.current);
    if (!value || value === "all") next.delete(key);
    else next.set(key, value);
    next.delete("view");
    pendingParams.current = next;
    setParams(next, { replace: true });
  };

  const clearFilters = () => {
    pendingParams.current = new URLSearchParams();
    setParams(pendingParams.current, { replace: true });
  };

  useEffect(() => {
    if (!filtersOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setFiltersOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [filtersOpen]);

  const filterFields = (
    <MarketplaceFilterFields
      category={category}
      brand={brand}
      condition={condition}
      storage={storage}
      availability={availability}
      maxPrice={maxPrice}
      categories={availableCategories}
      brands={brands}
      conditions={conditions}
      storageOptions={storageOptions}
      updateParam={updateParam}
    />
  );

  return (
    <section className="marketplace-catalogue" aria-labelledby="marketplace-results-title">
      <div className="marketplace-filter-shell">
        <label className="marketplace-search">
          <Search size={20} aria-hidden="true" />
          <span className="sr-only">Search products</span>
          <input type="search" value={params.get("q") ?? ""} onChange={(event) => updateParam("q", event.target.value)} placeholder="Search brand, model or storage" />
        </label>
        <div className="marketplace-filter-grid marketplace-filter-grid-desktop" aria-label="Product filters">{filterFields}</div>
      </div>

      <div className="marketplace-results-toolbar">
        <div><SlidersHorizontal size={18} aria-hidden="true" /><strong id="marketplace-results-title" role="status" aria-live="polite">{loading ? "Loading listings..." : `${filteredProducts.length} ${filteredProducts.length === 1 ? "listing" : "listings"}`}</strong></div>
        <div>
          <button className="marketplace-filter-trigger" type="button" aria-haspopup="dialog" aria-expanded={filtersOpen} onClick={() => setFiltersOpen(true)}><SlidersHorizontal size={17} /> Filters</button>
          <label><span>Sort</span><select value={sort} onChange={(event) => updateParam("sort", event.target.value)}><option value="newest">Newest</option><option value="price-low">Price: low to high</option><option value="price-high">Price: high to low</option></select></label>
          <button type="button" onClick={clearFilters}>Clear filters</button>
        </div>
      </div>

      {filtersOpen && (
        <div className="marketplace-filter-drawer" role="dialog" aria-modal="true" aria-label="Marketplace filters">
          <button className="marketplace-filter-backdrop" type="button" aria-label="Close filters" onClick={() => setFiltersOpen(false)} />
          <div className="marketplace-filter-sheet">
            <div className="marketplace-filter-sheet-header"><div><span>Marketplace</span><strong>Filters</strong></div><button autoFocus type="button" aria-label="Close filters" onClick={() => setFiltersOpen(false)}><X size={21} /></button></div>
            <div className="marketplace-filter-sheet-fields">{filterFields}</div>
            <div className="marketplace-filter-sheet-actions"><button className="btn-primary" type="button" onClick={() => setFiltersOpen(false)}>Show {filteredProducts.length} listings</button><button className="btn-secondary" type="button" onClick={clearFilters}>Clear</button></div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="marketplace-empty">Loading current inventory...</div>
      ) : error ? (
        <div className="marketplace-empty"><strong>Catalogue is temporarily unavailable.</strong><button className="btn-secondary" type="button" onClick={onRetry}>Retry</button></div>
      ) : filteredProducts.length > 0 ? (
        <div className="marketplace-listing-grid">{filteredProducts.map((product) => <MarketplaceProductCard product={product} key={product.id} />)}</div>
      ) : (
        <div className="marketplace-empty">
          <strong>{products.length ? "No listings match your filters." : emptyTitle}</strong>
          <p>{products.length ? "Try a different search or clear your filters." : "No listings yet. Request the device you need, or list one to sell."}</p>
          {products.length > 0 ? (
            <button className="btn-secondary" type="button" onClick={clearFilters}>Clear filters</button>
          ) : (
            <div className="marketplace-empty-actions">
              <Link className="btn-primary" to="/pre-order">Request a device</Link>
              <Link className="btn-secondary" to="/sell-or-trade?mode=sell">Sell a device</Link>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

function MarketplaceFilterFields({
  category,
  brand,
  condition,
  storage,
  availability,
  maxPrice,
  categories,
  brands,
  conditions,
  storageOptions,
  updateParam,
}: {
  category: string;
  brand: string;
  condition: string;
  storage: string;
  availability: string;
  maxPrice: string;
  categories: string[][];
  brands: string[];
  conditions: string[];
  storageOptions: string[];
  updateParam: (key: string, value: string) => void;
}) {
  return (
    <>
      <FilterSelect label="Category" value={category} onChange={(value) => updateParam("category", value)} options={categories} />
      <FilterSelect label="Brand" value={brand} onChange={(value) => updateParam("brand", value)} options={brands.map((item) => [item, item])} />
      <FilterSelect label="Condition" value={condition} onChange={(value) => updateParam("condition", value)} options={conditions.map((item) => [item, item])} />
      <FilterSelect label="Storage" value={storage} onChange={(value) => updateParam("storage", value)} options={storageOptions.map((item) => [item, item])} />
      <FilterSelect label="Availability" value={availability} onChange={(value) => updateParam("availability", value)} options={[["in-stock", "Available to buy"], ["enquiry", "Enquiry only"]]} />
      <label className="marketplace-filter-field"><span>Maximum price</span><input type="number" min="0" inputMode="numeric" value={maxPrice} onChange={(event) => updateParam("maxPrice", event.target.value)} placeholder="Any price" /></label>
    </>
  );
}

function FilterSelect({ label, value, options, onChange }: { label: string; value: string; options: string[][]; onChange: (value: string) => void }) {
  return <label className="marketplace-filter-field"><span>{label}</span><select value={value} onChange={(event) => onChange(event.target.value)}><option value="all">All</option>{options.map(([optionValue, optionLabel]) => <option value={optionValue} key={optionValue}>{optionLabel}</option>)}</select></label>;
}

function MarketplaceProductCard({ product }: { product: Product }) {
  const image = resolveProductImage(product);
  const primaryStorage = product.storage[0] ?? "";
  const primaryColour = product.colors[0] ?? "";
  const purchasable = isProductPurchasable(product);
  return (
    <article className="marketplace-listing-card">
      <Link className="marketplace-listing-image" to={`/product/${product.slug}`} aria-label={`View ${product.name}`}>
        {image ? <img src={image.src} alt={image.alt} loading="lazy" decoding="async" /> : <span>No product photo</span>}
      </Link>
      <div className="marketplace-listing-body">
        <p className="marketplace-listing-price">{product.priceOnRequest || product.price <= 0 ? "Contact for Price" : formatGhs(product.price)}</p>
        <h2><Link to={`/product/${product.slug}`}>{product.name}</Link></h2>
        <div className="marketplace-listing-facts">
          <span>{product.brand}</span>{primaryStorage && <span>{primaryStorage}</span>}<span>{product.condition}</span>{product.newArrival && <span>New Arrival</span>}
        </div>
        <p className="marketplace-listing-location"><MapPin size={15} aria-hidden="true" /> {business.address}</p>
        <p className={`marketplace-listing-status ${purchasable ? "is-available" : "is-enquiry"}`}>{purchasable || product.stockStatus === "Sold" || product.stockStatus === "Out of Stock" ? product.stockStatus : "Confirm availability"}</p>
        <div className="marketplace-listing-actions">
          <Link className="btn-secondary" to={`/product/${product.slug}`}><Eye size={16} /> View details</Link>
          <a className="btn-primary" href={productWhatsAppUrl(product, primaryStorage, primaryColour)} target="_blank" rel="noopener noreferrer"><MessageCircle size={16} /> WhatsApp</a>
        </div>
      </div>
    </article>
  );
}
