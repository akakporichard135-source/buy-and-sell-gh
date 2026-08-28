import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import type { NewMacLaunch } from "../data/newMacLaunches";

export function NewMacLaunchCampaign({
  brandArtwork,
  launch,
  priority = false,
}: {
  brandArtwork?: string;
  launch: NewMacLaunch;
  priority?: boolean;
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const HeadingTag = priority ? "h1" : "h2";

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    if (!window.IntersectionObserver) {
      section.classList.add("is-visible");
      return;
    }

    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      section.classList.add("is-visible");
      observer.disconnect();
    }, { threshold: 0.18 });

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className={`new-mac-launch new-mac-launch-${launch.key} new-mac-launch-${launch.theme}`}
      aria-labelledby={`${launch.key}-launch-title`}
    >
      {brandArtwork && (
        <div className="new-mac-brand-opening" aria-label="Buy & Sell GH">
          <span className="new-mac-brand-aura" aria-hidden="true" />
          <img
            src={brandArtwork}
            alt="Buy & Sell GH"
            loading={priority ? "eager" : "lazy"}
            decoding="async"
            fetchPriority={priority ? "high" : "auto"}
          />
        </div>
      )}
      <div className="new-mac-launch-copy">
        <p className="store-eyebrow">New Mac</p>
        <HeadingTag id={`${launch.key}-launch-title`}>{launch.name}</HeadingTag>
        <p className="new-mac-launch-subtitle">{launch.subtitle}</p>
        <p className="new-mac-launch-status">Pre-order now. Local availability to be confirmed.</p>
        <div className="store-actions">
          <Link className="store-button store-button-primary" to={launch.learnMoreTo}>Learn more</Link>
          <Link className="store-button store-button-secondary" to={launch.preorderTo}>Pre-order</Link>
        </div>
      </div>
      <div className="new-mac-launch-art">
        <span className="new-mac-launch-glow" aria-hidden="true" />
        <img
          src={launch.image}
          alt={launch.imageAlt}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          fetchPriority={priority ? "high" : "auto"}
        />
      </div>
    </section>
  );
}
