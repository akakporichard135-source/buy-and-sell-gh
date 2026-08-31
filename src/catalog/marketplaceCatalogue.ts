import type { Product } from "../types/product";
import { isProductPurchasable } from "./productCatalog";

const normalize = (value: string) => value.trim().toLowerCase();
const searchText = (value: string) => normalize(value).replace(/(\d)\s+(gb|tb)\b/g, "$1$2");

export function marketplaceOptions(values: string[]) {
  const options = new Map<string, string>();
  for (const value of values) {
    if (value.trim() && !options.has(normalize(value))) options.set(normalize(value), value.trim());
  }
  return [...options.values()].sort((left, right) => left.localeCompare(right, undefined, { numeric: true }));
}

export function filterMarketplaceProducts(products: Product[], params: URLSearchParams, getCategory: (product: Product) => string | undefined) {
  const terms = searchText(params.get("q") ?? "").split(/\s+/).filter(Boolean);
  const category = params.get("category") ?? "all";
  const brand = normalize(params.get("brand") ?? "all");
  const condition = params.get("condition") ?? "all";
  const storage = params.get("storage") ?? "all";
  const availability = params.get("availability") ?? "all";
  const maxPrice = params.get("maxPrice")?.trim();
  const maximum = maxPrice ? Number(maxPrice) : undefined;
  const sort = params.get("sort") ?? "newest";

  return products.filter((product) => {
    if (product.archived || product.available === false) return false;
    const searchable = searchText([
      product.name, product.brand, product.model, product.subcategory,
      product.description, product.condition, ...product.storage, ...product.colors,
      ...(product.specifications ?? product.specs ?? []),
    ].join(" "));
    if (!terms.every((term) => searchable.includes(term))) return false;
    if (category !== "all" && getCategory(product) !== category) return false;
    if (brand !== "all" && normalize(product.brand) !== brand) return false;
    if (condition !== "all" && product.condition !== condition) return false;
    if (storage !== "all" && !product.storage.some((value) => searchText(value) === searchText(storage))) return false;
    if (availability === "in-stock" && !isProductPurchasable(product)) return false;
    if (availability === "enquiry" && isProductPurchasable(product)) return false;
    if (maximum !== undefined && (!Number.isFinite(maximum) || maximum < 0 || !hasConfirmedPrice(product) || product.price > maximum)) return false;
    return true;
  }).sort((left, right) => {
    if (sort === "price-low" || sort === "price-high") {
      // Enquiry-only prices always follow confirmed prices, in either direction.
      const confirmed = Number(hasConfirmedPrice(right)) - Number(hasConfirmedPrice(left));
      if (confirmed) return confirmed;
      if (hasConfirmedPrice(left) && hasConfirmedPrice(right) && left.price !== right.price) {
        return sort === "price-low" ? left.price - right.price : right.price - left.price;
      }
    }
    return timestamp(right.createdAt) - timestamp(left.createdAt) || left.id.localeCompare(right.id);
  });
}

function hasConfirmedPrice(product: Product) {
  return !product.priceOnRequest && Number.isFinite(product.price) && product.price > 0;
}

function timestamp(value?: string) {
  return Date.parse(value ?? "") || 0;
}
