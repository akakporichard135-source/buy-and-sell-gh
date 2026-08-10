import { CheckCircle2, MessageCircle, ShoppingBag, Store } from "lucide-react";
import { Link, useLocation, useParams } from "react-router-dom";
import { SEO } from "../components/SEO";
import type { StoredOrderRequest } from "../types/order";
import { formatGhs } from "../utils/format";
import { orderRequestWhatsAppUrl, whatsappUrl } from "../utils/whatsapp";
import { ORDER_SUCCESS_STORAGE_KEY } from "./CartPage";

export function OrderSuccessPage() {
  const { reference } = useParams();
  const location = useLocation();
  const order = getOrderFromState(location.state) ?? getStoredOrder(reference);

  if (!order) {
    const referenceLabel = reference ?? "Reference saved";
    const fallbackWhatsAppHref = reference
      ? whatsappUrl(`Hello Buy & Sell GH, I submitted an order request on your website. My reference is ${reference}. Please confirm availability and payment details.`)
      : whatsappUrl("Hello Buy & Sell GH, I submitted an order request on your website. Please help me confirm the details.");

    return (
      <>
        <SEO title="Order Received" description="Buy & Sell GH order request confirmation." />
        <section className="page-hero">
          <p className="eyebrow-dark">Order received</p>
          <h1>{referenceLabel}</h1>
          <p>Your order request was submitted. Buy & Sell GH will confirm availability, final delivery details and payment instructions before any payment is completed.</p>
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <a className="btn-primary" href={fallbackWhatsAppHref} target="_blank" rel="noreferrer"><MessageCircle size={17} /> Continue on WhatsApp</a>
            <Link className="btn-secondary" to="/shop">View Store</Link>
            <Link className="btn-secondary" to="/cart">Back to Cart</Link>
          </div>
        </section>
      </>
    );
  }

  const whatsappHref = orderRequestWhatsAppUrl(order);
  const fulfilment = order.customer.fulfilmentType === "delivery"
    ? [order.customer.region, order.customer.city, order.customer.deliveryAddress].filter(Boolean).join(", ")
    : "Store Pickup";

  return (
    <>
      <SEO title={`Order Received ${order.referenceNumber}`} description="Your Buy & Sell GH order request has been received." />
      <section className="page-hero">
        <p className="eyebrow-dark">Order Received</p>
        <h1>{order.referenceNumber}</h1>
        <p>Your order has been received. Buy & Sell GH will confirm availability, final delivery details and payment instructions with you shortly.</p>
      </section>
      <section className="section grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="rounded-lg border border-black/7 bg-white p-5 shadow-card sm:p-7">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-1 text-emerald-600" size={28} />
            <div>
              <p className="eyebrow-dark">Confirmation</p>
              <h2 className="text-2xl font-black">Order request submitted</h2>
              <p className="mt-2 text-sm font-bold leading-7 text-ink/65">Payment has not been completed online. Payment instructions will be confirmed by Buy & Sell GH after review.</p>
            </div>
          </div>

          <div className="mt-6 grid gap-3">
            {order.items.map((item) => (
              <article className="order-summary-line rounded-lg border border-black/7 bg-page p-3" key={`${item.productId}-${item.storage}-${item.colour}`}>
                {item.productImage ? <img src={item.productImage} alt={item.productName} loading="lazy" /> : <div className="grid h-16 w-16 place-items-center rounded-lg bg-warm text-xs font-black text-ink/50">No image</div>}
                <div>
                  <strong>{item.quantity}x {item.productName}</strong>
                  <span>{item.storage} | {item.colour} | {item.condition}</span>
                  <small>{formatGhs(item.unitPrice)} each | {formatGhs(item.lineTotal)}</small>
                </div>
              </article>
            ))}
          </div>
        </div>

        <aside className="h-fit rounded-lg border border-black/7 bg-white p-5 shadow-card">
          <p className="eyebrow-dark">Reference</p>
          <h2 className="mt-2 text-3xl font-black">{order.referenceNumber}</h2>
          <dl className="mt-5 grid gap-3 text-sm font-bold text-ink/65">
            <SummaryDetail label="Customer" value={order.customer.fullName} />
            <SummaryDetail label="Phone" value={order.customer.phone} />
            <SummaryDetail label="Fulfilment" value={order.customer.fulfilmentType === "delivery" ? "Delivery" : "Store Pickup"} />
            <SummaryDetail label="Location" value={fulfilment || "To confirm"} />
            <SummaryDetail label="Payment" value={order.customer.preferredPaymentMethod} />
            <SummaryDetail label="Subtotal" value={formatGhs(order.subtotal)} />
            <SummaryDetail label="Delivery" value={order.deliveryFee === null ? "To confirm" : formatGhs(order.deliveryFee)} />
            <SummaryDetail label="Total" value={formatGhs(order.total)} />
          </dl>
          <div className="mt-6 grid gap-3">
            <a className="btn-primary" href={whatsappHref} target="_blank" rel="noreferrer"><MessageCircle size={17} /> Continue on WhatsApp</a>
            <Link className="btn-secondary" to="/shop"><ShoppingBag size={17} /> Continue Shopping</Link>
            <Link className="btn-ghost" to="/"><Store size={17} /> View Store</Link>
          </div>
        </aside>
      </section>
    </>
  );
}

function SummaryDetail({ label, value }: { label: string; value: string }) {
  return <div className="flex justify-between gap-4 border-b border-black/7 pb-2"><dt>{label}</dt><dd className="text-right text-ink">{value}</dd></div>;
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
