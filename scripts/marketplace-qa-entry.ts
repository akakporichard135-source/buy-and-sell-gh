import { createEmptyProduct, PRODUCT_CATALOG_STORAGE_KEY } from "../src/catalog/productCatalog";
import phoneImage from "../src/assets/products/iphone-16-pro-premium.webp";
import tabletImage from "../src/assets/products/ipad-air-11-inch-m2-premium.webp";

// Only loaded by serve-marketplace-qa.mjs, never by the production entry point.
const marker = "buyandsell-marketplace-qa-initialized";
if (!sessionStorage.getItem(marker)) {
  const brands = ["Apple", "Samsung", "Google", "Honor", "Nothing", "Tecno", "Xiaomi"];
  const fixtures = brands.map((brand, index) => ({
    ...createEmptyProduct([]),
    id: `qa-${index}`,
    slug: `qa-${brand.toLowerCase()}`,
    name: `${brand} QA ${index === 1 ? "Galaxy S25" : "phone"}`,
    model: index === 1 ? "Galaxy S25" : "QA phone",
    brand,
    category: "Phones & Tablets",
    subcategory: "Mobile Phones",
    price: 2000 + index * 500,
    priceOnRequest: false,
    condition: "Brand New",
    available: index !== 1,
    description: "Isolated test listing. Not for sale. Reference artwork used only for layout testing.",
    storage: ["128GB", "256GB"],
    colors: ["Black", "Silver"],
    images: [{ src: phoneImage, alt: `${brand} test fixture reference image` }, { src: tabletImage, alt: "Second QA gallery reference image" }],
    createdAt: `2026-08-${20 + index}T12:00:00Z`,
  }));
  fixtures.push({ ...fixtures[0], id: "qa-tablet", slug: "qa-tablet", name: "Apple QA iPad", model: "QA iPad", subcategory: "Tablets", images: [{ src: tabletImage, alt: "QA tablet reference image" }] });
  localStorage.setItem(PRODUCT_CATALOG_STORAGE_KEY, JSON.stringify(fixtures));
  sessionStorage.setItem(marker, "true");
}
await import("../src/main");
