import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useCms } from "../../cms/CmsContext";
import { defaultMainStoreConfig } from "../../cms/defaultCmsData";
import type { MainStoreConfig, StorePageSection } from "../../cms/types";
import type { Product } from "../../types/product";
import { StoreCarousel } from "./StoreCarousel";
import {
  buildMixedShelfEntries,
  StoreEditorialPromoTile,
  StoreWhiteProductTile,
} from "./StoreEditorialAndProductTiles";
import { resolveBuiltInSectionBgStyle } from "./storeSectionStyle";

interface StoreAccessoriesCarouselProps {
  products: Product[];
  section?: StorePageSection;
  configOverride?: MainStoreConfig;
}

export function StoreAccessoriesCarousel({
  products,
  section,
  configOverride,
}: StoreAccessoriesCarouselProps) {
  const { mainStore } = useCms();
  const activeConfig = configOverride || mainStore;
  const editorials =
    activeConfig?.accessoriesEditorialCards !== undefined
      ? activeConfig.accessoriesEditorialCards
      : defaultMainStoreConfig.accessoriesEditorialCards || [];
  const accessoryItems = activeConfig?.accessories?.length
    ? activeConfig.accessories
    : defaultMainStoreConfig.accessories;

  const entries = buildMixedShelfEntries(editorials, accessoryItems, products);
  if (entries.length === 0) return null;

  const eyebrow =
    section?.eyebrow !== undefined && section.eyebrow !== "" ? section.eyebrow : "Accessories.";
  const title =
    section?.heading?.trim() || "Essentials that pair perfectly with your favorite devices.";
  const btnLabel =
    section?.buttonLabel !== undefined && section.buttonLabel !== ""
      ? section.buttonLabel
      : "Shop all accessories";
  const btnDest =
    section?.buttonDestination !== undefined && section.buttonDestination !== ""
      ? section.buttonDestination
      : "/accessories";
  const bgStyle = resolveBuiltInSectionBgStyle(section?.backgroundColor);

  return (
    <section
      className="store-section store-accessories-section"
      aria-labelledby="store-accessories-title"
      style={bgStyle}
      data-section-id={section?.id || "section-accessories-carousel"}
    >
      <StoreCarousel
        variant="apple"
        titleId="store-accessories-title"
        eyebrow={eyebrow}
        title={title}
        controlsAriaLabel="Accessories carousel navigation"
        trackClassName="store-mixed-track"
        headerRight={
          <Link to={btnDest} className="store-section-header-link">
            {btnLabel} <ChevronRight size={14} aria-hidden="true" />
          </Link>
        }
      >
        {entries.map((entry) =>
          entry.kind === "editorial" ? (
            <StoreEditorialPromoTile key={`ed-${entry.tile.id}`} tile={entry.tile} />
          ) : (
            <StoreWhiteProductTile
              key={`prod-${entry.product.id}`}
              item={entry.item}
              product={entry.product}
            />
          )
        )}
      </StoreCarousel>
    </section>
  );
}
