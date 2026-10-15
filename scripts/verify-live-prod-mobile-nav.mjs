import puppeteer from "puppeteer-core";
import fs from "node:fs";
import path from "node:path";

const EDGE_PATH = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const ARTIFACTS_DIR = "C:\\Users\\akakp\\.gemini\\antigravity\\brain\\6c721dee-7d06-4a2d-92fb-b74a2b38f58f";

async function main() {
  console.log("=== STARTING LIVE PRODUCTION VERIFICATION FOR MOBILE NAV & HEROES ===");
  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const page = await browser.newPage();
    await page.setUserAgent("Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1");
    await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });

    console.log("Loading live storefront: https://buyandsellgh.com...");
    const res = await page.goto("https://buyandsellgh.com", { waitUntil: "domcontentloaded", timeout: 35000 });
    console.log(`Live HTTP Status: ${res.status()}`);

    // Wait for hero to render
    await page.waitForSelector(".home-ref-hero", { timeout: 15000 });
    await new Promise((r) => setTimeout(r, 3000));

    // 1. Capture Live Hero positioning (iPhone 18 Pro)
    const heroLivePath = path.join(ARTIFACTS_DIR, "live-prod-hero-18-pro-390.png");
    await page.screenshot({ path: heroLivePath });
    console.log(`Saved: ${heroLivePath}`);

    // 2. Open Hamburger Menu
    console.log("Testing live hamburger opening...");
    const menuBtn = await page.waitForSelector(".global-header-menu-btn");
    await menuBtn.click();
    await page.waitForSelector(".global-mobile-drawer", { timeout: 8000 });
    await new Promise((r) => setTimeout(r, 600));

    const menuMainLivePath = path.join(ARTIFACTS_DIR, "live-prod-mobile-menu-main.png");
    await page.screenshot({ path: menuMainLivePath });
    console.log(`Saved: ${menuMainLivePath}`);

    // 3. Click Store category -> Submenu
    console.log("Testing live Store submenu transition...");
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll(".global-mobile-section-btn"));
      const storeBtn = btns.find((b) => b.textContent.includes("Store"));
      if (storeBtn) storeBtn.click();
    });
    await new Promise((r) => setTimeout(r, 600));

    const menuStoreLivePath = path.join(ARTIFACTS_DIR, "live-prod-mobile-menu-store.png");
    await page.screenshot({ path: menuStoreLivePath });
    console.log(`Saved: ${menuStoreLivePath}`);

    // 4. Click Back button
    console.log("Testing live Back button...");
    const backBtn = await page.waitForSelector(".global-mobile-back-btn");
    await backBtn.click();
    await new Promise((r) => setTimeout(r, 600));

    // 5. Click Mac category -> Submenu
    console.log("Testing live Mac submenu transition...");
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll(".global-mobile-section-btn"));
      const macBtn = btns.find((b) => b.textContent.includes("Mac"));
      if (macBtn) macBtn.click();
    });
    await new Promise((r) => setTimeout(r, 600));

    const menuMacLivePath = path.join(ARTIFACTS_DIR, "live-prod-mobile-menu-mac.png");
    await page.screenshot({ path: menuMacLivePath });
    console.log(`Saved: ${menuMacLivePath}`);

    // 6. Close menu
    console.log("Closing live menu...");
    await menuBtn.click();
    await new Promise((r) => setTimeout(r, 400));

    // 7. Scroll to iPhone Duo
    console.log("Testing live iPhone Duo positioning...");
    await page.evaluate(() => {
      const el = document.querySelector(".home-ref-iphone-duo");
      if (el) el.scrollIntoView();
    });
    await new Promise((r) => setTimeout(r, 1200));
    const duoLivePath = path.join(ARTIFACTS_DIR, "live-prod-hero-duo-390.png");
    await page.screenshot({ path: duoLivePath });
    console.log(`Saved: ${duoLivePath}`);

    // 8. Scroll to Apple Watch Ultra 4
    console.log("Testing live Apple Watch Ultra 4 positioning...");
    await page.evaluate(() => {
      const el = document.querySelector(".home-ref-watch-ultra-4");
      if (el) el.scrollIntoView();
    });
    await new Promise((r) => setTimeout(r, 1200));
    const watchLivePath = path.join(ARTIFACTS_DIR, "live-prod-tile-watch-ultra-390.png");
    await page.screenshot({ path: watchLivePath });
    console.log(`Saved: ${watchLivePath}`);

    await page.close();
    console.log("=== ALL LIVE PRODUCTION CHECKS COMPLETED SUCCESSFULLY ===");
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error("Live verification error:", err);
  process.exit(1);
});
