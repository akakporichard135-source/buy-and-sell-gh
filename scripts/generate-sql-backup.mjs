import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";
import path from "node:path";

const envContent = fs.readFileSync(".env.local", "utf-8");
const urlMatch = envContent.match(/VITE_SUPABASE_URL=([^\r\n]+)/);
const keyMatch = envContent.match(/VITE_SUPABASE_ANON_KEY=([^\r\n]+)/);

const supabaseUrl = urlMatch[1].trim();
const supabaseKey = keyMatch[1].trim();
const supabase = createClient(supabaseUrl, supabaseKey);

function sqlEscape(val) {
  if (val === null || val === undefined) return "NULL";
  if (typeof val === "boolean") return val ? "true" : "false";
  if (typeof val === "number") return String(val);
  if (Array.isArray(val)) {
    const items = val.map(v => typeof v === 'string' ? `"${v.replace(/"/g, '\\"')}"` : String(v));
    return `'{${items.join(",")}}'`;
  }
  if (typeof val === "object") {
    return `'${JSON.stringify(val).replace(/'/g, "''")}'::jsonb`;
  }
  return `'${String(val).replace(/'/g, "''")}'`;
}

async function generateRecoverableSqlBackup() {
  console.log("Generating full recoverable SQL backup for production database...");

  // 1. Fetch products
  const { data: products, error: pErr } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: true });

  if (pErr) throw new Error("Failed to fetch products: " + pErr.message);

  // 2. Fetch variants
  const { data: variants, error: vErr } = await supabase
    .from("product_variants")
    .select("*")
    .order("position", { ascending: true });

  if (vErr) throw new Error("Failed to fetch product_variants: " + vErr.message);

  const backupDir = path.resolve("backups");
  if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir, { recursive: true });

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const sqlFile = path.join(backupDir, `recoverable_database_backup_pre_016_${timestamp}.sql`);

  const lines = [
    "-- ==============================================================================",
    `-- RECOVERABLE PRODUCTION DATABASE BACKUP - BUY & SELL GH`,
    `-- Database: ${supabaseUrl}`,
    `-- Generated: ${new Date().toISOString()}`,
    `-- Records: ${products.length} Products, ${variants.length} Variants`,
    "-- ==============================================================================",
    "",
    "BEGIN;",
    "",
    "-- 1. RESTORE PRODUCTS",
  ];

  for (const p of products) {
    const cols = Object.keys(p);
    const colList = cols.map(c => `"${c}"`).join(", ");
    const valList = cols.map(c => sqlEscape(p[c])).join(", ");
    const updateList = cols
      .filter(c => c !== "id")
      .map(c => `"${c}" = EXCLUDED."${c}"`)
      .join(", ");

    lines.push(
      `INSERT INTO public.products (${colList}) VALUES (${valList}) ON CONFLICT ("id") DO UPDATE SET ${updateList};`
    );
  }

  lines.push("");
  lines.push("-- 2. RESTORE PRODUCT VARIANTS");

  for (const v of variants) {
    const cols = Object.keys(v);
    const colList = cols.map(c => `"${c}"`).join(", ");
    const valList = cols.map(c => sqlEscape(v[c])).join(", ");
    const updateList = cols
      .filter(c => c !== "id")
      .map(c => `"${c}" = EXCLUDED."${c}"`)
      .join(", ");

    lines.push(
      `INSERT INTO public.product_variants (${colList}) VALUES (${valList}) ON CONFLICT ("id") DO UPDATE SET ${updateList};`
    );
  }

  lines.push("");
  lines.push("COMMIT;");
  lines.push("");

  fs.writeFileSync(sqlFile, lines.join("\n"), "utf-8");
  console.log(`Recoverable SQL backup generated: ${sqlFile}`);
  console.log(`Total Products: ${products.length}`);
  console.log(`Total Variants: ${variants.length}`);
}

generateRecoverableSqlBackup().catch(console.error);
