import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { tmpdir } from "node:os";
import { pathToFileURL } from "node:url";
import { build } from "esbuild";

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

export async function testPromotionsEditorAndAdminText(
  projectRoot = process.cwd(),
  bundle = standaloneBundle,
  outdir = path.join(tmpdir(), `promo-editor-test-${Date.now()}`)
) {
  await fs.mkdir(outdir, { recursive: true });

  // 1. Audit src/pages/admin/AdminPromotionsPage.tsx
  const promoPageCode = await fs.readFile(path.join(projectRoot, "src/pages/admin/AdminPromotionsPage.tsx"), "utf8");

  // Verify neutral defaults (Issue 1)
  assert.ok(
    promoPageCode.includes('price: 0') && !promoPageCode.includes('price: 7500,\n    stockQuantity: 1,'),
    "AdminPromotionsPage newProductData must default to price 0, not 7500"
  );
  assert.ok(
    promoPageCode.includes('const [bundleItems, setBundleItems] = useState<BundleItem[]>([]);'),
    "AdminPromotionsPage bundleItems must default to an empty array []"
  );

  // Verify handleOpenCreate clean state (Issue 1)
  assert.ok(
    promoPageCode.includes('setProductMode("existing");') && promoPageCode.includes('promotionType: "percentage_discount"'),
    "handleOpenCreate must default to existing product mode and percentage discount without forcing a bundle"
  );
  assert.ok(
    !promoPageCode.includes('desktopFlyerUrl: "/products/campaigns/ps5-slim-combo-desktop.webp",\n      mobileFlyerUrl: "/products/campaigns/ps5-slim-combo-mobile.webp",\n      ctaText: "Explore Offer"'),
    "handleOpenCreate must not hardcode PS5 flyer URLs"
  );

  // Verify type switching logic resets bundle state
  assert.ok(
    promoPageCode.includes('if (nextType === "bundle") {') && promoPageCode.includes('setProductMode("existing");\n                              setBundleItems([]);'),
    "Switching away from bundle in Step 2 must reset productMode to existing and clear bundleItems"
  );

  // Verify dedicated Discount Scope & Qualifying Products in Step 3
  assert.ok(
    promoPageCode.includes("Qualifying Products &amp; Discount Scope"),
    "Step 3 must render dedicated Qualifying Products & Discount Scope for discounts"
  );
  assert.ok(
    promoPageCode.includes("Storewide (All Products)") && promoPageCode.includes("By Category") && promoPageCode.includes("Specific Products"),
    "Step 3 discount scope must provide Storewide, By Category, and Specific Products options"
  );

  // Verify canonical product saving is restricted to bundle
  assert.ok(
    promoPageCode.includes('const isBundle = editingCampaign.promotionType === "bundle";') &&
    promoPageCode.includes('if (isBundle && productMode === "new_bundle" && newProductData.name.trim())'),
    "Canonical product saving must be strictly restricted to bundle campaigns"
  );

  // Verify toolbar layout (Issue 2)
  assert.ok(
    promoPageCode.includes('min-w-max') && promoPageCode.includes('shrink-0 whitespace-nowrap px-4 py-2.5 text-xs font-semibold rounded-xl'),
    "Promotions campaign tabs must have dedicated min-w-max row and shrink-0 whitespace-nowrap buttons"
  );
  assert.ok(
    promoPageCode.includes('shrink-0 inline-flex items-center justify-center min-w-[20px]'),
    "Campaign count badges must have shrink-0 min-w-[20px]"
  );

  // 2. Audit Other Admin Pages for Layout Squashing & Word Breaks (Issue 3)
  const servicesCode = await fs.readFile(path.join(projectRoot, "src/pages/admin/AdminServicesManager.tsx"), "utf8");
  assert.ok(
    servicesCode.includes('min-w-max') && servicesCode.includes('shrink-0 whitespace-nowrap flex items-center gap-2'),
    "AdminServicesManager must have min-w-max and shrink-0 whitespace-nowrap tabs"
  );

  const ordersCode = await fs.readFile(path.join(projectRoot, "src/pages/admin/AdminOrdersPage.tsx"), "utf8");
  assert.ok(
    ordersCode.includes('shrink-0 whitespace-nowrap px-4 py-2 rounded-lg text-xs font-bold') &&
    ordersCode.includes('shrink-0 whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-semibold'),
    "AdminOrdersPage must have shrink-0 whitespace-nowrap on view tabs and status filter buttons"
  );

  const homepageCode = await fs.readFile(path.join(projectRoot, "src/pages/admin/AdminHomepageManager.tsx"), "utf8");
  assert.ok(
    homepageCode.includes('min-w-max') && homepageCode.includes('shrink-0 whitespace-nowrap flex items-center gap-2'),
    "AdminHomepageManager must have min-w-max and shrink-0 whitespace-nowrap tabs"
  );

  const pagesCode = await fs.readFile(path.join(projectRoot, "src/pages/admin/AdminPagesManager.tsx"), "utf8");
  assert.ok(
    pagesCode.includes('min-w-max') && pagesCode.includes('shrink-0 whitespace-nowrap flex items-center gap-2'),
    "AdminPagesManager must have min-w-max and shrink-0 whitespace-nowrap tabs"
  );

  const settingsCode = await fs.readFile(path.join(projectRoot, "src/pages/admin/AdminSettingsPage.tsx"), "utf8");
  assert.ok(
    settingsCode.includes('min-w-max') && settingsCode.includes('shrink-0 whitespace-nowrap flex items-center gap-2'),
    "AdminSettingsPage must have min-w-max and shrink-0 whitespace-nowrap tabs"
  );

  const mediaCode = await fs.readFile(path.join(projectRoot, "src/pages/admin/AdminMediaLibrary.tsx"), "utf8");
  assert.ok(
    mediaCode.includes('min-w-max') && mediaCode.includes('shrink-0 whitespace-nowrap px-3 py-1.5'),
    "AdminMediaLibrary must have min-w-max and shrink-0 whitespace-nowrap category pills"
  );

  const storefrontCode = await fs.readFile(path.join(projectRoot, "src/pages/admin/AdminStorefrontManager.tsx"), "utf8");
  assert.ok(
    storefrontCode.includes('min-w-max') && storefrontCode.includes('shrink-0 whitespace-nowrap flex items-center gap-2'),
    "AdminStorefrontManager must have min-w-max and shrink-0 whitespace-nowrap category and section tabs"
  );

  const learnMoreCss = await fs.readFile(path.join(projectRoot, "src/styles/admin-learn-more.css"), "utf8");
  assert.ok(
    learnMoreCss.includes('white-space: nowrap;') && learnMoreCss.includes('flex-shrink: 0;'),
    "admin-learn-more.css must have white-space: nowrap and flex-shrink: 0 on .vlearn-cat-chip"
  );

  // 3. Engine Verification: Percentage Discount Campaign Math
  const promoEngine = await bundle(
    path.join(projectRoot, "src/promotions/promotionEngine.ts"),
    path.join(outdir, "promotionEngine.mjs")
  );

  const mockPhone = {
    product: {
      id: "iphone-16-pro",
      slug: "iphone-16-pro",
      name: "iPhone 16 Pro",
      category: "Smartphones",
      brand: "Apple",
      price: 10000,
      stockStatus: "In Stock",
    },
    quantity: 1,
    storage: "256GB",
    color: "Natural Titanium",
  };

  const mockConsole = {
    product: {
      id: "ps5-slim-console",
      slug: "ps5-slim-console",
      name: "PlayStation 5 Slim Standard Edition",
      category: "Game Consoles",
      brand: "Sony",
      price: 7500,
      stockStatus: "In Stock",
    },
    quantity: 1,
    storage: "1TB",
    color: "White",
  };

  // Test Campaign: "Mega Discount Sale — Up to 15% Off" on Smartphones with min subtotal 5000
  const megaDiscountPromo = {
    id: "promo-mega-discount-15",
    slug: "mega-discount-15",
    title: "Mega Discount Sale — Up to 15% Off",
    shortDescription: "Get 15% off qualifying smartphones",
    detailedDescription: "Limited time offer on Apple and Samsung flagships",
    promotionType: "percentage_discount",
    status: "active",
    isEnabled: true,
    timezone: "Africa/Accra",
    priority: 10,
    allowStacking: false,
    eligibleProductIds: ["iphone-16-pro"],
    eligibleCategory: "all",
    eligibleStorageOptions: ["256GB"],
    minOrderSubtotal: 5000,
    discountPercent: 15,
    desktopFlyerUrl: "/products/campaigns/mega-discount.webp",
    ctaText: "Shop Deals",
    ctaDestination: "/offers",
    displayOrder: 1,
    showOnAnnouncementBar: true,
    showOnHomepageCarousel: true,
    showOnOffersPage: true,
  };

  // Test Eligibility
  assert.equal(
    promoEngine.isItemEligibleForPromotion(mockPhone, megaDiscountPromo),
    true,
    "iPhone 16 Pro 256GB must be eligible for Mega Discount Promo"
  );
  assert.equal(
    promoEngine.isItemEligibleForPromotion(mockConsole, megaDiscountPromo),
    false,
    "PS5 console must NOT be eligible for Mega Discount Promo"
  );

  // Test Cart Discount Calculation
  const discountResult = promoEngine.evaluateCartPromotions([mockPhone, mockConsole], [megaDiscountPromo]);
  assert.equal(discountResult.appliedCampaigns.length, 1, "Mega Discount must be applied");
  assert.equal(discountResult.appliedCampaigns[0].id, "promo-mega-discount-15");
  // 15% of 10,000 = 1,500
  assert.equal(discountResult.totalDiscount, 1500, "15% discount on GH₵10,000 must equal GH₵1,500");
  assert.equal(discountResult.finalSubtotal, 16000, "17,500 - 1,500 = 16,000");

  console.log("✔ testPromotionsEditorAndAdminText passed completely!");
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  testPromotionsEditorAndAdminText()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
