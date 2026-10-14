import {
  AlertCircle,
  AlertTriangle,
  Check,
  CheckCircle2,
  Copy,
  Edit3,
  ExternalLink,
  Eye,
  Filter,
  Image as ImageIcon,
  Maximize2,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { useCms } from "../../cms/CmsContext";
import { getMediaAssetUsages } from "../../cms/supabaseCmsRepository";
import type { MediaItem } from "../../cms/types";

interface AdminMediaLibraryProps {
  onSelect?: (item: MediaItem) => void;
  isPicker?: boolean;
}

export function AdminMediaLibrary({ onSelect, isPicker = false }: AdminMediaLibraryProps) {
  const { media, homepage, departments, settings, uploadMedia, updateMedia, deleteMedia } = useCms();
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
  const pickerUploadRef = useRef<HTMLInputElement>(null);

  // Edit / Replace asset state
  const [editingAsset, setEditingAsset] = useState<MediaItem | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editAlt, setEditAlt] = useState("");
  const [editCategory, setEditCategory] = useState<MediaItem["category"]>("other");
  const [editFit, setEditFit] = useState<"cover" | "contain">("cover");
  const [editPosition, setEditPosition] = useState<"center" | "top" | "bottom">("center");
  const [replacementFile, setReplacementFile] = useState<File | null>(null);
  const [replacementPreview, setReplacementPreview] = useState<string | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const [editError, setEditError] = useState("");
  const replacementInputRef = useRef<HTMLInputElement>(null);

  // Delete confirmation modal state
  const [deleteConfirm, setDeleteConfirm] = useState<MediaItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");
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

  const deleteUsages = useMemo(() => {
    if (!deleteConfirm) return [];
    return getMediaAssetUsages(deleteConfirm, homepage, departments, settings);
  }, [deleteConfirm, homepage, departments, settings]);

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

  const handleOpenEdit = (item: MediaItem) => {
    setEditingAsset(item);
    setEditTitle(item.title);
    setEditAlt(item.alt || "");
    setEditCategory(item.category);
    setEditFit((item.fit as "cover" | "contain") || "cover");
    setEditPosition((item.position as "center" | "top" | "bottom") || "center");
    setReplacementFile(null);
    setReplacementPreview(null);
    setEditError("");
  };

  const handleReplacementFileChange = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    const maxBytes = 5 * 1024 * 1024;
    if (file.size > maxBytes) {
      setEditError(`"${file.name}" exceeds 5MB limit. Please select a smaller optimized image.`);
      return;
    }
    if (!file.type.match(/^image\/(jpeg|png|webp|avif)$/)) {
      setEditError("Only JPG, PNG, WebP, and AVIF images are supported.");
      return;
    }
    setEditError("");
    setReplacementFile(file);
    if (replacementPreview) URL.revokeObjectURL(replacementPreview);
    setReplacementPreview(URL.createObjectURL(file));
  };

  const handleSaveEdit = async () => {
    if (!editingAsset) return;
    setSavingEdit(true);
    setEditError("");
    try {
      const updated = await updateMedia(
        editingAsset.id,
        {
          title: editTitle.trim() || editingAsset.title,
          alt: editAlt.trim(),
          category: editCategory,
          fit: editFit,
          position: editPosition,
        },
        replacementFile || undefined
      );

      setSuccessMessage(`Successfully saved changes for "${updated.title}" to Supabase.`);
      if (selectedAsset?.id === editingAsset.id) {
        setSelectedAsset(updated);
      }
      if (replacementPreview) {
        URL.revokeObjectURL(replacementPreview);
      }
      setEditingAsset(null);
      setTimeout(() => setSuccessMessage(""), 4000);
    } catch (err) {
      setEditError(err instanceof Error ? err.message : "Failed to update asset.");
    } finally {
      setSavingEdit(false);
    }
  };

  const handleCopyUrl = (item: MediaItem) => {
    const fullUrl = item.url.startsWith("http")
      ? item.url
      : `${window.location.origin}${item.url.startsWith("/") ? "" : "/"}${item.url}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;
    setIsDeleting(true);
    setDeleteError("");
    try {
      await deleteMedia(deleteConfirm.id);
      setSuccessMessage(`Successfully deleted "${deleteConfirm.title}" from Supabase.`);
      setDeleteConfirm(null);
      if (selectedAsset?.id === deleteConfirm.id) setSelectedAsset(null);
      setTimeout(() => setSuccessMessage(""), 4000);
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : "Failed to delete media asset from Supabase.");
    } finally {
      setIsDeleting(false);
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
              Upload, preview, edit, replace, and organize images across homepage heroes, promotional tiles,
              storefront categories, and service flyers without touching code.
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

      {/* Quick Upload directly in picker mode */}
      {isPicker && (
        <div className="p-3.5 bg-amber-50/70 border border-amber-200/80 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-xs font-bold text-amber-950 block">Pick an Image or Upload Directly</span>
            <span className="text-[0.7rem] text-amber-800">
              Select any asset below to assign it immediately, or upload a new photo directly from your computer.
            </span>
          </div>
          <input
            ref={pickerUploadRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            className="hidden"
            onChange={async (e) => {
              const files = e.target.files;
              if (!files || files.length === 0) return;
              const file = files[0];
              setUploading(true);
              setUploadError("");
              try {
                const item = await uploadMedia(file, "storefront", file.name.replace(/\.[^.]+$/, ""));
                setSuccessMessage(`Uploaded "${item.title}".`);
                if (onSelect) onSelect(item);
              } catch (err) {
                setUploadError(err instanceof Error ? err.message : "Failed to upload file.");
              } finally {
                setUploading(false);
              }
            }}
          />
          <button
            type="button"
            disabled={uploading}
            onClick={() => pickerUploadRef.current?.click()}
            className="px-3.5 py-2 rounded-lg bg-[#d4af37] hover:bg-slate-900 text-white text-xs font-bold flex items-center justify-center gap-1.5 shrink-0 transition shadow-sm disabled:opacity-50"
          >
            <Upload size={14} />
            <span>{uploading ? "Uploading to Supabase..." : "Upload from Computer & Select"}</span>
          </button>
        </div>
      )}

      {/* Upload Box (Standard view) */}
      {!isPicker && (
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
                placeholder="e.g. iPad Air Promo Tile"
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
      )}

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
        {filteredMedia.map((item) => {
          const cardUsages = getMediaAssetUsages(item, homepage, departments, settings);
          const isCardInUse = cardUsages.length > 0;
          return (
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
                        (item.fit as any) ||
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
                <div className="absolute top-2 left-2 right-2 flex items-center justify-between pointer-events-none">
                  <span className="px-2 py-0.5 rounded-full bg-slate-900/75 backdrop-blur-sm text-[0.65rem] font-bold text-white uppercase tracking-wider">
                    {item.category}
                  </span>
                  {isCardInUse && (
                    <span
                      className="px-1.5 py-0.5 rounded-full bg-emerald-600/90 backdrop-blur-sm text-[0.6rem] font-bold text-white flex items-center gap-0.5 shadow-sm"
                      title={`Active in ${cardUsages.length} website locations`}
                    >
                      <ShieldCheck size={10} />
                      <span>In Use</span>
                    </span>
                  )}
                </div>

                {/* Hover Overlay Actions */}
                <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 p-2">
                  {isPicker && onSelect ? (
                    <button
                      type="button"
                      onClick={() => onSelect(item)}
                      className="px-3 py-1.5 rounded-lg bg-[#d4af37] text-white hover:bg-white hover:text-slate-900 text-xs font-bold transition shadow flex items-center gap-1"
                      title="Select this image"
                    >
                      <Check size={14} />
                      <span>Select</span>
                    </button>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(item)}
                        aria-label="Edit or replace asset"
                        className="p-2 rounded-full bg-white text-slate-900 hover:bg-[#d4af37] hover:text-white transition shadow"
                        title="Edit / Replace Image"
                      >
                        <Edit3 size={15} />
                      </button>
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
                    </>
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
                      className="w-full py-1.5 rounded bg-[#d4af37] hover:bg-slate-900 text-white text-[0.7rem] font-bold transition flex items-center justify-center gap-1"
                    >
                      <Check size={12} />
                      <span>Select for Slot</span>
                    </button>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(item)}
                        className="text-[0.7rem] font-bold text-[#d4af37] hover:text-slate-900 flex items-center gap-1 transition"
                      >
                        <Edit3 size={12} />
                        <span>Edit / Replace</span>
                      </button>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleCopyUrl(item)}
                          className="text-[0.7rem] font-semibold text-slate-400 hover:text-slate-700 transition"
                          title="Copy URL"
                        >
                          {copiedId === item.id ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setDeleteError("");
                            setDeleteConfirm(item);
                          }}
                          className={`text-[0.7rem] font-semibold transition ${
                            isCardInUse
                              ? "text-amber-500 hover:text-amber-700"
                              : "text-rose-500 hover:text-rose-700"
                          }`}
                          title={
                            isCardInUse
                              ? `In use on live website (${cardUsages.length} locations) - Click for details`
                              : "Delete unused asset"
                          }
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredMedia.length === 0 && (
        <div className="admin-card p-12 text-center text-slate-400">
          <ImageIcon size={36} className="mx-auto mb-2 opacity-40" />
          <p className="text-sm font-semibold">No media assets match your filter.</p>
          <p className="text-xs mt-1">Upload new images using the button above.</p>
        </div>
      )}

      {/* EDIT / REPLACE IMAGE MODAL */}
      {editingAsset && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => {
            if (!savingEdit) {
              if (replacementPreview) URL.revokeObjectURL(replacementPreview);
              setEditingAsset(null);
            }
          }}
        >
          <div
            className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden p-6 space-y-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Edit3 size={18} className="text-[#d4af37]" />
                <h3 className="font-bold text-slate-900 text-sm">
                  Edit &amp; Replace Media Asset
                </h3>
              </div>
              <button
                type="button"
                disabled={savingEdit}
                onClick={() => {
                  if (replacementPreview) URL.revokeObjectURL(replacementPreview);
                  setEditingAsset(null);
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-900 disabled:opacity-40"
              >
                <X size={18} />
              </button>
            </div>

            {editError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
                <AlertCircle size={15} />
                <span>{editError}</span>
              </div>
            )}

            {/* Side-by-Side Image Previews */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <span className="text-[0.7rem] font-bold uppercase tracking-wider text-slate-500">
                  Current Image
                </span>
                <div className="aspect-[4/3] bg-slate-100 rounded-xl overflow-hidden border border-slate-200 flex items-center justify-center p-2">
                  <img
                    src={editingAsset.url}
                    alt={editingAsset.alt}
                    style={{
                      objectFit: editFit,
                      objectPosition: editPosition,
                    }}
                    className="w-full h-full max-h-full max-w-full"
                  />
                </div>
                <span className="text-[0.65rem] text-slate-400 truncate block">
                  {editingAsset.filename}
                </span>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[0.7rem] font-bold uppercase tracking-wider text-slate-500">
                    {replacementPreview ? "New Replacement (Preview)" : "Replacement Image"}
                  </span>
                  {replacementPreview && (
                    <button
                      type="button"
                      onClick={() => {
                        if (replacementPreview) URL.revokeObjectURL(replacementPreview);
                        setReplacementPreview(null);
                        setReplacementFile(null);
                      }}
                      className="text-[0.65rem] text-rose-600 font-bold hover:underline"
                    >
                      Revert
                    </button>
                  )}
                </div>
                <div className="aspect-[4/3] bg-slate-50 rounded-xl overflow-hidden border-2 border-dashed border-slate-200 flex flex-col items-center justify-center p-2 text-center">
                  {replacementPreview ? (
                    <img
                      src={replacementPreview}
                      alt="Replacement preview"
                      style={{
                        objectFit: editFit,
                        objectPosition: editPosition,
                      }}
                      className="w-full h-full max-h-full max-w-full"
                    />
                  ) : (
                    <div className="p-4 space-y-2">
                      <ImageIcon size={28} className="mx-auto text-slate-300" />
                      <p className="text-[0.7rem] text-slate-500">
                        Select a file from your computer to replace this image without creating duplicates.
                      </p>
                      <input
                        ref={replacementInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/avif"
                        className="hidden"
                        onChange={(e) => handleReplacementFileChange(e.target.files)}
                      />
                      <button
                        type="button"
                        onClick={() => replacementInputRef.current?.click()}
                        className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition"
                      >
                        Choose Replacement File
                      </button>
                    </div>
                  )}
                </div>
                {replacementFile && (
                  <span className="text-[0.65rem] text-emerald-600 font-semibold truncate block">
                    ✓ New file: {replacementFile.name} ({(replacementFile.size / 1024).toFixed(0)} KB)
                  </span>
                )}
              </div>
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 mb-1">Image Name / Title *</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-200 bg-white"
                  placeholder="e.g. iPad Air Promo Tile"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 mb-1">Description / Alt Text *</label>
                <input
                  type="text"
                  value={editAlt}
                  onChange={(e) => setEditAlt(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-200 bg-white"
                  placeholder="Descriptive image summary for storefront presentation and accessibility"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Category</label>
                <select
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value as MediaItem["category"])}
                  className="w-full p-2.5 rounded-lg border border-slate-200 bg-white font-semibold"
                >
                  <option value="hero">Hero Carousel Banners</option>
                  <option value="storefront">Storefront / Promo Tiles</option>
                  <option value="flyer">Service Flyers</option>
                  <option value="product">Product Imagery</option>
                  <option value="brand">Brand Logo &amp; Shop Banners</option>
                  <option value="other">General / Other</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Display Fit Mode</label>
                <select
                  value={editFit}
                  onChange={(e) => setEditFit(e.target.value as "cover" | "contain")}
                  className="w-full p-2.5 rounded-lg border border-slate-200 bg-white font-semibold"
                >
                  <option value="contain">Contain (No cropping, full artwork visible)</option>
                  <option value="cover">Cover (Fill container, balanced framing)</option>
                </select>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <span className="text-[0.7rem] text-slate-400">
                Saves permanently to Supabase with AAL2 authorization.
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={savingEdit}
                  onClick={() => {
                    if (replacementPreview) URL.revokeObjectURL(replacementPreview);
                    setEditingAsset(null);
                  }}
                  className="admin-btn admin-btn-secondary text-xs"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={savingEdit}
                  onClick={handleSaveEdit}
                  className="px-4 py-2 rounded-lg bg-[#d4af37] hover:bg-slate-900 text-white text-xs font-bold transition shadow flex items-center gap-1.5 disabled:opacity-50"
                >
                  {savingEdit ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" />
                      <span>Saving to Supabase...</span>
                    </>
                  ) : (
                    <>
                      <Check size={14} />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
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
                onClick={() => {
                  handleOpenEdit(selectedAsset);
                  setSelectedAsset(null);
                }}
                className="admin-btn admin-btn-secondary text-xs"
              >
                <Edit3 size={14} />
                <span>Edit / Replace</span>
              </button>
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
          onClick={() => {
            if (!isDeleting) {
              setDeleteConfirm(null);
              setDeleteError("");
            }
          }}
        >
          <div
            className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            {deleteUsages.length > 0 ? (
              <>
                <div className="flex items-center gap-3 text-amber-600">
                  <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center shrink-0">
                    <AlertTriangle size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">Protected Live Asset — Cannot Delete</h3>
                    <p className="text-xs text-slate-500">This image is actively used on the live website.</p>
                  </div>
                </div>

                <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl space-y-2.5">
                  <div className="flex items-center gap-2 text-amber-950 font-bold text-xs">
                    <span>Active in {deleteUsages.length} live website {deleteUsages.length === 1 ? "location" : "locations"}:</span>
                  </div>
                  <ul className="text-xs text-amber-800 space-y-1.5 pl-1 max-h-40 overflow-y-auto">
                    {deleteUsages.map((usage, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0 mt-1.5" />
                        <span className="font-semibold">{usage.location}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="text-[0.7rem] text-amber-700 pt-1.5 border-t border-amber-200/60 leading-relaxed">
                    Deleting this image would break display on the public storefront. To remove this image, first replace or unlink it in the Homepage Content or Storefront sections.
                  </p>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setDeleteConfirm(null);
                      setDeleteError("");
                    }}
                    className="admin-btn admin-btn-secondary text-xs"
                  >
                    Close
                  </button>
                </div>
              </>
            ) : (
              <>
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
                  Are you sure you want to delete <strong>{deleteConfirm.title}</strong> ({deleteConfirm.filename})? This image is not in use on the website and will be safely removed.
                </p>

                {deleteError && (
                  <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
                    <AlertCircle size={15} className="shrink-0" />
                    <span>{deleteError}</span>
                  </div>
                )}

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    disabled={isDeleting}
                    onClick={() => {
                      setDeleteConfirm(null);
                      setDeleteError("");
                    }}
                    className="admin-btn admin-btn-secondary text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={isDeleting}
                    onClick={confirmDelete}
                    className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition shadow-sm flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {isDeleting ? (
                      <>
                        <RefreshCw size={13} className="animate-spin" />
                        <span>Deleting from Supabase...</span>
                      </>
                    ) : (
                      <>
                        <Trash2 size={13} />
                        <span>Confirm Delete</span>
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
