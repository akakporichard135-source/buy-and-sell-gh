import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Check,
  Columns,
  Copy,
  ExternalLink,
  Eye,
  EyeOff,
  Film,
  Grid,
  GripVertical,
  History,
  Image as ImageIcon,
  Layers,
  Layout,
  Laptop,
  Maximize2,
  Monitor,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  RotateCcw,
  Save,
  Search,
  Send,
  Smartphone,
  Sparkles,
  Tablet,
  Trash2,
  Upload,
  Video,
  X,
} from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import type { ProductFamilyKey } from "../../catalog/productExperience";
import { getLearnMoreMediaSource, replaceLearnMoreMedia, type LearnMoreMediaTarget } from "../../cms/learnMoreMedia";
import {
  fetchDraftLearnMore,
  fetchLearnMoreRevisions,
  fetchLearnMoreStatusMap,
  fetchPublishedLearnMore,
  getBuiltInLearnMoreMedia,
  getEligibleLearnMoreProducts,
  getLearnMoreFamily,
  getLearnMoreHeroThumbnail,
  getLearnMorePublicPath,
  listLearnMoreMedia,
  normalizeLearnMoreContent,
  publishLearnMore,
  rollbackLearnMoreRevision,
  saveDraftLearnMore,
  unpublishLearnMore,
  uploadLearnMoreMedia,
  type LearnMoreContent,
  type LearnMorePageStatus,
  type LearnMoreRevision,
  type LearnMoreSection,
  type LearnMoreSectionType,
} from "../../cms/learnMoreRepository";
import { MinimalEditorialProductStory } from "../../components/MinimalEditorialProductStory";
import { CatalogProductStory } from "../ProductStoryPage";
import { MacLaunchPage } from "../MacLaunchPage";
import "../../styles/admin-learn-more.css";

const clone = <T,>(value: T): T => structuredClone(value);
const createSectionId = (): string =>
  typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : `sec-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

export interface SectionPresetMeta {
  type: LearnMoreSectionType;
  shortName: string;
  label: string;
  category: "core" | "media" | "specs";
  featured: boolean;
  desc: string;
}

export const SECTION_TYPE_PRESETS: SectionPresetMeta[] = [
  {
    type: "large-image",
    shortName: "Hero",
    label: "Hero / Showcase Stage",
    category: "core",
    featured: true,
    desc: "Bold centered headline, eyebrow, and hero product visual on a pure white, soft gray, or dark stage.",
  },
  {
    type: "full-bleed",
    shortName: "Large Image",
    label: "Large Full-Width Image",
    category: "media",
    featured: true,
    desc: "Expansive edge-to-edge product presentation canvas for dramatic hardware photography.",
  },
  {
    type: "text-image",
    shortName: "Split Image/Text",
    label: "Split Image & Text",
    category: "core",
    featured: true,
    desc: "Balanced editorial story copy paired side-by-side with a high-resolution product image.",
  },
  {
    type: "gallery",
    shortName: "Gallery",
    label: "Multi-Angle Image Gallery",
    category: "media",
    featured: true,
    desc: "Visual grid of multiple product angles and finish perspectives.",
  },
  {
    type: "video",
    shortName: "Cinematic Video",
    label: "Cinematic Video",
    category: "media",
    featured: true,
    desc: "Autoplaying or controlled 4K product film with poster fallback and optional mobile video.",
  },
  {
    type: "feature-cards",
    shortName: "Features",
    label: "Feature Cards Grid",
    category: "core",
    featured: true,
    desc: "Grid of rounded feature highlight cards with optional card imagery, titles, and descriptions.",
  },
  {
    type: "specifications",
    shortName: "Specifications",
    label: "Technical Specifications",
    category: "specs",
    featured: true,
    desc: "Clean structured hardware specification rows for processor, display, camera, and battery details.",
  },
  {
    type: "cta",
    shortName: "Buy CTA",
    label: "Buy Call-to-Action",
    category: "specs",
    featured: true,
    desc: "Direct purchase conversion banner linking customers straight to the product Buy Page.",
  },
  {
    type: "hardware-close-up",
    shortName: "Close-Up",
    label: "Hardware Close-Up",
    category: "media",
    featured: false,
    desc: "Detailed close-up beauty shot with rounded framing and tactile highlights.",
  },
  {
    type: "finishes",
    shortName: "Finishes",
    label: "Materials & Color Swatches",
    category: "specs",
    featured: false,
    desc: "Interactive color finish swatches with hex tones and finish names.",
  },
  {
    type: "comparison",
    shortName: "Comparison",
    label: "Model Comparison",
    category: "specs",
    featured: false,
    desc: "Side-by-side model size, chip, or capability comparison cards.",
  },
  {
    type: "performance",
    shortName: "Performance",
    label: "Apple Silicon Performance",
    category: "core",
    featured: false,
    desc: "Compute & graphics storytelling layout for M-series and A-series chips.",
  },
  {
    type: "battery",
    shortName: "Battery",
    label: "All-Day Battery & Power",
    category: "core",
    featured: false,
    desc: "Endurance metrics and fast-charging storytelling section.",
  },
  {
    type: "highlights",
    shortName: "Highlights",
    label: "Hardware Highlights",
    category: "core",
    featured: false,
    desc: "Editorial highlight showcase section for key product pillars.",
  },
];

const FOCAL_POSITIONS = [
  { value: "top left", label: "Top Left" },
  { value: "center top", label: "Top" },
  { value: "top right", label: "Top Right" },
  { value: "left center", label: "Left" },
  { value: "center", label: "Center" },
  { value: "right center", label: "Right" },
  { value: "bottom left", label: "Bottom Left" },
  { value: "center bottom", label: "Bottom" },
  { value: "bottom right", label: "Bottom Right" },
];

const CATEGORY_LABELS: Record<string, string> = {
  all: "All Pages",
  iphone: "iPhone",
  mac: "Mac",
  ipad: "iPad",
  watch: "Watch",
  airpods: "AirPods",
  accessories: "Accessories",
};

function getStoryTagline(content: LearnMoreContent | null): string {
  if (!content) return "";
  if (content.kind === "editorial" || content.kind === "catalog") {
    return content.story.tagline || "";
  }
  if (content.kind === "mac-studio") {
    return content.story.chips || "";
  }
  return "";
}

function setStoryTagline(content: LearnMoreContent, val: string) {
  if (content.kind === "editorial" || content.kind === "catalog") {
    content.story.tagline = val;
  } else if (content.kind === "mac-studio") {
    content.story.chips = val;
  }
}

function getStoryBuyPath(content: LearnMoreContent | null): string {
  if (!content) return "";
  if (content.kind === "editorial" || content.kind === "catalog") {
    return content.story.buyPath || "";
  }
  if (content.kind === "mac-studio") {
    return content.story.preorderTo || "";
  }
  return "";
}

function setStoryBuyPath(content: LearnMoreContent, val: string) {
  if (content.kind === "editorial" || content.kind === "catalog") {
    content.story.buyPath = val;
  } else if (content.kind === "mac-studio") {
    content.story.preorderTo = val;
  }
}

function getStoryBuyLabel(content: LearnMoreContent | null): string {
  if (!content) return "Buy";
  if (content.kind === "editorial") {
    return content.story.buyLabel || "Buy";
  }
  if (content.kind === "catalog") {
    return "Buy";
  }
  if (content.kind === "mac-studio") {
    return content.story.preorderLabel || "Pre-order";
  }
  return "Buy";
}

function setStoryBuyLabel(content: LearnMoreContent, val: string) {
  if (content.kind === "editorial") {
    content.story.buyLabel = val;
  } else if (content.kind === "mac-studio") {
    content.story.preorderLabel = val;
  }
}

function getHeroImageSrc(content: LearnMoreContent | null): string {
  if (!content) return "";
  if (content.kind === "editorial") return content.story.hero.src || "";
  if (content.kind === "mac-studio") return content.story.image.src || "";
  if (content.kind === "catalog") return content.story.media.src || "";
  return "";
}

function setHeroImageSrc(content: LearnMoreContent, url: string) {
  if (content.kind === "editorial") {
    content.story.hero.src = url;
    content.story.hero.cmsAssetOverride = true;
  } else if (content.kind === "mac-studio") {
    content.story.image.src = url;
    content.story.image.cmsAssetOverride = true;
  } else if (content.kind === "catalog") {
    content.story.media.src = url;
    content.story.media.cmsAssetOverride = true;
  }
}

function imageAspectRatio(src: string): Promise<number | undefined> {
  return new Promise((resolve) => {
    if (!src) return resolve(undefined);
    const image = new Image();
    image.onload = () => resolve(image.naturalWidth && image.naturalHeight ? image.naturalWidth / image.naturalHeight : undefined);
    image.onerror = () => resolve(undefined);
    image.src = src;
  });
}

function getHeroImageAlt(content: LearnMoreContent | null): string {
  if (!content) return "";
  if (content.kind === "editorial") return content.story.hero.alt || "";
  if (content.kind === "mac-studio") return content.story.image.alt || "";
  if (content.kind === "catalog") return content.story.media.alt || "";
  return "";
}

function setHeroImageAlt(content: LearnMoreContent, alt: string) {
  if (content.kind === "editorial") {
    content.story.hero.alt = alt;
  } else if (content.kind === "mac-studio") {
    content.story.image.alt = alt;
  } else if (content.kind === "catalog") {
    content.story.media.alt = alt;
  }
}

function getHeroPosition(content: LearnMoreContent | null): string {
  if (!content) return "center";
  if (content.kind === "editorial") return content.story.hero.position || "center";
  if (content.kind === "mac-studio") return content.story.image.position || "center";
  return content.story.media.position || "center";
}

function setHeroPosition(content: LearnMoreContent, pos: string) {
  if (content.kind === "editorial") {
    content.story.hero.position = pos;
  } else if (content.kind === "mac-studio") {
    content.story.image.position = pos;
  } else if (content.story.media.type === "image") {
    content.story.media.position = pos;
  }
}

function getHeroFit(content: LearnMoreContent | null): "contain" | "cover" {
  if (!content) return "contain";
  if (content.kind === "editorial") return content.story.hero.fit || "contain";
  if (content.kind === "mac-studio") return content.story.image.fit || "contain";
  return content.story.media.fit || "contain";
}

function setHeroFit(content: LearnMoreContent, fit: "contain" | "cover") {
  if (content.kind === "editorial") {
    content.story.hero.fit = fit;
  } else if (content.kind === "mac-studio") {
    content.story.image.fit = fit;
  } else if (content.story.media.type === "image") {
    content.story.media.fit = fit;
  }
}

function getSectionThumbnail(section: LearnMoreSection): string {
  if (section.image) return section.image;
  if (section.poster) return section.poster;
  if (section.images && section.images.length > 0) return section.images[0];
  const itemWithImg = section.items?.find((it) => Boolean(it.image));
  if (itemWithImg?.image) return itemWithImg.image;
  return "";
}

function getSectionPresetLabel(type: LearnMoreSectionType): string {
  return SECTION_TYPE_PRESETS.find((p) => p.type === type)?.shortName || type;
}

function SectionWireframePreview({ type }: { type: LearnMoreSectionType }) {
  switch (type) {
    case "large-image":
      return (
        <div className="vlearn-wireframe vlearn-wf-hero">
          <span className="wf-pill" />
          <span className="wf-line wf-line-lg" />
          <div className="wf-img-box wf-img-center">
            <ImageIcon size={18} />
          </div>
        </div>
      );
    case "full-bleed":
      return (
        <div className="vlearn-wireframe vlearn-wf-fullbleed">
          <div className="wf-img-full">
            <Maximize2 size={18} />
            <span className="wf-line wf-line-md" />
          </div>
        </div>
      );
    case "text-image":
    case "performance":
    case "battery":
      return (
        <div className="vlearn-wireframe vlearn-wf-split">
          <div className="wf-col-text">
            <span className="wf-pill" />
            <span className="wf-line wf-line-md" />
            <span className="wf-line wf-line-sm" />
            <span className="wf-line wf-line-sm" />
          </div>
          <div className="wf-col-img">
            <ImageIcon size={16} />
          </div>
        </div>
      );
    case "gallery":
      return (
        <div className="vlearn-wireframe vlearn-wf-gallery">
          <span className="wf-line wf-line-md" />
          <div className="wf-grid-3">
            <div className="wf-thumb"><ImageIcon size={12} /></div>
            <div className="wf-thumb"><ImageIcon size={12} /></div>
            <div className="wf-thumb"><ImageIcon size={12} /></div>
          </div>
        </div>
      );
    case "video":
      return (
        <div className="vlearn-wireframe vlearn-wf-video">
          <span className="wf-line wf-line-md" />
          <div className="wf-video-stage">
            <Film size={18} />
          </div>
        </div>
      );
    case "feature-cards":
    case "comparison":
    case "highlights":
      return (
        <div className="vlearn-wireframe vlearn-wf-cards">
          <span className="wf-line wf-line-md" />
          <div className="wf-grid-2">
            <div className="wf-card">
              <span className="wf-pill" />
              <span className="wf-line wf-line-sm" />
            </div>
            <div className="wf-card">
              <span className="wf-pill" />
              <span className="wf-line wf-line-sm" />
            </div>
          </div>
        </div>
      );
    case "specifications":
      return (
        <div className="vlearn-wireframe vlearn-wf-specs">
          <span className="wf-line wf-line-md" />
          <div className="wf-spec-row"><span className="wf-k" /><span className="wf-v" /></div>
          <div className="wf-spec-row"><span className="wf-k" /><span className="wf-v" /></div>
          <div className="wf-spec-row"><span className="wf-k" /><span className="wf-v" /></div>
        </div>
      );
    case "cta":
      return (
        <div className="vlearn-wireframe vlearn-wf-cta">
          <span className="wf-line wf-line-md" />
          <span className="wf-line wf-line-sm" />
          <span className="wf-cta-btn">Buy Now</span>
        </div>
      );
    case "finishes":
      return (
        <div className="vlearn-wireframe vlearn-wf-finishes">
          <span className="wf-line wf-line-md" />
          <div className="wf-swatches">
            <span className="wf-dot" style={{ background: "#1f242b" }} />
            <span className="wf-dot" style={{ background: "#b5b0a8" }} />
            <span className="wf-dot" style={{ background: "#e3e4e5" }} />
            <span className="wf-dot" style={{ background: "#5b1f29" }} />
          </div>
        </div>
      );
    default:
      return (
        <div className="vlearn-wireframe vlearn-wf-hero">
          <span className="wf-line wf-line-md" />
          <div className="wf-img-box wf-img-center">
            <Sparkles size={16} />
          </div>
        </div>
      );
  }
}

export function getCinematicVideoThumbnail(content: LearnMoreContent | null): string {
  if (!content || content.kind !== "editorial" || !content.story.cinematicVideo) return "";
  const poster = (content.story.cinematicVideo.poster || "").trim();
  if (
    content.story.slug === "apple-watch-series-12" &&
    (!poster ||
      poster === "/products/homepage/watch-series-12.webp" ||
      poster === "/products/campaigns/watch-series-12-product.webp" ||
      poster.includes("watch-series-12.webp"))
  ) {
    return "/products/campaigns/watch-series-12-cinematic.webp";
  }
  return poster;
}

export function AdminLearnMorePages() {
  // Strictly eligible Learn More products (13 public Learn More routes)
  const allChoices: LearnMoreContent[] = useMemo(() => getEligibleLearnMoreProducts(), []);
  const builtInMedia = useMemo(() => getBuiltInLearnMoreMedia(), []);

  const [selectedSlug, setSelectedSlug] = useState<string>("iphone-18-pro");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [productSidebarOpen, setProductSidebarOpen] = useState<boolean>(true);

  // Mobile/Tablet responsive panel step ("products" | "outline" | "editor" | "preview")
  const [mobileStep, setMobileStep] = useState<"products" | "outline" | "editor" | "preview">("editor");

  // Desktop workspace layout mode ("inspector" | "split" | "preview")
  const [workspaceMode, setWorkspaceMode] = useState<"inspector" | "split" | "preview">("inspector");

  const [workingContent, setWorkingContent] = useState<LearnMoreContent | null>(null);
  const [publishedContent, setPublishedContent] = useState<LearnMoreContent | null>(null);
  const [baselineJson, setBaselineJson] = useState<string>("");
  const [hasDraft, setHasDraft] = useState(false);
  const [statusMap, setStatusMap] = useState<Record<string, LearnMorePageStatus>>({});

  const [activeItemKey, setActiveItemKey] = useState<string>("hero"); // "hero", "video", or section ID
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  // Drag-and-drop state for section outline
  const [draggedSectionIdx, setDraggedSectionIdx] = useState<number | null>(null);

  // Revisions State
  const [showRevisionsModal, setShowRevisionsModal] = useState(false);
  const [showAddSectionModal, setShowAddSectionModal] = useState(false);
  const [libraryCategory, setLibraryCategory] = useState<"all" | "core" | "media" | "specs">("all");
  const [revisions, setRevisions] = useState<LearnMoreRevision[]>([]);
  const [loadingRevisions, setLoadingRevisions] = useState(false);

  // Media Library State
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [mediaLibrary, setMediaLibrary] = useState<string[]>([]);
  const [loadingMedia, setLoadingMedia] = useState(false);
  const [mediaSourceTab, setMediaSourceTab] = useState<"all" | "uploaded" | "builtin">("all");
  const [mediaFilter, setMediaFilter] = useState<"all" | "images" | "videos">("all");
  const [mediaSearch, setMediaSearch] = useState<string>("");
  const [mediaTarget, setMediaTarget] = useState<{
    sectionId?: string;
    field: string;
    itemIndex?: number;
    galleryAppend?: boolean;
    galleryIndex?: number;
  } | null>(null);

  // Upload & Save state
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ text: string; type: "success" | "error" | "info" } | null>(null);

  // Dirty / Unsaved changes calculation
  const hasUnsavedChanges = useMemo(() => {
    if (!workingContent || !baselineJson) return false;
    return JSON.stringify(workingContent) !== baselineJson;
  }, [workingContent, baselineJson]);

  // Refresh status map across all 13 Learn More pages
  const refreshStatusMap = async () => {
    const map = await fetchLearnMoreStatusMap();
    setStatusMap(map);
  };

  useEffect(() => {
    void refreshStatusMap();
  }, []);

  // Load active product story on selection change
  useEffect(() => {
    let active = true;
    const baseChoice = allChoices.find((c) => c.story.slug === selectedSlug) || allChoices[0];
    if (!baseChoice) return;

    setStatusMsg(null);
    const initialClone = normalizeLearnMoreContent(clone(baseChoice));
    setWorkingContent(initialClone);
    setBaselineJson(JSON.stringify(initialClone));
    setActiveItemKey("hero");

    async function loadData() {
      try {
        const [published, draft] = await Promise.all([
          fetchPublishedLearnMore(selectedSlug).catch(() => null),
          fetchDraftLearnMore(selectedSlug).catch(() => null),
        ]);
        if (!active) return;
        setPublishedContent(published);
        if (draft) {
          setHasDraft(true);
          const draftClone = clone(draft);
          setWorkingContent(draftClone);
          setBaselineJson(JSON.stringify(draftClone));
        } else if (published) {
          setHasDraft(false);
          const pubClone = clone(published);
          setWorkingContent(pubClone);
          setBaselineJson(JSON.stringify(pubClone));
        } else {
          setHasDraft(false);
          const defClone = clone(baseChoice);
          setWorkingContent(defClone);
          setBaselineJson(JSON.stringify(defClone));
        }
      } catch (err) {
        console.warn("Could not load published/draft data:", err);
      }
    }

    void loadData();
    return () => {
      active = false;
    };
  }, [selectedSlug, allChoices]);

  // Category counts for filter pills
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {
      all: allChoices.length,
      iphone: 0,
      mac: 0,
      ipad: 0,
      watch: 0,
      airpods: 0,
      accessories: 0,
    };
    for (const c of allChoices) {
      const fam = getLearnMoreFamily(c);
      counts[fam] = (counts[fam] || 0) + 1;
    }
    return counts;
  }, [allChoices]);

  // Filtered eligible product choices
  const filteredChoices = useMemo(() => {
    return allChoices.filter((item) => {
      const fam = getLearnMoreFamily(item);
      const publicPath = getLearnMorePublicPath(item);
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        item.story.name.toLowerCase().includes(q) ||
        item.story.slug.toLowerCase().includes(q) ||
        publicPath.toLowerCase().includes(q) ||
        fam.toLowerCase().includes(q);
      if (!matchesSearch) return false;
      if (categoryFilter === "all") return true;
      return fam === categoryFilter;
    });
  }, [allChoices, searchQuery, categoryFilter]);

  const handleSelectProduct = (slug: string) => {
    if (slug === selectedSlug) {
      if (mobileStep === "products") setMobileStep("outline");
      return;
    }
    if (hasUnsavedChanges) {
      const proceed = window.confirm(
        "You have unsaved edits on this Learn More page. Switch product without saving draft?"
      );
      if (!proceed) return;
    }
    setSelectedSlug(slug);
    if (mobileStep === "products") setMobileStep("outline");
  };

  // Load Revisions
  const handleOpenRevisions = async () => {
    setShowRevisionsModal(true);
    setLoadingRevisions(true);
    try {
      const list = await fetchLearnMoreRevisions(selectedSlug);
      setRevisions(list);
    } catch (err: any) {
      setStatusMsg({ text: `Failed to load revisions: ${err.message}`, type: "error" });
    } finally {
      setLoadingRevisions(false);
    }
  };

  // Rollback to specific revision
  const handleRollback = async (revNum: number) => {
    try {
      setIsPublishing(true);
      await rollbackLearnMoreRevision(selectedSlug, revNum);
      const updated = await fetchPublishedLearnMore(selectedSlug);
      setPublishedContent(updated);
      if (updated) {
        const nextClone = clone(updated);
        setWorkingContent(nextClone);
        setBaselineJson(JSON.stringify(nextClone));
      }
      setHasDraft(false);
      setShowRevisionsModal(false);
      await refreshStatusMap();
      setStatusMsg({ text: `Restored and published Revision #${revNum} for ${workingContent?.story.name || selectedSlug}.`, type: "success" });
    } catch (err: any) {
      setStatusMsg({ text: `Revision restore failed: ${err.message}`, type: "error" });
    } finally {
      setIsPublishing(false);
    }
  };

  // Load revision into editor without publishing immediately
  const handleLoadRevisionIntoEditor = (rev: LearnMoreRevision) => {
    if (!rev.content) return;
    const loaded = clone(rev.content);
    setWorkingContent(loaded);
    setShowRevisionsModal(false);
    setStatusMsg({
      text: `Loaded Revision #${rev.revision_number} into the editor. Click "Save Draft" or "Publish Live" to apply.`,
      type: "info",
    });
  };

  // Load Media Library
  const handleOpenMediaLibrary = async (target: {
    sectionId?: string;
    field: string;
    itemIndex?: number;
    galleryAppend?: boolean;
    galleryIndex?: number;
  }) => {
    setMediaTarget(target);
    setShowMediaModal(true);
    setLoadingMedia(true);
    try {
      const files = await listLearnMoreMedia().catch(() => []);
      setMediaLibrary(files);
    } catch {
      setMediaLibrary([]);
    } finally {
      setLoadingMedia(false);
    }
  };

  // Apply media URL to target field
  const applyMedia = async (url: string, target: LearnMoreMediaTarget) => {
    if (!workingContent) return;
    const pageId = workingContent.story.slug;
    const source = getLearnMoreMediaSource(workingContent, target);
    const ratio = target.field === "image" && source ? await imageAspectRatio(source) : undefined;
    setWorkingContent((previous) => previous?.story.slug === pageId
      ? replaceLearnMoreMedia(previous, target, url, ratio) : previous);
  };

  const handleSelectMedia = (url: string) => {
    if (!mediaTarget) return;
    void applyMedia(url, mediaTarget);
    setShowMediaModal(false);
    setMediaTarget(null);
  };

  // Upload file directly
  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    target: {
      sectionId?: string;
      field: string;
      itemIndex?: number;
      galleryAppend?: boolean;
      galleryIndex?: number;
    }
  ): Promise<boolean> => {
    const file = e.target.files?.[0];
    if (!file) return false;
    e.target.value = "";

    try {
      setUploadProgress(0);
      const url = await uploadLearnMoreMedia(file, (pct) => setUploadProgress(pct));
      setUploadProgress(null);

      await applyMedia(url, target);
      setMediaLibrary((prev) => (prev.includes(url) ? prev : [url, ...prev]));
      setStatusMsg({ text: "Media uploaded to Supabase and applied to section.", type: "success" });
      return true;
    } catch (err: any) {
      setUploadProgress(null);
      setStatusMsg({ text: `Upload failed: ${err.message}`, type: "error" });
      return false;
    }
  };

  // Save Draft
  const handleSaveDraft = async () => {
    if (!workingContent) return;
    try {
      setIsSaving(true);
      await saveDraftLearnMore(workingContent);
      setHasDraft(true);
      setBaselineJson(JSON.stringify(workingContent));
      await refreshStatusMap();
      setStatusMsg({
        text: `Draft saved and verified in Supabase for "${workingContent.story.name}".`,
        type: "success",
      });
    } catch (err: any) {
      console.error("Draft save error:", err);
      setStatusMsg({ text: `Failed to save draft: ${err.message}`, type: "error" });
    } finally {
      setIsSaving(false);
    }
  };

  // Publish Live
  const handlePublish = async () => {
    if (!workingContent) return;
    try {
      setIsPublishing(true);
      setStatusMsg({ text: `Publishing and verifying "${workingContent.story.name}" in Supabase...`, type: "info" });
      const { revisionNumber, verifiedContent, persistedSectionIds } = await publishLearnMore(
        workingContent,
        `Published "${workingContent.story.name}" from Visual Learn More Editor on ${new Date().toLocaleString()}`
      );
      // Strictly update publishedContent from the verified read-back content from Supabase
      const pubClone = clone(verifiedContent);
      setPublishedContent(pubClone);
      setWorkingContent(pubClone);
      setBaselineJson(JSON.stringify(pubClone));
      setHasDraft(false);
      await refreshStatusMap();
      setStatusMsg({
        text: `Successfully published & verified "${workingContent.story.name}" (Revision #${revisionNumber}, ${persistedSectionIds.length} live sections) at ${getLearnMorePublicPath(workingContent)}.`,
        type: "success",
      });
    } catch (err: any) {
      console.error("Publishing error:", err);
      setStatusMsg({ text: `Publish failed: ${err.message}`, type: "error" });
    } finally {
      setIsPublishing(false);
    }
  };

  // Unpublish / Revert to Bundled
  const handleUnpublish = async () => {
    if (!window.confirm(`Unpublish custom CMS overrides for "${workingContent?.story.name || selectedSlug}" and revert to default story?`)) return;
    try {
      setIsPublishing(true);
      const draft = await fetchDraftLearnMore(selectedSlug);
      await unpublishLearnMore(selectedSlug);
      setPublishedContent(null);
      const base = allChoices.find((c) => c.story.slug === selectedSlug) || allChoices[0];
      const nextContent = clone(draft || base);
      setWorkingContent(nextContent);
      setBaselineJson(JSON.stringify(nextContent));
      setHasDraft(Boolean(draft));
      await refreshStatusMap();
      setStatusMsg({ text: draft ? "Custom published page removed. Your saved draft is still available." : "Reverted to the default Learn More story.", type: "info" });
    } catch (err: any) {
      setStatusMsg({ text: `Unpublish failed: ${err.message}`, type: "error" });
    } finally {
      setIsPublishing(false);
    }
  };

  // Section Ordering and Management
  const handleMoveSection = (index: number, direction: "up" | "down") => {
    if (!workingContent) return;
    const next = clone(workingContent);
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= next.sections.length) return;

    const [moved] = next.sections.splice(index, 1);
    next.sections.splice(targetIdx, 0, moved);
    setWorkingContent(next);
  };

  const handleReorderSectionDrag = (fromIdx: number, toIdx: number) => {
    if (!workingContent || fromIdx === toIdx) return;
    if (toIdx < 0 || toIdx >= workingContent.sections.length) return;
    const next = clone(workingContent);
    const [moved] = next.sections.splice(fromIdx, 1);
    next.sections.splice(toIdx, 0, moved);
    setWorkingContent(next);
  };

  const handleToggleSectionEnabled = (sectionId: string) => {
    if (!workingContent) return;
    const next = clone(workingContent);
    const sec = next.sections.find((s) => s.id === sectionId);
    if (sec) {
      sec.enabled = !sec.enabled;
      setWorkingContent(next);
    }
  };

  const handleDuplicateSection = (index: number) => {
    if (!workingContent) return;
    const next = clone(workingContent);
    const target = clone(next.sections[index]);
    target.id = createSectionId();
    target.title = `${target.title} (Copy)`;
    target.enabled = true;
    next.sections.splice(index + 1, 0, target);
    setWorkingContent(next);
    setActiveItemKey(target.id);
    setWorkspaceMode("inspector");
    setMobileStep("editor");
  };

  const handleDeleteSection = (sectionId: string) => {
    if (!workingContent) return;
    const next = clone(workingContent);
    next.sections = next.sections.filter((s) => s.id !== sectionId);
    setWorkingContent(next);
    if (activeItemKey === sectionId) setActiveItemKey("hero");
  };

  const handleAddSection = (type: LearnMoreSectionType) => {
    if (!workingContent) return;
    const preset = SECTION_TYPE_PRESETS.find((p) => p.type === type);
    const defaultBuyPath = getStoryBuyPath(workingContent);

    const newSection: LearnMoreSection = {
      id: createSectionId(),
      type,
      enabled: true,
      eyebrow: "",
      title: `Untitled ${preset?.shortName || "Section"}`,
      body: "",
      backgroundColor:
        type === "video" || type === "full-bleed"
          ? "dark"
          : type === "feature-cards" || type === "cta"
          ? "soft-gray"
          : "white",
      textAlignment: type === "text-image" ? "left" : "center",
      layout:
        type === "text-image"
          ? "split-right"
          : type === "feature-cards"
          ? "grid-3"
          : "stacked",
      animationPreset: "none",
      placement: "end",
      fit: type === "full-bleed" ? "cover" : "contain",
      position: "center",
      alt: "",
      buttonLabel: type === "cta" ? `Buy ${workingContent.story.name}` : undefined,
      buttonTo: type === "cta" ? defaultBuyPath : undefined,
      autoplay: type === "video" ? true : undefined,
      muted: type === "video" ? true : undefined,
      loop: type === "video" ? true : undefined,
      controls: type === "video" ? true : undefined,
      items: ["feature-cards", "specifications", "comparison", "finishes"].includes(type) ? [] : undefined,
    };

    const next = clone(workingContent);
    next.sections.push(newSection);
    setWorkingContent(next);
    setActiveItemKey(newSection.id);
    setWorkspaceMode("inspector");
    setMobileStep("editor");
  };

  // Active section helper
  const activeSectionIndex = workingContent?.sections.findIndex((s) => s.id === activeItemKey) ?? -1;
  const activeSection = activeSectionIndex >= 0 ? workingContent?.sections[activeSectionIndex] : undefined;

  // Ordered keys for Prev/Next section navigation
  const outlineKeys = useMemo(() => {
    if (!workingContent) return ["hero"];
    const keys = ["hero"];
    if (workingContent.kind === "editorial" && workingContent.story.cinematicVideo) {
      keys.push("video");
    }
    for (const s of workingContent.sections) {
      keys.push(s.id);
    }
    return keys;
  }, [workingContent]);

  const currentOutlinePos = outlineKeys.indexOf(activeItemKey);

  // Filtered media list for Media Library modal
  const displayedMedia = useMemo(() => {
    let pool: string[] = [];
    if (mediaSourceTab === "uploaded") {
      pool = mediaLibrary;
    } else if (mediaSourceTab === "builtin") {
      pool = builtInMedia;
    } else {
      pool = Array.from(new Set([...mediaLibrary, ...builtInMedia]));
    }
    return pool.filter((url) => {
      const isVid = /\.(mp4|webm)(\?|$)/i.test(url);
      if (mediaFilter === "images" && isVid) return false;
      if (mediaFilter === "videos" && !isVid) return false;
      if (mediaSearch.trim()) {
        return url.toLowerCase().includes(mediaSearch.trim().toLowerCase());
      }
      return true;
    });
  }, [mediaLibrary, builtInMedia, mediaSourceTab, mediaFilter, mediaSearch]);

  const filteredPresets = useMemo(() => {
    if (libraryCategory === "all") return SECTION_TYPE_PRESETS;
    return SECTION_TYPE_PRESETS.filter((p) => p.category === libraryCategory);
  }, [libraryCategory]);

  const currentPublicPath = workingContent ? getLearnMorePublicPath(workingContent) : `/${selectedSlug}`;
  const currentFamily = workingContent ? getLearnMoreFamily(workingContent) : "iphone";

  const renderLivePagePreview = () => {
    if (!workingContent) return null;
    return (
      <div className={`vlearn-device-bezel is-${previewDevice}`}>
        {workingContent.kind === "editorial" ? (
          <MinimalEditorialProductStory
            story={workingContent.story}
            sections={workingContent.sections}
          />
        ) : workingContent.kind === "mac-studio" ? (
          <MacLaunchPage product="mac-studio" preview={workingContent} />
        ) : (
          <CatalogProductStory
            family={workingContent.story.family}
            slug={workingContent.story.slug}
            published={workingContent}
          />
        )}
      </div>
    );
  };

  return (
    <div className="vlearn-container">
      {/* 1. Sticky Action Toolbar */}
      <header className="vlearn-topbar">
        <div className="vlearn-topbar-left">
          <button
            type="button"
            className="vlearn-btn vlearn-btn-icon-label"
            onClick={() => setProductSidebarOpen((prev) => !prev)}
            title={productSidebarOpen ? "Collapse product list for wider workspace" : "Show product list"}
          >
            {productSidebarOpen ? <PanelLeftClose size={16} /> : <PanelLeftOpen size={16} />}
            <span>Products ({allChoices.length})</span>
          </button>

          <div className="vlearn-active-product-meta">
            {workingContent && getLearnMoreHeroThumbnail(workingContent) && (
              <img
                src={getLearnMoreHeroThumbnail(workingContent)}
                alt=""
                className="vlearn-topbar-thumb"
              />
            )}
            <div>
              <div className="vlearn-topbar-title-row">
                <h1 className="vlearn-topbar-title">{workingContent?.story.name || "Learn More CMS"}</h1>
                <a
                  href={currentPublicPath}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="vlearn-public-route-link"
                  title="Open live public Learn More page in new tab"
                >
                  <code>{currentPublicPath}</code>
                  <ExternalLink size={12} />
                </a>
              </div>
              <div className="vlearn-status-badges-row">
                <span className="vlearn-badge vlearn-badge-category">{CATEGORY_LABELS[currentFamily]}</span>
                {publishedContent ? (
                  <span className="vlearn-badge vlearn-badge-published">● Published Live</span>
                ) : (
                  <span className="vlearn-badge vlearn-badge-default">Default Story</span>
                )}
                {hasDraft && !hasUnsavedChanges && (
                  <span className="vlearn-badge vlearn-badge-draft">Draft Saved</span>
                )}
                {hasUnsavedChanges ? (
                  <span className="vlearn-badge vlearn-badge-unsaved" data-testid="unsaved-changes-badge">
                    ● Unsaved Changes
                  </span>
                ) : (
                  <span className="vlearn-badge vlearn-badge-saved">
                    <Check size={11} /> All changes saved
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="vlearn-topbar-center">
          <div className="vlearn-mode-group" role="group" aria-label="Workspace View Mode">
            <button
              type="button"
              className={`vlearn-device-btn ${workspaceMode === "inspector" ? "is-active" : ""}`}
              onClick={() => {
                setWorkspaceMode("inspector");
                setMobileStep("editor");
              }}
              title="Visual Section Editor"
            >
              <Layout size={14} /> Editor
            </button>
            <button
              type="button"
              className={`vlearn-device-btn ${workspaceMode === "split" ? "is-active" : ""}`}
              onClick={() => {
                setWorkspaceMode("split");
                setMobileStep("editor");
              }}
              title="Side-by-Side Editor & Live Page Preview"
            >
              <Columns size={14} /> Split View
            </button>
            <button
              type="button"
              className={`vlearn-device-btn ${workspaceMode === "preview" ? "is-active" : ""}`}
              onClick={() => {
                setWorkspaceMode("preview");
                setMobileStep("preview");
              }}
              title="Full Interactive Page Preview"
            >
              <Eye size={14} /> Live Canvas
            </button>
          </div>

          <div className="vlearn-device-group" role="group" aria-label="Preview Device Viewport">
            <button
              type="button"
              className={`vlearn-device-btn ${previewDevice === "desktop" ? "is-active" : ""}`}
              onClick={() => setPreviewDevice("desktop")}
              title="Desktop Viewport (1280px)"
            >
              <Monitor size={14} /> Desktop
            </button>
            <button
              type="button"
              className={`vlearn-device-btn ${previewDevice === "tablet" ? "is-active" : ""}`}
              onClick={() => setPreviewDevice("tablet")}
              title="Tablet Viewport (768px)"
            >
              <Tablet size={14} /> Tablet
            </button>
            <button
              type="button"
              className={`vlearn-device-btn ${previewDevice === "mobile" ? "is-active" : ""}`}
              onClick={() => setPreviewDevice("mobile")}
              title="Mobile Viewport (375px)"
            >
              <Smartphone size={14} /> Mobile
            </button>
          </div>
        </div>

        <div className="vlearn-topbar-right">
          <button
            type="button"
            className="vlearn-btn vlearn-btn-ghost"
            onClick={handleOpenRevisions}
            title="View revision history and restore previous versions"
          >
            <History size={15} /> Revisions
          </button>

          <button
            type="button"
            className="vlearn-btn"
            onClick={() => setShowPreviewModal(true)}
            title="Open full-screen device preview"
          >
            <Eye size={15} /> Preview
          </button>

          <button
            type="button"
            className="vlearn-btn"
            onClick={handleSaveDraft}
            disabled={isSaving}
          >
            <Save size={15} /> {isSaving ? "Saving..." : "Save Draft"}
          </button>

          <button
            type="button"
            className="vlearn-btn vlearn-btn-primary"
            onClick={handlePublish}
            disabled={isPublishing}
          >
            <Send size={15} /> {isPublishing ? "Publishing..." : "Publish Live"}
          </button>

          {publishedContent && (
            <button
              type="button"
              className="vlearn-btn vlearn-btn-ghost"
              onClick={handleUnpublish}
              title="Revert to default bundled story"
            >
              <RotateCcw size={14} /> Unpublish
            </button>
          )}
        </div>
      </header>

      {/* Responsive Tablet / Mobile Navigation Bar */}
      <nav className="vlearn-mobile-tabs" aria-label="Editor navigation steps">
        <button
          type="button"
          className={`vlearn-mobile-tab ${mobileStep === "products" ? "is-active" : ""}`}
          onClick={() => setMobileStep("products")}
        >
          1. Products ({allChoices.length})
        </button>
        <button
          type="button"
          className={`vlearn-mobile-tab ${mobileStep === "outline" ? "is-active" : ""}`}
          onClick={() => setMobileStep("outline")}
        >
          2. Outline ({(workingContent?.sections.length || 0) + 1})
        </button>
        <button
          type="button"
          className={`vlearn-mobile-tab ${mobileStep === "editor" ? "is-active" : ""}`}
          onClick={() => {
            setWorkspaceMode("inspector");
            setMobileStep("editor");
          }}
        >
          3. Edit Section
        </button>
        <button
          type="button"
          className={`vlearn-mobile-tab ${mobileStep === "preview" ? "is-active" : ""}`}
          onClick={() => {
            setWorkspaceMode("preview");
            setMobileStep("preview");
          }}
        >
          4. Preview
        </button>
      </nav>

      {/* Status Notice & Upload Progress */}
      {uploadProgress !== null && (
        <div className="vlearn-banner vlearn-banner-info">
          <span>Uploading media to Supabase Storage... {uploadProgress}%</span>
        </div>
      )}
      {statusMsg && (
        <div className={`vlearn-banner vlearn-banner-${statusMsg.type}`} role="status">
          <span>{statusMsg.text}</span>
          <button type="button" onClick={() => setStatusMsg(null)} className="vlearn-icon-btn" aria-label="Dismiss notice">
            <X size={14} />
          </button>
        </div>
      )}

      {/* 2. Main Visual CMS Workspace */}
      <div
        className={`vlearn-workspace ${!productSidebarOpen ? "is-sidebar-collapsed" : ""} is-mode-${workspaceMode} is-mobile-step-${mobileStep}`}
      >
        {/* PANEL 1: Eligible Learn More Products Selector (Left) */}
        <aside className="vlearn-left-panel" aria-label="Learn More Products">
          <div className="vlearn-panel-header">
            <div className="vlearn-panel-title-row">
              <h3>Learn More Pages ({filteredChoices.length})</h3>
              <span className="vlearn-panel-subtitle">Public website routes only</span>
            </div>
            <div className="vlearn-search-box">
              <Search size={14} className="vlearn-search-icon" />
              <input
                type="search"
                placeholder="Search product or /route..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="vlearn-search-input"
                aria-label="Search Learn More products"
              />
            </div>
          </div>

          <div className="vlearn-category-chips" role="tablist" aria-label="Filter Learn More pages by category">
            {(["all", "iphone", "mac", "ipad", "watch", "airpods", "accessories"] as const).map((cat) => (
              <button
                key={cat}
                type="button"
                role="tab"
                aria-selected={categoryFilter === cat}
                className={`vlearn-cat-chip ${categoryFilter === cat ? "is-active" : ""}`}
                onClick={() => setCategoryFilter(cat)}
              >
                <span>{CATEGORY_LABELS[cat]}</span>
                <span className="vlearn-cat-count">{categoryCounts[cat] ?? 0}</span>
              </button>
            ))}
          </div>

          <div className="vlearn-product-list">
            {filteredChoices.length === 0 ? (
              <div className="vlearn-empty-filter">
                <p>No Learn More pages match "{searchQuery}".</p>
                <button
                  type="button"
                  className="vlearn-btn"
                  onClick={() => {
                    setSearchQuery("");
                    setCategoryFilter("all");
                  }}
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              filteredChoices.map((choice) => {
                const slug = choice.story.slug;
                const isSelected = slug === selectedSlug;
                const fam = getLearnMoreFamily(choice);
                const publicPath = getLearnMorePublicPath(choice);
                const thumb = getLearnMoreHeroThumbnail(choice);
                const pageStatus = statusMap[slug];
                const isPub = isSelected ? Boolean(publishedContent) : Boolean(pageStatus?.published);
                const isDrf = isSelected ? hasDraft : Boolean(pageStatus?.hasDraft);

                return (
                  <button
                    key={slug}
                    type="button"
                    data-testid={`learn-more-product-${slug}`}
                    className={`vlearn-product-item ${isSelected ? "is-selected" : ""}`}
                    onClick={() => handleSelectProduct(slug)}
                  >
                    <div className="vlearn-prod-thumb">
                      {thumb ? (
                        <img src={thumb} alt={choice.story.name} loading="lazy" />
                      ) : (
                        <Laptop size={18} />
                      )}
                    </div>
                    <div className="vlearn-prod-info">
                      <div className="vlearn-prod-name-row">
                        <span className="vlearn-prod-name">{choice.story.name}</span>
                      </div>
                      <span className="vlearn-prod-slug">{publicPath}</span>
                      <div className="vlearn-prod-badges">
                        <span className="vlearn-mini-tag">{CATEGORY_LABELS[fam]}</span>
                        {isPub ? (
                          <span className="vlearn-mini-status is-published">Published</span>
                        ) : isDrf ? (
                          <span className="vlearn-mini-status is-draft">Draft</span>
                        ) : (
                          <span className="vlearn-mini-status is-default">Live Default</span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </aside>

        {/* PANEL 2: Visual Page Section Outline (Storyboard) */}
        <section className="vlearn-mid-panel" aria-label="Visual Section Outline">
          <div className="vlearn-panel-header vlearn-outline-header">
            <div>
              <h3>Story Outline</h3>
              <span className="vlearn-panel-subtitle">
                {(workingContent?.sections.length || 0) + 1} visual blocks · Click to edit
              </span>
            </div>
            <button
              type="button"
              data-testid="open-add-section-modal"
              className="vlearn-btn vlearn-btn-primary vlearn-add-top-btn"
              onClick={() => setShowAddSectionModal(true)}
            >
              <Plus size={14} /> + Add Section
            </button>
          </div>

          <div className="vlearn-section-cards-list">
            {/* Core Hero Section Card */}
            <div
              data-testid="outline-card-hero"
              className={`vlearn-section-card ${activeItemKey === "hero" ? "is-selected" : ""}`}
              onClick={() => {
                setActiveItemKey("hero");
                setWorkspaceMode("inspector");
                setMobileStep("editor");
              }}
            >
              <div className="vlearn-card-thumb">
                {getHeroImageSrc(workingContent) ? (
                  <img src={getHeroImageSrc(workingContent)} alt={workingContent?.story.name || "Hero"} />
                ) : (
                  <Laptop size={18} />
                )}
              </div>
              <div className="vlearn-card-body">
                <div className="vlearn-card-header">
                  <span className="vlearn-card-type is-core">HERO STAGE</span>
                  <span className="vlearn-card-meta-pill">Pinned Top</span>
                </div>
                <h4 className="vlearn-card-title">{workingContent?.story.name}</h4>
                <p className="vlearn-card-desc">{getStoryTagline(workingContent)}</p>
              </div>
            </div>

            {/* Cinematic Film Card (if present on editorial story) */}
            {workingContent?.kind === "editorial" && workingContent.story.cinematicVideo && (
              <div
                data-testid="outline-card-video"
                className={`vlearn-section-card ${activeItemKey === "video" ? "is-selected" : ""}`}
                onClick={() => {
                  setActiveItemKey("video");
                  setWorkspaceMode("inspector");
                  setMobileStep("editor");
                }}
              >
                <div className="vlearn-card-thumb is-video-thumb">
                  {getCinematicVideoThumbnail(workingContent) ? (
                    <img src={getCinematicVideoThumbnail(workingContent)} alt="Video poster" />
                  ) : (
                    <Video size={18} />
                  )}
                  <span className="vlearn-thumb-video-badge">4K</span>
                </div>
                <div className="vlearn-card-body">
                  <div className="vlearn-card-header">
                    <span className="vlearn-card-type is-video">CINEMATIC VIDEO</span>
                  </div>
                  <h4 className="vlearn-card-title">
                    {workingContent.story.cinematicVideo.headline || "Product Film"}
                  </h4>
                  <p className="vlearn-card-desc">
                    {workingContent.story.cinematicVideo.subheadline || "Autoplaying hardware film"}
                  </p>
                </div>
              </div>
            )}

            {/* Dynamic Storytelling Sections */}
            {workingContent?.sections.map((section, idx) => {
              const isSelected = activeItemKey === section.id;
              const thumb = getSectionThumbnail(section);
              const presetLabel = getSectionPresetLabel(section.type);

              return (
                <div
                  key={section.id}
                  data-testid={`outline-card-section-${idx}`}
                  draggable
                  onDragStart={() => setDraggedSectionIdx(idx)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => {
                    if (draggedSectionIdx !== null && draggedSectionIdx !== idx) {
                      handleReorderSectionDrag(draggedSectionIdx, idx);
                    }
                    setDraggedSectionIdx(null);
                  }}
                  onDragEnd={() => setDraggedSectionIdx(null)}
                  className={`vlearn-section-card ${isSelected ? "is-selected" : ""} ${
                    !section.enabled ? "is-disabled" : ""
                  }`}
                  onClick={() => {
                    setActiveItemKey(section.id);
                    setWorkspaceMode("inspector");
                    setMobileStep("editor");
                  }}
                >
                  <div className="vlearn-card-drag" title="Drag to reorder section">
                    <GripVertical size={15} />
                  </div>

                  <div className="vlearn-card-thumb">
                    {thumb ? (
                      <img src={thumb} alt={section.alt || section.title || ""} loading="lazy" />
                    ) : section.type === "video" ? (
                      <Video size={18} />
                    ) : section.type === "specifications" ? (
                      <Monitor size={18} />
                    ) : section.type === "feature-cards" ? (
                      <Grid size={18} />
                    ) : (
                      <ImageIcon size={18} />
                    )}
                  </div>

                  <div className="vlearn-card-body">
                    <div className="vlearn-card-header">
                      <div className="vlearn-card-badges">
                        <span className="vlearn-card-index">{String(idx + 1).padStart(2, "0")}</span>
                        <span className="vlearn-card-type">{presetLabel}</span>
                        {!section.enabled && <span className="vlearn-card-hidden-pill">Hidden</span>}
                      </div>

                      <div className="vlearn-card-actions" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          className="vlearn-icon-btn"
                          disabled={idx === 0}
                          onClick={() => handleMoveSection(idx, "up")}
                          title="Move section up"
                          aria-label="Move section up"
                        >
                          <ArrowUp size={13} />
                        </button>
                        <button
                          type="button"
                          className="vlearn-icon-btn"
                          disabled={idx === (workingContent?.sections.length || 0) - 1}
                          onClick={() => handleMoveSection(idx, "down")}
                          title="Move section down"
                          aria-label="Move section down"
                        >
                          <ArrowDown size={13} />
                        </button>
                        <button
                          type="button"
                          className="vlearn-icon-btn"
                          onClick={() => handleToggleSectionEnabled(section.id)}
                          title={section.enabled ? "Hide section on storefront" : "Show section on storefront"}
                          aria-label={section.enabled ? "Hide section" : "Show section"}
                        >
                          {section.enabled ? <Eye size={13} /> : <EyeOff size={13} />}
                        </button>
                        <button
                          type="button"
                          className="vlearn-icon-btn"
                          onClick={() => handleDuplicateSection(idx)}
                          title="Duplicate section"
                          aria-label="Duplicate section"
                        >
                          <Copy size={13} />
                        </button>
                        <button
                          type="button"
                          className="vlearn-icon-btn vlearn-icon-btn-danger"
                          onClick={() => handleDeleteSection(section.id)}
                          title="Remove section"
                          aria-label="Remove section"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>

                    <h4 className="vlearn-card-title">{section.title || "Untitled Section"}</h4>
                    <p className="vlearn-card-desc">
                      {section.eyebrow ? `${section.eyebrow} — ` : ""}
                      {section.body || "Visual showcase section"}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Prominent + Add Section Footer Control */}
          <div className="vlearn-add-section-box">
            <button
              type="button"
              className="vlearn-add-btn-prominent"
              onClick={() => setShowAddSectionModal(true)}
            >
              <Plus size={16} /> + Add Section from Visual Library
            </button>
            <div className="vlearn-quick-presets-label">Quick Insert:</div>
            <div className="vlearn-quick-presets-grid">
              {SECTION_TYPE_PRESETS.filter((p) => p.featured).slice(0, 6).map((preset) => (
                <button
                  key={preset.type}
                  type="button"
                  className="vlearn-quick-chip"
                  onClick={() => handleAddSection(preset.type)}
                >
                  <Plus size={11} /> {preset.shortName}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* PANEL 3: Wide Main Visual Editor & Live Preview Workspace */}
        <main className="vlearn-right-panel" aria-label="Main Section Workspace">
          {workspaceMode === "preview" ? (
            <div className="vlearn-inline-canvas-container">
              <div className="vlearn-inline-canvas-toolbar">
                <span>
                  Interactive Live Preview — <strong>{workingContent?.story.name}</strong> ({previewDevice.toUpperCase()})
                </span>
                <button
                  type="button"
                  className="vlearn-btn"
                  onClick={() => {
                    setWorkspaceMode("inspector");
                    setMobileStep("editor");
                  }}
                >
                  Return to Section Editor
                </button>
              </div>
              <div className="vlearn-preview-viewport">{renderLivePagePreview()}</div>
            </div>
          ) : (
            <div className={`vlearn-editor-split-grid ${workspaceMode === "split" ? "is-split" : ""}`}>
              <div className="vlearn-inspector-column">
                {/* Inspector Navigation Header */}
                <div className="vlearn-inspector-topbar">
                  <div className="vlearn-inspector-breadcrumb">
                    <span className="vlearn-crumb-product">{workingContent?.story.name}</span>
                    <span>›</span>
                    <span className="vlearn-crumb-section">
                      {activeItemKey === "hero"
                        ? "Hero Stage"
                        : activeItemKey === "video"
                        ? "Cinematic Video"
                        : activeSection
                        ? `Section ${String(activeSectionIndex + 1).padStart(2, "0")}: ${getSectionPresetLabel(activeSection.type)}`
                        : "Select Section"}
                    </span>
                  </div>

                  <div className="vlearn-inspector-nav-btns">
                    <button
                      type="button"
                      className="vlearn-btn vlearn-btn-sm"
                      disabled={currentOutlinePos <= 0}
                      onClick={() => {
                        if (currentOutlinePos > 0) setActiveItemKey(outlineKeys[currentOutlinePos - 1]);
                      }}
                      title="Previous section"
                    >
                      <ArrowLeft size={13} /> Prev
                    </button>
                    <button
                      type="button"
                      className="vlearn-btn vlearn-btn-sm"
                      disabled={currentOutlinePos < 0 || currentOutlinePos >= outlineKeys.length - 1}
                      onClick={() => {
                        if (currentOutlinePos < outlineKeys.length - 1) {
                          setActiveItemKey(outlineKeys[currentOutlinePos + 1]);
                        }
                      }}
                      title="Next section"
                    >
                      Next <ArrowRight size={13} />
                    </button>
                  </div>
                </div>

                {activeItemKey === "hero" && workingContent ? (
                  <div className="vlearn-inspector-cards">
                    {/* Live Visual Hero Stage Preview Card */}
                    <div
                      className={`vlearn-live-stage-card ${
                        workingContent.kind === "editorial" && workingContent.story.heroTone === "ink"
                          ? "is-dark"
                          : "is-light"
                      }`}
                    >
                      <div className="vlearn-stage-badge">LIVE HERO PREVIEW</div>
                      <div className="vlearn-stage-copy">
                        <span className="vlearn-stage-eyebrow">{workingContent.story.eyebrow}</span>
                        <h3 className="vlearn-stage-headline">{workingContent.story.name}</h3>
                        <p className="vlearn-stage-tagline">{getStoryTagline(workingContent)}</p>
                        <span className="vlearn-stage-cta">{getStoryBuyLabel(workingContent)}</span>
                      </div>
                      {getHeroImageSrc(workingContent) && (
                        <div className="vlearn-stage-art">
                          <img
                            src={getHeroImageSrc(workingContent)}
                            alt={getHeroImageAlt(workingContent)}
                            style={{
                              objectFit: getHeroFit(workingContent),
                              objectPosition: getHeroPosition(workingContent),
                            }}
                          />
                        </div>
                      )}
                    </div>

                    {/* Hero Copy Settings Card */}
                    <div className="vlearn-editor-card">
                      <h3 className="vlearn-card-section-heading">Hero Story &amp; Call-to-Action</h3>
                      <div className="vlearn-grid-2">
                        <div className="vlearn-form-group">
                          <label className="vlearn-form-label">Product Name / Headline</label>
                          <input
                            type="text"
                            className="vlearn-input"
                            value={workingContent.story.name || ""}
                            onChange={(e) => {
                              const next = clone(workingContent);
                              next.story.name = e.target.value;
                              setWorkingContent(next);
                            }}
                          />
                        </div>

                        <div className="vlearn-form-group">
                          <label className="vlearn-form-label">Hero Eyebrow</label>
                          <input
                            type="text"
                            className="vlearn-input"
                            value={workingContent.story.eyebrow || ""}
                            onChange={(e) => {
                              const next = clone(workingContent);
                              next.story.eyebrow = e.target.value;
                              setWorkingContent(next);
                            }}
                          />
                        </div>
                      </div>

                      <div className="vlearn-form-group">
                        <label className="vlearn-form-label">Tagline Statement</label>
                        <textarea
                          className="vlearn-textarea"
                          value={getStoryTagline(workingContent)}
                          onChange={(e) => {
                            const next = clone(workingContent);
                            setStoryTagline(next, e.target.value);
                            setWorkingContent(next);
                          }}
                        />
                      </div>

                      <div className="vlearn-grid-2">
                        <div className="vlearn-form-group">
                          <label className="vlearn-form-label">Buy Button Destination</label>
                          <input
                            type="text"
                            className="vlearn-input"
                            value={getStoryBuyPath(workingContent)}
                            onChange={(e) => {
                              const next = clone(workingContent);
                              setStoryBuyPath(next, e.target.value);
                              setWorkingContent(next);
                            }}
                          />
                        </div>

                        <div className="vlearn-form-group">
                          <label className="vlearn-form-label">Buy Button Label</label>
                          <input
                            type="text"
                            className="vlearn-input"
                            value={getStoryBuyLabel(workingContent)}
                            onChange={(e) => {
                              const next = clone(workingContent);
                              setStoryBuyLabel(next, e.target.value);
                              setWorkingContent(next);
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Hero Image & Positioning Card (supported across all Learn More types) */}
                    <div className="vlearn-editor-card">
                      <h3 className="vlearn-card-section-heading">Hero Image, Alt Text &amp; Positioning</h3>
                      <div className="vlearn-media-picker-card">
                        <div className="vlearn-media-preview-box">
                          {getHeroImageSrc(workingContent) ? (
                            <img
                              src={getHeroImageSrc(workingContent)}
                              alt={getHeroImageAlt(workingContent)}
                              style={{
                                objectFit: getHeroFit(workingContent),
                                objectPosition: getHeroPosition(workingContent),
                              }}
                            />
                          ) : (
                            <span style={{ color: "#86868b" }}>No hero image selected</span>
                          )}
                        </div>

                        <div className="vlearn-media-actions">
                          <label className="vlearn-btn vlearn-btn-primary">
                            <Upload size={14} /> Upload Image
                            <input
                              type="file"
                              accept="image/jpeg,image/png,image/webp,image/avif"
                              style={{ display: "none" }}
                              onChange={(e) => handleFileUpload(e, { field: "heroImage" })}
                            />
                          </label>
                          <button
                            type="button"
                            className="vlearn-btn"
                            onClick={() => handleOpenMediaLibrary({ field: "heroImage" })}
                          >
                            <ImageIcon size={14} /> Choose from Media Library
                          </button>
                        </div>

                        <div className="vlearn-grid-2" style={{ marginTop: 10 }}>
                          <div className="vlearn-form-group" style={{ marginBottom: 0 }}>
                            <label className="vlearn-form-label">Hero Image URL</label>
                            <input
                              type="text"
                              className="vlearn-input"
                              value={getHeroImageSrc(workingContent)}
                              onChange={(e) => {
                                const next = clone(workingContent);
                                setHeroImageSrc(next, e.target.value);
                                setWorkingContent(next);
                              }}
                            />
                          </div>

                          <div className="vlearn-form-group" style={{ marginBottom: 0 }}>
                            <label className="vlearn-form-label">Accessible Alt Text</label>
                            <input
                              type="text"
                              className="vlearn-input"
                              value={getHeroImageAlt(workingContent)}
                              onChange={(e) => {
                                const next = clone(workingContent);
                                setHeroImageAlt(next, e.target.value);
                                setWorkingContent(next);
                              }}
                            />
                          </div>
                        </div>

                        {(workingContent.kind !== "catalog" || workingContent.story.media.type === "image") && (
                          <div className="vlearn-grid-2" style={{ marginTop: 12 }}>
                            <div className="vlearn-form-group" style={{ marginBottom: 0 }}>
                              <label className="vlearn-form-label">Image Fit</label>
                              <select
                                className="vlearn-select"
                                value={getHeroFit(workingContent)}
                                onChange={(e) => {
                                  const next = clone(workingContent);
                                  setHeroFit(next, e.target.value as "contain" | "cover");
                                  setWorkingContent(next);
                                }}
                              >
                                <option value="contain">Contain (Full device visible)</option>
                                <option value="cover">Cover (Fill hero frame)</option>
                              </select>
                            </div>

                            <div className="vlearn-form-group" style={{ marginBottom: 0 }}>
                              <label className="vlearn-form-label">Image Focal Positioning</label>
                              <select
                                className="vlearn-select"
                                value={getHeroPosition(workingContent)}
                                onChange={(e) => {
                                  const next = clone(workingContent);
                                  setHeroPosition(next, e.target.value);
                                  setWorkingContent(next);
                                }}
                              >
                                {FOCAL_POSITIONS.map((fp) => (
                                  <option key={fp.value} value={fp.value}>
                                    {fp.label}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : activeItemKey === "video" && workingContent?.kind === "editorial" && workingContent.story.cinematicVideo ? (
                  <div className="vlearn-inspector-cards">
                    <div className="vlearn-editor-card">
                      <h3 className="vlearn-card-section-heading">Cinematic Film Settings</h3>
                      <div className="vlearn-grid-2">
                        <div className="vlearn-form-group">
                          <label className="vlearn-form-label">Video Headline</label>
                          <input
                            type="text"
                            className="vlearn-input"
                            value={workingContent.story.cinematicVideo.headline || ""}
                            onChange={(e) => {
                              const next = clone(workingContent);
                              if (next.kind === "editorial" && next.story.cinematicVideo) {
                                next.story.cinematicVideo.headline = e.target.value;
                                setWorkingContent(next);
                              }
                            }}
                          />
                        </div>

                        <div className="vlearn-form-group">
                          <label className="vlearn-form-label">Subheadline</label>
                          <input
                            type="text"
                            className="vlearn-input"
                            value={workingContent.story.cinematicVideo.subheadline || ""}
                            onChange={(e) => {
                              const next = clone(workingContent);
                              if (next.kind === "editorial" && next.story.cinematicVideo) {
                                next.story.cinematicVideo.subheadline = e.target.value;
                                setWorkingContent(next);
                              }
                            }}
                          />
                        </div>
                      </div>

                      <div className="vlearn-media-picker-card">
                        <label className="vlearn-form-label">4K Cinematic Video Stream</label>
                        <div className="vlearn-media-preview-box">
                          <video
                            src={workingContent.story.cinematicVideo.src}
                            poster={getCinematicVideoThumbnail(workingContent)}
                            controls
                            muted
                          />
                        </div>
                        <div className="vlearn-media-actions">
                          <label className="vlearn-btn vlearn-btn-primary">
                            <Upload size={14} /> Upload Video (MP4/WebM)
                            <input
                              type="file"
                              accept="video/mp4,video/webm"
                              style={{ display: "none" }}
                              onChange={(e) => handleFileUpload(e, { field: "videoSrc" })}
                            />
                          </label>
                          <button
                            type="button"
                            className="vlearn-btn"
                            onClick={() => handleOpenMediaLibrary({ field: "videoSrc" })}
                          >
                            <Video size={14} /> Select Video from Library
                          </button>
                          <button
                            type="button"
                            className="vlearn-btn"
                            onClick={() => handleOpenMediaLibrary({ field: "videoPoster" })}
                          >
                            <ImageIcon size={14} /> Change Poster Image
                          </button>
                        </div>

                        <div className="vlearn-grid-2" style={{ marginTop: 10 }}>
                          <div className="vlearn-form-group" style={{ marginBottom: 0 }}>
                            <label className="vlearn-form-label">Mobile Video Source (Optional)</label>
                            <input
                              className="vlearn-input"
                              type="text"
                              value={workingContent.story.cinematicVideo.mobileSrc || ""}
                              onChange={(e) => {
                                const next = clone(workingContent);
                                if (next.kind === "editorial" && next.story.cinematicVideo) {
                                  next.story.cinematicVideo.mobileSrc = e.target.value || undefined;
                                  setWorkingContent(next);
                                }
                              }}
                            />
                          </div>
                          <div className="vlearn-form-group" style={{ marginBottom: 0 }}>
                            <label className="vlearn-form-label">Video Alt Description</label>
                            <input
                              className="vlearn-input"
                              type="text"
                              value={workingContent.story.cinematicVideo.alt || ""}
                              onChange={(e) => {
                                const next = clone(workingContent);
                                if (next.kind === "editorial" && next.story.cinematicVideo) {
                                  next.story.cinematicVideo.alt = e.target.value;
                                  setWorkingContent(next);
                                }
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : activeSection && workingContent ? (
                  <div className="vlearn-inspector-cards">
                    {/* Live Visual Section Preview Stage */}
                    <div
                      className={`vlearn-live-stage-card ${
                        activeSection.backgroundColor === "dark"
                          ? "is-dark"
                          : activeSection.backgroundColor === "soft-gray"
                          ? "is-soft-gray"
                          : "is-light"
                      } ${!activeSection.enabled ? "is-hidden-section" : ""}`}
                    >
                      <div className="vlearn-stage-top-bar">
                        <span className="vlearn-stage-badge">
                          SECTION {String(activeSectionIndex + 1).padStart(2, "0")} ·{" "}
                          {getSectionPresetLabel(activeSection.type).toUpperCase()}
                          {activeSection.enabled !== false ? " · LIVE ON STOREFRONT" : " (HIDDEN)"}
                        </span>
                        <div className="vlearn-stage-quick-actions">
                          <button
                            type="button"
                            className={`vlearn-btn vlearn-btn-sm ${activeSection.enabled === false ? "vlearn-btn-primary" : ""}`}
                            onClick={() => handleToggleSectionEnabled(activeSection.id)}
                            title={activeSection.enabled !== false ? "Hide section from storefront" : "Show section on storefront"}
                          >
                            {activeSection.enabled !== false ? <EyeOff size={13} /> : <Eye size={13} />}
                            {activeSection.enabled !== false ? "Hide Section" : "Show Section"}
                          </button>
                          <button
                            type="button"
                            className="vlearn-btn vlearn-btn-sm"
                            onClick={() => handleDuplicateSection(activeSectionIndex)}
                          >
                            <Copy size={13} /> Duplicate
                          </button>
                          <button
                            type="button"
                            className="vlearn-btn vlearn-btn-sm vlearn-btn-danger-outline"
                            onClick={() => handleDeleteSection(activeSection.id)}
                          >
                            <Trash2 size={13} /> Remove
                          </button>
                        </div>
                      </div>

                      <div className={`vlearn-stage-inner is-layout-${activeSection.layout || "stacked"}`}>
                        <div
                          className="vlearn-stage-copy"
                          style={{ textAlign: activeSection.textAlignment || "center" }}
                        >
                          {activeSection.eyebrow && (
                            <span className="vlearn-stage-eyebrow">{activeSection.eyebrow}</span>
                          )}
                          <h3 className="vlearn-stage-headline">
                            {activeSection.title || "Untitled Section"}
                          </h3>
                          {activeSection.body && (
                            <p className="vlearn-stage-tagline">{activeSection.body}</p>
                          )}
                          {activeSection.buttonLabel && (
                            <span className="vlearn-stage-cta">{activeSection.buttonLabel}</span>
                          )}
                        </div>
                        {getSectionThumbnail(activeSection) && (
                          <div className="vlearn-stage-art">
                            <img
                              src={getSectionThumbnail(activeSection)}
                              alt={activeSection.alt || activeSection.title}
                              style={{
                                objectFit: activeSection.fit || "contain",
                                objectPosition: activeSection.position || "center",
                              }}
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Card 1: Section Copy & Typography */}
                    <div className="vlearn-editor-card">
                      <h3 className="vlearn-card-section-heading">1. Story Copy &amp; Headline</h3>
                      <div className="vlearn-grid-2">
                        <div className="vlearn-form-group">
                          <label className="vlearn-form-label">Section Eyebrow</label>
                          <input
                            type="text"
                            data-testid="section-eyebrow-input"
                            className="vlearn-input"
                            value={activeSection.eyebrow}
                            onChange={(e) => {
                              const next = clone(workingContent);
                              const s = next.sections.find((sec) => sec.id === activeSection.id);
                              if (s) s.eyebrow = e.target.value;
                              setWorkingContent(next);
                            }}
                          />
                        </div>

                        <div className="vlearn-form-group">
                          <label className="vlearn-form-label">Section Template Type</label>
                          <select
                            className="vlearn-select"
                            value={activeSection.type}
                            onChange={(e) => {
                              const next = clone(workingContent);
                              const s = next.sections.find((sec) => sec.id === activeSection.id);
                              if (s) s.type = e.target.value as LearnMoreSectionType;
                              setWorkingContent(next);
                            }}
                          >
                            {SECTION_TYPE_PRESETS.map((p) => (
                              <option key={p.type} value={p.type}>
                                {p.shortName} — {p.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="vlearn-form-group">
                          <label className="vlearn-form-label">Placement Slot</label>
                          <select
                            className="vlearn-select"
                            value={activeSection.placement || "end"}
                            onChange={(e) => {
                              const next = clone(workingContent);
                              const s = next.sections.find((sec) => sec.id === activeSection.id);
                              if (s) s.placement = e.target.value;
                              setWorkingContent(next);
                            }}
                          >
                            <option value="end">Bottom of Story (Default)</option>
                            <option value="after-hero">After Hero</option>
                            <option value="after-intro">After Overview / Intro</option>
                            <option value="after-highlights">After Highlights</option>
                            <option value="after-film">After Film</option>
                            <option value="after-design">After Design</option>
                            <option value="after-colors">After Colors</option>
                          </select>
                        </div>
                      </div>

                      <div className="vlearn-form-group">
                        <label className="vlearn-form-label">Section Headline</label>
                        <input
                          type="text"
                          data-testid="section-title-input"
                          className="vlearn-input"
                          value={activeSection.title}
                          onChange={(e) => {
                            const next = clone(workingContent);
                            const s = next.sections.find((sec) => sec.id === activeSection.id);
                            if (s) s.title = e.target.value;
                            setWorkingContent(next);
                          }}
                        />
                      </div>

                      <div className="vlearn-form-group">
                        <label className="vlearn-form-label">Body Story Copy</label>
                        <textarea
                          data-testid="section-body-input"
                          className="vlearn-textarea"
                          value={activeSection.body}
                          onChange={(e) => {
                            const next = clone(workingContent);
                            const s = next.sections.find((sec) => sec.id === activeSection.id);
                            if (s) s.body = e.target.value;
                            setWorkingContent(next);
                          }}
                        />
                      </div>

                      <div className="vlearn-form-group" style={{ marginBottom: 0 }}>
                        <label className="vlearn-form-label">Supporting / Subtitle Text (Optional)</label>
                        <input
                          type="text"
                          className="vlearn-input"
                          placeholder="Secondary editorial note or qualification"
                          value={activeSection.supportingText || ""}
                          onChange={(e) => {
                            const next = clone(workingContent);
                            const s = next.sections.find((sec) => sec.id === activeSection.id);
                            if (s) s.supportingText = e.target.value;
                            setWorkingContent(next);
                          }}
                        />
                      </div>
                    </div>

                    {/* Card 2: Image Upload, Media Library, Alt Text & Positioning Controls */}
                    <div className="vlearn-editor-card">
                      <h3 className="vlearn-card-section-heading">
                        2. Visual Media, Alt Text &amp; Positioning
                      </h3>

                      {activeSection.type === "gallery" ? (
                        <div className="vlearn-media-picker-card">
                          <div className="vlearn-gallery-manager-header">
                            <label className="vlearn-form-label" style={{ margin: 0 }}>
                              Gallery Images ({activeSection.images?.length || 0})
                            </label>
                            <div className="vlearn-media-actions">
                              <label className="vlearn-btn vlearn-btn-primary">
                                <Upload size={14} /> Upload Gallery Image
                                <input
                                  type="file"
                                  accept="image/jpeg,image/png,image/webp,image/avif"
                                  style={{ display: "none" }}
                                  onChange={(e) =>
                                    handleFileUpload(e, {
                                      sectionId: activeSection.id,
                                      field: "images",
                                      galleryAppend: true,
                                    })
                                  }
                                />
                              </label>
                              <button
                                type="button"
                                className="vlearn-btn"
                                onClick={() =>
                                  handleOpenMediaLibrary({
                                    sectionId: activeSection.id,
                                    field: "images",
                                    galleryAppend: true,
                                  })
                                }
                              >
                                <ImageIcon size={14} /> Add from Media Library
                              </button>
                            </div>
                          </div>

                          <div className="vlearn-gallery-editor-grid">
                            {(activeSection.images || []).map((imgUrl, gIdx) => (
                              <div key={`${imgUrl}-${gIdx}`} className="vlearn-gallery-editor-item">
                                <img src={imgUrl} alt="" />
                                <div className="vlearn-gallery-item-bar">
                                  <span>#{gIdx + 1}</span>
                                  <div>
                                    <button
                                      type="button"
                                      className="vlearn-icon-btn"
                                      title="Replace image"
                                      onClick={() =>
                                        handleOpenMediaLibrary({
                                          sectionId: activeSection.id,
                                          field: "images",
                                          galleryIndex: gIdx,
                                        })
                                      }
                                    >
                                      <ImageIcon size={12} />
                                    </button>
                                    <button
                                      type="button"
                                      className="vlearn-icon-btn vlearn-icon-btn-danger"
                                      title="Remove image"
                                      onClick={() => {
                                        const next = clone(workingContent);
                                        const s = next.sections.find((sec) => sec.id === activeSection.id);
                                        if (s?.images) {
                                          s.images.splice(gIdx, 1);
                                          setWorkingContent(next);
                                        }
                                      }}
                                    >
                                      <Trash2 size={12} />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="vlearn-media-picker-card">
                          <div className="vlearn-media-preview-box">
                            {activeSection.video ? (
                              <video src={activeSection.video} poster={activeSection.poster} controls />
                            ) : activeSection.image ? (
                              <img
                                src={activeSection.image}
                                alt={activeSection.alt || ""}
                                style={{
                                  objectFit: activeSection.fit || "contain",
                                  objectPosition: activeSection.position || "center",
                                }}
                              />
                            ) : (
                              <span style={{ color: "#86868b" }}>No media attached to this section</span>
                            )}
                          </div>

                          <div className="vlearn-media-actions">
                            <label className="vlearn-btn vlearn-btn-primary">
                              <Upload size={14} /> Upload Image / Video
                              <input
                                type="file"
                                accept="image/jpeg,image/png,image/webp,image/avif,video/mp4,video/webm"
                                data-testid="section-media-upload-input"
                                style={{ display: "none" }}
                                onChange={(e) => {
                                  const f = e.target.files?.[0];
                                  const isVid = f?.type.startsWith("video/");
                                  void handleFileUpload(e, {
                                    sectionId: activeSection.id,
                                    field: isVid ? "video" : "image",
                                  });
                                }}
                              />
                            </label>
                            <button
                              type="button"
                              data-testid="open-media-library-btn"
                              className="vlearn-btn"
                              onClick={() =>
                                handleOpenMediaLibrary({ sectionId: activeSection.id, field: "image" })
                              }
                            >
                              <ImageIcon size={14} /> Choose Image from Library
                            </button>
                            <button
                              type="button"
                              className="vlearn-btn"
                              onClick={() =>
                                handleOpenMediaLibrary({ sectionId: activeSection.id, field: "video" })
                              }
                            >
                              <Video size={14} /> Choose Video
                            </button>
                            {(activeSection.image || activeSection.video) && (
                              <button
                                type="button"
                                className="vlearn-btn vlearn-btn-danger-outline"
                                onClick={() => {
                                  const next = clone(workingContent);
                                  const s = next.sections.find((sec) => sec.id === activeSection.id);
                                  if (s) {
                                    s.image = undefined;
                                    s.video = undefined;
                                  }
                                  setWorkingContent(next);
                                }}
                              >
                                <Trash2 size={14} /> Remove Media
                              </button>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="vlearn-grid-2" style={{ marginTop: 14 }}>
                        <div className="vlearn-form-group">
                          <label className="vlearn-form-label">Image URL / Asset Path</label>
                          <input
                            type="text"
                            data-testid="section-image-url-input"
                            className="vlearn-input"
                            placeholder="/products/story/..."
                            value={activeSection.image || ""}
                            onFocus={() => {
                              if (activeSection.frameAspectRatio || !activeSection.image) return;
                              const pageId = workingContent.story.slug;
                              const sectionId = activeSection.id;
                              const original = activeSection.image;
                              void imageAspectRatio(original).then((ratio) => {
                                if (!ratio) return;
                                setWorkingContent((previous) => {
                                  if (!previous || previous.story.slug !== pageId) return previous;
                                  const next = clone(previous);
                                  const section = next.sections.find((item) => item.id === sectionId);
                                  if (section && !section.frameAspectRatio) section.frameAspectRatio = ratio;
                                  return next;
                                });
                              });
                            }}
                            onChange={(e) => {
                              setWorkingContent((previous) => previous?.story.slug === workingContent.story.slug
                                ? replaceLearnMoreMedia(previous, { sectionId: activeSection.id, field: "image" }, e.target.value)
                                : previous);
                            }}
                          />
                        </div>

                        <div className="vlearn-form-group">
                          <label className="vlearn-form-label">Image Alt Text (Accessibility)</label>
                          <input
                            type="text"
                            data-testid="section-alt-input"
                            className="vlearn-input"
                            placeholder="Describe the product angle and finish"
                            value={activeSection.alt || ""}
                            onChange={(e) => {
                              const next = clone(workingContent);
                              const s = next.sections.find((sec) => sec.id === activeSection.id);
                              if (s) s.alt = e.target.value;
                              setWorkingContent(next);
                            }}
                          />
                        </div>
                      </div>

                      <div className="vlearn-grid-3">
                        <div className="vlearn-form-group" style={{ marginBottom: 0 }}>
                          <label className="vlearn-form-label">Image Fit</label>
                          <select
                            className="vlearn-select"
                            value={activeSection.fit || "contain"}
                            onChange={(e) => {
                              const next = clone(workingContent);
                              const s = next.sections.find((sec) => sec.id === activeSection.id);
                              if (s) s.fit = e.target.value as "contain" | "cover";
                              setWorkingContent(next);
                            }}
                          >
                            <option value="contain">Contain (Show full product)</option>
                            <option value="cover">Cover (Fill frame)</option>
                          </select>
                        </div>

                        <div className="vlearn-form-group" style={{ marginBottom: 0 }}>
                          <label className="vlearn-form-label">Image Positioning / Focal Point</label>
                          <select
                            data-testid="section-position-select"
                            className="vlearn-select"
                            value={activeSection.position || "center"}
                            onChange={(e) => {
                              const next = clone(workingContent);
                              const s = next.sections.find((sec) => sec.id === activeSection.id);
                              if (s) s.position = e.target.value;
                              setWorkingContent(next);
                            }}
                          >
                            {FOCAL_POSITIONS.map((fp) => (
                              <option key={fp.value} value={fp.value}>
                                {fp.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="vlearn-form-group" style={{ marginBottom: 0 }}>
                          <label className="vlearn-form-label">Mobile Image Override (Optional)</label>
                          <input
                            type="text"
                            className="vlearn-input"
                            placeholder="Optional mobile crop URL"
                            value={activeSection.mobileImage || ""}
                            onChange={(e) => {
                              const next = clone(workingContent);
                              const s = next.sections.find((sec) => sec.id === activeSection.id);
                              if (s) s.mobileImage = e.target.value;
                              setWorkingContent(next);
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Card 3: Layout, Theme & Call-to-Action */}
                    <div className="vlearn-editor-card">
                      <h3 className="vlearn-card-section-heading">3. Layout, Theme &amp; Buy Link</h3>
                      <div className="vlearn-grid-2">
                        <div className="vlearn-form-group">
                          <label className="vlearn-form-label">Background Theme</label>
                          <select
                            className="vlearn-select"
                            value={activeSection.backgroundColor || "white"}
                            onChange={(e) => {
                              const next = clone(workingContent);
                              const s = next.sections.find((sec) => sec.id === activeSection.id);
                              if (s) s.backgroundColor = e.target.value;
                              setWorkingContent(next);
                            }}
                          >
                            <option value="white">Pure White (#ffffff)</option>
                            <option value="soft-gray">Soft Gray (#f5f5f7)</option>
                            <option value="dark">Cinematic Dark (#000000)</option>
                          </select>
                        </div>

                        <div className="vlearn-form-group">
                          <label className="vlearn-form-label">Text Alignment</label>
                          <select
                            className="vlearn-select"
                            value={activeSection.textAlignment || "center"}
                            onChange={(e) => {
                              const next = clone(workingContent);
                              const s = next.sections.find((sec) => sec.id === activeSection.id);
                              if (s) s.textAlignment = e.target.value as "left" | "center" | "right";
                              setWorkingContent(next);
                            }}
                          >
                            <option value="center">Centered</option>
                            <option value="left">Left Aligned</option>
                            <option value="right">Right Aligned</option>
                          </select>
                        </div>
                      </div>

                      <div className="vlearn-grid-2">
                        <div className="vlearn-form-group">
                          <label className="vlearn-form-label">Layout Arrangement</label>
                          <select
                            className="vlearn-select"
                            value={activeSection.layout || "stacked"}
                            onChange={(e) => {
                              const next = clone(workingContent);
                              const s = next.sections.find((sec) => sec.id === activeSection.id);
                              if (s) s.layout = e.target.value as any;
                              setWorkingContent(next);
                            }}
                          >
                            <option value="stacked">Stacked (Copy over visual)</option>
                            <option value="split-left">Split Left (Visual Left, Copy Right)</option>
                            <option value="split-right">Split Right (Copy Left, Visual Right)</option>
                            <option value="grid-2">2-Column Feature Grid</option>
                            <option value="grid-3">3-Column Feature Grid</option>
                            <option value="carousel">Horizontal Carousel Rail</option>
                          </select>
                        </div>

                        <div className="vlearn-form-group">
                          <label className="vlearn-form-label">Scroll Animation</label>
                          <select
                            className="vlearn-select"
                            value={activeSection.animationPreset || "none"}
                            onChange={(e) => {
                              const next = clone(workingContent);
                              const s = next.sections.find((sec) => sec.id === activeSection.id);
                              if (s) s.animationPreset = e.target.value as any;
                              setWorkingContent(next);
                            }}
                          >
                            <option value="none">None (Immediate render)</option>
                            <option value="fade">Fade In</option>
                            <option value="slide-up">Smooth Slide Up</option>
                            <option value="zoom">Subtle Scale / Zoom</option>
                          </select>
                        </div>
                      </div>

                      <div className="vlearn-grid-2">
                        <div className="vlearn-form-group" style={{ marginBottom: 0 }}>
                          <label className="vlearn-form-label">Button Label (Optional)</label>
                          <input
                            type="text"
                            className="vlearn-input"
                            placeholder="e.g. Buy Now, View Pricing"
                            value={activeSection.buttonLabel || ""}
                            onChange={(e) => {
                              const next = clone(workingContent);
                              const s = next.sections.find((sec) => sec.id === activeSection.id);
                              if (s) s.buttonLabel = e.target.value;
                              setWorkingContent(next);
                            }}
                          />
                        </div>

                        <div className="vlearn-form-group" style={{ marginBottom: 0 }}>
                          <label className="vlearn-form-label">
                            <span>Button Destination URL</span>
                            <button
                              type="button"
                              className="vlearn-link-btn"
                              onClick={() => {
                                const next = clone(workingContent);
                                const s = next.sections.find((sec) => sec.id === activeSection.id);
                                if (s) {
                                  s.buttonTo = getStoryBuyPath(workingContent);
                                  if (!s.buttonLabel) s.buttonLabel = `Buy ${workingContent.story.name}`;
                                }
                                setWorkingContent(next);
                              }}
                            >
                              Use Product Buy Page
                            </button>
                          </label>
                          <input
                            type="text"
                            className="vlearn-input"
                            placeholder={getStoryBuyPath(workingContent) || "/shop/buy-..."}
                            value={activeSection.buttonTo || ""}
                            onChange={(e) => {
                              const next = clone(workingContent);
                              const s = next.sections.find((sec) => sec.id === activeSection.id);
                              if (s) s.buttonTo = e.target.value;
                              setWorkingContent(next);
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Card 4: Structured Feature Cards / Specifications / Swatches Items */}
                    <div className="vlearn-editor-card">
                      <div className="vlearn-items-header">
                        <div>
                          <h3 className="vlearn-card-section-heading" style={{ marginBottom: 2 }}>
                            4. Feature Cards, Specs &amp; Swatches ({activeSection.items?.length || 0})
                          </h3>
                          <p className="vlearn-form-hint" style={{ margin: 0 }}>
                            Used by Features, Specifications, Comparison, and Finishes sections.
                          </p>
                        </div>
                        <button
                          type="button"
                          className="vlearn-btn vlearn-btn-sm"
                          onClick={() => {
                            const next = clone(workingContent);
                            const s = next.sections.find((sec) => sec.id === activeSection.id);
                            if (s) {
                              s.items = s.items || [];
                              s.items.push({
                                label: "Feature / Spec",
                                value: "Highlight Title",
                                description: "Detailed specification or feature description.",
                              });
                            }
                            setWorkingContent(next);
                          }}
                        >
                          <Plus size={13} /> Add Item
                        </button>
                      </div>

                      {activeSection.items && activeSection.items.length > 0 ? (
                        <div className="vlearn-subitems-list">
                          {activeSection.items.map((item, itemIdx) => (
                            <div key={itemIdx} className="vlearn-subitem-card">
                              <div className="vlearn-subitem-row">
                                <input
                                  type="text"
                                  className="vlearn-input"
                                  placeholder="Label (e.g. Display, Chip, Finish)"
                                  value={item.label}
                                  onChange={(e) => {
                                    const next = clone(workingContent);
                                    const s = next.sections.find((sec) => sec.id === activeSection.id);
                                    if (s?.items?.[itemIdx]) s.items[itemIdx].label = e.target.value;
                                    setWorkingContent(next);
                                  }}
                                />
                                <input
                                  type="text"
                                  className="vlearn-input"
                                  placeholder={
                                    activeSection.type === "finishes"
                                      ? "Hex Color (e.g. #2b2b2d)"
                                      : "Title / Value (e.g. 120Hz ProMotion)"
                                  }
                                  value={item.value}
                                  onChange={(e) => {
                                    const next = clone(workingContent);
                                    const s = next.sections.find((sec) => sec.id === activeSection.id);
                                    if (s?.items?.[itemIdx]) s.items[itemIdx].value = e.target.value;
                                    setWorkingContent(next);
                                  }}
                                />
                                <button
                                  type="button"
                                  className="vlearn-btn vlearn-btn-sm"
                                  title="Select card image"
                                  onClick={() =>
                                    handleOpenMediaLibrary({
                                      sectionId: activeSection.id,
                                      field: "image",
                                      itemIndex: itemIdx,
                                    })
                                  }
                                >
                                  <ImageIcon size={13} />
                                </button>
                                <button
                                  type="button"
                                  className="vlearn-icon-btn vlearn-icon-btn-danger"
                                  title="Remove item"
                                  onClick={() => {
                                    const next = clone(workingContent);
                                    const s = next.sections.find((sec) => sec.id === activeSection.id);
                                    if (s?.items) {
                                      s.items.splice(itemIdx, 1);
                                      setWorkingContent(next);
                                    }
                                  }}
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                              <input
                                type="text"
                                className="vlearn-input"
                                placeholder="Supporting description (optional)"
                                value={item.description || ""}
                                onChange={(e) => {
                                  const next = clone(workingContent);
                                  const s = next.sections.find((sec) => sec.id === activeSection.id);
                                  if (s?.items?.[itemIdx]) s.items[itemIdx].description = e.target.value;
                                  setWorkingContent(next);
                                }}
                              />
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="vlearn-empty-subitems">
                          No structured sub-items in this section. Click "+ Add Item" to add feature cards, specification rows, or color swatches.
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="vlearn-inspector-empty">
                    <Layers size={40} strokeWidth={1.5} style={{ marginBottom: 12, opacity: 0.4 }} />
                    <h3>Select a Section to Edit</h3>
                    <p>Click on any section card in the Story Outline or add a new section.</p>
                  </div>
                )}
              </div>

              {/* Side-by-Side Live Preview Column when in Split View */}
              {workspaceMode === "split" && (
                <div className="vlearn-split-preview-column">
                  <div className="vlearn-split-preview-header">
                    <span>Live Page Preview ({previewDevice.toUpperCase()})</span>
                    <button
                      type="button"
                      className="vlearn-btn vlearn-btn-sm"
                      onClick={() => setShowPreviewModal(true)}
                    >
                      <Maximize2 size={12} /> Full Screen
                    </button>
                  </div>
                  <div className="vlearn-preview-viewport">{renderLivePagePreview()}</div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* 3. Media Library Modal */}
      {showMediaModal && (
        <div className="vlearn-modal-backdrop" onClick={() => setShowMediaModal(false)}>
          <div className="vlearn-modal-dialog vlearn-media-modal" onClick={(e) => e.stopPropagation()}>
            <div className="vlearn-modal-header">
              <div>
                <h3>Visual Media Library ({displayedMedia.length} assets)</h3>
                <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#6e6e73" }}>
                  Select an existing product image/video or upload a new file directly to Supabase.
                </p>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                {mediaTarget && (
                  <label className="vlearn-btn vlearn-btn-primary">
                    <Upload size={14} /> Upload New File
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/avif,video/mp4,video/webm"
                      style={{ display: "none" }}
                      onChange={(e) => {
                        void handleFileUpload(e, mediaTarget).then((uploaded) => {
                          if (uploaded) setShowMediaModal(false);
                        });
                      }}
                    />
                  </label>
                )}
                <button type="button" className="vlearn-icon-btn" onClick={() => setShowMediaModal(false)}>
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="vlearn-media-toolbar">
              <div className="vlearn-mode-group">
                <button
                  type="button"
                  className={`vlearn-device-btn ${mediaSourceTab === "all" ? "is-active" : ""}`}
                  onClick={() => setMediaSourceTab("all")}
                >
                  All Assets
                </button>
                <button
                  type="button"
                  className={`vlearn-device-btn ${mediaSourceTab === "uploaded" ? "is-active" : ""}`}
                  onClick={() => setMediaSourceTab("uploaded")}
                >
                  Uploaded ({mediaLibrary.length})
                </button>
                <button
                  type="button"
                  className={`vlearn-device-btn ${mediaSourceTab === "builtin" ? "is-active" : ""}`}
                  onClick={() => setMediaSourceTab("builtin")}
                >
                  Product Studio ({builtInMedia.length})
                </button>
              </div>

              <div className="vlearn-mode-group">
                <button
                  type="button"
                  className={`vlearn-device-btn ${mediaFilter === "all" ? "is-active" : ""}`}
                  onClick={() => setMediaFilter("all")}
                >
                  All Types
                </button>
                <button
                  type="button"
                  className={`vlearn-device-btn ${mediaFilter === "images" ? "is-active" : ""}`}
                  onClick={() => setMediaFilter("images")}
                >
                  Images
                </button>
                <button
                  type="button"
                  className={`vlearn-device-btn ${mediaFilter === "videos" ? "is-active" : ""}`}
                  onClick={() => setMediaFilter("videos")}
                >
                  Videos
                </button>
              </div>

              <input
                type="search"
                className="vlearn-search-input"
                style={{ maxWidth: 240 }}
                placeholder="Filter by filename..."
                value={mediaSearch}
                onChange={(e) => setMediaSearch(e.target.value)}
              />
            </div>

            <div className="vlearn-modal-content">
              {loadingMedia ? (
                <div style={{ textAlign: "center", padding: 40, color: "#86868b" }}>
                  Loading assets from Supabase...
                </div>
              ) : displayedMedia.length === 0 ? (
                <div style={{ textAlign: "center", padding: 40, color: "#86868b" }}>
                  No matching media assets found. Use "Upload New File" above to add an image or video.
                </div>
              ) : (
                <div className="vlearn-media-grid">
                  {displayedMedia.map((url) => {
                    const isVid = /\.(mp4|webm)(\?|$)/i.test(url);
                    const fileName = url.split("/").pop()?.split("?")[0] || url;
                    return (
                      <button
                        type="button"
                        key={url}
                        className="vlearn-media-thumb-card"
                        onClick={() => handleSelectMedia(url)}
                        title={`Select ${fileName}`}
                      >
                        <div className="vlearn-media-thumb-stage">
                          {isVid ? <video src={url} muted /> : <img src={url} alt="" loading="lazy" />}
                        </div>
                        <span className="vlearn-media-thumb-name">{fileName}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 4. Revision History Modal */}
      {showRevisionsModal && (
        <div className="vlearn-modal-backdrop" onClick={() => setShowRevisionsModal(false)}>
          <div className="vlearn-modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="vlearn-modal-header">
              <div>
                <h3>Revision History — {workingContent?.story.name}</h3>
                <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#6e6e73" }}>
                  Every publish creates a numbered snapshot in Supabase that can be restored anytime.
                </p>
              </div>
              <button type="button" className="vlearn-icon-btn" onClick={() => setShowRevisionsModal(false)}>
                <X size={18} />
              </button>
            </div>

            <div className="vlearn-modal-content">
              {loadingRevisions ? (
                <div style={{ textAlign: "center", padding: 40, color: "#86868b" }}>Loading revisions...</div>
              ) : revisions.length === 0 ? (
                <div style={{ textAlign: "center", padding: 40, color: "#86868b" }}>
                  No historical revisions recorded for this page yet. Revisions are created automatically whenever you publish changes.
                </div>
              ) : (
                <table className="vlearn-revisions-table">
                  <thead>
                    <tr>
                      <th>Revision</th>
                      <th>Date &amp; Time</th>
                      <th>Sections</th>
                      <th>Notes</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {revisions.map((rev) => (
                      <tr key={rev.id} data-testid={`revision-row-${rev.revision_number}`}>
                        <td>
                          <strong>Rev #{rev.revision_number}</strong>
                        </td>
                        <td>{new Date(rev.created_at).toLocaleString()}</td>
                        <td>{rev.content?.sections?.length ?? 0} sections</td>
                        <td>{rev.notes || "Published version"}</td>
                        <td>
                          <div style={{ display: "flex", gap: 6 }}>
                            <button
                              type="button"
                              className="vlearn-btn vlearn-btn-sm"
                              onClick={() => handleLoadRevisionIntoEditor(rev)}
                            >
                              Load in Editor
                            </button>
                            <button
                              type="button"
                              data-testid={`restore-revision-${rev.revision_number}`}
                              className="vlearn-btn vlearn-btn-sm vlearn-btn-primary"
                              onClick={() => handleRollback(rev.revision_number)}
                            >
                              <RotateCcw size={12} /> Restore Live
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 5. Visual Section Library Modal */}
      {showAddSectionModal && (
        <div className="vlearn-modal-backdrop" onClick={() => setShowAddSectionModal(false)}>
          <div className="vlearn-modal-dialog vlearn-section-library-modal" onClick={(e) => e.stopPropagation()}>
            <div className="vlearn-modal-header">
              <div>
                <h3 style={{ margin: 0, fontSize: "17px", fontWeight: 700 }}>
                  Visual Section Library — Add to {workingContent?.story.name}
                </h3>
                <p style={{ margin: "3px 0 0", fontSize: "12px", color: "#6e6e73" }}>
                  Select a visual storytelling block with live layout preview.
                </p>
              </div>
              <button type="button" className="vlearn-icon-btn" onClick={() => setShowAddSectionModal(false)}>
                <X size={18} />
              </button>
            </div>

            <div className="vlearn-library-filter-bar">
              {(
                [
                  ["all", "All Templates"],
                  ["core", "Storytelling & Features"],
                  ["media", "Hero, Image, Gallery & Video"],
                  ["specs", "Specifications & Buy CTA"],
                ] as const
              ).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  className={`vlearn-cat-chip ${libraryCategory === key ? "is-active" : ""}`}
                  onClick={() => setLibraryCategory(key)}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="vlearn-modal-content">
              <div className="vlearn-section-library-grid">
                {filteredPresets.map((preset) => (
                  <button
                    type="button"
                    key={preset.type}
                    data-testid={`library-preset-${preset.type}`}
                    className={`vlearn-template-card ${preset.featured ? "is-featured" : ""}`}
                    onClick={() => {
                      handleAddSection(preset.type);
                      setShowAddSectionModal(false);
                    }}
                  >
                    <SectionWireframePreview type={preset.type} />
                    <div className="vlearn-template-body">
                      <div className="vlearn-template-title-row">
                        <span className="vlearn-template-short">{preset.shortName}</span>
                        {preset.featured && <span className="vlearn-template-badge">Core</span>}
                      </div>
                      <h4>{preset.label}</h4>
                      <p>{preset.desc}</p>
                    </div>
                    <span className="vlearn-template-cta">
                      <Plus size={13} /> Add {preset.shortName}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. Full-Screen Live Device Preview Modal */}
      {showPreviewModal && workingContent && (
        <div className="vlearn-modal-backdrop vlearn-modal-overlay" onClick={() => setShowPreviewModal(false)}>
          <div
            className="vlearn-modal-dialog"
            style={{ width: "96vw", maxWidth: "1400px", height: "92vh", maxHeight: "92vh" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="vlearn-modal-header">
              <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
                <h3 style={{ margin: 0 }}>Live Preview — {workingContent.story.name}</h3>
                <div className="vlearn-device-group">
                  <button
                    type="button"
                    data-testid="preview-device-desktop"
                    className={`vlearn-device-btn ${previewDevice === "desktop" ? "is-active" : ""}`}
                    onClick={() => setPreviewDevice("desktop")}
                  >
                    <Monitor size={14} /> Desktop (1280px)
                  </button>
                  <button
                    type="button"
                    data-testid="preview-device-tablet"
                    className={`vlearn-device-btn ${previewDevice === "tablet" ? "is-active" : ""}`}
                    onClick={() => setPreviewDevice("tablet")}
                  >
                    <Tablet size={14} /> Tablet (768px)
                  </button>
                  <button
                    type="button"
                    data-testid="preview-device-mobile"
                    className={`vlearn-device-btn ${previewDevice === "mobile" ? "is-active" : ""}`}
                    onClick={() => setPreviewDevice("mobile")}
                  >
                    <Smartphone size={14} /> Mobile (390px)
                  </button>
                </div>
              </div>
              <button
                type="button"
                data-testid="close-preview-modal"
                className="vlearn-icon-btn"
                onClick={() => setShowPreviewModal(false)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="vlearn-preview-viewport">{renderLivePagePreview()}</div>
          </div>
        </div>
      )}
    </div>
  );
}
