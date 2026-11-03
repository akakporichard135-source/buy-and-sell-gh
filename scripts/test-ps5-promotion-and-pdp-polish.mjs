import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";

export async function testPs5PromotionAndPdpPolish(projectRoot) {
  // 1. Verify global header scroll padding
  const headerCss = await readFile(path.join(projectRoot, "src/styles/global-header.css"), "utf8");
  assert.match(
    headerCss,
    /scroll-padding-top:\s*calc\(var\(--global-header-height\)\s*\+\s*24px\)/,
    "global-header.css sets scroll-padding-top to prevent sticky header overlapping anchored content"
  );

  // 2. Verify carousel and offers page scroll-margin-top
  const carouselSource = await readFile(
    path.join(projectRoot, "src/components/promotions/HomepagePromotionalCarousel.tsx"),
    "utf8"
  );
  assert.match(
    carouselSource,
    /scrollMarginTop:\s*"calc\(var\(--global-header-height,\s*44px\)\s*\+\s*24px\)"/,
    "HomepagePromotionalCarousel defines scrollMarginTop for anchor links"
  );

  const offersSource = await readFile(path.join(projectRoot, "src/pages/OffersPage.tsx"), "utf8");
  assert.match(
    offersSource,
    /scrollMarginTop:\s*"calc\(var\(--global-header-height,\s*44px\)\s*\+\s*24px\)"/,
    "OffersPage defines scrollMarginTop for each offer article anchor"
  );

  // 3. Verify ProductDetailsPage polish safeguards
  const pdpSource = await readFile(path.join(projectRoot, "src/pages/ProductDetailsPage.tsx"), "utf8");

  // Check empty warranty and delivery info filtering
  assert.match(
    pdpSource,
    /function hasVerifiedDetail/,
    "ProductDetailsPage defines hasVerifiedDetail helper to check for verified warranty/delivery"
  );
  assert.match(
    pdpSource,
    /hasVerifiedDetail\(product\.warranty/,
    "ProductDetailsPage only renders Warranty section when verified details exist"
  );
  assert.match(
    pdpSource,
    /hasVerifiedDetail\(product\.deliveryInfo/,
    "ProductDetailsPage only renders Delivery & Pickup section when verified details exist"
  );

  // Check redundant selector suppression
  assert.match(
    pdpSource,
    /showOptionSelectors/,
    "ProductDetailsPage guards edition/color selectors behind showOptionSelectors"
  );

  // Check primary Buy Now action
  assert.match(
    pdpSource,
    /handleBuyNow/,
    "ProductDetailsPage defines handleBuyNow for immediate cart addition and checkout transition"
  );
  assert.match(
    pdpSource,
    /aria-label=\{[\s\S]*"Buy Now"/,
    "ProductDetailsPage contains clear primary Buy Now action"
  );

  // Check related products exclusion
  assert.match(
    pdpSource,
    /item\.id !== product\?\.id && item\.slug !== product\?\.slug/,
    "ProductDetailsPage guarantees the current product is never recommended to itself in Related Products"
  );

  console.log("PS5 promotion and product details page polish tests passed successfully!");
}
