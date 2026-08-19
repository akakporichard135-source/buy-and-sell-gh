import { ArrowRight, MapPin, MessageCircle, Search, ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";
import { SEO } from "../components/SEO";
import { WhatsAppButton } from "../components/WhatsAppButton";
import audioAccessoriesStory from "../assets/homepage/homepage-audio-accessories-story.jpg";
import gamingStory from "../assets/homepage/homepage-gaming-story.jpg";
import giftCardCampaign from "../assets/homepage/homepage-gift-card-campaign.jpg";
import installmentCampaign from "../assets/homepage/owner-installment-payment.jpg";
import iphoneStory from "../assets/homepage/homepage-iphone-story.jpg";
import laptopTabletStory from "../assets/homepage/homepage-laptop-tablet-story.jpg";
import referralCampaign from "../assets/homepage/owner-refer-friend.jpg";
import repairsCampaign from "../assets/homepage/owner-repairs.jpg";
import storeCampaign from "../assets/homepage/owner-store-flyer.jpg";
import sellCashArtwork from "../assets/homepage/owner-sell-cash.jpg";
import upgradeSaveArtwork from "../assets/homepage/owner-upgrade-save.jpg";
import { business } from "../config/business";

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
  artShape?: "wide" | "square" | "poster";
};

const campaigns: Campaign[] = [
  {
    eyebrow: "Buy & Sell GH",
    title: "Premium tech. Your way.",
    description: "Buy, sell, trade, repair, pre-order and get support from Dome Pillar 2 in Accra.",
    image: storeCampaign,
    imageAlt: "Premium smartphone handoff in a black and gold Buy & Sell GH studio scene",
    theme: "black",
    primaryLabel: "Shop",
    primaryTo: "/shop",
    secondaryLabel: "Learn more",
    secondaryTo: "/about",
    imagePriority: true,
    artShape: "square",
  },
  {
    eyebrow: "iPhone / Phones",
    title: "Find the phone that fits.",
    description: "Browse iPhones and supported phone requests with clear condition labels and availability confirmation.",
    image: iphoneStory,
    imageAlt: "Premium iPhone shopping artwork",
    theme: "light",
    primaryLabel: "Shop iPhone",
    primaryTo: "/iphones",
    secondaryLabel: "Samsung requests",
    secondaryTo: "/shop?brand=Samsung",
    artShape: "wide",
  },
  {
    eyebrow: "iPhone Installment",
    title: "Own an iPhone today.",
    description: "Pay just 40% upfront. Ghana Card and 40% initial payment are required before Buy & Sell GH confirms next steps.",
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
    description: "Repair support for mobile phones, laptops and game consoles, prepared for WhatsApp follow-up.",
    image: repairsCampaign,
    imageAlt: "Technician repairing a smartphone in a premium black and gold workspace",
    theme: "light",
    primaryLabel: "Book a repair",
    primaryTo: "/repairs",
    secondaryLabel: "Get support",
    secondaryTo: "/contact",
    artShape: "square",
  },
  {
    eyebrow: "Gift Card Trading",
    title: "Turn supported cards into value.",
    description: "Send card details for review. Buy & Sell GH confirms accepted card types and value before any next step.",
    image: giftCardCampaign,
    imageAlt: "Premium phone and blank gift cards in a black and gold studio scene",
    theme: "gold",
    primaryLabel: "Check a card",
    primaryTo: "/gift-cards",
    secondaryLabel: "Contact us",
    secondaryTo: "/contact",
  },
  {
    eyebrow: "Refer a Friend",
    title: "Good tech is better when shared.",
    description: "Refer someone looking for a device, repair, trade-in or pre-order without any unconfirmed reward promises.",
    image: referralCampaign,
    imageAlt: "Premium smartphones with a sharing icon for referrals",
    theme: "warm",
    primaryLabel: "Refer someone",
    primaryTo: "/refer-a-friend",
    secondaryLabel: "Learn more",
    secondaryTo: "/refer-a-friend",
    artShape: "wide",
  },
  {
    eyebrow: "Gaming",
    title: "Consoles and gaming support for serious play.",
    description: "Explore game console listings and requests with the same clear confirmation flow used across the store.",
    image: gamingStory,
    imageAlt: "Premium game console and controller studio artwork",
    theme: "black",
    primaryLabel: "View gaming",
    primaryTo: "/shop?category=Game%20Consoles",
    secondaryLabel: "WhatsApp",
    secondaryTo: whatsappHref,
    secondaryExternal: true,
  },
  {
    eyebrow: "Laptops / Tablets",
    title: "MacBooks, laptops and iPads for work and school.",
    description: "Compare laptop and tablet options, then confirm availability before pickup, delivery or pre-order.",
    image: laptopTabletStory,
    imageAlt: "Premium laptop and tablet studio artwork",
    theme: "light",
    primaryLabel: "Shop laptops",
    primaryTo: "/macbooks",
    secondaryLabel: "Shop tablets",
    secondaryTo: "/ipads",
  },
  {
    eyebrow: "Audio / Accessories",
    title: "AirPods, audio and everyday essentials.",
    description: "Find AirPods, chargers, cases, cables and accessories with model-specific details where available.",
    image: audioAccessoriesStory,
    imageAlt: "Premium earbuds, headphones and accessory studio artwork",
    theme: "warm",
    primaryLabel: "Shop AirPods",
    primaryTo: "/airpods",
    secondaryLabel: "Accessories",
    secondaryTo: "/accessories",
  },
];

export function HomePage() {
  return (
    <>
      <SEO
        title="Premium Tech Store in Accra | Buy & Sell GH"
        description="Buy & Sell GH helps customers buy, sell, trade, repair, pre-order and request original phones, iPads, laptops, gaming devices, audio, accessories and supported gift-card services in Accra."
      />

      <main className="campaign-home">
        {campaigns.map((campaign, index) => (
          <CampaignSection campaign={campaign} priority={index === 0} key={campaign.title} />
        ))}

        <section className="campaign-support-grid" aria-label="Pre-order and support options">
          <article>
            <Search size={24} />
            <p className="campaign-eyebrow">Pre-Order</p>
            <h2>Request the exact device you want.</h2>
            <p>Tell us the model, colour, storage and budget. We will help source it and confirm next steps.</p>
            <Link to="/pre-order">Request device</Link>
          </article>
          <article>
            <MessageCircle size={24} />
            <p className="campaign-eyebrow">WhatsApp</p>
            <h2>Talk directly with the shop.</h2>
            <p>Confirm availability, pickup, delivery, repair, gift-card and trade-in details with Buy & Sell GH.</p>
            <WhatsAppButton>Chat now</WhatsAppButton>
          </article>
          <article>
            <MapPin size={24} />
            <p className="campaign-eyebrow">Visit</p>
            <h2>Dome Pillar 2, Accra.</h2>
            <p>Bring devices for inspection, support and final confirmation before payment.</p>
            <Link to="/contact">Get directions</Link>
          </article>
          <article>
            <ShoppingBag size={24} />
            <p className="campaign-eyebrow">Store</p>
            <h2>Browse with clarity.</h2>
            <p>The shop remains Buy & Sell GH operated. Product grids stay inside Store where they belong.</p>
            <Link to="/shop">Open store</Link>
          </article>
        </section>

        <section className="campaign-final-section">
          <p className="campaign-eyebrow">Buy & Sell GH</p>
          <h2>Your next upgrade starts here.</h2>
          <div className="campaign-actions">
            <Link className="campaign-button campaign-button-primary" to="/shop">
              Shop devices
            </Link>
            <WhatsAppButton>WhatsApp</WhatsAppButton>
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
          />
        </div>
      </div>
    </section>
  );
}

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}
