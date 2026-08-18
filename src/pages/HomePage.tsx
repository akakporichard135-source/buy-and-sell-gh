import {
  ArrowRight,
  Cable,
  CheckCircle2,
  CreditCard,
  Headphones,
  Laptop,
  MapPin,
  PackageCheck,
  ShieldCheck,
  Tablet,
  Truck,
  Watch,
  Smartphone,
} from "lucide-react";
import { Link } from "react-router-dom";
import { FAQList } from "../components/FAQList";
import { FormField } from "../components/FormField";
import { ProductCard } from "../components/ProductCard";
import { SEO } from "../components/SEO";
import { SuccessForm } from "../components/SuccessForm";
import { WhatsAppButton } from "../components/WhatsAppButton";
import { useProductCatalog } from "../catalog/ProductCatalogContext";
import accessoriesCategory from "../assets/categories/accessories-premium.webp";
import iphonesCategory from "../assets/categories/iphones-premium.webp";
import macBooksCategory from "../assets/categories/macbooks-premium.webp";
import tradeInUpgradePremium from "../assets/banners/trade-in-upgrade-premium.webp";
import heroCinematic from "../assets/hero/hero-cinematic-ecosystem-17-16-v4.webp";
import heroCinematicMobile from "../assets/hero/hero-cinematic-ecosystem-mobile-17-16-v4.webp";
import airPodsCategory from "../assets/products/airpods-pro-premium.webp";
import appleWatchCategory from "../assets/products/apple-watch-premium.webp";
import ipadCategory from "../assets/products/ipad-pro-premium.webp";
import { business } from "../config/business";
import { promotions } from "../data/promotions";
import { categorySlugs } from "../utils/productPresentation";

const trust = [
  { label: "100% Original Devices", description: "Carefully sourced and inspected.", icon: ShieldCheck },
  { label: "Trusted Deals", description: "Clear prices and honest descriptions.", icon: CheckCircle2 },
  { label: "Device Inspection", description: "Check your device before purchase.", icon: PackageCheck },
  { label: "Payment Confirmation", description: "Payment instructions confirmed after review.", icon: CreditCard },
  { label: "Delivery Available", description: "Delivery and pickup in Accra.", icon: Truck },
  { label: "Customer Support", description: "Help before and after your purchase.", icon: Headphones },
];

const categoryIcons = {
  iPhones: Smartphone,
  iPads: Tablet,
  "Apple Watches": Watch,
  AirPods: Headphones,
  MacBooks: Laptop,
  Accessories: Cable,
};

const categoryVisuals = {
  iPhones: iphonesCategory,
  iPads: ipadCategory,
  "Apple Watches": appleWatchCategory,
  AirPods: airPodsCategory,
  MacBooks: macBooksCategory,
  Accessories: accessoriesCategory,
};

const homepageCategories = ["iPhones", "iPads", "Apple Watches", "AirPods", "MacBooks", "Accessories"] as const;
const usedConditions = new Set(["UK Used", "Excellent", "Very Good"]);

export function HomePage() {
  const { activeProducts, loading: catalogueLoading } = useProductCatalog();
  const activePromotions = promotions.filter((promotion) => promotion.isActive);
  const usedProducts = activeProducts.filter((product) => usedConditions.has(product.condition));

  return (
    <>
      <SEO title="Original iPhones and Gadgets in Accra" description="Buy original iPhones, iPads and Apple gadgets in Accra from Buy & Sell GH. Shop, trade in, pre-order unavailable devices and contact through WhatsApp." />
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
              Shop original iPhones, iPads and Apple gadgets with confidence. Buy, sell, swap or pre-order an unavailable device from a trusted gadget shop in Accra.
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
      <section className="section home-section category-section">
        <div className="section-heading">
          <p className="eyebrow-dark">Shop by category</p>
          <h2>Find the right device faster</h2>
        </div>
        <div className="category-grid category-grid-desktop grid gap-4">
          {homepageCategories.map((category) => {
            const Icon = categoryIcons[category];
            return (
              <Link key={category} className="category-card category-card-rich" to={`/${categorySlugs[category]}`}>
                <span className="category-media" aria-hidden="true">
                  <img src={categoryVisuals[category]} alt="" loading="lazy" decoding="async" />
                </span>
                <span className="category-content">
                  <span className="category-icon"><Icon size={25} /></span>
                  <span className="category-label-row">
                    <span className="category-name">{category}</span>
                    <ArrowRight className="category-arrow" size={18} />
                  </span>
                </span>
              </Link>
            );
          })}
        </div>
        <div className="category-grid category-grid-mobile grid gap-4">
          {homepageCategories.map((category) => {
            const Icon = categoryIcons[category];
            return (
              <Link key={category} className="category-card category-card-rich" to={`/${categorySlugs[category]}`}>
                <span className="category-media" aria-hidden="true">
                  <img src={categoryVisuals[category]} alt="" loading="lazy" decoding="async" />
                </span>
                <span className="category-content">
                  <span className="category-icon"><Icon size={25} /></span>
                  <span className="category-label-row">
                    <span className="category-name">{category}</span>
                    <ArrowRight className="category-arrow" size={18} />
                  </span>
                </span>
              </Link>
            );
          })}
        </div>
        <div className="mt-5 flex justify-center md:hidden">
          <Link className="btn-secondary" to="/shop">View All Categories <ArrowRight size={17} /></Link>
        </div>
      </section>

      <section className="section home-section used-devices-section" aria-labelledby="used-devices-title">
        <div className="used-devices-heading">
          <div>
            <p className="eyebrow-dark">Used devices</p>
            <h2 id="used-devices-title">Inspected devices ready for another chapter</h2>
            <p>Browse current UK Used, Excellent and Very Good inventory managed by Buy & Sell GH.</p>
          </div>
        </div>
        {catalogueLoading ? (
          <div className="used-devices-empty">Checking current used inventory...</div>
        ) : usedProducts.length > 0 ? (
          <div className="used-devices-carousel" aria-label="Used devices">
            {usedProducts.map((product) => <ProductCard key={product.id} product={product} variant="compact" />)}
          </div>
        ) : (
          <div className="used-devices-empty">
            <strong>No used devices available right now.</strong>
            <span>Check back soon or pre-order a device on WhatsApp.</span>
            <WhatsAppButton intent="request">Pre-Order on WhatsApp</WhatsAppButton>
          </div>
        )}
      </section>

      <section className="section home-section home-upgrade-grid grid gap-8">
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
          <div className="trade-content">
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

      <section className="section home-section home-desktop-device-form grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
        <div>
          <p className="eyebrow-dark">Pre-Order</p>
          <h2 className="title-md">Can't Find the Device You Want?</h2>
          <p className="mt-4 leading-8 text-ink/70">Use this form when the device you want is not currently available. Tell us the model, storage, colour, condition and budget so we can help source it.</p>
        </div>
        <SuccessForm buttonLabel="Prepare Pre-Order" successIntent="request">
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
          <p className="eyebrow">Pre-Order</p>
          <h2>Can't Find the Device You Want?</h2>
          <p>Use this when the device you want is not currently available. Tell us the model, storage, colour and budget so we can help source it.</p>
          <Link className="btn-primary mt-5 bg-gold text-black hover:bg-gold-light" to="/pre-order">Pre-Order a Device</Link>
        </div>
      </section>

      <section className="section home-section grid gap-6 lg:grid-cols-2">
        <div className="social-band">
          <p className="eyebrow">Social</p>
          <h2>Follow {business.username}</h2>
          <p>See fresh arrivals, device updates, available deals and customer content from Buy & Sell GH.</p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <a className="btn-glass" href={business.social.tiktok} target="_blank" rel="noopener noreferrer">Follow on TikTok</a>
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

function HeroDeviceShowcase() {
  return (
    <div className="hero-device-showcase" aria-label="Premium iPhone 17 Pro Max, iPhone 16 Pro Max, MacBook, Apple Watch and AirPods studio composition">
      <div className="hero-scene-glow" aria-hidden="true" />
      <picture className="hero-showcase-picture">
        <source media="(max-width: 640px)" srcSet={heroCinematicMobile} />
        <img
          className="hero-showcase-image"
          src={heroCinematic}
          alt="iPhone 17 Pro Max and iPhone 16 Pro Max with MacBook, Apple Watch and AirPods in a black and gold studio"
          loading="eager"
          decoding="async"
          fetchPriority="high"
        />
      </picture>
      <div className="hero-light-sweep" aria-hidden="true" />
      <div className="showcase-label">Phones | iPads | MacBooks | Watch | AirPods</div>
    </div>
  );
}
