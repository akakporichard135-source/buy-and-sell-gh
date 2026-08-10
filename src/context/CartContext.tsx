import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useProductCatalog } from "../catalog/ProductCatalogContext";
import type { CartItem, Product } from "../types/product";
import { addCartItem, cartSubtotal, cartTotalItems, normalizeCartItems, removeCartItem, updateCartQuantity, isSoldOut } from "./cartOperations";

interface CartContextValue {
  items: CartItem[];
  addItem: (product: Product, storage?: string, color?: string, quantity?: number) => boolean;
  removeItem: (productId: string, storage: string, color: string) => void;
  updateQuantity: (productId: string, storage: string, color: string, quantity: number) => void;
  clearCart: () => void;
  toast: string | null;
  dismissToast: () => void;
  subtotal: number;
  totalItems: number;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);
const STORAGE_KEY = "buyandsell-gh-cart";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { getProductBySlug } = useProductCatalog();
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? normalizeCartItems(JSON.parse(saved)) : [];
    } catch {
      localStorage.removeItem(STORAGE_KEY);
      return [];
    }
  });
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      setToast("Cart could not be saved on this device.");
    }
  }, [items]);

  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => setToast(null), 3200);
    return () => window.clearTimeout(id);
  }, [toast]);

  const addItem = (product: Product, storage = product.storage[0], color = product.colors[0], quantity = 1) => {
    const currentProduct = getProductBySlug(product.slug);
    if (!currentProduct) {
      setToast(`${product.name} is not available for cart right now.`);
      return false;
    }
    if (isSoldOut(currentProduct)) {
      setToast(`${currentProduct.name} is not available for cart right now.`);
      return false;
    }
    if (quantity > currentProduct.stockQuantity) {
      setToast(`Only ${currentProduct.stockQuantity} ${currentProduct.name} available right now.`);
      return false;
    }
    setItems((current) => addCartItem(current, currentProduct, storage, color, quantity));
    setToast(`${currentProduct.name} added to cart.`);
    return true;
  };

  const removeItem = (productId: string, storage: string, color: string) => {
    setItems((current) => removeCartItem(current, productId, storage, color));
  };

  const updateQuantity = (productId: string, storage: string, color: string, quantity: number) => {
    setItems((current) => updateCartQuantity(current, productId, storage, color, quantity));
  };

  const value = useMemo(
    () => ({
      items,
      addItem,
      removeItem,
      updateQuantity,
      clearCart: () => setItems([]),
      toast,
      dismissToast: () => setToast(null),
      subtotal: cartSubtotal(items),
      totalItems: cartTotalItems(items),
    }),
    [items, toast],
  );

  return (
    <CartContext.Provider value={value}>
      {children}
      {toast && (
        <div className="cart-toast" role="status" aria-live="polite">
          <span>{toast}</span>
          <button type="button" aria-label="Dismiss notification" onClick={() => setToast(null)}>
            Dismiss
          </button>
        </div>
      )}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used inside CartProvider");
  }
  return context;
};
