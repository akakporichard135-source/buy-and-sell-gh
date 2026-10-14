import puppeteer from "puppeteer-core";
import path from "node:path";
import assert from "node:assert/strict";

const EDGE_PATH = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const ARTIFACT_DIR = "C:\\Users\\akakp\\.gemini\\antigravity\\brain\\6c721dee-7d06-4a2d-92fb-b74a2b38f58f";

console.log("================================================================");
console.log("  BUY & SELL GH — FINAL LIVE PRODUCTION COMPREHENSIVE AUDIT     ");
console.log("================================================================\n");

const browser = await puppeteer.launch({
  executablePath: EDGE_PATH,
  headless: true,
  args: [
    "--no-sandbox",
    "--disable-setuid-sandbox",
    "--host-resolver-rules=MAP admin.buyandsellgh.com 216.198.79.65, MAP buyandsellgh.com 64.29.17.1",
  ],
});

try {
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });

  // 1. PUBLIC /admin MUST RETURN HTTP 404
  console.log("1. Verifying public /admin returns HTTP 404...");
  const res1 = await page.goto("https://buyandsellgh.com/admin", { waitUntil: "networkidle2", timeout: 25000 });
  console.log("  -> https://buyandsellgh.com/admin Status:", res1.status());
  assert.equal(res1.status(), 404, "buyandsellgh.com/admin must return 404");
  const body1 = await page.evaluate(() => document.body.innerText);
  assert.ok(body1.includes("404") || body1.includes("Page Not Found"), "Shows 404 Page Not Found");
  assert.ok(!body1.includes("Sign In"), "Does not leak admin form");
  await page.screenshot({ path: path.join(ARTIFACT_DIR, "live-final-public-admin-404.png") });
  console.log("  [PASS] Public /admin is HTTP 404.");

  // 2. PUBLIC /admin/login MUST RETURN HTTP 404
  console.log("\n2. Verifying public /admin/login returns HTTP 404...");
  const res2 = await page.goto("https://buyandsellgh.com/admin/login", { waitUntil: "networkidle2", timeout: 25000 });
  console.log("  -> https://buyandsellgh.com/admin/login Status:", res2.status());
  assert.equal(res2.status(), 404, "buyandsellgh.com/admin/login must return 404");
  console.log("  [PASS] Public /admin/login is HTTP 404.");

  // 3. PUBLIC HOMEPAGE & STORE
  console.log("\n3. Verifying public storefront https://buyandsellgh.com...");
  const homeRes = await page.goto("https://buyandsellgh.com/", { waitUntil: "networkidle2", timeout: 25000 });
  console.log("  -> Homepage Status:", homeRes.status());
  assert.equal(homeRes.status(), 200, "Storefront must return 200");
  const title = await page.title();
  console.log("  -> Title:", title);
  assert.ok(title.includes("Buy & Sell GH"), "Title matches brand");

  const storeRes = await page.goto("https://buyandsellgh.com/store", { waitUntil: "networkidle2", timeout: 25000 });
  console.log("  -> Store Status:", storeRes.status());
  assert.equal(storeRes.status(), 200, "Store must return 200");
  const storeHasProducts = await page.evaluate(() => {
    return document.querySelectorAll("article, [data-product-id], .product-card").length > 0 || document.body.innerText.includes("GH₵");
  });
  console.log("  -> Store renders products & prices:", storeHasProducts);
  assert.ok(storeHasProducts, "Store renders active catalogue");
  await page.screenshot({ path: path.join(ARTIFACT_DIR, "live-final-storefront-products.png") });
  console.log("  [PASS] Storefront products and prices intact.");

  // 4. ADMIN SUBDOMAIN LANDING & LOGIN
  console.log("\n4. Verifying admin portal at https://admin.buyandsellgh.com...");
  const adminRes = await page.goto("https://admin.buyandsellgh.com/", { waitUntil: "networkidle2", timeout: 25000 });
  console.log("  -> Admin root status:", adminRes.status());
  assert.equal(adminRes.status(), 200, "Admin domain returns 200");
  console.log("  -> Final redirected URL:", page.url());
  assert.ok(page.url().includes("/admin"), "Redirects to /admin/login");

  const loginElements = await page.evaluate(() => {
    const email = !!document.querySelector("input[type='email']");
    const password = !!document.querySelector("input[type='password']");
    const submit = !!document.querySelector("button[type='submit']");
    const text = document.body.innerText;
    return {
      hasEmail: email,
      hasPassword: password,
      hasSubmit: submit,
      requiresAal2: text.includes("AAL2") || text.includes("authenticator"),
    };
  });
  console.log("  -> Login portal checks:", loginElements);
  assert.ok(loginElements.hasEmail && loginElements.hasPassword && loginElements.hasSubmit, "Login controls present");
  assert.ok(loginElements.requiresAal2, "AAL2 MFA requirement clearly stated");
  await page.screenshot({ path: path.join(ARTIFACT_DIR, "live-final-admin-login-screen.png") });
  console.log("  [PASS] Admin login and MFA boundary intact.");

  // 5. SENSITIVE ROUTE GUARDS ON ADMIN DOMAIN
  console.log("\n5. Verifying route guards on admin sensitive routes (unauthenticated)...");
  const routesToTest = ["/admin/products", "/admin/pricing", "/admin/orders", "/admin/settings"];
  for (const r of routesToTest) {
    await page.goto(`https://admin.buyandsellgh.com${r}`, { waitUntil: "networkidle2", timeout: 25000 });
    const currentUrl = page.url();
    assert.ok(currentUrl.includes("/admin/login"), `Route ${r} must redirect to login`);
  }
  console.log("  [PASS] All sensitive admin routes strictly redirect to /admin/login.");

  console.log("\n================================================================");
  console.log("  ALL LIVE PRODUCTION POST-DEPLOYMENT CHECKS COMPLETED: PASS    ");
  console.log("================================================================\n");
} finally {
  await browser.close();
}
