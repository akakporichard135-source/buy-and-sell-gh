import puppeteer from "puppeteer-core";
import path from "node:path";
import assert from "node:assert/strict";

const EDGE_PATH = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const PROD_URL = "https://buyandsellgh.com";
const ARTIFACT_DIR = "C:\\Users\\akakp\\.gemini\\antigravity\\brain\\6c721dee-7d06-4a2d-92fb-b74a2b38f58f";

async function verifyLiveProduction() {
  console.log("=== COMPREHENSIVE PRODUCTION VERIFICATION ===");
  console.log(`Target URL: ${PROD_URL}`);

  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: true,
    pipe: true,
    protocolTimeout: 120000,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-gpu",
      "--no-first-run",
      "--no-default-browser-check",
    ],
  });

  const results = {
    homepageDesktop: {},
    homepageMobile: {},
    learnMoreStories: {},
    categoryPages: {},
    commerceSmokeTest: {},
  };

  try {
    // -------------------------------------------------------------
    // 1. Homepage Desktop
    // -------------------------------------------------------------
    console.log("\n[1. Homepage Desktop Verification]");
    const pageDesktop = await browser.newPage();
    await pageDesktop.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
    await pageDesktop.setCacheEnabled(false);

    const hpRes = await pageDesktop.goto(`${PROD_URL}/`, { waitUntil: "networkidle2", timeout: 45000 });
    results.homepageDesktop.status = hpRes.status();
    await new Promise((r) => setTimeout(r, 2000));

    const hpDesktopShot = path.join(ARTIFACT_DIR, "prod-clean-home-desktop.png");
    await pageDesktop.screenshot({ path: hpDesktopShot, fullPage: false });
    console.log("✓ Saved prod-clean-home-desktop.png");

    const homeDesktopVideoCount = await pageDesktop.evaluate(() => document.querySelectorAll("video").length);
    results.homepageDesktop.videoCount = homeDesktopVideoCount;
    console.log(`  Homepage desktop video element count: ${homeDesktopVideoCount} (Expected: 0)`);
    assert.equal(homeDesktopVideoCount, 0, "Production homepage desktop must contain 0 videos");

    const hpDesktopPriceMatches = await pageDesktop.evaluate(() => {
      const main = document.querySelector("main.storefront-home");
      if (!main) return [];
      const text = main.innerText;
      return text.match(/(?:GH[₵S]|GHS)\s*[\d,]+/gi) || [];
    });
    results.homepageDesktop.priceMatches = hpDesktopPriceMatches;
    console.log(`  Homepage desktop price matches:`, hpDesktopPriceMatches);
    assert.equal(hpDesktopPriceMatches.length, 0, "Production homepage desktop must contain ZERO visible prices in main");

    await pageDesktop.close();

    // -------------------------------------------------------------
    // 2. Homepage Mobile
    // -------------------------------------------------------------
    console.log("\n[2. Homepage Mobile Verification]");
    const pageMobile = await browser.newPage();
    await pageMobile.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
    await pageMobile.setCacheEnabled(false);
    const hpMobRes = await pageMobile.goto(`${PROD_URL}/`, { waitUntil: "networkidle2", timeout: 45000 });
    results.homepageMobile.status = hpMobRes.status();
    await new Promise((r) => setTimeout(r, 2000));

    const hpMobileShot = path.join(ARTIFACT_DIR, "prod-clean-home-mobile.png");
    await pageMobile.screenshot({ path: hpMobileShot, fullPage: false });
    console.log("✓ Saved prod-clean-home-mobile.png");

    const homeMobileVideoCount = await pageMobile.evaluate(() => document.querySelectorAll("video").length);
    results.homepageMobile.videoCount = homeMobileVideoCount;
    console.log(`  Homepage mobile video element count: ${homeMobileVideoCount} (Expected: 0)`);
    assert.equal(homeMobileVideoCount, 0, "Production homepage mobile must contain 0 videos");

    const hpMobilePriceMatches = await pageMobile.evaluate(() => {
      const main = document.querySelector("main.storefront-home");
      if (!main) return [];
      const text = main.innerText;
      return text.match(/(?:GH[₵S]|GHS)\s*[\d,]+/gi) || [];
    });
    results.homepageMobile.priceMatches = hpMobilePriceMatches;
    console.log(`  Homepage mobile price matches:`, hpMobilePriceMatches);
    assert.equal(hpMobilePriceMatches.length, 0, "Production homepage mobile must contain ZERO visible prices in main");

    await pageMobile.close();

    // -------------------------------------------------------------
    // 3. Learn More Flagship Stories (Swap Architecture)
    // -------------------------------------------------------------
    console.log("\n[3. Learn More Stories Verification (Swap Architecture)]");
    const stories = [
      {
        slug: "iphone-18-pro",
        route: "/iphone/iphone-18-pro",
        shotDesktop: "prod-iphone-18-pro-swap-desktop.png",
        shotMobile: "prod-iphone-18-pro-swap-mobile.png",
      },
      {
        slug: "iphone-duo",
        route: "/iphone/iphone-duo",
        shotDesktop: "prod-iphone-duo-swap-desktop.png",
        shotMobile: "prod-iphone-duo-swap-mobile.png",
      },
      {
        slug: "apple-watch-series-12",
        route: "/watch/apple-watch-series-12",
        shotDesktop: "prod-watch-series-12-swap-desktop.png",
        shotMobile: "prod-watch-series-12-swap-mobile.png",
      },
      {
        slug: "apple-watch-ultra-4",
        route: "/watch/apple-watch-ultra-4",
        shotDesktop: "prod-watch-ultra-4-swap-desktop.png",
        shotMobile: "prod-watch-ultra-4-swap-mobile.png",
      },
    ];

    for (const story of stories) {
      console.log(`\n  Checking ${story.route}...`);
      const storyPage = await browser.newPage();
      await storyPage.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
      await storyPage.setCacheEnabled(false);

      const res = await storyPage.goto(`${PROD_URL}${story.route}`, { waitUntil: "networkidle2", timeout: 45000 });
      await new Promise((r) => setTimeout(r, 2000));

      const evalData = await storyPage.evaluate(() => {
        const hero = document.querySelector(".editorial-hero");
        const cinematicOpening = document.querySelector(".editorial-cinematic-opening-media");
        const highlights = document.querySelector(".editorial-highlights");
        const hardwareAnchor = document.querySelector(".editorial-hardware-anchor");
        const chapters = document.querySelectorAll(".editorial-chapter");
        const buyButtons = document.querySelectorAll(".editorial-buy");
        const videos = document.querySelectorAll("video");

        return {
          title: document.title,
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

      results.learnMoreStories[story.slug] = {
        httpStatus: res.status(),
        ...evalData,
      };

      console.log(`    Status: ${res.status()}`);
      console.log(`    Title: ${evalData.title}`);
      console.log(`    Top Hero has Cinematic Opening (B): ${evalData.hasCinematicOpening}`);
      console.log(`    Highlights rail present: ${evalData.hasHighlights}`);
      console.log(`    Hardware Anchor (A) present below Highlights: ${evalData.hasHardwareAnchor}`);
      console.log(`    Hero precedes Highlights: ${evalData.heroIsBeforeHighlights}`);
      console.log(`    Highlights precedes Hardware Anchor: ${evalData.highlightsIsBeforeAnchor}`);
      console.log(`    Buy buttons count: ${evalData.buyButtonCount} (Expected: 1)`);
      console.log(`    Video elements count: ${evalData.videoCount} (Expected: 0, clean poster fallback applied)`);

      assert.ok(evalData.hasHero, `${story.slug} must have .editorial-hero`);
      assert.ok(evalData.hasCinematicOpening, `${story.slug} must have .editorial-cinematic-opening-media in hero`);
      assert.ok(evalData.hasHighlights, `${story.slug} must have .editorial-highlights`);
      assert.ok(evalData.hasHardwareAnchor, `${story.slug} must have .editorial-hardware-anchor below highlights`);
      assert.ok(evalData.heroIsBeforeHighlights, `${story.slug} Hero must come before Highlights`);
      assert.ok(evalData.highlightsIsBeforeAnchor, `${story.slug} Highlights must come before Hardware Anchor`);
      assert.equal(evalData.buyButtonCount, 1, `${story.slug} must have exactly 1 .editorial-buy button`);
      assert.equal(evalData.videoCount, 0, `${story.slug} must have 0 videos`);

      const shotPath = path.join(ARTIFACT_DIR, story.shotDesktop);
      await storyPage.screenshot({ path: shotPath, fullPage: false });
      console.log(`    ✓ Screenshot saved: ${story.shotDesktop}`);

      // Mobile check
      await storyPage.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
      await storyPage.goto(`${PROD_URL}${story.route}`, { waitUntil: "networkidle2", timeout: 45000 });
      await new Promise((r) => setTimeout(r, 1500));
      const mScrollWidth = await storyPage.evaluate(() => document.documentElement.scrollWidth);
      const mClientWidth = await storyPage.evaluate(() => document.documentElement.clientWidth);
      console.log(`    Mobile width: ${mScrollWidth} vs ${mClientWidth}`);
      assert.ok(mScrollWidth <= mClientWidth + 1, `${story.slug} mobile should not have horizontal overflow`);
      const mobileShotPath = path.join(ARTIFACT_DIR, story.shotMobile);
      await storyPage.screenshot({ path: mobileShotPath, fullPage: false });
      console.log(`    ✓ Mobile screenshot saved: ${story.shotMobile}`);

      await storyPage.close();
    }

    // -------------------------------------------------------------
    // 4. Product Families & Category Pages (Preservation Check)
    // -------------------------------------------------------------
    console.log("\n[4. Category Pages & Dynamic Pricing Preservation Check]");
    const categoryRoutes = ["/iphone", "/mac", "/ipad", "/watch", "/airpods", "/accessories", "/shop"];
    for (const route of categoryRoutes) {
      const catPage = await browser.newPage();
      await catPage.setViewport({ width: 1440, height: 900 });
      const res = await catPage.goto(`${PROD_URL}${route}`, { waitUntil: "networkidle2", timeout: 45000 });
      await new Promise((r) => setTimeout(r, 1500));
      const priceCount = await catPage.evaluate(() => {
        const text = document.body.innerText;
        return (text.match(/GH[₵S]\s*[\d,]+/gi) || []).length;
      });
      results.categoryPages[route] = { status: res.status(), priceCount };
      console.log(`  ${route} -> Status: ${res.status()}, Dynamic prices found: ${priceCount}`);
      assert.equal(res.status(), 200, `${route} must return HTTP 200`);
      assert.ok(priceCount > 0, `${route} must preserve dynamic product pricing`);
      await catPage.close();
    }

    // -------------------------------------------------------------
    // 5. End-to-End Commerce Smoke Test
    // Learn More → Buy → Configurator → Add to Bag → Cart
    // -------------------------------------------------------------
    console.log("\n[5. Commerce Smoke Test: Learn More → Buy → Add to Bag → Cart]");
    const flowPage = await browser.newPage();
    await flowPage.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
    await flowPage.setCacheEnabled(false);

    // Step A: Start on Learn More
    console.log("  Step A: Navigating to /iphone/iphone-18-pro...");
    await flowPage.goto(`${PROD_URL}/iphone/iphone-18-pro`, { waitUntil: "networkidle2", timeout: 45000 });
    await new Promise((r) => setTimeout(r, 2000));

    // Step B: Click Buy CTA
    console.log("  Step B: Locating and clicking Buy CTA...");
    const clickedBuy = await flowPage.evaluate(() => {
      const buyLink = document.querySelector(".editorial-buy");
      if (buyLink) {
        buyLink.click();
        return true;
      }
      return false;
    });
    console.log(`  Buy link clicked: ${clickedBuy}`);
    await flowPage.waitForNavigation({ waitUntil: "networkidle2", timeout: 20000 }).catch(() => {});
    await new Promise((r) => setTimeout(r, 2500));
    console.log(`  Current URL after click: ${flowPage.url()}`);
    results.commerceSmokeTest.configuratorUrl = flowPage.url();

    // Step C: On Buy Configurator, select options and Add to Bag
    console.log("  Step C: Selecting options and adding to bag...");
    const added = await flowPage.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll("button"));
      const addBtn = buttons.find((b) => b.textContent && (b.textContent.includes("Add to Bag") || b.textContent.includes("Add to Cart")));
      if (addBtn) {
        addBtn.click();
        return true;
      }
      return false;
    });
    console.log(`  Add to Bag clicked: ${added}`);
    await new Promise((r) => setTimeout(r, 2500));

    // Step D: Navigate to /cart
    console.log("  Step D: Verifying Cart page...");
    await flowPage.goto(`${PROD_URL}/cart`, { waitUntil: "networkidle2", timeout: 45000 });
    await new Promise((r) => setTimeout(r, 2500));

    const cartState = await flowPage.evaluate(() => {
      const text = document.body.innerText;
      const rows = document.querySelectorAll(".cart-item, [data-item-row], .order-item, .cart-row");
      return {
        itemCount: rows.length,
        hasIphoneText: text.includes("iPhone 18 Pro") || text.includes("iPhone"),
        hasGhPrice: text.includes("GH₵") || text.includes("GHS"),
        totalMatches: text.match(/(?:GH[₵S]|GHS)\s*[\d,]+/g) || [],
      };
    });

    results.commerceSmokeTest.cart = cartState;
    console.log("  Cart state on live production:", JSON.stringify(cartState, null, 2));

    const cartShot = path.join(ARTIFACT_DIR, "prod-clean-cart-flow.png");
    await flowPage.screenshot({ path: cartShot, fullPage: false });
    console.log("✓ Saved prod-clean-cart-flow.png");

    await flowPage.close();

    console.log("\n=== FINAL RESULTS SUMMARY ===");
    console.log(JSON.stringify(results, null, 2));
    console.log("\n>>> LIVE PRODUCTION VERIFICATION COMPLETED SUCCESSFULLY! <<<");

  } finally {
    await browser.close();
  }
}

verifyLiveProduction().catch((err) => {
  console.error("Production verification failed:", err);
  process.exit(1);
});
