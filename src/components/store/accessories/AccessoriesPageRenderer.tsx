import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Headphones,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Truck,
  X,
} from "lucide-react";
import { useCms } from "../../../cms/CmsContext";
import { defaultAccessoriesPageConfig } from "../../../cms/accessoriesPageDefaults";
import type {
  AccessoriesPageConfig,
  AccessoriesPageSection,
  AccessoriesWhyCard,
} from "../../../cms/types";
import { useProductCatalog } from "../../../catalog/ProductCatalogContext";
import { getPublicPurchaseAction } from "../../../catalog/productPurchaseAction";
import type { Product } from "../../../types/product";
import { getCardPriceDisplay } from "../../../utils/productPricing";
import "../../../styles/accessories-page.css";

interface AccessoriesPageRendererProps {
  configOverride?: AccessoriesPageConfig;
}

export function AccessoriesPageRenderer({ configOverride }: AccessoriesPageRendererProps) {
  const { accessoriesPage } = useCms();
  const { activeProducts } = useProductCatalog();
  const config = configOverride || accessoriesPage || defaultAccessoriesPageConfig;

  const [activeSlideIdx, setActiveSlideIdx] = useState(0);
  const [activeTabId, setActiveTabId] = useState<string>(
    () => config.topPicksSection.tabs[0]?.id || "featured"
  );
  const [activeWhyModal, setActiveWhyModal] = useState<AccessoriesWhyCard | null>(null);
  const whyTrackRef = useRef<HTMLDivElement | null>(null);
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

  const visibleCatItems = useMemo(
    () => [...(config.categoryNavItems || [])].filter((i) => i.visible !== false).sort((a, b) => a.order - b.order),
    [config.categoryNavItems]
  );

  const visibleSlides = useMemo(
    () => [...(config.whatsNewSection?.slides || [])].filter((s) => s.visible !== false).sort((a, b) => a.order - b.order),
    [config.whatsNewSection?.slides]
  );

  const visibleWhyCards = useMemo(
    () => [...(config.whyBuySection?.cards || [])].filter((c) => c.visible !== false).sort((a, b) => a.order - b.order),
    [config.whyBuySection?.cards]
  );

  const safeSlideIdx = visibleSlides.length > 0 ? activeSlideIdx % visibleSlides.length : 0;
  const activeSlide = visibleSlides[safeSlideIdx] || visibleSlides[0];
  const activeTab =
    config.topPicksSection.tabs.find((t) => t.id === activeTabId) || config.topPicksSection.tabs[0];

  useEffect(() => {
    if (!activeWhyModal) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActiveWhyModal(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activeWhyModal]);

  const syncWhyScroll = () => {
    const el = whyTrackRef.current;
    if (!el) return;
    const maxScroll = el.scrollWidth - el.clientWidth;
    setWhyScroll({ canLeft: el.scrollLeft > 8, canRight: maxScroll - el.scrollLeft > 8 });
  };

  useEffect(() => {
    syncWhyScroll();
    const t = window.setTimeout(syncWhyScroll, 300);
    window.addEventListener("resize", syncWhyScroll);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener("resize", syncWhyScroll);
    };
  }, [visibleWhyCards.length]);

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

  const renderWhyIcon = (kind: AccessoriesWhyCard["icon"]) => {
    switch (kind) {
      case "delivery":
        return <Truck size={28} strokeWidth={1.6} />;
      case "verified":
        return <ShieldCheck size={28} strokeWidth={1.6} />;
      case "bundle":
        return <Sparkles size={28} strokeWidth={1.6} />;
      default:
        return <Headphones size={28} strokeWidth={1.6} />;
    }
  };

  const renderSection = (section: AccessoriesPageSection) => {
    switch (section.builtInKey) {
      case "header-category-strip": {
        return (
          <section key={section.id} className="acc-header-section" data-testid="acc-header-section">
            <div className="acc-container">
              <div className="acc-header-top">
                <h1 className="acc-hero-title">
                  {config.hero.heading}
                  {config.hero.showGoldPeriod !== false && <span className="acc-hero-gold-dot">.</span>}
                </h1>
                <div className="acc-header-links">
                  <Link to={config.hero.specialistTo} className="acc-link-gold">
                    <span>{config.hero.specialistLabel}</span>
                    <ArrowUpRight size={15} aria-hidden="true" />
                  </Link>
                  <Link to={config.hero.showroomTo} className="acc-link-gold">
                    <span>{config.hero.showroomLabel}</span>
                    <ArrowUpRight size={15} aria-hidden="true" />
                  </Link>
                </div>
              </div>

              <nav className="acc-cat-strip" aria-label="Accessories categories">
                {visibleCatItems.map((item) => {
                  const inner = (
                    <>
                      <span className="acc-cat-thumb">
                        <img src={item.image} alt={item.alt} />
                      </span>
                      <span className="acc-cat-label">{item.label}</span>
                    </>
                  );

                  if (item.bentoTabId && item.to.startsWith("#")) {
                    return (
                      <button
                        key={item.id}
                        type="button"
                        className="acc-cat-item"
                        data-testid={`acc-cat-${item.id}`}
                        onClick={() => {
                          setActiveTabId(item.bentoTabId!);
                          document.getElementById("top-picks-bento")?.scrollIntoView({ behavior: "smooth" });
                        }}
                      >
                        {inner}
                      </button>
                    );
                  }

                  return (
                    <Link
                      key={item.id}
                      to={item.to}
                      className="acc-cat-item"
                      data-testid={`acc-cat-${item.id}`}
                    >
                      {inner}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </section>
        );
      }

      case "whats-new-carousel": {
        if (!activeSlide) return null;
        return (
          <section key={section.id} className="acc-whatsnew-section" data-testid="acc-whats-new">
            <div className="acc-container">
              <h2 className="acc-section-heading">{config.whatsNewSection.heading}</h2>

              <article
                className={`acc-hero-slide-card theme-${activeSlide.theme}`}
                data-testid={`acc-hero-slide-${activeSlide.id}`}
              >
                <div className="acc-hero-slide-copy">
                  {activeSlide.badge && <span className="acc-hero-slide-badge">{activeSlide.badge}</span>}
                  <h3 className="acc-hero-slide-title">{activeSlide.title}</h3>
                  <p className="acc-hero-slide-desc">{activeSlide.description}</p>
                  <Link to={activeSlide.ctaTo} className="acc-btn-gold-pill">
                    <ShoppingBag size={14} aria-hidden="true" />
                    <span>{activeSlide.ctaLabel}</span>
                  </Link>
                </div>

                <div className="acc-hero-slide-media">
                  <img src={activeSlide.image} alt={activeSlide.alt} />
                </div>
              </article>

              {visibleSlides.length > 1 && (
                <div className="acc-hero-dots-bar">
                  <button
                    type="button"
                    className="acc-circle-arrow"
                    aria-label="Previous accessory highlight"
                    data-testid="acc-hero-prev"
                    onClick={() =>
                      setActiveSlideIdx((prev) => (prev - 1 + visibleSlides.length) % visibleSlides.length)
                    }
                  >
                    <ChevronLeft size={18} />
                  </button>

                  <div className="acc-dots-pill" role="tablist" aria-label="Featured accessory slides">
                    {visibleSlides.map((slide, idx) => (
                      <button
                        key={slide.id}
                        type="button"
                        role="tab"
                        aria-selected={idx === safeSlideIdx}
                        aria-label={`Slide ${idx + 1}: ${slide.title}`}
                        className={`acc-dot-btn ${idx === safeSlideIdx ? "is-active" : ""}`}
                        data-testid={`acc-hero-dot-${idx}`}
                        onClick={() => setActiveSlideIdx(idx)}
                      />
                    ))}
                  </div>

                  <button
                    type="button"
                    className="acc-circle-arrow"
                    aria-label="Next accessory highlight"
                    data-testid="acc-hero-next"
                    onClick={() => setActiveSlideIdx((prev) => (prev + 1) % visibleSlides.length)}
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              )}
            </div>
          </section>
        );
      }

      case "top-picks-bento": {
        if (!activeTab) return null;
        const tabItems = [...activeTab.items]
          .filter((item) => item.visible !== false)
          .sort((a, b) => a.order - b.order);

        return (
          <section
            key={section.id}
            id="top-picks-bento"
            className="acc-bento-section"
            data-testid="acc-top-picks"
          >
            <div className="acc-container">
              <h2 className="acc-section-heading" style={{ marginBottom: 20 }}>
                {config.topPicksSection.heading}
              </h2>

              <div className="acc-tabs-bar" role="tablist" aria-label="Accessory collections">
                {config.topPicksSection.tabs.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    aria-selected={tab.id === activeTab.id}
                    className={`acc-tab-pill ${tab.id === activeTab.id ? "is-active" : ""}`}
                    data-testid={`acc-bento-tab-${tab.id}`}
                    onClick={() => setActiveTabId(tab.id)}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="acc-bento-grid" data-testid="acc-bento-grid">
                {tabItems.map((item) => {
                  if (item.span === "editorial") {
                    return (
                      <article
                        key={item.id}
                        className="acc-bento-card span-editorial"
                        data-testid={`acc-bento-item-${item.id}`}
                      >
                        <img
                          src={item.image}
                          alt={item.alt}
                          className="acc-bento-editorial-img"
                        />
                        <div className="acc-bento-editorial-scrim" />
                        <div className="acc-bento-editorial-content">
                          {item.eyebrow && (
                            <span style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", color: "#d8a72d" }}>
                              {item.eyebrow}
                            </span>
                          )}
                          <h3 style={{ margin: 0, fontSize: "clamp(26px, 2.8vw, 34px)", lineHeight: 1.1, fontWeight: 700 }}>
                            {item.title}
                          </h3>
                          {item.subtitle && (
                            <p style={{ margin: "2px 0 8px", fontSize: 15, lineHeight: 1.48, opacity: 0.9 }}>
                              {item.subtitle}
                            </p>
                          )}
                          <Link to={item.to} className="acc-btn-gold-pill">
                            <ShoppingBag size={14} aria-hidden="true" />
                            <span>{item.ctaLabel || "Explore"}</span>
                          </Link>
                        </div>
                      </article>
                    );
                  }

                  const meta = resolvePriceAndAction(
                    item.productSlug,
                    item.fallbackPriceText,
                    item.ctaLabel || "Buy"
                  );

                  return (
                    <article
                      key={item.id}
                      className={`acc-bento-card span-${item.span}`}
                      style={item.tintColor ? { background: item.tintColor } : undefined}
                      data-testid={`acc-bento-item-${item.id}`}
                    >
                      <Link
                        to={item.to}
                        className="acc-bento-prod-media"
                        aria-label={`View ${item.title}`}
                      >
                        <img src={item.image} alt={item.alt} />
                      </Link>

                      {item.swatches && item.swatches.length > 0 && (
                        <div className="acc-bento-swatches">
                          {item.swatches.map((s) => (
                            <span
                              key={s.label}
                              title={s.label}
                              className="acc-bento-swatch"
                              style={{ backgroundColor: s.hex }}
                            />
                          ))}
                        </div>
                      )}

                      {item.badge && <div className="acc-bento-badge">{item.badge}</div>}
                      <h3 className="acc-bento-title">{item.title}</h3>
                      {item.subtitle && <p className="acc-bento-subtitle">{item.subtitle}</p>}

                      <div className="acc-bento-footer-row">
                        <span className="acc-bento-price">{meta.priceText}</span>
                        <Link
                          to={item.to}
                          className="acc-btn-gold-pill"
                          style={{ minHeight: 34, padding: "0 14px", fontSize: 12.5 }}
                          data-testid={`acc-buy-btn-${item.id}`}
                        >
                          <ShoppingBag size={13} aria-hidden="true" />
                          <span>{meta.ctaLabel}</span>
                        </Link>
                      </div>
                    </article>
                  );
                })}
              </div>

              <div className="acc-bento-shopall-wrap">
                <Link
                  to={activeTab.shopAllTo}
                  className="acc-btn-gold-pill"
                  style={{ minHeight: 46, padding: "0 28px", fontSize: 15 }}
                  data-testid="acc-shop-all-link"
                >
                  <ShoppingBag size={16} aria-hidden="true" />
                  <span>{activeTab.shopAllLabel}</span>
                  <ChevronRight size={16} aria-hidden="true" />
                </Link>
              </div>
            </div>
          </section>
        );
      }

      case "why-buy-accessories": {
        return (
          <section key={section.id} className="acc-why-section" data-testid="acc-why-buy">
            <div className="acc-container">
              <h2 className="acc-section-heading">{config.whyBuySection.heading}</h2>
            </div>

            <div ref={whyTrackRef} className="acc-why-bleed" onScroll={syncWhyScroll}>
              <div className="acc-why-track">
                {visibleWhyCards.map((card) => (
                  <article key={card.id} className="acc-why-card" data-testid={`acc-why-card-${card.id}`}>
                    <span className="acc-why-icon" aria-hidden="true">
                      {renderWhyIcon(card.icon)}
                    </span>
                    <h3 className="acc-why-title">{card.title}</h3>
                    <p className="acc-why-desc">{card.description}</p>
                    <button
                      type="button"
                      className="acc-why-plus"
                      aria-label={`Learn more about ${card.title}`}
                      data-testid={`acc-why-trigger-${card.id}`}
                      onClick={() => setActiveWhyModal(card)}
                    >
                      <Plus size={16} />
                    </button>
                  </article>
                ))}
              </div>
            </div>

            <div className="acc-container">
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 12 }}>
                <button
                  type="button"
                  className="acc-circle-arrow"
                  aria-label="Previous accessory benefits"
                  data-testid="acc-why-prev"
                  disabled={!whyScroll.canLeft}
                  onClick={() => whyTrackRef.current?.scrollBy({ left: -360, behavior: "smooth" })}
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  type="button"
                  className="acc-circle-arrow"
                  aria-label="Next accessory benefits"
                  data-testid="acc-why-next"
                  disabled={!whyScroll.canRight}
                  onClick={() => whyTrackRef.current?.scrollBy({ left: 360, behavior: "smooth" })}
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          </section>
        );
      }

      case "accessories-directory-footer": {
        return (
          <section key={section.id} className="acc-directory-section" data-testid="acc-directory-footer">
            <div className="acc-container">
              <div
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  justifyContent: "space-between",
                  gap: 16,
                  marginBottom: 30,
                  flexWrap: "wrap",
                }}
              >
                <h2 style={{ margin: 0, fontSize: "clamp(28px, 3vw, 38px)", fontWeight: 700 }}>
                  {config.directoryFooter.heading}
                </h2>
                <span style={{ fontSize: 14, color: "#6e6e73" }}>{config.directoryFooter.tagline}</span>
              </div>

              <div className="acc-directory-grid">
                {config.directoryFooter.columns.map((col) => (
                  <div key={col.id}>
                    <h3 className="acc-directory-col-title">{col.heading}</h3>
                    <ul className="acc-directory-links">
                      {col.links.map((lnk) => (
                        <li key={lnk.id}>
                          <Link
                            to={lnk.to}
                            className={`acc-directory-link ${
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

              <div className="acc-footnotes">
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
            <div className="acc-container">
              <div style={{ borderRadius: 26, padding: 36, background: "#f5f5f7" }}>
                <h2 style={{ margin: "0 0 10px", fontSize: 30, fontWeight: 700 }}>{section.heading}</h2>
                {section.description && <p style={{ margin: "0 0 18px", color: "#6e6e73" }}>{section.description}</p>}
                {section.buttonLabel && section.buttonDestination && (
                  <Link to={section.buttonDestination} className="acc-btn-gold-pill">
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
    <div className="acc-page" data-testid="accessories-redesign-page">
      {visibleSections.map((sec) => renderSection(sec))}

      {activeWhyModal && (
        <div
          className="acc-modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="acc-why-modal-title"
          data-testid="acc-why-modal"
          onClick={(e) => {
            if (e.target === e.currentTarget) setActiveWhyModal(null);
          }}
        >
          <div className="acc-modal-dialog">
            <button
              type="button"
              className="acc-modal-close"
              aria-label="Close accessory benefit details"
              onClick={() => setActiveWhyModal(null)}
            >
              <X size={16} />
            </button>
            <p style={{ margin: "0 0 8px", fontSize: 13, fontWeight: 700, color: "#9a6f08" }}>
              Buy &amp; Sell GH Accessories
            </p>
            <h2 id="acc-why-modal-title" style={{ margin: "0 0 12px", fontSize: 26, fontWeight: 700 }}>
              {activeWhyModal.modalHeadline}
            </h2>
            <p style={{ margin: "0 0 22px", fontSize: 15, lineHeight: 1.58, color: "#6e6e73" }}>
              {activeWhyModal.modalDetails}
            </p>
            <Link
              to={activeWhyModal.actionTo}
              className="acc-btn-gold-pill"
              onClick={() => setActiveWhyModal(null)}
            >
              <ShoppingBag size={14} aria-hidden="true" />
              <span>{activeWhyModal.actionLabel}</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
