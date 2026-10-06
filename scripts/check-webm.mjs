import puppeteer from 'puppeteer-core';
const browser = await puppeteer.launch({
  executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  headless: true,
  pipe: true,
  args: ['--no-sandbox']
});
const page = await browser.newPage();
await page.setContent('<video id="v" src="http://127.0.0.1:4173/videos/homepage/iphone-18-pro-mobile.webm" muted playsinline autoplay></video>');
await new Promise(r => setTimeout(r, 2000));
const res = await page.evaluate(() => {
  const v = document.getElementById('v');
  return { duration: v.duration, videoWidth: v.videoWidth, videoHeight: v.videoHeight, readyState: v.readyState, paused: v.paused, currentTime: v.currentTime };
});
console.log(JSON.stringify(res, null, 2));
await page.screenshot({ path: 'C:\\Users\\akakp\\.gemini\\antigravity\\brain\\6c721dee-7d06-4a2d-92fb-b74a2b38f58f\\test-webm-info.png' });
await browser.close();
