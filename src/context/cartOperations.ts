import type { CartItem, Product } from "../types/product";

export const isSoldOut = (product: Product) => product.stockStatus === "Sold Out" || product.stockQuantity < 1;

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

export const addCartItem = (items: CartItem[], product: Product, storage = product.storage[0] ?? "", color = product.colors[0] ?? "") => {
  if (isSoldOut(product)) return items;

  const existing = items.find(
    (item) => item.product.id === product.id && item.storage === storage && item.color === color,
  );

  if (existing) {
    return items.map((item) =>
      item.product.id === product.id && item.storage === storage && item.color === color
        ? { ...item, quantity: item.quantity + 1 }
        : item,
    );
  }

  return [...items, { product, storage, color, quantity: 1 }];
};

export const removeCartItem = (items: CartItem[], productId: string, storage: string, color: string) =>
  items.filter((item) => !(item.product.id === productId && item.storage === storage && item.color === color));

export const clampCartQuantity = (quantity: number) =>
  Number.isFinite(quantity) ? Math.max(1, Math.floor(quantity)) : 1;

export const updateCartQuantity = (items: CartItem[], productId: string, storage: string, color: string, quantity: number) =>
  items.map((item) =>
    item.product.id === productId && item.storage === storage && item.color === color
      ? { ...item, quantity: clampCartQuantity(quantity) }
      : item,
  );

export const cartSubtotal = (items: CartItem[]) =>
  items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

export const cartTotalItems = (items: CartItem[]) => items.reduce((sum, item) => sum + item.quantity, 0);
