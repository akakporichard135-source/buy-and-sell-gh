import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useCms } from "../cms/CmsContext";
import { defaultHomepageContent, defaultHomepageSections } from "../cms/defaultCmsData";
import { useResolvedMediaUrl } from "../cms/localMediaStore";
import { resolveLegacyBackgroundColor } from "../cms/homepageBuilderUtils";
import { useProductCatalog } from "../catalog/ProductCatalogContext";
import { getPublicPurchaseAction } from "../catalog/productPurchaseAction";
import { getProductFamily, productBuyPath } from "../catalog/productExperience";
import { SEO } from "../components/SEO";
import { HomepageSectionRenderer } from "../components/homepage/HomepageSectionRenderer";
import { PromotionalAnnouncementBar } from "../components/promotions/PromotionalAnnouncementBar";
import { HomepagePromotionalCarousel } from "../components/promotions/HomepagePromotionalCarousel";
import { whatsappUrl } from "../utils/whatsapp";
import type {
  CustomHomepageSection,
  HeroCampaign,
  HomepageContent,
  HomepageMediaFit,
  HomepageMediaMode,
  PromoTile,
  ServiceFlyer,
} from "../cms/types";
import type { Product } from "../types/product";
import "../styles/homepage-reference.css";

type Action = { label: string; to: string };
type Campaign = {
  id: string;
  internalName?: string;
  deviceName?: string;
  productId?: string;
  eyebrow?: string;
  title: string;
  subtitle: string;
  description?: string;
  promoText?: string;
  image: string;
  mobileImage?: string;
  mediaMode?: HomepageMediaMode;
  videoUrl?: string;
  mobileVideoUrl?: string;
  posterUrl?: string;
  mobilePosterUrl?: string;
  videoAutoplay?: boolean;
  videoMuted?: boolean;
  videoLoop?: boolean;
  backgroundImage?: string;
  alt: string;
  tone: "dark" | "light" | "mist";
  backgroundColor?: string;
  backgroundGradient?: string;
  mediaFit?: HomepageMediaFit;
  mediaPosition?: string;
  mediaBlendMode?: "normal" | "multiply";
  primary: Action;
  secondary?: Action;
  placement?: "top" | "bottom";
};

function resolveCssObjectPosition(pos?: string): string {
  switch ((pos || "").toLowerCase()) {
    case "top":
      return "center top";
    case "bottom":
      return "center bottom";
    case "left":
      return "left center";
    case "right":
      return "right center";
    case "center":
      return "center center";
    default:
      return pos || "center bottom";
  }
}

function normalizeHomepageCampaign(campaign: Campaign): Campaign {
  if (
    (campaign.id === "iphone-18-pro" && !campaign.image && campaign.mediaMode !== "video") ||
    campaign.image?.includes("1792586241422-iphone-18-pro-the-new-features-you-should-try-1.jpg") ||
    campaign.image === "/products/homepage/iphone-18-pro-hero.webp" ||
    campaign.image === "/products/homepage/iphone-18-pro-hero.jpg"
  ) {
    return {
      ...campaign,
      image: "/products/homepage/iphone-18-pro-hero-2x.webp",
      mobileImage:
        campaign.mobileImage &&
        !campaign.mobileImage.includes("1792004900948-iphone-18-promax-1.jpg") &&
        campaign.mobileImage !== "/products/homepage/iphone-18-pro-hero-mobile.webp"
          ? campaign.mobileImage
          : "/products/homepage/iphone-18-pro-hero-mobile.jpg",
    };
  }
  return campaign;
}

function withPublishedProductAction(campaign: Campaign, products: Product[]): Campaign {
  if (!campaign.secondary) return campaign;
  const isDefaultBuyRoute = campaign.secondary.to.startsWith("/shop/buy-");
  const isDefaultLabel =
    campaign.secondary.label === "Buy" || campaign.secondary.label === "View pricing";

  // Respect custom secondary CTA labels or custom non-buy routes configured by the administrator
  if (!isDefaultBuyRoute && !campaign.productId) {
    return campaign;
  }

  const destinationSlug = isDefaultBuyRoute
    ? campaign.secondary.to.split("?")[0].split("/").pop()
    : undefined;
  const product = products.find(
    (item) =>
      !item.archived &&
      ((campaign.productId &&
        (item.id === campaign.productId || item.slug === campaign.productId)) ||
        (destinationSlug && item.slug === destinationSlug))
  );
  if (!product) {
    return isDefaultBuyRoute && isDefaultLabel
      ? { ...campaign, secondary: { ...campaign.secondary, label: "Buy" } }
      : campaign;
  }
  if (!isDefaultBuyRoute || !isDefaultLabel) {
    return campaign;
  }
  const action = getPublicPurchaseAction(product);
  const to =
    action === "enquire"
      ? whatsappUrl(
          `Hello Buy & Sell GH, I would like to enquire about ${product.name}. Please confirm availability and pricing.`
        )
      : productBuyPath(getProductFamily(product), product.slug);
  return {
    ...campaign,
    secondary: {
      label:
        action === "buy"
          ? "Buy"
          : action === "enquire"
          ? "Enquire on WhatsApp"
          : "View pricing",
      to,
    },
  };
}

const serviceFlyers: ServiceFlyer[] = defaultHomepageContent.serviceFlyers;

export interface HomePageProps {
  overrideContent?: HomepageContent;
  isAdminDraftPreview?: boolean;
}

export function HomePage({ overrideContent, isAdminDraftPreview = false }: HomePageProps = {}) {
  const { homepage, homepageDraft, loading, hasVerifiedHomepage } = useCms();
  const { products } = useProductCatalog();
  const location = useLocation();

  const effectiveSource = overrideContent || homepage;
  const searchParams = new URLSearchParams(location.search);
  const isLocalHost =
    typeof window !== "undefined" &&
    (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");
  const isLocalPreviewModular =
    !overrideContent &&
    (import.meta.env.DEV || isLocalHost) &&
    searchParams.get("preview") === "modular";

  if (!overrideContent && loading && !hasVerifiedHomepage && !isLocalPreviewModular) {
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

  if (isLocalPreviewModular || effectiveSource?.layoutMode === "modular") {
    const modularContent: HomepageContent = overrideContent
      ? overrideContent
      : isLocalPreviewModular
      ? homepageDraft || {
          ...effectiveSource,
          layoutMode: "modular",
          sections:
            effectiveSource?.sections && effectiveSource.sections.length > 0
              ? effectiveSource.sections
              : defaultHomepageSections,
        }
      : effectiveSource;

    return (
      <>
        <SEO
          title="Premium Tech Store in Accra | Buy & Sell GH"
          description="Shop original devices and get trusted trade-in, repair, installment and customer support from Buy & Sell GH in Accra."
        />
        <main className="storefront-home">
          <HomepageSectionRenderer content={modularContent} />
          {isLocalPreviewModular && (
            <div
              role="status"
              style={{
                position: "fixed",
                right: 12,
                bottom: 12,
                zIndex: 90,
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "7px 12px",
                borderRadius: 999,
                background: "rgba(29, 29, 31, 0.92)",
                color: "#f5f5f7",
                fontSize: 11,
                fontWeight: 600,
                whiteSpace: "nowrap",
                boxShadow: "0 10px 28px rgba(0, 0, 0, 0.28)",
                border: "1px solid rgba(255, 255, 255, 0.16)",
                backdropFilter: "blur(12px)",
              }}
            >
              <span
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  background: "#30d158",
                  display: "inline-block",
                  flexShrink: 0,
                }}
              />
              <span>{homepageDraft ? "Modular Draft" : "Modular Preview"}</span>
              <Link
                to="/admin/homepage"
                style={{
                  color: "#2997ff",
                  textDecoration: "none",
                  fontWeight: 700,
                  marginLeft: 2,
                }}
              >
                Admin
              </Link>
              <Link
                to="/"
                style={{
                  color: "#a1a1a6",
                  textDecoration: "none",
                  marginLeft: 2,
                }}
              >
                Exit
              </Link>
            </div>
          )}
        </main>
      </>
    );
  }

  const rawHeroes: Campaign[] =
    effectiveSource?.heroes?.filter((h) => h.enabled) &&
    effectiveSource.heroes.filter((h) => h.enabled).length > 0
      ? (effectiveSource.heroes.filter((h) => h.enabled) as Campaign[])
      : (defaultHomepageContent.heroes as Campaign[]).filter((h) => (h as HeroCampaign).enabled !== false);
  const activeHeroes = rawHeroes.map((campaign) =>
    withPublishedProductAction(normalizeHomepageCampaign(campaign), products)
  );

  const rawTiles: Campaign[] =
    effectiveSource?.tiles?.filter((t) => t.enabled) &&
    effectiveSource.tiles.filter((t) => t.enabled).length > 0
      ? (effectiveSource.tiles.filter((t) => t.enabled) as Campaign[])
      : (defaultHomepageContent.tiles as Campaign[]).filter((t) => (t as PromoTile).enabled !== false);
  const activeTiles = rawTiles.map((campaign) =>
    withPublishedProductAction(normalizeHomepageCampaign(campaign), products)
  );

  const tileGridRows: Campaign[][] = [];
  for (let i = 0; i < activeTiles.length; i += 2) {
    tileGridRows.push(activeTiles.slice(i, i + 2));
  }

  const activeCustomSections: CustomHomepageSection[] = (
    effectiveSource?.customSections || []
  )
    .filter((cs) => cs.enabled !== false)
    .slice()
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  const customAfterHeroes = activeCustomSections.filter(
    (cs) => !cs.sectionPlacement || cs.sectionPlacement === "after-heroes"
  );
  const customAfterTiles = activeCustomSections.filter(
    (cs) => cs.sectionPlacement === "after-tiles"
  );
  const customBeforeServices = activeCustomSections.filter(
    (cs) => cs.sectionPlacement === "before-services"
  );
  const customAfterServices = activeCustomSections.filter(
    (cs) => cs.sectionPlacement === "after-services"
  );

  const activeFlyers =
    effectiveSource?.serviceFlyers?.filter((f) => f.enabled) &&
    effectiveSource.serviceFlyers.filter((f) => f.enabled).length > 0
      ? effectiveSource.serviceFlyers.filter((f) => f.enabled)
      : serviceFlyers;

  return (
    <>
      <SEO
        title="Premium Tech Store in Accra | Buy & Sell GH"
        description="Shop original devices and get trusted trade-in, repair, installment and customer support from Buy & Sell GH in Accra."
      />
      <main className="storefront-home home-reference" data-admin-draft-preview={isAdminDraftPreview ? "true" : undefined}>
        {isAdminDraftPreview && effectiveSource?.announcement?.enabled ? (
          <div className="home-ref-announcement" role="region" aria-label="Announcement">
            <span>{effectiveSource.announcement.text}</span>
            {effectiveSource.announcement.linkText ? (
              <Link to={effectiveSource.announcement.linkTo || "/store"}>
                {effectiveSource.announcement.linkText} &rsaquo;
              </Link>
            ) : null}
          </div>
        ) : (
          <PromotionalAnnouncementBar />
        )}
        {activeHeroes.map((campaign, index) => (
          <ProductHero campaign={campaign} key={`${campaign.id}-${index}`} priority={index < 2} />
        ))}
        {customAfterHeroes.map((section, idx) => (
          <CustomHomepageSectionView section={section} key={`${section.id}-ah-${idx}`} />
        ))}
        <div className="home-ref-grid">
          {tileGridRows.map((row, rowIdx) => (
            <div className="home-ref-row" key={`${row[0].id}-${rowIdx}`}>
              {row.map((campaign, tileIdx) => (
                <ProductTile campaign={campaign} key={`${campaign.id}-${tileIdx}`} />
              ))}
            </div>
          ))}
        </div>
        {customAfterTiles.map((section, idx) => (
          <CustomHomepageSectionView section={section} key={`${section.id}-at-${idx}`} />
        ))}
        <HomepagePromotionalCarousel />
        {customBeforeServices.map((section, idx) => (
          <CustomHomepageSectionView section={section} key={`${section.id}-bs-${idx}`} />
        ))}
        <ServiceFlyerCarousel flyers={activeFlyers} />
        {customAfterServices.map((section, idx) => (
          <CustomHomepageSectionView section={section} key={`${section.id}-as-${idx}`} />
        ))}
      </main>
    </>
  );
}

function CampaignActions({ primary, secondary }: { primary: Action; secondary?: Action }) {
  return (
    <div className="home-ref-actions">
      {primary?.label ? (
        <Link className="home-ref-button home-ref-button-primary" to={primary.to || "/store"}>
          {primary.label}
        </Link>
      ) : null}
      {secondary && secondary.label
        ? secondary.to.startsWith("https://wa.me/")
          ? (
            <a
              className="home-ref-button home-ref-button-secondary"
              href={secondary.to}
              target="_blank"
              rel="noopener noreferrer"
            >
              {secondary.label}
            </a>
          )
          : (
            <Link className="home-ref-button home-ref-button-secondary" to={secondary.to || "/store"}>
              {secondary.label}
            </Link>
          )
        : null}
    </div>
  );
}

function useResponsiveMobileFlag(breakpoint = 768): boolean {
  const [isMobile, setIsMobile] = useState<boolean>(() =>
    typeof window !== "undefined" ? window.innerWidth <= breakpoint : false
  );
  useEffect(() => {
    if (typeof window === "undefined") return;
    const onResize = () => setIsMobile(window.innerWidth <= breakpoint);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [breakpoint]);
  return isMobile;
}

function buildSectionBackgroundImage(
  gradient?: string,
  resolvedBgImage?: string
): string | undefined {
  const parts: string[] = [];
  if (gradient?.trim()) parts.push(gradient.trim());
  if (resolvedBgImage?.trim()) parts.push(`url("${resolvedBgImage.trim()}")`);
  return parts.length > 0 ? parts.join(", ") : undefined;
}

function ProductHero({ campaign, priority }: { campaign: Campaign; priority: boolean }) {
  const { resolvedUrl: resolvedDesktop } = useResolvedMediaUrl(campaign.image);
  const { resolvedUrl: resolvedMobile } = useResolvedMediaUrl(campaign.mobileImage);
  const { resolvedUrl: resolvedVideo } = useResolvedMediaUrl(campaign.videoUrl);
  const { resolvedUrl: resolvedMobileVideo } = useResolvedMediaUrl(campaign.mobileVideoUrl);
  const { resolvedUrl: resolvedPoster } = useResolvedMediaUrl(campaign.posterUrl);
  const { resolvedUrl: resolvedMobilePoster } = useResolvedMediaUrl(campaign.mobilePosterUrl);
  const { resolvedUrl: resolvedBgImage } = useResolvedMediaUrl(campaign.backgroundImage);
  const isMobile = useResponsiveMobileFlag(768);
  const [videoFailed, setVideoFailed] = useState(false);

  const mobileImg = resolvedMobile || undefined;
  const hasMobileArt = Boolean(mobileImg && mobileImg !== resolvedDesktop);

  const tone = campaign.tone || "dark";
  const backgroundColor = resolveLegacyBackgroundColor(tone, campaign.backgroundColor);
  const backgroundImage = buildSectionBackgroundImage(campaign.backgroundGradient, resolvedBgImage);
  const mediaFit = campaign.mediaFit || "contain";
  const objectPosition = resolveCssObjectPosition(
    campaign.mediaPosition || (mediaFit === "cover" ? "center" : "bottom")
  );
  const mixBlendMode = tone === "dark" ? "normal" : campaign.mediaBlendMode || "normal";

  const activeVideoSrc =
    isMobile && resolvedMobileVideo ? resolvedMobileVideo : resolvedVideo || resolvedMobileVideo;
  const activePosterSrc =
    (isMobile && resolvedMobilePoster ? resolvedMobilePoster : resolvedPoster) ||
    (isMobile && mobileImg ? mobileImg : resolvedDesktop) ||
    undefined;
  const shouldRenderVideo =
    campaign.mediaMode === "video" && Boolean(activeVideoSrc) && !videoFailed;

  const headingText = campaign.title || campaign.deviceName || "Featured Campaign";
  const distinctEyebrow =
    campaign.eyebrow?.trim() ||
    (campaign.deviceName?.trim() &&
    campaign.deviceName.trim().toLowerCase() !== headingText.trim().toLowerCase()
      ? campaign.deviceName.trim()
      : "");

  return (
    <section
      className={`home-ref-hero home-ref-${tone} ${
        mediaFit === "cover" ? "home-ref-media-cover" : "home-ref-media-contain"
      } ${hasMobileArt ? "has-mobile-hero" : ""}${
        campaign.placement === "bottom" ? " home-ref-copy-bottom" : ""
      }`}
      data-campaign-id={campaign.id}
      data-tone={tone}
      data-bg={backgroundColor}
      data-media-mode={shouldRenderVideo ? "video" : "image"}
      style={{
        backgroundColor,
        backgroundImage,
        backgroundSize: resolvedBgImage ? "cover" : undefined,
        backgroundPosition: resolvedBgImage ? "center" : undefined,
      }}
      aria-labelledby={`home-ref-${campaign.id}-title`}
    >
      <div className="home-ref-copy">
        {distinctEyebrow ? (
          <span className="home-ref-eyebrow" data-testid="campaign-eyebrow">
            {distinctEyebrow}
          </span>
        ) : null}
        <h1 id={`home-ref-${campaign.id}-title`}>{headingText}</h1>
        {campaign.subtitle ? <p>{campaign.subtitle}</p> : null}
        {campaign.description ? (
          <p className="home-ref-description" data-testid="campaign-description">
            {campaign.description}
          </p>
        ) : null}
        {campaign.promoText ? (
          <p className="home-ref-promo-text">{campaign.promoText}</p>
        ) : null}
        <CampaignActions primary={campaign.primary} secondary={campaign.secondary} />
      </div>
      {shouldRenderVideo ? (
        <video
          key={`${campaign.id}-vid-${activeVideoSrc}`}
          data-testid="homepage-campaign-video"
          className="home-ref-hero-image home-ref-video-media"
          src={activeVideoSrc}
          poster={activePosterSrc}
          autoPlay={campaign.videoAutoplay !== false}
          muted={campaign.videoMuted !== false}
          loop={campaign.videoLoop !== false}
          playsInline
          preload="metadata"
          onError={() => setVideoFailed(true)}
          style={{
            objectFit: mediaFit,
            objectPosition,
            mixBlendMode,
          }}
        />
      ) : mobileImg ? (
        <picture key={`${campaign.id}-${resolvedDesktop}-${mobileImg}`} className="home-ref-hero-picture">
          <source media="(max-width: 768px)" srcSet={mobileImg} />
          <img
            className="home-ref-hero-image"
            src={resolvedDesktop || activePosterSrc}
            alt={campaign.alt || headingText}
            style={{
              objectFit: mediaFit,
              objectPosition,
              mixBlendMode,
            }}
            loading={priority ? "eager" : "lazy"}
            fetchPriority={priority ? "high" : undefined}
            decoding={priority ? "sync" : "async"}
          />
        </picture>
      ) : (
        <img
          key={`${campaign.id}-${resolvedDesktop}`}
          className="home-ref-hero-image"
          src={resolvedDesktop || activePosterSrc}
          alt={campaign.alt || headingText}
          style={{
            objectFit: mediaFit,
            objectPosition,
            mixBlendMode,
          }}
          loading={priority ? "eager" : "lazy"}
          fetchPriority={priority ? "high" : undefined}
          decoding={priority ? "sync" : "async"}
        />
      )}
    </section>
  );
}

function ProductTile({ campaign }: { campaign: Campaign }) {
  const { resolvedUrl: resolvedDesktop } = useResolvedMediaUrl(campaign.image);
  const { resolvedUrl: resolvedMobile } = useResolvedMediaUrl(campaign.mobileImage);
  const { resolvedUrl: resolvedVideo } = useResolvedMediaUrl(campaign.videoUrl);
  const { resolvedUrl: resolvedMobileVideo } = useResolvedMediaUrl(campaign.mobileVideoUrl);
  const { resolvedUrl: resolvedPoster } = useResolvedMediaUrl(campaign.posterUrl);
  const { resolvedUrl: resolvedMobilePoster } = useResolvedMediaUrl(campaign.mobilePosterUrl);
  const { resolvedUrl: resolvedBgImage } = useResolvedMediaUrl(campaign.backgroundImage);
  const isMobile = useResponsiveMobileFlag(768);
  const [videoFailed, setVideoFailed] = useState(false);

  const tone = campaign.tone || "light";
  const backgroundColor = resolveLegacyBackgroundColor(tone, campaign.backgroundColor);
  const backgroundImage = buildSectionBackgroundImage(campaign.backgroundGradient, resolvedBgImage);
  const mediaFit = campaign.mediaFit || "contain";
  const objectPosition = resolveCssObjectPosition(
    campaign.mediaPosition || (mediaFit === "cover" ? "center" : "bottom")
  );
  const mixBlendMode = tone === "dark" ? "normal" : campaign.mediaBlendMode || "normal";

  const activeVideoSrc =
    isMobile && resolvedMobileVideo ? resolvedMobileVideo : resolvedVideo || resolvedMobileVideo;
  const activePosterSrc =
    (isMobile && resolvedMobilePoster ? resolvedMobilePoster : resolvedPoster) ||
    (isMobile && resolvedMobile ? resolvedMobile : resolvedDesktop) ||
    undefined;
  const shouldRenderVideo =
    campaign.mediaMode === "video" && Boolean(activeVideoSrc) && !videoFailed;

  const headingText = campaign.title || campaign.deviceName || "Featured Tile";
  const distinctEyebrow =
    campaign.eyebrow?.trim() ||
    (campaign.deviceName?.trim() &&
    campaign.deviceName.trim().toLowerCase() !== headingText.trim().toLowerCase()
      ? campaign.deviceName.trim()
      : "");

  return (
    <section
      className={`home-ref-tile home-ref-${tone} ${
        mediaFit === "cover" ? "home-ref-media-cover" : "home-ref-media-contain"
      }${campaign.placement === "bottom" ? " home-ref-copy-bottom" : ""}`}
      data-campaign-id={campaign.id}
      data-tone={tone}
      data-bg={backgroundColor}
      data-media-mode={shouldRenderVideo ? "video" : "image"}
      style={{
        backgroundColor,
        backgroundImage,
        backgroundSize: resolvedBgImage ? "cover" : undefined,
        backgroundPosition: resolvedBgImage ? "center" : undefined,
      }}
      aria-labelledby={`home-ref-${campaign.id}-title`}
    >
      <div className="home-ref-copy">
        {distinctEyebrow ? (
          <span className="home-ref-eyebrow" data-testid="campaign-eyebrow">
            {distinctEyebrow}
          </span>
        ) : null}
        <h2 id={`home-ref-${campaign.id}-title`}>{headingText}</h2>
        {campaign.subtitle ? <p>{campaign.subtitle}</p> : null}
        {campaign.description ? (
          <p className="home-ref-description" data-testid="campaign-description">
            {campaign.description}
          </p>
        ) : null}
        {campaign.promoText ? (
          <p className="home-ref-promo-text">{campaign.promoText}</p>
        ) : null}
        <CampaignActions primary={campaign.primary} secondary={campaign.secondary} />
      </div>
      {shouldRenderVideo ? (
        <video
          key={`${campaign.id}-vid-${activeVideoSrc}`}
          data-testid="homepage-campaign-video"
          className="home-ref-tile-image home-ref-video-media"
          src={activeVideoSrc}
          poster={activePosterSrc}
          autoPlay={campaign.videoAutoplay !== false}
          muted={campaign.videoMuted !== false}
          loop={campaign.videoLoop !== false}
          playsInline
          preload="metadata"
          onError={() => setVideoFailed(true)}
          style={{
            objectFit: mediaFit,
            objectPosition,
            mixBlendMode,
          }}
        />
      ) : resolvedMobile ? (
        <picture key={`${campaign.id}-${resolvedDesktop}-${resolvedMobile}`} className="home-ref-hero-picture">
          <source media="(max-width: 768px)" srcSet={resolvedMobile} />
          <img
            className="home-ref-tile-image"
            src={resolvedDesktop || activePosterSrc}
            alt={campaign.alt || headingText}
            style={{
              objectFit: mediaFit,
              objectPosition,
              mixBlendMode,
            }}
            loading="lazy"
            decoding="async"
          />
        </picture>
      ) : (
        <img
          key={`${campaign.id}-${resolvedDesktop}`}
          className="home-ref-tile-image"
          src={resolvedDesktop || activePosterSrc}
          alt={campaign.alt || headingText}
          style={{
            objectFit: mediaFit,
            objectPosition,
            mixBlendMode,
          }}
          loading="lazy"
          decoding="async"
        />
      )}
    </section>
  );
}

function CustomHomepageSectionView({ section }: { section: CustomHomepageSection }) {
  const { resolvedUrl: resolvedDesktop } = useResolvedMediaUrl(section.image);
  const { resolvedUrl: resolvedMobile } = useResolvedMediaUrl(section.mobileImage);
  const { resolvedUrl: resolvedVideo } = useResolvedMediaUrl(section.videoUrl);
  const { resolvedUrl: resolvedMobileVideo } = useResolvedMediaUrl(section.mobileVideoUrl);
  const { resolvedUrl: resolvedPoster } = useResolvedMediaUrl(section.posterUrl);
  const { resolvedUrl: resolvedMobilePoster } = useResolvedMediaUrl(section.mobilePosterUrl);
  const { resolvedUrl: resolvedBgImage } = useResolvedMediaUrl(section.backgroundImage);
  const isMobile = useResponsiveMobileFlag(768);
  const [videoFailed, setVideoFailed] = useState(false);

  const tone = section.tone || "light";
  const backgroundColor = resolveLegacyBackgroundColor(tone, section.backgroundColor);
  const backgroundImage = buildSectionBackgroundImage(section.backgroundGradient, resolvedBgImage);
  const mediaFit = section.mediaFit || "contain";
  const objectPosition = resolveCssObjectPosition(
    section.mediaPosition || (mediaFit === "cover" ? "center" : "bottom")
  );
  const mixBlendMode = tone === "dark" ? "normal" : section.mediaBlendMode || "normal";
  const variant = section.layoutVariant || "full-hero";

  const activeVideoSrc =
    isMobile && resolvedMobileVideo ? resolvedMobileVideo : resolvedVideo || resolvedMobileVideo;
  const activePosterSrc =
    (isMobile && resolvedMobilePoster ? resolvedMobilePoster : resolvedPoster) ||
    (isMobile && resolvedMobile ? resolvedMobile : resolvedDesktop) ||
    undefined;
  const shouldRenderVideo =
    section.mediaMode === "video" && Boolean(activeVideoSrc) && !videoFailed;

  const headingText = section.title || section.deviceName || section.internalName || "Featured Section";
  const distinctEyebrow =
    section.eyebrow?.trim() ||
    (section.deviceName?.trim() &&
    section.deviceName.trim().toLowerCase() !== headingText.trim().toLowerCase()
      ? section.deviceName.trim()
      : "");

  const isSplit = variant === "split-left" || variant === "split-right";

  return (
    <section
      className={`home-ref-hero home-ref-custom-section home-ref-variant-${variant} home-ref-${tone} ${
        mediaFit === "cover" && !isSplit ? "home-ref-media-cover" : "home-ref-media-contain"
      }${section.placement === "bottom" && !isSplit ? " home-ref-copy-bottom" : ""}`}
      data-custom-section-id={section.id}
      data-campaign-id={section.id}
      data-tone={tone}
      data-bg={backgroundColor}
      data-layout-variant={variant}
      data-media-mode={shouldRenderVideo ? "video" : "image"}
      style={{
        backgroundColor,
        backgroundImage,
        backgroundSize: resolvedBgImage ? "cover" : undefined,
        backgroundPosition: resolvedBgImage ? "center" : undefined,
      }}
      aria-labelledby={`home-ref-custom-${section.id}-title`}
    >
      <div className="home-ref-copy">
        {distinctEyebrow ? (
          <span className="home-ref-eyebrow" data-testid="custom-section-eyebrow">
            {distinctEyebrow}
          </span>
        ) : null}
        <h2 id={`home-ref-custom-${section.id}-title`} className="home-ref-custom-heading">
          {headingText}
        </h2>
        {section.subtitle ? <p>{section.subtitle}</p> : null}
        {section.description ? (
          <p className="home-ref-description" data-testid="custom-section-description">
            {section.description}
          </p>
        ) : null}
        {section.promoText ? (
          <p className="home-ref-promo-text">{section.promoText}</p>
        ) : null}
        <CampaignActions primary={section.primary} secondary={section.secondary} />
      </div>
      {shouldRenderVideo ? (
        <video
          key={`${section.id}-vid-${activeVideoSrc}`}
          data-testid="homepage-campaign-video"
          className="home-ref-hero-image home-ref-video-media"
          src={activeVideoSrc}
          poster={activePosterSrc}
          autoPlay={section.videoAutoplay !== false}
          muted={section.videoMuted !== false}
          loop={section.videoLoop !== false}
          playsInline
          preload="metadata"
          onError={() => setVideoFailed(true)}
          style={{
            objectFit: mediaFit,
            objectPosition,
            mixBlendMode,
          }}
        />
      ) : resolvedMobile ? (
        <picture key={`${section.id}-${resolvedDesktop}-${resolvedMobile}`} className="home-ref-hero-picture">
          <source media="(max-width: 768px)" srcSet={resolvedMobile} />
          <img
            className="home-ref-hero-image"
            src={resolvedDesktop || activePosterSrc}
            alt={section.alt || headingText}
            style={{
              objectFit: mediaFit,
              objectPosition,
              mixBlendMode,
            }}
            loading="lazy"
            decoding="async"
          />
        </picture>
      ) : (
        <img
          key={`${section.id}-${resolvedDesktop}`}
          className="home-ref-hero-image"
          src={resolvedDesktop || activePosterSrc}
          alt={section.alt || headingText}
          style={{
            objectFit: mediaFit,
            objectPosition,
            mixBlendMode,
          }}
          loading="lazy"
          decoding="async"
        />
      )}
    </section>
  );
}

function ServiceFlyerCard({ flyer }: { flyer: Pick<ServiceFlyer, "title" | "image" | "alt" | "to" | "backgroundColor"> }) {
  const { resolvedUrl } = useResolvedMediaUrl(flyer.image);
  const src = resolvedUrl || flyer.image;
  const isLocalPublicPng = !src.startsWith("blob:") && src.endsWith(".png") && !src.startsWith("http");
  const webpSrc = isLocalPublicPng ? src.replace(/\.png$/, ".webp") : src;
  return (
    <Link
      className="home-ref-service-card"
      to={flyer.to}
      aria-label={flyer.title}
      style={flyer.backgroundColor ? { backgroundColor: flyer.backgroundColor } : undefined}
    >
      <picture>
        {webpSrc !== src ? <source type="image/webp" srcSet={webpSrc} /> : null}
        <img src={src} alt={flyer.alt} width={1024} height={1536} loading="eager" decoding="async" />
      </picture>
    </Link>
  );
}

function ServiceFlyerCarousel({ flyers }: { flyers?: ServiceFlyer[] }) {
  const { homepage } = useCms();
  const activeFlyers =
    flyers && flyers.length > 0
      ? flyers
      : homepage?.serviceFlyers?.filter((f) => f.enabled) && homepage.serviceFlyers.filter((f) => f.enabled).length > 0
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
        {activeFlyers.map((flyer, index) => (
          <ServiceFlyerCard flyer={flyer} key={`${flyer.id || flyer.title}-${index}`} />
        ))}
      </div>
    </section>
  );
}
