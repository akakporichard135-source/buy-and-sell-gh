import {
  AlertTriangle,
  Archive,
  Check,
  CheckCheck,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  FileSpreadsheet,
  Filter,
  MessageCircle,
  MoreHorizontal,
  Package,
  RefreshCw,
  RotateCcw,
  Search,
  ShieldAlert,
  ShoppingBag,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ADMIN_NEW_ORDER_EVENT } from "../../admin/AdminOrderNotifications";
import {
  archiveAdminOrder,
  archiveAdminOrdersBulk,
  clearCompletedOrders,
  deleteAdminOrder,
  deleteAdminOrdersBulk,
  fetchAdminOrders,
  restoreAdminOrder,
  restoreAdminOrdersBulk,
} from "../../orders/supabaseOrderRepository";
import {
  ORDER_STATUSES,
  isTestOrder,
  type OrderStatus,
  type StoredOrderRequest,
} from "../../types/order";
import { formatGhs } from "../../utils/format";

type ViewTab = "active" | "archived";

export function AdminOrdersPage() {
  const location = useLocation();
  const [orders, setOrders] = useState<StoredOrderRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [query, setQuery] = useState("");
  const [viewTab, setViewTab] = useState<ViewTab>("active");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [orderCategory, setOrderCategory] = useState<"genuine" | "all" | "test">("genuine");
  const [loadVersion, setLoadVersion] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

  useEffect(() => {
    if (location.state && typeof location.state === "object" && "flashMessage" in location.state) {
      const msg = (location.state as { flashMessage?: string }).flashMessage;
      if (msg) {
        setSuccessMessage(msg);
        window.setTimeout(() => setSuccessMessage(""), 4000);
        window.history.replaceState({}, document.title);
      }
    }
  }, [location.state]);

  // Bulk selection state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Dropdown actions menu tracking
  const [openActionId, setOpenActionId] = useState<string | null>(null);

  // Modal dialog states
  const [deleteTarget, setDeleteTarget] = useState<{
    orders: StoredOrderRequest[];
    hard: boolean;
    reason: string;
  } | null>(null);
  const [deleteModalError, setDeleteModalError] = useState("");
  const [clearCompletedOpen, setClearCompletedOpen] = useState(false);
  const [actionBusy, setActionBusy] = useState(false);

  // Close actions dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest(".order-action-container")) {
        setOpenActionId(null);
      }
    };
    window.addEventListener("click", handleClickOutside);
    return () => window.removeEventListener("click", handleClickOutside);
  }, []);

  // Reset pagination & selection when filters change
  useEffect(() => {
    setCurrentPage(1);
    setSelectedIds(new Set());
  }, [query, viewTab, statusFilter, orderCategory]);

  // Load orders from database
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
      .catch((err) => {
        if (active) {
          const msg = err instanceof Error ? err.message : String(err);
          setError(`Orders could not be loaded: ${msg}`);
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [loadVersion]);

  // Real-time order notification listener
  useEffect(() => {
    const refreshOrders = () => setLoadVersion((value) => value + 1);
    window.addEventListener(ADMIN_NEW_ORDER_EVENT, refreshOrders);
    return () => window.removeEventListener(ADMIN_NEW_ORDER_EVENT, refreshOrders);
  }, []);

  const showNotification = (msg: string) => {
    setSuccessMessage(msg);
    window.setTimeout(() => setSuccessMessage(""), 4000);
  };

  // Base categorization (genuine vs test)
  const categoryFilteredOrders = useMemo(() => {
    if (orderCategory === "genuine") return orders.filter((o) => !isTestOrder(o));
    if (orderCategory === "test") return orders.filter((o) => isTestOrder(o));
    return orders;
  }, [orders, orderCategory]);

  // Partition into Active vs Archived
  const activeOrders = useMemo(
    () => categoryFilteredOrders.filter((o) => !o.archivedAt && !o.deletedAt),
    [categoryFilteredOrders]
  );

  const archivedOrders = useMemo(
    () => categoryFilteredOrders.filter((o) => Boolean(o.archivedAt) && !o.deletedAt),
    [categoryFilteredOrders]
  );

  const currentTabOrders = viewTab === "active" ? activeOrders : archivedOrders;

  // Counts by genuine vs test
  const { genuineCount, testCount } = useMemo(() => {
    let genuine = 0;
    let test = 0;
    orders.forEach((o) => {
      if (isTestOrder(o)) test++;
      else genuine++;
    });
    return { genuineCount: genuine, testCount: test };
  }, [orders]);

  // Active completed orders available to clear
  const completedActiveOrders = useMemo(() => {
    return activeOrders.filter((o) => ["Delivered", "Completed"].includes(o.status));
  }, [activeOrders]);

  // Status breakdown counts
  const countsByStatus = useMemo(() => {
    const counts: Record<string, number> = {
      All: currentTabOrders.length,
      Completed: 0,
    };
    ORDER_STATUSES.forEach((st) => (counts[st] = 0));
    currentTabOrders.forEach((o) => {
      if (counts[o.status] !== undefined) counts[o.status]++;
      if (["Delivered", "Completed"].includes(o.status)) counts.Completed++;
    });
    return counts;
  }, [currentTabOrders]);

  // Filtered list based on search and status
  const filtered = useMemo(() => {
    const search = query.trim().toLowerCase();
    return currentTabOrders.filter((order) => {
      const searchable = [
        order.referenceNumber,
        order.customer.fullName,
        order.customer.phone,
        order.customer.whatsapp || "",
        order.customer.email || "",
        ...(order.items?.map((i) => i.productName) || []),
      ]
        .join(" ")
        .toLowerCase();

      const matchesSearch = !search || searchable.includes(search);
      let matchesStatus = true;
      if (statusFilter === "All") {
        matchesStatus = true;
      } else if (statusFilter === "Completed") {
        matchesStatus = ["Delivered", "Completed"].includes(order.status);
      } else {
        matchesStatus = order.status === statusFilter;
      }

      return matchesSearch && matchesStatus;
    });
  }, [currentTabOrders, query, statusFilter]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage, pageSize]);

  // Selection helpers
  const allCurrentSelected =
    paginatedOrders.length > 0 && paginatedOrders.every((o) => selectedIds.has(o.id));

  const toggleSelectAllPage = () => {
    const next = new Set(selectedIds);
    if (allCurrentSelected) {
      paginatedOrders.forEach((o) => next.delete(o.id));
    } else {
      paginatedOrders.forEach((o) => next.add(o.id));
    }
    setSelectedIds(next);
  };

  const toggleSelectOrder = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const selectedOrdersList = useMemo(() => {
    return orders.filter((o) => selectedIds.has(o.id));
  }, [orders, selectedIds]);

  // Action handlers
  const handleArchiveSingle = async (order: StoredOrderRequest) => {
    setActionBusy(true);
    setOpenActionId(null);
    try {
      await archiveAdminOrder(order.id, order.referenceNumber);
      setOrders((prev) =>
        prev.map((o) =>
          o.id === order.id ? { ...o, archivedAt: new Date().toISOString() } : o
        )
      );
      showNotification(`Order ${order.referenceNumber} moved to Archived Orders.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to archive order.");
    } finally {
      setActionBusy(false);
    }
  };

  const handleRestoreSingle = async (order: StoredOrderRequest) => {
    setActionBusy(true);
    setOpenActionId(null);
    try {
      await restoreAdminOrder(order.id, order.referenceNumber);
      setOrders((prev) =>
        prev.map((o) =>
          o.id === order.id ? { ...o, archivedAt: null, archivedBy: null } : o
        )
      );
      showNotification(`Order ${order.referenceNumber} restored to Active Orders.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to restore order.");
    } finally {
      setActionBusy(false);
    }
  };

  const handleBulkArchive = async () => {
    if (selectedOrdersList.length === 0 || actionBusy) return;
    setActionBusy(true);
    try {
      await archiveAdminOrdersBulk(
        selectedOrdersList.map((o) => ({ id: o.id, referenceNumber: o.referenceNumber }))
      );
      const now = new Date().toISOString();
      setOrders((prev) =>
        prev.map((o) => (selectedIds.has(o.id) ? { ...o, archivedAt: now } : o))
      );
      showNotification(`${selectedOrdersList.length} orders moved to Archived.`);
      setSelectedIds(new Set());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to archive selected orders.");
    } finally {
      setActionBusy(false);
    }
  };

  const handleBulkRestore = async () => {
    if (selectedOrdersList.length === 0 || actionBusy) return;
    setActionBusy(true);
    try {
      await restoreAdminOrdersBulk(
        selectedOrdersList.map((o) => ({ id: o.id, referenceNumber: o.referenceNumber }))
      );
      setOrders((prev) =>
        prev.map((o) =>
          selectedIds.has(o.id) ? { ...o, archivedAt: null, archivedBy: null } : o
        )
      );
      showNotification(`${selectedOrdersList.length} orders restored to Active.`);
      setSelectedIds(new Set());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to restore selected orders.");
    } finally {
      setActionBusy(false);
    }
  };

  const handleClearCompleted = async () => {
    if (completedActiveOrders.length === 0 || actionBusy) return;
    setActionBusy(true);
    try {
      await clearCompletedOrders(
        completedActiveOrders.map((o) => ({ id: o.id, referenceNumber: o.referenceNumber }))
      );
      const now = new Date().toISOString();
      const clearedIds = new Set(completedActiveOrders.map((o) => o.id));
      setOrders((prev) =>
        prev.map((o) => (clearedIds.has(o.id) ? { ...o, archivedAt: now } : o))
      );
      showNotification(
        `${completedActiveOrders.length} completed orders archived and cleared from active queue.`
      );
      setClearCompletedOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to clear completed orders.");
    } finally {
      setActionBusy(false);
    }
  };

  const handleExecuteDelete = async () => {
    if (!deleteTarget || deleteTarget.orders.length === 0 || actionBusy) return;
    setActionBusy(true);
    setDeleteModalError("");
    try {
      const targetList = deleteTarget.orders;
      if (targetList.length === 1) {
        await deleteAdminOrder(
          {
            id: targetList[0].id,
            referenceNumber: targetList[0].referenceNumber,
            total: targetList[0].total,
            customerName: targetList[0].customer.fullName,
          },
          { hard: deleteTarget.hard, reason: deleteTarget.reason }
        );
      } else {
        await deleteAdminOrdersBulk(
          targetList.map((o) => ({
            id: o.id,
            referenceNumber: o.referenceNumber,
            total: o.total,
            customerName: o.customer.fullName,
          })),
          { hard: deleteTarget.hard, reason: deleteTarget.reason }
        );
      }

      const deletedIds = new Set(targetList.map((o) => o.id));
      setOrders((prev) => prev.filter((o) => !deletedIds.has(o.id)));
      setSelectedIds((prev) => {
        const next = new Set(prev);
        deletedIds.forEach((id) => next.delete(id));
        return next;
      });

      showNotification(
        targetList.length === 1
          ? `Order ${targetList[0].referenceNumber} ${deleteTarget.hard ? "permanently deleted" : "safely removed"}.`
          : `${targetList.length} orders ${deleteTarget.hard ? "permanently deleted" : "safely removed"}.`
      );
      setDeleteTarget(null);
      setDeleteModalError("");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to delete order(s).";
      setDeleteModalError(msg);
      setError(msg);
    } finally {
      setActionBusy(false);
    }
  };

  // CSV Export
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
      "Is Archived",
      "Archived At",
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
        o.archivedAt ? "YES" : "NO",
        `"${o.archivedAt || ""}"`,
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
    link.setAttribute(
      "download",
      `buyandsellgh-orders-${viewTab}-${orderCategory}-${timestamp}.csv`
    );
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
              Order Management
            </span>
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-slate-300" />
            <span className="text-xs font-semibold text-slate-500">
              {viewTab === "active" ? "Active Customer Queue" : "Archived Orders Vault"}
            </span>
          </div>
          <h2>Customer Order Requests</h2>
          <p>
            Review active customer orders, manage order archiving and restorations, safely purge
            unwanted test orders, and clear completed queues with full audit preservation.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {viewTab === "active" && completedActiveOrders.length > 0 && (
            <button
              className="admin-btn admin-btn-secondary admin-btn-sm"
              type="button"
              onClick={() => setClearCompletedOpen(true)}
              title="Archive completed orders to clean up active queue"
            >
              <CheckCheck size={14} className="text-emerald-600" />
              <span>Clear Completed ({completedActiveOrders.length})</span>
            </button>
          )}

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

      {/* Notifications */}
      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between shadow-sm animate-fadeIn">
          <div className="flex items-center gap-2">
            <Check size={16} className="text-emerald-600" />
            <span>{successMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setSuccessMessage("")}
            className="text-emerald-700 hover:text-emerald-900"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center justify-between shadow-sm">
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

      {/* 2. Top-level View Tabs: Active Queue vs Archived Vault */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-white border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setViewTab("active")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
              viewTab === "active"
                ? "bg-slate-900 text-white shadow-sm"
                : "bg-slate-50 text-slate-600 hover:bg-slate-100"
            }`}
          >
            <Package size={15} />
            <span>Active Orders ({activeOrders.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setViewTab("archived")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
              viewTab === "archived"
                ? "bg-amber-600 text-white shadow-sm"
                : "bg-slate-50 text-slate-600 hover:bg-slate-100"
            }`}
          >
            <Archive size={15} />
            <span>Archived Orders ({archivedOrders.length})</span>
          </button>
        </div>

        {/* Genuine vs Test Filter */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setOrderCategory("genuine")}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              orderCategory === "genuine"
                ? "bg-slate-800 text-white"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            Genuine ({genuineCount})
          </button>
          <button
            type="button"
            onClick={() => setOrderCategory("test")}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              orderCategory === "test"
                ? "bg-slate-800 text-white"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            Dev Test ({testCount})
          </button>
          <button
            type="button"
            onClick={() => setOrderCategory("all")}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              orderCategory === "all"
                ? "bg-slate-800 text-white"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            All
          </button>
        </div>
      </div>

      {/* 3. Filter & Search Toolbar */}
      <div className="admin-toolbar">
        <div className="admin-search-input">
          <Search size={16} className="text-slate-400 shrink-0" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by order reference, customer name, phone, or email..."
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mr-1">
            Status:
          </span>
          <button
            type="button"
            onClick={() => setStatusFilter("All")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              statusFilter === "All"
                ? "bg-slate-900 text-white shadow-sm"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            All ({countsByStatus.All})
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter("Pending")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              statusFilter === "Pending"
                ? "bg-slate-900 text-white shadow-sm"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            Pending {countsByStatus.Pending > 0 && `(${countsByStatus.Pending})`}
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter("Processing")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              statusFilter === "Processing"
                ? "bg-slate-900 text-white shadow-sm"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            Processing {countsByStatus.Processing > 0 && `(${countsByStatus.Processing})`}
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter("Completed")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              statusFilter === "Completed"
                ? "bg-slate-900 text-white shadow-sm"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            Completed {countsByStatus.Completed > 0 && `(${countsByStatus.Completed})`}
          </button>

          {ORDER_STATUSES.filter(
            (st) => !["Pending", "Processing", "Delivered", "Completed"].includes(st)
          ).map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                statusFilter === st
                  ? "bg-slate-900 text-white shadow-sm"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              {st} {countsByStatus[st] > 0 && `(${countsByStatus[st]})`}
            </button>
          ))}
        </div>
      </div>

      {/* Floating / Sticky Bulk Action Bar */}
      {selectedIds.size > 0 && (
        <div className="sticky top-20 z-30 p-3 rounded-xl bg-slate-900 text-white shadow-xl flex flex-wrap items-center justify-between gap-3 animate-fadeIn">
          <div className="flex items-center gap-2 text-xs font-bold">
            <span className="w-6 h-6 rounded-full bg-gold-dark text-black grid place-items-center font-black">
              {selectedIds.size}
            </span>
            <span>order{selectedIds.size === 1 ? "" : "s"} selected</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {viewTab === "active" ? (
              <button
                type="button"
                onClick={handleBulkArchive}
                disabled={actionBusy}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <Archive size={14} className="text-amber-400" />
                <span>Archive Selected ({selectedIds.size})</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleBulkRestore}
                disabled={actionBusy}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <RotateCcw size={14} className="text-emerald-400" />
                <span>Restore Selected ({selectedIds.size})</span>
              </button>
            )}

            <button
              type="button"
              onClick={() =>
                setDeleteTarget({
                  orders: selectedOrdersList,
                  hard: false,
                  reason: "Bulk deletion by administrator",
                })
              }
              disabled={actionBusy}
              className="px-3 py-1.5 rounded-lg bg-rose-900/80 hover:bg-rose-800 text-rose-200 text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <Trash2 size={14} />
              <span>Delete Selected</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedIds(new Set())}
              className="px-2.5 py-1.5 rounded-lg text-slate-400 hover:text-white text-xs font-medium"
            >
              Deselect All
            </button>
          </div>
        </div>
      )}

      {/* 4. Streamlined Desktop Orders Table */}
      <div className="admin-table-shell hidden md:block">
        <div className="admin-table-scroll">
          <table className="admin-data-table">
            <thead>
              <tr>
                <th style={{ width: "4%" }}>
                  <input
                    type="checkbox"
                    checked={allCurrentSelected}
                    onChange={toggleSelectAllPage}
                    className="w-4 h-4 rounded text-slate-900 cursor-pointer"
                    aria-label="Select all orders on this page"
                  />
                </th>
                <th style={{ width: "18%" }}>Order &amp; Date</th>
                <th style={{ width: "22%" }}>Customer</th>
                <th style={{ width: "22%" }}>Purchased Items</th>
                <th style={{ width: "16%" }}>Total &amp; Payment</th>
                <th style={{ width: "10%" }}>Status</th>
                <th style={{ width: "8%", textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-400 font-medium">
                    Loading customer orders...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-400 font-medium">
                    {viewTab === "archived"
                      ? "No archived orders found."
                      : "No orders match the selected filters."}
                  </td>
                </tr>
              ) : (
                paginatedOrders.map((order) => {
                  const isPending = order.status === "Pending";
                  const isCompleted = ["Delivered", "Completed"].includes(order.status);
                  const isCancelled = order.status === "Cancelled";
                  const isTest = isTestOrder(order);
                  const isArchived = Boolean(order.archivedAt);
                  const isSelected = selectedIds.has(order.id);

                  return (
                    <tr
                      key={order.id}
                      className={`hover:bg-slate-50/70 transition-colors ${
                        isSelected ? "bg-amber-50/40" : ""
                      }`}
                    >
                      {/* Checkbox */}
                      <td>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectOrder(order.id)}
                          className="w-4 h-4 rounded text-slate-900 cursor-pointer"
                          aria-label={`Select order ${order.referenceNumber}`}
                        />
                      </td>

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
                          <div className="flex items-center gap-1 mt-0.5">
                            {isArchived && (
                              <span className="inline-flex items-center gap-0.5 text-[0.65rem] px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 font-bold">
                                <Archive size={10} /> Archived
                              </span>
                            )}
                            {isTest && (
                              <span className="inline-block text-[0.65rem] px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 font-bold">
                                Dev Test
                              </span>
                            )}
                          </div>
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

                      {/* 6. Actions Menu */}
                      <td style={{ textAlign: "right" }} className="order-action-container relative">
                        <div className="inline-flex items-center justify-end gap-1">
                          <Link
                            to={`/admin/orders/${order.id}`}
                            className="admin-btn admin-btn-secondary admin-btn-sm"
                            title="View order details"
                          >
                            <Eye size={13} />
                            <span>Details</span>
                          </Link>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenActionId(openActionId === order.id ? null : order.id);
                            }}
                            className="admin-btn admin-btn-secondary admin-btn-sm px-1.5"
                            aria-label={`Actions for order ${order.referenceNumber}`}
                          >
                            <MoreHorizontal size={15} />
                          </button>
                        </div>

                        {/* Dropdown Menu */}
                        {openActionId === order.id && (
                          <div className="absolute right-0 mt-1 w-44 rounded-xl bg-white border border-slate-200 shadow-xl py-1 z-40 text-left animate-fadeIn">
                            <Link
                              to={`/admin/orders/${order.id}`}
                              className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                              onClick={() => setOpenActionId(null)}
                            >
                              <Eye size={13} className="text-slate-500" />
                              <span>View Details</span>
                            </Link>

                            {isArchived ? (
                              <button
                                type="button"
                                onClick={() => handleRestoreSingle(order)}
                                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 transition-colors"
                              >
                                <RotateCcw size={13} />
                                <span>Restore Order</span>
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleArchiveSingle(order)}
                                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-amber-700 hover:bg-amber-50 transition-colors"
                              >
                                <Archive size={13} />
                                <span>Archive Order</span>
                              </button>
                            )}

                            <div className="border-t border-slate-100 my-1" />

                            <button
                              type="button"
                              onClick={() => {
                                setOpenActionId(null);
                                setDeleteTarget({
                                  orders: [order],
                                  hard: false,
                                  reason: "Manual deletion from row action menu",
                                });
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
                            >
                              <Trash2 size={13} />
                              <span>Delete Order</span>
                            </button>
                          </div>
                        )}
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
            {viewTab === "archived"
              ? "No archived orders found."
              : "No orders match the selected filters."}
          </div>
        ) : (
          paginatedOrders.map((order) => {
            const isPending = order.status === "Pending";
            const isCompleted = ["Delivered", "Completed"].includes(order.status);
            const isCancelled = order.status === "Cancelled";
            const isTest = isTestOrder(order);
            const isArchived = Boolean(order.archivedAt);
            const isSelected = selectedIds.has(order.id);

            return (
              <div
                key={order.id}
                className={`admin-card p-4 flex flex-col gap-3 transition-colors ${
                  isSelected ? "border-amber-400 bg-amber-50/20" : ""
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2.5">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelectOrder(order.id)}
                      className="w-4 h-4 mt-0.5 rounded text-slate-900 cursor-pointer"
                      aria-label={`Select order ${order.referenceNumber}`}
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <Link
                          to={`/admin/orders/${order.id}`}
                          className="font-mono font-bold text-slate-900 text-sm hover:text-[#d4af37]"
                        >
                          {order.referenceNumber}
                        </Link>
                        {isArchived && (
                          <span className="text-[0.65rem] px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 font-bold flex items-center gap-0.5">
                            <Archive size={10} /> Archived
                          </span>
                        )}
                        {isTest && (
                          <span className="text-[0.65rem] px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 font-bold">
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

                  <div className="flex items-center gap-1.5">
                    {isArchived ? (
                      <button
                        type="button"
                        onClick={() => handleRestoreSingle(order)}
                        className="admin-btn admin-btn-secondary admin-btn-sm"
                        title="Restore to active queue"
                      >
                        <RotateCcw size={13} className="text-emerald-600" />
                        <span>Restore</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleArchiveSingle(order)}
                        className="admin-btn admin-btn-secondary admin-btn-sm"
                        title="Archive order"
                      >
                        <Archive size={13} className="text-amber-600" />
                        <span>Archive</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() =>
                        setDeleteTarget({
                          orders: [order],
                          hard: false,
                          reason: "Mobile order deletion",
                        })
                      }
                      className="admin-btn admin-btn-secondary admin-btn-sm text-rose-600 hover:text-rose-700"
                      title="Delete order"
                    >
                      <Trash2 size={13} />
                    </button>

                    <Link
                      to={`/admin/orders/${order.id}`}
                      className="admin-btn admin-btn-secondary admin-btn-sm"
                    >
                      <Eye size={13} />
                      <span>Details</span>
                    </Link>
                  </div>
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

      {/* MODAL 1: Safe Deletion Confirmation Dialog */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-6">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                  <AlertTriangle size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">
                    {deleteTarget.orders.length === 1
                      ? `Delete Order ${deleteTarget.orders[0].referenceNumber}?`
                      : `Delete ${deleteTarget.orders.length} Selected Orders?`}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Manage how this order is removed. Customer accounts, products, and inventory
                    records are strictly preserved.
                  </p>
                </div>
              </div>

              {/* Order Target Summary */}
              <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-200 max-h-40 overflow-y-auto">
                {deleteTarget.orders.map((o) => (
                  <div
                    key={o.id}
                    className="flex items-center justify-between py-1.5 border-b border-slate-200/60 last:border-0 text-xs"
                  >
                    <div>
                      <span className="font-mono font-bold text-slate-800">{o.referenceNumber}</span>
                      <span className="text-slate-500 ml-2">{o.customer.fullName}</span>
                    </div>
                    <div className="font-extrabold text-slate-900">{formatGhs(o.total)}</div>
                  </div>
                ))}
              </div>

              {/* Deletion Type Choice */}
              <div className="mt-4 space-y-2.5">
                <label className="flex items-start gap-2.5 p-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50/50 cursor-pointer">
                  <input
                    type="radio"
                    name="deleteMode"
                    checked={!deleteTarget.hard}
                    onChange={() => setDeleteTarget({ ...deleteTarget, hard: false })}
                    className="mt-0.5 text-slate-900 cursor-pointer"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">
                      Soft Delete (Recommended)
                    </span>
                    <span className="text-[0.72rem] text-slate-500 leading-relaxed block mt-0.5">
                      Hides order from active and archived views. Preserves financial audit and
                      transaction history. Can be restored if needed.
                    </span>
                  </div>
                </label>

                <label className="flex items-start gap-2.5 p-3 rounded-xl border border-rose-200 bg-rose-50/30 hover:bg-rose-50/60 cursor-pointer">
                  <input
                    type="radio"
                    name="deleteMode"
                    checked={deleteTarget.hard}
                    onChange={() => setDeleteTarget({ ...deleteTarget, hard: true })}
                    className="mt-0.5 text-rose-600 cursor-pointer"
                  />
                  <div>
                    <span className="text-xs font-bold text-rose-900 block">
                      Permanent Purge (Hard Delete)
                    </span>
                    <span className="text-[0.72rem] text-rose-700/80 leading-relaxed block mt-0.5">
                      Permanently destroys order &amp; items from database. Recommended only for
                      developer test orders or spam entries. Action is logged with your admin ID.
                    </span>
                  </div>
                </label>
              </div>

              {/* Reason input */}
              <div className="mt-3">
                <label className="text-[0.72rem] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Reason for deletion (Optional):
                </label>
                <input
                  type="text"
                  value={deleteTarget.reason}
                  onChange={(e) => setDeleteTarget({ ...deleteTarget, reason: e.target.value })}
                  placeholder="e.g. Test order / Cancelled duplicate / Customer request"
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-200 bg-white outline-none focus:border-slate-800"
                />
              </div>

              {/* Error banner if deletion failed */}
              {deleteModalError && (
                <div className="mt-3 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
                  <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{deleteModalError}</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2.5 p-4 bg-slate-50 border-t border-slate-200">
              <button
                type="button"
                onClick={() => {
                  setDeleteTarget(null);
                  setDeleteModalError("");
                }}
                disabled={actionBusy}
                className="admin-btn admin-btn-secondary admin-btn-sm"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteDelete}
                disabled={actionBusy}
                className="admin-btn admin-btn-sm bg-rose-600 hover:bg-rose-700 text-white font-bold flex items-center gap-1.5"
              >
                <Trash2 size={14} className={actionBusy ? "animate-spin" : ""} />
                <span>{actionBusy ? "Processing..." : "Confirm Delete"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Clear Completed Orders Confirmation Dialog */}
      {clearCompletedOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-6">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                  <Archive size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">
                    Clear Completed Orders?
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    This will safely move all{" "}
                    <strong className="text-slate-800">
                      {completedActiveOrders.length} completed orders
                    </strong>{" "}
                    to the Archived tab, cleaning up your active queue.
                  </p>
                </div>
              </div>

              <div className="mt-4 p-3 rounded-xl bg-amber-50/70 border border-amber-200 text-xs text-amber-900 leading-relaxed">
                <strong>Safety Guarantee:</strong> No customer data, payment records, or items are
                deleted. All {completedActiveOrders.length} orders remain fully searchable and
                viewable under <em>Archived Orders</em> and can be restored at any time.
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 p-4 bg-slate-50 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setClearCompletedOpen(false)}
                disabled={actionBusy}
                className="admin-btn admin-btn-secondary admin-btn-sm"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleClearCompleted}
                disabled={actionBusy}
                className="admin-btn admin-btn-sm bg-slate-900 hover:bg-slate-800 text-white font-bold flex items-center gap-1.5"
              >
                <Archive size={14} className={actionBusy ? "animate-spin" : ""} />
                <span>
                  {actionBusy
                    ? "Archiving..."
                    : `Archive ${completedActiveOrders.length} Orders`}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
