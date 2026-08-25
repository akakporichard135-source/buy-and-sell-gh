import { ArrowRight, ChevronRight, CircleCheck, History, LockKeyhole, MessageCircle, Search, ShieldCheck, SlidersHorizontal, WalletCards } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import type { Product, ProductBrand } from "../types/product";
import { Link, useLocation } from "react-router-dom";
import { useProductCatalog } from "../catalog/ProductCatalogContext";
import { isProductPurchasable } from "../catalog/productCatalog";
import { SEO } from "../components/SEO";
import installmentCampaignArt from "../assets/homepage/homepage-installment-cinematic.webp";
import referCampaignArt from "../assets/homepage/homepage-refer-cinematic.webp";
import repairsCampaignArt from "../assets/homepage/homepage-repairs-cinematic.webp";
import sellCashCampaignArt from "../assets/homepage/homepage-sell-cash-cinematic.webp";
import appleWatchCampaignArt from "../assets/homepage/homepage-apple-watch-cinematic.webp";
import iphone17CutoutLeft from "../assets/homepage/iphone-17-cutout-left.webp";
import iphone17ProMaxCutoutCenter from "../assets/homepage/iphone-17-pro-max-cutout-center.webp";
import iphoneAirCutoutRight from "../assets/homepage/iphone-air-cutout-right.webp";
import iphone17LightCampaign from "../assets/homepage/homepage-iphone-17-lineup-light.webp";
import ipadAirCampaignArt from "../assets/homepage/homepage-ipad-air-cinematic.webp";
import ipadProCampaignArt from "../assets/homepage/homepage-ipad-pro-cinematic.webp";
import macbookAirCampaignArt from "../assets/homepage/homepage-macbook-air-premium-v2.jpg";
import macbookAirM5Cutout from "../assets/homepage/homepage-macbook-air-m5-cutout.webp";
import macbookProCampaignArt from "../assets/homepage/homepage-macbook-pro-cinematic.webp";
import macbookProM5Cutout from "../assets/homepage/homepage-macbook-pro-m5-cutout.webp";
import preOrderCampaignArt from "../assets/homepage/homepage-preorder-premium.jpg";
import upgradeSaveArtwork from "../assets/homepage/homepage-upgrade-cinematic.webp";
import visaCardSingle from "../assets/homepage/homepage-visa-card-single.webp";
import samsungStoryArt from "../assets/homepage/homepage-samsung-story.jpg";
import audioStoryArt from "../assets/homepage/homepage-audio-accessories-story.jpg";
import laptopStoryArt from "../assets/homepage/homepage-laptop-tablet-story.jpg";
import audioCategoryArt from "../assets/categories/audio-premium.webp";
import gamingCategoryArt from "../assets/categories/game-consoles-premium.webp";
import iphone17Story from "../assets/products/iphone-17-pro-max-premium.webp";
import { business } from "../config/business";
import { getLatestIphoneLineup } from "../utils/latestIphone";
import { getLatestMacLaunch } from "../utils/latestMac";
import type { LatestMacLaunch } from "../utils/latestMac";

const whatsappHref = `https://wa.me/${business.whatsapp.primary}`;

type CampaignTheme = "black" | "light" | "warm";

type Campaign = {
  eyebrow: string;
  title: string;
  description: string;
  availabilityText?: string;
  image: string;
  imageAlt: string;
  theme: CampaignTheme;
  primaryLabel: string;
  primaryTo: string;
  secondaryLabel?: string;
  secondaryTo?: string;
  galleryImages?: { src: string; alt: string }[];
  cinematicLayers?: CinematicDeviceLayer[];
  fallbackImage?: string;
  variant?: "iphone" | "macbook-air" | "macbook-pro";
  showImage?: boolean;
};

type CinematicDeviceRole = "left" | "center" | "right";

type CinematicDeviceLayer = {
  src: string;
  alt: string;
  role: CinematicDeviceRole;
};

const cinematicDeviceRoles: CinematicDeviceRole[] = ["left", "center", "right"];
const cinematicDeviceDelays: Record<CinematicDeviceRole, string> = {
  center: "0.20s",
  left: "0.32s",
  right: "0.44s",
};


const iphoneFamilyCampaigns: Record<string, { image: string; alt: string; requiredSlugs: string[]; layers: CinematicDeviceLayer[] }> = {
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

const productTiles: Campaign[] = [
  ipadAirCampaign,
  {
    eyebrow: "Apple Watch",
    title: "Move. Connect. Keep going.",
    description: "A capable everyday companion, right on your wrist.",
    image: appleWatchCampaignArt,
    imageAlt: "Apple Watch in a warm premium presentation",
    theme: "light",
    primaryLabel: "Learn more",
    primaryTo: "/apple-watch",
    secondaryLabel: "Buy",
    secondaryTo: "/shop?category=Apple%20Watches",
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
  {
    eyebrow: "Trade In",
    title: "Turn the device you have into the one you want.",
    description: "Get an estimate and upgrade through the real Buy & Sell GH trade flow.",
    image: upgradeSaveArtwork,
    imageAlt: "An older phone transitioning toward a newer flagship phone",
    theme: "light",
    primaryLabel: "Get estimate",
    primaryTo: "/sell-or-trade",
    secondaryLabel: "How it works",
    secondaryTo: "/sell-or-trade",
    showImage: false,
  },
];

const serviceStories = [
  { label: "Upgrade & Save", title: "Move into something newer.", description: "Trade or swap your current device through the existing Buy & Sell GH flow.", image: upgradeSaveArtwork, to: "/sell-or-trade?mode=upgrade", tone: "light" },
  { label: "Sell for Cash", title: "A clear route from device to value.", description: "Submit your device details for inspection and a confirmed offer.", image: sellCashCampaignArt, to: "/sell-or-trade?mode=sell", tone: "dark" },
  { label: "Installment", title: "A more flexible way to plan.", description: "Ask about current eligibility, deposit requirements and confirmed payment terms.", image: installmentCampaignArt, to: "/installment", tone: "dark" },
  { label: "Repairs", title: "Let the experts fix it.", description: "Request support for phones, laptops and game consoles.", image: repairsCampaignArt, to: "/repairs", tone: "dark" },
  { label: "Refer a Friend", title: "Good tech is better shared.", description: "Introduce someone to devices, repairs, sourcing or trade-in support.", image: referCampaignArt, to: "/refer-a-friend", tone: "light" },
  { label: "Pre-Order", title: "Request the exact device.", description: "Tell us the model and configuration you want us to source.", image: preOrderCampaignArt, to: "/pre-order", tone: "light" },
];

const cardCapabilityGroups = [
  {
    label: "Available now",
    description: "Supported card enquiries, purchase guidance and direct customer support.",
    icon: CircleCheck,
    status: "live",
  },
  {
    label: "Account experience",
    description: "Purchase history, installment tracking, reminders and statements are planned.",
    icon: History,
    status: "planned",
  },
  {
    label: "Partner-enabled",
    description: "Card issuing, limits, rewards and account controls require licensed financial partners.",
    icon: LockKeyhole,
    status: "partner",
  },
] as const;

const marketplaceEditorialStories = [
  { brand: "Samsung", eyebrow: "Mobile", title: "Galaxy, sourced with clarity.", image: samsungStoryArt, tone: "dark" },
  { brand: "LG", eyebrow: "Screens & devices", title: "Technology for work and home.", image: laptopStoryArt, tone: "light" },
  { brand: "Bose", eyebrow: "Premium audio", title: "Sound with room to breathe.", image: audioStoryArt, tone: "warm" },
  { brand: "JBL", eyebrow: "Portable audio", title: "Music made to move.", image: audioCategoryArt, tone: "light" },
  { brand: "Sony", eyebrow: "Gaming & audio", title: "Play, listen and discover.", image: gamingCategoryArt, tone: "dark" },
] as const;

const supportedMarketplaceBrands: ProductBrand[] = ["Samsung", "LG", "Bose", "JBL", "Sony"];
const marketplaceBrandMarks: Partial<Record<ProductBrand, { mark: string; className: string }>> = {
  Samsung: { mark: "SAMSUNG", className: "marketplace-brand-samsung" },
  LG: { mark: "LG", className: "marketplace-brand-lg" },
  Bose: { mark: "BOSE", className: "marketplace-brand-word" },
  JBL: { mark: "JBL", className: "marketplace-brand-word" },
  Sony: { mark: "SONY", className: "marketplace-brand-word" },
};

type MarketplaceBrandShortcut = {
  label: string;
  mark: string;
  className: string;
  count: number;
  to: string;
};

const marketplaceMainBrands = new Set(["Samsung", "LG", "Bose", "JBL", "Sony"]);
const requestReadyMarketplaceBrands = [
  "Google",
  "Huawei",
  "Xiaomi",
  "Motorola",
  "OnePlus",
  "Nothing",
  "Oppo",
  "Vivo",
  "Realme",
  "Tecno",
  "Infinix",
  "HP",
  "Dell",
  "Lenovo",
  "Asus",
  "Acer",
  "Beats",
  "Anker",
  "Belkin",
  "Oraimo",
  "Skullcandy",
];

const marketplaceFilterChips = [
  { label: "All", to: "/shop" },
  { label: "Price", to: "/shop" },
  { label: "Brand", to: "/shop" },
  { label: "Condition", to: "/shop" },
  { label: "Storage", to: "/shop" },
  { label: "Availability", to: "/shop" },
  { label: "Recommended", to: "/shop" },
  { label: "Store Verified", to: "/shop" },
];

export function HomePage() {
  const { activeProducts } = useProductCatalog();
  const location = useLocation();
  const latestIphone = useMemo(() => getLatestIphoneLineup(activeProducts, iphone17Story), [activeProducts]);
  const latestIphoneAction = useMemo(() => getLaunchAction(latestIphone.variants, latestIphone.featuredName, `/pre-order?model=${encodeURIComponent(latestIphone.featuredName)}`), [latestIphone.featuredName, latestIphone.variants]);
  const latestMacbookAir = useMemo(() => getLatestMacLaunch(activeProducts, "MacBook Air"), [activeProducts]);
  const latestMacbookPro = useMemo(() => getLatestMacLaunch(activeProducts, "MacBook Pro"), [activeProducts]);
  const brandCounts = useMemo(() => getBrandCounts(activeProducts), [activeProducts]);
  const marketplaceBrands = useMemo(() => getMarketplaceBrandShortcuts(activeProducts, brandCounts), [activeProducts, brandCounts]);
  const registeredFamilyCampaign = iphoneFamilyCampaigns[latestIphone.generationLabel];
  const latestFamilyCampaign = registeredFamilyCampaign?.requiredSlugs.every((slug) =>
    latestIphone.variants.some((product) => product.slug === slug),
  )
    ? registeredFamilyCampaign
    : undefined;

  useEffect(() => {
    if (location.hash !== "#marketplace-discovery") return;
    window.requestAnimationFrame(() => document.getElementById("marketplace-discovery")?.scrollIntoView({ behavior: "auto", block: "start" }));
  }, [location.hash]);

  const latestIphoneCampaign: Campaign = {
    eyebrow: "Latest iPhone",
    title: latestIphone.featuredName,
    description: "Meet the newest iPhone family in the Buy & Sell GH catalogue.",
    availabilityText: getLaunchAvailability(latestIphone.variants, latestIphone.generationLabel),
    image: latestFamilyCampaign?.image ?? latestIphone.image,
    imageAlt: latestFamilyCampaign?.alt ?? latestIphone.imageAlt,
    cinematicLayers: latestFamilyCampaign?.layers ?? createCatalogueIphoneLayers(latestIphone.galleryImages),
    theme: "light",
    primaryLabel: "Learn more",
    primaryTo: latestIphone.learnMoreTo,
    secondaryLabel: latestIphoneAction.label,
    secondaryTo: latestIphoneAction.to,
    fallbackImage: iphone17Story,
    variant: "iphone",
  };

  const featuredMacbookAirCampaign = latestMacbookAir
    ? createMacCampaign(latestMacbookAir, "A light, capable Mac for work, study and everyday creativity.", "warm", macbookAirCampaignArt, "macbook-air", {
      image: macbookAirM5Cutout,
      slug: "macbook-air-15-m5",
    })
    : null;
  const featuredMacbookProCampaign = latestMacbookPro
    ? createMacCampaign(latestMacbookPro, "Built for demanding creative, technical and professional workflows.", "black", macbookProCampaignArt, "macbook-pro", {
      image: macbookProM5Cutout,
      slug: "macbook-pro-16-m5-pro-max",
    })
    : null;

  return (
    <>
      <SEO title="Premium Tech Store in Accra | Buy & Sell GH" description="Shop original devices and get trusted trade-in, repair, pre-order and customer support from Buy & Sell GH in Accra." />
      <main className="storefront-home">
        <ProductLaunch campaign={latestIphoneCampaign} priority />
        {featuredMacbookAirCampaign && <ProductLaunch campaign={featuredMacbookAirCampaign} />}
        {featuredMacbookProCampaign && <ProductLaunch campaign={featuredMacbookProCampaign} />}

        <section className="store-product-grid" aria-label="Featured product families">
          {productTiles.map((campaign) => <ProductTile campaign={campaign} key={campaign.eyebrow} />)}
        </section>

        <BuySellCardFeature />

        <MarketplaceDiscovery brands={marketplaceBrands} />

        <StoreRail eyebrow="Services" title="More from our store." description="Swipe to explore" className="service-story-rail" id="more-from-store">
          {serviceStories.map((story) => (
            <Link className={`service-story-card service-story-${story.tone}`} to={story.to} key={story.label}>
              <img src={story.image} alt={`${story.label} from Buy & Sell GH`} loading="lazy" decoding="async" />
              <div className="service-story-copy">
                <span>{story.label}</span>
                <strong>{story.title}</strong>
                <p>{story.description}</p>
                <small>Learn more <ChevronRight size={14} /></small>
              </div>
            </Link>
          ))}
        </StoreRail>

        <section id="store-support" className="store-support-section" aria-labelledby="store-support-title">
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

function BuySellCardFeature() {
  return (
    <section className="buy-sell-card-feature" aria-labelledby="buy-sell-card-title">
      <div className="buy-sell-card-main">
        <div className="buy-sell-card-copy">
          <p className="store-eyebrow">Buy &amp; Sell Card</p>
          <h2 id="buy-sell-card-title">Your purchases. One clear view.</h2>
          <p className="buy-sell-card-lede">A future customer account experience for purchases, eligible payment plans, trade-in credits and support.</p>
          <div className="buy-sell-card-notice">
            <ShieldCheck size={20} aria-hidden="true" />
            <p><strong>In development.</strong> Buy &amp; Sell GH does not currently issue a bank or credit card. Financial features will only launch with approved providers.</p>
          </div>
          <div className="store-actions">
            <Link className="store-button store-button-primary" to="/gift-cards">Check a supported card</Link>
            <Link className="store-button store-button-secondary" to="/contact">Talk to us</Link>
          </div>
        </div>
        <div className="buy-sell-card-visual" aria-label="Original black and gold Buy and Sell card concept">
          <span className="buy-sell-card-orbit" aria-hidden="true" />
          <img src={visaCardSingle} alt="Original unbranded black and gold card concept" loading="lazy" decoding="async" />
          <div className="buy-sell-card-preview" aria-hidden="true">
            <span><WalletCards size={18} /> Account overview</span>
            <strong>Planned experience</strong>
            <small>Purchases · Plans · Support</small>
          </div>
        </div>
      </div>
      <div className="buy-sell-card-capabilities" aria-label="Buy and Sell Card capability status">
        {cardCapabilityGroups.map(({ description, icon: Icon, label, status }) => (
          <article className={`buy-sell-card-capability buy-sell-card-capability-${status}`} key={label}>
            <Icon size={23} aria-hidden="true" />
            <div><strong>{label}</strong><p>{description}</p></div>
          </article>
        ))}
      </div>
    </section>
  );
}

function MarketplaceDiscovery({ brands }: { brands: MarketplaceBrandShortcut[] }) {
  const [isBrandListOpen, setIsBrandListOpen] = useState(false);
  const mainBrands = brands.filter((brand) => marketplaceMainBrands.has(brand.label));
  const otherBrands = brands.filter((brand) => !marketplaceMainBrands.has(brand.label));

  return (
    <section id="marketplace-discovery" className="store-marketplace-section" aria-labelledby="marketplace-discovery-title">
      <div className="marketplace-shell">
        <div className="marketplace-heading">
          <div>
            <p className="store-eyebrow">Buy &amp; Sell GH Marketplace</p>
            <h2 id="marketplace-discovery-title">Browse beyond Apple.</h2>
            <p>Search, filter and explore store-verified devices and accessories from the wider Buy &amp; Sell GH catalogue.</p>
          </div>
        </div>

        <Link className="marketplace-search" to="/shop" aria-label="Search the Buy and Sell GH catalogue">
          <Search size={20} aria-hidden="true" />
          <span>Search phones, brands, storage, condition...</span>
          <ArrowRight size={20} aria-hidden="true" />
        </Link>

        <div className="marketplace-editorial-rail" aria-label="Featured multi-brand stories">
          {marketplaceEditorialStories.map((story) => {
            const brand = brands.find((item) => item.label === story.brand);
            const count = brand?.count ?? 0;
            return (
              <Link className={`marketplace-editorial-card marketplace-editorial-${story.tone}`} to={brand?.to ?? `/pre-order?brand=${encodeURIComponent(story.brand)}`} key={story.brand}>
                <img src={story.image} alt={`${story.brand} ${story.eyebrow.toLowerCase()} editorial`} loading="lazy" decoding="async" />
                <div>
                  <span>{story.brand} · {story.eyebrow}</span>
                  <strong>{story.title}</strong>
                  <small>{count > 0 ? `Explore ${count} ${count === 1 ? "product" : "products"}` : "Request or enquire"} <ChevronRight size={15} /></small>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="marketplace-shortcuts marketplace-main-shortcuts" aria-label="Featured non-Apple brand shortcuts">
          {mainBrands.map((shortcut) => (
            <Link className="marketplace-shortcut" to={shortcut.to} key={shortcut.label}>
              <span className={`marketplace-brand-mark ${shortcut.className}`} aria-hidden="true"><span>{shortcut.mark}</span></span>
              <strong>{shortcut.label}</strong>
              <small>{shortcut.count > 0 ? `${shortcut.count} ${shortcut.count === 1 ? "product" : "products"}` : "Enquire"}</small>
            </Link>
          ))}
          <button
            className="marketplace-shortcut marketplace-others-action"
            type="button"
            aria-expanded={isBrandListOpen}
            aria-controls="marketplace-brand-list"
            onClick={() => setIsBrandListOpen((open) => !open)}
          >
            <span className="marketplace-brand-mark marketplace-brand-other" aria-hidden="true"><SlidersHorizontal size={34} /></span>
            <strong>Others</strong>
            <small>More brands</small>
          </button>
        </div>

        {isBrandListOpen && (
          <div id="marketplace-brand-list" className="marketplace-brand-panel" aria-label="More non-Apple brands">
            <div className="marketplace-brand-panel-heading">
              <strong>More brands</strong>
              <span>Real catalogue brands show counts. Request-only brands open Pre-Order.</span>
            </div>
            <div className="marketplace-brand-list">
              {otherBrands.map((shortcut) => (
                <Link className="marketplace-brand-list-item" to={shortcut.to} key={shortcut.label}>
                  <span className={`marketplace-brand-mark ${shortcut.className}`} aria-hidden="true"><span>{shortcut.mark}</span></span>
                  <span>
                    <strong>{shortcut.label}</strong>
                    <small>{shortcut.count > 0 ? `${shortcut.count} ${shortcut.count === 1 ? "product" : "products"}` : "Request / enquire"}</small>
                  </span>
                  <ChevronRight size={18} aria-hidden="true" />
                </Link>
              ))}
              <Link className="marketplace-brand-list-item" to="/pre-order">
                <span className="marketplace-brand-mark marketplace-brand-other" aria-hidden="true"><span>Other</span></span>
                <span>
                  <strong>Other</strong>
                  <small>Request a brand or device</small>
                </span>
                <ChevronRight size={18} aria-hidden="true" />
              </Link>
            </div>
          </div>
        )}

        <div className="marketplace-filter-row" aria-label="Marketplace filters">
          {marketplaceFilterChips.map((chip) => (
            <Link to={chip.to} key={chip.label}>{chip.label}</Link>
          ))}
        </div>
      </div>
    </section>
  );
}
function ProductLaunch({ campaign, priority }: { campaign: Campaign; priority?: boolean }) {
  return (
    <section className={`store-launch store-launch-${campaign.theme}${campaign.variant ? ` store-launch-${campaign.variant}` : ""}`} aria-labelledby={`launch-${slugify(campaign.eyebrow)}`}>
      <div className="store-launch-copy">
        <p className="store-eyebrow">{campaign.eyebrow}</p>
        <h2 id={`launch-${slugify(campaign.eyebrow)}`}>{campaign.title}</h2>
        <p>{campaign.description}</p>
        {campaign.availabilityText && <p className="store-launch-availability">{campaign.availabilityText}</p>}
        <div className="store-actions">
          <Link className="store-button store-button-primary" to={campaign.primaryTo}>{campaign.primaryLabel}</Link>
          {campaign.secondaryLabel && campaign.secondaryTo && <Link className="store-button store-button-secondary" to={campaign.secondaryTo}>{campaign.secondaryLabel}</Link>}
        </div>
      </div>
      <div className="store-launch-art">
        {campaign.variant === "iphone" && campaign.cinematicLayers?.length ? (
          <CinematicDeviceComposition
            className="store-iphone-cinematic"
            fallbackImage={campaign.fallbackImage ?? campaign.image}
            label={campaign.imageAlt}
            layers={campaign.cinematicLayers}
            priority={priority}
          />
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

function CinematicDeviceComposition({
  className,
  fallbackImage,
  label,
  layers,
  priority,
}: {
  className?: string;
  fallbackImage?: string;
  label: string;
  layers: CinematicDeviceLayer[];
  priority?: boolean;
}) {
  const compositionLayers = normalizeCinematicDeviceLayers(layers, fallbackImage, label);
  const centerLayer = compositionLayers.find((layer) => layer.role === "center");

  if (!compositionLayers.length) return null;

  return (
    <div className={`cinematic-device-composition${className ? ` ${className}` : ""}`} aria-label={label}>
      <span className="cinematic-device-stage-light store-iphone-stage-light" aria-hidden="true" />
      {compositionLayers.map((layer) => {
        const isCenter = layer.role === "center";
        const isDuplicateSide = !isCenter && layer.src === centerLayer?.src;
        return (
          <div
            className={`cinematic-device-layer cinematic-device-layer-${layer.role} store-iphone-device store-iphone-device-${layer.role}`}
            key={`${layer.role}-${layer.src}`}
            style={{ "--device-delay": cinematicDeviceDelays[layer.role] } as CSSProperties}
          >
            <img
              src={layer.src}
              alt={isCenter || !isDuplicateSide ? layer.alt : ""}
              aria-hidden={!isCenter && isDuplicateSide ? "true" : undefined}
              loading={priority || isCenter ? "eager" : "lazy"}
              decoding="async"
              fetchPriority={priority || isCenter ? "high" : "auto"}
              onError={(event) => {
                if (!fallbackImage || event.currentTarget.dataset.fallbackApplied) return;
                event.currentTarget.dataset.fallbackApplied = "true";
                event.currentTarget.src = fallbackImage;
              }}
            />
          </div>
        );
      })}
    </div>
  );
}

function normalizeCinematicDeviceLayers(
  layers: CinematicDeviceLayer[],
  fallbackImage: string | undefined,
  fallbackAlt: string,
): CinematicDeviceLayer[] {
  const validLayers = layers.filter((layer) => Boolean(layer.src));
  const fallbackLayer = fallbackImage ? { src: fallbackImage, alt: fallbackAlt, role: "center" as const } : validLayers[0];
  const center = validLayers.find((layer) => layer.role === "center") ?? validLayers[0] ?? fallbackLayer;

  if (!center) return [];

  const left = validLayers.find((layer) => layer.role === "left") ?? validLayers.find((layer) => layer.src !== center.src) ?? center;
  const right = validLayers.find((layer) => layer.role === "right")
    ?? validLayers.find((layer) => layer.src !== center.src && layer.src !== left.src)
    ?? center;
  const layerByRole: Record<CinematicDeviceRole, CinematicDeviceLayer> = {
    left: { ...left, role: "left" },
    center: { ...center, role: "center" },
    right: { ...right, role: "right" },
  };

  return cinematicDeviceRoles.map((role) => layerByRole[role]);
}

function createCatalogueIphoneLayers(images: { src: string; alt: string }[]): CinematicDeviceLayer[] {
  const roles: CinematicDeviceRole[] = ["center", "left", "right"];
  return images.slice(0, 3).map((image, index) => ({ ...image, role: roles[index] }));
}

function ProductTile({ campaign }: { campaign: Campaign }) {
  const shouldShowImage = campaign.showImage !== false;
  return (
    <article className={`store-product-tile store-product-${campaign.theme} store-product-${slugify(campaign.eyebrow)}${!shouldShowImage ? " store-product-text-only" : ""}`}>
      <div className="store-tile-copy">
        <p className="store-eyebrow">{campaign.eyebrow}</p>
        <h2>{campaign.title}</h2>
        <p>{campaign.description}</p>
        <div className="store-actions">
          <Link className="store-button store-button-primary" to={campaign.primaryTo}>{campaign.primaryLabel}</Link>
          {campaign.secondaryLabel && campaign.secondaryTo && <Link className="store-button store-button-secondary" to={campaign.secondaryTo}>{campaign.secondaryLabel}</Link>}
        </div>
      </div>
      {shouldShowImage && <img src={campaign.image} alt={campaign.imageAlt} loading="lazy" decoding="async" />}
    </article>
  );
}

function StoreRail({ eyebrow, title, description, className, children, id }: { eyebrow: string; title: string; description: string; className: string; children: ReactNode; id?: string }) {
  return (
    <section id={id} className={`store-rail-section ${className}`} aria-labelledby={`rail-${slugify(title)}`}>
      <div className="store-rail-heading">
        <div><p className="store-eyebrow">{eyebrow}</p><h2 id={`rail-${slugify(title)}`}>{title}</h2></div>
        <span>{description} <ArrowRight size={16} /></span>
      </div>
      <div className="store-horizontal-rail">{children}</div>
    </section>
  );
}

function getBrandCounts(products: Product[]) {
  return products.reduce<Partial<Record<ProductBrand, number>>>((counts, product) => {
    if (product.brand !== "Apple") counts[product.brand] = (counts[product.brand] ?? 0) + 1;
    return counts;
  }, {});
}

function getLaunchAvailability(products: Product[], fallbackName: string) {
  const purchasableProduct = products.find(isProductPurchasable);
  if (purchasableProduct) return `${purchasableProduct.name} is available now while stock lasts.`;
  return `${fallbackName} is available for pre-order or enquiry. Final availability is confirmed by Buy & Sell GH.`;
}

function getLaunchAction(products: Product[], fallbackName: string, fallbackTo: string) {
  const purchasableProduct = products.find(isProductPurchasable);
  if (purchasableProduct) return { label: "Buy", to: `/product/${purchasableProduct.slug}` };
  return { label: "Pre-order", to: fallbackTo || `/pre-order?model=${encodeURIComponent(fallbackName)}` };
}

function createMacCampaign(
  launch: LatestMacLaunch,
  description: string,
  theme: CampaignTheme,
  fallbackImage: string,
  variant: "macbook-air" | "macbook-pro",
  integratedAsset?: { image: string; slug: string },
): Campaign {
  const action = getLaunchAction(launch.variants, launch.featuredProduct.name, launch.preorderTo);
  return {
    eyebrow: `${launch.generation} · ${launch.family}`,
    title: launch.family,
    description,
    availabilityText: getLaunchAvailability(launch.variants, launch.featuredProduct.name),
    image: launch.featuredProduct.slug === integratedAsset?.slug ? integratedAsset.image : launch.image,
    imageAlt: launch.imageAlt,
    theme,
    primaryLabel: "Learn more",
    primaryTo: launch.learnMoreTo,
    secondaryLabel: action.label,
    secondaryTo: action.to,
    fallbackImage,
    variant,
  };
}

function getMarketplaceBrandShortcuts(products: Product[], counts: Partial<Record<ProductBrand, number>>): MarketplaceBrandShortcut[] {
  const productBrands = Array.from(new Set(products.map((product) => product.brand).filter((brand): brand is ProductBrand => brand !== "Apple")));
  const brands = Array.from(new Set<string>([...supportedMarketplaceBrands, ...productBrands, ...requestReadyMarketplaceBrands]));

  return brands.map((brand) => {
    const productBrand = productBrands.find((catalogueBrand) => catalogueBrand === brand);
    const brandMeta = productBrand ? marketplaceBrandMarks[productBrand] : undefined;
    const count = productBrand ? counts[productBrand] ?? 0 : 0;
    return {
      label: brand,
      mark: brandMeta?.mark ?? brand,
      className: brandMeta?.className ?? `marketplace-brand-${slugify(brand)}`,
      count,
      to: count > 0 ? `/shop?brand=${encodeURIComponent(brand)}` : `/pre-order?brand=${encodeURIComponent(brand)}`,
    };
  });
}
function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}


