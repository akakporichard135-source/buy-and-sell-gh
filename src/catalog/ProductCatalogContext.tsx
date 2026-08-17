import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { isSupabaseConfigured } from "../lib/supabase";
import type { Product } from "../types/product";
import {
  archiveProductById,
  deleteProductById,
  fetchProducts,
  markProductOutOfStockById,
  markProductSoldById,
  upsertProduct,
} from "./supabaseProductRepository";
import {
  PRODUCT_CATALOG_STORAGE_KEY,
  createEmptyProduct,
  getProductBySlugFrom,
  normalizeProduct,
  readStoredProducts,
  seedCatalog,
} from "./productCatalog";

interface ProductCatalogValue {
  products: Product[];
  activeProducts: Product[];
  loading: boolean;
  error: string;
  getProductBySlug: (slug: string) => Product | undefined;
  refreshProducts: () => Promise<void>;
  saveProduct: (product: Product) => Promise<Product>;
  archiveProduct: (productId: string) => Promise<void>;
  deleteProduct: (productId: string) => Promise<void>;
  markSold: (productId: string) => Promise<void>;
  markOutOfStock: (productId: string) => Promise<void>;
  resetToSeedCatalog: () => void;
  createDraftProduct: () => Product;
  backendStatus: "supabase" | "supabase-unconfigured" | "static-seed" | "local-catalog" | "error";
}

const ProductCatalogContext = createContext<ProductCatalogValue | undefined>(undefined);

export function ProductCatalogProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>(seedCatalog);
  const [backendStatus, setBackendStatus] = useState<ProductCatalogValue["backendStatus"]>("static-seed");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    void loadProducts();
  }, []);

  useEffect(() => {
    const clearAdminCatalogue = () => {
      setProducts([]);
      void loadProducts();
    };
    window.addEventListener("buyandsell-gh:admin-session-cleared", clearAdminCatalogue);
    return () => window.removeEventListener("buyandsell-gh:admin-session-cleared", clearAdminCatalogue);
  }, []);

  const persistLocal = (nextProducts: Product[]) => {
    const normalized = nextProducts.map(normalizeProduct);
    setProducts(normalized);
    localStorage.setItem(PRODUCT_CATALOG_STORAGE_KEY, JSON.stringify(normalized));
    setBackendStatus("local-catalog");
  };

  const loadProducts = async () => {
    setLoading(true);
    setError("");
    if (isSupabaseConfigured()) {
      try {
        const remoteProducts = await fetchProducts();
        setProducts(remoteProducts);
        setBackendStatus("supabase");
        return;
      } catch {
        setError("Catalogue could not be loaded. Please check Supabase tables, RLS policies and network access.");
        setBackendStatus("error");
        if (import.meta.env.PROD) {
          setProducts([]);
          return;
        }
      } finally {
        setLoading(false);
      }
    }

    const stored = !import.meta.env.PROD ? readStoredProducts() : null;
    if (stored) {
      setProducts(stored);
      setBackendStatus("local-catalog");
    } else {
      setProducts(seedCatalog);
      setBackendStatus(isSupabaseConfigured() ? "static-seed" : "supabase-unconfigured");
    }
    setLoading(false);
  };

  const value = useMemo<ProductCatalogValue>(() => {
    const activeProducts = products.filter((product) => !product.archived && product.available !== false);

    return {
      products,
      activeProducts,
      backendStatus,
      loading,
      error,
      refreshProducts: loadProducts,
      getProductBySlug: (slug) => getProductBySlugFrom(products, slug),
      createDraftProduct: () => createEmptyProduct(products),
      saveProduct: async (product) => {
        const normalized = normalizeProduct({ ...product, updatedAt: new Date().toISOString() });
        if (backendStatus === "supabase") {
          const saved = await upsertProduct(normalized);
          setProducts((current) => {
            const exists = current.some((item) => item.id === saved.id);
            return exists ? current.map((item) => (item.id === saved.id ? saved : item)) : [saved, ...current];
          });
          return saved;
        }
        if (import.meta.env.PROD) throw new Error("Supabase is required for production catalogue writes.");
        const exists = products.some((item) => item.id === normalized.id);
        const next = exists
          ? products.map((item) => (item.id === normalized.id ? normalized : item))
          : [normalized, ...products];
        persistLocal(next);
        return normalized;
      },
      archiveProduct: async (productId) => {
        if (backendStatus === "supabase") {
          const saved = await archiveProductById(productId);
          setProducts((current) => current.map((product) => (product.id === productId ? saved : product)));
          return;
        }
        if (import.meta.env.PROD) throw new Error("Supabase is required for production catalogue writes.");
        persistLocal(products.map((product) => (product.id === productId ? normalizeProduct({ ...product, archived: true }) : product)));
      },
      deleteProduct: async (productId) => {
        if (backendStatus === "supabase") {
          await deleteProductById(productId);
          setProducts((current) => current.filter((product) => product.id !== productId));
          return;
        }
        if (import.meta.env.PROD) throw new Error("Supabase is required for production catalogue writes.");
        persistLocal(products.filter((product) => product.id !== productId));
      },
      markSold: async (productId) => {
        if (backendStatus === "supabase") {
          const saved = await markProductSoldById(productId);
          setProducts((current) => current.map((product) => (product.id === productId ? saved : product)));
          return;
        }
        if (import.meta.env.PROD) throw new Error("Supabase is required for production catalogue writes.");
        persistLocal(products.map((product) => (product.id === productId ? normalizeProduct({ ...product, stockStatus: "Sold", stockQuantity: 0, available: false }) : product)));
      },
      markOutOfStock: async (productId) => {
        if (backendStatus === "supabase") {
          const saved = await markProductOutOfStockById(productId);
          setProducts((current) => current.map((product) => (product.id === productId ? saved : product)));
          return;
        }
        if (import.meta.env.PROD) throw new Error("Supabase is required for production catalogue writes.");
        persistLocal(products.map((product) => (product.id === productId ? normalizeProduct({ ...product, stockStatus: "Out of Stock", stockQuantity: 0, available: false }) : product)));
      },
      resetToSeedCatalog: () => {
        if (import.meta.env.PROD) return;
        localStorage.removeItem(PRODUCT_CATALOG_STORAGE_KEY);
        setProducts(seedCatalog);
        setBackendStatus("static-seed");
      },
    };
  }, [backendStatus, error, loading, products]);

  return <ProductCatalogContext.Provider value={value}>{children}</ProductCatalogContext.Provider>;
}

export const useProductCatalog = () => {
  const context = useContext(ProductCatalogContext);
  if (!context) throw new Error("useProductCatalog must be used inside ProductCatalogProvider");
  return context;
};
