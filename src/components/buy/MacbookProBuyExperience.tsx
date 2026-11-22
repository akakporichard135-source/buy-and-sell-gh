import React, { useState, useEffect, useMemo } from "react";
import { SEO } from "../SEO";
import { useBuyJourney } from "../../context/BuyJourneyContext";
import { useProductCatalog } from "../../catalog/ProductCatalogContext";
import { isProductOrderable } from "../../catalog/productCatalog";
import { calculateTradeInBreakdown, resolveConfiguredPrice } from "../../utils/productPricing";
import { toAbsoluteProductImageUrl, whatsappUrl } from "../../utils/whatsapp";
import { getPublishedBuyGallerySync, useBuyGallery } from "../../cms/buyGalleryRepository";
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
import { resolveColorOption } from "../../utils/productColors";
import { preloadProductImages } from "../../utils/productColorImages";
import { resolveColorGallery } from "../../utils/productColorGallery";

const MACBOOK_PRO_FINISHES: ColorOption[] = [
  resolveColorOption("Space Black"),
  resolveColorOption("Silver"),
];

export function MacbookProBuyExperience({ catalogProduct }: { catalogProduct?: Product }) {
  const { addConfiguredItem, editingItem, customer } = useBuyJourney();
  const { activeProducts, backendStatus } = useProductCatalog();
  const { storage: entryStorage, color: entryColor } = useBuyEntrySelection();

  const is16Initial = catalogProduct?.slug?.includes("16") ?? false;
  const isMaxInitial = catalogProduct?.slug?.includes("max") ?? false;

  const [screenSize, setScreenSize] = useState<"14-inch" | "16-inch">(is16Initial ? "16-inch" : "14-inch");
  const [chip, setChip] = useState<"M4" | "M4 Pro" | "M4 Max">(isMaxInitial ? "M4 Max" : is16Initial ? "M4 Pro" : "M4");
  const [finish, setFinish] = useState("Space Black");
  const [memory, setMemory] = useState(is16Initial || isMaxInitial ? "36GB" : "24GB");
  const [storage, setStorage] = useState(is16Initial ? "1TB" : "512GB");
  const [tradeIn, setTradeIn] = useState(false);
  const [activeThumb, setActiveThumb] = useState(0);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    if (entryStorage) setStorage(entryStorage);
    if (entryColor && MACBOOK_PRO_FINISHES.some((option) => option.name.toLowerCase() === entryColor.toLowerCase())) {
      const matched = MACBOOK_PRO_FINISHES.find((option) => option.name.toLowerCase() === entryColor.toLowerCase());
      if (matched) setFinish(matched.name);
    }
  }, [entryStorage, entryColor]);

  useEffect(() => {
    if (!editingItem?.product.slug.startsWith("macbook-pro")) return;
    const options = editingItem.options;
    if (options?.screenSize === "14-inch" || options?.screenSize === "16-inch") setScreenSize(options.screenSize);
    if (options?.chip === "M4" || options?.chip === "M4 Pro" || options?.chip === "M4 Max") setChip(options.chip);
    setStorage(editingItem.storage);
    if (options?.finish) setFinish(options.finish);
    if (options?.memory) setMemory(options.memory);
    setTradeIn(options?.tradeIn === "Yes");
  }, [editingItem]);

  useEffect(() => {
    if (catalogProduct) {
      if (catalogProduct.slug.includes("16")) {
        setScreenSize("16-inch");
      }
      if (catalogProduct.slug.includes("max")) {
        setChip("M4 Max");
      } else if (catalogProduct.slug.includes("pro-max") || catalogProduct.slug.includes("16")) {
        setChip("M4 Pro");
      }
    }
  }, [catalogProduct]);

  useEffect(() => {
    if (screenSize === "16-inch" && chip === "M4") {
      setChip("M4 Pro");
      if (memory === "16GB") setMemory("24GB");
      if (storage === "512GB") setStorage("1TB");
    }
  }, [screenSize, chip, memory, storage]);

  useEffect(() => {
    setActiveThumb(0);
  }, [finish, screenSize]);

  // Resolve real live Supabase MacBook Pro matching size without substituting fake synthetic variant IDs
  const liveMatchedProduct = useMemo(() => {
    const sizeToken = screenSize === "16-inch" ? "16" : "14";
    if (catalogProduct && (catalogProduct.slug.includes(sizeToken) || catalogProduct.name.includes(sizeToken))) {
      return catalogProduct;
    }
    const proMatches = activeProducts.filter(
      (p) =>
        p.slug.startsWith("macbook-pro") &&
        (p.slug.includes(sizeToken) || p.name.includes(sizeToken)) &&
        p.price > 0 &&
        !p.priceOnRequest
    );
    const inStockMatch = proMatches.find((p) => isProductOrderable(p));
    if (inStockMatch) return inStockMatch;
    if (proMatches[0]) return proMatches[0];
    if (catalogProduct) return catalogProduct;
    return activeProducts.find((p) => p.slug.startsWith("macbook-pro"));
  }, [screenSize, catalogProduct, activeProducts]);

  const fallbackProduct: Product = useMemo(() => {
    const is16 = screenSize === "16-inch";
    const basePrice = is16 ? 32000 : 22000;
    const slug = is16 ? "macbook-pro-16-inch-m5-pro-m5-max" : "macbook-pro-14-inch-m5";
    const chipPriceAdd: Record<string, number> = { M4: 0, "M4 Pro": is16 ? 0 : 4000, "M4 Max": is16 ? 8000 : 11000 };
    const memoryPriceAdd: Record<string, number> = { "16GB": 0, "24GB": 2000, "36GB": 4500, "48GB": 7000, "64GB": 10000, "128GB": 18000 };
    const storagePriceAdd: Record<string, number> = { "512GB": 0, "1TB": 3500, "2TB": 7500, "4TB": 14000 };
    const chipsForSize = is16 ? (["M4 Pro", "M4 Max"] as const) : (["M4", "M4 Pro", "M4 Max"] as const);
    const memories = ["16GB", "24GB", "36GB", "48GB", "64GB", "128GB"] as const;
    const storages = ["512GB", "1TB", "2TB", "4TB"] as const;
    let pos = 1;
    const variants = chipsForSize.flatMap((c) =>
      memories.flatMap((mem) =>
        storages.map((cap) => ({
          id: `mbp-${is16 ? "16" : "14"}-${c.toLowerCase().replace(/\s+/g, "-")}-${mem.toLowerCase()}-${cap.toLowerCase()}`,
          productId: slug,
          title: `MacBook Pro ${screenSize} (${c}, ${mem} / ${cap})`,
          screenSize,
          chip: c,
          memory: mem,
          storage: cap,
          price: basePrice + (chipPriceAdd[c] ?? 0) + (memoryPriceAdd[mem] ?? 0) + (storagePriceAdd[cap] ?? 0),
          condition: "Brand New" as const,
          stockQuantity: 10,
          position: pos++,
          available: true,
          isSale: false,
          stockStatus: "In Stock" as const,
        }))
      )
    );
    return {
      id: slug,
      slug,
      name: `MacBook Pro ${screenSize}`,
      model: `MacBook Pro ${screenSize}`,
      brand: "Apple",
      category: "MacBooks",
      condition: "Brand New",
      price: basePrice,
      storage: ["512GB", "1TB", "2TB", "4TB"],
      colors: ["Space Black", "Silver"],
      description: `Flagship MacBook Pro ${screenSize} with Liquid Retina XDR display, pro ports, and extreme Apple Silicon.`,
      specs: ["Apple M4 / M4 Pro / M4 Max", "Liquid Retina XDR display", "120Hz ProMotion", "1600 nits peak brightness", "MagSafe 3 & HDMI"],
      box: ["MacBook Pro", "USB-C to MagSafe 3 Cable", "USB-C Power Adapter"],
      imageTone: "dark",
      images: [],
      variants,
      available: true,
      stockStatus: "In Stock" as const,
      stockQuantity: 10,
      featured: true,
    };
  }, [screenSize]);

  const activeProduct: Product = useMemo(() => {
    if (liveMatchedProduct) return liveMatchedProduct;
    if (backendStatus === "supabase" && catalogProduct) return catalogProduct;
    return fallbackProduct;
  }, [liveMatchedProduct, backendStatus, catalogProduct, fallbackProduct]);

  useEffect(() => {
    const published = getPublishedBuyGallerySync(activeProduct.slug);
    const urls = MACBOOK_PRO_FINISHES.flatMap((c) =>
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
  } = useBuyGallery(activeProduct, finish, "macbook-pro", screenSize);

  const activeImage = thumbnails[activeThumb]?.src || primaryColorImage?.src;
  const currentDisplayImg = primaryColorImage?.src || activeImage || "";

  const configured = resolveConfiguredPrice(activeProduct, { screenSize, chip, memory, storage, color: finish });
  const isLiveProduct = Boolean(liveMatchedProduct || (backendStatus === "supabase" && catalogProduct));
  const purchasable = Boolean(
    configured.purchasable &&
      configured.price > 0 &&
      (!isLiveProduct || isProductOrderable(activeProduct))
  );
  const priceLabel = configured.formattedPrice;
  const previousPriceLabel = configured.formattedPreviousPrice;
  const tradeInBreakdown = calculateTradeInBreakdown(configured.price, tradeIn);

  const fullConfigurationTitle = `MacBook Pro ${screenSize} (${chip}, ${memory} RAM, ${storage} SSD, ${finish})`;

  const whatsAppEnquiry = whatsappUrl(
    `Hello Buy & Sell GH, I would like to order/enquire about ${fullConfigurationTitle}. Price: ${priceLabel}. Details: Screen: ${screenSize}, Chip: Apple ${chip}, Memory: ${memory}, Storage: ${storage}, Finish: ${finish}, Fulfillment: ${customer.fulfilmentType === "pickup" ? "In-Store Pickup (Dome)" : "Doorstep Delivery"}${tradeIn ? ", Trade-in: Yes" : ""}.${currentDisplayImg ? ` Product photo: ${toAbsoluteProductImageUrl(currentDisplayImg)}` : ""} Please confirm availability.`
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
          title: `MacBook Pro ${screenSize} (${chip}, ${memory} / ${storage})`,
        }
      : undefined;
    const added = addConfiguredItem(activeProduct, storage, `${finish} / ${chip} / ${memory}`, effectiveVariant, currentDisplayImg, {
      screenSize, chip, storage, finish, memory, tradeIn: tradeIn ? "Yes" : "No",
    });
    if (added) {
      setNotice(`${fullConfigurationTitle} - ${priceLabel} added to your bag.`);
    }
  };

  return (
    <BuyLayout
      name="MacBook Pro"
      categoryLabel="Mac"
      categoryPath="/mac"
      activeImageSrc={activeImage}
      activeImageAlt={`MacBook Pro ${screenSize} in ${finish}`}
      priceLabel={priceLabel}
      badge="Apple Silicon Pro"
      thumbnails={thumbnails}
      activeThumbnailIndex={activeThumb}
      onSelectThumbnail={setActiveThumb}
      activeColorKey={colorVariantId}
      activeColorLabel={finish}
      mobileActionLabel={purchasable ? "Add to Bag" : "Enquire"}
      onMobileAction={handleAddToBag}
    >
      <SEO
        title={`Buy MacBook Pro ${screenSize} | Buy & Sell GH`}
        description={`Configure your MacBook Pro ${screenSize} with Apple M4, M4 Pro or M4 Max in Accra, Ghana. Choose unified memory, SSD storage and Space Black or Silver.`}
      />

      <div className="apple-buy-intro">
        <p className="apple-buy-intro-eyebrow">MacBook Pro</p>
        <h2 className="apple-buy-intro-title">Buy MacBook Pro</h2>
        <p className="apple-buy-intro-lede">
          Extreme pro performance. Liquid Retina XDR display with up to 1,600 nits peak brightness, MagSafe 3, HDMI, SDXC, and monumental battery life.
        </p>
      </div>

      {/* Step 1: Model / Screen Size */}
      <section className="apple-buy-step">
        <div className="apple-buy-step-header">
          <h3 className="apple-buy-step-title">Model &amp; Size. <span>Choose your display canvas.</span></h3>
          <p className="apple-buy-step-subtitle">Liquid Retina XDR with ProMotion 120Hz refresh rates and extreme dynamic range.</p>
        </div>
        <div className="apple-buy-cards-grid">
          <BuyOptionCard
            title="14-inch MacBook Pro"
            subtitle="14.2-inch Liquid Retina XDR. Exceptional balance of workstation power and grab-and-go portability."
            selected={screenSize === "14-inch"}
            onClick={() => {
              setScreenSize("14-inch");
              setNotice("");
            }}
          />
          <BuyOptionCard
            title="16-inch MacBook Pro"
            subtitle="16.2-inch Liquid Retina XDR. Maximum thermal headroom, expansive canvas, and up to 24 hours battery life."
            selected={screenSize === "16-inch"}
            onClick={() => {
              setScreenSize("16-inch");
              setNotice("");
            }}
          />
        </div>
      </section>

      {/* Step 2: Apple Silicon Chip Tier */}
      <section className="apple-buy-step">
        <div className="apple-buy-step-header">
          <h3 className="apple-buy-step-title">Apple Silicon. <span>Select your processing horsepower.</span></h3>
          <p className="apple-buy-step-subtitle">Next-generation hardware-accelerated ray tracing and powerful Neural Engine for AI workloads.</p>
        </div>
        <div className="apple-buy-cards-grid">
          {screenSize === "14-inch" && (
            <BuyOptionCard
              title="Apple M4 chip"
              subtitle="10-core CPU, 10-core GPU. Blazing speed for software development, 4K video editing, and demanding productivity."
              selected={chip === "M4"}
              onClick={() => {
                setChip("M4");
                setNotice("");
              }}
            />
          )}
          <BuyOptionCard
            title="Apple M4 Pro chip"
            subtitle="Up to 14-core CPU, up to 20-core GPU. Engineered for code compilation, 3D rendering, and multitrack audio production."
            selected={chip === "M4 Pro"}
            onClick={() => {
              setChip("M4 Pro");
              setNotice("");
            }}
          />
          <BuyOptionCard
            title="Apple M4 Max chip"
            subtitle="Up to 16-core CPU, up to 40-core GPU. Colossal power ceiling for massive 3D scenes, 8K ProRes video, and machine learning."
            selected={chip === "M4 Max"}
            onClick={() => {
              setChip("M4 Max");
              setNotice("");
            }}
          />
        </div>
      </section>

      {/* Step 3: Finish */}
      <section className="apple-buy-step">
        <div className="apple-buy-step-header">
          <h3 className="apple-buy-step-title">Finish. <span>Pick your enclosure look.</span></h3>
          <p className="apple-buy-step-subtitle">Space Black features a breakthrough anodization chemistry that measurably reduces fingerprints.</p>
        </div>
        <BuyColorSwatches
          colors={MACBOOK_PRO_FINISHES}
          selectedColor={finish}
          productSlug={activeProduct.slug}
          previewImageSrc={currentDisplayImg}
          previewImageAlt={`MacBook Pro in ${finish}`}
          onSelect={(c) => {
            setFinish(c);
            setActiveThumb(0);
            setNotice("");
          }}
        />
      </section>

      {/* Step 4: Unified Memory */}
      <section className="apple-buy-step">
        <div className="apple-buy-step-header">
          <h3 className="apple-buy-step-title">Memory. <span>How much unified memory?</span></h3>
          <p className="apple-buy-step-subtitle">Ultra-high-bandwidth unified memory architecture shared seamlessly between CPU, GPU, and Neural Engine.</p>
        </div>
        <div className="apple-buy-cards-grid">
          {chip === "M4" && (
            <BuyOptionCard
              title="16GB Unified Memory"
              subtitle="Fast, fluid everyday pro multitasking and creative app workflows."
              selected={memory === "16GB"}
              onClick={() => {
                setMemory("16GB");
                setNotice("");
              }}
            />
          )}
          <BuyOptionCard
            title="24GB Unified Memory"
            subtitle="Recommended standard for heavy multitasking, video timelines, and virtualization."
            selected={memory === "24GB"}
            onClick={() => {
              setMemory("24GB");
              setNotice("");
            }}
          />
          {(chip === "M4 Pro" || chip === "M4 Max") && (
            <BuyOptionCard
              title="36GB Unified Memory"
              subtitle="Expansive headroom for large datasets, multi-app production, and motion graphics."
              selected={memory === "36GB"}
              onClick={() => {
                setMemory("36GB");
                setNotice("");
              }}
            />
          )}
          {chip === "M4 Pro" && (
            <BuyOptionCard
              title="48GB Unified Memory"
              subtitle="Advanced workstation capacity for complex compilation and high-resolution media."
              selected={memory === "48GB"}
              onClick={() => {
                setMemory("48GB");
                setNotice("");
              }}
            />
          )}
          {chip === "M4 Max" && (
            <>
              <BuyOptionCard
                title="64GB Unified Memory"
                subtitle="High-end workstation memory for extreme 3D render pipelines and large language models."
                selected={memory === "64GB"}
                onClick={() => {
                  setMemory("64GB");
                  setNotice("");
                }}
              />
              <BuyOptionCard
                title="128GB Unified Memory"
                subtitle="The ultimate unified memory ceiling for demanding film studios and enterprise engineers."
                selected={memory === "128GB"}
                onClick={() => {
                  setMemory("128GB");
                  setNotice("");
                }}
              />
            </>
          )}
        </div>
      </section>

      {/* Step 5: SSD Storage */}
      <section className="apple-buy-step">
        <div className="apple-buy-step-header">
          <h3 className="apple-buy-step-title">Storage. <span>How much internal SSD storage?</span></h3>
          <p className="apple-buy-step-subtitle">Superfast PCIe solid-state storage with read speeds up to 7.4GB/s.</p>
        </div>
        <div className="apple-buy-cards-grid">
          {screenSize === "14-inch" && chip === "M4" && (
            <BuyOptionCard
              title="512GB SSD"
              subtitle="Essential fast pro storage for everyday apps, libraries, and active files."
              selected={storage === "512GB"}
              onClick={() => {
                setStorage("512GB");
                setNotice("");
              }}
            />
          )}
          <BuyOptionCard
            title="1TB SSD"
            subtitle="Recommended balance for professional projects, 4K footage, and sound libraries."
            selected={storage === "1TB"}
            onClick={() => {
              setStorage("1TB");
              setNotice("");
            }}
          />
          <BuyOptionCard
            title="2TB SSD"
            subtitle="Expansive capacity for large media archives, local databases, and heavy project caches."
            selected={storage === "2TB"}
            onClick={() => {
              setStorage("2TB");
              setNotice("");
            }}
          />
          <BuyOptionCard
            title="4TB SSD"
            subtitle="High-capacity storage built for demanding on-set DIT and extensive studio libraries."
            selected={storage === "4TB"}
            onClick={() => {
              setStorage("4TB");
              setNotice("");
            }}
          />
        </div>
      </section>

      {/* Step 6: Trade-in */}
      <BuyTradeInStep tradeInSelected={tradeIn} onSelect={setTradeIn} />

      {/* Step 7: Order Summary & Bag Action */}
      <BuySummaryCard
        title="Your MacBook Pro"
        items={[
          { label: "Model & Size", value: `${screenSize} MacBook Pro` },
          { label: "Apple Silicon", value: `Apple ${chip}` },
          { label: "Finish", value: finish },
          { label: "Unified Memory", value: `${memory} Unified Memory` },
          { label: "Storage", value: `${storage} SSD Storage` },
          { label: "Display", value: "Liquid Retina XDR with ProMotion" },
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
