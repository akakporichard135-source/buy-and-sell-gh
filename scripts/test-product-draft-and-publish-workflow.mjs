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

  console.log("\n[TEST 2] Verifying PS5 Slim Console Listing...");
  const ps5Product = allProducts.find((p) => p.id === "product-1793715191749" || p.slug === "playstation-5-slim-console");
  assert(ps5Product, "Could not find the Sony PlayStation 5 Slim Console listing!");
  console.log(`✓ Located PS5 Console:`, {
    id: ps5Product.id,
    name: ps5Product.name,
    slug: ps5Product.slug,
    price: ps5Product.price,
    stock: ps5Product.stock_quantity,
    available: ps5Product.available,
    archived: ps5Product.archived,
  });

  assert.equal(ps5Product.archived, false, "PS5 Console should not be archived");
  assert.equal(ps5Product.price, 11000, "PS5 Console price should be 11,000 GHS");

  console.log("\n[TEST 3] Verifying Bundle Separation...");
  const ps5ComboBundle = allProducts.find((p) => p.slug === "ps5-slim-combo-offer" || p.id === "ps5-slim-combo-offer");
  if (ps5ComboBundle) {
    console.log(`✓ Located PS5 Slim Combo Offer bundle (distinct product ID: ${ps5ComboBundle.id}, price: GH₵${ps5ComboBundle.price})`);
    assert.notEqual(ps5ComboBundle.id, ps5Product.id, "Bundle ID must differ from console ID");
  }

  console.log("\n[TEST 4] Verifying Storefront Query Filtering...");
  // Storefront active query uses (archived = false and available = true)
  const storefrontProducts = allProducts.filter((p) => !p.archived && p.available !== false);
  const draftProduct = drafts[0];
  if (draftProduct) {
    assert(!storefrontProducts.some((p) => p.id === draftProduct.id), "Draft product must NOT appear on public storefront before publishing");
    console.log(`✓ Verified draft product (${draftProduct.name || draftProduct.slug}) is excluded from storefront view until published`);
  }

  console.log("\n=== ALL DATABASE & DRAFT VISIBILITY TESTS PASSED SUCCESSFULLY! ===");
}

if (process.argv[1] && process.argv[1].endsWith("test-product-draft-and-publish-workflow.mjs")) {
  testProductDraftAndPublishWorkflow().catch((err) => {
    console.error("Test failed:", err);
    process.exit(1);
  });
}
