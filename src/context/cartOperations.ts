import type { CartItem, Product, ProductVariant } from "../types/product";
import { isProductUnavailable } from "../catalog/productCatalog";

export const isSoldOut = (product: Product) => isProductUnavailable(product);

export const getItemEffectivePrice = (item: CartItem): number => {
  if (typeof item.configuredPrice === "number" && item.configuredPrice > 0) {
    return item.configuredPrice;
  }
  return item.product.price;
};

export const isCartItem = (item: unknown): item is CartItem => {
  if (!item || typeof item !== "object") return false;
  const maybe = item as Partial<CartItem>;
  return Boolean(
    maybe.product &&
      typeof maybe.product === "object" &&
      typeof maybe.product.id === "string" &&
      typeof maybe.product.name === "string" &&
      typeof maybe.product.price === "number" &&
      typeof maybe.storage === "string" &&
      typeof maybe.color === "string" &&
      typeof maybe.quantity === "number" &&
      Number.isFinite(maybe.quantity) &&
      maybe.quantity >= 1
  );
};

export const normalizeCartItems = (items: unknown): CartItem[] => {
  if (!Array.isArray(items)) return [];
  return items.filter(isCartItem).map((item) => ({
    ...item,
    quantity: Math.max(1, Math.floor(item.quantity)),
    configuredPrice:
      typeof item.configuredPrice === "number" && item.configuredPrice > 0
        ? item.configuredPrice
        : item.product.price,
  }));
};

export const addCartItem = (
  items: CartItem[],
  product: Product,
  storage = product.storage[0] ?? "",
  color = product.colors[0] ?? "",
  quantity = 1,
  variant?: ProductVariant
): CartItem[] => {
  if (isSoldOut(product)) return items;
  const nextQuantity = Math.max(1, Math.floor(quantity));

  const matchedVariant =
    variant ??
    product.variants?.find((v) => v.storage === storage && v.available !== false) ??
    product.variants?.[0];

  const variantId = matchedVariant?.id;
  const variantTitle = matchedVariant?.title;
  const configuredPrice = matchedVariant ? matchedVariant.price : product.price;
  const originalPrice = matchedVariant?.previousPrice ?? product.previousPrice ?? product.oldPrice ?? null;
  const effectiveStock = matchedVariant ? matchedVariant.stockQuantity : product.stockQuantity;

  const existing = items.find(
    (item) =>
      item.product.id === product.id &&
      item.storage === storage &&
      item.color === color &&
      (!variantId || item.variantId === variantId)
  );

  if (existing) {
    return items.map((item) =>
      item === existing
        ? {
            ...item,
            product,
            variantId: variantId ?? item.variantId,
            variantTitle: variantTitle ?? item.variantTitle,
            configuredPrice,
            originalPrice,
            quantity: Math.min(effectiveStock, item.quantity + nextQuantity),
          }
        : item
    );
  }

  return [
    ...items,
    {
      product,
      storage,
      color,
      variantId,
      variantTitle,
      configuredPrice,
      originalPrice,
      quantity: Math.min(effectiveStock, nextQuantity),
    },
  ];
};

export const removeCartItem = (
  items: CartItem[],
  productId: string,
  storage: string,
  color: string,
  variantId?: string
): CartItem[] =>
  items.filter(
    (item) =>
      !(
        item.product.id === productId &&
        item.storage === storage &&
        item.color === color &&
        (variantId === undefined || item.variantId === variantId)
      )
  );

export const clampCartQuantity = (quantity: number) =>
  Number.isFinite(quantity) ? Math.max(1, Math.floor(quantity)) : 1;

export const updateCartQuantity = (
  items: CartItem[],
  productId: string,
  storage: string,
  color: string,
  quantity: number,
  variantId?: string
): CartItem[] =>
  items.map((item) => {
    const matches =
      item.product.id === productId &&
      item.storage === storage &&
      item.color === color &&
      (variantId === undefined || item.variantId === variantId);

    if (!matches) return item;
    const maxStock = item.product.stockQuantity;
    return { ...item, quantity: Math.min(maxStock, clampCartQuantity(quantity)) };
  });

export const cartSubtotal = (items: CartItem[]): number =>
  items.reduce((sum, item) => sum + getItemEffectivePrice(item) * item.quantity, 0);

export const cartTotalItems = (items: CartItem[]): number =>
  items.reduce((sum, item) => sum + item.quantity, 0);
