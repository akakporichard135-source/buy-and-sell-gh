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
import { ProductGrid } from "../components/ProductGrid";
import { SEO } from "../components/SEO";
import { SuccessForm } from "../components/SuccessForm";
import { WhatsAppButton } from "../components/WhatsAppButton";
import { business } from "../config/business";
import { categories, products } from "../data/products";
import { promotions } from "../data/promotions";
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

export function HomePage() {
  const featured = products.slice(0, 6);
  const newArrivals = products.filter((product) => product.isNewArrival);
  const popularChoices = products.filter((product) => product.isPopular);
  const activePromotions = promotions.filter((promotion) => promotion.isActive);

  return (
    <>
      <SEO title="Original iPhones and Gadgets in Accra" description="Buy original iPhones, iPads and Apple gadgets in Accra from Buy & Sell GH. Shop, trade in, request devices and contact through WhatsApp." />
      <section className="bg-ink px-4 py-2.5 text-center text-xs font-black uppercase text-gold sm:text-sm">
        100% Original Devices | Trusted Deals | Delivery Available in Accra
      </section>
      <section className="hero-shell">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.02fr_0.98fr] lg:px-8 lg:py-24">
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
            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link className="btn-primary bg-gold text-black hover:bg-gold-light" to="/shop">
                Shop Available Devices <ArrowRight size={18} />
              </Link>
              <WhatsAppButton>Chat on WhatsApp</WhatsAppButton>
              <Link className="btn-glass" to="/sell-or-trade">Sell or Trade Your Phone</Link>
            </div>
            <p className="mt-6 text-sm font-black uppercase text-white/72">100% Original Devices | Device Inspection | Delivery Available</p>
          </div>
          <HeroDeviceShowcase />
        </div>
      </section>
      <section className="section">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-6">
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
        <section className="section">
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
      <section className="section">
        <div className="section-heading">
          <p className="eyebrow-dark">Recently added</p>
          <h2>New Arrivals</h2>
          <p>Fresh devices and accessories recently added to Buy & Sell GH.</p>
        </div>
        <ProductGrid products={newArrivals} />
        <div className="mt-8 flex justify-center">
          <Link className="btn-primary" to="/shop?newArrival=true">View All New Arrivals <ArrowRight size={18} /></Link>
        </div>
      </section>
      <section className="section">
        <div className="section-heading">
          <p className="eyebrow-dark">Frequently requested</p>
          <h2>Popular Choices</h2>
          <p>Devices customers frequently ask about.</p>
        </div>
        <ProductGrid products={popularChoices} />
      </section>
      <section className="section">
        <div className="section-heading">
          <p className="eyebrow-dark">Featured products</p>
          <h2>Available Devices</h2>
          <p>Explore selected iPhones and Apple gadgets currently featured by Buy & Sell GH.</p>
        </div>
        <ProductGrid products={featured} />
        <div className="mt-8 flex justify-center">
          <Link className="btn-primary" to="/shop">View All Devices <ArrowRight size={18} /></Link>
        </div>
      </section>
      <section className="section">
        <div className="section-heading">
          <p className="eyebrow-dark">Shop by category</p>
          <h2>Find the right device faster</h2>
        </div>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {categories.map((category) => {
            const Icon = categoryIcons[category];
            return (
              <Link key={category} className="category-card category-card-rich" to={`/shop?category=${encodeURIComponent(category)}`}>
                <span className="category-icon"><Icon size={25} /></span>
                <span>{category}</span>
                <ArrowRight size={18} />
              </Link>
            );
          })}
        </div>
      </section>
      <section className="section grid gap-8 lg:grid-cols-2">
        <div className="panel-dark">
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
            <p>Sell or swap your current phone and use its value toward your next device. Submit your details and receive guidance before the physical inspection.</p>
            <Link className="btn-primary mt-6" to="/sell-or-trade">Start a Trade-In</Link>
          </div>
          <div className="trade-visual" aria-hidden="true">
            <span />
            <RefreshCcw size={34} />
            <span />
          </div>
        </div>
      </section>
      <section className="section grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
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
      <section className="section">
        <div className="section-heading">
          <p className="eyebrow-dark">Reviews</p>
          <h2>What Customers Say</h2>
          <p>Real customer experiences will be displayed here as the business collects verified reviews.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {testimonials.map((text) => (
            <article className="review-card" key={text}>
              <p className="text-xs font-black uppercase text-gold-dark">Sample Review</p>
              <p className="mt-4 text-base leading-7 text-ink/72">"{text}"</p>
            </article>
          ))}
        </div>
        <p className="mt-5 text-center text-sm font-bold text-ink/55">Sample content. Replace with genuine customer feedback before final launch.</p>
      </section>
      <section className="section grid gap-6 lg:grid-cols-2">
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
          <FAQList />
        </div>
      </section>
      <section className="final-cta">
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
  const iphone16 = products.find((product) => product.slug === "iphone-16-pro-max");
  const iphone15 = products.find((product) => product.slug === "iphone-15-pro-max");
  const watch = products.find((product) => product.slug === "apple-watch");
  const airpods = products.find((product) => product.slug === "airpods-pro");

  return (
    <div className="hero-device-showcase" aria-label="iPhone 16 Pro Max, iPhone 15 Pro Max, AirPods Pro and Apple Watch visual composition">
      {iphone16 && <img className="showcase-product showcase-product-main" src={iphone16.images[0].src} alt={iphone16.images[0].alt} loading="eager" />}
      {iphone15 && <img className="showcase-product showcase-product-secondary" src={iphone15.images[0].src} alt={iphone15.images[0].alt} loading="eager" />}
      {airpods && <img className="showcase-product showcase-product-airpods" src={airpods.images[0].src} alt={airpods.images[0].alt} loading="eager" />}
      {watch && <img className="showcase-product showcase-product-watch" src={watch.images[0].src} alt={watch.images[0].alt} loading="eager" />}
      <div className="showcase-label">Buy & Sell GH</div>
    </div>
  );
}
