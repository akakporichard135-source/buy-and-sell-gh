import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";

interface StoreCarouselProps {
  id?: string;
  titleId?: string;
  label?: string;
  eyebrow?: string;
  title?: string;
  headingLead?: string;
  headingRest?: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
  trackClassName?: string;
  controlsAriaLabel?: string;
  showControls?: boolean;
  headerRight?: ReactNode;
  step?: number;
  variant?: "default" | "apple";
  /** Accent tint for the split-color shelf heading lead (matches screenshot shelves) */
  leadColor?: string;
}

function formatAppleLeadPhrase(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return "";
  const isAllUpper = trimmed === trimmed.toUpperCase() && /[A-Z]/.test(trimmed);
  let formatted = trimmed;
  if (isAllUpper) {
    formatted = trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();
    formatted = formatted
      .replace(/\bbuy & sell gh\b/gi, "Buy & Sell GH")
      .replace(/\biphone\b/gi, "iPhone")
      .replace(/\bipad\b/gi, "iPad")
      .replace(/\bairpods\b/gi, "AirPods")
      .replace(/\bmacbook\b/gi, "MacBook")
      .replace(/\bapple\b/gi, "Apple");
  }
  return /[.!?]$/.test(formatted) ? formatted : `${formatted}.`;
}

export function StoreCarousel({
  id,
  titleId,
  label,
  eyebrow,
  title,
  headingLead,
  headingRest,
  subtitle,
  children,
  className = "",
  trackClassName = "",
  controlsAriaLabel,
  showControls = true,
  headerRight,
  step,
  variant = "default",
  leadColor,
}: StoreCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 8);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 8);
  }, []);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;

    el.scrollLeft = 0;
    checkScroll();

    let rafId: number | undefined;
    const onScroll = () => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(checkScroll);
    };

    el.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", checkScroll, { passive: true });

    const mutationObserver = new MutationObserver(checkScroll);
    mutationObserver.observe(el, { childList: true, subtree: true });

    const resizeObserver =
      typeof ResizeObserver !== "undefined" ? new ResizeObserver(checkScroll) : null;
    resizeObserver?.observe(el);

    return () => {
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", checkScroll);
      mutationObserver.disconnect();
      resizeObserver?.disconnect();
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [checkScroll]);

  const scroll = (direction: "left" | "right") => {
    const el = trackRef.current;
    if (!el) return;

    const scrollAmount = step || Math.max(el.clientWidth * 0.72, 330);
    el.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth",
    });
  };

  if (variant === "apple") {
    const resolvedLead = headingLead?.trim() || (eyebrow ? formatAppleLeadPhrase(eyebrow) : "");
    const resolvedRest = headingRest?.trim() || title?.trim() || "";
    const hasAppleHeader = Boolean(resolvedLead || resolvedRest || headerRight);
    const regionLabel = label || [resolvedLead, resolvedRest].filter(Boolean).join(" ") || "Horizontal shelf";
    const hasOverflow = canScrollLeft || canScrollRight;

    return (
      <div id={id} className={`store-carousel-wrapper store-carousel-apple ${className}`}>
        {hasAppleHeader && (
          <div className="store-container">
            <div className="store-apple-header-row">
              <h2 id={titleId} className="store-apple-heading">
                {resolvedLead && (
                  <span
                    className="store-apple-heading-lead"
                    style={leadColor ? { color: leadColor } : undefined}
                  >
                    {resolvedLead}
                  </span>
                )}
                {resolvedLead && resolvedRest ? " " : null}
                {resolvedRest && (
                  <span className="store-apple-heading-rest">{resolvedRest}</span>
                )}
              </h2>
              {headerRight && (
                <div className="store-apple-header-right">{headerRight}</div>
              )}
            </div>
          </div>
        )}

        <div className="store-carousel-stage">
          <div
            ref={trackRef}
            className={`store-carousel-track store-carousel-track-bleed ${trackClassName}`}
            tabIndex={0}
            role="region"
            aria-label={regionLabel}
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

        {/* Bottom-right circular < > paddles matching the uploaded reference screenshots */}
        {showControls && hasOverflow && (
          <div className="store-container">
            <div
              className="store-shelf-bottom-paddles"
              role="group"
              aria-label={controlsAriaLabel || `${regionLabel} navigation`}
            >
              <button
                type="button"
                className="store-shelf-paddle-btn"
                onClick={() => scroll("left")}
                disabled={!canScrollLeft}
                aria-label={`Previous items in ${regionLabel}`}
              >
                <ChevronLeft size={18} strokeWidth={2.2} aria-hidden="true" />
              </button>
              <button
                type="button"
                className="store-shelf-paddle-btn"
                onClick={() => scroll("right")}
                disabled={!canScrollRight}
                aria-label={`Next items in ${regionLabel}`}
              >
                <ChevronRight size={18} strokeWidth={2.2} aria-hidden="true" />
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  const hasHeader = Boolean(eyebrow || title || subtitle || showControls || headerRight);

  return (
    <div id={id} className={`store-carousel-wrapper ${className}`}>
      {hasHeader && (
        <div className="store-carousel-header-row">
          <div className="store-carousel-header-copy">
            {eyebrow && <p className="store-carousel-eyebrow">{eyebrow}</p>}
            {title && (
              <h2 id={titleId} className="store-carousel-title">
                {title}
              </h2>
            )}
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
