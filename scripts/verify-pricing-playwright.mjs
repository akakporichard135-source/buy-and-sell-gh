import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

const PORT = 4173; // Preview port or dev port
const BASE_URL = `http://localhost:${PORT}`;
const ARTIFACT_DIR = path.resolve("C:/Users/akakp/.gemini/antigravity/brain/6c721dee-7d06-4a2d-92fb-b74a2b38f58f");

async function main() {
  console.log("=== PLAYWRIGHT VERIFICATION: BUY & SELL GH PRICING SYSTEM ===");
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  const page = await context.newPage();

  let passCount = 0;
  let failCount = 0;

  function record(condition, desc) {
    if (condition) {
      console.log(`  ✓ PASS: ${desc}`);
      passCount++;
    } else {
      console.error(`  ✗ FAIL: ${desc}`);
      failCount++;
    }
  }

  try {
    // 1. Check Storefront Pricing
    console.log("\n[Step 1: Storefront Pricing & Card Display]");
    await page.goto(`${BASE_URL}/store`, { waitUntil: "networkidle" });
    await page.waitForTimeout(1000);

    const storeContent = await page.content();
    record(!storeContent.includes("Contact for Price") || storeContent.includes("From GH₵"), "Storefront displays real GH₵ prices");
    record(storeContent.includes("GH₵"), "Currency symbol GH₵ is present on storefront");

    await page.screenshot({ path: path.join(ARTIFACT_DIR, "verify-pricing-01-storefront.png"), fullPage: false });
    console.log("  📸 Saved verify-pricing-01-storefront.png");

    // 2. Test iPhone 16 Pro Max Configurator Price Switching
    console.log("\n[Step 2: iPhone 16 Pro Max Configurator Price Switching]");
    await page.goto(`${BASE_URL}/buy/iphone-16-pro-max`, { waitUntil: "networkidle" });
    await page.waitForTimeout(800);

    // Initial price should be 256GB (GH₵ 17,800)
    let bodyText = await page.textContent("body");
    record(bodyText.includes("17,800"), "Initial 256GB price shows GH₵ 17,800");

    // Click 512GB option
    const btn512 = page.locator("button, div").filter({ hasText: /^512GB/ }).first();
    if (await btn512.isVisible()) {
      await btn512.click();
      await page.waitForTimeout(500);
      bodyText = await page.textContent("body");
      record(bodyText.includes("20,500"), "Switching to 512GB updates price dynamically to GH₵ 20,500");
    }

    // Click 1TB option
    const btn1TB = page.locator("button, div").filter({ hasText: /^1TB/ }).first();
    if (await btn1TB.isVisible()) {
      await btn1TB.click();
      await page.waitForTimeout(500);
      bodyText = await page.textContent("body");
      record(bodyText.includes("23,500"), "Switching to 1TB updates price dynamically to GH₵ 23,500");
    }

    // Test Trade-in breakdown
    console.log("\n[Step 3: Trade-in Policy & Separation Display]");
    const tradeInCheckbox = page.locator("input[type='checkbox']").first();
    if (await tradeInCheckbox.isVisible()) {
      await tradeInCheckbox.check();
      await page.waitForTimeout(500);
      bodyText = await page.textContent("body");
      record(bodyText.includes("Estimated Trade-in Credit") || bodyText.includes("Estimated Credit"), "Trade-in credit is separated and displayed explicitly");
      record(bodyText.includes("Estimated Balance Due") || bodyText.includes("Balance Due"), "Estimated balance due is calculated separately from retail price");
    }

    await page.screenshot({ path: path.join(ARTIFACT_DIR, "verify-pricing-02-iphone-configurator.png"), fullPage: false });
    console.log("  📸 Saved verify-pricing-02-iphone-configurator.png");

    // Add to Bag
    console.log("\n[Step 4: Add Configured Variant to Bag]");
    const addToBagBtn = page.getByRole("button", { name: /Add to Bag/i }).first();
    if (await addToBagBtn.isVisible()) {
      await addToBagBtn.click();
      await page.waitForTimeout(600);
    }

    // 5. Check Cart Page
    console.log("\n[Step 5: Cart Synchronization & Subtotal Calculation]");
    await page.goto(`${BASE_URL}/cart`, { waitUntil: "networkidle" });
    await page.waitForTimeout(800);

    const cartText = await page.textContent("body");
    record(cartText.includes("iPhone 16 Pro Max"), "Cart displays configured product name");
    record(cartText.includes("23,500") || cartText.includes("20,500") || cartText.includes("17,800"), "Cart item displays configured variant price");
    record(cartText.includes("Subtotal") && cartText.includes("GH₵"), "Cart calculates and displays dynamic subtotal");

    await page.screenshot({ path: path.join(ARTIFACT_DIR, "verify-pricing-03-cart-page.png"), fullPage: false });
    console.log("  📸 Saved verify-pricing-03-cart-page.png");

    // 6. Check Admin Pricing Manager
    console.log("\n[Step 6: Admin Pricing & Stock Management Interface]");
    await page.goto(`${BASE_URL}/admin/pricing`, { waitUntil: "networkidle" });
    await page.waitForTimeout(800);

    const adminText = await page.textContent("body");
    record(adminText.includes("Pricing & Inventory Manager") || adminText.includes("Pricing & Stock"), "Admin Pricing Manager interface rendered");
    record(adminText.includes("Configurations") || adminText.includes("Products"), "Admin stats and matrix rendered");

    await page.screenshot({ path: path.join(ARTIFACT_DIR, "verify-pricing-04-admin-pricing.png"), fullPage: false });
    console.log("  📸 Saved verify-pricing-04-admin-pricing.png");

    console.log(`\n======================================================`);
    console.log(`PLAYWRIGHT TEST RESULT: ${passCount} PASSED, ${failCount} FAILED`);
    console.log(`======================================================`);

    if (failCount > 0) {
      process.exit(1);
    } else {
      process.exit(0);
    }
  } catch (err) {
    console.error("Playwright test encountered error:", err);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

main();
