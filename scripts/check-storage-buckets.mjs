import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";

const envContent = fs.readFileSync(".env.local", "utf-8");
const urlMatch = envContent.match(/VITE_SUPABASE_URL=([^\r\n]+)/);
const keyMatch = envContent.match(/VITE_SUPABASE_ANON_KEY=([^\r\n]+)/);
const supabase = createClient(urlMatch[1].trim(), keyMatch[1].trim());

async function checkBuckets() {
  console.log("Checking storage buckets with anon key...");
  const { data: buckets, error } = await supabase.storage.listBuckets();
  if (error) {
    console.error("List buckets error:", error);
  } else {
    console.log("Storage buckets:", buckets.map(b => ({ id: b.id, name: b.name, public: b.public })));
  }

  // Check product-images bucket listing
  const { data: files, error: fErr } = await supabase.storage.from("product-images").list("", { limit: 10 });
  if (fErr) {
    console.error("product-images list error:", fErr);
  } else {
    console.log("product-images root items:", files);
  }
}

checkBuckets().catch(console.error);
