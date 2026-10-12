import {
  Download,
  Eye,
  FileSpreadsheet,
  Filter,
  MessageCircle,
  Package,
  RefreshCw,
  Search,
  ShieldAlert,
  ShoppingBag,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ADMIN_NEW_ORDER_EVENT } from "../../admin/AdminOrderNotifications";
import { fetchAdminOrders } from "../../orders/supabaseOrderRepository";
import {
  ORDER_STATUSES,
  isTestOrder,
  type OrderStatus,
  type StoredOrderRequest,
} from "../../types/order";
import { formatGhs } from "../../utils/format";

export function AdminOrdersPage() {
  const [orders, setOrders] = useState<StoredOrderRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<OrderStatus | "All">("All");
  const [orderCategory, setOrderCategory] = useState<"genuine" | "all" | "test">("genuine");
  const [loadVersion, setLoadVersion] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetchAdminOrders()
      .then((data) => {
        if (active) {
          setOrders(data);
          setError("");
        }
      })
      .catch(() => {
        if (active) setError("Orders could not be loaded from database. Verify network connection.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [loadVersion]);

  useEffect(() => {
    const refreshOrders = () => setLoadVersion((value) => value + 1);
    window.addEventListener(ADMIN_NEW_ORDER_EVENT, refreshOrders);
    return () => window.removeEventListener(ADMIN_NEW_ORDER_EVENT, refreshOrders);
  }, []);

  const { genuineCount, testCount } = useMemo(() => {
    let genuine = 0;
    let test = 0;
    orders.forEach((o) => {
      if (isTestOrder(o)) test++;
      else genuine++;
    });
    return { genuineCount: genuine, testCount: test };
  }, [orders]);

  const categoryFilteredOrders = useMemo(() => {
    if (orderCategory === "genuine") return orders.filter((o) => !isTestOrder(o));
    if (orderCategory === "test") return orders.filter((o) => isTestOrder(o));
    return orders;
  }, [orders, orderCategory]);

  const countsByStatus = useMemo(() => {
    const counts: Record<string, number> = { All: categoryFilteredOrders.length };
    ORDER_STATUSES.forEach((st) => (counts[st] = 0));
    categoryFilteredOrders.forEach((o) => {
      if (counts[o.status] !== undefined) counts[o.status]++;
    });
    return counts;
  }, [categoryFilteredOrders]);

  const filtered = useMemo(() => {
    const search = query.trim().toLowerCase();
    return categoryFilteredOrders.filter((order) => {
      const searchable = [
        order.referenceNumber,
        order.customer.fullName,
        order.customer.phone,
        order.customer.whatsapp || "",
        ...(order.items?.map((i) => i.productName) || []),
      ]
        .join(" ")
        .toLowerCase();
      return (!search || searchable.includes(search)) && (status === "All" || order.status === status);
    });
  }, [categoryFilteredOrders, query, status]);

  const exportCsv = () => {
    if (filtered.length === 0) return;
    const headers = [
      "Reference",
      "Customer Name",
      "Phone",
      "WhatsApp",
      "Email",
      "Fulfilment Type",
      "Delivery Address",
      "Payment Status",
      "Order Status",
      "Gross Total (GHS)",
      "Items Summary",
      "Date Placed",
      "Is Test Order",
      "Admin Note",
    ];

    const rows = filtered.map((o) => {
      const isTest = isTestOrder(o);
      const itemsSummary = o.items
        ? o.items.map((i) => `${i.quantity}x ${i.productName} (${i.storage || ""})`).join("; ")
        : "";
      return [
        `"${o.referenceNumber}"`,
        `"${o.customer.fullName.replace(/"/g, '""')}"`,
        `"${o.customer.phone}"`,
        `"${o.customer.whatsapp || ""}"`,
        `"${o.customer.email || ""}"`,
        `"${o.customer.fulfilmentType}"`,
        `"${(o.customer.deliveryAddress || "").replace(/"/g, '""')}"`,
        `"${o.paymentStatus}"`,
        `"${o.status}"`,
        o.total || 0,
        `"${itemsSummary.replace(/"/g, '""')}"`,
        `"${new Date(o.createdAt).toISOString()}"`,
        isTest ? "YES" : "NO",
        `"${(o.adminNote || "").replace(/"/g, '""')}"`,
      ].join(",");
    });

    const csvContent = "\uFEFF" + [headers.join(","), ...rows].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const timestamp = new Date().toISOString().slice(0, 10);
    link.href = url;
    link.setAttribute("download", `buyandsellgh-orders-${orderCategory}-${timestamp}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Card */}
      <div className="admin-header-card">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-[#d4af37]">
              Order Fulfilment
            </span>
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-slate-300" />
            <span className="text-xs font-semibold text-slate-500">Live Customer Queue</span>
          </div>
          <h2>Customer Order Requests</h2>
          <p>
            Review customer orders placed online, verify device inventory, confirm payment terms,
            and manage delivery or store pickup status.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            className="admin-btn admin-btn-secondary admin-btn-sm"
            type="button"
            onClick={exportCsv}
            disabled={filtered.length === 0}
            title="Download CSV spreadsheet of current orders"
          >
            <Download size={14} />
            <span>Export CSV ({filtered.length})</span>
          </button>
          <button
            className="admin-btn admin-btn-secondary admin-btn-sm"
            type="button"
            onClick={() => setLoadVersion((v) => v + 1)}
            disabled={loading}
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            <span>Refresh Queue</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center justify-between">
          <span>{error}</span>
          <button
            type="button"
            className="admin-btn admin-btn-secondary admin-btn-sm"
            onClick={() => setLoadVersion((v) => v + 1)}
          >
            Retry
          </button>
        </div>
      )}

      {/* 2. Queue Category Selector (Genuine vs Dev Test) */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-white border border-slate-200 shadow-sm">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setOrderCategory("genuine")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              orderCategory === "genuine"
                ? "bg-slate-900 text-white shadow-sm"
                : "bg-slate-50 text-slate-600 hover:bg-slate-100"
            }`}
          >
            Genuine Customer Orders ({genuineCount})
          </button>
          <button
            type="button"
            onClick={() => setOrderCategory("test")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              orderCategory === "test"
                ? "bg-amber-600 text-white shadow-sm"
                : "bg-slate-50 text-slate-600 hover:bg-slate-100"
            }`}
          >
            Dev / Bot Test Orders ({testCount})
          </button>
          <button
            type="button"
            onClick={() => setOrderCategory("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              orderCategory === "all"
                ? "bg-slate-900 text-white shadow-sm"
                : "bg-slate-50 text-slate-600 hover:bg-slate-100"
            }`}
          >
            All Orders ({orders.length})
          </button>
        </div>

        {orderCategory === "genuine" && testCount > 0 && (
          <div className="text-xs text-slate-500 flex items-center gap-1.5 font-medium">
            <ShieldAlert size={14} className="text-amber-500" />
            <span>
              {testCount} automated verification/test orders isolated from business metrics.
            </span>
          </div>
        )}

        {orderCategory === "test" && (
          <div className="text-xs text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md font-semibold border border-amber-200 flex items-center gap-1.5">
            <ShieldAlert size={14} />
            <span>Isolated automated test and verification records. Safe for inspection or auditing.</span>
          </div>
        )}
      </div>

      {/* 3. Filter & Search Toolbar */}
      <div className="admin-toolbar">
        <div className="admin-search-input">
          <Search size={16} className="text-slate-400 shrink-0" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search reference, customer, or phone..."
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mr-1">
            Status:
          </span>
          <button
            type="button"
            onClick={() => setStatus("All")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              status === "All"
                ? "bg-slate-900 text-white shadow-sm"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            All ({countsByStatus.All})
          </button>
          {ORDER_STATUSES.map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatus(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                status === st
                  ? "bg-slate-900 text-white shadow-sm"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              {st} {countsByStatus[st] > 0 && `(${countsByStatus[st]})`}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Orders Table */}
      <div className="admin-table-shell">
        <div className="admin-table-scroll">
          <table className="admin-data-table">
            <thead>
              <tr>
                <th>Reference</th>
                <th>Customer</th>
                <th>Purchased Items</th>
                <th>Gross Total</th>
                <th>Fulfilment</th>
                <th>Payment</th>
                <th>Order Status</th>
                <th>Placed Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} className="text-center py-10 text-slate-400 font-medium">
                    Loading customer orders...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-10 text-slate-400 font-medium">
                    {orderCategory === "test"
                      ? "No automated test orders found."
                      : "No orders match the selected filters."}
                  </td>
                </tr>
              ) : (
                filtered.map((order) => {
                  const isPending = order.status === "Pending";
                  const isCompleted = ["Delivered", "Completed"].includes(order.status);
                  const isCancelled = order.status === "Cancelled";
                  const isTest = isTestOrder(order);

                  return (
                    <tr key={order.id} className="hover:bg-slate-50/70">
                      <td className="font-mono font-bold text-slate-900">
                        <div className="flex flex-col gap-0.5">
                          <Link
                            to={`/admin/orders/${order.id}`}
                            className="hover:text-[#d4af37] transition-colors"
                          >
                            {order.referenceNumber}
                          </Link>
                          {isTest && (
                            <span className="inline-block text-[0.65rem] px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 font-sans font-bold w-fit">
                              Dev Test
                            </span>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="font-bold text-slate-900">{order.customer.fullName}</div>
                        <div className="text-xs text-slate-500">{order.customer.phone}</div>
                      </td>
                      <td>
                        <div className="text-xs font-medium text-slate-800 max-w-[200px] truncate">
                          {order.items?.map((i) => `${i.quantity}x ${i.productName}`).join(", ") ||
                            "Item snapshot"}
                        </div>
                      </td>
                      <td className="font-extrabold text-slate-900">{formatGhs(order.total)}</td>
                      <td>
                        <span className="admin-badge admin-badge-slate">
                          {order.customer.fulfilmentType === "delivery" ? "Delivery" : "Store Pickup"}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`admin-badge ${
                            order.paymentStatus === "Paid"
                              ? "admin-badge-emerald"
                              : "admin-badge-amber"
                          }`}
                        >
                          {order.paymentStatus}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`admin-badge ${
                            isCompleted
                              ? "admin-badge-emerald"
                              : isPending
                              ? "admin-badge-amber"
                              : isCancelled
                              ? "admin-badge-rose"
                              : "admin-badge-blue"
                          }`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="text-xs text-slate-500 whitespace-nowrap">
                        {new Date(order.createdAt).toLocaleDateString("en-GH", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <Link
                            to={`/admin/orders/${order.id}`}
                            className="admin-btn admin-btn-secondary admin-btn-sm"
                          >
                            <Eye size={14} />
                            <span>Details</span>
                          </Link>
                          <a
                            href={`https://wa.me/233${order.customer.phone.replace(/^0/, "").replace(/\s+/g, "")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                            title="Chat with customer on WhatsApp"
                          >
                            <MessageCircle size={16} />
                          </a>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
