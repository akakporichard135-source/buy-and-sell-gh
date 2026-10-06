import path from "node:path";
import { pathToFileURL } from "node:url";
import { tmpdir } from "node:os";
import { writeFile } from "node:fs/promises";
import { build } from "esbuild";

const outfile = path.join(tmpdir(), `audit-products-${Date.now()}.mjs`);
await build({
  bundle: true,
  entryPoints: [path.resolve("src/catalog/productCatalog.ts")],
  define: {
    "import.meta.env": "{}",
    "import.meta.env.DEV": "true",
    "import.meta.env.PROD": "false",
    "import.meta.env.VITE_SUPABASE_ANON_KEY": '""',
    "import.meta.env.VITE_SUPABASE_PRODUCT_IMAGES_BUCKET": '"product-images"',
    "import.meta.env.VITE_SUPABASE_URL": '""',
  },
  format: "esm",
  loader: { ".webp": "file" },
  outfile,
  platform: "node",
});

const { seedCatalog } = await import(pathToFileURL(outfile).href);

const summary = seedCatalog.map((p) => ({
  id: p.id,
  slug: p.slug,
  name: p.name,
  category: p.category,
  subcategory: p.subcategory || "",
  generation: p.generation || "",
  condition: p.condition,
  price: p.price,
  priceOnRequest: p.priceOnRequest,
  previousPrice: p.previousPrice || null,
  storage: p.storage || [],
  colors: p.colors || [],
  stockQuantity: p.stockQuantity,
  stockStatus: p.stockStatus,
  specs: p.specs || [],
}));

const destPath = path.resolve("scripts/catalog-inventory.json");
await writeFile(destPath, JSON.stringify(summary, null, 2), "utf8");
console.log(`Saved inventory of ${summary.length} products to ${destPath}`);
