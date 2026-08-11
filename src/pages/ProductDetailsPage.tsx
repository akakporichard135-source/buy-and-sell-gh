import { CheckCircle2, Link as LinkIcon, MessageCircle, Minus, Phone, Plus, Share2, ShoppingBag, Zap } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ProductGrid } from "../components/ProductGrid";
import { SEO } from "../components/SEO";
import { useProductCatalog } from "../catalog/ProductCatalogContext";
import { isProductUnavailable } from "../catalog/productCatalog";
import { business } from "../config/business";
import { useCart } from "../context/CartContext";
import type { Product } from "../types/product";
import { formatGhs } from "../utils/format";
import { getProductBadges, normalizeDisplayBadge, productBadgeClass } from "../utils/productPresentation";
import { resolveProductGallery, resolveProductImage } from "../utils/productImages";
import { productWhatsAppUrl } from "../utils/whatsapp";

const RECENTLY_VIEWED_KEY = "buyandsell-gh-recently-viewed";

export function ProductDetailsPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { activeProducts: products, getProductBySlug, loading, error, refreshProducts } = useProductCatalog();
  const product = getProductBySlug(slug ?? "");
  const { addItem } = useCart();
  const [storage, setStorage] = useState(product?.storage[0] ?? "");
  const [color, setColor] = useState(product?.colors[0] ?? "");
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const [pageUrl, setPageUrl] = useState("");
  const [recentSlugs, setRecentSlugs] = useState<string[]>([]);
  const [variantError, setVariantError] = useState("");

  const isSoldOut = product ? isProductUnavailable(product) : true;
  const related = useMemo(() => products.filter((item) => item.id !== product?.id && item.category === product?.category).slice(0, 3), [product, products]);
  const recentlyViewed = useMemo(() => {
    const viewedProducts = recentSlugs
      .map((item) => getProductBySlug(item))
      .filter((item): item is Product => Boolean(item));
    return viewedProducts.filter((item) => item.id !== product?.id).slice(0, 3);
  }, [getProductBySlug, product?.id, recentSlugs]);

  useEffect(() => {
    if (product) {
      setStorage(product.storage[0]);
      setColor(product.colors[0]);
      setQuantity(1);
      setActiveImage(0);
      setZoomed(false);
      setVariantError("");
      const currentUrl = window.location.href;
      setPageUrl(currentUrl);
      let saved: string[] = [];
      try {
        const parsed = JSON.parse(localStorage.getItem(RECENTLY_VIEWED_KEY) ?? "[]");
        saved = Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : [];
      } catch {
        localStorage.removeItem(RECENTLY_VIEWED_KEY);
      }
      setRecentSlugs(saved);
      const next = [product.slug, ...saved.filter((item) => item !== product.slug)].slice(0, 8);
      localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(next));
    }
  }, [product]);

  if (loading) {
    return <section className="page-hero"><h1>Loading product</h1><p>Please wait while the catalogue loads.</p></section>;
  }

  if (error) {
    return (
      <section className="page-hero">
        <h1>Catalogue unavailable</h1>
        <p>This product cannot be loaded right now. Please try again shortly.</p>
        <button className="btn-primary mt-6" type="button" onClick={() => void refreshProducts()}>Retry</button>
      </section>
    );
  }

  if (!product) {
    return (
      <section className="page-hero">
        <h1>Product not found</h1>
        <p>This device may have moved or is no longer listed.</p>
        <Link className="btn-primary mt-6" to="/shop">Back to shop</Link>
      </section>
    );
  }

  const gallery = resolveProductGallery(product);
  const active = gallery[activeImage] ?? resolveProductImage(product);
  const whatsappHref = productWhatsAppUrl(product, storage, color, pageUrl);
  const stockLabel = normalizeDisplayBadge(product.stockStatus);
  const isPriceOnRequest = product.priceOnRequest === true || product.price <= 0;
  const displayStockLabel = isPriceOnRequest ? "Availability To Confirm" : stockLabel;
  const primaryOptionLabel = product.category === "Apple Watches" ? "Connectivity" : "Storage";

  const handleAddToCart = () => {
    if (product.storage.length > 0 && !storage) {
      setVariantError("Choose a storage option before adding this device.");
      return;
    }
    if (product.colors.length > 0 && !color) {
      setVariantError("Choose a colour option before adding this device.");
      return;
    }
    if (quantity > product.stockQuantity) {
      setVariantError(`Only ${product.stockQuantity} available right now.`);
      return;
    }
    if (addItem(product, storage, color, quantity)) setVariantError("");
  };

  const handleBuyNow = () => {
    if (product.storage.length > 0 && !storage) {
      setVariantError("Choose a storage option before checkout.");
      return;
    }
    if (product.colors.length > 0 && !color) {
      setVariantError("Choose a colour option before checkout.");
      return;
    }
    if (quantity > product.stockQuantity) {
      setVariantError(`Only ${product.stockQuantity} available right now.`);
      return;
    }
    const added = addItem(product, storage, color, quantity);
    if (added) navigate("/cart");
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title: product.name, text: `View ${product.name} at Buy & Sell GH`, url: pageUrl });
        return;
      }
      await navigator.clipboard.writeText(pageUrl);
    } catch {
      setVariantError("Sharing is not available in this browser. Copy the page link from the address bar.");
    }
  };

  return (
    <>
      <SEO title={product.name} description={`${product.name} at Buy & Sell GH with price, storage, colour, condition, delivery and WhatsApp enquiry details.`} />
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Product",
          name: product.name,
          image: gallery.map((image) => image.src),
          brand: { "@type": "Brand", name: "Apple" },
          ...(isPriceOnRequest ? {} : { offers: {
            "@type": "Offer",
            priceCurrency: "GHS",
            price: product.price,
            availability: isSoldOut ? "https://schema.org/OutOfStock" : "https://schema.org/InStock",
          } }),
        })}
      </script>
      <section className="section product-detail-layout">
        <div className="product-gallery">
          <button className={`product-main-image ${zoomed ? "is-zoomed" : ""}`} type="button" onClick={() => setZoomed((current) => !current)} aria-label="Zoom product image">
            {active ? <img src={active.src} alt={active.alt} loading="eager" /> : <span className="product-gallery-empty">Product image unavailable</span>}
          </button>
          <div className="product-thumbnails" aria-label="Product image thumbnails">
            {gallery.map((image, index) => (
              <button className={index === activeImage ? "is-active" : ""} key={image.src} type="button" onClick={() => setActiveImage(index)} aria-label={`Show image ${index + 1}`}>
                <img src={image.src} alt={image.alt} loading="lazy" />
              </button>
            ))}
          </div>
        </div>
        <div className="product-buy-panel">
          <div className="flex flex-wrap gap-2">
            {getProductBadges(product, 5).map((badge) => (
              <span className={productBadgeClass(badge)} key={badge}>{badge}</span>
            ))}
          </div>
          <p className="eyebrow-dark mt-5">{product.category}</p>
          <h1 className="mt-3 text-4xl font-black text-ink sm:text-5xl">{product.name}</h1>
          <div className="mt-5 flex flex-wrap items-end gap-3">
            <p className="text-4xl font-black">{isPriceOnRequest ? "Contact for Price" : formatGhs(product.price)}</p>
            {!isPriceOnRequest && product.oldPrice && <p className="pb-1 font-bold text-ink/40 line-through">{formatGhs(product.oldPrice)}</p>}
          </div>
          <p className="mt-2 text-sm font-bold text-ink/58">Confirm availability and final details before payment.</p>

          <div className="mt-6 grid gap-2 text-sm font-bold text-ink/75 sm:grid-cols-2">
            <span><CheckCircle2 size={17} /> Condition: {product.condition}</span>
            <span><CheckCircle2 size={17} /> Stock: {displayStockLabel}</span>
            <span><CheckCircle2 size={17} /> Battery health: {product.batteryHealth ?? "Confirm selected unit"}</span>
            <span><CheckCircle2 size={17} /> Face ID: {product.faceIdStatus ?? "Confirm selected unit"}</span>
            <span><CheckCircle2 size={17} /> SIM: {product.simStatus ?? "Confirm selected unit"}</span>
            <span><CheckCircle2 size={17} /> Pickup: {business.location}</span>
          </div>

          <div className="mt-7 grid gap-5 sm:grid-cols-2">
            <label className="choice-label">{primaryOptionLabel}
              <select value={storage} required onChange={(e) => setStorage(e.target.value)}>{product.storage.map((item) => <option key={item}>{item}</option>)}</select>
            </label>
            <label className="choice-label">Colour
              <select value={color} required onChange={(e) => setColor(e.target.value)}>{product.colors.map((item) => <option key={item}>{item}</option>)}</select>
            </label>
          </div>
          {variantError && <p className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-bold text-red-700">{variantError}</p>}

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <div className="quantity-stepper" aria-label="Quantity selector">
              <button type="button" aria-label="Decrease quantity" disabled={isSoldOut} onClick={() => setQuantity((value) => Math.max(1, value - 1))}><Minus size={17} /></button>
              <span>{quantity}</span>
              <button type="button" aria-label="Increase quantity" disabled={isSoldOut} onClick={() => setQuantity((value) => Math.min(product.stockQuantity, value + 1))}><Plus size={17} /></button>
            </div>
            <button className="btn-primary disabled:cursor-not-allowed disabled:opacity-45" type="button" disabled={isSoldOut} onClick={handleAddToCart}><ShoppingBag size={18} /> {isPriceOnRequest ? "Contact for Price" : "Add to Cart"}</button>
            <button className="btn-secondary disabled:cursor-not-allowed disabled:opacity-45" type="button" disabled={isSoldOut} onClick={handleBuyNow}>{isPriceOnRequest ? "Inventory Pending" : "Buy Now"}</button>
            <a className="btn-secondary" href={whatsappHref} target="_blank" rel="noreferrer"><Zap size={18} /> Confirm Availability</a>
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            <a className="btn-ghost" href={whatsappHref} target="_blank" rel="noreferrer"><MessageCircle size={18} /> WhatsApp Enquiry</a>
            <a className="btn-secondary" href={`tel:${business.whatsapp.primary}`}><Phone size={18} /> Call Shop</a>
            <button className="btn-secondary" type="button" onClick={handleShare}><Share2 size={18} /> Share Product</button>
          </div>
        </div>
      </section>

      <section className="section grid gap-5 lg:grid-cols-3">
        <InfoBlock title="Product description" items={[product.description]} />
        <InfoBlock title="Key specifications" items={product.specifications ?? product.specs} />
        <InfoBlock title="Device condition report" items={product.conditionReport ?? ["Condition details are confirmed before payment."]} />
        <InfoBlock title="What is included" items={product.includedItems ?? product.box} />
        <InfoBlock title="Warranty information" items={[product.warranty ?? product.warrantyInfo ?? "Contact the shop to confirm warranty for this device."]} />
        <InfoBlock title="Delivery and pickup" items={[product.deliveryInfo ?? product.deliveryNote ?? `Pickup at ${business.location}. Delivery options are confirmed on WhatsApp.`]} />
      </section>

      <section className="section">
        <div className="section-heading"><p className="eyebrow-dark">Related products</p><h2>You may also like</h2></div>
        <ProductGrid products={related.length ? related : products.slice(0, 3)} />
      </section>
      {recentlyViewed.length > 0 && (
        <section className="section">
          <div className="section-heading"><p className="eyebrow-dark">Recently viewed</p><h2>Recently Viewed Products</h2></div>
          <ProductGrid products={recentlyViewed} />
        </section>
      )}
      <div className="product-sticky-spacer" aria-hidden="true" />
      <div className="sticky-product-actions">
        <div className="sticky-product-price">
          <span>{isPriceOnRequest ? "Contact for Price" : formatGhs(product.price)}</span>
          <small>{displayStockLabel}</small>
        </div>
        <a className="btn-ghost" href={whatsappHref} target="_blank" rel="noreferrer"><MessageCircle size={17} /> WhatsApp</a>
      </div>
    </>
  );
}

function InfoBlock({ title, items }: { title: string; items: string[] }) {
  return (
    <article className="rounded-lg border border-black/7 bg-white p-6 shadow-card">
      <h2 className="text-xl font-black">{title}</h2>
      <ul className="mt-4 grid gap-3 text-base leading-7 text-ink/70">
        {items.map((item) => <li key={item}>- {item}</li>)}
      </ul>
    </article>
  );
}
