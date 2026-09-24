import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { campaignAssets } from "../catalog/campaignAssets";
import { SEO } from "../components/SEO";
import "../styles/product-experience.css";

export function OthersPage() {
  return (
    <div className="others-page">
      <SEO title="Others | Phones, Tablets and Electronics" description="Explore Buy & Sell GH marketplace listings for phones, tablets, computers, gaming, TV and audio." />
      <section className="others-hero">
        <p>Others</p>
        <h1>More technology. Clearly separated.</h1>
        <span>These are marketplace listing areas, separate from the curated Buy &amp; Sell GH Store catalogue.</span>
      </section>
      <section className="others-paths" aria-label="Marketplace categories">
        <article className="others-path others-path-light">
          <div>
            <p>Marketplace</p>
            <h2>Phones &amp; Tablets</h2>
            <span>Mobile phones, phone and tablet accessories, smart watches and tablets.</span>
            <Link className="experience-button experience-button-primary" to="/phones-tablets">Explore listings <ArrowRight size={17} /></Link>
          </div>
          <img src={campaignAssets.duo.pair.src} alt={campaignAssets.duo.pair.alt} loading="eager" decoding="async" />
        </article>
        <article className="others-path others-path-dark">
          <div>
            <p>Marketplace</p>
            <h2>Electronics</h2>
            <span>Laptops and computers, TV and video equipment, game consoles, audio and music equipment.</span>
            <Link className="experience-button experience-button-light" to="/electronics">Explore listings <ArrowRight size={17} /></Link>
          </div>
          <img src={campaignAssets.mac.floating.src} alt={campaignAssets.mac.floating.alt} loading="eager" decoding="async" />
        </article>
      </section>
      <section className="others-request">
        <div><p>Looking for something specific?</p><h2>Request it, or list one to sell.</h2></div>
        <div className="experience-actions">
          <Link className="experience-button experience-button-primary" to="/pre-order">Request a device</Link>
          <Link className="experience-button experience-button-secondary" to="/sell-or-trade?mode=sell">Sell a device</Link>
        </div>
      </section>
    </div>
  );
}
