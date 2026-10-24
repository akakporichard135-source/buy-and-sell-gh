import assert from "node:assert/strict";
import { tmpdir } from "node:os";
import path from "node:path";
import puppeteer from "puppeteer-core";

const baseUrl = process.env.BUY_JOURNEY_URL || "https://buy-and-sell-gdl4dnt6g-richard-akakpo-s-projects.vercel.app";
console.log(`Starting Buy Journey Verification against: ${baseUrl}`);

const browser = await puppeteer.launch({
  executablePath: process.env.BROWSER_PATH || "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  headless: true,
  args: ["--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage", "--no-first-run"],
  userDataDir: path.join(tmpdir(), `buyandsell-puppeteer-${Date.now()}-${Math.random().toString(36).slice(2)}`),
});

async function clickAddButton(page, selector) {
  await page.waitForSelector(selector, { timeout: 10000 });
  await page.$eval(selector, (button) => {
    button.scrollIntoView({ behavior: "instant", block: "center" });
    button.click();
  });
}

async function checkViewport(name, viewport) {
  console.log(`Checking viewport: ${name} (${viewport.width}x${viewport.height})...`);
  const page = await browser.newPage();
  await page.setViewport(viewport);
  const addButton = name === "mobile" ? ".apple-buy-mobile-btn" : ".apple-buy-summary-actions .apple-buy-btn-primary";
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));

  try {
    console.log(`[${name}] Loading iPhone 18 Pro Buy page...`);
    const catalogPromise = page.waitForResponse(
      (res) => res.url().includes("/rest/v1/products?") && (res.status() === 200 || res.status() === 304),
      { timeout: 30000 }
    ).catch(() => null);
    await page.goto(`${baseUrl}/shop/buy-iphone/iphone-18-pro`, { waitUntil: "networkidle2", timeout: 45000 });
    await catalogPromise;
    await page.evaluate(() => localStorage.clear());
    await page.reload({ waitUntil: "networkidle2" });
    await new Promise((resolve) => setTimeout(resolve, 500));

    // 1. Verify Buy Page is pure product configuration: NO customer contact or address form fields on the buy page
    const visibleInputs = await page.$$eval("input:not([type='hidden'])", (inputs) =>
      inputs.filter((el) => {
        const rect = el.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0 && getComputedStyle(el).visibility !== "hidden";
      }).length
    );
    assert.equal(visibleInputs, 0, "Buy page is pure product configuration with zero customer contact inputs");

    // 2. Click Add to Bag directly
    console.log(`[${name}] Clicking Add to Bag...`);
    await clickAddButton(page, addButton);

    // 3. Verify Bag Drawer opens smoothly
    try {
      await page.waitForSelector(".bag-drawer", { timeout: 15000 });
    } catch (e) {
      const diag = await page.evaluate(() => ({
        toasts: [...document.querySelectorAll(".cart-toast, [role='status'], [role='alert']")].map((el) => el.textContent),
        summaryText: document.querySelector(".apple-buy-summary-actions")?.innerText,
        pricing: document.querySelector(".apple-buy-summary-pricing")?.innerText,
        buttonDisabled: document.querySelector(".apple-buy-summary-actions button")?.disabled,
        cartInStorage: localStorage.getItem("buyandsell-gh-cart"),
      }));
      console.log(`[${name}] Bag drawer wait failed! Diagnostic state:`, diag);
      await page.screenshot({ path: path.join(tmpdir(), `buyandsell-failed-add-${name}.png`) });
      throw e;
    }
    await page.waitForFunction(() => {
      const rect = document.querySelector(".bag-drawer")?.getBoundingClientRect();
      return rect && rect.right <= window.innerWidth + 1 && rect.left >= -1;
    });

    const firstBag = await page.$eval(".bag-drawer", (element) => element.innerText);
    assert.match(firstBag, /iPhone 18 Pro/);
    assert.match(firstBag, /Check Out/);
    assert.equal(await page.evaluate(() => document.body.style.position), "fixed", "Drawer locks background scrolling");
    const savedScrollY = await page.evaluate(() => -Number.parseFloat(document.body.style.top));

    const firstScreenshot = path.join(tmpdir(), `buyandsell-gh-first-bag-${name}.png`);
    await page.screenshot({ path: firstScreenshot });
    console.log(`[${name}] Captured screenshot: ${firstScreenshot}`);

    // 4. Test Edit details button
    console.log(`[${name}] Testing Edit details...`);
    await page.waitForSelector(".bag-line-actions button:first-child");
    await page.$eval(".bag-line-actions button:first-child", (button) => button.click());
    await page.waitForFunction(() => !document.querySelector(".bag-drawer") && document.body.style.position !== "fixed");
    const restoredScrollY = await page.evaluate(() => window.scrollY);
    assert.ok(
      Math.abs(restoredScrollY - savedScrollY) <= 2,
      `Edit restores scroll position immediately: saved ${savedScrollY}, actual ${restoredScrollY}`
    );

    // 5. Re-add edited product
    await new Promise((resolve) => setTimeout(resolve, 200));
    await clickAddButton(page, addButton);
    await page.waitForSelector(".bag-drawer", { timeout: 15000 });

    const editedBag = await page.evaluate(() => ({
      lines: [...document.querySelectorAll(".apple-bag-item")].map((line) => line.textContent),
      items: JSON.parse(localStorage.getItem("buyandsell-gh-cart") || "[]").map((item) => ({
        id: item.product.id,
        storage: item.storage,
        color: item.color,
        variantId: item.variantId,
      })),
    }));
    assert.equal(editedBag.lines.length, 1, "Edit replaces existing line item without duplicating");

    // Close drawer
    await page.$eval('.bag-drawer-header button[aria-label="Close shopping bag"]', (button) => button.click());
    await page.waitForFunction(() => !document.querySelector(".bag-drawer"));

    // 6. Test out-of-stock AirPods Pro 3 cannot be added to bag
    console.log(`[${name}] Checking out-of-stock AirPods Pro 3...`);
    await page.goto(`${baseUrl}/shop/buy-airpods/airpods-pro-3`, { waitUntil: "domcontentloaded", timeout: 45000 });
    await page.waitForFunction(() =>
      document.querySelector(".apple-buy-summary-actions .apple-buy-btn-primary")?.textContent?.includes("Enquire on Availability")
    );
    assert.equal(await page.$(".bag-drawer"), null, "Out-of-stock AirPods Pro 3 is not added to the bag");

    // 7. Add available AirPods Pro to test multiple products in bag
    console.log(`[${name}] Adding second product (AirPods Pro)...`);
    await page.goto(`${baseUrl}/shop/buy-airpods/airpods-pro`, { waitUntil: "domcontentloaded", timeout: 45000 });
    await page.waitForFunction(() =>
      document.querySelector(".apple-buy-summary-actions .apple-buy-btn-primary")?.textContent?.includes("Add to Bag")
    );
    await clickAddButton(page, addButton);
    await page.waitForSelector(".bag-drawer", { timeout: 15000 });

    const drawerText = await page.$eval(".bag-drawer", (drawer) => drawer.innerText);
    assert.match(drawerText, /AirPods Pro/);
    assert.match(drawerText, /iPhone 18 Pro/);
    const bagItemCount = await page.$$eval(".bag-drawer .apple-bag-item", (items) => items.length);
    assert.equal(bagItemCount, 2, "Multiple products share one shopping bag");

    // Check responsive geometry & screenshots
    const geometry = await page.evaluate(() => ({
      width: document.documentElement.scrollWidth,
      viewport: window.innerWidth,
      drawerWidth: document.querySelector(".bag-drawer")?.getBoundingClientRect().width,
    }));
    assert.ok(geometry.width <= geometry.viewport + 2, `No horizontal overflow: ${JSON.stringify(geometry)}`);
    const screenshot = path.join(tmpdir(), `buyandsell-gh-bag-${name}.png`);
    await page.screenshot({ path: screenshot });

    // 8. Test Search Drawer
    await page.$eval('.bag-drawer-header button[aria-label="Close shopping bag"]', (button) => button.click());
    await page.waitForFunction(() => !document.querySelector(".bag-drawer"));
    await page.click('button[aria-label="Search products"]');
    await page.waitForSelector(".instant-search-panel");
    assert.equal(await page.$(".instant-search-result"), null, "Search shows no results before typing");
    const searchBackground = await page.$eval(".instant-search-panel", (panel) => getComputedStyle(panel).backgroundColor);
    assert.equal(searchBackground, "rgb(255, 255, 255)", "Search dropdown is clean white");

    assert.deepEqual(errors, [], "No critical page errors");
    console.log(`[${name}] Viewport check passed!`);
    return { name, screenshot, ...geometry };
  } finally {
    await page.close();
  }
}

async function checkMockOrderHandoff() {
  console.log("Testing Apple Checkout and mock order handoff flow...");
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  let orderRpcCount = 0;
  let submittedPayload;
  let whatsappUrl = "";

  try {
    await page.exposeFunction("recordMockOrderRpc", (payload) => {
      orderRpcCount += 1;
      submittedPayload = payload;
    });

    await page.evaluateOnNewDocument(() => {
      window.open = (url) => {
        window._lastOpenedUrl = url;
        return null;
      };
      const originalFetch = window.fetch.bind(window);
      window.fetch = async (input, init) => {
        const url = typeof input === "string" ? input : input.url;
        if (url.includes("/rest/v1/rpc/create_order_request")) {
          const payload = JSON.parse(init?.body || "{}");
          await window.recordMockOrderRpc(payload);
          const item = payload.items_payload[0];
          return new Response(
            JSON.stringify({
              id: "00000000-0000-4000-8000-000000000001",
              reference_number: "BSG-LOCAL-MOCK-001",
              customer_name: payload.customer_payload.full_name,
              customer_email: null,
              customer_phone: payload.customer_payload.phone,
              customer_whatsapp: payload.customer_payload.whatsapp,
              delivery_method: "pickup",
              delivery_address: null,
              region: null,
              city: null,
              landmark: null,
              customer_notes: null,
              subtotal: 20500,
              delivery_fee: 0,
              total_amount: 20500,
              payment_method: "Pay on Pickup",
              payment_status: "Unpaid",
              order_status: "Pending",
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              items: [
                {
                  product_id: item.product_id,
                  product_slug: item.product_slug,
                  product_name: "iPhone 18 Pro",
                  product_image: "/products/campaigns/iphone-18-pro-burgundy-finish.webp",
                  selected_storage: item.selected_storage,
                  selected_colour: item.selected_colour,
                  selected_condition: "Brand New",
                  battery_health: null,
                  warranty: null,
                  quantity: item.quantity,
                  unit_price: 20500,
                  line_total: 20500,
                },
              ],
            }),
            { status: 200, headers: { "content-type": "application/json" } }
          );
        }
        return originalFetch(input, init);
      };
    });

    console.log("Navigating to iPhone 18 Pro...");
    const catalogPromise = page.waitForResponse(
      (res) => res.url().includes("/rest/v1/products?") && (res.status() === 200 || res.status() === 304),
      { timeout: 30000 }
    ).catch(() => null);
    await page.goto(`${baseUrl}/shop/buy-iphone/iphone-18-pro`, { waitUntil: "networkidle2", timeout: 45000 });
    await catalogPromise;
    await page.evaluate(() => localStorage.clear());
    await page.reload({ waitUntil: "networkidle2" });
    await page.waitForFunction(() =>
      document.querySelector(".apple-buy-summary-actions .apple-buy-btn-primary")?.textContent?.includes("Add to Bag")
    );
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Add item to bag
    console.log("Adding iPhone 18 Pro to bag...");
    await clickAddButton(page, ".apple-buy-summary-actions .apple-buy-btn-primary");
    try {
      await page.waitForSelector(".bag-drawer", { timeout: 15000 });
    } catch (e) {
      const diag = await page.evaluate(() => ({
        toasts: [...document.querySelectorAll(".cart-toast, [role='status'], [role='alert']")].map((el) => el.textContent),
        summaryText: document.querySelector(".apple-buy-summary-actions")?.innerText,
        pricing: document.querySelector(".apple-buy-summary-pricing")?.innerText,
        buttonDisabled: document.querySelector(".apple-buy-summary-actions button")?.disabled,
        cartInStorage: localStorage.getItem("buyandsell-gh-cart"),
      }));
      console.log(`[mock-checkout] Bag drawer wait failed! Diagnostic state:`, diag);
      throw e;
    }

    // Navigate to checkout from bag drawer
    console.log("Clicking Check Out in Bag drawer...");
    await page.waitForSelector('.bag-drawer-footer button.apple-checkout-btn-primary', { timeout: 10000 });
    await page.$eval('.bag-drawer-footer button.apple-checkout-btn-primary', (btn) => btn.click());
    await page.waitForSelector("#checkout-customer-details", { timeout: 15000 });
    console.log("Apple Checkout page loaded successfully!");

    // Verify Offline Payment Arrangement notice is present
    const noticeText = await page.$eval(".apple-checkout-notice-callout", (el) => el.innerText);
    assert.match(noticeText, /No online payment is required/);
    assert.match(noticeText, /You inspect and verify the physical device before completing payment/);

    // Fill customer contact information
    console.log("Filling contact details...");
    await page.type("#chk-name", "Local Verification");
    await page.type("#chk-phone", "0240000000");

    // Click Submit Order Request
    console.log("Submitting Order Request...");
    await page.waitForSelector('.apple-checkout-review-sidebar button.apple-checkout-btn-primary', { timeout: 10000 });
    await page.$eval('.apple-checkout-review-sidebar button.apple-checkout-btn-primary', (btn) => btn.click());

    // Wait for Order Confirmation Screen
    await page.waitForFunction(
      () => location.pathname.includes("/order-success/BSG-LOCAL-MOCK-001"),
      { timeout: 15000 }
    );
    console.log("Reached Order Success page route!");

    // Wait for the OrderSuccessPage component to render
    await page.waitForFunction(
      () => document.querySelector('.apple-bag-heading')?.textContent?.includes("BSG-LOCAL-MOCK-001"),
      { timeout: 15000 }
    );
    console.log("Order Confirmation Screen rendered!");

    assert.equal(orderRpcCount, 1, "Only one mocked order RPC is sent");
    assert.equal(submittedPayload.customer_payload.full_name, "Local Verification");
    assert.equal(submittedPayload.items_payload[0].selected_storage, "256GB");

    // Verify Order Confirmation Page content
    const pageText = await page.evaluate(() => document.body.innerText);
    assert.match(pageText, /BSG-LOCAL-MOCK-001/, "Confirmation page shows genuine reference number");
    assert.match(pageText, /iPhone 18 Pro/, "Confirmation page lists the ordered device");
    assert.match(pageText, /Open Order on WhatsApp/, "Confirmation page has direct WhatsApp button");

    const whatsappLink = await page.$eval('a[href*="wa.me"]', (a) => a.href);
    assert.match(whatsappLink, /BSG-LOCAL-MOCK-001/, "WhatsApp link includes order reference");

    const checkoutScreenshot = path.join(tmpdir(), "buyandsell-gh-order-confirmed.png");
    await page.screenshot({ path: checkoutScreenshot });
    console.log(`Captured order confirmation screenshot: ${checkoutScreenshot}`);

    console.log("Apple checkout and mocked order handoff passed; reference BSG-LOCAL-MOCK-001 verified!");
  } finally {
    await page.close();
  }
}

try {
  if (!process.argv.includes("--mock-only")) {
    if (!process.argv.includes("--mobile-only")) console.log(await checkViewport("desktop", { width: 1440, height: 900 }));
    if (!process.argv.includes("--desktop-only")) console.log(await checkViewport("mobile", { width: 390, height: 844, isMobile: true, hasTouch: true }));
  }
  if (!process.argv.includes("--no-mock")) await checkMockOrderHandoff();
  console.log("ALL PURCHASING, SHOPPING BAG, AND CHECKOUT TESTS PASSED!");
} finally {
  const closed = await Promise.race([
    browser.close().then(() => true),
    new Promise((resolve) => setTimeout(() => resolve(false), 5000)),
  ]);
  if (!closed) browser.process()?.kill();
}
