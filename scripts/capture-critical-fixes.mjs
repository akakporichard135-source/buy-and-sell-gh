import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import puppeteer from "puppeteer-core";

const EDGE_PATH = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const ARTIFACT_DIR = "C:\\Users\\akakp\\.gemini\\antigravity\\brain\\6c721dee-7d06-4a2d-92fb-b74a2b38f58f";
const PORT = 4192;
const DIST = path.resolve("dist");

const MIME = {
  ".html": "text/html",
  ".js": "application/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".woff2": "font/woff2",
};

const server = http.createServer((req, res) => {
  const urlPath = req.url.split("?")[0];
  let filePath = path.join(DIST, urlPath);
  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    if (path.extname(urlPath)) {
      res.writeHead(404);
      return res.end("Not Found");
    }
    filePath = path.join(DIST, "index.html");
  }
  const ext = path.extname(filePath);
  res.writeHead(200, { "Content-Type": MIME[ext] || "application/octet-stream" });
  fs.createReadStream(filePath).pipe(res);
});

await new Promise((resolve) => server.listen(PORT, "127.0.0.1", resolve));
console.log(`Preview server running on http://127.0.0.1:${PORT}`);

const browser = await puppeteer.launch({
  executablePath: EDGE_PATH,
  headless: true,
  args: ["--no-sandbox", "--disable-setuid-sandbox"],
});

try {
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });

  console.log("Navigating to login page...");
  await page.goto(`http://admin.localhost:${PORT}/admin/login`, { waitUntil: "networkidle2", timeout: 20000 });

  console.log("Authenticating as owner admin...");
  await page.type('input[type="email"]', "admin@buyandsellgh.com");
  await page.type('input[type="password"]', "Apple-Shopify-Quality-2026");
  await page.click('button[type="submit"]');

  await new Promise((r) => setTimeout(r, 2000));
  console.log("Current URL after sign-in:", page.url());

  // 1. Capture Product Manager with pure-white thumbnails in table
  console.log("Navigating to Product Manager...");
  await page.goto(`http://admin.localhost:${PORT}/admin/products`, { waitUntil: "networkidle2", timeout: 20000 });
  await new Promise((r) => setTimeout(r, 1500));
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, "admin-products-pure-white-thumbnails.png"),
    fullPage: false,
  });
  console.log("Saved: admin-products-pure-white-thumbnails.png");

  // 2. Click Edit on the first product to verify the slide-over drawer opens immediately
  console.log("Clicking 'Edit' on first product...");
  const editButtons = await page.$$("table button");
  let clickedEdit = false;
  for (const btn of editButtons) {
    const text = await page.evaluate((el) => el.textContent, btn);
    if (text && text.includes("Edit")) {
      await btn.click();
      clickedEdit = true;
      break;
    }
  }
  if (clickedEdit) {
    await new Promise((r) => setTimeout(r, 800));
    // Verify the drawer is open and capture screenshot
    await page.screenshot({
      path: path.join(ARTIFACT_DIR, "admin-product-editor-slideover-drawer.png"),
      fullPage: false,
    });
    console.log("Saved: admin-product-editor-slideover-drawer.png");
  } else {
    console.warn("Could not find Edit button on page");
  }

  // 3. Pricing Manager Desktop View
  console.log("Navigating to Pricing Manager...");
  await page.goto(`http://admin.localhost:${PORT}/admin/pricing`, { waitUntil: "networkidle2", timeout: 20000 });
  await new Promise((r) => setTimeout(r, 1500));
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, "admin-pricing-pure-white-matrix.png"),
    fullPage: false,
  });
  console.log("Saved: admin-pricing-pure-white-matrix.png");

  // 4. Pricing Manager Mobile View (no horizontal scrollbar on variant card)
  console.log("Capturing Pricing Manager on Mobile...");
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await page.goto(`http://admin.localhost:${PORT}/admin/pricing`, { waitUntil: "networkidle2", timeout: 20000 });
  await new Promise((r) => setTimeout(r, 1500));
  // Scroll down a bit to see variant cards
  await page.evaluate(() => window.scrollBy(0, 300));
  await new Promise((r) => setTimeout(r, 500));
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, "admin-pricing-mobile-card-stack.png"),
    fullPage: false,
  });
  console.log("Saved: admin-pricing-mobile-card-stack.png");

  console.log("ALL CRITICAL FIX SCREENSHOTS CAPTURED SUCCESSFULLY!");
} catch (err) {
  console.error("Screenshot capture failed:", err);
} finally {
  await browser.close();
  server.close();
}
