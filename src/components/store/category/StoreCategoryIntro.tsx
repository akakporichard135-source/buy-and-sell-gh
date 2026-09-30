import { MapPin, MessageCircle } from "lucide-react";
import type { CategoryDepartmentConfig } from "./categoryData";

interface StoreCategoryIntroProps {
  config: CategoryDepartmentConfig;
}

export function StoreCategoryIntro({ config }: StoreCategoryIntroProps) {
  return (
    <section className="store-cat-intro-section" aria-labelledby="category-intro-heading">
      <div className="store-cat-intro-container">
        <div className="store-cat-intro-left">
          <h1 id="category-intro-heading" className="store-cat-intro-title">
            {config.label}
            <span className="store-cat-gold-dot">.</span>
          </h1>
          <p className="store-cat-intro-tagline">{config.tagline}</p>
          <p className="store-cat-intro-desc">{config.description}</p>
        </div>

        <div className="store-cat-intro-right">
          <div className="store-cat-help-stack">
            <a
              href="https://wa.me/233244182149"
              target="_blank"
              rel="noopener noreferrer"
              className="store-cat-help-item"
              aria-label="Chat with an Apple Specialist on WhatsApp"
            >
              <div className="store-cat-help-icon-box">
                <MessageCircle size={18} className="text-[#25D366]" aria-hidden="true" />
              </div>
              <div className="store-cat-help-copy">
                <span className="store-cat-help-primary">Need shopping advice?</span>
                <span className="store-cat-help-secondary">Chat with our Accra specialist ↗</span>
              </div>
            </a>

            <div className="store-cat-help-item">
              <div className="store-cat-help-icon-box">
                <MapPin size={18} className="text-[#c8961e]" aria-hidden="true" />
              </div>
              <div className="store-cat-help-copy">
                <span className="store-cat-help-primary">Accra Store Pickup</span>
                <span className="store-cat-help-secondary">Dome Pillar 2, near Christian Village</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
