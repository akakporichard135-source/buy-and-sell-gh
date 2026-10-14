import puppeteer from "puppeteer-core";
import path from "node:path";
import assert from "node:assert/strict";

const EDGE_PATH = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const ARTIFACTS_DIR = "C:\\Users\\akakp\\.gemini\\antigravity\\brain\\6c721dee-7d06-4a2d-92fb-b74a2b38f58f";

async function main() {
  console.log("=== VERIFYING LIVE STOREFRONT FEATURES & CATALOG (REAL ROUTES) ===");

  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });

    // 1. Learn More: iPhone 18 Pro (/iphone/iphone-18-pro)
    console.log("1. Checking iPhone 18 Pro Learn More (https://buyandsellgh.com/iphone/iphone-18-pro)...");
    const iphoneRes = await page.goto("https://buyandsellgh.com/iphone/iphone-18-pro", { waitUntil: "networkidle2" });
    assert.equal(iphoneRes.status(), 200, "iPhone 18 Pro Learn More must return 200");
    const hasIphoneVideo = await page.evaluate(() => document.querySelectorAll("video").length > 0);
    console.log("iPhone 18 Pro page has video element:", hasIphoneVideo);
    assert.ok(hasIphoneVideo, "iPhone 18 Pro page must have video element");

    // 2. Learn More: AirPods Pro 3 (/airpods/airpods-pro-3)
    console.log("2. Checking AirPods Pro 3 Learn More (https://buyandsellgh.com/airpods/airpods-pro-3)...");
    const airpodsRes = await page.goto("https://buyandsellgh.com/airpods/airpods-pro-3", { waitUntil: "networkidle2" });
    assert.equal(airpodsRes.status(), 200, "AirPods Pro 3 Learn More must return 200");
    const hasAirpodsVideo = await page.evaluate(() => document.querySelectorAll("video").length > 0);
    console.log("AirPods Pro 3 page has video element:", hasAirpodsVideo);
    assert.ok(hasAirpodsVideo, "AirPods Pro 3 page must have video element");

    // 3. Learn More: Mac mini (/mac-mini)
    console.log("3. Checking Mac mini Launch Page (https://buyandsellgh.com/mac-mini)...");
    const macminiRes = await page.goto("https://buyandsellgh.com/mac-mini", { waitUntil: "networkidle2" });
    assert.equal(macminiRes.status(), 200, "Mac mini Launch Page must return 200");

    // 4. Product Buy page (/shop/buy-iphone/iphone-18-pro)
    console.log("4. Checking Buy page (https://buyandsellgh.com/shop/buy-iphone/iphone-18-pro)...");
    const buyRes = await page.goto("https://buyandsellgh.com/shop/buy-iphone/iphone-18-pro", { waitUntil: "networkidle2" });
    assert.equal(buyRes.status(), 200, "Buy page must return 200");
    const hasConfigurator = await page.evaluate(() => {
      const text = document.body.innerText;
      return text.includes("Storage") || text.includes("Finish") || text.includes("Color") || text.includes("GH₵");
    });
    console.log("Configurator and prices visible:", hasConfigurator);
    assert.ok(hasConfigurator, "Configurator and prices must be visible");

    // 5. Sell / Trade-in page (/sell-or-trade)
    console.log("5. Checking Trade-in page (https://buyandsellgh.com/sell-or-trade)...");
    const tradeRes = await page.goto("https://buyandsellgh.com/sell-or-trade", { waitUntil: "networkidle2" });
    assert.equal(tradeRes.status(), 200, "Trade-in page must return 200");

    // 6. Services page (/repairs)
    console.log("6. Checking Repairs / Services page (https://buyandsellgh.com/repairs)...");
    const repairRes = await page.goto("https://buyandsellgh.com/repairs", { waitUntil: "networkidle2" });
    assert.equal(repairRes.status(), 200, "Repairs page must return 200");

    // 7. Homepage AirPods 5 check (ensure not on homepage)
    console.log("7. Checking Homepage for AirPods 5 absence...");
    await page.goto("https://buyandsellgh.com/", { waitUntil: "networkidle2" });
    const homepageHasAirpods5 = await page.evaluate(() => {
      const titles = Array.from(document.querySelectorAll("h2, h3, h4, [data-product-title]")).map(e => e.textContent.toLowerCase());
      return titles.some(t => t.includes("airpods 5"));
    });
    console.log("Homepage contains AirPods 5:", homepageHasAirpods5);
    assert.equal(homepageHasAirpods5, false, "AirPods 5 must not be on homepage");

    // 8. Floating WhatsApp button on homepage
    const hasWhatsApp = await page.evaluate(() => {
      const el = document.querySelector(".floating-whatsapp, [href*='wa.me']");
      return !!el;
    });
    console.log("Floating WhatsApp button present:", hasWhatsApp);
    assert.ok(hasWhatsApp, "WhatsApp button must be present");

    console.log("\n=== ALL LIVE STOREFRONT FEATURES VERIFIED SUCCESSFULLY ===");
  } finally {
    await browser.close();
  }
}

main().catch(e => {
  console.error("FAIL:", e);
  process.exit(1);
});
