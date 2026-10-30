import { ChevronRight, MapPin, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";
import type { StorePageSection } from "../../cms/types";
import { intentWhatsAppUrl } from "../../utils/whatsapp";

export function StoreHeroIntro({ section }: { section?: StorePageSection }) {
  const heading = section?.heading?.trim() || "Store. The best way to buy the products you love.";
  const hasDefaultStorePrefix = /^Store\.\s*(.*)$/i.exec(heading);
  const bgStyle = section?.backgroundColor ? { backgroundColor: section.backgroundColor } : undefined;
  const alignStyle = section?.textAlignment ? ({ textAlign: section.textAlignment } as const) : undefined;
  const bannerImg = section?.desktopImage || section?.mobileImage || "";

  return (
    <section
      className="store-intro-section"
      aria-labelledby="store-intro-title"
      style={bgStyle}
      data-section-id={section?.id || "section-store-intro"}
    >
      <div className="store-intro-container">
        <div className="store-intro-main" style={alignStyle}>
          {section?.eyebrow && section.eyebrow !== "STORE" && (
            <p className="store-section-eyebrow">{section.eyebrow}</p>
          )}
          <h1 id="store-intro-title" className="store-intro-title">
            {hasDefaultStorePrefix ? (
              <>
                <span className="store-intro-gold">Store.</span> {hasDefaultStorePrefix[1]}
              </>
            ) : (
              heading
            )}
          </h1>
          {section?.subtitle && section.subtitle !== "Need shopping help? Chat with us" && (
            <p className="store-section-subtitle" style={{ marginTop: "10px" }}>
              {section.subtitle}
            </p>
          )}
          {section?.description && section.description !== "Visit Buy & Sell GH at Dome Pillar 2, Accra" && (
            <p className="store-section-subtitle" style={{ marginTop: "6px" }}>
              {section.description}
            </p>
          )}
          {bannerImg && (
            <div style={{ marginTop: "20px", borderRadius: "16px", overflow: "hidden", maxWidth: "680px" }}>
              <picture>
                {section?.mobileImage && <source media="(max-width: 768px)" srcSet={section.mobileImage} />}
                <img
                  src={section?.desktopImage || section?.mobileImage}
                  alt={section?.imageAlt || heading}
                  style={{ width: "100%", height: "auto", maxHeight: "320px", objectFit: "cover", display: "block" }}
                />
              </picture>
            </div>
          )}
        </div>

        <div className="store-intro-help" aria-label="Store contact and shopping support">
          <div className="store-help-item">
            <div className="store-help-icon-wrap" aria-hidden="true">
              <MessageCircle size={22} className="store-help-icon" />
            </div>
            <div className="store-help-copy">
              <p className="store-help-label">Need shopping help?</p>
              {section?.buttonDestination && section.buttonDestination !== "/contact" ? (
                <Link className="store-help-link" to={section.buttonDestination}>
                  {section.buttonLabel || "Chat with us"} <ChevronRight size={14} aria-hidden="true" />
                </Link>
              ) : (
                <a
                  className="store-help-link"
                  href={intentWhatsAppUrl("general")}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Chat with Buy & Sell GH specialist on WhatsApp"
                >
                  {section?.buttonLabel || "Chat with us"} <ChevronRight size={14} aria-hidden="true" />
                </a>
              )}
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
