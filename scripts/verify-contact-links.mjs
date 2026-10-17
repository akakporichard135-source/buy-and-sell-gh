import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";

async function verify() {
  console.log("============================================================");
  console.log("  VERIFYING CONTACT PHONE & WHATSAPP UPDATES (0551975451)   ");
  console.log("============================================================\n");

  const projectRoot = process.cwd();

  // 1. Verify business.ts
  console.log("[CHECK 1] Inspecting src/config/business.ts...");
  const businessCode = await readFile(path.join(projectRoot, "src/config/business.ts"), "utf8");
  assert.ok(!businessCode.includes("024 418 2149"), "business.ts does not contain old phone number");
  assert.ok(!businessCode.includes("233244182149"), "business.ts does not contain old WhatsApp number");
  assert.match(businessCode, /primary:\s*"233551975451"/, "business.ts primary WhatsApp is 233551975451");
  assert.match(businessCode, /secondary:\s*"233551975451"/, "business.ts secondary WhatsApp is 233551975451");
  assert.match(businessCode, /"055 197 5451"/, "business.ts has 055 197 5451");
  console.log("  [PASS] src/config/business.ts verified.");

  // 2. Verify defaultCmsData.ts
  console.log("\n[CHECK 2] Inspecting src/cms/defaultCmsData.ts...");
  const defaultCmsCode = await readFile(path.join(projectRoot, "src/cms/defaultCmsData.ts"), "utf8");
  assert.ok(!defaultCmsCode.includes("024 418 2149"), "defaultCmsData.ts does not contain old phone number");
  assert.ok(!defaultCmsCode.includes("233244182149"), "defaultCmsData.ts does not contain old WhatsApp number");
  assert.match(defaultCmsCode, /primary:\s*"233551975451"/, "defaultCmsData.ts primary WhatsApp is 233551975451");
  console.log("  [PASS] src/cms/defaultCmsData.ts verified.");

  // 3. Verify supabaseCmsRepository.ts
  console.log("\n[CHECK 3] Inspecting src/cms/supabaseCmsRepository.ts...");
  const repoCode = await readFile(path.join(projectRoot, "src/cms/supabaseCmsRepository.ts"), "utf8");
  assert.match(repoCode, /sanitizeSiteSettings/, "supabaseCmsRepository.ts has sanitizeSiteSettings");
  assert.match(repoCode, /newPhone = "055 197 5451"/, "Sanitizes phone to 055 197 5451");
  assert.match(repoCode, /newWa = "233551975451"/, "Sanitizes WhatsApp to 233551975451");
  console.log("  [PASS] src/cms/supabaseCmsRepository.ts verified.");

  // 4. Verify StoreCategoryIntro.tsx and StoreCategoryTrustBar.tsx
  console.log("\n[CHECK 4] Inspecting Category Pages (Intro & TrustBar)...");
  const introCode = await readFile(path.join(projectRoot, "src/components/store/category/StoreCategoryIntro.tsx"), "utf8");
  assert.ok(!introCode.includes("233244182149"), "StoreCategoryIntro does not have old WhatsApp number");
  assert.match(introCode, /https:\/\/wa\.me\/233551975451/, "StoreCategoryIntro uses https://wa.me/233551975451");

  const trustBarCode = await readFile(path.join(projectRoot, "src/components/store/category/StoreCategoryTrustBar.tsx"), "utf8");
  assert.ok(!trustBarCode.includes("233244182149"), "StoreCategoryTrustBar does not have old WhatsApp number");
  assert.match(trustBarCode, /https:\/\/wa\.me\/233551975451/, "StoreCategoryTrustBar uses https://wa.me/233551975451");
  console.log("  [PASS] Category components verified.");

  // 5. Verify Footer.tsx
  console.log("\n[CHECK 5] Inspecting Footer.tsx...");
  const footerCode = await readFile(path.join(projectRoot, "src/components/Footer.tsx"), "utf8");
  assert.match(footerCode, /tel:\+\$\{primaryWhatsApp\.replace\(\/\^\\\+\/, ""\)\}/, "Footer call link uses tel:+233551975451 pattern");
  assert.match(footerCode, /https:\/\/wa\.me\/\$\{primaryWhatsApp\.replace\(\/\^\\\+\/, ""\)\}/, "Footer WhatsApp link uses https://wa.me/233551975451 pattern");
  console.log("  [PASS] Footer.tsx verified.");

  // 6. Verify ContactPage.tsx
  console.log("\n[CHECK 6] Inspecting ContactPage.tsx...");
  const contactCode = await readFile(path.join(projectRoot, "src/pages/ContactPage.tsx"), "utf8");
  assert.match(contactCode, /tel:\+\$\{waPrimary\.replace\(\/\^\\\+\/, ""\)\}/, "ContactPage call link uses tel:+233551975451 pattern");
  console.log("  [PASS] ContactPage.tsx verified.");

  // 7. Verify ProductDetailsPage.tsx
  console.log("\n[CHECK 7] Inspecting ProductDetailsPage.tsx...");
  const productCode = await readFile(path.join(projectRoot, "src/pages/ProductDetailsPage.tsx"), "utf8");
  assert.match(productCode, /tel:\+\$\{business\.whatsapp\.primary\.replace\(\/\^\\\+\/, ""\)\}/, "ProductDetailsPage Call Shop button uses tel:+233551975451 pattern");
  console.log("  [PASS] ProductDetailsPage.tsx verified.");

  // 8. Verify AdminPagesManager.tsx
  console.log("\n[CHECK 8] Inspecting AdminPagesManager.tsx...");
  const adminPagesCode = await readFile(path.join(projectRoot, "src/pages/admin/AdminPagesManager.tsx"), "utf8");
  assert.ok(!adminPagesCode.includes("233244182149"), "AdminPagesManager does not have old WhatsApp placeholder");
  assert.match(adminPagesCode, /placeholder="233551975451"/, "AdminPagesManager has 233551975451 placeholder");
  console.log("  [PASS] AdminPagesManager.tsx verified.");

  // 9. Scan entire codebase for any remaining traces of 244182149 or 418 2149 (excluding the sanitizer replacement mapping)
  console.log("\n[CHECK 9] Scanning all source files for any leftover legacy phone numbers...");
  const gitGrepOutput = await new Promise((resolve) => {
    import("node:child_process").then(({ exec }) => {
      exec("git grep -I -n -E \"244182149|418 2149|4182149\" src/ | grep -v \"oldPhoneDigits\" | grep -v \"oldWaDigits\"", (err, stdout) => {
        resolve(stdout || "");
      });
    });
  });
  assert.equal(gitGrepOutput.trim(), "", `Found leftover old numbers in source code:\n${gitGrepOutput}`);
  console.log("  [PASS] Zero legacy phone numbers remain in user-facing source code!");

  console.log("\n============================================================");
  console.log("  ALL CONTACT PHONE & WHATSAPP CHECKS PASSED 100%!           ");
  console.log("============================================================\n");
}

verify().catch((err) => {
  console.error("Verification failed:", err);
  process.exit(1);
});
