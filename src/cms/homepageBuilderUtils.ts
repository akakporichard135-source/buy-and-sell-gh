import type {
  HomepageBentoTile,
  HomepageCarouselCard,
  HomepageMediaMode,
  HomepagePromoPanel,
  HomepageSection,
  HomepageSectionType,
  Tone,
} from "./types";

export const SUPPORTED_LOCAL_VIDEO_FORMATS = ["mp4", "webm", "mov", "m4v"] as const;
export const SUPPORTED_VIDEO_ACCEPT =
  "video/mp4,video/webm,video/quicktime,video/x-m4v,.mp4,.webm,.mov,.m4v";
export const SUPPORTED_IMAGE_ACCEPT =
  "image/webp,image/png,image/jpeg,image/avif,.webp,.png,.jpg,.jpeg,.avif";

export interface MediaSlotLike {
  mediaMode?: HomepageMediaMode;
  desktopImage?: string;
  mobileImage?: string;
  videoUrl?: string;
  mobileVideoUrl?: string;
  posterUrl?: string;
  mobilePosterUrl?: string;
  videoAutoplay?: boolean;
  videoMuted?: boolean;
  videoLoop?: boolean;
}

/**
 * Resolves whether a section/tile/card/panel is currently in image or video mode.
 * Preserves alternate media URLs when switching between modes.
 */
export function resolveEffectiveMediaMode(slot?: MediaSlotLike | null): HomepageMediaMode {
  if (!slot) return "image";
  if (slot.mediaMode === "video" || slot.mediaMode === "image") {
    return slot.mediaMode;
  }
  return slot.videoUrl || slot.mobileVideoUrl ? "video" : "image";
}

/**
 * Indicates whether a media slot currently has an active media source populated.
 */
export function hasActiveSlotMedia(slot?: MediaSlotLike | null): boolean {
  if (!slot) return false;
  const mode = resolveEffectiveMediaMode(slot);
  return mode === "video"
    ? Boolean((slot.videoUrl || "").trim() || (slot.mobileVideoUrl || "").trim())
    : Boolean((slot.desktopImage || "").trim() || (slot.mobileImage || "").trim());
}

/**
 * Returns active video & poster fallback URLs for desktop or mobile viewports,
 * enforcing muted playback whenever autoplay is enabled.
 */
export function resolveResponsiveVideoPlayback(
  slot: MediaSlotLike & {
    isMobile?: boolean;
    prefersReducedMotion?: boolean;
  }
) {
  const isMobile = Boolean(slot.isMobile);
  const autoplayRequested = slot.videoAutoplay !== false;
  const shouldAutoplay = autoplayRequested && !slot.prefersReducedMotion;
  // Safe default: force muted whenever autoplay is enabled to prevent unexpected sound
  const muted = shouldAutoplay ? true : slot.videoMuted !== false;
  const loop = slot.videoLoop !== false;

  const activeVideoUrl = (isMobile && slot.mobileVideoUrl) || slot.videoUrl || slot.mobileVideoUrl || "";
  const activePosterUrl =
    (isMobile && slot.mobilePosterUrl) ||
    slot.posterUrl ||
    slot.mobilePosterUrl ||
    (isMobile && slot.mobileImage) ||
    slot.desktopImage ||
    "";

  return {
    activeVideoUrl: activeVideoUrl.trim(),
    activePosterUrl: activePosterUrl.trim(),
    shouldAutoplay,
    muted,
    loop,
  };
}

/**
 * Pure list reorder by array indices. Reindexes `order` 1..N while keeping
 * visibility, IDs, nested tiles/cards/panels, and media references untouched.
 */
export function reorderListByIndex<T extends { order?: number }>(
  items: readonly T[],
  fromIndex: number,
  toIndex: number
): T[] {
  if (
    fromIndex < 0 ||
    toIndex < 0 ||
    fromIndex >= items.length ||
    toIndex >= items.length ||
    fromIndex === toIndex
  ) {
    return [...items];
  }
  const next = [...items];
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);
  return next.map((item, idx) => ({ ...item, order: idx + 1 }));
}

/**
 * Pure list reorder by item ID for HTML5 drag-and-drop interactions.
 */
export function reorderListById<T extends { id: string; order?: number }>(
  items: readonly T[],
  draggedId: string,
  targetId: string
): T[] {
  if (!draggedId || !targetId || draggedId === targetId) {
    return [...items];
  }
  const fromIndex = items.findIndex((item) => item.id === draggedId);
  const toIndex = items.findIndex((item) => item.id === targetId);
  if (fromIndex === -1 || toIndex === -1) {
    return [...items];
  }
  return reorderListByIndex(items, fromIndex, toIndex);
}

export interface HomepageSectionPreset {
  key: string;
  type: HomepageSectionType;
  label: string;
  description: string;
  defaultEyebrow: string;
  defaultHeading: string;
  defaultSubtitle: string;
  defaultTone: Tone;
  defaultBg: string;
  category: "homepage" | "storefront";
}

export const HOMEPAGE_SECTION_PRESETS: HomepageSectionPreset[] = [
  {
    key: "preset-hero-campaign",
    type: "apple-hero",
    label: "Hero Campaign",
    description:
      "Full-width flagship hero campaign with headline, CTAs, and empty editable Image/Video slot.",
    defaultEyebrow: "FEATURED CAMPAIGN",
    defaultHeading: "New Flagship Arrival",
    defaultSubtitle: "Designed for extraordinary capability.",
    defaultTone: "dark",
    defaultBg: "#000000",
    category: "homepage",
  },
  {
    key: "preset-full-width-campaign",
    type: "promo-banner",
    label: "Full-Width Campaign",
    description:
      "Full-width promotional showcase (e.g. seasonal campaign, trade-in, financing) with empty Image/Video slot.",
    defaultEyebrow: "BUY & SELL GH CAMPAIGN",
    defaultHeading: "Featured Store Campaign",
    defaultSubtitle: "Add your headline, CTA, and custom desktop/mobile image or video.",
    defaultTone: "dark",
    defaultBg: "#111113",
    category: "homepage",
  },
  {
    key: "preset-custom-promo",
    type: "promo-banner",
    label: "Custom Promotional Section",
    description:
      "Flexible light-surface custom promo banner starting with clean empty Image/Video slots.",
    defaultEyebrow: "SPECIAL HIGHLIGHT",
    defaultHeading: "Custom Promotional Feature",
    defaultSubtitle: "Tailor copy, links, colors, and desktop/mobile artwork.",
    defaultTone: "light",
    defaultBg: "#f5f5f7",
    category: "homepage",
  },
  {
    key: "preset-multi-strip",
    type: "multi-promo-strip",
    label: "Multi-Panel Image Strip",
    description:
      "Wide promotional campaign strip with central copy, CTAs, and 4 independently editable empty panels.",
    defaultEyebrow: "COLLECTION SPOTLIGHT",
    defaultHeading: "Explore Featured Highlights.",
    defaultSubtitle: "Showcase multiple campaigns or device families side by side.",
    defaultTone: "light",
    defaultBg: "#f5f5f7",
    category: "homepage",
  },
  {
    key: "preset-bento-grid",
    type: "apple-bento-grid",
    label: "Promotional Grid",
    description:
      "Two-column campaign grid starting with editable empty tiles (Image & Video supported per tile).",
    defaultEyebrow: "PROMOTIONAL GRID",
    defaultHeading: "Two-Column Promotional Grid",
    defaultSubtitle: "Rearrange tiles freely via drag-and-drop.",
    defaultTone: "light",
    defaultBg: "#ffffff",
    category: "homepage",
  },
  {
    key: "preset-story-carousel",
    type: "story-carousel",
    label: "Visual Carousel",
    description:
      "Large 16:9 storytelling/entertainment carousel starting with editable empty slide slots.",
    defaultEyebrow: "EXPERIENCE MORE",
    defaultHeading: "Closer Look Carousel",
    defaultSubtitle: "Add videos, lifestyle photography, and interactive slides.",
    defaultTone: "light",
    defaultBg: "#ffffff",
    category: "homepage",
  },
  {
    key: "preset-product-shelf",
    type: "product-carousel",
    label: "Product Shelf",
    description: "Real catalog device row backed by live Ghana Cedi (GH₵) inventory.",
    defaultEyebrow: "THE LATEST",
    defaultHeading: "Featured Devices Shelf",
    defaultSubtitle: "Assign catalog products right from the Inspector.",
    defaultTone: "light",
    defaultBg: "#f5f5f7",
    category: "storefront",
  },
  {
    key: "preset-family-strip",
    type: "product-family-strip",
    label: "Product-Family Campaign Section",
    description: "Department strip with optional campaign image/video banner and Store links.",
    defaultEyebrow: "STORE DEPARTMENTS",
    defaultHeading: "Explore the Lineup.",
    defaultSubtitle: "Original Apple hardware and certified devices.",
    defaultTone: "light",
    defaultBg: "#f5f5f7",
    category: "storefront",
  },
  {
    key: "preset-accessories-shelf",
    type: "accessories-collection",
    label: "Accessories Shelf",
    description: "Curated accessories collection backed by live store inventory.",
    defaultEyebrow: "ESSENTIALS",
    defaultHeading: "Featured Accessories",
    defaultSubtitle: "Assign original chargers, cases, cables, and audio gear.",
    defaultTone: "light",
    defaultBg: "#ffffff",
    category: "storefront",
  },
  {
    key: "preset-service-campaign",
    type: "services-showcase",
    label: "Service Campaign",
    description: "Repairs, Installment, Upgrade & Save, Sell Your Device, Refer a Friend showcase.",
    defaultEyebrow: "BUY & SELL GH SERVICES",
    defaultHeading: "Services Tailored for Ghana.",
    defaultSubtitle: "Local repairs, trade-in assessments, and installment support.",
    defaultTone: "light",
    defaultBg: "#ffffff",
    category: "storefront",
  },
  {
    key: "preset-footnotes",
    type: "footnotes",
    label: "Legal Footnotes",
    description: "Storefront fine print, trade-in conditions, and customer notices.",
    defaultEyebrow: "DISCLOSURES",
    defaultHeading: "Shopping & Trade-In Disclosures",
    defaultSubtitle: "",
    defaultTone: "light",
    defaultBg: "#f5f5f7",
    category: "homepage",
  },
];

/**
 * Builds a brand-new HomepageSection with empty editable media slots (no random stock media).
 */
export function createEmptySectionFromPreset(
  preset: HomepageSectionPreset,
  nextOrder: number,
  nowMs: number = Date.now()
): HomepageSection {
  const uniqueSuffix = `${nowMs}-${Math.random().toString(36).slice(2, 6)}`;

  const emptyPromoPanels: HomepagePromoPanel[] | undefined =
    preset.type === "multi-promo-strip"
      ? [1, 2, 3, 4].map((num) => ({
          id: `promo-panel-${uniqueSuffix}-${num}`,
          label: `Promo Panel ${num}`,
          mediaMode: "image",
          desktopImage: "",
          mobileImage: "",
          videoUrl: "",
          mobileVideoUrl: "",
          posterUrl: "",
          mobilePosterUrl: "",
          videoAutoplay: true,
          videoMuted: true,
          videoLoop: true,
          imageAlt: `Promotional panel ${num}`,
          focalPoint: "center",
          objectFit: "contain",
          destination: "/store",
          visible: true,
          order: num,
        }))
      : undefined;

  const emptyTiles: HomepageBentoTile[] | undefined =
    preset.type === "apple-bento-grid"
      ? [1, 2].map((num) => ({
          id: `tile-${uniqueSuffix}-${num}`,
          eyebrow: "CAMPAIGN",
          title: `Promo Tile ${num}`,
          subtitle: "Edit headline and add image or video.",
          tone: "light",
          backgroundColor: "#f5f5f7",
          mediaMode: "image",
          desktopImage: "",
          mobileImage: "",
          videoUrl: "",
          mobileVideoUrl: "",
          posterUrl: "",
          mobilePosterUrl: "",
          videoAutoplay: true,
          videoMuted: true,
          videoLoop: true,
          imageAlt: `Promo tile ${num}`,
          focalPoint: "bottom",
          objectFit: "contain",
          copyPlacement: "top",
          primaryLabel: "Learn more",
          primaryDestination: "/store",
          visible: true,
          order: num,
        }))
      : undefined;

  const emptyCards: HomepageCarouselCard[] | undefined =
    preset.type === "story-carousel"
      ? [1, 2].map((num) => ({
          id: `story-${uniqueSuffix}-${num}`,
          categoryLabel: "Spotlight",
          title: `Visual Slide ${num}`,
          caption: "Add caption, CTA, and image or video media.",
          mediaMode: "image",
          desktopImage: "",
          mobileImage: "",
          videoUrl: "",
          mobileVideoUrl: "",
          posterUrl: "",
          mobilePosterUrl: "",
          videoAutoplay: true,
          videoMuted: true,
          videoLoop: true,
          imageAlt: `Visual slide ${num}`,
          focalPoint: "center",
          objectFit: "cover",
          tone: "dark",
          backgroundColor: "#141416",
          ctaLabel: "Explore",
          ctaDestination: "/store",
          visible: true,
          order: num,
        }))
      : undefined;

  const defaultNotes =
    preset.type === "footnotes"
      ? ["1. Add shopping notice or legal disclosure text."]
      : undefined;

  return {
    id: `sec-${preset.type}-${uniqueSuffix}`,
    type: preset.type,
    eyebrow: preset.defaultEyebrow,
    heading: preset.defaultHeading,
    subtitle: preset.defaultSubtitle,
    description: "",
    tone: preset.defaultTone,
    backgroundColor: preset.defaultBg,
    textAlignment:
      preset.type === "product-carousel" ||
      preset.type === "accessories-collection" ||
      preset.type === "footnotes"
        ? "left"
        : "center",
    mediaMode: "image",
    desktopImage: "",
    mobileImage: "",
    videoUrl: "",
    mobileVideoUrl: "",
    posterUrl: "",
    mobilePosterUrl: "",
    videoAutoplay: true,
    videoMuted: true,
    videoLoop: true,
    imageAlt: preset.defaultHeading,
    focalPoint: preset.type === "story-carousel" ? "center" : "bottom",
    objectFit: preset.type === "story-carousel" ? "cover" : "contain",
    tiles: emptyTiles,
    carouselCards: emptyCards,
    promoPanels: emptyPromoPanels,
    footnoteItems: defaultNotes,
    productIds: [],
    buttonLabel: preset.type === "footnotes" ? "" : "Learn more",
    buttonDestination: preset.type === "footnotes" ? "" : "/store",
    visible: true,
    order: nextOrder,
  };
}
