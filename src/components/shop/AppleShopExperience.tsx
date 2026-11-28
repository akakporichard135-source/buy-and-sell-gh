import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  MapPin,
  MessageCircle,
  Search,
  ShieldCheck,
  ShoppingBag,
  Smartphone,
  Sparkles,
  Store,
  Truck,
  X,
} from "lucide-react";
import { useCms } from "../../cms/CmsContext";
import { defaultShopExperienceConfig } from "../../cms/shopExperienceDefaults";
import type { ShopCategoryKey, ShopExperienceConfig } from "../../cms/types";
import { useProductCatalog } from "../../catalog/ProductCatalogContext";
import { isProductOrderable } from "../../catalog/productCatalog";
import { getPublicPurchaseAction } from "../../catalog/productPurchaseAction";
import {
  buildShopFamilyGroups,
  extractChipOptions,
  extractScreenSize,
  extractWatchCaseSizes,
  getEffectiveCondition,
  getProductFamilyBucket,
  getProductShopBuyPath,
  getShopAccessoriesForCategory,
  isShopDeviceForCategory,
  isUkUsedProduct,
  resolveShopProductImageSrc,
  searchShopCatalog,
  sortShopDevicesNewest,
} from "../../catalog/shopClassification";
import { getCardPriceDisplay } from "../../utils/productPricing";
import { resolveColorOption } from "../../utils/productColors";
import { getSelectableStorageOptions } from "../../utils/variantSelection";
import { SEO } from "../SEO";
import "../../styles/apple-shop-experience.css";

interface AppleShopExperienceProps {
  category: ShopCategoryKey;
  configOverride?: ShopExperienceConfig;
}

type InventorySectionMode = "brand-new" | "uk-used" | "accessories";

const SHOP_SWITCHER: Array<{ key: ShopCategoryKey; label: string; to: string }> = [
  { key: "mac", label: "Shop Mac", to: "/shop/buy-mac" },
  { key: "ipad", label: "Shop iPad", to: "/shop/buy-ipad" },
  { key: "iphone", label: "Shop iPhone", to: "/shop/buy-iphone" },
  { key: "watch", label: "Shop Apple Watch", to: "/shop/buy-watch" },
];

export function AppleShopExperience({ category, configOverride }: AppleShopExperienceProps) {
  const { shopExperience } = useCms();
  const { activeProducts } = useProductCatalog();
  const [searchParams, setSearchParams] = useSearchParams();

  const activeConfig = configOverride || shopExperience || defaultShopExperienceConfig;
  const catConfig = activeConfig.categories[category] || defaultShopExperienceConfig.categories[category];

  const initialTab = searchParams.get("tab");
  const [activeMode, setActiveMode] = useState<InventorySectionMode>(
    initialTab === "uk-used" || initialTab === "accessories" ? initialTab : "brand-new"
  );
  const [searchQuery, setSearchQuery] = useState(() => searchParams.get("q") || "");
  const [searchScope, setSearchScope] = useState<"category" | "all">("category");
  const [searchCondition, setSearchCondition] = useState<"all" | "brand-new" | "uk-used">("all");
  const [searchInStockOnly, setSearchInStockOnly] = useState(false);
  const [selectedFamilyId, setSelectedFamilyId] = useState<string | null>(null);
  const [ukUsedGenFilter, setUkUsedGenFilter] = useState<string>("all");

  const familyTrackRef = useRef<HTMLDivElement | null>(null);
  const accTrackRef = useRef<HTMLDivElement | null>(null);
  const [familyScroll, setFamilyScroll] = useState({ canLeft: false, canRight: true });
  const [accScroll, setAccScroll] = useState({ canLeft: false, canRight: true });

  // Reset per-category ephemeral state on category navigation
  useEffect(() => {
    const t = searchParams.get("tab");
    setActiveMode(t === "uk-used" || t === "accessories" ? t : "brand-new");
    setSelectedFamilyId(null);
    setUkUsedGenFilter("all");
  }, [category]);

  // All real devices for this category (excluding accessories)
  const categoryDevices = useMemo(
    () => sortShopDevicesNewest(activeProducts.filter((p) => isShopDeviceForCategory(p, category)), category),
    [activeProducts, category]
  );

  // Strict Brand New vs UK Used split (enforcing iPhone 15 Pro & older -> UK Used!)
  const brandNewDevices = useMemo(
    () => categoryDevices.filter((p) => !isUkUsedProduct(p)),
    [categoryDevices]
  );

  const ukUsedDevices = useMemo(() => {
    const overrides = activeConfig.ukUsedOverrides || {};
    return categoryDevices
      .filter((p) => isUkUsedProduct(p))
      .filter((p) => {
        const ov = overrides[p.id] || overrides[p.slug];
        return ov?.visible !== false;
      })
      .sort((a, b) => {
        const ovA = overrides[a.id] || overrides[a.slug];
        const ovB = overrides[b.id] || overrides[b.slug];
        const ordA = typeof ovA?.displayOrder === "number" ? ovA.displayOrder : 999;
        const ordB = typeof ovB?.displayOrder === "number" ? ovB.displayOrder : 999;
        if (ordA !== ordB) return ordA - ordB;
        // Prefer in-stock units first within same generation order
        const stockDiff = Number(isProductOrderable(b)) - Number(isProductOrderable(a));
        if (stockDiff !== 0) return stockDiff;
        return 0;
      });
  }, [categoryDevices, activeConfig.ukUsedOverrides]);

  const brandNewFamilies = useMemo(
    () => buildShopFamilyGroups(brandNewDevices, category, activeConfig),
    [brandNewDevices, category, activeConfig]
  );

  const selectedFamily = useMemo(
    () => brandNewFamilies.find((f) => f.id === selectedFamilyId) || null,
    [brandNewFamilies, selectedFamilyId]
  );

  const categoryAccessories = useMemo(
    () => getShopAccessoriesForCategory(activeProducts, category, catConfig.curatedAccessorySlugs),
    [activeProducts, category, catConfig.curatedAccessorySlugs]
  );

  // UK Used generation sub-filters (e.g., iPhone 15 / 14 / 13 / 12 / 11)
  const ukUsedFilterTabs = useMemo(() => {
    const buckets = new Map<string, string>();
    for (const p of ukUsedDevices) {
      const b = getProductFamilyBucket(p, category);
      if (!buckets.has(b.id)) buckets.set(b.id, b.title);
    }
    return Array.from(buckets.entries()).map(([id, label]) => ({ id, label }));
  }, [ukUsedDevices, category]);

  const filteredUkUsedDevices = useMemo(() => {
    if (ukUsedGenFilter === "all") return ukUsedDevices;
    return ukUsedDevices.filter((p) => getProductFamilyBucket(p, category).id === ukUsedGenFilter);
  }, [ukUsedDevices, ukUsedGenFilter, category]);

  // Live Working Product Search Results
  const isSearching = searchQuery.trim().length > 0;
  const searchResults = useMemo(() => {
    if (!isSearching) return [];
    return searchShopCatalog(activeProducts, searchQuery, {
      category: searchScope === "category" ? category : "all",
      conditionFilter: searchCondition,
      inStockOnly: searchInStockOnly,
      shopConfig: activeConfig,
    });
  }, [activeProducts, isSearching, searchQuery, searchScope, category, searchCondition, searchInStockOnly, activeConfig]);

  const syncTrack = (
    el: HTMLDivElement | null,
    setter: React.Dispatch<React.SetStateAction<{ canLeft: boolean; canRight: boolean }>>
  ) => {
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setter({ canLeft: el.scrollLeft > 8, canRight: max - el.scrollLeft > 8 });
  };

  useEffect(() => {
    const updateAll = () => {
      syncTrack(familyTrackRef.current, setFamilyScroll);
      syncTrack(accTrackRef.current, setAccScroll);
    };
    updateAll();
    const timer = window.setTimeout(updateAll, 250);
    window.addEventListener("resize", updateAll);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("resize", updateAll);
    };
  }, [brandNewFamilies.length, categoryAccessories.length, activeMode]);

  const handleSelectMode = (mode: InventorySectionMode) => {
    setActiveMode(mode);
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (mode === "brand-new") next.delete("tab");
        else next.set("tab", mode);
        return next;
      },
      { replace: true }
    );
    const targetId =
      mode === "brand-new"
        ? "shop-brand-new"
        : mode === "uk-used"
        ? "shop-uk-used"
        : "shop-accessories";
    window.requestAnimationFrame(() => {
      document.getElementById(targetId)?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const quickSearchSuggestions: Record<ShopCategoryKey, string[]> = {
    mac: ["MacBook Air M5", "14-inch", "16-inch", "MacBook Neo", "UK Used"],
    ipad: ["iPad Pro", "iPad Air", "13-inch", "11-inch", "Apple Pencil"],
    iphone: ["iPhone 18 Pro", "iPhone Duo", "iPhone 15 Pro", "UK Used", "256GB"],
    watch: ["Series 12", "Ultra 4", "49mm", "46mm", "UK Used"],
  };

  const categoryShortName =
    category === "mac" ? "Mac" : category === "ipad" ? "iPad" : category === "iphone" ? "iPhone" : "Apple Watch";

  return (
    <div className="bsg-shop-page" data-testid={`shop-hub-${category}`}>
      <SEO
        title={`${catConfig.heading} — Brand New, UK Used & Accessories | Buy & Sell GH`}
        description={catConfig.subtitle}
      />

      {/* 1. Ghana Promo Ribbon */}
      {catConfig.promoRibbonText && (
        <div className="bsg-shop-promo-ribbon" data-testid="shop-promo-ribbon">
          <span>{catConfig.promoRibbonText}</span>
          {catConfig.promoRibbonLinkLabel && (
            catConfig.promoRibbonLinkTo.startsWith("#") ? (
              <a href={catConfig.promoRibbonLinkTo}>
                <span>{catConfig.promoRibbonLinkLabel}</span>
                <ChevronRight size={14} aria-hidden="true" />
              </a>
            ) : (
              <Link to={catConfig.promoRibbonLinkTo}>
                <span>{catConfig.promoRibbonLinkLabel}</span>
                <ChevronRight size={14} aria-hidden="true" />
              </Link>
            )
          )}
        </div>
      )}

      {/* 2. Shop Header */}
      <header className="bsg-shop-header">
        <div className="bsg-shop-container">
          <div className="bsg-shop-header-row">
            <div>
              <h1 className="bsg-shop-title">
                {catConfig.heading}
                <span className="bsg-shop-title-dot">.</span>
              </h1>
              <p className="bsg-shop-subtitle">{catConfig.subtitle}</p>
            </div>

            <div className="bsg-shop-help-links">
              <Link to={catConfig.specialistTo} className="bsg-shop-help-item">
                <span className="bsg-shop-help-icon" aria-hidden="true">
                  <MessageCircle size={14} />
                </span>
                <span>
                  Need shopping help? <strong>{catConfig.specialistLabel}</strong>
                </span>
              </Link>
              <Link to={catConfig.showroomTo} className="bsg-shop-help-item">
                <span className="bsg-shop-help-icon" aria-hidden="true">
                  <MapPin size={14} />
                </span>
                <span>
                  Accra Showroom: <strong>{catConfig.showroomLabel}</strong>
                </span>
              </Link>
            </div>
          </div>

          <nav className="bsg-shop-cat-switcher" aria-label="Switch Apple device shop">
            {SHOP_SWITCHER.map((item) => (
              <Link
                key={item.key}
                to={item.to}
                className={`bsg-shop-cat-pill ${item.key === category ? "is-active" : ""}`}
                data-testid={`shop-switch-${item.key}`}
              >
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>
        </div>
      </header>

      {/* 3. Sticky Navigation (Brand New -> UK Used -> Accessories) + Live Product Search */}
      <div className="bsg-shop-toolbar" data-testid="shop-toolbar">
        <div className="bsg-shop-container">
          <div className="bsg-shop-toolbar-inner">
            <nav
              className="bsg-shop-mode-nav"
              aria-label="Shop inventory navigation"
              data-testid="shop-inventory-nav"
            >
              <button
                type="button"
                className={`bsg-shop-mode-btn ${activeMode === "brand-new" ? "is-active" : ""}`}
                data-testid="shop-nav-brand-new"
                onClick={() => handleSelectMode("brand-new")}
              >
                <span>Brand New</span>
                <span className="bsg-shop-mode-count">{brandNewDevices.length}</span>
              </button>

              <button
                type="button"
                className={`bsg-shop-mode-btn ${activeMode === "uk-used" ? "is-active" : ""}`}
                data-testid="shop-nav-uk-used"
                onClick={() => handleSelectMode("uk-used")}
              >
                <span>UK Used</span>
                <span className="bsg-shop-mode-count">{ukUsedDevices.length}</span>
              </button>

              <button
                type="button"
                className={`bsg-shop-mode-btn ${activeMode === "accessories" ? "is-active" : ""}`}
                data-testid="shop-nav-accessories"
                onClick={() => handleSelectMode("accessories")}
              >
                <span>Accessories</span>
                <span className="bsg-shop-mode-count">{categoryAccessories.length}</span>
              </button>
            </nav>

            <div className="bsg-shop-search-wrap" role="search">
              <Search size={16} className="bsg-shop-search-icon" aria-hidden="true" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={catConfig.searchPlaceholder}
                aria-label={`Search ${categoryShortName} models, screen sizes, storage, colors, and UK Used`}
                className="bsg-shop-search-input"
                data-testid="shop-search-input"
              />
              {searchQuery && (
                <button
                  type="button"
                  className="bsg-shop-search-clear"
                  aria-label="Clear search"
                  data-testid="shop-search-clear"
                  onClick={() => setSearchQuery("")}
                >
                  <X size={13} />
                </button>
              )}
            </div>
          </div>

          <div className="bsg-shop-anchors">
            <a href="#shop-brand-new" className="bsg-shop-anchor-link">
              All Brand New Models
            </a>
            {catConfig.showUkUsedSection && (
              <a href="#shop-uk-used" className="bsg-shop-anchor-link">
                UK Used {categoryShortName}
              </a>
            )}
            {catConfig.showAccessoriesSection && (
              <a href="#shop-accessories" className="bsg-shop-anchor-link">
                {categoryShortName} Accessories
              </a>
            )}
            {catConfig.showWaysToBuySection && (
              <a href="#shop-ways-to-buy" className="bsg-shop-anchor-link">
                Ways to Buy
              </a>
            )}
            {catConfig.showOnlyAtSection && (
              <a href="#shop-only-at-bsg" className="bsg-shop-anchor-link">
                Only at Buy &amp; Sell GH
              </a>
            )}
          </div>
        </div>
      </div>

      {/* LIVE SEARCH RESULTS PANEL */}
      {isSearching && (
        <section className="bsg-shop-container" data-testid="shop-search-results">
          <div className="bsg-shop-search-panel">
            <div className="bsg-shop-search-head">
              <div>
                <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>
                  Search results for &ldquo;{searchQuery.trim()}&rdquo;
                </h2>
                <p style={{ margin: "4px 0 0", fontSize: 13.5, color: "#6e6e73" }}>
                  Showing {searchResults.length} matching{" "}
                  {searchResults.length === 1 ? "product" : "products"} from live Buy &amp; Sell GH inventory.
                </p>
              </div>

              <div className="bsg-shop-search-filters">
                <button
                  type="button"
                  className={`bsg-shop-chip ${searchScope === "category" ? "is-active" : ""}`}
                  onClick={() => setSearchScope("category")}
                >
                  {categoryShortName} Only
                </button>
                <button
                  type="button"
                  className={`bsg-shop-chip ${searchScope === "all" ? "is-active" : ""}`}
                  onClick={() => setSearchScope("all")}
                >
                  All Categories
                </button>
                <button
                  type="button"
                  className={`bsg-shop-chip ${searchCondition === "all" ? "is-active" : ""}`}
                  onClick={() => setSearchCondition("all")}
                >
                  All Conditions
                </button>
                <button
                  type="button"
                  className={`bsg-shop-chip ${searchCondition === "brand-new" ? "is-active" : ""}`}
                  onClick={() => setSearchCondition("brand-new")}
                >
                  Brand New
                </button>
                <button
                  type="button"
                  className={`bsg-shop-chip ${searchCondition === "uk-used" ? "is-active" : ""}`}
                  onClick={() => setSearchCondition("uk-used")}
                >
                  UK Used
                </button>
                <button
                  type="button"
                  className={`bsg-shop-chip ${searchInStockOnly ? "is-active" : ""}`}
                  onClick={() => setSearchInStockOnly((v) => !v)}
                >
                  In Stock Only
                </button>
              </div>
            </div>

            {searchResults.length === 0 ? (
              <div className="bsg-shop-search-empty" data-testid="shop-search-empty">
                <p style={{ margin: "0 0 8px", fontSize: 18, fontWeight: 700 }}>
                  No matching devices found for &ldquo;{searchQuery.trim()}&rdquo;
                </p>
                <p style={{ margin: "0 0 18px", fontSize: 14, color: "#6e6e73" }}>
                  Try searching by model name, screen size, chip, storage, or switch to All Categories.
                </p>
                <div style={{ display: "flex", justifyContent: "center", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
                  {quickSearchSuggestions[category].map((term) => (
                    <button
                      key={term}
                      type="button"
                      className="bsg-shop-chip"
                      onClick={() => setSearchQuery(term)}
                    >
                      {term}
                    </button>
                  ))}
                </div>
                <div style={{ display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
                  <button
                    type="button"
                    className="bsg-shop-btn-outline"
                    onClick={() => {
                      setSearchQuery("");
                      setSearchCondition("all");
                      setSearchInStockOnly(false);
                    }}
                  >
                    Reset search
                  </button>
                  <Link to="/pre-order" className="bsg-shop-btn-gold">
                    Request this device in Accra
                  </Link>
                </div>
              </div>
            ) : (
              <div className="bsg-shop-search-grid">
                {searchResults.slice(0, 18).map((res) => {
                  const storages = getSelectableStorageOptions(res.product).slice(0, 4);
                  return (
                    <article
                      key={res.product.id}
                      className="bsg-shop-search-card"
                      data-testid={`shop-search-item-${res.product.slug}`}
                    >
                      <div className="bsg-shop-search-card-top">
                        <div className="bsg-shop-search-thumb">
                          {res.imageSrc ? (
                            <img src={res.imageSrc} alt={res.product.name} />
                          ) : (
                            <ShoppingBag size={24} color="#86868b" />
                          )}
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", marginBottom: 4 }}>
                            <span className="bsg-shop-ukused-badge">
                              {res.isUkUsed ? `UK Used · ${res.effectiveCondition}` : "Brand New"}
                            </span>
                            {res.screenSize && (
                              <span style={{ fontSize: 11.5, fontWeight: 600, color: "#6e6e73" }}>
                                {res.screenSize}
                              </span>
                            )}
                          </div>
                          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, lineHeight: 1.25 }}>
                            {res.product.name}
                          </h3>
                          <p style={{ margin: "3px 0 0", fontSize: 12.5, color: "#6e6e73" }}>
                            {res.familyLabel}
                            {storages.length > 0 ? ` · ${storages.join(", ")}` : ""}
                          </p>
                        </div>
                      </div>

                      <div className="bsg-shop-card-footer">
                        <div>
                          <div className="bsg-shop-price-main">{res.priceDisplay}</div>
                          <div className={`bsg-shop-stock-note ${res.canBuy ? "in-stock" : "out-stock"}`}>
                            {res.canBuy ? "In Stock in Accra" : res.product.stockStatus || "Confirm Availability"}
                          </div>
                        </div>
                        <Link to={res.buyPath} className="bsg-shop-btn-gold">
                          <ShoppingBag size={13} aria-hidden="true" />
                          <span>{res.canBuy ? "Configure" : "View Options"}</span>
                        </Link>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      )}

      {/* 4. SECTION 1: ALL BRAND NEW MODELS — PRODUCT FAMILY DISCOVERY CAROUSEL */}
      <section
        id="shop-brand-new"
        className="bsg-shop-section"
        data-testid="shop-brand-new-section"
      >
        <div className="bsg-shop-container">
          <div className="bsg-shop-section-head">
            <h2 className="bsg-shop-section-heading">
              {catConfig.modelsHeading} <span>{catConfig.modelsSubheading}</span>
            </h2>
            <div className="bsg-shop-carousel-controls">
              <button
                type="button"
                className="bsg-shop-arrow-btn"
                aria-label="Scroll product families left"
                data-testid="shop-family-prev"
                disabled={!familyScroll.canLeft}
                onClick={() => familyTrackRef.current?.scrollBy({ left: -380, behavior: "smooth" })}
              >
                <ChevronLeft size={18} />
              </button>
              <button
                type="button"
                className="bsg-shop-arrow-btn"
                aria-label="Scroll product families right"
                data-testid="shop-family-next"
                disabled={!familyScroll.canRight}
                onClick={() => familyTrackRef.current?.scrollBy({ left: 380, behavior: "smooth" })}
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>

        <div
          ref={familyTrackRef}
          className="bsg-shop-shelf-bleed"
          onScroll={() => syncTrack(familyTrackRef.current, setFamilyScroll)}
        >
          <div className="bsg-shop-shelf-track">
            {brandNewFamilies.map((fam) => {
              const isSelected = selectedFamilyId === fam.id;
              const buyUrl = `/shop/buy-${category}/${fam.primaryProduct.slug}`;
              return (
                <article
                  key={fam.id}
                  className={`bsg-shop-family-card ${isSelected ? "is-selected" : ""}`}
                  data-testid={`shop-family-card-${fam.id}`}
                >
                  <div>
                    <div className="bsg-shop-card-eyebrow">{fam.eyebrow || "BRAND NEW"}</div>
                    <h3 className="bsg-shop-card-title">{fam.title}</h3>
                    <p className="bsg-shop-card-tagline">{fam.tagline}</p>
                  </div>

                  <div>
                    <div className="bsg-shop-family-media">
                      {fam.imageSrc ? (
                        <img src={fam.imageSrc} alt={fam.imageAlt} />
                      ) : (
                        <ShoppingBag size={42} color="#a1a1a6" />
                      )}
                    </div>

                    {fam.colors.length > 0 && (
                      <div className="bsg-shop-swatches-row" aria-label={`Available finishes for ${fam.title}`}>
                        {fam.colors.map((c) => {
                          const opt = resolveColorOption(c);
                          return (
                            <span
                              key={c}
                              title={c}
                              className="bsg-shop-swatch-dot"
                              style={{ backgroundColor: opt.hex }}
                            />
                          );
                        })}
                      </div>
                    )}

                    {fam.screenSizes.length > 0 && (
                      <div className="bsg-shop-size-pills">
                        {fam.screenSizes.slice(0, 4).map((sz) => (
                          <span key={sz} className="bsg-shop-size-pill">
                            {sz}
                          </span>
                        ))}
                        {fam.products.length > 1 && (
                          <span className="bsg-shop-size-pill">
                            {fam.products.length} models
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="bsg-shop-card-footer">
                    <div>
                      <div className="bsg-shop-price-main">{fam.startingPriceText}</div>
                      <div className={`bsg-shop-stock-note ${fam.hasInStock ? "in-stock" : "out-stock"}`}>
                        {fam.hasInStock ? "In Stock · Brand New" : "Pre-Order / Confirm Stock"}
                      </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      {fam.products.length > 1 && (
                        <button
                          type="button"
                          className="bsg-shop-btn-outline"
                          data-testid={`shop-family-models-btn-${fam.id}`}
                          onClick={() => setSelectedFamilyId(isSelected ? null : fam.id)}
                        >
                          <span>{isSelected ? "Hide" : "Models"}</span>
                        </button>
                      )}
                      <Link
                        to={buyUrl}
                        className="bsg-shop-btn-gold"
                        data-testid={`shop-family-buy-${fam.id}`}
                      >
                        <ShoppingBag size={13} aria-hidden="true" />
                        <span>{fam.hasInStock ? "Buy" : "Select"}</span>
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>

        {/* Inline Family Model Selector (Step 1: Family -> Step 2: Specific Model -> Step 3: Configurator) */}
        {selectedFamily && (
          <div className="bsg-shop-container">
            <div className="bsg-shop-family-tray" data-testid={`shop-family-tray-${selectedFamily.id}`}>
              <div className="bsg-shop-tray-header">
                <div>
                  <span className="bsg-shop-ukused-badge">Step 2 · Choose Model</span>
                  <h3 style={{ margin: "6px 0 2px", fontSize: 24, fontWeight: 700 }}>
                    Choose your {selectedFamily.title} model
                  </h3>
                  <p style={{ margin: 0, fontSize: 14, color: "#6e6e73" }}>
                    Select a specific size or generation below to configure finish, specs, and live GH₵ pricing.
                  </p>
                </div>
                <button
                  type="button"
                  className="bsg-shop-btn-outline"
                  onClick={() => setSelectedFamilyId(null)}
                >
                  <X size={14} /> Close
                </button>
              </div>

              <div className="bsg-shop-tray-grid">
                {selectedFamily.products.map((prod) => {
                  const canBuy = isProductOrderable(prod) && getPublicPurchaseAction(prod) === "buy";
                  const priceText = getCardPriceDisplay(prod).current;
                  const imgSrc = resolveShopProductImageSrc(prod, activeConfig);
                  const sz = category === "watch" ? extractWatchCaseSizes(prod).join(" / ") : extractScreenSize(prod, category);
                  const chips = extractChipOptions(prod).slice(0, 2);
                  const storages = getSelectableStorageOptions(prod).slice(0, 4);

                  return (
                    <article
                      key={prod.id}
                      className="bsg-shop-model-tile"
                      data-testid={`shop-tray-model-${prod.slug}`}
                    >
                      <div className="bsg-shop-model-tile-media">
                        {imgSrc ? <img src={imgSrc} alt={prod.name} /> : <ShoppingBag size={28} color="#a1a1a6" />}
                      </div>

                      <div>
                        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 4 }}>
                          {sz && <span className="bsg-shop-size-pill" style={{ background: "#ffffff" }}>{sz}</span>}
                          {chips.map((c) => (
                            <span key={c} className="bsg-shop-size-pill" style={{ background: "#ffffff" }}>
                              {c}
                            </span>
                          ))}
                        </div>
                        <h4 style={{ margin: "4px 0 4px", fontSize: 17, fontWeight: 700 }}>{prod.name}</h4>
                        {storages.length > 0 && (
                          <p style={{ margin: 0, fontSize: 12.5, color: "#6e6e73" }}>
                            Storage: {storages.join(" · ")}
                          </p>
                        )}
                      </div>

                      <div className="bsg-shop-card-footer">
                        <div>
                          <div className="bsg-shop-price-main">{priceText}</div>
                          <div className={`bsg-shop-stock-note ${canBuy ? "in-stock" : "out-stock"}`}>
                            {canBuy ? "In Stock in Accra" : prod.stockStatus || "Confirm Availability"}
                          </div>
                        </div>
                        <Link to={`/shop/buy-${category}/${prod.slug}`} className="bsg-shop-btn-gold">
                          <ShoppingBag size={13} aria-hidden="true" />
                          <span>{canBuy ? "Configure" : "View Pricing"}</span>
                        </Link>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </section>

      {/* 5. SECTION 2: UK USED INVENTORY (PLACED IMMEDIATELY BEFORE ACCESSORIES!) */}
      {catConfig.showUkUsedSection && (
        <section
          id="shop-uk-used"
          className="bsg-shop-section"
          data-testid="shop-uk-used-section"
        >
          <div className="bsg-shop-container">
            <div className="bsg-shop-ukused-shell">
              <div className="bsg-shop-section-head">
                <div>
                  <span className="bsg-shop-ukused-badge" style={{ marginBottom: 8 }}>
                    <ShieldCheck size={13} aria-hidden="true" /> Verified Pre-Owned · Accra Inspected
                  </span>
                  <h2 className="bsg-shop-section-heading">
                    {catConfig.ukUsedHeading} <span>{catConfig.ukUsedSubheading}</span>
                  </h2>
                </div>
                <span style={{ fontSize: 13.5, fontWeight: 600, color: "#6e6e73" }}>
                  {filteredUkUsedDevices.length} {filteredUkUsedDevices.length === 1 ? "model" : "models"} listed
                </span>
              </div>

              {ukUsedFilterTabs.length > 1 && (
                <div className="bsg-shop-ukused-filters" role="tablist" aria-label={`Filter UK Used ${categoryShortName}`}>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={ukUsedGenFilter === "all"}
                    className={`bsg-shop-chip ${ukUsedGenFilter === "all" ? "is-active" : ""}`}
                    onClick={() => setUkUsedGenFilter("all")}
                  >
                    All UK Used ({ukUsedDevices.length})
                  </button>
                  {ukUsedFilterTabs.map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      role="tab"
                      aria-selected={ukUsedGenFilter === tab.id}
                      className={`bsg-shop-chip ${ukUsedGenFilter === tab.id ? "is-active" : ""}`}
                      data-testid={`shop-ukused-filter-${tab.id}`}
                      onClick={() => setUkUsedGenFilter(tab.id)}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              )}

              {filteredUkUsedDevices.length === 0 ? (
                <div style={{ textAlign: "center", padding: "32px 16px" }}>
                  <p style={{ margin: "0 0 8px", fontSize: 17, fontWeight: 700 }}>
                    No UK Used {categoryShortName} units currently listed.
                  </p>
                  <p style={{ margin: "0 0 16px", fontSize: 14, color: "#6e6e73" }}>
                    We never list invented used stock. Ask our Dome Pillar 2 team to source a verified unit for you.
                  </p>
                  <Link to="/pre-order" className="bsg-shop-btn-gold">
                    Request a UK Used {categoryShortName}
                  </Link>
                </div>
              ) : (
                <div className="bsg-shop-ukused-grid">
                  {filteredUkUsedDevices.map((prod) => {
                    const imgSrc = resolveShopProductImageSrc(prod, activeConfig);
                    const cond = getEffectiveCondition(prod);
                    const canBuy = isProductOrderable(prod) && getPublicPurchaseAction(prod) === "buy";
                    const priceText = getCardPriceDisplay(prod).current;
                    const storages = getSelectableStorageOptions(prod).slice(0, 4);
                    const screenSz =
                      category === "watch"
                        ? extractWatchCaseSizes(prod).join(" / ")
                        : extractScreenSize(prod, category);
                    const override =
                      activeConfig.ukUsedOverrides?.[prod.id] || activeConfig.ukUsedOverrides?.[prod.slug];

                    return (
                      <article
                        key={prod.id}
                        className="bsg-shop-ukused-card"
                        data-testid={`shop-ukused-card-${prod.slug}`}
                      >
                        <div>
                          <div className="bsg-shop-ukused-img">
                            {imgSrc ? (
                              <img src={imgSrc} alt={`${prod.name} (${cond})`} />
                            ) : (
                              <Smartphone size={32} color="#a1a1a6" />
                            )}
                          </div>

                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6, marginTop: 12, marginBottom: 6 }}>
                            <span className="bsg-shop-ukused-badge">{cond}</span>
                            {screenSz && (
                              <span style={{ fontSize: 11.5, fontWeight: 600, color: "#6e6e73" }}>{screenSz}</span>
                            )}
                          </div>

                          <h3 style={{ margin: "0 0 4px", fontSize: 17, fontWeight: 700, lineHeight: 1.25 }}>
                            {prod.name}
                          </h3>

                          {storages.length > 0 && (
                            <p style={{ margin: 0, fontSize: 12.5, color: "#6e6e73" }}>
                              {storages.join(" · ")}
                            </p>
                          )}

                          {(override?.batteryHealthNote || prod.batteryHealth) && (
                            <p style={{ margin: "4px 0 0", fontSize: 12, color: "#15803d", fontWeight: 600 }}>
                              {override?.batteryHealthNote || `Battery: ${prod.batteryHealth}`}
                            </p>
                          )}
                        </div>

                        <div className="bsg-shop-card-footer">
                          <div>
                            <div className="bsg-shop-price-main">{priceText}</div>
                            <div className={`bsg-shop-stock-note ${canBuy ? "in-stock" : "out-stock"}`}>
                              {canBuy ? `In Stock (${prod.stockQuantity})` : prod.stockStatus || "Out of Stock"}
                            </div>
                          </div>
                          <Link
                            to={`/shop/buy-${category}/${prod.slug}`}
                            className="bsg-shop-btn-gold"
                            data-testid={`shop-ukused-buy-${prod.slug}`}
                          >
                            <ShoppingBag size={13} aria-hidden="true" />
                            <span>{canBuy ? "Configure" : "View"}</span>
                          </Link>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* 6. SECTION 3: CATEGORY ACCESSORIES SHELF */}
      {catConfig.showAccessoriesSection && (
        <section
          id="shop-accessories"
          className="bsg-shop-section"
          data-testid="shop-accessories-section"
        >
          <div className="bsg-shop-container">
            <div className="bsg-shop-section-head">
              <h2 className="bsg-shop-section-heading">
                {catConfig.accessoriesHeading} <span>{catConfig.accessoriesSubheading}</span>
              </h2>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <Link to="/accessories" className="bsg-shop-link-gold">
                  <span>All Accessories</span>
                  <ChevronRight size={15} aria-hidden="true" />
                </Link>
                <div className="bsg-shop-carousel-controls">
                  <button
                    type="button"
                    className="bsg-shop-arrow-btn"
                    aria-label="Scroll accessories left"
                    disabled={!accScroll.canLeft}
                    onClick={() => accTrackRef.current?.scrollBy({ left: -310, behavior: "smooth" })}
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    type="button"
                    className="bsg-shop-arrow-btn"
                    aria-label="Scroll accessories right"
                    disabled={!accScroll.canRight}
                    onClick={() => accTrackRef.current?.scrollBy({ left: 310, behavior: "smooth" })}
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div
            ref={accTrackRef}
            className="bsg-shop-shelf-bleed"
            onScroll={() => syncTrack(accTrackRef.current, setAccScroll)}
          >
            <div className="bsg-shop-shelf-track">
              <article className="bsg-shop-acc-editorial-card">
                <img src={catConfig.accessoriesEditorialImage} alt={catConfig.accessoriesEditorialTitle} />
                <div className="bsg-shop-acc-editorial-scrim" />
                <div className="bsg-shop-acc-editorial-inner">
                  <div>
                    <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#d8a72d" }}>
                      BUY &amp; SELL GH GENUINE ACCESSORIES
                    </span>
                    <h3 style={{ margin: "8px 0 8px", fontSize: 28, lineHeight: 1.12, fontWeight: 700 }}>
                      {catConfig.accessoriesEditorialTitle}
                    </h3>
                    <p style={{ margin: 0, fontSize: 14, lineHeight: 1.5, opacity: 0.92 }}>
                      {catConfig.accessoriesEditorialDesc}
                    </p>
                  </div>
                  <div>
                    <Link to="/shop/buy-accessories" className="bsg-shop-btn-gold">
                      <ShoppingBag size={14} aria-hidden="true" />
                      <span>Browse All Accessories</span>
                    </Link>
                  </div>
                </div>
              </article>

              {categoryAccessories.map((acc) => {
                const imgSrc = resolveShopProductImageSrc(acc, activeConfig);
                const canBuy = isProductOrderable(acc) && getPublicPurchaseAction(acc) === "buy";
                const priceText = getCardPriceDisplay(acc).current;

                return (
                  <article
                    key={acc.id}
                    className="bsg-shop-acc-card"
                    data-testid={`shop-acc-card-${acc.slug}`}
                  >
                    <div>
                      <div className="bsg-shop-acc-img">
                        {imgSrc ? <img src={imgSrc} alt={acc.name} /> : <ShoppingBag size={32} color="#a1a1a6" />}
                      </div>
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          color: canBuy ? "#15803d" : "#bf4800",
                          textTransform: "uppercase",
                        }}
                      >
                        {canBuy ? "In Stock" : acc.stockStatus || "Confirm Stock"}
                      </span>
                      <h3 style={{ margin: "4px 0 0", fontSize: 16.5, fontWeight: 700, lineHeight: 1.3 }}>
                        {acc.name}
                      </h3>
                    </div>

                    <div className="bsg-shop-card-footer">
                      <span className="bsg-shop-price-main">{priceText}</span>
                      <Link to={getProductShopBuyPath(acc)} className="bsg-shop-btn-gold">
                        <ShoppingBag size={13} aria-hidden="true" />
                        <span>{canBuy ? "Buy" : "View"}</span>
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* 7. SECTION 4: WAYS TO BUY (GHANAIAN STORE PROGRAMS) */}
      {catConfig.showWaysToBuySection && (
        <section id="shop-ways-to-buy" className="bsg-shop-section" data-testid="shop-ways-to-buy">
          <div className="bsg-shop-container">
            <div className="bsg-shop-section-head">
              <h2 className="bsg-shop-section-heading">
                Ways to buy. <span>Find what works for you in Accra.</span>
              </h2>
            </div>

            <div className="bsg-shop-ways-grid">
              {catConfig.waysToBuyCards.map((card) => (
                <article key={card.id} className={`bsg-shop-way-card tone-${card.tone}`}>
                  <div>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        letterSpacing: "0.05em",
                        color: card.tone === "dark" ? "#d8a72d" : "#9a6f08",
                      }}
                    >
                      {card.eyebrow}
                    </span>
                    <h3 style={{ margin: "8px 0 8px", fontSize: 22, lineHeight: 1.18, fontWeight: 700 }}>
                      {card.title}
                    </h3>
                    <p style={{ margin: 0, fontSize: 14.5, lineHeight: 1.5, opacity: card.tone === "dark" ? 0.85 : 0.78 }}>
                      {card.description}
                    </p>
                  </div>
                  <div>
                    <Link to={card.ctaTo} className="bsg-shop-btn-gold">
                      <span>{card.ctaLabel}</span>
                      <ChevronRight size={14} aria-hidden="true" />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 8. SECTION 5: ONLY AT BUY & SELL GH */}
      {catConfig.showOnlyAtSection && (
        <section id="shop-only-at-bsg" className="bsg-shop-section" data-testid="shop-only-at-bsg">
          <div className="bsg-shop-container">
            <div className="bsg-shop-section-head">
              <h2 className="bsg-shop-section-heading">
                Only at Buy &amp; Sell GH. <span>The total package.</span>
              </h2>
            </div>

            <div className="bsg-shop-perks-grid">
              <article className="bsg-shop-perk-card">
                <span className="bsg-shop-perk-icon" aria-hidden="true"><Store size={20} /></span>
                <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700 }}>Free Dome Pillar 2 Pickup</h3>
                <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.5, color: "#6e6e73" }}>
                  Visit our showroom near No Visa to unbox, test Face ID, sensors, and serial numbers before paying.
                </p>
              </article>

              <article className="bsg-shop-perk-card">
                <span className="bsg-shop-perk-icon" aria-hidden="true"><Truck size={20} /></span>
                <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700 }}>Same-Day Accra Delivery</h3>
                <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.5, color: "#6e6e73" }}>
                  Swift rider delivery across Greater Accra and tracked nationwide dispatch across Ghana.
                </p>
              </article>

              <article className="bsg-shop-perk-card">
                <span className="bsg-shop-perk-icon" aria-hidden="true"><CheckCircle2 size={20} /></span>
                <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700 }}>Ghanaian Payment Options</h3>
                <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.5, color: "#6e6e73" }}>
                  Pay cleanly via Mobile Money on confirmation, Payment on Pickup, or Pay on Delivery in Accra.
                </p>
              </article>

              <article className="bsg-shop-perk-card">
                <span className="bsg-shop-perk-icon" aria-hidden="true"><Sparkles size={20} /></span>
                <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700 }}>Personal Setup &amp; Transfer</h3>
                <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.5, color: "#6e6e73" }}>
                  Our team helps migrate your WhatsApp, iCloud, and files onto your new Apple device for free.
                </p>
              </article>
            </div>

            <div className="bsg-shop-footnotes">
              <p style={{ margin: "0 0 6px" }}>
                * Prices shown in Ghana Cedis (GH₵) reflect live Buy &amp; Sell GH inventory and may vary by storage capacity, chip, memory, finish, and Brand New vs. UK Used condition.
              </p>
              <p style={{ margin: 0 }}>
                All iPhone models from the iPhone 15 Pro generation downwards are managed and presented under UK Used inventory with physical hardware verification at Buy &amp; Sell GH, Dome Pillar 2, Accra.
              </p>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
