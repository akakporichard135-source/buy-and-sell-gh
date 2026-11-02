import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useProductCatalog } from "../catalog/ProductCatalogContext";
import { getPublicPurchaseAction } from "../catalog/productPurchaseAction";
import type { CartItem, Product, ProductVariant } from "../types/product";
import type { CartPromotionResult, PromotionCampaign } from "../types/promotion";
import { addCartItem, cartItemKey, cartSubtotal, cartTotalItems, normalizeCartItems, removeCartItem, replaceCartItem, updateCartQuantity, isSoldOut, getItemEffectivePrice } from "./cartOperations";
import { evaluateCartPromotions, freeGiftToCartItem } from "../promotions/promotionEngine";
import { fetchPromotions, subscribeToPromotions } from "../promotions/supabasePromotionsRepository";

interface CartContextValue {
  items: CartItem[];
  effectiveItems: CartItem[];
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
  rawSubtotal: number;
  discountAmount: number;
  totalItems: number;
  promotions: PromotionCampaign[];
  promotionResult: CartPromotionResult;
  refreshPromotions: () => Promise<void>;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);
const STORAGE_KEY = "buyandsell-gh-cart";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { getProductBySlug, backendStatus, loading } = useProductCatalog();
  const [promotions, setPromotions] = useState<PromotionCampaign[]>([]);
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

  const refreshPromotions = useCallback(async () => {
    const fresh = await fetchPromotions(false);
    setPromotions(fresh);
  }, []);

  // Load and subscribe to promotions
  useEffect(() => {
    void refreshPromotions();
    const unsubscribe = subscribeToPromotions(() => {
      void refreshPromotions();
    });
    return unsubscribe;
  }, [refreshPromotions]);

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

  const resolveSelection = (product: Product, storage: string, variant?: ProductVariant) => {
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
    if (getPublicPurchaseAction(liveProduct) !== "buy") {
      setToast(`${liveProduct.name} is not configured for direct purchase yet.`);
      return null;
    }
    // A configured variant must still exist under the canonical product ID.
    const liveVariant = variant
      ? liveProduct.variants?.find((candidate) => candidate.id === variant.id)
      : undefined;
    if (variant && !liveVariant && backendStatus === "supabase") {
      setToast("This product configuration is no longer available.");
      return null;
    }
    if (backendStatus === "supabase" && (liveProduct.variants?.length ?? 0) > 0 && !liveVariant) {
      setToast("Select an available priced variant before adding this product.");
      return null;
    }
    if (liveVariant && (
      liveVariant.available === false || liveVariant.stockQuantity <= 0 ||
      !Number.isFinite(liveVariant.price) || liveVariant.price <= 0 ||
      (liveVariant.storage && storage && liveVariant.storage.toLowerCase() !== storage.toLowerCase())
    )) {
      setToast("The selected variant is unavailable or does not match the chosen storage.");
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
    const selection = resolveSelection(product, storage, variant);
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
    const selection = resolveSelection(product, storage, variant);
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

  const promotionResult = useMemo(() => {
    return evaluateCartPromotions(items, promotions);
  }, [items, promotions]);

  const effectiveItems = useMemo(() => {
    // 1. Map standard items with any calculated discount
    const enrichedStandardItems = items.map((item) => {
      const key = cartItemKey(item);
      const discount = promotionResult.itemDiscounts[key] || 0;
      if (discount > 0) {
        return {
          ...item,
          promotionalDiscount: discount,
          originalPrice: item.configuredPrice || item.product.price,
        } as CartItem;
      }
      return item;
    });

    // 2. Append free gifts
    const giftCartItems = promotionResult.freeGifts.map((gift) => {
      const catalogProd = getProductBySlug(gift.productSlug);
      return freeGiftToCartItem(gift, catalogProd);
    });

    return [...enrichedStandardItems, ...giftCartItems];
  }, [items, promotionResult, getProductBySlug]);

  const rawSubtotal = useMemo(() => cartSubtotal(items), [items]);
  const subtotal = promotionResult.finalSubtotal;
  const totalItems = useMemo(() => cartTotalItems(items), [items]);

  const cartActions = useMemo(
    () => ({
      addItem,
      replaceItem,
      removeItem,
      updateQuantity,
    }),
    [getProductBySlug, backendStatus, loading, items, toast],
  );

  const value = useMemo(
    () => ({
      items,
      effectiveItems,
      addItem: cartActions.addItem,
      replaceItem: cartActions.replaceItem,
      removeItem: cartActions.removeItem,
      updateQuantity: cartActions.updateQuantity,
      clearCart: () => setItems([]),
      toast,
      dismissToast: () => setToast(null),
      subtotal,
      rawSubtotal,
      discountAmount: promotionResult.totalDiscount,
      totalItems,
      promotions,
      promotionResult,
      refreshPromotions,
    }),
    [items, effectiveItems, toast, subtotal, rawSubtotal, promotionResult, totalItems, promotions, cartActions, refreshPromotions],
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
