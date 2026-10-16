import puppeteer from 'puppeteer-core';
import path from 'node:path';
import assert from 'node:assert/strict';

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const ARTIFACTS_DIR = 'C:\\Users\\akakp\\.gemini\\antigravity\\brain\\6c721dee-7d06-4a2d-92fb-b74a2b38f58f';
const LIVE_URL = 'https://buyandsellgh.com';

async function run() {
  console.log(`=== VERIFYING LIVE PRODUCTION DEPLOYMENT AT ${LIVE_URL} ===\n`);

  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const viewports = [
    { name: '320px', width: 320, height: 650, isMobile: true },
    { name: '375px', width: 375, height: 667, isMobile: true },
    { name: '390px', width: 390, height: 844, isMobile: true },
    { name: '430px', width: 430, height: 932, isMobile: true },
    { name: '1440px', width: 1440, height: 900, isMobile: false },
  ];

  for (const vp of viewports) {
    const page = await browser.newPage();
    await page.setViewport({ width: vp.width, height: vp.height, isMobile: vp.isMobile, hasTouch: vp.isMobile });
    if (vp.isMobile) {
      await page.setUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1');
    }

    // Bypass cache with a unique query param
    await page.goto(`${LIVE_URL}?_t=${Date.now()}`, { waitUntil: 'networkidle0', timeout: 60000 });
    await page.waitForSelector('.home-ref-iphone-18-pro');
    await page.waitForSelector('.home-ref-iphone-duo');
    await page.waitForSelector('.home-ref-services');

    const metrics = await page.evaluate(() => {
      function getMetrics(sel) {
        const el = document.querySelector(sel);
        const title = el?.querySelector('h1, h2');
        const subtitle = el?.querySelector('p');
        const actions = el?.querySelector('.home-ref-actions');
        const img = el?.querySelector('img');

        const titleBox = title?.getBoundingClientRect();
        const subBox = subtitle?.getBoundingClientRect();
        const actBox = actions?.getBoundingClientRect();
        const imgBox = img?.getBoundingClientRect();

        return {
          titleText: title?.textContent?.trim(),
          subText: subtitle?.textContent?.trim(),
          actBottom: actBox?.bottom,
          imgTop: imgBox?.top,
          imgBottom: imgBox?.bottom,
          imgLoaded: img?.complete && img?.naturalWidth > 0,
          gapActToImg: imgBox && actBox ? Math.round(imgBox.top - actBox.bottom) : null,
          imgWidth: imgBox ? Math.round(imgBox.width) : null,
          imgHeight: imgBox ? Math.round(imgBox.height) : null,
        };
      }

      // Check service flyers
      const flyers = Array.from(document.querySelectorAll('.home-ref-service-card img')).map(img => ({
        src: img.currentSrc || img.src,
        complete: img.complete,
        naturalWidth: img.naturalWidth,
        naturalHeight: img.naturalHeight,
      }));

      return {
        p18: getMetrics('.home-ref-iphone-18-pro'),
        duo: getMetrics('.home-ref-iphone-duo'),
        flyers,
      };
    });

    console.log(`--- Viewport ${vp.name} ---`);
    console.log(`iPhone 18 Pro:
  Title: "${metrics.p18.titleText}"
  Actions bottom: ${Math.round(metrics.p18.actBottom)}px
  Image top: ${Math.round(metrics.p18.imgTop)}px
  GAP: ${metrics.p18.gapActToImg}px
  Image size: ${metrics.p18.imgWidth}x${metrics.p18.imgHeight}px, loaded: ${metrics.p18.imgLoaded}`);

    console.log(`iPhone Duo:
  Title: "${metrics.duo.titleText}"
  Actions bottom: ${Math.round(metrics.duo.actBottom)}px
  Image top: ${Math.round(metrics.duo.imgTop)}px
  GAP: ${metrics.duo.gapActToImg}px
  Image size: ${metrics.duo.imgWidth}x${metrics.duo.imgHeight}px, loaded: ${metrics.duo.imgLoaded}`);

    console.log(`Service Flyers (${metrics.flyers.length} cards):`);
    for (const f of metrics.flyers) {
      console.log(`  ${path.basename(f.src)}: complete=${f.complete}, size=${f.naturalWidth}x${f.naturalHeight}`);
    }

    // Screenshots
    const p18Handle = await page.$('.home-ref-iphone-18-pro');
    if (p18Handle) {
      await p18Handle.screenshot({ path: path.join(ARTIFACTS_DIR, `live-verified-p18-${vp.name}.png`) });
    }
    const duoHandle = await page.$('.home-ref-iphone-duo');
    if (duoHandle) {
      await duoHandle.screenshot({ path: path.join(ARTIFACTS_DIR, `live-verified-duo-${vp.name}.png`) });
    }
    const servicesHandle = await page.$('.home-ref-services');
    if (servicesHandle) {
      await page.evaluate(() => document.querySelector('.home-ref-services').scrollIntoView());
      await new Promise(r => setTimeout(r, 1200));
      await servicesHandle.screenshot({ path: path.join(ARTIFACTS_DIR, `live-verified-services-${vp.name}.png`) });
    }
    console.log(`  Saved live screenshots for ${vp.name}\n`);

    await page.close();
  }

  await browser.close();
  console.log('=== ALL LIVE PRODUCTION CHECKS COMPLETED ===');
}

run().catch(err => {
  console.error('Live verification error:', err);
  process.exit(1);
});
