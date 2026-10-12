import assert from "node:assert/strict";
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import puppeteer from "puppeteer-core";

const PORT = 4175;
const DIST = path.resolve("dist");
const EDGE_PATH = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";

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
console.log(`Browser verification server running on http://127.0.0.1:${PORT}`);

const browser = await puppeteer.launch({
  executablePath: EDGE_PATH,
  headless: true,
  args: ["--no-sandbox", "--disable-setuid-sandbox"],
});

try {
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  console.log("\n1. Verifying public storefront loads on localhost...");
  const homeRes = await page.goto(`http://localhost:${PORT}/`, { waitUntil: "networkidle2" });
  assert.equal(homeRes.status(), 200, "Home page must respond with 200");
  const homeTitle = await page.title();
  console.log("Home page title:", homeTitle);
  assert.ok(homeTitle.includes("Buy & Sell GH"), "Home page title must include Buy & Sell GH");

  console.log("\n2. Verifying public /admin returns HTTP 404...");
  const publicAdminRes = await page.goto(`http://localhost:${PORT}/admin`, { waitUntil: "networkidle2" });
  assert.equal(publicAdminRes.status(), 404, "Public /admin must return HTTP 404");
  const publicAdminHeading = await page.$eval("h1", (el) => el.textContent);
  console.log("Public /admin heading:", publicAdminHeading);
  assert.equal(publicAdminHeading, "Page Not Found", "Public /admin must display 404 Page Not Found");

  console.log("\n3. Verifying public /admin/login returns HTTP 404...");
  const publicLoginRes = await page.goto(`http://localhost:${PORT}/admin/login`, { waitUntil: "networkidle2" });
  assert.equal(publicLoginRes.status(), 404, "Public /admin/login must return HTTP 404");
  const publicLoginHeading = await page.$eval("h1", (el) => el.textContent);
  assert.equal(publicLoginHeading, "Page Not Found", "Public /admin/login must display 404 Page Not Found");

  console.log("\n4. Verifying client-side navigation attempts to /admin on public host render 404...");
  await page.goto(`http://localhost:${PORT}/`, { waitUntil: "networkidle2" });
  await page.evaluate(() => {
    const a = document.createElement("a");
    a.href = "/admin";
    document.body.appendChild(a);
    a.click();
  });
  await new Promise((r) => setTimeout(r, 1200));
  const clientRouteContent = await page.evaluate(() => document.body.innerText);
  console.log("Client route snippet:", clientRouteContent.slice(0, 150).replace(/\n/g, " "));
  assert.ok(
    clientRouteContent.toLowerCase().includes("page not found") || clientRouteContent.includes("404"),
    "Client-side navigation to /admin on public host must render NotFoundPage"
  );
  assert.ok(
    !clientRouteContent.includes("Sign in to admin") && !clientRouteContent.includes("Admin Dashboard"),
    "Client-side navigation must NOT expose admin login or dashboard"
  );
  console.log("Client-side router successfully blocked /admin on public host!");

  console.log("\n5. Verifying admin host (admin.localhost) loads admin interface...");
  const adminHostRes = await page.goto(`http://admin.localhost:${PORT}/`, { waitUntil: "networkidle2" });
  assert.equal(adminHostRes.status(), 200, "Admin host must respond with 200");
  const currentUrl = page.url();
  console.log("Admin host landing URL:", currentUrl);
  assert.ok(currentUrl.includes("/admin"), "Admin host / must redirect to /admin");

  const hasLoginForm = await page.evaluate(() => {
    const text = document.body.innerText;
    return text.includes("Admin") || text.includes("Sign in") || text.includes("Password") || text.includes("Email");
  });
  console.log("Admin sign-in form visible on admin.localhost:", hasLoginForm);
  assert.ok(hasLoginForm, "Admin host must render admin login form for unauthenticated visitor");

  console.log("\nALL HEADLESS BROWSER VERIFICATIONS PASSED!");
} finally {
  await browser.close();
  server.close();
}
