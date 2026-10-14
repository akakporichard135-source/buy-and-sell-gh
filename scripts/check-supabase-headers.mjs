import fs from "node:fs";

const envContent = fs.readFileSync(".env.local", "utf-8");
const urlMatch = envContent.match(/VITE_SUPABASE_URL=([^\r\n]+)/);
const keyMatch = envContent.match(/VITE_SUPABASE_ANON_KEY=([^\r\n]+)/);

const url = `${urlMatch[1].trim()}/rest/v1/products?select=*%2Cproduct_variants%28*%29&order=created_at.desc`;
const res = await fetch(url, {
  headers: {
    apikey: keyMatch[1].trim(),
    Authorization: `Bearer ${keyMatch[1].trim()}`,
  },
});

console.log("Supabase response status:", res.status);
console.log("Supabase headers:");
for (const [k, v] of res.headers.entries()) {
  if (k.toLowerCase().includes("cache") || k.toLowerCase().includes("etag") || k.toLowerCase().includes("age")) {
    console.log(`  ${k}: ${v}`);
  }
}
