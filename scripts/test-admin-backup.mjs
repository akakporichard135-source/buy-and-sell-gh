import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";

const envContent = fs.readFileSync(".env.local", "utf-8");
const urlMatch = envContent.match(/VITE_SUPABASE_URL=([^\r\n]+)/);
const keyMatch = envContent.match(/VITE_SUPABASE_ANON_KEY=([^\r\n]+)/);
const emailMatch = envContent.match(/VITE_LOCAL_ADMIN_EMAIL="([^"]+)"/);
const passMatch = envContent.match(/VITE_LOCAL_ADMIN_PASSWORD="([^"]+)"/);

const supabase = createClient(urlMatch[1].trim(), keyMatch[1].trim());

async function run() {
  const email = emailMatch[1].trim();
  const password = passMatch[1].trim();
  console.log("Attempting sign-in with:", email);

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.log("Sign-in response:", error.message);
  } else {
    console.log("Sign-in SUCCESS. User ID:", data.user.id);
    const { data: profiles, error: pErr } = await supabase.from("admin_profiles").select("*");
    console.log("admin_profiles:", pErr ? pErr.message : profiles);
  }
}

run().catch(console.error);
