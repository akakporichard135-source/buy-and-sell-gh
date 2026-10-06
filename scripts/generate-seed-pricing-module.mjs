import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

function slugify(text) {
  return String(text || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const raw = await readFile(path.resolve("scripts/proposed-pricing.json"), "utf8");
const products = JSON.parse(raw);

const seedRecord = {};

for (const p of products) {
  const vars = (p.variants || []).map((v, idx) => {
    const pos = idx + 1;
    const parts = [
      p.id,
      v.storage ? slugify(v.storage) : "",
      v.chip ? slugify(v.chip) : "",
      v.memory ? slugify(v.memory) : "",
      v.screenSize ? slugify(v.screenSize) : "",
      v.connectivity ? slugify(v.connectivity) : "",
      v.condition ? slugify(v.condition) : "brand-new"
    ].filter(Boolean);

    const variantId = parts.join("-");
    const sku = `BSGH-${p.id.toUpperCase().slice(0, 10)}-${pos}`;

    const titleParts = [p.name];
    if (v.screenSize) titleParts.push(v.screenSize);
    if (v.chip) titleParts.push(v.chip);
    if (v.memory) titleParts.push(v.memory);
    if (v.storage) titleParts.push(v.storage);
    if (v.connectivity) titleParts.push(v.connectivity);
    if (v.condition && v.condition !== "Brand New") titleParts.push(`(${v.condition})`);
    const title = titleParts.join(" ");

    const isSale = Boolean(v.previousPrice && v.previousPrice > v.price);

    return {
      id: variantId,
      productId: p.id,
      title,
      sku,
      storage: v.storage || undefined,
      condition: v.condition || "Brand New",
      screenSize: v.screenSize || undefined,
      chip: v.chip || undefined,
      memory: v.memory || undefined,
      connectivity: v.connectivity || undefined,
      price: v.price,
      previousPrice: v.previousPrice || null,
      isSale,
      stockStatus: "In Stock",
      stockQuantity: 10,
      available: true,
      position: pos
    };
  });

  seedRecord[p.id] = {
    price: p.proposedBaseGhs || 0,
    previousPrice: vars[0]?.previousPrice || undefined,
    condition: vars[0]?.condition || (p.condition === "To Confirm" ? "Brand New" : p.condition),
    variants: vars
  };
}

const content = `// Auto-generated seed pricing and variants for Buy & Sell GH
// Authoritative initial values approved in proposal
import type { ProductVariant } from "../types/product";

export interface SeedPricingItem {
  price: number;
  previousPrice?: number;
  condition: string;
  variants: ProductVariant[];
}

export const initialProductPricingSeed: Record<string, SeedPricingItem> = ${JSON.stringify(seedRecord, null, 2)};
`;

await writeFile(path.resolve("src/data/productPricingSeed.ts"), content, "utf8");
console.log("Successfully wrote src/data/productPricingSeed.ts");
