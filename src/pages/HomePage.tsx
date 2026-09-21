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
  primaryTo: "/ipads?family=iPad%20Air",
  secondaryLabel: "Shop now",
  secondaryTo: "/shop?category=iPads",
};

const topCampaigns: Campaign[] = [
  {
    eyebrow: "A new way to unfold",
    title: "iPhone Duo",
    description: "Open up more room for everything you do.",
    image: "/products/homepage/iphone-duo.webp",
    imageAlt: "An open premium foldable phone held naturally in two hands",
    theme: "light",
    primaryLabel: "Learn more",
    primaryTo: "/iphones",
    secondaryLabel: "View pricing",
    secondaryTo: "/pre-order?model=iPhone%20Duo",
  },
  {
    eyebrow: "Everyday momentum",
    title: "Apple Watch Series 12",
    description: "Stay connected to what moves you.",
    image: "/products/homepage/watch-series-12.webp",
    imageAlt: "Original concept rendering of a rectangular everyday smartwatch",
    theme: "black",
    primaryLabel: "Learn more",
    primaryTo: "/apple-watch",
    secondaryLabel: "View pricing",
    secondaryTo: "/pre-order?model=Apple%20Watch%20Series%2012",
  },
];

const productTiles: Campaign[] = [
  ipadAirCampaign,
  {
    eyebrow: "Big ideas. Pro power.",
    title: "iPad Pro",
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

  return (
    <>
      <SEO title="Premium Tech Store in Accra | Buy & Sell GH" description="Shop original devices and get trusted trade-in, repair, pre-order and customer support from Buy & Sell GH in Accra." />
      <main className="storefront-home">
        <Iphone18Hero />
        {topCampaigns.map((campaign) => <ProductCampaign campaign={campaign} key={campaign.title} top />)}
        <UltraAirpodsStory />

        {featuredMacbookAirCampaign && <ProductCampaign campaign={featuredMacbookAirCampaign} />}
        {featuredMacbookProCampaign && <ProductCampaign campaign={featuredMacbookProCampaign} />}
        {productTiles.map((campaign) => <ProductCampaign campaign={campaign} key={campaign.title} />)}
        <VisaTradingCampaign />

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
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const loopStart = 0.08;
    const loopEnd = 3.96;
    const reducedMotionFrame = 2.75;
    const playbackRate = 0.82;
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let resetTimer: number | undefined;
    let revealTimer: number | undefined;
    let isResetting = false;

    const syncPlayback = () => {
      window.clearTimeout(resetTimer);
      window.clearTimeout(revealTimer);
      isResetting = false;
      video.classList.remove("is-loop-resetting");
      video.playbackRate = playbackRate;
      video.currentTime = motionQuery.matches ? reducedMotionFrame : loopStart;
      if (motionQuery.matches) {
        video.pause();
        return;
      }
      void video.play().catch(() => {});
    };

    const restartProductSequence = () => {
      if (motionQuery.matches || isResetting || video.currentTime < loopEnd) return;
      isResetting = true;
      video.classList.add("is-loop-resetting");
      video.pause();

      resetTimer = window.setTimeout(() => {
        const reveal = () => {
          if (!isResetting) return;
          window.clearTimeout(revealTimer);
          video.classList.remove("is-loop-resetting");
          video.playbackRate = playbackRate;
          isResetting = false;
          void video.play().catch(() => {});
        };

        video.addEventListener("seeked", reveal, { once: true });
        video.currentTime = loopStart;
        revealTimer = window.setTimeout(reveal, 450);
      }, 220);
    };

    video.addEventListener("loadedmetadata", syncPlayback);
    video.addEventListener("timeupdate", restartProductSequence);
    if (video.readyState >= 1) syncPlayback();
    motionQuery.addEventListener("change", syncPlayback);
    return () => {
      window.clearTimeout(resetTimer);
      window.clearTimeout(revealTimer);
      video.removeEventListener("loadedmetadata", syncPlayback);
      video.removeEventListener("timeupdate", restartProductSequence);
      motionQuery.removeEventListener("change", syncPlayback);
    };
  }, []);

  return (
    <section className="iphone18-launch-hero" aria-labelledby="iphone18-launch-title">
      <div className="iphone18-launch-copy">
        <p>A new era of Pro</p>
        <h1 id="iphone18-launch-title">iPhone 18 Pro</h1>
        <span>Bold by design. Built to go further.</span>
        <div className="iphone18-launch-actions">
          <Link to="/iphones">Learn more</Link>
          <Link to="/pre-order?model=iPhone%2018%20Pro">View pricing</Link>
        </div>
      </div>
      <strong className="iphone18-launch-pro" aria-hidden="true">PRO</strong>
      <span className="iphone18-source-mask" aria-hidden="true" />
      <video
        ref={videoRef}
        className="iphone18-launch-video"
        autoPlay
        muted
        playsInline
        preload="auto"
        aria-label="iPhone 18 Pro cinematic product film"
      >
        <source src="/videos/homepage/iphone-18-pro.mp4" type="video/mp4" />
      </video>
    </section>
  );
}

function UltraAirpodsStory() {
  return (
    <section className="ultra-airpods-story" aria-label="Apple Watch Ultra 4 and AirPods 5">
      <article className="ultra-airpods-panel ultra-airpods-ultra" aria-labelledby="ultra-story-title">
        <div className="ultra-airpods-copy">
          <p>Built for beyond</p>
          <h2 id="ultra-story-title">Apple Watch Ultra 4</h2>
          <span>Rugged capability. Precision without compromise.</span>
          <div className="ultra-airpods-actions">
            <Link to="/apple-watch">Learn more</Link>
            <Link to="/pre-order?model=Apple%20Watch%20Ultra%204">View pricing</Link>
          </div>
        </div>
        <img src="/products/homepage/watch-ultra-4.webp" alt="Original concept rendering of a rugged titanium smartwatch with an orange band" loading="lazy" decoding="async" />
      </article>
      <article className="ultra-airpods-panel ultra-airpods-lifestyle" aria-labelledby="airpods-story-title">
        <div className="ultra-airpods-copy">
          <p>Move with your music</p>
          <h2 id="airpods-story-title">AirPods 5</h2>
          <span>Freedom to listen wherever the rhythm takes you.</span>
          <div className="ultra-airpods-actions">
            <Link to="/airpods">Learn more</Link>
            <Link to="/pre-order?model=AirPods%205">View pricing</Link>
          </div>
        </div>
        <img src="/products/homepage/airpods-5-lifestyle.webp" alt="A woman enjoying music with a white wireless earbud" loading="lazy" decoding="async" />
      </article>
    </section>
  );
}

function PremiumTrustStrip() {
  return (
    <section className="premium-trust-strip" aria-label="Buy and Sell GH customer benefits">
      <div className="premium-trust-strip-inner">
        <TrustPoint icon={<BadgeCheck aria-hidden="true" />} title="Original Devices" description="Genuine and carefully verified devices." />
        <TrustPoint icon={<ShieldCheck aria-hidden="true" />} title="Warranty Support" description="Support after your purchase." />
        <TrustPoint icon={<Truck aria-hidden="true" />} title="Secure Delivery" description="Reliable delivery across supported locations." />
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

function VisaTradingCampaign() {
  return (
    <section className="home-product-campaign home-product-campaign-light home-product-campaign-visa" aria-labelledby="home-visa-title">
      <div className="home-product-campaign-copy">
        <p className="store-eyebrow">Visa Card Trading</p>
        <h2 id="home-visa-title">Turn supported Visa cards into value.</h2>
        <p>Send card details for review and confirmation. Buy &amp; Sell GH does not issue payment cards.</p>
        <div className="store-actions">
          <Link className="store-button store-button-primary" to="/gift-cards">Check a Card</Link>
          <Link className="store-button store-button-secondary" to="/contact">Contact Us</Link>
        </div>
      </div>
      <div className="home-product-campaign-art home-product-campaign-visa-art">
        <img src={visaCardCampaign} alt="One original unbranded black and gold card for supported card review" loading="lazy" decoding="async" />
      </div>
    </section>
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


