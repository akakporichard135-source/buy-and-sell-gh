import type { Product, ProductBrand } from "../types/product";

export const storefrontCategories = [
  "Phones",
  "Tablets",
  "Laptops",
  "Watches",
  "Game Consoles",
  "Accessories",
  "Audio",
  "Electronics",
] as const;

export type StorefrontCategory = (typeof storefrontCategories)[number];

export const preferredBrands: ProductBrand[] = ["Apple"];

export function getBrandOptions(products: Pick<Product, "brand">[], selectedBrand?: string) {
  const catalogueBrands = products.map((product) => product.brand.trim()).filter(Boolean);
  const selected = selectedBrand?.trim();
  return Array.from(new Set([...preferredBrands, ...catalogueBrands, ...(selected && selected !== "All" ? [selected] : [])]))
    .sort((left, right) => {
      const leftPreferred = preferredBrands.indexOf(left);
      const rightPreferred = preferredBrands.indexOf(right);
      if (leftPreferred >= 0 || rightPreferred >= 0) {
        if (leftPreferred < 0) return 1;
        if (rightPreferred < 0) return -1;
        return leftPreferred - rightPreferred;
      }
      return left.localeCompare(right);
    });
}

export function getBrandFilterValue(value: string | null) {
  const brand = value?.trim();
  return brand ? brand.slice(0, 80) : "All";
}

const legacyCategoryAliases: Record<string, StorefrontCategory> = {
  iPhones: "Phones",
  Phones: "Phones",
  "Mobile Phones": "Phones",
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
  Electronics: "Electronics",
};

export function normalizeStorefrontCategory(value: string | null): StorefrontCategory | "All" {
  if (!value) return "All";
  return legacyCategoryAliases[value] ?? "All";
}

export function getStorefrontCategory(product: Pick<Product, "category"> & Partial<Pick<Product, "brand" | "subcategory">>): StorefrontCategory | undefined {
  if (product.category === "Phones & Tablets" || product.category === "Electronics") return undefined;
  return legacyCategoryAliases[product.category];
}

export function productMatchesStorefrontCategory(product: Product, category: string) {
  return category === "All" || getStorefrontCategory(product) === category;
}

export function categorySupportsStorage(category: string) {
  return category === "All" || category === "Phones" || category === "Tablets" || category === "Laptops" || category === "Watches";
}
