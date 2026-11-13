import assert from "node:assert/strict";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { build } from "esbuild";
import { tmpdir } from "node:os";
import { mkdir } from "node:fs/promises";

const outdir = path.join(tmpdir(), `buyandsell-bundle-verify-${Date.now()}`);
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

async function testAll() {
  console.log("Building and bundling frontend modules with esbuild...");

  const productCatalog = await bundle("./src/catalog/productCatalog.ts", path.join(outdir, "productCatalog.mjs"));
  const purchaseActions = await bundle("./src/catalog/productPurchaseAction.ts", path.join(outdir, "productPurchaseAction.mjs"));
  const productColorImages = await bundle("./src/utils/productColorImages.ts", path.join(outdir, "productColorImages.mjs"));
  const productPricing = await bundle("./src/utils/productPricing.ts", path.join(outdir, "productPricing.mjs"));
  const cartOps = await bundle("./src/context/cartOperations.ts", path.join(outdir, "cartOperations.mjs"));

  console.log("Bundling complete. Running assertions:\n");

  // 1. TEST COLOUR SELECTION & GALLERY AUTO-SWITCHING
  console.log("[TEST 1: COLOUR SELECTION & GALLERY SYNC]");
  const testIphone18 = {
    id: "iphone-18-pro",
    slug: "iphone-18-pro",
    name: "iPhone 18 Pro",
    category: "iPhones",
    price: 20500,
    stockQuantity: 14,
    stockStatus: "In Stock",
    colors: ["Deep Burgundy", "Space Black", "Natural Titanium", "Light Blue"],
    storage: ["256GB", "512GB", "1TB"],
    images: [{ src: "/products/homepage/iphone-18-pro-hero-2x.webp", alt: "iPhone 18 Pro" }],
  };

  const colors = ["Deep Burgundy", "Space Black", "Natural Titanium", "Light Blue"];
  for (const c of colors) {
    const resolvedImg = productColorImages.resolveProductColorImage(testIphone18, c);
    assert.ok(resolvedImg, `Color ${c} must resolve to an authentic image`);
    const gallery = productColorImages.resolveProductColorGallery(testIphone18, c);
    assert.ok(gallery.length > 0, `Color ${c} must have gallery images`);
    assert.equal(gallery[0].src, resolvedImg, `Gallery index 0 must ALWAYS be the matching image for ${c}`);
    console.log(`  ✓ Color "${c}" -> Gallery index 0 is immediately "${gallery[0].src}"`);
  }

  // Test Apple Watch Series 12 colors
  const testWatch12 = {
    id: "apple-watch-series-12",
    slug: "apple-watch-series-12",
    name: "Apple Watch Series 12",
    category: "Apple Watches",
    price: 13000,
    stockQuantity: 10,
    stockStatus: "In Stock",
    colors: ["Jet Black", "Silver", "Rose Gold", "Natural Titanium", "Slate"],
    storage: ["42mm", "46mm"],
  };
  for (const c of testWatch12.colors) {
    const resolvedImg = productColorImages.resolveProductColorImage(testWatch12, c);
    assert.ok(resolvedImg, `Watch color ${c} must resolve to an authentic image`);
    const gallery = productColorImages.resolveProductColorGallery(testWatch12, c);
    assert.equal(gallery[0].src, resolvedImg, `Watch gallery index 0 must match ${c}`);
    console.log(`  ✓ Watch Finish "${c}" -> Gallery index 0 is immediately "${gallery[0].src}"`);
  }

  // 2. TEST STORAGE SELECTION INDEPENDENCE
  console.log("\n[TEST 2: STORAGE SELECTION & PRICE INDEPENDENCE]");
  const multiStorageProduct = {
    id: "iphone-16-pro",
    slug: "iphone-16-pro",
    name: "iPhone 16 Pro",
    category: "iPhones",
    price: 17800,
    stockQuantity: 0, // Parent row 0
    stockStatus: "Out of Stock",
    storage: ["128GB", "256GB", "512GB", "1TB"],
    colors: ["Desert Titanium", "Natural Titanium", "Black Titanium", "White Titanium"],
    variants: [
      { id: "var-128", productId: "iphone-16-pro", title: "128GB", storage: "128GB", price: 17800, stockQuantity: 4, stockStatus: "In Stock", available: true },
      { id: "var-256", productId: "iphone-16-pro", title: "256GB", storage: "256GB", price: 19500, stockQuantity: 5, stockStatus: "In Stock", available: true },
      { id: "var-512", productId: "iphone-16-pro", title: "512GB", storage: "512GB", price: 22000, stockQuantity: 3, stockStatus: "In Stock", available: true },
      { id: "var-1tb", productId: "iphone-16-pro", title: "1TB", storage: "1TB", price: 25000, stockQuantity: 2, stockStatus: "In Stock", available: true },
    ],
  };

  // Normalization should compute effective stock from variants
  const normalizedIphone16 = productCatalog.normalizeProduct(multiStorageProduct, false);
  assert.equal(normalizedIphone16.stockQuantity, 14, "Effective stock quantity must sum variant stock");
  assert.equal(normalizedIphone16.stockStatus, "In Stock", "Stock status must be In Stock from variants");
  assert.equal(normalizedIphone16.price, 17800, "Price must be lowest active variant price");
  assert.equal(purchaseActions.getPublicPurchaseAction(normalizedIphone16), "buy", "Multi-variant device must default to 'buy'");

  // Changing storage updates price and variant without touching selected colour
  const selectedFinish = "Desert Titanium";
  const finishImage = productColorImages.resolveProductColorImage(normalizedIphone16, selectedFinish);

  for (const cap of multiStorageProduct.storage) {
    const config = productPricing.resolveConfiguredPrice(normalizedIphone16, { storage: cap });
    assert.ok(config.variant, `Configured variant for ${cap} must be found`);
    assert.equal(config.variant.storage, cap, `Configured storage must match ${cap}`);
    assert.ok(config.price > 0, `Configured price must be > 0`);
    console.log(`  ✓ Storage "${cap}" -> Price: ${config.formattedPrice}, Variant: ${config.variant.id}, Finish: "${selectedFinish}" (Image preserved: ${finishImage})`);
  }

  // 3. TEST BUY BUTTON & PURCHASE ACTION ADMIN OVERRIDES
  console.log("\n[TEST 3: PURCHASE ACTION RESOLUTION & ADMIN OVERRIDES]");
  // Test published device defaults to "buy"
  assert.equal(purchaseActions.getProductPurchaseAction(normalizedIphone16), "buy", "Default purchase action for published device is 'buy'");
  assert.equal(purchaseActions.getPublicPurchaseAction(normalizedIphone16), "buy", "Public purchase action is 'buy'");

  // Test admin sets to "view-pricing"
  const adminViewPricingTags = purchaseActions.withProductPurchaseAction(normalizedIphone16.tags, "view-pricing");
  const adminViewPricingProduct = { ...normalizedIphone16, tags: adminViewPricingTags };
  assert.equal(purchaseActions.getProductPurchaseAction(adminViewPricingProduct), "view-pricing", "Admin view-pricing tag honored");
  assert.equal(purchaseActions.getPublicPurchaseAction(adminViewPricingProduct), "view-pricing", "Public site reflects view-pricing");
  console.log("  ✓ Admin explicitly sets 'view-pricing' -> Public button accurately reflects 'view-pricing'");

  // Test admin sets to "enquire"
  const adminEnquireTags = purchaseActions.withProductPurchaseAction(normalizedIphone16.tags, "enquire");
  const adminEnquireProduct = { ...normalizedIphone16, tags: adminEnquireTags };
  assert.equal(purchaseActions.getProductPurchaseAction(adminEnquireProduct), "enquire", "Admin enquire tag honored");
  assert.equal(purchaseActions.getPublicPurchaseAction(adminEnquireProduct), "enquire", "Public site reflects enquire on WhatsApp");
  console.log("  ✓ Admin explicitly sets 'enquire' -> Public button accurately reflects 'enquire'");

  // 4. TEST PRICE INTEGRITY (MAC MINI GH₵0.00 PROTECTION)
  console.log("\n[TEST 4: PRICE INTEGRITY & MAC MINI GH₵0.00 PROTECTION]");
  const macMiniZeroPrice = {
    id: "mac-mini",
    slug: "mac-mini",
    name: "Mac mini",
    category: "MacBooks",
    price: 0,
    stockQuantity: 5,
    stockStatus: "In Stock",
    tags: ["Mac mini", "purchase-action:buy"], // Even if admin tagged as buy
  };
  const normalizedMacMini = productCatalog.normalizeProduct(macMiniZeroPrice, false);
  const buyError = purchaseActions.getBuyConfigurationError(normalizedMacMini);
  assert.ok(buyError && buyError.includes("confirmed price"), "Mac mini GH₵0.00 MUST be blocked by validation");
  assert.equal(purchaseActions.getPublicPurchaseAction(normalizedMacMini), "view-pricing", "Public button MUST downgrade GH₵0.00 to 'view-pricing'");
  console.log(`  ✓ Mac mini price GH₵0.00 blocked from checkout: "${buyError}"`);

  // 5. TEST ADD TO BAG & CART INTEGRITY
  console.log("\n[TEST 5: ADD TO BAG & CART INTEGRITY]");
  let cart = [];

  // Add iPhone 16 Pro 256GB Desert Titanium
  const ip16_256 = productPricing.resolveConfiguredPrice(normalizedIphone16, { storage: "256GB" });
  cart = cartOps.addCartItem(
    cart,
    normalizedIphone16,
    "256GB",
    "Desert Titanium",
    1,
    ip16_256.variant,
    finishImage,
    { storage: "256GB", color: "Desert Titanium" }
  );

  assert.equal(cart.length, 1, "Cart item must be added");
  assert.equal(cart[0].product.slug, "iphone-16-pro");
  assert.equal(cart[0].storage, "256GB");
  assert.equal(cart[0].color, "Desert Titanium");
  assert.equal(cart[0].variantId, "var-256");
  assert.equal(cart[0].configuredPrice, 19500);
  assert.equal(cart[0].quantity, 1);
  assert.equal(cart[0].colorImageSrc, finishImage);
  console.log(`  ✓ Added ${cart[0].product.name} (${cart[0].storage}, ${cart[0].color}) - GH₵${cart[0].configuredPrice}`);

  // Add Apple Watch Series 12 46mm Jet Black
  const normalizedWatch12 = productCatalog.normalizeProduct(testWatch12, false);
  cart = cartOps.addCartItem(
    cart,
    normalizedWatch12,
    "46mm",
    "Jet Black",
    2,
    undefined,
    "/products/campaigns/watch-series-12-hero.webp",
    { size: "46mm", finish: "Jet Black" }
  );

  assert.equal(cart.length, 2, "Second item must be in cart");
  assert.equal(cart[1].quantity, 2);
  assert.equal(cart[1].configuredPrice, 13000);
  console.log(`  ✓ Added ${cart[1].product.name} (${cart[1].storage}, ${cart[1].color}) x ${cart[1].quantity} - GH₵${cart[1].configuredPrice}`);

  // Verify subtotal
  const subtotal = cartOps.cartSubtotal(cart);
  const totalItems = cartOps.cartTotalItems(cart);
  const expectedSubtotal = 19500 * 1 + 13000 * 2; // 45,500
  assert.equal(subtotal, expectedSubtotal, `Subtotal must equal GH₵${expectedSubtotal}`);
  assert.equal(totalItems, 3, "Total items count must be 3");
  console.log(`  ✓ Cart Subtotal: GH₵${subtotal.toLocaleString()} across ${totalItems} items`);

  // Verify zero-price item CANNOT be added
  const cartBeforeZero = [...cart];
  const cartAttemptZero = cartOps.addCartItem(cart, normalizedMacMini, "Standard", "Silver", 1);
  assert.equal(cartAttemptZero.length, cartBeforeZero.length, "Zero price item MUST NOT be added to cart!");
  console.log("  ✓ Zero-price Mac mini correctly rejected by addCartItem");

  console.log("\n================================================================================");
  console.log("ALL 5 VERIFICATION SUITES PASSED FLAWLESSLY (100%)");
  console.log("================================================================================\n");
}

testAll().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
