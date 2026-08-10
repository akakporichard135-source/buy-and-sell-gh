import {
  ArrowRight,
  Cable,
  CheckCircle2,
  CreditCard,
  Headphones,
  Laptop,
  MapPin,
  PackageCheck,
  RefreshCcw,
  ShieldCheck,
  Sparkles,
  Tablet,
  Truck,
  Watch,
  Smartphone,
} from "lucide-react";
import { Link } from "react-router-dom";
import { FAQList } from "../components/FAQList";
import { FormField } from "../components/FormField";
import { ProductCard } from "../components/ProductCard";
import { ProductGrid } from "../components/ProductGrid";
import { SEO } from "../components/SEO";
import { SuccessForm } from "../components/SuccessForm";
import { WhatsAppButton } from "../components/WhatsAppButton";
import { useProductCatalog } from "../catalog/ProductCatalogContext";
import { categories, isProductUnavailable } from "../catalog/productCatalog";
import accessoriesCategory from "../assets/categories/accessories-premium.webp";
import brandNewDevicesCategory from "../assets/categories/brand-new-devices-premium.webp";
import iphonesCategory from "../assets/categories/iphones-premium.webp";
import macBooksCategory from "../assets/categories/macbooks-premium.webp";
import ukUsedDevicesCategory from "../assets/categories/uk-used-devices-premium.webp";
import tradeInUpgradePremium from "../assets/banners/trade-in-upgrade-premium.webp";
import heroPremium from "../assets/hero/hero-premium-v2.webp";
import airPodsCategory from "../assets/products/airpods-pro-premium.webp";
import appleWatchCategory from "../assets/products/apple-watch-premium.webp";
import ipadCategory from "../assets/products/ipad-pro-premium.webp";
import { business } from "../config/business";
import { promotions } from "../data/promotions";
import type { Product } from "../types/product";
import { categorySlugs } from "../utils/productPresentation";
import { intentWhatsAppUrl } from "../utils/whatsapp";

const trust = [
  { label: "100% Original Devices", description: "Carefully sourced and inspected.", icon: ShieldCheck },
  { label: "Trusted Deals", description: "Clear prices and honest descriptions.", icon: CheckCircle2 },
  { label: "Device Inspection", description: "Check your device before purchase.", icon: PackageCheck },
  { label: "Secure Payments", description: "Safe and convenient payment options.", icon: CreditCard },
  { label: "Delivery Available", description: "Delivery and pickup in Accra.", icon: Truck },
  { label: "Customer Support", description: "Help before and after your purchase.", icon: Headphones },
];

const testimonials = [
  "The device options were clearly explained, and the buying process was simple.",
  "I received helpful guidance when choosing the right iPhone for my budget.",
  "The phone condition and features were explained before purchase.",
];

const categoryIcons = {
  iPhones: Smartphone,
  iPads: Tablet,
  "Apple Watches": Watch,
  AirPods: Headphones,
  MacBooks: Laptop,
  Accessories: Cable,
  "UK Used Devices": RefreshCcw,
  "Brand New Devices": Sparkles,
};

const categoryVisuals = {
  iPhones: iphonesCategory,
  iPads: ipadCategory,
  "Apple Watches": appleWatchCategory,
  AirPods: airPodsCategory,
  MacBooks: macBooksCategory,
  Accessories: accessoriesCategory,
  "UK Used Devices": ukUsedDevicesCategory,
  "Brand New Devices": brandNewDevicesCategory,
};

export function HomePage() {
  const { activeProducts: products } = useProductCatalog();
  const sellableProducts = products.filter((product) => !isProductUnavailable(product));
  const newArrivals = sellableProducts.filter((product) => product.newArrival || product.isNewArrival);
  const popularChoices = sellableProducts.filter((product) => product.popular || product.isPopular);
  const activePromotions = promotions.filter((promotion) => promotion.isActive);
  const desktopNewArrivals = newArrivals.slice(0, 4);
  const mobileNewArrivals = newArrivals.slice(0, 3);
  const newArrivalIds = new Set(mobileNewArrivals.map((product) => product.id));
  const desktopPopularChoices = popularChoices.filter((product) => !desktopNewArrivals.some((arrival) => arrival.id === product.id)).slice(0, 4);
  const mobilePopularChoices = popularChoices.filter((product) => !newArrivalIds.has(product.id)).slice(0, 3);
  const usedDesktopIds = new Set([...desktopNewArrivals, ...desktopPopularChoices].map((product) => product.id));
  const availableDevices = sellableProducts.filter((product) => !usedDesktopIds.has(product.id)).slice(0, 4);
  const featuredProduct = sellableProducts.find((product) => product.featured || product.isFeatured) ?? sellableProducts[0];
  const mobileCategories = categories;

  return (
    <>
      <SEO title="Original iPhones and Gadgets in Accra" description="Buy original iPhones, iPads and Apple gadgets in Accra from Buy & Sell GH. Shop, trade in, request devices and contact through WhatsApp." />
      <section className="bg-ink px-4 py-2.5 text-center text-xs font-black uppercase text-gold sm:text-sm">
        100% Original Devices | Trusted Deals | Delivery Available in Accra
      </section>
      <section className="hero-shell">
        <div className="home-container home-hero-grid grid items-center gap-10 py-14 lg:grid-cols-[0.96fr_1.04fr] lg:py-20">
          <div>
            <p className="eyebrow">Buy & Sell GH | Accra Gadget Shop</p>
            <h1 className="hero-title mt-4 max-w-4xl font-black text-white">
              <span>Original iPhones.</span>
              <span>Trusted Deals.</span>
              <span>Better Prices.</span>
            </h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-white/80 sm:text-xl">
              Shop original iPhones, iPads and Apple gadgets with confidence. Buy, sell, swap or request the device you want from a trusted gadget shop in Accra.
            </p>
            <div className="hero-actions mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link className="btn-primary bg-gold text-black hover:bg-gold-light" to="/shop">
                Shop Devices <ArrowRight size={18} />
              </Link>
              <WhatsAppButton>Chat on WhatsApp</WhatsAppButton>
            </div>
            <Link className="hero-trade-link mt-4 inline-flex text-sm font-black text-gold-light underline-offset-4 hover:underline" to="/sell-or-trade">Sell or Trade Your Phone</Link>
            <p className="mt-6 text-sm font-black uppercase text-white/72">100% Original Devices | Device Inspection | Delivery Available</p>
          </div>
          <HeroDeviceShowcase />
        </div>
      </section>
      <section className="section home-section">
        <div className="trust-grid grid gap-3 lg:grid-cols-3 xl:grid-cols-3">
          {trust.map(({ label, description, icon: Icon }) => (
            <div key={label} className="trust-card trust-card-premium">
              <Icon size={24} />
              <div>
                <span>{label}</span>
                <p>{description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
      {activePromotions.length > 0 && (
        <section className="section home-section home-desktop-detail">
          <div className="grid gap-5">
            {activePromotions.map((promotion) => (
              <article className="promo-banner" key={promotion.id}>
                <div>
                  <p className="eyebrow-dark">Promotion</p>
                  <h2>{promotion.title}</h2>
                  <p>{promotion.description}</p>
                  <Link className="btn-primary mt-5" to={promotion.buttonLink}>{promotion.buttonText}</Link>
                </div>
                <img src={promotion.bannerImage} alt={`${promotion.title} banner`} loading="lazy" />
              </article>
            ))}
          </div>
        </section>
      )}
      <section className="section home-section">
        <div className="section-heading">
          <p className="eyebrow-dark">Recently added</p>
          <h2>New Arrivals</h2>
          <p>Fresh devices and accessories recently added to Buy & Sell GH.</p>
        </div>
        <ProductGrid products={desktopNewArrivals} className="home-desktop-products" />
        <HomeProductCarousel products={mobileNewArrivals} />
        <div className="home-product-link mt-8 flex justify-center">
          <Link className="btn-primary" to="/shop?newArrival=true">View All New Arrivals <ArrowRight size={18} /></Link>
        </div>
      </section>

      <section className="section home-section">
        <div className="section-heading">
          <p className="eyebrow-dark">Shop by category</p>
          <h2>Find the right device faster</h2>
        </div>
        <div className="category-grid category-grid-desktop grid gap-4 lg:grid-cols-4">
          {categories.map((category) => {
            const Icon = categoryIcons[category];
            return (
              <Link key={category} className="category-card category-card-rich" to={`/${categorySlugs[category]}`}>
                <span className="category-media" aria-hidden="true">
                  <img src={categoryVisuals[category]} alt="" loading="lazy" decoding="async" />
                </span>
                <span className="category-content">
                  <span className="category-icon"><Icon size={25} /></span>
                  <span className="category-name">{category}</span>
                </span>
                <ArrowRight className="category-arrow" size={18} />
              </Link>
            );
          })}
        </div>
        <div className="category-grid category-grid-mobile grid gap-4">
          {mobileCategories.map((category) => {
            const Icon = categoryIcons[category];
            return (
              <Link key={category} className="category-card category-card-rich" to={`/${categorySlugs[category]}`}>
                <span className="category-media" aria-hidden="true">
                  <img src={categoryVisuals[category]} alt="" loading="lazy" decoding="async" />
                </span>
                <span className="category-content">
                  <span className="category-icon"><Icon size={25} /></span>
                  <span className="category-name">{category}</span>
                </span>
                <ArrowRight className="category-arrow" size={18} />
              </Link>
            );
          })}
        </div>
        <div className="mt-5 flex justify-center md:hidden">
          <Link className="btn-secondary" to="/shop">View All Categories <ArrowRight size={17} /></Link>
        </div>
      </section>

      <section className="section home-section grid gap-8 lg:grid-cols-2">
        <div className="panel-dark home-desktop-detail">
          <p className="eyebrow">Why choose Buy & Sell GH</p>
          <h2>Trusted Help for Your Next Upgrade</h2>
          <p>
            Choosing the right device should be simple. We provide clear product information, honest condition details,
            device inspection and helpful support before you buy.
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {[
              "Original inspected devices",
              "Honest condition descriptions",
              "Trade-in options",
              "Delivery and pickup",
              "Support before and after purchase",
              "Competitive pricing",
            ].map((item) => (
              <span className="mini-check" key={item}><CheckCircle2 size={17} /> {item}</span>
            ))}
          </div>
        </div>
        <div className="panel-gold trade-panel">
          <div>
            <p className="eyebrow-dark">Sell or trade</p>
            <h2>Turn Your Current Phone Into Your Next Upgrade</h2>
            <p>Sell or swap your current phone and use its value toward your next device. Submit your details and receive guidance before inspection.</p>
            <Link className="btn-primary mt-6" to="/sell-or-trade">Start a Trade-In</Link>
          </div>
          <div className="trade-visual" aria-hidden="true">
            <img src={tradeInUpgradePremium} alt="" loading="lazy" decoding="async" />
          </div>
        </div>
      </section>

      <section className="section home-section">
        <div className="section-heading">
          <p className="eyebrow-dark">Frequently requested</p>
          <h2>Popular Choices</h2>
          <p>Devices customers frequently ask about.</p>
        </div>
        <ProductGrid products={desktopPopularChoices} className="home-desktop-products" />
        <HomeProductCarousel products={mobilePopularChoices} />
        <div className="home-product-link mt-8 flex justify-center">
          <Link className="btn-primary" to="/shop?popular=true">View All Popular Choices <ArrowRight size={18} /></Link>
        </div>
      </section>

      <section className="section home-section home-desktop-detail">
        <div className="section-heading">
          <p className="eyebrow-dark">Available now</p>
          <h2>Available Devices</h2>
          <p>Explore selected iPhones and Apple gadgets currently available from Buy & Sell GH.</p>
        </div>
        <ProductGrid products={availableDevices} />
        <div className="home-product-link mt-8 flex justify-center">
          <Link className="btn-primary" to="/shop">View All Devices <ArrowRight size={18} /></Link>
        </div>
      </section>

      {featuredProduct && (
        <section className="section home-section featured-product-section">
          <div>
            <p className="eyebrow-dark">Featured product</p>
            <h2 className="title-md">{featuredProduct.name}</h2>
            <p className="mt-4 leading-8 text-ink/70">{featuredProduct.shortDescription ?? featuredProduct.description}</p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link className="btn-primary" to={`/product/${featuredProduct.slug}`}>View Details <ArrowRight size={18} /></Link>
              <Link className="btn-secondary" to="/shop">Browse Store</Link>
            </div>
          </div>
          <ProductCard product={featuredProduct} />
        </section>
      )}

      <section className="section home-section home-desktop-device-form grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
        <div>
          <p className="eyebrow-dark">Device request</p>
          <h2 className="title-md">Can't Find the Device You Want?</h2>
          <p className="mt-4 leading-8 text-ink/70">Tell us the model, storage, colour, condition and budget you prefer. We'll help you check availability.</p>
        </div>
        <SuccessForm buttonLabel="Send device request" successActionHref={intentWhatsAppUrl("request")}>
          <FormField label="Customer name" name="name" required />
          <FormField label="Phone number" name="phone" required />
          <FormField label="Device model" name="model" required placeholder="iPhone 15 Pro Max" />
          <FormField label="Storage" name="storage" required options={["128GB", "256GB", "512GB", "1TB"]} />
          <FormField label="Preferred colour" name="color" required />
          <FormField label="Condition" name="condition" required options={["Brand New", "UK Used", "Either"]} />
          <FormField label="Budget" name="budget" required />
          <FormField label="Additional message" name="message" required textarea />
        </SuccessForm>
      </section>
      <section className="section home-section home-mobile-cta">
        <div className="panel-dark">
          <p className="eyebrow">Device request</p>
          <h2>Can't Find the Device You Want?</h2>
          <p>Tell us the model, storage, colour and budget. We'll help you check availability.</p>
          <Link className="btn-primary mt-5 bg-gold text-black hover:bg-gold-light" to="/device-request">Request a Device</Link>
        </div>
      </section>

      <section className="section home-section home-desktop-detail">
        <div className="section-heading">
          <p className="eyebrow-dark">Reviews</p>
          <h2>What Customers Say</h2>
          <p>Real customer experiences will be displayed here as the business collects verified reviews.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {testimonials.map((text) => (
            <article className="review-card" key={text}>
              <p className="text-xs font-black uppercase text-gold-dark">Customer Review</p>
              <p className="mt-4 text-base leading-7 text-ink/72">"{text}"</p>
            </article>
          ))}
        </div>
      </section>
      <section className="section home-section grid gap-6 lg:grid-cols-2">
        <div className="social-band">
          <p className="eyebrow">Social</p>
          <h2>Follow {business.username}</h2>
          <p>See fresh arrivals, device updates, available deals and customer content from Buy & Sell GH.</p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <a className="btn-glass" href={business.social.tiktok} target="_blank" rel="noreferrer">Follow on TikTok</a>
            <WhatsAppButton>Chat on WhatsApp</WhatsAppButton>
          </div>
        </div>
        <div>
          <div className="section-heading items-start text-left">
            <p className="eyebrow-dark">FAQ preview</p>
            <h2>Common questions</h2>
          </div>
          <FAQList limit={4} />
          <Link className="btn-secondary mt-5" to="/faq">View All FAQs</Link>
        </div>
      </section>
      <section className="final-cta home-desktop-detail">
        <div>
          <p className="eyebrow">Next upgrade</p>
          <h2>Ready to Get Your Next Device?</h2>
          <p>Browse available devices, chat with us on WhatsApp, or visit the shop at Dome Pillar 2, Accra.</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link className="btn-primary bg-gold text-black hover:bg-gold-light" to="/shop">Browse Devices</Link>
          <WhatsAppButton>Chat on WhatsApp</WhatsAppButton>
          <Link className="btn-glass" to="/contact"><MapPin size={17} /> Get Directions</Link>
        </div>
      </section>
    </>
  );
}

function HomeProductCarousel({ products }: { products: Product[] }) {
  return (
    <div className="home-mobile-carousel" aria-label="Swipe products">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} variant="compact" />
      ))}
    </div>
  );
}

function HeroDeviceShowcase() {
  return (
    <div className="hero-device-showcase" aria-label="Premium iPhone, AirPods Pro and Apple Watch visual composition">
      <img className="hero-showcase-image" src={heroPremium} alt="Premium iPhone, AirPods Pro and Apple Watch product composition" loading="eager" decoding="async" />
      <div className="showcase-label">Buy & Sell GH</div>
    </div>
  );
}
