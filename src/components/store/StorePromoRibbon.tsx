import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useCms } from "../../cms/CmsContext";
import { defaultMainStoreConfig } from "../../cms/defaultCmsData";
import type { MainStoreConfig, StorePageSection } from "../../cms/types";

export function StorePromoRibbon({
  section,
  configOverride,
}: {
  section?: StorePageSection;
  configOverride?: MainStoreConfig;
}) {
  const { mainStore } = useCms();
  const activeConfig = configOverride || mainStore;
  const rawSlides =
    activeConfig?.promoRibbonSlides && activeConfig.promoRibbonSlides.length > 0
      ? activeConfig.promoRibbonSlides
      : defaultMainStoreConfig.promoRibbonSlides || [];

  const slides = rawSlides.filter((slide) => slide.visible !== false && slide.text.trim() !== "");
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = window.setInterval(() => {
      setIndex((prev) => (prev + 1) % slides.length);
    }, 6500);
    return () => window.clearInterval(timer);
  }, [slides.length]);

  if (slides.length === 0) return null;

  const activeIndex = index % slides.length;
  const current = slides[activeIndex];
  const isExternal = Boolean(current.linkTo && /^https?:\/\//i.test(current.linkTo));

  const goPrev = () => setIndex((prev) => (prev - 1 + slides.length) % slides.length);
  const goNext = () => setIndex((prev) => (prev + 1) % slides.length);

  return (
    <div
      className="store-promo-ribbon"
      role="region"
      aria-label="Store announcements and offers"
      data-section-id={section?.id || "section-promo-ribbon"}
      style={
        section?.backgroundColor && section.backgroundColor !== "#f5f5f7"
          ? { backgroundColor: section.backgroundColor }
          : undefined
      }
    >
      <div className="store-promo-ribbon-inner">
        {slides.length > 1 ? (
          <button
            type="button"
            className="store-promo-ribbon-arrow"
            onClick={goPrev}
            aria-label="Previous offer"
          >
            <ChevronLeft size={16} strokeWidth={1.8} aria-hidden="true" />
          </button>
        ) : (
          <span className="store-promo-ribbon-spacer" aria-hidden="true" />
        )}

        <p className="store-promo-ribbon-copy">
          <span>{current.text}</span>
          {current.linkLabel && current.linkTo && (
            <>
              {" "}
              {isExternal ? (
                <a
                  href={current.linkTo}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="store-promo-ribbon-link"
                >
                  {current.linkLabel} <ChevronRight size={13} aria-hidden="true" />
                </a>
              ) : (
                <Link to={current.linkTo} className="store-promo-ribbon-link">
                  {current.linkLabel} <ChevronRight size={13} aria-hidden="true" />
                </Link>
              )}
            </>
          )}
        </p>

        {slides.length > 1 ? (
          <button
            type="button"
            className="store-promo-ribbon-arrow"
            onClick={goNext}
            aria-label="Next offer"
          >
            <ChevronRight size={16} strokeWidth={1.8} aria-hidden="true" />
          </button>
        ) : (
          <span className="store-promo-ribbon-spacer" aria-hidden="true" />
        )}
      </div>
    </div>
  );
}
