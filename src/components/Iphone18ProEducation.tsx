import { Link } from "react-router-dom";
import { Fragment } from "react";
import type { EditorialImage } from "../catalog/editorialStories";
import { sectionsAt, type LearnMoreSection } from "../cms/learnMoreRepository";
import {
  iphone18ProEducation,
  type IphoneEducationChapter,
  type IphoneEducationContent,
  type IphoneEducationImage,
} from "../data/iphone18ProEducation";
import { LearnMoreSections } from "./LearnMoreSections";
import "../styles/iphone-18-pro-education.css";

function ProductFigure({ image, hero }: { image: IphoneEducationImage; hero: EditorialImage }) {
  const src = image.src || hero.src;
  return <figure className={`iphone-edu-figure iphone-edu-figure-${image.className}`}>
    {image.className === "camera" ? <div className="iphone-edu-camera-media">
      <picture>{image.mobileSrc && <source media="(max-width: 600px)" srcSet={image.mobileSrc} />}
        <img src={src} alt={image.alt} loading="lazy" decoding="async" /></picture>
    </div> : <picture>{image.mobileSrc && <source media="(max-width: 600px)" srcSet={image.mobileSrc} />}
      <img src={src} alt={image.alt} loading="lazy" decoding="async" /></picture>}
    <figcaption>{image.caption}</figcaption>
  </figure>;
}

function Chapter({ chapter, hero }: { chapter: IphoneEducationChapter; hero: EditorialImage }) {
  if (!chapter.enabled) return null;
  return <section id={chapter.id} className={`iphone-edu-section${chapter.dark ? " iphone-edu-dark" : ""}`} aria-labelledby={`${chapter.id}-title`}>
    <div className="iphone-edu-inner">
      <div className="iphone-edu-heading"><span className="iphone-edu-index">{chapter.number} / {chapter.label}</span>
        <h2 id={`${chapter.id}-title`}>{chapter.title}</h2><p>{chapter.intro}</p></div>
      {chapter.imagesBefore.map((image, index) => <ProductFigure key={`${image.className}-${index}`} image={image} hero={hero} />)}
      {chapter.lessons.length > 0 && <div className="iphone-edu-lessons">{chapter.lessons.map((item, index) => <article className="iphone-edu-lesson" key={`${item.title}-${index}`}>
        <h3>{item.title}</h3><p>{item.explanation}</p>
      </article>)}</div>}
      {chapter.audience.length > 0 && <div className="iphone-edu-audience">{chapter.audience.map((item, index) => <div key={`${item.title}-${index}`}>
        <h3>{item.title}</h3><p>{item.explanation}</p>
      </div>)}</div>}
      {chapter.imagesAfter.map((image, index) => <ProductFigure key={`${image.className}-${index}`} image={image} hero={hero} />)}
    </div>
  </section>;
}

export function Iphone18ProEducation({ buyPath, hero, sections = [], content = iphone18ProEducation }: {
  buyPath: string; hero: EditorialImage; sections?: LearnMoreSection[]; content?: IphoneEducationContent;
}) {
  return <div className="iphone-edu">
    {content.overview.enabled && <section className="iphone-edu-overview" id="highlights" aria-labelledby="iphone-edu-overview-title">
      <div className="iphone-edu-inner"><span className="iphone-edu-index">{content.overview.label}</span>
        <h2 id="iphone-edu-overview-title">{content.overview.title}</h2>
        <p className="iphone-edu-lead">{content.overview.lead}</p>
        <div className="iphone-edu-facts" aria-label="Key iPhone 18 Pro specifications">{content.overview.facts.map((fact, index) =>
          <div key={`${fact.value}-${index}`}><strong>{fact.value}</strong><span>{fact.label}</span></div>)}</div>
      </div>
    </section>}

    <LearnMoreSections sections={sectionsAt(sections, "after-overview")} />

    {content.chapters.map((chapter) => <Fragment key={chapter.id}>
      <Chapter chapter={chapter} hero={hero} />
      <LearnMoreSections sections={sectionsAt(sections, `after-chapter:${chapter.id}`)} />
    </Fragment>)}
    <LearnMoreSections sections={sectionsAt(sections, "end")} />

    {content.finale.enabled && <section className="iphone-edu-finale" aria-labelledby="iphone-edu-finale-title">
      <div className="iphone-edu-inner"><span className="iphone-edu-index">{content.finale.label}</span>
        <h2 id="iphone-edu-finale-title">{content.finale.title}</h2>
        <ProductFigure image={content.finale.image} hero={hero} />
      </div>
    </section>}

    {content.before.enabled && <section className="iphone-edu-before" id="before-you-buy" aria-labelledby="iphone-edu-before-title">
      <div className="iphone-edu-inner"><span className="iphone-edu-index">{content.before.label}</span>
        <h2 id="iphone-edu-before-title">{content.before.title}</h2><p>{content.before.body}</p>
        <div className="iphone-edu-before-actions"><Link className="editorial-buy" to={buyPath}>{content.before.buttonLabel}</Link>
          <a href={content.before.specsUrl} target="_blank" rel="noreferrer">{content.before.specsLabel}</a></div>
      </div>
    </section>}
  </div>;
}
