import {
  AlertCircle,
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  ExternalLink,
  Eye,
  Grid,
  GripVertical,
  Image as ImageIcon,
  ImagePlus,
  Layers,
  Layout,
  Monitor,
  Plus,
  RotateCcw,
  Save,
  Smartphone,
  Tablet,
  Trash2,
  Upload,
  Volume2,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useCms } from "../../cms/CmsContext";
import { defaultHomepageSections } from "../../cms/defaultCmsData";
import {
  extractLegacyMediaUnit,
  inferLegacyMediaAttributesForUrl,
  reorderListById,
  reorderListByIndex,
  resolveLegacyBackgroundColor,
  summarizeLegacyHomepageChanges,
  SUPPORTED_IMAGE_ACCEPT,
  swapLegacyMediaUnits,
  type LegacyMediaSlotRef,
  type LegacyMediaUnit,
} from "../../cms/homepageBuilderUtils";
import {
  classifyMediaSource,
  saveLocalStagedMedia,
  useResolvedMediaUrl,
  validateLocalMediaFile,
} from "../../cms/localMediaStore";
import { collectHomepageMediaReferences } from "../../cms/supabaseCmsRepository";
import { useProductCatalog } from "../../catalog/ProductCatalogContext";
import type {
  HeroCampaign,
  HomepageContent,
  HomepageMediaFit,
  MediaItem,
  PromoTile,
  ServiceFlyer,
  Tone,
} from "../../cms/types";
import { HomepageSectionBuilder } from "../../components/admin/HomepageSectionBuilder";
import { isAdminHostname } from "../../config/adminHost";
import {
  HOMEPAGE_PREVIEW_SESSION_KEY_LEGACY,
  HOMEPAGE_PREVIEW_SESSION_KEY_MODULAR,
} from "./AdminHomepagePreviewPage";
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
        "Modular live publishing is disabled in the current local-only workflow. Save your local draft and preview safely.",
    };
  }
  await publishFn();
  return { blocked: false };
}

const LEGACY_BG_SWATCHES: Array<{ label: string; value: string; tone: Tone }> = [
  { label: "Pitch Black", value: "#000000", tone: "dark" },
  { label: "Soft Pearl", value: "#fbfbfd", tone: "light" },
  { label: "Pure White", value: "#ffffff", tone: "light" },
  { label: "Neutral Light", value: "#f5f5f7", tone: "light" },
  { label: "Ice Mist", value: "#e9f5fa", tone: "mist" },
];

function writePreviewSessionSnapshot(key: string, value: HomepageContent | null) {
  if (typeof window === "undefined") return;
  try {
    if (value) {
      window.sessionStorage.setItem(key, JSON.stringify(value));
    } else {
      window.sessionStorage.removeItem(key);
    }
  } catch {
    // non-blocking
  }
}

export function AdminHomepageManager() {
  const {
    homepage,
    homepageDraft,
    homepageLegacyDraft,
    media,
    updateHomepage,
    saveHomepageDraftConfig,
    discardHomepageDraftConfig,
    saveHomepageLegacyDraftConfig,
    discardHomepageLegacyDraftConfig,
  } = useCms();
  const { products } = useProductCatalog();

  const [content, setContentRaw] = useState<HomepageContent>(
    () => homepageLegacyDraft || homepage
  );
  const hasLocalLegacyEditsRef = useRef(false);

  const [draftContent, setDraftContentRaw] = useState<HomepageContent>(() =>
    homepageDraft || {
      ...homepage,
      layoutMode: "modular",
      sections:
        homepage.sections && homepage.sections.length > 0
          ? homepage.sections
          : defaultHomepageSections,
    }
  );
  const hasLocalModularEditsRef = useRef(false);

  const [editorMode, setEditorMode] = useState<"modular" | "legacy">("modular");
  const [activeTab, setActiveTab] = useState<"heroes" | "tiles" | "flyers" | "announcement">("heroes");
  const [saving, setSaving] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  const [savingLegacyDraft, setSavingLegacyDraft] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [saveError, setSaveError] = useState("");
  const [publishConfirmOpen, setPublishConfirmOpen] = useState(false);

  // Drag-and-drop state for Legacy campaign reordering and media+background unit swaps
  const [dragHeroId, setDragHeroId] = useState<string | null>(null);
  const [dragTileId, setDragTileId] = useState<string | null>(null);
  const [dragFlyerId, setDragFlyerId] = useState<string | null>(null);
  const [dragMediaSlot, setDragMediaSlot] = useState<LegacyMediaSlotRef | null>(null);

  // Sync legacy content from saved draft or live homepage without clobbering active unsaved edits
  useEffect(() => {
    if (hasLocalLegacyEditsRef.current) return;
    if (homepageLegacyDraft) {
      setContentRaw(homepageLegacyDraft);
      writePreviewSessionSnapshot(HOMEPAGE_PREVIEW_SESSION_KEY_LEGACY, homepageLegacyDraft);
    } else if (homepage) {
      setContentRaw(homepage);
    }
  }, [homepage, homepageLegacyDraft]);

  // Sync modular draft without clobbering active unsaved modular edits
  useEffect(() => {
    if (hasLocalModularEditsRef.current) return;
    if (homepageDraft) {
      setDraftContentRaw(homepageDraft);
      writePreviewSessionSnapshot(HOMEPAGE_PREVIEW_SESSION_KEY_MODULAR, homepageDraft);
    } else if (homepage) {
      setDraftContentRaw({
        ...homepage,
        layoutMode: "modular",
        sections:
          homepage.sections && homepage.sections.length > 0
            ? homepage.sections
            : defaultHomepageSections,
      });
    }
  }, [homepage, homepageDraft]);

  const setContent = (next: HomepageContent) => {
    hasLocalLegacyEditsRef.current = true;
    setContentRaw(next);
    writePreviewSessionSnapshot(HOMEPAGE_PREVIEW_SESSION_KEY_LEGACY, next);
  };

  const setDraftContent = (next: HomepageContent) => {
    hasLocalModularEditsRef.current = true;
    setDraftContentRaw(next);
    writePreviewSessionSnapshot(HOMEPAGE_PREVIEW_SESSION_KEY_MODULAR, next);
  };

  // Media picker modal state
  const [mediaPickerTarget, setMediaPickerTarget] = useState<{
    section: "hero" | "tile" | "flyer";
    index: number;
    field: "image" | "mobileImage";
  } | null>(null);

  // Website Layout Preview Modal state (renders actual storefront website in responsive iframe)
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewViewport, setPreviewViewport] = useState<1440 | 1024 | 834 | 390 | 375>(1440);

  const hasSavedLegacyDraft = Boolean(homepageLegacyDraft);
  const isLegacyDirty = useMemo(() => {
    const baseline = homepageLegacyDraft || homepage;
    return JSON.stringify(content) !== JSON.stringify(baseline);
  }, [content, homepageLegacyDraft, homepage]);

  const legacyPendingUploadsCount = useMemo(
    () => collectHomepageMediaReferences({ ...content, sections: undefined }).localRefs.length,
    [content]
  );

  const publishChangeSummary = useMemo(
    () => summarizeLegacyHomepageChanges(homepage, content, legacyPendingUploadsCount),
    [homepage, content, legacyPendingUploadsCount]
  );

  const swapTargets = useMemo(() => {
    const targets: Array<{ key: string; ref: LegacyMediaSlotRef; label: string }> = [];
    (content.heroes || []).forEach((h, i) => {
      targets.push({
        key: `hero:${i}`,
        ref: { kind: "hero", index: i },
        label: `Hero ${i + 1}: ${h.title || "Untitled Hero"}`,
      });
    });
    (content.tiles || []).forEach((t, i) => {
      targets.push({
        key: `tile:${i}`,
        ref: { kind: "tile", index: i },
        label: `Tile ${i + 1}: ${t.title || "Untitled Tile"}`,
      });
    });
    return targets;
  }, [content.heroes, content.tiles]);

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
      hasLocalModularEditsRef.current = false;
      setDraftContentRaw(saved);
      writePreviewSessionSnapshot(HOMEPAGE_PREVIEW_SESSION_KEY_MODULAR, saved);
      setSuccessMessage("Local modular draft saved to browser storage (live website unchanged).");
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4500);
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
    hasLocalModularEditsRef.current = false;
    writePreviewSessionSnapshot(HOMEPAGE_PREVIEW_SESSION_KEY_MODULAR, null);
    setDraftContentRaw({
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
            hasLocalModularEditsRef.current = false;
            writePreviewSessionSnapshot(HOMEPAGE_PREVIEW_SESSION_KEY_MODULAR, null);
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

  // Legacy Draft handlers (persistent local draft + IndexedDB media; never modifies live homepage)
  const handleSaveLegacyDraft = async () => {
    setSavingLegacyDraft(true);
    setSaveError("");
    setSaveSuccess(false);
    try {
      const saved = await saveHomepageLegacyDraftConfig({
        ...content,
        layoutMode: "legacy",
      });
      hasLocalLegacyEditsRef.current = false;
      setContentRaw(saved);
      writePreviewSessionSnapshot(HOMEPAGE_PREVIEW_SESSION_KEY_LEGACY, saved);
      setSuccessMessage(
        "Legacy homepage draft saved persistently. Refresh or preview on Desktop/Tablet/Mobile without changing the live website."
      );
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 5000);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Failed to save legacy homepage draft.");
    } finally {
      setSavingLegacyDraft(false);
    }
  };

  const handleDiscardLegacyDraft = async () => {
    setSaveError("");
    setSaveSuccess(false);
    await discardHomepageLegacyDraftConfig();
    hasLocalLegacyEditsRef.current = false;
    writePreviewSessionSnapshot(HOMEPAGE_PREVIEW_SESSION_KEY_LEGACY, null);
    setContentRaw(homepage);
    setSuccessMessage("Saved legacy draft discarded; reverted to live published homepage.");
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 4000);
  };

  // Explicit Legacy Publish Live (after user confirmation; uploads local-media:// -> Storage -> AAL2 DB upsert)
  const handlePublishLegacy = async () => {
    setSaving(true);
    setSaveError("");
    setSaveSuccess(false);
    try {
      const published = await updateHomepage({
        ...content,
        layoutMode: "legacy",
      });
      hasLocalLegacyEditsRef.current = false;
      setContentRaw(published);
      writePreviewSessionSnapshot(HOMEPAGE_PREVIEW_SESSION_KEY_LEGACY, null);
      setPublishConfirmOpen(false);
      setSuccessMessage(
        "Legacy homepage published live and verified! All staged media was promoted to Supabase Storage."
      );
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 5500);
    } catch (err) {
      // Preserve draft automatically if unsaved edits existed so work is never lost on publish failure
      try {
        await saveHomepageLegacyDraftConfig({
          ...content,
          layoutMode: "legacy",
        });
      } catch {
        // non-blocking
      }
      setPublishConfirmOpen(false);
      setSaveError(
        err instanceof Error
          ? err.message
          : "Publish failed. Your draft was preserved and the live website was left untouched."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleLegacyLocalUpload = async (
    target: { kind: "hero" | "tile" | "flyer"; index: number; field: "image" | "mobileImage" },
    file: File
  ) => {
    setSaveError("");
    try {
      await validateLocalMediaFile(file, "image");
      const staged = await saveLocalStagedMedia(file);
      const inferred =
        target.field === "image" ? inferLegacyMediaAttributesForUrl(file.name, content) : null;
      if (target.kind === "hero") {
        const heroes = [...content.heroes];
        heroes[target.index] = {
          ...heroes[target.index],
          ...(inferred || {}),
          [target.field]: staged.uri,
        };
        setContent({ ...content, heroes });
      } else if (target.kind === "tile") {
        const tiles = [...content.tiles];
        tiles[target.index] = {
          ...tiles[target.index],
          ...(inferred || {}),
          [target.field]: staged.uri,
        };
        setContent({ ...content, tiles });
      } else {
        const flyers = [...content.serviceFlyers];
        flyers[target.index] = {
          ...flyers[target.index],
          image: staged.uri,
        };
        setContent({ ...content, serviceFlyers: flyers });
      }
    } catch (err) {
      setSaveError(
        err instanceof Error
          ? err.message
          : "Failed to stage local image. Verify file type and size."
      );
    }
  };

  const handleMediaSelected = (item: MediaItem) => {
    if (!mediaPickerTarget) return;
    const { section, index, field } = mediaPickerTarget;
    const inferred =
      field === "image" ? inferLegacyMediaAttributesForUrl(item.url, content) : null;

    if (section === "hero") {
      const heroes = [...content.heroes];
      heroes[index] = {
        ...heroes[index],
        ...(inferred || {}),
        [field]: item.url,
      };
      setContent({ ...content, heroes });
    } else if (section === "tile") {
      const tiles = [...content.tiles];
      tiles[index] = {
        ...tiles[index],
        ...(inferred || {}),
        [field]: item.url,
      };
      setContent({ ...content, tiles });
    } else if (section === "flyer") {
      const flyers = [...content.serviceFlyers];
      flyers[index] = { ...flyers[index], image: item.url };
      setContent({ ...content, serviceFlyers: flyers });
    }

    setMediaPickerTarget(null);
  };

  const openFullWebsitePreview = () => {
    // Save transient preview state for /admin/homepage-preview so iframe sees saved or current edits immediately
    writePreviewSessionSnapshot(HOMEPAGE_PREVIEW_SESSION_KEY_LEGACY, {
      ...content,
      layoutMode: "legacy",
    });
    setPreviewOpen(true);
  };

  const legacyPreviewHref =
    typeof window !== "undefined" && isAdminHostname()
      ? "/admin/homepage-preview?mode=legacy"
      : "/?admin_preview=1";

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
        <div
          role="status"
          data-testid="homepage-save-success"
          className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2"
        >
          <CheckCircle2 size={16} className="shrink-0" />
          <span>{successMessage || "Homepage content successfully updated!"}</span>
        </div>
      )}

      {saveError && (
        <div
          role="alert"
          data-testid="homepage-save-error"
          className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-start justify-between gap-3"
        >
          <div className="flex items-start gap-2 min-w-0">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <span>{saveError}</span>
          </div>
          <button
            type="button"
            onClick={() => setSaveError("")}
            className="text-rose-600 hover:text-rose-900 shrink-0"
            aria-label="Dismiss error"
          >
            <X size={15} />
          </button>
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
          {/* Legacy Workflow Action Toolbar: Save Draft -> Preview -> Publish Live */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm space-y-3.5 homepage-cms-action-bar">
            <div className="space-y-1.5">
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
                {hasSavedLegacyDraft && (
                  <span
                    data-testid="legacy-draft-active-badge"
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#d4af37]/15 text-[#8f650e] border border-[#d4af37]/45 whitespace-nowrap"
                  >
                    Saved Draft Active (Not Published)
                  </span>
                )}
                {isLegacyDirty && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200 whitespace-nowrap">
                    Unsaved Changes
                  </span>
                )}
                {legacyPendingUploadsCount > 0 && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-300 whitespace-nowrap">
                    {legacyPendingUploadsCount} Local Media Staged
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Step 1: Edit campaigns or drag-and-drop image+background units. Step 2: Click{" "}
                <strong>Save Draft</strong> &amp; inspect <strong>Preview Website Layout</strong> across screen sizes. Step 3: Click{" "}
                <strong>Publish Live</strong> only when approved.
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2.5">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  data-testid="legacy-save-draft-btn"
                  disabled={savingLegacyDraft || saving}
                  onClick={handleSaveLegacyDraft}
                  className="admin-btn admin-btn-secondary admin-btn-sm whitespace-nowrap"
                >
                  <Save size={14} className="shrink-0" />
                  <span>{savingLegacyDraft ? "Saving Draft..." : "Save Draft"}</span>
                </button>

                {hasSavedLegacyDraft && (
                  <button
                    type="button"
                    data-testid="legacy-discard-draft-btn"
                    disabled={saving}
                    onClick={handleDiscardLegacyDraft}
                    className="admin-btn admin-btn-sm border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 whitespace-nowrap"
                  >
                    <RotateCcw size={14} className="shrink-0" />
                    <span>Discard Draft</span>
                  </button>
                )}

                <button
                  type="button"
                  data-testid="legacy-preview-layout-btn"
                  onClick={openFullWebsitePreview}
                  className="admin-btn admin-btn-secondary admin-btn-sm whitespace-nowrap"
                >
                  <Eye size={14} className="shrink-0" />
                  <span>Preview Website Layout</span>
                </button>
              </div>

              <button
                type="button"
                data-testid="legacy-publish-live-btn"
                disabled={saving}
                onClick={() => setPublishConfirmOpen(true)}
                className="admin-btn admin-btn-gold admin-btn-sm shadow-xs whitespace-nowrap"
                title="Requires AAL2 Admin MFA verification"
              >
                <Upload size={14} className="shrink-0" />
                <span>{saving ? "Publishing Live..." : "Publish Live"}</span>
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
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Homepage Hero Slides</h3>
                  <p className="text-xs text-slate-500">
                    Drag slide grip handles or use arrows to reorder full hero campaigns, or drag/swap the Media+Background box to move an image with its paired background across any Hero or Tile slot.
                  </p>
                </div>
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
                      backgroundColor: "#000000",
                      mediaFit: "contain",
                      mediaPosition: "bottom",
                      mediaBlendMode: "normal",
                      primary: { label: "Learn more", to: "/store" },
                      secondary: { label: "Buy", to: "/store" },
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
                    draggable={dragHeroId === hero.id}
                    onDragOver={(e) => {
                      if (dragHeroId && dragHeroId !== hero.id) e.preventDefault();
                    }}
                    onDrop={() => {
                      if (dragHeroId && dragHeroId !== hero.id) {
                        setContent({
                          ...content,
                          heroes: reorderListById(content.heroes, dragHeroId, hero.id),
                        });
                      }
                      setDragHeroId(null);
                    }}
                    className={`rounded-2xl bg-white p-4 sm:p-5 space-y-4 border shadow-sm transition min-w-0 ${
                      hero.enabled ? "border-slate-200" : "border-slate-200/60 bg-slate-50/70 opacity-65"
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span
                          role="button"
                          tabIndex={0}
                          draggable
                          onDragStart={() => setDragHeroId(hero.id)}
                          onDragEnd={() => setDragHeroId(null)}
                          className="p-1 text-slate-400 hover:text-slate-800 cursor-grab active:cursor-grabbing shrink-0"
                          title="Drag to reorder Hero Slide"
                        >
                          <GripVertical size={15} />
                        </span>
                        <span className="w-6 h-6 rounded-full bg-[#0f172a] text-[#f0cf78] font-bold text-xs flex items-center justify-center shrink-0">
                          {index + 1}
                        </span>
                        <div className="min-w-0">
                          <h4 className="font-bold text-slate-900 text-sm truncate">
                            {hero.title || "Untitled Slide"}
                          </h4>
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
                          onClick={() =>
                            setContent({ ...content, heroes: reorderListByIndex(content.heroes, index, index - 1) })
                          }
                          className="p-1.5 rounded-lg border border-slate-200 bg-white hover:border-[#d4af37]/60 text-slate-600 disabled:opacity-30 transition"
                          title="Move up"
                        >
                          <ArrowUp size={14} />
                        </button>
                        <button
                          type="button"
                          disabled={index === content.heroes.length - 1}
                          onClick={() =>
                            setContent({ ...content, heroes: reorderListByIndex(content.heroes, index, index + 1) })
                          }
                          className="p-1.5 rounded-lg border border-slate-200 bg-white hover:border-[#d4af37]/60 text-slate-600 disabled:opacity-30 transition"
                          title="Move down"
                        >
                          <ArrowDown size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const heroes = content.heroes
                              .filter((_, i) => i !== index)
                              .map((h, i) => ({ ...h, order: i + 1 }));
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

                      <div>
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

                      <div className="md:col-span-2 xl:col-span-3">
                        <LegacyMediaBackgroundEditor
                          slotRef={{ kind: "hero", index }}
                          unit={extractLegacyMediaUnit(hero)}
                          supportsMobileImage
                          swapTargets={swapTargets}
                          dragMediaSlot={dragMediaSlot}
                          onDragMediaStart={setDragMediaSlot}
                          onDropMediaSwap={(fromRef, toRef) => {
                            setContent(swapLegacyMediaUnits(content, fromRef, toRef));
                            setDragMediaSlot(null);
                          }}
                          onSwapWith={(targetRef) =>
                            setContent(swapLegacyMediaUnits(content, { kind: "hero", index }, targetRef))
                          }
                          onPatch={(patch) => {
                            const heroes = [...content.heroes];
                            heroes[index] = { ...heroes[index], ...patch };
                            setContent({ ...content, heroes });
                          }}
                          onUploadLocal={(field, file) =>
                            handleLegacyLocalUpload({ kind: "hero", index, field }, file)
                          }
                          onOpenLibrary={(field) =>
                            setMediaPickerTarget({ section: "hero", index, field })
                          }
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
                            heroes[index] = {
                              ...heroes[index],
                              primary: { ...heroes[index].primary, label: e.target.value },
                            };
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
                            heroes[index] = {
                              ...heroes[index],
                              primary: { ...heroes[index].primary, to: e.target.value },
                            };
                            setContent({ ...content, heroes });
                          }}
                          placeholder="Destination URL (e.g. /iphone/iphone-18-pro)"
                          className="w-full p-2 rounded-lg border border-slate-200 bg-white font-mono text-[0.7rem]"
                        />
                      </div>

                      {/* Button 2 */}
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2 min-w-0 md:col-span-2">
                        <span className="block font-bold text-slate-800">Secondary Button (Optional)</span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <input
                            type="text"
                            value={hero.secondary?.label ?? ""}
                            onChange={(e) => {
                              const heroes = [...content.heroes];
                              heroes[index] = {
                                ...heroes[index],
                                secondary: {
                                  label: e.target.value,
                                  to: hero.secondary?.to || "/store",
                                },
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
                                secondary: {
                                  label: hero.secondary?.label || "Buy",
                                  to: e.target.value,
                                },
                              };
                              setContent({ ...content, heroes });
                            }}
                            placeholder="Destination URL (e.g. /shop/buy-iphone/...)"
                            className="w-full p-2 rounded-lg border border-slate-200 bg-white font-mono text-[0.7rem]"
                          />
                        </div>
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
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Promotional Grid Tiles</h3>
                  <p className="text-xs text-slate-500">
                    Each tile image is paired inseparably with its surface color, contrast tone, fit, and blend mode when moved or swapped.
                  </p>
                </div>
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
                      backgroundColor: "#f5f5f7",
                      mediaFit: "contain",
                      mediaPosition: "bottom",
                      mediaBlendMode: "normal",
                      primary: { label: "Learn more", to: "/store" },
                      secondary: { label: "Buy", to: "/store" },
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

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                {content.tiles.map((tile, index) => (
                  <div
                    key={tile.id}
                    draggable={dragTileId === tile.id}
                    onDragOver={(e) => {
                      if (dragTileId && dragTileId !== tile.id) e.preventDefault();
                    }}
                    onDrop={() => {
                      if (dragTileId && dragTileId !== tile.id) {
                        setContent({
                          ...content,
                          tiles: reorderListById(content.tiles, dragTileId, tile.id),
                        });
                      }
                      setDragTileId(null);
                    }}
                    className={`rounded-2xl bg-white p-4 sm:p-5 space-y-3 border shadow-sm transition min-w-0 ${
                      tile.enabled ? "border-slate-200" : "border-slate-200/60 bg-slate-50/70 opacity-65"
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-100">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <span
                          role="button"
                          tabIndex={0}
                          draggable
                          onDragStart={() => setDragTileId(tile.id)}
                          onDragEnd={() => setDragTileId(null)}
                          className="p-1 text-slate-400 hover:text-slate-800 cursor-grab active:cursor-grabbing shrink-0"
                          title="Drag to reorder Promotional Tile"
                        >
                          <GripVertical size={14} />
                        </span>
                        <span className="w-5 h-5 rounded-full bg-[#0f172a] text-[#f0cf78] font-bold text-[0.65rem] flex items-center justify-center shrink-0">
                          {index + 1}
                        </span>
                        <h4 className="font-bold text-slate-900 text-xs truncate">{tile.title}</h4>
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
                          onClick={() =>
                            setContent({ ...content, tiles: reorderListByIndex(content.tiles, index, index - 1) })
                          }
                          className="p-1.5 rounded-lg border border-slate-200 bg-white hover:border-[#d4af37]/60 text-slate-600 disabled:opacity-30 transition"
                          title="Move up"
                        >
                          <ArrowUp size={12} />
                        </button>
                        <button
                          type="button"
                          disabled={index === content.tiles.length - 1}
                          onClick={() =>
                            setContent({ ...content, tiles: reorderListByIndex(content.tiles, index, index + 1) })
                          }
                          className="p-1.5 rounded-lg border border-slate-200 bg-white hover:border-[#d4af37]/60 text-slate-600 disabled:opacity-30 transition"
                          title="Move down"
                        >
                          <ArrowDown size={12} />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const tiles = content.tiles
                              .filter((_, i) => i !== index)
                              .map((t, i) => ({ ...t, order: i + 1 }));
                            setContent({ ...content, tiles });
                          }}
                          className="p-1.5 rounded-lg border border-rose-200 bg-white text-rose-600 hover:bg-rose-50 transition"
                          title="Delete tile"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-3 text-xs">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
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
                      </div>

                      <LegacyMediaBackgroundEditor
                        slotRef={{ kind: "tile", index }}
                        unit={extractLegacyMediaUnit(tile)}
                        supportsMobileImage={false}
                        swapTargets={swapTargets}
                        dragMediaSlot={dragMediaSlot}
                        onDragMediaStart={setDragMediaSlot}
                        onDropMediaSwap={(fromRef, toRef) => {
                          setContent(swapLegacyMediaUnits(content, fromRef, toRef));
                          setDragMediaSlot(null);
                        }}
                        onSwapWith={(targetRef) =>
                          setContent(swapLegacyMediaUnits(content, { kind: "tile", index }, targetRef))
                        }
                        onPatch={(patch) => {
                          const tiles = [...content.tiles];
                          tiles[index] = { ...tiles[index], ...patch };
                          setContent({ ...content, tiles });
                        }}
                        onUploadLocal={(field, file) =>
                          handleLegacyLocalUpload({ kind: "tile", index, field }, file)
                        }
                        onOpenLibrary={(field) =>
                          setMediaPickerTarget({ section: "tile", index, field })
                        }
                      />

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-0.5">
                        <div>
                          <label className="block font-bold text-slate-700 mb-1">Text Placement</label>
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
                        <div>
                          <label className="block font-bold text-slate-700 mb-1">Primary Link</label>
                          <input
                            type="text"
                            value={tile.primary.to}
                            onChange={(e) => {
                              const tiles = [...content.tiles];
                              tiles[index] = {
                                ...tiles[index],
                                primary: { ...tiles[index].primary, to: e.target.value },
                              };
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
                              tiles[index] = {
                                ...tiles[index],
                                primary: { ...tiles[index].primary, label: e.target.value },
                              };
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
                      backgroundColor: "#111111",
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
                  <ServiceFlyerAdminCard
                    key={flyer.id}
                    flyer={flyer}
                    index={index}
                    total={content.serviceFlyers.length}
                    dragging={dragFlyerId === flyer.id}
                    onDragStart={() => setDragFlyerId(flyer.id)}
                    onDragEnd={() => setDragFlyerId(null)}
                    onDrop={() => {
                      if (dragFlyerId && dragFlyerId !== flyer.id) {
                        setContent({
                          ...content,
                          serviceFlyers: reorderListById(content.serviceFlyers, dragFlyerId, flyer.id),
                        });
                      }
                      setDragFlyerId(null);
                    }}
                    onMove={(dir) =>
                      setContent({
                        ...content,
                        serviceFlyers: reorderListByIndex(content.serviceFlyers, index, index + dir),
                      })
                    }
                    onPatch={(patch) => {
                      const flyers = [...content.serviceFlyers];
                      flyers[index] = { ...flyers[index], ...patch };
                      setContent({ ...content, serviceFlyers: flyers });
                    }}
                    onDelete={() => {
                      const flyers = content.serviceFlyers
                        .filter((_, i) => i !== index)
                        .map((f, i) => ({ ...f, order: i + 1 }));
                      setContent({ ...content, serviceFlyers: flyers });
                    }}
                    onUploadLocal={(file) =>
                      handleLegacyLocalUpload({ kind: "flyer", index, field: "image" }, file)
                    }
                    onOpenLibrary={() =>
                      setMediaPickerTarget({ section: "flyer", index, field: "image" })
                    }
                  />
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

      {/* Publish Confirmation Modal */}
      {publishConfirmOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={() => !saving && setPublishConfirmOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            data-testid="legacy-publish-confirm-modal"
            className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 sm:p-5 bg-[#0a0a0c] text-white flex items-center justify-between border-b border-[#d4af37]/30">
              <div>
                <h3 className="font-bold text-sm text-[#f0cf78]">Confirm Publish Live (Legacy Homepage)</h3>
                <p className="text-[11px] text-slate-300 mt-0.5">
                  Requires active AAL2 Admin MFA session. Unfinished modular layout remains protected.
                </p>
              </div>
              <button
                type="button"
                disabled={saving}
                onClick={() => setPublishConfirmOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs text-slate-700">
              <div className="rounded-xl bg-slate-50 border border-slate-200 p-3.5 space-y-1.5">
                <p className="font-bold text-slate-900">Summary of changes to publish:</p>
                <ul className="list-disc pl-4 space-y-1">
                  {publishChangeSummary.summaryLines.map((line, i) => (
                    <li key={i}>{line}</li>
                  ))}
                </ul>
              </div>

              <p className="text-[11px] text-slate-500">
                If any media upload, authentication check, or validation fails, the live website remains untouched and your saved draft will be preserved.
              </p>

              <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => setPublishConfirmOpen(false)}
                  className="admin-btn admin-btn-secondary admin-btn-sm"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  data-testid="legacy-confirm-publish-btn"
                  disabled={saving}
                  onClick={handlePublishLegacy}
                  className="admin-btn admin-btn-gold admin-btn-sm"
                >
                  <Upload size={14} className="shrink-0" />
                  <span>{saving ? "Uploading & Publishing..." : "Confirm & Publish Live"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Actual Responsive Storefront Draft Preview Modal (same-origin protected iframe) */}
      {previewOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/75 backdrop-blur-md"
          onClick={() => setPreviewOpen(false)}
        >
          <div
            data-testid="legacy-website-preview-modal"
            className="w-full h-[94vh] bg-slate-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-slate-700"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-wrap items-center justify-between gap-2.5 p-3 sm:px-5 bg-[#0a0a0c] text-white border-b border-[#d4af37]/30">
              <div className="flex flex-wrap items-center gap-2">
                <Eye size={16} className="text-[#d4af37]" />
                <span className="font-bold text-xs sm:text-sm">Actual Website Draft Preview</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#d4af37]/20 text-[#f0cf78] border border-[#d4af37]/40">
                  {hasSavedLegacyDraft ? "Saved Draft" : "Working Preview"} · Live Unchanged
                </span>
              </div>

              <div className="inline-flex flex-wrap items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/10">
                {(
                  [
                    { w: 1440, label: "1440px", Icon: Monitor },
                    { w: 1024, label: "1024px", Icon: Monitor },
                    { w: 834, label: "834px", Icon: Tablet },
                    { w: 390, label: "390px", Icon: Smartphone },
                    { w: 375, label: "375px", Icon: Smartphone },
                  ] as const
                ).map(({ w, label, Icon }) => (
                  <button
                    key={w}
                    type="button"
                    onClick={() => setPreviewViewport(w)}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition ${
                      previewViewport === w
                        ? "bg-[#d4af37] text-[#0a0a0c]"
                        : "text-slate-200 hover:bg-white/10"
                    }`}
                  >
                    <Icon size={12} />
                    <span>{label}</span>
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={legacyPreviewHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[11px] font-semibold transition whitespace-nowrap"
                >
                  <ExternalLink size={12} />
                  <span>Open Full Tab</span>
                </a>
                <button
                  type="button"
                  onClick={() => setPreviewOpen(false)}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[11px] font-semibold transition"
                >
                  <X size={14} />
                  <span>Return to Editor</span>
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-auto p-3 sm:p-5 flex justify-center bg-slate-800">
              <iframe
                title="Actual Homepage Draft Preview"
                src={`/admin/homepage-preview?mode=legacy&embedded=1${
                  typeof window !== "undefined" &&
                  (window.location.hostname === "localhost" ||
                    window.location.hostname === "127.0.0.1")
                    ? "&admin_preview=1"
                    : ""
                }`}
                style={{ width: `${previewViewport}px`, maxWidth: "100%", height: "100%" }}
                className="bg-white rounded-xl border border-slate-600 shadow-2xl"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function LegacyMediaBackgroundEditor({
  slotRef,
  unit,
  supportsMobileImage,
  swapTargets,
  dragMediaSlot,
  onDragMediaStart,
  onDropMediaSwap,
  onSwapWith,
  onPatch,
  onUploadLocal,
  onOpenLibrary,
}: {
  slotRef: LegacyMediaSlotRef;
  unit: LegacyMediaUnit;
  supportsMobileImage: boolean;
  swapTargets: Array<{ key: string; ref: LegacyMediaSlotRef; label: string }>;
  dragMediaSlot: LegacyMediaSlotRef | null;
  onDragMediaStart: (ref: LegacyMediaSlotRef | null) => void;
  onDropMediaSwap: (from: LegacyMediaSlotRef, to: LegacyMediaSlotRef) => void;
  onSwapWith: (target: LegacyMediaSlotRef) => void;
  onPatch: (patch: Partial<LegacyMediaUnit>) => void;
  onUploadLocal: (field: "image" | "mobileImage", file: File) => void;
  onOpenLibrary: (field: "image" | "mobileImage") => void;
}) {
  const desktopInputRef = useRef<HTMLInputElement>(null);
  const mobileInputRef = useRef<HTMLInputElement>(null);
  const { resolvedUrl: desktopResolved } = useResolvedMediaUrl(unit.image);
  const { resolvedUrl: mobileResolved } = useResolvedMediaUrl(unit.mobileImage);

  const currentKey = `${slotRef.kind}:${slotRef.index}`;
  const effectiveBg = resolveLegacyBackgroundColor(unit.tone, unit.backgroundColor);
  const effectiveBlend = unit.tone === "dark" ? "normal" : unit.mediaBlendMode || "normal";
  const desktopStatus = classifyMediaSource(unit.image);

  const isDragSource =
    dragMediaSlot?.kind === slotRef.kind && dragMediaSlot?.index === slotRef.index;

  return (
    <div
      className={`p-3.5 rounded-xl bg-slate-50 border transition space-y-3 ${
        dragMediaSlot && !isDragSource
          ? "border-dashed border-[#d4af37] bg-[#fbf8ef]"
          : "border-slate-200"
      }`}
      onDragOver={(e) => {
        if (dragMediaSlot && !isDragSource) e.preventDefault();
      }}
      onDrop={() => {
        if (dragMediaSlot && !isDragSource) {
          onDropMediaSwap(dragMediaSlot, slotRef);
        }
      }}
    >
      {/* Top Row: Unified Media+Background Header + Swap Selector */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-200/80">
        <div className="flex flex-wrap items-center gap-2">
          <span
            role="button"
            tabIndex={0}
            draggable
            onDragStart={(e) => {
              e.stopPropagation();
              onDragMediaStart(slotRef);
            }}
            onDragEnd={() => onDragMediaStart(null)}
            className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-white border border-slate-200 text-slate-700 font-bold text-[11px] cursor-grab active:cursor-grabbing hover:border-[#d4af37]"
            title="Drag this Image + Background unit onto another Hero or Tile to swap cleanly"
            data-legacy-media-drag={currentKey}
          >
            <GripVertical size={12} />
            <span>Image + Background Unit</span>
          </span>
          <span
            className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold border border-slate-300 bg-white text-slate-700"
            title={`Active background: ${effectiveBg}`}
          >
            <span
              className="w-3 h-3 rounded-full border border-slate-300 shrink-0"
              style={{ backgroundColor: effectiveBg }}
            />
            <span>
              {unit.tone.toUpperCase()} · {effectiveBg}
            </span>
          </span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-white border border-slate-200 text-slate-600">
            {desktopStatus.label}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <label className="text-[11px] font-bold text-slate-600 whitespace-nowrap">
            Swap Image &amp; BG With:
          </label>
          <select
            value=""
            data-legacy-swap-select={currentKey}
            onChange={(e) => {
              const target = swapTargets.find((t) => t.key === e.target.value);
              if (target) onSwapWith(target.ref);
            }}
            className="p-1.5 rounded-lg border border-slate-300 bg-white text-[11px] font-semibold text-slate-800 max-w-[210px]"
          >
            <option value="">Choose slot to swap...</option>
            {swapTargets
              .filter((t) => t.key !== currentKey)
              .map((t) => (
                <option key={t.key} value={t.key}>
                  {t.label}
                </option>
              ))}
          </select>
        </div>
      </div>

      {/* Media Slots Grid */}
      <div className={supportsMobileImage ? "homepage-cms-media-grid" : "grid grid-cols-1 gap-3"}>
        {/* Desktop / Primary Image + Live Visual Background Preview */}
        <div className="space-y-2 min-w-0 flex flex-col">
          <div className="flex flex-wrap items-center justify-between gap-1.5">
            <label className="block font-bold text-slate-800 text-xs">
              {supportsMobileImage ? "Desktop Hero Image *" : "Tile Image Artwork *"}
            </label>
            <span className="text-[0.65rem] text-slate-500 font-semibold">
              Preview reflects paired background &amp; blend
            </span>
          </div>

          <div
            data-legacy-media-preview={currentKey}
            className="homepage-cms-media-preview relative overflow-hidden"
            style={{
              background: unit.backgroundGradient || effectiveBg,
              backgroundColor: effectiveBg,
            }}
          >
            {desktopResolved ? (
              <img
                src={desktopResolved}
                alt={unit.alt}
                className="w-full h-full"
                style={{
                  objectFit: unit.mediaFit || "contain",
                  mixBlendMode: effectiveBlend,
                }}
              />
            ) : (
              <span className="text-[11px] text-slate-400">No image selected</span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <input
              ref={desktopInputRef}
              type="file"
              accept={SUPPORTED_IMAGE_ACCEPT}
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) onUploadLocal("image", file);
                e.target.value = "";
              }}
            />
            <button
              type="button"
              onClick={() => desktopInputRef.current?.click()}
              className="px-3 py-1.5 rounded-lg bg-[#d4af37] hover:bg-[#b89726] text-[#0a0a0c] border border-[#b89726]/40 font-bold flex items-center gap-1.5 shrink-0 whitespace-nowrap transition text-xs"
            >
              <ImagePlus size={13} className="shrink-0" />
              <span>Upload Local</span>
            </button>
            <button
              type="button"
              onClick={() => onOpenLibrary("image")}
              className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 font-semibold flex items-center gap-1.5 shrink-0 whitespace-nowrap transition text-xs"
            >
              <ImageIcon size={13} className="shrink-0" />
              <span>Library</span>
            </button>
            <input
              type="text"
              value={unit.image}
              onChange={(e) => onPatch({ image: e.target.value })}
              className="flex-1 min-w-[140px] p-1.5 rounded-lg border border-slate-200 bg-white font-mono text-[0.68rem]"
              placeholder="/products/homepage/..."
            />
          </div>
        </div>

        {/* Optional Mobile Hero Image */}
        {supportsMobileImage && (
          <div className="space-y-2 min-w-0 flex flex-col">
            <div className="flex flex-wrap items-center justify-between gap-1.5">
              <label className="block font-bold text-slate-800 text-xs">
                Mobile Image (Optional)
              </label>
              <span className="text-[0.65rem] text-slate-500 font-semibold">
                Portrait crop on &le; 768px screens
              </span>
            </div>

            <div
              className="homepage-cms-media-preview"
              style={{
                background: unit.backgroundGradient || effectiveBg,
                backgroundColor: effectiveBg,
              }}
            >
              {mobileResolved ? (
                <img
                  src={mobileResolved}
                  alt="Mobile preview"
                  className="w-full h-full"
                  style={{
                    objectFit: unit.mediaFit || "contain",
                    mixBlendMode: effectiveBlend,
                  }}
                />
              ) : (
                <span className="text-[0.68rem] text-slate-400 font-medium text-center px-2">
                  Inherits Desktop Image on Mobile
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <input
                ref={mobileInputRef}
                type="file"
                accept={SUPPORTED_IMAGE_ACCEPT}
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) onUploadLocal("mobileImage", file);
                  e.target.value = "";
                }}
              />
              <button
                type="button"
                onClick={() => mobileInputRef.current?.click()}
                className="px-3 py-1.5 rounded-lg bg-[#d4af37] hover:bg-[#b89726] text-[#0a0a0c] border border-[#b89726]/40 font-bold flex items-center gap-1.5 shrink-0 whitespace-nowrap transition text-xs"
              >
                <ImagePlus size={13} className="shrink-0" />
                <span>Upload Mobile</span>
              </button>
              <button
                type="button"
                onClick={() => onOpenLibrary("mobileImage")}
                className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 font-semibold flex items-center gap-1.5 shrink-0 whitespace-nowrap transition text-xs"
              >
                <ImageIcon size={13} className="shrink-0" />
                <span>Library</span>
              </button>
              {unit.mobileImage ? (
                <button
                  type="button"
                  onClick={() => onPatch({ mobileImage: undefined })}
                  className="px-2.5 py-1.5 rounded-lg border border-rose-200 bg-rose-50/40 text-rose-700 hover:bg-rose-50 text-xs font-semibold transition whitespace-nowrap shrink-0"
                >
                  Clear
                </button>
              ) : null}
            </div>
          </div>
        )}
      </div>

      {/* Associated Visual Background & Fit Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-2 border-t border-slate-200/80 text-xs">
        <div>
          <label className="block font-bold text-slate-700 mb-1">Surface Theme (Text Contrast)</label>
          <select
            value={unit.tone}
            onChange={(e) => {
              const nextTone = e.target.value as Tone;
              const nextDefaultBg = resolveLegacyBackgroundColor(nextTone);
              onPatch({
                tone: nextTone,
                backgroundColor: nextDefaultBg,
                mediaBlendMode: nextTone === "dark" ? "normal" : unit.mediaBlendMode,
              });
            }}
            className="w-full p-2 rounded-lg border border-slate-200 bg-white font-semibold"
          >
            <option value="dark">Dark Surface (White Text)</option>
            <option value="light">Light Surface (Dark Text)</option>
            <option value="mist">Ice Mist Surface (Dark Text)</option>
          </select>
        </div>

        <div>
          <label className="block font-bold text-slate-700 mb-1">Paired Background Color</label>
          <div className="flex items-center gap-1.5">
            <input
              type="color"
              value={/^#[0-9a-f]{6}$/i.test(effectiveBg) ? effectiveBg : "#ffffff"}
              onChange={(e) => onPatch({ backgroundColor: e.target.value })}
              className="w-9 h-8 rounded border border-slate-200 cursor-pointer p-0.5 shrink-0"
            />
            <select
              value={effectiveBg}
              onChange={(e) => {
                const preset = LEGACY_BG_SWATCHES.find((s) => s.value === e.target.value);
                onPatch({
                  backgroundColor: e.target.value,
                  ...(preset
                    ? {
                        tone: preset.tone,
                        mediaBlendMode: preset.tone === "dark" ? "normal" : unit.mediaBlendMode,
                      }
                    : {}),
                });
              }}
              className="flex-1 min-w-0 p-2 rounded-lg border border-slate-200 bg-white"
            >
              {!LEGACY_BG_SWATCHES.some((s) => s.value === effectiveBg) && (
                <option value={effectiveBg}>{effectiveBg}</option>
              )}
              {LEGACY_BG_SWATCHES.map((sw) => (
                <option key={sw.value} value={sw.value}>
                  {sw.label} ({sw.value})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block font-bold text-slate-700 mb-1">Image Fit &amp; Focal Point</label>
          <div className="grid grid-cols-2 gap-1.5">
            <select
              value={unit.mediaFit || "contain"}
              onChange={(e) => onPatch({ mediaFit: e.target.value as HomepageMediaFit })}
              className="p-2 rounded-lg border border-slate-200 bg-white"
            >
              <option value="contain">Contain (No Crop)</option>
              <option value="cover">Cover (Full Bleed)</option>
            </select>
            <select
              value={unit.mediaPosition || "bottom"}
              onChange={(e) => onPatch({ mediaPosition: e.target.value })}
              className="p-2 rounded-lg border border-slate-200 bg-white"
            >
              <option value="bottom">Bottom</option>
              <option value="center">Center</option>
              <option value="top">Top</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block font-bold text-slate-700 mb-1">Studio Paper Blend</label>
          <select
            disabled={unit.tone === "dark"}
            value={unit.tone === "dark" ? "normal" : unit.mediaBlendMode || "normal"}
            onChange={(e) =>
              onPatch({ mediaBlendMode: e.target.value === "multiply" ? "multiply" : "normal" })
            }
            className="w-full p-2 rounded-lg border border-slate-200 bg-white disabled:bg-slate-100 disabled:text-slate-400"
          >
            <option value="normal">Standard Solid</option>
            <option value="multiply">Multiply (Light Cutout Blend)</option>
          </select>
        </div>
      </div>
    </div>
  );
}

function ServiceFlyerAdminCard({
  flyer,
  index,
  total,
  dragging,
  onDragStart,
  onDragEnd,
  onDrop,
  onMove,
  onPatch,
  onDelete,
  onUploadLocal,
  onOpenLibrary,
}: {
  flyer: ServiceFlyer;
  index: number;
  total: number;
  dragging: boolean;
  onDragStart: () => void;
  onDragEnd: () => void;
  onDrop: () => void;
  onMove: (dir: -1 | 1) => void;
  onPatch: (patch: Partial<ServiceFlyer>) => void;
  onDelete: () => void;
  onUploadLocal: (file: File) => void;
  onOpenLibrary: () => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const { resolvedUrl } = useResolvedMediaUrl(flyer.image);

  return (
    <div
      draggable={dragging}
      onDragOver={(e) => e.preventDefault()}
      onDrop={onDrop}
      className={`rounded-2xl bg-white p-4 sm:p-5 space-y-3 border shadow-sm transition min-w-0 flex flex-col ${
        flyer.enabled ? "border-slate-200" : "border-slate-200/60 bg-slate-50/70 opacity-65"
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-100">
        <div className="flex items-center gap-1.5 min-w-0 flex-1">
          <span
            role="button"
            tabIndex={0}
            draggable
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            className="p-0.5 text-slate-400 hover:text-slate-800 cursor-grab shrink-0"
            title="Drag to reorder flyer"
          >
            <GripVertical size={13} />
          </span>
          <h4 className="font-bold text-slate-900 text-xs truncate">{flyer.title}</h4>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <label className="flex items-center gap-1 text-[0.7rem] font-bold text-slate-700 cursor-pointer mr-1">
            <input
              type="checkbox"
              checked={flyer.enabled}
              onChange={(e) => onPatch({ enabled: e.target.checked })}
              className="rounded border-slate-300"
            />
            <span>Active</span>
          </label>
          <button
            type="button"
            disabled={index === 0}
            onClick={() => onMove(-1)}
            className="p-1 rounded-lg border border-slate-200 bg-white text-slate-600 disabled:opacity-30"
            title="Move left / up"
          >
            <ArrowUp size={12} />
          </button>
          <button
            type="button"
            disabled={index === total - 1}
            onClick={() => onMove(1)}
            className="p-1 rounded-lg border border-slate-200 bg-white text-slate-600 disabled:opacity-30"
            title="Move right / down"
          >
            <ArrowDown size={12} />
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="p-1.5 rounded-lg border border-rose-200 bg-white text-rose-600 hover:bg-rose-50 transition"
            title="Delete flyer"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      <div
        className="aspect-[3/4] rounded-xl overflow-hidden flex items-center justify-center border border-slate-300 p-2"
        style={{ backgroundColor: flyer.backgroundColor || "#0d0e11" }}
      >
        <img src={resolvedUrl || flyer.image} alt={flyer.alt} className="w-full h-full object-contain" />
      </div>

      <div className="space-y-2.5 text-xs mt-auto">
        <div>
          <label className="block font-bold text-slate-700 mb-1">Title</label>
          <input
            type="text"
            value={flyer.title}
            onChange={(e) => onPatch({ title: e.target.value })}
            className="w-full p-2 rounded-lg border border-slate-200 bg-white"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <div className="sm:col-span-2">
            <label className="block font-bold text-slate-700 mb-1">Destination Link</label>
            <input
              type="text"
              value={flyer.to}
              onChange={(e) => onPatch({ to: e.target.value })}
              className="w-full p-2 rounded-lg border border-slate-200 bg-white font-mono text-[0.7rem]"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">Card BG</label>
            <input
              type="color"
              value={flyer.backgroundColor || "#111111"}
              onChange={(e) => onPatch({ backgroundColor: e.target.value })}
              className="w-full h-8 rounded border border-slate-200 cursor-pointer p-0.5"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <input
            ref={fileRef}
            type="file"
            accept={SUPPORTED_IMAGE_ACCEPT}
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onUploadLocal(file);
              e.target.value = "";
            }}
          />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="flex-1 py-2 px-3 rounded-lg bg-[#d4af37] hover:bg-[#b89726] text-[#0a0a0c] border border-[#b89726]/40 font-bold flex items-center justify-center gap-1.5 transition text-xs whitespace-nowrap"
          >
            <ImagePlus size={13} className="shrink-0" />
            <span>Upload Local</span>
          </button>
          <button
            type="button"
            onClick={onOpenLibrary}
            className="py-2 px-3 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 font-semibold flex items-center justify-center gap-1.5 transition text-xs whitespace-nowrap"
          >
            <ImageIcon size={13} className="shrink-0" />
            <span>Library</span>
          </button>
        </div>
      </div>
    </div>
  );
}
