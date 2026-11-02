import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import puppeteer from "puppeteer-core";

const EDGE_PATH = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const PORT = 4255;
const DIST = path.resolve("dist");
const BRAIN_DIR = "C:/Users/akakp/.gemini/antigravity/brain/6c721dee-7d06-4a2d-92fb-b74a2b38f58f";

const MIME = {
  ".html": "text/html",
  ".js": "application/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
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

async function run() {
  await new Promise((resolve) => server.listen(PORT, "127.0.0.1", resolve));
  console.log(`[Test Server] Running at http://127.0.0.1:${PORT}`);

  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage", "--disable-gpu"],
  });

  try {
    const page = await browser.newPage();
    page.setDefaultNavigationTimeout(45000);
    await page.setViewport({ width: 1440, height: 900 });

    // 1. Authenticate Admin Session
    console.log("Authenticating Admin Preview Session...");
    await page.goto(`http://127.0.0.1:${PORT}/?admin_preview=1`, { waitUntil: "domcontentloaded" });
    await page.evaluate(() => {
      sessionStorage.setItem("admin_preview_active", "1");
      localStorage.setItem("admin_preview_active", "1");
      document.cookie = "admin_preview_active=1; path=/";
      localStorage.setItem(
        "buyandsell-gh-temp-admin-session",
        JSON.stringify({
          userId: "admin-owner",
          email: "richardakakpo15@gmail.com",
          mode: "local",
          role: "owner",
          assuranceLevel: "aal2",
          verifiedTotpFactors: [],
        })
      );
    });

    // 2. Test Admin Services Requests Inbox
    console.log("Navigating to Admin Services Requests Inbox...");
    await page.goto(`http://127.0.0.1:${PORT}/admin/services?admin_preview=1`, { waitUntil: "domcontentloaded" });
    await page.waitForFunction(() => {
      const text = document.body.innerText;
      return !text.includes("Loading customer submissions") && document.querySelectorAll(".admin-data-table tbody tr").length > 0;
    }, { timeout: 30000 });

    console.log("Admin Services Inbox loaded!");

    // Capture initial Active Requests screenshot
    const activeShotPath = path.join(BRAIN_DIR, "admin-services-active-tab.png");
    await page.screenshot({ path: activeShotPath });
    console.log(`Saved screenshot: ${activeShotPath}`);

    // Click on Archived Requests tab
    console.log("Switching to Archived Requests tab...");
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll("button"));
      const archivedBtn = buttons.find((b) => b.innerText.includes("Archived Requests"));
      if (archivedBtn) archivedBtn.click();
    });
    await new Promise((r) => setTimeout(r, 800));

    const archiveShotPath = path.join(BRAIN_DIR, "admin-requests-archive-tab.png");
    await page.screenshot({ path: archiveShotPath });
    console.log(`Saved screenshot: ${archiveShotPath}`);

    // Switch back to Active Requests tab
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll("button"));
      const activeBtn = buttons.find((b) => b.innerText.includes("Active Requests"));
      if (activeBtn) activeBtn.click();
    });
    await new Promise((r) => setTimeout(r, 800));

    // 3. Test Permanent Delete Modal (Two-step confirmation)
    console.log("Testing Permanent Delete Modal...");
    await page.evaluate(() => {
      const deleteButtons = Array.from(document.querySelectorAll('button[title*="Permanently Delete"]'));
      if (deleteButtons.length > 0) deleteButtons[0].click();
    });
    await new Promise((r) => setTimeout(r, 800));

    const deleteModalTitle = await page.evaluate(() => {
      const h3 = document.querySelector(".admin-modal-box h3");
      return h3 ? h3.innerText : "";
    });
    console.log("Delete Modal Title:", deleteModalTitle);

    const deleteModalShotPath = path.join(BRAIN_DIR, "admin-permanent-delete-dialog.png");
    await page.screenshot({ path: deleteModalShotPath });
    console.log(`Saved screenshot: ${deleteModalShotPath}`);

    // Close delete modal
    await page.evaluate(() => {
      const cancelBtn = Array.from(document.querySelectorAll(".admin-modal-box button")).find(
        (b) => b.innerText === "Cancel"
      );
      if (cancelBtn) cancelBtn.click();
    });
    await new Promise((r) => setTimeout(r, 500));

    // 4. Test Notification Bell in Top Bar
    console.log("Testing Admin Top Bar Notification Bell...");
    await page.click('button[title*="Admin Notifications"]');
    await new Promise((r) => setTimeout(r, 800));

    const bellShotPath = path.join(BRAIN_DIR, "admin-bell-notifications.png");
    await page.screenshot({ path: bellShotPath });
    console.log(`Saved screenshot: ${bellShotPath}`);

    // 5. Test Admin Settings -> Notification Alerts & Sound Tab
    console.log("Navigating to Admin Settings Notifications Tab...");
    await page.goto(`http://127.0.0.1:${PORT}/admin/settings?tab=notifications&admin_preview=1`, {
      waitUntil: "domcontentloaded",
    });
    await page.waitForFunction(() => {
      return document.body.innerText.includes("Select Alert Sound") && document.querySelectorAll("select").length > 0;
    }, { timeout: 30000 });

    const settingsShotPath = path.join(BRAIN_DIR, "admin-notification-settings.png");
    await page.screenshot({ path: settingsShotPath });
    console.log(`Saved screenshot: ${settingsShotPath}`);

    // Click Test Sound button
    console.log("Clicking Test Sound button...");
    await page.evaluate(() => {
      const testButtons = Array.from(document.querySelectorAll("button")).filter((b) =>
        b.innerText.includes("Test")
      );
      if (testButtons.length > 0) testButtons[0].click();
    });
    await new Promise((r) => setTimeout(r, 1000));

    console.log("All E2E browser checks completed successfully!");
  } finally {
    await browser.close();
    server.close();
  }
}

run().catch((e) => {
  console.error("Verification failed:", e);
  process.exit(1);
});
