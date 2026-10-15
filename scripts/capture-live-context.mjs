import puppeteer from 'puppeteer-core';

const EDGE_PATH = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";

async function main() {
  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const page = await browser.newPage();
    await page.setUserAgent("Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1");
    await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
    await page.goto("https://buyandsellgh.com?_t=" + Date.now(), { waitUntil: "networkidle2" });

    await page.evaluate(() => {
      const tile = document.querySelector(".home-ref-tile.home-ref-airpods-pro-3");
      if (tile) tile.scrollIntoView({ block: "center" });
    });

    await new Promise((r) => setTimeout(r, 1200));

    const outPath = "C:/Users/akakp/.gemini/antigravity/brain/6c721dee-7d06-4a2d-92fb-b74a2b38f58f/live-prod-airpods-pro-3-viewport-context.png";
    await page.screenshot({ path: outPath });
    console.log("Context screenshot saved to:", outPath);
  } finally {
    await browser.close();
  }
}

main().catch(console.error);
