import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Edit3,
  ExternalLink,
  Eye,
  Image as ImageIcon,
  ImagePlus,
  Monitor,
  RefreshCw,
  RotateCcw,
  Save,
  Send,
  Smartphone,
  Star,
  Trash2,
  X,
} from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { useAdminAuth } from "../../admin/AdminAuth";
import { uploadProductImage } from "../../catalog/supabaseProductRepository";
import {
  buildDefaultBuyGallery,
  discardDraftBuyGallery,
  getDraftBuyGallerySync,
  getPublishedBuyGallerySync,
  publishBuyGallery,
  saveDraftBuyGallery,
  type BuyGalleryItem,
  type ProductBuyGallery,
} from "../../cms/buyGalleryRepository";
import type { MediaItem } from "../../cms/types";
import type { Product } from "../../types/product";
import { resolveColorOption } from "../../utils/productColors";
import { resolveAdminProductImage } from "../../utils/productImages";
import { SwipeableProductGallery } from "../buy/SwipeableProductGallery";
import { AdminMediaLibrary } from "../../pages/admin/AdminMediaLibrary";
import "../../styles/admin-buy-gallery.css";

export interface AdminBuyPageGalleryProps {
  product: Product;
  onProductUpdated?: (updated: Product) => void;
  onClose?: () => void;
}

export function AdminBuyPageGallery({
  product,
  onProductUpdated,
  onClose,
}: AdminBuyPageGalleryProps) {
  const { session } = useAdminAuth();
  const slug = product.slug;

  // Initialize draft or published or default gallery
  const [gallery, setGallery] = useState<ProductBuyGallery>(() => {
    const draft = getDraftBuyGallerySync(slug);
    if (draft) return draft;
    const published = getPublishedBuyGallerySync(slug);
    if (published) return published;
    return buildDefaultBuyGallery(product);
  });

  const [activeFinish, setActiveFinish] = useState<string>("all");
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Modals state
  const [itemToDelete, setItemToDelete] = useState<BuyGalleryItem | null>(null);
  const [itemToEdit, setItemToEdit] = useState<BuyGalleryItem | null>(null);
  const [itemToReplace, setItemToReplace] = useState<BuyGalleryItem | null>(null);
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [mediaPickerMode, setMediaPickerMode] = useState<"add" | "replace">("add");
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewViewport, setPreviewViewport] = useState<"desktop" | "mobile">("desktop");
  const [previewIndex, setPreviewIndex] = useState(0);

  // Sync when product changes
  useEffect(() => {
    const draft = getDraftBuyGallerySync(slug);
    if (draft) {
      setGallery(draft);
      return;
    }
    const published = getPublishedBuyGallerySync(slug);
    if (published) {
      setGallery(published);
      return;
    }
    setGallery(buildDefaultBuyGallery(product));
  }, [slug, product]);

  // Derived finish list
  const colorFinishes = useMemo(() => {
    return (product.colors || []).filter(Boolean);
  }, [product.colors]);

  // Items for active finish or universal
  const displayItems = useMemo(() => {
    if (activeFinish === "all") {
      return [...gallery.items].sort((a, b) => a.position - b.position);
    }
    // Check finish-specific items
    if (gallery.finishItems?.[activeFinish]?.length) {
      return [...gallery.finishItems[activeFinish]].sort((a, b) => a.position - b.position);
    }
    // Filter items mapped to this finish or universal items
    const filtered = gallery.items.filter(
      (it) => !it.colorFinish || it.colorFinish.toLowerCase() === activeFinish.toLowerCase()
    );
    return filtered.length > 0 ? filtered : gallery.items;
  }, [gallery, activeFinish]);

  // Clear messages after a delay
  useEffect(() => {
    if (statusMessage) {
      const timer = setTimeout(() => setStatusMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [statusMessage]);

  const liveBuyUrl = useMemo(() => {
    if (product.category === "iPhones") return `/shop/buy-iphone/${slug}`;
    if (product.category === "MacBooks") return `/shop/buy-mac/${slug}`;
    if (product.category === "iPads") return `/shop/buy-ipad/${slug}`;
    if (product.category === "Apple Watches") return `/shop/buy-watch/${slug}`;
    if (product.category === "AirPods") return `/shop/buy-airpods/${slug}`;
    return `/shop/buy-accessory/${slug}`;
  }, [product.category, slug]);

  // --------------------------------------------------------------------------
  // ACTIONS: Save Draft & Publish
  // --------------------------------------------------------------------------
  const handleSaveDraft = async () => {
    try {
      setSaving(true);
      setErrorMessage(null);
      const saved = await saveDraftBuyGallery(slug, gallery);
      setGallery(saved);
      setStatusMessage("Gallery draft saved successfully. Ready to publish when you're done.");
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Failed to save draft.");
    } finally {
      setSaving(false);
    }
  };

  const handlePublishLive = async () => {
    try {
      setPublishing(true);
      setErrorMessage(null);
      const pub = await publishBuyGallery(slug, gallery, product, (updatedProd) => {
        if (onProductUpdated) onProductUpdated(updatedProd);
      });
      setGallery(pub);
      setStatusMessage("Gallery published live! Changes are instantly active on buyandsellgh.com.");
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Failed to publish gallery.");
    } finally {
      setPublishing(false);
    }
  };

  const handleDiscardDraft = async () => {
    if (!window.confirm("Discard draft changes and revert to the live published gallery?")) return;
    try {
      await discardDraftBuyGallery(slug);
      const published = getPublishedBuyGallerySync(slug);
      setGallery(published || buildDefaultBuyGallery(product));
      setStatusMessage("Draft reverted to published state.");
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Failed to discard draft.");
    }
  };

  // --------------------------------------------------------------------------
  // ACTIONS: Reorder, Set Main, Delete
  // --------------------------------------------------------------------------
  const handleSetMain = (item: BuyGalleryItem) => {
    const updated = gallery.items.map((it) => ({
      ...it,
      isMain: it.id === item.id,
    }));

    // Move main item to position 0
    const mainItem = updated.find((it) => it.id === item.id);
    const otherItems = updated.filter((it) => it.id !== item.id);
    const reordered = mainItem ? [mainItem, ...otherItems] : updated;

    reordered.forEach((it, idx) => {
      it.position = idx;
    });

    const nextGallery: ProductBuyGallery = {
      ...gallery,
      items: reordered,
      hasDraft: true,
      updatedAt: new Date().toISOString(),
    };

    setGallery(nextGallery);
    setStatusMessage(`Set "${item.title || item.alt || "Image"}" as the Main Buy Page image.`);
  };

  const handleMove = (index: number, direction: -1 | 1) => {
    const items = [...gallery.items].sort((a, b) => a.position - b.position);
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= items.length) return;

    const temp = items[index];
    items[index] = items[targetIndex];
    items[targetIndex] = temp;

    items.forEach((it, idx) => {
      it.position = idx;
      if (idx === 0) it.isMain = true;
      else it.isMain = false;
    });

    setGallery({
      ...gallery,
      items,
      hasDraft: true,
      updatedAt: new Date().toISOString(),
    });
  };

  const handleConfirmDelete = () => {
    if (!itemToDelete) return;
    const items = gallery.items
      .filter((it) => it.id !== itemToDelete.id)
      .map((it, idx) => ({
        ...it,
        position: idx,
        isMain: idx === 0,
      }));

    setGallery({
      ...gallery,
      items,
      hasDraft: true,
      updatedAt: new Date().toISOString(),
    });

    setStatusMessage("Image removed from gallery draft.");
    setItemToDelete(null);
  };

  // --------------------------------------------------------------------------
  // ACTIONS: File Upload & Media Library
  // --------------------------------------------------------------------------
  const handleFileUpload = async (files: FileList | null, replaceTarget?: BuyGalleryItem) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/avif"];
    if (!allowed.includes(file.type)) {
      setErrorMessage("Please select a JPG, PNG, WebP, or AVIF image file.");
      return;
    }

    try {
      setUploading(true);
      setErrorMessage(null);
      setUploadProgress(20);

      // Upload to Supabase storage
      const uploaded = await uploadProductImage(file, slug, (progress) => {
        setUploadProgress(progress);
      });

      if (replaceTarget) {
        // In-place replace
        const items = gallery.items.map((it) => {
          if (it.id === replaceTarget.id) {
            return {
              ...it,
              src: uploaded.src,
              uploadedAt: new Date().toISOString(),
            };
          }
          return it;
        });

        setGallery({
          ...gallery,
          items,
          hasDraft: true,
          updatedAt: new Date().toISOString(),
        });
        setStatusMessage("Image successfully replaced.");
        setItemToReplace(null);
      } else {
        // Add new
        const newItem: BuyGalleryItem = {
          id: `${slug}-custom-${Date.now()}`,
          src: uploaded.src,
          alt: uploaded.alt || `${product.name} view`,
          title: `Gallery Photo ${gallery.items.length + 1}`,
          position: gallery.items.length,
          isMain: gallery.items.length === 0,
          colorFinish: activeFinish !== "all" ? activeFinish : undefined,
          uploadedAt: new Date().toISOString(),
        };

        setGallery({
          ...gallery,
          items: [...gallery.items, newItem],
          hasDraft: true,
          updatedAt: new Date().toISOString(),
        });
        setStatusMessage("New image added to gallery draft.");
      }
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleMediaSelect = (item: MediaItem) => {
    if (mediaPickerMode === "replace" && itemToReplace) {
      const items = gallery.items.map((it) => {
        if (it.id === itemToReplace.id) {
          return {
            ...it,
            src: item.url,
            alt: item.alt || it.alt,
            title: item.title || it.title,
            uploadedAt: new Date().toISOString(),
          };
        }
        return it;
      });

      setGallery({
        ...gallery,
        items,
        hasDraft: true,
        updatedAt: new Date().toISOString(),
      });
      setStatusMessage("Replaced image with Media Library asset.");
      setItemToReplace(null);
    } else {
      const newItem: BuyGalleryItem = {
        id: `${slug}-media-${item.id || Date.now()}`,
        src: item.url,
        alt: item.alt || `${product.name} view`,
        title: item.title || `Gallery Photo ${gallery.items.length + 1}`,
        position: gallery.items.length,
        isMain: gallery.items.length === 0,
        colorFinish: activeFinish !== "all" ? activeFinish : undefined,
        uploadedAt: new Date().toISOString(),
      };

      setGallery({
        ...gallery,
        items: [...gallery.items, newItem],
        hasDraft: true,
        updatedAt: new Date().toISOString(),
      });
      setStatusMessage("Added image from Media Library.");
    }

    setShowMediaPicker(false);
  };

  const handleSaveItemEdit = () => {
    if (!itemToEdit) return;
    const items = gallery.items.map((it) => (it.id === itemToEdit.id ? itemToEdit : it));
    setGallery({
      ...gallery,
      items,
      hasDraft: true,
      updatedAt: new Date().toISOString(),
    });
    setItemToEdit(null);
    setStatusMessage("Image details updated.");
  };

  return (
    <div className="buy-gallery-manager" data-testid="buy-page-image-gallery">
      {/* 1. Header Toolbar */}
      <div className="buy-gallery-header">
        <div className="buy-gallery-title-group">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold text-slate-900">Buy Page Image Gallery</h2>
            {gallery.hasDraft ? (
              <span className="buy-gallery-status-badge is-draft">
                <AlertCircle size={12} />
                Draft Changes
              </span>
            ) : gallery.isPublished ? (
              <span className="buy-gallery-status-badge is-live">
                <Check size={12} />
                Published Live
              </span>
            ) : null}
          </div>
          <p className="text-xs text-slate-500">
            Manage the scrollable product gallery displayed to customers when configuring and purchasing {product.name}.
          </p>
        </div>

        <div className="buy-gallery-actions">
          <a
            href={liveBuyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="admin-btn admin-btn-secondary admin-btn-sm inline-flex items-center gap-1.5"
            title="Preview on live public storefront"
          >
            <span>Live Buy Page</span>
            <ExternalLink size={13} />
          </a>

          <button
            type="button"
            onClick={() => {
              setPreviewIndex(0);
              setShowPreviewModal(true);
            }}
            className="admin-btn admin-btn-secondary admin-btn-sm inline-flex items-center gap-1.5"
          >
            <Eye size={14} />
            <span>Preview Gallery</span>
          </button>

          {gallery.hasDraft && (
            <button
              type="button"
              onClick={handleDiscardDraft}
              className="admin-btn admin-btn-secondary admin-btn-sm inline-flex items-center gap-1.5 text-slate-600"
            >
              <RotateCcw size={13} />
              <span>Discard Draft</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleSaveDraft}
            disabled={saving || publishing}
            className="admin-btn admin-btn-secondary admin-btn-sm inline-flex items-center gap-1.5 font-bold"
          >
            <Save size={14} />
            <span>{saving ? "Saving Draft..." : "Save Draft"}</span>
          </button>

          <button
            type="button"
            onClick={handlePublishLive}
            disabled={saving || publishing || uploading}
            className="admin-btn admin-btn-primary admin-btn-sm inline-flex items-center gap-1.5 font-bold shadow-sm"
          >
            <Send size={14} />
            <span>{publishing ? "Publishing Live..." : "Publish Gallery"}</span>
          </button>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100"
              title="Close Gallery Editor"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Notifications */}
      {statusMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
          <AlertCircle size={16} className="text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* 2. Color Finish Filtering Bar (if product has finishes) */}
      {colorFinishes.length > 0 && (
        <div className="space-y-1.5">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Filter by Color Finish:
          </span>
          <div className="buy-gallery-finish-bar">
            <button
              type="button"
              onClick={() => setActiveFinish("all")}
              className={`buy-gallery-finish-pill ${activeFinish === "all" ? "is-active" : ""}`}
            >
              <span>Universal Gallery (All {colorFinishes.length} Finishes)</span>
            </button>
            {colorFinishes.map((fName) => {
              const opt = resolveColorOption(fName);
              const isAct = activeFinish.toLowerCase() === fName.toLowerCase();
              return (
                <button
                  key={fName}
                  type="button"
                  onClick={() => setActiveFinish(fName)}
                  className={`buy-gallery-finish-pill ${isAct ? "is-active" : ""}`}
                >
                  <span
                    className="w-3 h-3 rounded-full border border-white/50 shadow-xs inline-block"
                    style={{ backgroundColor: opt.hex }}
                  />
                  <span>{fName}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. Image Grid */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700">
            Active Gallery Images ({displayItems.length} photos)
          </span>
          <span className="text-[11px] text-slate-400">
            Image #1 serves as the primary storefront and thumbnail image.
          </span>
        </div>

        <div className="buy-gallery-grid">
          {displayItems.map((item, index) => {
            const isMain = index === 0 || item.isMain;
            return (
              <div
                key={item.id}
                data-testid={`buy-gallery-card-${index}`}
                className={`buy-gallery-card ${isMain ? "is-main" : ""}`}
              >
                <div className="buy-gallery-img-container">
                  <span className="buy-gallery-pos-tag">#{index + 1}</span>
                  {isMain && (
                    <span className="buy-gallery-main-tag">
                      <Star size={11} fill="#ffffff" />
                      Main
                    </span>
                  )}
                  <img src={item.src} alt={item.alt || "Product gallery view"} loading="lazy" />
                </div>

                <div className="buy-gallery-card-body">
                  <h4 className="buy-gallery-card-title">{item.title || `Gallery Image #${index + 1}`}</h4>
                  <p className="buy-gallery-card-alt" title={item.alt}>
                    {item.alt || "No alt text assigned."}
                  </p>
                  {item.colorFinish && (
                    <span className="text-[10px] text-indigo-700 font-semibold bg-indigo-50 px-2 py-0.5 rounded self-start">
                      Finish: {item.colorFinish}
                    </span>
                  )}

                  <div className="buy-gallery-card-actions">
                    <div className="flex items-center gap-1">
                      {/* Set as Main */}
                      {!isMain && (
                        <button
                          type="button"
                          onClick={() => handleSetMain(item)}
                          className="buy-gallery-icon-btn"
                          title="Set as Main Primary Image"
                        >
                          <Star size={13} />
                        </button>
                      )}

                      {/* Move Left */}
                      {index > 0 && (
                        <button
                          type="button"
                          onClick={() => handleMove(index, -1)}
                          className="buy-gallery-icon-btn"
                          title="Move Left / Earlier"
                        >
                          <ArrowLeft size={13} />
                        </button>
                      )}

                      {/* Move Right */}
                      {index < displayItems.length - 1 && (
                        <button
                          type="button"
                          onClick={() => handleMove(index, 1)}
                          className="buy-gallery-icon-btn"
                          title="Move Right / Later"
                        >
                          <ArrowRight size={13} />
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      {/* Replace */}
                      <button
                        type="button"
                        onClick={() => setItemToReplace(item)}
                        className="buy-gallery-icon-btn"
                        title="Replace Image with new photo"
                      >
                        <RefreshCw size={13} />
                      </button>

                      {/* Edit Details */}
                      <button
                        type="button"
                        onClick={() => setItemToEdit(item)}
                        className="buy-gallery-icon-btn"
                        title="Edit Alt Text & Caption"
                      >
                        <Edit3 size={13} />
                      </button>

                      {/* Delete */}
                      <button
                        type="button"
                        onClick={() => setItemToDelete(item)}
                        className="buy-gallery-icon-btn is-danger"
                        title="Delete Image from Gallery"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Add / Upload Dropzone Card */}
          <div className="buy-gallery-upload-card">
            <div className="buy-gallery-upload-icon">
              {uploading ? (
                <RefreshCw size={22} className="animate-spin text-[#d4af37]" />
              ) : (
                <ImagePlus size={22} />
              )}
            </div>
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-800 block">
                {uploading ? `Uploading (${uploadProgress}%)...` : "Add Gallery Image"}
              </span>
              <span className="text-[11px] text-slate-400 block">
                JPG, PNG, WebP up to 10MB
              </span>
            </div>

            <div className="flex flex-col gap-2 w-full max-w-[180px] pt-1">
              <label className="admin-btn admin-btn-primary admin-btn-sm text-xs cursor-pointer text-center">
                <span>Upload File</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/avif"
                  disabled={uploading}
                  onChange={(e) => void handleFileUpload(e.target.files)}
                  className="hidden"
                />
              </label>
              <button
                type="button"
                onClick={() => {
                  setMediaPickerMode("add");
                  setShowMediaPicker(true);
                }}
                className="admin-btn admin-btn-secondary admin-btn-sm text-xs"
              >
                Media Library
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ---------------------------------------------------------------------- */}
      {/* MODAL 1: Delete Confirmation                                           */}
      {/* ---------------------------------------------------------------------- */}
      {itemToDelete && (
        <div className="buy-gallery-modal-overlay" onClick={() => setItemToDelete(null)}>
          <div
            className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 text-rose-600">
              <Trash2 size={24} />
              <h3 className="font-bold text-base text-slate-900">Delete Gallery Image?</h3>
            </div>
            <div className="w-full h-36 bg-slate-50 border border-slate-200 rounded-xl p-2 flex items-center justify-center">
              <img
                src={itemToDelete.src}
                alt={itemToDelete.alt}
                className="max-h-full max-w-full object-contain"
              />
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to remove this image from the Buy Page gallery? It will be removed
              from your draft immediately and deleted from the live storefront when you click{" "}
              <strong>Publish Gallery</strong>.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setItemToDelete(null)}
                className="admin-btn admin-btn-secondary admin-btn-sm"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="admin-btn admin-btn-danger admin-btn-sm"
              >
                Delete Image
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------------------------- */}
      {/* MODAL 2: Replace Image                                                 */}
      {/* ---------------------------------------------------------------------- */}
      {itemToReplace && (
        <div className="buy-gallery-modal-overlay" onClick={() => setItemToReplace(null)}>
          <div
            className="w-full max-w-lg bg-white rounded-2xl shadow-2xl p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <RefreshCw size={18} className="text-[#d4af37]" />
                Replace Gallery Image
              </h3>
              <button
                type="button"
                onClick={() => setItemToReplace(null)}
                className="p-1 text-slate-400 hover:text-slate-800"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="w-20 h-20 bg-white border border-slate-200 rounded-lg p-1 flex items-center justify-center shrink-0">
                <img
                  src={itemToReplace.src}
                  alt={itemToReplace.alt}
                  className="max-h-full max-w-full object-contain"
                />
              </div>
              <div className="text-xs space-y-1 min-w-0">
                <span className="font-bold text-slate-800 block truncate">
                  Current: {itemToReplace.title || "Photo"}
                </span>
                <span className="text-slate-500 block truncate">Position: #{itemToReplace.position + 1}</span>
                <span className="text-[11px] text-slate-400">
                  The replacement image will occupy this exact same position in the gallery.
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <label className="p-4 rounded-xl border-2 border-dashed border-slate-200 hover:border-[#d4af37] bg-white flex flex-col items-center justify-center gap-2 cursor-pointer text-center">
                <ImagePlus size={24} className="text-[#d4af37]" />
                <span className="text-xs font-bold text-slate-800">Upload New Photo</span>
                <span className="text-[10px] text-slate-400">JPG, PNG, WebP</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/avif"
                  disabled={uploading}
                  onChange={(e) => void handleFileUpload(e.target.files, itemToReplace)}
                  className="hidden"
                />
              </label>

              <button
                type="button"
                onClick={() => {
                  setMediaPickerMode("replace");
                  setShowMediaPicker(true);
                }}
                className="p-4 rounded-xl border border-slate-200 hover:border-slate-400 bg-white flex flex-col items-center justify-center gap-2 text-center"
              >
                <ImageIcon size={24} className="text-indigo-600" />
                <span className="text-xs font-bold text-slate-800">Choose from Media Library</span>
                <span className="text-[10px] text-slate-400">Pick existing asset</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------------------------- */}
      {/* MODAL 3: Edit Details                                                  */}
      {/* ---------------------------------------------------------------------- */}
      {itemToEdit && (
        <div className="buy-gallery-modal-overlay" onClick={() => setItemToEdit(null)}>
          <div
            className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <Edit3 size={18} className="text-[#d4af37]" />
                Edit Image Details
              </h3>
              <button
                type="button"
                onClick={() => setItemToEdit(null)}
                className="p-1 text-slate-400 hover:text-slate-800"
              >
                <X size={18} />
              </button>
            </div>

            <div className="w-full h-32 bg-slate-50 border border-slate-200 rounded-xl p-2 flex items-center justify-center">
              <img
                src={itemToEdit.src}
                alt={itemToEdit.alt}
                className="max-h-full max-w-full object-contain"
              />
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Image Title / Caption</label>
                <input
                  type="text"
                  value={itemToEdit.title || ""}
                  onChange={(e) => setItemToEdit({ ...itemToEdit, title: e.target.value })}
                  placeholder="e.g. Contoured Profile on White"
                  className="w-full p-2.5 rounded-lg border border-slate-200 bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Accessibility Alt Text</label>
                <input
                  type="text"
                  value={itemToEdit.alt || ""}
                  onChange={(e) => setItemToEdit({ ...itemToEdit, alt: e.target.value })}
                  placeholder="e.g. Apple Watch Series 12 Jet Black profile"
                  className="w-full p-2.5 rounded-lg border border-slate-200 bg-white"
                />
              </div>

              {colorFinishes.length > 0 && (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Color Finish Mapping</label>
                  <select
                    value={itemToEdit.colorFinish || ""}
                    onChange={(e) =>
                      setItemToEdit({ ...itemToEdit, colorFinish: e.target.value || undefined })
                    }
                    className="w-full p-2.5 rounded-lg border border-slate-200 bg-white"
                  >
                    <option value="">Universal / Visible for All Finishes</option>
                    {colorFinishes.map((fName) => (
                      <option key={fName} value={fName}>
                        {fName} Only
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setItemToEdit(null)}
                className="admin-btn admin-btn-secondary admin-btn-sm"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveItemEdit}
                className="admin-btn admin-btn-primary admin-btn-sm"
              >
                Save Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------------------------- */}
      {/* MODAL 4: Desktop & Mobile Interactive Preview                          */}
      {/* ---------------------------------------------------------------------- */}
      {showPreviewModal && (
        <div className="buy-gallery-modal-overlay" onClick={() => setShowPreviewModal(false)}>
          <div className="buy-gallery-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="buy-gallery-modal-header">
              <div className="flex items-center gap-3">
                <Eye size={18} className="text-[#d4af37]" />
                <h3 className="font-bold text-base text-slate-900">
                  Buy Page Gallery Preview — {product.name}
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-50">
                  <button
                    type="button"
                    onClick={() => setPreviewViewport("desktop")}
                    className={`px-3 py-1 text-xs font-bold rounded-md flex items-center gap-1.5 transition-colors ${
                      previewViewport === "desktop"
                        ? "bg-white text-slate-900 shadow-xs"
                        : "text-slate-500 hover:text-slate-900"
                    }`}
                  >
                    <Monitor size={14} />
                    <span>Desktop</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewViewport("mobile")}
                    className={`px-3 py-1 text-xs font-bold rounded-md flex items-center gap-1.5 transition-colors ${
                      previewViewport === "mobile"
                        ? "bg-white text-slate-900 shadow-xs"
                        : "text-slate-500 hover:text-slate-900"
                    }`}
                  >
                    <Smartphone size={14} />
                    <span>Mobile</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setShowPreviewModal(false)}
                  className="p-1 text-slate-400 hover:text-slate-800"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="buy-gallery-modal-body bg-slate-100">
              <div
                className={
                  previewViewport === "desktop"
                    ? "buy-gallery-preview-stage-desktop"
                    : "buy-gallery-preview-stage-mobile"
                }
              >
                <SwipeableProductGallery
                  images={displayItems.map((it) => ({ src: it.src, alt: it.alt }))}
                  activeIndex={previewIndex}
                  onSelectIndex={setPreviewIndex}
                  productName={product.name}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------------------------- */}
      {/* MODAL 5: Media Library Picker                                          */}
      {/* ---------------------------------------------------------------------- */}
      {showMediaPicker && (
        <div className="buy-gallery-modal-overlay" onClick={() => setShowMediaPicker(false)}>
          <div
            className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl p-6 space-y-4 max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <ImageIcon size={18} className="text-[#d4af37]" />
                Select Photo from Media Library
              </h3>
              <button
                type="button"
                onClick={() => setShowMediaPicker(false)}
                className="p-1 text-slate-400 hover:text-slate-800"
              >
                <X size={18} />
              </button>
            </div>

            <AdminMediaLibrary
              isPicker
              onSelect={(asset: MediaItem) => {
                handleMediaSelect(asset);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
