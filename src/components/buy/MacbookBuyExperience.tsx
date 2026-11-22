import React, { useState, useEffect, useMemo } from "react";
import { SEO } from "../SEO";
import { useBuyJourney } from "../../context/BuyJourneyContext";
import { useProductCatalog } from "../../catalog/ProductCatalogContext";
import { isProductOrderable } from "../../catalog/productCatalog";
import { calculateTradeInBreakdown, resolveConfiguredPrice } from "../../utils/productPricing";
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
import { getPublishedBuyGallerySync, useBuyGallery } from "../../cms/buyGalleryRepository";
import { resolveColorOption } from "../../utils/productColors";
import { preloadProductImages } from "../../utils/productColorImages";
import { resolveColorGallery } from "../../utils/productColorGallery";

const MACBOOK_FINISHES: ColorOption[] = [
  resolveColorOption("Midnight"),
  resolveColorOption("Starlight"),
  resolveColorOption("Space Gray"),
  resolveColorOption("Silver"),
];

export function MacbookBuyExperience({ catalogProduct }: { catalogProduct?: Product }) {
  const { addConfiguredItem, editingItem, customer } = useBuyJourney();
  const { activeProducts, backendStatus } = useProductCatalog();
  const { storage: entryStorage, color: entryColor } = useBuyEntrySelection();

  const is15Initial = Boolean(catalogProduct?.slug?.includes("15") || catalogProduct?.name?.includes("15"));
  const [screenSize, setScreenSize] = useState<"13-inch" | "15-inch">(is15Initial ? "15-inch" : "13-inch");
  const [finish, setFinish] = useState("Midnight");
  const [memory, setMemory] = useState("16GB");
  const [storage, setStorage] = useState("512GB");
  const [tradeIn, setTradeIn] = useState(false);
  const [activeThumb, setActiveThumb] = useState(0);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    if (entryStorage) setStorage(entryStorage);
    if (entryColor && MACBOOK_FINISHES.some((option) => option.name.toLowerCase() === entryColor.toLowerCase())) {
      const matched = MACBOOK_FINISHES.find((option) => option.name.toLowerCase() === entryColor.toLowerCase());
      if (matched) setFinish(matched.name);
    }
  }, [entryStorage, entryColor]);

  useEffect(() => {
    if (!editingItem?.product.slug.startsWith("macbook-air")) return;
    const options = editingItem.options;
    if (options?.screenSize === "13-inch" || options?.screenSize === "15-inch") setScreenSize(options.screenSize);
    setStorage(editingItem.storage);
    if (options?.finish) setFinish(options.finish);
    if (options?.memory) setMemory(options.memory);
    setTradeIn(options?.tradeIn === "Yes");
  }, [editingItem]);

  useEffect(() => {
    if (catalogProduct?.slug?.includes("15") || catalogProduct?.name?.includes("15")) {
      setScreenSize("15-inch");
    } else if (catalogProduct?.slug?.includes("13") || catalogProduct?.name?.includes("13")) {
      setScreenSize("13-inch");
    }
  }, [catalogProduct?.slug, catalogProduct?.name]);

  useEffect(() => {
    setActiveThumb(0);
  }, [finish, screenSize]);

  const storageOptions = useMemo(() => ["256GB", "512GB", "1TB", "2TB"], []);

  // Resolve real live Supabase MacBook Air matching selected screen size without substituting fake synthetic variant IDs
  const liveMatchedProduct = useMemo(() => {
    const is15 = screenSize === "15-inch";
    const sizeToken = is15 ? "15" : "13";
    if (catalogProduct) {
      if (catalogProduct.slug === "macbook-air") return catalogProduct;
      if (catalogProduct.slug.includes(sizeToken) || catalogProduct.name.includes(sizeToken)) {
        return catalogProduct;
      }
    }
    const airMatches = activeProducts.filter(
      (p) =>
        p.slug.startsWith("macbook-air") &&
        (p.slug.includes(sizeToken) || p.name.includes(sizeToken)) &&
        p.price > 0 &&
        !p.priceOnRequest
    );
    const inStockMatch = airMatches.find((p) => isProductOrderable(p));
    if (inStockMatch) return inStockMatch;
    if (airMatches[0]) return airMatches[0];
    if (catalogProduct) return catalogProduct;
    return activeProducts.find((p) => p.slug === "macbook-air");
  }, [screenSize, catalogProduct, activeProducts]);

  const fallbackProduct: Product = useMemo(() => {
    const is15 = screenSize === "15-inch";
    const basePrice = is15 ? 18500 : 13500;
    const slug = is15 ? "macbook-air-15-inch-m4" : "macbook-air-13-inch-m4";
    const memoryPriceAdd: Record<string, number> = { "16GB": 0, "24GB": 2000, "32GB": 4000 };
    const storagePriceAdd: Record<string, number> = { "256GB": 0, "512GB": 2500, "1TB": 5500, "2TB": 9500 };
    const variants = (["16GB", "24GB", "32GB"] as const).flatMap((mem, memIdx) =>
      (["256GB", "512GB", "1TB", "2TB"] as const).map((cap, capIdx) => ({
        id: `mba-${is15 ? "15" : "13"}-${mem.toLowerCase()}-${cap.toLowerCase()}`,
        productId: slug,
        title: `MacBook Air ${screenSize} (${mem} / ${cap})`,
        screenSize,
        memory: mem,
        storage: cap,
        price: basePrice + (memoryPriceAdd[mem] ?? 0) + (storagePriceAdd[cap] ?? 0),
        condition: "Brand New" as const,
        stockQuantity: 10,
        position: memIdx * 4 + capIdx + 1,
        available: true,
        isSale: false,
        stockStatus: "In Stock" as const,
      }))
    );
    return {
      id: slug,
      slug,
      name: `MacBook Air ${screenSize}`,
      model: `MacBook Air ${screenSize}`,
      brand: "Apple",
      category: "MacBooks",
      condition: "Brand New",
      price: basePrice,
      storage: storageOptions,
      colors: MACBOOK_FINISHES.map((c) => c.name),
      description: `All-new MacBook Air ${screenSize} with Liquid Retina display, Apple Silicon, and all-day battery life.`,
      specs: ["Apple Silicon", "Liquid Retina display", "1080p FaceTime HD camera", "MagSafe 3"],
      box: ["MacBook Air", "USB-C to MagSafe 3 Cable", "USB-C Power Adapter"],
      imageTone: "light",
      images: [{ src: "/products/buy/macbook-air-buy-showcase.jpg", alt: `MacBook Air ${screenSize} in ${finish}` }],
      variants,
      available: true,
      stockStatus: "In Stock" as const,
      stockQuantity: 10,
      featured: true,
    };
  }, [screenSize, storageOptions, finish]);

  const activeProduct: Product = useMemo(() => {
    if (liveMatchedProduct) return liveMatchedProduct;
    if (backendStatus === "supabase" && catalogProduct) return catalogProduct;
    return fallbackProduct;
  }, [liveMatchedProduct, backendStatus, catalogProduct, fallbackProduct]);

  // Preload all 4 finishes for the active screen size
  useEffect(() => {
    const published = getPublishedBuyGallerySync(activeProduct.slug);
    const urls = MACBOOK_FINISHES.flatMap((c) =>
      resolveColorGallery({
        product: activeProduct,
        slug: activeProduct.slug,
        selectedColor: c.name,
        screenSize,
        publishedGallery: published,
      }).images.map((img) => img.src)
    );
    preloadProductImages(urls);
  }, [activeProduct, screenSize]);

  const {
    images: thumbnails,
    mainImage: primaryColorImage,
    colorVariantId,
  } = useBuyGallery(activeProduct, finish, "macbook-air", screenSize);

  const activeImage = thumbnails[activeThumb]?.src || primaryColorImage?.src;
  const currentFinishImg = primaryColorImage?.src || activeImage || "";

  const configured = resolveConfiguredPrice(activeProduct, { screenSize, memory, storage, color: finish });
  const isLiveProduct = Boolean(liveMatchedProduct || (backendStatus === "supabase" && catalogProduct));
  const purchasable = Boolean(
    configured.purchasable &&
      configured.price > 0 &&
      (!isLiveProduct || isProductOrderable(activeProduct))
  );
  const priceLabel = configured.formattedPrice;
  const previousPriceLabel = configured.formattedPreviousPrice;
  const tradeInBreakdown = calculateTradeInBreakdown(configured.price, tradeIn);

  const fullConfigurationTitle = `MacBook Air ${screenSize} (${memory} / ${storage}, ${finish})`;

  const whatsAppEnquiry = whatsappUrl(
    `Hello Buy & Sell GH, I would like to order/enquire about ${fullConfigurationTitle}. Price: ${priceLabel}. Details: Memory: ${memory}, Storage: ${storage}, Finish: ${finish}, Fulfillment: ${customer.fulfilmentType === "pickup" ? "In-Store Pickup (Dome)" : "Doorstep Delivery"}${tradeIn ? ", Trade-in: Yes" : ""}.${currentFinishImg ? ` Product photo: ${toAbsoluteProductImageUrl(currentFinishImg)}` : ""} Please confirm availability.`
  );

  const handleAddToBag = () => {
    if (!purchasable) {
      setNotice(`Connecting to WhatsApp to confirm ${fullConfigurationTitle} availability...`);
      window.open(whatsAppEnquiry, "_blank", "noopener,noreferrer");
      return;
    }
    const effectiveVariant = configured.variant
      ? {
          ...configured.variant,
          title: `MacBook Air ${screenSize} (${memory} / ${storage})`,
        }
      : undefined;
    const added = addConfiguredItem(activeProduct, storage, `${finish} / ${memory}`, effectiveVariant, currentFinishImg, {
      screenSize, storage, finish, memory, tradeIn: tradeIn ? "Yes" : "No",
    });
    if (added) {
      setNotice(`${fullConfigurationTitle} - ${priceLabel} added to your bag.`);
    }
  };

  return (
    <BuyLayout
      name="MacBook Air"
      categoryLabel="Mac"
      categoryPath="/mac"
      activeImageSrc={activeImage}
      activeImageAlt={`MacBook Air ${screenSize} in ${finish}`}
      priceLabel={priceLabel}
      badge="Apple Silicon"
      thumbnails={thumbnails}
      activeThumbnailIndex={activeThumb}
      onSelectThumbnail={setActiveThumb}
      activeColorKey={colorVariantId}
      activeColorLabel={finish}
      mobileActionLabel={purchasable ? "Add to Bag" : "Enquire"}
      onMobileAction={handleAddToBag}
    >
      <SEO
        title="Buy MacBook Air | Buy & Sell GH"
        description="Configure your MacBook Air in Accra, Ghana. Choose 13-inch or 15-inch, memory, storage and finish with Buy & Sell GH."
      />

      <div className="apple-buy-intro">
        <p className="apple-buy-intro-eyebrow">MacBook Air</p>
        <h2 className="apple-buy-intro-title">Buy MacBook Air</h2>
        <p className="apple-buy-intro-lede">
          Impossibly thin and fast. Liquid Retina display, MagSafe 3, all-day battery life, and whisper-quiet fanless architecture.
        </p>
      </div>

      {/* Step 1: Model / Screen Size */}
      <section className="apple-buy-step">
        <div className="apple-buy-step-header">
          <h3 className="apple-buy-step-title">Model &amp; Size. <span>Which canvas do you prefer?</span></h3>
          <p className="apple-buy-step-subtitle">Both feature 500 nits Liquid Retina display with 1 billion colors.</p>
        </div>
        <div className="apple-buy-cards-grid">
          <BuyOptionCard
            title="13-inch MacBook Air"
            subtitle="13.6-inch Liquid Retina display. Ultraportable 2.7 lb weight for effortless travel."
            selected={screenSize === "13-inch"}
            onClick={() => {
              setScreenSize("13-inch");
              setNotice("");
            }}
          />
          <BuyOptionCard
            title="15-inch MacBook Air"
            subtitle="15.3-inch Liquid Retina display. Expansive workspace with six-speaker sound system."
            selected={screenSize === "15-inch"}
            onClick={() => {
              setScreenSize("15-inch");
              setNotice("");
            }}
          />
        </div>
      </section>

      {/* Step 2: Finish */}
      <section className="apple-buy-step">
        <div className="apple-buy-step-header">
          <h3 className="apple-buy-step-title">Finish. <span>Pick your favorite look.</span></h3>
          <p className="apple-buy-step-subtitle">Durable anodized unibody aluminum enclosure with color-matched MagSafe cable.</p>
        </div>
        <BuyColorSwatches
          colors={MACBOOK_FINISHES}
          selectedColor={finish}
          productSlug={activeProduct.slug}
          previewImageSrc={currentFinishImg}
          previewImageAlt={`MacBook Air in ${finish}`}
          onSelect={(c) => {
            setFinish(c);
            setActiveThumb(0);
            setNotice("");
          }}
        />
      </section>

      {/* Step 3: Unified Memory */}
      <section className="apple-buy-step">
        <div className="apple-buy-step-header">
          <h3 className="apple-buy-step-title">Memory. <span>How much unified memory?</span></h3>
          <p className="apple-buy-step-subtitle">Unified memory gives the CPU and GPU fast shared access to memory for seamless multitasking.</p>
        </div>
        <div className="apple-buy-cards-grid">
          <BuyOptionCard
            title="16GB Unified Memory"
            subtitle="Standard configuration. Smooth everyday multitasking, browser tabs, and documents."
            selected={memory === "16GB"}
            onClick={() => {
              setMemory("16GB");
              setNotice("");
            }}
          />
          <BuyOptionCard
            title="24GB Unified Memory"
            subtitle="Great for demanding professional workloads, heavier photo editing, and software compilation."
            selected={memory === "24GB"}
            onClick={() => {
              setMemory("24GB");
              setNotice("");
            }}
          />
          <BuyOptionCard
            title="32GB Unified Memory"
            subtitle="Maximum performance ceiling for complex creative projects and multiple intensive apps."
            selected={memory === "32GB"}
            onClick={() => {
              setMemory("32GB");
              setNotice("");
            }}
          />
        </div>
      </section>

      {/* Step 4: Storage */}
      <section className="apple-buy-step">
        <div className="apple-buy-step-header">
          <h3 className="apple-buy-step-title">Storage. <span>How much SSD storage?</span></h3>
          <p className="apple-buy-step-subtitle">Blazing-fast solid-state drive storage for your apps, media, and files.</p>
        </div>
        <div className="apple-buy-cards-grid">
          {["256GB", "512GB", "1TB", "2TB"].map((cap) => (
            <BuyOptionCard
              key={cap}
              title={`${cap} SSD`}
              subtitle={cap === "256GB" ? "Essential storage for documents and lightweight workflows" : cap === "512GB" ? "Recommended balance for apps and photo libraries" : "Generous storage for expansive creative projects"}
              selected={storage === cap}
              onClick={() => {
                setStorage(cap);
                setNotice("");
              }}
            />
          ))}
        </div>
      </section>

      {/* Step 5: Trade-in */}
      <BuyTradeInStep tradeInSelected={tradeIn} onSelect={setTradeIn} />

      {/* Step 6: Order Summary & Bag Action */}
      <BuySummaryCard
        title="Your MacBook Air"
        items={[
          { label: "Model & Size", value: `${screenSize} MacBook Air` },
          { label: "Finish", value: finish },
          { label: "Unified Memory", value: `${memory} Unified Memory` },
          { label: "Storage", value: `${storage} SSD Storage` },
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
