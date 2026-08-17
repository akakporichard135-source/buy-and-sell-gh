import type { Product } from "../types/product";
import { Link } from "react-router-dom";
import { ProductCard } from "./ProductCard";

export function ProductGrid({ products, variant = "default", className = "" }: { products: Product[]; variant?: "default" | "compact"; className?: string }) {
  if (!products.length) {
    return (
      <div className="rounded-lg border border-black/7 bg-white p-8 text-center text-ink/70">
        <strong className="block text-xl font-black text-ink">No matching products are listed right now.</strong>
        <p className="mx-auto mt-3 max-w-xl text-sm font-bold leading-6">Browse the full catalogue or send a pre-order request for the exact model you need.</p>
        <div className="mt-5 flex flex-col justify-center gap-3 sm:flex-row">
          <Link className="btn-secondary" to="/shop">Browse Catalogue</Link>
          <Link className="btn-primary" to="/pre-order">Pre-Order a Device</Link>
        </div>
      </div>
    );
  }

  return (
    <div className={`product-grid ${className}`}>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} variant={variant} />
      ))}
    </div>
  );
}
