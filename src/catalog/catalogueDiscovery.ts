import type { Product } from "../types/product";

export const primaryMobilePhoneBrands = ["Samsung", "Google", "Huawei", "Xiaomi", "Motorola"] as const;

export type ElectronicsCategoryKey = "laptops-computers" | "tv-video-equipment" | "video-games-consoles";

export const electronicsCategoryLabels: Record<ElectronicsCategoryKey, string> = {
  "laptops-computers": "Laptops & Computers",
  "tv-video-equipment": "TV & Video Equipment",
  "video-games-consoles": "Video Games & Consoles",
};

const normalize = (value?: string) => value?.trim().toLowerCase().replace(/[^a-z0-9]+/g, " ").trim() ?? "";

export function isMobilePhoneProduct(product: Pick<Product, "brand" | "category" | "subcategory">) {
  if (normalize(product.brand) === "apple") return false;
  const category = normalize(product.category);
  const subcategory = normalize(product.subcategory);
  return ["phones", "mobile phones", "smartphones"].includes(category) ||
    ["mobile phones", "mobile phone", "smartphones", "smartphone"].includes(subcategory);
}

export function getMobilePhoneBrands(products: Product[]) {
  const brands = Array.from(new Set(products.filter(isMobilePhoneProduct).map((product) => product.brand.trim()).filter(Boolean)));
  return brands.sort((left, right) => {
    const leftPriority = primaryMobilePhoneBrands.findIndex((brand) => normalize(brand) === normalize(left));
    const rightPriority = primaryMobilePhoneBrands.findIndex((brand) => normalize(brand) === normalize(right));
    if (leftPriority >= 0 || rightPriority >= 0) {
      if (leftPriority < 0) return 1;
      if (rightPriority < 0) return -1;
      return leftPriority - rightPriority;
    }
    return left.localeCompare(right);
  });
}

export function getPrimaryMobilePhoneBrands(products: Product[]) {
  const availableBrands = getMobilePhoneBrands(products);
  return availableBrands.filter((brand) => primaryMobilePhoneBrands.some((primary) => normalize(primary) === normalize(brand)));
}

export function getOtherMobilePhoneBrands(products: Product[]) {
  const availableBrands = getMobilePhoneBrands(products);
  return availableBrands.filter((brand) => !primaryMobilePhoneBrands.some((primary) => normalize(primary) === normalize(brand)));
}

export function getMobilePhoneProducts(products: Product[], brand?: string | null) {
  const selectedBrand = normalize(brand ?? undefined);
  return products.filter((product) => isMobilePhoneProduct(product) && (!selectedBrand || normalize(product.brand) === selectedBrand));
}

export function getElectronicsCategory(product: Pick<Product, "category" | "subcategory">): ElectronicsCategoryKey | undefined {
  const category = normalize(product.category);
  const subcategory = normalize(product.subcategory);

  if (["laptops", "macbooks"].includes(category) || ["laptops computers", "laptop computers", "desktop computers", "computers"].includes(subcategory)) {
    return "laptops-computers";
  }
  if (["game consoles"].includes(category) || ["video games consoles", "gaming consoles", "games consoles"].includes(subcategory)) {
    return "video-games-consoles";
  }
  if (category === "electronics" && ["tv video equipment", "televisions", "tv displays", "video equipment"].includes(subcategory)) {
    return "tv-video-equipment";
  }
  return undefined;
}

export function isElectronicsProduct(product: Pick<Product, "category" | "subcategory">) {
  return Boolean(getElectronicsCategory(product));
}

export function getElectronicsProducts(products: Product[], category?: string | null) {
  const selected = category && category in electronicsCategoryLabels ? category as ElectronicsCategoryKey : undefined;
  return products.filter((product) => {
    const productCategory = getElectronicsCategory(product);
    return Boolean(productCategory && (!selected || productCategory === selected));
  });
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
