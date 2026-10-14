import puppeteer from "puppeteer-core";
import fs from "node:fs";
import path from "node:path";

const EDGE_PATH = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const ARTIFACT_DIR = "C:\\Users\\akakp\\.gemini\\antigravity\\brain\\6c721dee-7d06-4a2d-92fb-b74a2b38f58f";

async function verifyLiveProduction() {
  console.log("Launching headless browser for live production post-deployment QA...");
  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-gpu",
      "--host-resolver-rules=MAP admin.buyandsellgh.com 216.198.79.65, MAP buyandsellgh.com 64.29.17.1",
    ],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  // 1. Check Public Storefront Homepage
  console.log("Navigating to https://buyandsellgh.com...");
  const resHome = await page.goto("https://buyandsellgh.com", { waitUntil: "networkidle2", timeout: 45000 });
  console.log("Storefront homepage status:", resHome?.status());
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: path.join(ARTIFACT_DIR, "live-storefront-homepage-deployed.png"), fullPage: false });

  // 2. Check Public Product Details Page (iPhone 17 Pro Max)
  console.log("Navigating to https://buyandsellgh.com/product/iphone-17-pro-max...");
  const resPdp = await page.goto("https://buyandsellgh.com/product/iphone-17-pro-max", { waitUntil: "networkidle2", timeout: 45000 });
  console.log("PDP status:", resPdp?.status());
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: path.join(ARTIFACT_DIR, "live-storefront-pdp-deployed.png"), fullPage: false });

  // 3. Check Admin Login Portal
  console.log("Navigating to https://admin.buyandsellgh.com...");
  const resAdmin = await page.goto("https://admin.buyandsellgh.com", { waitUntil: "networkidle2", timeout: 45000 });
  console.log("Admin portal status:", resAdmin?.status());
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: path.join(ARTIFACT_DIR, "live-admin-login-deployed.png"), fullPage: false });

  // 4. Check Mobile Viewport
  await page.setViewport({ width: 390, height: 844 });
  await page.goto("https://buyandsellgh.com", { waitUntil: "networkidle2", timeout: 45000 });
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: path.join(ARTIFACT_DIR, "live-storefront-mobile-deployed.png"), fullPage: false });

  await browser.close();
  console.log("Live production verification completed successfully!");
}

verifyLiveProduction().catch(console.error);
