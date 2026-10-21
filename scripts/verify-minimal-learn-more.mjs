import assert from "node:assert/strict";
import { mkdir, mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import puppeteer from "puppeteer-core";

const base = process.env.LEARN_MORE_BASE_URL || "http://127.0.0.1:4174";
const output = path.resolve("qa-previews", "learn-more-rebuild");
const browserPath = process.env.BROWSER_PATH || "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const routes = [
  ["iphone-18-pro", "/iphone/iphone-18-pro", "/shop/buy-iphone/iphone-18-pro", ".minimal-editorial-story", ".minimal-editorial-buy"],
  ["iphone-duo", "/iphone/iphone-duo", "/shop/buy-iphone/iphone-duo", ".minimal-editorial-story", ".minimal-editorial-buy"],
  ["watch-series-12", "/watch/apple-watch-series-12", "/shop/buy-watch/apple-watch-series-12", ".minimal-editorial-story", ".minimal-editorial-buy"],
  ["watch-ultra-4", "/watch/apple-watch-ultra-4", "/shop/buy-watch/apple-watch-ultra-4", ".minimal-editorial-story", ".minimal-editorial-buy"],
  ["airpods-pro-3", "/airpods/airpods-pro-3", "/shop/buy-airpods/airpods-pro-3", ".minimal-editorial-story", ".minimal-editorial-buy"],
  ["airpods-5", "/airpods/airpods-5", "/shop/buy-airpods/airpods-5", ".minimal-editorial-story", ".minimal-editorial-buy"],
  ["macbook-air", "/mac/macbook-air", "/shop/buy-mac/macbook-air", ".minimal-editorial-story", ".minimal-editorial-buy"],
  ["macbook-pro", "/mac/macbook-pro", "/shop/buy-mac/macbook-pro", ".minimal-editorial-story", ".minimal-editorial-buy"],
  ["mac-mini", "/mac/mac-mini", "/shop/buy-mac/mac-mini", ".minimal-editorial-story", ".minimal-editorial-buy"],
  ["ipad-air", "/ipad/ipad-air", "/shop/buy-ipad/ipad-air", ".minimal-editorial-story", ".minimal-editorial-buy"],
  ["ipad-pro", "/ipad/ipad-pro", "/shop/buy-ipad/ipad-pro", ".minimal-editorial-story", ".minimal-editorial-buy"],
  ["mac-studio", "/mac-studio", "/pre-order", ".mac-story-page", "a[href*='/pre-order']"],
  ["charging-and-power", "/accessories/charging-and-power", "/shop/buy-accessory/charging-and-power", ".product-story-page", "a[href*='/shop/buy-accessory/charging-and-power']"],
];

await mkdir(output, { recursive: true });
const userDataDir = await mkdtemp(path.join(tmpdir(), "puppeteer-learn-more-"));
const browser = await puppeteer.launch({
  executablePath: browserPath,
  headless: true,
  userDataDir,
  args: ["--no-proxy-server", "--no-sandbox", "--disable-dev-shm-usage"]
});
try {
  for (const [viewport, width, height] of [["desktop", 1440, 900], ["mobile", 390, 844]]) {
    for (const [name, route, buyPath, rootSelector, buySelector] of routes) {
      console.log(`Checking ${viewport} ${name}...`);
      const page = await browser.newPage();
      await page.setViewport({ width, height, deviceScaleFactor: 1 });
      try {
        await page.goto(`${base}${route}`, { waitUntil: "domcontentloaded", timeout: 60000 });
        await page.waitForSelector(rootSelector, { timeout: 15000 });
        await page.evaluate(async (sel) => {
          const root = document.querySelector(sel);
          const images = root ? [...root.querySelectorAll("img")] : [];
          for (const img of images) {
            img.scrollIntoView({ block: "center" });
            if (!img.complete) {
              await new Promise((r) => {
                img.addEventListener("load", r, { once: true });
                img.addEventListener("error", r, { once: true });
                setTimeout(r, 6000);
              });
            }
            await img.decode().catch(() => {});
          }
          window.scrollTo(0, 0);
        }, rootSelector);
        const result = await page.evaluate((sel, bSel) => {
          const main = document.querySelector(sel);
          const images = main ? [...main.querySelectorAll("img")] : [];
          const video = main ? main.querySelector("video") : null;
          return {
            title: main?.querySelector("h1")?.textContent || main?.querySelector("h2")?.textContent,
            brokenImages: images.filter((image) => image.naturalWidth === 0).map((image) => image.src),
            buyLinks: [...document.querySelectorAll(bSel)].map((link) => new URL(link.href).pathname),
            videoSource: video?.currentSrc || video?.querySelector("source")?.src || "",
            overflow: document.documentElement.scrollWidth - window.innerWidth,
          };
        }, rootSelector, buySelector);
        assert.equal(result.brokenImages.length, 0, `${name} ${viewport}: broken images ${result.brokenImages.join(", ")}`);
        assert.ok(result.buyLinks.some((link) => link === buyPath), `${name} ${viewport}: Buy link ${buyPath} not found`);
        assert.ok(result.overflow <= 1, `${name} ${viewport}: ${result.overflow}px horizontal overflow`);
        await page.screenshot({ path: path.join(output, `${name}-${viewport}.png`), fullPage: true });
        console.log(`${viewport} ${name}: ${result.title}, images OK, Buy OK, overflow ${result.overflow}px, video ${result.videoSource || "none"}`);
      } finally {
        await page.close();
      }
    }
  }
} finally {
  await browser.close();
}
