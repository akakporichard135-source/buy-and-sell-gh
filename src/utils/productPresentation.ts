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
  if (normalized === "To Confirm") return "product-badge product-badge-urgent";
  return "product-badge";
}

export const iphoneGenerationOptions = ["iPhone 17", "iPhone 16", "iPhone 15", "iPhone 14", "iPhone 13", "iPhone 12", "iPhone 11"];

const iphoneNewestOrder = [
  "iphone-17-pro-max", "iphone-17-pro", "iphone-air", "iphone-17",
  "iphone-16-pro-max", "iphone-16-pro", "iphone-16-plus", "iphone-16", "iphone-16e",
  "iphone-15-pro-max", "iphone-15-pro", "iphone-15-plus", "iphone-15",
  "iphone-14-pro-max", "iphone-14-pro", "iphone-14-plus", "iphone-14",
  "iphone-13-pro-max", "iphone-13-pro", "iphone-13", "iphone-13-mini",
  "iphone-12-pro-max", "iphone-12-pro", "iphone-12", "iphone-12-mini",
  "iphone-11-pro-max",
];

export function getIphoneGeneration(product: Product) {
  if (product.generation?.startsWith("iPhone ")) return product.generation;
  if (product.slug === "iphone-air") return "iPhone 17";
  const match = product.model.match(/iPhone\s+(1[1-7])/i);
  return match ? `iPhone ${match[1]}` : "";
}

export function compareIphonesNewest(a: Product, b: Product) {
  const aIndex = iphoneNewestOrder.indexOf(a.slug);
  const bIndex = iphoneNewestOrder.indexOf(b.slug);
  if (aIndex === -1 && bIndex === -1) return a.name.localeCompare(b.name);
  if (aIndex === -1) return 1;
  if (bIndex === -1) return -1;
  return aIndex - bIndex;
}

export const ipadFamilyOptions = ["iPad", "iPad mini", "iPad Air", "iPad Pro"] as const;

const ipadNewestOrder = [
  "ipad-pro-13-inch-m5", "ipad-pro-11-inch-m5",
  "ipad-air-13-inch-m4", "ipad-air-11-inch-m4",
  "ipad-air-13-inch-m3", "ipad-air-11-inch-m3",
  "ipad-pro-13-inch-m4", "ipad-pro-11-inch-m4",
  "ipad-air-13-inch-m2", "ipad-air-11-inch-m2",
  "ipad-mini-a17-pro", "ipad-a16",
  "ipad-pro-12-9-inch-m2", "ipad-pro-11-inch-m2",
  "ipad-air-5", "ipad-10th-generation", "ipad-mini-6", "ipad-pro",
];

export function getIpadFamily(product: Product) {
  const searchable = [product.subcategory, product.name, product.model].filter(Boolean).join(" ").toLowerCase();
  if (searchable.includes("ipad mini")) return "iPad mini";
  if (searchable.includes("ipad air")) return "iPad Air";
  if (searchable.includes("ipad pro")) return "iPad Pro";
  return searchable.includes("ipad") ? "iPad" : "";
}

export function compareIpadsNewest(a: Product, b: Product) {
  const aIndex = ipadNewestOrder.indexOf(a.slug);
  const bIndex = ipadNewestOrder.indexOf(b.slug);
  if (aIndex === -1 && bIndex === -1) return a.name.localeCompare(b.name);
  if (aIndex === -1) return 1;
  if (bIndex === -1) return -1;
  return aIndex - bIndex;
}

export const watchFamilyOptions = ["Apple Watch SE", "Apple Watch Series", "Apple Watch Ultra"] as const;

const watchNewestOrder = [
  "apple-watch-ultra-3", "apple-watch-series-11", "apple-watch-se-3",
  "apple-watch-series-10", "apple-watch-ultra-2", "apple-watch-series-9",
  "apple-watch-series-8", "apple-watch-ultra", "apple-watch-series-7",
  "apple-watch-se-2", "apple-watch",
];

export function getWatchFamily(product: Product) {
  const searchable = [product.subcategory, product.name, product.model].filter(Boolean).join(" ").toLowerCase();
  if (searchable.includes("watch ultra")) return "Apple Watch Ultra";
  if (searchable.includes("watch series")) return "Apple Watch Series";
  if (searchable.includes("watch se")) return "Apple Watch SE";
  return "";
}

export function compareWatchesNewest(a: Product, b: Product) {
  const aIndex = watchNewestOrder.indexOf(a.slug);
  const bIndex = watchNewestOrder.indexOf(b.slug);
  if (aIndex === -1 && bIndex === -1) return a.name.localeCompare(b.name);
  if (aIndex === -1) return 1;
  if (bIndex === -1) return -1;
  return aIndex - bIndex;
}

export const macbookFamilyOptions = ["MacBook Air", "MacBook Pro"] as const;
export const macbookGenerationOptions = ["M5", "M4", "M3", "M2", "M1"] as const;

const macbookNewestOrder = [
  "macbook-air-13-m5", "macbook-air-15-m5",
  "macbook-pro-14-m5", "macbook-pro-14-m5-pro-max", "macbook-pro-16-m5-pro-max",
  "macbook-air-13-m4", "macbook-air-15-m4",
  "macbook-pro-14-m4", "macbook-pro-14-m4-pro-max", "macbook-pro-16-m4-pro-max",
  "macbook-air-13-m3", "macbook-air-15-m3",
  "macbook-pro-14-m3", "macbook-pro-14-m3-pro-max", "macbook-pro-16-m3-pro-max",
  "macbook-air-13-m2", "macbook-air-15-m2",
  "macbook-pro-13-m2", "macbook-pro-14-m2-pro-max", "macbook-pro-16-m2-pro-max",
  "macbook-air-13-m1", "macbook-pro-13-m1", "macbook-pro-14-m1-pro-max", "macbook-pro-16-m1-pro-max",
];

export function getMacbookFamily(product: Product) {
  const searchable = [product.subcategory, product.name, product.model].filter(Boolean).join(" ").toLowerCase();
  if (searchable.includes("macbook air")) return "MacBook Air";
  if (searchable.includes("macbook pro")) return "MacBook Pro";
  return "";
}

export function getMacbookGeneration(product: Product) {
  const searchable = [product.generation, product.name, product.model].filter(Boolean).join(" ");
  return searchable.match(/\bM[1-5]\b/i)?.[0].toUpperCase() ?? "";
}

export function compareMacbooksNewest(a: Product, b: Product) {
  const aIndex = macbookNewestOrder.indexOf(a.slug);
  const bIndex = macbookNewestOrder.indexOf(b.slug);
  if (aIndex === -1 && bIndex === -1) return a.name.localeCompare(b.name);
  if (aIndex === -1) return 1;
  if (bIndex === -1) return -1;
  return aIndex - bIndex;
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
