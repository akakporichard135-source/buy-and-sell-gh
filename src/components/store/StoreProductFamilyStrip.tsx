import { Link } from "react-router-dom";

interface ProductFamilyItem {
  id: string;
  name: string;
  image: string;
  alt: string;
  path: string;
}

const productFamilies: ProductFamilyItem[] = [
  {
    id: "iphone",
    name: "iPhone",
    image: "/products/campaigns/iphone-18-pro-silver.webp",
    alt: "Silver iPhone 18 Pro",
    path: "/iphone",
  },
  {
    id: "mac",
    name: "Mac",
    image: "/products/homepage/macbook-air.jpg",
    alt: "MacBook Air",
    path: "/mac",
  },
  {
    id: "ipad",
    name: "iPad",
    image: "/products/homepage/ipad-air.jpg",
    alt: "iPad Air",
    path: "/ipad",
  },
  {
    id: "watch",
    name: "Apple Watch",
    image: "/products/homepage/watch-series-12.webp",
    alt: "Apple Watch Series 12",
    path: "/watch",
  },
  {
    id: "airpods",
    name: "AirPods",
    image: "/products/campaigns/airpods-5-earbuds.webp",
    alt: "AirPods 5 wireless earbuds",
    path: "/airpods",
  },
  {
    id: "accessories",
    name: "Accessories",
    image: "/products/campaigns/accessory-magsafe-puck.webp",
    alt: "Apple MagSafe charger and accessories",
    path: "/accessories",
  },
];

export function StoreProductFamilyStrip() {
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
