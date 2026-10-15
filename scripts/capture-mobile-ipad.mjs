import puppeteer from 'puppeteer-core';

const EDGE_PATH = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const ARTIFACT_PATH = 'C:/Users/akakp/.gemini/antigravity/brain/6c721dee-7d06-4a2d-92fb-b74a2b38f58f/live-mobile-ipad-air-tile.png';

async function main() {
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: EDGE_PATH,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
  await page.goto('https://buyandsellgh.com', { waitUntil: 'networkidle2', timeout: 45000 });
  await page.waitForSelector('.home-ref-ipad-air img', { timeout: 15000 });
  const el = await page.$('.home-ref-ipad-air');
  await el.scrollIntoView();
  await page.waitForFunction(() => {
    const img = document.querySelector('.home-ref-ipad-air img');
    return img && img.complete && img.naturalWidth > 0;
  }, { timeout: 15000 });
  await new Promise(r => setTimeout(r, 1000));
  await el.screenshot({ path: ARTIFACT_PATH });
  console.log('Mobile screenshot saved to', ARTIFACT_PATH);
  await browser.close();
}

main().catch(console.error);
