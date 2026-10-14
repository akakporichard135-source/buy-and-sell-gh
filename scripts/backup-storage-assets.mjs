import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";
import path from "node:path";

const env = fs.readFileSync(".env.local", "utf-8");
const url = env.match(/VITE_SUPABASE_URL=([^\r\n]+)/)[1].trim();
const key = env.match(/VITE_SUPABASE_ANON_KEY=([^\r\n]+)/)[1].trim();
const supabase = createClient(url, key);

async function backupStorage() {
  const backupDir = path.resolve("backups", "storage", "product-images", "product-1788245444836");
  fs.mkdirSync(backupDir, { recursive: true });

  const filePath = "product-1788245444836/1788245550304-iphone-16-pro-png.jpg";
  console.log("Downloading storage asset:", filePath);

  const { data, error } = await supabase.storage.from("product-images").download(filePath);
  if (error) {
    console.error("Failed to download:", error.message);
    return;
  }

  const arrayBuffer = await data.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const targetFile = path.join(backupDir, "1788245550304-iphone-16-pro-png.jpg");
  fs.writeFileSync(targetFile, buffer);

  console.log(`Successfully backed up storage asset to: ${targetFile} (${buffer.length} bytes)`);
}

backupStorage();
