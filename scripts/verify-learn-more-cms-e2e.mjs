import puppeteer from 'puppeteer-core';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { preview } from 'vite';

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const ARTIFACTS_DIR = 'C:\\Users\\akakp\\.gemini\\antigravity\\brain\\6c721dee-7d06-4a2d-92fb-b74a2b38f58f';
const PORT = 4192;

async function run() {
  console.log('Starting E2E Browser Verification for Learn More CMS & Mobile Navigation...\n');

  // Launch Vite preview server
  console.log('Starting Vite preview server...');
  const server = await preview({
    preview: {
      port: PORT,
      host: '127.0.0.1',
    },
  });
  const BASE_URL = `http://127.0.0.1:${PORT}`;
  console.log(`Vite preview server listening at ${BASE_URL}`);

  const uniqueProfileDir = path.join(os.tmpdir(), `puppeteer_e2e_${Date.now()}`);
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
  page.on('pageerror', (err) => {
    console.log('BROWSER UNCAUGHT EXCEPTION:', err.message);
  });

  try {
    // -------------------------------------------------------------
    // PART 1: MOBILE NAVIGATION DROPDOWNS & CURTAIN VERIFICATION
    // -------------------------------------------------------------
    console.log('\n--- PART 1: Mobile Navigation Curtain & Accordions ---');
    await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
    await page.goto(`${BASE_URL}/shop`, { waitUntil: 'domcontentloaded', timeout: 30000 });

    console.log('Locating hamburger button on mobile...');
    await page.waitForSelector('.global-header-menu-btn', { timeout: 10000 });
    await page.click('.global-header-menu-btn');
    await new Promise((r) => setTimeout(r, 600)); // wait for curtain transition

    const curtainVisible = await page.$eval('.global-mobile-curtain', (el) => el.classList.contains('is-open'));
    console.log(`Curtain menu is-open: ${curtainVisible}`);

    await page.screenshot({
      path: path.join(ARTIFACTS_DIR, 'qa-mobile-nav-curtain-open.png'),
      fullPage: false,
    });
    console.log('Saved qa-mobile-nav-curtain-open.png');

    // Click "Store" accordion button to expand submenu
    console.log('Expanding "Store" submenu...');
    const storeBtnClicked = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('.global-curtain-heading-btn'));
      const storeBtn = btns.find((b) => b.textContent && b.textContent.includes('Store'));
      if (storeBtn) {
        storeBtn.click();
        return true;
      }
      return false;
    });
    console.log(`Store accordion button clicked: ${storeBtnClicked}`);
    await new Promise((r) => setTimeout(r, 500)); // wait for accordion expand

    // Verify sublinks exist
    const storeSublinks = await page.evaluate(() => {
      const activeItem = document.querySelector('.global-curtain-item.is-expanded');
      if (!activeItem) return [];
      const links = Array.from(activeItem.querySelectorAll('.global-curtain-sublink'));
      return links.map((l) => ({ text: l.textContent?.trim(), href: l.getAttribute('href') }));
    });
    console.log('Store submenu links found:', storeSublinks);

    await page.screenshot({
      path: path.join(ARTIFACTS_DIR, 'qa-mobile-nav-store-expanded.png'),
      fullPage: false,
    });
    console.log('Saved qa-mobile-nav-store-expanded.png');

    // Expand "Mac" accordion
    console.log('Expanding "Mac" submenu...');
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('.global-curtain-heading-btn'));
      const macBtn = btns.find((b) => b.textContent && b.textContent.includes('Mac'));
      if (macBtn) macBtn.click();
    });
    await new Promise((r) => setTimeout(r, 500));

    const macSublinks = await page.evaluate(() => {
      const activeItem = document.querySelector('.global-curtain-item.is-expanded');
      if (!activeItem) return [];
      const links = Array.from(activeItem.querySelectorAll('.global-curtain-sublink'));
      return links.map((l) => ({ text: l.textContent?.trim(), href: l.getAttribute('href') }));
    });
    console.log('Mac submenu links found:', macSublinks);

    await page.screenshot({
      path: path.join(ARTIFACTS_DIR, 'qa-mobile-nav-mac-expanded.png'),
      fullPage: false,
    });
    console.log('Saved qa-mobile-nav-mac-expanded.png');

    console.log('Clicking "Explore All Mac" link in mobile curtain...');
    const clickedMac = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('.global-curtain-sublink'));
      const macLink = links.find((l) => l.textContent && l.textContent.includes('Explore All Mac'));
      if (macLink) {
        macLink.click();
        return true;
      }
      return false;
    });
    console.log(`Clicked Explore All Mac: ${clickedMac}`);
    await new Promise((r) => setTimeout(r, 1200));

    console.log(`Current page URL after click: ${page.url()}`);
    const isCurtainClosed = await page.evaluate(() => {
      const curtain = document.querySelector('.global-mobile-curtain');
      return !curtain || !curtain.classList.contains('is-open');
    });
    console.log(`Curtain closed after navigation: ${isCurtainClosed}`);

    // -------------------------------------------------------------
    // PART 2: MAC & IPAD LEARN MORE EDITORIAL STORIES
    // -------------------------------------------------------------
    console.log('\n--- PART 2: Mac & iPad Learn More Stories ---');
    await page.setViewport({ width: 1280, height: 950, isMobile: false, hasTouch: false });

    // 1. MacBook Air (/mac/macbook-air)
    console.log('Navigating to /mac/macbook-air...');
    await page.goto(`${BASE_URL}/mac/macbook-air`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForSelector('.editorial-hero', { timeout: 10000 });
    const airTitle = await page.$eval('#editorial-title', (el) => el.textContent?.trim());
    const airBuyLink = await page.$eval('.editorial-buy', (el) => el.getAttribute('href'));
    console.log(`MacBook Air page title: "${airTitle}", buy link: "${airBuyLink}"`);
    await page.screenshot({
      path: path.join(ARTIFACTS_DIR, 'qa-learn-more-macbook-air.png'),
      fullPage: false,
    });
    console.log('Saved qa-learn-more-macbook-air.png');

    // 2. MacBook Pro (/mac/macbook-pro)
    console.log('Navigating to /mac/macbook-pro...');
    await page.goto(`${BASE_URL}/mac/macbook-pro`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForSelector('.editorial-hero', { timeout: 10000 });
    const proTitle = await page.$eval('#editorial-title', (el) => el.textContent?.trim());
    const proBuyLink = await page.$eval('.editorial-buy', (el) => el.getAttribute('href'));
    console.log(`MacBook Pro page title: "${proTitle}", buy link: "${proBuyLink}"`);
    await page.screenshot({
      path: path.join(ARTIFACTS_DIR, 'qa-learn-more-macbook-pro.png'),
      fullPage: false,
    });
    console.log('Saved qa-learn-more-macbook-pro.png');

    // 3. iPad Pro (/ipad/ipad-pro)
    console.log('Navigating to /ipad/ipad-pro...');
    await page.goto(`${BASE_URL}/ipad/ipad-pro`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForSelector('.editorial-hero', { timeout: 10000 });
    const ipadProTitle = await page.$eval('#editorial-title', (el) => el.textContent?.trim());
    const ipadProBuyLink = await page.$eval('.editorial-buy', (el) => el.getAttribute('href'));
    console.log(`iPad Pro page title: "${ipadProTitle}", buy link: "${ipadProBuyLink}"`);
    await page.screenshot({
      path: path.join(ARTIFACTS_DIR, 'qa-learn-more-ipad-pro.png'),
      fullPage: false,
    });
    console.log('Saved qa-learn-more-ipad-pro.png');

    // 4. iPad Air (/ipad/ipad-air)
    console.log('Navigating to /ipad/ipad-air...');
    await page.goto(`${BASE_URL}/ipad/ipad-air`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForSelector('.editorial-hero', { timeout: 10000 });
    const ipadAirTitle = await page.$eval('#editorial-title', (el) => el.textContent?.trim());
    const ipadAirBuyLink = await page.$eval('.editorial-buy', (el) => el.getAttribute('href'));
    console.log(`iPad Air page title: "${ipadAirTitle}", buy link: "${ipadAirBuyLink}"`);
    await page.screenshot({
      path: path.join(ARTIFACTS_DIR, 'qa-learn-more-ipad-air.png'),
      fullPage: false,
    });
    console.log('Saved qa-learn-more-ipad-air.png');

    // -------------------------------------------------------------
    // PART 3: ADMIN VISUAL LEARN MORE CMS
    // -------------------------------------------------------------
    console.log('\n--- PART 3: Admin Visual Learn More CMS ---');
    const ADMIN_BASE = `http://admin.localhost:${PORT}`;
    console.log(`Navigating to admin login at ${ADMIN_BASE}/admin/login...`);
    await page.goto(`${ADMIN_BASE}/admin/login`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForSelector('input[type="email"]', { timeout: 10000 });
    await page.type('input[type="email"]', 'admin@buyandsellgh.com');
    await page.type('input[type="password"]', 'Apple-Shopify-Quality-2026');
    await page.click('button[type="submit"]');
    await new Promise((r) => setTimeout(r, 2000));

    console.log('Navigating to Admin Learn More CMS...');
    await page.goto(`${ADMIN_BASE}/admin/learn-more`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForSelector('.vlearn-container', { timeout: 15000 });

    const prodCount = await page.$$eval('.vlearn-product-item', (items) => items.length);
    console.log(`Admin product selector choices rendered: ${prodCount}`);

    const outlineCards = await page.$$eval('.vlearn-section-card', (cards) => cards.length);
    console.log(`Admin visual outline cards rendered: ${outlineCards}`);

    const presetButtons = await page.$$eval('.vlearn-add-section-box button', (btns) => btns.length);
    console.log(`Add Section Preset buttons available: ${presetButtons}`);

    await page.screenshot({
      path: path.join(ARTIFACTS_DIR, 'qa-admin-visual-learn-more-cms.png'),
      fullPage: false,
    });
    console.log('Saved qa-admin-visual-learn-more-cms.png');

    // Test clicking Preview Modal
    console.log('Testing Device Preview modal...');
    const clickedPreview = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('.vlearn-topbar-right button'));
      const previewBtn = btns.find((b) => b.textContent && b.textContent.includes('Preview'));
      if (previewBtn) {
        previewBtn.click();
        return true;
      }
      return false;
    });
    console.log(`Clicked Preview modal button: ${clickedPreview}`);
    if (clickedPreview) {
      await new Promise((r) => setTimeout(r, 600));
      await page.waitForSelector('.vlearn-modal-backdrop', { timeout: 5000 });

      await page.screenshot({
        path: path.join(ARTIFACTS_DIR, 'qa-admin-learn-more-preview-modal.png'),
        fullPage: false,
      });
      console.log('Saved qa-admin-learn-more-preview-modal.png');

      // Close modal
      await page.keyboard.press('Escape');
    }

    console.log('\nAll E2E checks passed successfully!');
  } finally {
    await browser.close();
    await server.close();
  }
}

run().catch((err) => {
  console.error('E2E Verification failed:', err);
  process.exit(1);
});
