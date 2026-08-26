import { useMemo } from "react";
import { Link } from "react-router-dom";
import audioImage from "../assets/categories/audio-premium.webp";
import gameConsolesImage from "../assets/categories/game-consoles-premium.webp";
import tvVideoImage from "../assets/categories/tv-video-equipment-premium.png";
import laptopsImage from "../assets/homepage/homepage-laptop-tablet-story.jpg";
import otherElectronicsImage from "../assets/homepage/sticker-collage/camera.webp";
import {
  electronicsCategoryLabels,
  getElectronicsBrands,
  getElectronicsCategory,
  getElectronicsProducts,
  type ElectronicsCategoryKey,
} from "../catalog/catalogueDiscovery";
import { useProductCatalog } from "../catalog/ProductCatalogContext";
import { MarketplaceCatalogue } from "../components/MarketplaceCatalogue";
import { SEO } from "../components/SEO";

const categoryCards: Array<{ key: ElectronicsCategoryKey; description: string; image: string }> = [
  { key: "laptops-computers", description: "Non-Apple laptops, desktops and computing equipment.", image: laptopsImage },
  { key: "tv-video-equipment", description: "Televisions, displays and video equipment.", image: tvVideoImage },
  { key: "video-games-consoles", description: "Consoles, controllers and gaming hardware.", image: gameConsolesImage },
  { key: "audio-equipment", description: "Speakers, headphones and home audio equipment.", image: audioImage },
  { key: "other-electronics", description: "Other electronic products published by the owner.", image: otherElectronicsImage },
];

export function ElectronicsPage() {
  const { activeProducts, error, loading, refreshProducts } = useProductCatalog();
  const products = useMemo(() => getElectronicsProducts(activeProducts), [activeProducts]);
  const brandCount = useMemo(() => getElectronicsBrands(products).length, [products]);

  return (
    <>
      <SEO title="Electronics in Ghana" description="Browse real non-Apple electronics published by Buy & Sell GH, including computers, TV equipment, gaming and audio products." />
      <section className="marketplace-page-hero">
        <p className="eyebrow-dark">Electronics</p>
        <h1>Electronics for work, home and play.</h1>
        <p>Browse real inventory published by Buy &amp; Sell GH. Apple storefront products stay in their dedicated Mac, iPhone, iPad, Watch and AirPods sections.</p>
        <span>{products.length} published {products.length === 1 ? "product" : "products"} across {brandCount} {brandCount === 1 ? "brand" : "brands"}</span>
      </section>

      <section className="marketplace-navigation" aria-labelledby="electronics-categories-title">
        <div className="marketplace-section-heading"><div><p className="eyebrow-dark">Categories</p><h2 id="electronics-categories-title">Browse electronics.</h2></div></div>
        <div className="electronics-category-grid marketplace-electronics-grid">
          {categoryCards.map((category) => {
            const count = getElectronicsProducts(products, category.key).length;
            return (
              <Link className="electronics-category-card" to={`/electronics?category=${category.key}`} key={category.key}>
                <div><p className="eyebrow-dark">{count} {count === 1 ? "listing" : "listings"}</p><h2>{electronicsCategoryLabels[category.key]}</h2><p>{category.description}</p><span>View category</span></div>
                <img src={category.image} alt={`${electronicsCategoryLabels[category.key]} category`} loading="lazy" decoding="async" />
              </Link>
            );
          })}
        </div>
      </section>

      <MarketplaceCatalogue
        products={products}
        categoryLabels={electronicsCategoryLabels}
        getCategory={getElectronicsCategory}
        loading={loading}
        error={error}
        emptyTitle="No non-Apple electronics are available yet."
        onRetry={() => void refreshProducts()}
      />
    </>
  );
}
