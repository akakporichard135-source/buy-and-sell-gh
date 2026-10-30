import { Eye, ShieldCheck, ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";
import { useCms } from "../../cms/CmsContext";
import { defaultMainStoreConfig } from "../../cms/defaultCmsData";
import type { MainStoreConfig, StorePageSection } from "../../cms/types";
import { productBuyPath, productStoryPath, type ProductFamilyKey } from "../../catalog/productExperience";
import type { Product } from "../../types/product";
import { formatGhs } from "../../utils/format";
import { resolveCatalogueProductImage } from "../../utils/productImages";
import { isProductPurchasable } from "../../catalog/productCatalog";
import { StoreCarousel } from "./StoreCarousel";

interface StoreAccessoriesCarouselProps {
  products: Product[];
  section?: StorePageSection;
  configOverride?: MainStoreConfig;
}

function getAccessoryEyebrow(product: Product): string {
  const name = product.name.toLowerCase();
  if (name.includes("power adapter") || name.includes("adapter")) return "Power & Charging";
  if (name.includes("cable") || name.includes("cord")) return "Cables & Connectors";
  if (name.includes("magsafe") || name.includes("fast charger")) return "MagSafe Wireless";
  if (name.includes("pencil")) return "Creative Tools";
  if (name.includes("keyboard")) return "Keyboards";
  if (name.includes("mouse") || name.includes("trackpad")) return "Mice & Trackpads";
  if (name.includes("case") || name.includes("cover")) return "Cases & Protection";
  return product.storage?.[0] || product.condition || "Original Apple";
}

export function StoreAccessoriesCarousel({
  products,
  section,
  configOverride,
}: StoreAccessoriesCarouselProps) {
  const { mainStore } = useCms();
  const activeConfig = configOverride || mainStore;
  const accessoryConfigs = activeConfig?.accessories?.length
    ? activeConfig.accessories
    : defaultMainStoreConfig.accessories;

  const featuredAccessories = accessoryConfigs.flatMap((item) => {
    const product = products.find((p) => p.slug === item.id);
    if (!product) return [];

    let imageSrc = "";
    let imageAlt = item.alt || product.name;

    if (item.image && item.image.trim() !== "") {
      imageSrc = item.image;
    } else {
      const catImg = resolveCatalogueProductImage(product);
      imageSrc = catImg?.src || "";
      imageAlt = catImg?.alt || product.name;
    }

    const family: ProductFamilyKey = item.family || (product.category === "AirPods" || product.category === "Audio" ? "airpods" : "accessories");
    const eyebrow = item.eyebrow || getAccessoryEyebrow(product);
    const displayName = item.name || product.name;

    return [{
      product,
      family,
      imageSrc,
      imageAlt,
      eyebrow,
      displayName,
    }];
  });

  if (featuredAccessories.length === 0) {
    return null;
  }


  const eyebrow = section?.eyebrow !== undefined && section.eyebrow !== "" ? section.eyebrow : "ACCESSORIES";
  const title = section?.heading?.trim() || "Complete your setup.";
  const subtitle = section?.subtitle !== undefined ? section.subtitle : "The essentials that go beautifully together.";
  const btnLabel = section?.buttonLabel !== undefined && section.buttonLabel !== "" ? section.buttonLabel : "All accessories";
  const btnDest = section?.buttonDestination !== undefined && section.buttonDestination !== "" ? section.buttonDestination : "/accessories";
  const bgStyle = section?.backgroundColor ? { backgroundColor: section.backgroundColor } : undefined;

  return (
    <section
      className="store-section store-accessories-section"
      aria-labelledby="store-accessories-title"
      style={bgStyle}
      data-section-id={section?.id || "section-accessories-carousel"}
    >
      <div className="store-container">
        <StoreCarousel
          eyebrow={eyebrow}
          title={title}
          subtitle={subtitle}
          controlsAriaLabel="Accessories carousel navigation"
          trackClassName="store-accessories-track"
          headerRight={
            <Link to={btnDest} className="store-section-header-link">
              {btnLabel}
            </Link>
          }
        >
          {featuredAccessories.map(({ product, family, imageSrc, imageAlt, eyebrow, displayName }) => {
            const enquiry = product.priceOnRequest === true || product.price <= 0;
            const purchasable = isProductPurchasable(product);

            return (
              <article key={product.id} className="store-accessory-card">
                <Link
                  to={productStoryPath(family, product.slug)}
                  className="store-accessory-media"
                  aria-label={`View ${displayName}`}
                >
                  {imageSrc ? (
                    <img
                      key={imageSrc}
                      src={imageSrc}
                      alt={imageAlt || displayName}
                      loading="lazy"
                      decoding="async"
                      className="store-accessory-img"
                    />
                  ) : (
                    <div className="store-accessory-placeholder" aria-label="Reserved image area">
                      <ShieldCheck size={32} className="text-stone-400" />
                      <span className="store-accessory-placeholder-text">Genuine Apple Accessory</span>
                    </div>
                  )}
                </Link>

                <div className="store-accessory-info">
                  <p className="store-accessory-detail">{eyebrow}</p>
                  <h3 className="store-accessory-name">
                    <Link to={productStoryPath(family, product.slug)}>
                      {displayName}
                    </Link>
                  </h3>
                  <p className="store-accessory-price">
                    {enquiry ? "Request Pricing" : formatGhs(product.price)}
                  </p>
                </div>

                <div className="store-accessory-actions">
                  <Link
                    to={productStoryPath(family, product.slug)}
                    className="btn-store-card-secondary"
                  >
                    <Eye size={15} aria-hidden="true" /> Details
                  </Link>

                  {purchasable ? (
                    <Link
                      to={productBuyPath(family, product.slug)}
                      className="btn-store-card-primary"
                      aria-label={`Configure ${product.name} to buy`}
                    >
                      <ShoppingBag size={15} aria-hidden="true" /> Buy
                    </Link>
                  ) : (
                    <Link
                      to={productBuyPath(family, product.slug)}
                      className="btn-store-card-primary"
                    >
                      Enquire
                    </Link>
                  )}
                </div>
              </article>
            );
          })}
        </StoreCarousel>
      </div>
    </section>
  );
}
