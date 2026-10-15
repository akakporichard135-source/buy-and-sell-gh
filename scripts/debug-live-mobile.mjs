import puppeteer from 'puppeteer-core';

const EDGE_PATH = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";

async function main() {
  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: true,
    args: ['--no-sandbox']
  });

  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1');
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });

  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.message));
  page.on('requestfailed', req => console.log('REQUEST FAILED:', req.url(), req.failure().errorText));
  page.on('response', res => {
    if (res.url().includes('iphone-18') || res.url().includes('1792004900948')) {
      console.log('IMAGE RESPONSE:', res.url(), res.status());
    }
  });

  await page.goto('https://buyandsellgh.com', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await new Promise(r => setTimeout(r, 6000));

  const evaluation = await page.evaluate(() => {
    const img = document.querySelector('.home-ref-hero img');
    const source = document.querySelector('.home-ref-hero picture source');
    return {
      imgSrc: img ? img.src : null,
      currentSrc: img ? img.currentSrc : null,
      complete: img ? img.complete : null,
      naturalWidth: img ? img.naturalWidth : null,
      naturalHeight: img ? img.naturalHeight : null,
      sourceSrcset: source ? source.srcset : null,
      sourceMedia: source ? source.media : null,
      matchMedia: window.matchMedia('(max-width: 768px)').matches
    };
  });

  console.log('EVALUATION:', evaluation);

  await browser.close();
}

main();
