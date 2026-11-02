import { ChevronRight, Pause, Play } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import type { PromotionCampaign } from "../../types/promotion";
import { isPromotionCurrentlyActive } from "../../promotions/promotionEngine";

interface AnnouncementItem {
  id: string;
  text: string;
  destination: string;
  title: string;
}

export function PromotionalAnnouncementBar() {
  const { promotions } = useCart();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Extract active campaigns with announcement text enabled
  const announcements: AnnouncementItem[] = useMemo(() => {
    const list: AnnouncementItem[] = [];
    const active = promotions.filter(
      (p) =>
        isPromotionCurrentlyActive(p) &&
        p.showOnAnnouncementBar &&
        p.announcementBarText &&
        p.announcementBarText.trim()
    );

    active.forEach((p) => {
      list.push({
        id: p.id,
        text: p.announcementBarText!.trim(),
        destination: p.ctaDestination || `/offers#${p.slug}`,
        title: p.title,
      });
    });

    // Default fallback announcement if none explicitly enabled
    if (list.length === 0) {
      list.push({
        id: "default-tradein",
        text: "Trade in your current device toward your next Apple upgrade in Accra.",
        destination: "/sell-or-trade",
        title: "Trade-In & Upgrade",
      });
      list.push({
        id: "default-offers",
        text: "Explore special promotional offers, free gifts and genuine Apple discounts.",
        destination: "/offers",
        title: "Special Offers",
      });
    }

    return list;
  }, [promotions]);

  // Handle automatic rotation
  useEffect(() => {
    if (announcements.length <= 1 || isPaused) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const intervalMs = prefersReducedMotion ? 12000 : 6000;

    timerRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % announcements.length);
    }, intervalMs);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [announcements.length, isPaused]);

  if (announcements.length === 0) return null;

  const current = announcements[currentIndex] || announcements[0];

  return (
    <aside
      className="promo-announcement-bar"
      aria-label="Promotional announcements"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
      style={{
        background: "#f5f5f7",
        borderBottom: "1px solid #e5e5ea",
        fontSize: "0.86rem",
        lineHeight: 1.4,
        padding: "8px 16px",
        textAlign: "center",
        color: "#1d1d1f",
        position: "relative",
        zIndex: 20,
        overflowWrap: "break-word",
        wordBreak: "normal",
      }}
    >
      <div
        className="promo-announcement-content"
        style={{
          maxWidth: 1080,
          margin: "0 auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 10,
          flexWrap: "wrap",
        }}
      >
        <span style={{ fontWeight: 400, color: "#1d1d1f" }}>
          {current.text}
        </span>

        {current.destination.startsWith("http") ? (
          <a
            href={current.destination}
            target="_blank"
            rel="noopener noreferrer"
            className="promo-announcement-link"
            style={{
              color: "#0071e3",
              fontWeight: 500,
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: 2,
              whiteSpace: "nowrap",
            }}
          >
            <span>Learn more</span>
            <ChevronRight size={13} aria-hidden="true" />
          </a>
        ) : (
          <Link
            to={current.destination}
            className="promo-announcement-link"
            style={{
              color: "#0071e3",
              fontWeight: 500,
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: 2,
              whiteSpace: "nowrap",
            }}
          >
            <span>Explore offer</span>
            <ChevronRight size={13} aria-hidden="true" />
          </Link>
        )}

        {announcements.length > 1 && (
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              marginLeft: 8,
            }}
          >
            {announcements.map((_, idx) => (
              <button
                key={idx}
                type="button"
                aria-label={`Go to announcement ${idx + 1}`}
                onClick={() => setCurrentIndex(idx)}
                style={{
                  width: idx === currentIndex ? 14 : 5,
                  height: 5,
                  borderRadius: 999,
                  background: idx === currentIndex ? "#d4af37" : "#d2d2d7",
                  border: "none",
                  padding: 0,
                  cursor: "pointer",
                  transition: "all 0.25s ease",
                }}
              />
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}
