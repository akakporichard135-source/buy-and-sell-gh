import { ChevronLeft, ChevronRight } from "lucide-react";
import { Fragment, useEffect, useMemo, useRef } from "react";
import { Link } from "react-router-dom";
import type { EditorialImage, EditorialStory } from "../catalog/editorialStories";
import { sectionsAt, type LearnMoreSection } from "../cms/learnMoreRepository";
import type { IphoneEducationContent } from "../data/iphone18ProEducation";
import { LearnMoreSections } from "./LearnMoreSections";
import { SEO } from "./SEO";
import { CinematicVideo } from "./CinematicVideo";
import { Iphone18ProEducation } from "./Iphone18ProEducation";
import "../styles/editorial-product-story.css";

function ProductImage({ image, eager = false, className = "" }: { image: EditorialImage; eager?: boolean; className?: string }) {
  return (
    <img
      className={`${className} editorial-image-${image.fit ?? "contain"}`}
      src={image.src}
      alt={image.alt}
      loading={eager ? "eager" : "lazy"}
      fetchPriority={eager ? "high" : "auto"}
      decoding="async"
      draggable={false}
      style={image.position ? { objectPosition: image.position } : undefined}
    />
  );
}

export function EditorialProductStory({ story, sections = [], education }: { story: EditorialStory; sections?: LearnMoreSection[]; education?: IphoneEducationContent }) {
  const railRef = useRef<HTMLDivElement>(null);

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
            <Link className="editorial-buy" to={story.buyPath}>{story.buyLabel ?? "Buy"}</Link>
          </div>
        </div>
        {story.cinematicVideo ? (
          <div className="editorial-cinematic-opening-media">
            <CinematicVideo
              src={story.cinematicVideo.src}
              mobileSrc={story.cinematicVideo.mobileSrc}
              poster={story.cinematicVideo.poster}
              alt={story.slug === "iphone-18-pro" ? "iPhone 18 Pro cinematic presentation" : story.cinematicVideo.alt}
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

      <LearnMoreSections sections={sectionsAt(sections, "after-hero")} />

      {story.slug === "iphone-18-pro" ? <Iphone18ProEducation buyPath={story.buyPath} hero={story.hero} sections={sections} content={education} /> : <>
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
      <LearnMoreSections sections={sectionsAt(sections, "after-highlights")} />

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
      <LearnMoreSections sections={sectionsAt(sections, "after-hardware")} />

      {story.chapters.map((chapter) => (<Fragment key={chapter.id}>
        <section className={`editorial-chapter editorial-chapter-${chapter.layout} editorial-tone-${chapter.tone}${chapter.image ? "" : " editorial-chapter-no-image"}`} id={chapter.id} key={chapter.id} aria-labelledby={`${chapter.id}-title`}>
          <div className="editorial-chapter-copy">
            <p className="editorial-eyebrow">{chapter.label}</p>
            <h2 id={`${chapter.id}-title`}>{chapter.title}</h2>
            {chapter.copy && <p className="editorial-chapter-description">{chapter.copy}</p>}
            {chapter.metric && (
              <div className="editorial-chapter-metric">
                <span className="editorial-metric-val">{chapter.metric.value}</span>
                <span className="editorial-metric-lbl">{chapter.metric.label}</span>
              </div>
            )}
            {chapter.pills && (
              <div className="editorial-chapter-pills">
                {chapter.pills.map((pill) => (
                  <span className="editorial-chapter-pill" key={pill}>{pill}</span>
                ))}
              </div>
            )}
          </div>
          {chapter.image && <div className="editorial-chapter-art"><ProductImage image={chapter.image} /></div>}
        </section>
        <LearnMoreSections sections={sectionsAt(sections, `after-chapter:${chapter.id}`)} />
      </Fragment>))}

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
      <LearnMoreSections sections={sectionsAt(sections, "after-information")} />

      <LearnMoreSections sections={sectionsAt(sections, "end")} />

      {story.finalImage && (
        <section className="editorial-final-beauty" aria-label={`${story.name} final product view`}>
          <div className="editorial-final-beauty-art"><ProductImage image={story.finalImage} /></div>
          <Link className="editorial-buy" to={story.buyPath}>View pricing</Link>
        </section>
      )}
      </>}

    </main>
  );
}
