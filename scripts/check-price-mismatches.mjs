import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";

const envContent = fs.readFileSync(".env.local", "utf-8");
const urlMatch = envContent.match(/VITE_SUPABASE_URL=([^\r\n]+)/);
const keyMatch = envContent.match(/VITE_SUPABASE_ANON_KEY=([^\r\n]+)/);
const supabase = createClient(urlMatch[1].trim(), keyMatch[1].trim());

async function checkRelationships() {
  const { data: prods } = await supabase
    .from("products")
    .select("id, name, price, product_variants(id, title, price, position)")
    .order("name");

  console.log("Total products:", prods.length);
  const withVariants = prods.filter(p => p.product_variants && p.product_variants.length > 0);
  console.log("Products with variants:", withVariants.length);
  const withoutVariants = prods.filter(p => !p.product_variants || p.product_variants.length === 0);
  console.log("Products without variants:", withoutVariants.length);

  // Compare base price vs min variant price
  const mismatches = [];
  for (const p of withVariants) {
    const minVarPrice = Math.min(...p.product_variants.map(v => v.price));
    if (p.price !== minVarPrice) {
      mismatches.push({
        name: p.name,
        basePrice: p.price,
        minVarPrice: minVarPrice,
        variantCount: p.product_variants.length,
        firstVariant: p.product_variants[0],
      });
    }
  }

  console.log("Products where base price !== min variant price:", mismatches.length);
  console.log("Mismatches sample:", JSON.stringify(mismatches.slice(0, 10), null, 2));
}

checkRelationships().catch(console.error);
