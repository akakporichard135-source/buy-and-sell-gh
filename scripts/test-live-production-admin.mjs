import puppeteer from "puppeteer-core";
import path from "node:path";
import assert from "node:assert/strict";

const EDGE_PATH = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const ARTIFACTS_DIR = "C:\\Users\\akakp\\.gemini\\antigravity\\brain\\6c721dee-7d06-4a2d-92fb-b74a2b38f58f";

async function main() {
  console.log("=== STARTING LIVE PRODUCTION BROWSER QA ===");

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

    // 1. PUBLIC /admin MUST RETURN 404
    console.log("\n1. Testing live public https://buyandsellgh.com/admin ...");
    const adminRes = await page.goto("https://buyandsellgh.com/admin", { waitUntil: "networkidle2" });
    const adminStatus = adminRes.status();
    console.log("Status:", adminStatus);
    assert.equal(adminStatus, 404, "buyandsellgh.com/admin MUST return HTTP 404");
    const admin404Text = await page.evaluate(() => document.body.innerText);
    console.log("Body preview:", admin404Text.replace(/\n/g, " ").slice(0, 150));
    assert.ok(admin404Text.includes("404") || admin404Text.includes("Page Not Found"), "Must show 404 message");
    assert.ok(!admin404Text.includes("Sign In"), "Must NOT show Admin Sign In form");
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, "live-prod-public-admin-404.png") });
    console.log("Saved screenshot: live-prod-public-admin-404.png");

    // 2. PUBLIC /admin/login MUST RETURN 404
    console.log("\n2. Testing live public https://buyandsellgh.com/admin/login ...");
    const loginRes = await page.goto("https://buyandsellgh.com/admin/login", { waitUntil: "networkidle2" });
    const loginStatus = loginRes.status();
    console.log("Status:", loginStatus);
    assert.equal(loginStatus, 404, "buyandsellgh.com/admin/login MUST return HTTP 404");
    const login404Text = await page.evaluate(() => document.body.innerText);
    assert.ok(login404Text.includes("404") || login404Text.includes("Page Not Found"), "Must show 404 message");
    assert.ok(!login404Text.includes("Sign In"), "Must NOT show Admin Sign In form");

    // 3. PUBLIC STOREFRONT HOMEPAGE
    console.log("\n3. Testing live storefront https://buyandsellgh.com/ ...");
    const homeRes = await page.goto("https://buyandsellgh.com/", { waitUntil: "networkidle2" });
    console.log("Status:", homeRes.status());
    assert.equal(homeRes.status(), 200, "Homepage must return HTTP 200");
    const homeTitle = await page.title();
    console.log("Title:", homeTitle);
    assert.ok(homeTitle.includes("Buy & Sell GH"), "Title must contain Buy & Sell GH");
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, "live-prod-storefront-home.png") });
    console.log("Saved screenshot: live-prod-storefront-home.png");

    // 4. CLIENT-SIDE ROUTER GUARD ON PUBLIC HOST
    console.log("\n4. Testing client-side router navigation to /admin on public storefront...");
    await page.evaluate(() => {
      const a = document.createElement("a");
      a.href = "/admin";
      document.body.appendChild(a);
      a.click();
    });
    await new Promise((r) => setTimeout(r, 1000));
    const clientNavText = await page.evaluate(() => document.body.innerText);
    console.log("Client-nav text preview:", clientNavText.replace(/\n/g, " ").slice(0, 150));
    assert.ok(
      clientNavText.toLowerCase().includes("page not found") || clientNavText.includes("404"),
      "Client-side navigation on public host must render NotFoundPage"
    );
    assert.ok(!clientNavText.includes("Admin Dashboard") && !clientNavText.includes("Sign In to admin"), "No admin leakage");

    // 5. PUBLIC STORE
    console.log("\n5. Testing live store https://buyandsellgh.com/store ...");
    const storeRes = await page.goto("https://buyandsellgh.com/store", { waitUntil: "networkidle2" });
    console.log("Status:", storeRes.status());
    assert.equal(storeRes.status(), 200, "Store must return HTTP 200");
    const hasProducts = await page.evaluate(() => document.querySelectorAll("article, [data-product-id], .product-card").length > 0 || document.body.innerText.includes("GH₵"));
    console.log("Store has products / prices:", hasProducts);
    assert.ok(hasProducts, "Store must render products and pricing");

    // 6. PUBLIC CART
    console.log("\n6. Testing live cart https://buyandsellgh.com/cart ...");
    const cartRes = await page.goto("https://buyandsellgh.com/cart", { waitUntil: "networkidle2" });
    console.log("Status:", cartRes.status());
    assert.equal(cartRes.status(), 200, "Cart must return HTTP 200");

    // 7. ADMIN SUBDOMAIN LANDING & LOGIN
    console.log("\n7. Testing live admin portal https://admin.buyandsellgh.com/ ...");
    const adminHostRes = await page.goto("https://admin.buyandsellgh.com/", { waitUntil: "networkidle2" });
    console.log("Status:", adminHostRes.status());
    assert.equal(adminHostRes.status(), 200, "Admin host must return HTTP 200");
    const adminFinalUrl = page.url();
    console.log("Admin host resolved URL:", adminFinalUrl);
    assert.ok(adminFinalUrl.includes("/admin"), "Admin host must route to /admin or /admin/login");

    // Check for login form elements
    const hasEmailInput = await page.$("input[type='email']");
    const hasPasswordInput = await page.$("input[type='password']");
    const hasSubmitBtn = await page.$("button[type='submit']");
    console.log("Login elements found - Email:", !!hasEmailInput, "Password:", !!hasPasswordInput, "Submit:", !!hasSubmitBtn);
    assert.ok(hasEmailInput && hasPasswordInput, "Admin login page must render email and password inputs");
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, "live-prod-admin-login-screen.png") });
    console.log("Saved screenshot: live-prod-admin-login-screen.png");

    // 8. UNAUTHENTICATED ACCESS TO PROTECTED ADMIN ROUTES
    console.log("\n8. Testing unauthenticated access to https://admin.buyandsellgh.com/admin/pricing ...");
    await page.goto("https://admin.buyandsellgh.com/admin/pricing", { waitUntil: "networkidle2" });
    const pricingUrl = page.url();
    console.log("Unauthenticated pricing redirect URL:", pricingUrl);
    assert.ok(pricingUrl.includes("/admin/login"), "Unauthenticated access to /admin/pricing must redirect to /admin/login");

    console.log("\n9. Testing unauthenticated access to https://admin.buyandsellgh.com/admin/orders ...");
    await page.goto("https://admin.buyandsellgh.com/admin/orders", { waitUntil: "networkidle2" });
    const ordersUrl = page.url();
    console.log("Unauthenticated orders redirect URL:", ordersUrl);
    assert.ok(ordersUrl.includes("/admin/login"), "Unauthenticated access to /admin/orders must redirect to /admin/login");

    // Check that dashboard content is NOT visible to unauthenticated visitor
    const protectedContentExposed = await page.evaluate(() => {
      const text = document.body.innerText;
      return text.includes("Order Management") || text.includes("Authoritative Pricing") || text.includes("Customer Phone");
    });
    console.log("Protected content exposed to unauthenticated visitor:", protectedContentExposed);
    assert.equal(protectedContentExposed, false, "Protected admin content must NOT be exposed to unauthenticated visitor");

    console.log("\n=== ALL LIVE PRODUCTION QA CHECKS PASSED SUCCESSFULLY ===");
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error("FAIL in main:", err);
  process.exit(1);
});
