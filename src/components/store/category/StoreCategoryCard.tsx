import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import type { CategoryFeaturedCardData } from "./categoryData";
import { ProductImagePlaceholder } from "./ProductImagePlaceholder";

interface StoreCategoryCardProps {
  card: CategoryFeaturedCardData;
}

export function StoreCategoryCard({ card }: StoreCategoryCardProps) {
  // Strictly enforce iPhone Duo has NO "Buy" button (only "View Pricing")
  const isIphoneDuo = card.id.includes("duo") || card.title.toLowerCase().includes("duo");
  const isViewPricing = isIphoneDuo || card.isViewPricingOnly;
  const primaryCtaText = isViewPricing ? "View Pricing" : (card.buyLabel || "Buy");

  return (
    <article
      className={`store-cat-card ${card.isDark ? "is-dark" : ""}`}
      aria-label={card.title}
    >
      {/* ZONE 1: TOP TEXT ZONE */}
      <div className="store-cat-card-header">
        <div className="store-cat-card-eyebrow-row">
          <span className="store-cat-card-eyebrow">{card.eyebrow}</span>
          {card.badge && (
            <span className="store-cat-card-badge">{card.badge}</span>
          )}
        </div>

        <h3 className="store-cat-card-title">{card.title}</h3>
        <p className="store-cat-card-subtitle">{card.subtitle}</p>

        <div className="store-cat-card-price-row">
          <span className="store-cat-card-price">{card.price}</span>
        </div>
      </div>

      {/* ZONE 2: MIDDLE IMAGE STAGE (Strictly contained, no collision) */}
      <div className="store-cat-card-media">
        {card.image ? (
          <img
            src={card.image}
            alt={card.alt || card.title}
            loading="lazy"
            decoding="async"
            className="store-cat-card-img"
          />
        ) : (
          <ProductImagePlaceholder />
        )}
      </div>

      {/* ZONE 3: BOTTOM ACTIONS ZONE */}
      <div className="store-cat-card-actions">
        <Link
          to={card.buyPath}
          className="store-cat-btn-primary"
          aria-label={`${primaryCtaText} ${card.title}`}
        >
          {primaryCtaText}
        </Link>

        {card.storyPath && (
          <Link
            to={card.storyPath}
            className="store-cat-btn-text"
            aria-label={`${card.storyLabel || "Learn more"} about ${card.title}`}
          >
            <span>{card.storyLabel || "Learn more"}</span>
            <ChevronRight size={14} aria-hidden="true" />
          </Link>
        )}
      </div>
    </article>
  );
}
