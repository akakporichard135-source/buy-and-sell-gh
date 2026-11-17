import {
  AlertCircle,
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Eye,
  Grid,
  Image as ImageIcon,
  Layers,
  Layout,
  Plus,
  Save,
  Sparkles,
  Trash2,
  Upload,
  Volume2,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useCms } from "../../cms/CmsContext";
import { defaultHomepageSections } from "../../cms/defaultCmsData";
import { useProductCatalog } from "../../catalog/ProductCatalogContext";
import type { HeroCampaign, HomepageContent, MediaItem, PromoTile, ServiceFlyer, Tone } from "../../cms/types";
import { HomepageSectionBuilder } from "../../components/admin/HomepageSectionBuilder";
import { AdminMediaLibrary } from "./AdminMediaLibrary";

/**
 * Safety lock keeping the Phase 2 modular homepage strictly in local-only development
 * until all content is filled, reviewed, tested, and explicitly approved for rollout.
 */
export const MODULAR_LIVE_PUBLISH_LOCKED = true;

/**
 * Pure publish guard that blocks invoking the live Supabase publishing function
 * while local-only development mode is active, preserving the underlying
 * AAL2-gated publish pipeline for an explicitly approved deployment stage.
 */
export async function executeGuardedModularPublish({
  locked = MODULAR_LIVE_PUBLISH_LOCKED,
  publishFn,
}: {
  locked?: boolean;
  publishFn: () => Promise<void>;
}): Promise<{ blocked: boolean; message?: string }> {
  if (locked) {
    return {
      blocked: true,
      message:
        "Modular live publishing is disabled in the current local-only workflow. Save your local draft and preview via /?preview=modular.",
    };
  }
  await publishFn();
  return { blocked: false };
}

export function AdminHomepageManager() {
  const {
    homepage,
    homepageDraft,
    media,
    updateHomepage,
    saveHomepageDraftConfig,
    discardHomepageDraftConfig,
  } = useCms();
  const { products } = useProductCatalog();
  const [content, setContent] = useState<HomepageContent>(homepage);
  const [draftContent, setDraftContent] = useState<HomepageContent>(() =>
    homepageDraft || {
      ...homepage,
      layoutMode: "modular",
      sections:
        homepage.sections && homepage.sections.length > 0
          ? homepage.sections
          : defaultHomepageSections,
    }
  );
  const [editorMode, setEditorMode] = useState<"modular" | "legacy">("modular");
  const [activeTab, setActiveTab] = useState<"heroes" | "tiles" | "flyers" | "announcement">("heroes");
  const [saving, setSaving] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [saveError, setSaveError] = useState("");

  // Sync legacy state when live homepage updates from Supabase
  useEffect(() => {
    if (homepage) {
      setContent(homepage);
      if (!homepageDraft) {
        setDraftContent({
          ...homepage,
          layoutMode: "modular",
          sections:
            homepage.sections && homepage.sections.length > 0
              ? homepage.sections
              : defaultHomepageSections,
        });
      }
    }
  }, [homepage, homepageDraft]);

  useEffect(() => {
    if (homepageDraft) {
      setDraftContent(homepageDraft);
    }
  }, [homepageDraft]);

  // Media picker modal state
  const [mediaPickerTarget, setMediaPickerTarget] = useState<{
    section: "hero" | "tile" | "flyer";
    index: number;
    field: "image" | "mobileImage";
  } | null>(null);

  // Live preview state
  const [previewOpen, setPreviewOpen] = useState(false);

  // Save modular draft locally only (never writes to Supabase)
  const handleSaveModularDraft = async () => {
    setSavingDraft(true);
    setSaveError("");
    setSaveSuccess(false);
    try {
      const saved = await saveHomepageDraftConfig({
        ...draftContent,
        layoutMode: "modular",
      });
      setDraftContent(saved);
      setSuccessMessage("Local modular draft saved to browser storage (live website unchanged).");
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Failed to save local draft.");
    } finally {
      setSavingDraft(false);
    }
  };

  const handleDiscardModularDraft = async () => {
    setSaveError("");
    setSaveSuccess(false);
    await discardHomepageDraftConfig();
    setDraftContent({
      ...homepage,
      layoutMode: "modular",
      sections:
        homepage.sections && homepage.sections.length > 0
          ? homepage.sections
          : defaultHomepageSections,
    });
    setSuccessMessage("Local homepage draft discarded.");
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3500);
  };

  // Explicit Modular Publish (disabled in local-only workflow; guarded by AAL2 MFA when unlocked)
  const handlePublishModular = async () => {
    setSaveError("");
    setSaveSuccess(false);
    try {
      const result = await executeGuardedModularPublish({
        locked: MODULAR_LIVE_PUBLISH_LOCKED,
        publishFn: async () => {
          setSaving(true);
          try {
            await updateHomepage({
              ...draftContent,
              layoutMode: "modular",
            });
          } finally {
            setSaving(false);
          }
        },
      });

      if (result.blocked) {
        setSaveError(
          result.message ||
            "Modular live publishing is disabled in the current local-only workflow."
        );
        return;
      }

      setSuccessMessage("Modular homepage explicitly published to live website!");
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4500);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Failed to publish modular homepage.");
    }
  };

  // Explicit Legacy Publish (preserves legacy layoutMode)
  const handleSave = async () => {
    setSaving(true);
    setSaveError("");
    setSaveSuccess(false);
    try {
      await updateHomepage({
        ...content,
        layoutMode: content.layoutMode === "modular" ? "modular" : "legacy",
      });
      setSuccessMessage("Homepage content successfully published to live website!");
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Failed to save homepage changes.");
    } finally {
      setSaving(false);
    }
  };

  // Reordering helpers
  const moveItem = <T,>(list: T[], index: number, direction: -1 | 1): T[] => {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= list.length) return list;
    const copy = [...list];
    [copy[index], copy[nextIndex]] = [copy[nextIndex], copy[index]];
    return copy;
  };

  const handleMediaSelected = (item: MediaItem) => {
    if (!mediaPickerTarget) return;
    const { section, index, field } = mediaPickerTarget;

    if (section === "hero") {
      const heroes = [...content.heroes];
      heroes[index] = { ...heroes[index], [field]: item.url };
      setContent({ ...content, heroes });
    } else if (section === "tile") {
      const tiles = [...content.tiles];
      tiles[index] = { ...tiles[index], image: item.url };
      setContent({ ...content, tiles });
    } else if (section === "flyer") {
      const flyers = [...content.serviceFlyers];
      flyers[index] = { ...flyers[index], image: item.url };
      setContent({ ...content, serviceFlyers: flyers });
    }

    setMediaPickerTarget(null);
  };

  return (
    <div className="homepage-cms-builder space-y-6">
      {/* 1. Header Card */}
      <div className="admin-header-card">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-[#92700c]">
              Storefront CMS
            </span>
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#d4af37]" />
            <span className="text-xs font-semibold text-slate-500">Homepage Architecture</span>
          </div>
          <h2>Homepage Content &amp; Campaign Editor</h2>
          <p>
            Customize top announcements, full-width hero campaigns, 2-column promotional tiles,
            button destinations, and service flyer showcases appearing on buyandsellgh.com.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0 max-w-full">
          <div className="inline-flex flex-wrap items-center p-1 rounded-xl bg-slate-100 border border-slate-200 max-w-full">
            <button
              type="button"
              onClick={() => setEditorMode("modular")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition ${
                editorMode === "modular"
                  ? "bg-[#0f172a] text-[#f0cf78] shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Buy &amp; Sell GH Homepage Builder
            </button>
            <button
              type="button"
              onClick={() => setEditorMode("legacy")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition ${
                editorMode === "legacy"
                  ? "bg-[#0f172a] text-[#f0cf78] shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Legacy Layout Editor
            </button>
          </div>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 size={16} />
          <span>{successMessage || "Homepage content successfully updated!"}</span>
        </div>
      )}

      {saveError && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
          <AlertCircle size={16} />
          <span>{saveError}</span>
        </div>
      )}

      {editorMode === "modular" ? (
        <HomepageSectionBuilder
          draft={draftContent}
          liveLayoutMode={homepage.layoutMode === "modular" ? "modular" : "legacy"}
          hasLocalDraft={Boolean(homepageDraft)}
          products={products}
          mediaLibrary={media}
          onChangeDraft={setDraftContent}
          onSaveDraft={handleSaveModularDraft}
          onDiscardDraft={handleDiscardModularDraft}
          onPublishModular={handlePublishModular}
          modularPublishLocked={MODULAR_LIVE_PUBLISH_LOCKED}
          savingDraft={savingDraft}
          publishing={saving}
        />
      ) : (
        <div className="space-y-6 min-w-0">
          {/* Legacy Action Toolbar */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#0a0a0c] text-white border border-[#d4af37]/30 whitespace-nowrap">
                  Legacy Layout Editor
                </span>
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border whitespace-nowrap ${
                    homepage.layoutMode === "modular"
                      ? "bg-slate-100 text-slate-700 border-slate-200"
                      : "bg-emerald-50 text-emerald-800 border-emerald-200"
                  }`}
                >
                  Live Storefront: {homepage.layoutMode === "modular" ? "Modular Layout" : "Legacy Active"}
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Manage legacy hero slides, 2-column promotional tiles, service flyers, and the top announcement banner.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 shrink-0 max-w-full">
              <button
                type="button"
                onClick={() => setPreviewOpen(true)}
                className="admin-btn admin-btn-secondary admin-btn-sm whitespace-nowrap"
              >
                <Eye size={15} className="shrink-0" />
                <span>Preview Layout</span>
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={handleSave}
                className="admin-btn admin-btn-gold admin-btn-sm shadow-xs whitespace-nowrap"
              >
                <Save size={15} className="shrink-0" />
                <span>{saving ? "Saving Changes..." : "Publish Legacy Homepage"}</span>
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="w-full min-w-0 max-w-full overflow-x-auto rounded-xl border border-slate-200 bg-slate-100 homepage-cms-scroll">
            <div className="inline-flex items-center gap-1 p-1 min-w-max">
              <button
                type="button"
                onClick={() => setActiveTab("heroes")}
                className={`shrink-0 whitespace-nowrap flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] sm:text-xs font-bold transition-all ${
                  activeTab === "heroes"
                    ? "bg-[#0f172a] text-[#f0cf78] shadow-sm"
                    : "text-slate-600 hover:text-slate-900 hover:bg-white/70"
                }`}
              >
                <Layout size={14} className="shrink-0" />
                <span>Hero Carousel ({content.heroes.filter((h) => h.enabled).length} Active)</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("tiles")}
                className={`shrink-0 whitespace-nowrap flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] sm:text-xs font-bold transition-all ${
                  activeTab === "tiles"
                    ? "bg-[#0f172a] text-[#f0cf78] shadow-sm"
                    : "text-slate-600 hover:text-slate-900 hover:bg-white/70"
                }`}
              >
                <Grid size={14} className="shrink-0" />
                <span>Promotional Tiles ({content.tiles.filter((t) => t.enabled).length} Active)</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("flyers")}
                className={`shrink-0 whitespace-nowrap flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] sm:text-xs font-bold transition-all ${
                  activeTab === "flyers"
                    ? "bg-[#0f172a] text-[#f0cf78] shadow-sm"
                    : "text-slate-600 hover:text-slate-900 hover:bg-white/70"
                }`}
              >
                <Layers size={14} className="shrink-0" />
                <span>Service Flyers ({content.serviceFlyers.filter((f) => f.enabled).length} Active)</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("announcement")}
                className={`shrink-0 whitespace-nowrap flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] sm:text-xs font-bold transition-all ${
                  activeTab === "announcement"
                    ? "bg-[#0f172a] text-[#f0cf78] shadow-sm"
                    : "text-slate-600 hover:text-slate-900 hover:bg-white/70"
                }`}
              >
                <Volume2 size={14} className="shrink-0" />
                <span>Announcement Bar</span>
              </button>
            </div>
          </div>

      {/* SECTION 1: HERO CAROUSEL */}
      {activeTab === "heroes" && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-sm font-bold text-slate-900">Homepage Hero Slides</h3>
            <button
              type="button"
              onClick={() => {
                const newHero: HeroCampaign = {
                  id: `hero-${Date.now()}`,
                  title: "New Flagship Campaign",
                  subtitle: "Groundbreaking power and design.",
                  image: "/products/homepage/iphone-18-pro-hero-2x.webp",
                  alt: "Flagship hero campaign",
                  tone: "dark",
                  primary: { label: "Learn more", to: "/store" },
                  secondary: { label: "View pricing", to: "/store" },
                  enabled: true,
                  order: content.heroes.length + 1,
                };
                setContent({ ...content, heroes: [...content.heroes, newHero] });
              }}
              className="admin-btn admin-btn-sm bg-[#0f172a] text-[#f0cf78] hover:bg-slate-800 border border-[#0f172a] whitespace-nowrap"
            >
              <Plus size={14} />
              <span>Add Hero Slide</span>
            </button>
          </div>

          <div className="space-y-4">
            {content.heroes.map((hero, index) => (
              <div
                key={hero.id}
                className={`rounded-2xl bg-white p-4 sm:p-5 space-y-4 border shadow-sm transition min-w-0 ${
                  hero.enabled ? "border-slate-200" : "border-slate-200/60 bg-slate-50/70 opacity-65"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-6 h-6 rounded-full bg-[#0f172a] text-[#f0cf78] font-bold text-xs flex items-center justify-center shrink-0">
                      {index + 1}
                    </span>
                    <div className="min-w-0">
                      <h4 className="font-bold text-slate-900 text-sm truncate">{hero.title || "Untitled Slide"}</h4>
                      <p className="text-xs text-slate-500 truncate">{hero.subtitle}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer mr-1">
                      <input
                        type="checkbox"
                        checked={hero.enabled}
                        onChange={(e) => {
                          const heroes = [...content.heroes];
                          heroes[index] = { ...heroes[index], enabled: e.target.checked };
                          setContent({ ...content, heroes });
                        }}
                        className="rounded border-slate-300"
                      />
                      <span>Active on Storefront</span>
                    </label>

                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => setContent({ ...content, heroes: moveItem(content.heroes, index, -1) })}
                      className="p-1.5 rounded-lg border border-slate-200 bg-white hover:border-[#d4af37]/60 text-slate-600 disabled:opacity-30 transition"
                      title="Move up"
                    >
                      <ArrowUp size={14} />
                    </button>
                    <button
                      type="button"
                      disabled={index === content.heroes.length - 1}
                      onClick={() => setContent({ ...content, heroes: moveItem(content.heroes, index, 1) })}
                      className="p-1.5 rounded-lg border border-slate-200 bg-white hover:border-[#d4af37]/60 text-slate-600 disabled:opacity-30 transition"
                      title="Move down"
                    >
                      <ArrowDown size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const heroes = content.heroes.filter((_, i) => i !== index);
                        setContent({ ...content, heroes });
                      }}
                      className="p-1.5 rounded-lg border border-rose-200 bg-white text-rose-600 hover:bg-rose-50 transition"
                      title="Delete slide"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Headline Title *</label>
                    <input
                      type="text"
                      value={hero.title}
                      onChange={(e) => {
                        const heroes = [...content.heroes];
                        heroes[index] = { ...heroes[index], title: e.target.value };
                        setContent({ ...content, heroes });
                      }}
                      className="w-full p-2.5 rounded-lg border border-slate-200 bg-white"
                      placeholder="e.g. iPhone 18 Pro"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Subtitle / Tagline</label>
                    <input
                      type="text"
                      value={hero.subtitle}
                      onChange={(e) => {
                        const heroes = [...content.heroes];
                        heroes[index] = { ...heroes[index], subtitle: e.target.value };
                        setContent({ ...content, heroes });
                      }}
                      className="w-full p-2.5 rounded-lg border border-slate-200 bg-white"
                      placeholder="e.g. Pro further."
                    />
                  </div>

                  <div className="md:col-span-2 xl:col-span-1">
                    <label className="block font-bold text-slate-700 mb-1">Display Tone</label>
                    <select
                      value={hero.tone}
                      onChange={(e) => {
                        const heroes = [...content.heroes];
                        heroes[index] = { ...heroes[index], tone: e.target.value as Tone };
                        setContent({ ...content, heroes });
                      }}
                      className="w-full p-2.5 rounded-lg border border-slate-200 bg-white font-semibold"
                    >
                      <option value="dark">Dark Theme (White Text on Dark Imagery)</option>
                      <option value="light">Light Theme (Dark Text on Clean Bright Imagery)</option>
                      <option value="mist">Mist Theme (Subtle Neutral Background)</option>
                    </select>
                  </div>

                  <div className="md:col-span-2 xl:col-span-3" style={{ containerType: "inline-size" }}>
                    <div className="homepage-cms-media-grid p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                    {/* Desktop Hero Image */}
                    <div className="space-y-2 min-w-0 flex flex-col">
                      <div className="flex flex-wrap items-center justify-between gap-1.5">
                        <label className="block font-bold text-slate-800 text-xs">Desktop Hero Image *</label>
                        <span className="text-[0.65rem] text-slate-500 font-semibold">Recommended: 2880×1200 or 1440×600</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <input
                          type="text"
                          value={hero.image}
                          onChange={(e) => {
                            const heroes = [...content.heroes];
                            heroes[index] = { ...heroes[index], image: e.target.value };
                            setContent({ ...content, heroes });
                          }}
                          className="flex-1 min-w-[160px] p-2 rounded-lg border border-slate-200 bg-white font-mono text-[0.7rem]"
                          placeholder="/products/homepage/iphone-18-pro-hero-2x.webp"
                        />
                        <button
                          type="button"
                          onClick={() => setMediaPickerTarget({ section: "hero", index, field: "image" })}
                          className="px-3 py-2 rounded-lg bg-[#d4af37] hover:bg-[#b89726] text-[#0a0a0c] border border-[#b89726]/40 font-bold flex items-center gap-1.5 shrink-0 whitespace-nowrap transition text-xs"
                        >
                          <ImageIcon size={13} className="shrink-0" />
                          <span>Change Image</span>
                        </button>
                      </div>
                      <div className="homepage-cms-media-preview">
                        <img src={hero.image} alt={hero.alt} className="max-h-full max-w-full object-contain" />
                      </div>
                    </div>

                    {/* Mobile Hero Image */}
                    <div className="space-y-2 min-w-0 flex flex-col">
                      <div className="flex flex-wrap items-center justify-between gap-1.5">
                        <label className="block font-bold text-slate-800 text-xs">Mobile Hero Image (Optional)</label>
                        <span className="text-[0.65rem] text-slate-500 font-semibold">Recommended: 680×880 or vertical portrait</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <input
                          type="text"
                          value={hero.mobileImage || ""}
                          onChange={(e) => {
                            const heroes = [...content.heroes];
                            heroes[index] = { ...heroes[index], mobileImage: e.target.value || undefined };
                            setContent({ ...content, heroes });
                          }}
                          className="flex-1 min-w-[160px] p-2 rounded-lg border border-slate-200 bg-white font-mono text-[0.7rem]"
                          placeholder="Select from Media Library or leave empty"
                        />
                        <button
                          type="button"
                          onClick={() => setMediaPickerTarget({ section: "hero", index, field: "mobileImage" })}
                          className="px-3 py-2 rounded-lg bg-[#d4af37] hover:bg-[#b89726] text-[#0a0a0c] border border-[#b89726]/40 font-bold flex items-center gap-1.5 shrink-0 whitespace-nowrap transition text-xs"
                        >
                          <ImageIcon size={13} className="shrink-0" />
                          <span>Pick Mobile</span>
                        </button>
                        {hero.mobileImage && (
                          <button
                            type="button"
                            onClick={() => {
                              const heroes = [...content.heroes];
                              heroes[index] = { ...heroes[index], mobileImage: undefined };
                              setContent({ ...content, heroes });
                            }}
                            className="px-2.5 py-2 rounded-lg border border-rose-200 bg-rose-50/40 text-rose-700 hover:bg-rose-50 text-xs font-semibold transition whitespace-nowrap shrink-0"
                            title="Clear mobile image"
                          >
                            Clear
                          </button>
                        )}
                      </div>
                      <div className="homepage-cms-media-preview">
                        {hero.mobileImage ? (
                          <img
                            src={hero.mobileImage}
                            alt="Mobile preview"
                            className="max-h-full max-w-full object-contain"
                            onError={(e) => {
                              if (hero.id === "iphone-18-pro" && !e.currentTarget.src.includes("iphone-18-pro-hero-mobile.jpg")) {
                                e.currentTarget.src = "/products/homepage/iphone-18-pro-hero-mobile.jpg";
                              }
                            }}
                          />
                        ) : (
                          <span className="text-[0.68rem] text-slate-400 font-medium text-center px-2">
                            Inheriting Desktop Image on Mobile
                          </span>
                        )}
                      </div>
                    </div>
                    </div>
                  </div>

                  <div className="md:col-span-2 xl:col-span-1">
                    <label className="block font-bold text-slate-700 mb-1">Accessibility Alt Text</label>
                    <input
                      type="text"
                      value={hero.alt}
                      onChange={(e) => {
                        const heroes = [...content.heroes];
                        heroes[index] = { ...heroes[index], alt: e.target.value };
                        setContent({ ...content, heroes });
                      }}
                      className="w-full p-2.5 rounded-lg border border-slate-200 bg-white"
                      placeholder="Descriptive image summary"
                    />
                  </div>

                  {/* Button 1 */}
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2 min-w-0">
                    <span className="block font-bold text-slate-800">Primary Button</span>
                    <input
                      type="text"
                      value={hero.primary.label}
                      onChange={(e) => {
                        const heroes = [...content.heroes];
                        heroes[index] = { ...heroes[index], primary: { ...heroes[index].primary, label: e.target.value } };
                        setContent({ ...content, heroes });
                      }}
                      placeholder="Button label (e.g. Learn more)"
                      className="w-full p-2 rounded-lg border border-slate-200 bg-white"
                    />
                    <input
                      type="text"
                      value={hero.primary.to}
                      onChange={(e) => {
                        const heroes = [...content.heroes];
                        heroes[index] = { ...heroes[index], primary: { ...heroes[index].primary, to: e.target.value } };
                        setContent({ ...content, heroes });
                      }}
                      placeholder="Destination URL (e.g. /iphone/iphone-18-pro)"
                      className="w-full p-2 rounded-lg border border-slate-200 bg-white font-mono text-[0.7rem]"
                    />
                  </div>

                  {/* Button 2 */}
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2 min-w-0">
                    <span className="block font-bold text-slate-800">Secondary Button (Optional)</span>
                    <input
                      type="text"
                      value={hero.secondary?.label ?? ""}
                      onChange={(e) => {
                        const heroes = [...content.heroes];
                        heroes[index] = {
                          ...heroes[index],
                          secondary: { label: e.target.value, to: hero.secondary?.to || "/store" },
                        };
                        setContent({ ...content, heroes });
                      }}
                      placeholder="Button label (e.g. Buy)"
                      className="w-full p-2 rounded-lg border border-slate-200 bg-white"
                    />
                    <input
                      type="text"
                      value={hero.secondary?.to ?? ""}
                      onChange={(e) => {
                        const heroes = [...content.heroes];
                        heroes[index] = {
                          ...heroes[index],
                          secondary: { label: hero.secondary?.label || "Buy", to: e.target.value },
                        };
                        setContent({ ...content, heroes });
                      }}
                      placeholder="Destination URL (e.g. /shop/buy-iphone/...)"
                      className="w-full p-2 rounded-lg border border-slate-200 bg-white font-mono text-[0.7rem]"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 2: PROMOTIONAL TILES */}
      {activeTab === "tiles" && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-sm font-bold text-slate-900">Promotional Grid Tiles</h3>
            <button
              type="button"
              onClick={() => {
                const newTile: PromoTile = {
                  id: `tile-${Date.now()}`,
                  title: "Featured Product Tile",
                  subtitle: "Engineered for extraordinary moments.",
                  image: "/products/homepage/macbook-air.jpg",
                  alt: "Product promo tile",
                  tone: "light",
                  primary: { label: "Learn more", to: "/store" },
                  secondary: { label: "View pricing", to: "/store" },
                  enabled: true,
                  order: content.tiles.length + 1,
                };
                setContent({ ...content, tiles: [...content.tiles, newTile] });
              }}
              className="admin-btn admin-btn-sm bg-[#0f172a] text-[#f0cf78] hover:bg-slate-800 border border-[#0f172a] whitespace-nowrap"
            >
              <Plus size={14} />
              <span>Add Promotional Tile</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {content.tiles.map((tile, index) => (
              <div
                key={tile.id}
                className={`rounded-2xl bg-white p-4 sm:p-5 space-y-3 border shadow-sm transition min-w-0 ${
                  tile.enabled ? "border-slate-200" : "border-slate-200/60 bg-slate-50/70 opacity-65"
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-100">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <span className="w-5 h-5 rounded-full bg-[#0f172a] text-[#f0cf78] font-bold text-[0.65rem] flex items-center justify-center shrink-0">
                      {index + 1}
                    </span>
                    <h4 className="font-bold text-slate-900 text-xs truncate">
                      {tile.title}
                    </h4>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <label className="flex items-center gap-1 text-[0.7rem] font-bold text-slate-700 cursor-pointer mr-1">
                      <input
                        type="checkbox"
                        checked={tile.enabled}
                        onChange={(e) => {
                          const tiles = [...content.tiles];
                          tiles[index] = { ...tiles[index], enabled: e.target.checked };
                          setContent({ ...content, tiles });
                        }}
                        className="rounded border-slate-300"
                      />
                      <span>Active</span>
                    </label>

                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => setContent({ ...content, tiles: moveItem(content.tiles, index, -1) })}
                      className="p-1.5 rounded-lg border border-slate-200 bg-white hover:border-[#d4af37]/60 text-slate-600 disabled:opacity-30 transition"
                    >
                      <ArrowUp size={12} />
                    </button>
                    <button
                      type="button"
                      disabled={index === content.tiles.length - 1}
                      onClick={() => setContent({ ...content, tiles: moveItem(content.tiles, index, 1) })}
                      className="p-1.5 rounded-lg border border-slate-200 bg-white hover:border-[#d4af37]/60 text-slate-600 disabled:opacity-30 transition"
                    >
                      <ArrowDown size={12} />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const tiles = content.tiles.filter((_, i) => i !== index);
                        setContent({ ...content, tiles });
                      }}
                      className="p-1.5 rounded-lg border border-rose-200 bg-white text-rose-600 hover:bg-rose-50 transition"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Title</label>
                    <input
                      type="text"
                      value={tile.title}
                      onChange={(e) => {
                        const tiles = [...content.tiles];
                        tiles[index] = { ...tiles[index], title: e.target.value };
                        setContent({ ...content, tiles });
                      }}
                      className="w-full p-2 rounded-lg border border-slate-200 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Subtitle</label>
                    <input
                      type="text"
                      value={tile.subtitle}
                      onChange={(e) => {
                        const tiles = [...content.tiles];
                        tiles[index] = { ...tiles[index], subtitle: e.target.value };
                        setContent({ ...content, tiles });
                      }}
                      className="w-full p-2 rounded-lg border border-slate-200 bg-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block font-bold text-slate-700 text-xs">Tile Image Artwork *</label>
                    <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
                      <input
                        type="text"
                        value={tile.image}
                        onChange={(e) => {
                          const tiles = [...content.tiles];
                          tiles[index] = { ...tiles[index], image: e.target.value };
                          setContent({ ...content, tiles });
                        }}
                        className="flex-1 min-w-0 p-2 rounded-lg border border-slate-200 bg-white font-mono text-[0.68rem]"
                      />
                      <button
                        type="button"
                        onClick={() => setMediaPickerTarget({ section: "tile", index, field: "image" })}
                        className="px-3 py-2 rounded-lg bg-[#d4af37] hover:bg-[#b89726] text-[#0a0a0c] border border-[#b89726]/40 font-bold shrink-0 whitespace-nowrap text-xs flex items-center gap-1.5 transition"
                      >
                        <ImageIcon size={13} className="shrink-0" />
                        <span>Change Image</span>
                      </button>
                    </div>
                    <div className="homepage-cms-media-preview mt-1">
                      <img
                        src={tile.image}
                        alt={tile.alt || tile.title}
                        className="w-full h-full object-contain"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Tone</label>
                      <select
                        value={tile.tone}
                        onChange={(e) => {
                          const tiles = [...content.tiles];
                          tiles[index] = { ...tiles[index], tone: e.target.value as Tone };
                          setContent({ ...content, tiles });
                        }}
                        className="w-full p-2 rounded-lg border border-slate-200 bg-white text-xs font-semibold"
                      >
                        <option value="light">Light</option>
                        <option value="dark">Dark</option>
                        <option value="mist">Mist</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Placement</label>
                      <select
                        value={tile.placement || "top"}
                        onChange={(e) => {
                          const tiles = [...content.tiles];
                          tiles[index] = {
                            ...tiles[index],
                            placement: e.target.value === "bottom" ? "bottom" : undefined,
                          };
                          setContent({ ...content, tiles });
                        }}
                        className="w-full p-2 rounded-lg border border-slate-200 bg-white text-xs"
                      >
                        <option value="top">Top Aligned Text</option>
                        <option value="bottom">Bottom Aligned Text</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-0.5">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Primary Link</label>
                      <input
                        type="text"
                        value={tile.primary.to}
                        onChange={(e) => {
                          const tiles = [...content.tiles];
                          tiles[index] = { ...tiles[index], primary: { ...tiles[index].primary, to: e.target.value } };
                          setContent({ ...content, tiles });
                        }}
                        placeholder="/store"
                        className="w-full p-2 rounded-lg border border-slate-200 bg-white font-mono text-[0.68rem]"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Button Label</label>
                      <input
                        type="text"
                        value={tile.primary.label}
                        onChange={(e) => {
                          const tiles = [...content.tiles];
                          tiles[index] = { ...tiles[index], primary: { ...tiles[index].primary, label: e.target.value } };
                          setContent({ ...content, tiles });
                        }}
                        placeholder="Learn more"
                        className="w-full p-2 rounded-lg border border-slate-200 bg-white text-xs"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 3: SERVICE FLYERS */}
      {activeTab === "flyers" && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-sm font-bold text-slate-900">Our Services Showcase Flyers</h3>
            <button
              type="button"
              onClick={() => {
                const newFlyer: ServiceFlyer = {
                  id: `flyer-${Date.now()}`,
                  title: "Special Promotion Flyer",
                  image: "/services/repairs.png",
                  alt: "Service flyer showcase",
                  to: "/contact",
                  enabled: true,
                  order: content.serviceFlyers.length + 1,
                };
                setContent({ ...content, serviceFlyers: [...content.serviceFlyers, newFlyer] });
              }}
              className="admin-btn admin-btn-sm bg-[#0f172a] text-[#f0cf78] hover:bg-slate-800 border border-[#0f172a] whitespace-nowrap"
            >
              <Plus size={14} />
              <span>Add Flyer</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {content.serviceFlyers.map((flyer, index) => (
              <div
                key={flyer.id}
                className={`rounded-2xl bg-white p-4 sm:p-5 space-y-3 border shadow-sm transition min-w-0 flex flex-col ${
                  flyer.enabled ? "border-slate-200" : "border-slate-200/60 bg-slate-50/70 opacity-65"
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-100">
                  <h4 className="font-bold text-slate-900 text-xs truncate min-w-0 flex-1">{flyer.title}</h4>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <label className="flex items-center gap-1 text-[0.7rem] font-bold text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={flyer.enabled}
                        onChange={(e) => {
                          const flyers = [...content.serviceFlyers];
                          flyers[index] = { ...flyers[index], enabled: e.target.checked };
                          setContent({ ...content, serviceFlyers: flyers });
                        }}
                        className="rounded border-slate-300"
                      />
                      <span>Active</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        const flyers = content.serviceFlyers.filter((_, i) => i !== index);
                        setContent({ ...content, serviceFlyers: flyers });
                      }}
                      className="p-1.5 rounded-lg border border-rose-200 bg-white text-rose-600 hover:bg-rose-50 transition"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                <div className="aspect-[3/4] bg-[#0d0e11] rounded-xl overflow-hidden flex items-center justify-center border border-slate-300 p-2">
                  <img src={flyer.image} alt={flyer.alt} className="w-full h-full object-contain" />
                </div>

                <div className="space-y-2.5 text-xs mt-auto">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Title</label>
                    <input
                      type="text"
                      value={flyer.title}
                      onChange={(e) => {
                        const flyers = [...content.serviceFlyers];
                        flyers[index] = { ...flyers[index], title: e.target.value };
                        setContent({ ...content, serviceFlyers: flyers });
                      }}
                      className="w-full p-2 rounded-lg border border-slate-200 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Destination Link</label>
                    <input
                      type="text"
                      value={flyer.to}
                      onChange={(e) => {
                        const flyers = [...content.serviceFlyers];
                        flyers[index] = { ...flyers[index], to: e.target.value };
                        setContent({ ...content, serviceFlyers: flyers });
                      }}
                      className="w-full p-2 rounded-lg border border-slate-200 bg-white font-mono text-[0.7rem]"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => setMediaPickerTarget({ section: "flyer", index, field: "image" })}
                    className="w-full py-2 px-3 rounded-lg bg-[#d4af37] hover:bg-[#b89726] text-[#0a0a0c] border border-[#b89726]/40 font-bold flex items-center justify-center gap-1.5 transition text-xs whitespace-nowrap"
                  >
                    <ImageIcon size={13} className="shrink-0" />
                    <span>Change Flyer Artwork</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 4: ANNOUNCEMENT BAR */}
      {activeTab === "announcement" && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm space-y-4 max-w-2xl">
          <div className="flex flex-wrap items-start sm:items-center justify-between gap-3 pb-3.5 border-b border-slate-100">
            <div className="min-w-0 flex-1">
              <h3 className="font-bold text-slate-900 text-sm">Top Homepage Announcement Bar</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                A prominent banner at the very top of the homepage highlighting promotions or trade-in perks.
              </p>
            </div>
            <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={content.announcement.enabled}
                onChange={(e) =>
                  setContent({
                    ...content,
                    announcement: { ...content.announcement, enabled: e.target.checked },
                  })
                }
                className="rounded border-slate-300"
              />
              <span>Banner Active</span>
            </label>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Announcement Message *</label>
              <input
                type="text"
                value={content.announcement.text}
                onChange={(e) =>
                  setContent({
                    ...content,
                    announcement: { ...content.announcement, text: e.target.value },
                  })
                }
                className="w-full p-2.5 rounded-lg border border-slate-200 bg-white"
                placeholder="e.g. Trade in your current device toward your next one."
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Link Label</label>
                <input
                  type="text"
                  value={content.announcement.linkText}
                  onChange={(e) =>
                    setContent({
                      ...content,
                      announcement: { ...content.announcement, linkText: e.target.value },
                    })
                  }
                  className="w-full p-2.5 rounded-lg border border-slate-200 bg-white"
                  placeholder="e.g. Explore trade-in"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Link Destination</label>
                <input
                  type="text"
                  value={content.announcement.linkTo}
                  onChange={(e) =>
                    setContent({
                      ...content,
                      announcement: { ...content.announcement, linkTo: e.target.value },
                    })
                  }
                  className="w-full p-2.5 rounded-lg border border-slate-200 bg-white font-mono text-[0.7rem]"
                  placeholder="/sell-or-trade?mode=upgrade"
                />
              </div>
            </div>

            {/* Live Preview Box */}
            <div className="pt-2">
              <span className="block font-bold text-slate-500 mb-1.5">Storefront Preview:</span>
              <div className="p-3 bg-[#0a0a0c] text-white rounded-xl text-center text-xs font-medium border border-[#d4af37]/30">
                {content.announcement.text}{" "}
                <span className="text-[#d4af37] underline font-bold cursor-pointer">
                  {content.announcement.linkText} &rsaquo;
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
        </div>
      )}

      {/* Media Picker Modal */}
      {mediaPickerTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setMediaPickerTarget(null)}
        >
          <div
            className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl p-6 space-y-4 max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ImageIcon size={18} className="text-[#d4af37]" />
                <h3 className="font-bold text-slate-900 text-sm">Select Image from Media Library</h3>
              </div>
              <button
                type="button"
                onClick={() => setMediaPickerTarget(null)}
                className="p-1 text-slate-400 hover:text-slate-900"
              >
                <X size={18} />
              </button>
            </div>

            <AdminMediaLibrary isPicker onSelect={handleMediaSelected} />
          </div>
        </div>
      )}

      {/* Live Preview Modal */}
      {previewOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md"
          onClick={() => setPreviewOpen(false)}
        >
          <div
            className="w-full max-w-5xl bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 bg-slate-900 text-white">
              <div className="flex items-center gap-2">
                <Eye size={18} className="text-[#d4af37]" />
                <span className="font-bold text-sm">Homepage Live Preview</span>
              </div>
              <button
                type="button"
                onClick={() => setPreviewOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50">
              {/* Announcement */}
              {content.announcement.enabled && (
                <div className="p-3 bg-slate-900 text-white rounded-xl text-center text-xs font-semibold">
                  {content.announcement.text}{" "}
                  <span className="text-[#d4af37] underline">{content.announcement.linkText} &rsaquo;</span>
                </div>
              )}

              {/* Heroes */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Hero Slides</h4>
                {content.heroes
                  .filter((h) => h.enabled)
                  .map((hero) => (
                    <div
                      key={hero.id}
                      className={`p-6 rounded-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6 ${
                        hero.tone === "dark" ? "bg-slate-950 text-white" : "bg-white text-slate-900 border border-slate-200"
                      }`}
                    >
                      <div className="space-y-2 text-center md:text-left z-10">
                        <h2 className="text-2xl font-black">{hero.title}</h2>
                        <p className="text-sm opacity-80">{hero.subtitle}</p>
                        <div className="flex items-center gap-2 pt-2 justify-center md:justify-start">
                          <span className="px-4 py-1.5 rounded-full bg-[#d4af37] text-slate-900 font-bold text-xs">
                            {hero.primary.label}
                          </span>
                          {hero.secondary && (
                            <span className="px-4 py-1.5 rounded-full border border-current font-bold text-xs opacity-75">
                              {hero.secondary.label}
                            </span>
                          )}
                        </div>
                      </div>
                      <img src={hero.image} alt={hero.alt} className="max-h-48 object-contain" />
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
