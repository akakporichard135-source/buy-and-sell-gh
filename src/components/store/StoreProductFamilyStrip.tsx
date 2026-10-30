import { Link } from "react-router-dom";
import { useCms } from "../../cms/CmsContext";
import type { MainStoreConfig, StorePageSection } from "../../cms/types";

export function StoreProductFamilyStrip({
  section,
  configOverride,
}: {
  section?: StorePageSection;
  configOverride?: MainStoreConfig;
}) {
  const { mainStore } = useCms();
  const activeConfig = configOverride || mainStore;
  const productFamilies = activeConfig?.productFamilies || [];
  const bgStyle = section?.backgroundColor ? { backgroundColor: section.backgroundColor } : undefined;

  return (
    <section
      className="store-family-strip-section"
      aria-label={section?.heading || "Browse by product family"}
      style={bgStyle}
      data-section-id={section?.id || "section-family-strip"}
    >
      <div className="store-family-strip-container">
        <div className="store-family-strip-rail">
          {productFamilies.map((family) => (
            <Link key={family.id} to={family.path} className="store-family-item">
              <span className="store-family-img-wrap">
                <img src={family.image} alt={family.alt} loading="lazy" decoding="async" className="store-family-img" />
              </span>
              <span className="store-family-name">{family.name}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
