import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
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

const IPHONE_18_COLORS: ColorOption[] = [
  { name: "Deep Burgundy", hex: "#4e1b24" },
  { name: "Space Black", hex: "#222224" },
  { name: "Natural Titanium", hex: "#b5b0a8" },
  { name: "Light Blue", hex: "#7e9bb5" },
];

const FINISH_IMAGE_MAP: Record<string, string> = {
  "Deep Burgundy": "/products/campaigns/iphone-18-pro-burgundy-finish.webp",
  "Space Black": "/products/campaigns/iphone-18-pro-coffee.webp",
  "Natural Titanium": "/products/campaigns/iphone-18-pro-silver.webp",
  "Light Blue": "/products/campaigns/iphone-18-pro-colors.webp",
  Burgundy: "/products/campaigns/iphone-18-pro-burgundy-finish.webp",
  Silver: "/products/campaigns/iphone-18-pro-silver.webp",
};

export function IphoneBuyExperience({ catalogProduct }: { catalogProduct?: Product }) {
  const navigate = useNavigate();
  const { addItem } = useCart();

  const [model, setModel] = useState<"iPhone 18 Pro" | "iPhone 18 Pro Max">("iPhone 18 Pro");
  const [finish, setFinish] = useState("Deep Burgundy");
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

  const storageOptions: string[] = useMemo(() => (model === "iPhone 18 Pro Max"
    ? ["256GB", "512GB", "1TB", "2TB"]
    : ["256GB", "512GB", "1TB"]), [model]);

  const fallbackProduct: Product = useMemo(() => {
    const isMax = model === "iPhone 18 Pro Max";
    const basePrice = isMax ? 22500 : 20500;
    return {
      id: isMax ? "iphone-18-pro-max" : "iphone-18-pro",
      slug: isMax ? "iphone-18-pro-max" : "iphone-18-pro",
      name: model,
      model,
      brand: "Apple",
      category: "iPhones",
      condition: "Brand New",
      price: basePrice,
      storage: storageOptions,
      colors: ["Deep Burgundy", "Space Black", "Natural Titanium", "Light Blue"],
      description: "Flagship iPhone 18 Pro in contoured aerospace-grade titanium with advanced camera system.",
      specs: ["A19 Pro chip", "Titanium design", "Super Retina XDR", "Pro camera system"],
      box: ["iPhone with iOS 20", "USB-C Charge Cable", "Documentation"],
      imageTone: "dark",
      images: [{ src: currentFinishImage, alt: `${model} ${finish}` }],
      variants: [
        { id: `${isMax ? "18pm" : "18p"}-256`, productId: isMax ? "iphone-18-pro-max" : "iphone-18-pro", title: `${model} 256GB`, storage: "256GB", price: isMax ? 22500 : 20500, condition: "Brand New", stockQuantity: 10, position: 1, available: true, isSale: false, stockStatus: "In Stock" },
        { id: `${isMax ? "18pm" : "18p"}-512`, productId: isMax ? "iphone-18-pro-max" : "iphone-18-pro", title: `${model} 512GB`, storage: "512GB", price: isMax ? 25500 : 23000, condition: "Brand New", stockQuantity: 10, position: 2, available: true, isSale: false, stockStatus: "In Stock" },
        { id: `${isMax ? "18pm" : "18p"}-1tb`, productId: isMax ? "iphone-18-pro-max" : "iphone-18-pro", title: `${model} 1TB`, storage: "1TB", price: isMax ? 28500 : 26500, condition: "Brand New", stockQuantity: 10, position: 3, available: true, isSale: false, stockStatus: "In Stock" },
        ...(isMax ? [{ id: "18pm-2tb", productId: "iphone-18-pro-max", title: `${model} 2TB`, storage: "2TB", price: 32000, condition: "Brand New" as const, stockQuantity: 10, position: 4, available: true, isSale: false, stockStatus: "In Stock" as const }] : []),
      ],
      available: true,
      stockStatus: "In Stock",
      stockQuantity: 10,
      featured: true,
    };
  }, [model, storageOptions, currentFinishImage, finish]);

  const activeProduct = catalogProduct && catalogProduct.price > 0 && !catalogProduct.priceOnRequest ? catalogProduct : fallbackProduct;
  const configured = resolveConfiguredPrice(activeProduct, { storage, model });
  const priceLabel = configured.formattedPrice;
  const previousPriceLabel = configured.formattedPreviousPrice;
  const tradeInBreakdown = calculateTradeInBreakdown(configured.price, tradeIn);

  const whatsAppEnquiry = whatsappUrl(
    `Hello Buy & Sell GH, I would like to order ${model}. Configuration: ${storage}, Finish: ${finish}, Price: ${priceLabel}, Payment: ${paymentMethod}, Fulfillment: ${fulfillment === "pickup" ? "In-Store Pickup (Dome)" : "Doorstep Delivery"}${tradeIn ? ", Trade-in: Yes" : ""}. Please confirm availability.`
  );

  const handleAddToBag = () => {
    const added = addItem(activeProduct, storage, finish, 1, configured.variant);
    if (added) {
      setNotice(`${model} (${storage}, ${finish}) - ${priceLabel} added to your bag.`);
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
          {storageOptions.map((opt: string) => (
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
