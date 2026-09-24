import { Check, ChevronLeft, ChevronRight, MessageCircle, ShoppingBag } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useProductCatalog } from "../catalog/ProductCatalogContext";
import {
  familyMatchesProduct,
  getProductStory,
  productFamilies,
  productStoryPath,
  type ProductFamilyKey,
} from "../catalog/productExperience";
import { isProductPurchasable } from "../catalog/productCatalog";
import { SEO } from "../components/SEO";
import { useCart } from "../context/CartContext";
import type { Product, ProductImage } from "../types/product";
import { formatGhs } from "../utils/format";
import { getIpadFamily, getMacbookFamily, getWatchFamily } from "../utils/productPresentation";
import { resolveProductGallery } from "../utils/productImages";
import { productWhatsAppUrl, whatsappUrl } from "../utils/whatsapp";
import "../styles/product-experience.css";

export function ProductBuyPage({ family }: { family: ProductFamilyKey }) {
  const { slug = "" } = useParams();
  const navigate = useNavigate();
  const { activeProducts, loading, error, refreshProducts } = useProductCatalog();
  const { addItem } = useCart();
  const definition = productFamilies[family];
  const story = getProductStory(family, slug);
  const candidates = useMemo(() => resolveCandidates(activeProducts, family, slug), [activeProducts, family, slug]);
  const [selectedId, setSelectedId] = useState("");
  const selectedProduct = candidates.find((product) => product.id === selectedId) ?? candidates[0];
  const [storage, setStorage] = useState("");
  const [color, setColor] = useState("");
  const [activeImage, setActiveImage] = useState(0);
  const [preferredStorage, setPreferredStorage] = useState("");
  const [preferredColor, setPreferredColor] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    const product = candidates[0];
    setSelectedId(product?.id ?? "");
  }, [candidates]);

  useEffect(() => {
    setStorage(selectedProduct?.storage[0] ?? "");
    setColor(selectedProduct?.colors[0] ?? "");
    setActiveImage(0);
    setNotice("");
  }, [selectedProduct?.id]);

  const name = selectedProduct?.name ?? story?.name ?? humanizeSlug(slug);
  const gallery = selectedProduct ? resolveProductGallery(selectedProduct) : story?.galleryMedia ?? [];
  const purchasable = selectedProduct ? isProductPurchasable(selectedProduct) : false;
  const priceLabel = selectedProduct && !selectedProduct.priceOnRequest && selectedProduct.price > 0
    ? formatGhs(selectedProduct.price)
    : "Price confirmed on enquiry";
  const enquiryHref = selectedProduct
    ? productWhatsAppUrl(selectedProduct, storage, color)
    : whatsappUrl(`Hello Buy & Sell GH, I am interested in ${name}.${preferredStorage ? ` Preferred storage: ${preferredStorage}.` : ""}${preferredColor ? ` Preferred colour: ${preferredColor}.` : ""} Please confirm availability, price and delivery details.`);
  const preorderPath = `/pre-order?model=${encodeURIComponent(name)}${preferredStorage ? `&storage=${encodeURIComponent(preferredStorage)}` : ""}${preferredColor ? `&color=${encodeURIComponent(preferredColor)}` : ""}`;

  const addSelectedToCart = (goToCart = false) => {
    if (!selectedProduct || !purchasable) return;
    const added = addItem(selectedProduct, storage, color, 1);
    if (added) {
      setNotice(`${selectedProduct.name} was added to your cart.`);
      if (goToCart) navigate("/cart");
    }
  };

  if (loading && !story) return <section className="experience-loading" role="status">Loading current Store availability...</section>;

  return (
    <div className="product-buy-page">
      <SEO title={`Buy ${name}`} description={`Review real ${name} Store options, price and availability, or send a configuration enquiry to Buy & Sell GH.`} />
      <nav className="buy-breadcrumbs" aria-label="Breadcrumb">
        <Link to={definition.path}>{definition.label}</Link><span>/</span><strong>Buy {name}</strong>
      </nav>

      <header className="buy-page-header">
        <p>{selectedProduct ? "Store product" : "Availability enquiry"}</p>
        <h1>Buy {name}</h1>
        <span>{selectedProduct ? "Choose only from configurations currently stored with this listing." : "Tell us what you prefer. The team will confirm the exact configuration and price before payment."}</span>
      </header>

      {error && !selectedProduct ? (
        <div className="buy-page-error">
          <strong>The Store catalogue is temporarily unavailable.</strong>
          <button className="experience-button experience-button-secondary" type="button" onClick={() => void refreshProducts()}>Retry</button>
        </div>
      ) : (
        <section className="buy-configurator">
          <BuyGallery
            name={name}
            gallery={gallery}
            activeImage={activeImage}
            onChange={setActiveImage}
            fallbackMedia={story?.designMedia ?? story?.media}
            darkStage={story?.theme === "ink"}
          />

          <div className="buy-options">
            <div className="buy-status-row">
              <span>{selectedProduct?.condition === "UK Used" ? "UK USED" : purchasable ? "IN STOCK" : "AVAILABLE ON REQUEST"}</span>
              {selectedProduct && <small>{selectedProduct.condition}</small>}
            </div>
            <h2>{name}</h2>
            <p className="buy-price">{priceLabel}</p>
            <p className="buy-confirmation">Availability and final details are confirmed by Buy & Sell GH before payment.</p>

            {candidates.length > 1 && (
              <fieldset className="buy-choice-group">
                <legend>Choose a listed model</legend>
                <div className="buy-model-options">
                  {candidates.map((product) => (
                    <button className={product.id === selectedProduct?.id ? "is-selected" : ""} type="button" key={product.id} onClick={() => setSelectedId(product.id)}>
                      <strong>{product.name}</strong>
                      <span>{product.priceOnRequest || product.price <= 0 ? "Contact for price" : formatGhs(product.price)}</span>
                    </button>
                  ))}
                </div>
              </fieldset>
            )}

            {selectedProduct ? (
              <>
                {selectedProduct.storage.length > 0 && (
                  <fieldset className="buy-choice-group">
                    <legend>Storage / option</legend>
                    <div className="buy-pill-options">
                      {selectedProduct.storage.map((option) => <button className={storage === option ? "is-selected" : ""} type="button" key={option} onClick={() => setStorage(option)}>{option}</button>)}
                    </div>
                  </fieldset>
                )}
                {selectedProduct.colors.length > 0 && (
                  <fieldset className="buy-choice-group">
                    <legend>Colour</legend>
                    <div className="buy-pill-options">
                      {selectedProduct.colors.map((option) => <button className={color === option ? "is-selected" : ""} type="button" key={option} onClick={() => setColor(option)}>{option}</button>)}
                    </div>
                  </fieldset>
                )}
              </>
            ) : (
              <div className="buy-preference-fields">
                <label>Preferred storage or configuration
                  <input value={preferredStorage} maxLength={80} onChange={(event) => setPreferredStorage(event.target.value)} placeholder="Optional preference" />
                </label>
                <label>Preferred colour or finish
                  <input value={preferredColor} maxLength={80} onChange={(event) => setPreferredColor(event.target.value)} placeholder="Optional preference" />
                </label>
                <p>These are preferences, not a stock promise. The team will confirm what is genuinely available.</p>
              </div>
            )}

            {notice && <p className="buy-notice" role="status">{notice}</p>}
            <div className="buy-primary-actions">
              {purchasable ? (
                <>
                  <button className="experience-button experience-button-primary" type="button" onClick={() => addSelectedToCart(false)}><ShoppingBag size={18} /> Add to cart</button>
                  <button className="experience-button experience-button-secondary" type="button" onClick={() => addSelectedToCart(true)}>Buy now</button>
                </>
              ) : (
                <Link className="experience-button experience-button-primary" to={preorderPath}>Check availability</Link>
              )}
              <a className="experience-button experience-button-secondary" href={enquiryHref} target="_blank" rel="noopener noreferrer"><MessageCircle size={18} /> Ask on WhatsApp</a>
            </div>

            <ul className="buy-assurance">
              <li><Check size={17} /> No fabricated stock or pricing</li>
              <li><Check size={17} /> Order details reviewed before payment</li>
              <li><Check size={17} /> Pickup and supported delivery confirmed directly</li>
            </ul>
          </div>
        </section>
      )}

      <section className="buy-support-band">
        <div><p>Need the product story?</p><h2>Explore before you configure.</h2></div>
        <Link className="experience-button experience-button-light" to={productStoryPath(family, slug)}>Learn more about {name}</Link>
      </section>
    </div>
  );
}

function BuyGallery({
  name,
  gallery,
  activeImage,
  onChange,
  fallbackMedia,
  darkStage,
}: {
  name: string;
  gallery: ProductImage[];
  activeImage: number;
  onChange: (index: number) => void;
  fallbackMedia?: { type: "image" | "video"; src: string; alt: string };
  darkStage?: boolean;
}) {
  const active = gallery[activeImage];
  const previous = () => onChange((activeImage - 1 + gallery.length) % gallery.length);
  const next = () => onChange((activeImage + 1) % gallery.length);

  return (
    <div className="buy-gallery">
      <div className={`buy-gallery-stage ${darkStage || fallbackMedia?.src.includes("clean-frame") ? "buy-gallery-stage-cinematic" : ""}`}>
        {active ? <img src={active.src} alt={active.alt} decoding="async" /> : fallbackMedia?.type === "video" ? (
          <><video muted playsInline preload="metadata" aria-label={fallbackMedia.alt} onLoadedMetadata={(event) => { event.currentTarget.pause(); event.currentTarget.currentTime = 1.15; }}><source src={fallbackMedia.src} type="video/mp4" /></video><span className="experience-source-mask" aria-hidden="true" /></>
        ) : fallbackMedia ? <img src={fallbackMedia.src} alt={fallbackMedia.alt} decoding="async" /> : <span>Image coming soon</span>}
        {gallery.length > 1 && (
          <div className="buy-gallery-arrows">
            <button type="button" aria-label="Previous product image" onClick={previous}><ChevronLeft /></button>
            <button type="button" aria-label="Next product image" onClick={next}><ChevronRight /></button>
          </div>
        )}
      </div>
      {gallery.length > 1 && (
        <div className="buy-gallery-thumbnails" aria-label={`${name} image thumbnails`}>
          {gallery.map((image, index) => (
            <button className={index === activeImage ? "is-selected" : ""} type="button" key={`${image.src}-${index}`} onClick={() => onChange(index)} aria-label={`Show ${name} image ${index + 1}`}>
              <img src={image.src} alt="" loading="lazy" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function resolveCandidates(products: Product[], family: ProductFamilyKey, slug: string) {
  const familyProducts = products.filter((product) => familyMatchesProduct(product, family));
  const exact = familyProducts.find((product) => product.slug === slug);
  if (exact) return [exact];
  if (family === "mac" && slug === "macbook-air") return familyProducts.filter((product) => getMacbookFamily(product) === "MacBook Air");
  if (family === "mac" && slug === "macbook-pro") return familyProducts.filter((product) => getMacbookFamily(product) === "MacBook Pro");
  if (family === "ipad" && slug === "ipad-air") return familyProducts.filter((product) => getIpadFamily(product) === "iPad Air");
  if (family === "watch" && slug.includes("ultra")) return familyProducts.filter((product) => getWatchFamily(product) === "Apple Watch Ultra");
  if (family === "watch" && slug.includes("series")) return familyProducts.filter((product) => getWatchFamily(product) === "Apple Watch Series");
  return [];
}

function humanizeSlug(slug: string) {
  return slug.split("-").map((part) => part ? `${part[0].toUpperCase()}${part.slice(1)}` : part).join(" ");
}
