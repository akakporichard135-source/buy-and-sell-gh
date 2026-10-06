import puppeteer from "puppeteer-core";
import assert from "node:assert/strict";
import path from "node:path";

const EDGE_PATH = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const BASE_URL = "http://127.0.0.1:4173";
const ARTIFACT_DIR = "C:\\Users\\akakp\\.gemini\\antigravity\\brain\\6c721dee-7d06-4a2d-92fb-b74a2b38f58f";

async function runLocalQA() {
  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: true,
    pipe: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-gpu"],
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });

    // 1. Check Homepage
    console.log("Testing Homepage at " + BASE_URL + "...");
    await page.goto(BASE_URL, { waitUntil: "networkidle0" });
    await new Promise((r) => setTimeout(r, 1000));

    // Video tag count
    const videoCount = await page.$$eval("video", (els) => els.length);
    console.log(`Homepage video count: ${videoCount}`);
    assert.equal(videoCount, 0, "Homepage must contain 0 <video> tags");

    // Video preload count
    const videoPreloads = await page.$$eval('link[rel="preload"][as="video"]', (els) => els.length);
    console.log(`Homepage video preloads: ${videoPreloads}`);
    assert.equal(videoPreloads, 0, "Homepage must contain 0 video preloads");

    // Check visible pricing text across the homepage
    const homepageText = await page.$eval("main.storefront-home", (el) => el.innerText);
    const priceMatches = homepageText.match(/(?:GH[₵S]|GHS)\s*[\d,]+/gi) || [];
    console.log(`Homepage price matches in main:`, priceMatches);
    assert.equal(priceMatches.length, 0, "Homepage must contain ZERO visible prices in storefront main");

    // Check specific pill selector
    const pricePills = await page.$$eval(".store-hero-price-pill", (els) => els.length);
    console.log(`Homepage price pills count: ${pricePills}`);
    assert.equal(pricePills, 0, "Homepage must have 0 .store-hero-price-pill elements");

    // Check horizontal scroll
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    console.log(`Homepage desktop width: ${scrollWidth} vs ${clientWidth}`);
    assert.ok(scrollWidth <= clientWidth + 1, "Homepage should not have horizontal overflow");

    await page.screenshot({ path: path.join(ARTIFACT_DIR, "local-qa-homepage-desktop.png") });

    // Test mobile homepage
    await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
    await page.goto(BASE_URL, { waitUntil: "networkidle0" });
    await new Promise((r) => setTimeout(r, 1000));
    const mobileScrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const mobileClientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    console.log(`Homepage mobile width: ${mobileScrollWidth} vs ${mobileClientWidth}`);
    assert.ok(mobileScrollWidth <= mobileClientWidth + 1, "Homepage mobile should not have horizontal overflow");
    await page.screenshot({ path: path.join(ARTIFACT_DIR, "local-qa-homepage-mobile.png") });

    // 2. Check the 4 Learn More stories
    const stories = [
      { slug: "iphone-18-pro", path: "/iphone/iphone-18-pro" },
      { slug: "iphone-duo", path: "/iphone/iphone-duo" },
      { slug: "apple-watch-series-12", path: "/watch/apple-watch-series-12" },
      { slug: "apple-watch-ultra-4", path: "/watch/apple-watch-ultra-4" },
    ];

    for (const story of stories) {
      console.log(`Testing story: ${story.slug} at ${BASE_URL}${story.path}...`);
      await page.setViewport({ width: 1440, height: 900 });
      await page.goto(`${BASE_URL}${story.path}`, { waitUntil: "networkidle0" });
      await new Promise((r) => setTimeout(r, 1000));

      // Verify structure: Top Hero (B) -> Highlights -> Hardware Anchor (A) -> Chapters
      const structure = await page.evaluate(() => {
        const hero = document.querySelector(".editorial-hero");
        const cinematicOpening = document.querySelector(".editorial-cinematic-opening-media");
        const highlights = document.querySelector(".editorial-highlights");
        const hardwareAnchor = document.querySelector(".editorial-hardware-anchor");
        const chapters = document.querySelectorAll(".editorial-chapter");
        const buyButtons = document.querySelectorAll(".editorial-buy");
        const videos = document.querySelectorAll("video");

        return {
          hasHero: !!hero,
          hasCinematicOpening: !!cinematicOpening,
          hasHighlights: !!highlights,
          hasHardwareAnchor: !!hardwareAnchor,
          chapterCount: chapters.length,
          buyButtonCount: buyButtons.length,
          videoCount: videos.length,
          heroIsBeforeHighlights: hero && highlights ? (hero.compareDocumentPosition(highlights) & Node.DOCUMENT_POSITION_FOLLOWING) > 0 : false,
          highlightsIsBeforeAnchor: highlights && hardwareAnchor ? (highlights.compareDocumentPosition(hardwareAnchor) & Node.DOCUMENT_POSITION_FOLLOWING) > 0 : false,
        };
      });

      console.log(`Structure for ${story.slug}:`, structure);
      assert.ok(structure.hasHero, `${story.slug} must have .editorial-hero`);
      assert.ok(structure.hasCinematicOpening, `${story.slug} must have .editorial-cinematic-opening-media in hero`);
      assert.ok(structure.hasHighlights, `${story.slug} must have .editorial-highlights`);
      assert.ok(structure.hasHardwareAnchor, `${story.slug} must have .editorial-hardware-anchor below highlights`);
      assert.ok(structure.heroIsBeforeHighlights, `${story.slug} Hero must come before Highlights`);
      assert.ok(structure.highlightsIsBeforeAnchor, `${story.slug} Highlights must come before Hardware Anchor`);
      assert.equal(structure.buyButtonCount, 1, `${story.slug} must have exactly 1 .editorial-buy button`);
      assert.equal(structure.videoCount, 0, `${story.slug} must have 0 playing videos (clean poster fallback applied due to TikTok watermarks)`);

      await page.screenshot({ path: path.join(ARTIFACT_DIR, `local-qa-${story.slug}-desktop.png`) });

      // Test mobile view
      await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
      await page.goto(`${BASE_URL}${story.path}`, { waitUntil: "networkidle0" });
      await new Promise((r) => setTimeout(r, 1000));
      const mScrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      const mClientWidth = await page.evaluate(() => document.documentElement.clientWidth);
      console.log(`${story.slug} mobile width: ${mScrollWidth} vs ${mClientWidth}`);
      assert.ok(mScrollWidth <= mClientWidth + 1, `${story.slug} mobile should not have horizontal overflow`);
      await page.screenshot({ path: path.join(ARTIFACT_DIR, `local-qa-${story.slug}-mobile.png`) });
    }

    console.log("\n>>> ALL LOCAL QA CHECKS PASSED PERFECTLY! <<<");
  } finally {
    await browser.close();
  }
}

runLocalQA().catch((err) => {
  console.error("Local QA Failed:", err);
  process.exit(1);
});
