import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";

// Read .env.local
const envContent = fs.readFileSync(".env.local", "utf-8");
const urlMatch = envContent.match(/VITE_SUPABASE_URL=([^\r\n]+)/);
const keyMatch = envContent.match(/VITE_SUPABASE_ANON_KEY=([^\r\n]+)/);

const supabaseUrl = urlMatch ? urlMatch[1].trim() : "";
const supabaseAnonKey = keyMatch ? keyMatch[1].trim() : "";

console.log("Supabase URL:", supabaseUrl);
console.log("Supabase Anon Key present?", Boolean(supabaseAnonKey));

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  console.log("\n1. Testing 'products' select with anon key...");
  const { data: products, error: pErr } = await supabase
    .from("products")
    .select("id, name, slug, price, condition, stock_quantity, product_variants(*)")
    .limit(5);

  if (pErr) {
    console.error("Products error:", pErr);
  } else {
    console.log(`Successfully fetched ${products.length} products`);
    console.log("Sample product:", JSON.stringify(products[0], null, 2));
  }

  console.log("\n2. Testing total count of products in Supabase...");
  const { count: prodCount, error: countErr } = await supabase
    .from("products")
    .select("*", { count: "exact", head: true });
  console.log("Total products count in Supabase:", prodCount, "Error:", countErr);

  console.log("\n3. Testing total count of product_variants in Supabase...");
  const { count: varCount, error: varCountErr } = await supabase
    .from("product_variants")
    .select("*", { count: "exact", head: true });
  console.log("Total variants count in Supabase:", varCount, "Error:", varCountErr);
}

run().catch(console.error);
