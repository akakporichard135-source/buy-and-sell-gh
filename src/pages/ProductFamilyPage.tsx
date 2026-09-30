import { useMemo, useState } from "react";
import { useProductCatalog } from "../catalog/ProductCatalogContext";
import { familyMatchesProduct, type ProductFamilyKey } from "../catalog/productExperience";
import { SEO } from "../components/SEO";
import { StoreCarousel } from "../components/store/StoreCarousel";
import {
  CATEGORY_DEPARTMENTS,
  type CategoryDepartmentConfig,
} from "../components/store/category/categoryData";
import { StoreCategoryIntro } from "../components/store/category/StoreCategoryIntro";
import { StoreCategorySubnav } from "../components/store/category/StoreCategorySubnav";
import { StoreCategoryCard } from "../components/store/category/StoreCategoryCard";
import { StoreCategoryCatalogGrid } from "../components/store/category/StoreCategoryCatalogGrid";
import { StoreCategoryAccessoriesRail } from "../components/store/category/StoreCategoryAccessoriesRail";
import { StoreCategoryTrustBar } from "../components/store/category/StoreCategoryTrustBar";
import "../styles/store-category.css";
import {
  compareAirpodsNewest,
  compareIphonesNewest,
  compareIpadsNewest,
  compareMacbooksNewest,
  compareWatchesNewest,
} from "../utils/productPresentation";

export function ProductFamilyPage({ family }: { family: ProductFamilyKey }) {
  const config: CategoryDepartmentConfig = CATEGORY_DEPARTMENTS[family] || CATEGORY_DEPARTMENTS.iphone;
  const { activeProducts, loading } = useProductCatalog();
  const [activeSubnavId, setActiveSubnavId] = useState("all");

  // Get matching products for this category department, sorted newest first
  const categoryProducts = useMemo(() => {
    return activeProducts
      .filter((product) => familyMatchesProduct(product, family))
      .sort((a, b) => {
        if (family === "iphone") return compareIphonesNewest(a, b);
        if (family === "mac") return compareMacbooksNewest(a, b);
        if (family === "ipad") return compareIpadsNewest(a, b);
        if (family === "watch") return compareWatchesNewest(a, b);
        if (family === "airpods") return compareAirpodsNewest(a, b);
        return a.name.localeCompare(b.name);
      });
  }, [activeProducts, family]);

  return (
    <div className={`store-category-page store-cat-${family}`}>
      <SEO
        title={config.seoTitle}
        description={config.seoDescription}
      />

      {/* 1. Concise Category Introduction with Shopping Help */}
      <StoreCategoryIntro config={config} />

      {/* 2. Compact Product Family / Model Subnav Strip */}
      <StoreCategorySubnav
        items={config.subnavItems}
        activeId={activeSubnavId}
        onSelect={setActiveSubnavId}
        categoryLabel={config.label}
      />

      {/* 3. Primary Shopping Carousel: Large Horizontal Store Cards */}
      <section className="store-cat-carousel-section" aria-labelledby="featured-carousel-title">
        <div className="store-cat-carousel-container">
          <StoreCarousel
            eyebrow="FEATURED MODELS"
            title={`Explore the ${config.label} lineup.`}
            subtitle="Browse the latest releases, signature features, and flagship hardware."
            controlsAriaLabel={`${config.label} featured carousel navigation`}
            trackClassName="store-cat-featured-track"
          >
            {config.featuredCards.map((card) => (
              <StoreCategoryCard key={card.id} card={card} />
            ))}
          </StoreCarousel>
        </div>
      </section>

      {/* 4. Available Catalogue Inventory Section */}
      <StoreCategoryCatalogGrid
        family={family}
        products={categoryProducts}
        activeSubnavId={activeSubnavId}
        catalogTitle={config.catalogTitle}
        catalogSubtitle={config.catalogSubtitle}
      />

      {/* 5. Category-Relevant Accessories Rail */}
      <StoreCategoryAccessoriesRail family={family} />

      {/* 6. Buy & Sell GH Trust & Assurance Bar */}
      <StoreCategoryTrustBar />
    </div>
  );
}
