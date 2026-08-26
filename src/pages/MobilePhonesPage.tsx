import { ArrowLeft, ArrowRight, ChevronRight, Smartphone } from "lucide-react";
import { useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { getMobilePhoneProducts, getOtherMobilePhoneBrands, getPrimaryMobilePhoneBrands } from "../catalog/catalogueDiscovery";
import { useProductCatalog } from "../catalog/ProductCatalogContext";
import { ProductGrid } from "../components/ProductGrid";
import { SEO } from "../components/SEO";
import type { Product } from "../types/product";
import { resolveProductImage } from "../utils/productImages";

export function MobilePhonesPage() {
  const { activeProducts, error, loading, refreshProducts } = useProductCatalog();
  const [params] = useSearchParams();
  const selectedBrand = params.get("brand")?.trim() ?? "";
  const showOtherBrands = params.get("view") === "others" && !selectedBrand;
  const primaryBrands = useMemo(() => getPrimaryMobilePhoneBrands(activeProducts), [activeProducts]);
  const otherBrands = useMemo(() => getOtherMobilePhoneBrands(activeProducts), [activeProducts]);
  const phoneProducts = useMemo(() => getMobilePhoneProducts(activeProducts, selectedBrand), [activeProducts, selectedBrand]);

  return (
    <>
      <SEO title="Mobile Phones in Ghana" description="Browse published non-Apple mobile phones from Buy & Sell GH by brand, with real catalogue availability and owner-uploaded product photos." />
      <section className="catalogue-hub-hero">
        <p className="eyebrow-dark">Mobile Phones</p>
        <h1>Explore phones beyond iPhone.</h1>
        <p>Browse published phones available from Buy &amp; Sell GH. Select a brand to see its current catalogue.</p>
      </section>

      <section className="catalogue-hub-section" aria-labelledby="mobile-phone-brands-title">
        <div className="catalogue-hub-heading">
          <div><p className="eyebrow-dark">Brands</p><h2 id="mobile-phone-brands-title">Choose a phone brand.</h2></div>
          <Link to="/shop?category=Phones" className="catalogue-hub-text-link">Open phone filters <ArrowRight size={16} /></Link>
        </div>

        {primaryBrands.length > 0 || otherBrands.length > 0 ? (
          <div className="phone-brand-grid">
            {primaryBrands.map((brand) => <PhoneBrandCard brand={brand} products={activeProducts} key={brand} />)}
            {otherBrands.length > 0 && (
              <Link className={`phone-brand-card phone-brand-card-others ${showOtherBrands ? "is-active" : ""}`} to="/mobile-phones?view=others">
                <span className="phone-brand-other-mark"><Smartphone size={38} /></span>
                <div><strong>Others</strong><small>{otherBrands.length} additional {otherBrands.length === 1 ? "brand" : "brands"}</small></div>
                <ChevronRight size={20} />
              </Link>
            )}
          </div>
        ) : (
          <div className="catalogue-hub-empty compact"><strong>No non-Apple phone brands are published yet.</strong><p>New brands will appear here automatically when the owner publishes matching products.</p><Link className="btn-primary" to="/pre-order">Request a Phone</Link></div>
        )}

        {showOtherBrands && (
          <div className="other-brand-panel" aria-labelledby="other-phone-brands-title">
            <div className="other-brand-panel-heading"><div><p className="eyebrow-dark">Others</p><h2 id="other-phone-brands-title">Other phone brands</h2><p>Choose a brand first to view its published devices.</p></div><Link to="/mobile-phones"><ArrowLeft size={17} /> Back to all brands</Link></div>
            {otherBrands.length > 0 ? <div className="other-brand-name-list">{otherBrands.map((brand) => <Link to={`/mobile-phones?brand=${encodeURIComponent(brand)}`} key={brand}><span>{brand}</span><ChevronRight size={18} /></Link>)}</div> : <p className="other-brand-empty">No additional phone brands are published yet.</p>}
          </div>
        )}
      </section>

      {!showOtherBrands && (
        <section className="catalogue-hub-results" aria-labelledby="mobile-phone-results-title">
          <div className="catalogue-hub-heading">
            <div><p className="eyebrow-dark">{phoneProducts.length} {phoneProducts.length === 1 ? "product" : "products"}</p><h2 id="mobile-phone-results-title">{selectedBrand ? `${selectedBrand} phones` : "Available mobile phones"}</h2></div>
            {selectedBrand && <Link className="catalogue-hub-text-link" to="/mobile-phones">Clear brand <ArrowLeft size={16} /></Link>}
          </div>
          {loading ? <div className="catalogue-hub-empty compact">Loading mobile phones...</div> : error ? <div className="catalogue-hub-empty compact"><strong>Catalogue is temporarily unavailable.</strong><button className="btn-secondary" type="button" onClick={() => void refreshProducts()}>Retry</button></div> : <ProductGrid products={phoneProducts} />}
        </section>
      )}
    </>
  );
}

function PhoneBrandCard({ brand, products }: { brand: string; products: Product[] }) {
  const brandProducts = getMobilePhoneProducts(products, brand);
  const representative = brandProducts.find((product) => resolveProductImage(product)) ?? brandProducts[0];
  const image = representative ? resolveProductImage(representative) : undefined;
  return (
    <Link className="phone-brand-card" to={`/mobile-phones?brand=${encodeURIComponent(brand)}`}>
      <span className="phone-brand-image">{image ? <img src={image.src} alt={image.alt} loading="lazy" decoding="async" /> : <span>{brand.slice(0, 1)}</span>}</span>
      <div><strong>{brand}</strong><small>{brandProducts.length} {brandProducts.length === 1 ? "product" : "products"}</small></div>
      <ChevronRight size={20} />
    </Link>
  );
}
