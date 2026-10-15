import puppeteer from 'puppeteer-core';
import path from 'node:path';

const EDGE_PATH = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const ARTIFACT_DIR = 'C:/Users/akakp/.gemini/antigravity/brain/6c721dee-7d06-4a2d-92fb-b74a2b38f58f';

async function run() {
  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
    await page.goto('https://buyandsellgh.com/', { waitUntil: 'domcontentloaded', timeout: 45000 });
    await new Promise(r => setTimeout(r, 2000));

    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'mobile-hero-current-390.png'),
      fullPage: false
    });
    console.log('Saved mobile-hero-current-390.png');
  } finally {
    await browser.close();
  }
}

run().catch(console.error);
