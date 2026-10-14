import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";

const envContent = fs.readFileSync(".env.local", "utf-8");
const urlMatch = envContent.match(/VITE_SUPABASE_URL=([^\r\n]+)/);
const keyMatch = envContent.match(/VITE_SUPABASE_ANON_KEY=([^\r\n]+)/);
const supabase = createClient(urlMatch[1].trim(), keyMatch[1].trim());

async function checkTables() {
  const tableNames = [
    "products",
    "product_variants",
    "orders",
    "order_items",
    "trade_in_requests",
    "device_requests",
    "contact_messages",
    "customer_reviews",
    "promotions",
    "site_settings",
    "homepage_content",
    "homepage_sections",
    "cms_content",
    "media_library",
    "repair_services",
  ];

  console.log("Checking Supabase tables availability...");
  for (const t of tableNames) {
    const { count, error } = await supabase.from(t).select("*", { count: "exact", head: true });
    if (error) {
      console.log(`Table '${t}': NOT FOUND or RLS blocked (${error.message})`);
    } else {
      console.log(`Table '${t}': EXISTS with ${count} rows`);
    }
  }
}

checkTables().catch(console.error);
