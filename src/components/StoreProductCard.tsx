import { ArrowRight, Eye, ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";
import { isProductPurchasable } from "../catalog/productCatalog";
import { productBuyPath, productStoryPath, type ProductFamilyKey } from "../catalog/productExperience";
import { useCart } from "../context/CartContext";
import type { Product } from "../types/product";
import { formatGhs } from "../utils/format";
import { storeCardFacts } from "../utils/storePresentation";
import { ProductVisual } from "./ProductVisual";

export function StoreProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const enquiry = product.priceOnRequest === true || product.price <= 0;
  const purchasable = isProductPurchasable(product);
  const family = productFamilyForCard(product);
  const status = product.condition === "UK Used" ? "UK USED" : purchasable ? "IN STOCK" : "AVAILABLE ON REQUEST";
  const facts = storeCardFacts(product);

  return (
    <article className="store-product-card" aria-label={product.name}>
      <Link className="store-product-art" to={productStoryPath(family, product.slug)} aria-label={`Learn more about ${product.name}`} tabIndex={-1}>
        <ProductVisual product={product} imageVariant="catalogue" />
      </Link>
      <div className="store-product-body">
        <h2 title={product.name}><Link to={productStoryPath(family, product.slug)}>{product.name}</Link></h2>
        <div className={`store-product-price${enquiry ? " is-enquiry" : ""}`}>
          <span>{enquiry ? "Request Pricing" : formatGhs(product.price)}</span>
          {!enquiry && Boolean(product.oldPrice) && <del>{formatGhs(product.oldPrice!)}</del>}
        </div>
        <p className="store-product-facts" title={facts.join(" \u00b7 ")}>{facts.join(" \u00b7 ")}</p>
        <div className="store-product-status"><span>{status}</span></div>
        <div className="store-product-actions">
          <Link className="btn-primary" to={productStoryPath(family, product.slug)}><Eye size={16} /> Learn More</Link>
          <div className="store-product-secondary">
            <Link to={productBuyPath(family, product.slug)}><ArrowRight size={17} /> {purchasable ? "Buy" : "View Pricing"}</Link>
            {purchasable && <button type="button" title="Add to cart" aria-label={`Add ${product.name} to cart`} onClick={() => addItem(product, product.storage[0], product.colors[0])}><ShoppingBag size={18} /></button>}
          </div>
        </div>
      </div>
    </article>
  );
}

function productFamilyForCard(product: Product): ProductFamilyKey {
  if (product.category === "iPhones") return "iphone";
  if (product.category === "MacBooks") return "mac";
  if (product.category === "iPads") return "ipad";
  if (product.category === "Apple Watches") return "watch";
  if (product.category === "AirPods") return "airpods";
  return "accessories";
}
