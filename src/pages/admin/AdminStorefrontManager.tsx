import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronRight,
  Edit,
  Eye,
  Grid,
  Image as ImageIcon,
  ImagePlus,
  Layers,
  Package,
  Plus,
  RefreshCw,
  RotateCcw,
  Save,
  Search,
  ShoppingBag,
  Sparkles,
  Tag,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useCms } from "../../cms/CmsContext";
import { defaultMainStoreConfig } from "../../cms/defaultCmsData";
import { useProductCatalog } from "../../catalog/ProductCatalogContext";
import { familyMatchesProduct, type ProductFamilyKey } from "../../catalog/productExperience";
import { uploadProductImage } from "../../catalog/supabaseProductRepository";
import macMiniImage from "../../assets/homepage/homepage-mac-mini-white.webp";
import { newMacLaunches } from "../../data/newMacLaunches";
import type {
  CategoryAccessoryOverride,
  CategoryDepartmentConfig,
  CategoryFeaturedCardData,
  MainStoreAccessoryItem,
  MainStoreCategoryCard,
  MainStoreConfig,
  MainStoreFamilyItem,
  MainStorePromoCard,
  MediaItem,
} from "../../cms/types";
import { CATEGORY_DEPARTMENTS } from "../../components/store/category/categoryData";
import { getCategoryRelevantAccessories } from "../../components/store/category/StoreCategoryAccessoriesRail";
import { resolveAdminProductImage, resolveCatalogueProductImage, resolveProductImage } from "../../utils/productImages";
import { formatGhs } from "../../utils/format";
import type { Product, ProductImage } from "../../types/product";
import { StorePageSectionBuilder } from "../../components/admin/StorePageSectionBuilder";
import { AdminMediaLibrary } from "./AdminMediaLibrary";

export type StorefrontDepartmentKey = "main-store" | ProductFamilyKey;
type StorefrontSection = "featured" | "listings" | "accessories";
type MainStoreSection = "sections" | "latest" | "categories" | "moreToLove" | "families" | "accessories";

export function AdminStorefrontManager() {
  const {
    departments: cmsDepartments,
    mainStore: cmsMainStore,
    mainStoreDraft,
    updateStorefront,
    updateMainStore,
    saveMainStoreDraftConfig,
    discardMainStoreDraftConfig,
    uploadMedia,
  } = useCms();
  const { products, activeProducts, saveProduct, backendStatus } = useProductCatalog();

  const [departments, setDepartments] = useState<Record<string, CategoryDepartmentConfig>>(cmsDepartments);
  const [selectedDeptKey, setSelectedDeptKey] = useState<StorefrontDepartmentKey>("main-store");
  const [activeSection, setActiveSection] = useState<StorefrontSection>("featured");
  const [activeMainStoreSection, setActiveMainStoreSection] = useState<MainStoreSection>("sections");
  const [mainStoreConfig, setMainStoreConfigRaw] = useState<MainStoreConfig>(
    mainStoreDraft || cmsMainStore || defaultMainStoreConfig
  );
  const hasLocalMainStoreEdits = useRef(false);

  const setMainStoreConfig: React.Dispatch<React.SetStateAction<MainStoreConfig>> = (updater) => {
    hasLocalMainStoreEdits.current = true;
    setMainStoreConfigRaw(updater);
  };

  useEffect(() => {
    if (hasLocalMainStoreEdits.current) return;
    if (mainStoreDraft) {
      setMainStoreConfigRaw(mainStoreDraft);
    } else if (cmsMainStore) {
      setMainStoreConfigRaw(cmsMainStore);
    }
  }, [cmsMainStore, mainStoreDraft]);

  useEffect(() => {
    if (cmsDepartments) {
      setDepartments(cmsDepartments);
    }
  }, [cmsDepartments]);

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState("");

  // Media picker modal state: target could be a featured card index, an accessory slug, a product id, or main store item
  const [mediaPickerTarget, setMediaPickerTarget] = useState<
    | { type: "card"; cardIndex: number }
    | { type: "accessory"; slug: string }
    | { type: "product"; productId: string }
    | { type: "main-store-latest"; index: number }
    | { type: "main-store-category"; index: number }
    | { type: "main-store-more"; index: number }
    | { type: "main-store-family"; index: number }
    | { type: "main-store-accessory"; index: number }
    | null
  >(null);

  // File upload state for cards / accessories
  const [uploadingTarget, setUploadingTarget] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string>("");

  // Product Listings management state
  const [productSearch, setProductSearch] = useState("");
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [productImagesState, setProductImagesState] = useState<Record<string, { images: ProductImage[]; primaryIndex: number }>>({});
  const [savingProductId, setSavingProductId] = useState<string | null>(null);
  const [productSaveSuccess, setProductSaveSuccess] = useState<string | null>(null);
  const [productSaveError, setProductSaveError] = useState<string | null>(null);

  const currentDeptKey: ProductFamilyKey = selectedDeptKey === "main-store" ? "iphone" : selectedDeptKey;
  const currentDept = departments[currentDeptKey] || CATEGORY_DEPARTMENTS[currentDeptKey] || CATEGORY_DEPARTMENTS.iphone;

  // Filter products for the current department
  const categoryProducts = useMemo(() => {
    if (selectedDeptKey === "main-store") return [];
    return products.filter((p) => familyMatchesProduct(p, currentDeptKey));
  }, [products, selectedDeptKey, currentDeptKey]);

  // Filter accessories for the current department
  const categoryAccessories = useMemo(() => {
    if (selectedDeptKey === "main-store") return [];
    return getCategoryRelevantAccessories(currentDeptKey);
  }, [selectedDeptKey, currentDeptKey]);

  const handleSaveStorefront = async () => {
    setSaving(true);
    setSaveError("");
    setSaveSuccess(false);
    try {
      await Promise.all([
        updateStorefront(departments),
        updateMainStore(mainStoreConfig),
      ]);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Failed to save storefront configuration.");
    } finally {
      setSaving(false);
    }
  };

  const updateCurrentDept = (partial: Partial<CategoryDepartmentConfig>) => {
    if (selectedDeptKey === "main-store") return;
    setDepartments((prev) => ({
      ...prev,
      [selectedDeptKey]: {
        ...(prev[selectedDeptKey] || CATEGORY_DEPARTMENTS[selectedDeptKey]),
        ...partial,
      },
    }));
  };


  // ---------------- FEATURED CARDS HANDLERS ----------------
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
      buyPath: `/shop/buy-${selectedDeptKey}`,
      buyLabel: "Buy",
      storyPath: `/shop/buy-${selectedDeptKey}`,
      storyLabel: "Learn more",
      isDark: false,
    };
    updateCurrentDept({ featuredCards: [...currentDept.featuredCards, newCard] });
  };

  // ---------------- ACCESSORY OVERRIDES HANDLERS ----------------
  const updateAccessoryOverride = (slug: string, partial: Partial<CategoryAccessoryOverride>) => {
    const currentOverrides = currentDept.accessoryOverrides || {};
    const existing = currentOverrides[slug] || { id: slug };
    const updated: CategoryAccessoryOverride = { ...existing, ...partial };
    updateCurrentDept({
      accessoryOverrides: {
        ...currentOverrides,
        [slug]: updated,
      },
    });
  };

  const removeAccessoryOverride = (slug: string) => {
    const currentOverrides = { ...(currentDept.accessoryOverrides || {}) };
    delete currentOverrides[slug];
    updateCurrentDept({ accessoryOverrides: currentOverrides });
  };

  // ---------------- DIRECT UPLOAD HANDLERS ----------------
  const handleFeaturedCardFileUpload = async (cardIndex: number, file: File) => {
    setUploadingTarget(`card-${cardIndex}`);
    setUploadError("");
    try {
      const uploaded = await uploadMedia(file, "storefront", `Showcase Card ${cardIndex + 1} Image`);
      updateFeaturedCard(cardIndex, { image: uploaded.url, alt: uploaded.alt || uploaded.title });
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Failed to upload card image.");
    } finally {
      setUploadingTarget(null);
    }
  };

  const handleAccessoryFileUpload = async (slug: string, file: File, accName: string) => {
    setUploadingTarget(`accessory-${slug}`);
    setUploadError("");
    try {
      const uploaded = await uploadMedia(file, "product", `${accName} photo`);
      updateAccessoryOverride(slug, { image: uploaded.url, alt: uploaded.alt || accName });
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Failed to upload accessory image.");
    } finally {
      setUploadingTarget(null);
    }
  };

  // ---------------- PRODUCT LISTING IMAGES HANDLERS ----------------
  const getProductImageState = (product: Product) => {
    if (productImagesState[product.id]) {
      return productImagesState[product.id];
    }
    const images = product.images ?? [];
    return {
      images,
      primaryIndex: Math.max(0, Math.min(product.primaryImageIndex ?? 0, Math.max(0, images.length - 1))),
    };
  };

  const setProductImageStateFor = (productId: string, images: ProductImage[], primaryIndex: number) => {
    setProductImagesState((prev) => ({
      ...prev,
      [productId]: { images, primaryIndex },
    }));
  };

  const handleProductListingUpload = async (product: Product, files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploadingTarget(`product-${product.id}`);
    setProductSaveError(null);
    try {
      const current = getProductImageState(product);
      const newImages = [...current.images];
      for (const file of Array.from(files)) {
        const uploaded = await uploadProductImage(file, product.id);
        newImages.push({ src: uploaded.src, alt: uploaded.alt || `${product.name} photo` });
      }
      setProductImageStateFor(product.id, newImages, current.primaryIndex);
    } catch (err) {
      setProductSaveError(err instanceof Error ? err.message : "Failed to upload product images.");
    } finally {
      setUploadingTarget(null);
    }
  };

  const handleSaveProductImages = async (product: Product) => {
    setSavingProductId(product.id);
    setProductSaveError(null);
    setProductSaveSuccess(null);
    try {
      const state = getProductImageState(product);
      const updatedProduct: Product = {
        ...product,
        images: state.images,
        primaryImageIndex: state.primaryIndex,
        updatedAt: new Date().toISOString(),
      };
      await saveProduct(updatedProduct);
      setProductSaveSuccess(`Updated images for "${product.name}" successfully! Live store updated.`);
      setTimeout(() => setProductSaveSuccess(null), 4000);
    } catch (err) {
      setProductSaveError(err instanceof Error ? err.message : "Failed to save product images.");
    } finally {
      setSavingProductId(null);
    }
  };

  // ---------------- MAIN STORE PAGE HANDLERS ----------------
  const updateMainStoreFamily = (index: number, partial: Partial<MainStoreFamilyItem>) => {
    setMainStoreConfig((prev) => {
      const list = [...(prev.productFamilies || defaultMainStoreConfig.productFamilies)];
      list[index] = { ...list[index], ...partial };
      return { ...prev, productFamilies: list };
    });
  };

  const updateMainStoreLatest = (index: number, partial: Partial<MainStorePromoCard>) => {
    setMainStoreConfig((prev) => {
      const list = [...(prev.latestCards || defaultMainStoreConfig.latestCards)];
      list[index] = { ...list[index], ...partial };
      return { ...prev, latestCards: list };
    });
  };

  const updateMainStoreCategory = (index: number, partial: Partial<MainStoreCategoryCard>) => {
    setMainStoreConfig((prev) => {
      const list = [...(prev.categoryCards || defaultMainStoreConfig.categoryCards)];
      list[index] = { ...list[index], ...partial };
      return { ...prev, categoryCards: list };
    });
  };

  const updateMainStoreMore = (index: number, partial: Partial<MainStorePromoCard>) => {
    setMainStoreConfig((prev) => {
      const list = [...(prev.moreToLoveCards || defaultMainStoreConfig.moreToLoveCards)];
      list[index] = { ...list[index], ...partial };
      return { ...prev, moreToLoveCards: list };
    });
  };

  const updateMainStoreAccessory = (index: number, partial: Partial<MainStoreAccessoryItem>) => {
    setMainStoreConfig((prev) => {
      const list = [...(prev.accessories || defaultMainStoreConfig.accessories)];
      list[index] = { ...list[index], ...partial };
      return { ...prev, accessories: list };
    });
  };

  const handleMainStoreFileUpload = async (
    target: "family" | "latest" | "category" | "more" | "accessory",
    index: number,
    file: File,
    fallbackLabel: string
  ) => {
    setUploadingTarget(`ms-${target}-${index}`);
    setUploadError("");
    try {
      const uploaded = await uploadMedia(file, "storefront", fallbackLabel);
      if (target === "family") {
        updateMainStoreFamily(index, { image: uploaded.url, alt: uploaded.alt || uploaded.title });
      } else if (target === "latest") {
        updateMainStoreLatest(index, { image: uploaded.url, alt: uploaded.alt || uploaded.title });
      } else if (target === "category") {
        updateMainStoreCategory(index, { image: uploaded.url, alt: uploaded.alt || uploaded.title });
      } else if (target === "more") {
        updateMainStoreMore(index, { image: uploaded.url, alt: uploaded.alt || uploaded.title });
      } else if (target === "accessory") {
        updateMainStoreAccessory(index, { image: uploaded.url, alt: uploaded.alt || uploaded.title });
      }
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Failed to upload image.");
    } finally {
      setUploadingTarget(null);
    }
  };

  const resolveMainStorePromoPreview = (card: MainStorePromoCard): { src: string; isCustom: boolean } => {
    if (card.image && card.image.trim() !== "") {
      return { src: card.image, isCustom: true };
    }
    if (card.id === "mac-mini") {
      return { src: macMiniImage, isCustom: false };
    }
    if (card.id === "mac-studio") {
      return { src: newMacLaunches["mac-studio"].image, isCustom: false };
    }
    const prod = products.find((p) => p.slug === card.id);
    if (prod) {
      const catImg = resolveCatalogueProductImage(prod);
      if (catImg?.src) return { src: catImg.src, isCustom: false };
    }
    return { src: card.image || "", isCustom: false };
  };

  const resolveMainStoreAccessoryPreview = (item: MainStoreAccessoryItem): { src: string; isCustom: boolean; displayName: string } => {
    const prod = products.find((p) => p.slug === item.id);
    if (item.image && item.image.trim() !== "") {
      return { src: item.image, isCustom: true, displayName: item.name || prod?.name || item.id };
    }
    if (prod) {
      const catImg = resolveCatalogueProductImage(prod);
      if (catImg?.src) return { src: catImg.src, isCustom: false, displayName: item.name || prod.name };
    }
    return { src: item.image || "", isCustom: false, displayName: item.name || item.id };
  };

  // ---------------- MEDIA PICKER SELECTION ----------------
  const handleMediaPickerSelect = (item: MediaItem) => {
    if (!mediaPickerTarget) return;

    if (mediaPickerTarget.type === "card") {
      updateFeaturedCard(mediaPickerTarget.cardIndex, {
        image: item.url,
        alt: item.alt || item.title,
      });
    } else if (mediaPickerTarget.type === "accessory") {
      updateAccessoryOverride(mediaPickerTarget.slug, {
        image: item.url,
        alt: item.alt || item.title,
      });
    } else if (mediaPickerTarget.type === "product") {
      const prod = products.find((p) => p.id === mediaPickerTarget.productId);
      if (prod) {
        const current = getProductImageState(prod);
        const nextImages = [
          ...current.images,
          { src: item.url, alt: item.alt || item.title || `${prod.name} image` },
        ];
        setProductImageStateFor(prod.id, nextImages, current.primaryIndex);
      }
    } else if (mediaPickerTarget.type === "main-store-latest") {
      updateMainStoreLatest(mediaPickerTarget.index, {
        image: item.url,
        alt: item.alt || item.title,
      });
    } else if (mediaPickerTarget.type === "main-store-category") {
      updateMainStoreCategory(mediaPickerTarget.index, {
        image: item.url,
        alt: item.alt || item.title,
      });
    } else if (mediaPickerTarget.type === "main-store-more") {
      updateMainStoreMore(mediaPickerTarget.index, {
        image: item.url,
        alt: item.alt || item.title,
      });
    } else if (mediaPickerTarget.type === "main-store-family") {
      updateMainStoreFamily(mediaPickerTarget.index, {
        image: item.url,
        alt: item.alt || item.title,
      });
    } else if (mediaPickerTarget.type === "main-store-accessory") {
      updateMainStoreAccessory(mediaPickerTarget.index, {
        image: item.url,
        alt: item.alt || item.title,
      });
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
              Storefront Architecture &amp; Images
            </span>
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-slate-300" />
            <span className="text-xs font-semibold text-slate-500">Live Visual Asset Control</span>
          </div>
          <h2>Storefront &amp; Category Manager</h2>
          <p>
            Manage department headlines, featured lineup showcase carousels, catalog product listings, and
            essential accessory cards for iPhone, Mac, iPad, Watch, AirPods, and Accessories.
          </p>
        </div>

        <button
          type="button"
          disabled={saving}
          onClick={handleSaveStorefront}
          className="admin-btn admin-btn-primary"
        >
          <Save size={16} />
          <span>{saving ? "Saving..." : "Save Storefront Changes"}</span>
        </button>
      </div>

      {saveSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 size={16} />
          <span>Storefront categories, showcase carousels and accessories updated successfully!</span>
        </div>
      )}

      {saveError && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
          <AlertCircle size={16} />
          <span>{saveError}</span>
        </div>
      )}

      {uploadError && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
          <AlertCircle size={16} />
          <span>{uploadError}</span>
        </div>
      )}

      {/* 2. Step 1: Category / Store Selector */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
          1. Select Category / Department
        </label>
        <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-xl bg-slate-100/80 border border-slate-200">
          <button
            type="button"
            onClick={() => setSelectedDeptKey("main-store")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all ${
              selectedDeptKey === "main-store"
                ? "bg-white text-slate-900 shadow-sm ring-1 ring-slate-200"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Sparkles size={14} className={selectedDeptKey === "main-store" ? "text-[#d4af37]" : "text-slate-400"} />
            <span>Main Store Page</span>
            <span className="px-1.5 py-0.2 rounded-full text-[0.65rem] bg-[#d4af37]/20 text-amber-900 font-extrabold">
              35 Images
            </span>
          </button>

          {(["iphone", "mac", "ipad", "watch", "airpods", "accessories"] as ProductFamilyKey[]).map((key) => {
            const dept = departments[key] || CATEGORY_DEPARTMENTS[key];
            const isSelected = selectedDeptKey === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setSelectedDeptKey(key)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all ${
                  isSelected
                    ? "bg-white text-slate-900 shadow-sm ring-1 ring-slate-200"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <ShoppingBag size={14} className={isSelected ? "text-[#d4af37]" : "text-slate-400"} />
                <span>{dept?.label || key.toUpperCase()}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Step 2: Store Section Tabs */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
          2. Select Store Section to Manage
        </label>

        {selectedDeptKey === "main-store" ? (
          <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-2">
            <button
              type="button"
              data-testid="main-store-tab-sections"
              onClick={() => setActiveMainStoreSection("sections")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeMainStoreSection === "sections"
                  ? "bg-slate-900 text-white shadow"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              <Layers size={14} className={activeMainStoreSection === "sections" ? "text-[#d4af37]" : "text-slate-400"} />
              <span>Store Page Sections (Builder)</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[0.65rem] ${activeMainStoreSection === "sections" ? "bg-white/20 text-white" : "bg-slate-200 text-slate-700"}`}>
                {(mainStoreConfig.sections || defaultMainStoreConfig.sections || []).length}
              </span>
            </button>

            <button
              type="button"
              data-testid="main-store-tab-latest"
              onClick={() => setActiveMainStoreSection("latest")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeMainStoreSection === "latest"
                  ? "bg-slate-900 text-white shadow"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              <Sparkles size={14} className={activeMainStoreSection === "latest" ? "text-[#d4af37]" : "text-slate-400"} />
              <span>The Latest (What&apos;s New)</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[0.65rem] ${activeMainStoreSection === "latest" ? "bg-white/20 text-white" : "bg-slate-200 text-slate-700"}`}>
                {(mainStoreConfig.latestCards || defaultMainStoreConfig.latestCards).length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveMainStoreSection("categories")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeMainStoreSection === "categories"
                  ? "bg-slate-900 text-white shadow"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              <Grid size={14} className={activeMainStoreSection === "categories" ? "text-[#d4af37]" : "text-slate-400"} />
              <span>Shop by Category</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[0.65rem] ${activeMainStoreSection === "categories" ? "bg-white/20 text-white" : "bg-slate-200 text-slate-700"}`}>
                {(mainStoreConfig.categoryCards || defaultMainStoreConfig.categoryCards).length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveMainStoreSection("moreToLove")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeMainStoreSection === "moreToLove"
                  ? "bg-slate-900 text-white shadow"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              <Sparkles size={14} className={activeMainStoreSection === "moreToLove" ? "text-[#d4af37]" : "text-slate-400"} />
              <span>More to Love</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[0.65rem] ${activeMainStoreSection === "moreToLove" ? "bg-white/20 text-white" : "bg-slate-200 text-slate-700"}`}>
                {(mainStoreConfig.moreToLoveCards || defaultMainStoreConfig.moreToLoveCards).length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveMainStoreSection("families")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeMainStoreSection === "families"
                  ? "bg-slate-900 text-white shadow"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              <Layers size={14} className={activeMainStoreSection === "families" ? "text-[#d4af37]" : "text-slate-400"} />
              <span>Product Family Strip</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[0.65rem] ${activeMainStoreSection === "families" ? "bg-white/20 text-white" : "bg-slate-200 text-slate-700"}`}>
                {(mainStoreConfig.productFamilies || defaultMainStoreConfig.productFamilies).length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveMainStoreSection("accessories")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeMainStoreSection === "accessories"
                  ? "bg-slate-900 text-white shadow"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              <Package size={14} className={activeMainStoreSection === "accessories" ? "text-[#d4af37]" : "text-slate-400"} />
              <span>Featured Accessories</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[0.65rem] ${activeMainStoreSection === "accessories" ? "bg-white/20 text-white" : "bg-slate-200 text-slate-700"}`}>
                {(mainStoreConfig.accessories || defaultMainStoreConfig.accessories).length}
              </span>
            </button>
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-2">
            <button
              type="button"
              onClick={() => setActiveSection("featured")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeSection === "featured"
                  ? "bg-slate-900 text-white shadow"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              <Sparkles size={14} className={activeSection === "featured" ? "text-[#d4af37]" : "text-slate-400"} />
              <span>Featured Lineup Carousel</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[0.65rem] ${activeSection === "featured" ? "bg-white/20 text-white" : "bg-slate-200 text-slate-700"}`}>
                {currentDept.featuredCards.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSection("listings")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeSection === "listings"
                  ? "bg-slate-900 text-white shadow"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              <Grid size={14} className={activeSection === "listings" ? "text-[#d4af37]" : "text-slate-400"} />
              <span>All Product Listings Grid</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[0.65rem] ${activeSection === "listings" ? "bg-white/20 text-white" : "bg-slate-200 text-slate-700"}`}>
                {categoryProducts.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSection("accessories")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeSection === "accessories"
                  ? "bg-slate-900 text-white shadow"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              <Package size={14} className={activeSection === "accessories" ? "text-[#d4af37]" : "text-slate-400"} />
              <span>Essential Accessories Rail</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[0.65rem] ${activeSection === "accessories" ? "bg-white/20 text-white" : "bg-slate-200 text-slate-700"}`}>
                {categoryAccessories.length}
              </span>
            </button>
          </div>
        )}
      </div>

      {/* ===================== MAIN STORE PAGE EDITORS ===================== */}
      {selectedDeptKey === "main-store" && (
        <div className="space-y-6">
          {/* 0. Store Page Section Builder */}
          {activeMainStoreSection === "sections" && (
            <StorePageSectionBuilder
              mainStoreConfig={mainStoreConfig}
              setMainStoreConfig={setMainStoreConfig}
              hasDraft={Boolean(mainStoreDraft)}
              onSaveDraft={async (cfg) => {
                const saved = await saveMainStoreDraftConfig(cfg);
                setMainStoreConfigRaw(saved);
                return saved;
              }}
              onPublishLive={async (cfg) => {
                const published = await updateMainStore(cfg);
                setMainStoreConfigRaw(published);
                return published;
              }}
              onDiscardDraft={async () => {
                await discardMainStoreDraftConfig();
                hasLocalMainStoreEdits.current = false;
                setMainStoreConfigRaw(cmsMainStore || defaultMainStoreConfig);
              }}
              uploadMedia={uploadMedia}
              products={products}
              activeProducts={activeProducts}
              onSwitchSubTab={(tab) => setActiveMainStoreSection(tab)}
            />
          )}

          {/* 1. The Latest (8 cards) */}
          {activeMainStoreSection === "latest" && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    The Latest — What&apos;s New Carousel ({(mainStoreConfig.latestCards || defaultMainStoreConfig.latestCards).length} Cards)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Featured showcase carousel cards on the main Store landing page. Each image can be custom-uploaded, chosen from the Media Library, or fall back to verified product images.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {(mainStoreConfig.latestCards || defaultMainStoreConfig.latestCards).map((card, idx) => {
                  const preview = resolveMainStorePromoPreview(card);
                  const isUploading = uploadingTarget === `ms-latest-${idx}`;

                  return (
                    <div
                      key={card.id || idx}
                      className="admin-card p-4 space-y-3 border border-slate-200 flex flex-col justify-between rounded-2xl bg-white shadow-sm"
                    >
                      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-[0.65rem] font-bold text-slate-700 uppercase">
                          Card #{idx + 1} • {card.name}
                        </span>
                        {preview.isCustom ? (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[0.65rem] font-bold">
                            Custom Image
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 text-[0.65rem] font-medium">
                            Product Default
                          </span>
                        )}
                      </div>

                      {/* Live Preview Box */}
                      <div className="aspect-[16/10] bg-slate-50 rounded-xl overflow-hidden flex items-center justify-center border border-slate-200 relative p-2">
                        {preview.src ? (
                          <img
                            src={preview.src}
                            alt={card.alt || card.name}
                            className="max-h-full max-w-full object-contain"
                          />
                        ) : (
                          <span className="text-xs text-slate-400">No Image Assigned</span>
                        )}
                      </div>

                      {/* Image Management Actions */}
                      <div className="space-y-2 pt-1">
                        <div className="flex items-center gap-2">
                          <label className="flex-1 py-1.5 px-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold flex items-center justify-center gap-1.5 transition text-[0.7rem] cursor-pointer">
                            <Upload size={13} />
                            <span>{isUploading ? "Uploading..." : "Upload Photo"}</span>
                            <input
                              type="file"
                              accept="image/jpeg,image/png,image/webp,image/avif"
                              disabled={uploadingTarget !== null}
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) void handleMainStoreFileUpload("latest", idx, file, card.name);
                              }}
                              className="hidden"
                            />
                          </label>

                          <button
                            type="button"
                            onClick={() => setMediaPickerTarget({ type: "main-store-latest", index: idx })}
                            className="flex-1 py-1.5 px-2 rounded-lg bg-[#d4af37]/15 hover:bg-[#d4af37]/25 text-amber-900 font-bold flex items-center justify-center gap-1.5 transition text-[0.7rem]"
                          >
                            <ImageIcon size={13} />
                            <span>Media Library</span>
                          </button>
                        </div>

                        {preview.isCustom && (
                          <button
                            type="button"
                            onClick={() => updateMainStoreLatest(idx, { image: defaultMainStoreConfig.latestCards[idx]?.image || "", alt: defaultMainStoreConfig.latestCards[idx]?.alt || "" })}
                            className="w-full py-1 text-[0.68rem] text-rose-600 hover:text-rose-800 font-semibold flex items-center justify-center gap-1"
                          >
                            <RotateCcw size={12} />
                            <span>Reset to Default Image</span>
                          </button>
                        )}
                      </div>

                      {/* Metadata Inputs */}
                      <div className="space-y-2 pt-2 border-t border-slate-100">
                        <div>
                          <label className="text-[0.65rem] font-bold text-slate-400 block mb-0.5 uppercase tracking-wide">
                            Image URL
                          </label>
                          <input
                            type="text"
                            value={card.image}
                            placeholder={preview.src}
                            onChange={(e) => updateMainStoreLatest(idx, { image: e.target.value })}
                            className="admin-input text-xs py-1 px-2 w-full font-mono"
                          />
                        </div>

                        <div>
                          <label className="text-[0.65rem] font-bold text-slate-400 block mb-0.5 uppercase tracking-wide">
                            Alt Text
                          </label>
                          <input
                            type="text"
                            value={card.alt}
                            placeholder={card.name}
                            onChange={(e) => updateMainStoreLatest(idx, { alt: e.target.value })}
                            className="admin-input text-xs py-1 px-2 w-full"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[0.65rem] font-bold text-slate-400 block mb-0.5 uppercase tracking-wide">
                              Eyebrow
                            </label>
                            <input
                              type="text"
                              value={card.eyebrow}
                              onChange={(e) => updateMainStoreLatest(idx, { eyebrow: e.target.value })}
                              className="admin-input text-xs py-1 px-2 w-full"
                            />
                          </div>
                          <div>
                            <label className="text-[0.65rem] font-bold text-slate-400 block mb-0.5 uppercase tracking-wide">
                              Name
                            </label>
                            <input
                              type="text"
                              value={card.name}
                              onChange={(e) => updateMainStoreLatest(idx, { name: e.target.value })}
                              className="admin-input text-xs py-1 px-2 w-full"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="text-[0.65rem] font-bold text-slate-400 block mb-0.5 uppercase tracking-wide">
                            Statement / Subtitle
                          </label>
                          <input
                            type="text"
                            value={card.statement}
                            onChange={(e) => updateMainStoreLatest(idx, { statement: e.target.value })}
                            className="admin-input text-xs py-1 px-2 w-full"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 2. Shop by Category (6 cards) */}
          {activeMainStoreSection === "categories" && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Shop by Category Tiles ({(mainStoreConfig.categoryCards || defaultMainStoreConfig.categoryCards).length} Cards)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Category exploration tiles linking customers to Phones, Mac &amp; Laptops, iPads, Apple Watch, AirPods &amp; Audio, and Accessories.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {(mainStoreConfig.categoryCards || defaultMainStoreConfig.categoryCards).map((cat, idx) => {
                  const defaultImg = defaultMainStoreConfig.categoryCards[idx]?.image || "";
                  const isCustom = Boolean(cat.image && cat.image !== defaultImg);
                  const isUploading = uploadingTarget === `ms-category-${idx}`;

                  return (
                    <div
                      key={cat.id || idx}
                      className="admin-card p-4 space-y-3 border border-slate-200 flex flex-col justify-between rounded-2xl bg-white shadow-sm"
                    >
                      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-[0.65rem] font-bold text-slate-700 uppercase">
                          Category #{idx + 1} • {cat.title}
                        </span>
                        {isCustom ? (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[0.65rem] font-bold">
                            Custom Image
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 text-[0.65rem] font-medium">
                            Default Asset
                          </span>
                        )}
                      </div>

                      {/* Live Preview Box */}
                      <div className="aspect-[16/10] bg-slate-50 rounded-xl overflow-hidden flex items-center justify-center border border-slate-200 relative p-2">
                        {cat.image ? (
                          <img
                            src={cat.image}
                            alt={cat.alt || cat.title}
                            className="max-h-full max-w-full object-contain"
                          />
                        ) : (
                          <span className="text-xs text-slate-400">No Image Assigned</span>
                        )}
                      </div>

                      {/* Image Management Actions */}
                      <div className="space-y-2 pt-1">
                        <div className="flex items-center gap-2">
                          <label className="flex-1 py-1.5 px-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold flex items-center justify-center gap-1.5 transition text-[0.7rem] cursor-pointer">
                            <Upload size={13} />
                            <span>{isUploading ? "Uploading..." : "Upload Photo"}</span>
                            <input
                              type="file"
                              accept="image/jpeg,image/png,image/webp,image/avif"
                              disabled={uploadingTarget !== null}
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) void handleMainStoreFileUpload("category", idx, file, cat.title);
                              }}
                              className="hidden"
                            />
                          </label>

                          <button
                            type="button"
                            onClick={() => setMediaPickerTarget({ type: "main-store-category", index: idx })}
                            className="flex-1 py-1.5 px-2 rounded-lg bg-[#d4af37]/15 hover:bg-[#d4af37]/25 text-amber-900 font-bold flex items-center justify-center gap-1.5 transition text-[0.7rem]"
                          >
                            <ImageIcon size={13} />
                            <span>Media Library</span>
                          </button>
                        </div>

                        {isCustom && (
                          <button
                            type="button"
                            onClick={() => updateMainStoreCategory(idx, { image: defaultImg, alt: defaultMainStoreConfig.categoryCards[idx]?.alt || "" })}
                            className="w-full py-1 text-[0.68rem] text-rose-600 hover:text-rose-800 font-semibold flex items-center justify-center gap-1"
                          >
                            <RotateCcw size={12} />
                            <span>Reset to Default Image</span>
                          </button>
                        )}
                      </div>

                      {/* Metadata Inputs */}
                      <div className="space-y-2 pt-2 border-t border-slate-100">
                        <div>
                          <label className="text-[0.65rem] font-bold text-slate-400 block mb-0.5 uppercase tracking-wide">
                            Image URL
                          </label>
                          <input
                            type="text"
                            value={cat.image}
                            placeholder={defaultImg}
                            onChange={(e) => updateMainStoreCategory(idx, { image: e.target.value })}
                            className="admin-input text-xs py-1 px-2 w-full font-mono"
                          />
                        </div>

                        <div>
                          <label className="text-[0.65rem] font-bold text-slate-400 block mb-0.5 uppercase tracking-wide">
                            Alt Text
                          </label>
                          <input
                            type="text"
                            value={cat.alt}
                            placeholder={cat.title}
                            onChange={(e) => updateMainStoreCategory(idx, { alt: e.target.value })}
                            className="admin-input text-xs py-1 px-2 w-full"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[0.65rem] font-bold text-slate-400 block mb-0.5 uppercase tracking-wide">
                              Title
                            </label>
                            <input
                              type="text"
                              value={cat.title}
                              onChange={(e) => updateMainStoreCategory(idx, { title: e.target.value })}
                              className="admin-input text-xs py-1 px-2 w-full"
                            />
                          </div>
                          <div>
                            <label className="text-[0.65rem] font-bold text-slate-400 block mb-0.5 uppercase tracking-wide">
                              Path
                            </label>
                            <input
                              type="text"
                              value={cat.path}
                              onChange={(e) => updateMainStoreCategory(idx, { path: e.target.value })}
                              className="admin-input text-xs py-1 px-2 w-full font-mono"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="text-[0.65rem] font-bold text-slate-400 block mb-0.5 uppercase tracking-wide">
                            Subtitle
                          </label>
                          <input
                            type="text"
                            value={cat.subtitle}
                            onChange={(e) => updateMainStoreCategory(idx, { subtitle: e.target.value })}
                            className="admin-input text-xs py-1 px-2 w-full"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 3. More to Love (7 cards) */}
          {activeMainStoreSection === "moreToLove" && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    More to Love Carousel ({(mainStoreConfig.moreToLoveCards || defaultMainStoreConfig.moreToLoveCards).length} Cards)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Second featured product rail on the main Store page highlighting new launches and flagship Apple products.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {(mainStoreConfig.moreToLoveCards || defaultMainStoreConfig.moreToLoveCards).map((card, idx) => {
                  const preview = resolveMainStorePromoPreview(card);
                  const isUploading = uploadingTarget === `ms-more-${idx}`;

                  return (
                    <div
                      key={card.id || idx}
                      className="admin-card p-4 space-y-3 border border-slate-200 flex flex-col justify-between rounded-2xl bg-white shadow-sm"
                    >
                      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-[0.65rem] font-bold text-slate-700 uppercase">
                          Card #{idx + 1} • {card.name}
                        </span>
                        {preview.isCustom ? (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[0.65rem] font-bold">
                            Custom Image
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 text-[0.65rem] font-medium">
                            Product Default
                          </span>
                        )}
                      </div>

                      {/* Live Preview Box */}
                      <div className="aspect-[16/10] bg-slate-50 rounded-xl overflow-hidden flex items-center justify-center border border-slate-200 relative p-2">
                        {preview.src ? (
                          <img
                            src={preview.src}
                            alt={card.alt || card.name}
                            className="max-h-full max-w-full object-contain"
                          />
                        ) : (
                          <span className="text-xs text-slate-400">No Image Assigned</span>
                        )}
                      </div>

                      {/* Image Management Actions */}
                      <div className="space-y-2 pt-1">
                        <div className="flex items-center gap-2">
                          <label className="flex-1 py-1.5 px-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold flex items-center justify-center gap-1.5 transition text-[0.7rem] cursor-pointer">
                            <Upload size={13} />
                            <span>{isUploading ? "Uploading..." : "Upload Photo"}</span>
                            <input
                              type="file"
                              accept="image/jpeg,image/png,image/webp,image/avif"
                              disabled={uploadingTarget !== null}
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) void handleMainStoreFileUpload("more", idx, file, card.name);
                              }}
                              className="hidden"
                            />
                          </label>

                          <button
                            type="button"
                            onClick={() => setMediaPickerTarget({ type: "main-store-more", index: idx })}
                            className="flex-1 py-1.5 px-2 rounded-lg bg-[#d4af37]/15 hover:bg-[#d4af37]/25 text-amber-900 font-bold flex items-center justify-center gap-1.5 transition text-[0.7rem]"
                          >
                            <ImageIcon size={13} />
                            <span>Media Library</span>
                          </button>
                        </div>

                        {preview.isCustom && (
                          <button
                            type="button"
                            onClick={() => updateMainStoreMore(idx, { image: defaultMainStoreConfig.moreToLoveCards[idx]?.image || "", alt: defaultMainStoreConfig.moreToLoveCards[idx]?.alt || "" })}
                            className="w-full py-1 text-[0.68rem] text-rose-600 hover:text-rose-800 font-semibold flex items-center justify-center gap-1"
                          >
                            <RotateCcw size={12} />
                            <span>Reset to Default Image</span>
                          </button>
                        )}
                      </div>

                      {/* Metadata Inputs */}
                      <div className="space-y-2 pt-2 border-t border-slate-100">
                        <div>
                          <label className="text-[0.65rem] font-bold text-slate-400 block mb-0.5 uppercase tracking-wide">
                            Image URL
                          </label>
                          <input
                            type="text"
                            value={card.image}
                            placeholder={preview.src}
                            onChange={(e) => updateMainStoreMore(idx, { image: e.target.value })}
                            className="admin-input text-xs py-1 px-2 w-full font-mono"
                          />
                        </div>

                        <div>
                          <label className="text-[0.65rem] font-bold text-slate-400 block mb-0.5 uppercase tracking-wide">
                            Alt Text
                          </label>
                          <input
                            type="text"
                            value={card.alt}
                            placeholder={card.name}
                            onChange={(e) => updateMainStoreMore(idx, { alt: e.target.value })}
                            className="admin-input text-xs py-1 px-2 w-full"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[0.65rem] font-bold text-slate-400 block mb-0.5 uppercase tracking-wide">
                              Eyebrow
                            </label>
                            <input
                              type="text"
                              value={card.eyebrow}
                              onChange={(e) => updateMainStoreMore(idx, { eyebrow: e.target.value })}
                              className="admin-input text-xs py-1 px-2 w-full"
                            />
                          </div>
                          <div>
                            <label className="text-[0.65rem] font-bold text-slate-400 block mb-0.5 uppercase tracking-wide">
                              Name
                            </label>
                            <input
                              type="text"
                              value={card.name}
                              onChange={(e) => updateMainStoreMore(idx, { name: e.target.value })}
                              className="admin-input text-xs py-1 px-2 w-full"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="text-[0.65rem] font-bold text-slate-400 block mb-0.5 uppercase tracking-wide">
                            Statement / Subtitle
                          </label>
                          <input
                            type="text"
                            value={card.statement}
                            onChange={(e) => updateMainStoreMore(idx, { statement: e.target.value })}
                            className="admin-input text-xs py-1 px-2 w-full"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 4. Product Family Strip (6 items) */}
          {activeMainStoreSection === "families" && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Product Family Strip ({(mainStoreConfig.productFamilies || defaultMainStoreConfig.productFamilies).length} Items)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Top horizontal category icons representing iPhone, Mac, iPad, Apple Watch, AirPods, and Accessories.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {(mainStoreConfig.productFamilies || defaultMainStoreConfig.productFamilies).map((fam, idx) => {
                  const defaultImg = defaultMainStoreConfig.productFamilies[idx]?.image || "";
                  const isCustom = Boolean(fam.image && fam.image !== defaultImg);
                  const isUploading = uploadingTarget === `ms-family-${idx}`;

                  return (
                    <div
                      key={fam.id || idx}
                      className="admin-card p-4 space-y-3 border border-slate-200 flex flex-col justify-between rounded-2xl bg-white shadow-sm"
                    >
                      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-[0.65rem] font-bold text-slate-700 uppercase">
                          Family #{idx + 1} • {fam.name}
                        </span>
                        {isCustom ? (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[0.65rem] font-bold">
                            Custom Image
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 text-[0.65rem] font-medium">
                            Default Asset
                          </span>
                        )}
                      </div>

                      {/* Live Preview Box */}
                      <div className="h-32 bg-slate-50 rounded-xl overflow-hidden flex items-center justify-center border border-slate-200 relative p-3">
                        {fam.image ? (
                          <img
                            src={fam.image}
                            alt={fam.alt || fam.name}
                            className="max-h-full max-w-full object-contain"
                          />
                        ) : (
                          <span className="text-xs text-slate-400">No Image Assigned</span>
                        )}
                      </div>

                      {/* Image Management Actions */}
                      <div className="space-y-2 pt-1">
                        <div className="flex items-center gap-2">
                          <label className="flex-1 py-1.5 px-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold flex items-center justify-center gap-1.5 transition text-[0.7rem] cursor-pointer">
                            <Upload size={13} />
                            <span>{isUploading ? "Uploading..." : "Upload Icon"}</span>
                            <input
                              type="file"
                              accept="image/jpeg,image/png,image/webp,image/avif"
                              disabled={uploadingTarget !== null}
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) void handleMainStoreFileUpload("family", idx, file, fam.name);
                              }}
                              className="hidden"
                            />
                          </label>

                          <button
                            type="button"
                            onClick={() => setMediaPickerTarget({ type: "main-store-family", index: idx })}
                            className="flex-1 py-1.5 px-2 rounded-lg bg-[#d4af37]/15 hover:bg-[#d4af37]/25 text-amber-900 font-bold flex items-center justify-center gap-1.5 transition text-[0.7rem]"
                          >
                            <ImageIcon size={13} />
                            <span>Media Library</span>
                          </button>
                        </div>

                        {isCustom && (
                          <button
                            type="button"
                            onClick={() => updateMainStoreFamily(idx, { image: defaultImg, alt: defaultMainStoreConfig.productFamilies[idx]?.alt || "" })}
                            className="w-full py-1 text-[0.68rem] text-rose-600 hover:text-rose-800 font-semibold flex items-center justify-center gap-1"
                          >
                            <RotateCcw size={12} />
                            <span>Reset to Default Icon</span>
                          </button>
                        )}
                      </div>

                      {/* Metadata Inputs */}
                      <div className="space-y-2 pt-2 border-t border-slate-100">
                        <div>
                          <label className="text-[0.65rem] font-bold text-slate-400 block mb-0.5 uppercase tracking-wide">
                            Image URL
                          </label>
                          <input
                            type="text"
                            value={fam.image}
                            placeholder={defaultImg}
                            onChange={(e) => updateMainStoreFamily(idx, { image: e.target.value })}
                            className="admin-input text-xs py-1 px-2 w-full font-mono"
                          />
                        </div>

                        <div>
                          <label className="text-[0.65rem] font-bold text-slate-400 block mb-0.5 uppercase tracking-wide">
                            Alt Text
                          </label>
                          <input
                            type="text"
                            value={fam.alt}
                            placeholder={fam.name}
                            onChange={(e) => updateMainStoreFamily(idx, { alt: e.target.value })}
                            className="admin-input text-xs py-1 px-2 w-full"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[0.65rem] font-bold text-slate-400 block mb-0.5 uppercase tracking-wide">
                              Name
                            </label>
                            <input
                              type="text"
                              value={fam.name}
                              onChange={(e) => updateMainStoreFamily(idx, { name: e.target.value })}
                              className="admin-input text-xs py-1 px-2 w-full"
                            />
                          </div>
                          <div>
                            <label className="text-[0.65rem] font-bold text-slate-400 block mb-0.5 uppercase tracking-wide">
                              Path
                            </label>
                            <input
                              type="text"
                              value={fam.path}
                              onChange={(e) => updateMainStoreFamily(idx, { path: e.target.value })}
                              className="admin-input text-xs py-1 px-2 w-full font-mono"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 5. Featured Accessories (8 cards) */}
          {activeMainStoreSection === "accessories" && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Featured Accessories Carousel ({(mainStoreConfig.accessories || defaultMainStoreConfig.accessories).length} Cards)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Essential accessories showcased on the main Store page. Promotional card images can be customized without altering product catalog images.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {(mainStoreConfig.accessories || defaultMainStoreConfig.accessories).map((acc, idx) => {
                  const preview = resolveMainStoreAccessoryPreview(acc);
                  const isUploading = uploadingTarget === `ms-accessory-${idx}`;

                  return (
                    <div
                      key={acc.id || idx}
                      className="admin-card p-4 space-y-3 border border-slate-200 flex flex-col justify-between rounded-2xl bg-white shadow-sm"
                    >
                      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-[0.65rem] font-bold text-slate-700 uppercase">
                          Accessory #{idx + 1} • {preview.displayName}
                        </span>
                        {preview.isCustom ? (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[0.65rem] font-bold">
                            Custom Image
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 text-[0.65rem] font-medium">
                            Catalog Image
                          </span>
                        )}
                      </div>

                      {/* Live Preview Box */}
                      <div className="aspect-[16/10] bg-slate-50 rounded-xl overflow-hidden flex items-center justify-center border border-slate-200 relative p-2">
                        {preview.src ? (
                          <img
                            src={preview.src}
                            alt={acc.alt || preview.displayName}
                            className="max-h-full max-w-full object-contain"
                          />
                        ) : (
                          <span className="text-xs text-slate-400">No Image Assigned</span>
                        )}
                      </div>

                      {/* Image Management Actions */}
                      <div className="space-y-2 pt-1">
                        <div className="flex items-center gap-2">
                          <label className="flex-1 py-1.5 px-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold flex items-center justify-center gap-1.5 transition text-[0.7rem] cursor-pointer">
                            <Upload size={13} />
                            <span>{isUploading ? "Uploading..." : "Upload Photo"}</span>
                            <input
                              type="file"
                              accept="image/jpeg,image/png,image/webp,image/avif"
                              disabled={uploadingTarget !== null}
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) void handleMainStoreFileUpload("accessory", idx, file, preview.displayName);
                              }}
                              className="hidden"
                            />
                          </label>

                          <button
                            type="button"
                            onClick={() => setMediaPickerTarget({ type: "main-store-accessory", index: idx })}
                            className="flex-1 py-1.5 px-2 rounded-lg bg-[#d4af37]/15 hover:bg-[#d4af37]/25 text-amber-900 font-bold flex items-center justify-center gap-1.5 transition text-[0.7rem]"
                          >
                            <ImageIcon size={13} />
                            <span>Media Library</span>
                          </button>
                        </div>

                        {preview.isCustom && (
                          <button
                            type="button"
                            onClick={() => updateMainStoreAccessory(idx, { image: "", alt: defaultMainStoreConfig.accessories[idx]?.alt || "" })}
                            className="w-full py-1 text-[0.68rem] text-rose-600 hover:text-rose-800 font-semibold flex items-center justify-center gap-1"
                          >
                            <RotateCcw size={12} />
                            <span>Reset to Default Image</span>
                          </button>
                        )}
                      </div>

                      {/* Metadata Inputs */}
                      <div className="space-y-2 pt-2 border-t border-slate-100">
                        <div>
                          <label className="text-[0.65rem] font-bold text-slate-400 block mb-0.5 uppercase tracking-wide">
                            Image URL
                          </label>
                          <input
                            type="text"
                            value={acc.image || ""}
                            placeholder={preview.src}
                            onChange={(e) => updateMainStoreAccessory(idx, { image: e.target.value })}
                            className="admin-input text-xs py-1 px-2 w-full font-mono"
                          />
                        </div>

                        <div>
                          <label className="text-[0.65rem] font-bold text-slate-400 block mb-0.5 uppercase tracking-wide">
                            Alt Text
                          </label>
                          <input
                            type="text"
                            value={acc.alt || ""}
                            placeholder={preview.displayName}
                            onChange={(e) => updateMainStoreAccessory(idx, { alt: e.target.value })}
                            className="admin-input text-xs py-1 px-2 w-full"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[0.65rem] font-bold text-slate-400 block mb-0.5 uppercase tracking-wide">
                              Eyebrow
                            </label>
                            <input
                              type="text"
                              value={acc.eyebrow || ""}
                              onChange={(e) => updateMainStoreAccessory(idx, { eyebrow: e.target.value })}
                              className="admin-input text-xs py-1 px-2 w-full"
                            />
                          </div>
                          <div>
                            <label className="text-[0.65rem] font-bold text-slate-400 block mb-0.5 uppercase tracking-wide">
                              Display Name
                            </label>
                            <input
                              type="text"
                              value={acc.name || ""}
                              placeholder={preview.displayName}
                              onChange={(e) => updateMainStoreAccessory(idx, { name: e.target.value })}
                              className="admin-input text-xs py-1 px-2 w-full"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="text-[0.65rem] font-bold text-slate-400 block mb-0.5 uppercase tracking-wide">
                            Catalog Slug
                          </label>
                          <input
                            type="text"
                            disabled
                            value={acc.id}
                            className="admin-input text-xs py-1 px-2 w-full font-mono bg-slate-50 text-slate-500 cursor-not-allowed"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ===================== SECTION 1: FEATURED SHOWCASE CARDS (DEPARTMENTS) ===================== */}
      {selectedDeptKey !== "main-store" && activeSection === "featured" && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Explore the {currentDept.label} Lineup ({currentDept.featuredCards.length} Cards)
              </h3>
              <p className="text-xs text-slate-500">
                Large horizontal featured cards shown in the carousel at the top of the {currentDept.label} Store page.
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


          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {currentDept.featuredCards.map((card, idx) => (
              <div
                key={card.id || idx}
                className="admin-card p-4 space-y-3 border border-slate-200 flex flex-col justify-between rounded-2xl bg-white shadow-sm"
              >
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="px-2 py-0.5 rounded bg-slate-100 text-[0.65rem] font-bold text-slate-700 uppercase">
                    Card #{idx + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeFeaturedCard(idx)}
                    className="p-1 rounded text-rose-500 hover:text-rose-700 hover:bg-rose-50"
                    title="Remove card"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>

                {/* Live Preview Stage */}
                <div className="aspect-[16/10] bg-slate-50 rounded-xl overflow-hidden flex items-center justify-center border border-slate-200 relative p-2">
                  {card.image ? (
                    <img
                      src={card.image}
                      alt={card.alt || card.title}
                      className="max-h-full max-w-full object-contain"
                    />
                  ) : (
                    <span className="text-xs text-slate-400">No Image Assigned</span>
                  )}
                  {card.badge && (
                    <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-slate-900 text-white font-bold text-[0.65rem] shadow">
                      {card.badge}
                    </span>
                  )}
                </div>

                {/* Image Management Actions */}
                <div className="flex items-center gap-2 pt-1">
                  <label className="flex-1 py-1.5 px-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold flex items-center justify-center gap-1.5 transition text-[0.7rem] cursor-pointer">
                    <Upload size={13} />
                    <span>
                      {uploadingTarget === `card-${idx}` ? "Uploading..." : "Upload New Image"}
                    </span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/avif"
                      disabled={uploadingTarget !== null}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) void handleFeaturedCardFileUpload(idx, file);
                      }}
                      className="hidden"
                    />
                  </label>

                  <button
                    type="button"
                    onClick={() => setMediaPickerTarget({ type: "card", cardIndex: idx })}
                    className="flex-1 py-1.5 px-2 rounded-lg bg-[#d4af37]/15 hover:bg-[#d4af37]/25 text-amber-900 font-bold flex items-center justify-center gap-1.5 transition text-[0.7rem]"
                  >
                    <ImageIcon size={13} />
                    <span>Media Library</span>
                  </button>
                </div>

                {/* Card Fields */}
                <div className="space-y-2 text-xs pt-1 border-t border-slate-100">
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
                    <label className="block font-bold text-slate-700 mb-0.5">Subtitle</label>
                    <input
                      type="text"
                      value={card.subtitle}
                      onChange={(e) => updateFeaturedCard(idx, { subtitle: e.target.value })}
                      className="w-full p-1.5 rounded border border-slate-200 bg-white text-slate-600"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
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
                      <label className="block font-bold text-slate-700 mb-0.5">Badge</label>
                      <input
                        type="text"
                        value={card.badge || ""}
                        onChange={(e) => updateFeaturedCard(idx, { badge: e.target.value })}
                        className="w-full p-1.5 rounded border border-slate-200 bg-white"
                        placeholder="In Stock, New..."
                      />
                    </div>
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

                  <div>
                    <label className="block font-bold text-slate-700 mb-0.5">Image URL</label>
                    <input
                      type="text"
                      value={card.image}
                      onChange={(e) => updateFeaturedCard(idx, { image: e.target.value })}
                      className="w-full p-1.5 rounded border border-slate-200 bg-white font-mono text-[0.68rem] text-slate-500"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===================== SECTION 2: ALL PRODUCT LISTINGS ===================== */}
      {selectedDeptKey !== "main-store" && activeSection === "listings" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                All {currentDept.label} Listings ({categoryProducts.length} Products)
              </h3>
              <p className="text-xs text-slate-500">
                Replace main images or manage photo galleries for products appearing on the /{selectedDeptKey} listing grid and product detail pages.
              </p>
            </div>

            <div className="relative w-full sm:w-64">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search models..."
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-white"
              />
            </div>
          </div>

          {productSaveSuccess && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 size={15} />
              <span>{productSaveSuccess}</span>
            </div>
          )}

          {productSaveError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
              <AlertCircle size={15} />
              <span>{productSaveError}</span>
            </div>
          )}

          <div className="space-y-3">
            {categoryProducts
              .filter((p) => !productSearch || p.name.toLowerCase().includes(productSearch.toLowerCase()) || p.slug.includes(productSearch.toLowerCase()))
              .map((product) => {
                const imgState = getProductImageState(product);
                const isExpanded = editingProductId === product.id;
                const resolvedPrimary =
                  imgState.images[imgState.primaryIndex]?.src ||
                  resolveCatalogueProductImage(product)?.src ||
                  resolveProductImage(product)?.src;

                return (
                  <div
                    key={product.id}
                    className="admin-card p-4 rounded-xl border border-slate-200 bg-white space-y-3 transition-all"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-14 h-14 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center p-1 shrink-0 overflow-hidden">
                          {resolvedPrimary ? (
                            <img
                              src={resolvedPrimary}
                              alt={product.name}
                              className="max-h-full max-w-full object-contain"
                            />
                          ) : (
                            <ImageIcon size={20} className="text-slate-300" />
                          )}
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-slate-900 text-xs truncate">{product.name}</h4>
                            <span className={`text-[0.65rem] px-1.5 py-0.2 rounded font-bold ${
                              product.condition === "Brand New"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : "bg-amber-50 text-amber-700 border border-amber-200"
                            }`}>
                              {product.condition}
                            </span>
                          </div>
                          <p className="text-[0.68rem] text-slate-500 font-mono truncate">
                            slug: {product.slug} • {imgState.images.length} custom image{imgState.images.length === 1 ? "" : "s"}
                          </p>
                          <p className="text-[0.7rem] font-bold text-emerald-700">
                            {product.priceOnRequest ? "Contact for price" : formatGhs(product.price)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => setEditingProductId(isExpanded ? null : product.id)}
                          className="admin-btn admin-btn-sm admin-btn-secondary text-xs"
                        >
                          <Edit size={13} />
                          <span>{isExpanded ? "Hide Image Editor" : "Manage Images"}</span>
                        </button>
                      </div>
                    </div>

                    {/* Expanded Image Management Sub-Panel */}
                    {isExpanded && (
                      <div className="pt-3 border-t border-slate-100 space-y-4">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="text-xs font-bold text-slate-700">
                            Product Images Gallery ({imgState.images.length})
                          </span>

                          <div className="flex items-center gap-2">
                            <label className="admin-btn admin-btn-sm admin-btn-secondary text-xs cursor-pointer inline-flex items-center gap-1.5">
                              <Upload size={13} />
                              <span>{uploadingTarget === `product-${product.id}` ? "Uploading..." : "Upload Photos"}</span>
                              <input
                                type="file"
                                accept="image/jpeg,image/png,image/webp,image/avif"
                                multiple
                                disabled={uploadingTarget !== null}
                                onChange={(e) => void handleProductListingUpload(product, e.target.files)}
                                className="hidden"
                              />
                            </label>

                            <button
                              type="button"
                              onClick={() => setMediaPickerTarget({ type: "product", productId: product.id })}
                              className="admin-btn admin-btn-sm admin-btn-secondary text-xs inline-flex items-center gap-1.5"
                            >
                              <ImageIcon size={13} />
                              <span>Pick from Media Library</span>
                            </button>

                            <button
                              type="button"
                              disabled={savingProductId === product.id}
                              onClick={() => void handleSaveProductImages(product)}
                              className="admin-btn admin-btn-sm admin-btn-primary text-xs inline-flex items-center gap-1.5"
                            >
                              <Save size={13} />
                              <span>{savingProductId === product.id ? "Saving..." : "Save Product Images"}</span>
                            </button>
                          </div>
                        </div>

                        {imgState.images.length === 0 ? (
                          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-500 flex items-center gap-2">
                            <AlertCircle size={14} className="text-amber-500 shrink-0" />
                            <span>Currently displaying the built-in clean catalogue render. Upload or select an image from the Media Library above to override it.</span>
                          </div>
                        ) : (
                          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                            {imgState.images.map((img, imgIdx) => {
                              const isPrimary = imgState.primaryIndex === imgIdx;
                              return (
                                <div
                                  key={imgIdx}
                                  className={`p-2 rounded-xl bg-white border relative ${
                                    isPrimary ? "border-[#d4af37] ring-2 ring-[#d4af37]/20" : "border-slate-200"
                                  }`}
                                >
                                  <div className="aspect-square rounded-lg bg-slate-50 overflow-hidden flex items-center justify-center p-1 mb-2">
                                    <img
                                      src={img.src}
                                      alt={img.alt || product.name}
                                      className="max-h-full max-w-full object-contain"
                                    />
                                  </div>

                                  <div className="space-y-1">
                                    <button
                                      type="button"
                                      onClick={() => setProductImageStateFor(product.id, imgState.images, imgIdx)}
                                      className={`w-full py-0.5 rounded text-[0.65rem] font-bold ${
                                        isPrimary
                                          ? "bg-[#d4af37] text-white"
                                          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                                      }`}
                                    >
                                      {isPrimary ? "Primary Image" : "Set Primary"}
                                    </button>

                                    <div className="flex items-center justify-between text-[0.65rem] text-slate-400">
                                      <div className="flex items-center gap-1">
                                        {imgIdx > 0 && (
                                          <button
                                            type="button"
                                            onClick={() => {
                                              const next = [...imgState.images];
                                              [next[imgIdx], next[imgIdx - 1]] = [next[imgIdx - 1], next[imgIdx]];
                                              setProductImageStateFor(product.id, next, imgState.primaryIndex === imgIdx ? imgIdx - 1 : imgState.primaryIndex === imgIdx - 1 ? imgIdx : imgState.primaryIndex);
                                            }}
                                            className="p-0.5 hover:text-slate-900"
                                            title="Move left"
                                          >
                                            <ArrowLeft size={11} />
                                          </button>
                                        )}
                                        {imgIdx < imgState.images.length - 1 && (
                                          <button
                                            type="button"
                                            onClick={() => {
                                              const next = [...imgState.images];
                                              [next[imgIdx], next[imgIdx + 1]] = [next[imgIdx + 1], next[imgIdx]];
                                              setProductImageStateFor(product.id, next, imgState.primaryIndex === imgIdx ? imgIdx + 1 : imgState.primaryIndex === imgIdx + 1 ? imgIdx : imgState.primaryIndex);
                                            }}
                                            className="p-0.5 hover:text-slate-900"
                                            title="Move right"
                                          >
                                            <ArrowRight size={11} />
                                          </button>
                                        )}
                                      </div>

                                      <button
                                        type="button"
                                        onClick={() => {
                                          const next = imgState.images.filter((_, i) => i !== imgIdx);
                                          const nextPrimary = Math.max(0, Math.min(imgState.primaryIndex, next.length - 1));
                                          setProductImageStateFor(product.id, next, nextPrimary);
                                        }}
                                        className="text-rose-500 hover:text-rose-700 font-bold"
                                      >
                                        Remove
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* ===================== SECTION 3: ESSENTIAL ACCESSORIES ===================== */}
      {selectedDeptKey !== "main-store" && activeSection === "accessories" && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Essential {currentDept.label} Accessories ({categoryAccessories.length} Cards)
              </h3>
              <p className="text-xs text-slate-500">
                Replace &quot;Image coming soon&quot; placeholders with actual photos. Assign images to each accessory from the Media Library or upload new ones.
              </p>
            </div>

            <button
              type="button"
              disabled={saving}
              onClick={handleSaveStorefront}
              className="admin-btn admin-btn-sm admin-btn-primary"
            >
              <Save size={14} />
              <span>Save Accessories Changes</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {categoryAccessories.map((acc) => {
              const currentOverrides = currentDept.accessoryOverrides || {};
              const override = currentOverrides[acc.slug];
              const catalogProduct = activeProducts.find((p) => p.slug === acc.slug);

              const resolvedImageSrc =
                override?.image ||
                (catalogProduct ? resolveCatalogueProductImage(catalogProduct)?.src : undefined) ||
                resolveCatalogueProductImage(acc)?.src ||
                resolveProductImage(acc)?.src;

              const isCustomized = Boolean(override?.image);

              return (
                <div
                  key={acc.slug}
                  className={`admin-card p-4 space-y-3 border rounded-2xl bg-white shadow-sm flex flex-col justify-between ${
                    isCustomized ? "border-[#d4af37] ring-1 ring-[#d4af37]/30" : "border-slate-200"
                  }`}
                >
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-[0.65rem] font-bold text-slate-700 uppercase">
                      {acc.subcategory || "Accessory"}
                    </span>
                    {isCustomized ? (
                      <span className="text-[0.65rem] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                        Admin Image Active
                      </span>
                    ) : (
                      <span className="text-[0.65rem] font-bold px-2 py-0.5 rounded bg-slate-50 text-slate-500 border border-slate-200">
                        Default Genuine Asset
                      </span>
                    )}
                  </div>

                  {/* Live Visual Stage */}
                  <div className="aspect-square bg-slate-50 rounded-xl overflow-hidden flex items-center justify-center border border-slate-200 relative p-3">
                    {resolvedImageSrc ? (
                      <img
                        src={resolvedImageSrc}
                        alt={override?.alt || acc.name}
                        className="max-h-full max-w-full object-contain"
                      />
                    ) : (
                      <div className="text-center p-3 text-slate-400">
                        <ImageIcon size={28} className="mx-auto mb-1 text-slate-300" />
                        <span className="text-xs font-bold block">Image coming soon</span>
                        <span className="text-[0.65rem]">Upload photo below</span>
                      </div>
                    )}
                  </div>

                  {/* Title & Info */}
                  <div className="space-y-1">
                    <h4 className="font-bold text-slate-900 text-xs">{override?.name || acc.name}</h4>
                    <p className="text-[0.65rem] text-slate-400 font-mono">slug: {acc.slug}</p>
                    <p className="text-xs font-bold text-emerald-700">
                      {override?.price || (acc.priceOnRequest || acc.price <= 0 ? "Contact for price" : formatGhs(acc.price))}
                    </p>
                  </div>

                  {/* Action Controls */}
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <div className="flex items-center gap-2">
                      <label className="flex-1 py-1.5 px-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold flex items-center justify-center gap-1.5 transition text-[0.7rem] cursor-pointer">
                        <Upload size={13} />
                        <span>
                          {uploadingTarget === `accessory-${acc.slug}` ? "Uploading..." : "Upload Photo"}
                        </span>
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp,image/avif"
                          disabled={uploadingTarget !== null}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) void handleAccessoryFileUpload(acc.slug, file, acc.name);
                          }}
                          className="hidden"
                        />
                      </label>

                      <button
                        type="button"
                        onClick={() => setMediaPickerTarget({ type: "accessory", slug: acc.slug })}
                        className="flex-1 py-1.5 px-2 rounded-lg bg-[#d4af37]/15 hover:bg-[#d4af37]/25 text-amber-900 font-bold flex items-center justify-center gap-1.5 transition text-[0.7rem]"
                      >
                        <ImageIcon size={13} />
                        <span>Media Library</span>
                      </button>
                    </div>

                    {isCustomized && (
                      <button
                        type="button"
                        onClick={() => removeAccessoryOverride(acc.slug)}
                        className="w-full py-1 text-[0.68rem] text-rose-600 hover:text-rose-800 font-semibold"
                      >
                        Reset to Default Image
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Global Bottom Save Action */}
      <div className="p-4 rounded-xl bg-white border border-slate-200 flex items-center justify-between shadow-sm">
        <div>
          <span className="text-xs font-bold text-slate-900 block">
            Save All Storefront Changes
          </span>
          <span className="text-[0.68rem] text-slate-500">
            Updates department configuration, carousel featured cards, and accessory cards live in Supabase.
          </span>
        </div>
        <button
          type="button"
          disabled={saving}
          onClick={handleSaveStorefront}
          className="admin-btn admin-btn-primary text-xs"
        >
          <Save size={15} />
          <span>{saving ? "Saving Changes..." : "Save Storefront Changes"}</span>
        </button>
      </div>

      {/* Unified Media Picker Modal */}
      {mediaPickerTarget !== null && (
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
                <h3 className="font-bold text-slate-900 text-sm">
                  {mediaPickerTarget.type === "card"
                    ? "Select Image for Featured Showcase Card"
                    : mediaPickerTarget.type === "accessory"
                    ? "Select Image for Accessory Card"
                    : mediaPickerTarget.type === "product"
                    ? "Select Image for Product Listing"
                    : mediaPickerTarget.type === "main-store-latest"
                    ? "Select Image for Main Store 'The Latest' Card"
                    : mediaPickerTarget.type === "main-store-category"
                    ? "Select Image for Main Store 'Shop by Category' Card"
                    : mediaPickerTarget.type === "main-store-more"
                    ? "Select Image for Main Store 'More to Love' Card"
                    : mediaPickerTarget.type === "main-store-family"
                    ? "Select Image for Main Store Product Family Strip"
                    : "Select Image for Main Store Accessory Card"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setMediaPickerTarget(null)}
                className="p-1 text-slate-400 hover:text-slate-900"
              >
                <X size={18} />
              </button>
            </div>

            <AdminMediaLibrary isPicker onSelect={handleMediaPickerSelect} />
          </div>
        </div>
      )}
    </div>
  );
}
