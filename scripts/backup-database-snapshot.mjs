import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";
import path from "node:path";

const envContent = fs.readFileSync(".env.local", "utf-8");
const urlMatch = envContent.match(/VITE_SUPABASE_URL=([^\r\n]+)/);
const keyMatch = envContent.match(/VITE_SUPABASE_ANON_KEY=([^\r\n]+)/);

if (!urlMatch || !keyMatch) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabaseUrl = urlMatch[1].trim();
const supabaseKey = keyMatch[1].trim();
const supabase = createClient(supabaseUrl, supabaseKey);

async function createBackupSnapshot() {
  console.log(`Starting pre-migration database snapshot for ${supabaseUrl}...`);
  const backupDir = path.resolve("backups");
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const snapshotFile = path.join(backupDir, `snapshot_pre_migration_016_${timestamp}.json`);

  const tables = ["products", "product_variants", "orders", "order_items"];
  const snapshotData = {
    timestamp: new Date().toISOString(),
    supabaseUrl,
    projectRef: supabaseUrl.replace("https://", "").replace(".supabase.co", ""),
    tables: {},
  };

  for (const table of tables) {
    try {
      const { data, error, count } = await supabase
        .from(table)
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false });

      if (error) {
        console.warn(`Warning on table ${table}:`, error.message);
        snapshotData.tables[table] = { error: error.message, count: 0, rows: [] };
      } else {
        console.log(`Successfully backed up '${table}': ${data.length} rows.`);
        snapshotData.tables[table] = { count, rows: data };
      }
    } catch (err) {
      console.warn(`Exception on table ${table}:`, err.message);
      snapshotData.tables[table] = { error: err.message, count: 0, rows: [] };
    }
  }

  fs.writeFileSync(snapshotFile, JSON.stringify(snapshotData, null, 2), "utf-8");
  console.log(`Snapshot backup successfully written to: ${snapshotFile}`);
  console.log(`Products backed up: ${snapshotData.tables.products?.count || snapshotData.tables.products?.rows?.length}`);
  console.log(`Variants backed up: ${snapshotData.tables.product_variants?.count || snapshotData.tables.product_variants?.rows?.length}`);
}

createBackupSnapshot().catch(console.error);
