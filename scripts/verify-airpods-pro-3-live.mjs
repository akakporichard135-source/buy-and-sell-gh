import puppeteer from "puppeteer-core";
import fs from "node:fs";
import path from "node:path";

const EDGE_PATH = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const ARTIFACT_DIR = "C:\\Users\\akakp\\.gemini\\antigravity\\brain\\6c721dee-7d06-4a2d-92fb-b74a2b38f58f";
const LIVE_URL = "https://buyandsellgh.com";

async function runLiveVerification() {
  console.log(`Starting live post-deploy verification on ${LIVE_URL}...`);
  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const viewports = [
    { name: "320px", width: 320, height: 640 },
    { name: "375px", width: 375, height: 667 },
    { name: "390px", width: 390, height: 844 },
    { name: "430px", width: 430, height: 932 },
  ];

  try {
    for (const vp of viewports) {
      const page = await browser.newPage();
      await page.setUserAgent("Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1");
      await page.setViewport({ width: vp.width, height: vp.height, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });

      await page.goto(`${LIVE_URL}?_nocache=${Date.now()}`, { waitUntil: "networkidle2", timeout: 45000 });

      const tileSelector = ".home-ref-tile.home-ref-airpods-pro-3";
      await page.waitForSelector(tileSelector, { timeout: 15000 });

      // Scroll to tile
      await page.evaluate((sel) => {
        const el = document.querySelector(sel);
        if (el) el.scrollIntoView({ block: "center" });
      }, tileSelector);

      await new Promise((r) => setTimeout(r, 1200));

      const layoutData = await page.evaluate(() => {
        const tileEl = document.querySelector(".home-ref-tile.home-ref-airpods-pro-3");
        if (!tileEl) return null;

        const heading = tileEl.querySelector(".home-ref-copy h2");
        const subtitle = tileEl.querySelector(".home-ref-copy p");
        const actions = tileEl.querySelector(".home-ref-actions");
        const img = tileEl.querySelector(".home-ref-tile-image");

        const tRect = tileEl.getBoundingClientRect();
        const hRect = heading?.getBoundingClientRect();
        const sRect = subtitle?.getBoundingClientRect();
        const aRect = actions?.getBoundingClientRect();
        const iRect = img?.getBoundingClientRect();

        return {
          tile: { width: tRect.width, height: tRect.height },
          heading: hRect ? { top: hRect.top, bottom: hRect.bottom, text: heading.textContent.trim() } : null,
          subtitle: sRect ? { top: sRect.top, bottom: sRect.bottom, text: subtitle.textContent.trim() } : null,
          actions: aRect ? { top: aRect.top, bottom: aRect.bottom } : null,
          image: iRect ? { top: iRect.top, bottom: iRect.bottom, left: iRect.left, right: iRect.right, width: iRect.width, height: iRect.height, naturalWidth: img.naturalWidth, naturalHeight: img.naturalHeight, complete: img.complete } : null,
          imgSrc: img?.currentSrc || img?.src,
        };
      });

      console.log(`\n--- Live Viewport: ${vp.name} (${vp.width}x${vp.height}) ---`);
      console.log("Heading:", layoutData?.heading?.text);
      console.log("Subtitle:", layoutData?.subtitle?.text);

      const headingAboveSubtitle = layoutData.heading.bottom <= layoutData.subtitle.top + 2;
      const subtitleAboveActions = layoutData.subtitle.bottom <= layoutData.actions.top + 2;
      const actionsAboveImg = layoutData.actions.bottom <= layoutData.image.top + 2;
      const gapActionsToImg = Math.round(layoutData.image.top - layoutData.actions.bottom);

      console.log(`1. Heading above Subtitle: ${headingAboveSubtitle} (gap: ${Math.round(layoutData.subtitle.top - layoutData.heading.bottom)}px)`);
      console.log(`2. Subtitle above Actions: ${subtitleAboveActions} (gap: ${Math.round(layoutData.actions.top - layoutData.subtitle.bottom)}px)`);
      console.log(`3. Actions above Image: ${actionsAboveImg} (gap: ${gapActionsToImg}px)`);
      console.log(`4. Image loaded and uncropped: complete=${layoutData.image.complete}, naturalSize=${layoutData.image.naturalWidth}x${layoutData.image.naturalHeight}`);

      const tileHandle = await page.$(tileSelector);
      const screenshotPath = path.join(ARTIFACT_DIR, `live-prod-airpods-pro-3-${vp.name}.png`);
      await tileHandle.screenshot({ path: screenshotPath });
      console.log(`Saved screenshot: ${screenshotPath}`);

      await page.close();
    }

    // Desktop verification (1440x900)
    const deskPage = await browser.newPage();
    await deskPage.setViewport({ width: 1440, height: 900 });
    await deskPage.goto(`${LIVE_URL}?_nocache=${Date.now()}`, { waitUntil: "networkidle2", timeout: 45000 });
    const deskSelector = ".home-ref-tile.home-ref-airpods-pro-3";
    await deskPage.waitForSelector(deskSelector, { timeout: 15000 });

    await deskPage.evaluate((sel) => {
      const el = document.querySelector(sel);
      if (el) el.scrollIntoView({ block: "center" });
    }, deskSelector);

    await new Promise((r) => setTimeout(r, 1200));

    const deskLayout = await deskPage.evaluate(() => {
      const tileEl = document.querySelector(".home-ref-tile.home-ref-airpods-pro-3");
      const copy = tileEl?.querySelector(".home-ref-copy");
      const img = tileEl?.querySelector(".home-ref-tile-image");
      const tRect = tileEl?.getBoundingClientRect();
      const cRect = copy?.getBoundingClientRect();
      const iRect = img?.getBoundingClientRect();
      return {
        copyBottomOffset: Math.round(tRect.bottom - cRect.bottom),
        copyTopOffset: Math.round(cRect.top - tRect.top),
        imgTopOffset: Math.round(iRect.top - tRect.top),
        isCopyAtBottom: (tRect.bottom - cRect.bottom) < 50,
      };
    });

    console.log("\n--- Live Desktop Check (1440x900) ---");
    console.log(`Desktop copy is at bottom: ${deskLayout.isCopyAtBottom} (copy bottom offset: ${deskLayout.copyBottomOffset}px)`);

    const deskTileHandle = await deskPage.$(deskSelector);
    const deskScreenshotPath = path.join(ARTIFACT_DIR, "live-prod-airpods-pro-3-desktop-1440.png");
    await deskTileHandle.screenshot({ path: deskScreenshotPath });
    console.log(`Saved live desktop screenshot: ${deskScreenshotPath}`);
    await deskPage.close();

  } finally {
    await browser.close();
  }

  console.log("\nLive verification finished successfully!");
}

runLiveVerification().catch((err) => {
  console.error("Live verification error:", err);
  process.exit(1);
});
