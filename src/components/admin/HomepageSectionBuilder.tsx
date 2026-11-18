import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertCircle,
  ArrowDown,
  ArrowUp,
  Check,
  Copy,
  Eye,
  EyeOff,
  Film,
  GripVertical,
  Grid,
  Image as ImageIcon,
  ImagePlus,
  Layers,
  Monitor,
  Package,
  Plus,
  RotateCcw,
  Save,
  Search,
  Smartphone,
  Sparkles,
  Tablet,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import {
  defaultHomepageBentoTiles,
  defaultHomepageCarouselCards,
  defaultHomepageFootnotes,
  defaultHomepagePromoPanels,
  defaultHomepageSections,
} from "../../cms/defaultCmsData";
import {
  classifyMediaSource,
  listLocalStagedMedia,
  saveLocalStagedMedia,
  useResolvedMediaUrl,
  validateLocalMediaFile,
  type LocalStagedMediaMeta,
} from "../../cms/localMediaStore";
import {
  createEmptySectionFromPreset,
  HOMEPAGE_SECTION_PRESETS,
  reorderListById,
  reorderListByIndex,
  resolveEffectiveMediaMode,
  SUPPORTED_IMAGE_ACCEPT,
  SUPPORTED_VIDEO_ACCEPT,
  type HomepageSectionPreset,
  type MediaSlotLike,
} from "../../cms/homepageBuilderUtils";
import type {
  HomepageBentoTile,
  HomepageCarouselCard,
  HomepageContent,
  HomepageMediaFit,
  HomepageMediaFocalPoint,
  HomepageMediaMode,
  HomepagePromoPanel,
  HomepageSection,
  MediaItem,
  Tone,
} from "../../cms/types";
import { isProductImageEligible, resolveProductImage } from "../../utils/productImages";
import { isAdminHostname } from "../../config/adminHost";
import { getCardPriceDisplay } from "../../utils/productPricing";
import type { Product } from "../../types/product";
import { HomepageSectionRenderer } from "../homepage/HomepageSectionRenderer";
import "../../styles/admin-homepage.css";

interface HomepageSectionBuilderProps {
  draft: HomepageContent;
  liveLayoutMode: "legacy" | "modular";
  hasLocalDraft: boolean;
  products: Product[];
  mediaLibrary: MediaItem[];
  onChangeDraft: (next: HomepageContent) => void;
  onSaveDraft: () => Promise<void>;
  onDiscardDraft: () => Promise<void>;
  onPublishModular?: () => Promise<void>;
  modularPublishLocked?: boolean;
  savingDraft: boolean;
  publishing: boolean;
}

const BG_SWATCHES = [
  { label: "Studio Black", value: "#000000" },
  { label: "Deep Studio", value: "#0a0a0c" },
  { label: "Charcoal", value: "#111113" },
  { label: "Soft Studio Grey", value: "#f5f5f7" },
  { label: "Pure White", value: "#ffffff" },
  { label: "Ice Mist", value: "#eef5f9" },
];

type MediaFieldKey =
  | "desktopImage"
  | "mobileImage"
  | "videoUrl"
  | "mobileVideoUrl"
  | "posterUrl"
  | "mobilePosterUrl";

type MediaPickerTarget =
  | { scope: "section"; sectionId: string; field: MediaFieldKey }
  | { scope: "panel"; sectionId: string; panelId: string; field: MediaFieldKey }
  | { scope: "tile"; sectionId: string; tileId: string; field: MediaFieldKey }
  | { scope: "card"; sectionId: string; cardId: string; field: MediaFieldKey };

export function HomepageSectionBuilder({
  draft,
  liveLayoutMode,
  hasLocalDraft,
  products,
  mediaLibrary,
  onChangeDraft,
  onSaveDraft,
  onDiscardDraft,
  onPublishModular,
  modularPublishLocked = true,
  savingDraft,
  publishing,
}: HomepageSectionBuilderProps) {
  const sections = useMemo<HomepageSection[]>(() => {
    return draft.sections && draft.sections.length > 0
      ? [...draft.sections].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      : defaultHomepageSections;
  }, [draft.sections]);
  const draftRef = useRef(draft);
  draftRef.current = draft;

  const [selectedSectionId, setSelectedSectionId] = useState<string>(sections[0]?.id || "");
  const [selectedPanelId, setSelectedPanelId] = useState<string | null>(null);
  const [selectedTileId, setSelectedTileId] = useState<string | null>(null);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [mediaPickerTarget, setMediaPickerTarget] = useState<MediaPickerTarget | null>(null);
  const [stagedMedia, setStagedMedia] = useState<LocalStagedMediaMeta[]>([]);
  const [previewMode, setPreviewMode] = useState<"closed" | "desktop" | "tablet" | "mobile">("closed");
  const [pickerSearch, setPickerSearch] = useState("");
  const [productSearch, setProductSearch] = useState("");
  const [dragSectionId, setDragSectionId] = useState<string | null>(null);
  const [dragOverSectionId, setDragOverSectionId] = useState<string | null>(null);
  const [dragPanelId, setDragPanelId] = useState<string | null>(null);
  const [dragOverPanelId, setDragOverPanelId] = useState<string | null>(null);
  const [dragTileId, setDragTileId] = useState<string | null>(null);
  const [dragOverTileId, setDragOverTileId] = useState<string | null>(null);
  const [dragCardId, setDragCardId] = useState<string | null>(null);
  const [dragOverCardId, setDragOverCardId] = useState<string | null>(null);
  const [mediaUploadError, setMediaUploadError] = useState<string>("");

  useEffect(() => {
    listLocalStagedMedia().then(setStagedMedia);
  }, []);

  const selectedSection = sections.find((s) => s.id === selectedSectionId) || sections[0];

  useEffect(() => {
    if (selectedSection?.type === "multi-promo-strip") {
      const panels = selectedSection.promoPanels || defaultHomepagePromoPanels;
      if (!selectedPanelId || !panels.some((p) => p.id === selectedPanelId)) {
        setSelectedPanelId(panels[0]?.id || null);
      }
    } else {
      setSelectedPanelId(null);
    }

    if (selectedSection?.type === "apple-bento-grid") {
      const tiles = selectedSection.tiles || defaultHomepageBentoTiles;
      if (!selectedTileId || !tiles.some((t) => t.id === selectedTileId)) {
        setSelectedTileId(tiles[0]?.id || null);
      }
    } else {
      setSelectedTileId(null);
    }

    if (selectedSection?.type === "story-carousel") {
      const cards = selectedSection.carouselCards || defaultHomepageCarouselCards;
      if (!selectedCardId || !cards.some((c) => c.id === selectedCardId)) {
        setSelectedCardId(cards[0]?.id || null);
      }
    } else {
      setSelectedCardId(null);
    }
  }, [selectedSection, selectedPanelId, selectedTileId, selectedCardId]);

  const updateSections = (nextSections: HomepageSection[], baseDraft: HomepageContent = draftRef.current) => {
    const reindexed = nextSections.map((s, idx) => ({ ...s, order: idx + 1 }));
    const nextDraft: HomepageContent = {
      ...baseDraft,
      layoutMode: baseDraft.layoutMode || "modular",
      sections: reindexed,
    };
    draftRef.current = nextDraft;
    onChangeDraft(nextDraft);
  };

  const updateSection = (sectionId: string, patch: Partial<HomepageSection>) => {
    const currentDraft = draftRef.current;
    const currentSections =
      currentDraft.sections && currentDraft.sections.length > 0
        ? currentDraft.sections
        : defaultHomepageSections;
    updateSections(
      currentSections.map((s) => (s.id === sectionId ? { ...s, ...patch } : s)),
      currentDraft
    );
  };

  const moveSection = (index: number, dir: -1 | 1) => {
    updateSections(reorderListByIndex(sections, index, index + dir));
  };

  const dropSectionOnTarget = (targetId: string) => {
    if (!dragSectionId || dragSectionId === targetId) return;
    updateSections(reorderListById(sections, dragSectionId, targetId));
    setDragSectionId(null);
    setDragOverSectionId(null);
  };

  const duplicateSection = (section: HomepageSection) => {
    const clone: HomepageSection = {
      ...JSON.parse(JSON.stringify(section)),
      id: `${section.type}-${Date.now()}`,
      builtInKey: undefined,
      heading: `${section.heading} (Copy)`,
    };
    const idx = sections.findIndex((s) => s.id === section.id);
    const next = [...sections];
    next.splice(idx + 1, 0, clone);
    updateSections(next);
    setSelectedSectionId(clone.id);
  };

  const deleteSection = (sectionId: string) => {
    if (sections.length <= 1) return;
    const next = sections.filter((s) => s.id !== sectionId);
    updateSections(next);
    if (selectedSectionId === sectionId) {
      setSelectedSectionId(next[0]?.id || "");
    }
  };

  const addSectionFromPreset = (preset: HomepageSectionPreset) => {
    const newSec = createEmptySectionFromPreset(preset, sections.length + 1);
    updateSections([...sections, newSec]);
    setSelectedSectionId(newSec.id);
    setShowAddMenu(false);
  };

  const resetToAppleDefaults = () => {
    updateSections(JSON.parse(JSON.stringify(defaultHomepageSections)));
    setSelectedSectionId(defaultHomepageSections[0].id);
  };

  const handleAssignMediaUrl = (target: MediaPickerTarget, url: string) => {
    const currentSections =
      draftRef.current.sections && draftRef.current.sections.length > 0
        ? draftRef.current.sections
        : defaultHomepageSections;
    const sec = currentSections.find((s) => s.id === target.sectionId);
    if (!sec) return;

    if (target.scope === "section") {
      updateSection(sec.id, { [target.field]: url });
    } else if (target.scope === "panel") {
      const currentPanels =
        sec.promoPanels && sec.promoPanels.length > 0
          ? sec.promoPanels
          : defaultHomepagePromoPanels;
      const nextPanels = currentPanels.map((p) =>
        p.id === target.panelId ? { ...p, [target.field]: url } : p
      );
      updateSection(sec.id, { promoPanels: nextPanels });
    } else if (target.scope === "tile") {
      const currentTiles = sec.tiles && sec.tiles.length > 0 ? sec.tiles : defaultHomepageBentoTiles;
      const nextTiles = currentTiles.map((t) =>
        t.id === target.tileId ? { ...t, [target.field]: url } : t
      );
      updateSection(sec.id, { tiles: nextTiles });
    } else if (target.scope === "card") {
      const currentCards =
        sec.carouselCards && sec.carouselCards.length > 0
          ? sec.carouselCards
          : defaultHomepageCarouselCards;
      const nextCards = currentCards.map((c) =>
        c.id === target.cardId ? { ...c, [target.field]: url } : c
      );
      updateSection(sec.id, { carouselCards: nextCards });
    }
  };

  const handleLocalUpload = async (target: MediaPickerTarget, file: File) => {
    const expectedKind =
      target.field === "videoUrl" || target.field === "mobileVideoUrl" ? "video" : "image";
    setMediaUploadError("");
    try {
      await validateLocalMediaFile(file, expectedKind);
      const saved = await saveLocalStagedMedia(file);
      handleAssignMediaUrl(target, saved.uri);
      void listLocalStagedMedia().then(setStagedMedia);
    } catch (err) {
      setMediaUploadError(
        err instanceof Error
          ? err.message
          : `Failed to stage "${file.name}" for this ${expectedKind} slot.`
      );
    }
  };

  const currentPromoPanels = useMemo(() => {
    if (!selectedSection || selectedSection.type !== "multi-promo-strip") return [];
    const raw =
      selectedSection.promoPanels && selectedSection.promoPanels.length > 0
        ? selectedSection.promoPanels
        : defaultHomepagePromoPanels;
    return [...raw].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }, [selectedSection]);

  const currentTiles = useMemo(() => {
    if (!selectedSection || selectedSection.type !== "apple-bento-grid") return [];
    const raw =
      selectedSection.tiles && selectedSection.tiles.length > 0
        ? selectedSection.tiles
        : defaultHomepageBentoTiles;
    return [...raw].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }, [selectedSection]);

  const currentCards = useMemo(() => {
    if (!selectedSection || selectedSection.type !== "story-carousel") return [];
    const raw =
      selectedSection.carouselCards && selectedSection.carouselCards.length > 0
        ? selectedSection.carouselCards
        : defaultHomepageCarouselCards;
    return [...raw].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }, [selectedSection]);

  const activePromoPanel =
    currentPromoPanels.find((p) => p.id === selectedPanelId) || currentPromoPanels[0];
  const activeTile = currentTiles.find((t) => t.id === selectedTileId) || currentTiles[0];
  const activeCard = currentCards.find((c) => c.id === selectedCardId) || currentCards[0];

  const updateActivePromoPanel = (patch: Partial<HomepagePromoPanel>) => {
    if (!selectedSection || !activePromoPanel) return;
    const nextPanels = currentPromoPanels.map((p) =>
      p.id === activePromoPanel.id ? { ...p, ...patch } : p
    );
    updateSection(selectedSection.id, { promoPanels: nextPanels });
  };

  const movePromoPanel = (index: number, dir: -1 | 1) => {
    if (!selectedSection) return;
    updateSection(selectedSection.id, {
      promoPanels: reorderListByIndex(currentPromoPanels, index, index + dir),
    });
  };

  const dropPromoPanelOnTarget = (targetId: string) => {
    if (!selectedSection || !dragPanelId || dragPanelId === targetId) return;
    updateSection(selectedSection.id, {
      promoPanels: reorderListById(currentPromoPanels, dragPanelId, targetId),
    });
    setDragPanelId(null);
    setDragOverPanelId(null);
  };

  const updateActiveTile = (patch: Partial<HomepageBentoTile>) => {
    if (!selectedSection || !activeTile) return;
    const nextTiles = currentTiles.map((t) =>
      t.id === activeTile.id ? { ...t, ...patch } : t
    );
    updateSection(selectedSection.id, { tiles: nextTiles });
  };

  const moveTile = (index: number, dir: -1 | 1) => {
    if (!selectedSection) return;
    updateSection(selectedSection.id, {
      tiles: reorderListByIndex(currentTiles, index, index + dir),
    });
  };

  const dropTileOnTarget = (targetId: string) => {
    if (!selectedSection || !dragTileId || dragTileId === targetId) return;
    updateSection(selectedSection.id, {
      tiles: reorderListById(currentTiles, dragTileId, targetId),
    });
    setDragTileId(null);
    setDragOverTileId(null);
  };

  const updateActiveCard = (patch: Partial<HomepageCarouselCard>) => {
    if (!selectedSection || !activeCard) return;
    const nextCards = currentCards.map((c) =>
      c.id === activeCard.id ? { ...c, ...patch } : c
    );
    updateSection(selectedSection.id, { carouselCards: nextCards });
  };

  const moveCard = (index: number, dir: -1 | 1) => {
    if (!selectedSection) return;
    updateSection(selectedSection.id, {
      carouselCards: reorderListByIndex(currentCards, index, index + dir),
    });
  };

  const dropCardOnTarget = (targetId: string) => {
    if (!selectedSection || !dragCardId || dragCardId === targetId) return;
    updateSection(selectedSection.id, {
      carouselCards: reorderListById(currentCards, dragCardId, targetId),
    });
    setDragCardId(null);
    setDragOverCardId(null);
  };

  const eligibleProducts = useMemo(() => {
    const q = productSearch.trim().toLowerCase();
    return products
      .filter((p) => !p.archived && isProductImageEligible(p))
      .filter((p) =>
        !q
          ? true
          : p.name.toLowerCase().includes(q) ||
            (p.category || "").toLowerCase().includes(q) ||
            p.slug.toLowerCase().includes(q)
      );
  }, [products, productSearch]);

  return (
    <div className="space-y-6">
      {/* Status & Local Draft Action Bar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm space-y-3.5 homepage-cms-action-bar">
        {/* Row 1: Full-width Status Badges & Explanatory Info */}
        <div className="space-y-2 w-full">
          <div className="flex flex-wrap items-center justify-between gap-2.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#0a0a0c] text-white border border-[#d4af37]/30 whitespace-nowrap">
                <Sparkles size={12} className="text-[#d4af37] shrink-0" />
                <span>Buy &amp; Sell GH Homepage</span>
              </span>
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border whitespace-nowrap ${
                  liveLayoutMode === "modular"
                    ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                    : "bg-slate-100 text-slate-700 border-slate-200"
                }`}
              >
                Production Live Mode: {liveLayoutMode === "modular" ? "Modular" : "Legacy (Protected)"}
              </span>
              {hasLocalDraft && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#d4af37]/15 text-[#8f650e] border border-[#d4af37]/45 whitespace-nowrap">
                  Local Draft Active (Browser Only)
                </span>
              )}
            </div>

            {modularPublishLocked && (
              <span
                data-testid="modular-publish-locked-badge"
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-slate-200 bg-slate-100 text-slate-700 text-[11px] font-semibold whitespace-nowrap shrink-0"
                title="Website remains in local-only development until content is reviewed and deployment is approved"
              >
                Local-Only Mode (Live Publish Hidden)
              </span>
            )}
          </div>

          <p className="text-xs text-slate-600 leading-relaxed w-full">
            Edits and local IndexedDB media uploads save locally to your browser draft and preview safely at{" "}
            <a
              href={typeof window !== "undefined" && isAdminHostname() ? "/admin/homepage-preview?mode=modular" : "/?preview=modular"}
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-[#8f650e] hover:text-[#b89726] underline decoration-[#d4af37]/60 underline-offset-2 whitespace-nowrap"
            >
              {typeof window !== "undefined" && isAdminHostname() ? "/admin/homepage-preview" : "/?preview=modular"}
            </a>{" "}
            without altering the live website until explicitly published.
          </p>
        </div>

        {/* Row 2: Aligned Preview Switcher & Draft Save Controls */}
        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-slate-50 border border-slate-200">
            <button
              type="button"
              onClick={() => setPreviewMode("desktop")}
              className="admin-btn admin-btn-secondary admin-btn-sm whitespace-nowrap"
            >
              <Monitor size={14} className="shrink-0" />
              <span>Preview Desktop</span>
            </button>
            <button
              type="button"
              onClick={() => setPreviewMode("tablet")}
              className="admin-btn admin-btn-secondary admin-btn-sm whitespace-nowrap"
            >
              <Tablet size={14} className="shrink-0" />
              <span>Tablet (834px)</span>
            </button>
            <button
              type="button"
              onClick={() => setPreviewMode("mobile")}
              className="admin-btn admin-btn-secondary admin-btn-sm whitespace-nowrap"
            >
              <Smartphone size={14} className="shrink-0" />
              <span>Mobile (390px)</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              disabled={savingDraft}
              onClick={onSaveDraft}
              className="admin-btn admin-btn-gold admin-btn-sm shadow-xs whitespace-nowrap"
            >
              <Save size={14} className="shrink-0" />
              <span>{savingDraft ? "Saving Draft..." : "Save Local Draft"}</span>
            </button>

            {hasLocalDraft && (
              <button
                type="button"
                onClick={onDiscardDraft}
                className="admin-btn admin-btn-sm border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 whitespace-nowrap"
              >
                <RotateCcw size={14} className="shrink-0" />
                <span>Discard Draft</span>
              </button>
            )}

            {!modularPublishLocked && onPublishModular && (
              <button
                type="button"
                disabled={publishing}
                onClick={onPublishModular}
                className="admin-btn admin-btn-primary admin-btn-sm whitespace-nowrap"
                title="Requires Admin AAL2 MFA verification to update live Supabase homepage"
              >
                <Upload size={14} className="shrink-0" />
                <span>{publishing ? "Publishing..." : "Publish Modular Live"}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {mediaUploadError && (
        <div
          role="alert"
          data-testid="homepage-media-upload-error"
          className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-start justify-between gap-3"
        >
          <div className="flex items-start gap-2 min-w-0">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <span>{mediaUploadError}</span>
          </div>
          <button
            type="button"
            onClick={() => setMediaUploadError("")}
            className="text-rose-600 hover:text-rose-900 shrink-0"
            aria-label="Dismiss media upload error"
          >
            <X size={15} />
          </button>
        </div>
      )}

      {/* Main Split Workspace: Left Section Stack | Right Visual Inspector */}
      <div className="homepage-cms-workspace">
        {/* LEFT COLUMN: SECTION ORDER & QUICK CONTROLS */}
        <div className="homepage-cms-section-list space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 px-0.5">
            <h3 className="text-sm font-bold text-slate-900">
              Homepage Sections ({sections.length})
            </h3>
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={resetToAppleDefaults}
                className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white transition whitespace-nowrap"
                title="Reset homepage sections to Buy & Sell GH default structure"
              >
                Reset Structure
              </button>
              <button
                type="button"
                onClick={() => setShowAddMenu((prev) => !prev)}
                className="admin-btn admin-btn-sm bg-[#0f172a] text-[#f0cf78] hover:bg-slate-800 border border-[#0f172a] shrink-0 whitespace-nowrap"
              >
                <Plus size={14} />
                <span>Add Section</span>
              </button>
            </div>
          </div>

          {showAddMenu && (
            <div className="p-3.5 rounded-xl border border-[#d4af37]/45 bg-[#fbf8ef] space-y-2.5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#0f172a]">Insert New Homepage Section</span>
                <button
                  type="button"
                  onClick={() => setShowAddMenu(false)}
                  className="text-slate-400 hover:text-slate-700"
                >
                  <X size={14} />
                </button>
              </div>
              <div className="grid grid-cols-1 gap-1.5 max-h-72 overflow-y-auto pr-1 homepage-cms-scroll">
                {HOMEPAGE_SECTION_PRESETS.map((preset) => (
                  <button
                    key={preset.key}
                    type="button"
                    onClick={() => addSectionFromPreset(preset)}
                    className="text-left p-2.5 rounded-lg bg-white border border-slate-200 hover:border-[#d4af37] hover:bg-white transition flex flex-col gap-0.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-slate-900">{preset.label}</span>
                      <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                        {preset.type}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-500">{preset.description}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <p className="text-[11px] text-slate-500 flex items-center gap-1.5 px-1">
            <GripVertical size={12} className="text-slate-400 shrink-0" />
            <span>Drag sections by their handle or use Up/Down arrows to reorder freely.</span>
          </p>

          <div className="space-y-2">
            {sections.map((section, idx) => {
              const isSelected = selectedSection?.id === section.id;
              const hasTopMedia =
                section.type === "apple-hero" ||
                section.type === "promo-banner" ||
                section.type === "product-family-strip";
              const secMode = resolveEffectiveMediaMode(section);
              const activeTopUrl =
                secMode === "video"
                  ? section.videoUrl || section.mobileVideoUrl
                  : section.desktopImage || section.mobileImage;
              const slotStatus = hasTopMedia ? classifyMediaSource(activeTopUrl) : null;
              const isDragTarget = dragOverSectionId === section.id && dragSectionId !== section.id;

              return (
                <div
                  key={section.id}
                  draggable
                  onDragStart={(e) => {
                    setDragSectionId(section.id);
                    e.dataTransfer.effectAllowed = "move";
                    e.dataTransfer.setData("text/plain", section.id);
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = "move";
                    if (dragOverSectionId !== section.id) setDragOverSectionId(section.id);
                  }}
                  onDragLeave={() => {
                    if (dragOverSectionId === section.id) setDragOverSectionId(null);
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    dropSectionOnTarget(section.id);
                  }}
                  onDragEnd={() => {
                    setDragSectionId(null);
                    setDragOverSectionId(null);
                  }}
                  onClick={() => setSelectedSectionId(section.id)}
                  data-section-row-id={section.id}
                  className={`cursor-pointer rounded-xl border p-3.5 sm:p-4 transition ${
                    isDragTarget
                      ? "border-[#d4af37] ring-2 ring-[#d4af37]/40 bg-amber-50/50"
                      : isSelected
                      ? "border-[#d4af37] bg-[#d4af37]/[0.07] ring-1 ring-[#d4af37]/30 shadow-sm"
                      : "border-slate-200 bg-white hover:border-[#d4af37]/50"
                  } ${section.visible === false ? "opacity-55" : ""}`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2.5">
                    <div className="flex items-start gap-2.5 min-w-0">
                      <span
                        className="mt-1 text-slate-400 hover:text-[#8f650e] cursor-grab active:cursor-grabbing shrink-0"
                        title="Drag to reorder section"
                        aria-label={`Drag handle for ${section.heading}`}
                      >
                        <GripVertical size={15} />
                      </span>
                      <div className="min-w-0 space-y-1">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#0f172a] text-[#f0cf78] text-[10px] font-bold">
                            {idx + 1}
                          </span>
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                            {section.type}
                          </span>
                          {hasTopMedia && (
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                secMode === "video"
                                  ? "bg-[#111215] text-[#f0cf78] border-[#111215]"
                                  : "bg-slate-50 text-slate-700 border-slate-200"
                              }`}
                            >
                              {secMode === "video" ? "Video" : "Image"}
                            </span>
                          )}
                          {section.visible === false && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-600">
                              Hidden
                            </span>
                          )}
                          {slotStatus && <MediaStatusPill status={slotStatus} compact />}
                          {section.type === "multi-promo-strip" && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                              {(section.promoPanels || defaultHomepagePromoPanels).length} Panels
                            </span>
                          )}
                          {section.type === "apple-bento-grid" && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                              {(section.tiles || defaultHomepageBentoTiles).length} Tiles
                            </span>
                          )}
                          {section.type === "story-carousel" && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                              {(section.carouselCards || defaultHomepageCarouselCards).length} Cards
                            </span>
                          )}
                          {section.type === "footnotes" && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                              {(section.footnoteItems || defaultHomepageFootnotes).length} Notes
                            </span>
                          )}
                        </div>
                        <p className="text-[13px] font-bold text-slate-900 truncate leading-snug">
                          {section.heading || "Untitled Section"}
                        </p>
                        {section.subtitle ? (
                          <p className="text-[11px] text-slate-500 truncate leading-snug">{section.subtitle}</p>
                        ) : null}
                      </div>
                    </div>

                    <div
                      className="flex items-center gap-1 shrink-0"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        onClick={() => updateSection(section.id, { visible: section.visible === false })}
                        className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:border-[#d4af37]/60 hover:text-slate-900 transition"
                        title={section.visible === false ? "Show section" : "Hide section"}
                      >
                        {section.visible === false ? <EyeOff size={13} /> : <Eye size={13} />}
                      </button>
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => moveSection(idx, -1)}
                        className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:border-[#d4af37]/60 hover:text-slate-900 disabled:opacity-30 transition"
                        title="Move up"
                      >
                        <ArrowUp size={13} />
                      </button>
                      <button
                        type="button"
                        disabled={idx === sections.length - 1}
                        onClick={() => moveSection(idx, 1)}
                        className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:border-[#d4af37]/60 hover:text-slate-900 disabled:opacity-30 transition"
                        title="Move down"
                      >
                        <ArrowDown size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => duplicateSection(section)}
                        className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:border-[#d4af37]/60 hover:text-slate-900 transition"
                        title="Duplicate section"
                      >
                        <Copy size={13} />
                      </button>
                      <button
                        type="button"
                        disabled={sections.length <= 1}
                        onClick={() => deleteSection(section.id)}
                        className="p-1.5 rounded-lg border border-rose-200 bg-white text-rose-600 hover:bg-rose-50 disabled:opacity-30 transition"
                        title="Delete section"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN: SELECTED SECTION VISUAL INSPECTOR */}
        <div className="homepage-cms-inspector">
          {selectedSection ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 space-y-6 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3.5 border-b border-slate-100">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#92700c]">
                    Editing · {selectedSection.type}
                  </span>
                  <h4 className="text-base font-bold text-slate-900 mt-0.5">
                    {selectedSection.heading || "Untitled Section"}
                  </h4>
                </div>
                <label className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200">
                  <input
                    type="checkbox"
                    checked={selectedSection.visible !== false}
                    onChange={(e) =>
                      updateSection(selectedSection.id, { visible: e.target.checked })
                    }
                    className="rounded border-slate-300"
                  />
                  <span>Visible on Homepage</span>
                </label>
              </div>

              {/* Section Copy & Appearance Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Eyebrow Label</label>
                  <input
                    type="text"
                    value={selectedSection.eyebrow || ""}
                    onChange={(e) =>
                      updateSection(selectedSection.id, { eyebrow: e.target.value })
                    }
                    className="w-full p-2.5 rounded-lg border border-slate-200"
                    placeholder="e.g. NEW FLAGSHIP"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Headline *</label>
                  <input
                    type="text"
                    value={selectedSection.heading || ""}
                    onChange={(e) =>
                      updateSection(selectedSection.id, { heading: e.target.value })
                    }
                    className="w-full p-2.5 rounded-lg border border-slate-200 font-semibold"
                    placeholder="Section Headline"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">Subtitle</label>
                  <input
                    type="text"
                    value={selectedSection.subtitle || ""}
                    onChange={(e) =>
                      updateSection(selectedSection.id, { subtitle: e.target.value })
                    }
                    className="w-full p-2.5 rounded-lg border border-slate-200"
                    placeholder="Concise campaign subtitle"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">Body / Callout Description</label>
                  <textarea
                    rows={2}
                    value={selectedSection.description || ""}
                    onChange={(e) =>
                      updateSection(selectedSection.id, { description: e.target.value })
                    }
                    className="w-full p-2.5 rounded-lg border border-slate-200"
                    placeholder="Optional supporting copy"
                  />
                </div>
              </div>

              {/* Colors, Tone & CTA Row */}
              {(selectedSection.type === "apple-hero" ||
                selectedSection.type === "multi-promo-strip" ||
                selectedSection.type === "promo-banner" ||
                selectedSection.type === "product-family-strip" ||
                selectedSection.type === "product-carousel" ||
                selectedSection.type === "accessories-collection" ||
                selectedSection.type === "services-showcase" ||
                selectedSection.type === "trust-values" ||
                selectedSection.type === "footnotes") && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs pt-2 border-t border-slate-100">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Surface Theme</label>
                    <select
                      value={selectedSection.tone || "dark"}
                      onChange={(e) =>
                        updateSection(selectedSection.id, { tone: e.target.value as Tone })
                      }
                      className="w-full p-2.5 rounded-lg border border-slate-200 bg-white"
                    >
                      <option value="dark">Dark (Light Text)</option>
                      <option value="light">Light (Dark Text)</option>
                      <option value="mist">Ice Mist (Dark Text)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Background Color</label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="color"
                        value={selectedSection.backgroundColor || "#000000"}
                        onChange={(e) =>
                          updateSection(selectedSection.id, { backgroundColor: e.target.value })
                        }
                        className="w-10 h-9 rounded border border-slate-200 cursor-pointer p-0.5"
                      />
                      <select
                        value={selectedSection.backgroundColor || "#000000"}
                        onChange={(e) =>
                          updateSection(selectedSection.id, { backgroundColor: e.target.value })
                        }
                        className="flex-1 p-2.5 rounded-lg border border-slate-200 bg-white"
                      >
                        {BG_SWATCHES.map((sw) => (
                          <option key={sw.value} value={sw.value}>
                            {sw.label} ({sw.value})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Copy Alignment</label>
                    <select
                      value={selectedSection.textAlignment || "center"}
                      onChange={(e) =>
                        updateSection(selectedSection.id, {
                          textAlignment: e.target.value as "left" | "center" | "right",
                        })
                      }
                      className="w-full p-2.5 rounded-lg border border-slate-200 bg-white"
                    >
                      <option value="center">Center</option>
                      <option value="left">Left</option>
                      <option value="right">Right</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Primary & Secondary CTAs */}
              {(selectedSection.type === "apple-hero" ||
                selectedSection.type === "multi-promo-strip" ||
                selectedSection.type === "promo-banner" ||
                selectedSection.type === "product-carousel" ||
                selectedSection.type === "accessories-collection" ||
                selectedSection.type === "services-showcase") && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-2 border-t border-slate-100">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Primary CTA Label</label>
                    <input
                      type="text"
                      value={selectedSection.buttonLabel || ""}
                      onChange={(e) =>
                        updateSection(selectedSection.id, { buttonLabel: e.target.value })
                      }
                      className="w-full p-2.5 rounded-lg border border-slate-200"
                      placeholder="e.g. Learn more"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Primary CTA Destination</label>
                    <input
                      type="text"
                      value={selectedSection.buttonDestination || ""}
                      onChange={(e) =>
                        updateSection(selectedSection.id, { buttonDestination: e.target.value })
                      }
                      className="w-full p-2.5 rounded-lg border border-slate-200 font-mono text-[11px]"
                      placeholder="/iphone/iphone-18-pro"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Secondary CTA Label</label>
                    <input
                      type="text"
                      value={selectedSection.secondaryButtonLabel || ""}
                      onChange={(e) =>
                        updateSection(selectedSection.id, { secondaryButtonLabel: e.target.value })
                      }
                      className="w-full p-2.5 rounded-lg border border-slate-200"
                      placeholder="e.g. Buy"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Secondary CTA Destination</label>
                    <input
                      type="text"
                      value={selectedSection.secondaryButtonDestination || ""}
                      onChange={(e) =>
                        updateSection(selectedSection.id, {
                          secondaryButtonDestination: e.target.value,
                        })
                      }
                      className="w-full p-2.5 rounded-lg border border-slate-200 font-mono text-[11px]"
                      placeholder="/shop/buy-iphone/iphone-18-pro"
                    />
                  </div>
                </div>
              )}

              {/* HERO / PROMO BANNER / PRODUCT-FAMILY MEDIA SLOT CONTROLS */}
              {(selectedSection.type === "apple-hero" ||
                selectedSection.type === "promo-banner" ||
                selectedSection.type === "product-family-strip") && (
                <UnifiedMediaModeEditor
                  title={
                    selectedSection.type === "product-family-strip"
                      ? "Product-Family Campaign Visual (Optional Image / Video)"
                      : "Section Media Mode & Responsive Assets"
                  }
                  entity={selectedSection}
                  onUpdate={(patch) => updateSection(selectedSection.id, patch)}
                  onUploadField={(field, file) =>
                    handleLocalUpload(
                      { scope: "section", sectionId: selectedSection.id, field },
                      file
                    )
                  }
                  onOpenPickerField={(field) =>
                    setMediaPickerTarget({
                      scope: "section",
                      sectionId: selectedSection.id,
                      field,
                    })
                  }
                />
              )}

              {/* TWO-COLUMN 6-TILE PROMO GRID EDITOR */}
              {selectedSection.type === "apple-bento-grid" && (
                <div className="pt-3 border-t border-slate-100 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Grid size={15} className="text-[#d4af37]" />
                      <h5 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                        6-Tile Promotional Grid Editor
                      </h5>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const newTile: HomepageBentoTile = {
                          id: `tile-${Date.now()}`,
                          eyebrow: "NEW CAMPAIGN",
                          title: "New Promo Tile",
                          subtitle: "Short headline statement.",
                          tone: "light",
                          backgroundColor: "#f5f5f7",
                          desktopImage: "",
                          imageAlt: "New promo tile",
                          focalPoint: "bottom",
                          objectFit: "contain",
                          copyPlacement: "top",
                          primaryLabel: "Learn more",
                          primaryDestination: "/store",
                          visible: true,
                          order: currentTiles.length + 1,
                        };
                        updateSection(selectedSection.id, { tiles: [...currentTiles, newTile] });
                        setSelectedTileId(newTile.id);
                      }}
                      className="admin-btn admin-btn-sm admin-btn-secondary"
                    >
                      <Plus size={13} />
                      <span>Add Tile</span>
                    </button>
                  </div>

                  {/* Tile Selector Strip (Drag & Drop + Up/Down) */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {currentTiles.map((tile, tIdx) => {
                      const tileMode = resolveEffectiveMediaMode(tile);
                      const tileMediaUrl =
                        tileMode === "video"
                          ? tile.videoUrl || tile.mobileVideoUrl
                          : tile.desktopImage || tile.mobileImage;
                      const st = classifyMediaSource(tileMediaUrl);
                      const isSel = activeTile?.id === tile.id;
                      const isDragOver = dragOverTileId === tile.id && dragTileId !== tile.id;
                      return (
                        <div
                          key={tile.id}
                          draggable
                          onDragStart={(e) => {
                            setDragTileId(tile.id);
                            e.dataTransfer.effectAllowed = "move";
                            e.dataTransfer.setData("text/plain", tile.id);
                          }}
                          onDragOver={(e) => {
                            e.preventDefault();
                            if (dragOverTileId !== tile.id) setDragOverTileId(tile.id);
                          }}
                          onDragLeave={() => {
                            if (dragOverTileId === tile.id) setDragOverTileId(null);
                          }}
                          onDrop={(e) => {
                            e.preventDefault();
                            dropTileOnTarget(tile.id);
                          }}
                          onDragEnd={() => {
                            setDragTileId(null);
                            setDragOverTileId(null);
                          }}
                          onClick={() => setSelectedTileId(tile.id)}
                          data-tile-row-id={tile.id}
                          className={`cursor-pointer p-3 rounded-xl border text-left transition ${
                            isDragOver
                              ? "border-[#d4af37] ring-2 ring-[#d4af37]/40 bg-amber-50/50"
                              : isSel
                              ? "border-[#d4af37] bg-[#d4af37]/[0.08] ring-1 ring-[#d4af37]/25 shadow-xs"
                              : "border-slate-200 bg-white hover:border-[#d4af37]/50"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-1 mb-1">
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-500">
                              <GripVertical size={11} className="cursor-grab text-slate-400" />
                              Tile {tIdx + 1} · {tileMode === "video" ? "Video" : "Image"}
                            </span>
                            <div className="flex items-center gap-0.5" onClick={(e) => e.stopPropagation()}>
                              <button
                                type="button"
                                disabled={tIdx === 0}
                                onClick={() => moveTile(tIdx, -1)}
                                className="p-0.5 text-slate-400 hover:text-slate-700 disabled:opacity-30"
                                title="Move tile left/up"
                              >
                                <ArrowUp size={11} />
                              </button>
                              <button
                                type="button"
                                disabled={tIdx === currentTiles.length - 1}
                                onClick={() => moveTile(tIdx, 1)}
                                className="p-0.5 text-slate-400 hover:text-slate-700 disabled:opacity-30"
                                title="Move tile right/down"
                              >
                                <ArrowDown size={11} />
                              </button>
                            </div>
                          </div>
                          <p className="text-xs font-bold text-slate-900 truncate">{tile.title}</p>
                          <div className="mt-1 flex items-center gap-1">
                            <MediaStatusPill status={st} compact />
                            {tile.visible === false && (
                              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-slate-200 text-slate-600">
                                Hidden
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Selected Tile Details */}
                  {activeTile && (
                    <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 space-y-3 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">
                          Editing Tile: {activeTile.title}
                        </span>
                        <label className="inline-flex items-center gap-1.5 font-semibold text-slate-700 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={activeTile.visible !== false}
                            onChange={(e) => updateActiveTile({ visible: e.target.checked })}
                          />
                          <span>Visible</span>
                        </label>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="block font-bold text-slate-700 mb-1">Eyebrow</label>
                          <input
                            type="text"
                            value={activeTile.eyebrow || ""}
                            onChange={(e) => updateActiveTile({ eyebrow: e.target.value })}
                            className="w-full p-2 rounded-lg border border-slate-200 bg-white"
                          />
                        </div>
                        <div>
                          <label className="block font-bold text-slate-700 mb-1">Tile Headline</label>
                          <input
                            type="text"
                            value={activeTile.title}
                            onChange={(e) => updateActiveTile({ title: e.target.value })}
                            className="w-full p-2 rounded-lg border border-slate-200 bg-white font-semibold"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block font-bold text-slate-700 mb-1">Subtitle</label>
                          <input
                            type="text"
                            value={activeTile.subtitle}
                            onChange={(e) => updateActiveTile({ subtitle: e.target.value })}
                            className="w-full p-2 rounded-lg border border-slate-200 bg-white"
                          />
                        </div>
                        <div>
                          <label className="block font-bold text-slate-700 mb-1">Theme / Tone</label>
                          <select
                            value={activeTile.tone}
                            onChange={(e) =>
                              updateActiveTile({
                                tone: e.target.value as Tone,
                                backgroundColor:
                                  e.target.value === "dark"
                                    ? "#000000"
                                    : e.target.value === "mist"
                                    ? "#eef5f9"
                                    : "#f5f5f7",
                              })
                            }
                            className="w-full p-2 rounded-lg border border-slate-200 bg-white"
                          >
                            <option value="light">Light (#f5f5f7 / #ffffff)</option>
                            <option value="dark">Dark (#000000)</option>
                            <option value="mist">Ice Mist (#eef5f9)</option>
                          </select>
                        </div>
                        <div>
                          <label className="block font-bold text-slate-700 mb-1">Copy Position</label>
                          <select
                            value={activeTile.copyPlacement || "top"}
                            onChange={(e) =>
                              updateActiveTile({
                                copyPlacement: e.target.value as "top" | "bottom",
                              })
                            }
                            className="w-full p-2 rounded-lg border border-slate-200 bg-white"
                          >
                            <option value="top">Top (Standard Tile Layout)</option>
                            <option value="bottom">Bottom Overlay</option>
                          </select>
                        </div>
                        <div>
                          <label className="block font-bold text-slate-700 mb-1">Primary CTA Label</label>
                          <input
                            type="text"
                            value={activeTile.primaryLabel}
                            onChange={(e) => updateActiveTile({ primaryLabel: e.target.value })}
                            className="w-full p-2 rounded-lg border border-slate-200 bg-white"
                          />
                        </div>
                        <div>
                          <label className="block font-bold text-slate-700 mb-1">Primary CTA Route</label>
                          <input
                            type="text"
                            value={activeTile.primaryDestination}
                            onChange={(e) =>
                              updateActiveTile({ primaryDestination: e.target.value })
                            }
                            className="w-full p-2 rounded-lg border border-slate-200 bg-white font-mono text-[11px]"
                          />
                        </div>
                        <div>
                          <label className="block font-bold text-slate-700 mb-1">Secondary CTA Label</label>
                          <input
                            type="text"
                            value={activeTile.secondaryLabel || ""}
                            onChange={(e) => updateActiveTile({ secondaryLabel: e.target.value })}
                            className="w-full p-2 rounded-lg border border-slate-200 bg-white"
                          />
                        </div>
                        <div>
                          <label className="block font-bold text-slate-700 mb-1">Secondary CTA Route</label>
                          <input
                            type="text"
                            value={activeTile.secondaryDestination || ""}
                            onChange={(e) =>
                              updateActiveTile({ secondaryDestination: e.target.value })
                            }
                            className="w-full p-2 rounded-lg border border-slate-200 bg-white font-mono text-[11px]"
                          />
                        </div>
                      </div>

                      <UnifiedMediaModeEditor
                        title={`Tile Media Mode (${activeTile.title})`}
                        entity={activeTile}
                        onUpdate={(patch) => updateActiveTile(patch)}
                        onUploadField={(field, file) =>
                          handleLocalUpload(
                            {
                              scope: "tile",
                              sectionId: selectedSection.id,
                              tileId: activeTile.id,
                              field,
                            },
                            file
                          )
                        }
                        onOpenPickerField={(field) =>
                          setMediaPickerTarget({
                            scope: "tile",
                            sectionId: selectedSection.id,
                            tileId: activeTile.id,
                            field,
                          })
                        }
                      />
                    </div>
                  )}
                </div>
              )}

              {/* VISUAL STORYTELLING CAROUSEL EDITOR */}
              {selectedSection.type === "story-carousel" && (
                <div className="pt-3 border-t border-slate-100 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Layers size={15} className="text-[#d4af37]" />
                      <h5 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                        Storytelling Carousel Cards ({currentCards.length})
                      </h5>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const newCard: HomepageCarouselCard = {
                          id: `story-${Date.now()}`,
                          categoryLabel: "Feature Spotlight",
                          title: "New Visual Story Card",
                          caption: "Short editorial caption explaining the showcase.",
                          desktopImage: "",
                          imageAlt: "New story card",
                          focalPoint: "center",
                          objectFit: "cover",
                          tone: "dark",
                          backgroundColor: "#141416",
                          ctaLabel: "Explore",
                          ctaDestination: "/store",
                          visible: true,
                          order: currentCards.length + 1,
                        };
                        updateSection(selectedSection.id, {
                          carouselCards: [...currentCards, newCard],
                        });
                        setSelectedCardId(newCard.id);
                      }}
                      className="admin-btn admin-btn-sm admin-btn-secondary"
                    >
                      <Plus size={13} />
                      <span>Add Card</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {currentCards.map((card, cIdx) => {
                      const cardMode = resolveEffectiveMediaMode(card);
                      const cardMediaUrl =
                        cardMode === "video"
                          ? card.videoUrl || card.mobileVideoUrl
                          : card.desktopImage || card.mobileImage;
                      const st = classifyMediaSource(cardMediaUrl);
                      const isSel = activeCard?.id === card.id;
                      const isDragOver = dragOverCardId === card.id && dragCardId !== card.id;
                      return (
                        <div
                          key={card.id}
                          draggable
                          onDragStart={(e) => {
                            setDragCardId(card.id);
                            e.dataTransfer.effectAllowed = "move";
                            e.dataTransfer.setData("text/plain", card.id);
                          }}
                          onDragOver={(e) => {
                            e.preventDefault();
                            if (dragOverCardId !== card.id) setDragOverCardId(card.id);
                          }}
                          onDragLeave={() => {
                            if (dragOverCardId === card.id) setDragOverCardId(null);
                          }}
                          onDrop={(e) => {
                            e.preventDefault();
                            dropCardOnTarget(card.id);
                          }}
                          onDragEnd={() => {
                            setDragCardId(null);
                            setDragOverCardId(null);
                          }}
                          onClick={() => setSelectedCardId(card.id)}
                          data-card-row-id={card.id}
                          className={`cursor-pointer p-3 rounded-xl border transition ${
                            isDragOver
                              ? "border-[#d4af37] ring-2 ring-[#d4af37]/40 bg-amber-50/50"
                              : isSel
                              ? "border-[#d4af37] bg-[#d4af37]/[0.08] ring-1 ring-[#d4af37]/25 shadow-xs"
                              : "border-slate-200 bg-white hover:border-[#d4af37]/50"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-1 mb-1">
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-500">
                              <GripVertical size={11} className="cursor-grab text-slate-400" />
                              Slide {cIdx + 1} · {cardMode === "video" ? "Video" : "Image"}
                            </span>
                            <div className="flex items-center gap-0.5" onClick={(e) => e.stopPropagation()}>
                              <button
                                type="button"
                                disabled={cIdx === 0}
                                onClick={() => moveCard(cIdx, -1)}
                                className="p-0.5 text-slate-400 hover:text-slate-700 disabled:opacity-30"
                              >
                                <ArrowUp size={11} />
                              </button>
                              <button
                                type="button"
                                disabled={cIdx === currentCards.length - 1}
                                onClick={() => moveCard(cIdx, 1)}
                                className="p-0.5 text-slate-400 hover:text-slate-700 disabled:opacity-30"
                              >
                                <ArrowDown size={11} />
                              </button>
                            </div>
                          </div>
                          <p className="text-xs font-bold text-slate-900 truncate">{card.title}</p>
                          <div className="mt-1">
                            <MediaStatusPill status={st} compact />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {activeCard && (
                    <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 space-y-3 text-xs">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="block font-bold text-slate-700 mb-1">Category Tag</label>
                          <input
                            type="text"
                            value={activeCard.categoryLabel}
                            onChange={(e) => updateActiveCard({ categoryLabel: e.target.value })}
                            className="w-full p-2 rounded-lg border border-slate-200 bg-white"
                          />
                        </div>
                        <div>
                          <label className="block font-bold text-slate-700 mb-1">Card Title</label>
                          <input
                            type="text"
                            value={activeCard.title}
                            onChange={(e) => updateActiveCard({ title: e.target.value })}
                            className="w-full p-2 rounded-lg border border-slate-200 bg-white font-semibold"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block font-bold text-slate-700 mb-1">Bottom Caption</label>
                          <input
                            type="text"
                            value={activeCard.caption}
                            onChange={(e) => updateActiveCard({ caption: e.target.value })}
                            className="w-full p-2 rounded-lg border border-slate-200 bg-white"
                          />
                        </div>
                        <div>
                          <label className="block font-bold text-slate-700 mb-1">Pill CTA Label</label>
                          <input
                            type="text"
                            value={activeCard.ctaLabel}
                            onChange={(e) => updateActiveCard({ ctaLabel: e.target.value })}
                            className="w-full p-2 rounded-lg border border-slate-200 bg-white"
                          />
                        </div>
                        <div>
                          <label className="block font-bold text-slate-700 mb-1">CTA Destination</label>
                          <input
                            type="text"
                            value={activeCard.ctaDestination}
                            onChange={(e) => updateActiveCard({ ctaDestination: e.target.value })}
                            className="w-full p-2 rounded-lg border border-slate-200 bg-white font-mono text-[11px]"
                          />
                        </div>
                      </div>

                      <UnifiedMediaModeEditor
                        title={`Carousel Slide Media (${activeCard.title})`}
                        entity={activeCard}
                        defaultFocalPoint="center"
                        defaultObjectFit="cover"
                        onUpdate={(patch) => updateActiveCard(patch)}
                        onUploadField={(field, file) =>
                          handleLocalUpload(
                            {
                              scope: "card",
                              sectionId: selectedSection.id,
                              cardId: activeCard.id,
                              field,
                            },
                            file
                          )
                        }
                        onOpenPickerField={(field) =>
                          setMediaPickerTarget({
                            scope: "card",
                            sectionId: selectedSection.id,
                            cardId: activeCard.id,
                            field,
                          })
                        }
                      />
                    </div>
                  )}
                </div>
              )}

              {/* MULTI-IMAGE PROMOTIONAL STRIP PANELS EDITOR */}
              {selectedSection.type === "multi-promo-strip" && (
                <div className="pt-3 border-t border-slate-100 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Layers size={15} className="text-[#d4af37]" />
                      <h5 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                        Multi-Image Promo Strip Panels ({currentPromoPanels.length})
                      </h5>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const newPanel: HomepagePromoPanel = {
                          id: `promo-panel-${Date.now()}`,
                          label: `Campaign Panel ${currentPromoPanels.length + 1}`,
                          desktopImage: "",
                          imageAlt: "Promotional strip image panel",
                          focalPoint: "bottom",
                          objectFit: "contain",
                          destination: "/store",
                          visible: true,
                          order: currentPromoPanels.length + 1,
                        };
                        updateSection(selectedSection.id, {
                          promoPanels: [...currentPromoPanels, newPanel],
                        });
                        setSelectedPanelId(newPanel.id);
                      }}
                      className="admin-btn admin-btn-sm admin-btn-secondary"
                    >
                      <Plus size={13} />
                      <span>Add Panel</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {currentPromoPanels.map((panel, pIdx) => {
                      const panelMode = resolveEffectiveMediaMode(panel);
                      const panelMediaUrl =
                        panelMode === "video"
                          ? panel.videoUrl || panel.mobileVideoUrl
                          : panel.desktopImage || panel.mobileImage;
                      const st = classifyMediaSource(panelMediaUrl);
                      const isSel = activePromoPanel?.id === panel.id;
                      const isDragOver = dragOverPanelId === panel.id && dragPanelId !== panel.id;
                      return (
                        <div
                          key={panel.id}
                          draggable
                          onDragStart={(e) => {
                            setDragPanelId(panel.id);
                            e.dataTransfer.effectAllowed = "move";
                            e.dataTransfer.setData("text/plain", panel.id);
                          }}
                          onDragOver={(e) => {
                            e.preventDefault();
                            if (dragOverPanelId !== panel.id) setDragOverPanelId(panel.id);
                          }}
                          onDragLeave={() => {
                            if (dragOverPanelId === panel.id) setDragOverPanelId(null);
                          }}
                          onDrop={(e) => {
                            e.preventDefault();
                            dropPromoPanelOnTarget(panel.id);
                          }}
                          onDragEnd={() => {
                            setDragPanelId(null);
                            setDragOverPanelId(null);
                          }}
                          onClick={() => setSelectedPanelId(panel.id)}
                          data-panel-row-id={panel.id}
                          className={`cursor-pointer p-3 rounded-xl border text-left transition ${
                            isDragOver
                              ? "border-[#d4af37] ring-2 ring-[#d4af37]/40 bg-amber-50/50"
                              : isSel
                              ? "border-[#d4af37] bg-[#d4af37]/[0.08] ring-1 ring-[#d4af37]/25 shadow-xs"
                              : "border-slate-200 bg-white hover:border-[#d4af37]/50"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-1 mb-1">
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-500">
                              <GripVertical size={11} className="cursor-grab text-slate-400" />
                              Panel {pIdx + 1} · {panelMode === "video" ? "Video" : "Image"}
                            </span>
                            <div className="flex items-center gap-0.5" onClick={(e) => e.stopPropagation()}>
                              <button
                                type="button"
                                disabled={pIdx === 0}
                                onClick={() => movePromoPanel(pIdx, -1)}
                                className="p-0.5 text-slate-400 hover:text-slate-700 disabled:opacity-30"
                                title="Move panel left"
                              >
                                <ArrowUp size={11} />
                              </button>
                              <button
                                type="button"
                                disabled={pIdx === currentPromoPanels.length - 1}
                                onClick={() => movePromoPanel(pIdx, 1)}
                                className="p-0.5 text-slate-400 hover:text-slate-700 disabled:opacity-30"
                                title="Move panel right"
                              >
                                <ArrowDown size={11} />
                              </button>
                            </div>
                          </div>
                          <p className="text-xs font-bold text-slate-900 truncate">{panel.label}</p>
                          <div className="mt-1">
                            <MediaStatusPill status={st} compact />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {activePromoPanel && (
                    <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 space-y-3 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">
                          Editing Panel: {activePromoPanel.label}
                        </span>
                        <div className="flex items-center gap-3">
                          <label className="inline-flex items-center gap-1.5 font-semibold text-slate-700 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={activePromoPanel.visible !== false}
                              onChange={(e) =>
                                updateActivePromoPanel({ visible: e.target.checked })
                              }
                            />
                            <span>Visible</span>
                          </label>
                          {currentPromoPanels.length > 1 && (
                            <button
                              type="button"
                              onClick={() => {
                                const next = currentPromoPanels.filter(
                                  (p) => p.id !== activePromoPanel.id
                                );
                                updateSection(selectedSection.id, { promoPanels: next });
                                setSelectedPanelId(next[0]?.id || null);
                              }}
                              className="text-rose-600 hover:text-rose-800 font-semibold"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="block font-bold text-slate-700 mb-1">Panel Label</label>
                          <input
                            type="text"
                            value={activePromoPanel.label}
                            onChange={(e) => updateActivePromoPanel({ label: e.target.value })}
                            className="w-full p-2 rounded-lg border border-slate-200 bg-white"
                          />
                        </div>
                        <div>
                          <label className="block font-bold text-slate-700 mb-1">Link Destination</label>
                          <input
                            type="text"
                            value={activePromoPanel.destination || ""}
                            onChange={(e) => updateActivePromoPanel({ destination: e.target.value })}
                            className="w-full p-2 rounded-lg border border-slate-200 bg-white font-mono text-[11px]"
                            placeholder="/iphone"
                          />
                        </div>
                        <div>
                          <label className="block font-bold text-slate-700 mb-1">Alt Text</label>
                          <input
                            type="text"
                            value={activePromoPanel.imageAlt}
                            onChange={(e) => updateActivePromoPanel({ imageAlt: e.target.value })}
                            className="w-full p-2 rounded-lg border border-slate-200 bg-white"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block font-bold text-slate-700 mb-1">Image Fit</label>
                            <select
                              value={activePromoPanel.objectFit || "contain"}
                              onChange={(e) =>
                                updateActivePromoPanel({
                                  objectFit: e.target.value as HomepageMediaFit,
                                })
                              }
                              className="w-full p-2 rounded-lg border border-slate-200 bg-white"
                            >
                              <option value="contain">Contain (Cutout)</option>
                              <option value="cover">Cover (Full Bleed)</option>
                            </select>
                          </div>
                          <div>
                            <label className="block font-bold text-slate-700 mb-1">Focus</label>
                            <select
                              value={activePromoPanel.focalPoint || "bottom"}
                              onChange={(e) =>
                                updateActivePromoPanel({
                                  focalPoint: e.target.value as HomepageMediaFocalPoint,
                                })
                              }
                              className="w-full p-2 rounded-lg border border-slate-200 bg-white"
                            >
                              <option value="bottom">Bottom</option>
                              <option value="center">Center</option>
                              <option value="top">Top</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      <UnifiedMediaModeEditor
                        title={`Panel Media Mode (${activePromoPanel.label})`}
                        entity={activePromoPanel}
                        onUpdate={(patch) => updateActivePromoPanel(patch)}
                        onUploadField={(field, file) =>
                          handleLocalUpload(
                            {
                              scope: "panel",
                              sectionId: selectedSection.id,
                              panelId: activePromoPanel.id,
                              field,
                            },
                            file
                          )
                        }
                        onOpenPickerField={(field) =>
                          setMediaPickerTarget({
                            scope: "panel",
                            sectionId: selectedSection.id,
                            panelId: activePromoPanel.id,
                            field,
                          })
                        }
                      />
                    </div>
                  )}
                </div>
              )}

              {/* APPLE-STYLE LEGAL FOOTNOTES EDITOR */}
              {selectedSection.type === "footnotes" && (
                <div className="pt-3 border-t border-slate-100 space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <h5 className="font-bold text-slate-900 uppercase tracking-wider">
                      Legal Footnotes &amp; Disclosures
                    </h5>
                    <button
                      type="button"
                      onClick={() => {
                        const current =
                          selectedSection.footnoteItems || defaultHomepageFootnotes;
                        updateSection(selectedSection.id, {
                          footnoteItems: [
                            ...current,
                            `${current.length + 1}. Additional store note or trade-in disclosure.`,
                          ],
                        });
                      }}
                      className="admin-btn admin-btn-sm admin-btn-secondary"
                    >
                      <Plus size={13} />
                      <span>Add Footnote</span>
                    </button>
                  </div>

                  <div className="space-y-2.5">
                    {(selectedSection.footnoteItems || defaultHomepageFootnotes).map(
                      (note, noteIdx) => (
                        <div key={`${selectedSection.id}-note-${noteIdx}`} className="flex items-start gap-2">
                          <span className="mt-2 w-5 text-[11px] font-bold text-slate-500 shrink-0">
                            #{noteIdx + 1}
                          </span>
                          <textarea
                            rows={2}
                            value={note}
                            onChange={(e) => {
                              const current = [
                                ...(selectedSection.footnoteItems || defaultHomepageFootnotes),
                              ];
                              current[noteIdx] = e.target.value;
                              updateSection(selectedSection.id, { footnoteItems: current });
                            }}
                            className="flex-1 p-2 rounded-lg border border-slate-200 bg-white"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const current =
                                selectedSection.footnoteItems || defaultHomepageFootnotes;
                              updateSection(selectedSection.id, {
                                footnoteItems: current.filter((_, idx) => idx !== noteIdx),
                              });
                            }}
                            className="mt-1.5 p-1.5 rounded-lg text-rose-600 hover:bg-rose-50"
                            title="Remove footnote"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}

              {/* LIVE CATALOG PRODUCT PICKER FOR PRODUCT/ACCESSORY SHELVES */}
              {(selectedSection.type === "product-carousel" ||
                selectedSection.type === "accessories-collection") && (
                <div className="pt-3 border-t border-slate-100 space-y-3 text-xs">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Package size={15} className="text-[#d4af37]" />
                      <h5 className="font-bold text-slate-900 uppercase tracking-wider">
                        Assigned Catalog Products ({(selectedSection.productIds || []).length})
                      </h5>
                    </div>
                    <div className="relative w-full sm:w-64">
                      <Search
                        size={13}
                        className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
                      />
                      <input
                        type="text"
                        value={productSearch}
                        onChange={(e) => setProductSearch(e.target.value)}
                        placeholder="Search products or slugs..."
                        className="w-full pl-8 pr-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-72 overflow-y-auto pr-1">
                    {eligibleProducts.slice(0, 40).map((product) => {
                      const assigned =
                        selectedSection.productIds?.includes(product.id) ||
                        selectedSection.productIds?.includes(product.slug);
                      const img = resolveProductImage(product);
                      const price = getCardPriceDisplay(product);

                      return (
                        <button
                          key={product.id}
                          type="button"
                          onClick={() => {
                            const current = selectedSection.productIds || [];
                            const next = assigned
                              ? current.filter((id) => id !== product.id && id !== product.slug)
                              : [...current, product.slug || product.id];
                            updateSection(selectedSection.id, { productIds: next });
                          }}
                          className={`p-2 rounded-xl border text-left flex items-center gap-2.5 transition ${
                            assigned
                              ? "border-[#d4af37] bg-[#d4af37]/[0.08]"
                              : "border-slate-200 bg-white hover:border-[#d4af37]/50"
                          }`}
                        >
                          <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 overflow-hidden">
                            {img?.src ? (
                              <img
                                src={img.src}
                                alt={product.name}
                                className="w-full h-full object-contain"
                              />
                            ) : null}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-bold text-slate-900 truncate">{product.name}</p>
                            <p className="text-[11px] text-slate-500 truncate">
                              {price.current} · {product.condition || "Brand New"}
                            </p>
                          </div>
                          <span
                            className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                              assigned
                                ? "bg-[#d4af37] text-[#0a0a0c]"
                                : "border border-slate-300 text-transparent"
                            }`}
                          >
                            <Check size={12} />
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>

      {/* INTERACTIVE FULL-VIEWPORT PREVIEW MODAL */}
      {previewMode !== "closed" && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-md"
          onClick={() => setPreviewMode("closed")}
        >
          <div
            className="w-full h-[92vh] bg-slate-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-slate-700"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-[#0a0a0c] text-white border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Eye size={16} className="text-[#d4af37]" />
                <span className="text-sm font-bold">Buy &amp; Sell GH Homepage Preview</span>
                <span className="text-[11px] text-slate-400">
                  (Click any media slot to jump directly to its editor)
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setPreviewMode("desktop")}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                    previewMode === "desktop" ? "bg-[#d4af37] text-[#0a0a0c] font-bold" : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                  }`}
                >
                  <Monitor size={13} />
                  <span>Desktop (1440px)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewMode("tablet")}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                    previewMode === "tablet" ? "bg-[#d4af37] text-[#0a0a0c] font-bold" : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                  }`}
                >
                  <Tablet size={13} />
                  <span>Tablet (834px)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewMode("mobile")}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                    previewMode === "mobile" ? "bg-[#d4af37] text-[#0a0a0c] font-bold" : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                  }`}
                >
                  <Smartphone size={13} />
                  <span>Mobile (390px)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewMode("closed")}
                  className="ml-2 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-auto bg-slate-800 p-4 flex justify-center">
              <div
                className="bg-white shadow-2xl overflow-y-auto overflow-x-hidden transition-all duration-300 rounded-xl"
                style={{
                  width:
                    previewMode === "mobile"
                      ? "390px"
                      : previewMode === "tablet"
                      ? "834px"
                      : "min(1440px, 100%)",
                  height: "100%",
                }}
              >
                <HomepageSectionRenderer
                  content={draft}
                  adminInteractive
                  onAdminInteract={(target) => {
                    setSelectedSectionId(target.sectionId);
                    if (target.panelId) setSelectedPanelId(target.panelId);
                    if (target.tileId) setSelectedTileId(target.tileId);
                    if (target.cardId) setSelectedCardId(target.cardId);
                    setPreviewMode("closed");
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* READ-ONLY EXISTING MEDIA + INDEXEDDB STAGED ASSETS PICKER */}
      {mediaPickerTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm"
          onClick={() => setMediaPickerTarget(null)}
        >
          <div
            className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl p-5 space-y-4 max-h-[85vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ImageIcon size={18} className="text-[#d4af37]" />
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Choose Existing Asset or Staged Local Upload
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Read-only picker from CMS Media Library and local IndexedDB uploads (no automatic production changes).
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setMediaPickerTarget(null)}
                className="p-1 text-slate-400 hover:text-slate-900"
              >
                <X size={18} />
              </button>
            </div>

            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={pickerSearch}
                onChange={(e) => setPickerSearch(e.target.value)}
                placeholder="Search local assets, media library titles, or URLs..."
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs"
              />
            </div>

            <div className="flex-1 overflow-y-auto space-y-5 pr-1">
              {stagedMedia.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#8f650e]">
                    Newly Uploaded Local Assets (IndexedDB)
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {stagedMedia
                      .filter(
                        (item) =>
                          !pickerSearch.trim() ||
                          item.filename.toLowerCase().includes(pickerSearch.toLowerCase())
                      )
                      .map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => {
                            handleAssignMediaUrl(mediaPickerTarget, item.uri);
                            setMediaPickerTarget(null);
                          }}
                          className="group rounded-xl border border-[#d4af37]/40 bg-[#d4af37]/[0.06] p-2 text-left hover:border-[#d4af37] transition"
                        >
                          <div className="aspect-video rounded-lg bg-slate-900 overflow-hidden mb-1.5 flex items-center justify-center">
                            {item.kind === "video" ? (
                              <video src={item.objectUrl} className="w-full h-full object-cover" muted />
                            ) : (
                              <img src={item.objectUrl} alt={item.filename} className="w-full h-full object-contain" />
                            )}
                          </div>
                          <p className="text-[11px] font-bold text-slate-900 truncate">
                            {item.filename}
                          </p>
                        </button>
                      ))}
                  </div>
                </div>
              )}

              {(mediaPickerTarget.field === "videoUrl" ||
                mediaPickerTarget.field === "mobileVideoUrl") && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#0f172a]">
                    Existing Local Video Assets
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {[
                      {
                        title: "iPhone 18 Pro Campaign Video (MP4)",
                        url: "/videos/homepage/iphone-18-pro.mp4",
                      },
                      {
                        title: "iPhone 18 Pro Mobile Video (WebM)",
                        url: "/videos/homepage/iphone-18-pro-mobile.webm",
                      },
                      {
                        title: "iPhone Duo Campaign Video (MP4)",
                        url: "/videos/homepage/iphone-duo.mp4",
                      },
                      {
                        title: "Apple Watch Series 12 Video (MP4)",
                        url: "/videos/homepage/watch-series-12.mp4",
                      },
                      {
                        title: "Apple Watch Ultra 4 Video (MP4)",
                        url: "/videos/homepage/watch-ultra-4.mp4",
                      },
                      {
                        title: "AirPods Pro 3 Lifestyle Video (MP4)",
                        url: "/videos/homepage/airpods-pro-3-lifestyle.mp4",
                      },
                    ]
                      .filter(
                        (v) =>
                          !pickerSearch.trim() ||
                          v.title.toLowerCase().includes(pickerSearch.toLowerCase()) ||
                          v.url.toLowerCase().includes(pickerSearch.toLowerCase())
                      )
                      .map((vid) => (
                        <button
                          key={vid.url}
                          type="button"
                          onClick={() => {
                            handleAssignMediaUrl(mediaPickerTarget, vid.url);
                            setMediaPickerTarget(null);
                          }}
                          className="group rounded-xl border border-slate-200 bg-slate-50/70 p-2 text-left hover:border-[#d4af37] transition"
                        >
                          <div className="aspect-video rounded-lg bg-slate-900 overflow-hidden mb-1.5 flex items-center justify-center">
                            <video
                              src={vid.url}
                              className="w-full h-full object-cover"
                              muted
                              playsInline
                              preload="metadata"
                            />
                          </div>
                          <p className="text-[11px] font-bold text-slate-900 truncate">
                            {vid.title}
                          </p>
                          <p className="text-[10px] text-slate-500 truncate">{vid.url}</p>
                        </button>
                      ))}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  Existing Local &amp; CMS Media Library Assets
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {mediaLibrary
                    .filter(
                      (m) =>
                        !pickerSearch.trim() ||
                        m.title.toLowerCase().includes(pickerSearch.toLowerCase()) ||
                        m.url.toLowerCase().includes(pickerSearch.toLowerCase())
                    )
                    .map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          handleAssignMediaUrl(mediaPickerTarget, item.url);
                          setMediaPickerTarget(null);
                        }}
                        className="group rounded-xl border border-slate-200 bg-white p-2 text-left hover:border-[#d4af37] transition"
                      >
                        <div className="aspect-video rounded-lg bg-slate-100 overflow-hidden mb-1.5 flex items-center justify-center">
                          <img
                            src={item.url}
                            alt={item.alt || item.title}
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <p className="text-[11px] font-bold text-slate-900 truncate">
                          {item.title}
                        </p>
                        <p className="text-[10px] text-slate-400 truncate">{item.url}</p>
                      </button>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ----------------------------------------------------------------------------
   REUSABLE ADMIN MEDIA MODE & SLOT EDITORS (IMAGE + CINEMATIC VIDEO + INDEXEDDB)
   ---------------------------------------------------------------------------- */
interface UnifiedMediaEditorPatch extends MediaSlotLike {
  imageAlt?: string;
  objectFit?: HomepageMediaFit;
  focalPoint?: HomepageMediaFocalPoint;
}

function UnifiedMediaModeEditor({
  title = "Media Mode & Responsive Assets",
  entity,
  defaultFocalPoint = "bottom",
  defaultObjectFit = "contain",
  onUpdate,
  onUploadField,
  onOpenPickerField,
}: {
  title?: string;
  entity: MediaSlotLike & {
    imageAlt?: string;
    objectFit?: HomepageMediaFit;
    focalPoint?: HomepageMediaFocalPoint;
  };
  defaultFocalPoint?: HomepageMediaFocalPoint;
  defaultObjectFit?: HomepageMediaFit;
  onUpdate: (patch: Partial<UnifiedMediaEditorPatch>) => void;
  onUploadField: (field: MediaFieldKey, file: File) => void;
  onOpenPickerField: (field: MediaFieldKey) => void;
}) {
  const effectiveMode: HomepageMediaMode = resolveEffectiveMediaMode(entity);
  const autoplay = entity.videoAutoplay !== false;
  const muted = autoplay ? true : entity.videoMuted !== false;
  const loop = entity.videoLoop !== false;

  return (
    <div className="pt-4 border-t border-slate-100 space-y-3.5">
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex flex-wrap items-center gap-2">
          <h5 className="text-xs font-bold text-slate-900 uppercase tracking-wider">{title}</h5>
          <span
            data-testid="active-media-mode-indicator"
            className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
              effectiveMode === "video"
                ? "bg-[#111215] text-[#f0cf78] border-[#111215]"
                : "bg-[#d4af37]/15 text-[#8f650e] border-[#d4af37]/45"
            }`}
          >
            Active: {effectiveMode === "video" ? "Video Mode" : "Image Mode"}
          </span>
        </div>

        <div className="inline-flex items-center p-1 rounded-xl bg-slate-100 border border-slate-200 text-[11px] shrink-0">
          <button
            type="button"
            onClick={() => onUpdate({ mediaMode: "image" })}
            className={`px-3 py-1 rounded-lg font-bold flex items-center gap-1.5 whitespace-nowrap transition ${
              effectiveMode === "image"
                ? "bg-[#0f172a] text-[#f0cf78] shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <ImageIcon size={12} className="shrink-0" />
            <span>Image Mode</span>
          </button>
          <button
            type="button"
            onClick={() => onUpdate({ mediaMode: "video" })}
            className={`px-3 py-1 rounded-lg font-bold flex items-center gap-1.5 whitespace-nowrap transition ${
              effectiveMode === "video"
                ? "bg-[#0f172a] text-[#f0cf78] shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Film size={12} className="shrink-0" />
            <span>Video Mode</span>
          </button>
        </div>
      </div>

      {/* Framing & Alt Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
        <div>
          <label className="block font-bold text-slate-700 mb-1">Alt / Accessible Label</label>
          <input
            type="text"
            value={entity.imageAlt || ""}
            onChange={(e) => onUpdate({ imageAlt: e.target.value })}
            className="w-full p-2 rounded-lg border border-slate-200 bg-white"
            placeholder="Describe visual content"
          />
        </div>
        <div>
          <label className="block font-bold text-slate-700 mb-1">Object Fit</label>
          <select
            value={entity.objectFit || defaultObjectFit}
            onChange={(e) => onUpdate({ objectFit: e.target.value as HomepageMediaFit })}
            className="w-full p-2 rounded-lg border border-slate-200 bg-white"
          >
            <option value="contain">Contain (Studio Cutout)</option>
            <option value="cover">Cover (Full Bleed)</option>
          </select>
        </div>
        <div>
          <label className="block font-bold text-slate-700 mb-1">Focal Point</label>
          <select
            value={entity.focalPoint || defaultFocalPoint}
            onChange={(e) =>
              onUpdate({ focalPoint: e.target.value as HomepageMediaFocalPoint })
            }
            className="w-full p-2 rounded-lg border border-slate-200 bg-white"
          >
            <option value="bottom">Bottom</option>
            <option value="center">Center</option>
            <option value="top">Top</option>
            <option value="left">Left</option>
            <option value="right">Right</option>
          </select>
        </div>
      </div>

      {effectiveMode === "image" ? (
        <div className="homepage-cms-media-grid">
          <MediaSlotFieldCard
            label="Desktop Image"
            url={entity.desktopImage}
            accept={SUPPORTED_IMAGE_ACCEPT}
            onUpload={(f) => onUploadField("desktopImage", f)}
            onOpenPicker={() => onOpenPickerField("desktopImage")}
            onClear={() => onUpdate({ desktopImage: "" })}
          />
          <MediaSlotFieldCard
            label="Mobile Image (Optional)"
            url={entity.mobileImage}
            accept={SUPPORTED_IMAGE_ACCEPT}
            onUpload={(f) => onUploadField("mobileImage", f)}
            onOpenPicker={() => onOpenPickerField("mobileImage")}
            onClear={() => onUpdate({ mobileImage: "" })}
          />
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-4 px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs">
            <label className="inline-flex items-center gap-1.5 font-semibold text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={autoplay}
                onChange={(e) =>
                  onUpdate({
                    videoAutoplay: e.target.checked,
                    videoMuted: e.target.checked ? true : muted,
                  })
                }
              />
              <span>Autoplay (Muted Inline)</span>
            </label>
            <label className="inline-flex items-center gap-1.5 font-semibold text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={muted}
                disabled={autoplay}
                onChange={(e) => onUpdate({ videoMuted: e.target.checked })}
              />
              <span>Muted{autoplay ? " (Enforced for Autoplay)" : ""}</span>
            </label>
            <label className="inline-flex items-center gap-1.5 font-semibold text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={loop}
                onChange={(e) => onUpdate({ videoLoop: e.target.checked })}
              />
              <span>Loop</span>
            </label>
            <span className="text-[11px] text-slate-500 ml-auto">
              Supported Formats: MP4, WebM (max 200 MB)
            </span>
          </div>

          <div className="homepage-cms-media-grid">
            <MediaSlotFieldCard
              label="Desktop Video"
              url={entity.videoUrl}
              accept={SUPPORTED_VIDEO_ACCEPT}
              isVideo
              onUpload={(f) => onUploadField("videoUrl", f)}
              onOpenPicker={() => onOpenPickerField("videoUrl")}
              onClear={() => onUpdate({ videoUrl: "" })}
            />
            <MediaSlotFieldCard
              label="Mobile Video (Optional)"
              url={entity.mobileVideoUrl}
              accept={SUPPORTED_VIDEO_ACCEPT}
              isVideo
              onUpload={(f) => onUploadField("mobileVideoUrl", f)}
              onOpenPicker={() => onOpenPickerField("mobileVideoUrl")}
              onClear={() => onUpdate({ mobileVideoUrl: "" })}
            />
            <MediaSlotFieldCard
              label="Desktop Poster Image"
              url={entity.posterUrl}
              accept={SUPPORTED_IMAGE_ACCEPT}
              onUpload={(f) => onUploadField("posterUrl", f)}
              onOpenPicker={() => onOpenPickerField("posterUrl")}
              onClear={() => onUpdate({ posterUrl: "" })}
            />
            <MediaSlotFieldCard
              label="Mobile Poster Image (Optional)"
              url={entity.mobilePosterUrl}
              accept={SUPPORTED_IMAGE_ACCEPT}
              onUpload={(f) => onUploadField("mobilePosterUrl", f)}
              onOpenPicker={() => onOpenPickerField("mobilePosterUrl")}
              onClear={() => onUpdate({ mobilePosterUrl: "" })}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function MediaStatusPill({
  status,
  compact = false,
}: {
  status: ReturnType<typeof classifyMediaSource>;
  compact?: boolean;
}) {
  const palette =
    status.kind === "existing-local"
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : status.kind === "media-library"
      ? "bg-slate-100 text-slate-800 border-slate-300"
      : status.kind === "newly-uploaded-local"
      ? "bg-[#d4af37]/15 text-[#8f650e] border-[#d4af37]/45"
      : "bg-amber-50 text-amber-800 border-amber-200";

  return (
    <span
      className={`inline-flex items-center shrink-0 whitespace-nowrap font-bold border rounded-full ${palette} ${
        compact ? "px-1.5 py-0.5 text-[9px]" : "px-2 py-0.5 text-[10px]"
      }`}
    >
      {status.label}
    </span>
  );
}

function MediaSlotFieldCard({
  label,
  url,
  accept,
  isVideo = false,
  onUpload,
  onOpenPicker,
  onClear,
}: {
  label: string;
  url?: string;
  accept: string;
  isVideo?: boolean;
  onUpload: (file: File) => void;
  onOpenPicker: () => void;
  onClear: () => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const { resolvedUrl } = useResolvedMediaUrl(url);
  const status = classifyMediaSource(url);

  return (
    <div className="homepage-cms-media-card rounded-xl border border-slate-200 bg-white p-3 space-y-2.5 text-xs shadow-2xs">
      <div className="flex flex-wrap items-center justify-between gap-1.5 min-h-[24px]">
        <span className="font-bold text-slate-900 flex items-center gap-1.5 min-w-0">
          {isVideo ? <Film size={13} className="text-[#8f650e] shrink-0" /> : <ImageIcon size={13} className="text-[#8f650e] shrink-0" />}
          <span>{label}</span>
        </span>
        <MediaStatusPill status={status} />
      </div>

      <div className="homepage-cms-media-preview">
        {resolvedUrl ? (
          isVideo ? (
            <video
              src={resolvedUrl}
              className="w-full h-full object-contain rounded"
              controls
              muted
              playsInline
              preload="metadata"
            />
          ) : (
            <img src={resolvedUrl} alt={label} className="w-full h-full object-contain" />
          )
        ) : (
          <span className="text-[11px] font-medium text-slate-400 text-center px-2">
            Empty Slot — Preserves Layout Proportions
          </span>
        )}
      </div>

      <div className="homepage-cms-media-actions">
        <input
          ref={fileRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onUpload(file);
            e.target.value = "";
          }}
        />
        <button
          type="button"
          data-media-upload="true"
          onClick={() => fileRef.current?.click()}
          className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#d4af37] text-[#0a0a0c] font-bold hover:bg-[#b89726] border border-[#b89726]/40 transition whitespace-nowrap shrink-0"
        >
          <ImagePlus size={12} className="shrink-0" />
          <span>{url ? "Replace Local" : "Upload Local"}</span>
        </button>
        <button
          type="button"
          onClick={onOpenPicker}
          className="inline-flex items-center justify-center px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-800 font-semibold hover:bg-slate-50 transition whitespace-nowrap shrink-0"
        >
          Library
        </button>
        {url ? (
          <button
            type="button"
            data-media-remove="true"
            onClick={onClear}
            className="inline-flex items-center justify-center px-2.5 py-1.5 rounded-lg border border-rose-200 bg-rose-50/40 text-rose-700 hover:bg-rose-50 font-semibold transition whitespace-nowrap shrink-0"
            title="Remove media from this slot (leave intentionally empty)"
          >
            Remove
          </button>
        ) : null}
      </div>
    </div>
  );
}
