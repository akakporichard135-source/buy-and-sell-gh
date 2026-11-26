import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
  Plus,
  ShoppingBag,
  X,
} from "lucide-react";
import { useCms } from "../../../cms/CmsContext";
import { defaultIphonePageConfig } from "../../../cms/iphonePageDefaults";
import type {
  IphoneBenefitCard,
  IphonePageConfig,
  IphonePageSection,
} from "../../../cms/types";
import { useProductCatalog } from "../../../catalog/ProductCatalogContext";
import { getPublicPurchaseAction } from "../../../catalog/productPurchaseAction";
import type { Product } from "../../../types/product";
import { getCardPriceDisplay } from "../../../utils/productPricing";
import { IphoneCompareModal } from "./IphoneCompareModal";
import "../../../styles/iphone-page.css";

interface IphonePageRendererProps {
  configOverride?: IphonePageConfig;
  previewMode?: boolean;
}

export function IphonePageRenderer({
  configOverride,
  previewMode = false,
}: IphonePageRendererProps) {
  const { iphonePage } = useCms();
  const { activeProducts } = useProductCatalog();
  const config = configOverride || iphonePage || defaultIphonePageConfig;

  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [isAutoplaying, setIsAutoplaying] = useState(true);
  const [compareOpen, setCompareOpen] = useState(false);
  const [activeBenefitModal, setActiveBenefitModal] = useState<IphoneBenefitCard | null>(null);
  const [activeEcoId, setActiveEcoId] = useState<string>(
    () => config.ecosystemSection.items.find((i) => i.visible !== false)?.id || "eco-iphone-mac"
  );

  const chapterTrackRef = useRef<HTMLDivElement | null>(null);
  const lineupTrackRef = useRef<HTMLDivElement | null>(null);
  const whyTrackRef = useRef<HTMLDivElement | null>(null);

  const [chapterScroll, setChapterScroll] = useState({ canLeft: false, canRight: false });
  const [lineupScroll, setLineupScroll] = useState({ canLeft: false, canRight: true });
  const [whyScroll, setWhyScroll] = useState({ canLeft: false, canRight: true });

  const productsBySlug = useMemo(() => {
    const map = new Map<string, Product>();
    for (const p of activeProducts) {
      if (p.slug) map.set(p.slug, p);
    }
    return map;
  }, [activeProducts]);

  const visibleSections = useMemo(
    () => [...(config.sections || [])].filter((s) => s.visible !== false).sort((a, b) => a.order - b.order),
    [config.sections]
  );

  const visibleChapterItems = useMemo(
    () => [...(config.chapterNavItems || [])].filter((i) => i.visible !== false).sort((a, b) => a.order - b.order),
    [config.chapterNavItems]
  );

  const visibleSlides = useMemo(
    () => [...(config.heroGallery?.slides || [])].filter((s) => s.visible !== false).sort((a, b) => a.order - b.order),
    [config.heroGallery?.slides]
  );

  const visibleLineupCards = useMemo(
    () => [...(config.lineupSection?.cards || [])].filter((c) => c.visible !== false).sort((a, b) => a.order - b.order),
    [config.lineupSection?.cards]
  );

  const visibleWhyCards = useMemo(
    () => [...(config.whyShopSection?.cards || [])].filter((c) => c.visible !== false).sort((a, b) => a.order - b.order),
    [config.whyShopSection?.cards]
  );

  const visibleEssentialCards = useMemo(
    () => [...(config.essentialsSection?.cards || [])].filter((c) => c.visible !== false).sort((a, b) => a.order - b.order),
    [config.essentialsSection?.cards]
  );

  const visibleEcoItems = useMemo(
    () => [...(config.ecosystemSection?.items || [])].filter((i) => i.visible !== false).sort((a, b) => a.order - b.order),
    [config.ecosystemSection?.items]
  );

  const safeSlideIndex = visibleSlides.length > 0 ? activeSlideIndex % visibleSlides.length : 0;
  const activeSlide = visibleSlides[safeSlideIndex] || visibleSlides[0];
  const activeEcoItem = visibleEcoItems.find((i) => i.id === activeEcoId) || visibleEcoItems[0];

  // Autoplay hero gallery
  useEffect(() => {
    if (!isAutoplaying || visibleSlides.length <= 1 || previewMode) return;
    const ms = Math.max(3500, config.heroGallery?.autoplayMs || 6500);
    const id = window.setInterval(() => {
      setActiveSlideIndex((prev) => (prev + 1) % visibleSlides.length);
    }, ms);
    return () => window.clearInterval(id);
  }, [isAutoplaying, visibleSlides.length, config.heroGallery?.autoplayMs, previewMode]);

  // Escape key closes benefit modal
  useEffect(() => {
    if (!activeBenefitModal) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActiveBenefitModal(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activeBenefitModal]);

  const syncScrollState = (
    el: HTMLDivElement | null,
    setter: React.Dispatch<React.SetStateAction<{ canLeft: boolean; canRight: boolean }>>
  ) => {
    if (!el) return;
    const maxScroll = el.scrollWidth - el.clientWidth;
    setter({
      canLeft: el.scrollLeft > 8,
      canRight: maxScroll - el.scrollLeft > 8,
    });
  };

  useEffect(() => {
    const syncAll = () => {
      syncScrollState(chapterTrackRef.current, setChapterScroll);
      syncScrollState(lineupTrackRef.current, setLineupScroll);
      syncScrollState(whyTrackRef.current, setWhyScroll);
    };
    syncAll();
    const timer = window.setTimeout(syncAll, 300);
    window.addEventListener("resize", syncAll);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("resize", syncAll);
    };
  }, [visibleChapterItems.length, visibleLineupCards.length, visibleWhyCards.length]);

  const scrollTrack = (el: HTMLDivElement | null, direction: -1 | 1, step = 386) => {
    if (!el) return;
    el.scrollBy({ left: direction * step, behavior: "smooth" });
  };

  const resolvePriceAndAction = (
    productSlug?: string,
    fallbackPrice?: string,
    defaultBuyLabel = "Buy"
  ) => {
    const product = productSlug ? productsBySlug.get(productSlug) : undefined;
    if (!product) {
      return {
        priceText: fallbackPrice || "",
        ctaLabel: defaultBuyLabel,
        canBuy: true,
      };
    }
    const action = getPublicPurchaseAction(product);
    const canBuy = action === "buy";
    const priceDisp = getCardPriceDisplay(product);
    const priceText =
      priceDisp && !priceDisp.isEnquiry
        ? priceDisp.current
        : fallbackPrice || "Confirm price";
    return {
      priceText,
      ctaLabel: canBuy ? defaultBuyLabel : "View Pricing",
      canBuy,
    };
  };

  const renderSection = (section: IphonePageSection) => {
    switch (section.builtInKey) {
      case "promo-ribbon": {
        if (!config.promoRibbon?.enabled) return null;
        return (
          <div
            key={section.id}
            className="iphone-promo-ribbon"
            data-testid="iphone-promo-ribbon"
          >
            <div className="iphone-promo-ribbon-inner">
              <span>{config.promoRibbon.text}</span>
              <Link to={config.promoRibbon.linkTo} className="iphone-promo-ribbon-link">
                <span>{config.promoRibbon.linkLabel}</span>
                <ChevronRight size={14} aria-hidden="true" />
              </Link>
            </div>
          </div>
        );
      }

      case "hero-chapter-nav": {
        return (
          <section
            key={section.id}
            className="iphone-hero-section"
            data-testid="iphone-hero-section"
          >
            <div className="iphone-container">
              <h1 className="iphone-hero-title">
                {config.hero.heading}
                {config.hero.showGoldPeriod !== false && (
                  <span className="iphone-hero-gold-dot">.</span>
                )}
              </h1>

              <div className="iphone-chapter-shell">
                {chapterScroll.canLeft && (
                  <button
                    type="button"
                    className="iphone-chapter-paddle prev"
                    aria-label="Scroll iPhone family left"
                    onClick={() => scrollTrack(chapterTrackRef.current, -1, 240)}
                  >
                    <ChevronLeft size={16} />
                  </button>
                )}

                <nav
                  ref={chapterTrackRef}
                  className="iphone-chapter-track"
                  aria-label="iPhone family navigation"
                  onScroll={() => syncScrollState(chapterTrackRef.current, setChapterScroll)}
                >
                  {visibleChapterItems.map((item) => {
                    const inner = (
                      <>
                        <span className="iphone-chapter-thumb">
                          <img src={item.image} alt={item.alt} />
                        </span>
                        <span className="iphone-chapter-label">{item.label}</span>
                        {item.badge && <span className="iphone-chapter-badge">{item.badge}</span>}
                      </>
                    );

                    if (item.openCompareModal) {
                      return (
                        <button
                          key={item.id}
                          type="button"
                          className="iphone-chapter-item"
                          data-testid={`iphone-chapter-${item.id}`}
                          onClick={() => setCompareOpen(true)}
                        >
                          {inner}
                        </button>
                      );
                    }

                    return (
                      <Link
                        key={item.id}
                        to={item.to}
                        className="iphone-chapter-item"
                        data-testid={`iphone-chapter-${item.id}`}
                      >
                        {inner}
                      </Link>
                    );
                  })}
                </nav>

                {chapterScroll.canRight && (
                  <button
                    type="button"
                    className="iphone-chapter-paddle next"
                    aria-label="Scroll iPhone family right"
                    onClick={() => scrollTrack(chapterTrackRef.current, 1, 240)}
                  >
                    <ChevronRight size={16} />
                  </button>
                )}
              </div>
            </div>
          </section>
        );
      }

      case "featured-hero-gallery": {
        if (!activeSlide) return null;
        const slideMeta = resolvePriceAndAction(
          activeSlide.productSlug,
          activeSlide.fallbackPriceText,
          activeSlide.buyLabel || "Buy"
        );
        const isDark = activeSlide.theme === "dark";

        return (
          <section
            key={section.id}
            className="iphone-hero-gallery-section"
            data-testid="iphone-hero-gallery"
            aria-label="Featured iPhone showcase"
          >
            <div className="iphone-container">
              <div
                className={`iphone-hero-stage ${isDark ? "is-dark" : "is-light"}`}
                data-testid={`iphone-hero-slide-${activeSlide.id}`}
              >
                <div className="iphone-hero-stage-header">
                  <div>
                    {activeSlide.eyebrow && (
                      <span className="iphone-hero-slide-eyebrow">{activeSlide.eyebrow}</span>
                    )}
                    <h2 className="iphone-hero-slide-title">{activeSlide.title}</h2>
                    <p className="iphone-hero-slide-sub">{activeSlide.subtitle}</p>
                    {slideMeta.priceText && (
                      <p className="iphone-hero-slide-price">{slideMeta.priceText}</p>
                    )}
                  </div>

                  <div className="iphone-hero-slide-ctas">
                    <Link
                      to={activeSlide.buyTo}
                      className="iphone-btn-gold-pill"
                      data-testid={`iphone-hero-buy-${activeSlide.id}`}
                    >
                      <ShoppingBag size={15} aria-hidden="true" />
                      <span>{slideMeta.ctaLabel}</span>
                    </Link>
                    <Link
                      to={activeSlide.learnMoreTo}
                      className={isDark ? "iphone-btn-outline-light" : "iphone-btn-outline-dark"}
                    >
                      <span>{activeSlide.learnMoreLabel}</span>
                      <ChevronRight size={15} aria-hidden="true" />
                    </Link>
                  </div>
                </div>

                <div className="iphone-hero-stage-media">
                  <img src={activeSlide.image} alt={activeSlide.alt} />
                </div>
              </div>

              {visibleSlides.length > 1 && (
                <div className="iphone-hero-controls">
                  <div className="iphone-hero-tablist" role="tablist" aria-label="Featured iPhone slides">
                    {visibleSlides.map((slide, idx) => (
                      <button
                        key={slide.id}
                        type="button"
                        role="tab"
                        aria-selected={idx === safeSlideIndex}
                        aria-label={`Show ${slide.tabLabel}`}
                        className={`iphone-hero-dot ${idx === safeSlideIndex ? "is-active" : ""}`}
                        data-testid={`iphone-hero-tab-${idx}`}
                        onClick={() => {
                          setActiveSlideIndex(idx);
                          setIsAutoplaying(false);
                        }}
                      />
                    ))}
                  </div>
                  <button
                    type="button"
                    className="iphone-hero-playbtn"
                    aria-label={isAutoplaying ? "Pause featured showcase" : "Play featured showcase"}
                    data-testid="iphone-hero-play-toggle"
                    onClick={() => setIsAutoplaying((v) => !v)}
                  >
                    {isAutoplaying ? <Pause size={14} /> : <Play size={14} />}
                  </button>
                </div>
              )}
            </div>
          </section>
        );
      }

      case "explore-lineup": {
        return (
          <section
            key={section.id}
            id="explore-lineup"
            className="iphone-lineup-section"
            data-testid="iphone-explore-lineup"
          >
            <div className="iphone-container">
              <div className="iphone-section-head">
                <h2 className="iphone-section-heading">{config.lineupSection.heading}</h2>
                <div className="iphone-section-actions">
                  <button
                    type="button"
                    className="iphone-link-gold"
                    data-testid="iphone-compare-models-btn"
                    onClick={() => setCompareOpen(true)}
                  >
                    <span>{config.lineupSection.compareLabel}</span>
                    <ChevronRight size={16} aria-hidden="true" />
                  </button>
                  <Link
                    to={config.lineupSection.shopAllTo}
                    className="iphone-link-gold"
                    data-testid="iphone-shop-all-link"
                  >
                    <ShoppingBag size={16} className="iphone-gold-bag-icon" aria-hidden="true" />
                    <span>{config.lineupSection.shopAllLabel}</span>
                    <ChevronRight size={16} aria-hidden="true" />
                  </Link>
                </div>
              </div>
            </div>

            <div
              ref={lineupTrackRef}
              className="iphone-carousel-bleed"
              onScroll={() => syncScrollState(lineupTrackRef.current, setLineupScroll)}
            >
              <div className="iphone-carousel-track">
                {visibleLineupCards.map((card) => {
                  const meta = resolvePriceAndAction(
                    card.productSlug,
                    card.fallbackPriceText,
                    card.buyLabel || "Buy"
                  );

                  return (
                    <article
                      key={card.id}
                      className="iphone-lineup-card"
                      data-testid={`iphone-lineup-card-${card.id}`}
                    >
                      <Link
                        to={card.buyTo}
                        className={`iphone-lineup-tile tone-${card.tileTone || "light"}`}
                        aria-label={`View ${card.title}`}
                      >
                        <img src={card.image} alt={card.alt} loading="lazy" />
                      </Link>

                      <div className="iphone-swatches" aria-label={`${card.title} finishes`}>
                        {(card.swatches || []).map((swatch) => (
                          <span
                            key={swatch.label}
                            className="iphone-swatch-dot"
                            title={swatch.label}
                            style={{ backgroundColor: swatch.hex }}
                          />
                        ))}
                      </div>

                      <div className="iphone-lineup-badge">{card.badge || ""}</div>
                      <h3 className="iphone-lineup-title">{card.title}</h3>
                      {card.chipLine && <p className="iphone-lineup-chip">{card.chipLine}</p>}
                      <p className="iphone-lineup-desc">{card.description}</p>
                      <p className="iphone-lineup-price">{meta.priceText}</p>
                      <p className="iphone-lineup-note">{card.priceNote || ""}</p>

                      <div className="iphone-lineup-ctas">
                        <Link
                          to={card.buyTo}
                          className="iphone-btn-gold-pill"
                          data-testid={`iphone-buy-btn-${card.id}`}
                        >
                          <ShoppingBag size={14} aria-hidden="true" />
                          <span>{meta.ctaLabel}</span>
                        </Link>
                        <Link to={card.learnMoreTo} className="iphone-link-gold">
                          <span>{card.learnMoreLabel}</span>
                          <ChevronRight size={15} aria-hidden="true" />
                        </Link>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>

            <div className="iphone-container">
              <div className="iphone-carousel-nav-row">
                <button
                  type="button"
                  className="iphone-circle-arrow"
                  aria-label="Previous iPhone models"
                  data-testid="iphone-lineup-prev"
                  disabled={!lineupScroll.canLeft}
                  onClick={() => scrollTrack(lineupTrackRef.current, -1)}
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  type="button"
                  className="iphone-circle-arrow"
                  aria-label="Next iPhone models"
                  data-testid="iphone-lineup-next"
                  disabled={!lineupScroll.canRight}
                  onClick={() => scrollTrack(lineupTrackRef.current, 1)}
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          </section>
        );
      }

      case "why-shop-iphone": {
        return (
          <section
            key={section.id}
            id="why-shop-iphone"
            className="iphone-why-section"
            data-testid="iphone-why-shop"
          >
            <div className="iphone-container">
              <div className="iphone-section-head">
                <h2 className="iphone-section-heading">{config.whyShopSection.heading}</h2>
                <Link to={config.whyShopSection.actionTo} className="iphone-link-gold">
                  <ShoppingBag size={16} className="iphone-gold-bag-icon" aria-hidden="true" />
                  <span>{config.whyShopSection.actionLabel}</span>
                  <ChevronRight size={16} aria-hidden="true" />
                </Link>
              </div>
            </div>

            <div
              ref={whyTrackRef}
              className="iphone-carousel-bleed"
              onScroll={() => syncScrollState(whyTrackRef.current, setWhyScroll)}
            >
              <div className="iphone-carousel-track">
                {visibleWhyCards.map((card) => (
                  <article
                    key={card.id}
                    className="iphone-why-card"
                    data-testid={`iphone-why-card-${card.id}`}
                  >
                    <div>
                      <p className="iphone-why-eyebrow">{card.eyebrow}</p>
                      <h3 className="iphone-why-title">{card.title}</h3>
                      <p className="iphone-why-desc">{card.description}</p>
                    </div>

                    <div className="iphone-why-media">
                      <img src={card.image} alt={card.alt} loading="lazy" />
                    </div>

                    {card.actionStyle === "link" ? (
                      <Link
                        to={card.actionTo}
                        className="iphone-why-trigger"
                        aria-label={`${card.title} - ${card.actionLabel}`}
                      >
                        <ChevronRight size={18} />
                      </Link>
                    ) : (
                      <button
                        type="button"
                        className="iphone-why-trigger"
                        aria-label={`Learn more about ${card.eyebrow}`}
                        onClick={() => setActiveBenefitModal(card)}
                      >
                        <Plus size={18} />
                      </button>
                    )}
                  </article>
                ))}
              </div>
            </div>

            <div className="iphone-container">
              <div className="iphone-carousel-nav-row">
                <button
                  type="button"
                  className="iphone-circle-arrow"
                  aria-label="Previous shopping benefits"
                  data-testid="iphone-why-prev"
                  disabled={!whyScroll.canLeft}
                  onClick={() => scrollTrack(whyTrackRef.current, -1)}
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  type="button"
                  className="iphone-circle-arrow"
                  aria-label="Next shopping benefits"
                  data-testid="iphone-why-next"
                  disabled={!whyScroll.canRight}
                  onClick={() => scrollTrack(whyTrackRef.current, 1)}
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          </section>
        );
      }

      case "iphone-essentials": {
        return (
          <section
            key={section.id}
            id="iphone-essentials"
            className="iphone-essentials-section"
            data-testid="iphone-essentials-section"
          >
            <div className="iphone-container">
              <div className="iphone-section-head">
                <h2 className="iphone-section-heading">{config.essentialsSection.heading}</h2>
                <Link to={config.essentialsSection.actionTo} className="iphone-link-gold">
                  <span>{config.essentialsSection.actionLabel}</span>
                  <ChevronRight size={16} aria-hidden="true" />
                </Link>
              </div>

              <div className="iphone-essentials-grid">
                {visibleEssentialCards.map((card) => {
                  const meta = resolvePriceAndAction(
                    card.productSlug,
                    card.fallbackPriceText,
                    card.buyLabel
                  );
                  return (
                    <article
                      key={card.id}
                      className="iphone-essential-card"
                      data-testid={`iphone-essential-card-${card.id}`}
                    >
                      <div className="iphone-essential-copy">
                        <h3 className="iphone-essential-title">{card.title}</h3>
                        <p className="iphone-essential-desc">{card.description}</p>
                        {meta.priceText && (
                          <p className="iphone-essential-price">{meta.priceText}</p>
                        )}
                        <div className="iphone-essential-ctas">
                          <Link to={card.buyTo} className="iphone-btn-gold-pill">
                            <ShoppingBag size={14} aria-hidden="true" />
                            <span>{card.buyLabel}</span>
                          </Link>
                          {card.secondaryLinkLabel && card.secondaryLinkTo && (
                            <Link to={card.secondaryLinkTo} className="iphone-link-gold">
                              <span>{card.secondaryLinkLabel}</span>
                              <ChevronRight size={15} aria-hidden="true" />
                            </Link>
                          )}
                        </div>
                      </div>

                      <div className="iphone-essential-media">
                        <img src={card.image} alt={card.alt} loading="lazy" />
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          </section>
        );
      }

      case "significant-others": {
        return (
          <section
            key={section.id}
            id="significant-others"
            className="iphone-eco-section"
            data-testid="iphone-ecosystem-section"
          >
            <div className="iphone-container">
              <div className="iphone-section-head">
                <h2 className="iphone-section-heading">{config.ecosystemSection.heading}</h2>
                <Link to={config.ecosystemSection.actionTo} className="iphone-link-gold">
                  <span>{config.ecosystemSection.actionLabel}</span>
                  <ChevronRight size={16} aria-hidden="true" />
                </Link>
              </div>

              <div className="iphone-eco-card">
                <div className="iphone-eco-list">
                  {visibleEcoItems.map((item) => {
                    const isOpen = activeEcoItem?.id === item.id;
                    return (
                      <div
                        key={item.id}
                        className={`iphone-eco-item ${isOpen ? "is-open" : ""}`}
                      >
                        <button
                          type="button"
                          className="iphone-eco-trigger"
                          aria-expanded={isOpen}
                          data-testid={`iphone-eco-trigger-${item.id}`}
                          onClick={() => setActiveEcoId(item.id)}
                        >
                          <span>{item.title}</span>
                          <ChevronDown size={20} className="iphone-eco-chevron" />
                        </button>

                        {isOpen && (
                          <div
                            className="iphone-eco-panel"
                            data-testid={`iphone-eco-panel-${item.id}`}
                          >
                            <p className="iphone-eco-desc">{item.description}</p>
                            <Link to={item.linkTo} className="iphone-link-gold">
                              <span>{item.linkLabel}</span>
                              <ChevronRight size={15} aria-hidden="true" />
                            </Link>
                            <div className="iphone-eco-inline-media">
                              <img
                                src={item.image}
                                alt={item.alt}
                                className="iphone-eco-inline-img"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {activeEcoItem && (
                  <div className="iphone-eco-stage">
                    <img
                      src={activeEcoItem.image}
                      alt={activeEcoItem.alt}
                      data-testid="iphone-eco-desktop-image"
                    />
                  </div>
                )}
              </div>
            </div>
          </section>
        );
      }

      case "iphone-directory-footer": {
        return (
          <section
            key={section.id}
            className="iphone-directory-section"
            data-testid="iphone-directory-footer"
          >
            <div className="iphone-container">
              <div className="iphone-directory-head">
                <h2 className="iphone-directory-title">{config.directoryFooter.heading}</h2>
                <span className="iphone-directory-tagline">{config.directoryFooter.tagline}</span>
              </div>

              <div className="iphone-directory-grid">
                {config.directoryFooter.columns.map((col) => (
                  <div key={col.id}>
                    <h3 className="iphone-directory-col-title">{col.heading}</h3>
                    <ul className="iphone-directory-links">
                      {col.links.map((lnk) => (
                        <li key={lnk.id}>
                          {lnk.openCompareModal ? (
                            <button
                              type="button"
                              className="iphone-directory-link"
                              onClick={() => setCompareOpen(true)}
                            >
                              {lnk.label}
                            </button>
                          ) : (
                            <Link
                              to={lnk.to}
                              className={`iphone-directory-link ${
                                col.primaryStyle && !lnk.isSecondary ? "is-primary" : ""
                              }`}
                            >
                              {lnk.label}
                            </Link>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              <div className="iphone-footnotes">
                {config.directoryFooter.footnotes.map((note, idx) => (
                  <p key={idx}>{note}</p>
                ))}
              </div>
            </div>
          </section>
        );
      }

      default: {
        return (
          <section
            key={section.id}
            className="iphone-custom-section"
            style={{ background: section.backgroundColor || "#ffffff" }}
          >
            <div className="iphone-container">
              <div
                className="iphone-custom-card"
                style={{ background: section.backgroundColor === "#f5f5f7" ? "#ffffff" : "#f5f5f7" }}
              >
                <div>
                  {section.eyebrow && <p className="iphone-why-eyebrow">{section.eyebrow}</p>}
                  <h2 className="iphone-section-heading" style={{ fontSize: "clamp(26px, 3vw, 38px)" }}>
                    {section.heading}
                  </h2>
                  {section.subtitle && (
                    <p style={{ margin: "10px 0 8px", fontSize: 17, fontWeight: 600 }}>
                      {section.subtitle}
                    </p>
                  )}
                  {section.description && (
                    <p style={{ margin: "0 0 20px", fontSize: 15, lineHeight: 1.55, color: "#6e6e73" }}>
                      {section.description}
                    </p>
                  )}
                  {section.buttonLabel && section.buttonDestination && (
                    <Link to={section.buttonDestination} className="iphone-btn-gold-pill">
                      <ShoppingBag size={14} aria-hidden="true" />
                      <span>{section.buttonLabel}</span>
                    </Link>
                  )}
                </div>
                {section.desktopImage && (
                  <img src={section.desktopImage} alt={section.imageAlt || section.heading} />
                )}
              </div>
            </div>
          </section>
        );
      }
    }
  };

  return (
    <div className="iphone-page" data-testid="iphone-redesign-page">
      {visibleSections.map((sec) => renderSection(sec))}

      <IphoneCompareModal
        open={compareOpen}
        onClose={() => setCompareOpen(false)}
        cards={visibleLineupCards}
        productsBySlug={productsBySlug}
      />

      {activeBenefitModal && (
        <div
          className="iphone-modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="iphone-benefit-modal-title"
          data-testid="iphone-benefit-modal"
          onClick={(e) => {
            if (e.target === e.currentTarget) setActiveBenefitModal(null);
          }}
        >
          <div className="iphone-modal-dialog">
            <button
              type="button"
              className="iphone-modal-close"
              aria-label="Close benefit details"
              onClick={() => setActiveBenefitModal(null)}
            >
              <X size={18} />
            </button>
            <p className="iphone-why-eyebrow">{activeBenefitModal.eyebrow}</p>
            <h2
              id="iphone-benefit-modal-title"
              style={{ margin: "0 0 12px", fontSize: 28, fontWeight: 700, letterSpacing: "-0.025em" }}
            >
              {activeBenefitModal.title}
            </h2>
            <p style={{ margin: "0 0 14px", fontSize: 15.5, lineHeight: 1.58, color: "#1d1d1f" }}>
              {activeBenefitModal.description}
            </p>
            {activeBenefitModal.modalDetails && (
              <p style={{ margin: "0 0 24px", fontSize: 15, lineHeight: 1.58, color: "#6e6e73" }}>
                {activeBenefitModal.modalDetails}
              </p>
            )}
            <Link
              to={activeBenefitModal.actionTo}
              className="iphone-btn-gold-pill"
              onClick={() => setActiveBenefitModal(null)}
            >
              <ShoppingBag size={14} aria-hidden="true" />
              <span>{activeBenefitModal.actionLabel}</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
