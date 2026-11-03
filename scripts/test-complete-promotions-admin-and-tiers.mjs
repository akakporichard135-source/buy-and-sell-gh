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

export async function testCompletePromotionsAdminAndTiers(
  projectRoot = process.cwd(),
  bundle = standaloneBundle,
  outdir = path.join(tmpdir(), `promo-admin-tiers-test-${Date.now()}`)
) {
  await fs.mkdir(outdir, { recursive: true });

  // 1. Audit src/pages/admin/AdminPromotionsPage.tsx
  const promoPageCode = await fs.readFile(
    path.join(projectRoot, "src/pages/admin/AdminPromotionsPage.tsx"),
    "utf8"
  );

  // Test 1: Explicit discountScope state and scope buttons
  assert.ok(
    promoPageCode.includes('discountScope, setDiscountScope] = useState<DiscountScope>("storewide")'),
    "AdminPromotionsPage must define explicit discountScope state defaulting to storewide"
  );

  assert.ok(
    promoPageCode.includes('id="scope-specific-btn"') &&
      promoPageCode.includes('setDiscountScope("specific")'),
    "AdminPromotionsPage must have dedicated Specific Products button with immediate scope selection"
  );

  assert.ok(
    promoPageCode.includes('id="scope-category-btn"') &&
      promoPageCode.includes('setDiscountScope("category")'),
    "AdminPromotionsPage must have dedicated By Category button with immediate scope selection"
  );

  assert.ok(
    promoPageCode.includes('id="scope-storewide-btn"') &&
      promoPageCode.includes('setDiscountScope("storewide")'),
    "AdminPromotionsPage must have dedicated Storewide button with immediate scope selection"
  );

  // Test 2: Product Search covers name, model, category, brand, SKU, ID
  assert.ok(
    promoPageCode.includes("matchModel") &&
      promoPageCode.includes("matchBrand") &&
      promoPageCode.includes("matchCat") &&
      promoPageCode.includes("matchSku"),
    "Specific products search must filter by name, model, category, brand, and SKU"
  );

  // Test 3: Multiple discount calculation modes (Single %, Price Range Tiers, Product-Specific)
  assert.ok(
    promoPageCode.includes('discountCalculationMode: "price_tiers"') &&
      promoPageCode.includes('discountCalculationMode: "product_specific"'),
    "AdminPromotionsPage must support price_tiers and product_specific calculation modes"
  );

  assert.ok(
    promoPageCode.includes("handlePreloadMegaDiscountTiers"),
    "AdminPromotionsPage must provide a quick action to load Mega Discount Sale tiers (10% from GH₵2k, 15% from GH₵4k)"
  );

  // Test 4: Delete Candidate Protection (Orders check)
  assert.ok(
    promoPageCode.includes("ordersCount ?? 0) > 0") &&
      promoPageCode.includes("Please Archive it instead"),
    "AdminPromotionsPage must prevent permanent deletion of campaigns linked to orders or redemptions"
  );

  // Test 5: Additional media gallery & focal point positioning
  assert.ok(
    promoPageCode.includes("additionalImages") &&
      promoPageCode.includes("imagePosition"),
    "AdminPromotionsPage must support additional promotional images and focal point positioning"
  );

  // 2. Bundle and verify Promotion Engine calculations
  const promoEngineEntry = path.join(projectRoot, "src/promotions/promotionEngine.ts");
  const promoEngineBundle = path.join(outdir, "promotionEngine.js");
  const promoEngine = await bundle(promoEngineEntry, promoEngineBundle);

  // Mock product catalog
  const mockIPhone = {
    id: "iphone-16-pro",
    slug: "iphone-16-pro",
    name: "iPhone 16 Pro",
    category: "iPhones",
    price: 3500, // In Band 1 (GH₵2,000 - GH₵4,000)
    stockQuantity: 10,
    storage: ["128GB"],
    colors: ["Black Titanium"],
  };

  const mockMacBook = {
    id: "macbook-pro-14",
    slug: "macbook-pro-14",
    name: "MacBook Pro 14-inch M3",
    category: "MacBooks",
    price: 6000, // In Band 2 (GH₵4,001+)
    stockQuantity: 5,
    storage: ["512GB"],
    colors: ["Space Black"],
  };

  const mockAccessory = {
    id: "apple-20w-adapter",
    slug: "apple-20w-adapter",
    name: "Apple 20W USB-C Adapter",
    category: "Accessories",
    price: 350, // Below GH₵2,000 threshold
    stockQuantity: 50,
    storage: ["Standard"],
    colors: ["White"],
  };

  const mockUnpricedItem = {
    id: "unpriced-item",
    slug: "unpriced-item",
    name: "Unpriced Demo Item",
    category: "Accessories",
    price: 0, // Unverified / missing price
    stockQuantity: 5,
    storage: ["Standard"],
    colors: ["Standard"],
  };

  // Mega Discount Sale Campaign Mock
  const megaSaleCampaign = {
    id: "promo-mega-discount-sale",
    slug: "mega-discount-sale-up-to-15-off",
    title: "Mega Discount Sale — Up to 15% Off",
    shortDescription: "Save 10% to 15% on devices above GH₵ 2,000",
    detailedDescription: "Test campaign",
    promotionType: "percentage_discount",
    status: "active",
    isEnabled: true,
    timezone: "Africa/Accra",
    priority: 10,
    allowStacking: false,
    eligibleProductIds: [],
    eligibleCategory: "all",
    minQualifyingItemPrice: 2000,
    minOrderSubtotal: 0,
    discountCalculationMode: "price_tiers",
    discountTiers: [
      { minPrice: 2000, maxPrice: 4000, percent: 10, label: "10% Off" },
      { minPrice: 4001, maxPrice: null, percent: 15, label: "15% Off" },
    ],
    discountPercent: 15,
    currentRedemptions: 0,
    customerRedemptionLimit: 1,
    desktopFlyerUrl: "/test.webp",
    ctaText: "Shop Now",
    ctaDestination: "/store",
    displayOrder: 1,
    showOnAnnouncementBar: true,
    showOnHomepageCarousel: true,
    showOnOffersPage: true,
    viewCount: 0,
    clickCount: 0,
    ordersCount: 0,
    totalDiscountGiven: 0,
    totalGiftsAllocated: 0,
    totalAttributedSales: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // Test 6: Item < GH₵2,000 does NOT qualify
  const accessoryCartItem = {
    product: mockAccessory,
    storage: "Standard",
    color: "White",
    quantity: 1,
    configuredPrice: 350,
  };
  const isAccessoryEligible = promoEngine.isItemEligibleForPromotion(accessoryCartItem, megaSaleCampaign);
  assert.equal(
    isAccessoryEligible,
    false,
    "Accessory priced at GH₵350 must NOT qualify when minQualifyingItemPrice is 2000"
  );

  // Test 7: Item at GH₵3,500 receives 10% discount (Band 1)
  const iPhoneCartItem = {
    product: mockIPhone,
    storage: "128GB",
    color: "Black Titanium",
    quantity: 1,
    configuredPrice: 3500,
  };
  const isIPhoneEligible = promoEngine.isItemEligibleForPromotion(iPhoneCartItem, megaSaleCampaign);
  assert.equal(isIPhoneEligible, true, "iPhone 16 Pro at GH₵3,500 must qualify for Mega Discount Sale");

  const iPhonePct = promoEngine.resolveItemDiscountPercentage(iPhoneCartItem, megaSaleCampaign);
  assert.equal(iPhonePct, 10, "iPhone 16 Pro at GH₵3,500 must receive 10% discount from Band 1");

  // Test 8: Item at GH₵6,000 receives 15% discount (Band 2)
  const macBookCartItem = {
    product: mockMacBook,
    storage: "512GB",
    color: "Space Black",
    quantity: 1,
    configuredPrice: 6000,
  };
  const isMacEligible = promoEngine.isItemEligibleForPromotion(macBookCartItem, megaSaleCampaign);
  assert.equal(isMacEligible, true, "MacBook Pro at GH₵6,000 must qualify for Mega Discount Sale");

  const macPct = promoEngine.resolveItemDiscountPercentage(macBookCartItem, megaSaleCampaign);
  assert.equal(macPct, 15, "MacBook Pro at GH₵6,000 must receive 15% discount from Band 2");

  // Test 9: Missing or unverified prices (price <= 0) must NOT receive discounts
  const unpricedCartItem = {
    product: mockUnpricedItem,
    storage: "Standard",
    color: "Standard",
    quantity: 1,
    configuredPrice: 0,
  };
  const isUnpricedEligible = promoEngine.isItemEligibleForPromotion(unpricedCartItem, megaSaleCampaign);
  assert.equal(isUnpricedEligible, false, "Product with price 0 must NOT receive automatic discounts");

  // Test 10: Full cart evaluation
  const cartResult = promoEngine.evaluateCartPromotions(
    [iPhoneCartItem, macBookCartItem, accessoryCartItem],
    [megaSaleCampaign]
  );

  // iPhone: 3500 * 10% = 350
  // MacBook: 6000 * 15% = 900
  // Accessory: 0
  // Total discount = 1250
  assert.equal(cartResult.totalDiscount, 1250, "Total cart discount must equal 350 + 900 = 1250");
  assert.equal(cartResult.subtotalBeforeDiscount, 3500 + 6000 + 350, "Subtotal before discount must be 9850");
  assert.equal(cartResult.finalSubtotal, 9850 - 1250, "Final subtotal must be 8600");
  assert.equal(cartResult.appliedCampaigns.length, 1, "One campaign should be recorded as applied");

  // Test 11: Product Exclusions
  const campaignWithExclusions = {
    ...megaSaleCampaign,
    excludedProductIds: ["iphone-16-pro"],
  };
  assert.equal(
    promoEngine.isItemEligibleForPromotion(iPhoneCartItem, campaignWithExclusions),
    false,
    "Specifically excluded product must NOT qualify"
  );

  // Test 12: Category Exclusions
  const campaignWithCatExclusions = {
    ...megaSaleCampaign,
    excludedCategories: ["MacBooks"],
  };
  assert.equal(
    promoEngine.isItemEligibleForPromotion(macBookCartItem, campaignWithCatExclusions),
    false,
    "Product in excluded category must NOT qualify"
  );

  // Test 13: Maximum Discount Amount Cap
  const campaignWithCap = {
    ...megaSaleCampaign,
    maxDiscountAmount: 500, // Cap discount at GH₵500
  };
  const cappedResult = promoEngine.evaluateCartPromotions([macBookCartItem], [campaignWithCap]);
  assert.equal(
    cappedResult.totalDiscount,
    500,
    "Discount must be capped at maxDiscountAmount (500 instead of 900)"
  );

  // Test 14: Product-Specific Discount Mode
  const campaignWithProductSpecific = {
    ...megaSaleCampaign,
    discountCalculationMode: "product_specific",
    productDiscounts: {
      "iphone-16-pro": 12, // 12% specifically for iPhone 16 Pro
    },
  };
  const specificPct = promoEngine.resolveItemDiscountPercentage(iPhoneCartItem, campaignWithProductSpecific);
  assert.equal(specificPct, 12, "iPhone 16 Pro must receive exactly 12% when configured in productDiscounts");

  console.log("✔ testCompletePromotionsAdminAndTiers passed successfully!");
  return { passed: 14 };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  testCompletePromotionsAdminAndTiers()
    .then(({ passed }) => console.log(`[PASS] testCompletePromotionsAdminAndTiers: ${passed}/${passed} tests passed`))
    .catch((err) => {
      console.error("[FAIL] testCompletePromotionsAdminAndTiers:", err);
      process.exit(1);
    });
}
