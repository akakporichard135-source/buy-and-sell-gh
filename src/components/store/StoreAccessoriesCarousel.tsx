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

interface CuratedAccessory {
  id: string;
  name: string;
  category: string;
  detail: string;
  price: number;
  image: string;
  slug: string;
  purchasable: boolean;
}

const fallbackAccessories: CuratedAccessory[] = [
  {
    id: "curated-belkin-3in1",
    name: "Belkin BoostCharge Pro 3-in-1 Wireless Stand",
    category: "CHARGING",
    detail: "Fast wireless charging for iPhone, Apple Watch & AirPods",
    price: 1850,
    image: "/products/campaigns/accessory-belkin-3-in-1.webp",
    slug: "charging-and-power",
    purchasable: true,
  },
  {
    id: "curated-magsafe-puck",
    name: "Apple MagSafe Charger (1m & 2m)",
    category: "POWER",
    detail: "Up to 25W fast wireless charging with braided USB-C cable",
    price: 650,
    image: "/products/campaigns/accessory-magsafe-puck.webp",
    slug: "charging-and-power",
    purchasable: true,
  },
  {
    id: "curated-usbc-woven",
    name: "Apple 240W USB-C Woven Charge Cable (2m)",
    category: "CABLES",
    detail: "Durable braided cable for Mac, iPad & iPhone 15/16/17/18",
    price: 450,
    image: "/products/campaigns/accessory-usbc-cables.webp",
    slug: "charging-and-power",
    purchasable: true,
  },
  {
    id: "curated-70w-adapter",
    name: "Apple 70W USB-C Power Adapter",
    category: "POWER ADAPTERS",
    detail: "Fast charging for MacBook Air, MacBook Pro & iPad Pro",
    price: 950,
    image: "/products/campaigns/accessory-macbook-charger.webp",
    slug: "charging-and-power",
    purchasable: true,
  },
  {
    id: "curated-color-cables",
    name: "Braided Fast Charge Cables & Adapters",
    category: "ESSENTIALS",
    detail: "Original Apple USB-C and Lightning cable options in Accra",
    price: 380,
    image: "/products/campaigns/accessory-color-cables.webp",
    slug: "charging-and-power",
    purchasable: true,
  },
];

export function StoreAccessoriesCarousel({ products }: StoreAccessoriesCarouselProps) {
  const { addItem } = useCart();
  const accessoryProducts = products.filter(
    (product) => product.category === "Accessories" || product.subcategory?.includes("Accessories"),
  );

  const hasCatalogAccessories = accessoryProducts.length > 0;

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
          {hasCatalogAccessories
            ? accessoryProducts.slice(0, 10).map((product) => {
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
              })
            : fallbackAccessories.map((item) => (
                <article key={item.id} className="store-accessory-card">
                  <Link
                    to={productStoryPath("accessories", item.slug)}
                    className="store-accessory-media"
                    aria-label={`View ${item.name}`}
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      loading="lazy"
                      decoding="async"
                      className="store-accessory-img"
                    />
                  </Link>

                  <div className="store-accessory-info">
                    <p className="store-accessory-detail">{item.category}</p>
                    <h3 className="store-accessory-name">
                      <Link to={productStoryPath("accessories", item.slug)}>
                        {item.name}
                      </Link>
                    </h3>
                    <p className="store-accessory-price">{formatGhs(item.price)}</p>
                  </div>

                  <div className="store-accessory-actions">
                    <Link
                      to={productStoryPath("accessories", item.slug)}
                      className="btn-store-card-secondary"
                    >
                      <Eye size={15} aria-hidden="true" /> Details
                    </Link>

                    <Link
                      to="/accessories/charging-and-power"
                      className="btn-store-card-primary"
                    >
                      Explore
                    </Link>
                  </div>
                </article>
              ))}
        </StoreCarousel>
      </div>
    </section>
  );
}
