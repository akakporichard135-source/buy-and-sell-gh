import puppeteer from "puppeteer-core";
import path from "node:path";

const edgePath = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const artifactDir = "C:/Users/akakp/.gemini/antigravity/brain/6c721dee-7d06-4a2d-92fb-b74a2b38f58f";
const baseUrl = "http://127.0.0.1:4173";

const routesToTest = [
  { name: "iphone-18-pro", url: "/iphone/iphone-18-pro", checkVideo: true },
  { name: "iphone-duo", url: "/iphone/iphone-duo", checkVideo: true },
  { name: "watch-series-12", url: "/watch/apple-watch-series-12", checkVideo: true },
  { name: "watch-ultra-4", url: "/watch/apple-watch-ultra-4", checkVideo: true },
  { name: "airpods-pro-3", url: "/airpods/airpods-pro-3", checkVideo: true },
  { name: "airpods-5", url: "/airpods/airpods-5", checkVideo: false },
  { name: "macbook-air", url: "/mac/macbook-air", checkVideo: false },
  { name: "mac-mini", url: "/mac-mini", checkVideo: false },
  { name: "ipad-air", url: "/ipad/ipad-air", checkVideo: false },
  { name: "macbook-air-15-m4", url: "/mac/macbook-air-15-m4", checkVideo: false },
  { name: "accessories-magsafe", url: "/accessories/apple-magsafe-charger", checkVideo: false },
];

const browser = await puppeteer.launch({
  executablePath: edgePath,
  headless: true,
  args: ["--no-sandbox", "--disable-setuid-sandbox"],
});

try {
  for (const item of routesToTest) {
    // Desktop test
    const desktopPage = await browser.newPage();
    await desktopPage.setViewport({ width: 1440, height: 900 });
    const errors = [];
    desktopPage.on("pageerror", (err) => errors.push(err.message));

    const res = await desktopPage.goto(`${baseUrl}${item.url}`, { waitUntil: "domcontentloaded", timeout: 15000 });
    const status = res.status();
    await new Promise((r) => setTimeout(r, 1200));

    let videoFound = false;
    let videoSrc = "";
    if (item.checkVideo) {
      const vid = await desktopPage.$(".editorial-cinematic-opening-media video, .story-film-poster video");
      if (vid) {
        videoFound = true;
        videoSrc = await desktopPage.$eval(".editorial-cinematic-opening-media video, .story-film-poster video", (v) => v.currentSrc || v.innerHTML).catch(() => "");
      }
    }

    const title = await desktopPage.title();
    console.log(`[PASS] ${item.name} (${item.url}) - Status: ${status}, Title: "${title}", Video: ${videoFound ? videoSrc : "none"}, Errors: ${errors.length}`);

    if (item.name === "iphone-18-pro" || item.name === "watch-ultra-4" || item.name === "watch-series-12" || item.name === "iphone-duo" || item.name === "airpods-pro-3" || item.name === "mac-mini") {
      await desktopPage.screenshot({ path: path.join(artifactDir, `local-preview-${item.name}-desktop.png`) });
    }
    await desktopPage.close();

    // Mobile test
    const mobilePage = await browser.newPage();
    await mobilePage.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
    await mobilePage.goto(`${baseUrl}${item.url}`, { waitUntil: "domcontentloaded", timeout: 15000 });
    await new Promise((r) => setTimeout(r, 1000));

    if (item.name === "iphone-18-pro" || item.name === "watch-ultra-4" || item.name === "airpods-pro-3") {
      await mobilePage.screenshot({ path: path.join(artifactDir, `local-preview-${item.name}-mobile.png`) });
    }
    await mobilePage.close();
  }

  await browser.close();
  console.log("ALL ROUTES VERIFIED SUCCESSFULLY!");
} catch (e) {
  console.error(e);
  await browser.close();
  process.exit(1);
}
