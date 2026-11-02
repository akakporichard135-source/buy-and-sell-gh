import {
  AlertCircle,
  Archive,
  ArrowRight,
  BarChart3,
  Calendar,
  CheckCircle2,
  Clock,
  Copy,
  DollarSign,
  Edit3,
  ExternalLink,
  Eye,
  Filter,
  Gift,
  HelpCircle,
  Image as ImageIcon,
  Layers,
  MousePointerClick,
  Percent,
  Plus,
  Power,
  RefreshCw,
  Search,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Tag,
  Trash2,
  TrendingUp,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useProductCatalog } from "../../catalog/ProductCatalogContext";
import { defaultPromotions } from "../../promotions/defaultPromotions";
import {
  archivePromotion,
  deletePromotion,
  duplicatePromotion,
  fetchPromotions,
  savePromotion,
  subscribeToPromotions,
  togglePromotionEnabled,
} from "../../promotions/supabasePromotionsRepository";
import type { PromotionCampaign, PromotionStatus, PromotionType } from "../../types/promotion";
import { formatGhs } from "../../utils/format";
import { AdminMediaLibrary } from "./AdminMediaLibrary";
import type { MediaItem } from "../../cms/types";

type TabKey = "all" | "active" | "scheduled" | "draft" | "expired" | "archived";

export function AdminPromotionsPage() {
  const { products } = useProductCatalog();
  const [promotions, setPromotions] = useState<PromotionCampaign[]>(defaultPromotions);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  // Editor Modal State
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Partial<PromotionCampaign> | null>(null);
  const [editorTab, setEditorTab] = useState<"info" | "target" | "benefits" | "flyers" | "scheduling" | "preview">("info");
  const [saving, setSaving] = useState(false);
  const [editorError, setEditorError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState("");

  // Media Library Picker State
  const [mediaPickerTarget, setMediaPickerTarget] = useState<"desktop" | "mobile" | "gift" | null>(null);

  // Delete Confirmation Modal State
  const [deleteCandidate, setDeleteCandidate] = useState<PromotionCampaign | null>(null);
  const [deleteInput, setDeleteInput] = useState("");
  const [deleting, setDeleting] = useState(false);

  // Load promotions on mount and subscribe
  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchPromotions(true);
      setPromotions(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
    const unsubscribe = subscribeToPromotions(() => {
      void loadData();
    });
    return unsubscribe;
  }, []);

  // Filtered List
  const filteredPromotions = useMemo(() => {
    return promotions.filter((promo) => {
      // 1. Tab filter
      if (activeTab === "active" && (promo.status !== "active" || !promo.isEnabled)) return false;
      if (activeTab === "scheduled" && promo.status !== "scheduled") return false;
      if (activeTab === "draft" && promo.status !== "draft") return false;
      if (activeTab === "expired" && promo.status !== "expired") return false;
      if (activeTab === "archived" && promo.status !== "archived") return false;

      // 2. Type filter
      if (typeFilter !== "all" && promo.promotionType !== typeFilter) return false;

      // 3. Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const str = `${promo.title} ${promo.slug} ${promo.shortDescription} ${promo.promotionType}`.toLowerCase();
        if (!str.includes(q)) return false;
      }

      return true;
    }).sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
  }, [promotions, activeTab, typeFilter, searchQuery]);

  // Aggregate Performance Metrics
  const stats = useMemo(() => {
    const totalCampaigns = promotions.length;
    const activeCount = promotions.filter((p) => p.status === "active" && p.isEnabled).length;
    const totalViews = promotions.reduce((sum, p) => sum + (p.viewCount || 0), 0);
    const totalClicks = promotions.reduce((sum, p) => sum + (p.clickCount || 0), 0);
    const totalOrders = promotions.reduce((sum, p) => sum + (p.ordersCount || 0), 0);
    const totalDiscountGiven = promotions.reduce((sum, p) => sum + (p.totalDiscountGiven || 0), 0);
    const totalGiftsAllocated = promotions.reduce((sum, p) => sum + (p.totalGiftsAllocated || 0), 0);
    const totalAttributedSales = promotions.reduce((sum, p) => sum + (p.totalAttributedSales || 0), 0);

    return {
      totalCampaigns,
      activeCount,
      totalViews,
      totalClicks,
      totalOrders,
      totalDiscountGiven,
      totalGiftsAllocated,
      totalAttributedSales,
    };
  }, [promotions]);

  // Handlers
  const handleOpenCreate = () => {
    const newId = `promo-${Date.now()}`;
    setEditingCampaign({
      id: newId,
      slug: `promo-campaign-${Date.now().toString().slice(-4)}`,
      title: "",
      shortDescription: "",
      detailedDescription: "",
      promotionType: "free_gift",
      status: "draft",
      isEnabled: true,
      startDate: new Date().toISOString().slice(0, 16),
      endDate: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 16),
      timezone: "Africa/Accra",
      priority: 5,
      allowStacking: false,
      eligibleProductIds: [],
      eligibleCategory: "all",
      eligibleVariantIds: [],
      eligibleStorageOptions: [],
      minOrderSubtotal: 0,
      giftQuantityPerPurchase: 1,
      maxGiftsPerOrder: 1,
      giftStockQuantity: 20,
      giftStockAlertThreshold: 5,
      ctaText: "Shop Eligible Items",
      ctaDestination: "/store",
      displayOrder: promotions.length + 1,
      showOnAnnouncementBar: false,
      announcementBarText: "",
      showOnHomepageCarousel: true,
      showOnOffersPage: true,
      totalRedemptionLimit: null,
      customerRedemptionLimit: 1,
    });
    setEditorTab("info");
    setEditorError("");
    setSaveSuccess("");
    setIsEditorOpen(true);
  };

  const handleOpenEdit = (campaign: PromotionCampaign) => {
    setEditingCampaign({
      ...campaign,
      startDate: campaign.startDate ? campaign.startDate.slice(0, 16) : "",
      endDate: campaign.endDate ? campaign.endDate.slice(0, 16) : "",
    });
    setEditorTab("info");
    setEditorError("");
    setSaveSuccess("");
    setIsEditorOpen(true);
  };

  const handleToggleEnabled = async (campaign: PromotionCampaign) => {
    try {
      await togglePromotionEnabled(campaign.id, !campaign.isEnabled);
      await loadData();
    } catch (err: any) {
      alert(`Could not toggle status: ${err.message}`);
    }
  };

  const handleDuplicate = async (campaign: PromotionCampaign) => {
    try {
      await duplicatePromotion(campaign.id);
      await loadData();
    } catch (err: any) {
      alert(`Could not duplicate campaign: ${err.message}`);
    }
  };

  const handleArchive = async (campaign: PromotionCampaign) => {
    try {
      await archivePromotion(campaign.id);
      await loadData();
    } catch (err: any) {
      alert(`Could not update archive status: ${err.message}`);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteCandidate) return;
    if (deleteInput !== deleteCandidate.title) {
      alert("Please type the exact campaign title to confirm deletion.");
      return;
    }
    setDeleting(true);
    try {
      await deletePromotion(deleteCandidate.id);
      setDeleteCandidate(null);
      setDeleteInput("");
      await loadData();
    } catch (err: any) {
      alert(`Could not delete campaign: ${err.message}`);
    } finally {
      setDeleting(false);
    }
  };

  const handleSaveCampaign = async (publishImmediately = false) => {
    if (!editingCampaign) return;
    setEditorError("");
    setSaveSuccess("");

    if (!editingCampaign.title?.trim()) {
      setEditorError("Please enter a campaign title.");
      setEditorTab("info");
      return;
    }

    if (!editingCampaign.slug?.trim()) {
      setEditorError("Please enter a unique campaign URL slug.");
      setEditorTab("info");
      return;
    }

    // Validation per type
    if (editingCampaign.promotionType === "free_gift") {
      if (!editingCampaign.giftProductName && !editingCampaign.giftProductId) {
        setEditorError("Free gift promotions require a selected gift product or name.");
        setEditorTab("benefits");
        return;
      }
      if ((editingCampaign.giftStockQuantity ?? 0) <= 0 && publishImmediately) {
        setEditorError("Promotional gift stock must be greater than 0 to publish.");
        setEditorTab("benefits");
        return;
      }
    } else if (editingCampaign.promotionType === "percentage_discount") {
      const pct = Number(editingCampaign.discountPercent);
      if (!pct || pct <= 0 || pct > 100) {
        setEditorError("Percentage discount must be between 1% and 100%.");
        setEditorTab("benefits");
        return;
      }
    } else if (editingCampaign.promotionType === "fixed_discount") {
      const amt = Number(editingCampaign.discountAmount);
      if (!amt || amt <= 0) {
        setEditorError("Fixed discount amount must be greater than GH₵0.");
        setEditorTab("benefits");
        return;
      }
    }

    setSaving(true);
    try {
      const payload: Partial<PromotionCampaign> = {
        ...editingCampaign,
        status: publishImmediately ? "active" : editingCampaign.status || "draft",
        startDate: editingCampaign.startDate ? new Date(editingCampaign.startDate).toISOString() : null,
        endDate: editingCampaign.endDate ? new Date(editingCampaign.endDate).toISOString() : null,
      };

      await savePromotion(payload);
      setSaveSuccess(publishImmediately ? "Campaign published successfully!" : "Draft saved successfully!");
      await loadData();
      setTimeout(() => {
        setIsEditorOpen(false);
      }, 900);
    } catch (err: any) {
      setEditorError(err.message || "Failed to save promotion campaign.");
    } finally {
      setSaving(false);
    }
  };

  const handleSelectMedia = (item: MediaItem) => {
    if (!editingCampaign || !mediaPickerTarget) return;

    if (mediaPickerTarget === "desktop") {
      setEditingCampaign((prev) => ({
        ...prev,
        desktopFlyerUrl: item.url,
        flyerAltText: prev?.flyerAltText || item.alt || prev?.title || "",
      }));
    } else if (mediaPickerTarget === "mobile") {
      setEditingCampaign((prev) => ({
        ...prev,
        mobileFlyerUrl: item.url,
      }));
    } else if (mediaPickerTarget === "gift") {
      setEditingCampaign((prev) => ({
        ...prev,
        giftProductImage: item.url,
        giftProductName: prev?.giftProductName || item.title,
      }));
    }
    setMediaPickerTarget(null);
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Card */}
      <div className="admin-header-card">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-[#d4af37]">
              Marketing &amp; Growth
            </span>
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-slate-300" />
            <span className="text-xs font-semibold text-slate-500">Live Campaign Engine</span>
          </div>
          <h2>Promotions &amp; Campaigns</h2>
          <p>
            Create, schedule, and publish customer promotions, flyer carousels, free gift bundles, and instant checkout discounts.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            className="admin-btn admin-btn-secondary"
            onClick={loadData}
            disabled={loading}
          >
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
            <span>Refresh</span>
          </button>
          <button
            type="button"
            className="admin-btn admin-btn-primary"
            onClick={handleOpenCreate}
          >
            <Plus size={16} />
            <span>Create Campaign</span>
          </button>
        </div>
      </div>

      {/* 2. Performance Summary KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="admin-card">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Active Campaigns</span>
            <Sparkles size={16} className="text-[#d4af37]" />
          </div>
          <div className="text-2xl font-black text-slate-900">{stats.activeCount}</div>
          <p className="text-xs text-slate-500 mt-1">{stats.totalCampaigns} total registered</p>
        </div>

        <div className="admin-card">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Attributed Sales</span>
            <TrendingUp size={16} className="text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{formatGhs(stats.totalAttributedSales)}</div>
          <p className="text-xs text-slate-500 mt-1">{stats.totalOrders} qualifying orders</p>
        </div>

        <div className="admin-card">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Discounts Awarded</span>
            <Percent size={16} className="text-amber-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{formatGhs(stats.totalDiscountGiven)}</div>
          <p className="text-xs text-slate-500 mt-1">{stats.totalGiftsAllocated} free gifts granted</p>
        </div>

        <div className="admin-card">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Flyer Engagement</span>
            <MousePointerClick size={16} className="text-blue-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {stats.totalClicks} <span className="text-xs font-semibold text-slate-400">/ {stats.totalViews} views</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {stats.totalViews > 0 ? Math.round((stats.totalClicks / stats.totalViews) * 100) : 0}% click-through rate
          </p>
        </div>
      </div>

      {/* 3. Filter Tabs & Search Bar */}
      <div className="admin-card space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
          {/* Navigation Tabs */}
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: "all", label: "All Campaigns", count: promotions.length },
              { id: "active", label: "Active", count: promotions.filter((p) => p.status === "active" && p.isEnabled).length },
              { id: "scheduled", label: "Scheduled", count: promotions.filter((p) => p.status === "scheduled").length },
              { id: "draft", label: "Drafts", count: promotions.filter((p) => p.status === "draft").length },
              { id: "expired", label: "Expired", count: promotions.filter((p) => p.status === "expired").length },
              { id: "archived", label: "Archived", count: promotions.filter((p) => p.status === "archived").length },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                className={`admin-btn admin-btn-sm ${
                  activeTab === tab.id ? "admin-btn-primary" : "admin-btn-secondary"
                }`}
                onClick={() => setActiveTab(tab.id as TabKey)}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                    activeTab === tab.id ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          <Link to="/offers" target="_blank" className="admin-btn admin-btn-sm admin-btn-secondary text-xs">
            <ExternalLink size={13} />
            <span>View Public /offers</span>
          </Link>
        </div>

        {/* Search & Type filter */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2 relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              className="admin-input pl-10"
              placeholder="Search campaigns by title, description or slug..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div>
            <select
              className="admin-input"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="all">All Promotion Types</option>
              <option value="free_gift">Buy Product, Get Free Gift</option>
              <option value="percentage_discount">Percentage Discount (%)</option>
              <option value="fixed_discount">Fixed Amount Discount (GH₵)</option>
              <option value="promotional_price">Promotional Product Price</option>
              <option value="bundle">Bundle Offer</option>
              <option value="advertising">Advertising-Only Campaign</option>
            </select>
          </div>
        </div>
      </div>

      {/* 4. Campaigns Listing Table */}
      <div className="admin-card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="admin-data-table w-full text-left">
            <thead>
              <tr>
                <th style={{ width: 60 }}>Flyer</th>
                <th>Campaign &amp; Offer</th>
                <th>Type</th>
                <th>Status</th>
                <th>Schedule</th>
                <th>Performance</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPromotions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-500">
                    <Sparkles size={32} className="mx-auto text-slate-300 mb-2" />
                    <p className="font-semibold text-slate-700">No campaigns found matching criteria.</p>
                    <p className="text-xs text-slate-400 mt-1">Try resetting filters or create a new campaign.</p>
                  </td>
                </tr>
              ) : (
                filteredPromotions.map((promo) => {
                  const flyerUrl = promo.desktopFlyerUrl || promo.mobileFlyerUrl;
                  const isLive = promo.status === "active" && promo.isEnabled;

                  return (
                    <tr key={promo.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Flyer Thumbnail */}
                      <td className="py-3 px-4">
                        <div className="w-14 h-10 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center">
                          {flyerUrl ? (
                            <img src={flyerUrl} alt={promo.title} className="w-full h-full object-cover" />
                          ) : (
                            <ImageIcon size={18} className="text-slate-400" />
                          )}
                        </div>
                      </td>

                      {/* Title & Description */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 text-sm">{promo.title}</div>
                        <div className="text-xs text-slate-500 line-clamp-1">{promo.shortDescription}</div>
                        <div className="text-[11px] text-slate-400 font-mono mt-0.5">/{promo.slug}</div>
                      </td>

                      {/* Type Badge */}
                      <td className="py-3 px-4">
                        <span
                          className={`admin-badge text-xs px-2.5 py-0.5 ${
                            promo.promotionType === "free_gift"
                              ? "admin-badge-amber"
                              : promo.promotionType === "percentage_discount" || promo.promotionType === "fixed_discount"
                              ? "admin-badge-emerald"
                              : "admin-badge-blue"
                          }`}
                        >
                          {promo.promotionType === "free_gift"
                            ? "Free Gift"
                            : promo.promotionType === "percentage_discount"
                            ? `${promo.discountPercent}% Off`
                            : promo.promotionType === "fixed_discount"
                            ? `Save GH₵${promo.discountAmount}`
                            : promo.promotionType === "promotional_price"
                            ? `GH₵${promo.promotionalPrice}`
                            : promo.promotionType === "bundle"
                            ? "Bundle"
                            : "Announcement"}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleToggleEnabled(promo)}
                            title={promo.isEnabled ? "Click to disable" : "Click to enable"}
                            className={`w-7 h-4 flex items-center rounded-full p-0.5 transition-colors ${
                              promo.isEnabled ? "bg-emerald-500 justify-end" : "bg-slate-300 justify-start"
                            }`}
                          >
                            <span className="w-3 h-3 rounded-full bg-white shadow-sm" />
                          </button>
                          <span
                            className={`text-xs font-semibold ${
                              isLive
                                ? "text-emerald-700"
                                : promo.status === "archived"
                                ? "text-rose-600"
                                : "text-slate-500"
                            }`}
                          >
                            {isLive ? "Active" : !promo.isEnabled ? "Disabled" : promo.status}
                          </span>
                        </div>
                      </td>

                      {/* Schedule */}
                      <td className="py-3 px-4 text-xs text-slate-600">
                        {promo.endDate ? (
                          <div>
                            <div>Until {new Date(promo.endDate).toLocaleDateString("en-GH", { month: "short", day: "numeric" })}</div>
                            <div className="text-[10px] text-slate-400">Timezone: GMT</div>
                          </div>
                        ) : (
                          <span className="text-slate-400">Ongoing</span>
                        )}
                      </td>

                      {/* Performance */}
                      <td className="py-3 px-4 text-xs">
                        <div className="font-bold text-slate-900">{promo.ordersCount} orders</div>
                        <div className="text-[11px] text-slate-500">
                          {promo.promotionType === "free_gift"
                            ? `${promo.totalGiftsAllocated} gifts granted`
                            : `Saved ${formatGhs(promo.totalDiscountGiven)}`}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            className="p-1.5 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
                            title="Edit campaign"
                            onClick={() => handleOpenEdit(promo)}
                          >
                            <Edit3 size={15} />
                          </button>
                          <button
                            type="button"
                            className="p-1.5 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
                            title="Duplicate as new draft"
                            onClick={() => handleDuplicate(promo)}
                          >
                            <Copy size={15} />
                          </button>
                          <button
                            type="button"
                            className="p-1.5 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
                            title={promo.status === "archived" ? "Restore from archive" : "Archive campaign"}
                            onClick={() => handleArchive(promo)}
                          >
                            <Archive size={15} />
                          </button>
                          <button
                            type="button"
                            className="p-1.5 text-rose-500 hover:text-rose-700 rounded-lg hover:bg-rose-50"
                            title="Delete campaign"
                            onClick={() => {
                              setDeleteCandidate(promo);
                              setDeleteInput("");
                            }}
                          >
                            <Trash2 size={15} />
                          </button>
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

      {/* 5. Campaign Editor Drawer / Modal */}
      {isEditorOpen && editingCampaign && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-300">
            {/* Modal Header */}
            <header className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#d4af37]">
                  {editingCampaign.id?.startsWith("promo-") && !promotions.some((p) => p.id === editingCampaign.id)
                    ? "New Campaign"
                    : "Edit Campaign"}
                </span>
                <h3 className="text-lg font-bold text-slate-900">
                  {editingCampaign.title || "Untitled Promotion"}
                </h3>
              </div>
              <button
                type="button"
                className="p-2 text-slate-400 hover:text-slate-700 rounded-lg"
                onClick={() => setIsEditorOpen(false)}
              >
                <X size={20} />
              </button>
            </header>

            {/* Sub-tabs */}
            <div className="flex border-b border-slate-200 bg-white px-4 text-xs font-bold overflow-x-auto">
              {[
                { id: "info", label: "1. Info & Type" },
                { id: "target", label: "2. Eligibility" },
                { id: "benefits", label: "3. Benefits & Gifts" },
                { id: "flyers", label: "4. Flyers & Media" },
                { id: "scheduling", label: "5. Schedule & Placements" },
                { id: "preview", label: "6. Preview" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  className={`py-3 px-3.5 border-b-2 whitespace-nowrap ${
                    editorTab === tab.id
                      ? "border-[#d4af37] text-slate-900"
                      : "border-transparent text-slate-500 hover:text-slate-800"
                  }`}
                  onClick={() => setEditorTab(tab.id as any)}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Error & Success Alerts */}
            {editorError && (
              <div className="p-3 bg-rose-50 border-b border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
                <AlertCircle size={15} />
                <span>{editorError}</span>
              </div>
            )}
            {saveSuccess && (
              <div className="p-3 bg-emerald-50 border-b border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 size={15} />
                <span>{saveSuccess}</span>
              </div>
            )}

            {/* Tab Form Contents */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              {/* TAB 1: INFO & TYPE */}
              {editorTab === "info" && (
                <div className="space-y-4">
                  <div>
                    <label className="admin-label">Campaign Title *</label>
                    <input
                      type="text"
                      className="admin-input"
                      placeholder="e.g. Free MagSafe Case with iPhone"
                      value={editingCampaign.title || ""}
                      onChange={(e) => {
                        const title = e.target.value;
                        const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
                        setEditingCampaign((prev) => ({
                          ...prev,
                          title,
                          slug: prev?.slug ? prev.slug : slug,
                        }));
                      }}
                    />
                  </div>

                  <div>
                    <label className="admin-label">URL Slug *</label>
                    <div className="flex items-center gap-1 text-slate-400 text-xs font-mono">
                      <span>buyandsellgh.com/offers#</span>
                      <input
                        type="text"
                        className="admin-input flex-1 font-mono"
                        value={editingCampaign.slug || ""}
                        onChange={(e) => setEditingCampaign((prev) => ({ ...prev, slug: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="admin-label">Promotion Type *</label>
                    <div className="grid grid-cols-2 gap-2.5">
                      {[
                        { id: "free_gift", title: "Free Gift", desc: "Buy device, get free accessory" },
                        { id: "percentage_discount", title: "Percentage Off", desc: "e.g. 10% off accessories" },
                        { id: "fixed_discount", title: "Fixed Discount", desc: "e.g. Save GH₵200 on Mac mini" },
                        { id: "promotional_price", title: "Promotional Price", desc: "Temporary special price" },
                        { id: "bundle", title: "Bundle Offer", desc: "Buy phone + accessory together" },
                        { id: "advertising", title: "Advertising Event", desc: "Flyer / announcement only" },
                      ].map((t) => (
                        <div
                          key={t.id}
                          onClick={() => setEditingCampaign((prev) => ({ ...prev, promotionType: t.id as PromotionType }))}
                          className={`p-3 rounded-xl border cursor-pointer transition-all ${
                            editingCampaign.promotionType === t.id
                              ? "border-[#d4af37] bg-[#fefce8] text-slate-900"
                              : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                          }`}
                        >
                          <div className="font-bold text-xs">{t.title}</div>
                          <div className="text-[11px] text-slate-500 mt-0.5">{t.desc}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="admin-label">Short Summary (for Cards &amp; Sliders)</label>
                    <textarea
                      rows={2}
                      className="admin-input"
                      placeholder="One-sentence teaser of the offer..."
                      value={editingCampaign.shortDescription || ""}
                      onChange={(e) => setEditingCampaign((prev) => ({ ...prev, shortDescription: e.target.value }))}
                    />
                  </div>

                  <div>
                    <label className="admin-label">Detailed Terms &amp; Explanation (for /offers)</label>
                    <textarea
                      rows={3}
                      className="admin-input"
                      placeholder="Full description, redemption instructions, and showroom details..."
                      value={editingCampaign.detailedDescription || ""}
                      onChange={(e) => setEditingCampaign((prev) => ({ ...prev, detailedDescription: e.target.value }))}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="admin-label">Call to Action Text</label>
                      <input
                        type="text"
                        className="admin-input"
                        placeholder="e.g. Shop Eligible iPhones"
                        value={editingCampaign.ctaText || ""}
                        onChange={(e) => setEditingCampaign((prev) => ({ ...prev, ctaText: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="admin-label">CTA Destination URL</label>
                      <input
                        type="text"
                        className="admin-input"
                        placeholder="e.g. /iphone or /store"
                        value={editingCampaign.ctaDestination || ""}
                        onChange={(e) => setEditingCampaign((prev) => ({ ...prev, ctaDestination: e.target.value }))}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: TARGET & ELIGIBILITY */}
              {editorTab === "target" && (
                <div className="space-y-4">
                  <div>
                    <label className="admin-label">Target Category</label>
                    <select
                      className="admin-input"
                      value={editingCampaign.eligibleCategory || "all"}
                      onChange={(e) => setEditingCampaign((prev) => ({ ...prev, eligibleCategory: e.target.value }))}
                    >
                      <option value="all">All Categories</option>
                      <option value="iPhones">iPhones</option>
                      <option value="iPads">iPads</option>
                      <option value="MacBooks">MacBooks / Macs</option>
                      <option value="Apple Watches">Apple Watches</option>
                      <option value="AirPods">AirPods</option>
                      <option value="Accessories">Accessories</option>
                    </select>
                  </div>

                  <div>
                    <label className="admin-label">Eligible Products (Multi-select)</label>
                    <p className="text-xs text-slate-500 mb-2">
                      Leave empty to apply to all products in the selected category, or select specific eligible models:
                    </p>
                    <div className="max-h-56 overflow-y-auto border border-slate-200 rounded-xl p-2 space-y-1">
                      {products.map((prod) => {
                        const isSelected = editingCampaign.eligibleProductIds?.includes(prod.id) ||
                          editingCampaign.eligibleProductIds?.includes(prod.slug);

                        return (
                          <label
                            key={prod.id}
                            className={`flex items-center gap-2.5 p-2 rounded-lg text-xs cursor-pointer ${
                              isSelected ? "bg-amber-50 font-bold text-slate-900" : "hover:bg-slate-50 text-slate-700"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={Boolean(isSelected)}
                              onChange={(e) => {
                                const current = editingCampaign.eligibleProductIds || [];
                                const next = e.target.checked
                                  ? [...current, prod.id]
                                  : current.filter((id) => id !== prod.id && id !== prod.slug);
                                setEditingCampaign((prev) => ({ ...prev, eligibleProductIds: next }));
                              }}
                            />
                            <span>{prod.name}</span>
                            <span className="text-[10px] text-slate-400 font-mono">({prod.category})</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="admin-label">Eligible Storage Options (Optional)</label>
                    <p className="text-xs text-slate-500 mb-2">
                      If selected, only matching storage configurations will trigger this promotion:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {["64GB", "128GB", "256GB", "512GB", "1TB", "2TB"].map((cap) => {
                        const isSelected = editingCampaign.eligibleStorageOptions?.includes(cap);
                        return (
                          <button
                            key={cap}
                            type="button"
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${
                              isSelected ? "bg-[#d4af37] text-white border-[#d4af37]" : "border-slate-200 text-slate-700"
                            }`}
                            onClick={() => {
                              const current = editingCampaign.eligibleStorageOptions || [];
                              const next = isSelected ? current.filter((c) => c !== cap) : [...current, cap];
                              setEditingCampaign((prev) => ({ ...prev, eligibleStorageOptions: next }));
                            }}
                          >
                            {cap}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="admin-label">Minimum Order Subtotal (GH₵)</label>
                    <input
                      type="number"
                      className="admin-input"
                      placeholder="0 for no minimum"
                      value={editingCampaign.minOrderSubtotal ?? 0}
                      onChange={(e) => setEditingCampaign((prev) => ({ ...prev, minOrderSubtotal: Number(e.target.value) }))}
                    />
                  </div>
                </div>
              )}

              {/* TAB 3: BENEFITS & GIFTS */}
              {editorTab === "benefits" && (
                <div className="space-y-4">
                  {editingCampaign.promotionType === "free_gift" && (
                    <div className="space-y-4 p-4 rounded-xl bg-amber-50/70 border border-amber-200">
                      <div className="flex items-center gap-2 text-amber-800 font-bold text-xs uppercase tracking-wider">
                        <Gift size={16} />
                        <span>Free Gift Configuration</span>
                      </div>

                      <div>
                        <label className="admin-label">Gift Product Name *</label>
                        <input
                          type="text"
                          className="admin-input"
                          placeholder="e.g. Apple iPhone Case with MagSafe"
                          value={editingCampaign.giftProductName || ""}
                          onChange={(e) => setEditingCampaign((prev) => ({ ...prev, giftProductName: e.target.value }))}
                        />
                      </div>

                      <div>
                        <label className="admin-label">Gift Product SKU or ID (In Catalog)</label>
                        <select
                          className="admin-input"
                          value={editingCampaign.giftProductId || ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            const matched = products.find((p) => p.id === val || p.slug === val);
                            setEditingCampaign((prev) => ({
                              ...prev,
                              giftProductId: val,
                              giftProductSlug: matched?.slug || val,
                              giftProductName: prev?.giftProductName || matched?.name || "",
                              giftProductImage: prev?.giftProductImage || matched?.images[0]?.src || "",
                            }));
                          }}
                        >
                          <option value="">Select from catalog or custom gift</option>
                          {products
                            .filter((p) => p.category === "Accessories")
                            .map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.name}
                              </option>
                            ))}
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="admin-label">Available Promotional Stock *</label>
                          <input
                            type="number"
                            className="admin-input"
                            value={editingCampaign.giftStockQuantity ?? 0}
                            onChange={(e) => setEditingCampaign((prev) => ({ ...prev, giftStockQuantity: Math.max(0, Number(e.target.value)) }))}
                          />
                        </div>
                        <div>
                          <label className="admin-label">Low Stock Alert Threshold</label>
                          <input
                            type="number"
                            className="admin-input"
                            value={editingCampaign.giftStockAlertThreshold ?? 5}
                            onChange={(e) => setEditingCampaign((prev) => ({ ...prev, giftStockAlertThreshold: Math.max(0, Number(e.target.value)) }))}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="admin-label">Gifts Per Qualifying Purchase</label>
                          <input
                            type="number"
                            className="admin-input"
                            value={editingCampaign.giftQuantityPerPurchase ?? 1}
                            onChange={(e) => setEditingCampaign((prev) => ({ ...prev, giftQuantityPerPurchase: Math.max(1, Number(e.target.value)) }))}
                          />
                        </div>
                        <div>
                          <label className="admin-label">Max Gifts Per Order</label>
                          <input
                            type="number"
                            className="admin-input"
                            value={editingCampaign.maxGiftsPerOrder ?? 1}
                            onChange={(e) => setEditingCampaign((prev) => ({ ...prev, maxGiftsPerOrder: Math.max(1, Number(e.target.value)) }))}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {editingCampaign.promotionType === "percentage_discount" && (
                    <div>
                      <label className="admin-label">Discount Percentage (%) *</label>
                      <input
                        type="number"
                        className="admin-input"
                        placeholder="e.g. 10"
                        min={1}
                        max={100}
                        value={editingCampaign.discountPercent ?? ""}
                        onChange={(e) => setEditingCampaign((prev) => ({ ...prev, discountPercent: Number(e.target.value) }))}
                      />
                      <p className="text-xs text-slate-500 mt-1">Calculates discount from the published variant price.</p>
                    </div>
                  )}

                  {editingCampaign.promotionType === "fixed_discount" && (
                    <div>
                      <label className="admin-label">Fixed Discount Amount (GH₵) *</label>
                      <input
                        type="number"
                        className="admin-input"
                        placeholder="e.g. 200"
                        min={1}
                        value={editingCampaign.discountAmount ?? ""}
                        onChange={(e) => setEditingCampaign((prev) => ({ ...prev, discountAmount: Number(e.target.value) }))}
                      />
                      <p className="text-xs text-slate-500 mt-1">Will never exceed the item's unit selling price.</p>
                    </div>
                  )}

                  {editingCampaign.promotionType === "promotional_price" && (
                    <div>
                      <label className="admin-label">Temporary Promotional Price (GH₵) *</label>
                      <input
                        type="number"
                        className="admin-input"
                        placeholder="e.g. 12500"
                        min={1}
                        value={editingCampaign.promotionalPrice ?? ""}
                        onChange={(e) => setEditingCampaign((prev) => ({ ...prev, promotionalPrice: Number(e.target.value) }))}
                      />
                      <p className="text-xs text-slate-500 mt-1">Original price is preserved and restored upon campaign expiry.</p>
                    </div>
                  )}

                  {editingCampaign.promotionType === "advertising" && (
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
                      <strong>Advertising-Only Campaign:</strong> This flyer or announcement directs customers to your configured CTA destination without applying checkout discounts.
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: FLYERS & MEDIA */}
              {editorTab === "flyers" && (
                <div className="space-y-4">
                  {/* Desktop Flyer */}
                  <div>
                    <label className="admin-label">Desktop Promotional Flyer URL</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        className="admin-input flex-1"
                        placeholder="https://... or /products/campaigns/..."
                        value={editingCampaign.desktopFlyerUrl || ""}
                        onChange={(e) => setEditingCampaign((prev) => ({ ...prev, desktopFlyerUrl: e.target.value }))}
                      />
                      <button
                        type="button"
                        className="admin-btn admin-btn-secondary shrink-0"
                        onClick={() => setMediaPickerTarget("desktop")}
                      >
                        <ImageIcon size={15} />
                        <span>Media Library</span>
                      </button>
                    </div>
                  </div>

                  {/* Mobile Flyer */}
                  <div>
                    <label className="admin-label">Mobile Promotional Flyer URL (Optional)</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        className="admin-input flex-1"
                        placeholder="Optimized 9:16 or square mobile flyer..."
                        value={editingCampaign.mobileFlyerUrl || ""}
                        onChange={(e) => setEditingCampaign((prev) => ({ ...prev, mobileFlyerUrl: e.target.value }))}
                      />
                      <button
                        type="button"
                        className="admin-btn admin-btn-secondary shrink-0"
                        onClick={() => setMediaPickerTarget("mobile")}
                      >
                        <ImageIcon size={15} />
                        <span>Media Library</span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="admin-label">Flyer Alt Text (Accessibility &amp; SEO)</label>
                    <input
                      type="text"
                      className="admin-input"
                      placeholder="e.g. Promotional flyer: Buy an eligible iPhone and get a free case"
                      value={editingCampaign.flyerAltText || ""}
                      onChange={(e) => setEditingCampaign((prev) => ({ ...prev, flyerAltText: e.target.value }))}
                    />
                  </div>

                  {/* Preview of uploaded image */}
                  {(editingCampaign.desktopFlyerUrl || editingCampaign.mobileFlyerUrl) && (
                    <div className="border border-slate-200 rounded-xl p-3 bg-slate-50">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
                        Flyer Asset Preview
                      </span>
                      <div className="rounded-lg overflow-hidden border border-slate-200 bg-white max-h-56">
                        <img
                          src={editingCampaign.desktopFlyerUrl || editingCampaign.mobileFlyerUrl}
                          alt="Flyer preview"
                          className="w-full h-auto object-cover"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 5: SCHEDULING & PLACEMENTS */}
              {editorTab === "scheduling" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="admin-label">Start Date &amp; Time (GMT / Ghana Time)</label>
                      <input
                        type="datetime-local"
                        className="admin-input"
                        value={editingCampaign.startDate || ""}
                        onChange={(e) => setEditingCampaign((prev) => ({ ...prev, startDate: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="admin-label">End Date &amp; Time (GMT / Ghana Time)</label>
                      <input
                        type="datetime-local"
                        className="admin-input"
                        value={editingCampaign.endDate || ""}
                        onChange={(e) => setEditingCampaign((prev) => ({ ...prev, endDate: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="admin-label">Total Redemptions Limit</label>
                      <input
                        type="number"
                        className="admin-input"
                        placeholder="Leave empty for unlimited"
                        value={editingCampaign.totalRedemptionLimit ?? ""}
                        onChange={(e) => setEditingCampaign((prev) => ({ ...prev, totalRedemptionLimit: e.target.value ? Number(e.target.value) : null }))}
                      />
                    </div>
                    <div>
                      <label className="admin-label">Display Priority (Higher = Evaluated First)</label>
                      <input
                        type="number"
                        className="admin-input"
                        value={editingCampaign.priority ?? 5}
                        onChange={(e) => setEditingCampaign((prev) => ({ ...prev, priority: Number(e.target.value) }))}
                      />
                    </div>
                  </div>

                  {/* Surface Placements */}
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <span className="text-xs font-bold text-slate-700 block mb-1">
                      Storefront Surface Visibility
                    </span>

                    <label className="flex items-center gap-2.5 text-xs text-slate-800 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editingCampaign.showOnHomepageCarousel !== false}
                        onChange={(e) => setEditingCampaign((prev) => ({ ...prev, showOnHomepageCarousel: e.target.checked }))}
                      />
                      <span>Feature in Homepage Flyer Carousel (&ldquo;Special Offers. More to Love.&rdquo;)</span>
                    </label>

                    <label className="flex items-center gap-2.5 text-xs text-slate-800 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editingCampaign.showOnOffersPage !== false}
                        onChange={(e) => setEditingCampaign((prev) => ({ ...prev, showOnOffersPage: e.target.checked }))}
                      />
                      <span>Display on dedicated public /offers directory</span>
                    </label>

                    <label className="flex items-center gap-2.5 text-xs text-slate-800 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={Boolean(editingCampaign.showOnAnnouncementBar)}
                        onChange={(e) => setEditingCampaign((prev) => ({ ...prev, showOnAnnouncementBar: e.target.checked }))}
                      />
                      <span>Include in Homepage Rotating Top Announcement Bar</span>
                    </label>

                    {editingCampaign.showOnAnnouncementBar && (
                      <div className="pt-2 pl-6">
                        <label className="admin-label">Announcement Bar Text</label>
                        <input
                          type="text"
                          className="admin-input"
                          placeholder="e.g. Buy an eligible iPhone and get a free case."
                          value={editingCampaign.announcementBarText || ""}
                          onChange={(e) => setEditingCampaign((prev) => ({ ...prev, announcementBarText: e.target.value }))}
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 6: PREVIEW */}
              {editorTab === "preview" && (
                <div className="space-y-4">
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                      Offer Card Preview (/offers)
                    </span>
                    <div className="border border-slate-200 rounded-xl p-4 bg-white shadow-sm space-y-2">
                      <span className="text-[11px] font-bold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full inline-block">
                        {editingCampaign.promotionType}
                      </span>
                      <h4 className="font-bold text-slate-900 text-base">{editingCampaign.title || "Offer Title"}</h4>
                      <p className="text-xs text-slate-600">{editingCampaign.shortDescription || "Short description will appear here..."}</p>
                      <button type="button" className="admin-btn admin-btn-sm admin-btn-primary mt-2">
                        <span>{editingCampaign.ctaText || "Claim Offer"}</span>
                        <ArrowRight size={13} />
                      </button>
                    </div>
                  </div>

                  <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-xl text-xs text-emerald-800 space-y-1.5">
                    <span className="font-bold block">Checkout Calculation Check:</span>
                    <div>
                      &bull; Type: <strong>{editingCampaign.promotionType}</strong>
                    </div>
                    {editingCampaign.promotionType === "free_gift" && (
                      <div>
                        &bull; Qualifying purchase will append <strong>{editingCampaign.giftQuantityPerPurchase || 1} × {editingCampaign.giftProductName || "Free Gift"}</strong> at GH₵ 0.
                      </div>
                    )}
                    {editingCampaign.promotionType === "percentage_discount" && (
                      <div>
                        &bull; Eligible items will automatically receive <strong>{editingCampaign.discountPercent || 0}% deduction</strong> at checkout.
                      </div>
                    )}
                    {editingCampaign.promotionType === "fixed_discount" && (
                      <div>
                        &bull; Order will automatically receive <strong>GH₵ {editingCampaign.discountAmount || 0} deduction</strong>.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer Controls */}
            <footer className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              <button
                type="button"
                className="admin-btn admin-btn-secondary text-xs"
                onClick={() => setIsEditorOpen(false)}
                disabled={saving}
              >
                Cancel
              </button>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  className="admin-btn admin-btn-secondary text-xs font-bold"
                  onClick={() => void handleSaveCampaign(false)}
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save Draft"}
                </button>
                <button
                  type="button"
                  className="admin-btn admin-btn-primary text-xs font-bold"
                  onClick={() => void handleSaveCampaign(true)}
                  disabled={saving}
                >
                  <Sparkles size={14} />
                  <span>{saving ? "Publishing..." : "Publish Campaign"}</span>
                </button>
              </div>
            </footer>
          </div>
        </div>
      )}

      {/* Media Picker Modal */}
      {mediaPickerTarget && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <ImageIcon size={17} className="text-[#d4af37]" />
                <span>Select Asset from Media Library</span>
              </h3>
              <button
                type="button"
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
                onClick={() => setMediaPickerTarget(null)}
              >
                <X size={18} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <AdminMediaLibrary onSelect={handleSelectMedia} isPicker={true} />
            </div>
          </div>
        </div>
      )}

      {/* Permanent Delete Confirmation Dialog */}
      {deleteCandidate && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <Trash2 size={24} />
              <h3 className="font-bold text-slate-900 text-base">Delete Campaign Permanently?</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              This action cannot be undone. To permanently delete the campaign &ldquo;{deleteCandidate.title}&rdquo;, type the exact title below:
            </p>
            <input
              type="text"
              className="admin-input text-xs font-semibold"
              placeholder={deleteCandidate.title}
              value={deleteInput}
              onChange={(e) => setDeleteInput(e.target.value)}
            />
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                className="admin-btn admin-btn-secondary text-xs"
                onClick={() => setDeleteCandidate(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="admin-btn bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold"
                disabled={deleteInput !== deleteCandidate.title || deleting}
                onClick={handleDeleteConfirm}
              >
                {deleting ? "Deleting..." : "Confirm Permanent Deletion"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
