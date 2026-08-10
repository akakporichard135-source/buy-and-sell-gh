import { Menu, Search, ShoppingBag, X } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
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

  useEffect(() => {
    if (!open) return;
    const originalOverflow = document.body.style.overflow;
    const originalPosition = document.body.style.position;
    const originalTop = document.body.style.top;
    const originalWidth = document.body.style.width;
    const scrollY = window.scrollY;
    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = "100%";
    document.body.classList.add("mobile-menu-open");
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.position = originalPosition;
      document.body.style.top = originalTop;
      document.body.style.width = originalWidth;
      document.body.classList.remove("mobile-menu-open");
      window.scrollTo(0, scrollY);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <header className="site-header sticky top-0 z-50 border-b border-black/8 bg-white/96 shadow-sm backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-3 py-2.5 sm:gap-3 sm:px-6 sm:py-3 lg:px-8">
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
        <button className="icon-button mobile-menu-trigger h-11 w-11 shrink-0 lg:hidden" type="button" aria-label="Open menu" onClick={() => setOpen(true)}>
          <Menu size={25} />
        </button>
      </div>

      {open && createPortal(
        <MobileMenuOverlay
          totalItems={totalItems}
          onClose={() => setOpen(false)}
          onSearch={() => {
            setOpen(false);
            setSearchOpen(true);
          }}
        />,
        document.body,
      )}
      <InstantSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
    </header>
  );
}

function MobileMenuOverlay({ totalItems, onClose, onSearch }: { totalItems: number; onClose: () => void; onSearch: () => void }) {
  return (
    <div className="mobile-menu-overlay lg:hidden" role="dialog" aria-modal="true" aria-label="Mobile navigation">
      <div className="mobile-menu-panel">
        <div className="mobile-menu-header">
          <Logo />
          <button className="icon-button h-12 w-12" type="button" aria-label="Close menu" onClick={onClose}>
            <X size={22} />
          </button>
        </div>
        <nav className="mobile-menu-nav" aria-label="Mobile navigation">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} className={({ isActive }) => `mobile-menu-link ${isActive ? "is-active" : ""}`} onClick={onClose}>
              {item.label}
            </NavLink>
          ))}
          <button className="mobile-menu-link" type="button" onClick={onSearch}>
            Search Products
          </button>
          <NavLink to="/cart" className={({ isActive }) => `mobile-menu-link ${isActive ? "is-active" : ""}`} onClick={onClose}>
            Cart ({totalItems})
          </NavLink>
        </nav>
        <div className="mobile-menu-footer">
          <WhatsAppButton className="w-full">Chat on WhatsApp</WhatsAppButton>
        </div>
      </div>
    </div>
  );
}
