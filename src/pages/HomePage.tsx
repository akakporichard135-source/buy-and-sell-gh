import { ArrowRight, BadgeCheck, ChevronRight, RefreshCcw, ShieldCheck, Truck } from "lucide-react";
import { Children, cloneElement, isValidElement, useEffect, useMemo, useRef } from "react";
import type { ReactElement, ReactNode } from "react";
import type { Product } from "../types/product";
import { Link } from "react-router-dom";
import { useProductCatalog } from "../catalog/ProductCatalogContext";
import { isProductPurchasable } from "../catalog/productCatalog";
import { SEO } from "../components/SEO";
import "../styles/homepage-surfaces.css";
import "../styles/homepage-campaigns.css";
import "../styles/homepage-video-showcase.css";
import ipadAirCampaignArt from "../assets/homepage/homepage-ipad-air-white.webp";
import macbookAirCampaignArt from "../assets/homepage/homepage-macbook-air-premium-v2.jpg";
import macbookAirM5Cutout from "../assets/homepage/homepage-macbook-air-m5-cutout.webp";
import macbookProCampaignArt from "../assets/homepage/homepage-macbook-pro-cinematic.webp";
import macbookProM5Cutout from "../assets/homepage/homepage-macbook-pro-m5-cutout.webp";
import moreStoreInstallmentArtwork from "../assets/homepage/more-store-installment-owner.png";
import moreStoreRepairsArtwork from "../assets/homepage/more-store-repairs-owner.png";
import moreStoreSellCashArtwork from "../assets/homepage/more-store-sell-cash-owner.png";
import moreStoreUpgradeArtwork from "../assets/homepage/more-store-upgrade-owner.png";
import visaCardCampaign from "../assets/homepage/homepage-visa-card-white.webp";
import { campaignAssets } from "../catalog/campaignAssets";

import { getLatestMacLaunch } from "../utils/latestMac";
import type { LatestMacLaunch } from "../utils/latestMac";

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
  eyebrow: "Fresh. Powerful. Colourful.",
  title: "iPad Air",
  description: "Made for work, study, creativity and everything in between.",
  image: ipadAirCampaignArt,
  imageAlt: "iPad Air in a layered premium product presentation",
  theme: "light",
  primaryLabel: "Learn more",
  primaryTo: "/ipad/ipad-air",
  secondaryLabel: "Shop now",
  secondaryTo: "/shop/buy-ipad/ipad-air",
};

const visaTradingCampaign: Campaign = {
  eyebrow: "Visa Card Trading",
  title: "Turn supported Visa cards into value.",
  description: "Send card details for review and confirmation. Buy & Sell GH does not issue payment cards.",
  image: visaCardCampaign,
  imageAlt: "One original unbranded black and gold card for supported card review",
  theme: "light",
  primaryLabel: "Check a Card",
  primaryTo: "/gift-cards",
  secondaryLabel: "Contact Us",
  secondaryTo: "/contact",
};

const topCampaigns: Campaign[] = [
  {
    eyebrow: "A new way to unfold",
    title: "iPhone Duo",
    description: "Open up more room for everything you do.",
    image: "/products/homepage/iphone-duo.webp",
    imageAlt: campaignAssets.duo.hero.alt,
    theme: "light",
    primaryLabel: "Learn more",
    primaryTo: "/iphone/iphone-duo",
    secondaryLabel: "View pricing",
    secondaryTo: "/shop/buy-iphone/iphone-duo",
  },
  {
    eyebrow: "Everyday momentum",
    title: "Apple Watch Series 12",
    description: "Stay connected to what moves you.",
    image: "/products/homepage/watch-series-12.webp",
    fallbackImage: campaignAssets.watch.series12.fallback,
    imageAlt: campaignAssets.watch.series12.alt,
    theme: "light",
    primaryLabel: "Learn more",
    primaryTo: "/watch/apple-watch-series-12",
    secondaryLabel: "View pricing",
    secondaryTo: "/shop/buy-watch/apple-watch-series-12",
  },
];

const productTiles: Campaign[] = [
  ipadAirCampaign,
  visaTradingCampaign,
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
    ? createMacCampaign(latestMacbookAir, "A light, capable Mac for work, study and everyday creativity.", "light", macbookAirCampaignArt, "macbook-air", {
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
  const featuredMacbookCampaigns = [featuredMacbookAirCampaign, featuredMacbookProCampaign]
    .filter((campaign): campaign is Campaign => campaign !== null);

  return (
    <>
      <SEO title="Premium Tech Store in Accra | Buy & Sell GH" description="Shop original devices and get trusted trade-in, repair, pre-order and customer support from Buy & Sell GH in Accra." />
      <main className="storefront-home">
        <Iphone18Hero />
        {topCampaigns.map((campaign) => <ProductCampaign campaign={campaign} key={campaign.title} top />)}
        <UltraAirpodsStory />
        <ProductFamilyStrip />

        {featuredMacbookCampaigns.length > 0 && (
          <CampaignPair campaigns={featuredMacbookCampaigns} label="MacBook Air and MacBook Pro" className="home-product-pair-macbooks" />
        )}
        <CampaignPair campaigns={productTiles} label="iPad Air and Visa Card Trading" className="home-product-pair-ipad-visa" />

        <StoreRail eyebrow="Services" title="More from our store." description="Explore more ways to upgrade, sell and get support." className="service-story-rail" id="more-from-store">
          {serviceStories.map((story) => (
            <Link className={`service-story-card service-story-${story.tone}`} to={story.to} key={story.label}>
              <div><span>{story.label}</span><strong>{story.title}</strong><p>{story.description}</p></div>
              <img src={story.image} alt={`${story.label} from Buy & Sell GH`} loading="lazy" decoding="async" />
              <small>Learn more <ChevronRight size={14} /></small>
            </Link>
          ))}
        </StoreRail>
        <PremiumTrustStrip />

      </main>
    </>
  );
}

function Iphone18Hero() {
  return (
    <section className="iphone18-hero" aria-labelledby="iphone18-hero-headline">
      <div className="iphone18-hero-copy">
        <p className="store-eyebrow">A new era of Pro</p>
        <h1 id="iphone18-hero-headline">iPhone 18 Pro</h1>
        <p className="iphone18-hero-subtitle">Pro further.</p>
        <div className="iphone18-hero-actions">
          <Link className="store-button store-button-primary" to="/iphone/iphone-18-pro">Learn more</Link>
          <Link className="store-button store-button-secondary" to="/shop/buy-iphone/iphone-18-pro">View pricing</Link>
        </div>
      </div>
      <div className="iphone18-hero-media">
        <picture>
          <source type="image/webp" srcSet="/products/homepage/iphone-18-pro-hero.webp 1x, /products/homepage/iphone-18-pro-hero-2x.webp 2x" />
          <img
            src="/products/homepage/iphone-18-pro-hero-original.jpg"
            alt="iPhone 18 Pro with chrome PRO visual"
            className="iphone18-hero-img"
            loading="eager"
            fetchPriority="high"
            decoding="async"
            width={736}
            height={414}
            onError={(event) => {
              if (campaignAssets.iphone18.hero.fallback && !event.currentTarget.dataset.fallbackApplied) {
                event.currentTarget.dataset.fallbackApplied = "true";
                event.currentTarget.src = campaignAssets.iphone18.hero.fallback;
              }
            }}
          />
        </picture>
      </div>
    </section>
  );
}

function UltraAirpodsStory() {
  return (
    <section className="ultra-airpods-story" aria-label="Apple Watch Ultra 4 and AirPods 5">
      <article className="ultra-airpods-panel ultra-airpods-ultra" aria-labelledby="ultra-story-title">
        <div className="ultra-airpods-copy">
          <p className="store-eyebrow">Built for beyond</p>
          <h2 id="ultra-story-title">Apple Watch Ultra 4</h2>
          <span>Rugged capability. Precision without compromise.</span>
          <div className="ultra-airpods-actions">
            <Link className="store-button store-button-primary" to="/watch/apple-watch-ultra-4">Learn more</Link>
            <Link className="store-button store-button-secondary" to="/shop/buy-watch/apple-watch-ultra-4">View pricing</Link>
          </div>
        </div>
        <img
          src="/products/homepage/watch-ultra-4.webp"
          alt={campaignAssets.watch.ultraHero.alt}
          loading="lazy"
          decoding="async"
          onError={(event) => {
            if (campaignAssets.watch.ultraHero.fallback && !event.currentTarget.dataset.fallbackApplied) {
              event.currentTarget.dataset.fallbackApplied = "true";
              event.currentTarget.src = campaignAssets.watch.ultraHero.fallback;
            }
          }}
        />
      </article>
      <article className="ultra-airpods-panel ultra-airpods-lifestyle" aria-labelledby="airpods-story-title">
        <div className="ultra-airpods-copy">
          <p className="store-eyebrow">Move with your music</p>
          <h2 id="airpods-story-title">AirPods 5</h2>
          <span>Freedom to listen wherever the rhythm takes you.</span>
          <div className="ultra-airpods-actions">
            <Link className="store-button store-button-primary" to="/airpods/airpods-5">Learn more</Link>
            <Link className="store-button store-button-secondary" to="/shop/buy-airpods/airpods-5">View pricing</Link>
          </div>
        </div>
        <img
          src="/products/homepage/airpods-5-lifestyle.webp"
          alt={campaignAssets.airpods.lifestyle.alt}
          loading="lazy"
          decoding="async"
          onError={(event) => {
            if (campaignAssets.airpods.lifestyle.fallback && !event.currentTarget.dataset.fallbackApplied) {
              event.currentTarget.dataset.fallbackApplied = "true";
              event.currentTarget.src = campaignAssets.airpods.lifestyle.fallback;
            }
          }}
        />
      </article>
    </section>
  );
}

function ProductFamilyStrip() {
  const families = [
    { label: "iPhone", to: "/iphone", iconSrc: "/products/campaigns/iphone-18-pro-front.webp" },
    { label: "Mac", to: "/mac", iconSrc: "/products/campaigns/macbook-air-floating.webp" },
    { label: "iPad", to: "/ipad", iconSrc: "/products/campaigns/ipad-air-colors.webp" },
    { label: "Watch", to: "/watch", iconSrc: "/products/homepage/watch-series-12.webp" },
    { label: "AirPods", to: "/airpods", iconSrc: "/products/campaigns/airpods-5-product.webp" },
    { label: "Accessories", to: "/accessories", iconSrc: "/products/campaigns/accessory-belkin-3-in-1.webp" },
  ];

  return (
    <section className="home-family-strip" aria-label="Explore Apple product families">
      <div className="home-family-strip-inner">
        {families.map((item) => (
          <Link to={item.to} key={item.label} className="home-family-chip">
            <div className="home-family-thumb">
              <img src={item.iconSrc} alt="" loading="lazy" decoding="async" />
            </div>
            <span>{item.label}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}

function PremiumTrustStrip() {
  return (
    <section className="premium-trust-strip" aria-label="Buy and Sell GH customer benefits">
      <div className="premium-trust-strip-inner">
        <TrustPoint icon={<BadgeCheck aria-hidden="true" />} title="Clear Availability" description="Stock and enquiry products are labelled separately." />
        <TrustPoint icon={<ShieldCheck aria-hidden="true" />} title="Order Review" description="Details are reviewed before payment instructions." />
        <TrustPoint icon={<Truck aria-hidden="true" />} title="Pickup & Delivery" description="Final arrangements are confirmed directly." />
        <TrustPoint icon={<RefreshCcw aria-hidden="true" />} title="Trade-In Available" description="Upgrade using your current device." />
      </div>
    </section>
  );
}

function TrustPoint({ icon, title, description }: { icon: ReactNode; title: string; description: string }) {
  return (
    <div className="premium-trust-point">
      <span className="premium-trust-icon">{icon}</span>
      <span><strong>{title}</strong><small>{description}</small></span>
    </div>
  );
}

function ProductCampaign({ campaign, top = false, priority = false }: { campaign: Campaign; top?: boolean; priority?: boolean }) {
  const sectionRef = useRef<HTMLElement>(null);
  const slug = slugify(campaign.title);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    if (!window.IntersectionObserver) {
      section.classList.add("is-visible");
      return;
    }
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      section.classList.add("is-visible");
      observer.disconnect();
    }, { threshold: 0.12 });
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className={`home-product-campaign home-product-campaign-${campaign.theme} home-product-campaign-${slug}${top ? " home-product-campaign-top" : ""}`} aria-labelledby={`home-campaign-${slug}`}>
      <div className="home-product-campaign-copy">
        <p className="store-eyebrow">{campaign.eyebrow}</p>
        <h2 id={`home-campaign-${slug}`}>{campaign.title}</h2>
        <p>{campaign.description}</p>
        {campaign.availabilityText && <p className="store-launch-availability">{campaign.availabilityText}</p>}
        <div className="store-actions">
          <Link className="store-button store-button-primary" to={campaign.primaryTo}>{campaign.primaryLabel}</Link>
          {campaign.secondaryLabel && campaign.secondaryTo && <Link className="store-button store-button-secondary" to={campaign.secondaryTo}>{campaign.secondaryLabel}</Link>}
        </div>
      </div>
      <div className="home-product-campaign-art">
        <img
          src={campaign.image}
          alt={campaign.imageAlt}
          loading={priority ? "eager" : "lazy"}
          fetchPriority={priority ? "high" : undefined}
          decoding="async"
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

function CampaignPair({ campaigns, label, className }: { campaigns: Campaign[]; label: string; className: string }) {
  return (
    <div className={`home-product-pair ${className}${campaigns.length === 1 ? " home-product-pair-single" : ""}`} role="group" aria-label={label}>
      {campaigns.map((campaign) => <ProductCampaign campaign={campaign} key={campaign.title} />)}
    </div>
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
    primaryTo: variant === "macbook-air" ? "/mac/macbook-air" : "/mac/macbook-pro",
    secondaryLabel: "Shop now",
    secondaryTo: variant === "macbook-air" ? "/shop/buy-mac/macbook-air" : "/shop/buy-mac/macbook-pro",
    fallbackImage,
    variant,
  };
}

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}


