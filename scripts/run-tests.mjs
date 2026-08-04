import assert from "node:assert/strict";
import { mkdir, rm } from "node:fs/promises";
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
    format: "esm",
    outfile,
    platform: "node",
  });
  return import(pathToFileURL(outfile).href);
};

try {
  const cart = await bundle(path.join(projectRoot, "src/context/cartOperations.ts"), path.join(outdir, "cartOperations.mjs"));
  const whatsapp = await bundle(path.join(projectRoot, "src/utils/whatsapp.ts"), path.join(outdir, "whatsapp.mjs"));
  const orders = await bundle(path.join(projectRoot, "src/utils/orders.ts"), path.join(outdir, "orders.mjs"));

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
  assert.equal(order.status, "New", "Order request starts in New status");
  assert.equal(order.total, 14500, "Order request total is calculated from cart items");

  const orderRequestUrl = whatsapp.orderRequestWhatsAppUrl(order);
  const decodedOrderRequest = decodeURIComponent(orderRequestUrl);
  assert.ok(orderRequestUrl.startsWith("https://wa.me/233244182149?text="), "Order request WhatsApp link uses primary number");
  assert.ok(decodedOrderRequest.includes("Order reference: BSGH-TEST-0001"), "Order request WhatsApp link includes reference");
  assert.ok(decodedOrderRequest.includes("Total: GHS 14,500"), "Order request WhatsApp link includes total");

  console.log("All tests passed");
} finally {
  await rm(outdir, { recursive: true, force: true });
}
