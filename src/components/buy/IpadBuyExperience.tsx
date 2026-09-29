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

const IPAD_AIR_COLORS: ColorOption[] = [
  { name: "Blue", hex: "#7ca2be" },
  { name: "Purple", hex: "#b5a5c6" },
  { name: "Starlight", hex: "#e8dfd4" },
  { name: "Space Gray", hex: "#68696d" },
];

const IPAD_FINISH_IMAGE_MAP: Record<string, string> = {
  Blue: "/products/campaigns/ipad-air-blue.webp",
  "Space Gray": "/products/campaigns/ipad-air-space-gray.webp",
  Starlight: "/products/homepage/ipad-air.jpg",
  Purple: "/products/campaigns/ipad-air-colors.webp",
};

export function IpadBuyExperience({ catalogProduct }: { catalogProduct?: Product }) {
  const { addItem } = useCart();

  const [screenSize, setScreenSize] = useState<"11-inch" | "13-inch">("11-inch");
  const [finish, setFinish] = useState("Blue");
  const [storage, setStorage] = useState("128GB");
  const [connectivity, setConnectivity] = useState<"Wi-Fi" | "Wi-Fi + Cellular">("Wi-Fi");
  const [tradeIn, setTradeIn] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("Mobile Money on Confirmation");
  const [fulfillment, setFulfillment] = useState<"pickup" | "delivery">("pickup");
  const [activeThumb, setActiveThumb] = useState(0);
  const [notice, setNotice] = useState("");

  const currentFinishImg = IPAD_FINISH_IMAGE_MAP[finish] || "/products/campaigns/ipad-air-blue.webp";

  const thumbnails = [
    { src: currentFinishImg, alt: `iPad Air in ${finish}` },
    { src: "/products/campaigns/ipad-air-colors.webp", alt: "iPad Air anodized aluminum color finishes" },
    { src: "/products/campaigns/ipad-air-detail.webp", alt: "iPad Air camera and landscape audio detail" },
  ];

  const activeImage = thumbnails[activeThumb]?.src || currentFinishImg;

  const priceLabel = catalogProduct && catalogProduct.price > 0 && !catalogProduct.priceOnRequest
    ? formatGhs(catalogProduct.price)
    : "Price confirmed on enquiry";

  const fullConfigurationTitle = `iPad Air ${screenSize} (${storage}, ${finish})`;

  const whatsAppEnquiry = whatsappUrl(
    `Hello Buy & Sell GH, I would like to order/enquire about ${fullConfigurationTitle}. Connectivity: ${connectivity}, Payment: ${paymentMethod}, Fulfillment: ${fulfillment === "pickup" ? "In-Store Pickup (Dome)" : "Doorstep Delivery"}${tradeIn ? ", Trade-in: Yes" : ""}. Please confirm availability and current Ghana pricing.`
  );

  const handleAddToBag = () => {
    if (catalogProduct && catalogProduct.price > 0 && !catalogProduct.priceOnRequest) {
      const added = addItem(catalogProduct, storage, `${finish} / ${connectivity}`, 1);
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
      name="iPad Air"
      categoryLabel="iPad"
      categoryPath="/ipad"
      activeImageSrc={activeImage}
      activeImageAlt="iPad Air"
      priceLabel={priceLabel}
      badge="iPad Air"
      thumbnails={thumbnails}
      activeThumbnailIndex={activeThumb}
      onSelectThumbnail={setActiveThumb}
      mobileActionLabel="Add to Bag"
      onMobileAction={handleAddToBag}
    >
      <SEO
        title="Buy iPad Air | Buy & Sell GH"
        description="Configure your iPad Air in Accra, Ghana. Choose 11-inch or 13-inch Liquid Retina display, storage, vibrant color finishes and connectivity with Buy & Sell GH."
      />

      <div className="apple-buy-intro">
        <p className="apple-buy-intro-eyebrow">iPad Air</p>
        <h2 className="apple-buy-intro-title">Buy iPad Air</h2>
        <p className="apple-buy-intro-lede">
          Fresh, powerful and colourful. Liquid Retina display, Apple Silicon performance, Apple Pencil Pro support, and all-day versatility.
        </p>
      </div>

      {/* Step 1: Model / Screen Size */}
      <section className="apple-buy-step">
        <div className="apple-buy-step-header">
          <h3 className="apple-buy-step-title">Model &amp; Size. <span>Pick your display size.</span></h3>
          <p className="apple-buy-step-subtitle">Two sizes designed for portable note-taking or expansive split-view sketching.</p>
        </div>
        <div className="apple-buy-cards-grid">
          <BuyOptionCard
            title="11-inch iPad Air"
            subtitle="11-inch Liquid Retina display. Lightweight, ultraportable design perfect for reading and everyday travel."
            selected={screenSize === "11-inch"}
            onClick={() => setScreenSize("11-inch")}
          />
          <BuyOptionCard
            title="13-inch iPad Air"
            subtitle="13-inch Liquid Retina display. 30% more screen area for multitasking with Stage Manager and creative apps."
            selected={screenSize === "13-inch"}
            onClick={() => setScreenSize("13-inch")}
          />
        </div>
      </section>

      {/* Step 2: Color Finish */}
      <section className="apple-buy-step">
        <div className="apple-buy-step-header">
          <h3 className="apple-buy-step-title">Finish. <span>Pick your favorite colour.</span></h3>
          <p className="apple-buy-step-subtitle">Rich anodized aluminum enclosures that resist fingerprints and scratches.</p>
        </div>
        <BuyColorSwatches
          colors={IPAD_AIR_COLORS}
          selectedColor={finish}
          onSelect={(c) => {
            setFinish(c);
            setActiveThumb(0);
          }}
        />
      </section>

      {/* Step 3: Storage */}
      <section className="apple-buy-step">
        <div className="apple-buy-step-header">
          <h3 className="apple-buy-step-title">Storage. <span>How much capacity do you need?</span></h3>
          <p className="apple-buy-step-subtitle">Room for your textbooks, drawing canvases, downloaded media, and projects.</p>
        </div>
        <div className="apple-buy-cards-grid">
          {["128GB", "256GB", "512GB", "1TB"].map((cap) => (
            <BuyOptionCard
              key={cap}
              title={cap}
              subtitle={cap === "128GB" ? "Essential storage for study and daily apps" : cap === "256GB" ? "Popular sweet spot for apps and creative work" : "Pro capacity for large 4K video files and illustration files"}
              selected={storage === cap}
              onClick={() => setStorage(cap)}
            />
          ))}
        </div>
      </section>

      {/* Step 4: Connectivity */}
      <section className="apple-buy-step">
        <div className="apple-buy-step-header">
          <h3 className="apple-buy-step-title">Connectivity. <span>Wi-Fi or Cellular.</span></h3>
          <p className="apple-buy-step-subtitle">Keep connected wherever your creative work takes you.</p>
        </div>
        <div className="apple-buy-cards-grid">
          <BuyOptionCard
            title="Wi-Fi"
            subtitle="Ultra-fast Wi-Fi 6E connectivity for home, office and school networks."
            selected={connectivity === "Wi-Fi"}
            onClick={() => setConnectivity("Wi-Fi")}
          />
          <BuyOptionCard
            title="Wi-Fi + Cellular"
            subtitle="Connect to 5G cellular data networks when Wi-Fi is unavailable on the go."
            selected={connectivity === "Wi-Fi + Cellular"}
            onClick={() => setConnectivity("Wi-Fi + Cellular")}
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
        title="Your iPad Air"
        items={[
          { label: "Model & Size", value: `${screenSize} iPad Air` },
          { label: "Finish", value: finish },
          { label: "Storage", value: storage },
          { label: "Connectivity", value: connectivity },
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
