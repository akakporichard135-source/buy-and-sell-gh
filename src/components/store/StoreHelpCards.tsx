import { ArrowRight, Banknote, CreditCard, Gift, MessageCircle, RefreshCw, Wrench } from "lucide-react";
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
    id: "upgrade-trade-in",
    category: "TRADE IN OR UPGRADE",
    badge: "Instant Valuation",
    title: "Upgrade & Save.",
    description: "Receive fair trade-in value toward your next iPhone or MacBook upgrade with fast in-person inspection.",
    actionLabel: "Get a trade-in estimate",
    actionPath: "/sell-or-trade",
    icon: RefreshCw,
    motif: "Fair Exchange",
  },
  {
    id: "sell-device",
    category: "INSTANT BUYOUT",
    badge: "Immediate Payout",
    title: "Sell your device.",
    description: "Turn your used Apple device into instant cash in Accra with quick diagnostic verification.",
    actionLabel: "Sell your device",
    actionPath: "/sell-or-trade",
    icon: Banknote,
    motif: "Instant Cash",
  },
  {
    id: "refer-friend",
    category: "CUSTOMER REWARDS",
    badge: "Store Credit",
    title: "Refer a Friend.",
    description: "Earn store credit and exclusive discounts when your friends and family purchase their Apple devices with us.",
    actionLabel: "Explore referral rewards",
    actionPath: "/refer-a-friend",
    icon: Gift,
    motif: "Earn Together",
  },
];

export function StoreHelpCards() {
  return (
    <section className="store-section store-help-section" aria-labelledby="store-help-title">
      <div className="store-container">
        <StoreCarousel
          eyebrow="HELP IS HERE"
          title="Whenever you need it."
          subtitle="Support, flexible financing, repairs, trade-in, and customer rewards tailored for Ghana."
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
                    <Icon size={24} strokeWidth={1.8} />
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
