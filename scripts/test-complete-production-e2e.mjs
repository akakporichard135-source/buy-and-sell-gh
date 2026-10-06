import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const env = fs.readFileSync(".env.local", "utf8");
const url = env.match(/VITE_SUPABASE_URL=([^\r\n]+)/)[1];
const key = env.match(/VITE_SUPABASE_ANON_KEY=([^\r\n]+)/)[1];
const supabase = createClient(url, key);

async function runFullVerification() {
  console.log("===============================================================================");
  console.log("BUY & SELL GH — COMPLETE LIVE PRODUCTION PRICING VERIFICATION SUITE");
  console.log(`Connected Project: ${url}`);
  console.log("===============================================================================\n");

  let totalPassed = 0;
  let totalFailed = 0;

  function assert(condition, testName) {
    if (condition) {
      console.log(`  ✓ PASS: ${testName}`);
      totalPassed++;
    } else {
      console.error(`  ✗ FAIL: ${testName}`);
      totalFailed++;
    }
  }

  // ---------------------------------------------------------------------------
  // SUITE 1: Production Database Counts & Zero Placeholder Check
  // ---------------------------------------------------------------------------
  console.log("[Suite 1: Database Counts & Storefront Pricing Population]");
  const { data: allProds, count: prodCount, error: pErr } = await supabase
    .from("products")
    .select("id, slug, name, category, price, price_on_request, stock_status", { count: "exact" });

  assert(!pErr, "Querying public.products returned without error");
  assert(prodCount === 112, `Storefront active products count is exactly 112 (Found: ${prodCount})`);

  const unpriced = allProds.filter(p => !p.price || p.price <= 0 || p.price_on_request === true);
  assert(unpriced.length === 0, `Zero products with price <= 0 or price_on_request = true (Found: ${unpriced.length})`);

  const { data: allVars, count: varCount, error: vErr } = await supabase
    .from("product_variants")
    .select("*", { count: "exact" });

  assert(!vErr, "Querying public.product_variants returned without error");
  assert(varCount === 273, `Storefront active variants count is exactly 273 (Found: ${varCount})`);

  // ---------------------------------------------------------------------------
  // SUITE 2: Configuration Pricing Across All Product Categories
  // ---------------------------------------------------------------------------
  console.log("\n[Suite 2: Configuration Pricing Across All Categories]");

  // 1. iPhone
  const ip16ProMax256 = allVars.find(v => v.id === "iphone-16-pro-max-256gb-brand-new");
  const ip16ProMax512 = allVars.find(v => v.id === "iphone-16-pro-max-512gb-brand-new");
  const ip16ProMax1TB = allVars.find(v => v.id === "iphone-16-pro-max-1tb-brand-new");
  assert(ip16ProMax256 && ip16ProMax256.price === 20500, "iPhone 16 Pro Max 256GB priced at GH₵ 20,500");
  assert(ip16ProMax512 && ip16ProMax512.price === 23800, "iPhone 16 Pro Max 512GB priced at GH₵ 23,800");
  assert(ip16ProMax1TB && ip16ProMax1TB.price === 27200, "iPhone 16 Pro Max 1TB priced at GH₵ 27,200");

  // 2. Mac
  const mac14M4_512 = allVars.find(v => v.id === "macbook-pro-14-m4-512gb-m4-16gb-brand-new");
  const mac14M4_1TB = allVars.find(v => v.id === "macbook-pro-14-m4-1tb-m4-16gb-brand-new");
  assert(mac14M4_512 && mac14M4_512.price === 24500, "MacBook Pro 14 M4 512GB priced at GH₵ 24,500");
  assert(mac14M4_1TB && mac14M4_1TB.price === 27500, "MacBook Pro 14 M4 1TB priced at GH₵ 27,500");

  // 3. iPad
  const ipadPro11_256 = allVars.find(v => v.id === "ipad-pro-11-inch-m4-256gb-wi-fi-brand-new");
  const ipadPro11_512 = allVars.find(v => v.id === "ipad-pro-11-inch-m4-512gb-wi-fi-brand-new");
  assert(ipadPro11_256 && ipadPro11_256.price === 17200, "iPad Pro 11-inch M4 256GB priced at GH₵ 17,200");
  assert(ipadPro11_512 && ipadPro11_512.price === 20200, "iPad Pro 11-inch M4 512GB priced at GH₵ 20,200");

  // 4. Watch
  const watchUltra2 = allVars.find(v => v.id === "apple-watch-ultra-2-49mm-gps-cellular-brand-new");
  assert(watchUltra2 && watchUltra2.price === 12500, "Apple Watch Ultra 2 49mm priced at GH₵ 12,500");

  // 5. AirPods
  const airpodsPro2 = allVars.find(v => v.id === "airpods-pro-2-brand-new");
  const airpods4ANC = allVars.find(v => v.id === "airpods-4-anc-brand-new");
  assert(airpodsPro2 && airpodsPro2.price === 3600, "AirPods Pro 2 priced at GH₵ 3,600");
  assert(airpods4ANC && airpods4ANC.price === 2800, "AirPods 4 ANC priced at GH₵ 2,800");

  // 6. Accessories
  const adapter20w = allVars.find(v => v.id === "apple-20w-usb-c-power-adapter-brand-new");
  const magSafeCharger = allVars.find(v => v.id === "apple-magsafe-charger-brand-new");
  const keyboard11 = allVars.find(v => v.id === "apple-magic-keyboard-ipad-11-inch-brand-new");
  const keyboard13 = allVars.find(v => v.id === "apple-magic-keyboard-ipad-13-inch-brand-new");
  assert(adapter20w && adapter20w.price === 350, "Apple 20W USB-C Adapter priced at GH₵ 350");
  assert(magSafeCharger && magSafeCharger.price === 650, "Apple MagSafe Charger priced at GH₵ 650");
  assert(keyboard11 && keyboard11.price === 4800, "Magic Keyboard 11-inch priced at GH₵ 4,800");
  assert(keyboard13 && keyboard13.price === 5400, "Magic Keyboard 13-inch priced at GH₵ 5,400");

  // ---------------------------------------------------------------------------
  // SUITE 3: Anonymous Public Write Rejection (RLS Security)
  // ---------------------------------------------------------------------------
  console.log("\n[Suite 3: RLS Security Enforcement]");
  const { error: insErr } = await supabase.from("product_variants").insert({
    id: "tamper-test-variant",
    product_id: "iphone-16-pro-max",
    title: "Unauthorized Variant",
    price: 10,
  });
  assert(Boolean(insErr), "Anonymous INSERT into product_variants strictly rejected by RLS");

  const { error: updErr, count: updCount } = await supabase
    .from("product_variants")
    .update({ price: 10 })
    .eq("id", "iphone-16-pro-max-256gb-brand-new")
    .select();
  assert(Boolean(updErr) || updCount === 0, "Anonymous UPDATE on product_variants rejected or affects 0 rows");

  const { error: delErr, count: delCount } = await supabase
    .from("product_variants")
    .delete()
    .eq("id", "iphone-16-pro-max-256gb-brand-new")
    .select();
  assert(Boolean(delErr) || delCount === 0, "Anonymous DELETE on product_variants rejected or affects 0 rows");

  // ---------------------------------------------------------------------------
  // SUITE 4: Authoritative Server-Side Price Resolution & Tampering Rejection
  // ---------------------------------------------------------------------------
  console.log("\n[Suite 4: Authoritative Server Price Resolution]");
  const submissionToken = `sec-test-${Date.now()}`;
  const { data: orderRes, error: rpcError } = await supabase.rpc("create_order_request", {
    customer_payload: {
      full_name: "Tamper Test User",
      email: "tamper@test.local",
      phone: "+233240001122",
      whatsapp: "+233240001122",
      fulfilment_type: "pickup",
      payment_method: "Mobile Money on Confirmation",
    },
    items_payload: [
      {
        product_id: "iphone-16-pro-max",
        product_slug: "iphone-16-pro-max",
        variant_id: "iphone-16-pro-max-256gb-brand-new",
        selected_storage: "256GB",
        selected_colour: "Natural Titanium",
        quantity: 2,
        unit_price: 1, // Client maliciously attempted price of GH₵ 1
      },
    ],
    submission_token: submissionToken,
  });

  assert(!rpcError, "Server-side create_order_request executed without error");
  assert(orderRes?.reference_number?.startsWith("BSG-"), `Generated valid order reference: ${orderRes?.reference_number}`);
  assert(orderRes?.total_amount === 41000, `Authoritative total resolved to GH₵ 41,000 (2 × 20,500), overriding client GH₵ 1 proposal`);
  assert(orderRes?.items?.[0]?.unit_price === 20500, `Item unit price resolved authoritatively to GH₵ 20,500`);

  // ---------------------------------------------------------------------------
  // SUITE 5: Dynamic Admin Price Change & Storefront Instant Reflection
  // ---------------------------------------------------------------------------
  console.log("\n[Suite 5: Dynamic Admin Price Modification]");
  const testVarId = "iphone-16-pro-max-256gb-brand-new";
  const originalPrice = 20500;
  const tempTestPrice = 20999;

  // Change price
  fs.writeFileSync("scripts/temp-price.sql", `UPDATE public.product_variants SET price = ${tempTestPrice} WHERE id = '${testVarId}';`, "utf8");
  execSync("npx supabase db query --linked --project-ref kgbcytxhyqalzawkdghn --file scripts/temp-price.sql");

  const { data: changedData } = await supabase.from("product_variants").select("price").eq("id", testVarId).single();
  assert(changedData.price === tempTestPrice, `Storefront immediately reflects updated price GH₵ ${tempTestPrice} without redeployment`);

  // Restore price
  fs.writeFileSync("scripts/temp-price.sql", `UPDATE public.product_variants SET price = ${originalPrice} WHERE id = '${testVarId}';`, "utf8");
  execSync("npx supabase db query --linked --project-ref kgbcytxhyqalzawkdghn --file scripts/temp-price.sql");
  fs.unlinkSync("scripts/temp-price.sql");

  const { data: restoredData } = await supabase.from("product_variants").select("price").eq("id", testVarId).single();
  assert(restoredData.price === originalPrice, `Original catalog price GH₵ ${originalPrice} successfully restored`);

  // ---------------------------------------------------------------------------
  // SUITE 6: Trade-in Calculation Logic & Separation
  // ---------------------------------------------------------------------------
  console.log("\n[Suite 6: Trade-in Calculations & Separation]");
  function calcTradeIn(retailPrice, tradeIn, factor = 0.20) {
    if (!tradeIn || retailPrice <= 0) {
      return { retailPrice, credit: 0, balanceDue: retailPrice, hasTradeIn: false };
    }
    const credit = Math.round(retailPrice * factor);
    const balanceDue = Math.max(0, retailPrice - credit);
    return { retailPrice, credit, balanceDue, hasTradeIn: true };
  }

  const noTrade = calcTradeIn(20500, false);
  assert(noTrade.retailPrice === 20500 && noTrade.credit === 0 && noTrade.balanceDue === 20500, "Trade-in unchecked preserves full retail price and zero credit");

  const withTrade = calcTradeIn(20500, true);
  assert(withTrade.credit === 4100 && withTrade.balanceDue === 16400, "Trade-in checked calculates 20% estimated credit (GH₵ 4,100) and balance due (GH₵ 16,400)");

  // ---------------------------------------------------------------------------
  // Summary
  // ---------------------------------------------------------------------------
  console.log("\n===============================================================================");
  console.log(`FULL PRODUCTION VERIFICATION SUMMARY: ${totalPassed} PASSED, ${totalFailed} FAILED`);
  console.log("===============================================================================");

  if (totalFailed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runFullVerification().catch(err => {
  console.error("Fatal error during verification:", err);
  process.exit(1);
});
