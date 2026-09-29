import { Menu, Search, ShoppingBag, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { Logo } from "./Logo";
import { InstantSearch } from "./InstantSearch";
import "../styles/global-header.css";

export interface GlobalNavItem {
  label: string;
  to: string;
  matchPrefixes: string[];
}

export const GLOBAL_NAV_ITEMS: GlobalNavItem[] = [
  { label: "Store", to: "/store", matchPrefixes: ["/store", "/shop"] },
  { label: "Mac", to: "/mac", matchPrefixes: ["/mac", "/shop/buy-mac", "/mac-mini", "/mac-studio"] },
  { label: "iPad", to: "/ipad", matchPrefixes: ["/ipad", "/shop/buy-ipad"] },
  { label: "iPhone", to: "/iphone", matchPrefixes: ["/iphone", "/shop/buy-iphone"] },
  { label: "Watch", to: "/watch", matchPrefixes: ["/watch", "/shop/buy-watch"] },
  { label: "AirPods", to: "/airpods", matchPrefixes: ["/airpods", "/shop/buy-airpods"] },
  { label: "Accessories", to: "/accessories", matchPrefixes: ["/accessories", "/shop/buy-accessory"] },
  { label: "Support", to: "/support", matchPrefixes: ["/support", "/contact"] },
];

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { totalItems } = useCart();
  const location = useLocation();

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname, location.search]);

  // Lock body scroll when mobile menu is active
  useEffect(() => {
    if (!mobileMenuOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileMenuOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [mobileMenuOpen]);

  // Subtle active route matching
  const isItemActive = (item: GlobalNavItem) => {
    const pathname = location.pathname;
    return item.matchPrefixes.some((prefix) => {
      if (prefix === "/store" || prefix === "/shop") {
        if (pathname.startsWith("/shop/buy-")) return false;
        return pathname === prefix || pathname.startsWith(`${prefix}/`);
      }
      return pathname === prefix || pathname.startsWith(`${prefix}/`);
    });
  };

  return (
    <header className="site-header global-header sticky top-0 z-50">
      <div className="global-header-inner">
        {/* Brand logo at Apple mark position */}
        <Logo compact className="global-header-brand" />

        {/* Desktop horizontal navigation */}
        <nav className="global-header-nav" aria-label="Global Navigation">
          {GLOBAL_NAV_ITEMS.map((item) => {
            const active = isItemActive(item);
            return (
              <Link
                key={item.label}
                to={item.to}
                className={`global-header-link ${active ? "is-active" : ""}`}
                aria-current={active ? "page" : undefined}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Header Actions: Search, Bag, and Mobile Menu Toggle */}
        <div className="global-header-actions">
          <button
            type="button"
            className="global-header-icon-btn"
            aria-label="Search products"
            onClick={() => setSearchOpen(true)}
          >
            <Search size={16} strokeWidth={2} />
          </button>

          <NavLink
            to="/cart"
            className="global-header-icon-btn relative"
            aria-label={totalItems > 0 ? `Shopping Bag with ${totalItems} items` : "Shopping Bag"}
          >
            <ShoppingBag size={16} strokeWidth={2} />
            {totalItems > 0 && (
              <span className="global-header-badge" aria-hidden="true">
                {totalItems > 99 ? "99+" : totalItems}
              </span>
            )}
          </NavLink>

          <button
            type="button"
            className="global-header-menu-btn"
            aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={mobileMenuOpen}
            onClick={() => setMobileMenuOpen((prev) => !prev)}
          >
            {mobileMenuOpen ? <X size={18} strokeWidth={2} /> : <Menu size={18} strokeWidth={2} />}
          </button>
        </div>
      </div>

      {/* Responsive mobile menu drawer */}
      {mobileMenuOpen && (
        <div className="global-mobile-drawer" role="dialog" aria-modal="true" aria-label="Navigation menu">
          <nav className="global-mobile-links" aria-label="Mobile Categories">
            {GLOBAL_NAV_ITEMS.map((item) => {
              const active = isItemActive(item);
              return (
                <Link
                  key={item.label}
                  to={item.to}
                  className={`global-mobile-link ${active ? "is-active" : ""}`}
                  aria-current={active ? "page" : undefined}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      )}

      {/* Global Instant Search modal */}
      <InstantSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
    </header>
  );
}
