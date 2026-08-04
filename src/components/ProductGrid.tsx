import type { Product } from "../types/product";
import { ProductCard } from "./ProductCard";

export function ProductGrid({ products }: { products: Product[] }) {
  if (!products.length) {
    return <div className="rounded-lg border border-black/7 bg-white p-8 text-center font-bold text-ink/70">No products match those filters yet.</div>;
  }

  return (
    <div className="product-grid">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
