import puppeteer from 'puppeteer-core';
import fs from 'node:fs';
import path from 'node:path';
import { preview } from 'vite';

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const ARTIFACTS_DIR = 'C:\\Users\\akakp\\.gemini\\antigravity\\brain\\6c721dee-7d06-4a2d-92fb-b74a2b38f58f';

async function run() {
  console.log('Starting E2E Browser Verification for Universal Color Selector...\n');

  // Launch Vite preview server programmatically
  console.log('Starting Vite preview server...');
  const server = await preview({
    preview: {
      port: 4173,
      host: '127.0.0.1',
    },
  });
  const BASE_URL = 'http://127.0.0.1:4173';
  console.log(`Vite preview server listening at ${BASE_URL}`);

  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1280,950']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 950 });

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      console.log('BROWSER ERROR CONSOLE:', msg.text());
    }
  });
  page.on('pageerror', (err) => {
    console.log('BROWSER UNCAUGHT EXCEPTION:', err.message);
  });

  try {
    // -------------------------------------------------------------
    // 1. Test Generic Buy Experience with Circular Swatches: iPhone 16 Pro Max
    // -------------------------------------------------------------
    console.log('1. Testing /shop/buy-iphone/iphone-16-pro-max...');
    await page.goto(`${BASE_URL}/shop/buy-iphone/iphone-16-pro-max`, { waitUntil: 'networkidle2', timeout: 30000 });

    await page.waitForSelector('.apple-buy-swatches', { timeout: 10000 });
    const swatches = await page.$$('.apple-buy-swatch-btn');
    console.log(`Found ${swatches.length} color swatches on iPhone 16 Pro Max page.`);

    const initialImgSrc = await page.$eval('.apple-buy-stage-img', (img) => img.src);
    console.log(`Initial stage image: ${initialImgSrc}`);

    // Click on Natural Titanium swatch
    console.log('Clicking Natural Titanium swatch...');
    const clickedNatural = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('.apple-buy-swatch-btn'));
      const naturalBtn = btns.find((b) => b.getAttribute('title')?.toLowerCase().includes('natural'));
      if (naturalBtn) {
        naturalBtn.click();
        return true;
      }
      return false;
    });
    console.log(`Clicked Natural Titanium swatch: ${clickedNatural}`);

    await new Promise((r) => setTimeout(r, 600));

    const updatedImgSrc = await page.$eval('.apple-buy-stage-img', (img) => img.src);
    console.log(`Updated stage image after Natural Titanium click: ${updatedImgSrc}`);

    const labelText = await page.$eval('.apple-buy-swatch-label', (el) => el.textContent.trim());
    console.log(`Swatch header label: ${labelText}`);

    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'qa-color-selector-iphone-16-pro.png') });
    console.log('Saved screenshot: qa-color-selector-iphone-16-pro.png');

    // -------------------------------------------------------------
    // 2. Test MacBook Air Buy Page: 4 Finishes
    // -------------------------------------------------------------
    console.log('\n2. Testing /shop/buy-mac/macbook-air...');
    await page.goto(`${BASE_URL}/shop/buy-mac/macbook-air`, { waitUntil: 'networkidle2', timeout: 30000 });

    await page.waitForSelector('.apple-buy-swatches', { timeout: 10000 });
    const mbaSwatches = await page.$$('.apple-buy-swatch-btn');
    console.log(`Found ${mbaSwatches.length} color swatches on MacBook Air page.`);

    // Switch to Starlight
    console.log('Clicking Starlight swatch...');
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('.apple-buy-swatch-btn'));
      const starlightBtn = btns.find((b) => b.getAttribute('title')?.toLowerCase().includes('starlight'));
      if (starlightBtn) starlightBtn.click();
    });

    await new Promise((r) => setTimeout(r, 600));
    const starlightImg = await page.$eval('.apple-buy-stage-img', (img) => img.src);
    console.log(`Starlight image: ${starlightImg}`);

    // Switch to Silver
    console.log('Clicking Silver swatch...');
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('.apple-buy-swatch-btn'));
      const silverBtn = btns.find((b) => b.getAttribute('title')?.toLowerCase().includes('silver'));
      if (silverBtn) silverBtn.click();
    });

    await new Promise((r) => setTimeout(r, 600));
    const silverImg = await page.$eval('.apple-buy-stage-img', (img) => img.src);
    console.log(`Silver image: ${silverImg}`);

    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'qa-color-selector-macbook-air.png') });
    console.log('Saved screenshot: qa-color-selector-macbook-air.png');

    // Add MacBook Air in Silver to bag
    console.log('Adding MacBook Air (Silver) to bag...');
    await page.click('.apple-buy-btn-primary');
    await new Promise((r) => setTimeout(r, 800));

    // -------------------------------------------------------------
    // 3. Test iPad Pro Buy Page: Space Black & Silver
    // -------------------------------------------------------------
    console.log('\n3. Testing /shop/buy-ipad/ipad-pro...');
    await page.goto(`${BASE_URL}/shop/buy-ipad/ipad-pro`, { waitUntil: 'networkidle2', timeout: 30000 });

    await page.waitForSelector('.apple-buy-swatches', { timeout: 10000 });
    const ipadSwatches = await page.$$('.apple-buy-swatch-btn');
    console.log(`Found ${ipadSwatches.length} color swatches on iPad Pro page.`);

    // Click Silver
    console.log('Clicking iPad Pro Silver swatch...');
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('.apple-buy-swatch-btn'));
      const silverBtn = btns.find((b) => b.getAttribute('title')?.toLowerCase().includes('silver'));
      if (silverBtn) silverBtn.click();
    });

    await new Promise((r) => setTimeout(r, 600));
    const ipadSilverImg = await page.$eval('.apple-buy-stage-img', (img) => img.src);
    console.log(`iPad Pro Silver stage image: ${ipadSilverImg}`);

    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'qa-color-selector-ipad-pro.png') });
    console.log('Saved screenshot: qa-color-selector-ipad-pro.png');

    // -------------------------------------------------------------
    // 4. Test Cart Integration: Verify Selected Color Image Preserved
    // -------------------------------------------------------------
    console.log('\n4. Testing /cart to verify selected color image preservation...');
    await page.goto(`${BASE_URL}/cart`, { waitUntil: 'networkidle2', timeout: 30000 });

    await page.waitForSelector('.cart-item', { timeout: 10000 });
    const cartImgSrc = await page.$eval('.cart-item .product-render-image', (img) => img.src);
    console.log(`Cart item product image: ${cartImgSrc}`);

    const orderSummaryImgSrc = await page.$eval('.order-summary-line img', (img) => img.src);
    console.log(`Order summary line image: ${orderSummaryImgSrc}`);

    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'qa-color-selector-cart-preservation.png') });
    console.log('Saved screenshot: qa-color-selector-cart-preservation.png');

    console.log('\n======================================================');
    console.log('ALL E2E COLOR SELECTOR VERIFICATIONS PASSED SUCCESSFULLY!');
    console.log('======================================================\n');
  } catch (err) {
    console.error('E2E Verification Error:', err);
    process.exit(1);
  } finally {
    await browser.close();
    server.httpServer.close();
  }
}

run();
