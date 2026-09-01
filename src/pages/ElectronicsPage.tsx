import { useMemo } from "react";
import { Link } from "react-router-dom";
import audioImage from "../assets/categories/audio-premium.webp";
import gameConsolesImage from "../assets/categories/game-consoles-premium.webp";
import tvVideoImage from "../assets/categories/tv-video-equipment-premium.png";
import laptopsImage from "../assets/homepage/homepage-laptop-tablet-story.jpg";
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
  { key: "laptops-computers", description: "Laptops, desktops and computing equipment.", image: laptopsImage },
  { key: "tv-video-equipment", description: "Televisions, displays and video equipment.", image: tvVideoImage },
  { key: "video-game-consoles", description: "Consoles, controllers and gaming hardware.", image: gameConsolesImage },
  { key: "audio-music-equipment", description: "Speakers, headphones and music equipment.", image: audioImage },
];

export function ElectronicsPage() {
  const { activeProducts, error, loading, refreshProducts } = useProductCatalog();
  const products = useMemo(() => getElectronicsProducts(activeProducts), [activeProducts]);
  const brandCount = useMemo(() => getElectronicsBrands(products).length, [products]);

  return (
    <>
      <SEO title="Electronics Marketplace in Ghana" description="Browse marketplace listings for computers, TV and video equipment, game consoles, audio and music equipment at Buy & Sell GH." />
      <section className="marketplace-page-hero">
        <p className="eyebrow-dark">Electronics</p>
        <h1>Electronics for work, home and play.</h1>
        <p>Browse laptops and computers, TV and video equipment, game consoles, and audio and music equipment listed in the marketplace.</p>
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
        emptyTitle="No marketplace listings are available in this category yet."
        onRetry={() => void refreshProducts()}
      />
    </>
  );
}
