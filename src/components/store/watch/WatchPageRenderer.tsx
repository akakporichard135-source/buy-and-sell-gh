import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, ChevronLeft, ChevronRight, Plus, ShoppingBag, X } from "lucide-react";
import { useCms } from "../../../cms/CmsContext";
import { defaultWatchPageConfig } from "../../../cms/watchPageDefaults";
import type { WatchBenefitCard, WatchPageConfig, WatchPageSection } from "../../../cms/types";
import { useProductCatalog } from "../../../catalog/ProductCatalogContext";
import { getPublicPurchaseAction } from "../../../catalog/productPurchaseAction";
import type { Product } from "../../../types/product";
import { getCardPriceDisplay } from "../../../utils/productPricing";
import { WatchCompareModal } from "./WatchCompareModal";
import "../../../styles/watch-page.css";

interface WatchPageRendererProps {
  configOverride?: WatchPageConfig;
}

export function WatchPageRenderer({ configOverride }: WatchPageRendererProps) {
  const { watchPage } = useCms();
  const { activeProducts } = useProductCatalog();
  const config = configOverride || watchPage || defaultWatchPageConfig;

  const [compareOpen, setCompareOpen] = useState(false);
  const [activeBenefitModal, setActiveBenefitModal] = useState<WatchBenefitCard | null>(null);
  const [activeEcoId, setActiveEcoId] = useState<string>(
    () => config.ecosystemSection.items.find((i) => i.visible !== false)?.id || "eco-watch-iphone"
  );

  const chapterTrackRef = useRef<HTMLDivElement | null>(null);
  const whyTrackRef = useRef<HTMLDivElement | null>(null);
  const [chapterScroll, setChapterScroll] = useState({ canLeft: false, canRight: false });
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

  const visibleLineupCards = useMemo(
    () => [...(config.lineupSection?.cards || [])].filter((c) => c.visible !== false).sort((a, b) => a.order - b.order),
    [config.lineupSection?.cards]
  );

  const visibleWhyCards = useMemo(
    () => [...(config.whyShopSection?.cards || [])].filter((c) => c.visible !== false).sort((a, b) => a.order - b.order),
    [config.whyShopSection?.cards]
  );

  const visibleEcoItems = useMemo(
    () => [...(config.ecosystemSection?.items || [])].filter((i) => i.visible !== false).sort((a, b) => a.order - b.order),
    [config.ecosystemSection?.items]
  );

  const activeEcoItem = visibleEcoItems.find((i) => i.id === activeEcoId) || visibleEcoItems[0];

  useEffect(() => {
    if (!activeBenefitModal) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActiveBenefitModal(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activeBenefitModal]);

  const syncScroll = (
    el: HTMLDivElement | null,
    setter: React.Dispatch<React.SetStateAction<{ canLeft: boolean; canRight: boolean }>>
  ) => {
    if (!el) return;
    const maxScroll = el.scrollWidth - el.clientWidth;
    setter({ canLeft: el.scrollLeft > 8, canRight: maxScroll - el.scrollLeft > 8 });
  };

  useEffect(() => {
    const syncAll = () => {
      syncScroll(chapterTrackRef.current, setChapterScroll);
      syncScroll(whyTrackRef.current, setWhyScroll);
    };
    syncAll();
    const timer = window.setTimeout(syncAll, 300);
    window.addEventListener("resize", syncAll);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("resize", syncAll);
    };
  }, [visibleChapterItems.length, visibleWhyCards.length]);

  const scrollTrack = (el: HTMLDivElement | null, dir: -1 | 1, step = 386) => {
    el?.scrollBy({ left: dir * step, behavior: "smooth" });
  };

  const resolvePriceAndAction = (slug?: string, fallbackPrice?: string, defaultBuy = "Buy") => {
    const product = slug ? productsBySlug.get(slug) : undefined;
    if (!product) return { priceText: fallbackPrice || "", ctaLabel: defaultBuy };
    const action = getPublicPurchaseAction(product);
    const priceDisp = getCardPriceDisplay(product);
    const priceText =
      priceDisp && !priceDisp.isEnquiry
        ? priceDisp.current
        : fallbackPrice || "Confirm price";
    return { priceText, ctaLabel: action === "buy" ? defaultBuy : "View Pricing" };
  };

  const renderSection = (section: WatchPageSection) => {
    switch (section.builtInKey) {
      case "promo-ribbon": {
        if (!config.promoRibbon?.enabled) return null;
        return (
          <div key={section.id} className="watch-promo-ribbon" data-testid="watch-promo-ribbon">
            <span>{config.promoRibbon.text}</span>
            <Link to={config.promoRibbon.linkTo}>
              <span>{config.promoRibbon.linkLabel}</span>
              <ChevronRight size={14} aria-hidden="true" />
            </Link>
          </div>
        );
      }

      case "hero-chapter-nav": {
        return (
          <section key={section.id} className="watch-hero-section" data-testid="watch-hero-section">
            <div className="watch-container">
              <h1 className="watch-hero-title">
                {config.hero.heading}
                {config.hero.showGoldPeriod !== false && <span className="watch-hero-gold-dot">.</span>}
              </h1>

              <div className="watch-chapter-shell">
                {chapterScroll.canLeft && (
                  <button
                    type="button"
                    className="watch-chapter-paddle prev"
                    aria-label="Scroll Apple Watch nav left"
                    onClick={() => scrollTrack(chapterTrackRef.current, -1, 240)}
                  >
                    <ChevronLeft size={16} />
                  </button>
                )}

                <nav
                  ref={chapterTrackRef}
                  className="watch-chapter-track"
                  aria-label="Apple Watch family navigation"
                  onScroll={() => syncScroll(chapterTrackRef.current, setChapterScroll)}
                >
                  {visibleChapterItems.map((item) => {
                    const inner = (
                      <>
                        <span className="watch-chapter-thumb">
                          <img src={item.image} alt={item.alt} />
                        </span>
                        <span className="watch-chapter-label">{item.label}</span>
                        {item.badge && <span className="watch-chapter-badge">{item.badge}</span>}
                      </>
                    );
                    if (item.openCompareModal) {
                      return (
                        <button
                          key={item.id}
                          type="button"
                          className="watch-chapter-item"
                          data-testid={`watch-chapter-${item.id}`}
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
                        className="watch-chapter-item"
                        data-testid={`watch-chapter-${item.id}`}
                      >
                        {inner}
                      </Link>
                    );
                  })}
                </nav>

                {chapterScroll.canRight && (
                  <button
                    type="button"
                    className="watch-chapter-paddle next"
                    aria-label="Scroll Apple Watch nav right"
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

      case "explore-lineup": {
        return (
          <section
            key={section.id}
            id="explore-lineup"
            className="watch-lineup-section"
            data-testid="watch-explore-lineup"
          >
            <div className="watch-container">
              <div className="watch-section-head">
                <h2 className="watch-section-heading">{config.lineupSection.heading}</h2>
                <div className="watch-section-actions">
                  <button
                    type="button"
                    className="watch-link-gold"
                    data-testid="watch-compare-models-btn"
                    onClick={() => setCompareOpen(true)}
                  >
                    <span>{config.lineupSection.compareLabel}</span>
                    <ChevronRight size={16} aria-hidden="true" />
                  </button>
                  <Link
                    to={config.lineupSection.shopAllTo}
                    className="watch-link-gold"
                    data-testid="watch-shop-all-link"
                  >
                    <ShoppingBag size={16} className="watch-gold-bag-icon" aria-hidden="true" />
                    <span>{config.lineupSection.shopAllLabel}</span>
                    <ChevronRight size={16} aria-hidden="true" />
                  </Link>
                </div>
              </div>

              <div className="watch-lineup-grid">
                {visibleLineupCards.map((card) => {
                  const meta = resolvePriceAndAction(
                    card.productSlug,
                    card.fallbackPriceText,
                    card.buyLabel || "Buy"
                  );

                  return (
                    <article
                      key={card.id}
                      className="watch-lineup-card"
                      data-testid={`watch-lineup-card-${card.id}`}
                    >
                      <Link
                        to={card.buyTo}
                        className={`watch-lineup-tile tone-${card.tileTone}`}
                        aria-label={`View ${card.title}`}
                      >
                        <img src={card.image} alt={card.alt} loading="lazy" />
                      </Link>

                      <div className="watch-swatches" aria-label={`${card.title} finishes`}>
                        {(card.swatches || []).map((sw) => (
                          <span
                            key={sw.label}
                            className="watch-swatch-dot"
                            title={sw.label}
                            style={{ backgroundColor: sw.hex }}
                          />
                        ))}
                      </div>

                      <div className="watch-lineup-badge">{card.badge || ""}</div>
                      <h3 className="watch-lineup-title">{card.title}</h3>
                      <p className="watch-lineup-desc">{card.description}</p>
                      <p className="watch-lineup-price">{meta.priceText}</p>
                      <p className="watch-lineup-note">{card.priceNote || ""}</p>

                      <div className="watch-lineup-ctas">
                        <Link
                          to={card.buyTo}
                          className="watch-btn-gold-pill"
                          data-testid={`watch-buy-btn-${card.id}`}
                        >
                          <ShoppingBag size={14} aria-hidden="true" />
                          <span>{meta.ctaLabel}</span>
                        </Link>
                        <Link to={card.learnMoreTo} className="watch-link-gold">
                          <span>{card.learnMoreLabel}</span>
                          <ChevronRight size={15} aria-hidden="true" />
                        </Link>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          </section>
        );
      }

      case "why-shop-watch": {
        return (
          <section key={section.id} className="watch-why-section" data-testid="watch-why-shop">
            <div className="watch-container">
              <div className="watch-section-head">
                <h2 className="watch-section-heading">{config.whyShopSection.heading}</h2>
                <Link to={config.whyShopSection.actionTo} className="watch-link-gold">
                  <ShoppingBag size={16} className="watch-gold-bag-icon" aria-hidden="true" />
                  <span>{config.whyShopSection.actionLabel}</span>
                  <ChevronRight size={16} aria-hidden="true" />
                </Link>
              </div>
            </div>

            <div
              ref={whyTrackRef}
              className="watch-carousel-bleed"
              onScroll={() => syncScroll(whyTrackRef.current, setWhyScroll)}
            >
              <div className="watch-carousel-track">
                {visibleWhyCards.map((card) => (
                  <article
                    key={card.id}
                    className="watch-why-card"
                    data-testid={`watch-why-card-${card.id}`}
                  >
                    <div>
                      <p className="watch-why-eyebrow">{card.eyebrow}</p>
                      <h3 className="watch-why-title">{card.title}</h3>
                      <p className="watch-why-desc">{card.description}</p>
                    </div>

                    <div className="watch-why-media">
                      <img src={card.image} alt={card.alt} loading="lazy" />
                    </div>

                    {card.actionStyle === "link" ? (
                      <Link
                        to={card.actionTo}
                        className="watch-why-trigger"
                        aria-label={`${card.title} - ${card.actionLabel}`}
                      >
                        <ChevronRight size={18} />
                      </Link>
                    ) : (
                      <button
                        type="button"
                        className="watch-why-trigger"
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

            <div className="watch-container">
              <div className="watch-carousel-nav-row">
                <button
                  type="button"
                  className="watch-circle-arrow"
                  aria-label="Previous Apple Watch benefits"
                  data-testid="watch-why-prev"
                  disabled={!whyScroll.canLeft}
                  onClick={() => scrollTrack(whyTrackRef.current, -1)}
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  type="button"
                  className="watch-circle-arrow"
                  aria-label="Next Apple Watch benefits"
                  data-testid="watch-why-next"
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

      case "watch-essentials": {
        const b = config.essentialsBanner;
        return (
          <section key={section.id} className="watch-essentials-section" data-testid="watch-essentials-section">
            <div className="watch-container">
              <div className="watch-section-head">
                <h2 className="watch-section-heading">{b.sectionHeading}</h2>
                <Link to={b.sectionActionTo} className="watch-link-gold">
                  <span>{b.sectionActionLabel}</span>
                  <ChevronRight size={16} aria-hidden="true" />
                </Link>
              </div>

              <div className="watch-essentials-banner">
                <div className="watch-essentials-copy">
                  <h3 className="watch-essentials-title">{b.title}</h3>
                  <p className="watch-essentials-desc">{b.description}</p>
                  {b.priceNote && <p className="watch-essentials-price">{b.priceNote}</p>}
                  <div className="watch-essentials-ctas">
                    <Link to={b.ctaTo} className="watch-btn-gold-pill">
                      <ShoppingBag size={14} aria-hidden="true" />
                      <span>{b.ctaLabel}</span>
                    </Link>
                    {b.secondaryLabel && b.secondaryTo && (
                      <Link to={b.secondaryTo} className="watch-link-gold">
                        <span>{b.secondaryLabel}</span>
                        <ChevronRight size={15} aria-hidden="true" />
                      </Link>
                    )}
                  </div>
                </div>

                <div className="watch-essentials-media">
                  <img src={b.image} alt={b.alt} loading="lazy" />
                </div>
              </div>
            </div>
          </section>
        );
      }

      case "made-for-each-other": {
        return (
          <section key={section.id} className="watch-eco-section" data-testid="watch-ecosystem-section">
            <div className="watch-container">
              <div className="watch-section-head">
                <h2 className="watch-section-heading">{config.ecosystemSection.heading}</h2>
                <Link to={config.ecosystemSection.actionTo} className="watch-link-gold">
                  <span>{config.ecosystemSection.actionLabel}</span>
                  <ChevronRight size={16} aria-hidden="true" />
                </Link>
              </div>

              <div className="watch-eco-card">
                <div>
                  {visibleEcoItems.map((item) => {
                    const isOpen = activeEcoItem?.id === item.id;
                    return (
                      <div key={item.id} className={`watch-eco-item ${isOpen ? "is-open" : ""}`}>
                        <button
                          type="button"
                          className="watch-eco-trigger"
                          aria-expanded={isOpen}
                          data-testid={`watch-eco-trigger-${item.id}`}
                          onClick={() => setActiveEcoId(item.id)}
                        >
                          <span>{item.title}</span>
                          <ChevronDown size={20} className="watch-eco-chevron" />
                        </button>
                        {isOpen && (
                          <div className="watch-eco-panel" data-testid={`watch-eco-panel-${item.id}`}>
                            <p className="watch-eco-desc">{item.description}</p>
                            <Link to={item.linkTo} className="watch-link-gold">
                              <span>{item.linkLabel}</span>
                              <ChevronRight size={15} aria-hidden="true" />
                            </Link>
                            <div className="watch-eco-inline-media">
                              <img src={item.image} alt={item.alt} className="watch-eco-inline-img" />
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {activeEcoItem && (
                  <div className="watch-eco-stage">
                    <img
                      src={activeEcoItem.image}
                      alt={activeEcoItem.alt}
                      data-testid="watch-eco-desktop-image"
                    />
                  </div>
                )}
              </div>
            </div>
          </section>
        );
      }

      case "watch-directory-footer": {
        return (
          <section key={section.id} className="watch-directory-section" data-testid="watch-directory-footer">
            <div className="watch-container">
              <div className="watch-directory-head">
                <h2 className="watch-directory-title">{config.directoryFooter.heading}</h2>
                <span className="watch-directory-tagline">{config.directoryFooter.tagline}</span>
              </div>

              <div className="watch-directory-grid">
                {config.directoryFooter.columns.map((col) => (
                  <div key={col.id}>
                    <h3 className="watch-directory-col-title">{col.heading}</h3>
                    <ul className="watch-directory-links">
                      {col.links.map((lnk) => (
                        <li key={lnk.id}>
                          {lnk.openCompareModal ? (
                            <button
                              type="button"
                              className="watch-directory-link"
                              onClick={() => setCompareOpen(true)}
                            >
                              {lnk.label}
                            </button>
                          ) : (
                            <Link
                              to={lnk.to}
                              className={`watch-directory-link ${
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

              <div className="watch-footnotes">
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
            style={{ background: section.backgroundColor || "#ffffff", padding: "64px 0" }}
          >
            <div className="watch-container">
              <div
                style={{
                  borderRadius: 28,
                  padding: 36,
                  background: section.backgroundColor === "#f5f5f7" ? "#ffffff" : "#f5f5f7",
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                  gap: 28,
                  alignItems: "center",
                }}
              >
                <div>
                  {section.eyebrow && <p className="watch-why-eyebrow">{section.eyebrow}</p>}
                  <h2 className="watch-section-heading" style={{ fontSize: "clamp(26px, 3vw, 38px)" }}>
                    {section.heading}
                  </h2>
                  {section.description && (
                    <p style={{ margin: "12px 0 20px", fontSize: 15, color: "#6e6e73" }}>
                      {section.description}
                    </p>
                  )}
                  {section.buttonLabel && section.buttonDestination && (
                    <Link to={section.buttonDestination} className="watch-btn-gold-pill">
                      <ShoppingBag size={14} aria-hidden="true" />
                      <span>{section.buttonLabel}</span>
                    </Link>
                  )}
                </div>
                {section.desktopImage && (
                  <img
                    src={section.desktopImage}
                    alt={section.imageAlt || section.heading}
                    style={{ width: "100%", maxHeight: 340, objectFit: "cover", borderRadius: 20 }}
                  />
                )}
              </div>
            </div>
          </section>
        );
      }
    }
  };

  return (
    <div className="watch-page" data-testid="watch-redesign-page">
      {visibleSections.map((sec) => renderSection(sec))}

      <WatchCompareModal
        open={compareOpen}
        onClose={() => setCompareOpen(false)}
        cards={visibleLineupCards}
        productsBySlug={productsBySlug}
      />

      {activeBenefitModal && (
        <div
          className="watch-modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="watch-benefit-modal-title"
          data-testid="watch-benefit-modal"
          onClick={(e) => {
            if (e.target === e.currentTarget) setActiveBenefitModal(null);
          }}
        >
          <div className="watch-modal-dialog">
            <button
              type="button"
              className="watch-modal-close"
              aria-label="Close benefit details"
              onClick={() => setActiveBenefitModal(null)}
            >
              <X size={18} />
            </button>
            <p className="watch-why-eyebrow">{activeBenefitModal.eyebrow}</p>
            <h2 id="watch-benefit-modal-title" style={{ margin: "0 0 12px", fontSize: 28, fontWeight: 700 }}>
              {activeBenefitModal.title}
            </h2>
            <p style={{ margin: "0 0 14px", fontSize: 15.5, lineHeight: 1.58 }}>
              {activeBenefitModal.description}
            </p>
            {activeBenefitModal.modalDetails && (
              <p style={{ margin: "0 0 24px", fontSize: 15, lineHeight: 1.58, color: "#6e6e73" }}>
                {activeBenefitModal.modalDetails}
              </p>
            )}
            <Link
              to={activeBenefitModal.actionTo}
              className="watch-btn-gold-pill"
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
