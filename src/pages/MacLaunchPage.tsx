import { useEffect, useRef, useState } from "react";
import { ArrowRight, Braces, Cpu, Sparkles, Workflow, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { SEO } from "../components/SEO";
import { editorialStories } from "../catalog/editorialStories";
import { defaultEditorialShowcases } from "../catalog/minimalEditorialSections";
import { fetchPublishedLearnMore, getPublishedLearnMoreSync, refreshBundledStoryAssets, sectionsAt, type LearnMoreContent } from "../cms/learnMoreRepository";
import { MinimalEditorialProductStory } from "../components/MinimalEditorialProductStory";
import { LearnMoreSections } from "../components/LearnMoreSections";
import { macStudioStory, type MacStudioPanel } from "../data/macStudioStory";
import { newMacLaunches } from "../data/newMacLaunches";
import type { NewMacLaunchKey } from "../data/newMacLaunches";
import { subscribeToPublishedUpdates } from "../utils/imageVersioning";

const panelIcons = { zap: Zap, cpu: Cpu, sparkles: Sparkles, braces: Braces, workflow: Workflow };

export function MacLaunchPage({ product, preview }: { product: NewMacLaunchKey; preview?: LearnMoreContent }) {
  const [published, setPublished] = useState<LearnMoreContent | null>(() =>
    preview || getPublishedLearnMoreSync(product)
  );
  const [isResolving, setIsResolving] = useState<boolean>(() => !preview && !published);

  useEffect(() => {
    if (preview) return;
    let active = true;
    const fetchLatest = () => {
      void fetchPublishedLearnMore(product).catch(() => null).then((content) => {
        if (active) {
          setPublished(content);
          setIsResolving(false);
        }
      });
    };
    fetchLatest();

    const unsubscribe = subscribeToPublishedUpdates((msg) => {
      if (msg.type === "learn-more" && (!msg.id || msg.id === product)) {
        fetchLatest();
      }
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, [product, preview]);

  const content = preview || published;

  if (isResolving && !content) {
    return (
      <main className="mac-story-page mac-story-skeleton" style={{ minHeight: "80vh", background: "#000" }}>
        <SEO title="Mac | Buy & Sell GH" description="Explore Apple Silicon Macs with Buy & Sell GH." />
        <section className="mac-story-hero" style={{ minHeight: "70vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ width: "90%", maxWidth: "980px", minHeight: "380px", borderRadius: "24px", background: "rgba(255, 255, 255, 0.04)" }} />
        </section>
      </main>
    );
  }
  if (product === "mac-mini") {
    const current = editorialStories["mac-mini"];
    return <MinimalEditorialProductStory
      story={content?.kind === "editorial" ? refreshBundledStoryAssets(content.story, current) : current}
      sections={content?.sections ?? defaultEditorialShowcases(current)} />;
  }

  const launch = newMacLaunches[product];
  const story = content?.kind === "mac-studio" ? refreshBundledStoryAssets(content.story, macStudioStory) : macStudioStory;
  const sections = story.panels.filter((section) => section.enabled !== false);
  const macStudioSlots = ["after-hero", "after-panels", "after-film", "end"];

  return (
    <>
      <SEO title={`${story.name} ${story.chips} Pre-Order`} description={`Explore the new ${story.name} with ${story.chips}, then prepare a pre-order request with Buy & Sell GH.`} />
      <main className={`mac-story-page mac-story-${launch.theme}`}>
        <section className="mac-story-hero" aria-labelledby="mac-story-title">
          <div className="mac-story-hero-copy">
            <p className="store-eyebrow">{story.eyebrow}</p>
            <h1 id="mac-story-title">{story.name}</h1>
            <p>{story.chips}</p>
            <span>{story.availability}</span>
            <div className="store-actions">
              <Link className="store-button store-button-primary" to={story.preorderTo}>{story.preorderLabel}</Link>
              <Link className="store-button store-button-secondary" to={story.exploreTo}>{story.exploreLabel}</Link>
            </div>
          </div>
          <picture>{story.image.mobileSrc && <source media="(max-width: 600px)" srcSet={story.image.mobileSrc} />}
            <img src={story.image.src} alt={story.image.alt} fetchPriority="high" decoding="async"
              style={{ objectFit: story.image.fit, objectPosition: story.image.position }} /></picture>
        </section>
        <LearnMoreSections sections={sectionsAt(content?.sections || [], "after-hero")} />

        <div className="mac-story-grid">
          {sections.map((section) => <MacStoryPanel section={section} key={section.id} />)}
        </div>

        <LearnMoreSections sections={sectionsAt(content?.sections || [], "after-panels")} />
        <LearnMoreSections sections={sectionsAt(content?.sections || [], "after-film")} />
        <LearnMoreSections sections={sectionsAt(content?.sections || [], "end", macStudioSlots)} />

        <section className="mac-story-preorder" aria-labelledby="mac-story-preorder-title">
          <p className="store-eyebrow">{story.conclusion.eyebrow}</p>
          <h2 id="mac-story-preorder-title">{story.conclusion.title}</h2>
          <p>{story.conclusion.body}</p>
          <Link className="store-button store-button-primary" to={story.conclusion.buttonTo}>{story.conclusion.buttonLabel} <ArrowRight size={17} /></Link>
        </section>
      </main>
    </>
  );
}

function MacStoryPanel({ section }: { section: MacStudioPanel }) {
  const panelRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;
    if (!window.IntersectionObserver) {
      panel.classList.add("is-visible");
      return;
    }
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      panel.classList.add("is-visible");
      observer.disconnect();
    }, { threshold: 0.16 });
    observer.observe(panel);
    return () => observer.disconnect();
  }, []);

  const Icon = panelIcons[section.icon] || Zap;
  return (
    <article ref={panelRef} className={`mac-story-panel mac-story-panel-${section.tone ?? "light"}`}>
      <Icon size={30} aria-hidden="true" />
      <p className="store-eyebrow">{section.eyebrow}</p>
      <h2>{section.title}</h2>
      <p>{section.description}</p>
      <ul>{section.facts.map((fact) => <li key={fact}>{fact}</li>)}</ul>
    </article>
  );
}
