import puppeteer from "puppeteer-core";
import assert from "node:assert/strict";

const EDGE_PATH = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const BASE_URL = "https://buyandsellgh.com";

async function verifyLive() {
  console.log("=================================================");
  console.log("  VERIFYING LIVE PRODUCTION CONTACT LINKS        ");
  console.log("  URL: " + BASE_URL);
  console.log("=================================================\n");

  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  try {
    // 1. Check Homepage
    console.log("[TEST 1] Testing Homepage contact links...");
    await page.goto(`${BASE_URL}/`, { waitUntil: "networkidle2", timeout: 45000 });

    // Floating WhatsApp
    const floatingWhatsApp = await page.$eval(".floating-whatsapp, a[href*='wa.me']", el => ({
      href: el.getAttribute("href"),
      text: el.textContent?.trim()
    }));
    console.log("  Floating WhatsApp:", floatingWhatsApp);
    assert.ok(floatingWhatsApp.href.includes("233551975451"), "Floating WhatsApp links to 233551975451");

    // Footer Phone & WhatsApp
    const footerLinks = await page.$$eval(".store-footer-contact a", els =>
      els.map(el => ({ href: el.getAttribute("href"), text: el.textContent?.trim() }))
    );
    console.log("  Footer Contact Links:", footerLinks);
    const phoneFooter = footerLinks.find(l => l.href.startsWith("tel:"));
    const waFooter = footerLinks.find(l => l.href.includes("wa.me"));

    assert.ok(phoneFooter, "Footer contains tel: link");
    assert.equal(phoneFooter.href, "tel:+233551975451", "Footer phone link is tel:+233551975451");
    assert.ok(phoneFooter.text.includes("055 197 5451") || phoneFooter.text.includes("0551975451"), "Footer phone text displays 0551975451");

    assert.ok(waFooter, "Footer contains WhatsApp link");
    assert.equal(waFooter.href, "https://wa.me/233551975451", "Footer WhatsApp link is https://wa.me/233551975451");
    console.log("  [PASS] Homepage and footer verified.");

    // 2. Check Contact Page
    console.log("\n[TEST 2] Testing Contact Page (/contact)...");
    await page.goto(`${BASE_URL}/contact`, { waitUntil: "networkidle2", timeout: 45000 });

    const contactDetails = await page.$$eval(".contact-experience-details a", els =>
      els.map(el => ({ href: el.getAttribute("href"), text: el.textContent?.trim() }))
    );
    console.log("  Contact Details Links:", contactDetails);
    const callDetails = contactDetails.find(l => l.href.startsWith("tel:"));
    assert.ok(callDetails, "Contact details contains tel: link");
    assert.equal(callDetails.href, "tel:+233551975451", "Contact details phone link is tel:+233551975451");
    assert.ok(callDetails.text.includes("055 197 5451") || callDetails.text.includes("0551975451"), "Contact details text has 055 197 5451");

    const callShopBtn = await page.$eval("a.btn-secondary[href^='tel:']", el => ({
      href: el.getAttribute("href"),
      text: el.textContent?.trim()
    }));
    console.log("  Call Shop Button:", callShopBtn);
    assert.equal(callShopBtn.href, "tel:+233551975451", "Call Shop button is tel:+233551975451");
    console.log("  [PASS] Contact page verified.");

    // 3. Check Category Page
    console.log("\n[TEST 3] Testing Category Page (/store/iphone)...");
    await page.goto(`${BASE_URL}/store/iphone`, { waitUntil: "networkidle2", timeout: 45000 });

    const categoryWaLinks = await page.$$eval("a[href*='wa.me']", els =>
      els.map(el => el.getAttribute("href"))
    );
    console.log("  Category WhatsApp Links:", categoryWaLinks);
    assert.ok(categoryWaLinks.every(href => href.includes("233551975451")), "All category WhatsApp links use 233551975451");
    assert.ok(!categoryWaLinks.some(href => href.includes("233244182149")), "No category WhatsApp links use 233244182149");
    console.log("  [PASS] Category page verified.");

    // 4. Check Product Details Page
    console.log("\n[TEST 4] Testing Product Details Page...");
    await page.goto(`${BASE_URL}/product/iphone-16-pro-max`, { waitUntil: "networkidle2", timeout: 45000 });

    const productCallShop = await page.$eval("a[href^='tel:']", el => ({
      href: el.getAttribute("href"),
      text: el.textContent?.trim()
    }));
    console.log("  Product Call Shop Button:", productCallShop);
    assert.equal(productCallShop.href, "tel:+233551975451", "Product page Call Shop is tel:+233551975451");

    const productWa = await page.$eval("a.btn-secondary[href*='wa.me']", el => ({
      href: el.getAttribute("href"),
      text: el.textContent?.trim()
    }));
    console.log("  Product Enquiry WhatsApp Button:", productWa);
    assert.ok(productWa.href.startsWith("https://wa.me/233551975451?text="), "Product enquiry WhatsApp uses 233551975451");
    console.log("  [PASS] Product details page verified.");

    // 5. Test Mobile Viewport
    console.log("\n[TEST 5] Testing Mobile Viewport (390x844)...");
    await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
    await page.reload({ waitUntil: "networkidle2" });

    const mobileCallBtn = await page.$eval("a[href^='tel:']", el => el.getAttribute("href"));
    assert.equal(mobileCallBtn, "tel:+233551975451", "Mobile call button uses tel:+233551975451");

    const mobileWaBar = await page.$eval(".mobile-buy-bar a[href*='wa.me'], a[href*='wa.me']", el => el.getAttribute("href"));
    assert.ok(mobileWaBar.includes("233551975451"), "Mobile buy bar WhatsApp uses 233551975451");
    console.log("  [PASS] Mobile viewport verified.");

    console.log("\n=================================================");
    console.log("  ALL LIVE CHECKS PASSED 100%!                   ");
    console.log("=================================================");
  } finally {
    await browser.close();
  }
}

verifyLive().catch((err) => {
  console.error("Live verification failed:", err);
  process.exit(1);
});
