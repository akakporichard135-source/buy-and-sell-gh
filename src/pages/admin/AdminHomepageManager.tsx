import {
  AlertCircle,
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Eye,
  Grid,
  Image as ImageIcon,
  Layers,
  Layout,
  Plus,
  Save,
  Sparkles,
  Trash2,
  Upload,
  Volume2,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useCms } from "../../cms/CmsContext";
import type { HeroCampaign, HomepageContent, MediaItem, PromoTile, ServiceFlyer, Tone } from "../../cms/types";
import { AdminMediaLibrary } from "./AdminMediaLibrary";

export function AdminHomepageManager() {
  const { homepage, updateHomepage } = useCms();
  const [content, setContent] = useState<HomepageContent>(homepage);
  const [activeTab, setActiveTab] = useState<"heroes" | "tiles" | "flyers" | "announcement">("heroes");
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState("");

  // Sync state when homepage updates from Supabase
  useEffect(() => {
    if (homepage) {
      setContent(homepage);
    }
  }, [homepage]);

  // Media picker modal state
  const [mediaPickerTarget, setMediaPickerTarget] = useState<{
    section: "hero" | "tile" | "flyer";
    index: number;
    field: "image" | "mobileImage";
  } | null>(null);

  // Live preview state
  const [previewOpen, setPreviewOpen] = useState(false);

  // Sync state if homepage updates externally
  const handleSave = async () => {
    setSaving(true);
    setSaveError("");
    setSaveSuccess(false);
    try {
      await updateHomepage(content);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Failed to save homepage changes.");
    } finally {
      setSaving(false);
    }
  };

  // Reordering helpers
  const moveItem = <T,>(list: T[], index: number, direction: -1 | 1): T[] => {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= list.length) return list;
    const copy = [...list];
    [copy[index], copy[nextIndex]] = [copy[nextIndex], copy[index]];
    return copy;
  };

  const handleMediaSelected = (item: MediaItem) => {
    if (!mediaPickerTarget) return;
    const { section, index, field } = mediaPickerTarget;

    if (section === "hero") {
      const heroes = [...content.heroes];
      heroes[index] = { ...heroes[index], [field]: item.url };
      setContent({ ...content, heroes });
    } else if (section === "tile") {
      const tiles = [...content.tiles];
      tiles[index] = { ...tiles[index], image: item.url };
      setContent({ ...content, tiles });
    } else if (section === "flyer") {
      const flyers = [...content.serviceFlyers];
      flyers[index] = { ...flyers[index], image: item.url };
      setContent({ ...content, serviceFlyers: flyers });
    }

    setMediaPickerTarget(null);
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Card */}
      <div className="admin-header-card">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-[#d4af37]">
              Storefront CMS
            </span>
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-slate-300" />
            <span className="text-xs font-semibold text-slate-500">Live Homepage Layout</span>
          </div>
          <h2>Homepage Content &amp; Campaign Editor</h2>
          <p>
            Customize top announcements, full-width hero campaigns, 2-column promotional tiles,
            button destinations, and service flyer showcases appearing on buyandsellgh.com.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => setPreviewOpen(true)}
            className="admin-btn admin-btn-secondary"
          >
            <Eye size={16} />
            <span>Preview Layout</span>
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={handleSave}
            className="admin-btn admin-btn-primary"
          >
            <Save size={16} />
            <span>{saving ? "Saving Changes..." : "Publish to Homepage"}</span>
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 size={16} />
          <span>Homepage content successfully published to live website!</span>
        </div>
      )}

      {saveError && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
          <AlertCircle size={16} />
          <span>{saveError}</span>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 p-1.5 rounded-xl bg-slate-100/80 border border-slate-200">
        <button
          type="button"
          onClick={() => setActiveTab("heroes")}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
            activeTab === "heroes"
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Layout size={15} />
          <span>Hero Carousel ({content.heroes.filter((h) => h.enabled).length} Active)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("tiles")}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
            activeTab === "tiles"
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Grid size={15} />
          <span>Promotional Tiles ({content.tiles.filter((t) => t.enabled).length} Active)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("flyers")}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
            activeTab === "flyers"
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Layers size={15} />
          <span>Service Flyers ({content.serviceFlyers.filter((f) => f.enabled).length} Active)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("announcement")}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
            activeTab === "announcement"
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Volume2 size={15} />
          <span>Announcement Bar</span>
        </button>
      </div>

      {/* SECTION 1: HERO CAROUSEL */}
      {activeTab === "heroes" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Homepage Hero Slides</h3>
            <button
              type="button"
              onClick={() => {
                const newHero: HeroCampaign = {
                  id: `hero-${Date.now()}`,
                  title: "New Flagship Campaign",
                  subtitle: "Groundbreaking power and design.",
                  image: "/products/homepage/iphone-18-pro-hero-2x.webp",
                  alt: "Flagship hero campaign",
                  tone: "dark",
                  primary: { label: "Learn more", to: "/store" },
                  secondary: { label: "View pricing", to: "/store" },
                  enabled: true,
                  order: content.heroes.length + 1,
                };
                setContent({ ...content, heroes: [...content.heroes, newHero] });
              }}
              className="admin-btn admin-btn-sm admin-btn-secondary"
            >
              <Plus size={14} />
              <span>Add Hero Slide</span>
            </button>
          </div>

          <div className="space-y-4">
            {content.heroes.map((hero, index) => (
              <div
                key={hero.id}
                className={`admin-card p-5 space-y-4 border transition ${
                  hero.enabled ? "border-slate-200" : "border-slate-200/50 bg-slate-50/50 opacity-60"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-[#d4af37]/15 text-[#d4af37] font-bold text-xs flex items-center justify-center shrink-0">
                      {index + 1}
                    </span>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{hero.title || "Untitled Slide"}</h4>
                      <p className="text-xs text-slate-500">{hero.subtitle}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer mr-2">
                      <input
                        type="checkbox"
                        checked={hero.enabled}
                        onChange={(e) => {
                          const heroes = [...content.heroes];
                          heroes[index] = { ...heroes[index], enabled: e.target.checked };
                          setContent({ ...content, heroes });
                        }}
                        className="rounded border-slate-300 text-[#d4af37] focus:ring-[#d4af37]"
                      />
                      <span>Active on Storefront</span>
                    </label>

                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => setContent({ ...content, heroes: moveItem(content.heroes, index, -1) })}
                      className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 disabled:opacity-30"
                      title="Move up"
                    >
                      <ArrowUp size={14} />
                    </button>
                    <button
                      type="button"
                      disabled={index === content.heroes.length - 1}
                      onClick={() => setContent({ ...content, heroes: moveItem(content.heroes, index, 1) })}
                      className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 disabled:opacity-30"
                      title="Move down"
                    >
                      <ArrowDown size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const heroes = content.heroes.filter((_, i) => i !== index);
                        setContent({ ...content, heroes });
                      }}
                      className="p-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50"
                      title="Delete slide"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Headline Title *</label>
                    <input
                      type="text"
                      value={hero.title}
                      onChange={(e) => {
                        const heroes = [...content.heroes];
                        heroes[index] = { ...heroes[index], title: e.target.value };
                        setContent({ ...content, heroes });
                      }}
                      className="w-full p-2.5 rounded-lg border border-slate-200 bg-white"
                      placeholder="e.g. iPhone 18 Pro"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Subtitle / Tagline</label>
                    <input
                      type="text"
                      value={hero.subtitle}
                      onChange={(e) => {
                        const heroes = [...content.heroes];
                        heroes[index] = { ...heroes[index], subtitle: e.target.value };
                        setContent({ ...content, heroes });
                      }}
                      className="w-full p-2.5 rounded-lg border border-slate-200 bg-white"
                      placeholder="e.g. Pro further."
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Display Tone</label>
                    <select
                      value={hero.tone}
                      onChange={(e) => {
                        const heroes = [...content.heroes];
                        heroes[index] = { ...heroes[index], tone: e.target.value as Tone };
                        setContent({ ...content, heroes });
                      }}
                      className="w-full p-2.5 rounded-lg border border-slate-200 bg-white font-semibold"
                    >
                      <option value="dark">Dark Theme (White Text on Dark Imagery)</option>
                      <option value="light">Light Theme (Dark Text on Clean Bright Imagery)</option>
                      <option value="mist">Mist Theme (Subtle Neutral Background)</option>
                    </select>
                  </div>

                  <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-4 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                    {/* Desktop Hero Image */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="block font-bold text-slate-800 text-xs">Desktop Hero Image *</label>
                        <span className="text-[0.65rem] text-slate-400 font-semibold">Recommended: 2880×1200 or 1440×600</span>
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={hero.image}
                          onChange={(e) => {
                            const heroes = [...content.heroes];
                            heroes[index] = { ...heroes[index], image: e.target.value };
                            setContent({ ...content, heroes });
                          }}
                          className="w-full p-2 rounded-lg border border-slate-200 bg-white font-mono text-[0.7rem]"
                          placeholder="/products/homepage/iphone-18-pro-hero-2x.webp"
                        />
                        <button
                          type="button"
                          onClick={() => setMediaPickerTarget({ section: "hero", index, field: "image" })}
                          className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-[#d4af37] text-white font-bold flex items-center gap-1.5 shrink-0 transition text-xs"
                        >
                          <ImageIcon size={13} />
                          <span>Change Image</span>
                        </button>
                      </div>
                      <div className="h-24 bg-slate-900 rounded-lg overflow-hidden flex items-center justify-center border border-slate-300/80 p-1">
                        <img src={hero.image} alt={hero.alt} className="max-h-full max-w-full object-contain" />
                      </div>
                    </div>

                    {/* Mobile Hero Image */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="block font-bold text-slate-800 text-xs">Mobile Hero Image (Optional)</label>
                        <span className="text-[0.65rem] text-slate-400 font-semibold">Recommended: 680×880 or vertical portrait</span>
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={hero.mobileImage || ""}
                          onChange={(e) => {
                            const heroes = [...content.heroes];
                            heroes[index] = { ...heroes[index], mobileImage: e.target.value || undefined };
                            setContent({ ...content, heroes });
                          }}
                          className="w-full p-2 rounded-lg border border-slate-200 bg-white font-mono text-[0.7rem]"
                          placeholder="Select from Media Library or leave empty to use desktop image"
                        />
                        <button
                          type="button"
                          onClick={() => setMediaPickerTarget({ section: "hero", index, field: "mobileImage" })}
                          className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-[#d4af37] text-white hover:text-slate-950 font-bold flex items-center gap-1.5 shrink-0 transition text-xs shadow-sm"
                        >
                          <ImageIcon size={13} />
                          <span>Pick Mobile</span>
                        </button>
                        {hero.mobileImage && (
                          <button
                            type="button"
                            onClick={() => {
                              const heroes = [...content.heroes];
                              heroes[index] = { ...heroes[index], mobileImage: undefined };
                              setContent({ ...content, heroes });
                            }}
                            className="px-2.5 py-1.5 rounded-lg text-rose-600 hover:bg-rose-50 text-xs font-bold transition whitespace-nowrap shrink-0"
                            title="Clear mobile image"
                          >
                            Clear
                          </button>
                        )}
                      </div>
                      <div className="h-24 bg-slate-900 rounded-lg overflow-hidden flex items-center justify-center border border-slate-300/80 p-1">
                        {hero.mobileImage ? (
                          <img
                            src={hero.mobileImage}
                            alt="Mobile preview"
                            className="max-h-full max-w-full object-contain"
                            onError={(e) => {
                              if (hero.id === "iphone-18-pro" && !e.currentTarget.src.includes("iphone-18-pro-hero-mobile.jpg")) {
                                e.currentTarget.src = "/products/homepage/iphone-18-pro-hero-mobile.jpg";
                              }
                            }}
                          />
                        ) : (
                          <span className="text-[0.65rem] text-slate-400 font-medium">
                            Inheriting Desktop Image on Mobile
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Accessibility Alt Text</label>
                    <input
                      type="text"
                      value={hero.alt}
                      onChange={(e) => {
                        const heroes = [...content.heroes];
                        heroes[index] = { ...heroes[index], alt: e.target.value };
                        setContent({ ...content, heroes });
                      }}
                      className="w-full p-2.5 rounded-lg border border-slate-200 bg-white"
                      placeholder="Descriptive image summary"
                    />
                  </div>

                  {/* Button 1 */}
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
                    <span className="block font-bold text-slate-800">Primary Button</span>
                    <input
                      type="text"
                      value={hero.primary.label}
                      onChange={(e) => {
                        const heroes = [...content.heroes];
                        heroes[index] = { ...heroes[index], primary: { ...heroes[index].primary, label: e.target.value } };
                        setContent({ ...content, heroes });
                      }}
                      placeholder="Button label (e.g. Learn more)"
                      className="w-full p-2 rounded border border-slate-200 bg-white"
                    />
                    <input
                      type="text"
                      value={hero.primary.to}
                      onChange={(e) => {
                        const heroes = [...content.heroes];
                        heroes[index] = { ...heroes[index], primary: { ...heroes[index].primary, to: e.target.value } };
                        setContent({ ...content, heroes });
                      }}
                      placeholder="Destination URL (e.g. /iphone/iphone-18-pro)"
                      className="w-full p-2 rounded border border-slate-200 bg-white font-mono text-[0.7rem]"
                    />
                  </div>

                  {/* Button 2 */}
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
                    <span className="block font-bold text-slate-800">Secondary Button (Optional)</span>
                    <input
                      type="text"
                      value={hero.secondary?.label ?? ""}
                      onChange={(e) => {
                        const heroes = [...content.heroes];
                        heroes[index] = {
                          ...heroes[index],
                          secondary: { label: e.target.value, to: hero.secondary?.to || "/store" },
                        };
                        setContent({ ...content, heroes });
                      }}
                      placeholder="Button label (e.g. View pricing)"
                      className="w-full p-2 rounded border border-slate-200 bg-white"
                    />
                    <input
                      type="text"
                      value={hero.secondary?.to ?? ""}
                      onChange={(e) => {
                        const heroes = [...content.heroes];
                        heroes[index] = {
                          ...heroes[index],
                          secondary: { label: hero.secondary?.label || "Buy", to: e.target.value },
                        };
                        setContent({ ...content, heroes });
                      }}
                      placeholder="Destination URL (e.g. /shop/buy-iphone/...)"
                      className="w-full p-2 rounded border border-slate-200 bg-white font-mono text-[0.7rem]"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 2: PROMOTIONAL TILES */}
      {activeTab === "tiles" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Promotional Grid Tiles</h3>
            <button
              type="button"
              onClick={() => {
                const newTile: PromoTile = {
                  id: `tile-${Date.now()}`,
                  title: "Featured Product Tile",
                  subtitle: "Engineered for extraordinary moments.",
                  image: "/products/homepage/macbook-air.jpg",
                  alt: "Product promo tile",
                  tone: "light",
                  primary: { label: "Learn more", to: "/store" },
                  secondary: { label: "View pricing", to: "/store" },
                  enabled: true,
                  order: content.tiles.length + 1,
                };
                setContent({ ...content, tiles: [...content.tiles, newTile] });
              }}
              className="admin-btn admin-btn-sm admin-btn-secondary"
            >
              <Plus size={14} />
              <span>Add Promotional Tile</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {content.tiles.map((tile, index) => (
              <div
                key={tile.id}
                className={`admin-card p-4 space-y-3 border transition ${
                  tile.enabled ? "border-slate-200" : "border-slate-200/50 bg-slate-50/50 opacity-60"
                }`}
              >
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-900 text-white font-bold text-[0.65rem] flex items-center justify-center">
                      {index + 1}
                    </span>
                    <h4 className="font-bold text-slate-900 text-xs truncate max-w-[150px]">
                      {tile.title}
                    </h4>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <label className="flex items-center gap-1 text-[0.7rem] font-bold text-slate-700 cursor-pointer mr-1">
                      <input
                        type="checkbox"
                        checked={tile.enabled}
                        onChange={(e) => {
                          const tiles = [...content.tiles];
                          tiles[index] = { ...tiles[index], enabled: e.target.checked };
                          setContent({ ...content, tiles });
                        }}
                        className="rounded border-slate-300 text-[#d4af37]"
                      />
                      <span>Active</span>
                    </label>

                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => setContent({ ...content, tiles: moveItem(content.tiles, index, -1) })}
                      className="p-1 rounded border border-slate-200 hover:bg-slate-100 text-slate-600 disabled:opacity-30"
                    >
                      <ArrowUp size={12} />
                    </button>
                    <button
                      type="button"
                      disabled={index === content.tiles.length - 1}
                      onClick={() => setContent({ ...content, tiles: moveItem(content.tiles, index, 1) })}
                      className="p-1 rounded border border-slate-200 hover:bg-slate-100 text-slate-600 disabled:opacity-30"
                    >
                      <ArrowDown size={12} />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const tiles = content.tiles.filter((_, i) => i !== index);
                        setContent({ ...content, tiles });
                      }}
                      className="p-1 rounded border border-rose-200 text-rose-600 hover:bg-rose-50"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-0.5">Title</label>
                    <input
                      type="text"
                      value={tile.title}
                      onChange={(e) => {
                        const tiles = [...content.tiles];
                        tiles[index] = { ...tiles[index], title: e.target.value };
                        setContent({ ...content, tiles });
                      }}
                      className="w-full p-2 rounded-lg border border-slate-200 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-0.5">Subtitle</label>
                    <input
                      type="text"
                      value={tile.subtitle}
                      onChange={(e) => {
                        const tiles = [...content.tiles];
                        tiles[index] = { ...tiles[index], subtitle: e.target.value };
                        setContent({ ...content, tiles });
                      }}
                      className="w-full p-2 rounded-lg border border-slate-200 bg-white"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block font-bold text-slate-700 text-xs">Tile Image Artwork *</label>
                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        value={tile.image}
                        onChange={(e) => {
                          const tiles = [...content.tiles];
                          tiles[index] = { ...tiles[index], image: e.target.value };
                          setContent({ ...content, tiles });
                        }}
                        className="w-full p-2 rounded-lg border border-slate-200 bg-white font-mono text-[0.68rem]"
                      />
                      <button
                        type="button"
                        onClick={() => setMediaPickerTarget({ section: "tile", index, field: "image" })}
                        className="px-3 py-1.5 rounded-lg bg-[#d4af37] hover:bg-slate-900 text-white font-bold shrink-0 text-xs flex items-center gap-1 transition"
                      >
                        <ImageIcon size={13} />
                        <span>Change Image</span>
                      </button>
                    </div>
                    <div className="aspect-[16/9] bg-slate-100 rounded-lg overflow-hidden flex items-center justify-center border border-slate-200 max-h-28 mt-2 p-1">
                      <img
                        src={tile.image}
                        alt={tile.alt || tile.title}
                        className="w-full h-full object-contain"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block font-bold text-slate-700 mb-0.5">Tone</label>
                      <select
                        value={tile.tone}
                        onChange={(e) => {
                          const tiles = [...content.tiles];
                          tiles[index] = { ...tiles[index], tone: e.target.value as Tone };
                          setContent({ ...content, tiles });
                        }}
                        className="w-full p-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold"
                      >
                        <option value="light">Light</option>
                        <option value="dark">Dark</option>
                        <option value="mist">Mist</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-0.5">Placement</label>
                      <select
                        value={tile.placement || "top"}
                        onChange={(e) => {
                          const tiles = [...content.tiles];
                          tiles[index] = {
                            ...tiles[index],
                            placement: e.target.value === "bottom" ? "bottom" : undefined,
                          };
                          setContent({ ...content, tiles });
                        }}
                        className="w-full p-1.5 rounded-lg border border-slate-200 bg-white text-xs"
                      >
                        <option value="top">Top Aligned Text</option>
                        <option value="bottom">Bottom Aligned Text</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div>
                      <label className="block font-bold text-slate-700 mb-0.5">Primary Link</label>
                      <input
                        type="text"
                        value={tile.primary.to}
                        onChange={(e) => {
                          const tiles = [...content.tiles];
                          tiles[index] = { ...tiles[index], primary: { ...tiles[index].primary, to: e.target.value } };
                          setContent({ ...content, tiles });
                        }}
                        placeholder="/store"
                        className="w-full p-1.5 rounded border border-slate-200 bg-white font-mono text-[0.68rem]"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-0.5">Button Label</label>
                      <input
                        type="text"
                        value={tile.primary.label}
                        onChange={(e) => {
                          const tiles = [...content.tiles];
                          tiles[index] = { ...tiles[index], primary: { ...tiles[index].primary, label: e.target.value } };
                          setContent({ ...content, tiles });
                        }}
                        placeholder="Learn more"
                        className="w-full p-1.5 rounded border border-slate-200 bg-white text-xs"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 3: SERVICE FLYERS */}
      {activeTab === "flyers" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Our Services Showcase Flyers</h3>
            <button
              type="button"
              onClick={() => {
                const newFlyer: ServiceFlyer = {
                  id: `flyer-${Date.now()}`,
                  title: "Special Promotion Flyer",
                  image: "/services/repairs.png",
                  alt: "Service flyer showcase",
                  to: "/contact",
                  enabled: true,
                  order: content.serviceFlyers.length + 1,
                };
                setContent({ ...content, serviceFlyers: [...content.serviceFlyers, newFlyer] });
              }}
              className="admin-btn admin-btn-sm admin-btn-secondary"
            >
              <Plus size={14} />
              <span>Add Flyer</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {content.serviceFlyers.map((flyer, index) => (
              <div
                key={flyer.id}
                className={`admin-card p-4 space-y-3 border transition ${
                  flyer.enabled ? "border-slate-200" : "border-slate-200/50 bg-slate-50/50 opacity-60"
                }`}
              >
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <h4 className="font-bold text-slate-900 text-xs truncate">{flyer.title}</h4>
                  <div className="flex items-center gap-1.5">
                    <label className="flex items-center gap-1 text-[0.7rem] font-bold text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={flyer.enabled}
                        onChange={(e) => {
                          const flyers = [...content.serviceFlyers];
                          flyers[index] = { ...flyers[index], enabled: e.target.checked };
                          setContent({ ...content, serviceFlyers: flyers });
                        }}
                        className="rounded border-slate-300 text-[#d4af37]"
                      />
                      <span>Active</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        const flyers = content.serviceFlyers.filter((_, i) => i !== index);
                        setContent({ ...content, serviceFlyers: flyers });
                      }}
                      className="p-1 rounded text-rose-500 hover:text-rose-700"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                <div className="aspect-[3/4] bg-slate-100 rounded-lg overflow-hidden flex items-center justify-center border border-slate-200 p-1">
                  <img src={flyer.image} alt={flyer.alt} className="w-full h-full object-contain" />
                </div>

                <div className="space-y-2 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-0.5">Title</label>
                    <input
                      type="text"
                      value={flyer.title}
                      onChange={(e) => {
                        const flyers = [...content.serviceFlyers];
                        flyers[index] = { ...flyers[index], title: e.target.value };
                        setContent({ ...content, serviceFlyers: flyers });
                      }}
                      className="w-full p-2 rounded border border-slate-200 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-0.5">Destination Link</label>
                    <input
                      type="text"
                      value={flyer.to}
                      onChange={(e) => {
                        const flyers = [...content.serviceFlyers];
                        flyers[index] = { ...flyers[index], to: e.target.value };
                        setContent({ ...content, serviceFlyers: flyers });
                      }}
                      className="w-full p-2 rounded border border-slate-200 bg-white font-mono text-[0.7rem]"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => setMediaPickerTarget({ section: "flyer", index, field: "image" })}
                    className="w-full py-2 rounded-lg bg-[#d4af37] hover:bg-slate-900 text-white font-bold flex items-center justify-center gap-1.5 transition text-xs shadow-sm"
                  >
                    <ImageIcon size={13} />
                    <span>Change Flyer Artwork</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 4: ANNOUNCEMENT BAR */}
      {activeTab === "announcement" && (
        <div className="admin-card space-y-4 max-w-2xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Top Homepage Announcement Bar</h3>
              <p className="text-xs text-slate-500">
                A prominent banner at the very top of the homepage highlighting promotions or trade-in perks.
              </p>
            </div>
            <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={content.announcement.enabled}
                onChange={(e) =>
                  setContent({
                    ...content,
                    announcement: { ...content.announcement, enabled: e.target.checked },
                  })
                }
                className="rounded border-slate-300 text-[#d4af37]"
              />
              <span>Banner Active</span>
            </label>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Announcement Message *</label>
              <input
                type="text"
                value={content.announcement.text}
                onChange={(e) =>
                  setContent({
                    ...content,
                    announcement: { ...content.announcement, text: e.target.value },
                  })
                }
                className="w-full p-2.5 rounded-lg border border-slate-200 bg-white"
                placeholder="e.g. Trade in your current device toward your next one."
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Link Label</label>
                <input
                  type="text"
                  value={content.announcement.linkText}
                  onChange={(e) =>
                    setContent({
                      ...content,
                      announcement: { ...content.announcement, linkText: e.target.value },
                    })
                  }
                  className="w-full p-2.5 rounded-lg border border-slate-200 bg-white"
                  placeholder="e.g. Explore trade-in"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Link Destination</label>
                <input
                  type="text"
                  value={content.announcement.linkTo}
                  onChange={(e) =>
                    setContent({
                      ...content,
                      announcement: { ...content.announcement, linkTo: e.target.value },
                    })
                  }
                  className="w-full p-2.5 rounded-lg border border-slate-200 bg-white font-mono text-[0.7rem]"
                  placeholder="/sell-or-trade?mode=upgrade"
                />
              </div>
            </div>

            {/* Live Preview Box */}
            <div className="pt-2">
              <span className="block font-bold text-slate-500 mb-1.5">Storefront Preview:</span>
              <div className="p-3 bg-slate-900 text-white rounded-lg text-center text-xs font-medium">
                {content.announcement.text}{" "}
                <span className="text-[#d4af37] underline font-bold cursor-pointer">
                  {content.announcement.linkText} &rsaquo;
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Media Picker Modal */}
      {mediaPickerTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setMediaPickerTarget(null)}
        >
          <div
            className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl p-6 space-y-4 max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ImageIcon size={18} className="text-[#d4af37]" />
                <h3 className="font-bold text-slate-900 text-sm">Select Image from Media Library</h3>
              </div>
              <button
                type="button"
                onClick={() => setMediaPickerTarget(null)}
                className="p-1 text-slate-400 hover:text-slate-900"
              >
                <X size={18} />
              </button>
            </div>

            <AdminMediaLibrary isPicker onSelect={handleMediaSelected} />
          </div>
        </div>
      )}

      {/* Live Preview Modal */}
      {previewOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md"
          onClick={() => setPreviewOpen(false)}
        >
          <div
            className="w-full max-w-5xl bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 bg-slate-900 text-white">
              <div className="flex items-center gap-2">
                <Eye size={18} className="text-[#d4af37]" />
                <span className="font-bold text-sm">Homepage Live Preview</span>
              </div>
              <button
                type="button"
                onClick={() => setPreviewOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50">
              {/* Announcement */}
              {content.announcement.enabled && (
                <div className="p-3 bg-slate-900 text-white rounded-xl text-center text-xs font-semibold">
                  {content.announcement.text}{" "}
                  <span className="text-[#d4af37] underline">{content.announcement.linkText} &rsaquo;</span>
                </div>
              )}

              {/* Heroes */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Hero Slides</h4>
                {content.heroes
                  .filter((h) => h.enabled)
                  .map((hero) => (
                    <div
                      key={hero.id}
                      className={`p-6 rounded-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6 ${
                        hero.tone === "dark" ? "bg-slate-950 text-white" : "bg-white text-slate-900 border border-slate-200"
                      }`}
                    >
                      <div className="space-y-2 text-center md:text-left z-10">
                        <h2 className="text-2xl font-black">{hero.title}</h2>
                        <p className="text-sm opacity-80">{hero.subtitle}</p>
                        <div className="flex items-center gap-2 pt-2 justify-center md:justify-start">
                          <span className="px-4 py-1.5 rounded-full bg-[#d4af37] text-slate-900 font-bold text-xs">
                            {hero.primary.label}
                          </span>
                          {hero.secondary && (
                            <span className="px-4 py-1.5 rounded-full border border-current font-bold text-xs opacity-75">
                              {hero.secondary.label}
                            </span>
                          )}
                        </div>
                      </div>
                      <img src={hero.image} alt={hero.alt} className="max-h-48 object-contain" />
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
