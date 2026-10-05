import React, { useState, useEffect } from "react";
import { SEO } from "../SEO";
import { useCart } from "../../context/CartContext";
import { formatGhs } from "../../utils/format";
import { whatsappUrl } from "../../utils/whatsapp";
import { localCatalogueImageBySlug } from "../../utils/catalogueProductImages";
import {
  BuyLayout,
  BuyOptionCard,
  BuyColorSwatches,
  BuyTradeInStep,
  BuyPaymentStep,
  BuyFulfillmentStep,
  BuySummaryCard,
  type ColorOption,
} from "./BuyPrimitives";
import type { Product } from "../../types/product";

const MACBOOK_PRO_FINISHES: ColorOption[] = [
  { name: "Space Black", hex: "#2b2b2d" },
  { name: "Silver", hex: "#e3e4e5" },
];

export function MacbookProBuyExperience({ catalogProduct }: { catalogProduct?: Product }) {
  const { addItem } = useCart();

  const is16Initial = catalogProduct?.slug?.includes("16") ?? false;
  const isMaxInitial = catalogProduct?.slug?.includes("max") ?? false;

  const [screenSize, setScreenSize] = useState<"14-inch" | "16-inch">(is16Initial ? "16-inch" : "14-inch");
  const [chip, setChip] = useState<"M4" | "M4 Pro" | "M4 Max">(isMaxInitial ? "M4 Max" : is16Initial ? "M4 Pro" : "M4");
  const [finish, setFinish] = useState("Space Black");
  const [memory, setMemory] = useState(is16Initial || isMaxInitial ? "36GB" : "24GB");
  const [storage, setStorage] = useState(is16Initial ? "1TB" : "512GB");
  const [tradeIn, setTradeIn] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("Mobile Money on Confirmation");
  const [fulfillment, setFulfillment] = useState<"pickup" | "delivery">("pickup");
  const [activeThumb, setActiveThumb] = useState(0);
  const [notice, setNotice] = useState("");

  // Sync state if catalogProduct arrives or updates
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

  // Adjust chip options when switching between 14-inch and 16-inch
  // 16-inch MacBook Pro starts with M4 Pro or M4 Max
  useEffect(() => {
    if (screenSize === "16-inch" && chip === "M4") {
      setChip("M4 Pro");
      if (memory === "16GB") setMemory("24GB");
      if (storage === "512GB") setStorage("1TB");
    }
  }, [screenSize, chip, memory, storage]);

  const proImage14 = localCatalogueImageBySlug["macbook-pro-14-m4"] || "/products/campaigns/macbook-pro-floating.webp";
  const proImage16 = localCatalogueImageBySlug["macbook-pro-16-m4-pro-max"] || "/products/campaigns/macbook-pro-floating.webp";

  const currentDisplayImg = screenSize === "16-inch" ? proImage16 : proImage14;

  const thumbnails = [
    { src: currentDisplayImg, alt: `MacBook Pro ${screenSize} in ${finish}` },
    { src: "/products/campaigns/macbook-pro-floating.webp", alt: "MacBook Pro Liquid Retina XDR display with pro ports" },
    { src: "/products/campaigns/macbook-pro-banner.webp", alt: "MacBook Pro high-performance architecture" },
  ];

  const activeImage = thumbnails[activeThumb]?.src || currentDisplayImg;

  const priceLabel = catalogProduct && catalogProduct.price > 0 && !catalogProduct.priceOnRequest
    ? formatGhs(catalogProduct.price)
    : "Price confirmed on enquiry";

  const fullConfigurationTitle = `MacBook Pro ${screenSize} (${chip}, ${memory} RAM, ${storage} SSD, ${finish})`;

  const whatsAppEnquiry = whatsappUrl(
    `Hello Buy & Sell GH, I would like to order/enquire about ${fullConfigurationTitle}. Details: Screen: ${screenSize}, Chip: Apple ${chip}, Memory: ${memory}, Storage: ${storage}, Finish: ${finish}, Payment: ${paymentMethod}, Fulfillment: ${fulfillment === "pickup" ? "In-Store Pickup (Dome)" : "Doorstep Delivery"}${tradeIn ? ", Trade-in: Yes" : ""}. Please confirm availability and current Ghana pricing.`
  );

  const handleAddToBag = () => {
    if (catalogProduct && catalogProduct.price > 0 && !catalogProduct.priceOnRequest) {
      const added = addItem(catalogProduct, storage, `${finish} / ${chip} / ${memory}`, 1);
      if (added) {
        setNotice(`${fullConfigurationTitle} added to your bag.`);
      }
    } else {
      setNotice(`Your request for ${fullConfigurationTitle} is ready. Connecting to WhatsApp enquiry...`);
      window.open(whatsAppEnquiry, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <BuyLayout
      name="MacBook Pro"
      categoryLabel="Mac"
      categoryPath="/mac"
      activeImageSrc={activeImage}
      activeImageAlt={`MacBook Pro ${screenSize}`}
      priceLabel={priceLabel}
      badge="Apple Silicon Pro"
      thumbnails={thumbnails}
      activeThumbnailIndex={activeThumb}
      onSelectThumbnail={setActiveThumb}
      mobileActionLabel="Add to Bag"
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
            onClick={() => setScreenSize("14-inch")}
          />
          <BuyOptionCard
            title="16-inch MacBook Pro"
            subtitle="16.2-inch Liquid Retina XDR. Maximum thermal headroom, expansive canvas, and up to 24 hours battery life."
            selected={screenSize === "16-inch"}
            onClick={() => setScreenSize("16-inch")}
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
              onClick={() => setChip("M4")}
            />
          )}
          <BuyOptionCard
            title="Apple M4 Pro chip"
            subtitle="Up to 14-core CPU, up to 20-core GPU. Engineered for code compilation, 3D rendering, and multitrack audio production."
            selected={chip === "M4 Pro"}
            onClick={() => setChip("M4 Pro")}
          />
          <BuyOptionCard
            title="Apple M4 Max chip"
            subtitle="Up to 16-core CPU, up to 40-core GPU. Colossal power ceiling for massive 3D scenes, 8K ProRes video, and machine learning."
            selected={chip === "M4 Max"}
            onClick={() => setChip("M4 Max")}
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
          onSelect={(c) => {
            setFinish(c);
            setActiveThumb(0);
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
              onClick={() => setMemory("16GB")}
            />
          )}
          <BuyOptionCard
            title="24GB Unified Memory"
            subtitle="Recommended standard for heavy multitasking, video timelines, and virtualization."
            selected={memory === "24GB"}
            onClick={() => setMemory("24GB")}
          />
          {(chip === "M4 Pro" || chip === "M4 Max") && (
            <BuyOptionCard
              title="36GB Unified Memory"
              subtitle="Expansive headroom for large datasets, multi-app production, and motion graphics."
              selected={memory === "36GB"}
              onClick={() => setMemory("36GB")}
            />
          )}
          {chip === "M4 Pro" && (
            <BuyOptionCard
              title="48GB Unified Memory"
              subtitle="Advanced workstation capacity for complex compilation and high-resolution media."
              selected={memory === "48GB"}
              onClick={() => setMemory("48GB")}
            />
          )}
          {chip === "M4 Max" && (
            <>
              <BuyOptionCard
                title="64GB Unified Memory"
                subtitle="High-end workstation memory for extreme 3D render pipelines and large language models."
                selected={memory === "64GB"}
                onClick={() => setMemory("64GB")}
              />
              <BuyOptionCard
                title="128GB Unified Memory"
                subtitle="The ultimate unified memory ceiling for demanding film studios and enterprise engineers."
                selected={memory === "128GB"}
                onClick={() => setMemory("128GB")}
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
              onClick={() => setStorage("512GB")}
            />
          )}
          <BuyOptionCard
            title="1TB SSD"
            subtitle="Recommended balance for professional projects, 4K footage, and sound libraries."
            selected={storage === "1TB"}
            onClick={() => setStorage("1TB")}
          />
          <BuyOptionCard
            title="2TB SSD"
            subtitle="Expansive capacity for large media archives, local databases, and heavy project caches."
            selected={storage === "2TB"}
            onClick={() => setStorage("2TB")}
          />
          <BuyOptionCard
            title="4TB SSD"
            subtitle="High-capacity storage built for demanding on-set DIT and extensive studio libraries."
            selected={storage === "4TB"}
            onClick={() => setStorage("4TB")}
          />
        </div>
      </section>

      {/* Step 6: Trade-in */}
      <BuyTradeInStep tradeInSelected={tradeIn} onSelect={setTradeIn} />

      {/* Step 7: Payment */}
      <BuyPaymentStep paymentMethod={paymentMethod} onSelect={setPaymentMethod} />

      {/* Step 8: Delivery & Pickup */}
      <BuyFulfillmentStep fulfillment={fulfillment} onSelect={setFulfillment} />

      {/* Step 9: Order Summary & Bag Action */}
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
          { label: "Payment", value: paymentMethod },
          { label: "Fulfillment", value: fulfillment === "pickup" ? "Free In-Store Pickup (Dome Pillar 2)" : "Doorstep Delivery" },
        ]}
        priceLabel={priceLabel}
        onAddToBag={handleAddToBag}
        addToBagLabel="Add to Bag"
        whatsAppHref={whatsAppEnquiry}
        notice={notice}
      />
    </BuyLayout>
  );
}
