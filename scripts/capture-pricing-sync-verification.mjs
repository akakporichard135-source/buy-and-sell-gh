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
console.log(`Verification preview server running on http://127.0.0.1:${PORT}`);

const browser = await puppeteer.launch({
  executablePath: EDGE_PATH,
  headless: true,
  args: ["--no-sandbox", "--disable-setuid-sandbox"],
});

try {
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });

  // 1. Capture Storefront iPhone 17 Pro Max Product Details Page
  console.log("1. Navigating to Storefront iPhone 17 Pro Max PDP...");
  await page.goto(`http://localhost:${PORT}/product/iphone-17-pro-max`, { waitUntil: "networkidle2", timeout: 25000 });
  await new Promise((r) => setTimeout(r, 2000));
  await page.screenshot({ path: path.join(ARTIFACT_DIR, "storefront-iphone17-pdp.png") });
  console.log("Saved screenshot: storefront-iphone17-pdp.png");

  // 2. Capture Storefront Shop Page
  console.log("2. Navigating to Storefront Shop Page...");
  await page.goto(`http://localhost:${PORT}/shop?category=iPhones`, { waitUntil: "networkidle2", timeout: 25000 });
  await new Promise((r) => setTimeout(r, 2000));
  await page.screenshot({ path: path.join(ARTIFACT_DIR, "storefront-shop-pricing.png") });
  console.log("Saved screenshot: storefront-shop-pricing.png");

  // 3. Admin Authentication
  console.log("3. Navigating to Admin Login...");
  await page.goto(`http://admin.localhost:${PORT}/admin/login`, { waitUntil: "networkidle2", timeout: 25000 });
  await page.type('input[type="email"]', "admin@buyandsellgh.com");
  await page.type('input[type="password"]', "Apple-Shopify-Quality-2026");
  await page.click('button[type="submit"]');
  await new Promise((r) => setTimeout(r, 2500));

  // 4. Admin Product Manager & Drawer
  console.log("4. Navigating to Admin Product Manager...");
  await page.goto(`http://admin.localhost:${PORT}/admin/products`, { waitUntil: "networkidle2", timeout: 25000 });
  await new Promise((r) => setTimeout(r, 2000));

  // Find and click edit on iPhone 17 Pro Max
  const editButtons = await page.$$("button");
  let clicked = false;
  for (const btn of editButtons) {
    const text = await page.evaluate(el => el.textContent, btn);
    if (text.includes("Edit")) {
      // Check if row has iPhone 17
      const parentRow = await page.evaluate(el => {
        const row = el.closest("tr") || el.closest(".admin-product-row") || el.closest("div");
        return row ? row.textContent : "";
      }, btn);
      if (parentRow.includes("iPhone 17 Pro Max") || !clicked) {
        await btn.click();
        clicked = true;
        break;
      }
    }
  }

  await new Promise((r) => setTimeout(r, 1500));
  await page.screenshot({ path: path.join(ARTIFACT_DIR, "admin-product-drawer-sync.png") });
  console.log("Saved screenshot: admin-product-drawer-sync.png");

  // 5. Admin Pricing Manager
  console.log("5. Navigating to Admin Pricing Manager...");
  await page.goto(`http://admin.localhost:${PORT}/admin/pricing`, { waitUntil: "networkidle2", timeout: 25000 });
  await new Promise((r) => setTimeout(r, 2000));
  await page.screenshot({ path: path.join(ARTIFACT_DIR, "admin-pricing-manager-sync.png") });
  console.log("Saved screenshot: admin-pricing-manager-sync.png");

  console.log("ALL PRICING SYNCHRONIZATION VERIFICATION SCREENSHOTS CAPTURED!");
} catch (err) {
  console.error("Capture failed:", err);
} finally {
  await browser.close();
  server.close();
}
