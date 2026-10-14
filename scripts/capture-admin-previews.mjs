import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import puppeteer from "puppeteer-core";

const EDGE_PATH = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const ARTIFACT_DIR = "C:\\Users\\akakp\\.gemini\\antigravity\\brain\\6c721dee-7d06-4a2d-92fb-b74a2b38f58f";
const PORT = 4188;
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

  // Wait for login to complete and redirect to dashboard
  await new Promise((r) => setTimeout(r, 2000));
  console.log("Current URL after sign-in:", page.url());

  const routes = [
    { path: "/admin", name: "admin-overview-dashboard" },
    { path: "/admin/products", name: "admin-product-manager" },
    { path: "/admin/pricing", name: "admin-pricing-manager" },
    { path: "/admin/orders", name: "admin-orders-page" },
    { path: "/admin/trade-ins", name: "admin-trade-ins-page" },
    { path: "/admin/device-requests", name: "admin-device-requests-page" },
    { path: "/admin/contact-messages", name: "admin-contact-messages-page" },
    { path: "/admin/reviews", name: "admin-reviews-page" },
    { path: "/admin/promotions", name: "admin-promotions-page" },
    { path: "/admin/settings", name: "admin-settings-page" },
    { path: "/admin/account", name: "admin-account-page" },
  ];

  for (const item of routes) {
    const url = `http://admin.localhost:${PORT}${item.path}`;
    console.log(`Navigating to ${url}...`);
    await page.goto(url, { waitUntil: "networkidle2", timeout: 20000 });
    await new Promise((r) => setTimeout(r, 1200));

    const outPath = path.join(ARTIFACT_DIR, `${item.name}.png`);
    await page.screenshot({ path: outPath, fullPage: false });
    console.log(`Saved screenshot: ${item.name}.png`);
  }

  // Also capture mobile drawer view
  console.log("Capturing mobile views...");
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await page.goto(`http://admin.localhost:${PORT}/admin`, { waitUntil: "networkidle2", timeout: 20000 });
  await new Promise((r) => setTimeout(r, 1000));
  const mobileOverviewPath = path.join(ARTIFACT_DIR, "admin-overview-mobile.png");
  await page.screenshot({ path: mobileOverviewPath, fullPage: false });
  console.log("Saved screenshot: admin-overview-mobile.png");

  // Open mobile drawer
  const menuButton = await page.$("button[aria-label='Toggle navigation menu']");
  if (menuButton) {
    await menuButton.click();
    await new Promise((r) => setTimeout(r, 600));
    const mobileDrawerPath = path.join(ARTIFACT_DIR, "admin-drawer-mobile.png");
    await page.screenshot({ path: mobileDrawerPath, fullPage: false });
    console.log("Saved screenshot: admin-drawer-mobile.png");
  }

  console.log("ALL ADMIN SCREENSHOTS CAPTURED SUCCESSFULLY!");
} catch (err) {
  console.error("Screenshot capture failed:", err);
} finally {
  await browser.close();
  server.close();
}
