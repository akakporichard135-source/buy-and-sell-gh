import puppeteer from "puppeteer-core";
import fs from "node:fs/promises";
import path from "node:path";

const EDGE_PATH = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const ARTIFACTS_DIR = "C:\\Users\\akakp\\.gemini\\antigravity\\brain\\6c721dee-7d06-4a2d-92fb-b74a2b38f58f";
const PROD_STOREFRONT = "https://buyandsellgh.com";
const PROD_ADMIN = "https://admin.buyandsellgh.com";

async function run() {
  console.log("=== STARTING LIVE PRODUCTION VERIFICATION ===");
  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"]
  });

  const viewports = [
    { name: "320px", width: 320, height: 650, isMobile: true },
    { name: "375px", width: 375, height: 667, isMobile: true },
    { name: "390px", width: 390, height: 844, isMobile: true },
    { name: "430px", width: 430, height: 932, isMobile: true },
    { name: "1440px", width: 1440, height: 900, isMobile: false },
  ];

  // Test 1: Storefront Homepage Heroes
  for (const vp of viewports) {
    const page = await browser.newPage();
    await page.setViewport({ width: vp.width, height: vp.height, isMobile: vp.isMobile, hasTouch: vp.isMobile });
    if (vp.isMobile) {
      await page.setUserAgent("Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1");
    }

    // Cache bust query to ensure we see the live edge response
    await page.goto(`${PROD_STOREFRONT}?_ts=${Date.now()}`, { waitUntil: "domcontentloaded", timeout: 60000 });
    await new Promise((r) => setTimeout(r, 2000));

    console.log(`\n--- Storefront Viewport ${vp.name} ---`);

    // AirPods Pro 3 Hero
    const airpodsMetrics = await page.evaluate(() => {
      const el = document.querySelector(".home-ref-airpods-pro-3");
      if (!el) return null;
      const title = el.querySelector(".home-ref-copy h2, .home-ref-copy h1, h2");
      const actions = el.querySelector(".home-ref-actions");
      const img = el.querySelector(".home-ref-tile-image, img");
      const titleBox = title?.getBoundingClientRect();
      const actionsBox = actions?.getBoundingClientRect();
      const imgBox = img?.getBoundingClientRect();

      return {
        titleTop: titleBox?.top ?? 0,
        actionsTop: actionsBox?.top ?? 0,
        imgTop: imgBox?.top ?? 0,
        titleText: title?.textContent?.trim(),
        imgSrc: img?.src,
        imgLoaded: img?.complete && img?.naturalWidth > 0
      };
    });

    if (airpodsMetrics) {
      console.log(`AirPods Pro 3 layout:
  Title: "${airpodsMetrics.titleText}" (top: ${Math.round(airpodsMetrics.titleTop)})
  Actions (top: ${Math.round(airpodsMetrics.actionsTop)})
  Image (top: ${Math.round(airpodsMetrics.imgTop)}, loaded: ${airpodsMetrics.imgLoaded})`);

      if (airpodsMetrics.actionsTop < airpodsMetrics.imgTop) {
        console.log(`  PASS: Actions appear above image! Gap = ${Math.round(airpodsMetrics.imgTop - airpodsMetrics.actionsTop)}px`);
      } else {
        console.warn(`  WARNING: Image top (${airpodsMetrics.imgTop}) is not below actions (${airpodsMetrics.actionsTop})`);
      }

      if (vp.name === "390px") {
        const airpodsHandle = await page.$(".home-ref-airpods-pro-3");
        if (airpodsHandle) {
          await airpodsHandle.screenshot({ path: path.join(ARTIFACTS_DIR, "live-final-airpods-pro-3-390px.png") });
          console.log("  Saved screenshot: live-final-airpods-pro-3-390px.png");
        }
      }
      if (vp.name === "1440px") {
        const airpodsHandle = await page.$(".home-ref-airpods-pro-3");
        if (airpodsHandle) {
          await airpodsHandle.screenshot({ path: path.join(ARTIFACTS_DIR, "live-final-airpods-pro-3-desktop-1440px.png") });
          console.log("  Saved screenshot: live-final-airpods-pro-3-desktop-1440px.png");
        }
      }
    }

    // Capture mobile full heroes screenshot at 390px
    if (vp.name === "390px") {
      // iPhone 18 Pro
      const iphoneHero = await page.$(".home-ref-iphone-18-pro");
      if (iphoneHero) {
        await iphoneHero.screenshot({ path: path.join(ARTIFACTS_DIR, "live-final-iphone-18-pro-390px.png") });
        console.log("  Saved screenshot: live-final-iphone-18-pro-390px.png");
      }

      // iPhone Duo
      const duoSection = await page.$(".home-ref-iphone-duo");
      if (duoSection) {
        await duoSection.screenshot({ path: path.join(ARTIFACTS_DIR, "live-final-iphone-duo-390px.png") });
        console.log("  Saved screenshot: live-final-iphone-duo-390px.png");
      }

      // Watch Ultra 4
      const watchSection = await page.$(".home-ref-watch-ultra-4");
      if (watchSection) {
        await watchSection.screenshot({ path: path.join(ARTIFACTS_DIR, "live-final-watch-ultra-390px.png") });
        console.log("  Saved screenshot: live-final-watch-ultra-390px.png");
      }
    }

    await page.close();
  }

  // Test 2: Learn More Pages
  console.log("\n--- Checking Live Learn More Pages ---");
  const storyPage = await browser.newPage();
  await storyPage.setViewport({ width: 1440, height: 900 });

  // iPhone 18 Pro story
  await storyPage.goto(`${PROD_STOREFRONT}/iphone/iphone-18-pro?_ts=${Date.now()}`, { waitUntil: "domcontentloaded", timeout: 60000 });
  await storyPage.waitForSelector(".editorial-story, h1", { timeout: 20000 });
  await new Promise((r) => setTimeout(r, 2000));
  const storyInfo = await storyPage.evaluate(() => {
    const h1 = document.querySelector("h1")?.textContent?.trim();
    const imgs = Array.from(document.querySelectorAll("img"));
    const broken = imgs.filter(img => !img.complete || img.naturalWidth === 0);
    return { h1, count: imgs.length, broken: broken.length };
  });
  console.log(`Story /iphone/iphone-18-pro: H1 = "${storyInfo.h1}", Images = ${storyInfo.count}, Broken = ${storyInfo.broken}`);
  await storyPage.screenshot({ path: path.join(ARTIFACTS_DIR, "live-final-story-iphone-18-pro.png") });

  // Mac Studio story
  await storyPage.goto(`${PROD_STOREFRONT}/mac-studio?_ts=${Date.now()}`, { waitUntil: "domcontentloaded", timeout: 60000 });
  await storyPage.waitForSelector("h1", { timeout: 20000 });
  await new Promise((r) => setTimeout(r, 2000));
  const macInfo = await storyPage.evaluate(() => {
    const h1 = document.querySelector("h1")?.textContent?.trim();
    const imgs = Array.from(document.querySelectorAll("img"));
    const broken = imgs.filter(img => !img.complete || img.naturalWidth === 0);
    return { h1, count: imgs.length, broken: broken.length };
  });
  console.log(`Story /mac-studio: H1 = "${macInfo.h1}", Images = ${macInfo.count}, Broken = ${macInfo.broken}`);
  await storyPage.screenshot({ path: path.join(ARTIFACTS_DIR, "live-final-story-mac-studio.png") });

  // Test 3: Admin Redirection & Sidebar
  console.log("\n--- Checking Live Admin Portal ---");
  const adminPage = await browser.newPage();
  await adminPage.setViewport({ width: 1440, height: 900 });
  
  // Test redirect to login or products when hitting /admin/pricing
  await adminPage.goto(`${PROD_ADMIN}/admin/pricing?_ts=${Date.now()}`, { waitUntil: "domcontentloaded", timeout: 60000 });
  await new Promise((r) => setTimeout(r, 3000));
  const redirectedUrl = adminPage.url();
  console.log(`Navigating to ${PROD_ADMIN}/admin/pricing redirected to: ${redirectedUrl}`);

  // Test admin login page loads cleanly
  await adminPage.screenshot({ path: path.join(ARTIFACTS_DIR, "live-final-admin-login.png") });

  await adminPage.close();
  await storyPage.close();
  await browser.close();

  console.log("\n=== ALL LIVE PRODUCTION VERIFICATIONS COMPLETED ===");
}

run().catch((err) => {
  console.error("Live QA verification error:", err);
  process.exit(1);
});
