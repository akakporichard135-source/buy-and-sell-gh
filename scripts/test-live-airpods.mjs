import puppeteer from "puppeteer-core";
import path from "node:path";

const edgePath = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const artifactDir = "C:/Users/akakp/.gemini/antigravity/brain/6c721dee-7d06-4a2d-92fb-b74a2b38f58f";
const prodUrl = "https://buyandsellgh.com";

const browser = await puppeteer.launch({
  executablePath: edgePath,
  headless: true,
  pipe: true,
  args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-gpu"],
});

try {
  const page = await browser.newPage();

  // 1. AirPods Pro 3 Learn More - Desktop
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto(`${prodUrl}/airpods/airpods-pro-3`, { waitUntil: "domcontentloaded", timeout: 60000 });
  await new Promise((r) => setTimeout(r, 3000));

  const hasVideo = await page.$(".editorial-cinematic-opening-media video");
  console.log("Has video in .editorial-cinematic-opening-media:", Boolean(hasVideo));
  const videoSrc = await page.$eval(".editorial-cinematic-opening-media video", (v) => v.currentSrc || v.innerHTML).catch((e) => e.message);
  console.log("Video source:", videoSrc);

  await page.screenshot({ path: path.join(artifactDir, "live-prod-airpods-pro-3-hero.png") });
  console.log("Captured live-prod-airpods-pro-3-hero.png");

  // Scroll to hardware anchor
  await page.evaluate(() => {
    const el = document.querySelector(".editorial-hardware-anchor");
    if (el) el.scrollIntoView({ behavior: "instant", block: "center" });
  });
  await new Promise((r) => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(artifactDir, "live-prod-airpods-pro-3-anchor.png") });
  console.log("Captured live-prod-airpods-pro-3-anchor.png");

  // 2. AirPods Pro 3 Learn More - Mobile
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await new Promise((r) => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(artifactDir, "live-prod-airpods-pro-3-mobile.png") });
  console.log("Captured live-prod-airpods-pro-3-mobile.png");

  // 3. Homepage - Mobile (verify AirPods Pro 3 & Mac mini on mobile)
  await page.goto(prodUrl, { waitUntil: "domcontentloaded", timeout: 60000 });
  await new Promise((r) => setTimeout(r, 2000));

  await page.evaluate(() => {
    const tile = document.querySelector(".home-ref-airpods-pro-3");
    if (tile) tile.scrollIntoView({ behavior: "instant", block: "center" });
  });
  await new Promise((r) => setTimeout(r, 800));
  await page.screenshot({ path: path.join(artifactDir, "live-prod-homepage-airpods-mobile.png") });
  console.log("Captured live-prod-homepage-airpods-mobile.png");

  await page.evaluate(() => {
    const tile = document.querySelector(".home-ref-mac-mini");
    if (tile) tile.scrollIntoView({ behavior: "instant", block: "center" });
  });
  await new Promise((r) => setTimeout(r, 800));
  await page.screenshot({ path: path.join(artifactDir, "live-prod-homepage-macmini-mobile.png") });
  console.log("Captured live-prod-homepage-macmini-mobile.png");

  await browser.close();
  console.log("ALL LIVE SCREENSHOTS CAPTURED SUCCESSFULLY!");
} catch (err) {
  console.error("Error:", err);
  await browser.close();
  process.exit(1);
}
