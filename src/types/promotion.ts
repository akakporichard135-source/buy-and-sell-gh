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

  // Benefits
  discountPercent?: number | null;
  discountAmount?: number | null;
  promotionalPrice?: number | null;

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
