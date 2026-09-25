import { ArrowRight, Check, CircleHelp, MessageCircle, Scale } from "lucide-react";
import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useProductCatalog } from "../catalog/ProductCatalogContext";
import { campaignAssets, familyCampaigns } from "../catalog/campaignAssets";
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
  const lineupProducts = products.slice(0, 6);
  const campaigns = familyCampaigns[family];

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

      <section className="family-feature-section" id="stories">
        <div className="experience-heading">
          <p>Get to know {definition.label}</p>
          <h2>Stories that start with the product.</h2>
          <span>Campaign concepts are kept separate from confirmed Store inventory, with availability stated clearly.</span>
        </div>
        <div className={`family-feature-grid family-feature-grid-${campaigns.length}`}>
          {campaigns.map((campaign) => (
            <article className={`family-feature-panel family-feature-${campaign.tone} family-feature-for-${family}`} key={campaign.title}>
              <div className="family-feature-copy">
                <p>{campaign.eyebrow}</p>
                <h3>{campaign.title}</h3>
                <span>{campaign.copy}</span>
                {campaign.availability && <small>{campaign.availability}</small>}
                <div className="experience-actions">
                  <Link className="experience-button experience-button-primary" to={campaign.storyPath}>Learn more</Link>
                  <Link className="experience-button experience-button-secondary" to={campaign.buyPath}>View pricing</Link>
                </div>
              </div>
              <img src={campaign.media.src} alt={campaign.media.alt} loading="lazy" decoding="async" />
            </article>
          ))}
        </div>
      </section>

      {family === "accessories" && <AccessoryBrowse />}

      <section className="family-lineup-section" id="lineup">
        <div className="experience-heading">
          <p>Explore the lineup</p>
          <h2>A considered selection from the Store.</h2>
          <span>These are real catalogue listings. Product details, images and availability come from Store data, and enquiry-only products are labelled clearly.</span>
        </div>

        {loading ? (
          <FamilyStatus>Loading the current lineup...</FamilyStatus>
        ) : error ? (
          <FamilyStatus>
            <strong>The Store catalogue is temporarily unavailable.</strong>
            <button className="experience-button experience-button-secondary" type="button" onClick={() => void refreshProducts()}>Retry</button>
          </FamilyStatus>
        ) : products.length ? (
          <>
            <div className="family-lineup-grid">
              {lineupProducts.map((product) => <FamilyProduct key={product.id} family={family} product={product} />)}
            </div>
            <div className="family-lineup-more">
              <span>Showing {lineupProducts.length} of {products.length} current listings.</span>
              <Link className="experience-button experience-button-secondary" to={`/store?category=${encodeURIComponent(storeCategoryForFamily(family))}`}>View all in Store <ArrowRight size={17} /></Link>
            </div>
          </>
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

      {family !== "accessories" && <FamilyAccessorySpotlight family={family} />}

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
  const campaigns = familyCampaigns[family];
  return (
    <nav className="product-local-nav" aria-label={`${definition.label} navigation`}>
      <Link className="product-local-title" to={definition.path}>{definition.label}</Link>
      <div>
        <a href="#overview">Overview</a>
        {campaigns.slice(0, 2).map((campaign) => (
          <Link to={campaign.storyPath} key={`${campaign.storyPath}-${campaign.title}`}>
            {shortCampaignLabel(campaign.title)}
          </Link>
        ))}
        <a href="#lineup">Lineup</a>
        {showCompare && <a href="#compare">Compare</a>}
        {family !== "accessories" && <Link to="/accessories">Accessories</Link>}
        <Link className="product-local-buy" to={productBuyPath(family, definition.featuredStorySlug)}>Buy</Link>
      </div>
      <details className="product-local-mobile-menu">
        <summary>Explore</summary>
        <div>
          <a href="#overview">Overview</a>
          <a href="#stories">Stories</a>
          <a href="#lineup">Lineup</a>
          {showCompare && <a href="#compare">Compare</a>}
          <a href="#support">Support</a>
        </div>
      </details>
    </nav>
  );
}

function FamilyProduct({ family, product }: { family: ProductFamilyKey; product: Product }) {
  const image = resolveProductImage(product);
  const purchasable = isProductPurchasable(product);
  return (
    <article className="family-product">
      <div className="family-product-image">
        {image ? <img src={image.src} alt={image.alt} loading="lazy" decoding="async" /> : <span>Image coming soon</span>}
      </div>
      <div className="family-product-copy">
        <p>{productAvailabilityLabel(product, purchasable)}</p>
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

function AccessoryBrowse() {
  const productLinks = [
    ["Mac", "Mac Accessories"],
    ["iPhone", "iPhone Accessories"],
    ["iPad", "iPad Accessories"],
    ["Watch", "Watch Accessories"],
    ["AirPods", "Audio Accessories"],
  ];
  const categoryLinks = [
    ["Charging", "Charging & Power"],
    ["Cables", "Cables"],
    ["Cases", "Cases & Protection"],
    ["MagSafe", "Charging & Power"],
    ["Audio", "Audio Accessories"],
    ["Productivity", "Mac Accessories"],
  ];

  return (
    <section className="accessory-browse" aria-labelledby="accessory-browse-title">
      <div className="experience-heading">
        <p>Find the right accessory</p>
        <h2 id="accessory-browse-title">Start with your device. Then the task.</h2>
      </div>
      <div className="accessory-browse-columns">
        <div><h3>Shop by product</h3>{productLinks.map(([label, value]) => <Link to={`/store?category=Accessories&accessoryFamily=${encodeURIComponent(value)}`} key={label}>{label}<ArrowRight size={16} /></Link>)}</div>
        <div><h3>Shop by category</h3>{categoryLinks.map(([label, value]) => <Link to={`/store?category=Accessories&accessoryFamily=${encodeURIComponent(value)}`} key={label}>{label}<ArrowRight size={16} /></Link>)}</div>
      </div>
    </section>
  );
}

function FamilyAccessorySpotlight({ family }: { family: Exclude<ProductFamilyKey, "accessories"> }) {
  const spotlights = {
    iphone: { title: "Charging that keeps the day moving.", copy: "Explore magnetic and USB-C charging options, then confirm compatibility with your exact iPhone.", media: campaignAssets.accessories.magneticCharger },
    mac: { title: "Power for a portable workspace.", copy: "Find Mac charging and connectivity accessories matched to the notebook you use.", media: campaignAssets.accessories.macCharger },
    ipad: { title: "One cable. More ways to work.", copy: "Browse charging and productivity accessories selected around iPad workflows.", media: campaignAssets.accessories.usbC },
    watch: { title: "A cleaner place to recharge.", copy: "Explore multi-device charging options for Watch, iPhone and AirPods.", media: campaignAssets.accessories.chargingStand },
    airpods: { title: "Protect the case you carry everywhere.", copy: "Browse colourful protective cases and current audio accessories.", media: campaignAssets.airpods.cases },
  } as const;
  const spotlight = spotlights[family];
  return (
    <section className="family-accessory-spotlight" id="accessories">
      <div>
        <p>Accessories</p>
        <h2>{spotlight.title}</h2>
        <span>{spotlight.copy}</span>
        <Link className="experience-button experience-button-primary" to={`/store?category=Accessories`}>Explore accessories</Link>
      </div>
      <img src={spotlight.media.src} alt={spotlight.media.alt} loading="lazy" decoding="async" />
    </section>
  );
}

function productAvailabilityLabel(product: Product, purchasable: boolean) {
  if (product.condition === "UK Used") return "UK USED";
  return purchasable ? "IN STOCK" : "AVAILABLE ON REQUEST";
}

function storeCategoryForFamily(family: ProductFamilyKey) {
  if (family === "iphone") return "Phones";
  if (family === "mac") return "Laptops";
  if (family === "ipad") return "Tablets";
  if (family === "watch") return "Watches";
  if (family === "airpods") return "Audio";
  return "Accessories";
}

function shortCampaignLabel(title: string) {
  return title.replace("Apple Watch ", "").replace("iPhone ", "");
}

function compareForFamily(family: ProductFamilyKey, left: Product, right: Product) {
  if (family === "iphone") return compareIphonesNewest(left, right);
  if (family === "ipad") return compareIpadsNewest(left, right);
  if (family === "mac") return compareMacbooksNewest(left, right);
  if (family === "watch") return compareWatchesNewest(left, right);
  if (family === "airpods") return compareAirpodsNewest(left, right);
  return left.name.localeCompare(right.name);
}
