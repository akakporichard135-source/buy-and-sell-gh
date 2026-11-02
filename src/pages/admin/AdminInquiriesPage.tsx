import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import {
  AlertTriangle,
  Archive,
  CheckCircle2,
  Clock,
  ExternalLink,
  Gift,
  HelpCircle,
  Inbox,
  MessageCircle,
  MessageSquare,
  PackageCheck,
  Plus,
  RefreshCw,
  RotateCcw,
  Search,
  Share2,
  Tag,
  Trash2,
  Wrench,
  X,
} from "lucide-react";
import {
  archiveServiceRequest,
  deleteServiceRequest,
  listServiceRequests,
  logDirectServiceRequest,
  restoreServiceRequest,
  updateServiceRequest,
  type ServiceRequest,
  type ServiceStatus,
  type ServiceType,
} from "../../services/serviceRequestRepository";

type Mode = "service-requests" | "trade-ins" | "device-requests" | "contact-messages";
type DisplayRequest = ServiceRequest & { legacy?: boolean };
type ViewTab = "active" | "archived";

const serviceNames: Record<ServiceType, string> = {
  installment: "Installment Payment",
  repair: "Expert Repairs",
  "trade-in": "Trade-In",
  upgrade: "Upgrade & Save",
  "visa-card": "Visa Card Trading",
  "pre-order": "Pre-Order",
  referral: "Refer a Friend",
  contact: "Contact",
};

const statuses: ServiceStatus[] = ["New", "In Review", "Contacted", "Completed", "Closed"];
const legacyKey = "buyandsell_gh_admin_inquiries_v2";

function readLegacy(): DisplayRequest[] {
  try {
    const rows = JSON.parse(localStorage.getItem(legacyKey) ?? "[]") as Record<string, unknown>[];
    if (!Array.isArray(rows)) return [];
    return rows
      .filter((item) => typeof item.id === "string" && !["inq-101", "inq-102", "inq-201", "inq-301"].includes(item.id))
      .map((item) => {
        const type: ServiceType =
          item.type === "trade-in"
            ? "trade-in"
            : item.type === "device-request"
            ? "pre-order"
            : "contact";
        const details = Object.fromEntries(
          [
            "deviceType",
            "brand",
            "model",
            "storage",
            "condition",
            "desiredAction",
            "replacementDevice",
            "budget",
            "message",
          ]
            .filter((key) => typeof item[key] === "string" && item[key])
            .map((key) => [key, String(item[key])])
        );
        return {
          id: String(item.id),
          reference: String(item.id),
          service_type: type,
          customer_name: String(item.customerName ?? ""),
          phone: String(item.phone ?? ""),
          details,
          status:
            item.status === "Under Review" || item.status === "Appraised"
              ? "In Review"
              : item.status === "Archived"
              ? "Closed"
              : (item.status as ServiceStatus) || "New",
          admin_notes: String(item.adminNotes ?? ""),
          source: "Legacy browser entry",
          created_at: String(item.createdAt ?? new Date(0).toISOString()),
          archived_at: item.status === "Archived" ? new Date().toISOString() : null,
          legacy: true,
        };
      });
  } catch {
    return [];
  }
}

function saveLegacyField(id: string, field: "status" | "adminNotes", value: string) {
  const rows = JSON.parse(localStorage.getItem(legacyKey) ?? "[]") as Record<string, unknown>[];
  localStorage.setItem(
    legacyKey,
    JSON.stringify(
      rows.map((row) => (row.id === id ? { ...row, [field]: value } : row))
    )
  );
}

function deleteLegacyItem(id: string) {
  const rows = JSON.parse(localStorage.getItem(legacyKey) ?? "[]") as Record<string, unknown>[];
  localStorage.setItem(legacyKey, JSON.stringify(rows.filter((row) => row.id !== id)));
}

function whatsappCustomerUrl(phone: string) {
  const digits = phone.replace(/\D/g, "");
  return `https://wa.me/${digits.startsWith("0") ? `233${digits.slice(1)}` : digits}`;
}

const statusBadgeStyles: Record<ServiceStatus, string> = {
  New: "bg-emerald-100 text-emerald-800 border-emerald-300",
  "In Review": "bg-blue-100 text-blue-800 border-blue-300",
  Contacted: "bg-purple-100 text-purple-800 border-purple-300",
  Completed: "bg-slate-100 text-slate-800 border-slate-300",
  Closed: "bg-rose-50 text-rose-700 border-rose-200",
};

export function AdminInquiriesPage({
  mode,
  embedded = false,
}: {
  mode: Mode;
  embedded?: boolean;
}) {
  const [remote, setRemote] = useState<ServiceRequest[]>([]);
  const [legacy, setLegacy] = useState<DisplayRequest[]>(readLegacy);
  const [viewTab, setViewTab] = useState<ViewTab>("active");
  const [categoryTab, setCategoryTab] = useState<"all" | ServiceType>(() => {
    if (mode === "trade-ins") return "trade-in";
    if (mode === "device-requests") return "pre-order";
    if (mode === "contact-messages") return "contact";
    return "all";
  });
  const [statusFilter, setStatusFilter] = useState<ServiceStatus | "All">("All");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<DisplayRequest | null>(null);
  const [noteDraft, setNoteDraft] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [showManual, setShowManual] = useState(false);

  // Two-step permanent delete modal states
  const [deleteTarget, setDeleteTarget] = useState<DisplayRequest | null>(null);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState("");
  const [deleteReason, setDeleteReason] = useState("");
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const showNotification = (msg: string) => {
    setSuccessMessage(msg);
    window.setTimeout(() => setSuccessMessage(""), 4000);
  };

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await listServiceRequests();
      setRemote(data);
      setLegacy(readLegacy());
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "Service requests could not be loaded.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const allItems = useMemo<DisplayRequest[]>(() => {
    return ([...remote, ...legacy] as DisplayRequest[]).sort((a, b) =>
      b.created_at.localeCompare(a.created_at)
    );
  }, [remote, legacy]);

  // Partition into Active and Archived
  const activeItems = useMemo(
    () => allItems.filter((i) => !i.archived_at),
    [allItems]
  );

  const archivedItems = useMemo(
    () => allItems.filter((i) => Boolean(i.archived_at)),
    [allItems]
  );

  const currentTabPool = viewTab === "active" ? activeItems : archivedItems;

  // Counts by category within the current active pool
  const counts = useMemo(() => {
    const map: Record<string, number> = {
      all: currentTabPool.length,
      installment: 0,
      "trade-in": 0,
      repair: 0,
      "pre-order": 0,
      "visa-card": 0,
      referral: 0,
      contact: 0,
    };
    currentTabPool.forEach((i) => {
      if (i.service_type === "upgrade") {
        map["trade-in"] = (map["trade-in"] || 0) + 1;
      } else if (map[i.service_type] !== undefined) {
        map[i.service_type]++;
      }
    });
    return map;
  }, [currentTabPool]);

  // Filtered list
  const entries = useMemo<DisplayRequest[]>(() => {
    return currentTabPool.filter((item) => {
      if (categoryTab !== "all") {
        if (categoryTab === "trade-in") {
          if (!["trade-in", "upgrade"].includes(item.service_type)) return false;
        } else if (item.service_type !== categoryTab) {
          return false;
        }
      }
      if (statusFilter !== "All" && item.status !== statusFilter) return false;
      if (search.trim()) {
        const haystack = `${item.reference} ${item.customer_name} ${item.phone} ${Object.values(
          item.details
        ).join(" ")}`.toLowerCase();
        if (!haystack.includes(search.trim().toLowerCase())) return false;
      }
      return true;
    });
  }, [currentTabPool, categoryTab, statusFilter, search]);

  const open = (item: DisplayRequest) => {
    setSelected(item);
    setNoteDraft(item.admin_notes);
    setError("");
  };

  const update = async (changes: Partial<Pick<ServiceRequest, "status" | "admin_notes">>) => {
    if (!selected || updating) return;
    setUpdating(true);
    setError("");
    try {
      let saved: DisplayRequest;
      if (selected.legacy) {
        if (changes.status) {
          saveLegacyField(
            selected.id,
            "status",
            changes.status === "In Review"
              ? "Under Review"
              : changes.status === "Closed"
              ? "Archived"
              : changes.status
          );
        }
        if (changes.admin_notes !== undefined) {
          saveLegacyField(selected.id, "adminNotes", changes.admin_notes);
        }
        saved = { ...selected, ...changes };
        setLegacy(readLegacy());
      } else {
        saved = await updateServiceRequest(selected, changes);
        setRemote((rows) => rows.map((row) => (row.id === saved.id ? saved : row)));
      }
      setSelected(saved);
      showNotification("Request details updated successfully.");
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "Update could not be saved.");
    } finally {
      setUpdating(false);
    }
  };

  // Archive action
  const handleArchive = async (item: DisplayRequest) => {
    if (updating) return;
    setUpdating(true);
    setError("");
    try {
      if (item.legacy) {
        saveLegacyField(item.id, "status", "Archived");
        setLegacy(readLegacy());
      } else {
        const archived = await archiveServiceRequest(item);
        setRemote((rows) => rows.map((r) => (r.id === item.id ? archived : r)));
      }
      if (selected?.id === item.id) setSelected(null);
      showNotification(`Request ${item.reference} moved to Archived list.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to archive request.");
    } finally {
      setUpdating(false);
    }
  };

  // Restore action
  const handleRestore = async (item: DisplayRequest) => {
    if (updating) return;
    setUpdating(true);
    setError("");
    try {
      if (item.legacy) {
        saveLegacyField(item.id, "status", "In Review");
        setLegacy(readLegacy());
      } else {
        const restored = await restoreServiceRequest(item);
        setRemote((rows) => rows.map((r) => (r.id === item.id ? restored : r)));
      }
      if (selected?.id === item.id) setSelected(null);
      showNotification(`Request ${item.reference} restored to Active list.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to restore request.");
    } finally {
      setUpdating(false);
    }
  };

  // Open permanent delete dialog
  const promptDelete = (item: DisplayRequest) => {
    setDeleteTarget(item);
    setDeleteConfirmationText("");
    setDeleteReason("");
    setDeleteError("");
  };

  // Confirm permanent deletion
  const handleConfirmDelete = async () => {
    if (!deleteTarget || deleteBusy) return;
    if (deleteConfirmationText.trim().toUpperCase() !== "DELETE") {
      setDeleteError('Please type "DELETE" to confirm permanent deletion.');
      return;
    }

    setDeleteBusy(true);
    setDeleteError("");
    try {
      if (deleteTarget.legacy) {
        deleteLegacyItem(deleteTarget.id);
        setLegacy(readLegacy());
      } else {
        await deleteServiceRequest(deleteTarget, { reason: deleteReason.trim() });
        setRemote((rows) => rows.filter((r) => r.id !== deleteTarget.id));
      }
      if (selected?.id === deleteTarget.id) setSelected(null);
      setDeleteTarget(null);
      showNotification(`Request ${deleteTarget.reference} permanently deleted.`);
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : "Failed to delete request from database.");
    } finally {
      setDeleteBusy(false);
    }
  };

  const addManual = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (updating) return;
    const form = event.currentTarget;
    const data = new FormData(form);
    setUpdating(true);
    setError("");
    try {
      const saved = await logDirectServiceRequest({
        type: String(data.get("type")) as ServiceType,
        name: String(data.get("name")),
        phone: String(data.get("phone")),
        model: String(data.get("model") ?? ""),
        details: String(data.get("details") ?? ""),
      });
      setRemote((rows) => [saved, ...rows]);
      setShowManual(false);
      showNotification(`Direct request ${saved.reference} created successfully.`);
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "Direct request could not be saved.");
    } finally {
      setUpdating(false);
    }
  };

  const title =
    mode === "trade-ins"
      ? "Trade-In & Swap Inquiries"
      : mode === "device-requests"
      ? "Device Requests & Pre-Orders"
      : mode === "contact-messages"
      ? "Customer Contact Messages"
      : "Service Requests & Customer Inquiries";
  const defaultType: ServiceType =
    categoryTab !== "all" ? categoryTab : mode === "trade-ins" ? "trade-in" : "installment";

  return (
    <div className="space-y-5">
      {!embedded && (
        <div className="admin-header-card">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-[#d4af37]">
                Customer Inboxes
              </span>
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-slate-300" />
              <span className="text-xs font-semibold text-slate-500">
                Authoritative Supabase Storefront Submissions
              </span>
            </div>
            <h2>{title}</h2>
            <p>
              Review all customer inquiries, installment plans, repairs, and trade-in applications submitted on buyandsellgh.com.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => void refresh()}
              className="admin-btn admin-btn-secondary"
              aria-label="Refresh requests"
              title="Refresh requests from database"
            >
              <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
              <span>Refresh</span>
            </button>
            <button
              type="button"
              onClick={() => setShowManual(true)}
              className="admin-btn admin-btn-primary"
            >
              <Plus size={15} />
              <span>Log Direct Inquiry</span>
            </button>
          </div>
        </div>
      )}

      {/* Success Notification Banner */}
      {successMessage && (
        <div
          role="status"
          className="flex items-center gap-2.5 p-3 rounded-xl border border-emerald-300 bg-emerald-50 text-xs font-semibold text-emerald-800"
        >
          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {error && (
        <p role="alert" className="p-3 rounded-xl border border-rose-200 bg-rose-50 text-xs font-semibold text-rose-700">
          {error}
        </p>
      )}

      {/* Active vs Archived View Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-1">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setViewTab("active")}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all ${
              viewTab === "active"
                ? "bg-slate-900 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <Inbox size={15} />
            <span>Active Requests</span>
            <span
              className={`px-1.5 py-0.5 rounded-full text-[0.65rem] font-black ${
                viewTab === "active" ? "bg-white/20 text-white" : "bg-slate-200 text-slate-700"
              }`}
            >
              {activeItems.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setViewTab("archived")}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all ${
              viewTab === "archived"
                ? "bg-slate-900 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <Archive size={15} />
            <span>Archived Requests</span>
            <span
              className={`px-1.5 py-0.5 rounded-full text-[0.65rem] font-black ${
                viewTab === "archived" ? "bg-white/20 text-white" : "bg-slate-200 text-slate-700"
              }`}
            >
              {archivedItems.length}
            </span>
          </button>
        </div>

        {viewTab === "archived" && (
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-amber-700 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200">
            <Archive size={14} />
            <span>Archived records are kept safe and can be restored anytime.</span>
          </div>
        )}
      </div>

      {/* Category Navigation Pills */}
      <div className="flex flex-wrap items-center gap-1.5 p-1.5 rounded-xl bg-slate-100/90 border border-slate-200 text-xs font-bold">
        <button
          type="button"
          onClick={() => setCategoryTab("all")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
            categoryTab === "all" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Inbox size={14} />
          <span>All {viewTab === "active" ? "Active" : "Archived"}</span>
          <span className="ml-1 px-1.5 py-0.2 rounded-full bg-slate-200/80 text-[0.65rem] font-black">
            {counts.all}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setCategoryTab("installment")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
            categoryTab === "installment" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Clock size={14} className="text-[#d4af37]" />
          <span>Installments</span>
          <span className="ml-1 px-1.5 py-0.2 rounded-full bg-slate-200/80 text-[0.65rem] font-black">
            {counts.installment}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setCategoryTab("trade-in")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
            categoryTab === "trade-in" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Tag size={14} className="text-emerald-600" />
          <span>Trade-In &amp; Upgrade</span>
          <span className="ml-1 px-1.5 py-0.2 rounded-full bg-slate-200/80 text-[0.65rem] font-black">
            {counts["trade-in"]}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setCategoryTab("repair")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
            categoryTab === "repair" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Wrench size={14} />
          <span>Repairs</span>
          <span className="ml-1 px-1.5 py-0.2 rounded-full bg-slate-200/80 text-[0.65rem] font-black">
            {counts.repair}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setCategoryTab("pre-order")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
            categoryTab === "pre-order" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <PackageCheck size={14} />
          <span>Pre-Orders</span>
          <span className="ml-1 px-1.5 py-0.2 rounded-full bg-slate-200/80 text-[0.65rem] font-black">
            {counts["pre-order"]}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setCategoryTab("visa-card")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
            categoryTab === "visa-card" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Gift size={14} />
          <span>Visa Cards</span>
          <span className="ml-1 px-1.5 py-0.2 rounded-full bg-slate-200/80 text-[0.65rem] font-black">
            {counts["visa-card"]}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setCategoryTab("referral")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
            categoryTab === "referral" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Share2 size={14} />
          <span>Referrals</span>
          <span className="ml-1 px-1.5 py-0.2 rounded-full bg-slate-200/80 text-[0.65rem] font-black">
            {counts.referral}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setCategoryTab("contact")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
            categoryTab === "contact" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <MessageSquare size={14} />
          <span>Contact Messages</span>
          <span className="ml-1 px-1.5 py-0.2 rounded-full bg-slate-200/80 text-[0.65rem] font-black">
            {counts.contact}
          </span>
        </button>
      </div>

      {/* Toolbar: Search & Status Filter */}
      <div className="admin-toolbar flex flex-wrap gap-2.5 items-center">
        <div className="admin-search-input flex-1 min-w-[240px]">
          <Search size={15} />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by reference (e.g. BSG-SR-0000029), customer name, phone, model, budget..."
          />
        </div>
        <select
          aria-label="Request status"
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value as ServiceStatus | "All")}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700"
        >
          <option value="All">All statuses ({currentTabPool.length})</option>
          {statuses.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
        {embedded && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => void refresh()}
              className="admin-btn admin-btn-secondary admin-btn-sm"
              title="Refresh requests"
            >
              <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
              <span>Refresh</span>
            </button>
            <button
              type="button"
              onClick={() => setShowManual(true)}
              className="admin-btn admin-btn-primary admin-btn-sm"
            >
              <Plus size={13} />
              <span>Log Direct Inquiry</span>
            </button>
          </div>
        )}
      </div>

      {/* Requests Table */}
      <div className="admin-table-shell">
        <div className="admin-table-scroll">
          <table className="admin-data-table">
            <thead>
              <tr>
                <th>Reference / Service</th>
                <th>Customer Contact</th>
                <th>Device &amp; Plan Details</th>
                <th>Status</th>
                <th>Date &amp; Time</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500 text-sm">
                    <RefreshCw size={20} className="animate-spin inline-block mr-2 text-slate-400" />
                    Loading customer submissions from Supabase...
                  </td>
                </tr>
              ) : entries.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500 text-sm">
                    No {viewTab === "active" ? "active" : "archived"} customer requests found matching these filters.
                  </td>
                </tr>
              ) : (
                entries.map((item) => (
                  <tr key={`${item.legacy ? "legacy" : "db"}-${item.id}`} className="hover:bg-slate-50/70">
                    <td>
                      <div className="font-mono font-bold text-xs text-[#b17d12] tracking-tight">
                        {item.reference}
                      </div>
                      <div className="text-[0.72rem] font-bold text-slate-700 mt-0.5">
                        {serviceNames[item.service_type]}
                      </div>
                      {item.archived_at && (
                        <span className="inline-block mt-1 px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 text-[0.62rem] font-bold">
                          Archived
                        </span>
                      )}
                    </td>
                    <td>
                      <div className="font-bold text-slate-900 text-xs">{item.customer_name}</div>
                      <div className="text-[0.72rem] font-mono text-slate-500">{item.phone}</div>
                    </td>
                    <td className="max-w-xs text-xs">
                      {item.service_type === "installment" ? (
                        <div>
                          <span className="font-bold text-slate-800">
                            {item.details.model || "iPhone"}
                          </span>
                          {item.details.budget && (
                            <span className="text-slate-600 font-medium">
                              {" "}
                              • Budget: GH₵ {item.details.budget}
                            </span>
                          )}
                          <div className="text-[0.7rem] text-slate-500 truncate mt-0.5">
                            {item.details.planDuration || "Plan"} • {item.details.paymentFrequency || "Frequency"}
                            {item.details.depositPreference && ` • Deposit: ${item.details.depositPreference}`}
                          </div>
                        </div>
                      ) : item.service_type === "trade-in" || item.service_type === "upgrade" ? (
                        <div>
                          <span className="font-bold text-slate-800">
                            {item.details.brand} {item.details.model}
                          </span>
                          {item.details.replacement && (
                            <span className="text-slate-600"> &rarr; {item.details.replacement}</span>
                          )}
                          <div className="text-[0.7rem] text-slate-500 truncate mt-0.5">
                            {item.details.condition} • {item.details.storage} • {item.details.desiredAction || item.details.action}
                          </div>
                        </div>
                      ) : (
                        <div>
                          <span className="font-semibold text-slate-800">
                            {item.details.model ||
                              item.details.interest ||
                              item.details.subject ||
                              item.details.cardType ||
                              "Service enquiry"}
                          </span>
                          {item.details.budget && (
                            <span className="text-slate-500 font-mono"> (GH₵ {item.details.budget})</span>
                          )}
                        </div>
                      )}
                    </td>
                    <td>
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[0.68rem] font-bold border ${
                          statusBadgeStyles[item.status] || "bg-slate-100 text-slate-700 border-slate-200"
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="text-xs text-slate-600 whitespace-nowrap">
                      {new Date(item.created_at).toLocaleString("en-GH", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </td>
                    <td>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => open(item)}
                          className="admin-btn admin-btn-secondary admin-btn-sm text-xs font-bold"
                          title="View customer responses and update notes"
                        >
                          View
                        </button>

                        {viewTab === "active" ? (
                          <button
                            type="button"
                            onClick={() => void handleArchive(item)}
                            disabled={updating}
                            className="p-1.5 rounded-lg border border-slate-200 hover:border-amber-400 hover:bg-amber-50 text-slate-600 hover:text-amber-700 transition"
                            title="Move to Archived list"
                            aria-label={`Archive ${item.reference}`}
                          >
                            <Archive size={14} />
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => void handleRestore(item)}
                            disabled={updating}
                            className="p-1.5 rounded-lg border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 transition"
                            title="Restore to Active list"
                            aria-label={`Restore ${item.reference}`}
                          >
                            <RotateCcw size={14} />
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => promptDelete(item)}
                          className="p-1.5 rounded-lg border border-slate-200 hover:border-rose-400 hover:bg-rose-50 text-slate-500 hover:text-rose-700 transition"
                          title="Permanently Delete Request"
                          aria-label={`Permanently delete ${item.reference}`}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Details & Management Modal */}
      {selected && (
        <div className="admin-modal-overlay" onClick={() => setSelected(null)}>
          <div className="admin-modal-box max-w-2xl" onClick={(event) => event.stopPropagation()}>
            <div className="admin-modal-header">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#b17d12]">
                    {serviceNames[selected.service_type]} / {selected.reference}
                  </span>
                  {selected.archived_at && (
                    <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 text-[0.65rem] font-bold">
                      Archived
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-bold text-slate-900 mt-0.5">{selected.customer_name}</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelected(null)}
                aria-label="Close request"
                className="p-1 rounded-lg text-slate-400 hover:text-slate-900"
              >
                <X size={20} />
              </button>
            </div>

            <div className="admin-modal-body max-h-[75vh] space-y-4 overflow-y-auto p-4 sm:p-6 text-xs sm:text-sm">
              {error && (
                <p role="alert" className="p-3 rounded-lg border border-rose-200 bg-rose-50 text-xs font-semibold text-rose-700">
                  {error}
                </p>
              )}

              {/* Action Buttons: WhatsApp outreach, Phone call, Archive, Delete */}
              <div className="flex flex-wrap items-center justify-between gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex flex-wrap items-center gap-2">
                  <a
                    href={whatsappCustomerUrl(selected.phone)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="admin-btn admin-btn-primary admin-btn-sm"
                  >
                    <MessageCircle size={15} />
                    <span>WhatsApp ({selected.phone})</span>
                  </a>
                  <a
                    href={`tel:${selected.phone}`}
                    className="admin-btn admin-btn-secondary admin-btn-sm"
                  >
                    <span>Call {selected.phone}</span>
                  </a>
                </div>

                <div className="flex items-center gap-2">
                  {!selected.archived_at ? (
                    <button
                      type="button"
                      disabled={updating}
                      onClick={() => void handleArchive(selected)}
                      className="admin-btn admin-btn-secondary admin-btn-sm text-amber-800 border-amber-300 hover:bg-amber-50"
                    >
                      <Archive size={14} />
                      <span>Archive Request</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={updating}
                      onClick={() => void handleRestore(selected)}
                      className="admin-btn admin-btn-secondary admin-btn-sm text-emerald-800 border-emerald-300 hover:bg-emerald-50"
                    >
                      <RotateCcw size={14} />
                      <span>Restore to Active</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => promptDelete(selected)}
                    className="admin-btn admin-btn-secondary admin-btn-sm text-rose-700 border-rose-200 hover:bg-rose-50"
                  >
                    <Trash2 size={14} />
                    <span>Delete</span>
                  </button>
                </div>
              </div>

              <div className="text-[0.72rem] text-slate-500 flex items-center justify-between">
                <span>
                  Submitted:{" "}
                  <strong>{new Date(selected.created_at).toLocaleString("en-GH")}</strong>
                </span>
                <span className="font-mono text-slate-400">{selected.source}</span>
              </div>

              {/* Full details dictionary */}
              <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-2">
                <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider border-b border-slate-100 pb-2 mb-2">
                  Customer Form Responses
                </h4>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-xs">
                  {Object.entries(selected.details).map(([key, value]) => (
                    <div key={key} className={value.length > 40 ? "sm:col-span-2" : ""}>
                      <dt className="font-bold text-slate-500 capitalize">
                        {key.replace(/([a-z])([A-Z])/g, "$1 $2")}
                      </dt>
                      <dd className="font-medium text-slate-900 whitespace-pre-wrap break-words mt-0.5">
                        {value || "—"}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>

              {/* Status Update */}
              <div className="space-y-2 pt-2">
                <label className="block text-xs font-bold text-slate-800">
                  Application Status
                </label>
                <div className="flex flex-wrap gap-2">
                  {statuses.map((status) => (
                    <button
                      type="button"
                      key={status}
                      disabled={updating}
                      onClick={() => void update({ status })}
                      className={`admin-btn admin-btn-sm text-xs ${
                        selected.status === status
                          ? "admin-btn-primary"
                          : "admin-btn-secondary text-slate-600"
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>

              {/* Internal Notes */}
              <div className="space-y-2 pt-2">
                <label className="block text-xs font-bold text-slate-800">
                  Internal Administrative Notes
                </label>
                <textarea
                  value={noteDraft}
                  onChange={(event) => setNoteDraft(event.target.value)}
                  maxLength={4000}
                  rows={3}
                  placeholder="Record customer preferences, appraisal outcome, deposit confirmation, or follow-up schedule..."
                  className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs outline-none focus:border-[#b17d12]"
                />
                <button
                  type="button"
                  disabled={updating || noteDraft === selected.admin_notes}
                  onClick={() => void update({ admin_notes: noteDraft })}
                  className="admin-btn admin-btn-secondary admin-btn-sm"
                >
                  {updating ? "Saving..." : "Save Notes"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Two-Step Permanent Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="admin-modal-overlay" onClick={() => !deleteBusy && setDeleteTarget(null)}>
          <div className="admin-modal-box max-w-md border-rose-300" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header bg-rose-50/70 border-b border-rose-100">
              <div className="flex items-center gap-2 text-rose-800">
                <AlertTriangle size={20} className="text-rose-600 shrink-0" />
                <h3 className="text-base font-bold text-rose-900">Permanently Delete Request</h3>
              </div>
              <button
                type="button"
                disabled={deleteBusy}
                onClick={() => setDeleteTarget(null)}
                aria-label="Cancel deletion"
                className="p-1 rounded-lg text-slate-400 hover:text-slate-900"
              >
                <X size={18} />
              </button>
            </div>

            <div className="admin-modal-body space-y-4 p-5 text-xs text-slate-700">
              {deleteError && (
                <div role="alert" className="p-3 rounded-lg border border-rose-300 bg-rose-50 text-xs font-semibold text-rose-800">
                  {deleteError}
                </div>
              )}

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="flex justify-between font-mono font-bold text-slate-900">
                  <span>{deleteTarget.reference}</span>
                  <span className="text-[#b17d12]">{serviceNames[deleteTarget.service_type]}</span>
                </div>
                <div className="font-semibold text-slate-800">Customer: {deleteTarget.customer_name} ({deleteTarget.phone})</div>
                <div className="text-slate-500 text-[0.7rem]">
                  Submitted on {new Date(deleteTarget.created_at).toLocaleString("en-GH")}
                </div>
              </div>

              <div className="space-y-1 text-slate-600">
                <p className="font-bold text-rose-700">
                  Warning: This action cannot be undone.
                </p>
                <p>
                  The request will be permanently purged from the database and will no longer appear in Active or Archived lists.
                </p>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Reason for permanent deletion (audit log):
                </label>
                <input
                  type="text"
                  value={deleteReason}
                  onChange={(e) => setDeleteReason(e.target.value)}
                  placeholder="e.g. Test submission, Duplicate entry, Customer request"
                  className="w-full rounded-lg border border-slate-200 bg-white p-2.5 text-xs"
                />
              </div>

              <div className="space-y-1.5 pt-2 border-t border-slate-100">
                <label className="block font-bold text-slate-800">
                  Type <span className="font-mono text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">DELETE</span> to confirm:
                </label>
                <input
                  type="text"
                  value={deleteConfirmationText}
                  onChange={(e) => setDeleteConfirmationText(e.target.value)}
                  placeholder="Type DELETE here"
                  className="w-full rounded-lg border border-rose-300 bg-white p-2.5 text-xs font-mono font-bold uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  disabled={deleteBusy}
                  onClick={() => setDeleteTarget(null)}
                  className="admin-btn admin-btn-secondary admin-btn-sm"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={deleteBusy || deleteConfirmationText.trim().toUpperCase() !== "DELETE"}
                  onClick={() => void handleConfirmDelete()}
                  className="admin-btn admin-btn-sm bg-rose-600 hover:bg-rose-700 text-white font-bold disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
                >
                  {deleteBusy ? (
                    <>
                      <RefreshCw size={13} className="animate-spin mr-1" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 size={13} className="mr-1" />
                      Permanently Delete
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Manual Inquiry Modal */}
      {showManual && (
        <div className="admin-modal-overlay" onClick={() => setShowManual(false)}>
          <div className="admin-modal-box max-w-md" onClick={(event) => event.stopPropagation()}>
            <div className="admin-modal-header">
              <h3 className="text-base font-bold text-slate-900">Log Direct Inquiry</h3>
              <button
                type="button"
                onClick={() => setShowManual(false)}
                aria-label="Close direct inquiry"
                className="p-1 rounded-lg text-slate-400 hover:text-slate-900"
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={(event) => void addManual(event)} className="admin-modal-body space-y-3 p-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Service Type</label>
                <select
                  name="type"
                  defaultValue={defaultType}
                  className="w-full rounded-lg border border-slate-200 bg-white p-2.5 text-xs"
                >
                  {Object.entries(serviceNames).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Customer Name *</label>
                <input
                  name="name"
                  required
                  maxLength={120}
                  placeholder="e.g. Samuel Mensah"
                  className="w-full rounded-lg border border-slate-200 bg-white p-2.5 text-xs"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Phone Number *</label>
                <input
                  name="phone"
                  required
                  maxLength={32}
                  placeholder="e.g. 055 197 5451"
                  className="w-full rounded-lg border border-slate-200 bg-white p-2.5 text-xs"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Device / Model / Topic</label>
                <input
                  name="model"
                  maxLength={160}
                  placeholder="e.g. iPhone 18 Pro 256GB"
                  className="w-full rounded-lg border border-slate-200 bg-white p-2.5 text-xs"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Inquiry Details</label>
                <textarea
                  name="details"
                  maxLength={2000}
                  rows={3}
                  placeholder="Inquiry notes, budget, duration or custom arrangements..."
                  className="w-full rounded-lg border border-slate-200 bg-white p-2.5 text-xs"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowManual(false)}
                  className="admin-btn admin-btn-secondary admin-btn-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="admin-btn admin-btn-primary admin-btn-sm"
                >
                  {updating ? "Saving..." : "Save Inquiry"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
