import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";

const envContent = fs.readFileSync(".env.local", "utf-8");
const urlMatch = envContent.match(/VITE_SUPABASE_URL=([^\r\n]+)/);
const keyMatch = envContent.match(/VITE_SUPABASE_ANON_KEY=([^\r\n]+)/);
const supabase = createClient(urlMatch[1].trim(), keyMatch[1].trim());

async function checkRecent() {
  console.log("=== CHECKING RECENTLY UPDATED PRODUCTS IN SUPABASE ===");
  const { data: prods, error: pErr } = await supabase
    .from("products")
    .select("id, name, slug, price, previous_price, updated_at")
    .order("updated_at", { ascending: false })
    .limit(10);

  if (pErr) console.error("Error products:", pErr);
  else console.log("Recent products in Supabase:", prods);

  console.log("\n=== CHECKING RECENTLY UPDATED VARIANTS IN SUPABASE ===");
  const { data: vars, error: vErr } = await supabase
    .from("product_variants")
    .select("id, product_id, title, price, previous_price, updated_at")
    .order("updated_at", { ascending: false })
    .limit(10);

  if (vErr) console.error("Error variants:", vErr);
  else console.log("Recent variants in Supabase:", vars);
}

checkRecent().catch(console.error);
