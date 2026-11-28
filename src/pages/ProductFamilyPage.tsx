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
import "../styles/store.css";
import "../styles/store-category.css";
import {
  compareAirpodsNewest,
  compareIphonesNewest,
  compareIpadsNewest,
  compareMacbooksNewest,
  compareWatchesNewest,
} from "../utils/productPresentation";

import { useCms } from "../cms/CmsContext";
import { MacPageRenderer } from "../components/store/mac/MacPageRenderer";
import { defaultMacPageConfig } from "../cms/macPageDefaults";
import { IpadPageRenderer } from "../components/store/ipad/IpadPageRenderer";
import { defaultIpadPageConfig } from "../cms/ipadPageDefaults";
import { IphonePageRenderer } from "../components/store/iphone/IphonePageRenderer";
import { defaultIphonePageConfig } from "../cms/iphonePageDefaults";
import { WatchPageRenderer } from "../components/store/watch/WatchPageRenderer";
import { defaultWatchPageConfig } from "../cms/watchPageDefaults";
import { AirpodsPageRenderer } from "../components/store/airpods/AirpodsPageRenderer";
import { defaultAirpodsPageConfig } from "../cms/airpodsPageDefaults";
import { AccessoriesPageRenderer } from "../components/store/accessories/AccessoriesPageRenderer";
import { defaultAccessoriesPageConfig } from "../cms/accessoriesPageDefaults";
import { AppleShopExperience } from "../components/shop/AppleShopExperience";

export function ProductFamilyPage({
  family,
  catalogMode = false,
}: {
  family: ProductFamilyKey;
  catalogMode?: boolean;
}) {
  const { departments, macPage, ipadPage, iphonePage, watchPage, airpodsPage, accessoriesPage } = useCms();
  const config: CategoryDepartmentConfig = useMemo(() => {
    return departments[family] || CATEGORY_DEPARTMENTS[family] || CATEGORY_DEPARTMENTS.iphone;
  }, [departments, family]);

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

  if (family === "mac" && !catalogMode) {
    const activeMacConfig = macPage || defaultMacPageConfig;
    return (
      <>
        <SEO
          title={activeMacConfig.seoTitle || config.seoTitle}
          description={activeMacConfig.seoDescription || config.seoDescription}
        />
        <MacPageRenderer />
      </>
    );
  }

  if (family === "ipad" && !catalogMode) {
    const activeIpadConfig = ipadPage || defaultIpadPageConfig;
    return (
      <>
        <SEO
          title={activeIpadConfig.seoTitle || config.seoTitle}
          description={activeIpadConfig.seoDescription || config.seoDescription}
        />
        <IpadPageRenderer />
      </>
    );
  }

  if (family === "iphone" && !catalogMode) {
    const activeIphoneConfig = iphonePage || defaultIphonePageConfig;
    return (
      <>
        <SEO
          title={activeIphoneConfig.seoTitle || config.seoTitle}
          description={activeIphoneConfig.seoDescription || config.seoDescription}
        />
        <IphonePageRenderer />
      </>
    );
  }

  if (family === "watch" && !catalogMode) {
    const activeWatchConfig = watchPage || defaultWatchPageConfig;
    return (
      <>
        <SEO
          title={activeWatchConfig.seoTitle || config.seoTitle}
          description={activeWatchConfig.seoDescription || config.seoDescription}
        />
        <WatchPageRenderer />
      </>
    );
  }

  if (family === "airpods" && !catalogMode) {
    const activeAirpodsConfig = airpodsPage || defaultAirpodsPageConfig;
    return (
      <>
        <SEO
          title={activeAirpodsConfig.seoTitle || config.seoTitle}
          description={activeAirpodsConfig.seoDescription || config.seoDescription}
        />
        <AirpodsPageRenderer />
      </>
    );
  }

  if (family === "accessories" && !catalogMode) {
    const activeAccConfig = accessoriesPage || defaultAccessoriesPageConfig;
    return (
      <>
        <SEO
          title={activeAccConfig.seoTitle || config.seoTitle}
          description={activeAccConfig.seoDescription || config.seoDescription}
        />
        <AccessoriesPageRenderer />
      </>
    );
  }

  // Rebuilt Apple-style Shop Hubs for /shop/buy-mac, /shop/buy-ipad, /shop/buy-iphone, /shop/buy-watch
  if (
    catalogMode &&
    (family === "mac" || family === "ipad" || family === "iphone" || family === "watch")
  ) {
    return <AppleShopExperience category={family} />;
  }

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
      {!catalogMode && (
        <section className="store-cat-carousel-section" aria-labelledby="featured-carousel-title">
          <div className="store-cat-carousel-container">
            <StoreCarousel
              eyebrow="FEATURED MODELS"
              title={`Explore the ${config.label} lineup.`}
              subtitle={family === "accessories"
                ? "Explore original chargers, cables, and everyday Apple companions."
                : "Browse the latest releases, signature features, and flagship hardware."}
              controlsAriaLabel={`${config.label} featured carousel navigation`}
              trackClassName="store-cat-featured-track"
            >
              {config.featuredCards.map((card) => (
                <StoreCategoryCard key={card.id} card={card} />
              ))}
            </StoreCarousel>
          </div>
        </section>
      )}

      {/* 4. Available Catalogue Inventory Section */}
      <StoreCategoryCatalogGrid
        family={family}
        products={categoryProducts}
        activeSubnavId={activeSubnavId}
        catalogTitle={config.catalogTitle}
        catalogSubtitle={config.catalogSubtitle}
      />

      {/* 5. Category-Relevant Accessories Rail */}
      {!catalogMode && <StoreCategoryAccessoriesRail family={family} />}

      {/* 6. Buy & Sell GH Trust & Assurance Bar */}
      <StoreCategoryTrustBar />
    </div>
  );
}
