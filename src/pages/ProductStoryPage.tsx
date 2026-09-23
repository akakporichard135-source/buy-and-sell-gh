import { ArrowRight, Check, ChevronDown, Pause, Play, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useProductCatalog } from "../catalog/ProductCatalogContext";
import {
  familyMatchesProduct,
  getProductStory,
  productBuyPath,
  productFamilies,
  type ProductFamilyKey,
  type ProductStoryDefinition,
} from "../catalog/productExperience";
import { SEO } from "../components/SEO";
import { ProductGrid } from "../components/ProductGrid";
import type { Product } from "../types/product";
import { resolveProductImage } from "../utils/productImages";
import "../styles/product-experience.css";

export function ProductStoryPage({ family }: { family: ProductFamilyKey }) {
  const { slug = "" } = useParams();
  const { activeProducts, loading } = useProductCatalog();
  const configuredStory = getProductStory(family, slug);
  const product = activeProducts.find((item) => item.slug === slug && familyMatchesProduct(item, family));
  const story = useMemo(() => configuredStory ?? (product ? storyFromProduct(product, family) : undefined), [configuredStory, family, product]);
  const related = useMemo(() => activeProducts.filter((item) => item.id !== product?.id && familyMatchesProduct(item, family)).slice(0, 3), [activeProducts, family, product?.id]);
  const [filmOpen, setFilmOpen] = useState(false);

  if (loading && !story) {
    return <section className="experience-loading" role="status">Loading the product experience...</section>;
  }

  if (!story) {
    return (
      <section className="experience-not-found">
        <p>{productFamilies[family].label}</p>
        <h1>Product story not found.</h1>
        <span>The campaign may have moved, but the current Store lineup is still available.</span>
        <Link className="experience-button experience-button-primary" to={productFamilies[family].path}>Explore {productFamilies[family].label}</Link>
      </section>
    );
  }

  return (
    <div className={`product-story-page product-story-${story.theme} product-story-${family}`}>
      <SEO title={`${story.name} | Overview`} description={`${story.tagline} Explore the ${story.name} product story and current Buy & Sell GH availability.`} />
      <StoryLocalNav story={story} />

      <section className="story-hero" id="overview">
        <div className="story-hero-copy">
          <p>{story.eyebrow}</p>
          <h1>{story.name}</h1>
          <span>{story.tagline}</span>
          <div className="experience-actions">
            <Link className="experience-button experience-button-primary" to={story.buyPath}>Buy or view pricing</Link>
            {story.media.type === "video" && <button className="experience-button experience-button-secondary" type="button" onClick={() => setFilmOpen(true)}>Watch the film</button>}
          </div>
        </div>
        <StoryMedia media={story.media} priority />
      </section>

      <section className="story-introduction">
        <p>Overview</p>
        <h2>{story.introduction}</h2>
      </section>

      <section className="story-highlights" id="highlights">
        <div className="experience-heading">
          <p>Get the highlights</p>
          <h2>A closer look at what matters.</h2>
        </div>
        <div className="story-highlight-rail" tabIndex={0} aria-label={`${story.name} highlights`}>
          {story.highlights.map((highlight, index) => (
            <article className={`story-highlight story-highlight-${highlight.tone}`} id={highlightAnchor(highlight.label)} key={highlight.title}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <p>{highlight.label}</p>
              <h3>{highlight.title}</h3>
              <strong>{highlight.description}</strong>
            </article>
          ))}
        </div>
      </section>

      {story.media.type === "video" && (
        <section className="story-film-section" id="film">
          <div>
            <p>Product film</p>
            <h2>See the campaign in motion.</h2>
            <span>The approved cinematic sequence is presented with custom, accessible playback controls.</span>
            <button className="experience-button experience-button-light" type="button" onClick={() => setFilmOpen(true)}><Play size={17} fill="currentColor" /> Watch the film</button>
          </div>
          <button className="story-film-poster" type="button" aria-label={`Play ${story.name} product film`} onClick={() => setFilmOpen(true)}>
            <video muted playsInline preload="metadata" aria-hidden="true" onLoadedMetadata={seekToCleanProductFrame}><source src={story.media.src} type="video/mp4" /></video>
            <span className="experience-source-mask" aria-hidden="true" />
            <span className="story-film-play"><Play size={24} fill="currentColor" /></span>
          </button>
        </section>
      )}

      <section className={`story-design ${story.designMedia ? "story-design-cinematic" : ""}`} id="design">
        <div className="story-design-copy">
          <p>Design</p>
          <h2>{story.designTitle}</h2>
          <span>{story.designCopy}</span>
        </div>
        <div className="story-design-media">
          {story.designMedia
            ? <img src={story.designMedia.src} alt={story.designMedia.alt} loading="lazy" decoding="async" />
            : story.media.type === "image"
            ? <img src={story.media.src} alt={story.media.alt} loading="lazy" decoding="async" />
            : <><StoryDesignFrame src={story.media.src} label={story.media.alt} /><span className="experience-source-mask" aria-hidden="true" /></>}
        </div>
      </section>

      <section className="story-details" id="tech-specs">
        <div className="experience-heading">
          <p>Tech specs</p>
          <h2>Details, without the guesswork.</h2>
          <span>Only verified campaign information or fields stored with a real catalogue product appear here.</span>
        </div>
        <div className="story-detail-groups">
          {story.detailGroups.map((group) => (
            <article key={group.title}>
              <h3>{group.title}</h3>
              <ul>{group.items.map((item) => <li key={item}><Check size={17} aria-hidden="true" /> {item}</li>)}</ul>
            </article>
          ))}
        </div>
      </section>

      {related.length > 0 && (
        <section className="story-related">
          <div className="experience-heading">
            <p>Explore the lineup</p>
            <h2>More from {productFamilies[family].label}.</h2>
          </div>
          <ProductGrid products={related} imageVariant="catalogue" />
        </section>
      )}

      <section className="story-final-cta">
        <p>{story.name}</p>
        <h2>Ready for the practical details?</h2>
        <span>See real catalogue options, or send an enquiry when the exact configuration is not currently listed.</span>
        <div className="experience-actions">
          <Link className="experience-button experience-button-primary" to={story.buyPath}>Buy or view pricing <ArrowRight size={17} /></Link>
          <Link className="experience-button experience-button-secondary" to={productFamilies[family].path}>Compare the lineup</Link>
        </div>
      </section>

      {filmOpen && story.media.type === "video" && <FilmModal name={story.name} src={story.media.src} onClose={() => setFilmOpen(false)} />}
    </div>
  );
}

function StoryLocalNav({ story }: { story: ProductStoryDefinition }) {
  const sectionLinks = [
    ["#overview", "Overview"],
    ["#highlights", "Highlights"],
    ["#design", "Design"],
    ...(story.family === "iphone" && story.slug === "iphone-18-pro" ? [["#cameras", "Cameras"], ["#performance", "Performance"]] : []),
    ["#tech-specs", "Tech Specs"],
  ];
  return (
    <nav className="product-local-nav" aria-label={`${story.name} product navigation`}>
      <Link className="product-local-title" to={`/${story.family}/${story.slug}`}>{story.name}</Link>
      <div className="product-local-links">
        {sectionLinks.map(([href, label]) => <a href={href} key={href}>{label}</a>)}
        <Link className="product-local-buy" to={story.buyPath}>Buy</Link>
      </div>
      <details className="product-local-mobile-menu">
        <summary>Sections <ChevronDown size={15} aria-hidden="true" /></summary>
        <div>
          {sectionLinks.map(([href, label]) => (
            <a href={href} key={href} onClick={(event) => event.currentTarget.closest("details")?.removeAttribute("open")}>{label}</a>
          ))}
        </div>
      </details>
    </nav>
  );
}

function StoryMedia({ media, priority = false }: { media: ProductStoryDefinition["media"]; priority?: boolean }) {
  if (media.type === "image") {
    return (
      <div className="story-hero-media story-hero-image">
        <img src={media.src} alt={media.alt} loading={priority ? "eager" : "lazy"} fetchPriority={priority ? "high" : undefined} decoding="async" />
      </div>
    );
  }
  return <StoryHeroVideo media={media} />;
}

function StoryHeroVideo({ media }: { media: ProductStoryDefinition["media"] }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(true);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const restartCleanSequence = () => {
      if (video.currentTime < 2.88) return;
      video.currentTime = 0.08;
    };
    const sync = () => {
      if (reducedMotion.matches) {
        video.pause();
        video.currentTime = 1.15;
        setPlaying(false);
      } else {
        video.playbackRate = 0.72;
        void video.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
      }
    };
    const initialize = () => {
      video.playbackRate = 0.72;
      video.currentTime = reducedMotion.matches ? 1.15 : 0.08;
      sync();
    };
    if (video.readyState >= 1) initialize();
    video.addEventListener("loadedmetadata", initialize);
    video.addEventListener("timeupdate", restartCleanSequence);
    reducedMotion.addEventListener("change", sync);
    return () => {
      video.removeEventListener("loadedmetadata", initialize);
      video.removeEventListener("timeupdate", restartCleanSequence);
      reducedMotion.removeEventListener("change", sync);
    };
  }, []);

  const toggle = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) void video.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
    else {
      video.pause();
      setPlaying(false);
    }
  };

  return (
    <div className="story-hero-media story-hero-video">
      <video ref={videoRef} autoPlay muted loop playsInline preload="auto" aria-label={media.alt}>
        <source src={media.src} type="video/mp4" />
      </video>
      <span className="story-video-mask" aria-hidden="true" />
      <button className="story-video-control" type="button" aria-label={playing ? "Pause product film" : "Play product film"} onClick={toggle}>
        {playing ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
      </button>
    </div>
  );
}

function StoryDesignFrame({ src, label }: { src: string; label: string }) {
  return <video muted playsInline preload="metadata" aria-label={label} onLoadedMetadata={seekToCleanProductFrame}><source src={src} type="video/mp4" /></video>;
}

function FilmModal({ name, src, onClose }: { name: string; src: string; onClose: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(true);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    const video = videoRef.current;
    const initialize = () => {
      if (!video) return;
      video.playbackRate = 0.72;
      video.currentTime = 0.08;
      void video.play().catch(() => setPlaying(false));
    };
    const restartCleanSequence = () => {
      if (!video || video.currentTime < 2.88) return;
      video.currentTime = 0.08;
    };
    if (video?.readyState && video.readyState >= 1) initialize();
    video?.addEventListener("loadedmetadata", initialize);
    video?.addEventListener("timeupdate", restartCleanSequence);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
      video?.removeEventListener("loadedmetadata", initialize);
      video?.removeEventListener("timeupdate", restartCleanSequence);
    };
  }, [onClose]);

  const toggle = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) void video.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
    else {
      video.pause();
      setPlaying(false);
    }
  };

  return (
    <div className="film-modal" role="dialog" aria-modal="true" aria-label={`${name} product film`}>
      <button className="film-modal-backdrop" type="button" aria-label="Close product film" onClick={onClose} />
      <div className="film-modal-player">
        <video ref={videoRef} autoPlay muted playsInline preload="auto"><source src={src} type="video/mp4" /></video>
        <span className="experience-source-mask film-source-mask" aria-hidden="true" />
        <div className="film-modal-controls">
          <button type="button" onClick={toggle}>{playing ? <Pause size={19} fill="currentColor" /> : <Play size={19} fill="currentColor" />}<span>{playing ? "Pause" : "Play"}</span></button>
          <button type="button" onClick={onClose}><X size={20} /><span>Close</span></button>
        </div>
      </div>
    </div>
  );
}

function storyFromProduct(product: Product, family: ProductFamilyKey): ProductStoryDefinition {
  const image = resolveProductImage(product);
  const specifications = product.specifications ?? product.specs ?? [];
  const highlights = specifications.slice(0, 3).map((item, index) => ({
    label: index === 0 ? "At a glance" : `Detail ${index + 1}`,
    title: item,
    description: "This information comes directly from the current Store listing.",
    tone: (["light", "blue", "ink"] as const)[index % 3],
  }));

  if (!highlights.length) {
    highlights.push({ label: "Catalogue", title: "Clear product details.", description: product.description, tone: "light" });
  }

  return {
    family,
    slug: product.slug,
    name: product.name,
    eyebrow: product.generation || product.subcategory || product.category,
    tagline: product.shortDescription || product.description,
    introduction: product.description,
    media: {
      type: "image",
      src: image?.src ?? productFamilies[family].heroMedia,
      alt: image?.alt ?? productFamilies[family].heroAlt,
    },
    theme: family === "mac" || family === "watch" ? "ink" : family === "ipad" ? "blue" : "light",
    buyPath: productBuyPath(family, product.slug),
    highlights,
    designTitle: `${product.name}, clearly presented.`,
    designCopy: "Review the real listing photography and stored product information before choosing a configuration.",
    detailGroups: [
      { title: "Configuration", items: [`Storage / option: ${product.storage.join(", ") || "Confirm with team"}`, `Colours: ${product.colors.join(", ") || "Confirm with team"}`, `Condition: ${product.condition}`] },
      { title: "Specifications", items: specifications.length ? specifications : ["Detailed specifications are confirmed before payment."] },
      { title: "Support", items: [product.warranty || product.warrantyInfo || "Warranty details are confirmed for the selected unit.", product.deliveryInfo || product.deliveryNote || "Pickup and delivery details are confirmed with the team."] },
    ],
  };
}

function highlightAnchor(label: string) {
  if (label.toLowerCase() === "camera") return "cameras";
  if (label.toLowerCase() === "performance") return "performance";
  return undefined;
}

function seekToCleanProductFrame(event: React.SyntheticEvent<HTMLVideoElement>) {
  const video = event.currentTarget;
  video.pause();
  video.currentTime = 1.15;
}
