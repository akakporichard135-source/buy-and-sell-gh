import puppeteer from "puppeteer-core";
import path from "node:path";
import assert from "node:assert/strict";

const EDGE_PATH = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const ARTIFACTS_DIR = "C:\\Users\\akakp\\.gemini\\antigravity\\brain\\6c721dee-7d06-4a2d-92fb-b74a2b38f58f";

async function runVerification() {
  console.log("============================================================");
  console.log("  VERIFYING LIVE REDESIGNED ADMIN DEPLOYMENT IN PRODUCTION   ");
  console.log("============================================================\n");

  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--host-resolver-rules=MAP admin.buyandsellgh.com 216.198.79.65",
    ],
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });

    // 1. PUBLIC /admin MUST RETURN HTTP 404
    console.log("[CHECK 1] Testing public https://buyandsellgh.com/admin ...");
    const res1 = await page.goto("https://buyandsellgh.com/admin", { waitUntil: "networkidle2" });
    const status1 = res1.status();
    console.log("  -> Status:", status1);
    assert.equal(status1, 404, "buyandsellgh.com/admin MUST return 404");
    const body1 = await page.evaluate(() => document.body.innerText);
    assert.ok(body1.includes("404") || body1.includes("Page Not Found"), "Must show 404 page");
    assert.ok(!body1.includes("Sign In to admin") && !body1.includes("Admin Dashboard"), "No admin UI leakage");
    console.log("  [PASS] Public /admin correctly returns HTTP 404.");

    // 2. PUBLIC /admin/login MUST RETURN HTTP 404
    console.log("\n[CHECK 2] Testing public https://buyandsellgh.com/admin/login ...");
    const res2 = await page.goto("https://buyandsellgh.com/admin/login", { waitUntil: "networkidle2" });
    const status2 = res2.status();
    console.log("  -> Status:", status2);
    assert.equal(status2, 404, "buyandsellgh.com/admin/login MUST return 404");
    console.log("  [PASS] Public /admin/login correctly returns HTTP 404.");

    // 3. PUBLIC STOREFRONT HOMEPAGE & WHATSAPP FLOWS
    console.log("\n[CHECK 3] Testing public storefront https://buyandsellgh.com/ ...");
    const resHome = await page.goto("https://buyandsellgh.com/", { waitUntil: "networkidle2" });
    console.log("  -> Status:", resHome.status());
    assert.equal(resHome.status(), 200, "Storefront must return 200");
    const homeTitle = await page.title();
    console.log("  -> Title:", homeTitle);
    assert.ok(homeTitle.includes("Buy & Sell GH"), "Title matches brand");

    // Check WhatsApp links on public site
    const whatsappLinks = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll("a[href*='wa.me'], a[href*='whatsapp.com']"));
      return links.map(l => l.getAttribute("href"));
    });
    console.log("  -> Found WhatsApp links on home:", whatsappLinks.length);
    assert.ok(whatsappLinks.length > 0, "WhatsApp integration links must be active");
    console.log("  [PASS] Public storefront is live and functional.");

    // 4. PUBLIC SHOPPING & CART
    console.log("\n[CHECK 4] Testing public store & cart pages ...");
    const resStore = await page.goto("https://buyandsellgh.com/shop", { waitUntil: "networkidle2" });
    console.log("  -> /shop status:", resStore.status());
    assert.equal(resStore.status(), 200, "/shop must return 200");

    const resCart = await page.goto("https://buyandsellgh.com/cart", { waitUntil: "networkidle2" });
    console.log("  -> /cart status:", resCart.status());
    assert.equal(resCart.status(), 200, "/cart must return 200");
    console.log("  [PASS] Store and cart pages are live.");

    // 5. ADMIN SUBDOMAIN LANDING & LOGIN PAGE
    console.log("\n[CHECK 5] Testing dedicated admin domain https://admin.buyandsellgh.com/ ...");
    const resAdmin = await page.goto("https://admin.buyandsellgh.com/", { waitUntil: "networkidle2" });
    console.log("  -> Status:", resAdmin.status());
    assert.equal(resAdmin.status(), 200, "Admin host must return 200");
    const resolvedUrl = page.url();
    console.log("  -> Resolved URL:", resolvedUrl);
    assert.ok(resolvedUrl.includes("/admin"), "Must route to admin root or login");

    // Check login form rendering
    const emailInput = await page.$("input[type='email']");
    const passwordInput = await page.$("input[type='password']");
    const submitBtn = await page.$("button[type='submit']");
    console.log("  -> Email input present:", !!emailInput);
    console.log("  -> Password input present:", !!passwordInput);
    console.log("  -> Submit button present:", !!submitBtn);
    assert.ok(emailInput && passwordInput && submitBtn, "Admin login controls must be present");

    const adminBodyText = await page.evaluate(() => document.body.innerText);
    console.log("  -> Admin body preview:", adminBodyText.replace(/\n/g, " ").slice(0, 200));
    assert.ok(
      adminBodyText.toLowerCase().includes("admin") ||
      adminBodyText.toLowerCase().includes("login") ||
      adminBodyText.toLowerCase().includes("manage buy & sell"),
      "Login UI confirmed"
    );

    // Take live screenshot
    const screenshotPath = path.join(ARTIFACTS_DIR, "live-prod-redesigned-admin-login.png");
    await page.screenshot({ path: screenshotPath });
    console.log("  -> Captured screenshot:", screenshotPath);
    console.log("  [PASS] Admin domain and login portal render properly.");

    // 6. ROUTE GUARDS ON SENSITIVE ADMIN SUB-ROUTES
    const sensitiveRoutes = [
      "/admin/products",
      "/admin/pricing",
      "/admin/orders",
      "/admin/promotions",
      "/admin/settings",
      "/admin/trade-ins",
      "/admin/device-requests",
      "/admin/contact-messages",
      "/admin/reviews",
      "/admin/account",
    ];

    console.log("\n[CHECK 6] Testing route protection on sensitive admin routes (unauthenticated visitor) ...");
    for (const route of sensitiveRoutes) {
      await page.goto(`https://admin.buyandsellgh.com${route}`, { waitUntil: "networkidle2" });
      const currentUrl = page.url();
      assert.ok(
        currentUrl.includes("/admin/login"),
        `Route ${route} must redirect unauthenticated visitor to /admin/login (actual: ${currentUrl})`
      );
    }
    console.log(`  [PASS] All ${sensitiveRoutes.length} sensitive routes strictly redirect to /admin/login.`);

    // 7. VERIFY ASSET INTEGRITY AND STYLES
    console.log("\n[CHECK 7] Verifying redesigned admin styling assets ...");
    const loadedScripts = await page.evaluate(() => {
      return Array.from(document.querySelectorAll("script[src]")).map(s => s.getAttribute("src"));
    });
    console.log("  -> Loaded script bundles count:", loadedScripts.length);
    assert.ok(loadedScripts.length > 0, "Script bundles must be loaded");
    console.log("  [PASS] Assets loaded cleanly.");

    console.log("\n============================================================");
    console.log("  ALL PRODUCTION VERIFICATION CHECKS PASSED SUCCESSFULLY!    ");
    console.log("============================================================\n");
  } finally {
    await browser.close();
  }
}

runVerification().catch(err => {
  console.error("FATAL ERROR during verification:", err);
  process.exit(1);
});
