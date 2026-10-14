import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import esbuild from "esbuild";

async function verify() {
  const projectRoot = process.cwd();
  const outdir = path.join(projectRoot, "scripts/.test-build");
  if (!fs.existsSync(outdir)) fs.mkdirSync(outdir, { recursive: true });

  const bundle = async (entry, outfile) => {
    await esbuild.build({
      entryPoints: [entry],
      bundle: true,
      format: "esm",
      platform: "node",
      outfile,
      packages: "external",
      loader: {
        ".png": "dataurl",
        ".jpg": "dataurl",
        ".jpeg": "dataurl",
        ".webp": "dataurl",
        ".svg": "dataurl",
      },
    });
    return import(`file:///${outfile.replace(/\\/g, "/")}`);
  };

  const productImages = await bundle(path.join(projectRoot, "src/utils/productImages.ts"), path.join(outdir, "verify-images.mjs"));
  const productCatalog = await bundle(path.join(projectRoot, "src/catalog/productCatalog.ts"), path.join(outdir, "verify-catalog.mjs"));
  const cart = await bundle(path.join(projectRoot, "src/context/cartOperations.ts"), path.join(outdir, "verify-cart.mjs"));
  const productsModule = await bundle(path.join(projectRoot, "src/data/products.ts"), path.join(outdir, "verify-products.mjs"));

  const allProducts = productCatalog.seedCatalog;
  console.log(`Total catalogue products inspected: ${allProducts.length}`);

  let eligibleCount = 0;
  let missingCount = 0;
  let usedMissingCount = 0;
  let accessoryMissingCount = 0;
  let missingVariantsCount = 0;
  let eligibleVariantsCount = 0;

  const missingList = [];
  const eligibleList = [];

  for (const p of allProducts) {
    const isEligible = productImages.isProductImageEligible(p);
    const variants = p.variants || [];
    if (isEligible) {
      eligibleCount++;
      eligibleVariantsCount += variants.length;
      eligibleList.push(p.id);
    } else {
      missingCount++;
      missingVariantsCount += variants.length;
      missingList.push(p.id);
      if (p.condition !== "Brand New") {
        usedMissingCount++;
      } else {
        accessoryMissingCount++;
      }
    }
  }

  console.log(`Eligible (Approved) Products: ${eligibleCount} (${eligibleVariantsCount} variants)`);
  console.log(`Missing Image (Hidden) Products: ${missingCount} (${missingVariantsCount} variants)`);
  console.log(` - Used devices needing real photos: ${usedMissingCount}`);
  console.log(` - Brand new accessories missing clean assets: ${accessoryMissingCount}`);

  assert.equal(allProducts.length, 113, "Catalog has 113 total products");
  assert.equal(eligibleCount, 60, "Exactly 60 products are approved and image-eligible");
  assert.equal(missingCount, 53, "Exactly 53 products are hidden due to missing images");
  assert.equal(usedMissingCount, 44, "Exactly 44 used devices hidden");
  assert.equal(accessoryMissingCount, 9, "Exactly 9 accessories hidden");
  assert.equal(missingVariantsCount, 120, "Exactly 120 variants affected");
  assert.equal(eligibleVariantsCount, 153, "Exactly 153 variants visible");

  // Verify purchasability & cart safety for all 53 hidden products
  for (const p of allProducts) {
    const isEligible = productImages.isProductImageEligible(p);
    const purchasable = productCatalog.isProductPurchasable(p);
    if (!isEligible) {
      assert.equal(purchasable, false, `Hidden product ${p.id} must NOT be purchasable`);
      const cartAfter = cart.addCartItem([], p, p.storage?.[0], p.colors?.[0]);
      assert.equal(cartAfter.length, 0, `Hidden product ${p.id} must NOT be added to cart`);
    }
  }

  console.log("\nALL PRE-DEPLOYMENT VERIFICATION CHECKS PASSED PERFECTLY!");
}

verify().catch((err) => {
  console.error("Verification failed:", err);
  process.exit(1);
});
