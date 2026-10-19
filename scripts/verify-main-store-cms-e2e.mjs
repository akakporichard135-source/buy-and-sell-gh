import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import puppeteer from "puppeteer-core";
import assert from "node:assert/strict";

const EDGE_PATH = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const ARTIFACT_DIR = "C:\\Users\\akakp\\.gemini\\antigravity\\brain\\6c721dee-7d06-4a2d-92fb-b74a2b38f58f";
const PORT = 4220;
const DIST = path.resolve("dist");

const MIME = {
  ".html": "text/html",
  ".js": "application/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
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
  args: [
    "--no-sandbox",
    "--disable-setuid-sandbox",
    `--host-resolver-rules=MAP admin.localhost 127.0.0.1`,
  ],
});

try {
  const page = await browser.newPage();
  page.on("console", (msg) => console.log("BROWSER LOG:", msg.text()));
  page.on("pageerror", (err) => console.error("BROWSER PAGEERROR:", err.message));
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });

  // 1. SETUP LOCAL ADMIN SESSION
  console.log("\n--- STEP 1: ADMIN DASHBOARD NAVIGATION ---");
  await page.goto(`http://admin.localhost:${PORT}/admin/login`, { waitUntil: "domcontentloaded" });
  await page.evaluate(() => {
    localStorage.setItem(
      "buyandsell-gh-temp-admin-session",
      JSON.stringify({
        userId: "local-owner-001",
        email: "admin@buyandsellgh.com",
        mode: "local",
        role: "owner",
        assuranceLevel: "aal2",
        verifiedTotpFactors: [{ id: "factor-local", friendlyName: "Local Authenticator" }],
      })
    );
  });

  // Navigate to storefront manager
  console.log("Navigating to http://admin.localhost:" + PORT + "/admin/storefront ...");
  await page.goto(`http://admin.localhost:${PORT}/admin/storefront`, { waitUntil: "domcontentloaded" });
  await new Promise((r) => setTimeout(r, 2000));

  // Check Category Selector has "Main Store Page"
  const hasMainStoreButton = await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll("button"));
    return buttons.some((b) => b.innerText.includes("Main Store Page"));
  });
  console.log("Main Store Page option in department selector:", hasMainStoreButton ? "✓ FOUND" : "✗ NOT FOUND");
  assert.ok(hasMainStoreButton, "Main Store Page button must be in department selector");

  // Screenshot Admin Main Store - The Latest
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, "admin-storefront-main-store-latest.png"),
    fullPage: false,
  });
  console.log("Captured admin-storefront-main-store-latest.png");

  // 2. VERIFY ALL 5 SECTIONS IN ADMIN
  console.log("\n--- STEP 2: VERIFY ALL 5 SECTIONS & 35 IMAGES IN ADMIN ---");

  // Latest Section Cards count
  const latestCardsCount = await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll(".admin-card"));
    return cards.length;
  });
  console.log("1. The Latest cards rendered:", latestCardsCount, "(Expected: 8)");
  assert.equal(latestCardsCount, 8, "The Latest must have 8 editable cards");

  // Switch to Shop by Category
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll("button"));
    const catBtn = buttons.find((b) => b.innerText.includes("Shop by Category"));
    if (catBtn) catBtn.click();
  });
  await new Promise((r) => setTimeout(r, 1000));

  const categoryCardsCount = await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll(".admin-card"));
    return cards.length;
  });
  console.log("2. Shop by Category cards rendered:", categoryCardsCount, "(Expected: 6)");
  assert.equal(categoryCardsCount, 6, "Shop by Category must have 6 editable cards");
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, "admin-storefront-main-store-categories.png"),
    fullPage: false,
  });
  console.log("Captured admin-storefront-main-store-categories.png");

  // Switch to More to Love
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll("button"));
    const moreBtn = buttons.find((b) => b.innerText.includes("More to Love"));
    if (moreBtn) moreBtn.click();
  });
  await new Promise((r) => setTimeout(r, 1000));

  const moreCardsCount = await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll(".admin-card"));
    return cards.length;
  });
  console.log("3. More to Love cards rendered:", moreCardsCount, "(Expected: 7)");
  assert.equal(moreCardsCount, 7, "More to Love must have 7 editable cards");

  // Switch to Product Family Strip
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll("button"));
    const famBtn = buttons.find((b) => b.innerText.includes("Product Family Strip"));
    if (famBtn) famBtn.click();
  });
  await new Promise((r) => setTimeout(r, 1000));

  const familiesCount = await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll(".admin-card"));
    return cards.length;
  });
  console.log("4. Product Family Strip items rendered:", familiesCount, "(Expected: 6)");
  assert.equal(familiesCount, 6, "Product Family Strip must have 6 editable items");
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, "admin-storefront-main-store-families.png"),
    fullPage: false,
  });
  console.log("Captured admin-storefront-main-store-families.png");

  // Switch to Featured Accessories
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll("button"));
    const accBtn = buttons.find((b) => b.innerText.includes("Featured Accessories"));
    if (accBtn) accBtn.click();
  });
  await new Promise((r) => setTimeout(r, 1000));

  const accCardsCount = await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll(".admin-card"));
    return cards.length;
  });
  console.log("5. Featured Accessories cards rendered:", accCardsCount, "(Expected: 8)");
  assert.equal(accCardsCount, 8, "Featured Accessories must have 8 editable cards");
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, "admin-storefront-main-store-accessories.png"),
    fullPage: false,
  });
  console.log("Captured admin-storefront-main-store-accessories.png");

  const totalImages = latestCardsCount + categoryCardsCount + moreCardsCount + familiesCount + accCardsCount;
  console.log(`\nTOTAL ADMIN EDITABLE MAIN STORE IMAGES: ${totalImages} (Expected: 35)`);
  assert.equal(totalImages, 35, "Total images across all 5 sections must be exactly 35");

  // 3. PUBLIC STORE PAGE INSPECTION
  console.log("\n--- STEP 3: PUBLIC STORE LANDING PAGE INSPECTION ---");
  await page.goto(`http://127.0.0.1:${PORT}/store`, { waitUntil: "domcontentloaded" });
  await new Promise((r) => setTimeout(r, 2000));

  const pageInfo = await page.evaluate(() => ({
    url: window.location.href,
    title: document.title,
    bodyText: document.body.innerText.slice(0, 200),
    classes: document.body.className,
    rootHtml: document.getElementById("root")?.innerHTML?.slice(0, 200),
  }));
  console.log("Public Store Page Info:", pageInfo);

  // Check presence of all 5 sections in public DOM
  const publicSections = await page.evaluate(() => {
    return {
      familyStrip: Boolean(document.querySelector(".store-family-strip-section")),
      familyStripItems: document.querySelectorAll(".store-family-item").length,
      latestCarousel: Boolean(document.querySelector(".store-feature-section-latest")),
      latestCards: document.querySelectorAll(".store-feature-section-latest .store-latest-card").length,
      categorySection: Boolean(document.querySelector(".store-category-section")),
      categoryCards: document.querySelectorAll(".store-category-card").length,
      moreToLoveCarousel: Boolean(document.querySelector(".store-feature-section-more")),
      moreToLoveCards: document.querySelectorAll(".store-feature-section-more .store-latest-card").length,
      accessoriesCarousel: Boolean(document.querySelector(".store-accessories-section")),
      accessoryCards: document.querySelectorAll(".store-accessory-card").length,
    };
  });

  const accessoryTitles = await page.evaluate(() => {
    return Array.from(document.querySelectorAll(".store-accessories-section .store-accessory-card")).map(card => {
      return card.querySelector(".store-accessory-name")?.textContent?.trim();
    });
  });
  console.log("Rendered accessory cards (" + accessoryTitles.length + "):", accessoryTitles);
  console.log("Public Store Landing Page Sections:", JSON.stringify(publicSections, null, 2));
  assert.ok(publicSections.familyStrip, "Product Family Strip section must exist");
  assert.equal(publicSections.familyStripItems, 6, "Must show 6 family items");
  assert.ok(publicSections.latestCarousel, "The Latest section must exist");
  assert.equal(publicSections.latestCards, 8, "Must show 8 latest cards");
  assert.ok(publicSections.categorySection, "Shop by Category section must exist");
  assert.equal(publicSections.categoryCards, 6, "Must show 6 category cards");
  assert.ok(publicSections.moreToLoveCarousel, "More to Love section must exist");
  assert.equal(publicSections.moreToLoveCards, 7, "Must show 7 more to love cards");
  assert.ok(publicSections.accessoriesCarousel, "Featured accessories section must exist");
  assert.equal(publicSections.accessoryCards, 8, "Must show 8 accessory cards");

  await page.screenshot({
    path: path.join(ARTIFACT_DIR, "public-main-store-verified.png"),
    fullPage: false,
  });
  console.log("Captured public-main-store-verified.png");

  // 4. TEST LIVE EDIT & PERSISTENCE CYCLE IN ADMIN
  console.log("\n--- STEP 4: LIVE CMS EDIT & PERSISTENCE CYCLE ---");
  await page.goto(`http://admin.localhost:${PORT}/admin/storefront`, { waitUntil: "domcontentloaded" });
  await new Promise((r) => setTimeout(r, 2000));

  // Switch to The Latest
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll("button"));
    const latestBtn = buttons.find((b) => b.innerText.includes("The Latest"));
    if (latestBtn) latestBtn.click();
  });
  await new Promise((r) => setTimeout(r, 1000));

  // Input custom tagline into Card 1
  const originalStatement = await page.evaluate(() => {
    const card1Inputs = Array.from(document.querySelectorAll(".admin-card"))[0].querySelectorAll("input.admin-input");
    const statementInput = card1Inputs[card1Inputs.length - 1];
    const orig = statementInput.value;
    const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
    nativeSetter.call(statementInput, orig + " [Verified CMS Update]");
    statementInput.dispatchEvent(new Event("input", { bubbles: true }));
    statementInput.dispatchEvent(new Event("change", { bubbles: true }));
    return orig;
  });

  console.log(`Original Card 1 Statement: "${originalStatement}"`);
  console.log("Modified Statement in Admin UI with [Verified CMS Update]");

  // Click Save Storefront Changes
  console.log("Clicking Save Storefront Changes button...");
  await page.evaluate(() => {
    const saveBtns = Array.from(document.querySelectorAll("button"));
    const saveBtn = saveBtns.find((b) => b.innerText.includes("Save Storefront Changes"));
    if (saveBtn) saveBtn.click();
  });

  await new Promise((r) => setTimeout(r, 2000));

  // Verify success banner in Admin UI
  const hasSuccessBanner = await page.evaluate(() => {
    const text = document.body.innerText;
    return text.includes("Storefront categories, showcase carousels and accessories updated successfully");
  });
  console.log("Admin Save Success Banner displayed:", hasSuccessBanner ? "✓ YES" : "✗ NO");
  assert.ok(hasSuccessBanner, "Save storefront changes must display success notification");

  // Get saved CMS payload from admin origin
  const savedCmsPayload = await page.evaluate(() => localStorage.getItem("buyandsell_cms_main_store_v1"));

  // Navigate to public /store and verify updated card statement is live!
  console.log("Navigating to public /store to verify live change...");
  await page.goto(`http://127.0.0.1:${PORT}/store`, { waitUntil: "domcontentloaded" });
  if (savedCmsPayload) {
    await page.evaluate((payload) => {
      localStorage.setItem("buyandsell_cms_main_store_v1", payload);
    }, savedCmsPayload);
    await page.reload({ waitUntil: "domcontentloaded" });
    await new Promise((r) => setTimeout(r, 1500));
  }

  const liveCard1Statement = await page.evaluate(() => {
    const firstCard = document.querySelector(".store-feature-section-latest .store-latest-card");
    return firstCard ? firstCard.querySelector(".store-latest-card-statement")?.textContent : null;
  });
  console.log(`Public Store Page Card 1 Statement: "${liveCard1Statement}"`);
  assert.ok(liveCard1Statement?.includes("[Verified CMS Update]"), "Public store page must reflect updated CMS text!");
  console.log("✓ LIVE PUBLIC STORE REFLECTS CMS UPDATE IMMEDIATELY!");

  // RESTORE ORIGINAL STATEMENT
  console.log("\nRestoring original statement in Admin...");
  await page.goto(`http://admin.localhost:${PORT}/admin/storefront`, { waitUntil: "domcontentloaded" });
  await new Promise((r) => setTimeout(r, 2000));

  await page.evaluate((orig) => {
    const card1Inputs = Array.from(document.querySelectorAll(".admin-card"))[0].querySelectorAll("input.admin-input");
    const statementInput = card1Inputs[card1Inputs.length - 1];
    const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
    nativeSetter.call(statementInput, orig);
    statementInput.dispatchEvent(new Event("input", { bubbles: true }));
    statementInput.dispatchEvent(new Event("change", { bubbles: true }));

    const saveBtns = Array.from(document.querySelectorAll("button"));
    const saveBtn = saveBtns.find((b) => b.innerText.includes("Save Storefront Changes"));
    if (saveBtn) saveBtn.click();
  }, originalStatement);

  await new Promise((r) => setTimeout(r, 2000));

  const restoredCmsPayload = await page.evaluate(() => localStorage.getItem("buyandsell_cms_main_store_v1"));

  // Verify restored public state
  await page.goto(`http://127.0.0.1:${PORT}/store`, { waitUntil: "domcontentloaded" });
  if (restoredCmsPayload) {
    await page.evaluate((payload) => {
      localStorage.setItem("buyandsell_cms_main_store_v1", payload);
    }, restoredCmsPayload);
    await page.reload({ waitUntil: "domcontentloaded" });
    await new Promise((r) => setTimeout(r, 1500));
  }

  const restoredStatement = await page.evaluate(() => {
    const firstCard = document.querySelector(".store-feature-section-latest .store-latest-card");
    return firstCard ? firstCard.querySelector(".store-latest-card-statement")?.textContent : null;
  });
  console.log(`Restored Statement on Public Page: "${restoredStatement}"`);
  assert.equal(restoredStatement, originalStatement, "Restored statement must match original exactly");
  console.log("✓ RESTORATION CONFIRMED: Original state cleanly restored!");

  console.log("\n============================================================");
  console.log("  ALL MAIN STORE CMS E2E VERIFICATION CHECKS PASSED!        ");
  console.log("============================================================\n");
} catch (err) {
  console.error("Verification error:", err);
  process.exit(1);
} finally {
  await browser.close();
  server.close();
}
