import { MessageCircle, Plus, Search, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { products } from "../data/products";
import { formatGhs } from "../utils/format";
import { productWhatsAppUrl } from "../utils/whatsapp";

export function InstantSearch({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const { addItem } = useCart();

  useEffect(() => {
    if (!open) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.body.classList.add("instant-search-open");
    const id = window.setTimeout(() => inputRef.current?.focus(), 50);
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.clearTimeout(id);
      document.body.style.overflow = originalOverflow;
      document.body.classList.remove("instant-search-open");
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose, open]);

  const results = useMemo(() => {
    const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
    if (!terms.length) return products.slice(0, 5);
    return products
      .filter((product) => {
        const searchable = [
          product.name,
          product.model,
          product.category,
          product.condition,
          product.stockStatus,
          ...product.storage,
          ...product.colors,
          ...(product.tags ?? []),
        ].join(" ").toLowerCase();
        return terms.every((term) => searchable.includes(term));
      })
      .slice(0, 8);
  }, [query]);

  if (!open) return null;

  return (
    <div className="instant-search" role="dialog" aria-modal="true" aria-label="Instant product search">
      <button className="instant-search-backdrop" type="button" aria-label="Close search" onClick={onClose} />
      <div className="instant-search-panel">
        <label className="instant-search-input">
          <Search size={20} />
          <input ref={inputRef} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search iPhone 15, 256GB, Black, UK Used..." />
          {query && <button type="button" aria-label="Clear search" onClick={() => setQuery("")}><X size={20} /></button>}
        </label>
        <div className="mt-4 grid gap-3">
          {results.length > 0 ? (
            results.map((product) => (
              <article className="instant-search-result" key={product.id}>
                <Link className="instant-search-product-link" to={`/product/${product.slug}`} onClick={onClose}>
                  <img src={product.images[0].src} alt={product.images[0].alt} loading="lazy" />
                  <span>
                    <strong>{product.name}</strong>
                    <small>{product.condition} | {product.storage.join(", ")} | {formatGhs(product.price)}</small>
                  </span>
                  <em>{product.stockStatus}</em>
                </Link>
                <div className="instant-search-actions">
                  <button type="button" onClick={() => addItem(product)} disabled={product.stockStatus === "Sold Out" || product.stockQuantity < 1}>
                    <Plus size={15} /> Add
                  </button>
                  <a href={productWhatsAppUrl(product, product.storage[0], product.colors[0])} target="_blank" rel="noreferrer">
                    <MessageCircle size={15} /> WhatsApp
                  </a>
                </div>
              </article>
            ))
          ) : (
            <div className="rounded-lg border border-black/7 bg-white p-5 text-center font-bold text-ink/65">
              No matching products yet. Try another model, storage, colour or condition.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
