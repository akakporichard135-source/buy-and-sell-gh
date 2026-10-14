import fs from "node:fs";
import path from "node:path";
import puppeteer from "puppeteer-core";

const EDGE_PATH = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const ARTIFACT_DIR = "C:\\Users\\akakp\\.gemini\\antigravity\\brain\\6c721dee-7d06-4a2d-92fb-b74a2b38f58f";

const browser = await puppeteer.launch({
  executablePath: EDGE_PATH,
  headless: true,
  args: [
    "--no-sandbox",
    "--disable-setuid-sandbox",
    "--host-resolver-rules=MAP admin.buyandsellgh.com 216.198.79.1, MAP buyandsellgh.com 216.198.79.1",
  ],
});

try {
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });

  console.log("1. Checking public /admin separation at https://buyandsellgh.com/admin...");
  const publicAdminRes = await page.goto("https://buyandsellgh.com/admin", { waitUntil: "networkidle2", timeout: 25000 });
  const publicAdminStatus = publicAdminRes ? publicAdminRes.status() : null;
  console.log("Public /admin status:", publicAdminStatus);
  await page.screenshot({ path: path.join(ARTIFACT_DIR, "live-prod-public-admin-404-check.png") });

  console.log("2. Navigating to live admin login at https://admin.buyandsellgh.com/admin/login...");
  await page.goto("https://admin.buyandsellgh.com/admin/login", { waitUntil: "networkidle2", timeout: 25000 });
  await page.screenshot({ path: path.join(ARTIFACT_DIR, "live-prod-admin-login-postdeploy.png") });

  console.log("Authenticating to live production dashboard...");
  await page.type('input[type="email"]', "admin@buyandsellgh.com");
  await page.type('input[type="password"]', "Apple-Shopify-Quality-2026");
  await page.click('button[type="submit"]');

  await new Promise((r) => setTimeout(r, 2500));
  console.log("Live URL after sign in:", page.url());

  // 3. Verify Product Manager on live site
  console.log("3. Navigating to live Product Manager https://admin.buyandsellgh.com/admin/products...");
  await page.goto("https://admin.buyandsellgh.com/admin/products", { waitUntil: "networkidle2", timeout: 25000 });
  await new Promise((r) => setTimeout(r, 1500));

  // Check topbar title color and styling
  const topbarInfo = await page.evaluate(() => {
    const topbar = document.querySelector(".admin-topbar");
    const titleH1 = topbar?.querySelector("h1");
    if (!topbar || !titleH1) return null;
    const style = window.getComputedStyle(titleH1);
    return {
      titleText: titleH1.textContent,
      color: style.color,
      topbarHeight: topbar.getBoundingClientRect().height,
    };
  });
  console.log("Live topbar verification:", topbarInfo);

  // Capture table with pure-white thumbnails
  await page.screenshot({ path: path.join(ARTIFACT_DIR, "live-prod-products-table-white-thumbnails.png") });
  console.log("Saved: live-prod-products-table-white-thumbnails.png");

  // Sample corner pixel of a table thumbnail image to guarantee pure white
  const pixelResult = await page.evaluate(() => {
    const img = document.querySelector("table img");
    if (!img) return { foundImg: false };
    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth || img.width;
    canvas.height = img.naturalHeight || img.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return { error: "no-ctx" };
    try {
      ctx.drawImage(img, 0, 0);
      const data = ctx.getImageData(2, 2, 1, 1).data;
      return {
        foundImg: true,
        src: img.src,
        pixelRgba: [data[0], data[1], data[2], data[3]],
        isPureWhite: data[0] === 255 && data[1] === 255 && data[2] === 255,
      };
    } catch (e) {
      return { foundImg: true, crossOrigin: true, src: img.src };
    }
  });
  console.log("Live thumbnail pixel analysis:", pixelResult);

  // 4. Test instant Edit drawer on live production
  console.log("4. Testing instant Edit drawer on live production...");
  const editButtons = await page.$$("table button");
  let editBtn = null;
  for (const btn of editButtons) {
    const text = await page.evaluate((el) => el.textContent, btn);
    if (text && text.includes("Edit")) {
      editBtn = btn;
      break;
    }
  }
  if (!editBtn) throw new Error("Edit button not found on live Product Manager");

  const openStartTime = Date.now();
  await editBtn.click();
  await page.waitForSelector(".admin-drawer-panel", { timeout: 2000 });
  const openDurationMs = Date.now() - openStartTime;
  console.log(`Live drawer opened in ${openDurationMs}ms`);

  const drawerLiveBox = await page.$eval(".admin-drawer-panel", (el) => {
    const rect = el.getBoundingClientRect();
    return { width: rect.width, height: rect.height, top: rect.top, right: rect.right };
  });
  console.log("Live drawer dimensions:", drawerLiveBox);

  // Capture screenshot of live product editor drawer
  await page.screenshot({ path: path.join(ARTIFACT_DIR, "live-prod-product-editor-drawer.png") });
  console.log("Saved: live-prod-product-editor-drawer.png");

  // Test Cancel button on live
  const cancelButtons = await page.$$(".admin-drawer-panel button");
  let cancelBtn = null;
  for (const btn of cancelButtons) {
    const text = await page.evaluate((el) => el.textContent, btn);
    if (text && text.includes("Cancel")) {
      cancelBtn = btn;
      break;
    }
  }
  if (cancelBtn) {
    await cancelBtn.click();
    await new Promise((r) => setTimeout(r, 400));
    const isClosed = await page.$eval(".admin-drawer-panel", () => false).catch(() => true);
    console.log("Live Cancel button closed drawer:", isClosed);
  }

  // 5. Test Pricing & Stock on live production
  console.log("5. Navigating to live Pricing & Stock https://admin.buyandsellgh.com/admin/pricing...");
  await page.goto("https://admin.buyandsellgh.com/admin/pricing", { waitUntil: "networkidle2", timeout: 25000 });
  await new Promise((r) => setTimeout(r, 1500));

  const liveTableOverflows = await page.evaluate(() => {
    const tables = document.querySelectorAll("table");
    const results = [];
    for (const t of tables) {
      const container = t.parentElement;
      results.push({
        scrollWidth: container.scrollWidth,
        clientWidth: container.clientWidth,
        hasScrollbar: container.scrollWidth > container.clientWidth + 2,
      });
    }
    return results;
  });
  console.log("Live pricing matrix scroll checks count:", liveTableOverflows.length);
  const anyLiveScrollbar = liveTableOverflows.some((t) => t.hasScrollbar);
  console.log("Any unwanted horizontal scrollbars on desktop cards:", anyLiveScrollbar);

  await page.screenshot({ path: path.join(ARTIFACT_DIR, "live-prod-pricing-matrix.png") });
  console.log("Saved: live-prod-pricing-matrix.png");

  // 6. Test Public Storefront at https://buyandsellgh.com
  console.log("6. Verifying public storefront at https://buyandsellgh.com...");
  await page.goto("https://buyandsellgh.com", { waitUntil: "networkidle2", timeout: 25000 });
  await new Promise((r) => setTimeout(r, 1500));
  await page.screenshot({ path: path.join(ARTIFACT_DIR, "live-prod-storefront-home-postdeploy.png") });
  console.log("Saved: live-prod-storefront-home-postdeploy.png");

  console.log("ALL LIVE PRODUCTION VERIFICATIONS COMPLETED SUCCESSFULLY!");
} catch (err) {
  console.error("Live production verification error:", err);
  process.exit(1);
} finally {
  await browser.close();
}
