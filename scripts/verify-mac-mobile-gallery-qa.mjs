import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import puppeteer from "puppeteer-core";
import assert from "node:assert/strict";
import { preview } from "vite";

const EDGE_PATH = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const ARTIFACT_DIR = "C:\\Users\\akakp\\.gemini\\antigravity\\brain\\6c721dee-7d06-4a2d-92fb-b74a2b38f58f";
const PORT = 4280;

const previewServer = await preview({
  preview: {
    port: PORT,
    host: "127.0.0.1",
  },
});
console.log(`Vite preview server running on http://127.0.0.1:${PORT}`);

const browser = await puppeteer.launch({
  executablePath: EDGE_PATH,
  headless: true,
  args: [
    "--no-sandbox",
    "--disable-setuid-sandbox",
    "--no-first-run",
    "--no-default-browser-check",
    "--disable-dev-shm-usage",
    "--disable-gpu",
  ],
});

try {
  const page = await browser.newPage();

  // =========================================================================
  // TEST 1: MACBOOK AIR BUY PAGE IMAGE
  // =========================================================================
  console.log("\n--- TEST 1: MACBOOK AIR BUY PAGE IMAGE ---");
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
  await page.goto(`http://127.0.0.1:${PORT}/shop/buy-mac/macbook-air`, { waitUntil: "domcontentloaded" });
  await page.waitForSelector(".apple-buy-stage-img", { timeout: 10000 });
  await new Promise((r) => setTimeout(r, 1200));

  const macbookImgInfo = await page.evaluate(() => {
    const img = document.querySelector(".apple-buy-stage-img");
    const stage = document.querySelector(".apple-buy-stage");
    const computedImg = img ? window.getComputedStyle(img) : null;
    const computedStage = stage ? window.getComputedStyle(stage) : null;
    return {
      src: img?.getAttribute("src") || "",
      naturalWidth: img?.naturalWidth || 0,
      naturalHeight: img?.naturalHeight || 0,
      complete: img?.complete || false,
      objectFit: computedImg?.objectFit,
      stageBg: computedStage?.backgroundColor,
      stageWidth: stage?.clientWidth,
      stageHeight: stage?.clientHeight,
    };
  });

  console.log("MacBook Air Buy Page Image Info:", JSON.stringify(macbookImgInfo, null, 2));
  assert.ok(
    macbookImgInfo.src.includes("macbook-air-buy-showcase.jpg"),
    "MacBook Air image must use uploaded showcase image asset"
  );
  assert.ok(macbookImgInfo.naturalWidth > 0, "MacBook Air image must load successfully with positive naturalWidth");
  assert.equal(macbookImgInfo.objectFit, "contain", "Image must use object-fit: contain");
  assert.equal(macbookImgInfo.stageBg, "rgb(255, 255, 255)", "Stage background must be pure white");
  console.log("✓ MacBook Air Buy Page image verified: genuine asset, pure white background, object-fit: contain!");

  await page.screenshot({
    path: path.join(ARTIFACT_DIR, "qa-macbook-air-buy-desktop.png"),
    clip: { x: 0, y: 0, width: 1440, height: 860 },
  });
  console.log("Captured qa-macbook-air-buy-desktop.png");

  // Mobile MacBook Air Buy Page
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });
  await new Promise((r) => setTimeout(r, 500));
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, "qa-macbook-air-buy-mobile.png"),
  });
  console.log("Captured qa-macbook-air-buy-mobile.png");

  // =========================================================================
  // TEST 2: MOBILE HAMBURGER MENU CURTAIN ANIMATION & LAYOUT
  // =========================================================================
  console.log("\n--- TEST 2: MOBILE HAMBURGER MENU CURTAIN ANIMATION ---");
  const mobileViewports = [
    { name: "iPhone 375px", width: 375, height: 667 },
    { name: "iPhone 390px", width: 390, height: 844 },
    { name: "iPhone 430px", width: 430, height: 932 },
  ];

  for (const vp of mobileViewports) {
    console.log(`\nTesting mobile curtain on ${vp.name} (${vp.width}x${vp.height})...`);
    await page.setViewport({ width: vp.width, height: vp.height, deviceScaleFactor: 2 });
    await page.goto(`http://127.0.0.1:${PORT}/store`, { waitUntil: "domcontentloaded" });
    await page.waitForSelector(".global-header-menu-btn", { timeout: 10000 });
    await new Promise((r) => setTimeout(r, 600));

    // A. Open Curtain Menu
    await page.click(".global-header-menu-btn");
    await page.waitForSelector(".global-mobile-curtain.is-open", { timeout: 5000 });
    await new Promise((r) => setTimeout(r, 450)); // allow drop animation to finish

    const curtainState = await page.evaluate(() => {
      const curtain = document.querySelector(".global-mobile-curtain");
      const inner = document.querySelector(".global-curtain-inner");
      const links = Array.from(document.querySelectorAll(".global-curtain-link")).map((a) => a.textContent?.trim());
      const bodyOverflow = document.body.style.overflow;
      return {
        isOpen: curtain?.classList.contains("is-open"),
        bodyOverflow,
        clientHeight: curtain?.clientHeight,
        scrollHeight: curtain?.scrollHeight,
        innerHeight: inner?.clientHeight,
        linksCount: links.length,
        links,
        hasNoInternalScroll: (curtain?.scrollHeight || 0) <= (curtain?.clientHeight || 0) + 4,
      };
    });

    console.log(`${vp.name} Curtain State:`, JSON.stringify(curtainState, null, 2));
    assert.equal(curtainState.isOpen, true, "Curtain menu must have is-open class");
    assert.equal(curtainState.bodyOverflow, "hidden", "Background body scroll must be locked");
    assert.ok(curtainState.linksCount >= 8, "All 8 primary category links must be present");
    assert.equal(curtainState.hasNoInternalScroll, true, "Menu must NOT require internal scrolling on standard mobile viewport");

    if (vp.width === 390) {
      await page.screenshot({
        path: path.join(ARTIFACT_DIR, "qa-mobile-curtain-open.png"),
      });
      console.log("Captured qa-mobile-curtain-open.png");
    }

    // B. Close Curtain Menu via hamburger button
    await page.click(".global-header-menu-btn");
    // Should transition to is-closing then unmount
    await new Promise((r) => setTimeout(r, 200));
    const isClosing = await page.evaluate(() => {
      const curtain = document.querySelector(".global-mobile-curtain");
      return curtain?.classList.contains("is-closing") || !curtain;
    });
    console.log(`${vp.name} Closing state check:`, isClosing ? "✓ Retracting smoothly" : "FAILED");
    assert.ok(isClosing, "Curtain must retract smoothly with is-closing animation");

    await new Promise((r) => setTimeout(r, 300));
    const afterCloseState = await page.evaluate(() => {
      const curtain = document.querySelector(".global-mobile-curtain");
      return {
        isUnmounted: !curtain,
        bodyOverflow: document.body.style.overflow,
      };
    });
    console.log(`${vp.name} Closed state:`, afterCloseState);
    assert.equal(afterCloseState.isUnmounted, true, "Curtain unmounted after smooth retraction");
    assert.equal(afterCloseState.bodyOverflow, "", "Body scroll restored after curtain close");

    // C. Test link click closes curtain and navigates
    await page.click(".global-header-menu-btn");
    await page.waitForSelector(".global-mobile-curtain.is-open", { timeout: 5000 });
    await new Promise((r) => setTimeout(r, 450));

    // Click "Mac"
    await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll(".global-curtain-link"));
      const macLink = links.find((a) => a.textContent?.trim() === "Mac");
      if (macLink) macLink.click();
    });
    await new Promise((r) => setTimeout(r, 600));

    const currentUrl = page.url();
    const isClosedAfterNav = await page.evaluate(() => !document.querySelector(".global-mobile-curtain"));
    console.log(`After clicking Mac link: url=${currentUrl}, menuClosed=${isClosedAfterNav}`);
    assert.ok(currentUrl.includes("/mac"), "Must navigate to /mac");
    assert.equal(isClosedAfterNav, true, "Menu must close upon navigation link selection");
    console.log(`✓ ${vp.name} curtain menu interactions verified 100%!`);
  }

  // =========================================================================
  // TEST 3: IPHONE 18 PRO BUY PAGE GALLERY (IMAGES 1, 2, 3)
  // =========================================================================
  console.log("\n--- TEST 3: IPHONE 18 PRO BUY PAGE GALLERY REPLACEMENT ---");
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
  await page.goto(`http://127.0.0.1:${PORT}/shop/buy-iphone/iphone-18-pro`, { waitUntil: "domcontentloaded" });
  await page.waitForSelector(".apple-buy-thumbnails", { timeout: 10000 });
  await new Promise((r) => setTimeout(r, 1200));

  const galleryInfo = await page.evaluate(() => {
    const thumbs = Array.from(document.querySelectorAll(".apple-buy-thumb img")).map((img) => img.getAttribute("src"));
    const activeImg = document.querySelector(".apple-buy-stage-img")?.getAttribute("src");
    return { thumbs, activeImg };
  });

  console.log("iPhone 18 Pro Gallery Thumbnails:", galleryInfo);
  assert.equal(galleryInfo.thumbs.length, 3, "Gallery must contain exactly 3 thumbnails");
  assert.ok(galleryInfo.thumbs[0].includes("iphone-18-pro"), "Thumbnail 1 must be current finish image");
  assert.ok(
    galleryInfo.thumbs[1].includes("iphone-18-pro-gallery-2-silver.jpg"),
    "Thumbnail 2 must be uploaded Silver/White iPhone image"
  );
  assert.ok(
    galleryInfo.thumbs[2].includes("iphone-18-pro-gallery-3-blue.jpg"),
    "Thumbnail 3 must be uploaded Light Blue iPhone image"
  );

  // Capture Image 1
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, "qa-iphone-18-pro-gallery-1.png"),
    clip: { x: 0, y: 0, width: 1440, height: 860 },
  });
  console.log("Captured qa-iphone-18-pro-gallery-1.png");

  // Click Thumbnail 2
  console.log("Switching to Gallery Image 2...");
  await page.evaluate(() => {
    const thumbBtns = document.querySelectorAll(".apple-buy-thumb");
    if (thumbBtns[1]) thumbBtns[1].click();
  });
  await new Promise((r) => setTimeout(r, 600));

  const activeImg2 = await page.evaluate(() => {
    const img = document.querySelector(".apple-buy-stage-img");
    return {
      src: img?.getAttribute("src") || "",
      naturalWidth: img?.naturalWidth || 0,
      complete: img?.complete || false,
    };
  });
  console.log("Active Image 2 Info:", activeImg2);
  assert.ok(activeImg2.src.includes("iphone-18-pro-gallery-2-silver.jpg"), "Active image must be Gallery Image 2");
  assert.ok(activeImg2.naturalWidth > 0, "Gallery Image 2 must load with positive naturalWidth");

  await page.screenshot({
    path: path.join(ARTIFACT_DIR, "qa-iphone-18-pro-gallery-2.png"),
    clip: { x: 0, y: 0, width: 1440, height: 860 },
  });
  console.log("Captured qa-iphone-18-pro-gallery-2.png");

  // Click Thumbnail 3
  console.log("Switching to Gallery Image 3...");
  await page.evaluate(() => {
    const thumbBtns = document.querySelectorAll(".apple-buy-thumb");
    if (thumbBtns[2]) thumbBtns[2].click();
  });
  await new Promise((r) => setTimeout(r, 600));

  const activeImg3 = await page.evaluate(() => {
    const img = document.querySelector(".apple-buy-stage-img");
    return {
      src: img?.getAttribute("src") || "",
      naturalWidth: img?.naturalWidth || 0,
      complete: img?.complete || false,
    };
  });
  console.log("Active Image 3 Info:", activeImg3);
  assert.ok(activeImg3.src.includes("iphone-18-pro-gallery-3-blue.jpg"), "Active image must be Gallery Image 3");
  assert.ok(activeImg3.naturalWidth > 0, "Gallery Image 3 must load with positive naturalWidth");

  await page.screenshot({
    path: path.join(ARTIFACT_DIR, "qa-iphone-18-pro-gallery-3.png"),
    clip: { x: 0, y: 0, width: 1440, height: 860 },
  });
  console.log("Captured qa-iphone-18-pro-gallery-3.png");
  console.log("✓ iPhone 18 Pro Gallery switching verified 100%!");

  // =========================================================================
  // TEST 4: DESKTOP HEADER PRESERVATION
  // =========================================================================
  console.log("\n--- TEST 4: DESKTOP HEADER PRESERVATION ---");
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
  await page.goto(`http://127.0.0.1:${PORT}/`, { waitUntil: "domcontentloaded" });
  await new Promise((r) => setTimeout(r, 600));

  const desktopNavVisible = await page.evaluate(() => {
    const nav = document.querySelector(".global-header-nav");
    const menuBtn = document.querySelector(".global-header-menu-btn");
    return {
      navDisplay: nav ? window.getComputedStyle(nav).display : "none",
      menuBtnDisplay: menuBtn ? window.getComputedStyle(menuBtn).display : "none",
    };
  });
  console.log("Desktop Navigation Display:", desktopNavVisible);
  assert.notEqual(desktopNavVisible.navDisplay, "none", "Desktop nav must be visible on 1440px desktop");
  assert.equal(desktopNavVisible.menuBtnDisplay, "none", "Hamburger button must be hidden on 1440px desktop");
  console.log("✓ Desktop navigation preserved 100%!");

  console.log("\n============================================================");
  console.log("  ALL QA TASKS (1, 2, 3, 4) PASSED PERFECTLY!               ");
  console.log("============================================================\n");
} catch (err) {
  console.error("QA Verification Error:", err);
  process.exit(1);
} finally {
  await browser.close();
  previewServer.httpServer.close();
}
