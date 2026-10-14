import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";

const envContent = fs.readFileSync(".env.local", "utf-8");
const urlMatch = envContent.match(/VITE_SUPABASE_URL=([^\r\n]+)/);
const keyMatch = envContent.match(/VITE_SUPABASE_ANON_KEY=([^\r\n]+)/);

const supabaseUrl = urlMatch[1].trim();
const supabaseKey = keyMatch[1].trim();
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkCmsTables() {
  console.log(`Checking CMS tables status on project: ${supabaseUrl}`);
  const cmsTables = [
    "site_settings",
    "homepage_content",
    "media_library",
    "site_faqs",
    "page_content",
    "storefront_content"
  ];

  let allExist = true;
  for (const table of cmsTables) {
    const { data, error } = await supabase.from(table).select("*").limit(1);
    if (error) {
      console.log(`Table '${table}': NOT READY (${error.code}: ${error.message})`);
      allExist = false;
    } else {
      console.log(`Table '${table}': READY (accessible with public SELECT)`);
    }
  }

  if (allExist) {
    console.log("SUCCESS: All 6 CMS tables are active and responding in Supabase!");
  } else {
    console.log("PENDING: Migration 016 has not yet been executed in Supabase SQL Editor.");
  }
}

checkCmsTables().catch(console.error);
