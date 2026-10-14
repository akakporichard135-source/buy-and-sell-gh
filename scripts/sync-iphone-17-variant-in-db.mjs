import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";

const envContent = fs.readFileSync(".env.local", "utf-8");
const urlMatch = envContent.match(/VITE_SUPABASE_URL=([^\r\n]+)/);
const keyMatch = envContent.match(/VITE_SUPABASE_ANON_KEY=([^\r\n]+)/);
const emailMatch = envContent.match(/VITE_LOCAL_ADMIN_EMAIL="([^"]+)"/);
const passMatch = envContent.match(/VITE_LOCAL_ADMIN_PASSWORD="([^"]+)"/);

const supabase = createClient(urlMatch[1].trim(), keyMatch[1].trim());

async function syncDbVariant() {
  console.log("Signing in as admin to sync iPhone 17 Pro Max variant in Supabase...");
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: emailMatch[1].trim(),
    password: passMatch[1].trim(),
  });

  if (authError) {
    console.error("Auth error:", authError);
    return;
  }

  console.log("Admin logged in successfully! UID:", authData.user.id);

  // Update variant iphone-17-pro-max-256gb-brand-new to price 20000
  const { data: updateData, error: updateError } = await supabase
    .from("product_variants")
    .update({
      price: 20000,
      updated_at: new Date().toISOString(),
    })
    .eq("id", "iphone-17-pro-max-256gb-brand-new")
    .select("*")
    .single();

  if (updateError) {
    console.error("Update error:", updateError);
    return;
  }

  console.log("Successfully updated variant in Supabase:", {
    id: updateData.id,
    title: updateData.title,
    price: updateData.price,
    updated_at: updateData.updated_at,
  });
}

syncDbVariant().catch(console.error);
