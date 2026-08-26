import { ArrowLeft, ArrowRight } from "lucide-react";
import { useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import gameConsolesImage from "../assets/categories/game-consoles-premium.webp";
import laptopsImage from "../assets/categories/macbooks-premium.webp";
import tvVideoImage from "../assets/categories/tv-video-equipment-premium.png";
import { electronicsCategoryLabels, getElectronicsProducts, type ElectronicsCategoryKey } from "../catalog/catalogueDiscovery";
import { useProductCatalog } from "../catalog/ProductCatalogContext";
import { ProductGrid } from "../components/ProductGrid";
import { SEO } from "../components/SEO";

const categoryCards: Array<{ key: ElectronicsCategoryKey; description: string; image: string }> = [
  { key: "laptops-computers", description: "Laptops, MacBooks and published computing products.", image: laptopsImage },
  { key: "tv-video-equipment", description: "Televisions, displays and video equipment.", image: tvVideoImage },
  { key: "video-games-consoles", description: "Consoles, controllers and gaming hardware.", image: gameConsolesImage },
];

export function ElectronicsPage() {
  const { activeProducts, error, loading, refreshProducts } = useProductCatalog();
  const [params] = useSearchParams();
  const requestedCategory = params.get("category");
  const selectedCategory = requestedCategory && requestedCategory in electronicsCategoryLabels ? requestedCategory as ElectronicsCategoryKey : undefined;
  const products = useMemo(() => getElectronicsProducts(activeProducts, selectedCategory), [activeProducts, selectedCategory]);

  return (
    <>
      <SEO title="Electronics in Ghana" description="Browse real published laptops, computers, TV and video equipment, game consoles and gaming hardware from Buy & Sell GH." />
      <section className="catalogue-hub-hero">
        <p className="eyebrow-dark">Electronics</p>
        <h1>Technology for work and play.</h1>
        <p>Choose a category to see products currently published by Buy &amp; Sell GH.</p>
      </section>
      <section className="catalogue-hub-section" aria-labelledby="electronics-categories-title">
        <div className="catalogue-hub-heading"><div><p className="eyebrow-dark">Categories</p><h2 id="electronics-categories-title">Browse electronics.</h2></div></div>
        <div className="electronics-category-grid">
          {categoryCards.map((category) => {
            const count = getElectronicsProducts(activeProducts, category.key).length;
            return (
              <Link className={`electronics-category-card ${selectedCategory === category.key ? "is-active" : ""}`} to={`/electronics?category=${category.key}`} key={category.key}>
                <div><p className="eyebrow-dark">{count} {count === 1 ? "product" : "products"}</p><h2>{electronicsCategoryLabels[category.key]}</h2><p>{category.description}</p><span>View category <ArrowRight size={16} /></span></div>
                <img src={category.image} alt={`${electronicsCategoryLabels[category.key]} category`} loading="lazy" decoding="async" />
              </Link>
            );
          })}
        </div>
      </section>
      <section className="catalogue-hub-results" aria-labelledby="electronics-results-title">
        <div className="catalogue-hub-heading">
          <div><p className="eyebrow-dark">{products.length} {products.length === 1 ? "product" : "products"}</p><h2 id="electronics-results-title">{selectedCategory ? electronicsCategoryLabels[selectedCategory] : "Available electronics"}</h2></div>
          {selectedCategory && <Link className="catalogue-hub-text-link" to="/electronics"><ArrowLeft size={16} /> All electronics</Link>}
        </div>
        {loading ? <div className="catalogue-hub-empty compact">Loading electronics...</div> : error ? <div className="catalogue-hub-empty compact"><strong>Catalogue is temporarily unavailable.</strong><button className="btn-secondary" type="button" onClick={() => void refreshProducts()}>Retry</button></div> : products.length > 0 ? <ProductGrid products={products} /> : <div className="catalogue-hub-empty"><strong>No products available in this category yet.</strong><p>The owner can publish products from the Admin Product Manager, or you can request the exact device you need.</p><Link className="btn-primary" to="/pre-order">Request a Device</Link></div>}
      </section>
    </>
  );
}
