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

function createStaticServer(port = 4220) {
  const server = http.createServer((req, res) => {
    let reqPath = req.url.split("?")[0];
    let filePath = path.join(DIST_DIR, reqPath);

    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      const ext = path.extname(filePath);
      res.writeHead(200, { "Content-Type": mimeTypes[ext] || "application/octet-stream" });
      fs.createReadStream(filePath).pipe(res);
      return;
    }

    const indexPath = path.join(DIST_DIR, "index.html");
    res.writeHead(200, { "Content-Type": "text/html" });
    fs.createReadStream(indexPath).pipe(res);
  });

  return new Promise((resolve) => {
    server.listen(port, "127.0.0.1", () => resolve(server));
  });
}

async function run() {
  console.log("=== MOBILE HOMEPAGE REDESIGN MULTI-RESOLUTION QA ===");
  const server = await createStaticServer(4220);
  console.log("Local Server listening on http://localhost:4220 and http://admin.localhost:4220");

  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-gpu"],
  });

  try {
    const page = await browser.newPage();

    const viewports = [
      { name: "320px", width: 320, height: 640 },
      { name: "375px", width: 375, height: 812 },
      { name: "390px", width: 390, height: 844 },
      { name: "430px", width: 430, height: 932 },
      { name: "tablet", width: 768, height: 1024 },
      { name: "desktop", width: 1440, height: 900 },
    ];

    for (const vp of viewports) {
      console.log(`\nTesting viewport: ${vp.name} (${vp.width}x${vp.height})...`);
      await page.setViewport({
        width: vp.width,
        height: vp.height,
        isMobile: vp.width < 1024,
        hasTouch: vp.width < 1024,
      });
      await page.goto("http://localhost:4220/", { waitUntil: "domcontentloaded", timeout: 20000 });
      await new Promise((r) => setTimeout(r, 800));

      // Verify no horizontal overflow
      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
      console.log(`  ScrollWidth: ${scrollWidth}px, ClientWidth: ${clientWidth}px`);
      assert.ok(
        scrollWidth <= clientWidth + 1,
        `No horizontal overflow allowed at ${vp.name}: scrollWidth=${scrollWidth}, clientWidth=${clientWidth}`
      );

      // Verify hero image rendered and source selected
      const heroInfo = await page.evaluate(() => {
        const hero = document.querySelector(".home-ref-iphone-18-pro");
        if (!hero) return null;
        const img = hero.querySelector("img");
        const picture = hero.querySelector("picture");
        const source = picture?.querySelector("source");
        const title = hero.querySelector("h1")?.innerText || "";
        const subtitle = hero.querySelector("p")?.innerText || "";
        const buttons = Array.from(hero.querySelectorAll(".home-ref-button")).map((b) => b.innerText);
        const currentSrc = img?.currentSrc || img?.src || "";
        const hasMobileClass = hero.classList.contains("has-mobile-hero");
        const bounding = img?.getBoundingClientRect();
        return {
          title,
          subtitle,
          buttons,
          currentSrc,
          hasMobileClass,
          imgWidth: bounding?.width,
          imgHeight: bounding?.height,
          sourceMedia: source?.getAttribute("media"),
          sourceSrcSet: source?.getAttribute("srcset"),
        };
      });

      console.log(`  Hero Info:`, {
        title: heroInfo?.title,
        hasMobileClass: heroInfo?.hasMobileClass,
        imgDimensions: `${Math.round(heroInfo?.imgWidth || 0)}x${Math.round(heroInfo?.imgHeight || 0)}`,
        currentSrc: heroInfo?.currentSrc ? path.basename(heroInfo.currentSrc) : "none",
      });

      assert.ok(heroInfo, "iPhone 18 Pro hero must render");
      if (vp.width <= 768) {
        assert.ok(heroInfo.hasMobileClass, "Hero must have has-mobile-hero class on mobile");
        assert.ok(
          heroInfo.sourceSrcSet && heroInfo.sourceSrcSet.includes("iphone-18-promax-1"),
          "Source srcset must point to uploaded mobile hero asset"
        );
      }

      const screenshotName = `mobile-redesign-hero-${vp.name}.png`;
      await page.screenshot({
        path: path.join(ARTIFACTS_DIR, screenshotName),
        fullPage: false,
      });
      console.log(`  ✓ Saved screenshot: ${screenshotName}`);
    }

    // Capture Full Mobile Page at 390px
    console.log("\nCapturing Full Page at 390px...");
    await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
    await page.goto("http://localhost:4220/", { waitUntil: "domcontentloaded", timeout: 20000 });
    await new Promise((r) => setTimeout(r, 1200));

    await page.screenshot({
      path: path.join(ARTIFACTS_DIR, "mobile-redesign-fullpage-390.png"),
      fullPage: true,
    });
    console.log("✓ Saved: mobile-redesign-fullpage-390.png");

    // Test Mobile Menu Navigation
    console.log("\nTesting Mobile Navigation Menu Drawer...");
    const menuBtn = await page.$(".global-header-menu-btn");
    assert.ok(menuBtn, "Mobile menu toggle button must exist");
    await menuBtn.click();
    await new Promise((r) => setTimeout(r, 500));

    const drawerVisible = await page.evaluate(() => {
      const drawer = document.querySelector(".global-mobile-drawer");
      return drawer && drawer.clientHeight > 100;
    });
    console.log(`Mobile drawer visible after tap: ${drawerVisible}`);
    assert.ok(drawerVisible, "Mobile drawer must expand upon tapping menu icon");

    await page.screenshot({
      path: path.join(ARTIFACTS_DIR, "mobile-redesign-menu-drawer.png"),
      fullPage: false,
    });
    console.log("✓ Saved: mobile-redesign-menu-drawer.png");

    // Close menu
    await menuBtn.click();
    await new Promise((r) => setTimeout(r, 400));

    // Admin Dashboard Verification
    console.log("\n[ADMIN CHECK] Testing Admin Homepage Manager...");
    await page.setViewport({ width: 1440, height: 900 });
    await page.goto("http://admin.localhost:4220/admin/login", { waitUntil: "domcontentloaded", timeout: 20000 });
    await page.evaluate(() => {
      localStorage.setItem(
        "buyandsell-gh-temp-admin-session",
        JSON.stringify({
          userId: "local-admin",
          email: "admin@buyandsellgh.com",
          mode: "local",
          role: "owner",
          assuranceLevel: "aal2",
          verifiedTotpFactors: [],
        })
      );
    });

    await page.goto("http://admin.localhost:4220/admin/homepage", { waitUntil: "domcontentloaded", timeout: 20000 });
    await new Promise((r) => setTimeout(r, 2000));

    const adminHeroFields = await page.evaluate(() => {
      const labels = Array.from(document.querySelectorAll("label")).map((l) => l.innerText.trim());
      const hasDesktopHeroField = labels.some((l) => l.includes("Desktop Hero Image"));
      const hasMobileHeroField = labels.some((l) => l.includes("Mobile Hero Image"));
      const pickMobileBtns = Array.from(document.querySelectorAll("button")).filter((b) =>
        b.innerText.includes("Pick Mobile")
      );
      return { hasDesktopHeroField, hasMobileHeroField, pickMobileCount: pickMobileBtns.length };
    });

    console.log("Admin Homepage Manager Fields:", adminHeroFields);
    assert.ok(adminHeroFields.hasDesktopHeroField, "Admin must render Desktop Hero Image field");
    assert.ok(adminHeroFields.hasMobileHeroField, "Admin must render Mobile Hero Image field");
    assert.ok(adminHeroFields.pickMobileCount > 0, "Admin must render Pick Mobile button for hero slides");

    await page.screenshot({
      path: path.join(ARTIFACTS_DIR, "admin-homepage-mobile-hero-fields.png"),
      fullPage: false,
    });
    console.log("✓ Saved: admin-homepage-mobile-hero-fields.png");

    console.log("\n>>> ALL MULTI-RESOLUTION QA AUDITS PASSED 100%! <<<\n");
  } finally {
    await browser.close();
    server.close();
  }
}

run().catch((err) => {
  console.error("QA Test Failed:", err);
  process.exit(1);
});
