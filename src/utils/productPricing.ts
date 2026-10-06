import type { Product, ProductVariant } from "../types/product";

export interface ConfiguredPriceOptions {
  storage?: string;
  chip?: string;
  memory?: string;
  screenSize?: string;
  connectivity?: string;
  condition?: string;
  model?: string;
}

export interface ResolvedPriceResult {
  variant?: ProductVariant;
  price: number;
  previousPrice: number | null;
  isSale: boolean;
  formattedPrice: string;
  formattedPreviousPrice?: string;
  isEnquiry: boolean;
}

export interface CardPriceDisplay {
  current: string;
  previous?: string;
  isFrom: boolean;
  isSale: boolean;
  isEnquiry: boolean;
}

export interface TradeInBreakdown {
  retailPrice: number;
  tradeInCredit: number;
  estimatedDue: number;
  formattedRetailPrice: string;
  formattedTradeInCredit: string;
  formattedEstimatedDue: string;
}

/**
 * Format a number strictly as GH₵ [amount] with thousands commas and zero decimals.
 */
export function formatPrice(amount: number): string {
  if (!Number.isFinite(amount) || amount <= 0) return "GH₵ 0";
  return `GH₵ ${Math.round(amount).toLocaleString("en-US")}`;
}

/**
 * Cleanly normalize tokens for fuzzy matching
 */
function normalizeToken(val?: string | null): string {
  return String(val || "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

/**
 * Resolve the authoritative price for a configured product.
 * Evaluates variants against selected storage, chip, memory, screen size, etc.
 */
export function resolveConfiguredPrice(
  product?: Product,
  options: ConfiguredPriceOptions = {}
): ResolvedPriceResult {
  if (!product || product.priceOnRequest || product.price <= 0) {
    const isEnquiry = !product || Boolean(product.priceOnRequest) || product.price <= 0;
    return {
      variant: undefined,
      price: product?.price ?? 0,
      previousPrice: null,
      isSale: false,
      formattedPrice: isEnquiry ? "Price confirmed on enquiry" : "GH₵ 0",
      formattedPreviousPrice: undefined,
      isEnquiry,
    };
  }

  const variants = product.variants ?? [];

  if (variants.length > 0) {
    // 1. Try finding a scored best variant match
    let bestVariant: ProductVariant | undefined;
    let highestScore = -1;

    for (const v of variants) {
      if (v.available === false) continue;
      let score = 0;

      // Storage match (highest weight)
      if (options.storage && v.storage) {
        if (normalizeToken(options.storage) === normalizeToken(v.storage)) {
          score += 10;
        } else {
          score -= 5;
        }
      }

      // Chip match
      if (options.chip && v.chip) {
        if (normalizeToken(options.chip) === normalizeToken(v.chip)) {
          score += 6;
        } else {
          score -= 4;
        }
      }

      // Memory match
      if (options.memory && v.memory) {
        if (normalizeToken(options.memory) === normalizeToken(v.memory)) {
          score += 5;
        } else {
          score -= 3;
        }
      }

      // Screen size match
      if (options.screenSize && v.screenSize) {
        if (normalizeToken(options.screenSize) === normalizeToken(v.screenSize)) {
          score += 5;
        } else {
          score -= 3;
        }
      }

      // Connectivity match
      if (options.connectivity && v.connectivity) {
        if (normalizeToken(options.connectivity) === normalizeToken(v.connectivity)) {
          score += 4;
        } else {
          score -= 2;
        }
      }

      if (score > highestScore) {
        highestScore = score;
        bestVariant = v;
      }
    }

    if (bestVariant && highestScore > 0) {
      const isSale = Boolean(
        bestVariant.isSale ||
          (bestVariant.previousPrice && bestVariant.previousPrice > bestVariant.price)
      );

      return {
        variant: bestVariant,
        price: bestVariant.price,
        previousPrice: bestVariant.previousPrice ?? null,
        isSale,
        formattedPrice: formatPrice(bestVariant.price),
        formattedPreviousPrice:
          isSale && bestVariant.previousPrice ? formatPrice(bestVariant.previousPrice) : undefined,
        isEnquiry: false,
      };
    }

    // Default to the first available variant if options did not match explicitly
    const firstActive = variants.find((v) => v.available !== false) ?? variants[0];
    if (firstActive) {
      const isSale = Boolean(
        firstActive.isSale ||
          (firstActive.previousPrice && firstActive.previousPrice > firstActive.price)
      );

      return {
        variant: firstActive,
        price: firstActive.price,
        previousPrice: firstActive.previousPrice ?? null,
        isSale,
        formattedPrice: formatPrice(firstActive.price),
        formattedPreviousPrice:
          isSale && firstActive.previousPrice ? formatPrice(firstActive.previousPrice) : undefined,
        isEnquiry: false,
      };
    }
  }

  // Fallback to base product pricing
  const basePrevious = product.previousPrice ?? product.oldPrice ?? null;
  const isSale = Boolean(basePrevious && basePrevious > product.price);

  return {
    variant: undefined,
    price: product.price,
    previousPrice: basePrevious,
    isSale,
    formattedPrice: formatPrice(product.price),
    formattedPreviousPrice: isSale && basePrevious ? formatPrice(basePrevious) : undefined,
    isEnquiry: false,
  };
}

/**
 * Returns formatted pricing for catalog/storefront product cards.
 * If multiple configurations or variants exist, prefixes with "From GH₵ X".
 */
export function getCardPriceDisplay(product: Product): CardPriceDisplay {
  const isEnquiry = Boolean(product.priceOnRequest) || product.price <= 0;
  if (isEnquiry) {
    return {
      current: "Price on Enquiry",
      isFrom: false,
      isSale: false,
      isEnquiry: true,
    };
  }

  const variants = (product.variants ?? []).filter((v) => v.available !== false);
  const hasMultipleVariants = variants.length > 1;
  const hasMultipleStorage = (product.storage ?? []).length > 1;

  let minPrice = product.price;
  let previousPrice: number | undefined = product.previousPrice ?? product.oldPrice;

  if (hasMultipleVariants) {
    const prices = variants.map((v) => v.price).filter((p) => p > 0);
    if (prices.length > 0) {
      minPrice = Math.min(...prices);
      const lowestVariant = variants.find((v) => v.price === minPrice);
      if (lowestVariant?.previousPrice) {
        previousPrice = lowestVariant.previousPrice;
      }
    }
  }

  const isFrom = hasMultipleVariants || hasMultipleStorage;
  const isSale = Boolean(previousPrice && previousPrice > minPrice);

  return {
    current: isFrom ? `From ${formatPrice(minPrice)}` : formatPrice(minPrice),
    previous: isSale && previousPrice ? formatPrice(previousPrice) : undefined,
    isFrom,
    isSale,
    isEnquiry: false,
  };
}

/**
 * Compute trade-in deduction breakdown, keeping retail price and trade-in credit completely separate.
 */
export function calculateTradeInBreakdown(
  retailPrice: number,
  tradeInSelected: boolean,
  estimatedCredit = 3500
): TradeInBreakdown {
  const credit = tradeInSelected ? Math.min(retailPrice * 0.5, estimatedCredit) : 0;
  const estimatedDue = Math.max(0, retailPrice - credit);

  return {
    retailPrice,
    tradeInCredit: credit,
    estimatedDue,
    formattedRetailPrice: formatPrice(retailPrice),
    formattedTradeInCredit: credit > 0 ? `- ${formatPrice(credit)}` : "GH₵ 0",
    formattedEstimatedDue: formatPrice(estimatedDue),
  };
}
