import fs from "node:fs";

console.log("=== INSPECTING LIVE DEPLOYED CODE BUNDLES ON VERCEL ===");

// 1. Fetch live admin login HTML
const adminLoginRes = await fetch("https://admin.buyandsellgh.com/admin/login", { cache: "no-store" });
const adminLoginHtml = await adminLoginRes.text();

const jsMatches = Array.from(adminLoginHtml.matchAll(/src="([^"]+\.js)"/g)).map(m => m[1]);
const cssMatches = Array.from(adminLoginHtml.matchAll(/href="([^"]+\.css)"/g)).map(m => m[1]);

console.log("Found JS tags in HTML:", jsMatches);
console.log("Found CSS tags in HTML:", cssMatches);

// 2. Fetch the live main CSS bundle and search for our new admin layout rules
for (const cssPath of cssMatches) {
  const url = cssPath.startsWith("http") ? cssPath : `https://admin.buyandsellgh.com${cssPath}`;
  const res = await fetch(url, { cache: "no-store" });
  const css = await res.text();
  if (css.includes("100dvh") && css.includes("admin-shell")) {
    console.log("✓ Live CSS contains .admin-shell height: 100dvh rule");
  }
  if (css.includes("admin-topbar") && css.includes("64px")) {
    console.log("✓ Live CSS contains .admin-topbar height: 64px rule");
  }
}

// 3. Compare with local dist chunk
const localFiles = fs.readdirSync("dist/assets");
const localAdminChunk = localFiles.find(f => f.startsWith("AdminSectionPage-") && f.endsWith(".js"));
console.log("Local chunk:", localAdminChunk);
if (localAdminChunk) {
  const localTxt = fs.readFileSync(`dist/assets/${localAdminChunk}`, "utf8");
  console.log("Local has 'Showing ':", localTxt.includes("Showing "));
  console.log("Local matches for 'Showing':", localTxt.match(/Showing[^a-zA-Z0-9<]+/g));
}

// 4. Fetch index JS to find AdminSectionPage chunk name
const indexJsRes = await fetch(`https://admin.buyandsellgh.com${jsMatches[0]}`, { cache: "no-store" });
const indexJs = await indexJsRes.text();
const adminMatches = indexJs.match(/AdminSectionPage-[^"'\)]+\.js/g);
console.log("Live AdminSectionPage chunk name:", adminMatches);

if (adminMatches && adminMatches[0]) {
  const liveUrl = `https://admin.buyandsellgh.com/assets/${adminMatches[0]}`;
  const chunkRes = await fetch(liveUrl, { cache: "no-store" });
  console.log(`Live fetch ${liveUrl} status:`, chunkRes.status);
  if (chunkRes.status === 200) {
    const chunkJs = await chunkRes.text();
    console.log("Live has 'Showing ':", chunkJs.includes("Showing "));
    console.log("Live matches for 'Showing':", chunkJs.match(/Showing[^a-zA-Z0-9<]+/g));
    console.log("Live has 'Purchased Items':", chunkJs.includes("Purchased Items"));
    console.log("Live has 'Total & Payment':", chunkJs.includes("Total & Payment"));
    console.log("Live has 'admin-drawer-panel':", chunkJs.includes("admin-drawer-panel"));
  }
}
