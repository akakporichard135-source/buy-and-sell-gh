import { ArrowDown, ArrowUp, Eye, EyeOff, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { defaultWatchPageConfig } from "../../cms/watchPageDefaults";
import type {
  MediaItem,
  WatchBenefitCard,
  WatchChapterNavItem,
  WatchEcosystemItem,
  WatchLineupCard,
  WatchPageConfig,
  WatchPageSection,
} from "../../cms/types";
import type { Product } from "../../types/product";
import { WatchPageRenderer } from "../store/watch/WatchPageRenderer";
import { CategoryAdminToolbar, ImageFieldControl, moveOrderedItem } from "./categoryCmsHelpers";

export type WatchAdminSubTab =
  | "sections"
  | "hero-nav"
  | "lineup"
  | "why-shop"
  | "essentials-eco"
  | "directory";

interface WatchPageAdminEditorProps {
  config: WatchPageConfig;
  activeSubTab: WatchAdminSubTab;
  hasDraft: boolean;
  allProducts: Product[];
  onChange: (next: WatchPageConfig) => void;
  onSaveDraft: () => Promise<void>;
  onPublish: () => Promise<void>;
  onDiscardDraft: () => Promise<void>;
  onUploadMedia: (file: File, category?: MediaItem["category"], title?: string) => Promise<MediaItem>;
  onOpenMediaPicker: (onSelect: (item: MediaItem) => void) => void;
}

export function WatchPageAdminEditor({
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
}: WatchPageAdminEditorProps) {
  const [previewMode, setPreviewMode] = useState<"none" | "desktop" | "mobile">("none");
  const [busyAction, setBusyAction] = useState<"draft" | "publish" | null>(null);
  const [statusBanner, setStatusBanner] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);

  const watchProducts = allProducts.filter((p) =>
    /watch|band|charger/i.test(`${p.name} ${p.slug} ${p.category}`)
  );

  const runAction = async (mode: "draft" | "publish") => {
    setBusyAction(mode);
    setStatusBanner(null);
    try {
      if (mode === "draft") {
        await onSaveDraft();
        setStatusBanner({ type: "success", text: "Apple Watch Page draft saved." });
      } else {
        await onPublish();
        setStatusBanner({ type: "success", text: "Apple Watch Page published live to /watch." });
      }
    } catch (err) {
      setStatusBanner({
        type: "error",
        text: err instanceof Error ? err.message : "Failed to save Apple Watch Page.",
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

  const updateSections = (next: WatchPageSection[]) => onChange({ ...config, sections: next });

  return (
    <div className="space-y-5" data-testid="watch-admin-editor">
      <CategoryAdminToolbar
        testIdPrefix="watch-admin"
        title="Apple Watch Page CMS"
        subtitle="Manage sections, chapter nav, Series 12 / Ultra 4 / SE 3 lineup tiles, 8 benefits, bands banner, and ecosystem."
        hasDraft={hasDraft}
        busyAction={busyAction}
        previewMode={previewMode}
        statusBanner={statusBanner}
        onSetPreview={setPreviewMode}
        onSaveDraft={() => runAction("draft")}
        onPublish={() => runAction("publish")}
        onDiscardDraft={async () => {
          await onDiscardDraft();
          setStatusBanner({ type: "success", text: "Apple Watch draft discarded." });
        }}
        onResetDefault={() => onChange(defaultWatchPageConfig)}
        publishLabel="Publish Watch Page"
        previewRenderer={<WatchPageRenderer configOverride={config} />}
      />

      {activeSubTab === "sections" && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-extrabold text-slate-900">Sections Order &amp; Visibility</h4>
            <button
              type="button"
              onClick={() =>
                updateSections([
                  ...config.sections,
                  {
                    id: `watch-custom-${Date.now()}`,
                    type: "promotional-banner",
                    eyebrow: "Watch Highlight",
                    heading: "New Apple Watch Offer",
                    description: "Custom promotional banner for Apple Watch.",
                    buttonLabel: "Shop Watch",
                    buttonDestination: "/shop/buy-watch",
                    backgroundColor: "#f5f5f7",
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
            <div key={sec.id} className="rounded-xl border border-slate-200 p-3.5 bg-slate-50/50 space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-extrabold">
                  #{idx + 1} · {sec.heading}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => updateSections(moveOrderedItem(config.sections, idx, -1))}
                    className="p-1 rounded border bg-white"
                  >
                    <ArrowUp size={12} />
                  </button>
                  <button
                    type="button"
                    onClick={() => updateSections(moveOrderedItem(config.sections, idx, 1))}
                    className="p-1 rounded border bg-white"
                  >
                    <ArrowDown size={12} />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      updateSections(
                        config.sections.map((s, i) => (i === idx ? { ...s, visible: !s.visible } : s))
                      )
                    }
                    className="p-1 rounded border bg-white"
                  >
                    {sec.visible ? <Eye size={12} /> : <EyeOff size={12} />}
                  </button>
                  {!sec.builtInKey && (
                    <button
                      type="button"
                      onClick={() => updateSections(config.sections.filter((_, i) => i !== idx))}
                      className="p-1 rounded border border-rose-200 bg-rose-50 text-rose-600"
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
              </div>
              {!sec.builtInKey && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  <input
                    type="text"
                    value={sec.heading}
                    onChange={(e) =>
                      updateSections(
                        config.sections.map((s, i) => (i === idx ? { ...s, heading: e.target.value } : s))
                      )
                    }
                    className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs"
                  />
                  <input
                    type="text"
                    value={sec.buttonDestination || ""}
                    onChange={(e) =>
                      updateSections(
                        config.sections.map((s, i) =>
                          i === idx ? { ...s, buttonDestination: e.target.value } : s
                        )
                      )
                    }
                    className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {activeSubTab === "hero-nav" && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              type="text"
              value={config.hero.heading}
              onChange={(e) => onChange({ ...config, hero: { ...config.hero, heading: e.target.value } })}
              className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold"
            />
            <input
              type="text"
              value={config.promoRibbon.text}
              onChange={(e) =>
                onChange({ ...config, promoRibbon: { ...config.promoRibbon, text: e.target.value } })
              }
              className="rounded-lg border border-slate-200 px-3 py-2 text-xs"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {config.chapterNavItems.map((item, idx) => {
              const patch = (p: Partial<WatchChapterNavItem>) =>
                onChange({
                  ...config,
                  chapterNavItems: config.chapterNavItems.map((c, i) => (i === idx ? { ...c, ...p } : c)),
                });
              return (
                <div key={item.id} className="rounded-xl border border-slate-200 p-3 space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={item.label}
                      onChange={(e) => patch({ label: e.target.value })}
                      className="flex-1 rounded-lg border px-2.5 py-1 text-xs font-bold"
                    />
                    <input
                      type="text"
                      value={item.badge || ""}
                      onChange={(e) => patch({ badge: e.target.value || undefined })}
                      placeholder="Badge"
                      className="w-20 rounded-lg border px-2 py-1 text-xs"
                    />
                  </div>
                  <ImageFieldControl
                    label="Chapter Thumbnail"
                    imageUrl={item.image}
                    altText={item.alt}
                    uploading={uploadingKey === item.id}
                    onImageChange={(url, alt) => patch({ image: url, alt: alt ?? item.alt })}
                    onUploadFile={(f) =>
                      handleUpload(item.id, f, item.label, (url, alt) => patch({ image: url, alt }))
                    }
                    onPickLibrary={onOpenMediaPicker}
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeSubTab === "lineup" && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-extrabold text-slate-900">
              Apple Watch Lineup Cards ({config.lineupSection.cards.length})
            </h4>
            <button
              type="button"
              onClick={() =>
                onChange({
                  ...config,
                  lineupSection: {
                    ...config.lineupSection,
                    cards: [
                      ...config.lineupSection.cards,
                      {
                        id: `lineup-watch-${Date.now()}`,
                        tileTone: "cream",
                        title: "New Apple Watch",
                        description: "Verified genuine Apple Watch in Accra.",
                        image: "/products/watch-redesign/lineup-watch-series-12.webp",
                        alt: "Apple Watch",
                        fallbackPriceText: "From GH₵ 6,800",
                        learnMoreLabel: "Learn more",
                        learnMoreTo: "/shop/buy-watch",
                        buyLabel: "Buy",
                        buyTo: "/shop/buy-watch",
                        visible: true,
                        order: config.lineupSection.cards.length,
                      },
                    ],
                  },
                })
              }
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-900 text-white"
            >
              <Plus size={13} />
              <span>Add Watch Card</span>
            </button>
          </div>

          {config.lineupSection.cards.map((card, idx) => {
            const patch = (p: Partial<WatchLineupCard>) =>
              onChange({
                ...config,
                lineupSection: {
                  ...config.lineupSection,
                  cards: config.lineupSection.cards.map((c, i) => (i === idx ? { ...c, ...p } : c)),
                },
              });
            return (
              <div key={card.id} className="rounded-xl border border-slate-200 p-4 space-y-3 bg-slate-50/50">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold">#{idx + 1} · {card.title}</span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() =>
                        onChange({
                          ...config,
                          lineupSection: {
                            ...config.lineupSection,
                            cards: moveOrderedItem(config.lineupSection.cards, idx, -1),
                          },
                        })
                      }
                      className="p-1 rounded border bg-white"
                    >
                      <ArrowUp size={12} />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        onChange({
                          ...config,
                          lineupSection: {
                            ...config.lineupSection,
                            cards: moveOrderedItem(config.lineupSection.cards, idx, 1),
                          },
                        })
                      }
                      className="p-1 rounded border bg-white"
                    >
                      <ArrowDown size={12} />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                  <input
                    type="text"
                    value={card.title}
                    onChange={(e) => patch({ title: e.target.value })}
                    className="rounded-lg border px-2.5 py-1.5 text-xs font-bold"
                  />
                  <select
                    value={card.productSlug || ""}
                    onChange={(e) =>
                      patch({
                        productSlug: e.target.value || undefined,
                        buyTo: e.target.value ? `/shop/buy-watch/${e.target.value}` : card.buyTo,
                      })
                    }
                    className="rounded-lg border px-2.5 py-1.5 text-xs bg-white"
                  >
                    <option value="">-- Assign Supabase Watch --</option>
                    {watchProducts.map((p) => (
                      <option key={p.id} value={p.slug}>
                        {p.name} — GH₵ {p.price}
                      </option>
                    ))}
                  </select>
                  <select
                    value={card.tileTone}
                    onChange={(e) => patch({ tileTone: e.target.value as WatchLineupCard["tileTone"] })}
                    className="rounded-lg border px-2.5 py-1.5 text-xs bg-white"
                  >
                    <option value="cream">Warm Cream Tile</option>
                    <option value="obsidian">Obsidian Dark Tile</option>
                    <option value="sky">Cool Sky Tile</option>
                  </select>
                  <textarea
                    value={card.description}
                    onChange={(e) => patch({ description: e.target.value })}
                    rows={2}
                    className="md:col-span-3 rounded-lg border px-2.5 py-1.5 text-xs"
                  />
                </div>
                <ImageFieldControl
                  label="Watch Tile Photo"
                  imageUrl={card.image}
                  altText={card.alt}
                  uploading={uploadingKey === card.id}
                  onImageChange={(url, alt) => patch({ image: url, alt: alt ?? card.alt })}
                  onUploadFile={(f) =>
                    handleUpload(card.id, f, card.title, (url, alt) => patch({ image: url, alt }))
                  }
                  onPickLibrary={onOpenMediaPicker}
                />
              </div>
            );
          })}
        </div>
      )}

      {activeSubTab === "why-shop" && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4">
          <h4 className="text-sm font-extrabold text-slate-900">
            Why Buy &amp; Sell GH Carousel ({config.whyShopSection.cards.length} cards)
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {config.whyShopSection.cards.map((card, idx) => {
              const patch = (p: Partial<WatchBenefitCard>) =>
                onChange({
                  ...config,
                  whyShopSection: {
                    ...config.whyShopSection,
                    cards: config.whyShopSection.cards.map((c, i) => (i === idx ? { ...c, ...p } : c)),
                  },
                });
              return (
                <div key={card.id} className="rounded-xl border border-slate-200 p-3.5 space-y-2">
                  <input
                    type="text"
                    value={card.title}
                    onChange={(e) => patch({ title: e.target.value })}
                    className="w-full rounded-lg border px-2.5 py-1.5 text-xs font-bold"
                  />
                  <textarea
                    value={card.description}
                    onChange={(e) => patch({ description: e.target.value })}
                    rows={2}
                    className="w-full rounded-lg border px-2.5 py-1.5 text-xs"
                  />
                  <ImageFieldControl
                    label="Card Visual"
                    imageUrl={card.image}
                    altText={card.alt}
                    uploading={uploadingKey === card.id}
                    onImageChange={(url, alt) => patch({ image: url, alt: alt ?? card.alt })}
                    onUploadFile={(f) =>
                      handleUpload(card.id, f, card.title, (url, alt) => patch({ image: url, alt }))
                    }
                    onPickLibrary={onOpenMediaPicker}
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeSubTab === "essentials-eco" && (
        <div className="space-y-5">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3">
            <h4 className="text-sm font-extrabold text-slate-900">Watch Essentials Wide Banner</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              <input
                type="text"
                value={config.essentialsBanner.title}
                onChange={(e) =>
                  onChange({
                    ...config,
                    essentialsBanner: { ...config.essentialsBanner, title: e.target.value },
                  })
                }
                className="rounded-lg border px-2.5 py-1.5 text-xs font-bold"
              />
              <input
                type="text"
                value={config.essentialsBanner.ctaTo}
                onChange={(e) =>
                  onChange({
                    ...config,
                    essentialsBanner: { ...config.essentialsBanner, ctaTo: e.target.value },
                  })
                }
                className="rounded-lg border px-2.5 py-1.5 text-xs"
              />
            </div>
            <textarea
              value={config.essentialsBanner.description}
              onChange={(e) =>
                onChange({
                  ...config,
                  essentialsBanner: { ...config.essentialsBanner, description: e.target.value },
                })
              }
              rows={2}
              className="w-full rounded-lg border px-2.5 py-1.5 text-xs"
            />
            <ImageFieldControl
              label="Vertical Bands Banner Image"
              imageUrl={config.essentialsBanner.image}
              altText={config.essentialsBanner.alt}
              uploading={uploadingKey === "watch-bands-banner"}
              onImageChange={(url, alt) =>
                onChange({
                  ...config,
                  essentialsBanner: {
                    ...config.essentialsBanner,
                    image: url,
                    alt: alt ?? config.essentialsBanner.alt,
                  },
                })
              }
              onUploadFile={(f) =>
                handleUpload("watch-bands-banner", f, "Apple Watch Bands", (url, alt) =>
                  onChange({
                    ...config,
                    essentialsBanner: { ...config.essentialsBanner, image: url, alt },
                  })
                )
              }
              onPickLibrary={onOpenMediaPicker}
            />
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3">
            <h4 className="text-sm font-extrabold text-slate-900">Made for Each Other Ecosystem</h4>
            {config.ecosystemSection.items.map((item, idx) => {
              const patch = (p: Partial<WatchEcosystemItem>) =>
                onChange({
                  ...config,
                  ecosystemSection: {
                    ...config.ecosystemSection,
                    items: config.ecosystemSection.items.map((e, i) => (i === idx ? { ...e, ...p } : e)),
                  },
                });
              return (
                <div key={item.id} className="rounded-xl border border-slate-200 p-3.5 space-y-2">
                  <input
                    type="text"
                    value={item.title}
                    onChange={(e) => patch({ title: e.target.value })}
                    className="w-full rounded-lg border px-2.5 py-1.5 text-xs font-bold"
                  />
                  <textarea
                    value={item.description}
                    onChange={(e) => patch({ description: e.target.value })}
                    rows={2}
                    className="w-full rounded-lg border px-2.5 py-1.5 text-xs"
                  />
                  <ImageFieldControl
                    label="Pairing Photo"
                    imageUrl={item.image}
                    altText={item.alt}
                    uploading={uploadingKey === item.id}
                    onImageChange={(url, alt) => patch({ image: url, alt: alt ?? item.alt })}
                    onUploadFile={(f) =>
                      handleUpload(item.id, f, item.title, (url, alt) => patch({ image: url, alt }))
                    }
                    onPickLibrary={onOpenMediaPicker}
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeSubTab === "directory" && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3">
          <h4 className="text-sm font-extrabold text-slate-900">Directory Heading &amp; Footnotes</h4>
          <input
            type="text"
            value={config.directoryFooter.heading}
            onChange={(e) =>
              onChange({
                ...config,
                directoryFooter: { ...config.directoryFooter, heading: e.target.value },
              })
            }
            className="w-full rounded-lg border px-3 py-2 text-xs font-bold"
          />
          <textarea
            value={config.directoryFooter.footnotes.join("\n")}
            onChange={(e) =>
              onChange({
                ...config,
                directoryFooter: {
                  ...config.directoryFooter,
                  footnotes: e.target.value.split("\n").filter((l) => l.trim().length > 0),
                },
              })
            }
            rows={4}
            className="w-full rounded-lg border px-3 py-2 text-xs"
          />
        </div>
      )}
    </div>
  );
}
