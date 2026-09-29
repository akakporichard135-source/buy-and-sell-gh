import React, { useState } from "react";
import { SEO } from "../SEO";
import { useCart } from "../../context/CartContext";
import { formatGhs } from "../../utils/format";
import { whatsappUrl, productWhatsAppUrl } from "../../utils/whatsapp";
import { isProductPurchasable } from "../../catalog/productCatalog";
import { resolveProductGallery } from "../../utils/productImages";
import {
  BuyLayout,
  BuyOptionCard,
  BuyTradeInStep,
  BuyPaymentStep,
  BuyFulfillmentStep,
  BuySummaryCard,
} from "./BuyPrimitives";
import type { Product } from "../../types/product";
import type { ProductFamilyKey } from "../../catalog/productExperience";

export function GenericBuyExperience({
  product,
  family,
  slug,
}: {
  product?: Product;
  family: ProductFamilyKey;
  slug: string;
}) {
  const { addItem } = useCart();
  const [storage, setStorage] = useState(product?.storage[0] ?? "");
  const [color, setColor] = useState(product?.colors[0] ?? "");
  const [tradeIn, setTradeIn] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("Mobile Money on Confirmation");
  const [fulfillment, setFulfillment] = useState<"pickup" | "delivery">("pickup");
  const [activeThumb, setActiveThumb] = useState(0);
  const [notice, setNotice] = useState("");

  const name = product?.name ?? slug.split("-").map((s) => s ? `${s[0].toUpperCase()}${s.slice(1)}` : s).join(" ");
  const gallery = product ? resolveProductGallery(product) : [];
  const purchasable = product ? isProductPurchasable(product) : false;
  const priceLabel = product && !product.priceOnRequest && product.price > 0
    ? formatGhs(product.price)
    : "Price confirmed on enquiry";

  const activeImage = gallery[activeThumb]?.src || gallery[0]?.src || "/products/homepage/iphone-18-pro-hero.webp";

  const whatsAppEnquiry = product
    ? productWhatsAppUrl(product, storage, color)
    : whatsappUrl(`Hello Buy & Sell GH, I would like to enquire about ${name}. Storage: ${storage}, Colour: ${color}, Payment: ${paymentMethod}, Fulfillment: ${fulfillment === "pickup" ? "Pickup (Dome)" : "Delivery"}. Please confirm availability and price.`);

  const handleAddToBag = () => {
    if (product && purchasable) {
      const added = addItem(product, storage, color, 1);
      if (added) {
        setNotice(`${product.name} added to your bag.`);
      }
    } else {
      setNotice(`Connecting to WhatsApp to confirm ${name} availability...`);
      window.open(whatsAppEnquiry, "_blank", "noopener,noreferrer");
    }
  };

  const familyLabels: Record<ProductFamilyKey, { label: string; path: string }> = {
    iphone: { label: "iPhone", path: "/iphone" },
    mac: { label: "Mac", path: "/mac" },
    ipad: { label: "iPad", path: "/ipad" },
    watch: { label: "Watch", path: "/watch" },
    airpods: { label: "AirPods", path: "/airpods" },
    accessories: { label: "Accessories", path: "/accessories" },
  };

  return (
    <BuyLayout
      name={name}
      categoryLabel={familyLabels[family]?.label ?? "Store"}
      categoryPath={familyLabels[family]?.path ?? "/store"}
      activeImageSrc={activeImage}
      activeImageAlt={name}
      priceLabel={priceLabel}
      badge={product?.condition}
      thumbnails={gallery}
      activeThumbnailIndex={activeThumb}
      onSelectThumbnail={setActiveThumb}
      mobileActionLabel={purchasable ? "Add to Bag" : "Enquire"}
      onMobileAction={handleAddToBag}
    >
      <SEO
        title={`Buy ${name} | Buy & Sell GH`}
        description={`Configure and buy ${name} in Accra, Ghana. Verified condition, trusted warranty and delivery with Buy & Sell GH.`}
      />

      <div className="apple-buy-intro">
        <p className="apple-buy-intro-eyebrow">Buy {familyLabels[family]?.label}</p>
        <h2 className="apple-buy-intro-title">Buy {name}</h2>
        <p className="apple-buy-intro-lede">
          {product?.shortDescription || product?.description || "Original Apple device verified and backed by Buy & Sell GH."}
        </p>
      </div>

      {/* Storage / Option */}
      {product && product.storage && product.storage.length > 0 && (
        <section className="apple-buy-step">
          <div className="apple-buy-step-header">
            <h3 className="apple-buy-step-title">Configuration. <span>Choose capacity or specification.</span></h3>
          </div>
          <div className="apple-buy-cards-grid">
            {product.storage.map((opt) => (
              <BuyOptionCard
                key={opt}
                title={opt}
                selected={storage === opt}
                onClick={() => setStorage(opt)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Finish / Color */}
      {product && product.colors && product.colors.length > 0 && (
        <section className="apple-buy-step">
          <div className="apple-buy-step-header">
            <h3 className="apple-buy-step-title">Colour. <span>Available finishes.</span></h3>
          </div>
          <div className="apple-buy-cards-grid">
            {product.colors.map((c) => (
              <BuyOptionCard
                key={c}
                title={c}
                selected={color === c}
                onClick={() => setColor(c)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Trade-in */}
      {family !== "accessories" && (
        <BuyTradeInStep tradeInSelected={tradeIn} onSelect={setTradeIn} />
      )}

      {/* Payment */}
      <BuyPaymentStep paymentMethod={paymentMethod} onSelect={setPaymentMethod} />

      {/* Delivery & Pickup */}
      <BuyFulfillmentStep fulfillment={fulfillment} onSelect={setFulfillment} />

      {/* Summary */}
      <BuySummaryCard
        title={`Your ${name}`}
        items={[
          { label: "Product", value: name },
          ...(storage ? [{ label: "Configuration", value: storage }] : []),
          ...(color ? [{ label: "Colour", value: color }] : []),
          { label: "Condition", value: product?.condition ?? "Verified Unit" },
          { label: "Payment", value: paymentMethod },
          { label: "Fulfillment", value: fulfillment === "pickup" ? "Free In-Store Pickup (Dome Pillar 2)" : "Doorstep Delivery" },
        ]}
        priceLabel={priceLabel}
        onAddToBag={handleAddToBag}
        addToBagLabel={purchasable ? "Add to Bag" : "Enquire on Availability"}
        whatsAppHref={whatsAppEnquiry}
        notice={notice}
      />
    </BuyLayout>
  );
}
