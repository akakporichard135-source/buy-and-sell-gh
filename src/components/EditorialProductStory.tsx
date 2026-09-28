import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef } from "react";
import { Link } from "react-router-dom";
import type { EditorialImage, EditorialStory } from "../catalog/editorialStories";
import { SEO } from "./SEO";
import "../styles/editorial-product-story.css";

function ProductImage({ image, eager = false, className = "" }: { image: EditorialImage; eager?: boolean; className?: string }) {
  return (
    <img
      className={`${className} editorial-image-${image.fit ?? "contain"}`}
      src={image.src}
      alt={image.alt}
      loading={eager ? "eager" : "lazy"}
      fetchPriority={eager ? "high" : undefined}
      decoding="async"
      style={image.position ? { objectPosition: image.position } : undefined}
    />
  );
}

export function EditorialProductStory({ story }: { story: EditorialStory }) {
  const railRef = useRef<HTMLDivElement>(null);
  const scrollHighlights = (direction: -1 | 1) => {
    const rail = railRef.current;
    if (!rail) return;
    const card = rail.querySelector<HTMLElement>(".editorial-highlight");
    rail.scrollBy({ left: direction * (card?.offsetWidth ?? rail.clientWidth) + direction * 18, behavior: "smooth" });
  };

  return (
    <main className={`editorial-story editorial-story-${story.slug}`}>
      <SEO title={`${story.name} | Learn More`} description={`${story.name}. ${story.tagline} Explore the product and shop with Buy & Sell GH.`} />
      <nav className="editorial-subnav" aria-label={`${story.name} sections`}>
        <a className="editorial-subnav-name" href="#overview">{story.name}</a>
        <div className="editorial-subnav-actions">
          <a href="#highlights">Highlights</a>
          {story.chapters.length > 0 && <a href={`#${story.chapters[0].id}`}>Explore</a>}
          {story.information && <a href="#information">Details</a>}
          <Link className="editorial-buy" to={story.buyPath}>{story.buyLabel ?? "Buy"}</Link>
        </div>
      </nav>

      <section className={`editorial-hero editorial-tone-${story.heroTone}`} id="overview" aria-labelledby="editorial-title">
        <div className="editorial-hero-copy">
          <p className="editorial-eyebrow">{story.eyebrow}</p>
          <h1 id="editorial-title">{story.name}</h1>
          <p className="editorial-hero-tagline">{story.tagline}</p>
          <Link className="editorial-buy" to={story.buyPath}>{story.buyLabel ?? "Buy"}</Link>
        </div>
        <div className="editorial-hero-art">
          <ProductImage image={story.hero} eager />
        </div>
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

      <section className={`editorial-close editorial-tone-${story.closingTone ?? "ink"} ${!story.closingImage ? "editorial-close-minimal" : ""}`} aria-labelledby="editorial-close-title">
        {story.closingImage && <div className="editorial-close-art"><ProductImage image={story.closingImage} /></div>}
        <div className="editorial-close-copy">
          <p className="editorial-eyebrow">{story.name}</p>
          <h2 id="editorial-close-title">{story.closingLine}</h2>
          <Link className="editorial-buy" to={story.buyPath}>{story.buyLabel ?? "Buy"}</Link>
        </div>
      </section>
    </main>
  );
}
