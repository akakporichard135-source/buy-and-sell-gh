import { useMemo } from "react";
import { useParams } from "react-router-dom";
import { useProductCatalog } from "../catalog/ProductCatalogContext";
import {
  familyMatchesProduct,
  type ProductFamilyKey,
} from "../catalog/productExperience";
import type { Product } from "../types/product";

import { AirpodsBuyExperience } from "../components/buy/AirpodsBuyExperience";
import { IphoneDuoPricingExperience } from "../components/buy/IphoneDuoPricingExperience";
import { GenericBuyExperience } from "../components/buy/GenericBuyExperience";
import { AppleDeviceConfigurator } from "../components/buy/AppleDeviceConfigurator";


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

  // Keep the legacy enquiry page only while iPhone Duo is explicitly enquiry-only.
  if (slug === "iphone-duo" && (!primaryProduct || primaryProduct.priceOnRequest || primaryProduct.price <= 0)) {
    return <IphoneDuoPricingExperience />;
  }

  // Unified real-catalog Apple-style step-by-step configurator for Mac, iPad, iPhone & Apple Watch
  if (family === "mac" || family === "ipad" || family === "iphone" || family === "watch") {
    return (
      <AppleDeviceConfigurator
        category={family}
        initialProduct={primaryProduct}
        slug={slug}
      />
    );
  }

  // AirPods Pro 3 and AirPods Max models use GenericBuyExperience for authentic color swatches
  if (family === "airpods" && (slug.includes("max") || slug === "airpods-pro-3")) {
    return <GenericBuyExperience product={primaryProduct} family={family} slug={slug} />;
  }

  // AirPods 5 / 4
  if (family === "airpods" && (slug === "airpods-5" || slug === "airpods-4")) {
    return <AirpodsBuyExperience catalogProduct={primaryProduct} />;
  }

  // Fallback for accessories and general catalogue items
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
