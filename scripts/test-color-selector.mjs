import assert from "node:assert/strict";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { build } from "esbuild";
import { tmpdir } from "node:os";
import { mkdir } from "node:fs/promises";

const outdir = path.join(tmpdir(), `buyandsell-color-tests-${Date.now()}`);
const projectRoot = process.cwd();
await mkdir(outdir, { recursive: true });

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
    loader: { ".webp": "file", ".png": "file", ".jpg": "file", ".jpeg": "file", ".svg": "file" },
    outfile,
    platform: "node",
  });
  return import(pathToFileURL(outfile).href);
};

console.log("Running Universal Color Selector Test Suite...\n");

// 1. Test productColors.ts
const colorsModule = await bundle(path.join(projectRoot, "src/utils/productColors.ts"), path.join(outdir, "productColors.mjs"));
const { resolveColorOption, resolveColorOptions, APPLE_FINISH_PALETTE } = colorsModule;

console.log("1. Testing APPLE_FINISH_PALETTE & resolveColorOption...");
assert(APPLE_FINISH_PALETTE["Natural Titanium"], "Natural Titanium exists");
assert.equal(resolveColorOption("Natural Titanium").hex, "#b5b0a8");
assert.equal(resolveColorOption("Space Black").hex, "#2b2b2d");
assert.equal(resolveColorOption("Silver").border, true, "Silver has border flag for pure white backgrounds");
assert.equal(resolveColorOption("Starlight").border, true, "Starlight has border flag for pure white backgrounds");
assert.equal(resolveColorOption("Midnight").hex, "#1e2530");
assert.equal(resolveColorOption("Desert Titanium").hex, "#c4a88f");
assert.equal(resolveColorOption("Jet Black").hex, "#111111");
assert.equal(resolveColorOption("Rose Gold").hex, "#e0b0a8");
assert.equal(resolveColorOption("Deep Burgundy").hex, "#4e1b24");
assert.equal(resolveColorOption("Ultramarine").hex, "#3c4e78");

// Case insensitivity & compound string matching
assert.equal(resolveColorOption("space black").hex, "#2b2b2d");
assert.equal(resolveColorOption("silver").border, true);
assert.equal(resolveColorOption("Natural Titanium / Sport Loop").hex, "#b5b0a8");

// resolveColorOptions list filtering
const options = resolveColorOptions(["Midnight", "Starlight", "Silver", "Silver"]);
assert.equal(options.length, 3, "De-duplicates finishes cleanly");
assert.equal(options[0].name, "Midnight");
console.log("✔ Color palette resolution tests passed!");

// 2. Test productColorImages.ts
const colorImagesModule = await bundle(path.join(projectRoot, "src/utils/productColorImages.ts"), path.join(outdir, "productColorImages.mjs"));
const { resolveProductColorImage, resolveProductColorGallery } = colorImagesModule;

console.log("\n2. Testing Universal Image Switching for Products...");

// MacBook Air
const mbaProduct = {
  id: "mba-15-m4",
  slug: "macbook-air-15-m4",
  name: "MacBook Air 15-inch",
  category: "MacBooks",
  price: 18500,
  available: true,
  stockStatus: "In Stock",
  stockQuantity: 10,
  storage: ["512GB"],
  colors: ["Midnight", "Starlight", "Space Gray", "Silver"],
};
const mbaMidnight = resolveProductColorImage(mbaProduct, "Midnight");
const mbaStarlight = resolveProductColorImage(mbaProduct, "Starlight");
const mbaSilver = resolveProductColorImage(mbaProduct, "Silver");
const mbaSpaceGray = resolveProductColorImage(mbaProduct, "Space Gray");

assert(mbaMidnight, "MacBook Air Midnight has image");
assert(mbaStarlight, "MacBook Air Starlight has image");
assert(mbaSilver, "MacBook Air Silver has image");
assert(mbaSpaceGray, "MacBook Air Space Gray has image");
assert.notEqual(mbaMidnight, mbaStarlight, "Different finishes return distinct images");
assert.notEqual(mbaMidnight, mbaSilver, "Midnight and Silver are distinct");

// MacBook Pro
const mbpProduct = { id: "mbp-14-m4", slug: "macbook-pro-14-m4", name: "MacBook Pro 14-inch", category: "MacBooks", storage: ["512GB"], colors: ["Space Black", "Silver"] };
const mbpBlack = resolveProductColorImage(mbpProduct, "Space Black");
const mbpSilver = resolveProductColorImage(mbpProduct, "Silver");
assert(mbpBlack, "MacBook Pro Space Black has image");
assert(mbpSilver, "MacBook Pro Silver has image");
assert.notEqual(mbpBlack, mbpSilver, "MacBook Pro Black and Silver return distinct images");

// iPad Pro
const ipadProProduct = { id: "ipad-pro", slug: "ipad-pro", name: "iPad Pro", category: "iPads", storage: ["256GB"], colors: ["Space Black", "Silver"] };
const ipadProBlack = resolveProductColorImage(ipadProProduct, "Space Black");
const ipadProSilver = resolveProductColorImage(ipadProProduct, "Silver");
assert(ipadProBlack, "iPad Pro Space Black has image");
assert(ipadProSilver, "iPad Pro Silver has image");
assert.notEqual(ipadProBlack, ipadProSilver, "iPad Pro Black and Silver return distinct images");

// Apple Watch Ultra
const watchUltraProduct = { id: "apple-watch-ultra-4", slug: "apple-watch-ultra-4", name: "Apple Watch Ultra 4", category: "Apple Watches", storage: ["49mm"], colors: ["Natural Titanium", "Black Titanium"] };
const watchUltraNat = resolveProductColorImage(watchUltraProduct, "Natural Titanium");
const watchUltraBlack = resolveProductColorImage(watchUltraProduct, "Black Titanium");
assert(watchUltraNat, "Apple Watch Ultra Natural Titanium has image");
assert(watchUltraBlack, "Apple Watch Ultra Black Titanium has image");
assert.notEqual(watchUltraNat, watchUltraBlack, "Apple Watch Ultra finishes return distinct images");

// iPhone 16 Pro
const ip16ProProduct = { id: "iphone-16-pro", slug: "iphone-16-pro", name: "iPhone 16 Pro", category: "iPhones", storage: ["256GB"], colors: ["Desert Titanium", "Natural Titanium", "Black Titanium", "White Titanium"] };
const ip16Nat = resolveProductColorImage(ip16ProProduct, "Natural Titanium");
const ip16Desert = resolveProductColorImage(ip16ProProduct, "Desert Titanium");
assert(ip16Nat, "iPhone 16 Pro Natural Titanium has image");
assert(ip16Desert, "iPhone 16 Pro Desert Titanium has image");
assert.notEqual(ip16Nat, ip16Desert, "iPhone 16 Pro finishes return distinct images");

console.log("✔ Universal product color image switching tests passed!");

// 3. Test Cart Operations Integration
const cartOpsModule = await bundle(path.join(projectRoot, "src/context/cartOperations.ts"), path.join(outdir, "cartOperations.mjs"));
const { addCartItem } = cartOpsModule;

console.log("\n3. Testing Cart Item Color Image Preservation...");
const sampleCart = [];
const updatedCart = addCartItem(
  sampleCart,
  mbaProduct,
  "512GB",
  "Starlight",
  1,
  undefined,
  mbaStarlight
);
assert.equal(updatedCart.length, 1);
assert.equal(updatedCart[0].color, "Starlight");
assert.equal(updatedCart[0].colorImageSrc, mbaStarlight, "Selected color image is stored on CartItem");

console.log("✔ Cart item color image preservation tests passed!");

console.log("\n=======================================================");
console.log("All Universal Color Selector Tests PASSED Successfully!");
console.log("=======================================================\n");
