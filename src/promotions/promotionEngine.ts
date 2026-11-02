import type { CartItem, Product } from "../types/product";
import type { CartPromotionResult, PromotionCampaign } from "../types/promotion";
import { cartItemKey, getItemEffectivePrice } from "../context/cartOperations";

/**
 * Check if a campaign is currently active based on status, isEnabled, and date windows.
 */
export function isPromotionCurrentlyActive(promo: PromotionCampaign, now = new Date()): boolean {
  if (!promo.isEnabled || promo.status !== "active") return false;

  const nowMs = now.getTime();
  if (promo.startDate) {
    const startMs = new Date(promo.startDate).getTime();
    if (!Number.isNaN(startMs) && nowMs < startMs) return false;
  }
  if (promo.endDate) {
    const endMs = new Date(promo.endDate).getTime();
    if (!Number.isNaN(endMs) && nowMs > endMs) return false;
  }

  if (typeof promo.totalRedemptionLimit === "number" && promo.totalRedemptionLimit > 0) {
    if (promo.currentRedemptions >= promo.totalRedemptionLimit) return false;
  }

  return true;
}

/**
 * Checks whether a specific product / variant satisfies the campaign's eligibility rules.
 */
export function isItemEligibleForPromotion(
  item: CartItem,
  promo: PromotionCampaign
): boolean {
  // Free gifts themselves are not eligible for further discounts
  if ((item as any).isFreeGift) return false;

  // 1. Check Product ID / Slug
  if (promo.eligibleProductIds && promo.eligibleProductIds.length > 0) {
    const matchesId = promo.eligibleProductIds.includes(item.product.id);
    const matchesSlug = promo.eligibleProductIds.includes(item.product.slug);
    if (!matchesId && !matchesSlug) return false;
  }

  // 2. Check Category if specified and not 'all'
  if (promo.eligibleCategory && promo.eligibleCategory !== "all") {
    const cat = item.product.category || "";
    if (cat.toLowerCase() !== promo.eligibleCategory.toLowerCase()) {
      return false;
    }
  }

  // 3. Check Variant ID if configured
  if (promo.eligibleVariantIds && promo.eligibleVariantIds.length > 0) {
    if (!item.variantId || !promo.eligibleVariantIds.includes(item.variantId)) {
      return false;
    }
  }

  // 4. Check Storage Option if configured
  if (promo.eligibleStorageOptions && promo.eligibleStorageOptions.length > 0) {
    if (!item.storage || !promo.eligibleStorageOptions.includes(item.storage)) {
      return false;
    }
  }

  return true;
}

/**
 * Evaluate all active campaigns against a list of cart items.
 * Evaluates discounts, free gifts, deterministic priority, and stacking rules.
 */
export function evaluateCartPromotions(
  items: CartItem[],
  campaigns: PromotionCampaign[],
  now = new Date()
): CartPromotionResult {
  const activeCampaigns = campaigns
    .filter((c) => isPromotionCurrentlyActive(c, now))
    .sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));

  const standardItems = items.filter((item) => !(item as any).isFreeGift);
  const subtotalBeforeDiscount = standardItems.reduce(
    (sum, item) => sum + getItemEffectivePrice(item) * item.quantity,
    0
  );

  const appliedCampaignMap = new Map<string, PromotionCampaign>();
  const itemDiscounts: Record<string, number> = {};
  const freeGifts: CartPromotionResult["freeGifts"] = [];
  const savingsExplanation: string[] = [];

  // 1. Evaluate Item-Level Price Discounts
  for (const item of standardItems) {
    const key = cartItemKey(item);
    const unitPrice = getItemEffectivePrice(item);
    const itemTotal = unitPrice * item.quantity;
    if (itemTotal <= 0) continue;

    // Find all matching discount campaigns for this item
    const matchingCampaigns = activeCampaigns.filter((promo) => {
      if (promo.minOrderSubtotal > 0 && subtotalBeforeDiscount < promo.minOrderSubtotal) {
        return false;
      }
      return (
        ["percentage_discount", "fixed_discount", "promotional_price"].includes(
          promo.promotionType
        ) && isItemEligibleForPromotion(item, promo)
      );
    });

    if (matchingCampaigns.length === 0) continue;

    // Deterministic selection: Pick best discount if stacking not allowed
    let bestDiscount = 0;
    let selectedCampaign: PromotionCampaign | null = null;

    for (const promo of matchingCampaigns) {
      let candidateDiscount = 0;
      if (promo.promotionType === "percentage_discount" && promo.discountPercent) {
        candidateDiscount = Math.round((unitPrice * (promo.discountPercent / 100))) * item.quantity;
      } else if (promo.promotionType === "fixed_discount" && promo.discountAmount) {
        candidateDiscount = Math.min(promo.discountAmount, unitPrice) * item.quantity;
      } else if (promo.promotionType === "promotional_price" && promo.promotionalPrice) {
        const diff = Math.max(0, unitPrice - promo.promotionalPrice);
        candidateDiscount = diff * item.quantity;
      }

      candidateDiscount = Math.min(candidateDiscount, itemTotal);

      if (candidateDiscount > bestDiscount) {
        bestDiscount = candidateDiscount;
        selectedCampaign = promo;
      }
    }

    if (bestDiscount > 0 && selectedCampaign) {
      itemDiscounts[key] = bestDiscount;
      appliedCampaignMap.set(selectedCampaign.id, selectedCampaign);
      savingsExplanation.push(
        `${selectedCampaign.title}: Saved GH₵ ${bestDiscount.toLocaleString()} on ${item.product.name}`
      );
    }
  }

  // 2. Evaluate Bundle Promotions
  const bundleCampaigns = activeCampaigns.filter(
    (c) => c.promotionType === "bundle" && (c.bundleRequiredProductIds?.length ?? 0) > 1
  );

  for (const bundle of bundleCampaigns) {
    if (bundle.minOrderSubtotal > 0 && subtotalBeforeDiscount < bundle.minOrderSubtotal) continue;
    const requiredIds = bundle.bundleRequiredProductIds || [];
    const allRequiredPresent = requiredIds.every((reqId) =>
      standardItems.some(
        (it) => it.product.id === reqId || it.product.slug === reqId
      )
    );

    if (allRequiredPresent) {
      let bundleDiscount = 0;
      if (bundle.bundleDiscountAmount) {
        bundleDiscount = bundle.bundleDiscountAmount;
      } else if (bundle.bundleDiscountPercent) {
        bundleDiscount = Math.round((subtotalBeforeDiscount * (bundle.bundleDiscountPercent / 100)));
      }

      if (bundleDiscount > 0) {
        appliedCampaignMap.set(bundle.id, bundle);
        savingsExplanation.push(
          `${bundle.title}: Bundle savings of GH₵ ${bundleDiscount.toLocaleString()}`
        );
      }
    }
  }

  // 3. Evaluate Free Gift Promotions
  const freeGiftCampaigns = activeCampaigns.filter(
    (c) =>
      c.promotionType === "free_gift" &&
      c.giftProductId &&
      c.giftStockQuantity > 0
  );

  const claimedGiftCampaignIds = new Set<string>();

  for (const giftPromo of freeGiftCampaigns) {
    if (claimedGiftCampaignIds.has(giftPromo.id)) continue;
    if (giftPromo.minOrderSubtotal > 0 && subtotalBeforeDiscount < giftPromo.minOrderSubtotal) {
      continue;
    }

    // Find qualifying items for this gift promo
    const qualifyingItems = standardItems.filter((it) =>
      isItemEligibleForPromotion(it, giftPromo)
    );

    if (qualifyingItems.length > 0) {
      const qualifyingCount = qualifyingItems.reduce((s, it) => s + it.quantity, 0);
      const giftQty = Math.min(
        qualifyingCount * (giftPromo.giftQuantityPerPurchase || 1),
        giftPromo.maxGiftsPerOrder || 1,
        giftPromo.giftStockQuantity
      );

      if (giftQty > 0) {
        claimedGiftCampaignIds.add(giftPromo.id);
        appliedCampaignMap.set(giftPromo.id, giftPromo);

        freeGifts.push({
          id: `gift-${giftPromo.id}`,
          productId: giftPromo.giftProductId!,
          productName: giftPromo.giftProductName || "Promotional Free Gift",
          productSlug: giftPromo.giftProductSlug || "promotional-gift",
          productImage: giftPromo.giftProductImage || "/products/campaigns/accessory-magsafe-case.webp",
          quantity: giftQty,
          promotionId: giftPromo.id,
          qualifyingItemKey: cartItemKey(qualifyingItems[0]),
        });

        savingsExplanation.push(
          `${giftPromo.title}: ${giftQty} × ${giftPromo.giftProductName || "Free Gift"} included (GH₵ 0)`
        );
      }
    }
  }

  const totalDiscount = Object.values(itemDiscounts).reduce((s, d) => s + d, 0);
  const finalSubtotal = Math.max(0, subtotalBeforeDiscount - totalDiscount);

  return {
    appliedCampaigns: Array.from(appliedCampaignMap.values()),
    itemDiscounts,
    totalDiscount,
    freeGifts,
    subtotalBeforeDiscount,
    finalSubtotal,
    savingsExplanation,
  };
}

/**
 * Converts a FreeGift entry from evaluateCartPromotions into a synthetic zero-priced CartItem.
 */
export function freeGiftToCartItem(
  gift: CartPromotionResult["freeGifts"][0],
  catalogProduct?: Product
): CartItem {
  const baseProduct: Product = catalogProduct ?? {
    id: gift.productId,
    slug: gift.productSlug,
    name: gift.productName,
    category: "Accessories",
    subcategory: "Promotional Gift",
    brand: "Apple",
    model: gift.productName,
    price: 0,
    condition: "Brand New",
    storage: ["Standard"],
    colors: ["Standard"],
    stockStatus: "In Stock",
    stockQuantity: gift.quantity,
    imageTone: "light",
    images: [{ src: gift.productImage, alt: gift.productName }],
    available: true,
    specs: ["Complimentary original gift from Buy & Sell GH"],
    box: [gift.productName],
    description: "Complimentary promotional gift included with qualifying purchase.",
  };

  return {
    product: baseProduct,
    storage: "Standard",
    color: "Standard",
    quantity: gift.quantity,
    configuredPrice: 0,
    originalPrice: 350, // Typical nominal value for display
    colorImageSrc: gift.productImage,
    ...({
      isFreeGift: true,
      appliedPromotionId: gift.promotionId,
      qualifyingItemKey: gift.qualifyingItemKey,
    } as any),
  };
}
