import { Menu, Search, ShoppingBag, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { Logo } from "./Logo";
import { InstantSearch } from "./InstantSearch";
import { WhatsAppButton } from "./WhatsAppButton";

const navItems = [
  { label: "Store", to: "/shop" },
  { label: "iPhone", to: "/iphones" },
  { label: "Samsung", to: "/shop?brand=Samsung" },
  { label: "Tablets", to: "/ipads" },
  { label: "Laptops", to: "/macbooks" },
  { label: "Gaming", to: "/shop?category=Game%20Consoles" },
  { label: "Audio", to: "/shop?category=Audio" },
  { label: "Accessories", to: "/accessories" },
  { label: "Trade-In", to: "/sell-or-trade" },
  { label: "Support", to: "/contact" },
];

const mobileUtilityItems = [
  { label: "Installment", to: "/installment" },
  { label: "Repairs", to: "/repairs" },
  { label: "Gift Cards", to: "/gift-cards" },
  { label: "Refer a Friend", to: "/refer-a-friend" },
  { label: "Pre-Order", to: "/pre-order" },
];

export function Header() {
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const menuTriggerRef = useRef<HTMLButtonElement>(null);
  const { totalItems } = useCart();
  const location = useLocation();
  const currentRoute = `${location.pathname}${location.search}`;
  const isNavItemActive = (to: string) => {
    if (to.includes("?")) return currentRoute === to;
    if (to === "/shop") return location.pathname === "/shop" && !location.search;
    return location.pathname === to;
  };
  const linkClass = (isActive: boolean) => `site-nav-link ${isActive ? "is-active" : ""}`;

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
      menuTriggerRef.current?.focus({ preventScroll: true });
    };
  }, [open]);

  return (
    <header className="site-header sticky top-0 z-50 border-b border-black/8 bg-white/96 shadow-sm backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-3 py-2.5 sm:gap-3 sm:px-6 sm:py-3 lg:px-8">
        <Logo />
        <nav className="hidden items-center gap-2 2xl:gap-4 xl:flex" aria-label="Main navigation">
          {navItems.map((item) => {
            const active = isNavItemActive(item.to);
            return (
              <Link key={item.to} to={item.to} className={linkClass(active)} aria-current={active ? "page" : undefined}>
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="hidden items-center gap-2 xl:flex">
          <button className="icon-button" type="button" aria-label="Search products" onClick={() => setSearchOpen(true)}>
            <Search size={19} />
          </button>
          <NavLink to="/cart" className="icon-button relative" aria-label="Open cart">
            <ShoppingBag size={19} />
            {totalItems > 0 && <span className="cart-dot">{totalItems}</span>}
          </NavLink>
          <WhatsAppButton className="px-5 py-3 shadow-gold">WhatsApp</WhatsAppButton>
        </div>
        <button ref={menuTriggerRef} className="icon-button mobile-menu-trigger h-11 w-11 shrink-0 xl:hidden" type="button" aria-label="Open menu" aria-expanded={open} onClick={() => setOpen(true)}>
          <Menu size={25} />
        </button>
      </div>

      {open && createPortal(
        <MobileMenuOverlay
          totalItems={totalItems}
          currentRoute={currentRoute}
          pathname={location.pathname}
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

function MobileMenuOverlay({
  totalItems,
  currentRoute,
  pathname,
  onClose,
  onSearch,
}: {
  totalItems: number;
  currentRoute: string;
  pathname: string;
  onClose: () => void;
  onSearch: () => void;
}) {
  const isNavItemActive = (to: string) => {
    if (to.includes("?")) return currentRoute === to;
    if (to === "/shop") return pathname === "/shop" && !currentRoute.includes("?");
    return pathname === to;
  };

  return (
    <div className="mobile-menu-overlay xl:hidden" role="dialog" aria-modal="true" aria-label="Mobile navigation">
      <div className="mobile-menu-panel">
        <div className="mobile-menu-header">
          <Logo />
          <button autoFocus className="icon-button h-12 w-12" type="button" aria-label="Close menu" onClick={onClose}>
            <X size={22} />
          </button>
        </div>
        <nav className="mobile-menu-nav" aria-label="Mobile navigation">
          {navItems.map((item) => {
            const active = isNavItemActive(item.to);
            return (
              <Link key={item.to} to={item.to} className={`mobile-menu-link ${active ? "is-active" : ""}`} aria-current={active ? "page" : undefined} onClick={onClose}>
                {item.label}
              </Link>
            );
          })}
          {mobileUtilityItems.map((item) => {
            const active = isNavItemActive(item.to);
            return (
              <Link key={item.to} to={item.to} className={`mobile-menu-link ${active ? "is-active" : ""}`} aria-current={active ? "page" : undefined} onClick={onClose}>
                {item.label}
              </Link>
            );
          })}
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
