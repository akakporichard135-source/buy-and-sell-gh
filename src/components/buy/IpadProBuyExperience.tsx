import React, { useState, useEffect, useMemo } from "react";
import { SEO } from "../SEO";
import { useCart } from "../../context/CartContext";
import { formatGhs } from "../../utils/format";
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
    if (catalogProduct && catalogProduct.slug.includes("13")) {
      setScreenSize("13-inch");
    }
  }, [catalogProduct]);

  // Nano-texture glass is only available on 1TB and 2TB models
  useEffect(() => {
    if (storage !== "1TB" && storage !== "2TB" && glass === "Nano-texture glass") {
      setGlass("Standard glass");
    }
  }, [storage, glass]);

  const thumbnails = useMemo(() => [
    { src: "/products/campaigns/ipad-pro-cinematic.webp", alt: `iPad Pro in ${finish} on studio stage` },
    { src: "/products/campaigns/ipad-pro-11.webp", alt: "11-inch iPad Pro Ultra Retina XDR display" },
    { src: "/products/campaigns/ipad-pro-13.webp", alt: "13-inch iPad Pro Ultra Retina XDR expansive display" },
    { src: "/products/campaigns/ipad-air-detail.webp", alt: "iPad Pro ultra-thin profile and camera system" },
    { src: "/products/campaigns/ipad-keyboard-accessory.webp", alt: "iPad Pro with Magic Keyboard workstation" },
  ], [finish]);

  const activeImage = thumbnails[activeThumb]?.src || "/products/campaigns/ipad-pro-cinematic.webp";

  const fallbackProduct: Product = useMemo(() => {
    const is13 = screenSize === "13-inch";
    const isCell = connectivity === "Wi-Fi + Cellular";
    const isNano = (storage === "1TB" || storage === "2TB") && glass === "Nano-texture glass";

    const storagePriceAdd: Record<string, number> = {
      "256GB": 0,
      "512GB": 2200,
      "1TB": 5800,
      "2TB": 10800,
    };

    const basePrice = (is13 ? 21500 : 16800) +
      (storagePriceAdd[storage] || 0) +
      (isCell ? 2400 : 0) +
      (isNano ? 1600 : 0);

    const slug = "ipad-pro";

    const variantList = [
      // 11-inch Wi-Fi
      { id: "ip-11-256-wifi", productId: slug, title: "11-inch 256GB Wi-Fi", screenSize: "11-inch", storage: "256GB", connectivity: "Wi-Fi", price: 16800, previousPrice: 17800, condition: "Brand New" as const, stockQuantity: 10, position: 1, available: true, isSale: true, stockStatus: "In Stock" as const },
      { id: "ip-11-512-wifi", productId: slug, title: "11-inch 512GB Wi-Fi", screenSize: "11-inch", storage: "512GB", connectivity: "Wi-Fi", price: 19000, previousPrice: 20000, condition: "Brand New" as const, stockQuantity: 10, position: 2, available: true, isSale: true, stockStatus: "In Stock" as const },
      { id: "ip-11-1tb-wifi", productId: slug, title: "11-inch 1TB Wi-Fi", screenSize: "11-inch", storage: "1TB", connectivity: "Wi-Fi", price: 22600, previousPrice: 23600, condition: "Brand New" as const, stockQuantity: 10, position: 3, available: true, isSale: true, stockStatus: "In Stock" as const },
      { id: "ip-11-2tb-wifi", productId: slug, title: "11-inch 2TB Wi-Fi", screenSize: "11-inch", storage: "2TB", connectivity: "Wi-Fi", price: 27600, previousPrice: 28600, condition: "Brand New" as const, stockQuantity: 10, position: 4, available: true, isSale: true, stockStatus: "In Stock" as const },
      // 11-inch Cellular
      { id: "ip-11-256-cell", productId: slug, title: "11-inch 256GB Wi-Fi + Cellular", screenSize: "11-inch", storage: "256GB", connectivity: "Wi-Fi + Cellular", price: 19200, previousPrice: 20200, condition: "Brand New" as const, stockQuantity: 10, position: 5, available: true, isSale: true, stockStatus: "In Stock" as const },
      { id: "ip-11-512-cell", productId: slug, title: "11-inch 512GB Wi-Fi + Cellular", screenSize: "11-inch", storage: "512GB", connectivity: "Wi-Fi + Cellular", price: 21400, previousPrice: 22400, condition: "Brand New" as const, stockQuantity: 10, position: 6, available: true, isSale: true, stockStatus: "In Stock" as const },
      { id: "ip-11-1tb-cell", productId: slug, title: "11-inch 1TB Wi-Fi + Cellular", screenSize: "11-inch", storage: "1TB", connectivity: "Wi-Fi + Cellular", price: 25000, previousPrice: 26000, condition: "Brand New" as const, stockQuantity: 10, position: 7, available: true, isSale: true, stockStatus: "In Stock" as const },
      { id: "ip-11-2tb-cell", productId: slug, title: "11-inch 2TB Wi-Fi + Cellular", screenSize: "11-inch", storage: "2TB", connectivity: "Wi-Fi + Cellular", price: 30000, previousPrice: 31000, condition: "Brand New" as const, stockQuantity: 10, position: 8, available: true, isSale: true, stockStatus: "In Stock" as const },
      // 13-inch Wi-Fi
      { id: "ip-13-256-wifi", productId: slug, title: "13-inch 256GB Wi-Fi", screenSize: "13-inch", storage: "256GB", connectivity: "Wi-Fi", price: 21500, previousPrice: 22800, condition: "Brand New" as const, stockQuantity: 10, position: 9, available: true, isSale: true, stockStatus: "In Stock" as const },
      { id: "ip-13-512-wifi", productId: slug, title: "13-inch 512GB Wi-Fi", screenSize: "13-inch", storage: "512GB", connectivity: "Wi-Fi", price: 23700, previousPrice: 25000, condition: "Brand New" as const, stockQuantity: 10, position: 10, available: true, isSale: true, stockStatus: "In Stock" as const },
      { id: "ip-13-1tb-wifi", productId: slug, title: "13-inch 1TB Wi-Fi", screenSize: "13-inch", storage: "1TB", connectivity: "Wi-Fi", price: 27300, previousPrice: 28600, condition: "Brand New" as const, stockQuantity: 10, position: 11, available: true, isSale: true, stockStatus: "In Stock" as const },
      { id: "ip-13-2tb-wifi", productId: slug, title: "13-inch 2TB Wi-Fi", screenSize: "13-inch", storage: "2TB", connectivity: "Wi-Fi", price: 32300, previousPrice: 33600, condition: "Brand New" as const, stockQuantity: 10, position: 12, available: true, isSale: true, stockStatus: "In Stock" as const },
      // 13-inch Cellular
      { id: "ip-13-256-cell", productId: slug, title: "13-inch 256GB Wi-Fi + Cellular", screenSize: "13-inch", storage: "256GB", connectivity: "Wi-Fi + Cellular", price: 23900, previousPrice: 25200, condition: "Brand New" as const, stockQuantity: 10, position: 13, available: true, isSale: true, stockStatus: "In Stock" as const },
      { id: "ip-13-512-cell", productId: slug, title: "13-inch 512GB Wi-Fi + Cellular", screenSize: "13-inch", storage: "512GB", connectivity: "Wi-Fi + Cellular", price: 26100, previousPrice: 27400, condition: "Brand New" as const, stockQuantity: 10, position: 14, available: true, isSale: true, stockStatus: "In Stock" as const },
      { id: "ip-13-1tb-cell", productId: slug, title: "13-inch 1TB Wi-Fi + Cellular", screenSize: "13-inch", storage: "1TB", connectivity: "Wi-Fi + Cellular", price: 29700, previousPrice: 31000, condition: "Brand New" as const, stockQuantity: 10, position: 15, available: true, isSale: true, stockStatus: "In Stock" as const },
      { id: "ip-13-2tb-cell", productId: slug, title: "13-inch 2TB Wi-Fi + Cellular", screenSize: "13-inch", storage: "2TB", connectivity: "Wi-Fi + Cellular", price: 34700, previousPrice: 36000, condition: "Brand New" as const, stockQuantity: 10, position: 16, available: true, isSale: true, stockStatus: "In Stock" as const },
    ];

    return {
      id: slug,
      slug,
      name: "iPad Pro",
      model: "iPad Pro",
      brand: "Apple",
      category: "iPads",
      condition: "Brand New",
      price: basePrice,
      storage: ["256GB", "512GB", "1TB", "2TB"],
      colors: IPAD_PRO_FINISHES.map((c) => c.name),
      description: "iPad Pro with Ultra Retina XDR display powered by Tandem OLED, Apple M4 chip, and ultra-thin design.",
      specs: ["11-inch or 13-inch Ultra Retina XDR Display", "Tandem OLED Technology", "Apple M4 Silicon", "Nano-texture Glass Option", "Pro Camera System with LiDAR"],
      box: ["iPad Pro", "USB-C Charge Cable (1m)", "20W USB-C Power Adapter"],
      imageTone: "dark",
      images: thumbnails,
      variants: variantList,
      available: true,
      stockStatus: "In Stock" as const,
      stockQuantity: 10,
      featured: true,
    };
  }, [screenSize, storage, connectivity, glass, thumbnails]);

  const isExactMatch = Boolean(
    catalogProduct &&
      catalogProduct.slug === "ipad-pro" &&
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

  const nanoTextureDelta = (storage === "1TB" || storage === "2TB") && glass === "Nano-texture glass" ? 1600 : 0;
  const finalPrice = configured.price + nanoTextureDelta;
  const priceLabel = formatGhs(finalPrice);
  const previousPriceLabel = configured.previousPrice ? formatGhs(configured.previousPrice + nanoTextureDelta) : undefined;
  const tradeInBreakdown = calculateTradeInBreakdown(finalPrice, tradeIn);

  const fullConfigurationTitle = `iPad Pro ${screenSize} (${storage}, ${finish}, ${connectivity}${glass === "Nano-texture glass" ? ", Nano-texture" : ""})`;

  const whatsAppEnquiry = whatsappUrl(
    `Hello Buy & Sell GH, I would like to order/enquire about ${fullConfigurationTitle}. Price: ${priceLabel}. Details: Screen: ${screenSize} Ultra Retina XDR, Storage: ${storage}, Finish: ${finish}, Glass: ${glass}, Connectivity: ${connectivity}, Payment: ${paymentMethod}, Fulfillment: ${fulfillment === "pickup" ? "In-Store Pickup (Dome)" : "Doorstep Delivery"}${tradeIn ? ", Trade-in: Yes" : ""}. Please confirm availability.`
  );

  const handleAddToBag = () => {
    const added = addItem(
      activeProduct,
      storage,
      `${screenSize} / ${finish} / ${connectivity}${glass === "Nano-texture glass" ? " / Nano-texture" : ""}`,
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
      name="iPad Pro"
      categoryLabel="iPad"
      categoryPath="/ipad"
      activeImageSrc={activeImage}
      activeImageAlt={`iPad Pro ${screenSize}`}
      priceLabel={priceLabel}
      badge="Ultra Retina XDR OLED"
      darkStage={true}
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
