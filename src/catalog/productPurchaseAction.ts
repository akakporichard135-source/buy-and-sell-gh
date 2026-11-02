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
  if (product.stockQuantity <= 0) {
    return "Stock Quantity must be greater than 0 to use Buy.";
  }
  if (product.stockStatus !== "In Stock" && product.stockStatus !== "Low Stock") {
    return "Stock Status must be In Stock or Low Stock to use Buy.";
  }
  if (!isProductOrderable(product)) {
    return "Publish this product on the storefront before selecting Buy.";
  }
  if (!isProductPurchasable(product)) {
    return "Buy requires an approved product image.";
  }
  if (product.variants && product.variants.length > 0) {
    const unpricedVariant = product.variants.find(
      (variant) => variant.available && variant.stockQuantity > 0 && (!Number.isFinite(variant.price) || variant.price <= 0)
    );
    if (unpricedVariant) {
      return `Variant ${unpricedVariant.title || unpricedVariant.storage || unpricedVariant.id} needs a price greater than 0.`;
    }
    const unavailableStatus = product.variants.find(
      (variant) => variant.available && variant.stockQuantity > 0 &&
        variant.price > 0 && variant.stockStatus !== "In Stock" && variant.stockStatus !== "Low Stock"
    );
    if (unavailableStatus) {
      return `Variant ${unavailableStatus.title || unavailableStatus.storage || unavailableStatus.id} needs In Stock or Low Stock status.`;
    }
    const hasPricedStockedVariant = product.variants.some(
      (variant) => variant.available && variant.price > 0 && variant.stockQuantity > 0 &&
        (variant.stockStatus === "In Stock" || variant.stockStatus === "Low Stock")
    );
    if (!hasPricedStockedVariant) {
      const pricedVariant = product.variants.find((variant) => variant.available && variant.price > 0);
      if (pricedVariant) {
        return `Variant ${pricedVariant.title || pricedVariant.storage || pricedVariant.id} needs Stock Quantity above 0 and In Stock or Low Stock status.`;
      }
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
