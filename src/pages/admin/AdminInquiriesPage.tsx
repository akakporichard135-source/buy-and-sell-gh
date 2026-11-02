import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { MessageCircle, Plus, RefreshCw, Search, X } from "lucide-react";
import {
  listServiceRequests, logDirectServiceRequest, updateServiceRequest,
  type ServiceRequest, type ServiceStatus, type ServiceType,
} from "../../services/serviceRequestRepository";

type Mode = "service-requests" | "trade-ins" | "device-requests" | "contact-messages";
type DisplayRequest = ServiceRequest & { legacy?: boolean };

const serviceNames: Record<ServiceType, string> = {
  installment: "Installment Payment", repair: "Expert Repairs", "trade-in": "Trade-In",
  upgrade: "Upgrade & Save", "visa-card": "Visa Card Trading", "pre-order": "Pre-Order",
  referral: "Refer a Friend", contact: "Contact",
};
const statuses: ServiceStatus[] = ["New", "In Review", "Contacted", "Completed", "Closed"];
const legacyKey = "buyandsell_gh_admin_inquiries_v2";

function readLegacy(): DisplayRequest[] {
  try {
    const rows = JSON.parse(localStorage.getItem(legacyKey) ?? "[]") as Record<string, unknown>[];
    if (!Array.isArray(rows)) return [];
    return rows.filter((item) => typeof item.id === "string" && !["inq-101", "inq-102", "inq-201", "inq-301"].includes(item.id)).map((item) => {
      const type: ServiceType = item.type === "trade-in" ? "trade-in" : item.type === "device-request" ? "pre-order" : "contact";
      const details = Object.fromEntries(["deviceType", "brand", "model", "storage", "condition", "desiredAction", "replacementDevice", "budget", "message"]
        .filter((key) => typeof item[key] === "string" && item[key])
        .map((key) => [key, String(item[key])]));
      return {
        id: String(item.id), reference: String(item.id), service_type: type,
        customer_name: String(item.customerName ?? ""), phone: String(item.phone ?? ""),
        details, status: item.status === "Under Review" || item.status === "Appraised" ? "In Review"
          : item.status === "Archived" ? "Closed" : (item.status as ServiceStatus) || "New",
        admin_notes: String(item.adminNotes ?? ""), source: "Legacy browser entry",
        created_at: String(item.createdAt ?? new Date(0).toISOString()), legacy: true,
      };
    });
  } catch { return []; }
}

function saveLegacyField(id: string, field: "status" | "adminNotes", value: string) {
  const rows = JSON.parse(localStorage.getItem(legacyKey) ?? "[]") as Record<string, unknown>[];
  localStorage.setItem(legacyKey, JSON.stringify(rows.map((row) => row.id === id ? { ...row, [field]: value } : row)));
}

function whatsappCustomerUrl(phone: string) {
  const digits = phone.replace(/\D/g, "");
  return `https://wa.me/${digits.startsWith("0") ? `233${digits.slice(1)}` : digits}`;
}

export function AdminInquiriesPage({ mode }: { mode: Mode }) {
  const [remote, setRemote] = useState<ServiceRequest[]>([]);
  const [legacy, setLegacy] = useState<DisplayRequest[]>(readLegacy);
  const [typeFilter, setTypeFilter] = useState<ServiceType | "All">("All");
  const [statusFilter, setStatusFilter] = useState<ServiceStatus | "All">("All");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<DisplayRequest | null>(null);
  const [noteDraft, setNoteDraft] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [showManual, setShowManual] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setRemote(await listServiceRequests());
      setLegacy(readLegacy());
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "Service requests could not be loaded.");
    } finally { setLoading(false); }
  }, []);
  useEffect(() => { void refresh(); }, [refresh]);

  const entries = useMemo<DisplayRequest[]>(() => ([...remote, ...legacy] as DisplayRequest[]).filter((item) => {
    if (mode === "trade-ins" && !["trade-in", "upgrade"].includes(item.service_type)) return false;
    if (mode === "device-requests" && item.service_type !== "pre-order") return false;
    if (mode === "contact-messages" && item.service_type !== "contact") return false;
    if (typeFilter !== "All" && item.service_type !== typeFilter) return false;
    if (statusFilter !== "All" && item.status !== statusFilter) return false;
    const haystack = `${item.reference} ${item.customer_name} ${item.phone} ${Object.values(item.details).join(" ")}`.toLowerCase();
    return haystack.includes(search.trim().toLowerCase());
  }).sort((a, b) => b.created_at.localeCompare(a.created_at)), [remote, legacy, mode, typeFilter, statusFilter, search]);

  const open = (item: DisplayRequest) => { setSelected(item); setNoteDraft(item.admin_notes); setError(""); };
  const update = async (changes: Partial<Pick<ServiceRequest, "status" | "admin_notes">>) => {
    if (!selected || updating) return;
    setUpdating(true);
    setError("");
    try {
      let saved: DisplayRequest;
      if (selected.legacy) {
        if (changes.status) saveLegacyField(selected.id, "status", changes.status === "In Review" ? "Under Review" : changes.status === "Closed" ? "Archived" : changes.status);
        if (changes.admin_notes !== undefined) saveLegacyField(selected.id, "adminNotes", changes.admin_notes);
        saved = { ...selected, ...changes };
        setLegacy(readLegacy());
      } else {
        saved = await updateServiceRequest(selected, changes);
        setRemote((rows) => rows.map((row) => row.id === saved.id ? saved : row));
      }
      setSelected(saved);
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "Update could not be saved.");
    } finally { setUpdating(false); }
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
        name: String(data.get("name")), phone: String(data.get("phone")),
        model: String(data.get("model") ?? ""), details: String(data.get("details") ?? ""),
      });
      setRemote((rows) => [saved, ...rows]);
      setShowManual(false);
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "Direct request could not be saved.");
    } finally { setUpdating(false); }
  };

  const title = mode === "trade-ins" ? "Trade-In & Swap Inquiries" : mode === "device-requests" ? "Device Requests & Pre-Orders"
    : mode === "contact-messages" ? "Customer Contact Messages" : "Service Requests";
  const defaultType: ServiceType = mode === "trade-ins" ? "trade-in" : mode === "device-requests" ? "pre-order" : "contact";

  return <div className="space-y-6">
    <div className="admin-header-card">
      <div><span className="text-xs font-bold uppercase text-[#b17d12]">Customer Inboxes</span><h2>{title}</h2><p>Review customer requests and follow up from one private inbox.</p></div>
      <div className="flex gap-2">
        <button type="button" onClick={() => void refresh()} className="admin-btn admin-btn-secondary" aria-label="Refresh requests"><RefreshCw size={16} /></button>
        <button type="button" onClick={() => setShowManual(true)} className="admin-btn admin-btn-primary"><Plus size={16} /> Log Direct Inquiry</button>
      </div>
    </div>
    {error && <p role="alert" className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    <div className="admin-toolbar flex flex-wrap gap-2">
      <div className="admin-search-input flex-1"><Search size={16} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by reference, customer, phone, or device" /></div>
      <select aria-label="Service type" value={typeFilter} onChange={(event) => setTypeFilter(event.target.value as ServiceType | "All")} className="rounded border border-slate-200 bg-white px-3 py-2 text-sm">
        <option value="All">All services</option>{Object.entries(serviceNames).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
      </select>
      <select aria-label="Request status" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as ServiceStatus | "All")} className="rounded border border-slate-200 bg-white px-3 py-2 text-sm">
        <option value="All">All statuses</option>{statuses.map((status) => <option key={status}>{status}</option>)}
      </select>
    </div>
    <div className="admin-table-shell"><div className="admin-table-scroll"><table className="admin-data-table"><thead><tr>
      <th>Reference / Service</th><th>Customer</th><th>Device / Details</th><th>Status</th><th>Date</th><th>Actions</th>
    </tr></thead><tbody>
      {loading ? <tr><td colSpan={6} className="py-10 text-center">Loading requests...</td></tr> : entries.length === 0 ? <tr><td colSpan={6} className="py-10 text-center">No requests match these filters.</td></tr> : entries.map((item) => <tr key={`${item.legacy ? "legacy" : "db"}-${item.id}`}>
        <td><strong>{item.reference}</strong><div className="text-xs text-slate-500">{serviceNames[item.service_type]}</div></td>
        <td><strong>{item.customer_name}</strong><div className="text-xs text-slate-500">{item.phone}</div></td>
        <td>{item.details.model || item.details.interest || item.details.subject || "Service request"}</td>
        <td><span className="admin-badge admin-badge-amber">{item.status}</span></td>
        <td className="text-xs">{new Date(item.created_at).toLocaleString("en-GH")}</td>
        <td><button type="button" onClick={() => open(item)} className="admin-btn admin-btn-secondary admin-btn-sm">View &amp; Manage</button></td>
      </tr>)}
    </tbody></table></div></div>
    {selected && <div className="admin-modal-overlay" onClick={() => setSelected(null)}><div className="admin-modal-box max-w-xl" onClick={(event) => event.stopPropagation()}>
      <div className="admin-modal-header"><div><span className="text-xs font-bold uppercase text-[#b17d12]">{serviceNames[selected.service_type]} / {selected.reference}</span><h3 className="text-lg font-bold">{selected.customer_name}</h3></div><button type="button" onClick={() => setSelected(null)} aria-label="Close request"><X size={20} /></button></div>
      <div className="admin-modal-body max-h-[70vh] space-y-4 overflow-y-auto">
        {error && <p role="alert" className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        <div className="flex flex-wrap gap-3 text-sm"><span>{selected.phone}</span><a href={whatsappCustomerUrl(selected.phone)} target="_blank" rel="noopener noreferrer" className="admin-btn admin-btn-secondary"><MessageCircle size={16} /> Contact on WhatsApp</a></div>
        <div className="text-xs text-slate-500">Submitted {new Date(selected.created_at).toLocaleString("en-GH")} / {selected.source}</div>
        <dl className="grid gap-2 rounded border border-slate-200 bg-white p-4 text-sm">{Object.entries(selected.details).map(([key, value]) => <div key={key} className="flex gap-3"><dt className="min-w-28 font-semibold text-slate-600">{key.replace(/([a-z])([A-Z])/g, "$1 $2")}</dt><dd className="whitespace-pre-wrap break-words">{value}</dd></div>)}</dl>
        <label className="block text-sm font-semibold">Internal notes<textarea value={noteDraft} onChange={(event) => setNoteDraft(event.target.value)} maxLength={4000} rows={3} className="mt-2 w-full rounded border border-slate-200 bg-white p-3" /></label>
        <button type="button" disabled={updating || noteDraft === selected.admin_notes} onClick={() => void update({ admin_notes: noteDraft })} className="admin-btn admin-btn-secondary">Save notes</button>
        <div><p className="mb-2 text-sm font-semibold">Status</p><div className="flex flex-wrap gap-2">{statuses.map((status) => <button type="button" key={status} disabled={updating} onClick={() => void update({ status })} className={`admin-btn admin-btn-sm ${selected.status === status ? "admin-btn-primary" : "admin-btn-secondary"}`}>{status}</button>)}</div></div>
      </div>
    </div></div>}
    {showManual && <div className="admin-modal-overlay" onClick={() => setShowManual(false)}><div className="admin-modal-box max-w-md" onClick={(event) => event.stopPropagation()}>
      <div className="admin-modal-header"><h3 className="text-lg font-bold">Log Direct Inquiry</h3><button type="button" onClick={() => setShowManual(false)} aria-label="Close direct inquiry"><X size={20} /></button></div>
      <form onSubmit={(event) => void addManual(event)} className="admin-modal-body space-y-3">
        <label className="block text-sm">Service<select name="type" defaultValue={defaultType} className="mt-1 w-full rounded border p-2">{Object.entries(serviceNames).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
        <label className="block text-sm">Customer name<input name="name" required maxLength={120} className="mt-1 w-full rounded border p-2" /></label>
        <label className="block text-sm">Phone<input name="phone" required maxLength={32} className="mt-1 w-full rounded border p-2" /></label>
        <label className="block text-sm">Device / topic<input name="model" maxLength={160} className="mt-1 w-full rounded border p-2" /></label>
        <label className="block text-sm">Details<textarea name="details" maxLength={2000} rows={3} className="mt-1 w-full rounded border p-2" /></label>
        <div className="flex justify-end gap-2"><button type="button" onClick={() => setShowManual(false)} className="admin-btn admin-btn-secondary">Cancel</button><button type="submit" disabled={updating} className="admin-btn admin-btn-primary">Save Inquiry</button></div>
      </form>
    </div></div>}
  </div>;
}
