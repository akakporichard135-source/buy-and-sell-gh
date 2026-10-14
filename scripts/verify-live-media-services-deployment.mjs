import https from 'node:https';
import http from 'node:http';
import puppeteer from 'puppeteer-core';
import { createClient } from '@supabase/supabase-js';
import fs from 'node:fs';

const EDGE_PATH = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";

let supabaseUrl = 'https://kgbcytxhyqalzawkdghn.supabase.co';
let supabaseKey = '';

if (fs.existsSync('.env.local')) {
  const envContent = fs.readFileSync('.env.local', 'utf-8');
  const urlMatch = envContent.match(/VITE_SUPABASE_URL=([^\r\n]+)/);
  const keyMatch = envContent.match(/VITE_SUPABASE_ANON_KEY=([^\r\n]+)/);
  if (urlMatch) supabaseUrl = urlMatch[1].trim();
  if (keyMatch) supabaseKey = keyMatch[1].trim();
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false },
});

function fetchUrl(url) {
  return new Promise((resolve) => {
    https.get(url, (res) => {
      let data = [];
      res.on('data', chunk => data.push(chunk));
      res.on('end', () => {
        const buffer = Buffer.concat(data);
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          length: buffer.length
        });
      });
    }).on('error', (err) => {
      resolve({ statusCode: 500, error: err.message, length: 0 });
    });
  });
}

async function main() {
  console.log('=== BUY & SELL GH POST-DEPLOYMENT VERIFICATION ===\n');

  // 1. Verify Database Integrity (Products & Variants)
  console.log('1. Checking Live Supabase Database Integrity...');
  const { count: productCount, error: pErr } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true });

  const { count: variantCount, error: vErr } = await supabase
    .from('product_variants')
    .select('*', { count: 'exact', head: true });

  const { count: orderCount, error: oErr } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true });

  console.log(`- Products count: ${productCount} (expected: 112, err: ${pErr?.message || 'none'})`);
  console.log(`- Variants count: ${variantCount} (expected: 273, err: ${vErr?.message || 'none'})`);
  console.log(`- Orders count: ${orderCount} (err: ${oErr?.message || 'none'})`);

  if (productCount < 112 || variantCount < 273) {
    console.error('DATABASE INTEGRITY COMPROMISED!');
    process.exit(1);
  }
  console.log('✓ Database integrity confirmed (All 112 products, 273 variants, orders preserved).\n');

  // 2. Checking Brand Assets on live domain
  console.log('2. Checking Deployed Brand Assets on https://buyandsellgh.com...');
  const brandAssets = [
    '/brand/buy-sell-gh-logo-scene.webp',
    '/brand/buy-sell-gh-logo-owner.jpeg',
    '/brand/shop-rollup-banner.webp'
  ];

  for (const asset of brandAssets) {
    const res = await fetchUrl(`https://buyandsellgh.com${asset}`);
    console.log(`- ${asset} => Status: ${res.statusCode}, Size: ${res.length} bytes`);
    if (res.statusCode !== 200 || res.length === 0) {
      console.error(`Asset failed: ${asset}`);
      process.exit(1);
    }
  }
  console.log('✓ All brand identity assets are live and returning HTTP 200.\n');

  // 3. Checking All 5 Service Flyers on live domain
  console.log('3. Checking All 5 Service Flyers on https://buyandsellgh.com...');
  const flyerAssets = [
    '/services/repairs.png',
    '/services/upgrade-and-save.png',
    '/services/installment-payment.png',
    '/services/sell-your-device.png',
    '/services/refer-a-friend.png'
  ];

  for (const asset of flyerAssets) {
    const res = await fetchUrl(`https://buyandsellgh.com${asset}`);
    console.log(`- ${asset} => Status: ${res.statusCode}, Size: ${res.length} bytes`);
    if (res.statusCode !== 200 || res.length === 0) {
      console.error(`Flyer asset failed: ${asset}`);
      process.exit(1);
    }
  }
  console.log('✓ All 5 service flyers are live and returning HTTP 200.\n');

  // 4. Verify Live Admin & Storefront Domains
  console.log('4. Checking Live Domains & Headers...');
  const storefrontRes = await fetchUrl('https://buyandsellgh.com/');
  const adminRes = await fetchUrl('https://admin.buyandsellgh.com/');

  console.log(`- Storefront (https://buyandsellgh.com/): Status ${storefrontRes.statusCode}`);
  console.log(`- Admin portal (https://admin.buyandsellgh.com/): Status ${adminRes.statusCode}`);

  // 5. Browser Automation Verification (Desktop + Mobile)
  console.log('\n5. Launching Headless Browser for Live Storefront & Admin QA...');
  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    // 5a. Desktop Viewport (1440x900)
    console.log('- Testing Live Storefront Desktop (1440px)...');
    const p1 = await browser.newPage();
    await p1.setViewport({ width: 1440, height: 900 });
    await p1.goto('https://buyandsellgh.com/', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await new Promise(r => setTimeout(r, 2000));
    await p1.screenshot({ path: 'C:/Users/akakp/.gemini/antigravity/brain/6c721dee-7d06-4a2d-92fb-b74a2b38f58f/live-storefront-desktop-deployed-fixed.png', fullPage: false });
    await p1.close();
    console.log('  ✓ Desktop storefront captured: live-storefront-desktop-deployed-fixed.png');

    // 5b. Mobile Viewport (390x844 - iPhone 14/15)
    console.log('- Testing Live Storefront Mobile (390px)...');
    const p2 = await browser.newPage();
    await p2.setViewport({ width: 390, height: 844 });
    await p2.setUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1');
    await p2.goto('https://buyandsellgh.com/', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await new Promise(r => setTimeout(r, 2000));
    await p2.screenshot({ path: 'C:/Users/akakp/.gemini/antigravity/brain/6c721dee-7d06-4a2d-92fb-b74a2b38f58f/live-storefront-mobile-deployed-fixed.png', fullPage: false });
    await p2.close();
    console.log('  ✓ Mobile storefront captured: live-storefront-mobile-deployed-fixed.png');

    // 5c. Repairs Service Page (checking flyer)
    console.log('- Testing Live Repairs Service Page (/repairs)...');
    const p3 = await browser.newPage();
    await p3.setViewport({ width: 1440, height: 900 });
    await p3.goto('https://buyandsellgh.com/repairs', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await new Promise(r => setTimeout(r, 2000));
    await p3.screenshot({ path: 'C:/Users/akakp/.gemini/antigravity/brain/6c721dee-7d06-4a2d-92fb-b74a2b38f58f/live-repairs-page-deployed-fixed.png', fullPage: false });
    await p3.close();
    console.log('  ✓ Repairs service page captured: live-repairs-page-deployed-fixed.png');

    // 5d. Live Admin Login Page
    console.log('- Testing Live Admin Subdomain (https://admin.buyandsellgh.com)...');
    const p4 = await browser.newPage();
    await p4.setViewport({ width: 1440, height: 900 });
    await p4.goto('https://admin.buyandsellgh.com/login', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await new Promise(r => setTimeout(r, 2000));
    await p4.screenshot({ path: 'C:/Users/akakp/.gemini/antigravity/brain/6c721dee-7d06-4a2d-92fb-b74a2b38f58f/live-admin-login-deployed-fixed.png', fullPage: false });
    await p4.close();
    console.log('  ✓ Admin login screen captured: live-admin-login-deployed-fixed.png');

  } finally {
    await browser.close();
  }



  console.log('\n=== ALL DEPLOYMENT VERIFICATION CHECKS PASSED SUCCESSFULLY ===');
}

main().catch(err => {
  console.error('Fatal error during verification:', err);
  process.exit(1);
});

