import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { tmpdir } from "node:os";
import { pathToFileURL } from "node:url";
import { build } from "esbuild";
import { createClient } from "@supabase/supabase-js";

const standaloneBundle = async (entry, outfile, platform = "node") => {
  await build({
    bundle: true,
    entryPoints: [entry],
    define: {
      "import.meta.env": "{}",
      "import.meta.env.DEV": "true",
      "import.meta.env.PROD": "false",
      "import.meta.env.VITE_SUPABASE_ANON_KEY": "\"\"",
      "import.meta.env.VITE_SUPABASE_PRODUCT_IMAGES_BUCKET": "\"product-images\"",
      "import.meta.env.VITE_SUPABASE_URL": "\"\"",
    },
    format: "esm",
    loader: { ".webp": "file", ".png": "file", ".jpg": "file", ".jpeg": "file", ".svg": "file" },
    outfile,
    platform,
  });
  return import(pathToFileURL(outfile).href);
};

export async function testLivePublishingAndRealtimePromotions(
  projectRoot = process.cwd(),
  bundle = standaloneBundle,
  outdir = path.join(tmpdir(), `promo-live-test-${Date.now()}`)
) {
  await fs.mkdir(outdir, { recursive: true });

  // 1. Inspect Supabase Environment Credentials
  const envContent = await fs.readFile(path.join(projectRoot, ".env.local"), "utf8");
  const urlMatch = envContent.match(/VITE_SUPABASE_URL\s*=\s*(.+)/);
  const keyMatch = envContent.match(/VITE_SUPABASE_ANON_KEY\s*=\s*(.+)/);
  assert.ok(urlMatch && keyMatch, "Supabase environment keys must be present in .env.local");

  const supabaseUrl = urlMatch[1].trim();
  const supabaseAnonKey = keyMatch[1].trim();
  const client = createClient(supabaseUrl, supabaseAnonKey);

  // 2. Query Production Supabase Promotions Table via Public Anon Client
  const { data: publicPromos, error: fetchErr } = await client
    .from("promotions")
    .select("*")
    .eq("is_enabled", true)
    .eq("status", "active");

  assert.equal(fetchErr, null, `Public anon fetch must succeed without 42501 or PGRST205 errors: ${fetchErr?.message}`);
  assert.ok(Array.isArray(publicPromos) && publicPromos.length > 0, "Public promotions must return active records");

  // 3. Verify the PS5 Campaign in Production Supabase
  const ps5Campaign = publicPromos.find((p) => p.id === "promo-ps5-slim-combo-offer");
  assert.ok(ps5Campaign, "PS5 Slim Combo Offer must be present in active promotions");
  assert.equal(ps5Campaign.title, "One-Time PlayStation Combo Offer");
  assert.equal(ps5Campaign.status, "active", "PS5 campaign must have active publication status");
  assert.equal(ps5Campaign.is_enabled, true, "PS5 campaign must be enabled");
  assert.equal(ps5Campaign.promotional_price, 7500, "Bundle price must be GH₵7,500");
  assert.ok(
    Array.isArray(ps5Campaign.bundle_required_product_ids) &&
    ps5Campaign.bundle_required_product_ids.includes("ps5-slim-combo-offer"),
    "Bundle must target ps5-slim-combo-offer"
  );
  assert.ok(
    ps5Campaign.desktop_flyer_url &&
    (ps5Campaign.desktop_flyer_url.includes("ps5-combo-offer-flyer") || ps5Campaign.desktop_flyer_url.includes("ps5-combo-offer-limited-time")),
    "PS5 campaign desktop flyer URL must point to verified flyer"
  );
  assert.equal(ps5Campaign.show_on_homepage_carousel, true, "Must appear on homepage carousel");
  assert.equal(ps5Campaign.show_on_announcement_bar, true, "Must appear on announcement bar");
  assert.equal(ps5Campaign.show_on_offers_page, true, "Must appear on offers page");
  assert.equal(ps5Campaign.cta_destination, "/product/ps5-slim-combo-offer");

  // 4. Verify Canonical Product in Production Supabase
  const { data: ps5Prod, error: prodErr } = await client
    .from("products")
    .select("*")
    .eq("id", "ps5-slim-combo-offer")
    .single();

  assert.equal(prodErr, null, `Product ps5-slim-combo-offer must exist in Supabase: ${prodErr?.message}`);
  assert.equal(ps5Prod.price, 7500, "Product price must be GH₵7,500");
  assert.equal(ps5Prod.stock_quantity, 1, "Stock quantity must be confirmed 1");
  assert.equal(ps5Prod.stock_status, "In Stock", "Stock status must be In Stock");
  assert.equal(ps5Prod.available, true, "Product must be available for purchase");
  assert.equal(ps5Prod.archived, false, "Product must not be archived");
  assert.ok(Array.isArray(ps5Prod.included_items) && ps5Prod.included_items.length >= 3, "Product must list 3 included items");

  // 5. Verify RLS Write Protection (Anon cannot mutate or insert promotions)
  const { data: updateData } = await client
    .from("promotions")
    .update({ title: "Unauthorized Edit" })
    .eq("id", "promo-ps5-slim-combo-offer")
    .select();
  assert.equal(updateData?.length, 0, "Anonymous client must not be able to update promotions");

  const { error: insertErr } = await client
    .from("promotions")
    .insert({ id: "hacked-promo", title: "Hacked", slug: "hacked", promotion_type: "bundle" });
  assert.ok(insertErr, "Anonymous client must be rejected with RLS violation when inserting");

  // 6. Verify Frontend Repository Code Integrity
  const repoSource = await fs.readFile(
    path.join(projectRoot, "src/promotions/supabasePromotionsRepository.ts"),
    "utf8"
  );
  assert.match(repoSource, /promotions-realtime-sync/, "Repository must configure realtime sync channel");
  assert.match(repoSource, /postgres_changes/, "Repository must listen to postgres_changes");
  assert.match(repoSource, /throw new Error\(`Database error saving promotion/, "Save promotion must never swallow errors");

  // 7. Verify Cart Context Realtime Refresh
  const cartContextSource = await fs.readFile(
    path.join(projectRoot, "src/context/CartContext.tsx"),
    "utf8"
  );
  assert.match(cartContextSource, /refreshPromotions/, "CartContext must expose refreshPromotions");

  // 8. Typography Safeguards
  const filesToCheck = [
    "src/promotions/supabasePromotionsRepository.ts",
    "src/context/CartContext.tsx",
    "src/pages/OffersPage.tsx",
    "src/components/promotions/HomepagePromotionalCarousel.tsx",
    "src/components/promotions/PromotionalAnnouncementBar.tsx",
  ];
  for (const f of filesToCheck) {
    const src = await fs.readFile(path.join(projectRoot, f), "utf8");
    assert.equal(src.includes("overflow-wrap: anywhere"), false, `${f} must not contain overflow-wrap: anywhere;`);
  }

  console.log("Live publishing and realtime promotions test suite passed successfully!");
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  testLivePublishingAndRealtimePromotions().catch((err) => {
    console.error("Test failed:", err);
    process.exit(1);
  });
}
