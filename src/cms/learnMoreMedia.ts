import type { LearnMoreContent } from "./learnMoreRepository";

export interface LearnMoreMediaTarget {
  sectionId?: string;
  field: string;
  itemIndex?: number;
  galleryAppend?: boolean;
  galleryIndex?: number;
}

export function getLearnMoreMediaSource(content: LearnMoreContent, target: LearnMoreMediaTarget): string | undefined {
  if (!target.sectionId) {
    if (target.field !== "heroImage") return undefined;
    if (content.kind === "editorial") return content.story.hero.src;
    if (content.kind === "mac-studio") return content.story.image.src;
    return content.story.media.type === "image" ? content.story.media.src : undefined;
  }
  const section = content.sections.find((item) => item.id === target.sectionId);
  if (!section) return undefined;
  if (typeof target.galleryIndex === "number") return section.images?.[target.galleryIndex];
  if (typeof target.itemIndex === "number") return section.items?.[target.itemIndex]?.image;
  return target.field === "image" ? section.image : undefined;
}

export function replaceLearnMoreMedia(
  content: LearnMoreContent,
  target: LearnMoreMediaTarget,
  url: string,
  originalAspectRatio?: number,
): LearnMoreContent {
  const next = structuredClone(content);
  if (!target.sectionId) {
    if (target.field === "heroImage") {
      const media = next.kind === "editorial" ? next.story.hero
        : next.kind === "mac-studio" ? next.story.image : next.story.media;
      if (next.kind !== "catalog" || next.story.media.type === "image") {
        media.src = url;
        media.cmsAssetOverride = true;
      }
    } else if (next.kind === "editorial" && next.story.cinematicVideo) {
      if (target.field === "videoSrc") next.story.cinematicVideo.src = url;
      if (target.field === "mobileVideoSrc") next.story.cinematicVideo.mobileSrc = url;
      if (target.field === "videoPoster") next.story.cinematicVideo.poster = url;
    }
    return next;
  }

  const section = next.sections.find((item) => item.id === target.sectionId);
  if (!section) return next;
  if (target.galleryAppend && section.type === "gallery") {
    section.images = [...(section.images || []), url];
  } else if (typeof target.galleryIndex === "number" && section.images?.[target.galleryIndex] !== undefined) {
    section.images[target.galleryIndex] = url;
  } else if (typeof target.itemIndex === "number" && section.items?.[target.itemIndex]) {
    section.items[target.itemIndex].image = url;
  } else if (target.field === "image" || target.field === "mobileImage") {
    section[target.field] = url;
    if (target.field === "image" && !section.frameAspectRatio && originalAspectRatio && originalAspectRatio > 0) {
      section.frameAspectRatio = originalAspectRatio;
    }
  } else if (target.field === "video" || target.field === "mobileVideo" || target.field === "poster") {
    section[target.field] = url;
  }
  return next;
}
