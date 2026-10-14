import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import puppeteer from "puppeteer-core";

const EDGE_PATH = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const ARTIFACT_DIR = "C:\\Users\\akakp\\.gemini\\antigravity\\brain\\6c721dee-7d06-4a2d-92fb-b74a2b38f58f";
const PORT = 4195;
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

const browser = await puppeteer.launch({
  executablePath: EDGE_PATH,
  headless: true,
  args: ["--no-sandbox", "--disable-setuid-sandbox"],
});

try {
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });

  // 1. Mobile phones storefront listing
  console.log("Navigating to /mobile-phones...");
  await page.goto(`http://localhost:${PORT}/mobile-phones`, { waitUntil: "networkidle2", timeout: 25000 });
  await new Promise((r) => setTimeout(r, 2000));
  await page.screenshot({ path: path.join(ARTIFACT_DIR, "storefront-mobile-phones-cards.png") });

  // 2. Admin Login & Pricing Search
  await page.goto(`http://admin.localhost:${PORT}/admin/login`, { waitUntil: "networkidle2", timeout: 25000 });
  await page.type('input[type="email"]', "admin@buyandsellgh.com");
  await page.type('input[type="password"]', "Apple-Shopify-Quality-2026");
  await page.click('button[type="submit"]');
  await new Promise((r) => setTimeout(r, 2000));

  await page.goto(`http://admin.localhost:${PORT}/admin/pricing`, { waitUntil: "networkidle2", timeout: 25000 });
  await new Promise((r) => setTimeout(r, 1500));
  await page.type('input[placeholder*="Search active storefront"]', "iPhone 17 Pro Max");
  await new Promise((r) => setTimeout(r, 1000));

  // Expand the item
  const expandBtn = await page.$("button[aria-label*='Expand']");
  if (expandBtn) await expandBtn.click();
  const chevronBtn = await page.$(".admin-pricing-row button");
  if (chevronBtn) await chevronBtn.click();
  await new Promise((r) => setTimeout(r, 1000));

  await page.screenshot({ path: path.join(ARTIFACT_DIR, "admin-iphone17-pricing-expanded.png") });
  console.log("Captured admin-iphone17-pricing-expanded.png");

} finally {
  await browser.close();
  server.close();
}
