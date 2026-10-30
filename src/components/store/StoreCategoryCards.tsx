import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useCms } from "../../cms/CmsContext";
import type { MainStoreConfig, StorePageSection } from "../../cms/types";
import { StoreCarousel } from "./StoreCarousel";

export function StoreCategoryCards({
  section,
  configOverride,
}: {
  section?: StorePageSection;
  configOverride?: MainStoreConfig;
}) {
  const { mainStore } = useCms();
  const activeConfig = configOverride || mainStore;
  const categoryCards = activeConfig?.categoryCards || [];
  const bgStyle = section?.backgroundColor ? { backgroundColor: section.backgroundColor } : undefined;
  const eyebrow = section?.eyebrow !== undefined && section.eyebrow !== "" ? section.eyebrow : "SHOP BY CATEGORY";
  const title = section?.heading?.trim() || "Browse by device.";
  const subtitle = section?.subtitle !== undefined ? section.subtitle : "Explore devices by family.";

  return (
    <section
      className="store-section store-category-section"
      aria-labelledby="store-category-title"
      style={bgStyle}
      data-section-id={section?.id || "section-category-cards"}
    >
      <div className="store-container">
        <StoreCarousel
          eyebrow={eyebrow}
          title={title}
          subtitle={subtitle}
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
