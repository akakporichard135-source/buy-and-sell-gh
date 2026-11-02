import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Clock,
  CreditCard,
  ExternalLink,
  Eye,
  Image as ImageIcon,
  Inbox,
  Layers,
  MapPin,
  PackageCheck,
  RefreshCw,
  Save,
  Share2,
  Tag,
  Wrench,
  X,
} from "lucide-react";
import { useState } from "react";
import { useCms } from "../../cms/CmsContext";
import { defaultPageContent } from "../../cms/defaultCmsData";
import type {
  ContactPageContent,
  InstallmentPlanConfig,
  MediaItem,
  PreOrderPageContent,
  ReferralPageContent,
  RepairsPageContent,
  ServiceFlyer,
  TradeInPageContent,
  VisaCardPageContent,
} from "../../cms/types";
import { AdminInquiriesPage } from "./AdminInquiriesPage";
import { AdminMediaLibrary } from "./AdminMediaLibrary";

type ActiveTab =
  | "inbox"
  | "installment"
  | "repairs"
  | "trade-in"
  | "visa-card"
  | "pre-order"
  | "referral"
  | "contact"
  | "flyers";

export function AdminServicesManager() {
  const { pages, updatePage, homepage, updateHomepage } = useCms();

  const [activeTab, setActiveTab] = useState<ActiveTab>("inbox");

  // State for all 7 editable services
  const [installment, setInstallment] = useState<InstallmentPlanConfig>(
    () => pages.installment || defaultPageContent.installment
  );
  const [repairs, setRepairs] = useState<RepairsPageContent>(
    () => pages.repairs || defaultPageContent.repairs
  );
  const [tradeIn, setTradeIn] = useState<TradeInPageContent>(
    () => pages.tradeIn || defaultPageContent.tradeIn
  );
  const [visaCard, setVisaCard] = useState<VisaCardPageContent>(
    () => pages.visaCard || defaultPageContent.visaCard
  );
  const [preOrder, setPreOrder] = useState<PreOrderPageContent>(
    () => pages.preOrder || defaultPageContent.preOrder
  );
  const [referral, setReferral] = useState<ReferralPageContent>(
    () => pages.referral || defaultPageContent.referral
  );
  const [contact, setContact] = useState<ContactPageContent>(
    () => pages.contact || defaultPageContent.contact
  );

  const [serviceFlyers, setServiceFlyers] = useState<ServiceFlyer[]>(
    () => homepage.serviceFlyers || []
  );

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState("");

  // Media Picker state
  const [mediaPickerTarget, setMediaPickerTarget] = useState<string | null>(null);

  const handleSave = async () => {
    setSaving(true);
    setSaveError("");
    setSaveSuccess(false);
    try {
      if (activeTab === "installment") {
        await updatePage("installment", installment);
      } else if (activeTab === "repairs") {
        await updatePage("repairs", repairs);
      } else if (activeTab === "trade-in") {
        await updatePage("tradeIn", tradeIn);
      } else if (activeTab === "visa-card") {
        await updatePage("visaCard", visaCard);
      } else if (activeTab === "pre-order") {
        await updatePage("preOrder", preOrder);
      } else if (activeTab === "referral") {
        await updatePage("referral", referral);
      } else if (activeTab === "contact") {
        await updatePage("contact", contact);
      } else {
        // Save all services if on inbox or flyers
        await Promise.all([
          updatePage("installment", installment),
          updatePage("repairs", repairs),
          updatePage("tradeIn", tradeIn),
          updatePage("visaCard", visaCard),
          updatePage("preOrder", preOrder),
          updatePage("referral", referral),
          updatePage("contact", contact),
        ]);
      }

      // Always synchronize service promotional flyers
      await updateHomepage({
        ...homepage,
        serviceFlyers,
      });

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Failed to save service configuration.");
    } finally {
      setSaving(false);
    }
  };

  const handleSelectMedia = (item: MediaItem) => {
    if (!mediaPickerTarget) return;

    if (mediaPickerTarget === "visaCardImage") {
      setVisaCard((prev) => ({ ...prev, image: item.url }));
    } else if (mediaPickerTarget === "preOrderImage") {
      setPreOrder((prev) => ({ ...prev, image: item.url }));
    } else if (mediaPickerTarget === "referralImage") {
      setReferral((prev) => ({ ...prev, image: item.url }));
    } else {
      setServiceFlyers((prev) =>
        prev.map((f) =>
          f.id === mediaPickerTarget ? { ...f, image: item.url, alt: item.alt || f.alt } : f
        )
      );
    }
    setMediaPickerTarget(null);
  };

  const getFlyerById = (id: string): ServiceFlyer | undefined => {
    return serviceFlyers.find((f) => f.id === id);
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Card */}
      <div className="admin-header-card">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-[#d4af37]">
              Customer Experience
            </span>
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-slate-300" />
            <span className="text-xs font-semibold text-slate-500">
              Services, Inquiries &amp; Content Management
            </span>
          </div>
          <h2>Services &amp; Inquiries Management</h2>
          <p>
            Manage all incoming customer inquiries (Installments, Trade-Ins, Repairs, Pre-Orders),
            configure plan parameters, turnaround times, and replace promotional artwork across Buy &amp; Sell GH without touching code.
          </p>
        </div>

        {activeTab !== "inbox" && (
          <button
            type="button"
            disabled={saving}
            onClick={handleSave}
            className="admin-btn admin-btn-primary"
          >
            <Save size={16} />
            <span>{saving ? "Saving to Supabase..." : "Save Service Settings"}</span>
          </button>
        )}
      </div>

      {saveSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 size={16} />
          <span>Service content, configuration, and flyers updated and permanently saved to Supabase!</span>
        </div>
      )}

      {saveError && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
          <AlertCircle size={16} />
          <span>{saveError}</span>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 p-1.5 rounded-xl bg-slate-100/80 border border-slate-200 text-xs">
        <button
          type="button"
          onClick={() => setActiveTab("inbox")}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-bold transition-all ${
            activeTab === "inbox"
              ? "bg-[#1d1d1f] text-white shadow-sm"
              : "text-slate-700 hover:text-slate-900"
          }`}
        >
          <Inbox size={15} className={activeTab === "inbox" ? "text-[#d4af37]" : ""} />
          <span>All Requests Inbox</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("installment")}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-bold transition-all ${
            activeTab === "installment"
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Clock size={15} className="text-[#d4af37]" />
          <span>Installment Plan</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("repairs")}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-bold transition-all ${
            activeTab === "repairs"
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Wrench size={15} />
          <span>Repairs</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("trade-in")}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-bold transition-all ${
            activeTab === "trade-in"
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <RefreshCw size={15} />
          <span>Trade-In &amp; Upgrade</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("visa-card")}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-bold transition-all ${
            activeTab === "visa-card"
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <CreditCard size={15} />
          <span>Visa Card Trading</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("pre-order")}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-bold transition-all ${
            activeTab === "pre-order"
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <PackageCheck size={15} />
          <span>Pre-Order</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("referral")}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-bold transition-all ${
            activeTab === "referral"
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Share2 size={15} />
          <span>Refer a Friend</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("contact")}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-bold transition-all ${
            activeTab === "contact"
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <MapPin size={15} />
          <span>Contact &amp; Store Info</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("flyers")}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-bold transition-all ${
            activeTab === "flyers"
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Layers size={15} />
          <span>Promotional Flyers ({serviceFlyers.length})</span>
        </button>
      </div>

      {/* TAB 0: ALL REQUESTS INBOX (EMBEDDED) */}
      {activeTab === "inbox" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                Incoming Customer Inquiries &amp; Service Requests
              </h3>
              <p className="text-xs text-slate-500">
                All inquiries submitted across Buy &amp; Sell GH service forms are captured in real-time from Supabase.
              </p>
            </div>
          </div>
          <AdminInquiriesPage mode="service-requests" embedded={true} />
        </div>
      )}

      {/* TAB 1: INSTALLMENT PAYMENT PLAN SETTINGS */}
      {activeTab === "installment" && (
        <div className="space-y-6">
          {/* Installment Flyer Card */}
          {(() => {
            const flyer = getFlyerById("flyer-installment");
            return (
              <div className="admin-card space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <ImageIcon size={17} className="text-[#d4af37]" />
                    <h3 className="font-bold text-slate-900 text-sm">Installment Promotional Artwork</h3>
                  </div>
                  <span className="text-xs text-slate-400">Storefront: /installment</span>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="w-36 h-48 bg-white rounded-lg border border-slate-200 overflow-hidden flex items-center justify-center p-1 shrink-0 shadow-sm">
                    <img
                      src={flyer?.image || "/services/installment-payment.png"}
                      alt={flyer?.alt || "Installment payment flyer"}
                      className="w-full h-full object-contain"
                    />
                  </div>

                  <div className="space-y-3 flex-1 text-xs">
                    <div>
                      <span className="block text-slate-400 font-medium">Artwork Path / Public URL</span>
                      <span className="font-mono text-[0.7rem] text-slate-600 break-all select-all">
                        {flyer?.image || "/services/installment-payment.png"}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setMediaPickerTarget("flyer-installment")}
                        className="admin-btn admin-btn-sm admin-btn-primary"
                      >
                        <ImageIcon size={14} />
                        <span>Replace Artwork from Media Library</span>
                      </button>
                      <a
                        href="/installment"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="admin-btn admin-btn-sm admin-btn-secondary"
                      >
                        <ExternalLink size={14} />
                        <span>View Live /installment Page</span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Installment Plan Configuration Form */}
          <div className="admin-card space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Clock size={17} className="text-[#d4af37]" />
                <h3 className="font-bold text-slate-900 text-sm">Installment Plan Terms &amp; Settings</h3>
              </div>
              <span className="text-xs text-slate-400 font-mono">Storefront: /installment</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Page Title *</label>
                <input
                  type="text"
                  value={installment.title}
                  onChange={(e) => setInstallment({ ...installment, title: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-200 bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Initial Deposit Percentage (%) *</label>
                <input
                  type="number"
                  min={10}
                  max={90}
                  value={installment.depositPercentage}
                  onChange={(e) =>
                    setInstallment({
                      ...installment,
                      depositPercentage: parseInt(e.target.value, 10) || 40,
                    })
                  }
                  className="w-full p-2.5 rounded-lg border border-slate-200 bg-white"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block font-bold text-slate-700 mb-1">Service Description</label>
                <textarea
                  rows={2}
                  value={installment.description}
                  onChange={(e) => setInstallment({ ...installment, description: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-200 bg-white"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block font-bold text-slate-700 mb-1">
                  Customer Eligibility &amp; Security Guidance Note
                </label>
                <textarea
                  rows={2}
                  value={installment.guidance}
                  onChange={(e) => setInstallment({ ...installment, guidance: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-200 bg-white"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block font-bold text-slate-700 mb-1">Pre-Booking Direct Help Line</label>
                <input
                  type="text"
                  value={installment.assistance}
                  onChange={(e) => setInstallment({ ...installment, assistance: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-200 bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Plan Section Heading</label>
                <input
                  type="text"
                  value={installment.planHeading}
                  onChange={(e) => setInstallment({ ...installment, planHeading: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-200 bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Deposit Confirmation Question</label>
                <input
                  type="text"
                  value={installment.depositLabel}
                  onChange={(e) => setInstallment({ ...installment, depositLabel: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-200 bg-white"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block font-bold text-slate-700 mb-1">Plan Section Subtext Notice</label>
                <input
                  type="text"
                  value={installment.planNotice}
                  onChange={(e) => setInstallment({ ...installment, planNotice: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-200 bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Plan Duration Options (comma-separated)
                </label>
                <input
                  type="text"
                  value={installment.planDurations?.join(", ") || ""}
                  onChange={(e) =>
                    setInstallment({
                      ...installment,
                      planDurations: e.target.value
                        .split(",")
                        .map((s) => s.trim())
                        .filter(Boolean),
                    })
                  }
                  className="w-full p-2.5 rounded-lg border border-slate-200 bg-white"
                  placeholder="2 weeks, 4 weeks, 6 weeks, 8 weeks, 12 weeks, Other / Discuss with team"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Payment Frequency Options (comma-separated)
                </label>
                <input
                  type="text"
                  value={installment.paymentFrequencies?.join(", ") || ""}
                  onChange={(e) =>
                    setInstallment({
                      ...installment,
                      paymentFrequencies: e.target.value
                        .split(",")
                        .map((s) => s.trim())
                        .filter(Boolean),
                    })
                  }
                  className="w-full p-2.5 rounded-lg border border-slate-200 bg-white"
                  placeholder="Weekly, Every 2 weeks, Discuss with team"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block font-bold text-slate-700 mb-1">
                  Payment Count Logic / Explanatory Note
                </label>
                <textarea
                  rows={2}
                  value={installment.explanatoryNote || ""}
                  onChange={(e) =>
                    setInstallment({ ...installment, explanatoryNote: e.target.value })
                  }
                  className="w-full p-2.5 rounded-lg border border-slate-200 bg-white"
                  placeholder="Payments are calculated based on your chosen duration and frequency. For example, an 8-week plan with weekly payments consists of 8 equal installments after the initial deposit."
                />
              </div>

              <div className="md:col-span-2">
                <label className="block font-bold text-slate-700 mb-1">
                  Final Terms &amp; Disclaimer Notice
                </label>
                <textarea
                  rows={2}
                  value={installment.disclaimer}
                  onChange={(e) => setInstallment({ ...installment, disclaimer: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-200 bg-white"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: REPAIRS */}
      {activeTab === "repairs" && (
        <div className="space-y-6">
          {/* Repairs Flyer Card */}
          {(() => {
            const flyer = getFlyerById("flyer-repairs") || serviceFlyers[0];
            return (
              <div className="admin-card space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <ImageIcon size={17} className="text-[#d4af37]" />
                    <h3 className="font-bold text-slate-900 text-sm">Repairs Service Flyer Artwork</h3>
                  </div>
                  <span className="text-xs text-slate-400">Public: Homepage &amp; Media</span>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="w-36 h-48 bg-white rounded-lg border border-slate-200 overflow-hidden flex items-center justify-center p-1 shrink-0 shadow-sm">
                    <img
                      src={flyer?.image || "/services/repairs.png"}
                      alt={flyer?.alt || "Repairs flyer"}
                      className="w-full h-full object-contain"
                    />
                  </div>

                  <div className="space-y-3 flex-1 text-xs">
                    <div>
                      <span className="block text-slate-400 font-medium">Flyer Title</span>
                      <span className="font-bold text-slate-800 text-sm">{flyer?.title || "Repairs"}</span>
                    </div>

                    <div>
                      <span className="block text-slate-400 font-medium">Artwork Path / Public URL</span>
                      <span className="font-mono text-[0.7rem] text-slate-600 break-all select-all">
                        {flyer?.image || "/services/repairs.png"}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setMediaPickerTarget("flyer-repairs")}
                        className="admin-btn admin-btn-sm admin-btn-primary"
                      >
                        <ImageIcon size={14} />
                        <span>Select / Replace Repairs Artwork</span>
                      </button>
                      <a
                        href="/repairs"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="admin-btn admin-btn-sm admin-btn-secondary"
                      >
                        <ExternalLink size={14} />
                        <span>View /repairs Page</span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Repairs Form Settings */}
          <div className="admin-card space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Wrench size={17} className="text-[#d4af37]" />
                <h3 className="font-bold text-slate-900 text-sm">Repairs Booking &amp; Guidance</h3>
              </div>
              <span className="text-xs text-slate-400 font-mono">Storefront: /repairs</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Page Title *</label>
                <input
                  type="text"
                  value={repairs.title}
                  onChange={(e) => setRepairs({ ...repairs, title: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-200 bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Typical Turnaround Time</label>
                <input
                  type="text"
                  value={repairs.turnaroundTime}
                  onChange={(e) => setRepairs({ ...repairs, turnaroundTime: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-200 bg-white"
                  placeholder="e.g. Same-day screen & battery; 24-48 hrs board diagnostics"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block font-bold text-slate-700 mb-1">Service Description</label>
                <textarea
                  rows={2}
                  value={repairs.description}
                  onChange={(e) => setRepairs({ ...repairs, description: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-200 bg-white"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block font-bold text-slate-700 mb-1">Customer Guidance Note</label>
                <textarea
                  rows={2}
                  value={repairs.guidance}
                  onChange={(e) => setRepairs({ ...repairs, guidance: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-200 bg-white"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block font-bold text-slate-700 mb-1">Pre-Booking Direct Help Line</label>
                <input
                  type="text"
                  value={repairs.assistance}
                  onChange={(e) => setRepairs({ ...repairs, assistance: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-200 bg-white"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: TRADE-IN & UPGRADE */}
      {activeTab === "trade-in" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Upgrade & Save Flyer */}
            {(() => {
              const flyer = getFlyerById("flyer-upgrade");
              return (
                <div className="admin-card space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <h3 className="font-bold text-slate-900 text-xs">Upgrade &amp; Save Flyer</h3>
                    <span className="text-[0.68rem] text-slate-400">Mode: Upgrade</span>
                  </div>

                  <div className="flex items-center gap-4 p-3 rounded-lg bg-slate-50 border border-slate-200">
                    <div className="w-24 h-32 bg-white rounded border border-slate-200 overflow-hidden flex items-center justify-center p-1 shrink-0">
                      <img
                        src={flyer?.image || "/services/upgrade-and-save.png"}
                        alt={flyer?.alt || "Upgrade & save flyer"}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="space-y-2 text-xs flex-1">
                      <p className="font-bold text-slate-800">{flyer?.title || "Upgrade & Save"}</p>
                      <button
                        type="button"
                        onClick={() => setMediaPickerTarget("flyer-upgrade")}
                        className="admin-btn admin-btn-sm admin-btn-primary text-[0.7rem] w-full"
                      >
                        <ImageIcon size={12} />
                        <span>Replace Artwork</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Sell Your Device Flyer */}
            {(() => {
              const flyer = getFlyerById("flyer-sell");
              return (
                <div className="admin-card space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <h3 className="font-bold text-slate-900 text-xs">Sell Your Device Flyer</h3>
                    <span className="text-[0.68rem] text-slate-400">Mode: Sell</span>
                  </div>

                  <div className="flex items-center gap-4 p-3 rounded-lg bg-slate-50 border border-slate-200">
                    <div className="w-24 h-32 bg-white rounded border border-slate-200 overflow-hidden flex items-center justify-center p-1 shrink-0">
                      <img
                        src={flyer?.image || "/services/sell-your-device.png"}
                        alt={flyer?.alt || "Sell your device flyer"}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="space-y-2 text-xs flex-1">
                      <p className="font-bold text-slate-800">{flyer?.title || "Sell Your Device"}</p>
                      <button
                        type="button"
                        onClick={() => setMediaPickerTarget("flyer-sell")}
                        className="admin-btn admin-btn-sm admin-btn-primary text-[0.7rem] w-full"
                      >
                        <ImageIcon size={12} />
                        <span>Replace Artwork</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Selling Mode Settings */}
          <div className="admin-card space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Tag size={17} className="text-[#d4af37]" />
                <h3 className="font-bold text-slate-900 text-sm">Sell Device Mode (Direct Valuation)</h3>
              </div>
              <span className="text-xs text-slate-400 font-mono">Storefront: /sell-or-trade</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Title</label>
                <input
                  type="text"
                  value={tradeIn.title}
                  onChange={(e) => setTradeIn({ ...tradeIn, title: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-200 bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Pre-Submission Help Prompt</label>
                <input
                  type="text"
                  value={tradeIn.assistance}
                  onChange={(e) => setTradeIn({ ...tradeIn, assistance: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-200 bg-white"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={tradeIn.description}
                  onChange={(e) => setTradeIn({ ...tradeIn, description: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-200 bg-white"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block font-bold text-slate-700 mb-1">Appraisal Terms Guidance</label>
                <textarea
                  rows={2}
                  value={tradeIn.guidance}
                  onChange={(e) => setTradeIn({ ...tradeIn, guidance: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-200 bg-white"
                />
              </div>
            </div>
          </div>

          {/* Upgrade Mode Settings */}
          <div className="admin-card space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <RefreshCw size={17} className="text-emerald-600" />
                <h3 className="font-bold text-slate-900 text-sm">Upgrade &amp; Swap Mode</h3>
              </div>
              <span className="text-xs text-slate-400 font-mono">Storefront: /sell-or-trade?mode=upgrade</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Upgrade Title</label>
                <input
                  type="text"
                  value={tradeIn.upgradeTitle}
                  onChange={(e) => setTradeIn({ ...tradeIn, upgradeTitle: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-200 bg-white"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block font-bold text-slate-700 mb-1">Upgrade Description</label>
                <textarea
                  rows={2}
                  value={tradeIn.upgradeDescription}
                  onChange={(e) => setTradeIn({ ...tradeIn, upgradeDescription: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-200 bg-white"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block font-bold text-slate-700 mb-1">Upgrade Terms Guidance</label>
                <textarea
                  rows={2}
                  value={tradeIn.upgradeGuidance}
                  onChange={(e) => setTradeIn({ ...tradeIn, upgradeGuidance: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-200 bg-white"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: VISA CARD TRADING */}
      {activeTab === "visa-card" && (
        <div className="space-y-6">
          <div className="admin-card space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <CreditCard size={17} className="text-[#d4af37]" />
                <h3 className="font-bold text-slate-900 text-sm">Visa Card Trading Page Content</h3>
              </div>
              <a
                href="/gift-cards"
                target="_blank"
                rel="noopener noreferrer"
                className="admin-btn admin-btn-sm admin-btn-secondary"
              >
                <ExternalLink size={13} />
                <span>View /gift-cards Page</span>
              </a>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Eyebrow Badge</label>
                <input
                  type="text"
                  value={visaCard.eyebrow}
                  onChange={(e) => setVisaCard({ ...visaCard, eyebrow: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-200 bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Page Title / Heading</label>
                <input
                  type="text"
                  value={visaCard.heading}
                  onChange={(e) => setVisaCard({ ...visaCard, heading: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-200 bg-white"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block font-bold text-slate-700 mb-1">Page Subtitle</label>
                <textarea
                  rows={2}
                  value={visaCard.subtitle}
                  onChange={(e) => setVisaCard({ ...visaCard, subtitle: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-200 bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Hero Image URL</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={visaCard.image}
                    onChange={(e) => setVisaCard({ ...visaCard, image: e.target.value })}
                    className="flex-1 p-2.5 rounded-lg border border-slate-200 bg-white font-mono text-[0.7rem]"
                  />
                  <button
                    type="button"
                    onClick={() => setMediaPickerTarget("visaCardImage")}
                    className="admin-btn admin-btn-secondary shrink-0"
                  >
                    <ImageIcon size={14} />
                    <span>Choose</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">WhatsApp Button Text</label>
                <input
                  type="text"
                  value={visaCard.whatsappLabel}
                  onChange={(e) => setVisaCard({ ...visaCard, whatsappLabel: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-200 bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Side Card Policy Heading</label>
                <input
                  type="text"
                  value={visaCard.sideCardHeading}
                  onChange={(e) => setVisaCard({ ...visaCard, sideCardHeading: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-200 bg-white"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block font-bold text-slate-700 mb-1">Side Card Policy Disclaimer</label>
                <textarea
                  rows={2}
                  value={visaCard.sideCardText}
                  onChange={(e) => setVisaCard({ ...visaCard, sideCardText: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-200 bg-white"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: PRE-ORDER & SOURCING */}
      {activeTab === "pre-order" && (
        <div className="space-y-6">
          <div className="admin-card space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <PackageCheck size={17} className="text-[#d4af37]" />
                <h3 className="font-bold text-slate-900 text-sm">Pre-Order &amp; Sourcing Page Content</h3>
              </div>
              <a
                href="/pre-order"
                target="_blank"
                rel="noopener noreferrer"
                className="admin-btn admin-btn-sm admin-btn-secondary"
              >
                <ExternalLink size={13} />
                <span>View /pre-order Page</span>
              </a>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Eyebrow Badge</label>
                <input
                  type="text"
                  value={preOrder.eyebrow}
                  onChange={(e) => setPreOrder({ ...preOrder, eyebrow: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-200 bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Page Title / Heading</label>
                <input
                  type="text"
                  value={preOrder.heading}
                  onChange={(e) => setPreOrder({ ...preOrder, heading: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-200 bg-white"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block font-bold text-slate-700 mb-1">Page Subtitle</label>
                <textarea
                  rows={2}
                  value={preOrder.subtitle}
                  onChange={(e) => setPreOrder({ ...preOrder, subtitle: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-200 bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Hero Image URL</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={preOrder.image}
                    onChange={(e) => setPreOrder({ ...preOrder, image: e.target.value })}
                    className="flex-1 p-2.5 rounded-lg border border-slate-200 bg-white font-mono text-[0.7rem]"
                  />
                  <button
                    type="button"
                    onClick={() => setMediaPickerTarget("preOrderImage")}
                    className="admin-btn admin-btn-secondary shrink-0"
                  >
                    <ImageIcon size={14} />
                    <span>Choose</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">WhatsApp Button Text</label>
                <input
                  type="text"
                  value={preOrder.whatsappLabel}
                  onChange={(e) => setPreOrder({ ...preOrder, whatsappLabel: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-200 bg-white"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block font-bold text-slate-700 mb-1">How It Works Heading</label>
                <input
                  type="text"
                  value={preOrder.howItWorksHeading}
                  onChange={(e) => setPreOrder({ ...preOrder, howItWorksHeading: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-200 bg-white"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block font-bold text-slate-700 mb-1">
                  How It Works Steps (one per line)
                </label>
                <textarea
                  rows={3}
                  value={preOrder.steps?.join("\n") || ""}
                  onChange={(e) =>
                    setPreOrder({
                      ...preOrder,
                      steps: e.target.value
                        .split("\n")
                        .map((s) => s.trim())
                        .filter(Boolean),
                    })
                  }
                  className="w-full p-2.5 rounded-lg border border-slate-200 bg-white font-mono"
                  placeholder="Share the device and preferences.&#10;The team reviews sourcing and current pricing.&#10;You receive confirmed next steps before payment."
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: REFER A FRIEND */}
      {activeTab === "referral" && (
        <div className="space-y-6">
          <div className="admin-card space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Share2 size={17} className="text-[#d4af37]" />
                <h3 className="font-bold text-slate-900 text-sm">Refer a Friend Page Content</h3>
              </div>
              <a
                href="/refer-a-friend"
                target="_blank"
                rel="noopener noreferrer"
                className="admin-btn admin-btn-sm admin-btn-secondary"
              >
                <ExternalLink size={13} />
                <span>View /refer-a-friend Page</span>
              </a>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Eyebrow Badge</label>
                <input
                  type="text"
                  value={referral.eyebrow}
                  onChange={(e) => setReferral({ ...referral, eyebrow: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-200 bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Page Title / Heading</label>
                <input
                  type="text"
                  value={referral.heading}
                  onChange={(e) => setReferral({ ...referral, heading: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-200 bg-white"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block font-bold text-slate-700 mb-1">Page Subtitle</label>
                <textarea
                  rows={2}
                  value={referral.subtitle}
                  onChange={(e) => setReferral({ ...referral, subtitle: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-200 bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Hero Image URL</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={referral.image}
                    onChange={(e) => setReferral({ ...referral, image: e.target.value })}
                    className="flex-1 p-2.5 rounded-lg border border-slate-200 bg-white font-mono text-[0.7rem]"
                  />
                  <button
                    type="button"
                    onClick={() => setMediaPickerTarget("referralImage")}
                    className="admin-btn admin-btn-secondary shrink-0"
                  >
                    <ImageIcon size={14} />
                    <span>Choose</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">WhatsApp Button Text</label>
                <input
                  type="text"
                  value={referral.whatsappLabel}
                  onChange={(e) => setReferral({ ...referral, whatsappLabel: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-200 bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Side Card Policy Heading</label>
                <input
                  type="text"
                  value={referral.sideCardHeading}
                  onChange={(e) => setReferral({ ...referral, sideCardHeading: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-200 bg-white"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block font-bold text-slate-700 mb-1">Side Card Policy Disclaimer</label>
                <textarea
                  rows={2}
                  value={referral.sideCardText}
                  onChange={(e) => setReferral({ ...referral, sideCardText: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-200 bg-white"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 7: CONTACT & STORE INFO */}
      {activeTab === "contact" && (
        <div className="space-y-6">
          <div className="admin-card space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <MapPin size={17} className="text-[#d4af37]" />
                <h3 className="font-bold text-slate-900 text-sm">Contact Page Copy &amp; Shop Guidance</h3>
              </div>
              <a
                href="/contact"
                target="_blank"
                rel="noopener noreferrer"
                className="admin-btn admin-btn-sm admin-btn-secondary"
              >
                <ExternalLink size={13} />
                <span>View /contact Page</span>
              </a>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Eyebrow Badge</label>
                <input
                  type="text"
                  value={contact.eyebrow}
                  onChange={(e) => setContact({ ...contact, eyebrow: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-200 bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Page Title / Heading</label>
                <input
                  type="text"
                  value={contact.heading}
                  onChange={(e) => setContact({ ...contact, heading: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-200 bg-white"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block font-bold text-slate-700 mb-1">Hero Subtitle</label>
                <textarea
                  rows={2}
                  value={contact.subtitle}
                  onChange={(e) => setContact({ ...contact, subtitle: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-200 bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Visit Section Heading</label>
                <input
                  type="text"
                  value={contact.visitHeading}
                  onChange={(e) => setContact({ ...contact, visitHeading: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-200 bg-white"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block font-bold text-slate-700 mb-1">Visit Guidance Notice</label>
                <textarea
                  rows={2}
                  value={contact.visitNotice}
                  onChange={(e) => setContact({ ...contact, visitNotice: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-200 bg-white"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 8: ALL PROMOTIONAL FLYERS */}
      {activeTab === "flyers" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">All Service Showcase Flyers</h3>
              <p className="text-xs text-slate-500">
                These promotional flyers appear in the "Our Services" carousel on the homepage and connect visitors to dedicated service flows.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {serviceFlyers.map((flyer) => (
              <div
                key={flyer.id}
                className="admin-card p-4 space-y-3 border border-slate-200 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-3">
                    <h4 className="font-bold text-slate-900 text-xs truncate">{flyer.title}</h4>
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 text-[0.65rem] font-bold text-slate-600">
                      {flyer.enabled ? "Active" : "Disabled"}
                    </span>
                  </div>

                  <div className="aspect-[3/4] bg-slate-100 rounded-lg overflow-hidden flex items-center justify-center p-2 border border-slate-200 mb-3">
                    <img
                      src={flyer.image}
                      alt={flyer.alt}
                      style={{ objectFit: "contain" }}
                      className="w-full h-full max-h-full object-contain"
                    />
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <div>
                      <span className="text-[0.68rem] text-slate-400 font-medium block">Route Link</span>
                      <span className="font-mono text-[0.7rem] text-slate-700">{flyer.to}</span>
                    </div>
                    <div>
                      <span className="text-[0.68rem] text-slate-400 font-medium block">Artwork URL</span>
                      <span className="font-mono text-[0.68rem] text-slate-500 truncate block select-all">
                        {flyer.image}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setMediaPickerTarget(flyer.id)}
                    className="flex-1 py-1.5 rounded-lg bg-slate-900 hover:bg-black text-white text-xs font-bold flex items-center justify-center gap-1.5 transition"
                  >
                    <ImageIcon size={13} />
                    <span>Change Artwork</span>
                  </button>
                  <a
                    href={flyer.to}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 transition"
                    title="Open destination page"
                  >
                    <ExternalLink size={14} />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Media Picker Modal */}
      {mediaPickerTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setMediaPickerTarget(null)}
        >
          <div
            className="w-full max-w-4xl max-h-[85vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ImageIcon size={18} className="text-[#d4af37]" />
                <h3 className="font-bold text-slate-900 text-sm">
                  Select Artwork from Media Library
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setMediaPickerTarget(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-900"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-4 overflow-y-auto flex-1">
              <AdminMediaLibrary isPicker={true} onSelect={handleSelectMedia} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
