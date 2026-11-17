import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  BatteryCharging,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Pause,
  Play,
  Receipt,
  ShieldCheck,
} from "lucide-react";
import { useCms } from "../../cms/CmsContext";
import {
  defaultHomepageBentoTiles,
  defaultHomepageCarouselCards,
  defaultHomepageFootnotes,
  defaultHomepagePromoPanels,
  defaultHomepageSections,
  defaultMainStoreConfig,
} from "../../cms/defaultCmsData";
import type {
  HomepageBentoTile,
  HomepageCarouselCard,
  HomepageContent,
  HomepagePromoPanel,
  HomepageSection,
  Tone,
} from "../../cms/types";
import { useProductCatalog } from "../../catalog/ProductCatalogContext";
import { getPublicPurchaseAction } from "../../catalog/productPurchaseAction";
import { getProductFamily, productBuyPath, productStoryPath } from "../../catalog/productExperience";
import { isProductImageEligible, resolveCatalogueProductImage, resolveProductImage } from "../../utils/productImages";
import { getCardPriceDisplay } from "../../utils/productPricing";
import { whatsappUrl } from "../../utils/whatsapp";
import type { Product } from "../../types/product";
import { hasActiveSlotMedia, type MediaSlotLike } from "../../cms/homepageBuilderUtils";
import { PromotionalAnnouncementBar } from "../promotions/PromotionalAnnouncementBar";
import { HomepagePromotionalCarousel } from "../promotions/HomepagePromotionalCarousel";
import { HomepageMediaSlot } from "./HomepageMediaSlot";
import "../../styles/apple-homepage.css";

function extractMediaSlotProps(
  entity: MediaSlotLike & {
    imageAlt?: string;
    caption?: string;
    focalPoint?: HomepageSection["focalPoint"];
    objectFit?: HomepageSection["objectFit"];
  }
) {
  return {
    mediaMode: entity.mediaMode,
    desktopImage: entity.desktopImage,
    mobileImage: entity.mobileImage,
    videoUrl: entity.videoUrl,
    mobileVideoUrl: entity.mobileVideoUrl,
    posterUrl: entity.posterUrl,
    mobilePosterUrl: entity.mobilePosterUrl,
    videoAutoplay: entity.videoAutoplay,
    videoMuted: entity.videoMuted,
    videoLoop: entity.videoLoop,
    imageAlt: entity.imageAlt,
    focalPoint: entity.focalPoint,
    objectFit: entity.objectFit,
    caption: entity.caption,
  };
}

export interface HomepageAdminInteractionTarget {
  sectionId: string;
  tileId?: string;
  cardId?: string;
  panelId?: string;
  openMediaPicker?: boolean;
}

export interface HomepageSectionRendererProps {
  content?: HomepageContent;
  showAnnouncement?: boolean;
  adminInteractive?: boolean;
  onAdminInteract?: (target: HomepageAdminInteractionTarget) => void;
}

function isDarkHexColor(color?: string): boolean {
  if (!color) return false;
  const c = color.trim().toLowerCase();
  if (["#000", "#000000", "#0a0a0c", "#111113", "#141416", "#1d1d1f", "black"].includes(c)) {
    return true;
  }
  const m = c.match(/^#([0-9a-f]{6})$/i);
  if (!m) return false;
  const hex = m[1];
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 < 0.42;
}

function resolveTone(tone?: Tone, bgColor?: string): Tone {
  if (tone) return tone;
  return isDarkHexColor(bgColor) ? "dark" : "light";
}

function resolveCtaAction(
  label: string | undefined,
  destination: string | undefined,
  productIds: string[] | undefined,
  products: Product[],
  titleForWhatsapp: string
): { label: string; to: string; external: boolean } | null {
  if (!label || !destination) return null;

  const slugFromDest = destination.split("?")[0].split("/").filter(Boolean).pop();
  const matchedProduct = products.find(
    (p) =>
      !p.archived &&
      (productIds?.includes(p.id) ||
        productIds?.includes(p.slug) ||
        p.slug === slugFromDest ||
        p.name.toLowerCase() === titleForWhatsapp.toLowerCase())
  );

  if (matchedProduct && destination.startsWith("/shop/buy-")) {
    const action = getPublicPurchaseAction(matchedProduct);
    if (action === "enquire") {
      return {
        label: "Enquire on WhatsApp",
        to: whatsappUrl(
          `Hello Buy & Sell GH, I would like to enquire about ${matchedProduct.name}. Please confirm availability and pricing.`
        ),
        external: true,
      };
    }
    return {
      label: action === "buy" ? "Buy" : "View pricing",
      to: productBuyPath(getProductFamily(matchedProduct), matchedProduct.slug),
      external: false,
    };
  }

  return {
    label,
    to: destination,
    external: destination.startsWith("http://") || destination.startsWith("https://"),
  };
}

function ActionButton({
  action,
  variant,
  tone,
}: {
  action: { label: string; to: string; external: boolean };
  variant: "primary" | "secondary";
  tone: Tone;
}) {
  const cls =
    variant === "primary"
      ? "apple-modular-cta apple-modular-cta--primary"
      : tone === "dark"
      ? "apple-modular-cta apple-modular-cta--secondary-dark"
      : "apple-modular-cta apple-modular-cta--secondary-light";

  if (action.external) {
    return (
      <a className={cls} href={action.to} target="_blank" rel="noopener noreferrer">
        {action.label}
      </a>
    );
  }
  return (
    <Link className={cls} to={action.to}>
      {action.label}
    </Link>
  );
}

export function HomepageSectionRenderer({
  content,
  showAnnouncement = true,
  adminInteractive = false,
  onAdminInteract,
}: HomepageSectionRendererProps) {
  const { homepage, mainStore } = useCms();
  const { products } = useProductCatalog();
  const activeContent = content || homepage;

  const sections = useMemo(() => {
    const source =
      Array.isArray(activeContent?.sections) && activeContent.sections.length > 0
        ? activeContent.sections
        : defaultHomepageSections;
    return [...source]
      .filter((sec) => sec.visible !== false)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }, [activeContent]);

  let heroCounter = 0;

  return (
    <div className="apple-modular-homepage" data-testid="modular-homepage-canvas">
      {showAnnouncement && <PromotionalAnnouncementBar />}

      {sections.map((section) => {
        if (section.type === "apple-hero" || section.type === "promo-banner") {
          const isPrimaryHero = heroCounter === 0;
          heroCounter += 1;
          return (
            <ModularHeroSection
              key={section.id}
              section={section}
              isPrimaryHero={isPrimaryHero}
              products={products}
              adminInteractive={adminInteractive}
              onAdminInteract={onAdminInteract}
            />
          );
        }

        if (section.type === "multi-promo-strip") {
          return (
            <ModularMultiPromoStripSection
              key={section.id}
              section={section}
              products={products}
              adminInteractive={adminInteractive}
              onAdminInteract={onAdminInteract}
            />
          );
        }

        if (section.type === "apple-bento-grid") {
          return (
            <ModularBentoGridSection
              key={section.id}
              section={section}
              products={products}
              adminInteractive={adminInteractive}
              onAdminInteract={onAdminInteract}
            />
          );
        }

        if (section.type === "story-carousel") {
          return (
            <ModularStoryCarouselSection
              key={section.id}
              section={section}
              adminInteractive={adminInteractive}
              onAdminInteract={onAdminInteract}
            />
          );
        }

        if (section.type === "footnotes") {
          return <ModularFootnotesSection key={section.id} section={section} />;
        }

        if (section.type === "product-family-strip") {
          return (
            <ModularFamilyStripSection
              key={section.id}
              section={section}
              productFamilies={mainStore?.productFamilies || defaultMainStoreConfig.productFamilies}
              adminInteractive={adminInteractive}
              onAdminInteract={onAdminInteract}
            />
          );
        }

        if (section.type === "product-carousel") {
          return (
            <ModularProductShelfSection
              key={section.id}
              section={section}
              products={products}
              mode="devices"
            />
          );
        }

        if (section.type === "accessories-collection") {
          return (
            <ModularProductShelfSection
              key={section.id}
              section={section}
              products={products}
              mode="accessories"
            />
          );
        }

        if (section.type === "promotional-carousel") {
          return <HomepagePromotionalCarousel key={section.id} />;
        }

        if (section.type === "services-showcase") {
          return (
            <ModularServicesSection
              key={section.id}
              section={section}
              content={activeContent}
            />
          );
        }

        if (section.type === "trust-values") {
          return <ModularTrustValuesSection key={section.id} section={section} />;
        }

        return null;
      })}
    </div>
  );
}

/* ----------------------------------------------------------------------------
   HERO & FULL-WIDTH PROMOTIONAL BANNER
   ---------------------------------------------------------------------------- */
function ModularHeroSection({
  section,
  isPrimaryHero,
  products,
  adminInteractive,
  onAdminInteract,
}: {
  section: HomepageSection;
  isPrimaryHero: boolean;
  products: Product[];
  adminInteractive: boolean;
  onAdminInteract?: (target: HomepageAdminInteractionTarget) => void;
}) {
  const tone = resolveTone(section.tone, section.backgroundColor);
  const bg = section.backgroundColor || (tone === "dark" ? "#000000" : tone === "mist" ? "#eef5f9" : "#f5f5f7");
  const primary = resolveCtaAction(
    section.buttonLabel,
    section.buttonDestination,
    section.productIds,
    products,
    section.heading
  );
  const secondary = resolveCtaAction(
    section.secondaryButtonLabel,
    section.secondaryButtonDestination,
    section.productIds,
    products,
    section.heading
  );

  const HeadingTag = isPrimaryHero ? "h1" : "h2";

  return (
    <section
      className={`apple-modular-hero apple-modular-hero--${tone} ${
        section.type === "promo-banner" ? "apple-modular-hero--promo-banner" : ""
      } ${section.copyPlacement === "bottom" ? "apple-modular-hero--copy-bottom" : ""}`}
      style={{ backgroundColor: bg }}
      data-homepage-section-id={section.id}
      data-homepage-section-type={section.type}
      aria-labelledby={`modular-hero-${section.id}`}
    >
      {primary && !primary.external && !adminInteractive ? (
        <Link
          to={primary.to}
          className="apple-modular-hero__stretch-link"
          aria-label={section.heading}
          tabIndex={-1}
        />
      ) : null}

      <div
        className={`apple-modular-hero__copy ${
          section.textAlignment === "left"
            ? "apple-modular-hero__copy--left"
            : section.textAlignment === "right"
            ? "apple-modular-hero__copy--right"
            : ""
        }`}
      >
        {section.eyebrow ? (
          <p className="apple-modular-hero__eyebrow">{section.eyebrow}</p>
        ) : null}
        <HeadingTag id={`modular-hero-${section.id}`} className="apple-modular-hero__headline">
          {section.heading}
        </HeadingTag>
        {section.subtitle ? (
          <p className="apple-modular-hero__subtitle">{section.subtitle}</p>
        ) : null}
        {section.description ? (
          <p className="apple-modular-hero__description">{section.description}</p>
        ) : null}
        {(primary || secondary) && (
          <div className="apple-modular-hero__ctas">
            {primary && <ActionButton action={primary} variant="primary" tone={tone} />}
            {secondary && <ActionButton action={secondary} variant="secondary" tone={tone} />}
          </div>
        )}
      </div>

      <div className="apple-modular-hero__media">
        <HomepageMediaSlot
          slotId={section.id}
          slotLabel={section.heading}
          {...extractMediaSlotProps(section)}
          imageAlt={section.imageAlt || section.heading}
          focalPoint={section.focalPoint || "bottom"}
          objectFit={section.objectFit || "contain"}
          tone={tone}
          variant={section.type === "promo-banner" ? "promo-banner" : "hero"}
          priority={isPrimaryHero}
          adminInteractive={adminInteractive}
          onAdminSelectSlot={() =>
            onAdminInteract?.({ sectionId: section.id, openMediaPicker: true })
          }
        />
      </div>
    </section>
  );
}

/* ----------------------------------------------------------------------------
   WIDE MULTI-IMAGE PROMOTIONAL CAMPAIGN STRIP ("Gifts they'll love" composition)
   ---------------------------------------------------------------------------- */
function ModularMultiPromoStripSection({
  section,
  products,
  adminInteractive,
  onAdminInteract,
}: {
  section: HomepageSection;
  products: Product[];
  adminInteractive: boolean;
  onAdminInteract?: (target: HomepageAdminInteractionTarget) => void;
}) {
  const tone = resolveTone(section.tone || "light", section.backgroundColor || "#f5f5f7");
  const bg =
    section.backgroundColor ||
    (tone === "dark" ? "#0d0d10" : tone === "mist" ? "#eef5f9" : "#f5f5f7");
  const primary = resolveCtaAction(
    section.buttonLabel,
    section.buttonDestination,
    section.productIds,
    products,
    section.heading
  );
  const secondary = resolveCtaAction(
    section.secondaryButtonLabel,
    section.secondaryButtonDestination,
    section.productIds,
    products,
    section.heading
  );

  const panels: HomepagePromoPanel[] = useMemo(() => {
    const raw =
      Array.isArray(section.promoPanels) && section.promoPanels.length > 0
        ? section.promoPanels
        : defaultHomepagePromoPanels;
    return [...raw]
      .filter((p) => p.visible !== false)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }, [section.promoPanels]);

  return (
    <section
      className={`apple-modular-multi-strip apple-modular-multi-strip--${tone}`}
      style={{ backgroundColor: bg }}
      data-homepage-section-id={section.id}
      data-homepage-section-type={section.type}
      aria-labelledby={`modular-strip-${section.id}`}
    >
      <div
        className={`apple-modular-multi-strip__copy ${
          section.textAlignment === "left"
            ? "apple-modular-hero__copy--left"
            : section.textAlignment === "right"
            ? "apple-modular-hero__copy--right"
            : ""
        }`}
      >
        {section.eyebrow ? (
          <p className="apple-modular-hero__eyebrow">{section.eyebrow}</p>
        ) : null}
        <h2
          id={`modular-strip-${section.id}`}
          className="apple-modular-multi-strip__headline"
        >
          {section.heading}
        </h2>
        {section.subtitle ? (
          <p className="apple-modular-multi-strip__subtitle">{section.subtitle}</p>
        ) : null}
        {section.description ? (
          <p className="apple-modular-hero__description">{section.description}</p>
        ) : null}
        {(primary || secondary) && (
          <div className="apple-modular-hero__ctas">
            {primary && <ActionButton action={primary} variant="primary" tone={tone} />}
            {secondary && <ActionButton action={secondary} variant="secondary" tone={tone} />}
          </div>
        )}
      </div>

      <div className="apple-modular-multi-strip__panels">
        {panels.map((panel) => {
          const panelInner = (
            <div
              className="apple-modular-multi-strip__panel-inner"
              style={
                panel.backgroundColor
                  ? { backgroundColor: panel.backgroundColor }
                  : undefined
              }
            >
              <HomepageMediaSlot
                slotId={panel.id}
                slotLabel={panel.label}
                {...extractMediaSlotProps(panel)}
                imageAlt={panel.imageAlt || panel.label}
                focalPoint={panel.focalPoint || "bottom"}
                objectFit={panel.objectFit || "contain"}
                tone={tone}
                variant="promo-panel"
                adminInteractive={adminInteractive}
                onAdminSelectSlot={() =>
                  onAdminInteract?.({
                    sectionId: section.id,
                    panelId: panel.id,
                    openMediaPicker: true,
                  })
                }
              />
            </div>
          );

          return (
            <div
              key={panel.id}
              className="apple-modular-multi-strip__panel"
              data-promo-panel-id={panel.id}
            >
              {panel.destination && !adminInteractive ? (
                <Link
                  to={panel.destination}
                  className="apple-modular-multi-strip__panel-link"
                  aria-label={panel.label}
                >
                  {panelInner}
                </Link>
              ) : (
                panelInner
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

/* ----------------------------------------------------------------------------
   APPLE-STYLE LEGAL FOOTNOTES BAND
   ---------------------------------------------------------------------------- */
function ModularFootnotesSection({ section }: { section: HomepageSection }) {
  const notes =
    Array.isArray(section.footnoteItems) && section.footnoteItems.length > 0
      ? section.footnoteItems
      : defaultHomepageFootnotes;

  if (notes.length === 0) return null;

  return (
    <section
      className="apple-modular-footnotes"
      style={section.backgroundColor ? { backgroundColor: section.backgroundColor } : undefined}
      data-homepage-section-id={section.id}
      data-homepage-section-type={section.type}
      aria-label={section.heading || "Footnotes"}
    >
      <div className="apple-modular-footnotes__inner">
        <ul className="apple-modular-footnotes__list">
          {notes.map((line, index) => (
            <li key={`${section.id}-fn-${index}`} className="apple-modular-footnotes__item">
              {line}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ----------------------------------------------------------------------------
   TWO-COLUMN PROMOTIONAL CAMPAIGN GRID (6 INDEPENDENT TILES)
   ---------------------------------------------------------------------------- */
function ModularBentoGridSection({
  section,
  products,
  adminInteractive,
  onAdminInteract,
}: {
  section: HomepageSection;
  products: Product[];
  adminInteractive: boolean;
  onAdminInteract?: (target: HomepageAdminInteractionTarget) => void;
}) {
  const tiles = useMemo(() => {
    const raw =
      Array.isArray(section.tiles) && section.tiles.length > 0
        ? section.tiles
        : defaultHomepageBentoTiles;
    return [...raw]
      .filter((t) => t.visible !== false)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }, [section.tiles]);

  return (
    <section
      className="apple-modular-promo-section"
      data-homepage-section-id={section.id}
      data-homepage-section-type={section.type}
      aria-label={section.heading || "Promotional Campaigns"}
    >
      <div className="apple-modular-promo-grid">
        {tiles.map((tile) => (
          <ModularPromoTile
            key={tile.id}
            sectionId={section.id}
            tile={tile}
            products={products}
            adminInteractive={adminInteractive}
            onAdminInteract={onAdminInteract}
          />
        ))}
      </div>
    </section>
  );
}

function ModularPromoTile({
  sectionId,
  tile,
  products,
  adminInteractive,
  onAdminInteract,
}: {
  sectionId: string;
  tile: HomepageBentoTile;
  products: Product[];
  adminInteractive: boolean;
  onAdminInteract?: (target: HomepageAdminInteractionTarget) => void;
}) {
  const tone = resolveTone(tile.tone, tile.backgroundColor);
  const bg = tile.backgroundColor || (tone === "dark" ? "#000000" : tone === "mist" ? "#eef5f9" : "#f5f5f7");
  const primary = resolveCtaAction(
    tile.primaryLabel,
    tile.primaryDestination,
    tile.productIds,
    products,
    tile.title
  );
  const secondary = resolveCtaAction(
    tile.secondaryLabel,
    tile.secondaryDestination,
    tile.productIds,
    products,
    tile.title
  );

  return (
    <article
      className={`apple-modular-promo-tile apple-modular-promo-tile--${tone} ${
        tile.copyPlacement === "bottom" ? "apple-modular-promo-tile--bottom" : ""
      }`}
      style={{ backgroundColor: bg }}
      data-promo-tile-id={tile.id}
    >
      {primary && !primary.external && !adminInteractive ? (
        <Link
          to={primary.to}
          className="apple-modular-promo-tile__stretch-link"
          aria-label={tile.title}
          tabIndex={-1}
        />
      ) : null}

      <div className="apple-modular-promo-tile__copy">
        {tile.eyebrow ? (
          <p className="apple-modular-promo-tile__eyebrow">{tile.eyebrow}</p>
        ) : null}
        <h2 className="apple-modular-promo-tile__headline">{tile.title}</h2>
        {tile.subtitle ? (
          <p className="apple-modular-promo-tile__subtitle">{tile.subtitle}</p>
        ) : null}
        {tile.description ? (
          <p className="apple-modular-promo-tile__description">{tile.description}</p>
        ) : null}
        {(primary || secondary) && (
          <div className="apple-modular-promo-tile__ctas">
            {primary && <ActionButton action={primary} variant="primary" tone={tone} />}
            {secondary && <ActionButton action={secondary} variant="secondary" tone={tone} />}
          </div>
        )}
      </div>

      <div className="apple-modular-promo-tile__media">
        <HomepageMediaSlot
          slotId={tile.id}
          slotLabel={tile.title}
          {...extractMediaSlotProps(tile)}
          imageAlt={tile.imageAlt || tile.title}
          focalPoint={tile.focalPoint || "bottom"}
          objectFit={tile.objectFit || "contain"}
          tone={tone}
          variant="bento-tile"
          adminInteractive={adminInteractive}
          onAdminSelectSlot={() =>
            onAdminInteract?.({ sectionId, tileId: tile.id, openMediaPicker: true })
          }
        />
      </div>
    </article>
  );
}

/* ----------------------------------------------------------------------------
   FEATURED VISUAL-CONTENT STORYTELLING CAROUSEL
   ---------------------------------------------------------------------------- */
function ModularStoryCarouselSection({
  section,
  adminInteractive,
  onAdminInteract,
}: {
  section: HomepageSection;
  adminInteractive: boolean;
  onAdminInteract?: (target: HomepageAdminInteractionTarget) => void;
}) {
  const cards: HomepageCarouselCard[] = useMemo(() => {
    const raw =
      Array.isArray(section.carouselCards) && section.carouselCards.length > 0
        ? section.carouselCards
        : defaultHomepageCarouselCards;
    return [...raw]
      .filter((c) => c.visible !== false)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }, [section.carouselCards]);

  const [activeIndex, setActiveIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(() =>
    !(typeof window !== "undefined" &&
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches)
  );
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isPlaying || cards.length <= 1 || adminInteractive) return;
    const id = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % cards.length);
    }, 6000);
    return () => window.clearInterval(id);
  }, [isPlaying, cards.length, adminInteractive]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const child = track.children[activeIndex] as HTMLElement | undefined;
    if (!child) return;
    const left = child.offsetLeft - (track.clientWidth - child.clientWidth) / 2;
    track.scrollTo({
      left: Math.max(0, left),
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
    });
  }, [activeIndex]);

  if (cards.length === 0) return null;

  const goPrev = () => {
    setActiveIndex((prev) => (prev === 0 ? cards.length - 1 : prev - 1));
  };

  const goNext = () => {
    setActiveIndex((prev) => (prev + 1) % cards.length);
  };

  return (
    <section
      className="apple-modular-story-section"
      style={section.backgroundColor ? { backgroundColor: section.backgroundColor } : undefined}
      data-homepage-section-id={section.id}
      data-homepage-section-type={section.type}
      aria-label={section.heading || "Featured Visual Stories"}
    >
      {(section.heading || section.eyebrow || section.subtitle) && (
        <div className="apple-modular-story-header">
          {section.eyebrow ? (
            <p className="apple-modular-story-header__eyebrow">{section.eyebrow}</p>
          ) : null}
          {section.heading ? (
            <h2 className="apple-modular-story-header__title">{section.heading}</h2>
          ) : null}
          {section.subtitle ? (
            <p className="apple-modular-story-header__subtitle">{section.subtitle}</p>
          ) : null}
        </div>
      )}

      <div
        ref={trackRef}
        className="apple-modular-story-track"
        role="region"
        aria-roledescription="carousel"
        aria-label={section.heading || "Featured Visual Stories"}
      >
        {cards.map((card, index) => {
          const isActive = index === activeIndex;
          const cardTone = resolveTone(card.tone, card.backgroundColor || "#000000");
          return (
            <article
              key={card.id}
              className={`apple-modular-story-card ${
                isActive ? "apple-modular-story-card--active" : "apple-modular-story-card--inactive"
              }`}
              data-story-card-id={card.id}
              onClick={() => setActiveIndex(index)}
            >
              <div className="apple-modular-story-card__media">
                <HomepageMediaSlot
                  slotId={card.id}
                  slotLabel={card.title}
                  {...extractMediaSlotProps(card)}
                  imageAlt={card.imageAlt || card.title}
                  focalPoint={card.focalPoint || "center"}
                  objectFit={card.objectFit || "cover"}
                  tone={cardTone}
                  backgroundColor={card.backgroundColor || "#0f0f12"}
                  variant="story-card"
                  adminInteractive={adminInteractive}
                  onAdminSelectSlot={() =>
                    onAdminInteract?.({ sectionId: section.id, cardId: card.id, openMediaPicker: true })
                  }
                />
              </div>
              <div className="apple-modular-story-card__scrim" />
              <div className="apple-modular-story-card__footer">
                {card.ctaLabel && card.ctaDestination ? (
                  <Link className="apple-modular-story-card__cta" to={card.ctaDestination}>
                    {card.ctaLabel}
                  </Link>
                ) : null}
                <div className="apple-modular-story-card__meta">
                  <span className="apple-modular-story-card__category">{card.categoryLabel}</span>
                  {card.caption ? (
                    <>
                      <span className="apple-modular-story-card__dot">•</span>
                      <span className="apple-modular-story-card__caption">{card.caption}</span>
                    </>
                  ) : null}
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <div className="apple-modular-story-controls">
        <button
          type="button"
          className="apple-modular-story-nav-btn"
          onClick={goPrev}
          aria-label="Previous story slide"
        >
          <ChevronLeft size={16} />
        </button>

        <div className="apple-modular-story-dots" role="tablist" aria-label="Story slide pagination">
          {cards.map((card, idx) => (
            <button
              key={card.id}
              type="button"
              role="tab"
              aria-selected={idx === activeIndex}
              aria-label={`Show slide ${idx + 1}: ${card.title}`}
              className={`apple-modular-story-dot ${
                idx === activeIndex ? "apple-modular-story-dot--active" : ""
              }`}
              onClick={() => setActiveIndex(idx)}
            />
          ))}
        </div>

        <button
          type="button"
          className="apple-modular-story-nav-btn"
          onClick={() => setIsPlaying((p) => !p)}
          aria-label={isPlaying ? "Pause carousel auto-advance" : "Play carousel auto-advance"}
        >
          {isPlaying ? <Pause size={14} /> : <Play size={14} />}
        </button>

        <button
          type="button"
          className="apple-modular-story-nav-btn"
          onClick={goNext}
          aria-label="Next story slide"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </section>
  );
}

/* ----------------------------------------------------------------------------
   PRODUCT FAMILY DISCOVERY STRIP
   ---------------------------------------------------------------------------- */
function ModularFamilyStripSection({
  section,
  productFamilies,
  adminInteractive = false,
  onAdminInteract,
}: {
  section: HomepageSection;
  productFamilies: Array<{ id: string; name: string; image: string; alt: string; path: string }>;
  adminInteractive?: boolean;
  onAdminInteract?: (target: HomepageAdminInteractionTarget) => void;
}) {
  const hasCampaignVisual = hasActiveSlotMedia(section);
  return (
    <section
      className="apple-modular-band"
      style={{ backgroundColor: section.backgroundColor || "#f5f5f7" }}
      data-homepage-section-id={section.id}
      data-homepage-section-type={section.type}
    >
      <div className="apple-modular-band__inner">
        <div
          className={`apple-modular-band__header ${
            section.textAlignment === "left" ? "" : "apple-modular-band__header--center"
          }`}
        >
          <div>
            {section.eyebrow ? (
              <p className="apple-modular-band__eyebrow">{section.eyebrow}</p>
            ) : null}
            <h2 className="apple-modular-band__title">{section.heading}</h2>
            {section.subtitle ? (
              <p className="apple-modular-band__subtitle">{section.subtitle}</p>
            ) : null}
          </div>
        </div>

        {(hasCampaignVisual || adminInteractive) && (
          <div className="mb-6 rounded-2xl overflow-hidden" style={{ height: 220 }}>
            <HomepageMediaSlot
              slotId={section.id}
              slotLabel={section.heading}
              {...extractMediaSlotProps(section)}
              imageAlt={section.imageAlt || section.heading}
              focalPoint={section.focalPoint || "center"}
              objectFit={section.objectFit || "cover"}
              tone={resolveTone(section.tone, section.backgroundColor || "#f5f5f7")}
              variant="promo-banner"
              adminInteractive={adminInteractive}
              onAdminSelectSlot={() =>
                onAdminInteract?.({ sectionId: section.id, openMediaPicker: true })
              }
            />
          </div>
        )}

        <div className="apple-modular-family-grid">
          {productFamilies.map((fam) => (
            <Link key={fam.id} to={fam.path} className="apple-modular-family-item">
              <div className="apple-modular-family-item__thumb">
                <img src={fam.image} alt={fam.alt} loading="lazy" decoding="async" />
              </div>
              <span className="apple-modular-family-item__label">{fam.name}</span>
              <span className="apple-modular-family-item__caption">Shop {fam.name}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ----------------------------------------------------------------------------
   REAL CATALOG PRODUCT & ACCESSORIES SHELVES
   ---------------------------------------------------------------------------- */
function formatCardTagline(product: Product): string {
  const raw = product.shortDescription || product.model || product.brand || "Buy & Sell GH";
  const cleaned = raw.split("**")[0].replace(/\s+/g, " ").trim();
  return cleaned || product.brand || "Buy & Sell GH";
}

function ModularProductShelfSection({
  section,
  products,
  mode,
}: {
  section: HomepageSection;
  products: Product[];
  mode: "devices" | "accessories";
}) {
  const shelfProducts = useMemo(() => {
    const eligible = products.filter((p) => !p.archived && isProductImageEligible(p));
    const requestedIds = section.productIds || [];

    const selected: Product[] = [];
    for (const key of requestedIds) {
      const found = eligible.find((p) => p.id === key || p.slug === key);
      if (found && !selected.some((s) => s.id === found.id)) {
        selected.push(found);
      }
    }

    if (selected.length < 4) {
      const fallbackPool =
        mode === "accessories"
          ? eligible.filter((p) => p.category === "Accessories")
          : eligible.filter((p) => p.category !== "Accessories");

      for (const item of fallbackPool) {
        if (!selected.some((s) => s.id === item.id)) {
          selected.push(item);
        }
        if (selected.length >= (mode === "accessories" ? 4 : 8)) break;
      }
    }

    return selected.slice(0, mode === "accessories" ? 4 : 8);
  }, [products, section.productIds, mode]);

  if (shelfProducts.length === 0) return null;

  return (
    <section
      className="apple-modular-band"
      style={{ backgroundColor: section.backgroundColor || (mode === "devices" ? "#f5f5f7" : "#ffffff") }}
      data-homepage-section-id={section.id}
      data-homepage-section-type={section.type}
    >
      <div className="apple-modular-band__inner">
        <div
          className={`apple-modular-band__header ${
            section.textAlignment === "center" ? "apple-modular-band__header--center" : ""
          }`}
        >
          <div>
            {section.eyebrow ? (
              <p className="apple-modular-band__eyebrow">{section.eyebrow}</p>
            ) : null}
            <h2 className="apple-modular-band__title">{section.heading}</h2>
            {section.subtitle ? (
              <p className="apple-modular-band__subtitle">{section.subtitle}</p>
            ) : null}
          </div>
          {section.buttonLabel && section.buttonDestination ? (
            <Link
              to={section.buttonDestination}
              className="apple-modular-cta apple-modular-cta--secondary-light"
              style={{ fontSize: 14, padding: "8px 16px" }}
            >
              {section.buttonLabel}
            </Link>
          ) : null}
        </div>

        <div className="apple-modular-shelf-grid">
          {shelfProducts.map((product) => {
            const img =
              mode === "accessories"
                ? resolveCatalogueProductImage(product) || resolveProductImage(product)
                : resolveProductImage(product);
            const priceDisplay = getCardPriceDisplay(product);
            const family = getProductFamily(product);
            const action = getPublicPurchaseAction(product);
            const detailUrl = productStoryPath(family, product.slug);
            const buyUrl =
              action === "enquire"
                ? whatsappUrl(
                    `Hello Buy & Sell GH, I am interested in ${product.name} (${priceDisplay.current}). Please confirm availability.`
                  )
                : productBuyPath(family, product.slug);

            return (
              <article key={product.id} className="apple-modular-product-card">
                <div>
                  <div className="apple-modular-product-card__badge">
                    {product.condition || "Brand New"}
                  </div>
                  <Link to={detailUrl} className="apple-modular-product-card__title">
                    {product.name}
                  </Link>
                  <p className="apple-modular-product-card__tagline">
                    {formatCardTagline(product)}
                  </p>
                </div>

                <Link to={detailUrl} className="apple-modular-product-card__media">
                  {img?.src ? (
                    <img
                      src={img.src}
                      alt={img.alt || product.name}
                      loading="lazy"
                      decoding="async"
                    />
                  ) : null}
                </Link>

                <div className="apple-modular-product-card__footer">
                  <span className="apple-modular-product-card__price">{priceDisplay.current}</span>
                  {action === "enquire" ? (
                    <a
                      href={buyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="apple-modular-product-card__buy"
                    >
                      Enquire
                    </a>
                  ) : (
                    <Link to={buyUrl} className="apple-modular-product-card__buy">
                      {action === "buy" ? "Buy" : "View"}
                    </Link>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ----------------------------------------------------------------------------
   GHANA SERVICES SHOWCASE
   ---------------------------------------------------------------------------- */
const FALLBACK_SERVICES = [
  { id: "repairs", title: "Repairs", image: "/services/repairs.png", alt: "Buy & Sell GH repairs flyer", to: "/repairs" },
  { id: "installment", title: "Installment Payment", image: "/services/installment-payment.png", alt: "Buy & Sell GH installment payment flyer", to: "/installment" },
  { id: "upgrade", title: "Upgrade & Save", image: "/services/upgrade-and-save.png", alt: "Buy & Sell GH upgrade and trade-in flyer", to: "/sell-or-trade?mode=upgrade" },
  { id: "sell", title: "Sell Your Device", image: "/services/sell-your-device.png", alt: "Buy & Sell GH device selling flyer", to: "/sell-or-trade" },
  { id: "refer", title: "Refer a Friend", image: "/services/refer-a-friend.png", alt: "Buy & Sell GH referral flyer", to: "/refer-a-friend" },
];

function ModularServicesSection({
  section,
  content,
}: {
  section: HomepageSection;
  content?: HomepageContent;
}) {
  const flyers =
    content?.serviceFlyers && content.serviceFlyers.filter((f) => f.enabled).length > 0
      ? content.serviceFlyers.filter((f) => f.enabled).sort((a, b) => a.order - b.order)
      : FALLBACK_SERVICES;

  return (
    <section
      className="apple-modular-band"
      style={{ backgroundColor: section.backgroundColor || "#ffffff" }}
      data-homepage-section-id={section.id}
      data-homepage-section-type={section.type}
    >
      <div className="apple-modular-band__inner">
        <div
          className={`apple-modular-band__header ${
            section.textAlignment === "left" ? "" : "apple-modular-band__header--center"
          }`}
        >
          <div>
            {section.eyebrow ? (
              <p className="apple-modular-band__eyebrow">{section.eyebrow}</p>
            ) : null}
            <h2 className="apple-modular-band__title">{section.heading}</h2>
            {section.subtitle ? (
              <p className="apple-modular-band__subtitle">{section.subtitle}</p>
            ) : null}
          </div>
          {section.buttonLabel && section.buttonDestination ? (
            <Link
              to={section.buttonDestination}
              className="apple-modular-cta apple-modular-cta--secondary-light"
              style={{ fontSize: 14, padding: "8px 16px" }}
            >
              {section.buttonLabel}
            </Link>
          ) : null}
        </div>

        <div className="apple-modular-services-grid">
          {flyers.map((flyer) => {
            const webp = flyer.image.endsWith(".png") ? flyer.image.replace(/\.png$/, ".webp") : flyer.image;
            return (
              <Link
                key={flyer.id || flyer.title}
                to={flyer.to}
                className="apple-modular-service-card"
                aria-label={flyer.title}
              >
                <picture>
                  <source type="image/webp" srcSet={webp} />
                  <img src={flyer.image} alt={flyer.alt} loading="lazy" decoding="async" />
                </picture>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ----------------------------------------------------------------------------
   CUSTOMER TRUST & SHOWROOM COMMITMENT BAND
   ---------------------------------------------------------------------------- */
const TRUST_PILLARS = [
  {
    icon: ShieldCheck,
    title: "Inspection Before Payment",
    copy: "Inspect every device thoroughly at our Dome Pillar 2 showroom or upon Accra dispatch before confirming payment.",
  },
  {
    icon: BatteryCharging,
    title: "Verified Battery Health",
    copy: "Confirmed battery health diagnostics and transparent grading across Brand New and Certified UK Used units.",
  },
  {
    icon: Receipt,
    title: "Shop Warranty & Receipt",
    copy: "Every purchase includes a Buy & Sell GH warranty policy, official receipt, and MTN MoMo / Telecel Cash confirmation.",
  },
  {
    icon: MapPin,
    title: "Dome Pillar 2 Showroom",
    copy: "Same-day Accra delivery plus nationwide parcel shipping via VIP / Express bus services across all Ghana regions.",
  },
];

function ModularTrustValuesSection({ section }: { section: HomepageSection }) {
  return (
    <section
      className="apple-modular-band"
      style={{ backgroundColor: section.backgroundColor || "#0a0a0c", color: "#f5f5f7" }}
      data-homepage-section-id={section.id}
      data-homepage-section-type={section.type}
    >
      <div className="apple-modular-band__inner">
        <div className="apple-modular-band__header apple-modular-band__header--center">
          <div>
            {section.eyebrow ? (
              <p className="apple-modular-band__eyebrow" style={{ color: "#2997ff" }}>
                {section.eyebrow}
              </p>
            ) : null}
            <h2 className="apple-modular-band__title" style={{ color: "#ffffff" }}>
              {section.heading}
            </h2>
            {section.subtitle ? (
              <p className="apple-modular-band__subtitle" style={{ color: "#a1a1a6" }}>
                {section.subtitle}
              </p>
            ) : null}
          </div>
        </div>

        <div className="apple-modular-trust-grid">
          {TRUST_PILLARS.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <div key={pillar.title} className="apple-modular-trust-card">
                <div className="apple-modular-trust-card__icon">
                  <Icon size={20} />
                </div>
                <h3 className="apple-modular-trust-card__title">{pillar.title}</h3>
                <p className="apple-modular-trust-card__copy">{pillar.copy}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
