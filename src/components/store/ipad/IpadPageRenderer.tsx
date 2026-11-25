import { ChevronDown, ChevronLeft, ChevronRight, Plus, ShoppingBag, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useCms } from "../../../cms/CmsContext";
import { defaultIpadPageConfig } from "../../../cms/ipadPageDefaults";
import type {
  IpadBenefitCard,
  IpadChapterNavItem,
  IpadEssentialCard,
  IpadLineupCard,
  IpadPageConfig,
  IpadPageSection,
} from "../../../cms/types";
import { useProductCatalog } from "../../../catalog/ProductCatalogContext";
import { getPublicPurchaseAction } from "../../../catalog/productPurchaseAction";
import type { Product } from "../../../types/product";
import { localCatalogueImageBySlug } from "../../../utils/catalogueProductImages";
import { resolveCatalogueProductImage, resolveProductImage } from "../../../utils/productImages";
import { getCardPriceDisplay } from "../../../utils/productPricing";
import { whatsappUrl } from "../../../utils/whatsapp";
import { IpadCompareModal } from "./IpadCompareModal";
import "../../../styles/ipad-page.css";

interface IpadPageRendererProps {
  configOverride?: IpadPageConfig;
  productsOverride?: Product[];
  previewDevice?: "desktop" | "mobile";
}

function getSafeProductImg(product: Product, fallback = "/products/ipad-redesign/lineup-ipad-air.webp"): string {
  const localExact = localCatalogueImageBySlug[product.slug] || localCatalogueImageBySlug[product.id];
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
  const cleanTo = (to || "/ipad").trim();
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
    const amount = Math.max(290, Math.round(el.clientWidth * 0.72));
    el.scrollBy({ left: dir * amount, behavior: "smooth" });
  };

  return { trackRef, canPrev, canNext, scrollByStep };
}

export function IpadPageRenderer({
  configOverride,
  productsOverride,
  previewDevice,
}: IpadPageRendererProps) {
  const { ipadPage } = useCms();
  const { activeProducts } = useProductCatalog();

  const config: IpadPageConfig = configOverride || ipadPage || defaultIpadPageConfig;
  const allProducts = productsOverride || activeProducts;

  const productBySlug = useMemo(() => {
    const map = new Map<string, Product>();
    for (const p of allProducts) {
      if (p.slug) map.set(p.slug.toLowerCase(), p);
      if (p.id) map.set(p.id.toLowerCase(), p);
    }
    return map;
  }, [allProducts]);

  const [activeEcoId, setActiveEcoId] = useState<string>(
    () => config.ecosystemSection.items.find((i) => i.visible !== false)?.id || "eco-ipad-iphone"
  );
  const [activeBenefitModal, setActiveBenefitModal] = useState<IpadBenefitCard | null>(null);
  const [compareOpen, setCompareOpen] = useState(false);

  const visibleSections = useMemo(
    () =>
      [...(config.sections || defaultIpadPageConfig.sections)]
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

  const visibleLineupCards = useMemo(
    () =>
      [...(config.lineupSection.cards || [])]
        .filter((c) => c.visible !== false)
        .sort((a, b) => a.order - b.order),
    [config.lineupSection.cards]
  );

  const visibleWhyCards = useMemo(
    () =>
      [...(config.whyShopSection.cards || [])]
        .filter((c) => c.visible !== false)
        .sort((a, b) => a.order - b.order),
    [config.whyShopSection.cards]
  );

  const visibleEssentialCards = useMemo(
    () =>
      [...(config.essentialsSection.cards || [])]
        .filter((c) => c.visible !== false)
        .sort((a, b) => a.order - b.order),
    [config.essentialsSection.cards]
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

  const chapterCarousel = useHorizontalCarousel([visibleChapterNav.length, previewDevice]);
  const lineupCarousel = useHorizontalCarousel([visibleLineupCards.length, previewDevice]);
  const whyCarousel = useHorizontalCarousel([visibleWhyCards.length, previewDevice]);
  const essentialsCarousel = useHorizontalCarousel([visibleEssentialCards.length, previewDevice]);

  useEffect(() => {
    if (!activeBenefitModal && !compareOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setActiveBenefitModal(null);
        setCompareOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activeBenefitModal, compareOpen]);

  const handleChapterItemClick = (item: IpadChapterNavItem, e: React.MouseEvent) => {
    if (item.openCompareModal || item.to === "#compare-ipad") {
      e.preventDefault();
      setCompareOpen(true);
      return;
    }
    if (item.scrollTarget) {
      e.preventDefault();
      const target = document.getElementById(item.scrollTarget);
      if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const renderLineupCard = (card: IpadLineupCard) => {
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
        : liveProduct
        ? `/shop/buy-ipad/${liveProduct.slug}`
        : card.buyTo;

    const toneClass =
      card.tileTone === "dark"
        ? "is-tone-dark"
        : card.tileTone === "sky"
        ? "is-tone-sky"
        : "is-tone-light";

    return (
      <article
        key={card.id}
        className="ipad-lineup-card"
        data-testid={`ipad-lineup-card-${card.id}`}
      >
        <SmartLink
          to={buyDest}
          className={`ipad-lineup-tile-link ${toneClass}`}
          ariaLabel={`${card.title} — ${buyText}`}
        >
          <img
            src={card.image}
            alt={card.alt || card.title}
            className="ipad-lineup-img"
            loading="eager"
            decoding="async"
            onError={(e) => {
              const img = e.currentTarget;
              if (img.dataset.fallbackApplied) return;
              img.dataset.fallbackApplied = "1";
              img.src = "/products/ipad-redesign/lineup-ipad-air.webp";
            }}
          />
        </SmartLink>

        <div className="ipad-swatch-row" aria-label={card.swatches?.length ? `${card.title} available finishes` : undefined}>
          {(card.swatches || []).map((sw) => (
            <span
              key={`${card.id}-${sw.label}`}
              className="ipad-swatch-dot"
              style={{ backgroundColor: sw.hex }}
              title={sw.label}
            />
          ))}
        </div>

        <div className="ipad-lineup-badge">{card.badge || "\u00A0"}</div>
        <h3 className="ipad-lineup-title">{card.title}</h3>
        {card.chipLine && <div className="ipad-lineup-chip">{card.chipLine}</div>}
        <p className="ipad-lineup-desc">{card.description}</p>

        <div className="ipad-lineup-price-block">
          <div className="ipad-lineup-price">{livePrice}</div>
          {card.priceNote && <div className="ipad-lineup-price-note">{card.priceNote}</div>}
        </div>

        <div className="ipad-lineup-actions">
          <SmartLink
            to={buyDest}
            className="ipad-btn-gold-pill"
            dataTestId={`ipad-buy-btn-${card.id}`}
          >
            <ShoppingBag size={15} strokeWidth={2.2} className="ipad-btn-bag-icon" aria-hidden="true" />
            <span>{buyText}</span>
          </SmartLink>
          {card.learnMoreTo && (
            <SmartLink to={card.learnMoreTo} className="ipad-link-action">
              <span>{card.learnMoreLabel || "Learn more"}</span>
              <ChevronRight size={15} strokeWidth={2.2} aria-hidden="true" />
            </SmartLink>
          )}
        </div>
      </article>
    );
  };

  const renderEssentialCard = (card: IpadEssentialCard) => {
    const liveProduct = card.productSlug ? productBySlug.get(card.productSlug.toLowerCase()) : undefined;
    const livePrice = liveProduct ? getCardPriceDisplay(liveProduct).current : card.fallbackPriceText;
    const buyDest = liveProduct ? `/shop/buy-accessory/${liveProduct.slug}` : card.buyTo;

    const copyBlock = (
      <div className="ipad-essential-copy">
        <h3 className="ipad-essential-title">{card.title}</h3>
        <p className="ipad-essential-desc">{card.description}</p>
        {livePrice && <div className="ipad-essential-price">{livePrice}</div>}
        <div className="ipad-essential-links">
          <SmartLink
            to={buyDest}
            isExternal={card.isExternal}
            className="ipad-btn-gold-pill"
            dataTestId={`ipad-essential-buy-${card.id}`}
          >
            <ShoppingBag size={15} strokeWidth={2.2} className="ipad-btn-bag-icon" aria-hidden="true" />
            <span>{card.buyLabel || "Buy"}</span>
          </SmartLink>
          {card.secondaryLinkLabel && card.secondaryLinkTo && (
            <SmartLink to={card.secondaryLinkTo} className="ipad-link-action">
              <span>{card.secondaryLinkLabel}</span>
              <ChevronRight size={15} strokeWidth={2.2} aria-hidden="true" />
            </SmartLink>
          )}
        </div>
      </div>
    );

    const mediaBlock = (
      <div className="ipad-essential-media">
        <img
          src={card.image}
          alt={card.alt || card.title}
          className="ipad-essential-img"
          loading="eager"
          decoding="async"
        />
      </div>
    );

    return (
      <article
        key={card.id}
        className={`ipad-essential-card ${card.layout === "image-top" ? "is-image-top" : "is-text-top"}`}
        data-testid={`ipad-essential-card-${card.id}`}
      >
        {card.layout === "image-top" ? (
          <>
            {mediaBlock}
            {copyBlock}
          </>
        ) : (
          <>
            {copyBlock}
            {mediaBlock}
          </>
        )}
      </article>
    );
  };

  const renderCustomSection = (sec: IpadPageSection) => {
    const bg = sec.backgroundColor || "#ffffff";
    const isDark = bg === "#101012" || bg === "#1d1d1f" || bg === "#000000";
    const linkedProducts = (sec.productIds || [])
      .map((id) => allProducts.find((p) => p.id === id || p.slug === id))
      .filter((p): p is Product => Boolean(p));

    return (
      <section
        key={sec.id}
        className="ipad-custom-section"
        style={{ backgroundColor: bg, color: isDark ? "#f5f5f7" : "#1d1d1f" }}
        data-testid={`ipad-custom-section-${sec.id}`}
      >
        <div className="ipad-container">
          {linkedProducts.length > 0 ? (
            <>
              <div className="ipad-section-header">
                <div>
                  {sec.eyebrow && (
                    <div className="text-xs font-semibold uppercase tracking-wider text-[#bf4800] mb-2">
                      {sec.eyebrow}
                    </div>
                  )}
                  <h2 className="ipad-section-heading" style={{ color: isDark ? "#ffffff" : "#1d1d1f" }}>
                    {sec.heading}
                  </h2>
                  {sec.subtitle && (
                    <p className="mt-2 text-base" style={{ color: isDark ? "#a1a1a6" : "#6e6e73" }}>
                      {sec.subtitle}
                    </p>
                  )}
                </div>
                {sec.buttonLabel && sec.buttonDestination && (
                  <SmartLink to={sec.buttonDestination} className="ipad-section-link">
                    <span>{sec.buttonLabel}</span>
                    <ChevronRight size={16} />
                  </SmartLink>
                )}
              </div>
              <div className="ipad-custom-grid">
                {linkedProducts.map((prod) => {
                  const price = getCardPriceDisplay(prod);
                  const action = getPublicPurchaseAction(prod);
                  const buyPath =
                    prod.category === "Accessories"
                      ? `/shop/buy-accessory/${prod.slug}`
                      : `/shop/buy-ipad/${prod.slug}`;
                  return (
                    <article key={prod.id} className="ipad-custom-prod-card">
                      <div className="ipad-custom-prod-media">
                        <img
                          src={getSafeProductImg(prod)}
                          alt={prod.name}
                          className="ipad-custom-prod-img"
                          loading="eager"
                        />
                      </div>
                      <h3 className="ipad-custom-prod-title">{prod.name}</h3>
                      <div className="ipad-custom-prod-footer">
                        <span className="ipad-custom-prod-price">{price.current}</span>
                        <Link to={buyPath} className="ipad-catalog-cta">
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
              className="ipad-custom-banner"
              style={{ backgroundColor: isDark ? "#1c1c1e" : "#f5f5f7" }}
            >
              <div>
                {sec.eyebrow && (
                  <div className="text-xs font-semibold uppercase tracking-wider text-[#bf4800] mb-2">
                    {sec.eyebrow}
                  </div>
                )}
                <h2 className="ipad-section-heading" style={{ color: isDark ? "#ffffff" : "#1d1d1f" }}>
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
                    <SmartLink to={sec.buttonDestination} className="ipad-btn-gold-pill">
                      {sec.buttonLabel}
                    </SmartLink>
                  )}
                  {sec.secondaryButtonLabel && sec.secondaryButtonDestination && (
                    <SmartLink to={sec.secondaryButtonDestination} className="ipad-link-action">
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
                    loading="eager"
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    );
  };

  const renderSection = (sec: IpadPageSection) => {
    switch (sec.builtInKey) {
      case "promo-ribbon": {
        if (!config.promoRibbon?.enabled) return null;
        return (
          <div key={sec.id} className="ipad-promo-ribbon" data-testid="ipad-promo-ribbon">
            <div className="ipad-promo-ribbon-inner">
              <span>{config.promoRibbon.text}</span>
              {config.promoRibbon.linkLabel && (
                <SmartLink to={config.promoRibbon.linkTo} className="ipad-promo-ribbon-link">
                  {config.promoRibbon.linkLabel} ›
                </SmartLink>
              )}
            </div>
          </div>
        );
      }

      case "hero-chapter-nav": {
        return (
          <section key={sec.id} className="ipad-hero-section" data-testid="ipad-hero-section">
            <div className="ipad-container">
              <h1 className="ipad-hero-heading">
                {config.hero.heading || "iPad"}
                {config.hero.showGoldPeriod !== false ? <span className="ipad-hero-gold-dot">.</span> : null}
              </h1>

              <nav className="ipad-chapter-nav-wrap" aria-label="iPad family of products">
                <button
                  type="button"
                  className="ipad-chapter-paddle is-left"
                  disabled={!chapterCarousel.canPrev}
                  onClick={() => chapterCarousel.scrollByStep(-1)}
                  aria-label="Scroll iPad navigation left"
                >
                  <ChevronLeft size={20} />
                </button>

                <div className="ipad-chapter-nav-track" ref={chapterCarousel.trackRef}>
                  {visibleChapterNav.map((item) => (
                    <SmartLink
                      key={item.id}
                      to={item.to}
                      className="ipad-chapter-item"
                      dataTestId={`ipad-chapter-${item.id}`}
                      onClick={(e) => handleChapterItemClick(item, e)}
                    >
                      <span className="ipad-chapter-img-box">
                        <img
                          src={item.image}
                          alt={item.alt || item.label}
                          className="ipad-chapter-img"
                          loading="eager"
                          decoding="async"
                        />
                      </span>
                      <span className="ipad-chapter-label">{item.label}</span>
                      {item.badge && <span className="ipad-chapter-badge">{item.badge}</span>}
                    </SmartLink>
                  ))}
                </div>

                <button
                  type="button"
                  className="ipad-chapter-paddle is-right"
                  disabled={!chapterCarousel.canNext}
                  onClick={() => chapterCarousel.scrollByStep(1)}
                  aria-label="Scroll iPad navigation right"
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
            className="ipad-band-gray-tight"
            aria-labelledby="ipad-explore-lineup-title"
            data-testid="ipad-explore-lineup"
          >
            <div className="ipad-container">
              <div className="ipad-section-header">
                <h2 id="ipad-explore-lineup-title" className="ipad-section-heading">
                  {config.lineupSection.heading}
                </h2>
                <div className="ipad-section-header-links">
                  {config.lineupSection.compareLabel && (
                    <button
                      type="button"
                      className="ipad-section-link"
                      data-testid="ipad-compare-models-btn"
                      onClick={() => setCompareOpen(true)}
                    >
                      <span>{config.lineupSection.compareLabel}</span>
                      <ChevronRight size={16} strokeWidth={2.2} aria-hidden="true" />
                    </button>
                  )}
                  <SmartLink
                    to={config.lineupSection.shopAllTo || "/shop/buy-ipad"}
                    className="ipad-section-link"
                    dataTestId="ipad-shop-all-link"
                  >
                    <ShoppingBag
                      size={16}
                      strokeWidth={2.2}
                      className="ipad-gold-bag-icon"
                      aria-hidden="true"
                    />
                    <span>{config.lineupSection.shopAllLabel || "Shop all iPad"}</span>
                    <ChevronRight size={16} strokeWidth={2.2} aria-hidden="true" />
                  </SmartLink>
                </div>
              </div>
            </div>

            <div className="ipad-carousel-bleed" ref={lineupCarousel.trackRef}>
              <div className="ipad-lineup-track">
                {visibleLineupCards.map(renderLineupCard)}
              </div>
            </div>

            {(lineupCarousel.canPrev || lineupCarousel.canNext) && (
              <div className="ipad-container">
                <div className="ipad-carousel-paddles-row" aria-label="Explore the lineup carousel controls">
                  <button
                    type="button"
                    className="ipad-paddle-btn"
                    data-testid="ipad-lineup-prev"
                    disabled={!lineupCarousel.canPrev}
                    onClick={() => lineupCarousel.scrollByStep(-1)}
                    aria-label="Previous iPad lineup card"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    type="button"
                    className="ipad-paddle-btn"
                    data-testid="ipad-lineup-next"
                    disabled={!lineupCarousel.canNext}
                    onClick={() => lineupCarousel.scrollByStep(1)}
                    aria-label="Next iPad lineup card"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            )}
          </section>
        );
      }

      case "why-shop-ipad": {
        return (
          <section
            key={sec.id}
            id="why-shop-ipad"
            className="ipad-band-gray-mid"
            aria-labelledby="ipad-why-shop-title"
            data-testid="ipad-why-shop"
          >
            <div className="ipad-container">
              <div className="ipad-section-header">
                <h2 id="ipad-why-shop-title" className="ipad-section-heading">
                  {config.whyShopSection.heading}
                </h2>
                {config.whyShopSection.actionLabel && (
                  <SmartLink to={config.whyShopSection.actionTo} className="ipad-section-link">
                    <ShoppingBag
                      size={16}
                      strokeWidth={2.2}
                      className="ipad-gold-bag-icon"
                      aria-hidden="true"
                    />
                    <span>{config.whyShopSection.actionLabel}</span>
                    <ChevronRight size={16} strokeWidth={2.2} aria-hidden="true" />
                  </SmartLink>
                )}
              </div>
            </div>

            <div className="ipad-carousel-bleed" ref={whyCarousel.trackRef}>
              <div className="ipad-why-track">
                {visibleWhyCards.map((card) => (
                  <article key={card.id} className="ipad-why-card" data-testid={`ipad-why-card-${card.id}`}>
                    <div>
                      <div className="ipad-why-eyebrow">{card.eyebrow}</div>
                      <h3 className="ipad-why-title">{card.title}</h3>
                      <p className="ipad-why-desc">{card.description}</p>
                    </div>
                    <div className="ipad-why-media">
                      <img
                        src={card.image}
                        alt={card.alt || card.title}
                        className="ipad-why-img"
                        loading="eager"
                        decoding="async"
                      />
                    </div>
                    {card.actionStyle === "link" ? (
                      <SmartLink
                        to={card.actionTo}
                        isExternal={card.isExternal}
                        className="ipad-why-circle-btn"
                        ariaLabel={`${card.actionLabel}: ${card.title}`}
                      >
                        <ChevronRight size={18} strokeWidth={2.2} />
                      </SmartLink>
                    ) : (
                      <button
                        type="button"
                        className="ipad-why-circle-btn"
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
              <div className="ipad-container">
                <div className="ipad-carousel-paddles-row" aria-label="Why Buy & Sell GH carousel controls">
                  <button
                    type="button"
                    className="ipad-paddle-btn"
                    data-testid="ipad-why-prev"
                    disabled={!whyCarousel.canPrev}
                    onClick={() => whyCarousel.scrollByStep(-1)}
                    aria-label="Previous shopping benefit"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    type="button"
                    className="ipad-paddle-btn"
                    data-testid="ipad-why-next"
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

      case "ipad-essentials": {
        return (
          <section
            key={sec.id}
            id="ipad-essentials"
            className="ipad-band-gray-mid"
            aria-labelledby="ipad-essentials-title"
            data-testid="ipad-essentials-section"
          >
            <div className="ipad-container">
              <div className="ipad-section-header">
                <h2 id="ipad-essentials-title" className="ipad-section-heading">
                  {config.essentialsSection.heading}
                </h2>
              </div>

              <div className="ipad-essentials-carousel-wrap" ref={essentialsCarousel.trackRef}>
                <div className="ipad-essentials-grid">
                  {visibleEssentialCards.map(renderEssentialCard)}
                </div>
              </div>

              <div className="ipad-essentials-mobile-paddles" aria-label="iPad essentials carousel controls">
                <button
                  type="button"
                  className="ipad-paddle-btn"
                  disabled={!essentialsCarousel.canPrev}
                  onClick={() => essentialsCarousel.scrollByStep(-1)}
                  aria-label="Previous iPad essential card"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  type="button"
                  className="ipad-paddle-btn"
                  disabled={!essentialsCarousel.canNext}
                  onClick={() => essentialsCarousel.scrollByStep(1)}
                  aria-label="Next iPad essential card"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          </section>
        );
      }

      case "significant-others": {
        return (
          <section
            key={sec.id}
            id="significant-others"
            className="ipad-band-gray"
            aria-labelledby="ipad-eco-title"
            data-testid="ipad-ecosystem-section"
          >
            <div className="ipad-container">
              <div className="ipad-section-header">
                <h2 id="ipad-eco-title" className="ipad-section-heading">
                  {config.ecosystemSection.heading}
                </h2>
                {config.ecosystemSection.actionLabel && (
                  <SmartLink to={config.ecosystemSection.actionTo} className="ipad-section-link">
                    <span>{config.ecosystemSection.actionLabel}</span>
                    <ChevronRight size={16} strokeWidth={2.2} aria-hidden="true" />
                  </SmartLink>
                )}
              </div>

              <div className="ipad-eco-shell">
                <div className="ipad-eco-accordion" role="region" aria-label="Apple ecosystem with iPad">
                  {visibleEcoItems.map((item) => {
                    const isOpen = activeEcoItem?.id === item.id;
                    return (
                      <div key={item.id} className="ipad-eco-item">
                        <button
                          type="button"
                          className="ipad-eco-trigger"
                          aria-expanded={isOpen}
                          data-testid={`ipad-eco-trigger-${item.id}`}
                          onClick={() => setActiveEcoId(item.id)}
                        >
                          <span className="ipad-eco-trigger-title">{item.title}</span>
                          <ChevronDown
                            size={22}
                            strokeWidth={2}
                            className={`ipad-eco-chevron ${isOpen ? "is-open" : ""}`}
                            aria-hidden="true"
                          />
                        </button>

                        {isOpen && (
                          <div className="ipad-eco-panel" data-testid={`ipad-eco-panel-${item.id}`}>
                            <p className="ipad-eco-desc">{item.description}</p>
                            {item.linkLabel && item.linkTo && (
                              <SmartLink to={item.linkTo} className="ipad-link-action">
                                <span>{item.linkLabel}</span>
                                <ChevronRight size={15} strokeWidth={2.2} aria-hidden="true" />
                              </SmartLink>
                            )}
                            {/* Exact Apple mobile behavior: image renders inline beneath expanded text */}
                            <div className="ipad-eco-inline-media">
                              <img
                                src={item.image}
                                alt={item.alt || item.title}
                                className="ipad-eco-inline-img"
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

                {/* Desktop crossfading visual stage */}
                <div className="ipad-eco-desktop-stage">
                  {activeEcoItem && (
                    <img
                      key={activeEcoItem.id}
                      src={activeEcoItem.image}
                      alt={activeEcoItem.alt || activeEcoItem.title}
                      className="ipad-eco-stage-img"
                      data-testid="ipad-eco-desktop-image"
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

      case "ipad-directory-footer": {
        return (
          <section
            key={sec.id}
            className="ipad-directory-section"
            aria-labelledby="ipad-directory-heading"
            data-testid="ipad-directory-footer"
          >
            <div className="ipad-container">
              <div className="ipad-directory-top">
                <h2 id="ipad-directory-heading" className="ipad-directory-heading">
                  {config.directoryFooter.heading || "iPad"}
                </h2>
                {config.directoryFooter.tagline && (
                  <span className="ipad-directory-tagline">{config.directoryFooter.tagline}</span>
                )}
              </div>

              <div className="ipad-directory-cols">
                {config.directoryFooter.columns.map((col) => (
                  <div key={col.id}>
                    <h3 className="ipad-dir-col-title">{col.heading}</h3>
                    <ul className="ipad-dir-list">
                      {col.links.map((lnk, idx) => {
                        const prev = col.links[idx - 1];
                        const needsSubGap = col.primaryStyle && lnk.isSecondary && prev && !prev.isSecondary;
                        const cls =
                          col.primaryStyle && !lnk.isSecondary
                            ? "ipad-dir-link-primary"
                            : "ipad-dir-link-secondary";
                        return (
                          <li key={lnk.id} className={needsSubGap ? "ipad-dir-link-subgap" : undefined}>
                            {lnk.openCompareModal || lnk.to === "#compare-ipad" ? (
                              <button
                                type="button"
                                className={cls}
                                onClick={() => setCompareOpen(true)}
                              >
                                {lnk.label}
                              </button>
                            ) : (
                              <SmartLink to={lnk.to} className={cls}>
                                {lnk.label}
                              </SmartLink>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ))}
              </div>

              {config.directoryFooter.footnotes && config.directoryFooter.footnotes.length > 0 && (
                <div className="ipad-footnotes">
                  {config.directoryFooter.footnotes.map((note, idx) => (
                    <p key={idx} className="ipad-footnote-line">
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
      className={`ipad-page-root ${previewDevice === "mobile" ? "is-preview-mobile" : ""}`}
      data-testid="ipad-redesign-page"
    >
      {visibleSections.map(renderSection)}

      {/* Interactive Benefit Detail Modal */}
      {activeBenefitModal && (
        <div
          className="ipad-modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="ipad-benefit-modal-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) setActiveBenefitModal(null);
          }}
        >
          <div className="ipad-modal-card" data-testid="ipad-benefit-modal">
            <button
              type="button"
              className="ipad-modal-close"
              onClick={() => setActiveBenefitModal(null)}
              aria-label="Close benefit details"
            >
              <X size={18} />
            </button>
            <div className="text-xs font-semibold uppercase tracking-wider text-[#6e6e73] mb-2">
              {activeBenefitModal.eyebrow}
            </div>
            <h3
              id="ipad-benefit-modal-title"
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
                className="ipad-btn-gold-pill"
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

      {/* Interactive Compare iPad Models Modal */}
      <IpadCompareModal
        open={compareOpen}
        onClose={() => setCompareOpen(false)}
        cards={visibleLineupCards}
        productBySlug={productBySlug}
      />
    </div>
  );
}
