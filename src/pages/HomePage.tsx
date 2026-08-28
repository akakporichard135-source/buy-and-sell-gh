import { ArrowRight, BadgeCheck, ChevronRight, MapPin, MessageCircle, PackageCheck, Search, ShieldCheck } from "lucide-react";
import { useMemo } from "react";
import type { CSSProperties, ReactNode } from "react";
import type { Product } from "../types/product";
import { Link } from "react-router-dom";
import { useProductCatalog } from "../catalog/ProductCatalogContext";
import { isProductPurchasable } from "../catalog/productCatalog";
import { SEO } from "../components/SEO";
import { NewMacLaunchCampaign } from "../components/NewMacLaunchCampaign";
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
import moreStoreInstallmentArtwork from "../assets/homepage/more-store-installment-owner.png";
import moreStoreRepairsArtwork from "../assets/homepage/more-store-repairs-owner.png";
import moreStoreSellCashArtwork from "../assets/homepage/more-store-sell-cash-owner.png";
import moreStoreUpgradeArtwork from "../assets/homepage/more-store-upgrade-owner.png";
import ownerStoreFlyerCampaign from "../assets/homepage/owner-store-flyer.jpg";
import upgradeSaveArtwork from "../assets/homepage/homepage-upgrade-cinematic.webp";

import iphone17Story from "../assets/products/iphone-17-pro-max-premium.webp";
import { business } from "../config/business";
import { getLatestIphoneLineup } from "../utils/latestIphone";
import { getLatestMacLaunch } from "../utils/latestMac";
import type { LatestMacLaunch } from "../utils/latestMac";
import { newMacLaunches } from "../data/newMacLaunches";

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
  secondaryLabel: "Shop now",
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
    secondaryLabel: "Shop now",
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
    secondaryLabel: "Shop now",
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
  },
];

const serviceStories = [
  { label: "Upgrade & Save", title: "Move into something newer.", description: "Trade or swap your current device toward your next upgrade.", image: moreStoreUpgradeArtwork, to: "/sell-or-trade?mode=upgrade", tone: "light" },
  { label: "Sell for Cash", title: "Sell your old device.", description: "Request an assessment and confirm the next step with our team.", image: moreStoreSellCashArtwork, to: "/sell-or-trade?mode=sell", tone: "light" },
  { label: "Installment", title: "Own an iPhone today.", description: "Review current requirements before sending your request.", image: moreStoreInstallmentArtwork, to: "/installment", tone: "black" },
  { label: "Repairs", title: "Let the experts fix it.", description: "Support for phones, laptops and game consoles.", image: moreStoreRepairsArtwork, to: "/repairs", tone: "black" },
  { label: "Buy & Sell", title: "Your next upgrade starts here.", description: "Browse original devices and get clear local support for your next purchase.", image: ownerStoreFlyerCampaign, to: "/shop", tone: "light" },
];

const marketplaceCommitments = [
  {
    label: "Availability confirmed",
    description: "Availability, price, payment and delivery details are checked before an order is final.",
    icon: BadgeCheck,
  },
  {
    label: "Clear order requests",
    description: "Your cart becomes an order request, not a claim that payment or purchase is complete.",
    icon: PackageCheck,
  },
  {
    label: "Local Accra support",
    description: "Chat with Buy & Sell GH or visit Dome Pillar 2 for practical help with your next step.",
    icon: MapPin,
  },
] as const;

export function HomePage() {
  const { activeProducts } = useProductCatalog();
  const latestIphone = useMemo(() => getLatestIphoneLineup(activeProducts, iphone17Story), [activeProducts]);
  const latestMacbookAir = useMemo(() => getLatestMacLaunch(activeProducts, "MacBook Air"), [activeProducts]);
  const latestMacbookPro = useMemo(() => getLatestMacLaunch(activeProducts, "MacBook Pro"), [activeProducts]);
  const registeredFamilyCampaign = iphoneFamilyCampaigns[latestIphone.generationLabel];
  const latestFamilyCampaign = registeredFamilyCampaign?.requiredSlugs.every((slug) =>
    latestIphone.variants.some((product) => product.slug === slug),
  )
    ? registeredFamilyCampaign
    : undefined;

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
    secondaryLabel: "Shop now",
    secondaryTo: "/iphones",
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
        <NewMacLaunchCampaign launch={newMacLaunches["mac-mini"]} priority />
        <NewMacLaunchCampaign launch={newMacLaunches["mac-studio"]} />
        <ProductLaunch campaign={latestIphoneCampaign} priority />
        {featuredMacbookAirCampaign && <ProductLaunch campaign={featuredMacbookAirCampaign} />}
        {featuredMacbookProCampaign && <ProductLaunch campaign={featuredMacbookProCampaign} />}

        <section className="store-product-grid" aria-label="Featured product families">
          {productTiles.map((campaign) => <ProductTile campaign={campaign} key={campaign.eyebrow} />)}
        </section>

        <MarketplaceAssurance />

        <StoreRail eyebrow="Services" title="More from our store." description="Explore more ways to upgrade, sell and get support." className="service-story-rail" id="more-from-store">
          {serviceStories.map((story) => (
            <Link className={`service-story-card service-story-${story.tone}`} to={story.to} key={story.label}>
              <div><span>{story.label}</span><strong>{story.title}</strong><p>{story.description}</p></div>
              <img src={story.image} alt={`${story.label} from Buy & Sell GH`} loading="lazy" decoding="async" />
              <small>Learn more <ChevronRight size={14} /></small>
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

function MarketplaceAssurance() {
  return (
    <section className="marketplace-assurance" aria-labelledby="marketplace-assurance-title">
      <div className="marketplace-assurance-main">
        <div className="marketplace-assurance-copy">
          <p className="store-eyebrow">Buy &amp; Sell with confidence</p>
          <h2 id="marketplace-assurance-title">Real devices. Clear next steps.</h2>
          <p>Browse original devices, submit a controlled order request, or get help selling and upgrading. Buy &amp; Sell GH confirms the important details before payment.</p>
          <div className="store-actions">
            <Link className="store-button store-button-primary" to="/shop">Shop devices</Link>
            <Link className="store-button store-button-secondary" to="/sell-or-trade">Sell or trade</Link>
          </div>
        </div>
        <div className="marketplace-assurance-path" aria-label="Customer journey">
          <div className="marketplace-assurance-path-heading"><ShieldCheck size={26} aria-hidden="true" /><span>Clear customer process</span></div>
          <Link to="/shop"><Search size={22} aria-hidden="true" /><span><strong>Browse verified listings</strong><small>Compare real catalogue products and availability states.</small></span><ChevronRight size={20} aria-hidden="true" /></Link>
          <Link to="/cart"><PackageCheck size={22} aria-hidden="true" /><span><strong>Review your order request</strong><small>See selected variants, quantities and totals before submitting.</small></span><ChevronRight size={20} aria-hidden="true" /></Link>
          <a href={whatsappHref} target="_blank" rel="noopener noreferrer"><MessageCircle size={22} aria-hidden="true" /><span><strong>Get local support</strong><small>Confirm product, payment, pickup or delivery details with the team.</small></span><ChevronRight size={20} aria-hidden="true" /></a>
        </div>
      </div>
      <div className="marketplace-commitments" aria-label="Marketplace commitments">
        {marketplaceCommitments.map(({ description, icon: Icon, label }) => (
          <article className="marketplace-commitment" key={label}>
            <Icon size={23} aria-hidden="true" />
            <div><strong>{label}</strong><p>{description}</p></div>
          </article>
        ))}
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

function getLaunchAvailability(products: Product[], fallbackName: string) {
  const purchasableProduct = products.find(isProductPurchasable);
  if (purchasableProduct) return `${purchasableProduct.name} is available now while stock lasts.`;
  return `${fallbackName} is available for enquiry. Final availability is confirmed by Buy & Sell GH.`;
}

function createMacCampaign(
  launch: LatestMacLaunch,
  description: string,
  theme: CampaignTheme,
  fallbackImage: string,
  variant: "macbook-air" | "macbook-pro",
  integratedAsset?: { image: string; slug: string },
): Campaign {
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
    secondaryLabel: "Shop now",
    secondaryTo: "/macbooks",
    fallbackImage,
    variant,
  };
}

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}


