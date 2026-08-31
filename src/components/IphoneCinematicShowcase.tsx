import { Pause, Play } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Product } from "../types/product";
import iphone16 from "../assets/products/iphone-16-premium.webp";
import iphone16Plus from "../assets/products/iphone-16-plus-premium.webp";
import iphone16Pro from "../assets/products/iphone-16-pro-premium.webp";
import iphone16ProMax from "../assets/products/iphone-16-pro-max-premium.webp";
import iphone17 from "../assets/products/iphone-17-premium.webp";
import iphone17Pro from "../assets/products/iphone-17-pro-premium.webp";
import iphone17ProMax from "../assets/products/iphone-17-pro-max-premium.webp";

const approvedScenes = [
  { slug: "iphone-16", name: "iPhone 16", image: iphone16 },
  { slug: "iphone-16-plus", name: "iPhone 16 Plus", image: iphone16Plus },
  { slug: "iphone-16-pro", name: "iPhone 16 Pro", image: iphone16Pro },
  { slug: "iphone-16-pro-max", name: "iPhone 16 Pro Max", image: iphone16ProMax },
  { slug: "iphone-17", name: "iPhone 17", image: iphone17 },
  { slug: "iphone-17-pro", name: "iPhone 17 Pro", image: iphone17Pro },
  { slug: "iphone-17-pro-max", name: "iPhone 17 Pro Max", image: iphone17ProMax },
];

export function getIphoneShowcaseScenes(products: Pick<Product, "slug">[]) {
  const slugs = new Set(products.map((product) => product.slug));
  return approvedScenes.filter((scene) => slugs.has(scene.slug));
}

export function IphoneCinematicShowcase({ products }: { products: Product[] }) {
  const scenes = useMemo(() => getIphoneShowcaseScenes(products), [products]);
  if (!scenes.length) return null;
  return <IphoneSequence key={scenes.map((scene) => scene.slug).join(",")} scenes={scenes} />;
}

function IphoneSequence({ scenes }: { scenes: typeof approvedScenes }) {
  const sectionRef = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);
  const [furthest, setFurthest] = useState(0);
  const [requested, setRequested] = useState<number | null>(null);
  const [ready, setReady] = useState<Record<string, boolean>>({});
  const [inView, setInView] = useState(false);
  const [pageVisible, setPageVisible] = useState(true);
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const next = (active + 1) % scenes.length;
  const playing = inView && pageVisible && !paused && !reducedMotion && scenes.length > 1;

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotion = () => setReducedMotion(media.matches);
    const updateVisibility = () => setPageVisible(!document.hidden);
    updateMotion();
    updateVisibility();
    media.addEventListener("change", updateMotion);
    document.addEventListener("visibilitychange", updateVisibility);
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.1 });
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => {
      observer.disconnect();
      media.removeEventListener("change", updateMotion);
      document.removeEventListener("visibilitychange", updateVisibility);
    };
  }, []);

  useEffect(() => {
    // Do not fade away from a decoded scene until its successor is ready.
    if (!playing || !ready[scenes[active].slug] || !ready[scenes[next].slug]) return;
    const timer = window.setTimeout(() => {
      setActive(next);
      setFurthest((value) => Math.max(value, next));
    }, 5500);
    return () => window.clearTimeout(timer);
  }, [active, next, playing, ready, scenes]);

  useEffect(() => {
    if (requested === null || !ready[scenes[requested].slug]) return;
    setActive(requested);
    setFurthest((value) => Math.max(value, requested));
    setRequested(null);
  }, [ready, requested, scenes]);

  return (
    <section ref={sectionRef} className={`iphone-showcase${playing ? " is-playing" : ""}`} aria-label="iPhone cinematic showcase" aria-roledescription="carousel">
      {scenes.map((scene, index) => (
        <figure className={`iphone-showcase-scene${index === active ? " is-active" : ""}${scene.slug === "iphone-17-pro-max" ? " is-finale" : ""}`} aria-hidden={index !== active} key={scene.slug}>
          {(index === 0 || (inView && (reducedMotion || paused || index <= furthest + 1))) && (
            <img src={scene.image} alt={`${scene.name} in a studio product scene`} loading={inView ? "eager" : "lazy"} decoding="async" onLoad={async (event) => {
              await event.currentTarget.decode().catch(() => undefined);
              setReady((value) => value[scene.slug] ? value : { ...value, [scene.slug]: true });
            }} />
          )}
          <figcaption>{scene.name}</figcaption>
        </figure>
      ))}
      <div className="iphone-showcase-controls">
        <div className="iphone-showcase-dots" role="group" aria-label="Choose an iPhone scene">
          {scenes.map((scene, index) => (
            <button type="button" key={scene.slug} aria-label={`Show ${scene.name}`} title={scene.name} aria-pressed={index === active} onClick={() => { setRequested(index); setPaused(true); }}><span /></button>
          ))}
        </div>
        {!reducedMotion && scenes.length > 1 && (
          <button className="iphone-showcase-toggle" type="button" aria-label={paused ? "Play iPhone showcase" : "Pause iPhone showcase"} title={paused ? "Play showcase" : "Pause showcase"} onClick={() => setPaused((value) => !value)}>
            {paused ? <Play size={16} /> : <Pause size={16} />}
          </button>
        )}
      </div>
    </section>
  );
}
