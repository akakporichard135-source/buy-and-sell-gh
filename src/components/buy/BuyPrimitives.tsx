import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Check, ShieldCheck, Truck, Store, MessageCircle, ShoppingBag, ImageOff } from "lucide-react";
import { SwipeableProductGallery } from "./SwipeableProductGallery";
import "../../styles/apple-buy-experience.css";

export function useBuyEntrySelection(): { storage?: string; color?: string } {
  const { state } = useLocation();
  if (!state || typeof state !== "object") return {};
  const selection = state as { storage?: unknown; color?: unknown };
  return {
    storage: typeof selection.storage === "string" ? selection.storage : undefined,
    color: typeof selection.color === "string" ? selection.color : undefined,
  };
}

// --------------------------------------------------------------------------
// BuyLayout: Shared Two-Column Apple-style Buying Canvas
// --------------------------------------------------------------------------
export interface BuyLayoutProps {
  name: string;
  categoryLabel: string;
  categoryPath: string;
  activeImageSrc?: string;
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
  const galleryImages =
    thumbnails && thumbnails.length > 0
      ? thumbnails
      : activeImageSrc
      ? [{ src: activeImageSrc, alt: activeImageAlt }]
      : [];

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
        {/* Left Column: Sticky Product Showcase with Swipeable Gallery & Dots */}
        <div className="apple-buy-gallery-col">
          <SwipeableProductGallery
            images={galleryImages}
            activeIndex={activeThumbnailIndex}
            onSelectIndex={(newIndex) => {
              if (onSelectThumbnail) {
                onSelectThumbnail(newIndex);
              }
            }}
            productName={name}
            darkStage={darkStage}
          />
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
  border?: boolean;
}

export interface BuyColorSwatchesProps {
  colors: ColorOption[];
  selectedColor: string;
  onSelect: (color: string) => void;
  labelPrefix?: string;
  previewImageSrc?: string;
  previewImageAlt?: string;
}

export function BuyColorSwatches({
  colors,
  selectedColor,
  onSelect,
  labelPrefix = "Finish",
  // previewImageSrc and previewImageAlt retained in props interface for backward-compatibility, but separate preview image is removed per design instruction
}: BuyColorSwatchesProps) {
  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    let nextIndex = -1;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      nextIndex = (index + 1) % colors.length;
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      nextIndex = (index - 1 + colors.length) % colors.length;
    } else if (e.key === "Home") {
      e.preventDefault();
      nextIndex = 0;
    } else if (e.key === "End") {
      e.preventDefault();
      nextIndex = colors.length - 1;
    }

    if (nextIndex >= 0 && colors[nextIndex]) {
      onSelect(colors[nextIndex].name);
    }
  };

  return (
    <div className="apple-buy-swatches">
      <div className="apple-buy-swatch-label">
        {labelPrefix} — <strong>{selectedColor}</strong>
      </div>
      <div
        className="apple-buy-swatch-list"
        role="radiogroup"
        aria-label={`${labelPrefix} selection`}
      >
        {colors.map((c, idx) => {
          const isSelected = selectedColor.trim().toLowerCase() === c.name.trim().toLowerCase();
          return (
            <div key={c.name} className="apple-buy-swatch-target">
              <button
                type="button"
                role="radio"
                aria-checked={isSelected}
                tabIndex={isSelected ? 0 : -1}
                className={`apple-buy-swatch-btn ${isSelected ? "is-selected" : ""} ${c.border ? "has-border" : ""}`}
                style={{ backgroundColor: c.hex }}
                onClick={() => onSelect(c.name)}
                onKeyDown={(e) => handleKeyDown(e, idx)}
                title={c.name}
                aria-label={`Select ${labelPrefix.toLowerCase()}: ${c.name}`}
              />
            </div>
          );
        })}
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
  const [deviceType, setDeviceType] = React.useState("iPhone");
  const [condition, setCondition] = React.useState("Working & Flawless");

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

      {tradeInSelected && (
        <div
          style={{
            marginTop: 16,
            padding: "18px 20px",
            background: "#fbfbfd",
            borderRadius: 16,
            border: "1px solid #d2d2d7",
          }}
        >
          <h4 style={{ margin: "0 0 12px", fontSize: "0.98rem", fontWeight: 700, color: "#1d1d1f" }}>
            Select your trade-in device category
          </h4>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 10, marginBottom: 14 }}>
            {["iPhone", "Mac", "iPad", "Apple Watch", "Other Brand"].map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setDeviceType(type)}
                className={`apple-buy-card ${deviceType === type ? "is-selected" : ""}`}
                style={{ padding: "12px 14px", minHeight: "auto", textAlign: "center" }}
              >
                <span style={{ fontSize: "0.9rem", fontWeight: 600 }}>{type}</span>
              </button>
            ))}
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 14 }}>
            {[
              { label: "Working & Flawless", desc: "No cracks, full battery health" },
              { label: "Normal Everyday Wear", desc: "Light scratches, all functional" },
              { label: "Cracked or Minor Faults", desc: "Screen cracks or battery replacement needed" },
            ].map((cond) => (
              <button
                key={cond.label}
                type="button"
                onClick={() => setCondition(cond.label)}
                className={`apple-buy-card ${condition === cond.label ? "is-selected" : ""}`}
                style={{ flex: "1 1 200px", padding: "10px 14px", minHeight: "auto" }}
              >
                <div style={{ fontWeight: 600, fontSize: "0.85rem" }}>{cond.label}</div>
                <div style={{ fontSize: "0.75rem", color: "#86868b" }}>{cond.desc}</div>
              </button>
            ))}
          </div>

          <div
            style={{
              padding: "10px 14px",
              background: "#e8f5e9",
              borderRadius: 10,
              fontSize: "0.84rem",
              color: "#2e7d32",
              lineHeight: 1.4,
            }}
          >
            <strong>Note on trade-in value:</strong> Bring your {deviceType} ({condition.toLowerCase()}) to our showroom at Dome Pillar 2 or send photos via WhatsApp. We do not automatically deduct trade-in value online; your credit will be finalized in person upon physical verification.
          </div>
        </div>
      )}
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
  previousPriceLabel?: string;
  tradeInBreakdown?: {
    retailPrice: number;
    tradeInCredit: number;
    estimatedDue: number;
    formattedRetailPrice: string;
    formattedTradeInCredit: string;
    formattedEstimatedDue: string;
  };
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
  previousPriceLabel,
  tradeInBreakdown,
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
        <span className="apple-buy-summary-price-label">Price</span>
        <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
          {previousPriceLabel && (
            <span style={{ textDecoration: "line-through", color: "#86868b", fontSize: "1.1rem" }}>
              {previousPriceLabel}
            </span>
          )}
          <span className="apple-buy-summary-price-val">{priceLabel}</span>
        </div>
      </div>

      {tradeInBreakdown && tradeInBreakdown.tradeInCredit > 0 && (
        <div style={{ margin: "12px 0", padding: "12px 14px", background: "#f5f5f7", borderRadius: "12px", fontSize: "0.88rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
            <span style={{ color: "#6e6e73" }}>Device Retail Price:</span>
            <span style={{ fontWeight: 600 }}>{tradeInBreakdown.formattedRetailPrice}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px", color: "#2e7d32" }}>
            <span>Estimated Trade-in Credit:</span>
            <span style={{ fontWeight: 600 }}>{tradeInBreakdown.formattedTradeInCredit}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid #e5e5e7", paddingTop: "6px", fontWeight: 700, fontSize: "0.95rem" }}>
            <span>Estimated Balance Due:</span>
            <span>{tradeInBreakdown.formattedEstimatedDue}</span>
          </div>
          <p style={{ margin: "6px 0 0", fontSize: "0.78rem", color: "#86868b", lineHeight: 1.35 }}>
            *Final trade-in credit confirmed upon physical inspection at Dome Pillar 2.
          </p>
        </div>
      )}

      {notice && (
        <div style={{ padding: "10px 14px", background: "#e8f5e9", color: "#2e7d32", borderRadius: "10px", fontSize: "0.88rem", fontWeight: 600 }}>
          {notice}
        </div>
      )}

      {/* Hidden landmark anchor for backwards compatibility */}
      <div id="buy-customer-details" className="sr-only" aria-hidden="true" />

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
