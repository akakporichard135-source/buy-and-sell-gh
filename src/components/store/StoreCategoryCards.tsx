import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { StoreCarousel } from "./StoreCarousel";

interface CategoryCardItem {
  id: string;
  path: string;
  title: string;
  subtitle: string;
  image: string;
  alt: string;
}

const categoryCards: CategoryCardItem[] = [
  {
    id: "phones",
    path: "/iphone",
    title: "Phones",
    subtitle: "iPhone 18 Pro, iPhone Duo and verified UK Used devices.",
    image: "/products/campaigns/iphone-18-pro-silver.webp",
    alt: "iPhone devices",
  },
  {
    id: "laptops",
    path: "/mac",
    title: "Mac & Laptops",
    subtitle: "MacBook Air, MacBook Pro and Apple silicon desktops.",
    image: "/products/campaigns/macbook-air-floating.webp",
    alt: "MacBook laptops",
  },
  {
    id: "tablets",
    path: "/ipad",
    title: "iPads",
    subtitle: "iPad Air, iPad Pro, and portable everyday iPads.",
    image: "/products/campaigns/ipad-air-colors.webp",
    alt: "iPad models",
  },
  {
    id: "watches",
    path: "/watch",
    title: "Apple Watch",
    subtitle: "Apple Watch Series 12, Ultra 4 and rugged sports bands.",
    image: "/products/homepage/watch-series-12.webp",
    alt: "Apple Watch smartwatches",
  },
  {
    id: "audio",
    path: "/airpods",
    title: "AirPods & Audio",
    subtitle: "AirPods 5, Pro, Max and premium sound accessories.",
    image: "/products/homepage/airpods-5.jpg",
    alt: "AirPods wireless audio",
  },
  {
    id: "accessories",
    path: "/accessories",
    title: "Accessories",
    subtitle: "Genuine power adapters, MagSafe chargers and keyboards.",
    image: "/products/campaigns/accessory-magsafe-puck.webp",
    alt: "Apple MagSafe and store accessories",
  },
];

export function StoreCategoryCards() {
  return (
    <section className="store-section store-category-section" aria-labelledby="store-category-title">
      <div className="store-container">
        <StoreCarousel
          eyebrow="SHOP BY CATEGORY"
          title="Browse by device."
          subtitle="Explore devices by family."
          controlsAriaLabel="Shop by category carousel navigation"
          trackClassName="store-category-track"
        >
          {categoryCards.map((category) => (
            <Link
              key={category.id}
              to={category.path}
              className="store-category-card"
            >
              <div className="store-category-card-top">
                <h3 className="store-category-card-title">{category.title}</h3>
                <p className="store-category-card-subtitle">{category.subtitle}</p>
              </div>

              <div className="store-category-card-media">
                <img
                  src={category.image}
                  alt={category.alt}
                  loading="lazy"
                  decoding="async"
                  className="store-category-card-img"
                />
              </div>

              <div className="store-category-card-footer">
                <span className="store-category-action-link">
                  Shop {category.title} <ArrowRight size={16} aria-hidden="true" />
                </span>
              </div>
            </Link>
          ))}
        </StoreCarousel>
      </div>
    </section>
  );
}
