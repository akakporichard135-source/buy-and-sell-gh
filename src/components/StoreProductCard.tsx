import { Eye, MessageCircle, ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";
import { isProductPurchasable, normalizeStockStatus } from "../catalog/productCatalog";
import { useCart } from "../context/CartContext";
import type { Product } from "../types/product";
import { formatGhs } from "../utils/format";
import { storeCardFacts } from "../utils/storePresentation";
import { productWhatsAppUrl } from "../utils/whatsapp";
import { ProductVisual } from "./ProductVisual";

export function StoreProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const enquiry = product.priceOnRequest === true || product.price <= 0;
  const purchasable = isProductPurchasable(product);
  const stock = normalizeStockStatus(product);
  const status = enquiry ? "Availability to confirm" : stock;
  const facts = storeCardFacts(product);

  return (
    <article className="store-product-card" aria-label={product.name}>
      <Link className="store-product-art" to={`/product/${product.slug}`} aria-label={`View ${product.name}`} tabIndex={-1}>
        <ProductVisual product={product} imageVariant="catalogue" />
      </Link>
      <div className="store-product-body">
        <h2 title={product.name}><Link to={`/product/${product.slug}`}>{product.name}</Link></h2>
        <div className={`store-product-price${enquiry ? " is-enquiry" : ""}`}>
          <span>{enquiry ? "Contact for Price" : formatGhs(product.price)}</span>
          {!enquiry && Boolean(product.oldPrice) && <del>{formatGhs(product.oldPrice!)}</del>}
        </div>
        <p className="store-product-facts" title={facts.join(" \u00b7 ")}>{facts.join(" \u00b7 ")}</p>
        <div className="store-product-status"><span>{status}</span></div>
        <div className="store-product-actions">
          <Link className="btn-primary" to={`/product/${product.slug}`}><Eye size={16} /> View Details</Link>
          <div className="store-product-secondary">
            <a href={productWhatsAppUrl(product, product.storage[0], product.colors[0])} target="_blank" rel="noopener noreferrer">
              <MessageCircle size={17} /> {enquiry || purchasable ? "WhatsApp" : "Request Restock"}
            </a>
            {purchasable && <button type="button" title="Add to cart" aria-label={`Add ${product.name} to cart`} onClick={() => addItem(product, product.storage[0], product.colors[0])}><ShoppingBag size={18} /></button>}
          </div>
        </div>
      </div>
    </article>
  );
}
