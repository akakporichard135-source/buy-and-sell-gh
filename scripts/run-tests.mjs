import assert from "node:assert/strict";
import { mkdir, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { build } from "esbuild";

const outdir = path.join(tmpdir(), `buyandsell-tests-${Date.now()}`);
const projectRoot = process.cwd();
await mkdir(outdir, { recursive: true });

const bundle = async (entry, outfile) => {
  await build({
    bundle: true,
    entryPoints: [entry],
    define: {
      "import.meta.env.DEV": "true",
      "import.meta.env.PROD": "false",
      "import.meta.env.VITE_SUPABASE_ANON_KEY": "\"\"",
      "import.meta.env.VITE_SUPABASE_PRODUCT_IMAGES_BUCKET": "\"product-images\"",
      "import.meta.env.VITE_SUPABASE_URL": "\"\"",
    },
    format: "esm",
    loader: { ".webp": "file" },
    outfile,
    platform: "node",
  });
  return import(pathToFileURL(outfile).href);
};

try {
  const cart = await bundle(path.join(projectRoot, "src/context/cartOperations.ts"), path.join(outdir, "cartOperations.mjs"));
  const whatsapp = await bundle(path.join(projectRoot, "src/utils/whatsapp.ts"), path.join(outdir, "whatsapp.mjs"));
  const orders = await bundle(path.join(projectRoot, "src/utils/orders.ts"), path.join(outdir, "orders.mjs"));
  const shopOrdering = await bundle(path.join(projectRoot, "src/utils/shopOrdering.ts"), path.join(outdir, "shopOrdering.mjs"));
  const latestIphone = await bundle(path.join(projectRoot, "src/utils/latestIphone.ts"), path.join(outdir, "latestIphone.mjs"));
  const adminSecurity = await bundle(path.join(projectRoot, "src/admin/adminSecurity.ts"), path.join(outdir, "adminSecurity.mjs"));
  const adminOrderNotifications = await bundle(path.join(projectRoot, "src/admin/adminOrderNotificationState.ts"), path.join(outdir, "adminOrderNotifications.mjs"));

  const product = {
    id: "iphone-15-pro-max",
    name: "iPhone 15 Pro Max",
    slug: "iphone-15-pro-max",
    category: "iPhones",
    brand: "Apple",
    model: "iPhone 15 Pro Max",
    price: 14500,
    storage: ["256GB", "512GB"],
    condition: "UK Used",
    colors: ["Natural Titanium", "Black Titanium"],
    stockStatus: "In stock",
    stockQuantity: 2,
    imageTone: "",
    description: "",
    specs: [],
    box: [],
    images: [],
  };
  const soldOut = { ...product, id: "sold-out", stockStatus: "Sold Out", stockQuantity: 0 };

  let items = cart.addCartItem([], product, "256GB", "Natural Titanium");
  assert.equal(items.length, 1, "Add to Cart creates a cart item");
  assert.equal(items[0].quantity, 1, "New cart item starts at quantity 1");

  items = cart.addCartItem(items, product, "256GB", "Natural Titanium");
  assert.equal(items.length, 1, "Adding same variant does not duplicate item");
  assert.equal(items[0].quantity, 2, "Adding same variant increases quantity");

  items = cart.addCartItem(items, product, "512GB", "Black Titanium");
  assert.equal(items.length, 2, "Different variants remain separate cart items");

  items = cart.updateCartQuantity(items, product.id, "256GB", "Natural Titanium", 0);
  assert.equal(items.find((item) => item.storage === "256GB").quantity, 1, "Quantity is clamped to 1");

  items = cart.updateCartQuantity(items, product.id, "256GB", "Natural Titanium", Number.NaN);
  assert.equal(items.find((item) => item.storage === "256GB").quantity, 1, "Invalid quantity is recovered to 1");

  items = cart.removeCartItem(items, product.id, "512GB", "Black Titanium");
  assert.equal(items.length, 1, "Remove item deletes the selected variant");

  const unchanged = cart.addCartItem(items, soldOut, "256GB", "Natural Titanium");
  assert.equal(unchanged.length, items.length, "Sold-out products cannot be added");

  const enquiryOnly = { ...product, id: "enquiry-only", price: 0, priceOnRequest: true };
  assert.equal(cart.addCartItem(items, enquiryOnly).length, items.length, "Contact-for-price products cannot be added");
  const hidden = { ...product, id: "hidden", available: false };
  assert.equal(cart.addCartItem(items, hidden).length, items.length, "Hidden products cannot be added");
  const archived = { ...product, id: "archived", archived: true };
  assert.equal(cart.addCartItem(items, archived).length, items.length, "Archived products cannot be added");
  const zeroStock = { ...product, id: "zero-stock", stockQuantity: 0, stockStatus: "In Stock" };
  assert.equal(cart.addCartItem(items, zeroStock).length, items.length, "Zero-quantity products cannot be added");

  const normalized = cart.normalizeCartItems([{ nope: true }, { ...items[0], quantity: 3.7 }]);
  assert.equal(normalized.length, 1, "Invalid stored cart data is discarded");
  assert.equal(normalized[0].quantity, 3, "Stored quantities are normalized");

  const productUrl = whatsapp.productWhatsAppUrl(product, "256GB", "Natural Titanium", "https://example.com/product");
  assert.ok(productUrl.startsWith("https://wa.me/233244182149?text="), "Product WhatsApp link uses primary number");
  assert.ok(decodeURIComponent(productUrl).includes("iPhone 15 Pro Max"), "Product WhatsApp link includes product name");

  const order = orders.buildOrderRequestPayload(items, {
    fullName: "Test Customer",
    phone: "0240000000",
    fulfilmentType: "delivery",
    deliveryLocation: "Accra",
    preferredPaymentMethod: "Mobile Money",
    additionalNote: "Please confirm today.",
  }, "BSGH-TEST-0001");
  assert.equal(order.referenceNumber, "BSGH-TEST-0001", "Order request keeps generated reference");
  assert.equal(order.status, "Pending", "Order request starts in Pending status");
  assert.equal(order.total, 14500, "Order request total is calculated from cart items");

  const orderRequestUrl = whatsapp.orderRequestWhatsAppUrl(order);
  const decodedOrderRequest = decodeURIComponent(orderRequestUrl);
  assert.ok(orderRequestUrl.startsWith("https://wa.me/233244182149?text="), "Order request WhatsApp link uses primary number");
  assert.ok(decodedOrderRequest.includes("Reference: BSGH-TEST-0001"), "Order request WhatsApp link includes reference");
  assert.ok(decodedOrderRequest.includes("Order total: GHS 14,500"), "Order request WhatsApp link includes total");

  const mixedProducts = [
    { ...product, id: "iphone", slug: "iphone", category: "iPhones", createdAt: "2026-01-06" },
    { ...product, id: "iphone-2", slug: "iphone-2", category: "iPhones", createdAt: "2026-01-05" },
    { ...product, id: "macbook", slug: "macbook", category: "MacBooks", createdAt: "2026-01-04" },
    { ...product, id: "airpods", slug: "airpods", category: "AirPods", createdAt: "2026-01-03" },
    { ...product, id: "ipad", slug: "ipad", category: "iPads", createdAt: "2026-01-02" },
  ];
  const firstMix = shopOrdering.mixProductsDeterministically(mixedProducts);
  const secondMix = shopOrdering.mixProductsDeterministically(mixedProducts);
  assert.deepEqual(firstMix.map((item) => item.id), secondMix.map((item) => item.id), "Recommended ordering is stable");
  assert.deepEqual(firstMix.slice(0, 4).map((item) => item.category), ["iPhones", "iPads", "MacBooks", "AirPods"], "Recommended ordering interleaves categories");

  const iphoneCatalogue = [
    { ...product, id: "iphone-17-pro-max", slug: "iphone-17-pro-max", name: "iPhone 17 Pro Max", model: "iPhone 17 Pro Max", generation: "iPhone 17", category: "iPhones", condition: "To Confirm", images: [{ src: "iphone-17-pro-max.webp", alt: "iPhone 17 Pro Max" }] },
    { ...product, id: "iphone-17", slug: "iphone-17", name: "iPhone 17", model: "iPhone 17", generation: "iPhone 17", category: "iPhones", condition: "To Confirm", images: [{ src: "iphone-17.webp", alt: "iPhone 17" }] },
    { ...product, id: "iphone-18", slug: "iphone-18", name: "iPhone 18", model: "iPhone 18", generation: "iPhone 18", category: "iPhones", condition: "To Confirm", images: [{ src: "iphone-18.webp", alt: "iPhone 18" }] },
    { ...product, id: "iphone-18-pro", slug: "iphone-18-pro", name: "iPhone 18 Pro", model: "iPhone 18 Pro", generation: "iPhone 18", category: "iPhones", condition: "To Confirm", images: [{ src: "iphone-18-pro.webp", alt: "iPhone 18 Pro" }] },
    { ...product, id: "iphone-18-pro-max", slug: "iphone-18-pro-max", name: "iPhone 18 Pro Max", model: "iPhone 18 Pro Max", generation: "iPhone 18", category: "iPhones", condition: "To Confirm", images: [{ src: "iphone-18-pro-max.webp", alt: "iPhone 18 Pro Max" }] },
  ];
  const newestIphone = latestIphone.getLatestIphoneLineup(iphoneCatalogue, "safe-fallback.webp");
  assert.equal(newestIphone.generationLabel, "iPhone 18", "Latest iPhone logic selects the newest numeric generation");
  assert.equal(newestIphone.featuredName, "iPhone 18 Pro Max", "Latest iPhone logic selects the strongest verified variant");
  assert.deepEqual(newestIphone.variants.map((item) => item.name), ["iPhone 18 Pro Max", "iPhone 18 Pro", "iPhone 18"], "Latest iPhone lineup excludes older generations and ranks variants");
  assert.equal(newestIphone.image, "iphone-18-pro-max.webp", "Latest iPhone image follows the selected generation");
  assert.equal(newestIphone.learnMoreTo, "/shop?category=Phones&brand=Apple&generation=iPhone%2018", "Latest iPhone CTA follows the selected generation");

  assert.equal(adminSecurity.normalizeTotpCode("12a 34-56"), "123456", "TOTP input keeps six digits only");
  assert.equal(adminSecurity.isValidTotpCode("123456"), true, "Six-digit TOTP code is accepted");
  assert.equal(adminSecurity.isValidTotpCode("12345"), false, "Short TOTP code is rejected");
  assert.ok(adminSecurity.passwordStrengthError("short"), "Weak password is rejected");
  assert.equal(adminSecurity.passwordStrengthError("Strong-Admin-Password-2026"), "", "Strong password is accepted");
  assert.equal(adminSecurity.safeAdminRedirect("https://evil.example"), "/admin", "External admin redirect is rejected");
  assert.equal(adminSecurity.safeAdminRedirect("/admin/orders"), "/admin/orders", "Internal admin redirect is accepted");
  assert.equal(adminSecurity.safeAdminRedirect("/admin/reset-password"), "/admin/reset-password", "MFA can return to password recovery");
  assert.equal(adminSecurity.loginBackoffMs(2), 0, "First login failures do not create a lockout");
  assert.equal(adminSecurity.loginBackoffMs(8), 60000, "Login backoff is capped at one minute");

  const notificationStorageData = new Map();
  const notificationStorage = {
    getItem: (key) => notificationStorageData.get(key) ?? null,
    setItem: (key, value) => notificationStorageData.set(key, value),
  };
  assert.equal(adminOrderNotifications.getOrderSoundPreference(notificationStorage), true, "Order sounds default to enabled");
  adminOrderNotifications.saveOrderSoundPreference(notificationStorage, false);
  assert.equal(adminOrderNotifications.getOrderSoundPreference(notificationStorage), false, "Order sound preference persists locally");
  adminOrderNotifications.saveUnreadOrderIds(notificationStorage, "admin-1", ["order-1", "order-1", "order-2"]);
  assert.deepEqual(adminOrderNotifications.readUnreadOrderIds(notificationStorage, "admin-1"), ["order-1", "order-2"], "Unread order IDs are deduplicated without storing customer data");
  const seenOrderIds = new Set(["order-1"]);
  const unseenOrders = adminOrderNotifications.collectUnseenOrders([
    { id: "order-1", referenceNumber: "BSG-1", customerName: "Existing", createdAt: "2026-01-01" },
    { id: "order-2", referenceNumber: "BSG-2", customerName: "New", createdAt: "2026-01-02" },
    { id: "order-2", referenceNumber: "BSG-2", customerName: "New", createdAt: "2026-01-02" },
  ], seenOrderIds);
  assert.deepEqual(unseenOrders.map((order) => order.id), ["order-2"], "Each genuinely new order produces one notification");

  const productManagerSource = await readFile(path.join(projectRoot, "src/pages/admin/AdminProductManager.tsx"), "utf8");
  assert.match(productManagerSource, /useLayoutEffect[\s\S]*scrollIntoView\(\{ behavior: "smooth", block: "start" \}\)/, "Product editing scrolls only after the editor is rendered");
  const siteStyles = await readFile(path.join(projectRoot, "src/index.css"), "utf8");
  assert.match(siteStyles, /\.admin-product-editor\s*\{[\s\S]*scroll-margin-top:\s*calc\(var\(--admin-sticky-offset/, "Product editor uses the measured sticky-header offset");

  const migration012 = await readFile(path.join(projectRoot, "supabase/migrations/012_admin_mfa_hardening.sql"), "utf8");
  assert.match(migration012, /auth\.jwt\(\)\s*->>\s*'aal'.*'aal2'/s, "Admin database helpers require AAL2");
  assert.match(migration012, /private\.order_request_rate_limits/, "Order rate limits are stored outside the Data API schema");
  assert.match(migration012, /jsonb_array_length\(items_payload\)\s*>\s*25/, "Order RPC wrapper enforces 25 cart lines");
  assert.doesNotMatch(migration012, /(?:delete\s+from|update)\s+public\.(?:products|orders|admin_profiles)/i, "MFA migration does not mutate commercial or admin data");

  const vercelConfig = JSON.parse(await readFile(path.join(projectRoot, "vercel.json"), "utf8"));
  const globalHeaders = vercelConfig.headers.find((entry) => entry.source === "/(.*)").headers;
  const headerMap = Object.fromEntries(globalHeaders.map((header) => [header.key, header.value]));
  assert.match(headerMap["Content-Security-Policy"], /frame-ancestors 'none'/, "CSP blocks framing");
  assert.match(headerMap["Strict-Transport-Security"], /max-age=63072000/, "HSTS is configured for two years");

  console.log("All tests passed");
} finally {
  await rm(outdir, { recursive: true, force: true });
}
