import puppeteer from "puppeteer-core";
import fs from "node:fs";
import path from "node:path";

const EDGE_PATH = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const ARTIFACTS_DIR = "C:\\Users\\akakp\\.gemini\\antigravity\\brain\\6c721dee-7d06-4a2d-92fb-b74a2b38f58f";

async function main() {
  console.log("=== DIAGNOSING LIVE AIRPODS PRO 3 SECTION ON HTTPS://BUYANDSELLGH.COM ===");
  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const page = await browser.newPage();
    // Use an actual mobile viewport and user agent
    await page.setUserAgent("Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1");
    await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });

    // Enable console logging from page
    page.on("console", (msg) => console.log("PAGE LOG:", msg.text()));

    console.log("Navigating to https://buyandsellgh.com...");
    await page.goto("https://buyandsellgh.com", { waitUntil: "networkidle2", timeout: 45000 });

    // Find ALL elements containing "AirPods"
    const analysis = await page.evaluate(() => {
      // 1. Search for all elements whose textContent includes "AirPods"
      const allElements = Array.from(document.querySelectorAll("*"));
      const airpodsNodes = allElements.filter((el) => {
        // direct text or heading
        return (
          (el.tagName === "H2" || el.tagName === "H3" || el.classList.contains("home-ref-tile") || el.classList.contains("home-hero-slide") || el.id?.includes("airpod") || el.className?.toString().includes("airpod")) &&
          el.textContent.includes("AirPods")
        );
      });

      const matchedSections = [];
      // Let's also check all sections/tiles on the homepage
      const tiles = Array.from(document.querySelectorAll(".home-ref-tile, .home-ref-hero, section, article"));

      tiles.forEach((t, idx) => {
        if (t.textContent.includes("AirPods")) {
          const img = t.querySelector("img");
          const h2 = t.querySelector("h2, h3");
          const p = t.querySelector("p");
          const links = Array.from(t.querySelectorAll("a, button")).map((b) => b.textContent.trim());

          const tRect = t.getBoundingClientRect();
          const imgRect = img ? img.getBoundingClientRect() : null;
          const h2Rect = h2 ? h2.getBoundingClientRect() : null;

          matchedSections.push({
            index: idx,
            tagName: t.tagName,
            className: t.className,
            id: t.id,
            headingText: h2 ? h2.textContent.trim() : null,
            pText: p ? p.textContent.trim() : null,
            links,
            imgSrc: img ? img.src : null,
            tileRect: { top: tRect.top, bottom: tRect.bottom, height: tRect.height },
            imgRect: imgRect ? { top: imgRect.top, bottom: imgRect.bottom, height: imgRect.height } : null,
            h2Rect: h2Rect ? { top: h2Rect.top, bottom: h2Rect.bottom } : null,
            imgAboveH2: imgRect && h2Rect ? imgRect.top < h2Rect.top : null,
            computedStyles: {
              display: window.getComputedStyle(t).display,
              flexDirection: window.getComputedStyle(t).flexDirection,
            },
          });
        }
      });

      // Also check service workers
      const hasSW = "serviceWorker" in navigator;

      return {
        matchedSections,
        hasSW,
      };
    });

    console.log("Matched sections:", JSON.stringify(analysis.matchedSections, null, 2));

    // Capture screenshots of each matched section or the whole page
    for (let i = 0; i < analysis.matchedSections.length; i++) {
      const sec = analysis.matchedSections[i];
      console.log(`\nSection #${i}: class="${sec.className}", heading="${sec.headingText}", imgAboveH2=${sec.imgAboveH2}`);
    }

    // Take full page screenshot
    const fullPagePath = path.join(ARTIFACTS_DIR, "live-diagnostic-fullpage-390.png");
    await page.screenshot({ path: fullPagePath, fullPage: true });
    console.log("Full page screenshot saved to:", fullPagePath);

  } finally {
    await browser.close();
  }
}

main().catch(console.error);
