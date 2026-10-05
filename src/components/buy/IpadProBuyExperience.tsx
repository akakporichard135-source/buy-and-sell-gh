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

const IPAD_PRO_FINISHES: ColorOption[] = [
  { name: "Space Black", hex: "#2b2b2d" },
  { name: "Silver", hex: "#e3e4e5" },
];

export function IpadProBuyExperience({ catalogProduct }: { catalogProduct?: Product }) {
  const { addItem } = useCart();

  const is13Initial = catalogProduct?.slug?.includes("13") ?? false;

  const [screenSize, setScreenSize] = useState<"11-inch" | "13-inch">(is13Initial ? "13-inch" : "11-inch");
  const [finish, setFinish] = useState("Space Black");
  const [storage, setStorage] = useState("256GB");
  const [glass, setGlass] = useState<"Standard glass" | "Nano-texture glass">("Standard glass");
  const [connectivity, setConnectivity] = useState<"Wi-Fi" | "Wi-Fi + Cellular">("Wi-Fi");
  const [tradeIn, setTradeIn] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("Mobile Money on Confirmation");
  const [fulfillment, setFulfillment] = useState<"pickup" | "delivery">("pickup");
  const [activeThumb, setActiveThumb] = useState(0);
  const [notice, setNotice] = useState("");

  // Sync state if catalogProduct changes
  useEffect(() => {
    if (catalogProduct) {
      if (catalogProduct.slug.includes("13")) {
        setScreenSize("13-inch");
      }
    }
  }, [catalogProduct]);

  // Nano-texture glass is only available on 1TB and 2TB models
  useEffect(() => {
    if (storage !== "1TB" && storage !== "2TB" && glass === "Nano-texture glass") {
      setGlass("Standard glass");
    }
  }, [storage, glass]);

  const proImage11 = localCatalogueImageBySlug["ipad-pro-11-inch-m4"] || "/products/campaigns/ipad-air-colors.webp";
  const proImage13 = localCatalogueImageBySlug["ipad-pro-13-inch-m4"] || "/products/campaigns/ipad-air-colors.webp";

  const currentDisplayImg = screenSize === "13-inch" ? proImage13 : proImage11;

  const thumbnails = [
    { src: currentDisplayImg, alt: `iPad Pro ${screenSize} in ${finish}` },
    { src: "/products/campaigns/ipad-air-detail.webp", alt: "iPad Pro ultra-thin design and camera system" },
    { src: "/products/campaigns/ipad-air-space-gray.webp", alt: "iPad Pro in Space Black" },
  ];

  const activeImage = thumbnails[activeThumb]?.src || currentDisplayImg;

  const priceLabel = catalogProduct && catalogProduct.price > 0 && !catalogProduct.priceOnRequest
    ? formatGhs(catalogProduct.price)
    : "Price confirmed on enquiry";

  const fullConfigurationTitle = `iPad Pro ${screenSize} (${storage}, ${finish}, ${connectivity}${glass === "Nano-texture glass" ? ", Nano-texture" : ""})`;

  const whatsAppEnquiry = whatsappUrl(
    `Hello Buy & Sell GH, I would like to order/enquire about ${fullConfigurationTitle}. Screen: ${screenSize} Ultra Retina XDR, Storage: ${storage}, Finish: ${finish}, Glass: ${glass}, Connectivity: ${connectivity}, Payment: ${paymentMethod}, Fulfillment: ${fulfillment === "pickup" ? "In-Store Pickup (Dome)" : "Doorstep Delivery"}${tradeIn ? ", Trade-in: Yes" : ""}. Please confirm availability and current Ghana pricing.`
  );

  const handleAddToBag = () => {
    if (catalogProduct && catalogProduct.price > 0 && !catalogProduct.priceOnRequest) {
      const added = addItem(catalogProduct, storage, `${finish} / ${connectivity} / ${glass}`, 1);
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
      name="iPad Pro"
      categoryLabel="iPad"
      categoryPath="/ipad"
      activeImageSrc={activeImage}
      activeImageAlt={`iPad Pro ${screenSize}`}
      priceLabel={priceLabel}
      badge="Ultra Retina XDR"
      thumbnails={thumbnails}
      activeThumbnailIndex={activeThumb}
      onSelectThumbnail={setActiveThumb}
      mobileActionLabel="Add to Bag"
      onMobileAction={handleAddToBag}
    >
      <SEO
        title={`Buy iPad Pro ${screenSize} | Buy & Sell GH`}
        description={`Configure your iPad Pro ${screenSize} with Ultra Retina XDR Tandem OLED display and Apple M4 silicon in Accra, Ghana. Choose storage, finish, and connectivity.`}
      />

      <div className="apple-buy-intro">
        <p className="apple-buy-intro-eyebrow">iPad Pro</p>
        <h2 className="apple-buy-intro-title">Buy iPad Pro</h2>
        <p className="apple-buy-intro-lede">
          Thinpossible. Groundbreaking Ultra Retina XDR display powered by state-of-the-art Tandem OLED technology, outrageous Apple M4 performance, and Apple Pencil Pro support.
        </p>
      </div>

      {/* Step 1: Model / Screen Size */}
      <section className="apple-buy-step">
        <div className="apple-buy-step-header">
          <h3 className="apple-buy-step-title">Model &amp; Size. <span>Select your display size.</span></h3>
          <p className="apple-buy-step-subtitle">Ultra Retina XDR display delivers 1000 nits full-screen brightness and 1600 nits peak HDR brightness.</p>
        </div>
        <div className="apple-buy-cards-grid">
          <BuyOptionCard
            title="11-inch iPad Pro"
            subtitle="Ultra Retina XDR display. Incredibly thin 5.3 mm profile and ultraportable 444g weight for effortless sketching anywhere."
            selected={screenSize === "11-inch"}
            onClick={() => setScreenSize("11-inch")}
          />
          <BuyOptionCard
            title="13-inch iPad Pro"
            subtitle="Ultra Retina XDR display. Expansive creative canvas measuring an unbelievable 5.1 mm thin — the thinnest Apple product ever."
            selected={screenSize === "13-inch"}
            onClick={() => setScreenSize("13-inch")}
          />
        </div>
      </section>

      {/* Step 2: Color Finish */}
      <section className="apple-buy-step">
        <div className="apple-buy-step-header">
          <h3 className="apple-buy-step-title">Finish. <span>Pick your enclosure look.</span></h3>
          <p className="apple-buy-step-subtitle">Crafted with 100 percent recycled aluminum enclosures in deep Space Black and classic Silver.</p>
        </div>
        <BuyColorSwatches
          colors={IPAD_PRO_FINISHES}
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
          <p className="apple-buy-step-subtitle">1TB and 2TB models feature 16GB of unified memory and double the memory bandwidth.</p>
        </div>
        <div className="apple-buy-cards-grid">
          <BuyOptionCard
            title="256GB"
            subtitle="8GB unified memory. Generous capacity for apps, games, raw photos, and creative projects."
            selected={storage === "256GB"}
            onClick={() => setStorage("256GB")}
          />
          <BuyOptionCard
            title="512GB"
            subtitle="8GB unified memory. Extra room for 4K video clips, expansive sound libraries, and intensive documents."
            selected={storage === "512GB"}
            onClick={() => setStorage("512GB")}
          />
          <BuyOptionCard
            title="1TB"
            subtitle="16GB unified memory. High-performance ceiling for demanding 3D rendering and 4K ProRes capture."
            selected={storage === "1TB"}
            onClick={() => setStorage("1TB")}
          />
          <BuyOptionCard
            title="2TB"
            subtitle="16GB unified memory. Maximum capacity for entire film libraries, extensive photo archives, and enterprise files."
            selected={storage === "2TB"}
            onClick={() => setStorage("2TB")}
          />
        </div>
      </section>

      {/* Step 4: Display Glass (only available for 1TB/2TB) */}
      {(storage === "1TB" || storage === "2TB") && (
        <section className="apple-buy-step">
          <div className="apple-buy-step-header">
            <h3 className="apple-buy-step-title">Display Glass. <span>Choose your glass option.</span></h3>
            <p className="apple-buy-step-subtitle">Nano-texture glass scatters ambient light to further reduce glare while preserving image quality.</p>
          </div>
          <div className="apple-buy-cards-grid">
            <BuyOptionCard
              title="Standard glass"
              subtitle="Engineered for low reflectivity with industry-leading contrast and vibrant colors."
              selected={glass === "Standard glass"}
              onClick={() => setGlass("Standard glass")}
            />
            <BuyOptionCard
              title="Nano-texture glass"
              subtitle="Etched at the nanometer scale to maintain image contrast while minimizing glare in demanding lighting conditions."
              selected={glass === "Nano-texture glass"}
              onClick={() => setGlass("Nano-texture glass")}
            />
          </div>
        </section>
      )}

      {/* Step 5: Connectivity */}
      <section className="apple-buy-step">
        <div className="apple-buy-step-header">
          <h3 className="apple-buy-step-title">Connectivity. <span>Stay connected on the move.</span></h3>
          <p className="apple-buy-step-subtitle">Every iPad Pro connects to superfast Wi-Fi 6E networks; Wi-Fi + Cellular keeps you connected everywhere.</p>
        </div>
        <div className="apple-buy-cards-grid">
          <BuyOptionCard
            title="Wi-Fi"
            subtitle="Connect to fast Wi-Fi networks at home, the office, school, or cafes."
            selected={connectivity === "Wi-Fi"}
            onClick={() => setConnectivity("Wi-Fi")}
          />
          <BuyOptionCard
            title="Wi-Fi + Cellular"
            subtitle="Built-in 5G cellular with eSIM support lets you connect even when you are away from Wi-Fi."
            selected={connectivity === "Wi-Fi + Cellular"}
            onClick={() => setConnectivity("Wi-Fi + Cellular")}
          />
        </div>
      </section>

      {/* Step 6: Trade-in */}
      <BuyTradeInStep tradeInSelected={tradeIn} onSelect={setTradeIn} />

      {/* Step 7: Payment */}
      <BuyPaymentStep paymentMethod={paymentMethod} onSelect={setPaymentMethod} />

      {/* Step 8: Delivery & Pickup */}
      <BuyFulfillmentStep fulfillment={fulfillment} onSelect={setFulfillment} />

      {/* Step 9: Summary & Add to Bag */}
      <BuySummaryCard
        title="Your iPad Pro"
        items={[
          { label: "Model & Size", value: `${screenSize} iPad Pro (Ultra Retina XDR)` },
          { label: "Finish", value: finish },
          { label: "Storage", value: storage },
          ...(storage === "1TB" || storage === "2TB" ? [{ label: "Display Glass", value: glass }] : []),
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
