import { categories as seedCategories, products as seedProducts } from "../data/products";
import type { Product, ProductCategory, ProductCondition, StockStatus } from "../types/product";

export const PRODUCT_CATALOG_STORAGE_KEY = "buyandsell-gh-product-catalog";

export const stockStatuses: StockStatus[] = ["In Stock", "Low Stock", "Out of Stock", "Sold"];
export const productConditions: ProductCondition[] = ["Brand New", "UK Used", "Excellent", "Very Good"];

export const categories: ProductCategory[] = seedCategories;
export const conditions = productConditions;

type LegacyStockStatus = StockStatus | "In stock" | "Limited stock" | "Low stock" | "On request" | "Sold Out";

export const normalizeStockStatus = (product: Pick<Product, "stockQuantity"> & { stockStatus: LegacyStockStatus }): StockStatus => {
  if (product.stockStatus === "Sold" || product.stockStatus === "Sold Out") return "Sold";
  if (product.stockQuantity < 1) return "Out of Stock";
  if (product.stockStatus === "Limited stock" || product.stockStatus === "Low stock") return "Low Stock";
  if (product.stockStatus === "On request") return "Low Stock";
  return product.stockStatus === "Low Stock" || product.stockStatus === "Out of Stock" ? product.stockStatus : "In Stock";
};

export const normalizeCondition = (condition: Product["condition"] | "New" | "Refurbished" | "Used"): ProductCondition => {
  if (condition === "New") return "Brand New";
  if (condition === "Refurbished") return "Excellent";
  if (condition === "Used") return "Very Good";
  return condition;
};

export const isProductUnavailable = (product: Product) => {
  const status = normalizeStockStatus(product);
  return status === "Sold" || status === "Out of Stock" || product.archived === true || product.available === false;
};

export const getPrimaryImage = (product: Product) => {
  const index = product.primaryImageIndex ?? 0;
  return product.images[index] ?? product.images[0];
};

export const normalizeProduct = (product: Product): Product => {
  const stockStatus = normalizeStockStatus(product);
  const now = new Date().toISOString();
  const previousPrice = product.previousPrice ?? product.oldPrice;
  const specs = product.specifications ?? product.specs;
  const includedItems = product.includedItems ?? product.box;
  const warranty = product.warranty ?? product.warrantyInfo;
  const deliveryInfo = product.deliveryInfo ?? product.deliveryNote;
  const primaryImage = product.images[product.primaryImageIndex ?? 0] ?? product.images[0];

  return {
    ...product,
    previousPrice,
    oldPrice: previousPrice,
    priceOnRequest: product.priceOnRequest ?? product.price <= 0,
    defaultColor: product.defaultColor ?? product.colors[0] ?? "",
    condition: normalizeCondition(product.condition),
    stockStatus,
    badges: product.badges?.map((badge) => (badge === "Sold Out" ? "Sold" : badge === "Limited Stock" ? "Low Stock" : badge)),
    popular: product.popular ?? product.isPopular ?? false,
    newArrival: product.newArrival ?? product.isNewArrival ?? false,
    featured: product.featured ?? product.isFeatured ?? false,
    available: product.available ?? (stockStatus !== "Sold" && stockStatus !== "Out of Stock"),
    isPopular: product.popular ?? product.isPopular ?? false,
    isNewArrival: product.newArrival ?? product.isNewArrival ?? false,
    isFeatured: product.featured ?? product.isFeatured ?? false,
    primaryImageIndex: product.primaryImageIndex ?? 0,
    thumbnail: product.thumbnail ?? primaryImage?.src,
    shortDescription: product.shortDescription ?? product.description,
    specifications: specs,
    specs,
    includedItems,
    box: includedItems,
    warranty,
    warrantyInfo: warranty,
    deliveryInfo,
    deliveryNote: deliveryInfo,
    createdAt: product.createdAt ?? now,
    updatedAt: product.updatedAt ?? now,
  };
};

export const seedCatalog = seedProducts.map(normalizeProduct);

export const getProductBySlugFrom = (products: Product[], slug: string) =>
  products.find((product) => product.slug === slug && !product.archived);

export const createProductSlug = (name: string, existingProducts: Product[], fallback = "product") => {
  const base = (name || fallback)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || fallback;
  let next = base;
  let index = 2;
  while (existingProducts.some((product) => product.slug === next)) {
    next = `${base}-${index}`;
    index += 1;
  }
  return next;
};

export const createEmptyProduct = (existingProducts: Product[]): Product =>
  normalizeProduct({
    id: `product-${Date.now()}`,
    slug: createProductSlug("new-product", existingProducts),
    name: "",
    brand: "Apple",
    category: "iPhones",
    subcategory: "",
    model: "",
    generation: "",
    price: 0,
    priceOnRequest: false,
    storage: [],
    condition: "Brand New",
    colors: [],
    defaultColor: "",
    stockQuantity: 1,
    stockStatus: "In Stock",
    imageTone: "from-white via-zinc-100 to-yellow-100",
    badges: [],
    popular: false,
    newArrival: false,
    featured: false,
    available: true,
    tags: [],
    images: [],
    primaryImageIndex: 0,
    batteryHealth: "",
    warranty: "",
    warrantyInfo: "",
    deliveryInfo: "",
    deliveryNote: "",
    description: "",
    shortDescription: "",
    specs: [],
    specifications: [],
    box: [],
    includedItems: [],
    conditionReport: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

export const readStoredProducts = () => {
  try {
    const stored = localStorage.getItem(PRODUCT_CATALOG_STORAGE_KEY);
    if (!stored) return null;
    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) return null;
    return parsed.filter((item): item is Product => Boolean(item && typeof item === "object" && typeof item.id === "string")).map(normalizeProduct);
  } catch {
    localStorage.removeItem(PRODUCT_CATALOG_STORAGE_KEY);
    return null;
  }
};
