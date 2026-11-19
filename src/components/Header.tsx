import { ChevronLeft, ChevronRight, Search, ShoppingBag } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link, useLocation } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useBuyJourney } from "../context/BuyJourneyContext";
import { Logo } from "./Logo";
import { InstantSearch } from "./InstantSearch";
import "../styles/global-header.css";

export interface MobileSubmenuItem {
  label: string;
  to: string;
  isExplore?: boolean;
  group?: "primary" | "secondary";
}

export interface MobileNavSection {
  id: string;
  label: string;
  eyebrow?: string;
  to: string;
  matchPrefixes: string[];
  subitems: MobileSubmenuItem[];
}

export const MOBILE_NAV_SECTIONS: MobileNavSection[] = [
  {
    id: "store",
    label: "Store",
    eyebrow: "Shop Buy & Sell GH",
    to: "/store",
    matchPrefixes: ["/store", "/shop"],
    subitems: [
      { label: "Shop All Products", to: "/store", isExplore: true, group: "primary" },
      { label: "Featured Products", to: "/shop", group: "primary" },
      { label: "Mac", to: "/mac", group: "primary" },
      { label: "iPad", to: "/ipad", group: "primary" },
      { label: "iPhone", to: "/iphone", group: "primary" },
      { label: "Watch", to: "/watch", group: "primary" },
      { label: "AirPods", to: "/airpods", group: "primary" },
      { label: "Accessories", to: "/accessories", group: "primary" },
      { label: "Special Offers", to: "/offers", group: "secondary" },
      { label: "Trade In & Upgrade", to: "/sell-or-trade", group: "secondary" },
      { label: "Installment Plans", to: "/installment", group: "secondary" },
    ],
  },
  {
    id: "mac",
    label: "Mac",
    eyebrow: "Explore Mac",
    to: "/mac",
    matchPrefixes: ["/mac", "/shop/buy-mac", "/mac-mini", "/mac-studio"],
    subitems: [
      { label: "Explore All Mac", to: "/mac", isExplore: true, group: "primary" },
      { label: "MacBook Air", to: "/shop/buy-mac/macbook-air", group: "primary" },
      { label: "MacBook Pro", to: "/shop/buy-mac/macbook-pro", group: "primary" },
      { label: "Mac mini", to: "/mac-mini", group: "primary" },
      { label: "Mac Studio", to: "/mac-studio", group: "primary" },
      { label: "Learn More MacBook Air", to: "/mac/macbook-air", group: "secondary" },
      { label: "Learn More MacBook Pro", to: "/mac/macbook-pro", group: "secondary" },
    ],
  },
  {
    id: "ipad",
    label: "iPad",
    eyebrow: "Explore iPad",
    to: "/ipad",
    matchPrefixes: ["/ipad", "/shop/buy-ipad"],
    subitems: [
      { label: "Explore All iPad", to: "/ipad", isExplore: true, group: "primary" },
      { label: "iPad Pro", to: "/shop/buy-ipad/ipad-pro", group: "primary" },
      { label: "iPad Air", to: "/shop/buy-ipad/ipad-air", group: "primary" },
      { label: "iPad (10th Generation)", to: "/shop/buy-ipad/ipad-10th-generation", group: "primary" },
      { label: "iPad mini", to: "/shop/buy-ipad/ipad-mini-a17-pro", group: "primary" },
      { label: "Learn More iPad Pro", to: "/ipad/ipad-pro", group: "secondary" },
      { label: "Learn More iPad Air", to: "/ipad/ipad-air", group: "secondary" },
    ],
  },
  {
    id: "iphone",
    label: "iPhone",
    eyebrow: "Explore iPhone",
    to: "/iphone",
    matchPrefixes: ["/iphone", "/shop/buy-iphone"],
    subitems: [
      { label: "Explore All iPhone", to: "/iphone", isExplore: true, group: "primary" },
      { label: "iPhone 18 Pro", to: "/shop/buy-iphone/iphone-18-pro", group: "primary" },
      { label: "iPhone Duo", to: "/shop/buy-iphone/iphone-duo", group: "primary" },
      { label: "iPhone 16 Pro Max", to: "/shop/buy-iphone/iphone-16-pro-max", group: "primary" },
      { label: "iPhone 16 Pro", to: "/shop/buy-iphone/iphone-16-pro", group: "primary" },
      { label: "Learn More iPhone 18 Pro", to: "/iphone/iphone-18-pro", group: "secondary" },
      { label: "Learn More iPhone Duo", to: "/iphone/iphone-duo", group: "secondary" },
    ],
  },
  {
    id: "watch",
    label: "Watch",
    eyebrow: "Explore Apple Watch",
    to: "/watch",
    matchPrefixes: ["/watch", "/shop/buy-watch"],
    subitems: [
      { label: "Explore All Apple Watch", to: "/watch", isExplore: true, group: "primary" },
      { label: "Apple Watch Series 12", to: "/shop/buy-watch/apple-watch-series-12", group: "primary" },
      { label: "Apple Watch Ultra 4", to: "/shop/buy-watch/apple-watch-ultra-4", group: "primary" },
      { label: "Apple Watch SE", to: "/shop/buy-watch/apple-watch-se-3", group: "primary" },
      { label: "Learn More Ultra 4", to: "/watch/apple-watch-ultra-4", group: "secondary" },
    ],
  },
  {
    id: "airpods",
    label: "AirPods",
    eyebrow: "Explore AirPods",
    to: "/airpods",
    matchPrefixes: ["/airpods", "/shop/buy-airpods"],
    subitems: [
      { label: "Explore All AirPods", to: "/airpods", isExplore: true, group: "primary" },
      { label: "AirPods Pro 3", to: "/shop/buy-airpods/airpods-pro-3", group: "primary" },
      { label: "AirPods 5", to: "/shop/buy-airpods/airpods-5", group: "primary" },
      { label: "AirPods Max", to: "/shop/buy-airpods/airpods-max-2", group: "primary" },
      { label: "Learn More AirPods Pro 3", to: "/airpods/airpods-pro-3", group: "secondary" },
    ],
  },
  {
    id: "accessories",
    label: "Accessories",
    eyebrow: "Explore Accessories",
    to: "/accessories",
    matchPrefixes: ["/accessories", "/shop/buy-accessory"],
    subitems: [
      { label: "Explore All Accessories", to: "/accessories", isExplore: true, group: "primary" },
      { label: "MagSafe Chargers & Power", to: "/accessories/apple-magsafe-charger", group: "primary" },
      { label: "Gift Cards", to: "/gift-cards", group: "secondary" },
      { label: "Special Offers", to: "/offers", group: "secondary" },
    ],
  },
  {
    id: "others",
    label: "Others",
    eyebrow: "Marketplace & More",
    to: "/others",
    matchPrefixes: ["/others", "/phones-tablets", "/electronics", "/pre-order"],
    subitems: [
      { label: "Explore Others Marketplace", to: "/others", isExplore: true, group: "primary" },
      { label: "Mobile Phones & Tablets", to: "/phones-tablets", group: "primary" },
      { label: "Electronics & Consoles", to: "/electronics", group: "primary" },
      { label: "Pre-Order & Device Request", to: "/pre-order", group: "secondary" },
    ],
  },
  {
    id: "support",
    label: "Support",
    eyebrow: "Customer Care",
    to: "/contact",
    matchPrefixes: ["/support", "/contact", "/repairs", "/faq", "/shopping-information"],
    subitems: [
      { label: "Contact Us", to: "/contact", isExplore: true, group: "primary" },
      { label: "Repairs & Diagnostics", to: "/repairs", group: "primary" },
      { label: "Trade In & Upgrade", to: "/sell-or-trade", group: "primary" },
      { label: "Installment Plans", to: "/installment", group: "primary" },
      { label: "Warranty & Delivery Info", to: "/shopping-information", group: "secondary" },
      { label: "FAQs", to: "/faq", group: "secondary" },
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

const MENU_CLOSE_MS = 380;
const SUBMENU_EXIT_MS = 360;

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMenuMounted, setIsMenuMounted] = useState(false);
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [renderedSectionId, setRenderedSectionId] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const { totalItems } = useCart();
  const { openBag } = useBuyJourney();
  const location = useLocation();
  const rootPanelRef = useRef<HTMLDivElement>(null);
  const submenuPanelRef = useRef<HTMLDivElement>(null);
  const savedScrollYRef = useRef(0);
  const navigatingRef = useRef(false);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const submenuTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const openRaf1Ref = useRef<number | null>(null);
  const openRaf2Ref = useRef<number | null>(null);

  const clearPendingAnimations = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    if (submenuTimerRef.current) {
      clearTimeout(submenuTimerRef.current);
      submenuTimerRef.current = null;
    }
    if (openRaf1Ref.current !== null) {
      cancelAnimationFrame(openRaf1Ref.current);
      openRaf1Ref.current = null;
    }
    if (openRaf2Ref.current !== null) {
      cancelAnimationFrame(openRaf2Ref.current);
      openRaf2Ref.current = null;
    }
  };

  const handleOpenMenu = () => {
    clearPendingAnimations();
    navigatingRef.current = false;
    setActiveSectionId(null);
    setRenderedSectionId(null);
    setMobileMenuOpen(true);
    setIsMenuMounted(true);

    if (prefersReducedMotion()) {
      setIsMenuVisible(true);
      return;
    }

    // Ensure browser paints initial hidden state before transitioning smoothly in
    setIsMenuVisible(false);
    openRaf1Ref.current = requestAnimationFrame(() => {
      openRaf2Ref.current = requestAnimationFrame(() => {
        setIsMenuVisible(true);
        if (rootPanelRef.current) rootPanelRef.current.scrollTop = 0;
      });
    });
  };

  const handleCloseMenu = () => {
    if (!mobileMenuOpen && !isMenuMounted) return;
    clearPendingAnimations();
    setMobileMenuOpen(false);
    setIsMenuVisible(false);

    if (prefersReducedMotion()) {
      setIsMenuMounted(false);
      setActiveSectionId(null);
      setRenderedSectionId(null);
      return;
    }

    closeTimerRef.current = setTimeout(() => {
      setIsMenuMounted(false);
      setActiveSectionId(null);
      setRenderedSectionId(null);
    }, MENU_CLOSE_MS);
  };

  const handleLinkClick = () => {
    navigatingRef.current = true;
    clearPendingAnimations();
    setMobileMenuOpen(false);
    setIsMenuVisible(false);
    setIsMenuMounted(false);
    setActiveSectionId(null);
    setRenderedSectionId(null);
  };

  const handleOpenSubmenu = (id: string) => {
    if (submenuTimerRef.current) {
      clearTimeout(submenuTimerRef.current);
      submenuTimerRef.current = null;
    }
    setRenderedSectionId(id);
    setActiveSectionId(id);
    requestAnimationFrame(() => {
      if (submenuPanelRef.current) {
        submenuPanelRef.current.scrollTop = 0;
      }
    });
  };

  const handleBackToRoot = () => {
    setActiveSectionId(null);
    if (submenuTimerRef.current) clearTimeout(submenuTimerRef.current);
    if (prefersReducedMotion()) {
      setRenderedSectionId(null);
      return;
    }
    submenuTimerRef.current = setTimeout(() => {
      setRenderedSectionId(null);
    }, SUBMENU_EXIT_MS);
  };

  const handleToggleMenu = () => {
    if (mobileMenuOpen) {
      handleCloseMenu();
    } else {
      handleOpenMenu();
    }
  };

  // Close mobile menu cleanly on route pathname change (ignore query param updates on same page)
  useEffect(() => {
    clearPendingAnimations();
    setMobileMenuOpen(false);
    setIsMenuVisible(false);
    setIsMenuMounted(false);
    setActiveSectionId(null);
    setRenderedSectionId(null);
  }, [location.pathname]);

  useEffect(() => {
    return () => clearPendingAnimations();
  }, []);

  // Native position-fixed background scroll lock while menu is mounted:
  // Blocks background scroll on iOS Safari, Android Chrome, and desktop without attaching
  // non-passive touchmove handlers that degrade native compositor scrolling.
  useEffect(() => {
    if (!isMenuMounted || typeof window === "undefined") return;

    const lockedScrollY =
      window.scrollY || window.pageYOffset || document.documentElement.scrollTop || 0;
    savedScrollYRef.current = lockedScrollY;

    const prevBodyPosition = document.body.style.position;
    const prevBodyTop = document.body.style.top;
    const prevBodyLeft = document.body.style.left;
    const prevBodyRight = document.body.style.right;
    const prevBodyWidth = document.body.style.width;
    const prevBodyOverflow = document.body.style.overflow;
    const prevBodyPaddingTop = document.body.style.paddingTop;
    const prevHtmlOverscroll = document.documentElement.style.overscrollBehavior;

    document.body.style.position = "fixed";
    document.body.style.top = `-${lockedScrollY}px`;
    document.body.style.left = "0";
    document.body.style.right = "0";
    document.body.style.width = "100%";
    document.body.style.overflow = "hidden";
    document.body.style.paddingTop = "var(--global-header-height)";
    document.documentElement.style.overscrollBehavior = "none";

    return () => {
      document.body.style.position = prevBodyPosition;
      document.body.style.top = prevBodyTop;
      document.body.style.left = prevBodyLeft;
      document.body.style.right = prevBodyRight;
      document.body.style.width = prevBodyWidth;
      document.body.style.overflow = prevBodyOverflow;
      document.body.style.paddingTop = prevBodyPaddingTop;
      document.documentElement.style.overscrollBehavior = prevHtmlOverscroll;

      if (!navigatingRef.current) {
        window.scrollTo({ top: lockedScrollY, left: 0, behavior: "instant" });
      } else {
        navigatingRef.current = false;
        window.scrollTo({ top: 0, left: 0, behavior: "instant" });
      }
    };
  }, [isMenuMounted]);

  // Escape key: return from submenu to root menu, or close root menu
  useEffect(() => {
    if (!mobileMenuOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (activeSectionId) {
          handleBackToRoot();
        } else {
          handleCloseMenu();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mobileMenuOpen, activeSectionId]);

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

  const displayedSection =
    MOBILE_NAV_SECTIONS.find((sec) => sec.id === (activeSectionId || renderedSectionId)) || null;
  const isSubmenuActive = Boolean(activeSectionId && displayedSection);
  const primarySubitems = displayedSection?.subitems.filter((s) => s.group !== "secondary") || [];
  const secondarySubitems = displayedSection?.subitems.filter((s) => s.group === "secondary") || [];

  return (
    <header className={`site-header global-header sticky top-0 z-50 ${isMenuMounted ? "menu-is-active" : ""}`}>
      <div className="global-header-inner">
        <Logo compact className="global-header-brand" />

        {/* Desktop horizontal navigation (preserved untouched) */}
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

        {/* Header Actions: Search, Bag, and Animated Mobile Menu Toggle */}
        <div className="global-header-actions">
          <button
            type="button"
            className="global-header-icon-btn"
            aria-label="Search products"
            onClick={() => {
              if (mobileMenuOpen) handleCloseMenu();
              setSearchOpen(true);
            }}
          >
            <Search size={16} strokeWidth={2} />
          </button>

          <button
            type="button"
            className="global-header-icon-btn relative"
            aria-label={totalItems > 0 ? `Shopping Bag with ${totalItems} items` : "Shopping Bag"}
            onClick={() => {
              if (mobileMenuOpen) handleCloseMenu();
              openBag();
            }}
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
            data-testid="mobile-menu-toggle-btn"
            className={`global-header-menu-btn ${mobileMenuOpen ? "is-open" : ""}`}
            aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={mobileMenuOpen}
            aria-controls="global-mobile-nav-drawer"
            onClick={handleToggleMenu}
          >
            <span className="global-hamburger-icon" aria-hidden="true">
              <span className="global-hamburger-line is-top" />
              <span className="global-hamburger-line is-bottom" />
            </span>
          </button>
        </div>
      </div>

      {/* Hierarchical Two-Level Full-Screen Mobile Navigation Curtain */}
      {isMenuMounted &&
        typeof document !== "undefined" &&
        createPortal(
          <>
            <div
              className={`global-mobile-backdrop ${isMenuVisible ? "is-visible" : "is-hidden"}`}
              aria-hidden="true"
              onClick={handleCloseMenu}
            />
            <div
              id="global-mobile-nav-drawer"
              data-testid="mobile-menu-drawer"
              className={`global-mobile-drawer global-mobile-curtain ${
                isMenuVisible ? "is-open" : "is-closing"
              }`}
              role="dialog"
              aria-modal="true"
              aria-label="Mobile navigation menu"
            >
              <div className="global-curtain-viewport">
                {/* Level 1: Main Categories Panel */}
                <div
                  ref={rootPanelRef}
                  data-testid="mobile-menu-root"
                  className={`global-curtain-level is-root ${
                    isSubmenuActive ? "is-behind" : "is-active"
                  }`}
                  aria-hidden={isSubmenuActive}
                >
                  <div className="global-curtain-inner">
                    <nav className="global-curtain-nav" aria-label="Main Categories">
                      {MOBILE_NAV_SECTIONS.map((section, idx) => (
                        <div
                          key={section.id}
                          className="global-curtain-item"
                          style={{ "--item-idx": idx } as React.CSSProperties}
                        >
                          <button
                            type="button"
                            data-testid={`mobile-menu-cat-${section.id}`}
                            onClick={() => handleOpenSubmenu(section.id)}
                            className="global-curtain-heading-btn"
                            aria-haspopup="true"
                            aria-expanded={activeSectionId === section.id}
                            tabIndex={isSubmenuActive ? -1 : 0}
                          >
                            <span>{section.label}</span>
                            <ChevronRight
                              size={19}
                              strokeWidth={1.9}
                              className="global-curtain-chevron"
                              aria-hidden="true"
                            />
                          </button>
                        </div>
                      ))}
                    </nav>

                    <div className="global-curtain-footer">
                      <div className="global-curtain-quick-links">
                        <Link
                          to="/sell-or-trade"
                          onClick={handleLinkClick}
                          className="global-curtain-quick-link"
                          tabIndex={isSubmenuActive ? -1 : 0}
                        >
                          Trade In &amp; Upgrade
                        </Link>
                        <span className="global-curtain-dot" aria-hidden="true">•</span>
                        <Link
                          to="/installment"
                          onClick={handleLinkClick}
                          className="global-curtain-quick-link"
                          tabIndex={isSubmenuActive ? -1 : 0}
                        >
                          Installments
                        </Link>
                        <span className="global-curtain-dot" aria-hidden="true">•</span>
                        <Link
                          to="/repairs"
                          onClick={handleLinkClick}
                          className="global-curtain-quick-link"
                          tabIndex={isSubmenuActive ? -1 : 0}
                        >
                          Repairs
                        </Link>
                        <span className="global-curtain-dot" aria-hidden="true">•</span>
                        <Link
                          to="/faq"
                          onClick={handleLinkClick}
                          className="global-curtain-quick-link"
                          tabIndex={isSubmenuActive ? -1 : 0}
                        >
                          FAQs
                        </Link>
                      </div>
                      <div className="global-curtain-contact">
                        <span className="global-curtain-badge">Buy &amp; Sell GH</span>
                        <span className="global-curtain-meta">
                          Accra, Dome Pillar 2 • Mon–Sat 8:30am–7:00pm
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Level 2: Dedicated Category Submenu Panel */}
                <div
                  ref={submenuPanelRef}
                  data-testid="mobile-menu-submenu"
                  data-submenu-category={displayedSection?.id || ""}
                  className={`global-curtain-level is-submenu ${
                    isSubmenuActive ? "is-active" : "is-offscreen"
                  }`}
                  aria-hidden={!isSubmenuActive}
                >
                  {displayedSection ? (
                    <div className="global-curtain-submenu-view">
                      <div className="global-curtain-submenu-bar">
                        <button
                          type="button"
                          data-testid="mobile-menu-back-btn"
                          className="global-curtain-back-btn"
                          onClick={handleBackToRoot}
                          tabIndex={isSubmenuActive ? 0 : -1}
                        >
                          <ChevronLeft size={19} strokeWidth={2.1} aria-hidden="true" />
                          <span>Back</span>
                        </button>
                      </div>

                      <div className="global-curtain-submenu-body">
                        <div className="global-curtain-submenu-header">
                          {displayedSection.eyebrow ? (
                            <span className="global-curtain-submenu-eyebrow">
                              {displayedSection.eyebrow}
                            </span>
                          ) : null}
                          <h2 className="global-curtain-submenu-title" data-testid="mobile-menu-submenu-title">
                            {displayedSection.label}
                          </h2>
                        </div>

                        <nav
                          className="global-curtain-submenu-list"
                          aria-label={`${displayedSection.label} destinations`}
                        >
                          {primarySubitems.map((subitem, sIdx) => (
                            <Link
                              key={`${displayedSection.id}-${subitem.label}`}
                              to={subitem.to}
                              onClick={handleLinkClick}
                              data-testid={`mobile-submenu-link-${displayedSection.id}-${sIdx}`}
                              className={`global-curtain-sublink ${
                                subitem.isExplore ? "is-explore-link" : ""
                              }`}
                              tabIndex={isSubmenuActive ? 0 : -1}
                            >
                              <span>{subitem.label}</span>
                            </Link>
                          ))}
                        </nav>

                        {secondarySubitems.length > 0 ? (
                          <div className="global-curtain-submenu-secondary">
                            <span className="global-curtain-submenu-group-label">More in {displayedSection.label}</span>
                            <nav
                              className="global-curtain-submenu-secondary-list"
                              aria-label={`More ${displayedSection.label} links`}
                            >
                              {secondarySubitems.map((subitem, sIdx) => (
                                <Link
                                  key={`${displayedSection.id}-more-${subitem.label}`}
                                  to={subitem.to}
                                  onClick={handleLinkClick}
                                  data-testid={`mobile-submenu-more-${displayedSection.id}-${sIdx}`}
                                  className="global-curtain-sublink-secondary"
                                  tabIndex={isSubmenuActive ? 0 : -1}
                                >
                                  <span>{subitem.label}</span>
                                </Link>
                              ))}
                            </nav>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </>,
          document.body
        )}

      {/* Global Instant Search modal */}
      <InstantSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
    </header>
  );
}
