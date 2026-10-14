import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import puppeteer from "puppeteer-core";
import assert from "node:assert/strict";

const EDGE_PATH = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const ARTIFACTS_DIR = "C:\\Users\\akakp\\.gemini\\antigravity\\brain\\6c721dee-7d06-4a2d-92fb-b74a2b38f58f";
const DIST_DIR = path.resolve("dist");

const mimeTypes = {
  ".html": "text/html",
  ".js": "application/javascript",
  ".css": "text/css",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".json": "application/json",
};

function createStaticServer(port = 4210) {
  const server = http.createServer((req, res) => {
    let reqPath = req.url.split("?")[0];
    let filePath = path.join(DIST_DIR, reqPath);

    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      const ext = path.extname(filePath);
      res.writeHead(200, { "Content-Type": mimeTypes[ext] || "application/octet-stream" });
      fs.createReadStream(filePath).pipe(res);
      return;
    }

    const indexPath = path.join(DIST_DIR, "index.html");
    res.writeHead(200, { "Content-Type": "text/html" });
    fs.createReadStream(indexPath).pipe(res);
  });

  return new Promise((resolve) => {
    server.listen(port, "127.0.0.1", () => resolve(server));
  });
}

async function run() {
  console.log("=== FULL MEDIA LIBRARY E2E AUDIT & VERIFICATION ===");
  const server = await createStaticServer(4210);
  console.log("Local Server listening on http://admin.localhost:4210");

  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-gpu"],
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });

    // 1. Establish local admin session
    await page.goto("http://admin.localhost:4210/admin/login", { waitUntil: "networkidle0" });
    await page.evaluate(() => {
      localStorage.setItem("buyandsell-gh-temp-admin-session", JSON.stringify({
        userId: "local-admin",
        email: "admin@buyandsellgh.com",
        mode: "local",
        role: "owner",
        assuranceLevel: "aal2",
        verifiedTotpFactors: []
      }));
    });

    // 2. Navigate to /admin/media
    console.log("\n[1] Navigating to /admin/media...");
    await page.goto("http://admin.localhost:4210/admin/media", { waitUntil: "networkidle0" });
    await new Promise((r) => setTimeout(r, 2000));

    // Evaluate cards and In-Use indicators
    const cardData = await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll(".group"));
      return cards.map((c) => {
        const title = c.querySelector("h4")?.innerText || "";
        const category = c.querySelector(".uppercase")?.innerText || "";
        const isInUse = c.innerText.includes("In Use");
        return { title, category, isInUse };
      });
    });

    console.log(`Total Media Assets rendered: ${cardData.length}`);
    const inUseCount = cardData.filter((c) => c.isInUse).length;
    console.log(`Assets marked 'In Use' with protection: ${inUseCount}`);
    assert.ok(cardData.length >= 18, "At least 18 media assets must be visible");
    assert.ok(inUseCount >= 10, "Protected assets must display 'In Use' badges");

    await page.screenshot({
      path: path.join(ARTIFACTS_DIR, "admin-media-library-grid-inuse-badges.png"),
      fullPage: false,
    });
    console.log("✓ Saved: admin-media-library-grid-inuse-badges.png");

    // 3. Test Delete on In-Use Protected Asset
    console.log("\n[2] Testing Deletion attempt on Protected In-Use Asset (iPad Air Promo Tile)...");
    const clickedTrash = await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll(".group"));
      const targetCard = cards.find((c) => c.innerText.includes("iPad Air Promo Tile") || c.innerText.includes("Apple Watch Ultra 4") || c.innerText.includes("AirPods Pro 3"));
      if (!targetCard) return false;
      const btns = Array.from(targetCard.querySelectorAll("button"));
      const trash = btns[btns.length - 1];
      if (trash) {
        trash.click();
        return true;
      }
      return false;
    });

    assert.ok(clickedTrash, "Must find and click trash button on in-use asset");
    await new Promise((r) => setTimeout(r, 1000));

    const modalDetails = await page.evaluate(() => {
      const modal = document.querySelector(".fixed.inset-0");
      if (!modal) return null;
      const title = modal.querySelector("h3")?.innerText || "";
      const subtitle = modal.querySelector("p")?.innerText || "";
      const locations = Array.from(modal.querySelectorAll("li")).map((l) => l.innerText.trim());
      const buttons = Array.from(modal.querySelectorAll("button")).map((b) => b.innerText.trim());
      const hasRemoveOption = buttons.some((b) => b.includes("Remove from Library"));
      const hasPermanentOption = buttons.some((b) => b.includes("Delete Permanently"));
      const permanentBtnDisabled = Array.from(modal.querySelectorAll("button")).find((b) => b.innerText.includes("Delete Permanently"))?.disabled;
      const isBlockedBadge = modal.innerText.includes("Blocked (In Use)");
      const inUseStatus = modal.innerText.includes("In Active Use");
      return { title, subtitle, locations, buttons, hasRemoveOption, hasPermanentOption, permanentBtnDisabled, isBlockedBadge, inUseStatus };
    });

    console.log("Self-Service Deletion Modal Output:", modalDetails);
    assert.ok(modalDetails, "Self-service deletion modal must be displayed");
    assert.ok(modalDetails.title.includes("Media Asset"), "Modal title must match Media Asset management");
    assert.ok(modalDetails.inUseStatus, "Modal must indicate In Active Use");
    assert.ok(modalDetails.locations.length > 0, "Modal must list live locations where asset is used");
    assert.ok(modalDetails.hasRemoveOption, "Must offer 'Remove from Library' safe option");
    assert.ok(modalDetails.hasPermanentOption, "Must offer 'Delete Permanently' option");
    assert.ok(modalDetails.permanentBtnDisabled || modalDetails.isBlockedBadge, "Permanent deletion must be blocked while asset is in use");

    await page.screenshot({
      path: path.join(ARTIFACTS_DIR, "admin-media-library-inuse-protection-modal.png"),
      fullPage: false,
    });
    console.log("✓ Saved: admin-media-library-inuse-protection-modal.png");

    // Close the modal via Cancel button
    await page.evaluate(() => {
      const cancelBtn = Array.from(document.querySelectorAll("button")).find((b) => b.innerText.trim() === "Cancel");
      if (cancelBtn) cancelBtn.click();
    });
    await new Promise((r) => setTimeout(r, 600));

    // 4. Test Edit / Replace Modal
    console.log("\n[3] Testing Edit / Replace Modal on iPad Air Promo Tile...");
    const clickedEdit = await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll(".group"));
      const ipadCard = cards.find((c) => c.innerText.includes("iPad Air Promo Tile"));
      if (!ipadCard) return false;
      const edit = Array.from(ipadCard.querySelectorAll("button")).find((b) => b.innerText.includes("Edit"));
      if (edit) {
        edit.click();
        return true;
      }
      return false;
    });

    assert.ok(clickedEdit, "Must find and click Edit / Replace button on iPad Air Promo Tile");
    await new Promise((r) => setTimeout(r, 1000));

    const editModalInfo = await page.evaluate(() => {
      const modal = document.querySelector(".fixed.inset-0");
      if (!modal) return null;
      const title = modal.querySelector("h3")?.innerText || "";
      const hasTitleInput = !!modal.querySelector("input[type='text']");
      const hasFileInput = !!modal.querySelector("input[type='file']");
      const hasSaveBtn = Array.from(modal.querySelectorAll("button")).some((b) => b.innerText.includes("Save"));
      return { title, hasTitleInput, hasFileInput, hasSaveBtn };
    });

    console.log("Edit Modal Output:", editModalInfo);
    assert.ok(editModalInfo && editModalInfo.hasTitleInput && editModalInfo.hasFileInput, "Edit modal must render all controls");

    await page.screenshot({
      path: path.join(ARTIFACTS_DIR, "admin-media-library-edit-replace-modal.png"),
      fullPage: false,
    });
    console.log("✓ Saved: admin-media-library-edit-replace-modal.png");

    // Close edit modal
    await page.evaluate(() => {
      const cancelBtn = Array.from(document.querySelectorAll("button")).find((b) => b.innerText === "Cancel");
      if (cancelBtn) cancelBtn.click();
    });
    await new Promise((r) => setTimeout(r, 600));

    // 5. Test Copy URL
    console.log("\n[4] Testing Copy URL Functionality...");
    const copyResult = await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll(".group"));
      const card = cards[0];
      const copyBtn = card.querySelector("button[title='Copy URL']");
      if (copyBtn) {
        copyBtn.click();
        return true;
      }
      return false;
    });
    console.log(`Copy URL clicked: ${copyResult}`);
    await new Promise((r) => setTimeout(r, 500));

    // 6. Test Category Filter Navigation
    console.log("\n[5] Testing Category Filters...");
    const filterTabs = ["Storefront & Tiles", "Service Flyers", "Product Imagery", "Brand & Logos"];
    for (const tab of filterTabs) {
      await page.evaluate((tabName) => {
        const b = Array.from(document.querySelectorAll("button")).find((el) => el.innerText.includes(tabName));
        if (b) b.click();
      }, tab);
      await new Promise((r) => setTimeout(r, 600));
      const count = await page.evaluate(() => document.querySelectorAll(".group").length);
      console.log(`  ✓ Filter '${tab}' displayed: ${count} assets`);
      assert.ok(count > 0, `Filter '${tab}' must display assets`);
    }

    console.log("\n>>> FULL MEDIA LIBRARY E2E AUDIT COMPLETED 100% SUCCESSFULLY! <<<\n");

  } finally {
    await browser.close();
    server.close();
  }
}

run().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
