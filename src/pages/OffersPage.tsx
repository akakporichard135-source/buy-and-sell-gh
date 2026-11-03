import { Calendar, CheckCircle2, ChevronRight, Filter, Gift, ShieldCheck, Sparkles, Tag } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useProductCatalog } from "../catalog/ProductCatalogContext";
import { SEO } from "../components/SEO";
import { isPromotionCurrentlyActive } from "../promotions/promotionEngine";
import type { PromotionCampaign, PromotionType } from "../types/promotion";
import { recordPromotionClick, recordPromotionView } from "../promotions/supabasePromotionsRepository";
import { formatGhs } from "../utils/format";

export function OffersPage() {
  const { promotions, refreshPromotions } = useCart();
  const { products } = useProductCatalog();
  const location = useLocation();
  const [filterType, setFilterType] = useState<string>("all");

  // Revalidate promotions fresh from Supabase on mount
  useEffect(() => {
    void refreshPromotions();
  }, [refreshPromotions]);

  // Check if hash matches a specific promotion (e.g. #free-magsafe-case-with-iphone)
  const targetSlug = location.hash ? location.hash.replace(/^#/, "") : "";

  // Active public campaigns only
  const activeOffers = useMemo(() => {
    return promotions.filter(
      (p) => isPromotionCurrentlyActive(p) && p.showOnOffersPage !== false
    ).sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
  }, [promotions]);

  // Log impressions
  useEffect(() => {
    activeOffers.forEach((c) => void recordPromotionView(c.id));
  }, [activeOffers]);

  // Check if target slug was requested but is expired or not active
  const targetOffer = promotions.find((p) => p.slug === targetSlug || p.id === targetSlug);
  const isTargetExpired = targetOffer && !isPromotionCurrentlyActive(targetOffer);

  const filteredOffers = useMemo(() => {
    if (filterType === "all") return activeOffers;
    return activeOffers.filter((p) => p.promotionType === filterType);
  }, [activeOffers, filterType]);

  return (
    <>
      <SEO
        title="Special Offers & Promotions — Buy & Sell GH"
        description="Explore exclusive Apple device discounts, free gift bundles, and trade-in upgrade promotions from Buy & Sell GH in Accra, Ghana."
      />

      <div className="offers-page min-h-screen bg-page text-ink" style={{ background: "#ffffff", paddingBottom: 80 }}>
        {/* Hero Header */}
        <header
          style={{
            background: "linear-gradient(180deg, #f5f5f7 0%, #ffffff 100%)",
            padding: "60px 20px 40px",
            textAlign: "center",
            borderBottom: "1px solid #f0f0f2",
          }}
        >
          <div style={{ maxWidth: 780, margin: "0 auto" }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                fontSize: "0.82rem",
                fontWeight: 700,
                color: "#d4af37",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                marginBottom: 10,
              }}
            >
              <Sparkles size={16} />
              <span>Official Promotions</span>
            </div>
            <h1
              style={{
                fontSize: "clamp(2rem, 4vw, 3rem)",
                fontWeight: 700,
                color: "#1d1d1f",
                letterSpacing: "-0.025em",
                margin: 0,
                lineHeight: 1.15,
                overflowWrap: "break-word",
                wordBreak: "normal",
              }}
            >
              Special Offers. Direct from Buy &amp; Sell GH.
            </h1>
            <p
              style={{
                fontSize: "1.1rem",
                color: "#6e6e73",
                margin: "12px 0 0",
                lineHeight: 1.5,
                overflowWrap: "break-word",
                wordBreak: "normal",
              }}
            >
              Enjoy authentic Apple equipment with guaranteed complimentary gifts, instant pricing deductions, and verified physical inspection in Accra.
            </p>
          </div>
        </header>

        {/* Notice if an expired hash link was visited */}
        {isTargetExpired && (
          <div
            style={{
              maxWidth: 920,
              margin: "24px auto 0",
              padding: "16px 20px",
              background: "#fffbeb",
              border: "1px solid #fde68a",
              borderRadius: 14,
              color: "#92400e",
              fontSize: "0.92rem",
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <Calendar size={20} className="shrink-0" />
            <div>
              <strong>Campaign Concluded:</strong> The requested offer &ldquo;{targetOffer?.title}&rdquo; has expired or concluded. Please explore our other active campaigns below.
            </div>
          </div>
        )}

        {/* Filter Navigation */}
        <nav
          aria-label="Promotion categories"
          style={{
            maxWidth: 1080,
            margin: "32px auto 0",
            padding: "0 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            flexWrap: "wrap",
          }}
        >
          {[
            { id: "all", label: "All Offers" },
            { id: "free_gift", label: "Free Gifts" },
            { id: "percentage_discount", label: "Percentage Discounts" },
            { id: "fixed_discount", label: "Cash Savings" },
            { id: "bundle", label: "Bundles" },
            { id: "advertising", label: "Special Events" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilterType(tab.id)}
              style={{
                padding: "8px 16px",
                borderRadius: 999,
                fontSize: "0.88rem",
                fontWeight: 600,
                border: filterType === tab.id ? "1.5px solid #d4af37" : "1px solid #d2d2d7",
                background: filterType === tab.id ? "#fefce8" : "#ffffff",
                color: filterType === tab.id ? "#854d0e" : "#424245",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        {/* Campaigns Listing */}
        <main style={{ maxWidth: 1080, margin: "36px auto 0", padding: "0 20px" }}>
          {filteredOffers.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "60px 20px",
                background: "#fbfbfd",
                borderRadius: 20,
                border: "1px solid #e5e5ea",
              }}
            >
              <Sparkles size={36} color="#d4af37" style={{ margin: "0 auto 12px" }} />
              <h3 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#1d1d1f", margin: "0 0 6px" }}>
                No active offers in this category
              </h3>
              <p style={{ color: "#6e6e73", margin: "0 0 16px" }}>
                Check back soon or explore all our active promotions across the catalogue.
              </p>
              <button
                type="button"
                className="apple-checkout-btn-primary is-gold"
                style={{ maxWidth: 200, margin: "0 auto" }}
                onClick={() => setFilterType("all")}
              >
                View All Offers
              </button>
            </div>
          ) : (
            <div style={{ display: "grid", gap: 32 }}>
              {filteredOffers.map((offer) => {
                const desktopImg = offer.desktopFlyerUrl || offer.mobileFlyerUrl;
                const mobileImg = offer.mobileFlyerUrl || offer.desktopFlyerUrl;
                const isTarget = offer.slug === targetSlug || offer.id === targetSlug;

                return (
                  <article
                    key={offer.id}
                    id={offer.slug}
                    style={{
                      borderRadius: 22,
                      border: isTarget ? "2px solid #d4af37" : "1px solid #e5e5ea",
                      background: "#ffffff",
                      boxShadow: isTarget
                        ? "0 12px 32px rgba(212, 175, 55, 0.16)"
                        : "0 4px 20px rgba(0, 0, 0, 0.04)",
                      overflow: "hidden",
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
                      transition: "all 0.3s ease",
                      scrollMarginTop: "calc(var(--global-header-height, 44px) + 24px)",
                    }}
                  >
                    {/* Flyer Visual */}
                    <div style={{ background: "#f5f5f7", position: "relative" }}>
                      {desktopImg ? (
                        <picture>
                          {mobileImg && mobileImg !== desktopImg && (
                            <source media="(max-width: 640px)" srcSet={mobileImg} />
                          )}
                          <img
                            src={desktopImg}
                            alt={offer.flyerAltText || offer.title}
                            loading="lazy"
                            style={{
                              width: "100%",
                              height: "100%",
                              minHeight: 280,
                              maxHeight: 420,
                              objectFit: "cover",
                              display: "block",
                            }}
                          />
                        </picture>
                      ) : (
                        <div
                          style={{
                            height: "100%",
                            minHeight: 280,
                            display: "grid",
                            placeItems: "center",
                            background: "linear-gradient(135deg, #f5f5f7 0%, #e5e5ea 100%)",
                            color: "#86868b",
                          }}
                        >
                          <Sparkles size={48} color="#d4af37" />
                        </div>
                      )}
                    </div>

                    {/* Content & Details */}
                    <div
                      style={{
                        padding: "32px 28px",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                      }}
                    >
                      <div>
                        {/* Type Badge */}
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                          <span
                            style={{
                              display: "inline-block",
                              background: offer.promotionType === "free_gift" ? "#fef3c7" : "#f0fdf4",
                              color: offer.promotionType === "free_gift" ? "#92400e" : "#166534",
                              fontSize: "0.76rem",
                              fontWeight: 700,
                              padding: "3px 10px",
                              borderRadius: 999,
                            }}
                          >
                            {offer.promotionType === "free_gift"
                              ? "Free Gift Package"
                              : offer.promotionType === "percentage_discount"
                              ? `${offer.discountPercent}% Discount`
                              : offer.promotionType === "fixed_discount"
                              ? `Save ${formatGhs(offer.discountAmount || 0)}`
                              : offer.promotionType === "bundle"
                              ? (offer.promotionalPrice ? `Special Bundle · ${formatGhs(offer.promotionalPrice)}` : "Special Bundle")
                              : "Special Campaign"}
                          </span>

                          {offer.endDate && (
                            <span style={{ fontSize: "0.78rem", color: "#86868b" }}>
                              Valid until{" "}
                              {new Date(offer.endDate).toLocaleDateString("en-GH", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </span>
                          )}
                        </div>

                        <h2
                          style={{
                            fontSize: "1.5rem",
                            fontWeight: 700,
                            color: "#1d1d1f",
                            margin: 0,
                            lineHeight: 1.25,
                            overflowWrap: "break-word",
                            wordBreak: "normal",
                          }}
                        >
                          {offer.title}
                        </h2>

                        {offer.promotionalPrice ? (
                          <div
                            style={{
                              fontSize: "1.25rem",
                              fontWeight: 700,
                              color: "#1d1d1f",
                              letterSpacing: "-0.015em",
                              marginTop: 6,
                              marginBottom: 4,
                            }}
                          >
                            Special Price: {formatGhs(offer.promotionalPrice)}
                          </div>
                        ) : null}

                        <p
                          style={{
                            fontSize: "0.95rem",
                            color: "#424245",
                            lineHeight: 1.5,
                            margin: "12px 0 16px",
                            overflowWrap: "break-word",
                            wordBreak: "normal",
                          }}
                        >
                          {offer.detailedDescription || offer.shortDescription}
                        </p>

                        {/* Conditions List */}
                        <div
                          style={{
                            padding: "14px 16px",
                            background: "#fbfbfd",
                            borderRadius: 12,
                            border: "1px solid #f0f0f2",
                            marginBottom: 24,
                            fontSize: "0.85rem",
                            color: "#424245",
                          }}
                        >
                          <div style={{ fontWeight: 600, color: "#1d1d1f", marginBottom: 6 }}>
                            Offer Conditions &amp; Fulfillment:
                          </div>
                          <ul style={{ margin: 0, paddingLeft: 18, lineHeight: 1.5 }}>
                            {offer.promotionType === "free_gift" && (
                              <li>
                                Includes {offer.giftQuantityPerPurchase} × {offer.giftProductName || "Free Gift"} (automatic checkout addition).
                              </li>
                            )}
                            {offer.promotionalPrice ? (
                              <li>Special package bundle price: {formatGhs(offer.promotionalPrice)}.</li>
                            ) : null}
                            {offer.eligibleProductIds.length > 0 && (
                              <li>
                                Eligible devices: {offer.eligibleProductIds.slice(0, 4).join(", ")}
                                {offer.eligibleProductIds.length > 4 ? ` and ${offer.eligibleProductIds.length - 4} more` : ""}.
                              </li>
                            )}
                            {offer.minOrderSubtotal > 0 && (
                              <li>Minimum order subtotal: {formatGhs(offer.minOrderSubtotal)}.</li>
                            )}
                            <li>Physical inspection available before payment at Dome Pillar 2.</li>
                          </ul>
                        </div>
                      </div>

                      {/* Action Button */}
                      <div>
                        {offer.ctaDestination.startsWith("http") ? (
                          <a
                            href={offer.ctaDestination}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => void recordPromotionClick(offer.id)}
                            className="apple-checkout-btn-primary is-gold"
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: 6,
                              textDecoration: "none",
                              padding: "12px 24px",
                            }}
                          >
                            <span>{offer.ctaText || "Claim Offer"}</span>
                            <ChevronRight size={17} />
                          </a>
                        ) : (
                          <Link
                            to={offer.ctaDestination}
                            onClick={() => void recordPromotionClick(offer.id)}
                            className="apple-checkout-btn-primary is-gold"
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: 6,
                              textDecoration: "none",
                              padding: "12px 24px",
                            }}
                          >
                            <span>{offer.ctaText || "Claim Offer"}</span>
                            <ChevronRight size={17} />
                          </Link>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </>
  );
}
