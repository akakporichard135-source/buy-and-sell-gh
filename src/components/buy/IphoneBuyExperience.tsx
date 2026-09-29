import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
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

const IPHONE_18_COLORS: ColorOption[] = [
  { name: "Silver", hex: "#e2e4e6" },
  { name: "Titanium Coffee", hex: "#5c534a" },
  { name: "Burgundy", hex: "#58232c" },
];

const FINISH_IMAGE_MAP: Record<string, string> = {
  Silver: "/products/campaigns/iphone-18-pro-silver.webp",
  "Titanium Coffee": "/products/campaigns/iphone-18-pro-coffee.webp",
  Burgundy: "/products/campaigns/iphone-18-pro-burgundy-finish.webp",
};

export function IphoneBuyExperience({ catalogProduct }: { catalogProduct?: Product }) {
  const navigate = useNavigate();
  const { addItem } = useCart();

  const [model, setModel] = useState<"iPhone 18 Pro" | "iPhone 18 Pro Max">("iPhone 18 Pro");
  const [finish, setFinish] = useState("Silver");
  const [storage, setStorage] = useState("256GB");
  const [tradeIn, setTradeIn] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("Mobile Money on Confirmation");
  const [fulfillment, setFulfillment] = useState<"pickup" | "delivery">("pickup");
  const [activeThumb, setActiveThumb] = useState(0);
  const [notice, setNotice] = useState("");

  const currentFinishImage = FINISH_IMAGE_MAP[finish] || FINISH_IMAGE_MAP.Silver;

  const thumbnails = [
    { src: currentFinishImage, alt: `${model} in ${finish}` },
    { src: "/products/campaigns/iphone-18-pro-front.webp", alt: `${model} Super Retina display` },
    { src: "/products/campaigns/iphone-18-pro-lineup.webp", alt: `${model} lineup` },
  ];

  const activeImage = thumbnails[activeThumb]?.src || currentFinishImage;

  const storageOptions = model === "iPhone 18 Pro Max"
    ? ["256GB", "512GB", "1TB", "2TB"]
    : ["256GB", "512GB", "1TB"];

  const priceLabel = catalogProduct && catalogProduct.price > 0 && !catalogProduct.priceOnRequest
    ? formatGhs(catalogProduct.price)
    : "Price confirmed on enquiry";

  const whatsAppEnquiry = whatsappUrl(
    `Hello Buy & Sell GH, I would like to order/enquire about ${model}. Configuration: ${storage}, Finish: ${finish}, Payment: ${paymentMethod}, Fulfillment: ${fulfillment === "pickup" ? "In-Store Pickup (Dome)" : "Doorstep Delivery"}${tradeIn ? ", Trade-in: Yes" : ""}. Please confirm availability and current Ghana pricing.`
  );

  const handleAddToBag = () => {
    if (catalogProduct && catalogProduct.price > 0 && !catalogProduct.priceOnRequest) {
      const added = addItem(catalogProduct, storage, finish, 1);
      if (added) {
        setNotice(`${model} (${storage}, ${finish}) added to your bag.`);
      }
    } else {
      setNotice(`Your request for ${model} (${storage}, ${finish}) is ready. Connecting to WhatsApp enquiry...`);
      window.open(whatsAppEnquiry, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <BuyLayout
      name={model}
      categoryLabel="iPhone"
      categoryPath="/iphone"
      activeImageSrc={activeImage}
      activeImageAlt={`${model} ${finish}`}
      priceLabel={priceLabel}
      badge="Flagship Pro"
      thumbnails={thumbnails}
      activeThumbnailIndex={activeThumb}
      onSelectThumbnail={setActiveThumb}
      mobileActionLabel="Add to Bag"
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
            }}
          />
          <BuyOptionCard
            title="iPhone 18 Pro Max"
            subtitle="6.9-inch Super Retina XDR display with expansive canvas and extended battery life."
            selected={model === "iPhone 18 Pro Max"}
            onClick={() => setModel("iPhone 18 Pro Max")}
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
          colors={IPHONE_18_COLORS}
          selectedColor={finish}
          onSelect={(c) => {
            setFinish(c);
            setActiveThumb(0);
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
          {storageOptions.map((opt) => (
            <BuyOptionCard
              key={opt}
              title={opt}
              subtitle={opt === "256GB" ? "Popular capacity for daily pro use" : opt === "512GB" ? "Ample space for extensive 4K capture" : "Maximum capacity for demanding media workflows"}
              selected={storage === opt}
              onClick={() => setStorage(opt)}
            />
          ))}
        </div>
      </section>

      {/* Step 4: Trade-in */}
      <BuyTradeInStep tradeInSelected={tradeIn} onSelect={setTradeIn} />

      {/* Step 5: Payment */}
      <BuyPaymentStep paymentMethod={paymentMethod} onSelect={setPaymentMethod} />

      {/* Step 6: Delivery & Pickup */}
      <BuyFulfillmentStep fulfillment={fulfillment} onSelect={setFulfillment} />

      {/* Step 7: Order Summary & Bag Action */}
      <BuySummaryCard
        title={`Your ${model}`}
        items={[
          { label: "Model", value: model },
          { label: "Finish", value: finish },
          { label: "Storage", value: storage },
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
