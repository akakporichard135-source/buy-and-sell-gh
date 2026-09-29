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
import moreStoreInstallmentArtwork from "../assets/homepage/more-store-installment-owner.png";
import moreStoreRepairsArtwork from "../assets/homepage/more-store-repairs-owner.png";
import moreStoreSellCashArtwork from "../assets/homepage/more-store-sell-cash-owner.png";
import moreStoreUpgradeArtwork from "../assets/homepage/more-store-upgrade-owner.png";
import visaCardCampaign from "../assets/homepage/homepage-visa-card-white.webp";
import { campaignAssets } from "../catalog/campaignAssets";

import { getLatestMacLaunch } from "../utils/latestMac";

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
  image: "/products/homepage/ipad-air.jpg",
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
    secondaryLabel: "Buy",
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
    secondaryLabel: "Buy",
    secondaryTo: "/shop/buy-watch/apple-watch-series-12",
  },
];

const productTiles: Campaign[] = [
  ipadAirCampaign,
  visaTradingCampaign,
];

const serviceStories = [
  {
    label: "Installment",
    title: "Own an iPhone today.",
    description: "Review current requirements before sending your request.",
    image: moreStoreInstallmentArtwork,
    to: "/installment",
    tone: "black",
  },
  {
    label: "Repairs",
    title: "Let the experts fix it.",
    description: "Support for phones, laptops and game consoles.",
    image: moreStoreRepairsArtwork,
    to: "/repairs",
    tone: "black",
  },
  {
    label: "Upgrade & Save",
    title: "Move into something newer.",
    description: "Trade or swap your current device toward your next upgrade.",
    image: moreStoreUpgradeArtwork,
    to: "/sell-or-trade?mode=upgrade",
    tone: "light",
  },
];

export function HomePage() {
  const { activeProducts } = useProductCatalog();
  const latestMacbookAir = useMemo(() => getLatestMacLaunch(activeProducts, "MacBook Air"), [activeProducts]);

  const featuredMacbookAirCampaign: Campaign = {
    eyebrow: latestMacbookAir ? `${latestMacbookAir.generation} · MacBook Air` : "MacBook Air",
    title: "MacBook Air",
    description: "A light, capable Mac for work, study and everyday creativity.",
    availabilityText: latestMacbookAir ? getLaunchAvailability(latestMacbookAir.variants, latestMacbookAir.featuredProduct.name) : undefined,
    image: "/products/homepage/macbook-air.jpg",
    imageAlt: "MacBook Air in an ultra-thin opening profile",
    theme: "light",
    primaryLabel: "Learn more",
    primaryTo: "/mac/macbook-air",
    secondaryLabel: "Shop now",
    secondaryTo: "/shop/buy-mac/macbook-air",
    variant: "macbook-air",
  };

  const macMiniCampaign: Campaign = {
    eyebrow: "All-new",
    title: "Mac mini",
    description: "Now with M6 and M5 Pro.",
    image: "/products/homepage/mac-mini-device.jpg",
    fallbackImage: "/products/homepage/mac-mini.jpg",
    imageAlt: "Mac mini with M6 and M5 Pro held in hand",
    theme: "light",
    primaryLabel: "Learn more",
    primaryTo: "/mac-mini",
    secondaryLabel: "Buy",
    secondaryTo: "/shop?category=Macs",
  };

  const featuredMacCampaigns = [featuredMacbookAirCampaign, macMiniCampaign];

  return (
    <>
      <SEO title="Premium Tech Store in Accra | Buy & Sell GH" description="Shop original devices and get trusted trade-in, repair, pre-order and customer support from Buy & Sell GH in Accra." />
      <main className="storefront-home">
        <Iphone18Hero />
        {topCampaigns.map((campaign) => <ProductCampaign campaign={campaign} key={campaign.title} top />)}
        <UltraAirpodsStory />

        <CampaignPair campaigns={featuredMacCampaigns} label="MacBook Air and Mac mini" className="home-product-pair-macbooks" />
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
          <Link className="store-button store-button-secondary" to="/shop/buy-iphone/iphone-18-pro">Buy</Link>
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
            height={225}
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
            <Link className="store-button store-button-secondary" to="/shop/buy-watch/apple-watch-ultra-4">Buy</Link>
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
      <article className="ultra-airpods-panel ultra-airpods-lifestyle" aria-labelledby="airpods-story-title" id="airpods-5">
        <div className="ultra-airpods-copy">
          <p className="store-eyebrow">Move with your music</p>
          <h2 id="airpods-story-title">AirPods 5</h2>
          <span>Freedom to listen wherever the rhythm takes you.</span>
          <div className="ultra-airpods-actions">
            <Link className="store-button store-button-primary" to="/airpods/airpods-5">Learn more</Link>
            <Link className="store-button store-button-secondary" to="/shop/buy-airpods/airpods-5">Buy</Link>
          </div>
        </div>
        <div className="ultra-airpods-lifestyle-media">
          <img
            src="/products/homepage/airpods-5.webp"
            alt="AirPods 5 wireless earbuds with open charging case"
            className="ultra-airpods-lifestyle-img"
            width={590}
            height={610}
            loading="eager"
            decoding="async"
          />
        </div>
      </article>
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
      </div>
    </section>
  );
}

function getLaunchAvailability(products: Product[], fallbackName: string) {
  const purchasableProduct = products.find(isProductPurchasable);
  if (purchasableProduct) return `${purchasableProduct.name} is available now while stock lasts.`;
  return `${fallbackName} is available for enquiry. Final availability is confirmed by Buy & Sell GH.`;
}

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}


