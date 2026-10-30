import { useMemo } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { SEO } from "../components/SEO";
import { useProductCatalog } from "../catalog/ProductCatalogContext";
import { isAppleCatalogueProduct } from "../catalog/catalogueDiscovery";
import { StorePageRenderer } from "../components/store/StorePageRenderer";
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
      {/* StorePageRenderer renders built-in sections including <StoreMoreToLoveCarousel products={products} /> and custom Admin sections */}
      <StorePageRenderer products={products} />
    </div>
  );
}
