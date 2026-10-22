import assert from "node:assert/strict";
import { tmpdir } from "node:os";
import path from "node:path";
import puppeteer from "puppeteer-core";

const baseUrl = process.env.LOCAL_URL || "http://127.0.0.1:5176";
const browser = await puppeteer.launch({
  executablePath: "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  headless: true,
  args: ["--no-sandbox"],
});

try {
  for (const [name, width, height] of [["desktop", 1440, 900], ["mobile", 390, 844]]) {
    const page = await browser.newPage();
    const pageErrors = [];
    page.on("pageerror", (error) => pageErrors.push(error.message));
    await page.setViewport({ width, height, deviceScaleFactor: 1 });
    await page.setRequestInterception(true);
    page.on("request", (request) => {
      if (request.url().includes("/src/main.tsx")) void request.abort();
      else void request.continue();
    });
    await page.goto(baseUrl, { waitUntil: "domcontentloaded", timeout: 120000 });
    await page.waitForFunction(() => typeof window.$RefreshReg$ === "function");
    await page.evaluate(() => { window.__vite_plugin_react_preamble_installed__ = true; });

    await page.evaluate(async () => {
      const transformedStory = await fetch("/src/components/MinimalEditorialProductStory.tsx").then((response) => response.text());
      const routerUrl = transformedStory.match(/from "(\/node_modules\/\.vite\/deps\/react-router-dom\.js\?v=[^"]+)"/)?.[1];
      if (!routerUrl) throw new Error("Vite router module URL was not found");
      const [{ default: React }, { default: ReactDOM }, Router, { AdminLearnMorePages }, { ProductCatalogProvider }, { CartProvider }] = await Promise.all([
        import("/node_modules/.vite/deps/react.js"),
        import("/node_modules/.vite/deps/react-dom_client.js"),
        import(routerUrl),
        import("/src/pages/admin/AdminLearnMorePages.tsx"),
        import("/src/catalog/ProductCatalogContext.tsx"),
        import("/src/context/CartContext.tsx"),
      ]);
      await import("/src/index.css");
      const existingApp = document.getElementById("root");
      if (existingApp) existingApp.style.display = "none";
      const mount = document.createElement("div");
      mount.style.padding = window.innerWidth <= 1000 ? "1rem" : "2rem 2.25rem";
      mount.style.boxSizing = "border-box";
      document.body.appendChild(mount);
      ReactDOM.createRoot(mount).render(React.createElement(Router.BrowserRouter, null,
        React.createElement(ProductCatalogProvider, null,
          React.createElement(CartProvider, null, React.createElement(AdminLearnMorePages)))));
    });

    await page.waitForSelector('[data-testid="open-add-section-modal"]');
    if (name === "mobile") {
      await page.evaluate(() => {
        const productsTab = [...document.querySelectorAll(".vlearn-mobile-tab")].find((tab) => tab.textContent.includes("Products"));
        productsTab?.click();
      });
    }
    const count = await page.$$eval('[data-testid^="learn-more-product-"]', (items) => items.length);
    assert.equal(count, 13, `${name}: only 13 public Learn More pages should appear`);
    const openPreview = async () => {
      await page.locator('button[title="Open full-screen device preview"]').click();
      try {
        await page.waitForSelector(".vlearn-modal-overlay", { timeout: 10000 });
      } catch (error) {
        console.log(name, "preview diagnostics", pageErrors, await page.evaluate(() => ({
          previewButtons: document.querySelectorAll('button[title="Open full-screen device preview"]').length,
          modal: document.querySelectorAll('.vlearn-modal-overlay').length,
          editor: document.querySelectorAll('.vlearn-container').length,
        })));
        throw error;
      }
      await page.waitForSelector(".vlearn-modal-overlay .learn-more-extra-image img");
      if (name === "mobile") await page.locator('[data-testid="preview-device-mobile"]').click();
      try {
        await page.waitForFunction(() => {
          const image = document.querySelector(".vlearn-modal-overlay .learn-more-extra-image img");
          return image?.complete && image.naturalWidth > 0;
        }, { timeout: 10000 });
      } catch (error) {
        console.log(name, "image diagnostics", pageErrors, await page.evaluate(() => {
          const image = document.querySelector(".vlearn-modal-overlay .learn-more-extra-image img");
          return { image: image?.outerHTML, currentSrc: image?.currentSrc, complete: image?.complete, naturalWidth: image?.naturalWidth };
        }));
        throw error;
      }
      return page.$eval(".vlearn-modal-overlay .learn-more-extra-image img", (image) => {
        const rect = image.getBoundingClientRect();
        return { src: image.getAttribute("src"), currentSrc: image.currentSrc, top: rect.top, height: rect.height,
          ratio: image.naturalWidth / image.naturalHeight, savedRatio: image.style.aspectRatio };
      });
    };
    const beforeImage = await openPreview();
    await page.locator('[data-testid="close-preview-modal"]').click();
    if (name === "mobile") {
      await page.evaluate(() => [...document.querySelectorAll(".vlearn-mobile-tab")].find((tab) => tab.textContent.includes("Outline"))?.click());
    }
    await page.evaluate(() => document.querySelector('[data-testid="outline-card-section-0"]')?.click());
    await page.waitForSelector('[data-testid="section-image-url-input"]');
    await page.evaluate(() => {
      const input = document.querySelector('[data-testid="section-image-url-input"]');
      input.focus();
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set.call(input, '/products/campaigns/watch-ultra-4-hero.webp');
      input.dispatchEvent(new Event("input", { bubbles: true }));
    });
    const afterImage = await openPreview();
    assert.equal(afterImage.src, '/products/campaigns/watch-ultra-4-hero.webp', `${name}: replacement should appear in live preview`);
    assert.ok(Math.abs(beforeImage.ratio - afterImage.ratio) > 0.05, `${name}: QA assets need different aspect ratios`);
    assert.ok(Math.abs(beforeImage.height - afterImage.height) < 1, `${name}: image frame height changed after replacement`);
    assert.ok(Math.abs(beforeImage.top - afterImage.top) < 1, `${name}: image moved after replacement`);
    await page.locator('[data-testid="close-preview-modal"]').click();
    if (name === "mobile") {
      await page.evaluate(() => {
        const outlineTab = [...document.querySelectorAll(".vlearn-mobile-tab")].find((tab) => tab.textContent.includes("Outline"));
        outlineTab?.click();
      });
    }
    const canvasScreenshot = path.join(tmpdir(), `buyandsell-learn-more-editor-${name}-canvas.png`);
    await page.screenshot({ path: canvasScreenshot, fullPage: true });
    await page.locator('[data-testid="open-add-section-modal"]').click();
    await page.waitForSelector('[data-testid="library-preset-video"]');
    const screenshot = path.join(tmpdir(), `buyandsell-learn-more-editor-${name}.png`);
    await page.screenshot({ path: screenshot, fullPage: true });
    const geometry = await page.evaluate(() => ({
      viewport: document.documentElement.clientWidth,
      content: document.documentElement.scrollWidth,
      presets: document.querySelectorAll('[data-testid^="library-preset-"]').length,
    }));
    assert.ok(geometry.content <= geometry.viewport + 2, `${name}: editor overflows viewport (${geometry.content} > ${geometry.viewport})`);
    assert.ok(geometry.presets >= 12, `${name}: section library is incomplete`);
    await page.locator('[data-testid="library-preset-video"]').click();
    await page.waitForSelector('[data-testid="outline-card-section-2"]');
    const newSectionHidden = await page.$eval('[data-testid="outline-card-section-2"]', (item) => item.classList.contains("is-disabled"));
    assert.ok(newSectionHidden, `${name}: a newly added section should start hidden until edited`);
    assert.ok(await page.$('.vlearn-badge-unsaved'), `${name}: unsaved changes should be visible`);
    if (name === "mobile") {
      await page.evaluate(() => {
        const productsTab = [...document.querySelectorAll(".vlearn-mobile-tab")].find((tab) => tab.textContent.includes("Products"));
        productsTab?.click();
      });
    }
    await page.locator('.vlearn-search-input[aria-label="Search Learn More products"]').fill("mac studio");
    const filteredCount = await page.$$eval('[data-testid^="learn-more-product-"]', (items) => items.length);
    assert.equal(filteredCount, 1, `${name}: product search should find only Mac Studio`);
    assert.deepEqual(pageErrors, [], `${name}: browser errors`);
    console.log(`${name}: ${count} eligible pages, ${geometry.presets} templates, add/search/dirty state work, no horizontal overflow; ${canvasScreenshot}; ${screenshot}`);
    await page.close();
  }
} finally {
  await browser.close();
}
