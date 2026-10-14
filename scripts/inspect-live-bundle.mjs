const r1 = await fetch("https://buy-and-sell-8qrivdt6p-richard-akakpo-s-projects.vercel.app", { cache: "no-store" });
const t1 = await r1.text();
console.log("Deployment direct URL:", t1.match(/src="\/assets\/index-[^"]+\.js"/)?.[0]);

const r2 = await fetch("https://admin.buyandsellgh.com", { cache: "no-store" });
const t2 = await r2.text();
console.log("admin.buyandsellgh.com URL:", t2.match(/src="\/assets\/index-[^"]+\.js"/)?.[0]);

const r3 = await fetch("https://buyandsellgh.com", { cache: "no-store" });
const t3 = await r3.text();
console.log("buyandsellgh.com URL:", t3.match(/src="\/assets\/index-[^"]+\.js"/)?.[0]);
