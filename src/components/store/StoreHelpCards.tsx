import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useCms } from "../../cms/CmsContext";
import { defaultMainStoreConfig } from "../../cms/defaultCmsData";
import type { MainStoreConfig, StorePageSection } from "../../cms/types";
import { StoreCarousel } from "./StoreCarousel";
import { resolveBuiltInSectionBgStyle } from "./storeSectionStyle";

export function StoreHelpCards({
  section,
  configOverride,
}: {
  section?: StorePageSection;
  configOverride?: MainStoreConfig;
}) {
  const { mainStore } = useCms();
  const activeConfig = configOverride || mainStore;
  const helpCards = activeConfig?.helpCards?.length
    ? activeConfig.helpCards
    : defaultMainStoreConfig.helpCards || [];

  if (helpCards.length === 0) return null;

  const eyebrow =
    section?.eyebrow !== undefined && section.eyebrow !== ""
      ? section.eyebrow
      : "Ways to save & support.";
  const title = section?.heading?.trim() || "Expert services built for Ghana.";
  const bgStyle = resolveBuiltInSectionBgStyle(section?.backgroundColor);

  return (
    <section
      className="store-section store-help-section"
      aria-labelledby="store-help-title"
      style={bgStyle}
      data-section-id={section?.id || "section-help-cards"}
    >
      <StoreCarousel
        variant="apple"
        titleId="store-help-title"
        eyebrow={eyebrow}
        title={title}
        controlsAriaLabel="Store help and savings carousel navigation"
        trackClassName="store-help-track"
      >
        {helpCards.map((card) => {
          const isExternal = Boolean(card.isExternal || /^https?:\/\//i.test(card.actionPath || ""));
          const cardStyle = card.backgroundColor ? { backgroundColor: card.backgroundColor } : undefined;

          const cardContent = (
            <>
              <div className="store-help-card-copy-block">
                <p className="store-help-card-eyebrow">{card.eyebrow}</p>
                <h3 className="store-help-card-title">{card.title}</h3>
                {card.subtitle && <p className="store-help-card-copy">{card.subtitle}</p>}
              </div>

              <div className="store-help-card-media">
                {card.image && (
                  <img
                    src={card.image}
                    alt={card.alt || card.title}
                    loading="eager"
                    decoding="sync"
                    style={card.imagePosition ? { objectPosition: card.imagePosition } : undefined}
                    className="store-help-card-img"
                  />
                )}
              </div>

              <span className="store-help-circle-cta" aria-hidden="true">
                <ArrowUpRight size={17} strokeWidth={2.2} />
              </span>
            </>
          );

          if (isExternal) {
            return (
              <a
                key={card.id}
                href={card.actionPath}
                target="_blank"
                rel="noopener noreferrer"
                className={`store-help-editorial-card store-help-editorial-${card.theme}`}
                style={cardStyle}
                aria-label={`${card.title} — ${card.actionLabel}`}
              >
                {cardContent}
              </a>
            );
          }

          return (
            <Link
              key={card.id}
              to={card.actionPath || "/contact"}
              className={`store-help-editorial-card store-help-editorial-${card.theme}`}
              style={cardStyle}
              aria-label={`${card.title} — ${card.actionLabel}`}
            >
              {cardContent}
            </Link>
          );
        })}
      </StoreCarousel>
    </section>
  );
}
