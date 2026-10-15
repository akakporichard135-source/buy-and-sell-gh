import puppeteer from 'puppeteer-core';
import fs from 'node:fs';
import path from 'node:path';

const EDGE_PATH = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const ARTIFACT_DIR = "C:\\Users\\akakp\\.gemini\\antigravity\\brain\\6c721dee-7d06-4a2d-92fb-b74a2b38f58f";

async function main() {
  console.log('--- STARTING LIVE PRODUCTION VERIFICATION ---');
  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });

  try {
    // 1. Mobile verification (iPhone 390x844)
    console.log('Testing https://buyandsellgh.com on 390x844 mobile viewport...');
    const mobilePage = await browser.newPage();
    await mobilePage.setUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1');
    await mobilePage.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });

    const res = await mobilePage.goto('https://buyandsellgh.com', { waitUntil: 'domcontentloaded', timeout: 35000 });
    console.log(`Mobile homepage HTTP status: ${res.status()}`);

    // Wait for hero element to mount
    await mobilePage.waitForSelector('.home-ref-hero', { timeout: 20000 });
    // Allow hero image to finish layout & decode
    await new Promise(r => setTimeout(r, 4000));
    
    // Evaluate hero properties
    const heroInfo = await mobilePage.evaluate(() => {
      const hero = document.querySelector('.home-ref-hero');
      const img = hero ? hero.querySelector('img') : null;
      const source = hero ? hero.querySelector('picture source') : null;
      const docWidth = document.documentElement.clientWidth;
      const scrollWidth = document.documentElement.scrollWidth;

      let imgBox = null;
      if (img) {
        const rect = img.getBoundingClientRect();
        imgBox = {
          width: Math.round(rect.width),
          height: Math.round(rect.height),
          top: Math.round(rect.top),
          bottom: Math.round(rect.bottom),
          currentSrc: img.currentSrc,
          naturalWidth: img.naturalWidth,
          naturalHeight: img.naturalHeight,
          complete: img.complete
        };
      }

      return {
        hasMobileHeroClass: hero ? hero.classList.contains('has-mobile-hero') : false,
        sourceSrcset: source ? source.getAttribute('srcset') : null,
        imgBox,
        hasHorizontalOverflow: scrollWidth > docWidth,
        scrollWidth,
        docWidth
      };
    });

    console.log('Mobile Hero Info:', JSON.stringify(heroInfo, null, 2));

    const mobileScreenshotPath = path.join(ARTIFACT_DIR, 'live-prod-mobile-hero-390.png');
    await mobilePage.screenshot({ path: mobileScreenshotPath, fullPage: false });
    console.log(`Saved screenshot: ${mobileScreenshotPath}`);
    await mobilePage.close();

    // 2. Desktop verification (1440x900)
    console.log('\nTesting https://buyandsellgh.com on 1440x900 desktop viewport...');
    const desktopPage = await browser.newPage();
    await desktopPage.setViewport({ width: 1440, height: 900 });
    const dRes = await desktopPage.goto('https://buyandsellgh.com', { waitUntil: 'domcontentloaded', timeout: 35000 });
    console.log(`Desktop homepage HTTP status: ${dRes.status()}`);

    await desktopPage.waitForSelector('.home-ref-hero', { timeout: 20000 });
    await new Promise(r => setTimeout(r, 4000));

    const desktopHeroInfo = await desktopPage.evaluate(() => {
      const hero = document.querySelector('.home-ref-hero');
      const img = hero ? hero.querySelector('img') : null;
      return {
        hasMobileHeroClass: hero ? hero.classList.contains('has-mobile-hero') : false,
        imgSrc: img ? img.currentSrc : null,
        imgWidth: img ? img.clientWidth : 0,
        imgHeight: img ? img.clientHeight : 0
      };
    });
    console.log('Desktop Hero Info:', JSON.stringify(desktopHeroInfo, null, 2));

    const desktopScreenshotPath = path.join(ARTIFACT_DIR, 'live-prod-desktop-hero-1440.png');
    await desktopPage.screenshot({ path: desktopScreenshotPath, fullPage: false });
    console.log(`Saved screenshot: ${desktopScreenshotPath}`);
    await desktopPage.close();

    console.log('--- LIVE PRODUCTION VERIFICATION COMPLETED SUCCESSFULLY ---');
  } catch (err) {
    console.error('Live verification error:', err);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

main();
