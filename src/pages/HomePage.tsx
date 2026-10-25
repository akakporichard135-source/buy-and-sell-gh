import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useCms } from "../cms/CmsContext";
import { SEO } from "../components/SEO";
import "../styles/homepage-reference.css";

type Action = { label: string; to: string };
type Campaign = {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  mobileImage?: string;
  alt: string;
  tone: "dark" | "light" | "mist";
  primary: Action;
  secondary?: Action;
  placement?: "bottom";
};

const heroes: Campaign[] = [
  {
    id: "iphone-18-pro",
    title: "iPhone 18 Pro",
    subtitle: "Pro further.",
    image: "/products/homepage/iphone-18-pro-hero-2x.webp",
    mobileImage: "/products/homepage/iphone-18-pro-hero-mobile.jpg",
    alt: "Burgundy iPhone 18 Pro in front of a metallic PRO composition",
    tone: "dark",
    primary: { label: "Learn more", to: "/iphone/iphone-18-pro" },
    secondary: { label: "Buy", to: "/shop/buy-iphone/iphone-18-pro" },
  },
  {
    id: "iphone-duo",
    title: "iPhone Duo",
    subtitle: "Open up more room for everything you do.",
    image: "/products/homepage/iphone-duo.webp",
    alt: "Open iPhone Duo held in two hands",
    tone: "light",
    primary: { label: "Learn more", to: "/iphone/iphone-duo" },
    secondary: { label: "View pricing", to: "/shop/buy-iphone/iphone-duo" },
  },
  {
    id: "watch-series-12",
    title: "Apple Watch Series 12",
    subtitle: "Stay connected to what moves you.",
    image: "/products/homepage/watch-series-12.webp",
    alt: "Black Apple Watch Series 12 with a dark watch face",
    tone: "dark",
    primary: { label: "Learn more", to: "/watch/apple-watch-series-12" },
    secondary: { label: "Buy", to: "/shop/buy-watch/apple-watch-series-12" },
  },
];

const tileRows: Campaign[][] = [
  [
    {
      id: "watch-ultra-4",
      title: "Apple Watch Ultra 4",
      subtitle: "Built for beyond.",
      image: "/products/homepage/watch-ultra-4.webp",
      alt: "Close view of the Apple Watch Ultra 4 case and display",
      tone: "dark",
      primary: { label: "Learn more", to: "/watch/apple-watch-ultra-4" },
      secondary: { label: "Buy", to: "/shop/buy-watch/apple-watch-ultra-4" },
    },
    {
      id: "airpods-pro-3",
      title: "AirPods Pro 3",
      subtitle: "Premium sound. A more immersive experience.",
      image: "/products/story/airpods-pro-3-apple.jpg",
      alt: "AirPods Pro 3 earbuds above their open MagSafe Charging Case",
      tone: "light",
      primary: { label: "Learn more", to: "/airpods/airpods-pro-3" },
      secondary: { label: "Buy", to: "/shop/buy-airpods/airpods-pro-3" },
      placement: "bottom",
    },
  ],
  [
    {
      id: "ipad-air",
      title: "iPad Air",
      subtitle: "Room for every idea.",
      image: "/products/homepage/homepage-ipad-air-white.webp",
      alt: "iPad Air front and back in light finishes",
      tone: "light",
      primary: { label: "Learn more", to: "/ipad/ipad-air" },
      secondary: { label: "Buy", to: "/shop/buy-ipad/ipad-air" },
    },
    {
      id: "macbook-air",
      title: "MacBook Air",
      subtitle: "Light to carry. Ready for everything.",
      image: "/products/homepage/macbook-air.jpg",
      alt: "MacBook Air opening to show its thin profile and display",
      tone: "mist",
      primary: { label: "Learn more", to: "/mac/macbook-air" },
      secondary: { label: "Buy", to: "/shop/buy-mac/macbook-air" },
    },
  ],
  [
    {
      id: "visa-card-trading",
      title: "Visa Card Trading",
      subtitle: "Check supported cards with our team.",
      image: "/products/homepage/homepage-visa-card-white.webp",
      alt: "Original unbranded black and gold card for Visa card trading enquiries",
      tone: "light",
      primary: { label: "Enquire", to: "/gift-cards" },
    },
    {
      id: "mac-mini",
      title: "Mac mini",
      subtitle: "Small footprint. Serious capability.",
      image: "/products/homepage/mac-mini-device.jpg",
      alt: "Mac mini held in hand",
      tone: "light",
      primary: { label: "Learn more", to: "/mac-mini" },
      secondary: { label: "Buy", to: "/shop/buy-mac/mac-mini" },
    },
  ],
];

function normalizeHomepageCampaign(campaign: Campaign): Campaign {
  let normalized = campaign;
  if (campaign.id === "iphone-18-pro") {
    const rawImage = campaign.image || "";
    const rawMobile = campaign.mobileImage || "";
    const isLegacySeedDesktop =
      !rawImage ||
      rawImage.includes("1792586241422-iphone-18-pro-the-new-features-you-should-try-1.jpg") ||
      rawImage === "/products/homepage/iphone-18-pro-hero.webp" ||
      rawImage === "/products/homepage/iphone-18-pro-hero.jpg";
    const isLegacySeedMobile =
      !rawMobile ||
      rawMobile.includes("1792004900948-iphone-18-promax-1.jpg") ||
      rawMobile === "/products/homepage/iphone-18-pro-hero-mobile.jpg" ||
      rawMobile === "/products/homepage/iphone-18-pro-hero-mobile.webp";
    normalized = {
      ...campaign,
      image: isLegacySeedDesktop ? "/products/homepage/iphone-18-pro-hero-2x.webp" : rawImage,
      mobileImage: isLegacySeedMobile ? "/products/homepage/iphone-18-pro-hero-mobile.jpg" : rawMobile,
    };
  }
  if (normalized.id === "iphone-duo") return normalized;
  if (normalized.secondary && normalized.secondary.label === "View pricing") {
    return {
      ...normalized,
      secondary: {
        ...normalized.secondary,
        label: "Buy",
      },
    };
  }
  return normalized;
}

const serviceFlyers = [
  { title: "Repairs", image: "/services/repairs.png", alt: "Buy & Sell GH repairs flyer for phones, laptops and game consoles", to: "/repairs" },
  { title: "Installment Payment", image: "/services/installment-payment.png", alt: "Buy & Sell GH installment payment flyer", to: "/installment" },
  { title: "Upgrade & Save", image: "/services/upgrade-and-save.png", alt: "Buy & Sell GH upgrade and trade-in flyer", to: "/sell-or-trade?mode=upgrade" },
  { title: "Sell Your Device", image: "/services/sell-your-device.png", alt: "Buy & Sell GH device selling flyer", to: "/sell-or-trade" },
  { title: "Refer a Friend", image: "/services/refer-a-friend.png", alt: "Buy & Sell GH referral flyer", to: "/refer-a-friend" },
];

export function HomePage() {
  const { homepage, loading, hasVerifiedHomepage } = useCms();

  if (loading && !hasVerifiedHomepage) {
    return (
      <main className="storefront-home home-reference">
        <SEO
          title="Premium Tech Store in Accra | Buy & Sell GH"
          description="Shop original devices and get trusted trade-in, repair, installment and customer support from Buy & Sell GH in Accra."
        />
        <div className="home-ref-announcement" style={{ opacity: 0, pointerEvents: "none" }}>
          &nbsp;
        </div>
        <section className="home-ref-hero is-dark" style={{ minHeight: "650px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <div style={{ width: "90%", maxWidth: "980px", minHeight: "420px", borderRadius: "24px", background: "rgba(255, 255, 255, 0.03)" }} />
        </section>
        <div className="home-ref-grid">
          <div className="home-ref-row">
            <div className="home-ref-tile is-dark" style={{ minHeight: "590px", background: "#0a0a0c" }} />
            <div className="home-ref-tile is-light" style={{ minHeight: "590px", background: "#f5f5f7" }} />
          </div>
        </div>
      </main>
    );
  }

  const rawHeroes: Campaign[] =
    homepage?.heroes?.filter((h) => h.enabled) && homepage.heroes.filter((h) => h.enabled).length > 0
      ? (homepage.heroes.filter((h) => h.enabled) as Campaign[])
      : heroes;
  const activeHeroes = rawHeroes.map(normalizeHomepageCampaign);

  const rawTiles: Campaign[] =
    homepage?.tiles?.filter((t) => t.enabled) && homepage.tiles.filter((t) => t.enabled).length > 0
      ? (homepage.tiles.filter((t) => t.enabled) as Campaign[])
      : tileRows.flat();
  const activeTiles = rawTiles.map(normalizeHomepageCampaign);

  const tileGridRows: Campaign[][] = [];
  for (let i = 0; i < activeTiles.length; i += 2) {
    tileGridRows.push(activeTiles.slice(i, i + 2));
  }

  const activeFlyers =
    homepage?.serviceFlyers?.filter((f) => f.enabled) && homepage.serviceFlyers.filter((f) => f.enabled).length > 0
      ? homepage.serviceFlyers.filter((f) => f.enabled)
      : serviceFlyers;

  const announcement = homepage?.announcement;

  return (
    <>
      <SEO
        title="Premium Tech Store in Accra | Buy & Sell GH"
        description="Shop original devices and get trusted trade-in, repair, installment and customer support from Buy & Sell GH in Accra."
      />
      <main className="storefront-home home-reference">
        {announcement?.enabled !== false && (
          <div className="home-ref-announcement">
            {announcement?.text || "Trade in your current device toward your next one."}{" "}
            <Link to={announcement?.linkTo || "/sell-or-trade?mode=upgrade"}>
              {announcement?.linkText || "Explore trade-in"}{" "}
              <span aria-hidden="true">›</span>
            </Link>
          </div>
        )}
        {heroes.map((fallbackCampaign, index) => {
          if (index >= activeHeroes.length) return null;
          const campaign = activeHeroes[index] || fallbackCampaign;
          return <ProductHero campaign={campaign} key={campaign.id} priority={index < 2} />;
        })}
        {activeHeroes.slice(heroes.length).map((campaign) => (
          <ProductHero campaign={campaign} key={campaign.id} priority={false} />
        ))}
        <div className="home-ref-grid">
          {tileRows.map((fallbackRow, rowIndex) => {
            if (rowIndex >= tileGridRows.length) return null;
            const row = tileGridRows[rowIndex] || fallbackRow;
            return (
              <div className="home-ref-row" key={row[0].id}>
                {row.map((campaign) => (
                  <ProductTile campaign={campaign} key={campaign.id} />
                ))}
              </div>
            );
          })}
          {tileGridRows.slice(tileRows.length).map((row) => (
            <div className="home-ref-row" key={row[0].id}>
              {row.map((campaign) => (
                <ProductTile campaign={campaign} key={campaign.id} />
              ))}
            </div>
          ))}
        </div>
        <ServiceFlyerCarousel />
      </main>
    </>
  );
}

function CampaignActions({ primary, secondary }: { primary: Action; secondary?: Action }) {
  return (
    <div className="home-ref-actions">
      <Link className="home-ref-button home-ref-button-primary" to={primary.to}>{primary.label}</Link>
      {secondary && <Link className="home-ref-button home-ref-button-secondary" to={secondary.to}>{secondary.label}</Link>}
    </div>
  );
}

const defaultMobileHeroes: Record<string, string> = {
  "iphone-18-pro": "/products/homepage/iphone-18-pro-hero-mobile.jpg",
};

function ProductHero({ campaign, priority }: { campaign: Campaign; priority: boolean }) {
  const mobileImg =
    campaign.mobileImage ||
    defaultMobileHeroes[campaign.id] ||
    undefined;

  const hasMobileArt = Boolean(mobileImg && mobileImg !== campaign.image);

  return (
    <section
      className={`home-ref-hero home-ref-${campaign.id} home-ref-${campaign.tone} ${
        hasMobileArt ? "has-mobile-hero" : ""
      }`}
      aria-labelledby={`home-ref-${campaign.id}-title`}
    >
      <div className="home-ref-copy">
        <h1 id={`home-ref-${campaign.id}-title`}>{campaign.title}</h1>
        <p>{campaign.subtitle}</p>
        <CampaignActions primary={campaign.primary} secondary={campaign.secondary} />
      </div>
      {mobileImg ? (
        <picture key={`${campaign.id}-${campaign.image}`} className="home-ref-hero-picture">
          <source
            media="(max-width: 768px)"
            srcSet={mobileImg}
            width={campaign.id === "iphone-18-pro" ? 680 : undefined}
            height={campaign.id === "iphone-18-pro" ? 880 : undefined}
          />
          <img
            key={`${campaign.id}-${campaign.image}`}
            className={campaign.id === "iphone-18-pro" ? "home-ref-hero-image iphone18-hero-img" : "home-ref-hero-image"}
            src={campaign.image}
            alt={campaign.alt}
            width={campaign.id === "iphone-18-pro" ? 734 : undefined}
            height={campaign.id === "iphone-18-pro" ? 413 : undefined}
            loading={priority ? "eager" : "lazy"}
            fetchPriority={priority ? "high" : undefined}
            decoding={priority ? "sync" : "async"}
          />
        </picture>
      ) : (
        <img
          key={`${campaign.id}-${campaign.image}`}
          className={campaign.id === "iphone-18-pro" ? "home-ref-hero-image iphone18-hero-img" : "home-ref-hero-image"}
          src={campaign.image}
          alt={campaign.alt}
          width={campaign.id === "iphone-18-pro" ? 734 : undefined}
          height={campaign.id === "iphone-18-pro" ? 413 : undefined}
          loading={priority ? "eager" : "lazy"}
          fetchPriority={priority ? "high" : undefined}
          decoding={priority ? "sync" : "async"}
        />
      )}
    </section>
  );
}

function ProductTile({ campaign }: { campaign: Campaign }) {
  return (
    <section
      className={`home-ref-tile home-ref-${campaign.id} home-ref-${campaign.tone}${campaign.placement === "bottom" ? " home-ref-copy-bottom" : ""}`}
      aria-labelledby={`home-ref-${campaign.id}-title`}
    >
      <div className="home-ref-copy">
        <h2 id={`home-ref-${campaign.id}-title`}>{campaign.title}</h2>
        <p>{campaign.subtitle}</p>
        <CampaignActions primary={campaign.primary} secondary={campaign.secondary} />
      </div>
      <img
        key={`${campaign.id}-${campaign.image}`}
        className="home-ref-tile-image"
        src={campaign.image}
        alt={campaign.alt}
        loading="lazy"
        decoding="async"
      />
    </section>
  );
}

function ServiceFlyerCarousel() {
  const { homepage } = useCms();
  const activeFlyers =
    homepage?.serviceFlyers?.filter((f) => f.enabled) && homepage.serviceFlyers.filter((f) => f.enabled).length > 0
      ? homepage.serviceFlyers.filter((f) => f.enabled)
      : serviceFlyers;

  const trackRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const updateButtons = () => {
      setCanScrollLeft(track.scrollLeft > 4);
      setCanScrollRight(track.scrollLeft < track.scrollWidth - track.clientWidth - 4);
    };
    updateButtons();
    track.addEventListener("scroll", updateButtons, { passive: true });
    window.addEventListener("resize", updateButtons);
    return () => {
      track.removeEventListener("scroll", updateButtons);
      window.removeEventListener("resize", updateButtons);
    };
  }, []);

  const scrollFlyers = (direction: -1 | 1) => {
    const track = trackRef.current;
    if (!track) return;
    const card = track.querySelector<HTMLElement>(".home-ref-service-card");
    if (!card) return;
    const gap = Number.parseFloat(window.getComputedStyle(track).columnGap) || 0;
    track.scrollBy({
      left: direction * (card.getBoundingClientRect().width + gap),
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth",
    });
  };

  return (
    <section className="home-ref-services" aria-labelledby="home-ref-services-title">
      <div className="home-ref-services-heading">
        <div>
          <h2 id="home-ref-services-title">Our Services</h2>
          <p>Professional device repairs and support from Buy & Sell GH.</p>
        </div>
        <div className="home-ref-service-controls" aria-label="Service flyers navigation">
          <button type="button" aria-label="Previous service flyer" onClick={() => scrollFlyers(-1)} disabled={!canScrollLeft}><ChevronLeft size={20} aria-hidden="true" /></button>
          <button type="button" aria-label="Next service flyer" onClick={() => scrollFlyers(1)} disabled={!canScrollRight}><ChevronRight size={20} aria-hidden="true" /></button>
        </div>
      </div>
      <div className="home-ref-service-track" ref={trackRef} role="region" aria-label="Buy & Sell GH service flyers" tabIndex={0}>
        {activeFlyers.map((flyer) => {
          const webpSrc = flyer.image.endsWith(".png") ? flyer.image.replace(/\.png$/, ".webp") : flyer.image;
          const pngSrc = flyer.image.endsWith(".webp") ? flyer.image.replace(/\.webp$/, ".png") : flyer.image;
          return (
            <Link className="home-ref-service-card" to={flyer.to} key={flyer.title} aria-label={flyer.title}>
              <picture>
                <source type="image/webp" srcSet={webpSrc} />
                <img src={pngSrc} alt={flyer.alt} width={1024} height={1536} loading="eager" decoding="async" />
              </picture>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
