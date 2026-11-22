import React, { useState, useEffect, useMemo } from "react";
import { SEO } from "../SEO";
import { useBuyJourney } from "../../context/BuyJourneyContext";
import { formatGhs } from "../../utils/format";
import { resolveConfiguredPrice, calculateTradeInBreakdown } from "../../utils/productPricing";
import { ProductPromotionalBadge } from "../promotions/ProductPromotionalBadge";
import { whatsappUrl, productWhatsAppUrl, toAbsoluteProductImageUrl } from "../../utils/whatsapp";
import { isProductOrderable } from "../../catalog/productCatalog";
import { getPublicPurchaseAction } from "../../catalog/productPurchaseAction";
import { isUsedProductCondition } from "../../utils/productImages";
import { localCatalogueImageBySlug, missingCleanAccessoryImageSlugs } from "../../utils/catalogueProductImages";
import { resolveColorOptions } from "../../utils/productColors";
import { preloadProductImages } from "../../utils/productColorImages";
import { resolveColorGallery } from "../../utils/productColorGallery";
import { getSelectableStorageOptions, normalizeSpecToken } from "../../utils/variantSelection";
import { getPublishedBuyGallerySync, useBuyGallery } from "../../cms/buyGalleryRepository";
import {
  BuyLayout,
  BuyOptionCard,
  BuyColorSwatches,
  BuyTradeInStep,
  BuySummaryCard,
  useBuyEntrySelection,
} from "./BuyPrimitives";
import type { Product } from "../../types/product";
import type { ProductFamilyKey } from "../../catalog/productExperience";

export function GenericBuyExperience({
  product,
  family,
  slug,
}: {
  product?: Product;
  family: ProductFamilyKey;
  slug: string;
}) {
  const { addConfiguredItem, editingItem, customer } = useBuyJourney();
  const { storage: entryStorage, color: entryColor } = useBuyEntrySelection();

  const effectiveProduct: Product | undefined = useMemo(() => {
    if (slug === "airpods-pro-3") {
      return {
        ...(product ?? {
          id: "airpods-pro-3",
          slug: "airpods-pro-3",
          name: "AirPods Pro 3",
          model: "AirPods Pro 3",
          brand: "Apple",
          category: "AirPods",
          description: "AirPods Pro 3 with H3 chip, 2x Active Noise Cancellation, heart-rate sensing, and USB-C MagSafe Charging Case.",
          specs: ["H3 Headphone Chip", "Active Noise Cancellation", "Adaptive Audio", "Heart-Rate Sensing", "MagSafe Charging Case (USB-C)"],
          box: ["AirPods Pro 3", "MagSafe Charging Case (USB-C)", "Silicone Ear Tips (4 sizes)", "USB-C Charge Cable"],
          imageTone: "light",
        }),
        price: product && product.price > 0 ? product.price : 3600,
        condition: "Brand New",
        storage: product?.storage?.length ? product.storage : ["USB-C MagSafe Case"],
        colors: product?.colors?.length ? product.colors : ["White"],
        images: product?.images?.length ? product.images : [{ src: "/products/story/airpods-pro-3-apple.jpg", alt: "AirPods Pro 3" }],
        available: product?.available ?? false,
        stockStatus: product?.stockStatus ?? "Out of Stock",
        stockQuantity: product?.stockQuantity ?? 0,
        priceOnRequest: product?.priceOnRequest ?? true,
      };
    }
    if (slug === "charging-and-power" && !product) {
      return {
        id: "apple-magsafe-charger",
        slug: "apple-magsafe-charger",
        name: "Apple MagSafe Charger",
        model: "Apple MagSafe Charger",
        brand: "Apple",
        category: "Accessories",
        subcategory: "Charging & Power",
        description: "Apple MagSafe Charger with integrated 1m braided USB-C cable for fast magnetic wireless charging.",
        specs: ["Connector: USB-C", "Cable length: 1 metre", "Fast wireless charging up to 25W"],
        box: ["MagSafe Charger with integrated 1m USB-C cable"],
        imageTone: "light",
        price: 650,
        condition: "Brand New",
        storage: ["USB-C / 1m"],
        colors: ["White"],
        images: [{ src: "/products/campaigns/accessory-magsafe-puck.webp", alt: "Apple MagSafe Charger" }],
        available: false,
        stockStatus: "Out of Stock",
        stockQuantity: 0,
        priceOnRequest: true,
      };
    }
    return product;
  }, [product, slug]);

  const storageOptions = useMemo(() => getSelectableStorageOptions(effectiveProduct), [effectiveProduct]);
  const colorOptions = useMemo(() => resolveColorOptions(effectiveProduct?.colors ?? []), [effectiveProduct?.colors]);

  const [storage, setStorage] = useState(storageOptions[0] ?? "");
  const [color, setColor] = useState(effectiveProduct?.colors?.[0] ?? "");
  const [tradeIn, setTradeIn] = useState(false);
  const [activeThumb, setActiveThumb] = useState(0);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    if (entryStorage && storageOptions.some((opt) => normalizeSpecToken(opt) === normalizeSpecToken(entryStorage))) {
      const matched = storageOptions.find((opt) => normalizeSpecToken(opt) === normalizeSpecToken(entryStorage));
      if (matched) setStorage(matched);
    }
    if (entryColor && effectiveProduct?.colors?.includes(entryColor)) setColor(entryColor);
  }, [entryStorage, entryColor, effectiveProduct?.slug, storageOptions]);

  useEffect(() => {
    if (!effectiveProduct) return;
    if (storageOptions.length > 0 && (!storage || !storageOptions.some((opt) => normalizeSpecToken(opt) === normalizeSpecToken(storage)))) {
      setStorage(storageOptions[0]);
    }
    if (effectiveProduct.colors && effectiveProduct.colors.length > 0 && (!color || !effectiveProduct.colors.includes(color))) {
      setColor(effectiveProduct.colors[0]);
    }
  }, [effectiveProduct, storageOptions]);

  useEffect(() => {
    if (!editingItem || editingItem.product.slug !== effectiveProduct?.slug) return;
    setStorage(editingItem.storage);
    setColor(editingItem.color);
    setTradeIn(editingItem.options?.tradeIn === "Yes");
  }, [editingItem, effectiveProduct?.slug]);

  // Reset gallery index to 0 whenever selected colour changes
  useEffect(() => {
    setActiveThumb(0);
  }, [color]);

  const name = effectiveProduct?.name ?? slug.split("-").map((s) => (s ? `${s[0].toUpperCase()}${s.slice(1)}` : s)).join(" ");
  const missingCleanImage = missingCleanAccessoryImageSlugs.has(effectiveProduct?.slug ?? slug);
  const canUseCatalogueImage = (!effectiveProduct || !isUsedProductCondition(effectiveProduct.condition)) && !missingCleanImage;
  const fallbackAsset = canUseCatalogueImage ? localCatalogueImageBySlug[effectiveProduct?.slug ?? slug] : undefined;
  const fallbackImages = useMemo(
    () => (fallbackAsset ? [{ src: fallbackAsset, alt: name }] : []),
    [fallbackAsset, name]
  );

  // Preload all colour variant galleries so clicking swatches switches instantly
  useEffect(() => {
    if (!effectiveProduct || colorOptions.length === 0) return;
    const published = getPublishedBuyGallerySync(effectiveProduct.slug || slug);
    const urls = colorOptions.flatMap((c) =>
      resolveColorGallery({
        product: effectiveProduct,
        slug: effectiveProduct.slug || slug,
        selectedColor: c.name,
        publishedGallery: published,
        fallbackImages,
      }).images.slice(0, 2).map((img) => img.src)
    );
    preloadProductImages(urls);
  }, [effectiveProduct, slug, colorOptions, fallbackImages]);

  // Strict Apple-style colour-to-gallery resolution (zero cross-colour image mixing)
  const {
    images: gallery,
    mainImage: colorMainImage,
    colorVariantId,
  } = useBuyGallery(effectiveProduct, color, slug, undefined, fallbackImages);

  const activeImage = gallery[activeThumb]?.src || colorMainImage?.src || fallbackAsset;
  const selectedFinishImage = colorMainImage?.src || activeImage;

  const configured = resolveConfiguredPrice(effectiveProduct, { storage, color });
  const productCanBuy = effectiveProduct
    ? isProductOrderable(effectiveProduct) && getPublicPurchaseAction(effectiveProduct) === "buy"
    : false;
  const purchasable = Boolean(effectiveProduct && productCanBuy && configured.purchasable && configured.price > 0);
  const unavailableVariantWarning =
    productCanBuy && !configured.purchasable && configured.errorMessage
      ? configured.errorMessage
      : undefined;

  const priceLabel = configured.price > 0
    ? configured.formattedPrice
    : effectiveProduct && !effectiveProduct.priceOnRequest && effectiveProduct.price > 0
    ? formatGhs(effectiveProduct.price)
    : "Price confirmed on enquiry";
  const previousPriceLabel = configured.formattedPreviousPrice;
  const tradeInBreakdown = calculateTradeInBreakdown(configured.price, tradeIn);

  const whatsAppEnquiry = effectiveProduct
    ? productWhatsAppUrl(effectiveProduct, storage || "Standard", color || "Standard", undefined, configured.price, selectedFinishImage)
    : whatsappUrl(
        `Hello Buy & Sell GH, I would like to enquire about ${name}. Storage: ${storage}, Finish: ${color}, Fulfillment: ${
          customer.fulfilmentType === "pickup" ? "Pickup (Dome)" : "Delivery"
        }.${selectedFinishImage ? ` Product photo: ${toAbsoluteProductImageUrl(selectedFinishImage)}` : ""} Please confirm availability and price.`
      );

  const handleAddToBag = () => {
    if (effectiveProduct && purchasable) {
      const added = addConfiguredItem(
        effectiveProduct,
        storage || "Standard",
        color || "Standard",
        configured.variant,
        selectedFinishImage,
        {
          storage: storage || "Standard",
          color: color || "Standard",
          tradeIn: tradeIn ? "Yes" : "No",
        }
      );
      if (added) {
        setNotice(`${effectiveProduct.name}${storage ? ` (${storage})` : ""}${color ? ` - ${color}` : ""} added to your bag.`);
      }
    } else {
      setNotice(`Connecting to WhatsApp to confirm ${name} availability...`);
      window.open(whatsAppEnquiry, "_blank", "noopener,noreferrer");
    }
  };

  const familyLabels: Record<ProductFamilyKey, { label: string; path: string }> = {
    iphone: { label: "iPhone", path: "/iphone" },
    mac: { label: "Mac", path: "/mac" },
    ipad: { label: "iPad", path: "/ipad" },
    watch: { label: "Watch", path: "/watch" },
    airpods: { label: "AirPods", path: "/airpods" },
    accessories: { label: "Accessories", path: "/accessories" },
  };

  return (
    <BuyLayout
      name={name}
      categoryLabel={familyLabels[family]?.label ?? "Store"}
      categoryPath={familyLabels[family]?.path ?? "/store"}
      activeImageSrc={activeImage}
      activeImageAlt={`${name}${color ? ` in ${color}` : ""}`}
      priceLabel={priceLabel}
      badge={effectiveProduct?.condition}
      thumbnails={gallery}
      activeThumbnailIndex={activeThumb}
      onSelectThumbnail={setActiveThumb}
      activeColorKey={colorVariantId}
      activeColorLabel={color || undefined}
      mobileActionLabel={purchasable ? "Add to Bag" : "Enquire"}
      onMobileAction={handleAddToBag}
    >
      <SEO
        title={`Buy ${name} | Buy & Sell GH`}
        description={`Configure and buy ${name} in Accra, Ghana. Verified condition, trusted warranty and delivery with Buy & Sell GH.`}
      />

      <div className="apple-buy-intro">
        <p className="apple-buy-intro-eyebrow">Buy {familyLabels[family]?.label}</p>
        <h2 className="apple-buy-intro-title">Buy {name}</h2>
        <p className="apple-buy-intro-lede">
          {effectiveProduct?.shortDescription || effectiveProduct?.description || "Original Apple device verified and backed by Buy & Sell GH."}
        </p>
      </div>

      {effectiveProduct && (
        <ProductPromotionalBadge
          product={effectiveProduct}
          selectedVariant={configured.variant}
          selectedStorage={storage}
        />
      )}

      {/* Storage / Capacity Option */}
      {effectiveProduct && storageOptions.length > 0 && (
        <section className="apple-buy-step">
          <div className="apple-buy-step-header">
            <h3 className="apple-buy-step-title">Configuration. <span>Choose capacity or specification.</span></h3>
          </div>
          <div className="apple-buy-cards-grid">
            {storageOptions.map((opt) => (
              <BuyOptionCard
                key={opt}
                title={opt}
                selected={normalizeSpecToken(storage) === normalizeSpecToken(opt)}
                onClick={() => {
                  setStorage(opt);
                  setNotice("");
                }}
              />
            ))}
          </div>
        </section>
      )}

      {/* Finish / Circular Color Swatches */}
      {colorOptions.length > 0 && (
        <section className="apple-buy-step">
          <div className="apple-buy-step-header">
            <h3 className="apple-buy-step-title">Finish. <span>Pick your favourite.</span></h3>
          </div>
          <BuyColorSwatches
            colors={colorOptions}
            selectedColor={color}
            productSlug={effectiveProduct?.slug || slug}
            previewImageSrc={selectedFinishImage}
            previewImageAlt={`${name} in ${color}`}
            onSelect={(selectedFinish) => {
              setColor(selectedFinish);
              setActiveThumb(0);
              setNotice("");
            }}
          />
        </section>
      )}

      {/* Trade-in */}
      {family !== "accessories" && (
        <BuyTradeInStep tradeInSelected={tradeIn} onSelect={setTradeIn} />
      )}

      {/* Summary */}
      <BuySummaryCard
        title={`Your ${name}`}
        items={[
          { label: "Product", value: name },
          ...(storage ? [{ label: "Configuration", value: storage }] : []),
          ...(color ? [{ label: "Finish", value: color }] : []),
          { label: "Condition", value: effectiveProduct?.condition ?? "Verified Unit" },
        ]}
        priceLabel={priceLabel}
        previousPriceLabel={previousPriceLabel}
        tradeInBreakdown={tradeInBreakdown}
        onAddToBag={handleAddToBag}
        addToBagLabel={purchasable ? "Add to Bag" : "Enquire on Availability"}
        whatsAppHref={whatsAppEnquiry}
        warningNotice={unavailableVariantWarning}
        notice={notice}
      />
    </BuyLayout>
  );
}
