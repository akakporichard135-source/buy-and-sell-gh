import puppeteer from "puppeteer-core";
import http from "node:http";
import fs from "node:fs";
import path from "node:path";

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

function createStaticServer(port = 4228) {
  const server = http.createServer((req, res) => {
    let reqPath = req.url.split("?")[0];
    if (reqPath === "/") reqPath = "/index.html";

    let filePath = path.join(DIST_DIR, reqPath);
    if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
      filePath = path.join(DIST_DIR, "index.html");
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = mimeTypes[ext] || "application/octet-stream";

    try {
      const content = fs.readFileSync(filePath);
      res.writeHead(200, { "Content-Type": contentType });
      res.end(content);
    } catch {
      res.writeHead(404);
      res.end("Not Found");
    }
  });

  return new Promise((resolve) => {
    server.listen(port, () => resolve(server));
  });
}

async function main() {
  const server = await createStaticServer(4228);
  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: true,
    args: ["--no-sandbox"],
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
    await page.goto("http://localhost:4228", { waitUntil: "domcontentloaded" });
    await new Promise((r) => setTimeout(r, 2000));

    // Scroll to iPhone Duo
    await page.evaluate(() => {
      const el = document.querySelector(".home-ref-iphone-duo");
      if (el) el.scrollIntoView();
    });
    await new Promise((r) => setTimeout(r, 800));
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, "qa-hero-duo-390.png") });
    console.log("Saved qa-hero-duo-390.png");

    // Scroll to Watch Ultra 4
    await page.evaluate(() => {
      const el = document.querySelector(".home-ref-watch-ultra-4");
      if (el) el.scrollIntoView();
    });
    await new Promise((r) => setTimeout(r, 800));
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, "qa-tile-watch-ultra-390.png") });
    console.log("Saved qa-tile-watch-ultra-390.png");

    // Scroll to Service Flyers
    await page.evaluate(() => {
      const el = document.querySelector(".home-ref-services");
      if (el) el.scrollIntoView();
    });
    await new Promise((r) => setTimeout(r, 800));
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, "qa-service-flyers-390.png") });
    console.log("Saved qa-service-flyers-390.png");

    await page.close();
  } finally {
    await browser.close();
    server.close();
  }
}

main();
