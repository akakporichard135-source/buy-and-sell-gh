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

export function StoreAudioShowcase({
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
    activeConfig?.audioEditorialCards !== undefined
      ? activeConfig.audioEditorialCards
      : defaultMainStoreConfig.audioEditorialCards || [];
  const audioItems = activeConfig?.audioItems?.length
    ? activeConfig.audioItems
    : defaultMainStoreConfig.audioItems || [];

  const entries = buildMixedShelfEntries(editorials, audioItems, products);
  if (entries.length === 0) return null;

  const eyebrow =
    section?.eyebrow !== undefined && section.eyebrow !== "" ? section.eyebrow : "Audio & sound.";
  const title = section?.heading?.trim() || "Hear every detail clearly.";
  const btnLabel =
    section?.buttonLabel !== undefined && section.buttonLabel !== ""
      ? section.buttonLabel
      : "Shop all audio";
  const btnDest =
    section?.buttonDestination !== undefined && section.buttonDestination !== ""
      ? section.buttonDestination
      : "/airpods";
  const bgStyle = resolveBuiltInSectionBgStyle(section?.backgroundColor);

  return (
    <section
      className="store-section store-audio-section"
      aria-labelledby="store-audio-title"
      style={bgStyle}
      data-section-id={section?.id || "section-audio-showcase"}
    >
      <StoreCarousel
        variant="apple"
        titleId="store-audio-title"
        eyebrow={eyebrow}
        title={title}
        controlsAriaLabel="Audio and sound carousel navigation"
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
