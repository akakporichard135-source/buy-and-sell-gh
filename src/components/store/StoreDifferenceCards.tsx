import { BadgeCheck, MapPin, MessageCircle, PackageCheck, RefreshCw, Wrench } from "lucide-react";
import type { StorePageSection } from "../../cms/types";
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
    title: "Clear Availability",
    copy: "Confirmed in-stock and enquiry devices are labeled separately so you always know what is ready.",
  },
  {
    id: "review",
    icon: PackageCheck,
    title: "Order Review",
    copy: "Every order request is manually reviewed and verified before payment instructions are issued.",
  },
  {
    id: "pickup",
    icon: MapPin,
    title: "Accra Pickup & Delivery",
    copy: "Fast express delivery across Greater Accra or safe in-person collection at Dome Pillar 2.",
  },
  {
    id: "trade-in",
    icon: RefreshCw,
    title: "Trade-In Available",
    copy: "Get fair market value for your existing device applied directly toward your new purchase.",
  },
  {
    id: "support",
    icon: MessageCircle,
    title: "Local Support",
    copy: "Personal assistance from our Accra team whenever you need comparison advice or order follow-up.",
  },
  {
    id: "repairs",
    icon: Wrench,
    title: "Device Repairs",
    copy: "In-house technical diagnostics and certified repairs to keep your Apple devices performing at their best.",
  },
];

export function StoreDifferenceCards({ section }: { section?: StorePageSection }) {
  const eyebrow =
    section?.eyebrow !== undefined && section.eyebrow !== ""
      ? section.eyebrow
      : "THE BUY & SELL GH DIFFERENCE";
  const title = section?.heading?.trim() || "Why shop with us.";
  const subtitle =
    section?.subtitle !== undefined
      ? section.subtitle
      : "Simple, transparent, and confirmed technology commerce built for customers in Ghana.";
  const bgStyle = section?.backgroundColor ? { backgroundColor: section.backgroundColor } : undefined;

  return (
    <section
      className="store-section store-diff-section"
      aria-labelledby="store-diff-title"
      style={bgStyle}
      data-section-id={section?.id || "section-difference-cards"}
    >
      <div className="store-container">
        <StoreCarousel
          eyebrow={eyebrow}
          title={title}
          subtitle={subtitle}
          controlsAriaLabel="Store differences carousel navigation"
          trackClassName="store-diff-track"
        >
          {differences.map((item) => {
            const Icon = item.icon;
            return (
              <article key={item.id} className="store-diff-card">
                <div className="store-diff-icon-wrap" aria-hidden="true">
                  <Icon size={24} className="store-diff-icon" />
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
