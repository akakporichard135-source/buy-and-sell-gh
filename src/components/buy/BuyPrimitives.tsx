import React from "react";
import { Link } from "react-router-dom";
import { Check, ShieldCheck, Truck, Store, MessageCircle, ShoppingBag } from "lucide-react";
import "../../styles/apple-buy-experience.css";

// --------------------------------------------------------------------------
// BuyLayout: Shared Two-Column Apple-style Buying Canvas
// --------------------------------------------------------------------------
export interface BuyLayoutProps {
  name: string;
  categoryLabel: string;
  categoryPath: string;
  activeImageSrc: string;
  activeImageAlt: string;
  priceLabel: string;
  badge?: string;
  darkStage?: boolean;
  thumbnails?: { src: string; alt: string }[];
  activeThumbnailIndex?: number;
  onSelectThumbnail?: (index: number) => void;
  children: React.ReactNode;
  mobileActionLabel?: string;
  onMobileAction?: () => void;
}

export function BuyLayout({
  name,
  categoryLabel,
  categoryPath,
  activeImageSrc,
  activeImageAlt,
  priceLabel,
  badge,
  darkStage = false,
  thumbnails = [],
  activeThumbnailIndex = 0,
  onSelectThumbnail,
  children,
  mobileActionLabel = "Add to Bag",
  onMobileAction,
}: BuyLayoutProps) {
  return (
    <div className="apple-buy-root">
      <div className="apple-buy-header">
        <div className="apple-buy-header-inner">
          <div className="apple-buy-header-title">
            <h1>Buy {name}</h1>
            {badge && <span className="apple-buy-header-badge">{badge}</span>}
          </div>
          <div className="apple-buy-header-price">{priceLabel}</div>
        </div>
      </div>

      <nav className="apple-buy-breadcrumbs" aria-label="Breadcrumb">
        <Link to="/">Home</Link>
        <span>/</span>
        <Link to={categoryPath}>{categoryLabel}</Link>
        <span>/</span>
        <strong>Buy {name}</strong>
      </nav>

      <main className="apple-buy-container">
        {/* Left Column: Sticky Product Showcase */}
        <div className="apple-buy-gallery-col">
          <div className={`apple-buy-stage ${darkStage ? "apple-buy-stage-dark" : ""}`}>
            <img
              src={activeImageSrc}
              alt={activeImageAlt}
              className="apple-buy-stage-img"
              loading="eager"
              fetchPriority="high"
              decoding="async"
              draggable={false}
            />
          </div>
          {thumbnails.length > 1 && (
            <div className="apple-buy-thumbnails" aria-label={`${name} viewing angles`}>
              {thumbnails.map((thumb, idx) => (
                <button
                  type="button"
                  key={`${thumb.src}-${idx}`}
                  className={`apple-buy-thumb ${idx === activeThumbnailIndex ? "is-selected" : ""}`}
                  onClick={() => onSelectThumbnail && onSelectThumbnail(idx)}
                  aria-label={`View ${thumb.alt || `angle ${idx + 1}`}`}
                >
                  <img src={thumb.src} alt="" />
                </button>
              ))}
            </div>
          )}
          <p className="apple-buy-stage-caption">
            100% genuine Apple hardware verified directly with Buy &amp; Sell GH in Accra.
          </p>
        </div>

        {/* Right Column: Progressive Configuration */}
        <div className="apple-buy-config-col">
          {children}
        </div>
      </main>

      {/* Mobile Persistent Purchase Bar */}
      <aside className="apple-buy-mobile-bar" aria-label="Purchase overview">
        <div className="apple-buy-mobile-info">
          <span className="apple-buy-mobile-name">{name}</span>
          <span className="apple-buy-mobile-price">{priceLabel}</span>
        </div>
        {onMobileAction && (
          <button type="button" className="apple-buy-mobile-btn" onClick={onMobileAction}>
            {mobileActionLabel}
          </button>
        )}
      </aside>
    </div>
  );
}

// --------------------------------------------------------------------------
// BuyOptionCard: Rounded progressive choice card
// --------------------------------------------------------------------------
export interface BuyOptionCardProps {
  title: string;
  subtitle?: string;
  priceDiff?: string;
  selected: boolean;
  onClick: () => void;
}

export function BuyOptionCard({ title, subtitle, priceDiff, selected, onClick }: BuyOptionCardProps) {
  return (
    <button
      type="button"
      className={`apple-buy-card ${selected ? "is-selected" : ""}`}
      onClick={onClick}
      aria-pressed={selected}
    >
      <div className="apple-buy-card-top">
        <h4 className="apple-buy-card-title">{title}</h4>
        {selected && <Check size={18} className="apple-buy-card-check" />}
      </div>
      {subtitle && <p className="apple-buy-card-desc">{subtitle}</p>}
      {priceDiff && <span className="apple-buy-card-price">{priceDiff}</span>}
    </button>
  );
}

// --------------------------------------------------------------------------
// BuyColorSwatches: Circular color selector
// --------------------------------------------------------------------------
export interface ColorOption {
  name: string;
  hex: string;
}

export interface BuyColorSwatchesProps {
  colors: ColorOption[];
  selectedColor: string;
  onSelect: (color: string) => void;
}

export function BuyColorSwatches({ colors, selectedColor, onSelect }: BuyColorSwatchesProps) {
  return (
    <div className="apple-buy-swatches">
      <div className="apple-buy-swatch-label">
        Color — <strong>{selectedColor}</strong>
      </div>
      <div className="apple-buy-swatch-list">
        {colors.map((c) => (
          <button
            type="button"
            key={c.name}
            className={`apple-buy-swatch-btn ${selectedColor.toLowerCase() === c.name.toLowerCase() ? "is-selected" : ""}`}
            style={{ backgroundColor: c.hex }}
            onClick={() => onSelect(c.name)}
            title={c.name}
            aria-label={`Select finish: ${c.name}`}
          />
        ))}
      </div>
    </div>
  );
}

// --------------------------------------------------------------------------
// BuyTradeInStep: Real Buy & Sell GH trade-in step
// --------------------------------------------------------------------------
export interface BuyTradeInStepProps {
  tradeInSelected: boolean;
  onSelect: (tradeIn: boolean) => void;
}

export function BuyTradeInStep({ tradeInSelected, onSelect }: BuyTradeInStepProps) {
  return (
    <section className="apple-buy-step">
      <div className="apple-buy-step-header">
        <h3 className="apple-buy-step-title">Buy &amp; Sell GH Trade-in. <span>Get credit toward your upgrade.</span></h3>
        <p className="apple-buy-step-subtitle">Trade in your current device with our Dome team for instant value toward this purchase.</p>
      </div>
      <div className="apple-buy-cards-grid">
        <BuyOptionCard
          title="Yes, evaluate my trade-in"
          subtitle="Our team will inspect your device in Dome or evaluate photos on WhatsApp for upgrade credit."
          selected={tradeInSelected}
          onClick={() => onSelect(true)}
        />
        <BuyOptionCard
          title="No trade-in"
          subtitle="Proceed with direct purchase without trading in an existing device."
          selected={!tradeInSelected}
          onClick={() => onSelect(false)}
        />
      </div>
    </section>
  );
}

// --------------------------------------------------------------------------
// BuyPaymentStep: Supported payment methods
// --------------------------------------------------------------------------
export const SUPPORTED_PAYMENT_METHODS = [
  {
    id: "momo",
    title: "Mobile Money on Confirmation",
    desc: "MTN MoMo or Telecel Cash confirmed directly with the shop upon order review.",
  },
  {
    id: "pickup_cash",
    title: "Pay on Pickup",
    desc: "Inspect the physical device in Dome Pillar 2, Accra, then pay on the spot.",
  },
  {
    id: "bank",
    title: "Bank Transfer on Confirmation",
    desc: "Direct bank transfer to Buy & Sell GH commercial account upon order approval.",
  },
];

export interface BuyPaymentStepProps {
  paymentMethod: string;
  onSelect: (method: string) => void;
}

export function BuyPaymentStep({ paymentMethod, onSelect }: BuyPaymentStepProps) {
  return (
    <section className="apple-buy-step">
      <div className="apple-buy-step-header">
        <h3 className="apple-buy-step-title">Payment. <span>Choose how you prefer to pay.</span></h3>
        <p className="apple-buy-step-subtitle">No advance payment required before your unit and order details are personally verified.</p>
      </div>
      <div className="apple-buy-cards-grid">
        {SUPPORTED_PAYMENT_METHODS.map((pm) => (
          <BuyOptionCard
            key={pm.id}
            title={pm.title}
            subtitle={pm.desc}
            selected={paymentMethod === pm.title}
            onClick={() => onSelect(pm.title)}
          />
        ))}
      </div>
    </section>
  );
}

// --------------------------------------------------------------------------
// BuyFulfillmentStep: Supported fulfillment options
// --------------------------------------------------------------------------
export interface BuyFulfillmentStepProps {
  fulfillment: "pickup" | "delivery";
  onSelect: (type: "pickup" | "delivery") => void;
}

export function BuyFulfillmentStep({ fulfillment, onSelect }: BuyFulfillmentStepProps) {
  return (
    <section className="apple-buy-step">
      <div className="apple-buy-step-header">
        <h3 className="apple-buy-step-title">Delivery &amp; Pickup. <span>Choose fulfillment.</span></h3>
        <p className="apple-buy-step-subtitle">Pick up in store or have your device safely delivered across Ghana.</p>
      </div>
      <div className="apple-buy-cards-grid">
        <BuyOptionCard
          title="Free In-Store Pickup"
          subtitle="Pick up and test your device at Dome Pillar 2, No Visa, Accra."
          selected={fulfillment === "pickup"}
          onClick={() => onSelect("pickup")}
        />
        <BuyOptionCard
          title="Doorstep Delivery"
          subtitle="Express rider delivery across Greater Accra & nationwide dispatch across Ghana."
          selected={fulfillment === "delivery"}
          onClick={() => onSelect("delivery")}
        />
      </div>
    </section>
  );
}

// --------------------------------------------------------------------------
// BuySummaryCard: Final review, Add to Bag & WhatsApp Concierge
// --------------------------------------------------------------------------
export interface SummaryItem {
  label: string;
  value: string;
}

export interface BuySummaryCardProps {
  title: string;
  items: SummaryItem[];
  priceLabel: string;
  onAddToBag: () => void;
  addToBagLabel?: string;
  whatsAppHref: string;
  notice?: string;
  isPreorder?: boolean;
}

export function BuySummaryCard({
  title,
  items,
  priceLabel,
  onAddToBag,
  addToBagLabel = "Add to Bag",
  whatsAppHref,
  notice,
  isPreorder = false,
}: BuySummaryCardProps) {
  return (
    <section className="apple-buy-summary-card">
      <div className="apple-buy-summary-header">
        <h3>{title}</h3>
        <p className="apple-buy-step-subtitle">
          {isPreorder
            ? "Your pre-order reservation is prepared with zero obligation before confirmation."
            : "Review your selected hardware configuration before adding to your bag."}
        </p>
      </div>

      <ul className="apple-buy-summary-items">
        {items.map((item) => (
          <li key={item.label} className="apple-buy-summary-item">
            <span className="apple-buy-summary-item-label">{item.label}</span>
            <span className="apple-buy-summary-item-val">{item.value}</span>
          </li>
        ))}
      </ul>

      <div className="apple-buy-summary-pricing">
        <span className="apple-buy-summary-price-label">Total</span>
        <span className="apple-buy-summary-price-val">{priceLabel}</span>
      </div>

      {notice && (
        <div style={{ padding: "10px 14px", background: "#e8f5e9", color: "#2e7d32", borderRadius: "10px", fontSize: "0.88rem", fontWeight: 600 }}>
          {notice}
        </div>
      )}

      <div className="apple-buy-summary-actions">
        <button type="button" className="apple-buy-btn-primary" onClick={onAddToBag}>
          <ShoppingBag size={19} />
          {addToBagLabel}
        </button>
        <a href={whatsAppHref} target="_blank" rel="noopener noreferrer" className="apple-buy-btn-secondary">
          <MessageCircle size={18} color="#25D366" />
          Enquire on WhatsApp
        </a>
      </div>

      <ul className="apple-buy-assurances">
        <li><ShieldCheck size={16} /> 100% Genuine Apple device guarantee</li>
        <li><Store size={16} /> Inspection and verification before payment in Dome Pillar 2</li>
        <li><Truck size={16} /> Safe doorstep delivery across Accra and nationwide Ghana</li>
      </ul>
    </section>
  );
}
