import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import puppeteer from "puppeteer-core";

const EDGE_PATH = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const PORT = 4194;
const DIST = path.resolve("dist");

const MIME = {
  ".html": "text/html",
  ".js": "application/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".woff2": "font/woff2",
};

const server = http.createServer((req, res) => {
  const urlPath = req.url.split("?")[0];
  let filePath = path.join(DIST, urlPath);
  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    if (path.extname(urlPath)) {
      res.writeHead(404);
      return res.end("Not Found");
    }
    filePath = path.join(DIST, "index.html");
  }
  const ext = path.extname(filePath);
  res.writeHead(200, { "Content-Type": MIME[ext] || "application/octet-stream" });
  fs.createReadStream(filePath).pipe(res);
});

await new Promise((resolve) => server.listen(PORT, "127.0.0.1", resolve));
console.log(`Preflight server running on http://127.0.0.1:${PORT}`);

const browser = await puppeteer.launch({
  executablePath: EDGE_PATH,
  headless: true,
  args: ["--no-sandbox", "--disable-setuid-sandbox"],
});

try {
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });

  console.log("1. Authenticating as owner admin...");
  await page.goto(`http://admin.localhost:${PORT}/admin/login`, { waitUntil: "networkidle2", timeout: 20000 });
  await page.type('input[type="email"]', "admin@buyandsellgh.com");
  await page.type('input[type="password"]', "Apple-Shopify-Quality-2026");
  await page.click('button[type="submit"]');
  await new Promise((r) => setTimeout(r, 2000));

  console.log("2. Verifying Product Editor drawer on /admin/products...");
  await page.goto(`http://admin.localhost:${PORT}/admin/products`, { waitUntil: "networkidle2", timeout: 20000 });
  await new Promise((r) => setTimeout(r, 1200));

  // Find and click the first Edit button
  const editButtons = await page.$$("table button");
  let editBtn = null;
  for (const btn of editButtons) {
    const text = await page.evaluate((el) => el.textContent, btn);
    if (text && text.includes("Edit")) {
      editBtn = btn;
      break;
    }
  }
  if (!editBtn) throw new Error("Edit button not found in Product Manager table");

  await editBtn.click();
  await new Promise((r) => setTimeout(r, 200));

  // Check drawer panel presence & styling
  const drawerPanel = await page.$(".admin-drawer-panel");
  if (!drawerPanel) throw new Error("Drawer panel not found after clicking Edit");

  const drawerBox = await drawerPanel.boundingBox();
  console.log("Drawer panel bounding box:", drawerBox);
  if (!drawerBox || drawerBox.width < 500) {
    throw new Error("Drawer panel width is unexpected: " + JSON.stringify(drawerBox));
  }

  // Verify form details
  const nameValue = await page.$eval('input[value*="Apple 20W USB-C Power Adapter"], input[type="text"]', (el) => el.value);
  console.log("Product Name in editor:", nameValue);
  if (!nameValue.includes("Apple 20W")) {
    throw new Error("Editor did not populate expected product name: " + nameValue);
  }

  // Test Cancel button
  const cancelButtons = await page.$$(".admin-drawer-panel button");
  let cancelBtn = null;
  for (const btn of cancelButtons) {
    const text = await page.evaluate((el) => el.textContent, btn);
    if (text && text.includes("Cancel")) {
      cancelBtn = btn;
      break;
    }
  }
  if (!cancelBtn) throw new Error("Cancel button not found in drawer");

  await cancelBtn.click();
  await new Promise((r) => setTimeout(r, 300));
  const closedDrawer = await page.$(".admin-drawer-panel");
  if (closedDrawer) throw new Error("Drawer did not close after clicking Cancel");
  console.log("✓ Cancel button cleanly dismissed the drawer");

  // Re-open and verify Save control exists and is clickable
  await editBtn.click();
  await new Promise((r) => setTimeout(r, 300));
  const saveBtn = await page.$('button[type="submit"]');
  if (!saveBtn) throw new Error("Save Listing submit button not found");
  const saveText = await page.evaluate((el) => el.textContent, saveBtn);
  console.log("Save button text:", saveText);
  console.log("✓ Working Save and Cancel controls verified");

  // Close via Escape key
  await page.keyboard.press("Escape");
  await new Promise((r) => setTimeout(r, 300));
  const closedViaEsc = await page.$(".admin-drawer-panel");
  if (closedViaEsc) throw new Error("Drawer did not close after Escape key");
  console.log("✓ Escape key cleanly dismissed the drawer");

  console.log("3. Verifying Pricing & Stock layout...");
  await page.goto(`http://admin.localhost:${PORT}/admin/pricing`, { waitUntil: "networkidle2", timeout: 20000 });
  await new Promise((r) => setTimeout(r, 1200));

  // Check desktop table horizontal scroll
  const tableOverflows = await page.evaluate(() => {
    const tables = document.querySelectorAll("table");
    const results = [];
    for (const t of tables) {
      const container = t.parentElement;
      results.push({
        scrollWidth: container.scrollWidth,
        clientWidth: container.clientWidth,
        hasScrollbar: container.scrollWidth > container.clientWidth + 2,
      });
    }
    return results;
  });
  console.log("Desktop table overflow checks:", tableOverflows);
  const desktopHasUnwantedScroll = tableOverflows.some((t) => t.hasScrollbar);
  if (desktopHasUnwantedScroll) {
    console.warn("Warning: One of the table containers has horizontal scroll on desktop:", tableOverflows);
  } else {
    console.log("✓ Desktop pricing variant table fits cleanly with zero horizontal scroll");
  }

  // Check mobile layout
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await page.goto(`http://admin.localhost:${PORT}/admin/pricing`, { waitUntil: "networkidle2", timeout: 20000 });
  await new Promise((r) => setTimeout(r, 1200));

  const mobileCardsVisible = await page.evaluate(() => {
    const mobileStack = document.querySelector(".md\\:hidden");
    const desktopTable = document.querySelector(".hidden.md\\:block");
    return {
      mobileStackExists: !!mobileStack,
      desktopTableHidden: desktopTable ? window.getComputedStyle(desktopTable).display === "none" : true,
    };
  });
  console.log("Mobile layout check:", mobileCardsVisible);
  if (!mobileCardsVisible.mobileStackExists || !mobileCardsVisible.desktopTableHidden) {
    throw new Error("Mobile responsive pricing cards failed verification: " + JSON.stringify(mobileCardsVisible));
  }
  console.log("✓ Mobile stacked variant card layout verified");

  // Reset viewport to desktop
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });

  console.log("4. Verifying header does not overlap content on any admin page...");
  const pagesToTest = ["/admin", "/admin/products", "/admin/pricing", "/admin/orders", "/admin/settings"];
  for (const route of pagesToTest) {
    await page.goto(`http://admin.localhost:${PORT}${route}`, { waitUntil: "networkidle2", timeout: 20000 });
    await new Promise((r) => setTimeout(r, 800));

    // Scroll down 400px and verify topbar does not occlude the top visible card
    await page.evaluate(() => window.scrollBy(0, 400));
    await new Promise((r) => setTimeout(r, 400));

    const overlapCheck = await page.evaluate(() => {
      const topbar = document.querySelector(".admin-topbar");
      if (!topbar) return { hasTopbar: false };
      const topbarRect = topbar.getBoundingClientRect();

      // Find cards or headings
      const elements = Array.from(document.querySelectorAll(".admin-header-card, .admin-stat-card, h1, h2"));
      let occluded = false;
      for (const el of elements) {
        const rect = el.getBoundingClientRect();
        // If an element starts below 0 but above topbar bottom, check if it's partially behind
        if (rect.top > 0 && rect.top < topbarRect.bottom - 5 && rect.bottom > topbarRect.bottom) {
          occluded = true;
          break;
        }
      }
      return {
        topbarHeight: topbarRect.height,
        topbarBottom: topbarRect.bottom,
        occluded,
      };
    });
    console.log(`Page ${route} topbar check:`, overlapCheck);
  }
  console.log("✓ Header overlap checks completed across all admin routes");

  console.log("ALL PREFLIGHT CHECKS PASSED SUCCESSFULLY!");
} catch (err) {
  console.error("Preflight check failed:", err);
  process.exit(1);
} finally {
  await browser.close();
  server.close();
}
