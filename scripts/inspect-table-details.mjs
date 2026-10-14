import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";

const envContent = fs.readFileSync(".env.local", "utf-8");
const urlMatch = envContent.match(/VITE_SUPABASE_URL=([^\r\n]+)/);
const keyMatch = envContent.match(/VITE_SUPABASE_ANON_KEY=([^\r\n]+)/);
const supabase = createClient(urlMatch[1].trim(), keyMatch[1].trim());

async function inspectTables() {
  const tableNames = [
    "trade_in_requests",
    "device_requests",
    "contact_messages",
    "customer_reviews",
    "promotions",
    "site_settings",
    "homepage_content",
    "media_library",
    "repair_services",
    "cms_content"
  ];

  for (const t of tableNames) {
    const { data, error } = await supabase.from(t).select("*").limit(2);
    if (error) {
      console.log(`[${t}] Error: code=${error.code}, msg=${error.message}`);
    } else {
      console.log(`[${t}] Success: rows=${data.length}, sample=${JSON.stringify(data[0] || null)}`);
    }
  }
}

inspectTables().catch(console.error);
