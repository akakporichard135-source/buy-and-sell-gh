import { ArrowRight, ChevronRight } from "lucide-react";
import { Children, cloneElement, isValidElement, useEffect, useMemo, useRef } from "react";
import type { ReactElement, ReactNode } from "react";
import type { Product } from "../types/product";
import { Link } from "react-router-dom";
import { useProductCatalog } from "../catalog/ProductCatalogContext";
import { isProductPurchasable } from "../catalog/productCatalog";
import { SEO } from "../components/SEO";
import { NewMacLaunchCampaign } from "../components/NewMacLaunchCampaign";
import { IphoneCinematicShowcase } from "../components/IphoneCinematicShowcase";
import "../styles/homepage-surfaces.css";
import "../styles/iphone-showcase.css";
import macMiniWhiteArtwork from "../assets/homepage/homepage-mac-mini-white.webp";
import appleWatchCampaignArt from "../assets/homepage/homepage-apple-watch-white.webp";
import ipadAirCampaignArt from "../assets/homepage/homepage-ipad-air-white.webp";
import ipadProCampaignArt from "../assets/homepage/homepage-ipad-pro-cinematic.webp";
import macbookAirCampaignArt from "../assets/homepage/homepage-macbook-air-premium-v2.jpg";
import macbookAirM5Cutout from "../assets/homepage/homepage-macbook-air-m5-cutout.webp";
import macbookProCampaignArt from "../assets/homepage/homepage-macbook-pro-cinematic.webp";
import macbookProM5Cutout from "../assets/homepage/homepage-macbook-pro-m5-cutout.webp";
import moreStoreInstallmentArtwork from "../assets/homepage/more-store-installment-owner.png";
import moreStoreRepairsArtwork from "../assets/homepage/more-store-repairs-owner.png";
import moreStoreSellCashArtwork from "../assets/homepage/more-store-sell-cash-owner.png";
import moreStoreUpgradeArtwork from "../assets/homepage/more-store-upgrade-owner.png";
import visaCardCampaign from "../assets/homepage/homepage-visa-card-white.webp";

import { getLatestMacLaunch } from "../utils/latestMac";
import type { LatestMacLaunch } from "../utils/latestMac";
import { newMacLaunches } from "../data/newMacLaunches";

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
  fallbackImage?: string;
  variant?: "macbook-air" | "macbook-pro";
  showImage?: boolean;
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
    imageAlt: "Apple Watch with its screen on against a clean white background",
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
];

const serviceStories = [
  { label: "Upgrade & Save", title: "Move into something newer.", description: "Trade or swap your current device toward your next upgrade.", image: moreStoreUpgradeArtwork, to: "/sell-or-trade?mode=upgrade", tone: "light" },
  { label: "Sell for Cash", title: "Sell your old device.", description: "Request an assessment and confirm the next step with our team.", image: moreStoreSellCashArtwork, to: "/sell-or-trade?mode=sell", tone: "light" },
  { label: "Installment", title: "Own an iPhone today.", description: "Review current requirements before sending your request.", image: moreStoreInstallmentArtwork, to: "/installment", tone: "black" },
  { label: "Repairs", title: "Let the experts fix it.", description: "Support for phones, laptops and game consoles.", image: moreStoreRepairsArtwork, to: "/repairs", tone: "black" },
];

export function HomePage() {
  const { activeProducts } = useProductCatalog();
  const latestMacbookAir = useMemo(() => getLatestMacLaunch(activeProducts, "MacBook Air"), [activeProducts]);
  const latestMacbookPro = useMemo(() => getLatestMacLaunch(activeProducts, "MacBook Pro"), [activeProducts]);

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
        <IphoneCinematicShowcase products={activeProducts} priority />
        <NewMacLaunchCampaign launch={{ ...newMacLaunches["mac-mini"], image: macMiniWhiteArtwork }} />
        <NewMacLaunchCampaign launch={newMacLaunches["mac-studio"]} />

        {(featuredMacbookAirCampaign || featuredMacbookProCampaign) && (
          <section className="store-feature-grid store-macbook-grid" aria-label="Featured MacBook lineup">
            {featuredMacbookAirCampaign && <ProductLaunch campaign={featuredMacbookAirCampaign} />}
            {featuredMacbookProCampaign && <ProductLaunch campaign={featuredMacbookProCampaign} />}
          </section>
        )}

        <section className="store-product-grid" aria-label="Featured product families">
          {productTiles.map((campaign) => <ProductTile campaign={campaign} key={campaign.eyebrow} />)}
          <VisaTradingTile />
        </section>

        <StoreRail eyebrow="Services" title="More from our store." description="Explore more ways to upgrade, sell and get support." className="service-story-rail" id="more-from-store">
          {serviceStories.map((story) => (
            <Link className={`service-story-card service-story-${story.tone}`} to={story.to} key={story.label}>
              <div><span>{story.label}</span><strong>{story.title}</strong><p>{story.description}</p></div>
              <img src={story.image} alt={`${story.label} from Buy & Sell GH`} loading="lazy" decoding="async" />
              <small>Learn more <ChevronRight size={14} /></small>
            </Link>
          ))}
        </StoreRail>

      </main>
    </>
  );
}

function VisaTradingTile() {
  return (
    <article className="store-product-tile store-product-warm store-product-visa-card-trading">
      <div className="store-tile-copy">
        <p className="store-eyebrow">Visa Card Trading</p>
        <h2>Turn supported Visa cards into value.</h2>
        <p>Send card details for review and confirmation. Buy &amp; Sell GH does not issue payment cards.</p>
        <div className="store-actions">
          <Link className="store-button store-button-primary" to="/gift-cards">Check a Card</Link>
          <Link className="store-button store-button-secondary" to="/contact">Contact Us</Link>
        </div>
      </div>
      <div className="store-visa-tile-art">
        <img src={visaCardCampaign} alt="One original unbranded black and gold card for supported card review" loading="lazy" decoding="async" />
      </div>
    </article>
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
      </div>
    </section>
  );
}

function ProductTile({ campaign }: { campaign: Campaign }) {
  const shouldShowImage = campaign.showImage !== false;
  const isAppleWatch = campaign.eyebrow === "Apple Watch";
  const isIpadAir = campaign.eyebrow === "iPad Air";
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
      {shouldShowImage && (isAppleWatch ? (
        <div className="store-watch-visual">
          <img src={campaign.image} alt={campaign.imageAlt} loading="lazy" decoding="async" />
          <span className="store-watch-screen-motion" aria-hidden="true" />
        </div>
      ) : isIpadAir ? (
        <div className="store-ipad-air-scene">
          <img src={campaign.image} alt={campaign.imageAlt} loading="lazy" decoding="async" />
          <span className="store-ipad-air-light" aria-hidden="true" />
        </div>
      ) : (
        <img src={campaign.image} alt={campaign.imageAlt} loading="lazy" decoding="async" />
      ))}
    </article>
  );
}

function StoreRail({ eyebrow, title, description, className, children, id }: { eyebrow: string; title: string; description: string; className: string; children: ReactNode; id?: string }) {
  const railRef = useRef<HTMLDivElement>(null);
  const railItems = Children.toArray(children);
  const wraparoundItem = railItems[0];

  useEffect(() => {
    const rail = railRef.current;
    if (!rail || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let intervalId = 0;
    let resumeId = 0;
    let paused = false;

    const start = () => {
      window.clearInterval(intervalId);
      intervalId = window.setInterval(() => {
        if (paused || document.hidden) return;
        const cards = Array.from(rail.children) as HTMLElement[];
        if (cards.length < 2 || rail.scrollWidth <= rail.clientWidth) return;
        const step = cards[1].offsetLeft - cards[0].offsetLeft;
        const wraparoundCard = cards.find((card) => card.dataset.railWraparound === "true");
        if (wraparoundCard && rail.scrollLeft >= wraparoundCard.offsetLeft - 4) {
          rail.scrollTo({ left: 0, behavior: "auto" });
        }
        const maxScroll = rail.scrollWidth - rail.clientWidth;
        const nextLeft = Math.min(rail.scrollLeft + step, maxScroll);
        rail.scrollTo({ left: nextLeft, behavior: "smooth" });
      }, 5200);
    };

    const pause = () => {
      paused = true;
      window.clearInterval(intervalId);
      window.clearTimeout(resumeId);
    };
    const resume = () => {
      window.clearTimeout(resumeId);
      resumeId = window.setTimeout(() => {
        paused = false;
        start();
      }, 1800);
    };
    const handleVisibility = () => {
      if (document.hidden) pause();
      else resume();
    };

    rail.addEventListener("pointerenter", pause);
    rail.addEventListener("pointerleave", resume);
    rail.addEventListener("pointerdown", pause);
    rail.addEventListener("pointerup", resume);
    rail.addEventListener("touchstart", pause, { passive: true });
    rail.addEventListener("touchend", resume, { passive: true });
    rail.addEventListener("focusin", pause);
    rail.addEventListener("focusout", resume);
    document.addEventListener("visibilitychange", handleVisibility);
    start();

    return () => {
      window.clearInterval(intervalId);
      window.clearTimeout(resumeId);
      rail.removeEventListener("pointerenter", pause);
      rail.removeEventListener("pointerleave", resume);
      rail.removeEventListener("pointerdown", pause);
      rail.removeEventListener("pointerup", resume);
      rail.removeEventListener("touchstart", pause);
      rail.removeEventListener("touchend", resume);
      rail.removeEventListener("focusin", pause);
      rail.removeEventListener("focusout", resume);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  return (
    <section id={id} className={`store-rail-section ${className}`} aria-labelledby={`rail-${slugify(title)}`}>
      <div className="store-rail-heading">
        <div><p className="store-eyebrow">{eyebrow}</p><h2 id={`rail-${slugify(title)}`}>{title}</h2></div>
        <span>{description} <ArrowRight size={16} /></span>
      </div>
      <div ref={railRef} className="store-horizontal-rail">
        {railItems}
        {isValidElement(wraparoundItem) && cloneElement(wraparoundItem as ReactElement<{ tabIndex?: number; "aria-hidden"?: boolean; "data-rail-wraparound"?: string }>, {
          "aria-hidden": true,
          "data-rail-wraparound": "true",
          key: "rail-wraparound",
          tabIndex: -1,
        })}
      </div>
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


