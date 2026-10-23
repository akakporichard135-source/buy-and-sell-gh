import assert from "node:assert/strict";
import { tmpdir } from "node:os";
import path from "node:path";
import puppeteer from "puppeteer-core";

const baseUrl = process.env.BUY_JOURNEY_URL || "http://127.0.0.1:5174";
const browser = await puppeteer.launch({
  executablePath: process.env.BROWSER_PATH || "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  headless: true,
  args: ["--no-sandbox"],
});

async function checkViewport(name, viewport) {
  const context = await browser.createBrowserContext();
  const page = await context.newPage();
  await page.setViewport(viewport);
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));

  try {
    await page.goto(`${baseUrl}/shop/buy-iphone/iphone-18-pro`, { waitUntil: "domcontentloaded", timeout: 60000 });
    await page.waitForSelector("#buy-customer-details", { timeout: 60000 });
    assert.equal(await page.$$("#buy-customer-details input").then((inputs) => inputs.length >= 3), true);
    assert.equal(await page.$$(".apple-buy-summary-actions select").then((inputs) => inputs.length), 0);
    await page.click(".apple-buy-summary-actions .apple-buy-btn-primary");
    await page.waitForSelector(".apple-buy-field-error");
    assert.equal(await page.$(".bag-drawer"), null, "Incomplete details must not open the bag");

    await page.type('input[autocomplete="name"]', "Ama Mensah");
    await page.type('input[autocomplete="tel"]', "0240000000");
    await page.click(".apple-buy-summary-actions .apple-buy-btn-primary");
    await page.waitForSelector(".bag-drawer");
    await page.waitForFunction(() => {
      const rect = document.querySelector(".bag-drawer")?.getBoundingClientRect();
      return rect && rect.right <= window.innerWidth + 1 && rect.left >= -1;
    });
    const firstBag = await page.$eval(".bag-drawer", (element) => element.innerText);
    assert.match(firstBag, /Ama Mensah/);
    assert.match(firstBag, /iPhone 18 Pro/);
    assert.match(firstBag, /Place Order via WhatsApp/);
    assert.equal(await page.$(".bag-drawer input"), null, "Bag has no second checkout form");
    assert.equal(await page.evaluate(() => document.body.style.position), "fixed", "Drawer locks background scrolling");

    const firstScreenshot = path.join(tmpdir(), `buyandsell-gh-first-bag-${name}.png`);
    await page.screenshot({ path: firstScreenshot });
    console.log({ name, firstScreenshot, editButton: await page.$eval(".bag-line-actions button:first-child", (button) => ({
      rect: button.getBoundingClientRect().toJSON(), display: getComputedStyle(button).display,
    })) });

    await page.$eval(".bag-line-actions button:first-child", (button) => button.click());
    await page.waitForFunction(() => !document.querySelector(".bag-drawer"));
    const preservedName = await page.$eval('input[autocomplete="name"]', (input) => input.value);
    assert.equal(preservedName, "Ama Mensah", "Edit keeps customer details");
    await page.click(".apple-buy-summary-actions .apple-buy-btn-primary");
    await page.waitForSelector(".bag-drawer");
    await page.waitForFunction(() => {
      const rect = document.querySelector(".bag-drawer")?.getBoundingClientRect();
      return rect && rect.right <= window.innerWidth + 1 && rect.left >= -1;
    });
    assert.equal(await page.$$(".bag-line").then((lines) => lines.length), 1, "Edit replaces, not duplicates");

    await page.$eval('.bag-drawer-header button[aria-label="Close shopping bag"]', (button) => button.click());
    await page.waitForFunction(() => !document.querySelector(".bag-drawer"));
    await page.goto(`${baseUrl}/shop/buy-airpods/airpods-pro-3`, { waitUntil: "domcontentloaded", timeout: 60000 });
    await page.waitForSelector("#buy-customer-details", { timeout: 60000 });
    await page.click(".apple-buy-summary-actions .apple-buy-btn-primary");
    await page.waitForSelector(".bag-drawer");
    await page.waitForFunction(() => {
      const rect = document.querySelector(".bag-drawer")?.getBoundingClientRect();
      return rect && rect.right <= window.innerWidth + 1 && rect.left >= -1;
    });
    assert.equal(await page.$$(".bag-line").then((lines) => lines.length), 2, "Multiple products share one bag");
    assert.equal(await page.$$(".bag-customer").then((panels) => panels.length), 1, "One shared customer summary");

    const geometry = await page.evaluate(() => ({
      width: document.documentElement.scrollWidth,
      viewport: window.innerWidth,
      drawerWidth: document.querySelector(".bag-drawer")?.getBoundingClientRect().width,
    }));
    assert.ok(geometry.width <= geometry.viewport + 2, `No horizontal overflow: ${JSON.stringify(geometry)}`);
    const screenshot = path.join(tmpdir(), `buyandsell-gh-bag-${name}.png`);
    await page.screenshot({ path: screenshot });
    await page.$eval(".bag-drawer-scroll", (element) => { element.scrollTop = element.scrollHeight; });
    const scrollState = await page.evaluate(() => {
      const customer = document.querySelector(".bag-customer dd")?.getBoundingClientRect();
      const footer = document.querySelector(".bag-footer")?.getBoundingClientRect();
      return { customerTop: customer?.top, customerBottom: customer?.bottom, footerTop: footer?.top };
    });
    assert.ok(scrollState.customerTop < scrollState.footerTop && scrollState.customerBottom <= scrollState.footerTop + 2,
      `Customer details remain readable when the drawer scrolls: ${JSON.stringify(scrollState)}`);
    await page.$eval('.bag-drawer-header button[aria-label="Close shopping bag"]', (button) => button.click());
    await page.waitForFunction(() => !document.querySelector(".bag-drawer"));
    await page.click('button[aria-label="Search products"]');
    await page.waitForSelector(".instant-search-panel");
    assert.equal(await page.$(".instant-search-result"), null, "Search shows no results before typing");
    const searchBackground = await page.$eval(".instant-search-panel", (panel) => getComputedStyle(panel).backgroundColor);
    assert.equal(searchBackground, "rgb(255, 255, 255)", "Search dropdown is clean white");
    await page.type('.instant-search-input input', "iphone");
    await page.waitForSelector(".instant-search-result", { timeout: 20000 });
    assert.deepEqual(errors, [], "No critical page errors");
    return { name, screenshot, ...geometry };
  } finally {
    await page.close();
    await context.close();
  }
}

async function checkMockOrderHandoff() {
  const context = await browser.createBrowserContext();
  const page = await context.newPage();
  let orderRpcCount = 0;
  let submittedPayload;
  let whatsappUrl = "";
  try {
    await page.goto(`${baseUrl}/shop/buy-iphone/iphone-18-pro`, { waitUntil: "domcontentloaded", timeout: 60000 });
    await page.waitForSelector("#buy-customer-details", { timeout: 60000 });
    await page.type('input[autocomplete="name"]', "Local Verification");
    await page.type('input[autocomplete="tel"]', "0240000000");
    await page.click(".apple-buy-summary-actions .apple-buy-btn-primary");
    try {
      await page.waitForSelector(".bag-drawer", { timeout: 10000 });
    } catch (error) {
      console.log("Mock setup diagnostic", await page.evaluate(() => ({
        fieldErrors: [...document.querySelectorAll(".apple-buy-field-error")].map((node) => node.textContent),
        summary: document.querySelector(".apple-buy-summary-actions")?.textContent,
        customer: document.querySelector("#buy-customer-details")?.textContent,
      })));
      throw error;
    }

    await page.exposeFunction("recordMockOrderRpc", (payload) => {
      orderRpcCount += 1;
      submittedPayload = payload;
    });
    await page.evaluate(() => {
      const originalFetch = window.fetch.bind(window);
      window.fetch = async (input, init) => {
        const url = typeof input === "string" ? input : input.url;
        if (url.includes("/rest/v1/rpc/create_order_request")) {
          const payload = JSON.parse(init?.body || "{}");
          await window.recordMockOrderRpc(payload);
          const item = payload.items_payload[0];
          return new Response(JSON.stringify({
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
            items: [{
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
            }],
          }), { status: 200, headers: { "content-type": "application/json" } });
        }
        if (url.includes("/rest/v1/") || url.includes("/auth/v1/")) {
          return new Response("[]", { status: 200, headers: { "content-type": "application/json" } });
        }
        return originalFetch(input, init);
      };
    });
    await page.setRequestInterception(true);
    page.on("request", async (request) => {
      const url = request.url();
      if (url.includes("/rest/v1/") || url.includes("/auth/v1/") || url.startsWith("https://wa.me/")) {
        if (url.startsWith("https://wa.me/")) whatsappUrl = url;
        await request.abort();
        return;
      }
      await request.continue();
    });

    await page.click(".bag-place-order");
    const handoffDeadline = Date.now() + 20000;
    while (!whatsappUrl && Date.now() < handoffDeadline) await new Promise((resolve) => setTimeout(resolve, 100));
    assert.equal(orderRpcCount, 1, "Only one mocked order RPC is sent");
    assert.equal(submittedPayload.customer_payload.full_name, "Local Verification");
    assert.equal(submittedPayload.items_payload[0].selected_storage, "256GB");
    assert.match(whatsappUrl, /BSG-LOCAL-MOCK-001/, "WhatsApp handoff includes the saved reference");
    console.log("Mocked order handoff passed; production Supabase writes were intercepted");
  } finally {
    await page.close();
    await context.close();
  }
}

try {
  if (!process.argv.includes("--mock-only")) {
    console.log(await checkViewport("desktop", { width: 1440, height: 900 }));
    console.log(await checkViewport("mobile", { width: 390, height: 844, isMobile: true, hasTouch: true }));
  }
  await checkMockOrderHandoff();
  console.log("Desktop and mobile Buy journey checks passed");
} finally {
  await browser.close();
}
