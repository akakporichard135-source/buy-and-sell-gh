import https from "node:https";

const publicUrls = [
  { url: "https://buyandsellgh.com/", expected: 200 },
  { url: "https://buyandsellgh.com/store", expected: 200 },
  { url: "https://buyandsellgh.com/cart", expected: 200 },
  { url: "https://buyandsellgh.com/iphone", expected: 200 },
  { url: "https://buyandsellgh.com/admin", expected: 404 },
  { url: "https://buyandsellgh.com/admin/login", expected: 404 },
  { url: "https://buyandsellgh.com/admin/pricing", expected: 404 },
  { url: "https://buyandsellgh.com/admin/orders", expected: 404 },
];

const adminUrls = [
  { host: "admin.buyandsellgh.com", path: "/", expected: 200 },
  { host: "admin.buyandsellgh.com", path: "/admin", expected: 200 },
  { host: "admin.buyandsellgh.com", path: "/admin/login", expected: 200 },
];

function fetchStatus(targetUrl) {
  return new Promise((resolve) => {
    const req = https.request(targetUrl, { method: "HEAD" }, (res) => {
      resolve({
        url: targetUrl,
        status: res.statusCode,
        statusText: res.statusMessage,
        server: res.headers.server,
        vercelId: res.headers["x-vercel-id"],
        contentLength: res.headers["content-length"],
        contentType: res.headers["content-type"],
      });
    });
    req.on("error", (err) => {
      resolve({ url: targetUrl, error: err.message });
    });
    req.end();
  });
}

function fetchAdminViaIp(path) {
  return new Promise((resolve) => {
    // 216.198.79.65 is Vercel's anycast IP for the domain
    const req = https.request(
      "https://216.198.79.65" + path,
      {
        method: "GET",
        headers: {
          Host: "admin.buyandsellgh.com",
        },
        servername: "admin.buyandsellgh.com", // SNI
      },
      (res) => {
        let body = "";
        res.on("data", (chunk) => (body += chunk));
        res.on("end", () => {
          resolve({
            path,
            status: res.statusCode,
            server: res.headers.server,
            vercelId: res.headers["x-vercel-id"],
            hasHtml: body.includes("<html") || body.includes("<!DOCTYPE html>"),
            hasTitle: body.includes("<title>"),
            titlePreview: body.match(/<title>([^<]*)<\/title>/)?.[1] || "",
          });
        });
      }
    );
    req.on("error", (err) => resolve({ path, error: err.message }));
    req.end();
  });
}

async function run() {
  console.log("=== VERIFYING PUBLIC STOREFRONT ROUTES ===");
  for (const item of publicUrls) {
    const res = await fetchStatus(item.url);
    const pass = res.status === item.expected;
    console.log(
      `${pass ? "PASS" : "FAIL"} | ${item.url} -> Status: ${res.status} (Expected: ${item.expected}) [Vercel ID: ${res.vercelId || "N/A"}]`
    );
  }

  console.log("\n=== VERIFYING ADMIN ROUTES VIA VERCEL EDGE (SNI: admin.buyandsellgh.com) ===");
  for (const item of adminUrls) {
    const res = await fetchAdminViaIp(item.path);
    const pass = res.status === item.expected;
    console.log(
      `${pass ? "PASS" : "FAIL"} | https://admin.buyandsellgh.com${item.path} -> Status: ${res.status} (Expected: ${item.expected}) Title: "${res.titlePreview}"`
    );
  }
}

run();
