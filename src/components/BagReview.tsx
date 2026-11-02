import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ChevronRight,
  Minus,
  Pencil,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Store,
  Trash2,
  Truck,
  X,
} from "lucide-react";
import { useCart } from "../context/CartContext";
import { useBuyJourney } from "../context/BuyJourneyContext";
import { cartItemKey, getItemEffectivePrice } from "../context/cartOperations";
import type { CartItem } from "../types/product";
import { formatGhs } from "../utils/format";
import { resolveCartItemThumbnail } from "../utils/cartThumbnail";
import "../styles/apple-bag-checkout.css";

function itemImage(item: CartItem): string {
  return resolveCartItemThumbnail(item);
}

function optionLabel(key: string): string {
  return key.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/^./, (letter) => letter.toUpperCase());
}

export function BagReview() {
  const navigate = useNavigate();
  const { items, effectiveItems, subtotal, rawSubtotal, discountAmount, promotionResult, removeItem, updateQuantity } = useCart();
  const { beginEdit } = useBuyJourney();

  if (effectiveItems.length === 0) {
    return (
      <div className="apple-bag-empty-state">
        <div className="apple-bag-empty-icon">
          <ShoppingBag size={32} />
        </div>
        <h2>Your Bag is empty</h2>
        <p>Explore original Apple hardware and add devices to your bag.</p>
        <Link to="/store" className="apple-checkout-btn-primary is-gold" style={{ maxWidth: 260 }}>
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="apple-bag-grid">
      {/* Left Column: Bag Items */}
      <div className="apple-bag-items">
        {promotionResult.savingsExplanation.length > 0 && (
          <div style={{ padding: "12px 16px", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 12, marginBottom: 16 }}>
            <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "#166534", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Active Promotions Applied
            </span>
            <ul style={{ margin: "6px 0 0", paddingLeft: 18, fontSize: "0.88rem", color: "#15803d" }}>
              {promotionResult.savingsExplanation.map((expl, idx) => (
                <li key={idx} style={{ marginTop: 2 }}>{expl}</li>
              ))}
            </ul>
          </div>
        )}

        {effectiveItems.map((item) => {
          const key = cartItemKey(item);
          const image = itemImage(item);
          const isGift = Boolean((item as any).isFreeGift);
          const promoDiscount = (item as any).promotionalDiscount || 0;
          const effectivePrice = isGift ? 0 : getItemEffectivePrice(item);
          const rawItemPrice = (item as any).originalPrice || item.product.price;
          const options = Object.entries(item.options ?? {}).filter(
            ([name, value]) => value && !["storage", "color", "finish"].includes(name.toLowerCase())
          );

          return (
            <article className={`apple-bag-item ${isGift ? "is-free-gift-item" : ""}`} key={key}>
              <div className="apple-bag-item-image">
                {image ? (
                  <img key={image} src={image} alt={item.product.name} loading="lazy" />
                ) : (
                  <span className="apple-bag-item-image-placeholder">No image</span>
                )}
              </div>

              <div className="apple-bag-item-content">
                <div className="apple-bag-item-top">
                  <div>
                    {isGift && (
                      <span style={{ display: "inline-block", background: "#fef3c7", color: "#92400e", fontSize: "0.75rem", fontWeight: 700, padding: "2px 8px", borderRadius: 999, marginBottom: 4 }}>
                        Free Promotional Gift
                      </span>
                    )}
                    <h3 className="apple-bag-item-name">{item.product.name}</h3>
                    <p className="apple-bag-item-specs">
                      {[item.storage, item.color, item.product.condition].filter(Boolean).join(" · ")}
                    </p>
                    {item.product.includedItems && item.product.includedItems.length > 0 && (
                      <div className="bundle-included-items" style={{ marginTop: 6, fontSize: "0.82rem", color: "#475569", background: "#f8fafc", padding: "6px 10px", borderRadius: 8, border: "1px solid #e2e8f0" }}>
                        <div style={{ fontWeight: 600, color: "#0f172a", marginBottom: 3, fontSize: "0.78rem" }}>Includes {item.product.includedItems.length} items:</div>
                        <ul style={{ margin: 0, paddingLeft: 14, lineHeight: 1.4 }}>
                          {item.product.includedItems.map((inc, i) => (
                            <li key={i}>{inc}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {options.length > 0 && (
                      <dl className="bag-line-options" style={{ marginTop: 6, fontSize: "0.82rem", color: "#6e6e73" }}>
                        {options.map(([name, value]) => (
                          <div key={name} style={{ display: "flex", gap: 4 }}>
                            <dt style={{ fontWeight: 500 }}>{optionLabel(name)}:</dt>
                            <dd style={{ margin: 0 }}>{value}</dd>
                          </div>
                        ))}
                      </dl>
                    )}
                  </div>
                  <div className="apple-bag-item-price">
                    {isGift ? (
                      <div>
                        <span style={{ color: "#16a34a", fontWeight: 700 }}>GH₵ 0</span>
                        <div style={{ fontSize: "0.78rem", color: "#86868b", textDecoration: "line-through" }}>
                          GH₵ 350
                        </div>
                      </div>
                    ) : promoDiscount > 0 ? (
                      <div>
                        <span style={{ color: "#1d1d1f", fontWeight: 700 }}>
                          {formatGhs(effectivePrice * item.quantity)}
                        </span>
                        <div style={{ fontSize: "0.78rem", color: "#16a34a", fontWeight: 600 }}>
                          Save {formatGhs(promoDiscount)}
                        </div>
                      </div>
                    ) : (
                      formatGhs(effectivePrice * item.quantity)
                    )}
                  </div>
                </div>

                <div className="apple-bag-item-bottom">
                  {!isGift ? (
                    <div className="apple-bag-qty-selector">
                      <button
                        type="button"
                        className="apple-bag-qty-btn"
                        aria-label="Decrease quantity"
                        disabled={item.quantity <= 1}
                        onClick={() =>
                          updateQuantity(
                            item.product.id,
                            item.storage,
                            item.color,
                            item.quantity - 1,
                            item.variantId
                          )
                        }
                      >
                        <Minus size={14} />
                      </button>
                      <span className="apple-bag-qty-value">{item.quantity}</span>
                      <button
                        type="button"
                        className="apple-bag-qty-btn"
                        aria-label="Increase quantity"
                        disabled={item.quantity >= 99}
                        onClick={() =>
                          updateQuantity(
                            item.product.id,
                            item.storage,
                            item.color,
                            item.quantity + 1,
                            item.variantId
                          )
                        }
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  ) : (
                    <span style={{ fontSize: "0.85rem", color: "#6e6e73", fontStyle: "italic" }}>
                      Qty: {item.quantity} (Included with qualifying device)
                    </span>
                  )}

                  {!isGift && (
                    <div className="apple-bag-item-actions bag-line-actions">
                      <button
                        type="button"
                        className="apple-bag-action-btn"
                        onClick={() => beginEdit(item)}
                      >
                        <Pencil size={14} /> Edit details
                      </button>
                      <button
                        type="button"
                        className="apple-bag-action-btn is-danger"
                        onClick={() =>
                          removeItem(item.product.id, item.storage, item.color, item.variantId)
                        }
                      >
                        <Trash2 size={14} /> Remove
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {/* Right Column: Order Summary */}
      <aside className="apple-bag-summary-card">
        <h3 className="apple-bag-summary-title">Summary</h3>
        <div className="apple-bag-summary-rows">
          <div className="apple-bag-summary-row">
            <span>Subtotal</span>
            <span>{formatGhs(rawSubtotal)}</span>
          </div>
          {discountAmount > 0 && (
            <div className="apple-bag-summary-row" style={{ color: "#16a34a", fontWeight: 600 }}>
              <span>Promotional Savings</span>
              <span>-{formatGhs(discountAmount)}</span>
            </div>
          )}
          <div className="apple-bag-summary-row">
            <span>Fulfillment</span>
            <span>Free Dome Pickup / Delivery</span>
          </div>
          <div className="apple-bag-summary-row is-total">
            <span>Total</span>
            <span>{formatGhs(subtotal)}</span>
          </div>
        </div>

        <button
          type="button"
          className="apple-checkout-btn-primary is-gold"
          onClick={() => navigate("/checkout")}
        >
          Check Out
        </button>

        <div style={{ textAlign: "center", marginTop: 14 }}>
          <Link to="/store" className="apple-bag-action-btn">
            Continue Shopping
          </Link>
        </div>

        <ul className="apple-bag-assurances">
          <li>
            <ShieldCheck size={16} /> 100% Genuine Apple device guarantee
          </li>
          <li>
            <Store size={16} /> Physical device verification at Dome Pillar 2
          </li>
          <li>
            <Truck size={16} /> Safe doorstep delivery across Accra and Ghana
          </li>
        </ul>
      </aside>
    </div>
  );
}

export function BagDrawer() {
  const navigate = useNavigate();
  const { bagOpen, closeBag, beginEdit } = useBuyJourney();
  const { effectiveItems, subtotal, rawSubtotal, discountAmount, promotionResult, removeItem, updateQuantity } = useCart();
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!bagOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.body.classList.add("bag-open");
    closeRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeBag();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
      document.body.classList.remove("bag-open");
    };
  }, [bagOpen, closeBag]);

  if (!bagOpen) return null;

  return createPortal(
    <div className="bag-drawer-root">
      <button className="bag-drawer-backdrop" type="button" aria-label="Close shopping bag" onClick={closeBag} />
      <aside className="bag-drawer" role="dialog" aria-modal="true" aria-labelledby="bag-drawer-title">
        <header className="bag-drawer-header">
          <div>
            <span className="bag-eyebrow">Buy &amp; Sell GH</span>
            <h2 id="bag-drawer-title">Review your Bag</h2>
          </div>
          <button ref={closeRef} type="button" aria-label="Close shopping bag" onClick={closeBag}>
            <X size={22} />
          </button>
        </header>

        <div className="bag-drawer-scroll">
          {effectiveItems.length === 0 ? (
            <div className="apple-bag-empty-state" style={{ padding: "40px 20px" }}>
              <div className="apple-bag-empty-icon">
                <ShoppingBag size={28} />
              </div>
              <h3 style={{ fontSize: "1.2rem", fontWeight: 700, margin: "12px 0 6px" }}>Your Bag is empty</h3>
              <p style={{ fontSize: "0.92rem", color: "#6e6e73", margin: 0 }}>
                Explore authentic Apple devices in our store.
              </p>
            </div>
          ) : (
            <div className="apple-bag-items" style={{ padding: "0 4px" }}>
              {promotionResult.savingsExplanation.length > 0 && (
                <div style={{ padding: "10px 14px", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 10, margin: "12px 4px 6px" }}>
                  <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "#166534", textTransform: "uppercase" }}>
                    Special Offer Applied
                  </span>
                  <div style={{ fontSize: "0.84rem", color: "#15803d", marginTop: 2 }}>
                    {promotionResult.savingsExplanation[0]}
                  </div>
                </div>
              )}

              {effectiveItems.map((item) => {
                const key = cartItemKey(item);
                const image = itemImage(item);
                const isGift = Boolean((item as any).isFreeGift);
                const promoDiscount = (item as any).promotionalDiscount || 0;
                const effectivePrice = isGift ? 0 : getItemEffectivePrice(item);

                return (
                  <article className={`apple-bag-item ${isGift ? "is-free-gift-item" : ""}`} key={key} style={{ padding: "16px 0" }}>
                    <div className="apple-bag-item-image" style={{ width: 88, height: 88, borderRadius: 10 }}>
                      {image ? (
                        <img key={image} src={image} alt={item.product.name} loading="lazy" />
                      ) : (
                        <span className="apple-bag-item-image-placeholder" style={{ fontSize: "0.7rem" }}>No image</span>
                      )}
                    </div>

                    <div className="apple-bag-item-content">
                      <div className="apple-bag-item-top">
                        <div>
                          {isGift && (
                            <span style={{ display: "inline-block", background: "#fef3c7", color: "#92400e", fontSize: "0.72rem", fontWeight: 700, padding: "2px 6px", borderRadius: 999, marginBottom: 2 }}>
                              Free Gift
                            </span>
                          )}
                          <h4 className="apple-bag-item-name" style={{ fontSize: "1.05rem" }}>{item.product.name}</h4>
                          <p className="apple-bag-item-specs" style={{ fontSize: "0.85rem" }}>
                            {[item.storage, item.color].filter(Boolean).join(" · ")}
                          </p>
                          {item.product.includedItems && item.product.includedItems.length > 0 && (
                            <div style={{ marginTop: 4, fontSize: "0.76rem", color: "#64748b" }}>
                              <strong>Includes:</strong> {item.product.includedItems.join(" • ")}
                            </div>
                          )}
                        </div>
                        <div className="apple-bag-item-price" style={{ fontSize: "1.05rem" }}>
                          {isGift ? (
                            <span style={{ color: "#16a34a", fontWeight: 700 }}>GH₵ 0</span>
                          ) : promoDiscount > 0 ? (
                            <div>
                              <span>{formatGhs(effectivePrice * item.quantity)}</span>
                              <div style={{ fontSize: "0.75rem", color: "#16a34a", fontWeight: 600 }}>
                                -{formatGhs(promoDiscount)}
                              </div>
                            </div>
                          ) : (
                            formatGhs(effectivePrice * item.quantity)
                          )}
                        </div>
                      </div>

                      <div className="apple-bag-item-bottom" style={{ marginTop: 8 }}>
                        {!isGift ? (
                          <div className="apple-bag-qty-selector">
                            <button
                              type="button"
                              className="apple-bag-qty-btn"
                              aria-label="Decrease quantity"
                              disabled={item.quantity <= 1}
                              onClick={() =>
                                updateQuantity(
                                  item.product.id,
                                  item.storage,
                                  item.color,
                                  item.quantity - 1,
                                  item.variantId
                                )
                              }
                            >
                              <Minus size={12} />
                            </button>
                            <span className="apple-bag-qty-value">{item.quantity}</span>
                            <button
                              type="button"
                              className="apple-bag-qty-btn"
                              aria-label="Increase quantity"
                              disabled={item.quantity >= 99}
                              onClick={() =>
                                updateQuantity(
                                  item.product.id,
                                  item.storage,
                                  item.color,
                                  item.quantity + 1,
                                  item.variantId
                                )
                              }
                            >
                              <Plus size={12} />
                            </button>
                          </div>
                        ) : (
                          <span style={{ fontSize: "0.8rem", color: "#6e6e73", fontStyle: "italic" }}>
                            Qty: {item.quantity} (Free with device)
                          </span>
                        )}

                        {!isGift && (
                          <div className="apple-bag-item-actions bag-line-actions">
                            <button
                              type="button"
                              className="apple-bag-action-btn"
                              onClick={() => beginEdit(item)}
                            >
                              <Pencil size={13} /> Edit
                            </button>
                            <button
                              type="button"
                              className="apple-bag-action-btn is-danger"
                              onClick={() =>
                                removeItem(item.product.id, item.storage, item.color, item.variantId)
                              }
                            >
                              <Trash2 size={13} /> Remove
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>

        {effectiveItems.length > 0 && (
          <div className="bag-drawer-footer" style={{ borderTop: "1px solid #e5e5ea", padding: "18px 20px 24px", background: "#fbfbfd" }}>
            <div style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 4 }}>
                <span style={{ fontSize: "0.95rem", color: "#6e6e73" }}>Subtotal</span>
                <span style={{ fontSize: "1.05rem", color: "#1d1d1f" }}>{formatGhs(rawSubtotal)}</span>
              </div>
              {discountAmount > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 4, color: "#16a34a" }}>
                  <span style={{ fontSize: "0.95rem", fontWeight: 600 }}>Promotional Savings</span>
                  <span style={{ fontSize: "1.05rem", fontWeight: 600 }}>-{formatGhs(discountAmount)}</span>
                </div>
              )}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: 8, paddingTop: 8, borderTop: "1px solid #e5e5ea" }}>
                <span style={{ fontSize: "1.1rem", fontWeight: 700, color: "#1d1d1f" }}>Total</span>
                <strong style={{ fontSize: "1.35rem", fontWeight: 700, color: "#1d1d1f" }}>{formatGhs(subtotal)}</strong>
              </div>
            </div>
            <p style={{ margin: "0 0 16px", fontSize: "0.82rem", color: "#86868b" }}>
              Free in-store pickup at Dome Pillar 2 or doorstep delivery across Ghana.
            </p>

            <button
              type="button"
              className="apple-checkout-btn-primary is-gold"
              onClick={() => {
                closeBag();
                navigate("/checkout");
              }}
            >
              Check Out
            </button>

            <div style={{ display: "flex", justifyContent: "center", gap: 16, marginTop: 12 }}>
              <button
                type="button"
                className="apple-bag-action-btn"
                onClick={() => {
                  closeBag();
                  navigate("/cart");
                }}
              >
                Review Full Bag
              </button>
              <button
                type="button"
                className="apple-bag-action-btn"
                onClick={() => {
                  closeBag();
                  navigate("/store");
                }}
              >
                <ArrowLeft size={14} /> Continue Shopping
              </button>
            </div>
          </div>
        )}
      </aside>
    </div>,
    document.body
  );
}
