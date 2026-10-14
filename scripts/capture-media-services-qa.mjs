import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import puppeteer from "puppeteer-core";

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

function createStaticServer(port = 4199) {
  const server = http.createServer((req, res) => {
    let reqPath = req.url.split("?")[0];
    let filePath = path.join(DIST_DIR, reqPath);

    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      const ext = path.extname(filePath);
      res.writeHead(200, { "Content-Type": mimeTypes[ext] || "application/octet-stream" });
      fs.createReadStream(filePath).pipe(res);
      return;
    }

    // SPA fallback: index.html
    const indexPath = path.join(DIST_DIR, "index.html");
    res.writeHead(200, { "Content-Type": "text/html" });
    fs.createReadStream(indexPath).pipe(res);
  });

  return new Promise((resolve) => {
    server.listen(port, "127.0.0.1", () => resolve(server));
  });
}

async function runQa() {
  console.log("=== CAPTURING MEDIA LIBRARY & SERVICES QA PREVIEWS ===");
  const server = await createStaticServer(4199);
  console.log("Static server running on http://127.0.0.1:4199");

  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-gpu"],
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });

    // Enable local admin mock storage to simulate logged in admin
    await page.goto("http://admin.localhost:4199/admin/login", { waitUntil: "networkidle0" });
    await page.evaluate(() => {
      localStorage.setItem("buyandsell-gh-temp-admin-session", JSON.stringify({
        userId: "local-admin",
        email: "admin@buyandsellgh.com",
        mode: "local",
        role: "owner",
        assuranceLevel: "aal2",
        verifiedTotpFactors: []
      }));
    });
    await new Promise((r) => setTimeout(r, 1000));

    // 1. Media Library - All Assets
    console.log("1. Navigating to Media Library...");
    await page.goto("http://admin.localhost:4199/admin/media", { waitUntil: "networkidle0" });
    await new Promise((r) => setTimeout(r, 2000));
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, "admin-media-library-fixed-all.png"), fullPage: false });
    console.log("Saved: admin-media-library-fixed-all.png");

    // 2. Media Library - Filter by Service Flyers
    console.log("2. Filtering by Service Flyers...");
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll("button"));
      const b = btns.find((el) => el.innerText.includes("Service Flyers"));
      if (b) b.click();
    });
    await new Promise((r) => setTimeout(r, 1500));
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, "admin-media-library-service-flyers-fixed.png"), fullPage: false });
    console.log("Saved: admin-media-library-service-flyers-fixed.png");

    // Count visible flyer cards
    const flyerCards = await page.evaluate(() => {
      const titles = Array.from(document.querySelectorAll("h4")).map((h) => h.innerText);
      return titles.filter((t) => t.includes("Service Flyer"));
    });
    console.log("Visible Service Flyers in Media Library:", flyerCards);

    // 3. Media Library - Filter by Brand & Logos
    console.log("3. Filtering by Brand & Logos...");
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll("button"));
      const b = btns.find((el) => el.innerText.includes("Brand & Logos"));
      if (b) b.click();
    });
    await new Promise((r) => setTimeout(r, 1500));
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, "admin-media-library-brand-logos-fixed.png"), fullPage: false });
    console.log("Saved: admin-media-library-brand-logos-fixed.png");

    const brandCards = await page.evaluate(() => {
      const titles = Array.from(document.querySelectorAll("h4")).map((h) => h.innerText);
      return titles.filter((t) => t.includes("Logo") || t.includes("Banner"));
    });
    console.log("Visible Brand assets in Media Library:", brandCards);

    // Check primary logo image status
    const logoLoaded = await page.evaluate(() => {
      const img = Array.from(document.querySelectorAll("img")).find((i) => i.src.includes("logo") || i.alt.includes("branding"));
      return img ? { src: img.src, naturalWidth: img.naturalWidth, naturalHeight: img.naturalHeight, complete: img.complete } : null;
    });
    console.log("Primary Logo image state:", logoLoaded);

    // 4. Services Manager - Device Repairs Tab
    console.log("4. Navigating to Services Manager...");
    await page.goto("http://admin.localhost:4199/admin/services", { waitUntil: "networkidle0" });
    await new Promise((r) => setTimeout(r, 1500));
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, "admin-services-manager-repairs-with-flyer.png"), fullPage: false });
    console.log("Saved: admin-services-manager-repairs-with-flyer.png");

    // 5. Services Manager - All Service Flyers Tab
    console.log("5. Switching to All Service Flyers Tab...");
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll("button"));
      const b = btns.find((el) => el.innerText.includes("All Service Flyers"));
      if (b) b.click();
    });
    await new Promise((r) => setTimeout(r, 1500));
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, "admin-services-manager-all-flyers-grid.png"), fullPage: false });
    console.log("Saved: admin-services-manager-all-flyers-grid.png");

    // 6. Test Image Picker Modal
    console.log("6. Opening Image Picker Modal from Services Manager...");
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll("button"));
      const changeBtn = btns.find((b) => b.innerText.includes("Change Artwork"));
      if (changeBtn) changeBtn.click();
    });
    await new Promise((r) => setTimeout(r, 1500));
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, "admin-services-picker-modal-open.png"), fullPage: false });
    console.log("Saved: admin-services-picker-modal-open.png");

    console.log("=== ALL QA TESTS AND SCREENSHOTS COMPLETED SUCCESSFULLY ===");
  } finally {
    await browser.close();
    server.close();
  }
}

runQa().catch((err) => {
  console.error("QA error:", err);
  process.exit(1);
});
