import { Cable, ChevronRight, Smartphone, Tablet } from "lucide-react";
import { useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  getOtherPhoneTabletBrands,
  getPhoneTabletCategory,
  getPhoneTabletProducts,
  getPrimaryPhoneTabletBrands,
  phoneTabletCategoryLabels,
  type PhoneTabletCategoryKey,
} from "../catalog/catalogueDiscovery";
import { useProductCatalog } from "../catalog/ProductCatalogContext";
import { MarketplaceCatalogue } from "../components/MarketplaceCatalogue";
import { SEO } from "../components/SEO";
import type { Product } from "../types/product";
import { resolveProductImage } from "../utils/productImages";

const categoryIcons = {
  "mobile-phones": Smartphone,
  tablets: Tablet,
  "phone-accessories": Cable,
  "tablet-accessories": Cable,
} as const;

export function MobilePhonesPage() {
  const { activeProducts, error, loading, refreshProducts } = useProductCatalog();
  const [params] = useSearchParams();
  const selectedBrand = params.get("brand")?.trim() ?? "";
  const showOtherBrands = params.get("view") === "others" && !selectedBrand;
  const marketplaceProducts = useMemo(() => getPhoneTabletProducts(activeProducts), [activeProducts]);
  const primaryBrands = useMemo(() => getPrimaryPhoneTabletBrands(marketplaceProducts), [marketplaceProducts]);
  const otherBrands = useMemo(() => getOtherPhoneTabletBrands(marketplaceProducts), [marketplaceProducts]);
  const availableCategories = useMemo(() => (Object.keys(phoneTabletCategoryLabels) as PhoneTabletCategoryKey[]).filter((key) => marketplaceProducts.some((product) => getPhoneTabletCategory(product) === key)), [marketplaceProducts]);

  return (
    <>
      <SEO title="Phones & Tablets in Ghana" description="Browse real non-Apple phones, tablets and related accessories published by Buy & Sell GH." />
      <section className="marketplace-page-hero">
        <p className="eyebrow-dark">Phones &amp; Tablets</p>
        <h1>Current non-Apple devices from one trusted store.</h1>
        <p>Search owner-published inventory by category, brand, condition, price and storage. Every listing comes directly from Buy &amp; Sell GH.</p>
      </section>

      {availableCategories.length > 0 && (
        <section className="marketplace-navigation" aria-labelledby="phone-tablet-categories-title">
          <div className="marketplace-section-heading"><div><p className="eyebrow-dark">Categories</p><h2 id="phone-tablet-categories-title">Browse phones and tablets.</h2></div></div>
          <div className="marketplace-category-rail">
            {availableCategories.map((category) => <MarketplaceCategoryCard category={category} products={marketplaceProducts} key={category} />)}
          </div>
        </section>
      )}

      {(primaryBrands.length > 0 || otherBrands.length > 0) && (
        <section className="marketplace-navigation" aria-labelledby="phone-tablet-brands-title">
          <div className="marketplace-section-heading"><div><p className="eyebrow-dark">Brands</p><h2 id="phone-tablet-brands-title">Choose a brand.</h2></div></div>
          <div className="phone-brand-grid">
            {primaryBrands.map((brand) => <PhoneBrandCard brand={brand} products={marketplaceProducts} key={brand} />)}
            {otherBrands.length > 0 && (
              <Link className={`phone-brand-card phone-brand-card-others ${showOtherBrands ? "is-active" : ""}`} to="/phones-tablets?view=others">
                <span className="phone-brand-other-mark"><Smartphone size={38} /></span>
                <div><strong>Others</strong><small>{otherBrands.length} additional {otherBrands.length === 1 ? "brand" : "brands"}</small></div>
                <ChevronRight size={20} />
              </Link>
            )}
          </div>
          {showOtherBrands && (
            <div className="other-brand-panel" aria-labelledby="other-phone-brands-title">
              <div className="other-brand-panel-heading"><div><p className="eyebrow-dark">Others</p><h2 id="other-phone-brands-title">Additional phone and tablet brands</h2><p>Choose a brand to view only its real published products.</p></div><Link to="/phones-tablets">Back to all brands</Link></div>
              <div className="other-brand-name-list">{otherBrands.map((brand) => <Link to={`/phones-tablets?brand=${encodeURIComponent(brand)}`} key={brand}><span>{brand}</span><ChevronRight size={18} /></Link>)}</div>
            </div>
          )}
        </section>
      )}

      {!showOtherBrands && (
        <MarketplaceCatalogue
          products={marketplaceProducts}
          categoryLabels={phoneTabletCategoryLabels}
          getCategory={getPhoneTabletCategory}
          loading={loading}
          error={error}
          emptyTitle="No non-Apple phones or tablets are available yet."
          onRetry={() => void refreshProducts()}
        />
      )}
    </>
  );
}

function MarketplaceCategoryCard({ category, products }: { category: PhoneTabletCategoryKey; products: Product[] }) {
  const matching = getPhoneTabletProducts(products, category);
  const representative = matching.find((product) => resolveProductImage(product));
  const image = representative ? resolveProductImage(representative) : undefined;
  const Icon = categoryIcons[category];
  return (
    <Link className="marketplace-category-card" to={`/phones-tablets?category=${category}`}>
      <span className="marketplace-category-image">{image ? <img src={image.src} alt={image.alt} loading="lazy" decoding="async" /> : <Icon size={42} aria-hidden="true" />}</span>
      <strong>{phoneTabletCategoryLabels[category]}</strong>
      <small>{matching.length} {matching.length === 1 ? "listing" : "listings"}</small>
    </Link>
  );
}

function PhoneBrandCard({ brand, products }: { brand: string; products: Product[] }) {
  const brandProducts = getPhoneTabletProducts(products, null, brand);
  const representative = brandProducts.find((product) => resolveProductImage(product));
  const image = representative ? resolveProductImage(representative) : undefined;
  return (
    <Link className="phone-brand-card" to={`/phones-tablets?brand=${encodeURIComponent(brand)}`}>
      <span className="phone-brand-image">{image ? <img src={image.src} alt={image.alt} loading="lazy" decoding="async" /> : <span>{brand.slice(0, 1)}</span>}</span>
      <div><strong>{brand}</strong><small>{brandProducts.length} {brandProducts.length === 1 ? "listing" : "listings"}</small></div>
      <ChevronRight size={20} />
    </Link>
  );
}
