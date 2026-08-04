import { Menu, Search, ShoppingBag, X } from "lucide-react";
import { useState } from "react";
import { NavLink } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { Logo } from "./Logo";
import { InstantSearch } from "./InstantSearch";
import { WhatsAppButton } from "./WhatsAppButton";

const navItems = [
  { label: "Home", to: "/" },
  { label: "Shop", to: "/shop" },
  { label: "Sell or Trade", to: "/sell-or-trade" },
  { label: "Device Request", to: "/device-request" },
  { label: "About", to: "/about" },
  { label: "Contact", to: "/contact" },
];

export function Header() {
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { totalItems } = useCart();
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `rounded-full px-2 py-2 text-sm font-extrabold transition ${
      isActive ? "bg-warm text-gold-dark" : "text-ink/75 hover:bg-black/5 hover:text-ink"
    }`;

  return (
    <header className="sticky top-0 z-50 border-b border-black/8 bg-white/96 shadow-sm backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <Logo />
        <nav className="hidden items-center gap-2 xl:gap-4 lg:flex" aria-label="Main navigation">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} className={linkClass}>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="hidden items-center gap-2 lg:flex">
          <button className="icon-button" type="button" aria-label="Search products" onClick={() => setSearchOpen(true)}>
            <Search size={19} />
          </button>
          <NavLink to="/cart" className="icon-button relative" aria-label="Open cart">
            <ShoppingBag size={19} />
            {totalItems > 0 && <span className="cart-dot">{totalItems}</span>}
          </NavLink>
          <WhatsAppButton className="px-5 py-3 shadow-gold">WhatsApp</WhatsAppButton>
        </div>
        <button className="icon-button h-12 w-12 lg:hidden" type="button" aria-label="Open menu" onClick={() => setOpen(true)}>
          <Menu size={25} />
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 bg-black/45 lg:hidden" role="dialog" aria-modal="true">
          <div className="ml-auto flex h-full w-[min(88vw,380px)] flex-col bg-white p-5 shadow-2xl">
            <div className="mb-8 flex items-center justify-between">
              <Logo />
              <button className="icon-button h-12 w-12" type="button" aria-label="Close menu" onClick={() => setOpen(false)}>
                <X size={22} />
              </button>
            </div>
            <nav className="grid gap-2" aria-label="Mobile navigation">
              {navItems.map((item) => (
                <NavLink key={item.to} to={item.to} className="rounded-xl px-3 py-3 text-base font-extrabold text-ink hover:bg-warm" onClick={() => setOpen(false)}>
                  {item.label}
                </NavLink>
              ))}
              <button className="rounded-xl px-3 py-3 text-left text-base font-extrabold text-ink hover:bg-warm" type="button" onClick={() => { setOpen(false); setSearchOpen(true); }}>
                Search Products
              </button>
              <NavLink to="/cart" className="rounded-xl px-3 py-3 text-base font-extrabold text-ink hover:bg-warm" onClick={() => setOpen(false)}>
                Cart ({totalItems})
              </NavLink>
            </nav>
            <WhatsAppButton className="mt-8 w-full">Chat on WhatsApp</WhatsAppButton>
          </div>
        </div>
      )}
      <InstantSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
    </header>
  );
}
