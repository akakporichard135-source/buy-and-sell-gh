import { Minus, Plus, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { ProductVisual } from "../components/ProductVisual";
import { SEO } from "../components/SEO";
import { useCart } from "../context/CartContext";
import { formatGhs } from "../utils/format";
import { checkoutWhatsAppUrl } from "../utils/whatsapp";

export function CartPage() {
  const { items, removeItem, updateQuantity, subtotal, clearCart } = useCart();

  return (
    <>
      <SEO title="Cart" description="Review selected Buy & Sell GH products and checkout through WhatsApp." />
      <section className="page-hero">
        <p className="eyebrow-dark">Cart</p>
        <h1>Your selected devices</h1>
        <p>Checkout continues through WhatsApp. Delivery and final availability are confirmed by the shop.</p>
      </section>
      <section className="section grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="grid gap-4">
          {items.length === 0 ? (
            <div className="rounded-lg border border-black/7 bg-white p-8 text-center shadow-card">
              <h2 className="text-2xl font-black">Your cart is empty</h2>
              <Link className="btn-primary mt-5" to="/shop">Browse Devices</Link>
            </div>
          ) : (
            items.map((item) => (
              <article className="grid gap-4 rounded-lg border border-black/7 bg-white p-4 shadow-card sm:grid-cols-[150px_1fr_auto]" key={`${item.product.id}-${item.storage}-${item.color}`}>
                <ProductVisual product={item.product} />
                <div>
                  <h2 className="text-xl font-black">{item.product.name}</h2>
                  <p className="mt-1 text-sm font-bold text-ink/60">{item.storage} | {item.color}</p>
                  <p className="mt-3 text-lg font-black">{formatGhs(item.product.price)}</p>
                </div>
                <div className="flex items-center gap-2 sm:flex-col sm:items-end">
                  <div className="flex items-center rounded-full border border-black/10">
                    <button className="p-2" type="button" aria-label="Decrease quantity" onClick={() => updateQuantity(item.product.id, item.storage, item.color, item.quantity - 1)}><Minus size={16} /></button>
                    <span className="min-w-8 text-center font-black">{item.quantity}</span>
                    <button className="p-2" type="button" aria-label="Increase quantity" onClick={() => updateQuantity(item.product.id, item.storage, item.color, item.quantity + 1)}><Plus size={16} /></button>
                  </div>
                  <button className="icon-button" type="button" aria-label="Remove item" onClick={() => removeItem(item.product.id, item.storage, item.color)}><Trash2 size={18} /></button>
                </div>
              </article>
            ))
          )}
        </div>
        <aside className="h-fit rounded-lg border border-black/7 bg-white p-6 shadow-card">
          <h2 className="text-2xl font-black">Order summary</h2>
          <div className="mt-5 flex justify-between border-t border-black/10 pt-5 text-lg font-black"><span>Subtotal</span><span>{formatGhs(subtotal)}</span></div>
          <p className="mt-3 text-sm leading-7 text-ink/65">Delivery note: pickup and delivery fees are confirmed on WhatsApp before payment.</p>
          <a className={`btn-primary mt-6 w-full ${items.length === 0 ? "pointer-events-none opacity-50" : ""}`} href={checkoutWhatsAppUrl(items)} target="_blank" rel="noreferrer">Checkout through WhatsApp</a>
          {items.length > 0 && <button className="btn-ghost mt-3 w-full" type="button" onClick={clearCart}>Clear cart</button>}
        </aside>
      </section>
    </>
  );
}
