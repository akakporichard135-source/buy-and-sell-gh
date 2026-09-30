import { ArrowRight, CreditCard, MapPin, MessageCircle, RefreshCw, ShieldCheck, Wrench } from "lucide-react";
import { Link } from "react-router-dom";
import { intentWhatsAppUrl } from "../../utils/whatsapp";
import { StoreCarousel } from "./StoreCarousel";

interface HelpCardItem {
  id: string;
  category: string;
  badge: string;
  title: string;
  description: string;
  actionLabel: string;
  actionPath: string;
  isExternal?: boolean;
  icon: typeof MessageCircle;
  motif: string;
}

const helpCards: HelpCardItem[] = [
  {
    id: "chat",
    category: "PERSONAL SHOPPING",
    badge: "Accra Specialist Online",
    title: "Chat with a specialist.",
    description: "Compare device models, confirm battery health on UK Used stock, and reserve immediately on WhatsApp.",
    actionLabel: "Chat on WhatsApp",
    actionPath: intentWhatsAppUrl("general"),
    isExternal: true,
    icon: MessageCircle,
    motif: "Direct Chat",
  },
  {
    id: "repairs",
    category: "CERTIFIED SERVICE",
    badge: "Official Diagnostics",
    title: "Professional device repair.",
    description: "Expert screen replacements, genuine battery upgrades, and board-level repairs with fast turnaround.",
    actionLabel: "Explore repairs",
    actionPath: "/repairs",
    icon: Wrench,
    motif: "Precision Bench",
  },
  {
    id: "installment",
    category: "FLEXIBLE PAYMENT",
    badge: "Manageable Plans",
    title: "Own your device today.",
    description: "Spread the cost comfortably across manageable installment plans with straightforward, transparent requirements.",
    actionLabel: "View installment plans",
    actionPath: "/installment",
    icon: CreditCard,
    motif: "Easy Financing",
  },
  {
    id: "trade-in",
    category: "TRADE IN OR SELL",
    badge: "Instant Valuation",
    title: "Upgrade and save.",
    description: "Receive fair appraisal toward your next iPhone or MacBook upgrade, or get paid cash for your used device.",
    actionLabel: "Get an estimate",
    actionPath: "/sell-or-trade",
    icon: RefreshCw,
    motif: "Fair Exchange",
  },
  {
    id: "support",
    category: "AFTERCARE & PICKUP",
    badge: "Dome Pillar 2 Hub",
    title: "Order assistance.",
    description: "Have questions about an existing order request, express dispatch across Accra, or walk-in collection?",
    actionLabel: "Contact support",
    actionPath: "/contact",
    icon: MapPin,
    motif: "Local Pickup",
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
                <div className="store-help-card-header">
                  <span className="store-help-card-eyebrow">{card.category}</span>
                  <span className="store-help-card-badge">{card.badge}</span>
                </div>

                <div className="store-help-card-body">
                  <h3 className="store-help-card-title">{card.title}</h3>
                  <p className="store-help-card-copy">{card.description}</p>
                </div>

                <div className="store-help-visual-stage" aria-hidden="true">
                  <div className="store-help-visual-icon-wrap">
                    <Icon size={28} strokeWidth={1.8} />
                  </div>
                  <span className="store-help-visual-motif">{card.motif}</span>
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
