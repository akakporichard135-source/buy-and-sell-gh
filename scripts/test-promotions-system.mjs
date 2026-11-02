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

const createMockProduct = (id, name, category = "iPhones", price = 10000) => ({
  id,
  slug: id,
  name,
  model: name,
  brand: "Apple",
  category,
  price,
  condition: "Brand New",
  storage: ["128GB", "256GB"],
  colors: ["Natural Titanium"],
  images: [{ src: `/products/${id}.webp`, alt: name }],
  stockStatus: "In Stock",
  stockQuantity: 10,
  available: true,
  imageTone: "light",
  specs: [],
  box: [],
  description: "Test description",
});

export async function testPromotionsSystem(projectRoot = process.cwd(), bundle = standaloneBundle, outdir = path.join(tmpdir(), `promo-test-${Date.now()}`)) {
  await fs.mkdir(outdir, { recursive: true });

  const promoEngine = await bundle(
    path.join(projectRoot, "src/promotions/promotionEngine.ts"),
    path.join(outdir, "promotionEngine.mjs")
  );
  const defaultPromosModule = await bundle(
    path.join(projectRoot, "src/promotions/defaultPromotions.ts"),
    path.join(outdir, "defaultPromotions.mjs")
  );

  const { evaluateCartPromotions, isPromotionCurrentlyActive, isItemEligibleForPromotion, freeGiftToCartItem } = promoEngine;
  const { defaultPromotions } = defaultPromosModule;

  // 1. Migration 026 SQL Verification
  const sql = await fs.readFile(path.join(projectRoot, "supabase/migrations/026_promotions_and_campaigns.sql"), "utf8");
  assert.match(sql, /CREATE TABLE IF NOT EXISTS public\.promotions/);
  assert.match(sql, /CREATE TABLE IF NOT EXISTS public\.promotion_redemptions/);
  assert.match(sql, /ALTER TABLE public\.orders/);
  assert.match(sql, /ALTER TABLE public\.order_items/);
  assert.match(sql, /ALTER TABLE public\.promotions ENABLE ROW LEVEL SECURITY/);
  assert.match(sql, /CREATE OR REPLACE FUNCTION public\.create_order_request_validated/);
  assert.match(sql, /INSERT INTO public\.promotions/);

  // 2. Promotion Scheduling & Active Check
  const baseCampaign = {
    ...defaultPromotions[0],
    startDate: "2026-11-01T00:00:00.000Z",
    endDate: "2026-11-30T23:59:59.000Z",
    isEnabled: true,
    status: "active",
  };

  assert.equal(isPromotionCurrentlyActive(baseCampaign, new Date("2026-11-15T12:00:00.000Z")), true);
  assert.equal(isPromotionCurrentlyActive(baseCampaign, new Date("2026-10-31T23:59:59.000Z")), false, "Must reject before start date");
  assert.equal(isPromotionCurrentlyActive(baseCampaign, new Date("2026-12-01T00:00:01.000Z")), false, "Must reject after end date");

  const disabledCampaign = { ...baseCampaign, isEnabled: false };
  assert.equal(isPromotionCurrentlyActive(disabledCampaign, new Date("2026-11-15T12:00:00.000Z")), false, "Must reject disabled campaign");

  const limitCampaign = { ...baseCampaign, totalRedemptionLimit: 10, currentRedemptions: 10 };
  assert.equal(isPromotionCurrentlyActive(limitCampaign, new Date("2026-11-15T12:00:00.000Z")), false, "Must reject when limit reached");

  // 3. Variant Eligibility Check
  const variantPromo = {
    ...baseCampaign,
    eligibleProductIds: ["iphone-16-pro"],
    eligibleStorageOptions: ["256GB"],
  };

  const item128 = {
    product: createMockProduct("iphone-16-pro", "iPhone 16 Pro"),
    storage: "128GB",
    color: "Black Titanium",
    quantity: 1,
    configuredPrice: 12000,
  };

  const item256 = {
    product: createMockProduct("iphone-16-pro", "iPhone 16 Pro"),
    storage: "256GB",
    color: "Black Titanium",
    quantity: 1,
    configuredPrice: 13500,
  };

  assert.equal(isItemEligibleForPromotion(item128, variantPromo), false, "128GB must not trigger 256GB promo");
  assert.equal(isItemEligibleForPromotion(item256, variantPromo), true, "256GB must trigger promo");

  // 4. Free Gift Promotion Evaluation
  const giftPromo = {
    ...baseCampaign,
    promotionType: "free_gift",
    eligibleProductIds: ["iphone-16-pro"],
    giftProductId: "apple-magsafe-iphone-case",
    giftProductName: "Apple iPhone Case with MagSafe",
    giftStockQuantity: 10,
    giftQuantityPerPurchase: 1,
    maxGiftsPerOrder: 1,
  };

  const giftResult = evaluateCartPromotions([item256], [giftPromo], new Date("2026-11-15T12:00:00.000Z"));
  assert.equal(giftResult.freeGifts.length, 1);
  assert.equal(giftResult.freeGifts[0].productName, "Apple iPhone Case with MagSafe");
  assert.equal(giftResult.freeGifts[0].quantity, 1);
  assert.equal(giftResult.finalSubtotal, 13500);

  const giftCartItem = freeGiftToCartItem(giftResult.freeGifts[0]);
  assert.equal(giftCartItem.configuredPrice, 0, "Free gift configured price must be 0");
  assert.equal(giftCartItem.isFreeGift, true);

  // 5. Free Gift Stock Out Check
  const outOfStockGiftPromo = {
    ...giftPromo,
    giftStockQuantity: 0,
  };
  const oosResult = evaluateCartPromotions([item256], [outOfStockGiftPromo], new Date("2026-11-15T12:00:00.000Z"));
  assert.equal(oosResult.freeGifts.length, 0, "Cannot award gift when stock is 0");

  // 6. Percentage Discount Evaluation
  const pctPromo = {
    ...baseCampaign,
    promotionType: "percentage_discount",
    discountPercent: 10,
    eligibleCategory: "all",
    eligibleProductIds: ["apple-adapter-70w"],
    eligibleStorageOptions: [],
  };

  const accessoryItem = {
    product: createMockProduct("apple-adapter-70w", "Apple 70W USB-C Adapter", "Accessories", 700),
    storage: "70W USB-C",
    color: "White",
    quantity: 2,
    configuredPrice: 700,
  };

  const pctResult = evaluateCartPromotions([accessoryItem], [pctPromo], new Date("2026-11-15T12:00:00.000Z"));
  assert.equal(pctResult.totalDiscount, 140, "10% of 1400 should be 140");
  assert.equal(pctResult.finalSubtotal, 1260);

  // 7. Fixed Discount Evaluation & Non-Negative Cap
  const fixedPromo = {
    ...baseCampaign,
    promotionType: "fixed_discount",
    discountAmount: 200,
    eligibleCategory: "all",
    eligibleProductIds: ["mac-mini"],
    eligibleStorageOptions: [],
  };

  const macItem = {
    product: createMockProduct("mac-mini", "Mac mini", "MacBooks", 9000),
    storage: "256GB",
    color: "Silver",
    quantity: 1,
    configuredPrice: 9000,
  };

  const fixedResult = evaluateCartPromotions([macItem], [fixedPromo], new Date("2026-11-15T12:00:00.000Z"));
  assert.equal(fixedResult.totalDiscount, 200);
  assert.equal(fixedResult.finalSubtotal, 8800);

  // Excessive discount safeguard
  const excessivePromo = {
    ...baseCampaign,
    promotionType: "fixed_discount",
    discountAmount: 999999,
    eligibleCategory: "all",
    eligibleProductIds: ["mac-mini"],
    eligibleStorageOptions: [],
  };
  const capResult = evaluateCartPromotions([macItem], [excessivePromo], new Date("2026-11-15T12:00:00.000Z"));
  assert.equal(capResult.finalSubtotal, 0, "Subtotal must never drop below 0");
  assert.equal(capResult.totalDiscount, 9000, "Discount cannot exceed item price");

  // 8. Deterministic Non-Stacking Best-Discount Rule
  const promo5Percent = {
    ...baseCampaign,
    id: "p5",
    priority: 1,
    promotionType: "percentage_discount",
    discountPercent: 5,
    eligibleCategory: "all",
    eligibleProductIds: ["mac-mini"],
    eligibleStorageOptions: [],
    allowStacking: false,
  };
  const promo10Percent = {
    ...baseCampaign,
    id: "p10",
    priority: 2,
    promotionType: "percentage_discount",
    discountPercent: 10,
    eligibleCategory: "all",
    eligibleProductIds: ["mac-mini"],
    eligibleStorageOptions: [],
    allowStacking: false,
  };

  const conflictResult = evaluateCartPromotions([macItem], [promo5Percent, promo10Percent], new Date("2026-11-15T12:00:00.000Z"));
  assert.equal(conflictResult.totalDiscount, 900, "Must choose 10% (900) over 5% (450)");
  assert.equal(conflictResult.appliedCampaigns.length, 1);
  assert.equal(conflictResult.appliedCampaigns[0].id, "p10");

  // 9. Advertising-Only Campaign
  const adPromo = {
    ...baseCampaign,
    promotionType: "advertising",
    eligibleProductIds: [],
  };
  const adResult = evaluateCartPromotions([macItem], [adPromo], new Date("2026-11-15T12:00:00.000Z"));
  assert.equal(adResult.totalDiscount, 0, "Ad campaigns must not modify checkout subtotal");

  // 10. Universal Typography Safeguard in New Components
  const filesToCheck = [
    "src/types/promotion.ts",
    "src/promotions/defaultPromotions.ts",
    "src/promotions/promotionEngine.ts",
    "src/promotions/supabasePromotionsRepository.ts",
    "src/components/promotions/PromotionalAnnouncementBar.tsx",
    "src/components/promotions/HomepagePromotionalCarousel.tsx",
    "src/components/promotions/ProductPromotionalBadge.tsx",
    "src/pages/OffersPage.tsx",
    "src/pages/admin/AdminPromotionsPage.tsx",
  ];

  for (const rel of filesToCheck) {
    const content = await fs.readFile(path.join(projectRoot, rel), "utf8");
    assert.equal(content.includes("overflow-wrap: anywhere"), false, `${rel} must not contain overflow-wrap: anywhere`);
  }

  console.log("Promotions and campaigns test suite passed successfully!");
}

// Allow standalone execution: node scripts/test-promotions-system.mjs
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  testPromotionsSystem().catch((err) => {
    console.error("Test failed:", err);
    process.exit(1);
  });
}
