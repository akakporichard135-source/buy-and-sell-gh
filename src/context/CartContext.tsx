import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useProductCatalog } from "../catalog/ProductCatalogContext";
import type { CartItem, Product, ProductVariant } from "../types/product";
import { addCartItem, cartItemKey, cartSubtotal, cartTotalItems, normalizeCartItems, removeCartItem, replaceCartItem, updateCartQuantity, isSoldOut } from "./cartOperations";

interface CartContextValue {
  items: CartItem[];
  addItem: (
    product: Product,
    storage?: string,
    color?: string,
    quantity?: number,
    variant?: ProductVariant,
    colorImageSrc?: string,
    options?: Record<string, string>,
  ) => boolean;
  replaceItem: (
    originalKey: string,
    product: Product,
    storage: string,
    color: string,
    quantity: number,
    variant?: ProductVariant,
    colorImageSrc?: string,
    options?: Record<string, string>,
  ) => boolean;
  removeItem: (productId: string, storage: string, color: string, variantId?: string) => void;
  updateQuantity: (
    productId: string,
    storage: string,
    color: string,
    quantity: number,
    variantId?: string
  ) => void;
  clearCart: () => void;
  toast: string | null;
  dismissToast: () => void;
  subtotal: number;
  totalItems: number;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);
const STORAGE_KEY = "buyandsell-gh-cart";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { getProductBySlug, backendStatus, loading } = useProductCatalog();
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

  const resolveSelection = (product: Product, variant?: ProductVariant) => {
    if (loading || (import.meta.env.PROD && backendStatus !== "supabase")) {
      setToast("Please wait for current product availability to load.");
      return null;
    }
    const liveProduct = getProductBySlug(product.slug);
    if (!liveProduct) {
      if (backendStatus === "supabase") {
        setToast("This product is not available in the current catalogue.");
        return null;
      }
      return { product, variant };
    }
    if (liveProduct.archived || liveProduct.available === false || isSoldOut(liveProduct)) {
      setToast(`${liveProduct.name} is currently out of stock.`);
      return null;
    }
    // Match variant by ID first, then by title, or retain the configured variant
    const liveVariant = variant
      ? (liveProduct.variants?.find((candidate) => candidate.id === variant.id) ||
         liveProduct.variants?.find((candidate) => candidate.title === variant.title))
      : undefined;
    if (variant && !liveVariant && backendStatus === "supabase") {
      setToast("This product configuration is no longer available.");
      return null;
    }

    return { product: liveProduct, variant: liveVariant ?? variant };
  };

  // Reconcile cart items with authoritative database product IDs when catalog loads
  useEffect(() => {
    setItems((currentItems) => {
      let changed = false;
      const nextItems = currentItems.map((item) => {
        const catalogProd = getProductBySlug(item.product.slug);
        if (
          catalogProd &&
          catalogProd.id !== item.product.id &&
          !isSoldOut(catalogProd)
        ) {
          changed = true;
          return {
            ...item,
            product: {
              ...item.product,
              id: catalogProd.id,
            },
          };
        }
        return item;
      });
      return changed ? nextItems : currentItems;
    });
  }, [getProductBySlug]);

  const addItem = (
    product: Product,
    storage = product.storage[0],
    color = product.colors[0],
    quantity = 1,
    variant?: ProductVariant,
    colorImageSrc?: string,
    options?: Record<string, string>,
  ) => {
    const selection = resolveSelection(product, variant);
    if (!selection) return false;
    const { product: currentProduct, variant: currentVariant } = selection;
    const effectiveStock = Math.min(currentProduct.stockQuantity, currentVariant?.stockQuantity ?? currentProduct.stockQuantity);
    const existingQuantity = items
      .filter((item) => item.product.id === currentProduct.id && item.storage === storage && item.color === color &&
        (!currentVariant?.id || item.variantId === currentVariant.id))
      .reduce((sum, item) => sum + item.quantity, 0);
    const productQuantity = items
      .filter((item) => item.product.id === currentProduct.id)
      .reduce((sum, item) => sum + item.quantity, 0);
    if (currentVariant?.available === false || existingQuantity + quantity > effectiveStock ||
      productQuantity + quantity > currentProduct.stockQuantity) {
      setToast(`Only ${effectiveStock} ${currentProduct.name} available right now.`);
      return false;
    }
    setItems((current) => addCartItem(current, currentProduct, storage, color, quantity, currentVariant, colorImageSrc, options));
    setToast(`${currentProduct.name} added to cart.`);
    return true;
  };

  const replaceItem: CartContextValue["replaceItem"] = (
    originalKey, product, storage, color, quantity, variant, colorImageSrc, options,
  ) => {
    // Find the existing item by direct cartItemKey or by matching slug/variant
    const existing = items.find((item) =>
      cartItemKey(item) === originalKey ||
      JSON.stringify([item.product.slug, item.storage, item.color, item.variantId ?? ""]) === originalKey ||
      (item.product.slug === product.slug && item.storage === storage && item.color === color)
    );
    const targetKey = existing ? cartItemKey(existing) : originalKey;
    if (!existing && !items.some((item) => cartItemKey(item) === originalKey)) {
      setToast("This item is no longer in your bag. Review your bag before adding it again.");
      return false;
    }
    const selection = resolveSelection(product, variant);
    if (!selection) return false;
    const { product: currentProduct, variant: currentVariant } = selection;
    const effectiveStock = Math.min(currentProduct.stockQuantity, currentVariant?.stockQuantity ?? currentProduct.stockQuantity);
    const existingQuantity = items
      .filter((item) => cartItemKey(item) !== targetKey && item.product.id === currentProduct.id &&
        item.storage === storage && item.color === color && (!currentVariant?.id || item.variantId === currentVariant.id))
      .reduce((sum, item) => sum + item.quantity, 0);
    const productQuantity = items
      .filter((item) => cartItemKey(item) !== targetKey && item.product.id === currentProduct.id)
      .reduce((sum, item) => sum + item.quantity, 0);
    if (currentVariant?.available === false || existingQuantity + quantity > effectiveStock ||
      productQuantity + quantity > currentProduct.stockQuantity) {
      setToast(`${currentProduct.name} is not available in the selected quantity.`);
      return false;
    }
    setItems((current) => replaceCartItem(
      current, targetKey, currentProduct, storage, color, quantity, currentVariant, colorImageSrc, options,
    ));
    setToast(`${currentProduct.name} updated in your bag.`);
    return true;
  };

  const removeItem = (productId: string, storage: string, color: string, variantId?: string) => {
    setItems((current) => removeCartItem(current, productId, storage, color, variantId));
  };

  const updateQuantity = (
    productId: string,
    storage: string,
    color: string,
    quantity: number,
    variantId?: string
  ) => {
    setItems((current) => updateCartQuantity(current, productId, storage, color, quantity, variantId));
  };

  const value = useMemo(
    () => ({
      items,
      addItem,
      replaceItem,
      removeItem,
      updateQuantity,
      clearCart: () => setItems([]),
      toast,
      dismissToast: () => setToast(null),
      subtotal: cartSubtotal(items),
      totalItems: cartTotalItems(items),
    }),
    [getProductBySlug, backendStatus, loading, items, toast],
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
