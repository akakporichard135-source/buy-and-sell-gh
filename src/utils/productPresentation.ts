import type { Product, ProductCategory, StockStatus } from "../types/product";

export const categorySlugs: Record<ProductCategory, string> = {
  iPhones: "iphones",
  iPads: "ipads",
  "Apple Watches": "apple-watch",
  AirPods: "airpods",
  MacBooks: "macbooks",
  Accessories: "accessories",
  "UK Used Devices": "uk-used-devices",
  "Brand New Devices": "brand-new-devices",
};

export function normalizeDisplayBadge(label: string) {
  const normalized = label.trim();
  const lower = normalized.toLowerCase();
  if (lower === "sold out") return "Sold";
  if (lower === "limited stock" || lower === "low stock" || lower === "on request") return "Low Stock";
  if (lower === "in stock") return "In Stock";
  if (lower === "excellent condition") return "Excellent";
  return label;
}

export function productBadgeClass(label: string) {
  const normalized = normalizeDisplayBadge(label);
  if (normalized === "Sold" || normalized === "Out of Stock") return "product-badge product-badge-danger";
  if (normalized === "Low Stock") return "product-badge product-badge-urgent";
  if (normalized === "Brand New") return "product-badge product-badge-brand-new";
  if (normalized === "UK Used") return "product-badge product-badge-uk-used";
  if (normalized === "Excellent") return "product-badge product-badge-excellent";
  if (normalized === "Very Good") return "product-badge product-badge-very-good";
  return "product-badge";
}

export function getProductBadges(product: Product, limit = 3) {
  const explicitPromotions = (product.badges ?? [])
    .map(normalizeDisplayBadge)
    .filter((badge) => badge === "New Arrival" || badge === "Popular Choice");
  const preferred = [
    product.newArrival || product.isNewArrival ? "New Arrival" : "",
    product.popular || product.isPopular ? "Popular Choice" : "",
    ...explicitPromotions,
  ].filter(Boolean);
  return Array.from(new Set(preferred)).slice(0, limit);
}

export function productMatchesCategorySlug(product: Product, slug: string) {
  const searchable = [product.name, product.model, product.category, product.subcategory, ...(product.tags ?? [])].join(" ").toLowerCase();
  if (slug === "iphones") return searchable.includes("iphone");
  if (slug === "ipads") return searchable.includes("ipad");
  if (slug === "macbooks") return searchable.includes("macbook");
  if (slug === "apple-watch") return product.category === "Apple Watches" || searchable.includes("watch");
  if (slug === "airpods") return product.category === "AirPods" || searchable.includes("airpods");
  if (slug === "accessories") return product.category === "Accessories";
  if (slug === "uk-used-devices") return product.condition === "UK Used";
  if (slug === "brand-new-devices") return product.condition === "Brand New";
  return false;
}
