import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
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

async function closePage(page) {
  await Promise.race([
    page.close(),
    new Promise((resolve) => setTimeout(resolve, 3000)),
  ]);
}

async function check(page, path) {
  await page.goto(new URL(path, base), { waitUntil: "domcontentloaded", timeout: base.startsWith("https://") ? 90000 : 30000 });
  await page.waitForFunction(() => {
    const heading = document.querySelector("h1")?.textContent?.trim() || "";
    return Boolean(heading) && heading !== "Loading product" && heading !== "Loading products";
  }, { timeout: 60000 });
  if (["/iphone", "/mac", "/ipad", "/watch", "/airpods", "/accessories"].includes(path)) {
    await page.waitForSelector(".store-cat-products-grid", { timeout: 60000 });
  }
  if (expectedPublishedGallery && ["/shop/buy-iphone/iphone-18-pro", "/product/iphone-18-pro"].includes(path)) {
    await page.waitForFunction((expected) => {
      const actual = [...document.querySelectorAll(".apple-buy-swipe-slide img")].map((img) => img.currentSrc || img.src);
      return JSON.stringify(actual) === JSON.stringify(expected);
    }, { timeout: 30000 }, expectedPublishedGallery);
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
      const rows = [...el.querySelectorAll(".store-cat-products-row")];
      return {
        productCount: el.querySelectorAll(".store-cat-grid-card").length,
        rows: rows.map((row) => ({
          cards: row.querySelectorAll(".store-cat-grid-card").length,
          scrollWidth: row.scrollWidth,
          width: row.clientWidth,
          cardWidth: row.querySelector(".store-cat-grid-card")?.getBoundingClientRect().width || 0,
        })),
      };
    })(),
  }));
}

try {
  const viewports = process.env.MOBILE_GESTURES_ONLY
    ? [{ width: 390, height: 844 }]
    : [{ width: 1440, height: 900 }, { width: 390, height: 844 }];
  for (const viewport of viewports) {
    const page = await browser.newPage();
    await page.setViewport({ ...viewport, isMobile: viewport.width < 768, hasTouch: viewport.width < 768 });
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
      assert.equal(store.grid.rows.length, 3, "iPhone catalog should have three separate mobile rows");
      assert.ok(store.grid.rows.every((row) => row.scrollWidth > row.width), "Each iPhone row must scroll independently");
      assert.ok(store.grid.rows.every((row) => Math.abs(row.cardWidth - row.width) < 2), "Phone cards should fill the row without a shrunken preview");
      for (let index = 0; index < 3; index++) {
        const offsets = await page.evaluate((targetIndex) => {
          const rows = [...document.querySelectorAll(".store-cat-products-row")];
          rows.forEach((row) => { row.scrollLeft = 0; });
          rows[targetIndex].scrollLeft = 180;
          return rows.map((row) => row.scrollLeft);
        }, index);
        assert.ok(offsets[index] > 0, `Row ${index + 1} must scroll`);
        assert.ok(offsets.every((offset, rowIndex) => rowIndex === index || offset === 0), `Row ${index + 1} must not move other rows`);
      }
      for (const path of ["/mac", "/ipad", "/watch", "/airpods", "/accessories"]) {
        const familyStore = await check(page, path);
        assert.ok(familyStore.grid, `${path} should render a product grid`);
        const expectedRows = familyStore.grid.productCount >= 7 ? 3 : familyStore.grid.productCount >= 4 ? 2 : 1;
        assert.equal(familyStore.grid.rows.length, expectedRows, `${path} should use only the rows its catalog needs`);
        assert.ok(familyStore.grid.rows.every((row) => Math.abs(row.cardWidth - row.width) < 2), `${path} should keep full-size phone cards`);
        assert.ok(familyStore.width <= familyStore.viewport + 2, `${path} should not overflow the page`);
      }
      await check(page, "/iphone");
      let imageCenter;
      for (let index = 0; index < 3; index++) {
        await page.evaluate(() => {
          document.querySelectorAll(".store-cat-products-row").forEach((row) => { row.scrollLeft = 0; });
        });
        await new Promise((resolve) => setTimeout(resolve, 500));
        const selector = `.store-cat-products-row:nth-child(${index + 1}) .store-cat-grid-card-img`;
        await page.$eval(selector, (image) => image.scrollIntoView({ block: "center", behavior: "instant" }));
        await page.waitForFunction((rowIndex) => {
          const image = document.querySelector(`.store-cat-products-row:nth-child(${rowIndex + 1}) .store-cat-grid-card-img`);
          if (!image) return false;
          const rect = image.getBoundingClientRect();
          return rect.top >= 0 && rect.bottom <= window.innerHeight;
        }, { timeout: 10000 }, index);
        await new Promise((resolve) => setTimeout(resolve, 150));
        imageCenter = await page.$eval(selector, (image) => {
          const rect = image.getBoundingClientRect();
          return { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 };
        });
        const beforeHorizontal = await page.evaluate(() => ({
          pageY: window.scrollY,
          offsets: [...document.querySelectorAll(".store-cat-products-row")].map((row) => row.scrollLeft),
        }));
        await page.touchscreen.touchStart(imageCenter.x, imageCenter.y);
        for (let step = 1; step <= 6; step++) {
          await page.touchscreen.touchMove(imageCenter.x - step * 25, imageCenter.y);
          await new Promise((resolve) => setTimeout(resolve, 30));
        }
        await page.touchscreen.touchEnd();
        await new Promise((resolve) => setTimeout(resolve, 250));
        const horizontal = await page.evaluate(() => ({
          pageY: window.scrollY,
          offsets: [...document.querySelectorAll(".store-cat-products-row")].map((row) => row.scrollLeft),
        }));
        assert.ok(horizontal.offsets[index] > beforeHorizontal.offsets[index], `Horizontal touch must move row ${index + 1}`);
        assert.ok(horizontal.offsets.every((offset, rowIndex) => rowIndex === index || Math.abs(offset - beforeHorizontal.offsets[rowIndex]) < 2), `Touching row ${index + 1} must leave other rows stationary`);
        assert.ok(Math.abs(horizontal.pageY - beforeHorizontal.pageY) < 5, `Touching row ${index + 1} must not scroll the page vertically`);
      }
      await check(page, "/iphone");
      await page.$eval(".store-cat-products-row:first-child .store-cat-grid-card-img", (image) => image.scrollIntoView({ block: "center", behavior: "instant" }));
      await page.waitForFunction(() => {
        const image = document.querySelector(".store-cat-products-row:first-child .store-cat-grid-card-img");
        if (!image) return false;
        const rect = image.getBoundingClientRect();
        return rect.top >= 0 && rect.bottom <= window.innerHeight;
      }, { timeout: 10000 });
      await new Promise((resolve) => setTimeout(resolve, 500));
      imageCenter = await page.$eval(".store-cat-products-row:first-child .store-cat-grid-card-img", (image) => {
        const rect = image.getBoundingClientRect();
        return { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 };
      });
      const beforeVertical = await page.evaluate(() => window.scrollY);
      await page.touchscreen.touchStart(imageCenter.x, imageCenter.y);
      for (let step = 1; step <= 6; step++) {
        await page.touchscreen.touchMove(imageCenter.x, imageCenter.y - step * 20);
        await new Promise((resolve) => setTimeout(resolve, 30));
      }
      await page.touchscreen.touchEnd();
      await new Promise((resolve) => setTimeout(resolve, 250));
      const afterVertical = await page.evaluate(() => window.scrollY);
      assert.ok(afterVertical > beforeVertical, "Vertical swipe starting on a product image must scroll the page");
      await check(page, "/iphone");
      await page.$eval(".store-cat-products-row:first-child .store-cat-grid-card-img", (image) => image.scrollIntoView({ block: "center", behavior: "instant" }));
      imageCenter = await page.$eval(".store-cat-products-row:first-child .store-cat-grid-card-img", (image) => {
        const rect = image.getBoundingClientRect();
        return { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 };
      });
      const beforeDiagonal = await page.evaluate(() => ({
        pageY: window.scrollY,
        offsets: [...document.querySelectorAll(".store-cat-products-row")].map((row) => row.scrollLeft),
      }));
      await page.touchscreen.touchStart(imageCenter.x, imageCenter.y);
      for (let step = 1; step <= 6; step++) {
        await page.touchscreen.touchMove(imageCenter.x - step * 6, imageCenter.y - step * 20);
        await new Promise((resolve) => setTimeout(resolve, 30));
      }
      await page.touchscreen.touchEnd();
      await new Promise((resolve) => setTimeout(resolve, 250));
      const diagonal = await page.evaluate(() => ({
        pageY: window.scrollY,
        offsets: [...document.querySelectorAll(".store-cat-products-row")].map((row) => row.scrollLeft),
      }));
      assert.ok(diagonal.pageY > beforeDiagonal.pageY, "Vertical-dominant diagonal touch must scroll the page");
      assert.ok(diagonal.offsets.slice(1).every((offset, index) => Math.abs(offset - beforeDiagonal.offsets[index + 1]) < 2), "Diagonal touch must not move unrelated rows");
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
    await closePage(page);
  }
  if (!process.env.MOBILE_GESTURES_ONLY) {
    await mkdir("qa-previews", { recursive: true });
    for (const width of [320, 390, 600, 768]) {
      const page = await browser.newPage();
      await page.setViewport({ width, height: 844, isMobile: true, hasTouch: true });
      const store = await check(page, "/iphone");
      assert.equal(store.grid.rows.length, 3, `${width}px should retain independent rows`);
      assert.ok(store.grid.rows.every((row) => row.scrollWidth > row.width), `${width}px rows should scroll horizontally`);
      assert.ok(store.grid.rows.every((row) => {
        const expectedCardWidth = width >= 600 ? (row.width - 12) / 2 : row.width;
        return Math.abs(row.cardWidth - expectedCardWidth) < 2;
      }), `${width}px should show whole cards at their intended size`);
      assert.ok(store.width <= store.viewport + 2, `${width}px Store page must not overflow horizontally`);
      await page.$eval(".store-cat-products-grid", (grid) => grid.scrollIntoView({ block: "start", behavior: "instant" }));
      await page.screenshot({ path: `qa-previews/store-iphone-${width}.png` });
      console.log(JSON.stringify({ width, rows: store.grid.rows.length, cardWidths: store.grid.rows.map((row) => row.cardWidth), noOverflow: true }));
      await closePage(page);
    }
  }
} finally {
  try {
    await Promise.race([
      browser.close(),
      new Promise((_, reject) => setTimeout(() => reject(new Error("Browser shutdown timed out")), 5000)),
    ]);
  } catch {
    browser.process()?.kill();
    browser.disconnect();
  }
}
