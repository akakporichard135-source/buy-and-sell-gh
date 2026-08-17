import { Eye, RefreshCw, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { fetchAdminOrders } from "../../orders/supabaseOrderRepository";
import { ORDER_STATUSES, type OrderStatus, type StoredOrderRequest } from "../../types/order";
import { formatGhs } from "../../utils/format";

export function AdminOrdersPage() {
  const [orders, setOrders] = useState<StoredOrderRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<OrderStatus | "All">("All");
  const [loadVersion, setLoadVersion] = useState(0);

  useEffect(() => {
    let active = true;
    fetchAdminOrders()
      .then((data) => {
        if (active) {
          setOrders(data);
          setError("");
        }
      })
      .catch(() => {
        if (active) setError("Orders could not be loaded. Check your connection and try again.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [loadVersion]);

  const filtered = useMemo(() => {
    const search = query.trim().toLowerCase();
    return orders.filter((order) => {
      const searchable = [order.referenceNumber, order.customer.fullName, order.customer.phone, order.customer.whatsapp].join(" ").toLowerCase();
      return (!search || searchable.includes(search)) && (status === "All" || order.status === status);
    });
  }, [orders, query, status]);

  return (
    <div className="admin-page-grid">
      <section className="admin-panel admin-panel-hero">
        <div>
          <p className="eyebrow-dark">Order Requests</p>
          <h2>Orders</h2>
          <p>Review website order requests, contact customers, and prepare status updates after availability and payment instructions are confirmed.</p>
        </div>
      </section>

      <section className="admin-panel">
        <div className="admin-product-toolbar">
          <label className="admin-search"><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search reference, customer or phone..." /></label>
          <label className="admin-toolbar-filter"><span>Status</span><select value={status} onChange={(event) => setStatus(event.target.value as OrderStatus | "All")}>
              <option>All</option>
              {ORDER_STATUSES.map((item) => <option key={item}>{item}</option>)}
            </select></label>
        </div>
        {error && <div className="admin-error" role="alert">{error}<button className="btn-secondary" type="button" onClick={() => { setLoading(true); setLoadVersion((value) => value + 1); }}><RefreshCw size={16} /> Retry</button></div>}
        {loading ? (
          <div className="rounded-lg border border-black/7 bg-white p-5 text-sm font-black text-ink/65">Loading orders...</div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr><th>Reference</th><th>Customer</th><th>Amount</th><th>Delivery</th><th>Payment</th><th>Status</th><th>Date</th><th /></tr>
              </thead>
              <tbody>
                {filtered.map((order) => (
                  <tr key={order.id}>
                    <td>{order.referenceNumber}</td>
                    <td>{order.customer.fullName}<br /><span className="text-xs text-ink/55">{order.customer.phone}</span></td>
                    <td>{formatGhs(order.total)}</td>
                    <td>{order.customer.fulfilmentType === "delivery" ? "Delivery" : "Pickup"}</td>
                    <td>{order.paymentStatus}</td>
                    <td>{order.status}</td>
                    <td>{new Date(order.createdAt).toLocaleDateString("en-GH")}</td>
                    <td><Link className="btn-secondary" to={`/admin/orders/${order.id}`}><Eye size={15} /> View</Link></td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={8}>No orders match those filters yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
