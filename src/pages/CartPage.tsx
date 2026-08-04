import { CheckCircle2, Minus, Plus, Send, Trash2 } from "lucide-react";
import { type FormEvent, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ProductVisual } from "../components/ProductVisual";
import { SEO } from "../components/SEO";
import { useCart } from "../context/CartContext";
import type { FulfilmentType, OrderCustomerDetails, OrderRequestPayload, StoredOrderRequest } from "../types/order";
import { formatGhs } from "../utils/format";
import { buildOrderRequestPayload, submitOrderRequest } from "../utils/orders";
import { orderRequestWhatsAppUrl } from "../utils/whatsapp";

const paymentMethods = ["Cash", "Mobile Money", "Bank transfer", "To confirm"];

interface OrderFormState {
  fullName: string;
  phone: string;
  email: string;
  fulfilmentType: FulfilmentType;
  deliveryLocation: string;
  preferredPaymentMethod: string;
  additionalNote: string;
}

const initialForm: OrderFormState = {
  fullName: "",
  phone: "",
  email: "",
  fulfilmentType: "pickup",
  deliveryLocation: "",
  preferredPaymentMethod: "",
  additionalNote: "",
};

export function CartPage() {
  const { items, removeItem, updateQuantity, subtotal, clearCart } = useCart();
  const [form, setForm] = useState<OrderFormState>(initialForm);
  const [errors, setErrors] = useState<Partial<Record<keyof OrderFormState | "cart", string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [fallbackOrder, setFallbackOrder] = useState<OrderRequestPayload | null>(null);
  const [savedOrder, setSavedOrder] = useState<StoredOrderRequest | null>(null);

  const total = subtotal;
  const hasItems = items.length > 0;
  const fallbackWhatsAppHref = useMemo(
    () => (fallbackOrder ? orderRequestWhatsAppUrl(fallbackOrder) : ""),
    [fallbackOrder],
  );
  const savedWhatsAppHref = useMemo(
    () => (savedOrder ? orderRequestWhatsAppUrl(savedOrder) : ""),
    [savedOrder],
  );

  const updateField = (field: keyof OrderFormState, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setFallbackOrder(null);
    setSavedOrder(null);
  };

  const validate = () => {
    const next: Partial<Record<keyof OrderFormState | "cart", string>> = {};
    if (!hasItems) next.cart = "Add at least one device before submitting an order request.";
    if (!form.fullName.trim()) next.fullName = "Enter your full name.";
    if (!form.phone.trim()) next.phone = "Enter your phone number.";
    if (!form.preferredPaymentMethod) next.preferredPaymentMethod = "Choose a preferred payment method.";
    if (form.fulfilmentType === "delivery" && !form.deliveryLocation.trim()) {
      next.deliveryLocation = "Enter the delivery location.";
    }
    return next;
  };

  const customerDetails = (): OrderCustomerDetails => ({
    fullName: form.fullName.trim(),
    phone: form.phone.trim(),
    email: form.email.trim() || undefined,
    fulfilmentType: form.fulfilmentType,
    deliveryLocation: form.fulfilmentType === "delivery" ? form.deliveryLocation.trim() : undefined,
    preferredPaymentMethod: form.preferredPaymentMethod,
    additionalNote: form.additionalNote.trim() || undefined,
  });

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors = validate();
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      setFallbackOrder(null);
      setSavedOrder(null);
      return;
    }

    setSubmitting(true);
    const order = buildOrderRequestPayload(items, customerDetails());
    const result = await submitOrderRequest(order);
    setSubmitting(false);

    if (result.status === "saved") {
      setSavedOrder(result.order);
      setFallbackOrder(null);
      clearCart();
      return;
    }

    setFallbackOrder(result.order);
    setSavedOrder(null);
  };

  return (
    <>
      <SEO title="Cart" description="Review selected Buy & Sell GH products and submit an order request for availability, payment and delivery confirmation." />
      <section className="page-hero">
        <p className="eyebrow-dark">Cart</p>
        <h1>Your selected devices</h1>
        <p>Your order is not confirmed until Buy & Sell GH verifies product availability, price, payment and delivery details.</p>
      </section>
      <section className="section cart-layout grid gap-8 xl:grid-cols-[minmax(0,1fr)_430px]">
        <div className="grid gap-4">
          {items.length === 0 ? (
            <div className="rounded-lg border border-black/7 bg-white p-8 text-center shadow-card">
              <h2 className="text-2xl font-black">Your cart is empty</h2>
              <p className="mt-3 text-sm font-bold text-ink/60">Add a device to prepare an order request.</p>
              <Link className="btn-primary mt-5" to="/shop">Browse Devices</Link>
            </div>
          ) : (
            items.map((item) => (
              <article className="cart-item grid min-w-0 gap-4 rounded-lg border border-black/7 bg-white p-4 shadow-card sm:grid-cols-[150px_1fr_auto]" key={`${item.product.id}-${item.storage}-${item.color}`}>
                <Link to={`/product/${item.product.slug}`} aria-label={`View ${item.product.name}`}>
                  <ProductVisual product={item.product} />
                </Link>
                <div className="min-w-0">
                  <Link to={`/product/${item.product.slug}`} className="text-xl font-black text-ink hover:text-gold-dark">{item.product.name}</Link>
                  <dl className="mt-3 grid gap-1 text-sm font-bold text-ink/64 sm:grid-cols-2">
                    <div><dt className="inline text-ink/45">Storage: </dt><dd className="inline">{item.storage}</dd></div>
                    <div><dt className="inline text-ink/45">Colour: </dt><dd className="inline">{item.color}</dd></div>
                    <div><dt className="inline text-ink/45">Condition: </dt><dd className="inline">{item.product.condition}</dd></div>
                    <div><dt className="inline text-ink/45">Unit price: </dt><dd className="inline">{formatGhs(item.product.price)}</dd></div>
                  </dl>
                  <p className="mt-3 text-lg font-black">Subtotal: {formatGhs(item.product.price * item.quantity)}</p>
                </div>
                <div className="cart-item-controls flex items-center gap-2 sm:flex-col sm:items-end">
                  <div className="quantity-stepper">
                    <button type="button" aria-label="Decrease quantity" onClick={() => updateQuantity(item.product.id, item.storage, item.color, item.quantity - 1)}><Minus size={16} /></button>
                    <span className="min-w-8 text-center font-black">{item.quantity}</span>
                    <button type="button" aria-label="Increase quantity" onClick={() => updateQuantity(item.product.id, item.storage, item.color, item.quantity + 1)}><Plus size={16} /></button>
                  </div>
                  <button className="icon-button" type="button" aria-label="Remove item" onClick={() => removeItem(item.product.id, item.storage, item.color)}><Trash2 size={18} /></button>
                </div>
              </article>
            ))
          )}
        </div>

        <aside className="h-fit rounded-lg border border-black/7 bg-white p-5 shadow-card sm:p-6">
          <h2 className="text-2xl font-black">Order request</h2>
          <p className="mt-3 text-sm leading-7 text-ink/65">Submit your details first. Buy & Sell GH will verify availability, payment and delivery before the order is confirmed.</p>

          <div className="mt-5 rounded-lg border border-black/7 bg-page p-4">
            <h3 className="text-base font-black">Order summary</h3>
            <div className="mt-4 grid gap-3">
              {items.map((item) => (
                <div className="order-summary-line" key={`summary-${item.product.id}-${item.storage}-${item.color}`}>
                  <img src={item.product.images[0]?.src} alt={item.product.images[0]?.alt ?? item.product.name} loading="lazy" />
                  <div>
                    <strong>{item.product.name}</strong>
                    <span>{item.storage} | {item.color} | {item.product.condition}</span>
                    <small>{item.quantity} x {formatGhs(item.product.price)} = {formatGhs(item.product.price * item.quantity)}</small>
                  </div>
                </div>
              ))}
              {!hasItems && <p className="text-sm font-bold text-ink/60">No products selected yet.</p>}
            </div>
            <div className="mt-5 flex justify-between border-t border-black/10 pt-4 text-lg font-black"><span>Total</span><span>{formatGhs(total)}</span></div>
          </div>

          {savedOrder ? (
            <div className="mt-5 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm font-bold text-emerald-800">
              <div className="flex items-start gap-2"><CheckCircle2 size={18} /><p>Order request submitted. Reference: {savedOrder.referenceNumber}</p></div>
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                <a className="btn-primary" href={savedWhatsAppHref} target="_blank" rel="noreferrer">Continue on WhatsApp</a>
                <Link className="btn-secondary" to="/shop">Return to Shop</Link>
              </div>
            </div>
          ) : (
            <form className="mt-5 grid gap-4" noValidate onSubmit={handleSubmit}>
              <OrderInput label="Full name" value={form.fullName} error={errors.fullName} onChange={(value) => updateField("fullName", value)} />
              <OrderInput label="Phone number" value={form.phone} error={errors.phone} onChange={(value) => updateField("phone", value)} />
              <OrderInput label="Email, optional" type="email" value={form.email} onChange={(value) => updateField("email", value)} />

              <label className="choice-label">Delivery or pickup
                <select aria-label="Delivery or pickup" value={form.fulfilmentType} onChange={(event) => updateField("fulfilmentType", event.target.value as FulfilmentType)}>
                  <option value="pickup">Pickup</option>
                  <option value="delivery">Delivery</option>
                </select>
              </label>

              {form.fulfilmentType === "delivery" && (
                <OrderInput label="Delivery location" value={form.deliveryLocation} error={errors.deliveryLocation} onChange={(value) => updateField("deliveryLocation", value)} />
              )}

              <label className="choice-label">Preferred payment method
                <select aria-label="Preferred payment method" value={form.preferredPaymentMethod} onChange={(event) => updateField("preferredPaymentMethod", event.target.value)}>
                  <option value="">Select payment method</option>
                  {paymentMethods.map((method) => <option value={method} key={method}>{method}</option>)}
                </select>
                {errors.preferredPaymentMethod && <span className="form-error text-sm font-bold text-red-700">{errors.preferredPaymentMethod}</span>}
              </label>

              <label className="choice-label">Additional note
                <textarea aria-label="Additional note" className="min-h-28 resize-y rounded-lg border border-black/10 bg-white p-3 text-base font-bold outline-none" value={form.additionalNote} onChange={(event) => updateField("additionalNote", event.target.value)} placeholder="Delivery timing, preferred unit details, or any question." />
              </label>

              {errors.cart && <p className="form-error rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-bold text-red-700">{errors.cart}</p>}

              <button className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-60" type="submit" disabled={submitting}>
                <Send size={17} /> {submitting ? "Preparing request..." : "Submit Order Request"}
              </button>
            </form>
          )}

          {fallbackOrder && (
            <div className="mt-5 rounded-lg border border-gold/30 bg-warm p-4 text-sm font-bold text-ink">
              <p>Online order storage is not active yet. You can send this order request directly to Buy & Sell GH on WhatsApp.</p>
              <p className="mt-2 text-ink/65">Request reference: {fallbackOrder.referenceNumber}</p>
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                <a className="btn-primary" href={fallbackWhatsAppHref} target="_blank" rel="noreferrer">Send Order Request on WhatsApp</a>
                <Link className="btn-secondary" to="/shop">Return to Shop</Link>
              </div>
            </div>
          )}

          {hasItems && <button className="btn-ghost mt-4 w-full" type="button" onClick={clearCart}>Clear cart</button>}
        </aside>
      </section>
    </>
  );
}

function OrderInput({
  label,
  value,
  error,
  type = "text",
  onChange,
}: {
  label: string;
  value: string;
  error?: string;
  type?: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="choice-label">{label}
      <input aria-label={label} className="rounded-lg border border-black/10 bg-white p-3 text-base font-bold outline-none" type={type} value={value} onChange={(event) => onChange(event.target.value)} />
      {error && <span className="form-error text-sm font-bold text-red-700">{error}</span>}
    </label>
  );
}
