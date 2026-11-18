import { getSupabaseOrThrow, productImagesBucket, supabase } from "../lib/supabase";
import { assertAdminAal2, isLocalAdminActive } from "../admin/adminAuthorization";
import { CATEGORY_DEPARTMENTS } from "../components/store/category/categoryData";
import { broadcastPublishedUpdate } from "../utils/imageVersioning";
import { inferLegacyMediaAttributesForUrl } from "./homepageBuilderUtils";
import {
  getLocalStagedMediaRecord,
  isLocalMediaUri,
  validateLocalMediaFile,
  type LocalMediaKind,
  type LocalStagedMediaRecord,
} from "./localMediaStore";
import {
  defaultFaqs,
  defaultHomepageBentoTiles,
  defaultHomepageCarouselCards,
  defaultHomepageContent,
  defaultHomepageFootnotes,
  defaultHomepagePromoPanels,
  defaultHomepageSections,
  defaultMainStoreConfig,
  defaultMediaItems,
  defaultPageContent,
  defaultSiteSettings,
  defaultStorePageSections,
} from "./defaultCmsData";
import type {
  CategoryDepartmentConfig,
  FaqItem,
  HomepageBentoTile,
  HomepageCarouselCard,
  HomepageContent,
  HomepageLayoutMode,
  HomepagePromoPanel,
  HomepageSection,
  MainStoreConfig,
  MediaItem,
  PageContentRegistry,
  SiteSettings,
  StorePageSection,
} from "./types";

const CMS_STORAGE_KEY_SETTINGS = "buyandsell_cms_settings_v1";
const CMS_STORAGE_KEY_HOMEPAGE = "buyandsell_cms_homepage_v1";
export const CMS_STORAGE_KEY_HOMEPAGE_DRAFT = "buyandsell_cms_homepage_draft_v1";
export const CMS_STORAGE_KEY_HOMEPAGE_LEGACY_DRAFT = "buyandsell_cms_homepage_legacy_draft_v1";
const CMS_STORAGE_KEY_HOMEPAGE_VERIFIED = "buyandsell_cms_homepage_verified_v1";
const CMS_STORAGE_KEY_MEDIA = "buyandsell_cms_media_v1";
const CMS_STORAGE_KEY_FAQS = "buyandsell_cms_faqs_v1";
const CMS_STORAGE_KEY_PAGES = "buyandsell_cms_pages_v1";
const CMS_STORAGE_KEY_STOREFRONT = "buyandsell_cms_storefront_v1";
const CMS_STORAGE_KEY_MAIN_STORE = "buyandsell_cms_main_store_v1";
const CMS_STORAGE_KEY_MAIN_STORE_DRAFT = "buyandsell_cms_main_store_draft_v1";
const CMS_STORAGE_KEY_MAIN_STORE_LOCAL_PUB = "buyandsell_cms_main_store_local_pub_v1";

// Cache listeners for reactive UI across tabs and components
type CmsListener = () => void;
const listeners: Set<CmsListener> = new Set();
export const subscribeToCms = (listener: CmsListener) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};
const notifyListeners = () => {
  listeners.forEach((fn) => {
    try {
      fn();
    } catch {
      // ignore
    }
  });
};

// Safe LocalStorage helpers (used as client cache only, never authoritative over Supabase)
const readLocal = <T>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
};

const writeLocal = <T>(key: string, data: T) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {
    // ignore
  }
};

const sanitizeSiteSettings = (settings: SiteSettings): SiteSettings => {
  const oldPhoneDigits = "0244182149";
  const oldWaDigits = "233244182149";
  const newPhone = "055 197 5451";
  const newWa = "233551975451";

  const rawPhones = Array.isArray(settings.phones) ? settings.phones : [];
  const phones = rawPhones
    .map((p) => (p.replace(/\s+/g, "") === oldPhoneDigits ? newPhone : p))
    .filter((p, i, arr) => arr.indexOf(p) === i);
  if (phones.length === 0) phones.push(newPhone);

  const primary = (settings.whatsapp?.primary || "").replace(/\s+/g, "").replace(/^\+/, "");
  const secondary = (settings.whatsapp?.secondary || "").replace(/\s+/g, "").replace(/^\+/, "");

  return {
    ...settings,
    phones,
    whatsapp: {
      primary: primary === oldWaDigits || !primary ? newWa : primary,
      secondary: secondary === oldWaDigits || !secondary ? newWa : secondary,
    },
  };
};

// 1. SITE SETTINGS
export const getInitialSiteSettings = (): SiteSettings =>
  sanitizeSiteSettings(readLocal<SiteSettings>(CMS_STORAGE_KEY_SETTINGS, defaultSiteSettings));

export const fetchSiteSettings = async (): Promise<SiteSettings> => {
  const local = getInitialSiteSettings();
  if (!supabase) return local;

  try {
    const { data, error } = await supabase
      .from("site_settings")
      .select("settings")
      .eq("id", "global")
      .maybeSingle();

    if (!error && data?.settings) {
      const merged = sanitizeSiteSettings({ ...defaultSiteSettings, ...(data.settings as Partial<SiteSettings>) });
      writeLocal(CMS_STORAGE_KEY_SETTINGS, merged);
      return merged;
    }
  } catch {
    // Non-blocking fallback to default/local cache
  }

  return local;
};

export const saveSiteSettings = async (settings: Partial<SiteSettings>): Promise<SiteSettings> => {
  await assertAdminAal2();
  const client = getSupabaseOrThrow();
  const current = await fetchSiteSettings();
  const updated: SiteSettings = {
    ...current,
    ...settings,
    whatsapp: {
      ...current.whatsapp,
      ...(settings.whatsapp ?? {}),
    },
    social: {
      ...current.social,
      ...(settings.social ?? {}),
    },
  };

  const { error } = await client.from("site_settings").upsert({
    id: "global",
    settings: updated,
    updated_at: new Date().toISOString(),
  });

  if (error) {
    throw new Error(
      `Failed to save site settings to Supabase (${error.message}, code: ${error.code || "ERR"}). Ensure migration 016 has been run in Supabase SQL Editor.`
    );
  }

  // Only update client cache after authoritative Supabase write succeeds
  writeLocal(CMS_STORAGE_KEY_SETTINGS, updated);
  broadcastPublishedUpdate("homepage");
  notifyListeners();
  return updated;
};

// 2. HOMEPAGE CONTENT
const APPROVED_IPHONE_18_PRO_DESKTOP_HERO = "/products/homepage/iphone-18-pro-hero-2x.webp";
const APPROVED_IPHONE_18_PRO_MOBILE_HERO = "/products/homepage/iphone-18-pro-hero-mobile.jpg";

const normalizeHomepageBentoTile = (
  tile: Partial<HomepageBentoTile>,
  idx: number
): HomepageBentoTile => {
  const def = defaultHomepageBentoTiles.find((d) => d.id === tile.id) || defaultHomepageBentoTiles[idx];
  return {
    id: tile.id || def?.id || `promo-tile-${idx + 1}`,
    eyebrow: tile.eyebrow !== undefined ? tile.eyebrow : (def?.eyebrow || ""),
    title: tile.title !== undefined ? tile.title : (def?.title || `Campaign Tile ${idx + 1}`),
    subtitle: tile.subtitle !== undefined ? tile.subtitle : (def?.subtitle || ""),
    description: tile.description !== undefined ? tile.description : (def?.description || ""),
    tone: tile.tone || def?.tone || "light",
    backgroundColor: tile.backgroundColor || def?.backgroundColor || (tile.tone === "dark" ? "#000000" : "#f5f5f7"),
    mediaMode: tile.mediaMode || def?.mediaMode,
    desktopImage: tile.desktopImage !== undefined ? tile.desktopImage : (def?.desktopImage ?? ""),
    mobileImage: tile.mobileImage !== undefined ? tile.mobileImage : (def?.mobileImage ?? ""),
    videoUrl: tile.videoUrl !== undefined ? tile.videoUrl : (def?.videoUrl ?? ""),
    mobileVideoUrl: tile.mobileVideoUrl !== undefined ? tile.mobileVideoUrl : (def?.mobileVideoUrl ?? ""),
    posterUrl: tile.posterUrl !== undefined ? tile.posterUrl : (def?.posterUrl ?? ""),
    mobilePosterUrl: tile.mobilePosterUrl !== undefined ? tile.mobilePosterUrl : (def?.mobilePosterUrl ?? ""),
    videoAutoplay: tile.videoAutoplay !== undefined ? tile.videoAutoplay : def?.videoAutoplay,
    videoMuted: tile.videoMuted !== undefined ? tile.videoMuted : def?.videoMuted,
    videoLoop: tile.videoLoop !== undefined ? tile.videoLoop : def?.videoLoop,
    imageAlt: tile.imageAlt !== undefined ? tile.imageAlt : (def?.imageAlt || tile.title || "Campaign tile image"),
    focalPoint: tile.focalPoint || def?.focalPoint || "bottom",
    objectFit: tile.objectFit || def?.objectFit || "contain",
    caption: tile.caption !== undefined ? tile.caption : (def?.caption || ""),
    copyPlacement: tile.copyPlacement || def?.copyPlacement || "top",
    primaryLabel: tile.primaryLabel !== undefined ? tile.primaryLabel : (def?.primaryLabel || "Learn more"),
    primaryDestination: tile.primaryDestination !== undefined ? tile.primaryDestination : (def?.primaryDestination || "/store"),
    secondaryLabel: tile.secondaryLabel !== undefined ? tile.secondaryLabel : (def?.secondaryLabel || ""),
    secondaryDestination: tile.secondaryDestination !== undefined ? tile.secondaryDestination : (def?.secondaryDestination || ""),
    productIds: Array.isArray(tile.productIds) ? tile.productIds : (def?.productIds || []),
    visible: tile.visible !== false,
    order: typeof tile.order === "number" ? tile.order : idx + 1,
  };
};

const normalizeHomepageCarouselCard = (
  card: Partial<HomepageCarouselCard>,
  idx: number
): HomepageCarouselCard => {
  const def = defaultHomepageCarouselCards.find((d) => d.id === card.id) || defaultHomepageCarouselCards[idx];
  return {
    id: card.id || def?.id || `story-card-${idx + 1}`,
    categoryLabel: card.categoryLabel !== undefined ? card.categoryLabel : (def?.categoryLabel || "Spotlight"),
    title: card.title !== undefined ? card.title : (def?.title || `Story Card ${idx + 1}`),
    caption: card.caption !== undefined ? card.caption : (def?.caption || ""),
    mediaMode: card.mediaMode || def?.mediaMode,
    desktopImage: card.desktopImage !== undefined ? card.desktopImage : (def?.desktopImage ?? ""),
    mobileImage: card.mobileImage !== undefined ? card.mobileImage : (def?.mobileImage ?? ""),
    videoUrl: card.videoUrl !== undefined ? card.videoUrl : (def?.videoUrl ?? ""),
    mobileVideoUrl: card.mobileVideoUrl !== undefined ? card.mobileVideoUrl : (def?.mobileVideoUrl ?? ""),
    posterUrl: card.posterUrl !== undefined ? card.posterUrl : (def?.posterUrl ?? ""),
    mobilePosterUrl: card.mobilePosterUrl !== undefined ? card.mobilePosterUrl : (def?.mobilePosterUrl ?? ""),
    videoAutoplay: card.videoAutoplay !== undefined ? card.videoAutoplay : def?.videoAutoplay,
    videoMuted: card.videoMuted !== undefined ? card.videoMuted : def?.videoMuted,
    videoLoop: card.videoLoop !== undefined ? card.videoLoop : def?.videoLoop,
    imageAlt: card.imageAlt !== undefined ? card.imageAlt : (def?.imageAlt || card.title || "Storytelling card image"),
    focalPoint: card.focalPoint || def?.focalPoint || "center",
    objectFit: card.objectFit || def?.objectFit || "cover",
    tone: card.tone || def?.tone || "dark",
    backgroundColor: card.backgroundColor || def?.backgroundColor || "#000000",
    ctaLabel: card.ctaLabel !== undefined ? card.ctaLabel : (def?.ctaLabel || "Explore"),
    ctaDestination: card.ctaDestination !== undefined ? card.ctaDestination : (def?.ctaDestination || "/store"),
    visible: card.visible !== false,
    order: typeof card.order === "number" ? card.order : idx + 1,
  };
};

const normalizeHomepagePromoPanel = (
  panel: Partial<HomepagePromoPanel>,
  idx: number
): HomepagePromoPanel => {
  const def = defaultHomepagePromoPanels.find((d) => d.id === panel.id) || defaultHomepagePromoPanels[idx];
  return {
    id: panel.id || def?.id || `promo-panel-${idx + 1}`,
    label: panel.label !== undefined ? panel.label : (def?.label || `Campaign Panel ${idx + 1}`),
    mediaMode: panel.mediaMode || def?.mediaMode,
    desktopImage: panel.desktopImage !== undefined ? panel.desktopImage : (def?.desktopImage ?? ""),
    mobileImage: panel.mobileImage !== undefined ? panel.mobileImage : (def?.mobileImage ?? ""),
    videoUrl: panel.videoUrl !== undefined ? panel.videoUrl : (def?.videoUrl ?? ""),
    mobileVideoUrl: panel.mobileVideoUrl !== undefined ? panel.mobileVideoUrl : (def?.mobileVideoUrl ?? ""),
    posterUrl: panel.posterUrl !== undefined ? panel.posterUrl : (def?.posterUrl ?? ""),
    mobilePosterUrl: panel.mobilePosterUrl !== undefined ? panel.mobilePosterUrl : (def?.mobilePosterUrl ?? ""),
    videoAutoplay: panel.videoAutoplay !== undefined ? panel.videoAutoplay : def?.videoAutoplay,
    videoMuted: panel.videoMuted !== undefined ? panel.videoMuted : def?.videoMuted,
    videoLoop: panel.videoLoop !== undefined ? panel.videoLoop : def?.videoLoop,
    imageAlt: panel.imageAlt !== undefined ? panel.imageAlt : (def?.imageAlt || panel.label || "Campaign panel visual"),
    focalPoint: panel.focalPoint || def?.focalPoint || "bottom",
    objectFit: panel.objectFit || def?.objectFit || "contain",
    backgroundColor: panel.backgroundColor || def?.backgroundColor,
    destination: panel.destination !== undefined ? panel.destination : (def?.destination || "/store"),
    visible: panel.visible !== false,
    order: typeof panel.order === "number" ? panel.order : idx + 1,
  };
};

const normalizeHomepageSection = (
  section: Partial<HomepageSection>,
  idx: number
): HomepageSection => {
  const def = section.builtInKey
    ? defaultHomepageSections.find((d) => d.builtInKey === section.builtInKey)
    : defaultHomepageSections.find((d) => d.id === section.id);

  const resolvedType = section.type || def?.type || "apple-hero";

  const resolvedTiles =
    Array.isArray(section.tiles) && section.tiles.length > 0
      ? section.tiles.map((t, i) => normalizeHomepageBentoTile(t, i))
      : resolvedType === "apple-bento-grid"
      ? (def?.tiles || defaultHomepageBentoTiles).map((t, i) => normalizeHomepageBentoTile(t, i))
      : undefined;

  const resolvedCarouselCards =
    Array.isArray(section.carouselCards) && section.carouselCards.length > 0
      ? section.carouselCards.map((c, i) => normalizeHomepageCarouselCard(c, i))
      : resolvedType === "story-carousel"
      ? (def?.carouselCards || defaultHomepageCarouselCards).map((c, i) => normalizeHomepageCarouselCard(c, i))
      : undefined;

  const resolvedPromoPanels =
    Array.isArray(section.promoPanels) && section.promoPanels.length > 0
      ? section.promoPanels.map((p, i) => normalizeHomepagePromoPanel(p, i))
      : resolvedType === "multi-promo-strip"
      ? (def?.promoPanels || defaultHomepagePromoPanels).map((p, i) => normalizeHomepagePromoPanel(p, i))
      : undefined;

  const resolvedFootnotes =
    Array.isArray(section.footnoteItems) && section.footnoteItems.length > 0
      ? section.footnoteItems.map((item) => String(item))
      : resolvedType === "footnotes"
      ? [...(def?.footnoteItems || defaultHomepageFootnotes)]
      : undefined;

  return {
    id: section.id || def?.id || `homepage-section-${idx + 1}`,
    type: resolvedType,
    builtInKey: section.builtInKey ?? def?.builtInKey,
    eyebrow: section.eyebrow !== undefined ? section.eyebrow : (def?.eyebrow || ""),
    heading: section.heading !== undefined ? section.heading : (def?.heading || "Section Heading"),
    subtitle: section.subtitle !== undefined ? section.subtitle : (def?.subtitle || ""),
    description: section.description !== undefined ? section.description : (def?.description || ""),
    tone: section.tone || def?.tone || "dark",
    mediaMode: section.mediaMode || def?.mediaMode,
    desktopImage: section.desktopImage !== undefined ? section.desktopImage : (def?.desktopImage ?? ""),
    mobileImage: section.mobileImage !== undefined ? section.mobileImage : (def?.mobileImage ?? ""),
    videoUrl: section.videoUrl !== undefined ? section.videoUrl : (def?.videoUrl ?? ""),
    mobileVideoUrl: section.mobileVideoUrl !== undefined ? section.mobileVideoUrl : (def?.mobileVideoUrl ?? ""),
    posterUrl: section.posterUrl !== undefined ? section.posterUrl : (def?.posterUrl ?? ""),
    mobilePosterUrl: section.mobilePosterUrl !== undefined ? section.mobilePosterUrl : (def?.mobilePosterUrl ?? ""),
    videoAutoplay: section.videoAutoplay !== undefined ? section.videoAutoplay : def?.videoAutoplay,
    videoMuted: section.videoMuted !== undefined ? section.videoMuted : def?.videoMuted,
    videoLoop: section.videoLoop !== undefined ? section.videoLoop : def?.videoLoop,
    imageAlt: section.imageAlt !== undefined ? section.imageAlt : (def?.imageAlt || section.heading || "Homepage section image"),
    focalPoint: section.focalPoint || def?.focalPoint || "bottom",
    objectFit: section.objectFit || def?.objectFit || "contain",
    caption: section.caption !== undefined ? section.caption : (def?.caption || ""),
    copyPlacement: section.copyPlacement || def?.copyPlacement || "top",
    backgroundColor: section.backgroundColor || def?.backgroundColor || "#000000",
    textAlignment: section.textAlignment || def?.textAlignment || "center",
    productIds: Array.isArray(section.productIds) ? section.productIds : (def?.productIds || []),
    tiles: resolvedTiles,
    carouselCards: resolvedCarouselCards,
    promoPanels: resolvedPromoPanels,
    footnoteItems: resolvedFootnotes,
    buttonLabel: section.buttonLabel !== undefined ? section.buttonLabel : (def?.buttonLabel || ""),
    buttonDestination: section.buttonDestination !== undefined ? section.buttonDestination : (def?.buttonDestination || ""),
    secondaryButtonLabel: section.secondaryButtonLabel !== undefined ? section.secondaryButtonLabel : (def?.secondaryButtonLabel || ""),
    secondaryButtonDestination: section.secondaryButtonDestination !== undefined ? section.secondaryButtonDestination : (def?.secondaryButtonDestination || ""),
    layoutStyle: section.layoutStyle || def?.layoutStyle || "full-bleed",
    visible: section.visible !== false,
    order: typeof section.order === "number" ? section.order : idx,
  };
};

export const normalizeHomepageContent = (savedContent?: Partial<HomepageContent> | null): HomepageContent => {
  const source = savedContent || defaultHomepageContent;
  const layoutMode: HomepageLayoutMode = source.layoutMode === "modular" ? "modular" : "legacy";

  const resolveFallbackBg = (tone: "dark" | "light" | "mist", idDefaultBg?: string) => {
    if (idDefaultBg) return idDefaultBg;
    if (tone === "dark") return "#000000";
    if (tone === "mist") return "#e9f5fa";
    return "#ffffff";
  };

  const mergedHeroes = (source.heroes || defaultHomepageContent.heroes).map((h, idx) => {
    const def = defaultHomepageContent.heroes.find((d) => d.id === h.id);
    const hasExplicitBackground = h.backgroundColor !== undefined;
    const rawImage = h.image !== undefined ? h.image : (def?.image || "");
    const hasExplicitMobileKey = "mobileImage" in h;
    const rawMobileImage = hasExplicitMobileKey ? h.mobileImage : def?.mobileImage;

    const isDeprecatedIphone18Desktop =
      !hasExplicitBackground &&
      ((h.id === "iphone-18-pro" && !rawImage) ||
        rawImage.includes("1792586241422-iphone-18-pro-the-new-features-you-should-try-1.jpg") ||
        rawImage === "/products/homepage/iphone-18-pro-hero.webp" ||
        rawImage === "/products/homepage/iphone-18-pro-hero.jpg");

    const finalImage = isDeprecatedIphone18Desktop ? APPROVED_IPHONE_18_PRO_DESKTOP_HERO : rawImage;
    const isUsingApprovedIphone18Desktop = finalImage === APPROVED_IPHONE_18_PRO_DESKTOP_HERO;

    const isDeprecatedIphone18Mobile =
      isUsingApprovedIphone18Desktop &&
      ((!hasExplicitMobileKey && !rawMobileImage) ||
        rawMobileImage?.includes("1792004900948-iphone-18-promax-1.jpg") ||
        rawMobileImage === "/products/homepage/iphone-18-pro-hero-mobile.webp");

    const inferredFromImage = !hasExplicitBackground
      ? inferLegacyMediaAttributesForUrl(finalImage)
      : null;

    const finalTone =
      h.backgroundColor !== undefined
        ? h.tone || inferredFromImage?.tone || def?.tone || "dark"
        : inferredFromImage?.tone || h.tone || def?.tone || "dark";
    const finalBackground =
      h.backgroundColor !== undefined
        ? h.backgroundColor
        : inferredFromImage?.backgroundColor || resolveFallbackBg(finalTone, def?.backgroundColor);
    const finalBlend =
      finalTone === "dark"
        ? "normal"
        : h.mediaBlendMode !== undefined
        ? h.mediaBlendMode
        : inferredFromImage?.mediaBlendMode || def?.mediaBlendMode || "normal";

    const finalTitle = h.title !== undefined ? h.title : (def?.title || "Featured Campaign");
    const finalDeviceName =
      h.deviceName !== undefined ? h.deviceName : finalTitle;

    return {
      ...def,
      ...h,
      id: h.id || def?.id || `hero-${idx + 1}`,
      deviceName: finalDeviceName,
      title: finalTitle,
      subtitle: h.subtitle !== undefined ? h.subtitle : (def?.subtitle || ""),
      tone: finalTone,
      backgroundColor: finalBackground,
      backgroundGradient:
        "backgroundGradient" in h ? h.backgroundGradient : def?.backgroundGradient,
      mediaFit: h.mediaFit || def?.mediaFit || "contain",
      mediaPosition: h.mediaPosition || def?.mediaPosition || "bottom",
      mediaBlendMode: finalBlend,
      mediaMode: h.mediaMode || (h.videoUrl ? "video" : "image"),
      image: finalImage,
      mobileImage: isDeprecatedIphone18Mobile
        ? APPROVED_IPHONE_18_PRO_MOBILE_HERO
        : rawMobileImage || undefined,
      order: typeof h.order === "number" ? h.order : idx + 1,
    };
  });

  const mergedTiles = (source.tiles || defaultHomepageContent.tiles).map((t, idx) => {
    const def = defaultHomepageContent.tiles.find((d) => d.id === t.id);
    const hasExplicitBackground = t.backgroundColor !== undefined;
    const rawTileImage = t.image !== undefined ? t.image : (def?.image || "");
    const inferredFromImage = !hasExplicitBackground
      ? inferLegacyMediaAttributesForUrl(rawTileImage)
      : null;
    const finalTone =
      hasExplicitBackground
        ? t.tone || inferredFromImage?.tone || def?.tone || "light"
        : inferredFromImage?.tone || t.tone || def?.tone || "light";
    const finalBackground = hasExplicitBackground
      ? t.backgroundColor
      : inferredFromImage?.backgroundColor || resolveFallbackBg(finalTone, def?.backgroundColor);
    const finalBlend =
      finalTone === "dark"
        ? "normal"
        : t.mediaBlendMode !== undefined
        ? t.mediaBlendMode
        : inferredFromImage?.mediaBlendMode || def?.mediaBlendMode || "normal";

    const finalTitle = t.title !== undefined ? t.title : (def?.title || "Promotional Tile");
    const finalDeviceName =
      t.deviceName !== undefined ? t.deviceName : finalTitle;

    return {
      ...def,
      ...t,
      id: t.id || def?.id || `tile-${idx + 1}`,
      deviceName: finalDeviceName,
      title: finalTitle,
      subtitle: t.subtitle !== undefined ? t.subtitle : (def?.subtitle || ""),
      tone: finalTone,
      backgroundColor: finalBackground,
      backgroundGradient:
        "backgroundGradient" in t ? t.backgroundGradient : def?.backgroundGradient,
      mediaFit: t.mediaFit || def?.mediaFit || "contain",
      mediaPosition: t.mediaPosition || def?.mediaPosition || "bottom",
      mediaBlendMode: finalBlend,
      mediaMode: t.mediaMode || (t.videoUrl ? "video" : "image"),
      mobileImage: "mobileImage" in t ? t.mobileImage || undefined : def?.mobileImage,
      order: typeof t.order === "number" ? t.order : idx + 1,
    };
  });

  const mergedCustomSections = Array.isArray(source.customSections)
    ? source.customSections.map((cs, idx) => {
        const finalTone = cs.tone || "light";
        const finalBackground =
          cs.backgroundColor !== undefined
            ? cs.backgroundColor
            : resolveFallbackBg(finalTone);
        const finalTitle = cs.title || cs.deviceName || `Custom Section ${idx + 1}`;
        return {
          ...cs,
          id: cs.id || `custom-section-${idx + 1}`,
          internalName: cs.internalName || finalTitle,
          deviceName: cs.deviceName !== undefined ? cs.deviceName : finalTitle,
          title: finalTitle,
          subtitle: cs.subtitle || "",
          image: cs.image || "",
          alt: cs.alt || finalTitle,
          tone: finalTone,
          backgroundColor: finalBackground,
          mediaFit: cs.mediaFit || "contain",
          mediaPosition: cs.mediaPosition || "bottom",
          mediaBlendMode:
            finalTone === "dark" ? "normal" : cs.mediaBlendMode || "normal",
          mediaMode: cs.mediaMode || (cs.videoUrl ? "video" : "image"),
          layoutVariant: cs.layoutVariant || "full-hero",
          sectionPlacement: cs.sectionPlacement || "after-heroes",
          primary: cs.primary || { label: "Learn more", to: "/store" },
          enabled: cs.enabled ?? true,
          order: typeof cs.order === "number" ? cs.order : idx + 1,
        };
      })
    : [];

  const sections =
    Array.isArray(source.sections) && source.sections.length > 0
      ? source.sections.map((sec, idx) => normalizeHomepageSection(sec, idx))
      : defaultHomepageSections.map((sec, idx) => normalizeHomepageSection(sec, idx));

  return {
    ...defaultHomepageContent,
    ...source,
    layoutMode,
    heroes: mergedHeroes,
    tiles: mergedTiles,
    customSections: mergedCustomSections,
    sections,
    hasDraft: Boolean(source.hasDraft),
    updatedAt: source.updatedAt,
  };
};

export const hasVerifiedLocalHomepageContent = (): boolean => {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(CMS_STORAGE_KEY_HOMEPAGE_VERIFIED) === "true";
  } catch {
    return false;
  }
};

export const getInitialHomepageContent = (): HomepageContent =>
  normalizeHomepageContent(readLocal<HomepageContent>(CMS_STORAGE_KEY_HOMEPAGE, defaultHomepageContent));

export const getInitialHomepageDraft = (): HomepageContent | null => {
  try {
    const raw = localStorage.getItem(CMS_STORAGE_KEY_HOMEPAGE_DRAFT);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<HomepageContent>;
    return normalizeHomepageContent({
      ...parsed,
      layoutMode: parsed.layoutMode || "modular",
      hasDraft: true,
    });
  } catch {
    return null;
  }
};

export const fetchHomepageContent = async (): Promise<HomepageContent> => {
  const local = getInitialHomepageContent();
  if (!supabase) return local;

  try {
    const { data, error } = await supabase
      .from("homepage_content")
      .select("content")
      .eq("id", "main")
      .maybeSingle();

    if (!error && data?.content) {
      const merged = normalizeHomepageContent(data.content as Partial<HomepageContent>);
      writeLocal(CMS_STORAGE_KEY_HOMEPAGE, merged);
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(CMS_STORAGE_KEY_HOMEPAGE_VERIFIED, "true");
        } catch {}
      }
      return merged;
    }
  } catch {
    // Non-blocking fallback
  }

  return local;
};

export const fetchHomepageDraft = async (): Promise<HomepageContent | null> => {
  return getInitialHomepageDraft();
};

export const saveHomepageDraft = async (
  content: HomepageContent
): Promise<HomepageContent> => {
  const normalized = normalizeHomepageContent({
    ...content,
    layoutMode: content.layoutMode || "modular",
    hasDraft: true,
    updatedAt: new Date().toISOString(),
  });

  writeLocal(CMS_STORAGE_KEY_HOMEPAGE_DRAFT, normalized);
  notifyListeners();
  return normalized;
};

export const discardHomepageDraft = async (): Promise<void> => {
  try {
    localStorage.removeItem(CMS_STORAGE_KEY_HOMEPAGE_DRAFT);
  } catch {
    // ignore
  }
  notifyListeners();
};

export const getInitialHomepageLegacyDraft = (): HomepageContent | null => {
  try {
    const raw = localStorage.getItem(CMS_STORAGE_KEY_HOMEPAGE_LEGACY_DRAFT);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<HomepageContent>;
    return normalizeHomepageContent({
      ...parsed,
      layoutMode: "legacy",
      hasDraft: true,
    });
  } catch {
    return null;
  }
};

export const fetchHomepageLegacyDraft = async (): Promise<HomepageContent | null> => {
  return getInitialHomepageLegacyDraft();
};

export const saveHomepageLegacyDraft = async (
  content: HomepageContent
): Promise<HomepageContent> => {
  const normalized = normalizeHomepageContent({
    ...content,
    layoutMode: "legacy",
    hasDraft: true,
    updatedAt: new Date().toISOString(),
  });

  writeLocal(CMS_STORAGE_KEY_HOMEPAGE_LEGACY_DRAFT, normalized);
  notifyListeners();
  return normalized;
};

export const discardHomepageLegacyDraft = async (): Promise<void> => {
  try {
    localStorage.removeItem(CMS_STORAGE_KEY_HOMEPAGE_LEGACY_DRAFT);
  } catch {
    // ignore
  }
  notifyListeners();
};

export const HOMEPAGE_VIDEO_BUCKET = "learn-more-media";

type StagedSlotRef = {
  uri: string;
  expectedKind: LocalMediaKind;
};

const MEDIA_IMAGE_FIELDS = [
  "image",
  "desktopImage",
  "mobileImage",
  "posterUrl",
  "mobilePosterUrl",
  "backgroundImage",
] as const;
const MEDIA_VIDEO_FIELDS = ["videoUrl", "mobileVideoUrl"] as const;

function collectFromMediaFields(
  entity: Record<string, unknown> | undefined | null,
  localRefs: Map<string, StagedSlotRef>,
  transientBlobs: Set<string>
) {
  if (!entity) return;
  const inspect = (raw: unknown, expectedKind: LocalMediaKind) => {
    if (typeof raw !== "string") return;
    const trimmed = raw.trim();
    if (!trimmed) return;
    if (isLocalMediaUri(trimmed)) {
      if (!localRefs.has(trimmed)) {
        localRefs.set(trimmed, { uri: trimmed, expectedKind });
      }
    } else if (trimmed.startsWith("blob:")) {
      transientBlobs.add(trimmed);
    }
  };

  for (const field of MEDIA_IMAGE_FIELDS) {
    inspect(entity[field], "image");
  }
  for (const field of MEDIA_VIDEO_FIELDS) {
    inspect(entity[field], "video");
  }
}

export function collectHomepageMediaReferences(content: HomepageContent): {
  localRefs: StagedSlotRef[];
  transientBlobUris: string[];
} {
  const localRefs = new Map<string, StagedSlotRef>();
  const transientBlobs = new Set<string>();

  for (const hero of content.heroes || []) {
    collectFromMediaFields(hero as unknown as Record<string, unknown>, localRefs, transientBlobs);
  }
  for (const tile of content.tiles || []) {
    collectFromMediaFields(tile as unknown as Record<string, unknown>, localRefs, transientBlobs);
  }
  for (const customSec of content.customSections || []) {
    collectFromMediaFields(customSec as unknown as Record<string, unknown>, localRefs, transientBlobs);
  }
  for (const flyer of content.serviceFlyers || []) {
    collectFromMediaFields(flyer as unknown as Record<string, unknown>, localRefs, transientBlobs);
  }
  for (const section of content.sections || []) {
    collectFromMediaFields(section as unknown as Record<string, unknown>, localRefs, transientBlobs);
    for (const panel of section.promoPanels || []) {
      collectFromMediaFields(panel as unknown as Record<string, unknown>, localRefs, transientBlobs);
    }
    for (const tile of section.tiles || []) {
      collectFromMediaFields(tile as unknown as Record<string, unknown>, localRefs, transientBlobs);
    }
    for (const card of section.carouselCards || []) {
      collectFromMediaFields(card as unknown as Record<string, unknown>, localRefs, transientBlobs);
    }
  }

  return {
    localRefs: Array.from(localRefs.values()),
    transientBlobUris: Array.from(transientBlobs),
  };
}

function replaceFieldsInObject<T extends object>(obj: T, urlMap: Map<string, string>): T {
  const clone = { ...obj } as Record<string, unknown>;
  for (const field of [...MEDIA_IMAGE_FIELDS, ...MEDIA_VIDEO_FIELDS]) {
    const val = clone[field];
    if (typeof val === "string") {
      const mapped = urlMap.get(val.trim());
      if (mapped) clone[field] = mapped;
    }
  }
  return clone as T;
}

export function replaceHomepageMediaReferences(
  content: HomepageContent,
  urlMap: Map<string, string>
): HomepageContent {
  return {
    ...content,
    heroes: (content.heroes || []).map((hero) => replaceFieldsInObject(hero, urlMap)),
    tiles: (content.tiles || []).map((tile) => replaceFieldsInObject(tile, urlMap)),
    customSections: content.customSections
      ? content.customSections.map((cs) => replaceFieldsInObject(cs, urlMap))
      : undefined,
    serviceFlyers: (content.serviceFlyers || []).map((flyer) =>
      replaceFieldsInObject(flyer, urlMap)
    ),
    sections: content.sections
      ? content.sections.map((section) => {
          const nextSection = replaceFieldsInObject(section, urlMap);
          if (section.promoPanels) {
            nextSection.promoPanels = section.promoPanels.map((p) =>
              replaceFieldsInObject(p, urlMap)
            );
          }
          if (section.tiles) {
            nextSection.tiles = section.tiles.map((t) => replaceFieldsInObject(t, urlMap));
          }
          if (section.carouselCards) {
            nextSection.carouselCards = section.carouselCards.map((c) =>
              replaceFieldsInObject(c, urlMap)
            );
          }
          return nextSection;
        })
      : undefined,
  };
}

const toBase64Utf8 = (input: string): string => {
  const bytes = new TextEncoder().encode(input);
  let binary = "";
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
};

async function uploadResumableTusWithFetch({
  projectId,
  token,
  bucket,
  storagePath,
  contentType,
  blob,
}: {
  projectId: string;
  token: string;
  bucket: string;
  storagePath: string;
  contentType: string;
  blob: Blob;
}): Promise<void> {
  const endpoint = `https://${projectId}.storage.supabase.co/storage/v1/upload/resumable`;
  const metadata = [
    `bucketName ${toBase64Utf8(bucket)}`,
    `objectName ${toBase64Utf8(storagePath)}`,
    `contentType ${toBase64Utf8(contentType)}`,
    `cacheControl ${toBase64Utf8("31536000")}`,
  ].join(",");

  const createRes = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "x-upsert": "false",
      "Tus-Resumable": "1.0.0",
      "Upload-Length": String(blob.size),
      "Upload-Metadata": metadata,
    },
  });

  if (!createRes.ok) {
    const errText = await createRes.text().catch(() => createRes.statusText);
    throw new Error(`Resumable video upload initialization failed (${createRes.status}): ${errText}`);
  }

  const locationHeader = createRes.headers.get("Location");
  if (!locationHeader) {
    throw new Error("Resumable video upload did not return an upload Location URL.");
  }
  const uploadUrl = locationHeader.startsWith("http")
    ? locationHeader
    : `https://${projectId}.storage.supabase.co${locationHeader}`;

  const chunkSize = 6 * 1024 * 1024;
  let offset = 0;
  while (offset < blob.size) {
    const nextEnd = Math.min(offset + chunkSize, blob.size);
    const chunk = blob.slice(offset, nextEnd);
    const patchRes = await fetch(uploadUrl, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Tus-Resumable": "1.0.0",
        "Upload-Offset": String(offset),
        "Content-Type": "application/offset+octet-stream",
      },
      body: chunk,
    });
    if (!patchRes.ok) {
      const errText = await patchRes.text().catch(() => patchRes.statusText);
      throw new Error(`Video chunk upload failed at offset ${offset} (${patchRes.status}): ${errText}`);
    }
    const serverOffset = Number(patchRes.headers.get("Upload-Offset"));
    offset = Number.isFinite(serverOffset) && serverOffset > offset ? serverOffset : nextEnd;
  }
}

async function uploadHomepageStagedRecordToSupabase(
  record: LocalStagedMediaRecord,
  expectedKind: LocalMediaKind
): Promise<string> {
  const client = getSupabaseOrThrow();
  const fileLike = {
    name: record.filename,
    type: record.mimeType,
    size: record.blob?.size ?? record.size,
    slice: (start?: number, end?: number) => record.blob.slice(start, end),
  };

  const validated = await validateLocalMediaFile(fileLike, expectedKind);

  const uniqueToken =
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  const cleanBase =
    (record.filename || "media")
      .toLowerCase()
      .replace(/\.[^.]+$/, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 50) || "homepage-media";

  const isVideo = validated.kind === "video";
  const bucket = isVideo ? HOMEPAGE_VIDEO_BUCKET : productImagesBucket;
  const folder = isVideo ? "videos" : "media/homepage/images";
  const storagePath = `${folder}/${uniqueToken}-${cleanBase}.${validated.extension}`;

  const uploadBlob =
    record.blob instanceof Blob
      ? new File([record.blob], `${cleanBase}.${validated.extension}`, {
          type: validated.normalizedMimeType,
        })
      : record.blob;

  if (isVideo && record.blob.size > 6 * 1024 * 1024) {
    const { data: sessionData } = await client.auth.getSession();
    const token = sessionData.session?.access_token;
    if (!token) {
      throw new Error("Admin session expired before uploading video. Sign in with AAL2 MFA again.");
    }
    const projectUrl = import.meta.env.VITE_SUPABASE_URL as string;
    const projectId = new URL(projectUrl).hostname.split(".")[0];
    if (typeof XMLHttpRequest !== "undefined") {
      const tus = await import("tus-js-client");
      await new Promise<void>((resolve, reject) => {
        const upload = new tus.Upload(uploadBlob, {
          endpoint: `https://${projectId}.storage.supabase.co/storage/v1/upload/resumable`,
          headers: { authorization: `Bearer ${token}`, "x-upsert": "false" },
          metadata: {
            bucketName: bucket,
            objectName: storagePath,
            contentType: validated.normalizedMimeType,
            cacheControl: "31536000",
          },
          chunkSize: 6 * 1024 * 1024,
          retryDelays: [0, 3000, 5000, 10000, 20000],
          uploadDataDuringCreation: true,
          removeFingerprintOnSuccess: true,
          onError: reject,
          onSuccess: () => resolve(),
        });
        void upload
          .findPreviousUploads()
          .then((previous) => {
            if (previous.length) upload.resumeFromPreviousUpload(previous[0]);
            upload.start();
          })
          .catch(reject);
      });
    } else {
      await uploadResumableTusWithFetch({
        projectId,
        token,
        bucket,
        storagePath,
        contentType: validated.normalizedMimeType,
        blob: uploadBlob,
      });
    }
  } else {
    const { error: uploadErr } = await client.storage.from(bucket).upload(storagePath, uploadBlob, {
      cacheControl: "31536000",
      upsert: false,
      contentType: validated.normalizedMimeType,
    });
    if (uploadErr) {
      throw new Error(
        `Failed to upload "${record.filename}" to Supabase Storage (${uploadErr.message}). Your local draft was preserved.`
      );
    }
  }

  const { data: urlData } = client.storage.from(bucket).getPublicUrl(storagePath);
  const publicUrl = (urlData?.publicUrl || "").trim();
  if (!publicUrl || (!publicUrl.startsWith("https://") && !publicUrl.startsWith("http://"))) {
    throw new Error(`Could not obtain a public URL for "${record.filename}". Publish cancelled.`);
  }

  // Verify the uploaded permanent media URL is publicly retrievable before committing CMS record
  if (typeof fetch === "function") {
    let headStatus = 0;
    for (let attempt = 0; attempt < 2; attempt += 1) {
      try {
        const res = await fetch(publicUrl, { method: "HEAD", cache: "no-store" });
        headStatus = res.status;
        if (res.ok) break;
      } catch {
        headStatus = 0;
      }
      if (attempt === 0) {
        await new Promise((r) => setTimeout(r, 250));
      }
    }
    if (headStatus >= 400) {
      throw new Error(
        `Uploaded media "${record.filename}" returned HTTP ${headStatus} from public storage (${publicUrl}). Publish cancelled and draft preserved.`
      );
    }
  }

  return publicUrl;
}

export async function promoteHomepageLocalMediaForPublish(
  content: HomepageContent,
  deps?: {
    assertAuth?: () => Promise<unknown>;
    getStagedRecord?: (uri: string) => Promise<LocalStagedMediaRecord | null>;
    uploadStagedRecord?: (
      record: LocalStagedMediaRecord,
      expectedKind: LocalMediaKind
    ) => Promise<string>;
  }
): Promise<HomepageContent> {
  await (deps?.assertAuth ? deps.assertAuth() : assertAdminAal2());

  const { localRefs, transientBlobUris } = collectHomepageMediaReferences(content);
  if (transientBlobUris.length > 0) {
    throw new Error(
      "Cannot publish temporary browser blob URLs. Re-upload the affected image or video before publishing."
    );
  }

  if (localRefs.length === 0) {
    return content;
  }

  const resolveRecord = deps?.getStagedRecord ?? getLocalStagedMediaRecord;
  const uploadRecord = deps?.uploadStagedRecord ?? uploadHomepageStagedRecordToSupabase;
  const uploadedUrlMap = new Map<string, string>();

  for (const ref of localRefs) {
    const stagedRecord = await resolveRecord(ref.uri);
    if (!stagedRecord || !stagedRecord.blob || stagedRecord.blob.size <= 0) {
      throw new Error(
        `Staged local media "${ref.uri}" could not be read from browser storage. Re-upload it before publishing; your draft remains saved.`
      );
    }
    const permanentUrl = await uploadRecord(stagedRecord, ref.expectedKind);
    if (!permanentUrl || isLocalMediaUri(permanentUrl) || permanentUrl.startsWith("blob:")) {
      throw new Error(
        `Media upload for "${stagedRecord.filename}" did not return a permanent public URL.`
      );
    }
    uploadedUrlMap.set(ref.uri, permanentUrl);
  }

  const resolvedContent = replaceHomepageMediaReferences(content, uploadedUrlMap);
  const remaining = collectHomepageMediaReferences(resolvedContent);
  if (remaining.localRefs.length > 0 || remaining.transientBlobUris.length > 0) {
    throw new Error(
      "Publish blocked: unresolved local-media references remained after upload. Your local draft has not been altered."
    );
  }

  return resolvedContent;
}

export function validateHomepagePayloadForPublish(content: HomepageContent): void {
  const remaining = collectHomepageMediaReferences(content);
  if (remaining.localRefs.length > 0 || remaining.transientBlobUris.length > 0) {
    throw new Error(
      "Publish blocked: unresolved local media or temporary blob URLs remain in payload. Your draft was preserved."
    );
  }

  if (content.layoutMode !== "modular") {
    const activeHeroes = (content.heroes || []).filter((h) => h.enabled);
    const activeCustom = (content.customSections || []).filter((s) => s.enabled);
    if (activeHeroes.length === 0 && activeCustom.length === 0) {
      throw new Error(
        "At least one active Hero Slide is required before publishing the legacy homepage."
      );
    }
    for (const hero of activeHeroes) {
      if (!hero.title?.trim() && !hero.deviceName?.trim()) {
        throw new Error("Every active Hero Slide must have a non-empty Headline Title.");
      }
      const hasMedia =
        Boolean(hero.image?.trim()) ||
        (hero.mediaMode === "video" && Boolean(hero.videoUrl?.trim()));
      if (!hasMedia) {
        throw new Error(
          `Hero Slide "${hero.title || hero.deviceName}" is missing a Desktop Hero Image or Video.`
        );
      }
    }
    for (const cs of activeCustom) {
      if (!cs.title?.trim() && !cs.deviceName?.trim()) {
        throw new Error("Every active Custom Section must have a non-empty Heading.");
      }
      const hasMedia =
        Boolean(cs.image?.trim()) ||
        (cs.mediaMode === "video" && Boolean(cs.videoUrl?.trim()));
      if (!hasMedia) {
        throw new Error(
          `Custom Section "${cs.title || cs.internalName}" is missing an Image or Video.`
        );
      }
    }
  }
}

export const saveHomepageContent = async (
  content: HomepageContent
): Promise<HomepageContent> => {
  await assertAdminAal2();
  const client = getSupabaseOrThrow();

  const resolvedContent = await promoteHomepageLocalMediaForPublish(content);
  const cleanContent: HomepageContent = {
    ...resolvedContent,
    layoutMode: resolvedContent.layoutMode === "modular" ? "modular" : "legacy",
    hasDraft: false,
    updatedAt: new Date().toISOString(),
  };

  validateHomepagePayloadForPublish(cleanContent);

  const { error } = await client.from("homepage_content").upsert({
    id: "main",
    content: cleanContent,
    updated_at: cleanContent.updatedAt,
  });

  if (error) {
    throw new Error(
      `Failed to save homepage changes to Supabase (${error.message}, code: ${error.code || "ERR"}). Ensure migration 016 has been run in Supabase SQL Editor.`
    );
  }

  // Verify the published record is readable after upsert and contains no local media references
  const { data: verifyRow, error: verifyErr } = await client
    .from("homepage_content")
    .select("id, updated_at, content")
    .eq("id", "main")
    .maybeSingle();

  if (verifyErr) {
    throw new Error(
      `Published write succeeded, but public verification read failed (${verifyErr.message}). Check Supabase availability.`
    );
  }
  if (!verifyRow) {
    throw new Error("Published homepage verification returned empty row.");
  }
  if (verifyRow.content) {
    const verifyMedia = collectHomepageMediaReferences(verifyRow.content as HomepageContent);
    if (verifyMedia.localRefs.length > 0 || verifyMedia.transientBlobUris.length > 0) {
      throw new Error(
        "Published record verification failed: local media references were found in the saved record."
      );
    }
  }

  // Clear matching unpublished local draft only AFTER authoritative Supabase write & verify succeed
  try {
    if (cleanContent.layoutMode === "modular") {
      localStorage.removeItem(CMS_STORAGE_KEY_HOMEPAGE_DRAFT);
    } else {
      localStorage.removeItem(CMS_STORAGE_KEY_HOMEPAGE_LEGACY_DRAFT);
    }
  } catch {
    // ignore
  }

  // Only update client cache after authoritative Supabase write succeeds
  writeLocal(CMS_STORAGE_KEY_HOMEPAGE, cleanContent);
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(CMS_STORAGE_KEY_HOMEPAGE_VERIFIED, "true");
    } catch {}
  }
  broadcastPublishedUpdate("homepage");
  notifyListeners();
  return cleanContent;
};

// 3. MEDIA LIBRARY
const CMS_STORAGE_KEY_DELETED_MEDIA = "buyandsellgh_cms_deleted_media_ids_v1";

export const getDeletedMediaIds = (): Set<string> => {
  const local = readLocal<string[]>(CMS_STORAGE_KEY_DELETED_MEDIA, []);
  return new Set(local);
};

export const recordDeletedMediaId = async (id: string): Promise<void> => {
  const current = getDeletedMediaIds();
  current.add(id);
  const arr = Array.from(current);
  writeLocal(CMS_STORAGE_KEY_DELETED_MEDIA, arr);

  // Best-effort sync to site_settings so deletion persists across devices
  try {
    const settings = await fetchSiteSettings();
    const updated = Array.from(new Set([...(settings.deletedMediaIds || []), id]));
    await saveSiteSettings({ ...settings, deletedMediaIds: updated });
  } catch {
    // Non-blocking fallback
  }
};

export interface MediaAssetUsage {
  location: string;
  type: "hero" | "tile" | "flyer" | "storefront" | "brand" | "settings";
  identifier: string;
}

export const getMediaAssetUsages = (
  item: MediaItem,
  homepage?: HomepageContent | null,
  storefront?: Record<string, CategoryDepartmentConfig> | null,
  settings?: SiteSettings | null
): MediaAssetUsage[] => {
  const usages: MediaAssetUsage[] = [];
  if (!item) return usages;

  const cleanUrl = (u?: string) => (u || "").trim().toLowerCase();
  const itemUrl = cleanUrl(item.url);
  const itemFilename = (item.filename || "").toLowerCase();

  const urlMatches = (candidate?: string) => {
    if (!candidate) return false;
    const c = cleanUrl(candidate);
    if (c === itemUrl) return true;
    if (itemUrl.length > 5 && c.endsWith(itemUrl)) return true;
    if (c.length > 5 && itemUrl.endsWith(c)) return true;
    if (itemFilename && itemFilename.length > 5 && c.includes(itemFilename)) return true;
    return false;
  };

  // 1. Homepage Heroes
  if (homepage?.heroes) {
    for (const hero of homepage.heroes) {
      const desktopMatch =
        urlMatches(hero.image) ||
        (item.id === "media-hero-iphone18" && hero.id === "iphone-18-pro") ||
        (item.id.startsWith("media-hero-") && !item.id.endsWith("-mobile") && hero.id === item.id.replace("media-hero-", ""));

      const mobileMatch =
        urlMatches(hero.mobileImage) ||
        (item.id === "media-hero-iphone18-mobile" && hero.id === "iphone-18-pro") ||
        (item.id.startsWith("media-hero-") && item.id.endsWith("-mobile") && hero.id === item.id.replace("media-hero-", "").replace("-mobile", ""));

      if (desktopMatch) {
        usages.push({
          location: `Homepage Hero Banner (Desktop): "${hero.title || hero.id}"`,
          type: "hero",
          identifier: `${hero.id}-desktop`,
        });
      }
      if (mobileMatch) {
        usages.push({
          location: `Homepage Hero Banner (Mobile): "${hero.title || hero.id}"`,
          type: "hero",
          identifier: `${hero.id}-mobile`,
        });
      }
    }
  }

  // 2. Promotional Tiles
  if (homepage?.tiles) {
    for (const tile of homepage.tiles) {
      const matches =
        urlMatches(tile.image) ||
        (item.id.startsWith("media-tile-") && tile.id === item.id.replace("media-tile-", "")) ||
        (item.id === "media-tile-ipad-air" && tile.id === "ipad-air") ||
        (item.id === "media-product-ipad-air-white" && tile.id === "ipad-air");
      if (matches) {
        usages.push({
          location: `Promotional Tile: "${tile.title || tile.id}"`,
          type: "tile",
          identifier: tile.id,
        });
      }
    }
  }

  // 3. Service Flyers
  if (homepage?.serviceFlyers) {
    for (const flyer of homepage.serviceFlyers) {
      const matches =
        urlMatches(flyer.image) ||
        (item.id.startsWith("media-flyer-") && flyer.id === item.id.replace("media-flyer-", "")) ||
        (item.id === "media-flyer-repairs" && flyer.id === "flyer-repairs") ||
        (item.id === "media-flyer-installment" && flyer.id === "flyer-installment") ||
        (item.id === "media-flyer-tradein" && flyer.id === "flyer-tradein") ||
        (item.id === "media-flyer-sell" && flyer.id === "flyer-sell") ||
        (item.id === "media-flyer-refer" && flyer.id === "flyer-refer");
      if (matches) {
        usages.push({
          location: `Service Flyer: "${flyer.title || flyer.id}"`,
          type: "flyer",
          identifier: flyer.id,
        });
      }
    }
  }

  // 4. Storefront Featured Cards
  if (storefront) {
    for (const [deptKey, dept] of Object.entries(storefront)) {
      if (dept?.featuredCards) {
        for (const card of dept.featuredCards) {
          const matches =
            urlMatches(card.image) ||
            (item.id === "media-tile-ipad-air" && card.id?.includes("ipad-air")) ||
            (item.id === "media-product-ipad-air-colors" && (urlMatches(card.image) || card.id?.includes("ipad-air")));
          if (matches) {
            usages.push({
              location: `Storefront [${dept.label || deptKey}] Featured Card: "${card.title || card.id}"`,
              type: "storefront",
              identifier: card.id || deptKey,
            });
          }
        }
      }
    }
  }

  // 5. Brand Identity Assets
  if (
    item.category === "brand" ||
    item.id === "media-brand-logo" ||
    item.id === "media-brand-owner" ||
    item.id === "media-brand-rollup"
  ) {
    usages.push({
      location: `Brand Identity Asset (${item.title || "Primary Brand Logo / Seal"})`,
      type: "brand",
      identifier: item.id,
    });
  }

  return usages;
};

export const mergeMediaItems = (
  primary: MediaItem[],
  defaults: MediaItem[],
  deletedIds?: Set<string>
): MediaItem[] => {
  const map = new Map<string, MediaItem>();
  // 1. Seed defaults first (skipping deleted)
  for (const item of defaults) {
    if (!deletedIds || !deletedIds.has(item.id)) {
      map.set(item.id, item);
    }
  }
  // 2. Overlay primary (skipping deleted)
  for (const item of primary) {
    if (!deletedIds || !deletedIds.has(item.id)) {
      map.set(item.id, item);
    }
  }
  return Array.from(map.values());
};

export const syncMissingMediaToSupabase = async (missingItems: MediaItem[]): Promise<void> => {
  if (!supabase || missingItems.length === 0) return;
  try {
    const deletedIds = getDeletedMediaIds();
    const toInsert = missingItems.filter((item) => !deletedIds.has(item.id));
    if (toInsert.length === 0) return;

    const rows = toInsert.map((item) => ({
      id: item.id,
      title: item.title,
      filename: item.filename,
      url: item.url,
      storage_path: item.storagePath || null,
      file_size: item.fileSize || null,
      mime_type: item.mimeType || "image/webp",
      category: item.category,
      alt: item.alt || "",
      fit: item.fit || "contain",
      position: item.position || "center",
      created_at: item.createdAt || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));

    await supabase.from("media_library").upsert(rows, { onConflict: "id", ignoreDuplicates: true });
  } catch {
    // Non-blocking fallback if unauthenticated
  }
};

export const getInitialMediaLibrary = (): MediaItem[] => {
  const deletedIds = getDeletedMediaIds();
  const rawLocal = readLocal<MediaItem[]>(CMS_STORAGE_KEY_MEDIA, defaultMediaItems);
  return mergeMediaItems(rawLocal, defaultMediaItems, deletedIds);
};

export const fetchMediaLibrary = async (): Promise<MediaItem[]> => {
  const deletedIds = getDeletedMediaIds();
  const localSettings = readLocal<SiteSettings>(CMS_STORAGE_KEY_SETTINGS, defaultSiteSettings);
  if (localSettings?.deletedMediaIds) {
    localSettings.deletedMediaIds.forEach((id) => deletedIds.add(id));
  }

  const rawLocal = readLocal<MediaItem[]>(CMS_STORAGE_KEY_MEDIA, defaultMediaItems);
  const local = mergeMediaItems(rawLocal, defaultMediaItems, deletedIds);
  if (!supabase) return local;

  try {
    const { data, error } = await supabase
      .from("media_library")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      const mapped: MediaItem[] = data.map((row) => ({
        id: row.id,
        title: row.title || row.filename,
        filename: row.filename,
        url: row.url,
        storagePath: row.storage_path,
        fileSize: row.file_size,
        mimeType: row.mime_type || "image/jpeg",
        category: row.category || "other",
        alt: row.alt || "",
        fit: row.fit || "cover",
        position: row.position || "center",
        createdAt: row.created_at || new Date().toISOString(),
        updatedAt: row.updated_at || new Date().toISOString(),
      }));

      // Filter out deleted IDs from database records as well
      const activeMapped = mapped.filter((m) => !deletedIds.has(m.id));
      const completeList = mergeMediaItems(activeMapped, defaultMediaItems, deletedIds);
      writeLocal(CMS_STORAGE_KEY_MEDIA, completeList);

      // Check if any default items are missing from Supabase (excluding deleted items)
      const dbIds = new Set(mapped.map((m) => m.id));
      const missingFromDb = defaultMediaItems.filter(
        (d) => !dbIds.has(d.id) && !deletedIds.has(d.id)
      );

      if (missingFromDb.length > 0) {
        syncMissingMediaToSupabase(missingFromDb).catch(() => {});
      }

      return completeList;
    }
  } catch {
    // Non-blocking fallback
  }

  writeLocal(CMS_STORAGE_KEY_MEDIA, local);
  return local;
};

export const saveMediaItem = async (item: MediaItem): Promise<MediaItem> => {
  await assertAdminAal2();
  const client = getSupabaseOrThrow();

  const { error } = await client.from("media_library").upsert({
    id: item.id,
    title: item.title,
    filename: item.filename,
    url: item.url,
    storage_path: item.storagePath,
    file_size: item.fileSize,
    mime_type: item.mimeType,
    category: item.category,
    alt: item.alt,
    fit: item.fit,
    position: item.position,
    updated_at: new Date().toISOString(),
  });

  if (error) {
    throw new Error(
      `Failed to save media asset to Supabase (${error.message}, code: ${error.code || "ERR"}). Ensure migration 016 has been run in Supabase SQL Editor.`
    );
  }

  const current = await fetchMediaLibrary();
  const existingIndex = current.findIndex((m) => m.id === item.id);
  const updatedList =
    existingIndex >= 0
      ? current.map((m) => (m.id === item.id ? item : m))
      : [item, ...current];

  writeLocal(CMS_STORAGE_KEY_MEDIA, updatedList);
  notifyListeners();
  return item;
};

export const removeMediaItemFromLibrary = async (id: string): Promise<void> => {
  await assertAdminAal2();
  const client = getSupabaseOrThrow();
  const current = await fetchMediaLibrary();
  const target = current.find((m) => m.id === id);

  if (!target) {
    throw new Error(`Media asset with ID "${id}" was not found.`);
  }

  // Remove metadata row from Supabase media_library table (verified)
  const { data: existingRow } = await client
    .from("media_library")
    .select("id")
    .eq("id", id)
    .maybeSingle();

  if (existingRow) {
    const { data: deletedRows, error: deleteErr } = await client
      .from("media_library")
      .delete()
      .eq("id", id)
      .select();

    if (deleteErr) {
      throw new Error(`Failed to remove media asset from Supabase: ${deleteErr.message}`);
    }

    if (!deletedRows || deletedRows.length === 0) {
      throw new Error(
        "Supabase security policy prevented removing this media asset. Ensure you are signed in with an active AAL2 administrator session."
      );
    }
  }

  // Record deleted ID to prevent resurrection from defaultMediaItems or database sync
  await recordDeletedMediaId(id);

  // Update local cache and notify listeners without touching storage files or public references
  const updatedList = current.filter((m) => m.id !== id);
  writeLocal(CMS_STORAGE_KEY_MEDIA, updatedList);
  notifyListeners();
};

export const deleteMediaItemPermanently = async (id: string): Promise<void> => {
  await assertAdminAal2();
  const client = getSupabaseOrThrow();
  const current = await fetchMediaLibrary();
  const target = current.find((m) => m.id === id);

  if (!target) {
    throw new Error(`Media asset with ID "${id}" was not found.`);
  }

  // Safety Check: In-Use Protection
  const [homepage, storefront, settings] = await Promise.all([
    fetchHomepageContent(),
    fetchStorefrontContent(),
    fetchSiteSettings(),
  ]);

  const usages = getMediaAssetUsages(target, homepage, storefront, settings);
  if (usages.length > 0) {
    const locationsSummary = usages.map((u) => u.location).join(", ");
    throw new Error(
      `Cannot delete "${target.title}" permanently: this asset is actively used on the live website in ${locationsSummary}. To delete permanently, replace or unlink it first, or use "Remove from Library" to safely hide it from this view.`
    );
  }

  // Safe Storage Deletion: Only remove managed uploads from storage, and only if not shared
  if (target.storagePath && target.storagePath.startsWith("media/")) {
    const isShared = current.some((m) => m.id !== id && m.storagePath === target.storagePath);
    if (!isShared) {
      const { error: removeErr } = await client.storage
        .from(productImagesBucket)
        .remove([target.storagePath]);
      if (removeErr) {
        console.warn("Storage removal warning:", removeErr.message);
      }
    }
  }

  // Delete from Supabase media_library table with verification
  const { data: existingRow } = await client
    .from("media_library")
    .select("id")
    .eq("id", id)
    .maybeSingle();

  if (existingRow) {
    const { data: deletedRows, error: deleteErr } = await client
      .from("media_library")
      .delete()
      .eq("id", id)
      .select();

    if (deleteErr) {
      throw new Error(`Failed to delete media asset from Supabase: ${deleteErr.message}`);
    }

    if (!deletedRows || deletedRows.length === 0) {
      throw new Error(
        "Supabase security policy prevented deleting this media asset. Ensure you are signed in with an active AAL2 administrator session."
      );
    }
  }

  // Record deleted ID to prevent resurrection from defaultMediaItems
  await recordDeletedMediaId(id);

  const updatedList = current.filter((m) => m.id !== id);
  writeLocal(CMS_STORAGE_KEY_MEDIA, updatedList);
  notifyListeners();
};

export const deleteMediaItemById = deleteMediaItemPermanently;

const imageExtensions: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
};

const hasValidImageSignature = async (file: File): Promise<boolean> => {
  const bytes = new Uint8Array(await file.slice(0, 16).arrayBuffer());
  if (file.type === "image/jpeg") {
    return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  }
  if (file.type === "image/png") {
    return [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a].every(
      (v, i) => bytes[i] === v
    );
  }
  if (file.type === "image/webp") {
    return (
      String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" &&
      String.fromCharCode(...bytes.slice(8, 12)) === "WEBP"
    );
  }
  if (file.type === "image/avif") {
    return (
      String.fromCharCode(...bytes.slice(4, 8)) === "ftyp" &&
      ["avif", "avis"].includes(String.fromCharCode(...bytes.slice(8, 12)))
    );
  }
  return false;
};

export const uploadMediaAsset = async (
  file: File,
  category: MediaItem["category"] = "other",
  customTitle?: string
): Promise<MediaItem> => {
  await assertAdminAal2();
  const client = getSupabaseOrThrow();

  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/avif"];
  const maxBytes = 5 * 1024 * 1024; // 5 MB

  if (!allowedTypes.includes(file.type)) {
    throw new Error("Only JPEG, PNG, WebP and AVIF formats are allowed.");
  }
  if (file.size > maxBytes) {
    throw new Error("Image file exceeds the 5MB upload limit.");
  }
  if (!(await hasValidImageSignature(file))) {
    throw new Error("Invalid image header signature. Please choose an authentic image file.");
  }

  if (isLocalAdminActive()) {
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ""));
      reader.onerror = () => reject(new Error("Could not read uploaded image."));
      reader.readAsDataURL(file);
    });
    const localMediaItem: MediaItem = {
      id: `media-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      title: customTitle || file.name.replace(/\.[^.]+$/, ""),
      filename: file.name,
      url: dataUrl,
      fileSize: file.size,
      mimeType: file.type,
      category,
      alt: customTitle || `${file.name} asset`,
      fit: "cover",
      position: "center",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const current = getInitialMediaLibrary();
    writeLocal(CMS_STORAGE_KEY_MEDIA, [localMediaItem, ...current]);
    notifyListeners();
    return localMediaItem;
  }

  const ext = imageExtensions[file.type] || "jpg";
  const cleanBase = file.name
    .toLowerCase()
    .replace(/\.[^.]+$/, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60) || "asset";
  const safeFilename = `${cleanBase}.${ext}`;
  const storagePath = `media/${category}/${Date.now()}-${safeFilename}`;

  const { error: uploadErr } = await client.storage
    .from(productImagesBucket)
    .upload(storagePath, file, {
      cacheControl: "31536000",
      upsert: false,
      contentType: file.type,
    });

  if (uploadErr) {
    throw new Error(`Failed to upload asset to Supabase Storage: ${uploadErr.message}`);
  }

  const { data: urlData } = client.storage
    .from(productImagesBucket)
    .getPublicUrl(storagePath);

  const newMediaItem: MediaItem = {
    id: `media-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    title: customTitle || file.name.replace(/\.[^.]+$/, ""),
    filename: file.name,
    url: urlData.publicUrl,
    storagePath,
    fileSize: file.size,
    mimeType: file.type,
    category,
    alt: customTitle || `${file.name} asset`,
    fit: "cover",
    position: "center",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await saveMediaItem(newMediaItem);
  return newMediaItem;
};

export const updateMediaAsset = async (
  id: string,
  updates: {
    title?: string;
    alt?: string;
    category?: MediaItem["category"];
    fit?: "cover" | "contain";
    position?: "center" | "top" | "bottom";
  },
  replacementFile?: File
): Promise<MediaItem> => {
  await assertAdminAal2();
  const client = getSupabaseOrThrow();

  const currentList = await fetchMediaLibrary();
  const existing = currentList.find((m) => m.id === id);
  if (!existing) {
    throw new Error(`Media asset with ID "${id}" was not found.`);
  }

  let finalUrl = existing.url;
  let finalStoragePath = existing.storagePath;
  let finalFileSize = existing.fileSize;
  let finalMimeType = existing.mimeType;
  let finalFilename = existing.filename;

  if (replacementFile) {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/avif"];
    const maxBytes = 5 * 1024 * 1024; // 5 MB

    if (!allowedTypes.includes(replacementFile.type)) {
      throw new Error("Only JPEG, PNG, WebP and AVIF formats are allowed.");
    }
    if (replacementFile.size > maxBytes) {
      throw new Error("Replacement image exceeds the 5MB upload limit.");
    }
    if (!(await hasValidImageSignature(replacementFile))) {
      throw new Error("Invalid image header signature. Please choose an authentic image file.");
    }

    const cat = updates.category || existing.category || "other";
    const ext = imageExtensions[replacementFile.type] || "jpg";
    const cleanBase = replacementFile.name
      .toLowerCase()
      .replace(/\.[^.]+$/, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 60) || "asset";
    const safeFilename = `${cleanBase}.${ext}`;
    const storagePath = `media/${cat}/${Date.now()}-${safeFilename}`;

    const { error: uploadErr } = await client.storage
      .from(productImagesBucket)
      .upload(storagePath, replacementFile, {
        cacheControl: "31536000",
        upsert: false,
        contentType: replacementFile.type,
      });

    if (uploadErr) {
      throw new Error(`Failed to upload replacement asset to Supabase Storage: ${uploadErr.message}`);
    }

    const { data: urlData } = client.storage
      .from(productImagesBucket)
      .getPublicUrl(storagePath);

    // If there was an old Supabase storage object, remove it
    if (existing.storagePath && existing.storagePath.startsWith("media/")) {
      await client.storage.from(productImagesBucket).remove([existing.storagePath]).catch(() => {});
    }

    finalUrl = urlData.publicUrl;
    finalStoragePath = storagePath;
    finalFileSize = replacementFile.size;
    finalMimeType = replacementFile.type;
    finalFilename = replacementFile.name;
  }

  const updatedItem: MediaItem = {
    ...existing,
    title: updates.title !== undefined ? updates.title.trim() : existing.title,
    alt: updates.alt !== undefined ? updates.alt.trim() : existing.alt,
    category: updates.category || existing.category,
    fit: updates.fit || existing.fit || "cover",
    position: updates.position || existing.position || "center",
    url: finalUrl,
    filename: finalFilename,
    storagePath: finalStoragePath,
    fileSize: finalFileSize,
    mimeType: finalMimeType,
    updatedAt: new Date().toISOString(),
  };

  const { error: dbErr } = await client.from("media_library").upsert({
    id: updatedItem.id,
    title: updatedItem.title,
    filename: updatedItem.filename,
    url: updatedItem.url,
    storage_path: updatedItem.storagePath,
    file_size: updatedItem.fileSize,
    mime_type: updatedItem.mimeType,
    category: updatedItem.category,
    alt: updatedItem.alt,
    fit: updatedItem.fit,
    position: updatedItem.position,
    updated_at: updatedItem.updatedAt,
  });

  if (dbErr) {
    throw new Error(`Failed to save asset updates to Supabase (${dbErr.message}).`);
  }

  const updatedList = currentList.map((m) => (m.id === id ? updatedItem : m));
  writeLocal(CMS_STORAGE_KEY_MEDIA, updatedList);
  notifyListeners();

  if (finalUrl !== existing.url) {
    await cascadeMediaUrlUpdate(existing, updatedItem, updates);
  }

  return updatedItem;
};

// 4. FAQS
export const getInitialFaqs = (): FaqItem[] =>
  readLocal<FaqItem[]>(CMS_STORAGE_KEY_FAQS, defaultFaqs);

export const fetchFaqs = async (): Promise<FaqItem[]> => {
  const local = getInitialFaqs();
  if (!supabase) return local;

  try {
    const { data, error } = await supabase
      .from("site_faqs")
      .select("*")
      .order("order", { ascending: true });

    if (!error && data && data.length > 0) {
      writeLocal(CMS_STORAGE_KEY_FAQS, data);
      return data as FaqItem[];
    }
  } catch {
    // Non-blocking fallback
  }

  return local;
};

export const saveFaqs = async (faqs: FaqItem[]): Promise<FaqItem[]> => {
  await assertAdminAal2();
  const client = getSupabaseOrThrow();

  const { error } = await client.from("site_faqs").upsert(faqs);
  if (error) {
    throw new Error(
      `Failed to save FAQs to Supabase (${error.message}, code: ${error.code || "ERR"}). Ensure migration 016 has been run in Supabase SQL Editor.`
    );
  }

  writeLocal(CMS_STORAGE_KEY_FAQS, faqs);
  broadcastPublishedUpdate("homepage");
  notifyListeners();
  return faqs;
};

// 5. PAGE CONTENT (About, Repairs, Trade-In)
export const getInitialPageContent = (): PageContentRegistry =>
  readLocal<PageContentRegistry>(CMS_STORAGE_KEY_PAGES, defaultPageContent);

export const fetchPageContent = async (): Promise<PageContentRegistry> => {
  const local = getInitialPageContent();
  if (!supabase) return local;

  try {
    const { data, error } = await supabase
      .from("page_content")
      .select("id, content");

    if (!error && data && data.length > 0) {
      const merged: PageContentRegistry = { ...defaultPageContent, ...local };
      data.forEach((row) => {
        if (row.id in merged && row.content) {
          (merged as unknown as Record<string, unknown>)[row.id] = {
            ...((defaultPageContent as unknown as Record<string, unknown>)[row.id] || {}),
            ...row.content,
          };
        }
      });
      writeLocal(CMS_STORAGE_KEY_PAGES, merged);
      return merged;
    }
  } catch {
    // Non-blocking fallback
  }

  return local;
};

export const savePageContent = async <K extends keyof PageContentRegistry>(
  key: K,
  content: PageContentRegistry[K]
): Promise<PageContentRegistry[K]> => {
  await assertAdminAal2();
  const client = getSupabaseOrThrow();

  const { error } = await client.from("page_content").upsert({
    id: key,
    content,
    updated_at: new Date().toISOString(),
  });

  if (error) {
    throw new Error(
      `Failed to save ${String(key)} page content to Supabase (${error.message}, code: ${error.code || "ERR"}). Ensure migration 016 has been run in Supabase SQL Editor.`
    );
  }

  const current = await fetchPageContent();
  const updated = { ...current, [key]: content };
  writeLocal(CMS_STORAGE_KEY_PAGES, updated);
  broadcastPublishedUpdate("homepage");
  notifyListeners();
  return content;
};

// 6. STOREFRONT CONTENT (Category Departments & Showcase Collections)
const mergeStorefrontWithDefaults = (source: Record<string, CategoryDepartmentConfig>) => {
  const res: Record<string, CategoryDepartmentConfig> = { ...CATEGORY_DEPARTMENTS };
  for (const [key, def] of Object.entries(CATEGORY_DEPARTMENTS)) {
    const s = source[key];
    if (s) {
      res[key] = {
        ...def,
        ...s,
        featuredCards: s.featuredCards && s.featuredCards.length > 0 ? s.featuredCards : def.featuredCards,
        accessoryOverrides: {
          ...(def.accessoryOverrides || {}),
          ...(s.accessoryOverrides || {}),
        },
      };
    }
  }
  return res;
};

export const getInitialStorefrontContent = (): Record<string, CategoryDepartmentConfig> => {
  const local = readLocal<Record<string, CategoryDepartmentConfig>>(CMS_STORAGE_KEY_STOREFRONT, CATEGORY_DEPARTMENTS);
  return mergeStorefrontWithDefaults(local);
};

export const fetchStorefrontContent = async (): Promise<Record<string, CategoryDepartmentConfig>> => {
  const mergedLocal = getInitialStorefrontContent();
  if (!supabase) return mergedLocal;

  try {
    const { data, error } = await supabase
      .from("storefront_content")
      .select("config")
      .eq("key", "departments")
      .maybeSingle();

    if (!error && data?.config) {
      const merged = mergeStorefrontWithDefaults(data.config as Record<string, CategoryDepartmentConfig>);
      writeLocal(CMS_STORAGE_KEY_STOREFRONT, merged);
      return merged;
    }
  } catch {
    // Non-blocking fallback
  }

  return mergedLocal;
};

export const saveStorefrontContent = async (
  departments: Record<string, CategoryDepartmentConfig>
): Promise<Record<string, CategoryDepartmentConfig>> => {
  await assertAdminAal2();
  const client = getSupabaseOrThrow();

  const { error } = await client.from("storefront_content").upsert({
    key: "departments",
    config: departments,
    updated_at: new Date().toISOString(),
  });

  if (error) {
    if (isLocalAdminActive()) {
      writeLocal(CMS_STORAGE_KEY_STOREFRONT, departments);
      broadcastPublishedUpdate("storefront");
      notifyListeners();
      return departments;
    }
    throw new Error(
      `Failed to save storefront departments to Supabase (${error.message}, code: ${error.code || "ERR"}). Ensure migration 016 has been run in Supabase SQL Editor.`
    );
  }

  writeLocal(CMS_STORAGE_KEY_STOREFRONT, departments);
  broadcastPublishedUpdate("storefront");
  notifyListeners();
  return departments;
};

// 7. MAIN STORE PAGE CONTENT (Store Landing Page & Section Builder)
const normalizeStorePageSection = (section: Partial<StorePageSection>, idx: number): StorePageSection => {
  const def = section.builtInKey
    ? defaultStorePageSections.find((d) => d.builtInKey === section.builtInKey)
    : defaultStorePageSections.find((d) => d.id === section.id);

  return {
    id: section.id || def?.id || `store-section-${idx + 1}`,
    type: section.type || def?.type || "featured-products",
    builtInKey: section.builtInKey ?? def?.builtInKey,
    eyebrow: section.eyebrow !== undefined ? section.eyebrow : (def?.eyebrow || ""),
    heading: section.heading !== undefined ? section.heading : (def?.heading || "Store Section"),
    subtitle: section.subtitle !== undefined ? section.subtitle : (def?.subtitle || ""),
    description: section.description !== undefined ? section.description : (def?.description || ""),
    desktopImage: section.desktopImage !== undefined ? section.desktopImage : (def?.desktopImage || ""),
    mobileImage: section.mobileImage !== undefined ? section.mobileImage : (def?.mobileImage || ""),
    imageAlt: section.imageAlt !== undefined ? section.imageAlt : (def?.imageAlt || section.heading || "Store section image"),
    backgroundColor: section.backgroundColor || def?.backgroundColor || "#ffffff",
    textAlignment: section.textAlignment || def?.textAlignment || "left",
    productIds: Array.isArray(section.productIds) ? section.productIds : (def?.productIds || []),
    buttonLabel: section.buttonLabel !== undefined ? section.buttonLabel : (def?.buttonLabel || ""),
    buttonDestination: section.buttonDestination !== undefined ? section.buttonDestination : (def?.buttonDestination || ""),
    secondaryButtonLabel: section.secondaryButtonLabel ?? def?.secondaryButtonLabel ?? "",
    secondaryButtonDestination: section.secondaryButtonDestination ?? def?.secondaryButtonDestination ?? "",
    layoutStyle: section.layoutStyle || def?.layoutStyle || "standard",
    visible: section.visible !== false,
    order: typeof section.order === "number" ? section.order : idx,
  };
};

const mergeMainStoreWithDefaults = (source?: Partial<MainStoreConfig> | null): MainStoreConfig => {
  if (!source) return defaultMainStoreConfig;

  const sections =
    Array.isArray(source.sections) && source.sections.length > 0
      ? source.sections.map((sec, idx) => normalizeStorePageSection(sec, idx))
      : defaultStorePageSections.map((sec, idx) => normalizeStorePageSection(sec, idx));

  const productFamilies = defaultMainStoreConfig.productFamilies.map((def) => {
    const s = (source.productFamilies || []).find((item) => item.id === def.id);
    return s ? { ...def, ...s } : def;
  });

  const latestCards = defaultMainStoreConfig.latestCards.map((def) => {
    const s = (source.latestCards || []).find((item) => item.id === def.id);
    return s ? { ...def, ...s } : def;
  });

  const categoryCards = defaultMainStoreConfig.categoryCards.map((def) => {
    const s = (source.categoryCards || []).find((item) => item.id === def.id);
    return s ? { ...def, ...s } : def;
  });

  const moreToLoveCards = defaultMainStoreConfig.moreToLoveCards.map((def) => {
    const s = (source.moreToLoveCards || []).find((item) => item.id === def.id);
    return s ? { ...def, ...s } : def;
  });

  const accessories = defaultMainStoreConfig.accessories.map((def) => {
    const s = (source.accessories || []).find((item) => item.id === def.id);
    return s ? { ...def, ...s } : def;
  });

  return {
    sections,
    productFamilies,
    latestCards,
    categoryCards,
    moreToLoveCards,
    accessories,
    hasDraft: Boolean(source.hasDraft),
    updatedAt: source.updatedAt,
  };
};

export const getInitialMainStoreContent = (): MainStoreConfig => {
  try {
    if (
      typeof window !== "undefined" &&
      (isLocalAdminActive() || localStorage.getItem("admin_preview_active") === "1")
    ) {
      const localPubRaw = localStorage.getItem(CMS_STORAGE_KEY_MAIN_STORE_LOCAL_PUB);
      if (localPubRaw && localPubRaw.startsWith("{")) {
        return mergeMainStoreWithDefaults(JSON.parse(localPubRaw) as Partial<MainStoreConfig>);
      }
    }
  } catch {
    // ignore
  }
  const local = readLocal<MainStoreConfig>(CMS_STORAGE_KEY_MAIN_STORE, defaultMainStoreConfig);
  return mergeMainStoreWithDefaults(local);
};

export const getInitialMainStoreDraft = (): MainStoreConfig | null => {
  try {
    const raw = localStorage.getItem(CMS_STORAGE_KEY_MAIN_STORE_DRAFT);
    if (!raw) return null;
    return mergeMainStoreWithDefaults(JSON.parse(raw) as Partial<MainStoreConfig>);
  } catch {
    return null;
  }
};

export const fetchMainStoreContent = async (): Promise<MainStoreConfig> => {
  const mergedLocal = getInitialMainStoreContent();
  try {
    if (
      typeof window !== "undefined" &&
      Boolean(localStorage.getItem(CMS_STORAGE_KEY_MAIN_STORE_LOCAL_PUB)) &&
      (isLocalAdminActive() || localStorage.getItem("admin_preview_active") === "1")
    ) {
      return mergedLocal;
    }
  } catch {
    // ignore
  }
  if (!supabase) return mergedLocal;

  try {
    const { data, error } = await supabase
      .from("storefront_content")
      .select("config")
      .eq("key", "main_store")
      .maybeSingle();

    if (!error && data?.config) {
      if (
        typeof window !== "undefined" &&
        Boolean(localStorage.getItem(CMS_STORAGE_KEY_MAIN_STORE_LOCAL_PUB)) &&
        (isLocalAdminActive() || localStorage.getItem("admin_preview_active") === "1")
      ) {
        return getInitialMainStoreContent();
      }
      const merged = mergeMainStoreWithDefaults(data.config as Partial<MainStoreConfig>);
      writeLocal(CMS_STORAGE_KEY_MAIN_STORE, merged);
      return merged;
    }
  } catch {
    // Non-blocking fallback
  }

  return getInitialMainStoreContent();
};

export const fetchMainStoreDraft = async (): Promise<MainStoreConfig | null> => {
  const localDraft = getInitialMainStoreDraft();
  if (isLocalAdminActive() || !supabase) {
    return localDraft;
  }

  try {
    const { data, error } = await supabase
      .from("storefront_content")
      .select("config")
      .eq("key", "main_store_draft")
      .maybeSingle();

    if (!error && data?.config) {
      const merged = mergeMainStoreWithDefaults({
        ...(data.config as Partial<MainStoreConfig>),
        hasDraft: true,
      });
      writeLocal(CMS_STORAGE_KEY_MAIN_STORE_DRAFT, merged);
      return merged;
    }
  } catch {
    // Non-blocking fallback
  }

  return localDraft;
};

export const saveMainStoreDraft = async (
  config: MainStoreConfig
): Promise<MainStoreConfig> => {
  await assertAdminAal2();
  const normalized = mergeMainStoreWithDefaults({
    ...config,
    hasDraft: true,
    updatedAt: new Date().toISOString(),
  });

  if (isLocalAdminActive()) {
    writeLocal(CMS_STORAGE_KEY_MAIN_STORE_DRAFT, normalized);
    notifyListeners();
    return normalized;
  }

  const client = getSupabaseOrThrow();
  const { error } = await client.from("storefront_content").upsert({
    key: "main_store_draft",
    config: normalized,
    updated_at: normalized.updatedAt,
  });

  if (error) {
    throw new Error(
      `Failed to save Store Page draft to Supabase (${error.message}, code: ${error.code || "ERR"}).`
    );
  }

  writeLocal(CMS_STORAGE_KEY_MAIN_STORE_DRAFT, normalized);
  notifyListeners();
  return normalized;
};

export const discardMainStoreDraft = async (): Promise<void> => {
  await assertAdminAal2();
  try {
    localStorage.removeItem(CMS_STORAGE_KEY_MAIN_STORE_DRAFT);
  } catch {
    // ignore
  }
  if (!isLocalAdminActive() && supabase) {
    try {
      await supabase.from("storefront_content").delete().eq("key", "main_store_draft");
    } catch {
      // ignore
    }
  }
  notifyListeners();
};

export const saveMainStoreContent = async (
  config: MainStoreConfig
): Promise<MainStoreConfig> => {
  await assertAdminAal2();
  const normalized = mergeMainStoreWithDefaults({
    ...config,
    hasDraft: false,
    updatedAt: new Date().toISOString(),
  });

  if (isLocalAdminActive()) {
    writeLocal(CMS_STORAGE_KEY_MAIN_STORE, normalized);
    writeLocal(CMS_STORAGE_KEY_MAIN_STORE_LOCAL_PUB, normalized);
    try {
      localStorage.removeItem(CMS_STORAGE_KEY_MAIN_STORE_DRAFT);
    } catch {
      // ignore
    }
    broadcastPublishedUpdate("main-store");
    notifyListeners();
    return normalized;
  }

  const client = getSupabaseOrThrow();
  const { error } = await client.from("storefront_content").upsert({
    key: "main_store",
    config: normalized,
    updated_at: normalized.updatedAt,
  });

  if (error) {
    throw new Error(
      `Failed to publish Store Page configuration to Supabase (${error.message}, code: ${error.code || "ERR"}). Ensure migration 016 has been run in Supabase SQL Editor.`
    );
  }

  try {
    await client.from("storefront_content").delete().eq("key", "main_store_draft");
  } catch {
    // ignore
  }

  writeLocal(CMS_STORAGE_KEY_MAIN_STORE, normalized);
  try {
    localStorage.removeItem(CMS_STORAGE_KEY_MAIN_STORE_DRAFT);
  } catch {
    // ignore
  }
  broadcastPublishedUpdate("main-store");
  notifyListeners();
  return normalized;
};

// Cascades replaced media URLs to homepage content and storefront departments
async function cascadeMediaUrlUpdate(
  oldItem: MediaItem,
  newItem: MediaItem,
  updates: { alt?: string }
): Promise<void> {
  if (newItem.url === oldItem.url) return;

  try {
    // 1. Homepage content cascade (heroes, tiles, service flyers)
    const currentHomepage = await fetchHomepageContent();
    let homepageChanged = false;

    const updatedHeroes = currentHomepage.heroes.map((hero) => {
      let heroUpdated = false;
      let newImage = hero.image;
      let newMobile = hero.mobileImage;

      const isDesktopMatch =
        hero.image === oldItem.url ||
        (oldItem.id === "media-hero-iphone18" && hero.id === "iphone-18-pro") ||
        (oldItem.id.startsWith("media-hero-") && !oldItem.id.endsWith("-mobile") && hero.id === oldItem.id.replace("media-hero-", ""));

      const isMobileMatch =
        hero.mobileImage === oldItem.url ||
        (oldItem.id === "media-hero-iphone18-mobile" && hero.id === "iphone-18-pro") ||
        (oldItem.id.startsWith("media-hero-") && oldItem.id.endsWith("-mobile") && hero.id === oldItem.id.replace("media-hero-", "").replace("-mobile", ""));

      if (isDesktopMatch) {
        newImage = newItem.url;
        heroUpdated = true;
      }
      if (isMobileMatch) {
        newMobile = newItem.url;
        heroUpdated = true;
      }
      if (heroUpdated) {
        homepageChanged = true;
        return {
          ...hero,
          image: newImage,
          mobileImage: newMobile,
          alt: updates.alt !== undefined ? updates.alt.trim() : hero.alt,
        };
      }
      return hero;
    });

    const updatedTiles = currentHomepage.tiles.map((tile) => {
      if (
        tile.image === oldItem.url ||
        (oldItem.id === "media-tile-ipad-air" && tile.id === "ipad-air") ||
        (oldItem.id === "media-product-ipad-air-white" && tile.id === "ipad-air") ||
        (oldItem.id.startsWith("media-tile-") && tile.id === oldItem.id.replace("media-tile-", ""))
      ) {
        homepageChanged = true;
        return {
          ...tile,
          image: newItem.url,
          alt: updates.alt !== undefined ? updates.alt.trim() : tile.alt,
        };
      }
      return tile;
    });

    const updatedFlyers = (currentHomepage.serviceFlyers || []).map((flyer) => {
      if (
        flyer.image === oldItem.url ||
        (oldItem.id.startsWith("media-flyer-") && flyer.id === oldItem.id.replace("media-flyer-", ""))
      ) {
        homepageChanged = true;
        return {
          ...flyer,
          image: newItem.url,
          alt: updates.alt !== undefined ? updates.alt.trim() : flyer.alt,
        };
      }
      return flyer;
    });

    if (homepageChanged) {
      await saveHomepageContent({
        ...currentHomepage,
        heroes: updatedHeroes,
        tiles: updatedTiles,
        serviceFlyers: updatedFlyers,
      });
    }

    // 2. Storefront content cascade (department featured cards and accessory overrides)
    const currentStorefront = await fetchStorefrontContent();
    let storefrontChanged = false;
    const updatedStorefront: Record<string, CategoryDepartmentConfig> = {};

    for (const [deptKey, dept] of Object.entries(currentStorefront)) {
      const updatedCards = dept.featuredCards.map((card) => {
        if (
          card.image === oldItem.url ||
          (oldItem.id === "media-tile-ipad-air" && card.id.includes("ipad-air")) ||
          (oldItem.id === "media-product-ipad-air-colors" && (card.image.includes("ipad-air-colors") || card.id.includes("ipad-air"))) ||
          (oldItem.id && card.id && (card.id === oldItem.id || oldItem.id.endsWith(card.id)))
        ) {
          storefrontChanged = true;
          return {
            ...card,
            image: newItem.url,
            alt: updates.alt !== undefined ? updates.alt.trim() : card.alt,
          };
        }
        return card;
      });

      const updatedOverrides = { ...(dept.accessoryOverrides || {}) };
      for (const [accSlug, override] of Object.entries(updatedOverrides)) {
        if (override.image === oldItem.url || oldItem.id.includes(accSlug) || oldItem.filename.includes(accSlug)) {
          storefrontChanged = true;
          updatedOverrides[accSlug] = {
            ...override,
            image: newItem.url,
            alt: updates.alt !== undefined ? updates.alt.trim() : override.alt,
          };
        }
      }

      updatedStorefront[deptKey] = {
        ...dept,
        featuredCards: updatedCards,
        accessoryOverrides: updatedOverrides,
      };
    }

    if (storefrontChanged) {
      await saveStorefrontContent(updatedStorefront);
    }

    // 2b. Main Store page content cascade
    const currentMainStore = await fetchMainStoreContent();
    let mainStoreChanged = false;

    const nextFamilies = currentMainStore.productFamilies.map((f) => {
      if (f.image === oldItem.url) {
        mainStoreChanged = true;
        return { ...f, image: newItem.url, alt: updates.alt !== undefined ? updates.alt.trim() : f.alt };
      }
      return f;
    });

    const nextLatest = currentMainStore.latestCards.map((c) => {
      if (c.image === oldItem.url) {
        mainStoreChanged = true;
        return { ...c, image: newItem.url, alt: updates.alt !== undefined ? updates.alt.trim() : c.alt };
      }
      return c;
    });

    const nextCategories = currentMainStore.categoryCards.map((c) => {
      if (c.image === oldItem.url) {
        mainStoreChanged = true;
        return { ...c, image: newItem.url, alt: updates.alt !== undefined ? updates.alt.trim() : c.alt };
      }
      return c;
    });

    const nextMore = currentMainStore.moreToLoveCards.map((c) => {
      if (c.image === oldItem.url) {
        mainStoreChanged = true;
        return { ...c, image: newItem.url, alt: updates.alt !== undefined ? updates.alt.trim() : c.alt };
      }
      return c;
    });

    const nextAccessories = currentMainStore.accessories.map((a) => {
      if (a.image === oldItem.url) {
        mainStoreChanged = true;
        return { ...a, image: newItem.url, alt: updates.alt !== undefined ? updates.alt.trim() : a.alt };
      }
      return a;
    });

    if (mainStoreChanged) {
      await saveMainStoreContent({
        productFamilies: nextFamilies,
        latestCards: nextLatest,
        categoryCards: nextCategories,
        moreToLoveCards: nextMore,
        accessories: nextAccessories,
      });
    }

    // 3. Products table cascade (update any product referencing this image in Supabase)
    if (supabase) {
      try {
        const { data: dbProducts } = await supabase
          .from("products")
          .select("id, images");

        if (dbProducts) {
          for (const prod of dbProducts) {
            const rawImages = Array.isArray(prod.images) ? prod.images : [];
            let prodChanged = false;
            const nextImages = rawImages.map((img: { src?: string; alt?: string }) => {
              if (img?.src === oldItem.url) {
                prodChanged = true;
                return {
                  ...img,
                  src: newItem.url,
                  alt: updates.alt !== undefined ? updates.alt.trim() : img.alt,
                };
              }
              return img;
            });

            if (prodChanged) {
              await supabase
                .from("products")
                .update({ images: nextImages, updated_at: new Date().toISOString() })
                .eq("id", prod.id);
            }
          }
        }
      } catch (prodCascadeErr) {
        console.warn("Product image cascade update failed:", prodCascadeErr);
      }
    }
  } catch (cascadeErr) {
    console.warn("Cascade URL update to content failed:", cascadeErr);
  }
}

