import { useMemo } from "react";
import { useParams } from "react-router-dom";
import { useProductCatalog } from "../catalog/ProductCatalogContext";
import {
  familyMatchesProduct,
  type ProductFamilyKey,
} from "../catalog/productExperience";
import type { Product } from "../types/product";

import { IphoneBuyExperience } from "../components/buy/IphoneBuyExperience";
import { WatchSeries12BuyExperience } from "../components/buy/WatchSeries12BuyExperience";
import { WatchUltraBuyExperience } from "../components/buy/WatchUltraBuyExperience";
import { AirpodsBuyExperience } from "../components/buy/AirpodsBuyExperience";
import { MacbookBuyExperience } from "../components/buy/MacbookBuyExperience";
import { MacbookProBuyExperience } from "../components/buy/MacbookProBuyExperience";
import { MacMiniBuyExperience } from "../components/buy/MacMiniBuyExperience";
import { IpadBuyExperience } from "../components/buy/IpadBuyExperience";
import { IpadProBuyExperience } from "../components/buy/IpadProBuyExperience";
import { IphoneDuoPricingExperience } from "../components/buy/IphoneDuoPricingExperience";
import { GenericBuyExperience } from "../components/buy/GenericBuyExperience";


export function ProductBuyPage({ family }: { family: ProductFamilyKey }) {
  const { slug = "" } = useParams();
  const { activeProducts, products: allProducts, backendStatus } = useProductCatalog();

  const candidates = useMemo(() => {
    const exact = allProducts.find((product) => product.slug === slug && familyMatchesProduct(product, family));
    if (exact) return [exact];
    const active = resolveCandidates(activeProducts, family, slug);
    if (active.length > 0) return active;
    const all = resolveCandidates(allProducts, family, slug);
    if (all.length > 0) return all;
    return [];
  }, [activeProducts, allProducts, family, slug]);
  const primaryProduct = candidates[0];

  if (backendStatus === "error") {
    return <section className="page-hero"><h1>Catalogue unavailable</h1><p>Product details could not be loaded. Please try again shortly.</p></section>;
  }
  if (backendStatus !== "supabase" && import.meta.env.PROD) {
    return <section className="page-hero"><h1>Loading product</h1><p>Please wait while the catalogue loads.</p></section>;
  }
  if (!primaryProduct && backendStatus === "supabase") {
    return <GenericBuyExperience family={family} slug={slug} />;
  }

  // 1. iPhone Duo: Special VIEW PRICING Experience
  if (slug === "iphone-duo") {
    return <IphoneDuoPricingExperience />;
  }

  // 2. iPhone 18 Pro & Pro Max
  if (family === "iphone" && (slug === "iphone-18-pro" || slug === "iphone-18-pro-max")) {
    return <IphoneBuyExperience catalogProduct={primaryProduct} />;
  }

  // 3. Apple Watch Ultra 4 / Ultra models
  if (family === "watch" && (slug === "apple-watch-ultra-4" || slug.includes("ultra"))) {
    return <WatchUltraBuyExperience catalogProduct={primaryProduct} />;
  }

  // 4. Apple Watch Series 12 / Series models
  if (family === "watch" && (slug === "apple-watch-series-12" || slug.includes("series"))) {
    return <WatchSeries12BuyExperience catalogProduct={primaryProduct} />;
  }

  // AirPods Pro 3 and AirPods Max models use GenericBuyExperience for authentic color swatches
  if (family === "airpods" && (slug.includes("max") || slug === "airpods-pro-3")) {
    return <GenericBuyExperience product={primaryProduct} family={family} slug={slug} />;
  }

  // 5. AirPods 5 / 4
  if (family === "airpods" && (slug === "airpods-5" || slug === "airpods-4")) {
    return <AirpodsBuyExperience catalogProduct={primaryProduct} />;
  }

  // 6. Mac mini Pre-order
  if (family === "mac" && slug === "mac-mini") {
    return <MacMiniBuyExperience catalogProduct={primaryProduct} />;
  }

  // 7. MacBook Pro (14-inch & 16-inch M4 / M4 Pro / M4 Max)
  if (family === "mac" && (slug === "macbook-pro" || slug.includes("macbook-pro") || slug.includes("pro"))) {
    return <MacbookProBuyExperience catalogProduct={primaryProduct} />;
  }

  // 8. MacBook Air
  if (family === "mac" && (slug === "macbook-air" || slug.includes("air"))) {
    return <MacbookBuyExperience catalogProduct={primaryProduct} />;
  }

  // 9. iPad Pro (11-inch & 13-inch Ultra Retina XDR)
  if (family === "ipad" && (slug === "ipad-pro" || slug.includes("ipad-pro") || slug.includes("pro"))) {
    if (slug === "ipad-pro" && (backendStatus !== "supabase" || primaryProduct?.condition !== "Brand New" ||
      !primaryProduct.variants?.some((variant) => variant.screenSize))) {
      return <GenericBuyExperience product={backendStatus === "supabase" ? primaryProduct : undefined} family={family} slug={slug} />;
    }
    return <IpadProBuyExperience catalogProduct={primaryProduct} />;
  }

  // 10. iPad Air
  if (family === "ipad" && (slug === "ipad-air" || slug.includes("air"))) {
    return <IpadBuyExperience catalogProduct={primaryProduct} />;
  }

  // Fallback for general catalogue items / older models
  return <GenericBuyExperience product={primaryProduct} family={family} slug={slug} />;
}

function resolveCandidates(products: Product[], family: ProductFamilyKey, slug: string): Product[] {
  if (!slug) return [];

  // 1. Direct exact slug match across all active products
  const exact = products.find((product) => product.slug === slug);
  if (exact) return [exact];

  // 2. Normalized slug match (e.g. handles "-inch-" variations: macbook-pro-16-inch-m4-pro-max <-> macbook-pro-16-m4-pro-max)
  const normSlug = slug.replace(/-inch-/g, "-").toLowerCase();
  const normalized = products.find((product) => product.slug.replace(/-inch-/g, "-").toLowerCase() === normSlug);
  if (normalized) return [normalized];

  // 3. Family-filtered candidates
  const familyProducts = products.filter((product) => familyMatchesProduct(product, family));
  const familySlugMatch = familyProducts.find(
    (product) => product.slug === slug || product.slug.replace(/-inch-/g, "-").toLowerCase() === normSlug
  );
  if (familySlugMatch) return [familySlugMatch];

  if (family === "accessories" && slug === "charging-and-power") {
    const magsafe = familyProducts.find((product) => product.slug === "apple-magsafe-charger");
    if (magsafe) return [magsafe];
    const adapter30 = familyProducts.find((product) => product.slug === "apple-30w-usb-c-power-adapter");
    if (adapter30) return [adapter30];
  }

  return [];
}
