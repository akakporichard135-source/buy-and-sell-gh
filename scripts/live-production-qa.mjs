import puppeteer from "puppeteer-core";
import path from "node:path";
import assert from "node:assert/strict";

const edgePath = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const artifactDir = "C:\\Users\\akakp\\.gemini\\antigravity\\brain\\6c721dee-7d06-4a2d-92fb-b74a2b38f58f";
const prodUrl = "https://buyandsellgh.com";

const browser = await puppeteer.launch({
  executablePath: edgePath,
  headless: true,
  pipe: true,
  args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-gpu"],
});

try {
  console.log("Starting Live Production QA on", prodUrl);

  // 1. Desktop Homepage Verification
  {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });
    await page.goto(prodUrl, { waitUntil: "domcontentloaded", timeout: 45000 });
    await new Promise((r) => setTimeout(r, 2000));

    // Verify AirPods Pro 3 homepage tile has static image and NO video
    const airpodsVideo = await page.$(".home-ref-airpods-pro-3 video");
    assert.equal(airpodsVideo, null, "AirPods Pro 3 homepage tile has NO video element");
    const airpodsImg = await page.$eval(".home-ref-airpods-pro-3 .home-ref-tile-image", (el) => el.getAttribute("src"));
    console.log("PASS: Live AirPods Pro 3 homepage tile image:", airpodsImg);
    assert.match(airpodsImg, /airpods-pro-3-apple\.jpg/, "AirPods Pro 3 homepage tile uses restored static image");

    // Verify Mac mini homepage tile has hand holding device image
    const macMiniImg = await page.$eval(".home-ref-mac-mini .home-ref-tile-image", (el) => el.getAttribute("src"));
    console.log("PASS: Live Mac mini homepage tile image:", macMiniImg);
    assert.match(macMiniImg, /mac-mini-device\.jpg/, "Mac mini homepage tile uses restored hand-holding-device image");

    // Verify AirPods 5 is NOT on the homepage
    const airpods5Tile = await page.$(".home-ref-airpods-5");
    assert.equal(airpods5Tile, null, "AirPods 5 is completely removed from the homepage");

    // Screenshot homepage grid on desktop
    await page.evaluate(() => {
      const grid = document.querySelector(".home-ref-grid");
      if (grid) grid.scrollIntoView();
    });
    await new Promise((r) => setTimeout(r, 1000));
    await page.screenshot({ path: path.join(artifactDir, "live-prod-homepage-grid-desktop.png") });
    await page.close();
  }

  // 2. Mobile Homepage Verification
  {
    const page = await browser.newPage();
    await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
    await page.goto(prodUrl, { waitUntil: "domcontentloaded", timeout: 45000 });
    await new Promise((r) => setTimeout(r, 2000));

    await page.evaluate(() => {
      const tile = document.querySelector(".home-ref-airpods-pro-3");
      if (tile) tile.scrollIntoView();
    });
    await new Promise((r) => setTimeout(r, 800));
    await page.screenshot({ path: path.join(artifactDir, "live-prod-homepage-airpods-mobile.png") });

    await page.evaluate(() => {
      const tile = document.querySelector(".home-ref-mac-mini");
      if (tile) tile.scrollIntoView();
    });
    await new Promise((r) => setTimeout(r, 800));
    await page.screenshot({ path: path.join(artifactDir, "live-prod-homepage-macmini-mobile.png") });
    await page.close();
  }

  // 3. Desktop AirPods Pro 3 Learn More Verification
  {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });
    await page.goto(`${prodUrl}/airpods/airpods-pro-3`, { waitUntil: "domcontentloaded", timeout: 45000 });
    await new Promise((r) => setTimeout(r, 2000));

    const lmVideo = await page.$(".editorial-cinematic-opening-media video");
    assert.ok(lmVideo !== null, "AirPods Pro 3 Learn More opening cinematic video exists");
    const lmVideoSrc = await page.$eval(".editorial-cinematic-opening-media video", (el) => el.currentSrc || el.querySelector("source")?.getAttribute("src"));
    console.log("PASS: Live AirPods Pro 3 Learn More video src:", lmVideoSrc);
    assert.match(lmVideoSrc, /airpods-pro-3-lifestyle/, "AirPods Pro 3 Learn More uses lifestyle video");

    const lmAnchor = await page.$(".editorial-hardware-anchor");
    assert.ok(lmAnchor !== null, "Hardware anchor section exists below highlights");
    const lmAnchorImg = await page.$eval(".editorial-hardware-anchor-art img", (el) => el.getAttribute("src"));
    console.log("PASS: Live AirPods Pro 3 hardware anchor image:", lmAnchorImg);
    assert.match(lmAnchorImg, /airpods-pro-3-apple\.jpg/, "Hardware anchor displays previous top visual");

    await page.screenshot({ path: path.join(artifactDir, "live-prod-airpods-pro-3-learn-more-hero-desktop.png") });

    await page.evaluate(() => {
      const el = document.querySelector(".editorial-hardware-anchor");
      if (el) el.scrollIntoView();
    });
    await new Promise((r) => setTimeout(r, 1000));
    await page.screenshot({ path: path.join(artifactDir, "live-prod-airpods-pro-3-learn-more-anchor-desktop.png") });
    await page.close();
  }

  // 4. Mobile AirPods Pro 3 Learn More Verification
  {
    const page = await browser.newPage();
    await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
    await page.goto(`${prodUrl}/airpods/airpods-pro-3`, { waitUntil: "domcontentloaded", timeout: 45000 });
    await new Promise((r) => setTimeout(r, 2000));
    await page.screenshot({ path: path.join(artifactDir, "live-prod-airpods-pro-3-learn-more-mobile.png") });
    await page.close();
  }

  // 5. Preserved Features: iPhone 18 Pro Learn More
  {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });
    await page.goto(`${prodUrl}/iphone/iphone-18-pro`, { waitUntil: "domcontentloaded", timeout: 45000 });
    await new Promise((r) => setTimeout(r, 2000));
    const iphone18Video = await page.$(".editorial-cinematic-opening-media video");
    assert.ok(iphone18Video !== null, "iPhone 18 Pro opening cinematic video is intact");
    console.log("PASS: iPhone 18 Pro opening cinematic video intact");
    await page.close();
  }

  // 6. Preserved Features: AirPods 5 Learn More
  {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });
    await page.goto(`${prodUrl}/airpods/airpods-5`, { waitUntil: "domcontentloaded", timeout: 45000 });
    await new Promise((r) => setTimeout(r, 2000));
    const airpods5Heading = await page.$eval("h1", (el) => el.textContent);
    assert.equal(airpods5Heading, "AirPods 5", "AirPods 5 Learn More page remains intact and accessible");
    console.log("PASS: AirPods 5 Learn More page intact:", airpods5Heading);
    await page.close();
  }

  // 7. Preserved Features: Store & Pricing
  {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });
    await page.goto(`${prodUrl}/store`, { waitUntil: "domcontentloaded", timeout: 45000 });
    await new Promise((r) => setTimeout(r, 2000));
    const storeHeading = await page.$eval("h1", (el) => el.textContent);
    console.log("PASS: Store page loads correctly:", storeHeading);
    await page.close();
  }

  console.log("ALL LIVE PRODUCTION QA CHECKS PASSED SUCCESSFULLY!");
  await browser.close();
} catch (err) {
  console.error("Live QA Failed:", err);
  await browser.close();
  process.exit(1);
}
