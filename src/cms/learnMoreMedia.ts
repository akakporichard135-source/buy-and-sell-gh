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
    if (target.field === "heroImage") {
      if (content.kind === "editorial") return content.story.hero.src;
      if (content.kind === "mac-studio") return content.story.image.src;
      return content.story.media.src;
    }
    if (target.field === "heroMobileImage") {
      if (content.kind === "editorial") return content.story.hero.mobileSrc;
      if (content.kind === "mac-studio") return content.story.image.mobileSrc;
      return undefined;
    }
    if (target.field === "heroVideo") {
      if (content.kind === "editorial") return content.story.hero.videoSrc;
      if (content.kind === "catalog" && content.story.media.type === "video") return content.story.media.src;
      return undefined;
    }
    if (target.field === "heroMobileVideo") {
      if (content.kind === "editorial") return content.story.hero.mobileVideoSrc;
      return undefined;
    }
    if (target.field === "heroPoster") {
      if (content.kind === "editorial") return content.story.hero.posterSrc || content.story.hero.src;
      return undefined;
    }
    if (content.kind === "editorial" && content.story.cinematicVideo) {
      if (target.field === "videoPoster") return content.story.cinematicVideo.poster;
      if (target.field === "videoSrc") return content.story.cinematicVideo.src;
      if (target.field === "mobileVideoSrc") return content.story.cinematicVideo.mobileSrc;
    }
    return undefined;
  }
  const section = content.sections.find((item) => item.id === target.sectionId);
  if (!section) return undefined;
  if (typeof target.galleryIndex === "number") return section.images?.[target.galleryIndex];
  if (typeof target.itemIndex === "number") return section.items?.[target.itemIndex]?.image;
  if (target.field === "image") return section.image;
  if (target.field === "video") return section.video;
  if (target.field === "poster") return section.poster;
  if (target.field === "mobileVideo") return section.mobileVideo;
  if (target.field === "mobileImage") return section.mobileImage;
  return undefined;
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
      if (next.kind === "editorial") {
        next.story.hero.src = url;
        next.story.hero.cmsAssetOverride = true;
      } else if (next.kind === "mac-studio") {
        next.story.image.src = url;
        next.story.image.cmsAssetOverride = true;
      } else {
        next.story.media.src = url;
        next.story.media.cmsAssetOverride = true;
      }
    } else if (target.field === "heroMobileImage") {
      if (next.kind === "editorial") {
        next.story.hero.mobileSrc = url;
        next.story.hero.cmsAssetOverride = true;
      } else if (next.kind === "mac-studio") {
        next.story.image.mobileSrc = url;
        next.story.image.cmsAssetOverride = true;
      }
    } else if (target.field === "heroVideo") {
      if (next.kind === "editorial") {
        next.story.hero.videoSrc = url;
        next.story.hero.mediaMode = url ? "video" : "image";
        next.story.hero.cmsAssetOverride = true;
      } else if (next.kind === "catalog") {
        next.story.media = {
          type: url ? "video" : "image",
          src: url || next.story.media.src,
          alt: next.story.media.alt || next.story.name,
          cmsAssetOverride: true,
        };
      }
    } else if (target.field === "heroMobileVideo") {
      if (next.kind === "editorial") {
        next.story.hero.mobileVideoSrc = url;
        next.story.hero.cmsAssetOverride = true;
      }
    } else if (target.field === "heroPoster") {
      if (next.kind === "editorial") {
        next.story.hero.posterSrc = url;
        if (!next.story.hero.src) {
          next.story.hero.src = url;
        }
        next.story.hero.cmsAssetOverride = true;
      }
    } else if (next.kind === "editorial") {
      if (!next.story.cinematicVideo) {
        next.story.cinematicVideo = {
          src: "",
          poster: next.story.hero.src || "",
          alt: `${next.story.name} cinematic film`,
          eyebrow: "Cinematic Hardware",
          headline: "Precision in continuous motion.",
          subheadline: "Autoplaying hardware film",
          aspectRatio: "16/9",
        };
      }
      if (target.field === "videoSrc") next.story.cinematicVideo.src = url;
      if (target.field === "mobileVideoSrc") next.story.cinematicVideo.mobileSrc = url;
      if (target.field === "videoPoster") next.story.cinematicVideo.poster = url;
    }
    return next;
  }

  const section = next.sections.find((item) => item.id === target.sectionId);
  if (!section) return next;
  if (target.galleryAppend) {
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
