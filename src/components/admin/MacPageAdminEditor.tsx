import {
  AlertCircle,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  CheckCircle2,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Layers,
  Monitor,
  Plus,
  RotateCcw,
  Save,
  Smartphone,
  Sparkles,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { defaultMacPageConfig, defaultMacPageSections } from "../../cms/macPageDefaults";
import type {
  MacBenefitCard,
  MacChapterNavItem,
  MacEcosystemItem,
  MacLineupCard,
  MacPageConfig,
  MacPageSection,
  MacPromoSplitCard,
  MediaItem,
} from "../../cms/types";
import type { Product } from "../../types/product";
import { MacPageRenderer } from "../store/mac/MacPageRenderer";

export type MacAdminSubTab =
  | "sections"
  | "heroNav"
  | "lineup"
  | "whyShop"
  | "showcases"
  | "ecosystem"
  | "directory";

interface MacPageAdminEditorProps {
  activeSubTab: MacAdminSubTab;
  config: MacPageConfig;
  setConfig: React.Dispatch<React.SetStateAction<MacPageConfig>>;
  hasDraft: boolean;
  onSaveDraft: (cfg: MacPageConfig) => Promise<unknown>;
  onPublishLive: (cfg: MacPageConfig) => Promise<unknown>;
  onDiscardDraft: () => Promise<unknown>;
  uploadMedia: (file: File, category: MediaItem["category"], title?: string) => Promise<MediaItem>;
  onOpenMediaPicker: (onSelect: (item: MediaItem) => void) => void;
  products: Product[];
}

function moveArr<T extends { order: number }>(list: T[], idx: number, dir: -1 | 1): T[] {
  const next = idx + dir;
  if (next < 0 || next >= list.length) return list;
  const copy = [...list];
  const [item] = copy.splice(idx, 1);
  copy.splice(next, 0, item);
  return copy.map((el, i) => ({ ...el, order: i }));
}

export function MacPageAdminEditor({
  activeSubTab,
  config,
  setConfig,
  hasDraft,
  onSaveDraft,
  onPublishLive,
  onDiscardDraft,
  uploadMedia,
  onOpenMediaPicker,
  products,
}: MacPageAdminEditorProps) {
  const [busyAction, setBusyAction] = useState<"draft" | "publish" | null>(null);
  const [statusBanner, setStatusBanner] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [previewMode, setPreviewMode] = useState<"none" | "desktop" | "mobile">("none");
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);
  const [editingCustomSectionId, setEditingCustomSectionId] = useState<string | null>(null);

  const macAndAccProducts = useMemo(
    () =>
      products.filter(
        (p) =>
          p.category === "MacBooks" ||
          p.category === "Accessories" ||
          (p.name || "").toLowerCase().includes("mac")
      ),
    [products]
  );

  const sections = useMemo(
    () => [...(config.sections || defaultMacPageSections)].sort((a, b) => a.order - b.order),
    [config.sections]
  );

  const handleUploadImage = async (key: string, file: File, onUrl: (url: string, alt: string) => void) => {
    setUploadingKey(key);
    try {
      const uploaded = await uploadMedia(file, "storefront", `Mac Page - ${key}`);
      onUrl(uploaded.url, uploaded.alt || uploaded.title);
    } catch (err) {
      setStatusBanner({
        type: "error",
        text: err instanceof Error ? err.message : "Image upload failed.",
      });
    } finally {
      setUploadingKey(null);
    }
  };

  const runAction = async (kind: "draft" | "publish") => {
    setBusyAction(kind);
    setStatusBanner(null);
    try {
      if (kind === "draft") {
        await onSaveDraft(config);
        setStatusBanner({ type: "success", text: "Mac page draft saved. Preview before publishing live." });
      } else {
        await onPublishLive(config);
        setStatusBanner({ type: "success", text: "Mac page published live! Changes now appear on /mac." });
      }
    } catch (err) {
      setStatusBanner({
        type: "error",
        text: err instanceof Error ? err.message : "Failed to save Mac page.",
      });
    } finally {
      setBusyAction(null);
    }
  };

  const addCustomSection = (type: "promotional-banner" | "featured-mac-products" | "image-text") => {
    const newSec: MacPageSection = {
      id: `mac-custom-${Date.now()}`,
      type,
      eyebrow: type === "featured-mac-products" ? "CURATED MAC PICKS" : "SPECIAL HIGHLIGHT",
      heading:
        type === "featured-mac-products"
          ? "Featured Mac Deals in Accra."
          : type === "image-text"
          ? "Built for Creators in Ghana."
          : "Trade In & Save on Your Next Mac.",
      subtitle: "Verified Apple silicon hardware ready at Dome Pillar 2.",
      description: "Edit heading, copy, image, product assignments, and buttons right here.",
      desktopImage: "/products/mac-redesign/help-me-choose-hero.webp",
      mobileImage: "/products/mac-redesign/help-me-choose-hero.webp",
      imageAlt: "Mac showcase visual",
      backgroundColor: "#ffffff",
      productIds: type === "featured-mac-products" ? ["macbook-neo", "macbook-air-13-inch-m4"] : [],
      buttonLabel: "Explore Now",
      buttonDestination: "/sell-or-trade",
      visible: true,
      order: sections.length,
    };
    setConfig((prev) => ({ ...prev, sections: [...sections, newSec] }));
    setEditingCustomSectionId(newSec.id);
  };

  const renderImageControls = (
    key: string,
    currentUrl: string,
    currentAlt: string,
    onChange: (url: string, alt?: string) => void,
    defaultUrl?: string
  ) => (
    <div className="space-y-2">
      <div className="aspect-[16/10] bg-[#f5f5f7] rounded-xl border border-slate-200 flex items-center justify-center p-2 overflow-hidden">
        {currentUrl ? (
          <img src={currentUrl} alt={currentAlt} className="max-h-full max-w-full object-contain" />
        ) : (
          <span className="text-xs text-slate-400">No Image</span>
        )}
      </div>
      <div className="flex items-center gap-2">
        <label className="flex-1 py-1.5 px-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-[0.7rem] flex items-center justify-center gap-1.5 cursor-pointer">
          <Upload size={13} />
          <span>{uploadingKey === key ? "Uploading..." : "Upload"}</span>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            className="hidden"
            disabled={uploadingKey !== null}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void handleUploadImage(key, f, (url, alt) => onChange(url, alt));
            }}
          />
        </label>
        <button
          type="button"
          onClick={() => onOpenMediaPicker((item) => onChange(item.url, item.alt || item.title))}
          className="flex-1 py-1.5 px-2 rounded-lg bg-[#d4af37]/15 hover:bg-[#d4af37]/25 text-amber-900 font-bold text-[0.7rem] flex items-center justify-center gap-1.5"
        >
          <ImageIcon size={13} />
          <span>Library</span>
        </button>
        {defaultUrl && currentUrl !== defaultUrl && (
          <button
            type="button"
            onClick={() => onChange(defaultUrl)}
            title="Reset to default studio asset"
            className="p-1.5 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100"
          >
            <RotateCcw size={13} />
          </button>
        )}
      </div>
    </div>
  );

  const editingCustomSection = sections.find((s) => s.id === editingCustomSectionId) || null;

  return (
    <div className="space-y-6" data-testid="mac-admin-editor">
      {/* Persistent Top Action & Live Preview Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full bg-slate-900 text-white text-[0.65rem] font-bold uppercase">
              Mac Page CMS
            </span>
            {hasDraft && (
              <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[0.65rem] font-bold">
                Unpublished Draft
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            All sections, headings, studio imagery, live product links, and order publish directly to <code className="text-slate-700">/mac</code>.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            data-testid="mac-admin-preview-desktop"
            onClick={() => setPreviewMode((m) => (m === "desktop" ? "none" : "desktop"))}
            className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition ${
              previewMode === "desktop"
                ? "bg-slate-900 text-white border-slate-900"
                : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
            }`}
          >
            <Monitor size={14} /> Desktop Preview
          </button>
          <button
            type="button"
            data-testid="mac-admin-preview-mobile"
            onClick={() => setPreviewMode((m) => (m === "mobile" ? "none" : "mobile"))}
            className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition ${
              previewMode === "mobile"
                ? "bg-slate-900 text-white border-slate-900"
                : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
            }`}
          >
            <Smartphone size={14} /> Mobile Preview
          </button>
          <button
            type="button"
            disabled={busyAction !== null}
            onClick={() => void runAction("draft")}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-900 flex items-center gap-1.5"
          >
            <Save size={14} /> {busyAction === "draft" ? "Saving..." : "Save Draft"}
          </button>
          {hasDraft && (
            <button
              type="button"
              onClick={() => void onDiscardDraft()}
              className="px-3 py-2 rounded-xl text-xs font-bold bg-rose-50 hover:bg-rose-100 text-rose-700"
            >
              Discard Draft
            </button>
          )}
          <button
            type="button"
            disabled={busyAction !== null}
            data-testid="mac-admin-publish-btn"
            onClick={() => void runAction("publish")}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-[#d8a72d] hover:bg-[#c69520] active:bg-[#b17d12] text-[#111111] flex items-center gap-1.5 shadow-sm transition"
          >
            <Sparkles size={14} /> {busyAction === "publish" ? "Publishing..." : "Publish Mac Page"}
          </button>
        </div>
      </div>

      {statusBanner && (
        <div
          className={`p-3.5 rounded-xl text-xs font-semibold flex items-center gap-2 border ${
            statusBanner.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-rose-50 border-rose-200 text-rose-800"
          }`}
        >
          {statusBanner.type === "success" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          <span>{statusBanner.text}</span>
        </div>
      )}

      {/* Live Preview Panel — Renders the EXACT same MacPageRenderer as live /mac! */}
      {previewMode !== "none" && (
        <div
          className="rounded-2xl border-2 border-slate-900/15 bg-slate-100 p-4 space-y-3"
          data-testid={`mac-admin-preview-frame-${previewMode}`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Live {previewMode === "mobile" ? "Mobile (390px)" : "Desktop (1440px)"} Mac Page Preview — 100% Parity
            </span>
            <button
              type="button"
              onClick={() => setPreviewMode("none")}
              className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-700 flex items-center gap-1"
            >
              <X size={13} /> Close Preview
            </button>
          </div>
          <div className="overflow-x-auto flex justify-center">
            <div
              className="bg-white rounded-2xl shadow-xl overflow-y-auto border border-slate-200"
              style={{
                width: previewMode === "mobile" ? 390 : "100%",
                maxWidth: previewMode === "mobile" ? 390 : 1440,
                maxHeight: 740,
              }}
            >
              <MacPageRenderer
                configOverride={config}
                productsOverride={products}
                previewDevice={previewMode}
              />
            </div>
          </div>
        </div>
      )}

      {/* ==================== TAB 1: SECTIONS BUILDER ==================== */}
      {activeSubTab === "sections" && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Mac Page Section Order &amp; Visibility ({sections.length} Sections)
              </h3>
              <p className="text-xs text-slate-500">
                Reorder sections, hide/unpublish any section, or add custom Mac promotional banners &amp; product collections.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => addCustomSection("promotional-banner")}
                className="px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-bold flex items-center gap-1.5"
              >
                <Plus size={13} /> Add Banner Section
              </button>
              <button
                type="button"
                onClick={() => addCustomSection("featured-mac-products")}
                className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-900 text-xs font-bold flex items-center gap-1.5"
              >
                <Plus size={13} /> Add Product Collection
              </button>
              <button
                type="button"
                onClick={() => setConfig(defaultMacPageConfig)}
                className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold flex items-center gap-1.5"
              >
                <RotateCcw size={13} /> Reset Defaults
              </button>
            </div>
          </div>

          <div className="space-y-2.5">
            {sections.map((sec, idx) => (
              <div
                key={sec.id}
                className="p-3.5 rounded-2xl bg-white border border-slate-200 flex flex-wrap items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 text-xs font-bold flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900 truncate">{sec.heading}</span>
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-[0.65rem] font-semibold text-slate-600">
                        {sec.builtInKey ? "Built-in" : sec.type}
                      </span>
                      {!sec.visible && (
                        <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 text-[0.65rem] font-bold">
                          Hidden
                        </span>
                      )}
                    </div>
                    {sec.subtitle && <div className="text-xs text-slate-500 truncate">{sec.subtitle}</div>}
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    disabled={idx === 0}
                    onClick={() => setConfig((prev) => ({ ...prev, sections: moveArr(sections, idx, -1) }))}
                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-40"
                    title="Move Up"
                  >
                    <ArrowUp size={14} />
                  </button>
                  <button
                    type="button"
                    disabled={idx === sections.length - 1}
                    onClick={() => setConfig((prev) => ({ ...prev, sections: moveArr(sections, idx, 1) }))}
                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-40"
                    title="Move Down"
                  >
                    <ArrowDown size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setConfig((prev) => ({
                        ...prev,
                        sections: sections.map((s) => (s.id === sec.id ? { ...s, visible: !s.visible } : s)),
                      }))
                    }
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 ${
                      sec.visible ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {sec.visible ? <Eye size={13} /> : <EyeOff size={13} />}
                    <span>{sec.visible ? "Visible" : "Hidden"}</span>
                  </button>
                  {!sec.builtInKey && (
                    <>
                      <button
                        type="button"
                        onClick={() => setEditingCustomSectionId(sec.id)}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-bold"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setConfig((prev) => ({
                            ...prev,
                            sections: sections
                              .filter((s) => s.id !== sec.id)
                              .map((s, i) => ({ ...s, order: i })),
                          }))
                        }
                        className="p-1.5 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100"
                        title="Remove Section"
                      >
                        <Trash2 size={14} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Custom Section Editor Drawer */}
          {editingCustomSection && (
            <div className="p-5 rounded-2xl bg-white border-2 border-slate-900/20 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm text-slate-900">
                  Editing Custom Section: {editingCustomSection.heading}
                </h4>
                <button
                  type="button"
                  onClick={() => setEditingCustomSectionId(null)}
                  className="p-1 rounded-lg bg-slate-100"
                >
                  <X size={15} />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <input
                    className="admin-input w-full"
                    placeholder="Eyebrow"
                    value={editingCustomSection.eyebrow || ""}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        sections: sections.map((s) =>
                          s.id === editingCustomSection.id ? { ...s, eyebrow: e.target.value } : s
                        ),
                      }))
                    }
                  />
                  <input
                    className="admin-input w-full"
                    placeholder="Section Heading"
                    value={editingCustomSection.heading}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        sections: sections.map((s) =>
                          s.id === editingCustomSection.id ? { ...s, heading: e.target.value } : s
                        ),
                      }))
                    }
                  />
                  <input
                    className="admin-input w-full"
                    placeholder="Subtitle"
                    value={editingCustomSection.subtitle || ""}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        sections: sections.map((s) =>
                          s.id === editingCustomSection.id ? { ...s, subtitle: e.target.value } : s
                        ),
                      }))
                    }
                  />
                  <textarea
                    className="admin-input w-full"
                    rows={3}
                    placeholder="Description"
                    value={editingCustomSection.description || ""}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        sections: sections.map((s) =>
                          s.id === editingCustomSection.id ? { ...s, description: e.target.value } : s
                        ),
                      }))
                    }
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      className="admin-input"
                      placeholder="Button Label"
                      value={editingCustomSection.buttonLabel || ""}
                      onChange={(e) =>
                        setConfig((prev) => ({
                          ...prev,
                          sections: sections.map((s) =>
                            s.id === editingCustomSection.id ? { ...s, buttonLabel: e.target.value } : s
                          ),
                        }))
                      }
                    />
                    <input
                      className="admin-input"
                      placeholder="Destination (/sell-or-trade)"
                      value={editingCustomSection.buttonDestination || ""}
                      onChange={(e) =>
                        setConfig((prev) => ({
                          ...prev,
                          sections: sections.map((s) =>
                            s.id === editingCustomSection.id ? { ...s, buttonDestination: e.target.value } : s
                          ),
                        }))
                      }
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  {renderImageControls(
                    `custom-${editingCustomSection.id}`,
                    editingCustomSection.desktopImage || "",
                    editingCustomSection.imageAlt || "",
                    (url, alt) =>
                      setConfig((prev) => ({
                        ...prev,
                        sections: sections.map((s) =>
                          s.id === editingCustomSection.id
                            ? { ...s, desktopImage: url, mobileImage: url, imageAlt: alt || s.imageAlt }
                            : s
                        ),
                      }))
                  )}
                  <div>
                    <label className="text-xs font-bold text-slate-600 block mb-1">
                      Assign Real Mac Products (optional)
                    </label>
                    <div className="max-h-36 overflow-y-auto border border-slate-200 rounded-xl p-2 space-y-1">
                      {macAndAccProducts.map((p) => {
                        const checked = (editingCustomSection.productIds || []).includes(p.slug);
                        return (
                          <label key={p.id} className="flex items-center gap-2 text-xs cursor-pointer">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => {
                                const current = editingCustomSection.productIds || [];
                                const next = checked
                                  ? current.filter((x) => x !== p.slug)
                                  : [...current, p.slug];
                                setConfig((prev) => ({
                                  ...prev,
                                  sections: sections.map((s) =>
                                    s.id === editingCustomSection.id ? { ...s, productIds: next } : s
                                  ),
                                }));
                              }}
                            />
                            <span className="truncate">{p.name}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ==================== TAB 2: HERO, RIBBON & CHAPTER NAV ==================== */}
      {activeSubTab === "heroNav" && (
        <div className="space-y-6">
          <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Top Announcement Ribbon &amp; Mac Hero</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-600">Hero Heading</label>
                <input
                  className="admin-input w-full"
                  value={config.hero.heading}
                  onChange={(e) => setConfig((prev) => ({ ...prev, hero: { ...prev.hero, heading: e.target.value } }))}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-600">Promo Ribbon Text</label>
                <input
                  className="admin-input w-full"
                  value={config.promoRibbon.text}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      promoRibbon: { ...prev.promoRibbon, text: e.target.value },
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-600">Ribbon Link Label</label>
                <input
                  className="admin-input w-full"
                  value={config.promoRibbon.linkLabel}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      promoRibbon: { ...prev.promoRibbon, linkLabel: e.target.value },
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-600">Ribbon Link Destination</label>
                <input
                  className="admin-input w-full"
                  value={config.promoRibbon.linkTo}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      promoRibbon: { ...prev.promoRibbon, linkTo: e.target.value },
                    }))
                  }
                />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">
                Mac Chapter Navigation Icons ({config.chapterNavItems.length})
              </h3>
              <button
                type="button"
                onClick={() => {
                  const nextItem: MacChapterNavItem = {
                    id: `nav-${Date.now()}`,
                    label: "New Shortcut",
                    image: "/products/mac-redesign/nav-all-mac.webp",
                    alt: "Mac shortcut",
                    to: "/mac",
                    visible: true,
                    order: config.chapterNavItems.length,
                  };
                  setConfig((prev) => ({ ...prev, chapterNavItems: [...prev.chapterNavItems, nextItem] }));
                }}
                className="px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-bold flex items-center gap-1"
              >
                <Plus size={13} /> Add Icon
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {config.chapterNavItems.map((item, idx) => (
                <div key={item.id} className="p-4 rounded-2xl bg-white border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">#{idx + 1} {item.label}</span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() =>
                          setConfig((prev) => ({ ...prev, chapterNavItems: moveArr(prev.chapterNavItems, idx, -1) }))
                        }
                        className="p-1 rounded bg-slate-100 disabled:opacity-30"
                      >
                        <ArrowLeft size={12} />
                      </button>
                      <button
                        type="button"
                        disabled={idx === config.chapterNavItems.length - 1}
                        onClick={() =>
                          setConfig((prev) => ({ ...prev, chapterNavItems: moveArr(prev.chapterNavItems, idx, 1) }))
                        }
                        className="p-1 rounded bg-slate-100 disabled:opacity-30"
                      >
                        <ArrowRight size={12} />
                      </button>
                    </div>
                  </div>
                  {renderImageControls(
                    `chap-${item.id}`,
                    item.image,
                    item.alt,
                    (url, alt) =>
                      setConfig((prev) => ({
                        ...prev,
                        chapterNavItems: prev.chapterNavItems.map((c, i) =>
                          i === idx ? { ...c, image: url, alt: alt || c.alt } : c
                        ),
                      })),
                    defaultMacPageConfig.chapterNavItems[idx]?.image
                  )}
                  <input
                    className="admin-input w-full text-xs"
                    placeholder="Label"
                    value={item.label}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        chapterNavItems: prev.chapterNavItems.map((c, i) =>
                          i === idx ? { ...c, label: e.target.value } : c
                        ),
                      }))
                    }
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      className="admin-input text-xs"
                      placeholder="Badge (e.g. New)"
                      value={item.badge || ""}
                      onChange={(e) =>
                        setConfig((prev) => ({
                          ...prev,
                          chapterNavItems: prev.chapterNavItems.map((c, i) =>
                            i === idx ? { ...c, badge: e.target.value } : c
                          ),
                        }))
                      }
                    />
                    <input
                      className="admin-input text-xs"
                      placeholder="Destination"
                      value={item.to}
                      onChange={(e) =>
                        setConfig((prev) => ({
                          ...prev,
                          chapterNavItems: prev.chapterNavItems.map((c, i) =>
                            i === idx ? { ...c, to: e.target.value } : c
                          ),
                        }))
                      }
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ==================== TAB 3: EXPLORE THE LINEUP CARDS ==================== */}
      {activeSubTab === "lineup" && (
        <div className="space-y-5">
          <div className="p-4 rounded-2xl bg-white border border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <div className="flex-1 min-w-[220px]">
              <label className="text-xs font-bold text-slate-600 block mb-1">Lineup Section Heading</label>
              <input
                className="admin-input w-full"
                value={config.lineupSection.heading}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    lineupSection: { ...prev.lineupSection, heading: e.target.value },
                  }))
                }
              />
            </div>
            <button
              type="button"
              onClick={() => {
                const newCard: MacLineupCard = {
                  id: `lineup-${Date.now()}`,
                  category: "laptops",
                  title: "New Mac Model",
                  chipLine: "Apple silicon",
                  description: "Powerful performance verified at Buy & Sell GH.",
                  image: "/products/mac-redesign/lineup-macbook-air-13.webp",
                  alt: "Mac model",
                  learnMoreLabel: "Learn more",
                  learnMoreTo: "/mac",
                  buyLabel: "Buy",
                  buyTo: "/mac",
                  visible: true,
                  order: config.lineupSection.cards.length,
                };
                setConfig((prev) => ({
                  ...prev,
                  lineupSection: { ...prev.lineupSection, cards: [...prev.lineupSection.cards, newCard] },
                }));
              }}
              className="px-3.5 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold flex items-center gap-1.5"
            >
              <Plus size={14} /> Add Lineup Card
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {config.lineupSection.cards.map((card, idx) => (
              <div key={card.id} className="p-4 rounded-2xl bg-white border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">
                    #{idx + 1} • {card.category.toUpperCase()}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() =>
                        setConfig((prev) => ({
                          ...prev,
                          lineupSection: { ...prev.lineupSection, cards: moveArr(prev.lineupSection.cards, idx, -1) },
                        }))
                      }
                      className="p-1 rounded bg-slate-100 disabled:opacity-30"
                    >
                      <ArrowLeft size={12} />
                    </button>
                    <button
                      type="button"
                      disabled={idx === config.lineupSection.cards.length - 1}
                      onClick={() =>
                        setConfig((prev) => ({
                          ...prev,
                          lineupSection: { ...prev.lineupSection, cards: moveArr(prev.lineupSection.cards, idx, 1) },
                        }))
                      }
                      className="p-1 rounded bg-slate-100 disabled:opacity-30"
                    >
                      <ArrowRight size={12} />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setConfig((prev) => ({
                          ...prev,
                          lineupSection: {
                            ...prev.lineupSection,
                            cards: prev.lineupSection.cards
                              .filter((_, i) => i !== idx)
                              .map((c, i) => ({ ...c, order: i })),
                          },
                        }))
                      }
                      className="p-1 rounded bg-rose-50 text-rose-700"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>

                {renderImageControls(
                  `lineup-${card.id}`,
                  card.image,
                  card.alt,
                  (url, alt) =>
                    setConfig((prev) => ({
                      ...prev,
                      lineupSection: {
                        ...prev.lineupSection,
                        cards: prev.lineupSection.cards.map((c, i) =>
                          i === idx ? { ...c, image: url, alt: alt || c.alt } : c
                        ),
                      },
                    })),
                  defaultMacPageConfig.lineupSection.cards[idx]?.image
                )}

                <div className="space-y-2">
                  <select
                    className="admin-input w-full text-xs"
                    value={card.productSlug || ""}
                    onChange={(e) => {
                      const slug = e.target.value;
                      const prod = macAndAccProducts.find((p) => p.slug === slug);
                      setConfig((prev) => ({
                        ...prev,
                        lineupSection: {
                          ...prev.lineupSection,
                          cards: prev.lineupSection.cards.map((c, i) =>
                            i === idx
                              ? {
                                  ...c,
                                  productSlug: slug || undefined,
                                  buyTo: prod
                                    ? prod.category === "Accessories"
                                      ? `/shop/buy-accessory/${prod.slug}`
                                      : `/shop/buy-mac/${prod.slug}`
                                    : c.buyTo,
                                }
                              : c
                          ),
                        },
                      }));
                    }}
                  >
                    <option value="">-- Link Live Supabase Product (Auto GH₵ Price) --</option>
                    {macAndAccProducts.map((p) => (
                      <option key={p.id} value={p.slug}>
                        {p.name} ({p.condition})
                      </option>
                    ))}
                  </select>

                  <div className="grid grid-cols-2 gap-2">
                    <select
                      className="admin-input text-xs"
                      value={card.category}
                      onChange={(e) =>
                        setConfig((prev) => ({
                          ...prev,
                          lineupSection: {
                            ...prev.lineupSection,
                            cards: prev.lineupSection.cards.map((c, i) =>
                              i === idx ? { ...c, category: e.target.value } : c
                            ),
                          },
                        }))
                      }
                    >
                      <option value="laptops">Laptops</option>
                      <option value="desktops">Desktops</option>
                      <option value="accessories">Accessories</option>
                    </select>
                    <input
                      className="admin-input text-xs"
                      placeholder="Badge (e.g. New)"
                      value={card.badge || ""}
                      onChange={(e) =>
                        setConfig((prev) => ({
                          ...prev,
                          lineupSection: {
                            ...prev.lineupSection,
                            cards: prev.lineupSection.cards.map((c, i) =>
                              i === idx ? { ...c, badge: e.target.value } : c
                            ),
                          },
                        }))
                      }
                    />
                  </div>

                  <input
                    className="admin-input w-full text-xs font-bold"
                    placeholder="Card Title"
                    value={card.title}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        lineupSection: {
                          ...prev.lineupSection,
                          cards: prev.lineupSection.cards.map((c, i) =>
                            i === idx ? { ...c, title: e.target.value } : c
                          ),
                        },
                      }))
                    }
                  />
                  <input
                    className="admin-input w-full text-xs"
                    placeholder="Chip / Subtitle"
                    value={card.chipLine || ""}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        lineupSection: {
                          ...prev.lineupSection,
                          cards: prev.lineupSection.cards.map((c, i) =>
                            i === idx ? { ...c, chipLine: e.target.value } : c
                          ),
                        },
                      }))
                    }
                  />
                  <textarea
                    className="admin-input w-full text-xs"
                    rows={2}
                    placeholder="Short description"
                    value={card.description}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        lineupSection: {
                          ...prev.lineupSection,
                          cards: prev.lineupSection.cards.map((c, i) =>
                            i === idx ? { ...c, description: e.target.value } : c
                          ),
                        },
                      }))
                    }
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      className="admin-input text-xs"
                      placeholder="Learn more link"
                      value={card.learnMoreTo}
                      onChange={(e) =>
                        setConfig((prev) => ({
                          ...prev,
                          lineupSection: {
                            ...prev.lineupSection,
                            cards: prev.lineupSection.cards.map((c, i) =>
                              i === idx ? { ...c, learnMoreTo: e.target.value } : c
                            ),
                          },
                        }))
                      }
                    />
                    <input
                      className="admin-input text-xs"
                      placeholder="Buy link"
                      value={card.buyTo}
                      onChange={(e) =>
                        setConfig((prev) => ({
                          ...prev,
                          lineupSection: {
                            ...prev.lineupSection,
                            cards: prev.lineupSection.cards.map((c, i) =>
                              i === idx ? { ...c, buyTo: e.target.value } : c
                            ),
                          },
                        }))
                      }
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==================== TAB 4: WHY BUY & SELL GH BENEFIT CARDS ==================== */}
      {activeSubTab === "whyShop" && (
        <div className="space-y-5">
          <div className="p-4 rounded-2xl bg-white border border-slate-200 grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-2">
              <label className="text-xs font-bold text-slate-600 block mb-1">Section Heading</label>
              <input
                className="admin-input w-full"
                value={config.whyShopSection.heading}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    whyShopSection: { ...prev.whyShopSection, heading: e.target.value },
                  }))
                }
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1">Top-Right Link Label</label>
              <input
                className="admin-input w-full"
                value={config.whyShopSection.actionLabel}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    whyShopSection: { ...prev.whyShopSection, actionLabel: e.target.value },
                  }))
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {config.whyShopSection.cards.map((card: MacBenefitCard, idx: number) => (
              <div key={card.id} className="p-4 rounded-2xl bg-white border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">#{idx + 1} {card.eyebrow}</span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() =>
                        setConfig((prev) => ({
                          ...prev,
                          whyShopSection: { ...prev.whyShopSection, cards: moveArr(prev.whyShopSection.cards, idx, -1) },
                        }))
                      }
                      className="p-1 rounded bg-slate-100 disabled:opacity-30"
                    >
                      <ArrowLeft size={12} />
                    </button>
                    <button
                      type="button"
                      disabled={idx === config.whyShopSection.cards.length - 1}
                      onClick={() =>
                        setConfig((prev) => ({
                          ...prev,
                          whyShopSection: { ...prev.whyShopSection, cards: moveArr(prev.whyShopSection.cards, idx, 1) },
                        }))
                      }
                      className="p-1 rounded bg-slate-100 disabled:opacity-30"
                    >
                      <ArrowRight size={12} />
                    </button>
                  </div>
                </div>
                {renderImageControls(
                  `why-${card.id}`,
                  card.image,
                  card.alt,
                  (url, alt) =>
                    setConfig((prev) => ({
                      ...prev,
                      whyShopSection: {
                        ...prev.whyShopSection,
                        cards: prev.whyShopSection.cards.map((c, i) =>
                          i === idx ? { ...c, image: url, alt: alt || c.alt } : c
                        ),
                      },
                    })),
                  defaultMacPageConfig.whyShopSection.cards[idx]?.image
                )}
                <input
                  className="admin-input w-full text-xs"
                  placeholder="Eyebrow"
                  value={card.eyebrow}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      whyShopSection: {
                        ...prev.whyShopSection,
                        cards: prev.whyShopSection.cards.map((c, i) =>
                          i === idx ? { ...c, eyebrow: e.target.value } : c
                        ),
                      },
                    }))
                  }
                />
                <input
                  className="admin-input w-full text-xs font-bold"
                  placeholder="Headline"
                  value={card.title}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      whyShopSection: {
                        ...prev.whyShopSection,
                        cards: prev.whyShopSection.cards.map((c, i) =>
                          i === idx ? { ...c, title: e.target.value } : c
                        ),
                      },
                    }))
                  }
                />
                <textarea
                  className="admin-input w-full text-xs"
                  rows={2}
                  placeholder="Description"
                  value={card.description}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      whyShopSection: {
                        ...prev.whyShopSection,
                        cards: prev.whyShopSection.cards.map((c, i) =>
                          i === idx ? { ...c, description: e.target.value } : c
                        ),
                      },
                    }))
                  }
                />
                <input
                  className="admin-input w-full text-xs"
                  placeholder="Destination (/sell-or-trade)"
                  value={card.actionTo}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      whyShopSection: {
                        ...prev.whyShopSection,
                        cards: prev.whyShopSection.cards.map((c, i) =>
                          i === idx ? { ...c, actionTo: e.target.value } : c
                        ),
                      },
                    }))
                  }
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==================== TAB 5: HELP ME CHOOSE, SWITCH TO MAC & ESSENTIALS ==================== */}
      {activeSubTab === "showcases" && (
        <div className="space-y-6">
          {/* Help Me Choose */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Help Me Choose Banner</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2.5">
                <input
                  className="admin-input w-full text-xs"
                  placeholder="Section Heading"
                  value={config.helpMeChoose.sectionHeading}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      helpMeChoose: { ...prev.helpMeChoose, sectionHeading: e.target.value },
                    }))
                  }
                />
                <input
                  className="admin-input w-full text-xs font-bold"
                  placeholder="Card Headline"
                  value={config.helpMeChoose.cardHeading}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      helpMeChoose: { ...prev.helpMeChoose, cardHeading: e.target.value },
                    }))
                  }
                />
                <textarea
                  className="admin-input w-full text-xs"
                  rows={2}
                  placeholder="Subtitle"
                  value={config.helpMeChoose.subtitle || ""}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      helpMeChoose: { ...prev.helpMeChoose, subtitle: e.target.value },
                    }))
                  }
                />
                <input
                  className="admin-input w-full text-xs"
                  placeholder="CTA Label"
                  value={config.helpMeChoose.ctaLabel}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      helpMeChoose: { ...prev.helpMeChoose, ctaLabel: e.target.value },
                    }))
                  }
                />
              </div>
              {renderImageControls(
                "help-choose",
                config.helpMeChoose.image,
                config.helpMeChoose.alt,
                (url, alt) =>
                  setConfig((prev) => ({
                    ...prev,
                    helpMeChoose: { ...prev.helpMeChoose, image: url, alt: alt || prev.helpMeChoose.alt },
                  })),
                defaultMacPageConfig.helpMeChoose.image
              )}
            </div>
          </div>

          {/* Switch to Mac & Mac Essentials split card editors */}
          {(
            [
              { key: "switchToMacSection", label: "Switch to Mac (2 Promotional Cards)" },
              { key: "macEssentialsSection", label: "Mac Essentials (2 Promotional Cards)" },
            ] as const
          ).map((block) => {
            const sec = config[block.key];
            const defSec = defaultMacPageConfig[block.key];
            return (
              <div key={block.key} className="p-5 rounded-2xl bg-white border border-slate-200 space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-sm font-bold text-slate-900">{block.label}</h3>
                  <input
                    className="admin-input max-w-xs text-xs font-bold"
                    value={sec.heading}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        [block.key]: { ...prev[block.key], heading: e.target.value },
                      }))
                    }
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {sec.cards.map((card: MacPromoSplitCard, idx: number) => (
                    <div key={card.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
                      {renderImageControls(
                        `${block.key}-${card.id}`,
                        card.image,
                        card.alt,
                        (url, alt) =>
                          setConfig((prev) => ({
                            ...prev,
                            [block.key]: {
                              ...prev[block.key],
                              cards: prev[block.key].cards.map((c, i) =>
                                i === idx ? { ...c, image: url, alt: alt || c.alt } : c
                              ),
                            },
                          })),
                        defSec.cards[idx]?.image
                      )}
                      <input
                        className="admin-input w-full text-xs font-bold"
                        value={card.title}
                        onChange={(e) =>
                          setConfig((prev) => ({
                            ...prev,
                            [block.key]: {
                              ...prev[block.key],
                              cards: prev[block.key].cards.map((c, i) =>
                                i === idx ? { ...c, title: e.target.value } : c
                              ),
                            },
                          }))
                        }
                      />
                      <textarea
                        className="admin-input w-full text-xs"
                        rows={2}
                        value={card.description}
                        onChange={(e) =>
                          setConfig((prev) => ({
                            ...prev,
                            [block.key]: {
                              ...prev[block.key],
                              cards: prev[block.key].cards.map((c, i) =>
                                i === idx ? { ...c, description: e.target.value } : c
                              ),
                            },
                          }))
                        }
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          className="admin-input text-xs"
                          placeholder="Link label"
                          value={card.linkLabel}
                          onChange={(e) =>
                            setConfig((prev) => ({
                              ...prev,
                              [block.key]: {
                                ...prev[block.key],
                                cards: prev[block.key].cards.map((c, i) =>
                                  i === idx ? { ...c, linkLabel: e.target.value } : c
                                ),
                              },
                            }))
                          }
                        />
                        <input
                          className="admin-input text-xs"
                          placeholder="Destination"
                          value={card.linkTo}
                          onChange={(e) =>
                            setConfig((prev) => ({
                              ...prev,
                              [block.key]: {
                                ...prev[block.key],
                                cards: prev[block.key].cards.map((c, i) =>
                                  i === idx ? { ...c, linkTo: e.target.value } : c
                                ),
                              },
                            }))
                          }
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ==================== TAB 6: ECOSYSTEM ACCORDION ==================== */}
      {activeSubTab === "ecosystem" && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-white border border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              className="admin-input text-xs font-bold"
              value={config.ecosystemSection.heading}
              onChange={(e) =>
                setConfig((prev) => ({
                  ...prev,
                  ecosystemSection: { ...prev.ecosystemSection, heading: e.target.value },
                }))
              }
            />
            <input
              className="admin-input text-xs"
              value={config.ecosystemSection.actionLabel}
              onChange={(e) =>
                setConfig((prev) => ({
                  ...prev,
                  ecosystemSection: { ...prev.ecosystemSection, actionLabel: e.target.value },
                }))
              }
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {config.ecosystemSection.items.map((item: MacEcosystemItem, idx: number) => (
              <div key={item.id} className="p-4 rounded-2xl bg-white border border-slate-200 space-y-3">
                <span className="text-xs font-bold text-slate-700">Accordion #{idx + 1}</span>
                {renderImageControls(
                  `eco-${item.id}`,
                  item.image,
                  item.alt,
                  (url, alt) =>
                    setConfig((prev) => ({
                      ...prev,
                      ecosystemSection: {
                        ...prev.ecosystemSection,
                        items: prev.ecosystemSection.items.map((it, i) =>
                          i === idx ? { ...it, image: url, alt: alt || it.alt } : it
                        ),
                      },
                    })),
                  defaultMacPageConfig.ecosystemSection.items[idx]?.image
                )}
                <input
                  className="admin-input w-full text-xs font-bold"
                  value={item.title}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      ecosystemSection: {
                        ...prev.ecosystemSection,
                        items: prev.ecosystemSection.items.map((it, i) =>
                          i === idx ? { ...it, title: e.target.value } : it
                        ),
                      },
                    }))
                  }
                />
                <textarea
                  className="admin-input w-full text-xs"
                  rows={4}
                  value={item.description}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      ecosystemSection: {
                        ...prev.ecosystemSection,
                        items: prev.ecosystemSection.items.map((it, i) =>
                          i === idx ? { ...it, description: e.target.value } : it
                        ),
                      },
                    }))
                  }
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    className="admin-input text-xs"
                    value={item.linkLabel}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        ecosystemSection: {
                          ...prev.ecosystemSection,
                          items: prev.ecosystemSection.items.map((it, i) =>
                            i === idx ? { ...it, linkLabel: e.target.value } : it
                          ),
                        },
                      }))
                    }
                  />
                  <input
                    className="admin-input text-xs"
                    value={item.linkTo}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        ecosystemSection: {
                          ...prev.ecosystemSection,
                          items: prev.ecosystemSection.items.map((it, i) =>
                            i === idx ? { ...it, linkTo: e.target.value } : it
                          ),
                        },
                      }))
                    }
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==================== TAB 7: DIRECTORY FOOTER & FOOTNOTES ==================== */}
      {activeSubTab === "directory" && (
        <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1">Directory Heading</label>
              <input
                className="admin-input w-full text-xs font-bold"
                value={config.directoryFooter.heading}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    directoryFooter: { ...prev.directoryFooter, heading: e.target.value },
                  }))
                }
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1">Directory Right Tagline</label>
              <input
                className="admin-input w-full text-xs"
                value={config.directoryFooter.tagline}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    directoryFooter: { ...prev.directoryFooter, tagline: e.target.value },
                  }))
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {config.directoryFooter.columns.map((col, colIdx) => (
              <div key={col.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <input
                  className="admin-input w-full text-xs font-bold"
                  value={col.heading}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      directoryFooter: {
                        ...prev.directoryFooter,
                        columns: prev.directoryFooter.columns.map((c, i) =>
                          i === colIdx ? { ...c, heading: e.target.value } : c
                        ),
                      },
                    }))
                  }
                />
                {col.links.map((lnk, lIdx) => (
                  <div key={lnk.id} className="grid grid-cols-2 gap-1.5">
                    <input
                      className="admin-input text-[11px]"
                      value={lnk.label}
                      onChange={(e) =>
                        setConfig((prev) => ({
                          ...prev,
                          directoryFooter: {
                            ...prev.directoryFooter,
                            columns: prev.directoryFooter.columns.map((c, i) =>
                              i === colIdx
                                ? {
                                    ...c,
                                    links: c.links.map((l, j) =>
                                      j === lIdx ? { ...l, label: e.target.value } : l
                                    ),
                                  }
                                : c
                            ),
                          },
                        }))
                      }
                    />
                    <input
                      className="admin-input text-[11px]"
                      value={lnk.to}
                      onChange={(e) =>
                        setConfig((prev) => ({
                          ...prev,
                          directoryFooter: {
                            ...prev.directoryFooter,
                            columns: prev.directoryFooter.columns.map((c, i) =>
                              i === colIdx
                                ? {
                                    ...c,
                                    links: c.links.map((l, j) =>
                                      j === lIdx ? { ...l, to: e.target.value } : l
                                    ),
                                  }
                                : c
                            ),
                          },
                        }))
                      }
                    />
                  </div>
                ))}
              </div>
            ))}
          </div>

          <div>
            <label className="text-xs font-bold text-slate-600 block mb-1">
              Footnotes &amp; Disclosures (one paragraph per line)
            </label>
            <textarea
              className="admin-input w-full text-xs"
              rows={4}
              value={config.directoryFooter.footnotes.join("\n")}
              onChange={(e) =>
                setConfig((prev) => ({
                  ...prev,
                  directoryFooter: {
                    ...prev.directoryFooter,
                    footnotes: e.target.value
                      .split("\n")
                      .map((l) => l.trim())
                      .filter(Boolean),
                  },
                }))
              }
            />
          </div>
        </div>
      )}
    </div>
  );
}
