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
  const isPurchasable = isProductPurchasable(product);
  // iPhone Duo is strictly View Pricing only, never direct Buy
  const canDirectBuy = isPurchasable && product.slug !== "iphone-duo";
  const family = productFamilyForCard(product);
  const status = product.condition === "UK Used" ? "UK USED" : isPurchasable ? "IN STOCK" : "AVAILABLE ON REQUEST";
  const facts = storeCardFacts(product);

  return (
    <article className="store-product-card" aria-label={product.name}>
      <Link
        className="store-product-art"
        to={productStoryPath(family, product.slug)}
        aria-label={`Learn more about ${product.name}`}
        tabIndex={-1}
      >
        <ProductVisual product={product} imageVariant="catalogue" />
      </Link>
      <div className="store-product-body">
        <div className="store-product-meta-row">
          <span className={`store-product-badge ${status === "IN STOCK" ? "badge-in-stock" : status === "UK USED" ? "badge-uk-used" : "badge-request"}`}>
            {status}
          </span>
        </div>

        <h3 className="store-product-title" title={product.name}>
          <Link to={productStoryPath(family, product.slug)}>{product.name}</Link>
        </h3>

        {facts.length > 0 && (
          <p className="store-product-facts" title={facts.join(" \u00b7 ")}>
            {facts.slice(0, 3).join(" \u00b7 ")}
          </p>
        )}

        <div className={`store-product-price${enquiry ? " is-enquiry" : ""}`}>
          <span className="price-current">{enquiry ? "Request Pricing" : formatGhs(product.price)}</span>
          {!enquiry && Boolean(product.oldPrice) && <del className="price-old">{formatGhs(product.oldPrice!)}</del>}
        </div>

        <div className="store-product-actions">
          <div className="store-product-actions-primary-group">
            <Link className="btn-store-card-primary" to={productBuyPath(family, product.slug)}>
              {canDirectBuy ? "Buy" : "View Pricing"}
            </Link>

            {canDirectBuy && (
              <button
                type="button"
                className="btn-store-card-cart"
                title="Add to cart"
                aria-label={`Add ${product.name} to cart`}
                onClick={() => addItem(product, product.storage[0] || "", product.colors[0] || "")}
              >
                <ShoppingBag size={15} aria-hidden="true" />
              </button>
            )}
          </div>

          <Link className="btn-store-card-secondary" to={productStoryPath(family, product.slug)}>
            Learn more <ArrowRight size={13} aria-hidden="true" />
          </Link>
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
