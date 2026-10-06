const routes = [
  "/",
  "/store",
  "/iphone",
  "/mac",
  "/ipad",
  "/watch",
  "/airpods",
  "/accessories",
  "/buy/iphone-16-pro-max",
  "/buy/macbook-pro",
  "/buy/ipad-pro",
  "/buy/apple-watch-series-10",
  "/buy/airpods-4",
  "/cart",
  "/admin/pricing",
  "/admin/products",
];

const BASE = "http://127.0.0.1:4173";

console.log("=== HTTP SERVER PREVIEW VERIFICATION ===");
let passed = 0;
let failed = 0;

for (const r of routes) {
  try {
    const res = await fetch(`${BASE}${r}`);
    if (res.status === 200) {
      console.log(`  ✓ 200 OK: ${r}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL ${res.status}: ${r}`);
      failed++;
    }
  } catch (err) {
    console.error(`  ✗ ERROR connecting to ${r}:`, err.message);
    failed++;
  }
}

console.log(`\nHTTP ROUTES SUMMARY: ${passed} PASSED, ${failed} FAILED`);
if (failed > 0) process.exit(1);
