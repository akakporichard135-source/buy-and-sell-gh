import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";

export async function testWordBreaksAndResponsive(projectRoot) {
  // 1. Verify index.css safeguards
  const indexCss = await readFile(path.join(projectRoot, "src/index.css"), "utf8");
  assert.ok(!indexCss.includes("overflow-wrap: anywhere"), "src/index.css contains zero occurrences of overflow-wrap: anywhere");
  assert.match(indexCss, /Universal Typography & Word-Breaking Integrity Safeguards/i, "src/index.css has universal typography safeguards");
  assert.match(indexCss, /\.trust-card,\s*\.contact-card\s*\{[\s\S]*overflow-wrap:\s*break-word;[\s\S]*word-break:\s*normal;/i, "Trust cards prevent mid-word letter splitting");
  assert.match(indexCss, /footer a,\s*footer p\s*\{[\s\S]*overflow-wrap:\s*break-word;[\s\S]*word-break:\s*normal;/i, "Footer copy prevents mid-word letter splitting");
  assert.match(indexCss, /\.sr-only\s*\{[\s\S]*position:\s*absolute\s*!important;[\s\S]*clip:\s*rect\(0,\s*0,\s*0,\s*0\)\s*!important;/i, "sr-only utility is properly defined with zero-footprint clipping");

  // 2. Verify admin.css safeguards
  const adminCss = await readFile(path.join(projectRoot, "src/styles/admin.css"), "utf8");
  assert.match(adminCss, /\.admin-nav-link\s*\{[\s\S]*white-space:\s*nowrap;[\s\S]*word-break:\s*keep-all;/i, "Admin nav links never break text vertically");
  assert.match(adminCss, /\.admin-data-table\s*\{[\s\S]*min-width:\s*860px;/i, "Admin tables guarantee comfortable min-width to avoid column squishing");
  assert.match(adminCss, /\.admin-data-table th\s*\{[\s\S]*word-break:\s*keep-all;/i, "Admin table headers prevent word breaking");

  // 3. Verify public button safeguards
  const homeRefCss = await readFile(path.join(projectRoot, "src/styles/homepage-reference.css"), "utf8");
  assert.match(homeRefCss, /\.home-ref-button\s*\{[\s\S]*white-space:\s*nowrap;[\s\S]*word-break:\s*keep-all;/i, "Homepage action buttons never break words across lines");

  const buyExpCss = await readFile(path.join(projectRoot, "src/styles/apple-buy-experience.css"), "utf8");
  assert.match(buyExpCss, /\.apple-buy-mobile-btn\s*\{[\s\S]*white-space:\s*nowrap;[\s\S]*word-break:\s*keep-all;/i, "Mobile buy action button never breaks words across lines");

  // 4. Verify editorial and component style safeguards
  const editorialCss = await readFile(path.join(projectRoot, "src/styles/editorial-product-story.css"), "utf8");
  assert.ok(!editorialCss.includes("overflow-wrap: anywhere"), "editorial-product-story.css has zero overflow-wrap: anywhere");

  const phonesCss = await readFile(path.join(projectRoot, "src/styles/phones-tablets.css"), "utf8");
  assert.ok(!phonesCss.includes("overflow-wrap: anywhere"), "phones-tablets.css has zero overflow-wrap: anywhere");

  const bagReviewCss = await readFile(path.join(projectRoot, "src/styles/bag-review.css"), "utf8");
  assert.ok(!bagReviewCss.includes("overflow-wrap: anywhere"), "bag-review.css has zero overflow-wrap: anywhere");

  // 5. Verify honeypot field in SuccessForm does not cause container overflow
  const successFormTsx = await readFile(path.join(projectRoot, "src/components/SuccessForm.tsx"), "utf8");
  assert.match(successFormTsx, /name="website"[\s\S]*position:\s*"absolute"[\s\S]*clip:\s*"rect\(0,\s*0,\s*0,\s*0\)"/, "Honeypot input has inline position: absolute clipping to protect document width");

  console.log("Word-breaking, typography, and responsive safeguards passed successfully!");
}
