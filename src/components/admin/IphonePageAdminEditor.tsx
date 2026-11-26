import { ArrowDown, ArrowUp, Eye, EyeOff, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { defaultIphonePageConfig } from "../../cms/iphonePageDefaults";
import type {
  IphoneBenefitCard,
  IphoneChapterNavItem,
  IphoneEcosystemItem,
  IphoneEssentialCard,
  IphoneHeroSlide,
  IphoneLineupCard,
  IphonePageConfig,
  IphonePageSection,
  MediaItem,
} from "../../cms/types";
import type { Product } from "../../types/product";
import { IphonePageRenderer } from "../store/iphone/IphonePageRenderer";
import { CategoryAdminToolbar, ImageFieldControl, moveOrderedItem } from "./categoryCmsHelpers";

export type IphoneAdminSubTab =
  | "sections"
  | "hero-nav"
  | "lineup"
  | "why-shop"
  | "essentials-eco"
  | "directory";

interface IphonePageAdminEditorProps {
  config: IphonePageConfig;
  activeSubTab: IphoneAdminSubTab;
  hasDraft: boolean;
  allProducts: Product[];
  onChange: (next: IphonePageConfig) => void;
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

export function IphonePageAdminEditor({
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
}: IphonePageAdminEditorProps) {
  const [previewMode, setPreviewMode] = useState<"none" | "desktop" | "mobile">("none");
  const [busyAction, setBusyAction] = useState<"draft" | "publish" | null>(null);
  const [statusBanner, setStatusBanner] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);

  const iphoneCatalogProducts = allProducts.filter(
    (p) =>
      /iphone|magsafe|charger|adapter|cable/i.test(`${p.name} ${p.slug} ${p.category}`)
  );

  const runAction = async (mode: "draft" | "publish") => {
    setBusyAction(mode);
    setStatusBanner(null);
    try {
      if (mode === "draft") {
        await onSaveDraft();
        setStatusBanner({ type: "success", text: "iPhone Page draft saved successfully." });
      } else {
        await onPublish();
        setStatusBanner({ type: "success", text: "iPhone Page published live to /iphone." });
      }
    } catch (err) {
      setStatusBanner({
        type: "error",
        text: err instanceof Error ? err.message : "Failed to save iPhone Page configuration.",
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
      setStatusBanner({
        type: "error",
        text: err instanceof Error ? err.message : "Failed to upload image.",
      });
    } finally {
      setUploadingKey(null);
    }
  };

  const updateSections = (nextSections: IphonePageSection[]) =>
    onChange({ ...config, sections: nextSections });

  const addCustomSection = () => {
    const next: IphonePageSection = {
      id: `iphone-custom-${Date.now()}`,
      type: "promotional-banner",
      eyebrow: "Featured Campaign",
      heading: "New iPhone Spotlight",
      subtitle: "Verified stock at Dome Pillar 2, Accra.",
      description: "Describe your seasonal iPhone promotion or trade-in highlight here.",
      desktopImage: "/products/iphone-redesign/hero-iphone-duo.webp",
      buttonLabel: "Shop iPhone",
      buttonDestination: "/shop/buy-iphone",
      backgroundColor: "#f5f5f7",
      visible: true,
      order: config.sections.length,
    };
    updateSections([...config.sections, next]);
  };

  return (
    <div className="space-y-5" data-testid="iphone-admin-editor">
      <CategoryAdminToolbar
        testIdPrefix="iphone-admin"
        title="iPhone Page CMS"
        subtitle="Manage sections, hero carousel slides, all 6 lineup cards, 8 benefits, essentials, ecosystem, and directory."
        hasDraft={hasDraft}
        busyAction={busyAction}
        previewMode={previewMode}
        statusBanner={statusBanner}
        onSetPreview={setPreviewMode}
        onSaveDraft={() => runAction("draft")}
        onPublish={() => runAction("publish")}
        onDiscardDraft={async () => {
          await onDiscardDraft();
          setStatusBanner({ type: "success", text: "iPhone Page draft discarded." });
        }}
        onResetDefault={() => onChange(defaultIphonePageConfig)}
        publishLabel="Publish iPhone Page"
        previewRenderer={<IphonePageRenderer configOverride={config} previewMode />}
      />

      {activeSubTab === "sections" && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h4 className="text-sm font-extrabold text-slate-900">Sections Order &amp; Visibility</h4>
              <p className="text-xs text-slate-500">Reorder built-in sections, toggle visibility, or add custom sections.</p>
            </div>
            <button
              type="button"
              onClick={addCustomSection}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-900 text-white"
            >
              <Plus size={14} />
              <span>Add Custom Section</span>
            </button>
          </div>

          <div className="space-y-2.5">
            {config.sections.map((sec, idx) => (
              <div key={sec.id} className="rounded-xl border border-slate-200 p-3.5 bg-slate-50/60 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-slate-200 text-[11px] font-bold text-slate-700">
                      #{idx + 1}
                    </span>
                    <span className="text-xs font-extrabold text-slate-900">{sec.heading}</span>
                    <span className="text-[11px] text-slate-500">({sec.builtInKey || sec.type})</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => updateSections(moveOrderedItem(config.sections, idx, -1))}
                      disabled={idx === 0}
                      className="p-1.5 rounded-lg border border-slate-200 bg-white disabled:opacity-40"
                      title="Move up"
                    >
                      <ArrowUp size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => updateSections(moveOrderedItem(config.sections, idx, 1))}
                      disabled={idx === config.sections.length - 1}
                      className="p-1.5 rounded-lg border border-slate-200 bg-white disabled:opacity-40"
                      title="Move down"
                    >
                      <ArrowDown size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        updateSections(
                          config.sections.map((s, i) => (i === idx ? { ...s, visible: !s.visible } : s))
                        )
                      }
                      className="p-1.5 rounded-lg border border-slate-200 bg-white"
                      title="Toggle visibility"
                    >
                      {sec.visible ? <Eye size={13} /> : <EyeOff size={13} className="text-slate-400" />}
                    </button>
                    {!sec.builtInKey && (
                      <button
                        type="button"
                        onClick={() => updateSections(config.sections.filter((_, i) => i !== idx))}
                        className="p-1.5 rounded-lg border border-rose-200 bg-rose-50 text-rose-600"
                        title="Remove custom section"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                </div>

                {!sec.builtInKey && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-slate-200">
                    <input
                      type="text"
                      value={sec.heading}
                      onChange={(e) =>
                        updateSections(
                          config.sections.map((s, i) => (i === idx ? { ...s, heading: e.target.value } : s))
                        )
                      }
                      placeholder="Heading"
                      className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs"
                    />
                    <input
                      type="text"
                      value={sec.subtitle || ""}
                      onChange={(e) =>
                        updateSections(
                          config.sections.map((s, i) => (i === idx ? { ...s, subtitle: e.target.value } : s))
                        )
                      }
                      placeholder="Subtitle"
                      className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs"
                    />
                    <textarea
                      value={sec.description || ""}
                      onChange={(e) =>
                        updateSections(
                          config.sections.map((s, i) => (i === idx ? { ...s, description: e.target.value } : s))
                        )
                      }
                      placeholder="Description"
                      rows={2}
                      className="md:col-span-2 rounded-lg border border-slate-200 px-3 py-1.5 text-xs"
                    />
                    <input
                      type="text"
                      value={sec.buttonLabel || ""}
                      onChange={(e) =>
                        updateSections(
                          config.sections.map((s, i) => (i === idx ? { ...s, buttonLabel: e.target.value } : s))
                        )
                      }
                      placeholder="Button Label"
                      className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs"
                    />
                    <input
                      type="text"
                      value={sec.buttonDestination || ""}
                      onChange={(e) =>
                        updateSections(
                          config.sections.map((s, i) => (i === idx ? { ...s, buttonDestination: e.target.value } : s))
                        )
                      }
                      placeholder="Button Destination (/shop/buy-iphone)"
                      className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs"
                    />
                    <div className="md:col-span-2">
                      <ImageFieldControl
                        label="Section Image"
                        imageUrl={sec.desktopImage || ""}
                        uploading={uploadingKey === sec.id}
                        onImageChange={(url, alt) =>
                          updateSections(
                            config.sections.map((s, i) =>
                              i === idx ? { ...s, desktopImage: url, imageAlt: alt ?? s.imageAlt } : s
                            )
                          )
                        }
                        onUploadFile={(f) =>
                          handleUpload(sec.id, f, sec.heading, (url, alt) =>
                            updateSections(
                              config.sections.map((s, i) =>
                                i === idx ? { ...s, desktopImage: url, imageAlt: alt } : s
                              )
                            )
                          )
                        }
                        onPickLibrary={onOpenMediaPicker}
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {activeSubTab === "hero-nav" && (
        <div className="space-y-5">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3">
            <h4 className="text-sm font-extrabold text-slate-900">Promo Ribbon &amp; Hero Heading</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                type="text"
                value={config.hero.heading}
                onChange={(e) => onChange({ ...config, hero: { ...config.hero, heading: e.target.value } })}
                placeholder="Hero Heading (iPhone)"
                className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold"
              />
              <input
                type="text"
                value={config.promoRibbon.text}
                onChange={(e) =>
                  onChange({ ...config, promoRibbon: { ...config.promoRibbon, text: e.target.value } })
                }
                placeholder="Promo ribbon text"
                className="rounded-lg border border-slate-200 px-3 py-2 text-xs"
              />
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-extrabold text-slate-900">
                Featured Hero Gallery Slides ({config.heroGallery.slides.length})
              </h4>
              <button
                type="button"
                onClick={() => {
                  const next: IphoneHeroSlide = {
                    id: `hero-slide-${Date.now()}`,
                    tabLabel: "New Slide",
                    theme: "light",
                    title: "iPhone Campaign",
                    subtitle: "Explore authentic iPhone inventory in Accra.",
                    image: "/products/iphone-redesign/hero-iphone-duo.webp",
                    alt: "iPhone showcase",
                    buyLabel: "Buy",
                    buyTo: "/shop/buy-iphone",
                    learnMoreLabel: "Learn more",
                    learnMoreTo: "/shop/buy-iphone",
                    visible: true,
                    order: config.heroGallery.slides.length,
                  };
                  onChange({
                    ...config,
                    heroGallery: { ...config.heroGallery, slides: [...config.heroGallery.slides, next] },
                  });
                }}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-900 text-white"
              >
                <Plus size={13} />
                <span>Add Slide</span>
              </button>
            </div>

            {config.heroGallery.slides.map((slide, idx) => {
              const patchSlide = (partial: Partial<IphoneHeroSlide>) =>
                onChange({
                  ...config,
                  heroGallery: {
                    ...config.heroGallery,
                    slides: config.heroGallery.slides.map((s, i) => (i === idx ? { ...s, ...partial } : s)),
                  },
                });
              return (
                <div key={slide.id} className="rounded-xl border border-slate-200 p-4 space-y-3 bg-slate-50/50">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-slate-900">
                      Slide #{idx + 1}: {slide.title}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() =>
                          onChange({
                            ...config,
                            heroGallery: {
                              ...config.heroGallery,
                              slides: moveOrderedItem(config.heroGallery.slides, idx, -1),
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
                            heroGallery: {
                              ...config.heroGallery,
                              slides: moveOrderedItem(config.heroGallery.slides, idx, 1),
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
                      value={slide.title}
                      onChange={(e) => patchSlide({ title: e.target.value })}
                      placeholder="Slide Title"
                      className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs"
                    />
                    <select
                      value={slide.theme}
                      onChange={(e) => patchSlide({ theme: e.target.value as "light" | "dark" })}
                      className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs bg-white"
                    >
                      <option value="dark">Dark Obsidian Theme</option>
                      <option value="light">Light Studio Theme</option>
                    </select>
                    <select
                      value={slide.productSlug || ""}
                      onChange={(e) =>
                        patchSlide({
                          productSlug: e.target.value || undefined,
                          buyTo: e.target.value ? `/shop/buy-iphone/${e.target.value}` : slide.buyTo,
                        })
                      }
                      className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs bg-white"
                    >
                      <option value="">-- Assign Supabase Product --</option>
                      {iphoneCatalogProducts.map((p) => (
                        <option key={p.id} value={p.slug}>
                          {p.name} (GH₵ {p.price})
                        </option>
                      ))}
                    </select>
                    <input
                      type="text"
                      value={slide.subtitle}
                      onChange={(e) => patchSlide({ subtitle: e.target.value })}
                      placeholder="Subtitle"
                      className="md:col-span-3 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs"
                    />
                  </div>
                  <ImageFieldControl
                    label="Slide Visual"
                    imageUrl={slide.image}
                    altText={slide.alt}
                    uploading={uploadingKey === slide.id}
                    onImageChange={(url, alt) => patchSlide({ image: url, alt: alt ?? slide.alt })}
                    onUploadFile={(f) =>
                      handleUpload(slide.id, f, slide.title, (url, alt) => patchSlide({ image: url, alt }))
                    }
                    onPickLibrary={onOpenMediaPicker}
                  />
                </div>
              );
            })}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3">
            <h4 className="text-sm font-extrabold text-slate-900">
              Chapter Navigation Strip ({config.chapterNavItems.length} items)
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {config.chapterNavItems.map((item, idx) => {
                const patchNav = (partial: Partial<IphoneChapterNavItem>) =>
                  onChange({
                    ...config,
                    chapterNavItems: config.chapterNavItems.map((c, i) =>
                      i === idx ? { ...c, ...partial } : c
                    ),
                  });
                return (
                  <div key={item.id} className="rounded-xl border border-slate-200 p-3 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <input
                        type="text"
                        value={item.label}
                        onChange={(e) => patchNav({ label: e.target.value })}
                        className="flex-1 rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-bold"
                      />
                      <input
                        type="text"
                        value={item.badge || ""}
                        onChange={(e) => patchNav({ badge: e.target.value || undefined })}
                        placeholder="Badge"
                        className="w-20 rounded-lg border border-slate-200 px-2 py-1 text-xs"
                      />
                    </div>
                    <input
                      type="text"
                      value={item.to}
                      onChange={(e) => patchNav({ to: e.target.value })}
                      placeholder="Destination URL"
                      className="w-full rounded-lg border border-slate-200 px-2.5 py-1 text-xs"
                    />
                    <ImageFieldControl
                      label="Icon Image"
                      imageUrl={item.image}
                      altText={item.alt}
                      uploading={uploadingKey === item.id}
                      onImageChange={(url, alt) => patchNav({ image: url, alt: alt ?? item.alt })}
                      onUploadFile={(f) =>
                        handleUpload(item.id, f, item.label, (url, alt) => patchNav({ image: url, alt }))
                      }
                      onPickLibrary={onOpenMediaPicker}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {activeSubTab === "lineup" && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h4 className="text-sm font-extrabold text-slate-900">
                Explore the Lineup Carousel ({config.lineupSection.cards.length} models)
              </h4>
              <p className="text-xs text-slate-500">
                Edit all models including off-screen carousel items, assign real Supabase products, and reorder.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                const next: IphoneLineupCard = {
                  id: `lineup-iphone-${Date.now()}`,
                  tileTone: "light",
                  title: "New iPhone Model",
                  description: "Genuine verified iPhone available at Buy & Sell GH.",
                  image: "/products/iphone-redesign/lineup-iphone-16.webp",
                  alt: "iPhone model",
                  fallbackPriceText: "From GH₵ 12,000",
                  learnMoreLabel: "Learn more",
                  learnMoreTo: "/shop/buy-iphone",
                  buyLabel: "Buy",
                  buyTo: "/shop/buy-iphone",
                  visible: true,
                  order: config.lineupSection.cards.length,
                };
                onChange({
                  ...config,
                  lineupSection: {
                    ...config.lineupSection,
                    cards: [...config.lineupSection.cards, next],
                  },
                });
              }}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-900 text-white"
            >
              <Plus size={13} />
              <span>Add iPhone Card</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              type="text"
              value={config.lineupSection.heading}
              onChange={(e) =>
                onChange({
                  ...config,
                  lineupSection: { ...config.lineupSection, heading: e.target.value },
                })
              }
              className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold"
              placeholder="Section Heading"
            />
            <input
              type="text"
              value={config.lineupSection.shopAllTo}
              onChange={(e) =>
                onChange({
                  ...config,
                  lineupSection: { ...config.lineupSection, shopAllTo: e.target.value },
                })
              }
              className="rounded-lg border border-slate-200 px-3 py-2 text-xs"
              placeholder="Shop All Destination"
            />
          </div>

          <div className="space-y-3">
            {config.lineupSection.cards.map((card, idx) => {
              const patchCard = (partial: Partial<IphoneLineupCard>) =>
                onChange({
                  ...config,
                  lineupSection: {
                    ...config.lineupSection,
                    cards: config.lineupSection.cards.map((c, i) => (i === idx ? { ...c, ...partial } : c)),
                  },
                });
              return (
                <div key={card.id} className="rounded-xl border border-slate-200 p-4 space-y-3 bg-slate-50/50">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-extrabold text-slate-900">
                      #{idx + 1} · {card.title}
                    </span>
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
                      <button
                        type="button"
                        onClick={() => patchCard({ visible: !card.visible })}
                        className="p-1 rounded border bg-white"
                      >
                        {card.visible ? <Eye size={12} /> : <EyeOff size={12} />}
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          onChange({
                            ...config,
                            lineupSection: {
                              ...config.lineupSection,
                              cards: config.lineupSection.cards.filter((_, i) => i !== idx),
                            },
                          })
                        }
                        className="p-1 rounded border border-rose-200 bg-rose-50 text-rose-600"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                    <input
                      type="text"
                      value={card.title}
                      onChange={(e) => patchCard({ title: e.target.value })}
                      placeholder="Model Name"
                      className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-bold"
                    />
                    <select
                      value={card.productSlug || ""}
                      onChange={(e) =>
                        patchCard({
                          productSlug: e.target.value || undefined,
                          buyTo: e.target.value ? `/shop/buy-iphone/${e.target.value}` : card.buyTo,
                        })
                      }
                      className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs bg-white"
                    >
                      <option value="">-- Assign Supabase iPhone --</option>
                      {iphoneCatalogProducts.map((p) => (
                        <option key={p.id} value={p.slug}>
                          {p.name} — GH₵ {p.price} ({p.stockStatus})
                        </option>
                      ))}
                    </select>
                    <select
                      value={card.tileTone}
                      onChange={(e) => patchCard({ tileTone: e.target.value as IphoneLineupCard["tileTone"] })}
                      className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs bg-white"
                    >
                      <option value="pearl">Pearl Studio Tile</option>
                      <option value="burgundy">Blush Burgundy Tile</option>
                      <option value="sky">Sky Blue Tile</option>
                      <option value="lavender">Soft Lavender Tile</option>
                      <option value="sand">Warm Sand Tile</option>
                      <option value="light">Light Neutral Tile</option>
                    </select>
                    <input
                      type="text"
                      value={card.badge || ""}
                      onChange={(e) => patchCard({ badge: e.target.value || undefined })}
                      placeholder="Badge (e.g. New)"
                      className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs"
                    />
                    <input
                      type="text"
                      value={card.buyTo}
                      onChange={(e) => patchCard({ buyTo: e.target.value })}
                      placeholder="Buy Link"
                      className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs"
                    />
                    <input
                      type="text"
                      value={card.learnMoreTo}
                      onChange={(e) => patchCard({ learnMoreTo: e.target.value })}
                      placeholder="Learn More Link"
                      className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs"
                    />
                    <textarea
                      value={card.description}
                      onChange={(e) => patchCard({ description: e.target.value })}
                      rows={2}
                      placeholder="Short product description"
                      className="md:col-span-3 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs"
                    />
                  </div>

                  <ImageFieldControl
                    label="Showcase Tile Image"
                    imageUrl={card.image}
                    altText={card.alt}
                    uploading={uploadingKey === card.id}
                    onImageChange={(url, alt) => patchCard({ image: url, alt: alt ?? card.alt })}
                    onUploadFile={(f) =>
                      handleUpload(card.id, f, card.title, (url, alt) => patchCard({ image: url, alt }))
                    }
                    onPickLibrary={onOpenMediaPicker}
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeSubTab === "why-shop" && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4">
          <h4 className="text-sm font-extrabold text-slate-900">
            Why Buy &amp; Sell GH Benefit Carousel ({config.whyShopSection.cards.length} cards)
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {config.whyShopSection.cards.map((card, idx) => {
              const patchWhy = (partial: Partial<IphoneBenefitCard>) =>
                onChange({
                  ...config,
                  whyShopSection: {
                    ...config.whyShopSection,
                    cards: config.whyShopSection.cards.map((c, i) => (i === idx ? { ...c, ...partial } : c)),
                  },
                });
              return (
                <div key={card.id} className="rounded-xl border border-slate-200 p-3.5 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold">Card #{idx + 1}: {card.eyebrow}</span>
                    <button
                      type="button"
                      onClick={() => patchWhy({ visible: !card.visible })}
                      className="p-1 rounded border bg-white"
                    >
                      {card.visible ? <Eye size={12} /> : <EyeOff size={12} />}
                    </button>
                  </div>
                  <input
                    type="text"
                    value={card.title}
                    onChange={(e) => patchWhy({ title: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-bold"
                  />
                  <textarea
                    value={card.description}
                    onChange={(e) => patchWhy({ description: e.target.value })}
                    rows={2}
                    className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs"
                  />
                  <ImageFieldControl
                    label="Card Visual"
                    imageUrl={card.image}
                    altText={card.alt}
                    uploading={uploadingKey === card.id}
                    onImageChange={(url, alt) => patchWhy({ image: url, alt: alt ?? card.alt })}
                    onUploadFile={(f) =>
                      handleUpload(card.id, f, card.title, (url, alt) => patchWhy({ image: url, alt }))
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
            <h4 className="text-sm font-extrabold text-slate-900">iPhone Essentials Cards</h4>
            {config.essentialsSection.cards.map((card, idx) => {
              const patchEss = (partial: Partial<IphoneEssentialCard>) =>
                onChange({
                  ...config,
                  essentialsSection: {
                    ...config.essentialsSection,
                    cards: config.essentialsSection.cards.map((c, i) => (i === idx ? { ...c, ...partial } : c)),
                  },
                });
              return (
                <div key={card.id} className="rounded-xl border border-slate-200 p-3.5 space-y-2.5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                    <input
                      type="text"
                      value={card.title}
                      onChange={(e) => patchEss({ title: e.target.value })}
                      className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-bold"
                    />
                    <input
                      type="text"
                      value={card.buyTo}
                      onChange={(e) => patchEss({ buyTo: e.target.value })}
                      className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs"
                    />
                  </div>
                  <textarea
                    value={card.description}
                    onChange={(e) => patchEss({ description: e.target.value })}
                    rows={2}
                    className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs"
                  />
                  <ImageFieldControl
                    label="Essentials Photo"
                    imageUrl={card.image}
                    altText={card.alt}
                    uploading={uploadingKey === card.id}
                    onImageChange={(url, alt) => patchEss({ image: url, alt: alt ?? card.alt })}
                    onUploadFile={(f) =>
                      handleUpload(card.id, f, card.title, (url, alt) => patchEss({ image: url, alt }))
                    }
                    onPickLibrary={onOpenMediaPicker}
                  />
                </div>
              );
            })}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3">
            <h4 className="text-sm font-extrabold text-slate-900">Significant Others Ecosystem Items</h4>
            {config.ecosystemSection.items.map((item, idx) => {
              const patchEco = (partial: Partial<IphoneEcosystemItem>) =>
                onChange({
                  ...config,
                  ecosystemSection: {
                    ...config.ecosystemSection,
                    items: config.ecosystemSection.items.map((e, i) => (i === idx ? { ...e, ...partial } : e)),
                  },
                });
              return (
                <div key={item.id} className="rounded-xl border border-slate-200 p-3.5 space-y-2.5">
                  <input
                    type="text"
                    value={item.title}
                    onChange={(e) => patchEco({ title: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-bold"
                  />
                  <textarea
                    value={item.description}
                    onChange={(e) => patchEco({ description: e.target.value })}
                    rows={2}
                    className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs"
                  />
                  <ImageFieldControl
                    label="Pairing Photo"
                    imageUrl={item.image}
                    altText={item.alt}
                    uploading={uploadingKey === item.id}
                    onImageChange={(url, alt) => patchEco({ image: url, alt: alt ?? item.alt })}
                    onUploadFile={(f) =>
                      handleUpload(item.id, f, item.title, (url, alt) => patchEco({ image: url, alt }))
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              type="text"
              value={config.directoryFooter.heading}
              onChange={(e) =>
                onChange({
                  ...config,
                  directoryFooter: { ...config.directoryFooter, heading: e.target.value },
                })
              }
              className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold"
            />
            <input
              type="text"
              value={config.directoryFooter.tagline}
              onChange={(e) =>
                onChange({
                  ...config,
                  directoryFooter: { ...config.directoryFooter, tagline: e.target.value },
                })
              }
              className="rounded-lg border border-slate-200 px-3 py-2 text-xs"
            />
          </div>
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
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs"
          />
        </div>
      )}
    </div>
  );
}
