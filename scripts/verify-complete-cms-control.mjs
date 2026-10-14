import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import puppeteer from "puppeteer-core";

const EDGE_PATH = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const ARTIFACT_DIR = "C:\\Users\\akakp\\.gemini\\antigravity\\brain\\6c721dee-7d06-4a2d-92fb-b74a2b38f58f";
const PORT = 4189;
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
console.log(`CMS Verification server running on http://127.0.0.1:${PORT}`);

const browser = await puppeteer.launch({
  executablePath: EDGE_PATH,
  headless: true,
  args: ["--no-sandbox", "--disable-setuid-sandbox"],
});

try {
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });

  console.log("Navigating to admin login...");
  await page.goto(`http://admin.localhost:${PORT}/admin/login`, { waitUntil: "networkidle2", timeout: 20000 });

  console.log("Authenticating as owner admin...");
  await page.type('input[type="email"]', "admin@buyandsellgh.com");
  await page.type('input[type="password"]', "Apple-Shopify-Quality-2026");
  await page.click('button[type="submit"]');

  await new Promise((r) => setTimeout(r, 2000));

  // 1. Media Library
  console.log("Capturing Admin Media Library...");
  await page.goto(`http://admin.localhost:${PORT}/admin/media`, { waitUntil: "networkidle2" });
  await new Promise((r) => setTimeout(r, 1200));
  await page.screenshot({ path: path.join(ARTIFACT_DIR, "admin-media-library-overview.png"), fullPage: false });

  // 2. Homepage Editor
  console.log("Capturing Admin Homepage Editor...");
  await page.goto(`http://admin.localhost:${PORT}/admin/homepage`, { waitUntil: "networkidle2" });
  await new Promise((r) => setTimeout(r, 1200));
  await page.screenshot({ path: path.join(ARTIFACT_DIR, "admin-homepage-manager.png"), fullPage: false });

  // 3. Storefront Manager
  console.log("Capturing Admin Storefront Manager...");
  await page.goto(`http://admin.localhost:${PORT}/admin/storefront`, { waitUntil: "networkidle2" });
  await new Promise((r) => setTimeout(r, 1200));
  await page.screenshot({ path: path.join(ARTIFACT_DIR, "admin-storefront-manager.png"), fullPage: false });

  // 4. Services Manager
  console.log("Capturing Admin Services Manager...");
  await page.goto(`http://admin.localhost:${PORT}/admin/services`, { waitUntil: "networkidle2" });
  await new Promise((r) => setTimeout(r, 1200));
  await page.screenshot({ path: path.join(ARTIFACT_DIR, "admin-services-manager.png"), fullPage: false });

  // 5. Pages & Content Manager
  console.log("Capturing Admin Pages Manager...");
  await page.goto(`http://admin.localhost:${PORT}/admin/pages`, { waitUntil: "networkidle2" });
  await new Promise((r) => setTimeout(r, 1200));
  await page.screenshot({ path: path.join(ARTIFACT_DIR, "admin-pages-content-manager.png"), fullPage: false });

  // 6. Public Storefront Homepage
  console.log("Capturing Public Storefront Homepage...");
  const publicPage = await browser.newPage();
  await publicPage.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
  await publicPage.goto(`http://localhost:${PORT}/`, { waitUntil: "networkidle2" });
  await new Promise((r) => setTimeout(r, 1500));
  await publicPage.screenshot({ path: path.join(ARTIFACT_DIR, "storefront-homepage-cms-verified.png"), fullPage: false });

  // 7. Public Storefront Contact & Footer
  console.log("Capturing Public Contact Page & Dynamic Footer...");
  await publicPage.goto(`http://localhost:${PORT}/contact`, { waitUntil: "networkidle2" });
  await new Promise((r) => setTimeout(r, 1200));
  await publicPage.screenshot({ path: path.join(ARTIFACT_DIR, "storefront-contact-footer-cms.png"), fullPage: false });

  // 8. Mobile responsive view of Homepage
  console.log("Capturing Mobile Responsive Storefront...");
  await publicPage.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
  await publicPage.goto(`http://localhost:${PORT}/`, { waitUntil: "networkidle2" });
  await new Promise((r) => setTimeout(r, 1200));
  await publicPage.screenshot({ path: path.join(ARTIFACT_DIR, "storefront-mobile-cms-verified.png"), fullPage: false });

  console.log("All visual verification screenshots captured successfully!");
} catch (err) {
  console.error("Verification error:", err);
} finally {
  await browser.close();
  server.close();
}
