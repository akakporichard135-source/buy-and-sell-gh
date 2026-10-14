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

function createStaticServer(port = 4230) {
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
  console.log("=== STARTING AIRPODS PRO 3 MOBILE LAYOUT QA ===");
  const server = await createStaticServer(4230);
  const baseUrl = "http://localhost:4230";

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

    for (const vp of viewports) {
      console.log(`\n--- Testing Viewport: ${vp.name} (${vp.width}x${vp.height}) ---`);
      const page = await browser.newPage();
      await page.setViewport({ width: vp.width, height: vp.height, isMobile: true, hasTouch: true });
      await page.goto(baseUrl, { waitUntil: "domcontentloaded" });
      await page.waitForSelector(".home-ref-airpods-pro-3", { timeout: 10000 });
      await new Promise((r) => setTimeout(r, 1000));

      // Scroll into view
      await page.evaluate(() => {
        const el = document.querySelector(".home-ref-airpods-pro-3");
        if (el) el.scrollIntoView({ block: "center" });
      });
      await new Promise((r) => setTimeout(r, 800));

      const metrics = await page.evaluate(() => {
        const tile = document.querySelector(".home-ref-airpods-pro-3");
        const heading = tile ? tile.querySelector("h2") : null;
        const subtitle = tile ? tile.querySelector("p") : null;
        const actions = tile ? tile.querySelector(".home-ref-actions") : null;
        const img = tile ? tile.querySelector(".home-ref-tile-image") : null;

        const tileBox = tile ? tile.getBoundingClientRect() : null;
        const headingBox = heading ? heading.getBoundingClientRect() : null;
        const subtitleBox = subtitle ? subtitle.getBoundingClientRect() : null;
        const actionsBox = actions ? actions.getBoundingClientRect() : null;
        const imgBox = img ? img.getBoundingClientRect() : null;

        // Check vertical sequence
        const headingAboveSubtitle = headingBox && subtitleBox ? headingBox.bottom <= subtitleBox.top + 2 : false;
        const subtitleAboveActions = subtitleBox && actionsBox ? subtitleBox.bottom <= actionsBox.top + 4 : false;
        const actionsAboveImg = actionsBox && imgBox ? actionsBox.bottom <= imgBox.top + 2 : false;

        // Check horizontal centering
        const headingCenterX = headingBox ? headingBox.left + headingBox.width / 2 : 0;
        const actionsCenterX = actionsBox ? actionsBox.left + actionsBox.width / 2 : 0;
        const imgCenterX = imgBox ? imgBox.left + imgBox.width / 2 : 0;
        const tileCenterX = tileBox ? tileBox.left + tileBox.width / 2 : 0;

        return {
          headingText: heading ? heading.textContent : null,
          subtitleText: subtitle ? subtitle.textContent : null,
          headingAboveSubtitle,
          subtitleAboveActions,
          actionsAboveImg,
          gapBetweenActionsAndImg: actionsBox && imgBox ? Math.round(imgBox.top - actionsBox.bottom) : null,
          imgSize: imgBox ? { width: Math.round(imgBox.width), height: Math.round(imgBox.height) } : null,
          imgComplete: img ? img.complete : false,
          imgNaturalWidth: img ? img.naturalWidth : 0,
          tileCenterX: Math.round(tileCenterX),
          headingCenterX: Math.round(headingCenterX),
          actionsCenterX: Math.round(actionsCenterX),
          imgCenterX: Math.round(imgCenterX),
          imgCentered: imgBox && tileBox ? Math.abs(imgCenterX - tileCenterX) <= 2 : false,
        };
      });

      console.log(`Metrics for ${vp.name}:`, JSON.stringify(metrics, null, 2));

      // Assertions
      assert.strictEqual(metrics.headingText, "AirPods Pro 3", "Heading must be AirPods Pro 3");
      assert.strictEqual(metrics.headingAboveSubtitle, true, "Heading must be above subtitle");
      assert.strictEqual(metrics.subtitleAboveActions, true, "Subtitle must be above actions");
      assert.strictEqual(metrics.actionsAboveImg, true, "Actions must be above image");
      assert.strictEqual(metrics.imgCentered, true, "Image must be horizontally centered");
      assert.ok(metrics.gapBetweenActionsAndImg >= 0 && metrics.gapBetweenActionsAndImg <= 30, "Whitespace between actions and image must be tight and balanced");
      assert.ok(metrics.imgSize.width > 150 && metrics.imgSize.height > 150, "Image must be large and prominent");

      const screenshotPath = path.join(ARTIFACTS_DIR, `qa-airpods-pro-3-${vp.name}.png`);
      await page.screenshot({ path: screenshotPath });
      console.log(`Saved: ${screenshotPath}`);
      await page.close();
    }

    // Test Desktop Layout Preservation (1440x900)
    console.log("\n--- Testing Desktop Layout Preservation (1440x900) ---");
    const dPage = await browser.newPage();
    await dPage.setViewport({ width: 1440, height: 900 });
    await dPage.goto(baseUrl, { waitUntil: "domcontentloaded" });
    await dPage.waitForSelector(".home-ref-airpods-pro-3", { timeout: 10000 });
    await new Promise((r) => setTimeout(r, 1000));

    await dPage.evaluate(() => {
      const el = document.querySelector(".home-ref-airpods-pro-3");
      if (el) el.scrollIntoView({ block: "center" });
    });
    await new Promise((r) => setTimeout(r, 600));

    const dMetrics = await dPage.evaluate(() => {
      const tile = document.querySelector(".home-ref-airpods-pro-3");
      const copy = tile ? tile.querySelector(".home-ref-copy") : null;
      const img = tile ? tile.querySelector(".home-ref-tile-image") : null;
      const copyBox = copy ? copy.getBoundingClientRect() : null;
      const imgBox = img ? img.getBoundingClientRect() : null;
      // On desktop, copy has copy-bottom placement so copy is at the bottom
      return {
        copyBottom: copyBox ? copyBox.bottom : null,
        imgTop: imgBox ? imgBox.top : null,
        copyIsAtBottom: copyBox && imgBox ? copyBox.top > imgBox.top : false,
      };
    });

    console.log("Desktop metrics:", JSON.stringify(dMetrics, null, 2));
    assert.strictEqual(dMetrics.copyIsAtBottom, true, "Desktop layout must preserve copy-bottom layout");
    console.log("PASS: Desktop layout preserved.");

    const dScreenshotPath = path.join(ARTIFACTS_DIR, "qa-airpods-pro-3-desktop-1440.png");
    await dPage.screenshot({ path: dScreenshotPath });
    console.log(`Saved: ${dScreenshotPath}`);
    await dPage.close();

    console.log("\n=== ALL AIRPODS PRO 3 QA TESTS PASSED ===");
  } finally {
    await browser.close();
    server.close();
  }
}

runQA().catch((err) => {
  console.error("QA FAILURE:", err);
  process.exit(1);
});
