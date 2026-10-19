import { Link } from "react-router-dom";
import { useCms } from "../../cms/CmsContext";

export function StoreProductFamilyStrip() {
  const { mainStore } = useCms();
  const productFamilies = mainStore?.productFamilies || [];

  return (
    <section className="store-family-strip-section" aria-label="Browse by product family">
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
