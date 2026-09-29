import React, { useState } from "react";
import { SEO } from "../SEO";
import { useCart } from "../../context/CartContext";
import { formatGhs } from "../../utils/format";
import { whatsappUrl } from "../../utils/whatsapp";
import {
  BuyLayout,
  BuyOptionCard,
  BuyPaymentStep,
  BuyFulfillmentStep,
  BuySummaryCard,
} from "./BuyPrimitives";
import type { Product } from "../../types/product";

const AIRPODS_EDITIONS = [
  {
    name: "AirPods 5",
    desc: "Personalized Spatial Audio with dynamic head tracking, refined acoustic architecture, and USB-C Charging Case.",
  },
  {
    name: "AirPods 5 with Active Noise Cancellation",
    desc: "Active Noise Cancellation, Adaptive Audio, Transparency mode, and Wireless Charging Case with built-in speaker for Find My.",
  },
];

export function AirpodsBuyExperience({ catalogProduct }: { catalogProduct?: Product }) {
  const { addItem } = useCart();

  const [edition, setEdition] = useState("AirPods 5");
  const [paymentMethod, setPaymentMethod] = useState("Mobile Money on Confirmation");
  const [fulfillment, setFulfillment] = useState<"pickup" | "delivery">("pickup");
  const [activeThumb, setActiveThumb] = useState(0);
  const [notice, setNotice] = useState("");

  const thumbnails = [
    { src: "/products/campaigns/airpods-5-product.webp", alt: "AirPods 5 in open charging case" },
    { src: "/products/campaigns/airpods-5-earbuds.webp", alt: "AirPods 5 acoustic vents and ports" },
    { src: "/products/campaigns/airpods-5-front.webp", alt: "AirPods 5 front upright charging case" },
  ];

  const activeImage = thumbnails[activeThumb]?.src || "/products/campaigns/airpods-5-product.webp";

  const priceLabel = catalogProduct && catalogProduct.price > 0 && !catalogProduct.priceOnRequest
    ? formatGhs(catalogProduct.price)
    : "Price confirmed on enquiry";

  const whatsAppEnquiry = whatsappUrl(
    `Hello Buy & Sell GH, I would like to order/enquire about ${edition}. Finish: White, Payment: ${paymentMethod}, Fulfillment: ${fulfillment === "pickup" ? "In-Store Pickup (Dome)" : "Doorstep Delivery"}. Please confirm availability and current Ghana pricing.`
  );

  const handleAddToBag = () => {
    if (catalogProduct && catalogProduct.price > 0 && !catalogProduct.priceOnRequest) {
      const added = addItem(catalogProduct, edition, "White", 1);
      if (added) {
        setNotice(`${edition} added to your bag.`);
      }
    } else {
      setNotice(`Your request for ${edition} is ready. Connecting to WhatsApp enquiry...`);
      window.open(whatsAppEnquiry, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <BuyLayout
      name="AirPods 5"
      categoryLabel="AirPods"
      categoryPath="/airpods"
      activeImageSrc={activeImage}
      activeImageAlt="AirPods 5 in pure white"
      priceLabel={priceLabel}
      badge="Wireless Audio"
      thumbnails={thumbnails}
      activeThumbnailIndex={activeThumb}
      onSelectThumbnail={setActiveThumb}
      mobileActionLabel="Add to Bag"
      onMobileAction={handleAddToBag}
    >
      <SEO
        title="Buy AirPods 5 | Buy & Sell GH"
        description="Buy original AirPods 5 in Accra, Ghana. Clean open-ear design, USB-C case, spatial audio, and trusted pickup or delivery with Buy & Sell GH."
      />

      <div className="apple-buy-intro">
        <p className="apple-buy-intro-eyebrow">AirPods 5</p>
        <h2 className="apple-buy-intro-title">Buy AirPods 5</h2>
        <p className="apple-buy-intro-lede">
          Acoustic clarity redefined. Contoured fit for all-day comfort, rich bass, and seamless connection across all your Apple devices.
        </p>
      </div>

      {/* Step 1: Model / Edition */}
      <section className="apple-buy-step">
        <div className="apple-buy-step-header">
          <h3 className="apple-buy-step-title">Edition. <span>Select your listening experience.</span></h3>
          <p className="apple-buy-step-subtitle">Choose between open acoustic freedom or advanced Active Noise Cancellation.</p>
        </div>
        <div className="apple-buy-cards-grid apple-buy-cards-grid-single">
          {AIRPODS_EDITIONS.map((ed) => (
            <BuyOptionCard
              key={ed.name}
              title={ed.name}
              subtitle={ed.desc}
              selected={edition === ed.name}
              onClick={() => setEdition(ed.name)}
            />
          ))}
        </div>
      </section>

      {/* Step 2: Finish Display */}
      <section className="apple-buy-step">
        <div className="apple-buy-step-header">
          <h3 className="apple-buy-step-title">Finish. <span>Pure White.</span></h3>
          <p className="apple-buy-step-subtitle">High-gloss white acoustic shell with magnetic closing charging case.</p>
        </div>
        <div className="apple-buy-cards-grid apple-buy-cards-grid-single">
          <BuyOptionCard
            title="White"
            subtitle="Iconic glossy white charging case with green status indicator LED and USB-C port."
            selected={true}
            onClick={() => {}}
          />
        </div>
      </section>

      {/* Step 3: Payment */}
      <BuyPaymentStep paymentMethod={paymentMethod} onSelect={setPaymentMethod} />

      {/* Step 4: Delivery & Pickup */}
      <BuyFulfillmentStep fulfillment={fulfillment} onSelect={setFulfillment} />

      {/* Step 5: Order Summary & Bag Action */}
      <BuySummaryCard
        title="Your AirPods 5"
        items={[
          { label: "Edition", value: edition },
          { label: "Finish", value: "White" },
          { label: "Charging Case", value: "USB-C Case" },
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
