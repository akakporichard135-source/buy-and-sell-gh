import type { Product, ProductCategory } from "../types/product";
import { compareAirpodsNewest, compareIphonesNewest, compareMacbooksNewest, productMatchesCategorySlug } from "./productPresentation";

const mixedCategoryOrder: ProductCategory[] = [
  "iPhones",
  "MacBooks",
  "AirPods",
  "iPads",
  "Apple Watches",
  "Accessories",
  "UK Used Devices",
  "Brand New Devices",
];

const productDate = (product: Product) => {
  const timestamp = new Date(product.createdAt ?? "").getTime();
  return Number.isFinite(timestamp) ? timestamp : 0;
};

export const compareProductsNewest = (a: Product, b: Product) => {
  if (productMatchesCategorySlug(a, "iphones") && productMatchesCategorySlug(b, "iphones")) {
    const comparison = compareIphonesNewest(a, b);
    if (comparison !== 0) return comparison;
  }
  if (productMatchesCategorySlug(a, "macbooks") && productMatchesCategorySlug(b, "macbooks")) {
    const comparison = compareMacbooksNewest(a, b);
    if (comparison !== 0) return comparison;
  }
  if (productMatchesCategorySlug(a, "airpods") && productMatchesCategorySlug(b, "airpods")) {
    const comparison = compareAirpodsNewest(a, b);
    if (comparison !== 0) return comparison;
  }
  const dateComparison = productDate(b) - productDate(a);
  return dateComparison || a.slug.localeCompare(b.slug);
};

export const mixProductsDeterministically = (products: Product[]) => {
  const buckets = new Map<ProductCategory, Product[]>();
  for (const category of mixedCategoryOrder) buckets.set(category, []);
  for (const product of [...products].sort(compareProductsNewest)) {
    const bucket = buckets.get(product.category);
    if (bucket) bucket.push(product);
  }

  const mixed: Product[] = [];
  let hasProducts = true;
  while (hasProducts) {
    hasProducts = false;
    for (const category of mixedCategoryOrder) {
      const product = buckets.get(category)?.shift();
      if (!product) continue;
      mixed.push(product);
      hasProducts = true;
    }
  }
  return mixed;
};
