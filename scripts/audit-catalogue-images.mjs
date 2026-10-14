import path from "node:path";
import { mkdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { pathToFileURL } from "node:url";
import { build } from "esbuild";

const outdir = path.join(tmpdir(), `buyandsell-audit-${Date.now()}`);
await mkdir(outdir, { recursive: true });

try {
  const outfile = path.join(outdir, "catalogAudit.mjs");
  await build({
    bundle: true,
    entryPoints: [path.resolve("src/catalog/productCatalog.ts")],
    define: {
      "import.meta.env": "{}",
      "import.meta.env.DEV": "true",
      "import.meta.env.PROD": "false",
      "import.meta.env.VITE_SUPABASE_ANON_KEY": '""',
      "import.meta.env.VITE_SUPABASE_PRODUCT_IMAGES_BUCKET": '"product-images"',
      "import.meta.env.VITE_SUPABASE_URL": '""',
    },
    format: "esm",
    loader: { ".webp": "file" },
    outfile,
    platform: "node",
  });

  const catalogModule = await import(pathToFileURL(outfile).href);
  const { seedCatalog, categories } = catalogModule;

  const imagesOutfile = path.join(outdir, "imagesAudit.mjs");
  await build({
    bundle: true,
    entryPoints: [path.resolve("src/utils/productImages.ts")],
    define: {
      "import.meta.env": "{}",
      "import.meta.env.DEV": "true",
      "import.meta.env.PROD": "false",
    },
    format: "esm",
    loader: { ".webp": "file" },
    outfile: imagesOutfile,
    platform: "node",
  });
  const imagesModule = await import(pathToFileURL(imagesOutfile).href);
  const {
    resolveProductImage,
    resolveAdminProductImage,
    resolveProductGallery,
    requiresRealProductPhotos,
    isUsedProductCondition,
    isValidProductImage,
    hasOwnerUploadedProductImages,
  } = imagesModule;

  console.log(`Total seed products in catalogue: ${seedCatalog.length}`);
  console.log(`Categories: ${categories.join(", ")}\n`);

  const auditResults = [];
  const missingImages = [];
  const validImages = [];

  for (const product of seedCatalog) {
    const storefrontGallery = resolveProductGallery(product, { allowRepresentativeForUsed: false });
    const storefrontPrimary = resolveProductImage(product, { allowRepresentativeForUsed: false });
    const adminGallery = resolveProductGallery(product, { allowRepresentativeForUsed: true });
    const adminPrimary = resolveAdminProductImage(product);
    const needsRealPhotos = requiresRealProductPhotos(product);

    const hasStorefrontValidImage = Boolean(storefrontPrimary?.src && isValidProductImage(storefrontPrimary));
    const hasAdminValidImage = Boolean(adminPrimary?.src && isValidProductImage(adminPrimary));

    const item = {
      id: product.id,
      slug: product.slug,
      name: product.name,
      category: product.category,
      condition: product.condition,
      price: product.price,
      stockStatus: product.stockStatus,
      stockQuantity: product.stockQuantity,
      variantsCount: product.variants?.length || 0,
      rawImagesCount: product.images?.length || 0,
      storefrontImage: storefrontPrimary?.src || null,
      adminImage: adminPrimary?.src || null,
      hasStorefrontValidImage,
      hasAdminValidImage,
      needsRealPhotos,
    };

    auditResults.push(item);
    if (!hasStorefrontValidImage) {
      missingImages.push(item);
    } else {
      validImages.push(item);
    }
  }

  console.log(`=== AUDIT SUMMARY ===`);
  console.log(`Total products: ${auditResults.length}`);
  console.log(`Products with valid storefront image: ${validImages.length}`);
  console.log(`Products WITHOUT valid storefront image: ${missingImages.length}\n`);

  console.log(`=== PRODUCTS MISSING VALID STOREFRONT IMAGE (${missingImages.length}) ===`);
  for (const p of missingImages) {
    console.log(`- [${p.id}] ${p.name} (${p.category}, ${p.condition})`);
    console.log(`  Slug: ${p.slug}`);
    console.log(`  Price: GH₵${p.price}, Stock: ${p.stockStatus} (${p.stockQuantity}), Variants: ${p.variantsCount}`);
    console.log(`  Storefront Image: ${p.storefrontImage}`);
    console.log(`  Admin Image: ${p.adminImage}`);
    console.log(`  Needs Real Used Photos: ${p.needsRealPhotos}`);
    console.log(``);
  }

  // Also check if any products have invalid admin images
  const missingAdminImages = auditResults.filter((p) => !p.hasAdminValidImage);
  console.log(`=== PRODUCTS MISSING VALID ADMIN IMAGE: ${missingAdminImages.length} ===`);
  for (const p of missingAdminImages) {
    console.log(`- [${p.id}] ${p.name} (Admin Image: ${p.adminImage})`);
  }

  // Breakdown by category
  const categoryStats = {};
  for (const p of auditResults) {
    if (!categoryStats[p.category]) {
      categoryStats[p.category] = { total: 0, valid: 0, missing: 0 };
    }
    categoryStats[p.category].total += 1;
    if (p.hasStorefrontValidImage) {
      categoryStats[p.category].valid += 1;
    } else {
      categoryStats[p.category].missing += 1;
    }
  }
  console.log("\n=== CATEGORY BREAKDOWN ===");
  console.table(categoryStats);

  // Write full audit dump to file
  const fs = await import("node:fs");
  fs.writeFileSync("scripts/missing-products-audit.json", JSON.stringify({
    totalProducts: auditResults.length,
    validProductsCount: validImages.length,
    missingImagesCount: missingImages.length,
    missingProducts: missingImages,
    validProducts: validImages,
    categoryStats,
  }, null, 2));
  console.log("\nWrote full audit to scripts/missing-products-audit.json");
} finally {
  await rm(outdir, { recursive: true, force: true });
}
