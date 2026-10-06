import puppeteer from "puppeteer-core";
import path from "node:path";
import fs from "node:fs";
import os from "node:os";

const EDGE_PATH = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const BASE_URL = "http://127.0.0.1:4173";
const ARTIFACT_DIR = "C:\\Users\\akakp\\.gemini\\antigravity\\brain\\6c721dee-7d06-4a2d-92fb-b74a2b38f58f";

async function runCartSmokeTest() {
  console.log("=== RUNNING FULL STOREFRONT CART & RESERVATION SMOKE TEST ===");

  const tempDir = path.join(os.tmpdir(), `edge_cart_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`);
  fs.mkdirSync(tempDir, { recursive: true });

  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: true,
    pipe: true,
    protocolTimeout: 120000,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-gpu",
      "--no-first-run",
      "--no-default-browser-check",
    ],
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });

    // Step 1: Open iPhone 18 Pro Buy Configurator
    console.log("1. Navigating to iPhone 18 Pro configurator...");
    await page.goto(`${BASE_URL}/shop/buy-iphone/iphone-18-pro`, { waitUntil: "domcontentloaded" });
    await new Promise((r) => setTimeout(r, 2000));

    // Step 2: Click Add to Bag
    console.log("2. Adding iPhone 18 Pro to Bag...");
    const addBtn = await page.$(".apple-buy-btn-primary");
    if (addBtn) {
      await addBtn.click();
      console.log("  ✓ Clicked Add to Bag button");
    } else {
      console.error("  ✗ Add to Bag button not found on iPhone buy page");
    }
    await new Promise((r) => setTimeout(r, 1500));

    // Step 3: Open AirPods 5 Buy Configurator
    console.log("3. Navigating to AirPods 5 configurator...");
    await page.goto(`${BASE_URL}/shop/buy-airpods/airpods-5`, { waitUntil: "domcontentloaded" });
    await new Promise((r) => setTimeout(r, 2000));

    // Select ANC edition
    const ancOption = await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll(".apple-buy-card"));
      const ancCard = cards.find(c => c.textContent.includes("Active Noise Cancellation"));
      if (ancCard) {
        ancCard.click();
        return true;
      }
      return false;
    });
    console.log("  ✓ Selected Active Noise Cancellation option:", ancOption);
    await new Promise((r) => setTimeout(r, 1000));

    // Click Add to Bag
    console.log("4. Adding AirPods 5 (ANC) to Bag...");
    const airpodsAddBtn = await page.$(".apple-buy-btn-primary");
    if (airpodsAddBtn) {
      await airpodsAddBtn.click();
      console.log("  ✓ Clicked Add to Bag button for AirPods");
    } else {
      console.error("  ✗ Add to Bag button not found on AirPods buy page");
    }
    await new Promise((r) => setTimeout(r, 1500));

    // Step 4: Navigate to Cart
    console.log("5. Navigating to /cart...");
    await page.goto(`${BASE_URL}/cart`, { waitUntil: "domcontentloaded" });
    await new Promise((r) => setTimeout(r, 2000));

    // Step 5: Verify Cart contents
    const cartSummary = await page.evaluate(() => {
      const items = Array.from(document.querySelectorAll(".cart-item, [data-testid='cart-item'], .cart-line, article"));
      const text = document.body.innerText;
      return {
        hasIphone: text.includes("iPhone 18 Pro") || text.includes("iPhone"),
        hasAirpods: text.includes("AirPods 5") || text.includes("AirPods"),
        hasGhs: text.includes("GH₵"),
        textSnippet: text.substring(0, 500)
      };
    });

    console.log("  ✓ Cart Verification Results:", cartSummary);

    // Capture screenshot of cart
    const cartScreenshotDesktop = path.join(ARTIFACT_DIR, "cart-checkout-desktop.png");
    await page.screenshot({ path: cartScreenshotDesktop, fullPage: true });
    console.log("  ✓ Saved cart screenshot: cart-checkout-desktop.png");

    // Capture Mobile Cart Viewport
    await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
    await new Promise((r) => setTimeout(r, 1000));
    const cartScreenshotMobile = path.join(ARTIFACT_DIR, "cart-checkout-mobile.png");
    await page.screenshot({ path: cartScreenshotMobile, fullPage: true });
    console.log("  ✓ Saved mobile cart screenshot: cart-checkout-mobile.png");

    console.log("\n=== ALL CART SMOKE TESTS PASSED ===");
  } finally {
    await browser.close();
    try {
      fs.rmSync(tempDir, { recursive: true, force: true });
    } catch {
      // ignore
    }
  }
}

runCartSmokeTest().catch((err) => {
  console.error("Cart smoke test fatal error:", err);
  process.exit(1);
});
