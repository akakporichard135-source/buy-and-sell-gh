import assert from "node:assert/strict";
import { tmpdir } from "node:os";
import path from "node:path";
import puppeteer from "puppeteer-core";

const baseUrl = process.env.LOCAL_URL || "http://127.0.0.1:5176";
const browser = await puppeteer.launch({
  executablePath: "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  headless: true,
  args: ["--no-sandbox"],
});

try {
  for (const [name, width, height, expectedOffset] of [["desktop", 1440, 900, 20], ["mobile", 390, 844, 10]]) {
    const page = await browser.newPage();
    await page.setViewport({ width, height, deviceScaleFactor: 1 });
    await page.goto(`${baseUrl}/watch/apple-watch-ultra-4`, { waitUntil: "domcontentloaded", timeout: 120000 });
    await page.waitForSelector(".minimal-editorial-story-apple-watch-ultra-4 .minimal-editorial-hero-image", { timeout: 120000 });
    await page.waitForFunction(() => document.querySelector(".minimal-editorial-hero-image")?.complete);
    const result = await page.evaluate(() => {
      const image = document.querySelector(".minimal-editorial-hero-image");
      const copy = document.querySelector(".minimal-editorial-copy");
      const video = document.querySelector(".minimal-editorial-film video");
      const after = image.getBoundingClientRect();
      const transform = getComputedStyle(image).transform;
      image.style.transform = "none";
      const before = image.getBoundingClientRect();
      image.style.removeProperty("transform");
      return {
        source: image.getAttribute("src"),
        loaded: image.naturalWidth > 0,
        beforeTop: before.top,
        afterTop: after.top,
        offset: before.top - after.top,
        imageHeight: after.height,
        copyBottom: copy.getBoundingClientRect().bottom,
        overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        transform,
        videoSource: video?.querySelector("source:last-child")?.getAttribute("src") || null,
      };
    });
    assert.ok(result.loaded, `${name}: Watch hero did not load`);
    assert.ok(Math.abs(result.offset - expectedOffset) < 1, `${name}: unexpected hero offset`);
    assert.ok(result.afterTop > result.copyBottom, `${name}: hero overlaps copy`);
    assert.ok(result.overflow <= 2, `${name}: page overflows horizontally`);
    const screenshot = path.join(tmpdir(), `buyandsell-watch-ultra-4-${name}-after.png`);
    await page.screenshot({ path: screenshot, fullPage: true });
    console.log(`${name}: ${JSON.stringify(result)}; ${screenshot}`);
    await page.close();
  }
} finally {
  await browser.close();
}
