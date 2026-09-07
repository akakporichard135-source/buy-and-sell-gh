import { Pause, Play } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import type { Product } from "../types/product";
import iphone16Plus from "../assets/catalogue-products/iphone-16-plus-premium.webp";
import iphone17Pro from "../assets/catalogue-products/iphone-17-pro-premium.webp";
import iphone17ProMax from "../assets/catalogue-products/iphone-17-pro-max-premium.webp";
import iphoneAir from "../assets/catalogue-products/iphone-air-premium.webp";

const sceneDuration = 6400;

const approvedScenes = [
  {
    slug: "iphone-17-pro-max",
    name: "iPhone 17 Pro Max",
    eyebrow: "The latest",
    tagline: "Made for your next big move.",
    image: iphone17ProMax,
  },
  {
    slug: "iphone-17-pro",
    name: "iPhone 17 Pro",
    eyebrow: "Pro, refined",
    tagline: "Power that feels effortless.",
    image: iphone17Pro,
  },
  {
    slug: "iphone-air",
    name: "iPhone Air",
    eyebrow: "Remarkably light",
    tagline: "Ready for more, without the weight.",
    image: iphoneAir,
  },
  {
    slug: "iphone-16-plus",
    name: "iPhone 16 Plus",
    eyebrow: "A brilliant choice",
    tagline: "More room for everything you enjoy.",
    image: iphone16Plus,
  },
];

export function getIphoneShowcaseScenes(products: Pick<Product, "slug">[]) {
  const slugs = new Set(products.map((product) => product.slug));
  return approvedScenes.filter((scene) => slugs.has(scene.slug));
}

export function IphoneCinematicShowcase({ products, priority = false }: { products: Product[]; priority?: boolean }) {
  const scenes = useMemo(() => getIphoneShowcaseScenes(products), [products]);
  if (!scenes.length) return null;
  return <IphoneSequence key={scenes.map((scene) => scene.slug).join(",")} scenes={scenes} priority={priority} />;
}

function IphoneSequence({ scenes, priority }: { scenes: typeof approvedScenes; priority: boolean }) {
  const sectionRef = useRef<HTMLElement>(null);
  const pointerStartRef = useRef<{ x: number; y: number } | null>(null);
  const [active, setActive] = useState(0);
  const [requested, setRequested] = useState<number | null>(null);
  const [ready, setReady] = useState<Record<string, boolean>>({});
  const [inView, setInView] = useState(false);
  const [pageVisible, setPageVisible] = useState(true);
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const next = (active + 1) % scenes.length;
  const previous = (active - 1 + scenes.length) % scenes.length;
  const playing = inView && pageVisible && !paused && !reducedMotion && scenes.length > 1;
  const progressing = playing && Boolean(ready[scenes[active].slug] && ready[scenes[next].slug]);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotion = () => setReducedMotion(media.matches);
    const updateVisibility = () => setPageVisible(!document.hidden);
    updateMotion();
    updateVisibility();
    media.addEventListener("change", updateMotion);
    document.addEventListener("visibilitychange", updateVisibility);
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.18 });
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => {
      observer.disconnect();
      media.removeEventListener("change", updateMotion);
      document.removeEventListener("visibilitychange", updateVisibility);
    };
  }, []);

  useEffect(() => {
    if (!progressing) return;
    const timer = window.setTimeout(() => setActive(next), sceneDuration);
    return () => window.clearTimeout(timer);
  }, [next, progressing]);

  useEffect(() => {
    if (requested === null || !ready[scenes[requested].slug]) return;
    setActive(requested);
    setRequested(null);
  }, [ready, requested, scenes]);

  const selectScene = (index: number, pause = true) => {
    setRequested(index);
    if (pause) setPaused(true);
  };

  const handlePointerEnd = (x: number, y: number) => {
    const start = pointerStartRef.current;
    pointerStartRef.current = null;
    if (!start) return;
    const deltaX = x - start.x;
    const deltaY = y - start.y;
    if (Math.abs(deltaX) < 44 || Math.abs(deltaX) <= Math.abs(deltaY)) return;
    selectScene(deltaX < 0 ? next : previous);
  };

  return (
    <section
      ref={sectionRef}
      className={`iphone-showcase${playing ? " is-playing" : ""}${progressing ? " is-progressing" : ""}`}
      aria-label="Latest iPhone showcase"
      aria-roledescription="carousel"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "ArrowRight") selectScene(next);
        if (event.key === "ArrowLeft") selectScene(previous);
      }}
      onPointerDown={(event) => { pointerStartRef.current = { x: event.clientX, y: event.clientY }; }}
      onPointerUp={(event) => handlePointerEnd(event.clientX, event.clientY)}
      onPointerCancel={() => { pointerStartRef.current = null; }}
    >
      {scenes.map((scene, index) => {
        const isActive = index === active;
        const shouldRender = index === 0
          || Boolean(ready[scene.slug])
          || (inView && (index === active || index === next || index === requested));
        return (
          <figure
            className={`iphone-showcase-scene iphone-showcase-scene-${scene.slug}${isActive ? " is-active" : ""}`}
            aria-hidden={!isActive}
            key={scene.slug}
          >
            <figcaption className="iphone-showcase-copy" aria-live={isActive ? "polite" : "off"}>
              <p>{scene.eyebrow}</p>
              <h1>{scene.name}</h1>
              <span>{scene.tagline}</span>
              <div className="iphone-showcase-actions">
                <Link to={`/product/${scene.slug}`} tabIndex={isActive ? 0 : -1}>Explore</Link>
                <Link to="/iphones" tabIndex={isActive ? 0 : -1}>Shop iPhone</Link>
              </div>
            </figcaption>
            <div className="iphone-showcase-media">
              {shouldRender && (
                <img
                  src={scene.image}
                  alt={`${scene.name} in a clean studio product scene`}
                  loading={priority && index === 0 ? "eager" : "lazy"}
                  decoding="async"
                  fetchPriority={priority && index === 0 ? "high" : "auto"}
                  onLoad={async (event) => {
                    await event.currentTarget.decode().catch(() => undefined);
                    setReady((value) => value[scene.slug] ? value : { ...value, [scene.slug]: true });
                  }}
                />
              )}
            </div>
          </figure>
        );
      })}
      <div className="iphone-showcase-controls">
        <div className="iphone-showcase-progress" role="group" aria-label="Choose an iPhone scene">
          {scenes.map((scene, index) => (
            <button
              type="button"
              key={scene.slug}
              aria-label={`Show ${scene.name}`}
              aria-pressed={index === active}
              onClick={() => selectScene(index)}
            >
              <span><i /></span>
            </button>
          ))}
        </div>
        {!reducedMotion && scenes.length > 1 && (
          <button
            className="iphone-showcase-toggle"
            type="button"
            aria-label={paused ? "Play iPhone showcase" : "Pause iPhone showcase"}
            title={paused ? "Play showcase" : "Pause showcase"}
            onClick={() => setPaused((value) => !value)}
          >
            {paused ? <Play size={15} /> : <Pause size={15} />}
          </button>
        )}
      </div>
    </section>
  );
}
