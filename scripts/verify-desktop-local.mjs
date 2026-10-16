import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import puppeteer from 'puppeteer-core';

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const ARTIFACTS_DIR = 'C:\\Users\\akakp\\.gemini\\antigravity\\brain\\6c721dee-7d06-4a2d-92fb-b74a2b38f58f';
const DIST_DIR = path.resolve('dist');

const mimeTypes = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
};

function createStaticServer(port = 4578) {
  const server = http.createServer((req, res) => {
    let reqPath = req.url.split('?')[0];
    let filePath = path.join(DIST_DIR, reqPath === '/' ? 'index.html' : reqPath);
    if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
      filePath = path.join(DIST_DIR, 'index.html');
    }
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
    fs.createReadStream(filePath).pipe(res);
  });
  return new Promise(resolve => server.listen(port, () => resolve(server)));
}

async function run() {
  const server = await createStaticServer(4578);
  const browser = await puppeteer.launch({ executablePath: EDGE_PATH, headless: true });

  const desktopViewports = [
    { name: '1024px', width: 1024, height: 768 },
    { name: '1280px', width: 1280, height: 800 },
    { name: '1440px', width: 1440, height: 900 },
    { name: '1920px', width: 1920, height: 1080 },
  ];

  for (const vp of desktopViewports) {
    const page = await browser.newPage();
    await page.setViewport({ width: vp.width, height: vp.height });
    await page.goto('http://localhost:4578', { waitUntil: 'networkidle0' });
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

    console.log(`\n=== Desktop Viewport ${vp.name} ===`);
    console.log(`iPhone 18 Pro:
  Hero height: ${metrics.p18.heroHeight}px
  Buttons bottom: ${metrics.p18.actionsBottom}px
  Image top: ${metrics.p18.imgTop}px
  GAP (Buttons -> Image Top): ${metrics.p18.gapBetweenButtonsAndImage}px
  Image size: ${metrics.p18.imgWidth}x${metrics.p18.imgHeight}px`);

    console.log(`iPhone Duo:
  Hero height: ${metrics.duo.heroHeight}px
  Buttons bottom: ${metrics.duo.actionsBottom}px
  Image top: ${metrics.duo.imgTop}px
  GAP (Buttons -> Image Top): ${metrics.duo.gapBetweenButtonsAndImage}px
  Image size: ${metrics.duo.imgWidth}x${metrics.duo.imgHeight}px`);

    // Screenshots
    const p18El = await page.$('.home-ref-iphone-18-pro');
    if (p18El) {
      await p18El.screenshot({ path: path.join(ARTIFACTS_DIR, `after-desktop-p18-${vp.name}.png`) });
    }
    const duoEl = await page.$('.home-ref-iphone-duo');
    if (duoEl) {
      await duoEl.screenshot({ path: path.join(ARTIFACTS_DIR, `after-desktop-duo-${vp.name}.png`) });
    }

    // Both sections together (for 1440px)
    if (vp.name === '1440px') {
      await page.screenshot({
        path: path.join(ARTIFACTS_DIR, 'after-desktop-both-heroes-1440px.png'),
        clip: { x: 0, y: 0, width: 1440, height: 1500 },
      });
    }

    await page.close();
  }

  // Also verify mobile 390px to confirm ZERO mobile regression
  console.log('\n=== Checking Mobile 390px for Regressions ===');
  const mobPage = await browser.newPage();
  await mobPage.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
  await mobPage.goto('http://localhost:4578', { waitUntil: 'networkidle0' });
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
    await p18Mob.screenshot({ path: path.join(ARTIFACTS_DIR, 'verify-mobile-preserved-p18-390px.png') });
  }
  const duoMob = await mobPage.$('.home-ref-iphone-duo');
  if (duoMob) {
    await duoMob.screenshot({ path: path.join(ARTIFACTS_DIR, 'verify-mobile-preserved-duo-390px.png') });
  }

  await mobPage.close();
  await browser.close();
  server.close();
  console.log('\nDone verifying desktop & mobile!');
}

run().catch(console.error);
