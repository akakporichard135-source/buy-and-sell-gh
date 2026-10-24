import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Check,
  ChevronLeft,
  Lock,
  MessageCircle,
  Phone,
  ShieldCheck,
  ShoppingBag,
  Store,
  Truck,
  User,
} from "lucide-react";
import { useCart } from "../../context/CartContext";
import { useBuyJourney } from "../../context/BuyJourneyContext";
import { cartItemKey, getItemEffectivePrice } from "../../context/cartOperations";
import { formatGhs } from "../../utils/format";
import { resolveProductColorImage } from "../../utils/productColorImages";
import { hasOwnerUploadedProductImages, resolveProductImage } from "../../utils/productImages";
import type { CartItem } from "../../types/product";
import "../../styles/apple-bag-checkout.css";

const GHANA_REGIONS = [
  "Greater Accra",
  "Ashanti",
  "Western",
  "Central",
  "Eastern",
  "Volta",
  "Northern",
  "Upper East",
  "Upper West",
  "Bono",
  "Bono East",
  "Ahafo",
  "Oti",
  "Savannah",
  "North East",
  "Western North",
];

function itemImage(item: CartItem): string {
  const primary = resolveProductImage(item.product)?.src;
  return (
    item.colorImageSrc ||
    (hasOwnerUploadedProductImages(item.product) ? primary : undefined) ||
    resolveProductColorImage(item.product, item.color) ||
    primary ||
    ""
  );
}

export function AppleCheckout() {
  const navigate = useNavigate();
  const { items, subtotal, totalItems } = useCart();
  const {
    customer,
    updateCustomer,
    errors,
    placingOrder,
    orderError,
    placeOrder,
  } = useBuyJourney();

  const [sameAsPhone, setSameAsPhone] = useState(
    customer.whatsapp === customer.fullName ? false : true
  );

  const handlePhoneChange = (val: string) => {
    updateCustomer("whatsapp", sameAsPhone ? val : customer.whatsapp);
  };

  const handleSameAsPhoneToggle = (checked: boolean) => {
    setSameAsPhone(checked);
    if (checked && customer.whatsapp) {
      // keep current whatsapp
    }
  };

  if (items.length === 0) {
    return (
      <div className="apple-checkout-page">
        <div className="apple-checkout-shell">
          <div className="apple-bag-empty-state">
            <div className="apple-bag-empty-icon">
              <ShoppingBag size={32} />
            </div>
            <h2>Your Bag is empty</h2>
            <p>Add original Apple devices to your bag before checking out.</p>
            <Link to="/store" className="apple-checkout-btn-primary is-gold" style={{ maxWidth: 260 }}>
              Explore Products
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="apple-checkout-page">
      <div className="apple-checkout-shell">
        {/* Minimalist Apple Checkout Header */}
        <div className="apple-bag-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <Link to="/cart" className="apple-bag-action-btn" style={{ marginBottom: 6 }}>
              <ChevronLeft size={16} /> Return to Bag
            </Link>
            <h1 className="apple-bag-heading">Checkout</h1>
            <p className="apple-bag-subtitle">Review your details and submit your order request directly to Buy &amp; Sell GH.</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#2e7d32", fontSize: "0.85rem", fontWeight: 600 }}>
            <Lock size={15} /> Secure Offline Request
          </div>
        </div>

        <div className="apple-checkout-container" id="checkout-customer-details">
          {/* Left Column: Progressive Apple Checkout Steps */}
          <div className="apple-checkout-steps">
            {/* Step 1: Contact Information */}
            <section className="apple-checkout-step">
              <div className="apple-checkout-step-header">
                <span className="apple-checkout-step-num">1.</span>
                <h3 className="apple-checkout-step-title">Contact Information</h3>
              </div>

              <div className="apple-checkout-form-grid">
                <div className={`apple-checkout-field ${errors.fullName ? "has-error" : ""}`}>
                  <label htmlFor="chk-name">Full Name *</label>
                  <input
                    id="chk-name"
                    type="text"
                    autoComplete="name"
                    placeholder="e.g. Kwame Mensah"
                    className="apple-checkout-input"
                    value={customer.fullName}
                    onChange={(e) => updateCustomer("fullName", e.target.value)}
                  />
                  {errors.fullName && <span className="apple-checkout-error-text">{errors.fullName}</span>}
                </div>

                <div className={`apple-checkout-field ${errors.whatsapp ? "has-error" : ""}`}>
                  <label htmlFor="chk-phone">WhatsApp / Phone Number *</label>
                  <input
                    id="chk-phone"
                    type="tel"
                    autoComplete="tel"
                    placeholder="e.g. 024 123 4567"
                    className="apple-checkout-input"
                    value={customer.whatsapp}
                    onChange={(e) => updateCustomer("whatsapp", e.target.value)}
                  />
                  {errors.whatsapp && <span className="apple-checkout-error-text">{errors.whatsapp}</span>}
                </div>

                <div className="apple-checkout-field is-full">
                  <label htmlFor="chk-email">Email Address <span style={{ color: "#86868b", fontWeight: 400 }}>(Optional, for receipt copy)</span></label>
                  <input
                    id="chk-email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    className="apple-checkout-input"
                    value={customer.additionalNote?.match(/Email: ([^\s|]+)/)?.[1] || ""}
                    onChange={(e) => {
                      const email = e.target.value.trim();
                      const noteWithoutEmail = customer.additionalNote?.replace(/Email: [^\s|]+\s*\|?\s*/, "") || "";
                      const nextNote = email ? `Email: ${email} | ${noteWithoutEmail}` : noteWithoutEmail;
                      updateCustomer("additionalNote", nextNote);
                    }}
                  />
                </div>
              </div>
            </section>

            {/* Step 2: Fulfillment (Store Pickup vs Delivery) */}
            <section className="apple-checkout-step">
              <div className="apple-checkout-step-header">
                <span className="apple-checkout-step-num">2.</span>
                <h3 className="apple-checkout-step-title">Fulfillment Method</h3>
              </div>

              <div className="apple-checkout-option-cards">
                <div
                  className={`apple-checkout-option-card ${customer.fulfilmentType === "pickup" ? "is-selected" : ""}`}
                  onClick={() => updateCustomer("fulfilmentType", "pickup")}
                >
                  <div className="apple-checkout-card-header">
                    <span className="apple-checkout-card-title">In-Store Pickup</span>
                    <span className="apple-checkout-card-badge">FREE</span>
                  </div>
                  <p className="apple-checkout-card-desc">
                    Pick up and inspect your genuine Apple device in Dome Pillar 2, Accra (Near No Visa).
                  </p>
                </div>

                <div
                  className={`apple-checkout-option-card ${customer.fulfilmentType === "delivery" ? "is-selected" : ""}`}
                  onClick={() => updateCustomer("fulfilmentType", "delivery")}
                >
                  <div className="apple-checkout-card-header">
                    <span className="apple-checkout-card-title">Doorstep Delivery</span>
                    <Truck size={18} color="#0071e3" />
                  </div>
                  <p className="apple-checkout-card-desc">
                    Safe rider delivery across Greater Accra &amp; express dispatch across Ghana.
                  </p>
                </div>
              </div>

              {customer.fulfilmentType === "delivery" && (
                <div className="apple-checkout-form-grid" style={{ marginTop: 8 }}>
                  <div className={`apple-checkout-field ${errors.region ? "has-error" : ""}`}>
                    <label htmlFor="chk-region">Region *</label>
                    <select
                      id="chk-region"
                      className="apple-checkout-select"
                      value={customer.region || "Greater Accra"}
                      onChange={(e) => updateCustomer("region", e.target.value)}
                    >
                      {GHANA_REGIONS.map((reg) => (
                        <option key={reg} value={reg}>
                          {reg}
                        </option>
                      ))}
                    </select>
                    {errors.region && <span className="apple-checkout-error-text">{errors.region}</span>}
                  </div>

                  <div className={`apple-checkout-field ${errors.city ? "has-error" : ""}`}>
                    <label htmlFor="chk-city">City or Area *</label>
                    <input
                      id="chk-city"
                      type="text"
                      placeholder="e.g. East Legon, Spintex, Kumasi"
                      className="apple-checkout-input"
                      value={customer.city}
                      onChange={(e) => updateCustomer("city", e.target.value)}
                    />
                    {errors.city && <span className="apple-checkout-error-text">{errors.city}</span>}
                  </div>

                  <div className={`apple-checkout-field is-full ${errors.deliveryAddress ? "has-error" : ""}`}>
                    <label htmlFor="chk-address">Street Address, Landmark or Digital Address *</label>
                    <input
                      id="chk-address"
                      type="text"
                      autoComplete="street-address"
                      placeholder="e.g. House No. 14, Near Shell Station / GA-123-4567"
                      className="apple-checkout-input"
                      value={customer.deliveryAddress}
                      onChange={(e) => updateCustomer("deliveryAddress", e.target.value)}
                    />
                    {errors.deliveryAddress && <span className="apple-checkout-error-text">{errors.deliveryAddress}</span>}
                  </div>
                </div>
              )}

              <div className="apple-checkout-field is-full">
                <label htmlFor="chk-note">Special Order Instructions <span style={{ color: "#86868b", fontWeight: 400 }}>(Optional)</span></label>
                <textarea
                  id="chk-note"
                  rows={2}
                  placeholder="e.g. Please call before arrival, or I will come around 3 PM"
                  className="apple-checkout-textarea"
                  value={customer.additionalNote?.replace(/Email: [^\s|]+\s*\|?\s*/, "") || ""}
                  onChange={(e) => {
                    const custom = e.target.value;
                    const email = customer.additionalNote?.match(/Email: ([^\s|]+)/)?.[1] || "";
                    updateCustomer("additionalNote", email ? `Email: ${email} | ${custom}` : custom);
                  }}
                />
              </div>
            </section>

            {/* Step 3: Offline Payment Arrangement Notice */}
            <section className="apple-checkout-step">
              <div className="apple-checkout-step-header">
                <span className="apple-checkout-step-num">3.</span>
                <h3 className="apple-checkout-step-title">Payment &amp; Terms</h3>
              </div>

              <div className="apple-checkout-notice-callout">
                <div className="apple-checkout-notice-icon">
                  <ShieldCheck size={22} />
                </div>
                <div className="apple-checkout-notice-body">
                  <h4>No online payment is required</h4>
                  <p>
                    Buy &amp; Sell GH does not process online payments. When you submit this order request, our Dome showroom team verifies device stock and contacts you to confirm pickup timing or delivery dispatch.
                  </p>
                  <p style={{ marginTop: 6, fontWeight: 600, color: "#1d1d1f" }}>
                    You inspect and verify the physical device before completing payment.
                  </p>
                </div>
              </div>
            </section>
          </div>

          {/* Right Column: Sticky Order Summary & Submit Button */}
          <aside className="apple-checkout-review-sidebar">
            <div className="apple-checkout-review-card">
              <h3 className="apple-bag-summary-title">Order Review ({totalItems} {totalItems === 1 ? "item" : "items"})</h3>

              <div className="apple-checkout-items-list">
                {items.map((item) => {
                  const key = cartItemKey(item);
                  const img = itemImage(item);
                  return (
                    <div key={key} className="apple-checkout-mini-item">
                      <div className="apple-checkout-mini-thumb">
                        {img ? <img src={img} alt={item.product.name} /> : <ShoppingBag size={20} color="#86868b" />}
                      </div>
                      <div className="apple-checkout-mini-details">
                        <h4 className="apple-checkout-mini-title">{item.product.name}</h4>
                        <p className="apple-checkout-mini-specs">
                          {item.quantity} × {[item.storage, item.color].filter(Boolean).join(" · ")}
                        </p>
                      </div>
                      <div className="apple-checkout-mini-price">
                        {formatGhs(getItemEffectivePrice(item) * item.quantity)}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="apple-bag-summary-rows">
                <div className="apple-bag-summary-row">
                  <span>Subtotal</span>
                  <span>{formatGhs(subtotal)}</span>
                </div>
                <div className="apple-bag-summary-row">
                  <span>Fulfillment</span>
                  <span>{customer.fulfilmentType === "pickup" ? "Free In-Store Pickup" : "Doorstep Delivery"}</span>
                </div>
                <div className="apple-bag-summary-row is-total">
                  <span>Total</span>
                  <span>{formatGhs(subtotal)}</span>
                </div>
              </div>

              {orderError && (
                <div style={{ padding: "10px 14px", background: "#fdeded", color: "#c93434", borderRadius: 10, fontSize: "0.88rem", fontWeight: 600 }}>
                  {orderError}
                </div>
              )}

              <button
                type="button"
                id="submit-order-request-btn"
                className="apple-checkout-btn-primary is-gold"
                disabled={placingOrder}
                onClick={() => void placeOrder()}
              >
                <MessageCircle size={19} />
                {placingOrder ? "Submitting Order Request..." : "Submit Order Request"}
              </button>

              <p style={{ margin: 0, fontSize: "0.8rem", color: "#86868b", textAlign: "center", lineHeight: 1.4 }}>
                Submitting creates an authentic order request in Buy &amp; Sell GH's system with a confirmed reference number.
              </p>

              <ul className="apple-bag-assurances">
                <li><ShieldCheck size={16} /> 100% Genuine Apple device guarantee</li>
                <li><Store size={16} /> Physical inspection before payment in Dome Pillar 2</li>
                <li><Truck size={16} /> Safe doorstep delivery across Accra and Ghana</li>
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
