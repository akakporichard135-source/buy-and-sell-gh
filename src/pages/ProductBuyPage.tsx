import { useMemo } from "react";
import { useParams } from "react-router-dom";
import { useProductCatalog } from "../catalog/ProductCatalogContext";
import {
  familyMatchesProduct,
  type ProductFamilyKey,
} from "../catalog/productExperience";
import type { Product } from "../types/product";
import { getIpadFamily, getMacbookFamily, getWatchFamily } from "../utils/productPresentation";

import { IphoneBuyExperience } from "../components/buy/IphoneBuyExperience";
import { WatchSeries12BuyExperience } from "../components/buy/WatchSeries12BuyExperience";
import { WatchUltraBuyExperience } from "../components/buy/WatchUltraBuyExperience";
import { AirpodsBuyExperience } from "../components/buy/AirpodsBuyExperience";
import { MacbookBuyExperience } from "../components/buy/MacbookBuyExperience";
import { MacMiniBuyExperience } from "../components/buy/MacMiniBuyExperience";
import { IpadBuyExperience } from "../components/buy/IpadBuyExperience";
import { IphoneDuoPricingExperience } from "../components/buy/IphoneDuoPricingExperience";
import { GenericBuyExperience } from "../components/buy/GenericBuyExperience";

export function ProductBuyPage({ family }: { family: ProductFamilyKey }) {
  const { slug = "" } = useParams();
  const { activeProducts, loading } = useProductCatalog();

  const candidates = useMemo(() => resolveCandidates(activeProducts, family, slug), [activeProducts, family, slug]);
  const primaryProduct = candidates[0];

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

  // 5. AirPods 5 / Standard AirPods
  if (family === "airpods" && (slug === "airpods-5" || !slug.includes("max"))) {
    return <AirpodsBuyExperience catalogProduct={primaryProduct} />;
  }

  // 6. Mac mini Pre-order
  if (family === "mac" && slug === "mac-mini") {
    return <MacMiniBuyExperience catalogProduct={primaryProduct} />;
  }

  // 7. MacBook Air
  if (family === "mac" && (slug === "macbook-air" || slug.includes("air"))) {
    return <MacbookBuyExperience catalogProduct={primaryProduct} />;
  }

  // 8. iPad Air
  if (family === "ipad" && (slug === "ipad-air" || slug.includes("air"))) {
    return <IpadBuyExperience catalogProduct={primaryProduct} />;
  }

  // Fallback for general catalogue items / older models
  return <GenericBuyExperience product={primaryProduct} family={family} slug={slug} />;
}

function resolveCandidates(products: Product[], family: ProductFamilyKey, slug: string) {
  const familyProducts = products.filter((product) => familyMatchesProduct(product, family));
  const exact = familyProducts.find((product) => product.slug === slug);
  if (exact) return [exact];
  if (family === "mac" && slug === "macbook-air") return familyProducts.filter((product) => getMacbookFamily(product) === "MacBook Air");
  if (family === "mac" && slug === "macbook-pro") return familyProducts.filter((product) => getMacbookFamily(product) === "MacBook Pro");
  if (family === "ipad" && slug === "ipad-air") return familyProducts.filter((product) => getIpadFamily(product) === "iPad Air");
  if (family === "watch" && slug.includes("ultra")) return familyProducts.filter((product) => getWatchFamily(product) === "Apple Watch Ultra");
  if (family === "watch" && slug.includes("series")) return familyProducts.filter((product) => getWatchFamily(product) === "Apple Watch Series");
  return [];
}
