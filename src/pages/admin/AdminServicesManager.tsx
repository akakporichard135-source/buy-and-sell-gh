import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  ExternalLink,
  Eye,
  Image as ImageIcon,
  Layers,
  RefreshCw,
  Save,
  Tag,
  Wrench,
  X,
} from "lucide-react";
import { useState } from "react";
import { useCms } from "../../cms/CmsContext";
import type { MediaItem, RepairsPageContent, ServiceFlyer, TradeInPageContent } from "../../cms/types";
import { AdminMediaLibrary } from "./AdminMediaLibrary";

export function AdminServicesManager() {
  const { pages, updatePage, homepage, updateHomepage } = useCms();
  const [repairs, setRepairs] = useState<RepairsPageContent>(pages.repairs);
  const [tradeIn, setTradeIn] = useState<TradeInPageContent>(pages.tradeIn);
  const [serviceFlyers, setServiceFlyers] = useState<ServiceFlyer[]>(homepage.serviceFlyers || []);
  const [activeTab, setActiveTab] = useState<"repairs" | "trade-in" | "flyers">("repairs");
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
      if (activeTab === "repairs") {
        await updatePage("repairs", repairs);
      } else if (activeTab === "trade-in") {
        await updatePage("tradeIn", tradeIn);
      }

      // Always synchronize service flyers with homepage content
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

    setServiceFlyers((prev) =>
      prev.map((f) => (f.id === mediaPickerTarget ? { ...f, image: item.url, alt: item.alt || f.alt } : f))
    );
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
            <span className="text-xs font-semibold text-slate-500">Service Offerings &amp; Flyers</span>
          </div>
          <h2>Services &amp; Trade-In Management</h2>
          <p>
            Configure public booking guidance, turnaround times, trade-in policies, and manage/replace
            all service promotional flyers across Buy &amp; Sell GH without touching code.
          </p>
        </div>

        <button
          type="button"
          disabled={saving}
          onClick={handleSave}
          className="admin-btn admin-btn-primary"
        >
          <Save size={16} />
          <span>{saving ? "Saving..." : "Save Service Settings"}</span>
        </button>
      </div>

      {saveSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 size={16} />
          <span>Service content and flyers updated and permanently saved to Supabase!</span>
        </div>
      )}

      {saveError && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
          <AlertCircle size={16} />
          <span>{saveError}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 p-1.5 rounded-xl bg-slate-100/80 border border-slate-200">
        <button
          type="button"
          onClick={() => setActiveTab("repairs")}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
            activeTab === "repairs"
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Wrench size={15} />
          <span>Device Repairs &amp; Diagnostics</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("trade-in")}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
            activeTab === "trade-in"
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <RefreshCw size={15} />
          <span>Trade-In, Selling &amp; Upgrade</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("flyers")}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
            activeTab === "flyers"
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Layers size={15} />
          <span>All Service Flyers ({serviceFlyers.length})</span>
        </button>
      </div>

      {/* TAB 1: REPAIRS */}
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

      {/* TAB 2: TRADE-IN & UPGRADE */}
      {activeTab === "trade-in" && (
        <div className="space-y-6">
          {/* Trade-In Flyers Cards */}
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

      {/* TAB 3: ALL SERVICE FLYERS SHOWCASE */}
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
                  Select Flyer Artwork from Media Library
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
