import { ChevronRight, MapPin, MessageCircle } from "lucide-react";
import { intentWhatsAppUrl } from "../../utils/whatsapp";

export function StoreHeroIntro() {
  return (
    <section className="store-intro-section" aria-labelledby="store-intro-title">
      <div className="store-intro-container">
        <div className="store-intro-main">
          <h1 id="store-intro-title" className="store-intro-title">
            <span className="store-intro-gold">Store.</span> The best way to buy the products you love.
          </h1>
        </div>

        <div className="store-intro-help" aria-label="Store contact and shopping support">
          <div className="store-help-item">
            <div className="store-help-icon-wrap" aria-hidden="true">
              <MessageCircle size={22} className="store-help-icon" />
            </div>
            <div className="store-help-copy">
              <p className="store-help-label">Need shopping help?</p>
              <a
                className="store-help-link"
                href={intentWhatsAppUrl("general")}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Chat with Buy & Sell GH specialist on WhatsApp"
              >
                Chat with us <ChevronRight size={14} aria-hidden="true" />
              </a>
            </div>
          </div>

          <div className="store-help-item">
            <div className="store-help-icon-wrap" aria-hidden="true">
              <MapPin size={22} className="store-help-icon" />
            </div>
            <div className="store-help-copy">
              <p className="store-help-label">Visit Buy &amp; Sell GH</p>
              <span className="store-help-location">Dome Pillar 2, Accra</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
