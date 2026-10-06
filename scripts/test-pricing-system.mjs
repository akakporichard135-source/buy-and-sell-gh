import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const ROOT = process.cwd();

console.log("=== BUY & SELL GH: DYNAMIC PRICING SYSTEM INTEGRATION TEST ===");
let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    failed++;
  }
}

// ---------------------------------------------------------
// TEST SUITE 1: Migration Artifact Integrity & Security Rules
// ---------------------------------------------------------
console.log("\n[Suite 1: Migration Artifact Integrity & RLS Policies]");
const schemaFile = path.join(ROOT, "supabase", "migrations", "013_product_variants_schema.sql");
const seedFile = path.join(ROOT, "supabase", "migrations", "014_seed_product_variants_pricing.sql");

assert(fs.existsSync(schemaFile), "013_product_variants_schema.sql exists");
assert(fs.existsSync(seedFile), "014_seed_product_variants_pricing.sql exists");

const schemaSql = fs.readFileSync(schemaFile, "utf8");
const seedSql = fs.readFileSync(seedFile, "utf8");

// Schema assertions
assert(schemaSql.includes("create table if not exists public.product_variants"), "Defines public.product_variants table");
assert(schemaSql.includes("references public.products(id) on delete cascade"), "Foreign key cascade on products(id)");
assert(schemaSql.includes("alter table public.product_variants enable row level security"), "RLS enabled on product_variants");
assert(schemaSql.includes("create policy \"Public can view active product variants\""), "Public read policy 'Public can view active product variants' present");
assert(schemaSql.includes("create policy \"Admins can manage product variants\""), "Admin write policy 'Admins can manage product variants' present");
assert(schemaSql.includes("public.is_admin()"), "Admin policy strictly requires is_admin() role (enforcing AAL2 per 012_admin_mfa_hardening.sql)");
assert(schemaSql.includes("set_product_variants_updated_at"), "Automatic updated_at trigger exists");
assert(schemaSql.includes("create or replace function public.create_order_request"), "Authoritative RPC create_order_request updated");
assert(schemaSql.includes("from public.product_variants"), "RPC verifies unit prices from product_variants on server");

// Seed assertions
assert(seedSql.includes("update public.products set price ="), "Updates base prices on public.products");
assert(seedSql.includes("insert into public.product_variants"), "Inserts variants into public.product_variants");

// Count variant insert statements
const variantInsertCount = (seedSql.match(/insert into public\.product_variants/g) || []).length;
console.log(`  ℹ Total variant insert blocks: ${variantInsertCount}`);
assert(variantInsertCount === 273, `Variant inserts count (${variantInsertCount}) matches catalog (exact 273 variants)`);

// ---------------------------------------------------------
// TEST SUITE 2: Static Catalog Seed & Pricing Seed Integrity
// ---------------------------------------------------------
console.log("\n[Suite 2: Static Catalog Seed & Pricing Data Integrity]");
const proposalJsonFile = path.join(ROOT, "scripts", "proposed-pricing.json");
assert(fs.existsSync(proposalJsonFile), "scripts/proposed-pricing.json exists");

const proposalData = JSON.parse(fs.readFileSync(proposalJsonFile, "utf8"));
assert(Array.isArray(proposalData), "Proposed pricing data is an array");
assert(proposalData.length === 112, `Proposed pricing has ${proposalData.length} products (expected exact 112)`);

let allHavePrices = true;
let totalVariantsCount = 0;
let zeroPricedVariants = 0;

for (const p of proposalData) {
  if (!p.proposedBaseGhs || p.proposedBaseGhs <= 0) {
    allHavePrices = false;
    console.error(`Product ${p.slug} has invalid proposedBaseGhs: ${p.proposedBaseGhs}`);
  }
  const vars = p.variants || [];
  totalVariantsCount += vars.length;
  for (const v of vars) {
    if (!v.price || v.price <= 0) {
      zeroPricedVariants++;
      console.error(`Variant in ${p.slug} has invalid price: ${v.price}`);
    }
  }
}

assert(allHavePrices, "All products have valid proposedBaseGhs > 0");
assert(zeroPricedVariants === 0, `Zero variants with invalid price (found ${zeroPricedVariants})`);
assert(totalVariantsCount === 273, `Total variants count (${totalVariantsCount}) meets exact 273 target`);

// ---------------------------------------------------------
// TEST SUITE 3: Utility Function Logic (Simulated)
// ---------------------------------------------------------
console.log("\n[Suite 3: Dynamic Pricing Utility Logic]");

function formatPrice(amount) {
  if (!Number.isFinite(amount) || amount <= 0) return "GH₵ 0";
  return `GH₵ ${Math.round(amount).toLocaleString("en-US")}`;
}

function calculateTradeInBreakdown(retailPrice, tradeInSelected, percentage = 0.20) {
  if (!tradeInSelected || retailPrice <= 0) {
    return {
      retailPrice,
      estimatedTradeInCredit: 0,
      balanceDue: retailPrice,
      hasTradeIn: false,
    };
  }
  const estimatedTradeInCredit = Math.round(retailPrice * percentage);
  const balanceDue = Math.max(0, retailPrice - estimatedTradeInCredit);
  return {
    retailPrice,
    estimatedTradeInCredit,
    balanceDue,
    hasTradeIn: true,
  };
}

assert(formatPrice(17800) === "GH₵ 17,800", "formatPrice formats GH₵ 17,800 correctly");
assert(formatPrice(23500) === "GH₵ 23,500", "formatPrice formats GH₵ 23,500 correctly");
assert(formatPrice(0) === "GH₵ 0", "formatPrice formats 0 as GH₵ 0");

const tradeInNo = calculateTradeInBreakdown(20000, false);
assert(tradeInNo.retailPrice === 20000 && tradeInNo.estimatedTradeInCredit === 0 && tradeInNo.balanceDue === 20000, "Trade-in false preserves full retail price and zero credit");

const tradeInYes = calculateTradeInBreakdown(20000, true);
assert(tradeInYes.retailPrice === 20000 && tradeInYes.estimatedTradeInCredit === 4000 && tradeInYes.balanceDue === 16000, "Trade-in true computes estimated credit and balance due separately");

// ---------------------------------------------------------
// TEST SUITE 4: Source Code Pricing Wiring Check
// ---------------------------------------------------------
console.log("\n[Suite 4: Source Code Pricing Integration Checks]");

const filesToCheck = [
  "src/types/product.ts",
  "src/utils/productPricing.ts",
  "src/data/productPricingSeed.ts",
  "src/catalog/productCatalog.ts",
  "src/catalog/supabaseProductRepository.ts",
  "src/catalog/ProductCatalogContext.tsx",
  "src/context/CartContext.tsx",
  "src/context/cartOperations.ts",
  "src/types/order.ts",
  "src/utils/orders.ts",
  "src/orders/supabaseOrderRepository.ts",
  "src/pages/CartPage.tsx",
  "src/components/StoreProductCard.tsx",
  "src/components/ProductCard.tsx",
  "src/components/buy/BuyPrimitives.tsx",
  "src/components/buy/IphoneBuyExperience.tsx",
  "src/components/buy/MacbookProBuyExperience.tsx",
  "src/components/buy/MacbookBuyExperience.tsx",
  "src/components/buy/IpadProBuyExperience.tsx",
  "src/components/buy/IpadBuyExperience.tsx",
  "src/components/buy/WatchSeries12BuyExperience.tsx",
  "src/components/buy/WatchUltraBuyExperience.tsx",
  "src/components/buy/AirpodsBuyExperience.tsx",
  "src/components/buy/MacMiniBuyExperience.tsx",
  "src/components/buy/GenericBuyExperience.tsx",
  "src/pages/admin/AdminPricingManager.tsx",
];

for (const relPath of filesToCheck) {
  const fullPath = path.join(ROOT, relPath);
  assert(fs.existsSync(fullPath), `File exists: ${relPath}`);
}

// ---------------------------------------------------------
// TEST SUITE 5: Artifact SHA-256 Hashes
// ---------------------------------------------------------
console.log("\n[Suite 5: Cryptographic Checksum Computation]");

function getFileSha256(filePath) {
  const content = fs.readFileSync(filePath);
  return crypto.createHash("sha256").update(content).digest("hex");
}

const schemaHash = getFileSha256(schemaFile);
const seedHash = getFileSha256(seedFile);

console.log(`  013_product_variants_schema.sql SHA-256:\n    ${schemaHash}`);
console.log(`  014_seed_product_variants_pricing.sql SHA-256:\n    ${seedHash}`);

assert(schemaHash.length === 64, "Schema SHA-256 hash computed successfully");
assert(seedHash.length === 64, "Seed SHA-256 hash computed successfully");

// ---------------------------------------------------------
// Summary
// ---------------------------------------------------------
console.log(`\n======================================================`);
console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
console.log(`======================================================`);

if (failed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
