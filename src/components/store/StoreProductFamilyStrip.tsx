import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useCms } from "../../cms/CmsContext";
import type { MainStoreConfig, StorePageSection } from "../../cms/types";
import { resolveBuiltInSectionBgStyle } from "./storeSectionStyle";

export function StoreProductFamilyStrip({
  section,
  configOverride,
}: {
  section?: StorePageSection;
  configOverride?: MainStoreConfig;
}) {
  const { mainStore } = useCms();
  const activeConfig = configOverride || mainStore;
  const productFamilies = activeConfig?.productFamilies || [];
  const bgStyle = resolveBuiltInSectionBgStyle(section?.backgroundColor);
  const railRef = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const checkScroll = useCallback(() => {
    const el = railRef.current;
    if (!el) return;
    setCanPrev(el.scrollLeft > 8);
    setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 8);
  }, []);

  useEffect(() => {
    const el = railRef.current;
    if (!el) return;
    checkScroll();
    el.addEventListener("scroll", checkScroll, { passive: true });
    window.addEventListener("resize", checkScroll, { passive: true });
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(checkScroll) : null;
    ro?.observe(el);
    return () => {
      el.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
      ro?.disconnect();
    };
  }, [checkScroll, productFamilies.length]);

  const scrollRail = (dir: "left" | "right") => {
    const el = railRef.current;
    if (!el) return;
    el.scrollBy({
      left: dir === "left" ? -340 : 340,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth",
    });
  };

  return (
    <section
      className="store-family-strip-section"
      aria-label={section?.heading || "Browse by product family"}
      style={bgStyle}
      data-section-id={section?.id || "section-family-strip"}
    >
      <div className="store-family-strip-stage">
        {canPrev && (
          <button
            type="button"
            className="store-family-nav-paddle is-left"
            onClick={() => scrollRail("left")}
            aria-label="Scroll product categories left"
          >
            <ChevronLeft size={18} strokeWidth={2.2} aria-hidden="true" />
          </button>
        )}

        <div ref={railRef} className="store-family-strip-rail">
          {productFamilies.map((family) => (
            <Link key={family.id} to={family.path} className="store-family-item">
              <span className="store-family-img-wrap">
                <img
                  src={family.image}
                  alt={family.alt}
                  loading="eager"
                  decoding="async"
                  fetchPriority="high"
                  className="store-family-img"
                />
              </span>
              <span className="store-family-name">{family.name}</span>
            </Link>
          ))}
        </div>

        {canNext && (
          <button
            type="button"
            className="store-family-nav-paddle is-right"
            onClick={() => scrollRail("right")}
            aria-label="Scroll product categories right"
          >
            <ChevronRight size={18} strokeWidth={2.2} aria-hidden="true" />
          </button>
        )}
      </div>
    </section>
  );
}
