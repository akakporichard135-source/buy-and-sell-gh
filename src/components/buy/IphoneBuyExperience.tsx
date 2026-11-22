import React, { useState, useEffect, useMemo } from "react";
import { SEO } from "../SEO";
import { useBuyJourney } from "../../context/BuyJourneyContext";
import { useProductCatalog } from "../../catalog/ProductCatalogContext";
import { isProductOrderable } from "../../catalog/productCatalog";
import { calculateTradeInBreakdown, resolveConfiguredPrice } from "../../utils/productPricing";
import { ProductPromotionalBadge } from "../promotions/ProductPromotionalBadge";
import { toAbsoluteProductImageUrl, whatsappUrl } from "../../utils/whatsapp";
import {
  BuyLayout,
  BuyOptionCard,
  BuyColorSwatches,
  BuyTradeInStep,
  BuySummaryCard,
  useBuyEntrySelection,
  type ColorOption,
} from "./BuyPrimitives";
import type { Product } from "../../types/product";
import { resolveColorOption, resolveColorOptions } from "../../utils/productColors";
import { preloadProductImages } from "../../utils/productColorImages";
import { resolveColorGallery } from "../../utils/productColorGallery";
import { getSelectableStorageOptions, normalizeSpecToken } from "../../utils/variantSelection";
import { getPublishedBuyGallerySync, useBuyGallery } from "../../cms/buyGalleryRepository";

const DEFAULT_IPHONE_18_COLORS: ColorOption[] = [
  resolveColorOption("Deep Burgundy"),
  resolveColorOption("Space Black"),
  resolveColorOption("Natural Titanium"),
  resolveColorOption("Light Blue"),
];

export function IphoneBuyExperience({ catalogProduct }: { catalogProduct?: Product }) {
  const { addConfiguredItem, editingItem, customer } = useBuyJourney();
  const { activeProducts, backendStatus } = useProductCatalog();
  const { storage: entryStorage, color: entryColor } = useBuyEntrySelection();

  const isMaxInitial = Boolean(
    catalogProduct?.slug === "iphone-18-pro-max" || catalogProduct?.name?.includes("Max")
  );
  const [model, setModel] = useState<"iPhone 18 Pro" | "iPhone 18 Pro Max">(
    isMaxInitial ? "iPhone 18 Pro Max" : "iPhone 18 Pro"
  );
  const [finish, setFinish] = useState("Deep Burgundy");
  const [storage, setStorage] = useState("256GB");
  const [tradeIn, setTradeIn] = useState(false);
  const [activeThumb, setActiveThumb] = useState(0);
  const [notice, setNotice] = useState("");

  const targetSlug = model === "iPhone 18 Pro Max" ? "iphone-18-pro-max" : "iphone-18-pro";

  const liveModelProduct = useMemo(() => {
    const fromCatalog = activeProducts.find((p) => p.slug === targetSlug);
    if (fromCatalog) return fromCatalog;
    if (catalogProduct?.slug === targetSlug) return catalogProduct;
    return undefined;
  }, [activeProducts, catalogProduct, targetSlug]);

  const colorOptions: ColorOption[] = useMemo(() => {
    const sourceColors = liveModelProduct?.colors?.length ? liveModelProduct.colors : undefined;
    return sourceColors ? resolveColorOptions(sourceColors) : DEFAULT_IPHONE_18_COLORS;
  }, [liveModelProduct?.colors]);

  const storageOptions: string[] = useMemo(() => {
    const liveStorages = getSelectableStorageOptions(liveModelProduct);
    if (liveStorages.length > 0) return liveStorages;
    return model === "iPhone 18 Pro Max"
      ? ["256GB", "512GB", "1TB", "2TB"]
      : ["256GB", "512GB", "1TB"];
  }, [liveModelProduct, model]);

  useEffect(() => {
    if (entryStorage && storageOptions.some((s) => normalizeSpecToken(s) === normalizeSpecToken(entryStorage))) {
      setStorage(entryStorage);
    }
    if (entryColor && colorOptions.some((option) => option.name.toLowerCase() === entryColor.toLowerCase())) {
      const matched = colorOptions.find((option) => option.name.toLowerCase() === entryColor.toLowerCase());
      if (matched) setFinish(matched.name);
    }
  }, [entryStorage, entryColor, storageOptions, colorOptions]);

  useEffect(() => {
    if (catalogProduct?.slug === "iphone-18-pro-max" || catalogProduct?.name?.includes("Max")) {
      setModel("iPhone 18 Pro Max");
    } else if (catalogProduct?.slug === "iphone-18-pro") {
      setModel("iPhone 18 Pro");
    }
  }, [catalogProduct?.slug, catalogProduct?.name]);

  useEffect(() => {
    if (!editingItem || !["iphone-18-pro", "iphone-18-pro-max"].includes(editingItem.product.slug)) return;
    setModel(editingItem.options?.model === "iPhone 18 Pro Max" ? "iPhone 18 Pro Max" : "iPhone 18 Pro");
    setStorage(editingItem.storage);
    setFinish(editingItem.color);
    setTradeIn(editingItem.options?.tradeIn === "Yes");
  }, [editingItem]);

  useEffect(() => {
    if (storageOptions.length > 0 && !storageOptions.some((opt) => normalizeSpecToken(opt) === normalizeSpecToken(storage))) {
      setStorage(storageOptions[0]);
    }
  }, [storageOptions, storage]);

  useEffect(() => {
    if (colorOptions.length > 0 && !colorOptions.some((c) => c.name.toLowerCase() === finish.toLowerCase())) {
      setFinish(colorOptions[0].name);
    }
  }, [colorOptions, finish]);

  useEffect(() => {
    setActiveThumb(0);
  }, [finish, model]);

  const fallbackProduct: Product = useMemo(() => {
    const isMax = model === "iPhone 18 Pro Max";
    const basePrice = isMax ? 22500 : 20500;
    const resolvedId = isMax ? "iphone-18-pro-max" : "iphone-18-pro";
    return {
      id: resolvedId,
      slug: resolvedId,
      name: model,
      model,
      brand: "Apple",
      category: "iPhones",
      condition: "Brand New",
      price: basePrice,
      storage: storageOptions,
      colors: DEFAULT_IPHONE_18_COLORS.map((c) => c.name),
      description: "Flagship iPhone 18 Pro in contoured aerospace-grade titanium with advanced camera system.",
      specs: ["A19 Pro chip", "Titanium design", "Super Retina XDR", "Pro camera system"],
      box: ["iPhone with iOS 20", "USB-C Charge Cable", "Documentation"],
      imageTone: "dark",
      images: [{ src: "/products/campaigns/iphone-18-pro-burgundy-finish.webp", alt: `${model} ${finish}` }],
      variants: [
        { id: `${isMax ? "18pm" : "18p"}-256`, productId: resolvedId, title: `${model} 256GB`, storage: "256GB", price: isMax ? 22500 : 20500, condition: "Brand New", stockQuantity: 10, position: 1, available: true, isSale: false, stockStatus: "In Stock" },
        { id: `${isMax ? "18pm" : "18p"}-512`, productId: resolvedId, title: `${model} 512GB`, storage: "512GB", price: isMax ? 25500 : 23000, condition: "Brand New", stockQuantity: 10, position: 2, available: true, isSale: false, stockStatus: "In Stock" },
        { id: `${isMax ? "18pm" : "18p"}-1tb`, productId: resolvedId, title: `${model} 1TB`, storage: "1TB", price: isMax ? 28500 : 26500, condition: "Brand New", stockQuantity: 10, position: 3, available: true, isSale: false, stockStatus: "In Stock" },
        ...(isMax ? [{ id: "18pm-2tb", productId: resolvedId, title: `${model} 2TB`, storage: "2TB", price: 32000, condition: "Brand New" as const, stockQuantity: 10, position: 4, available: true, isSale: false, stockStatus: "In Stock" as const }] : []),
      ],
      available: true,
      stockStatus: "In Stock",
      stockQuantity: 10,
      featured: true,
    };
  }, [model, storageOptions, finish]);

  // Always prefer the real live Supabase product without substituting synthetic variant IDs
  const activeProduct: Product = useMemo(() => {
    if (liveModelProduct) return liveModelProduct;
    if (backendStatus === "supabase" && catalogProduct) return catalogProduct;
    return fallbackProduct;
  }, [liveModelProduct, backendStatus, catalogProduct, fallbackProduct]);

  // Preload all colour variant galleries so swatch transitions are instantaneous
  useEffect(() => {
    const published = getPublishedBuyGallerySync(activeProduct.slug);
    const urls = colorOptions.flatMap((c) =>
      resolveColorGallery({
        product: activeProduct,
        slug: activeProduct.slug,
        selectedColor: c.name,
        publishedGallery: published,
      }).images.map((img) => img.src)
    );
    preloadProductImages(urls);
  }, [activeProduct, colorOptions]);

  const {
    images: thumbnails,
    mainImage: primaryColorImage,
    colorVariantId,
  } = useBuyGallery(activeProduct, finish, targetSlug);

  const activeImage = thumbnails[activeThumb]?.src || primaryColorImage?.src;
  const currentFinishImage = primaryColorImage?.src || activeImage || "";

  const configured = resolveConfiguredPrice(activeProduct, { storage, color: finish, model });
  const isLiveProduct = Boolean(liveModelProduct || (backendStatus === "supabase" && catalogProduct));
  const purchasable = Boolean(
    configured.purchasable &&
      configured.price > 0 &&
      (!isLiveProduct || isProductOrderable(activeProduct))
  );
  const priceLabel = configured.formattedPrice;
  const previousPriceLabel = configured.formattedPreviousPrice;
  const tradeInBreakdown = calculateTradeInBreakdown(configured.price, tradeIn);

  const whatsAppEnquiry = whatsappUrl(
    `Hello Buy & Sell GH, I would like to order ${model}. Configuration: ${storage}, Finish: ${finish}, Price: ${priceLabel}, Fulfillment: ${customer.fulfilmentType === "pickup" ? "In-Store Pickup (Dome)" : "Doorstep Delivery"}${tradeIn ? ", Trade-in: Yes" : ""}.${currentFinishImage ? ` Product photo: ${toAbsoluteProductImageUrl(currentFinishImage)}` : ""} Please confirm availability.`
  );

  const handleAddToBag = () => {
    if (!purchasable) {
      setNotice(`Connecting to WhatsApp to confirm ${model} availability...`);
      window.open(whatsAppEnquiry, "_blank", "noopener,noreferrer");
      return;
    }
    const added = addConfiguredItem(activeProduct, storage, finish, configured.variant, currentFinishImage, {
      model, storage, finish, tradeIn: tradeIn ? "Yes" : "No",
    });
    if (added) {
      setNotice(`${model} (${storage}, ${finish}) - ${priceLabel} added to your bag.`);
    }
  };

  return (
    <BuyLayout
      name={model}
      categoryLabel="iPhone"
      categoryPath="/iphone"
      activeImageSrc={activeImage}
      activeImageAlt={`${model} in ${finish}`}
      priceLabel={priceLabel}
      badge="Flagship Pro"
      thumbnails={thumbnails}
      activeThumbnailIndex={activeThumb}
      onSelectThumbnail={setActiveThumb}
      activeColorKey={colorVariantId}
      activeColorLabel={finish}
      mobileActionLabel={purchasable ? "Add to Bag" : "Enquire"}
      onMobileAction={handleAddToBag}
    >
      <SEO
        title={`Buy ${model} | Buy & Sell GH`}
        description={`Configure and buy ${model} in Accra, Ghana. Choose your model, titanium finish, storage and delivery with Buy & Sell GH.`}
      />

      <div className="apple-buy-intro">
        <p className="apple-buy-intro-eyebrow">Buy iPhone</p>
        <h2 className="apple-buy-intro-title">Buy {model}</h2>
        <p className="apple-buy-intro-lede">
          Precision-engineered titanium unibody, advanced triple Pro camera system, and all-day endurance.
        </p>
      </div>

      {activeProduct && (
        <ProductPromotionalBadge
          product={activeProduct}
          selectedVariant={configured.variant}
          selectedStorage={storage}
        />
      )}

      {/* Step 1: Model Selection */}
      <section className="apple-buy-step">
        <div className="apple-buy-step-header">
          <h3 className="apple-buy-step-title">Model. <span>Which is right for you?</span></h3>
          <p className="apple-buy-step-subtitle">Compare display size and battery capacity to fit your daily workflow.</p>
        </div>
        <div className="apple-buy-cards-grid">
          <BuyOptionCard
            title="iPhone 18 Pro"
            subtitle="6.3-inch Super Retina XDR display with ProMotion and contoured titanium design."
            selected={model === "iPhone 18 Pro"}
            onClick={() => {
              setModel("iPhone 18 Pro");
              if (storage === "2TB") setStorage("1TB");
              setNotice("");
            }}
          />
          <BuyOptionCard
            title="iPhone 18 Pro Max"
            subtitle="6.9-inch Super Retina XDR display with expansive canvas and extended battery life."
            selected={model === "iPhone 18 Pro Max"}
            onClick={() => {
              setModel("iPhone 18 Pro Max");
              setNotice("");
            }}
          />
        </div>
      </section>

      {/* Step 2: Finish Selection */}
      <section className="apple-buy-step">
        <div className="apple-buy-step-header">
          <h3 className="apple-buy-step-title">Finish. <span>Pick your favorite.</span></h3>
          <p className="apple-buy-step-subtitle">Refined aerospace-grade titanium with textured matte glass back.</p>
        </div>
        <BuyColorSwatches
          colors={colorOptions}
          selectedColor={finish}
          productSlug={activeProduct.slug}
          previewImageSrc={currentFinishImage}
          previewImageAlt={`${model} in ${finish}`}
          onSelect={(c) => {
            setFinish(c);
            setActiveThumb(0);
            setNotice("");
          }}
        />
      </section>

      {/* Step 3: Storage Selection */}
      <section className="apple-buy-step">
        <div className="apple-buy-step-header">
          <h3 className="apple-buy-step-title">Storage. <span>How much space do you need?</span></h3>
          <p className="apple-buy-step-subtitle">Select capacity for 4K ProRes videos, high-resolution photography and apps.</p>
        </div>
        <div className="apple-buy-cards-grid">
          {storageOptions.map((opt: string) => (
            <BuyOptionCard
              key={opt}
              title={opt}
              subtitle={opt === "256GB" ? "Popular capacity for daily pro use" : opt === "512GB" ? "Ample space for extensive 4K capture" : "Maximum capacity for demanding media workflows"}
              selected={normalizeSpecToken(storage) === normalizeSpecToken(opt)}
              onClick={() => {
                setStorage(opt);
                setNotice("");
              }}
            />
          ))}
        </div>
      </section>

      {/* Step 4: Trade-in */}
      <BuyTradeInStep tradeInSelected={tradeIn} onSelect={setTradeIn} />

      {/* Step 5: Order Summary & Bag Action */}
      <BuySummaryCard
        title={`Your ${model}`}
        items={[
          { label: "Model", value: model },
          { label: "Finish", value: finish },
          { label: "Storage", value: storage },
          { label: "Trade-in", value: tradeIn ? "Device trade-in requested" : "No trade-in" },
        ]}
        priceLabel={priceLabel}
        previousPriceLabel={previousPriceLabel}
        tradeInBreakdown={tradeInBreakdown}
        onAddToBag={handleAddToBag}
        addToBagLabel={purchasable ? "Add to Bag" : "Enquire on Availability"}
        whatsAppHref={whatsAppEnquiry}
        warningNotice={!purchasable ? configured.errorMessage : undefined}
        notice={notice}
      />
    </BuyLayout>
  );
}
