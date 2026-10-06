import puppeteer from "puppeteer-core";
import path from "node:path";
import fs from "node:fs";
import os from "node:os";

const EDGE_PATH = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const BASE_URL = "http://127.0.0.1:4173";
const ARTIFACT_DIR = "C:\\Users\\akakp\\.gemini\\antigravity\\brain\\6c721dee-7d06-4a2d-92fb-b74a2b38f58f";

async function run() {
  console.log("=== CAPTURING RESTORATION VERIFICATION SCREENSHOTS ===");
  const tempDir = path.join(os.tmpdir(), `edge_profile_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`);
  fs.mkdirSync(tempDir, { recursive: true });

  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: true,
    pipe: true,
    protocolTimeout: 120000,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-gpu",
      "--no-first-run",
      "--no-default-browser-check",
    ],
  });

  try {
    // 1. Restored Homepage Desktop (1440x900)
    console.log("Capturing restored homepage desktop...");
    const pageDesktop = await browser.newPage();
    await pageDesktop.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
    await pageDesktop.goto(`${BASE_URL}/`, { waitUntil: "networkidle2", timeout: 45000 });
    await new Promise((r) => setTimeout(r, 2000));
    const hpDesktopPath = path.join(ARTIFACT_DIR, "restored-homepage-desktop.png");
    await pageDesktop.screenshot({ path: hpDesktopPath, fullPage: false });
    console.log(`✓ Saved: restored-homepage-desktop.png`);

    // Verify zero videos on homepage
    const homeVideoCount = await pageDesktop.evaluate(() => document.querySelectorAll("video").length);
    console.log(`Homepage video element count: ${homeVideoCount} (Expected: 0)`);
    await pageDesktop.close();

    // 2. Restored Homepage Mobile (390x844)
    console.log("\nCapturing restored homepage mobile...");
    const pageMobile = await browser.newPage();
    await pageMobile.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
    await pageMobile.goto(`${BASE_URL}/`, { waitUntil: "networkidle2", timeout: 45000 });
    await new Promise((r) => setTimeout(r, 2000));
    const hpMobilePath = path.join(ARTIFACT_DIR, "restored-homepage-mobile.png");
    await pageMobile.screenshot({ path: hpMobilePath, fullPage: false });
    console.log(`✓ Saved: restored-homepage-mobile.png`);
    await pageMobile.close();

    // Helper to capture Learn More pages with cinematic sections
    const captureStory = async (route, filename, selector = "#cinematic") => {
      console.log(`\nCapturing ${route} (${filename})...`);
      const page = await browser.newPage();
      await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
      await page.goto(`${BASE_URL}${route}`, { waitUntil: "networkidle2", timeout: 45000 });
      await new Promise((r) => setTimeout(r, 2000));

      // Scroll to cinematic section
      const hasSection = await page.evaluate((sel) => {
        const el = document.querySelector(sel);
        if (el) {
          el.scrollIntoView({ behavior: "instant", block: "center" });
          return true;
        }
        return false;
      }, selector);

      await new Promise((r) => setTimeout(r, 1500));
      const targetPath = path.join(ARTIFACT_DIR, filename);

      if (hasSection) {
        // Screenshot the cinematic section or centered viewport
        const cinematicEl = await page.$(selector);
        if (cinematicEl) {
          await cinematicEl.screenshot({ path: targetPath });
          console.log(`✓ Saved element screenshot: ${filename}`);
        } else {
          await page.screenshot({ path: targetPath, fullPage: false });
          console.log(`✓ Saved viewport screenshot: ${filename}`);
        }
      } else {
        console.warn(`! Selector ${selector} not found on ${route}, taking viewport screenshot`);
        await page.screenshot({ path: targetPath, fullPage: false });
      }

      await page.close();
    };

    // 3. iPhone 18 Pro Learn More with cinematic section
    await captureStory("/iphone/iphone-18-pro", "iphone-18-pro-learn-more-cinematic-desktop.png", "#cinematic");

    // 4. iPhone Duo Learn More with cinematic section
    await captureStory("/iphone/iphone-duo", "iphone-duo-learn-more-desktop.png", "#cinematic");

    // 5. Watch Series 12 Learn More with cinematic section
    await captureStory("/watch/apple-watch-series-12", "watch-series-12-learn-more-desktop.png", "#cinematic");

    // 6. Watch Ultra 4 Learn More with cinematic section
    await captureStory("/watch/apple-watch-ultra-4", "watch-ultra-4-learn-more-desktop.png", "#cinematic");

    console.log("\n=== ALL RESTORATION SCREENSHOTS CAPTURED SUCCESSFULLY ===");
  } finally {
    await browser.close();
    try {
      fs.rmSync(tempDir, { recursive: true, force: true });
    } catch {
      // ignore
    }
  }
}

run().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
