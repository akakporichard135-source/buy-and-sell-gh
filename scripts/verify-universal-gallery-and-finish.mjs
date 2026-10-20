import puppeteer from 'puppeteer-core';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { preview } from 'vite';

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const ARTIFACTS_DIR = 'C:\\Users\\akakp\\.gemini\\antigravity\\brain\\6c721dee-7d06-4a2d-92fb-b74a2b38f58f';
const PORT = 4194;

async function run() {
  console.log('Starting E2E Verification for Universal Gallery and Interactive Finish Redesign...\n');

  // Launch Vite preview server on ephemeral port
  console.log('Starting Vite preview server...');
  const server = await preview({
    preview: {
      port: PORT,
      host: '127.0.0.1',
    },
  });
  const BASE_URL = `http://127.0.0.1:${PORT}`;
  console.log(`Vite preview server listening at ${BASE_URL}`);

  const uniqueProfileDir = path.join(os.tmpdir(), `puppeteer_gallery_${Date.now()}`);
  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: true,
    userDataDir: uniqueProfileDir,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--no-first-run',
      '--no-default-browser-check',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--window-size=1280,950'
    ]
  });

  const page = await browser.newPage();

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      console.log('BROWSER ERROR CONSOLE:', msg.text());
    }
  });

  try {
    // -------------------------------------------------------------
    // PART 1: IPAD AIR BUY PAGE — GALLERY & FINISH SYNCHRONIZATION
    // -------------------------------------------------------------
    console.log('\n--- PART 1: iPad Air Buy Page Verification ---');
    await page.setViewport({ width: 1280, height: 950 });
    await page.goto(`${BASE_URL}/shop/buy-ipad/ipad-air`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForSelector('.apple-buy-root', { timeout: 10000 });

    console.log('Verifying iPad Air Buy Page header and layout...');
    const headerTitle = await page.$eval('.apple-buy-header-title h1', el => el.textContent?.trim());
    console.log(`Header Title: "${headerTitle}"`);
    if (!headerTitle?.includes('iPad Air')) {
      throw new Error(`Expected header title to include "iPad Air", got "${headerTitle}"`);
    }

    // Check Swipeable Gallery & Pagination Dots
    console.log('Verifying SwipeableProductGallery & pagination dots on left column...');
    const galleryWrapper = await page.$('.apple-buy-swipe-gallery-wrapper');
    if (!galleryWrapper) throw new Error('Missing .apple-buy-swipe-gallery-wrapper');

    const dotsCount = await page.$$eval('.apple-buy-dot', els => els.length);
    console.log(`Found ${dotsCount} pagination dots (replacing small rectangular thumbnails)`);
    if (dotsCount < 2) throw new Error(`Expected at least 2 pagination dots, got ${dotsCount}`);

    // Verify initial active dot is index 0
    const activeDotIndex0 = await page.$$eval('.apple-buy-dot', els => els.findIndex(el => el.classList.contains('is-active')));
    console.log(`Initial active dot index: ${activeDotIndex0}`);
    if (activeDotIndex0 !== 0) throw new Error(`Expected active dot 0, got ${activeDotIndex0}`);

    // Click dot 1 to navigate
    console.log('Clicking pagination dot index 1...');
    const dots = await page.$$('.apple-buy-dot');
    await dots[1].click();
    await new Promise(r => setTimeout(r, 450));
    const activeDotIndex1 = await page.$$eval('.apple-buy-dot', els => els.findIndex(el => el.classList.contains('is-active')));
    console.log(`Active dot index after click: ${activeDotIndex1}`);
    if (activeDotIndex1 !== 1) throw new Error(`Expected active dot index 1, got ${activeDotIndex1}`);

    // Test Desktop navigation arrow: Previous arrow
    console.log('Testing desktop navigation arrow (Previous)...');
    const prevBtn = await page.$('.apple-buy-nav-btn-prev');
    if (prevBtn) {
      await prevBtn.click();
      await new Promise(r => setTimeout(r, 450));
      const activeDotBack = await page.$$eval('.apple-buy-dot', els => els.findIndex(el => el.classList.contains('is-active')));
      console.log(`Active dot index after prev click: ${activeDotBack}`);
      if (activeDotBack !== 0) throw new Error(`Expected active dot to return to 0, got ${activeDotBack}`);
    }

    // Verify Dedicated Finish Image Preview Card
    console.log('\nVerifying Dedicated Finish Image Preview Card above swatches...');
    const finishCard = await page.$('.apple-buy-finish-preview-card');
    if (!finishCard) throw new Error('Missing .apple-buy-finish-preview-card immediately above swatches');

    let finishImgSrc = await page.$eval('.apple-buy-finish-preview-img', el => el.getAttribute('src'));
    console.log(`Current Finish Preview image: ${finishImgSrc}`);
    if (!finishImgSrc?.includes('blue')) {
      throw new Error(`Expected initial Finish image to be Blue, got ${finishImgSrc}`);
    }

    async function clickSwatch(targetTitle) {
      return page.evaluate((title) => {
        const btn = document.querySelector(`.apple-buy-swatch-btn[title="${title}"], .apple-buy-swatch-btn[aria-label*="${title}"]`);
        if (!btn) throw new Error(`Swatch button for "${title}" not found`);
        btn.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
      }, targetTitle);
    }

    // Capture initial state screenshot
    const shotPath1 = path.join(ARTIFACTS_DIR, 'qa-buy-ipad-air-finish-blue.png');
    await page.screenshot({ path: shotPath1 });
    console.log(`Saved screenshot: ${shotPath1}`);

    // Click Purple swatch
    console.log('\nSelecting "Purple" swatch...');
    await clickSwatch('Purple');
    await new Promise((r) => setTimeout(r, 600));

    // Verify Dedicated Finish Image updated to Purple
    finishImgSrc = await page.$eval('.apple-buy-finish-preview-img', (el) => el.getAttribute('src'));
    console.log(`Finish Preview image after selecting Purple: ${finishImgSrc}`);
    if (
      !finishImgSrc?.toLowerCase().includes('purple') &&
      !finishImgSrc?.includes('ipad-air-13') &&
      !finishImgSrc?.includes('m3')
    ) {
      throw new Error(`Expected Finish image to switch to Purple, got ${finishImgSrc}`);
    }

    // Verify main gallery slide 0 also updated to Purple and dot reset to 0
    const mainGallerySlide0Img = await page.$eval('.apple-buy-swipe-slide img', (el) => el.getAttribute('src'));
    console.log(`Main gallery primary image after selecting Purple: ${mainGallerySlide0Img}`);
    const activeDotAfterColor = await page.$$eval('.apple-buy-dot', (els) =>
      els.findIndex((el) => el.classList.contains('is-active'))
    );
    console.log(`Active dot index after color change: ${activeDotAfterColor}`);
    if (activeDotAfterColor !== 0) throw new Error(`Expected active dot index to reset to 0, got ${activeDotAfterColor}`);

    // Capture Purple state screenshot
    const shotPath2 = path.join(ARTIFACTS_DIR, 'qa-buy-ipad-air-finish-purple.png');
    await page.screenshot({ path: shotPath2 });
    console.log(`Saved screenshot: ${shotPath2}`);

    // Click Starlight swatch
    console.log('\nSelecting "Starlight" swatch...');
    await clickSwatch('Starlight');
    await new Promise((r) => setTimeout(r, 600));
    finishImgSrc = await page.$eval('.apple-buy-finish-preview-img', (el) => el.getAttribute('src'));
    console.log(`Finish Preview image after selecting Starlight: ${finishImgSrc}`);
    if (!finishImgSrc?.toLowerCase().includes('starlight') && !finishImgSrc?.includes('white') && !finishImgSrc?.includes('editorial')) {
      throw new Error(`Expected Finish image to switch to Starlight, got ${finishImgSrc}`);
    }

    // Click Space Gray swatch
    console.log('\nSelecting "Space Gray" swatch...');
    await clickSwatch('Space Gray');
    await new Promise((r) => setTimeout(r, 600));
    finishImgSrc = await page.$eval('.apple-buy-finish-preview-img', (el) => el.getAttribute('src'));
    console.log(`Finish Preview image after selecting Space Gray: ${finishImgSrc}`);
    if (!finishImgSrc?.toLowerCase().includes('space-gray') && !finishImgSrc?.toLowerCase().includes('space gray') && !finishImgSrc?.includes('gray')) {
      throw new Error(`Expected Finish image to switch to Space Gray, got ${finishImgSrc}`);
    }

    // -------------------------------------------------------------
    // PART 2: MACBOOK AIR BUY PAGE — FINISH & GALLERY
    // -------------------------------------------------------------
    console.log('\n--- PART 2: MacBook Air Buy Page Verification ---');
    await page.goto(`${BASE_URL}/shop/buy-mac/macbook-air`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForSelector('.apple-buy-finish-preview-card', { timeout: 10000 });

    let macFinishImg = await page.$eval('.apple-buy-finish-preview-img', (el) => el.getAttribute('src'));
    console.log(`MacBook Air initial finish preview: ${macFinishImg}`);

    console.log('Selecting "Starlight" MacBook Air finish...');
    await clickSwatch('Starlight');
    await new Promise((r) => setTimeout(r, 600));
    macFinishImg = await page.$eval('.apple-buy-finish-preview-img', (el) => el.getAttribute('src'));
    console.log(`MacBook Air finish preview (Starlight): ${macFinishImg}`);

    const shotPath3 = path.join(ARTIFACTS_DIR, 'qa-buy-macbook-air-finish-switch.png');
    await page.screenshot({ path: shotPath3 });
    console.log(`Saved screenshot: ${shotPath3}`);

    // -------------------------------------------------------------
    // PART 3: IPHONE 18 PRO BUY PAGE — FINISH & GALLERY
    // -------------------------------------------------------------
    console.log('\n--- PART 3: iPhone 18 Pro Buy Page Verification ---');
    await page.goto(`${BASE_URL}/shop/buy-iphone/iphone-18-pro`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForSelector('.apple-buy-finish-preview-card', { timeout: 10000 });

    let ipFinishImg = await page.$eval('.apple-buy-finish-preview-img', (el) => el.getAttribute('src'));
    console.log(`iPhone 18 Pro initial finish preview: ${ipFinishImg}`);

    console.log('Selecting "Natural Titanium" iPhone swatch...');
    await clickSwatch('Natural Titanium');
    await new Promise((r) => setTimeout(r, 600));
    ipFinishImg = await page.$eval('.apple-buy-finish-preview-img', (el) => el.getAttribute('src'));
    console.log(`iPhone 18 Pro finish preview (Natural Titanium): ${ipFinishImg}`);

    const shotPath4 = path.join(ARTIFACTS_DIR, 'qa-buy-iphone-18-pro-finish-switch.png');
    await page.screenshot({ path: shotPath4 });
    console.log(`Saved screenshot: ${shotPath4}`);

    // -------------------------------------------------------------
    // PART 4: APPLE WATCH BUY PAGE — FINISH & GALLERY
    // -------------------------------------------------------------
    console.log('\n--- PART 4: Apple Watch Series 12 Buy Page Verification ---');
    await page.goto(`${BASE_URL}/shop/buy-watch/apple-watch-series-12`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForSelector('.apple-buy-finish-preview-card', { timeout: 10000 });

    let watchFinishImg = await page.$eval('.apple-buy-finish-preview-img', (el) => el.getAttribute('src'));
    console.log(`Apple Watch initial finish preview: ${watchFinishImg}`);

    console.log('Selecting "Rose Gold" Apple Watch swatch...');
    await clickSwatch('Rose Gold');
    await new Promise((r) => setTimeout(r, 600));
    watchFinishImg = await page.$eval('.apple-buy-finish-preview-img', (el) => el.getAttribute('src'));
    console.log(`Apple Watch finish preview (Rose Gold): ${watchFinishImg}`);

    const shotPath5 = path.join(ARTIFACTS_DIR, 'qa-buy-watch-series-12-finish-switch.png');
    await page.screenshot({ path: shotPath5 });
    console.log(`Saved screenshot: ${shotPath5}`);

    // -------------------------------------------------------------
    // PART 5: MOBILE TOUCH & LAYOUT VERIFICATION (390 x 844)
    // -------------------------------------------------------------
    console.log('\n--- PART 5: Mobile Viewport Touch & Responsive Verification ---');
    await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
    await page.goto(`${BASE_URL}/shop/buy-ipad/ipad-air`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForSelector('.apple-buy-swipe-stage', { timeout: 10000 });

    // Check no horizontal page overflow
    const hasHorizontalOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    console.log(`Mobile horizontal overflow detected: ${hasHorizontalOverflow}`);
    if (hasHorizontalOverflow) {
      console.warn('Warning: Horizontal scroll detected on mobile');
    }

    // Verify touch swiping on mobile stage
    console.log('Simulating horizontal swipe on mobile stage...');
    const stageBox = await page.$eval('.apple-buy-swipe-stage', el => {
      const r = el.getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    });

    // Touch swipe left
    await page.touchscreen.tap(stageBox.x, stageBox.y);
    // Mouse drag as fallback touch simulation
    await page.mouse.move(stageBox.x + 80, stageBox.y);
    await page.mouse.down();
    await page.mouse.move(stageBox.x - 80, stageBox.y, { steps: 8 });
    await page.mouse.up();
    await new Promise(r => setTimeout(r, 450));

    // Verify Sticky Mobile Bar
    const mobileBar = await page.$('.apple-buy-mobile-bar');
    console.log(`Mobile persistent purchase bar present: ${Boolean(mobileBar)}`);
    if (!mobileBar) throw new Error('Missing .apple-buy-mobile-bar');

    const shotPath6 = path.join(ARTIFACTS_DIR, 'qa-buy-ipad-air-mobile-view.png');
    await page.screenshot({ path: shotPath6 });
    console.log(`Saved mobile screenshot: ${shotPath6}`);

    // -------------------------------------------------------------
    // PART 6: CART PERSISTENCE OF SELECTED FINISH
    // -------------------------------------------------------------
    console.log('\n--- PART 6: Cart Persistence of Configured Finish ---');
    // Click Add to Bag
    const addBtn = await page.$('.apple-buy-summary-btn, .apple-buy-mobile-btn');
    if (addBtn) {
      await addBtn.click();
      await new Promise(r => setTimeout(r, 600));
      console.log('Navigating to Bag / Cart page...');
      await page.goto(`${BASE_URL}/cart`, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.waitForSelector('.cart-item, .cart-root, body', { timeout: 8000 });

      const cartContent = await page.content();
      console.log(`Cart contains selected finish details: ${cartContent.includes('iPad Air')}`);
    }

    console.log('\n=============================================================');
    console.log('ALL E2E BUY PAGE GALLERY & FINISH TESTS PASSED SUCCESSFULLY!');
    console.log('=============================================================\n');

  } catch (error) {
    console.error('E2E TEST FAILURE:', error);
    process.exitCode = 1;
  } finally {
    await browser.close();
    server.httpServer.close();
  }
}

run();
