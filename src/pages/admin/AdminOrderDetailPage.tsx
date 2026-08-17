import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { fetchAdminOrderById, updateAdminOrderStatus } from "../../orders/supabaseOrderRepository";
import { ORDER_STATUSES, type OrderStatus, type StoredOrderRequest } from "../../types/order";
import { formatGhs } from "../../utils/format";
import { orderRequestWhatsAppUrl } from "../../utils/whatsapp";

export function AdminOrderDetailPage() {
  const { orderId } = useParams();
  const [order, setOrder] = useState<StoredOrderRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!orderId) return;
    let active = true;
    fetchAdminOrderById(orderId)
      .then((data) => {
        if (active) setOrder(data);
      })
      .catch((failure) => {
        if (active) setError(failure instanceof Error ? failure.message : "Order could not be loaded.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [orderId]);

  const changeStatus = async (status: OrderStatus) => {
    if (!order) return;
    setSaving(true);
    setError("");
    try {
      const saved = await updateAdminOrderStatus(order.id, status);
      setOrder(saved);
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "Order status could not be updated.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="admin-loading">Loading order...</div>;
  if (!order) {
    return (
      <div className="admin-page-grid">
        <section className="admin-panel"><h2>Order not found</h2><Link className="btn-secondary mt-4" to="/admin/orders">Back to Orders</Link></section>
      </div>
    );
  }

  return (
    <div className="admin-page-grid">
      <section className="admin-panel admin-panel-hero">
        <div>
          <p className="eyebrow-dark">Order Detail</p>
          <h2>{order.referenceNumber}</h2>
          <p>{order.customer.fullName} | {order.customer.phone} | {formatGhs(order.total)}</p>
        </div>
        <Link className="btn-secondary" to="/admin/orders"><ArrowLeft size={17} /> Back</Link>
      </section>

      {error && <div className="admin-error">{error}</div>}

      <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="admin-panel">
          <div className="admin-section-title">
            <div>
              <p className="eyebrow-dark">Items</p>
              <h2>Product snapshots</h2>
            </div>
          </div>
          <div className="grid gap-3">
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

        <aside className="admin-panel">
          <p className="eyebrow-dark">Customer</p>
          <h2>{order.customer.fullName}</h2>
          <dl className="mt-4 grid gap-2 text-sm font-bold text-ink/65">
            <Detail label="Phone" value={order.customer.phone} />
            <Detail label="WhatsApp" value={order.customer.whatsapp} />
            <Detail label="Email" value={order.customer.email ?? "Not provided"} />
            <Detail label="Fulfilment" value={order.customer.fulfilmentType === "delivery" ? "Delivery" : "Pickup"} />
            <Detail label="Region" value={order.customer.region ?? "Not provided"} />
            <Detail label="City" value={order.customer.city ?? "Not provided"} />
            <Detail label="Address" value={order.customer.deliveryAddress ?? "Not provided"} />
            <Detail label="Landmark" value={order.customer.landmark ?? "Not provided"} />
            <Detail label="Payment preference" value={order.customer.preferredPaymentMethod} />
            <Detail label="Payment status" value={order.paymentStatus} />
            <Detail label="Order status" value={order.status} />
            <Detail label="Subtotal" value={formatGhs(order.subtotal)} />
            <Detail label="Delivery fee" value={order.deliveryFee === null ? "To confirm" : formatGhs(order.deliveryFee)} />
            <Detail label="Total" value={formatGhs(order.total)} />
          </dl>
          {order.customer.additionalNote && <p className="mt-4 rounded-lg bg-page p-3 text-sm font-bold leading-6 text-ink/65">{order.customer.additionalNote}</p>}
          <a className="btn-primary mt-5 w-full" href={orderRequestWhatsAppUrl(order)} target="_blank" rel="noopener noreferrer">Contact on WhatsApp</a>
        </aside>
      </section>

      <section className="admin-panel">
        <div className="admin-section-title">
          <div>
            <p className="eyebrow-dark">Timeline</p>
            <h2>Status controls</h2>
          </div>
        </div>
        <div className="admin-status-grid">
          {ORDER_STATUSES.map((status) => (
            <button className={status === order.status ? "is-active" : ""} type="button" key={status} disabled={saving || status === order.status} onClick={() => void changeStatus(status)}>
              {status === order.status && <CheckCircle2 size={15} />} {status}
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return <div className="flex justify-between gap-3 border-b border-black/7 pb-2"><dt>{label}</dt><dd className="text-right text-ink">{value}</dd></div>;
}
