import React, { useState, useEffect, useMemo } from "react";
import { SEO } from "../SEO";
import { useBuyJourney } from "../../context/BuyJourneyContext";
import { formatGhs } from "../../utils/format";
import { resolveConfiguredPrice, calculateTradeInBreakdown } from "../../utils/productPricing";
import { whatsappUrl, productWhatsAppUrl, toAbsoluteProductImageUrl } from "../../utils/whatsapp";
import { isProductPurchasable } from "../../catalog/productCatalog";
import { hasOwnerUploadedProductImages, isUsedProductCondition, resolveProductGallery } from "../../utils/productImages";
import { localCatalogueImageBySlug, missingCleanAccessoryImageSlugs } from "../../utils/catalogueProductImages";
import { resolveColorOptions } from "../../utils/productColors";
import { resolveProductColorImage, resolveProductColorGallery, preloadProductImages } from "../../utils/productColorImages";
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
        images: [{ src: "/products/story/airpods-pro-3-apple.jpg", alt: "AirPods Pro 3" }],
        available: true,
        stockStatus: "In Stock",
        stockQuantity: Math.max(product?.stockQuantity ?? 0, 10),
        priceOnRequest: false,
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
        available: true,
        stockStatus: "In Stock",
        stockQuantity: 10,
        priceOnRequest: false,
      };
    }
    if (
      product &&
      !isUsedProductCondition(product.condition) &&
      !missingCleanAccessoryImageSlugs.has(product.slug) &&
      product.price > 0 &&
      product.available !== false &&
      product.stockStatus !== "Sold" &&
      (product.stockQuantity === 0 || product.priceOnRequest) &&
      product.variants?.some((v) => v.available !== false && v.price > 0)
    ) {
      return {
        ...product,
        condition: product.condition === "To Confirm" ? "Brand New" : product.condition,
        priceOnRequest: false,
        stockStatus: "In Stock",
        stockQuantity: Math.max(product.stockQuantity, 10),
      };
    }
    return product;
  }, [product, slug]);

  const [storage, setStorage] = useState(effectiveProduct?.storage[0] ?? "");
  const [color, setColor] = useState(effectiveProduct?.colors[0] ?? "");
  const [tradeIn, setTradeIn] = useState(false);
  const [activeThumb, setActiveThumb] = useState(0);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    if (entryStorage && effectiveProduct?.storage.includes(entryStorage)) setStorage(entryStorage);
    if (entryColor && effectiveProduct?.colors.includes(entryColor)) setColor(entryColor);
  }, [entryStorage, entryColor, effectiveProduct?.slug]);

  const colorOptions = useMemo(() => resolveColorOptions(effectiveProduct?.colors ?? []), [effectiveProduct?.colors]);

  useEffect(() => {
    if (effectiveProduct) {
      if (effectiveProduct.storage && effectiveProduct.storage.length > 0 && (!storage || !effectiveProduct.storage.includes(storage))) {
        setStorage(effectiveProduct.storage[0]);
      }
      if (effectiveProduct.colors && effectiveProduct.colors.length > 0 && (!color || !effectiveProduct.colors.includes(color))) {
        setColor(effectiveProduct.colors[0]);
      }
    }
  }, [effectiveProduct]);

  useEffect(() => {
    if (!editingItem || editingItem.product.slug !== effectiveProduct?.slug) return;
    setStorage(editingItem.storage);
    setColor(editingItem.color);
    setTradeIn(editingItem.options?.tradeIn === "Yes");
  }, [editingItem, effectiveProduct?.slug]);

  // Preload all available finish images so clicking swatches has 0 latency
  useEffect(() => {
    if (effectiveProduct && colorOptions.length > 0) {
      const urls = colorOptions.map((c) => resolveProductColorImage(effectiveProduct, c.name));
      preloadProductImages(urls);
    }
  }, [effectiveProduct, colorOptions]);

  const name = effectiveProduct?.name ?? slug.split("-").map((s) => (s ? `${s[0].toUpperCase()}${s.slice(1)}` : s)).join(" ");
  const rawGallery = effectiveProduct ? resolveProductGallery(effectiveProduct) : [];
  const missingCleanImage = missingCleanAccessoryImageSlugs.has(effectiveProduct?.slug ?? slug);
  const canUseCatalogueImage = (!effectiveProduct || !isUsedProductCondition(effectiveProduct.condition)) && !missingCleanImage;
  const fallbackAsset = canUseCatalogueImage ? localCatalogueImageBySlug[effectiveProduct?.slug ?? slug] : undefined;
  const hasOwnerImages = Boolean(effectiveProduct && hasOwnerUploadedProductImages(effectiveProduct));

  // Determine active finish image & angle thumbnails
  const matchedFinishImage = resolveProductColorImage(effectiveProduct, color, fallbackAsset);
  const gallery = useMemo(() => {
    if (hasOwnerImages) {
      return rawGallery;
    }
    return resolveProductColorGallery(effectiveProduct, color, fallbackAsset ? [{ src: fallbackAsset, alt: name }] : []);
  }, [effectiveProduct, color, hasOwnerImages, rawGallery, fallbackAsset, name]);

  const activeImage = gallery[activeThumb]?.src || matchedFinishImage || fallbackAsset;

  const configured = resolveConfiguredPrice(effectiveProduct, { storage });
  const purchasable = effectiveProduct ? isProductPurchasable(effectiveProduct) && configured.price > 0 : false;
  const priceLabel = configured.price > 0
    ? configured.formattedPrice
    : effectiveProduct && !effectiveProduct.priceOnRequest && effectiveProduct.price > 0
    ? formatGhs(effectiveProduct.price)
    : "Price confirmed on enquiry";
  const previousPriceLabel = configured.formattedPreviousPrice;
  const tradeInBreakdown = calculateTradeInBreakdown(configured.price, tradeIn);

  const selectedFinishImage = matchedFinishImage || activeImage;

  const whatsAppEnquiry = effectiveProduct
    ? productWhatsAppUrl(effectiveProduct, storage || "Standard", color || "Standard", undefined, configured.price, selectedFinishImage)
    : whatsappUrl(
        `Hello Buy & Sell GH, I would like to enquire about ${name}. Storage: ${storage}, Finish: ${color}, Fulfillment: ${
          customer.fulfilmentType === "pickup" ? "Pickup (Dome)" : "Delivery"
        }.${selectedFinishImage ? ` Product photo: ${toAbsoluteProductImageUrl(selectedFinishImage)}` : ""} Please confirm availability and price.`
      );

  const handleAddToBag = () => {
    if (effectiveProduct && purchasable) {
      const added = addConfiguredItem(effectiveProduct, storage || "Standard", color || "Standard", configured.variant, selectedFinishImage, {
        storage, color, tradeIn: tradeIn ? "Yes" : "No",
      });
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

      {/* Storage / Capacity Option */}
      {effectiveProduct && effectiveProduct.storage && effectiveProduct.storage.length > 0 && (
        <section className="apple-buy-step">
          <div className="apple-buy-step-header">
            <h3 className="apple-buy-step-title">Configuration. <span>Choose capacity or specification.</span></h3>
          </div>
          <div className="apple-buy-cards-grid">
            {effectiveProduct.storage.map((opt) => (
              <BuyOptionCard
                key={opt}
                title={opt}
                selected={storage === opt}
                onClick={() => setStorage(opt)}
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
            previewImageSrc={matchedFinishImage}
            previewImageAlt={`${name} in ${color}`}
            onSelect={(selectedFinish) => {
              setColor(selectedFinish);
              setActiveThumb(0);
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
        notice={notice}
      />
    </BuyLayout>
  );
}
