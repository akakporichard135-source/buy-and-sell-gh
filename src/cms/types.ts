export type Tone = "dark" | "light" | "mist";

export interface ActionLink {
  label: string;
  to: string;
}

import type { ProductFamilyKey } from "../catalog/productExperience";

export interface HeroCampaign {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  mobileImage?: string;
  alt: string;
  tone: Tone;
  primary: ActionLink;
  secondary?: ActionLink;
  enabled: boolean;
  order: number;
}

export interface PromoTile {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  alt: string;
  tone: Tone;
  primary: ActionLink;
  secondary?: ActionLink;
  placement?: "bottom";
  enabled: boolean;
  order: number;
}

export interface ServiceFlyer {
  id: string;
  title: string;
  image: string;
  alt: string;
  to: string;
  enabled: boolean;
  order: number;
}

export interface HomepageContent {
  announcement: {
    enabled: boolean;
    text: string;
    linkText: string;
    linkTo: string;
  };
  heroes: HeroCampaign[];
  tiles: PromoTile[];
  serviceFlyers: ServiceFlyer[];
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

export interface PageContentRegistry {
  about: AboutPageContent;
  repairs: RepairsPageContent;
  tradeIn: TradeInPageContent;
}
