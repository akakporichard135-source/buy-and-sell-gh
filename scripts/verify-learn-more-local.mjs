import assert from 'node:assert/strict';
import { tmpdir } from 'node:os';
import path from 'node:path';
import puppeteer from 'puppeteer-core';

const base = process.argv[2] || 'http://127.0.0.1:5173';
const browser = await puppeteer.launch({
  executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  headless: true,
  args: ['--no-sandbox'],
});

try {
  const page = await browser.newPage();
  for (const width of [390, 1440]) {
    await page.setViewport({ width, height: 900 });
    for (const [route, selector, label] of [
      ['/iphone/iphone-18-pro', '.iphone-edu-section', 'iphone-18-pro'],
      ['/mac-studio', '.mac-story-grid', 'mac-studio'],
    ]) {
      await page.goto(new URL(route, base).href, { waitUntil: 'domcontentloaded', timeout: 120000 });
      await page.waitForSelector(selector, { timeout: 120000 });
      await page.evaluate(async () => {
        for (const image of document.querySelectorAll('.editorial-story img, .mac-story-page img')) {
          image.loading = 'eager';
          await image.decode().catch(() => {});
        }
      });
      if (label === 'mac-studio') {
        for (const panel of await page.$$('.mac-story-panel')) {
          await panel.evaluate((element) => element.scrollIntoView({ block: 'center' }));
          await new Promise((resolve) => setTimeout(resolve, 180));
        }
      }
      const result = await page.evaluate(() => ({
        title: document.querySelector('h1')?.textContent?.trim(),
        chapters: document.querySelectorAll('.iphone-edu-section').length,
        panels: document.querySelectorAll('.mac-story-panel').length,
        brokenImages: [...document.querySelectorAll('.editorial-story img, .mac-story-page img')]
          .filter((image) => !image.complete || image.naturalWidth === 0)
          .map((image) => image.currentSrc || image.src),
        overflow: document.documentElement.scrollWidth > innerWidth,
        clippedHero: (() => {
          const hero = document.querySelector('.mac-story-hero');
          if (!hero) return false;
          const bounds = hero.getBoundingClientRect();
          return [...hero.querySelectorAll('h1, .store-button')].some((item) => {
            const rect = item.getBoundingClientRect();
            return rect.left < bounds.left - 1 || rect.right > bounds.right + 1;
          });
        })(),
      }));
      assert.equal(result.overflow, false, `${label} overflows at ${width}px`);
      assert.equal(result.clippedHero, false, `${label} clips its hero at ${width}px`);
      assert.deepEqual(result.brokenImages, [], `${label} has broken images at ${width}px`);
      assert.equal(result.title, label === 'mac-studio' ? 'Mac Studio' : 'iPhone 18 Pro');
      if (label === 'iphone-18-pro') assert.equal(result.chapters, 8);
      if (label === 'mac-studio') assert.equal(result.panels, 5);
      await page.screenshot({ path: path.join(tmpdir(), `buyandsell-after-${width}-${label}-learn-more.png`), fullPage: true });
      console.log(`${width} ${label}: ${JSON.stringify(result)}`);
    }
  }
  await page.close();
} finally {
  await browser.close();
}
