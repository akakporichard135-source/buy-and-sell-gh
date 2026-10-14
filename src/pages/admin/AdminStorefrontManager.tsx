import {
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Edit,
  Eye,
  Grid,
  Image as ImageIcon,
  Layers,
  Plus,
  Save,
  ShoppingBag,
  Sparkles,
  Tag,
  Trash2,
  X,
} from "lucide-react";
import { useState } from "react";
import { useCms } from "../../cms/CmsContext";
import type { CategoryDepartmentConfig, CategoryFeaturedCardData, MediaItem } from "../../cms/types";
import { CATEGORY_DEPARTMENTS } from "../../components/store/category/categoryData";
import { AdminMediaLibrary } from "./AdminMediaLibrary";

export function AdminStorefrontManager() {
  const { departments: cmsDepartments, updateStorefront } = useCms();
  const [departments, setDepartments] = useState<Record<string, CategoryDepartmentConfig>>(cmsDepartments);
  const [selectedDeptKey, setSelectedDeptKey] = useState<string>("iphone");
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState("");

  // Media picker modal state
  const [cardImagePickerIndex, setCardImagePickerIndex] = useState<number | null>(null);

  const currentDept = departments[selectedDeptKey] || departments.iphone;

  const handleSave = async () => {
    setSaving(true);
    setSaveError("");
    setSaveSuccess(false);
    try {
      await updateStorefront(departments);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Failed to save storefront configuration.");
    } finally {
      setSaving(false);
    }
  };

  const updateCurrentDept = (partial: Partial<CategoryDepartmentConfig>) => {
    setDepartments((prev) => ({
      ...prev,
      [selectedDeptKey]: {
        ...prev[selectedDeptKey],
        ...partial,
      },
    }));
  };

  const updateFeaturedCard = (cardIndex: number, partial: Partial<CategoryFeaturedCardData>) => {
    const updatedCards = [...currentDept.featuredCards];
    updatedCards[cardIndex] = { ...updatedCards[cardIndex], ...partial };
    updateCurrentDept({ featuredCards: updatedCards });
  };

  const removeFeaturedCard = (cardIndex: number) => {
    const updatedCards = currentDept.featuredCards.filter((_, i) => i !== cardIndex);
    updateCurrentDept({ featuredCards: updatedCards });
  };

  const addFeaturedCard = () => {
    const newCard: CategoryFeaturedCardData = {
      id: `card-${Date.now()}`,
      eyebrow: "FLAGSHIP SHOWCASE",
      title: `${currentDept.label} Featured Model`,
      subtitle: "Premium hardware, pristine condition, guaranteed authenticity.",
      price: "From GH₵ 15,000",
      badge: "In Stock",
      image: "/products/campaigns/iphone-18-pro-colors.webp",
      alt: "Featured product device",
      buyPath: "/store",
      buyLabel: "Buy",
      storyPath: "/store",
      storyLabel: "Learn more",
      isDark: false,
    };
    updateCurrentDept({ featuredCards: [...currentDept.featuredCards, newCard] });
  };

  const handleCardImageSelect = (item: MediaItem) => {
    if (cardImagePickerIndex === null) return;
    updateFeaturedCard(cardImagePickerIndex, { image: item.url });
    setCardImagePickerIndex(null);
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Card */}
      <div className="admin-header-card">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-[#d4af37]">
              Storefront Architecture
            </span>
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-slate-300" />
            <span className="text-xs font-semibold text-slate-500">Product Lineup Showcase</span>
          </div>
          <h2>Storefront &amp; Category Manager</h2>
          <p>
            Manage department headlines, shopping intros, featured lineup carousels, badges, and
            highlighted flagship models for iPhone, Mac, iPad, Watch, AirPods, and Accessories.
          </p>
        </div>

        <button
          type="button"
          disabled={saving}
          onClick={handleSave}
          className="admin-btn admin-btn-primary"
        >
          <Save size={16} />
          <span>{saving ? "Saving..." : "Save Storefront Changes"}</span>
        </button>
      </div>

      {saveSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 size={16} />
          <span>Storefront categories and showcase carousels updated successfully!</span>
        </div>
      )}

      {saveError && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
          <AlertCircle size={16} />
          <span>{saveError}</span>
        </div>
      )}

      {/* Department Selector */}
      <div className="flex flex-wrap items-center gap-1.5 p-1.5 rounded-xl bg-slate-100/80 border border-slate-200">
        {Object.entries(departments).map(([key, dept]) => (
          <button
            key={key}
            type="button"
            onClick={() => setSelectedDeptKey(key)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
              selectedDeptKey === key
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <ShoppingBag size={14} className={selectedDeptKey === key ? "text-[#d4af37]" : "text-slate-400"} />
            <span>{dept.label}</span>
          </button>
        ))}
      </div>

      {/* Department Details Editor */}
      <div className="admin-card space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="font-bold text-slate-900 text-sm">
            {currentDept.label} Department Presentation
          </h3>
          <span className="text-xs text-slate-400 font-mono">Route: /{selectedDeptKey}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Department Label</label>
            <input
              type="text"
              value={currentDept.label}
              onChange={(e) => updateCurrentDept({ label: e.target.value })}
              className="w-full p-2.5 rounded-lg border border-slate-200 bg-white"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Tagline Headline</label>
            <input
              type="text"
              value={currentDept.tagline}
              onChange={(e) => updateCurrentDept({ tagline: e.target.value })}
              className="w-full p-2.5 rounded-lg border border-slate-200 bg-white"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block font-bold text-slate-700 mb-1">Department Introduction Copy</label>
            <textarea
              rows={2}
              value={currentDept.description}
              onChange={(e) => updateCurrentDept({ description: e.target.value })}
              className="w-full p-2.5 rounded-lg border border-slate-200 bg-white"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">SEO Page Title</label>
            <input
              type="text"
              value={currentDept.seoTitle}
              onChange={(e) => updateCurrentDept({ seoTitle: e.target.value })}
              className="w-full p-2.5 rounded-lg border border-slate-200 bg-white"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">SEO Description</label>
            <input
              type="text"
              value={currentDept.seoDescription}
              onChange={(e) => updateCurrentDept({ seoDescription: e.target.value })}
              className="w-full p-2.5 rounded-lg border border-slate-200 bg-white"
            />
          </div>
        </div>
      </div>

      {/* Featured Showcase Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              {currentDept.label} Featured Showcase Cards ({currentDept.featuredCards.length})
            </h3>
            <p className="text-xs text-slate-500">
              These horizontal showcase cards appear at the top of the {currentDept.label} shopping page.
            </p>
          </div>
          <button
            type="button"
            onClick={addFeaturedCard}
            className="admin-btn admin-btn-sm admin-btn-secondary"
          >
            <Plus size={14} />
            <span>Add Showcase Card</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {currentDept.featuredCards.map((card, idx) => (
            <div
              key={card.id}
              className="admin-card p-4 space-y-3 border border-slate-200 flex flex-col justify-between"
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="px-2 py-0.5 rounded bg-slate-100 text-[0.65rem] font-bold text-slate-700 uppercase">
                  Card #{idx + 1}
                </span>
                <button
                  type="button"
                  onClick={() => removeFeaturedCard(idx)}
                  className="p-1 rounded text-rose-500 hover:text-rose-700"
                  title="Remove card"
                >
                  <Trash2 size={13} />
                </button>
              </div>

              <div className="aspect-[16/10] bg-slate-100 rounded-lg overflow-hidden flex items-center justify-center border border-slate-200 relative">
                <img src={card.image} alt={card.alt} className="max-h-32 object-contain" />
                {card.badge && (
                  <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-slate-900 text-white font-bold text-[0.65rem]">
                    {card.badge}
                  </span>
                )}
              </div>

              <div className="space-y-2 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-0.5">Eyebrow</label>
                  <input
                    type="text"
                    value={card.eyebrow}
                    onChange={(e) => updateFeaturedCard(idx, { eyebrow: e.target.value })}
                    className="w-full p-1.5 rounded border border-slate-200 bg-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-0.5">Title</label>
                  <input
                    type="text"
                    value={card.title}
                    onChange={(e) => updateFeaturedCard(idx, { title: e.target.value })}
                    className="w-full p-1.5 rounded border border-slate-200 bg-white font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-0.5">Price Display</label>
                  <input
                    type="text"
                    value={card.price}
                    onChange={(e) => updateFeaturedCard(idx, { price: e.target.value })}
                    className="w-full p-1.5 rounded border border-slate-200 bg-white text-emerald-700 font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-0.5">Badge (e.g. In Stock, New)</label>
                  <input
                    type="text"
                    value={card.badge || ""}
                    onChange={(e) => updateFeaturedCard(idx, { badge: e.target.value })}
                    className="w-full p-1.5 rounded border border-slate-200 bg-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-0.5">Buy Destination Link</label>
                  <input
                    type="text"
                    value={card.buyPath}
                    onChange={(e) => updateFeaturedCard(idx, { buyPath: e.target.value })}
                    className="w-full p-1.5 rounded border border-slate-200 bg-white font-mono text-[0.68rem]"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => setCardImagePickerIndex(idx)}
                  className="w-full py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold flex items-center justify-center gap-1.5 transition text-[0.7rem]"
                >
                  <ImageIcon size={13} />
                  <span>Choose Image from Library</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Media Picker Modal */}
      {cardImagePickerIndex !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setCardImagePickerIndex(null)}
        >
          <div
            className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl p-6 space-y-4 max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ImageIcon size={18} className="text-[#d4af37]" />
                <h3 className="font-bold text-slate-900 text-sm">Select Image for Showcase Card</h3>
              </div>
              <button
                type="button"
                onClick={() => setCardImagePickerIndex(null)}
                className="p-1 text-slate-400 hover:text-slate-900"
              >
                <X size={18} />
              </button>
            </div>

            <AdminMediaLibrary isPicker onSelect={handleCardImageSelect} />
          </div>
        </div>
      )}
    </div>
  );
}
