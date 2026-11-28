import {
  AlertCircle,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Check,
  CheckCircle2,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Monitor,
  Package,
  Plus,
  RefreshCw,
  RotateCcw,
  Save,
  Search,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { createProductSlug } from "../../catalog/productCatalog";
import {
  buildShopFamilyGroups,
  getEffectiveCondition,
  isIphoneUkUsedGeneration,
  isShopDeviceForCategory,
  isUkUsedProduct,
  resolveShopProductGallery,
} from "../../catalog/shopClassification";
import { uploadUkUsedProductImage } from "../../catalog/supabaseProductRepository";
import { defaultShopExperienceConfig } from "../../cms/shopExperienceDefaults";
import type {
  MediaItem,
  ShopCategoryExperienceConfig,
  ShopCategoryKey,
  ShopExperienceConfig,
  ShopWaysToBuyCard,
  UkUsedProductOverride,
} from "../../cms/types";
import type { MainWebsiteSection, Product } from "../../types/product";
import { formatGhs } from "../../utils/format";
import { AppleShopExperience } from "../shop/AppleShopExperience";

export type ShopExperienceAdminSubTab = "uk-used" | "shop-hub" | "preview";

interface AdminShopExperienceEditorProps {
  activeSubTab: ShopExperienceAdminSubTab;
  onSelectSubTab: (tab: ShopExperienceAdminSubTab) => void;
  config: ShopExperienceConfig;
  onChange: React.Dispatch<React.SetStateAction<ShopExperienceConfig>>;
  hasDraft: boolean;
  products: Product[];
  activeProducts: Product[];
  saveProduct: (product: Product) => Promise<Product>;
  onSaveDraft: () => Promise<void>;
  onPublish: () => Promise<void>;
  onDiscardDraft: () => Promise<void>;
  onUploadMedia: (
    file: File,
    category?: MediaItem["category"],
    customTitle?: string
  ) => Promise<MediaItem>;
  onOpenMediaPicker: (onSelect: (item: MediaItem) => void) => void;
}

const SHOP_CATEGORIES: Array<{
  key: ShopCategoryKey;
  label: string;
  productCategory: Product["category"];
  mainSection: MainWebsiteSection;
}> = [
  { key: "mac", label: "Mac", productCategory: "MacBooks", mainSection: "Mac" },
  { key: "ipad", label: "iPad", productCategory: "iPads", mainSection: "iPad" },
  { key: "iphone", label: "iPhone", productCategory: "iPhones", mainSection: "iPhone" },
  { key: "watch", label: "Apple Watch", productCategory: "Apple Watches", mainSection: "Watch" },
];

const UK_USED_CONDITIONS: Array<Product["condition"]> = ["UK Used", "Excellent", "Very Good"];
const STOCK_STATUSES: Array<Product["stockStatus"]> = [
  "In Stock",
  "Low Stock",
  "Out of Stock",
  "Sold",
];

interface UkUsedDraftRow {
  name: string;
  storageText: string;
  colorsText: string;
  condition: Product["condition"];
  price: string;
  stockQuantity: string;
  stockStatus: Product["stockStatus"];
  batteryHealth: string;
  available: boolean;
}

function productToDraftRow(p: Product): UkUsedDraftRow {
  return {
    name: p.name,
    storageText: (p.storage || []).join(", "),
    colorsText: (p.colors || []).join(", "),
    condition: UK_USED_CONDITIONS.includes(p.condition) ? p.condition : "UK Used",
    price: String(p.price ?? 0),
    stockQuantity: String(p.stockQuantity ?? 0),
    stockStatus: p.stockStatus || "In Stock",
    batteryHealth: p.batteryHealth || "",
    available: p.available !== false,
  };
}

function splitCommaList(value: string): string[] {
  return value
    .split(/[\n,]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export function AdminShopExperienceEditor({
  activeSubTab,
  onSelectSubTab,
  config,
  onChange,
  hasDraft,
  products,
  activeProducts,
  saveProduct,
  onSaveDraft,
  onPublish,
  onDiscardDraft,
  onUploadMedia,
  onOpenMediaPicker,
}: AdminShopExperienceEditorProps) {
  const [selectedCategory, setSelectedCategory] = useState<ShopCategoryKey>("iphone");
  const [searchTerm, setSearchTerm] = useState("");
  const [previewViewport, setPreviewViewport] = useState<"desktop" | "mobile">("desktop");
  const [savingCms, setSavingCms] = useState<"draft" | "publish" | "discard" | null>(null);
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);
  const [savingProductId, setSavingProductId] = useState<string | null>(null);
  const [syncingIphones, setSyncingIphones] = useState(false);

  // Per-product local edit buffers for UK Used inventory cards
  const [rowEdits, setRowEdits] = useState<Record<string, UkUsedDraftRow>>({});

  // Add New UK Used Device panel state
  const [showAddForm, setShowAddForm] = useState(false);
  const [creatingDevice, setCreatingDevice] = useState(false);
  const [newDevice, setNewDevice] = useState({
    category: "iphone" as ShopCategoryKey,
    name: "",
    storageText: "128GB, 256GB",
    colorsText: "Black, Silver",
    condition: "UK Used" as Product["condition"],
    price: "",
    stockQuantity: "1",
    batteryHealth: "90%+",
    gradeNote: "Clean UK Used unit — inspected at Dome Pillar 2",
    available: true,
    photoFile: null as File | null,
    photoPreviewUrl: "",
  });

  const catConfig: ShopCategoryExperienceConfig =
    config.categories?.[selectedCategory] ||
    defaultShopExperienceConfig.categories[selectedCategory];

  const ukUsedOverrides = config.ukUsedOverrides || {};

  // All non-archived products in this category that belong to UK Used
  const categoryUkUsedProducts = useMemo(() => {
    const matched = products.filter(
      (p) => !p.archived && isShopDeviceForCategory(p, selectedCategory) && isUkUsedProduct(p)
    );
    return matched.sort((a, b) => {
      const ovA = ukUsedOverrides[a.id] || ukUsedOverrides[a.slug];
      const ovB = ukUsedOverrides[b.id] || ukUsedOverrides[b.slug];
      const ordA = typeof ovA?.displayOrder === "number" ? ovA.displayOrder : 9999;
      const ordB = typeof ovB?.displayOrder === "number" ? ovB.displayOrder : 9999;
      if (ordA !== ordB) return ordA - ordB;
      return a.name.localeCompare(b.name);
    });
  }, [products, selectedCategory, ukUsedOverrides]);

  const filteredUkUsed = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return categoryUkUsedProducts;
    return categoryUkUsedProducts.filter((p) =>
      [p.name, p.slug, p.condition, ...(p.storage || []), ...(p.colors || [])]
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [categoryUkUsedProducts, searchTerm]);

  // Detect iPhone 15 Pro & older models whose raw DB condition isn't yet UK Used
  const iphonesNeedingDbSync = useMemo(
    () =>
      products.filter(
        (p) =>
          !p.archived &&
          isIphoneUkUsedGeneration(p) &&
          !["UK Used", "Excellent", "Very Good"].includes(p.condition)
      ),
    [products]
  );

  // Real families for the selected category (for reordering/hiding)
  const categoryFamilies = useMemo(() => {
    const configWithAllShown: ShopExperienceConfig = {
      ...config,
      categories: {
        ...config.categories,
        [selectedCategory]: {
          ...catConfig,
          hiddenFamilyIds: [],
        },
      },
    };
    return buildShopFamilyGroups(activeProducts, selectedCategory, configWithAllShown);
  }, [activeProducts, selectedCategory, config, catConfig]);

  // Real active accessories pool for curating category accessories
  const allAccessories = useMemo(
    () =>
      activeProducts
        .filter((p) => !p.archived && (p.category === "Accessories" || p.category === "AirPods" || p.slug.includes("keyboard") || p.slug.includes("pencil")))
        .sort((a, b) => a.name.localeCompare(b.name)),
    [activeProducts]
  );

  const ukUsedCountByCategory = useMemo(() => {
    const counts: Record<ShopCategoryKey, number> = { mac: 0, ipad: 0, iphone: 0, watch: 0 };
    for (const key of ["mac", "ipad", "iphone", "watch"] as ShopCategoryKey[]) {
      counts[key] = products.filter(
        (p) => !p.archived && isShopDeviceForCategory(p, key) && isUkUsedProduct(p)
      ).length;
    }
    return counts;
  }, [products]);

  const updateCatConfig = (partial: Partial<ShopCategoryExperienceConfig>) => {
    onChange((prev) => ({
      ...prev,
      categories: {
        ...prev.categories,
        [selectedCategory]: {
          ...(prev.categories?.[selectedCategory] ||
            defaultShopExperienceConfig.categories[selectedCategory]),
          ...partial,
        },
      },
    }));
  };

  const getOverrideFor = (product: Product): UkUsedProductOverride => {
    return (
      ukUsedOverrides[product.id] ||
      ukUsedOverrides[product.slug] || {
        productIdOrSlug: product.slug,
        customImages: [],
        visible: true,
      }
    );
  };

  const setOverrideFor = (
    product: Product,
    updater: (prev: UkUsedProductOverride) => UkUsedProductOverride
  ) => {
    onChange((prev) => {
      const existingKey = prev.ukUsedOverrides?.[product.id]
        ? product.id
        : prev.ukUsedOverrides?.[product.slug]
        ? product.slug
        : product.slug;
      const current = prev.ukUsedOverrides?.[existingKey] || {
        productIdOrSlug: existingKey,
        customImages: [],
        visible: true,
      };
      const updated: UkUsedProductOverride = {
        ...updater(current),
        productIdOrSlug: existingKey,
        updatedAt: new Date().toISOString(),
      };
      return {
        ...prev,
        ukUsedOverrides: {
          ...(prev.ukUsedOverrides || {}),
          [existingKey]: updated,
        },
      };
    });
  };

  const getRowBuffer = (product: Product): UkUsedDraftRow =>
    rowEdits[product.id] || productToDraftRow(product);

  const patchRowBuffer = (product: Product, patch: Partial<UkUsedDraftRow>) => {
    setRowEdits((prev) => ({
      ...prev,
      [product.id]: {
        ...(prev[product.id] || productToDraftRow(product)),
        ...patch,
      },
    }));
  };

  // Independent UK Used image upload (NEVER overwrites Brand New image paths!)
  const handleUkUsedPhotoUpload = async (
    product: Product,
    file: File,
    replacePrimary = false
  ) => {
    setUploadingKey(`${product.id}-${replacePrimary ? "replace" : "add"}`);
    setErrorMessage("");
    setStatusMessage("");
    try {
      const uploaded = await uploadUkUsedProductImage(file, product.slug || product.id);
      setOverrideFor(product, (prev) => {
        const list = [...(prev.customImages || [])];
        const newEntry = { src: uploaded.src, alt: `${product.name} — UK Used real photo` };
        if (replacePrimary && list.length > 0) {
          list[0] = newEntry;
        } else {
          list.push(newEntry);
        }
        return { ...prev, customImages: list };
      });
      setStatusMessage(
        `Uploaded independent UK Used photo for ${product.name}. Brand New photos were untouched. Click "Publish Shop & UK Used" to push live.`
      );
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "UK Used image upload failed.");
    } finally {
      setUploadingKey(null);
    }
  };

  const handleMoveUkUsedImage = (product: Product, index: number, delta: -1 | 1) => {
    setOverrideFor(product, (prev) => {
      const list = [...(prev.customImages || [])];
      const target = index + delta;
      if (target < 0 || target >= list.length) return prev;
      const [moved] = list.splice(index, 1);
      list.splice(target, 0, moved);
      return { ...prev, customImages: list };
    });
  };

  const handleRemoveUkUsedImage = (product: Product, index: number) => {
    setOverrideFor(product, (prev) => {
      const list = [...(prev.customImages || [])];
      list.splice(index, 1);
      return { ...prev, customImages: list };
    });
  };

  const handleSaveUkUsedProduct = async (product: Product) => {
    const draft = getRowBuffer(product);
    setSavingProductId(product.id);
    setErrorMessage("");
    setStatusMessage("");
    try {
      const parsedPrice = Math.max(0, Number(draft.price) || 0);
      const parsedStock = Math.max(0, Math.floor(Number(draft.stockQuantity) || 0));
      const nextStorages = splitCommaList(draft.storageText);
      const nextColors = splitCommaList(draft.colorsText);
      const updatedProduct: Product = {
        ...product,
        name: draft.name.trim() || product.name,
        condition: draft.condition,
        price: parsedPrice,
        stockQuantity: parsedStock,
        stockStatus:
          parsedStock <= 0 && draft.stockStatus === "In Stock"
            ? "Out of Stock"
            : draft.stockStatus,
        storage: nextStorages.length > 0 ? nextStorages : product.storage,
        colors: nextColors.length > 0 ? nextColors : product.colors,
        batteryHealth: draft.batteryHealth.trim() || undefined,
        available: draft.available,
      };
      await saveProduct(updatedProduct);
      setRowEdits((prev) => {
        const next = { ...prev };
        delete next[product.id];
        return next;
      });
      setStatusMessage(
        `Saved ${updatedProduct.name} (${formatGhs(updatedProduct.price)}, stock ${updatedProduct.stockQuantity}) directly to Supabase.`
      );
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : "Failed to save UK Used product changes."
      );
    } finally {
      setSavingProductId(null);
    }
  };

  const handleSyncIphonesToUkUsed = async () => {
    if (iphonesNeedingDbSync.length === 0) return;
    setSyncingIphones(true);
    setErrorMessage("");
    setStatusMessage("");
    try {
      for (const phone of iphonesNeedingDbSync) {
        await saveProduct({
          ...phone,
          condition: "UK Used",
        });
      }
      setStatusMessage(
        `Synced ${iphonesNeedingDbSync.length} iPhone 15 Pro & older models to condition "UK Used" in Supabase while preserving all IDs, slugs, pricing, stock, variants, and photos.`
      );
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : "Failed to sync iPhone UK Used records."
      );
    } finally {
      setSyncingIphones(false);
    }
  };

  const handleCreateUkUsedDevice = async () => {
    const trimmedName = newDevice.name.trim();
    if (!trimmedName) {
      setErrorMessage("Enter a model name for the new UK Used device.");
      return;
    }
    const parsedPrice = Math.max(0, Number(newDevice.price) || 0);
    const parsedStock = Math.max(0, Math.floor(Number(newDevice.stockQuantity) || 0));
    const catMeta =
      SHOP_CATEGORIES.find((c) => c.key === newDevice.category) || SHOP_CATEGORIES[2];
    const slug = createProductSlug(`${trimmedName}-uk-used`, products);
    const storages = splitCommaList(newDevice.storageText);
    const colors = splitCommaList(newDevice.colorsText);

    setCreatingDevice(true);
    setErrorMessage("");
    setStatusMessage("");
    try {
      let uploadedPhoto: { src: string; alt: string } | null = null;
      if (newDevice.photoFile) {
        const res = await uploadUkUsedProductImage(newDevice.photoFile, slug);
        uploadedPhoto = { src: res.src, alt: `${trimmedName} — UK Used real photo` };
      }

      const specList = [
        `Condition: ${newDevice.condition}`,
        ...(newDevice.batteryHealth.trim()
          ? [`Battery Health: ${newDevice.batteryHealth.trim()}`]
          : []),
      ];
      const boxList = [trimmedName, "Charging Cable"];

      const payload: Product = {
        id: slug,
        slug,
        name: trimmedName,
        brand: "Apple",
        model: trimmedName,
        category: catMeta.productCategory,
        mainWebsiteSection: catMeta.mainSection,
        condition: newDevice.condition,
        price: parsedPrice,
        priceOnRequest: parsedPrice <= 0,
        stockQuantity: parsedStock,
        stockStatus: parsedStock > 0 ? "In Stock" : "Out of Stock",
        storage: storages.length > 0 ? storages : ["128GB"],
        colors: colors.length > 0 ? colors : ["Space Gray"],
        defaultColor: colors[0] || "Space Gray",
        imageTone: "midnight",
        batteryHealth: newDevice.batteryHealth.trim() || undefined,
        warranty: "Buy & Sell GH Dome Pillar 2 Verification Guarantee",
        shortDescription:
          newDevice.gradeNote.trim() ||
          `Verified ${newDevice.condition} ${trimmedName} inspected in Accra.`,
        description:
          newDevice.gradeNote.trim() ||
          `Genuine Apple ${trimmedName} (${newDevice.condition}) physically tested at Buy & Sell GH Dome Pillar 2 showroom.`,
        specs: specList,
        specifications: specList,
        box: boxList,
        includedItems: boxList,
        deliveryInfo: "Free pickup at Dome Pillar 2 or doorstep delivery across Ghana.",
        images: uploadedPhoto ? [{ src: uploadedPhoto.src, alt: uploadedPhoto.alt }] : [],
        primaryImageIndex: 0,
        available: newDevice.available,
        archived: false,
      };

      const created = await saveProduct(payload);

      if (uploadedPhoto || newDevice.gradeNote.trim()) {
        onChange((prev) => ({
          ...prev,
          ukUsedOverrides: {
            ...(prev.ukUsedOverrides || {}),
            [created.slug]: {
              productIdOrSlug: created.slug,
              customImages: uploadedPhoto ? [uploadedPhoto] : [],
              visible: true,
              gradeNote: newDevice.gradeNote.trim() || undefined,
              batteryHealthNote: newDevice.batteryHealth.trim() || undefined,
              updatedAt: new Date().toISOString(),
            },
          },
        }));
      }

      setSelectedCategory(newDevice.category);
      setShowAddForm(false);
      setNewDevice({
        category: newDevice.category,
        name: "",
        storageText: "128GB, 256GB",
        colorsText: "Black, Silver",
        condition: "UK Used",
        price: "",
        stockQuantity: "1",
        batteryHealth: "90%+",
        gradeNote: "Clean UK Used unit — inspected at Dome Pillar 2",
        available: true,
        photoFile: null,
        photoPreviewUrl: "",
      });
      setStatusMessage(
        `Created UK Used listing "${created.name}" in Supabase${
          uploadedPhoto ? ' with independent UK Used photo. Click "Publish Shop & UK Used" to publish photo overrides.' : "."
        }`
      );
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Failed to create UK Used device.");
    } finally {
      setCreatingDevice(false);
    }
  };

  const handleCmsAction = async (mode: "draft" | "publish" | "discard") => {
    setSavingCms(mode);
    setErrorMessage("");
    setStatusMessage("");
    try {
      if (mode === "draft") {
        await onSaveDraft();
        setStatusMessage("Shop & UK Used CMS draft saved.");
      } else if (mode === "publish") {
        await onPublish();
        setStatusMessage(
          "Published Shop Experience & independent UK Used photo overrides live to all 4 Shop hubs!"
        );
      } else {
        await onDiscardDraft();
        setStatusMessage("Discarded unpublished draft changes.");
      }
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Failed to update Shop CMS.");
    } finally {
      setSavingCms(null);
    }
  };

  const moveFamily = (familyId: string, delta: -1 | 1) => {
    const currentOrder =
      catConfig.familyOrder && catConfig.familyOrder.length > 0
        ? [...catConfig.familyOrder]
        : categoryFamilies.map((f) => f.id);
    // Ensure any newly discovered family IDs are present
    for (const fam of categoryFamilies) {
      if (!currentOrder.includes(fam.id)) currentOrder.push(fam.id);
    }
    const idx = currentOrder.indexOf(familyId);
    if (idx < 0) return;
    const nextIdx = idx + delta;
    if (nextIdx < 0 || nextIdx >= currentOrder.length) return;
    const [item] = currentOrder.splice(idx, 1);
    currentOrder.splice(nextIdx, 0, item);
    updateCatConfig({ familyOrder: currentOrder });
  };

  const toggleFamilyHidden = (familyId: string) => {
    const hidden = new Set(catConfig.hiddenFamilyIds || []);
    if (hidden.has(familyId)) hidden.delete(familyId);
    else hidden.add(familyId);
    updateCatConfig({ hiddenFamilyIds: Array.from(hidden) });
  };

  const toggleAccessorySlug = (slug: string) => {
    const current = new Set(catConfig.curatedAccessorySlugs || []);
    if (current.has(slug)) current.delete(slug);
    else current.add(slug);
    updateCatConfig({ curatedAccessorySlugs: Array.from(current) });
  };

  const updateWaysCard = (idx: number, patch: Partial<ShopWaysToBuyCard>) => {
    const nextCards = [...(catConfig.waysToBuyCards || [])];
    nextCards[idx] = { ...nextCards[idx], ...patch };
    updateCatConfig({ waysToBuyCards: nextCards });
  };

  return (
    <div className="space-y-5" data-testid="shop-experience-admin-editor">
      {/* Top Action & Publishing Bar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full text-[0.65rem] font-extrabold uppercase tracking-wider bg-[#d8a72d]/20 text-amber-900">
              Shop Experience &amp; UK Used CMS
            </span>
            {hasDraft && (
              <span className="px-2 py-0.5 rounded-full text-[0.65rem] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                Unpublished Draft
              </span>
            )}
          </div>
          <h3 className="text-base font-bold text-slate-900 mt-1">
            Manage Shop Mac, iPad, iPhone, Apple Watch &amp; Independent UK Used Inventory
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Upload real UK Used photographs separately from Brand New images, manage UK Used stock &amp; pricing, and control Shop sections (Brand New → UK Used → Accessories).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {hasDraft && (
            <button
              type="button"
              disabled={savingCms !== null}
              onClick={() => void handleCmsAction("discard")}
              className="px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5"
            >
              <RotateCcw size={14} />
              <span>Discard Draft</span>
            </button>
          )}
          <button
            type="button"
            disabled={savingCms !== null}
            onClick={() => void handleCmsAction("draft")}
            className="px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center gap-1.5"
          >
            <Save size={14} />
            <span>{savingCms === "draft" ? "Saving..." : "Save Draft"}</span>
          </button>
          <button
            type="button"
            data-testid="publish-shop-experience-btn"
            disabled={savingCms !== null}
            onClick={() => void handleCmsAction("publish")}
            className="px-4 py-2 rounded-xl bg-[#d8a72d] hover:bg-[#c5961f] text-black text-xs font-extrabold flex items-center gap-1.5 shadow-sm"
          >
            <Sparkles size={14} />
            <span>{savingCms === "publish" ? "Publishing..." : "Publish Shop & UK Used"}</span>
          </button>
        </div>
      </div>

      {/* Feedback Alerts */}
      {statusMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="shrink-0" />
            <span>{statusMessage}</span>
          </div>
          <button type="button" onClick={() => setStatusMessage("")} className="text-emerald-700">
            <X size={14} />
          </button>
        </div>
      )}
      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button type="button" onClick={() => setErrorMessage("")} className="text-rose-700">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Category Switcher + Mode Sub-Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white rounded-2xl border border-slate-200 p-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {SHOP_CATEGORIES.map((cat) => {
            const active = selectedCategory === cat.key;
            return (
              <button
                key={cat.key}
                type="button"
                data-testid={`shop-cms-cat-${cat.key}`}
                onClick={() => setSelectedCategory(cat.key)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition ${
                  active
                    ? "bg-slate-900 text-white shadow-sm"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                <span>Shop {cat.label}</span>
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[0.65rem] ${
                    active ? "bg-[#d8a72d] text-black font-extrabold" : "bg-slate-200 text-slate-700"
                  }`}
                >
                  {ukUsedCountByCategory[cat.key]} UK Used
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {(
            [
              { key: "uk-used", label: "UK Used Inventory & Photos" },
              { key: "shop-hub", label: "Shop Hub, Families & Accessories" },
              { key: "preview", label: "Live Preview" },
            ] as Array<{ key: ShopExperienceAdminSubTab; label: string }>
          ).map((tab) => (
            <button
              key={tab.key}
              type="button"
              data-testid={`shop-cms-subtab-${tab.key}`}
              onClick={() => onSelectSubTab(tab.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                activeSubTab === tab.key
                  ? "bg-[#d8a72d]/20 text-amber-950 ring-1 ring-[#d8a72d]"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ===================== SUB-TAB 1: UK USED INVENTORY & INDEPENDENT PHOTOS ===================== */}
      {activeSubTab === "uk-used" && (
        <div className="space-y-4">
          {/* iPhone 15 Pro & Older DB Condition Sync Helper */}
          {iphonesNeedingDbSync.length > 0 && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-amber-950 font-bold text-xs">
                  <ShieldCheck size={16} className="text-amber-700" />
                  <span>
                    {iphonesNeedingDbSync.length} iPhone 15 Pro &amp; older models automatically routed to UK Used
                  </span>
                </div>
                <p className="text-[0.75rem] text-amber-900">
                  The storefront strictly places all iPhone 15 Pro models and older under UK Used (never Brand New). Click sync to also update their stored Supabase condition column from &quot;Brand New&quot; to &quot;UK Used&quot; while keeping every ID, slug, price, stock, variant, and photo intact.
                </p>
              </div>
              <button
                type="button"
                disabled={syncingIphones}
                onClick={() => void handleSyncIphonesToUkUsed()}
                className="shrink-0 px-3.5 py-2 rounded-xl bg-amber-900 hover:bg-amber-950 text-white text-xs font-bold flex items-center gap-1.5"
              >
                <RefreshCw size={13} className={syncingIphones ? "animate-spin" : ""} />
                <span>
                  {syncingIphones
                    ? "Syncing DB..."
                    : `Sync ${iphonesNeedingDbSync.length} iPhones → UK Used`}
                </span>
              </button>
            </div>
          )}

          {/* Toolbar: Search + Add New UK Used Device */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h4 className="text-sm font-bold text-slate-900">
                UK Used {SHOP_CATEGORIES.find((c) => c.key === selectedCategory)?.label} Inventory ({filteredUkUsed.length})
              </h4>
              <p className="text-xs text-slate-500">
                UK Used photographs upload to an isolated <code>product-images/uk-used/</code> path and override ONLY the UK Used display — Brand New product images are never touched.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Filter UK Used models..."
                  className="pl-8 pr-3 py-2 rounded-xl border border-slate-200 text-xs bg-white w-52"
                />
              </div>

              <button
                type="button"
                data-testid="add-uk-used-device-btn"
                onClick={() => {
                  setNewDevice((prev) => ({ ...prev, category: selectedCategory }));
                  setShowAddForm((v) => !v);
                }}
                className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 shrink-0"
              >
                <Plus size={14} />
                <span>{showAddForm ? "Close Form" : "Add UK Used Device"}</span>
              </button>
            </div>
          </div>

          {/* Add New UK Used Device Form */}
          {showAddForm && (
            <div className="rounded-2xl border-2 border-[#d8a72d]/50 bg-amber-50/30 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h5 className="text-sm font-bold text-slate-900">Add New UK Used Device</h5>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="text-slate-500 hover:text-slate-800"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={newDevice.category}
                    onChange={(e) =>
                      setNewDevice((prev) => ({
                        ...prev,
                        category: e.target.value as ShopCategoryKey,
                      }))
                    }
                    className="w-full p-2 rounded-lg border border-slate-200 bg-white"
                  >
                    {SHOP_CATEGORIES.map((c) => (
                      <option key={c.key} value={c.key}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">Model Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. iPhone 15 Pro Max or MacBook Pro 14-inch M2 Pro"
                    value={newDevice.name}
                    onChange={(e) => setNewDevice((prev) => ({ ...prev, name: e.target.value }))}
                    className="w-full p-2 rounded-lg border border-slate-200 bg-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Condition Grade</label>
                  <select
                    value={newDevice.condition}
                    onChange={(e) =>
                      setNewDevice((prev) => ({
                        ...prev,
                        condition: e.target.value as Product["condition"],
                      }))
                    }
                    className="w-full p-2 rounded-lg border border-slate-200 bg-white"
                  >
                    {UK_USED_CONDITIONS.map((cond) => (
                      <option key={cond} value={cond}>
                        {cond}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Storage Options</label>
                  <input
                    type="text"
                    placeholder="128GB, 256GB, 512GB"
                    value={newDevice.storageText}
                    onChange={(e) =>
                      setNewDevice((prev) => ({ ...prev, storageText: e.target.value }))
                    }
                    className="w-full p-2 rounded-lg border border-slate-200 bg-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Colour Options</label>
                  <input
                    type="text"
                    placeholder="Natural Titanium, Black"
                    value={newDevice.colorsText}
                    onChange={(e) =>
                      setNewDevice((prev) => ({ ...prev, colorsText: e.target.value }))
                    }
                    className="w-full p-2 rounded-lg border border-slate-200 bg-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">GH₵ Price</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 9500"
                    value={newDevice.price}
                    onChange={(e) => setNewDevice((prev) => ({ ...prev, price: e.target.value }))}
                    className="w-full p-2 rounded-lg border border-slate-200 bg-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Stock Quantity</label>
                  <input
                    type="number"
                    min="0"
                    value={newDevice.stockQuantity}
                    onChange={(e) =>
                      setNewDevice((prev) => ({ ...prev, stockQuantity: e.target.value }))
                    }
                    className="w-full p-2 rounded-lg border border-slate-200 bg-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Battery Health</label>
                  <input
                    type="text"
                    placeholder="e.g. 92%+"
                    value={newDevice.batteryHealth}
                    onChange={(e) =>
                      setNewDevice((prev) => ({ ...prev, batteryHealth: e.target.value }))
                    }
                    className="w-full p-2 rounded-lg border border-slate-200 bg-white"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">Inspection / Grade Note</label>
                  <input
                    type="text"
                    value={newDevice.gradeNote}
                    onChange={(e) =>
                      setNewDevice((prev) => ({ ...prev, gradeNote: e.target.value }))
                    }
                    className="w-full p-2 rounded-lg border border-slate-200 bg-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Independent UK Used Photo
                  </label>
                  <label className="w-full py-2 px-3 rounded-lg border border-dashed border-amber-400 bg-white hover:bg-amber-50 text-amber-950 font-bold flex items-center justify-center gap-1.5 cursor-pointer">
                    <Upload size={13} />
                    <span>{newDevice.photoFile ? newDevice.photoFile.name.slice(0, 18) : "Choose Real Photo"}</span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/avif"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null;
                        setNewDevice((prev) => ({
                          ...prev,
                          photoFile: file,
                          photoPreviewUrl: file ? URL.createObjectURL(file) : "",
                        }));
                      }}
                    />
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-amber-200/60">
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newDevice.available}
                    onChange={(e) =>
                      setNewDevice((prev) => ({ ...prev, available: e.target.checked }))
                    }
                  />
                  <span>Publish immediately on Shop UK Used</span>
                </label>

                <button
                  type="button"
                  disabled={creatingDevice}
                  onClick={() => void handleCreateUkUsedDevice()}
                  className="px-4 py-2 rounded-xl bg-[#d8a72d] hover:bg-[#c5961f] text-black text-xs font-extrabold flex items-center gap-1.5"
                >
                  <Plus size={14} />
                  <span>{creatingDevice ? "Creating..." : "Create UK Used Listing"}</span>
                </button>
              </div>
            </div>
          )}

          {/* UK Used Inventory Cards */}
          {filteredUkUsed.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-xs text-slate-500">
              No UK Used {SHOP_CATEGORIES.find((c) => c.key === selectedCategory)?.label} items matched your filter. Use &quot;Add UK Used Device&quot; above to add genuine pre-owned stock.
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              {filteredUkUsed.map((product) => {
                const override = getOverrideFor(product);
                const customImages = override.customImages || [];
                const effectiveGallery = resolveShopProductGallery(product, config);
                const buffer = getRowBuffer(product);
                const isDirty = Boolean(rowEdits[product.id]);
                const isVisibleInUkUsed = override.visible !== false;

                return (
                  <div
                    key={product.id}
                    data-testid={`uk-used-admin-card-${product.slug}`}
                    className={`rounded-2xl border bg-white p-4 shadow-sm space-y-4 ${
                      !buffer.available || !isVisibleInUkUsed
                        ? "border-slate-200 opacity-80"
                        : "border-slate-200"
                    }`}
                  >
                    {/* Card Header */}
                    <div className="flex items-start justify-between gap-2 pb-2 border-b border-slate-100">
                      <div>
                        <div className="flex flex-wrap items-center gap-1.5 mb-1">
                          <span className="px-2 py-0.5 rounded-full text-[0.65rem] font-extrabold bg-amber-100 text-amber-900">
                            UK Used · {getEffectiveCondition(product)}
                          </span>
                          {customImages.length > 0 ? (
                            <span className="px-2 py-0.5 rounded-full text-[0.65rem] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              {customImages.length} Independent UK Used Photo{customImages.length === 1 ? "" : "s"}
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[0.65rem] font-medium bg-slate-100 text-slate-600">
                              Catalog Photo (Protected)
                            </span>
                          )}
                          {!buffer.available && (
                            <span className="px-2 py-0.5 rounded-full text-[0.65rem] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                              Unpublished
                            </span>
                          )}
                        </div>
                        <h5 className="text-sm font-bold text-slate-900">{product.name}</h5>
                        <span className="text-[0.68rem] font-mono text-slate-400">
                          slug: {product.slug}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          title={isVisibleInUkUsed ? "Hide from Shop UK Used section" : "Show in Shop UK Used section"}
                          onClick={() =>
                            setOverrideFor(product, (prev) => ({
                              ...prev,
                              visible: prev.visible === false ? true : false,
                            }))
                          }
                          className={`px-2.5 py-1.5 rounded-lg text-[0.7rem] font-bold flex items-center gap-1 ${
                            isVisibleInUkUsed
                              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                              : "bg-slate-100 text-slate-600 border border-slate-200"
                          }`}
                        >
                          {isVisibleInUkUsed ? <Eye size={12} /> : <EyeOff size={12} />}
                          <span>{isVisibleInUkUsed ? "Visible" : "Hidden"}</span>
                        </button>
                      </div>
                    </div>

                    {/* Independent UK Used Photo Gallery Stage */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 overflow-x-auto pb-1">
                        {effectiveGallery.map((img, idx) => {
                          const isCustomImg = customImages.length > 0;
                          return (
                            <div
                              key={`${img.src}-${idx}`}
                              className="relative w-20 h-20 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center p-1 shrink-0 group"
                            >
                              <img
                                src={img.src}
                                alt={img.alt || product.name}
                                className="max-w-full max-h-full object-contain"
                              />
                              {idx === 0 && (
                                <span className="absolute top-1 left-1 px-1 rounded bg-slate-900/80 text-white text-[0.55rem] font-bold">
                                  Main
                                </span>
                              )}
                              {isCustomImg && (
                                <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-slate-900/75 px-1 py-0.5 rounded-b-xl opacity-0 group-hover:opacity-100 transition">
                                  <button
                                    type="button"
                                    disabled={idx === 0}
                                    onClick={() => handleMoveUkUsedImage(product, idx, -1)}
                                    className="text-white disabled:opacity-30"
                                    title="Move left"
                                  >
                                    <ArrowLeft size={10} />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveUkUsedImage(product, idx)}
                                    className="text-rose-300 hover:text-rose-200"
                                    title="Remove UK Used photo"
                                  >
                                    <Trash2 size={10} />
                                  </button>
                                  <button
                                    type="button"
                                    disabled={idx === customImages.length - 1}
                                    onClick={() => handleMoveUkUsedImage(product, idx, 1)}
                                    className="text-white disabled:opacity-30"
                                    title="Move right"
                                  >
                                    <ArrowRight size={10} />
                                  </button>
                                </div>
                              )}
                            </div>
                          );
                        })}
                        {effectiveGallery.length === 0 && (
                          <div className="w-20 h-20 rounded-xl border border-dashed border-slate-300 bg-slate-50 flex items-center justify-center text-[0.65rem] text-slate-400">
                            No Photo
                          </div>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-1.5">
                        <label className="px-2.5 py-1.5 rounded-lg bg-[#d8a72d]/20 hover:bg-[#d8a72d]/30 text-amber-950 font-bold text-[0.7rem] flex items-center gap-1 cursor-pointer">
                          <Upload size={12} />
                          <span>
                            {uploadingKey === `${product.id}-add`
                              ? "Uploading..."
                              : "Upload UK Used Photo"}
                          </span>
                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp,image/avif"
                            disabled={uploadingKey !== null}
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) void handleUkUsedPhotoUpload(product, file, false);
                              e.target.value = "";
                            }}
                          />
                        </label>

                        {customImages.length > 0 && (
                          <label className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-[0.7rem] flex items-center gap-1 cursor-pointer">
                            <RefreshCw size={12} />
                            <span>
                              {uploadingKey === `${product.id}-replace`
                                ? "Replacing..."
                                : "Replace Primary"}
                            </span>
                            <input
                              type="file"
                              accept="image/jpeg,image/png,image/webp,image/avif"
                              disabled={uploadingKey !== null}
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) void handleUkUsedPhotoUpload(product, file, true);
                                e.target.value = "";
                              }}
                            />
                          </label>
                        )}

                        <button
                          type="button"
                          onClick={() =>
                            onOpenMediaPicker((item) => {
                              setOverrideFor(product, (prev) => ({
                                ...prev,
                                customImages: [
                                  ...(prev.customImages || []),
                                  { src: item.url, alt: item.alt || `${product.name} — UK Used` },
                                ],
                              }));
                              setStatusMessage(
                                `Assigned "${item.title}" as an independent UK Used photo for ${product.name}.`
                              );
                            })
                          }
                          className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[0.7rem] flex items-center gap-1"
                        >
                          <ImageIcon size={12} />
                          <span>Media Library</span>
                        </button>

                        {customImages.length > 0 && (
                          <button
                            type="button"
                            onClick={() =>
                              setOverrideFor(product, (prev) => ({ ...prev, customImages: [] }))
                            }
                            className="px-2 py-1.5 rounded-lg text-rose-600 hover:bg-rose-50 font-semibold text-[0.68rem] flex items-center gap-1"
                          >
                            <RotateCcw size={11} />
                            <span>Reset to Default</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Editable Product Fields (Live Supabase Inventory) */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs pt-2 border-t border-slate-100">
                      <div className="col-span-2">
                        <label className="block text-[0.68rem] font-bold text-slate-500 mb-0.5">
                          Model Name
                        </label>
                        <input
                          type="text"
                          value={buffer.name}
                          onChange={(e) => patchRowBuffer(product, { name: e.target.value })}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white font-semibold"
                        />
                      </div>

                      <div>
                        <label className="block text-[0.68rem] font-bold text-slate-500 mb-0.5">
                          Condition
                        </label>
                        <select
                          value={buffer.condition}
                          onChange={(e) =>
                            patchRowBuffer(product, {
                              condition: e.target.value as Product["condition"],
                            })
                          }
                          className="w-full px-2 py-1.5 rounded-lg border border-slate-200 bg-white"
                        >
                          {UK_USED_CONDITIONS.map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[0.68rem] font-bold text-slate-500 mb-0.5">
                          GH₵ Price
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={buffer.price}
                          onChange={(e) => patchRowBuffer(product, { price: e.target.value })}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white font-bold text-emerald-800"
                        />
                      </div>

                      <div>
                        <label className="block text-[0.68rem] font-bold text-slate-500 mb-0.5">
                          Stock Qty
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={buffer.stockQuantity}
                          onChange={(e) =>
                            patchRowBuffer(product, { stockQuantity: e.target.value })
                          }
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-[0.68rem] font-bold text-slate-500 mb-0.5">
                          Stock Status
                        </label>
                        <select
                          value={buffer.stockStatus}
                          onChange={(e) =>
                            patchRowBuffer(product, {
                              stockStatus: e.target.value as Product["stockStatus"],
                            })
                          }
                          className="w-full px-2 py-1.5 rounded-lg border border-slate-200 bg-white"
                        >
                          {STOCK_STATUSES.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[0.68rem] font-bold text-slate-500 mb-0.5">
                          Storage Options
                        </label>
                        <input
                          type="text"
                          value={buffer.storageText}
                          onChange={(e) => patchRowBuffer(product, { storageText: e.target.value })}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-[0.68rem] font-bold text-slate-500 mb-0.5">
                          Colour Options
                        </label>
                        <input
                          type="text"
                          value={buffer.colorsText}
                          onChange={(e) => patchRowBuffer(product, { colorsText: e.target.value })}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-[0.68rem] font-bold text-slate-500 mb-0.5">
                          Display Order
                        </label>
                        <input
                          type="number"
                          value={override.displayOrder ?? ""}
                          placeholder="Auto"
                          onChange={(e) =>
                            setOverrideFor(product, (prev) => ({
                              ...prev,
                              displayOrder: e.target.value === "" ? undefined : Number(e.target.value),
                            }))
                          }
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white"
                        />
                      </div>
                    </div>

                    {/* Card Footer: Publish Toggle + Save to Supabase */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                      <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={buffer.available}
                          onChange={(e) =>
                            patchRowBuffer(product, { available: e.target.checked })
                          }
                        />
                        <span>Published on Website</span>
                      </label>

                      <button
                        type="button"
                        disabled={savingProductId === product.id}
                        onClick={() => void handleSaveUkUsedProduct(product)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
                          isDirty
                            ? "bg-slate-900 hover:bg-slate-800 text-white shadow-sm"
                            : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                        }`}
                      >
                        <Save size={12} />
                        <span>
                          {savingProductId === product.id
                            ? "Saving..."
                            : isDirty
                            ? "Save Device & Stock"
                            : "Saved"}
                        </span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ===================== SUB-TAB 2: SHOP HUB, FAMILIES & ACCESSORIES ===================== */}
      {activeSubTab === "shop-hub" && (
        <div className="space-y-5">
          {/* Header, Ribbon & Search Settings */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4">
            <h4 className="text-sm font-bold text-slate-900">
              Shop {SHOP_CATEGORIES.find((c) => c.key === selectedCategory)?.label} Header, Search &amp; Section Visibility
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-bold text-slate-600 mb-1">Page Heading</label>
                <input
                  type="text"
                  value={catConfig.heading}
                  onChange={(e) => updateCatConfig({ heading: e.target.value })}
                  className="w-full p-2 rounded-lg border border-slate-200"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-600 mb-1">Search Bar Placeholder</label>
                <input
                  type="text"
                  value={catConfig.searchPlaceholder}
                  onChange={(e) => updateCatConfig({ searchPlaceholder: e.target.value })}
                  className="w-full p-2 rounded-lg border border-slate-200"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block font-bold text-slate-600 mb-1">Subtitle</label>
                <input
                  type="text"
                  value={catConfig.subtitle}
                  onChange={(e) => updateCatConfig({ subtitle: e.target.value })}
                  className="w-full p-2 rounded-lg border border-slate-200"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block font-bold text-slate-600 mb-1">Promo Ribbon Banner Text</label>
                <input
                  type="text"
                  value={catConfig.promoRibbonText}
                  onChange={(e) => updateCatConfig({ promoRibbonText: e.target.value })}
                  className="w-full p-2 rounded-lg border border-slate-200"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-600 mb-1">UK Used Section Heading</label>
                <input
                  type="text"
                  value={catConfig.ukUsedHeading}
                  onChange={(e) => updateCatConfig({ ukUsedHeading: e.target.value })}
                  className="w-full p-2 rounded-lg border border-slate-200"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-600 mb-1">UK Used Section Subheading</label>
                <input
                  type="text"
                  value={catConfig.ukUsedSubheading}
                  onChange={(e) => updateCatConfig({ ukUsedSubheading: e.target.value })}
                  className="w-full p-2 rounded-lg border border-slate-200"
                />
              </div>
            </div>

            {/* Section Visibility Toggles */}
            <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-slate-100 text-xs">
              <label className="flex items-center gap-2 font-semibold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={catConfig.showUkUsedSection}
                  onChange={(e) => updateCatConfig({ showUkUsedSection: e.target.checked })}
                />
                <span>Show UK Used Section (always immediately before Accessories)</span>
              </label>

              <label className="flex items-center gap-2 font-semibold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={catConfig.showAccessoriesSection}
                  onChange={(e) => updateCatConfig({ showAccessoriesSection: e.target.checked })}
                />
                <span>Show Accessories Section</span>
              </label>

              <label className="flex items-center gap-2 font-semibold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={catConfig.showWaysToBuySection}
                  onChange={(e) => updateCatConfig({ showWaysToBuySection: e.target.checked })}
                />
                <span>Show Ways to Buy</span>
              </label>

              <label className="flex items-center gap-2 font-semibold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={catConfig.showOnlyAtSection}
                  onChange={(e) => updateCatConfig({ showOnlyAtSection: e.target.checked })}
                />
                <span>Show Only at Buy &amp; Sell GH</span>
              </label>
            </div>
          </div>

          {/* Product Family Order & Visibility */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3">
            <div>
              <h4 className="text-sm font-bold text-slate-900">
                Brand New Product Family Order ({categoryFamilies.length} Families)
              </h4>
              <p className="text-xs text-slate-500">
                Reorder or toggle visibility of Brand New product family cards shown in the &quot;All models&quot; shelf.
              </p>
            </div>

            <div className="space-y-2">
              {categoryFamilies.map((fam, idx) => {
                const isHidden = (catConfig.hiddenFamilyIds || []).includes(fam.id);
                return (
                  <div
                    key={fam.id}
                    className={`flex items-center justify-between gap-3 p-3 rounded-xl border text-xs ${
                      isHidden ? "bg-slate-50 border-slate-200 opacity-65" : "bg-white border-slate-200"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <div>
                        <div className="font-bold text-slate-900">{fam.title}</div>
                        <div className="text-[0.7rem] text-slate-500">
                          {fam.products.length} real model{fam.products.length === 1 ? "" : "s"} ·{" "}
                          {fam.startingPriceText}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => moveFamily(fam.id, -1)}
                        className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-30"
                        title="Move up"
                      >
                        <ArrowUp size={13} />
                      </button>
                      <button
                        type="button"
                        disabled={idx === categoryFamilies.length - 1}
                        onClick={() => moveFamily(fam.id, 1)}
                        className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-30"
                        title="Move down"
                      >
                        <ArrowDown size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleFamilyHidden(fam.id)}
                        className={`px-2.5 py-1.5 rounded-lg font-bold flex items-center gap-1 ${
                          isHidden
                            ? "bg-slate-200 text-slate-700"
                            : "bg-emerald-50 text-emerald-800 border border-emerald-200"
                        }`}
                      >
                        {isHidden ? <EyeOff size={12} /> : <Eye size={12} />}
                        <span>{isHidden ? "Hidden" : "Shown"}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Curated Accessories Picker & Editorial Opener */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="text-sm font-bold text-slate-900">
                  Category Accessories Shelf ({(catConfig.curatedAccessorySlugs || []).length} Curated)
                </h4>
                <p className="text-xs text-slate-500">
                  Select genuine accessories that appear in the Accessories rail on Shop {SHOP_CATEGORIES.find((c) => c.key === selectedCategory)?.label}.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <label className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center gap-1.5 cursor-pointer">
                  <Upload size={13} />
                  <span>Upload Editorial Image</span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/avif"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      try {
                        const uploaded = await onUploadMedia(
                          file,
                          "storefront",
                          `Shop ${selectedCategory} Accessories Editorial`
                        );
                        updateCatConfig({ accessoriesEditorialImage: uploaded.url });
                        setStatusMessage("Updated Accessories editorial image.");
                      } catch (err) {
                        setErrorMessage(err instanceof Error ? err.message : "Upload failed.");
                      }
                    }}
                  />
                </label>
                <button
                  type="button"
                  onClick={() =>
                    onOpenMediaPicker((item) =>
                      updateCatConfig({ accessoriesEditorialImage: item.url })
                    )
                  }
                  className="px-3 py-1.5 rounded-lg bg-[#d8a72d]/20 hover:bg-[#d8a72d]/30 text-amber-950 font-bold text-xs flex items-center gap-1.5"
                >
                  <ImageIcon size={13} />
                  <span>Media Library</span>
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {allAccessories.map((acc) => {
                const selected = (catConfig.curatedAccessorySlugs || []).includes(acc.slug);
                return (
                  <button
                    key={acc.id}
                    type="button"
                    onClick={() => toggleAccessorySlug(acc.slug)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 border transition ${
                      selected
                        ? "bg-slate-900 text-white border-slate-900"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    {selected ? <Check size={12} className="text-[#d8a72d]" /> : <Package size={12} />}
                    <span>{acc.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Ways to Buy Cards Editor */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3">
            <h4 className="text-sm font-bold text-slate-900">Ways to Buy Cards</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {(catConfig.waysToBuyCards || []).map((card, idx) => (
                <div
                  key={card.id}
                  className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2 text-xs"
                >
                  <div>
                    <label className="block font-bold text-slate-500 mb-0.5">Eyebrow</label>
                    <input
                      type="text"
                      value={card.eyebrow}
                      onChange={(e) => updateWaysCard(idx, { eyebrow: e.target.value })}
                      className="w-full p-1.5 rounded border border-slate-200 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-500 mb-0.5">Title</label>
                    <input
                      type="text"
                      value={card.title}
                      onChange={(e) => updateWaysCard(idx, { title: e.target.value })}
                      className="w-full p-1.5 rounded border border-slate-200 bg-white font-bold"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-500 mb-0.5">Description</label>
                    <textarea
                      rows={2}
                      value={card.description}
                      onChange={(e) => updateWaysCard(idx, { description: e.target.value })}
                      className="w-full p-1.5 rounded border border-slate-200 bg-white"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block font-bold text-slate-500 mb-0.5">CTA Label</label>
                      <input
                        type="text"
                        value={card.ctaLabel}
                        onChange={(e) => updateWaysCard(idx, { ctaLabel: e.target.value })}
                        className="w-full p-1.5 rounded border border-slate-200 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-500 mb-0.5">Card Tone</label>
                      <select
                        value={card.tone}
                        onChange={(e) =>
                          updateWaysCard(idx, {
                            tone: e.target.value as ShopWaysToBuyCard["tone"],
                          })
                        }
                        className="w-full p-1.5 rounded border border-slate-200 bg-white"
                      >
                        <option value="light">Light</option>
                        <option value="gold">Gold</option>
                        <option value="dark">Dark</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ===================== SUB-TAB 3: LIVE EMBEDDED PREVIEW ===================== */}
      {activeSubTab === "preview" && (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700">
              Live Preview — Shop {SHOP_CATEGORIES.find((c) => c.key === selectedCategory)?.label} (with unsaved draft overrides)
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setPreviewViewport("desktop")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 ${
                  previewViewport === "desktop"
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-700"
                }`}
              >
                <Monitor size={13} /> Desktop
              </button>
              <button
                type="button"
                onClick={() => setPreviewViewport("mobile")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 ${
                  previewViewport === "mobile"
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-700"
                }`}
              >
                <Smartphone size={13} /> Mobile (390px)
              </button>
            </div>
          </div>

          <div
            className="mx-auto border border-slate-200 rounded-2xl overflow-auto bg-white"
            style={{
              width: previewViewport === "mobile" ? 390 : "100%",
              maxHeight: 760,
            }}
          >
            <AppleShopExperience category={selectedCategory} configOverride={config} />
          </div>
        </div>
      )}
    </div>
  );
}
