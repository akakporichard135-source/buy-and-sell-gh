import { useMemo } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { SEO } from "../components/SEO";
import { useProductCatalog } from "../catalog/ProductCatalogContext";
import { isAppleCatalogueProduct } from "../catalog/catalogueDiscovery";
import { StoreHeroIntro } from "../components/store/StoreHeroIntro";
import { StoreProductFamilyStrip } from "../components/store/StoreProductFamilyStrip";
import { StoreLatestCarousel, StoreMoreToLoveCarousel } from "../components/store/StoreLatestCarousel";
import { StoreCategoryCards } from "../components/store/StoreCategoryCards";
import { StoreHelpCards } from "../components/store/StoreHelpCards";
import { StoreAccessoriesCarousel } from "../components/store/StoreAccessoriesCarousel";
import { StoreDifferenceCards } from "../components/store/StoreDifferenceCards";
import "../styles/store.css";

export function ShopPage() {
  const { search } = useLocation();
  const { activeProducts } = useProductCatalog();
  const products = useMemo(() => activeProducts.filter(isAppleCatalogueProduct), [activeProducts]);
  const category = new URLSearchParams(search).get("category")?.toLowerCase();
  const categoryPath: Record<string, string> = {
    phones: "/iphone",
    laptops: "/mac",
    tablets: "/ipad",
    watches: "/watch",
    audio: "/airpods",
    accessories: "/accessories",
  };

  if (category && categoryPath[category]) {
    return <Navigate to={categoryPath[category]} replace />;
  }

  return (
    <div className="store-page">
      <SEO
        title="Store - Buy & Sell GH | The Best Way to Buy the Products You Love"
        description="Explore iPhone, Mac, iPad, Apple Watch, AirPods and original accessories from Buy & Sell GH in Accra."
      />
      <StoreHeroIntro />
      <StoreProductFamilyStrip />
      <StoreLatestCarousel products={products} />
      <StoreCategoryCards />
      <StoreHelpCards />
      <StoreMoreToLoveCarousel products={products} />
      <StoreAccessoriesCarousel products={products} />
      <StoreDifferenceCards />
    </div>
  );
}
