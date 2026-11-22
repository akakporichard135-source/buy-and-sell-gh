import type { Product } from "../types/product";
import { isProductPurchasable, isProductOrderable } from "./productCatalog";
import { isParentProductInStock, isVariantPurchasable } from "../utils/variantSelection";

export type ProductPurchaseAction = "buy" | "view-pricing" | "enquire";
const actionTag = "purchase-action:";

export function isDeviceProduct(product: Product): boolean {
  if ((product.category as string) === "Services") return false;
  if (product.tags?.some((t) => t.toLowerCase() === "service" || t.toLowerCase() === "repair")) return false;
  return true;
}

export function getProductPurchaseAction(product: Product): ProductPurchaseAction {
  const saved = product.tags?.find((tag) => tag.startsWith(actionTag))?.slice(actionTag.length);
  if (saved === "buy" || saved === "view-pricing" || saved === "enquire") return saved;
  // Default to "buy" for published device products unless blocked
  return isProductPurchasable(product) ? "buy" : "view-pricing";
}

export function withProductPurchaseAction(tags: string[] = [], action: ProductPurchaseAction): string[] {
  return [...tags.filter((tag) => !tag.startsWith(actionTag)), `${actionTag}${action}`];
}

export function getBuyConfigurationError(product: Product): string | null {
  const variants = product.variants ?? [];
  const activeVariants = variants.filter((v) => v.available !== false);

  const activePriced = activeVariants.filter((v) => v.price > 0);
  const minVariantPrice = activePriced.length > 0 ? Math.min(...activePriced.map((v) => v.price)) : Infinity;
  const effectivePrice = product.price > 0 ? product.price : (Number.isFinite(minVariantPrice) ? minVariantPrice : 0);

  if (product.priceOnRequest || !Number.isFinite(effectivePrice) || effectivePrice <= 0) {
    return "Buy requires a confirmed price and Contact for Price must be off.";
  }

  // Strictly honour authoritative parent stock status and quantity (matches Supabase order RPC)
  if (product.stockStatus === "Out of Stock" || product.stockStatus === "Sold") {
    return "Stock Status must be In Stock or Low Stock to use Buy.";
  }
  const parentStock = typeof product.stockQuantity === "number" ? product.stockQuantity : 0;
  if (parentStock <= 0) {
    return "Stock Quantity must be greater than 0 to use Buy.";
  }
  if (!isParentProductInStock(product)) {
    return "Stock Status must be In Stock or Low Stock to use Buy.";
  }
  if (!isProductOrderable(product)) {
    return "Publish this product on the storefront before selecting Buy.";
  }
  if (!isProductPurchasable(product)) {
    return "Buy requires an approved product image.";
  }
  if (variants.length > 0) {
    const unpricedVariant = activeVariants.find(
      (variant) => variant.stockQuantity > 0 && (!Number.isFinite(variant.price) || variant.price <= 0)
    );
    if (unpricedVariant) {
      return `Variant ${unpricedVariant.title || unpricedVariant.storage || unpricedVariant.id} needs a price greater than 0.`;
    }
    const hasPricedStockedVariant = activeVariants.some(isVariantPurchasable);
    if (!hasPricedStockedVariant) {
      const pricedVariant = activeVariants.find((variant) => variant.price > 0);
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
