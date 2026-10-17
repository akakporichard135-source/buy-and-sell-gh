import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import puppeteer from "puppeteer-core";

const EDGE_PATH = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const ARTIFACT_DIR = "C:\\Users\\akakp\\.gemini\\antigravity\\brain\\6c721dee-7d06-4a2d-92fb-b74a2b38f58f";
const PORT = 4210;
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
console.log(`Static server running on http://127.0.0.1:${PORT}`);

const browser = await puppeteer.launch({
  executablePath: EDGE_PATH,
  headless: true,
  args: ["--no-sandbox", "--disable-setuid-sandbox"],
});

try {
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });

  // 1. iPhone Store Category Page
  console.log("Navigating to /iphone...");
  await page.goto(`http://127.0.0.1:${PORT}/iphone`, { waitUntil: "networkidle2", timeout: 30000 });
  await new Promise((r) => setTimeout(r, 2000));

  // Capture full page and key sections
  const featuredRail = await page.$(".store-cat-carousel-section");
  if (featuredRail) {
    await featuredRail.screenshot({ path: path.join(ARTIFACT_DIR, "store-iphone-featured-lineup.png") });
    console.log("Captured store-iphone-featured-lineup.png");
  }

  const listingsGrid = await page.$(".store-cat-catalog-grid-wrap, .store-cat-catalog-section");
  if (listingsGrid) {
    await listingsGrid.screenshot({ path: path.join(ARTIFACT_DIR, "store-iphone-listings-grid.png") });
    console.log("Captured store-iphone-listings-grid.png");
  }

  const accessoriesRail = await page.$(".store-cat-acc-rail-wrap");
  if (accessoriesRail) {
    await accessoriesRail.screenshot({ path: path.join(ARTIFACT_DIR, "store-iphone-accessories-rail.png") });
    console.log("Captured store-iphone-accessories-rail.png");
  }

  // Full screenshot of /iphone
  await page.screenshot({ path: path.join(ARTIFACT_DIR, "store-iphone-full-page.png"), fullPage: false });
  console.log("Captured store-iphone-full-page.png");

  // Check accessory images in DOM
  const accessoryImages = await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll(".store-cat-acc-card"));
    return cards.map((c) => ({
      title: c.querySelector(".store-cat-acc-card-title")?.textContent?.trim(),
      price: c.querySelector(".store-cat-acc-card-price")?.textContent?.trim(),
      imgSrc: c.querySelector(".store-cat-acc-card-img")?.getAttribute("src"),
      hasPlaceholder: Boolean(c.querySelector(".product-image-placeholder, [class*='placeholder']")),
    }));
  });
  console.log("Accessory cards count:", accessoryImages.length);
  console.log("Accessory cards details:", JSON.stringify(accessoryImages, null, 2));

  // Check featured cards in DOM
  const featuredCards = await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll(".store-cat-card"));
    return cards.map((c) => ({
      title: c.querySelector(".store-cat-card-title")?.textContent?.trim(),
      imgSrc: c.querySelector(".store-cat-card-img")?.getAttribute("src"),
    }));
  });
  console.log("Featured cards count:", featuredCards.length);
  console.log("Featured cards details:", JSON.stringify(featuredCards, null, 2));

} catch (err) {
  console.error("Verification failed:", err);
} finally {
  await browser.close();
  server.close();
}
