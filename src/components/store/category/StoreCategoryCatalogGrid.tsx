import { useState } from "react";
import { Link } from "react-router-dom";
import { isProductPurchasable } from "../../../catalog/productCatalog";
import type { ProductFamilyKey } from "../../../catalog/productExperience";
import type { Product } from "../../../types/product";
import { formatGhs } from "../../../utils/format";
import { resolveCatalogueProductImage, resolveProductImage } from "../../../utils/productImages";

interface StoreCategoryCatalogGridProps {
  family: ProductFamilyKey;
  products: Product[];
  activeSubnavId: string;
  catalogTitle: string;
  catalogSubtitle: string;
}

export function StoreCategoryCatalogGrid({
  family,
  products,
  activeSubnavId,
  catalogTitle,
  catalogSubtitle,
}: StoreCategoryCatalogGridProps) {
  const [conditionFilter, setConditionFilter] = useState<"All" | "Brand New" | "UK Used">("All");

  // Filter products by activeSubnavId
  const subnavFiltered = products.filter((product) => {
    if (activeSubnavId === "all") return true;

    const name = product.name.toLowerCase();
    const model = (product.model || "").toLowerCase();
    const sub = (product.subcategory || "").toLowerCase();
    const full = `${name} ${model} ${sub}`;

    if (family === "iphone") {
      if (activeSubnavId === "pro") return full.includes("pro");
      if (activeSubnavId === "standard") return !full.includes("pro") && !full.includes("duo");
      if (activeSubnavId === "duo") return full.includes("duo");
      if (activeSubnavId === "uk-used") return product.condition === "UK Used";
    }

    if (family === "mac") {
      if (activeSubnavId === "macbook-air") return full.includes("air");
      if (activeSubnavId === "macbook-pro") return full.includes("pro");
      if (activeSubnavId === "mac-mini") return full.includes("mini");
      if (activeSubnavId === "mac-studio") return full.includes("studio");
    }

    if (family === "ipad") {
      if (activeSubnavId === "ipad-pro") return full.includes("pro");
      if (activeSubnavId === "ipad-air") return full.includes("air");
      if (activeSubnavId === "ipad-mini") return full.includes("mini");
      if (activeSubnavId === "ipad-standard") return !full.includes("pro") && !full.includes("air") && !full.includes("mini");
    }

    if (family === "watch") {
      if (activeSubnavId === "ultra") return full.includes("ultra");
      if (activeSubnavId === "series") return full.includes("series");
      if (activeSubnavId === "se") return full.includes("se");
    }

    if (family === "airpods") {
      if (activeSubnavId === "pro") return full.includes("pro");
      if (activeSubnavId === "standard") return !full.includes("pro") && !full.includes("max");
      if (activeSubnavId === "max") return full.includes("max");
    }

    if (family === "accessories") {
      if (activeSubnavId === "charging") return sub.includes("charging") || full.includes("adapter") || full.includes("charger");
      if (activeSubnavId === "magsafe") return full.includes("magsafe");
      if (activeSubnavId === "cables") return sub.includes("cables") || full.includes("cable");
      if (activeSubnavId === "input") return full.includes("keyboard") || full.includes("mouse") || full.includes("trackpad") || full.includes("pencil");
    }

    return true;
  });

  // Filter by condition
  const filtered = subnavFiltered.filter((product) => {
    if (conditionFilter === "All") return true;
    if (conditionFilter === "Brand New") return product.condition === "Brand New";
    if (conditionFilter === "UK Used") return product.condition === "UK Used" || product.condition === "Excellent" || product.condition === "Very Good";
    return true;
  });

  const availableConditions = Array.from(new Set(subnavFiltered.map((p) => p.condition))).filter(Boolean);
  const showConditionTabs = availableConditions.length > 1;

  return (
    <section className="store-cat-catalog-section" id="all-listings" aria-labelledby="catalog-section-title">
      <div className="store-cat-catalog-container">
        <div className="store-cat-catalog-header">
          <div>
            <h2 id="catalog-section-title" className="store-cat-catalog-title">
              {catalogTitle}
            </h2>
            <p className="store-cat-catalog-subtitle">{catalogSubtitle}</p>
          </div>

          {showConditionTabs && (
            <div className="store-cat-condition-tabs" role="tablist" aria-label="Filter by device condition">
              {(["All", "Brand New", "UK Used"] as const).map((cond) => (
                <button
                  key={cond}
                  type="button"
                  role="tab"
                  aria-selected={conditionFilter === cond}
                  className={`store-cat-condition-btn ${conditionFilter === cond ? "is-active" : ""}`}
                  onClick={() => setConditionFilter(cond)}
                >
                  {cond}
                </button>
              ))}
            </div>
          )}
        </div>

        {filtered.length === 0 ? (
          <div className="store-cat-empty-state">
            <p>No listings match the selected filters right now.</p>
            <button
              type="button"
              className="store-cat-btn-primary"
              onClick={() => setConditionFilter("All")}
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="store-cat-products-grid">
            {filtered.map((product) => (
              <StoreCatalogProductCard key={product.id} product={product} family={family} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function StoreCatalogProductCard({ product, family }: { product: Product; family: ProductFamilyKey }) {
  const isPurchasable = isProductPurchasable(product);
  const isIphoneDuo = product.slug?.includes("iphone-duo") || product.name?.toLowerCase().includes("iphone duo");
  const isViewPricing = isIphoneDuo || product.priceOnRequest || product.price <= 0;
  const primaryCta = isViewPricing ? "View Pricing" : (isPurchasable ? "Buy" : "View Pricing");

  const buyPath = getProductBuyPath(family, product.slug);
  const resolvedImg = resolveCatalogueProductImage(product) || resolveProductImage(product);

  const priceText = product.priceOnRequest || product.price <= 0
    ? "Contact for price"
    : `From ${formatGhs(product.price)}`;

  return (
    <article className="store-cat-grid-card">
      <div className="store-cat-grid-card-badges">
        {product.condition && product.condition !== "To Confirm" && (
          <span className={`store-cat-badge ${product.condition === "UK Used" ? "badge-uk-used" : "badge-brand-new"}`}>
            {product.condition}
          </span>
        )}
        {product.stockStatus === "Low Stock" && (
          <span className="store-cat-badge badge-low-stock">Low Stock</span>
        )}
      </div>

      <div className="store-cat-grid-card-media">
        {resolvedImg ? (
          <img
            src={resolvedImg.src}
            alt={resolvedImg.alt || product.name}
            loading="lazy"
            decoding="async"
            className="store-cat-grid-card-img"
          />
        ) : (
          <div className="store-cat-card-placeholder">
            <span>Asset pending</span>
          </div>
        )}
      </div>

      <div className="store-cat-grid-card-content">
        <h3 className="store-cat-grid-card-title">{product.name}</h3>

        {product.storage && product.storage.length > 0 && (
          <div className="store-cat-grid-card-storage">
            {product.storage.slice(0, 3).map((s) => (
              <span key={s} className="store-cat-storage-pill">{s}</span>
            ))}
            {product.storage.length > 3 && (
              <span className="store-cat-storage-more">+{product.storage.length - 3}</span>
            )}
          </div>
        )}

        <div className="store-cat-grid-card-bottom">
          <span className="store-cat-grid-card-price">{priceText}</span>

          <Link
            to={buyPath}
            className="store-cat-grid-card-btn"
            aria-label={`${primaryCta} ${product.name}`}
          >
            {primaryCta}
          </Link>
        </div>
      </div>
    </article>
  );
}

function getProductBuyPath(family: ProductFamilyKey, slug: string): string {
  if (family === "iphone") return `/shop/buy-iphone/${slug}`;
  if (family === "mac") return `/shop/buy-mac/${slug}`;
  if (family === "ipad") return `/shop/buy-ipad/${slug}`;
  if (family === "watch") return `/shop/buy-watch/${slug}`;
  if (family === "airpods") return `/shop/buy-airpods/${slug}`;
  return `/shop/buy-accessory/${slug}`;
}
