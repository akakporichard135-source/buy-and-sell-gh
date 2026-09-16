import { Pause, Play } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import "../styles/homepage-video-showcase.css";

type ProductStory = {
  name: string;
  eyebrow: string;
  tagline: string;
  image: string;
  video?: string;
  imageAlt: string;
  theme: "light" | "dark";
  variant: "duo" | "series" | "ultra" | "airpods";
  learnMoreTo: string;
  pricingTo: string;
};

const STORY_DURATION_MS = 6500;

const productStories: ProductStory[] = [
  {
    name: "iPhone Duo",
    eyebrow: "A new way to unfold",
    tagline: "More room for every idea, in one fluid design.",
    image: "/products/homepage/iphone-duo.webp",
    video: "/videos/homepage/iphone-duo.mp4",
    imageAlt: "An open foldable phone held naturally in two hands",
    theme: "light",
    variant: "duo",
    learnMoreTo: "/iphones",
    pricingTo: "/pre-order?model=iPhone%20Duo",
  },
  {
    name: "Apple Watch Series 12",
    eyebrow: "Designed to move with you",
    tagline: "A refined view of every day.",
    image: "/products/homepage/watch-series-12.webp",
    video: "/videos/homepage/watch-series-12.mp4",
    imageAlt: "A refined rectangular smartwatch in a dark studio scene",
    theme: "dark",
    variant: "series",
    learnMoreTo: "/apple-watch",
    pricingTo: "/pre-order?model=Apple%20Watch%20Series%2012",
  },
  {
    name: "Apple Watch Ultra 4",
    eyebrow: "Built for beyond",
    tagline: "Rugged capability, precisely considered.",
    image: "/products/homepage/watch-ultra-4.webp",
    video: "/videos/homepage/watch-ultra-4.mp4",
    imageAlt: "A rugged titanium smartwatch with an orange band",
    theme: "dark",
    variant: "ultra",
    learnMoreTo: "/apple-watch",
    pricingTo: "/pre-order?model=Apple%20Watch%20Ultra%204",
  },
  {
    name: "AirPods 5",
    eyebrow: "Move with your music",
    tagline: "Freedom to listen wherever the rhythm takes you.",
    image: "/products/homepage/airpods-5-lifestyle.webp",
    imageAlt: "A woman enjoying music with a white wireless earbud",
    theme: "light",
    variant: "airpods",
    learnMoreTo: "/airpods",
    pricingTo: "/pre-order?model=AirPods%205",
  },
];

export function HomepageVideoShowcase() {
  const sectionRef = useRef<HTMLElement>(null);
  const videoRefs = useRef<Array<HTMLVideoElement | null>>([]);
  const pointerStart = useRef<{ x: number; y: number } | null>(null);
  const [active, setActive] = useState(0);
  const [inView, setInView] = useState(false);
  const [pageVisible, setPageVisible] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const [paused, setPaused] = useState(false);
  const story = productStories[active];

  useEffect(() => {
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotion = () => setReducedMotion(motionQuery.matches);
    const updateVisibility = () => setPageVisible(!document.hidden);
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.22 });

    updateMotion();
    updateVisibility();
    motionQuery.addEventListener("change", updateMotion);
    document.addEventListener("visibilitychange", updateVisibility);
    if (sectionRef.current) observer.observe(sectionRef.current);

    return () => {
      motionQuery.removeEventListener("change", updateMotion);
      document.removeEventListener("visibilitychange", updateVisibility);
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!inView || !pageVisible || paused || reducedMotion) return;
    const intervalId = window.setInterval(() => {
      setActive((current) => (current + 1) % productStories.length);
    }, STORY_DURATION_MS);
    return () => window.clearInterval(intervalId);
  }, [active, inView, pageVisible, paused, reducedMotion]);

  useEffect(() => {
    videoRefs.current.forEach((video, index) => {
      if (!video) return;
      const shouldPlay = index === active && inView && pageVisible && !paused && !reducedMotion;
      if (shouldPlay) {
        void video.play().catch(() => undefined);
      } else {
        video.pause();
        if (index !== active) video.currentTime = 0;
      }
    });
  }, [active, inView, pageVisible, paused, reducedMotion]);

  const finishSwipe = (x: number, y: number) => {
    const start = pointerStart.current;
    pointerStart.current = null;
    if (!start) return;
    const deltaX = x - start.x;
    const deltaY = y - start.y;
    if (Math.abs(deltaX) < 44 || Math.abs(deltaX) <= Math.abs(deltaY)) return;
    setActive((current) => (current + (deltaX < 0 ? 1 : -1) + productStories.length) % productStories.length);
  };

  return (
    <section
      ref={sectionRef}
      className={`home-product-reel home-product-reel-${story.theme} home-product-reel-${story.variant}${paused || reducedMotion ? " is-paused" : ""}`}
      aria-label="Featured product stories"
      aria-roledescription="carousel"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "ArrowRight") setActive((current) => (current + 1) % productStories.length);
        if (event.key === "ArrowLeft") setActive((current) => (current - 1 + productStories.length) % productStories.length);
      }}
      onPointerDown={(event) => { pointerStart.current = { x: event.clientX, y: event.clientY }; }}
      onPointerUp={(event) => finishSwipe(event.clientX, event.clientY)}
      onPointerCancel={() => { pointerStart.current = null; }}
    >
      <div className="home-product-reel-copy" key={`copy-${story.name}`}>
        <p>{story.eyebrow}</p>
        <h2>{story.name}</h2>
        <span>{story.tagline}</span>
        <div className="home-product-reel-actions">
          <Link to={story.learnMoreTo}>Learn more</Link>
          <Link to={story.pricingTo}>View pricing</Link>
        </div>
      </div>

      <div className="home-product-reel-media">
        {productStories.map((item, index) => (
          <figure
            className={`home-product-reel-frame home-product-reel-frame-${item.variant}${index === active ? " is-active" : ""}`}
            aria-hidden={index !== active}
            key={item.name}
          >
            {item.video ? (
              <>
                <img className="home-product-reel-ambient" src={item.image} alt="" decoding="async" />
                <video
                  ref={(element) => { videoRefs.current[index] = element; }}
                  className="home-product-reel-film"
                  src={item.video}
                  poster={item.image}
                  aria-label={index === active ? item.imageAlt : undefined}
                  aria-hidden={index !== active}
                  muted
                  loop
                  playsInline
                  preload={index === 0 ? "auto" : "metadata"}
                />
              </>
            ) : (
              <img src={item.image} alt={index === active ? item.imageAlt : ""} loading="lazy" decoding="async" />
            )}
          </figure>
        ))}
      </div>

      <div className="home-product-reel-controls">
        <div className="home-product-reel-tabs" role="group" aria-label="Choose a product story">
          {productStories.map((item, index) => (
            <button
              type="button"
              className={index === active ? "is-active" : ""}
              aria-label={`Show ${item.name}`}
              aria-pressed={index === active}
              onClick={() => setActive(index)}
              key={item.name}
            >
              <span>{item.name}</span>
              <i><b /></i>
            </button>
          ))}
        </div>
        {!reducedMotion && (
          <button
            className="home-product-reel-toggle"
            type="button"
            aria-label={paused ? "Play product stories" : "Pause product stories"}
            title={paused ? "Play stories" : "Pause stories"}
            onClick={() => setPaused((value) => !value)}
          >
            {paused ? <Play size={15} fill="currentColor" /> : <Pause size={15} fill="currentColor" />}
          </button>
        )}
      </div>
    </section>
  );
}

export { productStories };
