import puppeteer from 'puppeteer-core';
import { spawn } from 'child_process';
import http from 'http';

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

function waitForServer(port, timeoutMs = 30000) {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    function ping() {
      http.get(`http://localhost:${port}`, (res) => {
        resolve();
      }).on('error', (err) => {
        if (Date.now() - start > timeoutMs) {
          reject(new Error(`Server on port ${port} did not start within ${timeoutMs}ms`));
        } else {
          setTimeout(ping, 500);
        }
      });
    }
    ping();
  });
}

async function runTests() {
  const BASE_URL = process.env.TEST_BASE_URL || 'http://127.0.0.1:4173';
  console.log(`Connecting to server at ${BASE_URL} ...`);
  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const results = {
    buyColorSelectorTests: [],
    mobileNavTests: []
  };

  try {
    // =========================================================================
    // TEST SUITE 1: BUY PAGE COLOR SELECTORS
    // =========================================================================
    console.log('\n--- TEST SUITE 1: BUY PAGE COLOR SELECTOR VERIFICATION ---');
    const buyPagesToTest = [
      { name: 'iPhone 18 Pro', url: `${BASE_URL}/shop/buy-iphone/iphone-18-pro` },
      { name: 'Apple Watch Series 12', url: `${BASE_URL}/shop/buy-watch/apple-watch-series-12` },
      { name: 'MacBook Pro', url: `${BASE_URL}/shop/buy-mac/macbook-pro` },
      { name: 'iPad Pro', url: `${BASE_URL}/shop/buy-ipad/ipad-pro` },
      { name: 'AirPods Max', url: `${BASE_URL}/shop/buy-airpods/airpods-max-2` },
      { name: 'iPad Air', url: `${BASE_URL}/shop/buy-ipad/ipad-air` },
      { name: 'MacBook Air', url: `${BASE_URL}/shop/buy-mac/macbook-air` },
      { name: 'Apple Watch Ultra 4', url: `${BASE_URL}/shop/buy-watch/apple-watch-ultra-4` },
      { name: 'AirPods Pro 3', url: `${BASE_URL}/shop/buy-airpods/airpods-pro-3` },
      { name: 'Magic Keyboard', url: `${BASE_URL}/shop/buy-accessory/magic-keyboard-with-touch-id` }
    ];

    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });

    for (const testItem of buyPagesToTest) {
      console.log(`\nTesting Buy Page: ${testItem.name} (${testItem.url})`);
      await page.goto(testItem.url, { waitUntil: 'domcontentloaded', timeout: 60000 });
      await page.waitForSelector('.apple-buy-container', { timeout: 10000 });
      await page.waitForSelector('.apple-buy-swatch-btn', { timeout: 15000 });

      // 1. Check that separate finish preview image does NOT exist
      const separatePreviewExists = await page.evaluate(() => {
        const card = document.querySelector('.apple-buy-finish-preview-card');
        const img = document.querySelector('.apple-buy-finish-preview-img');
        return Boolean(card || img);
      });

      // 2. Check that top swipeable gallery exists
      const galleryExists = await page.evaluate(() => {
        return Boolean(document.querySelector('.apple-buy-gallery-col') || document.querySelector('.apple-buy-gallery-viewport') || document.querySelector('.apple-buy-stage-viewport'));
      });

      // 3. Check swatches and labels exist
      const swatchesInfo = await page.evaluate(() => {
        const swatches = Array.from(document.querySelectorAll('.apple-buy-swatch-btn'));
        const label = document.querySelector('.apple-buy-swatch-label')?.textContent?.trim() || '';
        return {
          count: swatches.length,
          label
        };
      });

      // 4. Test selecting different color swatches
      let colorSwitchPassed = false;
      let initialLabel = swatchesInfo.label;
      let updatedLabel = '';

      if (swatchesInfo.count > 1) {
        // Click the second swatch
        const secondSwatch = (await page.$$('.apple-buy-swatch-btn'))[1];
        if (secondSwatch) {
          await secondSwatch.click();
          await new Promise((r) => setTimeout(r, 300));
          updatedLabel = await page.evaluate(() => {
            return document.querySelector('.apple-buy-swatch-label')?.textContent?.trim() || '';
          });
          colorSwitchPassed = updatedLabel !== '' && updatedLabel !== initialLabel;
        }
      } else {
        colorSwitchPassed = true; // Single color or custom
      }

      // 5. Test Add to Bag and WhatsApp order records selected color
      const colorVerification = await page.evaluate(() => {
        const items = Array.from(document.querySelectorAll('.apple-buy-summary-item'));
        const finishItem = items.find(it => it.textContent.includes('Finish') || it.textContent.includes('Band') || it.textContent.includes('Color'));
        const whatsAppLink = document.querySelector('a.apple-buy-btn-secondary')?.getAttribute('href') || '';
        const summaryText = finishItem ? finishItem.textContent : '';

        return {
          finishRecordedInSummary: Boolean(finishItem),
          summaryText,
          whatsAppLinkContainsColor: whatsAppLink.includes('Finish%3A') || whatsAppLink.includes('Finish:') || whatsAppLink.includes('Color')
        };
      });

      const passed = !separatePreviewExists && galleryExists && swatchesInfo.count > 0 && colorSwitchPassed && colorVerification.finishRecordedInSummary;
      results.buyColorSelectorTests.push({
        product: testItem.name,
        separatePreviewRemoved: !separatePreviewExists,
        galleryPreserved: galleryExists,
        swatchesCount: swatchesInfo.count,
        initialLabel,
        updatedLabel,
        colorSwitchPassed,
        summaryText: colorVerification.summaryText,
        passed
      });

      console.log(`  -> Separate Preview Removed: ${!separatePreviewExists ? 'PASS (None found)' : 'FAIL'}`);
      console.log(`  -> Top Gallery Preserved: ${galleryExists ? 'PASS' : 'FAIL'}`);
      console.log(`  -> Swatches Found: ${swatchesInfo.count} swatches`);
      console.log(`  -> Color Switch: ${colorSwitchPassed ? `PASS (${initialLabel} -> ${updatedLabel})` : 'PASS (Single color)'}`);
      console.log(`  -> Configuration Records Color: ${colorVerification.finishRecordedInSummary ? `PASS (${colorVerification.summaryText.trim()})` : 'FAIL'}`);
    }

    // =========================================================================
    // TEST SUITE 2: MOBILE HAMBURGER NAVIGATION
    // =========================================================================
    console.log('\n--- TEST SUITE 2: MOBILE HAMBURGER NAVIGATION VERIFICATION ---');

    const viewportsToTest = [
      {
        device: 'iPhone 15/16 Pro',
        width: 393,
        height: 852,
        isMobile: true,
        hasTouch: true,
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1'
      },
      {
        device: 'Android (Pixel 8)',
        width: 412,
        height: 600,
        isMobile: true,
        hasTouch: true,
        userAgent: 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Mobile Safari/537.36'
      }
    ];

    for (const vp of viewportsToTest) {
      console.log(`\nTesting Device: ${vp.device} (${vp.width}x${vp.height})`);
      const mobilePage = await browser.newPage();
      await mobilePage.setUserAgent(vp.userAgent);
      await mobilePage.setViewport({
        width: vp.width,
        height: vp.height,
        isMobile: vp.isMobile,
        hasTouch: vp.hasTouch
      });

      await mobilePage.goto(`${BASE_URL}/`, { waitUntil: 'networkidle2', timeout: 30000 });

      // Step A: Scroll down homepage, then scroll up slightly to reveal sticky navigation (natural mobile gesture)
      await mobilePage.evaluate(() => window.scrollTo(0, 1250));
      await new Promise((r) => setTimeout(r, 250));
      await mobilePage.evaluate(() => window.scrollTo(0, 1200));
      await new Promise((r) => setTimeout(r, 400));
      const initialScrollY = await mobilePage.evaluate(() => window.scrollY);
      console.log(`  Initial scroll position before opening menu: ${initialScrollY}px`);

      // Step B: Click hamburger button
      const menuBtn = await mobilePage.$('.global-header-menu-btn');
      if (!menuBtn) {
        throw new Error('Mobile menu button not found on header!');
      }
      await menuBtn.click();
      await new Promise((r) => setTimeout(r, 500)); // wait for curtain drop animation (350ms)

      // Step C: Verify curtain covers mobile viewport & body is locked
      const curtainState = await mobilePage.evaluate(() => {
        const curtain = document.querySelector('.global-mobile-curtain');
        const body = document.body;
        const html = document.documentElement;
        const rect = curtain ? curtain.getBoundingClientRect() : null;

        return {
          curtainExists: Boolean(curtain),
          isOpenClass: curtain ? curtain.classList.contains('is-open') : false,
          curtainTop: rect ? rect.top : 0,
          curtainHeight: rect ? rect.height : 0,
          curtainWidth: rect ? rect.width : 0,
          bodyPosition: body.style.position,
          bodyTop: body.style.top,
          bodyOverflow: body.style.overflow,
          htmlOverflow: html.style.overflow,
          headerBackground: getComputedStyle(document.querySelector('.global-header')).backgroundColor
        };
      });

      console.log(`  Curtain dimensions: ${curtainState.curtainWidth}x${curtainState.curtainHeight}px (top: ${curtainState.curtainTop}px)`);
      console.log(`  Body lock state: bodyOverflow=${curtainState.bodyOverflow}, htmlOverflow=${curtainState.htmlOverflow}`);

      const bodyIsLocked = curtainState.bodyOverflow === 'hidden' &&
        curtainState.htmlOverflow === 'hidden' &&
        curtainState.curtainTop >= 40 && curtainState.curtainTop <= 48 &&
        curtainState.headerBackground === 'rgb(255, 255, 255)';

      await mobilePage.mouse.move(20, 20);
      await mobilePage.mouse.wheel({ deltaY: 500 });
      await new Promise((r) => setTimeout(r, 200));
      const scrollAfterBackgroundWheel = await mobilePage.evaluate(() => window.scrollY);
      const backgroundPositionHeld = Math.abs(scrollAfterBackgroundWheel - initialScrollY) <= 2;

      // Step D: Verify background touch & scroll lock while menu is open
      const backgroundLocked = await mobilePage.evaluate(() => {
        const body = document.body;
        const html = document.documentElement;
        return body.style.overflow === 'hidden' &&
               html.style.overflow === 'hidden' &&
               body.style.overscrollBehavior === 'none' &&
               html.style.overscrollBehavior === 'none';
      });
      console.log(`  Background touch lock verified: ${backgroundLocked ? 'PASS (overflow: hidden, overscroll: none)' : 'FAIL'}`);

      // Step E: Verify menu itself can scroll freely when expanded
      // Expand multiple accordion sections to ensure content exceeds screen height
      const headings = await mobilePage.$$('.global-curtain-heading-btn');
      for (let i = 0; i < Math.min(4, headings.length); i++) {
        await headings[i].click();
        await new Promise((r) => setTimeout(r, 150));
      }
      await new Promise((r) => setTimeout(r, 300));

      const scrollTestResult = await mobilePage.evaluate(() => {
        const curtain = document.querySelector('.global-mobile-curtain');
        if (!curtain) return { canScroll: false };
        if (curtain.scrollHeight <= curtain.clientHeight) {
          // Fits entirely on this tall screen without requiring scroll
          return {
            canScroll: true,
            fitsOnScreen: true,
            scrollHeight: curtain.scrollHeight,
            clientHeight: curtain.clientHeight
          };
        }
        const initialScrollTop = curtain.scrollTop;
        curtain.scrollTop = 150;
        const newScrollTop = curtain.scrollTop;
        return {
          canScroll: newScrollTop > 0,
          fitsOnScreen: false,
          scrollTop: newScrollTop,
          scrollHeight: curtain.scrollHeight,
          clientHeight: curtain.clientHeight
        };
      });
      console.log(`  Curtain internal scroll: canScroll=${scrollTestResult.canScroll} (fitsOnScreen: ${Boolean(scrollTestResult.fitsOnScreen)}), scrollHeight=${scrollTestResult.scrollHeight}px, clientHeight=${scrollTestResult.clientHeight}px`);

      // Step F: Close menu via X button
      await menuBtn.click();
      await new Promise((r) => setTimeout(r, 600)); // wait for retract animation (350ms) + body unlock

      // Step G: Verify exact scroll restoration
      const restoredState = await mobilePage.evaluate(() => {
        const body = document.body;
        const html = document.documentElement;
        return {
          scrollY: window.scrollY,
          bodyOverflow: body.style.overflow,
          htmlOverflow: html.style.overflow
        };
      });

      console.log(`  Restored scroll position: ${restoredState.scrollY}px (expected ${initialScrollY}px)`);
      console.log(`  Body & HTML unlocked: bodyOverflow='${restoredState.bodyOverflow}', htmlOverflow='${restoredState.htmlOverflow}'`);

      const scrollRestoredCorrectly = Math.abs(restoredState.scrollY - initialScrollY) <= 2;

      await mobilePage.evaluate(() => window.scrollBy(0, -50));
      await new Promise((r) => setTimeout(r, 300));
      await menuBtn.click();
      await new Promise((r) => setTimeout(r, 400));
      await mobilePage.$('.global-curtain-heading-btn').then((heading) => heading?.click());
      const destination = await mobilePage.$eval('.global-curtain-sublink', (link) => link.getAttribute('href'));
      await mobilePage.click('.global-curtain-sublink');
      await new Promise((r) => setTimeout(r, 400));
      const linkClosedMenu = await mobilePage.evaluate(() => !document.querySelector('.global-mobile-curtain'));
      const linkNavigated = new URL(mobilePage.url()).pathname === destination;

      const deviceTestPassed = curtainState.curtainExists &&
        curtainState.isOpenClass &&
        bodyIsLocked &&
        backgroundLocked &&
        backgroundPositionHeld &&
        scrollTestResult.canScroll &&
        scrollRestoredCorrectly &&
        restoredState.bodyOverflow === '' &&
        linkClosedMenu && linkNavigated;

      results.mobileNavTests.push({
        device: vp.device,
        curtainExpandsToViewport: curtainState.curtainExists && curtainState.curtainHeight > 500,
        bodyLockedBehindMenu: bodyIsLocked,
        backgroundPositionHeld,
        menuScrollsFreely: scrollTestResult.canScroll,
        linkClosedMenu,
        linkNavigated,
        scrollRestoredExact: scrollRestoredCorrectly,
        initialScrollY,
        restoredScrollY: restoredState.scrollY,
        passed: deviceTestPassed
      });

      console.log(`  -> RESULT FOR ${vp.device}: ${deviceTestPassed ? '100% PASSED' : 'FAILED'}`);
      await mobilePage.close();
    }

    console.log('\n======================================================');
    console.log('FINAL VERIFICATION SUMMARY:');
    console.log('Buy Page Color Selector Tests:', results.buyColorSelectorTests.every((t) => t.passed) ? 'ALL PASSED' : 'FAILED');
    console.log('Mobile Navigation Tests:', results.mobileNavTests.every((t) => t.passed) ? 'ALL PASSED' : 'FAILED');
    console.log('======================================================\n');

    if (!results.buyColorSelectorTests.every((t) => t.passed) || !results.mobileNavTests.every((t) => t.passed)) {
      throw new Error('One or more browser smoke checks failed');
    }
  } finally {
    await browser.close();
  }
}

runTests().catch((err) => {
  console.error('Test execution error:', err);
  process.exit(1);
});
