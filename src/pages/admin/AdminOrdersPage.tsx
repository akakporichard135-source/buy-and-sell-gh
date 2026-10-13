import {
  ChevronLeft,
  ChevronRight,
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
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

  useEffect(() => {
    setCurrentPage(1);
  }, [query, status, orderCategory]);

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

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage, pageSize]);

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

            {/* 4. Streamlined Desktop Orders Table (hidden on mobile) */}
      <div className="admin-table-shell hidden md:block">
        <div className="admin-table-scroll">
          <table className="admin-data-table">
            <thead>
              <tr>
                <th style={{ width: "20%" }}>Order &amp; Date</th>
                <th style={{ width: "22%" }}>Customer</th>
                <th style={{ width: "22%" }}>Purchased Items</th>
                <th style={{ width: "16%" }}>Total &amp; Payment</th>
                <th style={{ width: "12%" }}>Status</th>
                <th style={{ width: "8%", textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-slate-400 font-medium">
                    Loading customer orders...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-slate-400 font-medium">
                    {orderCategory === "test"
                      ? "No automated test orders found."
                      : "No orders match the selected filters."}
                  </td>
                </tr>
              ) : (
                paginatedOrders.map((order) => {
                  const isPending = order.status === "Pending";
                  const isCompleted = ["Delivered", "Completed"].includes(order.status);
                  const isCancelled = order.status === "Cancelled";
                  const isTest = isTestOrder(order);

                  return (
                    <tr key={order.id} className="hover:bg-slate-50/70">
                      {/* 1. Reference & Date */}
                      <td>
                        <div className="flex flex-col gap-0.5">
                          <Link
                            to={`/admin/orders/${order.id}`}
                            className="font-mono font-bold text-slate-900 hover:text-[#d4af37] transition-colors"
                          >
                            {order.referenceNumber}
                          </Link>
                          <span className="text-xs text-slate-400">
                            {new Date(order.createdAt).toLocaleDateString("en-GH", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                          {isTest && (
                            <span className="inline-block text-[0.65rem] px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 font-sans font-bold w-fit mt-0.5">
                              Dev Test
                            </span>
                          )}
                        </div>
                      </td>

                      {/* 2. Customer */}
                      <td>
                        <div className="font-bold text-slate-900">{order.customer.fullName}</div>
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                          <span>{order.customer.phone}</span>
                          <a
                            href={`https://wa.me/233${order.customer.phone.replace(/^0/, "").replace(/\s+/g, "")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-emerald-600 hover:text-emerald-700 transition-colors"
                            title="Chat on WhatsApp"
                          >
                            <MessageCircle size={13} />
                          </a>
                        </div>
                      </td>

                      {/* 3. Items */}
                      <td>
                        <div className="text-xs font-semibold text-slate-800 truncate max-w-[220px]">
                          {order.items?.map((i) => `${i.quantity}x ${i.productName}`).join(", ") ||
                            "Item snapshot"}
                        </div>
                        <span className="text-[0.68rem] text-slate-400">
                          {order.items?.length || 0} item{(order.items?.length || 0) === 1 ? "" : "s"}
                        </span>
                      </td>

                      {/* 4. Total & Payment */}
                      <td>
                        <div className="font-extrabold text-slate-900">{formatGhs(order.total)}</div>
                        <span
                          className={`admin-badge text-[0.68rem] mt-0.5 ${
                            order.paymentStatus === "Paid"
                              ? "admin-badge-emerald"
                              : "admin-badge-amber"
                          }`}
                        >
                          {order.paymentStatus}
                        </span>
                      </td>

                      {/* 5. Status & Fulfilment */}
                      <td>
                        <div className="flex flex-col gap-1 items-start">
                          <span
                            className={`admin-badge text-[0.68rem] ${
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
                          <span className="text-[0.68rem] font-medium text-slate-500">
                            {order.customer.fulfilmentType === "delivery" ? "Delivery" : "Pickup"}
                          </span>
                        </div>
                      </td>

                      {/* 6. Actions */}
                      <td style={{ textAlign: "right" }}>
                        <Link
                          to={`/admin/orders/${order.id}`}
                          className="admin-btn admin-btn-secondary admin-btn-sm"
                        >
                          <Eye size={13} />
                          <span>Details</span>
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Responsive Mobile Orders Stack (md:hidden) */}
      <div className="md:hidden flex flex-col gap-3">
        {loading ? (
          <div className="admin-card p-6 text-center text-slate-400 font-medium text-xs">
            Loading customer orders...
          </div>
        ) : filtered.length === 0 ? (
          <div className="admin-card p-6 text-center text-slate-400 font-medium text-xs">
            {orderCategory === "test"
              ? "No automated test orders found."
              : "No orders match the selected filters."}
          </div>
        ) : (
          paginatedOrders.map((order) => {
            const isPending = order.status === "Pending";
            const isCompleted = ["Delivered", "Completed"].includes(order.status);
            const isCancelled = order.status === "Cancelled";
            const isTest = isTestOrder(order);

            return (
              <div key={order.id} className="admin-card p-4 flex flex-col gap-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <Link
                        to={`/admin/orders/${order.id}`}
                        className="font-mono font-bold text-slate-900 text-sm hover:text-[#d4af37]"
                      >
                        {order.referenceNumber}
                      </Link>
                      {isTest && (
                        <span className="text-[0.65rem] px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 font-bold">
                          Dev Test
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-slate-400">
                      {new Date(order.createdAt).toLocaleDateString("en-GH", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>

                  <span
                    className={`admin-badge text-[0.68rem] ${
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
                </div>

                <div className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  <div className="font-semibold text-slate-900">{order.customer.fullName}</div>
                  <div className="flex items-center justify-between mt-1 text-slate-500">
                    <span>{order.customer.phone}</span>
                    <a
                      href={`https://wa.me/233${order.customer.phone.replace(/^0/, "").replace(/\s+/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-600 font-semibold flex items-center gap-1"
                    >
                      <MessageCircle size={13} />
                      <span>WhatsApp</span>
                    </a>
                  </div>
                  <div className="mt-1.5 pt-1.5 border-t border-slate-200/60 truncate font-medium">
                    {order.items?.map((i) => `${i.quantity}x ${i.productName}`).join(", ") ||
                      "Item snapshot"}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div>
                    <div className="font-extrabold text-slate-900 text-base">{formatGhs(order.total)}</div>
                    <span
                      className={`admin-badge text-[0.68rem] ${
                        order.paymentStatus === "Paid"
                          ? "admin-badge-emerald"
                          : "admin-badge-amber"
                      }`}
                    >
                      {order.paymentStatus} &bull; {order.customer.fulfilmentType === "delivery" ? "Delivery" : "Pickup"}
                    </span>
                  </div>

                  <Link
                    to={`/admin/orders/${order.id}`}
                    className="admin-btn admin-btn-secondary admin-btn-sm"
                  >
                    <Eye size={13} />
                    <span>View Details</span>
                  </Link>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 6. Orders Pagination Bar */}
      {filtered.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 rounded-xl bg-white border border-slate-200 shadow-sm">
          <div className="text-xs text-slate-500 font-medium">
            Showing <span className="font-bold text-slate-800">{(currentPage - 1) * pageSize + 1}</span> to{" "}
            <span className="font-bold text-slate-800">{Math.min(currentPage * pageSize, filtered.length)}</span> of{" "}
            <span className="font-bold text-slate-800">{filtered.length}</span> orders
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="admin-btn admin-btn-secondary admin-btn-sm disabled:opacity-40 disabled:cursor-not-allowed"
              aria-label="Previous page"
            >
              <ChevronLeft size={15} />
              <span className="hidden sm:inline">Prev</span>
            </button>

            <div className="flex items-center gap-1 px-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                if (
                  page === 1 ||
                  page === totalPages ||
                  (page >= currentPage - 1 && page <= currentPage + 1)
                ) {
                  return (
                    <button
                      key={page}
                      type="button"
                      onClick={() => setCurrentPage(page)}
                      className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${
                        currentPage === page
                          ? "bg-slate-900 text-white shadow-sm"
                          : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      {page}
                    </button>
                  );
                }
                if (page === currentPage - 2 || page === currentPage + 2) {
                  return (
                    <span key={page} className="text-xs text-slate-400 px-0.5">
                      ...
                    </span>
                  );
                }
                return null;
              })}
            </div>

            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="admin-btn admin-btn-secondary admin-btn-sm disabled:opacity-40 disabled:cursor-not-allowed"
              aria-label="Next page"
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
