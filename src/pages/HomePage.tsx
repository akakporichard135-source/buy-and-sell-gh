import { Apple, ArrowRight, Banknote, Building2, ChevronRight, List, MapPin, MessageCircle, Search, ShieldCheck, Smartphone, X } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import type { CSSProperties, PointerEvent as ReactPointerEvent, ReactNode } from "react";
import { Link } from "react-router-dom";
import { useProductCatalog } from "../catalog/ProductCatalogContext";
import { SEO } from "../components/SEO";
import accessoriesStory from "../assets/categories/accessories-premium.webp";
import preorderStory from "../assets/categories/brand-new-devices-premium.webp";
import audioAccessoriesStory from "../assets/homepage/homepage-audio-accessories-story.jpg";
import airpodsProCampaignArt from "../assets/homepage/homepage-airpods-pro-cinematic.webp";
import appleWatchCampaignArt from "../assets/homepage/homepage-apple-watch-cinematic.webp";
import installmentCampaign from "../assets/homepage/homepage-installment-cinematic.webp";
import stickerCamera from "../assets/homepage/sticker-collage/camera.webp";
import stickerController from "../assets/homepage/sticker-collage/controller.webp";
import stickerHeadphones from "../assets/homepage/sticker-collage/headphones.webp";
import stickerLaptop from "../assets/homepage/sticker-collage/laptop.webp";
import stickerPersonCenter from "../assets/homepage/sticker-collage/person-center.webp";
import stickerPersonLeft from "../assets/homepage/sticker-collage/person-left.webp";
import stickerPersonRight from "../assets/homepage/sticker-collage/person-right.webp";
import stickerPhone from "../assets/homepage/sticker-collage/phone.webp";
import stickerPlant from "../assets/homepage/sticker-collage/plant.webp";
import stickerShoes from "../assets/homepage/sticker-collage/shoes.webp";
import stickerSpeaker from "../assets/homepage/sticker-collage/speaker.webp";
import stickerTablet from "../assets/homepage/sticker-collage/tablet.webp";
import iphone17CutoutLeft from "../assets/homepage/iphone-17-cutout-left.webp";
import iphone17ProMaxCutoutCenter from "../assets/homepage/iphone-17-pro-max-cutout-center.webp";
import iphoneAirCutoutRight from "../assets/homepage/iphone-air-cutout-right.webp";
import iphone17LightCampaign from "../assets/homepage/homepage-iphone-17-lineup-light.webp";
import iphone17LineupCampaign from "../assets/homepage/homepage-iphone-17-lineup-cinematic.webp";
import ipadAirCampaignArt from "../assets/homepage/homepage-ipad-air-cinematic.webp";
import ipadProCampaignArt from "../assets/homepage/homepage-ipad-pro-cinematic.webp";
import macbookAirCampaignArt from "../assets/homepage/homepage-macbook-air-cinematic.webp";
import macbookProCampaignArt from "../assets/homepage/homepage-macbook-pro-cinematic.webp";
import referralCampaign from "../assets/homepage/homepage-refer-cinematic.webp";
import repairsCampaign from "../assets/homepage/homepage-repairs-cinematic.webp";
import sellCashArtwork from "../assets/homepage/homepage-sell-cash-cinematic.webp";
import upgradeSaveArtwork from "../assets/homepage/homepage-upgrade-cinematic.webp";
import visaCardCampaign from "../assets/homepage/homepage-visa-card-single.webp";
import airpodsProStory from "../assets/products/airpods-pro-3-premium.webp";
import cableStory from "../assets/products/apple-usb-c-charge-cable-premium.webp";
import caseStory from "../assets/products/apple-clear-iphone-case-magsafe-premium.webp";
import chargerStory from "../assets/products/apple-20w-usb-c-power-adapter-premium.webp";
import iphone16Story from "../assets/products/iphone-16-pro-max-premium.webp";
import iphone17Story from "../assets/products/iphone-17-pro-max-premium.webp";
import magsafeStory from "../assets/products/apple-magsafe-charger-premium.webp";
import adapterStory from "../assets/products/apple-35w-dual-usb-c-power-adapter-premium.webp";
import watchAccessoryStory from "../assets/products/apple-watch-fast-charger-usb-c-premium.webp";
import { business } from "../config/business";
import type { Product } from "../types/product";
import { getLatestIphoneLineup } from "../utils/latestIphone";
import { getLocalPremiumImage, resolveProductImage } from "../utils/productImages";

const whatsappHref = `https://wa.me/${business.whatsapp.primary}`;
const marketplaceLocation = "Dome Pillar 2, Accra";

type MarketplaceBrand = "Samsung" | "Apple" | "Google" | "Huawei" | "LG" | "Xiaomi" | "Motorola" | "Other";
type MarketplaceFilter = "all" | "price" | "brand" | "condition" | "verified" | "recommended";

const marketplaceBrands: MarketplaceBrand[] = ["Samsung", "Apple", "Google", "Huawei", "LG", "Xiaomi", "Motorola", "Other"];

const marketplaceFilters: { id: MarketplaceFilter; label: string }[] = [
  { id: "all", label: "All Ghana" },
  { id: "price", label: "Price, GH₵" },
  { id: "brand", label: "Brand" },
  { id: "condition", label: "Condition" },
  { id: "verified", label: "Verified stock" },
  { id: "recommended", label: "Recommended" },
];

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
  cinematicLayers?: IphoneCinematicLayer[];
  fallbackImage?: string;
  variant?: "iphone" | "macbook-air";
};

type IphoneCinematicLayer = {
  src: string;
  alt: string;
  role: "left" | "center" | "right";
};


type HumanStickerLayer = {
  id: string;
  src: string;
  alt: string;
  depth: number;
  priority?: boolean;
};

const humanStickerLayers: HumanStickerLayer[] = [
  { id: "plant", src: stickerPlant, alt: "Decorative plant accent", depth: 4 },
  { id: "person-left", src: stickerPersonLeft, alt: "Customer presenting a laptop", depth: 6, priority: true },
  { id: "person-right", src: stickerPersonRight, alt: "Customer presenting a tablet", depth: 6, priority: true },
  { id: "person-center", src: stickerPersonCenter, alt: "Customer presenting an iPhone", depth: 7, priority: true },
  { id: "headphones", src: stickerHeadphones, alt: "Premium headphones", depth: 9 },
  { id: "camera", src: stickerCamera, alt: "Camera accessory", depth: 9 },
  { id: "laptop", src: stickerLaptop, alt: "Laptop with gold display lighting", depth: 11, priority: true },
  { id: "tablet", src: stickerTablet, alt: "Tablet with gold display lighting", depth: 11, priority: true },
  { id: "phone", src: stickerPhone, alt: "Flagship smartphone", depth: 12, priority: true },
  { id: "controller", src: stickerController, alt: "Game controller", depth: 13 },
  { id: "speaker", src: stickerSpeaker, alt: "Compact audio speaker", depth: 13 },
  { id: "shoes", src: stickerShoes, alt: "Lifestyle styling accent", depth: 14 },
];
const iphoneFamilyCampaigns: Record<string, { image: string; alt: string; requiredSlugs: string[]; layers: IphoneCinematicLayer[] }> = {
  "iPhone 17": {
    image: iphone17LightCampaign,
    alt: "iPhone 17 family on a seamless light studio background",
    requiredSlugs: ["iphone-17-pro-max", "iphone-17-pro", "iphone-air", "iphone-17"],
    layers: [
      { src: iphone17CutoutLeft, alt: "iPhone 17 in a pale finish from a three-quarter front angle", role: "left" },
      { src: iphone17ProMaxCutoutCenter, alt: "iPhone 17 Pro Max in dark blue from a three-quarter rear angle", role: "center" },
      { src: iphoneAirCutoutRight, alt: "iPhone Air in pale blue showing its slim side profile", role: "right" },
    ],
  },
};

const macbookAirCampaign: Campaign = {
  eyebrow: "MacBook Air",
  title: "Supercharged for everything you do.",
  description: "A remarkably capable laptop in a light, travel-ready design.",
  image: macbookAirCampaignArt,
  imageAlt: "MacBook Air in a clean warm studio presentation",
  theme: "warm",
  primaryLabel: "Learn more",
  primaryTo: "/macbooks?family=MacBook%20Air",
  secondaryLabel: "Buy",
  secondaryTo: "/shop?category=MacBooks",
  variant: "macbook-air",
};

const ipadAirCampaign: Campaign = {
  eyebrow: "iPad Air",
  title: "Fresh. Powerful. Colourful.",
  description: "Made for work, study, creativity and everything in between.",
  image: ipadAirCampaignArt,
  imageAlt: "iPad Air in a layered premium product presentation",
  theme: "light",
  primaryLabel: "Learn more",
  primaryTo: "/ipads?family=iPad%20Air",
  secondaryLabel: "Buy",
  secondaryTo: "/shop?category=iPads",
};

const deviceRequestCampaign: Campaign = {
  eyebrow: "Pre-Order",
  title: "Can't find it? Request it.",
  description: "Tell us the exact device you want and Buy & Sell GH will confirm availability and next steps.",
  image: preorderStory,
  imageAlt: "Premium device ready for a Buy & Sell GH pre-order request",
  theme: "warm",
  primaryLabel: "Request a Device",
  primaryTo: "/pre-order",
  secondaryLabel: "Learn more",
  secondaryTo: "/device-request",
};

const productTiles: Campaign[] = [
  {
    eyebrow: "MacBook Pro",
    title: "Power for your best work.",
    description: "Serious performance for demanding creative and professional workflows.",
    image: macbookProCampaignArt,
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
    image: appleWatchCampaignArt,
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
    image: airpodsProCampaignArt,
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
    image: ipadProCampaignArt,
    imageAlt: "iPad Pro in a premium black studio presentation",
    theme: "black",
    primaryLabel: "Learn more",
    primaryTo: "/ipads?family=iPad%20Pro",
    secondaryLabel: "Buy",
    secondaryTo: "/shop?category=iPads",
  },
  ipadAirCampaign,
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
  { label: "Trade In", title: "Upgrade for less.", image: upgradeSaveArtwork, to: "/sell-or-trade", tone: "light" },
  { label: "Phone Repairs", title: "Let the experts fix it.", image: repairsCampaign, to: "/repairs", tone: "black" },
  { label: "Installment", title: "Own an iPhone today.", image: installmentCampaign, to: "/installment", tone: "black" },
  { label: "Sell Your Device", title: "Turn your old device into cash.", image: sellCashArtwork, to: "/sell-or-trade", tone: "light" },
  { label: "Upgrade & Save", title: "Swap what you have for what comes next.", image: upgradeSaveArtwork, to: "/sell-or-trade", tone: "light" },
  { label: "Refer a Friend", title: "Good tech is better when shared.", image: referralCampaign, to: "/refer-a-friend", tone: "light" },
  { label: "Pre-Order", title: "Request the exact device you want.", image: preorderStory, to: "/pre-order", tone: "warm" },
  { label: "New Arrivals", title: "See what just landed.", image: iphone17LineupCampaign, to: "/shop?sort=newest", tone: "black" },
  { label: "Delivery", title: "Pickup and delivery, clearly arranged.", image: accessoriesStory, to: "/shopping-information", tone: "light" },
  { label: "Support", title: "Answers when you need them.", image: audioAccessoriesStory, to: "/contact", tone: "black" },
];

export function HomePage() {
  const { activeProducts } = useProductCatalog();
  const [marketplaceSearch, setMarketplaceSearch] = useState("");
  const [marketplaceBrand, setMarketplaceBrand] = useState<MarketplaceBrand>("Apple");
  const [marketplaceFilter, setMarketplaceFilter] = useState<MarketplaceFilter>("all");
  const latestIphone = useMemo(() => getLatestIphoneLineup(activeProducts, iphone17Story), [activeProducts]);
  const registeredFamilyCampaign = iphoneFamilyCampaigns[latestIphone.generationLabel];
  const latestFamilyCampaign = registeredFamilyCampaign?.requiredSlugs.every((slug) =>
    latestIphone.variants.some((product) => product.slug === slug),
  )
    ? registeredFamilyCampaign
    : undefined;

  const latestIphoneCampaign: Campaign = {
    eyebrow: "Latest iPhone",
    title: "iPhone",
    description: "Meet the latest iPhone lineup.",
    image: latestFamilyCampaign?.image ?? latestIphone.image,
    imageAlt: latestFamilyCampaign?.alt ?? latestIphone.imageAlt,
    cinematicLayers: latestFamilyCampaign?.layers ?? createCatalogueIphoneLayers(latestIphone.galleryImages),
    theme: "light",
    primaryLabel: "Learn more",
    primaryTo: latestIphone.learnMoreTo,
    secondaryLabel: "Shop iPhone",
    secondaryTo: "/iphones",
    fallbackImage: iphone17Story,
    variant: "iphone",
  };

  const marketplaceProducts = useMemo(
    () => activeProducts
      .filter(isPreOwnedMarketplaceProduct)
      .sort((a, b) => {
        const stockDifference = Number(isMarketplaceProductInStock(b)) - Number(isMarketplaceProductInStock(a));
        if (stockDifference !== 0) return stockDifference;
        const popularDifference = Number(Boolean(b.popular || b.isPopular)) - Number(Boolean(a.popular || a.isPopular));
        return popularDifference || b.price - a.price;
      }),
    [activeProducts],
  );

  const marketplaceSearchTerm = marketplaceSearch.trim().toLowerCase();
  const marketplaceResults = marketplaceProducts
    .filter((product) => matchesMarketplaceBrand(product, marketplaceBrand))
    .filter((product) => !marketplaceSearchTerm || [
      product.name,
      product.model,
      product.condition,
      ...product.storage,
      ...product.colors,
    ].join(" ").toLowerCase().includes(marketplaceSearchTerm))
    .filter((product) => matchesMarketplaceFilter(product, marketplaceFilter));

  const collageFrame = useRef<HTMLDivElement | null>(null);

  const updateCollageParallax = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "mouse" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const frame = collageFrame.current;
    if (!frame) return;

    const rect = frame.getBoundingClientRect();
    const offsetX = (event.clientX - rect.left) / rect.width - 0.5;
    const offsetY = (event.clientY - rect.top) / rect.height - 0.5;

    window.requestAnimationFrame(() => {
      frame.querySelectorAll<HTMLElement>(".store-sticker-layer").forEach((layer) => {
        const depth = Number(layer.dataset.depth || 0);
        layer.style.setProperty("--parallax-x", `${(offsetX * depth).toFixed(2)}px`);
        layer.style.setProperty("--parallax-y", `${(offsetY * depth * -0.55).toFixed(2)}px`);
      });
    });
  };

  const resetCollageParallax = () => {
    collageFrame.current?.querySelectorAll<HTMLElement>(".store-sticker-layer").forEach((layer) => {
      layer.style.setProperty("--parallax-x", "0px");
      layer.style.setProperty("--parallax-y", "0px");
    });
  };
  return (
    <>
      <SEO title="Premium Tech Store in Accra | Buy & Sell GH" description="Shop original devices and get trusted trade-in, repair, pre-order and customer support from Buy & Sell GH in Accra." />
      <main className="storefront-home">
        <div className="store-announcement" role="note">
          <span>Trade in your current device and upgrade for less.</span>
          <Link to="/sell-or-trade">Get estimate <ChevronRight size={15} /></Link>
        </div>

        <section className="store-human-campaign" aria-labelledby="store-human-campaign-title">
          <div className="store-human-campaign-copy">
            <h1 id="store-human-campaign-title">Tech, your way.</h1>
            <p>Buy &amp; Sell GH helps customers buy, sell, trade, repair and upgrade iPhones, iPads, MacBooks, watches and accessories in Accra.</p>
            <div className="store-actions">
              <Link className="store-button store-button-primary" to="/shop">Shop now</Link>
              <Link className="store-button store-button-secondary" to="/about">Learn more</Link>
            </div>
          </div>
          <div
            className="store-sticker-collage"
            ref={collageFrame}
            role="img"
            aria-label="Three Buy & Sell GH customers presenting a laptop, smartphone, tablet and accessories"
            onPointerMove={updateCollageParallax}
            onPointerLeave={resetCollageParallax}
          >
            <span className="store-sticker-doodle store-sticker-doodle-ring" aria-hidden="true" />
            <span className="store-sticker-doodle store-sticker-doodle-spark" aria-hidden="true" />
            <span className="store-sticker-doodle store-sticker-doodle-zigzag" aria-hidden="true" />
            {humanStickerLayers.map((layer) => (
              <span
                className={`store-sticker-layer store-sticker-layer-${layer.id}`}
                data-depth={layer.depth}
                key={layer.id}
                style={{ "--layer-depth": layer.depth } as CSSProperties}
              >
                <span className="store-sticker-layer-inner">
                  <img
                    src={layer.src}
                    alt=""
                    aria-hidden="true"
                    loading={layer.priority ? "eager" : "lazy"}
                    decoding="async"
                    fetchPriority={layer.priority ? "high" : "auto"}
                    draggable={false}
                  />
                </span>
              </span>
            ))}
          </div>
        </section>

        <ProductLaunch campaign={latestIphoneCampaign} />
        <ProductLaunch campaign={macbookAirCampaign} />

        <section className="store-product-grid" aria-label="Featured product families">
          {productTiles.map((campaign) => <ProductTile campaign={campaign} key={campaign.eyebrow} />)}
        </section>

        <ProductLaunch campaign={deviceRequestCampaign} />

        <StoreRail eyebrow="Accessories" title="Perfect companions for your devices." description="Swipe to explore" className="accessory-rail">
          {accessories.map((item) => (
            <Link className="accessory-card" to={item.to} key={item.name}>
              <img src={item.image} alt={item.name} loading="lazy" decoding="async" />
              <strong>{item.name}</strong>
              <span>Shop <ChevronRight size={15} /></span>
            </Link>
          ))}
        </StoreRail>

        <section className="store-marketplace-section" aria-labelledby="store-marketplace-title">
          <div className="marketplace-shell">
            <div className="marketplace-heading">
              <div>
                <p className="store-eyebrow">Buy &amp; Sell GH Marketplace</p>
                <h2 id="store-marketplace-title">Browse Used Devices</h2>
                <p>Shop store-verified UK Used and pre-owned devices from one trusted inventory in Accra.</p>
              </div>
              <span className="marketplace-verified"><ShieldCheck size={19} /> Store verified</span>
            </div>

            <form className="marketplace-search" role="search" onSubmit={(event) => event.preventDefault()}>
              <Search size={21} aria-hidden="true" />
              <label className="sr-only" htmlFor="marketplace-search-input">Search used devices</label>
              <input
                id="marketplace-search-input"
                type="search"
                value={marketplaceSearch}
                onChange={(event) => setMarketplaceSearch(event.target.value)}
                placeholder="Search UK Used phones, storage, colour..."
              />
              {marketplaceSearch && (
                <button type="button" aria-label="Clear marketplace search" onClick={() => setMarketplaceSearch("")}>
                  <X size={19} />
                </button>
              )}
            </form>

            <div className="marketplace-shortcuts" aria-label="Browse used inventory by brand">
              {marketplaceBrands.map((brand) => {
                const count = marketplaceProducts.filter((product) => matchesMarketplaceBrand(product, brand)).length;
                return (
                  <button
                    className={marketplaceBrand === brand ? "is-active" : ""}
                    type="button"
                    aria-pressed={marketplaceBrand === brand}
                    onClick={() => setMarketplaceBrand(brand)}
                    key={brand}
                  >
                    <MarketplaceBrandMark brand={brand} />
                    <strong>{brand}</strong>
                    <small>{count} {count === 1 ? "device" : "devices"}</small>
                  </button>
                );
              })}
            </div>

            <div className="marketplace-filter-row" aria-label="Filter used devices">
              {marketplaceFilters.map((filter) => (
                <button
                  className={marketplaceFilter === filter.id ? "is-active" : ""}
                  type="button"
                  aria-pressed={marketplaceFilter === filter.id}
                  onClick={() => setMarketplaceFilter(filter.id)}
                  key={filter.id}
                >
                  {filter.label}
                </button>
              ))}
            </div>

            <div className="marketplace-results-heading">
              <div>
                <h3>UK Used devices at Buy &amp; Sell GH</h3>
                <p><MapPin size={15} /> {marketplaceLocation}</p>
              </div>
              <Link to="/shop?category=UK%20Used%20Devices">View all used devices <ChevronRight size={16} /></Link>
            </div>

            {marketplaceResults.length > 0 ? (
              <div className="marketplace-product-rail" aria-label="Swipe through UK Used devices">
                {marketplaceResults.map((product) => (
                  <MarketplaceProductCard product={product} key={product.id} />
                ))}
              </div>
            ) : (
              <div className="marketplace-empty-state">
                <strong>No used devices match those filters.</strong>
                <p>Try another device type or clear the marketplace filters.</p>
                <button type="button" onClick={() => { setMarketplaceSearch(""); setMarketplaceBrand("Apple"); setMarketplaceFilter("all"); }}>Clear filters</button>
              </div>
            )}
          </div>
        </section>

        <section className="store-trade-section" aria-labelledby="store-trade-title">
          <div className="store-section-copy">
            <p className="store-eyebrow">Trade In</p>
            <h2 id="store-trade-title">Turn the device you have into the one you want.</h2>
            <Link className="store-button store-button-primary" to="/sell-or-trade">Start Trade-In <ArrowRight size={17} /></Link>
          </div>
          <div className="trade-device-flow" aria-label="Trade an older device toward a newer device">
            <img src={upgradeSaveArtwork} alt="An older phone transitioning toward a newer flagship phone" loading="lazy" decoding="async" />
          </div>
        </section>

        <section className="store-visa-section" aria-labelledby="store-visa-title">
          <div className="store-section-copy">
            <p className="store-eyebrow">Visa Card Trading</p>
            <h2 id="store-visa-title">Trade supported cards securely and simply.</h2>
            <p>Send card details for review and confirmation. Buy & Sell GH does not issue payment cards.</p>
            <div className="store-actions">
              <Link className="store-button store-button-primary" to="/gift-cards">Check a Card</Link>
              <Link className="store-button store-button-secondary" to="/contact">Contact Us</Link>
            </div>
          </div>
          <img src={visaCardCampaign} alt="One original unbranded black and gold card for supported card review" loading="lazy" decoding="async" />
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
    <section className={`store-launch store-launch-${campaign.theme}${campaign.variant ? ` store-launch-${campaign.variant}` : ""}`} aria-labelledby={`launch-${slugify(campaign.eyebrow)}`}>
      <div className="store-launch-copy">
        <p className="store-eyebrow">{campaign.eyebrow}</p>
        <h2 id={`launch-${slugify(campaign.eyebrow)}`}>{campaign.title}</h2>
        <p>{campaign.description}</p>
        <div className="store-actions">
          <Link className="store-button store-button-primary" to={campaign.primaryTo}>{campaign.primaryLabel}</Link>
          {campaign.secondaryLabel && campaign.secondaryTo && <Link className="store-button store-button-secondary" to={campaign.secondaryTo}>{campaign.secondaryLabel}</Link>}
        </div>
      </div>
      <div className="store-launch-art">
        {campaign.variant === "iphone" && campaign.cinematicLayers?.length ? (
          <div className="store-iphone-cinematic" aria-label={campaign.imageAlt}>
            <span className="store-iphone-stage-light" aria-hidden="true" />
            {campaign.cinematicLayers.map((layer, index) => (
              <div className={`store-iphone-device store-iphone-device-${layer.role}`} key={`${layer.role}-${layer.src}`}>
                <img
                  src={layer.src}
                  alt={layer.alt}
                  loading={priority || index === 1 ? "eager" : "lazy"}
                  decoding="async"
                  fetchPriority={priority || index === 1 ? "high" : "auto"}
                  onError={(event) => {
                    if (!campaign.fallbackImage || event.currentTarget.dataset.fallbackApplied) return;
                    event.currentTarget.dataset.fallbackApplied = "true";
                    event.currentTarget.src = campaign.fallbackImage;
                  }}
                />
              </div>
            ))}
          </div>
        ) : campaign.galleryImages && campaign.galleryImages.length > 1 ? (
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
          <img
            src={campaign.image}
            alt={campaign.imageAlt}
            loading={priority ? "eager" : "lazy"}
            decoding="async"
            fetchPriority={priority ? "high" : "auto"}
            onError={(event) => {
              if (!campaign.fallbackImage || event.currentTarget.dataset.fallbackApplied) return;
              event.currentTarget.dataset.fallbackApplied = "true";
              event.currentTarget.src = campaign.fallbackImage;
            }}
          />
        )}
      </div>
    </section>
  );
}

function createCatalogueIphoneLayers(images: { src: string; alt: string }[]): IphoneCinematicLayer[] {
  const roles: IphoneCinematicLayer["role"][] = ["center", "left", "right"];
  return images.slice(0, 3).map((image, index) => ({ ...image, role: roles[index] }));
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

function MarketplaceBrandMark({ brand }: { brand: MarketplaceBrand }) {
  if (brand === "Apple") {
    return <span className="marketplace-brand-mark marketplace-brand-apple" aria-hidden="true"><Apple /></span>;
  }

  if (brand === "Other") {
    return <span className="marketplace-brand-mark marketplace-brand-other" aria-hidden="true"><List /></span>;
  }

  const logoText: Record<Exclude<MarketplaceBrand, "Apple" | "Other">, string> = {
    Samsung: "SAMSUNG",
    Google: "G",
    Huawei: "HUAWEI",
    LG: "LG",
    Xiaomi: "mi",
    Motorola: "M",
  };

  return (
    <span className={`marketplace-brand-mark marketplace-brand-${slugify(brand)}`} aria-hidden="true">
      <span>{logoText[brand]}</span>
    </span>
  );
}

function MarketplaceProductCard({ product }: { product: Product }) {
  const resolvedImage = getMarketplaceProductImage(product);
  const isPriceOnRequest = product.priceOnRequest || product.price <= 0;

  return (
    <Link className="marketplace-product-card" to={`/product/${product.slug}`}>
      <div className="marketplace-product-image">
        <img
          src={resolvedImage?.src ?? iphone16Story}
          alt={resolvedImage?.alt ?? product.name}
          loading="lazy"
          decoding="async"
          onError={(event) => {
            if (event.currentTarget.dataset.fallbackApplied) return;
            event.currentTarget.dataset.fallbackApplied = "true";
            event.currentTarget.src = iphone16Story;
          }}
        />
      </div>
      <div className="marketplace-product-copy">
        <p className="marketplace-product-price">{isPriceOnRequest ? "Contact for Price" : `GH₵ ${product.price.toLocaleString("en-GH")}`}</p>
        <h4>{product.name}</h4>
        <p className="marketplace-product-location"><MapPin size={14} /> {marketplaceLocation}</p>
        <div className="marketplace-product-meta">
          <span>{product.condition}</span>
          {product.storage[0] && <span>{product.storage.slice(0, 2).join(" / ")}</span>}
        </div>
      </div>
    </Link>
  );
}

function getMarketplaceProductImage(product?: Product) {
  if (!product) return undefined;
  return resolveProductImage(product) ?? getLocalPremiumImage(product);
}

function isPreOwnedMarketplaceProduct(product: Product) {
  const labels = [product.condition, product.category, ...(product.tags ?? []), ...(product.badges ?? [])].join(" ").toLowerCase();
  return product.condition === "UK Used"
    || product.condition === "Excellent"
    || product.condition === "Very Good"
    || labels.includes("uk used")
    || labels.includes("pre-owned")
    || labels.includes("preowned");
}

function isMarketplaceProductInStock(product: Product) {
  return product.stockQuantity > 0 && (product.stockStatus === "In Stock" || product.stockStatus === "Low Stock");
}

function matchesMarketplaceBrand(product: Product, brand: MarketplaceBrand) {
  const normalizedBrand = product.brand.toLowerCase();
  if (brand === "Other") {
    return !marketplaceBrands.slice(0, -1).some((knownBrand) => knownBrand.toLowerCase() === normalizedBrand);
  }
  return normalizedBrand === brand.toLowerCase();
}

function matchesMarketplaceFilter(product: Product, filter: MarketplaceFilter) {
  if (filter === "price") return product.price > 0 && product.price <= 10000;
  if (filter === "condition") return product.condition === "UK Used" || [...(product.tags ?? []), ...(product.badges ?? [])].some((label) => label.toLowerCase().includes("uk used"));
  if (filter === "verified") return isMarketplaceProductInStock(product);
  if (filter === "recommended") return Boolean(product.popular || product.isPopular || product.featured || product.isFeatured) || isMarketplaceProductInStock(product);
  return true;
}

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}
