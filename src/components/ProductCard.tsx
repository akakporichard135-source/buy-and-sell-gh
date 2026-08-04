import { Eye, MessageCircle, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import type { Product } from "../types/product";
import { formatGhs } from "../utils/format";
import { productWhatsAppUrl } from "../utils/whatsapp";
import { ProductVisual } from "./ProductVisual";

export function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const storage = product.storage[0];
  const color = product.colors[0];
  const isSoldOut = product.stockStatus === "Sold Out" || product.stockQuantity < 1;
  const badges = product.badges?.length ? product.badges : [product.badge, product.condition].filter(Boolean);

  return (
    <article className="group flex h-full min-h-[650px] flex-col rounded-lg border border-black/7 bg-white p-3 shadow-card transition hover:-translate-y-1 hover:shadow-xl">
      <ProductVisual product={product} />
      <div className="flex flex-1 flex-col p-2">
        <div className="mt-4 flex flex-wrap gap-2">
          {badges.slice(0, 3).map((badge) => (
            <span key={badge} className={`product-badge ${badge === "Sold Out" ? "product-badge-danger" : ""}`}>{badge}</span>
          ))}
        </div>
        <div className="mt-3 flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-extrabold uppercase text-gold-dark">{product.condition}</p>
            <h3 className="mt-1 text-lg font-black text-ink">{product.name}</h3>
          </div>
          <span className={`rounded-full px-2.5 py-1 text-xs font-black ${isSoldOut ? "bg-red-100 text-red-700" : "bg-warm text-ink"}`}>{product.stockStatus}</span>
        </div>
        <div className="mt-3 flex flex-wrap items-end gap-2">
          <p className="text-2xl font-black text-ink sm:text-3xl">{formatGhs(product.price)}</p>
          {product.oldPrice && <p className="pb-1 text-sm font-black text-ink/40 line-through">{formatGhs(product.oldPrice)}</p>}
        </div>
        <p className="mt-1 text-sm font-bold text-ink/60">Confirm availability before payment</p>
        <div className="mt-4 grid gap-2 text-base font-semibold text-ink/75">
          <span>Storage: {product.storage.join(", ")}</span>
          <span>Colours: {product.colors.slice(0, 3).join(", ")}</span>
        </div>
        <div className="mt-auto grid gap-2 pt-5">
          <Link className="btn-secondary" to={`/product/${product.slug}`}>
            <Eye size={17} /> View Details
          </Link>
          <button className="btn-primary disabled:cursor-not-allowed disabled:opacity-45" type="button" onClick={() => addItem(product)} disabled={isSoldOut}>
            <Plus size={17} /> {isSoldOut ? "Sold Out" : "Add to Cart"}
          </button>
          <a className="btn-ghost" href={productWhatsAppUrl(product, storage, color)} target="_blank" rel="noreferrer">
            <MessageCircle size={17} /> {isSoldOut ? "Request Restock" : "WhatsApp Enquiry"}
          </a>
        </div>
      </div>
    </article>
  );
}
