import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  Activity,
  AudioLines,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Ear,
  Headphones,
  MessageCircle,
  Pause,
  Play,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Sliders,
  Sparkles,
  Truck,
  Waves,
} from "lucide-react";
import { useCms } from "../../../cms/CmsContext";
import { defaultAirpodsPageConfig } from "../../../cms/airpodsPageDefaults";
import type {
  AirpodsCompareModel,
  AirpodsPageConfig,
  AirpodsPageSection,
  AirpodsValueStripItem,
} from "../../../cms/types";
import { useProductCatalog } from "../../../catalog/ProductCatalogContext";
import { getPublicPurchaseAction } from "../../../catalog/productPurchaseAction";
import type { Product } from "../../../types/product";
import { getCardPriceDisplay } from "../../../utils/productPricing";
import "../../../styles/airpods-page.css";

interface AirpodsPageRendererProps {
  configOverride?: AirpodsPageConfig;
}

export function AirpodsPageRenderer({ configOverride }: AirpodsPageRendererProps) {
  const { airpodsPage } = useCms();
  const { activeProducts } = useProductCatalog();
  const config = configOverride || airpodsPage || defaultAirpodsPageConfig;

  const [ambientPlaying, setAmbientPlaying] = useState(true);
  const [expandedFeatureIds, setExpandedFeatureIds] = useState<Record<string, boolean>>({});
  const featureTrackRef = useRef<HTMLDivElement | null>(null);
  const [featureScroll, setFeatureScroll] = useState({ canLeft: false, canRight: true });

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

  const visibleHeroCards = useMemo(
    () => [...(config.heroShowcases || [])].filter((c) => c.visible !== false).sort((a, b) => a.order - b.order),
    [config.heroShowcases]
  );

  const visibleCompareModels = useMemo(
    () => [...(config.compareSection?.models || [])].filter((m) => m.visible !== false).sort((a, b) => a.order - b.order),
    [config.compareSection?.models]
  );

  const visibleFeatureCards = useMemo(
    () => [...(config.featureCarouselSection?.cards || [])].filter((c) => c.visible !== false).sort((a, b) => a.order - b.order),
    [config.featureCarouselSection?.cards]
  );

  const syncFeatureScroll = () => {
    const el = featureTrackRef.current;
    if (!el) return;
    const maxScroll = el.scrollWidth - el.clientWidth;
    setFeatureScroll({ canLeft: el.scrollLeft > 8, canRight: maxScroll - el.scrollLeft > 8 });
  };

  useEffect(() => {
    syncFeatureScroll();
    const timer = window.setTimeout(syncFeatureScroll, 300);
    window.addEventListener("resize", syncFeatureScroll);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("resize", syncFeatureScroll);
    };
  }, [visibleFeatureCards.length]);

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

  const renderCompareCells = (models: AirpodsCompareModel[]) => (
    <>
      {models.map((m) => {
        const meta = resolvePriceAndAction(m.productSlug, m.fallbackPriceText, m.buyLabel || "Buy");
        return (
          <div key={m.id} className="airpods-compare-header-cell" data-testid={`airpods-compare-col-${m.id}`}>
            <div className="airpods-compare-img-wrap">
              <img src={m.image} alt={m.alt} />
            </div>
            <div className="airpods-compare-badge">{m.badge || ""}</div>
            <h3 className="airpods-compare-model-name">{m.title}</h3>
            <p className="airpods-compare-model-sub">{m.subtitle}</p>
            <p className="airpods-compare-price">{meta.priceText}</p>
            <div className="airpods-compare-ctas">
              <Link
                to={m.buyTo}
                className="airpods-btn-gold-pill"
                style={{ minHeight: 36, fontSize: 13.5, padding: "0 16px" }}
                data-testid={`airpods-compare-buy-${m.id}`}
              >
                <ShoppingBag size={13} aria-hidden="true" />
                <span>{meta.ctaLabel}</span>
              </Link>
              <Link to={m.learnMoreTo} className="airpods-link-gold" style={{ fontSize: 13.5 }}>
                <span>{m.learnMoreLabel}</span>
                <ChevronRight size={14} aria-hidden="true" />
              </Link>
            </div>
          </div>
        );
      })}

      {/* Row 1: ANC */}
      {models.map((m) => (
        <div key={`${m.id}-anc`} className="airpods-compare-spec-cell">
          {m.ancSpec === "—" ? (
            <span className="airpods-spec-dash">—</span>
          ) : (
            <>
              <Waves size={22} className="airpods-spec-icon" aria-hidden="true" />
              <span>{m.ancSpec}</span>
            </>
          )}
        </div>
      ))}

      {/* Row 2: Adaptive Audio / Spatial */}
      {models.map((m) => (
        <div key={`${m.id}-adaptive`} className="airpods-compare-spec-cell">
          <AudioLines size={22} className="airpods-spec-icon" aria-hidden="true" />
          <span>{m.adaptiveSpec}</span>
        </div>
      ))}

      {/* Row 3: Workout / Fit */}
      {models.map((m) => (
        <div key={`${m.id}-workout`} className="airpods-compare-spec-cell">
          <Activity size={22} className="airpods-spec-icon" aria-hidden="true" />
          <span>{m.workoutSpec}</span>
        </div>
      ))}

      {/* Row 4: Hearing & Sound Clarity */}
      {models.map((m) => (
        <div key={`${m.id}-hearing`} className="airpods-compare-spec-cell">
          <Ear size={22} className="airpods-spec-icon" aria-hidden="true" />
          <span>{m.hearingSpec}</span>
        </div>
      ))}

      {/* Row 5: Smart Features & Siri */}
      {models.map((m) => (
        <div key={`${m.id}-siri`} className="airpods-compare-spec-cell">
          <Sparkles size={22} className="airpods-spec-icon" aria-hidden="true" />
          <span>{m.siriSpec}</span>
        </div>
      ))}

      {/* Row 6: Controls */}
      {models.map((m) => (
        <div key={`${m.id}-ctrl`} className="airpods-compare-spec-cell">
          <Sliders size={22} className="airpods-spec-icon" aria-hidden="true" />
          <span>{m.controlsSpec}</span>
        </div>
      ))}

      {/* Row 7: Battery Hours */}
      {models.map((m) => (
        <div key={`${m.id}-bat`} className="airpods-compare-spec-cell" style={{ borderBottom: 0 }}>
          <span className="airpods-spec-hours">{m.batteryHours}</span>
          <span>{m.batteryCaption}</span>
        </div>
      ))}
    </>
  );

  const renderValueIcon = (kind: AirpodsValueStripItem["icon"]) => {
    switch (kind) {
      case "delivery":
        return <Truck size={22} />;
      case "installments":
        return <CreditCard size={22} />;
      case "support":
        return <MessageCircle size={22} />;
      default:
        return <ShieldCheck size={22} />;
    }
  };

  const renderSection = (section: AirpodsPageSection) => {
    switch (section.builtInKey) {
      case "chapter-nav": {
        return (
          <section key={section.id} className="airpods-chapter-section" data-testid="airpods-chapter-nav">
            <div className="airpods-container">
              <nav className="airpods-chapter-track" aria-label="AirPods family navigation">
                {visibleChapterItems.map((item) => {
                  const content = (
                    <>
                      <span className="airpods-chapter-thumb">
                        <img src={item.image} alt={item.alt} />
                      </span>
                      <span className="airpods-chapter-label">{item.label}</span>
                      {item.badge && <span className="airpods-chapter-badge">{item.badge}</span>}
                    </>
                  );
                  if (item.scrollTarget) {
                    return (
                      <button
                        key={item.id}
                        type="button"
                        className="airpods-chapter-item"
                        data-testid={`airpods-chapter-${item.id}`}
                        onClick={() => {
                          document.getElementById(item.scrollTarget!)?.scrollIntoView({ behavior: "smooth" });
                        }}
                      >
                        {content}
                      </button>
                    );
                  }
                  return (
                    <Link
                      key={item.id}
                      to={item.to}
                      className="airpods-chapter-item"
                      data-testid={`airpods-chapter-${item.id}`}
                    >
                      {content}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </section>
        );
      }

      case "promo-ribbon": {
        if (!config.promoRibbon?.enabled) return null;
        return (
          <div key={section.id} className="airpods-promo-ribbon" data-testid="airpods-promo-ribbon">
            <span>{config.promoRibbon.text}</span>
            <Link to={config.promoRibbon.linkTo}>
              <span>{config.promoRibbon.linkLabel}</span>
              <ChevronRight size={14} aria-hidden="true" />
            </Link>
          </div>
        );
      }

      case "hero-showcases": {
        return (
          <section key={section.id} className="airpods-hero-stack" data-testid="airpods-hero-showcases">
            <div className="airpods-container">
              <div className="airpods-hero-list">
                {visibleHeroCards.map((card, idx) => {
                  const meta = resolvePriceAndAction(
                    card.productSlug,
                    card.fallbackPriceText,
                    card.buyLabel || "Buy"
                  );
                  const isDark = card.variant === "backlit-dark";
                  const HeadingTag = idx === 0 ? "h1" : "h2";

                  return (
                    <article
                      key={card.id}
                      className={`airpods-hero-tile variant-${card.variant} ${
                        isDark && ambientPlaying ? "is-ambient-playing" : ""
                      }`}
                      data-testid={`airpods-hero-card-${card.id}`}
                    >
                      {isDark ? (
                        <>
                          <img src={card.image} alt={card.alt} className="airpods-hero-bg-photo" />
                          <div className="airpods-hero-scrim" />
                          {card.showMotionToggle && (
                            <button
                              type="button"
                              className="airpods-hero-motion-btn"
                              aria-label={ambientPlaying ? "Pause ambient motion" : "Play ambient motion"}
                              data-testid="airpods-hero-motion-toggle"
                              onClick={() => setAmbientPlaying((v) => !v)}
                            >
                              {ambientPlaying ? <Pause size={16} /> : <Play size={16} />}
                            </button>
                          )}
                        </>
                      ) : (
                        <div className="airpods-hero-studio-stage">
                          {card.variant === "wordmark-light" && (
                            <span className="airpods-hero-wordmark" aria-hidden="true">
                              {card.wordmarkText || card.title}
                            </span>
                          )}
                          <img src={card.image} alt={card.alt} />
                        </div>
                      )}

                      <div className="airpods-hero-footer">
                        <div>
                          <HeadingTag className="airpods-hero-title">{card.title}</HeadingTag>
                          <p className="airpods-hero-sub">{card.subtitle}</p>
                          {meta.priceText && <p className="airpods-hero-price">{meta.priceText}</p>}
                        </div>

                        <div className="airpods-hero-ctas">
                          <Link
                            to={card.buyTo}
                            className="airpods-btn-gold-pill"
                            data-testid={`airpods-hero-buy-${card.id}`}
                          >
                            <ShoppingBag size={14} aria-hidden="true" />
                            <span>{meta.ctaLabel}</span>
                          </Link>
                          <Link
                            to={card.learnMoreTo}
                            className={isDark ? "airpods-btn-outline-light" : "airpods-btn-outline-dark"}
                          >
                            <span>{card.learnMoreLabel}</span>
                            <ChevronRight size={15} aria-hidden="true" />
                          </Link>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          </section>
        );
      }

      case "compare-models": {
        const pairA = visibleCompareModels.slice(0, 2);
        const pairB = visibleCompareModels.slice(2, 4);

        return (
          <section
            key={section.id}
            id="airpods-compare"
            className="airpods-compare-section"
            data-testid="airpods-compare-section"
          >
            <div className="airpods-container">
              <h2 className="airpods-centered-heading">{config.compareSection.heading}</h2>

              {/* Desktop 4-Column Comparison Matrix */}
              <div className="airpods-compare-desktop-grid">
                {renderCompareCells(visibleCompareModels)}
              </div>

              {/* Mobile 2x2 Sub-Grids (exact Apple AirPods mobile pattern!) */}
              <div className="airpods-compare-mobile-pairs">
                {pairA.length > 0 && (
                  <div className="airpods-compare-mobile-pair">{renderCompareCells(pairA)}</div>
                )}
                {pairB.length > 0 && (
                  <div className="airpods-compare-mobile-pair">{renderCompareCells(pairB)}</div>
                )}
              </div>

              <div className="airpods-compare-footer-link">
                <Link
                  to={config.compareSection.shopAllTo}
                  className="airpods-link-gold"
                  style={{ fontSize: 17 }}
                  data-testid="airpods-shop-all-link"
                >
                  <ShoppingBag size={17} style={{ color: "#d8a72d" }} aria-hidden="true" />
                  <span>{config.compareSection.shopAllLabel}</span>
                  <ChevronRight size={17} aria-hidden="true" />
                </Link>
              </div>
            </div>
          </section>
        );
      }

      case "get-to-know": {
        return (
          <section key={section.id} className="airpods-features-section" data-testid="airpods-get-to-know">
            <div className="airpods-container">
              <h2 className="airpods-centered-heading" style={{ marginBottom: 38 }}>
                {config.featureCarouselSection.heading}
              </h2>
            </div>

            <div
              ref={featureTrackRef}
              className="airpods-carousel-bleed"
              onScroll={syncFeatureScroll}
            >
              <div className="airpods-carousel-track">
                {visibleFeatureCards.map((card) => {
                  const isOpen = Boolean(expandedFeatureIds[card.id]);
                  return (
                    <article
                      key={card.id}
                      className={`airpods-feature-card theme-${card.theme}`}
                      data-testid={`airpods-feature-card-${card.id}`}
                    >
                      <img src={card.image} alt={card.alt} className="airpods-feature-bg" />

                      <div className="airpods-feature-top">
                        <p className="airpods-feature-eyebrow">{card.eyebrow}</p>
                        <h3 className="airpods-feature-headline">{card.headline}</h3>
                      </div>

                      {isOpen && (
                        <div
                          className="airpods-feature-overlay"
                          data-testid={`airpods-feature-overlay-${card.id}`}
                        >
                          <p className="airpods-feature-eyebrow" style={{ color: "#9a6f08" }}>
                            {card.eyebrow}
                          </p>
                          <h4 style={{ margin: "0 0 12px", fontSize: 22, fontWeight: 700 }}>
                            {card.headline}
                          </h4>
                          <p style={{ margin: 0, fontSize: 15, lineHeight: 1.58 }}>
                            {card.expandedCopy}
                          </p>
                        </div>
                      )}

                      <button
                        type="button"
                        className={`airpods-feature-toggle ${isOpen ? "is-open" : ""}`}
                        aria-expanded={isOpen}
                        aria-label={isOpen ? `Close ${card.eyebrow} details` : `Learn more about ${card.eyebrow}`}
                        data-testid={`airpods-feature-toggle-${card.id}`}
                        onClick={() =>
                          setExpandedFeatureIds((prev) => ({ ...prev, [card.id]: !prev[card.id] }))
                        }
                      >
                        <Plus size={18} />
                      </button>
                    </article>
                  );
                })}
              </div>
            </div>

            <div className="airpods-container">
              <div className="airpods-carousel-nav-row">
                <button
                  type="button"
                  className="airpods-circle-arrow"
                  aria-label="Previous AirPods features"
                  data-testid="airpods-feat-prev"
                  disabled={!featureScroll.canLeft}
                  onClick={() => featureTrackRef.current?.scrollBy({ left: -384, behavior: "smooth" })}
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  type="button"
                  className="airpods-circle-arrow"
                  aria-label="Next AirPods features"
                  data-testid="airpods-feat-next"
                  disabled={!featureScroll.canRight}
                  onClick={() => featureTrackRef.current?.scrollBy({ left: 384, behavior: "smooth" })}
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          </section>
        );
      }

      case "assurance-banner": {
        const b = config.assuranceBanner;
        return (
          <section key={section.id} className="airpods-assurance-section" data-testid="airpods-assurance-banner">
            <div className="airpods-container">
              <div className="airpods-assurance-card">
                <div className="airpods-assurance-copy">
                  <p className="airpods-assurance-eyebrow">
                    <Headphones size={14} style={{ display: "inline", marginRight: 6, verticalAlign: "-2px" }} />
                    {b.eyebrow}
                  </p>
                  <h2 className="airpods-assurance-title">{b.heading}</h2>
                  <p className="airpods-assurance-desc">{b.description}</p>
                  <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
                    <Link to={b.ctaTo} className="airpods-btn-gold-pill">
                      <ShoppingBag size={14} aria-hidden="true" />
                      <span>{b.ctaLabel}</span>
                    </Link>
                    {b.secondaryLabel && b.secondaryTo && (
                      <Link to={b.secondaryTo} className="airpods-link-gold">
                        <span>{b.secondaryLabel}</span>
                        <ChevronRight size={15} aria-hidden="true" />
                      </Link>
                    )}
                  </div>
                </div>
                <div className="airpods-assurance-media">
                  <img src={b.image} alt={b.alt} />
                </div>
              </div>
            </div>
          </section>
        );
      }

      case "value-strip": {
        return (
          <section key={section.id} className="airpods-valuestrip-section" data-testid="airpods-value-strip">
            <div className="airpods-container">
              <div className="airpods-valuestrip-grid">
                {config.valueStrip.map((item) => (
                  <div key={item.id} className="airpods-value-col">
                    <span className="airpods-value-icon" aria-hidden="true">
                      {renderValueIcon(item.icon)}
                    </span>
                    <h3 className="airpods-value-title">{item.title}</h3>
                    <p className="airpods-value-desc">{item.description}</p>
                    <Link to={item.linkTo} className="airpods-link-gold" style={{ fontSize: 14 }}>
                      <span>{item.linkLabel}</span>
                      <ChevronRight size={14} aria-hidden="true" />
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </section>
        );
      }

      case "airpods-directory-footer": {
        return (
          <section key={section.id} className="airpods-directory-section" data-testid="airpods-directory-footer">
            <div className="airpods-container">
              <div
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  justifyContent: "space-between",
                  gap: 16,
                  marginBottom: 28,
                  flexWrap: "wrap",
                }}
              >
                <h2 style={{ margin: 0, fontSize: "clamp(28px, 3vw, 38px)", fontWeight: 700 }}>
                  {config.directoryFooter.heading}
                </h2>
                <span style={{ fontSize: 14, color: "#6e6e73" }}>{config.directoryFooter.tagline}</span>
              </div>

              <div className="airpods-directory-grid">
                {config.directoryFooter.columns.map((col) => (
                  <div key={col.id}>
                    <h3 className="airpods-directory-col-title">{col.heading}</h3>
                    <ul className="airpods-directory-links">
                      {col.links.map((lnk) => (
                        <li key={lnk.id}>
                          <Link
                            to={lnk.to}
                            className={`airpods-directory-link ${
                              col.primaryStyle && !lnk.isSecondary ? "is-primary" : ""
                            }`}
                          >
                            {lnk.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              <div className="airpods-footnotes">
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
          <section key={section.id} style={{ background: section.backgroundColor || "#ffffff", padding: "56px 0" }}>
            <div className="airpods-container">
              <div style={{ borderRadius: 28, padding: 36, background: "#f5f5f7" }}>
                <h2 style={{ margin: "0 0 10px", fontSize: 30, fontWeight: 700 }}>{section.heading}</h2>
                {section.description && <p style={{ margin: "0 0 18px", color: "#6e6e73" }}>{section.description}</p>}
                {section.buttonLabel && section.buttonDestination && (
                  <Link to={section.buttonDestination} className="airpods-btn-gold-pill">
                    <ShoppingBag size={14} aria-hidden="true" />
                    <span>{section.buttonLabel}</span>
                  </Link>
                )}
              </div>
            </div>
          </section>
        );
      }
    }
  };

  return (
    <div className="airpods-page" data-testid="airpods-redesign-page">
      {visibleSections.map((sec) => (
        <Fragment key={sec.id}>{renderSection(sec)}</Fragment>
      ))}
    </div>
  );
}
