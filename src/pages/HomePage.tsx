import { BadgeCheck, ChevronLeft, ChevronRight, RefreshCcw, ShieldCheck, Truck } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import type { Product } from "../types/product";
import { Link } from "react-router-dom";
import { useProductCatalog } from "../catalog/ProductCatalogContext";
import { isProductPurchasable } from "../catalog/productCatalog";
import { SEO } from "../components/SEO";
import "../styles/homepage-surfaces.css";
import "../styles/homepage-campaigns.css";
import "../styles/homepage-video-showcase.css";
import "../styles/homepage-services.css";
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

interface ServiceCardItem {
  id: string;
  title: string;
  concept: string;
  to: string;
  image: string;
  alt: string;
}

const homepageServices: ServiceCardItem[] = [
  {
    id: "installment-payment",
    title: "Installment Payment",
    concept: "Own an iPhone today.",
    to: "/installment",
    image: "/services/installment-payment.png",
    alt: "Installment Payment — Own an iPhone today with Buy & Sell GH verified flexible payment plans",
  },
  {
    id: "repairs",
    title: "Repairs",
    concept: "Let the experts fix it.",
    to: "/repairs",
    image: "/services/repairs.png",
    alt: "Repairs — Let the experts fix it. Fast professional repairs for phones, laptops, and game consoles",
  },
  {
    id: "upgrade-and-save",
    title: "Upgrade & Save",
    concept: "Move into something newer.",
    to: "/sell-or-trade?mode=upgrade",
    image: "/services/upgrade-and-save.png",
    alt: "Upgrade & Save — Move into something newer. Trade or swap your current device toward your next upgrade",
  },
  {
    id: "sell-your-device",
    title: "Sell Your Device",
    concept: "Sell your old device for cash.",
    to: "/sell-or-trade",
    image: "/services/sell-your-device.png",
    alt: "Sell Your Device — Sell your old device for cash with instant valuation and quick payout",
  },
  {
    id: "refer-a-friend",
    title: "Refer a Friend",
    concept: "Refer a friend.",
    to: "/refer-a-friend",
    image: "/services/refer-a-friend.png",
    alt: "Refer a Friend — Refer a friend and earn exclusive rewards from Buy & Sell GH",
  },
];

export function HomePage() {
  const { activeProducts } = useProductCatalog();
  const latestMacbookAir = useMemo(() => getLatestMacLaunch(activeProducts, "MacBook Air"), [activeProducts]);

  const topCampaigns: Campaign[] = useMemo(() => [
    {
      eyebrow: "A new way to unfold",
      title: "iPhone Duo",
      description: "Open up more room for everything you do.",
      image: "/products/homepage/iphone-duo.webp",
      imageAlt: campaignAssets.duo.hero.alt,
      theme: "light",
      primaryLabel: "Learn more",
      primaryTo: "/iphone/iphone-duo",
      secondaryLabel: "View Pricing",
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
  ], []);

  const featuredMacbookAirCampaign: Campaign = useMemo(() => ({
    eyebrow: latestMacbookAir ? `${latestMacbookAir.generation} · MacBook Air` : "MacBook Air",
    title: "MacBook Air",
    description: "A light, capable Mac for work, study and everyday creativity.",
    availabilityText: latestMacbookAir ? getLaunchAvailability(latestMacbookAir.variants, latestMacbookAir.featuredProduct.name) : undefined,
    image: "/products/homepage/macbook-air.jpg",
    imageAlt: "MacBook Air in an ultra-thin opening profile",
    theme: "light",
    primaryLabel: "Learn more",
    primaryTo: "/mac/macbook-air",
    secondaryLabel: "Buy",
    secondaryTo: "/shop/buy-mac/macbook-air",
    variant: "macbook-air",
  }), [latestMacbookAir]);

  const macMiniCampaign: Campaign = useMemo(() => ({
    eyebrow: "All-new",
    title: "Mac mini",
    description: "Now with M6 and M5 Pro.",
    image: "/products/homepage/mac-mini-device.jpg",
    fallbackImage: "/products/homepage/mac-mini.jpg",
    imageAlt: "Mac mini with M6 and M5 Pro held in hand",
    theme: "light",
    primaryLabel: "Learn more",
    primaryTo: "/mac-mini",
    secondaryLabel: "Pre-order",
    secondaryTo: "/shop/buy-mac/mac-mini",
  }), []);

  const ipadAirCampaign: Campaign = useMemo(() => ({
    eyebrow: "Fresh. Powerful. Colourful.",
    title: "iPad Air",
    description: "Made for work, study, creativity and everything in between.",
    image: "/products/homepage/ipad-air.jpg",
    imageAlt: "iPad Air in a layered premium product presentation",
    theme: "light",
    primaryLabel: "Learn more",
    primaryTo: "/ipad/ipad-air",
    secondaryLabel: "Buy",
    secondaryTo: "/shop/buy-ipad/ipad-air",
  }), []);

  const visaTradingCampaign: Campaign = {
    eyebrow: "Buy & Sell GH Service",
    title: "Visa Card Trading",
    description: "Turn supported Visa cards into verified value. Fast evaluation with our Accra team.",
    image: visaCardCampaign,
    imageAlt: "Buy & Sell GH supported card evaluation",
    theme: "light",
    primaryLabel: "Check a Card",
    primaryTo: "/gift-cards",
    secondaryLabel: "Contact Us",
    secondaryTo: "/contact",
  };

  const featuredMacCampaigns = [featuredMacbookAirCampaign, macMiniCampaign];
  const productTiles: Campaign[] = [
    ipadAirCampaign,
    visaTradingCampaign,
  ];

  return (
    <>
      <SEO
        title="Premium Tech Store in Accra | Buy & Sell GH"
        description="Shop original devices and get trusted trade-in, repair, pre-order and customer support from Buy & Sell GH in Accra."
      />
      <main className="storefront-home">
        <Iphone18Hero />
        {topCampaigns.map((campaign) => (
          <ProductCampaign campaign={campaign} key={campaign.title} top />
        ))}
        <WatchUltraStory />

        <CampaignPair campaigns={featuredMacCampaigns} label="MacBook Air and Mac mini" className="home-product-pair-macbooks" />
        <CampaignPair campaigns={productTiles} label="iPad Air and Visa Card Trading" className="home-product-pair-ipad-visa" />

        <StoreServicesSection />
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

function WatchUltraStory() {
  return (
    <section className="watch-ultra-story" aria-label="Apple Watch Ultra 4">
      <article className="watch-ultra-panel" aria-labelledby="ultra-story-title">
        <div className="watch-ultra-copy">
          <p className="store-eyebrow">Built for beyond</p>
          <h2 id="ultra-story-title">Apple Watch Ultra 4</h2>
          <span>Rugged capability. Precision without compromise.</span>
          <div className="watch-ultra-actions">
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
    </section>
  );
}

function PremiumTrustStrip() {
  return (
    <section className="premium-trust-strip" aria-label="Buy and Sell GH customer benefits">
      <div className="premium-trust-strip-inner">
        <TrustPoint icon={<BadgeCheck aria-hidden="true" />} title="Verified Devices" description="100% original hardware, tested and backed with shop warranty." />
        <TrustPoint icon={<Truck aria-hidden="true" />} title="Ghana-Wide Delivery" description="Same-day dispatch in Accra · Secure tracked nationwide delivery." />
        <TrustPoint icon={<ShieldCheck aria-hidden="true" />} title="Dome Pillar 2 Pickup" description="Inspect and pick up directly at our verified Accra store." />
        <TrustPoint icon={<RefreshCcw aria-hidden="true" />} title="Instant Trade-In" description="Upgrade or swap with top value for your current device." />
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
    <section
      ref={sectionRef}
      className={`home-product-campaign home-product-campaign-${campaign.theme} home-product-campaign-${slug}${top ? " home-product-campaign-top" : ""}`}
      aria-labelledby={`home-campaign-${slug}`}
    >
      <div className="home-product-campaign-copy">
        <p className="store-eyebrow">{campaign.eyebrow}</p>
        <h2 id={`home-campaign-${slug}`}>{campaign.title}</h2>
        <p>{campaign.description}</p>
        {campaign.availabilityText && <p className="store-launch-availability">{campaign.availabilityText}</p>}
        <div className="store-actions">
          <Link className="store-button store-button-primary" to={campaign.primaryTo}>{campaign.primaryLabel}</Link>
          {campaign.secondaryLabel && campaign.secondaryTo && (
            <Link className="store-button store-button-secondary" to={campaign.secondaryTo}>{campaign.secondaryLabel}</Link>
          )}
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

function StoreServicesSection() {
  const carouselRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const updateScrollButtons = () => {
    const el = carouselRef.current;
    if (!el) return;
    const scrollLeft = el.scrollLeft;
    const maxScroll = el.scrollWidth - el.clientWidth;
    setCanScrollLeft(scrollLeft > 8);
    setCanScrollRight(scrollLeft < maxScroll - 8);
  };

  useEffect(() => {
    const el = carouselRef.current;
    if (!el) return;
    updateScrollButtons();
    el.addEventListener("scroll", updateScrollButtons, { passive: true });
    window.addEventListener("resize", updateScrollButtons);
    return () => {
      el.removeEventListener("scroll", updateScrollButtons);
      window.removeEventListener("resize", updateScrollButtons);
    };
  }, []);

  const scrollCarousel = (direction: "left" | "right") => {
    const el = carouselRef.current;
    if (!el) return;
    const cards = Array.from(el.querySelectorAll<HTMLElement>(".store-service-card"));
    if (!cards.length) return;
    const cardWidth = cards[0].offsetWidth;
    const gap = 24;
    const step = cardWidth + gap;
    el.scrollBy({
      left: direction === "left" ? -step : step,
      behavior: "smooth",
    });
  };

  return (
    <section id="more-from-store" className="store-services-section" aria-labelledby="store-services-title">
      <div className="store-services-container">
        <div className="store-services-header-row">
          <div className="store-services-header">
            <p className="store-services-eyebrow">SERVICES</p>
            <h2 id="store-services-title" className="store-services-title">More from our store.</h2>
            <p className="store-services-subtitle">Explore more ways to buy, upgrade, sell and get support.</p>
          </div>

          <div className="store-services-controls" aria-label="Services carousel navigation">
            <button
              type="button"
              className="store-services-arrow-btn store-services-prev"
              onClick={() => scrollCarousel("left")}
              disabled={!canScrollLeft}
              aria-label="Previous service poster"
            >
              <ChevronLeft size={20} strokeWidth={2.4} aria-hidden="true" />
            </button>
            <button
              type="button"
              className="store-services-arrow-btn store-services-next"
              onClick={() => scrollCarousel("right")}
              disabled={!canScrollRight}
              aria-label="Next service poster"
            >
              <ChevronRight size={20} strokeWidth={2.4} aria-hidden="true" />
            </button>
          </div>
        </div>

        <div
          ref={carouselRef}
          className="store-services-carousel"
          role="region"
          aria-label="Services carousel"
          tabIndex={0}
        >
          {homepageServices.map((service) => (
            <Link
              key={service.id}
              to={service.to}
              className="store-service-card"
              aria-label={`${service.title} — ${service.concept}`}
            >
              <div className="store-service-poster">
                <img
                  src={service.image}
                  alt={service.alt}
                  width={1024}
                  height={1536}
                  loading="lazy"
                  decoding="async"
                />
              </div>
            </Link>
          ))}
        </div>
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
