import type {
  ActionLink,
  CustomHomepageSection,
  HeroCampaign,
  HomepageBentoTile,
  HomepageCarouselCard,
  HomepageContent,
  HomepageMediaFit,
  HomepageMediaFocalPoint,
  HomepageMediaMode,
  HomepagePromoPanel,
  HomepageSection,
  HomepageSectionType,
  PromoTile,
  Tone,
} from "./types";

export const SUPPORTED_LOCAL_VIDEO_FORMATS = ["mp4", "webm"] as const;
export const SUPPORTED_VIDEO_ACCEPT = "video/mp4,video/webm,.mp4,.webm";
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

export interface LegacyMediaUnit {
  id?: string;
  internalName?: string;
  deviceName?: string;
  productId?: string;
  learnMoreSlug?: string;
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  description?: string;
  promoText?: string;
  image: string;
  mobileImage?: string;
  mediaMode?: HomepageMediaMode;
  videoUrl?: string;
  mobileVideoUrl?: string;
  posterUrl?: string;
  mobilePosterUrl?: string;
  videoAutoplay?: boolean;
  videoMuted?: boolean;
  videoLoop?: boolean;
  backgroundImage?: string;
  alt: string;
  tone: Tone;
  backgroundColor?: string;
  backgroundGradient?: string;
  mediaFit?: HomepageMediaFit;
  mediaPosition?: HomepageMediaFocalPoint | string;
  mediaBlendMode?: "normal" | "multiply";
  primary?: ActionLink;
  secondary?: ActionLink;
  placement?: "top" | "bottom";
  enabled?: boolean;
}

export function resolveLegacyBackgroundColor(tone?: Tone | null, explicitBg?: string | null): string {
  const cleaned = (explicitBg || "").trim();
  if (cleaned) return cleaned;
  if (tone === "dark") return "#000000";
  if (tone === "mist") return "#e9f5fa";
  return "#ffffff";
}

export function inferLegacyMediaAttributesForUrl(
  imageUrl: string,
  currentContent?: HomepageContent
): Partial<LegacyMediaUnit> | null {
  const lower = (imageUrl || "").trim().toLowerCase();
  if (!lower) return null;

  if (currentContent) {
    const matchHero = (currentContent.heroes || []).find(
      (h) => (h.image || "").trim().toLowerCase() === lower
    );
    if (matchHero) {
      const unit = extractLegacyMediaUnit(matchHero);
      return {
        tone: unit.tone,
        backgroundColor: unit.backgroundColor,
        backgroundGradient: unit.backgroundGradient,
        mediaFit: unit.mediaFit,
        mediaPosition: unit.mediaPosition,
        mediaBlendMode: unit.mediaBlendMode,
        mobileImage: unit.mobileImage,
      };
    }
    const matchTile = (currentContent.tiles || []).find(
      (t) => (t.image || "").trim().toLowerCase() === lower
    );
    if (matchTile) {
      const unit = extractLegacyMediaUnit(matchTile);
      return {
        tone: unit.tone,
        backgroundColor: unit.backgroundColor,
        backgroundGradient: unit.backgroundGradient,
        mediaFit: unit.mediaFit,
        mediaPosition: unit.mediaPosition,
        mediaBlendMode: unit.mediaBlendMode,
        mobileImage: unit.mobileImage,
      };
    }
  }

  if (
    lower.includes("iphone-18-pro") ||
    lower.includes("iphone-18-promax") ||
    lower.includes("watch-series-12") ||
    lower.includes("apple-india") ||
    lower.includes("watch-ultra-4")
  ) {
    return {
      tone: "dark",
      backgroundColor: "#000000",
      mediaBlendMode: "normal",
    };
  }

  if (lower.includes("macbook-air")) {
    return {
      tone: "mist",
      backgroundColor: "#e9f5fa",
      mediaBlendMode: "multiply",
    };
  }

  if (
    lower.includes("iphone-duo") ||
    lower.includes("airpods-pro-3") ||
    lower.includes("ipad-air") ||
    lower.includes("visa-card") ||
    lower.includes("mac-mini")
  ) {
    return {
      tone: "light",
      backgroundColor: "#ffffff",
      mediaBlendMode: "normal",
    };
  }

  return null;
}

export function extractLegacyMediaUnit(
  slot: Partial<HeroCampaign | PromoTile | CustomHomepageSection>
): LegacyMediaUnit {
  const tone: Tone = slot.tone || "light";
  const backgroundColor = resolveLegacyBackgroundColor(tone, slot.backgroundColor);
  return {
    id: slot.id,
    internalName: slot.internalName,
    deviceName: slot.deviceName ?? slot.title,
    productId: slot.productId,
    learnMoreSlug: slot.learnMoreSlug,
    eyebrow: slot.eyebrow,
    title: slot.title,
    subtitle: slot.subtitle,
    description: slot.description,
    promoText: slot.promoText,
    image: slot.image || "",
    mobileImage: slot.mobileImage,
    mediaMode: slot.mediaMode || (slot.videoUrl ? "video" : "image"),
    videoUrl: slot.videoUrl,
    mobileVideoUrl: slot.mobileVideoUrl,
    posterUrl: slot.posterUrl,
    mobilePosterUrl: slot.mobilePosterUrl,
    videoAutoplay: slot.videoAutoplay,
    videoMuted: slot.videoMuted,
    videoLoop: slot.videoLoop,
    backgroundImage: slot.backgroundImage,
    alt: slot.alt || "",
    tone,
    backgroundColor,
    backgroundGradient: slot.backgroundGradient,
    mediaFit: slot.mediaFit || "contain",
    mediaPosition: slot.mediaPosition || "bottom",
    mediaBlendMode:
      tone === "dark" ? "normal" : slot.mediaBlendMode || "normal",
    primary: slot.primary ? { ...slot.primary } : undefined,
    secondary: slot.secondary ? { ...slot.secondary } : undefined,
    placement: "top",
    enabled: slot.enabled,
  };
}

export function applyLegacyMediaUnit<
  T extends HeroCampaign | PromoTile | CustomHomepageSection
>(slot: T, unit: LegacyMediaUnit): T {
  const tone: Tone = unit.tone || slot.tone || "light";
  const nextTitle = unit.title !== undefined ? unit.title : slot.title;
  const nextDeviceName =
    unit.deviceName !== undefined ? unit.deviceName : nextTitle;
  return {
    ...slot,
    id: unit.id || slot.id,
    internalName:
      unit.internalName !== undefined ? unit.internalName : slot.internalName,
    deviceName: nextDeviceName,
    productId: unit.productId,
    learnMoreSlug: unit.learnMoreSlug,
    eyebrow: unit.eyebrow,
    title: nextTitle,
    subtitle: unit.subtitle !== undefined ? unit.subtitle : slot.subtitle,
    description: unit.description,
    promoText: unit.promoText,
    image: unit.image,
    mobileImage: unit.mobileImage,
    mediaMode: unit.mediaMode || "image",
    videoUrl: unit.videoUrl,
    mobileVideoUrl: unit.mobileVideoUrl,
    posterUrl: unit.posterUrl,
    mobilePosterUrl: unit.mobilePosterUrl,
    videoAutoplay: unit.videoAutoplay,
    videoMuted: unit.videoMuted,
    videoLoop: unit.videoLoop,
    backgroundImage: unit.backgroundImage,
    alt: unit.alt || slot.alt,
    tone,
    backgroundColor: resolveLegacyBackgroundColor(tone, unit.backgroundColor),
    backgroundGradient: unit.backgroundGradient,
    mediaFit: unit.mediaFit || "contain",
    mediaPosition: unit.mediaPosition || "bottom",
    mediaBlendMode:
      tone === "dark" ? "normal" : unit.mediaBlendMode || "normal",
    primary: unit.primary ? { ...unit.primary } : slot.primary,
    secondary: unit.secondary ? { ...unit.secondary } : undefined,
    placement: "top",
    enabled: unit.enabled !== undefined ? unit.enabled : slot.enabled,
    order: slot.order,
  };
}

export interface LegacyMediaSlotRef {
  kind: "hero" | "tile" | "customSection";
  index: number;
}

/**
 * Atomically swaps two complete campaigns (including device/product name, headline,
 * subtitle, description, CTAs, desktop/mobile images, video settings, background
 * colour/gradient, tone, media fit/position/blend mode) between any two Hero,
 * Promotional Tile, or Custom Section slots while preserving each destination
 * slot's responsive layout container and position order.
 */
export function swapLegacyMediaUnits(
  content: HomepageContent,
  from: LegacyMediaSlotRef,
  to: LegacyMediaSlotRef
): HomepageContent {
  if (from.kind === to.kind && from.index === to.index) {
    return content;
  }

  const heroes = [...(content.heroes || [])];
  const tiles = [...(content.tiles || [])];
  const customSections = [...(content.customSections || [])];

  const getSlot = (
    ref: LegacyMediaSlotRef
  ): HeroCampaign | PromoTile | CustomHomepageSection | undefined => {
    if (ref.kind === "hero") return heroes[ref.index];
    if (ref.kind === "tile") return tiles[ref.index];
    return customSections[ref.index];
  };

  const sourceSlot = getSlot(from);
  const destSlot = getSlot(to);
  if (!sourceSlot || !destSlot) {
    return content;
  }

  const unitFrom = extractLegacyMediaUnit(sourceSlot);
  const unitTo = extractLegacyMediaUnit(destSlot);

  if (from.kind === "hero") {
    heroes[from.index] = applyLegacyMediaUnit(heroes[from.index], unitTo);
  } else if (from.kind === "tile") {
    tiles[from.index] = applyLegacyMediaUnit(tiles[from.index], unitTo);
  } else {
    customSections[from.index] = applyLegacyMediaUnit(
      customSections[from.index],
      unitTo
    );
  }

  if (to.kind === "hero") {
    heroes[to.index] = applyLegacyMediaUnit(heroes[to.index], unitFrom);
  } else if (to.kind === "tile") {
    tiles[to.index] = applyLegacyMediaUnit(tiles[to.index], unitFrom);
  } else {
    customSections[to.index] = applyLegacyMediaUnit(
      customSections[to.index],
      unitFrom
    );
  }

  return {
    ...content,
    heroes,
    tiles,
    customSections,
  };
}

export const swapLegacyCampaigns = swapLegacyMediaUnits;

export interface CatalogProductLike {
  id: string;
  slug: string;
  name: string;
  category?: string;
  subcategory?: string;
  generation?: string;
  shortDescription?: string;
  description?: string;
  images?: Array<{ src: string; alt?: string }>;
  primaryImageIndex?: number;
}

function resolveProductFamilyKey(product: CatalogProductLike): string {
  const cat = `${product.category || ""} ${product.subcategory || ""} ${product.slug || ""}`.toLowerCase();
  if (cat.includes("iphone") || cat.includes("phone")) return "iphone";
  if (cat.includes("mac") || cat.includes("macbook") || cat.includes("imac")) return "mac";
  if (cat.includes("ipad")) return "ipad";
  if (cat.includes("watch")) return "watch";
  if (cat.includes("airpod")) return "airpods";
  return "accessories";
}

export function slugifyCampaignIdentifier(text: string): string {
  return (text || "")
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function deriveCampaignLearnMoreSlug(
  slot: Partial<HeroCampaign | PromoTile | CustomHomepageSection>
): string {
  if (slot.learnMoreSlug?.trim()) {
    return slugifyCampaignIdentifier(slot.learnMoreSlug.trim());
  }
  const checkRoute = (to?: string): string | null => {
    const clean = (to || "").trim().split("?")[0];
    if (!clean) return null;
    if (clean === "/mac-mini") return "mac-mini";
    if (clean === "/mac-studio") return "mac-studio";
    const match = clean.match(
      /^\/(?:iphone|mac|ipad|watch|airpods|accessories|learn-more|campaigns)\/([a-z0-9-]+)$/i
    );
    return match ? match[1].toLowerCase() : null;
  };
  const fromPrimary = checkRoute(slot.primary?.to);
  if (fromPrimary) return fromPrimary;
  const fromSecondary = checkRoute(slot.secondary?.to);
  if (fromSecondary) return fromSecondary;
  if (slot.productId?.trim()) {
    return slugifyCampaignIdentifier(slot.productId.trim());
  }
  const candidate =
    slot.deviceName?.trim() ||
    slot.title?.trim() ||
    slot.internalName?.trim() ||
    slot.id?.trim() ||
    "campaign";
  return slugifyCampaignIdentifier(candidate) || "campaign";
}

export function deriveCampaignLearnMorePath(
  slot: Partial<HeroCampaign | PromoTile | CustomHomepageSection>
): string {
  const slug = deriveCampaignLearnMoreSlug(slot);
  if (slug === "mac-mini") return "/mac-mini";
  if (slug === "mac-studio") return "/mac-studio";
  const text = `${slug} ${slot.deviceName || ""} ${slot.title || ""}`.toLowerCase();
  if (text.includes("iphone")) return `/iphone/${slug}`;
  if (text.includes("macbook") || text.includes("imac") || text.includes("mac-")) return `/mac/${slug}`;
  if (text.includes("ipad")) return `/ipad/${slug}`;
  if (text.includes("watch")) return `/watch/${slug}`;
  if (text.includes("airpod")) return `/airpods/${slug}`;
  return `/learn-more/${slug}`;
}

/**
 * Updates a homepage campaign or custom section to display a selected catalogue product
 * without mutating, overwriting, or deleting the underlying product in the catalogue.
 */
export function applyProductToCampaign<
  T extends HeroCampaign | PromoTile | CustomHomepageSection
>(slot: T, product: CatalogProductLike, resolvedImageUrl?: string): T {
  const family = resolveProductFamilyKey(product);
  const primaryIdx = product.primaryImageIndex ?? 0;
  const fallbackImg =
    product.images?.[primaryIdx]?.src || product.images?.[0]?.src || "";
  const chosenImage = (resolvedImageUrl || fallbackImg || slot.image || "").trim();
  const inferredBg = inferLegacyMediaAttributesForUrl(chosenImage);

  const learnMorePath =
    product.slug === "mac-mini"
      ? "/mac-mini"
      : product.slug === "mac-studio"
      ? "/mac-studio"
      : `/${family}/${product.slug}`;
  const buyPath = `/shop/buy-${family}/${product.slug}`;

  return {
    ...slot,
    productId: product.id || product.slug,
    learnMoreSlug: product.slug,
    internalName: product.name,
    deviceName: product.name,
    title: product.name,
    eyebrow: product.generation || product.subcategory || "",
    subtitle: product.shortDescription || "Available at Buy & Sell GH.",
    description: "",
    promoText: "",
    image: chosenImage,
    mobileImage: undefined,
    mediaMode: "image",
    videoUrl: undefined,
    mobileVideoUrl: undefined,
    posterUrl: undefined,
    mobilePosterUrl: undefined,
    alt: product.name,
    placement: "top",
    ...(inferredBg
      ? {
          tone: inferredBg.tone || slot.tone,
          backgroundColor: inferredBg.backgroundColor || slot.backgroundColor,
          mediaBlendMode: inferredBg.mediaBlendMode || slot.mediaBlendMode,
        }
      : {}),
    primary: {
      label: "Learn more",
      to: learnMorePath,
    },
    secondary: {
      label: "Buy",
      to: buyPath,
    },
  };
}

export interface HomepageSectionLayoutPreset {
  variant: CustomHomepageSection["layoutVariant"];
  label: string;
  shortTag: string;
  description: string;
  defaultMediaMode: "image" | "video";
  defaultTone: Tone;
  defaults: Partial<CustomHomepageSection>;
}

export const HOMEPAGE_SECTION_LAYOUT_PRESETS: HomepageSectionLayoutPreset[] = [
  {
    variant: "full-hero",
    label: "Full-width Campaign Hero",
    shortTag: "Full Hero",
    description: "Commanding edge-to-edge headline, subtitle, CTA buttons, and centerpiece media.",
    defaultMediaMode: "image",
    defaultTone: "dark",
    defaults: {
      internalName: "Full-Width Campaign Hero",
      eyebrow: "FEATURED LAUNCH",
      title: "New Campaign Hero",
      subtitle: "Built to stand out on the storefront.",
      tone: "dark",
      backgroundColor: "#000000",
      mediaFit: "contain",
      mediaPosition: "bottom",
      primary: { label: "Learn more", to: "/store" },
      secondary: { label: "Buy", to: "/store" },
    },
  },
  {
    variant: "product-showcase",
    label: "Product Showcase",
    shortTag: "Product Stage",
    description: "Clean product-first framing with eyebrow badge, specs note, and Shop / Learn More CTAs.",
    defaultMediaMode: "image",
    defaultTone: "light",
    defaults: {
      internalName: "Product Showcase",
      eyebrow: "FEATURED HARDWARE",
      title: "Featured Apple Device",
      subtitle: "Original hardware backed by official Buy & Sell GH warranty.",
      tone: "light",
      backgroundColor: "#f5f5f7",
      mediaFit: "contain",
      mediaPosition: "bottom",
      primary: { label: "Shop Now", to: "/store" },
      secondary: { label: "Learn more", to: "/learn-more/featured-apple-device" },
    },
  },
  {
    variant: "split-left",
    label: "Image Left, Text Right",
    shortTag: "Split Left",
    description: "Asymmetric two-column showcase placing product visual on the left and copy on the right.",
    defaultMediaMode: "image",
    defaultTone: "light",
    defaults: {
      internalName: "Split Left Showcase",
      eyebrow: "SPOTLIGHT",
      title: "Designed Around You",
      subtitle: "Crafted for power, portability, and everyday reliability.",
      tone: "light",
      backgroundColor: "#ffffff",
      mediaFit: "contain",
      mediaPosition: "center",
      primary: { label: "Shop Now", to: "/store" },
      secondary: { label: "Learn more", to: "/learn-more/designed-around-you" },
    },
  },
  {
    variant: "split-right",
    label: "Text Left, Image Right",
    shortTag: "Split Right",
    description: "Editorial story copy on the left balanced with large product photography on the right.",
    defaultMediaMode: "image",
    defaultTone: "light",
    defaults: {
      internalName: "Split Right Showcase",
      eyebrow: "EDITORIAL FEATURE",
      title: "Engineered in Every Detail",
      subtitle: "Compare models and find your ideal configuration.",
      tone: "light",
      backgroundColor: "#f5f5f7",
      mediaFit: "contain",
      mediaPosition: "center",
      primary: { label: "Buy", to: "/store" },
      secondary: { label: "Learn more", to: "/learn-more/engineered-detail" },
    },
  },
  {
    variant: "gift-showcase",
    label: "Gift-shopping Showcase",
    shortTag: "Gift Showcase",
    description: "Celebratory gift campaign canvas with headline, tagline, curated artwork/video, and Shop Gifts CTA.",
    defaultMediaMode: "image",
    defaultTone: "light",
    defaults: {
      internalName: "Holiday Gift Campaign",
      deviceName: "Gifts They'll Love",
      learnMoreSlug: "gifts-theyll-love",
      eyebrow: "BUY & SELL GH GIFT GUIDE",
      title: "Gifts They'll Love",
      subtitle: "Find their perfect match this holiday.",
      description:
        "Original iPhones, Apple Watch, iPad, Mac, and AirPods — wrapped with official Buy & Sell GH warranty.",
      tone: "light",
      backgroundColor: "#ffffff",
      mediaFit: "contain",
      mediaPosition: "bottom",
      primary: { label: "Shop Gifts", to: "/store" },
      secondary: { label: "Learn more", to: "/learn-more/gifts-theyll-love" },
    },
  },
  {
    variant: "promo-banner",
    label: "Promotional Banner",
    shortTag: "Promo Banner",
    description: "Compact promotional ribbon for seasonal offers, trade-in deals, or installment announcements.",
    defaultMediaMode: "image",
    defaultTone: "mist",
    defaults: {
      internalName: "Promotional Banner",
      eyebrow: "SPECIAL OFFER",
      title: "Flexible Upgrades in Accra",
      subtitle: "Trade in your current device or split payments seamlessly.",
      tone: "mist",
      backgroundColor: "#e9f5fa",
      mediaFit: "contain",
      mediaPosition: "center",
      primary: { label: "Shop Now", to: "/store" },
      secondary: { label: "Learn more", to: "/trade-in" },
    },
  },
  {
    variant: "gallery",
    label: "Image Gallery",
    shortTag: "Gallery",
    description: "Multi-image storefront showcase displaying up to multiple product angles or lifestyle stills side by side.",
    defaultMediaMode: "image",
    defaultTone: "light",
    defaults: {
      internalName: "Visual Gallery Section",
      eyebrow: "GALLERY",
      title: "Closer Look",
      subtitle: "Explore finishes, accessories, and curated bundles.",
      tone: "light",
      backgroundColor: "#ffffff",
      mediaFit: "cover",
      mediaPosition: "center",
      galleryImages: [],
      primary: { label: "Shop Collection", to: "/store" },
      secondary: { label: "Learn more", to: "/learn-more/closer-look" },
    },
  },
  {
    variant: "video-showcase",
    label: "Video Showcase",
    shortTag: "Video Film",
    description: "Theatrical autoplaying MP4/WebM product film canvas with poster fallback and overlay controls.",
    defaultMediaMode: "video",
    defaultTone: "dark",
    defaults: {
      internalName: "Video Showcase",
      eyebrow: "PRODUCT FILM",
      title: "See It in Motion",
      subtitle: "Cinema-grade campaign presentation on desktop and mobile.",
      tone: "dark",
      backgroundColor: "#000000",
      mediaMode: "video",
      mediaFit: "contain",
      mediaPosition: "bottom",
      primary: { label: "Shop Now", to: "/store" },
      secondary: { label: "Learn more", to: "/learn-more/product-film" },
    },
  },
  {
    variant: "editorial",
    label: "Custom Editorial Section",
    shortTag: "Editorial",
    description: "Generous story-driven section combining extended editorial narrative, imagery, and multiple CTAs.",
    defaultMediaMode: "image",
    defaultTone: "light",
    defaults: {
      internalName: "Custom Editorial Section",
      eyebrow: "EDITORIAL",
      title: "Curated by Buy & Sell GH",
      subtitle: "Verified hardware, transparent advice, and dedicated support.",
      description:
        "Every device passes our multi-point inspection with official coverage across Accra.",
      tone: "light",
      backgroundColor: "#f5f5f7",
      containerWidth: "contained",
      mediaFit: "contain",
      mediaPosition: "center",
      primary: { label: "Shop Now", to: "/store" },
      secondary: { label: "Learn more", to: "/learn-more/curated-story" },
    },
  },
];

export function createDefaultCustomHomepageSection(
  order: number,
  overrides?: Partial<CustomHomepageSection>
): CustomHomepageSection {
  const variant = overrides?.layoutVariant || "full-hero";
  const preset =
    HOMEPAGE_SECTION_LAYOUT_PRESETS.find((p) => p.variant === variant) ||
    HOMEPAGE_SECTION_LAYOUT_PRESETS[0];
  const merged = { ...preset.defaults, ...overrides };
  const id = merged.id || `custom-section-${Date.now()}-${order}`;
  const tone: Tone = merged.tone || preset.defaultTone || "light";
  const backgroundColor = resolveLegacyBackgroundColor(tone, merged.backgroundColor);
  const title = merged.title || "Featured Campaign";
  const deviceName = merged.deviceName || title;
  const learnMoreSlug =
    merged.learnMoreSlug || slugifyCampaignIdentifier(deviceName || title) || `campaign-${order}`;
  return {
    id,
    internalName: merged.internalName || `Section ${order} — ${title}`,
    deviceName,
    productId: merged.productId,
    learnMoreSlug,
    eyebrow: merged.eyebrow || "BUY & SELL GH FEATURED",
    title,
    subtitle: merged.subtitle || "",
    description: merged.description || "",
    promoText: merged.promoText || "",
    image: merged.image || "/products/homepage/iphone-duo.webp",
    mobileImage: merged.mobileImage,
    mediaMode: merged.mediaMode || preset.defaultMediaMode || "image",
    videoUrl: merged.videoUrl,
    mobileVideoUrl: merged.mobileVideoUrl,
    posterUrl: merged.posterUrl,
    mobilePosterUrl: merged.mobilePosterUrl,
    videoAutoplay: merged.videoAutoplay ?? true,
    videoMuted: merged.videoMuted ?? true,
    videoLoop: merged.videoLoop ?? true,
    backgroundImage: merged.backgroundImage,
    alt: merged.alt || title || "Featured homepage section",
    tone,
    backgroundColor,
    backgroundGradient: merged.backgroundGradient,
    mediaFit: merged.mediaFit || "contain",
    mediaPosition: merged.mediaPosition || "bottom",
    mediaBlendMode:
      tone === "dark" ? "normal" : merged.mediaBlendMode || "normal",
    layoutVariant: variant,
    mobileLayout: merged.mobileLayout || "stack",
    containerWidth: merged.containerWidth || "full",
    sectionPlacement: merged.sectionPlacement || "after-heroes",
    minHeightDesktop: merged.minHeightDesktop,
    minHeightMobile: merged.minHeightMobile,
    galleryImages: merged.galleryImages ? [...merged.galleryImages] : [],
    primary: merged.primary || { label: "Shop Now", to: "/store" },
    secondary: merged.secondary || {
      label: "Learn more",
      to: `/learn-more/${learnMoreSlug}`,
    },
    extraActions: merged.extraActions ? [...merged.extraActions] : [],
    placement: "top",
    enabled: merged.enabled ?? true,
    order,
  };
}

export interface HomepagePublishChangeSummary {
  heroCount: number;
  changedHeroes: number;
  tileCount: number;
  changedTiles: number;
  customSectionCount: number;
  changedCustomSections: number;
  flyerCount: number;
  changedFlyers: number;
  announcementChanged: boolean;
  pendingLocalMediaCount: number;
  summaryLines: string[];
}

export function summarizeLegacyHomepageChanges(
  live: HomepageContent,
  candidate: HomepageContent,
  pendingLocalMediaCount: number
): HomepagePublishChangeSummary {
  const liveHeroes = live.heroes || [];
  const nextHeroes = candidate.heroes || [];
  const liveTiles = live.tiles || [];
  const nextTiles = candidate.tiles || [];
  const liveCustom = live.customSections || [];
  const nextCustom = candidate.customSections || [];
  const liveFlyers = live.serviceFlyers || [];
  const nextFlyers = candidate.serviceFlyers || [];

  const countDiffs = <T,>(a: T[], b: T[]): number => {
    const maxLen = Math.max(a.length, b.length);
    let diffs = 0;
    for (let i = 0; i < maxLen; i += 1) {
      if (JSON.stringify(a[i] || null) !== JSON.stringify(b[i] || null)) {
        diffs += 1;
      }
    }
    return diffs;
  };

  const changedHeroes = countDiffs(liveHeroes, nextHeroes);
  const changedTiles = countDiffs(liveTiles, nextTiles);
  const changedCustomSections = countDiffs(liveCustom, nextCustom);
  const changedFlyers = countDiffs(liveFlyers, nextFlyers);
  const announcementChanged =
    JSON.stringify(live.announcement || null) !== JSON.stringify(candidate.announcement || null);

  const summaryLines: string[] = [];
  if (changedHeroes > 0) {
    summaryLines.push(`${changedHeroes} Hero slide slot(s) updated or reordered`);
  }
  if (changedTiles > 0) {
    summaryLines.push(`${changedTiles} Promotional tile slot(s) updated or reordered`);
  }
  if (changedCustomSections > 0) {
    summaryLines.push(`${changedCustomSections} Custom homepage section(s) added or updated`);
  }
  if (changedFlyers > 0) {
    summaryLines.push(`${changedFlyers} Service flyer slot(s) updated or reordered`);
  }
  if (announcementChanged) {
    summaryLines.push("Announcement banner updated");
  }
  if (pendingLocalMediaCount > 0) {
    summaryLines.push(
      `${pendingLocalMediaCount} staged local media file(s) will be uploaded to Supabase Storage`
    );
  }
  if (summaryLines.length === 0) {
    summaryLines.push("Confirm re-publishing current homepage configuration to live website");
  }

  return {
    heroCount: nextHeroes.length,
    changedHeroes,
    tileCount: nextTiles.length,
    changedTiles,
    customSectionCount: nextCustom.length,
    changedCustomSections,
    flyerCount: nextFlyers.length,
    changedFlyers,
    announcementChanged,
    pendingLocalMediaCount,
    summaryLines,
  };
}
