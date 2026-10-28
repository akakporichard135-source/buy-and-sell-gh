import assert from "node:assert/strict";
import puppeteer from "puppeteer-core";

const base = process.env.PREVIEW_URL || "http://127.0.0.1:4173";
let expectedPublishedGallery = null;
if (process.env.VITE_SUPABASE_URL && process.env.VITE_SUPABASE_ANON_KEY) {
  const response = await fetch(`${process.env.VITE_SUPABASE_URL}/rest/v1/storefront_content?key=eq.buy_galleries&select=config`, {
    headers: { apikey: process.env.VITE_SUPABASE_ANON_KEY, Authorization: `Bearer ${process.env.VITE_SUPABASE_ANON_KEY}` },
  });
  assert.ok(response.ok, "Published gallery record must be readable");
  const rows = await response.json();
  expectedPublishedGallery = rows[0]?.config?.["iphone-18-pro"]?.items?.map((item) => new URL(item.src, base).href);
  assert.ok(expectedPublishedGallery?.length, "iPhone 18 Pro must have a published gallery record");
}
const browser = await puppeteer.launch({
  executablePath: "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  headless: true,
  args: ["--no-first-run"],
});

async function check(page, path) {
  await page.goto(new URL(path, base), { waitUntil: "domcontentloaded", timeout: 30000 });
  await page.waitForFunction(() => {
    const heading = document.querySelector("h1")?.textContent?.trim() || "";
    return Boolean(heading) && heading !== "Loading product" && heading !== "Loading products";
  }, { timeout: 60000 });
  if (["/iphone", "/mac", "/ipad", "/watch", "/airpods", "/accessories"].includes(path)) {
    await page.waitForSelector(".store-cat-products-grid", { timeout: 60000 });
  }
  await new Promise((resolve) => setTimeout(resolve, 1800));
  return page.evaluate(() => ({
    heading: document.querySelector("h1")?.textContent?.trim(),
    gallery: [...document.querySelectorAll(".apple-buy-swipe-slide img")].map((img) => img.currentSrc || img.src),
    width: document.documentElement.scrollWidth,
    viewport: window.innerWidth,
    grid: (() => {
      const el = document.querySelector(".store-cat-products-grid");
      if (!el) return null;
      const css = getComputedStyle(el);
      return { flow: css.gridAutoFlow, rows: css.gridTemplateRows, scrollWidth: el.scrollWidth, width: el.clientWidth };
    })(),
  }));
}

try {
  for (const viewport of [{ width: 1440, height: 900 }, { width: 390, height: 844 }]) {
    const page = await browser.newPage();
    await page.setViewport(viewport);
    const real = await check(page, "/shop/buy-iphone/iphone-18-pro");
    assert.match(real.heading || "", /iPhone 18 Pro/i);
    assert.ok(real.gallery.length > 0, "Live iPhone Buy gallery should render");
    if (expectedPublishedGallery) assert.deepEqual(real.gallery, expectedPublishedGallery, "Browser must display the exact Admin-published gallery");
    const direct = await check(page, "/product/iphone-18-pro");
    assert.deepEqual(direct.gallery, real.gallery, "Direct product route must use the same published gallery");
    const absent = await check(page, "/shop/buy-watch/apple-watch-ultra-4");
    assert.match(absent.heading || "", /Apple Watch Ultra 4/i);
    assert.ok(!/Ultra 3|Series 11/.test(absent.heading || ""), "Missing promotion must not borrow another model");
    const store = await check(page, "/iphone");
    assert.ok(store.grid, "Store grid should render");
    if (viewport.width < 768) {
      assert.equal(store.grid.flow, "column");
      assert.equal(store.grid.rows.split(" ").length, 3);
      const scroll = await page.$eval(".store-cat-products-grid", (grid) => {
        grid.scrollLeft = 500;
        return grid.scrollLeft;
      });
      assert.ok(scroll > 0, "Mobile product rows must scroll horizontally");
      for (const path of ["/mac", "/ipad", "/watch", "/airpods", "/accessories"]) {
        const familyStore = await check(page, path);
        assert.ok(familyStore.grid, `${path} should render a product grid`);
        assert.equal(familyStore.grid.flow, "column", `${path} should use a horizontal mobile grid`);
        assert.ok(familyStore.width <= familyStore.viewport + 2, `${path} should not overflow the page`);
      }
      await check(page, "/iphone");
    }
    const storeHref = await page.$eval('a[href="/shop/buy-iphone/iphone-18-pro"]', (link) => link.getAttribute("href"));
    assert.equal(storeHref, "/shop/buy-iphone/iphone-18-pro");
    await check(page, "/");
    const homepageHref = await page.$eval('a[href="/shop/buy-iphone/iphone-18-pro"]', (link) => link.getAttribute("href"));
    assert.equal(homepageHref, storeHref);
    await page.click('button[aria-label="Search products"]');
    await page.type('.instant-search-input input', 'iPhone 18 Pro');
    await page.waitForSelector('.instant-search-result a[href="/product/iphone-18-pro"]');
    const searchHref = await page.$eval('.instant-search-result a[href="/product/iphone-18-pro"]', (link) => link.getAttribute("href"));
    assert.equal(searchHref, "/product/iphone-18-pro");
    assert.ok(real.width <= real.viewport + 2, "Buy page should not overflow horizontally");
    assert.ok(store.width <= store.viewport + 2, "Store page should not overflow horizontally");
    console.log(JSON.stringify({ viewport: viewport.width, iphoneGallery: real.gallery, watchHeading: absent.heading, grid: store.grid, directGalleryMatches: true, homepageHref, storeHref, searchHref }));
    await page.close();
  }
} finally {
  await browser.close();
}
