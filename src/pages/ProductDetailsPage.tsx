import { ArrowRight, CheckCircle2, MessageCircle, Minus, Phone, Plus, Share2, ShoppingBag, Sparkles, Zap } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ProductGrid } from "../components/ProductGrid";
import { SEO } from "../components/SEO";
import { useProductCatalog } from "../catalog/ProductCatalogContext";
import { isProductImageEligible, isProductUnavailable } from "../catalog/productCatalog";
import { productBuyPath, type ProductFamilyKey } from "../catalog/productExperience";
import { business } from "../config/business";
import { useBuyJourney } from "../context/BuyJourneyContext";
import { useCart } from "../context/CartContext";
import type { Product } from "../types/product";
import { formatGhs } from "../utils/format";
import { resolveConfiguredPrice } from "../utils/productPricing";
import { getMacbookGeneration, getProductBadges, productBadgeClass } from "../utils/productPresentation";
import { preloadProductImages } from "../utils/productColorImages";
import { resolveColorGallery } from "../utils/productColorGallery";
import { resolveColorOptions } from "../utils/productColors";
import { getSelectableStorageOptions } from "../utils/variantSelection";
import { hasOwnerUploadedProductImages, resolveProductGallery, resolveProductImage } from "../utils/productImages";
import { productWhatsAppUrl } from "../utils/whatsapp";
import { SwipeableProductGallery } from "../components/buy/SwipeableProductGallery";
import { BuyColorSwatches } from "../components/buy/BuyPrimitives";
import { getPublishedBuyGallerySync, useBuyGallery } from "../cms/buyGalleryRepository";

const RECENTLY_VIEWED_KEY = "buyandsell-gh-recently-viewed";

function hasVerifiedDetail(value?: string | null): boolean {
  if (!value) return false;
  const trimmed = value.trim();
  if (!trimmed) return false;
  const lower = trimmed.toLowerCase();
  if (
    lower.includes("contact the shop to confirm") ||
    lower.includes("confirm on whatsapp") ||
    lower.includes("not specified") ||
    lower.includes("confirm before payment") ||
    lower === "null" ||
    lower === "undefined"
  ) {
    return false;
  }
  return true;
}

export function ProductDetailsPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { activeProducts: products, getProductBySlug, loading, error, refreshProducts } = useProductCatalog();
  const product = getProductBySlug(slug ?? "");
  const { addItem } = useCart();
  const { setQuantity: setBuyQuantity, openBag } = useBuyJourney();

  const selectableStorageOptions = useMemo(() => getSelectableStorageOptions(product), [product]);
  const colorOptions = useMemo(() => resolveColorOptions(product?.colors ?? []), [product?.colors]);

  const [storage, setStorage] = useState(selectableStorageOptions[0] ?? "");
  const [color, setColor] = useState(product?.colors[0] ?? "");
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [pageUrl, setPageUrl] = useState("");
  const [recentSlugs, setRecentSlugs] = useState<string[]>([]);
  const [variantError, setVariantError] = useState("");
  const [bagNotice, setBagNotice] = useState("");

  const configured = useMemo(
    () => resolveConfiguredPrice(product, { storage, color }),
    [product, storage, color]
  );

  const stockQuantity = Math.max(0, configured.effectiveStock || product?.stockQuantity || 0);
  const hasConfirmedStock =
    Boolean(product) &&
    (product?.stockQuantity ?? 0) > 0 &&
    (product?.stockStatus === "In Stock" || product?.stockStatus === "Low Stock") &&
    product?.available !== false;
  const isSoldOut = product ? (!hasConfirmedStock || isProductUnavailable(product)) : true;
  const canBuySelection = Boolean(product && !isSoldOut && configured.purchasable && !configured.isEnquiry);

  const related = useMemo(
    () =>
      products
        .filter(
          (item) =>
            item.id !== product?.id &&
            item.slug !== product?.slug &&
            item.category === product?.category
        )
        .slice(0, 3),
    [product, products]
  );
  const fallbackRelated = useMemo(
    () =>
      products
        .filter(
          (item) =>
            item.id !== product?.id &&
            item.slug !== product?.slug &&
            isProductImageEligible(item)
        )
        .slice(0, 3),
    [product, products]
  );
  const recentlyViewed = useMemo(() => {
    const viewedProducts = recentSlugs
      .map((item) => getProductBySlug(item))
      .filter((item): item is Product => Boolean(item && isProductImageEligible(item)));
    return viewedProducts
      .filter((item) => item.id !== product?.id && item.slug !== product?.slug)
      .slice(0, 3);
  }, [getProductBySlug, product?.id, product?.slug, recentSlugs]);

  useEffect(() => {
    if (product) {
      const nextStorages = getSelectableStorageOptions(product);
      setStorage(nextStorages[0] ?? "");
      setColor(product.colors[0] ?? "");
      setQuantity(1);
      setActiveImage(0);
      setVariantError("");
      setBagNotice("");
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
  }, [product?.id]);

  // Reset active thumbnail to 0 whenever selected colour changes
  useEffect(() => {
    setActiveImage(0);
  }, [color]);

  // Preload colour-variant gallery primary images for instant swatch switching
  useEffect(() => {
    if (!product || colorOptions.length <= 1) return;
    const published = getPublishedBuyGallerySync(product.slug);
    const urls = colorOptions.flatMap((opt) => {
      const resolved = resolveColorGallery({
        product,
        slug: product.slug,
        selectedColor: opt.name,
        publishedGallery: published,
      });
      return resolved.images.slice(0, 2).map((img) => img.src);
    });
    preloadProductImages(urls);
  }, [product, colorOptions]);

  const baseGallery = useMemo(() => {
    if (!product) return [];
    const resolved = resolveProductGallery(product);
    if (resolved.length > 1) {
      const genuinePhotos = resolved.filter((img) => !img.src.includes("/campaigns-"));
      const flyerPhotos = resolved.filter((img) => img.src.includes("/campaigns-"));
      if (genuinePhotos.length > 0) return [...genuinePhotos, ...flyerPhotos];
    }
    return resolved;
  }, [product]);

  const {
    images: gallery,
    mainImage: primaryColorImage,
    colorVariantId,
  } = useBuyGallery(product, color, product?.slug, undefined, baseGallery);

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
        <h1>Product not listed</h1>
        <p>This item is currently not available in our visible catalogue.</p>
        <Link className="btn-primary mt-6" to="/shop">Back to shop</Link>
      </section>
    );
  }

  const active = gallery[activeImage] ?? primaryColorImage ?? resolveProductImage(product);
  const selectedColorImage = primaryColorImage?.src ?? active?.src;
  const whatsappHref = productWhatsAppUrl(product, storage, color, pageUrl, configured.price, selectedColorImage);
  const studioFamily = getProductFamilyKey(product);
  const studioBuyPath = studioFamily ? productBuyPath(studioFamily, product.slug) : null;
  const isPriceOnRequest = configured.isEnquiry;
  const currentPriceLabel = configured.formattedPrice;
  const oldPriceLabel = configured.formattedPreviousPrice ?? (!isPriceOnRequest && product.oldPrice ? formatGhs(product.oldPrice) : undefined);
  const displayStockLabel = isPriceOnRequest
    ? "Availability To Confirm"
    : hasConfirmedStock
    ? (stockQuantity === 1 ? "In Stock (1 available)" : `In Stock (${stockQuantity} available)`)
    : "Out of Stock";
  const primaryOptionLabel = product.category === "Apple Watches" || product.category === "Watches"
    ? "Connectivity"
    : product.category === "AirPods" || product.category === "Audio"
      ? "Case / Connector"
      : product.category === "Accessories"
        ? "Connector / Option"
        : product.category === "Game Consoles"
          ? "Edition / Storage"
        : "Storage";

  const hasMultipleStorage = selectableStorageOptions.length > 1;
  const hasMultipleColors = colorOptions.length > 1;
  const showOptionSelectors = hasMultipleStorage || hasMultipleColors;

  const isMacbook = product.category === "MacBooks" || product.category === "Laptops";
  const isAirpods = product.category === "AirPods";
  const isAccessory = product.category === "Accessories";
  const isApplePhone = product.brand === "Apple" && (product.category === "iPhones" || product.category === "Phones");
  const macbookMemory = (product.specifications ?? product.specs).find((item) => item.startsWith("Memory options:"))?.replace("Memory options:", "").trim();
  const accessorySpecifications = product.specifications ?? product.specs;
  const accessoryConnector = accessorySpecifications.find((item) => item.startsWith("Connector:"))?.replace("Connector:", "").trim();
  const accessoryPower = accessorySpecifications.find((item) => item.startsWith("Wattage:"))?.replace("Wattage:", "").trim();
  const accessoryCompatibility = accessorySpecifications.find((item) => item.startsWith("Compatibility:"))?.replace("Compatibility:", "").trim();

  const validateAndAdd = (): boolean => {
    setVariantError("");
    setBagNotice("");
    if (hasMultipleStorage && !storage) {
      setVariantError("Choose an option before continuing.");
      return false;
    }
    if (hasMultipleColors && !color) {
      setVariantError("Choose a colour option before continuing.");
      return false;
    }
    if (!configured.purchasable) {
      setVariantError(configured.errorMessage || "The selected configuration is currently unavailable.");
      return false;
    }
    const maxQty = Math.max(1, configured.effectiveStock || product.stockQuantity);
    if (quantity > maxQty) {
      setVariantError(`Only ${maxQty} available right now.`);
      return false;
    }

    setBuyQuantity(quantity);
    const selectedStorage = storage || (selectableStorageOptions[0] ?? "Standard");
    const selectedColor = color || (product.colors?.[0] ?? "Standard");

    const added = addItem(
      product,
      selectedStorage,
      selectedColor,
      quantity,
      configured.variant,
      selectedColorImage,
      {
        storage: selectedStorage,
        color: selectedColor,
      }
    );
    if (!added) {
      setVariantError(configured.errorMessage || "Unable to add the selected configuration to your bag.");
      return false;
    }
    return true;
  };

  const handleBuyNow = () => {
    if (validateAndAdd()) {
      navigate("/checkout");
    }
  };

  const handleAddToBag = () => {
    if (validateAndAdd()) {
      setBagNotice(`${product.name}${storage ? ` (${storage})` : ""}${color ? ` — ${color}` : ""} added to your bag.`);
      openBag();
    }
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

  const maxStepperStock = Math.max(1, configured.effectiveStock || product.stockQuantity);

  return (
    <>
      <SEO title={product.name} description={`${product.name} at Buy & Sell GH with price, storage, colour, condition, delivery and WhatsApp enquiry details.`} />
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Product",
          name: product.name,
          image: gallery.map((image) => image.src),
          brand: { "@type": "Brand", name: product.brand },
          ...(isPriceOnRequest ? {} : { offers: {
            "@type": "Offer",
            priceCurrency: "GHS",
            price: configured.price || product.price,
            availability: isSoldOut ? "https://schema.org/OutOfStock" : "https://schema.org/InStock",
          } }),
        })}
      </script>
      <section
        className="section product-detail-layout"
        style={{
          paddingTop: "clamp(1.5rem, 3vw, 2.75rem)",
          scrollMarginTop: "calc(var(--global-header-height, 44px) + 24px)",
        }}
      >
        <div className="product-gallery">
          <SwipeableProductGallery
            images={gallery}
            activeIndex={activeImage}
            onSelectIndex={setActiveImage}
            productName={product.name}
            activeColorKey={colorVariantId}
            activeColorLabel={color || undefined}
          />
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
            <p className="text-4xl font-black">{currentPriceLabel}</p>
            {oldPriceLabel && <p className="pb-1 font-bold text-ink/40 line-through">{oldPriceLabel}</p>}
          </div>
          <p className="mt-2 text-sm font-bold text-ink/58">Confirm availability and final details before payment.</p>

          <div className="mt-6 grid gap-2 text-sm font-bold text-ink/75 sm:grid-cols-2">
            <span><CheckCircle2 size={17} /> Condition: {product.condition}</span>
            <span><CheckCircle2 size={17} /> Stock: {displayStockLabel}</span>
            {isMacbook ? (
              <>
                <span><CheckCircle2 size={17} /> Chip: {getMacbookGeneration(product)}</span>
                <span><CheckCircle2 size={17} /> Memory: {macbookMemory ?? "Confirm configuration"}</span>
                <span><CheckCircle2 size={17} /> Configuration: Confirm before payment</span>
              </>
            ) : isAirpods ? (
              <>
                <span><CheckCircle2 size={17} /> Model: {product.generation ?? "Generation not specified"}</span>
                <span><CheckCircle2 size={17} /> Case / Connector: {storage || selectableStorageOptions[0] || "Confirm configuration"}</span>
                <span><CheckCircle2 size={17} /> Audio features: See verified specifications below</span>
              </>
            ) : isAccessory ? (
              <>
                <span><CheckCircle2 size={17} /> Accessory family: {product.subcategory ?? "Apple Accessories"}</span>
                <span><CheckCircle2 size={17} /> Connector: {accessoryConnector ?? storage ?? selectableStorageOptions[0] ?? "Confirm option"}</span>
                {accessoryPower && <span><CheckCircle2 size={17} /> Power: {accessoryPower}</span>}
                <span><CheckCircle2 size={17} /> Compatibility: {accessoryCompatibility ?? "Confirm before payment"}</span>
              </>
            ) : isApplePhone ? (
              <>
                <span><CheckCircle2 size={17} /> Battery health: {product.batteryHealth ?? "Confirm selected unit"}</span>
                <span><CheckCircle2 size={17} /> Face ID: {product.faceIdStatus ?? "Confirm selected unit"}</span>
                <span><CheckCircle2 size={17} /> SIM: {product.simStatus ?? "Confirm selected unit"}</span>
              </>
            ) : (
              <>
                <span><CheckCircle2 size={17} /> Brand: {product.brand}</span>
                <span><CheckCircle2 size={17} /> Model: {product.model}</span>
                <span><CheckCircle2 size={17} /> Configuration: {storage || selectableStorageOptions[0] || "Confirm before payment"}</span>
              </>
            )}
            <span><CheckCircle2 size={17} /> Pickup: {business.location}</span>
          </div>

          {showOptionSelectors && (
            <div className="mt-7 grid gap-5">
              {hasMultipleStorage && (
                <label className="choice-label">{primaryOptionLabel}
                  <select
                    value={storage}
                    required
                    onChange={(e) => {
                      setStorage(e.target.value);
                      setVariantError("");
                      setBagNotice("");
                    }}
                  >
                    {selectableStorageOptions.map((item) => <option key={item} value={item}>{item}</option>)}
                  </select>
                </label>
              )}
              {hasMultipleColors && (
                <div>
                  <BuyColorSwatches
                    colors={colorOptions}
                    selectedColor={color}
                    labelPrefix="Colour"
                    productSlug={product.slug}
                    onSelect={(selectedFinish) => {
                      setColor(selectedFinish);
                      setActiveImage(0);
                      setVariantError("");
                      setBagNotice("");
                    }}
                  />
                </div>
              )}
            </div>
          )}

          {!isSoldOut && !isPriceOnRequest && !configured.purchasable && configured.errorMessage && (
            <p role="alert" className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm font-bold text-amber-800">
              {configured.errorMessage}
            </p>
          )}
          {variantError && <p role="alert" className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-bold text-red-700">{variantError}</p>}
          {bagNotice && <p className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm font-bold text-emerald-800">{bagNotice}</p>}

          <div className="mt-7 flex flex-wrap items-center gap-3">
            {hasConfirmedStock && maxStepperStock > 1 && (
              <div className="quantity-stepper" aria-label="Quantity selector">
                <button
                  type="button"
                  aria-label="Decrease quantity"
                  disabled={!canBuySelection}
                  onClick={() => setQuantity((value) => Math.max(1, value - 1))}
                >
                  <Minus size={17} />
                </button>
                <span>{quantity}</span>
                <button
                  type="button"
                  aria-label="Increase quantity"
                  disabled={!canBuySelection}
                  onClick={() => setQuantity((value) => Math.min(maxStepperStock, value + 1))}
                >
                  <Plus size={17} />
                </button>
              </div>
            )}
            <button
              className="btn-primary disabled:cursor-not-allowed disabled:opacity-45"
              type="button"
              aria-label={isSoldOut ? "Sold Out" : isPriceOnRequest ? "Availability To Confirm" : "Buy Now"}
              disabled={!canBuySelection}
              onClick={handleBuyNow}
            >
              <ShoppingBag size={18} /> {isSoldOut ? "Sold Out" : isPriceOnRequest ? "Availability To Confirm" : "Buy Now"}
            </button>
            {canBuySelection && (
              <button
                className="btn-secondary"
                type="button"
                aria-label="Add to Bag"
                onClick={handleAddToBag}
              >
                <ShoppingBag size={18} /> Add to Bag
              </button>
            )}
            {isPriceOnRequest && (
              <a className="btn-secondary" href={whatsappHref} target="_blank" rel="noopener noreferrer">
                <Zap size={18} /> Confirm Availability
              </a>
            )}
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <a className="btn-secondary" href={`tel:+${business.whatsapp.primary.replace(/^\+/, "")}`}><Phone size={18} /> Call Shop</a>
            <button className="btn-secondary" type="button" onClick={handleShare}><Share2 size={18} /> Share Product</button>
          </div>
          <div className="product-purchase-assurance" aria-label="Ordering reassurance">
            <span><CheckCircle2 size={16} /> Order request reviewed before payment</span>
            <span><MessageCircle size={16} /> WhatsApp support for final details</span>
            {hasOwnerUploadedProductImages(product) && <span><CheckCircle2 size={16} /> Photos show the listed device</span>}
          </div>
          {studioBuyPath && (
            <div className="mt-5 rounded-xl border border-black/10 bg-gradient-to-r from-zinc-900 via-neutral-900 to-black p-4 text-white shadow-card">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-white/10 text-gold-light">
                    <Sparkles size={20} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold tracking-tight text-white">Interactive Device Studio</h4>
                    <p className="text-xs text-white/70">Customise finishes, storage & instant trade-in value</p>
                  </div>
                </div>
                <Link
                  to={studioBuyPath}
                  className="inline-flex items-center justify-center gap-1.5 rounded-full bg-white px-4 py-2 text-xs font-bold text-ink transition hover:bg-gold hover:text-black whitespace-nowrap"
                >
                  Configure in Studio <ArrowRight size={13} />
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="section grid gap-5 lg:grid-cols-3">
        {product.description && <InfoBlock title="Product description" items={[product.description]} />}
        {(product.specifications ?? product.specs)?.length > 0 && (
          <InfoBlock title="Key specifications" items={product.specifications ?? product.specs} />
        )}
        {(product.includedItems ?? product.box)?.length > 0 && (
          <InfoBlock title="What is included" items={product.includedItems ?? product.box} />
        )}
        {product.conditionReport?.length ? (
          <InfoBlock title={isAccessory ? "Condition and compatibility" : "Device condition report"} items={product.conditionReport} />
        ) : null}
        {hasVerifiedDetail(product.warranty || product.warrantyInfo) && (
          <InfoBlock title="Warranty information" items={[product.warranty || product.warrantyInfo!]} />
        )}
        {hasVerifiedDetail(product.deliveryInfo || product.deliveryNote) && (
          <InfoBlock title="Delivery and pickup" items={[product.deliveryInfo || product.deliveryNote!]} />
        )}
      </section>

      <section className="section">
        <div className="section-heading"><p className="eyebrow-dark">Related products</p><h2>You may also like</h2></div>
        <ProductGrid products={related.length ? related : fallbackRelated} />
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
          <span>{currentPriceLabel}</span>
          <small>{displayStockLabel}</small>
        </div>
        <div className="flex items-center justify-end gap-2">
          <button
            className="btn-primary !py-2.5 !px-3.5 text-sm flex items-center gap-1.5 whitespace-nowrap disabled:cursor-not-allowed disabled:opacity-45"
            type="button"
            disabled={!canBuySelection}
            onClick={handleBuyNow}
          >
            <ShoppingBag size={15} />
            <span>{isSoldOut ? "Sold Out" : "Buy Now"}</span>
          </button>
          <a
            className="btn-ghost !py-2.5 !px-3 text-sm flex items-center gap-1.5 whitespace-nowrap"
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Enquire on WhatsApp"
          >
            <MessageCircle size={15} />
            <span className="hidden xs:inline">WhatsApp</span>
          </a>
        </div>
      </div>
    </>
  );
}

function getProductFamilyKey(product: Product): ProductFamilyKey | null {
  if (product.category === "iPhones" || (product.brand === "Apple" && (product.category === "Phones" || product.name.toLowerCase().includes("iphone")))) return "iphone";
  if (product.category === "MacBooks" || (product.brand === "Apple" && (product.category === "Laptops" || product.name.toLowerCase().includes("macbook") || product.name.toLowerCase().includes("mac mini")))) return "mac";
  if (product.category === "iPads" || (product.brand === "Apple" && (product.category === "Tablets" || product.name.toLowerCase().includes("ipad")))) return "ipad";
  if (product.category === "Apple Watches" || (product.brand === "Apple" && (product.category === "Watches" || product.name.toLowerCase().includes("watch")))) return "watch";
  if (product.category === "AirPods" || (product.brand === "Apple" && (product.category === "Audio" || product.name.toLowerCase().includes("airpod")))) return "airpods";
  if (product.category === "Accessories") return "accessories";
  return null;
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
