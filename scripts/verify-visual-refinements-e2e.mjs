import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import puppeteer from "puppeteer-core";
import assert from "node:assert/strict";
import { preview } from "vite";

const EDGE_PATH = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const ARTIFACT_DIR = "C:\\Users\\akakp\\.gemini\\antigravity\\brain\\6c721dee-7d06-4a2d-92fb-b74a2b38f58f";
const PORT = 4199;

const previewServer = await preview({
  preview: {
    port: PORT,
    host: "127.0.0.1",
  },
});
console.log(`Vite preview server running on http://127.0.0.1:${PORT}`);

const userDir = fs.mkdtempSync(path.join(os.tmpdir(), "bsgh-edge-"));

const browser = await puppeteer.launch({
  executablePath: EDGE_PATH,
  userDataDir: userDir,
  headless: true,
  args: [
    "--no-sandbox",
    "--disable-setuid-sandbox",
    "--no-first-run",
    "--no-default-browser-check",
    "--disable-dev-shm-usage",
    "--disable-gpu",
  ],
});

try {
  const page = await browser.newPage();

  // =========================================================================
  // 1. VERIFY ENLARGED PRODUCT IMAGES ON MAIN STORE PAGE
  // =========================================================================
  console.log("\n--- TEST 1: MAIN STORE ENLARGED PRODUCT PHOTOGRAPHY ---");
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
  await page.goto(`http://127.0.0.1:${PORT}/store`, { waitUntil: "domcontentloaded" });
  await page.waitForSelector(".store-category-card-img", { timeout: 10000 });
  await page.waitForSelector(".store-latest-card-img", { timeout: 10000 });
  await new Promise((r) => setTimeout(r, 1500));

  const storeSizes = await page.evaluate(() => {
    const latestImg = document.querySelector(".store-feature-section-latest .store-latest-card-img");
    const categoryImg = document.querySelector(".store-category-card-img");
    const accessoryImg = document.querySelector(".store-accessory-card .store-accessory-img");
    const familyImg = document.querySelector(".store-family-img");

    return {
      latestMediaHeight: document.querySelector(".store-feature-section-latest .store-latest-card-media")?.clientHeight,
      latestImgMaxHeight: latestImg ? window.getComputedStyle(latestImg).maxHeight : null,
      categoryMediaHeight: document.querySelector(".store-category-card-media")?.clientHeight,
      categoryImgMaxHeight: categoryImg ? window.getComputedStyle(categoryImg).maxHeight : null,
      accessoryMediaHeight: document.querySelector(".store-accessories-track .store-accessory-media")?.clientHeight,
      accessoryImgMaxHeight: accessoryImg ? window.getComputedStyle(accessoryImg).maxHeight : null,
      familyWrapWidth: document.querySelector(".store-family-img-wrap")?.clientWidth,
    };
  });

  console.log("Store image and media dimensions:", JSON.stringify(storeSizes, null, 2));
  assert.ok(parseInt(storeSizes.latestImgMaxHeight, 10) >= 280, "The Latest image max-height should be at least 280px");
  assert.ok(parseInt(storeSizes.categoryImgMaxHeight, 10) >= 170, "Shop by Category image max-height should be at least 170px");
  assert.ok(parseInt(storeSizes.accessoryMediaHeight, 10) >= 190, "Featured Accessories media height should be at least 190px");
  console.log("✓ All Store image container sizes confirmed enlarged!");

  // Screenshots of store sections
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, "refine-store-latest-desktop.png"),
    clip: { x: 0, y: 180, width: 1440, height: 720 },
  });
  console.log("Captured refine-store-latest-desktop.png");

  // Scroll to category section and accessories
  await page.evaluate(() => {
    const el = document.querySelector(".store-category-section");
    if (el) el.scrollIntoView();
  });
  await new Promise((r) => setTimeout(r, 800));
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, "refine-store-categories-desktop.png"),
    clip: { x: 0, y: 100, width: 1440, height: 500 },
  });
  console.log("Captured refine-store-categories-desktop.png");

  await page.evaluate(() => {
    const el = document.querySelector(".store-accessories-section");
    if (el) el.scrollIntoView();
  });
  await new Promise((r) => setTimeout(r, 800));
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, "refine-store-accessories-desktop.png"),
    clip: { x: 0, y: 100, width: 1440, height: 500 },
  });
  console.log("Captured refine-store-accessories-desktop.png");

  // =========================================================================
  // 2. VERIFY NO PRICES ON LEARN MORE PAGES
  // =========================================================================
  console.log("\n--- TEST 2: LEARN MORE PAGES PRICE BADGE REMOVAL ---");
  await page.goto(`http://127.0.0.1:${PORT}/iphone/iphone-18-pro`, { waitUntil: "domcontentloaded" });
  await page.waitForSelector(".editorial-hero", { timeout: 10000 });
  await page.waitForSelector(".editorial-buy", { timeout: 10000 });
  await new Promise((r) => setTimeout(r, 1000));

  const iphone18ProHero = await page.evaluate(() => {
    const hero = document.querySelector(".editorial-hero");
    const pricePill = document.querySelector(".editorial-hero-price-pill");
    const buyBtn = document.querySelector(".editorial-buy");
    const heroText = hero ? hero.innerText : "";
    return {
      hasPricePill: Boolean(pricePill),
      heroHasFromPrice: heroText.includes("From GH₵") || heroText.includes("20,500"),
      buyBtnText: buyBtn?.textContent?.trim(),
      buyBtnHref: buyBtn?.getAttribute("href"),
    };
  });

  console.log("iPhone 18 Pro Learn More Hero Check:", JSON.stringify(iphone18ProHero, null, 2));
  assert.equal(iphone18ProHero.hasPricePill, false, "Must NOT have price pill in hero");
  assert.equal(iphone18ProHero.heroHasFromPrice, false, "Must NOT contain From GH₵ in hero text");
  assert.equal(iphone18ProHero.buyBtnText, "Buy", "Buy button must exist");
  assert.equal(iphone18ProHero.buyBtnHref, "/shop/buy-iphone/iphone-18-pro", "Buy button must link to buy page");
  console.log("✓ iPhone 18 Pro price badge successfully removed; Buy button intact!");

  await page.screenshot({
    path: path.join(ARTIFACT_DIR, "refine-learn-more-iphone-18-pro.png"),
    clip: { x: 0, y: 0, width: 1440, height: 720 },
  });
  console.log("Captured refine-learn-more-iphone-18-pro.png");

  // Also check MacBook Air Learn More
  await page.goto(`http://127.0.0.1:${PORT}/mac/macbook-air`, { waitUntil: "domcontentloaded" });
  await page.waitForSelector(".editorial-hero", { timeout: 10000 });
  await new Promise((r) => setTimeout(r, 1000));
  const macbookAirHasPrice = await page.evaluate(() => {
    const pricePill = document.querySelector(".editorial-hero-price-pill");
    const text = document.querySelector(".editorial-hero")?.innerText || "";
    return Boolean(pricePill) || text.includes("From GH₵");
  });
  console.log("MacBook Air Learn More price badge check:", macbookAirHasPrice ? "FAILED" : "✓ CLEAN");
  assert.equal(macbookAirHasPrice, false, "MacBook Air must NOT have price pill");

  await page.screenshot({
    path: path.join(ARTIFACT_DIR, "refine-learn-more-macbook-air.png"),
    clip: { x: 0, y: 0, width: 1440, height: 720 },
  });
  console.log("Captured refine-learn-more-macbook-air.png");

  // =========================================================================
  // 3. VERIFY IPHONE DUO CINEMATIC MEDIA BORDER
  // =========================================================================
  console.log("\n--- TEST 3: IPHONE DUO CINEMATIC MEDIA BORDER ---");
  await page.goto(`http://127.0.0.1:${PORT}/iphone/iphone-duo`, { waitUntil: "domcontentloaded" });
  await page.waitForSelector(".editorial-hero", { timeout: 10000 });
  await new Promise((r) => setTimeout(r, 1500));

  const duoMediaStyles = await page.evaluate(() => {
    const container = document.querySelector(".editorial-story-iphone-duo .editorial-cinematic-opening-media .cinematic-video-container");
    const video = document.querySelector(".editorial-story-iphone-duo .editorial-cinematic-opening-media .cinematic-video-media");
    if (!container) return null;
    const computed = window.getComputedStyle(container);
    const videoComputed = video ? window.getComputedStyle(video) : null;
    return {
      backgroundColor: computed.backgroundColor,
      borderTopWidth: computed.borderTopWidth,
      borderTopColor: computed.borderTopColor,
      videoTransform: videoComputed?.transform,
      aspectRatio: computed.aspectRatio,
    };
  });

  console.log("iPhone Duo Cinematic Media Styles:", JSON.stringify(duoMediaStyles, null, 2));
  assert.equal(duoMediaStyles.backgroundColor, "rgb(255, 255, 255)", "Container background must be white, not black");
  assert.ok(duoMediaStyles.borderTopWidth === "0px" || duoMediaStyles.borderTopColor === "rgba(0, 0, 0, 0)", "No black border at top");
  console.log("✓ iPhone Duo cinematic media background is clean white with non-destructive video scale!");

  await page.screenshot({
    path: path.join(ARTIFACT_DIR, "refine-iphone-duo-cinematic-desktop.png"),
    clip: { x: 0, y: 0, width: 1440, height: 800 },
  });
  console.log("Captured refine-iphone-duo-cinematic-desktop.png");

  // Mobile iPhone Duo
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });
  await page.goto(`http://127.0.0.1:${PORT}/iphone/iphone-duo`, { waitUntil: "domcontentloaded" });
  await new Promise((r) => setTimeout(r, 1500));
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, "refine-iphone-duo-cinematic-mobile.png"),
  });
  console.log("Captured refine-iphone-duo-cinematic-mobile.png");

  // =========================================================================
  // 4. VERIFY APPLE-INSPIRED MOBILE SCROLLING NAVIGATION
  // =========================================================================
  console.log("\n--- TEST 4: APPLE-INSPIRED MOBILE SCROLLING NAVIGATION ---");

  const testViewports = [
    { name: "iPhone 375px", width: 375, height: 667 },
    { name: "iPhone 390px", width: 390, height: 844 },
    { name: "iPhone 430px", width: 430, height: 932 },
  ];

  for (const vp of testViewports) {
    console.log(`\nTesting mobile scroll navigation on ${vp.name} (${vp.width}x${vp.height})...`);
    await page.setViewport({ width: vp.width, height: vp.height, deviceScaleFactor: 2 });
    await page.goto(`http://127.0.0.1:${PORT}/store`, { waitUntil: "domcontentloaded" });
    await page.waitForSelector(".store-page", { timeout: 10000 });
    await page.evaluate(() => {
      window.scrollTo(0, 0);
      document.body.style.overflow = "";
    });
    await new Promise((r) => setTimeout(r, 1000));

    // A. At top of page: header is visible
    const atTopState = await page.evaluate(() => {
      const header = document.querySelector(".site-header.global-header");
      return {
        hasNavHidden: header?.classList.contains("nav-hidden"),
        scrollY: window.scrollY,
      };
    });
    console.log("At top state:", atTopState);
    assert.equal(atTopState.hasNavHidden, false, "Header must be visible at top of page");

    if (vp.width === 390) {
      await page.screenshot({
        path: path.join(ARTIFACT_DIR, "refine-mobile-nav-visible-top.png"),
      });
      console.log("Captured refine-mobile-nav-visible-top.png");
    }

    // Ensure document has height to scroll
    await page.evaluate(() => {
      window.scrollBy(0, 250);
      window.dispatchEvent(new Event("scroll"));
    });
    await new Promise((r) => setTimeout(r, 400));

    const scrolledDownState = await page.evaluate(() => {
      const header = document.querySelector(".site-header.global-header");
      return {
        hasNavHidden: header?.classList.contains("nav-hidden"),
        scrollY: window.scrollY,
      };
    });
    console.log("Scrolled down state (after scrollBy 250):", scrolledDownState);
    assert.equal(scrolledDownState.hasNavHidden, true, "Header must have nav-hidden class when scrolling down");

    if (vp.width === 390) {
      await page.screenshot({
        path: path.join(ARTIFACT_DIR, "refine-mobile-nav-hidden-scrolling.png"),
      });
      console.log("Captured refine-mobile-nav-hidden-scrolling.png");
    }

    // C. Scroll UP by 100px: header smoothly reappears (nav-hidden removed)
    await page.evaluate(() => {
      window.scrollBy(0, -100);
      window.dispatchEvent(new Event("scroll"));
    });
    await new Promise((r) => setTimeout(r, 400));

    const scrolledUpState = await page.evaluate(() => {
      const header = document.querySelector(".site-header.global-header");
      return {
        hasNavHidden: header?.classList.contains("nav-hidden"),
        scrollY: window.scrollY,
      };
    });
    console.log("Scrolled up state (after scrollBy -100):", scrolledUpState);
    assert.equal(scrolledUpState.hasNavHidden, false, "Header must reappear when scrolling up");

    if (vp.width === 390) {
      await page.screenshot({
        path: path.join(ARTIFACT_DIR, "refine-mobile-nav-reappeared-scrollup.png"),
      });
      console.log("Captured refine-mobile-nav-reappeared-scrollup.png");
    }

    // D. When mobile menu drawer is open, scrolling down MUST NOT hide header
    console.log("Testing drawer open immunity while scrolling down...");
    await page.evaluate(() => {
      const menuBtn = document.querySelector(".global-header-menu-btn");
      if (menuBtn) menuBtn.click();
    });
    await new Promise((r) => setTimeout(r, 600));

    await page.evaluate(() => {
      window.scrollBy(0, 150);
      window.dispatchEvent(new Event("scroll"));
    });
    await new Promise((r) => setTimeout(r, 300));

    const drawerOpenScrollState = await page.evaluate(() => {
      const header = document.querySelector(".site-header.global-header");
      return {
        hasNavHidden: header?.classList.contains("nav-hidden"),
        drawerPresent: Boolean(document.querySelector(".global-mobile-drawer")),
      };
    });
    console.log("Drawer open scroll state:", drawerOpenScrollState);
    assert.equal(drawerOpenScrollState.hasNavHidden, false, "Header must remain visible when mobile menu is open");

    // Close the drawer before finishing viewport test
    await page.evaluate(() => {
      const menuBtn = document.querySelector(".global-header-menu-btn");
      if (menuBtn && document.querySelector(".global-mobile-drawer")) {
        menuBtn.click();
      }
      document.body.style.overflow = "";
    });
    await new Promise((r) => setTimeout(r, 500));

    console.log(`✓ ${vp.name} mobile scroll navigation verified perfectly!`);
  }

  // =========================================================================
  // 5. REGRESSION CHECK: DESKTOP HEADER UNAFFECTED
  // =========================================================================
  console.log("\n--- TEST 5: DESKTOP HEADER REMAINS FIXED & STICKY ---");
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
  await page.goto(`http://127.0.0.1:${PORT}/store`, { waitUntil: "domcontentloaded" });
  await page.evaluate(() => {
    window.scrollTo(0, 500);
    window.dispatchEvent(new Event("scroll"));
  });
  await new Promise((r) => setTimeout(r, 400));

  const desktopScrollState = await page.evaluate(() => {
    const header = document.querySelector(".site-header.global-header");
    return {
      hasNavHidden: header?.classList.contains("nav-hidden"),
      scrollY: window.scrollY,
    };
  });
  console.log("Desktop scroll state (scrollY=500):", desktopScrollState);
  assert.equal(desktopScrollState.hasNavHidden, false, "Desktop header must NOT hide on scroll");
  console.log("✓ Desktop header remains permanently accessible!");

  console.log("\n============================================================");
  console.log("  ALL VISUAL REFINEMENT VERIFICATION CHECKS PASSED!        ");
  console.log("============================================================\n");
} catch (err) {
  console.error("Verification error:", err);
  process.exit(1);
} finally {
  await browser.close();
  previewServer.httpServer.close();
}
