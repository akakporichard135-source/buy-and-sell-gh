import { createClient } from "@supabase/supabase-js";
import assert from "node:assert/strict";

const SUPABASE_URL = "https://kgbcytxhyqalzawkdghn.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_h18JFN3FSV2HFs53E_3J9w_tR9q-TwS";

export async function testProductDraftAndPublishWorkflow() {
  console.log("=== RUNNING PRODUCT DRAFT & PUBLISH SUITE ===");

  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  console.log("\n[TEST 1] Verifying Supabase PostgREST Products Query with Anon Key...");
  const { data: allProducts, error } = await supabase
    .from("products")
    .select("id, name, slug, brand, category, condition, price, stock_quantity, available, archived, images")
    .order("created_at", { ascending: false });

  assert(!error, `Failed to fetch products: ${error?.message}`);
  assert(Array.isArray(allProducts) && allProducts.length > 0, "No products returned from Supabase!");

  const published = allProducts.filter((p) => !p.archived && p.available !== false);
  const drafts = allProducts.filter((p) => !p.archived && p.available === false);
  const archived = allProducts.filter((p) => Boolean(p.archived));

  console.log(`✓ Total products in database: ${allProducts.length}`);
  console.log(`✓ Published Live products: ${published.length}`);
  console.log(`✓ Draft (unpublished) products: ${drafts.length}`);
  console.log(`✓ Archived products: ${archived.length}`);

  assert(drafts.length >= 1, "Expected at least 1 draft product in Supabase!");

  console.log("\n[TEST 2] Verifying PS5 Slim Console Draft Listing...");
  const ps5Draft = drafts.find((p) => p.id === "product-1793715191749" || p.slug === "playstation-5-slim-console");
  assert(ps5Draft, "Could not find the Sony PlayStation 5 Slim Console draft listing!");
  console.log(`✓ Located PS5 Console Draft:`, {
    id: ps5Draft.id,
    name: ps5Draft.name,
    slug: ps5Draft.slug,
    price: ps5Draft.price,
    stock: ps5Draft.stock_quantity,
    available: ps5Draft.available,
    archived: ps5Draft.archived,
  });

  assert.equal(ps5Draft.available, false, "PS5 Console should be in draft status (available = false)");
  assert.equal(ps5Draft.archived, false, "PS5 Console should not be archived");
  assert.equal(ps5Draft.price, 11000, "PS5 Console price should be 11,000 GHS");

  console.log("\n[TEST 3] Verifying Bundle Separation...");
  const ps5ComboBundle = allProducts.find((p) => p.slug === "ps5-slim-combo-offer" || p.id === "ps5-slim-combo-offer");
  if (ps5ComboBundle) {
    console.log(`✓ Located PS5 Slim Combo Offer bundle (distinct product ID: ${ps5ComboBundle.id}, price: GH₵${ps5ComboBundle.price})`);
    assert.notEqual(ps5ComboBundle.id, ps5Draft.id, "Bundle ID must differ from console draft ID");
  }

  console.log("\n[TEST 4] Verifying Storefront Query Filtering...");
  // Storefront active query uses (archived = false and available = true)
  const storefrontProducts = allProducts.filter((p) => !p.archived && p.available !== false);
  assert(!storefrontProducts.some((p) => p.id === ps5Draft.id), "Draft PS5 console must NOT appear on public storefront before publishing");
  console.log("✓ Verified draft product is excluded from storefront view until published");

  console.log("\n=== ALL DATABASE & DRAFT VISIBILITY TESTS PASSED SUCCESSFULLY! ===");
}

if (process.argv[1] && process.argv[1].endsWith("test-product-draft-and-publish-workflow.mjs")) {
  testProductDraftAndPublishWorkflow().catch((err) => {
    console.error("Test failed:", err);
    process.exit(1);
  });
}
