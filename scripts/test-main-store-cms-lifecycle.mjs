import fs from 'node:fs';
import { createClient } from '@supabase/supabase-js';

const env = fs.readFileSync('.env.local', 'utf-8');
const urlMatch = env.match(/VITE_SUPABASE_URL=([^\r\n]+)/);
const keyMatch = env.match(/VITE_SUPABASE_ANON_KEY=([^\r\n]+)/);
const emailMatch = env.match(/VITE_LOCAL_ADMIN_EMAIL="?([^"\r\n]+)"?/);
const passMatch = env.match(/VITE_LOCAL_ADMIN_PASSWORD="?([^"\r\n]+)"?/);

const supabaseUrl = urlMatch[1].trim();
const supabaseAnonKey = keyMatch[1].trim();

const anonClient = createClient(supabaseUrl, supabaseAnonKey);

async function runMainStoreCmsTest() {
  console.log('================================================================');
  console.log('BUY & SELL GH — MAIN STORE CMS LIFECYCLE VERIFICATION');
  console.log(`Target: ${supabaseUrl}`);
  console.log('================================================================\n');

  // 1. Authenticate Admin
  const baseClient = createClient(supabaseUrl, supabaseAnonKey);
  const { data: authData, error: authErr } = await baseClient.auth.signInWithPassword({
    email: emailMatch[1].trim(),
    password: passMatch[1].trim(),
  });

  if (authErr) {
    console.error('Admin Auth Failed:', authErr.message);
    process.exit(1);
  }
  console.log(`✓ Admin authenticated: ${authData.user.email} (UID: ${authData.user.id})\n`);

  const adminClient = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: `Bearer ${authData.session.access_token}` } },
  });

  // Step 2: Fetch existing main_store from Supabase
  console.log('Step 2: Fetching existing main_store row...');
  const { data: existingRow, error: fetchErr } = await adminClient
    .from('storefront_content')
    .select('key, config, updated_at')
    .eq('key', 'main_store')
    .maybeSingle();

  if (fetchErr) {
    console.error('Error fetching main_store:', fetchErr.message);
    process.exit(1);
  }

  console.log(existingRow ? '✓ Found existing main_store row in Supabase' : '• No existing main_store row (will create initial)');

  // Step 3: Record catalog product state before CMS changes to prove independence
  console.log('\nStep 3: Checking catalog product state before test...');
  const { data: beforeProducts, error: prodErr } = await adminClient
    .from('products')
    .select('id, name, slug, images')
    .in('slug', ['macbook-pro-14-m5', 'apple-magsafe-iphone-case']);

  if (prodErr) throw prodErr;
  const beforeImages = JSON.stringify(beforeProducts.map(p => ({ slug: p.slug, images: p.images })));
  console.log(`✓ Verified catalog baseline for ${beforeProducts.length} test products`);

  // Step 4: Test Image Overrides across all 5 sections
  console.log('\nStep 4: Writing test configuration with custom image overrides across all 5 Main Store sections...');
  const testConfig = {
    productFamilies: [
      { id: "iphone", name: "iPhone", image: "https://example.com/test-family-iphone.webp", alt: "Test iPhone Icon", path: "/iphone" },
      { id: "mac", name: "Mac", image: "/products/campaigns/macbook-family.webp", alt: "Mac", path: "/mac" },
      { id: "ipad", name: "iPad", image: "/products/campaigns/ipad-family.webp", alt: "iPad", path: "/ipad" },
      { id: "watch", name: "Apple Watch", image: "/products/campaigns/watch-family.webp", alt: "Apple Watch", path: "/watch" },
      { id: "airpods", name: "AirPods", image: "/products/campaigns/airpods-family.webp", alt: "AirPods", path: "/airpods" },
      { id: "accessories", name: "Accessories", image: "/products/campaigns/accessory-family.webp", alt: "Accessories", path: "/accessories" },
    ],
    latestCards: [
      {
        id: "macbook-pro-14-m5",
        eyebrow: "M5 PRO POWERHOUSE",
        name: "MacBook Pro 14\"",
        statement: "Test statement for CMS override verification.",
        image: "https://example.com/test-promo-macbook.webp",
        alt: "Test MacBook Pro 14 Promo",
        theme: "light",
        learnMorePath: "/mac/macbook-pro-14-m5",
        actionPath: "/shop/buy-mac/macbook-pro-14-m5",
        actionLabel: "View Pricing",
      },
    ],
    categoryCards: [
      {
        id: "phones",
        path: "/iphone",
        title: "Phones",
        subtitle: "Test custom subtitle for phones category",
        image: "https://example.com/test-cat-phones.webp",
        alt: "Test Category Phones",
      },
    ],
    moreToLoveCards: [
      {
        id: "iphone-18-pro",
        eyebrow: "IPHONE 18 PRO",
        name: "iPhone 18 Pro",
        statement: "A new expression of Pro.",
        image: "https://example.com/test-more-iphone18.webp",
        alt: "Test iPhone 18 Pro",
        theme: "dark",
        learnMorePath: "/iphone/iphone-18-pro",
        actionPath: "/shop/buy-iphone/iphone-18-pro",
        actionLabel: "View Pricing",
      },
    ],
    accessories: [
      {
        id: "apple-magsafe-iphone-case",
        family: "accessories",
        name: "iPhone MagSafe Silicone Case",
        eyebrow: "Cases & Protection",
        image: "https://example.com/test-accessory-case.webp",
        alt: "Test MagSafe Case",
      },
    ],
  };

  const { error: upsertErr } = await adminClient
    .from('storefront_content')
    .upsert({
      key: 'main_store',
      config: testConfig,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'key' });

  if (upsertErr) {
    console.error('✗ Failed to upsert main_store as admin:', upsertErr.message);
    process.exit(1);
  }
  console.log('✓ Successfully saved main_store config to Supabase storefront_content');

  // Step 5: Anonymous Public Read Verification
  console.log('\nStep 5: Verifying anonymous / public read access to main_store...');
  const { data: publicData, error: publicReadErr } = await anonClient
    .from('storefront_content')
    .select('key, config, updated_at')
    .eq('key', 'main_store')
    .single();

  if (publicReadErr) {
    console.error('✗ Public read failed:', publicReadErr.message);
    process.exit(1);
  }

  const pubConfig = publicData.config;
  console.log('✓ Public read succeeded!');
  console.log('  Family strip 1 image:', pubConfig.productFamilies[0].image);
  console.log('  Latest card 1 image:', pubConfig.latestCards[0].image);
  console.log('  Category card 1 image:', pubConfig.categoryCards[0].image);
  console.log('  More to love 1 image:', pubConfig.moreToLoveCards[0].image);
  console.log('  Accessory 1 image:', pubConfig.accessories[0].image);

  if (
    pubConfig.productFamilies[0].image !== "https://example.com/test-family-iphone.webp" ||
    pubConfig.latestCards[0].image !== "https://example.com/test-promo-macbook.webp" ||
    pubConfig.categoryCards[0].image !== "https://example.com/test-cat-phones.webp" ||
    pubConfig.moreToLoveCards[0].image !== "https://example.com/test-more-iphone18.webp" ||
    pubConfig.accessories[0].image !== "https://example.com/test-accessory-case.webp"
  ) {
    console.error('✗ Verification failed: public images do not match expected overrides!');
    process.exit(1);
  }
  console.log('✓ All 5 section image overrides verified in public payload!');

  // Step 6: Verify Catalog Product Independence
  console.log('\nStep 6: Verifying product catalog images were NOT modified...');
  const { data: afterProducts, error: afterErr } = await adminClient
    .from('products')
    .select('id, name, slug, images')
    .in('slug', ['macbook-pro-14-m5', 'apple-magsafe-iphone-case']);

  if (afterErr) throw afterErr;
  const afterImages = JSON.stringify(afterProducts.map(p => ({ slug: p.slug, images: p.images })));

  if (beforeImages !== afterImages) {
    console.error('✗ VIOLATION: Catalog product images were modified by storefront CMS override!');
    process.exit(1);
  }
  console.log('✓ PASS: Catalog product images remain 100% identical and independent!');

  // Step 7: Clean up / Restore original state or empty overrides
  console.log('\nStep 7: Restoring clean state in Supabase...');
  if (existingRow?.config) {
    await adminClient
      .from('storefront_content')
      .update({ config: existingRow.config, updated_at: new Date().toISOString() })
      .eq('key', 'main_store');
    console.log('✓ Restored previous existing main_store configuration');
  } else {
    // If there was no row, delete the test row
    await adminClient
      .from('storefront_content')
      .delete()
      .eq('key', 'main_store');
    console.log('✓ Deleted test main_store row (clean state preserved)');
  }

  // Step 8: Confirm clean state
  const { data: finalData } = await anonClient
    .from('storefront_content')
    .select('key')
    .eq('key', 'main_store')
    .maybeSingle();

  console.log(`✓ Restoration verified. (Current row: ${finalData ? 'present' : 'clean/empty'})`);
  console.log('\n================================================================');
  console.log('ALL MAIN STORE CMS TESTS PASSED SUCCESSFULLY!');
  console.log('================================================================');
}

runMainStoreCmsTest().catch((err) => {
  console.error('Unhandled test failure:', err);
  process.exit(1);
});
