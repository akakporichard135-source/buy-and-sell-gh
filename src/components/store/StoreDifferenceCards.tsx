import { BadgeCheck, MapPin, MessageCircle, PackageCheck, RefreshCw, ShieldCheck } from "lucide-react";
import { StoreCarousel } from "./StoreCarousel";

interface DifferenceItem {
  id: string;
  icon: typeof BadgeCheck;
  title: string;
  copy: string;
}

const differences: DifferenceItem[] = [
  {
    id: "availability",
    icon: BadgeCheck,
    title: "Clear availability",
    copy: "Confirmed in-stock and enquiry devices are labeled separately so you always know what is ready.",
  },
  {
    id: "review",
    icon: PackageCheck,
    title: "Order review",
    copy: "Every order request is manually reviewed and verified before payment instructions are issued.",
  },
  {
    id: "pickup",
    icon: MapPin,
    title: "Accra pickup & delivery",
    copy: "Fast express delivery across Greater Accra or safe in-person collection at Dome Pillar 2.",
  },
  {
    id: "trade-in",
    icon: RefreshCw,
    title: "Trade-in available",
    copy: "Get fair market value for your existing device applied directly toward your new purchase.",
  },
  {
    id: "guidance",
    icon: ShieldCheck,
    title: "Genuine product guidance",
    copy: "Honest battery health reports, serial number verification, and expert advice before you purchase.",
  },
  {
    id: "support",
    icon: MessageCircle,
    title: "Local dedicated support",
    copy: "Personal assistance from our Accra team whenever you need comparison advice or follow-up.",
  },
];

export function StoreDifferenceCards() {
  return (
    <section className="store-section store-diff-section" aria-labelledby="store-diff-title">
      <div className="store-container">
        <StoreCarousel
          eyebrow="THE BUY & SELL GH DIFFERENCE"
          title="Why shop with us."
          subtitle="Simple, transparent, and confirmed technology commerce built for customers in Ghana."
          controlsAriaLabel="Store differences carousel navigation"
          trackClassName="store-diff-track"
        >
          {differences.map((item) => {
            const Icon = item.icon;
            return (
              <article key={item.id} className="store-diff-card">
                <div className="store-diff-icon-wrap" aria-hidden="true">
                  <Icon size={26} className="store-diff-icon" />
                </div>
                <h3 className="store-diff-title">{item.title}</h3>
                <p className="store-diff-copy">{item.copy}</p>
              </article>
            );
          })}
        </StoreCarousel>
      </div>
    </section>
  );
}
