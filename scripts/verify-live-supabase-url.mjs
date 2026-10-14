import fs from "node:fs";

async function checkLiveProject() {
  const envContent = fs.readFileSync(".env.local", "utf-8");
  const localUrl = envContent.match(/VITE_SUPABASE_URL=([^\r\n]+)/)?.[1]?.trim();
  console.log(".env.local VITE_SUPABASE_URL:", localUrl);

  const rProd = await fetch("https://buyandsellgh.com", { cache: "no-store" });
  const htmlProd = await rProd.text();
  const scriptMatchProd = htmlProd.match(/src="(\/assets\/index-[^"]+\.js)"/);
  
  if (scriptMatchProd) {
    const jsUrl = "https://buyandsellgh.com" + scriptMatchProd[1];
    const jsRes = await fetch(jsUrl);
    const jsCode = await jsRes.text();
    const supabaseMatch = jsCode.match(/https:\/\/[a-z0-9]+\.supabase\.co/g);
    console.log("buyandsellgh.com live bundle Supabase URL:", Array.from(new Set(supabaseMatch || [])));
  }

  const rAdmin = await fetch("https://admin.buyandsellgh.com", { cache: "no-store" });
  const htmlAdmin = await rAdmin.text();
  const scriptMatchAdmin = htmlAdmin.match(/src="(\/assets\/index-[^"]+\.js)"/);
  
  if (scriptMatchAdmin) {
    const jsUrl = "https://admin.buyandsellgh.com" + scriptMatchAdmin[1];
    const jsRes = await fetch(jsUrl);
    const jsCode = await jsRes.text();
    const supabaseMatch = jsCode.match(/https:\/\/[a-z0-9]+\.supabase\.co/g);
    console.log("admin.buyandsellgh.com live bundle Supabase URL:", Array.from(new Set(supabaseMatch || [])));
  }
}

checkLiveProject().catch(console.error);
