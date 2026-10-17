import {
  AlertTriangle,
  Archive,
  ArrowLeft,
  CheckCircle2,
  Clock,
  CreditCard,
  ExternalLink,
  MapPin,
  MessageCircle,
  Package,
  Phone,
  RotateCcw,
  Save,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  Truck,
  User,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  archiveAdminOrder,
  deleteAdminOrder,
  fetchAdminOrderById,
  restoreAdminOrder,
  updateAdminOrder,
  updateAdminOrderStatus,
} from "../../orders/supabaseOrderRepository";
import {
  ORDER_STATUSES,
  PAYMENT_STATUSES,
  isTestOrder,
  type OrderStatus,
  type PaymentStatus,
  type StoredOrderRequest,
} from "../../types/order";
import { formatGhs } from "../../utils/format";
import { orderRequestWhatsAppUrl } from "../../utils/whatsapp";

export function AdminOrderDetailPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<StoredOrderRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");
  const [staffNote, setStaffNote] = useState("");
  const [noteSaved, setNoteSaved] = useState(false);

  // Deletion modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [hardDelete, setHardDelete] = useState(false);
  const [deleteReason, setDeleteReason] = useState("");

  useEffect(() => {
    if (!orderId) return;
    let active = true;
    setLoading(true);
    fetchAdminOrderById(orderId)
      .then((data) => {
        if (active) {
          setOrder(data);
          setStaffNote(data.adminNote || "");
        }
      })
      .catch((failure) => {
        if (active)
          setError(failure instanceof Error ? failure.message : "Order could not be loaded.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [orderId]);

  const changeStatus = async (status: OrderStatus) => {
    if (!order || saving) return;
    setSaving(true);
    setError("");
    try {
      const saved = await updateAdminOrder(order.id, { status });
      setOrder(saved);
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "Order status could not be updated.");
    } finally {
      setSaving(false);
    }
  };

  const changePaymentStatus = async (paymentStatus: PaymentStatus) => {
    if (!order || saving) return;
    setSaving(true);
    setError("");
    try {
      const saved = await updateAdminOrder(order.id, { paymentStatus });
      setOrder(saved);
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "Payment status could not be updated.");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveStaffNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order || saving) return;
    setSaving(true);
    setError("");
    try {
      const saved = await updateAdminOrder(order.id, { adminNote: staffNote });
      setOrder(saved);
      setNoteSaved(true);
      window.setTimeout(() => setNoteSaved(false), 2500);
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "Failed to persist staff note to Supabase.");
    } finally {
      setSaving(false);
    }
  };

  const handleArchive = async () => {
    if (!order || saving) return;
    setSaving(true);
    setError("");
    try {
      await archiveAdminOrder(order.id, order.referenceNumber);
      const now = new Date().toISOString();
      setOrder({ ...order, archivedAt: now });
      setActionSuccess(`Order ${order.referenceNumber} has been moved to Archived Orders.`);
      window.setTimeout(() => setActionSuccess(""), 4000);
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "Failed to archive order.");
    } finally {
      setSaving(false);
    }
  };

  const handleRestore = async () => {
    if (!order || saving) return;
    setSaving(true);
    setError("");
    try {
      await restoreAdminOrder(order.id, order.referenceNumber);
      setOrder({ ...order, archivedAt: null, archivedBy: null });
      setActionSuccess(`Order ${order.referenceNumber} restored to Active Orders queue.`);
      window.setTimeout(() => setActionSuccess(""), 4000);
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "Failed to restore order.");
    } finally {
      setSaving(false);
    }
  };

  const handleExecuteDelete = async () => {
    if (!order || saving) return;
    setSaving(true);
    setError("");
    try {
      await deleteAdminOrder(
        {
          id: order.id,
          referenceNumber: order.referenceNumber,
          total: order.total,
          customerName: order.customer.fullName,
        },
        { hard: hardDelete, reason: deleteReason }
      );
      setDeleteModalOpen(false);
      navigate("/admin/orders", {
        state: {
          flashMessage: `Order ${order.referenceNumber} ${
            hardDelete ? "permanently deleted" : "safely removed"
          }.`,
        },
      });
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "Failed to delete order.");
      setDeleteModalOpen(false);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-400 font-medium">
        Loading order details from database...
      </div>
    );
  }

  if (!order) {
    return (
      <div className="space-y-4">
        <div className="admin-card text-center py-12">
          <h2 className="text-xl font-bold text-slate-900">Order Not Found</h2>
          <p className="text-sm text-slate-500 mt-1">
            This order ID does not exist or was removed from the database.
          </p>
          <Link to="/admin/orders" className="admin-btn admin-btn-secondary mt-4">
            <ArrowLeft size={16} />
            <span>Return to Orders</span>
          </Link>
        </div>
      </div>
    );
  }

  const isPending = order.status === "Pending";
  const isCompleted = ["Delivered", "Completed"].includes(order.status);
  const isCancelled = order.status === "Cancelled";

  return (
    <div className="space-y-6">
      {/* 1. Header Card */}
      <div className="admin-header-card">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link
              to="/admin/orders"
              className="text-xs font-bold text-slate-500 hover:text-slate-900 flex items-center gap-1"
            >
              <ArrowLeft size={12} />
              <span>Orders</span>
            </Link>
            <span className="text-slate-300">/</span>
            <span className="text-xs font-mono font-bold text-[#d4af37]">
              {order.referenceNumber}
            </span>
          </div>
          <h2>Order {order.referenceNumber}</h2>
          <p>
            Placed on{" "}
            {new Date(order.createdAt).toLocaleDateString("en-GH", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <span
            className={`admin-badge text-sm px-3 py-1 ${
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

          {order.archivedAt ? (
            <button
              type="button"
              disabled={saving}
              onClick={() => void handleRestore()}
              className="admin-btn admin-btn-secondary admin-btn-sm text-emerald-700 hover:text-emerald-800"
              title="Restore to active queue"
            >
              <RotateCcw size={14} />
              <span>Restore Order</span>
            </button>
          ) : (
            <button
              type="button"
              disabled={saving}
              onClick={() => void handleArchive()}
              className="admin-btn admin-btn-secondary admin-btn-sm text-slate-700 hover:text-slate-900"
              title="Archive this order"
            >
              <Archive size={14} />
              <span>Archive Order</span>
            </button>
          )}

          <button
            type="button"
            disabled={saving}
            onClick={() => {
              setHardDelete(false);
              setDeleteReason("");
              setDeleteModalOpen(true);
            }}
            className="admin-btn admin-btn-secondary admin-btn-sm text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-200"
            title="Delete this order"
          >
            <Trash2 size={14} />
            <span>Delete</span>
          </button>

          <Link to="/admin/orders" className="admin-btn admin-btn-secondary admin-btn-sm">
            <ArrowLeft size={14} />
            <span>Back to Queue</span>
          </Link>
        </div>
      </div>

      {/* Archived Banner if order is archived */}
      {order.archivedAt && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <Archive size={20} className="text-amber-700 shrink-0" />
            <div>
              <p className="text-xs font-bold text-amber-900">
                This order is currently archived
              </p>
              <p className="text-[0.75rem] text-amber-800">
                Archived on{" "}
                {new Date(order.archivedAt).toLocaleDateString("en-GH", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
                {order.archivedBy ? ` by ${order.archivedBy}` : ""}.
                It is hidden from the active orders queue and excluded from active order counts.
              </p>
            </div>
          </div>
          <button
            type="button"
            disabled={saving}
            onClick={() => void handleRestore()}
            className="admin-btn admin-btn-secondary admin-btn-sm bg-white border-amber-300 text-amber-900 hover:bg-amber-100 shrink-0 font-bold"
          >
            <RotateCcw size={14} />
            <span>Restore to Active Orders</span>
          </button>
        </div>
      )}

      {actionSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between">
          <span>{actionSuccess}</span>
          <button
            type="button"
            onClick={() => setActionSuccess("")}
            className="text-emerald-600 hover:text-emerald-800"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {isTestOrder(order) && (
        <div className="p-4 rounded-xl bg-purple-50 border border-purple-200 text-purple-900 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ShieldAlert size={18} className="text-purple-600 shrink-0" />
            <span>
              <strong>Automated / Dev Test Record:</strong> This order matches known test markers (e.g. Verification Bot, test token, or local test suite). It is excluded from genuine business operational metrics.
            </span>
          </div>
          <span className="px-2.5 py-1 rounded bg-purple-200 text-purple-900 font-bold text-[0.68rem] uppercase tracking-wider shrink-0">
            Test Record
          </span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold">
          {error}
        </div>
      )}

      {/* 2. Order Grid: Items & Customer Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Purchased Items (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="admin-card space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Package size={17} className="text-[#d4af37]" />
                <span>Purchased Product Snapshots ({order.items.length})</span>
              </h3>
            </div>

            <div className="divide-y divide-slate-100">
              {order.items.map((item, idx) => (
                <div key={idx} className="py-3.5 flex items-start gap-4">
                  {item.productImage ? (
                    <img
                      src={item.productImage}
                      alt={item.productName}
                      className="w-16 h-16 rounded-lg object-cover bg-slate-50 border border-slate-200 shrink-0"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-lg bg-slate-100 border border-slate-200 grid place-items-center text-xs text-slate-400 font-semibold shrink-0">
                      No photo
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <h4 className="font-bold text-slate-900 text-sm">{item.productName}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {item.storage ? `${item.storage} | ` : ""}
                      {item.colour ? `${item.colour} | ` : ""}
                      {item.condition || "Standard"}
                    </p>
                    <div className="mt-1 flex items-center gap-3 text-xs">
                      <span className="text-slate-600 font-semibold">
                        Qty: {item.quantity} &times; {formatGhs(item.unitPrice)}
                      </span>
                    </div>
                  </div>

                  <div className="font-extrabold text-slate-900 text-sm">
                    {formatGhs(item.lineTotal)}
                  </div>
                </div>
              ))}
            </div>

            {/* Price Breakdown */}
            <div className="pt-3 border-t border-slate-100 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Items Subtotal</span>
                <span className="font-semibold text-slate-900">{formatGhs(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Delivery Charge</span>
                <span className="font-semibold text-slate-900">
                  {order.deliveryFee === null || order.deliveryFee === undefined
                    ? "To confirm on dispatch"
                    : formatGhs(order.deliveryFee)}
                </span>
              </div>
              <div className="flex justify-between text-sm font-extrabold text-slate-900 pt-2 border-t border-slate-200">
                <span>Total Amount</span>
                <span className="text-base text-slate-900">{formatGhs(order.total)}</span>
              </div>
            </div>
          </div>

          {/* Payment Status Controls Card */}
          <div className="admin-card space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <CreditCard size={16} className="text-[#d4af37]" />
                  <span>Payment &amp; Revenue Status</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Confirm receipt of funds before marking orders as paid. Unpaid requests are not counted as revenue.
                </p>
              </div>
              <span
                className={`admin-badge text-xs px-2.5 py-1 ${
                  order.paymentStatus === "Paid"
                    ? "admin-badge-emerald"
                    : order.paymentStatus === "Pending"
                    ? "admin-badge-amber"
                    : order.paymentStatus === "Refunded"
                    ? "admin-badge-purple"
                    : "admin-badge-rose"
                }`}
              >
                Payment: {order.paymentStatus}
              </span>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              {PAYMENT_STATUSES.map((pst) => (
                <button
                  key={pst}
                  type="button"
                  disabled={saving || pst === order.paymentStatus}
                  onClick={() => void changePaymentStatus(pst)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                    pst === order.paymentStatus
                      ? "bg-slate-900 text-white shadow-sm"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200 disabled:opacity-50"
                  }`}
                >
                  {pst === order.paymentStatus && <CheckCircle2 size={13} className="text-emerald-400" />}
                  <span>{pst}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Status Controls Card */}
          <div className="admin-card space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Truck size={16} className="text-[#d4af37]" />
                  <span>Update Fulfilment Status</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Manage delivery or store pickup progression in the customer queue.
                </p>
              </div>
              <span className="admin-badge admin-badge-blue text-xs px-2.5 py-1">
                Fulfilment: {order.status}
              </span>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              {ORDER_STATUSES.map((st) => (
                <button
                  key={st}
                  type="button"
                  disabled={saving || st === order.status}
                  onClick={() => void changeStatus(st)}
                  className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                    st === order.status
                      ? "bg-slate-900 text-white shadow-sm"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200 disabled:opacity-50"
                  }`}
                >
                  {st === order.status && <CheckCircle2 size={14} className="text-emerald-400" />}
                  <span>{st}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Staff Internal Notes */}
          <div className="admin-card space-y-3">
            <h3 className="font-bold text-slate-900 text-sm">Internal Staff Notes</h3>
            <p className="text-xs text-slate-500">
              Private comments saved directly to database. Visible to authorized staff on all devices.
            </p>
            <form onSubmit={handleSaveStaffNote} className="space-y-2">
              <textarea
                rows={3}
                value={staffNote}
                onChange={(e) => setStaffNote(e.target.value)}
                placeholder="Log internal comments, payment confirmation ref, dispatch rider name or IMEI..."
                className="w-full p-2.5 rounded-lg border border-slate-200 text-xs text-slate-800 bg-slate-50 focus:bg-white focus:outline-none"
              />
              <div className="flex items-center justify-between">
                <span className="text-[0.72rem] text-slate-400">
                  {noteSaved ? (
                    <span className="text-emerald-600 font-bold">Saved to database!</span>
                  ) : (
                    "Persisted to Supabase orders.admin_note"
                  )}
                </span>
                <button type="submit" disabled={saving} className="admin-btn admin-btn-secondary admin-btn-sm">
                  <Save size={13} />
                  <span>{saving ? "Saving..." : "Save Note"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right: Customer & Fulfilment Details (1 col) */}
        <div className="space-y-6">
          <div className="admin-card space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
              <User size={18} className="text-[#d4af37]" />
              <h3 className="font-bold text-slate-900 text-sm">Customer Profile</h3>
            </div>

            <div className="space-y-2.5 text-xs">
              <div>
                <span className="text-slate-400 block font-medium">Customer Full Name</span>
                <span className="font-bold text-slate-900 text-sm">{order.customer.fullName}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Primary Phone</span>
                <span className="font-bold text-slate-900">{order.customer.phone}</span>
              </div>
              {order.customer.whatsapp && (
                <div>
                  <span className="text-slate-400 block font-medium">WhatsApp Number</span>
                  <span className="font-bold text-emerald-700">+{order.customer.whatsapp}</span>
                </div>
              )}
              {order.customer.email && (
                <div>
                  <span className="text-slate-400 block font-medium">Email Address</span>
                  <span className="font-medium text-slate-800">{order.customer.email}</span>
                </div>
              )}
            </div>

            {/* Quick Contact Triggers */}
            <div className="pt-2 flex flex-col gap-2">
              <a
                href={orderRequestWhatsAppUrl(order)}
                target="_blank"
                rel="noopener noreferrer"
                className="admin-btn admin-btn-secondary w-full text-emerald-700 border-emerald-200 bg-emerald-50/50 hover:bg-emerald-50 text-xs"
              >
                <MessageCircle size={15} />
                <span>Contact on WhatsApp</span>
              </a>
              <a
                href={`tel:${order.customer.phone}`}
                className="admin-btn admin-btn-secondary w-full text-xs"
              >
                <Phone size={14} />
                <span>Call Customer Directly</span>
              </a>
            </div>
          </div>

          <div className="admin-card space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
              <Truck size={18} className="text-[#d4af37]" />
              <h3 className="font-bold text-slate-900 text-sm">Fulfilment &amp; Destination</h3>
            </div>

            <div className="space-y-2.5 text-xs">
              <div>
                <span className="text-slate-400 block font-medium">Method</span>
                <span className="admin-badge admin-badge-slate mt-0.5">
                  {order.customer.fulfilmentType === "delivery" ? "Doorstep Delivery" : "Store Pickup"}
                </span>
              </div>

              {order.customer.deliveryAddress && (
                <div>
                  <span className="text-slate-400 block font-medium">Delivery Address</span>
                  <span className="font-semibold text-slate-900 block mt-0.5">
                    {order.customer.deliveryAddress}
                  </span>
                </div>
              )}

              {order.customer.landmark && (
                <div>
                  <span className="text-slate-400 block font-medium">Landmark / Directions</span>
                  <span className="font-medium text-slate-800 block mt-0.5">
                    {order.customer.landmark}
                  </span>
                </div>
              )}

              {order.customer.city && (
                <div>
                  <span className="text-slate-400 block font-medium">City &amp; Region</span>
                  <span className="font-medium text-slate-800">
                    {order.customer.city}
                    {order.customer.region ? `, ${order.customer.region}` : ""}
                  </span>
                </div>
              )}

              <div>
                <span className="text-slate-400 block font-medium">Payment Preference</span>
                <span className="font-semibold text-slate-900 block mt-0.5">
                  {order.customer.preferredPaymentMethod}
                </span>
              </div>

              {order.customer.additionalNote && (
                <div className="p-3 rounded-lg bg-amber-50/60 border border-amber-200/60 mt-2">
                  <span className="text-amber-800 font-bold block text-[0.7rem] uppercase">
                    Customer Special Note:
                  </span>
                  <p className="text-slate-700 mt-1">{order.customer.additionalNote}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Safe Delete Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-6">
              <div className="w-12 h-12 rounded-xl bg-rose-50 border border-rose-200 grid place-items-center mb-4">
                <AlertTriangle size={24} className="text-rose-600" />
              </div>

              <h3 className="text-lg font-bold text-slate-900">Delete Order Safely</h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                You are about to remove order{" "}
                <span className="font-mono font-bold text-slate-900">
                  {order.referenceNumber}
                </span>{" "}
                ({formatGhs(order.total)} &bull; {order.customer.fullName}).
              </p>

              {/* Deletion Mode selector */}
              <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="radio"
                    name="deleteMode"
                    checked={!hardDelete}
                    onChange={() => setHardDelete(false)}
                    className="mt-0.5 text-slate-900 focus:ring-slate-900"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">
                      Soft Delete (Recommended)
                    </span>
                    <span className="text-[0.72rem] text-slate-500 block leading-tight">
                      Hides order from all views while preserving historical revenue, customer record, and audit log.
                    </span>
                  </div>
                </label>

                <div className="border-t border-slate-200/80 my-1" />

                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="radio"
                    name="deleteMode"
                    checked={hardDelete}
                    onChange={() => setHardDelete(true)}
                    className="mt-0.5 text-rose-600 focus:ring-rose-600"
                  />
                  <div>
                    <span className="text-xs font-bold text-rose-700 block">
                      Permanent Hard Delete
                    </span>
                    <span className="text-[0.72rem] text-slate-500 block leading-tight">
                      Requires AAL2 MFA admin permission. Writes full snapshot to audit log, then purges order records. Customers and products are never deleted.
                    </span>
                  </div>
                </label>
              </div>

              {/* Optional Reason */}
              <div className="mt-4">
                <label className="block text-[0.72rem] font-bold text-slate-700 mb-1">
                  Reason for Deletion (Logged in Audit History):
                </label>
                <input
                  type="text"
                  value={deleteReason}
                  onChange={(e) => setDeleteReason(e.target.value)}
                  placeholder="e.g. Duplicate order, test run, customer canceled..."
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#d4af37]/30"
                />
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2.5">
              <button
                type="button"
                disabled={saving}
                onClick={() => setDeleteModalOpen(false)}
                className="admin-btn admin-btn-secondary admin-btn-sm"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={() => void handleExecuteDelete()}
                className={`admin-btn admin-btn-sm font-bold text-white shadow-xs ${
                  hardDelete
                    ? "bg-rose-700 hover:bg-rose-800"
                    : "bg-slate-900 hover:bg-slate-800"
                }`}
              >
                <Trash2 size={13} />
                <span>
                  {saving
                    ? "Deleting..."
                    : hardDelete
                    ? "Permanently Purge"
                    : "Safely Remove"}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
