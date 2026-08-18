import type { Product, ProductBrand } from "../types/product";

export const storefrontCategories = [
  "Phones",
  "Tablets",
  "Laptops",
  "Watches",
  "Game Consoles",
  "Accessories",
  "Audio",
] as const;

export type StorefrontCategory = (typeof storefrontCategories)[number];

export const supportedBrands: ProductBrand[] = ["Apple", "Samsung", "LG", "Sony", "JBL", "Bose"];

const legacyCategoryAliases: Record<string, StorefrontCategory> = {
  iPhones: "Phones",
  Phones: "Phones",
  iPads: "Tablets",
  Tablets: "Tablets",
  MacBooks: "Laptops",
  Laptops: "Laptops",
  "Apple Watches": "Watches",
  Watches: "Watches",
  AirPods: "Audio",
  Audio: "Audio",
  "Game Consoles": "Game Consoles",
  Accessories: "Accessories",
};

export function normalizeStorefrontCategory(value: string | null): StorefrontCategory | "All" {
  if (!value) return "All";
  return legacyCategoryAliases[value] ?? "All";
}

export function getStorefrontCategory(product: Pick<Product, "category">): StorefrontCategory | undefined {
  return legacyCategoryAliases[product.category];
}

export function productMatchesStorefrontCategory(product: Product, category: string) {
  return category === "All" || getStorefrontCategory(product) === category;
}

export function categorySupportsStorage(category: string) {
  return category === "All" || category === "Phones" || category === "Tablets" || category === "Laptops" || category === "Watches";
}
