import { ArrowRight, Eye, ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";
import { isProductPurchasable } from "../catalog/productCatalog";
import { productBuyPath, productStoryPath, type ProductFamilyKey } from "../catalog/productExperience";
import { hasUsableLearnMoreContent } from "../cms/learnMoreRepository";
import type { Product } from "../types/product";
import { formatGhs } from "../utils/format";
import { getCardPriceDisplay } from "../utils/productPricing";
import { storeCardFacts } from "../utils/storePresentation";
import { ProductVisual } from "./ProductVisual";

export function StoreProductCard({ product }: { product: Product }) {
  const priceDisplay = getCardPriceDisplay(product);
  const enquiry = priceDisplay.isEnquiry;
  const isPurchasable = isProductPurchasable(product);
  // iPhone Duo is strictly View Pricing only, never direct Buy
  const canDirectBuy = isPurchasable && product.slug !== "iphone-duo";
  const family = productFamilyForCard(product);
  const status = product.condition === "UK Used" ? "UK USED" : isPurchasable ? "IN STOCK" : "AVAILABLE ON REQUEST";
  const facts = storeCardFacts(product);
  const hasStory = hasUsableLearnMoreContent(product.slug);
  const buyPath = productBuyPath(family, product.slug);
  const storyPath = productStoryPath(family, product.slug);
  const targetPath = hasStory ? storyPath : buyPath;

  return (
    <article className="store-product-card" aria-label={product.name}>
      <Link
        className="store-product-art"
        to={targetPath}
        aria-label={hasStory ? `Learn more about ${product.name}` : `View ${product.name}`}
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
          <Link to={targetPath}>{product.name}</Link>
        </h3>

        {facts.length > 0 && (
          <p className="store-product-facts" title={facts.join(" \u00b7 ")}>
            {facts.slice(0, 3).join(" \u00b7 ")}
          </p>
        )}

        <div className={`store-product-price${enquiry ? " is-enquiry" : ""}`}>
          <span className="price-current">{priceDisplay.current}</span>
          {priceDisplay.previous && <del className="price-old">{priceDisplay.previous}</del>}
        </div>

        <div className="store-product-actions">
          <div className="store-product-actions-primary-group">
            <Link className="btn-store-card-primary" to={buyPath}>
              {canDirectBuy ? "Buy" : "View Pricing"}
            </Link>

            {canDirectBuy && (
              <Link
                to={buyPath}
                className="btn-store-card-cart"
                title="Configure and buy"
                aria-label={`Configure ${product.name} to buy`}
              >
                <ShoppingBag size={15} aria-hidden="true" />
              </Link>
            )}
          </div>

          {hasStory && (
            <Link className="btn-store-card-secondary" to={storyPath}>
              Learn more <ArrowRight size={13} aria-hidden="true" />
            </Link>
          )}
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
