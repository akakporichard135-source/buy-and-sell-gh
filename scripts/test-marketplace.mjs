import assert from "node:assert/strict";

export function testMarketplace({ product, productEditor, repository, catalogueDiscovery: discovery, marketplace, productImages, storefrontTaxonomy, productPresentation }) {
  const primary = { src: "https://catalogue.example/storage/v1/object/public/product-images/test/front.webp", alt: "Test phone front" };
  const secondary = { src: "https://catalogue.example/storage/v1/object/public/product-images/test/back.webp", alt: "Test phone back" };
  const draft = productEditor.productToForm({ ...product, id: "qa-samsung", slug: "qa-samsung", name: "Samsung Galaxy S25 test device", model: "Galaxy S25", brand: "Samsung", category: "Phones & Tablets", subcategory: "Mobile Phones", condition: "UK Used", available: false, archived: false, images: [primary, secondary], primaryImageIndex: 1, createdAt: "2026-08-30" });
  draft.price = "3500";
  draft.priceOnRequest = false;
  draft.storage = "128GB\n256GB";
  draft.ram = "12GB";
  draft.colors = "Black\nSilver";
  draft.stockQuantity = "2";
  draft.stockStatus = "In Stock";
  draft.specifications = "Dual SIM\nOLED display";

  // Use the same form conversion and database adapters as Product Manager, without a remote write.
  const save = (form, existing = []) => repository.rowToProduct({
    ...repository.productToRow(productEditor.formToProduct(form, existing)),
    created_at: form.createdAt,
  });
  const hidden = save(draft);
  assert.equal(discovery.getPhoneTabletProducts([hidden]).length, 0, "A saved unpublished admin draft stays off the marketplace");
  const samsung = save({ ...draft, available: true });
  const apple = save({ ...draft, id: "qa-apple", slug: "qa-apple", name: "Apple iPhone 16 Pro Max", model: "iPhone 16 Pro Max", brand: "Apple", available: true, price: "6000", storage: "256GB", createdAt: "2026-08-31" });
  const tablet = save({ ...draft, id: "qa-tablet", slug: "qa-tablet", name: "Samsung Galaxy Tab test", model: "Galaxy Tab", subcategory: "Tablets", available: true, price: "2500", condition: "Brand New", storage: "64 GB", createdAt: "2026-08-29" });
  const enquiry = { ...samsung, id: "enquiry", price: 0, priceOnRequest: true, createdAt: "2026-08-28" };
  const outOfStock = { ...samsung, id: "unavailable", stockQuantity: 0, stockStatus: "Out of Stock", createdAt: "2026-08-27" };
  const archived = { ...samsung, id: "archived", archived: true };
  const inventory = [samsung, apple, tablet, enquiry, outOfStock, hidden, archived];
  const query = (values = {}, products = inventory) => marketplace.filterMarketplaceProducts(products, new URLSearchParams(values), discovery.getPhoneTabletCategory);
  const ids = (products) => products.map((item) => item.id);

  assert.deepEqual(ids(query()), ["qa-apple", "qa-samsung", "qa-tablet", "enquiry", "unavailable"], "Only published inventory appears, with newest first");
  assert.deepEqual(ids(query({ q: "Samsung S25 256GB", availability: "in-stock" })), ["qa-samsung"], "Search matches separate model and storage terms");
  assert.deepEqual(ids(query({ q: "iphone 16 pro" })), ["qa-apple"], "Search finds an Apple phone published through the same manager");
  assert.deepEqual(ids(query({ q: "Galaxy Tab" })), ["qa-tablet"], "Search finds tablets");
  assert.deepEqual(ids(query({ brand: " apple " })), ["qa-apple"], "Brand filtering tolerates case and surrounding whitespace");
  assert.deepEqual(ids(query({ category: "tablets" })), ["qa-tablet"], "Category selects real tablets only");
  assert.deepEqual(ids(query({ condition: "Brand New" })), ["qa-tablet"], "Condition uses the stored condition");
  assert.deepEqual(ids(query({ storage: "64GB" })), ["qa-tablet"], "Storage filtering accepts equivalent GB formatting");
  assert.deepEqual(ids(query({ maxPrice: "3000" })), ["qa-tablet"], "Maximum price excludes enquiry-only prices");
  assert.equal(query({ maxPrice: "not-a-price" }).length, 0, "Invalid price input never produces misleading matches");
  assert.deepEqual(ids(query({ availability: "enquiry" })), ["enquiry", "unavailable"], "Published unavailable inventory follows existing enquiry behavior");
  assert.deepEqual(ids(query({ sort: "price-low" })), ["qa-tablet", "qa-samsung", "unavailable", "qa-apple", "enquiry"], "Low-price sorting places unconfirmed prices last");
  assert.deepEqual(ids(query({ sort: "price-high" })), ["qa-apple", "qa-samsung", "unavailable", "qa-tablet", "enquiry"], "High-price sorting also places unconfirmed prices last");
  assert.deepEqual(productImages.resolveProductGallery(samsung), [secondary, primary], "Primary owner image leads the full gallery after save/load");
  assert.equal(productImages.resolveProductImage(samsung).src, secondary.src, "Marketplace uses the chosen owner-uploaded image");
  assert.deepEqual(samsung.storage, ["128GB", "256GB"], "Admin storage variants survive persistence");
  assert.deepEqual(samsung.colors, ["Black", "Silver"], "Admin colour variants survive persistence");
  assert.equal(discovery.getProductRam(samsung), "12GB", "RAM round-trips through specifications without duplicate fields");
  assert.equal(samsung.price, 3500, "Confirmed admin price reaches the listing unchanged");

  const edited = save({ ...productEditor.productToForm(samsung), price: "3000", brand: "New Brand", available: true }, [samsung]);
  assert.deepEqual(discovery.getPhoneTabletBrands([edited]), ["New Brand"], "Editing to a previously unknown brand updates the filter without code changes");
  assert.equal(query({ brand: "New Brand", maxPrice: "3000" }, [edited]).length, 1, "Edited brand and price are immediately searchable");
  assert.equal(query({}, [save({ ...productEditor.productToForm(edited), available: false }, [edited])]).length, 0, "Unpublishing removes an existing listing");
  assert.equal(query({}, []).length, 0, "Deleted inventory and empty catalogues never fall back to invented listings");
  const brands = ["Apple", "Samsung", "Tecno", "Nothing", "Honor", "Google", "Xiaomi", " samsung "].map((brand, index) => ({ ...samsung, id: `brand-${index}`, brand }));
  assert.equal(discovery.getPhoneTabletBrands(brands).length, 7, "Dynamic brands deduplicate casing and whitespace");
  const primaryBrands = discovery.getPrimaryPhoneTabletBrands(brands);
  const otherBrands = discovery.getOtherPhoneTabletBrands(brands);
  assert.equal(primaryBrands.length, 5, "Brand shortcuts remain bounded");
  assert.ok(otherBrands.every((brand) => !primaryBrands.includes(brand)), "Others contains only additional brands");
  assert.equal(discovery.getPhoneTabletBrands([{ ...samsung, available: false, brand: "Hidden Brand" }]).length, 0, "Unpublished brands do not leak into navigation");
  assert.equal(discovery.getPhoneTabletCategory({ ...apple, category: "iPhones" }), "mobile-phones", "Legacy iPhone category remains supported");
  assert.equal(discovery.getPhoneTabletCategory({ ...apple, category: "iPads" }), "tablets", "Legacy iPad category remains supported");
  assert.equal(storefrontTaxonomy.getStorefrontCategory(apple), "Phones", "New marketplace phones also appear in Store phone filters");
  assert.equal(storefrontTaxonomy.getStorefrontCategory(tablet), "Tablets", "New marketplace tablets also appear in Store tablet filters");
  assert.ok(productPresentation.productMatchesCategorySlug(apple, "iphones"), "An Apple marketplace phone remains on the dedicated iPhone page");
  assert.ok(productPresentation.productMatchesCategorySlug({ ...tablet, brand: "Apple" }, "ipads"), "An Apple marketplace tablet remains on the dedicated iPad page");
  assert.equal(productPresentation.productMatchesCategorySlug(samsung, "iphones"), false, "Non-Apple phones do not leak into the dedicated iPhone page");
  assert.equal(discovery.getPhoneTabletProducts([{ ...samsung, category: "Electronics", subcategory: "Laptops & Computers" }]).length, 0, "Unrelated Electronics inventory stays out of phone results");
  assert.deepEqual(marketplace.marketplaceOptions(["Samsung", " samsung ", "Tecno"]), ["Samsung", "Tecno"], "Filter options use the same deduplication discipline");
}
