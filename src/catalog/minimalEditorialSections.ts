import type { LearnMoreSection } from "../cms/learnMoreRepository";
import type { EditorialStory } from "./editorialStories";

const showcaseChoices: Record<string, number[]> = {
  "iphone-18-pro": [0, 2],
  "iphone-duo": [0, 2],
  "apple-watch-series-12": [0, 4],
  "apple-watch-ultra-4": [0, 2],
  "airpods-pro-3": [0, 2],
  "airpods-5": [0, 2],
  "macbook-air": [0, 1],
  "macbook-pro": [0, 2],
  "mac-mini": [1, 2],
  "ipad-air": [0, 2],
  "ipad-pro": [0, 1],
};

export function defaultEditorialShowcases(story: EditorialStory): LearnMoreSection[] {
  const seen = new Set([story.hero.src]);
  const choices = showcaseChoices[story.slug] ?? [0, 1];
  return choices.flatMap((index) => {
    const highlight = story.highlights[index];
    if (!highlight?.image?.src || seen.has(highlight.image.src)) return [];
    seen.add(highlight.image.src);
    return [{
      id: `showcase-${index}`,
      type: "large-image" as const,
      enabled: true,
      placement: "after-film",
      eyebrow: highlight.label,
      title: highlight.title,
      body: "",
      backgroundColor: highlight.tone === "ink" ? "dark" : "white",
      textAlignment: "center" as const,
      layout: "stacked" as const,
      animationPreset: "none" as const,
      image: highlight.image.src,
      alt: highlight.image.alt,
      fit: "contain" as const,
    }];
  });
}
