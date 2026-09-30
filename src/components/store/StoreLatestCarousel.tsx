import { Link } from "react-router-dom";
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

const featuredProducts: FeaturedProduct[] = [
  {
    id: "iphone-18-pro",
    theme: "dark",
    eyebrow: "IPHONE 18 PRO",
    name: "iPhone 18 Pro",
    statement: "Designed for a premium Pro experience.",
    image: "/products/homepage/iphone-18-pro-hero.webp",
    alt: "iPhone 18 Pro in titanium finish",
    learnMorePath: "/iphone/iphone-18-pro",
    actionPath: "/shop/buy-iphone/iphone-18-pro",
    actionLabel: "Buy",
  },
  {
    id: "iphone-duo",
    theme: "light",
    eyebrow: "IPHONE DUO",
    name: "iPhone Duo",
    statement: "Two displays. Foldable versatility.",
    image: "/products/homepage/iphone-duo.webp",
    alt: "iPhone Duo foldable phone open display",
    learnMorePath: "/iphone/iphone-duo",
    actionPath: "/shop/buy-iphone/iphone-duo",
    actionLabel: "View Pricing",
  },
  {
    id: "watch-series-12",
    theme: "light",
    eyebrow: "APPLE WATCH SERIES 12",
    name: "Apple Watch Series 12",
    statement: "A refined everyday Apple Watch experience.",
    image: "/products/homepage/watch-series-12.webp",
    alt: "Apple Watch Series 12 smartwatch",
    learnMorePath: "/watch/apple-watch-series-12",
    actionPath: "/shop/buy-watch/apple-watch-series-12",
    actionLabel: "Buy",
  },
  {
    id: "watch-ultra-4",
    theme: "dark",
    eyebrow: "APPLE WATCH ULTRA 4",
    name: "Apple Watch Ultra 4",
    statement: "Engineered for rugged durability.",
    image: "/products/homepage/watch-ultra-4.webp",
    alt: "Apple Watch Ultra 4 rugged titanium smartwatch",
    learnMorePath: "/watch/apple-watch-ultra-4",
    actionPath: "/shop/buy-watch/apple-watch-ultra-4",
    actionLabel: "Buy",
  },
  {
    id: "airpods-5",
    theme: "light",
    eyebrow: "AIRPODS 5",
    name: "AirPods 5",
    statement: "Clear acoustic performance in a compact design.",
    image: "/products/homepage/airpods-5.jpg",
    alt: "AirPods 5 wireless earbuds in open case",
    learnMorePath: "/airpods/airpods-5",
    actionPath: "/shop/buy-airpods/airpods-5",
    actionLabel: "Buy",
  },
  {
    id: "macbook-air",
    theme: "light",
    eyebrow: "MACBOOK AIR",
    name: "MacBook Air",
    statement: "Thin, lightweight, and versatile for everyday work.",
    image: "/products/homepage/macbook-air.jpg",
    alt: "MacBook Air slim profile laptop",
    learnMorePath: "/mac/macbook-air",
    actionPath: "/shop/buy-mac/macbook-air",
    actionLabel: "Buy",
  },
  {
    id: "mac-mini",
    theme: "light",
    eyebrow: "MAC MINI",
    name: "Mac mini",
    statement: "Compact desktop hardware with versatile connectivity.",
    image: "/products/homepage/mac-mini.jpg",
    alt: "Mac mini compact desktop hardware",
    learnMorePath: "/mac-mini",
    actionPath: "/pre-order?category=Mac&model=Mac%20mini%20(M6%20or%20M5%20Pro)",
    actionLabel: "Pre-order",
  },
  {
    id: "ipad-air",
    theme: "light",
    eyebrow: "IPAD AIR",
    name: "iPad Air",
    statement: "A versatile portable canvas for creativity and work.",
    image: "/products/homepage/ipad-air.jpg",
    alt: "iPad Air in vibrant finish",
    learnMorePath: "/ipad/ipad-air",
    actionPath: "/shop/buy-ipad/ipad-air",
    actionLabel: "Buy",
  },
];

export function StoreLatestCarousel() {
  return (
    <section className="store-section store-latest-section" aria-labelledby="store-latest-title">
      <div className="store-container">
        <StoreCarousel
          eyebrow="THE LATEST"
          title="Take a look at what’s new."
          subtitle="Explore the latest flagships, refined audio, and powerful Apple silicon."
          controlsAriaLabel="The Latest products carousel navigation"
          trackClassName="store-latest-track"
        >
          {featuredProducts.map((product) => (
            <article
              key={product.id}
              className={`store-latest-card store-latest-card-${product.theme}`}
            >
              <div className="store-latest-card-header">
                <p className="store-latest-card-eyebrow">{product.eyebrow}</p>
                <h3 className="store-latest-card-name">{product.name}</h3>
                <p className="store-latest-card-statement">{product.statement}</p>
              </div>

              <div className="store-latest-card-media">
                <img
                  src={product.image}
                  alt={product.alt}
                  loading="lazy"
                  decoding="async"
                  className="store-latest-card-img"
                />
              </div>

              <div className="store-latest-card-actions">
                <Link
                  to={product.learnMorePath}
                  className="btn-store-secondary"
                  aria-label={`Learn more about ${product.name}`}
                >
                  Learn more
                </Link>
                <Link
                  to={product.actionPath}
                  className="btn-store-primary"
                  aria-label={`${product.actionLabel} ${product.name}`}
                >
                  {product.actionLabel}
                </Link>
              </div>
            </article>
          ))}
        </StoreCarousel>
      </div>
    </section>
  );
}
