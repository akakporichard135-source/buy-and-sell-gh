import React, { useState, useMemo } from "react";
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

const MACBOOK_FINISHES: ColorOption[] = [
  { name: "Midnight", hex: "#1e2530" },
  { name: "Starlight", hex: "#e6ded4" },
  { name: "Space Gray", hex: "#707175" },
  { name: "Silver", hex: "#e3e4e5" },
];

const FINISH_IMAGE_MAP: Record<string, string> = {
  Midnight: "/products/campaigns/macbook-air-cinematic.webp",
  Starlight: "/products/campaigns/macbook-air-starlight-studio.jpg",
  "Space Gray": "/products/campaigns/macbook-air-cutout.webp",
  Silver: "/products/campaigns/macbook-air-cutout.webp",
};

export function MacbookBuyExperience({ catalogProduct }: { catalogProduct?: Product }) {
  const { addItem } = useCart();

  const [screenSize, setScreenSize] = useState<"13-inch" | "15-inch">("13-inch");
  const [finish, setFinish] = useState("Midnight");
  const [memory, setMemory] = useState("16GB");
  const [storage, setStorage] = useState("512GB");
  const [tradeIn, setTradeIn] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("Mobile Money on Confirmation");
  const [fulfillment, setFulfillment] = useState<"pickup" | "delivery">("pickup");
  const [activeThumb, setActiveThumb] = useState(0);
  const [notice, setNotice] = useState("");

  const currentFinishImg = FINISH_IMAGE_MAP[finish] || FINISH_IMAGE_MAP.Midnight;

  const thumbnails = [
    { src: currentFinishImg, alt: `MacBook Air in ${finish}` },
    { src: "/products/campaigns/macbook-air-cutout.webp", alt: "MacBook Air open Liquid Retina display" },
    { src: "/products/campaigns/macbook-air-starlight-studio.jpg", alt: "MacBook Air studio profile" },
  ];

  const activeImage = thumbnails[activeThumb]?.src || currentFinishImg;

  const storageOptions = useMemo(() => ["256GB", "512GB", "1TB", "2TB"], []);

  const fallbackProduct: Product = useMemo(() => {
    const is15 = screenSize === "15-inch";
    const basePrice = is15 ? 18500 : 13500;
    const slug = is15 ? "macbook-air-15-m4" : "macbook-air-13-m4";
    return {
      id: slug,
      slug,
      name: `MacBook Air ${screenSize}`,
      model: `MacBook Air ${screenSize}`,
      brand: "Apple",
      category: "MacBooks",
      condition: "Brand New",
      price: basePrice,
      storage: storageOptions,
      colors: ["Midnight", "Starlight", "Space Gray", "Silver"],
      description: `All-new MacBook Air ${screenSize} with Liquid Retina display, Apple Silicon, and all-day battery life.`,
      specs: ["Apple Silicon", "Liquid Retina display", "1080p FaceTime HD camera", "MagSafe 3"],
      box: ["MacBook Air", "USB-C to MagSafe 3 Cable", "USB-C Power Adapter"],
      imageTone: "light",
      images: [{ src: currentFinishImg, alt: `MacBook Air ${screenSize} in ${finish}` }],
      variants: [
        { id: `mba-${is15 ? "15" : "13"}-256`, productId: slug, title: `${screenSize} 16GB / 256GB`, storage: "256GB", price: basePrice, condition: "Brand New" as const, stockQuantity: 10, position: 1, available: true, isSale: false, stockStatus: "In Stock" as const },
        { id: `mba-${is15 ? "15" : "13"}-512`, productId: slug, title: `${screenSize} 16GB / 512GB`, storage: "512GB", price: basePrice + 2500, condition: "Brand New" as const, stockQuantity: 10, position: 2, available: true, isSale: false, stockStatus: "In Stock" as const },
        { id: `mba-${is15 ? "15" : "13"}-1tb`, productId: slug, title: `${screenSize} 16GB / 1TB`, storage: "1TB", price: basePrice + 5500, condition: "Brand New" as const, stockQuantity: 10, position: 3, available: true, isSale: false, stockStatus: "In Stock" as const },
        { id: `mba-${is15 ? "15" : "13"}-2tb`, productId: slug, title: `${screenSize} 16GB / 2TB`, storage: "2TB", price: basePrice + 9500, condition: "Brand New" as const, stockQuantity: 10, position: 4, available: true, isSale: false, stockStatus: "In Stock" as const },
      ],
      available: true,
      stockStatus: "In Stock" as const,
      stockQuantity: 10,
      featured: true,
    };
  }, [screenSize, storageOptions, currentFinishImg, finish]);

  const activeProduct = catalogProduct && catalogProduct.price > 0 && !catalogProduct.priceOnRequest ? catalogProduct : fallbackProduct;
  const configured = resolveConfiguredPrice(activeProduct, { screenSize, memory, storage });
  const priceLabel = configured.formattedPrice;
  const previousPriceLabel = configured.formattedPreviousPrice;
  const tradeInBreakdown = calculateTradeInBreakdown(configured.price, tradeIn);

  const fullConfigurationTitle = `MacBook Air ${screenSize} (${memory} / ${storage}, ${finish})`;

  const whatsAppEnquiry = whatsappUrl(
    `Hello Buy & Sell GH, I would like to order/enquire about ${fullConfigurationTitle}. Price: ${priceLabel}. Details: Memory: ${memory}, Storage: ${storage}, Finish: ${finish}, Payment: ${paymentMethod}, Fulfillment: ${fulfillment === "pickup" ? "In-Store Pickup (Dome)" : "Doorstep Delivery"}${tradeIn ? ", Trade-in: Yes" : ""}. Please confirm availability.`
  );

  const handleAddToBag = () => {
    const added = addItem(activeProduct, storage, `${finish} / ${memory}`, 1, configured.variant);
    if (added) {
      setNotice(`${fullConfigurationTitle} - ${priceLabel} added to your bag.`);
    }
  };

  return (
    <BuyLayout
      name="MacBook Air"
      categoryLabel="Mac"
      categoryPath="/mac"
      activeImageSrc={activeImage}
      activeImageAlt="MacBook Air"
      priceLabel={priceLabel}
      badge="Apple Silicon"
      thumbnails={thumbnails}
      activeThumbnailIndex={activeThumb}
      onSelectThumbnail={setActiveThumb}
      mobileActionLabel="Add to Bag"
      onMobileAction={handleAddToBag}
    >
      <SEO
        title="Buy MacBook Air | Buy & Sell GH"
        description="Configure your MacBook Air in Accra, Ghana. Choose 13-inch or 15-inch, memory, storage and finish with Buy & Sell GH."
      />

      <div className="apple-buy-intro">
        <p className="apple-buy-intro-eyebrow">MacBook Air</p>
        <h2 className="apple-buy-intro-title">Buy MacBook Air</h2>
        <p className="apple-buy-intro-lede">
          Impossibly thin and fast. Liquid Retina display, MagSafe 3, all-day battery life, and whisper-quiet fanless architecture.
        </p>
      </div>

      {/* Step 1: Model / Screen Size */}
      <section className="apple-buy-step">
        <div className="apple-buy-step-header">
          <h3 className="apple-buy-step-title">Model &amp; Size. <span>Which canvas do you prefer?</span></h3>
          <p className="apple-buy-step-subtitle">Both feature 500 nits Liquid Retina display with 1 billion colors.</p>
        </div>
        <div className="apple-buy-cards-grid">
          <BuyOptionCard
            title="13-inch MacBook Air"
            subtitle="13.6-inch Liquid Retina display. Ultraportable 2.7 lb weight for effortless travel."
            selected={screenSize === "13-inch"}
            onClick={() => setScreenSize("13-inch")}
          />
          <BuyOptionCard
            title="15-inch MacBook Air"
            subtitle="15.3-inch Liquid Retina display. Expansive workspace with six-speaker sound system."
            selected={screenSize === "15-inch"}
            onClick={() => setScreenSize("15-inch")}
          />
        </div>
      </section>

      {/* Step 2: Finish */}
      <section className="apple-buy-step">
        <div className="apple-buy-step-header">
          <h3 className="apple-buy-step-title">Finish. <span>Pick your favorite look.</span></h3>
          <p className="apple-buy-step-subtitle">Durable anodized unibody aluminum enclosure with color-matched MagSafe cable.</p>
        </div>
        <BuyColorSwatches
          colors={MACBOOK_FINISHES}
          selectedColor={finish}
          onSelect={(c) => {
            setFinish(c);
            setActiveThumb(0);
          }}
        />
      </section>

      {/* Step 3: Unified Memory */}
      <section className="apple-buy-step">
        <div className="apple-buy-step-header">
          <h3 className="apple-buy-step-title">Memory. <span>How much unified memory?</span></h3>
          <p className="apple-buy-step-subtitle">Unified memory gives the CPU and GPU fast shared access to memory for seamless multitasking.</p>
        </div>
        <div className="apple-buy-cards-grid">
          <BuyOptionCard
            title="16GB Unified Memory"
            subtitle="Standard configuration. Smooth everyday multitasking, browser tabs, and documents."
            selected={memory === "16GB"}
            onClick={() => setMemory("16GB")}
          />
          <BuyOptionCard
            title="24GB Unified Memory"
            subtitle="Great for demanding professional workloads, heavier photo editing, and software compilation."
            selected={memory === "24GB"}
            onClick={() => setMemory("24GB")}
          />
          <BuyOptionCard
            title="32GB Unified Memory"
            subtitle="Maximum performance ceiling for complex creative projects and multiple intensive apps."
            selected={memory === "32GB"}
            onClick={() => setMemory("32GB")}
          />
        </div>
      </section>

      {/* Step 4: Storage */}
      <section className="apple-buy-step">
        <div className="apple-buy-step-header">
          <h3 className="apple-buy-step-title">Storage. <span>How much SSD storage?</span></h3>
          <p className="apple-buy-step-subtitle">Blazing-fast solid-state drive storage for your apps, media, and files.</p>
        </div>
        <div className="apple-buy-cards-grid">
          {["256GB", "512GB", "1TB", "2TB"].map((cap) => (
            <BuyOptionCard
              key={cap}
              title={`${cap} SSD`}
              subtitle={cap === "256GB" ? "Essential storage for documents and lightweight workflows" : cap === "512GB" ? "Recommended balance for apps and photo libraries" : "Generous storage for expansive creative projects"}
              selected={storage === cap}
              onClick={() => setStorage(cap)}
            />
          ))}
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
        title="Your MacBook Air"
        items={[
          { label: "Model & Size", value: `${screenSize} MacBook Air` },
          { label: "Finish", value: finish },
          { label: "Unified Memory", value: `${memory} Unified Memory` },
          { label: "Storage", value: `${storage} SSD Storage` },
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
