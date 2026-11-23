import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useCms } from "../../cms/CmsContext";
import { defaultMainStoreConfig } from "../../cms/defaultCmsData";
import type { MainStoreConfig, MainStorePromoCard, StorePageSection } from "../../cms/types";
import {
  getProductFamily,
  productBuyPath,
  productStoryPath,
} from "../../catalog/productExperience";
import { getPublicPurchaseAction } from "../../catalog/productPurchaseAction";
import { whatsappUrl } from "../../utils/whatsapp";
import type { Product } from "../../types/product";
import { resolveCatalogueProductImage } from "../../utils/productImages";
import { getCardPriceDisplay } from "../../utils/productPricing";
import { StoreCarousel } from "./StoreCarousel";
import {
  buildMixedShelfEntries,
  StoreEditorialPromoTile,
  StoreWhiteProductTile,
} from "./StoreEditorialAndProductTiles";
import { resolveBuiltInSectionBgStyle } from "./storeSectionStyle";

function normalizeSlugToken(slug: string): string {
  return slug.replace(/-inch-/g, "-").trim().toLowerCase();
}

function resolveCatalogProductForCard(
  card: MainStorePromoCard,
  products: Product[]
): Product | undefined {
  if (!products.length) return undefined;

  const lookupKeys = [card.productSlug, card.id].filter((s): s is string => Boolean(s?.trim()));
  for (const key of lookupKeys) {
    const exact = products.find((item) => item.slug === key || item.id === key);
    if (exact) return exact;

    const normKey = normalizeSlugToken(key);
    const normExact = products.find((item) => normalizeSlugToken(item.slug) === normKey);
    if (normExact) return normExact;
  }

  const buyMatch = card.actionPath?.match(/\/shop\/buy-[^/]+\/([^/?#]+)/i);
  if (buyMatch?.[1]) {
    const targetSlug = buyMatch[1].trim().toLowerCase();
    const byAction = products.find(
      (item) =>
        item.slug.toLowerCase() === targetSlug ||
        normalizeSlugToken(item.slug) === normalizeSlugToken(targetSlug)
    );
    if (byAction) return byAction;
  }

  return undefined;
}

/**
 * SHELF 1 — THE LATEST
 * Vibrant 400×500 full-bleed pastel & jewel-tone studio cards matching the uploaded screenshots,
 * with live Supabase GH₵ pricing, stock-aware Buy/View Pricing CTA, and bottom-right > circle.
 */
export function StoreLatestCarousel({
  products,
  section,
  configOverride,
}: {
  products: Product[];
  section?: StorePageSection;
  configOverride?: MainStoreConfig;
}) {
  const { mainStore } = useCms();
  const activeConfig = configOverride || mainStore;
  const cards = activeConfig?.latestCards?.length
    ? activeConfig.latestCards
    : defaultMainStoreConfig.latestCards;

  const eyebrow =
    section?.eyebrow !== undefined && section.eyebrow !== ""
      ? section.eyebrow
      : "The latest.";
  const title = section?.heading?.trim() || "Wonderful and colorful choices.";
  const bgStyle = resolveBuiltInSectionBgStyle(section?.backgroundColor);
  const headerRight =
    section?.buttonLabel && section?.buttonDestination ? (
      <Link to={section.buttonDestination} className="store-section-header-link">
        {section.buttonLabel} <ChevronRight size={14} aria-hidden="true" />
      </Link>
    ) : undefined;

  return (
    <section
      className="store-section store-latest-section"
      aria-labelledby="store-latest-title"
      style={bgStyle}
      data-section-id={section?.id || "section-latest-carousel"}
    >
      <StoreCarousel
        variant="apple"
        titleId="store-latest-title"
        eyebrow={eyebrow}
        title={title}
        controlsAriaLabel="The latest products carousel navigation"
        trackClassName="store-latest-track"
        headerRight={headerRight}
      >
        {cards.map((card, index) => {
          const product = resolveCatalogProductForCard(card, products);
          const catalogImg = product ? resolveCatalogueProductImage(product) : null;
          const imageSrc = card.image?.trim() || catalogImg?.src || "";
          const imageAlt = card.alt || catalogImg?.alt || card.name;
          const theme = card.theme || "light";

          const action = product ? getPublicPurchaseAction(product) : undefined;
          const isPreOrderDestination = Boolean(card.actionPath?.startsWith("/pre-order"));

          let actionLabel = card.actionLabel || "Buy";
          let actionPath = card.actionPath;
          if (action === "buy" && product) {
            actionLabel = "Buy";
            if (!actionPath || isPreOrderDestination) {
              actionPath = productBuyPath(getProductFamily(product), product.slug);
            }
          } else if (action === "enquire") {
            actionLabel = "Enquire";
            actionPath = whatsappUrl(
              `Hello Buy & Sell GH, I would like to enquire about ${product?.name || card.name}. Please confirm availability and pricing.`
            );
          } else if (isPreOrderDestination) {
            actionLabel = card.actionLabel || "Pre-order";
          } else if (product) {
            actionLabel = "View Pricing";
            actionPath = actionPath || productBuyPath(getProductFamily(product), product.slug);
          }

          const learnMorePath =
            card.learnMorePath ||
            (product ? productStoryPath(getProductFamily(product), product.slug) : actionPath || "/store");

          let priceText = "";
          let previousPriceText: string | undefined;
          if (product) {
            const pd = getCardPriceDisplay(product);
            priceText = pd.isEnquiry
              ? isPreOrderDestination
                ? "Pre-order · Price on enquiry"
                : "Price on enquiry"
              : pd.current;
            previousPriceText = pd.previous;
          } else if (isPreOrderDestination) {
            priceText = "Pre-order · Price on enquiry";
          }

          const isExternalAction = Boolean(actionPath && /^https?:\/\//i.test(actionPath));
          const cardStyle = card.backgroundColor ? { backgroundColor: card.backgroundColor } : undefined;

          return (
            <article
              key={card.id}
              className={`store-vibrant-card is-${theme}`}
              style={cardStyle}
              data-product-slug={product?.slug || card.id}
            >
              {imageSrc && (
                <img
                  src={imageSrc}
                  alt={imageAlt}
                  loading="eager"
                  decoding="async"
                  fetchPriority={index < 3 ? "high" : "auto"}
                  className="store-vibrant-card-bg"
                />
              )}

              <Link
                to={learnMorePath}
                className="store-vibrant-card-overlay-link"
                aria-label={`Explore ${card.name}`}
              />

              <div className="store-vibrant-card-copy">
                {card.eyebrow && <p className="store-vibrant-card-eyebrow">{card.eyebrow}</p>}
                <h3 className="store-vibrant-card-title">{card.name}</h3>
                {card.statement && <p className="store-vibrant-card-statement">{card.statement}</p>}
                {priceText && (
                  <p className="store-vibrant-card-price">
                    <span>From {priceText.replace(/^From\s+/i, "")}</span>
                    {previousPriceText && (
                      <span className="store-vibrant-card-price-old">{previousPriceText}</span>
                    )}
                  </p>
                )}
              </div>

              <div className="store-vibrant-card-footer">
                {isExternalAction ? (
                  <a
                    href={actionPath}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="store-vibrant-buy-pill"
                    aria-label={`${actionLabel} ${card.name}`}
                  >
                    {actionLabel}
                  </a>
                ) : (
                  <Link
                    to={actionPath || learnMorePath}
                    className="store-vibrant-buy-pill"
                    aria-label={`${actionLabel} ${card.name}`}
                  >
                    {actionLabel}
                  </Link>
                )}

                {isExternalAction ? (
                  <a
                    href={actionPath}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="store-tile-circle-cta is-inline"
                    aria-label={`Go to ${card.name}`}
                  >
                    <ChevronRight size={18} strokeWidth={2.3} aria-hidden="true" />
                  </a>
                ) : (
                  <Link
                    to={actionPath || learnMorePath}
                    className="store-tile-circle-cta is-inline"
                    aria-label={`Go to ${card.name}`}
                  >
                    <ChevronRight size={18} strokeWidth={2.3} aria-hidden="true" />
                  </Link>
                )}
              </div>
            </article>
          );
        })}
      </StoreCarousel>
    </section>
  );
}

/**
 * SHELF 2 — FEATURED PICKS (formerly "More to love")
 * Mixed-width shelf matching Screenshot Shelf 2:
 * Leading Crimson Red 400×500 editorial card + 313×500 white flagship product tiles
 * + Lavender 400×500 editorial card + Watch/Mac white product tiles.
 */
export function StoreMoreToLoveCarousel({
  products,
  section,
  configOverride,
}: {
  products: Product[];
  section?: StorePageSection;
  configOverride?: MainStoreConfig;
}) {
  const { mainStore } = useCms();
  const activeConfig = configOverride || mainStore;
  const editorials =
    activeConfig?.featuredEditorialCards !== undefined
      ? activeConfig.featuredEditorialCards
      : defaultMainStoreConfig.featuredEditorialCards || [];
  const productItems = activeConfig?.featuredProductItems?.length
    ? activeConfig.featuredProductItems
    : defaultMainStoreConfig.featuredProductItems || [];

  const entries = buildMixedShelfEntries(editorials, productItems, products);
  if (entries.length === 0) return null;

  const eyebrow =
    section?.eyebrow !== undefined && section.eyebrow !== ""
      ? section.eyebrow
      : "Featured picks.";
  const title = section?.heading?.trim() || "Make your next upgrade unforgettable.";
  const bgStyle = resolveBuiltInSectionBgStyle(section?.backgroundColor);
  const headerRight =
    section?.buttonLabel && section?.buttonDestination ? (
      <Link to={section.buttonDestination} className="store-section-header-link">
        {section.buttonLabel} <ChevronRight size={14} aria-hidden="true" />
      </Link>
    ) : undefined;

  return (
    <section
      className="store-section store-featured-picks-section"
      aria-labelledby="store-featured-title"
      style={bgStyle}
      data-section-id={section?.id || "section-more-to-love"}
    >
      <StoreCarousel
        variant="apple"
        titleId="store-featured-title"
        eyebrow={eyebrow}
        title={title}
        controlsAriaLabel="Featured picks carousel navigation"
        trackClassName="store-mixed-track"
        headerRight={headerRight}
      >
        {entries.map((entry) =>
          entry.kind === "editorial" ? (
            <StoreEditorialPromoTile key={`ed-${entry.tile.id}`} tile={entry.tile} />
          ) : (
            <StoreWhiteProductTile
              key={`prod-${entry.product.id}`}
              item={entry.item}
              product={entry.product}
            />
          )
        )}
      </StoreCarousel>
    </section>
  );
}
