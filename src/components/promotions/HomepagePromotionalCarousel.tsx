import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import type { PromotionCampaign } from "../../types/promotion";
import { isPromotionCurrentlyActive } from "../../promotions/promotionEngine";
import { recordPromotionClick, recordPromotionView } from "../../promotions/supabasePromotionsRepository";

export function HomepagePromotionalCarousel() {
  const { promotions, refreshPromotions } = useCart();
  const trackRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchDelta, setTouchDelta] = useState(0);

  // Revalidate fresh promotions on mount
  useEffect(() => {
    void refreshPromotions();
  }, [refreshPromotions]);

  // Filter only active campaigns configured for homepage carousel that have a flyer
  const flyerCampaigns = useMemo(() => {
    return promotions.filter(
      (p) =>
        isPromotionCurrentlyActive(p) &&
        p.showOnHomepageCarousel &&
        (p.desktopFlyerUrl || p.mobileFlyerUrl)
    ).sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
  }, [promotions]);

  // Record impression for active flyers
  useEffect(() => {
    if (flyerCampaigns.length > 0) {
      flyerCampaigns.forEach((c) => void recordPromotionView(c.id));
    }
  }, [flyerCampaigns]);

  // Auto-slide effect
  useEffect(() => {
    if (flyerCampaigns.length <= 1 || isPaused) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % flyerCampaigns.length);
    }, 5500);

    return () => clearInterval(timer);
  }, [flyerCampaigns.length, isPaused]);

  // Keep track scrolled smoothly to active slide
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const slide = track.children[currentIndex] as HTMLElement | undefined;
    if (slide) {
      slide.scrollIntoView({
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
        block: "nearest",
        inline: "center",
      });
    }
  }, [currentIndex]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? flyerCampaigns.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % flyerCampaigns.length);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsPaused(true);
    setTouchStart(e.touches[0].clientX);
    setTouchDelta(0);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    const currentX = e.touches[0].clientX;
    setTouchDelta(currentX - touchStart);
  };

  const handleTouchEnd = () => {
    if (touchStart !== null) {
      if (touchDelta < -40) {
        handleNext();
      } else if (touchDelta > 40) {
        handlePrev();
      }
    }
    setTouchStart(null);
    setTouchDelta(0);
    setIsPaused(false);
  };

  // If no active promotional flyers, cleanly hide section
  if (flyerCampaigns.length === 0) return null;

  return (
    <section
      className="homepage-promo-carousel-section"
      data-testid="promotional-carousel"
      id="promotions"
      aria-labelledby="promo-carousel-heading"
      style={{
        padding: "60px 20px 70px",
        background: "#ffffff",
        position: "relative",
        scrollMarginTop: "calc(var(--global-header-height, 44px) + 24px)",
      }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            marginBottom: 28,
            flexWrap: "wrap",
            gap: 16,
          }}
        >
          <div>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                fontSize: "0.8rem",
                fontWeight: 700,
                color: "#d4af37",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                marginBottom: 6,
              }}
            >
              <Sparkles size={14} />
              <span>Special Offers &amp; Campaigns</span>
            </div>
            <h2
              id="promo-carousel-heading"
              style={{
                fontSize: "clamp(1.75rem, 3.5vw, 2.5rem)",
                fontWeight: 700,
                color: "#1d1d1f",
                letterSpacing: "-0.02em",
                margin: 0,
                lineHeight: 1.15,
                overflowWrap: "break-word",
                wordBreak: "normal",
              }}
            >
              Special Offers. More to Love.
            </h2>
            <p
              style={{
                fontSize: "1rem",
                color: "#6e6e73",
                margin: "6px 0 0",
                maxWidth: 640,
                lineHeight: 1.45,
                overflowWrap: "break-word",
                wordBreak: "normal",
              }}
            >
              Discover active promotional packages, free gifts, and seasonal savings on authentic Apple devices.
            </p>
          </div>

          {/* Navigation Controls */}
          {flyerCampaigns.length > 1 && (
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <button
                type="button"
                aria-label="Previous promotional flyer"
                onClick={handlePrev}
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: "50%",
                  border: "1px solid #d2d2d7",
                  background: "#ffffff",
                  color: "#1d1d1f",
                  display: "grid",
                  placeItems: "center",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
              >
                <ChevronLeft size={20} />
              </button>
              <button
                type="button"
                aria-label="Next promotional flyer"
                onClick={handleNext}
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: "50%",
                  border: "1px solid #d2d2d7",
                  background: "#ffffff",
                  color: "#1d1d1f",
                  display: "grid",
                  placeItems: "center",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
              >
                <ChevronRight size={20} />
              </button>
            </div>
          )}
        </div>

        {/* Carousel Track */}
        <div
          ref={trackRef}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{
            display: "grid",
            gridAutoFlow: "column",
            gridAutoColumns: "min(100%, 860px)",
            gap: 20,
            overflowX: "auto",
            scrollSnapType: "x mandatory",
            scrollbarWidth: "none",
            WebkitOverflowScrolling: "touch",
            padding: "4px 0 16px",
          }}
        >
          {flyerCampaigns.map((campaign, idx) => {
            const isSlideActive = idx === currentIndex;
            const desktopImg = campaign.desktopFlyerUrl || campaign.mobileFlyerUrl;
            const mobileImg = campaign.mobileFlyerUrl || campaign.desktopFlyerUrl;
            const destination = campaign.ctaDestination || `/offers#${campaign.slug}`;

            return (
              <div
                key={campaign.id}
                style={{
                  scrollSnapAlign: "center",
                  borderRadius: 22,
                  overflow: "hidden",
                  boxShadow: isSlideActive
                    ? "0 12px 36px rgba(0, 0, 0, 0.08), 0 2px 6px rgba(0, 0, 0, 0.04)"
                    : "0 4px 16px rgba(0, 0, 0, 0.04)",
                  background: "#fbfbfd",
                  border: "1px solid #e5e5ea",
                  transition: "transform 0.3s ease, box-shadow 0.3s ease",
                  transform: isSlideActive ? "scale(1)" : "scale(0.985)",
                }}
              >
                <Link
                  to={destination}
                  onClick={() => void recordPromotionClick(campaign.id)}
                  style={{
                    display: "block",
                    textDecoration: "none",
                    color: "inherit",
                    position: "relative",
                  }}
                  aria-label={`${campaign.title}: ${campaign.shortDescription}`}
                >
                  <picture>
                    {mobileImg && mobileImg !== desktopImg && (
                      <source media="(max-width: 640px)" srcSet={mobileImg} />
                    )}
                    <img
                      src={desktopImg}
                      alt={campaign.flyerAltText || campaign.title}
                      loading="lazy"
                      style={{
                        width: "100%",
                        height: "auto",
                        aspectRatio: "16 / 9",
                        objectFit: "cover",
                        display: "block",
                      }}
                      onError={(e) => {
                        // Fallback placeholder card if image URL fails
                        const target = e.currentTarget;
                        target.style.display = "none";
                        const parent = target.parentElement;
                        if (parent) {
                          parent.style.minHeight = "240px";
                          parent.style.display = "flex";
                          parent.style.alignItems = "center";
                          parent.style.justifyContent = "center";
                          parent.style.background = "linear-gradient(135deg, #f5f5f7 0%, #e5e5ea 100%)";
                        }
                      }}
                    />
                  </picture>

                  {/* Caption & Call to Action overlay */}
                  <div
                    style={{
                      padding: "20px 24px",
                      background: "#ffffff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 16,
                      flexWrap: "wrap",
                      borderTop: "1px solid #f0f0f2",
                    }}
                  >
                    <div>
                      <span
                        style={{
                          display: "inline-block",
                          background: "#fef3c7",
                          color: "#92400e",
                          fontSize: "0.75rem",
                          fontWeight: 700,
                          padding: "2px 8px",
                          borderRadius: 999,
                          marginBottom: 4,
                        }}
                      >
                        {campaign.promotionType === "free_gift"
                          ? "Free Gift Included"
                          : campaign.promotionType === "percentage_discount"
                          ? `${campaign.discountPercent}% Off`
                          : campaign.promotionType === "fixed_discount"
                          ? `Save GH₵ ${campaign.discountAmount}`
                          : "Exclusive Offer"}
                      </span>
                      <h3
                        style={{
                          fontSize: "1.2rem",
                          fontWeight: 700,
                          color: "#1d1d1f",
                          margin: 0,
                          overflowWrap: "break-word",
                          wordBreak: "normal",
                        }}
                      >
                        {campaign.title}
                      </h3>
                      <p
                        style={{
                          fontSize: "0.88rem",
                          color: "#6e6e73",
                          margin: "4px 0 0",
                          maxWidth: 580,
                          lineHeight: 1.4,
                          overflowWrap: "break-word",
                          wordBreak: "normal",
                        }}
                      >
                        {campaign.shortDescription}
                      </p>
                    </div>

                    <span
                      className="apple-checkout-btn-primary is-gold"
                      style={{
                        padding: "10px 18px",
                        fontSize: "0.88rem",
                        fontWeight: 600,
                        whiteSpace: "nowrap",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        pointerEvents: "none",
                      }}
                    >
                      <span>{campaign.ctaText || "View Offer"}</span>
                      <ChevronRight size={15} />
                    </span>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>

        {/* Dot Indicators */}
        {flyerCampaigns.length > 1 && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              marginTop: 18,
            }}
          >
            {flyerCampaigns.map((_, idx) => (
              <button
                key={idx}
                type="button"
                aria-label={`Go to slide ${idx + 1}`}
                onClick={() => setCurrentIndex(idx)}
                style={{
                  width: idx === currentIndex ? 24 : 8,
                  height: 8,
                  borderRadius: 999,
                  background: idx === currentIndex ? "#d4af37" : "#d2d2d7",
                  border: "none",
                  padding: 0,
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                }}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
