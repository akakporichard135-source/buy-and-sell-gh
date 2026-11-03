export type PromotionType =
  | "free_gift"
  | "percentage_discount"
  | "fixed_discount"
  | "promotional_price"
  | "bundle"
  | "advertising";

export type PromotionStatus =
  | "draft"
  | "scheduled"
  | "active"
  | "expired"
  | "archived"
  | "disabled";

export type DiscountCalculationMode =
  | "single_percent"
  | "price_tiers"
  | "product_specific";

export interface DiscountTier {
  id?: string;
  minPrice: number;
  maxPrice?: number | null; // null or undefined means "and above"
  percent: number;
  label?: string;
}

export interface PromotionCampaign {
  id: string;
  slug: string;
  title: string;
  shortDescription: string;
  detailedDescription: string;
  promotionType: PromotionType;
  status: PromotionStatus;
  isEnabled: boolean;
  startDate?: string | null;
  endDate?: string | null;
  timezone: string;
  priority: number;
  allowStacking: boolean;

  // Target & Eligibility
  eligibleProductIds: string[];
  eligibleCategory?: string;
  eligibleVariantIds?: string[];
  eligibleStorageOptions?: string[];
  minOrderSubtotal: number;
  minQualifyingItemPrice?: number | null; // Minimum individual item price (e.g. > GH₵2,000)
  excludedProductIds?: string[]; // Specifically excluded product IDs / slugs
  excludedCategories?: string[]; // Specifically excluded categories

  // Benefits
  discountPercent?: number | null;
  discountAmount?: number | null;
  promotionalPrice?: number | null;
  maxDiscountAmount?: number | null; // Capped discount amount per item/order

  // Advanced Tiered & Product-Specific Discount Rules
  discountCalculationMode?: DiscountCalculationMode;
  discountTiers?: DiscountTier[];
  productDiscounts?: Record<string, number>; // productId/slug -> percentage or cash discount
  variantDiscounts?: Record<string, number>; // variantId or storage -> percentage
  categoryDiscounts?: Record<string, number>; // category -> percentage

  // Free Gift
  giftProductId?: string | null;
  giftProductName?: string | null;
  giftProductSlug?: string | null;
  giftProductImage?: string | null;
  giftQuantityPerPurchase: number;
  maxGiftsPerOrder: number;
  giftStockQuantity: number;
  giftStockAlertThreshold: number;

  // Bundle
  bundleRequiredProductIds?: string[];
  bundleDiscountAmount?: number | null;
  bundleDiscountPercent?: number | null;

  // Flyer & Media
  desktopFlyerUrl: string;
  mobileFlyerUrl?: string;
  flyerAltText?: string;
  imagePosition?: string; // "center" | "top" | "bottom"
  additionalImages?: string[]; // Extra promotional shots / media gallery
  ctaText: string;
  ctaDestination: string;
  displayOrder: number;
  showOnAnnouncementBar: boolean;
  announcementBarText?: string;
  showOnHomepageCarousel: boolean;
  showOnOffersPage: boolean;

  // Limits & Redemptions
  totalRedemptionLimit?: number | null;
  currentRedemptions: number;
  customerRedemptionLimit: number;

  // Performance Counters
  viewCount: number;
  clickCount: number;
  ordersCount: number;
  totalDiscountGiven: number;
  totalGiftsAllocated: number;
  totalAttributedSales: number;

  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PromotionRedemption {
  id: string;
  promotionId: string;
  orderId?: string | null;
  orderReference: string;
  customerPhone: string;
  customerEmail?: string | null;
  discountAmount: number;
  giftProductId?: string | null;
  giftQuantity: number;
  createdAt: string;
}

export interface PromotionBenefitEvaluation {
  campaign: PromotionCampaign;
  discountAmount: number;
  isFreeGift: boolean;
  giftItems: Array<{
    productId: string;
    productName: string;
    productSlug: string;
    productImage: string;
    quantity: number;
  }>;
}

export interface CartPromotionResult {
  appliedCampaigns: PromotionCampaign[];
  itemDiscounts: Record<string, number>; // cartItemKey -> discount amount
  totalDiscount: number;
  freeGifts: Array<{
    id: string;
    productId: string;
    productName: string;
    productSlug: string;
    productImage: string;
    quantity: number;
    promotionId: string;
    qualifyingItemKey: string;
  }>;
  subtotalBeforeDiscount: number;
  finalSubtotal: number;
  savingsExplanation: string[];
}
