import { CheckCircle2, ChevronRight, MessageCircle, Phone, ShieldCheck, ShoppingBag, Store, Truck } from "lucide-react";
import { Link, useLocation, useParams } from "react-router-dom";
import { SEO } from "../components/SEO";
import { ORDER_SUCCESS_STORAGE_KEY, type StoredOrderRequest } from "../types/order";
import { formatGhs } from "../utils/format";
import { orderRequestWhatsAppUrl, whatsappUrl } from "../utils/whatsapp";
import "../styles/apple-bag-checkout.css";

export function OrderSuccessPage() {
  const { reference } = useParams();
  const location = useLocation();
  const order = getOrderFromState(location.state) ?? getStoredOrder(reference);

  if (!order) {
    const referenceLabel = reference ?? "Reference saved";
    const fallbackWhatsAppHref = reference
      ? whatsappUrl(`Hello Buy & Sell GH, I have an order reference ${reference} but cannot verify its details in my browser. Can you confirm whether it was saved?`)
      : whatsappUrl("Hello Buy & Sell GH, I could not verify an order request in my browser. Please help me check its status.");

    return (
      <div className="apple-checkout-page">
        <SEO title="Order Not Verified" description="Buy & Sell GH order request verification." />
        <div className="apple-checkout-shell" style={{ maxWidth: 680, textAlign: "center", padding: "60px 20px" }}>
          <p className="apple-bag-eyebrow">Order Status</p>
          <h1 className="apple-bag-heading" style={{ fontSize: "2rem" }}>{referenceLabel}</h1>
          <p style={{ color: "#6e6e73", fontSize: "1.05rem", lineHeight: 1.5, margin: "16px 0 28px" }}>
            This browser session cannot verify the saved order details. Please contact Buy &amp; Sell GH directly on WhatsApp with your reference number. No payment has been processed online.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <a className="apple-checkout-btn-primary is-gold" href={fallbackWhatsAppHref} target="_blank" rel="noopener noreferrer" style={{ maxWidth: 280 }}>
              <MessageCircle size={18} /> Continue on WhatsApp
            </a>
            <Link className="apple-bag-action-btn" to="/store" style={{ padding: "12px 20px" }}>
              Explore Store
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const whatsappHref = orderRequestWhatsAppUrl(order);
  const fulfilment = order.customer.fulfilmentType === "delivery"
    ? [order.customer.region, order.customer.city, order.customer.deliveryAddress].filter(Boolean).join(", ")
    : "Free Store Pickup in Dome Pillar 2, Accra";

  return (
    <div className="apple-checkout-page">
      <SEO title={`Order Received — ${order.referenceNumber}`} description="Your Buy & Sell GH order request has been received." />
      <div className="apple-checkout-shell">
        <div className="apple-bag-header" style={{ textAlign: "center", borderBottom: "none", paddingBottom: 0 }}>
          <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 64, height: 64, borderRadius: "50%", background: "#e8f5e9", color: "#2e7d32", marginBottom: 16 }}>
            <CheckCircle2 size={36} />
          </div>
          <p className="apple-bag-eyebrow" style={{ color: "#2e7d32" }}>Thank you for your order request</p>
          <h1 className="apple-bag-heading">Order {order.referenceNumber}</h1>
          <p className="apple-bag-subtitle" style={{ maxWidth: 600, margin: "0 auto" }}>
            We've received your device request. Buy &amp; Sell GH will contact you to verify stock and arrange pickup or delivery.
          </p>
        </div>

        {/* Apple 3-step Next Steps Flow */}
        <div style={{ margin: "40px 0", padding: "24px", background: "#fbfbfd", borderRadius: 18, border: "1px solid #e5e5ea" }}>
          <h3 style={{ fontSize: "1.1rem", fontWeight: 700, margin: "0 0 16px", color: "#1d1d1f" }}>What happens next?</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 20 }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: "0.95rem", color: "#1d1d1f", marginBottom: 4 }}>1. Request Registered</div>
              <p style={{ margin: 0, fontSize: "0.85rem", color: "#6e6e73", lineHeight: 1.4 }}>
                Reference <strong>{order.referenceNumber}</strong> has been logged in our Dome Pillar 2 showroom inventory system.
              </p>
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: "0.95rem", color: "#1d1d1f", marginBottom: 4 }}>2. Personal Order Review</div>
              <p style={{ margin: 0, fontSize: "0.85rem", color: "#6e6e73", lineHeight: 1.4 }}>
                Our team confirms device availability and connects with you on WhatsApp or phone ({order.customer.phone}).
              </p>
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: "0.95rem", color: "#1d1d1f", marginBottom: 4 }}>3. Inspect &amp; Pay</div>
              <p style={{ margin: 0, fontSize: "0.85rem", color: "#6e6e73", lineHeight: 1.4 }}>
                No online payment needed. You inspect and verify the physical Apple hardware before paying on pickup or delivery.
              </p>
            </div>
          </div>
        </div>

        <div className="apple-checkout-container" style={{ alignItems: "start" }}>
          {/* Left Column: Ordered Items */}
          <div className="apple-checkout-steps">
            <section className="apple-checkout-step">
              <div className="apple-checkout-step-header">
                <h3 className="apple-checkout-step-title">Requested Devices ({order.items.length})</h3>
              </div>

              <div className="apple-bag-items">
                {order.items.map((item) => (
                  <article className="apple-bag-item" key={`${item.productId}-${item.storage}-${item.colour}`} style={{ padding: "18px 0" }}>
                    <div className="apple-bag-item-image" style={{ width: 90, height: 90, borderRadius: 12 }}>
                      {item.productImage ? (
                        <img src={item.productImage} alt={item.productName} loading="lazy" />
                      ) : (
                        <div className="apple-bag-item-image-placeholder">No image</div>
                      )}
                    </div>
                    <div className="apple-bag-item-content">
                      <div className="apple-bag-item-top">
                        <div>
                          <h4 className="apple-bag-item-name" style={{ fontSize: "1.1rem" }}>{item.productName}</h4>
                          <p className="apple-bag-item-specs">
                            {[item.storage, item.colour, item.condition].filter(Boolean).join(" · ")}
                          </p>
                          <p style={{ margin: "4px 0 0", fontSize: "0.85rem", color: "#6e6e73" }}>
                            Quantity: <strong>{item.quantity}</strong> × {formatGhs(item.unitPrice)}
                          </p>
                        </div>
                        <div className="apple-bag-item-price" style={{ fontSize: "1.1rem" }}>
                          {formatGhs(item.lineTotal)}
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </div>

          {/* Right Column: Order Reference & WhatsApp Handoff */}
          <aside className="apple-checkout-review-sidebar">
            <div className="apple-checkout-review-card">
              <span className="apple-bag-eyebrow">Official Request Summary</span>
              <h3 className="apple-bag-summary-title" style={{ marginTop: 2 }}>{order.referenceNumber}</h3>

              <div className="apple-bag-summary-rows" style={{ margin: "16px 0" }}>
                <div className="apple-bag-summary-row">
                  <span>Customer</span>
                  <strong style={{ color: "#1d1d1f" }}>{order.customer.fullName}</strong>
                </div>
                <div className="apple-bag-summary-row">
                  <span>Phone / WhatsApp</span>
                  <span>{order.customer.phone}</span>
                </div>
                <div className="apple-bag-summary-row">
                  <span>Fulfillment</span>
                  <span>{order.customer.fulfilmentType === "delivery" ? "Doorstep Delivery" : "Store Pickup"}</span>
                </div>
                {order.customer.fulfilmentType === "delivery" && (
                  <div className="apple-bag-summary-row">
                    <span>Address</span>
                    <span style={{ textAlign: "right", maxWidth: 180 }}>{fulfilment}</span>
                  </div>
                )}
                <div className="apple-bag-summary-row">
                  <span>Subtotal</span>
                  <span>{formatGhs(order.subtotal)}</span>
                </div>
                <div className="apple-bag-summary-row">
                  <span>Delivery Fee</span>
                  <span>{order.deliveryFee === null ? "Confirmed on review" : formatGhs(order.deliveryFee)}</span>
                </div>
                <div className="apple-bag-summary-row is-total">
                  <span>Total Amount</span>
                  <span>{formatGhs(order.total)}</span>
                </div>
              </div>

              <a
                className="apple-checkout-btn-primary is-gold"
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                style={{ textDecoration: "none" }}
              >
                <MessageCircle size={19} /> Open Order on WhatsApp
              </a>

              <div style={{ textAlign: "center", marginTop: 12 }}>
                <Link to="/store" className="apple-bag-action-btn">
                  Continue Shopping
                </Link>
              </div>

              <ul className="apple-bag-assurances">
                <li><ShieldCheck size={16} /> 100% Genuine Apple device guarantee</li>
                <li><Store size={16} /> Inspect before payment at Dome Pillar 2</li>
                <li><Truck size={16} /> Safe delivery across Greater Accra &amp; Ghana</li>
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function getOrderFromState(state: unknown) {
  if (!state || typeof state !== "object") return null;
  const order = (state as { order?: StoredOrderRequest }).order;
  return order?.referenceNumber ? order : null;
}

function getStoredOrder(reference?: string) {
  try {
    const stored = sessionStorage.getItem(ORDER_SUCCESS_STORAGE_KEY);
    if (!stored) return null;
    const parsed = JSON.parse(stored) as StoredOrderRequest;
    return !reference || parsed.referenceNumber === reference ? parsed : null;
  } catch {
    sessionStorage.removeItem(ORDER_SUCCESS_STORAGE_KEY);
    return null;
  }
}
