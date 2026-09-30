import { MessageSquare, RefreshCw, ShieldCheck, Store } from "lucide-react";
import { Link } from "react-router-dom";

export function StoreCategoryTrustBar() {
  const points = [
    {
      icon: Store,
      title: "Accra Store Pickup",
      copy: "Visit our Dome Pillar 2 shop near Christian Village. Inspect every device physically before making payment.",
      linkText: "Store location & hours",
      to: "/contact",
      isExternal: false,
    },
    {
      icon: RefreshCw,
      title: "Trade-In & Upgrade",
      copy: "Trade your current iPhone or MacBook towards your purchase with instant evaluation and credit.",
      linkText: "Start a trade-in quote",
      to: "/sell-or-trade?mode=upgrade",
      isExternal: false,
    },
    {
      icon: ShieldCheck,
      title: "Inspected Hardware",
      copy: "Every device is tested for genuine Apple components, battery capacity, True Tone, and clean activation lock.",
      linkText: "Device inspection standards",
      to: "/about",
      isExternal: false,
    },
    {
      icon: MessageSquare,
      title: "WhatsApp Specialist",
      copy: "Need live serial checks, unboxing videos, or condition photos? Our Accra support team answers quickly.",
      linkText: "Chat on WhatsApp",
      to: "https://wa.me/233244182149",
      isExternal: true,
    },
  ];

  return (
    <section className="store-cat-trust-section" aria-labelledby="category-trust-title">
      <div className="store-cat-trust-container">
        <div className="store-cat-trust-header">
          <p className="store-cat-trust-eyebrow">THE BUY & SELL GH PROMISE</p>
          <h2 id="category-trust-title" className="store-cat-trust-title">
            Shopping designed around certainty.
          </h2>
        </div>

        <div className="store-cat-trust-grid">
          {points.map((pt) => {
            const Icon = pt.icon;
            return (
              <div key={pt.title} className="store-cat-trust-card">
                <div className="store-cat-trust-icon-box">
                  <Icon size={20} className="text-[#c8961e]" aria-hidden="true" />
                </div>
                <h3 className="store-cat-trust-card-title">{pt.title}</h3>
                <p className="store-cat-trust-card-copy">{pt.copy}</p>
                {pt.isExternal ? (
                  <a
                    href={pt.to}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="store-cat-trust-card-link"
                  >
                    {pt.linkText} ↗
                  </a>
                ) : (
                  <Link to={pt.to} className="store-cat-trust-card-link">
                    {pt.linkText} →
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
