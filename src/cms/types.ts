export type Tone = "dark" | "light" | "mist";

export interface ActionLink {
  label: string;
  to: string;
}

import type { ProductFamilyKey } from "../catalog/productExperience";

export type CustomSectionLayoutVariant =
  | "full-hero"
  | "product-showcase"
  | "split-left"
  | "split-right"
  | "gift-showcase"
  | "promo-banner"
  | "compact-banner"
  | "gallery"
  | "video-showcase"
  | "editorial";

export type CustomSectionPlacement =
  | "before-heroes"
  | "after-hero-1"
  | "after-heroes"
  | "after-tiles"
  | "before-services"
  | "after-services";

export interface CustomSectionGalleryImage {
  src: string;
  alt?: string;
  caption?: string;
}

export interface ResponsiveImageTransform {
  /** Uniform proportional desktop scale percentage (50–160, default 100) */
  desktopScale?: number;
  /** Independent desktop horizontal offset percentage (-45 to +45, default 0) */
  desktopOffsetX?: number;
  /** Independent desktop vertical offset percentage (-45 to +45, default 0) */
  desktopOffsetY?: number;
  /** Uniform proportional mobile scale percentage (50–160, default 100) */
  mobileScale?: number;
  /** Independent mobile horizontal offset percentage (-45 to +45, default 0) */
  mobileOffsetX?: number;
  /** Independent mobile vertical offset percentage (-45 to +45, default 0) */
  mobileOffsetY?: number;
}

export interface HeroCampaign {
  id: string;
  internalName?: string;
  deviceName?: string;
  productId?: string;
  learnMoreSlug?: string;
  eyebrow?: string;
  title: string;
  subtitle: string;
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
  imageTransform?: ResponsiveImageTransform;
  primary: ActionLink;
  secondary?: ActionLink;
  placement?: "top" | "bottom";
  enabled: boolean;
  order: number;
}

export interface PromoTile {
  id: string;
  internalName?: string;
  deviceName?: string;
  productId?: string;
  learnMoreSlug?: string;
  eyebrow?: string;
  title: string;
  subtitle: string;
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
  imageTransform?: ResponsiveImageTransform;
  primary: ActionLink;
  secondary?: ActionLink;
  placement?: "top" | "bottom";
  enabled: boolean;
  order: number;
}

export interface CustomHomepageSection {
  id: string;
  internalName: string;
  deviceName?: string;
  productId?: string;
  learnMoreSlug?: string;
  eyebrow?: string;
  title: string;
  subtitle: string;
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
  imageTransform?: ResponsiveImageTransform;
  layoutVariant?: CustomSectionLayoutVariant;
  mobileLayout?: "stack" | "media-first" | "compact";
  containerWidth?: "full" | "wide" | "contained";
  sectionPlacement?: CustomSectionPlacement;
  minHeightDesktop?: number;
  minHeightMobile?: number;
  galleryImages?: CustomSectionGalleryImage[];
  primary: ActionLink;
  secondary?: ActionLink;
  extraActions?: ActionLink[];
  placement?: "top" | "bottom";
  enabled: boolean;
  order: number;
}

export interface ServiceFlyer {
  id: string;
  title: string;
  image: string;
  alt: string;
  to: string;
  backgroundColor?: string;
  enabled: boolean;
  order: number;
}

export type HomepageLayoutMode = "legacy" | "modular";

export type HomepageSectionType =
  | "apple-hero"              // Full-bleed cinematic flagship hero (iPhone 18 Pro, iPhone Duo)
  | "multi-promo-strip"       // Wide multi-image promotional campaign strip with central copy & CTA
  | "promo-banner"            // Legacy single-image promotional campaign banner
  | "apple-bento-grid"        // 2-column promotional campaign grid (6 independent tiles)
  | "story-carousel"          // Apple.com-style featured visual-content storytelling carousel
  | "footnotes"               // Apple-style legal footnotes and disclosures band above footer
  | "product-family-strip"    // Storefront product-family icon navigation (preserved for Store/Category phases)
  | "product-carousel"        // Live swipeable catalog product row (preserved for Store phases)
  | "accessories-collection"  // Curated original Apple accessories (preserved for Accessories/Store phases)
  | "promotional-carousel"    // Live Supabase marketing campaign flyers (preserved for Offers/Store phases)
  | "services-showcase"       // Ghana local services (preserved for Support/Store phases)
  | "trust-values";           // Inspection warranty, verified battery health (preserved for Support/Store phases)

export type HomepageSectionLayoutStyle =
  | "full-bleed"
  | "split"
  | "grid-2"
  | "grid-3"
  | "carousel"
  | "standard";

export type HomepageMediaFocalPoint = "center" | "top" | "bottom" | "left" | "right";

export type HomepageMediaFit = "cover" | "contain";

export type HomepageMediaMode = "image" | "video";

export interface HomepageBentoTile {
  id: string;
  eyebrow?: string;
  title: string;
  subtitle: string;
  description?: string;
  tone: Tone;
  backgroundColor?: string;
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
  imageAlt: string;
  focalPoint?: HomepageMediaFocalPoint;
  objectFit?: HomepageMediaFit;
  caption?: string;
  copyPlacement?: "top" | "bottom";
  primaryLabel: string;
  primaryDestination: string;
  secondaryLabel?: string;
  secondaryDestination?: string;
  productIds?: string[];
  visible: boolean;
  order: number;
}

export interface HomepageCarouselCard {
  id: string;
  categoryLabel: string;
  title: string;
  caption: string;
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
  imageAlt: string;
  focalPoint?: HomepageMediaFocalPoint;
  objectFit?: HomepageMediaFit;
  tone?: Tone;
  backgroundColor?: string;
  ctaLabel: string;
  ctaDestination: string;
  visible: boolean;
  order: number;
}

export interface HomepagePromoPanel {
  id: string;
  label: string;
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
  imageAlt: string;
  focalPoint?: HomepageMediaFocalPoint;
  objectFit?: HomepageMediaFit;
  backgroundColor?: string;
  destination?: string;
  visible: boolean;
  order: number;
}

export interface HomepageSection {
  id: string;
  type: HomepageSectionType;
  builtInKey?: string;
  eyebrow?: string;
  heading: string;
  subtitle?: string;
  description?: string;
  tone?: Tone;
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
  imageAlt?: string;
  focalPoint?: HomepageMediaFocalPoint;
  objectFit?: HomepageMediaFit;
  imageTransform?: ResponsiveImageTransform;
  caption?: string;
  copyPlacement?: "top" | "bottom";
  backgroundColor?: string;
  textAlignment?: "left" | "center" | "right";
  productIds?: string[];
  tiles?: HomepageBentoTile[];
  carouselCards?: HomepageCarouselCard[];
  promoPanels?: HomepagePromoPanel[];
  footnoteItems?: string[];
  buttonLabel?: string;
  buttonDestination?: string;
  secondaryButtonLabel?: string;
  secondaryButtonDestination?: string;
  layoutStyle?: HomepageSectionLayoutStyle;
  visible: boolean;
  order: number;
}

export interface HomepageContent {
  layoutMode?: HomepageLayoutMode;
  announcement: {
    enabled: boolean;
    text: string;
    linkText: string;
    linkTo: string;
  };
  heroes: HeroCampaign[];
  tiles: PromoTile[];
  customSections?: CustomHomepageSection[];
  serviceFlyers: ServiceFlyer[];
  sections?: HomepageSection[];
  hasDraft?: boolean;
  updatedAt?: string;
}

export interface SiteSettings {
  name: string;
  siteUrl: string;
  username: string;
  tagline: string;
  sellingPoint: string;
  location: string;
  address: string;
  email: string;
  phones: string[];
  whatsapp: {
    primary: string;
    secondary: string;
  };
  social: {
    instagram: string;
    tiktok: string;
    facebook?: string;
    youtube?: string;
  };
  hours: { day: string; time: string }[];
  deliveryNotice: string;
  paymentGuidance: string;
  warrantyNotice: string;
  deletedMediaIds?: string[];
}

export interface MediaItem {
  id: string;
  title: string;
  filename: string;
  url: string;
  storagePath?: string;
  fileSize?: number;
  mimeType: string;
  category: "hero" | "storefront" | "flyer" | "product" | "brand" | "other";
  alt: string;
  aspectRatio?: string;
  fit?: "cover" | "contain";
  position?: "center" | "top" | "bottom";
  createdAt: string;
  updatedAt: string;
}

export interface CategorySubnavItem {
  id: string;
  label: string;
  icon?: string;
}

export interface CategoryFeaturedCardData {
  id: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  price: string;
  badge?: string;
  image: string;
  alt: string;
  buyPath: string;
  buyLabel?: string;
  storyPath?: string;
  storyLabel?: string;
  isDark?: boolean;
  isViewPricingOnly?: boolean;
  order?: number;
}

export interface CategoryAccessoryOverride {
  id: string; // accessory slug, e.g. "apple-20w-usb-c-power-adapter"
  name?: string;
  image?: string;
  alt?: string;
  price?: string;
}

export interface CategoryDepartmentConfig {
  key: ProductFamilyKey;
  label: string;
  tagline: string;
  description: string;
  seoTitle: string;
  seoDescription: string;
  subnavItems: CategorySubnavItem[];
  featuredCards: CategoryFeaturedCardData[];
  catalogTitle: string;
  catalogSubtitle: string;
  storeCategoryFilter: string;
  accessoryOverrides?: Record<string, CategoryAccessoryOverride>;
}

export interface FaqItem {
  id: string;
  q: string;
  a: string;
  category?: string;
  order: number;
  enabled: boolean;
}

export interface AboutPageContent {
  eyebrow: string;
  title: string;
  subtitle: string;
  pillars: { title: string; description?: string }[];
}

export interface RepairsPageContent {
  title: string;
  description: string;
  guidance: string;
  assistance: string;
  turnaroundTime: string;
  supportedDevices: string[];
}

export interface TradeInPageContent {
  title: string;
  description: string;
  guidance: string;
  assistance: string;
  upgradeTitle: string;
  upgradeDescription: string;
  upgradeGuidance: string;
}

export interface InstallmentPlanConfig {
  title: string;
  description: string;
  guidance: string;
  assistance: string;
  depositPercentage: number;
  depositLabel: string;
  planHeading: string;
  planNotice: string;
  planDurations: string[];
  paymentFrequencies: string[];
  ghanaCardOptions: string[];
  disclaimer: string;
  explanatoryNote?: string;
}

export interface VisaCardPageContent {
  title: string;
  eyebrow: string;
  heading: string;
  subtitle: string;
  image: string;
  sideCardHeading: string;
  sideCardText: string;
  whatsappLabel: string;
}

export interface PreOrderPageContent {
  title: string;
  eyebrow: string;
  heading: string;
  subtitle: string;
  image: string;
  howItWorksHeading: string;
  steps: string[];
  whatsappLabel: string;
}

export interface ReferralPageContent {
  title: string;
  eyebrow: string;
  heading: string;
  subtitle: string;
  image: string;
  sideCardHeading: string;
  sideCardText: string;
  whatsappLabel: string;
}

export interface ContactPageContent {
  title: string;
  eyebrow: string;
  heading: string;
  subtitle: string;
  visitHeading: string;
  visitNotice: string;
}

export interface PageContentRegistry {
  about: AboutPageContent;
  repairs: RepairsPageContent;
  tradeIn: TradeInPageContent;
  installment: InstallmentPlanConfig;
  visaCard: VisaCardPageContent;
  preOrder: PreOrderPageContent;
  referral: ReferralPageContent;
  contact: ContactPageContent;
}

export interface MainStoreFamilyItem {
  id: string; // e.g. "mac", "iphone", "ipad", "watch", "airpods", "accessories"
  name: string;
  image: string;
  alt: string;
  path: string;
}

export interface MainStorePromoRibbonSlide {
  id: string;
  text: string;
  linkLabel?: string;
  linkTo?: string;
  visible?: boolean;
}

export interface MainStoreHeroConfig {
  titleLead: string;
  tagline: string;
  emblemImage: string;
  emblemAlt: string;
  supportLabel: string;
  supportUrl: string;
  showroomLabel: string;
  showroomUrl: string;
}

export interface MainStorePromoCard {
  id: string; // product slug or custom id
  productSlug?: string;
  eyebrow: string;
  name: string;
  statement: string;
  badge?: string;
  image: string; // custom image URL or empty for catalog product default
  alt: string;
  theme?: "light" | "dark";
  backgroundColor?: string;
  learnMorePath: string;
  actionPath: string;
  actionLabel?: string;
}

export interface MainStoreEditorialTile {
  id: string;
  eyebrow?: string;
  title: string;
  subtitle?: string;
  image: string;
  alt: string;
  backgroundColor?: string;
  theme?: "light" | "dark";
  destination: string;
  actionLabel?: string;
  /** 0-based index among product tiles where this editorial card appears (0 = opener, 99 = trailing) */
  position?: number;
}

export interface MainStoreDifferenceMiniCard {
  id: string;
  icon: "trade" | "installment" | "shield" | "delivery" | "repair" | "support" | "gift" | "tag";
  eyebrow?: string;
  title: string;
  subtitle?: string;
  backgroundColor: string;
  theme: "light" | "dark";
  destination: string;
  actionLabel?: string;
}

export interface MainStoreDifferenceBentoItem {
  id: string;
  kind: "tall" | "stack";
  // Tall card fields
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  image?: string;
  alt?: string;
  backgroundColor?: string;
  theme?: "light" | "dark";
  destination?: string;
  actionLabel?: string;
  isExternal?: boolean;
  // Stacked pair fields
  topCard?: MainStoreDifferenceMiniCard;
  bottomCard?: MainStoreDifferenceMiniCard;
}

export interface MainStoreHelpCard {
  id: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  image: string;
  alt: string;
  imagePosition?: string;
  theme: "light" | "dark";
  backgroundColor?: string;
  actionLabel: string;
  actionPath: string;
  isExternal?: boolean;
}

export interface MainStoreQuickLink {
  id: string;
  label: string;
  to: string;
}

export interface MainStoreCategoryCard {
  id: string; // "phones", "laptops", "tablets", "watches", "audio", "accessories"
  path: string;
  title: string;
  subtitle: string;
  image: string;
  alt: string;
}

export interface MainStoreAccessoryItem {
  id: string; // slug, e.g. "apple-magsafe-iphone-case"
  family?: ProductFamilyKey;
  name?: string;
  eyebrow?: string;
  image?: string; // custom image URL or empty for catalog product default
  alt?: string;
}

export type StorePageSectionType =
  | "hero-banner"
  | "featured-products"
  | "new-arrivals"
  | "product-collection"
  | "promotional-image"
  | "product-carousel"
  | "special-offers"
  | "image-text"
  | "category-showcase"
  | (string & {});

export type StoreBuiltInSectionKey =
  | "promo-ribbon"
  | "store-intro"
  | "family-strip"
  | "latest-carousel"
  | "more-to-love"
  | "accessories-carousel"
  | "difference-cards"
  | "audio-showcase"
  | "colorful-accessories"
  | "help-cards"
  | "category-cards"
  | "quick-links";

export type StoreSectionLayoutStyle =
  | "standard"
  | "split"
  | "full-bleed"
  | "compact"
  | "grid-3"
  | "grid-4"
  | "carousel";

export interface StorePageSection {
  id: string;
  type: StorePageSectionType;
  builtInKey?: StoreBuiltInSectionKey;
  eyebrow?: string;
  heading: string;
  subtitle: string;
  description: string;
  desktopImage: string;
  mobileImage: string;
  imageAlt?: string;
  backgroundColor: string;
  textAlignment: "left" | "center" | "right";
  productIds: string[];
  buttonLabel: string;
  buttonDestination: string;
  secondaryButtonLabel?: string;
  secondaryButtonDestination?: string;
  layoutStyle: StoreSectionLayoutStyle;
  visible: boolean;
  order: number;
}

export interface MainStoreConfig {
  sections?: StorePageSection[];
  sectionOrderVersion?: number;
  storeDesignVersion?: number;
  promoRibbonSlides?: MainStorePromoRibbonSlide[];
  heroConfig?: MainStoreHeroConfig;
  productFamilies: MainStoreFamilyItem[];
  latestCards: MainStorePromoCard[];
  featuredEditorialCards?: MainStoreEditorialTile[];
  featuredProductItems?: MainStoreAccessoryItem[];
  categoryCards: MainStoreCategoryCard[];
  moreToLoveCards: MainStorePromoCard[];
  accessoriesEditorialCards?: MainStoreEditorialTile[];
  accessories: MainStoreAccessoryItem[];
  differenceItems?: MainStoreDifferenceBentoItem[];
  audioEditorialCards?: MainStoreEditorialTile[];
  audioItems?: MainStoreAccessoryItem[];
  colorfulEditorialCards?: MainStoreEditorialTile[];
  colorfulItems?: MainStoreAccessoryItem[];
  helpCards?: MainStoreHelpCard[];
  quickLinks?: MainStoreQuickLink[];
  hasDraft?: boolean;
  updatedAt?: string;
}

/* ============================================================================
   MAC PAGE REDESIGN CMS SCHEMA (Apple.com/mac-faithful, 100% Admin-manageable)
   ============================================================================ */

export type MacBuiltInSectionKey =
  | "promo-ribbon"
  | "hero-chapter-nav"
  | "explore-lineup"
  | "why-shop-mac"
  | "help-me-choose"
  | "switch-to-mac"
  | "mac-essentials"
  | "ecosystem-accordion"
  | "all-mac-catalog"
  | "mac-directory-footer";

export type MacPageSectionType =
  | MacBuiltInSectionKey
  | "promotional-banner"
  | "featured-mac-products"
  | "image-text"
  | "product-carousel"
  | (string & {});

export interface MacPageSection {
  id: string;
  type: MacPageSectionType;
  builtInKey?: MacBuiltInSectionKey;
  eyebrow?: string;
  heading: string;
  subtitle?: string;
  description?: string;
  desktopImage?: string;
  mobileImage?: string;
  imageAlt?: string;
  backgroundColor?: string;
  textAlignment?: "left" | "center" | "right";
  productIds?: string[];
  buttonLabel?: string;
  buttonDestination?: string;
  secondaryButtonLabel?: string;
  secondaryButtonDestination?: string;
  visible: boolean;
  order: number;
}

export interface MacChapterNavItem {
  id: string;
  label: string;
  badge?: string;
  image: string;
  alt: string;
  to: string;
  /** Optional lineup tab filter to activate when clicked */
  filterTab?: string;
  /** Optional on-page anchor id (e.g. "explore-lineup", "help-me-choose", "all-mac-listings") */
  scrollTarget?: string;
  visible: boolean;
  order: number;
}

export interface MacColorSwatch {
  label: string;
  hex: string;
}

export interface MacLineupTab {
  id: string;
  label: string;
}

export interface MacLineupCard {
  id: string;
  category: string; // "laptops" | "desktops" | "accessories"
  productSlug?: string;
  badge?: string;
  title: string;
  chipLine?: string;
  description: string;
  image: string;
  alt: string;
  swatches?: MacColorSwatch[];
  priceNote?: string;
  fallbackPriceText?: string;
  learnMoreLabel: string;
  learnMoreTo: string;
  buyLabel?: string;
  buyTo: string;
  visible: boolean;
  order: number;
}

export interface MacBenefitCard {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  modalDetails?: string;
  image: string;
  alt: string;
  actionStyle: "modal" | "link";
  actionLabel: string;
  actionTo: string;
  isExternal?: boolean;
  visible: boolean;
  order: number;
}

export interface MacHelpMeChooseConfig {
  sectionHeading: string;
  cardHeading: string;
  subtitle?: string;
  ctaLabel: string;
  secondaryLabel?: string;
  secondaryTo?: string;
  image: string;
  alt: string;
  interactiveModalEnabled: boolean;
}

export interface MacPromoSplitCard {
  id: string;
  title: string;
  description: string;
  linkLabel: string;
  linkTo: string;
  secondaryLinkLabel?: string;
  secondaryLinkTo?: string;
  isExternal?: boolean;
  image: string;
  alt: string;
  visible: boolean;
  order: number;
}

export interface MacEcosystemItem {
  id: string;
  title: string;
  description: string;
  linkLabel: string;
  linkTo: string;
  image: string;
  alt: string;
  visible: boolean;
  order: number;
}

export interface MacDirectoryLink {
  id: string;
  label: string;
  to: string;
  isSecondary?: boolean;
}

export interface MacDirectoryColumn {
  id: string;
  heading: string;
  primaryStyle?: boolean;
  links: MacDirectoryLink[];
}

export interface MacPageConfig {
  macDesignVersion?: number;
  seoTitle: string;
  seoDescription: string;
  promoRibbon: {
    enabled: boolean;
    text: string;
    linkLabel: string;
    linkTo: string;
  };
  hero: {
    heading: string;
    showGoldPeriod?: boolean;
  };
  sections: MacPageSection[];
  chapterNavItems: MacChapterNavItem[];
  lineupSection: {
    heading: string;
    tabs: MacLineupTab[];
    cards: MacLineupCard[];
  };
  whyShopSection: {
    heading: string;
    actionLabel: string;
    actionTo: string;
    cards: MacBenefitCard[];
  };
  helpMeChoose: MacHelpMeChooseConfig;
  switchToMacSection: {
    heading: string;
    cards: MacPromoSplitCard[];
  };
  macEssentialsSection: {
    heading: string;
    cards: MacPromoSplitCard[];
  };
  ecosystemSection: {
    heading: string;
    actionLabel: string;
    actionTo: string;
    items: MacEcosystemItem[];
  };
  allCatalogSection: {
    heading: string;
    subtitle: string;
  };
  directoryFooter: {
    heading: string;
    tagline: string;
    columns: MacDirectoryColumn[];
    footnotes: string[];
  };
  hasDraft?: boolean;
  updatedAt?: string;
}

/* ============================================================================
   IPAD PAGE REDESIGN CMS SCHEMA (Apple.com/ipad-faithful, 100% Admin-manageable)
   ============================================================================ */

export type IpadBuiltInSectionKey =
  | "promo-ribbon"
  | "hero-chapter-nav"
  | "explore-lineup"
  | "why-shop-ipad"
  | "ipad-essentials"
  | "significant-others"
  | "ipad-directory-footer";

export type IpadPageSectionType =
  | IpadBuiltInSectionKey
  | "promotional-banner"
  | "featured-ipad-products"
  | "image-text"
  | "product-carousel"
  | (string & {});

export interface IpadPageSection {
  id: string;
  type: IpadPageSectionType;
  builtInKey?: IpadBuiltInSectionKey;
  eyebrow?: string;
  heading: string;
  subtitle?: string;
  description?: string;
  desktopImage?: string;
  mobileImage?: string;
  imageAlt?: string;
  backgroundColor?: string;
  textAlignment?: "left" | "center" | "right";
  productIds?: string[];
  buttonLabel?: string;
  buttonDestination?: string;
  secondaryButtonLabel?: string;
  secondaryButtonDestination?: string;
  visible: boolean;
  order: number;
}

export interface IpadChapterNavItem {
  id: string;
  label: string;
  badge?: string;
  image: string;
  alt: string;
  to: string;
  /** Optional on-page anchor id (e.g. "explore-lineup") or action ("compare-modal") */
  scrollTarget?: string;
  openCompareModal?: boolean;
  visible: boolean;
  order: number;
}

export interface IpadColorSwatch {
  label: string;
  hex: string;
}

export interface IpadLineupCard {
  id: string;
  productSlug?: string;
  /** Apple-accurate tinted showcase tile surface: dark (iPad Pro), sky (iPad Air), light (iPad / iPad mini) */
  tileTone: "dark" | "sky" | "light";
  badge?: string;
  title: string;
  chipLine?: string;
  displaySpec?: string;
  pencilSupport?: string;
  keyboardSupport?: string;
  description: string;
  image: string;
  alt: string;
  swatches?: IpadColorSwatch[];
  priceNote?: string;
  fallbackPriceText?: string;
  learnMoreLabel: string;
  learnMoreTo: string;
  buyLabel?: string;
  buyTo: string;
  visible: boolean;
  order: number;
}

export interface IpadBenefitCard {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  modalDetails?: string;
  image: string;
  alt: string;
  actionStyle: "modal" | "link";
  actionLabel: string;
  actionTo: string;
  isExternal?: boolean;
  visible: boolean;
  order: number;
}

export interface IpadEssentialCard {
  id: string;
  /** Apple iPad essentials alternates text-top (Apple Pencil) and image-top (Keyboards for iPad) */
  layout: "text-top" | "image-top";
  productSlug?: string;
  title: string;
  description: string;
  fallbackPriceText?: string;
  buyLabel: string;
  buyTo: string;
  secondaryLinkLabel?: string;
  secondaryLinkTo?: string;
  isExternal?: boolean;
  image: string;
  alt: string;
  visible: boolean;
  order: number;
}

export interface IpadEcosystemItem {
  id: string;
  title: string;
  description: string;
  linkLabel: string;
  linkTo: string;
  image: string;
  alt: string;
  visible: boolean;
  order: number;
}

export interface IpadDirectoryLink {
  id: string;
  label: string;
  to: string;
  isSecondary?: boolean;
  openCompareModal?: boolean;
}

export interface IpadDirectoryColumn {
  id: string;
  heading: string;
  primaryStyle?: boolean;
  links: IpadDirectoryLink[];
}

export interface IpadPageConfig {
  ipadDesignVersion?: number;
  seoTitle: string;
  seoDescription: string;
  promoRibbon: {
    enabled: boolean;
    text: string;
    linkLabel: string;
    linkTo: string;
  };
  hero: {
    heading: string;
    showGoldPeriod?: boolean;
  };
  sections: IpadPageSection[];
  chapterNavItems: IpadChapterNavItem[];
  lineupSection: {
    heading: string;
    compareLabel: string;
    shopAllLabel: string;
    shopAllTo: string;
    cards: IpadLineupCard[];
  };
  whyShopSection: {
    heading: string;
    actionLabel: string;
    actionTo: string;
    cards: IpadBenefitCard[];
  };
  essentialsSection: {
    heading: string;
    cards: IpadEssentialCard[];
  };
  ecosystemSection: {
    heading: string;
    actionLabel: string;
    actionTo: string;
    items: IpadEcosystemItem[];
  };
  directoryFooter: {
    heading: string;
    tagline: string;
    columns: IpadDirectoryColumn[];
    footnotes: string[];
  };
  hasDraft?: boolean;
  updatedAt?: string;
}

/* ============================================================================
   IPHONE PAGE REDESIGN CMS SCHEMA (Apple.com/iphone-faithful, 100% Admin-manageable)
   ============================================================================ */

export type IphoneBuiltInSectionKey =
  | "promo-ribbon"
  | "hero-chapter-nav"
  | "featured-hero-gallery"
  | "explore-lineup"
  | "why-shop-iphone"
  | "iphone-essentials"
  | "significant-others"
  | "iphone-directory-footer";

export type IphonePageSectionType =
  | IphoneBuiltInSectionKey
  | "promotional-banner"
  | "featured-iphone-products"
  | "image-text"
  | "product-carousel"
  | (string & {});

export interface IphonePageSection {
  id: string;
  type: IphonePageSectionType;
  builtInKey?: IphoneBuiltInSectionKey;
  eyebrow?: string;
  heading: string;
  subtitle?: string;
  description?: string;
  desktopImage?: string;
  mobileImage?: string;
  imageAlt?: string;
  backgroundColor?: string;
  textAlignment?: "left" | "center" | "right";
  productIds?: string[];
  buttonLabel?: string;
  buttonDestination?: string;
  secondaryButtonLabel?: string;
  secondaryButtonDestination?: string;
  visible: boolean;
  order: number;
}

export interface IphoneChapterNavItem {
  id: string;
  label: string;
  badge?: string;
  image: string;
  alt: string;
  to: string;
  scrollTarget?: string;
  openCompareModal?: boolean;
  visible: boolean;
  order: number;
}

export interface IphoneHeroSlide {
  id: string;
  tabLabel: string;
  theme: "light" | "dark";
  productSlug?: string;
  eyebrow?: string;
  title: string;
  subtitle: string;
  fallbackPriceText?: string;
  image: string;
  alt: string;
  buyLabel: string;
  buyTo: string;
  learnMoreLabel: string;
  learnMoreTo: string;
  visible: boolean;
  order: number;
}

export interface IphoneColorSwatch {
  label: string;
  hex: string;
}

export interface IphoneLineupCard {
  id: string;
  productSlug?: string;
  tileTone: "pearl" | "burgundy" | "sky" | "lavender" | "sand" | "light";
  badge?: string;
  title: string;
  chipLine?: string;
  displaySpec?: string;
  cameraSpec?: string;
  batterySpec?: string;
  description: string;
  image: string;
  alt: string;
  swatches?: IphoneColorSwatch[];
  priceNote?: string;
  fallbackPriceText?: string;
  learnMoreLabel: string;
  learnMoreTo: string;
  buyLabel?: string;
  buyTo: string;
  visible: boolean;
  order: number;
}

export interface IphoneBenefitCard {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  modalDetails?: string;
  image: string;
  alt: string;
  actionStyle: "modal" | "link";
  actionLabel: string;
  actionTo: string;
  isExternal?: boolean;
  visible: boolean;
  order: number;
}

export interface IphoneEssentialCard {
  id: string;
  productSlug?: string;
  title: string;
  description: string;
  fallbackPriceText?: string;
  buyLabel: string;
  buyTo: string;
  secondaryLinkLabel?: string;
  secondaryLinkTo?: string;
  image: string;
  alt: string;
  visible: boolean;
  order: number;
}

export interface IphoneEcosystemItem {
  id: string;
  title: string;
  description: string;
  linkLabel: string;
  linkTo: string;
  image: string;
  alt: string;
  visible: boolean;
  order: number;
}

export interface IphoneDirectoryLink {
  id: string;
  label: string;
  to: string;
  isSecondary?: boolean;
  openCompareModal?: boolean;
}

export interface IphoneDirectoryColumn {
  id: string;
  heading: string;
  primaryStyle?: boolean;
  links: IphoneDirectoryLink[];
}

export interface IphonePageConfig {
  iphoneDesignVersion?: number;
  seoTitle: string;
  seoDescription: string;
  promoRibbon: {
    enabled: boolean;
    text: string;
    linkLabel: string;
    linkTo: string;
  };
  hero: {
    heading: string;
    showGoldPeriod?: boolean;
  };
  sections: IphonePageSection[];
  chapterNavItems: IphoneChapterNavItem[];
  heroGallery: {
    autoplayMs?: number;
    slides: IphoneHeroSlide[];
  };
  lineupSection: {
    heading: string;
    compareLabel: string;
    shopAllLabel: string;
    shopAllTo: string;
    cards: IphoneLineupCard[];
  };
  whyShopSection: {
    heading: string;
    actionLabel: string;
    actionTo: string;
    cards: IphoneBenefitCard[];
  };
  essentialsSection: {
    heading: string;
    actionLabel: string;
    actionTo: string;
    cards: IphoneEssentialCard[];
  };
  ecosystemSection: {
    heading: string;
    actionLabel: string;
    actionTo: string;
    items: IphoneEcosystemItem[];
  };
  directoryFooter: {
    heading: string;
    tagline: string;
    columns: IphoneDirectoryColumn[];
    footnotes: string[];
  };
  hasDraft?: boolean;
  updatedAt?: string;
}

/* ============================================================================
   APPLE WATCH PAGE REDESIGN CMS SCHEMA (Apple.com/watch-faithful + Gold Brand)
   ============================================================================ */

export type WatchBuiltInSectionKey =
  | "promo-ribbon"
  | "hero-chapter-nav"
  | "explore-lineup"
  | "why-shop-watch"
  | "watch-essentials"
  | "made-for-each-other"
  | "watch-directory-footer";

export type WatchPageSectionType =
  | WatchBuiltInSectionKey
  | "promotional-banner"
  | "featured-watch-products"
  | "image-text"
  | "product-carousel"
  | (string & {});

export interface WatchPageSection {
  id: string;
  type: WatchPageSectionType;
  builtInKey?: WatchBuiltInSectionKey;
  eyebrow?: string;
  heading: string;
  subtitle?: string;
  description?: string;
  desktopImage?: string;
  mobileImage?: string;
  imageAlt?: string;
  backgroundColor?: string;
  textAlignment?: "left" | "center" | "right";
  productIds?: string[];
  buttonLabel?: string;
  buttonDestination?: string;
  visible: boolean;
  order: number;
}

export interface WatchChapterNavItem {
  id: string;
  label: string;
  badge?: string;
  image: string;
  alt: string;
  to: string;
  openCompareModal?: boolean;
  visible: boolean;
  order: number;
}

export interface WatchColorSwatch {
  label: string;
  hex: string;
}

export interface WatchLineupCard {
  id: string;
  productSlug?: string;
  tileTone: "cream" | "obsidian" | "sky";
  badge?: string;
  title: string;
  caseSizes?: string;
  chipSpec?: string;
  healthSpec?: string;
  batterySpec?: string;
  description: string;
  image: string;
  alt: string;
  swatches?: WatchColorSwatch[];
  priceNote?: string;
  fallbackPriceText?: string;
  learnMoreLabel: string;
  learnMoreTo: string;
  buyLabel?: string;
  buyTo: string;
  visible: boolean;
  order: number;
}

export interface WatchBenefitCard {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  modalDetails?: string;
  image: string;
  alt: string;
  actionStyle: "modal" | "link";
  actionLabel: string;
  actionTo: string;
  visible: boolean;
  order: number;
}

export interface WatchEssentialsBanner {
  sectionHeading: string;
  sectionActionLabel: string;
  sectionActionTo: string;
  title: string;
  description: string;
  priceNote?: string;
  ctaLabel: string;
  ctaTo: string;
  secondaryLabel?: string;
  secondaryTo?: string;
  image: string;
  alt: string;
}

export interface WatchEcosystemItem {
  id: string;
  title: string;
  description: string;
  linkLabel: string;
  linkTo: string;
  image: string;
  alt: string;
  visible: boolean;
  order: number;
}

export interface WatchDirectoryColumn {
  id: string;
  heading: string;
  primaryStyle?: boolean;
  links: Array<{
    id: string;
    label: string;
    to: string;
    isSecondary?: boolean;
    openCompareModal?: boolean;
  }>;
}

export interface WatchPageConfig {
  watchDesignVersion?: number;
  seoTitle: string;
  seoDescription: string;
  promoRibbon: {
    enabled: boolean;
    text: string;
    linkLabel: string;
    linkTo: string;
  };
  hero: {
    heading: string;
    showGoldPeriod?: boolean;
  };
  sections: WatchPageSection[];
  chapterNavItems: WatchChapterNavItem[];
  lineupSection: {
    heading: string;
    compareLabel: string;
    shopAllLabel: string;
    shopAllTo: string;
    cards: WatchLineupCard[];
  };
  whyShopSection: {
    heading: string;
    actionLabel: string;
    actionTo: string;
    cards: WatchBenefitCard[];
  };
  essentialsBanner: WatchEssentialsBanner;
  ecosystemSection: {
    heading: string;
    actionLabel: string;
    actionTo: string;
    items: WatchEcosystemItem[];
  };
  directoryFooter: {
    heading: string;
    tagline: string;
    columns: WatchDirectoryColumn[];
    footnotes: string[];
  };
  hasDraft?: boolean;
  updatedAt?: string;
}

/* ============================================================================
   AIRPODS PAGE REDESIGN CMS SCHEMA (Apple.com/airpods-faithful + Gold Brand)
   ============================================================================ */

export type AirpodsBuiltInSectionKey =
  | "chapter-nav"
  | "promo-ribbon"
  | "hero-showcases"
  | "compare-models"
  | "get-to-know"
  | "assurance-banner"
  | "value-strip"
  | "airpods-directory-footer";

export type AirpodsPageSectionType =
  | AirpodsBuiltInSectionKey
  | "promotional-banner"
  | "image-text"
  | (string & {});

export interface AirpodsPageSection {
  id: string;
  type: AirpodsPageSectionType;
  builtInKey?: AirpodsBuiltInSectionKey;
  eyebrow?: string;
  heading: string;
  subtitle?: string;
  description?: string;
  desktopImage?: string;
  imageAlt?: string;
  backgroundColor?: string;
  buttonLabel?: string;
  buttonDestination?: string;
  visible: boolean;
  order: number;
}

export interface AirpodsChapterNavItem {
  id: string;
  label: string;
  badge?: string;
  image: string;
  alt: string;
  to: string;
  scrollTarget?: string;
  visible: boolean;
  order: number;
}

export interface AirpodsHeroShowcaseCard {
  id: string;
  /** "backlit-dark" (AirPods 4 ANC), "studio-light" (AirPods Pro 3), "wordmark-light" (AirPods Max 2) */
  variant: "backlit-dark" | "studio-light" | "wordmark-light";
  productSlug?: string;
  title: string;
  wordmarkText?: string;
  subtitle: string;
  fallbackPriceText?: string;
  image: string;
  alt: string;
  buyLabel: string;
  buyTo: string;
  learnMoreLabel: string;
  learnMoreTo: string;
  showMotionToggle?: boolean;
  visible: boolean;
  order: number;
}

export interface AirpodsCompareModel {
  id: string;
  productSlug?: string;
  badge?: string;
  title: string;
  subtitle: string;
  fallbackPriceText?: string;
  image: string;
  alt: string;
  buyLabel: string;
  buyTo: string;
  learnMoreLabel: string;
  learnMoreTo: string;
  ancSpec: string;
  adaptiveSpec: string;
  workoutSpec: string;
  hearingSpec: string;
  siriSpec: string;
  controlsSpec: string;
  batteryHours: string;
  batteryCaption: string;
  visible: boolean;
  order: number;
}

export interface AirpodsFeatureCard {
  id: string;
  eyebrow: string;
  headline: string;
  subNote?: string;
  expandedCopy: string;
  theme: "light" | "dark";
  image: string;
  alt: string;
  visible: boolean;
  order: number;
}

export interface AirpodsAssuranceBanner {
  eyebrow: string;
  heading: string;
  description: string;
  ctaLabel: string;
  ctaTo: string;
  secondaryLabel?: string;
  secondaryTo?: string;
  image: string;
  alt: string;
}

export interface AirpodsValueStripItem {
  id: string;
  icon: "delivery" | "installments" | "support" | "verified";
  title: string;
  description: string;
  linkLabel: string;
  linkTo: string;
}

export interface AirpodsDirectoryColumn {
  id: string;
  heading: string;
  primaryStyle?: boolean;
  links: Array<{ id: string; label: string; to: string; isSecondary?: boolean }>;
}

export interface AirpodsPageConfig {
  airpodsDesignVersion?: number;
  seoTitle: string;
  seoDescription: string;
  sections: AirpodsPageSection[];
  chapterNavItems: AirpodsChapterNavItem[];
  promoRibbon: {
    enabled: boolean;
    text: string;
    linkLabel: string;
    linkTo: string;
  };
  heroShowcases: AirpodsHeroShowcaseCard[];
  compareSection: {
    heading: string;
    shopAllLabel: string;
    shopAllTo: string;
    models: AirpodsCompareModel[];
  };
  featureCarouselSection: {
    heading: string;
    cards: AirpodsFeatureCard[];
  };
  assuranceBanner: AirpodsAssuranceBanner;
  valueStrip: AirpodsValueStripItem[];
  directoryFooter: {
    heading: string;
    tagline: string;
    columns: AirpodsDirectoryColumn[];
    footnotes: string[];
  };
  hasDraft?: boolean;
  updatedAt?: string;
}

/* ============================================================================
   ACCESSORIES PAGE REDESIGN CMS SCHEMA (Apple.com/shop/accessories/all + Gold)
   ============================================================================ */

export type AccessoriesBuiltInSectionKey =
  | "header-category-strip"
  | "whats-new-carousel"
  | "top-picks-bento"
  | "why-buy-accessories"
  | "accessories-directory-footer";

export type AccessoriesPageSectionType =
  | AccessoriesBuiltInSectionKey
  | "promotional-banner"
  | "image-text"
  | (string & {});

export interface AccessoriesPageSection {
  id: string;
  type: AccessoriesPageSectionType;
  builtInKey?: AccessoriesBuiltInSectionKey;
  eyebrow?: string;
  heading: string;
  subtitle?: string;
  description?: string;
  desktopImage?: string;
  imageAlt?: string;
  backgroundColor?: string;
  buttonLabel?: string;
  buttonDestination?: string;
  visible: boolean;
  order: number;
}

export interface AccessoriesCategoryNavItem {
  id: string;
  label: string;
  image: string;
  alt: string;
  /** Optional bento tab id to focus & scroll to, otherwise navigates to `to` */
  bentoTabId?: string;
  to: string;
  visible: boolean;
  order: number;
}

export interface AccessoriesHeroSlide {
  id: string;
  theme: "dark-split" | "light-split";
  badge?: string;
  title: string;
  description: string;
  ctaLabel: string;
  ctaTo: string;
  image: string;
  alt: string;
  visible: boolean;
  order: number;
}

export interface AccessoriesBentoItem {
  id: string;
  /** "product" (1x1 card), "wide" (2x1 tinted highlight), "editorial" (2x2 tall hero tile) */
  span: "product" | "wide" | "editorial";
  productSlug?: string;
  eyebrow?: string;
  badge?: string;
  title: string;
  subtitle?: string;
  fallbackPriceText?: string;
  tintColor?: string;
  textTheme?: "light" | "dark";
  swatches?: Array<{ label: string; hex: string }>;
  image: string;
  alt: string;
  to: string;
  ctaLabel?: string;
  visible: boolean;
  order: number;
}

export interface AccessoriesBentoTab {
  id: string;
  label: string;
  shopAllLabel: string;
  shopAllTo: string;
  items: AccessoriesBentoItem[];
}

export interface AccessoriesWhyCard {
  id: string;
  icon: "delivery" | "verified" | "bundle" | "guidance";
  title: string;
  description: string;
  modalHeadline: string;
  modalDetails: string;
  actionLabel: string;
  actionTo: string;
  visible: boolean;
  order: number;
}

export interface AccessoriesDirectoryColumn {
  id: string;
  heading: string;
  primaryStyle?: boolean;
  links: Array<{ id: string; label: string; to: string; isSecondary?: boolean }>;
}

export interface AccessoriesPageConfig {
  accessoriesDesignVersion?: number;
  seoTitle: string;
  seoDescription: string;
  hero: {
    heading: string;
    showGoldPeriod?: boolean;
    specialistLabel: string;
    specialistTo: string;
    showroomLabel: string;
    showroomTo: string;
  };
  sections: AccessoriesPageSection[];
  categoryNavItems: AccessoriesCategoryNavItem[];
  whatsNewSection: {
    heading: string;
    slides: AccessoriesHeroSlide[];
  };
  topPicksSection: {
    heading: string;
    tabs: AccessoriesBentoTab[];
  };
  whyBuySection: {
    heading: string;
    cards: AccessoriesWhyCard[];
  };
  directoryFooter: {
    heading: string;
    tagline: string;
    columns: AccessoriesDirectoryColumn[];
    footnotes: string[];
  };
  hasDraft?: boolean;
  updatedAt?: string;
}

/* ============================================================================
   APPLE-STYLE SHOP EXPERIENCE & INDEPENDENT UK USED CMS SCHEMA
   (Mac + iPad + iPhone + Apple Watch Shop Hubs, Search, Configurator & UK Used)
   ============================================================================ */

export type ShopCategoryKey = "mac" | "ipad" | "iphone" | "watch";

export interface ShopWaysToBuyCard {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  ctaLabel: string;
  ctaTo: string;
  tone: "light" | "gold" | "dark";
}

export interface ShopCategoryExperienceConfig {
  heading: string;
  subtitle: string;
  promoRibbonText: string;
  promoRibbonLinkLabel: string;
  promoRibbonLinkTo: string;
  searchPlaceholder: string;
  specialistLabel: string;
  specialistTo: string;
  showroomLabel: string;
  showroomTo: string;
  modelsHeading: string;
  modelsSubheading: string;
  ukUsedHeading: string;
  ukUsedSubheading: string;
  accessoriesHeading: string;
  accessoriesSubheading: string;
  accessoriesEditorialTitle: string;
  accessoriesEditorialDesc: string;
  accessoriesEditorialImage: string;
  showUkUsedSection: boolean;
  showAccessoriesSection: boolean;
  showWaysToBuySection: boolean;
  showOnlyAtSection: boolean;
  familyOrder: string[];
  hiddenFamilyIds: string[];
  curatedAccessorySlugs: string[];
  waysToBuyCards: ShopWaysToBuyCard[];
}

export interface UkUsedProductOverride {
  productIdOrSlug: string;
  /** Independent UK Used photographs (separate from Brand New product image assignments) */
  customImages: Array<{ src: string; alt: string }>;
  displayOrder?: number;
  visible?: boolean;
  gradeNote?: string;
  batteryHealthNote?: string;
  updatedAt?: string;
}

export interface ShopExperienceConfig {
  version?: number;
  categories: Record<ShopCategoryKey, ShopCategoryExperienceConfig>;
  /** Keyed by product.id or product.slug for independent UK Used photo & visibility management */
  ukUsedOverrides: Record<string, UkUsedProductOverride>;
  hasDraft?: boolean;
  updatedAt?: string;
}
