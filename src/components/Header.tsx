import { Menu, Search, ShoppingBag, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { Logo } from "./Logo";
import { InstantSearch } from "./InstantSearch";
import "../styles/global-header.css";

export interface MobileSubmenuItem {
  label: string;
  to: string;
  isExplore?: boolean;
}

export interface MobileNavSection {
  id: string;
  label: string;
  to: string;
  matchPrefixes: string[];
  subitems: MobileSubmenuItem[];
}

export const MOBILE_NAV_SECTIONS: MobileNavSection[] = [
  {
    id: "store",
    label: "Store",
    to: "/store",
    matchPrefixes: ["/store", "/shop"],
    subitems: [
      { label: "Shop the Latest", to: "/shop", isExplore: true },
      { label: "Shop Mac", to: "/mac" },
      { label: "Shop iPad", to: "/ipad" },
      { label: "Shop iPhone", to: "/iphone" },
      { label: "Shop Apple Watch", to: "/watch" },
      { label: "Shop AirPods", to: "/airpods" },
      { label: "Shop Accessories", to: "/accessories" },
    ],
  },
  {
    id: "mac",
    label: "Mac",
    to: "/mac",
    matchPrefixes: ["/mac", "/shop/buy-mac", "/mac-mini", "/mac-studio"],
    subitems: [
      { label: "Explore All Mac", to: "/mac", isExplore: true },
      { label: "MacBook Air", to: "/shop/buy-mac/macbook-air-13-m4" },
      { label: "MacBook Pro", to: "/shop/buy-mac/macbook-pro-14-m4" },
      { label: "Mac mini", to: "/mac-mini" },
      { label: "Mac Studio", to: "/mac-studio" },
      { label: "Shop Mac", to: "/mac" },
    ],
  },
  {
    id: "ipad",
    label: "iPad",
    to: "/ipad",
    matchPrefixes: ["/ipad", "/shop/buy-ipad"],
    subitems: [
      { label: "Explore All iPad", to: "/ipad", isExplore: true },
      { label: "iPad Pro", to: "/shop/buy-ipad/ipad-pro-13-inch-m4" },
      { label: "iPad Air", to: "/shop/buy-ipad/ipad-air-11-inch-m4" },
      { label: "iPad", to: "/shop/buy-ipad/ipad-10th-generation" },
      { label: "iPad mini", to: "/shop/buy-ipad/ipad-mini-a17-pro" },
      { label: "Shop iPad", to: "/ipad" },
    ],
  },
  {
    id: "iphone",
    label: "iPhone",
    to: "/iphone",
    matchPrefixes: ["/iphone", "/shop/buy-iphone"],
    subitems: [
      { label: "Explore All iPhone", to: "/iphone", isExplore: true },
      { label: "iPhone 18 Pro", to: "/shop/buy-iphone/iphone-18-pro" },
      { label: "iPhone Duo", to: "/shop/buy-iphone/iphone-duo" },
      { label: "iPhone Air", to: "/shop/buy-iphone/iphone-air" },
      { label: "Shop iPhone", to: "/iphone" },
    ],
  },
  {
    id: "watch",
    label: "Watch",
    to: "/watch",
    matchPrefixes: ["/watch", "/shop/buy-watch"],
    subitems: [
      { label: "Explore All Apple Watch", to: "/watch", isExplore: true },
      { label: "Apple Watch Series 12", to: "/shop/buy-watch/apple-watch-series-12" },
      { label: "Apple Watch Ultra 4", to: "/shop/buy-watch/apple-watch-ultra-4" },
      { label: "Apple Watch SE", to: "/shop/buy-watch/apple-watch-se-3" },
      { label: "Shop Watch", to: "/watch" },
    ],
  },
  {
    id: "airpods",
    label: "AirPods",
    to: "/airpods",
    matchPrefixes: ["/airpods", "/shop/buy-airpods"],
    subitems: [
      { label: "Explore All AirPods", to: "/airpods", isExplore: true },
      { label: "AirPods Pro", to: "/shop/buy-airpods/airpods-pro-2" },
      { label: "AirPods", to: "/shop/buy-airpods/airpods-4" },
      { label: "AirPods Max", to: "/shop/buy-airpods/airpods-max-2" },
      { label: "Shop AirPods", to: "/airpods" },
    ],
  },
  {
    id: "accessories",
    label: "Accessories",
    to: "/accessories",
    matchPrefixes: ["/accessories", "/shop/buy-accessory"],
    subitems: [
      { label: "Explore All Accessories", to: "/accessories", isExplore: true },
      { label: "iPhone Accessories", to: "/accessories" },
      { label: "Mac Accessories", to: "/accessories" },
      { label: "iPad Accessories", to: "/accessories" },
      { label: "Watch Accessories", to: "/accessories" },
      { label: "Shop Accessories", to: "/accessories" },
    ],
  },
  {
    id: "support",
    label: "Support",
    to: "/contact",
    matchPrefixes: ["/support", "/contact", "/repairs", "/faq", "/shopping-information"],
    subitems: [
      { label: "Contact Us", to: "/contact", isExplore: true },
      { label: "Repairs", to: "/repairs" },
      { label: "Warranty", to: "/shopping-information" },
      { label: "Delivery", to: "/shopping-information" },
      { label: "FAQs", to: "/faq" },
    ],
  },
];

export interface GlobalNavItem {
  label: string;
  to: string;
  matchPrefixes: string[];
}

export const GLOBAL_NAV_ITEMS: GlobalNavItem[] = MOBILE_NAV_SECTIONS.map((sec) => ({
  label: sec.label,
  to: sec.to,
  matchPrefixes: sec.matchPrefixes,
}));

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMenuMounted, setIsMenuMounted] = useState(false);
  const [isMenuClosing, setIsMenuClosing] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [navVisible, setNavVisible] = useState(true);
  const { totalItems } = useCart();
  const location = useLocation();
  const drawerRef = useRef<HTMLDivElement>(null);
  const lastScrollYRef = useRef(0);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleOpenMenu = () => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    setIsMenuClosing(false);
    setIsMenuMounted(true);
    setMobileMenuOpen(true);
  };

  const handleCloseMenu = () => {
    if (!mobileMenuOpen && !isMenuMounted) return;
    setMobileMenuOpen(false);
    setIsMenuClosing(true);
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    closeTimerRef.current = setTimeout(() => {
      setIsMenuMounted(false);
      setIsMenuClosing(false);
    }, 380);
  };

  const handleLinkClick = () => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    setMobileMenuOpen(false);
    setIsMenuMounted(false);
    setIsMenuClosing(false);
  };

  const handleToggleMenu = () => {
    if (mobileMenuOpen) {
      handleCloseMenu();
    } else {
      handleOpenMenu();
    }
  };

  // Close mobile menu on route change
  useEffect(() => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    setMobileMenuOpen(false);
    setIsMenuMounted(false);
    setIsMenuClosing(false);
    setNavVisible(true);
  }, [location.pathname, location.search]);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    };
  }, []);

  // Apple-inspired smooth mobile scroll navigation
  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (ticking) return;
      ticking = true;

      window.requestAnimationFrame(() => {
        ticking = false;
        if (typeof window === "undefined") return;

        // Desktop (width > 834px) keeps header fixed without scroll-hide
        if (window.innerWidth > 834) {
          setNavVisible(true);
          return;
        }

        // Never hide while mobile menu curtain or search modal is open
        if (mobileMenuOpen || isMenuMounted || searchOpen) {
          setNavVisible(true);
          return;
        }

        const currentY = window.scrollY;
        const lastY = lastScrollYRef.current;
        const delta = currentY - lastY;

        // Keep normal header visible at top of page
        if (currentY <= 44) {
          setNavVisible(true);
          lastScrollYRef.current = Math.max(0, currentY);
          return;
        }

        // Deadzone threshold of 8px prevents jitter during touch inertia
        if (Math.abs(delta) >= 8) {
          if (delta > 0 && currentY > 56) {
            // Scrolling down: slide navigation out of the way
            setNavVisible(false);
          } else if (delta < 0) {
            // Scrolling up: smoothly slide back into view
            setNavVisible(true);
          }
          lastScrollYRef.current = currentY;
        }
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [mobileMenuOpen, isMenuMounted, searchOpen]);

  // Lock body scroll and handle Escape key when mobile menu is active
  useEffect(() => {
    if (!mobileMenuOpen) return;
    const originalOverflow = document.body.style.overflow;
    const originalTouchAction = document.body.style.touchAction;
    document.body.style.overflow = "hidden";
    document.body.style.touchAction = "none";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        handleCloseMenu();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.touchAction = originalTouchAction;
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

  const isNavHidden = !navVisible && !mobileMenuOpen && !isMenuMounted && !searchOpen;

  return (
    <header
      className={`site-header global-header sticky top-0 z-50 ${isNavHidden ? "nav-hidden" : ""}`}
      onFocusCapture={() => setNavVisible(true)}
    >
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
            onClick={handleToggleMenu}
          >
            {mobileMenuOpen ? <X size={18} strokeWidth={2} /> : <Menu size={18} strokeWidth={2} />}
          </button>
        </div>
      </div>

      {/* Apple-style smooth curtain mobile navigation */}
      {isMenuMounted && (
        <div
          ref={drawerRef}
          className={`global-mobile-drawer global-mobile-curtain ${
            isMenuClosing ? "is-closing" : "is-open"
          }`}
          role="dialog"
          aria-modal="true"
          aria-label="Navigation menu"
        >
          <div className="global-curtain-inner">
            <nav className="global-curtain-nav" aria-label="Main Navigation">
              {MOBILE_NAV_SECTIONS.map((section, idx) => (
                <Link
                  key={section.id}
                  to={section.to}
                  onClick={handleLinkClick}
                  className="global-curtain-link global-mobile-section-btn"
                  style={{ "--item-idx": idx } as React.CSSProperties}
                >
                  <span>{section.label}</span>
                </Link>
              ))}
            </nav>

            <div className="global-curtain-footer">
              <div className="global-curtain-quick-links">
                <Link
                  to="/sell-or-trade"
                  onClick={handleLinkClick}
                  className="global-curtain-quick-link"
                >
                  Trade In &amp; Upgrade
                </Link>
                <span className="global-curtain-dot" aria-hidden="true">•</span>
                <Link
                  to="/installment"
                  onClick={handleLinkClick}
                  className="global-curtain-quick-link"
                >
                  Installments
                </Link>
                <span className="global-curtain-dot" aria-hidden="true">•</span>
                <Link
                  to="/repairs"
                  onClick={handleLinkClick}
                  className="global-curtain-quick-link"
                >
                  Repairs
                </Link>
                <span className="global-curtain-dot" aria-hidden="true">•</span>
                <Link
                  to="/faq"
                  onClick={handleLinkClick}
                  className="global-curtain-quick-link"
                >
                  FAQs
                </Link>
              </div>
              <div className="global-curtain-contact">
                <span className="global-curtain-badge">Buy &amp; Sell GH</span>
                <span className="global-curtain-meta">Accra, Dome Pillar 2 • Mon–Sat 8:30am–7:00pm</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Global Instant Search modal */}
      <InstantSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
    </header>
  );
}
