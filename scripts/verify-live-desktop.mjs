import puppeteer from 'puppeteer-core';
import path from 'node:path';

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const ARTIFACTS_DIR = 'C:\\Users\\akakp\\.gemini\\antigravity\\brain\\6c721dee-7d06-4a2d-92fb-b74a2b38f58f';
const LIVE_URL = 'https://buyandsellgh.com';

async function run() {
  console.log(`=== VERIFYING LIVE PRODUCTION DESKTOP AT ${LIVE_URL} ===\n`);

  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const viewports = [
    { name: '1024px', width: 1024, height: 768 },
    { name: '1280px', width: 1280, height: 800 },
    { name: '1440px', width: 1440, height: 900 },
    { name: '1920px', width: 1920, height: 1080 },
  ];

  for (const vp of viewports) {
    const page = await browser.newPage();
    await page.setViewport({ width: vp.width, height: vp.height, isMobile: false });
    await page.goto(`${LIVE_URL}?_t=${Date.now()}`, { waitUntil: 'networkidle0', timeout: 60000 });
    await page.waitForSelector('.home-ref-iphone-18-pro');
    await page.waitForSelector('.home-ref-iphone-duo');

    const metrics = await page.evaluate(() => {
      function getMetrics(sel) {
        const hero = document.querySelector(sel);
        const actions = hero.querySelector('.home-ref-actions');
        const img = hero.querySelector('img');
        const heroRect = hero.getBoundingClientRect();
        const actionsRect = actions.getBoundingClientRect();
        const imgRect = img.getBoundingClientRect();

        return {
          heroHeight: Math.round(heroRect.height),
          actionsBottom: Math.round(actionsRect.bottom - heroRect.top),
          imgTop: Math.round(imgRect.top - heroRect.top),
          imgBottom: Math.round(imgRect.bottom - heroRect.top),
          imgWidth: Math.round(imgRect.width),
          imgHeight: Math.round(imgRect.height),
          gapBetweenButtonsAndImage: Math.round(imgRect.top - actionsRect.bottom),
        };
      }

      return {
        p18: getMetrics('.home-ref-iphone-18-pro'),
        duo: getMetrics('.home-ref-iphone-duo'),
      };
    });

    console.log(`--- Live Viewport ${vp.name} ---`);
    console.log(`iPhone 18 Pro:
  Hero height: ${metrics.p18.heroHeight}px
  Buttons bottom: ${metrics.p18.actionsBottom}px
  Image top: ${metrics.p18.imgTop}px
  GAP: ${metrics.p18.gapBetweenButtonsAndImage}px
  Image size: ${metrics.p18.imgWidth}x${metrics.p18.imgHeight}px`);

    console.log(`iPhone Duo:
  Hero height: ${metrics.duo.heroHeight}px
  Buttons bottom: ${metrics.duo.actionsBottom}px
  Image top: ${metrics.duo.imgTop}px
  GAP: ${metrics.duo.gapBetweenButtonsAndImage}px
  Image size: ${metrics.duo.imgWidth}x${metrics.duo.imgHeight}px`);

    // Screenshots
    const p18El = await page.$('.home-ref-iphone-18-pro');
    if (p18El) {
      await p18El.screenshot({ path: path.join(ARTIFACTS_DIR, `live-desktop-p18-${vp.name}.png`) });
    }
    const duoEl = await page.$('.home-ref-iphone-duo');
    if (duoEl) {
      await duoEl.screenshot({ path: path.join(ARTIFACTS_DIR, `live-desktop-duo-${vp.name}.png`) });
    }

    if (vp.name === '1440px') {
      await page.screenshot({
        path: path.join(ARTIFACTS_DIR, 'live-desktop-both-heroes-1440px.png'),
        clip: { x: 0, y: 0, width: 1440, height: 1500 },
      });
    }

    console.log(`  Saved live screenshots for ${vp.name}\n`);
    await page.close();
  }

  // Check mobile 390px on live site
  console.log('--- Checking Live Mobile 390px ---');
  const mobPage = await browser.newPage();
  await mobPage.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
  await mobPage.setUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1');
  await mobPage.goto(`${LIVE_URL}?_t=${Date.now()}`, { waitUntil: 'networkidle0', timeout: 60000 });
  await mobPage.waitForSelector('.home-ref-iphone-18-pro');
  await mobPage.waitForSelector('.home-ref-iphone-duo');

  const mobMetrics = await mobPage.evaluate(() => {
    function getMetrics(sel) {
      const hero = document.querySelector(sel);
      const actions = hero.querySelector('.home-ref-actions');
      const img = hero.querySelector('img');
      const actionsRect = actions.getBoundingClientRect();
      const imgRect = img.getBoundingClientRect();
      return {
        gap: Math.round(imgRect.top - actionsRect.bottom),
        imgWidth: Math.round(imgRect.width),
        imgHeight: Math.round(imgRect.height),
      };
    }
    return {
      p18: getMetrics('.home-ref-iphone-18-pro'),
      duo: getMetrics('.home-ref-iphone-duo'),
    };
  });

  console.log(`Mobile 390px iPhone 18 Pro Gap: ${mobMetrics.p18.gap}px, Image: ${mobMetrics.p18.imgWidth}x${mobMetrics.p18.imgHeight}px`);
  console.log(`Mobile 390px iPhone Duo Gap: ${mobMetrics.duo.gap}px, Image: ${mobMetrics.duo.imgWidth}x${mobMetrics.duo.imgHeight}px`);

  const p18Mob = await mobPage.$('.home-ref-iphone-18-pro');
  if (p18Mob) {
    await p18Mob.screenshot({ path: path.join(ARTIFACTS_DIR, 'live-mobile-p18-390px.png') });
  }
  const duoMob = await mobPage.$('.home-ref-iphone-duo');
  if (duoMob) {
    await duoMob.screenshot({ path: path.join(ARTIFACTS_DIR, 'live-mobile-duo-390px.png') });
  }

  await mobPage.close();
  await browser.close();
  console.log('\n=== ALL LIVE PRODUCTION CHECKS COMPLETED ===');
}

run().catch(console.error);
