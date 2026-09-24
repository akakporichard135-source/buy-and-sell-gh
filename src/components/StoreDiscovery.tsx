import { ArrowRight, BadgeCheck, MapPin, MessageCircle, PackageCheck } from "lucide-react";
import { useEffect, useRef, type ReactNode } from "react";
import { Link } from "react-router-dom";
import {
  productFamilies,
  productStories,
  type ProductFamilyKey,
} from "../catalog/productExperience";
import { campaignAssets } from "../catalog/campaignAssets";
import type { Product } from "../types/product";

const familyOrder: ProductFamilyKey[] = ["mac", "iphone", "ipad", "watch", "airpods", "accessories"];
const newStoryKeys = [
  ["iphone", "iphone-18-pro"],
  ["iphone", "iphone-duo"],
  ["watch", "apple-watch-series-12"],
  ["watch", "apple-watch-ultra-4"],
  ["airpods", "airpods-5"],
  ["mac", "macbook-air"],
  ["mac", "macbook-pro"],
  ["ipad", "ipad-air"],
] as const;

export function StoreDiscovery({ products }: { products: Product[] }) {
  const accessoryCount = products.filter((product) => product.category === "Accessories").length;

  return (
    <div className="store-discovery">
      <section className="store-family-strip" aria-labelledby="store-family-title">
        <div className="store-discovery-heading">
          <p>Store</p>
          <h2 id="store-family-title">Explore the product families.</h2>
        </div>
        <div className="store-family-rail">
          {familyOrder.map((key) => {
            const family = productFamilies[key];
            return (
              <Link to={family.path} key={key}>
                <span><img src={family.heroMedia} alt="" loading="lazy" decoding="async" /></span>
                <strong>{family.label}</strong>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="store-new-section" aria-labelledby="store-new-title">
        <div className="store-discovery-heading">
          <p>What&apos;s new</p>
          <h2 id="store-new-title">Campaigns worth a closer look.</h2>
        </div>
        <div className="store-new-grid">
          {newStoryKeys.map(([family, slug], index) => {
            const story = productStories.find((item) => item.family === family && item.slug === slug);
            if (!story) return null;
            const campaignMedia = index === 0
              ? story.media
              : story.galleryMedia?.[0]
                ? { type: "image" as const, ...story.galleryMedia[0] }
                : story.designMedia ?? story.media;
            return (
              <article className={`store-new-campaign store-new-campaign-${story.theme}${index === 0 ? " store-new-campaign-featured" : ""}`} key={slug}>
                <div className="store-new-campaign-copy">
                  <p>{story.eyebrow}</p>
                  <h3>{story.name}</h3>
                  <span>{story.tagline}</span>
                  <div className="experience-actions">
                    <Link className="experience-button experience-button-primary" to={`/${family}/${slug}`}>Learn more</Link>
                    <Link className="experience-button experience-button-secondary" to={story.buyPath}>View pricing</Link>
                  </div>
                </div>
                {campaignMedia.type === "image"
                  ? <img src={campaignMedia.src} alt={campaignMedia.alt} loading="lazy" decoding="async" />
                  : <StoreCampaignVideo src={campaignMedia.src} label={campaignMedia.alt} />}
              </article>
            );
          })}
        </div>
      </section>

      <section className="store-shop-categories" aria-labelledby="store-category-title">
        <div className="store-discovery-heading">
          <p>Shop by category</p>
          <h2 id="store-category-title">Start with what you need.</h2>
        </div>
        <div className="store-category-links">
          <Link to="/store?category=Phones"><span>Phones</span><ArrowRight /></Link>
          <Link to="/store?category=Tablets"><span>Tablets</span><ArrowRight /></Link>
          <Link to="/store?category=Laptops"><span>Laptops</span><ArrowRight /></Link>
          <Link to="/store?category=Watches"><span>Watches</span><ArrowRight /></Link>
          <Link to="/store?category=Audio"><span>Audio</span><ArrowRight /></Link>
          <Link to="/store?category=Accessories"><span>Accessories</span><ArrowRight /></Link>
        </div>
      </section>

      <section className="store-accessory-feature">
        <div>
          <p>Accessories</p>
          <h2>Complete the setup.</h2>
          <span>Explore charging, protection and productivity accessories{accessoryCount ? ` across ${accessoryCount} current Store listings` : " with compatibility confirmed by the team"}.</span>
          <Link className="experience-button experience-button-primary" to="/accessories">Explore accessories</Link>
        </div>
        <div className="store-accessory-media">
          <img src={campaignAssets.accessories.chargingStand.src} alt={campaignAssets.accessories.chargingStand.alt} loading="lazy" decoding="async" />
        </div>
      </section>

      <section className="store-why-section" aria-labelledby="store-why-title">
        <div className="store-discovery-heading">
          <p>Why Buy &amp; Sell GH</p>
          <h2 id="store-why-title">Clear help from discovery to delivery.</h2>
        </div>
        <div className="store-why-grid">
          <StoreBenefit icon={<BadgeCheck />} title="Clear availability" copy="Stock and enquiry-only products are labelled separately." />
          <StoreBenefit icon={<MessageCircle />} title="Local support" copy="Ask the team to compare models or confirm final details." />
          <StoreBenefit icon={<PackageCheck />} title="Order review" copy="Order requests are reviewed before payment instructions are confirmed." />
          <StoreBenefit icon={<MapPin />} title="Accra pickup" copy="Pickup is available at the listed Buy & Sell GH location." />
        </div>
      </section>
    </div>
  );
}

function StoreCampaignVideo({ src, label }: { src: string; label: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const initialize = () => {
      video.playbackRate = 0.72;
      video.currentTime = reducedMotion.matches ? 1.15 : 0.08;
    };
    const restartCleanSequence = () => {
      if (video.currentTime < 2.88) return;
      video.currentTime = 0.08;
    };
    const setPlayback = (visible: boolean) => {
      if (!visible || reducedMotion.matches) {
        video.pause();
        return;
      }
      void video.play().catch(() => undefined);
    };
    if (!("IntersectionObserver" in window)) {
      initialize();
      setPlayback(true);
      return;
    }
    const observer = new IntersectionObserver(([entry]) => setPlayback(entry.isIntersecting), { threshold: 0.35 });
    const syncMotion = () => setPlayback(observer.takeRecords()[0]?.isIntersecting ?? video.getBoundingClientRect().top < window.innerHeight);
    observer.observe(video);
    if (video.readyState >= 1) initialize();
    video.addEventListener("loadedmetadata", initialize);
    video.addEventListener("timeupdate", restartCleanSequence);
    reducedMotion.addEventListener("change", syncMotion);
    return () => {
      observer.disconnect();
      video.removeEventListener("loadedmetadata", initialize);
      video.removeEventListener("timeupdate", restartCleanSequence);
      reducedMotion.removeEventListener("change", syncMotion);
      video.pause();
    };
  }, []);

  return (
    <div className="store-campaign-video">
      <video ref={videoRef} muted loop playsInline preload="metadata" aria-label={label}><source src={src} type="video/mp4" /></video>
      <span className="experience-source-mask" aria-hidden="true" />
    </div>
  );
}

function StoreBenefit({ icon, title, copy }: { icon: ReactNode; title: string; copy: string }) {
  return <article><span>{icon}</span><h3>{title}</h3><p>{copy}</p></article>;
}
