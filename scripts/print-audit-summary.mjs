import fs from "node:fs";

const data = JSON.parse(fs.readFileSync("scripts/missing-products-audit.json", "utf8"));
console.log("Total Products Audited:", data.totalProducts);
console.log("Valid Products (Keep Visible):", data.validProductsCount);
console.log("Missing Image Products (To Hide):", data.missingImagesCount);

console.log("\n--- CATEGORY BREAKDOWN OF MISSING PRODUCTS ---");
const missingByCat = {};
data.missingProducts.forEach((p) => {
  missingByCat[p.category] = (missingByCat[p.category] || 0) + 1;
});
console.table(missingByCat);

console.log("\n--- CATEGORY BREAKDOWN OF VALID PRODUCTS ---");
const validByCat = {};
data.validProducts.forEach((p) => {
  validByCat[p.category] = (validByCat[p.category] || 0) + 1;
});
console.table(validByCat);

console.log("\n--- REASONS FOR HIDING (53 PRODUCTS) ---");
let usedCount = 0;
let accessoryCount = 0;
data.missingProducts.forEach((p, idx) => {
  if (p.needsRealPhotos) usedCount++;
  else accessoryCount++;
  const reason = p.needsRealPhotos
    ? "Used device (requires genuine unit photo)"
    : "Accessory (missing approved clean studio image)";
  console.log(`${idx + 1}. [${p.id}] "${p.name}" (${p.category}, ${p.condition}) - ${p.variantsCount} variants. Reason: ${reason}`);
});
console.log(`\nUsed Devices requiring actual photos: ${usedCount}`);
console.log(`Brand New Accessories missing clean approved image: ${accessoryCount}`);
