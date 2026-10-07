import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useMemo, useRef } from "react";
import { Link } from "react-router-dom";
import type { EditorialImage, EditorialStory } from "../catalog/editorialStories";
import { useProductCatalog } from "../catalog/ProductCatalogContext";
import { getCardPriceDisplay } from "../utils/productPricing";
import { SEO } from "./SEO";
import { CinematicVideo } from "./CinematicVideo";
import "../styles/editorial-product-story.css";

function ProductImage({ image, eager = false, className = "" }: { image: EditorialImage; eager?: boolean; className?: string }) {
  return (
    <img
      className={`${className} editorial-image-${image.fit ?? "contain"}`}
      src={image.src}
      alt={image.alt}
      loading="eager"
      fetchPriority={eager ? "high" : "auto"}
      decoding="async"
      draggable={false}
      style={image.position ? { objectPosition: image.position } : undefined}
    />
  );
}

export function EditorialProductStory({ story }: { story: EditorialStory }) {
  const railRef = useRef<HTMLDivElement>(null);
  const { activeProducts } = useProductCatalog();

  const startingPrice = useMemo(() => {
    const prod = activeProducts.find((p) => p.slug === story.slug || story.buyPath.endsWith(`/${p.slug}`));
    if (prod) {
      const cardPrice = getCardPriceDisplay(prod);
      if (!cardPrice.isEnquiry) return cardPrice.current;
    }
    if (story.slug === "iphone-18-pro") return "From GH₵ 20,500";
    if (story.slug === "macbook-air") return "From GH₵ 13,500";
    if (story.slug === "apple-watch-series-12") return "From GH₵ 7,800";
    if (story.slug === "apple-watch-ultra-4") return "From GH₵ 14,800";
    if (story.slug === "ipad-air") return "From GH₵ 9,800";
    if (story.slug === "airpods-5") return "From GH₵ 2,800";
    return null;
  }, [activeProducts, story.slug, story.buyPath]);

  useEffect(() => {
    if (railRef.current) {
      railRef.current.scrollLeft = 0;
    }
  }, [story.slug]);

  const scrollHighlights = (direction: -1 | 1) => {
    const rail = railRef.current;
    if (!rail) return;
    const card = rail.querySelector<HTMLElement>(".editorial-highlight");
    if (!card) return;
    const cardWidth = card.offsetWidth;
    const gap = 20;
    rail.scrollBy({ left: direction * (cardWidth + gap), behavior: "smooth" });
  };

  return (
    <main className={`editorial-story editorial-story-${story.slug}`}>
      <SEO title={`${story.name} | Learn More`} description={`${story.name}. ${story.tagline} Explore the product and shop with Buy & Sell GH.`} />
      <section className={`editorial-hero ${story.cinematicVideo ? "editorial-hero-cinematic" : ""} editorial-tone-${story.heroTone}`} id="overview" aria-labelledby="editorial-title">
        <div className="editorial-hero-copy">
          <p className="editorial-eyebrow">{story.eyebrow}</p>
          <h1 id="editorial-title">{story.name}</h1>
          <p className="editorial-hero-tagline">{story.tagline}</p>
          <div className="editorial-hero-actions">
            {startingPrice && <span className="editorial-hero-price-pill">{startingPrice}</span>}
            <Link className="editorial-buy" to={story.buyPath}>{story.buyLabel ?? "Buy"}</Link>
          </div>
        </div>
        {story.cinematicVideo ? (
          <div className="editorial-cinematic-opening-media">
            <CinematicVideo
              src={story.cinematicVideo.src}
              mobileSrc={story.cinematicVideo.mobileSrc}
              poster={story.cinematicVideo.poster}
              alt={story.cinematicVideo.alt}
              aspectRatio={story.cinematicVideo.aspectRatio || "16/9"}
              isClean={story.cinematicVideo.isClean}
              fit={story.cinematicVideo.fit || "cover"}
              loopStart={story.cinematicVideo.loopStart}
              loopEnd={story.cinematicVideo.loopEnd}
              playbackRate={story.cinematicVideo.playbackRate}
              mobileLoopStart={story.cinematicVideo.mobileLoopStart}
              mobileLoopEnd={story.cinematicVideo.mobileLoopEnd}
              mobilePlaybackRate={story.cinematicVideo.mobilePlaybackRate}
              priority
            />
          </div>
        ) : (
          <div className="editorial-hero-art">
            <ProductImage image={story.hero} eager />
          </div>
        )}
      </section>

      <section className="editorial-highlights" id="highlights" aria-labelledby="editorial-highlights-title">
        <div className="editorial-highlights-heading">
          <h2 id="editorial-highlights-title">Get the highlights.</h2>
          <div className="editorial-rail-controls">
            <button type="button" aria-label="Previous highlight" onClick={() => scrollHighlights(-1)}><ChevronLeft size={20} /></button>
            <button type="button" aria-label="Next highlight" onClick={() => scrollHighlights(1)}><ChevronRight size={20} /></button>
          </div>
        </div>
        <div className="editorial-highlight-rail" ref={railRef} tabIndex={0} aria-label={`${story.name} highlights`}>
          {story.highlights.map((highlight) => (
            <article className={`editorial-highlight editorial-tone-${highlight.tone}`} key={highlight.label}>
              <div className="editorial-highlight-copy">
                <p className="editorial-eyebrow">{highlight.label}</p>
                <h3>{highlight.title}</h3>
              </div>
              <div className="editorial-highlight-art"><ProductImage image={highlight.image} /></div>
            </article>
          ))}
        </div>
      </section>

      {story.cinematicVideo && (
        <section
          className={`editorial-hardware-anchor editorial-tone-${story.heroTone}`}
          id="hardware-anchor"
          aria-labelledby="editorial-hardware-anchor-title"
        >
          <div className="editorial-hardware-anchor-container">
            <div className="editorial-hardware-anchor-header">
              {story.cinematicVideo.eyebrow && (
                <p className="editorial-eyebrow">{story.cinematicVideo.eyebrow}</p>
              )}
              <h2 id="editorial-hardware-anchor-title">
                {story.cinematicVideo.headline || `${story.name} Design`}
              </h2>
              {story.cinematicVideo.subheadline && (
                <p className="editorial-hardware-anchor-sub">{story.cinematicVideo.subheadline}</p>
              )}
            </div>
            <div className="editorial-hardware-anchor-art">
              <ProductImage image={story.hero} />
            </div>
          </div>
        </section>
      )}

      {story.chapters.map((chapter) => (
        <section className={`editorial-chapter editorial-chapter-${chapter.layout} editorial-tone-${chapter.tone}`} id={chapter.id} key={chapter.id} aria-labelledby={`${chapter.id}-title`}>
          <div className="editorial-chapter-copy">
            <p className="editorial-eyebrow">{chapter.label}</p>
            <h2 id={`${chapter.id}-title`}>{chapter.title}</h2>
            {chapter.copy && <p className="editorial-chapter-description">{chapter.copy}</p>}
          </div>
          <div className="editorial-chapter-art"><ProductImage image={chapter.image} /></div>
        </section>
      ))}

      {story.information && (
        <section className="editorial-information" id="information" aria-labelledby="editorial-info-title">
          <div className="editorial-info-container">
            <div className="editorial-info-header">
              <p className="editorial-eyebrow">{story.information.eyebrow ?? "EVERYTHING TO KNOW"}</p>
              <h2 id="editorial-info-title">{story.information.title}</h2>
              <p className="editorial-info-intro">{story.information.intro}</p>
            </div>
            <div className="editorial-info-grid">
              {story.information.items.map((item) => (
                <article className="editorial-info-card" key={item.category}>
                  <p className="editorial-info-category">{item.category}</p>
                  <h3 className="editorial-info-heading">{item.heading}</h3>
                  <p className="editorial-info-body">{item.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

    </main>
  );
}
