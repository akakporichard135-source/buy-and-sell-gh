import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useCms } from "../../cms/CmsContext";
import type { MainStoreConfig, StorePageSection } from "../../cms/types";
import { familyMatchesProduct, type ProductFamilyKey } from "../../catalog/productExperience";
import type { Product } from "../../types/product";
import { StoreCarousel } from "./StoreCarousel";
import { resolveBuiltInSectionBgStyle } from "./storeSectionStyle";

const CATEGORY_ID_TO_FAMILY: Record<string, ProductFamilyKey> = {
  phones: "iphone",
  iphone: "iphone",
  laptops: "mac",
  mac: "mac",
  tablets: "ipad",
  ipad: "ipad",
  watches: "watch",
  watch: "watch",
  audio: "airpods",
  airpods: "airpods",
  accessories: "accessories",
};

export function StoreCategoryCards({
  section,
  configOverride,
  products = [],
}: {
  section?: StorePageSection;
  configOverride?: MainStoreConfig;
  products?: Product[];
}) {
  const { mainStore } = useCms();
  const activeConfig = configOverride || mainStore;
  const categoryCards = activeConfig?.categoryCards || [];
  const bgStyle = resolveBuiltInSectionBgStyle(section?.backgroundColor);
  const eyebrow =
    section?.eyebrow !== undefined && section.eyebrow !== ""
      ? section.eyebrow
      : "Browse by category.";
  const title = section?.heading?.trim() || "Explore our lineup by department.";

  return (
    <section
      className="store-section store-category-section"
      aria-labelledby="store-category-title"
      style={bgStyle}
      data-section-id={section?.id || "section-category-cards"}
    >
      <StoreCarousel
        variant="apple"
        titleId="store-category-title"
        eyebrow={eyebrow}
        title={title}
        controlsAriaLabel="Browse by category carousel navigation"
        trackClassName="store-category-track"
      >
        {categoryCards.map((category) => {
          const familyKey = CATEGORY_ID_TO_FAMILY[category.id.toLowerCase()];
          const matchingCount = familyKey
            ? products.filter((p) => familyMatchesProduct(p, familyKey)).length
            : 0;

          return (
            <Link key={category.id} to={category.path} className="store-category-card">
              <div className="store-category-card-top">
                <div className="store-category-card-head-row">
                  <h3 className="store-category-card-title">{category.title}</h3>
                  {matchingCount > 0 && (
                    <span className="store-category-count-pill">
                      {matchingCount} {familyKey === "accessories" ? "items" : "models"}
                    </span>
                  )}
                </div>
                <p className="store-category-card-subtitle">{category.subtitle}</p>
              </div>

              <div className="store-category-card-media">
                <img
                  src={category.image}
                  alt={category.alt}
                  loading="eager"
                  decoding="async"
                  className="store-category-card-img"
                />
              </div>

              <div className="store-category-card-footer">
                <span className="store-category-action-link">
                  Explore {category.title} <ChevronRight size={14} aria-hidden="true" />
                </span>
              </div>
            </Link>
          );
        })}
      </StoreCarousel>
    </section>
  );
}
