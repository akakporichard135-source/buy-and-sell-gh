import { Eye, MapPin, MessageCircle, Search, SlidersHorizontal } from "lucide-react";
import { useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { isProductPurchasable } from "../catalog/productCatalog";
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
  const search = params.get("q")?.trim() ?? "";
  const category = params.get("category") ?? "all";
  const brand = params.get("brand")?.trim() ?? "all";
  const condition = params.get("condition") ?? "all";
  const storage = params.get("storage") ?? "all";
  const availability = params.get("availability") ?? "all";
  const maxPrice = params.get("maxPrice") ?? "";
  const sort = params.get("sort") ?? "newest";

  const brands = useMemo(() => unique(products.map((product) => product.brand)), [products]);
  const conditions = useMemo(() => unique(products.map((product) => product.condition)), [products]);
  const storageOptions = useMemo(() => unique(products.flatMap((product) => product.storage)), [products]);
  const availableCategories = useMemo(() => Object.entries(categoryLabels), [categoryLabels]);

  const filteredProducts = useMemo(() => {
    const normalizedSearch = search.toLowerCase();
    const maximum = maxPrice ? Number(maxPrice) : undefined;
    const next = products.filter((product) => {
      const searchable = [product.name, product.brand, product.model, product.subcategory, ...(product.specifications ?? product.specs ?? [])].join(" ").toLowerCase();
      if (normalizedSearch && !searchable.includes(normalizedSearch)) return false;
      if (category !== "all" && getCategory(product) !== category) return false;
      if (brand !== "all" && product.brand.toLowerCase() !== brand.toLowerCase()) return false;
      if (condition !== "all" && product.condition !== condition) return false;
      if (storage !== "all" && !product.storage.includes(storage)) return false;
      if (availability === "in-stock" && !isProductPurchasable(product)) return false;
      if (availability === "enquiry" && isProductPurchasable(product)) return false;
      if (maximum !== undefined && (!Number.isFinite(maximum) || product.priceOnRequest || product.price <= 0 || product.price > maximum)) return false;
      return true;
    });

    return next.sort((left, right) => {
      if (sort === "price-low") return priceForSort(left) - priceForSort(right);
      if (sort === "price-high") return priceForSort(right) - priceForSort(left);
      return Date.parse(right.createdAt ?? "") - Date.parse(left.createdAt ?? "");
    });
  }, [availability, brand, category, condition, getCategory, maxPrice, products, search, sort, storage]);

  const updateParam = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (!value || value === "all") next.delete(key);
    else next.set(key, value);
    next.delete("view");
    setParams(next, { replace: true });
  };

  const clearFilters = () => setParams(new URLSearchParams(), { replace: true });

  return (
    <section className="marketplace-catalogue" aria-labelledby="marketplace-results-title">
      <div className="marketplace-filter-shell">
        <label className="marketplace-search">
          <Search size={20} aria-hidden="true" />
          <span className="sr-only">Search products</span>
          <input value={search} onChange={(event) => updateParam("q", event.target.value)} placeholder="Search brand, model or specification" />
        </label>
        <div className="marketplace-filter-grid" aria-label="Product filters">
          <FilterSelect label="Category" value={category} onChange={(value) => updateParam("category", value)} options={availableCategories} />
          <FilterSelect label="Brand" value={brand} onChange={(value) => updateParam("brand", value)} options={brands.map((item) => [item, item])} />
          <FilterSelect label="Condition" value={condition} onChange={(value) => updateParam("condition", value)} options={conditions.map((item) => [item, item])} />
          <FilterSelect label="Storage" value={storage} onChange={(value) => updateParam("storage", value)} options={storageOptions.map((item) => [item, item])} />
          <FilterSelect label="Availability" value={availability} onChange={(value) => updateParam("availability", value)} options={[["in-stock", "Available to buy"], ["enquiry", "Enquiry only"]]} />
          <label className="marketplace-filter-field"><span>Maximum price</span><input type="number" min="0" inputMode="numeric" value={maxPrice} onChange={(event) => updateParam("maxPrice", event.target.value)} placeholder="Any price" /></label>
        </div>
      </div>

      <div className="marketplace-results-toolbar">
        <div><SlidersHorizontal size={18} aria-hidden="true" /><strong id="marketplace-results-title">{filteredProducts.length} {filteredProducts.length === 1 ? "listing" : "listings"}</strong></div>
        <div>
          <label><span>Sort</span><select value={sort} onChange={(event) => updateParam("sort", event.target.value)}><option value="newest">Newest</option><option value="price-low">Price: low to high</option><option value="price-high">Price: high to low</option></select></label>
          <button type="button" onClick={clearFilters}>Clear filters</button>
        </div>
      </div>

      {loading ? (
        <div className="marketplace-empty">Loading current inventory...</div>
      ) : error ? (
        <div className="marketplace-empty"><strong>Catalogue is temporarily unavailable.</strong><button className="btn-secondary" type="button" onClick={onRetry}>Retry</button></div>
      ) : filteredProducts.length > 0 ? (
        <div className="marketplace-listing-grid">{filteredProducts.map((product) => <MarketplaceProductCard product={product} key={product.id} />)}</div>
      ) : (
        <div className="marketplace-empty"><strong>{emptyTitle}</strong><p>Published products will appear here automatically when the owner adds them in Product Manager.</p>{products.length > 0 && <button className="btn-secondary" type="button" onClick={clearFilters}>Clear filters</button>}</div>
      )}
    </section>
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
          <span>{product.brand}</span><span>{product.model}</span>{primaryStorage && <span>{primaryStorage}</span>}<span>{product.condition}</span>
        </div>
        <p className="marketplace-listing-location"><MapPin size={15} aria-hidden="true" /> {business.address}</p>
        <p className={`marketplace-listing-status ${purchasable ? "is-available" : "is-enquiry"}`}>{purchasable ? product.stockStatus : "Confirm availability"}</p>
        <div className="marketplace-listing-actions">
          <Link className="btn-secondary" to={`/product/${product.slug}`}><Eye size={16} /> View details</Link>
          <a className="btn-primary" href={productWhatsAppUrl(product, primaryStorage, primaryColour)} target="_blank" rel="noopener noreferrer"><MessageCircle size={16} /> WhatsApp</a>
        </div>
      </div>
    </article>
  );
}

const unique = (items: string[]) => Array.from(new Set(items.map((item) => item.trim()).filter(Boolean))).sort((left, right) => left.localeCompare(right));
const priceForSort = (product: Product) => product.priceOnRequest || product.price <= 0 ? Number.POSITIVE_INFINITY : product.price;
