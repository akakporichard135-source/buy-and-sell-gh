import assert from "node:assert/strict";
import http from "node:http";
import fs from "node:fs";
import path from "node:path";

const PORT = 4174;
const DIST = path.resolve("dist");

const MIME = {
  ".html": "text/html",
  ".js": "application/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".woff2": "font/woff2",
};

const server = http.createServer((req, res) => {
  const urlPath = req.url.split("?")[0];
  const rawHost = (req.headers.host || "").toLowerCase();
  const hostname = rawHost.split(":")[0];
  const isAdminHost = hostname.startsWith("admin.") || hostname === "admin.localhost";
  const isAdminRoute = urlPath === "/admin" || urlPath.startsWith("/admin/");

  if (!isAdminHost && isAdminRoute) {
    const notFoundFile = path.join(DIST, "404.html");
    if (fs.existsSync(notFoundFile)) {
      res.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
      fs.createReadStream(notFoundFile).pipe(res);
      return;
    }
    res.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
    return res.end("<!DOCTYPE html><html><body><h1>404 Not Found</h1></body></html>");
  }

  let filePath = path.join(DIST, urlPath);
  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    if (path.extname(urlPath)) {
      res.writeHead(404);
      return res.end("Not Found");
    }
    filePath = path.join(DIST, "index.html");
  }
  const ext = path.extname(filePath);
  const contentType = MIME[ext] || "application/octet-stream";
  const stat = fs.statSync(filePath);

  res.writeHead(200, {
    "Content-Length": stat.size,
    "Content-Type": contentType,
  });
  fs.createReadStream(filePath).pipe(res);
});

await new Promise((resolve) => server.listen(PORT, "127.0.0.1", resolve));
console.log(`Test server running on port ${PORT}`);

function request(urlPath, hostHeader) {
  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        hostname: "127.0.0.1",
        port: PORT,
        path: urlPath,
        method: "GET",
        headers: {
          Host: hostHeader,
        },
      },
      (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => resolve({ status: res.statusCode, text: data, headers: res.headers }));
      }
    );
    req.on("error", reject);
    req.end();
  });
}

try {
  console.log("\n=== 1. Testing Public Host (buyandsellgh.com) Server Responses ===");
  const publicPaths = [
    { path: "/admin", expected: 404 },
    { path: "/admin/login", expected: 404 },
    { path: "/admin/mfa", expected: 404 },
    { path: "/admin/reset-password", expected: 404 },
    { path: "/admin/pricing", expected: 404 },
    { path: "/admin/orders", expected: 404 },
    { path: "/admin/products", expected: 404 },
    { path: "/", expected: 200 },
    { path: "/store", expected: 200 },
    { path: "/iphone", expected: 200 },
    { path: "/cart", expected: 200 },
  ];

  for (const item of publicPaths) {
    const res = await request(item.path, "buyandsellgh.com");
    console.log(`[Host: buyandsellgh.com] GET ${item.path} -> ${res.status}`);
    assert.equal(res.status, item.expected, `Expected ${item.expected} for ${item.path} on public host, got ${res.status}`);
    if (item.expected === 404) {
      assert.ok(res.text.includes("404") || res.text.includes("Page Not Found"), `Expected 404 content for ${item.path}`);
    }
  }

  console.log("\n=== 2. Testing Public Localhost Responses ===");
  for (const path of ["/admin", "/admin/login", "/admin/pricing"]) {
    const res = await request(path, `localhost:${PORT}`);
    console.log(`[Host: localhost] GET ${path} -> ${res.status}`);
    assert.equal(res.status, 404, `Expected 404 for ${path} on localhost`);
  }

  console.log("\n=== 3. Testing Admin Host (admin.buyandsellgh.com) Responses ===");
  const adminPaths = [
    { path: "/admin", expected: 200 },
    { path: "/admin/login", expected: 200 },
    { path: "/admin/mfa", expected: 200 },
    { path: "/admin/reset-password", expected: 200 },
    { path: "/admin/pricing", expected: 200 },
    { path: "/admin/orders", expected: 200 },
    { path: "/admin/products", expected: 200 },
    { path: "/", expected: 200 },
  ];

  for (const item of adminPaths) {
    const res = await request(item.path, "admin.buyandsellgh.com");
    console.log(`[Host: admin.buyandsellgh.com] GET ${item.path} -> ${res.status}`);
    assert.equal(res.status, item.expected, `Expected ${item.expected} for ${item.path} on admin host, got ${res.status}`);
    assert.ok(res.text.toLowerCase().includes("<!doctype html>"), "Expected HTML SPA bundle for admin host");
  }

  console.log("\n=== 4. Testing Local Admin Host (admin.localhost) Responses ===");
  for (const item of adminPaths) {
    const res = await request(item.path, `admin.localhost:${PORT}`);
    console.log(`[Host: admin.localhost] GET ${item.path} -> ${res.status}`);
    assert.equal(res.status, 200, `Expected 200 for ${item.path} on admin.localhost`);
  }

  console.log("\n=== 5. Testing Native Fetch DNS to admin.localhost ===");
  const nativeAdminRes = await fetch(`http://admin.localhost:${PORT}/admin`);
  console.log(`[Native Fetch admin.localhost:${PORT}/admin] -> ${nativeAdminRes.status}`);
  assert.equal(nativeAdminRes.status, 200, "Native fetch to admin.localhost must succeed with 200");

  const nativeLocalhostRes = await fetch(`http://localhost:${PORT}/admin`);
  console.log(`[Native Fetch localhost:${PORT}/admin] -> ${nativeLocalhostRes.status}`);
  assert.equal(nativeLocalhostRes.status, 404, "Native fetch to localhost/admin must return 404");

  console.log("\n=== 6. Testing Vercel Rewrite Regex Compatibility ===");
  const vercelRewrites = JSON.parse(fs.readFileSync("vercel.json", "utf-8")).rewrites;
  assert.equal(vercelRewrites.length, 3, "Expected 3 rewrite rules in vercel.json");

  // Rule 1: Exact production admin host
  const adminLiteralRule = vercelRewrites[0];
  assert.ok(adminLiteralRule.has && adminLiteralRule.has[0].type === "host", "Rule 1 must filter by host");
  assert.equal(adminLiteralRule.has[0].value, "admin.buyandsellgh.com", "Rule 1 must match admin.buyandsellgh.com");

  // Rule 2: Regex admin host
  const adminRegexRule = vercelRewrites[1];
  assert.ok(adminRegexRule.has && adminRegexRule.has[0].type === "host", "Rule 2 must filter by host");
  assert.ok(adminRegexRule.has[0].value.includes("admin"), "Rule 2 must match admin host pattern");

  // Rule 3: Public Host (excludes admin)
  const publicRule = vercelRewrites[2];
  const regex = new RegExp(`^${publicRule.source.replace(/\.\*/, ".*")}$`);
  assert.equal(regex.test("/admin"), false, "Public rewrite rule must reject /admin");
  assert.equal(regex.test("/admin/login"), false, "Public rewrite rule must reject /admin/login");
  assert.equal(regex.test("/admin/orders"), false, "Public rewrite rule must reject /admin/orders");
  assert.equal(regex.test("/admin/pricing"), false, "Public rewrite rule must reject /admin/pricing");
  assert.equal(regex.test("/store"), true, "Public rewrite rule must accept /store");
  assert.equal(regex.test("/iphone"), true, "Public rewrite rule must accept /iphone");
  assert.equal(regex.test("/cart"), true, "Public rewrite rule must accept /cart");
  assert.equal(regex.test("/"), true, "Public rewrite rule must accept /");

  console.log("Vercel rewrite regex rules verified successfully!");

  console.log("\nALL ADMIN SEPARATION AND ROUTING TESTS PASSED!");
} finally {
  server.close();
}
