import puppeteer from "puppeteer-core";
import path from "node:path";

const EDGE_PATH = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const ARTIFACTS_DIR = "C:\\Users\\akakp\\.gemini\\antigravity\\brain\\6c721dee-7d06-4a2d-92fb-b74a2b38f58f";
const LIVE_URL = "https://admin.buyandsellgh.com";

async function verifyLive() {
  console.log("=== LIVE PRODUCTION MEDIA LIBRARY VERIFICATION ===");
  console.log("Testing against:", LIVE_URL);

  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-gpu"],
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });

    // 1. Visit login on live deployment and inject admin session
    await page.goto(`${LIVE_URL}/admin/login`, { waitUntil: "networkidle2" });
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

    // 2. Navigate to live /admin/media
    console.log("Navigating to live /admin/media...");
    await page.goto(`${LIVE_URL}/admin/media`, { waitUntil: "networkidle2" });
    await new Promise((r) => setTimeout(r, 2500));

    // Capture All Assets
    const allTitles = await page.evaluate(() => {
      return Array.from(document.querySelectorAll("h4")).map((h) => h.innerText);
    });
    console.log(`Live All Assets count: ${allTitles.length}`);
    console.log("Titles:", allTitles);

    await page.screenshot({
      path: path.join(ARTIFACTS_DIR, "live-prod-media-library-all.png"),
      fullPage: false,
    });
    console.log("✓ Captured: live-prod-media-library-all.png");

    // 3. Filter by Storefront & Tiles
    console.log("\nFiltering live Media Library by Storefront & Tiles...");
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll("button"));
      const b = btns.find((el) => el.innerText.includes("Storefront & Tiles"));
      if (b) b.click();
    });
    await new Promise((r) => setTimeout(r, 1500));

    const storefrontTitles = await page.evaluate(() => {
      return Array.from(document.querySelectorAll("h4")).map((h) => h.innerText);
    });
    console.log("Live Storefront Titles:", storefrontTitles);
    await page.screenshot({
      path: path.join(ARTIFACTS_DIR, "live-prod-media-library-storefront.png"),
      fullPage: false,
    });
    console.log("✓ Captured: live-prod-media-library-storefront.png");

    // 4. Filter by Product Imagery
    console.log("\nFiltering live Media Library by Product Imagery...");
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll("button"));
      const b = btns.find((el) => el.innerText.includes("Product Imagery"));
      if (b) b.click();
    });
    await new Promise((r) => setTimeout(r, 1500));

    const productTitles = await page.evaluate(() => {
      return Array.from(document.querySelectorAll("h4")).map((h) => h.innerText);
    });
    console.log("Live Product Imagery Titles:", productTitles);
    await page.screenshot({
      path: path.join(ARTIFACTS_DIR, "live-prod-media-library-product.png"),
      fullPage: false,
    });
    console.log("✓ Captured: live-prod-media-library-product.png");

    // 5. Open Edit / Replace modal for iPad Air
    console.log("\nOpening Edit / Replace modal on live deployment...");
    const opened = await page.evaluate(() => {
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

    if (opened) {
      await new Promise((r) => setTimeout(r, 1500));
      await page.screenshot({
        path: path.join(ARTIFACTS_DIR, "live-prod-media-library-edit-modal.png"),
        fullPage: false,
      });
      console.log("✓ Captured: live-prod-media-library-edit-modal.png");
    }

  } catch (err) {
    console.error("Live verification error:", err);
  } finally {
    await browser.close();
  }

  console.log("=== LIVE PRODUCTION VERIFICATION COMPLETE ===");
}

verifyLive().catch(console.error);
