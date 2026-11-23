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

export function StoreColorfulAccessories({
  products,
  section,
  configOverride,
}: {
  products: Product[];
  section?: StorePageSection;
  configOverride?: MainStoreConfig;
}) {
  const { mainStore } = useCms();
  const activeConfig = configOverride || mainStore;
  const editorials =
    activeConfig?.colorfulEditorialCards !== undefined
      ? activeConfig.colorfulEditorialCards
      : defaultMainStoreConfig.colorfulEditorialCards || [];
  const colorfulItems = activeConfig?.colorfulItems?.length
    ? activeConfig.colorfulItems
    : defaultMainStoreConfig.colorfulItems || [];

  const entries = buildMixedShelfEntries(editorials, colorfulItems, products);
  if (entries.length === 0) return null;

  const eyebrow =
    section?.eyebrow !== undefined && section.eyebrow !== ""
      ? section.eyebrow
      : "Power, protection & style.";
  const title = section?.heading?.trim() || "Built to power your Apple setup.";
  const btnLabel =
    section?.buttonLabel !== undefined && section.buttonLabel !== ""
      ? section.buttonLabel
      : "Explore all accessories";
  const btnDest =
    section?.buttonDestination !== undefined && section.buttonDestination !== ""
      ? section.buttonDestination
      : "/accessories";
  const bgStyle = resolveBuiltInSectionBgStyle(section?.backgroundColor);

  return (
    <section
      className="store-section store-colorful-section"
      aria-labelledby="store-colorful-title"
      style={bgStyle}
      data-section-id={section?.id || "section-colorful-accessories"}
    >
      <StoreCarousel
        variant="apple"
        titleId="store-colorful-title"
        eyebrow={eyebrow}
        title={title}
        controlsAriaLabel="Power and workspace accessories carousel navigation"
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
