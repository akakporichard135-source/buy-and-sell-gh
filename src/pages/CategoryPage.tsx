import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useProductCatalog } from "../catalog/ProductCatalogContext";
import { isProductUnavailable } from "../catalog/productCatalog";
import { ProductGrid } from "../components/ProductGrid";
import { SEO } from "../components/SEO";
import { productMatchesCategorySlug } from "../utils/productPresentation";

const categoryCopy: Record<string, { title: string; eyebrow: string; description: string }> = {
  iphones: {
    eyebrow: "iPhones",
    title: "Find the iPhone That Fits You.",
    description: "Compare available iPhones across storage, condition and price before submitting an order request.",
  },
  ipads: {
    eyebrow: "iPads",
    title: "Portable Power for Every Day.",
    description: "Browse iPad options for work, study, entertainment and creative use.",
  },
  macbooks: {
    eyebrow: "MacBooks",
    title: "Power for Work, Study and Creativity.",
    description: "Check MacBook availability and request the model, chip and storage that fits your work.",
  },
  "apple-watch": {
    eyebrow: "Apple Watch",
    title: "Stay Connected. Stay Active.",
    description: "Shop Apple Watch options for notifications, fitness and everyday convenience.",
  },
  airpods: {
    eyebrow: "AirPods",
    title: "Wireless Sound, Made Simple.",
    description: "Find original AirPods options with clear availability and WhatsApp support.",
  },
  accessories: {
    eyebrow: "Accessories",
    title: "Original Accessories for Your Setup.",
    description: "Browse accessory options that support your Apple devices.",
  },
  "uk-used-devices": {
    eyebrow: "UK Used Devices",
    title: "Inspected UK Used Apple Devices.",
    description: "Explore UK used devices with condition, battery and inspection details clearly stated.",
  },
  "brand-new-devices": {
    eyebrow: "Brand New Devices",
    title: "Brand New Apple Devices.",
    description: "Shop brand new device options with availability, warranty and payment details confirmed before purchase.",
  },
};

export function CategoryPage() {
  const { categorySlug = "" } = useParams();
  const { activeProducts, loading, error, refreshProducts } = useProductCatalog();
  const copy = categoryCopy[categorySlug];
  const products = activeProducts
    .filter((product) => !isProductUnavailable(product))
    .filter((product) => productMatchesCategorySlug(product, categorySlug));

  if (!copy) {
    return (
      <section className="page-hero">
        <p className="eyebrow-dark">Category</p>
        <h1>Category not found</h1>
        <p>Browse the full store to find available Apple devices and accessories.</p>
        <Link className="btn-primary mt-6" to="/shop">View Store</Link>
      </section>
    );
  }

  return (
    <>
      <SEO title={`${copy.eyebrow} in Ghana`} description={`${copy.description} Buy & Sell GH confirms availability, price and delivery details before payment.`} />
      <section className="category-page-hero">
        <div>
          <p className="eyebrow-dark">{copy.eyebrow}</p>
          <h1>{copy.title}</h1>
          <p>{copy.description}</p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link className="btn-primary" to="/shop">Search Store <ArrowRight size={18} /></Link>
            <Link className="btn-secondary" to="/device-request">Request a Device</Link>
          </div>
        </div>
        <div className="category-trust-panel" aria-label="Buy & Sell GH category trust points">
          {["Correct category only", "Availability shown clearly", "Order request before payment"].map((item) => (
            <span key={item}><CheckCircle2 size={17} /> {item}</span>
          ))}
        </div>
      </section>
      <section className="section category-results-section">
        <div className="section-heading">
          <p className="eyebrow-dark">{products.length} available</p>
          <h2>{copy.eyebrow}</h2>
          <p>Only matching products are shown here. Sold or unavailable products are excluded from this selling section.</p>
        </div>
        {loading ? (
          <div className="rounded-lg border border-black/7 bg-white p-8 text-center font-black text-ink/70">Loading products...</div>
        ) : error ? (
          <div className="rounded-lg border border-black/7 bg-white p-8 text-center">
            <p className="font-black text-ink">Catalogue is temporarily unavailable.</p>
            <button className="btn-secondary mt-4" type="button" onClick={() => void refreshProducts()}>Retry</button>
          </div>
        ) : (
          <ProductGrid products={products} />
        )}
      </section>
    </>
  );
}
