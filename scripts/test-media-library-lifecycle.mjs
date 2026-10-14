import assert from "node:assert/strict";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { build } from "esbuild";
import { tmpdir } from "node:os";
import { mkdir } from "node:fs/promises";

const projectRoot = process.cwd();
const outdir = path.join(tmpdir(), `media-library-tests-${Date.now()}`);
await mkdir(outdir, { recursive: true });

console.log("=== BUY & SELL GH: MEDIA LIBRARY FUNCTIONAL AUDIT ===");

// 1. Bundle CMS repository and data
const bundle = async (entry, outfile) => {
  await build({
    bundle: true,
    entryPoints: [entry],
    define: {
      "import.meta.env": "{}",
      "import.meta.env.DEV": "true",
      "import.meta.env.PROD": "false",
      "import.meta.env.VITE_SUPABASE_ANON_KEY": "\"\"",
      "import.meta.env.VITE_SUPABASE_PRODUCT_IMAGES_BUCKET": "\"product-images\"",
      "import.meta.env.VITE_SUPABASE_URL": "\"\"",
    },
    format: "esm",
    loader: { ".webp": "file", ".png": "file", ".jpg": "file", ".jpeg": "file" },
    outfile,
    platform: "node",
  });
  return import(pathToFileURL(outfile).href);
};

// Polyfill localStorage for node environment
globalThis.localStorage = {
  _store: new Map(),
  getItem(k) { return this._store.get(k) || null; },
  setItem(k, v) { this._store.set(k, String(v)); },
  removeItem(k) { this._store.delete(k); },
  clear() { this._store.clear(); }
};

const defaultCms = await bundle(
  path.join(projectRoot, "src/cms/defaultCmsData.ts"),
  path.join(outdir, "defaultCmsData.mjs")
);

const repo = await bundle(
  path.join(projectRoot, "src/cms/supabaseCmsRepository.ts"),
  path.join(outdir, "supabaseCmsRepository.mjs")
);

// --- TEST 1: iPad Assets Registration Audit ---
console.log("\n[TEST 1] Auditing iPad Assets in defaultMediaItems...");
const ipadIds = [
  "media-tile-ipad-air",
  "media-product-ipad-air-colors",
  "media-product-ipad-air-blue",
  "media-product-ipad-air-white",
  "media-product-ipad-pro-13",
];

const mediaItems = defaultCms.defaultMediaItems;
for (const id of ipadIds) {
  const item = mediaItems.find((m) => m.id === id);
  assert.ok(item, `iPad asset "${id}" must exist in Media Library`);
  assert.ok(item.url, `iPad asset "${id}" must have a valid URL`);
  assert.equal(item.fit, "contain", `iPad asset "${id}" must use contain fit to prevent cropping`);
  console.log(`  ✓ ${item.title} (${item.id}) - Category: ${item.category}, URL: ${item.url}`);
}

// --- TEST 2: In-Use Protection Detection ---
console.log("\n[TEST 2] Auditing In-Use Protection Detection across Homepage, Storefront, and Branding...");
const homepage = defaultCms.defaultHomepageContent;
const storefront = {
  ipads: {
    key: "ipads",
    label: "iPad",
    featuredCards: [
      {
        id: "ipad-air",
        title: "iPad Air",
        image: "/products/homepage/homepage-ipad-air-white.webp",
      },
    ],
  },
};
const settings = defaultCms.defaultSiteSettings;

// 2a. Test iPad Air Tile (must be in use)
const ipadAirTile = mediaItems.find((m) => m.id === "media-tile-ipad-air");
const ipadUsages = repo.getMediaAssetUsages(ipadAirTile, homepage, storefront, settings);
assert.ok(ipadUsages.length > 0, "iPad Air tile must be detected as in-use");
console.log(`  ✓ iPad Air Tile detected in ${ipadUsages.length} locations:`);
ipadUsages.forEach((u) => console.log(`    - ${u.location}`));

// 2b. Test iPhone 18 Pro Hero (must be in use)
const heroItem = mediaItems.find((m) => m.id === "media-hero-iphone18");
const heroUsages = repo.getMediaAssetUsages(heroItem, homepage, storefront, settings);
assert.ok(heroUsages.length > 0, "iPhone 18 hero must be detected as in-use");
console.log(`  ✓ iPhone 18 Hero detected in ${heroUsages.length} locations:`);
heroUsages.forEach((u) => console.log(`    - ${u.location}`));

// 2c. Test Service Flyer Repairs (must be in use)
const repairsFlyer = mediaItems.find((m) => m.id === "media-flyer-repairs");
const flyerUsages = repo.getMediaAssetUsages(repairsFlyer, homepage, storefront, settings);
assert.ok(flyerUsages.length > 0, "Repairs flyer must be detected as in-use");
console.log(`  ✓ Repairs Flyer detected in ${flyerUsages.length} locations:`);
flyerUsages.forEach((u) => console.log(`    - ${u.location}`));

// 2d. Test Brand Logo (must be protected)
const brandLogo = mediaItems.find((m) => m.id === "media-brand-logo");
const brandUsages = repo.getMediaAssetUsages(brandLogo, homepage, storefront, settings);
assert.ok(brandUsages.length > 0, "Brand logo must be protected from deletion");
console.log(`  ✓ Brand Logo detected in ${brandUsages.length} locations:`);
brandUsages.forEach((u) => console.log(`    - ${u.location}`));

// 2e. Test Unused Dummy Asset (must have 0 usages)
const unusedItem = {
  id: "media-test-unused-123",
  title: "Temporary Test Image",
  filename: "temp-test.jpg",
  url: "https://example.com/storage/v1/object/public/product-images/media/other/test.jpg",
  category: "other",
  alt: "test",
};
const unusedUsages = repo.getMediaAssetUsages(unusedItem, homepage, storefront, settings);
assert.equal(unusedUsages.length, 0, "Unused asset must have 0 usages");
console.log("  ✓ Unused asset correctly reported 0 usages (eligible for deletion)");

// --- TEST 3: Resurrection Prevention Logic ---
console.log("\n[TEST 3] Testing Resurrection Prevention for Deleted Assets...");
const testDeletedId = "media-test-deleted-asset";
const mockDefaults = [
  ...mediaItems,
  {
    id: testDeletedId,
    title: "Deleted Candidate",
    filename: "deleted.png",
    url: "/test/deleted.png",
    category: "other",
    alt: "to delete",
  },
];

// Before deletion, candidate is included
let merged = repo.mergeMediaItems([], mockDefaults, new Set());
assert.ok(merged.some((m) => m.id === testDeletedId), "Candidate is present initially");

// After recording deletion
repo.recordDeletedMediaId(testDeletedId);
const deletedSet = repo.getDeletedMediaIds();
assert.ok(deletedSet.has(testDeletedId), "Deleted ID is tracked in getDeletedMediaIds");

// Merge with deleted set
merged = repo.mergeMediaItems([], mockDefaults, deletedSet);
assert.ok(!merged.some((m) => m.id === testDeletedId), "Candidate is permanently excluded from merged library");
console.log("  ✓ Deleted media ID is recorded and permanently excluded from library reconstitution");

// --- TEST 4: Category Filtering & Search Coverage ---
console.log("\n[TEST 4] Testing Category Filtering & Search Coverage...");
const categories = ["all", "hero", "storefront", "flyer", "product", "brand", "other"];
for (const cat of categories) {
  const filtered = cat === "all" ? mediaItems : mediaItems.filter((m) => m.category === cat);
  if (cat !== "other") {
    assert.ok(filtered.length > 0, `Category "${cat}" has registered assets (${filtered.length} found)`);
  }
  console.log(`  ✓ Category "${cat}": ${filtered.length} assets`);
}

// Search check
const ipadSearch = mediaItems.filter((m) => m.title.toLowerCase().includes("ipad"));
assert.ok(ipadSearch.length >= 5, "Search for 'ipad' returns all 5 iPad assets");
console.log(`  ✓ Search query 'ipad' returns ${ipadSearch.length} assets`);

console.log("\n>>> ALL MEDIA LIBRARY FUNCTIONAL UNIT AUDITS PASSED SUCCESSFULLY! <<<\n");
