import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useResolvedMediaUrl } from "../cms/localMediaStore";
import type { LearnMoreSection, LearnMoreSectionItem } from "../cms/learnMoreRepository";
import "../styles/learn-more-sections.css";

function SectionActionLink({
  to,
  label,
}: {
  to: string;
  label: string;
}) {
  if (/^https?:\/\//i.test(to)) {
    return (
      <a className="learn-more-extra-button" href={to} target="_blank" rel="noopener noreferrer">
        {label}
      </a>
    );
  }
  return (
    <Link className="learn-more-extra-button" to={to}>
      {label}
    </Link>
  );
}

function SectionImage({
  section,
  src,
  alt,
  caption,
}: {
  section: LearnMoreSection;
  src: string;
  alt: string;
  caption?: string;
}) {
  const { resolvedUrl: resolvedDesktop } = useResolvedMediaUrl(src);
  const { resolvedUrl: resolvedMobile } = useResolvedMediaUrl(
    src === section.image ? section.mobileImage : undefined
  );
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth <= 768 : false
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    const onResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  if (!resolvedDesktop && !resolvedMobile) return null;

  const objectPos =
    isMobile && section.mobilePosition
      ? section.mobilePosition
      : section.position || "center";

  const imgEl = resolvedMobile ? (
    <picture key={resolvedDesktop || resolvedMobile}>
      <source media="(max-width: 768px)" srcSet={resolvedMobile} />
      <img
        src={resolvedDesktop || resolvedMobile}
        alt={alt}
        loading="lazy"
        decoding="async"
        style={{
          objectFit: section.fit || "contain",
          objectPosition: objectPos,
          aspectRatio: section.frameAspectRatio,
        }}
      />
    </picture>
  ) : (
    <img
      key={resolvedDesktop}
      src={resolvedDesktop}
      alt={alt}
      loading="lazy"
      decoding="async"
      style={{
        objectFit: section.fit || "contain",
        objectPosition: objectPos,
        aspectRatio: section.frameAspectRatio,
      }}
    />
  );

  if (caption) {
    return (
      <figure className="learn-more-gallery-figure">
        {imgEl}
        <figcaption className="learn-more-gallery-caption">{caption}</figcaption>
      </figure>
    );
  }

  return imgEl;
}

function SectionVideo({ section }: { section: LearnMoreSection }) {
  const { resolvedUrl: resolvedVideo } = useResolvedMediaUrl(section.video);
  const { resolvedUrl: resolvedMobileVideo } = useResolvedMediaUrl(section.mobileVideo);
  const { resolvedUrl: resolvedPoster } = useResolvedMediaUrl(
    section.poster || section.image
  );
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth <= 768 : false
  );
  const [videoFailed, setVideoFailed] = useState(false);

  useEffect(() => {
    setVideoFailed(false);
  }, [resolvedVideo, resolvedMobileVideo]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const onResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const activeVideo =
    isMobile && resolvedMobileVideo
      ? resolvedMobileVideo
      : resolvedVideo || resolvedMobileVideo;

  if (!activeVideo || videoFailed) {
    if (resolvedPoster) {
      return (
        <div className="learn-more-extra-image">
          <img
            src={resolvedPoster}
            alt={section.alt || section.title}
            style={{
              objectFit: section.fit || "cover",
              objectPosition: section.position || "center",
            }}
          />
        </div>
      );
    }
    return null;
  }

  return (
    <video
      key={activeVideo}
      data-testid={`learn-more-section-video-${section.id}`}
      className="learn-more-extra-video"
      src={activeVideo}
      autoPlay={section.autoplay !== false}
      muted={section.autoplay !== false || section.muted !== false}
      loop={section.loop !== false}
      controls={section.controls !== false}
      playsInline
      poster={resolvedPoster || undefined}
      preload="metadata"
      onError={() => setVideoFailed(true)}
      aria-label={section.alt || section.title}
      style={{
        objectFit: section.fit || "cover",
        objectPosition: section.position || "center",
      }}
    />
  );
}

function FeatureCardItem({ item }: { item: LearnMoreSectionItem }) {
  const { resolvedUrl } = useResolvedMediaUrl(item.image);
  return (
    <article className="learn-more-feature-card">
      {resolvedUrl && (
        <div className="learn-more-card-media">
          <img key={resolvedUrl} src={resolvedUrl} alt={item.label} loading="lazy" />
        </div>
      )}
      <div className="learn-more-card-content">
        <span className="learn-more-card-eyebrow">{item.label}</span>
        <h3 className="learn-more-card-title">{item.value}</h3>
        {item.description && <p className="learn-more-card-desc">{item.description}</p>}
      </div>
    </article>
  );
}

function ComparisonCardItem({ col }: { col: LearnMoreSectionItem }) {
  const { resolvedUrl } = useResolvedMediaUrl(col.image);
  return (
    <div className="learn-more-comp-card">
      {resolvedUrl && (
        <div className="learn-more-comp-img">
          <img key={resolvedUrl} src={resolvedUrl} alt={col.label} loading="lazy" />
        </div>
      )}
      <h4 className="learn-more-comp-name">{col.label}</h4>
      <div className="learn-more-comp-highlight">{col.value}</div>
      {col.description && <p className="learn-more-comp-notes">{col.description}</p>}
    </div>
  );
}

export function LearnMoreSections({ sections }: { sections: LearnMoreSection[] }) {
  const visible = sections.filter((section) => section.enabled !== false);
  if (!visible.length) return null;

  return (
    <div className="learn-more-extra">
      {visible.map((section) => {
        const isVideo = section.type === "video" || Boolean(section.video);
        const isGallery = section.type === "gallery";
        const isFeatureCards =
          section.type === "feature-cards" || section.type === "highlights";
        const isSpecs = section.type === "specifications";
        const isComparison = section.type === "comparison";
        const isFinishes = section.type === "finishes";
        const isHardwareCloseUp = section.type === "hardware-close-up";
        const isFullBleed =
          section.type === "full-bleed" ||
          section.containerMode === "full-width" ||
          section.layout === "full-width";

        const resolvedTone =
          section.tone ||
          (section.backgroundColor === "dark" || section.backgroundColor === "#000000"
            ? "dark"
            : "light");

        const bgClass =
          resolvedTone === "dark" || section.backgroundColor === "dark"
            ? "is-bg-dark"
            : section.backgroundColor === "soft-gray"
            ? "is-bg-soft-gray"
            : section.backgroundColor === "white"
            ? "is-bg-white"
            : "";

        const customStyle: React.CSSProperties | undefined =
          (section.backgroundColor &&
            !["white", "soft-gray", "dark"].includes(section.backgroundColor)) ||
          section.backgroundGradient
            ? {
                ...(section.backgroundColor &&
                !["white", "soft-gray", "dark"].includes(section.backgroundColor)
                  ? { backgroundColor: section.backgroundColor }
                  : {}),
                ...(section.backgroundGradient
                  ? { backgroundImage: section.backgroundGradient }
                  : {}),
              }
            : undefined;

        const alignClass = section.textAlignment
          ? `align-${section.textAlignment}`
          : section.layout === "split-left" || section.layout === "split-right"
          ? "align-left"
          : "align-center";
        const layoutClass = section.layout ? `layout-${section.layout}` : "";
        const animClass = section.animationPreset ? `anim-${section.animationPreset}` : "";
        const spacingClass = section.spacing ? `is-spacing-${section.spacing}` : "";

        const hasCopy = Boolean(
          section.eyebrow ||
            section.title ||
            section.subtitle ||
            section.body ||
            section.supportingText ||
            section.buttonTo
        );

        return (
          <section
            key={section.id}
            id={`learn-more-${section.id}`}
            data-section-id={section.id}
            data-section-type={section.type}
            data-section-layout={section.layout || "stacked"}
            className={`learn-more-extra-section learn-more-extra-${section.type} ${bgClass} ${layoutClass} ${animClass} ${spacingClass}`}
            style={customStyle}
          >
            <div className={`learn-more-extra-inner ${isFullBleed ? "is-full-bleed" : ""}`}>
              {hasCopy && (
                <div className={`learn-more-extra-copy ${alignClass}`}>
                  {section.eyebrow && (
                    <p className="learn-more-extra-eyebrow">{section.eyebrow}</p>
                  )}
                  {section.title && <h2>{section.title}</h2>}
                  {section.subtitle && (
                    <p className="learn-more-extra-subtitle">{section.subtitle}</p>
                  )}
                  {section.body && <p className="learn-more-extra-body">{section.body}</p>}
                  {section.supportingText && (
                    <p className="learn-more-extra-supporting">{section.supportingText}</p>
                  )}
                  {section.buttonTo && (
                    <div className="learn-more-extra-actions">
                      <SectionActionLink
                        to={section.buttonTo}
                        label={section.buttonLabel || "Learn more"}
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Multi-Angle Gallery */}
              {isGallery && section.images?.length ? (
                <div
                  className={`learn-more-extra-gallery ${
                    section.layout === "carousel" ? "is-horizontal-gallery" : ""
                  }`}
                >
                  {section.images.map((src, index) => (
                    <SectionImage
                      key={`${src}-${index}`}
                      section={section}
                      src={src}
                      alt={`${section.alt || section.title} ${index + 1}`}
                      caption={section.galleryCaptions?.[index]}
                    />
                  ))}
                </div>
              ) : null}

              {/* Feature Cards / Highlights Grid */}
              {isFeatureCards && section.items?.length ? (
                <div
                  className={`learn-more-extra-cards-grid ${
                    section.layout === "grid-2" ? "is-cols-2" : ""
                  }`}
                >
                  {section.items.map((item, idx) => (
                    <FeatureCardItem key={`${item.label}-${idx}`} item={item} />
                  ))}
                </div>
              ) : null}

              {/* Specifications Table */}
              {isSpecs && section.items?.length ? (
                <div className="learn-more-extra-specs-table">
                  {section.items.map((spec, idx) => (
                    <div className="learn-more-spec-row" key={`${spec.label}-${idx}`}>
                      <div className="learn-more-spec-label">{spec.label}</div>
                      <div className="learn-more-spec-value">
                        <strong>{spec.value}</strong>
                        {spec.description && <span>{spec.description}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}

              {/* Comparison Section */}
              {isComparison && section.items?.length ? (
                <div className="learn-more-extra-comparison-grid">
                  {section.items.map((col, idx) => (
                    <ComparisonCardItem key={`${col.label}-${idx}`} col={col} />
                  ))}
                </div>
              ) : null}

              {/* Materials & Finishes Swatches */}
              {isFinishes && section.items?.length ? (
                <div className="learn-more-extra-finishes">
                  <div className="learn-more-finishes-swatches">
                    {section.items.map((swatch, idx) => (
                      <div className="learn-more-swatch-item" key={`${swatch.label}-${idx}`}>
                        <span
                          className="learn-more-swatch-circle"
                          style={{ backgroundColor: swatch.value || "#999" }}
                        />
                        <span className="learn-more-swatch-name">{swatch.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              {/* Cinematic Video Showcase */}
              {isVideo && (section.video || section.mobileVideo) && (
                <SectionVideo section={section} />
              )}

              {/* Standard Image Presentation */}
              {!isVideo && !isGallery && section.image && (
                <div
                  className={`learn-more-extra-image ${
                    isHardwareCloseUp ? "is-hardware-closeup" : ""
                  }`}
                >
                  <SectionImage
                    section={section}
                    src={section.image}
                    alt={section.alt || section.title}
                  />
                </div>
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}
