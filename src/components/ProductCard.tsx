import { Eye, MessageCircle, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { isProductUnavailable } from "../catalog/productCatalog";
import type { Product } from "../types/product";
import { formatGhs } from "../utils/format";
import { getMacbookGeneration, getProductBadges, normalizeDisplayBadge, productBadgeClass } from "../utils/productPresentation";
import { productWhatsAppUrl } from "../utils/whatsapp";
import { ProductVisual } from "./ProductVisual";

export function ProductCard({ product, variant = "default" }: { product: Product; variant?: "default" | "compact" }) {
  const { addItem } = useCart();
  const storage = product.storage[0];
  const color = product.colors[0];
  const isSoldOut = isProductUnavailable(product);
  const isPriceOnRequest = product.priceOnRequest === true || product.price <= 0;
  const isCompact = variant === "compact";
  const badges = getProductBadges(product, 1);
  const conditionLabel = normalizeDisplayBadge(product.condition);
  const stockLabel = normalizeDisplayBadge(product.stockStatus);
  const displayStockLabel = isPriceOnRequest ? "Availability To Confirm" : stockLabel;
  const storageSummary = isCompact ? storage : product.storage.slice(0, 3).join(" \u2022 ");
  const colourSummary = product.colors.length === 1 ? product.colors[0] : `${product.colors.length} available`;
  const primaryOptionLabel = product.category === "Apple Watches"
    ? "Connectivity"
    : product.category === "AirPods"
      ? "Case / Connector"
      : product.category === "Accessories"
        ? "Connector / Option"
        : "Storage";
  const macbookChip = product.category === "MacBooks" ? getMacbookGeneration(product) : "";
  const macbookMemory = product.category === "MacBooks"
    ? (product.specifications ?? product.specs).find((item) => item.startsWith("Memory options:"))?.replace("Memory options:", "").trim()
    : "";

  return (
    <article className={`product-card ${isCompact ? "compact-product-card" : ""} group flex h-full min-w-0 flex-col rounded-lg border border-black/7 bg-white p-3 shadow-card transition hover:-translate-y-1 hover:shadow-xl`}>
      <ProductVisual product={product} />
      <div className="product-card-body">
        <div className="product-card-badges">
          {badges.map((badge) => (
            <span key={badge} className={productBadgeClass(badge)}>{badge}</span>
          ))}
        </div>
        <div className="product-card-heading">
          <span className={productBadgeClass(conditionLabel)}>{conditionLabel}</span>
          <h3>{product.name}</h3>
        </div>
        <div className="product-card-price-row">
          <p>{isPriceOnRequest ? "Contact for Price" : formatGhs(product.price)}</p>
          {!isPriceOnRequest && product.oldPrice && <span>{formatGhs(product.oldPrice)}</span>}
        </div>
        <div className="product-card-meta">
          {macbookChip && <span>Chip: {macbookChip}</span>}
          {!isCompact && macbookMemory && <span>Memory: {macbookMemory}</span>}
          <span>{primaryOptionLabel}: {storageSummary}</span>
          {!isCompact && <span>Colours: {colourSummary}</span>}
          <span className={productBadgeClass(displayStockLabel)}>{displayStockLabel}</span>
        </div>
        <div className="product-card-actions">
          <button className="btn-primary disabled:cursor-not-allowed disabled:opacity-45" type="button" onClick={() => addItem(product, storage, color)} disabled={isSoldOut}>
            <Plus size={17} /> {isPriceOnRequest ? "Contact for Price" : isSoldOut ? stockLabel : "Add to Cart"}
          </button>
          <div className="product-card-secondary-actions">
            <Link className="btn-secondary" to={`/product/${product.slug}`}>
              <Eye size={17} /> View Details
            </Link>
            <a className="btn-ghost" href={productWhatsAppUrl(product, storage, color)} target="_blank" rel="noreferrer">
              <MessageCircle size={17} /> {isPriceOnRequest ? "Ask on WhatsApp" : isSoldOut ? "Request Restock" : "WhatsApp"}
            </a>
          </div>
        </div>
      </div>
    </article>
  );
}
