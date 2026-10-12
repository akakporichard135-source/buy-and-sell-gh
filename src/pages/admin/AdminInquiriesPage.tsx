import {
  Archive,
  CheckCircle2,
  Clock,
  Filter,
  MessageCircle,
  MessageSquare,
  Phone,
  Plus,
  RefreshCw,
  Search,
  Tag,
  Trash2,
  User,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { formatGhs } from "../../utils/format";

export type InquiryType = "trade-in" | "device-request" | "contact-message";

export interface InquiryItem {
  id: string;
  type: InquiryType;
  customerName: string;
  phone: string;
  whatsapp?: string;
  email?: string;
  deviceType?: string;
  brand?: string;
  model?: string;
  storage?: string;
  condition?: string;
  desiredAction?: "Sell" | "Swap";
  replacementDevice?: string;
  budget?: string;
  message?: string;
  adminNotes?: string;
  status: "New" | "Under Review" | "Contacted" | "Appraised" | "Completed" | "Archived";
  createdAt: string;
  source: "WhatsApp Form" | "In-Store / Direct" | "Website Form";
}

const STORAGE_KEY = "buyandsell_gh_admin_inquiries_v2";

export function AdminInquiriesPage({ mode }: { mode: "trade-ins" | "device-requests" | "contact-messages" }) {
  const targetType: InquiryType =
    mode === "trade-ins"
      ? "trade-in"
      : mode === "device-requests"
      ? "device-request"
      : "contact-message";

  const [inquiries, setInquiries] = useState<InquiryItem[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          // Purge legacy mock entries
          return parsed.filter(
            (i) => !["inq-101", "inq-102", "inq-201", "inq-301"].includes(i.id)
          );
        }
      }
    } catch {
      // fallback
    }
    return [];
  });

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [selectedInquiry, setSelectedInquiry] = useState<InquiryItem | null>(null);
  const [showLogModal, setShowLogModal] = useState(false);

  // Form for manual entry
  const [newCustomer, setNewCustomer] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newModel, setNewModel] = useState("");
  const [newDetails, setNewDetails] = useState("");

  const saveToStorage = (updated: InquiryItem[]) => {
    setInquiries(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const currentItems = useMemo(() => {
    return inquiries.filter((item) => {
      if (item.type !== targetType) return false;
      if (statusFilter !== "All" && item.status !== statusFilter) return false;
      if (search.trim()) {
        const query = search.toLowerCase();
        const str = `${item.customerName} ${item.phone} ${item.model || ""} ${item.brand || ""} ${item.message || ""}`.toLowerCase();
        if (!str.includes(query)) return false;
      }
      return true;
    });
  }, [inquiries, targetType, statusFilter, search]);

  const updateStatus = (id: string, status: InquiryItem["status"]) => {
    const updated = inquiries.map((item) => (item.id === id ? { ...item, status } : item));
    saveToStorage(updated);
    if (selectedInquiry?.id === id) {
      setSelectedInquiry({ ...selectedInquiry, status });
    }
  };

  const updateNotes = (id: string, adminNotes: string) => {
    const updated = inquiries.map((item) => (item.id === id ? { ...item, adminNotes } : item));
    saveToStorage(updated);
    if (selectedInquiry?.id === id) {
      setSelectedInquiry({ ...selectedInquiry, adminNotes });
    }
  };

  const deleteInquiry = (id: string) => {
    if (!window.confirm("Remove this entry from the inbox?")) return;
    const updated = inquiries.filter((item) => item.id !== id);
    saveToStorage(updated);
    if (selectedInquiry?.id === id) setSelectedInquiry(null);
  };

  const handleAddManual = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomer || !newPhone) return;

    const newEntry: InquiryItem = {
      id: `inq-${Date.now()}`,
      type: targetType,
      customerName: newCustomer,
      phone: newPhone,
      whatsapp: newPhone,
      model: newModel || "Customer device",
      message: newDetails,
      status: "New",
      createdAt: new Date().toISOString(),
      source: "In-Store / Direct",
    };

    saveToStorage([newEntry, ...inquiries]);
    setNewCustomer("");
    setNewPhone("");
    setNewModel("");
    setNewDetails("");
    setShowLogModal(false);
  };

  const pageMeta = {
    "trade-in": {
      title: "Trade-In & Swap Inquiries",
      eyebrow: "Device Trade-Ins",
      description:
        "Manage customer device valuations, trade-in assessments, and upgrade swap requests.",
      badge: "Trade-In Manager",
    },
    "device-request": {
      title: "Device Requests & Pre-Orders",
      eyebrow: "Customer Sourcing",
      description:
        "Review customer requests for specific device configurations, out-of-stock items, and pre-orders.",
      badge: "Pre-Order Desk",
    },
    "contact-message": {
      title: "Customer Contact Messages",
      eyebrow: "Customer Service",
      description:
        "Review enquiries submitted through contact, service booking, and repair support channels.",
      badge: "Message Center",
    },
  }[targetType];

  return (
    <div className="space-y-6">
      {/* 1. Header Card */}
      <div className="admin-header-card">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-[#d4af37]">
              {pageMeta.eyebrow}
            </span>
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-slate-300" />
            <span className="text-xs font-semibold text-slate-500">{pageMeta.badge}</span>
          </div>
          <h2>{pageMeta.title}</h2>
          <p>{pageMeta.description}</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => setShowLogModal(true)}
            className="admin-btn admin-btn-primary"
          >
            <Plus size={16} />
            <span>Log Direct Inquiry</span>
          </button>
        </div>
      </div>

      {/* Notice on Current Workflow */}
      <div className="p-4 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-600 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div className="flex items-center gap-2.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
          <span>
            <strong>Operational Note:</strong> Customer submissions on public forms prepare structured
            WhatsApp messages for direct communication. Entries logged here enable staff to track
            valuation status, notes, and follow-ups. Backend SQL migration <code>015</code> is prepared
            for automated DB persistence.
          </span>
        </div>
      </div>

      {/* 2. Filter & Search Toolbar */}
      <div className="admin-toolbar">
        <div className="admin-search-input">
          <Search size={16} className="text-slate-400 shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by customer, phone, or device..."
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mr-1">
            Status:
          </span>
          {["All", "New", "Under Review", "Contacted", "Completed", "Archived"].map((st) => (
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
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Inquiries Data Table */}
      <div className="admin-table-shell">
        <div className="admin-table-scroll">
          <table className="admin-data-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Device / Request</th>
                <th>Condition / Specs</th>
                <th>Status</th>
                <th>Source</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 px-4 text-slate-500">
                    <p className="font-bold text-slate-800 text-sm">No Customer Inquiries Recorded Yet</p>
                    <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                      Customer submissions on buyandsellgh.com open verified WhatsApp chats directly with staff.
                      Use <strong>+ Log Direct Inquiry</strong> above to track inbound WhatsApp valuations or in-store customer requests.
                    </p>
                  </td>
                </tr>
              ) : (
                currentItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70">
                    <td>
                      <div className="font-bold text-slate-900">{item.customerName}</div>
                      <div className="text-xs text-slate-500">{item.phone}</div>
                    </td>
                    <td>
                      <div className="font-semibold text-slate-900">
                        {item.brand ? `${item.brand} ` : ""}
                        {item.model || "General Inquiry"}
                      </div>
                      {item.desiredAction && (
                        <div className="text-xs text-amber-600 font-medium">
                          {item.desiredAction === "Swap"
                            ? `Upgrade swap to: ${item.replacementDevice || "To decide"}`
                            : "Direct Sell Assessment"}
                        </div>
                      )}
                    </td>
                    <td>
                      <div className="text-xs font-medium text-slate-700">
                        {item.storage || item.budget || item.condition || "Details in notes"}
                      </div>
                      {item.condition && (
                        <span className="inline-block mt-0.5 px-2 py-0.5 rounded text-[0.7rem] bg-slate-100 text-slate-600 font-bold">
                          {item.condition}
                        </span>
                      )}
                    </td>
                    <td>
                      <span
                        className={`admin-badge ${
                          item.status === "New"
                            ? "admin-badge-rose"
                            : item.status === "Completed"
                            ? "admin-badge-emerald"
                            : item.status === "Contacted"
                            ? "admin-badge-blue"
                            : "admin-badge-amber"
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="text-xs text-slate-500">{item.source}</td>
                    <td className="text-xs text-slate-500">
                      {new Date(item.createdAt).toLocaleDateString("en-GH", {
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedInquiry(item)}
                          className="admin-btn admin-btn-secondary admin-btn-sm"
                        >
                          View &amp; Manage
                        </button>
                        <a
                          href={`https://wa.me/233${item.phone.replace(/^0/, "").replace(/\s+/g, "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                          title="Open WhatsApp chat"
                        >
                          <MessageCircle size={16} />
                        </a>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Inquiry Detail Drawer / Modal */}
      {selectedInquiry && (
        <div className="admin-modal-overlay" onClick={() => setSelectedInquiry(null)}>
          <div className="admin-modal-box max-w-xl" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#d4af37]">
                  {selectedInquiry.source}
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-0.5">
                  {selectedInquiry.customerName}
                </h3>
              </div>
              <button
                type="button"
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
                onClick={() => setSelectedInquiry(null)}
              >
                <X size={20} />
              </button>
            </div>

            <div className="admin-modal-body space-y-4 max-h-[70vh] overflow-y-auto">
              {/* Contact Buttons */}
              <div className="flex gap-2.5">
                <a
                  href={`https://wa.me/233${selectedInquiry.phone.replace(/^0/, "").replace(/\s+/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="admin-btn admin-btn-secondary flex-1 text-emerald-700 border-emerald-200 bg-emerald-50/50 hover:bg-emerald-50"
                >
                  <MessageCircle size={16} />
                  <span>Chat on WhatsApp ({selectedInquiry.phone})</span>
                </a>
                <a
                  href={`tel:${selectedInquiry.phone}`}
                  className="admin-btn admin-btn-secondary"
                  title="Call Customer"
                >
                  <Phone size={16} />
                </a>
              </div>

              {/* Device Details */}
              <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-semibold">Requested Device:</span>
                  <span className="font-bold text-slate-900">
                    {selectedInquiry.brand} {selectedInquiry.model}
                  </span>
                </div>
                {selectedInquiry.storage && (
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-semibold">Storage / Specs:</span>
                    <span className="font-bold text-slate-900">{selectedInquiry.storage}</span>
                  </div>
                )}
                {selectedInquiry.condition && (
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-semibold">Physical Condition:</span>
                    <span className="font-bold text-slate-900">{selectedInquiry.condition}</span>
                  </div>
                )}
                {selectedInquiry.desiredAction && (
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-semibold">Action Requested:</span>
                    <span className="font-bold text-amber-600">{selectedInquiry.desiredAction}</span>
                  </div>
                )}
                {selectedInquiry.replacementDevice && (
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-semibold">Target Replacement:</span>
                    <span className="font-bold text-slate-900">
                      {selectedInquiry.replacementDevice}
                    </span>
                  </div>
                )}
              </div>

              {/* Message from Customer */}
              {selectedInquiry.message && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Customer Message / Details
                  </h4>
                  <p className="p-3 rounded-lg bg-white border border-slate-200 text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">
                    {selectedInquiry.message}
                  </p>
                </div>
              )}

              {/* Admin Internal Notes */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Internal Staff Notes &amp; Valuation
                </h4>
                <textarea
                  className="w-full p-2.5 rounded-lg border border-slate-200 text-xs text-slate-800 bg-white focus:outline-none focus:ring-1 focus:ring-slate-400"
                  rows={3}
                  defaultValue={selectedInquiry.adminNotes || ""}
                  placeholder="Record valuation quote, agreed swap terms, or inspection outcome..."
                  onBlur={(e) => updateNotes(selectedInquiry.id, e.target.value)}
                />
              </div>

              {/* Status Controls */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Update Processing Status
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {(["New", "Under Review", "Contacted", "Appraised", "Completed", "Archived"] as const).map(
                    (st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => updateStatus(selectedInquiry.id, st)}
                        className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                          selectedInquiry.status === st
                            ? "bg-slate-900 text-white"
                            : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                        }`}
                      >
                        {st}
                      </button>
                    )
                  )}
                </div>
              </div>
            </div>

            <div className="admin-modal-footer">
              <button
                type="button"
                onClick={() => deleteInquiry(selectedInquiry.id)}
                className="admin-btn admin-btn-danger admin-btn-sm mr-auto"
              >
                <Trash2 size={14} />
                <span>Delete</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedInquiry(null)}
                className="admin-btn admin-btn-secondary admin-btn-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Manual Log Modal */}
      {showLogModal && (
        <div className="admin-modal-overlay" onClick={() => setShowLogModal(false)}>
          <div className="admin-modal-box max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3 className="text-base font-bold text-slate-900">
                Log Direct {pageMeta.title.replace(/Inquiries|Messages/g, "Inquiry")}
              </h3>
              <button
                type="button"
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
                onClick={() => setShowLogModal(false)}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddManual}>
              <div className="admin-modal-body space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Customer Name *
                  </label>
                  <input
                    required
                    type="text"
                    value={newCustomer}
                    onChange={(e) => setNewCustomer(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-slate-200 text-xs"
                    placeholder="Full name"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Phone / WhatsApp *
                  </label>
                  <input
                    required
                    type="text"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-slate-200 text-xs"
                    placeholder="e.g. 024 123 4567"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Device Model / Inquiry Topic
                  </label>
                  <input
                    type="text"
                    value={newModel}
                    onChange={(e) => setNewModel(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-slate-200 text-xs"
                    placeholder="e.g. iPhone 15 Pro Max 256GB"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Details / Condition / Notes
                  </label>
                  <textarea
                    rows={3}
                    value={newDetails}
                    onChange={(e) => setNewDetails(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-slate-200 text-xs"
                    placeholder="Customer specifications, agreed price, or issues..."
                  />
                </div>
              </div>

              <div className="admin-modal-footer">
                <button
                  type="button"
                  onClick={() => setShowLogModal(false)}
                  className="admin-btn admin-btn-secondary admin-btn-sm"
                >
                  Cancel
                </button>
                <button type="submit" className="admin-btn admin-btn-primary admin-btn-sm">
                  Save Inquiry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
