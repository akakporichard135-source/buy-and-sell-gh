import type { Product } from "../types/product";
import { isProductPurchasable, isProductOrderable } from "./productCatalog";

export type ProductPurchaseAction = "buy" | "view-pricing" | "enquire";
const actionTag = "purchase-action:";

export function getProductPurchaseAction(product: Product): ProductPurchaseAction {
  const saved = product.tags?.find((tag) => tag.startsWith(actionTag))?.slice(actionTag.length);
  if (saved === "buy" || saved === "view-pricing" || saved === "enquire") return saved;
  return isProductPurchasable(product) ? "buy" : "view-pricing";
}

export function withProductPurchaseAction(tags: string[] = [], action: ProductPurchaseAction): string[] {
  return [...tags.filter((tag) => !tag.startsWith(actionTag)), `${actionTag}${action}`];
}

export function getBuyConfigurationError(product: Product): string | null {
  if (product.priceOnRequest || !Number.isFinite(product.price) || product.price <= 0) {
    return "Buy requires a confirmed price and Contact for Price must be off.";
  }
  if (!isProductOrderable(product)) {
    return "Buy requires a published product with confirmed available stock.";
  }
  if (!isProductPurchasable(product)) {
    return "Buy requires an approved product image.";
  }
  if (product.storage.length > 1 && (!product.variants || product.variants.length === 0)) {
    return "Buy requires priced variants for the listed storage options.";
  }
  if (product.variants && product.variants.length > 0) {
    const hasPricedStockedVariant = product.variants.some(
      (variant) => variant.available && variant.price > 0 && variant.stockQuantity > 0
    );
    if (!hasPricedStockedVariant) {
      return "Buy requires at least one active, priced variant in stock.";
    }
  }
  return null;
}

export function getPublicPurchaseAction(product: Product): ProductPurchaseAction {
  const configured = getProductPurchaseAction(product);
  return configured === "buy" && getBuyConfigurationError(product)
    ? "view-pricing"
    : configured;
}
