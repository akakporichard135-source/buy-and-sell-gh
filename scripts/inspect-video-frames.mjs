import puppeteer from "puppeteer-core";
import path from "node:path";
import fs from "node:fs";

const EDGE_PATH = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const ARTIFACT_DIR = "C:\\Users\\akakp\\.gemini\\antigravity\\brain\\6c721dee-7d06-4a2d-92fb-b74a2b38f58f";

async function run() {
  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: true,
    pipe: true,
    args: ["--no-sandbox", "--disable-gpu"],
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });

    const html = `
      <!DOCTYPE html>
      <html>
      <body style="margin:0;background:#000;display:flex;align-items:center;justify-content:center;height:100vh;">
        <video id="vid" src="http://127.0.0.1:4173/videos/homepage/iphone-18-pro.mp4" muted preload="auto" style="max-width:100%;max-height:100%;"></video>
      </body>
      </html>
    `;
    await page.setContent(html);

    await page.evaluate(() => {
      return new Promise((resolve) => {
        const v = document.getElementById("vid");
        v.onloadedmetadata = () => resolve(v.duration);
      });
    });

    const duration = await page.evaluate(() => document.getElementById("vid").duration);
    console.log(`Video duration: ${duration} seconds`);

    const times = [0.2, 1.0, 2.5, 4.0, 5.5, Math.max(0.5, duration - 0.2)];
    for (let i = 0; i < times.length; i++) {
      const t = times[i];
      await page.evaluate((time) => {
        return new Promise((resolve) => {
          const v = document.getElementById("vid");
          v.currentTime = time;
          v.onseeked = () => resolve();
        });
      }, t);
      await new Promise((r) => setTimeout(r, 200));

      const filename = `video-frame-${i}-${t.toFixed(1)}s.png`;
      await page.screenshot({ path: path.join(ARTIFACT_DIR, filename) });
      console.log(`Saved frame ${i} at ${t}s -> ${filename}`);
    }
  } finally {
    await browser.close();
  }
}

run().catch((e) => console.error(e));
