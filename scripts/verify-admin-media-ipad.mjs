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

function createStaticServer(port = 4198) {
  const server = http.createServer((req, res) => {
    let reqPath = req.url.split("?")[0];
    let filePath = path.join(DIST_DIR, reqPath);

    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      const ext = path.extname(filePath);
      res.writeHead(200, { "Content-Type": mimeTypes[ext] || "application/octet-stream" });
      fs.createReadStream(filePath).pipe(res);
      return;
    }

    const indexPath = path.join(DIST_DIR, "index.html");
    res.writeHead(200, { "Content-Type": "text/html" });
    fs.createReadStream(indexPath).pipe(res);
  });

  return new Promise((resolve) => {
    server.listen(port, "127.0.0.1", () => resolve(server));
  });
}

async function run() {
  console.log("=== VERIFYING ADMIN MEDIA LIBRARY IPAD ASSETS ===");
  const server = await createStaticServer(4198);
  console.log("Static server running on http://127.0.0.1:4198");

  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-gpu"],
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });

    // 1. Set admin session
    await page.goto("http://admin.localhost:4198/admin/login", { waitUntil: "networkidle0" });
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

    // 2. Navigate to Media Library
    console.log("Navigating to Admin Media Library...");
    await page.goto("http://admin.localhost:4198/admin/media", { waitUntil: "networkidle0" });
    await new Promise((r) => setTimeout(r, 2000));

    // Get all asset cards
    const allCards = await page.evaluate(() => {
      const titles = Array.from(document.querySelectorAll("h4")).map((h) => h.innerText);
      return titles;
    });
    console.log(`Total Media Assets visible in "All Assets": ${allCards.length}`);
    console.log("Assets:", allCards);

    await page.screenshot({
      path: path.join(ARTIFACTS_DIR, "admin-media-library-all-with-ipad.png"),
      fullPage: false,
    });
    console.log("✓ Saved: admin-media-library-all-with-ipad.png");

    // 3. Filter by Storefront & Tiles
    console.log("\nFiltering by Storefront & Tiles...");
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll("button"));
      const b = btns.find((el) => el.innerText.includes("Storefront & Tiles"));
      if (b) b.click();
    });
    await new Promise((r) => setTimeout(r, 1000));

    const storefrontCards = await page.evaluate(() => {
      return Array.from(document.querySelectorAll("h4")).map((h) => h.innerText);
    });
    console.log("Storefront assets:", storefrontCards);
    await page.screenshot({
      path: path.join(ARTIFACTS_DIR, "admin-media-library-storefront-ipad-tile.png"),
      fullPage: false,
    });
    console.log("✓ Saved: admin-media-library-storefront-ipad-tile.png");

    // 4. Filter by Product Imagery
    console.log("\nFiltering by Product Imagery...");
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll("button"));
      const b = btns.find((el) => el.innerText.includes("Product Imagery"));
      if (b) b.click();
    });
    await new Promise((r) => setTimeout(r, 1000));

    const productCards = await page.evaluate(() => {
      return Array.from(document.querySelectorAll("h4")).map((h) => h.innerText);
    });
    console.log("Product Imagery assets:", productCards);
    await page.screenshot({
      path: path.join(ARTIFACTS_DIR, "admin-media-library-product-ipad-assets.png"),
      fullPage: false,
    });
    console.log("✓ Saved: admin-media-library-product-ipad-assets.png");

    // 5. Open Edit / Replace modal on iPad Air Promo Tile
    console.log("\nOpening Edit / Replace modal on iPad Air Promo Tile...");
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll("button"));
      const b = btns.find((el) => el.innerText.includes("All Assets"));
      if (b) b.click();
    });
    await new Promise((r) => setTimeout(r, 500));

    const openedModal = await page.evaluate(() => {
      // Find the card for "iPad Air Promo Tile"
      const cards = Array.from(document.querySelectorAll(".group"));
      const targetCard = cards.find((c) => c.innerText.includes("iPad Air"));
      if (!targetCard) return false;
      const editBtn = Array.from(targetCard.querySelectorAll("button")).find((b) => b.innerText.includes("Edit"));
      if (editBtn) {
        editBtn.click();
        return true;
      }
      return false;
    });

    if (openedModal) {
      await new Promise((r) => setTimeout(r, 1500));
      await page.screenshot({
        path: path.join(ARTIFACTS_DIR, "admin-media-library-edit-modal-ipad.png"),
        fullPage: false,
      });
      console.log("✓ Saved: admin-media-library-edit-modal-ipad.png");
    } else {
      console.warn("! Failed to click Edit / Replace button on iPad Air");
    }

  } catch (err) {
    console.error("Error during test:", err);
  } finally {
    await browser.close();
    server.close();
  }

  console.log("\n=== VERIFICATION FINISHED ===");
}

run().catch(console.error);
