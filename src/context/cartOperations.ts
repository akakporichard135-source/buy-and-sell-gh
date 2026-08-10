import type { CartItem, Product } from "../types/product";
import { isProductUnavailable } from "../catalog/productCatalog";

export const isSoldOut = (product: Product) => isProductUnavailable(product);

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
      maybe.quantity >= 1,
  );
};

export const normalizeCartItems = (items: unknown): CartItem[] => {
  if (!Array.isArray(items)) return [];
  return items.filter(isCartItem).map((item) => ({
    ...item,
    quantity: Math.max(1, Math.floor(item.quantity)),
  }));
};

export const addCartItem = (items: CartItem[], product: Product, storage = product.storage[0] ?? "", color = product.colors[0] ?? "", quantity = 1) => {
  if (isSoldOut(product)) return items;
  const nextQuantity = Math.max(1, Math.floor(quantity));

  const existing = items.find(
    (item) => item.product.id === product.id && item.storage === storage && item.color === color,
  );

  if (existing) {
    return items.map((item) =>
      item.product.id === product.id && item.storage === storage && item.color === color
        ? { ...item, product, quantity: Math.min(product.stockQuantity, item.quantity + nextQuantity) }
        : item,
    );
  }

  return [...items, { product, storage, color, quantity: Math.min(product.stockQuantity, nextQuantity) }];
};

export const removeCartItem = (items: CartItem[], productId: string, storage: string, color: string) =>
  items.filter((item) => !(item.product.id === productId && item.storage === storage && item.color === color));

export const clampCartQuantity = (quantity: number) =>
  Number.isFinite(quantity) ? Math.max(1, Math.floor(quantity)) : 1;

export const updateCartQuantity = (items: CartItem[], productId: string, storage: string, color: string, quantity: number) =>
  items.map((item) =>
    item.product.id === productId && item.storage === storage && item.color === color
      ? { ...item, quantity: Math.min(item.product.stockQuantity, clampCartQuantity(quantity)) }
      : item,
  );

export const cartSubtotal = (items: CartItem[]) =>
  items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

export const cartTotalItems = (items: CartItem[]) => items.reduce((sum, item) => sum + item.quantity, 0);
