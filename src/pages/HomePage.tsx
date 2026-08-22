import { ArrowRight, Banknote, Building2, ChevronRight, MessageCircle, Smartphone } from "lucide-react";
import { useMemo } from "react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { useProductCatalog } from "../catalog/ProductCatalogContext";
import { SEO } from "../components/SEO";
import accessoriesStory from "../assets/categories/accessories-premium.webp";
import preorderStory from "../assets/categories/brand-new-devices-premium.webp";
import audioAccessoriesStory from "../assets/homepage/homepage-audio-accessories-story.jpg";
import visaCardCampaign from "../assets/homepage/homepage-visa-card-single.webp";
import installmentCampaign from "../assets/homepage/owner-installment-payment.jpg";
import referralCampaign from "../assets/homepage/owner-refer-friend.jpg";
import repairsCampaign from "../assets/homepage/owner-repairs.jpg";
import sellCashArtwork from "../assets/homepage/owner-sell-cash.jpg";
import upgradeSaveArtwork from "../assets/homepage/owner-upgrade-save.jpg";
import airpodsProStory from "../assets/products/airpods-pro-3-premium.webp";
import appleWatchStory from "../assets/products/apple-watch-series-11-premium.webp";
import cableStory from "../assets/products/apple-usb-c-charge-cable-premium.webp";
import caseStory from "../assets/products/apple-clear-iphone-case-magsafe-premium.webp";
import chargerStory from "../assets/products/apple-20w-usb-c-power-adapter-premium.webp";
import ipadAirStory from "../assets/products/ipad-air-11-inch-m4-premium.webp";
import ipadProStory from "../assets/products/ipad-pro-13-inch-m5-premium.webp";
import iphone16Story from "../assets/products/iphone-16-pro-max-premium.webp";
import iphone17Story from "../assets/products/iphone-17-pro-max-premium.webp";
import macbookAirStory from "../assets/products/macbook-air-13-inch-m5-premium.webp";
import macbookProStory from "../assets/products/macbook-pro-14-inch-m5-pro-max-premium.webp";
import magsafeStory from "../assets/products/apple-magsafe-charger-premium.webp";
import adapterStory from "../assets/products/apple-35w-dual-usb-c-power-adapter-premium.webp";
import watchAccessoryStory from "../assets/products/apple-watch-fast-charger-usb-c-premium.webp";
import { business } from "../config/business";
import type { Product } from "../types/product";
import { resolveProductImage } from "../utils/productImages";

const whatsappHref = `https://wa.me/${business.whatsapp.primary}`;

type CampaignTheme = "black" | "light" | "warm";

type Campaign = {
  eyebrow: string;
  title: string;
  description: string;
  image: string;
  imageAlt: string;
  theme: CampaignTheme;
  primaryLabel: string;
  primaryTo: string;
  secondaryLabel?: string;
  secondaryTo?: string;
  galleryImages?: { src: string; alt: string }[];
  fallbackImage?: string;
};

const macbookAirCampaign: Campaign = {
  eyebrow: "MacBook Air",
  title: "Supercharged for everything you do.",
  description: "A remarkably capable laptop in a light, travel-ready design.",
  image: macbookAirStory,
  imageAlt: "MacBook Air in a clean warm studio presentation",
  theme: "warm",
  primaryLabel: "Learn more",
  primaryTo: "/macbooks?family=MacBook%20Air",
  secondaryLabel: "Buy",
  secondaryTo: "/shop?category=MacBooks",
};

const ipadAirCampaign: Campaign = {
  eyebrow: "iPad Air",
  title: "Fresh. Powerful. Colourful.",
  description: "Made for work, study, creativity and everything in between.",
  image: ipadAirStory,
  imageAlt: "iPad Air in a layered premium product presentation",
  theme: "light",
  primaryLabel: "Learn more",
  primaryTo: "/ipads?family=iPad%20Air",
  secondaryLabel: "Buy",
  secondaryTo: "/shop?category=iPads",
};

const productTiles: Campaign[] = [
  {
    eyebrow: "MacBook Pro",
    title: "Power for your best work.",
    description: "Serious performance for demanding creative and professional workflows.",
    image: macbookProStory,
    imageAlt: "MacBook Pro in a premium dark studio presentation",
    theme: "black",
    primaryLabel: "Learn more",
    primaryTo: "/macbooks?family=MacBook%20Pro",
    secondaryLabel: "Buy",
    secondaryTo: "/shop?category=MacBooks",
  },
  {
    eyebrow: "Apple Watch",
    title: "Move. Connect. Keep going.",
    description: "A capable everyday companion, right on your wrist.",
    image: appleWatchStory,
    imageAlt: "Apple Watch in a warm premium presentation",
    theme: "warm",
    primaryLabel: "Learn more",
    primaryTo: "/apple-watch",
    secondaryLabel: "Buy",
    secondaryTo: "/shop?category=Apple%20Watches",
  },
  {
    eyebrow: "AirPods Pro",
    title: "Immersive sound. Effortless listening.",
    description: "Premium personal audio for work, travel and everything between.",
    image: airpodsProStory,
    imageAlt: "AirPods Pro in a clean premium product presentation",
    theme: "light",
    primaryLabel: "Learn more",
    primaryTo: "/airpods?family=AirPods%20Pro",
    secondaryLabel: "Buy",
    secondaryTo: "/shop?category=AirPods",
  },
  {
    eyebrow: "iPad Pro",
    title: "Big ideas. Pro power.",
    description: "A premium canvas for advanced creative work.",
    image: ipadProStory,
    imageAlt: "iPad Pro in a premium black studio presentation",
    theme: "black",
    primaryLabel: "Learn more",
    primaryTo: "/ipads?family=iPad%20Pro",
    secondaryLabel: "Buy",
    secondaryTo: "/shop?category=iPads",
  },
];

const accessories = [
  { name: "AirPods", image: airpodsProStory, to: "/airpods" },
  { name: "Cases", image: caseStory, to: "/accessories?family=iPhone%20Accessories" },
  { name: "Chargers", image: chargerStory, to: "/accessories?family=Charging%20%26%20Power" },
  { name: "MagSafe", image: magsafeStory, to: "/accessories?family=iPhone%20Accessories" },
  { name: "Cables", image: cableStory, to: "/accessories?family=Cables" },
  { name: "Watch Accessories", image: watchAccessoryStory, to: "/accessories?family=Watch%20Accessories" },
  { name: "Adapters", image: adapterStory, to: "/accessories?family=Charging%20%26%20Power" },
];

const serviceStories = [
  { label: "Trade In", title: "Upgrade for less.", image: upgradeSaveArtwork, to: "/sell-or-trade", tone: "gold" },
  { label: "Phone Repairs", title: "Let the experts fix it.", image: repairsCampaign, to: "/repairs", tone: "light" },
  { label: "Installment", title: "Own an iPhone today.", image: installmentCampaign, to: "/installment", tone: "black" },
  { label: "Sell Your Device", title: "Turn your old device into cash.", image: sellCashArtwork, to: "/sell-or-trade", tone: "black" },
  { label: "Upgrade & Save", title: "Swap what you have for what comes next.", image: upgradeSaveArtwork, to: "/sell-or-trade", tone: "gold" },
  { label: "Refer a Friend", title: "Good tech is better when shared.", image: referralCampaign, to: "/refer-a-friend", tone: "light" },
  { label: "Pre-Order", title: "Request the exact device you want.", image: preorderStory, to: "/pre-order", tone: "warm" },
  { label: "New Arrivals", title: "See what just landed.", image: iphone17Story, to: "/shop?sort=newest", tone: "black" },
  { label: "Certified Pre-Owned", title: "More value. Clearly graded.", image: iphone16Story, to: "/shop?condition=UK%20Used", tone: "warm" },
  { label: "Delivery", title: "Pickup and delivery, clearly arranged.", image: accessoriesStory, to: "/shopping-information", tone: "light" },
  { label: "Support", title: "Answers when you need them.", image: audioAccessoriesStory, to: "/contact", tone: "black" },
];

export function HomePage() {
  const { activeProducts } = useProductCatalog();
  const latestIphone = useMemo(() => getLatestIphoneLineup(activeProducts), [activeProducts]);

  const latestIphoneCampaign: Campaign = {
    eyebrow: "Latest iPhone",
    title: latestIphone.generationLabel,
    description: latestIphone.variants.some((product) => /\bpro\b/i.test(product.name))
      ? "Pro in every way. Meet the newest iPhone family in our catalogue."
      : "Meet the newest iPhone family in our catalogue.",
    image: latestIphone.image,
    imageAlt: latestIphone.imageAlt,
    galleryImages: latestIphone.galleryImages,
    theme: "black",
    primaryLabel: "Learn more",
    primaryTo: latestIphone.learnMoreTo,
    secondaryLabel: "Buy",
    secondaryTo: "/iphones",
    fallbackImage: iphone17Story,
  };

  const families = [
    { name: "iPhone", image: latestIphone.image, to: "/iphones" },
    { name: "Mac", image: macbookAirStory, to: "/macbooks" },
    { name: "iPad", image: ipadAirStory, to: "/ipads" },
    { name: "Watch", image: appleWatchStory, to: "/apple-watch" },
    { name: "AirPods", image: airpodsProStory, to: "/airpods" },
    { name: "Accessories", image: accessoriesStory, to: "/accessories" },
  ];

  return (
    <>
      <SEO title="Premium Tech Store in Accra | Buy & Sell GH" description="Shop original devices and get trusted trade-in, repair, pre-order and customer support from Buy & Sell GH in Accra." />
      <main className="storefront-home">
        <div className="store-announcement" role="note">
          <span>Trade in your current device and upgrade for less.</span>
          <Link to="/sell-or-trade">Get estimate <ChevronRight size={15} /></Link>
        </div>

        <ProductLaunch campaign={latestIphoneCampaign} priority />
        <ProductLaunch campaign={macbookAirCampaign} />
        <ProductLaunch campaign={ipadAirCampaign} />

        <section className="store-product-grid" aria-label="Featured product families">
          {productTiles.map((campaign) => <ProductTile campaign={campaign} key={campaign.eyebrow} />)}
        </section>

        <section className="store-trade-section" aria-labelledby="store-trade-title">
          <div className="store-section-copy">
            <p className="store-eyebrow">Trade In</p>
            <h2 id="store-trade-title">Turn the device you have into the one you want.</h2>
            <Link className="store-button store-button-primary" to="/sell-or-trade">Start Trade-In <ArrowRight size={17} /></Link>
          </div>
          <div className="trade-device-flow" aria-label="Trade an older device toward a newer device">
            <img src={iphone16Story} alt="Current iPhone ready for a trade-in estimate" loading="lazy" decoding="async" />
            <ArrowRight aria-hidden="true" />
            <img src={iphone17Story} alt="Newer iPhone available after a confirmed trade-in" loading="lazy" decoding="async" />
          </div>
        </section>

        <section className="store-payments-section" aria-labelledby="store-payments-title">
          <div className="store-section-copy">
            <p className="store-eyebrow">Payments</p>
            <h2 id="store-payments-title">Pay your way.</h2>
            <p>Final payment instructions are confirmed by Buy & Sell GH before payment.</p>
          </div>
          <div className="payment-methods" aria-label="Confirmed payment preferences">
            <span><Smartphone size={23} /> Mobile Money on Confirmation</span>
            <span><Banknote size={23} /> Pay on Pickup</span>
            <span><Building2 size={23} /> Bank Transfer on Confirmation</span>
          </div>
        </section>

        <section className="store-visa-section" aria-labelledby="store-visa-title">
          <div className="store-section-copy">
            <p className="store-eyebrow">Visa Card Trading</p>
            <h2 id="store-visa-title">Turn supported Visa cards into value.</h2>
            <p>Send card details for review and confirmation. Buy & Sell GH does not issue payment cards.</p>
            <div className="store-actions">
              <Link className="store-button store-button-primary" to="/gift-cards">Check a Card</Link>
              <Link className="store-button store-button-secondary" to="/contact">Contact Us</Link>
            </div>
          </div>
          <img src={visaCardCampaign} alt="One original unbranded black and gold card for supported card review" loading="lazy" decoding="async" />
        </section>

        <StoreRail eyebrow="Accessories" title="Perfect companions for your devices." description="Swipe to explore" className="accessory-rail">
          {accessories.map((item) => (
            <Link className="accessory-card" to={item.to} key={item.name}>
              <img src={item.image} alt={item.name} loading="lazy" decoding="async" />
              <strong>{item.name}</strong>
              <span>Shop <ChevronRight size={15} /></span>
            </Link>
          ))}
        </StoreRail>

        <section className="store-family-section" aria-labelledby="store-family-title">
          <div className="store-section-heading">
            <p className="store-eyebrow">Shop</p>
            <h2 id="store-family-title">Shop by product family.</h2>
          </div>
          <div className="family-grid">
            {families.map((family) => (
              <Link to={family.to} className="family-card" key={family.name}>
                <img src={family.image} alt="" loading="lazy" decoding="async" />
                <strong>{family.name}</strong>
                <ChevronRight size={17} />
              </Link>
            ))}
          </div>
        </section>

        <StoreRail eyebrow="Services" title="More from our store." description="Swipe to explore" className="service-story-rail">
          {serviceStories.map((story) => (
            <Link className={`service-story-card service-story-${story.tone}`} to={story.to} key={story.label}>
              <div><span>{story.label}</span><strong>{story.title}</strong></div>
              <img src={story.image} alt={`${story.label} from Buy & Sell GH`} loading="lazy" decoding="async" />
              <small>Learn more <ChevronRight size={14} /></small>
            </Link>
          ))}
        </StoreRail>

        <section className="store-support-section" aria-labelledby="store-support-title">
          <MessageCircle size={42} aria-hidden="true" />
          <p className="store-eyebrow">Support</p>
          <h2 id="store-support-title">We're here to help.</h2>
          <p>Need help choosing a device, placing an order or arranging a repair?</p>
          <div className="store-actions">
            <a className="store-button store-button-primary" href={whatsappHref} target="_blank" rel="noopener noreferrer">Chat on WhatsApp</a>
            <Link className="store-button store-button-secondary" to="/contact">Contact Support</Link>
          </div>
        </section>
      </main>
    </>
  );
}

function ProductLaunch({ campaign, priority }: { campaign: Campaign; priority?: boolean }) {
  return (
    <section className={`store-launch store-launch-${campaign.theme}`} aria-labelledby={`launch-${slugify(campaign.eyebrow)}`}>
      <div className="store-launch-copy">
        <p className="store-eyebrow">{campaign.eyebrow}</p>
        <h1 id={`launch-${slugify(campaign.eyebrow)}`}>{campaign.title}</h1>
        <p>{campaign.description}</p>
        <div className="store-actions">
          <Link className="store-button store-button-primary" to={campaign.primaryTo}>{campaign.primaryLabel}</Link>
          {campaign.secondaryLabel && campaign.secondaryTo && <Link className="store-button store-button-secondary" to={campaign.secondaryTo}>{campaign.secondaryLabel}</Link>}
        </div>
      </div>
      <div className="store-launch-art">
        {campaign.galleryImages && campaign.galleryImages.length > 1 ? (
          <div className="store-phone-lineup" aria-label={campaign.imageAlt}>
            {campaign.galleryImages.map((image, index) => (
              <img
                src={image.src}
                alt={image.alt}
                loading={priority || index === 0 ? "eager" : "lazy"}
                decoding="async"
                fetchPriority={priority || index === 0 ? "high" : "auto"}
                key={image.src}
                onError={(event) => {
                  if (!campaign.fallbackImage || event.currentTarget.dataset.fallbackApplied) return;
                  event.currentTarget.dataset.fallbackApplied = "true";
                  event.currentTarget.src = campaign.fallbackImage;
                }}
              />
            ))}
          </div>
        ) : (
          <img src={campaign.image} alt={campaign.imageAlt} loading={priority ? "eager" : "lazy"} decoding="async" fetchPriority={priority ? "high" : "auto"} />
        )}
      </div>
    </section>
  );
}

function ProductTile({ campaign }: { campaign: Campaign }) {
  return (
    <article className={`store-product-tile store-product-${campaign.theme}`}>
      <div className="store-tile-copy">
        <p className="store-eyebrow">{campaign.eyebrow}</p>
        <h2>{campaign.title}</h2>
        <p>{campaign.description}</p>
        <div className="store-actions">
          <Link className="store-button store-button-primary" to={campaign.primaryTo}>{campaign.primaryLabel}</Link>
          {campaign.secondaryLabel && campaign.secondaryTo && <Link className="store-button store-button-secondary" to={campaign.secondaryTo}>{campaign.secondaryLabel}</Link>}
        </div>
      </div>
      <img src={campaign.image} alt={campaign.imageAlt} loading="lazy" decoding="async" />
    </article>
  );
}

function StoreRail({ eyebrow, title, description, className, children }: { eyebrow: string; title: string; description: string; className: string; children: ReactNode }) {
  return (
    <section className={`store-rail-section ${className}`} aria-labelledby={`rail-${slugify(title)}`}>
      <div className="store-rail-heading">
        <div><p className="store-eyebrow">{eyebrow}</p><h2 id={`rail-${slugify(title)}`}>{title}</h2></div>
        <span>{description} <ArrowRight size={16} /></span>
      </div>
      <div className="store-horizontal-rail">{children}</div>
    </section>
  );
}

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function getLatestIphoneLineup(products: Product[]) {
  const ranked = products
    .map((product) => ({ product, generationNumber: getIphoneGenerationNumber(product) }))
    .filter((entry): entry is { product: Product; generationNumber: number } => entry.generationNumber !== null);
  const newestNumber = ranked.length ? Math.max(...ranked.map((entry) => entry.generationNumber)) : null;
  const generationLabel = newestNumber ? `iPhone ${newestNumber}` : "iPhone";
  const variants = newestNumber ? ranked.filter((entry) => entry.generationNumber === newestNumber).map((entry) => entry.product) : [];
  const imageProduct = selectBestIphoneImageProduct(variants);
  const resolvedImage = imageProduct ? resolveProductImage(imageProduct) : undefined;
  const image = resolvedImage?.src ?? iphone17Story;

  return {
    generationLabel,
    variants,
    image,
    galleryImages: getLatestIphoneGalleryImages(variants),
    imageAlt: imageProduct ? `${generationLabel} lineup featuring ${imageProduct.name}` : "Premium iPhone lineup artwork for Buy & Sell GH",
    learnMoreTo: newestNumber ? `/shop?category=Phones&brand=Apple&generation=${encodeURIComponent(generationLabel)}` : "/iphones",
  };
}

function getIphoneGenerationNumber(product: Product) {
  if (product.brand !== "Apple" || product.category !== "iPhones") return null;
  const searchable = [product.generation, product.name, product.model, product.slug].filter(Boolean).join(" ");
  const match = searchable.match(/\biPhone[\s-]*(\d{2})\b/i);
  return match ? Number(match[1]) : null;
}

function selectBestIphoneImageProduct(variants: Product[]) {
  if (!variants.length) return undefined;
  const sorted = [...variants].sort((a, b) => iphoneVariantRank(b) - iphoneVariantRank(a));
  return sorted.find((product) => product.images?.length) ?? sorted[0];
}

function getLatestIphoneGalleryImages(variants: Product[]) {
  return [...variants]
    .sort((a, b) => iphoneVariantRank(b) - iphoneVariantRank(a))
    .map((product) => {
      const image = resolveProductImage(product);
      return image ? { src: image.src, alt: image.alt || product.name } : null;
    })
    .filter((entry): entry is { src: string; alt: string } => Boolean(entry))
    .slice(0, 4);
}

function iphoneVariantRank(product: Product) {
  const searchable = `${product.name} ${product.model} ${product.slug}`.toLowerCase();
  if (searchable.includes("pro-max") || searchable.includes("pro max")) return 5;
  if (searchable.includes("pro")) return 4;
  if (searchable.includes("plus")) return 3;
  if (searchable.includes("air")) return 2;
  return 1;
}
