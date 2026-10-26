import { Link } from "react-router-dom";
import type { LearnMoreSection } from "../cms/learnMoreRepository";
import "../styles/learn-more-sections.css";

function SectionImage({ section, src, alt }: { section: LearnMoreSection; src: string; alt: string }) {
  return (
    <picture key={src}>
      {section.mobileImage && src === section.image && (
        <source media="(max-width: 700px)" srcSet={section.mobileImage} />
      )}
      <img
        key={src}
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        style={{
          objectFit: section.fit || "contain",
          objectPosition: section.position || "center",
          aspectRatio: section.frameAspectRatio,
        }}
      />
    </picture>
  );
}

export function LearnMoreSections({ sections }: { sections: LearnMoreSection[] }) {
  const visible = sections.filter((section) => section.enabled !== false);
  if (!visible.length) return null;

  return (
    <div className="learn-more-extra">
      {visible.map((section) => {
        const isVideo = section.type === "video";
        const isGallery = section.type === "gallery";
        const isFeatureCards = section.type === "feature-cards";
        const isSpecs = section.type === "specifications";
        const isComparison = section.type === "comparison";
        const isFinishes = section.type === "finishes";
        const isHardwareCloseUp = section.type === "hardware-close-up";
        const isFullBleed = section.type === "full-bleed";

        // Background styling
        const bgClass =
          section.backgroundColor === "dark"
            ? "is-bg-dark"
            : section.backgroundColor === "soft-gray"
            ? "is-bg-soft-gray"
            : section.backgroundColor === "white"
            ? "is-bg-white"
            : "";
        const bgStyle =
          section.backgroundColor &&
          !["white", "soft-gray", "dark"].includes(section.backgroundColor)
            ? { backgroundColor: section.backgroundColor }
            : undefined;

        // Alignment & Layout classes
        const alignClass = section.textAlignment ? `align-${section.textAlignment}` : "align-center";
        const layoutClass = section.layout ? `layout-${section.layout}` : "";
        const animClass = section.animationPreset ? `anim-${section.animationPreset}` : "";

        return (
          <section
            key={section.id}
            id={`learn-more-${section.id}`}
            className={`learn-more-extra-section learn-more-extra-${section.type} ${bgClass} ${layoutClass} ${animClass}`}
            style={bgStyle}
          >
            <div className={`learn-more-extra-inner ${isFullBleed ? "is-full-bleed" : ""}`}>
              {/* Copy Container */}
              <div className={`learn-more-extra-copy ${alignClass}`}>
                {section.eyebrow && <p className="learn-more-extra-eyebrow">{section.eyebrow}</p>}
                {section.title && <h2>{section.title}</h2>}
                {section.body && <p className="learn-more-extra-body">{section.body}</p>}
                {section.supportingText && (
                  <p className="learn-more-extra-supporting">{section.supportingText}</p>
                )}
                {section.type === "cta" &&
                  section.buttonTo?.startsWith("/") &&
                  !section.buttonTo.startsWith("//") && (
                    <div className="learn-more-extra-actions">
                      <Link className="learn-more-extra-button" to={section.buttonTo}>
                        {section.buttonLabel || "Buy now"}
                      </Link>
                    </div>
                  )}
              </div>

              {/* Multi-Angle Gallery */}
              {isGallery && section.images?.length ? (
                <div className="learn-more-extra-gallery">
                  {section.images.map((src, index) => (
                    <SectionImage
                      key={`${src}-${index}`}
                      section={section}
                      src={src}
                      alt={`${section.alt || section.title} ${index + 1}`}
                    />
                  ))}
                </div>
              ) : null}

              {/* Feature Cards Grid */}
              {isFeatureCards && section.items?.length ? (
                <div className="learn-more-extra-cards-grid">
                  {section.items.map((item, idx) => (
                    <article className="learn-more-feature-card" key={`${item.label}-${idx}`}>
                      {item.image && (
                        <div className="learn-more-card-media">
                          <img key={item.image} src={item.image} alt={item.label} loading="lazy" />
                        </div>
                      )}
                      <div className="learn-more-card-content">
                        <span className="learn-more-card-eyebrow">{item.label}</span>
                        <h3 className="learn-more-card-title">{item.value}</h3>
                        {item.description && (
                          <p className="learn-more-card-desc">{item.description}</p>
                        )}
                      </div>
                    </article>
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
                    <div className="learn-more-comp-card" key={`${col.label}-${idx}`}>
                      {col.image && (
                        <div className="learn-more-comp-img">
                          <img key={col.image} src={col.image} alt={col.label} loading="lazy" />
                        </div>
                      )}
                      <h4 className="learn-more-comp-name">{col.label}</h4>
                      <div className="learn-more-comp-highlight">{col.value}</div>
                      {col.description && (
                        <p className="learn-more-comp-notes">{col.description}</p>
                      )}
                    </div>
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
              {isVideo && section.video && (
                <video
                  className="learn-more-extra-video"
                  autoPlay={section.autoplay}
                  muted={section.autoplay || section.muted}
                  loop={section.loop}
                  controls={section.controls}
                  playsInline
                  poster={section.poster}
                  preload="metadata"
                  aria-label={section.alt || section.title}
                >
                  {section.mobileVideo && (
                    <source media="(max-width: 700px)" src={section.mobileVideo} />
                  )}
                  <source src={section.video} />
                </video>
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
                  {section.buttonTo && section.type !== "cta" && (
                    <div className="learn-more-image-cta">
                      <Link className="learn-more-extra-button" to={section.buttonTo}>
                        {section.buttonLabel || "Explore"}
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}
