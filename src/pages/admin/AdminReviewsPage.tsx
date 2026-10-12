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

const STORAGE_KEY = "buyandsell_gh_admin_reviews_v1";

const initialReviews: CustomerReview[] = [
  {
    id: "rev-001",
    customerName: "Kwame Asante",
    verifiedOrderRef: "BS-2026-94812",
    productName: "iPhone 16 Pro Max 256GB Natural Titanium",
    rating: 5,
    title: "100% genuine Apple device and fast delivery in Accra",
    content:
      "Ordered in the morning and received it before 3 PM at East Legon. Checked the Apple serial number on checkcoverage.apple.com — brand new with full 1-year Apple warranty. Buy & Sell GH is reliable.",
    status: "Approved",
    createdAt: new Date(Date.now() - 3600000 * 24 * 3).toISOString(),
  },
  {
    id: "rev-002",
    customerName: "Jessica Addo",
    verifiedOrderRef: "BS-2026-10492",
    productName: "AirPods Pro 2 with USB-C",
    rating: 5,
    title: "Active Noise Cancellation is authentic",
    content:
      "Original sealed box with genuine MagSafe case. Pairs seamlessly with iOS 18. Great customer service on WhatsApp as well.",
    status: "Approved",
    createdAt: new Date(Date.now() - 3600000 * 24 * 7).toISOString(),
  },
  {
    id: "rev-003",
    customerName: "Michael Mensah",
    productName: "MacBook Air 15-inch M3",
    rating: 4,
    title: "Great machine, delivery took a bit longer due to traffic",
    content:
      "Laptop is in perfect condition and battery cycle count was 0 out of the box. Delivery took about 2 hours longer than expected due to Circle traffic, but rider communicated properly.",
    status: "Pending",
    createdAt: new Date(Date.now() - 3600000 * 8).toISOString(),
  },
];

export function AdminReviewsPage() {
  const [reviews, setReviews] = useState<CustomerReview[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch {
      // fallback
    }
    return initialReviews;
  });

  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [search, setSearch] = useState("");
  const [selectedReview, setSelectedReview] = useState<CustomerReview | null>(null);

  const saveReviews = (updated: CustomerReview[]) => {
    setReviews(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const filtered = useMemo(() => {
    return reviews.filter((r) => {
      if (statusFilter !== "All" && r.status !== statusFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        const str = `${r.customerName} ${r.productName} ${r.title} ${r.content}`.toLowerCase();
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
            Review genuine customer feedback before publishing. Strict moderation prevents fake,
            unverified, or fraudulent testimonials.
          </p>
        </div>
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
          <div className="admin-card text-center py-12 text-slate-400 font-medium">
            No reviews match the current filter.
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
    </div>
  );
}
