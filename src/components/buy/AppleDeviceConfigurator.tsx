import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  Check,
  ChevronRight,
  MessageCircle,
  Package,
  ShieldCheck,
  ShoppingBag,
  Store,
  Truck,
} from "lucide-react";
import { useCms } from "../../cms/CmsContext";
import type { ShopCategoryKey } from "../../cms/types";
import { useProductCatalog } from "../../catalog/ProductCatalogContext";
import { isProductOrderable } from "../../catalog/productCatalog";
import { getPublicPurchaseAction } from "../../catalog/productPurchaseAction";
import {
  buildShopFamilyGroups,
  extractChipOptions,
  extractConnectivityOptions,
  extractMemoryOptions,
  extractScreenSize,
  extractWatchCaseSizes,
  getEffectiveCondition,
  getProductFamilyBucket,
  getProductShopBuyPath,
  getShopAccessoriesForCategory,
  isDesktopMac,
  isShopDeviceForCategory,
  isUkUsedProduct,
  resolveShopProductGallery,
  resolveShopProductImageSrc,
  sortShopDevicesNewest,
} from "../../catalog/shopClassification";
import { useBuyJourney } from "../../context/BuyJourneyContext";
import { useCart } from "../../context/CartContext";
import { useBuyGallery } from "../../cms/buyGalleryRepository";
import type { Product, ProductVariant } from "../../types/product";
import { resolveColorOptions } from "../../utils/productColors";
import { calculateTradeInBreakdown, formatPrice, resolveConfiguredPrice } from "../../utils/productPricing";
import { getSelectableStorageOptions, normalizeSpecToken } from "../../utils/variantSelection";
import { productWhatsAppUrl } from "../../utils/whatsapp";
import { ProductPromotionalBadge } from "../promotions/ProductPromotionalBadge";
import { SEO } from "../SEO";
import { SwipeableProductGallery } from "./SwipeableProductGallery";
import { useBuyEntrySelection } from "./BuyPrimitives";
import "../../styles/apple-shop-experience.css";
import "../../styles/apple-configurator.css";

interface AppleDeviceConfiguratorProps {
  category: ShopCategoryKey;
  initialProduct?: Product;
  slug: string;
}

const WATCH_BAND_STYLES_ULTRA = ["Ocean Band", "Alpine Loop", "Trail Loop"];
const WATCH_BAND_STYLES_STANDARD = ["Sport Band", "Sport Loop", "Solo Loop", "Milanese Loop"];
const WATCH_BAND_COLORS = ["Midnight", "Starlight", "Black", "Navy", "Olive", "Natural"];
const WATCH_BAND_SIZES = ["S/M", "M/L"];

const CATEGORY_META: Record<ShopCategoryKey, { label: string; shopPath: string; landingPath: string }> = {
  mac: { label: "Mac", shopPath: "/shop/buy-mac", landingPath: "/mac" },
  ipad: { label: "iPad", shopPath: "/shop/buy-ipad", landingPath: "/ipad" },
  iphone: { label: "iPhone", shopPath: "/shop/buy-iphone", landingPath: "/iphone" },
  watch: { label: "Apple Watch", shopPath: "/shop/buy-watch", landingPath: "/watch" },
};

export function AppleDeviceConfigurator({
  category,
  initialProduct,
  slug,
}: AppleDeviceConfiguratorProps) {
  const navigate = useNavigate();
  const { shopExperience } = useCms();
  const { activeProducts } = useProductCatalog();
  const { addConfiguredItem, editingItem } = useBuyJourney();
  const { addItem } = useCart();
  const { storage: entryStorage, color: entryColor } = useBuyEntrySelection();

  const catMeta = CATEGORY_META[category];

  // All real active devices for this category, sorted newest first
  const categoryDevices = useMemo(
    () => sortShopDevicesNewest(activeProducts.filter((p) => isShopDeviceForCategory(p, category)), category),
    [activeProducts, category]
  );

  // Resolve active product strictly from live catalog (supporting family shorthand slugs like /shop/buy-mac/macbook-pro)
  const resolvedInitialProduct = useMemo(() => {
    if (initialProduct) return initialProduct;
    const exact = categoryDevices.find((p) => p.slug === slug);
    if (exact) return exact;
    const normSlug = slug.replace(/-inch-/g, "-").toLowerCase();
    const normMatch = categoryDevices.find(
      (p) => p.slug.replace(/-inch-/g, "-").toLowerCase() === normSlug
    );
    if (normMatch) return normMatch;
    // Family prefix match (e.g. "macbook-pro" -> newest in-stock MacBook Pro)
    const familyMatches = categoryDevices.filter((p) => p.slug.startsWith(slug) || getProductFamilyBucket(p, category).id === slug);
    const inStockFamily = familyMatches.find((p) => isProductOrderable(p));
    if (inStockFamily) return inStockFamily;
    if (familyMatches[0]) return familyMatches[0];
    return categoryDevices.find((p) => isProductOrderable(p)) || categoryDevices[0];
  }, [initialProduct, categoryDevices, slug, category]);

  const [selectedSlug, setSelectedSlug] = useState<string>(resolvedInitialProduct?.slug || slug);

  useEffect(() => {
    if (resolvedInitialProduct?.slug && resolvedInitialProduct.slug !== selectedSlug) {
      setSelectedSlug(resolvedInitialProduct.slug);
    }
  }, [resolvedInitialProduct?.slug]);

  const activeProduct = useMemo(() => {
    return (
      categoryDevices.find((p) => p.slug === selectedSlug) ||
      resolvedInitialProduct ||
      initialProduct
    );
  }, [categoryDevices, selectedSlug, resolvedInitialProduct, initialProduct]);

  const activeIsUkUsed = activeProduct ? isUkUsedProduct(activeProduct) : false;
  const activeCondition = activeProduct ? getEffectiveCondition(activeProduct) : "Brand New";
  const activeFamilyMeta = activeProduct
    ? getProductFamilyBucket(activeProduct, category)
    : null;

  // Family groups in the same condition lane (Brand New vs UK Used)
  const sameLaneDevices = useMemo(
    () => categoryDevices.filter((p) => isUkUsedProduct(p) === activeIsUkUsed),
    [categoryDevices, activeIsUkUsed]
  );

  const laneFamilies = useMemo(
    () => buildShopFamilyGroups(sameLaneDevices, category, shopExperience),
    [sameLaneDevices, category, shopExperience]
  );

  // Models in the currently selected family (same Brand New / UK Used lane)
  const familyModels = useMemo(() => {
    if (!activeFamilyMeta) return [];
    return sameLaneDevices.filter((p) => getProductFamilyBucket(p, category).id === activeFamilyMeta.id);
  }, [sameLaneDevices, activeFamilyMeta, category]);

  // Check if the other condition lane also has devices in this category
  const otherLaneDevices = useMemo(
    () => categoryDevices.filter((p) => isUkUsedProduct(p) !== activeIsUkUsed),
    [categoryDevices, activeIsUkUsed]
  );

  // Available Screen Sizes across the active family (for Mac laptops & iPad — NEVER Mac mini / Mac Studio!)
  const familyScreenSizes = useMemo(() => {
    if (!activeProduct) return [];
    if (category === "mac" && isDesktopMac(activeProduct)) return [];
    if (category === "iphone" || category === "watch") return [];
    const sizes = new Set<string>();
    for (const m of familyModels) {
      const sz = extractScreenSize(m, category);
      if (sz && !sz.includes("/")) sizes.add(sz);
      for (const v of m.variants ?? []) {
        if (v.screenSize) sizes.add(v.screenSize);
      }
    }
    return Array.from(sizes).sort((a, b) => parseFloat(a) - parseFloat(b));
  }, [activeProduct, category, familyModels]);

  const currentModelScreenSize = useMemo(
    () => (activeProduct ? extractScreenSize(activeProduct, category) : undefined),
    [activeProduct, category]
  );

  const [selectedScreenSize, setSelectedScreenSize] = useState<string>(currentModelScreenSize || "");

  useEffect(() => {
    if (currentModelScreenSize && !currentModelScreenSize.includes("/")) {
      setSelectedScreenSize(currentModelScreenSize);
    } else if (familyScreenSizes.length > 0) {
      setSelectedScreenSize(familyScreenSizes[0]);
    } else {
      setSelectedScreenSize("");
    }
  }, [activeProduct?.slug, currentModelScreenSize]);

  // Models in family filtered by screen size (for Mac laptops / iPad)
  const modelsMatchingSize = useMemo(() => {
    if ((category !== "mac" && category !== "ipad") || familyScreenSizes.length <= 1 || !selectedScreenSize) {
      return familyModels;
    }
    const matching = familyModels.filter((m) => {
      const mSize = extractScreenSize(m, category);
      if (mSize && normalizeSpecToken(mSize) === normalizeSpecToken(selectedScreenSize)) return true;
      return (m.variants ?? []).some(
        (v) => v.screenSize && normalizeSpecToken(v.screenSize) === normalizeSpecToken(selectedScreenSize)
      );
    });
    return matching.length > 0 ? matching : familyModels;
  }, [familyModels, category, familyScreenSizes.length, selectedScreenSize]);

  // Real option sets strictly derived from the selected Supabase Product & its Variants
  const colorOptions = useMemo(
    () => resolveColorOptions(activeProduct?.colors ?? []),
    [activeProduct?.colors]
  );
  const chipOptions = useMemo(
    () => (activeProduct ? extractChipOptions(activeProduct) : []),
    [activeProduct]
  );
  const memoryOptions = useMemo(
    () => (activeProduct ? extractMemoryOptions(activeProduct) : []),
    [activeProduct]
  );
  const storageOptions = useMemo(() => {
    if (!activeProduct || category === "watch") return [];
    return getSelectableStorageOptions(activeProduct).filter(
      (s) => !/^(gps|gps\s*\+\s*cellular|wi-?fi)$/i.test(s.trim())
    );
  }, [activeProduct, category]);
  const connectivityOptions = useMemo(
    () => (activeProduct ? extractConnectivityOptions(activeProduct) : []),
    [activeProduct]
  );
  const watchCaseSizes = useMemo(
    () => (activeProduct && category === "watch" ? extractWatchCaseSizes(activeProduct) : []),
    [activeProduct, category]
  );

  const isUltraWatch = Boolean(activeProduct && /ultra/i.test(`${activeProduct.name} ${activeProduct.slug}`));
  const watchBandStyleOptions = isUltraWatch ? WATCH_BAND_STYLES_ULTRA : WATCH_BAND_STYLES_STANDARD;

  // Interactive Configuration State
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [selectedChip, setSelectedChip] = useState<string>("");
  const [selectedMemory, setSelectedMemory] = useState<string>("");
  const [selectedStorage, setSelectedStorage] = useState<string>("");
  const [selectedConnectivity, setSelectedConnectivity] = useState<string>("");
  const [selectedCaseSize, setSelectedCaseSize] = useState<string>("");
  const [selectedBandStyle, setSelectedBandStyle] = useState<string>(watchBandStyleOptions[0]);
  const [selectedBandColor, setSelectedBandColor] = useState<string>(WATCH_BAND_COLORS[0]);
  const [selectedBandSize, setSelectedBandSize] = useState<string>(WATCH_BAND_SIZES[1]);
  const [tradeIn, setTradeIn] = useState(false);
  const [activeThumb, setActiveThumb] = useState(0);
  const [notice, setNotice] = useState("");

  // Hydrate valid default selections whenever the active product changes
  useEffect(() => {
    if (!activeProduct) return;
    const firstValidVariant =
      (activeProduct.variants ?? []).find((v) => v.available !== false && v.stockQuantity > 0 && v.price > 0) ||
      activeProduct.variants?.[0];

    const nextColor =
      (entryColor && colorOptions.find((c) => normalizeSpecToken(c.name) === normalizeSpecToken(entryColor))?.name) ||
      activeProduct.defaultColor ||
      colorOptions[0]?.name ||
      "Standard";
    setSelectedColor(nextColor);

    setSelectedChip(firstValidVariant?.chip || chipOptions[0] || "");
    setSelectedMemory(firstValidVariant?.memory || memoryOptions[0] || "");

    const nextStorage =
      (entryStorage && storageOptions.find((s) => normalizeSpecToken(s) === normalizeSpecToken(entryStorage))) ||
      firstValidVariant?.storage ||
      storageOptions[0] ||
      "";
    setSelectedStorage(nextStorage);

    setSelectedConnectivity(firstValidVariant?.connectivity || connectivityOptions[0] || "");
    setSelectedCaseSize(firstValidVariant?.screenSize || watchCaseSizes[0] || "");
    setSelectedBandStyle(isUltraWatch ? WATCH_BAND_STYLES_ULTRA[0] : WATCH_BAND_STYLES_STANDARD[0]);
    setActiveThumb(0);
    setNotice("");
  }, [activeProduct?.id]);

  // Restore selections when clicking "Edit details" from Cart
  useEffect(() => {
    if (!editingItem || !activeProduct || editingItem.product.slug !== activeProduct.slug) return;
    const opts = editingItem.options || {};
    if (opts.screenSize) setSelectedScreenSize(opts.screenSize);
    if (opts.chip) setSelectedChip(opts.chip);
    if (opts.memory) setSelectedMemory(opts.memory);
    if (editingItem.storage && storageOptions.includes(editingItem.storage)) {
      setSelectedStorage(editingItem.storage);
    }
    if (opts.finish || editingItem.color) {
      const candidate = opts.finish || editingItem.color.split(" / ")[0];
      const matched = colorOptions.find((c) => normalizeSpecToken(c.name) === normalizeSpecToken(candidate));
      if (matched) setSelectedColor(matched.name);
    }
    if (opts.connectivity) setSelectedConnectivity(opts.connectivity);
    if (opts.caseSize) setSelectedCaseSize(opts.caseSize);
    if (opts.bandStyle) setSelectedBandStyle(opts.bandStyle);
    if (opts.bandColor) setSelectedBandColor(opts.bandColor);
    if (opts.bandSize) setSelectedBandSize(opts.bandSize);
    setTradeIn(opts.tradeIn === "Yes");
  }, [editingItem, activeProduct?.slug]);

  useEffect(() => {
    setActiveThumb(0);
  }, [selectedColor, activeProduct?.slug]);

  // Helper: switch active product cleanly & sync URL
  const switchToProduct = (prod: Product) => {
    setSelectedSlug(prod.slug);
    navigate(`/shop/buy-${category}/${prod.slug}`, { replace: true });
  };

  // Helper: switch screen size -> bind to matching real product in the family
  const handleSelectScreenSize = (size: string) => {
    setSelectedScreenSize(size);
    const matching = familyModels.filter((m) => {
      const mSize = extractScreenSize(m, category);
      if (mSize && normalizeSpecToken(mSize) === normalizeSpecToken(size)) return true;
      return (m.variants ?? []).some(
        (v) => v.screenSize && normalizeSpecToken(v.screenSize) === normalizeSpecToken(size)
      );
    });
    if (matching.length > 0 && !matching.some((m) => m.id === activeProduct?.id)) {
      const best = matching.find((m) => isProductOrderable(m)) || matching[0];
      switchToProduct(best);
    }
  };

  // STRICT VARIANT VALIDATION (ZERO INVENTED COMBINATIONS!)
  const exactVariantMatch = useMemo<{
    variant?: ProductVariant;
    combinationExists: boolean;
    nearestAvailableVariant?: ProductVariant;
  }>(() => {
    if (!activeProduct) return { combinationExists: false };
    const variants = activeProduct.variants ?? [];
    if (variants.length === 0) {
      return { variant: undefined, combinationExists: true };
    }

    const matchesDimension = (val?: string | null, selected?: string) => {
      if (!val || !selected) return true;
      return normalizeSpecToken(val) === normalizeSpecToken(selected);
    };

    const effectiveSize = category === "watch" ? selectedCaseSize : selectedScreenSize;

    const exact = variants.find((v) => {
      const chipOk = !chipOptions.some((c) => variants.some((x) => x.chip && normalizeSpecToken(x.chip) === normalizeSpecToken(c)))
        ? true
        : matchesDimension(v.chip, selectedChip);
      const memOk = memoryOptions.length === 0 ? true : matchesDimension(v.memory, selectedMemory);
      const storOk = storageOptions.length === 0 ? true : matchesDimension(v.storage, selectedStorage);
      const connOk = connectivityOptions.length === 0 ? true : matchesDimension(v.connectivity, selectedConnectivity);
      const sizeOk =
        !variants.some((x) => x.screenSize) ? true : matchesDimension(v.screenSize, effectiveSize);
      return chipOk && memOk && storOk && connOk && sizeOk;
    });

    const nearestAvailableVariant = variants.find(
      (v) => v.available !== false && v.stockStatus !== "Out of Stock" && v.stockStatus !== "Sold" && v.stockQuantity > 0 && v.price > 0
    );

    if (exact) {
      return { variant: exact, combinationExists: true, nearestAvailableVariant };
    }

    return { variant: undefined, combinationExists: false, nearestAvailableVariant };
  }, [
    activeProduct,
    category,
    chipOptions,
    memoryOptions.length,
    storageOptions.length,
    connectivityOptions.length,
    selectedChip,
    selectedMemory,
    selectedStorage,
    selectedConnectivity,
    selectedCaseSize,
    selectedScreenSize,
  ]);

  // Authoritative price & stock resolution via shared productPricing engine
  const configured = useMemo(() => {
    if (!activeProduct) return null;
    const effectiveStorage =
      category === "watch"
        ? selectedConnectivity || selectedCaseSize || "Standard"
        : selectedStorage || "Standard";
    return resolveConfiguredPrice(activeProduct, {
      storage: effectiveStorage,
      color: selectedColor,
      finish: selectedColor,
      chip: selectedChip || undefined,
      memory: selectedMemory || undefined,
      screenSize: category === "watch" ? selectedCaseSize || undefined : selectedScreenSize || undefined,
      connectivity: selectedConnectivity || undefined,
      variantId: exactVariantMatch.variant?.id,
    });
  }, [
    activeProduct,
    category,
    selectedStorage,
    selectedColor,
    selectedChip,
    selectedMemory,
    selectedCaseSize,
    selectedScreenSize,
    selectedConnectivity,
    exactVariantMatch.variant?.id,
  ]);

  const productCanBuy = Boolean(
    activeProduct &&
      isProductOrderable(activeProduct) &&
      getPublicPurchaseAction(activeProduct) === "buy"
  );

  const canAddToBag = Boolean(
    activeProduct &&
      productCanBuy &&
      exactVariantMatch.combinationExists &&
      configured?.purchasable &&
      configured.price > 0
  );

  // Available In-Stock Alternative Suggestions when current product or combination is unavailable
  const inStockAlternatives = useMemo(() => {
    if (canAddToBag) return [];
    const sameFam = familyModels.filter(
      (p) => p.id !== activeProduct?.id && isProductOrderable(p) && getPublicPurchaseAction(p) === "buy"
    );
    if (sameFam.length > 0) return sameFam.slice(0, 3);
    return sameLaneDevices
      .filter((p) => p.id !== activeProduct?.id && isProductOrderable(p) && getPublicPurchaseAction(p) === "buy")
      .slice(0, 3);
  }, [canAddToBag, familyModels, sameLaneDevices, activeProduct?.id]);

  // Independent UK Used gallery OR preserved Brand New Buy Gallery
  const ukUsedCustomGallery = useMemo(() => {
    if (!activeProduct || !activeIsUkUsed) return [];
    return resolveShopProductGallery(activeProduct, shopExperience);
  }, [activeProduct, activeIsUkUsed, shopExperience]);

  const fallbackImgs = useMemo(() => {
    if (!activeProduct) return [];
    const src = resolveShopProductImageSrc(activeProduct, shopExperience);
    return src ? [{ src, alt: activeProduct.name }] : [];
  }, [activeProduct, shopExperience]);

  const {
    images: brandNewGallery,
    mainImage: brandNewMainImage,
    colorVariantId,
  } = useBuyGallery(
    activeProduct,
    selectedColor || "Standard",
    activeProduct?.slug || slug,
    selectedScreenSize || undefined,
    fallbackImgs
  );

  const galleryImages = activeIsUkUsed && ukUsedCustomGallery.length > 0 ? ukUsedCustomGallery : brandNewGallery;
  const activeImageSrc = galleryImages[activeThumb]?.src || brandNewMainImage?.src || fallbackImgs[0]?.src || "";

  const displayPrice =
    exactVariantMatch.combinationExists && configured && configured.price > 0
      ? configured.formattedPrice
      : activeProduct && activeProduct.price > 0 && !activeProduct.priceOnRequest
      ? formatPrice(activeProduct.price)
      : "Price confirmed on enquiry";

  const tradeInBreakdown = calculateTradeInBreakdown(
    exactVariantMatch.combinationExists && configured ? configured.price : activeProduct?.price || 0,
    tradeIn
  );

  // Recommended Compatible Accessories
  const recommendedAccessories = useMemo(
    () =>
      getShopAccessoriesForCategory(
        activeProducts,
        category,
        shopExperience?.categories?.[category]?.curatedAccessorySlugs
      )
        .filter((a) => isProductOrderable(a))
        .slice(0, 4),
    [activeProducts, category, shopExperience]
  );

  if (!activeProduct) {
    return (
      <div className="bsg-cfg-root" style={{ padding: "80px 24px", textAlign: "center" }}>
        <h1>Device not found</h1>
        <p style={{ color: "#6e6e73" }}>
          This model is not currently in our active catalogue. Browse available models below.
        </p>
        <Link to={catMeta.shopPath} className="bsg-cfg-btn-gold-lg" style={{ maxWidth: 260, marginTop: 16 }}>
          Back to Shop {catMeta.label}
        </Link>
      </div>
    );
  }

  const storageForCart =
    exactVariantMatch.variant?.storage ||
    (category === "watch"
      ? [selectedCaseSize, selectedConnectivity].filter(Boolean).join(" / ") || "Standard"
      : selectedStorage || "Standard");

  const colorForCart =
    category === "watch"
      ? [selectedColor, `${selectedBandStyle} (${selectedBandColor}, ${selectedBandSize})`]
          .filter(Boolean)
          .join(" / ")
      : selectedColor || "Standard";

  const handleAddToBag = () => {
    if (!canAddToBag) return;
    const options: Record<string, string> = {
      model: activeProduct.name,
      condition: activeCondition,
      finish: selectedColor || "Standard",
      storage: storageForCart,
      tradeIn: tradeIn ? "Yes" : "No",
    };
    if (category !== "watch" && (selectedScreenSize || currentModelScreenSize)) {
      options.screenSize = selectedScreenSize || currentModelScreenSize || "";
    }
    if (selectedChip) options.chip = selectedChip;
    if (selectedMemory) options.memory = selectedMemory;
    if (selectedConnectivity) options.connectivity = selectedConnectivity;
    if (category === "watch") {
      if (selectedCaseSize) options.caseSize = selectedCaseSize;
      options.bandStyle = selectedBandStyle;
      options.bandColor = selectedBandColor;
      options.bandSize = selectedBandSize;
    }

    const ok = addConfiguredItem(
      activeProduct,
      storageForCart,
      colorForCart,
      exactVariantMatch.variant ?? configured?.variant,
      activeImageSrc,
      options
    );
    if (ok) {
      setNotice(`${activeProduct.name} (${displayPrice}) added to your bag.`);
    }
  };

  const whatsAppUrl = productWhatsAppUrl(
    activeProduct,
    storageForCart,
    colorForCart,
    undefined,
    configured?.price || activeProduct.price,
    activeImageSrc
  );

  // Price preview helper for Storage / Chip / Memory / Case Size cards (strictly from real variants!)
  const findVariantPriceFor = (partial: Partial<Pick<ProductVariant, "storage" | "chip" | "memory" | "screenSize" | "connectivity">>) => {
    const vars = activeProduct.variants ?? [];
    if (vars.length === 0) return activeProduct.price > 0 ? formatPrice(activeProduct.price) : undefined;
    const matched = vars.find((v) => {
      if (partial.storage && v.storage && normalizeSpecToken(v.storage) !== normalizeSpecToken(partial.storage)) return false;
      if (partial.chip && v.chip && normalizeSpecToken(v.chip) !== normalizeSpecToken(partial.chip)) return false;
      if (partial.memory && v.memory && normalizeSpecToken(v.memory) !== normalizeSpecToken(partial.memory)) return false;
      if (partial.screenSize && v.screenSize && normalizeSpecToken(v.screenSize) !== normalizeSpecToken(partial.screenSize)) return false;
      if (partial.connectivity && v.connectivity && normalizeSpecToken(v.connectivity) !== normalizeSpecToken(partial.connectivity)) return false;
      return true;
    });
    return matched && matched.price > 0 ? formatPrice(matched.price) : undefined;
  };

  let stepCounter = 0;
  const nextStep = () => {
    stepCounter += 1;
    return stepCounter;
  };

  return (
    <div className="bsg-cfg-root" data-testid={`configurator-${category}`}>
      <SEO
        title={`Configure ${activeProduct.name} (${activeCondition}) — Buy & Sell GH`}
        description={`Configure ${activeProduct.name} with verified specs and live GH₵ pricing at Buy & Sell GH in Accra.`}
      />

      {/* 1. Sticky Top Bar */}
      <div className="bsg-cfg-topbar" data-testid="cfg-topbar">
        <div className="bsg-cfg-topbar-inner">
          <div className="bsg-cfg-topbar-left">
            <h2 className="bsg-cfg-topbar-name">{activeProduct.name}</h2>
            <span className="bsg-cfg-cond-pill" data-testid="cfg-condition-badge">
              {activeIsUkUsed
                ? activeCondition.toLowerCase() === "uk used"
                  ? "UK Used"
                  : `UK Used · ${activeCondition}`
                : "Brand New"}
            </span>
          </div>
          <div className="bsg-cfg-topbar-right">
            <span className="bsg-cfg-topbar-price" data-testid="cfg-live-price">
              {displayPrice}
            </span>
            <span
              className={`bsg-cfg-stock-pill ${canAddToBag ? "in-stock" : "out-stock"}`}
              data-testid="cfg-stock-status"
            >
              {canAddToBag
                ? `In Stock (${configured?.effectiveStock ?? activeProduct.stockQuantity})`
                : !exactVariantMatch.combinationExists
                ? "Combination Unavailable"
                : activeProduct.stockStatus || "Confirm Stock"}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Breadcrumbs + Family Switcher Pills */}
      <div className="bsg-cfg-substrip">
        <nav className="bsg-cfg-breadcrumbs" aria-label="Breadcrumb">
          <Link to="/store">Store</Link>
          <ChevronRight size={13} aria-hidden="true" />
          <Link to={catMeta.shopPath}>Shop {catMeta.label}</Link>
          <ChevronRight size={13} aria-hidden="true" />
          <span>{activeFamilyMeta?.title || catMeta.label}</span>
          <ChevronRight size={13} aria-hidden="true" />
          <strong style={{ color: "#1d1d1f" }}>{activeProduct.name}</strong>
        </nav>

        <div className="bsg-cfg-family-pills" aria-label={`Switch ${catMeta.label} family`}>
          {laneFamilies.map((fam) => (
            <button
              key={fam.id}
              type="button"
              className={`bsg-cfg-pill ${activeFamilyMeta?.id === fam.id ? "is-active" : ""}`}
              data-testid={`cfg-family-pill-${fam.id}`}
              onClick={() => switchToProduct(fam.primaryProduct)}
            >
              {fam.title}
            </button>
          ))}
          {otherLaneDevices.length > 0 && (
            <button
              type="button"
              className="bsg-cfg-pill"
              style={{ borderColor: "#d8a72d", color: "#9a6f08" }}
              data-testid="cfg-switch-condition-lane"
              onClick={() => {
                const target =
                  otherLaneDevices.find((p) => isProductOrderable(p)) || otherLaneDevices[0];
                if (target) switchToProduct(target);
              }}
            >
              {activeIsUkUsed ? "Switch to Brand New" : `Browse UK Used (${otherLaneDevices.length})`}
            </button>
          )}
        </div>
      </div>

      {/* 3. Main 2-Column Configurator */}
      <main className="bsg-cfg-main">
        {/* Left Sticky Gallery */}
        <div className="bsg-cfg-gallery-col">
          <SwipeableProductGallery
            images={galleryImages}
            activeIndex={activeThumb}
            onSelectIndex={setActiveThumb}
            productName={activeProduct.name}
            showThumbnails={galleryImages.length > 1}
            enableZoom
            activeColorKey={colorVariantId}
            activeColorLabel={selectedColor || undefined}
          />

          <div className="bsg-cfg-assurance-box">
            <div className="bsg-cfg-assurance-item">
              <Store size={16} />
              <div>
                <strong style={{ color: "#1d1d1f", display: "block" }}>Free Dome Pillar 2 Pickup</strong>
                <span>Inspect device &amp; serial before paying</span>
              </div>
            </div>
            <div className="bsg-cfg-assurance-item">
              <Truck size={16} />
              <div>
                <strong style={{ color: "#1d1d1f", display: "block" }}>Ghana Delivery</strong>
                <span>Same-day Accra &amp; nationwide dispatch</span>
              </div>
            </div>
            <div className="bsg-cfg-assurance-item">
              <ShieldCheck size={16} />
              <div>
                <strong style={{ color: "#1d1d1f", display: "block" }}>
                  {activeIsUkUsed ? "Verified UK Used" : "100% Authentic Apple"}
                </strong>
                <span>Hardware diagnostics tested in Accra</span>
              </div>
            </div>
            <div className="bsg-cfg-assurance-item">
              <Package size={16} />
              <div>
                <strong style={{ color: "#1d1d1f", display: "block" }}>Ghanaian Payment</strong>
                <span>Mobile Money · Pickup · Pay on Delivery</span>
              </div>
            </div>
          </div>

          {activeProduct.box && activeProduct.box.length > 0 && (
            <div className="bsg-cfg-box-contents">
              <h3 style={{ margin: "0 0 8px", fontSize: 14, fontWeight: 700 }}>What&apos;s in the Box</h3>
              <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, lineHeight: 1.6, color: "#6e6e73" }}>
                {activeProduct.box.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Right Guided Configuration Panel */}
        <div className="bsg-cfg-steps-col">
          <div className="bsg-cfg-hero-intro">
            <span className="bsg-cfg-cond-pill">
              Buy {catMeta.label} · {activeIsUkUsed ? "UK Used Inventory" : "Brand New"}
            </span>
            <h1>Buy {activeProduct.name}</h1>
            <p style={{ margin: 0, fontSize: 15, lineHeight: 1.5, color: "#6e6e73" }}>
              {(() => {
                const rawDesc = activeProduct.shortDescription || activeProduct.description || "";
                const isStaleBoilerplate = /catalogue listing\.\s*contact buy/i.test(rawDesc);
                if (isStaleBoilerplate && canAddToBag) {
                  return activeIsUkUsed
                    ? `Verified ${activeCondition} ${activeProduct.name} inspected in Accra with Dome Pillar 2 pickup or nationwide delivery.`
                    : `Genuine Brand New Apple ${activeProduct.name} in stock at Buy & Sell GH — inspect at Dome Pillar 2 or request delivery across Ghana.`;
                }
                return rawDesc;
              })()}
            </p>
            <div style={{ marginTop: 12 }}>
              <ProductPromotionalBadge
                product={activeProduct}
                selectedVariant={exactVariantMatch.variant ?? configured?.variant}
                selectedStorage={storageForCart}
              />
            </div>
          </div>

          {/* STEP A: PROMINENT SCREEN SIZE SELECTOR FOR MAC LAPTOPS & IPAD (OMITTED FOR MAC MINI / STUDIO!) */}
          {(category === "mac" || category === "ipad") && familyScreenSizes.length > 0 && (
            <section className="bsg-cfg-step" data-testid="cfg-step-screen-size">
              <h2 className="bsg-cfg-step-head">
                {nextStep()}. Screen size. <span>Choose your display size.</span>
              </h2>
              <div className="bsg-cfg-option-grid-2">
                {familyScreenSizes.map((sz) => {
                  const isSel = normalizeSpecToken(selectedScreenSize) === normalizeSpecToken(sz);
                  const sizeModels = familyModels.filter((m) => {
                    const ms = extractScreenSize(m, category);
                    return (
                      (ms && normalizeSpecToken(ms) === normalizeSpecToken(sz)) ||
                      (m.variants ?? []).some(
                        (v) => v.screenSize && normalizeSpecToken(v.screenSize) === normalizeSpecToken(sz)
                      )
                    );
                  });
                  const minSizePrice = sizeModels
                    .map((m) => m.price)
                    .filter((p) => p > 0)
                    .sort((a, b) => a - b)[0];

                  return (
                    <button
                      key={sz}
                      type="button"
                      className={`bsg-cfg-card ${isSel ? "is-selected" : ""}`}
                      data-testid={`cfg-size-${normalizeSpecToken(sz)}`}
                      onClick={() => handleSelectScreenSize(sz)}
                    >
                      <div>
                        <h3 className="bsg-cfg-card-title">{sz} display</h3>
                        <p className="bsg-cfg-card-sub">
                          {sizeModels.length} {sizeModels.length === 1 ? "model" : "models"} available
                        </p>
                      </div>
                      <div className="bsg-cfg-card-right">
                        {minSizePrice ? (
                          <span className="bsg-cfg-card-price">From {formatPrice(minSizePrice)}</span>
                        ) : null}
                        {isSel && (
                          <span className="bsg-cfg-check-badge" aria-hidden="true">
                            <Check size={12} />
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>
          )}

          {/* STEP B: MODEL SELECTOR (Shows Real Display Screen Size for iPhone!) */}
          {(modelsMatchingSize.length > 1 || category === "iphone") && (
            <section className="bsg-cfg-step" data-testid="cfg-step-model">
              <h2 className="bsg-cfg-step-head">
                {nextStep()}. Model. <span>Which {activeFamilyMeta?.title || catMeta.label} is best for you?</span>
              </h2>
              <div className="bsg-cfg-option-list">
                {modelsMatchingSize.map((m) => {
                  const isSel = m.id === activeProduct.id;
                  const mScreen =
                    category === "watch"
                      ? extractWatchCaseSizes(m).join(" / ")
                      : extractScreenSize(m, category);
                  const mCanBuy = isProductOrderable(m) && getPublicPurchaseAction(m) === "buy";
                  return (
                    <button
                      key={m.id}
                      type="button"
                      className={`bsg-cfg-card ${isSel ? "is-selected" : ""} ${!mCanBuy ? "is-unavailable" : ""}`}
                      data-testid={`cfg-model-${m.slug}`}
                      onClick={() => switchToProduct(m)}
                    >
                      <div>
                        <h3 className="bsg-cfg-card-title">{m.name}</h3>
                        <p className="bsg-cfg-card-sub">
                          {[
                            mScreen ? `${mScreen} display` : "",
                            getEffectiveCondition(m),
                            mCanBuy ? "In Stock" : m.stockStatus || "Confirm Availability",
                          ]
                            .filter(Boolean)
                            .join(" · ")}
                        </p>
                      </div>
                      <div className="bsg-cfg-card-right">
                        <span className="bsg-cfg-card-price">
                          {m.price > 0 ? `From ${formatPrice(m.price)}` : "Enquire"}
                        </span>
                        {isSel && (
                          <span className="bsg-cfg-check-badge" aria-hidden="true">
                            <Check size={12} />
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>
          )}

          {/* STEP C: COLOUR / CASE MATERIAL & FINISH */}
          {colorOptions.length > 0 && (
            <section className="bsg-cfg-step" data-testid="cfg-step-color">
              <h2 className="bsg-cfg-step-head">
                {nextStep()}. {category === "watch" ? "Case finish." : "Finish."}{" "}
                <span>Pick your favorite.</span>
              </h2>
              <p style={{ margin: "0 0 12px", fontSize: 14, color: "#1d1d1f" }}>
                {category === "watch" ? "Case Finish" : "Colour"} —{" "}
                <strong data-testid="cfg-selected-color">{selectedColor}</strong>
              </p>
              <div className="bsg-cfg-swatches-list" role="radiogroup" aria-label="Select finish">
                {colorOptions.map((c) => {
                  const isSel = normalizeSpecToken(selectedColor) === normalizeSpecToken(c.name);
                  return (
                    <button
                      key={c.name}
                      type="button"
                      role="radio"
                      aria-checked={isSel}
                      title={c.name}
                      aria-label={`Select ${c.name}`}
                      className={`bsg-cfg-swatch-btn ${isSel ? "is-selected" : ""}`}
                      style={{ backgroundColor: c.hex }}
                      data-testid={`cfg-color-${normalizeSpecToken(c.name)}`}
                      onClick={() => setSelectedColor(c.name)}
                    />
                  );
                })}
              </div>
            </section>
          )}

          {/* STEP D (WATCH): CASE SIZE IN MM */}
          {category === "watch" && watchCaseSizes.length > 0 && (
            <section className="bsg-cfg-step" data-testid="cfg-step-case-size">
              <h2 className="bsg-cfg-step-head">
                {nextStep()}. Case size. <span>Choose your millimeter fit.</span>
              </h2>
              <div className="bsg-cfg-option-grid-2">
                {watchCaseSizes.map((sz) => {
                  const isSel = normalizeSpecToken(selectedCaseSize) === normalizeSpecToken(sz);
                  const szPrice = findVariantPriceFor({ screenSize: sz, connectivity: selectedConnectivity });
                  return (
                    <button
                      key={sz}
                      type="button"
                      className={`bsg-cfg-card ${isSel ? "is-selected" : ""}`}
                      data-testid={`cfg-casesize-${normalizeSpecToken(sz)}`}
                      onClick={() => setSelectedCaseSize(sz)}
                    >
                      <div>
                        <h3 className="bsg-cfg-card-title">{sz}</h3>
                        <p className="bsg-cfg-card-sub">
                          {sz === "49mm"
                            ? "Aerospace titanium rugged case"
                            : Number.parseInt(sz, 10) >= 44
                            ? "Larger display for easier readability"
                            : "Compact lightweight everyday fit"}
                        </p>
                      </div>
                      <div className="bsg-cfg-card-right">
                        {szPrice && <span className="bsg-cfg-card-price">{szPrice}</span>}
                        {isSel && (
                          <span className="bsg-cfg-check-badge" aria-hidden="true">
                            <Check size={12} />
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>
          )}

          {/* STEP E (MAC): CHIP / PROCESSOR (Strictly from real catalog/variant data!) */}
          {category === "mac" && chipOptions.length > 0 && (
            <section className="bsg-cfg-step" data-testid="cfg-step-chip">
              <h2 className="bsg-cfg-step-head">
                {nextStep()}. Chip. <span>Apple Silicon performance.</span>
              </h2>
              <div className="bsg-cfg-option-list">
                {chipOptions.map((chip) => {
                  const isSel = normalizeSpecToken(selectedChip) === normalizeSpecToken(chip);
                  const chipPrice = findVariantPriceFor({ chip });
                  return (
                    <button
                      key={chip}
                      type="button"
                      className={`bsg-cfg-card ${isSel ? "is-selected" : ""}`}
                      data-testid={`cfg-chip-${normalizeSpecToken(chip)}`}
                      onClick={() => {
                        setSelectedChip(chip);
                        // Auto-align memory & storage to a real matching variant for this chip if one exists
                        const matchVar = (activeProduct.variants ?? []).find(
                          (v) => v.chip && normalizeSpecToken(v.chip) === normalizeSpecToken(chip)
                        );
                        if (matchVar?.memory) setSelectedMemory(matchVar.memory);
                        if (matchVar?.storage) setSelectedStorage(matchVar.storage);
                      }}
                    >
                      <div>
                        <h3 className="bsg-cfg-card-title">Apple {chip} chip</h3>
                        <p className="bsg-cfg-card-sub">Genuine Apple Silicon architecture</p>
                      </div>
                      <div className="bsg-cfg-card-right">
                        {chipPrice && <span className="bsg-cfg-card-price">{chipPrice}</span>}
                        {isSel && (
                          <span className="bsg-cfg-check-badge" aria-hidden="true">
                            <Check size={12} />
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>
          )}

          {/* STEP F (MAC): UNIFIED MEMORY / RAM (Strictly when real variant memory exists!) */}
          {category === "mac" && memoryOptions.length > 0 && (
            <section className="bsg-cfg-step" data-testid="cfg-step-memory">
              <h2 className="bsg-cfg-step-head">
                {nextStep()}. Unified memory. <span>Pick how much RAM you need.</span>
              </h2>
              <div className="bsg-cfg-option-grid-2">
                {memoryOptions.map((mem) => {
                  const isSel = normalizeSpecToken(selectedMemory) === normalizeSpecToken(mem);
                  const memExists = (activeProduct.variants ?? []).some(
                    (v) =>
                      (!v.chip || !selectedChip || normalizeSpecToken(v.chip) === normalizeSpecToken(selectedChip)) &&
                      v.memory &&
                      normalizeSpecToken(v.memory) === normalizeSpecToken(mem)
                  );
                  const memPrice = findVariantPriceFor({ chip: selectedChip, memory: mem });

                  return (
                    <button
                      key={mem}
                      type="button"
                      className={`bsg-cfg-card ${isSel ? "is-selected" : ""} ${!memExists ? "is-unavailable" : ""}`}
                      data-testid={`cfg-memory-${normalizeSpecToken(mem)}`}
                      onClick={() => {
                        setSelectedMemory(mem);
                        // Align storage to a valid variant for this memory if current storage isn't paired with it
                        const validForMem = (activeProduct.variants ?? []).find(
                          (v) =>
                            (!v.chip || !selectedChip || normalizeSpecToken(v.chip) === normalizeSpecToken(selectedChip)) &&
                            v.memory &&
                            normalizeSpecToken(v.memory) === normalizeSpecToken(mem)
                        );
                        if (validForMem?.storage && !((activeProduct.variants ?? []).some(
                          (v) =>
                            v.memory &&
                            normalizeSpecToken(v.memory) === normalizeSpecToken(mem) &&
                            v.storage &&
                            normalizeSpecToken(v.storage) === normalizeSpecToken(selectedStorage)
                        ))) {
                          setSelectedStorage(validForMem.storage);
                        }
                      }}
                    >
                      <div>
                        <h3 className="bsg-cfg-card-title">{mem} Unified Memory</h3>
                        <p className="bsg-cfg-card-sub">
                          {memExists ? "Verified catalogue build" : "Requires different chip"}
                        </p>
                      </div>
                      <div className="bsg-cfg-card-right">
                        {memPrice && <span className="bsg-cfg-card-price">{memPrice}</span>}
                        {isSel && (
                          <span className="bsg-cfg-check-badge" aria-hidden="true">
                            <Check size={12} />
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>
          )}

          {/* STEP G (IPAD & WATCH): CONNECTIVITY (Wi-Fi vs Cellular / GPS vs Cellular) */}
          {(category === "ipad" || category === "watch") && connectivityOptions.length > 0 && (
            <section className="bsg-cfg-step" data-testid="cfg-step-connectivity">
              <h2 className="bsg-cfg-step-head">
                {nextStep()}. Connectivity. <span>Choose how you stay connected.</span>
              </h2>
              <div className="bsg-cfg-option-grid-2">
                {connectivityOptions.map((conn) => {
                  const isSel = normalizeSpecToken(selectedConnectivity) === normalizeSpecToken(conn);
                  const connPrice = findVariantPriceFor({
                    connectivity: conn,
                    screenSize: category === "watch" ? selectedCaseSize : undefined,
                    storage: category === "ipad" ? selectedStorage : undefined,
                  });
                  return (
                    <button
                      key={conn}
                      type="button"
                      className={`bsg-cfg-card ${isSel ? "is-selected" : ""}`}
                      data-testid={`cfg-conn-${normalizeSpecToken(conn)}`}
                      onClick={() => setSelectedConnectivity(conn)}
                    >
                      <div>
                        <h3 className="bsg-cfg-card-title">{conn}</h3>
                        <p className="bsg-cfg-card-sub">
                          {/cellular/i.test(conn)
                            ? "Stay connected on Ghana 4G/5G networks"
                            : "Connect seamlessly via Wi-Fi & iPhone"}
                        </p>
                      </div>
                      <div className="bsg-cfg-card-right">
                        {connPrice && <span className="bsg-cfg-card-price">{connPrice}</span>}
                        {isSel && (
                          <span className="bsg-cfg-check-badge" aria-hidden="true">
                            <Check size={12} />
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>
          )}

          {/* STEP H (MAC, IPAD, IPHONE): STORAGE CAPACITY */}
          {category !== "watch" && storageOptions.length > 0 && (
            <section className="bsg-cfg-step" data-testid="cfg-step-storage">
              <h2 className="bsg-cfg-step-head">
                {nextStep()}. Storage. <span>How much space do you need?</span>
              </h2>
              <div className="bsg-cfg-option-grid-2">
                {storageOptions.map((cap) => {
                  const isSel = normalizeSpecToken(selectedStorage) === normalizeSpecToken(cap);
                  const capPrice = findVariantPriceFor({
                    storage: cap,
                    chip: selectedChip || undefined,
                    memory: selectedMemory || undefined,
                    connectivity: selectedConnectivity || undefined,
                  });
                  const capExists =
                    (activeProduct.variants ?? []).length === 0 ||
                    (activeProduct.variants ?? []).some(
                      (v) =>
                        (!v.storage || normalizeSpecToken(v.storage) === normalizeSpecToken(cap)) &&
                        (!v.chip || !selectedChip || normalizeSpecToken(v.chip) === normalizeSpecToken(selectedChip)) &&
                        (!v.memory || !selectedMemory || normalizeSpecToken(v.memory) === normalizeSpecToken(selectedMemory))
                    );

                  return (
                    <button
                      key={cap}
                      type="button"
                      className={`bsg-cfg-card ${isSel ? "is-selected" : ""} ${!capExists ? "is-unavailable" : ""}`}
                      data-testid={`cfg-storage-${normalizeSpecToken(cap)}`}
                      onClick={() => setSelectedStorage(cap)}
                    >
                      <div>
                        <h3 className="bsg-cfg-card-title">{cap}</h3>
                        <p className="bsg-cfg-card-sub">
                          {capExists ? "Available configuration" : "Switch chip/RAM for this storage"}
                        </p>
                      </div>
                      <div className="bsg-cfg-card-right">
                        {capPrice && <span className="bsg-cfg-card-price">{capPrice}</span>}
                        {isSel && (
                          <span className="bsg-cfg-check-badge" aria-hidden="true">
                            <Check size={12} />
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>
          )}

          {/* STEP I (WATCH): BAND STYLE, COLOUR & SIZE PREFERENCE */}
          {category === "watch" && (
            <section className="bsg-cfg-step" data-testid="cfg-step-watch-band">
              <h2 className="bsg-cfg-step-head">
                {nextStep()}. Band preference. <span>Included band confirmed at Dome Pillar 2.</span>
              </h2>
              <div className="bsg-cfg-option-grid-2" style={{ marginBottom: 14 }}>
                {watchBandStyleOptions.map((style) => {
                  const isSel = selectedBandStyle === style;
                  return (
                    <button
                      key={style}
                      type="button"
                      className={`bsg-cfg-card ${isSel ? "is-selected" : ""}`}
                      onClick={() => setSelectedBandStyle(style)}
                    >
                      <div>
                        <h3 className="bsg-cfg-card-title">{style}</h3>
                        <p className="bsg-cfg-card-sub">Included band style</p>
                      </div>
                      {isSel && (
                        <span className="bsg-cfg-check-badge" aria-hidden="true">
                          <Check size={12} />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 12, alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>
                    Band Colour: <strong>{selectedBandColor}</strong>
                  </div>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {WATCH_BAND_COLORS.map((bc) => (
                      <button
                        key={bc}
                        type="button"
                        className={`bsg-cfg-pill ${selectedBandColor === bc ? "is-active" : ""}`}
                        onClick={() => setSelectedBandColor(bc)}
                      >
                        {bc}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Band Size</div>
                  <div style={{ display: "flex", gap: 6 }}>
                    {WATCH_BAND_SIZES.map((bs) => (
                      <button
                        key={bs}
                        type="button"
                        className={`bsg-cfg-pill ${selectedBandSize === bs ? "is-active" : ""}`}
                        onClick={() => setSelectedBandSize(bs)}
                      >
                        {bs}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* STEP J: TRADE-IN ESTIMATE (OPTIONAL — KEPT SEPARATE FROM RETAIL PRICE) */}
          <section className="bsg-cfg-step">
            <h2 className="bsg-cfg-step-head">
              {nextStep()}. Buy &amp; Sell GH Trade-In. <span>Swap your current device in Accra.</span>
            </h2>
            <div className="bsg-cfg-option-grid-2">
              <button
                type="button"
                className={`bsg-cfg-card ${!tradeIn ? "is-selected" : ""}`}
                onClick={() => setTradeIn(false)}
              >
                <div>
                  <h3 className="bsg-cfg-card-title">No trade-in</h3>
                  <p className="bsg-cfg-card-sub">Standard full GH₵ price</p>
                </div>
                {!tradeIn && (
                  <span className="bsg-cfg-check-badge" aria-hidden="true">
                    <Check size={12} />
                  </span>
                )}
              </button>
              <button
                type="button"
                className={`bsg-cfg-card ${tradeIn ? "is-selected" : ""}`}
                onClick={() => setTradeIn(true)}
              >
                <div>
                  <h3 className="bsg-cfg-card-title">Apply Accra Trade-In</h3>
                  <p className="bsg-cfg-card-sub">Valued in person at Dome Pillar 2</p>
                </div>
                {tradeIn && (
                  <span className="bsg-cfg-check-badge" aria-hidden="true">
                    <Check size={12} />
                  </span>
                )}
              </button>
            </div>
          </section>

          {/* UNAVAILABLE COMBINATION / OUT OF STOCK GUARDRAIL + ALTERNATIVE SUGGESTIONS */}
          {!canAddToBag && (
            <div className="bsg-cfg-unavailable-box" data-testid="cfg-unavailable-warning">
              <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                <AlertTriangle size={20} color="#b45309" style={{ flexShrink: 0, marginTop: 2 }} />
                <div>
                  <strong style={{ display: "block", fontSize: 15, color: "#78350f" }}>
                    {!exactVariantMatch.combinationExists
                      ? "This exact specification combination is not in our current catalogue."
                      : activeProduct.priceOnRequest || activeProduct.price <= 0
                      ? `Live GH₵ pricing for ${activeProduct.name} is confirmed directly on enquiry.`
                      : `${activeProduct.name} is currently ${activeProduct.stockStatus || "unavailable"} for direct checkout.`}
                  </strong>
                  <p style={{ margin: "4px 0 0", fontSize: 13.5, color: "#92400e", lineHeight: 1.45 }}>
                    We only allow verified in-stock configurations into your bag. Select an available alternative below or message our Accra team on WhatsApp to reserve this configuration.
                  </p>
                </div>
              </div>

              {!exactVariantMatch.combinationExists && exactVariantMatch.nearestAvailableVariant && (
                <div className="bsg-cfg-alt-item">
                  <div>
                    <strong style={{ fontSize: 13.5 }}>{exactVariantMatch.nearestAvailableVariant.title}</strong>
                    <div style={{ fontSize: 12.5, color: "#15803d", fontWeight: 600 }}>
                      {formatPrice(exactVariantMatch.nearestAvailableVariant.price)} · Available now
                    </div>
                  </div>
                  <button
                    type="button"
                    className="bsg-shop-btn-gold"
                    data-testid="cfg-apply-valid-variant"
                    onClick={() => {
                      const v = exactVariantMatch.nearestAvailableVariant!;
                      if (v.chip) setSelectedChip(v.chip);
                      if (v.memory) setSelectedMemory(v.memory);
                      if (v.storage) setSelectedStorage(v.storage);
                      if (v.connectivity) setSelectedConnectivity(v.connectivity);
                      if (v.screenSize && category === "watch") setSelectedCaseSize(v.screenSize);
                    }}
                  >
                    Select this build
                  </button>
                </div>
              )}

              {inStockAlternatives.length > 0 && (
                <div className="bsg-cfg-alt-list">
                  <span style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", color: "#92400e" }}>
                    Available in-stock alternatives in Accra:
                  </span>
                  {inStockAlternatives.map((alt) => (
                    <div key={alt.id} className="bsg-cfg-alt-item">
                      <div>
                        <strong style={{ fontSize: 13.5 }}>{alt.name}</strong>
                        <div style={{ fontSize: 12.5, color: "#15803d", fontWeight: 600 }}>
                          {formatPrice(alt.price)} · In Stock ({alt.stockQuantity})
                        </div>
                      </div>
                      <button
                        type="button"
                        className="bsg-shop-btn-gold"
                        onClick={() => switchToProduct(alt)}
                      >
                        Configure
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* FINAL CONFIGURATION SUMMARY & ADD TO BAG */}
          <section className="bsg-cfg-summary-card" data-testid="cfg-summary-card">
            <div>
              <span className="bsg-cfg-cond-pill" style={{ marginBottom: 6 }}>
                Your Configured {catMeta.label}
              </span>
              <h2 style={{ margin: "4px 0 4px", fontSize: 24, fontWeight: 700 }}>
                {activeProduct.name}
              </h2>
              <div style={{ fontSize: 26, fontWeight: 800, color: "#1d1d1f", marginTop: 6 }} data-testid="cfg-summary-price">
                {displayPrice}
              </div>
              {tradeIn && tradeInBreakdown.tradeInCredit > 0 && (
                <p style={{ margin: "4px 0 0", fontSize: 13, color: "#9a6f08", fontWeight: 600 }}>
                  Estimated after Accra Trade-In: ~{tradeInBreakdown.formattedEstimatedDue} (final valuation confirmed at Dome Pillar 2)
                </p>
              )}
            </div>

            <ul className="bsg-cfg-summary-specs" data-testid="cfg-summary-specs">
              <li>
                <span>Condition</span>
                <strong>
                  {activeIsUkUsed
                    ? activeCondition.toLowerCase() === "uk used"
                      ? "UK Used"
                      : `UK Used (${activeCondition})`
                    : "Brand New"}
                </strong>
              </li>
              {category !== "watch" && (selectedScreenSize || currentModelScreenSize) && (
                <li>
                  <span>Screen Size</span>
                  <strong>{selectedScreenSize || currentModelScreenSize}</strong>
                </li>
              )}
              {category === "watch" && selectedCaseSize && (
                <li>
                  <span>Case Size</span>
                  <strong>{selectedCaseSize}</strong>
                </li>
              )}
              {selectedColor && (
                <li>
                  <span>{category === "watch" ? "Case Finish" : "Colour / Finish"}</span>
                  <strong>{selectedColor}</strong>
                </li>
              )}
              {selectedChip && (
                <li>
                  <span>Chip</span>
                  <strong>{selectedChip}</strong>
                </li>
              )}
              {selectedMemory && (
                <li>
                  <span>Memory</span>
                  <strong>{selectedMemory}</strong>
                </li>
              )}
              {category !== "watch" && selectedStorage && (
                <li>
                  <span>Storage</span>
                  <strong>{selectedStorage}</strong>
                </li>
              )}
              {selectedConnectivity && (
                <li>
                  <span>Connectivity</span>
                  <strong>{selectedConnectivity}</strong>
                </li>
              )}
              {category === "watch" && (
                <li>
                  <span>Band Preference</span>
                  <strong>
                    {selectedBandStyle} · {selectedBandColor} ({selectedBandSize})
                  </strong>
                </li>
              )}
            </ul>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <button
                type="button"
                className="bsg-cfg-btn-gold-lg"
                disabled={!canAddToBag}
                data-testid="cfg-add-to-bag-btn"
                onClick={handleAddToBag}
              >
                <ShoppingBag size={18} aria-hidden="true" />
                <span>
                  {editingItem && editingItem.product.slug === activeProduct.slug
                    ? "Update Item in Bag"
                    : canAddToBag
                    ? "Add to Bag"
                    : "Configuration Unavailable"}
                </span>
              </button>

              {!canAddToBag && (
                <a
                  href={whatsAppUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bsg-shop-btn-outline"
                  style={{ width: "100%", minHeight: 46, justifyContent: "center" }}
                >
                  <MessageCircle size={16} />
                  <span>Confirm Stock on WhatsApp</span>
                </a>
              )}

              {notice && (
                <p
                  role="status"
                  style={{
                    margin: "4px 0 0",
                    padding: "10px 14px",
                    borderRadius: 12,
                    background: "#f0fdf4",
                    border: "1px solid #bbf7d0",
                    color: "#15803d",
                    fontSize: 13.5,
                    fontWeight: 600,
                  }}
                >
                  {notice}
                </p>
              )}
            </div>
          </section>
        </div>
      </main>

      {/* 4. Compatible Recommended Accessories */}
      {recommendedAccessories.length > 0 && (
        <section className="bsg-cfg-acc-section" data-testid="cfg-recommended-accessories">
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
            <div>
              <h2 style={{ margin: 0, fontSize: 24, fontWeight: 700 }}>
                Pair with genuine {catMeta.label} accessories.
              </h2>
              <p style={{ margin: "4px 0 0", fontSize: 14, color: "#6e6e73" }}>
                In-stock original Apple chargers, cables, cases, and input accessories ready in Accra.
              </p>
            </div>
            <Link to={`${catMeta.shopPath}?tab=accessories`} className="bsg-shop-link-gold">
              <span>View all {catMeta.label} accessories</span>
              <ChevronRight size={15} />
            </Link>
          </div>

          <div className="bsg-cfg-acc-grid">
            {recommendedAccessories.map((acc) => {
              const img = resolveShopProductImageSrc(acc, shopExperience);
              return (
                <article key={acc.id} className="bsg-cfg-acc-card">
                  <div>
                    <div className="bsg-cfg-acc-thumb">
                      {img ? <img src={img} alt={acc.name} /> : <ShoppingBag size={24} color="#a1a1a6" />}
                    </div>
                    <h3 style={{ margin: "10px 0 4px", fontSize: 14.5, fontWeight: 700, lineHeight: 1.3 }}>
                      {acc.name}
                    </h3>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#1d1d1f" }}>
                      {formatPrice(acc.price)}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      type="button"
                      className="bsg-shop-btn-gold"
                      style={{ flex: 1, minHeight: 34, fontSize: 12.5, padding: "0 12px" }}
                      onClick={() => addItem(acc, acc.storage?.[0] || "Standard", acc.colors?.[0] || "Standard", 1, undefined, img)}
                    >
                      <ShoppingBag size={12} /> Add
                    </button>
                    <Link
                      to={getProductShopBuyPath(acc)}
                      className="bsg-shop-btn-outline"
                      style={{ minHeight: 34, fontSize: 12.5, padding: "0 12px" }}
                    >
                      View
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      )}

      {/* 5. Mobile Persistent Purchase Bar */}
      <aside className="bsg-cfg-mobile-bar" aria-label="Configured purchase summary">
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 13.5, fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {activeProduct.name}
          </div>
          <div style={{ fontSize: 14, fontWeight: 800, color: "#9a6f08" }}>{displayPrice}</div>
        </div>
        <button
          type="button"
          className="bsg-shop-btn-gold"
          style={{ minHeight: 42, padding: "0 20px" }}
          disabled={!canAddToBag}
          onClick={handleAddToBag}
        >
          <ShoppingBag size={14} aria-hidden="true" />
          <span>{canAddToBag ? "Add to Bag" : "Unavailable"}</span>
        </button>
      </aside>
    </div>
  );
}
