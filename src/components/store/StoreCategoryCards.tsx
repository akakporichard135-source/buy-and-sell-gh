import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useCms } from "../../cms/CmsContext";
import { StoreCarousel } from "./StoreCarousel";

export function StoreCategoryCards() {
  const { mainStore } = useCms();
  const categoryCards = mainStore?.categoryCards || [];

  return (
    <section className="store-section store-category-section" aria-labelledby="store-category-title">
      <div className="store-container">
        <StoreCarousel
          eyebrow="SHOP BY CATEGORY"
          title="Browse by device."
          subtitle="Explore devices by family."
          controlsAriaLabel="Shop by category carousel navigation"
          trackClassName="store-category-track"
        >
          {categoryCards.map((category) => (
            <Link
              key={category.id}
              to={category.path}
              className="store-category-card"
            >
              <div className="store-category-card-top">
                <h3 className="store-category-card-title">{category.title}</h3>
                <p className="store-category-card-subtitle">{category.subtitle}</p>
              </div>

              <div className="store-category-card-media">
                <img
                  src={category.image}
                  alt={category.alt}
                  loading="lazy"
                  decoding="async"
                  className="store-category-card-img"
                />
              </div>

              <div className="store-category-card-footer">
                <span className="store-category-action-link">
                  Shop {category.title} <ArrowRight size={16} aria-hidden="true" />
                </span>
              </div>
            </Link>
          ))}
        </StoreCarousel>
      </div>
    </section>
  );
}
