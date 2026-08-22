import { ArrowRight } from "lucide-react";
import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useProductCatalog } from "../catalog/ProductCatalogContext";
import { SEO } from "../components/SEO";
import accessoriesStory from "../assets/categories/accessories-premium.webp";
import preorderStory from "../assets/categories/brand-new-devices-premium.webp";
import heroEcosystem from "../assets/hero/hero-cinematic-ecosystem-17-16-v4.webp";
import audioAccessoriesStory from "../assets/homepage/homepage-audio-accessories-story.jpg";
import gamingStory from "../assets/homepage/homepage-gaming-story.jpg";
import visaCardCampaign from "../assets/homepage/homepage-visa-card-single.webp";
import installmentCampaign from "../assets/homepage/owner-installment-payment.jpg";
import iphoneStory from "../assets/homepage/homepage-iphone-story.jpg";
import laptopTabletStory from "../assets/homepage/homepage-laptop-tablet-story.jpg";
import referralCampaign from "../assets/homepage/owner-refer-friend.jpg";
import repairsCampaign from "../assets/homepage/owner-repairs.jpg";
import sellCashArtwork from "../assets/homepage/owner-sell-cash.jpg";
import upgradeSaveArtwork from "../assets/homepage/owner-upgrade-save.jpg";
import appleWatchStory from "../assets/products/apple-watch-series-11-premium.webp";
import ipadAirStory from "../assets/products/ipad-air-11-inch-m4-premium.webp";
import ipadProStory from "../assets/products/ipad-pro-13-inch-m5-premium.webp";
import macbookAirStory from "../assets/products/macbook-air-13-inch-m5-premium.webp";
import macbookProStory from "../assets/products/macbook-pro-14-inch-m5-pro-max-premium.webp";
import { business } from "../config/business";
import type { Product } from "../types/product";
import { resolveProductImage } from "../utils/productImages";

const whatsappHref = "https://wa.me/" + business.whatsapp.primary;

type CampaignTheme = "black" | "light" | "gold" | "warm";

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
  secondaryExternal?: boolean;
  notes?: string[];
  imagePriority?: boolean;
  artShape?: "wide" | "square" | "poster" | "lineup" | "card";
  fallbackImage?: string;
  galleryImages?: { src: string; alt: string }[];
};

const baseMajorCampaigns: Campaign[] = [
  {
    eyebrow: "Buy & Sell GH",
    title: "Premium tech. Your way.",
    description: "Buy, sell, trade, repair, pre-order and get support from Dome Pillar 2 in Accra.",
    image: heroEcosystem,
    imageAlt: "Premium Buy & Sell GH product composition with iPhones, laptop, watch and audio accessories",
    theme: "black",
    primaryLabel: "Shop",
    primaryTo: "/shop",
    secondaryLabel: "Learn more",
    secondaryTo: "/about",
    imagePriority: true,
    artShape: "wide",
  },
  {
    eyebrow: "iPhone Installment",
    title: "Own an iPhone today.",
    description: "40% upfront. Ghana Card and initial payment are required before Buy & Sell GH confirms next steps.",
    image: installmentCampaign,
    imageAlt: "Premium iPhones with gold payment tokens for installment enquiries",
    theme: "black",
    primaryLabel: "Learn more",
    primaryTo: "/installment",
    secondaryLabel: "Enquire on WhatsApp",
    secondaryTo: whatsappHref,
    secondaryExternal: true,
    notes: ["40% upfront", "Ghana Card required"],
    artShape: "poster",
  },
  {
    eyebrow: "Sell Your Device",
    title: "Turn your old device into cash.",
    description: "Bring your phone, tablet, laptop, watch or game console for inspection and a confirmed offer.",
    image: sellCashArtwork,
    imageAlt: "Premium trade-in counter artwork for selling an old device",
    theme: "warm",
    primaryLabel: "Get started",
    primaryTo: "/sell-or-trade",
    secondaryLabel: "How it works",
    secondaryTo: "/sell-or-trade",
    artShape: "square",
  },
  {
    eyebrow: "Upgrade & Save",
    title: "Trade what you have for what you want next.",
    description: "Swap old iPhones, MacBooks, game consoles and iPads toward newer versions after inspection.",
    image: upgradeSaveArtwork,
    imageAlt: "Premium device upgrade value artwork",
    theme: "black",
    primaryLabel: "Start a trade",
    primaryTo: "/sell-or-trade",
    secondaryLabel: "Request device",
    secondaryTo: "/pre-order",
    artShape: "poster",
  },
  {
    eyebrow: "Repairs",
    title: "Let the experts fix it.",
    description: "Phones. Laptops. Game consoles.",
    image: repairsCampaign,
    imageAlt: "Technician repairing a smartphone in a premium black and gold workspace",
    theme: "light",
    primaryLabel: "Book a repair",
    primaryTo: "/repairs",
    secondaryLabel: "Get support",
    secondaryTo: "/contact",
    notes: ["Mobile phones", "Laptops", "Game consoles"],
    artShape: "square",
  },
];

const macbookAirCampaign: Campaign = {
  eyebrow: "MacBook Air",
  title: "Power that travels light.",
  description: "Explore the latest MacBook Air models available through Buy & Sell GH.",
  image: macbookAirStory,
  imageAlt: "MacBook Air in a clean premium product presentation",
  theme: "warm",
  primaryLabel: "Learn more",
  primaryTo: "/macbooks?family=MacBook%20Air",
  secondaryLabel: "Shop MacBook",
  secondaryTo: "/shop?category=MacBooks",
  artShape: "wide",
};

const productStoryTiles: Campaign[] = [
  {
    eyebrow: "iPad Air",
    title: "Light. Bright. Capable.",
    description: "A powerful iPad for work, study and creativity.",
    image: ipadAirStory,
    imageAlt: "iPad Air in a clean premium product presentation",
    theme: "light",
    primaryLabel: "Learn more",
    primaryTo: "/ipads?family=iPad%20Air",
    secondaryLabel: "Shop iPad",
    secondaryTo: "/shop?category=iPads",
  },
  {
    eyebrow: "MacBook Pro",
    title: "Built for demanding work.",
    description: "Discover MacBook Pro models for serious performance.",
    image: macbookProStory,
    imageAlt: "MacBook Pro in a dark premium product presentation",
    theme: "black",
    primaryLabel: "Learn more",
    primaryTo: "/macbooks?family=MacBook%20Pro",
    secondaryLabel: "Shop MacBook",
    secondaryTo: "/shop?category=MacBooks",
  },
  {
    eyebrow: "Apple Watch",
    title: "Stay connected. Keep moving.",
    description: "Apple Watch models for everyday activity and connection.",
    image: appleWatchStory,
    imageAlt: "Apple Watch in a clean premium product presentation",
    theme: "warm",
    primaryLabel: "Learn more",
    primaryTo: "/apple-watch",
    secondaryLabel: "Shop Watch",
    secondaryTo: "/shop?category=Apple%20Watches",
  },
  {
    eyebrow: "iPad Pro",
    title: "Big ideas. Pro power.",
    description: "A premium iPad experience for advanced creative work.",
    image: ipadProStory,
    imageAlt: "iPad Pro in a dark premium product presentation",
    theme: "black",
    primaryLabel: "Learn more",
    primaryTo: "/ipads?family=iPad%20Pro",
    secondaryLabel: "Shop iPad",
    secondaryTo: "/shop?category=iPads",
  },
];

const featureTiles: Campaign[] = [
  {
    eyebrow: "Gaming",
    title: "Play more.",
    description: "Consoles, controllers and gaming accessories.",
    image: gamingStory,
    imageAlt: "Premium game console and controller studio artwork",
    theme: "black",
    primaryLabel: "Shop Gaming",
    primaryTo: "/shop?category=Game%20Consoles",
    secondaryLabel: "Learn more",
    secondaryTo: "/shop?category=Game%20Consoles",
  },
  {
    eyebrow: "Audio",
    title: "Hear more.",
    description: "Headphones, earbuds and speakers.",
    image: audioAccessoriesStory,
    imageAlt: "Premium earbuds, headphones and accessory studio artwork",
    theme: "warm",
    primaryLabel: "Shop Audio",
    primaryTo: "/airpods",
    secondaryLabel: "Learn more",
    secondaryTo: "/airpods",
  },
  {
    eyebrow: "Laptops & Tablets",
    title: "Work. Study. Create.",
    description: "MacBooks, laptops, iPads and tablets.",
    image: laptopTabletStory,
    imageAlt: "Premium laptop and tablet studio artwork",
    theme: "light",
    primaryLabel: "Shop laptops",
    primaryTo: "/macbooks",
    secondaryLabel: "Shop tablets",
    secondaryTo: "/ipads",
  },
  {
    eyebrow: "Accessories",
    title: "Everything that completes your setup.",
    description: "Cases, chargers, cables and essentials for supported devices.",
    image: accessoriesStory,
    imageAlt: "Premium Apple accessories arranged for a clean setup",
    theme: "black",
    primaryLabel: "Shop Accessories",
    primaryTo: "/accessories",
    artShape: "wide",
  },
  {
    eyebrow: "Visa Card Trading",
    title: "Turn supported Visa cards into value.",
    description: "Send card details for review and confirmation.",
    image: visaCardCampaign,
    imageAlt: "One original unbranded black and gold card for supported card review",
    theme: "warm",
    primaryLabel: "Check a Card",
    primaryTo: "/gift-cards",
    secondaryLabel: "Contact Us",
    secondaryTo: "/contact",
    artShape: "card",
  },
  {
    eyebrow: "Refer a Friend",
    title: "Good tech is better when shared.",
    description: "Refer someone to Buy & Sell GH.",
    image: referralCampaign,
    imageAlt: "Buy & Sell GH refer a friend artwork",
    theme: "warm",
    primaryLabel: "Refer Someone",
    primaryTo: "/refer-a-friend",
    secondaryLabel: "Learn More",
    secondaryTo: "/refer-a-friend",
    artShape: "wide",
  },
  {
    eyebrow: "Pre-Order",
    title: "Can't find it? Request it.",
    description: "Tell us the model, colour, storage and budget so Buy & Sell GH can confirm next steps.",
    image: preorderStory,
    imageAlt: "Premium devices arranged for a device request campaign",
    theme: "light",
    primaryLabel: "Request a Device",
    primaryTo: "/pre-order",
    secondaryLabel: "Learn more",
    secondaryTo: "/device-request",
  },
  {
    eyebrow: "Support",
    title: "We're here when you need us.",
    description: "Chat on WhatsApp, call us or visit Buy & Sell GH at Dome Pillar 2 in Accra.",
    image: heroEcosystem,
    imageAlt: "Buy & Sell GH premium product support visual",
    theme: "black",
    primaryLabel: "Get Support",
    primaryTo: "/contact",
    secondaryLabel: "WhatsApp",
    secondaryTo: whatsappHref,
    secondaryExternal: true,
    artShape: "wide",
  },
];

const shoppingTiles = [
  ...productStoryTiles,
  featureTiles[0],
  featureTiles[1],
  featureTiles[2],
  featureTiles[3],
];

const serviceCampaigns = [
  baseMajorCampaigns[3],
  featureTiles[4],
  baseMajorCampaigns[1],
  baseMajorCampaigns[2],
  baseMajorCampaigns[4],
  featureTiles[5],
  featureTiles[7],
];

export function HomePage() {
  const { activeProducts } = useProductCatalog();
  const latestIphone = useMemo(() => getLatestIphoneLineup(activeProducts), [activeProducts]);
  const majorCampaigns = useMemo(
    () => [
      baseMajorCampaigns[0],
      {
        eyebrow: "iPhone",
        title: latestIphone.generationLabel,
        description: "Meet the latest lineup available through Buy & Sell GH.",
        image: latestIphone.image,
        imageAlt: latestIphone.imageAlt,
        galleryImages: latestIphone.galleryImages,
        theme: "light" as const,
        primaryLabel: "Learn more",
        primaryTo: latestIphone.learnMoreTo,
        secondaryLabel: "Shop iPhone",
        secondaryTo: "/iphones",
        artShape: "lineup" as const,
        fallbackImage: iphoneStory,
      },
      macbookAirCampaign,
    ],
    [latestIphone],
  );

  return (
    <>
      <SEO
        title="Premium Tech Store in Accra | Buy & Sell GH"
        description="Buy & Sell GH helps customers buy, sell, trade, repair, pre-order and request original phones, iPads, laptops, gaming devices, audio, accessories and supported Visa card trading services in Accra."
      />

      <main className="campaign-home">
        {majorCampaigns.map((campaign, index) => (
          <CampaignSection campaign={campaign} priority={index === 0} key={campaign.title} />
        ))}

        <section className="campaign-tile-grid campaign-product-grid" aria-label="Featured products and shopping categories">
          {shoppingTiles.map((campaign) => (
            <CampaignTile campaign={campaign} key={campaign.eyebrow} />
          ))}
        </section>

        <CampaignSection campaign={featureTiles[6]} />

        {serviceCampaigns.map((campaign) => (
          <CampaignSection campaign={campaign} key={campaign.eyebrow} />
        ))}
      </main>
    </>
  );
}

function CampaignSection({ campaign, priority }: { campaign: Campaign; priority?: boolean }) {
  return (
    <section className={"campaign-section campaign-" + campaign.theme} aria-labelledby={"campaign-" + slugify(campaign.title)}>
      <div className="campaign-inner">
        <div className="campaign-copy">
          <p className="campaign-eyebrow">{campaign.eyebrow}</p>
          <h1 id={"campaign-" + slugify(campaign.title)}>{campaign.title}</h1>
          <p>{campaign.description}</p>
          {campaign.notes && (
            <div className="campaign-note-row" aria-label="Service notes">
              {campaign.notes.map((note) => (
                <span key={note}>{note}</span>
              ))}
            </div>
          )}
          <div className="campaign-actions">
            <Link className="campaign-button campaign-button-primary" to={campaign.primaryTo}>
              {campaign.primaryLabel} <ArrowRight size={18} />
            </Link>
            {campaign.secondaryLabel && campaign.secondaryTo && (
              campaign.secondaryExternal ? (
                <a className="campaign-button campaign-button-secondary" href={campaign.secondaryTo} target="_blank" rel="noopener noreferrer">
                  {campaign.secondaryLabel}
                </a>
              ) : (
                <Link className="campaign-button campaign-button-secondary" to={campaign.secondaryTo}>
                  {campaign.secondaryLabel}
                </Link>
              )
            )}
          </div>
        </div>
        <div className={"campaign-art campaign-art-" + (campaign.artShape ?? "wide")}>
          {campaign.galleryImages && campaign.galleryImages.length > 1 ? (
            <div className="campaign-lineup-gallery" aria-label={campaign.imageAlt}>
              {campaign.galleryImages.map((image, index) => (
                <img
                  src={image.src}
                  alt={image.alt}
                  loading={priority || campaign.imagePriority || index === 0 ? "eager" : "lazy"}
                  decoding="async"
                  fetchPriority={priority || campaign.imagePriority || index === 0 ? "high" : "auto"}
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
              loading={priority || campaign.imagePriority ? "eager" : "lazy"}
              decoding="async"
              fetchPriority={priority || campaign.imagePriority ? "high" : "auto"}
              onError={(event) => {
                if (!campaign.fallbackImage || event.currentTarget.dataset.fallbackApplied) return;
                event.currentTarget.dataset.fallbackApplied = "true";
                event.currentTarget.src = campaign.fallbackImage;
              }}
            />
          )}
        </div>
      </div>
    </section>
  );
}

function CampaignTile({ campaign }: { campaign: Campaign }) {
  return (
    <article className={"campaign-tile campaign-" + campaign.theme} aria-labelledby={"tile-" + slugify(campaign.title)}>
      <div className="campaign-tile-copy">
        <p className="campaign-eyebrow">{campaign.eyebrow}</p>
        <h2 id={"tile-" + slugify(campaign.title)}>{campaign.title}</h2>
        <p>{campaign.description}</p>
        <div className="campaign-actions">
          {campaign.primaryTo.startsWith("http") ? (
            <a className="campaign-button campaign-button-primary" href={campaign.primaryTo} target="_blank" rel="noopener noreferrer">
              {campaign.primaryLabel} <ArrowRight size={18} />
            </a>
          ) : (
            <Link className="campaign-button campaign-button-primary" to={campaign.primaryTo}>
              {campaign.primaryLabel} <ArrowRight size={18} />
            </Link>
          )}
          {campaign.secondaryLabel && campaign.secondaryTo && (
            campaign.secondaryExternal ? (
              <a className="campaign-button campaign-button-secondary" href={campaign.secondaryTo} target="_blank" rel="noopener noreferrer">
                {campaign.secondaryLabel}
              </a>
            ) : (
              <Link className="campaign-button campaign-button-secondary" to={campaign.secondaryTo}>
                {campaign.secondaryLabel}
              </Link>
            )
          )}
        </div>
      </div>
      <div className={"campaign-tile-art campaign-art-" + (campaign.artShape ?? "wide")}>
        <img src={campaign.image} alt={campaign.imageAlt} loading="lazy" decoding="async" />
      </div>
    </article>
  );
}

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function getLatestIphoneLineup(products: Product[]) {
  const ranked = products
    .map((product) => ({ product, generationNumber: getIphoneGenerationNumber(product) }))
    .filter((entry): entry is { product: Product; generationNumber: number } => entry.generationNumber !== null);
  const newestNumber = ranked.length ? Math.max(...ranked.map((entry) => entry.generationNumber)) : null;
  const generationLabel = newestNumber ? `iPhone ${newestNumber}` : "iPhone";
  const variants = newestNumber
    ? ranked.filter((entry) => entry.generationNumber === newestNumber).map((entry) => entry.product)
    : [];
  const imageProduct = selectBestIphoneImageProduct(variants);
  const resolvedImage = imageProduct ? resolveProductImage(imageProduct) : undefined;
  const image = resolvedImage?.src ?? iphoneStory;

  return {
    generationLabel,
    variants,
    image,
    galleryImages: getLatestIphoneGalleryImages(variants),
    imageAlt: imageProduct
      ? `${generationLabel} lineup featuring ${imageProduct.name}`
      : "Premium iPhone lineup artwork for Buy & Sell GH",
    learnMoreTo: newestNumber
      ? `/shop?category=Phones&brand=Apple&generation=${encodeURIComponent(generationLabel)}`
      : "/iphones",
  };
}

function getIphoneGenerationNumber(product: Product) {
  if (product.brand !== "Apple" || product.category !== "iPhones") return null;
  const searchable = [product.generation, product.name, product.model, product.slug].filter(Boolean).join(" ");
  const match = searchable.match(/\biPhone[\s-]*(\d{2})\b/i);
  return match ? Number(match[1]) : null;
}

function selectBestIphoneImageProduct(variants: Product[]) {
  if (!variants.length) return undefined;
  const sorted = [...variants].sort((a, b) => iphoneVariantRank(b) - iphoneVariantRank(a));
  return sorted.find((product) => product.images?.length) ?? sorted[0];
}

function getLatestIphoneGalleryImages(variants: Product[]) {
  return [...variants]
    .sort((a, b) => iphoneVariantRank(b) - iphoneVariantRank(a))
    .map((product) => {
      const image = resolveProductImage(product);
      return image ? { src: image.src, alt: image.alt || product.name } : null;
    })
    .filter((entry): entry is { src: string; alt: string } => Boolean(entry))
    .slice(0, 4);
}

function iphoneVariantRank(product: Product) {
  const searchable = `${product.name} ${product.model} ${product.slug}`.toLowerCase();
  if (searchable.includes("pro-max") || searchable.includes("pro max")) return 5;
  if (searchable.includes("pro")) return 4;
  if (searchable.includes("plus")) return 3;
  if (searchable.includes("air")) return 2;
  return 1;
}
