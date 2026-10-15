import { Link } from "react-router-dom";
import type { LearnMoreSection } from "../cms/learnMoreRepository";
import "../styles/learn-more-sections.css";

function SectionImage({ section, src, alt }: { section: LearnMoreSection; src: string; alt: string }) {
  return <picture>
    {section.mobileImage && src === section.image && <source media="(max-width: 700px)" srcSet={section.mobileImage} />}
    <img src={src} alt={alt} loading="lazy" decoding="async"
      style={{ objectFit: section.fit || "contain", objectPosition: section.position || "center" }} />
  </picture>;
}

export function LearnMoreSections({ sections }: { sections: LearnMoreSection[] }) {
  const visible = sections.filter((section) => section.enabled);
  if (!visible.length) return null;
  return <div className="learn-more-extra">
    {visible.map((section) => {
      const isVideo = section.type === "video";
      const isGallery = section.type === "gallery";
      return <section className={`learn-more-extra-section learn-more-extra-${section.type}`} key={section.id} id={`learn-more-${section.id}`}>
        <div className="learn-more-extra-inner">
          <div className="learn-more-extra-copy">
            {section.eyebrow && <p className="learn-more-extra-eyebrow">{section.eyebrow}</p>}
            {section.title && <h2>{section.title}</h2>}
            {section.body && <p>{section.body}</p>}
            {section.type === "cta" && section.buttonTo?.startsWith("/") && !section.buttonTo.startsWith("//") &&
              <Link className="learn-more-extra-button" to={section.buttonTo}>{section.buttonLabel || "View pricing"}</Link>}
          </div>
          {isGallery && section.images?.length ? <div className="learn-more-extra-gallery">
            {section.images.map((src, index) => <SectionImage key={`${src}-${index}`} section={section} src={src} alt={`${section.alt || section.title} ${index + 1}`} />)}
          </div> : null}
          {isVideo && section.video && <video className="learn-more-extra-video" autoPlay={section.autoplay} muted={section.autoplay || section.muted}
            loop={section.loop} controls={section.controls} playsInline poster={section.poster} preload="metadata" aria-label={section.alt || section.title}>
            {section.mobileVideo && <source media="(max-width: 700px)" src={section.mobileVideo} />}
            <source src={section.video} />
          </video>}
          {!isVideo && !isGallery && section.image && <div className="learn-more-extra-image">
            <SectionImage section={section} src={section.image} alt={section.alt || section.title} />
          </div>}
        </div>
      </section>;
    })}
  </div>;
}
