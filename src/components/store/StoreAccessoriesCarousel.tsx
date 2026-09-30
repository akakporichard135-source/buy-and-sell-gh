import { Eye, ShoppingBag } from "lucide-react";
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

export function StoreAccessoriesCarousel({ products }: StoreAccessoriesCarouselProps) {
  const { addItem } = useCart();
  const accessoryProducts = products.filter(
    (product) => product.category === "Accessories" || product.subcategory?.includes("Accessories"),
  );

  const displayList = accessoryProducts.length > 0 ? accessoryProducts.slice(0, 10) : [];

  if (displayList.length === 0) return null;

  return (
    <section className="store-section store-accessories-section" aria-labelledby="store-accessories-title">
      <div className="store-container">
        <StoreCarousel
          eyebrow="ACCESSORIES"
          title="Complete your setup."
          subtitle="Explore genuine charging cables, fast power adapters, Magic accessories, and protection."
          controlsAriaLabel="Accessories carousel navigation"
          trackClassName="store-accessories-track"
          headerRight={
            <Link to="/store?category=Accessories" className="store-section-header-link">
              All accessories
            </Link>
          }
        >
          {displayList.map((product) => {
            const image = resolveCatalogueProductImage(product) ?? {
              src: "/products/campaigns/accessory-belkin-3-in-1.webp",
              alt: product.name,
            };
            const enquiry = product.priceOnRequest === true || product.price <= 0;
            const purchasable = isProductPurchasable(product);
            const detailText = product.storage?.[0] || product.condition || "Original Apple";

            return (
              <article key={product.id} className="store-accessory-card">
                <Link
                  to={productStoryPath("accessories", product.slug)}
                  className="store-accessory-media"
                  aria-label={`View ${product.name}`}
                >
                  <img
                    src={image.src}
                    alt={image.alt}
                    loading="lazy"
                    decoding="async"
                    className="store-accessory-img"
                  />
                </Link>

                <div className="store-accessory-info">
                  <p className="store-accessory-detail">{detailText}</p>
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

                  {purchasable && (
                    <button
                      type="button"
                      className="btn-store-card-primary"
                      onClick={() => addItem(product, product.storage[0] || "", product.colors[0] || "")}
                      aria-label={`Add ${product.name} to cart`}
                    >
                      <ShoppingBag size={15} aria-hidden="true" /> Add
                    </button>
                  )}

                  {!purchasable && (
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
