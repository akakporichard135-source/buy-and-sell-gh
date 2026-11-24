import { ChevronDown, ChevronLeft, ChevronRight, Plus, ShoppingBag, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useCms } from "../../../cms/CmsContext";
import { defaultMacPageConfig } from "../../../cms/macPageDefaults";
import type {
  MacBenefitCard,
  MacChapterNavItem,
  MacLineupCard,
  MacPageConfig,
  MacPageSection,
  MacPromoSplitCard,
} from "../../../cms/types";
import { useProductCatalog } from "../../../catalog/ProductCatalogContext";
import { familyMatchesProduct } from "../../../catalog/productExperience";
import { getPublicPurchaseAction } from "../../../catalog/productPurchaseAction";
import type { Product } from "../../../types/product";
import { localCatalogueImageBySlug } from "../../../utils/catalogueProductImages";
import { resolveCatalogueProductImage, resolveProductImage } from "../../../utils/productImages";
import { compareMacbooksNewest } from "../../../utils/productPresentation";
import { getCardPriceDisplay } from "../../../utils/productPricing";
import { whatsappUrl } from "../../../utils/whatsapp";
import { MacFinderModal } from "./MacFinderModal";
import "../../../styles/mac-page.css";

interface MacPageRendererProps {
  configOverride?: MacPageConfig;
  productsOverride?: Product[];
  previewDevice?: "desktop" | "mobile";
}

function getSafeProductImg(product: Product, fallback = "/products/mac-redesign/lineup-macbook-air-13.webp"): string {
  const localExact = localCatalogueImageBySlug[product.slug] || localCatalogueImageBySlug[product.id];
  // For Mac accessories with previously mis-uploaded DB images (e.g. Magic Trackpad), prefer verified clean local asset
  if (product.slug === "apple-magic-trackpad" && localExact) {
    return localExact;
  }
  const resolved = resolveCatalogueProductImage(product) || resolveProductImage(product);
  if (resolved?.src) return resolved.src;
  if (localExact) return localExact;
  return fallback;
}

function SmartLink({
  to,
  isExternal,
  className,
  children,
  onClick,
  ariaLabel,
  dataTestId,
}: {
  to: string;
  isExternal?: boolean;
  className?: string;
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent) => void;
  ariaLabel?: string;
  dataTestId?: string;
}) {
  const cleanTo = (to || "/mac").trim();
  const external = isExternal || /^https?:\/\//i.test(cleanTo);
  if (external) {
    return (
      <a
        href={cleanTo}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
        aria-label={ariaLabel}
        data-testid={dataTestId}
        onClick={onClick}
      >
        {children}
      </a>
    );
  }
  if (cleanTo.startsWith("#")) {
    return (
      <a
        href={cleanTo}
        className={className}
        aria-label={ariaLabel}
        data-testid={dataTestId}
        onClick={(e) => {
          e.preventDefault();
          if (onClick) onClick(e);
          const el = document.getElementById(cleanTo.slice(1));
          if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
        }}
      >
        {children}
      </a>
    );
  }
  return (
    <Link
      to={cleanTo}
      className={className}
      aria-label={ariaLabel}
      data-testid={dataTestId}
      onClick={onClick}
    >
      {children}
    </Link>
  );
}

function useHorizontalCarousel(deps: unknown[] = []) {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const syncScrollState = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const maxScroll = Math.max(0, el.scrollWidth - el.clientWidth);
    setCanPrev(el.scrollLeft > 4);
    setCanNext(el.scrollLeft < maxScroll - 4);
  }, []);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    syncScrollState();
    const raf = requestAnimationFrame(syncScrollState);
    const onScroll = () => syncScrollState();
    const onResize = () => syncScrollState();
    el.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [syncScrollState, ...deps]);

  const scrollByStep = (dir: -1 | 1) => {
    const el = trackRef.current;
    if (!el) return;
    const amount = Math.max(280, Math.round(el.clientWidth * 0.72));
    el.scrollBy({ left: dir * amount, behavior: "smooth" });
  };

  return { trackRef, canPrev, canNext, scrollByStep, syncScrollState };
}

export function MacPageRenderer({
  configOverride,
  productsOverride,
  previewDevice,
}: MacPageRendererProps) {
  const { macPage } = useCms();
  const { activeProducts } = useProductCatalog();

  const config: MacPageConfig = configOverride || macPage || defaultMacPageConfig;
  const allProducts = productsOverride || activeProducts;

  // All live Mac products sorted newest first
  const macCatalogProducts = useMemo(() => {
    return allProducts
      .filter((p) => familyMatchesProduct(p, "mac"))
      .sort(compareMacbooksNewest);
  }, [allProducts]);

  // Fast slug/id lookup across all active products (Mac + Accessories)
  const productBySlug = useMemo(() => {
    const map = new Map<string, Product>();
    for (const p of allProducts) {
      if (p.slug) map.set(p.slug.toLowerCase(), p);
      if (p.id) map.set(p.id.toLowerCase(), p);
    }
    return map;
  }, [allProducts]);

  // Interactive states
  const [activeLineupTab, setActiveLineupTab] = useState<string>("all");
  const [activeEcoId, setActiveEcoId] = useState<string>(
    () => config.ecosystemSection.items.find((i) => i.visible !== false)?.id || "eco-mac-iphone"
  );
  const [activeBenefitModal, setActiveBenefitModal] = useState<MacBenefitCard | null>(null);
  const [finderOpen, setFinderOpen] = useState(false);

  // Visible sorted lists
  const visibleSections = useMemo(
    () =>
      [...(config.sections || defaultMacPageConfig.sections)]
        .filter((s) => s.visible !== false)
        .sort((a, b) => a.order - b.order),
    [config.sections]
  );

  const visibleChapterNav = useMemo(
    () =>
      [...(config.chapterNavItems || [])]
        .filter((i) => i.visible !== false)
        .sort((a, b) => a.order - b.order),
    [config.chapterNavItems]
  );

  const filteredLineupCards = useMemo(() => {
    const cards = [...(config.lineupSection.cards || [])]
      .filter((c) => c.visible !== false)
      .sort((a, b) => a.order - b.order);
    if (activeLineupTab === "all") return cards;
    return cards.filter((c) => c.category === activeLineupTab);
  }, [config.lineupSection.cards, activeLineupTab]);

  const visibleWhyCards = useMemo(
    () =>
      [...(config.whyShopSection.cards || [])]
        .filter((c) => c.visible !== false)
        .sort((a, b) => a.order - b.order),
    [config.whyShopSection.cards]
  );

  const visibleSwitchCards = useMemo(
    () =>
      [...(config.switchToMacSection.cards || [])]
        .filter((c) => c.visible !== false)
        .sort((a, b) => a.order - b.order),
    [config.switchToMacSection.cards]
  );

  const visibleEssentialCards = useMemo(
    () =>
      [...(config.macEssentialsSection.cards || [])]
        .filter((c) => c.visible !== false)
        .sort((a, b) => a.order - b.order),
    [config.macEssentialsSection.cards]
  );

  const visibleEcoItems = useMemo(
    () =>
      [...(config.ecosystemSection.items || [])]
        .filter((i) => i.visible !== false)
        .sort((a, b) => a.order - b.order),
    [config.ecosystemSection.items]
  );

  const activeEcoItem = useMemo(
    () => visibleEcoItems.find((i) => i.id === activeEcoId) || visibleEcoItems[0] || null,
    [visibleEcoItems, activeEcoId]
  );

  // Carousel controllers
  const chapterCarousel = useHorizontalCarousel([visibleChapterNav.length, previewDevice]);
  const lineupCarousel = useHorizontalCarousel([activeLineupTab, filteredLineupCards.length, previewDevice]);
  const whyCarousel = useHorizontalCarousel([visibleWhyCards.length, previewDevice]);
  const switchCarousel = useHorizontalCarousel([visibleSwitchCards.length, previewDevice]);
  const essentialsCarousel = useHorizontalCarousel([visibleEssentialCards.length, previewDevice]);

  // Reset lineup scroll cleanly on tab switch
  useEffect(() => {
    if (lineupCarousel.trackRef.current) {
      lineupCarousel.trackRef.current.scrollTo({ left: 0, behavior: "smooth" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeLineupTab]);

  // Close modals on Escape
  useEffect(() => {
    if (!activeBenefitModal && !finderOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setActiveBenefitModal(null);
        setFinderOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activeBenefitModal, finderOpen]);

  const handleChapterItemClick = (item: MacChapterNavItem, e: React.MouseEvent) => {
    if (item.filterTab) {
      setActiveLineupTab(item.filterTab);
    }
    if (item.scrollTarget) {
      e.preventDefault();
      const target = document.getElementById(item.scrollTarget);
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  };

  const renderLineupCard = (card: MacLineupCard) => {
    const liveProduct = card.productSlug ? productBySlug.get(card.productSlug.toLowerCase()) : undefined;
    const livePrice = liveProduct ? getCardPriceDisplay(liveProduct).current : card.fallbackPriceText || "Price on Enquiry";
    const action = liveProduct ? getPublicPurchaseAction(liveProduct) : "buy";
    const buyText =
      liveProduct && action === "enquire"
        ? "Enquire"
        : liveProduct && action === "view-pricing"
        ? "View Pricing"
        : card.buyLabel || "Buy";
    const buyDest =
      liveProduct && action === "enquire"
        ? whatsappUrl(`Hello Buy & Sell GH, I would like to enquire about ${liveProduct.name}.`)
        : liveProduct && liveProduct.category === "Accessories"
        ? `/shop/buy-accessory/${liveProduct.slug}`
        : liveProduct
        ? `/shop/buy-mac/${liveProduct.slug}`
        : card.buyTo;

    // Resolve crisp individual studio product imagery for accessories cards unless a custom Admin image was uploaded
    const isDefaultAccessoryCollage =
      card.image === "/products/mac-redesign/essentials-mac-accessories.webp" ||
      card.image === "/products/mac-redesign/nav-accessories.webp";
    const resolvedAccessoryImg =
      card.category === "accessories" && isDefaultAccessoryCollage && card.productSlug
        ? localCatalogueImageBySlug[card.productSlug] ||
          (liveProduct ? getSafeProductImg(liveProduct, card.image) : card.image)
        : card.image;
    const cardImageSrc = resolvedAccessoryImg || card.image;

    return (
      <article
        key={card.id}
        className="mac-lineup-card"
        data-testid={`mac-lineup-card-${card.id}`}
      >
        <div className="mac-lineup-card-surface">
          <SmartLink
            to={buyDest}
            className="mac-lineup-media"
            ariaLabel={`${card.title} — ${buyText}`}
          >
            <img
              src={cardImageSrc}
              alt={card.alt || card.title}
              className="mac-lineup-img"
              loading="eager"
              decoding="async"
              onError={(e) => {
                const img = e.currentTarget;
                if (img.dataset.fallbackApplied) return;
                img.dataset.fallbackApplied = "1";
                img.src = "/products/mac-redesign/lineup-macbook-air-13.webp";
              }}
            />
          </SmartLink>

          <div className="mac-swatch-row" aria-label={card.swatches?.length ? `${card.title} available finishes` : undefined}>
            {(card.swatches || []).map((sw) => (
              <span
                key={`${card.id}-${sw.label}`}
                className="mac-swatch-dot"
                style={{ backgroundColor: sw.hex }}
                title={sw.label}
              />
            ))}
          </div>

          <div className="mac-lineup-badge">{card.badge || "\u00A0"}</div>
          <h3 className="mac-lineup-title">{card.title}</h3>
          {card.chipLine && <div className="mac-lineup-chip">{card.chipLine}</div>}
          <p className="mac-lineup-desc">{card.description}</p>

          <div className="mac-lineup-price-block">
            <div className="mac-lineup-price">{livePrice}</div>
            {card.priceNote && <div className="mac-lineup-price-note">{card.priceNote}</div>}
          </div>

          <div className="mac-lineup-actions">
            <SmartLink
              to={buyDest}
              className="mac-btn-gold-pill"
              dataTestId={`mac-buy-btn-${card.id}`}
            >
              <ShoppingBag size={15} strokeWidth={2.2} className="mac-btn-bag-icon" aria-hidden="true" />
              <span>{buyText}</span>
            </SmartLink>
            {card.learnMoreTo && (
              <SmartLink to={card.learnMoreTo} className="mac-link-action">
                <span>{card.learnMoreLabel || "Learn more"}</span>
                <ChevronRight size={15} strokeWidth={2.2} aria-hidden="true" />
              </SmartLink>
            )}
          </div>
        </div>
      </article>
    );
  };

  const renderSplitCardsSection = (
    sectionId: string,
    heading: string,
    cards: MacPromoSplitCard[],
    carousel: ReturnType<typeof useHorizontalCarousel>,
    tightBottom = false
  ) => (
    <section
      id={sectionId}
      className={tightBottom ? "mac-band-gray-tight-bottom" : "mac-band-gray"}
      aria-labelledby={`${sectionId}-title`}
      data-testid={`mac-section-${sectionId}`}
    >
      <div className="mac-container">
        <div className="mac-section-header">
          <h2 id={`${sectionId}-title`} className="mac-section-heading">
            {heading}
          </h2>
        </div>

        <div className="mac-split-carousel-wrap" ref={carousel.trackRef}>
          <div className="mac-split-grid-track">
            {cards.map((card) => (
              <article key={card.id} className="mac-split-card">
                <h3 className="mac-split-card-title">{card.title}</h3>
                <p className="mac-split-card-desc">{card.description}</p>
                <div className="mac-split-card-links">
                  <SmartLink
                    to={card.linkTo}
                    isExternal={card.isExternal}
                    className="mac-link-action"
                  >
                    <span>{card.linkLabel}</span>
                    <ChevronRight size={15} strokeWidth={2.2} aria-hidden="true" />
                  </SmartLink>
                  {card.secondaryLinkLabel && card.secondaryLinkTo && (
                    <SmartLink to={card.secondaryLinkTo} className="mac-link-action">
                      <span>{card.secondaryLinkLabel}</span>
                      <ChevronRight size={15} strokeWidth={2.2} aria-hidden="true" />
                    </SmartLink>
                  )}
                </div>
                <div className="mac-split-card-media">
                  <img
                    src={card.image}
                    alt={card.alt || card.title}
                    className="mac-split-card-img"
                    loading="eager"
                    decoding="async"
                  />
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="mac-split-mobile-paddles" aria-label={`${heading} carousel controls`}>
          <button
            type="button"
            className="mac-paddle-btn"
            disabled={!carousel.canPrev}
            onClick={() => carousel.scrollByStep(-1)}
            aria-label={`Previous ${heading} card`}
          >
            <ChevronLeft size={18} />
          </button>
          <button
            type="button"
            className="mac-paddle-btn"
            disabled={!carousel.canNext}
            onClick={() => carousel.scrollByStep(1)}
            aria-label={`Next ${heading} card`}
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </section>
  );

  const renderCustomSection = (sec: MacPageSection) => {
    const bg = sec.backgroundColor || "#ffffff";
    const isDark = bg === "#101012" || bg === "#1d1d1f" || bg === "#000000";
    const linkedProducts = (sec.productIds || [])
      .map((id) => allProducts.find((p) => p.id === id || p.slug === id))
      .filter((p): p is Product => Boolean(p));

    return (
      <section
        key={sec.id}
        className="mac-custom-section"
        style={{ backgroundColor: bg, color: isDark ? "#f5f5f7" : "#1d1d1f" }}
        data-testid={`mac-custom-section-${sec.id}`}
      >
        <div className="mac-container">
          {linkedProducts.length > 0 ? (
            <>
              <div className="mac-section-header">
                <div>
                  {sec.eyebrow && (
                    <div className="text-xs font-semibold uppercase tracking-wider text-[#bf4800] mb-2">
                      {sec.eyebrow}
                    </div>
                  )}
                  <h2 className="mac-section-heading" style={{ color: isDark ? "#ffffff" : "#1d1d1f" }}>
                    {sec.heading}
                  </h2>
                  {sec.subtitle && (
                    <p className="mt-2 text-base" style={{ color: isDark ? "#a1a1a6" : "#6e6e73" }}>
                      {sec.subtitle}
                    </p>
                  )}
                </div>
                {sec.buttonLabel && sec.buttonDestination && (
                  <SmartLink to={sec.buttonDestination} className="mac-section-link">
                    <span>{sec.buttonLabel}</span>
                    <ChevronRight size={16} />
                  </SmartLink>
                )}
              </div>
              <div className="mac-catalog-grid">
                {linkedProducts.map((prod) => {
                  const price = getCardPriceDisplay(prod);
                  const action = getPublicPurchaseAction(prod);
                  const buyPath =
                    prod.category === "Accessories"
                      ? `/shop/buy-accessory/${prod.slug}`
                      : `/shop/buy-mac/${prod.slug}`;
                  return (
                    <article key={prod.id} className="mac-catalog-card">
                      <div className="mac-catalog-media">
                        <img
                          src={getSafeProductImg(prod)}
                          alt={prod.name}
                          className="mac-catalog-img"
                          loading="lazy"
                        />
                      </div>
                      <h3 className="mac-catalog-title">{prod.name}</h3>
                      <div className="mac-catalog-footer">
                        <span className="mac-catalog-price">{price.current}</span>
                        <Link to={buyPath} className="mac-catalog-cta">
                          <ShoppingBag size={13} strokeWidth={2.2} aria-hidden="true" />
                          <span>{action === "buy" ? "Buy" : "View Pricing"}</span>
                        </Link>
                      </div>
                    </article>
                  );
                })}
              </div>
            </>
          ) : (
            <div
              className="mac-custom-banner"
              style={{ backgroundColor: isDark ? "#1c1c1e" : "#f5f5f7" }}
            >
              <div>
                {sec.eyebrow && (
                  <div className="text-xs font-semibold uppercase tracking-wider text-[#bf4800] mb-2">
                    {sec.eyebrow}
                  </div>
                )}
                <h2 className="mac-section-heading" style={{ color: isDark ? "#ffffff" : "#1d1d1f" }}>
                  {sec.heading}
                </h2>
                {sec.subtitle && (
                  <p className="mt-3 text-lg font-medium" style={{ color: isDark ? "#e5e5ea" : "#1d1d1f" }}>
                    {sec.subtitle}
                  </p>
                )}
                {sec.description && (
                  <p className="mt-2 text-sm leading-relaxed" style={{ color: isDark ? "#a1a1a6" : "#6e6e73" }}>
                    {sec.description}
                  </p>
                )}
                <div className="mt-6 flex flex-wrap items-center gap-4">
                  {sec.buttonLabel && sec.buttonDestination && (
                    <SmartLink to={sec.buttonDestination} className="mac-btn-gold-pill">
                      {sec.buttonLabel}
                    </SmartLink>
                  )}
                  {sec.secondaryButtonLabel && sec.secondaryButtonDestination && (
                    <SmartLink to={sec.secondaryButtonDestination} className="mac-link-action">
                      <span>{sec.secondaryButtonLabel}</span>
                      <ChevronRight size={15} />
                    </SmartLink>
                  )}
                </div>
              </div>
              {(sec.desktopImage || sec.mobileImage) && (
                <div className="flex items-center justify-center">
                  <img
                    src={
                      previewDevice === "mobile"
                        ? sec.mobileImage || sec.desktopImage
                        : sec.desktopImage || sec.mobileImage
                    }
                    alt={sec.imageAlt || sec.heading}
                    className="max-h-80 w-auto max-w-full object-contain rounded-2xl"
                    loading="lazy"
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    );
  };

  const renderSection = (sec: MacPageSection) => {
    switch (sec.builtInKey) {
      case "promo-ribbon": {
        if (!config.promoRibbon?.enabled) return null;
        return (
          <div key={sec.id} className="mac-promo-ribbon" data-testid="mac-promo-ribbon">
            <div className="mac-promo-ribbon-inner">
              <span>{config.promoRibbon.text}</span>
              {config.promoRibbon.linkLabel && (
                <SmartLink to={config.promoRibbon.linkTo} className="mac-promo-ribbon-link">
                  {config.promoRibbon.linkLabel} ›
                </SmartLink>
              )}
            </div>
          </div>
        );
      }

      case "hero-chapter-nav": {
        return (
          <section key={sec.id} className="mac-hero-section" data-testid="mac-hero-section">
            <div className="mac-container">
              <h1 className="mac-hero-heading">
                {config.hero.heading || "Mac"}
                {config.hero.showGoldPeriod ? <span className="mac-hero-gold-dot">.</span> : null}
              </h1>

              <nav className="mac-chapter-nav-wrap" aria-label="Mac family of products">
                <button
                  type="button"
                  className="mac-chapter-paddle is-left"
                  disabled={!chapterCarousel.canPrev}
                  onClick={() => chapterCarousel.scrollByStep(-1)}
                  aria-label="Scroll Mac navigation left"
                >
                  <ChevronLeft size={20} />
                </button>

                <div className="mac-chapter-nav-track" ref={chapterCarousel.trackRef}>
                  {visibleChapterNav.map((item) => (
                    <SmartLink
                      key={item.id}
                      to={item.to}
                      className="mac-chapter-item"
                      dataTestId={`mac-chapter-${item.id}`}
                      onClick={(e) => handleChapterItemClick(item, e)}
                    >
                      <span className="mac-chapter-img-box">
                        <img
                          src={item.image}
                          alt={item.alt || item.label}
                          className="mac-chapter-img"
                          loading="eager"
                          decoding="async"
                        />
                      </span>
                      <span className="mac-chapter-label">{item.label}</span>
                      {item.badge && <span className="mac-chapter-badge">{item.badge}</span>}
                    </SmartLink>
                  ))}
                </div>

                <button
                  type="button"
                  className="mac-chapter-paddle is-right"
                  disabled={!chapterCarousel.canNext}
                  onClick={() => chapterCarousel.scrollByStep(1)}
                  aria-label="Scroll Mac navigation right"
                >
                  <ChevronRight size={20} />
                </button>
              </nav>
            </div>
          </section>
        );
      }

      case "explore-lineup": {
        return (
          <section
            key={sec.id}
            id="explore-lineup"
            className="mac-band-gray-tight-bottom"
            aria-labelledby="mac-explore-lineup-title"
            data-testid="mac-explore-lineup"
          >
            <div className="mac-container">
              <div className="mac-section-header">
                <h2 id="mac-explore-lineup-title" className="mac-section-heading">
                  {config.lineupSection.heading}
                </h2>
                <SmartLink
                  to="/shop/buy-mac"
                  className="mac-section-link"
                  dataTestId="mac-shop-all-link"
                >
                  <ShoppingBag
                    size={16}
                    strokeWidth={2.2}
                    className="mac-gold-bag-icon"
                    aria-hidden="true"
                  />
                  <span>Shop all Mac</span>
                  <ChevronRight size={16} strokeWidth={2.2} aria-hidden="true" />
                </SmartLink>
              </div>

              <div className="mac-lineup-tabs-wrap">
                <div className="mac-lineup-tabs" role="tablist" aria-label="Filter Mac lineup">
                  {config.lineupSection.tabs.map((tab) => {
                    const isActive = activeLineupTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        role="tab"
                        aria-selected={isActive}
                        data-testid={`mac-lineup-tab-${tab.id}`}
                        className={`mac-lineup-tab ${isActive ? "is-active" : ""}`}
                        onClick={() => setActiveLineupTab(tab.id)}
                      >
                        {tab.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="mac-carousel-bleed" ref={lineupCarousel.trackRef}>
              <div className="mac-lineup-track">
                {filteredLineupCards.map(renderLineupCard)}
              </div>
            </div>

            {(lineupCarousel.canPrev || lineupCarousel.canNext) && (
              <div className="mac-container">
                <div className="mac-carousel-paddles-row" aria-label="Explore the lineup carousel controls">
                  <button
                    type="button"
                    className="mac-paddle-btn"
                    data-testid="mac-lineup-prev"
                    disabled={!lineupCarousel.canPrev}
                    onClick={() => lineupCarousel.scrollByStep(-1)}
                    aria-label="Previous Mac lineup card"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    type="button"
                    className="mac-paddle-btn"
                    data-testid="mac-lineup-next"
                    disabled={!lineupCarousel.canNext}
                    onClick={() => lineupCarousel.scrollByStep(1)}
                    aria-label="Next Mac lineup card"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            )}
          </section>
        );
      }

      case "why-shop-mac": {
        return (
          <section
            key={sec.id}
            id="why-shop-mac"
            className="mac-band-gray"
            aria-labelledby="mac-why-shop-title"
            data-testid="mac-why-shop"
          >
            <div className="mac-container">
              <div className="mac-section-header">
                <h2 id="mac-why-shop-title" className="mac-section-heading">
                  {config.whyShopSection.heading}
                </h2>
                {config.whyShopSection.actionLabel && (
                  <SmartLink to={config.whyShopSection.actionTo} className="mac-section-link">
                    <ShoppingBag
                      size={16}
                      strokeWidth={2.2}
                      className="mac-gold-bag-icon"
                      aria-hidden="true"
                    />
                    <span>{config.whyShopSection.actionLabel}</span>
                    <ChevronRight size={16} strokeWidth={2.2} aria-hidden="true" />
                  </SmartLink>
                )}
              </div>
            </div>

            <div className="mac-carousel-bleed" ref={whyCarousel.trackRef}>
              <div className="mac-why-track">
                {visibleWhyCards.map((card) => (
                  <article key={card.id} className="mac-why-card" data-testid={`mac-why-card-${card.id}`}>
                    <div>
                      <div className="mac-why-eyebrow">{card.eyebrow}</div>
                      <h3 className="mac-why-title">{card.title}</h3>
                      <p className="mac-why-desc">{card.description}</p>
                    </div>
                    <div className="mac-why-media">
                      <img
                        src={card.image}
                        alt={card.alt || card.title}
                        className="mac-why-img"
                        loading="eager"
                        decoding="async"
                      />
                    </div>
                    {card.actionStyle === "link" ? (
                      <SmartLink
                        to={card.actionTo}
                        isExternal={card.isExternal}
                        className="mac-why-circle-btn"
                        ariaLabel={`${card.actionLabel}: ${card.title}`}
                      >
                        <ChevronRight size={18} strokeWidth={2.2} />
                      </SmartLink>
                    ) : (
                      <button
                        type="button"
                        className="mac-why-circle-btn"
                        aria-label={`More details about ${card.title}`}
                        onClick={() => setActiveBenefitModal(card)}
                      >
                        <Plus size={18} strokeWidth={2.2} />
                      </button>
                    )}
                  </article>
                ))}
              </div>
            </div>

            {(whyCarousel.canPrev || whyCarousel.canNext) && (
              <div className="mac-container">
                <div className="mac-carousel-paddles-row" aria-label="Why Buy & Sell GH carousel controls">
                  <button
                    type="button"
                    className="mac-paddle-btn"
                    data-testid="mac-why-prev"
                    disabled={!whyCarousel.canPrev}
                    onClick={() => whyCarousel.scrollByStep(-1)}
                    aria-label="Previous shopping benefit"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    type="button"
                    className="mac-paddle-btn"
                    data-testid="mac-why-next"
                    disabled={!whyCarousel.canNext}
                    onClick={() => whyCarousel.scrollByStep(1)}
                    aria-label="Next shopping benefit"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            )}
          </section>
        );
      }

      case "help-me-choose": {
        return (
          <section
            key={sec.id}
            id="help-me-choose"
            className="mac-band-white"
            aria-labelledby="mac-help-choose-title"
            data-testid="mac-help-me-choose"
          >
            <div className="mac-container">
              <div className="mac-section-header">
                <h2 id="mac-help-choose-title" className="mac-section-heading">
                  {config.helpMeChoose.sectionHeading}
                </h2>
              </div>

              <div className="mac-help-banner">
                <div className="mac-help-copy">
                  <h3 className="mac-help-title">{config.helpMeChoose.cardHeading}</h3>
                  {config.helpMeChoose.subtitle && (
                    <p className="mac-help-subtitle">{config.helpMeChoose.subtitle}</p>
                  )}
                  {config.helpMeChoose.interactiveModalEnabled ? (
                    <button
                      type="button"
                      className="mac-btn-gold-pill"
                      data-testid="mac-help-get-started-btn"
                      onClick={() => setFinderOpen(true)}
                    >
                      {config.helpMeChoose.ctaLabel || "Get started"}
                    </button>
                  ) : (
                    <SmartLink
                      to={config.helpMeChoose.secondaryTo || "/contact"}
                      className="mac-btn-gold-pill"
                    >
                      {config.helpMeChoose.ctaLabel || "Get started"}
                    </SmartLink>
                  )}

                  {config.helpMeChoose.secondaryLabel && config.helpMeChoose.secondaryTo && (
                    <SmartLink to={config.helpMeChoose.secondaryTo} className="mac-help-secondary">
                      {config.helpMeChoose.secondaryLabel} ›
                    </SmartLink>
                  )}
                </div>

                <div className="mac-help-media">
                  <img
                    src={config.helpMeChoose.image}
                    alt={config.helpMeChoose.alt}
                    className="mac-help-img"
                    loading="eager"
                    decoding="async"
                  />
                </div>
              </div>
            </div>
          </section>
        );
      }

      case "switch-to-mac": {
        return (
          <div key={sec.id}>
            {renderSplitCardsSection(
              "switch-to-mac",
              config.switchToMacSection.heading,
              visibleSwitchCards,
              switchCarousel,
              true
            )}
          </div>
        );
      }

      case "mac-essentials": {
        return (
          <div key={sec.id}>
            {renderSplitCardsSection(
              "mac-essentials",
              config.macEssentialsSection.heading,
              visibleEssentialCards,
              essentialsCarousel,
              false
            )}
          </div>
        );
      }

      case "ecosystem-accordion": {
        return (
          <section
            key={sec.id}
            id="unlock-apple-world"
            className="mac-band-white"
            aria-labelledby="mac-eco-title"
            data-testid="mac-ecosystem-section"
          >
            <div className="mac-container">
              <div className="mac-section-header">
                <h2 id="mac-eco-title" className="mac-section-heading">
                  {config.ecosystemSection.heading}
                </h2>
                {config.ecosystemSection.actionLabel && (
                  <SmartLink to={config.ecosystemSection.actionTo} className="mac-section-link">
                    <span>{config.ecosystemSection.actionLabel}</span>
                    <ChevronRight size={16} strokeWidth={2.2} aria-hidden="true" />
                  </SmartLink>
                )}
              </div>

              <div className="mac-eco-shell">
                <div className="mac-eco-accordion" role="region" aria-label="Apple ecosystem with Mac">
                  {visibleEcoItems.map((item) => {
                    const isOpen = activeEcoItem?.id === item.id;
                    return (
                      <div key={item.id} className="mac-eco-item">
                        <button
                          type="button"
                          className="mac-eco-trigger"
                          aria-expanded={isOpen}
                          data-testid={`mac-eco-trigger-${item.id}`}
                          onClick={() => setActiveEcoId(item.id)}
                        >
                          <span className="mac-eco-trigger-title">{item.title}</span>
                          <ChevronDown
                            size={22}
                            strokeWidth={2}
                            className={`mac-eco-chevron ${isOpen ? "is-open" : ""}`}
                            aria-hidden="true"
                          />
                        </button>

                        {isOpen && (
                          <div className="mac-eco-panel" data-testid={`mac-eco-panel-${item.id}`}>
                            <p className="mac-eco-desc">{item.description}</p>
                            {item.linkLabel && item.linkTo && (
                              <SmartLink to={item.linkTo} className="mac-link-action">
                                <span>{item.linkLabel}</span>
                                <ChevronRight size={15} strokeWidth={2.2} aria-hidden="true" />
                              </SmartLink>
                            )}
                            {/* Exact Apple mobile behavior: image renders inline beneath expanded text */}
                            <div className="mac-eco-inline-media">
                              <img
                                src={item.image}
                                alt={item.alt || item.title}
                                className="mac-eco-inline-img"
                                loading="eager"
                                decoding="async"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Desktop crossfading stage */}
                <div className="mac-eco-desktop-stage">
                  {activeEcoItem && (
                    <img
                      key={activeEcoItem.id}
                      src={activeEcoItem.image}
                      alt={activeEcoItem.alt || activeEcoItem.title}
                      className="mac-eco-stage-img"
                      data-testid="mac-eco-desktop-image"
                      loading="eager"
                      decoding="async"
                    />
                  )}
                </div>
              </div>
            </div>
          </section>
        );
      }

      case "all-mac-catalog": {
        // Standalone "All Mac Listings" list/database section is intentionally removed from /mac.
        // All 24 active Mac products remain preserved in Supabase and accessible via /shop/buy-mac.
        return null;
      }

      case "mac-directory-footer": {
        return (
          <section
            key={sec.id}
            className="mac-directory-section"
            aria-labelledby="mac-directory-heading"
            data-testid="mac-directory-footer"
          >
            <div className="mac-container">
              <div className="mac-directory-top">
                <h2 id="mac-directory-heading" className="mac-directory-heading">
                  {config.directoryFooter.heading || "Mac"}
                </h2>
                {config.directoryFooter.tagline && (
                  <span className="mac-directory-tagline">{config.directoryFooter.tagline}</span>
                )}
              </div>

              <div className="mac-directory-cols">
                {config.directoryFooter.columns.map((col) => (
                  <div key={col.id}>
                    <h3 className="mac-dir-col-title">{col.heading}</h3>
                    <ul className="mac-dir-list">
                      {col.links.map((lnk, idx) => {
                        const prev = col.links[idx - 1];
                        const needsSubGap = col.primaryStyle && lnk.isSecondary && prev && !prev.isSecondary;
                        return (
                          <li key={lnk.id} className={needsSubGap ? "mac-dir-link-subgap" : undefined}>
                            <SmartLink
                              to={lnk.to}
                              className={
                                col.primaryStyle && !lnk.isSecondary
                                  ? "mac-dir-link-primary"
                                  : "mac-dir-link-secondary"
                              }
                            >
                              {lnk.label}
                            </SmartLink>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ))}
              </div>

              {config.directoryFooter.footnotes && config.directoryFooter.footnotes.length > 0 && (
                <div className="mac-footnotes">
                  {config.directoryFooter.footnotes.map((note, idx) => (
                    <p key={idx} className="mac-footnote-line">
                      {note}
                    </p>
                  ))}
                </div>
              )}
            </div>
          </section>
        );
      }

      default:
        return renderCustomSection(sec);
    }
  };

  return (
    <div
      className={`mac-page-root ${previewDevice === "mobile" ? "is-preview-mobile" : ""}`}
      data-testid="mac-redesign-page"
    >
      {visibleSections.map(renderSection)}

      {/* Interactive Benefit Detail Modal */}
      {activeBenefitModal && (
        <div
          className="mac-modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="mac-benefit-modal-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) setActiveBenefitModal(null);
          }}
        >
          <div className="mac-modal-card" data-testid="mac-benefit-modal">
            <button
              type="button"
              className="mac-modal-close"
              onClick={() => setActiveBenefitModal(null)}
              aria-label="Close benefit details"
            >
              <X size={18} />
            </button>
            <div className="text-xs font-semibold uppercase tracking-wider text-[#6e6e73] mb-2">
              {activeBenefitModal.eyebrow}
            </div>
            <h3
              id="mac-benefit-modal-title"
              className="text-2xl font-semibold tracking-tight text-[#1d1d1f] mb-3"
            >
              {activeBenefitModal.title}
            </h3>
            <p className="text-[15.5px] leading-relaxed text-[#424245] mb-6">
              {activeBenefitModal.modalDetails || activeBenefitModal.description}
            </p>
            <div className="rounded-2xl bg-[#f5f5f7] p-5 flex items-center justify-center mb-6">
              <img
                src={activeBenefitModal.image}
                alt={activeBenefitModal.alt}
                className="max-h-52 w-auto object-contain"
              />
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <SmartLink
                to={activeBenefitModal.actionTo}
                isExternal={activeBenefitModal.isExternal}
                className="mac-btn-gold-pill"
                onClick={() => setActiveBenefitModal(null)}
              >
                {activeBenefitModal.actionLabel || "Learn more"}
              </SmartLink>
              <button
                type="button"
                onClick={() => setActiveBenefitModal(null)}
                className="text-sm font-medium text-[#6e6e73] hover:text-[#1d1d1f] bg-transparent border-0 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Help Me Choose Mac Finder Modal */}
      <MacFinderModal
        open={finderOpen}
        onClose={() => setFinderOpen(false)}
        macProducts={macCatalogProducts}
      />
    </div>
  );
}
