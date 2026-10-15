import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import puppeteer from 'puppeteer-core';
import assert from 'node:assert/strict';

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const ARTIFACTS_DIR = 'C:\\Users\\akakp\\.gemini\\antigravity\\brain\\6c721dee-7d06-4a2d-92fb-b74a2b38f58f';
const DIST_DIR = path.resolve('dist');

const mimeTypes = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.json': 'application/json',
};

function createStaticServer(port = 4547) {
  const server = http.createServer((req, res) => {
    let reqPath = req.url.split('?')[0];
    let filePath = path.join(DIST_DIR, reqPath === '/' ? 'index.html' : reqPath);

    if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
      filePath = path.join(DIST_DIR, 'index.html');
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = mimeTypes[ext] || 'application/octet-stream';

    fs.readFile(filePath, (err, content) => {
      if (err) {
        res.writeHead(500);
        res.end('Error loading file');
        return;
      }
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    });
  });

  return new Promise((resolve) => {
    server.listen(port, () => resolve(server));
  });
}

async function run() {
  console.log('=== TESTING LOCAL HERO SPACING ===');
  const server = await createStaticServer(4547);
  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const viewports = [
    { name: '320px', width: 320, height: 650 },
    { name: '375px', width: 375, height: 667 },
    { name: '390px', width: 390, height: 844 },
    { name: '430px', width: 430, height: 932 },
  ];

  for (const vp of viewports) {
    const page = await browser.newPage();
    await page.setViewport({ width: vp.width, height: vp.height, isMobile: true, hasTouch: true });
    await page.setUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15');

    await page.goto('http://localhost:4547', { waitUntil: 'networkidle0' });
    await page.waitForSelector('.home-ref-iphone-18-pro');
    await page.waitForSelector('.home-ref-iphone-duo');

    const metrics = await page.evaluate(() => {
      function getMetrics(sel) {
        const el = document.querySelector(sel);
        const title = el.querySelector('h1, h2');
        const subtitle = el.querySelector('p');
        const actions = el.querySelector('.home-ref-actions');
        const img = el.querySelector('img');

        const titleBox = title?.getBoundingClientRect();
        const subBox = subtitle?.getBoundingClientRect();
        const actBox = actions?.getBoundingClientRect();
        const imgBox = img?.getBoundingClientRect();

        return {
          titleText: title?.textContent?.trim(),
          subText: subtitle?.textContent?.trim(),
          titleBottom: titleBox?.bottom,
          subTop: subBox?.top,
          subBottom: subBox?.bottom,
          actTop: actBox?.top,
          actBottom: actBox?.bottom,
          imgTop: imgBox?.top,
          imgBottom: imgBox?.bottom,
          imgLoaded: img?.complete && img?.naturalWidth > 0,
          gapActToImg: imgBox && actBox ? Math.round(imgBox.top - actBox.bottom) : null,
          imgWidth: imgBox ? Math.round(imgBox.width) : null,
          imgHeight: imgBox ? Math.round(imgBox.height) : null,
        };
      }

      return {
        p18: getMetrics('.home-ref-iphone-18-pro'),
        duo: getMetrics('.home-ref-iphone-duo')
      };
    });

    console.log(`\n--- Viewport ${vp.name} ---`);
    console.log(`iPhone 18 Pro:
  Title: "${metrics.p18.titleText}"
  Subtitle: "${metrics.p18.subText}"
  Actions bottom: ${Math.round(metrics.p18.actBottom)}px
  Image top: ${Math.round(metrics.p18.imgTop)}px
  GAP: ${metrics.p18.gapActToImg}px (Buttons to artwork)
  Image size: ${metrics.p18.imgWidth}x${metrics.p18.imgHeight}px, loaded: ${metrics.p18.imgLoaded}`);

    assert.ok(metrics.p18.gapActToImg >= 20, `iPhone 18 Pro gap must be >= 20px, got ${metrics.p18.gapActToImg}`);
    assert.ok(metrics.p18.actBottom < metrics.p18.imgTop, 'iPhone 18 Pro actions must never overlap artwork');

    console.log(`iPhone Duo:
  Title: "${metrics.duo.titleText}"
  Subtitle: "${metrics.duo.subText}"
  Actions bottom: ${Math.round(metrics.duo.actBottom)}px
  Image top: ${Math.round(metrics.duo.imgTop)}px
  GAP: ${metrics.duo.gapActToImg}px (Buttons to artwork)
  Image size: ${metrics.duo.imgWidth}x${metrics.duo.imgHeight}px, loaded: ${metrics.duo.imgLoaded}`);

    assert.ok(metrics.duo.gapActToImg >= 24, `iPhone Duo gap must be >= 24px, got ${metrics.duo.gapActToImg}`);
    assert.ok(metrics.duo.actBottom < metrics.duo.imgTop, 'iPhone Duo actions must never overlap artwork');

    // Capture screenshots for 320px and 375px
    if (vp.name === '320px' || vp.name === '375px') {
      const p18Handle = await page.$('.home-ref-iphone-18-pro');
      if (p18Handle) {
        await p18Handle.screenshot({ path: path.join(ARTIFACTS_DIR, `qa-hero-iphone18-${vp.name}.png`) });
      }
      const duoHandle = await page.$('.home-ref-iphone-duo');
      if (duoHandle) {
        await duoHandle.screenshot({ path: path.join(ARTIFACTS_DIR, `qa-hero-duo-${vp.name}.png`) });
      }
      console.log(`  Saved QA screenshots for ${vp.name}`);
    }

    await page.close();
  }

  await browser.close();
  server.close();
  console.log('\n=== ALL HERO SPACING QA CHECKS PASSED ===');
}

run().catch((err) => {
  console.error('QA Error:', err);
  process.exit(1);
});
