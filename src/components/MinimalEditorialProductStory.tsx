import { Link } from "react-router-dom";
import type { EditorialStory } from "../catalog/editorialStories";
import { defaultEditorialShowcases } from "../catalog/minimalEditorialSections";
import type { LearnMoreSection } from "../cms/learnMoreRepository";
import { CinematicVideo } from "./CinematicVideo";
import { LearnMoreSections } from "./LearnMoreSections";
import { SEO } from "./SEO";
import "../styles/editorial-product-story.css";
import "../styles/minimal-editorial-story.css";

export function MinimalEditorialProductStory({ story, sections }: { story: EditorialStory; sections?: LearnMoreSection[] }) {
  const showcases = sections ?? defaultEditorialShowcases(story);
  const isDark = story.heroTone === "ink" || story.heroTone === "plum";

  return (
    <main className={`minimal-editorial-story minimal-editorial-story-${story.slug}`}>
      <SEO title={`${story.name} | Learn More`} description={`${story.name}. ${story.tagline} Explore the product and shop with Buy & Sell GH.`} />

      <section className={`minimal-editorial-hero ${isDark ? "is-dark" : "is-light"}`} aria-labelledby="minimal-editorial-title">
        <div className="minimal-editorial-copy">
          <p className="minimal-editorial-eyebrow">{story.eyebrow}</p>
          <h1 id="minimal-editorial-title">{story.name}</h1>
          <p className="minimal-editorial-tagline">{story.tagline}</p>
          <Link className="minimal-editorial-buy" to={story.buyPath}>{story.buyLabel ?? "Buy"}</Link>
        </div>
        <img
          className="minimal-editorial-hero-image"
          src={story.hero.src}
          alt={story.hero.alt}
          loading="eager"
          fetchPriority="high"
          decoding="async"
          style={story.hero.position ? { objectPosition: story.hero.position } : undefined}
        />
      </section>

      {story.cinematicVideo && (
        <section className="minimal-editorial-film" aria-label={`${story.name} film`}>
          {(story.cinematicVideo.headline || story.cinematicVideo.subheadline) && (
            <div className="minimal-editorial-film-copy">
              {story.cinematicVideo.eyebrow && <p className="minimal-editorial-eyebrow">{story.cinematicVideo.eyebrow}</p>}
              {story.cinematicVideo.headline && <h2>{story.cinematicVideo.headline}</h2>}
              {story.cinematicVideo.subheadline && <p>{story.cinematicVideo.subheadline}</p>}
            </div>
          )}
          <div className="minimal-editorial-film-media">
            <CinematicVideo
              src={story.cinematicVideo.src}
              mobileSrc={story.cinematicVideo.mobileSrc}
              poster={story.cinematicVideo.poster}
              alt={story.cinematicVideo.alt}
              aspectRatio={story.cinematicVideo.aspectRatio || "16/9"}
              isClean={story.cinematicVideo.isClean}
              fit={story.cinematicVideo.fit || "contain"}
              loopStart={story.cinematicVideo.loopStart}
              loopEnd={story.cinematicVideo.loopEnd}
              playbackRate={story.cinematicVideo.playbackRate}
              mobileLoopStart={story.cinematicVideo.mobileLoopStart}
              mobileLoopEnd={story.cinematicVideo.mobileLoopEnd}
              mobilePlaybackRate={story.cinematicVideo.mobilePlaybackRate}
              priority
            />
          </div>
        </section>
      )}

      <LearnMoreSections sections={showcases} />

      <section className="minimal-editorial-final" aria-label={`${story.name} purchase`}>
        <h2>{story.name}</h2>
        <p>{story.tagline}</p>
        <Link className="minimal-editorial-buy" to={story.buyPath}>{story.buyLabel ?? "Buy"}</Link>
      </section>
    </main>
  );
}
