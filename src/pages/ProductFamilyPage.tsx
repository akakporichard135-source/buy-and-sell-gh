import { ArrowRight, Check, CircleHelp, MessageCircle, Scale } from "lucide-react";
import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useProductCatalog } from "../catalog/ProductCatalogContext";
import {
  familyMatchesProduct,
  productBuyPath,
  productFamilies,
  productStoryPath,
  type ProductFamilyKey,
} from "../catalog/productExperience";
import { isProductPurchasable } from "../catalog/productCatalog";
import { SEO } from "../components/SEO";
import type { Product } from "../types/product";
import { formatGhs } from "../utils/format";
import {
  compareAirpodsNewest,
  compareIphonesNewest,
  compareIpadsNewest,
  compareMacbooksNewest,
  compareWatchesNewest,
} from "../utils/productPresentation";
import { resolveProductImage } from "../utils/productImages";
import "../styles/product-experience.css";

export function ProductFamilyPage({ family }: { family: ProductFamilyKey }) {
  const definition = productFamilies[family];
  const { activeProducts, loading, error, refreshProducts } = useProductCatalog();
  const products = useMemo(
    () => activeProducts.filter((product) => familyMatchesProduct(product, family)).sort((left, right) => compareForFamily(family, left, right)),
    [activeProducts, family],
  );
  const comparisonProducts = products.slice(0, 4);

  return (
    <div className={`product-family-page product-family-${family}`}>
      <SEO
        title={`${definition.label} | Explore the Buy & Sell GH Store`}
        description={`${definition.description} Browse real Store listings and keep marketplace listings separate.`}
      />
      <FamilyLocalNav family={family} showCompare={comparisonProducts.length > 1} />

      <section className={`family-hero family-hero-${definition.heroTone}`} id="overview">
        <div className="family-hero-copy">
          <p>{definition.eyebrow}</p>
          <h1>{definition.title}</h1>
          <span>{definition.description}</span>
          <div className="experience-actions">
            <Link className="experience-button experience-button-primary" to={productStoryPath(family, definition.featuredStorySlug)}>
              Explore {definition.featuredStoryName}
            </Link>
            <Link className="experience-button experience-button-secondary" to={productBuyPath(family, definition.featuredStorySlug)}>
              View pricing
            </Link>
          </div>
        </div>
        <div className="family-hero-media">
          <span aria-hidden="true" />
          <img src={definition.heroMedia} alt={definition.heroAlt} fetchPriority="high" decoding="async" />
        </div>
      </section>

      <section className="family-lineup-section" id="lineup">
        <div className="experience-heading">
          <p>Explore the lineup</p>
          <h2>Choose from real Store listings.</h2>
          <span>Product details, images and availability come from the Buy & Sell GH catalogue. Enquiry-only products are labelled clearly.</span>
        </div>

        {loading ? (
          <FamilyStatus>Loading the current lineup...</FamilyStatus>
        ) : error ? (
          <FamilyStatus>
            <strong>The Store catalogue is temporarily unavailable.</strong>
            <button className="experience-button experience-button-secondary" type="button" onClick={() => void refreshProducts()}>Retry</button>
          </FamilyStatus>
        ) : products.length ? (
          <div className="family-lineup-grid">
            {products.map((product) => <FamilyProduct key={product.id} family={family} product={product} />)}
          </div>
        ) : (
          <FamilyStatus>
            <strong>No confirmed {definition.label} listings are published right now.</strong>
            <span>Use the enquiry flow and the team will confirm what can be sourced.</span>
            <Link className="experience-button experience-button-primary" to={`/pre-order?model=${encodeURIComponent(definition.featuredStoryName)}`}>Request a device</Link>
          </FamilyStatus>
        )}
      </section>

      {comparisonProducts.length > 1 && (
        <section className="family-compare-section" id="compare">
          <div className="experience-heading experience-heading-light">
            <p><Scale size={17} aria-hidden="true" /> Compare</p>
            <h2>See the differences that are actually listed.</h2>
            <span>Only catalogue fields supplied for these products are compared.</span>
          </div>
          <div className="family-compare-scroll" tabIndex={0} aria-label={`Compare ${definition.label} products`}>
            <table>
              <thead>
                <tr>
                  <th scope="col">Details</th>
                  {comparisonProducts.map((product) => <th scope="col" key={product.id}>{product.name}</th>)}
                </tr>
              </thead>
              <tbody>
                <ComparisonRow label="Price" products={comparisonProducts} value={(product) => product.priceOnRequest || product.price <= 0 ? "Contact for price" : formatGhs(product.price)} />
                <ComparisonRow label="Condition" products={comparisonProducts} value={(product) => product.condition} />
                <ComparisonRow label="Configuration" products={comparisonProducts} value={(product) => product.storage.join(", ") || "Confirm with team"} />
                <ComparisonRow label="Availability" products={comparisonProducts} value={(product) => isProductPurchasable(product) ? product.stockStatus : "Enquiry only"} />
              </tbody>
            </table>
          </div>
        </section>
      )}

      <section className="family-support-section" id="support">
        <div>
          <p>Buying support</p>
          <h2>Choose with a little more confidence.</h2>
          <span>We can help compare listed models, confirm availability and arrange pickup or supported delivery.</span>
        </div>
        <ul>
          <li><Check aria-hidden="true" /> Real catalogue information</li>
          <li><Check aria-hidden="true" /> Availability confirmed before payment</li>
          <li><Check aria-hidden="true" /> Local support in Accra</li>
        </ul>
        <div className="experience-actions">
          <Link className="experience-button experience-button-primary" to="/contact"><CircleHelp size={17} /> Ask for help</Link>
          <a className="experience-button experience-button-secondary" href="https://wa.me/233244182149" target="_blank" rel="noopener noreferrer"><MessageCircle size={17} /> WhatsApp</a>
        </div>
      </section>
    </div>
  );
}

function FamilyLocalNav({ family, showCompare }: { family: ProductFamilyKey; showCompare: boolean }) {
  const definition = productFamilies[family];
  return (
    <nav className="product-local-nav" aria-label={`${definition.label} navigation`}>
      <Link className="product-local-title" to={definition.path}>{definition.label}</Link>
      <div>
        <a href="#overview">Overview</a>
        <a href="#lineup">Lineup</a>
        {showCompare && <a href="#compare">Compare</a>}
        <a href="#support">Support</a>
        <Link className="product-local-buy" to={productBuyPath(family, definition.featuredStorySlug)}>Buy</Link>
      </div>
    </nav>
  );
}

function FamilyProduct({ family, product }: { family: ProductFamilyKey; product: Product }) {
  const image = resolveProductImage(product);
  const purchasable = isProductPurchasable(product);
  return (
    <article className="family-product">
      <div className="family-product-image">
        {image ? <img src={image.src} alt={image.alt} loading="lazy" decoding="async" /> : <span>Product image pending</span>}
      </div>
      <div className="family-product-copy">
        <p>{purchasable ? product.stockStatus : "Available for enquiry"}</p>
        <h3>{product.name}</h3>
        <span>{product.shortDescription || product.description}</span>
        <strong>{product.priceOnRequest || product.price <= 0 ? "Contact for price" : `From ${formatGhs(product.price)}`}</strong>
        <div className="experience-actions">
          <Link className="experience-button experience-button-primary" to={productStoryPath(family, product.slug)}>Learn more</Link>
          <Link className="experience-button experience-button-secondary" to={productBuyPath(family, product.slug)}>{purchasable ? "Buy" : "View pricing"}</Link>
        </div>
      </div>
    </article>
  );
}

function ComparisonRow({ label, products, value }: { label: string; products: Product[]; value: (product: Product) => string }) {
  return (
    <tr>
      <th scope="row">{label}</th>
      {products.map((product) => <td key={product.id}>{value(product)}</td>)}
    </tr>
  );
}

function FamilyStatus({ children }: { children: React.ReactNode }) {
  return <div className="family-status">{children}</div>;
}

function compareForFamily(family: ProductFamilyKey, left: Product, right: Product) {
  if (family === "iphone") return compareIphonesNewest(left, right);
  if (family === "ipad") return compareIpadsNewest(left, right);
  if (family === "mac") return compareMacbooksNewest(left, right);
  if (family === "watch") return compareWatchesNewest(left, right);
  if (family === "airpods") return compareAirpodsNewest(left, right);
  return left.name.localeCompare(right.name);
}
