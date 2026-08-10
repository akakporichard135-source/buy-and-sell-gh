import { CreditCard, MapPin, Minus, Plus, Send, ShoppingBag, Trash2, UserRound } from "lucide-react";
import type { ReactNode } from "react";
import { type FormEvent, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useProductCatalog } from "../catalog/ProductCatalogContext";
import { isProductUnavailable } from "../catalog/productCatalog";
import { ProductVisual } from "../components/ProductVisual";
import { SEO } from "../components/SEO";
import { useCart } from "../context/CartContext";
import type { FulfilmentType, OrderCustomerDetails, PaymentMethod, StoredOrderRequest } from "../types/order";
import { PAYMENT_METHODS } from "../types/order";
import { formatGhs } from "../utils/format";
import { buildOrderRequestPayload, buildOrderSubmissionInput, generateSubmissionToken, submitOrderRequest } from "../utils/orders";

interface OrderFormState {
  fullName: string;
  phone: string;
  whatsapp: string;
  email: string;
  fulfilmentType: FulfilmentType;
  region: string;
  city: string;
  deliveryAddress: string;
  landmark: string;
  deliveryNotes: string;
  preferredPaymentMethod: PaymentMethod | "";
  additionalNote: string;
}

const initialForm: OrderFormState = {
  fullName: "",
  phone: "",
  whatsapp: "",
  email: "",
  fulfilmentType: "pickup",
  region: "",
  city: "",
  deliveryAddress: "",
  landmark: "",
  deliveryNotes: "",
  preferredPaymentMethod: "",
  additionalNote: "",
};

const phonePattern = /^(?:\+?233|0)(?:20|23|24|25|26|27|28|50|53|54|55|56|57|59)\d{7}$/;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ORDER_SUCCESS_STORAGE_KEY = "buyandsell-gh-last-order";

export function CartPage() {
  const { items, removeItem, updateQuantity, subtotal, clearCart } = useCart();
  const { getProductBySlug, loading } = useProductCatalog();
  const navigate = useNavigate();
  const [form, setForm] = useState<OrderFormState>(initialForm);
  const [errors, setErrors] = useState<Partial<Record<keyof OrderFormState | "cart" | "submit", string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submissionToken, setSubmissionToken] = useState(generateSubmissionToken);

  const hasItems = items.length > 0;
  const total = subtotal;
  const deliveryCopy = form.fulfilmentType === "delivery" ? "Delivery fee confirmed based on location." : "Pickup at the shop. No delivery fee added.";

  const orderPreview = useMemo(() => buildOrderRequestPayload(items, customerDetailsFromForm(form, true)), [form, items]);

  const updateField = <K extends keyof OrderFormState>(field: K, value: OrderFormState[K]) => {
    setForm((current) => {
      const next = { ...current, [field]: value };
      if (field === "phone" && !current.whatsapp.trim()) next.whatsapp = value as string;
      return next;
    });
    setErrors((current) => ({ ...current, [field]: undefined, submit: undefined }));
  };

  const validate = () => {
    const next: Partial<Record<keyof OrderFormState | "cart" | "submit", string>> = {};
    if (!hasItems) next.cart = "Add at least one device before submitting an order.";
    if (!form.fullName.trim()) next.fullName = "Enter your full name.";
    if (!phonePattern.test(cleanPhone(form.phone))) next.phone = "Enter a valid Ghana phone number.";
    if (!phonePattern.test(cleanPhone(form.whatsapp))) next.whatsapp = "Enter a valid Ghana WhatsApp number.";
    if (form.email.trim() && !emailPattern.test(form.email.trim())) next.email = "Enter a valid email address.";
    if (!form.preferredPaymentMethod) next.preferredPaymentMethod = "Choose a payment preference.";
    if (form.fulfilmentType === "delivery") {
      if (!form.region.trim()) next.region = "Enter your region.";
      if (!form.city.trim()) next.city = "Enter your city or area.";
      if (!form.deliveryAddress.trim()) next.deliveryAddress = "Enter your delivery address.";
    }

    for (const item of items) {
      const currentProduct = getProductBySlug(item.product.slug);
      if (!currentProduct || isProductUnavailable(currentProduct)) {
        next.cart = `${item.product.name} is no longer available. Remove it from cart before submitting.`;
        break;
      }
      if (item.quantity > currentProduct.stockQuantity) {
        next.cart = `Only ${currentProduct.stockQuantity} ${currentProduct.name} available right now. Update the quantity before submitting.`;
        break;
      }
    }
    return next;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors = validate();
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    const customer = customerDetailsFromForm(form);
    const preview = buildOrderRequestPayload(items, customer);
    const submission = buildOrderSubmissionInput(items, customer, submissionToken);
    setSubmitting(true);
    const result = await submitOrderRequest(preview, submission);
    setSubmitting(false);

    if (result.status === "saved") {
      clearCart();
      persistOrder(result.order);
      setSubmissionToken(generateSubmissionToken());
      navigate(`/order-success/${result.order.referenceNumber}`, { replace: true, state: { order: result.order } });
      return;
    }

    setErrors({ submit: result.message });
  };

  return (
    <>
      <SEO title="Checkout" description="Review selected Buy & Sell GH products and submit a secure order request for availability, payment and delivery confirmation." />
      <section className="page-hero">
        <p className="eyebrow-dark">Checkout</p>
        <h1>Submit your order request</h1>
        <p>Your order is not confirmed until Buy & Sell GH verifies availability, final delivery details and payment instructions.</p>
      </section>
      <section className="section cart-layout grid gap-8 xl:grid-cols-[minmax(0,1fr)_430px]">
        <div className="grid gap-4">
          {items.length === 0 ? (
            <EmptyCart />
          ) : (
            items.map((item) => (
              <article className="cart-item grid min-w-0 gap-4 rounded-lg border border-black/7 bg-white p-4 shadow-card sm:grid-cols-[150px_1fr_auto]" key={`${item.product.id}-${item.storage}-${item.color}`}>
                <Link to={`/product/${item.product.slug}`} aria-label={`View ${item.product.name}`}>
                  <ProductVisual product={item.product} />
                </Link>
                <div className="min-w-0">
                  <Link to={`/product/${item.product.slug}`} className="text-xl font-black text-ink hover:text-gold-dark">{item.product.name}</Link>
                  <dl className="mt-3 grid gap-1 text-sm font-bold text-ink/64 sm:grid-cols-2">
                    <Detail label="Storage" value={item.storage} />
                    <Detail label="Colour" value={item.color} />
                    <Detail label="Condition" value={item.product.condition} />
                    {item.product.batteryHealth && <Detail label="Battery" value={item.product.batteryHealth} />}
                    {item.product.warrantyInfo && <Detail label="Warranty" value={item.product.warrantyInfo} />}
                    <Detail label="Unit price" value={formatGhs(item.product.price)} />
                  </dl>
                  <p className="mt-3 text-lg font-black">Line total: {formatGhs(item.product.price * item.quantity)}</p>
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
          <h2 className="text-2xl font-black">Order review</h2>
          <p className="mt-3 text-sm leading-7 text-ink/65">Payment is not collected here. Buy & Sell GH will confirm product availability and payment instructions after review.</p>

          <div className="mt-5 rounded-lg border border-black/7 bg-page p-4">
            <h3 className="text-base font-black">Summary</h3>
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
            <div className="mt-5 grid gap-2 border-t border-black/10 pt-4 text-sm font-bold text-ink/65">
              <div className="flex justify-between"><span>Subtotal</span><span>{formatGhs(subtotal)}</span></div>
              <div className="flex justify-between"><span>Delivery</span><span>{form.fulfilmentType === "delivery" ? "To confirm" : formatGhs(0)}</span></div>
              <p>{deliveryCopy}</p>
              <div className="flex justify-between text-lg font-black text-ink"><span>Total</span><span>{formatGhs(total)}</span></div>
            </div>
          </div>

          <form className="mt-5 grid gap-5" noValidate onSubmit={handleSubmit}>
            <CheckoutSection icon={<UserRound size={18} />} title="Customer information">
              <OrderInput label="Full name" value={form.fullName} error={errors.fullName} autoComplete="name" onChange={(value) => updateField("fullName", value)} />
              <OrderInput label="Phone number" value={form.phone} error={errors.phone} inputMode="tel" autoComplete="tel" onChange={(value) => updateField("phone", value)} />
              <OrderInput label="WhatsApp number" value={form.whatsapp} error={errors.whatsapp} inputMode="tel" autoComplete="tel" onChange={(value) => updateField("whatsapp", value)} />
              <OrderInput label="Email, optional" type="email" value={form.email} error={errors.email} autoComplete="email" onChange={(value) => updateField("email", value)} />
            </CheckoutSection>

            <CheckoutSection icon={<MapPin size={18} />} title="Fulfilment">
              <label className="choice-label">Delivery or pickup
                <select aria-label="Delivery or pickup" value={form.fulfilmentType} onChange={(event) => updateField("fulfilmentType", event.target.value as FulfilmentType)}>
                  <option value="pickup">Store Pickup</option>
                  <option value="delivery">Delivery</option>
                </select>
              </label>
              {form.fulfilmentType === "delivery" && (
                <>
                  <OrderInput label="Region" value={form.region} error={errors.region} onChange={(value) => updateField("region", value)} />
                  <OrderInput label="City / Area" value={form.city} error={errors.city} onChange={(value) => updateField("city", value)} />
                  <OrderInput label="Delivery address" value={form.deliveryAddress} error={errors.deliveryAddress} onChange={(value) => updateField("deliveryAddress", value)} />
                  <OrderInput label="Landmark" value={form.landmark} onChange={(value) => updateField("landmark", value)} />
                  <OrderTextarea label="Delivery notes" value={form.deliveryNotes} onChange={(value) => updateField("deliveryNotes", value)} />
                </>
              )}
            </CheckoutSection>

            <CheckoutSection icon={<CreditCard size={18} />} title="Payment preference">
              <label className="choice-label">Preferred payment method
                <select aria-label="Preferred payment method" value={form.preferredPaymentMethod} onChange={(event) => updateField("preferredPaymentMethod", event.target.value as PaymentMethod)}>
                  <option value="">Select payment method</option>
                  {PAYMENT_METHODS.map((method) => <option value={method} key={method}>{method}</option>)}
                </select>
                {errors.preferredPaymentMethod && <span className="form-error text-sm font-bold text-red-700">{errors.preferredPaymentMethod}</span>}
              </label>
              <p className="rounded-lg border border-gold/20 bg-warm p-3 text-sm font-bold leading-6 text-ink/70">Payment instructions will be confirmed by Buy & Sell GH after your order is reviewed.</p>
              <OrderTextarea label="Additional note" value={form.additionalNote} onChange={(value) => updateField("additionalNote", value)} />
            </CheckoutSection>

            {errors.cart && <p className="form-error rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-bold text-red-700">{errors.cart}</p>}
            {errors.submit && <p className="form-error rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-bold text-red-700">{errors.submit}</p>}

            <button className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-60" type="submit" disabled={submitting || loading}>
              <Send size={17} /> {submitting ? "Submitting order request..." : "Submit Order Request"}
            </button>
            <p className="text-center text-xs font-bold leading-5 text-ink/55">Reference preview: {orderPreview.referenceNumber}. Final reference is generated when Supabase saves the order.</p>
          </form>

          {hasItems && <button className="btn-ghost mt-4 w-full" type="button" onClick={clearCart}>Clear cart</button>}
        </aside>
      </section>
    </>
  );
}

function customerDetailsFromForm(form: OrderFormState, preview = false): OrderCustomerDetails {
  return {
    fullName: form.fullName.trim() || (preview ? "Customer" : ""),
    phone: cleanPhone(form.phone),
    whatsapp: cleanPhone(form.whatsapp || form.phone),
    email: form.email.trim() || undefined,
    fulfilmentType: form.fulfilmentType,
    region: form.fulfilmentType === "delivery" ? form.region.trim() : undefined,
    city: form.fulfilmentType === "delivery" ? form.city.trim() : undefined,
    deliveryAddress: form.fulfilmentType === "delivery" ? form.deliveryAddress.trim() : undefined,
    landmark: form.fulfilmentType === "delivery" ? form.landmark.trim() || undefined : undefined,
    deliveryNotes: form.fulfilmentType === "delivery" ? form.deliveryNotes.trim() || undefined : undefined,
    preferredPaymentMethod: (form.preferredPaymentMethod || "Pay on Pickup") as PaymentMethod,
    additionalNote: form.additionalNote.trim() || undefined,
  };
}

function cleanPhone(value: string) {
  return value.replace(/[\s-]/g, "").trim();
}

function persistOrder(order: StoredOrderRequest) {
  try {
    sessionStorage.setItem(ORDER_SUCCESS_STORAGE_KEY, JSON.stringify(order));
  } catch {
    // Confirmation page can still render from router state.
  }
}

function Detail({ label, value }: { label: string; value: string }) {
  return <div><dt className="inline text-ink/45">{label}: </dt><dd className="inline">{value}</dd></div>;
}

function EmptyCart() {
  return (
    <div className="rounded-lg border border-black/7 bg-white p-8 text-center shadow-card">
      <ShoppingBag className="mx-auto text-gold-dark" size={34} />
      <h2 className="mt-3 text-2xl font-black">Your cart is empty</h2>
      <p className="mt-3 text-sm font-bold text-ink/60">Add a device to prepare an order request.</p>
      <Link className="btn-primary mt-5" to="/shop">Browse Devices</Link>
    </div>
  );
}

function CheckoutSection({ icon, title, children }: { icon: ReactNode; title: string; children: ReactNode }) {
  return (
    <fieldset className="rounded-lg border border-black/7 bg-white p-4">
      <legend className="flex items-center gap-2 px-2 text-sm font-black uppercase text-ink/70">{icon} {title}</legend>
      <div className="mt-3 grid gap-3">{children}</div>
    </fieldset>
  );
}

function OrderInput({
  label,
  value,
  error,
  type = "text",
  inputMode,
  autoComplete,
  onChange,
}: {
  label: string;
  value: string;
  error?: string;
  type?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  autoComplete?: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="choice-label">{label}
      <input aria-label={label} className="rounded-lg border border-black/10 bg-white p-3 text-base font-bold outline-none" type={type} inputMode={inputMode} autoComplete={autoComplete} value={value} onChange={(event) => onChange(event.target.value)} />
      {error && <span className="form-error text-sm font-bold text-red-700">{error}</span>}
    </label>
  );
}

function OrderTextarea({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="choice-label">{label}
      <textarea aria-label={label} className="min-h-24 resize-y rounded-lg border border-black/10 bg-white p-3 text-base font-bold outline-none" value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

export { ORDER_SUCCESS_STORAGE_KEY };
