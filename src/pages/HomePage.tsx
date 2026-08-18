import { ArrowRight, MapPin, MessageCircle, Search, ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";
import { SEO } from "../components/SEO";
import { WhatsAppButton } from "../components/WhatsAppButton";
import audioCategory from "../assets/categories/audio-premium.webp";
import gameConsolesCategory from "../assets/categories/game-consoles-premium.webp";
import iphonesCategory from "../assets/categories/iphones-premium.webp";
import macBooksCategory from "../assets/categories/macbooks-premium.webp";
import logoSceneArtwork from "../assets/brand/buy-sell-gh-logo-scene.webp";
import repairsSalesArtwork from "../assets/brand/repairs-sales.webp";
import sellOldIphoneArtwork from "../assets/brand/sell-old-iphone-cash.webp";
import ipadCategory from "../assets/products/ipad-pro-premium.webp";
import { business } from "../config/business";

const heroPoints = ["Original devices", "Trade-ins", "Pre-orders", "Accra support"];
const whatsappHref = `https://wa.me/${business.whatsapp.primary}`;

const storySections = [
  {
    theme: "light",
    eyebrow: "iPhone",
    title: "iPhone, checked and ready.",
    description:
      "Browse current iPhone listings, compare condition labels and confirm final availability before payment.",
    image: iphonesCategory,
    imageAlt: "Premium iPhone category artwork",
    primaryLabel: "Shop iPhone",
    primaryTo: "/iphones",
    secondaryLabel: "Contact us",
    secondaryTo: "/contact",
  },
  {
    theme: "dark",
    eyebrow: "Samsung",
    title: "Galaxy requests welcome.",
    description:
      "Buy & Sell GH also supports Samsung customers. Check available listings or request the exact Galaxy device you want.",
    image: logoSceneArtwork,
    imageAlt: "Buy & Sell GH brand artwork",
    primaryLabel: "Check Samsung",
    primaryTo: "/shop?brand=Samsung",
    secondaryLabel: "Request a device",
    secondaryTo: "/pre-order",
  },
  {
    theme: "gold",
    eyebrow: "Trade-In",
    title: "Turn your current phone into your next upgrade.",
    description:
      "Sell or swap your device, then use its value toward another phone, tablet, laptop or accessory after inspection.",
    image: sellOldIphoneArtwork,
    imageAlt: "Sell your old iPhone for cash artwork",
    primaryLabel: "Start Trade-In",
    primaryTo: "/sell-or-trade",
    secondaryLabel: "How it works",
    secondaryTo: "/sell-or-trade",
  },
  {
    theme: "dark",
    eyebrow: "Gaming",
    title: "Console support for serious play.",
    description:
      "Explore game consoles and gaming requests with the same clear confirmation flow used across the store.",
    image: gameConsolesCategory,
    imageAlt: "Game console category artwork",
    primaryLabel: "View Gaming",
    primaryTo: "/shop?category=Game%20Consoles",
    secondaryLabel: "Chat on WhatsApp",
    secondaryTo: whatsappHref,
    externalSecondary: true,
  },
  {
    theme: "light",
    eyebrow: "Audio",
    title: "AirPods, speakers and clean sound.",
    description:
      "Find AirPods and audio accessories, then confirm the exact model, connector and availability before pickup or delivery.",
    image: audioCategory,
    imageAlt: "Audio category artwork",
    primaryLabel: "Shop Audio",
    primaryTo: "/shop?category=Audio",
    secondaryLabel: "Accessories",
    secondaryTo: "/accessories",
  },
] as const;

export function HomePage() {
  return (
    <>
      <SEO
        title="Original Phones, iPads, Laptops and Accessories in Accra"
        description="Buy & Sell GH sells original phones, iPads, laptops, gaming devices, audio and accessories in Accra with trade-in, pre-order and WhatsApp support."
      />

      <main className="apple-home-page">
        <section className="apple-hero-section" aria-labelledby="home-hero-title">
          <div className="apple-hero-copy">
            <p className="apple-eyebrow">Buy & Sell GH</p>
            <h1 id="home-hero-title">Premium devices. Trusted deals.</h1>
            <p>
              Shop original phones, iPads, laptops, gaming, audio and accessories in Accra. Buy, sell, trade or pre-order
              with clear confirmation before payment.
            </p>
            <div className="apple-action-row">
              <Link className="apple-button apple-button-primary" to="/shop">
                Shop now <ArrowRight size={18} />
              </Link>
              <Link className="apple-button apple-button-secondary" to="/sell-or-trade">
                Sell or trade
              </Link>
            </div>
            <div className="apple-hero-points" aria-label="Store benefits">
              {heroPoints.map((point) => (
                <span key={point}>{point}</span>
              ))}
            </div>
          </div>

          <div className="apple-hero-art" aria-label="Buy & Sell GH premium device artwork">
            <div className="apple-hero-ring" aria-hidden="true" />
            <img
              className="apple-hero-device-art"
              src={repairsSalesArtwork}
              alt="Buy & Sell GH phones, laptop, tablet, watch and game console artwork"
              loading="eager"
              decoding="async"
              fetchPriority="high"
            />
            <img className="apple-hero-logo-art" src={logoSceneArtwork} alt="" loading="eager" decoding="async" />
            <div className="apple-hero-sweep" aria-hidden="true" />
          </div>
        </section>

        <section className="apple-brand-ribbon" aria-label="Store range">
          <span>Phones</span>
          <span>Tablets</span>
          <span>Laptops</span>
          <span>Gaming</span>
          <span>Audio</span>
          <span>Accessories</span>
        </section>

        {storySections.map((section) => (
          <section className={`apple-story-section apple-story-${section.theme}`} key={section.title}>
            <div className="apple-story-copy">
              <p className="apple-eyebrow">{section.eyebrow}</p>
              <h2>{section.title}</h2>
              <p>{section.description}</p>
              <div className="apple-action-row">
                <Link className="apple-button apple-button-primary" to={section.primaryTo}>
                  {section.primaryLabel} <ArrowRight size={18} />
                </Link>
                {"externalSecondary" in section && section.externalSecondary ? (
                  <a className="apple-button apple-button-secondary" href={section.secondaryTo} target="_blank" rel="noopener noreferrer">
                    {section.secondaryLabel}
                  </a>
                ) : (
                  <Link className="apple-button apple-button-secondary" to={section.secondaryTo}>
                    {section.secondaryLabel}
                  </Link>
                )}
              </div>
            </div>
            <div className="apple-story-art">
              <img src={section.image} alt={section.imageAlt} loading="lazy" decoding="async" />
            </div>
          </section>
        ))}

        <section className="apple-duo-section" aria-label="Laptops and tablets">
          <article className="apple-duo-panel apple-duo-dark">
            <div>
              <p className="apple-eyebrow">Laptops</p>
              <h2>MacBooks and premium laptops.</h2>
              <p>Portable machines for school, work and creative upgrades.</p>
              <Link className="apple-link" to="/macbooks">
                Shop laptops <ArrowRight size={16} />
              </Link>
            </div>
            <img src={macBooksCategory} alt="Premium laptop category artwork" loading="lazy" decoding="async" />
          </article>

          <article className="apple-duo-panel apple-duo-light">
            <div>
              <p className="apple-eyebrow">iPad</p>
              <h2>Tablets for work, class and play.</h2>
              <p>Compare iPad models or request the storage and colour you want.</p>
              <Link className="apple-link" to="/ipads">
                Shop iPads <ArrowRight size={16} />
              </Link>
            </div>
            <img src={ipadCategory} alt="Premium iPad artwork" loading="lazy" decoding="async" />
          </article>
        </section>

        <section className="apple-support-section" aria-label="Support options">
          <article>
            <Search size={24} />
            <h2>Pre-order a device.</h2>
            <p>Tell us the model, colour, storage and budget. We will help source it.</p>
            <Link to="/pre-order">Request device</Link>
          </article>
          <article>
            <MessageCircle size={24} />
            <h2>Chat on WhatsApp.</h2>
            <p>Confirm availability, pickup, delivery and final details with the shop.</p>
            <WhatsAppButton>Chat now</WhatsAppButton>
          </article>
          <article>
            <MapPin size={24} />
            <h2>Visit Dome Pillar 2.</h2>
            <p>Buy & Sell GH is available in Accra for inspection and support.</p>
            <Link to="/contact">Get directions</Link>
          </article>
          <article>
            <ShoppingBag size={24} />
            <h2>Shop with clarity.</h2>
            <p>Products are checked, labelled and confirmed before payment.</p>
            <Link to="/shop">Browse store</Link>
          </article>
        </section>

        <section className="apple-final-section">
          <div>
            <p className="apple-eyebrow">Buy & Sell GH</p>
            <h2>Your next upgrade starts here.</h2>
          </div>
          <div className="apple-action-row">
            <Link className="apple-button apple-button-primary" to="/shop">
              Shop devices
            </Link>
            <WhatsAppButton>WhatsApp</WhatsAppButton>
          </div>
        </section>
      </main>
    </>
  );
}
