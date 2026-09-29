import React, { useState } from "react";
import { SEO } from "../SEO";
import { useCart } from "../../context/CartContext";
import { formatGhs } from "../../utils/format";
import { whatsappUrl } from "../../utils/whatsapp";
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

const ULTRA_FINISHES: ColorOption[] = [
  { name: "Natural Titanium", hex: "#9b968e" },
  { name: "Black Titanium", hex: "#232324" },
];

const ULTRA_BANDS = [
  { name: "Alpine Loop", desc: "Two textile layers woven into one continuous piece without stitching. Titanium G-hook ensures secure fit for outdoor adventure." },
  { name: "Trail Loop", desc: "Lightweight, thin and flexible fabric weave with convenient pull tab for rapid adjustments on runs and endurance training." },
  { name: "Ocean Band", desc: "Molded high-performance fluoroelastomer with tubular geometry stretches for a secure fit over a wetsuit for diving and water sports." },
];

const ULTRA_BAND_COLORS: ColorOption[] = [
  { name: "Safety Orange", hex: "#ff6a00" },
  { name: "Dark Charcoal", hex: "#2a2d32" },
  { name: "Ice Blue", hex: "#7ba5be" },
];

export function WatchUltraBuyExperience({ catalogProduct }: { catalogProduct?: Product }) {
  const { addItem } = useCart();

  const [finish, setFinish] = useState("Natural Titanium");
  const [bandStyle, setBandStyle] = useState("Alpine Loop");
  const [bandColor, setBandColor] = useState("Safety Orange");
  const [bandDimension, setBandDimension] = useState<"Medium" | "Small" | "Large">("Medium");
  const [tradeIn, setTradeIn] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("Mobile Money on Confirmation");
  const [fulfillment, setFulfillment] = useState<"pickup" | "delivery">("pickup");
  const [notice, setNotice] = useState("");

  const activeImage = "/products/homepage/watch-ultra-4.webp";

  const priceLabel = catalogProduct && catalogProduct.price > 0 && !catalogProduct.priceOnRequest
    ? formatGhs(catalogProduct.price)
    : "Price confirmed on enquiry";

  const fullConfigurationTitle = `Apple Watch Ultra 4 (49mm, ${finish})`;

  const whatsAppEnquiry = whatsappUrl(
    `Hello Buy & Sell GH, I would like to order/enquire about ${fullConfigurationTitle}. Band: ${bandStyle} (${bandColor}, ${bandDimension}), Connectivity: GPS + Cellular (Standard), Payment: ${paymentMethod}, Fulfillment: ${fulfillment === "pickup" ? "In-Store Pickup (Dome)" : "Doorstep Delivery"}${tradeIn ? ", Trade-in: Yes" : ""}. Please confirm availability and current Ghana pricing.`
  );

  const handleAddToBag = () => {
    if (catalogProduct && catalogProduct.price > 0 && !catalogProduct.priceOnRequest) {
      const added = addItem(catalogProduct, "GPS + Cellular", `${finish} / ${bandStyle}`, 1);
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
      name="Apple Watch Ultra 4"
      categoryLabel="Watch"
      categoryPath="/watch"
      activeImageSrc={activeImage}
      activeImageAlt="Apple Watch Ultra 4 in rugged titanium"
      priceLabel={priceLabel}
      badge="Ultra"
      darkStage={true}
      mobileActionLabel="Add to Bag"
      onMobileAction={handleAddToBag}
    >
      <SEO
        title="Buy Apple Watch Ultra 4 | Buy & Sell GH"
        description="Configure your Apple Watch Ultra 4 in Accra, Ghana. 49mm aerospace-grade titanium, GPS + Cellular, Alpine, Trail and Ocean bands with Buy & Sell GH."
      />

      <div className="apple-buy-intro">
        <p className="apple-buy-intro-eyebrow">Apple Watch Ultra 4</p>
        <h2 className="apple-buy-intro-title">Buy Apple Watch Ultra 4</h2>
        <p className="apple-buy-intro-lede">
          49mm aerospace-grade titanium case, precision dual-frequency GPS, 100m water resistance, and up to 72 hours of battery life in Low Power Mode.
        </p>
      </div>

      {/* Step 1: Titanium Finish */}
      <section className="apple-buy-step">
        <div className="apple-buy-step-header">
          <h3 className="apple-buy-step-title">Finish. <span>Aerospace-grade titanium.</span></h3>
          <p className="apple-buy-step-subtitle">High-durability titanium enclosure with raised bezel protecting the sapphire crystal.</p>
        </div>
        <BuyColorSwatches
          colors={ULTRA_FINISHES}
          selectedColor={finish}
          onSelect={setFinish}
        />
      </section>

      {/* Step 2: Connectivity Display */}
      <section className="apple-buy-step">
        <div className="apple-buy-step-header">
          <h3 className="apple-buy-step-title">Connectivity. <span>Built-in standard.</span></h3>
          <p className="apple-buy-step-subtitle">Every Apple Watch Ultra comes equipped with cellular connectivity.</p>
        </div>
        <div className="apple-buy-cards-grid apple-buy-cards-grid-single">
          <BuyOptionCard
            title="GPS + Cellular (Standard)"
            subtitle="Standalone cellular freedom with dual-frequency GPS and international roaming support."
            selected={true}
            onClick={() => {}}
          />
        </div>
      </section>

      {/* Step 3: Ultra Band Style */}
      <section className="apple-buy-step">
        <div className="apple-buy-step-header">
          <h3 className="apple-buy-step-title">Band. <span>Engineered for extremes.</span></h3>
          <p className="apple-buy-step-subtitle">Specialized bands tailored for outdoor endurance, exploration, and deep-water diving.</p>
        </div>
        <div className="apple-buy-cards-grid apple-buy-cards-grid-single">
          {ULTRA_BANDS.map((b) => (
            <BuyOptionCard
              key={b.name}
              title={b.name}
              subtitle={b.desc}
              selected={bandStyle === b.name}
              onClick={() => setBandStyle(b.name)}
            />
          ))}
        </div>
      </section>

      {/* Step 4: Band Color & Size */}
      <section className="apple-buy-step">
        <div className="apple-buy-step-header">
          <h3 className="apple-buy-step-title">Band Color &amp; Wrist Size.</h3>
          <p className="apple-buy-step-subtitle">Select colorway and strap length.</p>
        </div>
        <BuyColorSwatches
          colors={ULTRA_BAND_COLORS}
          selectedColor={bandColor}
          onSelect={setBandColor}
        />
        <div className="apple-buy-cards-grid" style={{ marginTop: "12px" }}>
          <BuyOptionCard
            title="Small"
            subtitle="Fits 130–160mm wrists"
            selected={bandDimension === "Small"}
            onClick={() => setBandDimension("Small")}
          />
          <BuyOptionCard
            title="Medium"
            subtitle="Fits 145–190mm wrists"
            selected={bandDimension === "Medium"}
            onClick={() => setBandDimension("Medium")}
          />
          <BuyOptionCard
            title="Large"
            subtitle="Fits 165–210mm wrists"
            selected={bandDimension === "Large"}
            onClick={() => setBandDimension("Large")}
          />
        </div>
      </section>

      {/* Step 5: Trade-in */}
      <BuyTradeInStep tradeInSelected={tradeIn} onSelect={setTradeIn} />

      {/* Step 6: Payment */}
      <BuyPaymentStep paymentMethod={paymentMethod} onSelect={setPaymentMethod} />

      {/* Step 7: Delivery & Pickup */}
      <BuyFulfillmentStep fulfillment={fulfillment} onSelect={setFulfillment} />

      {/* Step 8: Order Summary & Bag Action */}
      <BuySummaryCard
        title="Your Apple Watch Ultra 4"
        items={[
          { label: "Model", value: "Apple Watch Ultra 4" },
          { label: "Case", value: `49mm Titanium (${finish})` },
          { label: "Connectivity", value: "GPS + Cellular (Standard)" },
          { label: "Band", value: `${bandStyle} (${bandColor}, ${bandDimension})` },
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
