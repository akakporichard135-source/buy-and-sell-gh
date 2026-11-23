import {
  ArrowLeft,
  ArrowRight,
  Image as ImageIcon,
  Plus,
  RotateCcw,
  Trash2,
  Upload,
} from "lucide-react";
import { useState } from "react";
import { defaultMainStoreConfig } from "../../cms/defaultCmsData";
import type {
  MainStoreAccessoryItem,
  MainStoreConfig,
  MainStoreDifferenceBentoItem,
  MainStoreDifferenceMiniCard,
  MainStoreEditorialTile,
  MainStoreHelpCard,
  MainStorePromoCard,
  MainStorePromoRibbonSlide,
  MainStoreQuickLink,
  MediaItem,
} from "../../cms/types";
import type { Product } from "../../types/product";
import { resolveCatalogueProductImage } from "../../utils/productImages";

export type MainStoreSubTabKey =
  | "sections"
  | "heroRibbon"
  | "families"
  | "latest"
  | "moreToLove"
  | "accessories"
  | "difference"
  | "audio"
  | "colorful"
  | "help"
  | "quickLinks"
  | "categories";

interface SharedEditorProps {
  config: MainStoreConfig;
  setConfig: React.Dispatch<React.SetStateAction<MainStoreConfig>>;
  products: Product[];
  uploadMedia: (file: File, category: MediaItem["category"], title?: string) => Promise<MediaItem>;
  onOpenMediaPicker: (onSelect: (item: MediaItem) => void) => void;
}

function moveItem<T>(list: T[], index: number, dir: -1 | 1): T[] {
  const nextIdx = index + dir;
  if (nextIdx < 0 || nextIdx >= list.length) return list;
  const copy = [...list];
  const [item] = copy.splice(index, 1);
  copy.splice(nextIdx, 0, item);
  return copy;
}

/* ============================================================================
   1. PROMO RIBBON & HERO EDITOR
   ============================================================================ */
export function StoreHeroRibbonAdminEditor({
  config,
  setConfig,
  uploadMedia,
  onOpenMediaPicker,
}: SharedEditorProps) {
  const [uploading, setUploading] = useState(false);
  const slides = config.promoRibbonSlides || defaultMainStoreConfig.promoRibbonSlides || [];
  const hero = {
    ...(defaultMainStoreConfig.heroConfig!),
    ...(config.heroConfig || {}),
  };

  const updateHero = (partial: Partial<typeof hero>) => {
    setConfig((prev) => ({
      ...prev,
      heroConfig: {
        ...(defaultMainStoreConfig.heroConfig!),
        ...(prev.heroConfig || {}),
        ...partial,
      },
    }));
  };

  const updateSlide = (idx: number, partial: Partial<MainStorePromoRibbonSlide>) => {
    setConfig((prev) => {
      const list = [...(prev.promoRibbonSlides || defaultMainStoreConfig.promoRibbonSlides || [])];
      list[idx] = { ...list[idx], ...partial };
      return { ...prev, promoRibbonSlides: list };
    });
  };

  return (
    <div className="space-y-6">
      {/* Hero Emblem & Headline */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Store Hero Header &amp; Center Emblem</h3>
          <p className="text-xs text-slate-500">
            Controls the 3-column Store intro row: left signature gold &ldquo;Store&rdquo; wordmark, center emblem artwork, and right tagline + quick support links.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="space-y-2.5">
            <div className="aspect-square max-h-48 w-full rounded-xl bg-[#f5f5f7] border border-slate-200 flex items-center justify-center p-3 overflow-hidden">
              {hero.emblemImage ? (
                <img
                  src={hero.emblemImage}
                  alt={hero.emblemAlt}
                  className="max-h-full max-w-full object-contain"
                />
              ) : (
                <span className="text-xs text-slate-400">No emblem set</span>
              )}
            </div>
            <div className="flex gap-2">
              <label className="flex-1 py-1.5 px-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-[0.7rem] flex items-center justify-center gap-1.5 cursor-pointer">
                <Upload size={13} />
                <span>{uploading ? "Uploading..." : "Upload Emblem"}</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/avif"
                  disabled={uploading}
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    setUploading(true);
                    try {
                      const uploaded = await uploadMedia(file, "storefront", "Store Hero Emblem");
                      updateHero({ emblemImage: uploaded.url, emblemAlt: uploaded.alt || uploaded.title });
                    } finally {
                      setUploading(false);
                    }
                  }}
                />
              </label>
              <button
                type="button"
                onClick={() =>
                  onOpenMediaPicker((item) =>
                    updateHero({ emblemImage: item.url, emblemAlt: item.alt || item.title })
                  )
                }
                className="flex-1 py-1.5 px-2 rounded-lg bg-[#d4af37]/15 hover:bg-[#d4af37]/25 text-amber-900 font-bold text-[0.7rem] flex items-center justify-center gap-1.5"
              >
                <ImageIcon size={13} />
                <span>Library</span>
              </button>
            </div>
            <button
              type="button"
              onClick={() =>
                updateHero({
                  emblemImage: defaultMainStoreConfig.heroConfig?.emblemImage || "",
                  emblemAlt: defaultMainStoreConfig.heroConfig?.emblemAlt || "",
                })
              }
              className="w-full py-1 text-[0.68rem] text-rose-600 hover:text-rose-800 font-semibold flex items-center justify-center gap-1"
            >
              <RotateCcw size={12} /> Reset Emblem to Default
            </button>
          </div>

          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[0.65rem] font-bold text-slate-500 uppercase block mb-1">
                Left Wordmark
              </label>
              <input
                type="text"
                value={hero.titleLead}
                onChange={(e) => updateHero({ titleLead: e.target.value })}
                className="admin-input text-xs w-full"
              />
            </div>
            <div>
              <label className="text-[0.65rem] font-bold text-slate-500 uppercase block mb-1">
                Right Tagline
              </label>
              <input
                type="text"
                value={hero.tagline}
                onChange={(e) => updateHero({ tagline: e.target.value })}
                className="admin-input text-xs w-full"
              />
            </div>
            <div>
              <label className="text-[0.65rem] font-bold text-slate-500 uppercase block mb-1">
                Support Link Label
              </label>
              <input
                type="text"
                value={hero.supportLabel}
                onChange={(e) => updateHero({ supportLabel: e.target.value })}
                className="admin-input text-xs w-full"
              />
            </div>
            <div>
              <label className="text-[0.65rem] font-bold text-slate-500 uppercase block mb-1">
                Support Link URL
              </label>
              <input
                type="text"
                value={hero.supportUrl}
                onChange={(e) => updateHero({ supportUrl: e.target.value })}
                className="admin-input text-xs w-full font-mono"
              />
            </div>
            <div>
              <label className="text-[0.65rem] font-bold text-slate-500 uppercase block mb-1">
                Showroom Link Label
              </label>
              <input
                type="text"
                value={hero.showroomLabel}
                onChange={(e) => updateHero({ showroomLabel: e.target.value })}
                className="admin-input text-xs w-full"
              />
            </div>
            <div>
              <label className="text-[0.65rem] font-bold text-slate-500 uppercase block mb-1">
                Showroom Link Path
              </label>
              <input
                type="text"
                value={hero.showroomUrl}
                onChange={(e) => updateHero({ showroomUrl: e.target.value })}
                className="admin-input text-xs w-full font-mono"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Top Promo Ribbon Slides */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Top Promotional Ribbon Slides ({slides.length})
            </h3>
            <p className="text-xs text-slate-500">
              Rotating white offer strip at the very top of /store (Accra delivery, trade-in, Pay Small-Small).
            </p>
          </div>
          <button
            type="button"
            onClick={() =>
              setConfig((prev) => ({
                ...prev,
                promoRibbonSlides: [
                  ...(prev.promoRibbonSlides || defaultMainStoreConfig.promoRibbonSlides || []),
                  {
                    id: `ribbon-${Date.now()}`,
                    text: "New Buy & Sell GH offer across Accra and nationwide.",
                    linkLabel: "Learn more",
                    linkTo: "/offers",
                    visible: true,
                  },
                ],
              }))
            }
            className="px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-bold flex items-center gap-1.5"
          >
            <Plus size={14} /> Add Slide
          </button>
        </div>

        <div className="space-y-3">
          {slides.map((slide, idx) => (
            <div
              key={slide.id || idx}
              className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-1 md:grid-cols-12 gap-2.5 items-end"
            >
              <div className="md:col-span-6">
                <label className="text-[0.65rem] font-bold text-slate-500 uppercase block mb-0.5">
                  Offer Text
                </label>
                <input
                  type="text"
                  value={slide.text}
                  onChange={(e) => updateSlide(idx, { text: e.target.value })}
                  className="admin-input text-xs w-full"
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-[0.65rem] font-bold text-slate-500 uppercase block mb-0.5">
                  Link Label
                </label>
                <input
                  type="text"
                  value={slide.linkLabel || ""}
                  onChange={(e) => updateSlide(idx, { linkLabel: e.target.value })}
                  className="admin-input text-xs w-full"
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-[0.65rem] font-bold text-slate-500 uppercase block mb-0.5">
                  Destination
                </label>
                <input
                  type="text"
                  value={slide.linkTo || ""}
                  onChange={(e) => updateSlide(idx, { linkTo: e.target.value })}
                  className="admin-input text-xs w-full font-mono"
                />
              </div>
              <div className="md:col-span-2 flex items-center justify-end gap-1.5">
                <button
                  type="button"
                  onClick={() => updateSlide(idx, { visible: slide.visible === false })}
                  className={`px-2 py-1.5 rounded-lg text-[0.68rem] font-bold ${
                    slide.visible !== false
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-slate-200 text-slate-600"
                  }`}
                >
                  {slide.visible !== false ? "Visible" : "Hidden"}
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setConfig((prev) => ({
                      ...prev,
                      promoRibbonSlides: (prev.promoRibbonSlides || []).filter((_, i) => i !== idx),
                    }))
                  }
                  className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600"
                  aria-label="Remove slide"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ============================================================================
   2. VIBRANT "THE LATEST" CARDS EDITOR (REORDERABLE + COLOR + LIVE PRODUCT LINK)
   ============================================================================ */
export function StoreLatestCardsAdminEditor({
  config,
  setConfig,
  products,
  uploadMedia,
  onOpenMediaPicker,
}: SharedEditorProps) {
  const [uploadingIdx, setUploadingIdx] = useState<number | null>(null);
  const cards = config.latestCards || defaultMainStoreConfig.latestCards;

  const updateCard = (idx: number, partial: Partial<MainStorePromoCard>) => {
    setConfig((prev) => {
      const list = [...(prev.latestCards || defaultMainStoreConfig.latestCards)];
      list[idx] = { ...list[idx], ...partial };
      return { ...prev, latestCards: list };
    });
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900">
            The Latest — Vibrant Studio Cards ({cards.length} Cards)
          </h3>
          <p className="text-xs text-slate-500">
            400×500 full-bleed pastel &amp; jewel-tone cards. Assign any active catalog product for automatic live GH₵ pricing and Buy links.
          </p>
        </div>
        <button
          type="button"
          onClick={() =>
            setConfig((prev) => ({
              ...prev,
              latestCards: [
                ...(prev.latestCards || defaultMainStoreConfig.latestCards),
                {
                  id: `latest-${Date.now()}`,
                  productSlug: products[0]?.slug || "iphone-18-pro",
                  eyebrow: "NEW ARRIVAL",
                  name: products[0]?.name || "Featured Device",
                  statement: "Original certified Apple hardware in Accra.",
                  image: "/products/store-redesign/latest-iphone-18-pro-blush.webp",
                  alt: "Featured hardware",
                  theme: "light",
                  backgroundColor: "#f8c6db",
                  learnMorePath: "/iphone",
                  actionPath: "/store",
                  actionLabel: "Buy",
                },
              ],
            }))
          }
          className="px-3.5 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold flex items-center gap-1.5"
        >
          <Plus size={14} /> Add Latest Card
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {cards.map((card, idx) => (
          <div
            key={card.id || idx}
            className="admin-card p-4 space-y-3 border border-slate-200 rounded-2xl bg-white shadow-sm flex flex-col justify-between"
          >
            <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-100">
              <span className="px-2 py-0.5 rounded bg-slate-100 text-[0.65rem] font-bold text-slate-700 uppercase truncate">
                #{idx + 1} • {card.name}
              </span>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  disabled={idx === 0}
                  onClick={() =>
                    setConfig((prev) => ({
                      ...prev,
                      latestCards: moveItem(prev.latestCards || defaultMainStoreConfig.latestCards, idx, -1),
                    }))
                  }
                  className="p-1 rounded bg-slate-100 hover:bg-slate-200 disabled:opacity-30"
                  title="Move Left"
                >
                  <ArrowLeft size={12} />
                </button>
                <button
                  type="button"
                  disabled={idx === cards.length - 1}
                  onClick={() =>
                    setConfig((prev) => ({
                      ...prev,
                      latestCards: moveItem(prev.latestCards || defaultMainStoreConfig.latestCards, idx, 1),
                    }))
                  }
                  className="p-1 rounded bg-slate-100 hover:bg-slate-200 disabled:opacity-30"
                  title="Move Right"
                >
                  <ArrowRight size={12} />
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setConfig((prev) => ({
                      ...prev,
                      latestCards: (prev.latestCards || defaultMainStoreConfig.latestCards).filter(
                        (_, i) => i !== idx
                      ),
                    }))
                  }
                  className="p-1 rounded bg-rose-50 hover:bg-rose-100 text-rose-600"
                  title="Remove Card"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>

            <div
              className="aspect-[4/5] rounded-xl overflow-hidden relative border border-slate-200"
              style={{ backgroundColor: card.backgroundColor || "#f5f5f7" }}
            >
              {card.image ? (
                <img
                  src={card.image}
                  alt={card.alt || card.name}
                  className="w-full h-full object-cover object-bottom"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs text-slate-400">
                  No Image
                </div>
              )}
              <div
                className={`absolute top-2.5 left-3 right-3 pointer-events-none ${
                  card.theme === "dark" ? "text-white" : "text-slate-900"
                }`}
              >
                <p className="text-[9px] font-bold uppercase opacity-75">{card.eyebrow}</p>
                <p className="text-sm font-bold leading-tight">{card.name}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <label className="flex-1 py-1.5 px-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold flex items-center justify-center gap-1.5 text-[0.7rem] cursor-pointer">
                <Upload size={13} />
                <span>{uploadingIdx === idx ? "Uploading..." : "Upload"}</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/avif"
                  disabled={uploadingIdx !== null}
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    setUploadingIdx(idx);
                    try {
                      const uploaded = await uploadMedia(file, "storefront", card.name);
                      updateCard(idx, { image: uploaded.url, alt: uploaded.alt || card.name });
                    } finally {
                      setUploadingIdx(null);
                    }
                  }}
                />
              </label>
              <button
                type="button"
                onClick={() =>
                  onOpenMediaPicker((item) =>
                    updateCard(idx, { image: item.url, alt: item.alt || card.name })
                  )
                }
                className="flex-1 py-1.5 px-2 rounded-lg bg-[#d4af37]/15 hover:bg-[#d4af37]/25 text-amber-900 font-bold flex items-center justify-center gap-1.5 text-[0.7rem]"
              >
                <ImageIcon size={13} />
                <span>Library</span>
              </button>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-100">
              <div>
                <label className="text-[0.65rem] font-bold text-slate-400 uppercase block mb-0.5">
                  Linked Live Product (GH₵ Price &amp; Stock)
                </label>
                <select
                  value={card.productSlug || card.id}
                  onChange={(e) => {
                    const slug = e.target.value;
                    const match = products.find((p) => p.slug === slug);
                    updateCard(idx, {
                      productSlug: slug,
                      name: match ? match.name : card.name,
                    });
                  }}
                  className="admin-input text-xs py-1 px-2 w-full"
                >
                  <option value={card.productSlug || card.id}>
                    {card.productSlug || card.id}
                  </option>
                  {products.map((p) => (
                    <option key={p.id} value={p.slug}>
                      {p.name} ({p.slug})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[0.65rem] font-bold text-slate-400 uppercase block mb-0.5">
                    Eyebrow
                  </label>
                  <input
                    type="text"
                    value={card.eyebrow}
                    onChange={(e) => updateCard(idx, { eyebrow: e.target.value })}
                    className="admin-input text-xs py-1 px-2 w-full"
                  />
                </div>
                <div>
                  <label className="text-[0.65rem] font-bold text-slate-400 uppercase block mb-0.5">
                    Title
                  </label>
                  <input
                    type="text"
                    value={card.name}
                    onChange={(e) => updateCard(idx, { name: e.target.value })}
                    className="admin-input text-xs py-1 px-2 w-full"
                  />
                </div>
              </div>

              <div>
                <label className="text-[0.65rem] font-bold text-slate-400 uppercase block mb-0.5">
                  Statement
                </label>
                <input
                  type="text"
                  value={card.statement}
                  onChange={(e) => updateCard(idx, { statement: e.target.value })}
                  className="admin-input text-xs py-1 px-2 w-full"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[0.65rem] font-bold text-slate-400 uppercase block mb-0.5">
                    Card Background
                  </label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="color"
                      value={card.backgroundColor || "#f8c6db"}
                      onChange={(e) => updateCard(idx, { backgroundColor: e.target.value })}
                      className="w-7 h-7 rounded border border-slate-200 cursor-pointer p-0.5"
                    />
                    <input
                      type="text"
                      value={card.backgroundColor || ""}
                      onChange={(e) => updateCard(idx, { backgroundColor: e.target.value })}
                      className="admin-input text-[0.7rem] py-1 px-1.5 w-full font-mono"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[0.65rem] font-bold text-slate-400 uppercase block mb-0.5">
                    Text Tone
                  </label>
                  <select
                    value={card.theme || "light"}
                    onChange={(e) =>
                      updateCard(idx, { theme: e.target.value as "light" | "dark" })
                    }
                    className="admin-input text-xs py-1 px-2 w-full"
                  >
                    <option value="light">Dark Text (Light Card)</option>
                    <option value="dark">White Text (Dark Card)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ============================================================================
   3. REUSABLE MIXED SHELF EDITOR (EDITORIAL PROMO TILES + LIVE PRODUCT TILES)
   Used for: Featured Picks (Shelf 2), Accessories (Shelf 3), Audio (Shelf 5), Power & Style (Shelf 6)
   ============================================================================ */
interface MixedShelfEditorProps extends SharedEditorProps {
  title: string;
  description: string;
  editorialKey:
    | "featuredEditorialCards"
    | "accessoriesEditorialCards"
    | "audioEditorialCards"
    | "colorfulEditorialCards";
  productsKey:
    | "featuredProductItems"
    | "accessories"
    | "audioItems"
    | "colorfulItems";
}

export function StoreMixedShelfAdminEditor({
  config,
  setConfig,
  products,
  uploadMedia,
  onOpenMediaPicker,
  title,
  description,
  editorialKey,
  productsKey,
}: MixedShelfEditorProps) {
  const [uploadingTag, setUploadingTag] = useState<string | null>(null);
  const [selectedSlugToAdd, setSelectedSlugToAdd] = useState("");

  const editorials: MainStoreEditorialTile[] =
    config[editorialKey] ?? (defaultMainStoreConfig[editorialKey] || []);
  const items: MainStoreAccessoryItem[] =
    config[productsKey] ?? (defaultMainStoreConfig[productsKey] || []);

  const updateEditorial = (idx: number, partial: Partial<MainStoreEditorialTile>) => {
    setConfig((prev) => {
      const list = [...(prev[editorialKey] ?? (defaultMainStoreConfig[editorialKey] || []))];
      list[idx] = { ...list[idx], ...partial };
      return { ...prev, [editorialKey]: list };
    });
  };

  const updateProductItem = (idx: number, partial: Partial<MainStoreAccessoryItem>) => {
    setConfig((prev) => {
      const list = [...(prev[productsKey] ?? (defaultMainStoreConfig[productsKey] || []))];
      list[idx] = { ...list[idx], ...partial };
      return { ...prev, [productsKey]: list };
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-bold text-slate-900">{title}</h3>
        <p className="text-xs text-slate-500">{description}</p>
      </div>

      {/* Part A: Colorful 400×500 Editorial Opener / Interstitial Tiles */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
              Editorial Feature Cards ({editorials.length})
            </h4>
            <p className="text-[0.72rem] text-slate-500">
              Full-bleed 400×500 colorful cards placed at Position 0 (opener), mid-shelf, or 99 (trailing).
            </p>
          </div>
          <button
            type="button"
            onClick={() =>
              setConfig((prev) => ({
                ...prev,
                [editorialKey]: [
                  ...(prev[editorialKey] ?? (defaultMainStoreConfig[editorialKey] || [])),
                  {
                    id: `ed-${Date.now()}`,
                    eyebrow: "FEATURED",
                    title: "New Editorial Highlight",
                    subtitle: "Curated original hardware in Accra.",
                    image: "/products/store-redesign/editorial-featured-red.webp",
                    alt: "Editorial highlight",
                    backgroundColor: "#e23542",
                    theme: "dark",
                    destination: "/store",
                    actionLabel: "Explore",
                    position: 0,
                  },
                ],
              }))
            }
            className="px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-bold flex items-center gap-1.5"
          >
            <Plus size={13} /> Add Editorial Card
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {editorials.map((tile, idx) => (
            <div
              key={tile.id || idx}
              className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2.5"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-[0.68rem] font-bold text-slate-700 uppercase">
                  Position #{tile.position ?? 0} • {tile.eyebrow || "Editorial"}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setConfig((prev) => ({
                      ...prev,
                      [editorialKey]: (prev[editorialKey] ?? []).filter((_, i) => i !== idx),
                    }))
                  }
                  className="p-1 rounded bg-rose-50 hover:bg-rose-100 text-rose-600"
                >
                  <Trash2 size={12} />
                </button>
              </div>

              <div
                className="aspect-[4/5] max-h-52 w-full rounded-xl overflow-hidden relative border border-slate-200"
                style={{ backgroundColor: tile.backgroundColor || "#f5f5f7" }}
              >
                {tile.image && (
                  <img
                    src={tile.image}
                    alt={tile.alt || tile.title}
                    className="w-full h-full object-cover object-bottom"
                  />
                )}
              </div>

              <div className="flex gap-2">
                <label className="flex-1 py-1 px-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-[0.7rem] font-bold flex items-center justify-center gap-1 cursor-pointer">
                  <Upload size={12} />
                  <span>{uploadingTag === `ed-${idx}` ? "..." : "Upload"}</span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/avif"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      setUploadingTag(`ed-${idx}`);
                      try {
                        const up = await uploadMedia(file, "storefront", tile.title);
                        updateEditorial(idx, { image: up.url, alt: up.alt || tile.title });
                      } finally {
                        setUploadingTag(null);
                      }
                    }}
                  />
                </label>
                <button
                  type="button"
                  onClick={() =>
                    onOpenMediaPicker((m) =>
                      updateEditorial(idx, { image: m.url, alt: m.alt || tile.title })
                    )
                  }
                  className="flex-1 py-1 px-2 rounded-lg bg-[#d4af37]/15 text-amber-900 text-[0.7rem] font-bold flex items-center justify-center gap-1"
                >
                  <ImageIcon size={12} /> Library
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={tile.eyebrow || ""}
                  placeholder="Eyebrow"
                  onChange={(e) => updateEditorial(idx, { eyebrow: e.target.value })}
                  className="admin-input text-xs py-1 px-2"
                />
                <input
                  type="number"
                  value={tile.position ?? 0}
                  onChange={(e) => updateEditorial(idx, { position: Number(e.target.value) })}
                  className="admin-input text-xs py-1 px-2"
                  title="Position index (0 = start, 99 = end)"
                />
              </div>
              <input
                type="text"
                value={tile.title}
                placeholder="Headline"
                onChange={(e) => updateEditorial(idx, { title: e.target.value })}
                className="admin-input text-xs py-1 px-2 w-full font-semibold"
              />
              <input
                type="text"
                value={tile.subtitle || ""}
                placeholder="Subtitle"
                onChange={(e) => updateEditorial(idx, { subtitle: e.target.value })}
                className="admin-input text-xs py-1 px-2 w-full"
              />
              <div className="grid grid-cols-3 gap-1.5">
                <input
                  type="text"
                  value={tile.destination}
                  placeholder="/path"
                  onChange={(e) => updateEditorial(idx, { destination: e.target.value })}
                  className="admin-input text-[0.7rem] py-1 px-1.5 font-mono col-span-1"
                />
                <input
                  type="color"
                  value={tile.backgroundColor || "#e23542"}
                  onChange={(e) => updateEditorial(idx, { backgroundColor: e.target.value })}
                  className="w-full h-7 rounded border border-slate-200 cursor-pointer p-0.5"
                />
                <select
                  value={tile.theme || "dark"}
                  onChange={(e) =>
                    updateEditorial(idx, { theme: e.target.value as "light" | "dark" })
                  }
                  className="admin-input text-[0.7rem] py-1 px-1"
                >
                  <option value="dark">Light Text</option>
                  <option value="light">Dark Text</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Part B: White 313×500 Live Catalog Product Cards */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
              Live Product Cards ({items.length})
            </h4>
            <p className="text-[0.72rem] text-slate-500">
              Crisp white product cards automatically pulling real GH₵ prices, color dots, stock badges, and Buy links from Supabase.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={selectedSlugToAdd}
              onChange={(e) => setSelectedSlugToAdd(e.target.value)}
              className="admin-input text-xs py-1.5 px-2.5 max-w-[230px]"
            >
              <option value="">Select product to add...</option>
              {products.map((p) => (
                <option key={p.id} value={p.slug}>
                  {p.name} ({p.category})
                </option>
              ))}
            </select>
            <button
              type="button"
              disabled={!selectedSlugToAdd}
              onClick={() => {
                if (!selectedSlugToAdd) return;
                const prod = products.find((p) => p.slug === selectedSlugToAdd);
                setConfig((prev) => ({
                  ...prev,
                  [productsKey]: [
                    ...(prev[productsKey] ?? (defaultMainStoreConfig[productsKey] || [])),
                    {
                      id: selectedSlugToAdd,
                      name: prod?.name || selectedSlugToAdd,
                      eyebrow: prod?.category || "Featured",
                      image: "",
                    },
                  ],
                }));
                setSelectedSlugToAdd("");
              }}
              className="px-3 py-1.5 rounded-xl bg-slate-900 disabled:opacity-40 text-white text-xs font-bold flex items-center gap-1"
            >
              <Plus size={13} /> Add Product
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {items.map((item, idx) => {
            const prod = products.find((p) => p.slug === item.id || p.id === item.id);
            const fallbackImg = prod ? resolveCatalogueProductImage(prod)?.src : "";
            const previewSrc = item.image?.trim() || fallbackImg || "";

            return (
              <div
                key={`${item.id}-${idx}`}
                className="p-3 rounded-xl border border-slate-200 bg-white space-y-2.5 flex flex-col justify-between"
              >
                <div className="flex items-center justify-between gap-1">
                  <span className="text-[0.65rem] font-bold text-slate-600 truncate">
                    #{idx + 1} • {item.name || prod?.name || item.id}
                  </span>
                  <div className="flex items-center gap-0.5 shrink-0">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() =>
                        setConfig((prev) => ({
                          ...prev,
                          [productsKey]: moveItem(prev[productsKey] ?? [], idx, -1),
                        }))
                      }
                      className="p-1 rounded bg-slate-100 disabled:opacity-30"
                    >
                      <ArrowLeft size={11} />
                    </button>
                    <button
                      type="button"
                      disabled={idx === items.length - 1}
                      onClick={() =>
                        setConfig((prev) => ({
                          ...prev,
                          [productsKey]: moveItem(prev[productsKey] ?? [], idx, 1),
                        }))
                      }
                      className="p-1 rounded bg-slate-100 disabled:opacity-30"
                    >
                      <ArrowRight size={11} />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setConfig((prev) => ({
                          ...prev,
                          [productsKey]: (prev[productsKey] ?? []).filter((_, i) => i !== idx),
                        }))
                      }
                      className="p-1 rounded bg-rose-50 text-rose-600"
                    >
                      <Trash2 size={11} />
                    </button>
                  </div>
                </div>

                <div className="aspect-square max-h-36 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center p-2">
                  {previewSrc ? (
                    <img
                      src={previewSrc}
                      alt={item.alt || prod?.name || item.id}
                      className="max-h-full max-w-full object-contain"
                    />
                  ) : (
                    <span className="text-[0.7rem] text-slate-400">No Image</span>
                  )}
                </div>

                <div className="flex gap-1.5">
                  <label className="flex-1 py-1 rounded bg-slate-100 hover:bg-slate-200 text-[0.66rem] font-bold flex items-center justify-center gap-1 cursor-pointer">
                    <Upload size={11} />
                    <span>{uploadingTag === `p-${idx}` ? "..." : "Upload"}</span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/avif"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        setUploadingTag(`p-${idx}`);
                        try {
                          const up = await uploadMedia(file, "product", item.name || item.id);
                          updateProductItem(idx, { image: up.url, alt: up.alt || item.name });
                        } finally {
                          setUploadingTag(null);
                        }
                      }}
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      onOpenMediaPicker((m) =>
                        updateProductItem(idx, { image: m.url, alt: m.alt || item.name })
                      )
                    }
                    className="flex-1 py-1 rounded bg-[#d4af37]/15 text-amber-900 text-[0.66rem] font-bold flex items-center justify-center gap-1"
                  >
                    <ImageIcon size={11} /> Library
                  </button>
                </div>

                <input
                  type="text"
                  value={item.eyebrow || ""}
                  placeholder="Badge / Violator"
                  onChange={(e) => updateProductItem(idx, { eyebrow: e.target.value })}
                  className="admin-input text-[0.7rem] py-1 px-2 w-full"
                />
                <input
                  type="text"
                  value={item.name || ""}
                  placeholder={prod?.name || item.id}
                  onChange={(e) => updateProductItem(idx, { name: e.target.value })}
                  className="admin-input text-[0.7rem] py-1 px-2 w-full"
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ============================================================================
   4. BENTO DIFFERENCE EDITOR (TALL CARDS + STACKED MINI-CARD PAIRS)
   ============================================================================ */
export function StoreDifferenceBentoAdminEditor({
  config,
  setConfig,
  uploadMedia,
  onOpenMediaPicker,
}: SharedEditorProps) {
  const [uploadingIdx, setUploadingIdx] = useState<number | null>(null);
  const items = config.differenceItems || defaultMainStoreConfig.differenceItems || [];

  const updateItem = (idx: number, partial: Partial<MainStoreDifferenceBentoItem>) => {
    setConfig((prev) => {
      const list = [...(prev.differenceItems || defaultMainStoreConfig.differenceItems || [])];
      list[idx] = { ...list[idx], ...partial };
      return { ...prev, differenceItems: list };
    });
  };

  const updateMini = (
    idx: number,
    slot: "topCard" | "bottomCard",
    partial: Partial<MainStoreDifferenceMiniCard>
  ) => {
    setConfig((prev) => {
      const list = [...(prev.differenceItems || defaultMainStoreConfig.differenceItems || [])];
      const existing = list[idx];
      if (!existing || !existing[slot]) return prev;
      list[idx] = {
        ...existing,
        [slot]: { ...existing[slot]!, ...partial },
      };
      return { ...prev, differenceItems: list };
    });
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900">
            The Buy &amp; Sell GH Difference — Bento Shelf ({items.length} Columns)
          </h3>
          <p className="text-xs text-slate-500">
            Supports full-height 400×500 editorial highlight cards and 2-row stacked 313×240 value cards.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() =>
              setConfig((prev) => ({
                ...prev,
                differenceItems: [
                  ...(prev.differenceItems || defaultMainStoreConfig.differenceItems || []),
                  {
                    id: `diff-tall-${Date.now()}`,
                    kind: "tall",
                    eyebrow: "BUY & SELL GH",
                    title: "New Highlight Card",
                    subtitle: "Genuine Ghana commerce advantage.",
                    image: "/products/store-redesign/bento-special-offers-navy.webp",
                    alt: "Highlight card",
                    backgroundColor: "#091e42",
                    theme: "dark",
                    destination: "/offers",
                  },
                ],
              }))
            }
            className="px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-bold flex items-center gap-1"
          >
            <Plus size={13} /> Add Tall Card
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {items.map((item, idx) => (
          <div
            key={item.id || idx}
            className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="px-2 py-0.5 rounded bg-slate-100 text-[0.65rem] font-bold uppercase text-slate-700">
                Col #{idx + 1} • {item.kind === "stack" ? "2-Row Stacked Pair" : "Tall Editorial"}
              </span>
              <div className="flex gap-1">
                <button
                  type="button"
                  disabled={idx === 0}
                  onClick={() =>
                    setConfig((prev) => ({
                      ...prev,
                      differenceItems: moveItem(prev.differenceItems || [], idx, -1),
                    }))
                  }
                  className="p-1 rounded bg-slate-100 disabled:opacity-30"
                >
                  <ArrowLeft size={12} />
                </button>
                <button
                  type="button"
                  disabled={idx === items.length - 1}
                  onClick={() =>
                    setConfig((prev) => ({
                      ...prev,
                      differenceItems: moveItem(prev.differenceItems || [], idx, 1),
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
                      differenceItems: (prev.differenceItems || []).filter((_, i) => i !== idx),
                    }))
                  }
                  className="p-1 rounded bg-rose-50 text-rose-600"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>

            {item.kind === "stack" && item.topCard && item.bottomCard ? (
              <div className="space-y-3">
                {(["topCard", "bottomCard"] as const).map((slot) => {
                  const mini = item[slot]!;
                  return (
                    <div
                      key={slot}
                      className="p-3 rounded-xl border border-slate-200 space-y-2"
                      style={{ backgroundColor: `${mini.backgroundColor}22` }}
                    >
                      <span className="text-[0.65rem] font-extrabold uppercase text-slate-500">
                        {slot === "topCard" ? "Top Mini-Card" : "Bottom Mini-Card"}
                      </span>
                      <input
                        type="text"
                        value={mini.eyebrow || ""}
                        placeholder="Eyebrow"
                        onChange={(e) => updateMini(idx, slot, { eyebrow: e.target.value })}
                        className="admin-input text-xs py-1 px-2 w-full"
                      />
                      <input
                        type="text"
                        value={mini.title}
                        placeholder="Headline"
                        onChange={(e) => updateMini(idx, slot, { title: e.target.value })}
                        className="admin-input text-xs py-1 px-2 w-full font-semibold"
                      />
                      <div className="grid grid-cols-3 gap-1.5">
                        <input
                          type="color"
                          value={mini.backgroundColor}
                          onChange={(e) => updateMini(idx, slot, { backgroundColor: e.target.value })}
                          className="w-full h-7 rounded border border-slate-200 cursor-pointer p-0.5"
                        />
                        <select
                          value={mini.theme}
                          onChange={(e) =>
                            updateMini(idx, slot, { theme: e.target.value as "light" | "dark" })
                          }
                          className="admin-input text-[0.7rem] py-1 px-1"
                        >
                          <option value="dark">Light Text</option>
                          <option value="light">Dark Text</option>
                        </select>
                        <input
                          type="text"
                          value={mini.destination}
                          onChange={(e) => updateMini(idx, slot, { destination: e.target.value })}
                          className="admin-input text-[0.7rem] py-1 px-1.5 font-mono"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-2.5">
                <div
                  className="aspect-[4/5] max-h-48 w-full rounded-xl overflow-hidden border border-slate-200"
                  style={{ backgroundColor: item.backgroundColor || "#091e42" }}
                >
                  {item.image && (
                    <img
                      src={item.image}
                      alt={item.alt || item.title}
                      className="w-full h-full object-cover object-bottom"
                    />
                  )}
                </div>
                <div className="flex gap-2">
                  <label className="flex-1 py-1 px-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-[0.7rem] font-bold flex items-center justify-center gap-1 cursor-pointer">
                    <Upload size={12} />
                    <span>{uploadingIdx === idx ? "..." : "Upload"}</span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/avif"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        setUploadingIdx(idx);
                        try {
                          const up = await uploadMedia(file, "storefront", item.title || "Bento Card");
                          updateItem(idx, { image: up.url, alt: up.alt || item.title });
                        } finally {
                          setUploadingIdx(null);
                        }
                      }}
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      onOpenMediaPicker((m) =>
                        updateItem(idx, { image: m.url, alt: m.alt || item.title })
                      )
                    }
                    className="flex-1 py-1 px-2 rounded-lg bg-[#d4af37]/15 text-amber-900 text-[0.7rem] font-bold flex items-center justify-center gap-1"
                  >
                    <ImageIcon size={12} /> Library
                  </button>
                </div>
                <input
                  type="text"
                  value={item.eyebrow || ""}
                  placeholder="Eyebrow"
                  onChange={(e) => updateItem(idx, { eyebrow: e.target.value })}
                  className="admin-input text-xs py-1 px-2 w-full"
                />
                <input
                  type="text"
                  value={item.title || ""}
                  placeholder="Headline"
                  onChange={(e) => updateItem(idx, { title: e.target.value })}
                  className="admin-input text-xs py-1 px-2 w-full font-semibold"
                />
                <input
                  type="text"
                  value={item.subtitle || ""}
                  placeholder="Subtitle"
                  onChange={(e) => updateItem(idx, { subtitle: e.target.value })}
                  className="admin-input text-xs py-1 px-2 w-full"
                />
                <div className="grid grid-cols-3 gap-1.5">
                  <input
                    type="color"
                    value={item.backgroundColor || "#091e42"}
                    onChange={(e) => updateItem(idx, { backgroundColor: e.target.value })}
                    className="w-full h-7 rounded border border-slate-200 cursor-pointer p-0.5"
                  />
                  <select
                    value={item.theme || "dark"}
                    onChange={(e) =>
                      updateItem(idx, { theme: e.target.value as "light" | "dark" })
                    }
                    className="admin-input text-[0.7rem] py-1 px-1"
                  >
                    <option value="dark">Light Text</option>
                    <option value="light">Dark Text</option>
                  </select>
                  <input
                    type="text"
                    value={item.destination || ""}
                    placeholder="/path"
                    onChange={(e) => updateItem(idx, { destination: e.target.value })}
                    className="admin-input text-[0.7rem] py-1 px-1.5 font-mono"
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ============================================================================
   5. WAYS TO SAVE & SUPPORT (HELP CARDS) EDITOR
   ============================================================================ */
export function StoreHelpCardsAdminEditor({
  config,
  setConfig,
  uploadMedia,
  onOpenMediaPicker,
}: SharedEditorProps) {
  const [uploadingIdx, setUploadingIdx] = useState<number | null>(null);
  const cards = config.helpCards || defaultMainStoreConfig.helpCards || [];

  const updateCard = (idx: number, partial: Partial<MainStoreHelpCard>) => {
    setConfig((prev) => {
      const list = [...(prev.helpCards || defaultMainStoreConfig.helpCards || [])];
      list[idx] = { ...list[idx], ...partial };
      return { ...prev, helpCards: list };
    });
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900">
            Ways to Save &amp; Support Cards ({cards.length} Cards)
          </h3>
          <p className="text-xs text-slate-500">
            400×500 editorial service cards (WhatsApp Support, Certified Repairs, Pay Small-Small, Trade-In, Pre-Order, Referrals).
          </p>
        </div>
        <button
          type="button"
          onClick={() =>
            setConfig((prev) => ({
              ...prev,
              helpCards: [
                ...(prev.helpCards || defaultMainStoreConfig.helpCards || []),
                {
                  id: `help-${Date.now()}`,
                  eyebrow: "CUSTOMER SERVICE",
                  title: "New Buy & Sell GH Service",
                  subtitle: "Trusted local support from our Dome Pillar 2 showroom.",
                  image: "/products/store-redesign/help-whatsapp-team.webp",
                  alt: "Buy & Sell GH support",
                  theme: "light",
                  backgroundColor: "#ffffff",
                  actionLabel: "Learn more",
                  actionPath: "/contact",
                },
              ],
            }))
          }
          className="px-3.5 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold flex items-center gap-1.5"
        >
          <Plus size={14} /> Add Service Card
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {cards.map((card, idx) => (
          <div
            key={card.id || idx}
            className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3"
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-[0.68rem] font-bold uppercase text-slate-700 truncate">
                #{idx + 1} • {card.eyebrow}
              </span>
              <div className="flex gap-1">
                <button
                  type="button"
                  disabled={idx === 0}
                  onClick={() =>
                    setConfig((prev) => ({
                      ...prev,
                      helpCards: moveItem(prev.helpCards || [], idx, -1),
                    }))
                  }
                  className="p-1 rounded bg-slate-100 disabled:opacity-30"
                >
                  <ArrowLeft size={12} />
                </button>
                <button
                  type="button"
                  disabled={idx === cards.length - 1}
                  onClick={() =>
                    setConfig((prev) => ({
                      ...prev,
                      helpCards: moveItem(prev.helpCards || [], idx, 1),
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
                      helpCards: (prev.helpCards || []).filter((_, i) => i !== idx),
                    }))
                  }
                  className="p-1 rounded bg-rose-50 text-rose-600"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>

            <div className="aspect-[16/10] rounded-xl overflow-hidden bg-slate-900 border border-slate-200">
              {card.image && (
                <img
                  src={card.image}
                  alt={card.alt || card.title}
                  className="w-full h-full object-cover"
                />
              )}
            </div>

            <div className="flex gap-2">
              <label className="flex-1 py-1 px-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-[0.7rem] font-bold flex items-center justify-center gap-1 cursor-pointer">
                <Upload size={12} />
                <span>{uploadingIdx === idx ? "..." : "Upload"}</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/avif"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    setUploadingIdx(idx);
                    try {
                      const up = await uploadMedia(file, "storefront", card.title);
                      updateCard(idx, { image: up.url, alt: up.alt || card.title });
                    } finally {
                      setUploadingIdx(null);
                    }
                  }}
                />
              </label>
              <button
                type="button"
                onClick={() =>
                  onOpenMediaPicker((m) =>
                    updateCard(idx, { image: m.url, alt: m.alt || card.title })
                  )
                }
                className="flex-1 py-1 px-2 rounded-lg bg-[#d4af37]/15 text-amber-900 text-[0.7rem] font-bold flex items-center justify-center gap-1"
              >
                <ImageIcon size={12} /> Library
              </button>
            </div>

            <input
              type="text"
              value={card.eyebrow}
              onChange={(e) => updateCard(idx, { eyebrow: e.target.value })}
              className="admin-input text-xs py-1 px-2 w-full"
              placeholder="Eyebrow"
            />
            <input
              type="text"
              value={card.title}
              onChange={(e) => updateCard(idx, { title: e.target.value })}
              className="admin-input text-xs py-1 px-2 w-full font-semibold"
              placeholder="Title"
            />
            <input
              type="text"
              value={card.subtitle}
              onChange={(e) => updateCard(idx, { subtitle: e.target.value })}
              className="admin-input text-xs py-1 px-2 w-full"
              placeholder="Subtitle"
            />
            <div className="grid grid-cols-2 gap-2">
              <select
                value={card.theme}
                onChange={(e) =>
                  updateCard(idx, {
                    theme: e.target.value as "light" | "dark",
                    backgroundColor: e.target.value === "dark" ? "#0a0a0c" : "#ffffff",
                  })
                }
                className="admin-input text-xs py-1 px-2"
              >
                <option value="light">White Card</option>
                <option value="dark">Obsidian Dark Card</option>
              </select>
              <input
                type="text"
                value={card.actionPath}
                onChange={(e) => updateCard(idx, { actionPath: e.target.value })}
                className="admin-input text-xs py-1 px-2 font-mono"
                placeholder="/repairs"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ============================================================================
   6. QUICK LINKS EDITOR
   ============================================================================ */
export function StoreQuickLinksAdminEditor({
  config,
  setConfig,
}: Pick<SharedEditorProps, "config" | "setConfig">) {
  const links = config.quickLinks || defaultMainStoreConfig.quickLinks || [];

  const updateLink = (idx: number, partial: Partial<MainStoreQuickLink>) => {
    setConfig((prev) => {
      const list = [...(prev.quickLinks || defaultMainStoreConfig.quickLinks || [])];
      list[idx] = { ...list[idx], ...partial };
      return { ...prev, quickLinks: list };
    });
  };

  return (
    <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900">
            Quick Links Strip ({links.length} Pills)
          </h3>
          <p className="text-xs text-slate-500">
            Outlined quick-action pill buttons displayed at the bottom of /store.
          </p>
        </div>
        <button
          type="button"
          onClick={() =>
            setConfig((prev) => ({
              ...prev,
              quickLinks: [
                ...(prev.quickLinks || defaultMainStoreConfig.quickLinks || []),
                { id: `ql-${Date.now()}`, label: "New Shortcut", to: "/store" },
              ],
            }))
          }
          className="px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-bold flex items-center gap-1"
        >
          <Plus size={13} /> Add Quick Link
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {links.map((item, idx) => (
          <div
            key={item.id || idx}
            className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2"
          >
            <input
              type="text"
              value={item.label}
              onChange={(e) => updateLink(idx, { label: e.target.value })}
              className="admin-input text-xs py-1 px-2 flex-1"
              placeholder="Pill Label"
            />
            <input
              type="text"
              value={item.to}
              onChange={(e) => updateLink(idx, { to: e.target.value })}
              className="admin-input text-xs py-1 px-2 flex-1 font-mono"
              placeholder="/path"
            />
            <button
              type="button"
              onClick={() =>
                setConfig((prev) => ({
                  ...prev,
                  quickLinks: (prev.quickLinks || []).filter((_, i) => i !== idx),
                }))
              }
              className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600"
            >
              <Trash2 size={13} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
