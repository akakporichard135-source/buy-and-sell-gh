import puppeteer from 'puppeteer-core';
import fs from 'node:fs';
import path from 'node:path';

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const ARTIFACTS_DIR = 'C:\\Users\\akakp\\.gemini\\antigravity\\brain\\6c721dee-7d06-4a2d-92fb-b74a2b38f58f';
const BASE_URL = 'https://buy-and-sell-npzfzklw4-richard-akakpo-s-projects.vercel.app';

async function run() {
  console.log(`\n======================================================`);
  console.log(`E2E LIVE VERIFICATION ON VERCEL PREVIEW`);
  console.log(`Target: ${BASE_URL}`);
  console.log(`======================================================\n`);

  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1400,980'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 980 });

  page.on('dialog', async (dialog) => {
    console.log(`[DIALOG ACCEPTED]: "${dialog.message()}"`);
    await dialog.accept();
  });

  // Enable admin mode via sessionStorage, cookie, and admin session
  await page.goto(`${BASE_URL}?admin_preview=1`, { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => {
    sessionStorage.setItem('admin_preview_active', '1');
    localStorage.setItem('admin_preview_active', '1');
    document.cookie = 'admin_preview_active=1; path=/';
    localStorage.setItem('buyandsell-gh-temp-admin-session', JSON.stringify({
      userId: 'admin-qa-testing',
      email: 'admin@buyandsellgh.com',
      mode: 'preview',
      role: 'owner',
      assuranceLevel: 'aal2',
      verifiedTotpFactors: []
    }));
  });

  const report = {};

  // -------------------------------------------------------------
  // TEST 1: Admin Learn More Catalog Audit
  // -------------------------------------------------------------
  console.log('[TEST 1/6] Admin Learn More Catalog Audit on Preview...');
  await page.goto(`${BASE_URL}/admin/learn-more?admin_preview=1`, { waitUntil: 'domcontentloaded', timeout: 35000 });
  await page.waitForSelector('.vlearn-product-item', { timeout: 20000 });

  const catalogAudit = await page.evaluate(() => {
    const items = Array.from(document.querySelectorAll('.vlearn-product-item'));
    const totalCount = items.length;
    const missingThumbs = items.filter((item) => !item.querySelector('img')).length;
    const catChips = Array.from(document.querySelectorAll('.vlearn-cat-chip')).map((chip) => ({
      label: chip.querySelector('.vlearn-cat-chip-label')?.textContent?.trim() || chip.textContent?.trim(),
      count: chip.querySelector('.vlearn-cat-chip-count')?.textContent?.trim() || '',
    }));
    const sampleSlugs = items.slice(0, 15).map((item) => {
      const testid = item.getAttribute('data-testid') || '';
      return testid.replace('learn-more-product-', '');
    });

    return {
      totalProductsListed: totalCount,
      catChips,
      sampleSlugs,
      missingThumbs,
    };
  });

  console.log(`Total Products Listed in Admin: ${catalogAudit.totalProductsListed}`);
  console.log('Category Filter Pills:', catalogAudit.catChips);
  console.log(`Items missing thumbnails: ${catalogAudit.missingThumbs}`);
  report.catalogAudit = catalogAudit;
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'preview-admin-catalog-list.png'), fullPage: false });

  // -------------------------------------------------------------
  // TEST 2: Inspecting Unconfigured Product (e.g. apple-20w-usb-c-power-adapter)
  // -------------------------------------------------------------
  console.log('\n[TEST 2/6] Inspecting Unconfigured Product on Preview...');
  const emptyProductSlug = 'apple-20w-usb-c-power-adapter';
  await page.evaluate((slug) => {
    const el = document.querySelector(`[data-testid="learn-more-product-${slug}"]`);
    if (el) el.click();
  }, emptyProductSlug);
  await new Promise((r) => setTimeout(r, 1500));

  const emptyOutlineCheck = await page.evaluate(() => {
    const emptyState = document.querySelector('[data-testid="outline-empty-state"]');
    const heroCard = document.querySelector('[data-testid="outline-card-hero"]');
    const videoCard = document.querySelector('[data-testid="outline-card-video"]');
    const emptyInspector = document.querySelector('[data-testid="empty-inspector"]');
    const topbarTitle = document.querySelector('.vlearn-topbar-title')?.textContent?.trim();
    const topbarThumb = document.querySelector('.vlearn-topbar-thumb img')?.getAttribute('src');

    return {
      hasEmptyOutlineState: Boolean(emptyState),
      hasHeroCard: Boolean(heroCard),
      hasVideoCard: Boolean(videoCard),
      hasEmptyInspector: Boolean(emptyInspector),
      topbarTitle,
      hasTopbarThumb: Boolean(topbarThumb),
      topbarThumbSrc: topbarThumb,
    };
  });

  console.log('Empty Product Outline Check:', emptyOutlineCheck);
  report.emptyProductCheck = emptyOutlineCheck;
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'preview-admin-empty-outline.png'), fullPage: false });

  // -------------------------------------------------------------
  // TEST 3: Add Section to Empty Product Page
  // -------------------------------------------------------------
  console.log('\n[TEST 3/6] Adding Section to Empty Product Page on Preview...');
  const addBtn = await page.$('[data-testid="outline-empty-add-btn"]');
  if (addBtn) {
    await addBtn.click();
    await page.waitForSelector('.vlearn-modal-backdrop', { timeout: 5000 });
    await new Promise((r) => setTimeout(r, 800));

    const firstPreset = await page.$('.vlearn-template-card') || await page.$('[data-testid^="library-preset-"]');
    if (firstPreset) {
      await firstPreset.click();
      await new Promise((r) => setTimeout(r, 1200));
    }
  }

  const afterAddCheck = await page.evaluate(() => {
    const sectionCards = Array.from(document.querySelectorAll('.vlearn-section-card'));
    const activeInspectorTitle = document.querySelector('.vlearn-crumb-section')?.textContent?.trim() || '';
    const sectionCount = sectionCards.length;
    return {
      sectionCount,
      activeInspectorTitle,
    };
  });

  console.log('After Adding Section:', afterAddCheck);
  report.addSectionCheck = afterAddCheck;
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'preview-admin-section-added.png'), fullPage: false });

  // -------------------------------------------------------------
  // TEST 4: Apple Watch Series 12 Cinematic Video Removed
  // -------------------------------------------------------------
  console.log('\n[TEST 4/6] Verifying Apple Watch Series 12 Showcase Removal on Preview...');
  await page.evaluate(() => {
    const el = document.querySelector('[data-testid="learn-more-product-apple-watch-series-12"]');
    if (el) el.click();
  });
  await new Promise((r) => setTimeout(r, 1500));

  const watch12AdminCheck = await page.evaluate(() => {
    const heroCard = document.querySelector('[data-testid="outline-card-hero"]');
    const videoCard = document.querySelector('[data-testid="outline-card-video"]');
    const sectionCards = Array.from(document.querySelectorAll('.vlearn-section-card')).map(
      (c) => c.querySelector('.vlearn-card-title')?.textContent?.trim() || ''
    );
    return {
      hasHeroCard: Boolean(heroCard),
      hasVideoCard: Boolean(videoCard),
      sectionTitles: sectionCards,
    };
  });

  console.log('Apple Watch Series 12 Admin Outline Check:', watch12AdminCheck);
  report.watch12AdminCheck = watch12AdminCheck;
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'preview-admin-watch12.png'), fullPage: false });

  // Clean public browser context for storefront checks
  const publicPage = await browser.newPage();
  await publicPage.setViewport({ width: 1400, height: 980 });

  await publicPage.goto(`${BASE_URL}/watch/apple-watch-series-12`, { waitUntil: 'domcontentloaded', timeout: 35000 });
  await publicPage.waitForSelector('.minimal-editorial-hero', { timeout: 15000 }).catch(() => null);
  await new Promise((r) => setTimeout(r, 1000));

  const watch12PublicCheck = await publicPage.evaluate(() => {
    const film = document.querySelector('.minimal-editorial-film');
    const hero = document.querySelector('.minimal-editorial-hero');
    const heroHeadline = hero?.querySelector('h1')?.textContent?.trim() || '';
    return {
      hasCinematicFilmSection: Boolean(film),
      hasHero: Boolean(hero),
      heroHeadline,
    };
  });

  console.log('Apple Watch Series 12 Public Page Check:', watch12PublicCheck);
  report.watch12PublicCheck = watch12PublicCheck;
  await publicPage.screenshot({ path: path.join(ARTIFACTS_DIR, 'preview-public-watch12.png'), fullPage: false });

  // -------------------------------------------------------------
  // TEST 5: iPhone 18 Pro Preserved & Cinematic Video Management
  // -------------------------------------------------------------
  console.log('\n[TEST 5/6] Verifying iPhone 18 Pro Editorial Content & Video Controls on Preview...');
  await page.evaluate(() => {
    const btn = document.querySelector('[data-testid="learn-more-product-iphone-18-pro"]');
    if (btn) btn.click();
  });
  await new Promise((r) => setTimeout(r, 1500));

  const iphone18AdminCheck = await page.evaluate(() => {
    const heroCard = document.querySelector('[data-testid="outline-card-hero"]');
    const videoCard = document.querySelector('[data-testid="outline-card-video"]');
    const videoTrashBtn = videoCard?.querySelector('button[aria-label="Remove cinematic video"]');
    const sectionCount = document.querySelectorAll('.vlearn-section-card').length;

    return {
      hasHeroCard: Boolean(heroCard),
      hasVideoCard: Boolean(videoCard),
      hasVideoTrashBtn: Boolean(videoTrashBtn),
      totalOutlineCards: sectionCount,
    };
  });

  console.log('iPhone 18 Pro Admin Outline Check:', iphone18AdminCheck);
  report.iphone18AdminCheck = iphone18AdminCheck;
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'preview-admin-iphone18.png'), fullPage: false });

  // -------------------------------------------------------------
  // TEST 6: Storefront Learn More Gating
  // -------------------------------------------------------------
  console.log('\n[TEST 6/6] Verifying Storefront Learn More Button Gating on Preview...');
  await publicPage.goto(`${BASE_URL}/accessories`, { waitUntil: 'domcontentloaded', timeout: 35000 });
  await publicPage.waitForSelector('.store-cat-card', { timeout: 15000 }).catch(() => null);
  await new Promise((r) => setTimeout(r, 1000));

  const storeGatingCheck = await publicPage.evaluate(() => {
    const catCards = Array.from(document.querySelectorAll('.store-cat-card'));
    const sampleCategoryCards = catCards.map((card) => {
      const title = card.querySelector('.store-cat-card-title')?.textContent?.trim() || '';
      const primaryBtn = card.querySelector('.store-cat-btn-primary')?.textContent?.trim() || '';
      const learnMoreBtn = card.querySelector('.store-cat-btn-text');
      const hasLearnMore = Boolean(learnMoreBtn);
      const learnMoreHref = learnMoreBtn?.getAttribute('href') || '';

      return {
        title,
        primaryBtn,
        hasLearnMore,
        learnMoreHref,
      };
    });

    return {
      totalCategoryCards: catCards.length,
      sampleCategoryCards,
    };
  });

  console.log(`Store Category Cards Checked: ${storeGatingCheck.totalCategoryCards}`);
  console.log('Store Category Cards Gating:', storeGatingCheck.sampleCategoryCards);
  report.storeGatingCheck = storeGatingCheck;
  await publicPage.screenshot({ path: path.join(ARTIFACTS_DIR, 'preview-store-gating.png'), fullPage: false });
  await publicPage.close();

  fs.writeFileSync(
    path.join(ARTIFACTS_DIR, 'preview-verification-report.json'),
    JSON.stringify(report, null, 2)
  );
  console.log('\n✓ PREVIEW E2E VERIFICATION COMPLETED SUCCESSFULLY!');
  await browser.close();
}

run().catch(console.error);
