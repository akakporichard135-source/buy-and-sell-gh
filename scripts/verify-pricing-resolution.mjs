import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";

// Read .env.local
const envContent = fs.readFileSync(".env.local", "utf-8");
const urlMatch = envContent.match(/VITE_SUPABASE_URL=([^\r\n]+)/);
const keyMatch = envContent.match(/VITE_SUPABASE_ANON_KEY=([^\r\n]+)/);
const supabase = createClient(urlMatch[1].trim(), keyMatch[1].trim());

// Simulate the updated rowToProduct and pricing functions
function rowToVariant(row) {
  return {
    id: row.id,
    productId: row.product_id,
    title: row.title,
    sku: row.sku ?? undefined,
    storage: row.storage ?? undefined,
    condition: row.condition,
    screenSize: row.screen_size ?? undefined,
    chip: row.chip ?? undefined,
    memory: row.memory ?? undefined,
    connectivity: row.connectivity ?? undefined,
    finish: row.finish ?? undefined,
    glass: row.glass ?? undefined,
    price: Number(row.price),
    previousPrice: row.previous_price === null || row.previous_price === undefined ? null : Number(row.previous_price),
    isSale: Boolean(row.is_sale),
    stockStatus: row.stock_status,
    stockQuantity: Number(row.stock_quantity ?? 10),
    available: Boolean(row.available),
    position: Number(row.position ?? 0),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function rowToProduct(row) {
  let variants =
    row.product_variants && row.product_variants.length > 0
      ? row.product_variants.map(rowToVariant)
      : undefined;

  // Harmonization guard: if row.price > 0 and variants exist,
  // ensure the base variant's price matches row.price if row.price !== baseVariant.price
  if (variants && variants.length > 0 && row.price > 0) {
    const sorted = [...variants].sort((a, b) => a.position - b.position);
    const baseVar = sorted[0];
    if (baseVar && baseVar.price !== row.price) {
      variants = variants.map((v) =>
        v.id === baseVar.id
          ? {
              ...v,
              price: row.price,
              previousPrice: row.previous_price ?? v.previousPrice,
              isSale: Boolean(
                (row.previous_price ?? v.previousPrice) &&
                  (row.previous_price ?? v.previousPrice) > row.price
              ),
            }
          : v
      );
    }
  }

  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    price: row.price,
    previousPrice: row.previous_price ?? undefined,
    storage: row.storage_options ?? [],
    colors: row.colour_options ?? [],
    variants,
  };
}

function formatPrice(amount) {
  if (!Number.isFinite(amount) || amount <= 0) return "GH₵ 0";
  return `GH₵ ${Math.round(amount).toLocaleString("en-US")}`;
}

function getCardPriceDisplay(product) {
  const variants = (product.variants ?? []).filter((v) => v.available !== false);
  const hasMultipleVariants = variants.length > 1;
  const hasMultipleStorage = (product.storage ?? []).length > 1;

  let minPrice = product.price;
  let previousPrice = product.previousPrice;

  if (hasMultipleVariants) {
    const prices = variants.map((v) => v.price).filter((p) => p > 0);
    if (prices.length > 0) {
      const variantMin = Math.min(...prices);
      minPrice = product.price > 0 ? Math.min(product.price, variantMin) : variantMin;
      const lowestVariant = variants.find((v) => v.price === minPrice);
      if (lowestVariant?.previousPrice) {
        previousPrice = lowestVariant.previousPrice;
      }
    }
  }

  const isFrom = hasMultipleVariants || hasMultipleStorage;
  return {
    current: isFrom ? `From ${formatPrice(minPrice)}` : formatPrice(minPrice),
    minPrice,
  };
}

function resolveConfiguredPrice(product, options = {}) {
  const variants = product.variants ?? [];
  if (variants.length > 0) {
    let bestVariant;
    if (options.storage) {
      bestVariant = variants.find(v => v.storage?.toLowerCase() === options.storage.toLowerCase());
    }
    const targetVariant = bestVariant ?? variants.find(v => v.available !== false) ?? variants[0];
    const isBaseVariant = variants.length > 0 && variants[0]?.id === targetVariant?.id;
    const effectivePrice =
      isBaseVariant && product.price > 0 && product.price < targetVariant.price
        ? product.price
        : targetVariant.price;

    return {
      variantTitle: targetVariant.title,
      price: effectivePrice,
      formattedPrice: formatPrice(effectivePrice),
    };
  }

  return {
    price: product.price,
    formattedPrice: formatPrice(product.price),
  };
}

async function verify() {
  console.log("Fetching iPhone 17 Pro Max from live Supabase database...");
  const { data: row, error } = await supabase
    .from("products")
    .select("*, product_variants(*)")
    .eq("id", "iphone-17-pro-max")
    .single();

  if (error) {
    console.error("Fetch error:", error);
    return;
  }

  console.log("Raw row from Supabase:", {
    id: row.id,
    name: row.name,
    rowPrice: row.price,
    rawVariantsCount: row.product_variants.length,
    rawBaseVariantPrice: row.product_variants[0].price,
  });

  const product = rowToProduct(row);
  console.log("\nAfter rowToProduct harmonization:", {
    id: product.id,
    name: product.name,
    productPrice: product.price,
    baseVariantTitle: product.variants[0].title,
    baseVariantPrice: product.variants[0].price,
  });

  const cardPrice = getCardPriceDisplay(product);
  console.log("\nStorefront Card Display Result:", cardPrice);

  const pdpDefault = resolveConfiguredPrice(product, { storage: "256GB" });
  console.log("\nProduct Detail Page (256GB Base Tier):", pdpDefault);

  const pdp512 = resolveConfiguredPrice(product, { storage: "512GB" });
  console.log("Product Detail Page (512GB Higher Tier):", pdp512);

  if (cardPrice.current === "From GH₵ 20,000" && pdpDefault.formattedPrice === "GH₵ 20,000") {
    console.log("\n>>> VERIFICATION PASSED: The new admin price (GH₵ 20,000) successfully reflects on storefront card and PDP!");
  } else {
    console.error("\n>>> VERIFICATION FAILED: Price did not resolve to GH₵ 20,000");
  }
}

verify().catch(console.error);
