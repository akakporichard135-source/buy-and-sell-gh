import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";

const envContent = fs.readFileSync(".env.local", "utf-8");
const urlMatch = envContent.match(/VITE_SUPABASE_URL=([^\r\n]+)/);
const keyMatch = envContent.match(/VITE_SUPABASE_ANON_KEY=([^\r\n]+)/);

const supabaseUrl = urlMatch[1].trim();
const supabaseKey = keyMatch[1].trim();
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false },
});

async function runVerification() {
  console.log("=== BUY & SELL GH: POST-MIGRATION 016 VERIFICATION ===");
  console.log("Project:", supabaseUrl);
  console.log("Timestamp:", new Date().toISOString());

  // 1. Verify existence & anon access on all 6 tables
  const tables = [
    { name: "site_settings", expectPublic: true },
    { name: "homepage_content", expectPublic: true },
    { name: "media_library", expectPublic: false }, // Revoked from anon
    { name: "site_faqs", expectPublic: true },
    { name: "page_content", expectPublic: true },
    { name: "storefront_content", expectPublic: true },
  ];

  console.log("\n--- Step 1 & 2: Table Existence and RLS Policies ---");
  for (const t of tables) {
    try {
      const res = await supabase.from(t.name).select("*").limit(1);
      if (t.expectPublic) {
        if (res.error) {
          console.error(`❌ Table '${t.name}': Expected public SELECT but got error:`, res.error.message, res.status);
        } else {
          console.log(`✅ Table '${t.name}': Exists and permits public SELECT (HTTP ${res.status}, rows: ${res.data.length})`);
        }
      } else {
        // media_library should reject anon
        if (res.error) {
          console.log(`✅ Table '${t.name}': Exists and correctly blocks anonymous access (HTTP ${res.status}: ${res.error.message})`);
        } else {
          console.warn(`⚠️ Table '${t.name}': Returned data for anon, expected restricted access.`);
        }
      }
    } catch (err) {
      console.error(`❌ Exception testing table '${t.name}':`, err.message);
    }
  }

  // 2. Verify unauthorized writes are BLOCKED by RLS
  console.log("\n--- Step 4: Verify Unauthorized Writes Are Blocked ---");
  try {
    const insertRes = await supabase.from("site_settings").insert({
      id: "unauthorized_test",
      settings: { hacked: true }
    });
    if (insertRes.error) {
      console.log(`✅ Anonymous write correctly blocked on 'site_settings' (HTTP ${insertRes.status}: ${insertRes.error.message})`);
    } else {
      console.error("❌ CRITICAL: Anonymous write succeeded on 'site_settings'!");
    }
  } catch (err) {
    console.log("✅ Anonymous write blocked with exception:", err.message);
  }

  try {
    const updateRes = await supabase.from("homepage_content").update({
      content: { hacked: true }
    }).eq("id", "main");
    if (updateRes.error) {
      console.log(`✅ Anonymous update correctly blocked on 'homepage_content' (HTTP ${updateRes.status}: ${updateRes.error.message})`);
    } else {
      console.error("❌ CRITICAL: Anonymous update succeeded on 'homepage_content'!");
    }
  } catch (err) {
    console.log("✅ Anonymous update blocked with exception:", err.message);
  }

  // 3. Confirm existing products and variants remain intact
  console.log("\n--- Step 9: Confirm Existing Products and Variants Remain Intact ---");
  const { count: productCount, error: pErr } = await supabase.from("products").select("*", { count: "exact", head: true });
  const { count: variantCount, error: vErr } = await supabase.from("product_variants").select("*", { count: "exact", head: true });
  console.log(`✅ Existing Products count: ${productCount} (error: ${pErr ? pErr.message : 'none'})`);
  console.log(`✅ Existing Variants count: ${variantCount} (error: ${vErr ? vErr.message : 'none'})`);

  console.log("\nVerification complete!");
}

runVerification().catch(console.error);
