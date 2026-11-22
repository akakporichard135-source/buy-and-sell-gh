import type { Product, ProductVariant } from "../types/product";
import {
  resolveProductSelection,
  type VariantRejectionReason,
} from "./variantSelection";

export interface ConfiguredPriceOptions {
  storage?: string;
  color?: string;
  finish?: string;
  chip?: string;
  memory?: string;
  screenSize?: string;
  connectivity?: string;
  condition?: string;
  model?: string;
  variantId?: string;
}

export interface ResolvedPriceResult {
  variant?: ProductVariant;
  price: number;
  previousPrice: number | null;
  isSale: boolean;
  formattedPrice: string;
  formattedPreviousPrice?: string;
  isEnquiry: boolean;
  purchasable: boolean;
  effectiveStock: number;
  unavailableReason?: VariantRejectionReason;
  errorMessage?: string;
  colorVariantId: string;
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
 * Resolve the authoritative price, matching variant, and availability for a configured product.
 * Delegates to the shared resolveProductSelection engine so UI display, Cart, and Checkout stay 100% consistent.
 */
export function resolveConfiguredPrice(
  product?: Product,
  options: ConfiguredPriceOptions = {}
): ResolvedPriceResult {
  const resolved = resolveProductSelection(product, options);
  const isEnquiry = !product || resolved.reason === "enquiry_only" || resolved.price <= 0;

  return {
    variant: resolved.variant,
    price: resolved.price,
    previousPrice: resolved.previousPrice,
    isSale: resolved.isSale,
    formattedPrice: isEnquiry
      ? "Price confirmed on enquiry"
      : formatPrice(resolved.price),
    formattedPreviousPrice:
      resolved.isSale && resolved.previousPrice
        ? formatPrice(resolved.previousPrice)
        : undefined,
    isEnquiry,
    purchasable: resolved.purchasable,
    effectiveStock: resolved.effectiveStock,
    unavailableReason: resolved.reason,
    errorMessage: resolved.errorMessage,
    colorVariantId: resolved.colorVariantId,
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

  if (variants.length > 0) {
    const prices = variants.map((v) => v.price).filter((p) => p > 0);
    if (prices.length > 0) {
      const variantMin = Math.min(...prices);
      minPrice = variantMin;
      const lowestVariant = variants.find((v) => v.price === minPrice);
      previousPrice = lowestVariant?.previousPrice ?? undefined;
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
