import {
  AlertCircle,
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  Eye,
  EyeOff,
  Image as ImageIcon,
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
import { useState } from "react";
import { defaultIpadPageConfig } from "../../cms/ipadPageDefaults";
import type {
  IpadBenefitCard,
  IpadChapterNavItem,
  IpadDirectoryColumn,
  IpadEcosystemItem,
  IpadEssentialCard,
  IpadLineupCard,
  IpadPageConfig,
  IpadPageSection,
  MediaItem,
} from "../../cms/types";
import type { Product } from "../../types/product";
import { IpadPageRenderer } from "../store/ipad/IpadPageRenderer";

export type IpadAdminSubTab =
  | "sections"
  | "hero-nav"
  | "lineup"
  | "why-shop"
  | "essentials-eco"
  | "directory";

interface IpadPageAdminEditorProps {
  config: IpadPageConfig;
  activeSubTab: IpadAdminSubTab;
  hasDraft: boolean;
  allProducts: Product[];
  onChange: (next: IpadPageConfig) => void;
  onSaveDraft: () => Promise<void>;
  onPublish: () => Promise<void>;
  onDiscardDraft: () => Promise<void>;
  onUploadMedia: (
    file: File,
    category?: MediaItem["category"],
    title?: string
  ) => Promise<MediaItem>;
  onOpenMediaPicker: (onSelect: (item: MediaItem) => void) => void;
}

function moveItem<T>(list: T[], idx: number, dir: -1 | 1): T[] {
  const nextIdx = idx + dir;
  if (nextIdx < 0 || nextIdx >= list.length) return list;
  const copy = [...list];
  const [item] = copy.splice(idx, 1);
  copy.splice(nextIdx, 0, item);
  return copy.map((el, i) => ({ ...(el as Record<string, unknown>), order: i }) as T);
}

export function IpadPageAdminEditor({
  config,
  activeSubTab,
  hasDraft,
  allProducts,
  onChange,
  onSaveDraft,
  onPublish,
  onDiscardDraft,
  onUploadMedia,
  onOpenMediaPicker,
}: IpadPageAdminEditorProps) {
  const [previewMode, setPreviewMode] = useState<"none" | "desktop" | "mobile">("none");
  const [busyAction, setBusyAction] = useState<"draft" | "publish" | null>(null);
  const [statusBanner, setStatusBanner] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);
  const [editingCustomSectionId, setEditingCustomSectionId] = useState<string | null>(null);

  const ipadAndAccessoryProducts = allProducts.filter(
    (p) =>
      p.category === "iPads" ||
      p.category === "Tablets" ||
      p.category === "Accessories" ||
      /ipad|pencil|keyboard/i.test(`${p.name} ${p.slug}`)
  );

  const runAction = async (mode: "draft" | "publish") => {
    setBusyAction(mode);
    setStatusBanner(null);
    try {
      if (mode === "draft") {
        await onSaveDraft();
        setStatusBanner({ type: "success", text: "iPad page draft saved safely." });
      } else {
        await onPublish();
        setStatusBanner({ type: "success", text: "iPad page published live to /ipad." });
      }
    } catch (err) {
      setStatusBanner({
        type: "error",
        text: err instanceof Error ? err.message : "Failed to save iPad page changes.",
      });
    } finally {
      setBusyAction(null);
    }
  };

  const handleUploadImage = async (
    key: string,
    file: File,
    onDone: (url: string, alt: string) => void
  ) => {
    setUploadingKey(key);
    try {
      const uploaded = await onUploadMedia(file, "product", `iPad Page - ${file.name}`);
      onDone(uploaded.url, uploaded.alt || uploaded.title || file.name);
      setStatusBanner({ type: "success", text: `Uploaded ${file.name}. Save Draft or Publish to persist.` });
    } catch (err) {
      setStatusBanner({
        type: "error",
        text: err instanceof Error ? err.message : "Image upload failed.",
      });
    } finally {
      setUploadingKey(null);
    }
  };

  const renderImageControl = (
    key: string,
    currentUrl: string,
    onChangeUrl: (url: string, alt?: string) => void,
    defaultUrl?: string
  ) => (
    <div className="space-y-2">
      <div className="h-28 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center p-2 overflow-hidden">
        {currentUrl ? (
          <img src={currentUrl} alt="Preview" className="max-h-full max-w-full object-contain" />
        ) : (
          <span className="text-xs text-slate-400">No image</span>
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
              if (f) void handleUploadImage(key, f, (url, alt) => onChangeUrl(url, alt));
            }}
          />
        </label>
        <button
          type="button"
          onClick={() => onOpenMediaPicker((item) => onChangeUrl(item.url, item.alt || item.title))}
          className="flex-1 py-1.5 px-2 rounded-lg bg-[#d4af37]/15 hover:bg-[#d4af37]/25 text-amber-900 font-bold text-[0.7rem] flex items-center justify-center gap-1.5"
        >
          <ImageIcon size={13} />
          <span>Library</span>
        </button>
        {defaultUrl && currentUrl !== defaultUrl && (
          <button
            type="button"
            onClick={() => onChangeUrl(defaultUrl)}
            title="Reset to default studio asset"
            className="p-1.5 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100"
          >
            <RotateCcw size={13} />
          </button>
        )}
      </div>
    </div>
  );

  // ---------------- SECTION BUILDER HANDLERS ----------------
  const sections = [...(config.sections || defaultIpadPageConfig.sections)].sort((a, b) => a.order - b.order);

  const updateSections = (next: IpadPageSection[]) => {
    onChange({
      ...config,
      sections: next.map((s, idx) => ({ ...s, order: idx })),
    });
  };

  const addCustomSection = (type: "promotional-banner" | "featured-ipad-products") => {
    const newSec: IpadPageSection = {
      id: `ipad-custom-${Date.now()}`,
      type,
      eyebrow: type === "featured-ipad-products" ? "FEATURED COLLECTION" : "ACCRA OFFER",
      heading: type === "featured-ipad-products" ? "Featured iPad Picks." : "Upgrade your iPad in Accra.",
      subtitle: "Verified stock, genuine accessories, and Dome Pillar 2 pickup.",
      description: "Edit heading, copy, image, and real Supabase iPad products right here.",
      backgroundColor: "#ffffff",
      desktopImage: "/products/ipad-redesign/why-study-creative.webp",
      mobileImage: "/products/ipad-redesign/why-study-creative.webp",
      imageAlt: "Buy & Sell GH iPad promotion",
      buttonLabel: "Shop All iPad",
      buttonDestination: "/shop/buy-ipad",
      productIds: type === "featured-ipad-products" ? ["ipad-pro", "ipad-air", "ipad-a16", "ipad-mini-a17-pro"] : [],
      visible: true,
      order: sections.length,
    };
    updateSections([...sections, newSec]);
    setEditingCustomSectionId(newSec.id);
  };

  const editingCustomSection = sections.find((s) => s.id === editingCustomSectionId) || null;

  return (
    <div className="space-y-6" data-testid="ipad-admin-editor">
      {/* Persistent Top Action & Live Preview Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full bg-slate-900 text-white text-[0.65rem] font-bold uppercase">
              iPad Page CMS
            </span>
            {hasDraft && (
              <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[0.65rem] font-bold">
                Unpublished Draft
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            All sections, headings, studio imagery, live iPad links, and order publish directly to <code className="text-slate-700">/ipad</code>.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            data-testid="ipad-admin-preview-desktop"
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
            data-testid="ipad-admin-preview-mobile"
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
            data-testid="ipad-admin-publish-btn"
            onClick={() => void runAction("publish")}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-[#d8a72d] hover:bg-[#c69520] active:bg-[#b17d12] text-[#111111] flex items-center gap-1.5 shadow-sm transition"
          >
            <Sparkles size={14} /> {busyAction === "publish" ? "Publishing..." : "Publish iPad Page"}
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

      {/* Live Preview Panel — Renders the EXACT same IpadPageRenderer as live /ipad! */}
      {previewMode !== "none" && (
        <div
          className="rounded-2xl border-2 border-slate-900/15 bg-slate-100 p-4 space-y-3"
          data-testid={`ipad-admin-preview-frame-${previewMode}`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Live {previewMode === "mobile" ? "Mobile (390px)" : "Desktop (1440px)"} iPad Page Preview — 100% Parity
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
              <IpadPageRenderer
                configOverride={config}
                productsOverride={allProducts}
                previewDevice={previewMode}
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 1: SECTIONS BUILDER */}
      {activeSubTab === "sections" && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">iPad Page Sections &amp; Order</h3>
              <p className="text-xs text-slate-500">
                Reorder built-in Apple iPad sections, toggle visibility, or add custom banners &amp; product collections.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => addCustomSection("promotional-banner")}
                className="px-3 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold flex items-center gap-1.5"
              >
                <Plus size={14} /> Add Custom Banner
              </button>
              <button
                type="button"
                onClick={() => addCustomSection("featured-ipad-products")}
                className="px-3 py-2 rounded-xl bg-[#d8a72d]/20 text-amber-950 border border-[#d8a72d]/40 text-xs font-bold flex items-center gap-1.5"
              >
                <Plus size={14} /> Add Product Collection
              </button>
            </div>
          </div>

          <div className="space-y-2.5">
            {sections.map((sec, idx) => (
              <div
                key={sec.id}
                className="p-3.5 rounded-xl bg-white border border-slate-200 flex flex-wrap items-center justify-between gap-3"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-400">#{idx + 1}</span>
                    <span className="font-bold text-sm text-slate-900 truncate">{sec.heading}</span>
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[0.65rem] font-semibold">
                      {sec.builtInKey ? "Built-in" : sec.type}
                    </span>
                    {!sec.visible && (
                      <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 text-[0.65rem] font-bold">
                        Hidden
                      </span>
                    )}
                  </div>
                  {sec.subtitle && <p className="text-xs text-slate-500 mt-0.5 truncate">{sec.subtitle}</p>}
                </div>

                <div className="flex items-center gap-1.5">
                  {!sec.builtInKey && (
                    <button
                      type="button"
                      onClick={() =>
                        setEditingCustomSectionId((cur) => (cur === sec.id ? null : sec.id))
                      }
                      className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-800"
                    >
                      {editingCustomSectionId === sec.id ? "Done" : "Edit"}
                    </button>
                  )}
                  <button
                    type="button"
                    disabled={idx === 0}
                    onClick={() => updateSections(moveItem(sections, idx, -1))}
                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-35"
                    aria-label="Move section up"
                  >
                    <ArrowUp size={14} />
                  </button>
                  <button
                    type="button"
                    disabled={idx === sections.length - 1}
                    onClick={() => updateSections(moveItem(sections, idx, 1))}
                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-35"
                    aria-label="Move section down"
                  >
                    <ArrowDown size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      updateSections(
                        sections.map((s) => (s.id === sec.id ? { ...s, visible: !s.visible } : s))
                      )
                    }
                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700"
                    aria-label={sec.visible ? "Hide section" : "Show section"}
                  >
                    {sec.visible ? <Eye size={14} /> : <EyeOff size={14} />}
                  </button>
                  {!sec.builtInKey && (
                    <button
                      type="button"
                      onClick={() => updateSections(sections.filter((s) => s.id !== sec.id))}
                      className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700"
                      aria-label="Remove custom section"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {editingCustomSection && (
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm text-slate-900">
                  Edit Custom Section: {editingCustomSection.heading}
                </h4>
                <button
                  type="button"
                  onClick={() => setEditingCustomSectionId(null)}
                  className="text-xs font-bold text-slate-600 hover:text-slate-900"
                >
                  Close
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="space-y-1 text-xs font-bold text-slate-700">
                  <span>Heading</span>
                  <input
                    type="text"
                    value={editingCustomSection.heading}
                    onChange={(e) =>
                      updateSections(
                        sections.map((s) =>
                          s.id === editingCustomSection.id ? { ...s, heading: e.target.value } : s
                        )
                      )
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-normal"
                  />
                </label>
                <label className="space-y-1 text-xs font-bold text-slate-700">
                  <span>Eyebrow</span>
                  <input
                    type="text"
                    value={editingCustomSection.eyebrow || ""}
                    onChange={(e) =>
                      updateSections(
                        sections.map((s) =>
                          s.id === editingCustomSection.id ? { ...s, eyebrow: e.target.value } : s
                        )
                      )
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-normal"
                  />
                </label>
                <label className="space-y-1 text-xs font-bold text-slate-700">
                  <span>Subtitle</span>
                  <input
                    type="text"
                    value={editingCustomSection.subtitle || ""}
                    onChange={(e) =>
                      updateSections(
                        sections.map((s) =>
                          s.id === editingCustomSection.id ? { ...s, subtitle: e.target.value } : s
                        )
                      )
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-normal"
                  />
                </label>
                <label className="space-y-1 text-xs font-bold text-slate-700">
                  <span>Background Color</span>
                  <select
                    value={editingCustomSection.backgroundColor || "#ffffff"}
                    onChange={(e) =>
                      updateSections(
                        sections.map((s) =>
                          s.id === editingCustomSection.id
                            ? { ...s, backgroundColor: e.target.value }
                            : s
                        )
                      )
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-normal"
                  >
                    <option value="#ffffff">White (#ffffff)</option>
                    <option value="#f5f5f7">Soft Gray (#f5f5f7)</option>
                    <option value="#1d1d1f">Dark Slate (#1d1d1f)</option>
                  </select>
                </label>
                <label className="space-y-1 text-xs font-bold text-slate-700">
                  <span>Primary Button Label</span>
                  <input
                    type="text"
                    value={editingCustomSection.buttonLabel || ""}
                    onChange={(e) =>
                      updateSections(
                        sections.map((s) =>
                          s.id === editingCustomSection.id
                            ? { ...s, buttonLabel: e.target.value }
                            : s
                        )
                      )
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-normal"
                  />
                </label>
                <label className="space-y-1 text-xs font-bold text-slate-700">
                  <span>Primary Button Destination</span>
                  <input
                    type="text"
                    value={editingCustomSection.buttonDestination || ""}
                    onChange={(e) =>
                      updateSections(
                        sections.map((s) =>
                          s.id === editingCustomSection.id
                            ? { ...s, buttonDestination: e.target.value }
                            : s
                        )
                      )
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-normal"
                  />
                </label>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-xs font-bold text-slate-700 mb-1.5">Section Image</div>
                  {renderImageControl(
                    `custom-${editingCustomSection.id}`,
                    editingCustomSection.desktopImage || "",
                    (url, alt) =>
                      updateSections(
                        sections.map((s) =>
                          s.id === editingCustomSection.id
                            ? {
                                ...s,
                                desktopImage: url,
                                mobileImage: url,
                                imageAlt: alt || s.imageAlt,
                              }
                            : s
                        )
                      )
                  )}
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-700 mb-1.5">
                    Assigned Real iPad Products ({(editingCustomSection.productIds || []).length} selected)
                  </div>
                  <div className="max-h-40 overflow-y-auto rounded-xl bg-white border border-slate-200 p-2 space-y-1">
                    {ipadAndAccessoryProducts.map((p) => {
                      const checked = (editingCustomSection.productIds || []).includes(p.slug);
                      return (
                        <label key={p.id} className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={(e) => {
                              const cur = editingCustomSection.productIds || [];
                              const nextIds = e.target.checked
                                ? [...cur, p.slug]
                                : cur.filter((x) => x !== p.slug);
                              updateSections(
                                sections.map((s) =>
                                  s.id === editingCustomSection.id ? { ...s, productIds: nextIds } : s
                                )
                              );
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
          )}
        </div>
      )}

      {/* TAB 2: HERO & CHAPTER NAV */}
      {activeSubTab === "hero-nav" && (
        <div className="space-y-6">
          <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Announcement Ribbon &amp; Hero Heading</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="space-y-1 text-xs font-bold text-slate-700">
                <span>Hero Heading</span>
                <input
                  type="text"
                  value={config.hero.heading}
                  onChange={(e) => onChange({ ...config, hero: { ...config.hero, heading: e.target.value } })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-normal"
                />
              </label>
              <label className="flex items-center gap-2 text-xs font-bold text-slate-700 pt-6 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.hero.showGoldPeriod !== false}
                  onChange={(e) =>
                    onChange({ ...config, hero: { ...config.hero, showGoldPeriod: e.target.checked } })
                  }
                />
                <span>Show Buy &amp; Sell GH Gold Period (iPad.)</span>
              </label>
              <label className="space-y-1 text-xs font-bold text-slate-700 md:col-span-2">
                <span>Promo Ribbon Copy</span>
                <input
                  type="text"
                  value={config.promoRibbon.text}
                  onChange={(e) =>
                    onChange({ ...config, promoRibbon: { ...config.promoRibbon, text: e.target.value } })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-normal"
                />
              </label>
              <label className="space-y-1 text-xs font-bold text-slate-700">
                <span>Ribbon Link Label</span>
                <input
                  type="text"
                  value={config.promoRibbon.linkLabel}
                  onChange={(e) =>
                    onChange({ ...config, promoRibbon: { ...config.promoRibbon, linkLabel: e.target.value } })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-normal"
                />
              </label>
              <label className="space-y-1 text-xs font-bold text-slate-700">
                <span>Ribbon Link Destination</span>
                <input
                  type="text"
                  value={config.promoRibbon.linkTo}
                  onChange={(e) =>
                    onChange({ ...config, promoRibbon: { ...config.promoRibbon, linkTo: e.target.value } })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-normal"
                />
              </label>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">
                Chapter Navigation Items ({config.chapterNavItems.length})
              </h3>
              <button
                type="button"
                onClick={() => {
                  const item: IpadChapterNavItem = {
                    id: `nav-ipad-${Date.now()}`,
                    label: "New Item",
                    image: "/products/ipad-redesign/nav-ipad-air.webp",
                    alt: "iPad navigation item",
                    to: "/shop/buy-ipad",
                    visible: true,
                    order: config.chapterNavItems.length,
                  };
                  onChange({ ...config, chapterNavItems: [...config.chapterNavItems, item] });
                }}
                className="px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-bold flex items-center gap-1"
              >
                <Plus size={13} /> Add Nav Item
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...config.chapterNavItems]
                .sort((a, b) => a.order - b.order)
                .map((item, idx, arr) => {
                  const updateNav = (partial: Partial<IpadChapterNavItem>) => {
                    onChange({
                      ...config,
                      chapterNavItems: arr.map((n) => (n.id === item.id ? { ...n, ...partial } : n)),
                    });
                  };
                  return (
                    <div key={item.id} className="p-3.5 rounded-2xl bg-white border border-slate-200 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800">{item.label}</span>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => onChange({ ...config, chapterNavItems: moveItem(arr, idx, -1) })}
                            className="p-1 rounded bg-slate-100 disabled:opacity-35"
                          >
                            <ArrowUp size={12} />
                          </button>
                          <button
                            type="button"
                            disabled={idx === arr.length - 1}
                            onClick={() => onChange({ ...config, chapterNavItems: moveItem(arr, idx, 1) })}
                            className="p-1 rounded bg-slate-100 disabled:opacity-35"
                          >
                            <ArrowDown size={12} />
                          </button>
                          <button
                            type="button"
                            onClick={() => updateNav({ visible: !item.visible })}
                            className="p-1 rounded bg-slate-100"
                          >
                            {item.visible ? <Eye size={12} /> : <EyeOff size={12} />}
                          </button>
                        </div>
                      </div>
                      {renderImageControl(
                        `nav-${item.id}`,
                        item.image,
                        (url, alt) => updateNav({ image: url, alt: alt || item.alt }),
                        defaultIpadPageConfig.chapterNavItems.find((d) => d.id === item.id)?.image
                      )}
                      <input
                        type="text"
                        value={item.label}
                        onChange={(e) => updateNav({ label: e.target.value })}
                        placeholder="Label"
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={item.badge || ""}
                          onChange={(e) => updateNav({ badge: e.target.value })}
                          placeholder="Badge (e.g. New)"
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs"
                        />
                        <input
                          type="text"
                          value={item.to}
                          onChange={(e) => updateNav({ to: e.target.value })}
                          placeholder="/shop/buy-ipad"
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs"
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: EXPLORE LINEUP */}
      {activeSubTab === "lineup" && (
        <div className="space-y-5">
          <div className="p-4 rounded-2xl bg-white border border-slate-200 grid grid-cols-1 md:grid-cols-3 gap-4">
            <label className="space-y-1 text-xs font-bold text-slate-700">
              <span>Section Heading</span>
              <input
                type="text"
                value={config.lineupSection.heading}
                onChange={(e) =>
                  onChange({ ...config, lineupSection: { ...config.lineupSection, heading: e.target.value } })
                }
                className="w-full px-3 py-2 rounded-xl border border-slate-200 font-normal"
              />
            </label>
            <label className="space-y-1 text-xs font-bold text-slate-700">
              <span>Compare Action Label</span>
              <input
                type="text"
                value={config.lineupSection.compareLabel}
                onChange={(e) =>
                  onChange({ ...config, lineupSection: { ...config.lineupSection, compareLabel: e.target.value } })
                }
                className="w-full px-3 py-2 rounded-xl border border-slate-200 font-normal"
              />
            </label>
            <label className="space-y-1 text-xs font-bold text-slate-700">
              <span>Shop All Destination</span>
              <input
                type="text"
                value={config.lineupSection.shopAllTo}
                onChange={(e) =>
                  onChange({ ...config, lineupSection: { ...config.lineupSection, shopAllTo: e.target.value } })
                }
                className="w-full px-3 py-2 rounded-xl border border-slate-200 font-normal"
              />
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...config.lineupSection.cards]
              .sort((a, b) => a.order - b.order)
              .map((card, idx, arr) => {
                const updateCard = (partial: Partial<IpadLineupCard>) => {
                  onChange({
                    ...config,
                    lineupSection: {
                      ...config.lineupSection,
                      cards: arr.map((c) => (c.id === card.id ? { ...c, ...partial } : c)),
                    },
                  });
                };
                return (
                  <div key={card.id} className="p-4 rounded-2xl bg-white border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-slate-900">{card.title}</span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() =>
                            onChange({
                              ...config,
                              lineupSection: { ...config.lineupSection, cards: moveItem(arr, idx, -1) },
                            })
                          }
                          className="p-1 rounded bg-slate-100 disabled:opacity-35"
                        >
                          <ArrowUp size={13} />
                        </button>
                        <button
                          type="button"
                          disabled={idx === arr.length - 1}
                          onClick={() =>
                            onChange({
                              ...config,
                              lineupSection: { ...config.lineupSection, cards: moveItem(arr, idx, 1) },
                            })
                          }
                          className="p-1 rounded bg-slate-100 disabled:opacity-35"
                        >
                          <ArrowDown size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => updateCard({ visible: !card.visible })}
                          className="p-1 rounded bg-slate-100"
                        >
                          {card.visible ? <Eye size={13} /> : <EyeOff size={13} />}
                        </button>
                      </div>
                    </div>

                    {renderImageControl(
                      `lineup-${card.id}`,
                      card.image,
                      (url, alt) => updateCard({ image: url, alt: alt || card.alt }),
                      defaultIpadPageConfig.lineupSection.cards.find((d) => d.id === card.id)?.image
                    )}

                    <div className="grid grid-cols-2 gap-2.5">
                      <label className="space-y-1 text-[0.7rem] font-bold text-slate-600">
                        <span>Title</span>
                        <input
                          type="text"
                          value={card.title}
                          onChange={(e) => updateCard({ title: e.target.value })}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 font-normal"
                        />
                      </label>
                      <label className="space-y-1 text-[0.7rem] font-bold text-slate-600">
                        <span>Tile Tone</span>
                        <select
                          value={card.tileTone}
                          onChange={(e) => updateCard({ tileTone: e.target.value as IpadLineupCard["tileTone"] })}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 font-normal"
                        >
                          <option value="dark">Dark Charcoal (iPad Pro)</option>
                          <option value="sky">Sky Blue Gradient (iPad Air)</option>
                          <option value="light">Soft Cool Gray (iPad / mini)</option>
                        </select>
                      </label>
                      <label className="space-y-1 text-[0.7rem] font-bold text-slate-600 col-span-2">
                        <span>Connected Supabase iPad Product (Live GH₵ Price &amp; Stock)</span>
                        <select
                          value={card.productSlug || ""}
                          onChange={(e) => updateCard({ productSlug: e.target.value || undefined })}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 font-normal"
                        >
                          <option value="">-- Custom / Unlinked --</option>
                          {ipadAndAccessoryProducts.map((p) => (
                            <option key={p.id} value={p.slug}>
                              {p.name} ({p.slug})
                            </option>
                          ))}
                        </select>
                      </label>
                      <label className="space-y-1 text-[0.7rem] font-bold text-slate-600 col-span-2">
                        <span>Short Description</span>
                        <input
                          type="text"
                          value={card.description}
                          onChange={(e) => updateCard({ description: e.target.value })}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 font-normal"
                        />
                      </label>
                      <label className="space-y-1 text-[0.7rem] font-bold text-slate-600">
                        <span>Buy Destination</span>
                        <input
                          type="text"
                          value={card.buyTo}
                          onChange={(e) => updateCard({ buyTo: e.target.value })}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 font-normal"
                        />
                      </label>
                      <label className="space-y-1 text-[0.7rem] font-bold text-slate-600">
                        <span>Learn More Destination</span>
                        <input
                          type="text"
                          value={card.learnMoreTo}
                          onChange={(e) => updateCard({ learnMoreTo: e.target.value })}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 font-normal"
                        />
                      </label>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* TAB 4: WHY BUY & SELL GH */}
      {activeSubTab === "why-shop" && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-white border border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="space-y-1 text-xs font-bold text-slate-700">
              <span>Section Heading</span>
              <input
                type="text"
                value={config.whyShopSection.heading}
                onChange={(e) =>
                  onChange({ ...config, whyShopSection: { ...config.whyShopSection, heading: e.target.value } })
                }
                className="w-full px-3 py-2 rounded-xl border border-slate-200 font-normal"
              />
            </label>
            <label className="space-y-1 text-xs font-bold text-slate-700">
              <span>Header Action Link</span>
              <input
                type="text"
                value={config.whyShopSection.actionTo}
                onChange={(e) =>
                  onChange({ ...config, whyShopSection: { ...config.whyShopSection, actionTo: e.target.value } })
                }
                className="w-full px-3 py-2 rounded-xl border border-slate-200 font-normal"
              />
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...config.whyShopSection.cards]
              .sort((a, b) => a.order - b.order)
              .map((card, idx, arr) => {
                const updateCard = (partial: Partial<IpadBenefitCard>) => {
                  onChange({
                    ...config,
                    whyShopSection: {
                      ...config.whyShopSection,
                      cards: arr.map((c) => (c.id === card.id ? { ...c, ...partial } : c)),
                    },
                  });
                };
                return (
                  <div key={card.id} className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-900">
                        {card.eyebrow}: {card.title}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() =>
                            onChange({
                              ...config,
                              whyShopSection: { ...config.whyShopSection, cards: moveItem(arr, idx, -1) },
                            })
                          }
                          className="p-1 rounded bg-slate-100 disabled:opacity-35"
                        >
                          <ArrowUp size={12} />
                        </button>
                        <button
                          type="button"
                          disabled={idx === arr.length - 1}
                          onClick={() =>
                            onChange({
                              ...config,
                              whyShopSection: { ...config.whyShopSection, cards: moveItem(arr, idx, 1) },
                            })
                          }
                          className="p-1 rounded bg-slate-100 disabled:opacity-35"
                        >
                          <ArrowDown size={12} />
                        </button>
                        <button
                          type="button"
                          onClick={() => updateCard({ visible: !card.visible })}
                          className="p-1 rounded bg-slate-100"
                        >
                          {card.visible ? <Eye size={12} /> : <EyeOff size={12} />}
                        </button>
                      </div>
                    </div>
                    {renderImageControl(
                      `why-${card.id}`,
                      card.image,
                      (url, alt) => updateCard({ image: url, alt: alt || card.alt }),
                      defaultIpadPageConfig.whyShopSection.cards.find((d) => d.id === card.id)?.image
                    )}
                    <input
                      type="text"
                      value={card.title}
                      onChange={(e) => updateCard({ title: e.target.value })}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold"
                    />
                    <textarea
                      rows={2}
                      value={card.description}
                      onChange={(e) => updateCard({ description: e.target.value })}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={card.actionLabel}
                        onChange={(e) => updateCard({ actionLabel: e.target.value })}
                        placeholder="CTA Label"
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs"
                      />
                      <input
                        type="text"
                        value={card.actionTo}
                        onChange={(e) => updateCard({ actionTo: e.target.value })}
                        placeholder="/sell-or-trade"
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs"
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* TAB 5: ESSENTIALS & SIGNIFICANT OTHERS */}
      {activeSubTab === "essentials-eco" && (
        <div className="space-y-6">
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-900">iPad Essentials (Alternating Editorial Cards)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[...config.essentialsSection.cards]
                .sort((a, b) => a.order - b.order)
                .map((card, _idx, arr) => {
                  const updateEss = (partial: Partial<IpadEssentialCard>) => {
                    onChange({
                      ...config,
                      essentialsSection: {
                        ...config.essentialsSection,
                        cards: arr.map((c) => (c.id === card.id ? { ...c, ...partial } : c)),
                      },
                    });
                  };
                  return (
                    <div key={card.id} className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-slate-900">{card.title}</span>
                        <select
                          value={card.layout}
                          onChange={(e) => updateEss({ layout: e.target.value as IpadEssentialCard["layout"] })}
                          className="px-2 py-1 rounded-lg border border-slate-200 text-xs"
                        >
                          <option value="text-top">Text Top / Image Bottom</option>
                          <option value="image-top">Image Top / Text Bottom</option>
                        </select>
                      </div>
                      {renderImageControl(
                        `ess-${card.id}`,
                        card.image,
                        (url, alt) => updateEss({ image: url, alt: alt || card.alt }),
                        defaultIpadPageConfig.essentialsSection.cards.find((d) => d.id === card.id)?.image
                      )}
                      <input
                        type="text"
                        value={card.title}
                        onChange={(e) => updateEss({ title: e.target.value })}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold"
                      />
                      <input
                        type="text"
                        value={card.description}
                        onChange={(e) => updateEss({ description: e.target.value })}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={card.buyLabel}
                          onChange={(e) => updateEss({ buyLabel: e.target.value })}
                          placeholder="Buy button label"
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs"
                        />
                        <input
                          type="text"
                          value={card.buyTo}
                          onChange={(e) => updateEss({ buyTo: e.target.value })}
                          placeholder="/shop/buy-accessory/..."
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs"
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-900">Significant Others (Ecosystem Accordion)</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[...config.ecosystemSection.items]
                .sort((a, b) => a.order - b.order)
                .map((item, _idx, arr) => {
                  const updateEco = (partial: Partial<IpadEcosystemItem>) => {
                    onChange({
                      ...config,
                      ecosystemSection: {
                        ...config.ecosystemSection,
                        items: arr.map((c) => (c.id === item.id ? { ...c, ...partial } : c)),
                      },
                    });
                  };
                  return (
                    <div key={item.id} className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2.5">
                      <div className="font-bold text-sm text-slate-900">{item.title}</div>
                      {renderImageControl(
                        `eco-${item.id}`,
                        item.image,
                        (url, alt) => updateEco({ image: url, alt: alt || item.alt }),
                        defaultIpadPageConfig.ecosystemSection.items.find((d) => d.id === item.id)?.image
                      )}
                      <input
                        type="text"
                        value={item.title}
                        onChange={(e) => updateEco({ title: e.target.value })}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold"
                      />
                      <textarea
                        rows={3}
                        value={item.description}
                        onChange={(e) => updateEco({ description: e.target.value })}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={item.linkLabel}
                          onChange={(e) => updateEco({ linkLabel: e.target.value })}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs"
                        />
                        <input
                          type="text"
                          value={item.linkTo}
                          onChange={(e) => updateEco({ linkTo: e.target.value })}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs"
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: IPAD DIRECTORY FOOTER */}
      {activeSubTab === "directory" && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-white border border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="space-y-1 text-xs font-bold text-slate-700">
              <span>Directory Heading</span>
              <input
                type="text"
                value={config.directoryFooter.heading}
                onChange={(e) =>
                  onChange({
                    ...config,
                    directoryFooter: { ...config.directoryFooter, heading: e.target.value },
                  })
                }
                className="w-full px-3 py-2 rounded-xl border border-slate-200 font-normal"
              />
            </label>
            <label className="space-y-1 text-xs font-bold text-slate-700">
              <span>Tagline</span>
              <input
                type="text"
                value={config.directoryFooter.tagline}
                onChange={(e) =>
                  onChange({
                    ...config,
                    directoryFooter: { ...config.directoryFooter, tagline: e.target.value },
                  })
                }
                className="w-full px-3 py-2 rounded-xl border border-slate-200 font-normal"
              />
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {config.directoryFooter.columns.map((col: IpadDirectoryColumn) => (
              <div key={col.id} className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2.5">
                <input
                  type="text"
                  value={col.heading}
                  onChange={(e) =>
                    onChange({
                      ...config,
                      directoryFooter: {
                        ...config.directoryFooter,
                        columns: config.directoryFooter.columns.map((c) =>
                          c.id === col.id ? { ...c, heading: e.target.value } : c
                        ),
                      },
                    })
                  }
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-bold"
                />
                <div className="space-y-2">
                  {col.links.map((lnk) => (
                    <div key={lnk.id} className="grid grid-cols-2 gap-1.5">
                      <input
                        type="text"
                        value={lnk.label}
                        onChange={(e) =>
                          onChange({
                            ...config,
                            directoryFooter: {
                              ...config.directoryFooter,
                              columns: config.directoryFooter.columns.map((c) =>
                                c.id === col.id
                                  ? {
                                      ...c,
                                      links: c.links.map((l) =>
                                        l.id === lnk.id ? { ...l, label: e.target.value } : l
                                      ),
                                    }
                                  : c
                              ),
                            },
                          })
                        }
                        className="px-2 py-1 rounded-lg border border-slate-200 text-xs"
                      />
                      <input
                        type="text"
                        value={lnk.to}
                        onChange={(e) =>
                          onChange({
                            ...config,
                            directoryFooter: {
                              ...config.directoryFooter,
                              columns: config.directoryFooter.columns.map((c) =>
                                c.id === col.id
                                  ? {
                                      ...c,
                                      links: c.links.map((l) =>
                                        l.id === lnk.id ? { ...l, to: e.target.value } : l
                                      ),
                                    }
                                  : c
                              ),
                            },
                          })
                        }
                        className="px-2 py-1 rounded-lg border border-slate-200 text-xs"
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
