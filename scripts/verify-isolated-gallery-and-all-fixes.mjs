import assert from "node:assert/strict";
import fs from "node:fs";
import http from "node:http";
import os from "node:os";
import path from "node:path";
import zlib from "node:zlib";
import puppeteer from "puppeteer-core";

const EDGE_PATH = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const DIST_DIR = path.resolve("dist");
const ARTIFACTS_DIR = "C:\\Users\\akakp\\.gemini\\antigravity\\brain\\6c721dee-7d06-4a2d-92fb-b74a2b38f58f";

function createValidPngBuffer(r, g, b, width = 64, height = 64) {
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const crcTable = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    crcTable[n] = c;
  }
  function crc32(buf) {
    let c = 0xffffffff;
    for (let i = 0; i < buf.length; i++) {
      c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
    }
    return (c ^ 0xffffffff) >>> 0;
  }
  function makeChunk(type, data) {
    const typeBuf = Buffer.from(type, "ascii");
    const lenBuf = Buffer.alloc(4);
    lenBuf.writeUInt32BE(data.length, 0);
    const crcInput = Buffer.concat([typeBuf, data]);
    const crcBuf = Buffer.alloc(4);
    crcBuf.writeUInt32BE(crc32(crcInput), 0);
    return Buffer.concat([lenBuf, typeBuf, data, crcBuf]);
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 2;
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const rawData = Buffer.alloc(height * (1 + width * 3));
  for (let y = 0; y < height; y++) {
    const rowStart = y * (1 + width * 3);
    rawData[rowStart] = 0;
    for (let x = 0; x < width; x++) {
      const px = rowStart + 1 + x * 3;
      rawData[px] = r;
      rawData[px + 1] = g;
      rawData[px + 2] = b;
    }
  }
  const compressed = zlib.deflateSync(rawData);
  return Buffer.concat([
    signature,
    makeChunk("IHDR", ihdr),
    makeChunk("IDAT", compressed),
    makeChunk("IEND", Buffer.alloc(0)),
  ]);
}

function startStaticServer(rootDir) {
  const mimeTypes = {
    ".html": "text/html; charset=utf-8",
    ".js": "application/javascript; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".webp": "image/webp",
    ".svg": "image/svg+xml",
    ".ico": "image/x-icon",
    ".mp4": "video/mp4",
    ".woff2": "font/woff2",
  };

  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      const parsedUrl = new URL(req.url || "/", "http://127.0.0.1");
      const pathname = decodeURIComponent(parsedUrl.pathname);
      const filePath = path.join(rootDir, pathname);

      if (!filePath.startsWith(rootDir)) {
        res.writeHead(403);
        res.end("Forbidden");
        return;
      }

      if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
        const ext = path.extname(filePath).toLowerCase();
        res.writeHead(200, { "Content-Type": mimeTypes[ext] || "application/octet-stream" });
        fs.createReadStream(filePath).pipe(res);
      } else {
        const indexHtml = path.join(rootDir, "index.html");
        res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
        fs.createReadStream(indexHtml).pipe(res);
      }
    });

    server.listen(0, "127.0.0.1", () => {
      const addr = server.address();
      resolve({ server, baseUrl: `http://127.0.0.1:${addr.port}` });
    });
  });
}

async function run() {
  const envText = fs.readFileSync(".env.local", "utf-8");
  const supabaseUrl = envText.match(/VITE_SUPABASE_URL=([^\r\n]+)/)?.[1]?.trim();
  const supabaseKey = envText.match(/VITE_SUPABASE_ANON_KEY=([^\r\n]+)/)?.[1]?.trim();
  assert.ok(supabaseUrl && supabaseKey, "Supabase credentials must exist in .env.local");

  let sbRes;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      sbRes = await fetch(`${supabaseUrl}/rest/v1/storefront_content?key=eq.buy_galleries&select=config`, {
        headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` },
      });
      if (sbRes.ok) break;
    } catch (err) {
      if (attempt === 3) throw err;
      await new Promise((r) => setTimeout(r, 1500));
    }
  }
  assert.ok(sbRes && sbRes.ok, "Supabase storefront_content buy_galleries must be readable");
  const sbRows = await sbRes.json();
  const remoteBuyGalleries = sbRows[0]?.config || {};

  const { server, baseUrl } = await startStaticServer(DIST_DIR);
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "agy-gallery-verify-"));
  const img1Path = path.join(tmpDir, "qa-test-angle-1-red.png");
  const img2Path = path.join(tmpDir, "qa-test-angle-2-green.png");
  const img3Path = path.join(tmpDir, "qa-test-angle-3-blue.png");
  const img2ReplacedPath = path.join(tmpDir, "qa-test-angle-2-replaced-gold.png");

  fs.writeFileSync(img1Path, createValidPngBuffer(220, 40, 40));
  fs.writeFileSync(img2Path, createValidPngBuffer(40, 180, 60));
  fs.writeFileSync(img3Path, createValidPngBuffer(40, 90, 220));
  fs.writeFileSync(img2ReplacedPath, createValidPngBuffer(212, 175, 55));

  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: true,
    userDataDir: path.join(tmpDir, "profile"),
    args: ["--no-first-run", "--no-sandbox"],
  });

  const report = {
    timestamp: new Date().toISOString(),
    isolatedGalleryTest: {},
    canonicalConsistency: {},
    mobileStoreSwipe: {},
    desktopStoreGrid: {},
    addToBagAndCheckout: {},
  };

  try {
    // Two tabs sharing localStorage: adminPage (with sessionStorage admin_preview_active=1) & publicPage (public router)
    const adminPage = await browser.newPage();
    const publicPage = await browser.newPage();
    await adminPage.setViewport({ width: 1440, height: 900 });
    await publicPage.setViewport({ width: 1440, height: 900 });

    adminPage.on("dialog", async (dialog) => {
      await dialog.accept();
    });

    // =========================================================================
    // PART 1: AUTHENTICATED ADMIN GALLERY LIFECYCLE ON HIDDEN TEST PRODUCT
    // =========================================================================
    console.log("1. Establishing authorized Admin test session & hidden non-purchasable test product...");
    const testSlug = "qa-isolated-gallery-test-device";
    const testProduct = {
      id: testSlug,
      slug: testSlug,
      name: "QA Isolated Gallery Test Device",
      brand: "Apple",
      category: "iPhones",
      subcategory: "iPhone QA",
      model: "iPhone QA Test",
      condition: "Brand New",
      price: 0,
      priceOnRequest: true,
      storage: ["256GB"],
      colors: ["Space Black", "Silver"],
      defaultColor: "Space Black",
      description: "Hidden non-purchasable test product for automated Admin gallery verification.",
      specs: ["Isolated QA Test Device"],
      box: ["Test Device"],
      images: [{ src: "/products/homepage/iphone-18-pro-hero-2x.webp", alt: "Initial seed image" }],
      available: false, // Hidden from public Store & Search
      archived: false,
      stockStatus: "Out of Stock",
      stockQuantity: 0,
      featured: false,
      updatedAt: new Date().toISOString(),
    };

    await adminPage.goto(`${baseUrl}/?admin_preview=1`, { waitUntil: "domcontentloaded" });
    await adminPage.evaluate((prod) => {
      sessionStorage.setItem("admin_preview_active", "1");
      localStorage.setItem("admin_preview_active", "1");
      localStorage.setItem(
        "buyandsell-gh-temp-admin-session",
        JSON.stringify({
          userId: "admin-qa-verification",
          email: "admin@buyandsellgh.com",
          mode: "local",
          role: "owner",
          assuranceLevel: "aal2",
          verifiedTotpFactors: [],
        })
      );
      localStorage.setItem("buyandsell-gh-admin-test-products-v1", JSON.stringify([prod]));
    }, testProduct);

    // Verify hidden test product is NOT visible in public Store (/iphone) on publicPage
    await publicPage.goto(`${baseUrl}/iphone`, { waitUntil: "domcontentloaded" });
    await publicPage.waitForSelector(".store-cat-products-grid", { timeout: 30000 });
    await new Promise((r) => setTimeout(r, 1200));
    const visibleInStore = await publicPage.evaluate((slug) => {
      return Boolean(document.querySelector(`a[href*="${slug}"]`));
    }, testSlug);
    assert.equal(visibleInStore, false, "Hidden test product must NOT appear in public Store");

    // Open Admin Products & search for hidden test product
    console.log("2. Opening Admin Products -> Buy Page Image Gallery for isolated test product...");
    await adminPage.goto(`${baseUrl}/admin/products?view=maintenance&search=${testSlug}`, { waitUntil: "domcontentloaded" });
    await adminPage.waitForSelector(".admin-data-table", { timeout: 30000 });
    await new Promise((r) => setTimeout(r, 1200));

    const openedGallery = await adminPage.evaluate((name) => {
      const rows = [...document.querySelectorAll(".admin-data-table tbody tr")];
      const targetRow = rows.find((r) => r.textContent?.includes(name));
      if (!targetRow) return false;
      const galBtn = [...targetRow.querySelectorAll("button")].find((b) => b.textContent?.includes("Gallery"));
      if (!galBtn) return false;
      galBtn.click();
      return true;
    }, testProduct.name);
    assert.ok(openedGallery, "Must find hidden test product in Admin Products and open its Buy Page Image Gallery");

    await adminPage.waitForSelector('[data-testid="buy-page-image-gallery"]', { timeout: 15000 });
    await new Promise((r) => setTimeout(r, 600));

    // Delete initial seed image so gallery contains strictly our uploaded images
    await adminPage.evaluate(() => {
      const delBtn = document.querySelector(".buy-gallery-icon-btn.is-danger");
      if (delBtn) delBtn.click();
    });
    await new Promise((r) => setTimeout(r, 300));
    await adminPage.evaluate(() => {
      const confirmBtn = [...document.querySelectorAll(".buy-gallery-modal-overlay button")].find((b) =>
        b.textContent?.includes("Delete Image")
      );
      if (confirmBtn) confirmBtn.click();
    });
    await new Promise((r) => setTimeout(r, 400));

    // Step 1: Upload 3 gallery images via file input
    console.log("3. Step 1: Uploading 3 gallery images...");
    for (const filePath of [img1Path, img2Path, img3Path]) {
      const fileInputs = await adminPage.$$('.buy-gallery-upload-card input[type="file"]');
      assert.ok(fileInputs.length > 0, "Upload file input must exist");
      await fileInputs[0].uploadFile(filePath);
      await new Promise((r) => setTimeout(r, 700));
    }

    const uploadedCount = await adminPage.$$eval(".buy-gallery-card", (cards) => cards.length);
    assert.equal(uploadedCount, 3, "Admin gallery should have 3 uploaded image cards");

    // Step 2: Save Draft
    console.log("4. Step 2: Saving Draft & verifying draft is not exposed publicly...");
    await adminPage.evaluate(() => {
      const btn = [...document.querySelectorAll("button")].find((b) => b.textContent?.includes("Save Draft"));
      if (btn) btn.click();
    });
    await new Promise((r) => setTimeout(r, 800));
    const draftBadge = await adminPage.$eval(".buy-gallery-status-badge", (el) => el.textContent?.trim() || "");
    assert.match(draftBadge, /Draft Changes/i, "Draft badge must be active after Save Draft");

    // Verify public Buy page does NOT expose unpublished draft
    await publicPage.goto(`${baseUrl}/shop/buy-iphone/${testSlug}`, { waitUntil: "domcontentloaded" });
    await publicPage.waitForSelector("h1", { timeout: 20000 });
    await new Promise((r) => setTimeout(r, 1000));
    const prePublishSlides = await publicPage.$$eval(".apple-buy-swipe-slide img", (imgs) => imgs.map((i) => i.src));
    assert.ok(
      !prePublishSlides.some((src) => src.startsWith("data:image/png")),
      "Unpublished draft images must NOT appear on the public Buy page before Publish Live"
    );

    // Step 3: Publish Live
    console.log("5. Step 3: Publishing Gallery Live...");
    const expectedAfterFirstPublish = await adminPage.$$eval(".buy-gallery-card .buy-gallery-img-container img", (imgs) =>
      imgs.map((i) => i.src)
    );
    assert.equal(expectedAfterFirstPublish.length, 3, "Draft must have 3 uploaded images");

    await adminPage.evaluate(() => {
      const btn = [...document.querySelectorAll("button")].find((b) => b.textContent?.includes("Publish Gallery"));
      if (btn) btn.click();
    });
    await new Promise((r) => setTimeout(r, 1000));
    const liveBadge = await adminPage.$eval(".buy-gallery-status-badge", (el) => el.textContent?.trim() || "");
    assert.match(liveBadge, /Published Live/i, "Published Live badge must be active after publishing");
    await adminPage.screenshot({ path: path.join(ARTIFACTS_DIR, "admin-isolated-gallery-published-step3.png") });

    // Step 4: Verify published images appear on the correct Buy page & direct route
    console.log("6. Step 4: Verifying published images on Buy page and direct route...");
    await publicPage.goto(`${baseUrl}/shop/buy-iphone/${testSlug}`, { waitUntil: "domcontentloaded" });
    await publicPage.waitForSelector(".apple-buy-swipe-slide img", { timeout: 20000 });
    await new Promise((r) => setTimeout(r, 1000));
    const buyPageSlides1 = await publicPage.$$eval(".apple-buy-swipe-slide img", (imgs) => imgs.map((i) => i.src));
    assert.deepEqual(buyPageSlides1, expectedAfterFirstPublish, "Public Buy page must display the exact 3 published images in order");

    await publicPage.goto(`${baseUrl}/product/${testSlug}`, { waitUntil: "domcontentloaded" });
    await publicPage.waitForSelector(".apple-buy-swipe-slide img", { timeout: 20000 });
    await new Promise((r) => setTimeout(r, 1000));
    const directPageSlides1 = await publicPage.$$eval(".apple-buy-swipe-slide img", (imgs) => imgs.map((i) => i.src));
    assert.deepEqual(directPageSlides1, expectedAfterFirstPublish, "Direct /product/:slug page must display the exact 3 published images");

    // Step 5 & 6: Replace 2nd image, reorder 3rd image to Main, delete 1st image, and Publish Live
    console.log("7. Steps 5 & 6: Replacing image, reordering Main image, deleting image, and publishing...");
    await adminPage.evaluate(() => {
      const cards = [...document.querySelectorAll(".buy-gallery-card")];
      const replaceBtn = cards[1]?.querySelector('button[title="Replace Image with new photo"]');
      if (replaceBtn) replaceBtn.click();
    });
    await adminPage.waitForSelector('.buy-gallery-modal-overlay input[type="file"]', { timeout: 10000 });
    const replaceInput = await adminPage.$('.buy-gallery-modal-overlay input[type="file"]');
    assert.ok(replaceInput, "Replace modal file input must open");
    await replaceInput.uploadFile(img2ReplacedPath);
    await new Promise((r) => setTimeout(r, 800));

    // Reorder: Set 3rd card (index 2) as Main image (moves to index 0)
    await adminPage.evaluate(() => {
      const cards = [...document.querySelectorAll(".buy-gallery-card")];
      const thirdCardBtns = [...(cards[2]?.querySelectorAll("button") || [])];
      const setMainBtn = thirdCardBtns.find((b) => b.getAttribute("title")?.includes("Main"));
      setMainBtn?.click();
    });
    await new Promise((r) => setTimeout(r, 500));

    // Delete the card now at index 1 (originally 1st image)
    await adminPage.evaluate(() => {
      const cards = [...document.querySelectorAll(".buy-gallery-card")];
      const delBtn = cards[1]?.querySelector(".buy-gallery-icon-btn.is-danger");
      if (delBtn) delBtn.click();
    });
    await new Promise((r) => setTimeout(r, 300));
    await adminPage.evaluate(() => {
      const confirmBtn = [...document.querySelectorAll(".buy-gallery-modal-overlay button")].find((b) =>
        b.textContent?.includes("Delete Image")
      );
      if (confirmBtn) confirmBtn.click();
    });
    await new Promise((r) => setTimeout(r, 500));

    const expectedAfterUpdatePublish = await adminPage.$$eval(".buy-gallery-card .buy-gallery-img-container img", (imgs) =>
      imgs.map((i) => i.src)
    );
    assert.equal(expectedAfterUpdatePublish.length, 2, "Gallery should now have 2 images after deletion");
    assert.equal(expectedAfterUpdatePublish[0], expectedAfterFirstPublish[2], "Reordered 3rd image must now be first (Main)");
    assert.notEqual(expectedAfterUpdatePublish[1], expectedAfterFirstPublish[1], "2nd image must be the newly replaced image");

    // Publish Live
    await adminPage.evaluate(() => {
      const btn = [...document.querySelectorAll("button")].find((b) => b.textContent?.includes("Publish Gallery"));
      if (btn) btn.click();
    });
    await new Promise((r) => setTimeout(r, 1000));

    // Step 7: Verify public Buy page reflects replaced, reordered, and deleted gallery + persists on reload
    console.log("8. Step 7: Verifying updated gallery on public Buy page & after refresh...");
    await publicPage.goto(`${baseUrl}/shop/buy-iphone/${testSlug}`, { waitUntil: "domcontentloaded" });
    await publicPage.waitForSelector(".apple-buy-swipe-slide img", { timeout: 20000 });
    await new Promise((r) => setTimeout(r, 1000));
    const buyPageSlides2 = await publicPage.$$eval(".apple-buy-swipe-slide img", (imgs) => imgs.map((i) => i.src));
    assert.deepEqual(buyPageSlides2, expectedAfterUpdatePublish, "Public Buy page must reflect replaced, reordered, and deleted images");

    await publicPage.reload({ waitUntil: "domcontentloaded" });
    await publicPage.waitForSelector(".apple-buy-swipe-slide img", { timeout: 20000 });
    await new Promise((r) => setTimeout(r, 1000));
    const buyPageSlidesAfterReload = await publicPage.$$eval(".apple-buy-swipe-slide img", (imgs) => imgs.map((i) => i.src));
    assert.deepEqual(buyPageSlidesAfterReload, expectedAfterUpdatePublish, "Updated gallery must persist after page reload");
    await publicPage.screenshot({ path: path.join(ARTIFACTS_DIR, "public-isolated-gallery-verified-step7.png") });

    // Step 8: Restore and safely remove all test data
    console.log("9. Step 8: Removing isolated test product and cleaning up test state...");
    await adminPage.evaluate((slug) => {
      localStorage.removeItem("buyandsell-gh-admin-test-products-v1");
      localStorage.removeItem("admin_preview_active");
      sessionStorage.removeItem("admin_preview_active");
      localStorage.removeItem("buyandsell-gh-temp-admin-session");
      for (const key of ["buy_galleries_published_v1", "buy_galleries_drafts_v1"]) {
        const raw = localStorage.getItem(key);
        if (raw) {
          const parsed = JSON.parse(raw);
          delete parsed[slug];
          localStorage.setItem(key, JSON.stringify(parsed));
        }
      }
    }, testSlug);

    report.isolatedGalleryTest = {
      passed: true,
      testSlug,
      hiddenFromPublicStore: !visibleInStore,
      uploadedImagesCount: 3,
      draftProtectedBeforePublish: true,
      publishedGalleryCountStep4: buyPageSlides1.length,
      updatedGalleryCountStep7: buyPageSlides2.length,
      mainImageReorderedCorrectly: expectedAfterUpdatePublish[0] === expectedAfterFirstPublish[2],
      replacedImageApplied: expectedAfterUpdatePublish[1] !== expectedAfterFirstPublish[1],
      persistedAfterRefresh: true,
      cleanedUpTestData: true,
    };

    // =========================================================================
    // PART 2: VERIFY ALL EXISTING FIXES (HOMEPAGE, STORE, SEARCH, GALLERIES, SWIPE, BAG)
    // =========================================================================
    console.log("10. Verifying Homepage, Store, Search, and Direct URL gallery consistency (iPhone 18 Pro & iPhone 16)...");
    const expected18Pro = remoteBuyGalleries["iphone-18-pro"]?.items?.map((it) => new URL(it.src, baseUrl).href) || [];
    const expected16 = remoteBuyGalleries["iphone-16"]?.items?.map((it) => new URL(it.src, baseUrl).href) || [];
    assert.equal(expected18Pro.length, 4, "Supabase should have 4 published images for iphone-18-pro");
    assert.equal(expected16.length, 3, "Supabase should have 3 published images for iphone-16");

    await publicPage.goto(`${baseUrl}/shop/buy-iphone/iphone-18-pro`, { waitUntil: "domcontentloaded" });
    await publicPage.waitForSelector(".apple-buy-swipe-slide img", { timeout: 30000 });
    await new Promise((r) => setTimeout(r, 1500));
    const gallery18ProBuy = await publicPage.$$eval(".apple-buy-swipe-slide img", (imgs) => imgs.map((i) => i.currentSrc || i.src));
    assert.deepEqual(gallery18ProBuy, expected18Pro, "iPhone 18 Pro Buy page must display all 4 Supabase published images");

    await publicPage.goto(`${baseUrl}/product/iphone-18-pro`, { waitUntil: "domcontentloaded" });
    await publicPage.waitForSelector(".apple-buy-swipe-slide img", { timeout: 30000 });
    await new Promise((r) => setTimeout(r, 1500));
    const gallery18ProDirect = await publicPage.$$eval(".apple-buy-swipe-slide img", (imgs) => imgs.map((i) => i.currentSrc || i.src));
    assert.deepEqual(gallery18ProDirect, expected18Pro, "iPhone 18 Pro /product/:slug page must display all 4 Supabase published images");

    // Check iPhone 16 (non-homepage product with finishItems in Supabase)
    await publicPage.goto(`${baseUrl}/shop/buy-iphone/iphone-16`, { waitUntil: "domcontentloaded" });
    await publicPage.waitForSelector(".apple-buy-swipe-slide img", { timeout: 30000 });
    await new Promise((r) => setTimeout(r, 1500));
    const gallery16Buy = await publicPage.$$eval(".apple-buy-swipe-slide img", (imgs) => imgs.map((i) => i.currentSrc || i.src));
    assert.deepEqual(gallery16Buy, expected16, "iPhone 16 Buy page must display all 3 Supabase published images");

    await publicPage.goto(`${baseUrl}/product/iphone-16`, { waitUntil: "domcontentloaded" });
    await publicPage.waitForSelector(".apple-buy-swipe-slide img", { timeout: 30000 });
    await new Promise((r) => setTimeout(r, 1500));
    const gallery16Direct = await publicPage.$$eval(".apple-buy-swipe-slide img", (imgs) => imgs.map((i) => i.currentSrc || i.src));
    assert.deepEqual(gallery16Direct, expected16, "iPhone 16 /product/:slug page must display all 3 Supabase published images");

    // Verify Homepage CTA, Store card CTA, and Search bar result all resolve to canonical routes with identical gallery
    await publicPage.goto(`${baseUrl}/`, { waitUntil: "domcontentloaded" });
    await publicPage.waitForSelector('a[href="/shop/buy-iphone/iphone-18-pro"]', { timeout: 20000 });
    const homepageHref = await publicPage.$eval('a[href="/shop/buy-iphone/iphone-18-pro"]', (el) => el.getAttribute("href"));
    assert.equal(homepageHref, "/shop/buy-iphone/iphone-18-pro");

    await publicPage.click('button[aria-label="Search products"]');
    await publicPage.waitForSelector(".instant-search-input input", { timeout: 10000 });
    await publicPage.type(".instant-search-input input", "iPhone 18 Pro");
    await publicPage.waitForSelector('.instant-search-result a[href="/product/iphone-18-pro"]', { timeout: 15000 });
    const searchHref = await publicPage.$eval('.instant-search-result a[href="/product/iphone-18-pro"]', (el) => el.getAttribute("href"));
    assert.equal(searchHref, "/product/iphone-18-pro");

    // Verify 5 unseeded homepage promotions remain enquiry-only
    console.log("11. Verifying 5 unseeded homepage promotions remain enquiry-only...");
    const enquiryPromos = [
      { path: "/shop/buy-watch/apple-watch-series-12", title: /Apple Watch Series 12/i },
      { path: "/shop/buy-watch/apple-watch-ultra-4", title: /Apple Watch Ultra 4/i },
      { path: "/shop/buy-ipad/ipad-air", title: /iPad Air/i },
      { path: "/shop/buy-mac/macbook-air", title: /MacBook Air/i },
      { path: "/shop/buy-mac/mac-mini", title: /Mac mini/i },
    ];
    for (const promo of enquiryPromos) {
      await publicPage.goto(`${baseUrl}${promo.path}`, { waitUntil: "domcontentloaded" });
      await publicPage.waitForFunction(
        () => {
          const text = document.querySelector("h1")?.textContent?.trim() || "";
          return text.length > 0 && !/Loading product/i.test(text);
        },
        { timeout: 30000 }
      );
      await new Promise((r) => setTimeout(r, 400));
      const info = await publicPage.evaluate(() => ({
        h1: document.querySelector("h1")?.textContent?.trim() || "",
        hasAddToBag: [...document.querySelectorAll("button")].some((b) => /Add to Bag/i.test(b.textContent || "") && !b.disabled),
      }));
      assert.match(info.h1, promo.title, `${promo.path} heading must match ${promo.title}`);
      assert.equal(info.hasAddToBag, false, `${promo.path} must remain enquiry-only without enabled Add to Bag`);
    }

    // Verify Add to Bag on canonical in-stock product (iPhone 18 Pro) & Checkout page without submitting an order
    console.log("12. Verifying Add to Bag and Checkout page with canonical in-stock product (without submitting order)...");
    await publicPage.goto(`${baseUrl}/shop/buy-iphone/iphone-18-pro`, { waitUntil: "domcontentloaded" });
    await publicPage.waitForFunction(
      () => {
        const text = document.querySelector("h1")?.textContent?.trim() || "";
        return text.length > 0 && !/Loading product/i.test(text);
      },
      { timeout: 30000 }
    );
    await new Promise((r) => setTimeout(r, 800));
    const addedToBag = await publicPage.evaluate(() => {
      const btn = [...document.querySelectorAll("button")].find((b) => /Add to Bag/i.test(b.textContent || ""));
      if (!btn || btn.disabled) return false;
      btn.click();
      return true;
    });
    assert.ok(addedToBag, "Add to Bag button on iPhone 18 Pro must be enabled and clickable");
    await new Promise((r) => setTimeout(r, 800));
    const cartRaw = await publicPage.evaluate(() => localStorage.getItem("buyandsell-gh-cart"));
    const cartItems = JSON.parse(cartRaw || "[]");
    assert.ok(cartItems.length > 0 && cartItems[0].product?.slug === "iphone-18-pro", "Cart must contain canonical iPhone 18 Pro");

    await publicPage.goto(`${baseUrl}/checkout`, { waitUntil: "domcontentloaded" });
    await publicPage.waitForFunction(
      () => document.body.innerText.includes("iPhone 18 Pro"),
      { timeout: 20000 }
    );
    const checkoutVerified = await publicPage.evaluate(() => {
      const text = document.body.innerText;
      const hasInput = Boolean(document.querySelector("input, textarea, select"));
      return text.includes("iPhone 18 Pro") && hasInput;
    });
    assert.ok(checkoutVerified, "Checkout page must render canonical bag item and form inputs without submitting an order");
    report.addToBagAndCheckout = {
      passed: true,
      cartItemSlug: cartItems[0].product.slug,
      price: cartItems[0].product.price,
      checkoutPageVerified: checkoutVerified,
    };

    // Verify Desktop Store Grid
    await publicPage.goto(`${baseUrl}/iphone`, { waitUntil: "domcontentloaded" });
    await publicPage.waitForSelector(".store-cat-products-grid", { timeout: 30000 });
    await new Promise((r) => setTimeout(r, 1000));
    const desktopGrid = await publicPage.$eval(".store-cat-products-grid", (el) => {
      const css = getComputedStyle(el);
      const rowCss = el.querySelector(".store-cat-products-row")
        ? getComputedStyle(el.querySelector(".store-cat-products-row")).display
        : "none";
      return {
        display: css.display,
        rowDisplay: rowCss,
        cols: css.gridTemplateColumns.split(" ").length,
      };
    });
    assert.equal(desktopGrid.display, "grid", "Desktop Store must use standard CSS grid");
    assert.equal(desktopGrid.rowDisplay, "contents", "Desktop Store rows must use display: contents");
    assert.ok(desktopGrid.cols >= 3, "Desktop Store must display multiple columns");
    report.desktopStoreGrid = desktopGrid;

    // Verify Mobile Store Independent Row Horizontal Scrolling & Vertical Scrolling across all 6 departments
    console.log("13. Verifying Mobile Store independent horizontal row scrolling & vertical scrolling across all 6 departments...");
    await publicPage.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
    const mobileDepartments = {};
    for (const dept of ["/iphone", "/mac", "/ipad", "/watch", "/airpods", "/accessories"]) {
      await publicPage.goto(`${baseUrl}${dept}`, { waitUntil: "domcontentloaded" });
      await publicPage.waitForSelector(".store-cat-products-grid", { timeout: 30000 });
      await new Promise((r) => setTimeout(r, 1000));
      const metrics = await publicPage.evaluate(() => {
        const grid = document.querySelector(".store-cat-products-grid");
        const rows = [...document.querySelectorAll(".store-cat-products-row")];
        const productCount = grid ? grid.querySelectorAll(".store-cat-grid-card").length : 0;
        const expectedRows = productCount >= 7 ? 3 : productCount >= 4 ? 2 : 1;

        const rowDetails = rows.map((row) => ({
          cards: row.querySelectorAll(".store-cat-grid-card").length,
          scrollWidth: row.scrollWidth,
          clientWidth: row.clientWidth,
          cardWidth: row.querySelector(".store-cat-grid-card")?.getBoundingClientRect().width || 0,
        }));

        const independentScrollChecks = rows.map((_, targetIdx) => {
          rows.forEach((r) => {
            r.scrollLeft = 0;
          });
          rows[targetIdx].scrollLeft = 180;
          const offsetsAfterLeft = rows.map((r) => r.scrollLeft);
          const movedOnlyTargetLeft =
            offsetsAfterLeft[targetIdx] > 0 &&
            offsetsAfterLeft.every((val, idx) => idx === targetIdx || val === 0);

          rows[targetIdx].scrollLeft = 0;
          const offsetsAfterRight = rows.map((r) => r.scrollLeft);
          const movedBackRight = offsetsAfterRight.every((val) => val === 0);
          return movedOnlyTargetLeft && movedBackRight;
        });

        return {
          productCount,
          expectedRows,
          actualRows: rows.length,
          rowDetails,
          allRowsIndependent: independentScrollChecks.every(Boolean),
          pageScrollWidth: document.documentElement.scrollWidth,
          viewportWidth: window.innerWidth,
        };
      });

      assert.equal(metrics.actualRows, metrics.expectedRows, `${dept} must have ${metrics.expectedRows} independent row(s)`);
      assert.ok(metrics.allRowsIndependent, `${dept} rows must scroll left and right independently without moving other rows`);
      assert.ok(
        metrics.rowDetails.every((r) => Math.abs(r.cardWidth - r.clientWidth) < 2),
        `${dept} mobile cards must maintain full width without shrinking`
      );
      assert.ok(metrics.pageScrollWidth <= metrics.viewportWidth + 2, `${dept} must not overflow horizontally`);
      mobileDepartments[dept] = metrics;
    }

    // Touch gesture verification on /iphone (horizontal left, horizontal right, and vertical page scroll)
    await publicPage.goto(`${baseUrl}/iphone`, { waitUntil: "domcontentloaded" });
    await publicPage.waitForSelector(".store-cat-products-row", { timeout: 30000 });
    await new Promise((r) => setTimeout(r, 800));
    await publicPage.$eval(".store-cat-products-row:first-child .store-cat-grid-card-img", (img) =>
      img.scrollIntoView({ block: "center", behavior: "instant" })
    );
    await new Promise((r) => setTimeout(r, 300));
    const center = await publicPage.$eval(".store-cat-products-row:first-child .store-cat-grid-card-img", (img) => {
      const rect = img.getBoundingClientRect();
      return { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 };
    });

    // Swipe left on Row 1
    await publicPage.touchscreen.touchStart(center.x, center.y);
    for (let s = 1; s <= 6; s++) {
      await publicPage.touchscreen.touchMove(center.x - s * 25, center.y);
      await new Promise((r) => setTimeout(r, 25));
    }
    await publicPage.touchscreen.touchEnd();
    await new Promise((r) => setTimeout(r, 250));
    const afterSwipeLeft = await publicPage.evaluate(() =>
      [...document.querySelectorAll(".store-cat-products-row")].map((r) => r.scrollLeft)
    );
    assert.ok(afterSwipeLeft[0] > 0 && afterSwipeLeft[1] === 0 && afterSwipeLeft[2] === 0, "Touch swipe left on Row 1 must move only Row 1");

    // Swipe up (vertical scroll) starting on Row 1 image
    const beforeY = await publicPage.evaluate(() => window.scrollY);
    await publicPage.touchscreen.touchStart(center.x, center.y);
    for (let s = 1; s <= 6; s++) {
      await publicPage.touchscreen.touchMove(center.x, center.y - s * 22);
      await new Promise((r) => setTimeout(r, 25));
    }
    await publicPage.touchscreen.touchEnd();
    await new Promise((r) => setTimeout(r, 250));
    const afterY = await publicPage.evaluate(() => window.scrollY);
    assert.ok(afterY > beforeY, "Vertical touch gesture on product row must scroll the page vertically");

    report.mobileStoreSwipe = {
      passed: true,
      independentHorizontalTouchVerified: true,
      verticalPageTouchScrollVerified: true,
      departments: mobileDepartments,
    };
    report.canonicalConsistency = {
      passed: true,
      iphone18ProImages: gallery18ProBuy.length,
      iphone16Images: gallery16Buy.length,
      enquiryOnlyPromotionsVerified: enquiryPromos.length,
    };

    console.log("\nALL VERIFICATIONS PASSED!");
    console.log(JSON.stringify(report, null, 2));
  } finally {
    await browser.close();
    server.close();
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
}

run().catch((err) => {
  console.error("VERIFICATION FAILED:", err);
  process.exit(1);
});
