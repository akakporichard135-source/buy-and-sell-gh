import fs from "node:fs";

let content = fs.readFileSync("src/pages/admin/AdminProductManager.tsx", "utf8");
content = content.replace(
  `[v.title, v.sku || "", v.storage || "", v.color || ""]`,
  `[v.title, v.sku || "", v.storage || ""]`
);
fs.writeFileSync("src/pages/admin/AdminProductManager.tsx", content, "utf8");
console.log("Fixed variant search");
