for (const target of [
  "https://buyandsellgh.com",
  "https://admin.buyandsellgh.com",
  "https://buy-and-sell-gs4higofc-richard-akakpo-s-projects.vercel.app"
]) {
  try {
    const res = await fetch(target, { cache: "no-store" });
    const text = await res.text();
    const match = text.match(/src="\/assets\/index-[^"]+\.js"/);
    const adminMatch = text.match(/src="\/assets\/AdminDashboardPage-[^"]+\.js"/);
    console.log(`${target} -> Status: ${res.status}, Index: ${match ? match[0] : "none"}, AdminDashboard: ${adminMatch ? adminMatch[0] : "none"}`);
  } catch (err) {
    console.log(`${target} -> Error: ${err.message}`);
  }
}

import fs from "node:fs";
const localHtml = fs.readFileSync("dist/index.html", "utf8");
const localMatch = localHtml.match(/src="\/assets\/index-[^"]+\.js"/);
console.log("Local dist index bundle:", localMatch ? localMatch[0] : "none");
