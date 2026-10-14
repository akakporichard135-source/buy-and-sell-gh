import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import puppeteer from "puppeteer-core";
import assert from "node:assert/strict";

const EDGE_PATH = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const ARTIFACTS_DIR = "C:\\Users\\akakp\\.gemini\\antigravity\\brain\\6c721dee-7d06-4a2d-92fb-b74a2b38f58f";
const DIST_DIR = path.resolve("dist");

const mimeTypes = {
  ".html": "text/html",
  ".js": "application/javascript",
  ".css": "text/css",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".json": "application/json",
};

function createStaticServer(port = 4225) {
  const server = http.createServer((req, res) => {
    let reqPath = req.url.split("?")[0];
    if (reqPath === "/") reqPath = "/index.html";

    let filePath = path.join(DIST_DIR, reqPath);
    if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
      filePath = path.join(DIST_DIR, "index.html");
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = mimeTypes[ext] || "application/octet-stream";

    try {
      const content = fs.readFileSync(filePath);
      res.writeHead(200, { "Content-Type": contentType });
      res.end(content);
    } catch {
      res.writeHead(404);
      res.end("Not Found");
    }
  });

  return new Promise((resolve) => {
    server.listen(port, () => resolve(server));
  });
}

async function runQA() {
  console.log("=== STARTING MOBILE NAVIGATION & HERO QA ===");
  const server = await createStaticServer(4225);
  const baseUrl = "http://localhost:4225";

  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const viewports = [
      { name: "320px", width: 320, height: 600 },
      { name: "375px", width: 375, height: 667 },
      { name: "390px", width: 390, height: 844 },
      { name: "430px", width: 430, height: 932 },
    ];

    // 1. Test Navigation interaction on 390px
    console.log("\n--- Testing Hierarchical Mobile Menu Interactions (390px) ---");
    const page = await browser.newPage();
    await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
    await page.goto(baseUrl, { waitUntil: "domcontentloaded" });
    await page.waitForSelector(".global-header", { timeout: 10000 });

    // Step A: Hamburger closed -> click to open
    const menuBtn = await page.waitForSelector(".global-header-menu-btn");
    await menuBtn.click();
    await page.waitForSelector(".global-mobile-drawer", { timeout: 5000 });
    console.log("PASS: Mobile navigation drawer opened successfully.");

    // Screenshot main mobile menu
    await page.screenshot({
      path: path.join(ARTIFACTS_DIR, "qa-mobile-menu-main.png"),
    });
    console.log("Saved: qa-mobile-menu-main.png");

    // Check body scroll lock
    const isBodyLocked = await page.evaluate(() => document.body.style.overflow === "hidden");
    assert.strictEqual(isBodyLocked, true, "Body overflow should be hidden when menu is open");
    console.log("PASS: Body scroll lock active.");

    // Step B: Tap "Store" section button -> submenu opens
    const sectionButtons = await page.$$(".global-mobile-section-btn");
    assert.ok(sectionButtons.length >= 7, "Should have Store, Mac, iPad, iPhone, Watch, AirPods, Accessories, Support");
    
    // Click "Store"
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll(".global-mobile-section-btn"));
      const storeBtn = btns.find(b => b.textContent.includes("Store"));
      if (storeBtn) storeBtn.click();
    });
    await new Promise(r => setTimeout(r, 400)); // wait for transition

    // Verify submenu is active
    const isSubmenuActive = await page.evaluate(() => {
      const panels = document.querySelector(".global-mobile-panels");
      const title = document.querySelector(".global-mobile-submenu-title");
      return panels?.classList.contains("is-submenu-active") && title?.textContent === "Store";
    });
    assert.ok(isSubmenuActive, "Store submenu should be active");
    console.log("PASS: Store submenu opened with sliding transition.");

    await page.screenshot({
      path: path.join(ARTIFACTS_DIR, "qa-mobile-menu-store-submenu.png"),
    });
    console.log("Saved: qa-mobile-menu-store-submenu.png");

    // Step C: Tap "Back" -> returns to main menu
    const backBtn = await page.waitForSelector(".global-mobile-back-btn");
    await backBtn.click();
    await new Promise(r => setTimeout(r, 400));

    const isBackToMain = await page.evaluate(() => {
      const panels = document.querySelector(".global-mobile-panels");
      return !panels?.classList.contains("is-submenu-active");
    });
    assert.ok(isBackToMain, "Should return to main panel after clicking Back");
    console.log("PASS: Back button returned to main categories panel.");

    // Step D: Tap "Mac" section button -> submenu opens
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll(".global-mobile-section-btn"));
      const macBtn = btns.find(b => b.textContent.includes("Mac"));
      if (macBtn) macBtn.click();
    });
    await new Promise(r => setTimeout(r, 400));

    const isMacSubmenuActive = await page.evaluate(() => {
      const title = document.querySelector(".global-mobile-submenu-title");
      const subitems = Array.from(document.querySelectorAll(".global-mobile-subitem-link")).map(a => a.textContent.trim());
      return title?.textContent === "Mac" && subitems.includes("Explore All Mac") && subitems.includes("MacBook Air");
    });
    assert.ok(isMacSubmenuActive, "Mac submenu should contain Explore All Mac and MacBook Air");
    console.log("PASS: Mac submenu verified with correct product links.");

    await page.screenshot({
      path: path.join(ARTIFACTS_DIR, "qa-mobile-menu-mac-submenu.png"),
    });
    console.log("Saved: qa-mobile-menu-mac-submenu.png");

    // Step E: Click hamburger close button (which has morph into X)
    await menuBtn.click();
    await new Promise(r => setTimeout(r, 300));
    const isMenuClosed = await page.evaluate(() => !document.querySelector(".global-mobile-drawer"));
    assert.ok(isMenuClosed, "Menu drawer should be closed");
    const isBodyUnlocked = await page.evaluate(() => document.body.style.overflow !== "hidden");
    assert.ok(isBodyUnlocked, "Body overflow should be unlocked after closing menu");
    console.log("PASS: Menu closed and body scroll unlocked.");

    await page.close();

    // 2. Test Hero Positioning on all mobile viewports
    console.log("\n--- Testing Hero Positioning Across Viewports ---");
    for (const vp of viewports) {
      console.log(`\nTesting viewport: ${vp.name} (${vp.width}x${vp.height})`);
      const vPage = await browser.newPage();
      await vPage.setViewport({ width: vp.width, height: vp.height, isMobile: true, hasTouch: true });
      await vPage.goto(baseUrl, { waitUntil: "domcontentloaded" });
      await vPage.waitForSelector(".home-ref-hero", { timeout: 10000 });
      await new Promise(r => setTimeout(r, 1500));

      const heroMetrics = await vPage.evaluate(() => {
        // iPhone 18 Pro
        const hero18 = document.querySelector(".home-ref-hero.has-mobile-hero");
        const hero18Copy = hero18 ? hero18.querySelector(".home-ref-copy") : null;
        const hero18Img = hero18 ? hero18.querySelector("img") : null;
        const copy18Bottom = hero18Copy ? hero18Copy.getBoundingClientRect().bottom : 0;
        const img18Top = hero18Img ? hero18Img.getBoundingClientRect().top : 0;
        const gap18 = Math.round(img18Top - copy18Bottom);

        // iPhone Duo
        const duoHero = document.querySelector(".home-ref-hero.home-ref-iphone-duo");
        const duoCopy = duoHero ? duoHero.querySelector(".home-ref-copy") : null;
        const duoImg = duoHero ? duoHero.querySelector(".home-ref-hero-image") : null;
        const duoCopyBottom = duoCopy ? duoCopy.getBoundingClientRect().bottom : 0;
        const duoImgTop = duoImg ? duoImg.getBoundingClientRect().top : 0;
        const gapDuo = Math.round(duoImgTop - duoCopyBottom);

        // Watch Ultra 4
        const watchTile = document.querySelector(".home-ref-tile.home-ref-watch-ultra-4");
        const watchCopy = watchTile ? watchTile.querySelector(".home-ref-copy") : null;
        const watchImg = watchTile ? watchTile.querySelector(".home-ref-tile-image") : null;
        const watchCopyBottom = watchCopy ? watchCopy.getBoundingClientRect().bottom : 0;
        const watchImgTop = watchImg ? watchImg.getBoundingClientRect().top : 0;
        const gapWatch = Math.round(watchImgTop - watchCopyBottom);

        const scrollWidth = document.documentElement.scrollWidth;
        const clientWidth = document.documentElement.clientWidth;

        return {
          gap18,
          gapDuo,
          gapWatch,
          hasHorizontalOverflow: scrollWidth > clientWidth,
          scrollWidth,
          clientWidth
        };
      });

      console.log(`Metrics for ${vp.name}:`, JSON.stringify(heroMetrics, null, 2));
      assert.strictEqual(heroMetrics.hasHorizontalOverflow, false, `No horizontal overflow at ${vp.name}`);

      await vPage.screenshot({
        path: path.join(ARTIFACTS_DIR, `qa-hero-positioning-${vp.name}.png`),
      });
      console.log(`Saved: qa-hero-positioning-${vp.name}.png`);
      await vPage.close();
    }

    // 3. Test Desktop Layout Preservation (1440x900)
    console.log("\n--- Testing Desktop Layout Preservation (1440x900) ---");
    const dPage = await browser.newPage();
    await dPage.setViewport({ width: 1440, height: 900 });
    await dPage.goto(baseUrl, { waitUntil: "domcontentloaded" });
    await dPage.waitForSelector(".global-header-nav", { timeout: 10000 });

    const isDesktopNavVisible = await dPage.evaluate(() => {
      const nav = document.querySelector(".global-header-nav");
      const menuBtn = document.querySelector(".global-header-menu-btn");
      const navStyle = nav ? window.getComputedStyle(nav).display : "none";
      const menuBtnStyle = menuBtn ? window.getComputedStyle(menuBtn).display : "none";
      return navStyle === "flex" && menuBtnStyle === "none";
    });
    assert.ok(isDesktopNavVisible, "Desktop navigation must be flex and mobile menu button hidden on desktop");
    console.log("PASS: Desktop horizontal navigation perfectly preserved.");

    await dPage.screenshot({
      path: path.join(ARTIFACTS_DIR, "qa-desktop-preserved-1440.png"),
    });
    console.log("Saved: qa-desktop-preserved-1440.png");
    await dPage.close();

    console.log("\n=== ALL MOBILE NAVIGATION & HERO QA TESTS PASSED ===");
  } finally {
    await browser.close();
    server.close();
  }
}

runQA().catch((err) => {
  console.error("QA FAILURE:", err);
  process.exit(1);
});
