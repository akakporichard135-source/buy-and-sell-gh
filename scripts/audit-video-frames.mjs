import puppeteer from "puppeteer-core";
import path from "node:path";
import fs from "node:fs";

const EDGE_PATH = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const ARTIFACT_DIR = "C:\\Users\\akakp\\.gemini\\antigravity\\brain\\6c721dee-7d06-4a2d-92fb-b74a2b38f58f";

const videos = [
  { name: "iphone-18-pro.mp4", src: "http://127.0.0.1:4173/videos/homepage/iphone-18-pro.mp4" },
  { name: "iphone-18-pro-mobile.webm", src: "http://127.0.0.1:4173/videos/homepage/iphone-18-pro-mobile.webm" },
  { name: "iphone-duo.mp4", src: "http://127.0.0.1:4173/videos/homepage/iphone-duo.mp4" },
  { name: "watch-series-12.mp4", src: "http://127.0.0.1:4173/videos/homepage/watch-series-12.mp4" },
  { name: "watch-ultra-4.mp4", src: "http://127.0.0.1:4173/videos/homepage/watch-ultra-4.mp4" },
];

async function run() {
  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: true,
    pipe: true,
    args: ["--no-sandbox", "--disable-gpu"],
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 720 });

    for (const vid of videos) {
      console.log(`Auditing ${vid.name}...`);
      const html = `
        <!DOCTYPE html>
        <html>
        <body style="margin:0;background:#000;display:flex;align-items:center;justify-content:center;height:100vh;">
          <video id="vid" src="${vid.src}" muted preload="auto" playsinline style="max-width:100%;max-height:100%;"></video>
        </body>
        </html>
      `;
      await page.setContent(html);

      const duration = await page.evaluate(() => {
        return new Promise((resolve) => {
          const v = document.getElementById("vid");
          if (v.readyState >= 1) return resolve(v.duration);
          v.onloadedmetadata = () => resolve(v.duration);
          setTimeout(() => resolve(v.duration || 0), 5000);
        });
      });

      console.log(`  Duration: ${duration}s`);
      const times = [0.1, duration * 0.25, duration * 0.5, duration * 0.75].filter(t => t > 0);
      
      for (let i = 0; i < times.length; i++) {
        const t = times[i];
        await page.evaluate((time) => {
          return new Promise((resolve) => {
            const v = document.getElementById("vid");
            v.currentTime = time;
            v.onseeked = () => resolve();
            setTimeout(resolve, 500);
          });
        }, t);
        await new Promise((r) => setTimeout(r, 200));

        const baseName = vid.name.replace(/\.[^.]+$/, "");
        const shotName = `audit-${baseName}-f${i}.png`;
        await page.screenshot({ path: path.join(ARTIFACT_DIR, shotName) });
        console.log(`  Frame at ${t.toFixed(1)}s saved as ${shotName}`);
      }
    }
  } finally {
    await browser.close();
  }
}

run().catch(console.error);
