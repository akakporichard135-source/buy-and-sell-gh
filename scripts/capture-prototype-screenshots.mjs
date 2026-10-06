import puppeteer from "puppeteer-core";
import path from "node:path";
import fs from "node:fs";
import os from "node:os";

const EDGE_PATH = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const BASE_URL = "http://127.0.0.1:4173";
const ARTIFACT_DIR = "C:\\Users\\akakp\\.gemini\\antigravity\\brain\\6c721dee-7d06-4a2d-92fb-b74a2b38f58f";

const viewports = [
  { name: "desktop", width: 1440, height: 900, deviceScaleFactor: 2 },
  { name: "tablet", width: 820, height: 1180, deviceScaleFactor: 2 },
  { name: "mobile", width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
];

const targets = [
  { route: "/", name: "homepage-hero", selector: ".iphone18-launch-hero" },
  { route: "/iphone/iphone-18-pro", name: "learn-more-full", fullPage: true },
  { route: "/iphone/iphone-18-pro", name: "learn-more-hero", selector: ".editorial-hero" },
  { route: "/shop/buy-iphone/iphone-18-pro", name: "buy-configurator", selector: ".apple-buy-root" },
];

const prefix = process.argv[2] || "before";

async function run() {
  console.log(`=== CAPTURING ${prefix.toUpperCase()} SCREENSHOTS ===`);
  const tempDir = path.join(os.tmpdir(), `edge_profile_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`);
  fs.mkdirSync(tempDir, { recursive: true });

  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: true,
    pipe: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-gpu",
      "--no-first-run",
      "--no-default-browser-check",
    ],
  });

  try {
    for (const vp of viewports) {
      console.log(`\n--- Viewport: ${vp.name} (${vp.width}x${vp.height}) ---`);
      const page = await browser.newPage();
      await page.setViewport(vp);

      for (const t of targets) {
        const url = `${BASE_URL}${t.route}`;
        console.log(`Navigating to ${url}...`);
        await page.goto(url, { waitUntil: "domcontentloaded", timeout: 20000 });
        await new Promise((r) => setTimeout(r, 2500));

        const filename = `${prefix}-${t.name}-${vp.name}.png`;
        const filepath = path.join(ARTIFACT_DIR, filename);

        if (t.selector) {
          const el = await page.$(t.selector);
          if (el) {
            await el.screenshot({ path: filepath });
            console.log(`  ✓ Saved element: ${filename}`);
          } else {
            console.warn(`  ! Selector not found: ${t.selector}, taking viewport screenshot`);
            await page.screenshot({ path: filepath, fullPage: false });
            console.log(`  ✓ Saved viewport: ${filename}`);
          }
        } else if (t.fullPage) {
          await page.evaluate(async () => {
            const distance = 500;
            const delay = 80;
            while (document.scrollingElement.scrollTop + window.innerHeight < document.scrollingElement.scrollHeight) {
              document.scrollingElement.scrollBy(0, distance);
              await new Promise((resolve) => setTimeout(resolve, delay));
            }
            const imgs = Array.from(document.querySelectorAll("img"));
            await Promise.all(imgs.map((img) => img.complete ? Promise.resolve() : new Promise((r) => { img.onload = r; img.onerror = r; })));
            window.scrollTo(0, 0);
          });
          await new Promise((r) => setTimeout(r, 1200));
          await page.screenshot({ path: filepath, fullPage: true });
          console.log(`  ✓ Saved fullpage: ${filename}`);
        } else {
          await page.screenshot({ path: filepath, fullPage: false });
          console.log(`  ✓ Saved viewport: ${filename}`);
        }
      }
      await page.close();
    }
    console.log(`\n=== COMPLETED ${prefix.toUpperCase()} CAPTURES ===`);
  } finally {
    await browser.close();
  }
}

run().catch((err) => {
  console.error("Capture failed:", err);
  process.exit(1);
});
