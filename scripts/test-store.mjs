import assert from "node:assert/strict";

export function testStore({ presentation, product, productEditor, repository, catalogueDiscovery, productImages, shopSource, cardSource }) {
  assert.equal(presentation.STORE_BATCH_SIZE, 24, "Initial Store render is bounded for a large catalogue");
  assert.deepEqual(presentation.storeFilterChoices(["256GB", "128GB", "256GB", "", undefined]), ["128GB", "256GB"], "Filter options derive from real inventory without duplicates");
  assert.ok(presentation.storeFilterChoices(["256GB"], "512GB").includes("512GB"), "Deep-linked selected values remain clear even when no products match");
  assert.deepEqual(presentation.storeCardFacts({ ...product, storage: ["128GB", "256GB", "512GB", "1TB"] }), ["128GB / 256GB / 512GB", "UK Used"], "Phone facts stay concise and preserve real condition");
  const laptop = { ...product, category: "MacBooks", name: "MacBook Air (M5)", model: "MacBook Air", generation: "M5", specs: ["Memory options: 16GB, 24GB", "Unnecessary long detail"], storage: ["512GB", "1TB"] };
  assert.deepEqual(presentation.storeCardFacts(laptop), ["M5", "16GB, 24GB", "512GB / 1TB"], "Laptop cards show only chip, memory and storage");
  assert.deepEqual(presentation.storeCardFacts({ ...product, category: "Accessories", storage: ["USB-C / 40W"], condition: "To Confirm" }), ["USB-C / 40W", "Condition to confirm"], "Accessory facts use stored connector information");

  const ownerPhoto = { src: "https://catalogue.example/storage/v1/object/public/product-images/store/real-phone.webp", alt: "Owner's original phone photo" };
  const form = productEditor.productToForm({ ...product, available: false, archived: false, priceOnRequest: false, images: [ownerPhoto], stockStatus: "In Stock" });
  const saved = (changes) => repository.rowToProduct(repository.productToRow(productEditor.formToProduct({ ...form, ...changes }, [])));
  const visible = (inventory) => inventory.filter((item) => !item.archived && item.available !== false).filter(catalogueDiscovery.isAppleCatalogueProduct);
  const published = saved({ available: true, price: "4500" });
  assert.equal(visible([saved({}), published]).length, 1, "Only the published admin record appears in Store");
  assert.equal(visible([saved({ available: true, archived: true })]).length, 0, "Archived products stay hidden");
  assert.equal(visible([saved({ available: true, brand: "Samsung", category: "Phones & Tablets" })]).length, 0, "Unrelated marketplace inventory is not merged into Store");
  assert.equal(published.price, 4500, "Admin confirmed pricing remains unchanged");
  assert.equal(saved({ available: true, priceOnRequest: true }).priceOnRequest, true, "Admin contact-price state survives save/load");
  assert.equal(productImages.resolveProductImage(published).src, ownerPhoto.src, "The real owner-uploaded image retains priority");
  assert.ok(shopSource.includes("activeProducts.filter(isAppleCatalogueProduct)"), "Store preserves its existing inventory selector");
  assert.ok(shopSource.includes("filtered.slice(0, visibleCount)"), "Batching occurs after search, filtering and sorting");
  assert.ok(shopSource.includes('JSON.stringify([filters, sort])'), "Changing filters or sorting resets the visible batch");
  assert.ok(cardSource.includes("productWhatsAppUrl(product, product.storage[0], product.colors[0])"), "WhatsApp retains product and variant context");
  assert.ok(cardSource.includes("isProductPurchasable(product)"), "Direct cart actions retain existing availability checks");
  assert.equal(cardSource.includes("Enquiry only"), false, "Disabled enquiry buttons are replaced by real details and WhatsApp actions");
}
