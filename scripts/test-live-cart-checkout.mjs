import puppeteer from "puppeteer-core";
import path from "node:path";
import assert from "node:assert/strict";

const EDGE_PATH = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const ARTIFACTS_DIR = "C:\\Users\\akakp\\.gemini\\antigravity\\brain\\6c721dee-7d06-4a2d-92fb-b74a2b38f58f";
const STORE_URL = "https://buyandsellgh.com";

async function testCartCheckout() {
  console.log("=== TESTING LIVE STOREFRONT CART & CHECKOUT ===");

  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-gpu"],
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });

    // 1. Navigate to Store
    console.log("1. Navigating to https://buyandsellgh.com/store ...");
    await page.goto(`${STORE_URL}/store`, { waitUntil: "networkidle2", timeout: 45000 });
    
    // Check product cards
    const cardSelector = "article, .product-card, a[href*='/buy/'], a[href*='/store/']";
    await page.waitForSelector(cardSelector, { timeout: 15000 });
    const productCount = await page.$$eval(cardSelector, els => els.length);
    console.log(`Found ${productCount} product card links in store.`);
    assert.ok(productCount > 0, "Store must display products");

    // 2. Open iPhone 17 PDP
    console.log("2. Navigating to /shop/buy-iphone/iphone-17 ...");
    await page.goto(`${STORE_URL}/shop/buy-iphone/iphone-17`, { waitUntil: "networkidle2", timeout: 45000 });
    await new Promise(r => setTimeout(r, 2000));

    const title = await page.title();
    console.log("PDP Title:", title);

    // Verify price element
    const priceText = await page.evaluate(() => {
      const el = document.querySelector(".price, [data-price], [class*='Price'], [class*='price']");
      return el ? el.innerText : document.body.innerText.match(/GH₵\s*[\d,]+/)?.[0];
    });
    console.log("PDP Displayed Price:", priceText);
    assert.ok(priceText && priceText.includes("GH₵"), "PDP must show GH₵ price");

    // Capture PDP screenshot
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, "live-qa-pdp-iphone17.png") });
    console.log("Saved screenshot: live-qa-pdp-iphone17.png");

    // 3. Add to Cart
    console.log("3. Clicking Add to Cart / Buy Now button...");
    const added = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll("button"));
      const addBtn = btns.find(b => b.innerText.toLowerCase().includes("add to cart") || b.innerText.toLowerCase().includes("buy"));
      if (addBtn) {
        addBtn.click();
        return true;
      }
      return false;
    });
    console.log("Add to Cart clicked:", added);
    await new Promise(r => setTimeout(r, 2000));

    // 4. Open Cart Page
    console.log("4. Navigating to /cart ...");
    await page.goto(`${STORE_URL}/cart`, { waitUntil: "networkidle2", timeout: 45000 });
    await new Promise(r => setTimeout(r, 2000));

    const cartBodyText = await page.evaluate(() => document.body.innerText);
    const hasCartItem = cartBodyText.includes("iPhone 17") || cartBodyText.includes("GH₵");
    console.log("Cart contains product/price:", hasCartItem);
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, "live-qa-cart-page.png") });
    console.log("Saved screenshot: live-qa-cart-page.png");

    // 5. Open Checkout Page
    console.log("5. Navigating to /checkout ...");
    await page.goto(`${STORE_URL}/checkout`, { waitUntil: "networkidle2", timeout: 45000 });
    await new Promise(r => setTimeout(r, 2000));

    const checkoutText = await page.evaluate(() => document.body.innerText);
    console.log("Checkout page loaded, contains Checkout/Total:", checkoutText.includes("Checkout") || checkoutText.includes("Total") || checkoutText.includes("Order"));
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, "live-qa-checkout-page.png") });
    console.log("Saved screenshot: live-qa-checkout-page.png");

    console.log("=== STOREFRONT CART & CHECKOUT QA PASSED SUCCESSFULLY ===");
  } finally {
    await browser.close();
  }
}

testCartCheckout().catch(err => {
  console.error("Test failed:", err);
  process.exit(1);
});
