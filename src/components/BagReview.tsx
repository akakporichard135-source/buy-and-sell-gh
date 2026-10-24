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
import { resolveProductColorImage } from "../utils/productColorImages";
import { hasOwnerUploadedProductImages, resolveProductImage } from "../utils/productImages";
import "../styles/apple-bag-checkout.css";

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

function optionLabel(key: string): string {
  return key.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/^./, (letter) => letter.toUpperCase());
}

export function BagReview() {
  const navigate = useNavigate();
  const { items, subtotal, removeItem, updateQuantity } = useCart();
  const { beginEdit } = useBuyJourney();

  if (items.length === 0) {
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
        {items.map((item) => {
          const key = cartItemKey(item);
          const image = itemImage(item);
          const effectivePrice = getItemEffectivePrice(item);
          const options = Object.entries(item.options ?? {}).filter(
            ([name, value]) => value && !["storage", "color", "finish"].includes(name.toLowerCase())
          );

          return (
            <article className="apple-bag-item" key={key}>
              <div className="apple-bag-item-image">
                {image ? (
                  <img src={image} alt={item.product.name} loading="lazy" />
                ) : (
                  <span className="apple-bag-item-image-placeholder">No image</span>
                )}
              </div>

              <div className="apple-bag-item-content">
                <div className="apple-bag-item-top">
                  <div>
                    <h3 className="apple-bag-item-name">{item.product.name}</h3>
                    <p className="apple-bag-item-specs">
                      {[item.storage, item.color, item.product.condition].filter(Boolean).join(" · ")}
                    </p>
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
                    {formatGhs(effectivePrice * item.quantity)}
                  </div>
                </div>

                <div className="apple-bag-item-bottom">
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
            <span>{formatGhs(subtotal)}</span>
          </div>
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
  const { items, subtotal, removeItem, updateQuantity } = useCart();
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!bagOpen) return;
    const scrollY = window.scrollY;
    const previous = {
      position: document.body.style.position,
      top: document.body.style.top,
      width: document.body.style.width,
      overflow: document.body.style.overflow,
    };
    document.body.classList.add("bag-open");
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = "100%";
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeBag();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.classList.remove("bag-open");
      document.body.style.position = previous.position;
      document.body.style.top = previous.top;
      document.body.style.width = previous.width;
      document.body.style.overflow = previous.overflow;
      const root = document.documentElement;
      const previousScrollBehavior = root.style.scrollBehavior;
      root.style.scrollBehavior = "auto";
      window.scrollTo(0, scrollY);
      root.style.scrollBehavior = previousScrollBehavior;
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
          {items.length === 0 ? (
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
              {items.map((item) => {
                const key = cartItemKey(item);
                const image = itemImage(item);
                const effectivePrice = getItemEffectivePrice(item);

                return (
                  <article className="apple-bag-item" key={key} style={{ padding: "20px 0" }}>
                    <div className="apple-bag-item-image" style={{ width: 88, height: 88, borderRadius: 10 }}>
                      {image ? (
                        <img src={image} alt={item.product.name} loading="lazy" />
                      ) : (
                        <span className="apple-bag-item-image-placeholder" style={{ fontSize: "0.7rem" }}>No image</span>
                      )}
                    </div>

                    <div className="apple-bag-item-content">
                      <div className="apple-bag-item-top">
                        <div>
                          <h4 className="apple-bag-item-name" style={{ fontSize: "1.05rem" }}>{item.product.name}</h4>
                          <p className="apple-bag-item-specs" style={{ fontSize: "0.85rem" }}>
                            {[item.storage, item.color].filter(Boolean).join(" · ")}
                          </p>
                        </div>
                        <div className="apple-bag-item-price" style={{ fontSize: "1.05rem" }}>
                          {formatGhs(effectivePrice * item.quantity)}
                        </div>
                      </div>

                      <div className="apple-bag-item-bottom" style={{ marginTop: 8 }}>
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
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="bag-drawer-footer" style={{ borderTop: "1px solid #e5e5ea", padding: "18px 20px 24px", background: "#fbfbfd" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 14 }}>
              <span style={{ fontSize: "1rem", color: "#6e6e73" }}>Subtotal</span>
              <strong style={{ fontSize: "1.35rem", fontWeight: 700, color: "#1d1d1f" }}>{formatGhs(subtotal)}</strong>
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
                onClick={closeBag}
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
