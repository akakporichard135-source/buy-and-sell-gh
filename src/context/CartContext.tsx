import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { CartItem, Product } from "../types/product";

interface CartContextValue {
  items: CartItem[];
  addItem: (product: Product, storage?: string, color?: string) => void;
  removeItem: (productId: string, storage: string, color: string) => void;
  updateQuantity: (productId: string, storage: string, color: string, quantity: number) => void;
  clearCart: () => void;
  subtotal: number;
  totalItems: number;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);
const STORAGE_KEY = "buyandsell-gh-cart";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? (JSON.parse(saved) as CartItem[]) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addItem = (product: Product, storage = product.storage[0], color = product.colors[0]) => {
    setItems((current) => {
      const existing = current.find(
        (item) => item.product.id === product.id && item.storage === storage && item.color === color,
      );
      if (existing) {
        return current.map((item) =>
          item.product.id === product.id && item.storage === storage && item.color === color
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }
      return [...current, { product, storage, color, quantity: 1 }];
    });
  };

  const removeItem = (productId: string, storage: string, color: string) => {
    setItems((current) =>
      current.filter((item) => !(item.product.id === productId && item.storage === storage && item.color === color)),
    );
  };

  const updateQuantity = (productId: string, storage: string, color: string, quantity: number) => {
    if (quantity < 1) {
      removeItem(productId, storage, color);
      return;
    }
    setItems((current) =>
      current.map((item) =>
        item.product.id === productId && item.storage === storage && item.color === color ? { ...item, quantity } : item,
      ),
    );
  };

  const value = useMemo(
    () => ({
      items,
      addItem,
      removeItem,
      updateQuantity,
      clearCart: () => setItems([]),
      subtotal: items.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
      totalItems: items.reduce((sum, item) => sum + item.quantity, 0),
    }),
    [items],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used inside CartProvider");
  }
  return context;
};
