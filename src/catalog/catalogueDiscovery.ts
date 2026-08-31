import type { Product } from "../types/product";

const primaryBrandLimit = 5;

export type PhoneTabletCategoryKey = "mobile-phones" | "tablets" | "phone-accessories" | "tablet-accessories";
export type ElectronicsCategoryKey =
  | "laptops-computers"
  | "tv-video-equipment"
  | "video-games-consoles"
  | "audio-equipment"
  | "other-electronics";

export const phoneTabletCategoryLabels: Record<PhoneTabletCategoryKey, string> = {
  "mobile-phones": "Phones",
  tablets: "Tablets",
  "phone-accessories": "Phone Accessories",
  "tablet-accessories": "Tablet Accessories",
};

export const electronicsCategoryLabels: Record<ElectronicsCategoryKey, string> = {
  "laptops-computers": "Laptops & Computers",
  "tv-video-equipment": "TV & Video Equipment",
  "video-games-consoles": "Video Games & Consoles",
  "audio-equipment": "Audio Equipment",
  "other-electronics": "Other Electronics",
};

const appleOnlyCategories = new Set(["iphones", "ipads", "macbooks", "apple watches", "airpods"]);
const normalize = (value?: string) => value?.trim().toLowerCase().replace(/[^a-z0-9]+/g, " ").trim() ?? "";
const normalizeBrand = (value: string) => value.trim().toLowerCase();

export function isAppleCatalogueProduct(product: Pick<Product, "brand" | "category">) {
  return normalize(product.brand) === "apple" || appleOnlyCategories.has(normalize(product.category));
}

export function getPhoneTabletCategory(product: Pick<Product, "brand" | "category" | "subcategory">): PhoneTabletCategoryKey | undefined {
  const category = normalize(product.category);
  const subcategory = normalize(product.subcategory);

  if (["iphones", "iphone", "mobile phones", "mobile phone", "phones", "smartphones", "smartphone"].includes(category)) {
    return "mobile-phones";
  }
  if (["ipads", "ipad", "tablets", "tablet"].includes(category)) return "tablets";
  if (subcategory === "phone accessories" || subcategory === "mobile phone accessories") return "phone-accessories";
  if (subcategory === "tablet accessories") return "tablet-accessories";
  if (["iphones", "iphone", "phones", "mobile phones", "mobile phone", "smartphones", "smartphone"].includes(subcategory)) return "mobile-phones";
  if (["ipads", "ipad", "tablets", "tablet"].includes(subcategory)) return "tablets";
  if (category === "phones tablets") {
    if (subcategory.includes("tablet")) return subcategory.includes("accessor") ? "tablet-accessories" : "tablets";
    if (subcategory.includes("accessor")) return "phone-accessories";
    return "mobile-phones";
  }
  return undefined;
}

export function isPhoneTabletProduct(product: Pick<Product, "brand" | "category" | "subcategory">) {
  return Boolean(getPhoneTabletCategory(product));
}

export function isMobilePhoneProduct(product: Pick<Product, "brand" | "category" | "subcategory">) {
  return getPhoneTabletCategory(product) === "mobile-phones";
}

export function getPhoneTabletProducts(products: Product[], category?: string | null, brand?: string | null) {
  const selectedCategory = category && category in phoneTabletCategoryLabels ? category as PhoneTabletCategoryKey : undefined;
  const selectedBrand = normalizeBrand(brand ?? "");
  return products.filter((product) => {
    const productCategory = getPhoneTabletCategory(product);
    return !product.archived && product.available !== false && Boolean(productCategory && (!selectedCategory || productCategory === selectedCategory) && (!selectedBrand || normalizeBrand(product.brand) === selectedBrand));
  });
}

export function getMobilePhoneProducts(products: Product[], brand?: string | null) {
  return getPhoneTabletProducts(products, "mobile-phones", brand);
}

function getBrands(products: Product[], predicate: (product: Product) => boolean) {
  return Array.from(new Set(products.filter(predicate).map((product) => product.brand.trim()).filter(Boolean))).sort((left, right) => left.localeCompare(right));
}

export function getPhoneTabletBrands(products: Product[]) {
  const brands = new Map<string, string>();
  for (const product of getPhoneTabletProducts(products)) {
    const brand = product.brand.trim();
    if (brand && !brands.has(normalizeBrand(brand))) brands.set(normalizeBrand(brand), brand);
  }
  return [...brands.values()].sort((left, right) => left.localeCompare(right));
}

export function getMobilePhoneBrands(products: Product[]) {
  return getPhoneTabletBrands(products.filter(isMobilePhoneProduct));
}

export function getPrimaryPhoneTabletBrands(products: Product[]) {
  return getPhoneTabletBrands(products).slice(0, primaryBrandLimit);
}

export function getOtherPhoneTabletBrands(products: Product[]) {
  return getPhoneTabletBrands(products).slice(primaryBrandLimit);
}

export function getPrimaryMobilePhoneBrands(products: Product[]) {
  return getMobilePhoneBrands(products).slice(0, primaryBrandLimit);
}

export function getOtherMobilePhoneBrands(products: Product[]) {
  return getMobilePhoneBrands(products).slice(primaryBrandLimit);
}

export function getElectronicsCategory(product: Pick<Product, "brand" | "category" | "subcategory">): ElectronicsCategoryKey | undefined {
  if (isAppleCatalogueProduct(product)) return undefined;
  const category = normalize(product.category);
  const subcategory = normalize(product.subcategory);

  if (["laptops computers", "laptop computers", "desktop computers", "computers"].includes(subcategory) || ["laptops", "computers"].includes(category)) return "laptops-computers";
  if (["tv video equipment", "televisions", "tv displays", "video equipment"].includes(subcategory)) return "tv-video-equipment";
  if (["video games consoles", "gaming consoles", "games consoles"].includes(subcategory) || category === "game consoles") return "video-games-consoles";
  if (["audio equipment", "speakers", "headphones"].includes(subcategory) || category === "audio") return "audio-equipment";
  if (category === "electronics") return "other-electronics";
  return undefined;
}

export function isElectronicsProduct(product: Pick<Product, "brand" | "category" | "subcategory">) {
  return Boolean(getElectronicsCategory(product));
}

export function getElectronicsProducts(products: Product[], category?: string | null, brand?: string | null) {
  const selectedCategory = category && category in electronicsCategoryLabels ? category as ElectronicsCategoryKey : undefined;
  const selectedBrand = normalize(brand ?? undefined);
  return products.filter((product) => {
    const productCategory = getElectronicsCategory(product);
    return Boolean(productCategory && (!selectedCategory || productCategory === selectedCategory) && (!selectedBrand || normalize(product.brand) === selectedBrand));
  });
}

export function getElectronicsBrands(products: Product[]) {
  return getBrands(products, isElectronicsProduct);
}

export function getProductRam(product: Pick<Product, "specifications" | "specs">) {
  const specification = (product.specifications ?? product.specs ?? []).find((item) => /^ram\s*:/i.test(item));
  return specification?.replace(/^ram\s*:\s*/i, "").trim() ?? "";
}

export function withProductRam(specifications: string[], ram: string) {
  const withoutRam = specifications.filter((item) => !/^ram\s*:/i.test(item));
  const value = ram.trim();
  return value ? [`RAM: ${value}`, ...withoutRam] : withoutRam;
}
