import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";

interface StoreCarouselProps {
  id?: string;
  label?: string;
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
  trackClassName?: string;
  controlsAriaLabel?: string;
  showControls?: boolean;
  headerRight?: ReactNode;
  step?: number;
}

export function StoreCarousel({
  id,
  label,
  eyebrow,
  title,
  subtitle,
  children,
  className = "",
  trackClassName = "",
  controlsAriaLabel,
  showControls = true,
  headerRight,
  step,
}: StoreCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 6);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 6);
  }, []);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;

    // Guarantee the first card always starts fully visible at initial render
    el.scrollLeft = 0;
    checkScroll();

    let timeoutId: number | undefined;
    const onScroll = () => {
      if (timeoutId) cancelAnimationFrame(timeoutId);
      timeoutId = requestAnimationFrame(checkScroll);
    };

    el.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", checkScroll, { passive: true });

    // Mutation observer for dynamic children loading
    const observer = new MutationObserver(checkScroll);
    observer.observe(el, { childList: true, subtree: true });

    return () => {
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", checkScroll);
      observer.disconnect();
      if (timeoutId) cancelAnimationFrame(timeoutId);
    };
  }, [checkScroll]);

  const scroll = (direction: "left" | "right") => {
    const el = trackRef.current;
    if (!el) return;

    const scrollAmount = step || Math.max(el.clientWidth * 0.72, 320);
    el.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth",
    });
  };

  const hasHeader = Boolean(eyebrow || title || subtitle || showControls || headerRight);

  return (
    <div id={id} className={`store-carousel-wrapper ${className}`}>
      {hasHeader && (
        <div className="store-carousel-header-row">
          <div className="store-carousel-header-copy">
            {eyebrow && <p className="store-carousel-eyebrow">{eyebrow}</p>}
            {title && <h2 className="store-carousel-title">{title}</h2>}
            {subtitle && <p className="store-carousel-subtitle">{subtitle}</p>}
          </div>

          <div className="store-carousel-header-actions">
            {headerRight}
            {showControls && (
              <div
                className="store-carousel-controls"
                aria-label={controlsAriaLabel || `${title || "Carousel"} navigation`}
              >
                <button
                  type="button"
                  className="store-carousel-btn store-carousel-prev"
                  onClick={() => scroll("left")}
                  disabled={!canScrollLeft}
                  aria-label="Previous items"
                >
                  <ChevronLeft size={20} strokeWidth={2.4} aria-hidden="true" />
                </button>
                <button
                  type="button"
                  className="store-carousel-btn store-carousel-next"
                  onClick={() => scroll("right")}
                  disabled={!canScrollRight}
                  aria-label="Next items"
                >
                  <ChevronRight size={20} strokeWidth={2.4} aria-hidden="true" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <div
        ref={trackRef}
        className={`store-carousel-track ${trackClassName}`}
        tabIndex={0}
        role="region"
        aria-label={label || title || "Horizontal scroll"}
        onKeyDown={(event) => {
          if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
            event.preventDefault();
            scroll(event.key === "ArrowLeft" ? "left" : "right");
          }
        }}
      >
        {children}
      </div>
    </div>
  );
}
