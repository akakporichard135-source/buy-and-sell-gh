import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import puppeteer from "puppeteer-core";

const EDGE_PATH = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const PORT = 4198;
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

  await page.goto(`http://admin.localhost:${PORT}/admin/login`, { waitUntil: "networkidle2" });
  await page.type('input[type="email"]', "admin@buyandsellgh.com");
  await page.type('input[type="password"]', "Apple-Shopify-Quality-2026");
  await page.click('button[type="submit"]');
  await new Promise((r) => setTimeout(r, 2000));

  await page.goto(`http://admin.localhost:${PORT}/admin`, { waitUntil: "networkidle2" });
  await new Promise((r) => setTimeout(r, 1000));

  const artifactDir = "C:\\Users\\akakp\\.gemini\\antigravity\\brain\\6c721dee-7d06-4a2d-92fb-b74a2b38f58f";

  // Check topbar initial position and computed styles
  const initialInfo = await page.evaluate(() => {
    const topbar = document.querySelector(".admin-topbar");
    const h1 = topbar?.querySelector("h1");
    const topbarRect = topbar?.getBoundingClientRect();
    return {
      topbarRect,
      position: window.getComputedStyle(topbar).position,
      top: window.getComputedStyle(topbar).top,
      zIndex: window.getComputedStyle(topbar).zIndex,
      h1Color: h1 ? window.getComputedStyle(h1).color : null,
      h1Text: h1?.textContent,
    };
  });
  console.log("Initial Topbar Info:", JSON.stringify(initialInfo, null, 2));

  await page.screenshot({ path: path.join(artifactDir, "test-scroll-0.png"), fullPage: false });

  // Scroll down 300px
  await page.evaluate(() => window.scrollBy(0, 300));
  await new Promise((r) => setTimeout(r, 400));
  await page.screenshot({ path: path.join(artifactDir, "test-scroll-300.png"), fullPage: false });

  const scrolledInfo = await page.evaluate(() => {
    const topbar = document.querySelector(".admin-topbar");
    const topbarRect = topbar?.getBoundingClientRect();
    return {
      scrollY: window.scrollY,
      topbarRect,
    };
  });
  console.log("Scrolled 300px Topbar Info:", JSON.stringify(scrolledInfo, null, 2));

} finally {
  await browser.close();
  server.close();
}
