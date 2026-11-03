import {
  AlertCircle,
  Archive,
  ArrowRight,
  BarChart3,
  Calendar,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  Copy,
  DollarSign,
  Edit3,
  ExternalLink,
  Eye,
  Filter,
  Gift,
  HelpCircle,
  Image as ImageIcon,
  Layers,
  Package,
  Percent,
  Plus,
  Power,
  RefreshCw,
  RotateCcw,
  Search,
  ShieldCheck,
  ShoppingBag,
  Sliders,
  Sparkles,
  Tag,
  Trash2,
  TrendingUp,
  Upload,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useProductCatalog } from "../../catalog/ProductCatalogContext";
import { createProductSlug } from "../../catalog/productCatalog";
import { withProductPurchaseAction, type ProductPurchaseAction } from "../../catalog/productPurchaseAction";
import { defaultPromotions } from "../../promotions/defaultPromotions";
import {
  archivePromotion,
  deletePromotion,
  duplicatePromotion,
  fetchPromotions,
  savePromotion,
  subscribeToPromotions,
  togglePromotionEnabled,
} from "../../promotions/supabasePromotionsRepository";
import type {
  DiscountCalculationMode,
  DiscountTier,
  PromotionCampaign,
  PromotionStatus,
  PromotionType,
} from "../../types/promotion";
import type { Product, ProductCategory, ProductCondition } from "../../types/product";
import { formatGhs } from "../../utils/format";
import { AdminMediaLibrary } from "./AdminMediaLibrary";
import type { MediaItem } from "../../cms/types";
import { uploadProductImage } from "../../catalog/supabaseProductRepository";

type TabKey = "all" | "active" | "scheduled" | "draft" | "expired" | "archived";
type EditorStep = "basics" | "type" | "product" | "rules" | "flyers" | "placement" | "preview";
type DiscountScope = "storewide" | "category" | "specific";

interface BundleItem {
  id: string;
  name: string;
  condition?: string;
  sku?: string;
}

export function AdminPromotionsPage() {
  const { products, saveProduct, refreshProducts } = useProductCatalog();
  const [promotions, setPromotions] = useState<PromotionCampaign[]>(defaultPromotions);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  // Editor State
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [activeStep, setActiveStep] = useState<EditorStep>("basics");
  const [editingCampaign, setEditingCampaign] = useState<Partial<PromotionCampaign> | null>(null);
  const [saving, setSaving] = useState(false);
  const [editorError, setEditorError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState("");
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Scope State: "storewide" | "category" | "specific"
  const [discountScope, setDiscountScope] = useState<DiscountScope>("storewide");

  // Product Selection Mode: "existing" vs "new_bundle" (for bundles and targeted items)
  const [productMode, setProductMode] = useState<"existing" | "new_bundle">("existing");
  const [productSearch, setProductSearch] = useState("");
  const [selectedExistingProduct, setSelectedExistingProduct] = useState<Product | null>(null);

  // New Promotional Product / Custom Bundle In-place Form State
  const [newProductData, setNewProductData] = useState({
    name: "",
    category: "Game Consoles" as ProductCategory,
    brand: "",
    model: "",
    condition: "Brand New" as ProductCondition,
    price: 0,
    stockQuantity: 1,
    description: "",
    purchaseAction: "buy" as ProductPurchaseAction,
    isStorefrontVisible: true,
  });
  const [bundleItems, setBundleItems] = useState<BundleItem[]>([]);
  const [newBundleItemText, setNewBundleItemText] = useState("");
  const [newBundleItemCondition, setNewBundleItemCondition] = useState<string>("Brand New");

  // Price Tiers Builder Form State
  const [newTierMinPrice, setNewTierMinPrice] = useState<string>("");
  const [newTierMaxPrice, setNewTierMaxPrice] = useState<string>("");
  const [newTierPercent, setNewTierPercent] = useState<string>("");
  const [newTierLabel, setNewTierLabel] = useState<string>("");

  // Exclusion search
  const [exclusionSearch, setExclusionSearch] = useState("");

  // Media Library Picker State
  const [mediaPickerTarget, setMediaPickerTarget] = useState<"desktop" | "mobile" | "gift" | "additional" | null>(null);
  const fileInputDesktopRef = useRef<HTMLInputElement>(null);
  const fileInputMobileRef = useRef<HTMLInputElement>(null);
  const fileInputAdditionalRef = useRef<HTMLInputElement>(null);

  // Delete Candidate State
  const [deleteCandidate, setDeleteCandidate] = useState<PromotionCampaign | null>(null);
  const [deleteInput, setDeleteInput] = useState("");
  const [deleting, setDeleting] = useState(false);

  // Load promotions on mount and subscribe
  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchPromotions(true);
      setPromotions(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
    const unsubscribe = subscribeToPromotions(() => {
      void loadData();
    });
    return unsubscribe;
  }, []);

  // Filtered List
  const filteredPromotions = useMemo(() => {
    return promotions.filter((promo) => {
      // 1. Tab filter
      if (activeTab === "active" && (promo.status !== "active" || !promo.isEnabled)) return false;
      if (activeTab === "scheduled" && promo.status !== "scheduled") return false;
      if (activeTab === "draft" && promo.status !== "draft") return false;
      if (activeTab === "expired" && promo.status !== "expired") return false;
      if (activeTab === "archived" && promo.status !== "archived") return false;

      // 2. Type filter
      if (typeFilter !== "all" && promo.promotionType !== typeFilter) return false;

      // 3. Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = promo.title.toLowerCase().includes(q);
        const matchDesc = promo.shortDescription.toLowerCase().includes(q);
        const matchType = promo.promotionType.toLowerCase().includes(q);
        const matchProducts = (promo.eligibleProductIds || []).some((id) => id.toLowerCase().includes(q));
        if (!matchTitle && !matchDesc && !matchType && !matchProducts) return false;
      }

      return true;
    });
  }, [promotions, activeTab, typeFilter, searchQuery]);

  // KPI Metrics
  const metrics = useMemo(() => {
    const active = promotions.filter((p) => p.status === "active" && p.isEnabled).length;
    const drafts = promotions.filter((p) => p.status === "draft").length;
    const totalRedemptions = promotions.reduce((sum, p) => sum + (p.currentRedemptions || 0), 0);
    const totalSavings = promotions.reduce((sum, p) => sum + (p.totalDiscountGiven || 0), 0);
    return { active, drafts, totalRedemptions, totalSavings };
  }, [promotions]);

  // Open Create Promotion Modal
  const handleOpenCreate = () => {
    setEditingCampaign({
      id: `promo-${Date.now()}`,
      slug: "",
      title: "",
      shortDescription: "",
      detailedDescription: "",
      promotionType: "percentage_discount",
      status: "draft",
      isEnabled: true,
      startDate: new Date().toISOString().slice(0, 16),
      endDate: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 16),
      timezone: "Africa/Accra",
      priority: 5,
      allowStacking: false,
      eligibleProductIds: [],
      eligibleCategory: "all",
      eligibleVariantIds: [],
      eligibleStorageOptions: [],
      minOrderSubtotal: 0,
      minQualifyingItemPrice: 0,
      maxDiscountAmount: null,
      discountCalculationMode: "single_percent",
      discountPercent: 10,
      discountTiers: [],
      productDiscounts: {},
      variantDiscounts: {},
      categoryDiscounts: {},
      excludedProductIds: [],
      excludedCategories: [],
      additionalImages: [],
      imagePosition: "center",
      discountAmount: null,
      promotionalPrice: null,
      giftProductId: null,
      giftProductName: "",
      giftProductSlug: "",
      giftProductImage: "",
      giftQuantityPerPurchase: 1,
      maxGiftsPerOrder: 1,
      giftStockQuantity: 10,
      giftStockAlertThreshold: 2,
      desktopFlyerUrl: "",
      mobileFlyerUrl: "",
      flyerAltText: "",
      ctaText: "Explore Offers",
      ctaDestination: "/offers",
      displayOrder: promotions.length + 1,
      showOnAnnouncementBar: true,
      announcementBarText: "",
      showOnHomepageCarousel: true,
      showOnOffersPage: true,
      totalRedemptionLimit: null,
      customerRedemptionLimit: 1,
    });
    setDiscountScope("storewide");
    setProductMode("existing");
    setNewProductData({
      name: "",
      category: "Game Consoles",
      brand: "",
      model: "",
      condition: "Brand New",
      price: 0,
      stockQuantity: 1,
      description: "",
      purchaseAction: "buy",
      isStorefrontVisible: true,
    });
    setBundleItems([]);
    setSelectedExistingProduct(null);
    setNewTierMinPrice("");
    setNewTierMaxPrice("");
    setNewTierPercent("");
    setNewTierLabel("");
    setActiveStep("basics");
    setEditorError("");
    setSaveSuccess("");
    setValidationErrors([]);
    setIsEditorOpen(true);
  };

  // Open Edit Campaign
  const handleOpenEdit = (campaign: PromotionCampaign) => {
    setEditingCampaign({
      ...campaign,
      startDate: campaign.startDate ? campaign.startDate.slice(0, 16) : "",
      endDate: campaign.endDate ? campaign.endDate.slice(0, 16) : "",
      discountTiers: campaign.discountTiers || [],
      productDiscounts: campaign.productDiscounts || {},
      variantDiscounts: campaign.variantDiscounts || {},
      categoryDiscounts: campaign.categoryDiscounts || {},
      excludedProductIds: campaign.excludedProductIds || [],
      excludedCategories: campaign.excludedCategories || [],
      additionalImages: campaign.additionalImages || [],
      imagePosition: campaign.imagePosition || "center",
      minQualifyingItemPrice: campaign.minQualifyingItemPrice ?? 0,
      discountCalculationMode: campaign.discountCalculationMode || "single_percent",
    });

    // Resolve discount scope
    if (campaign.eligibleProductIds && campaign.eligibleProductIds.length > 0) {
      setDiscountScope("specific");
    } else if (campaign.eligibleCategory && campaign.eligibleCategory !== "all") {
      setDiscountScope("category");
    } else {
      setDiscountScope("storewide");
    }

    if (campaign.promotionType === "bundle") {
      if (campaign.eligibleProductIds && campaign.eligibleProductIds.length > 0) {
        const match = products.find((p) => campaign.eligibleProductIds.includes(p.id) || campaign.eligibleProductIds.includes(p.slug));
        if (match) {
          setSelectedExistingProduct(match);
          setProductMode("existing");
          if (match.includedItems && match.includedItems.length > 0) {
            setBundleItems(match.includedItems.map((item, idx) => ({ id: String(idx + 1), name: item })));
          } else {
            setBundleItems([]);
          }
        } else {
          setProductMode("existing");
          setBundleItems([]);
        }
      } else {
        setProductMode("existing");
        setBundleItems([]);
      }
    } else {
      setProductMode("existing");
      setBundleItems([]);
      setNewProductData({
        name: "",
        category: "Game Consoles",
        brand: "",
        model: "",
        condition: "Brand New",
        price: 0,
        stockQuantity: 1,
        description: "",
        purchaseAction: "buy",
        isStorefrontVisible: true,
      });
      if (campaign.eligibleProductIds && campaign.eligibleProductIds.length > 0) {
        const match = products.find((p) => campaign.eligibleProductIds.includes(p.id) || campaign.eligibleProductIds.includes(p.slug));
        setSelectedExistingProduct(match || null);
      } else {
        setSelectedExistingProduct(null);
      }
    }

    setActiveStep("basics");
    setEditorError("");
    setSaveSuccess("");
    setValidationErrors([]);
    setIsEditorOpen(true);
  };

  // Quick Toggle Enabled
  const handleToggleEnabled = async (campaign: PromotionCampaign) => {
    try {
      await togglePromotionEnabled(campaign.id, !campaign.isEnabled);
      await loadData();
    } catch (err: any) {
      alert(`Could not toggle status: ${err.message}`);
    }
  };

  // Quick Duplicate (Creates independent draft copy)
  const handleDuplicate = async (campaign: PromotionCampaign) => {
    try {
      await duplicatePromotion(campaign.id);
      await loadData();
    } catch (err: any) {
      alert(`Could not duplicate campaign: ${err.message}`);
    }
  };

  // Quick Archive
  const handleArchive = async (campaign: PromotionCampaign) => {
    try {
      await archivePromotion(campaign.id);
      await loadData();
    } catch (err: any) {
      alert(`Could not update archive status: ${err.message}`);
    }
  };

  // Delete Confirm
  const handleDeleteConfirm = async () => {
    if (!deleteCandidate) return;
    if (deleteInput !== deleteCandidate.title) {
      alert("Please type the exact campaign title to confirm deletion.");
      return;
    }

    // Protection rule: Do not permanently delete historical promotions linked to real customer orders or redemptions
    if ((deleteCandidate.ordersCount ?? 0) > 0 || (deleteCandidate.currentRedemptions ?? 0) > 0) {
      alert("This campaign is linked to customer orders or redemptions and cannot be permanently deleted. Please Archive it instead to preserve sales history.");
      return;
    }

    setDeleting(true);
    try {
      await deletePromotion(deleteCandidate.id);
      setDeleteCandidate(null);
      setDeleteInput("");
      await loadData();
    } catch (err: any) {
      alert(`Could not delete campaign: ${err.message}`);
    } finally {
      setDeleting(false);
    }
  };

  // Add Item to Custom Bundle
  const handleAddBundleItem = () => {
    if (!newBundleItemText.trim()) return;
    setBundleItems((prev) => [
      ...prev,
      {
        id: String(Date.now()),
        name: newBundleItemText.trim(),
        condition: newBundleItemCondition,
      },
    ]);
    setNewBundleItemText("");
  };

  const handleRemoveBundleItem = (id: string) => {
    setBundleItems((prev) => prev.filter((item) => item.id !== id));
  };

  // Preload PS5 Combo Data Helper (strictly for bundle creation)
  const handlePreloadPs5Combo = () => {
    setNewProductData({
      name: "PS5 Slim Combo Offer",
      category: "Game Consoles",
      brand: "Sony",
      model: "PlayStation 5 Slim Standard Edition",
      condition: "UK Used",
      price: 7500,
      stockQuantity: 1,
      description: "One-Time PlayStation Combo Offer with EA Sports FC 25 and two controllers.",
      purchaseAction: "buy",
      isStorefrontVisible: true,
    });
    setBundleItems([
      { id: "1", name: "One neatly used PS5 Slim Standard Edition (Disc Version)", condition: "UK Used" },
      { id: "2", name: "One brand-new EA Sports FC 25 game", condition: "Brand New" },
      { id: "3", name: "Two brand-new PlayStation controllers, exact model to be confirmed", condition: "Brand New" },
    ]);
    if (editingCampaign) {
      setEditingCampaign({
        ...editingCampaign,
        title: "One-Time PlayStation Combo Offer",
        shortDescription: "Neatly used PS5 Slim Disc Version with EA Sports FC 25 and two controllers.",
        promotionType: "bundle",
        promotionalPrice: 7500,
        desktopFlyerUrl: "/products/campaigns/ps5-slim-combo-desktop.webp",
        mobileFlyerUrl: "/products/campaigns/ps5-slim-combo-mobile.webp",
        ctaText: "Explore PlayStation Bundle",
        ctaDestination: "/product/ps5-slim-combo-offer",
      });
    }
  };

  // Preload Mega Discount Sale Tiers Helper (10% on GH₵2k-4k, 15% on >GH₵4k)
  const handlePreloadMegaDiscountTiers = () => {
    if (!editingCampaign) return;
    setEditingCampaign({
      ...editingCampaign,
      discountCalculationMode: "price_tiers",
      minQualifyingItemPrice: 2000,
      discountTiers: [
        { minPrice: 2000, maxPrice: 4000, percent: 10, label: "GH₵ 2,000 - GH₵ 4,000 (10% Off)" },
        { minPrice: 4001, maxPrice: null, percent: 15, label: "GH₵ 4,001 and above (15% Off)" },
      ],
      discountPercent: 15,
    });
  };

  // Add Custom Price Tier
  const handleAddPriceTier = () => {
    const min = Number(newTierMinPrice);
    const max = newTierMaxPrice ? Number(newTierMaxPrice) : null;
    const pct = Number(newTierPercent);

    if (Number.isNaN(min) || min < 0) {
      alert("Please enter a valid minimum qualifying price (GH₵).");
      return;
    }
    if (Number.isNaN(pct) || pct <= 0 || pct > 100) {
      alert("Please enter a valid discount percentage between 1% and 100%.");
      return;
    }
    if (max !== null && max <= min) {
      alert("Maximum price must be greater than minimum price.");
      return;
    }

    const tierLabel = newTierLabel.trim() || `GH₵ ${min.toLocaleString()}${max ? ` - GH₵ ${max.toLocaleString()}` : "+"} (${pct}% Off)`;

    const newTier: DiscountTier = {
      id: String(Date.now()),
      minPrice: min,
      maxPrice: max,
      percent: pct,
      label: tierLabel,
    };

    const currentTiers = editingCampaign?.discountTiers || [];
    setEditingCampaign((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        discountTiers: [...currentTiers, newTier],
        discountCalculationMode: "price_tiers",
      };
    });

    setNewTierMinPrice("");
    setNewTierMaxPrice("");
    setNewTierPercent("");
    setNewTierLabel("");
  };

  const handleRemovePriceTier = (idxToRemove: number) => {
    setEditingCampaign((prev) => {
      if (!prev) return prev;
      const current = prev.discountTiers || [];
      return {
        ...prev,
        discountTiers: current.filter((_, idx) => idx !== idxToRemove),
      };
    });
  };

  // Filter products for selection search
  const filteredProductsForSelection = useMemo(() => {
    if (!productSearch.trim()) return products;
    const q = productSearch.toLowerCase().trim();
    return products.filter((p) => {
      const matchName = p.name.toLowerCase().includes(q);
      const matchCat = p.category.toLowerCase().includes(q);
      const matchBrand = p.brand.toLowerCase().includes(q);
      const matchModel = p.model?.toLowerCase().includes(q) ?? false;
      const matchId = p.id.toLowerCase().includes(q);
      const matchSku = (p as any).sku?.toLowerCase().includes(q) ?? false;
      return matchName || matchCat || matchBrand || matchModel || matchId || matchSku;
    });
  }, [products, productSearch]);

  // Validate Campaign
  const validateCampaignForPublish = (): string[] => {
    const errors: string[] = [];
    if (!editingCampaign) return ["No campaign data found."];

    if (!editingCampaign.title?.trim()) {
      errors.push("Campaign Title is required.");
    }
    if (!editingCampaign.shortDescription?.trim()) {
      errors.push("Short Summary / Headline is required.");
    }

    if (!editingCampaign.desktopFlyerUrl?.trim() && !editingCampaign.mobileFlyerUrl?.trim()) {
      errors.push("At least one promotional flyer (Desktop or Mobile) must be uploaded or selected.");
    }

    // Type specific checks
    const type = editingCampaign.promotionType || "bundle";
    if (type === "bundle") {
      const price = Number(editingCampaign.promotionalPrice || (productMode === "new_bundle" ? newProductData.price : 0));
      if (!price || price <= 0) {
        errors.push("Bundle price must be configured and greater than GH₵0.");
      }
      if (productMode === "new_bundle" && bundleItems.length === 0) {
        errors.push("Please include at least one item in the bundle.");
      }
      if (productMode === "new_bundle" && Number(newProductData.stockQuantity) <= 0) {
        errors.push("Confirmed bundle stock must be greater than 0 before publishing live.");
      }
    } else if (type === "free_gift") {
      if (!editingCampaign.giftProductId && !editingCampaign.giftProductName) {
        errors.push("Please select a free gift product from the catalog.");
      }
    } else if (type === "percentage_discount") {
      if (editingCampaign.discountCalculationMode === "price_tiers") {
        if (!editingCampaign.discountTiers || editingCampaign.discountTiers.length === 0) {
          errors.push("Please add at least one price tier band for tiered discount mode.");
        }
      } else if (editingCampaign.discountCalculationMode === "product_specific") {
        const hasSpecific = Object.keys(editingCampaign.productDiscounts || {}).length > 0;
        if (!hasSpecific && (!editingCampaign.eligibleProductIds || editingCampaign.eligibleProductIds.length === 0)) {
          errors.push("Please assign at least one product discount percentage in product-specific mode.");
        }
      } else {
        const pct = Number(editingCampaign.discountPercent || 0);
        if (pct <= 0 || pct > 100) {
          errors.push("Percentage discount must be between 1% and 100%.");
        }
      }
    } else if (type === "fixed_discount") {
      const amt = Number(editingCampaign.discountAmount || 0);
      if (amt <= 0) {
        errors.push("Fixed discount cash amount must be greater than GH₵0.");
      }
    } else if (type === "promotional_price") {
      const pr = Number(editingCampaign.promotionalPrice || 0);
      if (pr <= 0) {
        errors.push("Promotional price must be greater than GH₵0.");
      }
    }

    return errors;
  };

  // Save Campaign (Draft or Live Publish)
  const handleSaveCampaign = async (publishLive = false) => {
    if (!editingCampaign) return;
    setEditorError("");
    setSaveSuccess("");
    setValidationErrors([]);

    // Pre-flight checks
    if (!editingCampaign.title?.trim()) {
      setEditorError("Please enter a campaign title.");
      setActiveStep("basics");
      return;
    }

    if (publishLive) {
      const errors = validateCampaignForPublish();
      if (errors.length > 0) {
        setValidationErrors(errors);
        setEditorError("Please fix the required items before publishing live.");
        return;
      }
    }

    setSaving(true);
    try {
      let targetProductId = "";
      const isBundle = editingCampaign.promotionType === "bundle";
      const isDiscount = editingCampaign.promotionType === "percentage_discount" || editingCampaign.promotionType === "fixed_discount";
      const isGift = editingCampaign.promotionType === "free_gift";

      // If creating a new canonical product / bundle in-place (ONLY for bundle offers)
      if (isBundle && productMode === "new_bundle" && newProductData.name.trim()) {
        const prodSlug = createProductSlug(newProductData.name, products);
        const canonicalProduct: Product = {
          id: prodSlug,
          slug: prodSlug,
          name: newProductData.name.trim(),
          brand: newProductData.brand || "Sony",
          category: newProductData.category,
          model: newProductData.model || newProductData.name.trim(),
          condition: newProductData.condition,
          price: Number(newProductData.price),
          priceOnRequest: false,
          stockQuantity: Number(newProductData.stockQuantity),
          stockStatus: Number(newProductData.stockQuantity) > 0 ? "In Stock" : "Out of Stock",
          storage: ["Standard"],
          colors: ["Standard"],
          imageTone: "light",
          images: [
            {
              src: editingCampaign.desktopFlyerUrl || editingCampaign.mobileFlyerUrl || "/placeholder.webp",
              alt: newProductData.name.trim(),
            },
          ],
          includedItems: bundleItems.map((item) => `${item.name}${item.condition ? ` (${item.condition})` : ""}`),
          specs: [
            `${newProductData.name.trim()}`,
            `Condition: ${newProductData.condition}`,
            `Includes ${bundleItems.length} verified components`,
          ],
          box: bundleItems.map((item) => item.name),
          description: newProductData.description || editingCampaign.detailedDescription || editingCampaign.shortDescription || "",
          tags: withProductPurchaseAction(
            ["promotional", "bundle", "custom-bundle"],
            newProductData.purchaseAction
          ),
          available: newProductData.isStorefrontVisible,
          archived: false,
        };

        // Save into canonical product repository
        await saveProduct(canonicalProduct);
        targetProductId = prodSlug;
        await refreshProducts();
      }

      // Build campaign to save
      const campaignStatus: PromotionStatus = publishLive ? "active" : (editingCampaign.status || "draft");
      const campaignEnabled = publishLive ? true : Boolean(editingCampaign.isEnabled);

      // Resolve eligible and bundle product IDs based on promotion type & scope
      let resolvedEligibleProductIds: string[] = [];
      let resolvedEligibleCategory = editingCampaign.eligibleCategory || "all";
      let resolvedBundleRequiredIds: string[] = [];
      let resolvedCta = editingCampaign.ctaDestination || "/offers";

      if (isBundle) {
        if (targetProductId) {
          resolvedEligibleProductIds = [targetProductId];
          resolvedBundleRequiredIds = [targetProductId];
          resolvedCta = editingCampaign.ctaDestination || `/product/${targetProductId}`;
        } else if (selectedExistingProduct) {
          resolvedEligibleProductIds = [selectedExistingProduct.id];
          resolvedBundleRequiredIds = [selectedExistingProduct.id];
          resolvedCta = editingCampaign.ctaDestination || `/product/${selectedExistingProduct.id}`;
        } else if (editingCampaign.eligibleProductIds && editingCampaign.eligibleProductIds.length > 0) {
          resolvedEligibleProductIds = editingCampaign.eligibleProductIds;
          resolvedBundleRequiredIds = editingCampaign.eligibleProductIds;
        }
      } else if (isDiscount || isGift) {
        // Evaluate Scope
        if (discountScope === "specific") {
          resolvedEligibleProductIds = editingCampaign.eligibleProductIds || [];
          resolvedEligibleCategory = "all";
        } else if (discountScope === "category") {
          resolvedEligibleProductIds = [];
          resolvedEligibleCategory = editingCampaign.eligibleCategory && editingCampaign.eligibleCategory !== "all" ? editingCampaign.eligibleCategory : "Smartphones";
        } else {
          // Storewide
          resolvedEligibleProductIds = [];
          resolvedEligibleCategory = "all";
        }
        resolvedBundleRequiredIds = [];

        if (resolvedEligibleProductIds.length === 1 && !editingCampaign.ctaDestination) {
          resolvedCta = `/product/${resolvedEligibleProductIds[0]}`;
        } else {
          resolvedCta = editingCampaign.ctaDestination || "/offers";
        }
      } else {
        // Promotional Price, Advertising, etc.
        if (selectedExistingProduct) {
          resolvedEligibleProductIds = [selectedExistingProduct.id];
        } else {
          resolvedEligibleProductIds = editingCampaign.eligibleProductIds || [];
        }
        resolvedBundleRequiredIds = [];
        if (resolvedEligibleProductIds.length === 1 && !editingCampaign.ctaDestination) {
          resolvedCta = `/product/${resolvedEligibleProductIds[0]}`;
        } else {
          resolvedCta = editingCampaign.ctaDestination || "/offers";
        }
      }

      const toSave: Partial<PromotionCampaign> = {
        ...editingCampaign,
        status: campaignStatus,
        isEnabled: campaignEnabled,
        eligibleProductIds: resolvedEligibleProductIds,
        eligibleCategory: resolvedEligibleCategory,
        bundleRequiredProductIds: resolvedBundleRequiredIds,
        minQualifyingItemPrice: Number(editingCampaign.minQualifyingItemPrice || 0),
        minOrderSubtotal: Number(editingCampaign.minOrderSubtotal || 0),
        maxDiscountAmount: editingCampaign.maxDiscountAmount ? Number(editingCampaign.maxDiscountAmount) : null,
        discountCalculationMode: editingCampaign.discountCalculationMode || "single_percent",
        discountTiers: editingCampaign.discountTiers || [],
        productDiscounts: editingCampaign.productDiscounts || {},
        variantDiscounts: editingCampaign.variantDiscounts || {},
        categoryDiscounts: editingCampaign.categoryDiscounts || {},
        excludedProductIds: editingCampaign.excludedProductIds || [],
        excludedCategories: editingCampaign.excludedCategories || [],
        additionalImages: editingCampaign.additionalImages || [],
        imagePosition: editingCampaign.imagePosition || "center",
        promotionalPrice: isBundle
          ? (productMode === "new_bundle" ? Number(newProductData.price) : Number(editingCampaign.promotionalPrice || 0))
          : (editingCampaign.promotionType === "promotional_price" ? Number(editingCampaign.promotionalPrice || 0) : null),
        ctaDestination: resolvedCta,
        updatedAt: new Date().toISOString(),
      };

      await savePromotion(toSave);
      setSaveSuccess(publishLive ? "Promotion published live successfully!" : "Promotion draft saved successfully.");
      await loadData();

      setTimeout(() => {
        setIsEditorOpen(false);
      }, 900);
    } catch (err: any) {
      setEditorError(err.message || "Could not save promotion.");
    } finally {
      setSaving(false);
    }
  };

  // Upload Flyer Image Handler
  const handleFlyerFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, target: "desktop" | "mobile" | "additional") => {
    const file = e.target.files?.[0];
    if (!file || !editingCampaign) return;

    try {
      setSaving(true);
      const uploaded = await uploadProductImage(file, `campaigns/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`);
      if (target === "desktop") {
        setEditingCampaign((prev) => ({ ...prev!, desktopFlyerUrl: uploaded.src }));
      } else if (target === "mobile") {
        setEditingCampaign((prev) => ({ ...prev!, mobileFlyerUrl: uploaded.src }));
      } else if (target === "additional") {
        setEditingCampaign((prev) => {
          const current = prev?.additionalImages || [];
          return { ...prev!, additionalImages: [...current, uploaded.src] };
        });
      }
    } catch (err: any) {
      setEditorError(`Upload failed: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* 1. Header with prominent + Create Promotion Button */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="p-2.5 bg-amber-50 text-amber-700 rounded-xl">
                <Sparkles size={22} />
              </span>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Promotions &amp; Campaigns</h1>
            </div>
            <p className="text-sm text-slate-500 mt-2 max-w-2xl leading-relaxed">
              Launch combo bundle deals, free gifts, cash discounts, price tiers, and promotional flyers across your storefront.
              Easily configure qualifying products, rules, and schedules directly without leaving this screen.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => void loadData()}
              disabled={loading}
              className="shrink-0 p-3 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition border border-slate-200"
              title="Refresh Campaigns"
            >
              <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
            </button>

            <button
              type="button"
              onClick={handleOpenCreate}
              className="shrink-0 whitespace-nowrap flex items-center gap-2 px-5 py-3 bg-[#1d1d1f] hover:bg-black text-white text-sm font-semibold rounded-xl shadow-sm transition active:scale-95"
            >
              <Plus size={18} />
              <span>Create Promotion</span>
            </button>
          </div>
        </div>

        {/* KPI Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-100">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
            <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
              <span>Active Live</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-1">{metrics.active}</div>
          </div>
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
            <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
              <span>Drafts &amp; Scheduled</span>
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-1">{metrics.drafts}</div>
          </div>
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
            <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
              <span>Total Redemptions</span>
              <ShoppingBag size={14} className="text-slate-400" />
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-1">{metrics.totalRedemptions}</div>
          </div>
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
            <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
              <span>Gross Promo Savings</span>
              <Tag size={14} className="text-emerald-500" />
            </div>
            <div className="text-2xl font-bold text-emerald-600 mt-1">{formatGhs(metrics.totalSavings)}</div>
          </div>
        </div>
      </div>

      {/* 2. Filters & Navigation Tabs */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3">
        {/* Full-width scrollable Tabs Row */}
        <div className="w-full overflow-x-auto scrollbar-none pb-1 pt-0.5">
          <div className="flex items-center gap-2 min-w-max">
            {(
              [
                { key: "all", label: "All Campaigns", count: promotions.length },
                { key: "active", label: "Active", count: promotions.filter((p) => p.status === "active" && p.isEnabled).length },
                { key: "draft", label: "Drafts", count: promotions.filter((p) => p.status === "draft").length },
                { key: "scheduled", label: "Scheduled", count: promotions.filter((p) => p.status === "scheduled").length },
                { key: "expired", label: "Expired", count: promotions.filter((p) => p.status === "expired").length },
                { key: "archived", label: "Archived", count: promotions.filter((p) => p.status === "archived").length },
              ] as const
            ).map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`shrink-0 whitespace-nowrap px-4 py-2.5 text-xs font-semibold rounded-xl transition flex items-center gap-2 ${
                  activeTab === tab.key
                    ? "bg-[#1d1d1f] text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <span>{tab.label}</span>
                <span className={`shrink-0 inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[11px] font-bold leading-none ${activeTab === tab.key ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"}`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Search & Type Filter Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100">
          <div className="relative flex-1 max-w-md">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search offers, campaigns, or products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-black"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X size={13} />
              </button>
            )}
          </div>

          <div className="shrink-0 flex items-center gap-2">
            <span className="text-xs font-medium text-slate-500 hidden sm:inline">Filter Type:</span>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:bg-white focus:outline-none text-slate-700 font-medium"
            >
              <option value="all">All Promotion Types</option>
              <option value="bundle">Bundle Offers</option>
              <option value="free_gift">Free Gifts</option>
              <option value="percentage_discount">% Discounts</option>
              <option value="fixed_discount">Fixed Discounts</option>
              <option value="promotional_price">Special Prices</option>
              <option value="advertising">Advertising Only</option>
            </select>
          </div>
        </div>

        {/* 3. Campaign Cards Grid */}
        <div className="divide-y divide-slate-100 border-t border-slate-100 pt-2">
          {filteredPromotions.length === 0 ? (
            <div className="text-center py-16 px-4">
              <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl grid place-items-center mx-auto mb-3">
                <Tag size={26} />
              </div>
              <h3 className="text-sm font-bold text-slate-900">No campaigns found</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                {searchQuery || typeFilter !== "all"
                  ? "Try clearing filters to find what you are looking for."
                  : "Launch a promotional offer or combo bundle to boost customer orders."}
              </p>
              <button
                type="button"
                onClick={handleOpenCreate}
                className="mt-4 px-4 py-2 bg-[#1d1d1f] hover:bg-black text-white text-xs font-semibold rounded-xl inline-flex items-center gap-1.5 shadow-sm"
              >
                <Plus size={15} />
                <span>Create First Promotion</span>
              </button>
            </div>
          ) : (
            filteredPromotions.map((promo) => {
              const flyer = promo.desktopFlyerUrl || promo.mobileFlyerUrl;
              const isBundle = promo.promotionType === "bundle";
              const isGift = promo.promotionType === "free_gift";

              return (
                <div key={promo.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group">
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    {/* Thumbnail */}
                    <div className="w-20 h-20 sm:w-24 sm:h-20 bg-slate-100 border border-slate-200 rounded-xl overflow-hidden shrink-0 grid place-items-center relative">
                      {flyer ? (
                        <img src={flyer} alt={promo.title} className="w-full h-full object-cover" />
                      ) : (
                        <ImageIcon size={22} className="text-slate-400" />
                      )}
                      {promo.showOnAnnouncementBar && (
                        <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-blue-500 border border-white" title="Active on Announcement Bar" />
                      )}
                    </div>

                    {/* Information */}
                    <div className="space-y-1.5 min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md shrink-0 ${
                            promo.status === "active" && promo.isEnabled
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : promo.status === "draft"
                              ? "bg-slate-100 text-slate-700 border border-slate-200"
                              : promo.status === "scheduled"
                              ? "bg-blue-50 text-blue-700 border border-blue-200"
                              : "bg-amber-50 text-amber-700 border border-amber-200"
                          }`}
                        >
                          {promo.status === "active" && !promo.isEnabled ? "Paused" : promo.status}
                        </span>

                        <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md flex items-center gap-1 shrink-0">
                          {isBundle ? <Package size={11} /> : isGift ? <Gift size={11} /> : <Tag size={11} />}
                          <span>{promo.promotionType.replace(/_/g, " ")}</span>
                        </span>

                        {promo.promotionalPrice && (
                          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100 shrink-0">
                            {formatGhs(promo.promotionalPrice)}
                          </span>
                        )}
                      </div>

                      <h4 className="text-sm font-bold text-slate-900 group-hover:text-black transition truncate">
                        {promo.title}
                      </h4>

                      <p className="text-xs text-slate-500 line-clamp-1 max-w-xl">
                        {promo.shortDescription || promo.detailedDescription}
                      </p>

                      <div className="flex items-center gap-4 text-[11px] text-slate-400 pt-0.5">
                        <span className="flex items-center gap-1 shrink-0">
                          <ShoppingBag size={12} />
                          <span>{promo.currentRedemptions || 0} claimed</span>
                        </span>
                        {promo.startDate && promo.endDate && (
                          <span className="flex items-center gap-1 shrink-0">
                            <Clock size={12} />
                            <span>{new Date(promo.startDate).toLocaleDateString()} – {new Date(promo.endDate).toLocaleDateString()}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Actions */}
                  <div className="shrink-0 flex items-center gap-2 self-end sm:self-center">
                    {/* Enable/Disable Toggle */}
                    <button
                      type="button"
                      onClick={() => void handleToggleEnabled(promo)}
                      className={`shrink-0 p-2 rounded-xl border transition ${
                        promo.isEnabled
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                          : "bg-slate-100 text-slate-400 border-slate-200 hover:text-slate-700"
                      }`}
                      title={promo.isEnabled ? "Unpublish Campaign" : "Publish Live"}
                    >
                      <Power size={16} />
                    </button>

                    {/* Edit */}
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(promo)}
                      className="shrink-0 whitespace-nowrap px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-xl border border-slate-200 transition flex items-center gap-1.5"
                    >
                      <Edit3 size={14} />
                      <span>Edit</span>
                    </button>

                    {/* Duplicate */}
                    <button
                      type="button"
                      onClick={() => void handleDuplicate(promo)}
                      className="shrink-0 whitespace-nowrap p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition border border-slate-200"
                      title="Duplicate Campaign as Draft"
                    >
                      <Copy size={16} />
                    </button>

                    {/* Archive / Restore */}
                    <button
                      type="button"
                      onClick={() => void handleArchive(promo)}
                      className="shrink-0 whitespace-nowrap p-2 text-slate-500 hover:text-amber-700 hover:bg-amber-50 rounded-xl transition border border-slate-200"
                      title={promo.status === "archived" ? "Restore Campaign" : "Archive Campaign"}
                    >
                      {promo.status === "archived" ? <RotateCcw size={16} /> : <Archive size={16} />}
                    </button>

                    {/* Delete Permanently */}
                    <button
                      type="button"
                      onClick={() => {
                        if ((promo.ordersCount ?? 0) > 0 || (promo.currentRedemptions ?? 0) > 0) {
                          alert(`This campaign is linked to ${promo.ordersCount} orders and cannot be permanently deleted. Please Archive it instead to preserve sales history.`);
                          return;
                        }
                        setDeleteCandidate(promo);
                        setDeleteInput("");
                      }}
                      className="shrink-0 whitespace-nowrap p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition border border-slate-200"
                      title="Delete Permanently"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 4. CAMPAIGN CREATION & EDITING WIZARD MODAL */}
      {isEditorOpen && editingCampaign && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white w-full max-w-4xl rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
              <div className="flex items-center gap-3">
                <span className="p-2 bg-slate-900 text-white rounded-xl shadow-xs">
                  <Sparkles size={18} />
                </span>
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    {editingCampaign.id?.startsWith("promo-") && !editingCampaign.updatedAt ? "Create New Promotion" : "Edit Promotion"}
                  </h2>
                  <p className="text-xs text-slate-500">
                    Step {
                      activeStep === "basics" ? "1 of 7: Details" :
                      activeStep === "type" ? "2 of 7: Offer Model" :
                      activeStep === "product" ? "3 of 7: Product / Bundle & Scope" :
                      activeStep === "rules" ? "4 of 7: Rules, Stock & Tiers" :
                      activeStep === "flyers" ? "5 of 7: Flyers & Media" :
                      activeStep === "placement" ? "6 of 7: Placement & Flight" :
                      "7 of 7: Review & Publish"
                    }
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsEditorOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-200/60 transition"
              >
                <X size={20} />
              </button>
            </div>

            {/* Step Breadcrumb Bar */}
            <div className="px-6 py-2.5 bg-slate-100/70 border-b border-slate-200 flex items-center gap-2 overflow-x-auto text-xs font-semibold scrollbar-none">
              {(
                [
                  { key: "basics", label: "1. Details" },
                  { key: "type", label: "2. Offer Type" },
                  { key: "product", label: "3. Product / Bundle" },
                  { key: "rules", label: "4. Rules & Stock" },
                  { key: "flyers", label: "5. Flyers & Media" },
                  { key: "placement", label: "6. Placement" },
                  { key: "preview", label: "7. Review & Publish" },
                ] as const
              ).map((step) => (
                <button
                  key={step.key}
                  type="button"
                  onClick={() => setActiveStep(step.key)}
                  className={`shrink-0 px-3 py-1.5 rounded-lg whitespace-nowrap transition ${
                    activeStep === step.key
                      ? "bg-white text-slate-900 shadow-sm border border-slate-200 font-bold"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {step.label}
                </button>
              ))}
            </div>

            {/* Error / Alert Banner */}
            {editorError && (
              <div className="mx-6 mt-4 p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-start gap-2.5">
                <AlertCircle size={16} className="text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold">{editorError}</div>
                  {validationErrors.length > 0 && (
                    <ul className="list-disc pl-4 mt-1 space-y-0.5 text-rose-700">
                      {validationErrors.map((err, idx) => (
                        <li key={idx}>{err}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            )}

            {saveSuccess && (
              <div className="mx-6 mt-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                <span>{saveSuccess}</span>
              </div>
            )}

            {/* Modal Scrollable Body */}
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              {/* STEP 1: BASICS */}
              {activeStep === "basics" && (
                <div className="space-y-5">
                  <div className="border-b border-slate-100 pb-3">
                    <h3 className="text-base font-bold text-slate-900">Promotion Details</h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Give your promotion a clear, catchy headline and brief summary for flyers and announcement bars.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Campaign Title <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Mega Discount Sale — Up to 15% Off"
                        value={editingCampaign.title || ""}
                        onChange={(e) => setEditingCampaign({ ...editingCampaign, title: e.target.value })}
                        className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-black"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Headline / Short Summary <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Save 10% to 15% on eligible premium devices priced above GH₵ 2,000."
                        value={editingCampaign.shortDescription || ""}
                        onChange={(e) => setEditingCampaign({ ...editingCampaign, shortDescription: e.target.value })}
                        className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-black"
                      />
                      <span className="text-[11px] text-slate-400 mt-1 block">Displayed on flyer cards, badges, and search results.</span>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Detailed Description &amp; Terms
                      </label>
                      <textarea
                        rows={3}
                        placeholder="Explain offer conditions, showroom physical inspection details, qualifying devices, warranty, and physical testing."
                        value={editingCampaign.detailedDescription || ""}
                        onChange={(e) => setEditingCampaign({ ...editingCampaign, detailedDescription: e.target.value })}
                        className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-black leading-relaxed"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: PROMOTION TYPE */}
              {activeStep === "type" && (
                <div className="space-y-5">
                  <div className="border-b border-slate-100 pb-3">
                    <h3 className="text-base font-bold text-slate-900">Choose Offer Model</h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Pick how your campaign benefits customers. The editor dynamically displays only the settings relevant to this model.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
                    {(
                      [
                        {
                          type: "bundle",
                          title: "Bundle Offer",
                          desc: "Package deal combining console, games, or accessories at a single combo price.",
                          icon: Package,
                          color: "amber",
                        },
                        {
                          type: "free_gift",
                          title: "Free Gift",
                          desc: "Complimentary gift item automatically added to customer's bag at GH₵ 0.",
                          icon: Gift,
                          color: "purple",
                        },
                        {
                          type: "percentage_discount",
                          title: "Percentage Discount",
                          desc: "Deduct e.g. 10% or 15% off qualifying catalogue products with optional price bands.",
                          icon: Percent,
                          color: "blue",
                        },
                        {
                          type: "fixed_discount",
                          title: "Fixed Discount",
                          desc: "Instant cash reduction (e.g. Save GH₵ 200) applied at checkout.",
                          icon: Tag,
                          color: "emerald",
                        },
                        {
                          type: "promotional_price",
                          title: "Promotional Price",
                          desc: "Set an explicit promotional price for a specific product with comparison strikethrough.",
                          icon: Sparkles,
                          color: "rose",
                        },
                        {
                          type: "advertising",
                          title: "Advertising Only",
                          desc: "Promotional flyer or announcement linking to a page without discount math.",
                          icon: Eye,
                          color: "slate",
                        },
                      ] as const
                    ).map((item) => {
                      const isSelected = editingCampaign.promotionType === item.type;
                      const Icon = item.icon;

                      return (
                        <div
                          key={item.type}
                          onClick={() => {
                            const nextType = item.type;
                            setEditingCampaign((prev) => {
                              if (!prev) return prev;
                              return {
                                ...prev,
                                promotionType: nextType,
                                ...(nextType !== "bundle" ? { bundleRequiredProductIds: [] } : {}),
                                ...(nextType === "percentage_discount" && (!prev.discountPercent || prev.discountPercent <= 0) ? { discountPercent: 10 } : {}),
                                ...(nextType === "fixed_discount" && (!prev.discountAmount || prev.discountAmount <= 0) ? { discountAmount: 100 } : {}),
                              };
                            });
                            if (nextType === "bundle") {
                              setProductMode("new_bundle");
                            } else {
                              setProductMode("existing");
                              setBundleItems([]);
                            }
                          }}
                          className={`p-4 rounded-xl border cursor-pointer transition flex flex-col justify-between ${
                            isSelected
                              ? "bg-slate-900 text-white border-black shadow-md ring-2 ring-black/20"
                              : "bg-slate-50 text-slate-800 border-slate-200 hover:border-slate-300 hover:bg-white"
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between">
                              <span className={`p-2 rounded-lg ${isSelected ? "bg-white/20 text-white" : "bg-white text-slate-700 shadow-sm"}`}>
                                <Icon size={18} />
                              </span>
                              {isSelected && <Check size={16} className="text-emerald-400" />}
                            </div>
                            <h4 className="font-bold text-sm mt-3">{item.title}</h4>
                            <p className={`text-xs mt-1 leading-relaxed ${isSelected ? "text-slate-300" : "text-slate-500"}`}>
                              {item.desc}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* STEP 3: PRODUCT SELECTION & ELIGIBILITY SCOPE */}
              {activeStep === "product" && (
                <div className="space-y-6">
                  {/* FOR PERCENTAGE DISCOUNTS, FIXED DISCOUNTS & FREE GIFTS */}
                  {(editingCampaign.promotionType === "percentage_discount" || editingCampaign.promotionType === "fixed_discount" || editingCampaign.promotionType === "free_gift") ? (
                    <div className="space-y-6">
                      <div className="border-b border-slate-100 pb-3">
                        <h3 className="text-base font-bold text-slate-900">Qualifying Products &amp; Discount Scope</h3>
                        <p className="text-xs text-slate-500 mt-1">
                          Choose which products or categories qualify for this {editingCampaign.promotionType.replace(/_/g, " ")}. Select Storewide, By Category, or Specific Products below.
                        </p>
                      </div>

                      {/* Scope Options */}
                      <div className="space-y-3">
                        <label className="block text-xs font-bold text-slate-700">1. Select Application Scope</label>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          {/* Storewide */}
                          <button
                            type="button"
                            id="scope-storewide-btn"
                            onClick={() => {
                              setDiscountScope("storewide");
                              setEditingCampaign((prev) => ({
                                ...prev!,
                                eligibleCategory: "all",
                                eligibleProductIds: [],
                              }));
                            }}
                            className={`p-3.5 rounded-xl border text-left transition flex flex-col justify-between ${
                              discountScope === "storewide"
                                ? "bg-slate-900 text-white border-black shadow-sm ring-2 ring-black/20"
                                : "bg-slate-50 text-slate-800 border-slate-200 hover:bg-white"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-xs">Storewide (All Products)</span>
                              {discountScope === "storewide" && <Check size={14} className="text-emerald-400" />}
                            </div>
                            <div className={`text-[11px] mt-1 ${discountScope === "storewide" ? "text-slate-300" : "text-slate-500"}`}>
                              Applies automatically to any eligible product added to bag.
                            </div>
                          </button>

                          {/* By Category */}
                          <button
                            type="button"
                            id="scope-category-btn"
                            onClick={() => {
                              setDiscountScope("category");
                              setEditingCampaign((prev) => ({
                                ...prev!,
                                eligibleCategory: prev?.eligibleCategory && prev.eligibleCategory !== "all" ? prev.eligibleCategory : "Smartphones",
                                eligibleProductIds: [],
                              }));
                            }}
                            className={`p-3.5 rounded-xl border text-left transition flex flex-col justify-between ${
                              discountScope === "category"
                                ? "bg-slate-900 text-white border-black shadow-sm ring-2 ring-black/20"
                                : "bg-slate-50 text-slate-800 border-slate-200 hover:bg-white"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-xs">By Category</span>
                              {discountScope === "category" && <Check size={14} className="text-emerald-400" />}
                            </div>
                            <div className={`text-[11px] mt-1 ${discountScope === "category" ? "text-slate-300" : "text-slate-500"}`}>
                              Applies to all products within a specific category.
                            </div>
                          </button>

                          {/* Specific Products */}
                          <button
                            type="button"
                            id="scope-specific-btn"
                            onClick={() => {
                              setDiscountScope("specific");
                              setEditingCampaign((prev) => ({
                                ...prev!,
                                eligibleCategory: "all",
                              }));
                            }}
                            className={`p-3.5 rounded-xl border text-left transition flex flex-col justify-between ${
                              discountScope === "specific"
                                ? "bg-slate-900 text-white border-black shadow-sm ring-2 ring-black/20"
                                : "bg-slate-50 text-slate-800 border-slate-200 hover:bg-white"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-xs">
                                Specific Products ({editingCampaign.eligibleProductIds?.length || 0})
                              </span>
                              {discountScope === "specific" && <Check size={14} className="text-emerald-400" />}
                            </div>
                            <div className={`text-[11px] mt-1 ${discountScope === "specific" ? "text-slate-300" : "text-slate-500"}`}>
                              Hand-pick qualifying items with live catalog search.
                            </div>
                          </button>
                        </div>
                      </div>

                      {/* If Category Scope is active */}
                      {discountScope === "category" && (
                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
                          <label className="block text-xs font-bold text-slate-700">Select Qualifying Category</label>
                          <select
                            value={editingCampaign.eligibleCategory && editingCampaign.eligibleCategory !== "all" ? editingCampaign.eligibleCategory : "Smartphones"}
                            onChange={(e) => setEditingCampaign({ ...editingCampaign, eligibleCategory: e.target.value })}
                            className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black font-semibold text-slate-900"
                          >
                            <option value="Smartphones">Smartphones</option>
                            <option value="iPhones">iPhones</option>
                            <option value="MacBooks">MacBooks</option>
                            <option value="iPads">iPads</option>
                            <option value="Apple Watches">Apple Watches</option>
                            <option value="AirPods">AirPods</option>
                            <option value="Game Consoles">Game Consoles</option>
                            <option value="Accessories">Accessories</option>
                            <option value="Electronics">Electronics</option>
                          </select>
                        </div>
                      )}

                      {/* Specific Products Search & Picker (active when Specific Products scope is selected) */}
                      {discountScope === "specific" && (
                        <div className="space-y-3 bg-slate-50/70 border border-slate-200 rounded-2xl p-4 sm:p-5">
                          <div className="flex items-center justify-between">
                            <div>
                              <label className="block text-xs font-bold text-slate-800">
                                2. Search &amp; Select Qualifying Products
                              </label>
                              <span className="text-[11px] text-slate-500">
                                Search by product name, model, brand, category, or SKU. Selected: {editingCampaign.eligibleProductIds?.length || 0}
                              </span>
                            </div>
                            {editingCampaign.eligibleProductIds && editingCampaign.eligibleProductIds.length > 0 && (
                              <button
                                type="button"
                                onClick={() => setEditingCampaign({ ...editingCampaign, eligibleProductIds: [] })}
                                className="text-xs text-rose-600 hover:text-rose-700 font-semibold"
                              >
                                Clear all ({editingCampaign.eligibleProductIds.length})
                              </button>
                            )}
                          </div>

                          <div className="relative">
                            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                              type="text"
                              id="product-search-input"
                              placeholder="Search catalog by product name, model, category, brand, or SKU..."
                              value={productSearch}
                              onChange={(e) => setProductSearch(e.target.value)}
                              className="w-full pl-10 pr-4 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black font-medium"
                            />
                            {productSearch && (
                              <button
                                type="button"
                                onClick={() => setProductSearch("")}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                              >
                                <X size={14} />
                              </button>
                            )}
                          </div>

                          {/* Selected chips bar */}
                          {editingCampaign.eligibleProductIds && editingCampaign.eligibleProductIds.length > 0 && (
                            <div className="p-3 bg-blue-50/80 border border-blue-200 rounded-xl">
                              <div className="text-[11px] font-bold text-blue-900 mb-2">
                                {editingCampaign.eligibleProductIds.length} Products Selected:
                              </div>
                              <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto">
                                {editingCampaign.eligibleProductIds.map((pid) => {
                                  const prod = products.find((p) => p.id === pid || p.slug === pid);
                                  return (
                                    <span
                                      key={pid}
                                      className="inline-flex items-center gap-1.5 bg-white border border-blue-200 px-2.5 py-1 rounded-lg text-xs font-semibold text-blue-900 shadow-2xs"
                                    >
                                      <span>{prod?.name || pid}</span>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setEditingCampaign({
                                            ...editingCampaign,
                                            eligibleProductIds: editingCampaign.eligibleProductIds?.filter((id) => id !== pid) || [],
                                          });
                                        }}
                                        className="text-blue-400 hover:text-rose-600 transition"
                                      >
                                        <X size={12} />
                                      </button>
                                    </span>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          {/* Searchable Product checklist */}
                          <div className="max-h-64 overflow-y-auto border border-slate-200 rounded-xl divide-y divide-slate-100 bg-white shadow-2xs">
                            {filteredProductsForSelection.slice(0, 30).map((p) => {
                              const isSelected = editingCampaign.eligibleProductIds?.includes(p.id) || editingCampaign.eligibleProductIds?.includes(p.slug);
                              return (
                                <div
                                  key={p.id}
                                  onClick={() => {
                                    const currentList = editingCampaign.eligibleProductIds || [];
                                    const nextList = isSelected
                                      ? currentList.filter((id) => id !== p.id && id !== p.slug)
                                      : [...currentList, p.id];
                                    setEditingCampaign({
                                      ...editingCampaign,
                                      eligibleProductIds: nextList,
                                    });
                                  }}
                                  className={`p-3 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition ${
                                    isSelected ? "bg-blue-50/60 font-semibold" : ""
                                  }`}
                                >
                                  <div className="flex items-center gap-3 min-w-0">
                                    <input
                                      type="checkbox"
                                      checked={Boolean(isSelected)}
                                      onChange={() => {}}
                                      className="w-4 h-4 rounded text-black border-slate-300 focus:ring-black"
                                    />
                                    <img
                                      src={p.images[0]?.src || "/placeholder.webp"}
                                      alt={p.name}
                                      className="w-10 h-10 rounded-lg object-cover bg-slate-100 shrink-0 border border-slate-200"
                                    />
                                    <div className="min-w-0">
                                      <div className="text-xs font-semibold text-slate-900 truncate">{p.name}</div>
                                      <div className="text-[11px] text-slate-400">
                                        {p.category} {p.brand ? `· ${p.brand}` : ""} · {formatGhs(p.price)}
                                      </div>
                                    </div>
                                  </div>
                                  <span className={`text-[11px] px-2.5 py-1 rounded-md font-semibold transition shrink-0 ${
                                    isSelected ? "bg-blue-100 text-blue-800" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                  }`}>
                                    {isSelected ? "Selected" : "Add to Offer"}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Storage / Capacity Option Constraints (Optional) */}
                      <div className="space-y-2 pt-2 border-t border-slate-100">
                        <label className="block text-xs font-bold text-slate-700">
                          Storage / Capacity Constraints (Optional)
                        </label>
                        <p className="text-[11px] text-slate-500">
                          Leave empty to apply to all capacities. Or select specific storage tiers that qualify:
                        </p>
                        <div className="flex flex-wrap gap-2 pt-1">
                          {["64GB", "128GB", "256GB", "512GB", "1TB", "2TB"].map((cap) => {
                            const isCapSelected = editingCampaign.eligibleStorageOptions?.includes(cap);
                            return (
                              <button
                                key={cap}
                                type="button"
                                onClick={() => {
                                  const current = editingCampaign.eligibleStorageOptions || [];
                                  const next = isCapSelected
                                    ? current.filter((c) => c !== cap)
                                    : [...current, cap];
                                  setEditingCampaign({ ...editingCampaign, eligibleStorageOptions: next });
                                }}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                                  isCapSelected
                                    ? "bg-slate-900 text-white shadow-sm"
                                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                }`}
                              >
                                {isCapSelected && <Check size={12} />}
                                <span>{cap}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  ) : editingCampaign.promotionType === "promotional_price" ? (
                    /* FOR PROMOTIONAL PRICE (Select Target Product) */
                    <div className="space-y-6">
                      <div className="border-b border-slate-100 pb-3">
                        <h3 className="text-base font-bold text-slate-900">Select Target Product</h3>
                        <p className="text-xs text-slate-500 mt-1">
                          Choose the single product from your catalogue that receives this temporary special promotional price.
                        </p>
                      </div>

                      <div className="space-y-4">
                        <div className="relative">
                          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input
                            type="text"
                            placeholder="Search catalogue by product name, model, or brand..."
                            value={productSearch}
                            onChange={(e) => setProductSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-black"
                          />
                        </div>

                        {selectedExistingProduct && (
                          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <img
                                src={selectedExistingProduct.images[0]?.src || "/placeholder.webp"}
                                alt={selectedExistingProduct.name}
                                className="w-12 h-12 rounded-lg object-cover bg-white border border-slate-200"
                              />
                              <div>
                                <div className="text-xs font-bold text-slate-900">{selectedExistingProduct.name}</div>
                                <div className="text-[11px] text-slate-500">
                                  {selectedExistingProduct.category} · Verified Price: {formatGhs(selectedExistingProduct.price)}
                                </div>
                              </div>
                            </div>
                            <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-lg">
                              Selected
                            </span>
                          </div>
                        )}

                        <div className="max-h-60 overflow-y-auto border border-slate-200 rounded-xl divide-y divide-slate-100 bg-white">
                          {filteredProductsForSelection.slice(0, 15).map((p) => {
                            const isChosen = selectedExistingProduct?.id === p.id || editingCampaign.eligibleProductIds?.includes(p.id);
                            return (
                              <div
                                key={p.id}
                                onClick={() => {
                                  setSelectedExistingProduct(p);
                                  setEditingCampaign({
                                    ...editingCampaign,
                                    eligibleProductIds: [p.id],
                                  });
                                }}
                                className={`p-3 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition ${
                                  isChosen ? "bg-slate-50 font-bold" : ""
                                }`}
                              >
                                <div className="flex items-center gap-3 min-w-0">
                                  <img
                                    src={p.images[0]?.src || "/placeholder.webp"}
                                    alt={p.name}
                                    className="w-10 h-10 rounded-lg object-cover bg-slate-100 shrink-0"
                                  />
                                  <div className="min-w-0">
                                    <div className="text-xs font-semibold text-slate-900 truncate">{p.name}</div>
                                    <div className="text-[11px] text-slate-400">{p.category} · {formatGhs(p.price)}</div>
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  className={`text-xs px-2.5 py-1 rounded-lg font-semibold transition ${
                                    isChosen ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                                  }`}
                                >
                                  {isChosen ? "Selected" : "Select"}
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  ) : editingCampaign.promotionType === "advertising" ? (
                    /* FOR ADVERTISING ONLY */
                    <div className="space-y-4 bg-slate-50 border border-slate-200 rounded-2xl p-6 text-center">
                      <div className="w-12 h-12 bg-white rounded-2xl border border-slate-200 grid place-items-center mx-auto text-slate-700 shadow-2xs">
                        <Eye size={22} />
                      </div>
                      <h4 className="text-sm font-bold text-slate-900">No Product Purchase Rule Required</h4>
                      <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                        Advertising campaigns display high-resolution flyers and announcement tickers across your storefront without applying shopping bag discounts. Shoppers clicking this promotion will be directed to your chosen call-to-action destination.
                      </p>
                    </div>
                  ) : (
                    /* FOR BUNDLE OFFERS */
                    <div className="space-y-6">
                      <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                        <div>
                          <h3 className="text-base font-bold text-slate-900">Target Product or Custom Bundle</h3>
                          <p className="text-xs text-slate-500 mt-1">
                            Select an existing catalog product, or create a new promotional product/bundle without leaving this screen.
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={handlePreloadPs5Combo}
                          className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold rounded-xl border border-amber-200 transition"
                        >
                          ⚡ Preload PS5 Combo Data
                        </button>
                      </div>

                      {/* Mode Selector Toggle */}
                      <div className="grid grid-cols-2 gap-3 p-1.5 bg-slate-100 rounded-xl">
                        <button
                          type="button"
                          onClick={() => setProductMode("existing")}
                          className={`py-2 text-xs font-bold rounded-lg transition ${
                            productMode === "existing"
                              ? "bg-white text-slate-900 shadow-sm"
                              : "text-slate-600 hover:text-slate-900"
                          }`}
                        >
                          Option A: Select Existing Product
                        </button>
                        <button
                          type="button"
                          onClick={() => setProductMode("new_bundle")}
                          className={`py-2 text-xs font-bold rounded-lg transition ${
                            productMode === "new_bundle"
                              ? "bg-white text-slate-900 shadow-sm"
                              : "text-slate-600 hover:text-slate-900"
                          }`}
                        >
                          Option B: Create New Promotional Product or Bundle
                        </button>
                      </div>

                      {/* OPTION A: SELECT EXISTING PRODUCT */}
                      {productMode === "existing" && (
                        <div className="space-y-4">
                          <div className="relative">
                            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                              type="text"
                              placeholder="Search product by name, brand, or category..."
                              value={productSearch}
                              onChange={(e) => setProductSearch(e.target.value)}
                              className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-black"
                            />
                          </div>

                          {selectedExistingProduct && (
                            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <img
                                  src={selectedExistingProduct.images[0]?.src || "/placeholder.webp"}
                                  alt={selectedExistingProduct.name}
                                  className="w-12 h-12 rounded-lg object-cover bg-white border border-slate-200"
                                />
                                <div>
                                  <div className="text-xs font-bold text-slate-900">{selectedExistingProduct.name}</div>
                                  <div className="text-[11px] text-slate-500">
                                    {selectedExistingProduct.category} · {formatGhs(selectedExistingProduct.price)} · {selectedExistingProduct.stockStatus}
                                  </div>
                                </div>
                              </div>
                              <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-lg">
                                Selected
                              </span>
                            </div>
                          )}

                          <div className="max-h-60 overflow-y-auto border border-slate-200 rounded-xl divide-y divide-slate-100 bg-white">
                            {filteredProductsForSelection.slice(0, 15).map((p) => {
                              const isChosen = selectedExistingProduct?.id === p.id || editingCampaign.eligibleProductIds?.includes(p.id);
                              return (
                                <div
                                  key={p.id}
                                  onClick={() => {
                                    setSelectedExistingProduct(p);
                                    setEditingCampaign({
                                      ...editingCampaign,
                                      eligibleProductIds: [p.id],
                                      bundleRequiredProductIds: [p.id],
                                    });
                                  }}
                                  className={`p-3 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition ${
                                    isChosen ? "bg-slate-50 font-bold" : ""
                                  }`}
                                >
                                  <div className="flex items-center gap-3 min-w-0">
                                    <img
                                      src={p.images[0]?.src || "/placeholder.webp"}
                                      alt={p.name}
                                      className="w-10 h-10 rounded-lg object-cover bg-slate-100 shrink-0"
                                    />
                                    <div className="min-w-0">
                                      <div className="text-xs font-semibold text-slate-900 truncate">{p.name}</div>
                                      <div className="text-[11px] text-slate-400">{p.category} · {formatGhs(p.price)}</div>
                                    </div>
                                  </div>
                                  <button
                                    type="button"
                                    className={`text-xs px-2.5 py-1 rounded-lg font-semibold transition ${
                                      isChosen ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                                    }`}
                                  >
                                    {isChosen ? "Selected" : "Select"}
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* OPTION B: CREATE NEW PRODUCT OR BUNDLE */}
                      {productMode === "new_bundle" && (
                        <div className="bg-slate-50/70 border border-slate-200 rounded-2xl p-5 space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                              New Bundle / Canonical Product Details
                            </span>
                            <span className="text-[11px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full">
                              Will be added to catalog
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-bold text-slate-700 mb-1">Bundle Title *</label>
                              <input
                                type="text"
                                placeholder="e.g. PS5 Slim Combo Offer"
                                value={newProductData.name}
                                onChange={(e) => setNewProductData({ ...newProductData, name: e.target.value })}
                                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-bold text-slate-700 mb-1">Category *</label>
                              <select
                                value={newProductData.category}
                                onChange={(e) => setNewProductData({ ...newProductData, category: e.target.value as ProductCategory })}
                                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none"
                              >
                                <option value="Game Consoles">Game Consoles</option>
                                <option value="Smartphones">Smartphones</option>
                                <option value="iPhones">iPhones</option>
                                <option value="MacBooks">MacBooks</option>
                                <option value="iPads">iPads</option>
                                <option value="Accessories">Accessories</option>
                              </select>
                            </div>

                            <div>
                              <label className="block text-xs font-bold text-slate-700 mb-1">Brand</label>
                              <input
                                type="text"
                                placeholder="e.g. Sony"
                                value={newProductData.brand}
                                onChange={(e) => setNewProductData({ ...newProductData, brand: e.target.value })}
                                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none"
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-bold text-slate-700 mb-1">Model</label>
                              <input
                                type="text"
                                placeholder="e.g. PlayStation 5 Slim Standard"
                                value={newProductData.model}
                                onChange={(e) => setNewProductData({ ...newProductData, model: e.target.value })}
                                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none"
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-bold text-slate-700 mb-1">Condition</label>
                              <select
                                value={newProductData.condition}
                                onChange={(e) => setNewProductData({ ...newProductData, condition: e.target.value as ProductCondition })}
                                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none"
                              >
                                <option value="Brand New">Brand New</option>
                                <option value="UK Used">UK Used</option>
                                <option value="Open Box">Open Box</option>
                              </select>
                            </div>

                            <div>
                              <label className="block text-xs font-bold text-slate-700 mb-1">Confirmed Inventory Stock *</label>
                              <input
                                type="number"
                                min="0"
                                placeholder="1"
                                value={newProductData.stockQuantity || ""}
                                onChange={(e) => setNewProductData({ ...newProductData, stockQuantity: Number(e.target.value) })}
                                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black font-semibold"
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-bold text-slate-700 mb-1">Bundle Checkout Price (GH₵) *</label>
                              <input
                                type="number"
                                min="0"
                                placeholder="7500"
                                value={newProductData.price || ""}
                                onChange={(e) => {
                                  const val = Number(e.target.value);
                                  setNewProductData({ ...newProductData, price: val });
                                  setEditingCampaign({ ...editingCampaign, promotionalPrice: val });
                                }}
                                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black font-bold"
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-bold text-slate-700 mb-1">Purchase Action</label>
                              <select
                                value={newProductData.purchaseAction}
                                onChange={(e) => setNewProductData({ ...newProductData, purchaseAction: e.target.value as ProductPurchaseAction })}
                                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none"
                              >
                                <option value="buy">Direct Checkout (Buy Now)</option>
                                <option value="enquire">WhatsApp Enquiry</option>
                              </select>
                            </div>
                          </div>

                          {/* INCLUDED ITEMS BUILDER */}
                          <div className="space-y-3 pt-2 border-t border-slate-200">
                            <div className="flex items-center justify-between">
                              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                                <Layers size={14} className="text-slate-500" />
                                <span>Included Package Items ({bundleItems.length})</span>
                              </label>
                              <span className="text-[11px] text-slate-400">Checkout charges the single bundle price GH₵{newProductData.price.toLocaleString()} once.</span>
                            </div>

                            {/* Items list */}
                            <div className="space-y-2">
                              {bundleItems.map((item, idx) => (
                                <div key={item.id} className="p-2.5 bg-white border border-slate-200 rounded-xl flex items-center justify-between gap-3 text-xs">
                                  <div className="flex items-center gap-2 min-w-0">
                                    <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 font-bold grid place-items-center text-[10px] shrink-0">
                                      {idx + 1}
                                    </span>
                                    <span className="font-semibold text-slate-900 truncate">{item.name}</span>
                                    {item.condition && (
                                      <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full shrink-0">
                                        {item.condition}
                                      </span>
                                    )}
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveBundleItem(item.id)}
                                    className="p-1 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition"
                                    title="Remove item"
                                  >
                                    <Trash2 size={13} />
                                  </button>
                                </div>
                              ))}
                            </div>

                            {/* Add Item Row */}
                            <div className="flex items-center gap-2 pt-1">
                              <input
                                type="text"
                                placeholder="Add included item (e.g. EA Sports FC 25 Game, 2 DualSense Controllers)..."
                                value={newBundleItemText}
                                onChange={(e) => setNewBundleItemText(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    e.preventDefault();
                                    handleAddBundleItem();
                                  }
                                }}
                                className="flex-1 px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
                              />
                              <select
                                value={newBundleItemCondition}
                                onChange={(e) => setNewBundleItemCondition(e.target.value)}
                                className="px-2.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none"
                              >
                                <option value="Brand New">Brand New</option>
                                <option value="UK Used">UK Used</option>
                                <option value="Excellent">Excellent</option>
                              </select>
                              <button
                                type="button"
                                onClick={handleAddBundleItem}
                                className="px-3 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-black transition shrink-0 flex items-center gap-1"
                              >
                                <Plus size={14} />
                                <span>Add</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* STEP 4: RULES, STOCK, TIERS & LIMITS */}
              {activeStep === "rules" && (
                <div className="space-y-6">
                  <div className="border-b border-slate-100 pb-3">
                    <h3 className="text-base font-bold text-slate-900">Configure Benefits, Tiers &amp; Rules</h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Showing only the rules and constraints applicable to <strong>{editingCampaign.promotionType?.replace(/_/g, " ")}</strong>.
                    </p>
                  </div>

                  {/* PERCENTAGE DISCOUNT RULES & MULTIPLE TIERS */}
                  {editingCampaign.promotionType === "percentage_discount" && (
                    <div className="space-y-6">
                      {/* Calculation Mode Selector */}
                      <div className="space-y-2">
                        <label className="block text-xs font-bold text-slate-700">Discount Calculation Mode</label>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <button
                            type="button"
                            onClick={() => setEditingCampaign({ ...editingCampaign, discountCalculationMode: "single_percent" })}
                            className={`p-3 rounded-xl border text-left transition ${
                              (editingCampaign.discountCalculationMode || "single_percent") === "single_percent"
                                ? "bg-blue-900 text-white border-blue-900 shadow-sm"
                                : "bg-slate-50 text-slate-800 border-slate-200 hover:bg-white"
                            }`}
                          >
                            <div className="font-bold text-xs">Single Percentage</div>
                            <div className={`text-[11px] mt-0.5 ${(editingCampaign.discountCalculationMode || "single_percent") === "single_percent" ? "text-blue-200" : "text-slate-500"}`}>
                              Flat percentage across all qualifying items.
                            </div>
                          </button>

                          <button
                            type="button"
                            onClick={() => setEditingCampaign({ ...editingCampaign, discountCalculationMode: "price_tiers" })}
                            className={`p-3 rounded-xl border text-left transition ${
                              editingCampaign.discountCalculationMode === "price_tiers"
                                ? "bg-blue-900 text-white border-blue-900 shadow-sm"
                                : "bg-slate-50 text-slate-800 border-slate-200 hover:bg-white"
                            }`}
                          >
                            <div className="font-bold text-xs flex items-center justify-between">
                              <span>Price Range Tiers</span>
                              {editingCampaign.discountCalculationMode === "price_tiers" && <Check size={13} className="text-emerald-400" />}
                            </div>
                            <div className={`text-[11px] mt-0.5 ${editingCampaign.discountCalculationMode === "price_tiers" ? "text-blue-200" : "text-slate-500"}`}>
                              e.g. 10% on GH₵2k-4k, 15% on &gt;GH₵4k.
                            </div>
                          </button>

                          <button
                            type="button"
                            onClick={() => setEditingCampaign({ ...editingCampaign, discountCalculationMode: "product_specific" })}
                            className={`p-3 rounded-xl border text-left transition ${
                              editingCampaign.discountCalculationMode === "product_specific"
                                ? "bg-blue-900 text-white border-blue-900 shadow-sm"
                                : "bg-slate-50 text-slate-800 border-slate-200 hover:bg-white"
                            }`}
                          >
                            <div className="font-bold text-xs">Product-Specific %</div>
                            <div className={`text-[11px] mt-0.5 ${editingCampaign.discountCalculationMode === "product_specific" ? "text-blue-200" : "text-slate-500"}`}>
                              Assign individual percentage to each selected item.
                            </div>
                          </button>
                        </div>
                      </div>

                      {/* MODE 1: SINGLE PERCENTAGE */}
                      {(editingCampaign.discountCalculationMode || "single_percent") === "single_percent" && (
                        <div className="bg-blue-50/50 border border-blue-200 rounded-2xl p-5 space-y-4">
                          <div className="flex items-center gap-2 text-blue-900 font-bold text-sm">
                            <Percent size={17} className="text-blue-700" />
                            <span>Flat Percentage Discount</span>
                          </div>

                          <div className="w-full sm:w-64">
                            <label className="block text-xs font-bold text-slate-700 mb-1">Discount Percent (%) *</label>
                            <input
                              type="number"
                              min="1"
                              max="100"
                              placeholder="10"
                              value={editingCampaign.discountPercent || ""}
                              onChange={(e) => setEditingCampaign({ ...editingCampaign, discountPercent: Number(e.target.value) })}
                              className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black font-bold"
                            />
                          </div>
                        </div>
                      )}

                      {/* MODE 2: PRICE RANGE TIERS BUILDER */}
                      {editingCampaign.discountCalculationMode === "price_tiers" && (
                        <div className="bg-blue-50/50 border border-blue-200 rounded-2xl p-5 space-y-4">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div className="flex items-center gap-2 text-blue-900 font-bold text-sm">
                              <Sliders size={17} className="text-blue-700" />
                              <span>Discount Price Bands (Tiers)</span>
                            </div>

                            <button
                              type="button"
                              onClick={handlePreloadMegaDiscountTiers}
                              className="px-3 py-1.5 bg-white hover:bg-blue-100 text-blue-900 text-xs font-bold rounded-xl border border-blue-200 transition shrink-0"
                            >
                              ⚡ Load Mega Discount Sale Tiers (10% from GH₵2k, 15% from GH₵4k)
                            </button>
                          </div>

                          {/* Tiers List */}
                          <div className="space-y-2">
                            {(editingCampaign.discountTiers && editingCampaign.discountTiers.length > 0) ? (
                              editingCampaign.discountTiers.map((tier, idx) => (
                                <div key={tier.id || idx} className="p-3 bg-white border border-blue-200 rounded-xl flex items-center justify-between gap-3 text-xs">
                                  <div className="flex items-center gap-2 min-w-0">
                                    <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 font-bold grid place-items-center text-xs shrink-0">
                                      {idx + 1}
                                    </span>
                                    <div className="font-semibold text-slate-900">
                                      {tier.label || `GH₵ ${tier.minPrice.toLocaleString()}${tier.maxPrice ? ` – GH₵ ${tier.maxPrice.toLocaleString()}` : "+"} → ${tier.percent}% Off`}
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-3 shrink-0">
                                    <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 font-bold rounded-lg text-xs">
                                      {tier.percent}% OFF
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => handleRemovePriceTier(idx)}
                                      className="p-1 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition"
                                      title="Remove Tier"
                                    >
                                      <Trash2 size={14} />
                                    </button>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div className="p-4 bg-white/70 border border-dashed border-blue-200 rounded-xl text-center text-xs text-slate-500">
                                No price bands configured yet. Add your first tier below or click <strong>Load Mega Discount Sale Tiers</strong>.
                              </div>
                            )}
                          </div>

                          {/* Add Tier Form */}
                          <div className="p-3.5 bg-white border border-blue-200 rounded-xl space-y-3">
                            <div className="text-xs font-bold text-slate-800">Add New Price Tier:</div>
                            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                              <div>
                                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Min Price (GH₵) *</label>
                                <input
                                  type="number"
                                  min="0"
                                  placeholder="2000"
                                  value={newTierMinPrice}
                                  onChange={(e) => setNewTierMinPrice(e.target.value)}
                                  className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white"
                                />
                              </div>

                              <div>
                                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Max Price (GH₵)</label>
                                <input
                                  type="number"
                                  min="0"
                                  placeholder="Leave empty for +"
                                  value={newTierMaxPrice}
                                  onChange={(e) => setNewTierMaxPrice(e.target.value)}
                                  className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white"
                                />
                              </div>

                              <div>
                                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Discount (%) *</label>
                                <input
                                  type="number"
                                  min="1"
                                  max="100"
                                  placeholder="15"
                                  value={newTierPercent}
                                  onChange={(e) => setNewTierPercent(e.target.value)}
                                  className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white font-bold"
                                />
                              </div>

                              <div className="flex items-end">
                                <button
                                  type="button"
                                  onClick={handleAddPriceTier}
                                  className="w-full py-1.5 bg-blue-900 hover:bg-black text-white text-xs font-bold rounded-lg transition flex items-center justify-center gap-1"
                                >
                                  <Plus size={14} />
                                  <span>Add Tier</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* MODE 3: PRODUCT SPECIFIC % */}
                      {editingCampaign.discountCalculationMode === "product_specific" && (
                        <div className="bg-blue-50/50 border border-blue-200 rounded-2xl p-5 space-y-4">
                          <div className="flex items-center gap-2 text-blue-900 font-bold text-sm">
                            <Tag size={17} className="text-blue-700" />
                            <span>Product-Specific Discount Percentages</span>
                          </div>

                          {(editingCampaign.eligibleProductIds && editingCampaign.eligibleProductIds.length > 0) ? (
                            <div className="space-y-2">
                              {editingCampaign.eligibleProductIds.map((pid) => {
                                const prod = products.find((p) => p.id === pid || p.slug === pid);
                                const currentPct = editingCampaign.productDiscounts?.[pid] ?? editingCampaign.discountPercent ?? 10;
                                return (
                                  <div key={pid} className="p-3 bg-white border border-blue-200 rounded-xl flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-3 min-w-0">
                                      <img
                                        src={prod?.images[0]?.src || "/placeholder.webp"}
                                        alt={prod?.name || pid}
                                        className="w-9 h-9 rounded-lg object-cover bg-slate-100 shrink-0"
                                      />
                                      <div className="min-w-0">
                                        <div className="text-xs font-bold text-slate-900 truncate">{prod?.name || pid}</div>
                                        <div className="text-[11px] text-slate-500">{prod ? formatGhs(prod.price) : ""}</div>
                                      </div>
                                    </div>

                                    <div className="flex items-center gap-2 shrink-0">
                                      <input
                                        type="number"
                                        min="1"
                                        max="100"
                                        value={currentPct}
                                        onChange={(e) => {
                                          const next = { ...(editingCampaign.productDiscounts || {}), [pid]: Number(e.target.value) };
                                          setEditingCampaign({ ...editingCampaign, productDiscounts: next });
                                        }}
                                        className="w-20 px-2.5 py-1 text-xs bg-slate-50 border border-slate-200 rounded-lg text-right font-bold"
                                      />
                                      <span className="text-xs font-bold text-slate-700">% OFF</span>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <div className="p-4 bg-white/70 border border-dashed border-blue-200 rounded-xl text-center text-xs text-slate-500">
                              Please select specific products in <strong>Step 3</strong> to configure custom discount percentages.
                            </div>
                          )}
                        </div>
                      )}

                      {/* Thresholds & Constraints */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            Min Qualifying Product Price (GH₵)
                          </label>
                          <input
                            type="number"
                            min="0"
                            placeholder="e.g. 2000"
                            value={editingCampaign.minQualifyingItemPrice || ""}
                            onChange={(e) => setEditingCampaign({ ...editingCampaign, minQualifyingItemPrice: Number(e.target.value) })}
                            className="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black font-semibold"
                          />
                          <span className="text-[11px] text-slate-500 mt-1 block">
                            Only products individually priced at or above this amount qualify (e.g. &gt; GH₵ 2,000).
                          </span>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            Min Order Subtotal (GH₵)
                          </label>
                          <input
                            type="number"
                            min="0"
                            placeholder="0"
                            value={editingCampaign.minOrderSubtotal || ""}
                            onChange={(e) => setEditingCampaign({ ...editingCampaign, minOrderSubtotal: Number(e.target.value) })}
                            className="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black font-semibold"
                          />
                          <span className="text-[11px] text-slate-500 mt-1 block">
                            Optional total shopping bag subtotal threshold.
                          </span>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            Max Discount Amount Cap (GH₵)
                          </label>
                          <input
                            type="number"
                            min="0"
                            placeholder="Leave empty for no cap"
                            value={editingCampaign.maxDiscountAmount || ""}
                            onChange={(e) => setEditingCampaign({ ...editingCampaign, maxDiscountAmount: e.target.value ? Number(e.target.value) : null })}
                            className="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black font-semibold"
                          />
                          <span className="text-[11px] text-slate-500 mt-1 block">
                            Capped maximum discount savings.
                          </span>
                        </div>
                      </div>

                      {/* Exclusions Box */}
                      <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                        <label className="text-xs font-bold text-slate-800 block">Excluded Categories &amp; Products</label>
                        <p className="text-[11px] text-slate-500">
                          Prevent specific high-demand or low-margin categories from receiving discounts:
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {["Accessories", "Game Consoles", "Smartphones", "iPhones", "MacBooks", "iPads", "Apple Watches"].map((cat) => {
                            const isExcluded = editingCampaign.excludedCategories?.includes(cat);
                            return (
                              <button
                                key={cat}
                                type="button"
                                onClick={() => {
                                  const current = editingCampaign.excludedCategories || [];
                                  const next = isExcluded ? current.filter((c) => c !== cat) : [...current, cat];
                                  setEditingCampaign({ ...editingCampaign, excludedCategories: next });
                                }}
                                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                                  isExcluded ? "bg-rose-600 text-white shadow-2xs" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
                                }`}
                              >
                                {isExcluded ? `✕ Excluded: ${cat}` : `Exclude ${cat}`}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* FIXED DISCOUNT RULES */}
                  {editingCampaign.promotionType === "fixed_discount" && (
                    <div className="space-y-4 bg-emerald-50/50 border border-emerald-200 rounded-2xl p-5">
                      <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm">
                        <Tag size={17} className="text-emerald-700" />
                        <span>Fixed Cash Discount Rules</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Cash Discount Amount (GH₵) *</label>
                          <input
                            type="number"
                            min="1"
                            placeholder="200"
                            value={editingCampaign.discountAmount || ""}
                            onChange={(e) => setEditingCampaign({ ...editingCampaign, discountAmount: Number(e.target.value) })}
                            className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black font-bold"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Min Qualifying Item Price (GH₵)</label>
                          <input
                            type="number"
                            min="0"
                            placeholder="0"
                            value={editingCampaign.minQualifyingItemPrice || ""}
                            onChange={(e) => setEditingCampaign({ ...editingCampaign, minQualifyingItemPrice: Number(e.target.value) })}
                            className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black font-semibold"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Min Order Subtotal (GH₵)</label>
                          <input
                            type="number"
                            min="0"
                            placeholder="0"
                            value={editingCampaign.minOrderSubtotal || ""}
                            onChange={(e) => setEditingCampaign({ ...editingCampaign, minOrderSubtotal: Number(e.target.value) })}
                            className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* FREE GIFT RULES */}
                  {editingCampaign.promotionType === "free_gift" && (
                    <div className="bg-purple-50/50 border border-purple-200 rounded-2xl p-5 space-y-4">
                      <div className="flex items-center gap-2 text-purple-900 font-bold text-sm">
                        <Gift size={17} className="text-purple-700" />
                        <span>Free Gift Configuration</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Free Gift Item Name *</label>
                          <input
                            type="text"
                            placeholder="e.g. Apple iPhone Case with MagSafe"
                            value={editingCampaign.giftProductName || ""}
                            onChange={(e) => setEditingCampaign({ ...editingCampaign, giftProductName: e.target.value })}
                            className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black font-medium"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Allocated Gift Stock Quantity *</label>
                          <input
                            type="number"
                            min="0"
                            placeholder="50"
                            value={editingCampaign.giftStockQuantity || ""}
                            onChange={(e) => setEditingCampaign({ ...editingCampaign, giftStockQuantity: Number(e.target.value) })}
                            className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black font-semibold"
                          />
                          <span className="text-[11px] text-slate-500 mt-1 block">
                            Gifts are automatically suppressed if stock reaches 0.
                          </span>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Max Gifts Per Order</label>
                          <input
                            type="number"
                            min="1"
                            placeholder="1"
                            value={editingCampaign.maxGiftsPerOrder || 1}
                            onChange={(e) => setEditingCampaign({ ...editingCampaign, maxGiftsPerOrder: Number(e.target.value) })}
                            className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Min Order Subtotal for Gift (GH₵)</label>
                          <input
                            type="number"
                            min="0"
                            placeholder="0"
                            value={editingCampaign.minOrderSubtotal || ""}
                            onChange={(e) => setEditingCampaign({ ...editingCampaign, minOrderSubtotal: Number(e.target.value) })}
                            className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* PROMOTIONAL PRICE RULES */}
                  {editingCampaign.promotionType === "promotional_price" && (
                    <div className="bg-rose-50/50 border border-rose-200 rounded-2xl p-5 space-y-4">
                      <div className="flex items-center gap-2 text-rose-900 font-bold text-sm">
                        <Sparkles size={17} className="text-rose-700" />
                        <span>Special Promotional Price</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Special Promotional Price (GH₵) *</label>
                          <input
                            type="number"
                            min="1"
                            placeholder="4500"
                            value={editingCampaign.promotionalPrice || ""}
                            onChange={(e) => setEditingCampaign({ ...editingCampaign, promotionalPrice: Number(e.target.value) })}
                            className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black font-bold"
                          />
                        </div>

                        {selectedExistingProduct && (
                          <div className="p-3 bg-white border border-rose-200 rounded-xl flex items-center justify-between">
                            <div>
                              <div className="text-[11px] text-slate-500">Original Regular Price</div>
                              <div className="text-sm font-bold text-slate-900">{formatGhs(selectedExistingProduct.price)}</div>
                            </div>
                            {editingCampaign.promotionalPrice && editingCampaign.promotionalPrice < selectedExistingProduct.price && (
                              <div className="text-right">
                                <div className="text-[11px] text-emerald-600 font-bold">Customer Saves</div>
                                <div className="text-sm font-bold text-emerald-700">
                                  {formatGhs(selectedExistingProduct.price - editingCampaign.promotionalPrice)}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* BUNDLE OFFER RULES */}
                  {editingCampaign.promotionType === "bundle" && (
                    <div className="bg-amber-50/50 border border-amber-200 rounded-2xl p-5 space-y-4">
                      <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
                        <Package size={17} className="text-amber-700" />
                        <span>Bundle Price &amp; Availability</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            Combo Bundle Price (GH₵) *
                          </label>
                          <input
                            type="number"
                            min="0"
                            placeholder="7500"
                            value={editingCampaign.promotionalPrice || ""}
                            onChange={(e) => setEditingCampaign({ ...editingCampaign, promotionalPrice: Number(e.target.value) })}
                            className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black font-bold"
                          />
                          <span className="text-[11px] text-slate-500 mt-1 block">
                            Customer checkout will charge this exact total once for the complete package.
                          </span>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            Total Bundle Redemptions Allowed
                          </label>
                          <input
                            type="number"
                            min="1"
                            placeholder="e.g. 1 (for one-time bundle)"
                            value={editingCampaign.totalRedemptionLimit || ""}
                            onChange={(e) => setEditingCampaign({ ...editingCampaign, totalRedemptionLimit: e.target.value ? Number(e.target.value) : null })}
                            className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
                          />
                          <span className="text-[11px] text-slate-500 mt-1 block">
                            Leave empty for unlimited redemptions up to confirmed inventory.
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ADVERTISING ONLY RULES */}
                  {editingCampaign.promotionType === "advertising" && (
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
                      <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                        <Eye size={17} className="text-slate-700" />
                        <span>Advertising Call-To-Action</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Button CTA Text *</label>
                          <input
                            type="text"
                            placeholder="e.g. Explore Offers, Trade In Now"
                            value={editingCampaign.ctaText || ""}
                            onChange={(e) => setEditingCampaign({ ...editingCampaign, ctaText: e.target.value })}
                            className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Destination URL / Route *</label>
                          <input
                            type="text"
                            placeholder="/store or /sell-or-trade"
                            value={editingCampaign.ctaDestination || ""}
                            onChange={(e) => setEditingCampaign({ ...editingCampaign, ctaDestination: e.target.value })}
                            className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* REDEMPTION & CUSTOMER LIMITS (SHARED) */}
                  <div className="pt-2 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Total Campaign Redemptions Limit</label>
                      <input
                        type="number"
                        min="1"
                        placeholder="Leave empty for unlimited"
                        value={editingCampaign.totalRedemptionLimit || ""}
                        onChange={(e) => setEditingCampaign({ ...editingCampaign, totalRedemptionLimit: e.target.value ? Number(e.target.value) : null })}
                        className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Redemptions Per Customer</label>
                      <input
                        type="number"
                        min="1"
                        placeholder="1"
                        value={editingCampaign.customerRedemptionLimit || 1}
                        onChange={(e) => setEditingCampaign({ ...editingCampaign, customerRedemptionLimit: Number(e.target.value) })}
                        className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 5: FLYERS & MEDIA */}
              {activeStep === "flyers" && (
                <div className="space-y-6">
                  <div className="border-b border-slate-100 pb-3">
                    <h3 className="text-base font-bold text-slate-900">Promotional Artwork &amp; Flyers</h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Upload high quality promotional graphics, replace or remove flyers, or pick from the existing Media Library. No manual URL typing required.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* DESKTOP FLYER */}
                    <div className="border border-slate-200 rounded-2xl p-5 space-y-3 bg-slate-50/50">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                          <ImageIcon size={15} />
                          <span>Desktop Flyer (1200 × 500)</span>
                        </label>
                        {editingCampaign.desktopFlyerUrl && (
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                            Configured
                          </span>
                        )}
                      </div>

                      {/* Preview Box */}
                      <div className="w-full aspect-[2.4/1] bg-slate-100 rounded-xl border border-slate-200 overflow-hidden relative grid place-items-center">
                        {editingCampaign.desktopFlyerUrl ? (
                          <img
                            src={editingCampaign.desktopFlyerUrl}
                            alt="Desktop flyer preview"
                            className={`w-full h-full object-cover object-${editingCampaign.imagePosition || "center"}`}
                          />
                        ) : (
                          <div className="text-center p-4">
                            <ImageIcon size={26} className="text-slate-400 mx-auto mb-1" />
                            <span className="text-xs text-slate-400">No desktop flyer set</span>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 pt-1">
                        <input
                          ref={fileInputDesktopRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => void handleFlyerFileUpload(e, "desktop")}
                        />
                        <button
                          type="button"
                          onClick={() => fileInputDesktopRef.current?.click()}
                          className="flex-1 py-2 bg-white hover:bg-slate-100 text-slate-800 text-xs font-semibold rounded-xl border border-slate-200 transition flex items-center justify-center gap-1.5"
                        >
                          <Upload size={14} />
                          <span>{editingCampaign.desktopFlyerUrl ? "Replace File" : "Upload File"}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setMediaPickerTarget("desktop")}
                          className="flex-1 py-2 bg-slate-900 hover:bg-black text-white text-xs font-semibold rounded-xl transition flex items-center justify-center gap-1.5"
                        >
                          <ImageIcon size={14} />
                          <span>Media Library</span>
                        </button>
                        {editingCampaign.desktopFlyerUrl && (
                          <button
                            type="button"
                            onClick={() => setEditingCampaign({ ...editingCampaign, desktopFlyerUrl: "" })}
                            className="p-2 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 transition border border-slate-200"
                            title="Remove Flyer"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* MOBILE FLYER */}
                    <div className="border border-slate-200 rounded-2xl p-5 space-y-3 bg-slate-50/50">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                          <ImageIcon size={15} />
                          <span>Mobile Flyer (Square / 600 × 600)</span>
                        </label>
                        {editingCampaign.mobileFlyerUrl && (
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                            Configured
                          </span>
                        )}
                      </div>

                      {/* Preview Box */}
                      <div className="w-full aspect-[2.4/1] bg-slate-100 rounded-xl border border-slate-200 overflow-hidden relative grid place-items-center">
                        {editingCampaign.mobileFlyerUrl ? (
                          <img
                            src={editingCampaign.mobileFlyerUrl}
                            alt="Mobile flyer preview"
                            className={`w-full h-full object-cover object-${editingCampaign.imagePosition || "center"}`}
                          />
                        ) : (
                          <div className="text-center p-4">
                            <ImageIcon size={26} className="text-slate-400 mx-auto mb-1" />
                            <span className="text-xs text-slate-400">No mobile flyer set</span>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 pt-1">
                        <input
                          ref={fileInputMobileRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => void handleFlyerFileUpload(e, "mobile")}
                        />
                        <button
                          type="button"
                          onClick={() => fileInputMobileRef.current?.click()}
                          className="flex-1 py-2 bg-white hover:bg-slate-100 text-slate-800 text-xs font-semibold rounded-xl border border-slate-200 transition flex items-center justify-center gap-1.5"
                        >
                          <Upload size={14} />
                          <span>{editingCampaign.mobileFlyerUrl ? "Replace File" : "Upload File"}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setMediaPickerTarget("mobile")}
                          className="flex-1 py-2 bg-slate-900 hover:bg-black text-white text-xs font-semibold rounded-xl transition flex items-center justify-center gap-1.5"
                        >
                          <ImageIcon size={14} />
                          <span>Media Library</span>
                        </button>
                        {editingCampaign.mobileFlyerUrl && (
                          <button
                            type="button"
                            onClick={() => setEditingCampaign({ ...editingCampaign, mobileFlyerUrl: "" })}
                            className="p-2 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 transition border border-slate-200"
                            title="Remove Flyer"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Positioning & Alt Text */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Image Positioning / Focal Alignment</label>
                      <select
                        value={editingCampaign.imagePosition || "center"}
                        onChange={(e) => setEditingCampaign({ ...editingCampaign, imagePosition: e.target.value })}
                        className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none"
                      >
                        <option value="center">Center (Balanced)</option>
                        <option value="top">Top (Header Focus)</option>
                        <option value="bottom">Bottom (Footer Focus)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Accessible Alt Text (for SEO &amp; Screen Readers)</label>
                      <input
                        type="text"
                        placeholder="e.g. Promotional flyer: Save 10% to 15% on devices above GH₵ 2,000"
                        value={editingCampaign.flyerAltText || ""}
                        onChange={(e) => setEditingCampaign({ ...editingCampaign, flyerAltText: e.target.value })}
                        className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Additional Campaign Media Gallery */}
                  <div className="pt-2 border-t border-slate-100 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-800">Additional Campaign Images (Optional Gallery)</label>
                      <div className="flex items-center gap-2">
                        <input
                          ref={fileInputAdditionalRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => void handleFlyerFileUpload(e, "additional")}
                        />
                        <button
                          type="button"
                          onClick={() => fileInputAdditionalRef.current?.click()}
                          className="text-xs font-semibold px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg flex items-center gap-1"
                        >
                          <Upload size={13} />
                          <span>Add File</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setMediaPickerTarget("additional")}
                          className="text-xs font-semibold px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg flex items-center gap-1"
                        >
                          <ImageIcon size={13} />
                          <span>From Library</span>
                        </button>
                      </div>
                    </div>

                    {editingCampaign.additionalImages && editingCampaign.additionalImages.length > 0 ? (
                      <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                        {editingCampaign.additionalImages.map((imgUrl, idx) => (
                          <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-slate-200 group bg-slate-100">
                            <img src={imgUrl} alt="Gallery item" className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => {
                                const next = (editingCampaign.additionalImages || []).filter((_, i) => i !== idx);
                                setEditingCampaign({ ...editingCampaign, additionalImages: next });
                              }}
                              className="absolute top-1 right-1 p-1 bg-black/70 hover:bg-rose-600 text-white rounded-lg transition"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-3 bg-slate-50 border border-dashed border-slate-200 rounded-xl text-center text-xs text-slate-400">
                        No additional gallery photos attached.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* STEP 6: PLACEMENT & DATES */}
              {activeStep === "placement" && (
                <div className="space-y-6">
                  <div className="border-b border-slate-100 pb-3">
                    <h3 className="text-base font-bold text-slate-900">Placement &amp; Scheduling</h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Choose where this promotion appears across the storefront and its active flight duration.
                    </p>
                  </div>

                  {/* Placement Toggles */}
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-slate-800 block">Where Should This Promotion Appear?</label>

                    <label className="p-3.5 border border-slate-200 rounded-xl flex items-center gap-3 cursor-pointer hover:bg-slate-50 transition">
                      <input
                        type="checkbox"
                        checked={editingCampaign.showOnHomepageCarousel !== false}
                        onChange={(e) => setEditingCampaign({ ...editingCampaign, showOnHomepageCarousel: e.target.checked })}
                        className="rounded text-black focus:ring-black w-4 h-4"
                      />
                      <div>
                        <div className="text-xs font-bold text-slate-900">Homepage Carousel ("Special Offers. More to Love.")</div>
                        <div className="text-[11px] text-slate-500">Show high-resolution flyer in the edge-to-edge homepage slider.</div>
                      </div>
                    </label>

                    <label className="p-3.5 border border-slate-200 rounded-xl flex items-center gap-3 cursor-pointer hover:bg-slate-50 transition">
                      <input
                        type="checkbox"
                        checked={Boolean(editingCampaign.showOnAnnouncementBar)}
                        onChange={(e) => setEditingCampaign({ ...editingCampaign, showOnAnnouncementBar: e.target.checked })}
                        className="rounded text-black focus:ring-black w-4 h-4"
                      />
                      <div className="flex-1">
                        <div className="text-xs font-bold text-slate-900">Homepage Announcement Bar</div>
                        <div className="text-[11px] text-slate-500">Rotate in the slim top announcement bar above the navigation.</div>
                      </div>
                    </label>

                    {editingCampaign.showOnAnnouncementBar && (
                      <div className="pl-7">
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">Announcement Ticker Text</label>
                        <input
                          type="text"
                          placeholder="e.g. Mega Discount Sale: Save 10% to 15% on devices priced above GH₵ 2,000."
                          value={editingCampaign.announcementBarText || ""}
                          onChange={(e) => setEditingCampaign({ ...editingCampaign, announcementBarText: e.target.value })}
                          className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
                        />
                      </div>
                    )}

                    <label className="p-3.5 border border-slate-200 rounded-xl flex items-center gap-3 cursor-pointer hover:bg-slate-50 transition">
                      <input
                        type="checkbox"
                        checked={editingCampaign.showOnOffersPage !== false}
                        onChange={(e) => setEditingCampaign({ ...editingCampaign, showOnOffersPage: e.target.checked })}
                        className="rounded text-black focus:ring-black w-4 h-4"
                      />
                      <div>
                        <div className="text-xs font-bold text-slate-900">Dedicated Offers Directory (/offers)</div>
                        <div className="text-[11px] text-slate-500">Include in the public offers index with full condition explanation.</div>
                      </div>
                    </label>
                  </div>

                  {/* Dates & Presets */}
                  <div className="pt-2 border-t border-slate-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-800">Campaign Flight Dates</label>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            const now = new Date();
                            const end = new Date(now.getTime() + 7 * 86400000);
                            setEditingCampaign({
                              ...editingCampaign,
                              startDate: now.toISOString().slice(0, 16),
                              endDate: end.toISOString().slice(0, 16),
                            });
                          }}
                          className="text-[10px] font-semibold bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded-md"
                        >
                          +7 Days
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const now = new Date();
                            const end = new Date(now.getTime() + 30 * 86400000);
                            setEditingCampaign({
                              ...editingCampaign,
                              startDate: now.toISOString().slice(0, 16),
                              endDate: end.toISOString().slice(0, 16),
                            });
                          }}
                          className="text-[10px] font-semibold bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded-md"
                        >
                          +30 Days
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const now = new Date();
                            const end = new Date(now.getTime() + 90 * 86400000);
                            setEditingCampaign({
                              ...editingCampaign,
                              startDate: now.toISOString().slice(0, 16),
                              endDate: end.toISOString().slice(0, 16),
                            });
                          }}
                          className="text-[10px] font-semibold bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded-md"
                        >
                          +90 Days
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const now = new Date();
                            setEditingCampaign({
                              ...editingCampaign,
                              startDate: now.toISOString().slice(0, 16),
                              endDate: null,
                            });
                          }}
                          className="text-[10px] font-semibold bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded-md"
                        >
                          Ongoing
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">Start Date &amp; Time</label>
                        <input
                          type="datetime-local"
                          value={editingCampaign.startDate || ""}
                          onChange={(e) => setEditingCampaign({ ...editingCampaign, startDate: e.target.value })}
                          className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">End Date &amp; Time</label>
                        <input
                          type="datetime-local"
                          value={editingCampaign.endDate || ""}
                          onChange={(e) => setEditingCampaign({ ...editingCampaign, endDate: e.target.value })}
                          className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 7: REVIEW, VALIDATION & LIVE PREVIEW */}
              {activeStep === "preview" && (
                <div className="space-y-6">
                  <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-bold text-slate-900">Campaign Preview &amp; Verification</h3>
                      <p className="text-xs text-slate-500 mt-1">
                        Review how the offer will display to shoppers across the storefront before publishing live.
                      </p>
                    </div>
                  </div>

                  {/* Pre-flight Checklist */}
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                    <div className="text-xs font-bold text-slate-800">Pre-Publishing Verification</div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <div className="flex items-center gap-2">
                        {editingCampaign.title?.trim() ? (
                          <CheckCircle2 size={14} className="text-emerald-600" />
                        ) : (
                          <X size={14} className="text-rose-500" />
                        )}
                        <span className={editingCampaign.title?.trim() ? "text-slate-800 font-semibold" : "text-rose-600 font-semibold"}>
                          Title: {editingCampaign.title?.trim() || "Missing"}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {editingCampaign.desktopFlyerUrl || editingCampaign.mobileFlyerUrl ? (
                          <CheckCircle2 size={14} className="text-emerald-600" />
                        ) : (
                          <X size={14} className="text-rose-500" />
                        )}
                        <span className={editingCampaign.desktopFlyerUrl || editingCampaign.mobileFlyerUrl ? "text-slate-800" : "text-rose-600 font-semibold"}>
                          Promotional flyer attached
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {editingCampaign.promotionType === "percentage_discount" ? (
                          <>
                            <CheckCircle2 size={14} className="text-emerald-600" />
                            <span>
                              {editingCampaign.discountCalculationMode === "price_tiers"
                                ? `Tiered bands: ${editingCampaign.discountTiers?.length || 0} price tiers active`
                                : `${editingCampaign.discountPercent || 0}% Off at checkout`}
                            </span>
                          </>
                        ) : editingCampaign.promotionType === "fixed_discount" ? (
                          <>
                            <CheckCircle2 size={14} className="text-emerald-600" />
                            <span>Save {formatGhs(editingCampaign.discountAmount || 0)}</span>
                          </>
                        ) : editingCampaign.promotionType === "bundle" ? (
                          <>
                            <CheckCircle2 size={14} className="text-emerald-600" />
                            <span>Bundle price: {formatGhs(editingCampaign.promotionalPrice || newProductData.price || 0)}</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle2 size={14} className="text-emerald-600" />
                            <span>Offer configured: {editingCampaign.promotionType}</span>
                          </>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <CheckCircle2 size={14} className="text-emerald-600" />
                        <span>
                          {discountScope === "specific"
                            ? `${editingCampaign.eligibleProductIds?.length || 0} specific qualifying products`
                            : discountScope === "category"
                            ? `Category: ${editingCampaign.eligibleCategory}`
                            : "Storewide eligibility"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Live Visual Card Preview */}
                  <div className="space-y-3">
                    <div className="text-xs font-bold text-slate-800">Storefront Carousel Flyer Preview</div>

                    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-md max-w-xl mx-auto">
                      <div className="w-full aspect-[2/1] bg-gradient-to-br from-slate-900 via-slate-800 to-black relative">
                        {editingCampaign.desktopFlyerUrl || editingCampaign.mobileFlyerUrl ? (
                          <img
                            src={editingCampaign.desktopFlyerUrl || editingCampaign.mobileFlyerUrl}
                            alt={editingCampaign.title || "Offer preview"}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 p-6 text-center">
                            <Sparkles size={28} className="text-amber-400 mb-2 opacity-80" />
                            <span className="text-xs font-medium text-slate-300">Custom promotional flyer preview</span>
                            <span className="text-[11px] text-slate-500 mt-0.5">Upload a desktop or mobile flyer in Step 5</span>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent flex flex-col justify-end p-5 text-white">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                            {editingCampaign.promotionType?.replace(/_/g, " ")}
                          </span>
                          <h3 className="text-lg font-bold mt-1 text-white">{editingCampaign.title || "Untitled Offer"}</h3>
                          <p className="text-xs text-slate-200 line-clamp-1 mt-0.5">
                            {editingCampaign.shortDescription || "Special offer headline"}
                          </p>
                          <div className="mt-3 flex items-center justify-between">
                            <span className="text-xs font-semibold px-2.5 py-1 bg-white/20 backdrop-blur-md rounded-lg text-white">
                              {editingCampaign.ctaText || "Shop Offer"}
                            </span>
                            {editingCampaign.promotionalPrice && (
                              <span className="text-sm font-bold text-amber-300">
                                {formatGhs(editingCampaign.promotionalPrice)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer Controls */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <div>
                {activeStep !== "basics" && (
                  <button
                    type="button"
                    onClick={() => {
                      const steps: EditorStep[] = ["basics", "type", "product", "rules", "flyers", "placement", "preview"];
                      const currentIdx = steps.indexOf(activeStep);
                      if (currentIdx > 0) setActiveStep(steps[currentIdx - 1]);
                    }}
                    className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 rounded-xl border border-slate-200 transition flex items-center gap-1.5"
                  >
                    <ChevronLeft size={14} />
                    <span>Back</span>
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => void handleSaveCampaign(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 rounded-xl border border-slate-200 transition"
                >
                  Save Draft
                </button>

                {activeStep !== "preview" ? (
                  <button
                    type="button"
                    onClick={() => {
                      const steps: EditorStep[] = ["basics", "type", "product", "rules", "flyers", "placement", "preview"];
                      const currentIdx = steps.indexOf(activeStep);
                      if (currentIdx < steps.length - 1) setActiveStep(steps[currentIdx + 1]);
                    }}
                    className="px-5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-black rounded-xl transition flex items-center gap-1.5 shadow-sm"
                  >
                    <span>Next</span>
                    <ChevronRight size={14} />
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => void handleSaveCampaign(true)}
                    className="px-6 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition flex items-center gap-1.5 shadow-sm active:scale-95 disabled:opacity-50"
                  >
                    <Check size={14} />
                    <span>{saving ? "Publishing..." : "Publish Live"}</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. MEDIA LIBRARY PICKER MODAL */}
      {mediaPickerTarget && (
        <div className="fixed inset-0 z-60 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-4xl max-h-[85vh] rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden">
            <div className="px-5 py-3 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <span className="text-xs font-bold text-slate-800">Select Promotional Artwork from Media Library</span>
              <button
                type="button"
                onClick={() => setMediaPickerTarget(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200 transition"
              >
                <X size={16} />
              </button>
            </div>
            <div className="p-4 overflow-y-auto flex-1">
              <AdminMediaLibrary
                isPicker
                onSelect={(item: MediaItem) => {
                  if (editingCampaign) {
                    if (mediaPickerTarget === "desktop") {
                      setEditingCampaign({ ...editingCampaign, desktopFlyerUrl: item.url });
                    } else if (mediaPickerTarget === "mobile") {
                      setEditingCampaign({ ...editingCampaign, mobileFlyerUrl: item.url });
                    } else if (mediaPickerTarget === "additional") {
                      setEditingCampaign({
                        ...editingCampaign,
                        additionalImages: [...(editingCampaign.additionalImages || []), item.url],
                      });
                    }
                  }
                  setMediaPickerTarget(null);
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* 6. PERMANENT DELETE CONFIRMATION MODAL */}
      {deleteCandidate && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-rose-200 p-6 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 grid place-items-center">
              <Trash2 size={24} />
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-900">Permanently Delete Promotion?</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                This action cannot be undone. To prevent accidental loss, please type the exact campaign title:
                <strong className="text-slate-800 block mt-1 font-mono">{deleteCandidate.title}</strong>
              </p>
            </div>

            <input
              type="text"
              placeholder="Type campaign title to confirm..."
              value={deleteInput}
              onChange={(e) => setDeleteInput(e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500 font-medium"
            />

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => {
                  setDeleteCandidate(null);
                  setDeleteInput("");
                }}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleting || deleteInput !== deleteCandidate.title}
                onClick={() => void handleDeleteConfirm()}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-40 text-white text-xs font-bold rounded-xl transition"
              >
                {deleting ? "Deleting..." : "Delete Permanently"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
