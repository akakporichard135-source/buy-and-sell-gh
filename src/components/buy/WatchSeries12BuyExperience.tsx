import React, { useMemo, useState } from "react";
import { SEO } from "../SEO";
import { useCart } from "../../context/CartContext";
import { resolveConfiguredPrice, calculateTradeInBreakdown } from "../../utils/productPricing";
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

const WATCH_12_FINISHES: ColorOption[] = [
  { name: "Jet Black", hex: "#111111" },
  { name: "Silver", hex: "#e2e4e6" },
  { name: "Rose Gold", hex: "#e0b0a8" },
  { name: "Natural Titanium", hex: "#9a958e" },
  { name: "Slate", hex: "#404044" },
];

const BAND_STYLES = [
  { name: "Sport Band", desc: "Durable fluoroelastomer with pin-and-tuck closure, sweat and water resistant." },
  { name: "Sport Loop", desc: "Breathable double-layer nylon weave with hook-and-loop fastener for quick adjustment." },
  { name: "Solo Loop", desc: "Seamless stretchable liquid silicone rubber without buckles or clasps." },
  { name: "Milanese Loop", desc: "Woven stainless steel mesh with infinite magnetic adjustability." },
];

const BAND_COLORS: ColorOption[] = [
  { name: "Midnight", hex: "#1c2530" },
  { name: "Starlight", hex: "#e5ded4" },
  { name: "Teal", hex: "#1d6363" },
  { name: "Plum", hex: "#4a2d3b" },
];

export function WatchSeries12BuyExperience({ catalogProduct }: { catalogProduct?: Product }) {
  const { addItem } = useCart();

  const [finish, setFinish] = useState("Jet Black");
  const [caseSize, setCaseSize] = useState<"42mm" | "46mm">("46mm");
  const [connectivity, setConnectivity] = useState<"GPS" | "GPS + Cellular">("GPS");
  const [bandStyle, setBandStyle] = useState("Sport Band");
  const [bandColor, setBandColor] = useState("Midnight");
  const [bandDimension, setBandDimension] = useState<"S/M" | "M/L">("M/L");
  const [tradeIn, setTradeIn] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("Mobile Money on Confirmation");
  const [fulfillment, setFulfillment] = useState<"pickup" | "delivery">("pickup");
  const [activeThumb, setActiveThumb] = useState(0);
  const [notice, setNotice] = useState("");

  const thumbnails = useMemo(() => [
    { src: "/products/campaigns/watch-series-12-cinematic.webp", alt: "Apple Watch Series 12 floating in precision studio light" },
    { src: "/products/campaigns/watch-series-12-hero.webp", alt: "Apple Watch Series 12 with sport band" },
    { src: "/products/campaigns/watch-series-12-angle.webp", alt: "Apple Watch Series 12 profile" },
    { src: "/products/campaigns/watch-series-12-display.webp", alt: "Apple Watch Series 12 wide OLED display" },
    { src: "/products/campaigns/watch-sensor-detail.webp", alt: "Apple Watch Series 12 biosensor array" },
  ], []);

  const activeImage = thumbnails[activeThumb]?.src || "/products/campaigns/watch-series-12-cinematic.webp";

  const fallbackProduct: Product = useMemo(() => {
    const is46 = caseSize === "46mm";
    const isCellular = connectivity === "GPS + Cellular";
    const basePrice = isCellular ? (is46 ? 10200 : 9500) : (is46 ? 8400 : 7800);
    const slug = "apple-watch-series-12";
    return {
      id: slug,
      slug,
      name: "Apple Watch Series 12",
      model: "Apple Watch Series 12",
      brand: "Apple",
      category: "Watches",
      condition: "Brand New",
      price: basePrice,
      storage: ["42mm", "46mm"],
      colors: WATCH_12_FINISHES.map((f) => f.name),
      description: "Apple Watch Series 12 with ultra-thin case, wide-angle OLED display, and advanced health sensors.",
      specs: ["Wide-Angle OLED Display", "S10 SiP", "Sleep Apnea Notifications", "50m Water Resistance"],
      box: ["Apple Watch Series 12", "Band", "Apple Watch Magnetic Fast Charger to USB-C Cable (1m)"],
      imageTone: "light",
      images: thumbnails,
      variants: [
        { id: "aws12-42-gps", productId: slug, title: "42mm GPS", screenSize: "42mm", connectivity: "GPS", price: 7800, condition: "Brand New" as const, stockQuantity: 10, position: 1, available: true, isSale: false, stockStatus: "In Stock" as const },
        { id: "aws12-46-gps", productId: slug, title: "46mm GPS", screenSize: "46mm", connectivity: "GPS", price: 8400, condition: "Brand New" as const, stockQuantity: 10, position: 2, available: true, isSale: false, stockStatus: "In Stock" as const },
        { id: "aws12-42-cell", productId: slug, title: "42mm GPS + Cellular", screenSize: "42mm", connectivity: "GPS + Cellular", price: 9500, condition: "Brand New" as const, stockQuantity: 10, position: 3, available: true, isSale: false, stockStatus: "In Stock" as const },
        { id: "aws12-46-cell", productId: slug, title: "46mm GPS + Cellular", screenSize: "46mm", connectivity: "GPS + Cellular", price: 10200, condition: "Brand New" as const, stockQuantity: 10, position: 4, available: true, isSale: false, stockStatus: "In Stock" as const },
      ],
      available: true,
      stockStatus: "In Stock" as const,
      stockQuantity: 10,
      featured: true,
    };
  }, [caseSize, connectivity, thumbnails]);

  const isExactMatch = Boolean(catalogProduct && (catalogProduct.slug === "apple-watch-series-12" || catalogProduct.name?.includes("12")));
  const activeProduct = isExactMatch && catalogProduct && catalogProduct.price > 0 && !catalogProduct.priceOnRequest ? catalogProduct : fallbackProduct;

  const configured = resolveConfiguredPrice(activeProduct, {
    screenSize: caseSize,
    connectivity,
  });
  const priceLabel = configured.formattedPrice;
  const previousPriceLabel = configured.formattedPreviousPrice;
  const tradeInBreakdown = calculateTradeInBreakdown(configured.price, tradeIn);

  const fullConfigurationTitle = `Apple Watch Series 12 (${caseSize}, ${finish})`;

  const whatsAppEnquiry = whatsappUrl(
    `Hello Buy & Sell GH, I would like to order/enquire about ${fullConfigurationTitle}. Price: ${priceLabel}, Details: Connectivity: ${connectivity}, Band: ${bandStyle} (${bandColor}, ${bandDimension}), Payment: ${paymentMethod}, Fulfillment: ${fulfillment === "pickup" ? "In-Store Pickup (Dome)" : "Doorstep Delivery"}${tradeIn ? ", Trade-in: Yes" : ""}. Please confirm availability.`
  );

  const handleAddToBag = () => {
    const added = addItem(
      activeProduct,
      `${caseSize} / ${connectivity}`,
      `${finish} / ${bandStyle} (${bandColor}, ${bandDimension})`,
      1,
      configured.variant
    );
    if (added) {
      setNotice(`${fullConfigurationTitle} (${priceLabel}) added to your bag.`);
    }
  };

  return (
    <BuyLayout
      name="Apple Watch Series 12"
      categoryLabel="Watch"
      categoryPath="/watch"
      activeImageSrc={activeImage}
      activeImageAlt="Apple Watch Series 12"
      priceLabel={priceLabel}
      badge="Series 12"
      thumbnails={thumbnails}
      activeThumbnailIndex={activeThumb}
      onSelectThumbnail={setActiveThumb}
      mobileActionLabel="Add to Bag"
      onMobileAction={handleAddToBag}
    >
      <SEO
        title="Buy Apple Watch Series 12 | Buy & Sell GH"
        description="Configure your Apple Watch Series 12 in Accra, Ghana. Choose your case finish, size, connectivity and band style with Buy & Sell GH."
      />

      <div className="apple-buy-intro">
        <p className="apple-buy-intro-eyebrow">Apple Watch Series 12</p>
        <h2 className="apple-buy-intro-title">Buy Apple Watch Series 12</h2>
        <p className="apple-buy-intro-lede">
          Ultra-thin case, expansive wide-angle OLED display, and all-day health, fitness and connection tracking.
        </p>
      </div>

      {/* Step 1: Case Finish */}
      <section className="apple-buy-step">
        <div className="apple-buy-step-header">
          <h3 className="apple-buy-step-title">Case Finish. <span>Pick your favorite look.</span></h3>
          <p className="apple-buy-step-subtitle">Polished aluminum and lightweight titanium enclosures.</p>
        </div>
        <BuyColorSwatches
          colors={WATCH_12_FINISHES}
          selectedColor={finish}
          onSelect={(c) => {
            setFinish(c);
            setActiveThumb(0);
          }}
        />
      </section>

      {/* Step 2: Case Size */}
      <section className="apple-buy-step">
        <div className="apple-buy-step-header">
          <h3 className="apple-buy-step-title">Case Size. <span>Which fits your wrist?</span></h3>
          <p className="apple-buy-step-subtitle">Both sizes feature the wide-angle OLED display with smooth edges.</p>
        </div>
        <div className="apple-buy-cards-grid">
          <BuyOptionCard
            title="42mm"
            subtitle="Compact, balanced profile for wrists 130–200mm."
            selected={caseSize === "42mm"}
            onClick={() => setCaseSize("42mm")}
          />
          <BuyOptionCard
            title="46mm"
            subtitle="Expansive display area for wrists 140–210mm."
            selected={caseSize === "46mm"}
            onClick={() => setCaseSize("46mm")}
          />
        </div>
      </section>

      {/* Step 3: Connectivity */}
      <section className="apple-buy-step">
        <div className="apple-buy-step-header">
          <h3 className="apple-buy-step-title">Connectivity. <span>Stay in touch.</span></h3>
          <p className="apple-buy-step-subtitle">Choose whether you need standalone cellular on wrist.</p>
        </div>
        <div className="apple-buy-cards-grid">
          <BuyOptionCard
            title="GPS"
            subtitle="Connects via Bluetooth and Wi-Fi to your iPhone for calls, messages and notifications."
            selected={connectivity === "GPS"}
            onClick={() => setConnectivity("GPS")}
          />
          <BuyOptionCard
            title="GPS + Cellular"
            subtitle="Stay connected, stream music and take calls even when your phone is left behind."
            selected={connectivity === "GPS + Cellular"}
            onClick={() => setConnectivity("GPS + Cellular")}
          />
        </div>
      </section>

      {/* Step 4: Band Style */}
      <section className="apple-buy-step">
        <div className="apple-buy-step-header">
          <h3 className="apple-buy-step-title">Band. <span>Select your band style.</span></h3>
          <p className="apple-buy-step-subtitle">Everyday comfort, active workout readiness or refined evening elegance.</p>
        </div>
        <div className="apple-buy-cards-grid">
          {BAND_STYLES.map((b) => (
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

      {/* Step 5: Band Color & Size */}
      <section className="apple-buy-step">
        <div className="apple-buy-step-header">
          <h3 className="apple-buy-step-title">Band Color &amp; Size.</h3>
          <p className="apple-buy-step-subtitle">Pair your band shade with wrist dimension.</p>
        </div>
        <BuyColorSwatches
          colors={BAND_COLORS}
          selectedColor={bandColor}
          onSelect={setBandColor}
        />
        <div className="apple-buy-cards-grid" style={{ marginTop: "12px" }}>
          <BuyOptionCard
            title="S/M"
            subtitle="Fits 130–180mm wrists"
            selected={bandDimension === "S/M"}
            onClick={() => setBandDimension("S/M")}
          />
          <BuyOptionCard
            title="M/L"
            subtitle="Fits 150–200mm wrists"
            selected={bandDimension === "M/L"}
            onClick={() => setBandDimension("M/L")}
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
        title="Your Apple Watch"
        items={[
          { label: "Model", value: "Apple Watch Series 12" },
          { label: "Case & Size", value: `${finish}, ${caseSize}` },
          { label: "Connectivity", value: connectivity },
          { label: "Band", value: `${bandStyle} (${bandColor}, ${bandDimension})` },
          { label: "Trade-in", value: tradeIn ? "Device trade-in requested" : "No trade-in" },
          { label: "Payment", value: paymentMethod },
          { label: "Fulfillment", value: fulfillment === "pickup" ? "Free In-Store Pickup (Dome Pillar 2)" : "Doorstep Delivery" },
        ]}
        priceLabel={priceLabel}
        previousPriceLabel={previousPriceLabel}
        tradeInBreakdown={tradeInBreakdown}
        onAddToBag={handleAddToBag}
        addToBagLabel="Add to Bag"
        whatsAppHref={whatsAppEnquiry}
        notice={notice}
      />
    </BuyLayout>
  );
}
