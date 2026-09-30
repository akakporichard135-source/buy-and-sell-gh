import { ArrowRight, CreditCard, MapPin, MessageCircle, RefreshCw, Wrench } from "lucide-react";
import { Link } from "react-router-dom";
import { intentWhatsAppUrl } from "../../utils/whatsapp";
import { StoreCarousel } from "./StoreCarousel";

interface HelpCardItem {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  actionLabel: string;
  actionPath: string;
  isExternal?: boolean;
  icon: typeof MessageCircle;
}

const helpCards: HelpCardItem[] = [
  {
    id: "chat",
    eyebrow: "PERSONAL SHOPPING",
    title: "Chat with a specialist.",
    description: "Ask questions, compare device models, and confirm immediate Accra availability directly on WhatsApp.",
    actionLabel: "Chat on WhatsApp",
    actionPath: intentWhatsAppUrl("general"),
    isExternal: true,
    icon: MessageCircle,
  },
  {
    id: "repairs",
    eyebrow: "CERTIFIED SERVICE",
    title: "Professional device repair.",
    description: "Expert screen replacements, battery upgrades, and board repairs for phones, laptops, and consoles.",
    actionLabel: "Explore repairs",
    actionPath: "/repairs",
    icon: Wrench,
  },
  {
    id: "installment",
    eyebrow: "FLEXIBLE PAYMENT",
    title: "Own your device today.",
    description: "Spread the cost comfortably across manageable installment plans with transparent requirements.",
    actionLabel: "View installment plans",
    actionPath: "/installment",
    icon: CreditCard,
  },
  {
    id: "trade-in",
    eyebrow: "TRADE IN OR SELL",
    title: "Upgrade and save.",
    description: "Get fair valuation toward your next device upgrade or receive instant cash for your used electronics.",
    actionLabel: "Get an estimate",
    actionPath: "/sell-or-trade",
    icon: RefreshCw,
  },
  {
    id: "support",
    eyebrow: "AFTERCARE & PICKUP",
    title: "Order assistance.",
    description: "Have questions about an existing order request, express delivery, or pickup at Dome Pillar 2?",
    actionLabel: "Contact support",
    actionPath: "/contact",
    icon: MapPin,
  },
];

export function StoreHelpCards() {
  return (
    <section className="store-section store-help-section" aria-labelledby="store-help-title">
      <div className="store-container">
        <StoreCarousel
          eyebrow="HELP IS HERE"
          title="Whenever you need it."
          subtitle="Support, flexible financing, repairs, and trade-in services tailored for Ghana."
          controlsAriaLabel="Store help services carousel navigation"
          trackClassName="store-help-track"
        >
          {helpCards.map((card) => {
            const Icon = card.icon;
            return (
              <article key={card.id} className="store-help-card">
                <div className="store-help-card-icon" aria-hidden="true">
                  <Icon size={26} strokeWidth={2} />
                </div>
                <div className="store-help-card-body">
                  <p className="store-help-card-eyebrow">{card.eyebrow}</p>
                  <h3 className="store-help-card-title">{card.title}</h3>
                  <p className="store-help-card-copy">{card.description}</p>
                </div>
                <div className="store-help-card-action">
                  {card.isExternal ? (
                    <a
                      href={card.actionPath}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="store-help-action-link"
                    >
                      {card.actionLabel} <ArrowRight size={15} aria-hidden="true" />
                    </a>
                  ) : (
                    <Link to={card.actionPath} className="store-help-action-link">
                      {card.actionLabel} <ArrowRight size={15} aria-hidden="true" />
                    </Link>
                  )}
                </div>
              </article>
            );
          })}
        </StoreCarousel>
      </div>
    </section>
  );
}
