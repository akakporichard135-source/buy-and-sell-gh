import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { tmpdir } from "node:os";
import { pathToFileURL } from "node:url";
import { build } from "esbuild";

const standaloneBundle = async (entry, outfile, platform = "node") => {
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
    platform,
  });
  return import(pathToFileURL(outfile).href);
};

export async function testSimplifiedPromotionsAndBundles(
  projectRoot = process.cwd(),
  bundle = standaloneBundle,
  outdir = path.join(tmpdir(), `promo-simplified-test-${Date.now()}`)
) {
  await fs.mkdir(outdir, { recursive: true });

  // 1. Inspect AdminPromotionsPage source code for required features
  const adminPageSource = await fs.readFile(
    path.join(projectRoot, "src/pages/admin/AdminPromotionsPage.tsx"),
    "utf8"
  );

  // Check prominent + Create Promotion button
  assert.match(
    adminPageSource,
    /\+ Create Promotion/i,
    "AdminPromotionsPage must feature a prominent '+ Create Promotion' button"
  );

  // Check 7 creation steps
  assert.match(adminPageSource, /"basics"/, "Must support Step 1: Basics");
  assert.match(adminPageSource, /"type"/, "Must support Step 2: Promotion Type");
  assert.match(adminPageSource, /"product"/, "Must support Step 3: Product or Bundle Selection");
  assert.match(adminPageSource, /"rules"/, "Must support Step 4: Rules & Discount Configuration");
  assert.match(adminPageSource, /"flyers"/, "Must support Step 5: Desktop & Mobile Flyers");
  assert.match(adminPageSource, /"placement"/, "Must support Step 6: Storefront Placement");
  assert.match(adminPageSource, /"preview"/, "Must support Step 7: Preview & Publishing Controls");

  // Check Option A (Select Existing Product) & Option B (Create New Promotional Product / Bundle)
  assert.match(
    adminPageSource,
    /Option A: Select Existing Product/i,
    "Must offer Option A for existing catalog selection"
  );
  assert.match(
    adminPageSource,
    /Option B: Create New Promotional Product or Bundle/i,
    "Must offer Option B for in-place product/bundle creation"
  );
  assert.match(
    adminPageSource,
    /saveProduct/,
    "Must persist new promotional products/bundles to canonical product database (saveProduct)"
  );

  // Check Bundle Item Builder in Admin
  assert.match(
    adminPageSource,
    /Included Package Items/i,
    "Must have an in-place bundle items builder"
  );
  assert.match(
    adminPageSource,
    /handleAddBundleItem/,
    "Must allow adding items to the bundle"
  );
  assert.match(
    adminPageSource,
    /handleRemoveBundleItem/,
    "Must allow removing items from the bundle"
  );

  // Check Flyer Upload without requiring manual typing
  assert.match(
    adminPageSource,
    /Desktop Flyer\s*\(\s*1200\s*[x×]\s*500\s*\)/i,
    "Must support 1200x500 desktop flyer preview and upload"
  );
  assert.match(
    adminPageSource,
    /Mobile Flyer\s*\(/i,
    "Must support 600x600 mobile flyer preview and upload"
  );
  assert.match(
    adminPageSource,
    /mediaPickerTarget|AdminMediaLibrary/,
    "Must integrate with Media Library picker for flyers"
  );
  assert.match(
    adminPageSource,
    /uploadProductImage/,
    "Must support direct flyer file uploads to Supabase storage"
  );

  // Check 6 Promotion Types are present
  const requiredTypes = [
    "bundle",
    "free_gift",
    "percentage_discount",
    "fixed_discount",
    "promotional_price",
    "advertising",
  ];
  for (const type of requiredTypes) {
    assert.ok(
      adminPageSource.includes(`"${type}"`) || adminPageSource.includes(`'${type}'`),
      `AdminPromotionsPage must handle promotion type: ${type}`
    );
  }

  // Check Publishing Controls & Pre-publish checklist
  assert.match(
    adminPageSource,
    /Pre-Publishing Verification|Pre-Publish Checklist/i,
    "Must have pre-publish validation checklist"
  );
  assert.match(
    adminPageSource,
    /Save Draft/i,
    "Must have Save Draft action"
  );
  assert.match(
    adminPageSource,
    /Publish Live/i,
    "Must have Publish Live action"
  );
  assert.match(
    adminPageSource,
    /Unpublish/i,
    "Must have Unpublish action"
  );
  assert.match(
    adminPageSource,
    /Archive/i,
    "Must have Archive action"
  );

  // 2. Canonical Product Database & PS5 Combo Product Verification
  const productsModule = await bundle(
    path.join(projectRoot, "src/data/products.ts"),
    path.join(outdir, "products.mjs")
  );
  const ps5Product = productsModule.products.find(
    (p) => p.id === "ps5-slim-combo-offer"
  );
  assert.ok(ps5Product, "PS5 Slim Combo Offer product must exist in canonical catalog");
  assert.equal(ps5Product.price, 7500, "PS5 Slim Combo Offer must be GH₵7,500");
  assert.equal(ps5Product.condition, "UK Used", "PS5 combo condition must be UK Used");
  assert.equal(ps5Product.category, "Game Consoles", "PS5 combo category must be Game Consoles");
  assert.ok(
    Array.isArray(ps5Product.includedItems) && ps5Product.includedItems.length >= 3,
    "PS5 combo must have at least 3 included items"
  );
  assert.ok(
    ps5Product.includedItems.some((item) => /(?:PlayStation 5|PS5) Slim/i.test(item) && /Disc/i.test(item)),
    "PS5 combo must include PS5 Slim Standard Disc Version"
  );
  assert.ok(
    ps5Product.includedItems.some((item) => /EA Sports FC 25/i.test(item)),
    "PS5 combo must include EA Sports FC 25"
  );
  assert.ok(
    ps5Product.includedItems.some((item) => /(?:Two|2)\s*(?:brand-new\s*)?PlayStation/i.test(item) && /Controllers/i.test(item)),
    "PS5 combo must include 2 PlayStation controllers"
  );

  // 3. Default Promotions & Draft First Campaign Verification
  const defaultPromosModule = await bundle(
    path.join(projectRoot, "src/promotions/defaultPromotions.ts"),
    path.join(outdir, "defaultPromotions.mjs")
  );
  const ps5Promo = defaultPromosModule.defaultPromotions.find(
    (p) => p.id === "promo-ps5-slim-combo-offer"
  );
  assert.ok(ps5Promo, "One-Time PlayStation Combo Offer promotion must exist in defaultPromotions");
  assert.equal(ps5Promo.title, "One-Time PlayStation Combo Offer");
  assert.equal(ps5Promo.status, "draft", "First campaign must be saved in DRAFT status until confirmed");
  assert.equal(ps5Promo.isEnabled, false, "Draft campaign must not be enabled yet");
  assert.equal(ps5Promo.promotionType, "bundle");
  assert.equal(ps5Promo.promotionalPrice, 7500);
  assert.ok(
    ps5Promo.bundleRequiredProductIds.includes("ps5-slim-combo-offer"),
    "Bundle must target ps5-slim-combo-offer"
  );
  assert.ok(
    ps5Promo.desktopFlyerUrl && ps5Promo.mobileFlyerUrl,
    "Bundle must have both desktop and mobile flyer URLs configured"
  );

  // 4. Supabase Migration Verification
  const migration026 = await fs.readFile(
    path.join(projectRoot, "supabase/migrations/026_promotions_and_campaigns.sql"),
    "utf8"
  );
  assert.match(
    migration026,
    /promo-ps5-slim-combo-offer/,
    "Migration 026 must seed promo-ps5-slim-combo-offer"
  );
  assert.match(
    migration026,
    /'draft'/,
    "Migration 026 must seed promo-ps5-slim-combo-offer as draft"
  );

  // 5. Cart, Checkout & Order Payload Bundle Integrity
  const orderTypes = await bundle(
    path.join(projectRoot, "src/types/order.ts"),
    path.join(outdir, "orderTypes.mjs")
  );
  const cartItem = {
    product: ps5Product,
    storage: "1TB Disc Edition",
    color: "White",
    quantity: 1,
    configuredPrice: 7500,
  };
  const orderItems = orderTypes.cartItemsToOrderItems([cartItem]);
  assert.equal(orderItems.length, 1, "Bundle must be a single line item");
  assert.equal(orderItems[0].unitPrice, 7500, "Bundle unit price must be exactly GH₵7,500");
  assert.equal(orderItems[0].lineTotal, 7500, "Bundle total price must be exactly GH₵7,500");
  assert.ok(
    Array.isArray(orderItems[0].includedItems) && orderItems[0].includedItems.length >= 3,
    "cartItemsToOrderItems must carry forward includedItems"
  );

  // 6. Inspect BagReview, AppleCheckout, AdminOrderDetailPage for bundle rendering
  const bagReviewSource = await fs.readFile(
    path.join(projectRoot, "src/components/BagReview.tsx"),
    "utf8"
  );
  assert.match(
    bagReviewSource,
    /includedItems/,
    "BagReview must render included items for bundles"
  );

  const checkoutSource = await fs.readFile(
    path.join(projectRoot, "src/components/checkout/AppleCheckout.tsx"),
    "utf8"
  );
  assert.match(
    checkoutSource,
    /includedItems/,
    "AppleCheckout must render included items for bundles"
  );

  const adminOrderDetailSource = await fs.readFile(
    path.join(projectRoot, "src/pages/admin/AdminOrderDetailPage.tsx"),
    "utf8"
  );
  assert.match(
    adminOrderDetailSource,
    /includedItems/,
    "AdminOrderDetailPage must render bundle included items for fulfillment"
  );

  // 7. Universal Typography Safeguard (No 'overflow-wrap: anywhere;')
  const auditFiles = [
    "src/pages/admin/AdminPromotionsPage.tsx",
    "src/data/products.ts",
    "src/promotions/defaultPromotions.ts",
    "src/types/order.ts",
    "src/components/BagReview.tsx",
    "src/components/checkout/AppleCheckout.tsx",
    "src/pages/admin/AdminOrderDetailPage.tsx",
  ];

  for (const rel of auditFiles) {
    const content = await fs.readFile(path.join(projectRoot, rel), "utf8");
    assert.equal(
      content.includes("overflow-wrap: anywhere"),
      false,
      `File ${rel} must not contain overflow-wrap: anywhere;`
    );
  }

  console.log("Simplified promotions & custom bundle creation test suite passed successfully!");
}

// Allow standalone execution: node scripts/test-simplified-promotions-and-bundles.mjs
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  testSimplifiedPromotionsAndBundles().catch((err) => {
    console.error("Test failed:", err);
    process.exit(1);
  });
}
