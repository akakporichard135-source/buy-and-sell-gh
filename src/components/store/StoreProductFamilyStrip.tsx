interface ProductFamilyItem {
  id: string;
  name: string;
  image: string;
  alt: string;
  category: string;
}

const productFamilies: ProductFamilyItem[] = [
  {
    id: "iphone",
    name: "iPhone",
    image: "/products/homepage/iphone-18-pro-hero.webp",
    alt: "iPhone lineup",
    category: "Phones",
  },
  {
    id: "mac",
    name: "Mac",
    image: "/products/homepage/macbook-air.jpg",
    alt: "MacBook Air",
    category: "Laptops",
  },
  {
    id: "ipad",
    name: "iPad",
    image: "/products/homepage/ipad-air.jpg",
    alt: "iPad Air",
    category: "Tablets",
  },
  {
    id: "watch",
    name: "Apple Watch",
    image: "/products/homepage/watch-series-12.webp",
    alt: "Apple Watch Series 12",
    category: "Watches",
  },
  {
    id: "airpods",
    name: "AirPods",
    image: "/products/homepage/airpods-5.jpg",
    alt: "AirPods 5 wireless earbuds",
    category: "Audio",
  },
  {
    id: "accessories",
    name: "Accessories",
    image: "/products/campaigns/accessory-belkin-3-in-1.webp",
    alt: "Store accessories and chargers",
    category: "Accessories",
  },
];

interface StoreProductFamilyStripProps {
  activeCategory: string;
  onSelectCategory: (category: string) => void;
}

export function StoreProductFamilyStrip({
  activeCategory,
  onSelectCategory,
}: StoreProductFamilyStripProps) {
  const handleClick = (category: string) => {
    onSelectCategory(category);
    const target = document.getElementById("all-products");
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <section className="store-family-strip-section" aria-label="Browse by product family">
      <div className="store-family-strip-container">
        <div className="store-family-strip-rail" role="tablist" aria-label="Product families">
          {productFamilies.map((family) => {
            const isSelected = activeCategory === family.category;
            return (
              <button
                key={family.id}
                type="button"
                role="tab"
                aria-selected={isSelected}
                className={`store-family-item${isSelected ? " is-active" : ""}`}
                onClick={() => handleClick(family.category)}
              >
                <div className="store-family-img-wrap">
                  <img
                    src={family.image}
                    alt={family.alt}
                    loading="lazy"
                    decoding="async"
                    className="store-family-img"
                  />
                </div>
                <span className="store-family-name">{family.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
