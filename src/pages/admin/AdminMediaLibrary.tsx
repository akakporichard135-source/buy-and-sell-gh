import {
  AlertCircle,
  Check,
  CheckCircle2,
  Copy,
  ExternalLink,
  Eye,
  Filter,
  Image as ImageIcon,
  Maximize2,
  Plus,
  Search,
  Sparkles,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { useCms } from "../../cms/CmsContext";
import type { MediaItem } from "../../cms/types";

interface AdminMediaLibraryProps {
  onSelect?: (item: MediaItem) => void;
  isPicker?: boolean;
}

export function AdminMediaLibrary({ onSelect, isPicker = false }: AdminMediaLibraryProps) {
  const { media, uploadMedia, deleteMedia, updateSettings } = useCms();
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [selectedAsset, setSelectedAsset] = useState<MediaItem | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // New upload state
  const [uploadCategory, setUploadCategory] = useState<MediaItem["category"]>("hero");
  const [customTitle, setCustomTitle] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Delete confirmation modal state
  const [deleteConfirm, setDeleteConfirm] = useState<MediaItem | null>(null);
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});

  const categories = [
    { id: "all", label: "All Assets" },
    { id: "hero", label: "Hero Banners" },
    { id: "storefront", label: "Storefront & Tiles" },
    { id: "flyer", label: "Service Flyers" },
    { id: "product", label: "Product Imagery" },
    { id: "brand", label: "Brand & Logos" },
    { id: "other", label: "Other" },
  ];

  const filteredMedia = useMemo(() => {
    return media.filter((item) => {
      const matchesCategory =
        activeCategory === "all" || item.category === activeCategory;
      const terms = searchQuery.toLowerCase().trim().split(/\s+/).filter(Boolean);
      const matchesSearch =
        terms.length === 0 ||
        terms.every(
          (t) =>
            item.title.toLowerCase().includes(t) ||
            item.filename.toLowerCase().includes(t) ||
            item.alt.toLowerCase().includes(t)
        );
      return matchesCategory && matchesSearch;
    });
  }, [media, activeCategory, searchQuery]);

  const handleFileChange = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];

    const maxBytes = 5 * 1024 * 1024;
    if (file.size > maxBytes) {
      setUploadError(`"${file.name}" exceeds 5MB limit. Please upload an optimized image.`);
      return;
    }

    if (!file.type.match(/^image\/(jpeg|png|webp|avif)$/)) {
      setUploadError("Only JPG, PNG, WebP, and AVIF images are supported.");
      return;
    }

    setUploading(true);
    setUploadError("");
    try {
      const newItem = await uploadMedia(file, uploadCategory, customTitle.trim() || undefined);
      setSuccessMessage(`Successfully uploaded "${newItem.title}" to media library.`);
      setCustomTitle("");
      if (fileInputRef.current) fileInputRef.current.value = "";
      setTimeout(() => setSuccessMessage(""), 4000);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Failed to upload image asset.");
    } finally {
      setUploading(false);
    }
  };

  const handleCopyUrl = (item: MediaItem) => {
    navigator.clipboard.writeText(item.url);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;
    try {
      await deleteMedia(deleteConfirm.id);
      setSuccessMessage(`Removed "${deleteConfirm.title}" safely.`);
      setDeleteConfirm(null);
      if (selectedAsset?.id === deleteConfirm.id) setSelectedAsset(null);
      setTimeout(() => setSuccessMessage(""), 3500);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Failed to delete asset.");
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Card */}
      {!isPicker && (
        <div className="admin-header-card">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-[#d4af37]">
                Digital Asset Management
              </span>
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-slate-300" />
              <span className="text-xs font-semibold text-slate-500">Supabase Managed Media</span>
            </div>
            <h2>Media Library &amp; Asset Control</h2>
            <p>
              Upload, preview, organize, and replace images across homepage heroes, promotional tiles,
              department storefronts, and service flyers without touching code.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="admin-btn admin-btn-primary"
            >
              <Upload size={16} />
              <span>Upload New Asset</span>
            </button>
          </div>
        </div>
      )}

      {/* Messages */}
      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 size={16} />
          <span>{successMessage}</span>
        </div>
      )}

      {uploadError && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
          <AlertCircle size={16} />
          <span>{uploadError}</span>
        </div>
      )}

      {/* Upload Box */}
      <div className="admin-card space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Upload size={17} className="text-[#d4af37]" />
            <h3 className="font-bold text-slate-900 text-sm">Upload Image to Supabase Storage</h3>
          </div>
          <span className="text-xs text-slate-400">Max size: 5MB &bull; JPEG, PNG, WebP, AVIF</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Asset Placement Category</label>
            <select
              value={uploadCategory}
              onChange={(e) => setUploadCategory(e.target.value as MediaItem["category"])}
              className="w-full p-2.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold"
            >
              <option value="hero">Hero Carousel Banners</option>
              <option value="storefront">Storefront / Promo Tiles</option>
              <option value="flyer">Service Flyers (Repairs, Trade-in)</option>
              <option value="product">Product Photography</option>
              <option value="brand">Brand Logo &amp; Shop Banners</option>
              <option value="other">General / Other</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Asset Title (Optional)</label>
            <input
              type="text"
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
              placeholder="e.g. iPhone 18 Pro Midnight Hero"
              className="w-full p-2.5 rounded-lg border border-slate-200 bg-white text-xs"
            />
          </div>

          <div className="flex items-end">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif"
              className="hidden"
              onChange={(e) => handleFileChange(e.target.files)}
            />
            <button
              type="button"
              disabled={uploading}
              onClick={() => fileInputRef.current?.click()}
              className="w-full p-2.5 rounded-lg bg-slate-900 hover:bg-black text-white text-xs font-bold flex items-center justify-center gap-2 transition disabled:opacity-50"
            >
              <Upload size={15} />
              <span>{uploading ? "Uploading to Supabase..." : "Select Image from Computer"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-slate-100 border border-slate-200">
          {categories.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setActiveCategory(c.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                activeCategory === c.id
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search assets..."
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 bg-white text-xs"
          />
        </div>
      </div>

      {/* Asset Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {filteredMedia.map((item) => (
          <div
            key={item.id}
            className="group relative rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm hover:shadow-md transition flex flex-col justify-between"
          >
            {/* Image Preview Container */}
            <div className="aspect-[4/3] bg-slate-100 relative overflow-hidden flex items-center justify-center p-1">
              {!imgErrors[item.id] ? (
                <img
                  src={item.url}
                  alt={item.alt || item.title}
                  loading="lazy"
                  onError={() => setImgErrors((prev) => ({ ...prev, [item.id]: true }))}
                  style={{
                    objectFit:
                      item.fit ||
                      (item.category === "brand" || item.category === "flyer"
                        ? "contain"
                        : "cover"),
                    objectPosition: item.position || "center",
                  }}
                  className="w-full h-full max-h-full max-w-full"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-slate-400 p-2 text-center">
                  <ImageIcon size={24} className="mb-1 opacity-50" />
                  <span className="text-[0.65rem] font-semibold text-slate-500 truncate max-w-full">
                    Preview unavailable
                  </span>
                </div>
              )}
              <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-slate-900/75 backdrop-blur-sm text-[0.65rem] font-bold text-white uppercase tracking-wider">
                {item.category}
              </span>

              {/* Hover Overlay Actions */}
              <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedAsset(item)}
                  aria-label="Inspect asset"
                  className="p-2 rounded-full bg-white text-slate-900 hover:bg-[#d4af37] hover:text-white transition shadow"
                  title="Inspect details"
                >
                  <Eye size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => handleCopyUrl(item)}
                  aria-label="Copy public URL"
                  className="p-2 rounded-full bg-white text-slate-900 hover:bg-[#d4af37] hover:text-white transition shadow"
                  title="Copy URL"
                >
                  {copiedId === item.id ? <Check size={15} className="text-emerald-600" /> : <Copy size={15} />}
                </button>
                {isPicker && onSelect && (
                  <button
                    type="button"
                    onClick={() => onSelect(item)}
                    className="p-2 rounded-full bg-[#d4af37] text-white hover:bg-slate-900 transition shadow"
                    title="Select for slot"
                  >
                    <Check size={15} />
                  </button>
                )}
              </div>
            </div>

            {/* Asset Metadata */}
            <div className="p-3 border-t border-slate-100 space-y-1">
              <h4 className="text-xs font-bold text-slate-900 truncate" title={item.title}>
                {item.title}
              </h4>
              <p className="text-[0.68rem] text-slate-400 truncate" title={item.filename}>
                {item.filename}
              </p>

              <div className="pt-2 flex items-center justify-between">
                {isPicker && onSelect ? (
                  <button
                    type="button"
                    onClick={() => onSelect(item)}
                    className="w-full py-1 rounded bg-[#d4af37] hover:bg-slate-900 text-white text-[0.7rem] font-bold transition"
                  >
                    Select Asset
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => handleCopyUrl(item)}
                      className="text-[0.7rem] font-bold text-slate-600 hover:text-[#d4af37] flex items-center gap-1 transition"
                    >
                      {copiedId === item.id ? (
                        <>
                          <Check size={12} className="text-emerald-600" />
                          <span className="text-emerald-600">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy size={12} />
                          <span>Copy URL</span>
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteConfirm(item)}
                      className="text-[0.7rem] font-semibold text-rose-500 hover:text-rose-700 transition"
                      title="Delete asset"
                    >
                      <Trash2 size={13} />
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredMedia.length === 0 && (
        <div className="admin-card p-12 text-center text-slate-400">
          <ImageIcon size={36} className="mx-auto mb-2 opacity-40" />
          <p className="text-sm font-semibold">No media assets match your filter.</p>
          <p className="text-xs mt-1">Upload new images using the button above.</p>
        </div>
      )}

      {/* Lightbox / Details Modal */}
      {selectedAsset && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setSelectedAsset(null)}
        >
          <div
            className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ImageIcon size={18} className="text-[#d4af37]" />
                <h3 className="font-bold text-slate-900 text-sm">{selectedAsset.title}</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedAsset(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-900"
              >
                <X size={18} />
              </button>
            </div>

            <div className="max-h-80 bg-slate-50 rounded-xl overflow-hidden flex items-center justify-center border border-slate-200">
              <img
                src={selectedAsset.url}
                alt={selectedAsset.alt}
                className="max-h-80 object-contain mx-auto"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <span className="block text-slate-400 font-medium">Filename</span>
                <span className="font-bold text-slate-800 break-all">{selectedAsset.filename}</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <span className="block text-slate-400 font-medium">Category</span>
                <span className="font-bold text-slate-800 uppercase">{selectedAsset.category}</span>
              </div>
              <div className="col-span-2 p-3 rounded-lg bg-slate-50 border border-slate-200">
                <span className="block text-slate-400 font-medium">Public URL</span>
                <span className="font-mono text-[0.7rem] text-slate-700 break-all select-all">
                  {selectedAsset.url}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => handleCopyUrl(selectedAsset)}
                className="admin-btn admin-btn-secondary text-xs"
              >
                <Copy size={14} />
                <span>Copy URL</span>
              </button>
              <a
                href={selectedAsset.url}
                target="_blank"
                rel="noopener noreferrer"
                className="admin-btn admin-btn-primary text-xs"
              >
                <ExternalLink size={14} />
                <span>Open in Tab</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setDeleteConfirm(null)}
        >
          <div
            className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center shrink-0">
                <Trash2 size={20} />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Delete Media Asset?</h3>
                <p className="text-xs text-slate-500">This action will remove the asset from Supabase Storage.</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200">
              Are you sure you want to delete <strong>{deleteConfirm.title}</strong> ({deleteConfirm.filename})? If this image is currently in use on the homepage or storefront, it will no longer display.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirm(null)}
                className="admin-btn admin-btn-secondary text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition shadow-sm"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
