import { ArrowRight, ChevronRight, MessageCircle } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import { Link } from "react-router-dom";
import { useProductCatalog } from "../catalog/ProductCatalogContext";
import { SEO } from "../components/SEO";
import accessoriesStory from "../assets/categories/accessories-premium.webp";
import audioAccessoriesStory from "../assets/homepage/homepage-audio-accessories-story.jpg";
import appleWatchCampaignArt from "../assets/homepage/homepage-apple-watch-cinematic.webp";
import installmentCampaign from "../assets/homepage/homepage-installment-cinematic.webp";
import techYourWayPoster from "../assets/homepage/homepage-human-tech-sticker.webp";
import techYourWayVideo from "../assets/homepage/homepage-tech-your-way-cinematic.mp4";
import iphone17CutoutLeft from "../assets/homepage/iphone-17-cutout-left.webp";
import iphone17ProMaxCutoutCenter from "../assets/homepage/iphone-17-pro-max-cutout-center.webp";
import iphoneAirCutoutRight from "../assets/homepage/iphone-air-cutout-right.webp";
import iphone17LightCampaign from "../assets/homepage/homepage-iphone-17-lineup-light.webp";
import iphone17LineupCampaign from "../assets/homepage/homepage-iphone-17-lineup-cinematic.webp";
import ipadAirCampaignArt from "../assets/homepage/homepage-ipad-air-cinematic.webp";
import ipadProCampaignArt from "../assets/homepage/homepage-ipad-pro-cinematic.webp";
import macbookAirCampaignArt from "../assets/homepage/homepage-macbook-air-cinematic.webp";
import macbookProCampaignArt from "../assets/homepage/homepage-macbook-pro-cinematic.webp";
import repairsCampaign from "../assets/homepage/homepage-repairs-cinematic.webp";
import upgradeSaveArtwork from "../assets/homepage/homepage-upgrade-cinematic.webp";
import visaCardCampaign from "../assets/homepage/homepage-visa-card-single.webp";
import iphone17Story from "../assets/products/iphone-17-pro-max-premium.webp";
import { business } from "../config/business";
import { getLatestIphoneLineup } from "../utils/latestIphone";

const whatsappHref = `https://wa.me/${business.whatsapp.primary}`;
const CAMPAIGN_VIDEO_SAFE_LOOP_END_SECONDS = 1.25;

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
  cinematicLayers?: CinematicDeviceLayer[];
  fallbackImage?: string;
  variant?: "iphone" | "macbook-air";
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

const productTiles: Campaign[] = [
  ipadAirCampaign,
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
  },
  {
    eyebrow: "Visa Card Trading",
    title: "Trade supported cards securely and simply.",
    description: "Send card details for review and confirmation. Buy & Sell GH does not issue payment cards.",
    image: visaCardCampaign,
    imageAlt: "One original unbranded black and gold card for supported card review",
    theme: "warm",
    primaryLabel: "Check a Card",
    primaryTo: "/gift-cards",
    secondaryLabel: "Contact Us",
    secondaryTo: "/contact",
  },
];

const serviceStories = [
  { label: "Upgrade for less", title: "Move into something newer.", image: upgradeSaveArtwork, to: "/sell-or-trade", tone: "light" },
  { label: "Phone Repairs", title: "Let the experts fix it.", image: repairsCampaign, to: "/repairs", tone: "black" },
  { label: "Installment", title: "Own an iPhone today.", image: installmentCampaign, to: "/installment", tone: "black" },
  { label: "Delivery", title: "Pickup and delivery, clearly arranged.", image: accessoriesStory, to: "/shopping-information", tone: "light" },
  { label: "Certified devices", title: "See what just landed.", image: iphone17LineupCampaign, to: "/shop?sort=newest", tone: "black" },
  { label: "Support", title: "Answers when you need them.", image: audioAccessoriesStory, to: "/contact", tone: "black" },
];

export function HomePage() {
  const { activeProducts } = useProductCatalog();
  const latestIphone = useMemo(() => getLatestIphoneLineup(activeProducts, iphone17Story), [activeProducts]);
  const registeredFamilyCampaign = iphoneFamilyCampaigns[latestIphone.generationLabel];
  const latestFamilyCampaign = registeredFamilyCampaign?.requiredSlugs.every((slug) =>
    latestIphone.variants.some((product) => product.slug === slug),
  )
    ? registeredFamilyCampaign
    : undefined;

  const latestIphoneCampaign: Campaign = {
    eyebrow: "Latest iPhone",
    title: latestIphone.featuredName,
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

  return (
    <>
      <SEO title="Premium Tech Store in Accra | Buy & Sell GH" description="Shop original devices and get trusted trade-in, repair, pre-order and customer support from Buy & Sell GH in Accra." />
      <main className="storefront-home">
        <section className="store-human-campaign" aria-labelledby="store-human-campaign-title">
          <div className="store-human-campaign-copy">
            <p className="store-eyebrow">Buy &amp; Sell GH</p>
            <h1 id="store-human-campaign-title">Tech, your way.</h1>
            <p>Buy &amp; Sell GH helps customers buy, sell, trade, repair and upgrade iPhones, iPads, MacBooks, watches and accessories in Accra.</p>
            <div className="store-actions">
              <Link className="store-button store-button-primary" to="/shop">Shop now</Link>
              <Link className="store-button store-button-secondary" to="/about">Learn more</Link>
            </div>
          </div>
          <CampaignVideo />
        </section>

        <ProductLaunch campaign={latestIphoneCampaign} />
        <ProductLaunch campaign={macbookAirCampaign} />

        <section className="store-product-grid" aria-label="Featured product families">
          {productTiles.map((campaign) => <ProductTile campaign={campaign} key={campaign.eyebrow} />)}
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

function CampaignVideo() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() => (
    typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches
  ));

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setPrefersReducedMotion(mediaQuery.matches);

    updatePreference();
    mediaQuery.addEventListener("change", updatePreference);
    return () => mediaQuery.removeEventListener("change", updatePreference);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || prefersReducedMotion) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        void video.play().catch(() => undefined);
      } else {
        video.pause();
      }
    }, { threshold: 0.18 });

    observer.observe(video);
    return () => observer.disconnect();
  }, [prefersReducedMotion]);

  if (prefersReducedMotion) {
    return (
      <div className="store-campaign-video-frame store-campaign-video-poster" role="img" aria-label="Cinematic Buy & Sell GH device campaign">
        <img src={techYourWayPoster} alt="" aria-hidden="true" loading="eager" decoding="async" fetchPriority="high" />
      </div>
    );
  }

  return (
    <div className="store-campaign-video-frame" aria-label="Cinematic Buy & Sell GH device campaign">
      <video
        ref={videoRef}
        className="store-campaign-video"
        autoPlay
        muted
        loop
        onTimeUpdate={(event) => {
          const video = event.currentTarget;
          if (video.currentTime >= CAMPAIGN_VIDEO_SAFE_LOOP_END_SECONDS) {
            video.currentTime = 0.05;
          }
        }}
        playsInline
        preload="metadata"
        poster={techYourWayPoster}
        aria-label="Cinematic Buy & Sell GH device campaign video"
      >
        <source src={techYourWayVideo} type="video/mp4" />
        <img src={techYourWayPoster} alt="Cinematic Buy & Sell GH device campaign" loading="eager" decoding="async" fetchPriority="high" />
      </video>
    </div>
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
