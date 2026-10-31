import {
  AlertCircle,
  ArrowDown,
  ArrowUp,
  Check,
  CheckCircle2,
  Copy,
  Edit,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Layers,
  Layout,
  Monitor,
  Package,
  Plus,
  RotateCcw,
  Save,
  Search,
  Smartphone,
  Sparkles,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { isAppleCatalogueProduct } from "../../catalog/catalogueDiscovery";
import { isProductPurchasable } from "../../catalog/productCatalog";
import { defaultMainStoreConfig, defaultStorePageSections } from "../../cms/defaultCmsData";
import type {
  MainStoreConfig,
  MediaItem,
  StorePageSection,
  StorePageSectionType,
  StoreSectionLayoutStyle,
} from "../../cms/types";
import type { Product } from "../../types/product";
import { resolveCatalogueProductImage, resolveProductImage } from "../../utils/productImages";
import { getCardPriceDisplay } from "../../utils/productPricing";
import { AdminMediaLibrary } from "../../pages/admin/AdminMediaLibrary";
import { StorePageRenderer } from "../store/StorePageRenderer";
import { ProductFamilyStripEditor } from "./ProductFamilyStripEditor";
import "../../styles/store.css";

export interface SectionTypeOption {
  type: StorePageSectionType;
  label: string;
  description: string;
  defaultHeading: string;
  defaultEyebrow: string;
  defaultSubtitle: string;
  defaultLayout: StoreSectionLayoutStyle;
  defaultButtonLabel?: string;
  defaultButtonDestination?: string;
}

export const SECTION_TYPE_OPTIONS: SectionTypeOption[] = [
  {
    type: "hero-banner",
    label: "Hero Banner",
    description: "High-impact headline banner with desktop & mobile imagery and call-to-action buttons.",
    defaultHeading: "Store. The best way to buy the products you love.",
    defaultEyebrow: "FEATURED CAMPAIGN",
    defaultSubtitle: "Explore flagship Apple devices with verified Accra inventory and official warranty support.",
    defaultLayout: "split",
    defaultButtonLabel: "Explore Now",
    defaultButtonDestination: "/iphone",
  },
  {
    type: "featured-products",
    label: "Featured Products",
    description: "Curated showcase of flagship catalog products with canonical Buy and Learn More links.",
    defaultHeading: "Featured Devices.",
    defaultEyebrow: "HANDPICKED FOR YOU",
    defaultSubtitle: "Discover our most popular hardware available right now at Buy & Sell GH.",
    defaultLayout: "grid-3",
    defaultButtonLabel: "Shop All iPhone",
    defaultButtonDestination: "/iphone",
  },
  {
    type: "new-arrivals",
    label: "New Arrivals",
    description: "Highlight the newest devices and fresh shipments added to the Store catalog.",
    defaultHeading: "New Arrivals. Fresh in Accra.",
    defaultEyebrow: "JUST LANDED",
    defaultSubtitle: "Be the first to experience the latest generation hardware.",
    defaultLayout: "grid-3",
    defaultButtonLabel: "View Latest",
    defaultButtonDestination: "/iphone",
  },
  {
    type: "product-collection",
    label: "Product Collection",
    description: "Group related devices or accessories into a themed Store collection grid.",
    defaultHeading: "The Pro Collection.",
    defaultEyebrow: "CURATED COLLECTION",
    defaultSubtitle: "Built for creators, professionals, and power users.",
    defaultLayout: "grid-3",
    defaultButtonLabel: "Explore Collection",
    defaultButtonDestination: "/mac",
  },
  {
    type: "promotional-image",
    label: "Promotional Image",
    description: "Wide visual showcase banner for seasonal campaigns, trade-in offers, or announcements.",
    defaultHeading: "Upgrade & Trade In with Confidence.",
    defaultEyebrow: "SPECIAL CAMPAIGN",
    defaultSubtitle: "Trade in your eligible device toward your next Apple upgrade in Accra.",
    defaultLayout: "full-bleed",
    defaultButtonLabel: "Estimate Trade-In",
    defaultButtonDestination: "/sell-or-trade",
  },
  {
    type: "product-carousel",
    label: "Product Carousel",
    description: "Interactive horizontal swipeable row of canonical Store products.",
    defaultHeading: "Trending in the Store.",
    defaultEyebrow: "POPULAR PICKS",
    defaultSubtitle: "Swipe through customer favorites across iPhone, Mac, iPad, and Watch.",
    defaultLayout: "carousel",
    defaultButtonLabel: "View All",
    defaultButtonDestination: "/store",
  },
  {
    type: "special-offers",
    label: "Special Offers",
    description: "Spotlight limited-time offers, bundles, or featured value picks.",
    defaultHeading: "Special Store Offers.",
    defaultEyebrow: "EXCEPTIONAL VALUE",
    defaultSubtitle: "Verified devices and bundles ready for pickup or delivery.",
    defaultLayout: "grid-3",
    defaultButtonLabel: "See Offers",
    defaultButtonDestination: "/iphone",
  },
  {
    type: "image-text",
    label: "Image and Text",
    description: "Side-by-side editorial story block pairing approved photography with rich copy.",
    defaultHeading: "Expert Setup & Personal Guidance.",
    defaultEyebrow: "ACCRA SHOWROOM",
    defaultSubtitle: "Visit our East Legon showroom or chat with an Apple specialist for tailored advice.",
    defaultLayout: "split",
    defaultButtonLabel: "Contact a Specialist",
    defaultButtonDestination: "/contact",
  },
  {
    type: "category-showcase",
    label: "Category Showcase",
    description: "Visual gateway highlighting a specific Apple product family or department.",
    defaultHeading: "Explore by Department.",
    defaultEyebrow: "SHOP BY CATEGORY",
    defaultSubtitle: "Everything from iPhone and Mac to original charging accessories.",
    defaultLayout: "standard",
    defaultButtonLabel: "Browse Categories",
    defaultButtonDestination: "/iphone",
  },
];

const BACKGROUND_PRESETS = [
  { label: "Pure White", value: "#ffffff" },
  { label: "Apple Light Gray", value: "#f5f5f7" },
  { label: "Obsidian Dark", value: "#101012" },
  { label: "Soft Ivory", value: "#fbfbfd" },
  { label: "Warm Gold Tint", value: "#f9f5eb" },
];

interface StorePageSectionBuilderProps {
  mainStoreConfig: MainStoreConfig;
  setMainStoreConfig: React.Dispatch<React.SetStateAction<MainStoreConfig>>;
  hasDraft: boolean;
  onSaveDraft: (config: MainStoreConfig) => Promise<unknown>;
  onPublishLive: (config: MainStoreConfig) => Promise<unknown>;
  onDiscardDraft: () => Promise<unknown>;
  uploadMedia: (file: File, category: MediaItem["category"], title?: string) => Promise<MediaItem>;
  products: Product[];
  activeProducts: Product[];
  onSwitchSubTab?: (tab: "latest" | "categories" | "moreToLove" | "families" | "accessories") => void;
}

export function StorePageSectionBuilder({
  mainStoreConfig,
  setMainStoreConfig,
  hasDraft,
  onSaveDraft,
  onPublishLive,
  onDiscardDraft,
  uploadMedia,
  products,
  activeProducts,
  onSwitchSubTab,
}: StorePageSectionBuilderProps) {
  const sections: StorePageSection[] = useMemo(() => {
    if (mainStoreConfig.sections && mainStoreConfig.sections.length > 0) {
      return mainStoreConfig.sections;
    }
    return defaultStorePageSections;
  }, [mainStoreConfig.sections]);

  const appleCatalogProducts = useMemo(
    () => activeProducts.filter(isAppleCatalogueProduct),
    [activeProducts]
  );

  // UI state
  const [showAddModal, setShowAddModal] = useState(false);
  const [customTypeName, setCustomTypeName] = useState("");
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [confirmDeleteSection, setConfirmDeleteSection] = useState<StorePageSection | null>(null);
  const [previewMode, setPreviewMode] = useState<"none" | "desktop" | "mobile">("none");

  // Media Picker & Upload inside Section Editor
  const [mediaPickerField, setMediaPickerField] = useState<"desktopImage" | "mobileImage" | null>(null);
  const [uploadingField, setUploadingField] = useState<"desktopImage" | "mobileImage" | null>(null);

  // Media Picker & Upload for Product Family Strip
  const [uploadingFamilyIndex, setUploadingFamilyIndex] = useState<number | null>(null);
  const [mediaPickerFamilyIndex, setMediaPickerFamilyIndex] = useState<number | null>(null);

  // Product selector search inside Section Editor
  const [productQuery, setProductQuery] = useState("");

  // Save/Publish status state
  const [busyAction, setBusyAction] = useState<"draft" | "publish" | null>(null);
  const [statusBanner, setStatusBanner] = useState<{
    type: "success" | "error" | "info";
    message: string;
  } | null>(null);
  const [hasUnsavedEdits, setHasUnsavedEdits] = useState(false);

  const editingSection = useMemo(
    () => sections.find((s) => s.id === editingSectionId) || null,
    [sections, editingSectionId]
  );

  const updateSections = (nextSections: StorePageSection[]) => {
    const normalized = nextSections.map((sec, index) => ({
      ...sec,
      order: index,
    }));
    setMainStoreConfig((prev) => ({
      ...prev,
      sections: normalized,
    }));
    setHasUnsavedEdits(true);
  };

  const updateSingleSection = (sectionId: string, partial: Partial<StorePageSection>) => {
    setMainStoreConfig((prev) => {
      const currentList =
        prev.sections && prev.sections.length > 0
          ? prev.sections
          : defaultStorePageSections;
      const next = currentList.map((sec, index) =>
        sec.id === sectionId
          ? { ...sec, ...partial, order: index }
          : { ...sec, order: index }
      );
      return {
        ...prev,
        sections: next,
      };
    });
    setHasUnsavedEdits(true);
  };

  // 1. Add Section
  const handleCreateSection = (option: SectionTypeOption) => {
    const newId = `section-${option.type}-${Date.now()}`;
    const newSection: StorePageSection = {
      id: newId,
      type: option.type,
      heading: option.defaultHeading,
      eyebrow: option.defaultEyebrow,
      subtitle: option.defaultSubtitle,
      description: "",
      desktopImage: "",
      mobileImage: "",
      imageAlt: option.defaultHeading,
      backgroundColor: "#ffffff",
      textAlignment: "left",
      productIds: [],
      buttonLabel: option.defaultButtonLabel || "Explore",
      buttonDestination: option.defaultButtonDestination || "/store",
      layoutStyle: option.defaultLayout,
      visible: true,
      order: sections.length,
    };

    const next = [...sections, newSection];
    updateSections(next);
    setShowAddModal(false);
    setCustomTypeName("");
    setEditingSectionId(newId);
    setStatusBanner({
      type: "info",
      message: `Added "${option.label}" section. Configure its details below, then click Save Draft or Publish Live.`,
    });
  };

  const handleCreateCustomTypeSection = () => {
    const trimmed = customTypeName.trim();
    if (!trimmed) return;
    const slugType = trimmed.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    handleCreateSection({
      type: slugType,
      label: trimmed,
      description: "Custom section type",
      defaultHeading: `${trimmed} Showcase`,
      defaultEyebrow: trimmed.toUpperCase(),
      defaultSubtitle: "Customize this section with your approved imagery, products, and links.",
      defaultLayout: "standard",
      defaultButtonLabel: "Explore",
      defaultButtonDestination: "/store",
    });
  };

  // 2. Duplicate Section
  const handleDuplicateSection = (section: StorePageSection) => {
    const index = sections.findIndex((s) => s.id === section.id);
    const copyId = `section-copy-${Date.now()}`;
    const duplicated: StorePageSection = {
      ...section,
      id: copyId,
      // Duplicated section is a custom editable section so it can be freely customized without colliding with singleton builtInKey
      builtInKey: undefined,
      heading: `${section.heading} (Copy)`,
      productIds: [...(section.productIds || [])],
      order: index + 1,
    };
    const next = [...sections];
    next.splice(index + 1, 0, duplicated);
    updateSections(next);
    setEditingSectionId(copyId);
    setStatusBanner({
      type: "info",
      message: `Duplicated "${section.heading}". Unpublished until you click Publish Live.`,
    });
  };

  // 3. Move Up / Move Down
  const handleMoveSection = (index: number, direction: -1 | 1) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= sections.length) return;
    const next = [...sections];
    const [moved] = next.splice(index, 1);
    next.splice(targetIndex, 0, moved);
    updateSections(next);
  };

  // 4. Hide / Show
  const handleToggleVisibility = (section: StorePageSection) => {
    updateSingleSection(section.id, { visible: !section.visible });
  };

  // 5. Delete (with Confirmation)
  const handleConfirmDelete = () => {
    if (!confirmDeleteSection) return;
    const deletedTitle = confirmDeleteSection.heading;
    const next = sections.filter((s) => s.id !== confirmDeleteSection.id);
    updateSections(next);
    if (editingSectionId === confirmDeleteSection.id) {
      setEditingSectionId(null);
    }
    setConfirmDeleteSection(null);
    setStatusBanner({
      type: "info",
      message: `Removed section "${deletedTitle}" from Store Page layout. Underlying products and media files were preserved.`,
    });
  };

  // Restore missing built-in sections if any were deleted
  const missingBuiltInSections = useMemo(() => {
    const currentBuiltIns = new Set(sections.map((s) => s.builtInKey).filter(Boolean));
    return defaultStorePageSections.filter(
      (def) => def.builtInKey && !currentBuiltIns.has(def.builtInKey)
    );
  }, [sections]);

  const handleRestoreBuiltInSections = () => {
    if (missingBuiltInSections.length === 0) return;
    updateSections([...sections, ...missingBuiltInSections]);
    setStatusBanner({
      type: "info",
      message: `Restored ${missingBuiltInSections.length} default Store section(s).`,
    });
  };

  // File upload for Desktop / Mobile image in Section Editor
  const handleSectionImageUpload = async (
    field: "desktopImage" | "mobileImage",
    file: File
  ) => {
    if (!editingSection) return;
    setUploadingField(field);
    setStatusBanner(null);
    try {
      const label = `${editingSection.heading} (${field === "desktopImage" ? "Desktop" : "Mobile"})`;
      const uploaded = await uploadMedia(file, "storefront", label);
      updateSingleSection(editingSection.id, {
        [field]: uploaded.url,
        imageAlt: editingSection.imageAlt || uploaded.alt || uploaded.title || editingSection.heading,
      });
      setStatusBanner({
        type: "success",
        message: `${field === "desktopImage" ? "Desktop" : "Mobile"} image uploaded. Remember to Save Draft or Publish Live.`,
      });
    } catch (err) {
      setStatusBanner({
        type: "error",
        message: err instanceof Error ? err.message : "Failed to upload section image.",
      });
    } finally {
      setUploadingField(null);
    }
  };

  // File upload for Product Family Strip Category Image
  const handleFamilyFileUpload = async (
    index: number,
    file: File,
    label: string
  ) => {
    setUploadingFamilyIndex(index);
    setStatusBanner(null);
    try {
      const uploaded = await uploadMedia(
        file,
        "storefront",
        `${label} Category Image`
      );
      const currentFamilies = [
        ...(mainStoreConfig.productFamilies ||
          defaultMainStoreConfig.productFamilies),
      ];
      currentFamilies[index] = {
        ...currentFamilies[index],
        image: uploaded.url,
        alt: uploaded.alt || `${label} category`,
      };
      setMainStoreConfig((prev) => ({
        ...prev,
        productFamilies: currentFamilies,
      }));
      setHasUnsavedEdits(true);
      setStatusBanner({
        type: "success",
        message: `Updated ${label} image. Remember to click Publish Live or Save Draft.`,
      });
    } catch (err) {
      setStatusBanner({
        type: "error",
        message:
          err instanceof Error
            ? err.message
            : `Failed to upload image for ${label}.`,
      });
    } finally {
      setUploadingFamilyIndex(null);
    }
  };

  // Reset Product Family Category Image to Approved Default
  const handleResetFamilyImage = (index: number) => {
    const currentFamilies = [
      ...(mainStoreConfig.productFamilies ||
        defaultMainStoreConfig.productFamilies),
    ];
    const defaultItem = defaultMainStoreConfig.productFamilies[index];
    currentFamilies[index] = {
      ...currentFamilies[index],
      image: defaultItem?.image || "",
      alt: defaultItem?.alt || "",
    };
    setMainStoreConfig((prev) => ({
      ...prev,
      productFamilies: currentFamilies,
    }));
    setHasUnsavedEdits(true);
    setStatusBanner({
      type: "info",
      message: `Reset ${defaultItem?.name || "category"} to default image. Remember to click Publish Live.`,
    });
  };

  // Toggle product selection in Section Editor
  const handleToggleProductInSection = (productId: string) => {
    if (!editingSection) return;
    const current = editingSection.productIds || [];
    const exists = current.includes(productId);
    const nextIds = exists
      ? current.filter((id) => id !== productId)
      : [...current, productId];
    updateSingleSection(editingSection.id, { productIds: nextIds });
  };

  // Save Draft handler
  const handleSaveDraftClick = async () => {
    setBusyAction("draft");
    setStatusBanner(null);
    try {
      const configToSave: MainStoreConfig = {
        ...mainStoreConfig,
        sections,
      };
      await onSaveDraft(configToSave);
      setHasUnsavedEdits(false);
      setStatusBanner({
        type: "success",
        message:
          "Draft saved! Your changes are stored safely in Admin and will NOT appear on the public Store homepage until you click Publish Live.",
      });
    } catch (err) {
      setStatusBanner({
        type: "error",
        message: err instanceof Error ? err.message : "Failed to save Store Page draft.",
      });
    } finally {
      setBusyAction(null);
    }
  };

  // Publish Live handler
  const handlePublishLiveClick = async () => {
    setBusyAction("publish");
    setStatusBanner(null);
    try {
      const configToPublish: MainStoreConfig = {
        ...mainStoreConfig,
        sections,
      };
      await onPublishLive(configToPublish);
      setHasUnsavedEdits(false);
      setStatusBanner({
        type: "success",
        message:
          "Published Live! The public Store homepage (/store) now reflects your latest section order, images, and content.",
      });
    } catch (err) {
      setStatusBanner({
        type: "error",
        message:
          err instanceof Error
            ? `Publish failed: ${err.message}`
            : "Failed to publish Store Page sections live.",
      });
    } finally {
      setBusyAction(null);
    }
  };

  // Filtered catalog products for the Section Editor product picker
  const filteredCatalogProducts = useMemo(() => {
    const q = productQuery.trim().toLowerCase();
    const list = products.filter((p) => !p.archived);
    if (!q) return list.slice(0, 36);
    return list
      .filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.slug.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          (p.subcategory || "").toLowerCase().includes(q)
      )
      .slice(0, 48);
  }, [products, productQuery]);

  const formatSectionTypeBadge = (sec: StorePageSection) => {
    if (sec.builtInKey) {
      return "Built-In Store Section";
    }
    const found = SECTION_TYPE_OPTIONS.find((o) => o.type === sec.type);
    return found ? found.label : sec.type.replace(/-/g, " ");
  };

  return (
    <div className="space-y-6" data-testid="store-page-section-builder">
      {/* Top Action Bar: Add Section, Save Draft, Desktop/Mobile Preview, Publish Live */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[0.68rem] font-extrabold uppercase tracking-wider bg-[#d4af37]/20 text-amber-900">
                Store Homepage Builder
              </span>
              {hasDraft || hasUnsavedEdits ? (
                <span
                  data-testid="store-draft-status-badge"
                  className="px-2.5 py-0.5 rounded-full text-[0.68rem] font-bold bg-amber-100 text-amber-900 border border-amber-300"
                >
                  Unpublished Draft Changes
                </span>
              ) : (
                <span
                  data-testid="store-published-status-badge"
                  className="px-2.5 py-0.5 rounded-full text-[0.68rem] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200"
                >
                  All Changes Live on /store
                </span>
              )}
            </div>
            <h3 className="text-base font-bold text-slate-900">
              Main Store Page Sections ({sections.length})
            </h3>
            <p className="text-xs text-slate-500">
              Add new sections, edit headings and images, connect catalog products, reorder sections, preview desktop &amp; mobile, and publish live to <strong>/store</strong>.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              data-testid="store-add-section-btn"
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition"
            >
              <Plus size={15} className="text-[#d4af37]" />
              <span>Add Section</span>
            </button>

            <button
              type="button"
              data-testid="store-desktop-preview-btn"
              onClick={() =>
                setPreviewMode((prev) => (prev === "desktop" ? "none" : "desktop"))
              }
              className={`px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition ${
                previewMode === "desktop"
                  ? "bg-slate-900 text-white border-slate-900"
                  : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200"
              }`}
            >
              <Monitor size={14} />
              <span>Desktop Preview</span>
            </button>

            <button
              type="button"
              data-testid="store-mobile-preview-btn"
              onClick={() =>
                setPreviewMode((prev) => (prev === "mobile" ? "none" : "mobile"))
              }
              className={`px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition ${
                previewMode === "mobile"
                  ? "bg-slate-900 text-white border-slate-900"
                  : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200"
              }`}
            >
              <Smartphone size={14} />
              <span>Mobile Preview</span>
            </button>

            <button
              type="button"
              data-testid="store-save-draft-btn"
              disabled={busyAction !== null}
              onClick={handleSaveDraftClick}
              className="px-4 py-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold flex items-center gap-1.5 transition"
            >
              <Save size={14} />
              <span>{busyAction === "draft" ? "Saving Draft..." : "Save Draft"}</span>
            </button>

            <button
              type="button"
              data-testid="store-publish-live-btn"
              disabled={busyAction !== null}
              onClick={handlePublishLiveClick}
              className="admin-btn admin-btn-primary text-xs px-4 py-2.5"
            >
              <Sparkles size={14} />
              <span>{busyAction === "publish" ? "Publishing..." : "Publish Live"}</span>
            </button>
          </div>
        </div>

        {statusBanner && (
          <div
            data-testid="store-builder-status-banner"
            className={`p-3.5 rounded-xl border text-xs font-semibold flex items-center justify-between gap-3 ${
              statusBanner.type === "error"
                ? "bg-rose-50 border-rose-200 text-rose-800"
                : statusBanner.type === "success"
                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                : "bg-amber-50 border-amber-200 text-amber-900"
            }`}
          >
            <div className="flex items-center gap-2">
              {statusBanner.type === "error" ? (
                <AlertCircle size={16} />
              ) : (
                <CheckCircle2 size={16} />
              )}
              <span>{statusBanner.message}</span>
            </div>
            <button
              type="button"
              onClick={() => setStatusBanner(null)}
              className="text-slate-400 hover:text-slate-700"
              aria-label="Dismiss notification"
            >
              <X size={15} />
            </button>
          </div>
        )}

        {hasDraft && (
          <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-amber-50/70 border border-amber-200 text-xs text-amber-900">
            <span>
              You are viewing unpublished Store Page draft changes. Click <strong>Publish Live</strong> when ready to update the public Store homepage.
            </span>
            <button
              type="button"
              onClick={async () => {
                await onDiscardDraft();
                setHasUnsavedEdits(false);
                setStatusBanner({
                  type: "info",
                  message: "Draft discarded. Reverted to currently published Store Page.",
                });
              }}
              className="text-rose-700 hover:underline font-bold ml-4 whitespace-nowrap"
            >
              Discard Draft
            </button>
          </div>
        )}
      </div>

      {/* Live Desktop / Mobile Preview Frame */}
      {previewMode !== "none" && (
        <div
          data-testid={`store-preview-panel-${previewMode}`}
          className="rounded-2xl bg-slate-900 p-4 md:p-6 space-y-4 border border-slate-800 shadow-xl"
        >
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800 text-white">
            <div className="flex items-center gap-2">
              {previewMode === "desktop" ? (
                <Monitor size={18} className="text-[#d4af37]" />
              ) : (
                <Smartphone size={18} className="text-[#d4af37]" />
              )}
              <div>
                <h4 className="text-sm font-bold">
                  {previewMode === "desktop"
                    ? "Desktop Store Homepage Preview (1440px Layout)"
                    : "Mobile Store Homepage Preview (390px iPhone Viewport)"}
                </h4>
                <p className="text-[0.7rem] text-slate-400">
                  Live interactive preview of current draft sections before publishing to /store
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPreviewMode("desktop")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
                  previewMode === "desktop"
                    ? "bg-[#d4af37] text-slate-950"
                    : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                }`}
              >
                Desktop
              </button>
              <button
                type="button"
                onClick={() => setPreviewMode("mobile")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
                  previewMode === "mobile"
                    ? "bg-[#d4af37] text-slate-950"
                    : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                }`}
              >
                Mobile (390px)
              </button>
              <button
                type="button"
                onClick={() => setPreviewMode("none")}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-800 text-slate-300 hover:bg-slate-700"
              >
                Close Preview
              </button>
            </div>
          </div>

          <div className="flex justify-center overflow-x-auto py-2">
            <div
              data-testid="store-preview-viewport"
              style={{
                width: previewMode === "mobile" ? "390px" : "100%",
                maxWidth: previewMode === "mobile" ? "390px" : "1440px",
              }}
              className={`bg-white rounded-2xl overflow-y-auto max-h-[75vh] shadow-2xl border ${
                previewMode === "mobile"
                  ? "border-slate-700 ring-4 ring-slate-800"
                  : "border-slate-700 w-full"
              }`}
            >
              <div className="store-page">
                <StorePageRenderer
                  config={{ ...mainStoreConfig, sections }}
                  products={appleCatalogProducts}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Grid: Section List + Section Editor */}
      <div
        data-testid="store-builder-workspace"
        className={`store-builder-workspace ${editingSection ? "is-editing" : ""}`}
      >
        {/* Left Column: Reorderable Section List */}
        <div className="store-builder-list-col space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 px-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Section Order (Top to Bottom on /store)
            </span>
            {missingBuiltInSections.length > 0 && (
              <button
                type="button"
                onClick={handleRestoreBuiltInSections}
                className="text-xs font-bold text-amber-800 hover:underline flex items-center gap-1"
              >
                <RotateCcw size={12} />
                <span>Restore Default Sections ({missingBuiltInSections.length})</span>
              </button>
            )}
          </div>

          <div className="space-y-2.5" data-testid="store-sections-list">
            {sections.map((sec, idx) => {
              const isEditing = sec.id === editingSectionId;
              const previewImg = sec.desktopImage || sec.mobileImage;

              return (
                <div
                  key={sec.id}
                  data-testid={`store-section-row-${sec.id}`}
                  data-section-heading={sec.heading}
                  className={`store-builder-section-card p-4 rounded-2xl bg-white border transition-all ${
                    isEditing
                      ? "border-[#d4af37] ring-2 ring-[#d4af37]/30 shadow-md"
                      : "border-slate-200 hover:border-slate-300 shadow-sm"
                  } ${sec.visible === false ? "opacity-65 bg-slate-50" : ""}`}
                >
                  <div className="store-builder-card-inner">
                    <div className="store-builder-card-info">
                      <span className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 font-extrabold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                        {idx + 1}
                      </span>

                      {previewImg && (
                        <div className="w-12 h-12 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden flex-shrink-0 flex items-center justify-center p-1">
                          <img
                            src={previewImg}
                            alt={sec.imageAlt || sec.heading}
                            className="max-w-full max-h-full object-contain"
                          />
                        </div>
                      )}

                      <div className="store-builder-card-text">
                        <div className="store-builder-card-badges">
                          <span className="store-builder-card-badge px-2 py-0.5 rounded bg-slate-100 text-[0.65rem] font-bold text-slate-700 uppercase">
                            {formatSectionTypeBadge(sec)}
                          </span>
                          {sec.visible === false ? (
                            <span className="store-builder-card-badge px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200 text-[0.65rem] font-bold">
                              Hidden
                            </span>
                          ) : (
                            <span className="store-builder-card-badge px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-[0.65rem] font-bold">
                              Visible
                            </span>
                          )}
                          {sec.productIds && sec.productIds.length > 0 && (
                            <span className="store-builder-card-badge px-2 py-0.5 rounded bg-amber-50 text-amber-900 border border-amber-200 text-[0.65rem] font-bold">
                              {sec.productIds.length} Product{sec.productIds.length === 1 ? "" : "s"}
                            </span>
                          )}
                        </div>

                        <h4
                          data-testid={`section-title-${sec.id}`}
                          className="store-builder-card-title"
                        >
                          {sec.heading}
                        </h4>
                        {sec.subtitle && (
                          <p
                            data-testid={`section-subtitle-${sec.id}`}
                            className="store-builder-card-subtitle"
                          >
                            {sec.subtitle}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Section Management Controls: Edit, Duplicate, Move Up, Move Down, Hide/Show, Delete */}
                    <div className="store-builder-card-actions">
                      <button
                        type="button"
                        data-testid={`section-edit-btn-${sec.id}`}
                        onClick={() => {
                          const nextId = isEditing ? null : sec.id;
                          setEditingSectionId(nextId);
                          if (nextId && typeof window !== "undefined" && window.innerWidth < 1280) {
                            window.requestAnimationFrame(() => {
                              document
                                .getElementById("store-section-editor-panel")
                                ?.scrollIntoView({ behavior: "smooth", block: "nearest" });
                            });
                          }
                        }}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition ${
                          isEditing
                            ? "bg-slate-900 text-white"
                            : "bg-slate-100 hover:bg-slate-200 text-slate-800"
                        }`}
                        title="Edit Section"
                      >
                        <Edit size={13} />
                        <span>{isEditing ? "Editing" : "Edit"}</span>
                      </button>

                      <button
                        type="button"
                        data-testid={`section-duplicate-btn-${sec.id}`}
                        onClick={() => handleDuplicateSection(sec)}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                        title="Duplicate Section"
                        aria-label={`Duplicate ${sec.heading}`}
                      >
                        <Copy size={14} />
                      </button>

                      <button
                        type="button"
                        data-testid={`section-move-up-btn-${sec.id}`}
                        disabled={idx === 0}
                        onClick={() => handleMoveSection(idx, -1)}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 transition"
                        title="Move Up"
                        aria-label={`Move ${sec.heading} up`}
                      >
                        <ArrowUp size={14} />
                      </button>

                      <button
                        type="button"
                        data-testid={`section-move-down-btn-${sec.id}`}
                        disabled={idx === sections.length - 1}
                        onClick={() => handleMoveSection(idx, 1)}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 transition"
                        title="Move Down"
                        aria-label={`Move ${sec.heading} down`}
                      >
                        <ArrowDown size={14} />
                      </button>

                      <button
                        type="button"
                        data-testid={`section-visibility-btn-${sec.id}`}
                        onClick={() => handleToggleVisibility(sec)}
                        className={`p-1.5 rounded-lg transition ${
                          sec.visible === false
                            ? "bg-amber-100 text-amber-900 hover:bg-amber-200"
                            : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                        }`}
                        title={sec.visible === false ? "Show Section" : "Hide Section"}
                        aria-label={
                          sec.visible === false
                            ? `Show ${sec.heading}`
                            : `Hide ${sec.heading}`
                        }
                      >
                        {sec.visible === false ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>

                      <button
                        type="button"
                        data-testid={`section-delete-btn-${sec.id}`}
                        onClick={() => setConfirmDeleteSection(sec)}
                        className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition"
                        title="Delete Section"
                        aria-label={`Delete ${sec.heading}`}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Section Editor */}
        {editingSection && (
          <div
            id="store-section-editor-panel"
            data-testid="store-section-editor"
            className="store-builder-editor-col p-5 sm:p-6 rounded-2xl bg-white border border-slate-200 shadow-lg space-y-6"
          >
            <div className="flex items-start justify-between gap-3 pb-4 border-b border-slate-100">
              <div className="min-w-0 flex-1">
                <span className="text-[0.68rem] font-extrabold uppercase tracking-wider text-[#d4af37] block">
                  Editing Store Section • {formatSectionTypeBadge(editingSection)}
                </span>
                <h3 className="text-base font-bold text-slate-900 break-normal">
                  {editingSection.heading || "Untitled Section"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingSectionId(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex-shrink-0"
                aria-label="Close section editor"
              >
                <X size={18} />
              </button>
            </div>

            {/* Shortcut to built-in card editors if this is a built-in section */}
            {editingSection.builtInKey === "family-strip" ? (
              <div
                className="space-y-4"
                data-testid="family-strip-section-editor"
              >
                <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 text-xs text-amber-900 leading-relaxed">
                  Replace category images for <strong>iPhone, Mac, iPad, Apple Watch, AirPods, and Accessories</strong> below. Category names, store links, and public page layout remain unchanged. Click <strong>Publish Live</strong> when ready.
                </div>

                <ProductFamilyStripEditor
                  productFamilies={mainStoreConfig.productFamilies}
                  uploadingIndex={uploadingFamilyIndex}
                  onUploadFile={handleFamilyFileUpload}
                  onOpenMediaLibrary={(idx) => setMediaPickerFamilyIndex(idx)}
                  onResetToDefault={handleResetFamilyImage}
                />
              </div>
            ) : (
              <>
                {editingSection.builtInKey && onSwitchSubTab && (
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs text-slate-600">
                      This is a built-in Store section. You can customize its heading, subtitle, alignment, and visibility here, or edit its individual cards.
                    </span>
                    {editingSection.builtInKey === "latest-carousel" && (
                      <button
                        type="button"
                        onClick={() => onSwitchSubTab("latest")}
                        className="px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-bold"
                      >
                        Edit &ldquo;The Latest&rdquo; Cards →
                      </button>
                    )}
                    {editingSection.builtInKey === "category-cards" && (
                      <button
                        type="button"
                        onClick={() => onSwitchSubTab("categories")}
                        className="px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-bold"
                      >
                        Edit Category Cards →
                      </button>
                    )}
                    {editingSection.builtInKey === "more-to-love" && (
                      <button
                        type="button"
                        onClick={() => onSwitchSubTab("moreToLove")}
                        className="px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-bold"
                      >
                        Edit &ldquo;More to Love&rdquo; Cards →
                      </button>
                    )}
                    {editingSection.builtInKey === "accessories-carousel" && (
                      <button
                        type="button"
                        onClick={() => onSwitchSubTab("accessories")}
                        className="px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-bold"
                      >
                        Edit Featured Accessories →
                      </button>
                    )}
                  </div>
                )}

            {/* 1. Content & Copy Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Section Heading
                </label>
                <input
                  type="text"
                  data-testid="section-heading-input"
                  value={editingSection.heading}
                  onChange={(e) =>
                    updateSingleSection(editingSection.id, { heading: e.target.value })
                  }
                  placeholder="Enter section heading..."
                  className="admin-input w-full text-sm font-semibold"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Eyebrow Label
                </label>
                <input
                  type="text"
                  data-testid="section-eyebrow-input"
                  value={editingSection.eyebrow || ""}
                  onChange={(e) =>
                    updateSingleSection(editingSection.id, { eyebrow: e.target.value })
                  }
                  placeholder="e.g. FEATURED COLLECTION"
                  className="admin-input w-full text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Visibility
                </label>
                <button
                  type="button"
                  data-testid="section-editor-visibility-toggle"
                  onClick={() => handleToggleVisibility(editingSection)}
                  className={`w-full py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition ${
                    editingSection.visible !== false
                      ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                      : "bg-rose-50 border-rose-200 text-rose-800"
                  }`}
                >
                  {editingSection.visible !== false ? (
                    <>
                      <Eye size={14} />
                      <span>Visible on Store Page</span>
                    </>
                  ) : (
                    <>
                      <EyeOff size={14} />
                      <span>Hidden from Store Page</span>
                    </>
                  )}
                </button>
              </div>

              <div className="md:col-span-2">
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Subtitle
                </label>
                <input
                  type="text"
                  data-testid="section-subtitle-input"
                  value={editingSection.subtitle || ""}
                  onChange={(e) =>
                    updateSingleSection(editingSection.id, { subtitle: e.target.value })
                  }
                  placeholder="Concise supporting subtitle..."
                  className="admin-input w-full text-xs"
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  data-testid="section-description-input"
                  value={editingSection.description || ""}
                  onChange={(e) =>
                    updateSingleSection(editingSection.id, { description: e.target.value })
                  }
                  placeholder="Optional extended section description..."
                  className="admin-input w-full text-xs"
                />
              </div>
            </div>

            {/* 2. Layout Style, Text Alignment & Background Color */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-100">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Layout Style
                </label>
                <select
                  data-testid="section-layout-select"
                  value={editingSection.layoutStyle || "standard"}
                  onChange={(e) =>
                    updateSingleSection(editingSection.id, {
                      layoutStyle: e.target.value as StoreSectionLayoutStyle,
                    })
                  }
                  className="admin-input w-full text-xs"
                >
                  <option value="standard">Standard Stack</option>
                  <option value="split">Split (Copy + Image)</option>
                  <option value="full-bleed">Full-Bleed Banner</option>
                  <option value="carousel">Horizontal Product Carousel</option>
                  <option value="grid-3">3-Column Product Grid</option>
                  <option value="grid-4">4-Column Product Grid</option>
                  <option value="compact">Compact</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Text Alignment
                </label>
                <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-slate-100 border border-slate-200">
                  {(["left", "center", "right"] as const).map((align) => (
                    <button
                      key={align}
                      type="button"
                      data-testid={`section-align-${align}`}
                      onClick={() =>
                        updateSingleSection(editingSection.id, { textAlignment: align })
                      }
                      className={`py-1.5 rounded-lg text-xs font-bold capitalize transition ${
                        (editingSection.textAlignment || "left") === align
                          ? "bg-white text-slate-900 shadow-sm"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      {align}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Background Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={editingSection.backgroundColor || "#ffffff"}
                    onChange={(e) =>
                      updateSingleSection(editingSection.id, {
                        backgroundColor: e.target.value,
                      })
                    }
                    className="w-9 h-9 rounded-lg border border-slate-200 cursor-pointer p-0.5 bg-white"
                  />
                  <input
                    type="text"
                    data-testid="section-bg-color-input"
                    value={editingSection.backgroundColor || "#ffffff"}
                    onChange={(e) =>
                      updateSingleSection(editingSection.id, {
                        backgroundColor: e.target.value,
                      })
                    }
                    className="admin-input text-xs font-mono flex-1"
                  />
                </div>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {BACKGROUND_PRESETS.map((preset) => (
                    <button
                      key={preset.value}
                      type="button"
                      onClick={() =>
                        updateSingleSection(editingSection.id, {
                          backgroundColor: preset.value,
                        })
                      }
                      className="px-2 py-0.5 rounded text-[0.65rem] font-semibold border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 3. Desktop & Mobile Images (Upload from PC or Select from Media Library) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
              {/* Desktop Image */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">
                    Desktop Image
                  </span>
                  {editingSection.desktopImage && (
                    <button
                      type="button"
                      onClick={() =>
                        updateSingleSection(editingSection.id, { desktopImage: "" })
                      }
                      className="text-[0.68rem] font-semibold text-rose-600 hover:underline"
                    >
                      Clear
                    </button>
                  )}
                </div>

                <div className="aspect-[16/9] rounded-lg bg-white border border-slate-200 flex items-center justify-center overflow-hidden p-2">
                  {editingSection.desktopImage ? (
                    <img
                      src={editingSection.desktopImage}
                      alt={editingSection.imageAlt || editingSection.heading}
                      className="max-h-full max-w-full object-contain"
                    />
                  ) : (
                    <span className="text-xs text-slate-400">No Desktop Image Set</span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <label className="flex-1 py-1.5 px-2.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-800 font-bold text-[0.7rem] flex items-center justify-center gap-1.5 cursor-pointer">
                    <Upload size={13} />
                    <span>
                      {uploadingField === "desktopImage" ? "Uploading..." : "Upload from PC"}
                    </span>
                    <input
                      type="file"
                      data-testid="section-desktop-image-file-input"
                      accept="image/jpeg,image/png,image/webp,image/avif"
                      disabled={uploadingField !== null}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) void handleSectionImageUpload("desktopImage", file);
                      }}
                      className="hidden"
                    />
                  </label>

                  <button
                    type="button"
                    data-testid="section-desktop-media-library-btn"
                    onClick={() => setMediaPickerField("desktopImage")}
                    className="flex-1 py-1.5 px-2.5 rounded-lg bg-[#d4af37]/15 hover:bg-[#d4af37]/25 text-amber-900 font-bold text-[0.7rem] flex items-center justify-center gap-1.5"
                  >
                    <ImageIcon size={13} />
                    <span>Media Library</span>
                  </button>
                </div>

                <input
                  type="text"
                  data-testid="section-desktop-image-url-input"
                  value={editingSection.desktopImage || ""}
                  onChange={(e) =>
                    updateSingleSection(editingSection.id, {
                      desktopImage: e.target.value,
                    })
                  }
                  placeholder="Or paste approved image URL..."
                  className="admin-input w-full text-xs font-mono"
                />
              </div>

              {/* Mobile Image */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">
                    Mobile Image (Optional Override)
                  </span>
                  {editingSection.mobileImage && (
                    <button
                      type="button"
                      onClick={() =>
                        updateSingleSection(editingSection.id, { mobileImage: "" })
                      }
                      className="text-[0.68rem] font-semibold text-rose-600 hover:underline"
                    >
                      Clear
                    </button>
                  )}
                </div>

                <div className="aspect-[16/9] rounded-lg bg-white border border-slate-200 flex items-center justify-center overflow-hidden p-2">
                  {editingSection.mobileImage ? (
                    <img
                      src={editingSection.mobileImage}
                      alt={editingSection.imageAlt || editingSection.heading}
                      className="max-h-full max-w-full object-contain"
                    />
                  ) : (
                    <span className="text-xs text-slate-400">
                      Uses Desktop Image on Mobile
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <label className="flex-1 py-1.5 px-2.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-800 font-bold text-[0.7rem] flex items-center justify-center gap-1.5 cursor-pointer">
                    <Upload size={13} />
                    <span>
                      {uploadingField === "mobileImage" ? "Uploading..." : "Upload from PC"}
                    </span>
                    <input
                      type="file"
                      data-testid="section-mobile-image-file-input"
                      accept="image/jpeg,image/png,image/webp,image/avif"
                      disabled={uploadingField !== null}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) void handleSectionImageUpload("mobileImage", file);
                      }}
                      className="hidden"
                    />
                  </label>

                  <button
                    type="button"
                    data-testid="section-mobile-media-library-btn"
                    onClick={() => setMediaPickerField("mobileImage")}
                    className="flex-1 py-1.5 px-2.5 rounded-lg bg-[#d4af37]/15 hover:bg-[#d4af37]/25 text-amber-900 font-bold text-[0.7rem] flex items-center justify-center gap-1.5"
                  >
                    <ImageIcon size={13} />
                    <span>Media Library</span>
                  </button>
                </div>

                <input
                  type="text"
                  data-testid="section-mobile-image-url-input"
                  value={editingSection.mobileImage || ""}
                  onChange={(e) =>
                    updateSingleSection(editingSection.id, {
                      mobileImage: e.target.value,
                    })
                  }
                  placeholder="Or paste mobile image URL..."
                  className="admin-input w-full text-xs font-mono"
                />
              </div>
            </div>

            {/* 4. Button Label & Button Destination */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Button Label
                </label>
                <input
                  type="text"
                  data-testid="section-button-label-input"
                  value={editingSection.buttonLabel || ""}
                  onChange={(e) =>
                    updateSingleSection(editingSection.id, {
                      buttonLabel: e.target.value,
                    })
                  }
                  placeholder="e.g. Shop iPhone"
                  className="admin-input w-full text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Button Destination
                </label>
                <input
                  type="text"
                  data-testid="section-button-destination-input"
                  value={editingSection.buttonDestination || ""}
                  onChange={(e) =>
                    updateSingleSection(editingSection.id, {
                      buttonDestination: e.target.value,
                    })
                  }
                  placeholder="e.g. /iphone or /shop/buy-iphone/iphone-16-pro"
                  className="admin-input w-full text-xs font-mono"
                />
              </div>
            </div>

            {/* 5. Product Selection (Connected to Canonical Admin Catalog) */}
            <div className="space-y-3 pt-4 border-t border-slate-100">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <label className="text-xs font-bold text-slate-800 block">
                    Connected Catalog Products ({(editingSection.productIds || []).length} Selected)
                  </label>
                  <p className="text-[0.7rem] text-slate-500">
                    Select existing products from Admin Dashboard → Products. Each card uses its canonical Buy page, published gallery, and verified price.
                  </p>
                </div>
              </div>

              {/* Currently Selected Products Pills */}
              {editingSection.productIds && editingSection.productIds.length > 0 && (
                <div
                  data-testid="section-selected-products"
                  className="flex flex-wrap gap-2 p-3 rounded-xl bg-amber-50/60 border border-amber-200"
                >
                  {editingSection.productIds.map((pid) => {
                    const prod = products.find((p) => p.id === pid || p.slug === pid);
                    if (!prod) return null;
                    return (
                      <span
                        key={pid}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-amber-300 text-xs font-bold text-slate-800 shadow-sm"
                      >
                        <span>{prod.name}</span>
                        <button
                          type="button"
                          onClick={() => handleToggleProductInSection(pid)}
                          className="text-slate-400 hover:text-rose-600"
                          aria-label={`Remove ${prod.name}`}
                        >
                          <X size={13} />
                        </button>
                      </span>
                    );
                  })}
                </div>
              )}

              {/* Search Bar for Catalog Products */}
              <div className="relative">
                <Search
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="text"
                  data-testid="section-product-search-input"
                  value={productQuery}
                  onChange={(e) => setProductQuery(e.target.value)}
                  placeholder="Search catalog products by name, model, or category (e.g. iPhone 16 Pro, MacBook Air)..."
                  className="admin-input w-full pl-9 text-xs"
                />
              </div>

              {/* Selectable Catalog Grid */}
              <div
                data-testid="section-product-picker-grid"
                className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-64 overflow-y-auto p-1"
              >
                {filteredCatalogProducts.map((prod) => {
                  const selectedIds = editingSection.productIds || [];
                  const isSelected =
                    selectedIds.includes(prod.id) || selectedIds.includes(prod.slug);
                  const img =
                    resolveCatalogueProductImage(prod) || resolveProductImage(prod);
                  const priceInfo = getCardPriceDisplay(prod);
                  const purchasable = isProductPurchasable(prod);

                  return (
                    <button
                      key={prod.id}
                      type="button"
                      data-testid={`section-pick-product-${prod.slug}`}
                      onClick={() => handleToggleProductInSection(prod.slug)}
                      className={`p-2.5 rounded-xl border text-left flex items-center gap-2.5 transition ${
                        isSelected
                          ? "bg-amber-50/80 border-[#d4af37] ring-1 ring-[#d4af37]"
                          : "bg-white hover:bg-slate-50 border-slate-200"
                      }`}
                    >
                      <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center p-1 flex-shrink-0">
                        {img ? (
                          <img
                            src={img.src}
                            alt={prod.name}
                            className="max-w-full max-h-full object-contain"
                          />
                        ) : (
                          <Package size={16} className="text-slate-300" />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-slate-900 truncate">
                          {prod.name}
                        </p>
                        <p className="text-[0.68rem] text-slate-500 truncate">
                          {prod.category} • {priceInfo.current}{" "}
                          {!purchasable ? "(Enquiry Only)" : ""}
                        </p>
                      </div>

                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                          isSelected
                            ? "bg-[#d4af37] text-slate-950"
                            : "border border-slate-300"
                        }`}
                      >
                        {isSelected && <Check size={12} />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
            </>
            )}
          </div>
        )}
      </div>

      {/* Add Section Modal */}
      {showAddModal && (
        <div
          data-testid="add-section-modal"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setShowAddModal(false)}
        >
          <div
            className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl p-6 space-y-5 max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Layers size={18} className="text-[#d4af37]" />
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Add Store Homepage Section
                  </h3>
                  <p className="text-xs text-slate-500">
                    Choose a section type to add to the Store page
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1 text-slate-400 hover:text-slate-800"
              >
                <X size={18} />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {SECTION_TYPE_OPTIONS.map((option) => (
                <button
                  key={option.type}
                  type="button"
                  data-testid={`add-section-type-${option.type}`}
                  onClick={() => handleCreateSection(option)}
                  className="p-4 rounded-xl border border-slate-200 hover:border-[#d4af37] hover:bg-amber-50/30 text-left space-y-1.5 transition group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-slate-900 group-hover:text-amber-900">
                      {option.label}
                    </span>
                    <Plus
                      size={14}
                      className="text-slate-400 group-hover:text-[#d4af37]"
                    />
                  </div>
                  <p className="text-[0.7rem] text-slate-500 leading-relaxed">
                    {option.description}
                  </p>
                </button>
              ))}
            </div>

            {/* Extensible Custom Section Type Support */}
            <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <input
                type="text"
                value={customTypeName}
                onChange={(e) => setCustomTypeName(e.target.value)}
                placeholder="Or enter a custom section type name..."
                className="admin-input text-xs flex-1"
              />
              <button
                type="button"
                disabled={!customTypeName.trim()}
                onClick={handleCreateCustomTypeSection}
                className="px-4 py-2 rounded-xl bg-slate-900 disabled:opacity-40 text-white text-xs font-bold"
              >
                Create Custom Section Type
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Section Confirmation Modal */}
      {confirmDeleteSection && (
        <div
          data-testid="delete-section-confirm-modal"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setConfirmDeleteSection(null)}
        >
          <div
            className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 text-rose-600">
              <AlertCircle size={20} />
              <h3 className="text-base font-bold text-slate-900">
                Delete Store Section?
              </h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to remove{" "}
              <strong>&ldquo;{confirmDeleteSection.heading}&rdquo;</strong> from the Store Page?
              This only removes the section from the Store layout and will{" "}
              <strong>not</strong> delete any underlying catalog product records or Media Library files.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                data-testid="cancel-delete-section-btn"
                onClick={() => setConfirmDeleteSection(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="button"
                data-testid="confirm-delete-section-btn"
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold"
              >
                Delete Section
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Media Library Picker Modal for Section Editor */}
      {mediaPickerField && editingSection && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setMediaPickerField(null)}
        >
          <div
            className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl p-6 space-y-4 max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ImageIcon size={18} className="text-[#d4af37]" />
                <h3 className="font-bold text-slate-900 text-sm">
                  Select {mediaPickerField === "desktopImage" ? "Desktop" : "Mobile"} Image for &ldquo;{editingSection.heading}&rdquo;
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setMediaPickerField(null)}
                className="p-1 text-slate-400 hover:text-slate-900"
              >
                <X size={18} />
              </button>
            </div>

            <AdminMediaLibrary
              isPicker
              onSelect={(item: MediaItem) => {
                updateSingleSection(editingSection.id, {
                  [mediaPickerField]: item.url,
                  imageAlt: editingSection.imageAlt || item.alt || item.title || editingSection.heading,
                });
                setMediaPickerField(null);
              }}
            />
          </div>
        </div>
      )}

      {/* Media Library Picker Modal for Family Category */}
      {mediaPickerFamilyIndex !== null && (
        <div
          data-testid="family-media-picker-modal"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setMediaPickerFamilyIndex(null)}
        >
          <div
            className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl p-6 space-y-4 max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ImageIcon size={18} className="text-[#d4af37]" />
                <h3 className="font-bold text-slate-900 text-sm">
                  Select Image for &ldquo;
                  {(mainStoreConfig.productFamilies || defaultMainStoreConfig.productFamilies)[mediaPickerFamilyIndex]?.name}
                  &rdquo;
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setMediaPickerFamilyIndex(null)}
                className="p-1 text-slate-400 hover:text-slate-900"
              >
                <X size={18} />
              </button>
            </div>

            <AdminMediaLibrary
              isPicker
              onSelect={(item: MediaItem) => {
                const currentFamilies = [
                  ...(mainStoreConfig.productFamilies || defaultMainStoreConfig.productFamilies),
                ];
                const fam = currentFamilies[mediaPickerFamilyIndex];
                currentFamilies[mediaPickerFamilyIndex] = {
                  ...fam,
                  image: item.url,
                  alt: item.alt || item.title || `${fam.name} category`,
                };
                setMainStoreConfig((prev) => ({
                  ...prev,
                  productFamilies: currentFamilies,
                }));
                setHasUnsavedEdits(true);
                setMediaPickerFamilyIndex(null);
                setStatusBanner({
                  type: "success",
                  message: `Selected image for ${fam.name}. Remember to click Publish Live.`,
                });
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
