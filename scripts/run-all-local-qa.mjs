import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import puppeteer from "puppeteer-core";
import assert from "node:assert/strict";

const EDGE_PATH = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const ARTIFACTS_DIR = "C:\\Users\\akakp\\.gemini\\antigravity\\brain\\6c721dee-7d06-4a2d-92fb-b74a2b38f58f";
const DIST_DIR = path.resolve("dist");

const mimeTypes = {
  ".html": "text/html",
  ".js": "application/javascript",
  ".css": "text/css",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".json": "application/json",
};

function createStaticServer(port = 4545) {
  const server = http.createServer((req, res) => {
    let reqPath = req.url.split("?")[0];
    if (reqPath === "/") reqPath = "/index.html";

    let filePath = path.join(DIST_DIR, reqPath);
    if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
      filePath = path.join(DIST_DIR, "index.html");
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = mimeTypes[ext] || "application/octet-stream";

    fs.readFile(filePath, (err, content) => {
      if (err) {
        res.writeHead(500);
        res.end("Internal Server Error");
      } else {
        res.writeHead(200, { "Content-Type": contentType });
        res.end(content);
      }
    });
  });

  return new Promise((resolve) => {
    server.listen(port, "127.0.0.1", () => {
      resolve({
        server,
        url: `http://127.0.0.1:${port}`,
        close: () => new Promise((cb) => server.close(cb)),
      });
    });
  });
}

async function main() {
  console.log("=== RUNNING FULL QA VERIFICATION ON COMPILED BUILD ===");
  const { server, url, close } = await createStaticServer(4545);

  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const page = await browser.newPage();

    // 1. TEST HOMEPAGE HEROES ACROSS VIEWPORTS
    console.log("\n--- [TEST 1] Homepage Heroes & AirPods Pro 3 Across Viewports ---");
    const viewports = [
      { name: "320px", width: 320, height: 640 },
      { name: "375px", width: 375, height: 667 },
      { name: "390px", width: 390, height: 844 },
      { name: "430px", width: 430, height: 932 },
      { name: "1280px", width: 1280, height: 800 },
      { name: "1440px", width: 1440, height: 900 },
      { name: "1920px", width: 1920, height: 1080 },
    ];

    for (const vp of viewports) {
      await page.setViewport({ width: vp.width, height: vp.height, isMobile: vp.width < 800 });
      await page.goto(`${url}/`, { waitUntil: "domcontentloaded", timeout: 30000 });
      await page.waitForSelector(".home-ref-airpods-pro-3", { timeout: 15000 });

      // Scroll sections into view and decode images
      const sections = ['iphone-18-pro', 'iphone-duo', 'watch-ultra-4', 'airpods-pro-3'];
      const metrics = {};

      for (const name of sections) {
        const secHandle = await page.$(`.home-ref-${name}`);
        if (!secHandle) continue;
        await secHandle.evaluate((el) => el.scrollIntoView({ block: 'center' }));
        await new Promise((r) => setTimeout(r, 150));

        const secData = await secHandle.evaluate(async (el) => {
          const h = el.querySelector('h1, h2');
          const actions = el.querySelector('.home-ref-actions');
          const img = el.querySelector('img');
          if (img) {
            img.loading = 'eager';
            await img.decode().catch(() => {});
          }

          const elRect = el.getBoundingClientRect();
          const hRect = h?.getBoundingClientRect();
          const aRect = actions?.getBoundingClientRect();
          const imgRect = img?.getBoundingClientRect();

          return {
            headingTop: hRect ? Math.round(hRect.top - elRect.top) : null,
            actionsBottom: aRect ? Math.round(aRect.bottom - elRect.top) : null,
            imgTop: imgRect ? Math.round(imgRect.top - elRect.top) : null,
            gapActionsToImg: (imgRect && aRect) ? Math.round(imgRect.top - aRect.bottom) : null,
            imgLoaded: img?.complete && (img?.naturalWidth || 0) > 0,
            hasOverflow: document.documentElement.scrollWidth > window.innerWidth,
          };
        });

        metrics[name] = secData;
      }

      console.log(`Viewport ${vp.name}:`);
      console.log(`  iPhone 18 Pro: gap actions-to-img = ${metrics['iphone-18-pro'].gapActionsToImg}px, imgLoaded = ${metrics['iphone-18-pro'].imgLoaded}`);
      console.log(`  iPhone Duo: gap actions-to-img = ${metrics['iphone-duo'].gapActionsToImg}px, imgLoaded = ${metrics['iphone-duo'].imgLoaded}`);
      console.log(`  Watch Ultra 4: gap actions-to-img = ${metrics['watch-ultra-4'].gapActionsToImg}px, imgLoaded = ${metrics['watch-ultra-4'].imgLoaded}`);
      console.log(`  AirPods Pro 3: gap actions-to-img = ${metrics['airpods-pro-3'].gapActionsToImg}px, imgLoaded = ${metrics['airpods-pro-3'].imgLoaded}`);

      assert.equal(metrics['iphone-18-pro'].hasOverflow, false, `Overflow detected at ${vp.name}`);
      assert.equal(metrics['airpods-pro-3'].imgLoaded, true, `AirPods Pro 3 image failed to load at ${vp.name}`);

      // At desktop (1440px), check AirPods Pro 3: copy is at top, image underneath!
      if (vp.width === 1440) {
        assert(metrics['airpods-pro-3'].gapActionsToImg >= 0, "AirPods Pro 3 desktop actions must be above image");
        console.log("  PASS: AirPods Pro 3 Desktop layout has heading & buttons at top, image underneath!");
      }

      // Capture screenshots for 390px (mobile) and 1440px (desktop)
      if (vp.name === "390px") {
        for (const name of sections) {
          const elHandle = await page.$(`.home-ref-${name}`);
          await elHandle.scrollIntoView({ block: 'center' });
          await new Promise((r) => setTimeout(r, 200));
          await elHandle.screenshot({ path: path.join(ARTIFACTS_DIR, `qa-hero-${name}-390px.png`) });
        }
      } else if (vp.name === "1440px") {
        const airpodsHandle = await page.$('.home-ref-airpods-pro-3');
        await airpodsHandle.scrollIntoView({ block: 'center' });
        await new Promise((r) => setTimeout(r, 200));
        await airpodsHandle.screenshot({ path: path.join(ARTIFACTS_DIR, 'qa-airpods-pro-3-desktop-1440px.png') });
      }
    }

    // 2. TEST LEARN MORE PAGES
    console.log("\n--- [TEST 2] Learn More Pages Functionality & Integrity ---");
    await page.setViewport({ width: 390, height: 844, isMobile: true });
    for (const [route, label] of [
      ['/iphone/iphone-18-pro', 'iPhone 18 Pro'],
      ['/mac-studio', 'Mac Studio'],
    ]) {
      await page.goto(`${url}${route}`, { waitUntil: "domcontentloaded", timeout: 30000 });
      await new Promise((r) => setTimeout(r, 800));

      const pageCheck = await page.evaluate(async () => {
        const h1 = document.querySelector('h1')?.textContent?.trim();
        const images = Array.from(document.querySelectorAll('img'));
        for (const img of images) {
          img.loading = 'eager';
          await img.decode().catch(() => {});
        }
        const brokenImages = images.filter((img) => !img.complete || img.naturalWidth === 0).map((i) => i.src);
        const hasOverflow = document.documentElement.scrollWidth > window.innerWidth;
        return { h1, imageCount: images.length, brokenImages, hasOverflow };
      });

      console.log(`Page ${route} (${label}):`);
      console.log(`  H1: "${pageCheck.h1}", Images: ${pageCheck.imageCount}, Broken Images: ${pageCheck.brokenImages.length}`);
      assert.equal(pageCheck.hasOverflow, false, `Overflow on ${route}`);
      assert.equal(pageCheck.brokenImages.length, 0, `Broken images on ${route}: ${pageCheck.brokenImages.join(', ')}`);
    }

    // 3. TEST ADMIN NAVIGATION CLEANUP
    console.log("\n--- [TEST 3] Admin Navigation & Redirection ---");
    await page.goto(`http://admin.localhost:4545/admin/login`, { waitUntil: "domcontentloaded", timeout: 15000 });
    await page.evaluate(() => {
      localStorage.setItem('buyandsell-gh-temp-admin-session', JSON.stringify({
        userId: 'local-development',
        email: 'admin@buyandsellgh.com',
        mode: 'local',
        role: 'owner',
        assuranceLevel: 'aal2',
        verifiedTotpFactors: []
      }));
    });
    await page.goto(`http://admin.localhost:4545/admin/pricing`, { waitUntil: "domcontentloaded", timeout: 15000 });
    await new Promise((r) => setTimeout(r, 800));
    const currentUrl = page.url();
    console.log(`URL after visiting /admin/pricing: ${currentUrl}`);
    assert(currentUrl.includes("/admin/products"), "Visiting /admin/pricing must redirect to /admin/products");

    const navText = await page.evaluate(() => document.querySelector(".admin-sidebar nav")?.textContent || "");
    assert(!navText.includes("Pricing & Stock"), "Sidebar nav must not contain 'Pricing & Stock'");
    console.log("  PASS: Sidebar nav does not contain 'Pricing & Stock'");
    assert(navText.includes("Learn More Pages"), "Sidebar nav must contain 'Learn More Pages'");
    console.log("  PASS: Sidebar nav contains 'Learn More Pages'");

    console.log("\n=== ALL COMPREHENSIVE QA CHECKS PASSED SUCCESSFULLY ===");

  } finally {
    await browser.close();
    await close();
  }
}

main().catch((err) => {
  console.error("QA FAILURE:", err);
  process.exit(1);
});
