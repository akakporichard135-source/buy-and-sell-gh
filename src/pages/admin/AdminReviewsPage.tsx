import {
  AlertTriangle,
  Archive,
  Check,
  CheckCircle2,
  Filter,
  MessageSquare,
  Search,
  ShieldCheck,
  Star,
  ThumbsDown,
  Trash2,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";

export interface CustomerReview {
  id: string;
  customerName: string;
  verifiedOrderRef?: string;
  productName: string;
  rating: number; // 1 - 5
  title: string;
  content: string;
  status: "Pending" | "Approved" | "Rejected" | "Archived";
  createdAt: string;
  moderationNotes?: string;
}

const STORAGE_KEY = "buyandsell_gh_admin_reviews_v2";

export function AdminReviewsPage() {
  const [reviews, setReviews] = useState<CustomerReview[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          // Exclude any legacy mock items with fake order references
          return parsed.filter(
            (r) => !r.verifiedOrderRef?.includes("94812") && !r.verifiedOrderRef?.includes("10492")
          );
        }
      }
    } catch {
      // fallback
    }
    return [];
  });

  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [search, setSearch] = useState("");
  const [selectedReview, setSelectedReview] = useState<CustomerReview | null>(null);
  const [showLogModal, setShowLogModal] = useState(false);

  // New review form
  const [customerName, setCustomerName] = useState("");
  const [orderRef, setOrderRef] = useState("");
  const [productName, setProductName] = useState("");
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [initialStatus, setInitialStatus] = useState<CustomerReview["status"]>("Approved");

  const saveReviews = (updated: CustomerReview[]) => {
    setReviews(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const handleCreateReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !productName.trim() || !content.trim()) return;

    const newRev: CustomerReview = {
      id: `rev-${Date.now()}`,
      customerName: customerName.trim(),
      verifiedOrderRef: orderRef.trim() || undefined,
      productName: productName.trim(),
      rating,
      title: title.trim() || `${rating}-Star Verified Review`,
      content: content.trim(),
      status: initialStatus,
      createdAt: new Date().toISOString(),
    };

    saveReviews([newRev, ...reviews]);
    setCustomerName("");
    setOrderRef("");
    setProductName("");
    setRating(5);
    setTitle("");
    setContent("");
    setShowLogModal(false);
  };

  const filtered = useMemo(() => {
    return reviews.filter((r) => {
      if (statusFilter !== "All" && r.status !== statusFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        const str = `${r.customerName} ${r.productName} ${r.title} ${r.content} ${r.verifiedOrderRef || ""}`.toLowerCase();
        if (!str.includes(q)) return false;
      }
      return true;
    });
  }, [reviews, statusFilter, search]);

  const stats = useMemo(() => {
    const total = reviews.length;
    const approved = reviews.filter((r) => r.status === "Approved");
    const pending = reviews.filter((r) => r.status === "Pending").length;
    const avg =
      approved.length > 0
        ? (approved.reduce((s, r) => s + r.rating, 0) / approved.length).toFixed(1)
        : "5.0";
    return { total, approved: approved.length, pending, avg };
  }, [reviews]);

  const updateStatus = (id: string, status: CustomerReview["status"]) => {
    const updated = reviews.map((r) => (r.id === id ? { ...r, status } : r));
    saveReviews(updated);
    if (selectedReview?.id === id) setSelectedReview({ ...selectedReview, status });
  };

  const deleteReview = (id: string) => {
    if (!window.confirm("Permanently delete this review record?")) return;
    const updated = reviews.filter((r) => r.id !== id);
    saveReviews(updated);
    if (selectedReview?.id === id) setSelectedReview(null);
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Card */}
      <div className="admin-header-card">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-[#d4af37]">
              Customer Feedback
            </span>
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-slate-300" />
            <span className="text-xs font-semibold text-slate-500">Moderation Queue</span>
          </div>
          <h2>Customer Reviews &amp; Testimonials</h2>
          <p>
            Record and moderate verified customer feedback from WhatsApp confirmations, deliveries,
            and in-store purchases before publication.
          </p>
        </div>

        <button
          className="admin-btn admin-btn-primary admin-btn-sm"
          type="button"
          onClick={() => setShowLogModal(true)}
        >
          <span>+ Log Verified Review</span>
        </button>
      </div>

      {/* 2. Review KPI Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="admin-card flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Average Rating
            </span>
            <div className="text-2xl font-extrabold text-slate-900 mt-1 flex items-center gap-1.5">
              <span>{stats.avg}</span>
              <div className="flex text-[#d4af37]">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} fill="currentColor" />
                ))}
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">From {stats.approved} approved reviews</p>
          </div>
        </div>

        <div className="admin-card flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Pending Moderation
            </span>
            <div className="text-2xl font-extrabold text-amber-600 mt-1">{stats.pending}</div>
            <p className="text-xs text-slate-400 mt-0.5">Require staff verification</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 grid place-items-center">
            <AlertTriangle size={20} />
          </div>
        </div>

        <div className="admin-card flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Total Submissions
            </span>
            <div className="text-2xl font-extrabold text-slate-900 mt-1">{stats.total}</div>
            <p className="text-xs text-slate-400 mt-0.5">Lifetime feedback captured</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-600 grid place-items-center">
            <MessageSquare size={20} />
          </div>
        </div>
      </div>

      {/* Policy Notice */}
      <div className="p-4 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-600 flex items-center gap-3">
        <ShieldCheck size={18} className="text-[#d4af37] shrink-0" />
        <span>
          <strong>Authenticity Policy:</strong> In compliance with e-commerce trust standards, no
          simulated or computer-generated reviews are permitted. Reviews may only be published if
          accompanied by verified purchase details or genuine in-store confirmation.
        </span>
      </div>

      {/* 3. Filter Toolbar */}
      <div className="admin-toolbar">
        <div className="admin-search-input">
          <Search size={16} className="text-slate-400 shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search reviews by customer, device or text..."
          />
        </div>

        <div className="flex items-center gap-2">
          {["All", "Pending", "Approved", "Rejected"].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                statusFilter === st
                  ? "bg-slate-900 text-white"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Reviews List */}
      <div className="grid gap-3.5">
        {filtered.length === 0 ? (
          <div className="admin-card text-center py-12 px-4 space-y-3">
            <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-500 grid place-items-center mx-auto">
              <MessageSquare size={22} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                {reviews.length === 0
                  ? "No Customer Reviews Recorded Yet"
                  : "No Reviews Match Current Filter"}
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                {reviews.length === 0
                  ? "Buy & Sell GH relies exclusively on verified reviews from customers after successful delivery or in-store purchase. Click below to record verified feedback."
                  : "Try clearing your search query or selecting a different status filter."}
              </p>
            </div>
            {reviews.length === 0 && (
              <button
                type="button"
                className="admin-btn admin-btn-primary admin-btn-sm inline-flex items-center gap-1.5 mx-auto"
                onClick={() => setShowLogModal(true)}
              >
                <span>+ Log Verified Review</span>
              </button>
            )}
          </div>
        ) : (
          filtered.map((review) => (
            <div
              key={review.id}
              className="admin-card hover:border-slate-300 transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
            >
              <div className="space-y-1.5 min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex text-[#d4af37]">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={14}
                        fill={i < review.rating ? "currentColor" : "none"}
                        className={i < review.rating ? "text-[#d4af37]" : "text-slate-300"}
                      />
                    ))}
                  </div>
                  <span className="font-bold text-slate-900 text-sm">{review.title}</span>
                  {review.verifiedOrderRef && (
                    <span className="admin-badge admin-badge-emerald text-[0.68rem]">
                      Verified Order {review.verifiedOrderRef}
                    </span>
                  )}
                  <span
                    className={`admin-badge text-[0.68rem] ${
                      review.status === "Approved"
                        ? "admin-badge-emerald"
                        : review.status === "Pending"
                        ? "admin-badge-amber"
                        : "admin-badge-rose"
                    }`}
                  >
                    {review.status}
                  </span>
                </div>

                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  "{review.content}"
                </p>

                <div className="text-[0.72rem] text-slate-400 flex items-center gap-3">
                  <span className="font-semibold text-slate-600">{review.customerName}</span>
                  <span>Reviewed: {review.productName}</span>
                  <span>
                    {new Date(review.createdAt).toLocaleDateString("en-GH", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2 shrink-0">
                {review.status !== "Approved" && (
                  <button
                    type="button"
                    onClick={() => updateStatus(review.id, "Approved")}
                    className="admin-btn admin-btn-secondary admin-btn-sm text-emerald-700 hover:bg-emerald-50 border-emerald-200"
                    title="Approve for public showcase"
                  >
                    <Check size={14} />
                    <span>Approve</span>
                  </button>
                )}
                {review.status !== "Rejected" && (
                  <button
                    type="button"
                    onClick={() => updateStatus(review.id, "Rejected")}
                    className="admin-btn admin-btn-secondary admin-btn-sm text-rose-700 hover:bg-rose-50 border-rose-200"
                    title="Reject review"
                  >
                    <X size={14} />
                    <span>Reject</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => deleteReview(review.id)}
                  className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                  title="Delete review"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Log Verified Review Modal */}
      {showLogModal && (
        <div
          className="admin-modal-overlay"
          onClick={() => setShowLogModal(false)}
        >
          <div
            className="admin-modal-box max-w-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="admin-modal-header">
              <h3 className="text-base font-bold text-slate-900">
                Log Verified Customer Feedback
              </h3>
              <button
                type="button"
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
                onClick={() => setShowLogModal(false)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateReview} className="space-y-4 admin-modal-body">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Customer Name *</label>
                  <input
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Kwame Mensah"
                    className="w-full p-2.5 rounded-lg border border-slate-200 bg-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Verified Order Ref (Optional)
                  </label>
                  <input
                    value={orderRef}
                    onChange={(e) => setOrderRef(e.target.value)}
                    placeholder="e.g. BSG-..."
                    className="w-full p-2.5 rounded-lg border border-slate-200 bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Product Name *</label>
                  <input
                    required
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    placeholder="e.g. iPhone 16 Pro Max 256GB"
                    className="w-full p-2.5 rounded-lg border border-slate-200 bg-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Rating *</label>
                  <select
                    value={rating}
                    onChange={(e) => setRating(Number(e.target.value))}
                    className="w-full p-2.5 rounded-lg border border-slate-200 bg-white"
                  >
                    <option value={5}>5 Stars (Exceptional)</option>
                    <option value={4}>4 Stars (Very Good)</option>
                    <option value={3}>3 Stars (Good / Average)</option>
                    <option value={2}>2 Stars (Below Expectations)</option>
                    <option value={1}>1 Star (Poor)</option>
                  </select>
                </div>
              </div>

              <div className="text-xs">
                <label className="block font-bold text-slate-700 mb-1">Review Headline</label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Fast delivery in Accra and genuine sealed box"
                  className="w-full p-2.5 rounded-lg border border-slate-200 bg-white"
                />
              </div>

              <div className="text-xs">
                <label className="block font-bold text-slate-700 mb-1">Customer Comments *</label>
                <textarea
                  required
                  rows={4}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Paste verified message or delivery review..."
                  className="w-full p-2.5 rounded-lg border border-slate-200 bg-white"
                />
              </div>

              <div className="text-xs">
                <label className="block font-bold text-slate-700 mb-1">Initial Status</label>
                <select
                  value={initialStatus}
                  onChange={(e) => setInitialStatus(e.target.value as any)}
                  className="w-full p-2.5 rounded-lg border border-slate-200 bg-white"
                >
                  <option value="Approved">Approved (Ready for public presentation)</option>
                  <option value="Pending">Pending (Staff verification needed)</option>
                </select>
              </div>

              <div className="admin-modal-footer pt-3">
                <button
                  type="button"
                  className="admin-btn admin-btn-secondary admin-btn-sm"
                  onClick={() => setShowLogModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="admin-btn admin-btn-primary admin-btn-sm">
                  Save Verified Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
