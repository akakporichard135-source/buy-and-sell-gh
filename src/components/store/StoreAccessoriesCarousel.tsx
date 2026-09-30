import { Eye, ShieldCheck, ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";
import { productBuyPath, productStoryPath } from "../../catalog/productExperience";
import { useCart } from "../../context/CartContext";
import type { Product } from "../../types/product";
import { formatGhs } from "../../utils/format";
import { resolveCatalogueProductImage } from "../../utils/productImages";
import { isProductPurchasable } from "../../catalog/productCatalog";
import { StoreCarousel } from "./StoreCarousel";

interface StoreAccessoriesCarouselProps {
  products: Product[];
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

export function StoreAccessoriesCarousel({ products }: StoreAccessoriesCarouselProps) {
  const { addItem } = useCart();

  // Filter all legitimate catalog accessories
  const allAccessories = products.filter(
    (product) =>
      product.category === "Accessories" ||
      product.subcategory?.includes("Accessories") ||
      product.category?.toLowerCase().includes("accessories"),
  );

  // Present a curated selection of genuine Apple accessories across key categories
  const featuredAccessories = allAccessories.slice(0, 12);

  if (featuredAccessories.length === 0) {
    return null;
  }

  return (
    <section className="store-section store-accessories-section" aria-labelledby="store-accessories-title">
      <div className="store-container">
        <StoreCarousel
          eyebrow="ACCESSORIES"
          title="Complete your setup."
          subtitle="Explore genuine power adapters, braided cables, MagSafe chargers, Magic keyboards, and protection."
          controlsAriaLabel="Accessories carousel navigation"
          trackClassName="store-accessories-track"
          headerRight={
            <Link to="/store?category=Accessories" className="store-section-header-link">
              All accessories
            </Link>
          }
        >
          {featuredAccessories.map((product) => {
            const image = resolveCatalogueProductImage(product);
            const enquiry = product.priceOnRequest === true || product.price <= 0;
            const purchasable = isProductPurchasable(product);
            const eyebrow = getAccessoryEyebrow(product);

            return (
              <article key={product.id} className="store-accessory-card">
                <Link
                  to={productStoryPath("accessories", product.slug)}
                  className="store-accessory-media"
                  aria-label={`View ${product.name}`}
                >
                  {image?.src ? (
                    <img
                      src={image.src}
                      alt={image.alt || product.name}
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
                    <Link to={productStoryPath("accessories", product.slug)}>
                      {product.name}
                    </Link>
                  </h3>
                  <p className="store-accessory-price">
                    {enquiry ? "Request Pricing" : formatGhs(product.price)}
                  </p>
                </div>

                <div className="store-accessory-actions">
                  <Link
                    to={productStoryPath("accessories", product.slug)}
                    className="btn-store-card-secondary"
                  >
                    <Eye size={15} aria-hidden="true" /> Details
                  </Link>

                  {purchasable ? (
                    <button
                      type="button"
                      className="btn-store-card-primary"
                      onClick={() => addItem(product, product.storage[0] || "", product.colors[0] || "")}
                      aria-label={`Add ${product.name} to cart`}
                    >
                      <ShoppingBag size={15} aria-hidden="true" /> Add
                    </button>
                  ) : (
                    <Link
                      to={productBuyPath("accessories", product.slug)}
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
