import React, { useState } from "react";
import { Link } from "react-router-dom";
import { MessageCircle, ShieldCheck, Sparkles, Truck, Store, ArrowRight } from "lucide-react";
import { SEO } from "../SEO";
import { whatsappUrl } from "../../utils/whatsapp";
import "../../styles/apple-buy-experience.css";

export function IphoneDuoPricingExperience() {
  const [selectedAngle, setSelectedAngle] = useState(0);

  const gallery = [
    { src: "/products/campaigns/iphone-duo-open.webp", alt: "iPhone Duo unfolded in expansive dual-display format", label: "Open Canvas" },
    { src: "/products/campaigns/iphone-duo-folded.webp", alt: "iPhone Duo folded compact profile", label: "Folded Pocket" },
    { src: "/products/campaigns/iphone-duo-side.webp", alt: "iPhone Duo precision hinge engineering", label: "Hinge Profile" },
    { src: "/products/campaigns/iphone-duo-pair.webp", alt: "iPhone Duo open and closed side by side", label: "Dual View" },
  ];

  const currentImage = gallery[selectedAngle];

  const whatsAppEnquiry = whatsappUrl(
    "Hello Buy & Sell GH, I would like to enquire about iPhone Duo pricing, availability schedule, and early customer reservation in Ghana. Please share current allocation details."
  );

  return (
    <div className="apple-buy-root">
      <SEO
        title="iPhone Duo Pricing & Availability | Buy & Sell GH"
        description="Review iPhone Duo pricing guidance, foldable canvas specifications, and advance allocation availability with Buy & Sell GH in Accra, Ghana."
      />

      <div className="apple-buy-header">
        <div className="apple-buy-header-inner">
          <div className="apple-buy-header-title">
            <h1>iPhone Duo</h1>
            <span className="apple-buy-header-badge">Advance Allocation</span>
          </div>
          <div className="apple-buy-header-price">Pricing on Enquiry</div>
        </div>
      </div>

      <nav className="apple-buy-breadcrumbs" aria-label="Breadcrumb">
        <Link to="/">Home</Link>
        <span>/</span>
        <Link to="/iphone">iPhone</Link>
        <span>/</span>
        <strong>iPhone Duo Pricing</strong>
      </nav>

      <main className="apple-buy-container">
        {/* Left Column: Visual Showcase */}
        <div className="apple-buy-gallery-col">
          <div className="apple-buy-stage">
            <img
              src={currentImage.src}
              alt={currentImage.alt}
              className="apple-buy-stage-img"
              loading="eager"
              fetchPriority="high"
              decoding="async"
              draggable={false}
            />
          </div>
          <div className="apple-buy-thumbnails" aria-label="iPhone Duo viewing angles">
            {gallery.map((item, idx) => (
              <button
                type="button"
                key={item.label}
                className={`apple-buy-thumb ${idx === selectedAngle ? "is-selected" : ""}`}
                onClick={() => setSelectedAngle(idx)}
                aria-label={`View ${item.label}`}
              >
                <img src={item.src} alt="" />
              </button>
            ))}
          </div>
          <p className="apple-buy-stage-caption">
            Precision dual-display articulation with zero-crease seamless hinge engineering.
          </p>
        </div>

        {/* Right Column: Pricing & Availability Guide */}
        <div className="apple-buy-config-col">
          <div className="apple-buy-intro">
            <span className="duo-pricing-badge">
              <Sparkles size={14} /> VIP Advance Enquiry
            </span>
            <h2 className="apple-buy-intro-title">iPhone Duo Pricing &amp; Availability</h2>
            <p className="apple-buy-intro-lede">
              A revolutionary foldable canvas that brings expansive multitasking into a pocket-ready silhouette. Units are allocated through priority advance requests.
            </p>
          </div>

          {/* Form Factor Highlights */}
          <section className="apple-buy-step">
            <div className="apple-buy-step-header">
              <h3 className="apple-buy-step-title">Form Factor. <span>Two modes of interaction.</span></h3>
              <p className="apple-buy-step-subtitle">Engineered to shift naturally between one-handed use and expansive productivity.</p>
            </div>
            <div className="duo-pricing-features">
              <div className="duo-pricing-feature-pill">
                <strong>5.8″ Folded</strong>
                <span>Compact pocket profile for calls and quick tasks</span>
              </div>
              <div className="duo-pricing-feature-pill">
                <strong>7.8″ Unfolded</strong>
                <span>Side-by-side dual-app canvas for multitasking</span>
              </div>
              <div className="duo-pricing-feature-pill">
                <strong>Precision Hinge</strong>
                <span>Freestanding articulation at any angle</span>
              </div>
            </div>
          </section>

          {/* Anticipated Configuration Tiers */}
          <section className="apple-buy-step">
            <div className="apple-buy-step-header">
              <h3 className="apple-buy-step-title">Anticipated Configurations.</h3>
              <p className="apple-buy-step-subtitle">Planned hardware allocations for the Ghana market.</p>
            </div>
            <div className="apple-buy-cards-grid">
              <div className="apple-buy-card" style={{ cursor: "default" }}>
                <h4 className="apple-buy-card-title">Storage Capacities</h4>
                <p className="apple-buy-card-desc">256GB, 512GB, and 1TB high-speed NVMe storage tiers.</p>
              </div>
              <div className="apple-buy-card" style={{ cursor: "default" }}>
                <h4 className="apple-buy-card-title">Available Finishes</h4>
                <p className="apple-buy-card-desc">Titanium Silver, Space Indigo, and Champagne Gold.</p>
              </div>
            </div>
          </section>

          {/* Pricing Confirmation Card */}
          <section className="apple-buy-summary-card">
            <div className="apple-buy-summary-header">
              <h3>Pricing in Ghana Cedis (GHS)</h3>
              <p className="apple-buy-step-subtitle">
                Exact pricing and arrival dates are confirmed individually based on shipment batches and customs valuation.
              </p>
            </div>

            <div className="apple-buy-summary-pricing">
              <span className="apple-buy-summary-price-label">Pricing Status</span>
              <span className="apple-buy-summary-price-val" style={{ fontSize: "1.35rem" }}>Confirmed on Enquiry</span>
            </div>

            <div className="apple-buy-summary-actions">
              <a href={whatsAppEnquiry} target="_blank" rel="noopener noreferrer" className="apple-buy-btn-primary">
                <MessageCircle size={20} />
                Enquire on WhatsApp for Pricing
              </a>
              <Link to="/pre-order?category=iPhones&model=iPhone%20Duo" className="apple-buy-btn-secondary">
                Register for Allocation <ArrowRight size={16} />
              </Link>
            </div>

            <ul className="apple-buy-assurances">
              <li><ShieldCheck size={16} /> Authentic Apple device guarantee</li>
              <li><Store size={16} /> Hands-on inspection before payment at Dome Pillar 2, Accra</li>
              <li><Truck size={16} /> Secure courier delivery nationwide across Ghana</li>
            </ul>
          </section>

          {/* Learn More Bridge */}
          <div style={{ padding: "20px 24px", background: "#f5f5f7", borderRadius: "16px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px" }}>
            <div>
              <strong style={{ display: "block", color: "#1d1d1f", fontSize: "0.95rem" }}>Want to explore before asking?</strong>
              <span style={{ color: "#6e6e73", fontSize: "0.85rem" }}>Read the complete design and hardware overview.</span>
            </div>
            <Link to="/iphone/iphone-duo" className="experience-button experience-button-secondary" style={{ flexShrink: 0 }}>
              Learn more
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
