import { ArrowRight, CheckCircle2 } from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { useProductCatalog } from "../catalog/ProductCatalogContext";
import { isProductUnavailable } from "../catalog/productCatalog";
import { ProductGrid } from "../components/ProductGrid";
import { SEO } from "../components/SEO";
import "../styles/catalogue-white.css";
import {
  airpodsFamilyOptions,
  airpodsGenerationOptions,
  accessoryFamilyOptions,
  compareAirpodsNewest,
  compareIphonesNewest,
  compareIpadsNewest,
  compareMacbooksNewest,
  compareWatchesNewest,
  getAirpodsFamily,
  getAirpodsGeneration,
  getAccessoryFamily,
  getIpadFamily,
  getIphoneGeneration,
  getMacbookFamily,
  getMacbookGeneration,
  getMacbookGenerationOptions,
  getWatchFamily,
  ipadFamilyOptions,
  iphoneGenerationOptions,
  macbookFamilyOptions,
  productMatchesCategorySlug,
  watchFamilyOptions,
} from "../utils/productPresentation";

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

const whiteCatalogueSlugs = new Set([
  "iphones",
  "ipads",
  "macbooks",
  "apple-watch",
  "airpods",
  "accessories",
  "uk-used-devices",
]);

export function CategoryPage() {
  const { categorySlug = "" } = useParams();
  const usesWhiteCatalogue = whiteCatalogueSlugs.has(categorySlug);
  const [searchParams] = useSearchParams();
  const { activeProducts, loading, error, refreshProducts } = useProductCatalog();
  const [generation, setGeneration] = useState("All");
  const [ipadFamily, setIpadFamily] = useState("All");
  const [watchFamily, setWatchFamily] = useState("All");
  const [macbookFamily, setMacbookFamily] = useState(() => searchParams.get("family") ?? "All");
  const [macbookGeneration, setMacbookGeneration] = useState(() => searchParams.get("generation") ?? "All");
  const [airpodsFamily, setAirpodsFamily] = useState("All");
  const [airpodsGeneration, setAirpodsGeneration] = useState("All");
  const [accessoryFamily, setAccessoryFamily] = useState("All");
  const dynamicMacbookGenerationOptions = useMemo(() => getMacbookGenerationOptions(activeProducts), [activeProducts]);
  const copy = categoryCopy[categorySlug];
  const products = activeProducts
    .filter((product) => productMatchesCategorySlug(product, categorySlug))
    .filter((product) => ["iphones", "ipads", "apple-watch", "macbooks", "airpods", "accessories"].includes(categorySlug) || !isProductUnavailable(product))
    .filter((product) => categorySlug !== "iphones" || generation === "All" || getIphoneGeneration(product) === generation)
    .filter((product) => categorySlug !== "ipads" || ipadFamily === "All" || getIpadFamily(product) === ipadFamily)
    .filter((product) => categorySlug !== "apple-watch" || watchFamily === "All" || getWatchFamily(product) === watchFamily)
    .filter((product) => categorySlug !== "macbooks" || macbookFamily === "All" || getMacbookFamily(product) === macbookFamily)
    .filter((product) => categorySlug !== "macbooks" || macbookGeneration === "All" || getMacbookGeneration(product) === macbookGeneration)
    .filter((product) => categorySlug !== "airpods" || airpodsFamily === "All" || getAirpodsFamily(product) === airpodsFamily)
    .filter((product) => categorySlug !== "airpods" || airpodsGeneration === "All" || getAirpodsGeneration(product) === airpodsGeneration)
    .filter((product) => categorySlug !== "accessories" || accessoryFamily === "All" || getAccessoryFamily(product) === accessoryFamily)
    .sort(categorySlug === "iphones" ? compareIphonesNewest : categorySlug === "ipads" ? compareIpadsNewest : categorySlug === "apple-watch" ? compareWatchesNewest : categorySlug === "macbooks" ? compareMacbooksNewest : categorySlug === "airpods" ? compareAirpodsNewest : () => 0);

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
    <div className={usesWhiteCatalogue ? "catalogue-white-page" : undefined}>
      <SEO title={`${copy.eyebrow} in Ghana`} description={`${copy.description} Buy & Sell GH confirms availability, price and delivery details before payment.`} />
      <section className="category-page-hero">
        <div>
          <p className="eyebrow-dark">{copy.eyebrow}</p>
          <h1>{copy.title}</h1>
          <p>{copy.description}</p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link className="btn-primary" to="/shop">Search Store <ArrowRight size={18} /></Link>
            <Link className="btn-secondary" to="/pre-order">Pre-Order a Device</Link>
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
          <p className="eyebrow-dark">{products.length} {["iphones", "ipads", "apple-watch", "macbooks", "airpods", "accessories"].includes(categorySlug) ? "products" : "available"}</p>
          <h2>{copy.eyebrow}</h2>
          <p>{["iphones", "ipads", "apple-watch", "macbooks", "airpods", "accessories"].includes(categorySlug) ? "Browse every listed product. Items awaiting confirmed inventory remain enquiry-only." : "Only matching products are shown here. Sold or unavailable products are excluded from this selling section."}</p>
        </div>
        {categorySlug === "iphones" && (
          <label className="choice-label mb-6 max-w-xs">Generation
            <select value={generation} onChange={(event) => setGeneration(event.target.value)}>
              <option>All</option>
              {iphoneGenerationOptions.map((item) => <option key={item}>{item}</option>)}
            </select>
          </label>
        )}
        {categorySlug === "ipads" && (
          <label className="choice-label mb-6 max-w-xs">iPad family
            <select value={ipadFamily} onChange={(event) => setIpadFamily(event.target.value)}>
              <option>All</option>
              {ipadFamilyOptions.map((item) => <option key={item}>{item}</option>)}
            </select>
          </label>
        )}
        {categorySlug === "apple-watch" && (
          <label className="choice-label mb-6 max-w-xs">Apple Watch family
            <select value={watchFamily} onChange={(event) => setWatchFamily(event.target.value)}>
              <option>All</option>
              {watchFamilyOptions.map((item) => <option key={item}>{item}</option>)}
            </select>
          </label>
        )}
        {categorySlug === "macbooks" && (
          <div className="mb-6 grid max-w-2xl gap-4 sm:grid-cols-2">
            <label className="choice-label">MacBook family
              <select value={macbookFamily} onChange={(event) => setMacbookFamily(event.target.value)}>
                <option>All</option>
                {macbookFamilyOptions.map((item) => <option key={item}>{item}</option>)}
              </select>
            </label>
            <label className="choice-label">Chip / Generation
              <select value={macbookGeneration} onChange={(event) => setMacbookGeneration(event.target.value)}>
                <option>All</option>
                {dynamicMacbookGenerationOptions.map((item) => <option key={item}>{item}</option>)}
              </select>
            </label>
          </div>
        )}
        {categorySlug === "airpods" && (
          <div className="mb-6 grid max-w-2xl gap-4 sm:grid-cols-2">
            <label className="choice-label">AirPods family
              <select value={airpodsFamily} onChange={(event) => setAirpodsFamily(event.target.value)}>
                <option>All</option>
                {airpodsFamilyOptions.map((item) => <option key={item}>{item}</option>)}
              </select>
            </label>
            <label className="choice-label">Model / Generation
              <select value={airpodsGeneration} onChange={(event) => setAirpodsGeneration(event.target.value)}>
                <option>All</option>
                {airpodsGenerationOptions.map((item) => <option key={item}>{item}</option>)}
              </select>
            </label>
          </div>
        )}
        {categorySlug === "accessories" && (
          <label className="choice-label mb-6 max-w-xs">Accessory family
            <select value={accessoryFamily} onChange={(event) => setAccessoryFamily(event.target.value)}>
              <option>All</option>
              {accessoryFamilyOptions.map((item) => <option key={item}>{item}</option>)}
            </select>
          </label>
        )}
        {loading ? (
          <div className="rounded-lg border border-black/7 bg-white p-8 text-center font-black text-ink/70">Loading products...</div>
        ) : error ? (
          <div className="rounded-lg border border-black/7 bg-white p-8 text-center">
            <p className="font-black text-ink">Catalogue is temporarily unavailable.</p>
            <button className="btn-secondary mt-4" type="button" onClick={() => void refreshProducts()}>Retry</button>
          </div>
        ) : (
          <ProductGrid products={products} imageVariant={usesWhiteCatalogue ? "catalogue" : "default"} />
        )}
      </section>
    </div>
  );
}
