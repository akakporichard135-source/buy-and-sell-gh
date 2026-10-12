import {
  AlertCircle,
  Archive,
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Edit3,
  ImagePlus,
  Package,
  Plus,
  RefreshCw,
  RotateCcw,
  Save,
  Search,
  Tag,
  Trash2,
  X,
} from "lucide-react";
import { type FormEvent, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useAdminAuth } from "../../admin/AdminAuth";
import { useProductCatalog } from "../../catalog/ProductCatalogContext";
import { getProductRam, withProductRam } from "../../catalog/catalogueDiscovery";
import {
  categories,
  createProductSlug,
  getPrimaryImage,
  normalizeProduct,
  productConditions,
  stockStatuses,
} from "../../catalog/productCatalog";
import { getBrandOptions } from "../../catalog/storefrontTaxonomy";
import { uploadProductImage } from "../../catalog/supabaseProductRepository";
import type { Product, ProductImage } from "../../types/product";
import { formatGhs } from "../../utils/format";
import {
  hasOwnerUploadedProductImages,
  isUsedProductCondition,
  resolveAdminProductImage,
} from "../../utils/productImages";

const listToText = (items?: string[]) => (items ?? []).join("\n");
const textToList = (value: string) =>
  value
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);

interface ProductFormState {
  id: string;
  slug: string;
  name: string;
  category: Product["category"];
  subcategory: string;
  brand: Product["brand"];
  model: string;
  generation: string;
  condition: Product["condition"];
  price: string;
  previousPrice: string;
  priceOnRequest: boolean;
  stockQuantity: string;
  stockStatus: Product["stockStatus"];
  storage: string;
  ram: string;
  colors: string;
  defaultColor: string;
  batteryHealth: string;
  warranty: string;
  shortDescription: string;
  description: string;
  specifications: string;
  includedItems: string;
  deliveryInfo: string;
  images: ProductImage[];
  primaryImageIndex: number;
  featured: boolean;
  newArrival: boolean;
  popular: boolean;
  available: boolean;
  archived: boolean;
  createdAt?: string;
}

export const productToForm = (product: Product): ProductFormState => ({
  id: product.id,
  slug: product.slug,
  name: product.name,
  category: product.category,
  subcategory: product.subcategory ?? "",
  brand: product.brand,
  model: product.model,
  generation: product.generation ?? "",
  condition: product.condition,
  price: String(product.price),
  previousPrice:
    product.previousPrice || product.oldPrice
      ? String(product.previousPrice ?? product.oldPrice)
      : "",
  priceOnRequest: product.priceOnRequest ?? false,
  stockQuantity: String(product.stockQuantity),
  stockStatus: product.stockStatus,
  storage: listToText(product.storage),
  ram: getProductRam(product),
  colors: listToText(product.colors),
  defaultColor: product.defaultColor ?? product.colors[0] ?? "",
  batteryHealth: product.batteryHealth ?? "",
  warranty: product.warranty ?? product.warrantyInfo ?? "",
  shortDescription: product.shortDescription ?? "",
  description: product.description,
  specifications: listToText(product.specifications ?? product.specs),
  includedItems: listToText(product.includedItems ?? product.box),
  deliveryInfo: product.deliveryInfo ?? product.deliveryNote ?? "",
  images: product.images,
  primaryImageIndex: product.primaryImageIndex ?? 0,
  featured: product.featured ?? product.isFeatured ?? false,
  newArrival: product.newArrival ?? product.isNewArrival ?? false,
  popular: product.popular ?? product.isPopular ?? false,
  available: product.available ?? true,
  archived: product.archived ?? false,
  createdAt: product.createdAt,
});

export function AdminProductManager() {
  const { session } = useAdminAuth();
  const {
    products,
    saveProduct,
    archiveProduct,
    deleteProduct,
    markSold,
    markOutOfStock,
    resetToSeedCatalog,
    createDraftProduct,
    backendStatus,
    loading,
    error,
  } = useProductCatalog();

  const [query, setQuery] = useState("");
  const [brand, setBrand] = useState("All");
  const [category, setCategory] = useState("All");
  const [condition, setCondition] = useState("All");
  const [stock, setStock] = useState("All");
  const [availability, setAvailability] = useState("All");
  const [editing, setEditing] = useState<ProductFormState | null>(null);
  const [pendingEditorTarget, setPendingEditorTarget] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [actionError, setActionError] = useState("");
  const [saving, setSaving] = useState(false);

  // Confirmation dialog modal state
  const [confirmModal, setConfirmModal] = useState<{
    open: boolean;
    title: string;
    description: string;
    actionLabel: string;
    isDanger: boolean;
    onConfirm: () => Promise<void>;
  }>({
    open: false,
    title: "",
    description: "",
    actionLabel: "",
    isDanger: false,
    onConfirm: async () => {},
  });

  const editorRef = useRef<HTMLDivElement>(null);
  const productNameRef = useRef<HTMLInputElement>(null);
  const brandOptions = useMemo(
    () => getBrandOptions(products, editing?.brand),
    [editing?.brand, products]
  );

  const filtered = useMemo(() => {
    const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
    return products.filter((product) => {
      const searchable = [
        product.name,
        product.slug,
        product.model,
        product.brand,
        product.category,
        product.subcategory ?? "",
        product.condition,
        product.stockStatus,
        ...(product.tags ?? []),
      ]
        .join(" ")
        .toLowerCase();
      return (
        terms.every((term) => searchable.includes(term)) &&
        (brand === "All" || product.brand === brand) &&
        (category === "All" || product.category === category) &&
        (condition === "All" || product.condition === condition) &&
        (stock === "All" || product.stockStatus === stock) &&
        (availability === "All" ||
          (availability === "Published" && product.available !== false && !product.archived) ||
          (availability === "Hidden" && product.available === false && !product.archived) ||
          (availability === "Archived" && product.archived === true))
      );
    });
  }, [availability, brand, category, condition, products, query, stock]);

  useLayoutEffect(() => {
    if (!pendingEditorTarget) return;
    editorRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    setPendingEditorTarget(null);
  }, [pendingEditorTarget]);

  // Focus product name and lock body scroll when drawer opens; handle Escape key
  useEffect(() => {
    if (!editing) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setEditing(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const focusTimer = window.setTimeout(() => {
      productNameRef.current?.focus();
    }, 60);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow;
      window.clearTimeout(focusTimer);
    };
  }, [editing?.id]);

  const startAdd = () => {
    setMessage("");
    setActionError("");
    const draft = productToForm({ ...createDraftProduct(), available: false });
    setEditing(draft);
    setPendingEditorTarget(draft.id);
  };

  const startEdit = (product: Product) => {
    setMessage("");
    setActionError("");
    setEditing(productToForm(product));
    setPendingEditorTarget(product.id);
  };

  const runAction = async (action: () => Promise<void>, success: string) => {
    setActionError("");
    try {
      await action();
      setMessage(success);
    } catch (actionFailure) {
      setActionError(
        actionFailure instanceof Error
          ? actionFailure.message
          : "Action failed. Check Supabase permissions and try again."
      );
    }
  };

  const handleSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editing || saving) return;
    if (!editing.brand.trim()) {
      setActionError("Enter the product brand before saving.");
      return;
    }
    const normalized = formToProduct(editing, products);
    if (!normalized.priceOnRequest && (!Number.isFinite(normalized.price) || normalized.price <= 0)) {
      setActionError(
        "Enter a confirmed Ghana cedi price greater than 0, or turn on Contact for Price before saving."
      );
      return;
    }
    if (
      normalized.available &&
      !normalized.archived &&
      isUsedProductCondition(normalized.condition) &&
      !hasOwnerUploadedProductImages(normalized)
    ) {
      setActionError(
        "Upload real photos of this exact device to Supabase Storage before publishing it."
      );
      return;
    }
    setSaving(true);
    setActionError("");
    try {
      const saved = await saveProduct(normalized);
      setEditing(productToForm(saved));
      setMessage(`${normalized.name} saved successfully.`);
    } catch (saveFailure) {
      setActionError(saveFailure instanceof Error ? saveFailure.message : "Product could not be saved.");
    } finally {
      setSaving(false);
    }
  };

  const promptConfirm = (
    title: string,
    description: string,
    actionLabel: string,
    isDanger: boolean,
    action: () => Promise<void>,
    successMessage: string
  ) => {
    setConfirmModal({
      open: true,
      title,
      description,
      actionLabel,
      isDanger,
      onConfirm: async () => {
        setConfirmModal((prev) => ({ ...prev, open: false }));
        await runAction(action, successMessage);
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Card */}
      <div className="admin-header-card">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-[#d4af37]">
              Product Catalogue
            </span>
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-slate-300" />
            <span className="text-xs font-semibold text-slate-500">
              {getBackendLabel(backendStatus)}
            </span>
          </div>
          <h2>Catalogue &amp; Inventory Control</h2>
          <p>
            Manage device catalog specifications, images, conditions, categories, and storefront
            visibility.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link to="/admin/pricing" className="admin-btn admin-btn-secondary">
            <Tag size={16} className="text-[#d4af37]" />
            <span>Pricing &amp; Stock</span>
          </Link>
          <button className="admin-btn admin-btn-primary" type="button" onClick={startAdd}>
            <Plus size={16} />
            <span>Add New Product</span>
          </button>
        </div>
      </div>

      {message && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 size={16} />
          <span>{message}</span>
        </div>
      )}

      {(actionError || error) && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
          <AlertCircle size={16} />
          <span>{actionError || error}</span>
        </div>
      )}

      {/* 2. Filter & Search Toolbar */}
      <div className="admin-toolbar">
        <div className="admin-search-input">
          <Search size={16} className="text-slate-400 shrink-0" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search devices by name, model, generation..."
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="admin-select"
          >
            <option value="All">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <select
            value={condition}
            onChange={(e) => setCondition(e.target.value)}
            className="admin-select"
          >
            <option value="All">All Conditions</option>
            {productConditions.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <select
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            className="admin-select"
          >
            <option value="All">All Stock</option>
            {stockStatuses.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          <select
            value={availability}
            onChange={(e) => setAvailability(e.target.value)}
            className="admin-select"
          >
            <option value="All">All Visibility</option>
            <option value="Published">Published</option>
            <option value="Hidden">Hidden</option>
            <option value="Archived">Archived</option>
          </select>

          {backendStatus !== "supabase" && (
            <button
              className="admin-btn admin-btn-secondary admin-btn-sm"
              type="button"
              onClick={() => resetToSeedCatalog()}
            >
              <RotateCcw size={14} />
              <span>Reset Local</span>
            </button>
          )}
        </div>
      </div>

      {/* 3. Products Data Table */}
      <div className="admin-table-shell">
        <div className="admin-table-scroll">
          <table className="admin-data-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Condition</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Visibility</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-400 font-medium">
                    Loading product catalog...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-400 font-medium">
                    No products match the selected filters.
                  </td>
                </tr>
              ) : (
                filtered.map((product) => {
                  const image = getPrimaryImage(product);
                  const isArchived = Boolean(product.archived);

                  return (
                    <tr
                      key={product.id}
                      className={`hover:bg-slate-50/70 ${isArchived ? "opacity-60" : ""}`}
                    >
                      <td>
                        <div className="flex items-center gap-3">
                          {image?.src ? (
                            <img
                              src={image.src}
                              alt={image.alt || product.name}
                              className="w-12 h-12 rounded-lg object-contain bg-white border border-slate-200 shrink-0 p-1"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-lg bg-slate-100 border border-slate-200 grid place-items-center text-[0.65rem] text-slate-400 font-semibold shrink-0">
                              No pic
                            </div>
                          )}
                          <div className="min-w-0">
                            <span className="font-bold text-slate-900 block truncate">
                              {product.name}
                            </span>
                            <span className="text-xs text-slate-400 block">
                              {product.brand} &bull; {product.model}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="admin-badge admin-badge-slate">{product.category}</span>
                      </td>
                      <td>
                        <span
                          className={`admin-badge text-[0.7rem] ${
                            product.condition.includes("Brand New")
                              ? "admin-badge-emerald"
                              : "admin-badge-amber"
                          }`}
                        >
                          {product.condition}
                        </span>
                      </td>
                      <td className="font-bold text-slate-900">
                        {product.priceOnRequest || product.price <= 0
                          ? "Contact for Price"
                          : formatGhs(product.price)}
                      </td>
                      <td>
                        <span
                          className={`admin-badge text-[0.7rem] ${
                            product.stockStatus === "In Stock"
                              ? "admin-badge-emerald"
                              : product.stockStatus === "Low Stock"
                              ? "admin-badge-amber"
                              : "admin-badge-rose"
                          }`}
                        >
                          {product.stockStatus} ({product.stockQuantity})
                        </span>
                      </td>
                      <td>
                        <span
                          className={`admin-badge text-[0.7rem] ${
                            isArchived
                              ? "admin-badge-rose"
                              : product.available !== false
                              ? "admin-badge-emerald"
                              : "admin-badge-slate"
                          }`}
                        >
                          {isArchived ? "Archived" : product.available !== false ? "Published" : "Hidden"}
                        </span>
                      </td>
                      <td>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => startEdit(product)}
                            className="admin-btn admin-btn-secondary admin-btn-sm"
                          >
                            <Edit3 size={13} />
                            <span>Edit</span>
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              promptConfirm(
                                isArchived ? "Restore Product" : "Archive Product",
                                `Are you sure you want to ${
                                  isArchived ? "restore" : "archive"
                                } "${product.name}"? ${
                                  isArchived
                                    ? "It will become visible in the catalog."
                                    : "It will be hidden from customer storefront views."
                                }`,
                                isArchived ? "Restore" : "Archive",
                                false,
                                () => archiveProduct(product.id),
                                `${product.name} ${isArchived ? "restored" : "archived"}.`
                              )
                            }
                            className="p-1.5 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100"
                            title="Toggle Archive"
                          >
                            <Archive size={14} />
                          </button>
                          {session?.role === "owner" && (
                            <button
                              type="button"
                              onClick={() =>
                                promptConfirm(
                                  "Delete Product Permanently",
                                  `Are you sure you want to permanently delete "${product.name}"? This action cannot be undone.`,
                                  "Delete Permanently",
                                  true,
                                  () => deleteProduct(product.id),
                                  `${product.name} deleted.`
                                )
                              }
                              className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                              title="Delete Product"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Product Editor Drawer Modal */}
      {editing && (
        <div
          className="admin-drawer-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="admin-product-editor-title"
        >
          <div
            className="admin-drawer-backdrop"
            onClick={() => setEditing(null)}
            aria-hidden="true"
          />
          <div className="admin-drawer-panel" ref={editorRef} tabIndex={-1}>
            <div className="admin-drawer-header">
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[0.68rem] font-bold uppercase tracking-wider text-[#d4af37]">
                    Product Editor
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 font-semibold">
                    {editing.category || "Listing"}
                  </span>
                  {editing.condition && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">
                      {editing.condition}
                    </span>
                  )}
                </div>
                <h2 id="admin-product-editor-title" className="text-lg font-bold text-slate-900 truncate">
                  {editing.name || "New Device Listing"}
                </h2>
              </div>
              <button
                className="admin-btn admin-btn-secondary admin-btn-sm"
                type="button"
                onClick={() => setEditing(null)}
                aria-label="Close product editor"
              >
                <X size={16} />
                <span>Cancel</span>
              </button>
            </div>

            <div className="admin-drawer-body">
              <ProductForm
                form={editing}
                setForm={setEditing}
                onSubmit={handleSave}
                products={products}
                brandOptions={brandOptions}
                backendStatus={backendStatus}
                saving={saving}
                setActionError={setActionError}
                productNameRef={productNameRef}
                onCancel={() => setEditing(null)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Dialog Modal */}
      {confirmModal.open && (
        <div className="admin-modal-overlay" onClick={() => setConfirmModal((p) => ({ ...p, open: false }))}>
          <div className="admin-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3 className="text-base font-bold text-slate-900">{confirmModal.title}</h3>
              <button
                type="button"
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
                onClick={() => setConfirmModal((p) => ({ ...p, open: false }))}
              >
                <X size={18} />
              </button>
            </div>
            <div className="admin-modal-body">
              <p className="text-sm text-slate-600">{confirmModal.description}</p>
            </div>
            <div className="admin-modal-footer">
              <button
                type="button"
                className="admin-btn admin-btn-secondary admin-btn-sm"
                onClick={() => setConfirmModal((p) => ({ ...p, open: false }))}
              >
                Cancel
              </button>
              <button
                type="button"
                className={`admin-btn admin-btn-sm ${
                  confirmModal.isDanger ? "admin-btn-danger" : "admin-btn-primary"
                }`}
                onClick={() => void confirmModal.onConfirm()}
              >
                {confirmModal.actionLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ProductForm({
  form,
  setForm,
  onSubmit,
  products,
  brandOptions,
  backendStatus,
  saving,
  setActionError,
  productNameRef,
  onCancel,
}: {
  form: ProductFormState;
  setForm: (form: ProductFormState) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  products: Product[];
  brandOptions: string[];
  backendStatus: string;
  saving: boolean;
  setActionError: (message: string) => void;
  productNameRef: React.RefObject<HTMLInputElement | null>;
  onCancel: () => void;
}) {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [replacingIndex, setReplacingIndex] = useState<number | null>(null);

  const update = <K extends keyof ProductFormState>(key: K, value: ProductFormState[K]) =>
    setForm({ ...form, [key]: value });

  const updateImage = (index: number, field: keyof ProductImage, value: string) =>
    update(
      "images",
      form.images.map((image, itemIndex) =>
        itemIndex === index ? { ...image, [field]: value } : image
      )
    );

  const removeImage = (index: number) => {
    const images = form.images.filter((_, itemIndex) => itemIndex !== index);
    const primaryImageIndex =
      index < form.primaryImageIndex
        ? form.primaryImageIndex - 1
        : index === form.primaryImageIndex
        ? Math.min(index, Math.max(0, images.length - 1))
        : form.primaryImageIndex;
    setForm({ ...form, images, primaryImageIndex });
  };

  const moveImage = (index: number, direction: -1 | 1) => {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= form.images.length) return;
    const next = [...form.images];
    [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
    const primaryImageIndex =
      form.primaryImageIndex === index
        ? nextIndex
        : form.primaryImageIndex === nextIndex
        ? index
        : form.primaryImageIndex;
    setForm({ ...form, images: next, primaryImageIndex });
  };

  const handleFileUpload = async (files: FileList | null) => {
    if (!files?.length) return;
    if (backendStatus !== "supabase") {
      setActionError("Connect Supabase Storage before uploading production product images.");
      return;
    }
    const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
    const fileArray = Array.from(files);
    for (const file of fileArray) {
      if (file.size > MAX_SIZE_BYTES) {
        setActionError(`"${file.name}" exceeds the 5MB size limit. Please upload images under 5MB.`);
        return;
      }
      if (!file.type.match(/^image\/(jpeg|png|webp|avif)$/)) {
        setActionError(`"${file.name}" is not a supported format. Please upload JPG, PNG, WebP, or AVIF.`);
        return;
      }
    }
    setUploading(true);
    setUploadProgress(0);
    setActionError("");
    try {
      const nextImages = [...form.images];
      for (const file of fileArray) {
        if (nextImages.some((image) => image.alt === file.name.replace(/\.[^.]+$/, ""))) continue;
        const image = await uploadProductImage(file, form.id, setUploadProgress);
        nextImages.push({ ...image, alt: `${form.name || "Product"} image` });
      }
      update("images", nextImages);
    } catch (uploadFailure) {
      setActionError(
        uploadFailure instanceof Error ? uploadFailure.message : "Image upload failed."
      );
    } finally {
      setUploading(false);
      window.setTimeout(() => setUploadProgress(0), 900);
    }
  };

  return (
    <form className="space-y-6" onSubmit={onSubmit}>
      {/* 1. Basic Info */}
      <div className="p-5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-4">
        <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
          <span>1. General Device Information</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Product Name *</label>
            <input
              ref={productNameRef}
              required
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              onBlur={() =>
                update(
                  "slug",
                  createProductSlug(
                    form.name,
                    products.filter((p) => p.id !== form.id),
                    form.id
                  )
                )
              }
              className="w-full p-2.5 rounded-lg border border-slate-200 bg-white"
              placeholder="e.g. iPhone 16 Pro Max"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Brand *</label>
            <input
              required
              list="admin-brand-opts"
              value={form.brand}
              onChange={(e) => update("brand", e.target.value)}
              className="w-full p-2.5 rounded-lg border border-slate-200 bg-white"
              placeholder="Apple, Google, Samsung..."
            />
            <datalist id="admin-brand-opts">
              {brandOptions.map((b) => (
                <option key={b} value={b} />
              ))}
            </datalist>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Category *</label>
            <select
              value={form.category}
              onChange={(e) =>
                setForm({
                  ...form,
                  category: e.target.value as Product["category"],
                  subcategory: ["Phones & Tablets", "Electronics"].includes(e.target.value)
                    ? ""
                    : form.subcategory,
                })
              }
              className="w-full p-2.5 rounded-lg border border-slate-200 bg-white"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {form.category === "Phones & Tablets" ? (
            <div>
              <label className="block font-bold text-slate-700 mb-1">Marketplace category</label>
              <select
                value={form.subcategory}
                required
                onChange={(event) => update("subcategory", event.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-200 bg-white"
              >
                <option value="">Choose a category</option>
                <option value="Mobile Phones">Mobile Phones</option>
                <option value="Accessories for Phones &amp; Tablets">Accessories for Phones &amp; Tablets</option>
                <option value="Smart Watches">Smart Watches</option>
                <option value="Tablets">Tablets</option>
                {form.subcategory &&
                  !["Mobile Phones", "Accessories for Phones & Tablets", "Smart Watches", "Tablets"].includes(form.subcategory) && (
                    <option value={form.subcategory}>{form.subcategory}</option>
                  )}
              </select>
            </div>
          ) : form.category === "Electronics" ? (
            <div>
              <label className="block font-bold text-slate-700 mb-1">Marketplace category</label>
              <select
                value={form.subcategory}
                required
                onChange={(event) => update("subcategory", event.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-200 bg-white"
              >
                <option value="">Choose a category</option>
                <option value="Laptops & Computers">Laptops &amp; Computers</option>
                <option value="TV & Video Equipment">TV &amp; Video Equipment</option>
                <option value="Video Game Consoles">Video Game Consoles</option>
                <option value="Audio &amp; Music Equipment">Audio &amp; Music Equipment</option>
                {form.subcategory &&
                  !["Laptops & Computers", "TV & Video Equipment", "Video Game Consoles", "Audio & Music Equipment"].includes(form.subcategory) && (
                    <option value={form.subcategory}>{form.subcategory}</option>
                  )}
              </select>
            </div>
          ) : (
            <div>
              <label className="block font-bold text-slate-700 mb-1">Subcategory / family</label>
              <input
                value={form.subcategory}
                onChange={(event) => update("subcategory", event.target.value)}
                placeholder="Product family"
                className="w-full p-2.5 rounded-lg border border-slate-200 bg-white"
              />
            </div>
          )}

          <div>
            <label className="block font-bold text-slate-700 mb-1">Model *</label>
            <input
              required
              value={form.model}
              onChange={(e) => update("model", e.target.value)}
              className="w-full p-2.5 rounded-lg border border-slate-200 bg-white"
              placeholder="e.g. A3106"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Physical Condition *</label>
            <select
              value={form.condition}
              onChange={(e) => update("condition", e.target.value as Product["condition"])}
              className="w-full p-2.5 rounded-lg border border-slate-200 bg-white"
            >
              {productConditions.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Generation / Year</label>
            <input
              value={form.generation}
              onChange={(e) => update("generation", e.target.value)}
              className="w-full p-2.5 rounded-lg border border-slate-200 bg-white"
              placeholder="e.g. 2024 / M4 Series"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block font-bold text-slate-700 mb-1">URL Slug (Auto-Generated)</label>
            <input
              readOnly
              value={form.slug}
              className="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-100 text-slate-500 font-mono"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block font-bold text-slate-700 mb-1">Full Description *</label>
            <textarea
              required
              rows={3}
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              className="w-full p-2.5 rounded-lg border border-slate-200 bg-white"
              placeholder="Detailed customer overview, specifications, and device highlight points..."
            />
          </div>
        </div>
      </div>

      {/* 2. Pricing & Inventory */}
      <div className="p-5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-4">
        <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
          <span>2. Pricing &amp; Stock Availability</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Base Price (GH₵) *</label>
            <input
              required
              type="number"
              min="0"
              step="0.01"
              value={form.price}
              onChange={(e) => update("price", e.target.value)}
              className="w-full p-2.5 rounded-lg border border-slate-200 bg-white"
              placeholder="e.g. 18500"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Previous / Strikethrough Price (GH₵)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.previousPrice}
              onChange={(e) => update("previousPrice", e.target.value)}
              className="w-full p-2.5 rounded-lg border border-slate-200 bg-white"
              placeholder="Leave empty if not on sale"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Stock Quantity *</label>
            <input
              required
              type="number"
              min="0"
              value={form.stockQuantity}
              onChange={(e) => update("stockQuantity", e.target.value)}
              className="w-full p-2.5 rounded-lg border border-slate-200 bg-white"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Stock Status *</label>
            <select
              value={form.stockStatus}
              onChange={(e) => update("stockStatus", e.target.value as Product["stockStatus"])}
              className="w-full p-2.5 rounded-lg border border-slate-200 bg-white"
            >
              {stockStatuses.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2 flex flex-wrap gap-4 pt-1">
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-700">
              <input
                type="checkbox"
                checked={form.priceOnRequest}
                onChange={(e) => update("priceOnRequest", e.target.checked)}
                className="rounded"
              />
              <span>Contact for Price (Disables direct checkout)</span>
            </label>

            <label className="flex items-center gap-2 text-xs font-semibold text-slate-700">
              <input
                type="checkbox"
                checked={form.available}
                onChange={(e) => update("available", e.target.checked)}
                className="rounded"
              />
              <span>Published on Storefront</span>
            </label>

            <label className="flex items-center gap-2 text-xs font-semibold text-slate-700">
              <input
                type="checkbox"
                checked={form.archived}
                onChange={(e) => update("archived", e.target.checked)}
                className="rounded"
              />
              <span>Archived</span>
            </label>
          </div>
        </div>
      </div>

      {/* 3. Specifications & Storage */}
      <div className="p-5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-4">
        <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
          <span>3. Storage, Colors &amp; Hardware Specs</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Storage Tiers (One per line)</label>
            <textarea
              rows={3}
              value={form.storage}
              onChange={(e) => update("storage", e.target.value)}
              className="w-full p-2.5 rounded-lg border border-slate-200 bg-white"
              placeholder="128GB&#10;256GB&#10;512GB&#10;1TB"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">RAM, where applicable</label>
            <input
              value={form.ram}
              onChange={(e) => update("ram", e.target.value)}
              className="w-full p-2.5 rounded-lg border border-slate-200 bg-white"
              placeholder="8GB, 16GB, 32GB..."
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Color Finishes (One per line)</label>
            <textarea
              rows={3}
              value={form.colors}
              onChange={(e) => update("colors", e.target.value)}
              className="w-full p-2.5 rounded-lg border border-slate-200 bg-white"
              placeholder="Natural Titanium&#10;Black Titanium&#10;White Titanium"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Battery Health %</label>
            <input
              value={form.batteryHealth}
              onChange={(e) => update("batteryHealth", e.target.value)}
              className="w-full p-2.5 rounded-lg border border-slate-200 bg-white"
              placeholder="100% or 92% (for used devices)"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Warranty Term</label>
            <input
              value={form.warranty}
              onChange={(e) => update("warranty", e.target.value)}
              className="w-full p-2.5 rounded-lg border border-slate-200 bg-white"
              placeholder="1 Year Apple Official Warranty or 6 Months Shop Warranty"
            />
          </div>
        </div>
      </div>

      {/* 4. Product Images */}
      <div className="p-5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-sm">4. Product Media &amp; Photos</h3>
          <span className="text-xs text-slate-500">{form.images.length} custom images loaded</span>
        </div>

        {/* If no custom images exist, show the active storefront baseline presentation */}
        {form.images.length === 0 ? (
          <div className="p-4 rounded-xl bg-white border border-slate-200 flex flex-col sm:flex-row items-center gap-4">
            <div className="w-24 h-24 rounded-lg bg-white border border-slate-100 flex items-center justify-center p-2 shrink-0">
              <img
                src={resolveAdminProductImage(formToProduct(form, products))?.src}
                alt={form.name}
                className="max-h-full max-w-full object-contain"
              />
            </div>
            <div className="space-y-1 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900">Active Storefront Baseline</span>
                <span className="text-[0.65rem] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                  Clean Pure White (#FFFFFF)
                </span>
              </div>
              <p className="text-slate-500">
                Customers currently see this verified high-resolution presentation render on buyandsellgh.com. Uploading custom photos below will take precedence over this baseline.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {form.images.map((img, idx) => (
              <div
                key={idx}
                className={`p-2 rounded-xl bg-white border relative ${
                  form.primaryImageIndex === idx ? "border-[#d4af37] ring-2 ring-[#d4af37]/20" : "border-slate-200"
                }`}
              >
                <img
                  src={img.src}
                  alt={img.alt || "Product image"}
                  className="w-full h-28 object-contain rounded-lg bg-white"
                />
                <div className="mt-2 flex items-center justify-between text-[0.7rem]">
                  <button
                    type="button"
                    onClick={() => update("primaryImageIndex", idx)}
                    className={`font-semibold ${
                      form.primaryImageIndex === idx ? "text-[#d4af37]" : "text-slate-400 hover:text-slate-700"
                    }`}
                  >
                    {form.primaryImageIndex === idx ? "Primary" : "Set Primary"}
                  </button>
                  <div className="flex items-center gap-1">
                    {idx > 0 && (
                      <button
                        type="button"
                        onClick={() => moveImage(idx, -1)}
                        className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded"
                        title="Move Left"
                      >
                        <ArrowLeft size={12} />
                      </button>
                    )}
                    {idx < form.images.length - 1 && (
                      <button
                        type="button"
                        onClick={() => moveImage(idx, 1)}
                        className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded"
                        title="Move Right"
                      >
                        <ArrowRight size={12} />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="text-rose-500 hover:text-rose-700 font-semibold ml-1"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Upload Trigger */}
        <div className="pt-2">
          <label className="admin-btn admin-btn-secondary text-xs cursor-pointer inline-flex items-center gap-2">
            <ImagePlus size={15} />
            <span>{uploading ? `Uploading (${uploadProgress}%)...` : "Upload Photos to Supabase"}</span>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif"
              multiple
              disabled={backendStatus !== "supabase" || uploading}
              onChange={(e) => void handleFileUpload(e.target.files)}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* 5. Sticky Action Bar */}
      <div className="p-4 rounded-xl bg-white border border-slate-200 flex items-center justify-between gap-4 sticky bottom-0 shadow-lg z-20">
        <div className="min-w-0">
          <span className="text-xs text-slate-800 font-bold block truncate">
            {form.priceOnRequest
              ? "Enquiry-only mode active"
              : `Ghana Cedi Price: ${formatGhs(Number(form.price) || 0)}`}
          </span>
          <span className="text-[0.68rem] text-slate-400">
            {form.stockQuantity} units • {form.stockStatus}
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            className="admin-btn admin-btn-secondary admin-btn-sm"
            type="button"
            onClick={onCancel}
            disabled={saving}
          >
            Cancel
          </button>
          <button
            className="admin-btn admin-btn-primary admin-btn-sm"
            type="submit"
            disabled={saving || uploading}
          >
            <Save size={15} />
            <span>{saving ? "Saving..." : "Save Listing"}</span>
          </button>
        </div>
      </div>
    </form>
  );
}

function getBackendLabel(status: string) {
  if (status === "supabase") return "Supabase PostgreSQL";
  if (status === "error") return "Supabase Error";
  if (status === "local-catalog") return "Local Dev Catalogue";
  return "Seed Fallback";
}

export function formToProduct(form: ProductFormState, products: Product[]): Product {
  const existing = products.find((product) => product.id === form.id);
  const storage = textToList(form.storage);
  const colors = textToList(form.colors);
  const quantity = Math.max(0, Number(form.stockQuantity) || 0);
  const stockStatus =
    form.stockStatus === "Sold" ? "Sold" : quantity === 0 ? "Out of Stock" : form.stockStatus;
  const specifications = withProductRam(textToList(form.specifications), form.ram);
  const includedItems = textToList(form.includedItems);
  const validImages = form.images.filter((image) => image.src.trim());
  const selectedPrimaryImage = form.images[form.primaryImageIndex];
  const primaryImageIndex = Math.max(
    0,
    selectedPrimaryImage ? validImages.indexOf(selectedPrimaryImage) : 0
  );

  return normalizeProduct({
    ...(existing ?? {}),
    id: form.id,
    slug: form.slug,
    name: form.name,
    brand: form.brand.trim(),
    category: form.category,
    subcategory: form.subcategory,
    model: form.model,
    generation: form.generation,
    price: Number(form.price) || 0,
    previousPrice: form.previousPrice ? Number(form.previousPrice) : undefined,
    priceOnRequest: form.priceOnRequest,
    condition: form.condition,
    storage,
    colors,
    defaultColor: form.defaultColor || colors[0] || "",
    batteryHealth: form.batteryHealth,
    warranty: form.warranty,
    warrantyInfo: form.warranty,
    shortDescription: form.shortDescription,
    description: form.description,
    specifications,
    specs: specifications,
    includedItems,
    box: includedItems,
    deliveryInfo: form.deliveryInfo,
    deliveryNote: form.deliveryInfo,
    images: validImages,
    primaryImageIndex,
    stockQuantity: quantity,
    stockStatus,
    imageTone: existing?.imageTone ?? "from-white via-zinc-100 to-yellow-100",
    badges: [
      form.newArrival ? "New Arrival" : "",
      form.condition,
      stockStatus === "Sold" ? "Sold" : "",
    ].filter(Boolean),
    featured: form.featured,
    newArrival: form.newArrival,
    popular: form.popular,
    available: form.available && stockStatus !== "Sold",
    archived: form.archived,
    tags: textToList(`${form.name},${form.model},${form.category},${form.storage},${form.colors}`),
    createdAt: form.createdAt ?? new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  } as Product);
}
