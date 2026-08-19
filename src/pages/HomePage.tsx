import { ArrowRight } from "lucide-react";
import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useProductCatalog } from "../catalog/ProductCatalogContext";
import { SEO } from "../components/SEO";
import preorderStory from "../assets/categories/brand-new-devices-premium.webp";
import heroEcosystem from "../assets/hero/hero-cinematic-ecosystem-17-16-v4.webp";
import audioAccessoriesStory from "../assets/homepage/homepage-audio-accessories-story.jpg";
import gamingStory from "../assets/homepage/homepage-gaming-story.jpg";
import giftCardCampaign from "../assets/homepage/homepage-gift-card-campaign.jpg";
import installmentCampaign from "../assets/homepage/owner-installment-payment.jpg";
import iphoneStory from "../assets/homepage/homepage-iphone-story.jpg";
import laptopTabletStory from "../assets/homepage/homepage-laptop-tablet-story.jpg";
import referralCampaign from "../assets/homepage/owner-refer-friend.jpg";
import repairsCampaign from "../assets/homepage/owner-repairs.jpg";
import sellCashArtwork from "../assets/homepage/owner-sell-cash.jpg";
import upgradeSaveArtwork from "../assets/homepage/owner-upgrade-save.jpg";
import { business } from "../config/business";
import type { Product } from "../types/product";

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
  artShape?: "wide" | "square" | "poster" | "lineup";
  fallbackImage?: string;
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
    description: "AirPods, headphones, speakers and accessories.",
    image: audioAccessoriesStory,
    imageAlt: "Premium earbuds, headphones and accessory studio artwork",
    theme: "warm",
    primaryLabel: "Shop Audio",
    primaryTo: "/airpods",
    secondaryLabel: "Shop Accessories",
    secondaryTo: "/accessories",
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
    eyebrow: "Repairs",
    title: "Let the experts fix it.",
    description: "Phones. Laptops. Game consoles.",
    image: repairsCampaign,
    imageAlt: "Buy & Sell GH repairs and sales artwork",
    theme: "light",
    primaryLabel: "Book a Repair",
    primaryTo: "/repairs",
    secondaryLabel: "Get Support",
    secondaryTo: "/contact",
    artShape: "square",
  },
  {
    eyebrow: "Gift Card Trading",
    title: "Turn supported cards into value.",
    description: "Send card details for review and confirmation.",
    image: giftCardCampaign,
    imageAlt: "Premium phone and blank gift cards in a black and gold studio scene",
    theme: "gold",
    primaryLabel: "Check a Card",
    primaryTo: "/gift-cards",
    secondaryLabel: "Contact Us",
    secondaryTo: "/contact",
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
    eyebrow: "Trade-In",
    title: "Upgrade for less.",
    description: "Trade or swap your current device toward something newer.",
    image: upgradeSaveArtwork,
    imageAlt: "Buy & Sell GH upgrade and save trade-in artwork",
    theme: "black",
    primaryLabel: "Start a Trade",
    primaryTo: "/sell-or-trade",
    secondaryLabel: "How It Works",
    secondaryTo: "/sell-or-trade",
    artShape: "poster",
  },
];

const serviceItems = [
  { label: "Buy", to: "/shop" },
  { label: "Sell", to: "/sell-or-trade" },
  { label: "Trade", to: "/sell-or-trade" },
  { label: "Repair", to: "/repairs" },
  { label: "Installment", to: "/installment" },
  { label: "Gift Cards", to: "/gift-cards" },
  { label: "Pre-Order", to: "/pre-order" },
  { label: "Support", to: "/contact" },
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
        theme: "light" as const,
        primaryLabel: "Learn more",
        primaryTo: latestIphone.learnMoreTo,
        secondaryLabel: "Shop iPhone",
        secondaryTo: "/iphones",
        artShape: "lineup" as const,
        fallbackImage: iphoneStory,
      },
      ...baseMajorCampaigns.slice(1),
    ],
    [latestIphone],
  );

  return (
    <>
      <SEO
        title="Premium Tech Store in Accra | Buy & Sell GH"
        description="Buy & Sell GH helps customers buy, sell, trade, repair, pre-order and request original phones, iPads, laptops, gaming devices, audio, accessories and supported gift-card services in Accra."
      />

      <main className="campaign-home">
        {majorCampaigns.map((campaign, index) => (
          <CampaignSection campaign={campaign} priority={index === 0} key={campaign.title} />
        ))}

        <section className="campaign-tile-grid" aria-label="Buy & Sell GH services and categories">
          {featureTiles.map((campaign) => (
            <CampaignTile campaign={campaign} key={campaign.eyebrow} />
          ))}
        </section>

        <section className="campaign-everything-section" aria-labelledby="everything-buy-and-sell-gh">
          <div className="campaign-everything-copy">
            <p className="campaign-eyebrow">Everything Buy & Sell GH</p>
            <h2 id="everything-buy-and-sell-gh">Everything tech. One place.</h2>
            <p>Buy. Sell. Trade. Repair. All in one place, with availability and next steps confirmed before payment.</p>
          </div>
          <div className="campaign-service-ribbon" aria-label="Buy & Sell GH services">
            {serviceItems.map((item) => (
              <Link className="campaign-service-chip" to={item.to} key={item.label}>
                {item.label} <ArrowRight size={16} />
              </Link>
            ))}
          </div>
        </section>
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
  const image = imageProduct?.images?.[imageProduct.primaryImageIndex ?? 0]?.src ?? imageProduct?.images?.[0]?.src ?? iphoneStory;

  return {
    generationLabel,
    variants,
    image,
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

function iphoneVariantRank(product: Product) {
  const searchable = `${product.name} ${product.model} ${product.slug}`.toLowerCase();
  if (searchable.includes("pro-max") || searchable.includes("pro max")) return 5;
  if (searchable.includes("pro")) return 4;
  if (searchable.includes("plus")) return 3;
  if (searchable.includes("air")) return 2;
  return 1;
}
