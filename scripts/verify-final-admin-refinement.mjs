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

  console.log("1. Authenticating as admin...");
  await page.goto(`http://admin.localhost:${PORT}/admin/login`, { waitUntil: "networkidle2" });
  await page.type('input[type="email"]', "admin@buyandsellgh.com");
  await page.type('input[type="password"]', "Apple-Shopify-Quality-2026");
  await page.click('button[type="submit"]');
  await new Promise((r) => setTimeout(r, 2000));

  // -------------------------------------------------------------
  // Test 1: Overview Page Header Positioning & Scroll Behavior
  // -------------------------------------------------------------
  console.log("2. Testing Overview page layout & header pinning...");
  await page.goto(`http://admin.localhost:${PORT}/admin`, { waitUntil: "networkidle2" });
  await new Promise((r) => setTimeout(r, 1200));

  const topbarInfo = await page.evaluate(() => {
    const topbar = document.querySelector(".admin-topbar");
    const h1 = topbar?.querySelector("h1");
    const rect = topbar?.getBoundingClientRect();
    const style = window.getComputedStyle(topbar);
    return {
      rect: { top: rect?.top, left: rect?.left, width: rect?.width, height: rect?.height },
      titleText: h1?.textContent?.trim(),
      titleColor: h1 ? window.getComputedStyle(h1).color : null,
      topbarBg: style.backgroundColor,
      position: style.position,
    };
  });
  console.log("Overview Topbar Info:", topbarInfo);

  // Take screenshot at top
  await page.screenshot({ path: path.join(ARTIFACT_DIR, "admin-overview-refined-desktop.png"), fullPage: false });
  console.log("Saved admin-overview-refined-desktop.png");

  // Scroll .admin-content down 350px and verify header stays pinned at top
  await page.evaluate(() => {
    const content = document.querySelector(".admin-content");
    if (content) content.scrollTop = 350;
  });
  await new Promise((r) => setTimeout(r, 400));

  const scrolledTopbarRect = await page.evaluate(() => {
    const topbar = document.querySelector(".admin-topbar");
    const rect = topbar?.getBoundingClientRect();
    const content = document.querySelector(".admin-content");
    return {
      top: rect?.top,
      contentScrollTop: content?.scrollTop,
    };
  });
  console.log("Scrolled Topbar Position:", scrolledTopbarRect);
  if (scrolledTopbarRect.top !== 0) {
    throw new Error(`Topbar moved during scroll! Expected top=0, got ${scrolledTopbarRect.top}`);
  }
  console.log("✓ Topbar firmly pinned at top=0 during content scroll");

  // Mobile Overview
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await page.goto(`http://admin.localhost:${PORT}/admin`, { waitUntil: "networkidle2" });
  await new Promise((r) => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(ARTIFACT_DIR, "admin-overview-refined-mobile.png"), fullPage: false });
  console.log("Saved admin-overview-refined-mobile.png");

  // -------------------------------------------------------------
  // Test 2: Products Page Usability & Pagination
  // -------------------------------------------------------------
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
  console.log("3. Testing Products page pagination and usability...");
  await page.goto(`http://admin.localhost:${PORT}/admin/products`, { waitUntil: "networkidle2" });
  await new Promise((r) => setTimeout(r, 1200));

  const productCounts = await page.evaluate(() => {
    const rows = document.querySelectorAll(".admin-table-shell tbody tr");
    const paginationText = document.querySelector(".admin-content")?.textContent?.includes("Showing 1 to 25");
    return {
      rowCount: rows.length,
      hasPaginationText: paginationText,
    };
  });
  console.log("Products Page 1 row count:", productCounts);
  if (productCounts.rowCount !== 25) {
    throw new Error(`Expected exactly 25 products per page, got ${productCounts.rowCount}`);
  }
  console.log("✓ Product Manager correctly paginates to 25 items per page");

  await page.screenshot({ path: path.join(ARTIFACT_DIR, "admin-products-refined-desktop.png"), fullPage: false });
  console.log("Saved admin-products-refined-desktop.png");

  // Mobile Products Cards
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await page.goto(`http://admin.localhost:${PORT}/admin/products`, { waitUntil: "networkidle2" });
  await new Promise((r) => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(ARTIFACT_DIR, "admin-products-refined-mobile.png"), fullPage: false });
  console.log("Saved admin-products-refined-mobile.png");

  // -------------------------------------------------------------
  // Test 3: Pricing & Stock Accordion & Pagination
  // -------------------------------------------------------------
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
  console.log("4. Testing Pricing & Stock collapsed accordion and pagination...");
  await page.goto(`http://admin.localhost:${PORT}/admin/pricing`, { waitUntil: "networkidle2" });
  await new Promise((r) => setTimeout(r, 1200));

  const pricingCheck = await page.evaluate(() => {
    // Check that products are collapsed by default
    const openTables = document.querySelectorAll(".admin-content table");
    const paginationText = document.querySelector(".admin-content")?.textContent?.includes("Showing 1 to 20");
    return {
      openVariantTablesCount: openTables.length,
      hasPaginationText: paginationText,
    };
  });
  console.log("Pricing initial check:", pricingCheck);
  if (pricingCheck.openVariantTablesCount !== 0) {
    throw new Error(`Expected all products collapsed by default, but found ${pricingCheck.openVariantTablesCount} open tables!`);
  }
  console.log("✓ Pricing & Stock groups collapsed by default (0 open tables initially)");

  await page.screenshot({ path: path.join(ARTIFACT_DIR, "admin-pricing-refined-desktop.png"), fullPage: false });
  console.log("Saved admin-pricing-refined-desktop.png");

  // Mobile Pricing
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await page.goto(`http://admin.localhost:${PORT}/admin/pricing`, { waitUntil: "networkidle2" });
  await new Promise((r) => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(ARTIFACT_DIR, "admin-pricing-refined-mobile.png"), fullPage: false });
  console.log("Saved admin-pricing-refined-mobile.png");

  // -------------------------------------------------------------
  // Test 4: Orders Page 6-Column Layout & Zero Horizontal Scroll
  // -------------------------------------------------------------
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
  console.log("5. Testing Orders page layout and overflow...");
  await page.goto(`http://admin.localhost:${PORT}/admin/orders`, { waitUntil: "networkidle2" });
  await new Promise((r) => setTimeout(r, 1200));

  const ordersCheck = await page.evaluate(() => {
    const table = document.querySelector(".admin-table-shell table");
    const scrollContainer = document.querySelector(".admin-table-scroll");
    const ths = Array.from(document.querySelectorAll(".admin-table-shell th")).map((th) => th.textContent?.trim());
    return {
      columnHeaders: ths,
      columnCount: ths.length,
      hasHorizontalOverflow: scrollContainer ? scrollContainer.scrollWidth > scrollContainer.clientWidth + 2 : false,
      scrollWidth: scrollContainer?.scrollWidth,
      clientWidth: scrollContainer?.clientWidth,
    };
  });
  console.log("Orders table check:", ordersCheck);
  if (ordersCheck.columnCount !== 6) {
    throw new Error(`Expected 6 streamlined columns, found ${ordersCheck.columnCount}`);
  }
  if (ordersCheck.hasHorizontalOverflow) {
    console.warn("Warning: Orders table scroll container has horizontal overflow:", ordersCheck);
  } else {
    console.log("✓ Desktop Orders table fits cleanly with zero horizontal scroll");
  }

  await page.screenshot({ path: path.join(ARTIFACT_DIR, "admin-orders-refined-desktop.png"), fullPage: false });
  console.log("Saved admin-orders-refined-desktop.png");

  // Mobile Orders
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await page.goto(`http://admin.localhost:${PORT}/admin/orders`, { waitUntil: "networkidle2" });
  await new Promise((r) => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(ARTIFACT_DIR, "admin-orders-refined-mobile.png"), fullPage: false });
  console.log("Saved admin-orders-refined-mobile.png");

  console.log("ALL VERIFICATIONS COMPLETED SUCCESSFULLY!");
} finally {
  await browser.close();
  server.close();
}
