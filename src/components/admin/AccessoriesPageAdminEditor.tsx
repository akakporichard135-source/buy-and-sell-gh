import { ArrowDown, ArrowUp, Eye, EyeOff, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { defaultAccessoriesPageConfig } from "../../cms/accessoriesPageDefaults";
import type {
  AccessoriesBentoItem,
  AccessoriesHeroSlide,
  AccessoriesPageConfig,
  AccessoriesPageSection,
  AccessoriesWhyCard,
  MediaItem,
} from "../../cms/types";
import type { Product } from "../../types/product";
import { AccessoriesPageRenderer } from "../store/accessories/AccessoriesPageRenderer";
import { CategoryAdminToolbar, ImageFieldControl, moveOrderedItem } from "./categoryCmsHelpers";

export type AccessoriesAdminSubTab =
  | "sections"
  | "whats-new"
  | "top-picks"
  | "why-footer";

interface AccessoriesPageAdminEditorProps {
  config: AccessoriesPageConfig;
  activeSubTab: AccessoriesAdminSubTab;
  hasDraft: boolean;
  allProducts: Product[];
  onChange: (next: AccessoriesPageConfig) => void;
  onSaveDraft: () => Promise<void>;
  onPublish: () => Promise<void>;
  onDiscardDraft: () => Promise<void>;
  onUploadMedia: (file: File, category?: MediaItem["category"], title?: string) => Promise<MediaItem>;
  onOpenMediaPicker: (onSelect: (item: MediaItem) => void) => void;
}

export function AccessoriesPageAdminEditor({
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
}: AccessoriesPageAdminEditorProps) {
  const [previewMode, setPreviewMode] = useState<"none" | "desktop" | "mobile">("none");
  const [busyAction, setBusyAction] = useState<"draft" | "publish" | null>(null);
  const [statusBanner, setStatusBanner] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);
  const [editingTabId, setEditingTabId] = useState<string>(config.topPicksSection.tabs[0]?.id || "featured");

  const accessoryProducts = allProducts.filter((p) =>
    /adapter|cable|charger|case|pencil|keyboard|mouse|trackpad|airpods|magsafe/i.test(
      `${p.name} ${p.slug} ${p.category}`
    )
  );

  const runAction = async (mode: "draft" | "publish") => {
    setBusyAction(mode);
    setStatusBanner(null);
    try {
      if (mode === "draft") {
        await onSaveDraft();
        setStatusBanner({ type: "success", text: "Accessories Page draft saved." });
      } else {
        await onPublish();
        setStatusBanner({ type: "success", text: "Accessories Page published live to /accessories." });
      }
    } catch (err) {
      setStatusBanner({
        type: "error",
        text: err instanceof Error ? err.message : "Failed to save Accessories Page.",
      });
    } finally {
      setBusyAction(null);
    }
  };

  const handleUpload = async (
    key: string,
    file: File,
    title: string,
    apply: (url: string, alt: string) => void
  ) => {
    setUploadingKey(key);
    try {
      const uploaded = await onUploadMedia(file, "storefront", title);
      apply(uploaded.url, uploaded.alt || uploaded.title);
    } catch (err) {
      setStatusBanner({ type: "error", text: err instanceof Error ? err.message : "Upload failed." });
    } finally {
      setUploadingKey(null);
    }
  };

  const updateSections = (next: AccessoriesPageSection[]) => onChange({ ...config, sections: next });
  const currentTab =
    config.topPicksSection.tabs.find((t) => t.id === editingTabId) || config.topPicksSection.tabs[0];

  return (
    <div className="space-y-5" data-testid="accessories-admin-editor">
      <CategoryAdminToolbar
        testIdPrefix="accessories-admin"
        title="Accessories Page CMS"
        subtitle="Manage category icons, 6 What's New carousel slides, 5 Top Picks bento tabs, benefits, and directory."
        hasDraft={hasDraft}
        busyAction={busyAction}
        previewMode={previewMode}
        statusBanner={statusBanner}
        onSetPreview={setPreviewMode}
        onSaveDraft={() => runAction("draft")}
        onPublish={() => runAction("publish")}
        onDiscardDraft={async () => {
          await onDiscardDraft();
          setStatusBanner({ type: "success", text: "Accessories draft discarded." });
        }}
        onResetDefault={() => onChange(defaultAccessoriesPageConfig)}
        publishLabel="Publish Accessories Page"
        previewRenderer={<AccessoriesPageRenderer configOverride={config} />}
      />

      {activeSubTab === "sections" && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-extrabold">Sections Order &amp; Visibility</h4>
            <button
              type="button"
              onClick={() =>
                updateSections([
                  ...config.sections,
                  {
                    id: `acc-custom-${Date.now()}`,
                    type: "promotional-banner",
                    heading: "New Accessories Campaign",
                    description: "Custom accessories highlight banner.",
                    buttonLabel: "Shop Accessories",
                    buttonDestination: "/shop/buy-accessories",
                    visible: true,
                    order: config.sections.length,
                  },
                ])
              }
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-900 text-white"
            >
              <Plus size={13} />
              <span>Add Custom Section</span>
            </button>
          </div>
          {config.sections.map((sec, idx) => (
            <div key={sec.id} className="rounded-xl border border-slate-200 p-3 flex items-center justify-between bg-slate-50/50">
              <span className="text-xs font-extrabold">#{idx + 1} · {sec.heading}</span>
              <div className="flex items-center gap-1">
                <button type="button" onClick={() => updateSections(moveOrderedItem(config.sections, idx, -1))} className="p-1 rounded border bg-white"><ArrowUp size={12} /></button>
                <button type="button" onClick={() => updateSections(moveOrderedItem(config.sections, idx, 1))} className="p-1 rounded border bg-white"><ArrowDown size={12} /></button>
                <button type="button" onClick={() => updateSections(config.sections.map((s, i) => (i === idx ? { ...s, visible: !s.visible } : s)))} className="p-1 rounded border bg-white">
                  {sec.visible ? <Eye size={12} /> : <EyeOff size={12} />}
                </button>
                {!sec.builtInKey && (
                  <button type="button" onClick={() => updateSections(config.sections.filter((_, i) => i !== idx))} className="p-1 rounded border border-rose-200 bg-rose-50 text-rose-600"><Trash2 size={12} /></button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {activeSubTab === "whats-new" && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-extrabold">
              Say Hello to What&apos;s New Carousel ({config.whatsNewSection.slides.length} slides)
            </h4>
            <button
              type="button"
              onClick={() => {
                const next: AccessoriesHeroSlide = {
                  id: `acc-slide-${Date.now()}`,
                  theme: "light-split",
                  title: "New Accessory Feature",
                  description: "Explore original Apple accessories in Accra.",
                  ctaLabel: "Shop Accessories",
                  ctaTo: "/shop/buy-accessories",
                  image: "/products/accessories-redesign/hero-acc-power.webp",
                  alt: "Accessory highlight",
                  visible: true,
                  order: config.whatsNewSection.slides.length,
                };
                onChange({
                  ...config,
                  whatsNewSection: {
                    ...config.whatsNewSection,
                    slides: [...config.whatsNewSection.slides, next],
                  },
                });
              }}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-900 text-white"
            >
              <Plus size={13} />
              <span>Add Slide</span>
            </button>
          </div>

          {config.whatsNewSection.slides.map((slide, idx) => {
            const patch = (p: Partial<AccessoriesHeroSlide>) =>
              onChange({
                ...config,
                whatsNewSection: {
                  ...config.whatsNewSection,
                  slides: config.whatsNewSection.slides.map((s, i) => (i === idx ? { ...s, ...p } : s)),
                },
              });
            return (
              <div key={slide.id} className="rounded-xl border border-slate-200 p-4 space-y-2.5 bg-slate-50/50">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold">Slide #{idx + 1} · {slide.title}</span>
                  <div className="flex items-center gap-1">
                    <button type="button" onClick={() => onChange({ ...config, whatsNewSection: { ...config.whatsNewSection, slides: moveOrderedItem(config.whatsNewSection.slides, idx, -1) } })} className="p-1 rounded border bg-white"><ArrowUp size={12} /></button>
                    <button type="button" onClick={() => onChange({ ...config, whatsNewSection: { ...config.whatsNewSection, slides: moveOrderedItem(config.whatsNewSection.slides, idx, 1) } })} className="p-1 rounded border bg-white"><ArrowDown size={12} /></button>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <input type="text" value={slide.title} onChange={(e) => patch({ title: e.target.value })} className="rounded-lg border px-2.5 py-1.5 text-xs font-bold" />
                  <input type="text" value={slide.ctaLabel} onChange={(e) => patch({ ctaLabel: e.target.value })} className="rounded-lg border px-2.5 py-1.5 text-xs" />
                  <input type="text" value={slide.ctaTo} onChange={(e) => patch({ ctaTo: e.target.value })} className="rounded-lg border px-2.5 py-1.5 text-xs" />
                  <textarea value={slide.description} onChange={(e) => patch({ description: e.target.value })} rows={2} className="md:col-span-3 rounded-lg border px-2.5 py-1.5 text-xs" />
                </div>
                <ImageFieldControl
                  label="Slide Image"
                  imageUrl={slide.image}
                  altText={slide.alt}
                  uploading={uploadingKey === slide.id}
                  onImageChange={(url, alt) => patch({ image: url, alt: alt ?? slide.alt })}
                  onUploadFile={(f) => handleUpload(slide.id, f, slide.title, (url, alt) => patch({ image: url, alt }))}
                  onPickLibrary={onOpenMediaPicker}
                />
              </div>
            );
          })}
        </div>
      )}

      {activeSubTab === "top-picks" && currentTab && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            {config.topPicksSection.tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setEditingTabId(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold ${
                  tab.id === currentTab.id ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700"
                }`}
              >
                {tab.label} ({tab.items.length})
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {currentTab.items.map((item, idx) => {
              const patchItem = (p: Partial<AccessoriesBentoItem>) =>
                onChange({
                  ...config,
                  topPicksSection: {
                    ...config.topPicksSection,
                    tabs: config.topPicksSection.tabs.map((t) =>
                      t.id === currentTab.id
                        ? { ...t, items: t.items.map((it, i) => (i === idx ? { ...it, ...p } : it)) }
                        : t
                    ),
                  },
                });
              return (
                <div key={item.id} className="rounded-xl border border-slate-200 p-3.5 space-y-2 bg-slate-50/40">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-extrabold uppercase text-slate-500">
                      #{idx + 1} · {item.span}
                    </span>
                    <button type="button" onClick={() => patchItem({ visible: !item.visible })} className="p-1 rounded border bg-white">
                      {item.visible ? <Eye size={12} /> : <EyeOff size={12} />}
                    </button>
                  </div>
                  <input type="text" value={item.title} onChange={(e) => patchItem({ title: e.target.value })} className="w-full rounded-lg border px-2.5 py-1 text-xs font-bold" />
                  <select
                    value={item.productSlug || ""}
                    onChange={(e) =>
                      patchItem({
                        productSlug: e.target.value || undefined,
                        to: e.target.value ? `/shop/buy-accessory/${e.target.value}` : item.to,
                      })
                    }
                    className="w-full rounded-lg border px-2.5 py-1.5 text-xs bg-white"
                  >
                    <option value="">-- Assign Supabase Accessory --</option>
                    {accessoryProducts.map((p) => (
                      <option key={p.id} value={p.slug}>{p.name} — GH₵ {p.price}</option>
                    ))}
                  </select>
                  <ImageFieldControl
                    label="Tile Image"
                    imageUrl={item.image}
                    altText={item.alt}
                    uploading={uploadingKey === item.id}
                    onImageChange={(url, alt) => patchItem({ image: url, alt: alt ?? item.alt })}
                    onUploadFile={(f) => handleUpload(item.id, f, item.title, (url, alt) => patchItem({ image: url, alt }))}
                    onPickLibrary={onOpenMediaPicker}
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeSubTab === "why-footer" && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4">
          <h4 className="text-sm font-extrabold">Why Buy Accessories Cards ({config.whyBuySection.cards.length})</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {config.whyBuySection.cards.map((card, idx) => {
              const patch = (p: Partial<AccessoriesWhyCard>) =>
                onChange({
                  ...config,
                  whyBuySection: {
                    ...config.whyBuySection,
                    cards: config.whyBuySection.cards.map((c, i) => (i === idx ? { ...c, ...p } : c)),
                  },
                });
              return (
                <div key={card.id} className="rounded-xl border border-slate-200 p-3.5 space-y-2">
                  <input type="text" value={card.title} onChange={(e) => patch({ title: e.target.value })} className="w-full rounded-lg border px-2.5 py-1.5 text-xs font-bold" />
                  <textarea value={card.description} onChange={(e) => patch({ description: e.target.value })} rows={2} className="w-full rounded-lg border px-2.5 py-1.5 text-xs" />
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
