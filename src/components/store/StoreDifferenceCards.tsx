import {
  ArrowUpRight,
  ChevronRight,
  CreditCard,
  Gift,
  MessageCircle,
  Plus,
  RefreshCw,
  ShieldCheck,
  Tag,
  Truck,
  Wrench,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useCms } from "../../cms/CmsContext";
import { defaultMainStoreConfig } from "../../cms/defaultCmsData";
import type {
  MainStoreConfig,
  MainStoreDifferenceMiniCard,
  StorePageSection,
} from "../../cms/types";
import { StoreCarousel } from "./StoreCarousel";
import { resolveBuiltInSectionBgStyle } from "./storeSectionStyle";

const MINI_ICON_MAP = {
  trade: RefreshCw,
  installment: CreditCard,
  shield: ShieldCheck,
  delivery: Truck,
  repair: Wrench,
  support: MessageCircle,
  gift: Gift,
  tag: Tag,
} as const;

function BentoMiniCard({ card }: { card: MainStoreDifferenceMiniCard }) {
  const Icon = MINI_ICON_MAP[card.icon] || ShieldCheck;
  const isExternal = /^https?:\/\//i.test(card.destination || "");
  const isDark = card.theme === "dark";

  const inner = (
    <>
      <div className="store-bento-mini-top">
        <span className="store-bento-mini-icon" aria-hidden="true">
          <Icon size={24} strokeWidth={2} />
        </span>
        {card.eyebrow && <p className="store-bento-mini-eyebrow">{card.eyebrow}</p>}
        <h3 className="store-bento-mini-title">{card.title}</h3>
        {card.subtitle && <p className="store-bento-mini-subtitle">{card.subtitle}</p>}
      </div>
      <span className="store-bento-mini-btn" aria-hidden="true">
        <Plus size={16} strokeWidth={2.4} />
      </span>
    </>
  );

  if (isExternal) {
    return (
      <a
        href={card.destination}
        target="_blank"
        rel="noopener noreferrer"
        className={`store-bento-mini-card ${isDark ? "is-dark" : "is-light"}`}
        style={{ backgroundColor: card.backgroundColor }}
        aria-label={card.actionLabel ? `${card.title} — ${card.actionLabel}` : card.title}
      >
        {inner}
      </a>
    );
  }

  return (
    <Link
      to={card.destination || "/store"}
      className={`store-bento-mini-card ${isDark ? "is-dark" : "is-light"}`}
      style={{ backgroundColor: card.backgroundColor }}
      aria-label={card.actionLabel ? `${card.title} — ${card.actionLabel}` : card.title}
    >
      {inner}
    </Link>
  );
}

/**
 * SHELF 4 — THE BUY & SELL GH DIFFERENCE
 * Asymmetric Bento-in-Carousel matching the uploaded screenshot Shelf 4:
 * Interleaves full-height 400×500 vibrant studio cards (Navy, Yellow, Sky, Pink)
 * with stacked pairs of 313×241 colored icon cards (Plum+Lavender, Mint+Ocean Blue).
 */
export function StoreDifferenceCards({
  section,
  configOverride,
}: {
  section?: StorePageSection;
  configOverride?: MainStoreConfig;
}) {
  const { mainStore } = useCms();
  const activeConfig = configOverride || mainStore;
  const items = activeConfig?.differenceItems?.length
    ? activeConfig.differenceItems
    : defaultMainStoreConfig.differenceItems || [];

  if (items.length === 0) return null;

  const eyebrow =
    section?.eyebrow !== undefined && section.eyebrow !== ""
      ? section.eyebrow
      : "The Buy & Sell GH difference.";
  const title = section?.heading?.trim() || "Even more reasons to shop with us.";
  const bgStyle = resolveBuiltInSectionBgStyle(section?.backgroundColor);

  return (
    <section
      className="store-section store-diff-section"
      aria-labelledby="store-diff-title"
      style={bgStyle}
      data-section-id={section?.id || "section-difference-cards"}
    >
      <StoreCarousel
        variant="apple"
        titleId="store-diff-title"
        eyebrow={eyebrow}
        title={title}
        controlsAriaLabel="Buy & Sell GH difference carousel navigation"
        trackClassName="store-bento-track"
      >
        {items.map((item) => {
          if (item.kind === "stack" && item.topCard && item.bottomCard) {
            return (
              <div key={item.id} className="store-bento-stack-col">
                <BentoMiniCard card={item.topCard} />
                <BentoMiniCard card={item.bottomCard} />
              </div>
            );
          }

          const isDark = item.theme === "dark";
          const destination = item.destination || "/store";
          const isExternal = Boolean(item.isExternal || /^https?:\/\//i.test(destination));
          const cardStyle = item.backgroundColor
            ? { backgroundColor: item.backgroundColor }
            : undefined;

          const inner = (
            <>
              {item.image && (
                <img
                  src={item.image}
                  alt={item.alt || item.title || "Buy & Sell GH highlight"}
                  loading="eager"
                  decoding="async"
                  className="store-editorial-tile-bg"
                />
              )}
              <div className="store-editorial-tile-copy">
                {item.eyebrow && <p className="store-editorial-tile-eyebrow">{item.eyebrow}</p>}
                {item.title && <h3 className="store-editorial-tile-title">{item.title}</h3>}
                {item.subtitle && <p className="store-editorial-tile-subtitle">{item.subtitle}</p>}
              </div>
              <span className="store-tile-circle-cta" aria-hidden="true">
                {isExternal ? (
                  <ArrowUpRight size={17} strokeWidth={2.2} />
                ) : (
                  <ChevronRight size={18} strokeWidth={2.3} />
                )}
              </span>
            </>
          );

          if (isExternal) {
            return (
              <a
                key={item.id}
                href={destination}
                target="_blank"
                rel="noopener noreferrer"
                className={`store-editorial-tile ${isDark ? "is-dark" : "is-light"}`}
                style={cardStyle}
                aria-label={item.actionLabel ? `${item.title} — ${item.actionLabel}` : item.title}
              >
                {inner}
              </a>
            );
          }

          return (
            <Link
              key={item.id}
              to={destination}
              className={`store-editorial-tile ${isDark ? "is-dark" : "is-light"}`}
              style={cardStyle}
              aria-label={item.actionLabel ? `${item.title} — ${item.actionLabel}` : item.title}
            >
              {inner}
            </Link>
          );
        })}
      </StoreCarousel>
    </section>
  );
}
