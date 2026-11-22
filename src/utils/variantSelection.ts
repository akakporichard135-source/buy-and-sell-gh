import type { Product, ProductVariant } from "../types/product";

export interface VariantSelectionInput {
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

export type VariantRejectionReason =
  | "missing_product"
  | "out_of_stock"
  | "enquiry_only"
  | "invalid_storage"
  | "variant_unavailable"
  | "unpriced";

export interface ResolvedVariantSelection {
  product?: Product;
  variant?: ProductVariant;
  matchType: "exact_variant" | "non_storage_variant" | "product_base" | "unavailable";
  purchasable: boolean;
  reason?: VariantRejectionReason;
  errorMessage?: string;
  price: number;
  previousPrice: number | null;
  isSale: boolean;
  effectiveStock: number;
  resolvedStorage: string;
  resolvedColor: string;
  colorVariantId: string;
}

/**
 * Normalize specification values for reliable matching ("256 GB" === "256GB", "Wi-Fi + Cellular" === "wificellular").
 */
export function normalizeSpecToken(val?: string | null): string {
  return String(val ?? "")
    .trim()
    .toLowerCase()
    .replace(/\bgrey\b/g, "gray")
    .replace(/[^a-z0-9]/g, "");
}

/**
 * Normalize a colour/finish label into a stable canonical slug ("Space Grey" & "Space Gray" -> "space-gray").
 */
export function normalizeColorKey(color?: string | null): string {
  const raw = String(color ?? "")
    .trim()
    .toLowerCase()
    .replace(/\bgrey\b/g, "gray")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return raw || "default";
}

/**
 * Extract the primary colour name when a composite configuration label like
 * "Space Black / 16GB" or "Natural Titanium / Alpine Loop (Orange, Medium)" is passed.
 */
export function extractPrimaryColorLabel(color?: string | null): string {
  const clean = String(color ?? "").trim();
  if (!clean) return "";
  if (clean.includes(" / ")) {
    const parts = clean.split(" / ").map((p) => p.trim()).filter(Boolean);
    // In iPad strings like "11-inch / Blue / Wi-Fi", skip leading screen-size token
    const nonSize = parts.find((p) => !/^\d+(\.\d+)?-inch$/i.test(p) && !/^\d+mm$/i.test(p));
    return nonSize ?? parts[0] ?? clean;
  }
  return clean;
}

/**
 * Build a deterministic, stable colour-variant identifier independent of display casing/spelling.
 * Example: buildColorVariantId("iphone-duo", "Space Black") -> "iphone-duo::space-black"
 */
export function buildColorVariantId(productSlugOrId?: string | null, color?: string | null): string {
  const productKey = String(productSlugOrId ?? "product")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "") || "product";
  const primaryColor = extractPrimaryColorLabel(color);
  return `${productKey}::${normalizeColorKey(primaryColor)}`;
}

export function isVariantPurchasable(variant?: ProductVariant | null): boolean {
  if (!variant) return false;
  return (
    variant.available !== false &&
    variant.stockStatus !== "Out of Stock" &&
    variant.stockStatus !== "Sold" &&
    Number.isFinite(variant.stockQuantity) &&
    variant.stockQuantity > 0 &&
    Number.isFinite(variant.price) &&
    variant.price > 0
  );
}

export function isParentProductInStock(product?: Product | null): boolean {
  if (!product) return false;
  return (
    product.archived !== true &&
    product.available !== false &&
    product.stockStatus !== "Out of Stock" &&
    product.stockStatus !== "Sold" &&
    Number.isFinite(product.stockQuantity) &&
    product.stockQuantity > 0
  );
}

/**
 * Return the unified ordered list of selectable storage/capacity options for a product,
 * combining product.storage and any additional storage values present on product.variants.
 */
export function getSelectableStorageOptions(product?: Product | null): string[] {
  if (!product) return [];
  const seen = new Set<string>();
  const ordered: string[] = [];
  const add = (val?: string | null) => {
    const trimmed = String(val ?? "").trim();
    if (!trimmed) return;
    const tok = normalizeSpecToken(trimmed);
    if (!tok || seen.has(tok)) return;
    seen.add(tok);
    ordered.push(trimmed);
  };
  for (const s of product.storage ?? []) add(s);
  const sortedVariants = [...(product.variants ?? [])].sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
  for (const v of sortedVariants) add(v.storage);
  return ordered;
}

/**
 * Check whether a requested storage option is explicitly listed in product.storage.
 */
function isListedProductStorage(product: Product, storage: string): boolean {
  const target = normalizeSpecToken(storage);
  if (!target) return true;
  if (target === "standard") return true;
  return (product.storage ?? []).some((opt) => normalizeSpecToken(opt) === target);
}

/**
 * Score secondary attributes (chip, memory, screenSize, connectivity, finish, condition) on a variant.
 */
function scoreSecondaryAttributes(variant: ProductVariant, selection: VariantSelectionInput): number {
  let score = 0;
  const finishInput = selection.finish || extractPrimaryColorLabel(selection.color);

  if (selection.chip && variant.chip) {
    score += normalizeSpecToken(selection.chip) === normalizeSpecToken(variant.chip) ? 6 : -4;
  }
  if (selection.memory && variant.memory) {
    score += normalizeSpecToken(selection.memory) === normalizeSpecToken(variant.memory) ? 5 : -3;
  }
  if (selection.screenSize && variant.screenSize) {
    score += normalizeSpecToken(selection.screenSize) === normalizeSpecToken(variant.screenSize) ? 5 : -3;
  }
  if (selection.connectivity && variant.connectivity) {
    score += normalizeSpecToken(selection.connectivity) === normalizeSpecToken(variant.connectivity) ? 4 : -2;
  }
  if (finishInput && variant.finish) {
    score += normalizeSpecToken(finishInput) === normalizeSpecToken(variant.finish) ? 4 : -2;
  }
  if (selection.condition && variant.condition) {
    score += normalizeSpecToken(selection.condition) === normalizeSpecToken(variant.condition) ? 2 : -1;
  }
  return score;
}

function buildEffectiveStock(product: Product, variant?: ProductVariant): number {
  const prodStock = Math.max(0, Number(product.stockQuantity ?? 0));
  if (!variant) return prodStock;
  const varStock = Math.max(0, Number(variant.stockQuantity ?? 0));
  if (prodStock > 0 && varStock > 0) return Math.min(prodStock, varStock);
  return Math.min(prodStock, varStock);
}

function buildVariantSaleInfo(price: number, previousPrice?: number | null, explicitSale?: boolean) {
  const prev = previousPrice && previousPrice > 0 ? previousPrice : null;
  const isSale = Boolean(explicitSale || (prev !== null && prev > price));
  return { previousPrice: prev, isSale };
}

/**
 * Authoritative shared purchasing & variant resolution engine used across:
 * - Product Buy Pages (GenericBuyExperience & all specialized Apple Buy Experiences)
 * - Product Details Page (/product/:slug)
 * - Price Resolution (productPricing.ts)
 * - CartContext & CartOperations
 * - Order Submission (supabaseOrderRepository.ts)
 */
export function resolveProductSelection(
  product?: Product | null,
  selection: VariantSelectionInput = {}
): ResolvedVariantSelection {
  const rawStorage = String(selection.storage ?? "").trim();
  const rawColor = String(selection.color ?? selection.finish ?? "").trim();
  const resolvedColor = rawColor || product?.defaultColor || product?.colors?.[0] || "Standard";
  const colorVariantId = buildColorVariantId(product?.slug || product?.id, resolvedColor);

  if (!product) {
    return {
      product: undefined,
      variant: undefined,
      matchType: "unavailable",
      purchasable: false,
      reason: "missing_product",
      errorMessage: "This product is not available in the current catalogue.",
      price: 0,
      previousPrice: null,
      isSale: false,
      effectiveStock: 0,
      resolvedStorage: rawStorage || "Standard",
      resolvedColor,
      colorVariantId,
    };
  }

  const selectableStorages = getSelectableStorageOptions(product);
  const resolvedStorage = rawStorage || selectableStorages[0] || "Standard";
  const targetStorageToken = normalizeSpecToken(rawStorage);
  const variants = product.variants ?? [];

  const hasBuyTag = Boolean(product.tags?.includes("purchase-action:buy"));
  const isPriceOnRequest = Boolean(product.priceOnRequest && !hasBuyTag);

  const activePricedVariants = variants.filter(isVariantPurchasable);
  const basePrice = product.price > 0 ? product.price : (activePricedVariants[0]?.price ?? 0);

  // 1. Product-level enquiry-only check
  if (isPriceOnRequest) {
    return {
      product,
      variant: undefined,
      matchType: "unavailable",
      purchasable: false,
      reason: "enquiry_only",
      errorMessage: `${product.name} is priced on enquiry. Contact Buy & Sell GH on WhatsApp for availability.`,
      price: basePrice,
      previousPrice: product.previousPrice ?? product.oldPrice ?? null,
      isSale: false,
      effectiveStock: 0,
      resolvedStorage,
      resolvedColor,
      colorVariantId,
    };
  }

  // 2. Authoritative parent product availability & stock check (mirrors Supabase create_order_request_validated)
  if (!isParentProductInStock(product)) {
    return {
      product,
      variant: undefined,
      matchType: "unavailable",
      purchasable: false,
      reason: "out_of_stock",
      errorMessage: `${product.name} is currently out of stock.`,
      price: basePrice,
      previousPrice: product.previousPrice ?? product.oldPrice ?? null,
      isSale: false,
      effectiveStock: 0,
      resolvedStorage,
      resolvedColor,
      colorVariantId,
    };
  }

  // 3. Explicit variantId match (when already bound to a real variant in liveProduct.variants)
  if (selection.variantId && variants.length > 0) {
    const exactById = variants.find((v) => v.id === selection.variantId);
    if (exactById) {
      const variantHasConflictingStorage = Boolean(
        exactById.storage &&
          targetStorageToken &&
          targetStorageToken !== "standard" &&
          normalizeSpecToken(exactById.storage) !== targetStorageToken
      );

      if (!variantHasConflictingStorage) {
        if (!isVariantPurchasable(exactById)) {
          return {
            product,
            variant: exactById,
            matchType: "unavailable",
            purchasable: false,
            reason: "variant_unavailable",
            errorMessage: `The selected ${exactById.storage || exactById.title || "configuration"} variant is currently unavailable.`,
            price: exactById.price > 0 ? exactById.price : basePrice,
            previousPrice: exactById.previousPrice ?? null,
            isSale: Boolean(exactById.isSale),
            effectiveStock: 0,
            resolvedStorage: exactById.storage || resolvedStorage,
            resolvedColor,
            colorVariantId,
          };
        }

        const saleInfo = buildVariantSaleInfo(exactById.price, exactById.previousPrice, exactById.isSale);
        return {
          product,
          variant: exactById,
          matchType: exactById.storage ? "exact_variant" : "non_storage_variant",
          purchasable: true,
          price: exactById.price,
          previousPrice: saleInfo.previousPrice,
          isSale: saleInfo.isSale,
          effectiveStock: buildEffectiveStock(product, exactById),
          resolvedStorage: rawStorage || exactById.storage || resolvedStorage,
          resolvedColor,
          colorVariantId,
        };
      }
      // If exactById had a conflicting storage (e.g. a stale fallback variant attached to a different storage),
      // fall through to re-resolve accurately for the user's chosen storage below.
    }
  }

  // 4. Match against product_variants by storage & secondary configuration options
  const storageBearingVariants = variants.filter((v) => Boolean(v.storage && v.storage.trim()));
  const nonStorageVariants = variants.filter((v) => !v.storage || !v.storage.trim());

  if (storageBearingVariants.length > 0) {
    const effectiveStorageToken = targetStorageToken || normalizeSpecToken(selectableStorages[0]);
    const matchingStorageVariants = effectiveStorageToken
      ? storageBearingVariants.filter((v) => normalizeSpecToken(v.storage) === effectiveStorageToken)
      : [];

    if (matchingStorageVariants.length > 0) {
      // Rank matching variants by secondary attributes (chip, memory, screenSize, connectivity, finish)
      const ranked = [...matchingStorageVariants].sort((a, b) => {
        const diff = scoreSecondaryAttributes(b, selection) - scoreSecondaryAttributes(a, selection);
        if (diff !== 0) return diff;
        return (a.position ?? 0) - (b.position ?? 0);
      });

      const bestPurchasable = ranked.find(isVariantPurchasable);
      if (!bestPurchasable) {
        const unavailableRef = ranked[0];
        return {
          product,
          variant: unavailableRef,
          matchType: "unavailable",
          purchasable: false,
          reason: "variant_unavailable",
          errorMessage: `${product.name} (${rawStorage || unavailableRef.storage}) is currently out of stock.`,
          price: unavailableRef.price > 0 ? unavailableRef.price : basePrice,
          previousPrice: unavailableRef.previousPrice ?? null,
          isSale: Boolean(unavailableRef.isSale),
          effectiveStock: 0,
          resolvedStorage: rawStorage || unavailableRef.storage || resolvedStorage,
          resolvedColor,
          colorVariantId,
        };
      }

      // Guard against explicit finish mismatch if variant specifies a different finish AND all matching-finish variants are unavailable
      const finishInput = selection.finish || extractPrimaryColorLabel(selection.color);
      if (finishInput) {
        const finishSpecific = matchingStorageVariants.filter((v) => Boolean(v.finish && v.finish.trim()));
        if (finishSpecific.length > 0) {
          const matchingFinish = finishSpecific.filter(
            (v) => normalizeSpecToken(v.finish) === normalizeSpecToken(finishInput)
          );
          if (matchingFinish.length > 0 && !matchingFinish.some(isVariantPurchasable)) {
            return {
              product,
              variant: matchingFinish[0],
              matchType: "unavailable",
              purchasable: false,
              reason: "variant_unavailable",
              errorMessage: `${product.name} in ${finishInput} (${rawStorage || bestPurchasable.storage}) is currently out of stock.`,
              price: matchingFinish[0].price > 0 ? matchingFinish[0].price : bestPurchasable.price,
              previousPrice: matchingFinish[0].previousPrice ?? null,
              isSale: Boolean(matchingFinish[0].isSale),
              effectiveStock: 0,
              resolvedStorage: rawStorage || bestPurchasable.storage || resolvedStorage,
              resolvedColor,
              colorVariantId,
            };
          }
        }
      }

      const saleInfo = buildVariantSaleInfo(bestPurchasable.price, bestPurchasable.previousPrice, bestPurchasable.isSale);
      return {
        product,
        variant: bestPurchasable,
        matchType: "exact_variant",
        purchasable: true,
        price: bestPurchasable.price,
        previousPrice: saleInfo.previousPrice,
        isSale: saleInfo.isSale,
        effectiveStock: buildEffectiveStock(product, bestPurchasable),
        resolvedStorage: bestPurchasable.storage || resolvedStorage,
        resolvedColor,
        colorVariantId,
      };
    }

    // No product_variants row exists for this specific storage (e.g., iPhone Duo has storage_options ["256GB", "512GB", "1TB"]
    // while product_variants only defines a "512GB" row, and parent product itself is In Stock at GH₵28,000).
    // Allow ordering against verified parent product inventory ONLY if the chosen storage is an advertised option on product.storage!
    if (rawStorage && isListedProductStorage(product, rawStorage)) {
      if (Number.isFinite(product.price) && product.price > 0) {
        const saleInfo = buildVariantSaleInfo(product.price, product.previousPrice ?? product.oldPrice);
        return {
          product,
          variant: undefined,
          matchType: "product_base",
          purchasable: true,
          price: product.price,
          previousPrice: saleInfo.previousPrice,
          isSale: saleInfo.isSale,
          effectiveStock: buildEffectiveStock(product),
          resolvedStorage: rawStorage,
          resolvedColor,
          colorVariantId,
        };
      }
      return {
        product,
        variant: undefined,
        matchType: "unavailable",
        purchasable: false,
        reason: "unpriced",
        errorMessage: `${product.name} (${rawStorage}) does not have a confirmed price yet.`,
        price: 0,
        previousPrice: null,
        isSale: false,
        effectiveStock: 0,
        resolvedStorage: rawStorage,
        resolvedColor,
        colorVariantId,
      };
    }

    // Storage is neither in product.variants nor in product.storage
    if (rawStorage && nonStorageVariants.length === 0) {
      return {
        product,
        variant: undefined,
        matchType: "unavailable",
        purchasable: false,
        reason: "invalid_storage",
        errorMessage: `The selected storage (${rawStorage}) is not available for ${product.name}.`,
        price: basePrice,
        previousPrice: null,
        isSale: false,
        effectiveStock: 0,
        resolvedStorage: rawStorage,
        resolvedColor,
        colorVariantId,
      };
    }
  }

  // 5. Non-storage variants (Accessories, AirPods, Apple Watches, Magic Keyboard 11"/13", etc.)
  if (nonStorageVariants.length > 0) {
    const scored = [...nonStorageVariants].sort((a, b) => {
      let scoreA = scoreSecondaryAttributes(a, selection);
      let scoreB = scoreSecondaryAttributes(b, selection);
      // Also match compound storage strings (like "46mm / GPS" or "11-inch") against screenSize/connectivity/title
      if (targetStorageToken) {
        const matchField = (v: ProductVariant) => {
          let s = 0;
          if (v.screenSize && targetStorageToken.includes(normalizeSpecToken(v.screenSize))) s += 4;
          if (v.connectivity && targetStorageToken.includes(normalizeSpecToken(v.connectivity))) s += 4;
          if (v.title && normalizeSpecToken(v.title).includes(targetStorageToken)) s += 2;
          return s;
        };
        scoreA += matchField(a);
        scoreB += matchField(b);
      }
      if (scoreB !== scoreA) return scoreB - scoreA;
      return (a.position ?? 0) - (b.position ?? 0);
    });

    const bestPurchasable = scored.find(isVariantPurchasable);
    if (!bestPurchasable) {
      const ref = scored[0];
      return {
        product,
        variant: ref,
        matchType: "unavailable",
        purchasable: false,
        reason: "variant_unavailable",
        errorMessage: `${product.name} is currently out of stock in the selected configuration.`,
        price: ref.price > 0 ? ref.price : basePrice,
        previousPrice: ref.previousPrice ?? null,
        isSale: Boolean(ref.isSale),
        effectiveStock: 0,
        resolvedStorage,
        resolvedColor,
        colorVariantId,
      };
    }

    const saleInfo = buildVariantSaleInfo(bestPurchasable.price, bestPurchasable.previousPrice, bestPurchasable.isSale);
    return {
      product,
      variant: bestPurchasable,
      matchType: "non_storage_variant",
      purchasable: true,
      price: bestPurchasable.price,
      previousPrice: saleInfo.previousPrice,
      isSale: saleInfo.isSale,
      effectiveStock: buildEffectiveStock(product, bestPurchasable),
      resolvedStorage,
      resolvedColor,
      colorVariantId,
    };
  }

  // 6. Products without rows in product_variants (validated directly against authoritative parent product record)
  if (rawStorage && product.storage.length > 0 && !isListedProductStorage(product, rawStorage)) {
    return {
      product,
      variant: undefined,
      matchType: "unavailable",
      purchasable: false,
      reason: "invalid_storage",
      errorMessage: `The selected configuration (${rawStorage}) is not available for ${product.name}.`,
      price: basePrice,
      previousPrice: null,
      isSale: false,
      effectiveStock: 0,
      resolvedStorage: rawStorage,
      resolvedColor,
      colorVariantId,
    };
  }

  if (!Number.isFinite(product.price) || product.price <= 0) {
    return {
      product,
      variant: undefined,
      matchType: "unavailable",
      purchasable: false,
      reason: "unpriced",
      errorMessage: `${product.name} does not have a confirmed price yet.`,
      price: 0,
      previousPrice: null,
      isSale: false,
      effectiveStock: 0,
      resolvedStorage,
      resolvedColor,
      colorVariantId,
    };
  }

  const saleInfo = buildVariantSaleInfo(product.price, product.previousPrice ?? product.oldPrice);
  return {
    product,
    variant: undefined,
    matchType: "product_base",
    purchasable: true,
    price: product.price,
    previousPrice: saleInfo.previousPrice,
    isSale: saleInfo.isSale,
    effectiveStock: buildEffectiveStock(product),
    resolvedStorage,
    resolvedColor,
    colorVariantId,
  };
}
