import { ChevronDown, Menu, Search, ShoppingBag, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useBuyJourney } from "../context/BuyJourneyContext";
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
      { label: "View All Store", to: "/store" },
    ],
  },
  {
    id: "mac",
    label: "Mac",
    to: "/mac",
    matchPrefixes: ["/mac", "/shop/buy-mac", "/mac-mini", "/mac-studio"],
    subitems: [
      { label: "Explore All Mac", to: "/mac", isExplore: true },
      { label: "MacBook Air", to: "/shop/buy-mac/macbook-air" },
      { label: "MacBook Pro", to: "/shop/buy-mac/macbook-pro" },
      { label: "Mac mini", to: "/mac-mini" },
      { label: "Mac Studio", to: "/mac-studio" },
      { label: "Learn More MacBook Air", to: "/mac/macbook-air" },
      { label: "Learn More MacBook Pro", to: "/mac/macbook-pro" },
    ],
  },
  {
    id: "ipad",
    label: "iPad",
    to: "/ipad",
    matchPrefixes: ["/ipad", "/shop/buy-ipad"],
    subitems: [
      { label: "Explore All iPad", to: "/ipad", isExplore: true },
      { label: "iPad Pro", to: "/shop/buy-ipad/ipad-pro" },
      { label: "iPad Air", to: "/shop/buy-ipad/ipad-air" },
      { label: "iPad (10th Generation)", to: "/shop/buy-ipad/ipad-10th-generation" },
      { label: "iPad mini", to: "/shop/buy-ipad/ipad-mini-a17-pro" },
      { label: "Learn More iPad Pro", to: "/ipad/ipad-pro" },
      { label: "Learn More iPad Air", to: "/ipad/ipad-air" },
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
      { label: "iPhone 16 Pro Max", to: "/shop/buy-iphone/iphone-16-pro-max" },
      { label: "iPhone 16 Pro", to: "/shop/buy-iphone/iphone-16-pro" },
      { label: "Learn More iPhone 18 Pro", to: "/iphone/iphone-18-pro" },
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
      { label: "Learn More Ultra 4", to: "/watch/apple-watch-ultra-4" },
    ],
  },
  {
    id: "airpods",
    label: "AirPods",
    to: "/airpods",
    matchPrefixes: ["/airpods", "/shop/buy-airpods"],
    subitems: [
      { label: "Explore All AirPods", to: "/airpods", isExplore: true },
      { label: "AirPods Pro 3", to: "/shop/buy-airpods/airpods-pro-3" },
      { label: "AirPods 5", to: "/shop/buy-airpods/airpods-5" },
      { label: "AirPods Max", to: "/shop/buy-airpods/airpods-max-2" },
      { label: "Learn More AirPods Pro", to: "/airpods/airpods-pro-3" },
    ],
  },
  {
    id: "accessories",
    label: "Accessories",
    to: "/accessories",
    matchPrefixes: ["/accessories", "/shop/buy-accessory"],
    subitems: [
      { label: "Explore All Accessories", to: "/accessories", isExplore: true },
      { label: "MagSafe Chargers & Power", to: "/accessories/apple-magsafe-charger" },
      { label: "iPhone Protection & Cases", to: "/accessories" },
      { label: "iPad Keyboards & Stylus", to: "/accessories" },
      { label: "Apple Watch Straps & Docks", to: "/accessories" },
    ],
  },
  {
    id: "support",
    label: "Support",
    to: "/contact",
    matchPrefixes: ["/support", "/contact", "/repairs", "/faq", "/shopping-information"],
    subitems: [
      { label: "Contact Us", to: "/contact", isExplore: true },
      { label: "Repairs & Diagnostic", to: "/repairs" },
      { label: "Warranty & Coverage", to: "/shopping-information" },
      { label: "Delivery & Pickup", to: "/shopping-information" },
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
  const [expandedSectionId, setExpandedSectionId] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [navVisible, setNavVisible] = useState(true);
  const { totalItems } = useCart();
  const { openBag } = useBuyJourney();
  const location = useLocation();
  const drawerRef = useRef<HTMLDivElement>(null);
  const lastScrollYRef = useRef(0);
  const savedScrollYRef = useRef(0);
  const navigatingRef = useRef(false);
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
    setExpandedSectionId(null);
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    closeTimerRef.current = setTimeout(() => {
      setIsMenuMounted(false);
      setIsMenuClosing(false);
    }, 350);
  };

  const handleLinkClick = () => {
    navigatingRef.current = true;
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    setMobileMenuOpen(false);
    setIsMenuMounted(false);
    setIsMenuClosing(false);
    setExpandedSectionId(null);
  };

  const toggleSection = (id: string) => {
    setExpandedSectionId((prev) => (prev === id ? null : id));
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
    setExpandedSectionId(null);
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

  // Lock background scroll and preserve exact page position when mobile menu is active
  useEffect(() => {
    const isCurtainActive = mobileMenuOpen || isMenuClosing;
    if (!isCurtainActive) return;

    // Capture the current scroll position before locking
    if (mobileMenuOpen && !isMenuClosing) {
      const scrollY = window.scrollY || window.pageYOffset || document.documentElement.scrollTop || 0;
      savedScrollYRef.current = scrollY;
    }

    const lockedScrollY = savedScrollYRef.current;
    const originalBodyOverflow = document.body.style.overflow;
    const originalHtmlOverflow = document.documentElement.style.overflow;
    const originalBodyOverscroll = document.body.style.overscrollBehavior;
    const originalHtmlOverscroll = document.documentElement.style.overscrollBehavior;

    // Lock page scrolling
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    document.body.style.overscrollBehavior = "none";
    document.documentElement.style.overscrollBehavior = "none";

    // Prevent background touch scrolling on iOS & Android while allowing menu to scroll freely
    const handleTouchMove = (e: TouchEvent) => {
      if (drawerRef.current && drawerRef.current.contains(e.target as Node)) {
        return; // Allow free scrolling inside mobile menu
      }
      e.preventDefault(); // Block background page scrolling
    };

    const handleWheel = (e: WheelEvent) => {
      if (drawerRef.current && drawerRef.current.contains(e.target as Node)) {
        return; // Allow mouse/trackpad scrolling inside mobile menu
      }
      e.preventDefault(); // Block background wheel scrolling
    };

    document.addEventListener("touchmove", handleTouchMove, { passive: false });
    document.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      document.body.style.overflow = originalBodyOverflow;
      document.documentElement.style.overflow = originalHtmlOverflow;
      document.body.style.overscrollBehavior = originalBodyOverscroll;
      document.documentElement.style.overscrollBehavior = originalHtmlOverscroll;

      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("wheel", handleWheel);

      // Restore exact scroll position if not navigating away
      if (!navigatingRef.current) {
        window.scrollTo(0, lockedScrollY);
        lastScrollYRef.current = lockedScrollY;
      } else {
        navigatingRef.current = false;
        window.scrollTo(0, 0);
        lastScrollYRef.current = 0;
      }
    };
  }, [mobileMenuOpen, isMenuClosing]);

  // Handle Escape key
  useEffect(() => {
    if (!mobileMenuOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (expandedSectionId) {
          setExpandedSectionId(null);
        } else {
          handleCloseMenu();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mobileMenuOpen, expandedSectionId]);

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
      className={`site-header global-header sticky top-0 z-50 ${isNavHidden ? "nav-hidden" : ""} ${isMenuMounted ? "menu-is-active" : ""}`}
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

          <button
            type="button"
            className="global-header-icon-btn relative"
            aria-label={totalItems > 0 ? `Shopping Bag with ${totalItems} items` : "Shopping Bag"}
            onClick={openBag}
          >
            <ShoppingBag size={16} strokeWidth={2} />
            {totalItems > 0 && (
              <span className="global-header-badge" aria-hidden="true">
                {totalItems > 99 ? "99+" : totalItems}
              </span>
            )}
          </button>

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

      {/* Apple-style smooth curtain mobile navigation portaled to body to ensure true viewport anchoring */}
      {isMenuMounted &&
        typeof document !== "undefined" &&
        createPortal(
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
                {MOBILE_NAV_SECTIONS.map((section, idx) => {
                  const isExpanded = expandedSectionId === section.id;
                  const hasSubitems = Boolean(section.subitems && section.subitems.length > 0);
                  return (
                    <div
                      key={section.id}
                      className={`global-curtain-item ${isExpanded ? "is-expanded" : ""}`}
                      style={{ "--item-idx": idx } as React.CSSProperties}
                    >
                      {hasSubitems ? (
                        <button
                          type="button"
                          onClick={() => toggleSection(section.id)}
                          className={`global-curtain-heading-btn ${isExpanded ? "is-expanded" : ""}`}
                          aria-expanded={isExpanded}
                          aria-controls={`curtain-sub-${section.id}`}
                        >
                          <span>{section.label}</span>
                          <ChevronDown
                            size={18}
                            className={`global-curtain-chevron ${isExpanded ? "is-rotated" : ""}`}
                            aria-hidden="true"
                          />
                        </button>
                      ) : (
                        <Link
                          to={section.to}
                          onClick={handleLinkClick}
                          className="global-curtain-link global-mobile-section-btn"
                        >
                          <span>{section.label}</span>
                        </Link>
                      )}

                      {hasSubitems && (
                        <div
                          id={`curtain-sub-${section.id}`}
                          className={`global-curtain-submenu ${isExpanded ? "is-open" : ""}`}
                          role="region"
                          aria-label={`${section.label} submenu`}
                        >
                          <div className="global-curtain-submenu-inner">
                            {section.subitems.map((subitem) => (
                              <Link
                                key={subitem.label}
                                to={subitem.to}
                                onClick={handleLinkClick}
                                className={`global-curtain-sublink ${subitem.isExplore ? "is-explore-link" : ""}`}
                              >
                                <span>{subitem.label}</span>
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
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
          </div>,
          document.body
        )}

      {/* Global Instant Search modal */}
      <InstantSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
    </header>
  );
}
