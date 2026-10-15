import puppeteer from 'puppeteer-core';
import { tmpdir } from 'node:os';
import path from 'node:path';

const browser = await puppeteer.launch({
  executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  headless: true,
  args: ['--no-sandbox'],
});
const baseUrl = process.argv[2] || 'http://127.0.0.1:5173/';
const widths = process.argv[3] ? process.argv[3].split(',').map(Number) : [320, 375, 390, 430, 1280, 1440, 1920];
const label = baseUrl.includes('127.0.0.1') ? 'after' : 'before';

try {
  const page = await browser.newPage();
  await page.setViewport({ width: widths[0], height: 900 });
  await page.goto(baseUrl, { waitUntil: 'domcontentloaded', timeout: 120000 });
  await page.waitForSelector('.home-ref-airpods-pro-3', { timeout: 120000 });
  for (const width of widths) {
    await page.setViewport({ width, height: 900 });
    await new Promise((resolve) => setTimeout(resolve, 200));

    for (const name of ['iphone-18-pro', 'iphone-duo', 'watch-ultra-4', 'airpods-pro-3']) {
      const section = await page.$(`.home-ref-${name}`);
      await section.evaluate((element) => element.scrollIntoView());
      await new Promise((resolve) => setTimeout(resolve, 500));
      const result = await section.evaluate(async (element) => {
        const image = element.querySelector('img');
        await image.decode().catch(() => {});
        const buttons = element.querySelector('.home-ref-actions').getBoundingClientRect();
        const artwork = image.getBoundingClientRect();
        return {
          loaded: image.naturalWidth > 0,
          gap: Math.round(artwork.top - buttons.bottom),
          overflow: document.documentElement.scrollWidth > innerWidth,
        };
      });
      console.log(`${width} ${name}: ${JSON.stringify(result)}`);
      if (width === 390 || width === 1440) {
        await section.screenshot({ path: path.join(tmpdir(), `buyandsell-${label}-${width}-${name}.png`) });
      }
    }
  }
  await page.close();
} finally {
  await browser.close();
}
