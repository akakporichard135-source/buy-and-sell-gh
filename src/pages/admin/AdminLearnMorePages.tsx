import {
  ArrowDown,
  ArrowUp,
  Check,
  Clock,
  Copy,
  Eye,
  EyeOff,
  GripVertical,
  History,
  Image,
  Layers,
  Laptop,
  Maximize2,
  Monitor,
  Plus,
  RotateCcw,
  Save,
  Search,
  Send,
  Smartphone,
  Tablet,
  Trash2,
  Tv,
  Upload,
  Video,
  X,
  Sparkles,
} from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { editorialStories, type EditorialStory } from "../../catalog/editorialStories";
import { defaultEditorialShowcases } from "../../catalog/minimalEditorialSections";
import { useProductCatalog } from "../../catalog/ProductCatalogContext";
import { productFamilies, productStories, type ProductFamilyKey } from "../../catalog/productExperience";
import {
  fetchDraftLearnMore,
  fetchLearnMoreRevisions,
  fetchPublishedLearnMore,
  listLearnMoreMedia,
  publishLearnMore,
  rollbackLearnMoreRevision,
  saveDraftLearnMore,
  unpublishLearnMore,
  uploadLearnMoreMedia,
  type LearnMoreContent,
  type LearnMoreRevision,
  type LearnMoreSection,
  type LearnMoreSectionType,
} from "../../cms/learnMoreRepository";
import { iphone18ProEducation } from "../../data/iphone18ProEducation";
import { macStudioStory } from "../../data/macStudioStory";
import { MinimalEditorialProductStory } from "../../components/MinimalEditorialProductStory";
import { CatalogProductStory, storyFromProduct } from "../ProductStoryPage";
import { MacLaunchPage } from "../MacLaunchPage";
import "../../styles/admin-learn-more.css";

const clone = <T,>(value: T): T => structuredClone(value);

const SECTION_TYPE_PRESETS: { type: LearnMoreSectionType; label: string; icon: string; desc: string }[] = [
  { type: "large-image", label: "Hero Image Showcase", icon: "Image", desc: "Centered beauty product render with bold headline and tagline." },
  { type: "full-bleed", label: "Full-Width Product Image", icon: "Maximize2", desc: "Expansive edge-to-edge product presentation canvas." },
  { type: "text-image", label: "Split Image and Text", icon: "Layers", desc: "Balanced copy alongside a high-res beauty visual." },
  { type: "video", label: "Cinematic Film", icon: "Video", desc: "Autoplaying muted video highlight with poster and responsive mobile video." },
  { type: "gallery", label: "Multi-Angle Gallery", icon: "Image", desc: "Interactive angle carousel of product views on pure white." },
  { type: "hardware-close-up", label: "Hardware Close-Up", icon: "Sparkles", desc: "Detailed close-up beauty shot with tactile highlights." },
  { type: "finishes", label: "Materials & Finishes", icon: "Layers", desc: "Precision anodized chassis colors & swatches." },
  { type: "feature-cards", label: "Product Feature Cards", icon: "Layers", desc: "Rounded feature cards grid with icons & copy." },
  { type: "highlights", label: "Hardware Highlights", icon: "Sparkles", desc: "Horizontal scrolling rail of key features." },
  { type: "performance", label: "Apple Silicon Performance", icon: "Laptop", desc: "M-series / A-series compute benchmarks & neural engine." },
  { type: "battery", label: "All-Day Battery", icon: "Sparkles", desc: "Endurance metrics and power efficiency." },
  { type: "specifications", label: "Technical Specifications", icon: "Monitor", desc: "Detailed hardware grid and verified Accra fulfillment." },
  { type: "comparison", label: "Model Comparison", icon: "Layers", desc: "Side-by-side canvas size & capacity contrast." },
  { type: "scroll-reveal", label: "Scroll-Reveal Story", icon: "Eye", desc: "Immersive storytelling revealed progressively." },
  { type: "sticky-story", label: "Sticky Storytelling", icon: "Layers", desc: "Pinned copy alongside scrolling product visuals." },
  { type: "cta", label: "Direct Buy CTA", icon: "Send", desc: "Seamless transition into live Store purchasing." },
];

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

export function AdminLearnMorePages() {
  const { activeProducts } = useProductCatalog();

  // Combine editorial and catalogue stories
  const allChoices: LearnMoreContent[] = useMemo(() => {
    const directChoices: LearnMoreContent[] = [
      ...Object.values(editorialStories).map((story) => ({
        kind: "editorial" as const,
        story,
        sections: defaultEditorialShowcases(story),
        ...(story.slug === "iphone-18-pro" ? { education: iphone18ProEducation } : {}),
      })),
      ...productStories
        .filter((story) => !editorialStories[story.slug])
        .map((story) => ({ kind: "catalog" as const, story, sections: [] })),
      { kind: "mac-studio" as const, story: macStudioStory, sections: [] },
    ];

    const existingSlugs = new Set(directChoices.map((c) => c.story.slug));
    const extraCatalogChoices: LearnMoreContent[] = activeProducts
      .filter((p) => !existingSlugs.has(p.slug) && !existingSlugs.has(p.id))
      .map((p) => {
        const cat = (p.category || "").toLowerCase();
        const family: ProductFamilyKey =
          cat.includes("phone") ? "iphone"
          : cat.includes("laptop") || cat.includes("mac") ? "mac"
          : cat.includes("tablet") || cat.includes("ipad") ? "ipad"
          : cat.includes("watch") ? "watch"
          : cat.includes("audio") || cat.includes("airpod") ? "airpods"
          : "accessories";

        return {
          kind: "catalog" as const,
          story: storyFromProduct(p, family),
          sections: [],
        };
      });

    return [...directChoices, ...extraCatalogChoices];
  }, [activeProducts]);

  const [selectedSlug, setSelectedSlug] = useState<string>("iphone-18-pro");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const [workingContent, setWorkingContent] = useState<LearnMoreContent | null>(null);
  const [publishedContent, setPublishedContent] = useState<LearnMoreContent | null>(null);
  const [hasDraft, setHasDraft] = useState(false);

  const [activeItemKey, setActiveItemKey] = useState<string>("hero"); // "hero", "video", or section ID
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  // Revisions State
  const [showRevisionsModal, setShowRevisionsModal] = useState(false);
  const [showAddSectionModal, setShowAddSectionModal] = useState(false);
  const [revisions, setRevisions] = useState<LearnMoreRevision[]>([]);
  const [loadingRevisions, setLoadingRevisions] = useState(false);

  // Media Library State
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [mediaLibrary, setMediaLibrary] = useState<string[]>([]);
  const [loadingMedia, setLoadingMedia] = useState(false);
  const [mediaFilter, setMediaFilter] = useState<"all" | "images" | "videos">("all");
  const [mediaTarget, setMediaTarget] = useState<{ sectionId?: string; field: string } | null>(null);

  // Upload state
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ text: string; type: "success" | "error" | "info" } | null>(null);

  // 1. Load active product story on selection change
  useEffect(() => {
    let active = true;
    const baseChoice = allChoices.find((c) => c.story.slug === selectedSlug) || allChoices[0];
    if (!baseChoice) return;

    setStatusMsg(null);
    setWorkingContent(clone(baseChoice));
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
          setWorkingContent(draft);
        } else if (published) {
          setHasDraft(false);
          setWorkingContent(published);
        } else {
          setHasDraft(false);
          setWorkingContent(clone(baseChoice));
        }
      } catch (err) {
        console.warn("Could not load published/draft data:", err);
      }
    }

    loadData();
    return () => {
      active = false;
    };
  }, [selectedSlug, allChoices]);

  // Filtered product choices
  const filteredChoices = useMemo(() => {
    return allChoices.filter((item) => {
      const matchesSearch =
        item.story.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.story.slug.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchesSearch) return false;

      if (categoryFilter === "all") return true;
      const s = item.story.slug.toLowerCase();
      const fam = item.kind === "catalog" ? item.story.family : undefined;

      if (categoryFilter === "mac") return fam === "mac" || s.includes("mac");
      if (categoryFilter === "ipad") return fam === "ipad" || s.includes("ipad");
      if (categoryFilter === "iphone") return fam === "iphone" || s.includes("iphone") || s.includes("phone");
      if (categoryFilter === "watch") return fam === "watch" || s.includes("watch");
      if (categoryFilter === "airpods") return fam === "airpods" || s.includes("airpod") || s.includes("audio");
      if (categoryFilter === "accessories") {
        return fam === "accessories" || s.includes("charger") || s.includes("cable") || s.includes("access") || s.includes("case") || s.includes("keyboard") || s.includes("adapter") || s.includes("power");
      }
      return true;
    });
  }, [allChoices, searchQuery, categoryFilter]);

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
    if (!window.confirm(`Are you sure you want to rollback to Revision #${revNum}? This will publish it immediately.`)) return;
    try {
      setIsPublishing(true);
      await rollbackLearnMoreRevision(selectedSlug, revNum);
      const updated = await fetchPublishedLearnMore(selectedSlug);
      setPublishedContent(updated);
      setWorkingContent(updated ? clone(updated) : workingContent);
      setHasDraft(false);
      setShowRevisionsModal(false);
      setStatusMsg({ text: `Successfully rolled back to Revision #${revNum}!`, type: "success" });
    } catch (err: any) {
      setStatusMsg({ text: `Rollback failed: ${err.message}`, type: "error" });
    } finally {
      setIsPublishing(false);
    }
  };

  // Load Media Library
  const handleOpenMediaLibrary = async (target: { sectionId?: string; field: string }) => {
    setMediaTarget(target);
    setShowMediaModal(true);
    setLoadingMedia(true);
    try {
      const files = await listLearnMoreMedia();
      setMediaLibrary(files);
    } catch (err: any) {
      setStatusMsg({ text: `Failed to list media: ${err.message}`, type: "error" });
    } finally {
      setLoadingMedia(false);
    }
  };

  // Select media from modal
  const applyMedia = (url: string, target: { sectionId?: string; field: string }) => {
    if (!workingContent) return;
    const { sectionId, field } = target;
    const next = clone(workingContent);
    if (!sectionId) {
      // Core hero/video
      if (field === "heroImage" && next.kind === "editorial") {
        next.story.hero.src = url;
      } else if (field === "videoSrc" && next.kind === "editorial" && next.story.cinematicVideo) {
        next.story.cinematicVideo.src = url;
      } else if (field === "mobileVideoSrc" && next.kind === "editorial" && next.story.cinematicVideo) {
        next.story.cinematicVideo.mobileSrc = url;
      } else if (field === "videoPoster" && next.kind === "editorial" && next.story.cinematicVideo) {
        next.story.cinematicVideo.poster = url;
      }
    } else {
      // Specific section
      const sec = next.sections.find((s) => s.id === sectionId);
      if (sec) {
        (sec as any)[field] = url;
      }
    }

    setWorkingContent(next);
  };

  const handleSelectMedia = (url: string) => {
    if (!mediaTarget) return;
    applyMedia(url, mediaTarget);
    setShowMediaModal(false);
    setMediaTarget(null);
  };

  // Upload file directly
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, target: { sectionId?: string; field: string }) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadProgress(0);
      const url = await uploadLearnMoreMedia(file, (pct) => setUploadProgress(pct));
      setUploadProgress(null);

      // Apply uploaded URL
      applyMedia(url, target);
      setStatusMsg({ text: "Media uploaded and applied successfully!", type: "success" });
    } catch (err: any) {
      setUploadProgress(null);
      setStatusMsg({ text: `Upload failed: ${err.message}`, type: "error" });
    }
  };

  // Save Draft
  const handleSaveDraft = async () => {
    if (!workingContent) return;
    try {
      setIsSaving(true);
      await saveDraftLearnMore(workingContent);
      setHasDraft(true);
      setStatusMsg({ text: "Draft saved securely in Supabase.", type: "success" });
    } catch (err: any) {
      setStatusMsg({ text: `Failed to save draft: ${err.message}`, type: "error" });
    } finally {
      setIsSaving(false);
    }
  };

  // Publish
  const handlePublish = async () => {
    if (!workingContent) return;
    if (!window.confirm(`Publish changes to "${workingContent.story.name}"? This makes them live on buyandsellgh.com immediately.`)) return;

    try {
      setIsPublishing(true);
      const revNum = await publishLearnMore(workingContent, `Published from Visual Editor on ${new Date().toLocaleDateString()}`);
      setPublishedContent(clone(workingContent));
      setHasDraft(false);
      setStatusMsg({ text: `Published successfully as Revision #${revNum}! Live at https://buyandsellgh.com`, type: "success" });
    } catch (err: any) {
      setStatusMsg({ text: `Publish failed: ${err.message}`, type: "error" });
    } finally {
      setIsPublishing(false);
    }
  };

  // Unpublish / Revert to Bundled
  const handleUnpublish = async () => {
    if (!window.confirm(`Unpublish custom CMS content for "${selectedSlug}" and revert to default design?`)) return;
    try {
      setIsPublishing(true);
      await unpublishLearnMore(selectedSlug);
      setPublishedContent(null);
      const base = allChoices.find((c) => c.story.slug === selectedSlug) || allChoices[0];
      setWorkingContent(clone(base));
      setHasDraft(false);
      setStatusMsg({ text: "Page reverted to default bundled configuration.", type: "info" });
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
    target.id = crypto.randomUUID();
    target.title = `${target.title} (Copy)`;
    next.sections.splice(index + 1, 0, target);
    setWorkingContent(next);
    setActiveItemKey(target.id);
  };

  const handleDeleteSection = (sectionId: string) => {
    if (!workingContent) return;
    if (!window.confirm("Remove this section from the page?")) return;
    const next = clone(workingContent);
    next.sections = next.sections.filter((s) => s.id !== sectionId);
    setWorkingContent(next);
    if (activeItemKey === sectionId) setActiveItemKey("hero");
  };

  const handleAddSection = (type: LearnMoreSectionType) => {
    if (!workingContent) return;
    const preset = SECTION_TYPE_PRESETS.find((p) => p.type === type);

    const initialItems =
      type === "feature-cards"
        ? [
            { label: "Craftsmanship", value: "Precision Enclosure", description: "Aerospace-grade thermal and structural durability." },
            { label: "Silicon", value: "Neural Acceleration", description: "Dedicated compute blocks for responsive workflows." },
          ]
        : type === "specifications"
        ? [
            { label: "Processor", value: "Apple Silicon", description: "Configurable unified memory architecture." },
            { label: "Display", value: "High-DPI Retina", description: "P3 wide color and extreme dynamic range." },
            { label: "Battery", value: "All-Day Endurance", description: "Optimized efficiency across daily workflows." },
          ]
        : type === "comparison"
        ? [
            { label: "Air Series", value: "Ultraportable", description: "Thin, fanless, light everyday powerhouse." },
            { label: "Pro Series", value: "Maximum Throughput", description: "Active cooling with extreme sustained performance." },
          ]
        : type === "finishes"
        ? [
            { label: "Midnight", value: "#1f242b", description: "Deep anodized finish." },
            { label: "Starlight", value: "#e5ded4", description: "Warm metallic sheen." },
            { label: "Silver", value: "#e3e4e5", description: "Classic clean silver." },
          ]
        : undefined;

    const newSection: LearnMoreSection = {
      id: crypto.randomUUID(),
      type,
      enabled: true,
      eyebrow: preset?.label || "Highlight",
      title: `${preset?.label || "New Section"} Headline`,
      body: "Describe the key craftsmanship, display innovation, or Apple Silicon feature here in compelling detail.",
      backgroundColor: type === "video" || type === "full-bleed" ? "dark" : type === "feature-cards" ? "soft-gray" : "white",
      textAlignment: "center",
      layout: type === "text-image" ? "split-right" : type === "feature-cards" ? "grid-2" : "stacked",
      animationPreset: "slide-up",
      placement: "end",
      fit: "contain",
      items: initialItems,
    };
    const next = clone(workingContent);
    next.sections.push(newSection);
    setWorkingContent(next);
    setActiveItemKey(newSection.id);
  };

  // Active section helper
  const activeSection = workingContent?.sections.find((s) => s.id === activeItemKey);

  return (
    <div className="vlearn-container">
      {/* 1. Sticky Action Toolbar */}
      <header className="vlearn-topbar">
        <div className="vlearn-topbar-left">
          <h1 className="vlearn-topbar-title">{workingContent?.story.name || "Learn More CMS"}</h1>
          {publishedContent ? (
            <span className="vlearn-badge vlearn-badge-published">● Published</span>
          ) : (
            <span className="vlearn-badge" style={{ background: "#eee", color: "#666" }}>Default</span>
          )}
          {hasDraft && <span className="vlearn-badge vlearn-badge-draft">Unsaved Draft</span>}
        </div>

        <div className="vlearn-topbar-center">
          <button
            type="button"
            className={`vlearn-device-btn ${previewDevice === "desktop" ? "is-active" : ""}`}
            onClick={() => setPreviewDevice("desktop")}
            title="Desktop View (1280px)"
          >
            <Monitor size={14} style={{ marginRight: 4 }} /> Desktop
          </button>
          <button
            type="button"
            className={`vlearn-device-btn ${previewDevice === "tablet" ? "is-active" : ""}`}
            onClick={() => setPreviewDevice("tablet")}
            title="Tablet View (768px)"
          >
            <Tablet size={14} style={{ marginRight: 4 }} /> Tablet
          </button>
          <button
            type="button"
            className={`vlearn-device-btn ${previewDevice === "mobile" ? "is-active" : ""}`}
            onClick={() => setPreviewDevice("mobile")}
            title="Mobile View (375px)"
          >
            <Smartphone size={14} style={{ marginRight: 4 }} /> Mobile
          </button>
        </div>

        <div className="vlearn-topbar-right">
          <button
            type="button"
            className="vlearn-btn vlearn-btn-ghost"
            onClick={handleOpenRevisions}
            title="View revision history and rollback"
          >
            <History size={16} /> Revisions
          </button>

          <button
            type="button"
            className="vlearn-btn"
            onClick={() => setShowPreviewModal(true)}
            title="Live device preview"
          >
            <Eye size={16} /> Preview
          </button>

          <button
            type="button"
            className="vlearn-btn"
            onClick={handleSaveDraft}
            disabled={isSaving}
          >
            <Save size={16} /> {isSaving ? "Saving..." : "Save Draft"}
          </button>

          <button
            type="button"
            className="vlearn-btn vlearn-btn-primary"
            onClick={handlePublish}
            disabled={isPublishing}
          >
            <Send size={16} /> {isPublishing ? "Publishing..." : "Publish Live"}
          </button>

          {publishedContent && (
            <button
              type="button"
              className="vlearn-btn vlearn-btn-ghost"
              onClick={handleUnpublish}
              title="Revert to bundled defaults"
            >
              <RotateCcw size={14} /> Unpublish
            </button>
          )}
        </div>
      </header>

      {/* Status Notice */}
      {statusMsg && (
        <div className={`vlearn-banner vlearn-banner-${statusMsg.type}`}>
          <span>{statusMsg.text}</span>
          <button type="button" onClick={() => setStatusMsg(null)} className="vlearn-icon-btn">
            <X size={14} />
          </button>
        </div>
      )}

      {/* 2. Main Three-Panel Workspace */}
      <div className="vlearn-workspace">
        {/* PANEL 1: Product Selection (Left) */}
        <aside className="vlearn-left-panel">
          <div className="vlearn-panel-header">
            <h3>Products ({filteredChoices.length})</h3>
            <input
              type="search"
              placeholder="Filter product story..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="vlearn-search-input"
            />
          </div>

          <div className="vlearn-category-chips">
            {["all", "iphone", "mac", "ipad", "watch", "airpods", "accessories"].map((cat) => (
              <button
                key={cat}
                type="button"
                className={`vlearn-cat-chip ${categoryFilter === cat ? "is-active" : ""}`}
                onClick={() => setCategoryFilter(cat)}
              >
                {cat.toUpperCase()}
              </button>
            ))}
          </div>

          <div className="vlearn-product-list">
            {filteredChoices.map((choice) => {
              const isSelected = choice.story.slug === selectedSlug;
              return (
                <button
                  key={choice.story.slug}
                  type="button"
                  className={`vlearn-product-item ${isSelected ? "is-selected" : ""}`}
                  onClick={() => setSelectedSlug(choice.story.slug)}
                >
                  <div className="vlearn-prod-info">
                    <span className="vlearn-prod-name">{choice.story.name}</span>
                    <span className="vlearn-prod-slug">/{choice.story.slug}</span>
                  </div>
                  <span
                    className={`vlearn-status-dot ${
                      choice.story.slug === selectedSlug && publishedContent
                        ? "is-published"
                        : choice.story.slug === selectedSlug && hasDraft
                        ? "is-draft"
                        : ""
                    }`}
                  />
                </button>
              );
            })}
          </div>
        </aside>

        {/* PANEL 2: Visual Page Section Outline (Middle) */}
        <section className="vlearn-mid-panel">
          <div className="vlearn-panel-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3 style={{ margin: 0 }}>Page Outline &amp; Sections</h3>
            <button
              type="button"
              className="vlearn-btn vlearn-btn-primary"
              style={{ padding: "6px 12px", fontSize: "12px", fontWeight: 700 }}
              onClick={() => setShowAddSectionModal(true)}
            >
              <Plus size={14} /> Add Section
            </button>
          </div>

          <div className="vlearn-section-cards-list">
            {/* Core Hero Section */}
            <div
              className={`vlearn-section-card ${activeItemKey === "hero" ? "is-selected" : ""}`}
              onClick={() => setActiveItemKey("hero")}
            >
              <div className="vlearn-card-drag" style={{ cursor: "default" }}>
                <Laptop size={16} />
              </div>
              <div className="vlearn-card-body">
                <div className="vlearn-card-header">
                  <span className="vlearn-card-type">HERO STAGE</span>
                </div>
                <h4 className="vlearn-card-title">{workingContent?.story.name}</h4>
                <p className="vlearn-card-desc">{getStoryTagline(workingContent)}</p>
              </div>
            </div>

            {/* Cinematic Film (if present) */}
            {workingContent?.kind === "editorial" && workingContent.story.cinematicVideo && (
              <div
                className={`vlearn-section-card ${activeItemKey === "video" ? "is-selected" : ""}`}
                onClick={() => setActiveItemKey("video")}
              >
                <div className="vlearn-card-drag" style={{ cursor: "default" }}>
                  <Video size={16} />
                </div>
                <div className="vlearn-card-body">
                  <div className="vlearn-card-header">
                    <span className="vlearn-card-type">CINEMATIC FILM</span>
                  </div>
                  <h4 className="vlearn-card-title">{workingContent.story.cinematicVideo.headline || "Product Film"}</h4>
                  <p className="vlearn-card-desc">{workingContent.story.cinematicVideo.subheadline || "4K high-resolution showcase"}</p>
                </div>
              </div>
            )}

            {/* Dynamic Custom Sections */}
            {workingContent?.sections.map((section, idx) => {
              const isSelected = activeItemKey === section.id;
              return (
                <div
                  key={section.id}
                  className={`vlearn-section-card ${isSelected ? "is-selected" : ""} ${
                    !section.enabled ? "is-disabled" : ""
                  }`}
                  onClick={() => setActiveItemKey(section.id)}
                >
                  <div className="vlearn-card-drag">
                    <GripVertical size={16} />
                  </div>
                  <div className="vlearn-card-body">
                    <div className="vlearn-card-header">
                      <span className="vlearn-card-type">{section.type}</span>
                      <div className="vlearn-card-actions" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          className="vlearn-icon-btn"
                          disabled={idx === 0}
                          onClick={() => handleMoveSection(idx, "up")}
                          title="Move section up"
                        >
                          <ArrowUp size={14} />
                        </button>
                        <button
                          type="button"
                          className="vlearn-icon-btn"
                          disabled={idx === (workingContent?.sections.length || 0) - 1}
                          onClick={() => handleMoveSection(idx, "down")}
                          title="Move section down"
                        >
                          <ArrowDown size={14} />
                        </button>
                        <button
                          type="button"
                          className="vlearn-icon-btn"
                          onClick={() => handleToggleSectionEnabled(section.id)}
                          title={section.enabled ? "Hide section" : "Show section"}
                        >
                          {section.enabled ? <Eye size={14} /> : <EyeOff size={14} />}
                        </button>
                        <button
                          type="button"
                          className="vlearn-icon-btn"
                          onClick={() => handleDuplicateSection(idx)}
                          title="Duplicate section"
                        >
                          <Copy size={14} />
                        </button>
                        <button
                          type="button"
                          className="vlearn-icon-btn vlearn-icon-btn-danger"
                          onClick={() => handleDeleteSection(section.id)}
                          title="Delete section"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                    <h4 className="vlearn-card-title">{section.title || "Untitled Section"}</h4>
                    <p className="vlearn-card-desc">{section.body}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Add Section Controls */}
          <div className="vlearn-add-section-box">
            <button
              type="button"
              className="vlearn-btn vlearn-btn-primary"
              style={{ width: "100%", justifyContent: "center", padding: "12px", fontSize: "13px", fontWeight: 700, marginBottom: 14 }}
              onClick={() => setShowAddSectionModal(true)}
            >
              <Plus size={16} /> + Add Section
            </button>
            <h4 style={{ margin: "0 0 10px", fontSize: "12px", textTransform: "uppercase", color: "#86868b" }}>
              Quick Templates
            </h4>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
              {SECTION_TYPE_PRESETS.slice(0, 4).map((preset) => (
                <button
                  key={preset.type}
                  type="button"
                  className="vlearn-btn vlearn-preset-btn"
                  style={{ justifyContent: "flex-start", fontSize: "11px", padding: "6px 8px" }}
                  onClick={() => handleAddSection(preset.type)}
                >
                  <Plus size={12} /> {preset.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* PANEL 3: Section Inspector & Settings (Right) */}
        <main className="vlearn-right-panel">
          {activeItemKey === "hero" ? (
            <div>
              <div style={{ borderBottom: "1px solid rgba(0,0,0,0.08)", paddingBottom: 14, marginBottom: 20 }}>
                <h2 style={{ margin: 0, fontSize: "18px", fontWeight: 700 }}>Hero Stage Settings</h2>
                <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#86868b" }}>
                  Configure the primary title, tagline, hero beauty photography, and buy destination.
                </p>
              </div>

              <div className="vlearn-grid-2">
                <div className="vlearn-form-group">
                  <label className="vlearn-form-label">Product Name</label>
                  <input
                    type="text"
                    className="vlearn-input"
                    value={workingContent?.story.name || ""}
                    onChange={(e) => {
                      if (!workingContent) return;
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
                    value={workingContent?.story.eyebrow || ""}
                    onChange={(e) => {
                      if (!workingContent) return;
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
                    if (!workingContent) return;
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
                      if (!workingContent) return;
                      const next = clone(workingContent);
                      setStoryBuyPath(next, e.target.value);
                      setWorkingContent(next);
                    }}
                  />
                </div>

                <div className="vlearn-form-group">
                  <label className="vlearn-form-label">Button Action Label</label>
                  <input
                    type="text"
                    className="vlearn-input"
                    value={getStoryBuyLabel(workingContent)}
                    onChange={(e) => {
                      if (!workingContent) return;
                      const next = clone(workingContent);
                      setStoryBuyLabel(next, e.target.value);
                      setWorkingContent(next);
                    }}
                  />
                </div>
              </div>

              {/* Hero Image Settings */}
              {workingContent?.kind === "editorial" && (
                <div className="vlearn-media-picker-card">
                  <label className="vlearn-form-label">
                    <span>Hero Cinematic Image</span>
                    <span className="vlearn-form-hint">Displayed on pure white background (#ffffff)</span>
                  </label>
                  <div className="vlearn-media-preview-box">
                    {workingContent.story.hero.src ? (
                      <img src={workingContent.story.hero.src} alt={workingContent.story.hero.alt} />
                    ) : (
                      <span style={{ color: "#86868b" }}>No image selected</span>
                    )}
                  </div>

                  <div className="vlearn-media-actions">
                    <button
                      type="button"
                      className="vlearn-btn"
                      onClick={() => handleOpenMediaLibrary({ field: "heroImage" })}
                    >
                      <Image size={14} /> Choose from Media Library
                    </button>
                    <label className="vlearn-btn">
                      <Upload size={14} /> Upload New Image
                      <input
                        type="file"
                        accept="image/*"
                        style={{ display: "none" }}
                        onChange={(e) => handleFileUpload(e, { field: "heroImage" })}
                      />
                    </label>
                  </div>

                  <div className="vlearn-form-group" style={{ marginTop: 10 }}>
                    <label className="vlearn-form-label">Accessible Image Alt Text</label>
                    <input
                      type="text"
                      className="vlearn-input"
                      value={workingContent.story.hero.alt || ""}
                      onChange={(e) => {
                        const next = clone(workingContent);
                        if (next.kind === "editorial") {
                          next.story.hero.alt = e.target.value;
                          setWorkingContent(next);
                        }
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          ) : activeItemKey === "video" && workingContent?.kind === "editorial" && workingContent.story.cinematicVideo ? (
            <div>
              <div style={{ borderBottom: "1px solid rgba(0,0,0,0.08)", paddingBottom: 14, marginBottom: 20 }}>
                <h2 style={{ margin: 0, fontSize: "18px", fontWeight: 700 }}>Cinematic Video Settings</h2>
                <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#86868b" }}>
                  Manage 4K cinematic product showcase video, poster fallback, and autoplay loop.
                </p>
              </div>

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
                <label className="vlearn-form-label">Cinematic Video Asset</label>
                <div className="vlearn-media-preview-box">
                  <video
                    src={workingContent.story.cinematicVideo.src}
                    poster={workingContent.story.cinematicVideo.poster}
                    controls
                    muted
                  />
                </div>
                <div className="vlearn-media-actions">
                  <button
                    type="button"
                    className="vlearn-btn"
                    onClick={() => handleOpenMediaLibrary({ field: "videoSrc" })}
                  >
                    <Video size={14} /> Select Video from Library
                  </button>
                  <label className="vlearn-btn">
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
                    onClick={() => handleOpenMediaLibrary({ field: "videoPoster" })}
                  >
                    <Image size={14} /> Change Poster Image
                  </button>
                </div>
                <div className="vlearn-form-group">
                  <label className="vlearn-form-label">Mobile Video (Optional)</label>
                  <input
                    className="vlearn-input"
                    type="url"
                    value={workingContent.story.cinematicVideo.mobileSrc || ""}
                    onChange={(e) => {
                      const next = clone(workingContent);
                      if (next.kind === "editorial" && next.story.cinematicVideo) {
                        next.story.cinematicVideo.mobileSrc = e.target.value || undefined;
                        setWorkingContent(next);
                      }
                    }}
                  />
                  <div className="vlearn-media-actions">
                    <button type="button" className="vlearn-btn" onClick={() => handleOpenMediaLibrary({ field: "mobileVideoSrc" })}>
                      <Video size={14} /> Select Mobile Video
                    </button>
                    <label className="vlearn-btn">
                      <Upload size={14} /> Upload Mobile Video
                      <input type="file" accept="video/mp4,video/webm" style={{ display: "none" }} onChange={(e) => handleFileUpload(e, { field: "mobileVideoSrc" })} />
                    </label>
                  </div>
                </div>
              </div>
            </div>
          ) : activeSection ? (
            <div>
              <div style={{ borderBottom: "1px solid rgba(0,0,0,0.08)", paddingBottom: 14, marginBottom: 20 }}>
                <h2 style={{ margin: 0, fontSize: "18px", fontWeight: 700 }}>
                  Edit {SECTION_TYPE_PRESETS.find((p) => p.type === activeSection.type)?.label || "Section"}
                </h2>
                <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#86868b" }}>
                  Customize copy, imagery, layout presets, and responsive behavior.
                </p>
              </div>

              <div className="vlearn-grid-2">
                <div className="vlearn-form-group">
                  <label className="vlearn-form-label">Section Eyebrow</label>
                  <input
                    type="text"
                    className="vlearn-input"
                    value={activeSection.eyebrow}
                    onChange={(e) => {
                      const next = clone(workingContent!);
                      const s = next.sections.find((sec) => sec.id === activeSection.id);
                      if (s) s.eyebrow = e.target.value;
                      setWorkingContent(next);
                    }}
                  />
                </div>

                <div className="vlearn-form-group">
                  <label className="vlearn-form-label">Section Type</label>
                  <select
                    className="vlearn-select"
                    value={activeSection.type}
                    onChange={(e) => {
                      const next = clone(workingContent!);
                      const s = next.sections.find((sec) => sec.id === activeSection.id);
                      if (s) s.type = e.target.value as LearnMoreSectionType;
                      setWorkingContent(next);
                    }}
                  >
                    {SECTION_TYPE_PRESETS.map((p) => (
                      <option key={p.type} value={p.type}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="vlearn-form-group">
                <label className="vlearn-form-label">Headline</label>
                <input
                  type="text"
                  className="vlearn-input"
                  value={activeSection.title}
                  onChange={(e) => {
                    const next = clone(workingContent!);
                    const s = next.sections.find((sec) => sec.id === activeSection.id);
                    if (s) s.title = e.target.value;
                    setWorkingContent(next);
                  }}
                />
              </div>

              <div className="vlearn-form-group">
                <label className="vlearn-form-label">Body Story Copy</label>
                <textarea
                  className="vlearn-textarea"
                  value={activeSection.body}
                  onChange={(e) => {
                    const next = clone(workingContent!);
                    const s = next.sections.find((sec) => sec.id === activeSection.id);
                    if (s) s.body = e.target.value;
                    setWorkingContent(next);
                  }}
                />
              </div>

              <div className="vlearn-form-group">
                <label className="vlearn-form-label">Supporting / Subtitle Text (Optional)</label>
                <input
                  type="text"
                  className="vlearn-input"
                  placeholder="Secondary editorial detail or qualification"
                  value={activeSection.supportingText || ""}
                  onChange={(e) => {
                    const next = clone(workingContent!);
                    const s = next.sections.find((sec) => sec.id === activeSection.id);
                    if (s) s.supportingText = e.target.value;
                    setWorkingContent(next);
                  }}
                />
              </div>

              <div className="vlearn-grid-2">
                <div className="vlearn-form-group">
                  <label className="vlearn-form-label">Background Theme</label>
                  <select
                    className="vlearn-select"
                    value={activeSection.backgroundColor || "white"}
                    onChange={(e) => {
                      const next = clone(workingContent!);
                      const s = next.sections.find((sec) => sec.id === activeSection.id);
                      if (s) s.backgroundColor = e.target.value as any;
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
                      const next = clone(workingContent!);
                      const s = next.sections.find((sec) => sec.id === activeSection.id);
                      if (s) s.textAlignment = e.target.value as any;
                      setWorkingContent(next);
                    }}
                  >
                    <option value="center">Center</option>
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
                      const next = clone(workingContent!);
                      const s = next.sections.find((sec) => sec.id === activeSection.id);
                      if (s) s.layout = e.target.value as any;
                      setWorkingContent(next);
                    }}
                  >
                    <option value="stacked">Stacked (Centered copy over media)</option>
                    <option value="split-left">Split Left (Media Left, Copy Right)</option>
                    <option value="split-right">Split Right (Copy Left, Media Right)</option>
                    <option value="grid-2">2-Column Grid</option>
                    <option value="grid-3">3-Column Grid</option>
                    <option value="carousel">Horizontal Carousel Rail</option>
                  </select>
                </div>

                <div className="vlearn-form-group">
                  <label className="vlearn-form-label">Scroll Animation Preset</label>
                  <select
                    className="vlearn-select"
                    value={activeSection.animationPreset || "none"}
                    onChange={(e) => {
                      const next = clone(workingContent!);
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

              {/* Media Picker for Section */}
              <div className="vlearn-media-picker-card">
                <label className="vlearn-form-label">
                  <span>Desktop Media Asset</span>
                  <span className="vlearn-form-hint">JPG, PNG, WebP, AVIF, or MP4</span>
                </label>
                <div className="vlearn-media-preview-box">
                  {activeSection.video ? (
                    <video src={activeSection.video} controls />
                  ) : activeSection.image ? (
                    <img src={activeSection.image} alt={activeSection.alt || ""} />
                  ) : (
                    <span style={{ color: "#86868b" }}>No media attached</span>
                  )}
                </div>

                <div className="vlearn-media-actions">
                  <button
                    type="button"
                    className="vlearn-btn"
                    onClick={() => handleOpenMediaLibrary({ sectionId: activeSection.id, field: "image" })}
                  >
                    <Image size={14} /> Library Image
                  </button>
                  <button
                    type="button"
                    className="vlearn-btn"
                    onClick={() => handleOpenMediaLibrary({ sectionId: activeSection.id, field: "video" })}
                  >
                    <Video size={14} /> Library Video
                  </button>
                  <label className="vlearn-btn">
                    <Upload size={14} /> Upload Media
                    <input
                      type="file"
                      style={{ display: "none" }}
                      onChange={(e) => handleFileUpload(e, { sectionId: activeSection.id, field: "image" })}
                    />
                  </label>
                  {(activeSection.image || activeSection.video) && (
                    <button
                      type="button"
                      className="vlearn-btn"
                      onClick={() => {
                        const next = clone(workingContent!);
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

                <div className="vlearn-grid-2" style={{ marginTop: 10 }}>
                  <div className="vlearn-form-group">
                    <label className="vlearn-form-label">Mobile Asset (Optional)</label>
                    <input
                      type="text"
                      className="vlearn-input"
                      placeholder="Separate mobile URL if needed"
                      value={activeSection.mobileImage || ""}
                      onChange={(e) => {
                        const next = clone(workingContent!);
                        const s = next.sections.find((sec) => sec.id === activeSection.id);
                        if (s) s.mobileImage = e.target.value;
                        setWorkingContent(next);
                      }}
                    />
                  </div>

                  <div className="vlearn-form-group">
                    <label className="vlearn-form-label">Image Alt Text</label>
                    <input
                      type="text"
                      className="vlearn-input"
                      value={activeSection.alt || ""}
                      onChange={(e) => {
                        const next = clone(workingContent!);
                        const s = next.sections.find((sec) => sec.id === activeSection.id);
                        if (s) s.alt = e.target.value;
                        setWorkingContent(next);
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Call to action buttons */}
              <div className="vlearn-grid-2" style={{ marginTop: 14 }}>
                <div className="vlearn-form-group">
                  <label className="vlearn-form-label">Button Label (Optional)</label>
                  <input
                    type="text"
                    className="vlearn-input"
                    placeholder="e.g. Buy Now, Learn More"
                    value={activeSection.buttonLabel || ""}
                    onChange={(e) => {
                      const next = clone(workingContent!);
                      const s = next.sections.find((sec) => sec.id === activeSection.id);
                      if (s) s.buttonLabel = e.target.value;
                      setWorkingContent(next);
                    }}
                  />
                </div>

                <div className="vlearn-form-group">
                  <label className="vlearn-form-label">Button Destination URL</label>
                  <input
                    type="text"
                    className="vlearn-input"
                    placeholder="e.g. /shop/buy-mac/macbook-pro"
                    value={activeSection.buttonTo || ""}
                    onChange={(e) => {
                      const next = clone(workingContent!);
                      const s = next.sections.find((sec) => sec.id === activeSection.id);
                      if (s) s.buttonTo = e.target.value;
                      setWorkingContent(next);
                    }}
                  />
                </div>
              </div>

              {/* Section Sub-items Manager (Cards, Specs, Comparisons, Finishes) */}
              <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid rgba(0,0,0,0.08)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <label className="vlearn-form-label" style={{ margin: 0 }}>
                    Section Data Items ({activeSection.items?.length || 0})
                  </label>
                  <button
                    type="button"
                    className="vlearn-btn"
                    style={{ fontSize: "11px", padding: "4px 8px" }}
                    onClick={() => {
                      const next = clone(workingContent!);
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
                    <Plus size={12} /> Add Item
                  </button>
                </div>

                {activeSection.items && activeSection.items.length > 0 ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {activeSection.items.map((item, itemIdx) => (
                      <div
                        key={itemIdx}
                        style={{
                          background: "#f9f9fa",
                          border: "1px solid rgba(0,0,0,0.08)",
                          borderRadius: 10,
                          padding: 12,
                        }}
                      >
                        <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                          <input
                            type="text"
                            className="vlearn-input"
                            style={{ flex: 1, fontSize: "12px", padding: "6px 8px" }}
                            placeholder="Label (e.g. Finish, Display, M4)"
                            value={item.label}
                            onChange={(e) => {
                              const next = clone(workingContent!);
                              const s = next.sections.find((sec) => sec.id === activeSection.id);
                              if (s?.items?.[itemIdx]) s.items[itemIdx].label = e.target.value;
                              setWorkingContent(next);
                            }}
                          />
                          <input
                            type="text"
                            className="vlearn-input"
                            style={{ flex: 1, fontSize: "12px", padding: "6px 8px" }}
                            placeholder="Value / Title (e.g. Space Black, 120Hz)"
                            value={item.value}
                            onChange={(e) => {
                              const next = clone(workingContent!);
                              const s = next.sections.find((sec) => sec.id === activeSection.id);
                              if (s?.items?.[itemIdx]) s.items[itemIdx].value = e.target.value;
                              setWorkingContent(next);
                            }}
                          />
                          <button
                            type="button"
                            className="vlearn-icon-btn vlearn-icon-btn-danger"
                            title="Remove item"
                            onClick={() => {
                              const next = clone(workingContent!);
                              const s = next.sections.find((sec) => sec.id === activeSection.id);
                              if (s?.items) {
                                s.items.splice(itemIdx, 1);
                                setWorkingContent(next);
                              }
                            }}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                        <input
                          type="text"
                          className="vlearn-input"
                          style={{ fontSize: "11px", padding: "5px 8px" }}
                          placeholder="Description or notes (optional)"
                          value={item.description || ""}
                          onChange={(e) => {
                            const next = clone(workingContent!);
                            const s = next.sections.find((sec) => sec.id === activeSection.id);
                            if (s?.items?.[itemIdx]) s.items[itemIdx].description = e.target.value;
                            setWorkingContent(next);
                          }}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ margin: 0, fontSize: "12px", color: "#86868b" }}>
                    No custom items added yet. Click "+ Add Item" to define feature cards, specs, comparisons, or swatches.
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="vlearn-inspector-empty">
              <Layers size={40} strokeWidth={1.5} style={{ marginBottom: 12, opacity: 0.4 }} />
              <h3>Select a Section to Edit</h3>
              <p>Click on any section card in the middle panel or add a new one.</p>
            </div>
          )}
        </main>
      </div>

      {/* 3. Media Library Modal */}
      {showMediaModal && (
        <div className="vlearn-modal-backdrop" onClick={() => setShowMediaModal(false)}>
          <div className="vlearn-modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="vlearn-modal-header">
              <h3>Media Library ({mediaLibrary.length} assets)</h3>
              <button type="button" className="vlearn-icon-btn" onClick={() => setShowMediaModal(false)}>
                <X size={18} />
              </button>
            </div>

            <div className="vlearn-modal-content">
              {loadingMedia ? (
                <div style={{ textAlign: "center", padding: 40, color: "#86868b" }}>Loading assets from Supabase...</div>
              ) : mediaLibrary.length === 0 ? (
                <div style={{ textAlign: "center", padding: 40, color: "#86868b" }}>
                  No media in the Supabase <code>learn-more-media</code> bucket yet. Upload images or videos above.
                </div>
              ) : (
                <div className="vlearn-media-grid">
                  {mediaLibrary.map((url) => {
                    const isVid = url.endsWith(".mp4") || url.endsWith(".webm");
                    return (
                      <div
                        key={url}
                        className="vlearn-media-thumb-card"
                        onClick={() => handleSelectMedia(url)}
                        title="Click to select this asset"
                      >
                        {isVid ? <video src={url} muted /> : <img src={url} alt="" loading="lazy" />}
                      </div>
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
              <h3>Revision History — {workingContent?.story.name}</h3>
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
                      <th>Revision #</th>
                      <th>Date &amp; Time</th>
                      <th>Author</th>
                      <th>Notes</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {revisions.map((rev) => (
                      <tr key={rev.id}>
                        <td>
                          <strong>Rev #{rev.revision_number}</strong>
                        </td>
                        <td>{new Date(rev.created_at).toLocaleString()}</td>
                        <td>{rev.author_email || "Admin"}</td>
                        <td>{rev.notes || "Published version"}</td>
                        <td>
                          <button
                            type="button"
                            className="vlearn-btn"
                            style={{ fontSize: "12px", padding: "4px 8px" }}
                            onClick={() => handleRollback(rev.revision_number)}
                          >
                            <RotateCcw size={12} /> Restore
                          </button>
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

      {/* 5. Section Library Modal */}
      {showAddSectionModal && (
        <div className="vlearn-modal-backdrop" onClick={() => setShowAddSectionModal(false)}>
          <div className="vlearn-modal-dialog vlearn-section-library-modal" onClick={(e) => e.stopPropagation()}>
            <div className="vlearn-modal-header">
              <div>
                <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 700 }}>Section Library — Add Section</h3>
                <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#86868b" }}>
                  Choose a layout template to add to {workingContent?.story.name}.
                </p>
              </div>
              <button type="button" className="vlearn-icon-btn" onClick={() => setShowAddSectionModal(false)}>
                <X size={18} />
              </button>
            </div>

            <div className="vlearn-modal-content">
              <div className="vlearn-section-library-grid">
                {SECTION_TYPE_PRESETS.map((preset) => {
                  const IconComp =
                    preset.icon === "Image" ? Image :
                    preset.icon === "Video" ? Video :
                    preset.icon === "Maximize2" ? Maximize2 :
                    preset.icon === "Laptop" ? Laptop :
                    preset.icon === "Monitor" ? Monitor :
                    preset.icon === "Sparkles" ? Sparkles :
                    preset.icon === "Send" ? Send : Layers;

                  return (
                    <div
                      key={preset.type}
                      className="vlearn-template-card"
                      onClick={() => {
                        handleAddSection(preset.type);
                        setShowAddSectionModal(false);
                      }}
                    >
                      <div className="vlearn-template-icon">
                        <IconComp size={20} />
                      </div>
                      <div className="vlearn-template-body">
                        <h4>{preset.label}</h4>
                        <p>{preset.desc}</p>
                      </div>
                      <button
                        type="button"
                        className="vlearn-btn vlearn-btn-secondary"
                        style={{ fontSize: "11px", padding: "4px 10px", marginTop: "auto", width: "fit-content" }}
                      >
                        <Plus size={12} /> Add to Page
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. Live Device Preview Modal */}
      {showPreviewModal && workingContent && (
        <div className="vlearn-modal-backdrop vlearn-modal-overlay" onClick={() => setShowPreviewModal(false)}>
          <div
            className="vlearn-modal-dialog"
            style={{ width: "95vw", height: "92vh", maxHeight: "92vh" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="vlearn-modal-header">
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <h3 style={{ margin: 0 }}>Preview: {workingContent.story.name}</h3>
                <div className="vlearn-topbar-center">
                  <button
                    type="button"
                    className={`vlearn-device-btn ${previewDevice === "desktop" ? "is-active" : ""}`}
                    onClick={() => setPreviewDevice("desktop")}
                  >
                    Desktop
                  </button>
                  <button
                    type="button"
                    className={`vlearn-device-btn ${previewDevice === "tablet" ? "is-active" : ""}`}
                    onClick={() => setPreviewDevice("tablet")}
                  >
                    Tablet
                  </button>
                  <button
                    type="button"
                    className={`vlearn-device-btn ${previewDevice === "mobile" ? "is-active" : ""}`}
                    onClick={() => setPreviewDevice("mobile")}
                  >
                    Mobile
                  </button>
                </div>
              </div>
              <button type="button" className="vlearn-icon-btn" onClick={() => setShowPreviewModal(false)}>
                <X size={18} />
              </button>
            </div>

            <div className="vlearn-preview-viewport">
              <div className={`vlearn-device-bezel is-${previewDevice}`}>
                {workingContent.kind === "editorial" ? (
                  <MinimalEditorialProductStory
                    story={workingContent.story}
                    sections={workingContent.sections}
                  />
                ) : workingContent.kind === "mac-studio" ? (
                  <MacLaunchPage product="mac-studio" />
                ) : (
                  <CatalogProductStory
                    family={workingContent.story.family}
                    slug={workingContent.story.slug}
                    published={workingContent}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
