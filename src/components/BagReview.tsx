import { ArrowLeft, MessageCircle, Pencil, ShoppingBag, Trash2, X } from "lucide-react";
import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import { useBuyJourney, validateCustomerDraft } from "../context/BuyJourneyContext";
import { useCart } from "../context/CartContext";
import { cartItemKey, getItemEffectivePrice } from "../context/cartOperations";
import type { CartItem } from "../types/product";
import { formatGhs } from "../utils/format";
import { resolveProductColorImage } from "../utils/productColorImages";
import { hasOwnerUploadedProductImages, resolveProductImage } from "../utils/productImages";
import "../styles/bag-review.css";

function itemImage(item: CartItem): string {
  const primary = resolveProductImage(item.product)?.src;
  return item.colorImageSrc ||
    (hasOwnerUploadedProductImages(item.product) ? primary : undefined) ||
    resolveProductColorImage(item.product, item.color) || primary || "";
}

function optionLabel(key: string): string {
  return key.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/^./, (letter) => letter.toUpperCase());
}

export function BagReview() {
  const { items, subtotal, removeItem } = useCart();
  const { customer, beginEdit, placingOrder, orderError, placeOrder } = useBuyJourney();
  const detailsComplete = Object.keys(validateCustomerDraft(customer, 1)).length === 0;

  return (
    <div className="bag-review">
      {items.length === 0 ? (
        <div className="bag-empty">
          <ShoppingBag size={28} aria-hidden="true" />
          <h3>Your bag is empty</h3>
          <Link to="/shop" className="bag-shop-link">Explore products</Link>
        </div>
      ) : <>
        <div className="bag-lines">
          {items.map((item) => {
            const key = cartItemKey(item);
            const image = itemImage(item);
            const options = Object.entries(item.options ?? {}).filter(([name, value]) =>
              value && !["storage", "color", "finish"].includes(name.toLowerCase()));
            return (
              <article className="bag-line" key={key}>
                <div className="bag-line-image">
                  {image ? <img src={image} alt={item.product.name} loading="lazy" /> : <span>Image coming soon</span>}
                </div>
                <div className="bag-line-details">
                  <h3>{item.product.name}</h3>
                  <p>{[item.storage, item.color, item.product.condition].filter(Boolean).join(" · ")}</p>
                  {options.length > 0 && <dl className="bag-line-options">
                    {options.map(([name, value]) => <div key={name}><dt>{optionLabel(name)}</dt><dd>{value}</dd></div>)}
                  </dl>}
                  <p className="bag-line-price">{item.quantity} × {formatGhs(getItemEffectivePrice(item))} <strong>{formatGhs(getItemEffectivePrice(item) * item.quantity)}</strong></p>
                  <div className="bag-line-actions">
                    <button type="button" onClick={() => beginEdit(item)}><Pencil size={15} /> Edit</button>
                    <button type="button" onClick={() => removeItem(item.product.id, item.storage, item.color, item.variantId)}><Trash2 size={15} /> Remove</button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        <section className="bag-customer" aria-label="Customer and delivery details">
          <h3>Customer and delivery</h3>
          <dl>
            <div><dt>Name</dt><dd>{customer.fullName || "Not entered"}</dd></div>
            <div><dt>WhatsApp</dt><dd>{customer.whatsapp || "Not entered"}</dd></div>
            <div><dt>Fulfilment</dt><dd>{customer.fulfilmentType === "delivery" ? "Delivery" : "Store pickup"}</dd></div>
            {customer.fulfilmentType === "delivery" && <div><dt>Location</dt><dd>{[customer.region, customer.city, customer.deliveryAddress].filter(Boolean).join(", ") || "Not entered"}</dd></div>}
            {customer.additionalNote && <div><dt>Notes</dt><dd>{customer.additionalNote}</dd></div>}
          </dl>
          {!detailsComplete && <p className="bag-attention">Contact or delivery details are incomplete. Use Edit to update them on a Buy page.</p>}
          <button type="button" className="bag-edit-details" onClick={() => beginEdit(items[0])}><Pencil size={15} /> Edit details</button>
        </section>

        <div className="bag-footer">
          <div className="bag-subtotal"><span>Subtotal</span><strong>{formatGhs(subtotal)}</strong></div>
          <p>{customer.fulfilmentType === "delivery" ? "Delivery fee confirmed after review." : "Store pickup. No delivery fee added."}</p>
          <p>No payment has been collected.</p>
          {orderError && <p className="bag-error" role="alert">{orderError}</p>}
          <button type="button" className="bag-place-order" disabled={placingOrder || !detailsComplete} onClick={() => void placeOrder()}>
            <MessageCircle size={19} /> {placingOrder ? "Saving order..." : "Place Order via WhatsApp"}
          </button>
        </div>
      </>}
    </div>
  );
}

export function BagDrawer() {
  const { bagOpen, closeBag } = useBuyJourney();
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
      window.scrollTo(0, scrollY);
    };
  }, [bagOpen, closeBag]);

  if (!bagOpen) return null;
  return createPortal(
    <div className="bag-drawer-root">
      <button className="bag-drawer-backdrop" type="button" aria-label="Close shopping bag" onClick={closeBag} />
      <aside className="bag-drawer" role="dialog" aria-modal="true" aria-labelledby="bag-drawer-title">
        <header className="bag-drawer-header">
          <div><span className="bag-eyebrow">Buy & Sell GH</span><h2 id="bag-drawer-title">Your Bag</h2></div>
          <button ref={closeRef} type="button" aria-label="Close shopping bag" onClick={closeBag}><X size={22} /></button>
        </header>
        <div className="bag-drawer-scroll"><BagReview /></div>
        <button className="bag-continue" type="button" onClick={closeBag}><ArrowLeft size={16} /> Continue shopping</button>
      </aside>
    </div>,
    document.body,
  );
}
