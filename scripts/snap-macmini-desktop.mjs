import puppeteer from 'puppeteer-core';
import path from 'node:path';

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const artifactDir = 'C:/Users/akakp/.gemini/antigravity/brain/6c721dee-7d06-4a2d-92fb-b74a2b38f58f';
const prodUrl = 'https://buyandsellgh.com';

const browser = await puppeteer.launch({
  executablePath: edgePath,
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox']
});

try {
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto(prodUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await new Promise((r) => setTimeout(r, 2000));

  await page.evaluate(async () => {
    const tile = document.querySelector('.home-ref-mac-mini');
    if (tile) {
      tile.scrollIntoView({ behavior: 'instant', block: 'center' });
      const img = tile.querySelector('img');
      if (img && !img.complete) {
        await new Promise((res) => {
          img.onload = res;
          img.onerror = res;
          setTimeout(res, 4000);
        });
      }
      if (img && img.decode) {
        await img.decode().catch(() => {});
      }
    }
  });

  await new Promise((r) => setTimeout(r, 1500));
  const el = await page.$('.home-ref-mac-mini');
  if (el) {
    await el.screenshot({ path: path.join(artifactDir, 'live-prod-homepage-macmini-card.png') });
    console.log('Successfully captured live-prod-homepage-macmini-card.png');
  }
  await browser.close();
} catch (e) {
  console.error(e);
  await browser.close();
}
