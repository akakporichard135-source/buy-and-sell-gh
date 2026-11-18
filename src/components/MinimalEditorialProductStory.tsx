import { Pause, Play } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import type { EditorialStory } from "../catalog/editorialStories";
import { defaultEditorialShowcases } from "../catalog/minimalEditorialSections";
import { useResolvedMediaUrl } from "../cms/localMediaStore";
import type { LearnMoreSection } from "../cms/learnMoreRepository";
import { CinematicVideo } from "./CinematicVideo";
import { LearnMoreSections } from "./LearnMoreSections";
import { SEO } from "./SEO";
import "../styles/editorial-product-story.css";
import "../styles/minimal-editorial-story.css";

function StoryActionLink({
  to,
  label,
  className,
}: {
  to: string;
  label: string;
  className: string;
}) {
  if (/^https?:\/\//i.test(to)) {
    return (
      <a className={className} href={to} target="_blank" rel="noopener noreferrer">
        {label}
      </a>
    );
  }
  return (
    <Link className={className} to={to || "/store"}>
      {label}
    </Link>
  );
}

export function MinimalEditorialProductStory({
  story,
  sections,
}: {
  story: EditorialStory;
  sections?: LearnMoreSection[];
}) {
  const showcases = sections ?? defaultEditorialShowcases(story);
  const isDark = story.heroTone === "ink" || story.heroTone === "plum";
  const heroIsFullWidth = story.hero?.layout === "full-width";

  const { resolvedUrl: resolvedHeroImg } = useResolvedMediaUrl(story.hero?.src);
  const { resolvedUrl: resolvedHeroMobileImg } = useResolvedMediaUrl(story.hero?.mobileSrc);
  const { resolvedUrl: resolvedHeroVideo } = useResolvedMediaUrl(story.hero?.videoSrc);
  const { resolvedUrl: resolvedHeroMobileVideo } = useResolvedMediaUrl(story.hero?.mobileVideoSrc);
  const { resolvedUrl: resolvedHeroPoster } = useResolvedMediaUrl(story.hero?.posterSrc);

  const { resolvedUrl: resolvedFilmSrc } = useResolvedMediaUrl(story.cinematicVideo?.src);
  const { resolvedUrl: resolvedFilmMobileSrc } = useResolvedMediaUrl(
    story.cinematicVideo?.mobileSrc
  );
  const { resolvedUrl: resolvedFilmPoster } = useResolvedMediaUrl(story.cinematicVideo?.poster);

  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth <= 768 : false
  );
  const [heroVideoFailed, setHeroVideoFailed] = useState(false);
  const [heroVideoPaused, setHeroVideoPaused] = useState(false);
  const heroVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    setHeroVideoFailed(false);
  }, [resolvedHeroVideo, resolvedHeroMobileVideo]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const onResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const activeHeroVideo =
    isMobile && resolvedHeroMobileVideo
      ? resolvedHeroMobileVideo
      : resolvedHeroVideo || resolvedHeroMobileVideo;
  const activeHeroPoster =
    resolvedHeroPoster ||
    (isMobile && resolvedHeroMobileImg ? resolvedHeroMobileImg : resolvedHeroImg) ||
    undefined;
  const shouldRenderHeroVideo =
    (story.hero?.mediaMode === "video" || Boolean(activeHeroVideo)) &&
    Boolean(activeHeroVideo) &&
    !heroVideoFailed;

  const heroCustomStyle: React.CSSProperties | undefined =
    story.backgroundGradient || story.backgroundColor
      ? {
          ...(story.backgroundColor ? { backgroundColor: story.backgroundColor } : {}),
          ...(story.backgroundGradient ? { backgroundImage: story.backgroundGradient } : {}),
        }
      : undefined;

  const toggleHeroPlayback = () => {
    const el = heroVideoRef.current;
    if (!el) return;
    if (el.paused) {
      void el.play().then(() => setHeroVideoPaused(false)).catch(() => {});
    } else {
      el.pause();
      setHeroVideoPaused(true);
    }
  };

  return (
    <main className={`minimal-editorial-story minimal-editorial-story-${story.slug}`}>
      <SEO
        title={`${story.name} | Learn More`}
        description={`${story.name}. ${story.tagline} Explore the product and shop with Buy & Sell GH.`}
      />

      <section
        className={`minimal-editorial-hero ${isDark ? "is-dark" : "is-light"} ${
          heroIsFullWidth ? "is-full-width" : ""
        }`}
        style={heroCustomStyle}
        data-testid="learn-more-hero-section"
        aria-labelledby="minimal-editorial-title"
      >
        <div className="minimal-editorial-copy">
          {story.eyebrow ? <p className="minimal-editorial-eyebrow">{story.eyebrow}</p> : null}
          <h1 id="minimal-editorial-title">{story.name}</h1>
          {story.tagline ? <p className="minimal-editorial-tagline">{story.tagline}</p> : null}
          {story.introText ? (
            <p className="minimal-editorial-intro" data-testid="learn-more-hero-intro">
              {story.introText}
            </p>
          ) : null}
          <div className="minimal-editorial-hero-actions">
            {story.buyPath ? (
              <StoryActionLink
                to={story.buyPath}
                label={story.buyLabel ?? "Buy"}
                className="minimal-editorial-buy"
              />
            ) : null}
            {story.secondaryLabel && story.secondaryPath ? (
              <StoryActionLink
                to={story.secondaryPath}
                label={story.secondaryLabel}
                className="minimal-editorial-secondary-cta"
              />
            ) : null}
          </div>
        </div>

        {shouldRenderHeroVideo ? (
          <div className={`minimal-editorial-hero-video-wrap ${heroIsFullWidth ? "is-full-bleed" : ""}`}>
            <video
              ref={heroVideoRef}
              key={activeHeroVideo}
              data-testid="learn-more-hero-video"
              className="minimal-editorial-hero-video"
              src={activeHeroVideo}
              poster={activeHeroPoster}
              autoPlay={story.hero?.autoplay !== false}
              muted={story.hero?.muted !== false}
              loop={story.hero?.loop !== false}
              controls={Boolean(story.hero?.controls)}
              playsInline
              preload="metadata"
              onPlay={() => setHeroVideoPaused(false)}
              onPause={() => setHeroVideoPaused(true)}
              onError={() => setHeroVideoFailed(true)}
              style={{
                objectFit: story.hero?.fit || "cover",
                objectPosition: story.hero?.position || "center",
              }}
            />
            {!story.hero?.controls && (
              <button
                type="button"
                className="minimal-editorial-video-toggle"
                onClick={toggleHeroPlayback}
                aria-label={heroVideoPaused ? "Play hero video" : "Pause hero video"}
              >
                {heroVideoPaused ? <Play size={14} /> : <Pause size={14} />}
                <span>{heroVideoPaused ? "Play" : "Pause"}</span>
              </button>
            )}
          </div>
        ) : resolvedHeroImg || resolvedHeroPoster ? (
          resolvedHeroMobileImg ? (
            <picture key={`${resolvedHeroImg}-${resolvedHeroMobileImg}`} className="minimal-editorial-hero-picture">
              <source media="(max-width: 768px)" srcSet={resolvedHeroMobileImg} />
              <img
                className={`minimal-editorial-hero-image ${heroIsFullWidth ? "is-full-bleed" : ""}`}
                src={resolvedHeroImg || resolvedHeroPoster}
                alt={story.hero?.alt || story.name}
                loading="eager"
                fetchPriority="high"
                decoding="async"
                style={{
                  objectPosition: story.hero?.position || "center",
                  objectFit: story.hero?.fit || "contain",
                }}
              />
            </picture>
          ) : (
            <img
              key={resolvedHeroImg || resolvedHeroPoster}
              className={`minimal-editorial-hero-image ${heroIsFullWidth ? "is-full-bleed" : ""}`}
              src={resolvedHeroImg || resolvedHeroPoster}
              alt={story.hero?.alt || story.name}
              loading="eager"
              fetchPriority="high"
              decoding="async"
              style={{
                objectPosition: story.hero?.position || "center",
                objectFit: story.hero?.fit || "contain",
              }}
            />
          )
        ) : null}
      </section>

      {story.cinematicVideo && (resolvedFilmSrc || resolvedFilmPoster) && (
        <section className="minimal-editorial-film" aria-label={`${story.name} film`}>
          {(story.cinematicVideo.headline || story.cinematicVideo.subheadline) && (
            <div className="minimal-editorial-film-copy">
              {story.cinematicVideo.eyebrow && (
                <p className="minimal-editorial-eyebrow">{story.cinematicVideo.eyebrow}</p>
              )}
              {story.cinematicVideo.headline && <h2>{story.cinematicVideo.headline}</h2>}
              {story.cinematicVideo.subheadline && <p>{story.cinematicVideo.subheadline}</p>}
            </div>
          )}
          <div className="minimal-editorial-film-media">
            <CinematicVideo
              src={resolvedFilmSrc || story.cinematicVideo.src}
              mobileSrc={resolvedFilmMobileSrc || story.cinematicVideo.mobileSrc}
              poster={resolvedFilmPoster || story.cinematicVideo.poster}
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
        <StoryActionLink
          to={story.buyPath || "/store"}
          label={story.buyLabel ?? "Buy"}
          className="minimal-editorial-buy"
        />
      </section>
    </main>
  );
}
