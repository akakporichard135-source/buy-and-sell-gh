import {
  AlertCircle,
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  ExternalLink,
  Eye,
  Film,
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
  Sparkles,
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
  applyProductToCampaign,
  createDefaultCustomHomepageSection,
  extractLegacyMediaUnit,
  inferLegacyMediaAttributesForUrl,
  reorderListById,
  reorderListByIndex,
  resolveLegacyBackgroundColor,
  summarizeLegacyHomepageChanges,
  SUPPORTED_IMAGE_ACCEPT,
  SUPPORTED_VIDEO_ACCEPT,
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
import { resolveAdminProductImage } from "../../utils/productImages";
import type {
  CustomHomepageSection,
  CustomSectionLayoutVariant,
  CustomSectionPlacement,
  HeroCampaign,
  HomepageContent,
  HomepageMediaFit,
  MediaItem,
  PromoTile,
  ServiceFlyer,
  Tone,
} from "../../cms/types";
import { isAdminHostname } from "../../config/adminHost";
import { HomepageSectionBuilder } from "../../components/admin/HomepageSectionBuilder";
import { AdminMediaLibrary } from "./AdminMediaLibrary";
import "../../styles/admin-homepage.css";

/**
 * Local-only safety lock for the unfinished modular homepage layout.
 * While `true`, modular changes can only be saved as local drafts and previewed locally;
 * only the live homepage editor can publish to production Supabase (`homepage_content`).
 */
export const MODULAR_LIVE_PUBLISH_LOCKED = true;

export const HOMEPAGE_PREVIEW_SESSION_KEY_LEGACY =
  "buyandsell_cms_homepage_preview_session_legacy_v1";
export const HOMEPAGE_PREVIEW_SESSION_KEY_MODULAR =
  "buyandsell_cms_homepage_preview_session_modular_v1";

function writePreviewSessionSnapshot(key: string, payload: HomepageContent | null) {
  if (typeof window === "undefined") return;
  try {
    if (!payload) {
      sessionStorage.removeItem(key);
    } else {
      sessionStorage.setItem(key, JSON.stringify(payload));
    }
  } catch {
    // Non-blocking in restricted storage environments
  }
}

export async function executeGuardedModularPublish({
  locked = MODULAR_LIVE_PUBLISH_LOCKED,
  publishFn,
  onBlocked,
}: {
  locked?: boolean;
  publishFn: () => Promise<void>;
  onBlocked?: (message: string) => void;
}): Promise<{ blocked: boolean; message?: string }> {
  if (locked) {
    const message =
      "Live modular publishing is currently locked (local-only mode). Use Save Draft and Preview while the modular layout is being finalized.";
    onBlocked?.(message);
    return { blocked: true, message };
  }
  await publishFn();
  return { blocked: false };
}

type ActiveHomepageTab =
  | "heroes"
  | "tiles"
  | "customSections"
  | "flyers"
  | "announcement";

type MediaPickerField =
  | "image"
  | "mobileImage"
  | "videoUrl"
  | "mobileVideoUrl"
  | "posterUrl"
  | "backgroundImage";

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

  // Unified Homepage Editor defaults directly to the live-publishable homepage ("legacy")
  const [editorMode] = useState<"modular" | "legacy">("legacy");

  const [content, setContentRaw] = useState<HomepageContent>(() =>
    homepageLegacyDraft || homepage
  );
  const hasLocalLegacyEditsRef = useRef(false);

  const [draftContent, setDraftContentRaw] = useState<HomepageContent>(() => {
    if (homepageDraft) return homepageDraft;
    return {
      ...homepage,
      layoutMode: "modular",
      sections:
        homepage.sections && homepage.sections.length > 0
          ? homepage.sections
          : defaultHomepageSections,
    };
  });
  const hasLocalModularEditsRef = useRef(false);

  const [activeTab, setActiveTab] = useState<ActiveHomepageTab>("heroes");
  const [saving, setSaving] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  const [savingLegacyDraft, setSavingLegacyDraft] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [saveError, setSaveError] = useState("");
  const [publishConfirmOpen, setPublishConfirmOpen] = useState(false);

  // Drag-and-drop state for campaign reordering and complete campaign swaps
  const [dragHeroId, setDragHeroId] = useState<string | null>(null);
  const [dragTileId, setDragTileId] = useState<string | null>(null);
  const [dragSectionId, setDragSectionId] = useState<string | null>(null);
  const [dragFlyerId, setDragFlyerId] = useState<string | null>(null);
  const [dragMediaSlot, setDragMediaSlot] = useState<LegacyMediaSlotRef | null>(null);

  useEffect(() => {
    if (hasLocalLegacyEditsRef.current) return;
    if (homepageLegacyDraft) {
      setContentRaw(homepageLegacyDraft);
      writePreviewSessionSnapshot(HOMEPAGE_PREVIEW_SESSION_KEY_LEGACY, homepageLegacyDraft);
    } else if (homepage) {
      setContentRaw(homepage);
    }
  }, [homepage, homepageLegacyDraft]);

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

  const [mediaPickerTarget, setMediaPickerTarget] = useState<{
    section: "hero" | "tile" | "customSection" | "flyer";
    index: number;
    field: MediaPickerField;
  } | null>(null);

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

  const activeCatalogProducts = useMemo(
    () => products.filter((p) => !p.archived),
    [products]
  );

  const swapTargets = useMemo(() => {
    const targets: Array<{ key: string; ref: LegacyMediaSlotRef; label: string }> = [];
    (content.heroes || []).forEach((h, i) => {
      targets.push({
        key: `hero:${i}`,
        ref: { kind: "hero", index: i },
        label: `Hero ${i + 1}: ${h.title || h.deviceName || "Untitled Hero"}`,
      });
    });
    (content.tiles || []).forEach((t, i) => {
      targets.push({
        key: `tile:${i}`,
        ref: { kind: "tile", index: i },
        label: `Tile ${i + 1}: ${t.title || t.deviceName || "Untitled Tile"}`,
      });
    });
    (content.customSections || []).forEach((cs, i) => {
      targets.push({
        key: `customSection:${i}`,
        ref: { kind: "customSection", index: i },
        label: `Section ${i + 1}: ${cs.title || cs.internalName || "Untitled Section"}`,
      });
    });
    return targets;
  }, [content.heroes, content.tiles, content.customSections]);

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
      setSuccessMessage("Local modular draft saved. Live website was not modified.");
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Failed to save local homepage draft.");
    } finally {
      setSavingDraft(false);
    }
  };

  const handleDiscardModularDraft = async () => {
    setSaveError("");
    setSaveSuccess(false);
    try {
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
      setSuccessMessage("Local modular draft discarded.");
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Failed to discard local draft.");
    }
  };

  const handlePublishModular = async () => {
    await executeGuardedModularPublish({
      locked: MODULAR_LIVE_PUBLISH_LOCKED,
      onBlocked: (msg) => {
        setSaveError(msg);
      },
      publishFn: async () => {
        setSaving(true);
        setSaveError("");
        setSaveSuccess(false);
        try {
          const published = await updateHomepage({
            ...draftContent,
            layoutMode: "modular",
          });
          hasLocalModularEditsRef.current = false;
          setDraftContentRaw(published);
          writePreviewSessionSnapshot(HOMEPAGE_PREVIEW_SESSION_KEY_MODULAR, null);
          setSuccessMessage("Modular homepage published to live website!");
          setSaveSuccess(true);
          setTimeout(() => setSaveSuccess(false), 4500);
        } catch (err) {
          setSaveError(
            err instanceof Error
              ? err.message
              : "Failed to publish modular homepage. Your local draft was preserved."
          );
        } finally {
          setSaving(false);
        }
      },
    });
  };

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
        "Homepage draft saved persistently. Refresh or preview on Desktop/Tablet/Mobile without changing the live website."
      );
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4500);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Failed to save homepage draft.");
    } finally {
      setSavingLegacyDraft(false);
    }
  };

  const handleDiscardLegacyDraft = async () => {
    setSaveError("");
    setSaveSuccess(false);
    try {
      await discardHomepageLegacyDraftConfig();
      hasLocalLegacyEditsRef.current = false;
      writePreviewSessionSnapshot(HOMEPAGE_PREVIEW_SESSION_KEY_LEGACY, null);
      setContentRaw(homepage);
      setSuccessMessage("Saved draft discarded. Editor restored to current live homepage.");
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3500);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Failed to discard homepage draft.");
    }
  };

  const handleConfirmPublishLegacy = async () => {
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
        "Homepage published live and verified! All staged images and videos were uploaded to permanent Supabase Storage."
      );
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 5500);
    } catch (err) {
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
    target: {
      kind: "hero" | "tile" | "customSection" | "flyer";
      index: number;
      field: MediaPickerField;
    },
    file: File
  ) => {
    setSaveError("");
    const isVideoField = target.field === "videoUrl" || target.field === "mobileVideoUrl";
    try {
      await validateLocalMediaFile(file, isVideoField ? "video" : "image");
      const staged = await saveLocalStagedMedia(file);
      const inferred =
        target.field === "image" ? inferLegacyMediaAttributesForUrl(file.name, content) : null;

      if (target.kind === "hero") {
        const heroes = [...content.heroes];
        heroes[target.index] = {
          ...heroes[target.index],
          ...(inferred || {}),
          ...(isVideoField ? { mediaMode: "video" as const } : {}),
          [target.field]: staged.uri,
        };
        setContent({ ...content, heroes });
      } else if (target.kind === "tile") {
        const tiles = [...content.tiles];
        tiles[target.index] = {
          ...tiles[target.index],
          ...(inferred || {}),
          ...(isVideoField ? { mediaMode: "video" as const } : {}),
          [target.field]: staged.uri,
        };
        setContent({ ...content, tiles });
      } else if (target.kind === "customSection") {
        const customSections = [...(content.customSections || [])];
        customSections[target.index] = {
          ...customSections[target.index],
          ...(inferred || {}),
          ...(isVideoField ? { mediaMode: "video" as const } : {}),
          [target.field]: staged.uri,
        };
        setContent({ ...content, customSections });
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
          : `Failed to stage local ${isVideoField ? "video" : "image"}. Verify file type and size.`
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
    } else if (section === "customSection") {
      const customSections = [...(content.customSections || [])];
      customSections[index] = {
        ...customSections[index],
        ...(inferred || {}),
        [field]: item.url,
      };
      setContent({ ...content, customSections });
    } else if (section === "flyer") {
      const flyers = [...content.serviceFlyers];
      flyers[index] = { ...flyers[index], image: item.url };
      setContent({ ...content, serviceFlyers: flyers });
    }

    setMediaPickerTarget(null);
  };

  const handleAddNewCustomSection = () => {
    const existing = content.customSections || [];
    const nextSection = createDefaultCustomHomepageSection(existing.length + 1);
    setContent({
      ...content,
      customSections: [...existing, nextSection],
    });
    setActiveTab("customSections");
  };

  const openFullWebsitePreview = () => {
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

  const customSectionsList = content.customSections || [];

  return (
    <div className="space-y-6">
      {/* 1. Clean Standard Admin Header Card */}
      <div className="admin-header-card">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-[#d4af37]">
              Storefront CMS
            </span>
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-slate-300" />
            <span className="text-xs font-semibold text-slate-500">Live Homepage Layout</span>
            {hasSavedLegacyDraft && (
              <span
                data-testid="legacy-draft-active-badge"
                className="admin-badge admin-badge-gold"
              >
                Saved Draft Active (Not Published)
              </span>
            )}
            {isLegacyDirty && (
              <span className="admin-badge admin-badge-amber">Unsaved Changes</span>
            )}
            {legacyPendingUploadsCount > 0 && (
              <span className="admin-badge admin-badge-slate">
                {legacyPendingUploadsCount} Local Media Staged
              </span>
            )}
          </div>
          <h2>Homepage Content &amp; Campaign Editor</h2>
          <p>
            Manage hero campaigns, promotional tiles, custom homepage sections, device assignments,
            images, videos, and announcement banners for buyandsellgh.com.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            data-testid="add-new-homepage-section-btn"
            onClick={handleAddNewCustomSection}
            className="admin-btn admin-btn-secondary"
          >
            <Plus size={15} />
            <span>Add New Section</span>
          </button>

          <button
            type="button"
            data-testid="legacy-save-draft-btn"
            disabled={savingLegacyDraft || saving}
            onClick={handleSaveLegacyDraft}
            className="admin-btn admin-btn-secondary"
          >
            <Save size={15} />
            <span>{savingLegacyDraft ? "Saving Draft..." : "Save Draft"}</span>
          </button>

          {hasSavedLegacyDraft && (
            <button
              type="button"
              data-testid="legacy-discard-draft-btn"
              disabled={saving}
              onClick={handleDiscardLegacyDraft}
              className="admin-btn admin-btn-secondary"
            >
              <RotateCcw size={15} />
              <span>Discard Draft</span>
            </button>
          )}

          <button
            type="button"
            data-testid="legacy-preview-layout-btn"
            onClick={openFullWebsitePreview}
            className="admin-btn admin-btn-secondary"
          >
            <Eye size={15} />
            <span>Preview Website Layout</span>
          </button>

          <button
            type="button"
            data-testid="legacy-publish-live-btn"
            disabled={saving}
            onClick={() => setPublishConfirmOpen(true)}
            className="admin-btn admin-btn-primary"
            title="Requires AAL2 Admin MFA verification"
          >
            <Upload size={15} />
            <span>{saving ? "Publishing Live..." : "Publish Live"}</span>
          </button>
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
          {/* Standard Navigation Tabs */}
          <div className="w-full overflow-x-auto scrollbar-none pb-1">
            <div className="flex items-center gap-1.5 p-1.5 rounded-xl bg-slate-100/80 border border-slate-200 min-w-max">
              <button
                type="button"
                data-testid="tab-heroes"
                onClick={() => setActiveTab("heroes")}
                className={`shrink-0 whitespace-nowrap flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
                  activeTab === "heroes"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Layout size={15} />
                <span>Hero Carousel ({content.heroes.filter((h) => h.enabled).length} Active)</span>
              </button>

              <button
                type="button"
                data-testid="tab-tiles"
                onClick={() => setActiveTab("tiles")}
                className={`shrink-0 whitespace-nowrap flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
                  activeTab === "tiles"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Grid size={15} />
                <span>Promotional Tiles ({content.tiles.filter((t) => t.enabled).length} Active)</span>
              </button>

              <button
                type="button"
                data-testid="tab-custom-sections"
                onClick={() => setActiveTab("customSections")}
                className={`shrink-0 whitespace-nowrap flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
                  activeTab === "customSections"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Sparkles size={15} />
                <span>
                  Custom Sections ({customSectionsList.filter((s) => s.enabled).length} Active)
                </span>
              </button>

              <button
                type="button"
                data-testid="tab-flyers"
                onClick={() => setActiveTab("flyers")}
                className={`shrink-0 whitespace-nowrap flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
                  activeTab === "flyers"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Layers size={15} />
                <span>
                  Service Flyers ({content.serviceFlyers.filter((f) => f.enabled).length} Active)
                </span>
              </button>

              <button
                type="button"
                data-testid="tab-announcement"
                onClick={() => setActiveTab("announcement")}
                className={`shrink-0 whitespace-nowrap flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
                  activeTab === "announcement"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Volume2 size={15} />
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
                    Edit campaign names, select catalogue products, upload images or videos, or swap complete campaigns across positions.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const newHero: HeroCampaign = {
                      id: `hero-${Date.now()}`,
                      deviceName: "New Flagship Campaign",
                      title: "New Flagship Campaign",
                      subtitle: "Groundbreaking power and design.",
                      image: "/products/homepage/iphone-18-pro-hero-2x.webp",
                      mediaMode: "image",
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
                  className="admin-btn admin-btn-sm admin-btn-secondary"
                >
                  <Plus size={14} />
                  <span>Add Hero Slide</span>
                </button>
              </div>

              <div className="space-y-4">
                {content.heroes.map((hero, index) => (
                  <div
                    key={`${hero.id}-${index}`}
                    data-testid={`hero-campaign-card-${index}`}
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
                    className={`admin-card space-y-4 transition min-w-0 ${
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
                        <span className="w-6 h-6 rounded-full bg-[#d4af37]/15 text-[#92700c] font-bold text-xs flex items-center justify-center shrink-0">
                          {index + 1}
                        </span>
                        <div className="min-w-0">
                          <h4
                            data-testid={`hero-card-heading-${index}`}
                            className="font-bold text-slate-900 text-sm truncate"
                          >
                            {hero.title || hero.deviceName || "Untitled Slide"}
                          </h4>
                          <p className="text-xs text-slate-500 truncate">
                            {hero.deviceName && hero.deviceName !== hero.title
                              ? `${hero.deviceName} · ${hero.subtitle}`
                              : hero.subtitle}
                          </p>
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
                            setContent({
                              ...content,
                              heroes: reorderListByIndex(content.heroes, index, index - 1),
                            })
                          }
                          className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 disabled:opacity-30 transition"
                          title="Move up"
                        >
                          <ArrowUp size={14} />
                        </button>
                        <button
                          type="button"
                          disabled={index === content.heroes.length - 1}
                          onClick={() =>
                            setContent({
                              ...content,
                              heroes: reorderListByIndex(content.heroes, index, index + 1),
                            })
                          }
                          className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 disabled:opacity-30 transition"
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

                    {/* Product Selector + Device Name + Headline + Subtitle + Description */}
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 text-xs">
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">
                          Catalogue Product / Device Assignment
                        </label>
                        <select
                          data-testid={`campaign-product-select-hero-${index}`}
                          value={hero.productId || ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            const heroes = [...content.heroes];
                            if (!val) {
                              heroes[index] = { ...heroes[index], productId: undefined };
                            } else {
                              const found = activeCatalogProducts.find(
                                (p) => p.id === val || p.slug === val
                              );
                              if (found) {
                                const resolvedImg = resolveAdminProductImage(found)?.src;
                                heroes[index] = applyProductToCampaign(
                                  heroes[index],
                                  found,
                                  resolvedImg
                                );
                              }
                            }
                            setContent({ ...content, heroes });
                          }}
                          className="w-full p-2.5 rounded-lg border border-slate-200 bg-white font-semibold text-slate-800"
                        >
                          <option value="">Custom / Manual Campaign Entry</option>
                          {activeCatalogProducts.map((p) => (
                            <option key={p.id} value={p.slug}>
                              {p.name} ({p.category})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 mb-1">
                          Device / Product Name *
                        </label>
                        <input
                          type="text"
                          data-testid={`campaign-device-name-hero-${index}`}
                          value={hero.deviceName ?? hero.title}
                          onChange={(e) => {
                            const nextDeviceName = e.target.value;
                            const heroes = [...content.heroes];
                            const prevDeviceName = heroes[index].deviceName ?? heroes[index].title;
                            const shouldSyncTitle =
                              !heroes[index].title || heroes[index].title === prevDeviceName;
                            heroes[index] = {
                              ...heroes[index],
                              deviceName: nextDeviceName,
                              ...(shouldSyncTitle ? { title: nextDeviceName } : {}),
                            };
                            setContent({ ...content, heroes });
                          }}
                          className="w-full p-2.5 rounded-lg border border-slate-200 bg-white"
                          placeholder="e.g. iPhone 18 Pro Max"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 mb-1">
                          Headline Title *
                        </label>
                        <input
                          type="text"
                          data-testid={`campaign-title-hero-${index}`}
                          value={hero.title}
                          onChange={(e) => {
                            const nextTitle = e.target.value;
                            const heroes = [...content.heroes];
                            const prevTitle = heroes[index].title;
                            const shouldSyncDevice =
                              !heroes[index].deviceName || heroes[index].deviceName === prevTitle;
                            heroes[index] = {
                              ...heroes[index],
                              title: nextTitle,
                              ...(shouldSyncDevice ? { deviceName: nextTitle } : {}),
                            };
                            setContent({ ...content, heroes });
                          }}
                          className="w-full p-2.5 rounded-lg border border-slate-200 bg-white"
                          placeholder="e.g. iPhone 18 Pro Max"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 mb-1">
                          Subtitle / Tagline
                        </label>
                        <input
                          type="text"
                          data-testid={`campaign-subtitle-hero-${index}`}
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
                        <label className="block font-bold text-slate-700 mb-1">
                          Description / Supporting Copy
                        </label>
                        <input
                          type="text"
                          data-testid={`campaign-description-hero-${index}`}
                          value={hero.description || ""}
                          onChange={(e) => {
                            const heroes = [...content.heroes];
                            heroes[index] = {
                              ...heroes[index],
                              description: e.target.value || undefined,
                            };
                            setContent({ ...content, heroes });
                          }}
                          className="w-full p-2.5 rounded-lg border border-slate-200 bg-white"
                          placeholder="Optional supporting description"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 mb-1">
                          Accessibility Alt Text
                        </label>
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
                            setContent(
                              swapLegacyMediaUnits(content, { kind: "hero", index }, targetRef)
                            )
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

                      {/* Primary & Secondary CTAs */}
                      <div className="md:col-span-2 xl:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                        <div className="space-y-2 p-3 rounded-lg bg-slate-50/70 border border-slate-100 min-w-0">
                          <span className="font-bold text-slate-800 block">
                            Primary Action Button
                          </span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <input
                              type="text"
                              value={hero.primary.label}
                              onChange={(e) => {
                                const heroes = [...content.heroes];
                                heroes[index] = {
                                  ...heroes[index],
                                  primary: { ...hero.primary, label: e.target.value },
                                };
                                setContent({ ...content, heroes });
                              }}
                              placeholder="Button Label (e.g. Learn more)"
                              className="p-2 rounded border border-slate-200 bg-white"
                            />
                            <input
                              type="text"
                              value={hero.primary.to}
                              onChange={(e) => {
                                const heroes = [...content.heroes];
                                heroes[index] = {
                                  ...heroes[index],
                                  primary: { ...hero.primary, to: e.target.value },
                                };
                                setContent({ ...content, heroes });
                              }}
                              placeholder="Destination URL (e.g. /iphone/iphone-18-pro)"
                              className="p-2 rounded border border-slate-200 bg-white font-mono text-[0.7rem]"
                            />
                          </div>
                        </div>

                        <div className="space-y-2 p-3 rounded-lg bg-slate-50/70 border border-slate-100 min-w-0">
                          <span className="font-bold text-slate-800 block">
                            Secondary Action Button (Optional)
                          </span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <input
                              type="text"
                              value={hero.secondary?.label || ""}
                              onChange={(e) => {
                                const heroes = [...content.heroes];
                                const label = e.target.value;
                                heroes[index] = {
                                  ...heroes[index],
                                  secondary: label
                                    ? { label, to: hero.secondary?.to || "/store" }
                                    : undefined,
                                };
                                setContent({ ...content, heroes });
                              }}
                              placeholder="Button Label (e.g. Buy)"
                              className="p-2 rounded border border-slate-200 bg-white"
                            />
                            <input
                              type="text"
                              value={hero.secondary?.to || ""}
                              onChange={(e) => {
                                const heroes = [...content.heroes];
                                const to = e.target.value;
                                heroes[index] = {
                                  ...heroes[index],
                                  secondary: { label: hero.secondary?.label || "Buy", to },
                                };
                                setContent({ ...content, heroes });
                              }}
                              placeholder="Destination URL (e.g. /shop/buy-iphone/...)"
                              className="p-2 rounded border border-slate-200 bg-white font-mono text-[0.7rem]"
                            />
                          </div>
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
                    2-column promotional campaigns. Edit device names, assign catalogue products, upload images or videos, or swap complete campaigns across any Hero or Tile slot.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const newTile: PromoTile = {
                      id: `tile-${Date.now()}`,
                      deviceName: "Featured Product Tile",
                      title: "Featured Product Tile",
                      subtitle: "Engineered for extraordinary moments.",
                      image: "/products/homepage/macbook-air.jpg",
                      mediaMode: "image",
                      alt: "Product promo tile",
                      tone: "light",
                      backgroundColor: "#ffffff",
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
                  className="admin-btn admin-btn-sm admin-btn-secondary"
                >
                  <Plus size={14} />
                  <span>Add Promotional Tile</span>
                </button>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                {content.tiles.map((tile, index) => (
                  <div
                    key={`${tile.id}-${index}`}
                    data-testid={`tile-campaign-card-${index}`}
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
                    className={`admin-card space-y-3 transition min-w-0 ${
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
                        <span className="w-5 h-5 rounded-full bg-slate-900 text-white font-bold text-[0.65rem] flex items-center justify-center shrink-0">
                          {index + 1}
                        </span>
                        <h4
                          data-testid={`tile-card-heading-${index}`}
                          className="font-bold text-slate-900 text-xs truncate"
                        >
                          {tile.title || tile.deviceName || "Untitled Tile"}
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
                          onClick={() =>
                            setContent({
                              ...content,
                              tiles: reorderListByIndex(content.tiles, index, index - 1),
                            })
                          }
                          className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 disabled:opacity-30 transition"
                          title="Move up"
                        >
                          <ArrowUp size={12} />
                        </button>
                        <button
                          type="button"
                          disabled={index === content.tiles.length - 1}
                          onClick={() =>
                            setContent({
                              ...content,
                              tiles: reorderListByIndex(content.tiles, index, index + 1),
                            })
                          }
                          className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 disabled:opacity-30 transition"
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
                          <label className="block font-bold text-slate-700 mb-0.5">
                            Catalogue Product Assignment
                          </label>
                          <select
                            data-testid={`campaign-product-select-tile-${index}`}
                            value={tile.productId || ""}
                            onChange={(e) => {
                              const val = e.target.value;
                              const tiles = [...content.tiles];
                              if (!val) {
                                tiles[index] = { ...tiles[index], productId: undefined };
                              } else {
                                const found = activeCatalogProducts.find(
                                  (p) => p.id === val || p.slug === val
                                );
                                if (found) {
                                  const resolvedImg = resolveAdminProductImage(found)?.src;
                                  tiles[index] = applyProductToCampaign(
                                    tiles[index],
                                    found,
                                    resolvedImg
                                  );
                                }
                              }
                              setContent({ ...content, tiles });
                            }}
                            className="w-full p-2 rounded-lg border border-slate-200 bg-white font-semibold text-slate-800"
                          >
                            <option value="">Custom / Manual Entry</option>
                            {activeCatalogProducts.map((p) => (
                              <option key={p.id} value={p.slug}>
                                {p.name} ({p.category})
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block font-bold text-slate-700 mb-0.5">
                            Device / Product Name *
                          </label>
                          <input
                            type="text"
                            data-testid={`campaign-device-name-tile-${index}`}
                            value={tile.deviceName ?? tile.title}
                            onChange={(e) => {
                              const nextDeviceName = e.target.value;
                              const tiles = [...content.tiles];
                              const prevDeviceName = tiles[index].deviceName ?? tiles[index].title;
                              const shouldSyncTitle =
                                !tiles[index].title || tiles[index].title === prevDeviceName;
                              tiles[index] = {
                                ...tiles[index],
                                deviceName: nextDeviceName,
                                ...(shouldSyncTitle ? { title: nextDeviceName } : {}),
                              };
                              setContent({ ...content, tiles });
                            }}
                            className="w-full p-2 rounded-lg border border-slate-200 bg-white"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <div>
                          <label className="block font-bold text-slate-700 mb-0.5">
                            Headline Title *
                          </label>
                          <input
                            type="text"
                            data-testid={`campaign-title-tile-${index}`}
                            value={tile.title}
                            onChange={(e) => {
                              const nextTitle = e.target.value;
                              const tiles = [...content.tiles];
                              const prevTitle = tiles[index].title;
                              const shouldSyncDevice =
                                !tiles[index].deviceName || tiles[index].deviceName === prevTitle;
                              tiles[index] = {
                                ...tiles[index],
                                title: nextTitle,
                                ...(shouldSyncDevice ? { deviceName: nextTitle } : {}),
                              };
                              setContent({ ...content, tiles });
                            }}
                            className="w-full p-2 rounded-lg border border-slate-200 bg-white"
                          />
                        </div>
                        <div>
                          <label className="block font-bold text-slate-700 mb-0.5">
                            Subtitle
                          </label>
                          <input
                            type="text"
                            data-testid={`campaign-subtitle-tile-${index}`}
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

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <div>
                          <label className="block font-bold text-slate-700 mb-0.5">
                            Description (Optional)
                          </label>
                          <input
                            type="text"
                            data-testid={`campaign-description-tile-${index}`}
                            value={tile.description || ""}
                            onChange={(e) => {
                              const tiles = [...content.tiles];
                              tiles[index] = {
                                ...tiles[index],
                                description: e.target.value || undefined,
                              };
                              setContent({ ...content, tiles });
                            }}
                            className="w-full p-2 rounded-lg border border-slate-200 bg-white"
                            placeholder="Optional supporting copy"
                          />
                        </div>
                        <div>
                          <label className="block font-bold text-slate-700 mb-0.5">
                            Copy Placement
                          </label>
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
                            className="w-full p-2 rounded-lg border border-slate-200 bg-white font-semibold"
                          >
                            <option value="top">Top Aligned (Default)</option>
                            <option value="bottom">Bottom Aligned</option>
                          </select>
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
                          setContent(
                            swapLegacyMediaUnits(content, { kind: "tile", index }, targetRef)
                          )
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

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                        <div>
                          <span className="font-semibold text-[0.68rem] text-slate-500 block mb-1">
                            Primary CTA
                          </span>
                          <input
                            type="text"
                            value={tile.primary.label}
                            onChange={(e) => {
                              const tiles = [...content.tiles];
                              tiles[index] = {
                                ...tiles[index],
                                primary: { ...tile.primary, label: e.target.value },
                              };
                              setContent({ ...content, tiles });
                            }}
                            placeholder="Label"
                            className="w-full p-1.5 rounded border border-slate-200 bg-white mb-1"
                          />
                          <input
                            type="text"
                            value={tile.primary.to}
                            onChange={(e) => {
                              const tiles = [...content.tiles];
                              tiles[index] = {
                                ...tiles[index],
                                primary: { ...tile.primary, to: e.target.value },
                              };
                              setContent({ ...content, tiles });
                            }}
                            placeholder="URL"
                            className="w-full p-1.5 rounded border border-slate-200 bg-white font-mono text-[0.68rem]"
                          />
                        </div>

                        <div>
                          <span className="font-semibold text-[0.68rem] text-slate-500 block mb-1">
                            Secondary CTA (Optional)
                          </span>
                          <input
                            type="text"
                            value={tile.secondary?.label || ""}
                            onChange={(e) => {
                              const tiles = [...content.tiles];
                              const label = e.target.value;
                              tiles[index] = {
                                ...tiles[index],
                                secondary: label
                                  ? { label, to: tile.secondary?.to || "/store" }
                                  : undefined,
                              };
                              setContent({ ...content, tiles });
                            }}
                            placeholder="Label (Leave blank to hide)"
                            className="w-full p-1.5 rounded border border-slate-200 bg-white mb-1"
                          />
                          <input
                            type="text"
                            value={tile.secondary?.to || ""}
                            onChange={(e) => {
                              const tiles = [...content.tiles];
                              const to = e.target.value;
                              tiles[index] = {
                                ...tiles[index],
                                secondary: { label: tile.secondary?.label || "Buy", to },
                              };
                              setContent({ ...content, tiles });
                            }}
                            placeholder="URL"
                            className="w-full p-1.5 rounded border border-slate-200 bg-white font-mono text-[0.68rem]"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 3: CUSTOM HOMEPAGE SECTIONS */}
          {activeTab === "customSections" && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Custom Homepage Sections
                  </h3>
                  <p className="text-xs text-slate-500">
                    Create complete data-driven homepage sections with product selection, copy, images, videos, backgrounds, and placement controls.
                  </p>
                </div>
                <button
                  type="button"
                  data-testid="tab-add-custom-section-btn"
                  onClick={handleAddNewCustomSection}
                  className="admin-btn admin-btn-sm admin-btn-primary"
                >
                  <Plus size={14} />
                  <span>Add New Section</span>
                </button>
              </div>

              {customSectionsList.length === 0 ? (
                <div className="admin-card text-center py-10 space-y-3">
                  <p className="text-sm font-bold text-slate-800">
                    No custom homepage sections added yet.
                  </p>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    Click <strong>Add New Section</strong> to create a custom hero, split showcase, or promotional banner section on the homepage.
                  </p>
                  <div>
                    <button
                      type="button"
                      onClick={handleAddNewCustomSection}
                      className="admin-btn admin-btn-primary admin-btn-sm"
                    >
                      <Plus size={14} />
                      <span>Add New Section</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {customSectionsList.map((section, index) => (
                    <div
                      key={`${section.id}-${index}`}
                      data-testid={`custom-section-card-${index}`}
                      draggable={dragSectionId === section.id}
                      onDragOver={(e) => {
                        if (dragSectionId && dragSectionId !== section.id) e.preventDefault();
                      }}
                      onDrop={() => {
                        if (dragSectionId && dragSectionId !== section.id) {
                          setContent({
                            ...content,
                            customSections: reorderListById(
                              customSectionsList,
                              dragSectionId,
                              section.id
                            ),
                          });
                        }
                        setDragSectionId(null);
                      }}
                      className={`admin-card space-y-4 transition min-w-0 ${
                        section.enabled
                          ? "border-slate-200"
                          : "border-slate-200/60 bg-slate-50/70 opacity-65"
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span
                            role="button"
                            tabIndex={0}
                            draggable
                            onDragStart={() => setDragSectionId(section.id)}
                            onDragEnd={() => setDragSectionId(null)}
                            className="p-1 text-slate-400 hover:text-slate-800 cursor-grab active:cursor-grabbing shrink-0"
                            title="Drag to reorder Custom Section"
                          >
                            <GripVertical size={15} />
                          </span>
                          <span className="w-6 h-6 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center shrink-0">
                            {index + 1}
                          </span>
                          <div className="min-w-0">
                            <h4
                              data-testid={`custom-section-card-heading-${index}`}
                              className="font-bold text-slate-900 text-sm truncate"
                            >
                              {section.title || section.deviceName || section.internalName}
                            </h4>
                            <p className="text-xs text-slate-500 truncate">
                              {section.internalName} · {section.layoutVariant || "full-hero"} ·{" "}
                              {section.sectionPlacement || "after-heroes"}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 shrink-0">
                          <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer mr-1">
                            <input
                              type="checkbox"
                              checked={section.enabled}
                              onChange={(e) => {
                                const next = [...customSectionsList];
                                next[index] = { ...next[index], enabled: e.target.checked };
                                setContent({ ...content, customSections: next });
                              }}
                              className="rounded border-slate-300"
                            />
                            <span>Visible on Homepage</span>
                          </label>

                          <button
                            type="button"
                            disabled={index === 0}
                            onClick={() =>
                              setContent({
                                ...content,
                                customSections: reorderListByIndex(
                                  customSectionsList,
                                  index,
                                  index - 1
                                ),
                              })
                            }
                            className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 disabled:opacity-30 transition"
                            title="Move up"
                          >
                            <ArrowUp size={14} />
                          </button>
                          <button
                            type="button"
                            disabled={index === customSectionsList.length - 1}
                            onClick={() =>
                              setContent({
                                ...content,
                                customSections: reorderListByIndex(
                                  customSectionsList,
                                  index,
                                  index + 1
                                ),
                              })
                            }
                            className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 disabled:opacity-30 transition"
                            title="Move down"
                          >
                            <ArrowDown size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const next = customSectionsList
                                .filter((_, i) => i !== index)
                                .map((s, i) => ({ ...s, order: i + 1 }));
                              setContent({ ...content, customSections: next });
                            }}
                            className="p-1.5 rounded-lg border border-rose-200 bg-white text-rose-600 hover:bg-rose-50 transition"
                            title="Delete section"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 text-xs">
                        <div>
                          <label className="block font-bold text-slate-700 mb-1">
                            Internal Section Name
                          </label>
                          <input
                            type="text"
                            data-testid={`custom-section-internal-name-${index}`}
                            value={section.internalName}
                            onChange={(e) => {
                              const next = [...customSectionsList];
                              next[index] = { ...next[index], internalName: e.target.value };
                              setContent({ ...content, customSections: next });
                            }}
                            className="w-full p-2.5 rounded-lg border border-slate-200 bg-white"
                            placeholder="e.g. Holiday Mac Launch"
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-slate-700 mb-1">
                            Catalogue Product Assignment
                          </label>
                          <select
                            data-testid={`campaign-product-select-customSection-${index}`}
                            value={section.productId || ""}
                            onChange={(e) => {
                              const val = e.target.value;
                              const next = [...customSectionsList];
                              if (!val) {
                                next[index] = { ...next[index], productId: undefined };
                              } else {
                                const found = activeCatalogProducts.find(
                                  (p) => p.id === val || p.slug === val
                                );
                                if (found) {
                                  const resolvedImg = resolveAdminProductImage(found)?.src;
                                  next[index] = applyProductToCampaign(
                                    next[index],
                                    found,
                                    resolvedImg
                                  );
                                }
                              }
                              setContent({ ...content, customSections: next });
                            }}
                            className="w-full p-2.5 rounded-lg border border-slate-200 bg-white font-semibold text-slate-800"
                          >
                            <option value="">Custom / Manual Section</option>
                            {activeCatalogProducts.map((p) => (
                              <option key={p.id} value={p.slug}>
                                {p.name} ({p.category})
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block font-bold text-slate-700 mb-1">
                            Layout Style
                          </label>
                          <select
                            data-testid={`custom-section-layout-${index}`}
                            value={section.layoutVariant || "full-hero"}
                            onChange={(e) => {
                              const next = [...customSectionsList];
                              next[index] = {
                                ...next[index],
                                layoutVariant: e.target.value as CustomSectionLayoutVariant,
                              };
                              setContent({ ...content, customSections: next });
                            }}
                            className="w-full p-2.5 rounded-lg border border-slate-200 bg-white font-semibold"
                          >
                            <option value="full-hero">Full-Width Hero Section</option>
                            <option value="split-left">Split Left (Media Left, Copy Right)</option>
                            <option value="split-right">Split Right (Copy Left, Media Right)</option>
                            <option value="compact-banner">Compact Promotional Banner</option>
                          </select>
                        </div>

                        <div>
                          <label className="block font-bold text-slate-700 mb-1">
                            Section Placement on Homepage
                          </label>
                          <select
                            data-testid={`custom-section-placement-${index}`}
                            value={section.sectionPlacement || "after-heroes"}
                            onChange={(e) => {
                              const next = [...customSectionsList];
                              next[index] = {
                                ...next[index],
                                sectionPlacement: e.target.value as CustomSectionPlacement,
                              };
                              setContent({ ...content, customSections: next });
                            }}
                            className="w-full p-2.5 rounded-lg border border-slate-200 bg-white font-semibold"
                          >
                            <option value="after-heroes">After Hero Slides</option>
                            <option value="after-tiles">After Promotional Tiles</option>
                            <option value="before-services">Before Services Showcase</option>
                            <option value="after-services">After Services Showcase</option>
                          </select>
                        </div>

                        <div>
                          <label className="block font-bold text-slate-700 mb-1">
                            Device / Product Name
                          </label>
                          <input
                            type="text"
                            data-testid={`campaign-device-name-customSection-${index}`}
                            value={section.deviceName ?? section.title}
                            onChange={(e) => {
                              const nextDeviceName = e.target.value;
                              const next = [...customSectionsList];
                              const prevDeviceName =
                                next[index].deviceName ?? next[index].title;
                              const shouldSyncTitle =
                                !next[index].title || next[index].title === prevDeviceName;
                              next[index] = {
                                ...next[index],
                                deviceName: nextDeviceName,
                                ...(shouldSyncTitle ? { title: nextDeviceName } : {}),
                              };
                              setContent({ ...content, customSections: next });
                            }}
                            className="w-full p-2.5 rounded-lg border border-slate-200 bg-white"
                            placeholder="e.g. Mac Studio M5"
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-slate-700 mb-1">
                            Public Section Heading *
                          </label>
                          <input
                            type="text"
                            data-testid={`campaign-title-customSection-${index}`}
                            value={section.title}
                            onChange={(e) => {
                              const nextTitle = e.target.value;
                              const next = [...customSectionsList];
                              const prevTitle = next[index].title;
                              const shouldSyncDevice =
                                !next[index].deviceName ||
                                next[index].deviceName === prevTitle;
                              next[index] = {
                                ...next[index],
                                title: nextTitle,
                                ...(shouldSyncDevice ? { deviceName: nextTitle } : {}),
                              };
                              setContent({ ...content, customSections: next });
                            }}
                            className="w-full p-2.5 rounded-lg border border-slate-200 bg-white"
                            placeholder="e.g. Mac Studio"
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-slate-700 mb-1">
                            Eyebrow / Tag
                          </label>
                          <input
                            type="text"
                            data-testid={`campaign-eyebrow-customSection-${index}`}
                            value={section.eyebrow || ""}
                            onChange={(e) => {
                              const next = [...customSectionsList];
                              next[index] = { ...next[index], eyebrow: e.target.value };
                              setContent({ ...content, customSections: next });
                            }}
                            className="w-full p-2.5 rounded-lg border border-slate-200 bg-white"
                            placeholder="e.g. NEW ARRIVAL"
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-slate-700 mb-1">
                            Subtitle
                          </label>
                          <input
                            type="text"
                            data-testid={`campaign-subtitle-customSection-${index}`}
                            value={section.subtitle}
                            onChange={(e) => {
                              const next = [...customSectionsList];
                              next[index] = { ...next[index], subtitle: e.target.value };
                              setContent({ ...content, customSections: next });
                            }}
                            className="w-full p-2.5 rounded-lg border border-slate-200 bg-white"
                            placeholder="e.g. Supercharged for pros."
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className="block font-bold text-slate-700 mb-1">
                            Description
                          </label>
                          <input
                            type="text"
                            data-testid={`campaign-description-customSection-${index}`}
                            value={section.description || ""}
                            onChange={(e) => {
                              const next = [...customSectionsList];
                              next[index] = { ...next[index], description: e.target.value };
                              setContent({ ...content, customSections: next });
                            }}
                            className="w-full p-2.5 rounded-lg border border-slate-200 bg-white"
                            placeholder="Detailed section description"
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-slate-700 mb-1">
                            Additional Promotional Copy
                          </label>
                          <input
                            type="text"
                            data-testid={`custom-section-promo-text-${index}`}
                            value={section.promoText || ""}
                            onChange={(e) => {
                              const next = [...customSectionsList];
                              next[index] = { ...next[index], promoText: e.target.value };
                              setContent({ ...content, customSections: next });
                            }}
                            className="w-full p-2.5 rounded-lg border border-slate-200 bg-white"
                            placeholder="e.g. Flexible Pay Small-Small available"
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-slate-700 mb-1">
                            Accessibility Alt Text
                          </label>
                          <input
                            type="text"
                            value={section.alt}
                            onChange={(e) => {
                              const next = [...customSectionsList];
                              next[index] = { ...next[index], alt: e.target.value };
                              setContent({ ...content, customSections: next });
                            }}
                            className="w-full p-2.5 rounded-lg border border-slate-200 bg-white"
                            placeholder="Descriptive image summary"
                          />
                        </div>

                        <div className="md:col-span-2 xl:col-span-4">
                          <LegacyMediaBackgroundEditor
                            slotRef={{ kind: "customSection", index }}
                            unit={extractLegacyMediaUnit(section)}
                            supportsMobileImage
                            swapTargets={swapTargets}
                            dragMediaSlot={dragMediaSlot}
                            onDragMediaStart={setDragMediaSlot}
                            onDropMediaSwap={(fromRef, toRef) => {
                              setContent(swapLegacyMediaUnits(content, fromRef, toRef));
                              setDragMediaSlot(null);
                            }}
                            onSwapWith={(targetRef) =>
                              setContent(
                                swapLegacyMediaUnits(
                                  content,
                                  { kind: "customSection", index },
                                  targetRef
                                )
                              )
                            }
                            onPatch={(patch) => {
                              const next = [...customSectionsList];
                              next[index] = { ...next[index], ...patch };
                              setContent({ ...content, customSections: next });
                            }}
                            onUploadLocal={(field, file) =>
                              handleLegacyLocalUpload(
                                { kind: "customSection", index, field },
                                file
                              )
                            }
                            onOpenLibrary={(field) =>
                              setMediaPickerTarget({
                                section: "customSection",
                                index,
                                field,
                              })
                            }
                          />
                        </div>

                        <div className="md:col-span-2 xl:col-span-4 grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                          <div className="space-y-2 p-3 rounded-lg bg-slate-50/70 border border-slate-100">
                            <span className="font-bold text-slate-800 block">
                              Primary Action Button
                            </span>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              <input
                                type="text"
                                data-testid={`custom-section-primary-label-${index}`}
                                value={section.primary.label}
                                onChange={(e) => {
                                  const next = [...customSectionsList];
                                  next[index] = {
                                    ...next[index],
                                    primary: { ...section.primary, label: e.target.value },
                                  };
                                  setContent({ ...content, customSections: next });
                                }}
                                placeholder="Button Label (e.g. Learn more)"
                                className="p-2 rounded border border-slate-200 bg-white"
                              />
                              <input
                                type="text"
                                data-testid={`custom-section-primary-to-${index}`}
                                value={section.primary.to}
                                onChange={(e) => {
                                  const next = [...customSectionsList];
                                  next[index] = {
                                    ...next[index],
                                    primary: { ...section.primary, to: e.target.value },
                                  };
                                  setContent({ ...content, customSections: next });
                                }}
                                placeholder="Destination URL"
                                className="p-2 rounded border border-slate-200 bg-white font-mono text-[0.7rem]"
                              />
                            </div>
                          </div>

                          <div className="space-y-2 p-3 rounded-lg bg-slate-50/70 border border-slate-100">
                            <span className="font-bold text-slate-800 block">
                              Secondary Action Button (Optional)
                            </span>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              <input
                                type="text"
                                value={section.secondary?.label || ""}
                                onChange={(e) => {
                                  const next = [...customSectionsList];
                                  const label = e.target.value;
                                  next[index] = {
                                    ...next[index],
                                    secondary: label
                                      ? { label, to: section.secondary?.to || "/store" }
                                      : undefined,
                                  };
                                  setContent({ ...content, customSections: next });
                                }}
                                placeholder="Button Label (e.g. Buy)"
                                className="p-2 rounded border border-slate-200 bg-white"
                              />
                              <input
                                type="text"
                                value={section.secondary?.to || ""}
                                onChange={(e) => {
                                  const next = [...customSectionsList];
                                  const to = e.target.value;
                                  next[index] = {
                                    ...next[index],
                                    secondary: {
                                      label: section.secondary?.label || "Buy",
                                      to,
                                    },
                                  };
                                  setContent({ ...content, customSections: next });
                                }}
                                placeholder="Destination URL"
                                className="p-2 rounded border border-slate-200 bg-white font-mono text-[0.7rem]"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* SECTION 4: SERVICE FLYERS */}
          {activeTab === "flyers" && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Service Showcase Flyers</h3>
                  <p className="text-xs text-slate-500">
                    Reorder or update the vertical service flyers at the bottom of the homepage.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const newFlyer: ServiceFlyer = {
                      id: `flyer-${Date.now()}`,
                      title: "New Service Offering",
                      image: "/flyers/service-repairs.png",
                      alt: "Service promotional flyer",
                      to: "/services",
                      enabled: true,
                      order: content.serviceFlyers.length + 1,
                    };
                    setContent({
                      ...content,
                      serviceFlyers: [...content.serviceFlyers, newFlyer],
                    });
                  }}
                  className="admin-btn admin-btn-sm admin-btn-secondary"
                >
                  <Plus size={14} />
                  <span>Add Service Flyer</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {content.serviceFlyers.map((flyer, index) => (
                  <FlyerEditorCard
                    key={`${flyer.id}-${index}`}
                    flyer={flyer}
                    index={index}
                    total={content.serviceFlyers.length}
                    isDragging={dragFlyerId === flyer.id}
                    onDragStart={() => setDragFlyerId(flyer.id)}
                    onDragEnd={() => setDragFlyerId(null)}
                    onDropOn={() => {
                      if (dragFlyerId && dragFlyerId !== flyer.id) {
                        setContent({
                          ...content,
                          serviceFlyers: reorderListById(
                            content.serviceFlyers,
                            dragFlyerId,
                            flyer.id
                          ),
                        });
                      }
                      setDragFlyerId(null);
                    }}
                    onMoveUp={() =>
                      setContent({
                        ...content,
                        serviceFlyers: reorderListByIndex(
                          content.serviceFlyers,
                          index,
                          index - 1
                        ),
                      })
                    }
                    onMoveDown={() =>
                      setContent({
                        ...content,
                        serviceFlyers: reorderListByIndex(
                          content.serviceFlyers,
                          index,
                          index + 1
                        ),
                      })
                    }
                    onDelete={() => {
                      const flyers = content.serviceFlyers
                        .filter((_, i) => i !== index)
                        .map((f, i) => ({ ...f, order: i + 1 }));
                      setContent({ ...content, serviceFlyers: flyers });
                    }}
                    onChange={(nextFlyer) => {
                      const flyers = [...content.serviceFlyers];
                      flyers[index] = nextFlyer;
                      setContent({ ...content, serviceFlyers: flyers });
                    }}
                    onUploadLocal={(file) =>
                      handleLegacyLocalUpload(
                        { kind: "flyer", index, field: "image" },
                        file
                      )
                    }
                    onOpenLibrary={() =>
                      setMediaPickerTarget({ section: "flyer", index, field: "image" })
                    }
                  />
                ))}
              </div>
            </div>
          )}

          {/* SECTION 5: ANNOUNCEMENT BAR */}
          {activeTab === "announcement" && (
            <div className="admin-card max-w-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Top Announcement Ribbon</h3>
                  <p className="text-xs text-slate-500">
                    High-visibility message bar displayed directly below the main navigation header.
                  </p>
                </div>
                <label className="flex items-center gap-2 text-xs font-bold text-slate-800 cursor-pointer">
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
                  <span>Show Bar</span>
                </label>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Announcement Message
                  </label>
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
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Call-To-Action Link Text
                    </label>
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
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Destination Path
                    </label>
                    <input
                      type="text"
                      value={content.announcement.linkTo}
                      onChange={(e) =>
                        setContent({
                          ...content,
                          announcement: { ...content.announcement, linkTo: e.target.value },
                        })
                      }
                      className="w-full p-2.5 rounded-lg border border-slate-200 bg-white font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* PUBLISH LIVE CONFIRMATION MODAL */}
      {publishConfirmOpen && (
        <div
          className="admin-modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="legacy-publish-confirm-title"
          data-testid="legacy-publish-confirm-modal"
          onClick={() => !saving && setPublishConfirmOpen(false)}
        >
          <div className="admin-modal-box max-w-lg" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <div>
                <h3 id="legacy-publish-confirm-title" className="text-sm font-bold text-slate-900">
                  Confirm Publish Live
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Requires active AAL2 Admin MFA session. Unfinished modular layout remains protected.
                </p>
              </div>
              <button
                type="button"
                disabled={saving}
                onClick={() => setPublishConfirmOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X size={18} />
              </button>
            </div>

            <div className="admin-modal-body space-y-4 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <p className="font-bold text-slate-800 uppercase tracking-wider text-[10px]">
                  Summary of changes to publish:
                </p>
                <ul className="list-disc pl-4 space-y-1 text-slate-700 font-medium">
                  {publishChangeSummary.summaryLines.map((line, i) => (
                    <li key={i}>{line}</li>
                  ))}
                </ul>
              </div>

              <p className="text-slate-600 leading-relaxed">
                If any media upload, authentication check, or validation fails, the live website
                remains untouched and your saved draft will be preserved.
              </p>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
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
                  onClick={handleConfirmPublishLegacy}
                  className="admin-btn admin-btn-primary admin-btn-sm"
                >
                  <Upload size={14} />
                  <span>{saving ? "Publishing Live..." : "Confirm & Publish Live"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MEDIA LIBRARY PICKER MODAL */}
      {mediaPickerTarget && (
        <div
          className="admin-modal-overlay"
          onClick={() => setMediaPickerTarget(null)}
        >
          <div
            className="admin-modal-box max-w-4xl max-h-[85vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="admin-modal-header">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Select Media Asset</h3>
                <p className="text-xs text-slate-500">
                  Click any asset to assign it to your selected homepage campaign slot.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setMediaPickerTarget(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-5 overflow-y-auto flex-1">
              <AdminMediaLibrary onSelect={handleMediaSelected} isPicker />
            </div>
          </div>
        </div>
      )}

      {/* FULL WEBSITE LAYOUT PREVIEW MODAL */}
      {previewOpen && (
        <div
          className="admin-modal-overlay"
          data-testid="legacy-website-preview-modal"
          onClick={() => setPreviewOpen(false)}
        >
          <div
            className="bg-slate-900 rounded-2xl w-full max-w-7xl h-[92vh] overflow-hidden flex flex-col shadow-2xl border border-slate-700"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-4 py-3 bg-slate-800 border-b border-slate-700 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                <span className="text-xs font-bold text-white">
                  Actual Website Layout Preview (Unpublished Draft)
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                {(
                  [
                    { label: "Desktop 1440px", width: 1440, icon: Monitor },
                    { label: "Laptop 1024px", width: 1024, icon: Monitor },
                    { label: "Tablet 834px", width: 834, icon: Tablet },
                    { label: "Mobile 390px", width: 390, icon: Smartphone },
                    { label: "Mobile 375px", width: 375, icon: Smartphone },
                  ] as const
                ).map((vp) => {
                  const Icon = vp.icon;
                  return (
                    <button
                      key={vp.width}
                      type="button"
                      data-testid={`legacy-preview-vp-${vp.width}`}
                      onClick={() => setPreviewViewport(vp.width)}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${
                        previewViewport === vp.width
                          ? "bg-[#d4af37] text-[#0a0a0c]"
                          : "bg-slate-700 text-slate-200 hover:bg-slate-600"
                      }`}
                    >
                      <Icon size={12} />
                      <span>{vp.label}</span>
                    </button>
                  );
                })}

                <a
                  href={legacyPreviewHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-700 text-white hover:bg-slate-600 ml-1"
                >
                  <ExternalLink size={12} />
                  <span>Open Full Tab</span>
                </a>

                <button
                  type="button"
                  onClick={() => setPreviewOpen(false)}
                  className="px-3 py-1 rounded-lg bg-slate-700 hover:bg-slate-600 text-white text-xs font-semibold ml-1"
                >
                  Return to Editor
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-auto bg-slate-950 p-3 flex justify-center">
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
  onUploadLocal: (field: MediaPickerField, file: File) => void;
  onOpenLibrary: (field: MediaPickerField) => void;
}) {
  const desktopInputRef = useRef<HTMLInputElement>(null);
  const mobileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const mobileVideoInputRef = useRef<HTMLInputElement>(null);
  const posterInputRef = useRef<HTMLInputElement>(null);
  const bgImageInputRef = useRef<HTMLInputElement>(null);

  const { resolvedUrl: desktopResolved } = useResolvedMediaUrl(unit.image);
  const { resolvedUrl: mobileResolved } = useResolvedMediaUrl(unit.mobileImage);
  const { resolvedUrl: videoResolved } = useResolvedMediaUrl(unit.videoUrl);
  const { resolvedUrl: posterResolved } = useResolvedMediaUrl(unit.posterUrl);

  const currentKey = `${slotRef.kind}:${slotRef.index}`;
  const effectiveBg = resolveLegacyBackgroundColor(unit.tone, unit.backgroundColor);
  const effectiveBlend = unit.tone === "dark" ? "normal" : unit.mediaBlendMode || "normal";
  const mediaMode = unit.mediaMode || (unit.videoUrl ? "video" : "image");
  const desktopStatus = classifyMediaSource(
    mediaMode === "video" ? unit.videoUrl || unit.image : unit.image
  );

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
      {/* Top Row: Campaign Unit Handle + Media Mode Toggle + Complete Campaign Swap Selector */}
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
            title="Drag this Campaign onto another Hero, Tile, or Section to swap complete campaigns"
            data-legacy-media-drag={currentKey}
          >
            <GripVertical size={12} />
            <span>Complete Campaign Unit</span>
          </span>

          {/* Image vs Video Mode Switcher */}
          <div className="inline-flex items-center rounded-lg bg-white border border-slate-200 p-0.5">
            <button
              type="button"
              data-testid={`legacy-media-mode-image-${currentKey}`}
              onClick={() => onPatch({ mediaMode: "image" })}
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold transition ${
                mediaMode === "image"
                  ? "bg-slate-900 text-white"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <ImageIcon size={11} />
              <span>Image Mode</span>
            </button>
            <button
              type="button"
              data-testid={`legacy-media-mode-video-${currentKey}`}
              onClick={() => onPatch({ mediaMode: "video" })}
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold transition ${
                mediaMode === "video"
                  ? "bg-slate-900 text-white"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Film size={11} />
              <span>Video Mode</span>
            </button>
          </div>

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
            Swap Campaign With:
          </label>
          <select
            value=""
            data-legacy-swap-select={currentKey}
            onChange={(e) => {
              const target = swapTargets.find((t) => t.key === e.target.value);
              if (target) onSwapWith(target.ref);
            }}
            className="p-1.5 rounded-lg border border-slate-300 bg-white text-[11px] font-semibold text-slate-800 max-w-[220px]"
          >
            <option value="">Choose campaign to swap...</option>
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
      {mediaMode === "video" ? (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-[11px] font-bold text-slate-800">
              Campaign Video &amp; Poster Settings
            </span>
            <span className="text-[11px] font-semibold text-slate-500">
              Supported Formats: MP4, WebM (max 200 MB)
            </span>
          </div>

          <div className="homepage-cms-media-grid">
            {/* Desktop Video Slot */}
            <div className="space-y-2 min-w-0 flex flex-col">
              <label className="block font-bold text-slate-800 text-xs">
                Desktop Campaign Video (MP4 / WebM) *
              </label>
              <div
                data-legacy-video-preview={currentKey}
                className="homepage-cms-media-preview relative overflow-hidden"
                style={{
                  background: unit.backgroundGradient || effectiveBg,
                  backgroundColor: effectiveBg,
                }}
              >
                {videoResolved ? (
                  <video
                    key={videoResolved}
                    src={videoResolved}
                    poster={posterResolved || desktopResolved || undefined}
                    className="w-full h-full"
                    style={{ objectFit: unit.mediaFit || "contain" }}
                    muted
                    autoPlay={unit.videoAutoplay !== false}
                    loop={unit.videoLoop !== false}
                    playsInline
                    controls
                  />
                ) : (
                  <span className="text-[11px] text-slate-400">
                    No video uploaded yet
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <input
                  ref={videoInputRef}
                  type="file"
                  accept={SUPPORTED_VIDEO_ACCEPT}
                  data-testid={`legacy-video-file-input-${currentKey}`}
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) onUploadLocal("videoUrl", file);
                    e.target.value = "";
                  }}
                />
                <button
                  type="button"
                  data-testid={`legacy-upload-video-btn-${currentKey}`}
                  onClick={() => videoInputRef.current?.click()}
                  className="px-3 py-1.5 rounded-lg bg-[#d4af37] hover:bg-[#b89726] text-[#0a0a0c] font-bold flex items-center gap-1.5 shrink-0 whitespace-nowrap transition text-xs"
                >
                  <Film size={13} />
                  <span>Upload Video</span>
                </button>
                <input
                  type="text"
                  data-testid={`legacy-video-url-input-${currentKey}`}
                  value={unit.videoUrl || ""}
                  onChange={(e) => onPatch({ videoUrl: e.target.value || undefined })}
                  className="flex-1 min-w-[140px] p-1.5 rounded-lg border border-slate-200 bg-white font-mono text-[0.68rem]"
                  placeholder="https://.../videos/... or local-media://..."
                />
              </div>
            </div>

            {/* Poster / Fallback Image Slot */}
            <div className="space-y-2 min-w-0 flex flex-col">
              <label className="block font-bold text-slate-800 text-xs">
                Video Poster / Fallback Image
              </label>
              <div
                className="homepage-cms-media-preview relative overflow-hidden"
                style={{
                  background: unit.backgroundGradient || effectiveBg,
                  backgroundColor: effectiveBg,
                }}
              >
                {posterResolved || desktopResolved ? (
                  <img
                    src={posterResolved || desktopResolved}
                    alt="Video poster preview"
                    className="w-full h-full"
                    style={{ objectFit: unit.mediaFit || "contain" }}
                  />
                ) : (
                  <span className="text-[11px] text-slate-400">No poster image</span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <input
                  ref={posterInputRef}
                  type="file"
                  accept={SUPPORTED_IMAGE_ACCEPT}
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) onUploadLocal("posterUrl", file);
                    e.target.value = "";
                  }}
                />
                <button
                  type="button"
                  onClick={() => posterInputRef.current?.click()}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 font-semibold flex items-center gap-1.5 shrink-0 whitespace-nowrap transition text-xs"
                >
                  <ImagePlus size={13} />
                  <span>Upload Poster</span>
                </button>
                <button
                  type="button"
                  onClick={() => onOpenLibrary("posterUrl")}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 font-semibold flex items-center gap-1.5 shrink-0 whitespace-nowrap transition text-xs"
                >
                  <ImageIcon size={13} />
                  <span>Library</span>
                </button>
                <input
                  type="text"
                  value={unit.posterUrl || ""}
                  onChange={(e) => onPatch({ posterUrl: e.target.value || undefined })}
                  className="flex-1 min-w-[120px] p-1.5 rounded-lg border border-slate-200 bg-white font-mono text-[0.68rem]"
                  placeholder="Optional poster URL (defaults to Desktop Image)"
                />
              </div>
            </div>
          </div>

          {/* Mobile Video + Playback Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="flex items-center gap-2">
              <input
                ref={mobileVideoInputRef}
                type="file"
                accept={SUPPORTED_VIDEO_ACCEPT}
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) onUploadLocal("mobileVideoUrl", file);
                  e.target.value = "";
                }}
              />
              <button
                type="button"
                onClick={() => mobileVideoInputRef.current?.click()}
                className="px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs whitespace-nowrap"
              >
                Upload Mobile Video (Optional)
              </button>
              <input
                type="text"
                value={unit.mobileVideoUrl || ""}
                onChange={(e) => onPatch({ mobileVideoUrl: e.target.value || undefined })}
                className="flex-1 p-1.5 rounded-lg border border-slate-200 bg-white font-mono text-[0.68rem]"
                placeholder="Optional mobile video URL"
              />
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <label className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={unit.videoAutoplay !== false}
                  onChange={(e) =>
                    onPatch({ videoAutoplay: e.target.checked, videoMuted: true })
                  }
                  className="rounded border-slate-300"
                />
                <span>Muted Autoplay</span>
              </label>
              <label className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={unit.videoLoop !== false}
                  onChange={(e) => onPatch({ videoLoop: e.target.checked })}
                  className="rounded border-slate-300"
                />
                <span>Loop Video</span>
              </label>
            </div>
          </div>
        </div>
      ) : (
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
                  <span className="text-[11px] text-slate-400">Uses Desktop Image</span>
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
                  <span>Upload Local</span>
                </button>
                <button
                  type="button"
                  onClick={() => onOpenLibrary("mobileImage")}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 font-semibold flex items-center gap-1.5 shrink-0 whitespace-nowrap transition text-xs"
                >
                  <ImageIcon size={13} className="shrink-0" />
                  <span>Library</span>
                </button>
                <input
                  type="text"
                  value={unit.mobileImage || ""}
                  onChange={(e) => onPatch({ mobileImage: e.target.value || undefined })}
                  className="flex-1 min-w-[120px] p-1.5 rounded-lg border border-slate-200 bg-white font-mono text-[0.68rem]"
                  placeholder="Optional portrait URL"
                />
                {unit.mobileImage && (
                  <button
                    type="button"
                    onClick={() => onPatch({ mobileImage: undefined })}
                    className="px-2 py-1.5 rounded-lg border border-rose-200 bg-white text-rose-600 hover:bg-rose-50 text-[11px] font-semibold"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Paired Background & Media Presentation Controls */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 pt-2 border-t border-slate-200/80 text-[11px]">
        <div>
          <label className="block font-bold text-slate-600 mb-1">Theme &amp; Contrast</label>
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
            className="w-full p-1.5 rounded-lg border border-slate-200 bg-white font-semibold"
          >
            <option value="dark">Dark (#000000 · Light Text)</option>
            <option value="light">Light (#ffffff · Dark Text)</option>
            <option value="mist">Mist (#e9f5fa · Dark Text)</option>
          </select>
        </div>

        <div>
          <label className="block font-bold text-slate-600 mb-1">Background Colour</label>
          <div className="flex items-center gap-1.5">
            <input
              type="color"
              value={effectiveBg.startsWith("#") ? effectiveBg.slice(0, 7) : "#000000"}
              onChange={(e) => onPatch({ backgroundColor: e.target.value })}
              className="w-7 h-7 rounded border border-slate-300 bg-white cursor-pointer shrink-0"
            />
            <input
              type="text"
              data-testid={`campaign-bg-color-${currentKey}`}
              value={unit.backgroundColor || effectiveBg}
              onChange={(e) => onPatch({ backgroundColor: e.target.value })}
              className="w-full p-1.5 rounded-lg border border-slate-200 bg-white font-mono text-[11px]"
              placeholder="#000000"
            />
          </div>
        </div>

        <div>
          <label className="block font-bold text-slate-600 mb-1">Background Gradient</label>
          <input
            type="text"
            data-testid={`campaign-bg-gradient-${currentKey}`}
            value={unit.backgroundGradient || ""}
            onChange={(e) => onPatch({ backgroundGradient: e.target.value || undefined })}
            className="w-full p-1.5 rounded-lg border border-slate-200 bg-white font-mono text-[10px]"
            placeholder="linear-gradient(...)"
          />
        </div>

        <div>
          <label className="block font-bold text-slate-600 mb-1">Image Fit</label>
          <select
            value={unit.mediaFit || "contain"}
            onChange={(e) => onPatch({ mediaFit: e.target.value as HomepageMediaFit })}
            className="w-full p-1.5 rounded-lg border border-slate-200 bg-white font-semibold"
          >
            <option value="contain">Contain (Preserve Aspect)</option>
            <option value="cover">Cover (Full Bleed)</option>
          </select>
        </div>

        <div>
          <label className="block font-bold text-slate-600 mb-1">Image Position</label>
          <select
            value={unit.mediaPosition || "bottom"}
            onChange={(e) => onPatch({ mediaPosition: e.target.value })}
            className="w-full p-1.5 rounded-lg border border-slate-200 bg-white font-semibold"
          >
            <option value="bottom">Bottom Anchored</option>
            <option value="center">Centered</option>
            <option value="top">Top Anchored</option>
            <option value="left">Left</option>
            <option value="right">Right</option>
          </select>
        </div>

        <div>
          <label className="block font-bold text-slate-600 mb-1">Blend Mode</label>
          <select
            value={effectiveBlend}
            disabled={unit.tone === "dark"}
            onChange={(e) =>
              onPatch({ mediaBlendMode: e.target.value as "normal" | "multiply" })
            }
            className="w-full p-1.5 rounded-lg border border-slate-200 bg-white font-semibold disabled:opacity-50"
          >
            <option value="normal">Normal</option>
            <option value="multiply">Multiply (White-BG Blend)</option>
          </select>
        </div>
      </div>

      {/* Optional Background Image */}
      <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px]">
        <span className="font-bold text-slate-600">Background Image (Optional):</span>
        <input
          ref={bgImageInputRef}
          type="file"
          accept={SUPPORTED_IMAGE_ACCEPT}
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onUploadLocal("backgroundImage", file);
            e.target.value = "";
          }}
        />
        <button
          type="button"
          onClick={() => bgImageInputRef.current?.click()}
          className="px-2.5 py-1 rounded-md border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold"
        >
          Upload BG Image
        </button>
        <input
          type="text"
          value={unit.backgroundImage || ""}
          onChange={(e) => onPatch({ backgroundImage: e.target.value || undefined })}
          className="flex-1 min-w-[160px] p-1 rounded-md border border-slate-200 bg-white font-mono text-[10px]"
          placeholder="Optional background image URL"
        />
      </div>
    </div>
  );
}

function FlyerEditorCard({
  flyer,
  index,
  total,
  isDragging,
  onDragStart,
  onDragEnd,
  onDropOn,
  onMoveUp,
  onMoveDown,
  onDelete,
  onChange,
  onUploadLocal,
  onOpenLibrary,
}: {
  flyer: ServiceFlyer;
  index: number;
  total: number;
  isDragging: boolean;
  onDragStart: () => void;
  onDragEnd: () => void;
  onDropOn: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDelete: () => void;
  onChange: (next: ServiceFlyer) => void;
  onUploadLocal: (file: File) => void;
  onOpenLibrary: () => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { resolvedUrl } = useResolvedMediaUrl(flyer.image);

  return (
    <div
      draggable={isDragging}
      onDragOver={(e) => e.preventDefault()}
      onDrop={onDropOn}
      className={`admin-card space-y-3 transition min-w-0 ${
        flyer.enabled
          ? "border-slate-200"
          : "border-slate-200/60 bg-slate-50/70 opacity-65"
      }`}
    >
      <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-100">
        <div className="flex items-center gap-1.5 min-w-0">
          <span
            role="button"
            tabIndex={0}
            draggable
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            className="p-1 text-slate-400 hover:text-slate-800 cursor-grab active:cursor-grabbing shrink-0"
          >
            <GripVertical size={13} />
          </span>
          <label className="flex items-center gap-1.5 text-xs font-bold text-slate-800 cursor-pointer truncate">
            <input
              type="checkbox"
              checked={flyer.enabled}
              onChange={(e) => onChange({ ...flyer, enabled: e.target.checked })}
              className="rounded border-slate-300"
            />
            <span className="truncate">{flyer.title || `Flyer #${index + 1}`}</span>
          </label>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            disabled={index === 0}
            onClick={onMoveUp}
            className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 disabled:opacity-30 transition"
          >
            <ArrowUp size={12} />
          </button>
          <button
            type="button"
            disabled={index === total - 1}
            onClick={onMoveDown}
            className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 disabled:opacity-30 transition"
          >
            <ArrowDown size={12} />
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="p-1.5 rounded-lg border border-rose-200 bg-white text-rose-600 hover:bg-rose-50 transition"
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>

      <div
        className="aspect-[2/3] max-h-56 mx-auto rounded-lg overflow-hidden bg-slate-900 border border-slate-200 flex items-center justify-center"
        style={flyer.backgroundColor ? { backgroundColor: flyer.backgroundColor } : undefined}
      >
        <img
          src={resolvedUrl || flyer.image}
          alt={flyer.alt}
          className="w-full h-full object-cover"
        />
      </div>

      <div className="space-y-2 text-xs">
        <div>
          <label className="block font-bold text-slate-700 mb-0.5">Service Title</label>
          <input
            type="text"
            value={flyer.title}
            onChange={(e) => onChange({ ...flyer, title: e.target.value })}
            className="w-full p-2 rounded border border-slate-200 bg-white"
          />
        </div>
        <div>
          <label className="block font-bold text-slate-700 mb-0.5">Flyer Artwork</label>
          <div className="flex flex-wrap items-center gap-1.5">
            <input
              ref={fileInputRef}
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
              onClick={() => fileInputRef.current?.click()}
              className="px-2.5 py-1.5 rounded bg-[#d4af37] hover:bg-[#b89726] text-[#0a0a0c] font-bold flex items-center gap-1 shrink-0 whitespace-nowrap transition text-[0.68rem]"
            >
              <ImagePlus size={12} />
              <span>Upload</span>
            </button>
            <button
              type="button"
              onClick={onOpenLibrary}
              className="px-2.5 py-1.5 rounded border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 font-semibold flex items-center gap-1 shrink-0 whitespace-nowrap transition text-[0.68rem]"
            >
              <ImageIcon size={12} />
              <span>Library</span>
            </button>
            <input
              type="text"
              value={flyer.image}
              onChange={(e) => onChange({ ...flyer, image: e.target.value })}
              className="flex-1 min-w-[110px] p-1.5 rounded border border-slate-200 bg-white font-mono text-[0.68rem]"
            />
          </div>
        </div>
        <div>
          <label className="block font-bold text-slate-700 mb-0.5">Destination Route</label>
          <input
            type="text"
            value={flyer.to}
            onChange={(e) => onChange({ ...flyer, to: e.target.value })}
            className="w-full p-2 rounded border border-slate-200 bg-white font-mono text-[0.68rem]"
          />
        </div>
      </div>
    </div>
  );
}
