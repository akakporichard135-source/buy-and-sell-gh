import {
  AlertCircle,
  Archive,
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Edit3,
  Image as ImageIcon,
  ImagePlus,
  Package,
  Plus,
  RefreshCw,
  RotateCcw,
  Save,
  Search,
  ShieldCheck,
  Tag,
  Trash2,
  X,
} from "lucide-react";
import { type FormEvent, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useAdminAuth } from "../../admin/AdminAuth";
import { AdminMediaLibrary } from "./AdminMediaLibrary";
import type { MediaItem } from "../../cms/types";
import { useProductCatalog } from "../../catalog/ProductCatalogContext";
import { getProductRam, withProductRam } from "../../catalog/catalogueDiscovery";
import {
  categories,
  createProductSlug,
  getPrimaryImage,
  isProductImageEligible,
  normalizeProduct,
  productConditions,
  stockStatuses,
} from "../../catalog/productCatalog";
import { getBrandOptions } from "../../catalog/storefrontTaxonomy";
import { uploadProductImage } from "../../catalog/supabaseProductRepository";
import type { Product, ProductImage, ProductVariant } from "../../types/product";
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

  const [searchParams, setSearchParams] = useSearchParams();
  const isMaintenance = searchParams.get("view") === "maintenance";
  const [maintenanceTab, setMaintenanceTab] = useState<"all" | "missing" | "unpublished" | "archived">("all");
  const [query, setQuery] = useState(searchParams.get("search") ?? "");
  const [brand, setBrand] = useState("All");
  const [category, setCategory] = useState("All");
  const [condition, setCondition] = useState("All");
  const [stock, setStock] = useState(searchParams.get("stock") ?? "All");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 25;

  // Auto-open Add Product drawer if triggered from quick actions (?action=new)
  useEffect(() => {
    if (searchParams.get("action") === "new") {
      startAdd();
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        next.delete("action");
        return next;
      });
    }
  }, [searchParams]);

  useEffect(() => {
    setCurrentPage(1);
  }, [query, brand, category, condition, stock, isMaintenance, maintenanceTab]);

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

  // Authoritative catalogue metrics (storefront vs safely preserved archive)
  const storeCounts = useMemo(() => {
    const published = products.filter(
      (p) => !p.archived && p.available !== false && isProductImageEligible(p)
    );
    const inStock = published.filter(
      (p) => p.stockStatus === "In Stock" && p.stockQuantity > 0
    ).length;
    const lowStock = published.filter(
      (p) => p.stockStatus === "Low Stock" || (p.stockQuantity > 0 && p.stockQuantity <= 3)
    ).length;
    const outOfStock = published.filter(
      (p) => ["Out of Stock", "Sold"].includes(p.stockStatus) || p.stockQuantity <= 0
    ).length;

    let missingImages = 0;
    let manuallyHidden = 0;
    let archived = 0;
    products.forEach((p) => {
      if (p.archived) {
        archived++;
      } else if (p.available === false) {
        manuallyHidden++;
      } else if (!isProductImageEligible(p)) {
        missingImages++;
      }
    });

    return {
      publishedTotal: published.length,
      inStock,
      lowStock,
      outOfStock,
      missingImages,
      manuallyHidden,
      archived,
      maintenanceTotal: missingImages + manuallyHidden + archived,
      total: products.length,
    };
  }, [products]);

  const filtered = useMemo(() => {
    const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
    return products.filter((product) => {
      const isEligible = isProductImageEligible(product);
      const isArchived = Boolean(product.archived);
      const isAvailable = product.available !== false;

      if (!isMaintenance) {
        // Everyday admin view: ONLY products currently published and visible on the public storefront
        const isStorefrontProduct = !isArchived && isAvailable && isEligible;
        if (!isStorefrontProduct) return false;
      } else {
        // Restricted maintenance view: safely stored hidden or inactive records
        const isHiddenOrInactive = isArchived || !isAvailable || !isEligible;
        if (!isHiddenOrInactive) return false;

        if (maintenanceTab === "missing" && (isArchived || !isAvailable || isEligible)) return false;
        if (maintenanceTab === "unpublished" && (isArchived || isAvailable)) return false;
        if (maintenanceTab === "archived" && !isArchived) return false;
      }

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
        ...(product.variants?.flatMap((v) => [v.title, v.sku || "", v.storage || ""]) ?? []),
      ]
        .join(" ")
        .toLowerCase();
      return (
        terms.every((term) => searchable.includes(term)) &&
        (brand === "All" || product.brand === brand) &&
        (category === "All" || product.category === category) &&
        (condition === "All" || product.condition === condition) &&
        (stock === "All" || product.stockStatus === stock)
      );
    });
  }, [brand, category, condition, isMaintenance, maintenanceTab, products, query, stock]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage, pageSize]);

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

    // Strict Publishing Validation: Never publish a product without an approved image
    if (normalized.available && !normalized.archived) {
      if (isUsedProductCondition(normalized.condition)) {
        if (!hasOwnerUploadedProductImages(normalized)) {
          setActionError(
            "Used devices require genuine photographs of the actual unit uploaded to Supabase Storage before they can be published on the storefront. Uncheck 'Published on Storefront' to save as draft."
          );
          return;
        }
      } else {
        if (!isProductImageEligible(normalized)) {
          setActionError(
            "This product requires an approved, clean product image before it can be published on the storefront. Uncheck 'Published on Storefront' to save as draft."
          );
          return;
        }
      }
    }

    setSaving(true);
    setActionError("");
    try {
      const saved = await saveProduct(normalized);
      setEditing(productToForm(saved));
      setMessage(
        normalized.available
          ? `${normalized.name} published successfully to storefront.`
          : `${normalized.name} saved as draft (hidden until published with approved photos).`
      );
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
              {isMaintenance ? "Restricted Maintenance" : "Storefront Products"}
            </span>
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-slate-300" />
            <span className="text-xs font-semibold text-slate-500">
              {getBackendLabel(backendStatus)}
            </span>
          </div>
          <h2>
            {isMaintenance ? "Catalogue Maintenance Archive" : "Product Management"}
          </h2>
          <p>
            {isMaintenance
              ? "Safely stored inactive items, missing-image records, and archived products preserved in Supabase."
              : "Manage active devices, pricing, stock levels, and verified product imagery displayed to customers."}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
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

      {/* Restricted Maintenance Banner (Only visible when deliberately accessing maintenance view) */}
      {isMaintenance && (
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-start gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shrink-0 mt-1" />
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-[#d4af37]">
                Restricted Maintenance Mode
              </div>
              <h3 className="text-sm font-bold text-white mt-0.5">
                {storeCounts.maintenanceTotal} Safely Preserved Inactive / Missing-Image Records
              </h3>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                These {storeCounts.maintenanceTotal} records remain securely stored in Supabase and the catalogue archive. They are hidden from everyday storefront and admin views until approved photographs are uploaded.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setSearchParams((prev) => {
                const next = new URLSearchParams(prev);
                next.delete("view");
                return next;
              });
            }}
            className="admin-btn admin-btn-sm whitespace-nowrap bg-white text-slate-900 hover:bg-slate-100 font-semibold shrink-0"
          >
            ← Exit to Storefront Products
          </button>
        </div>
      )}

      {/* 2. Filter & Search Toolbar */}
      <div className="admin-toolbar">
        <div className="admin-search-input">
          <Search size={16} className="text-slate-400 shrink-0" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={
              isMaintenance
                ? "Search preserved inactive records..."
                : "Search store products by name, model, generation..."
            }
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

        {/* Quick Filter Pill Tabs */}
        {!isMaintenance ? (
          <div className="flex flex-wrap items-center gap-1.5 pt-3 border-t border-slate-100 w-full">
            <button
              type="button"
              onClick={() => setStock("All")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                stock === "All"
                  ? "bg-slate-900 text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              All Store Products ({storeCounts.publishedTotal})
            </button>
            <button
              type="button"
              onClick={() => setStock("In Stock")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                stock === "In Stock"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
              }`}
            >
              In Stock ({storeCounts.inStock})
            </button>
            <button
              type="button"
              onClick={() => setStock("Low Stock")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                stock === "Low Stock"
                  ? "bg-amber-600 text-white shadow-sm"
                  : "bg-amber-50 text-amber-800 hover:bg-amber-100"
              }`}
            >
              Low Stock ({storeCounts.lowStock})
            </button>
            <button
              type="button"
              onClick={() => setStock("Out of Stock")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                stock === "Out of Stock"
                  ? "bg-rose-700 text-white shadow-sm"
                  : "bg-rose-50 text-rose-700 hover:bg-rose-100"
              }`}
            >
              Out of Stock ({storeCounts.outOfStock})
            </button>
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-1.5 pt-3 border-t border-slate-100 w-full">
            <button
              type="button"
              onClick={() => setMaintenanceTab("all")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                maintenanceTab === "all"
                  ? "bg-slate-900 text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              All Inactive ({storeCounts.maintenanceTotal})
            </button>
            <button
              type="button"
              onClick={() => setMaintenanceTab("missing")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition flex items-center gap-1.5 ${
                maintenanceTab === "missing"
                  ? "bg-amber-600 text-white shadow-sm"
                  : "bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200/80"
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${maintenanceTab === "missing" ? "bg-white" : "bg-amber-500"}`} />
              Missing Images ({storeCounts.missingImages})
            </button>
            <button
              type="button"
              onClick={() => setMaintenanceTab("unpublished")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                maintenanceTab === "unpublished"
                  ? "bg-slate-700 text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              Manually Unpublished ({storeCounts.manuallyHidden})
            </button>
            <button
              type="button"
              onClick={() => setMaintenanceTab("archived")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                maintenanceTab === "archived"
                  ? "bg-rose-700 text-white shadow-sm"
                  : "bg-rose-50 text-rose-700 hover:bg-rose-100"
              }`}
            >
              Archived ({storeCounts.archived})
            </button>
          </div>
        )}
      </div>

      {/* 3. Products Data Table */}
      <div className="admin-table-shell hidden md:block">
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
                paginatedProducts.map((product) => {
                  const isEligible = isProductImageEligible(product);
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
                            <div className="w-12 h-12 rounded-lg bg-amber-50 border border-amber-200 grid place-items-center text-[0.62rem] text-amber-800 font-bold shrink-0 text-center leading-tight p-1">
                              {product.condition.includes("Brand New") ? "Studio Asset" : "Photo Needed"}
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
                        {isArchived ? (
                          <span className="admin-badge admin-badge-rose text-[0.7rem]">Archived</span>
                        ) : product.available === false ? (
                          <span className="admin-badge admin-badge-slate text-[0.7rem] flex items-center gap-1 w-fit">
                            Unpublished
                          </span>
                        ) : !isEligible ? (
                          <span className="admin-badge admin-badge-amber text-[0.7rem] font-semibold flex items-center gap-1 w-fit">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                            Missing Image
                          </span>
                        ) : (
                          <span className="admin-badge admin-badge-emerald text-[0.7rem] flex items-center gap-1 w-fit">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            Published
                          </span>
                        )}
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
      {/* Responsive Mobile Product Cards (md:hidden) */}
      <div className="md:hidden flex flex-col gap-3">
        {loading ? (
          <div className="admin-card p-6 text-center text-slate-400 font-medium text-xs">
            Loading product catalog...
          </div>
        ) : filtered.length === 0 ? (
          <div className="admin-card p-6 text-center text-slate-400 font-medium text-xs">
            No products match the selected filters.
          </div>
        ) : (
          paginatedProducts.map((product) => {
            const isEligible = isProductImageEligible(product);
            const image = getPrimaryImage(product);
            const isArchived = Boolean(product.archived);

            return (
              <div
                key={product.id}
                className={`admin-card p-3.5 flex flex-col gap-3 ${isArchived ? "opacity-60" : ""}`}
              >
                <div className="flex items-center gap-3">
                  {image?.src ? (
                    <img
                      src={image.src}
                      alt={image.alt || product.name}
                      className="w-12 h-12 rounded-lg object-contain bg-white border border-slate-200 shrink-0 p-1"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-amber-50 border border-amber-200 grid place-items-center text-[0.62rem] text-amber-800 font-bold shrink-0 text-center leading-tight p-1">
                      {product.condition.includes("Brand New") ? "Studio Asset" : "Photo Needed"}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <span className="font-bold text-slate-900 block truncate text-sm">
                      {product.name}
                    </span>
                    <span className="text-xs text-slate-500 block">
                      {product.brand} &bull; {product.model}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-1.5 text-xs">
                  <span className="admin-badge admin-badge-slate text-[0.68rem]">{product.category}</span>
                  <span
                    className={`admin-badge text-[0.68rem] ${
                      product.condition.includes("Brand New")
                        ? "admin-badge-emerald"
                        : "admin-badge-amber"
                    }`}
                  >
                    {product.condition}
                  </span>
                  <span
                    className={`admin-badge text-[0.68rem] ${
                      product.stockStatus === "In Stock"
                        ? "admin-badge-emerald"
                        : product.stockStatus === "Low Stock"
                        ? "admin-badge-amber"
                        : "admin-badge-rose"
                    }`}
                  >
                    {product.stockStatus} ({product.stockQuantity})
                  </span>
                  {isArchived ? (
                    <span className="admin-badge admin-badge-rose text-[0.68rem]">Archived</span>
                  ) : product.available === false ? (
                    <span className="admin-badge admin-badge-slate text-[0.68rem] flex items-center gap-1">
                      Unpublished
                    </span>
                  ) : !isEligible ? (
                    <span className="admin-badge admin-badge-amber text-[0.68rem] font-semibold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                      Missing Image
                    </span>
                  ) : (
                    <span className="admin-badge admin-badge-emerald text-[0.68rem] flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Published
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <span className="font-extrabold text-slate-900 text-sm">
                    {product.priceOnRequest || product.price <= 0
                      ? "Contact for Price"
                      : formatGhs(product.price)}
                  </span>
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
                          `Are you sure you want to ${isArchived ? "restore" : "archive"} "${product.name}"?`,
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
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 4. Pagination Controls Bar */}
      {filtered.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 rounded-xl bg-white border border-slate-200 shadow-sm">
          <div className="text-xs text-slate-500 font-medium">
            Showing <span className="font-bold text-slate-800">{(currentPage - 1) * pageSize + 1}</span> to{" "}
            <span className="font-bold text-slate-800">{Math.min(currentPage * pageSize, filtered.length)}</span> of{" "}
            <span className="font-bold text-slate-800">{filtered.length}</span> products
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="admin-btn admin-btn-secondary admin-btn-sm disabled:opacity-40 disabled:cursor-not-allowed"
              aria-label="Previous page"
            >
              <ChevronLeft size={15} />
              <span className="hidden sm:inline">Prev</span>
            </button>

            <div className="flex items-center gap-1 px-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                if (
                  page === 1 ||
                  page === totalPages ||
                  (page >= currentPage - 1 && page <= currentPage + 1)
                ) {
                  return (
                    <button
                      key={page}
                      type="button"
                      onClick={() => setCurrentPage(page)}
                      className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${
                        currentPage === page
                          ? "bg-slate-900 text-white shadow-sm"
                          : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      {page}
                    </button>
                  );
                }
                if (page === currentPage - 2 || page === currentPage + 2) {
                  return (
                    <span key={page} className="text-xs text-slate-400 px-0.5">
                      ...
                    </span>
                  );
                }
                return null;
              })}
            </div>

            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="admin-btn admin-btn-secondary admin-btn-sm disabled:opacity-40 disabled:cursor-not-allowed"
              aria-label="Next page"
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      )}

      {/* 5. Restricted Maintenance Access Link (Isolated from everyday operations) */}
      <div className="pt-2 flex items-center justify-between text-xs text-slate-400 px-1">
        {!isMaintenance ? (
          <Link
            to="/admin/products?view=maintenance"
            className="text-slate-400 hover:text-slate-600 transition inline-flex items-center gap-1.5 font-medium"
            title="Restricted Catalogue Maintenance Archive for Hidden/Archived Records"
          >
            <ShieldCheck size={13} />
            <span>Catalogue Maintenance Archive ({storeCounts.maintenanceTotal} safely preserved records)</span>
          </Link>
        ) : (
          <button
            type="button"
            onClick={() => {
              setSearchParams((prev) => {
                const next = new URLSearchParams(prev);
                next.delete("view");
                return next;
              });
            }}
            className="text-amber-600 hover:text-amber-800 transition inline-flex items-center gap-1 font-semibold"
          >
            <span>← Return to Everyday Store Products ({storeCounts.publishedTotal})</span>
          </button>
        )}
        <span className="text-[11px] text-slate-400">
          {isMaintenance ? "Restricted Maintenance Mode" : "Everyday E-Commerce Mode"}
        </span>
      </div>

      {/* 6. Product Editor Drawer Modal */}
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
  const [showMediaLibraryPicker, setShowMediaLibraryPicker] = useState(false);
  const existingProduct = products.find((p) => p.id === form.id);
  const existingVariants = existingProduct?.variants ?? [];

  const handleMediaPickerSelect = (item: MediaItem) => {
    const nextImages = [
      ...form.images,
      { src: item.url, alt: item.alt || item.title || `${form.name || "Product"} image` },
    ];
    update("images", nextImages);
    setShowMediaLibraryPicker(false);
  };

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
            <label className="block font-bold text-slate-700 mb-1">
              Base Price (GH₵) *
              <span className="block text-[11px] font-normal text-slate-500">
                Applies to the base tier &amp; sets the starting storefront card price
              </span>
            </label>
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
            <label className="block font-bold text-slate-700 mb-1">
              Previous / Strikethrough Price (GH₵)
              <span className="block text-[11px] font-normal text-slate-500">
                Leave empty if device is not discounted
              </span>
            </label>
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

          {existingVariants.length > 0 && (
            <div className="md:col-span-2 p-3 rounded-lg bg-amber-50/60 border border-amber-200/80">
              <div className="flex items-center mb-2">
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  <Tag size={13} className="text-amber-600" />
                  <span>Variant Prices &amp; Stock ({existingVariants.length})</span>
                </span>
              </div>
              <div className="space-y-2">
                {existingVariants.map((variant) => (
                  <VariantPricingEditor
                    key={variant.id}
                    variant={variant}
                    onSaved={(fields) => {
                      const variants = existingVariants.map((item) =>
                        item.id === variant.id ? { ...item, ...fields } : item
                      );
                      const active = variants.filter((item) => item.available && item.price > 0);
                      const lowest = active.reduce<ProductVariant | null>(
                        (current, item) => !current || item.price < current.price ? item : current,
                        null
                      );
                      if (lowest) {
                        setForm({
                          ...form,
                          price: String(lowest.price),
                          previousPrice: lowest.previousPrice ? String(lowest.previousPrice) : "",
                        });
                      }
                    }}
                  />
                ))}
              </div>
            </div>
          )}

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

        {/* Upload & Media Library Triggers */}
        <div className="pt-2 flex flex-wrap items-center gap-2">
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
          <button
            type="button"
            onClick={() => setShowMediaLibraryPicker(true)}
            className="admin-btn admin-btn-secondary text-xs inline-flex items-center gap-2"
          >
            <ImageIcon size={15} />
            <span>Choose from Media Library</span>
          </button>
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

      {/* Media Library Picker Modal */}
      {showMediaLibraryPicker && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setShowMediaLibraryPicker(false)}
        >
          <div
            className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl p-6 space-y-4 max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ImageIcon size={18} className="text-[#d4af37]" />
                <h3 className="font-bold text-slate-900 text-sm">Select Product Image from Media Library</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowMediaLibraryPicker(false)}
                className="p-1 text-slate-400 hover:text-slate-900"
              >
                <X size={18} />
              </button>
            </div>
            <AdminMediaLibrary isPicker onSelect={handleMediaPickerSelect} />
          </div>
        </div>
      )}
    </form>
  );
}

function getBackendLabel(status: string) {
  if (status === "supabase") return "Supabase PostgreSQL";
  if (status === "error") return "Supabase Error";
  if (status === "local-catalog") return "Local Dev Catalogue";
  return "Seed Fallback";
}

function VariantPricingEditor({
  variant,
  onSaved,
}: {
  variant: ProductVariant;
  onSaved: (fields: Pick<ProductVariant, "price" | "previousPrice" | "isSale" | "stockStatus" | "stockQuantity" | "available">) => void;
}) {
  const { updateVariantPriceAndStock, backendStatus } = useProductCatalog();
  const [price, setPrice] = useState(String(variant.price));
  const [previousPrice, setPreviousPrice] = useState(variant.previousPrice == null ? "" : String(variant.previousPrice));
  const [quantity, setQuantity] = useState(String(variant.stockQuantity));
  const [stockStatus, setStockStatus] = useState(variant.stockStatus);
  const [available, setAvailable] = useState(variant.available);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    setPrice(String(variant.price));
    setPreviousPrice(variant.previousPrice == null ? "" : String(variant.previousPrice));
    setQuantity(String(variant.stockQuantity));
    setStockStatus(variant.stockStatus);
    setAvailable(variant.available);
  }, [variant]);

  const save = async () => {
    if (import.meta.env.PROD && backendStatus !== "supabase") {
      setMessage("Supabase is required to save production variant changes.");
      return;
    }
    const nextPrice = Number(price);
    const nextPrevious = previousPrice.trim() === "" ? null : Number(previousPrice);
    const nextQuantity = Number(quantity);
    if (!Number.isFinite(nextPrice) || nextPrice < 0 ||
        (nextPrevious !== null && (!Number.isFinite(nextPrevious) || nextPrevious < 0)) ||
        !Number.isInteger(nextQuantity) || nextQuantity < 0) {
      setMessage("Enter valid non-negative prices and a whole-number quantity.");
      return;
    }
    const fields = {
      price: nextPrice,
      previousPrice: nextPrevious,
      isSale: nextPrevious !== null && nextPrevious > nextPrice,
      stockStatus,
      stockQuantity: nextQuantity,
      available,
    };
    setSaving(true);
    setMessage("");
    try {
      await updateVariantPriceAndStock(variant.id, fields);
      onSaved(fields);
      setMessage("Saved");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Variant could not be saved.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded border border-amber-100 bg-white p-3 text-xs">
      <div className="mb-2 font-semibold text-slate-800">{variant.title}</div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
        <label className="font-medium text-slate-600">Price (GH₵)
          <input aria-label={`${variant.title} price`} type="number" min="0" step="0.01" value={price} onChange={(event) => setPrice(event.target.value)} className="mt-1 w-full rounded border border-slate-200 p-2" />
        </label>
        <label className="font-medium text-slate-600">Previous (GH₵)
          <input aria-label={`${variant.title} previous price`} type="number" min="0" step="0.01" value={previousPrice} onChange={(event) => setPreviousPrice(event.target.value)} className="mt-1 w-full rounded border border-slate-200 p-2" />
        </label>
        <label className="font-medium text-slate-600">Quantity
          <input aria-label={`${variant.title} quantity`} type="number" min="0" step="1" value={quantity} onChange={(event) => setQuantity(event.target.value)} className="mt-1 w-full rounded border border-slate-200 p-2" />
        </label>
        <label className="font-medium text-slate-600">Stock status
          <select aria-label={`${variant.title} stock status`} value={stockStatus} onChange={(event) => setStockStatus(event.target.value as Product["stockStatus"])} className="mt-1 w-full rounded border border-slate-200 p-2">
            {stockStatuses.map((status) => <option key={status} value={status}>{status}</option>)}
          </select>
        </label>
        <label className="flex items-center gap-2 font-medium text-slate-600">
          <input type="checkbox" checked={available} onChange={(event) => setAvailable(event.target.checked)} /> Available
        </label>
        <button type="button" onClick={save} disabled={saving} aria-label={`Save ${variant.title} variant`} className="admin-btn admin-btn-secondary self-end justify-center">
          <Save size={14} /> {saving ? "Saving..." : "Save variant"}
        </button>
      </div>
      {message && <p role="status" className="mt-2 text-slate-700">{message}</p>}
    </div>
  );
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
