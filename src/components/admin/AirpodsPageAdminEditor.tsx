import { ArrowDown, ArrowUp, Eye, EyeOff, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { defaultAirpodsPageConfig } from "../../cms/airpodsPageDefaults";
import type {
  AirpodsCompareModel,
  AirpodsFeatureCard,
  AirpodsHeroShowcaseCard,
  AirpodsPageConfig,
  AirpodsPageSection,
  MediaItem,
} from "../../cms/types";
import type { Product } from "../../types/product";
import { AirpodsPageRenderer } from "../store/airpods/AirpodsPageRenderer";
import { CategoryAdminToolbar, ImageFieldControl, moveOrderedItem } from "./categoryCmsHelpers";

export type AirpodsAdminSubTab =
  | "sections"
  | "heroes"
  | "compare"
  | "features"
  | "banner-footer";

interface AirpodsPageAdminEditorProps {
  config: AirpodsPageConfig;
  activeSubTab: AirpodsAdminSubTab;
  hasDraft: boolean;
  allProducts: Product[];
  onChange: (next: AirpodsPageConfig) => void;
  onSaveDraft: () => Promise<void>;
  onPublish: () => Promise<void>;
  onDiscardDraft: () => Promise<void>;
  onUploadMedia: (file: File, category?: MediaItem["category"], title?: string) => Promise<MediaItem>;
  onOpenMediaPicker: (onSelect: (item: MediaItem) => void) => void;
}

export function AirpodsPageAdminEditor({
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
}: AirpodsPageAdminEditorProps) {
  const [previewMode, setPreviewMode] = useState<"none" | "desktop" | "mobile">("none");
  const [busyAction, setBusyAction] = useState<"draft" | "publish" | null>(null);
  const [statusBanner, setStatusBanner] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);

  const airpodsProducts = allProducts.filter((p) =>
    /airpods|audio/i.test(`${p.name} ${p.slug} ${p.category}`)
  );

  const runAction = async (mode: "draft" | "publish") => {
    setBusyAction(mode);
    setStatusBanner(null);
    try {
      if (mode === "draft") {
        await onSaveDraft();
        setStatusBanner({ type: "success", text: "AirPods Page draft saved." });
      } else {
        await onPublish();
        setStatusBanner({ type: "success", text: "AirPods Page published live to /airpods." });
      }
    } catch (err) {
      setStatusBanner({
        type: "error",
        text: err instanceof Error ? err.message : "Failed to save AirPods Page.",
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

  const updateSections = (next: AirpodsPageSection[]) => onChange({ ...config, sections: next });

  return (
    <div className="space-y-5" data-testid="airpods-admin-editor">
      <CategoryAdminToolbar
        testIdPrefix="airpods-admin"
        title="AirPods Page CMS"
        subtitle="Manage stacked flagship hero showcases, 4-column comparison table, 5 Get to know AirPods cards, and assurance banner."
        hasDraft={hasDraft}
        busyAction={busyAction}
        previewMode={previewMode}
        statusBanner={statusBanner}
        onSetPreview={setPreviewMode}
        onSaveDraft={() => runAction("draft")}
        onPublish={() => runAction("publish")}
        onDiscardDraft={async () => {
          await onDiscardDraft();
          setStatusBanner({ type: "success", text: "AirPods draft discarded." });
        }}
        onResetDefault={() => onChange(defaultAirpodsPageConfig)}
        publishLabel="Publish AirPods Page"
        previewRenderer={<AirpodsPageRenderer configOverride={config} />}
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
                    id: `airpods-custom-${Date.now()}`,
                    type: "promotional-banner",
                    heading: "New AirPods Spotlight",
                    description: "Custom promotional banner.",
                    buttonLabel: "Shop AirPods",
                    buttonDestination: "/shop/buy-airpods",
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

      {activeSubTab === "heroes" && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4">
          <h4 className="text-sm font-extrabold">Stacked Full-Width Hero Showcases ({config.heroShowcases.length})</h4>
          {config.heroShowcases.map((card, idx) => {
            const patch = (p: Partial<AirpodsHeroShowcaseCard>) =>
              onChange({
                ...config,
                heroShowcases: config.heroShowcases.map((c, i) => (i === idx ? { ...c, ...p } : c)),
              });
            return (
              <div key={card.id} className="rounded-xl border border-slate-200 p-4 space-y-3 bg-slate-50/50">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold">Hero #{idx + 1} · {card.title}</span>
                  <div className="flex items-center gap-1">
                    <button type="button" onClick={() => onChange({ ...config, heroShowcases: moveOrderedItem(config.heroShowcases, idx, -1) })} className="p-1 rounded border bg-white"><ArrowUp size={12} /></button>
                    <button type="button" onClick={() => onChange({ ...config, heroShowcases: moveOrderedItem(config.heroShowcases, idx, 1) })} className="p-1 rounded border bg-white"><ArrowDown size={12} /></button>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                  <input type="text" value={card.title} onChange={(e) => patch({ title: e.target.value })} className="rounded-lg border px-2.5 py-1.5 text-xs font-bold" />
                  <select
                    value={card.productSlug || ""}
                    onChange={(e) =>
                      patch({
                        productSlug: e.target.value || undefined,
                        buyTo: e.target.value ? `/shop/buy-airpods/${e.target.value}` : card.buyTo,
                      })
                    }
                    className="rounded-lg border px-2.5 py-1.5 text-xs bg-white"
                  >
                    <option value="">-- Assign Supabase AirPods --</option>
                    {airpodsProducts.map((p) => (
                      <option key={p.id} value={p.slug}>{p.name} — GH₵ {p.price}</option>
                    ))}
                  </select>
                  <select value={card.variant} onChange={(e) => patch({ variant: e.target.value as AirpodsHeroShowcaseCard["variant"] })} className="rounded-lg border px-2.5 py-1.5 text-xs bg-white">
                    <option value="backlit-dark">Backlit Dark Lifestyle</option>
                    <option value="studio-light">Studio Light White</option>
                    <option value="wordmark-light">Wordmark Behind Product</option>
                  </select>
                  <input type="text" value={card.subtitle} onChange={(e) => patch({ subtitle: e.target.value })} className="md:col-span-3 rounded-lg border px-2.5 py-1.5 text-xs" />
                </div>
                <ImageFieldControl
                  label="Hero Visual"
                  imageUrl={card.image}
                  altText={card.alt}
                  uploading={uploadingKey === card.id}
                  onImageChange={(url, alt) => patch({ image: url, alt: alt ?? card.alt })}
                  onUploadFile={(f) => handleUpload(card.id, f, card.title, (url, alt) => patch({ image: url, alt }))}
                  onPickLibrary={onOpenMediaPicker}
                />
              </div>
            );
          })}
        </div>
      )}

      {activeSubTab === "compare" && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4">
          <h4 className="text-sm font-extrabold">Compare AirPods Models ({config.compareSection.models.length} columns)</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {config.compareSection.models.map((m, idx) => {
              const patch = (p: Partial<AirpodsCompareModel>) =>
                onChange({
                  ...config,
                  compareSection: {
                    ...config.compareSection,
                    models: config.compareSection.models.map((item, i) => (i === idx ? { ...item, ...p } : item)),
                  },
                });
              return (
                <div key={m.id} className="rounded-xl border border-slate-200 p-3.5 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <input type="text" value={m.title} onChange={(e) => patch({ title: e.target.value })} className="rounded-lg border px-2.5 py-1.5 text-xs font-bold" />
                    <input type="text" value={m.batteryHours} onChange={(e) => patch({ batteryHours: e.target.value })} placeholder="Battery (e.g. 8 hrs)" className="rounded-lg border px-2.5 py-1.5 text-xs" />
                  </div>
                  <select
                    value={m.productSlug || ""}
                    onChange={(e) =>
                      patch({
                        productSlug: e.target.value || undefined,
                        buyTo: e.target.value ? `/shop/buy-airpods/${e.target.value}` : m.buyTo,
                      })
                    }
                    className="w-full rounded-lg border px-2.5 py-1.5 text-xs bg-white"
                  >
                    <option value="">-- Assign Supabase Product --</option>
                    {airpodsProducts.map((p) => (
                      <option key={p.id} value={p.slug}>{p.name} — GH₵ {p.price}</option>
                    ))}
                  </select>
                  <input type="text" value={m.ancSpec} onChange={(e) => patch({ ancSpec: e.target.value })} placeholder="ANC spec" className="w-full rounded-lg border px-2.5 py-1 text-xs" />
                  <ImageFieldControl
                    label="Model Cutout"
                    imageUrl={m.image}
                    altText={m.alt}
                    uploading={uploadingKey === m.id}
                    onImageChange={(url, alt) => patch({ image: url, alt: alt ?? m.alt })}
                    onUploadFile={(f) => handleUpload(m.id, f, m.title, (url, alt) => patch({ image: url, alt }))}
                    onPickLibrary={onOpenMediaPicker}
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeSubTab === "features" && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4">
          <h4 className="text-sm font-extrabold">Get to Know AirPods Carousel ({config.featureCarouselSection.cards.length} cards)</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {config.featureCarouselSection.cards.map((card, idx) => {
              const patch = (p: Partial<AirpodsFeatureCard>) =>
                onChange({
                  ...config,
                  featureCarouselSection: {
                    ...config.featureCarouselSection,
                    cards: config.featureCarouselSection.cards.map((c, i) => (i === idx ? { ...c, ...p } : c)),
                  },
                });
              return (
                <div key={card.id} className="rounded-xl border border-slate-200 p-3.5 space-y-2">
                  <input type="text" value={card.eyebrow} onChange={(e) => patch({ eyebrow: e.target.value })} className="w-full rounded-lg border px-2.5 py-1 text-xs font-semibold" />
                  <input type="text" value={card.headline} onChange={(e) => patch({ headline: e.target.value })} className="w-full rounded-lg border px-2.5 py-1.5 text-xs font-bold" />
                  <textarea value={card.expandedCopy} onChange={(e) => patch({ expandedCopy: e.target.value })} rows={2} className="w-full rounded-lg border px-2.5 py-1.5 text-xs" />
                  <ImageFieldControl
                    label="Feature Visual"
                    imageUrl={card.image}
                    altText={card.alt}
                    uploading={uploadingKey === card.id}
                    onImageChange={(url, alt) => patch({ image: url, alt: alt ?? card.alt })}
                    onUploadFile={(f) => handleUpload(card.id, f, card.eyebrow, (url, alt) => patch({ image: url, alt }))}
                    onPickLibrary={onOpenMediaPicker}
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeSubTab === "banner-footer" && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3">
          <h4 className="text-sm font-extrabold">Authenticity Assurance Banner &amp; Footnotes</h4>
          <input
            type="text"
            value={config.assuranceBanner.heading}
            onChange={(e) =>
              onChange({
                ...config,
                assuranceBanner: { ...config.assuranceBanner, heading: e.target.value },
              })
            }
            className="w-full rounded-lg border px-3 py-2 text-xs font-bold"
          />
          <textarea
            value={config.assuranceBanner.description}
            onChange={(e) =>
              onChange({
                ...config,
                assuranceBanner: { ...config.assuranceBanner, description: e.target.value },
              })
            }
            rows={2}
            className="w-full rounded-lg border px-3 py-2 text-xs"
          />
          <ImageFieldControl
            label="Assurance Banner Visual"
            imageUrl={config.assuranceBanner.image}
            altText={config.assuranceBanner.alt}
            uploading={uploadingKey === "airpods-assurance"}
            onImageChange={(url, alt) =>
              onChange({
                ...config,
                assuranceBanner: { ...config.assuranceBanner, image: url, alt: alt ?? config.assuranceBanner.alt },
              })
            }
            onUploadFile={(f) =>
              handleUpload("airpods-assurance", f, "AirPods Assurance", (url, alt) =>
                onChange({ ...config, assuranceBanner: { ...config.assuranceBanner, image: url, alt } })
              )
            }
            onPickLibrary={onOpenMediaPicker}
          />
        </div>
      )}
    </div>
  );
}
