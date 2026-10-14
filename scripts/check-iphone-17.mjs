import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";

const envContent = fs.readFileSync(".env.local", "utf-8");
const urlMatch = envContent.match(/VITE_SUPABASE_URL=([^\r\n]+)/);
const keyMatch = envContent.match(/VITE_SUPABASE_ANON_KEY=([^\r\n]+)/);
const supabase = createClient(urlMatch[1].trim(), keyMatch[1].trim());

async function checkIPhone17() {
  const { data: prod, error } = await supabase
    .from("products")
    .select("*, product_variants(*)")
    .eq("id", "iphone-17-pro-max")
    .single();

  console.log("iPhone 17 Pro Max product:", {
    id: prod.id,
    name: prod.name,
    price: prod.price,
    previous_price: prod.previous_price,
    updated_at: prod.updated_at,
  });

  console.log("iPhone 17 Pro Max variants:", prod.product_variants.map(v => ({
    id: v.id,
    title: v.title,
    price: v.price,
    previous_price: v.previous_price,
    available: v.available,
    storage: v.storage,
    updated_at: v.updated_at,
  })));
}

checkIPhone17().catch(console.error);
