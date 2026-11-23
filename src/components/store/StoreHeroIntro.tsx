import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useCms } from "../../cms/CmsContext";
import { defaultMainStoreConfig } from "../../cms/defaultCmsData";
import type { MainStoreConfig, StorePageSection } from "../../cms/types";
import { intentWhatsAppUrl } from "../../utils/whatsapp";
import { resolveBuiltInSectionBgStyle } from "./storeSectionStyle";

export function StoreHeroIntro({
  section,
  configOverride,
}: {
  section?: StorePageSection;
  configOverride?: MainStoreConfig;
}) {
  const { mainStore } = useCms();
  const activeConfig = configOverride || mainStore;
  const hero = {
    ...(defaultMainStoreConfig.heroConfig!),
    ...(activeConfig?.heroConfig || {}),
  };

  const titleLead = hero.titleLead?.trim() || section?.heading?.trim() || "Store";
  const tagline = hero.tagline?.trim() || section?.subtitle?.trim() || "Original Apple & curated tech across Ghana.";
  const emblemSrc =
    hero.emblemImage?.trim() ||
    section?.desktopImage?.trim() ||
    "/products/store-redesign/hero-store-emblem.webp";
  const emblemAlt = hero.emblemAlt || section?.imageAlt || "Buy & Sell GH Store emblem";

  const supportLabel = hero.supportLabel?.trim() || section?.buttonLabel?.trim() || "Chat on WhatsApp";
  const supportUrl = hero.supportUrl?.trim() || intentWhatsAppUrl("general");
  const isSupportExternal = /^https?:\/\//i.test(supportUrl);

  const showroomLabel =
    hero.showroomLabel?.trim() || section?.secondaryButtonLabel?.trim() || "Visit Dome Pillar 2";
  const showroomUrl = hero.showroomUrl?.trim() || section?.secondaryButtonDestination?.trim() || "/contact";
  const isShowroomExternal = /^https?:\/\//i.test(showroomUrl);

  const bgStyle = resolveBuiltInSectionBgStyle(section?.backgroundColor);

  return (
    <section
      className="store-intro-section store-intro-editorial"
      aria-labelledby="store-intro-title"
      style={bgStyle}
      data-section-id={section?.id || "section-store-intro"}
    >
      <div className="store-intro-container store-intro-editorial-grid">
        <div className="store-intro-left">
          <h1 id="store-intro-title" className="store-intro-wordmark">
            {titleLead}
          </h1>
        </div>

        <div className="store-intro-center" aria-hidden={!emblemSrc}>
          {emblemSrc && (
            <img
              src={emblemSrc}
              alt={emblemAlt}
              loading="eager"
              decoding="async"
              fetchPriority="high"
              className="store-intro-emblem-img"
            />
          )}
        </div>

        <div className="store-intro-right" aria-label="Store mission and direct support links">
          <p className="store-intro-tagline">{tagline}</p>

          <div className="store-intro-links">
            {isSupportExternal ? (
              <a
                href={supportUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="store-intro-action-link"
              >
                <span>{supportLabel}</span>
                <ArrowUpRight size={14} strokeWidth={2} aria-hidden="true" />
              </a>
            ) : (
              <Link to={supportUrl} className="store-intro-action-link">
                <span>{supportLabel}</span>
                <ArrowUpRight size={14} strokeWidth={2} aria-hidden="true" />
              </Link>
            )}

            {isShowroomExternal ? (
              <a
                href={showroomUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="store-intro-action-link"
              >
                <span>{showroomLabel}</span>
                <ArrowUpRight size={14} strokeWidth={2} aria-hidden="true" />
              </a>
            ) : (
              <Link to={showroomUrl} className="store-intro-action-link">
                <span>{showroomLabel}</span>
                <ArrowUpRight size={14} strokeWidth={2} aria-hidden="true" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
