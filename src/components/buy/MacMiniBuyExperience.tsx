import React, { useState } from "react";
import { SEO } from "../SEO";
import { formatGhs } from "../../utils/format";
import { resolveConfiguredPrice } from "../../utils/productPricing";
import { whatsappUrl } from "../../utils/whatsapp";
import {
  BuyLayout,
  BuyOptionCard,
  BuyPaymentStep,
  BuySummaryCard,
} from "./BuyPrimitives";
import type { Product } from "../../types/product";

export function MacMiniBuyExperience({ catalogProduct }: { catalogProduct?: Product }) {
  const [chipConfig, setChipConfig] = useState<"M6" | "M5 Pro">("M6");
  const [memory, setMemory] = useState("16GB");
  const [storage, setStorage] = useState("512GB");
  const [paymentMethod, setPaymentMethod] = useState("Mobile Money on Confirmation");
  const [fulfillment, setFulfillment] = useState<"pickup" | "delivery">("pickup");
  const [activeThumb, setActiveThumb] = useState(0);
  const [notice, setNotice] = useState("");

  const thumbnails = [
    { src: "/products/homepage/mac-mini-device.jpg", alt: "Mac mini front view with ports" },
    { src: "/products/homepage/mac-mini.jpg", alt: "Mac mini held in hand" },
  ];

  const activeImage = thumbnails[activeThumb]?.src || "/products/homepage/mac-mini-device.jpg";

  const memoryOptions = chipConfig === "M5 Pro"
    ? ["24GB", "48GB", "64GB"]
    : ["16GB", "24GB", "32GB"];

  const storageOptions = chipConfig === "M5 Pro"
    ? ["512GB", "1TB", "2TB", "4TB"]
    : ["256GB", "512GB", "1TB", "2TB"];

  const configured = resolveConfiguredPrice(catalogProduct, {
    chip: chipConfig,
    memory,
    storage,
  });

  const priceLabel = configured.price > 0
    ? configured.formattedPrice
    : (catalogProduct && catalogProduct.price > 0 && !catalogProduct.priceOnRequest
        ? formatGhs(catalogProduct.price)
        : "Advance Pre-order / Price on arrival");

  const previousPriceLabel = configured.formattedPreviousPrice;

  const fullConfigurationTitle = `Mac mini (${chipConfig === "M6" ? "Apple M6 chip" : "Apple M5 Pro chip"}, ${memory} / ${storage})`;

  const whatsAppEnquiry = whatsappUrl(
    `Hello Buy & Sell GH, I would like to place a Pre-order for ${fullConfigurationTitle}. Price: ${priceLabel}, Payment preference: ${paymentMethod}, Pre-order Fulfillment: ${fulfillment === "pickup" ? "In-Store Pickup (Dome Pillar 2 upon arrival)" : "Priority Delivery on Arrival"}. Please confirm my pre-order registration and current arrival schedule.`
  );

  const handlePreorder = () => {
    setNotice(`Pre-order reservation confirmed for ${fullConfigurationTitle}. Connecting to WhatsApp concierge to finalize...`);
    window.open(whatsAppEnquiry, "_blank", "noopener,noreferrer");
  };

  return (
    <BuyLayout
      name="Mac mini"
      categoryLabel="Mac"
      categoryPath="/mac"
      activeImageSrc={activeImage}
      activeImageAlt="Mac mini compact desktop"
      priceLabel={priceLabel}
      badge="Pre-order"
      thumbnails={thumbnails}
      activeThumbnailIndex={activeThumb}
      onSelectThumbnail={setActiveThumb}
      mobileActionLabel="Pre-order"
      onMobileAction={handlePreorder}
    >
      <SEO
        title="Pre-order Mac mini | Buy & Sell GH"
        description="Pre-order the all-new Mac mini with Apple Silicon in Accra, Ghana. Configure M6 or M5 Pro, memory, storage and secure your advance allocation with Buy & Sell GH."
      />

      <div className="apple-buy-intro">
        <p className="apple-buy-intro-eyebrow">Advance Pre-Order</p>
        <h2 className="apple-buy-intro-title">Pre-order Mac mini</h2>
        <p className="apple-buy-intro-lede">
          More mighty. More mini. At just five inches square, Mac mini is pure powerhouse with comprehensive front and rear ports.
        </p>
      </div>

      {/* Step 1: Model / Chip Configuration */}
      <section className="apple-buy-step">
        <div className="apple-buy-step-header">
          <h3 className="apple-buy-step-title">Chip. <span>Choose your processing architecture.</span></h3>
          <p className="apple-buy-step-subtitle">Select between everyday powerhouse M6 or demanding creative pro M5 Pro.</p>
        </div>
        <div className="apple-buy-cards-grid">
          <BuyOptionCard
            title="Apple M6 Chip"
            subtitle="10-core CPU, 10-core GPU, 16-core Neural Engine. Thunderbolt 4 ports, HDMI, and Gigabit Ethernet."
            selected={chipConfig === "M6"}
            onClick={() => {
              setChipConfig("M6");
              setMemory("16GB");
              setStorage("512GB");
            }}
          />
          <BuyOptionCard
            title="Apple M5 Pro Chip"
            subtitle="12-core CPU, 16-core GPU, 16-core Neural Engine. Thunderbolt 5 ports with up to 120Gb/s bandwidth."
            selected={chipConfig === "M5 Pro"}
            onClick={() => {
              setChipConfig("M5 Pro");
              setMemory("24GB");
              setStorage("512GB");
            }}
          />
        </div>
      </section>

      {/* Step 2: Unified Memory */}
      <section className="apple-buy-step">
        <div className="apple-buy-step-header">
          <h3 className="apple-buy-step-title">Memory. <span>How much unified memory?</span></h3>
          <p className="apple-buy-step-subtitle">High-bandwidth, low-latency unified memory shared between CPU and GPU.</p>
        </div>
        <div className="apple-buy-cards-grid">
          {memoryOptions.map((mem) => (
            <BuyOptionCard
              key={mem}
              title={`${mem} Unified Memory`}
              subtitle={mem === "16GB" || mem === "24GB" ? "Responsive multitasking and fluid everyday workflows" : "Ample memory for intensive software development and 4K creative work"}
              selected={memory === mem}
              onClick={() => setMemory(mem)}
            />
          ))}
        </div>
      </section>

      {/* Step 3: Storage */}
      <section className="apple-buy-step">
        <div className="apple-buy-step-header">
          <h3 className="apple-buy-step-title">Storage. <span>How much SSD capacity?</span></h3>
          <p className="apple-buy-step-subtitle">Superfast SSD storage for rapid boots and project files.</p>
        </div>
        <div className="apple-buy-cards-grid">
          {storageOptions.map((cap) => (
            <BuyOptionCard
              key={cap}
              title={`${cap} SSD`}
              subtitle={cap === "256GB" ? "Entry-level capacity" : cap === "512GB" ? "Recommended capacity for apps & media" : "High-capacity storage for expansive datasets"}
              selected={storage === cap}
              onClick={() => setStorage(cap)}
            />
          ))}
        </div>
      </section>

      {/* Step 4: Payment Preference */}
      <BuyPaymentStep paymentMethod={paymentMethod} onSelect={setPaymentMethod} />

      {/* Step 5: Pre-order Fulfillment */}
      <section className="apple-buy-step">
        <div className="apple-buy-step-header">
          <h3 className="apple-buy-step-title">Pre-order Fulfillment. <span>Choose pickup or delivery upon arrival.</span></h3>
          <p className="apple-buy-step-subtitle">No advance deposit required until your allocated unit is ready for release.</p>
        </div>
        <div className="apple-buy-cards-grid">
          <BuyOptionCard
            title="In-Store Pickup upon Arrival"
            subtitle="Pick up and test in Dome Pillar 2, No Visa, Accra the moment inventory lands."
            selected={fulfillment === "pickup"}
            onClick={() => setFulfillment("pickup")}
          />
          <BuyOptionCard
            title="Priority Delivery on Arrival"
            subtitle="Immediate dispatch to your doorstep across Greater Accra or nationwide Ghana."
            selected={fulfillment === "delivery"}
            onClick={() => setFulfillment("delivery")}
          />
        </div>
      </section>

      {/* Step 6: Order Summary & Pre-order Action */}
      <BuySummaryCard
        title="Your Pre-order Mac mini"
        items={[
          { label: "Model", value: "Mac mini (Silver Aluminum)" },
          { label: "Chip", value: chipConfig === "M6" ? "Apple M6 (10-core CPU / 10-core GPU)" : "Apple M5 Pro (12-core CPU / 16-core GPU)" },
          { label: "Unified Memory", value: `${memory} Unified Memory` },
          { label: "Storage", value: `${storage} SSD Storage` },
          { label: "Payment Preference", value: paymentMethod },
          { label: "Fulfillment", value: fulfillment === "pickup" ? "In-Store Pickup (Dome Pillar 2 upon arrival)" : "Priority Delivery on Arrival" },
        ]}
        priceLabel={priceLabel}
        previousPriceLabel={previousPriceLabel}
        onAddToBag={handlePreorder}
        addToBagLabel="Pre-order with Buy & Sell GH"
        whatsAppHref={whatsAppEnquiry}
        notice={notice}
        isPreorder={true}
      />
    </BuyLayout>
  );
}
