import React, { useMemo, useState } from "react";
import { SEO } from "../SEO";
import { useCart } from "../../context/CartContext";
import { resolveConfiguredPrice } from "../../utils/productPricing";
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
    desc: "Personalized Spatial Audio with dynamic head tracking, refined open acoustic contour, and compact USB-C Charging Case.",
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

  const thumbnails = useMemo(() => [
    { src: "/products/campaigns/airpods-5-product.webp", alt: "AirPods 5 in open charging case showcasing precision acoustic stems" },
    { src: "/products/campaigns/airpods-5-earbuds.webp", alt: "AirPods 5 acoustic vents, microphone mesh, and transducer ports" },
    { src: "/products/campaigns/airpods-5-front.webp", alt: "AirPods 5 front-facing case with status LED and USB-C port" },
    { src: "/products/campaigns/airpods-5-dark.webp", alt: "AirPods 5 high-contrast dark studio acoustic rendering" },
    { src: "/products/campaigns/airpods-5-lifestyle.webp", alt: "AirPods 5 ergonomic in-ear comfort and listening" },
  ], []);

  const activeImage = thumbnails[activeThumb]?.src || "/products/campaigns/airpods-5-product.webp";

  const fallbackProduct: Product = useMemo(() => {
    const isAnc = edition === "AirPods 5 with Active Noise Cancellation";
    const basePrice = isAnc ? 3800 : 2800;
    const slug = "airpods-5";

    const variantList = [
      {
        id: "ap5-standard",
        productId: slug,
        title: "AirPods 5",
        storage: "AirPods 5",
        price: 2800,
        condition: "Brand New" as const,
        stockQuantity: 10,
        position: 1,
        available: true,
        isSale: false,
        stockStatus: "In Stock" as const,
      },
      {
        id: "ap5-anc",
        productId: slug,
        title: "AirPods 5 with Active Noise Cancellation",
        storage: "AirPods 5 with Active Noise Cancellation",
        price: 3800,
        condition: "Brand New" as const,
        stockQuantity: 10,
        position: 2,
        available: true,
        isSale: false,
        stockStatus: "In Stock" as const,
      },
    ];

    return {
      id: slug,
      slug,
      name: "AirPods 5",
      model: "AirPods 5",
      brand: "Apple",
      category: "AirPods",
      condition: "Brand New",
      price: basePrice,
      storage: ["AirPods 5", "AirPods 5 with Active Noise Cancellation"],
      colors: ["White"],
      description: "AirPods 5 featuring refined open acoustic geometry, H2 silicon, personalized spatial audio, and USB-C charging case.",
      specs: ["H2 Silicon", "Personalized Spatial Audio with Dynamic Head Tracking", "Voice Isolation", "USB-C Charging Case", "Up to 30 Hours Listening Time"],
      box: ["AirPods 5", "Charging Case (USB-C)", "Documentation"],
      imageTone: "light",
      images: thumbnails,
      variants: variantList,
      available: true,
      stockStatus: "In Stock" as const,
      stockQuantity: 10,
      featured: true,
    };
  }, [edition, thumbnails]);

  const isExactMatch = Boolean(
    catalogProduct &&
      (catalogProduct.slug === "airpods-5" || catalogProduct.slug.includes("airpods-5")) &&
      catalogProduct.condition === "Brand New" &&
      catalogProduct.variants &&
      catalogProduct.variants.length > 0
  );
  const activeProduct = isExactMatch && catalogProduct && catalogProduct.price > 0 && !catalogProduct.priceOnRequest ? catalogProduct : fallbackProduct;

  const configured = resolveConfiguredPrice(activeProduct, {
    storage: edition,
    model: edition,
  });
  const priceLabel = configured.formattedPrice;
  const previousPriceLabel = configured.formattedPreviousPrice;

  const fullConfigurationTitle = `${edition} (White)`;

  const whatsAppEnquiry = whatsappUrl(
    `Hello Buy & Sell GH, I would like to order/enquire about ${fullConfigurationTitle}. Price: ${priceLabel}, Finish: White, Payment: ${paymentMethod}, Fulfillment: ${fulfillment === "pickup" ? "In-Store Pickup (Dome)" : "Doorstep Delivery"}. Please confirm availability.`
  );

  const handleAddToBag = () => {
    const added = addItem(activeProduct, edition, "White", 1, configured.variant);
    if (added) {
      setNotice(`${edition} (${priceLabel}) added to your bag.`);
    } else {
      setNotice(`Your request for ${edition} is ready. Connecting to WhatsApp concierge...`);
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
          { label: "Charging Case", value: edition.includes("Noise Cancellation") ? "Wireless Case with Speaker (USB-C)" : "USB-C Case" },
          { label: "Payment", value: paymentMethod },
          { label: "Fulfillment", value: fulfillment === "pickup" ? "Free In-Store Pickup (Dome Pillar 2)" : "Doorstep Delivery" },
        ]}
        priceLabel={priceLabel}
        previousPriceLabel={previousPriceLabel}
        onAddToBag={handleAddToBag}
        addToBagLabel="Add to Bag"
        whatsAppHref={whatsAppEnquiry}
        notice={notice}
      />
    </BuyLayout>
  );
}
