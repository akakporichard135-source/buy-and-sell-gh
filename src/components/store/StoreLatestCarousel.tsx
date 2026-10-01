import { Link } from "react-router-dom";
import { productBuyPath, productStoryPath, type ProductFamilyKey } from "../../catalog/productExperience";
import { newMacLaunches } from "../../data/newMacLaunches";
import type { Product } from "../../types/product";
import { resolveCatalogueProductImage } from "../../utils/productImages";
import macMiniImage from "../../assets/homepage/homepage-mac-mini-white.webp";
import { StoreCarousel } from "./StoreCarousel";

interface FeaturedProduct {
  id: string;
  theme: "dark" | "light";
  eyebrow: string;
  name: string;
  statement: string;
  image: string;
  alt: string;
  learnMorePath: string;
  actionPath: string;
  actionLabel: string;
}

function catalogueFeature(products: Product[], slug: string, family: ProductFamilyKey, statement: string): FeaturedProduct | null {
  const product = products.find((item) => item.slug === slug);
  if (!product) return null;
  const image = resolveCatalogueProductImage(product);
  return {
    id: slug,
    theme: "light",
    eyebrow: product.subcategory || product.category,
    name: product.name,
    statement,
    image: image?.src || "",
    alt: image?.alt || product.name,
    learnMorePath: productStoryPath(family, slug),
    actionPath: productBuyPath(family, slug),
    actionLabel: "View Pricing",
  };
}

function featuredRail({
  products,
  type,
}: {
  products: Product[];
  type: "latest" | "more";
}) {
  const latest: (FeaturedProduct | null)[] = [
    catalogueFeature(products, "macbook-pro-14-m5", "mac", "A powerful canvas for demanding work."),
    catalogueFeature(products, "macbook-air-13-m5", "mac", "Light to carry. Ready for every day."),
    {
      id: "mac-mini",
      theme: "light",
      eyebrow: "MAC MINI",
      name: "Mac mini",
      statement: newMacLaunches["mac-mini"].subtitle,
      image: macMiniImage,
      alt: "Silver Mac mini desktop",
      learnMorePath: newMacLaunches["mac-mini"].learnMoreTo,
      actionPath: newMacLaunches["mac-mini"].preorderTo,
      actionLabel: "Pre-order",
    },
    {
      id: "mac-studio",
      theme: "dark",
      eyebrow: "MAC STUDIO",
      name: "Mac Studio",
      statement: newMacLaunches["mac-studio"].subtitle,
      image: newMacLaunches["mac-studio"].image,
      alt: newMacLaunches["mac-studio"].imageAlt,
      learnMorePath: newMacLaunches["mac-studio"].learnMoreTo,
      actionPath: newMacLaunches["mac-studio"].preorderTo,
      actionLabel: "Pre-order",
    },
    catalogueFeature(products, "ipad-air-11-inch-m4", "ipad", "A versatile canvas for creativity and work."),
    catalogueFeature(products, "ipad-a16", "ipad", "Everything you need in an everyday iPad."),
    catalogueFeature(products, "ipad-mini-a17-pro", "ipad", "A full iPad experience in a compact size."),
    catalogueFeature(products, "apple-watch-se-3", "watch", "The essentials, right on your wrist."),
  ];

  const more: (FeaturedProduct | null)[] = [
    {
      id: "iphone-18-pro",
      theme: "dark",
      eyebrow: "IPHONE 18 PRO",
      name: "iPhone 18 Pro",
      statement: "A new expression of Pro.",
      image: "/products/homepage/iphone-18-pro-hero.webp",
      alt: "iPhone 18 Pro product presentation",
      learnMorePath: "/iphone/iphone-18-pro",
      actionPath: "/shop/buy-iphone/iphone-18-pro",
      actionLabel: "View Pricing",
    },
    {
      id: "iphone-duo",
      theme: "light",
      eyebrow: "IPHONE DUO",
      name: "iPhone Duo",
      statement: "Two displays. Foldable versatility.",
      image: "/products/campaigns/iphone-duo-open.webp",
      alt: "iPhone Duo unfolded with both displays visible",
      learnMorePath: "/iphone/iphone-duo",
      actionPath: "/shop/buy-iphone/iphone-duo",
      actionLabel: "View Pricing",
    },
    {
      id: "airpods-5",
      theme: "light",
      eyebrow: "AIRPODS 5",
      name: "AirPods 5",
      statement: "Sound that stays with you.",
      image: "/products/campaigns/airpods-5-earbuds.webp",
      alt: "AirPods 5 earbuds",
      learnMorePath: "/airpods/airpods-5",
      actionPath: "/shop/buy-airpods/airpods-5",
      actionLabel: "View Pricing",
    },
    catalogueFeature(products, "iphone-17", "iphone", "A brilliant everyday iPhone."),
    catalogueFeature(products, "airpods-max-2", "airpods", "Over-ear sound, beautifully considered."),
    catalogueFeature(products, "iphone-air", "iphone", "A remarkably thin iPhone."),
    catalogueFeature(products, "iphone-17-pro", "iphone", "Pro performance in a familiar size."),
  ];

  const items = (type === "latest" ? latest : more).filter((item): item is FeaturedProduct => item !== null);
  return (
    <section className={`store-section store-latest-section store-feature-section-${type}`} aria-label={type === "latest" ? "The latest" : "More to love"}>
      <div className="store-container">
        <StoreCarousel
          eyebrow={type === "latest" ? "THE LATEST" : "MORE TO LOVE"}
          title={type === "latest" ? "Take a look at what's new." : "Find your new favorites."}
          controlsAriaLabel={type === "latest" ? "The latest products carousel navigation" : "More to love carousel navigation"}
          trackClassName="store-latest-track"
        >
          {items.map((product) => (
            <article key={product.id} className={`store-latest-card store-latest-card-${product.theme}`}>
              <div className="store-latest-card-header">
                <p className="store-latest-card-eyebrow">{product.eyebrow}</p>
                <h3 className="store-latest-card-name">{product.name}</h3>
                <p className="store-latest-card-statement">{product.statement}</p>
              </div>
              <Link to={product.learnMorePath} className="store-latest-card-media" aria-label={`Learn more about ${product.name}`}>
                {product.image ? <img src={product.image} alt={product.alt} loading="lazy" decoding="async" className="store-latest-card-img" /> : <span className="store-feature-image-pending">Image coming soon</span>}
              </Link>
              <div className="store-latest-card-actions">
                <Link to={product.learnMorePath} className="btn-store-secondary" aria-label={`Learn more about ${product.name}`}>Learn more</Link>
                <Link to={product.actionPath} className="btn-store-primary" aria-label={`${product.actionLabel} for ${product.name}`}>{product.actionLabel}</Link>
              </div>
            </article>
          ))}
        </StoreCarousel>
      </div>
    </section>
  );
}

export function StoreLatestCarousel({ products }: { products: Product[] }) {
  return featuredRail({ products, type: "latest" });
}

export function StoreMoreToLoveCarousel({ products }: { products: Product[] }) {
  return featuredRail({ products, type: "more" });
}
