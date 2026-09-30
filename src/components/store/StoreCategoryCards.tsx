import { ArrowRight } from "lucide-react";
import { StoreCarousel } from "./StoreCarousel";

interface CategoryCardItem {
  id: string;
  categoryKey: string;
  title: string;
  subtitle: string;
  image: string;
  alt: string;
}

const categoryCards: CategoryCardItem[] = [
  {
    id: "phones",
    categoryKey: "Phones",
    title: "Phones",
    subtitle: "iPhone 18 Pro, iPhone Duo and verified UK Used devices.",
    image: "/products/campaigns/iphone-18-pro-colors.webp",
    alt: "iPhone devices",
  },
  {
    id: "laptops",
    categoryKey: "Laptops",
    title: "Mac & Laptops",
    subtitle: "MacBook Air, MacBook Pro and Apple silicon desktops.",
    image: "/products/campaigns/macbook-air-floating.webp",
    alt: "MacBook laptops",
  },
  {
    id: "tablets",
    categoryKey: "Tablets",
    title: "iPads",
    subtitle: "iPad Air, iPad Pro, and portable everyday iPads.",
    image: "/products/campaigns/ipad-air-colors.webp",
    alt: "iPad models",
  },
  {
    id: "watches",
    categoryKey: "Watches",
    title: "Apple Watch",
    subtitle: "Apple Watch Series 12, Ultra 4 and rugged sports bands.",
    image: "/products/homepage/watch-series-12.webp",
    alt: "Apple Watch smartwatches",
  },
  {
    id: "audio",
    categoryKey: "Audio",
    title: "AirPods & Audio",
    subtitle: "AirPods 5, Pro, Max and premium sound accessories.",
    image: "/products/homepage/airpods-5.jpg",
    alt: "AirPods wireless audio",
  },
  {
    id: "accessories",
    categoryKey: "Accessories",
    title: "Accessories",
    subtitle: "Genuine power adapters, MagSafe chargers and keyboards.",
    image: "/products/campaigns/accessory-belkin-3-in-1.webp",
    alt: "Store accessories",
  },
];

interface StoreCategoryCardsProps {
  onSelectCategory: (categoryKey: string) => void;
}

export function StoreCategoryCards({ onSelectCategory }: StoreCategoryCardsProps) {
  const handleClick = (categoryKey: string) => {
    onSelectCategory(categoryKey);
    const target = document.getElementById("all-products");
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <section className="store-section store-category-section" aria-labelledby="store-category-title">
      <div className="store-container">
        <StoreCarousel
          eyebrow="SHOP BY CATEGORY"
          title="Browse by device."
          subtitle="Select a category to instantly explore all confirmed items in our store."
          controlsAriaLabel="Shop by category carousel navigation"
          trackClassName="store-category-track"
        >
          {categoryCards.map((category) => (
            <button
              key={category.id}
              type="button"
              className="store-category-card"
              onClick={() => handleClick(category.categoryKey)}
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
            </button>
          ))}
        </StoreCarousel>
      </div>
    </section>
  );
}
