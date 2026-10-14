import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";

const env = fs.readFileSync(".env.local", "utf-8");
const url = env.match(/VITE_SUPABASE_URL=([^\r\n]+)/)[1].trim();
const key = env.match(/VITE_SUPABASE_ANON_KEY=([^\r\n]+)/)[1].trim();
const supabase = createClient(url, key);

async function inspectStorage() {
  console.log("Checking storage for URL:", url);
  try {
    const { data: rootItems, error: rErr } = await supabase.storage.from("product-images").list("");
    if (rErr) {
      console.error("Error listing root:", rErr);
    } else {
      console.log(`Found ${rootItems.length} items in root of product-images:`);
      for (const item of rootItems) {
        console.log(` - ${item.name} (${item.id ? 'file' : 'folder/item'})`);
        if (!item.id) {
          // It could be a folder, let's list inside
          const { data: subItems, error: sErr } = await supabase.storage.from("product-images").list(item.name);
          if (!sErr && subItems) {
            console.log(`   contains ${subItems.length} sub-items:`);
            subItems.forEach(s => console.log(`     * ${s.name}`));
          }
        }
      }
    }
  } catch (err) {
    console.error("Exception:", err);
  }
}

inspectStorage();
