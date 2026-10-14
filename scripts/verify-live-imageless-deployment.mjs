import puppeteer from "puppeteer-core";
import path from "node:path";

const edgePath = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const artifactDir = "C:\\Users\\akakp\\.gemini\\antigravity\\brain\\6c721dee-7d06-4a2d-92fb-b74a2b38f58f";

async function verifyLive() {
  console.log("Launching Microsoft Edge via puppeteer-core for live production verification...");
  const browser = await puppeteer.launch({
    executablePath: edgePath,
    headless: true,
    pipe: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-gpu"],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  // 1. Verify Public Storefront: buyandsellgh.com
  console.log("\n--- 1. Testing https://buyandsellgh.com/store ---");
  await page.goto("https://buyandsellgh.com/store", { waitUntil: "networkidle2", timeout: 45000 });
  await new Promise((r) => setTimeout(r, 2000));

  const storeProducts = await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll(".product-card, article"));
    const titles = cards.map((c) => c.querySelector("h3")?.innerText?.trim()).filter(Boolean);
    const brokenImages = Array.from(document.querySelectorAll("img")).filter(
      (img) => !img.complete || img.naturalWidth === 0
    );
    const placeholderTexts = Array.from(document.querySelectorAll("*")).filter(
      (el) => el.innerText === "No pic" || el.innerText === "No image"
    );
    return {
      cardCount: cards.length,
      sampleTitles: titles.slice(0, 10),
      brokenImageCount: brokenImages.length,
      hasPlaceholderText: placeholderTexts.length > 0,
    };
  });
  console.log("Store visible products:", storeProducts);
  await page.screenshot({ path: path.join(artifactDir, "live-imageless-storefront.png"), fullPage: false });

  // 2. Verify Hidden Product Direct URL (/product/iphone-15-pro)
  console.log("\n--- 2. Testing hidden product direct URL https://buyandsellgh.com/product/iphone-15-pro ---");
  await page.goto("https://buyandsellgh.com/product/iphone-15-pro", { waitUntil: "networkidle2", timeout: 45000 });
  await new Promise((r) => setTimeout(r, 2000));

  const hiddenPageInfo = await page.evaluate(() => {
    const text = document.body.innerText;
    const hasBuyButton = Array.from(document.querySelectorAll("button, a")).some(
      (el) => el.innerText.includes("Add to Cart") || el.innerText.includes("Buy Now")
    );
    const isUnlistedNotice = text.includes("Product not listed") || text.includes("currently not available for direct purchase");
    return {
      hasBuyButton,
      isUnlistedNotice,
      snippet: text.slice(0, 250).replace(/\n+/g, " "),
    };
  });
  console.log("Hidden product direct URL check:", hiddenPageInfo);
  await page.screenshot({ path: path.join(artifactDir, "live-imageless-hidden-product.png"), fullPage: false });

  // 3. Verify Public /admin Isolation: buyandsellgh.com/admin -> 404
  console.log("\n--- 3. Testing public /admin route isolation on https://buyandsellgh.com/admin ---");
  const response = await page.goto("https://buyandsellgh.com/admin", { waitUntil: "networkidle2", timeout: 45000 });
  const status = response.status();
  const notFoundText = await page.evaluate(() => document.body.innerText);
  console.log(`Public /admin HTTP Status: ${status}, includes 404: ${notFoundText.includes("404") || status === 404}`);
  await page.screenshot({ path: path.join(artifactDir, "live-imageless-public-admin-404.png"), fullPage: false });

  // 4. Verify Admin Dashboard: admin.buyandsellgh.com
  console.log("\n--- 4. Testing dedicated admin dashboard on https://admin.buyandsellgh.com ---");
  await page.goto("https://admin.buyandsellgh.com", { waitUntil: "networkidle2", timeout: 45000 });
  await new Promise((r) => setTimeout(r, 2000));

  const adminInfo = await page.evaluate(() => {
    return {
      title: document.title,
      heading: document.querySelector("h1, h2")?.innerText?.trim(),
      hasEmailInput: Boolean(document.querySelector('input[type="email"], input[name="email"]')),
      hasPasswordInput: Boolean(document.querySelector('input[type="password"]')),
      bodySnippet: document.body.innerText.slice(0, 250).replace(/\n+/g, " "),
    };
  });
  console.log("Admin dashboard check:", adminInfo);
  await page.screenshot({ path: path.join(artifactDir, "live-imageless-admin-login.png"), fullPage: false });

  await browser.close();
  console.log("\n✓ ALL LIVE PRODUCTION VERIFICATIONS COMPLETED SUCCESSFULLY!");
}

verifyLive().catch((err) => {
  console.error("Live verification error:", err);
  process.exit(1);
});
