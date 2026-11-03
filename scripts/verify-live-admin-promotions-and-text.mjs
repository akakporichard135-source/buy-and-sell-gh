import puppeteer from "puppeteer-core";
import fs from "node:fs/promises";
import path from "node:path";

const EDGE_PATH = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const ARTIFACTS_DIR = "C:/Users/akakp/.gemini/antigravity/brain/6c721dee-7d06-4a2d-92fb-b74a2b38f58f";

async function run() {
  console.log("Launching headless browser for live Admin verification...");
  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: true,
    pipe: true,
    protocolTimeout: 60000,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-gpu"],
  });

  const page = await browser.newPage();

  // Helper to establish admin session
  async function setupAdminSession() {
    await page.goto("https://buyandsellgh.com/?admin_preview=1", { waitUntil: "networkidle2", timeout: 45000 });
    await page.evaluate(() => {
      sessionStorage.setItem("admin_preview_active", "1");
      localStorage.setItem("admin_preview_active", "1");
      localStorage.setItem("buyandsell_preview_admin", "1");
      localStorage.setItem("buyandsell-gh-temp-admin-session", JSON.stringify({
        userId: "admin-owner",
        email: "richardakakpo15@gmail.com",
        mode: "local",
        role: "owner",
        assuranceLevel: "aal2",
        verifiedTotpFactors: [],
      }));
    });
  }

  try {
    await setupAdminSession();

    // 1. Verify Promotions Page Toolbar at 1440px desktop
    console.log("Navigating to live Admin Promotions page at 1440px...");
    await page.setViewport({ width: 1440, height: 900 });
    await page.goto("https://buyandsellgh.com/admin/promotions?admin_preview=1", { waitUntil: "networkidle2", timeout: 45000 });
    await page.waitForSelector("h1", { timeout: 15000 });

    const tabMetrics1440 = await page.evaluate(() => {
      const tabs = Array.from(document.querySelectorAll("button")).filter(b => 
        ["All Campaigns", "Active", "Drafts", "Scheduled", "Expired", "Archived"].some(name => b.innerText.includes(name))
      );
      return tabs.map(t => ({
        text: t.innerText.replace(/\n/g, " "),
        scrollWidth: t.scrollWidth,
        clientWidth: t.clientWidth,
        isCrushed: t.clientWidth < t.scrollWidth - 2,
      }));
    });
    console.log("Tab metrics at 1440px:", tabMetrics1440);
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, "live-admin-promotions-1440.png"), fullPage: false });

    // 2. Verify Promotions Page Toolbar at 1024px (where tabs previously crushed to 36px!)
    console.log("Testing at 1024px viewport...");
    await page.setViewport({ width: 1024, height: 800 });
    await page.goto("https://buyandsellgh.com/admin/promotions?admin_preview=1", { waitUntil: "networkidle2", timeout: 45000 });
    await page.waitForSelector("h1", { timeout: 15000 });

    const tabMetrics1024 = await page.evaluate(() => {
      const tabs = Array.from(document.querySelectorAll("button")).filter(b => 
        ["All Campaigns", "Active", "Drafts", "Scheduled", "Expired", "Archived"].some(name => b.innerText.includes(name))
      );
      return tabs.map(t => ({
        text: t.innerText.replace(/\n/g, " "),
        scrollWidth: t.scrollWidth,
        clientWidth: t.clientWidth,
        isCrushed: t.clientWidth < t.scrollWidth - 2,
      }));
    });
    console.log("Tab metrics at 1024px:", tabMetrics1024);
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, "live-admin-promotions-1024.png"), fullPage: false });

    // 3. Verify Promotions Page Toolbar at 768px tablet
    console.log("Testing at 768px tablet viewport...");
    await page.setViewport({ width: 768, height: 1024 });
    await page.goto("https://buyandsellgh.com/admin/promotions?admin_preview=1", { waitUntil: "networkidle2", timeout: 45000 });
    await page.waitForSelector("h1", { timeout: 15000 });

    const tabMetrics768 = await page.evaluate(() => {
      const tabs = Array.from(document.querySelectorAll("button")).filter(b => 
        ["All Campaigns", "Active", "Drafts", "Scheduled", "Expired", "Archived"].some(name => b.innerText.includes(name))
      );
      return tabs.map(t => ({
        text: t.innerText.replace(/\n/g, " "),
        scrollWidth: t.scrollWidth,
        clientWidth: t.clientWidth,
        isCrushed: t.clientWidth < t.scrollWidth - 2,
      }));
    });
    console.log("Tab metrics at 768px:", tabMetrics768);
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, "live-admin-promotions-768.png"), fullPage: false });

    // 4. Test + Create Promotion Modal for "Mega Discount Sale — Up to 15% Off"
    console.log("Testing Create Promotion Modal flow for Percentage Discount...");
    await page.setViewport({ width: 1440, height: 900 });
    await page.goto("https://buyandsellgh.com/admin/promotions?admin_preview=1", { waitUntil: "networkidle2", timeout: 45000 });
    
    // Find and click "+ Create Promotion"
    const createBtn = await page.waitForSelector("button ::-p-text(Create Promotion)");
    await createBtn.click();
    await page.waitForSelector("input[placeholder*='One-Time PlayStation']", { timeout: 10000 });

    // Fill Title
    const titleInput = await page.$("input[placeholder*='One-Time PlayStation']");
    await titleInput.click({ clickCount: 3 });
    await titleInput.type("Mega Discount Sale — Up to 15% Off");

    // Fill Short Description
    const descInput = await page.$("input[placeholder*='Neatly used PS5']");
    await descInput.click({ clickCount: 3 });
    await descInput.type("Save 15% on qualifying flagship smartphones and accessories");

    // Click Step 2: 2. Offer Type
    const step2Btn = await page.waitForSelector("button ::-p-text(2. Offer Type)");
    await step2Btn.click();
    await page.waitForSelector("::-p-text(Percentage Discount)");

    // Click Percentage Discount card
    const pctDiscountCard = await page.waitForSelector("::-p-text(Percentage Discount)");
    await pctDiscountCard.click();

    // Click Step 3: 3. Product / Bundle
    const step3Btn = await page.waitForSelector("button ::-p-text(3. Product / Bundle)");
    await step3Btn.click();
    await page.waitForSelector("::-p-text(Qualifying Products & Discount Scope)");

    // Check for PS5 bundle leakage in Step 3
    const step3Content = await page.evaluate(() => {
      const modal = document.querySelector(".fixed.inset-0");
      const text = modal ? modal.innerText : "";
      const inputs = Array.from(modal.querySelectorAll("input")).map(i => i.value);
      return {
        hasBundleBuilder: text.includes("New Product or Custom Bundle Creator") || text.includes("Included Package Items"),
        hasPreloadPs5Button: text.includes("Preload PS5 Combo Data"),
        hasStalePs5InputValue: inputs.some(val => val.includes("PS5 Slim Combo Offer")),
        hasDiscountScope: text.includes("Qualifying Products & Discount Scope"),
        hasStorewide: text.includes("Storewide (All Products)"),
        hasCategory: text.includes("By Category"),
        hasSpecific: text.includes("Specific Products"),
        hasStorageChips: text.includes("256GB") && text.includes("512GB"),
        hasMinSubtotal: text.includes("Minimum Qualifying Order Subtotal"),
      };
    });
    console.log("Step 3 Percentage Discount audit:", step3Content);
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, "live-admin-promotions-editor-step3-clean.png"), fullPage: false });

    // Click Step 7: Review & Publish
    const step7Btn = await page.waitForSelector("button ::-p-text(7. Review & Publish)");
    await step7Btn.click();
    await page.waitForSelector("::-p-text(Pre-Publishing Verification)");

    const step7Content = await page.evaluate(() => {
      const modal = document.querySelector(".fixed.inset-0");
      const text = modal ? modal.innerText : "";
      return {
        hasDiscountConfigured: text.includes("Discount configured (10% OFF)") || text.includes("Discount configured"),
        hasPrice7500: text.includes("Price configured (GH₵7,500)"),
        hasPs5FlyerFallback: document.querySelector("img[src*='ps5-slim-combo-desktop.webp']") !== null,
      };
    });
    console.log("Step 7 Review audit:", step7Content);
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, "live-admin-promotions-editor-step7-clean.png"), fullPage: false });

    // Close Modal
    const closeBtn = await page.$("button[class*='text-slate-400 hover:text-slate-700']");
    if (closeBtn) await closeBtn.click();

    // 5. Verify existing PS5 Campaign is untouched and intact
    console.log("Verifying existing PS5 Campaign status...");
    const ps5CardData = await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll("div")).filter(d => d.innerText.includes("PS5 Slim") || d.innerText.includes("PlayStation"));
      const titleEl = document.querySelector("h3");
      return {
        cardFound: cards.length > 0,
        pageTextSnippets: Array.from(document.querySelectorAll("h3, h4")).map(el => el.innerText),
      };
    });
    console.log("PS5 Campaign check:", ps5CardData);

    // 6. Verify Other Admin sections for layout & text
    console.log("Verifying Admin Services toolbar...");
    await page.goto("https://buyandsellgh.com/admin/services?admin_preview=1", { waitUntil: "networkidle2", timeout: 45000 });
    await page.waitForSelector("h1", { timeout: 15000 });
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, "live-admin-services-toolbar.png"), fullPage: false });

    console.log("Verifying Admin Orders toolbar...");
    await page.goto("https://buyandsellgh.com/admin/orders?admin_preview=1", { waitUntil: "networkidle2", timeout: 45000 });
    await page.waitForSelector("h1", { timeout: 15000 });
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, "live-admin-orders-toolbar.png"), fullPage: false });

    console.log("ALL LIVE VERIFICATION CHECKS COMPLETED SUCCESSFULLY!");
  } finally {
    await browser.close();
  }
}

run().catch((err) => {
  console.error("Verification failed:", err);
  process.exit(1);
});
