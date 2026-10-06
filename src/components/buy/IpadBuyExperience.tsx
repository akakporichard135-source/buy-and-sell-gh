import React, { useMemo, useState } from "react";
import { SEO } from "../SEO";
import { useCart } from "../../context/CartContext";
import { calculateTradeInBreakdown, resolveConfiguredPrice } from "../../utils/productPricing";
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
  Starlight: "/products/campaigns/ipad-air-cinematic.webp",
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

  const currentFinishImg = IPAD_FINISH_IMAGE_MAP[finish] || "/products/campaigns/ipad-air-cinematic.webp";

  const thumbnails = useMemo(() => [
    { src: currentFinishImg, alt: `iPad Air in ${finish}` },
    { src: "/products/campaigns/ipad-air-11.webp", alt: "11-inch iPad Air Liquid Retina display" },
    { src: "/products/campaigns/ipad-air-13.webp", alt: "13-inch iPad Air expansive canvas" },
    { src: "/products/campaigns/ipad-air-colors.webp", alt: "iPad Air anodized aluminum color finishes" },
    { src: "/products/campaigns/ipad-keyboard-accessory.webp", alt: "iPad Air with Magic Keyboard workstation" },
  ], [currentFinishImg, finish]);

  const activeImage = thumbnails[activeThumb]?.src || currentFinishImg;

  const fallbackProduct: Product = useMemo(() => {
    const is13 = screenSize === "13-inch";
    const isCell = connectivity === "Wi-Fi + Cellular";
    const storagePriceAdd: Record<string, number> = {
      "128GB": 0,
      "256GB": 1800,
      "512GB": 3600,
      "1TB": 6800,
    };
    const basePrice = (is13 ? 13800 : 9800) + (storagePriceAdd[storage] || 0) + (isCell ? 2000 : 0);
    const slug = "ipad-air";

    const variantList = [
      // 11-inch Wi-Fi
      { id: "ia-11-128-wifi", productId: slug, title: "11-inch 128GB Wi-Fi", screenSize: "11-inch", storage: "128GB", connectivity: "Wi-Fi", price: 9800, condition: "Brand New" as const, stockQuantity: 10, position: 1, available: true, isSale: false, stockStatus: "In Stock" as const },
      { id: "ia-11-256-wifi", productId: slug, title: "11-inch 256GB Wi-Fi", screenSize: "11-inch", storage: "256GB", connectivity: "Wi-Fi", price: 11600, condition: "Brand New" as const, stockQuantity: 10, position: 2, available: true, isSale: false, stockStatus: "In Stock" as const },
      { id: "ia-11-512-wifi", productId: slug, title: "11-inch 512GB Wi-Fi", screenSize: "11-inch", storage: "512GB", connectivity: "Wi-Fi", price: 13400, condition: "Brand New" as const, stockQuantity: 10, position: 3, available: true, isSale: false, stockStatus: "In Stock" as const },
      { id: "ia-11-1tb-wifi", productId: slug, title: "11-inch 1TB Wi-Fi", screenSize: "11-inch", storage: "1TB", connectivity: "Wi-Fi", price: 16600, condition: "Brand New" as const, stockQuantity: 10, position: 4, available: true, isSale: false, stockStatus: "In Stock" as const },
      // 11-inch Cellular
      { id: "ia-11-128-cell", productId: slug, title: "11-inch 128GB Wi-Fi + Cellular", screenSize: "11-inch", storage: "128GB", connectivity: "Wi-Fi + Cellular", price: 11800, condition: "Brand New" as const, stockQuantity: 10, position: 5, available: true, isSale: false, stockStatus: "In Stock" as const },
      { id: "ia-11-256-cell", productId: slug, title: "11-inch 256GB Wi-Fi + Cellular", screenSize: "11-inch", storage: "256GB", connectivity: "Wi-Fi + Cellular", price: 13600, condition: "Brand New" as const, stockQuantity: 10, position: 6, available: true, isSale: false, stockStatus: "In Stock" as const },
      { id: "ia-11-512-cell", productId: slug, title: "11-inch 512GB Wi-Fi + Cellular", screenSize: "11-inch", storage: "512GB", connectivity: "Wi-Fi + Cellular", price: 15400, condition: "Brand New" as const, stockQuantity: 10, position: 7, available: true, isSale: false, stockStatus: "In Stock" as const },
      { id: "ia-11-1tb-cell", productId: slug, title: "11-inch 1TB Wi-Fi + Cellular", screenSize: "11-inch", storage: "1TB", connectivity: "Wi-Fi + Cellular", price: 18600, condition: "Brand New" as const, stockQuantity: 10, position: 8, available: true, isSale: false, stockStatus: "In Stock" as const },
      // 13-inch Wi-Fi
      { id: "ia-13-128-wifi", productId: slug, title: "13-inch 128GB Wi-Fi", screenSize: "13-inch", storage: "128GB", connectivity: "Wi-Fi", price: 13800, condition: "Brand New" as const, stockQuantity: 10, position: 9, available: true, isSale: false, stockStatus: "In Stock" as const },
      { id: "ia-13-256-wifi", productId: slug, title: "13-inch 256GB Wi-Fi", screenSize: "13-inch", storage: "256GB", connectivity: "Wi-Fi", price: 15600, condition: "Brand New" as const, stockQuantity: 10, position: 10, available: true, isSale: false, stockStatus: "In Stock" as const },
      { id: "ia-13-512-wifi", productId: slug, title: "13-inch 512GB Wi-Fi", screenSize: "13-inch", storage: "512GB", connectivity: "Wi-Fi", price: 17400, condition: "Brand New" as const, stockQuantity: 10, position: 11, available: true, isSale: false, stockStatus: "In Stock" as const },
      { id: "ia-13-1tb-wifi", productId: slug, title: "13-inch 1TB Wi-Fi", screenSize: "13-inch", storage: "1TB", connectivity: "Wi-Fi", price: 20600, condition: "Brand New" as const, stockQuantity: 10, position: 12, available: true, isSale: false, stockStatus: "In Stock" as const },
      // 13-inch Cellular
      { id: "ia-13-128-cell", productId: slug, title: "13-inch 128GB Wi-Fi + Cellular", screenSize: "13-inch", storage: "128GB", connectivity: "Wi-Fi + Cellular", price: 15800, condition: "Brand New" as const, stockQuantity: 10, position: 13, available: true, isSale: false, stockStatus: "In Stock" as const },
      { id: "ia-13-256-cell", productId: slug, title: "13-inch 256GB Wi-Fi + Cellular", screenSize: "13-inch", storage: "256GB", connectivity: "Wi-Fi + Cellular", price: 17600, condition: "Brand New" as const, stockQuantity: 10, position: 14, available: true, isSale: false, stockStatus: "In Stock" as const },
      { id: "ia-13-512-cell", productId: slug, title: "13-inch 512GB Wi-Fi + Cellular", screenSize: "13-inch", storage: "512GB", connectivity: "Wi-Fi + Cellular", price: 19400, condition: "Brand New" as const, stockQuantity: 10, position: 15, available: true, isSale: false, stockStatus: "In Stock" as const },
      { id: "ia-13-1tb-cell", productId: slug, title: "13-inch 1TB Wi-Fi + Cellular", screenSize: "13-inch", storage: "1TB", connectivity: "Wi-Fi + Cellular", price: 22600, condition: "Brand New" as const, stockQuantity: 10, position: 16, available: true, isSale: false, stockStatus: "In Stock" as const },
    ];

    return {
      id: slug,
      slug,
      name: "iPad Air",
      model: "iPad Air",
      brand: "Apple",
      category: "iPads",
      condition: "Brand New",
      price: basePrice,
      storage: ["128GB", "256GB", "512GB", "1TB"],
      colors: IPAD_AIR_COLORS.map((c) => c.name),
      description: "iPad Air featuring Liquid Retina display, Apple Silicon performance, Apple Pencil Pro support, and all-day battery life.",
      specs: ["11-inch or 13-inch Liquid Retina Display", "Apple Silicon M-Series", "Apple Pencil Pro Support", "12MP Center Stage Camera", "Touch ID"],
      box: ["iPad Air", "USB-C Charge Cable (1m)", "20W USB-C Power Adapter"],
      imageTone: "light",
      images: thumbnails,
      variants: variantList,
      available: true,
      stockStatus: "In Stock" as const,
      stockQuantity: 10,
      featured: true,
    };
  }, [screenSize, storage, connectivity, thumbnails]);

  const isExactMatch = Boolean(
    catalogProduct &&
      catalogProduct.slug === "ipad-air" &&
      catalogProduct.condition === "Brand New" &&
      catalogProduct.variants &&
      catalogProduct.variants.length > 0
  );
  const activeProduct = isExactMatch && catalogProduct && catalogProduct.price > 0 && !catalogProduct.priceOnRequest ? catalogProduct : fallbackProduct;

  const configured = resolveConfiguredPrice(activeProduct, {
    screenSize,
    storage,
    connectivity,
  });
  const priceLabel = configured.formattedPrice;
  const previousPriceLabel = configured.formattedPreviousPrice;
  const tradeInBreakdown = calculateTradeInBreakdown(configured.price, tradeIn);

  const fullConfigurationTitle = `iPad Air ${screenSize} (${storage}, ${finish}, ${connectivity})`;

  const whatsAppEnquiry = whatsappUrl(
    `Hello Buy & Sell GH, I would like to order/enquire about ${fullConfigurationTitle}. Price: ${priceLabel}. Details: Screen: ${screenSize}, Storage: ${storage}, Finish: ${finish}, Connectivity: ${connectivity}, Payment: ${paymentMethod}, Fulfillment: ${fulfillment === "pickup" ? "In-Store Pickup (Dome)" : "Doorstep Delivery"}${tradeIn ? ", Trade-in: Yes" : ""}. Please confirm availability.`
  );

  const handleAddToBag = () => {
    const added = addItem(
      activeProduct,
      storage,
      `${screenSize} / ${finish} / ${connectivity}`,
      1,
      configured.variant
    );
    if (added) {
      setNotice(`${fullConfigurationTitle} - ${priceLabel} added to your bag.`);
    } else {
      setNotice(`Your request for ${fullConfigurationTitle} is ready. Connecting to WhatsApp concierge...`);
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
      badge="Liquid Retina"
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
              subtitle={
                cap === "128GB"
                  ? "Essential storage for study and daily apps"
                  : cap === "256GB"
                  ? "Popular sweet spot for apps and creative work"
                  : cap === "512GB"
                  ? "Expansive capacity for large media collections"
                  : "Pro capacity for large 4K video files and illustration files"
              }
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
