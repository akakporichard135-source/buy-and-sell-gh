import puppeteer from 'puppeteer-core';
import path from 'node:path';
import fs from 'node:fs';

const EDGE_PATH = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const ARTIFACT_DIR = "C:\\Users\\akakp\\.gemini\\antigravity\\brain\\6c721dee-7d06-4a2d-92fb-b74a2b38f58f";

const vids = [
  { name: "iphone-18-pro", url: "http://127.0.0.1:4173/videos/homepage/iphone-18-pro.mp4" },
  { name: "watch-series-12", url: "http://127.0.0.1:4173/videos/homepage/watch-series-12.mp4" }
];

async function run() {
  const browser = await puppeteer.launch({ executablePath: EDGE_PATH, headless: true, pipe: true, args: ["--no-sandbox"] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 720 });

  for (const item of vids) {
    console.log(`Checking timestamps for ${item.name}...`);
    await page.setContent(`<video id="v" src="${item.url}" muted playsinline></video>`);
    await new Promise(r => setTimeout(r, 1000));
    const duration = await page.evaluate(() => {
      const v = document.getElementById("v");
      return v.duration || 0;
    });
    console.log(`  Duration: ${duration}s`);

    // Sample at 0.5s increments up to 5s
    for (let t = 0.5; t < Math.min(duration, 6); t += 1.0) {
      await page.evaluate((seekTime) => {
        const v = document.getElementById("v");
        v.currentTime = seekTime;
      }, t);
      await new Promise(r => setTimeout(r, 400));
      const filename = `ts-${item.name}-${t.toFixed(1)}s.png`;
      await page.screenshot({ path: path.join(ARTIFACT_DIR, filename) });
      console.log(`  Captured ${filename}`);
    }
  }
  await browser.close();
}

run().catch(console.error);
