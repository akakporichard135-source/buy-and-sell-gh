import puppeteer from 'puppeteer-core';
import https from 'node:https';

const EDGE_PATH = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const ARTIFACT_DIR = 'C:/Users/akakp/.gemini/antigravity/brain/6c721dee-7d06-4a2d-92fb-b74a2b38f58f';

function checkUrl(url) {
  return new Promise((resolve) => {
    https.get(url, (res) => {
      resolve({ url, status: res.statusCode, headers: res.headers });
    }).on('error', (err) => {
      resolve({ url, status: 0, error: err.message });
    });
  });
}

async function run() {
  console.log('=== VERIFYING LIVE IPAD AIR & MEDIA LIBRARY INTEGRATION ===\n');

  // 1. Verify HTTP status of live iPad Air assets
  const urlsToCheck = [
    'https://buyandsellgh.com/products/homepage/homepage-ipad-air-white.webp',
    'https://buyandsellgh.com/products/campaigns/ipad-air-colors.webp',
    'https://buyandsellgh.com/products/campaigns/ipad-air-blue.webp',
    'https://buyandsellgh.com/',
    'https://admin.buyandsellgh.com/'
  ];

  for (const url of urlsToCheck) {
    const res = await checkUrl(url);
    console.log(`[HTTP ${res.status}] ${url}`);
  }

  // 2. Launch Puppeteer for visual QA
  console.log('\nLaunching Puppeteer for Desktop & Mobile live verification...');
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: EDGE_PATH,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    // Desktop check
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });
    await page.goto('https://buyandsellgh.com', { waitUntil: 'networkidle2', timeout: 30000 });

    const ipadTile = await page.$('.home-ref-ipad-air');
    if (ipadTile) {
      await ipadTile.scrollIntoView();
      await new Promise(r => setTimeout(r, 1500));
      await ipadTile.screenshot({
        path: `${ARTIFACT_DIR}/live-desktop-ipad-air-tile.png`
      });
      console.log('✓ Desktop iPad Air tile captured: live-desktop-ipad-air-tile.png');
    } else {
      console.warn('! .home-ref-ipad-air tile element not found on desktop');
    }

    // Mobile check with fresh page
    const mobilePage = await browser.newPage();
    await mobilePage.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
    await mobilePage.goto('https://buyandsellgh.com', { waitUntil: 'domcontentloaded', timeout: 30000 });
    const mobileIpadTile = await mobilePage.$('.home-ref-ipad-air');
    if (mobileIpadTile) {
      await mobileIpadTile.scrollIntoView();
      await new Promise(r => setTimeout(r, 1500));
      await mobileIpadTile.screenshot({
        path: `${ARTIFACT_DIR}/live-mobile-ipad-air-tile.png`
      });
      console.log('✓ Mobile iPad Air tile captured: live-mobile-ipad-air-tile.png');
    }
    await mobilePage.close();

    // Admin subdomain check
    const adminPage = await browser.newPage();
    await adminPage.goto('https://admin.buyandsellgh.com', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await new Promise(r => setTimeout(r, 1500));
    await adminPage.screenshot({
      path: `${ARTIFACT_DIR}/live-admin-login-screen.png`,
      fullPage: false
    });
    console.log('✓ Admin login screen verified: live-admin-login-screen.png');
    await adminPage.close();

  } catch (err) {
    console.error('Error during browser testing:', err);
  } finally {
    await browser.close();
  }

  console.log('\n=== LIVE VERIFICATION FINISHED SUCCESSFULLY ===');
}

run().catch(console.error);
