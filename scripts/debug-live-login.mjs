import puppeteer from "puppeteer-core";
import path from "node:path";

const EDGE_PATH = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const ARTIFACT_DIR = "C:\\Users\\akakp\\.gemini\\antigravity\\brain\\6c721dee-7d06-4a2d-92fb-b74a2b38f58f";

const browser = await puppeteer.launch({
  executablePath: EDGE_PATH,
  headless: true,
  args: [
    "--no-sandbox",
    "--disable-setuid-sandbox",
    "--host-resolver-rules=MAP admin.buyandsellgh.com 216.198.79.65, MAP buyandsellgh.com 64.29.17.1",
  ],
});

try {
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  page.on("console", (msg) => console.log("PAGE LOG:", msg.type(), msg.text()));
  page.on("pageerror", (err) => console.error("PAGE ERROR:", err));

  console.log("Navigating to https://admin.buyandsellgh.com/admin/login...");
  await page.goto("https://admin.buyandsellgh.com/admin/login", { waitUntil: "networkidle2" });

  await page.type('input[type="email"]', "admin@buyandsellgh.com");
  await page.type('input[type="password"]', "Apple-Shopify-Quality-2026");
  
  console.log("Clicking submit...");
  await page.click('button[type="submit"]');

  await new Promise((r) => setTimeout(r, 4000));
  console.log("Current URL after 4s:", page.url());

  const bodyText = await page.evaluate(() => document.body.innerText);
  console.log("Body text after login attempt:\n", bodyText.slice(0, 500));

  await page.screenshot({ path: path.join(ARTIFACT_DIR, "live-login-debug.png") });
} finally {
  await browser.close();
}
