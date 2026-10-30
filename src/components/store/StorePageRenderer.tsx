import { Link } from "react-router-dom";
import { useCms } from "../../cms/CmsContext";
import { defaultStorePageSections } from "../../cms/defaultCmsData";
import type { MainStoreConfig, StorePageSection } from "../../cms/types";
import { useProductCatalog } from "../../catalog/ProductCatalogContext";
import { isProductPurchasable } from "../../catalog/productCatalog";
import {
  getProductFamily,
  productBuyPath,
  productStoryPath,
} from "../../catalog/productExperience";
import type { Product } from "../../types/product";
import { resolveCatalogueProductImage, resolveProductImage } from "../../utils/productImages";
import { getCardPriceDisplay } from "../../utils/productPricing";
import { StoreAccessoriesCarousel } from "./StoreAccessoriesCarousel";
import { StoreCarousel } from "./StoreCarousel";
import { StoreCategoryCards } from "./StoreCategoryCards";
import { StoreDifferenceCards } from "./StoreDifferenceCards";
import { StoreHelpCards } from "./StoreHelpCards";
import { StoreHeroIntro } from "./StoreHeroIntro";
import { StoreLatestCarousel, StoreMoreToLoveCarousel } from "./StoreLatestCarousel";
import { StoreProductFamilyStrip } from "./StoreProductFamilyStrip";

interface StorePageRendererProps {
  config?: MainStoreConfig;
  products: Product[];
}

function isDarkBackground(color?: string): boolean {
  if (!color) return false;
  const normalized = color.trim().toLowerCase();
  if (
    normalized === "#000" ||
    normalized === "#000000" ||
    normalized === "#101012" ||
    normalized === "#1d1d1f" ||
    normalized === "#111111" ||
    normalized === "#161617" ||
    normalized === "black"
  ) {
    return true;
  }
  const hexMatch = normalized.match(/^#([0-9a-f]{6})$/i);
  if (hexMatch) {
    const hex = hexMatch[1];
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance < 0.35;
  }
  return false;
}

export function StorePageRenderer({ config, products }: StorePageRendererProps) {
  const { mainStore } = useCms();
  const { products: allCatalogProducts } = useProductCatalog();
  const activeConfig = config ?? mainStore;

  const rawSections =
    activeConfig.sections && activeConfig.sections.length > 0
      ? activeConfig.sections
      : defaultStorePageSections;

  const visibleSections = rawSections.filter((section) => section.visible !== false);

  // Merge passed Apple catalogue products with full catalog so any admin-selected product resolves canonically
  const productPool = allCatalogProducts.length > 0 ? allCatalogProducts : products;

  return (
    <>
      {visibleSections.map((section) => {
        if (section.builtInKey === "store-intro") {
          return <StoreHeroIntro key={section.id} section={section} />;
        }
        if (section.builtInKey === "family-strip") {
          return <StoreProductFamilyStrip key={section.id} section={section} configOverride={activeConfig} />;
        }
        if (section.builtInKey === "latest-carousel") {
          return (
            <StoreLatestCarousel
              key={section.id}
              products={products}
              section={section}
              configOverride={activeConfig}
            />
          );
        }
        if (section.builtInKey === "category-cards") {
          return <StoreCategoryCards key={section.id} section={section} configOverride={activeConfig} />;
        }
        if (section.builtInKey === "help-cards") {
          return <StoreHelpCards key={section.id} section={section} />;
        }
        if (section.builtInKey === "more-to-love") {
          return (
            <StoreMoreToLoveCarousel
              key={section.id}
              products={products}
              section={section}
              configOverride={activeConfig}
            />
          );
        }
        if (section.builtInKey === "accessories-carousel") {
          return (
            <StoreAccessoriesCarousel
              key={section.id}
              products={products}
              section={section}
              configOverride={activeConfig}
            />
          );
        }
        if (section.builtInKey === "difference-cards") {
          return <StoreDifferenceCards key={section.id} section={section} />;
        }

        return (
          <StoreCustomSection
            key={section.id}
            section={section}
            products={productPool}
          />
        );
      })}
    </>
  );
}

function StoreCustomSection({
  section,
  products,
}: {
  section: StorePageSection;
  products: Product[];
}) {
  const isDark = isDarkBackground(section.backgroundColor);
  const textAlign = section.textAlignment || "left";
  const layoutStyle = section.layoutStyle || "standard";

  const selectedProducts = (section.productIds ?? [])
    .map((idOrSlug) =>
      products.find((p) => p.id === idOrSlug || p.slug === idOrSlug)
    )
    .filter((p): p is Product => Boolean(p));

  const hasMedia = Boolean(
    (section.desktopImage && section.desktopImage.trim() !== "") ||
      (section.mobileImage && section.mobileImage.trim() !== "")
  );
  const desktopSrc = section.desktopImage?.trim() || section.mobileImage?.trim() || "";
  const mobileSrc = section.mobileImage?.trim() || desktopSrc;

  const isCarouselLayout =
    section.type === "product-carousel" || layoutStyle === "carousel";
  const isSplitLayout =
    layoutStyle === "split" ||
    section.type === "image-text" ||
    (section.type === "hero-banner" && hasMedia && layoutStyle !== "full-bleed");

  if (isCarouselLayout && selectedProducts.length > 0) {
    return (
      <section
        className={`store-section store-custom-section store-custom-type-${section.type} ${isDark ? "is-dark" : ""}`}
        style={section.backgroundColor ? { backgroundColor: section.backgroundColor } : undefined}
        data-store-section-id={section.id}
        data-store-section-type={section.type}
        aria-label={section.heading}
      >
        <StoreCarousel
          eyebrow={section.eyebrow || undefined}
          title={section.heading}
          subtitle={section.subtitle || section.description || undefined}
          headerRight={
            section.buttonLabel && section.buttonDestination ? (
              <Link to={section.buttonDestination} className="store-section-header-link">
                {section.buttonLabel} →
              </Link>
            ) : undefined
          }
          controlsAriaLabel={`${section.heading} carousel navigation`}
        >
          {selectedProducts.map((product) => (
            <StoreCustomProductCard key={product.id} product={product} isDark={isDark} />
          ))}
        </StoreCarousel>
      </section>
    );
  }

  return (
    <section
      className={`store-section store-custom-section store-custom-type-${section.type} store-custom-layout-${layoutStyle} store-custom-align-${textAlign} ${isDark ? "is-dark" : ""}`}
      style={section.backgroundColor ? { backgroundColor: section.backgroundColor } : undefined}
      data-store-section-id={section.id}
      data-store-section-type={section.type}
      aria-label={section.heading}
    >
      <div className="store-container">
        <div
          className={`store-custom-inner ${
            isSplitLayout && hasMedia ? "store-custom-split" : "store-custom-stack"
          }`}
        >
          <div className={`store-custom-copy align-${textAlign}`}>
            {section.eyebrow && (
              <p className="store-section-eyebrow">{section.eyebrow}</p>
            )}
            <h2 className="store-section-title store-custom-heading">
              {section.heading}
            </h2>
            {section.subtitle && (
              <p className="store-section-subtitle store-custom-subtitle">
                {section.subtitle}
              </p>
            )}
            {section.description && (
              <p className="store-custom-description">{section.description}</p>
            )}

            {(section.buttonLabel || section.secondaryButtonLabel) && (
              <div className={`store-custom-actions align-${textAlign}`}>
                {section.buttonLabel && section.buttonDestination && (
                  <Link
                    to={section.buttonDestination}
                    className="store-custom-btn-primary"
                  >
                    {section.buttonLabel}
                  </Link>
                )}
                {section.secondaryButtonLabel &&
                  section.secondaryButtonDestination && (
                    <Link
                      to={section.secondaryButtonDestination}
                      className="store-custom-btn-secondary"
                    >
                      {section.secondaryButtonLabel}
                    </Link>
                  )}
              </div>
            )}
          </div>

          {hasMedia && (
            <div className="store-custom-media-wrap">
              <picture>
                {mobileSrc && mobileSrc !== desktopSrc && (
                  <source media="(max-width: 768px)" srcSet={mobileSrc} />
                )}
                <img
                  src={desktopSrc}
                  alt={section.imageAlt || section.heading}
                  loading="lazy"
                  decoding="async"
                  className="store-custom-media-img"
                />
              </picture>
            </div>
          )}
        </div>

        {selectedProducts.length > 0 && (
          <div
            className={`store-custom-products-grid ${
              layoutStyle === "grid-4" ? "cols-4" : "cols-3"
            }`}
          >
            {selectedProducts.map((product) => (
              <StoreCustomProductCard
                key={product.id}
                product={product}
                isDark={isDark}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function StoreCustomProductCard({
  product,
  isDark,
}: {
  product: Product;
  isDark?: boolean;
}) {
  const family = getProductFamily(product);
  const buyPath = productBuyPath(family, product.slug);
  const learnMorePath = productStoryPath(family, product.slug);
  const resolvedImage =
    resolveCatalogueProductImage(product) || resolveProductImage(product);
  const isPurchasable = isProductPurchasable(product);
  const isIphoneDuo =
    product.slug?.includes("iphone-duo") ||
    product.name?.toLowerCase().includes("iphone duo");
  const priceDisplay = getCardPriceDisplay(product);
  const isViewPricing = isIphoneDuo || priceDisplay.isEnquiry || !isPurchasable;
  const ctaLabel = isViewPricing ? "View Pricing" : "Buy";

  return (
    <article
      className={`store-latest-card store-custom-product-card ${
        isDark ? "theme-dark" : "theme-light"
      }`}
      data-product-id={product.id}
      data-product-slug={product.slug}
    >
      <div className="store-latest-card-content">
        <p className="store-latest-card-eyebrow">
          {product.condition && product.condition !== "To Confirm"
            ? product.condition.toUpperCase()
            : product.category.toUpperCase()}
        </p>
        <h3 className="store-latest-card-title">
          <Link to={buyPath} className="store-latest-card-link">
            {product.name}
          </Link>
        </h3>
        <p className="store-latest-card-statement">{priceDisplay.current}</p>
      </div>

      <Link
        to={buyPath}
        className="store-latest-card-media"
        aria-label={`${ctaLabel} ${product.name}`}
      >
        {resolvedImage ? (
          <img
            src={resolvedImage.src}
            alt={resolvedImage.alt || product.name}
            loading="lazy"
            decoding="async"
            className="store-latest-card-img"
          />
        ) : null}
      </Link>

      <div className="store-latest-card-actions">
        <Link to={learnMorePath} className="store-card-btn-secondary">
          Learn More
        </Link>
        <Link to={buyPath} className="store-card-btn-primary">
          {ctaLabel}
        </Link>
      </div>
    </article>
  );
}
