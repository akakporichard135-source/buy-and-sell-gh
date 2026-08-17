import { BarChart3, Bell, LogOut, Menu, Package, Settings, ShieldCheck, ShoppingBag, Star, Tag, UserCircle, X } from "lucide-react";
import { useLayoutEffect, useRef, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { business } from "../config/business";
import { useAdminAuth } from "../admin/AdminAuth";
import { AdminOrderNotificationStack, AdminOrderSoundButton, useAdminOrderNotifications } from "../admin/AdminOrderNotifications";
import { Logo } from "../components/Logo";

const adminLinks = [
  { label: "Overview", to: "/admin", icon: BarChart3 },
  { label: "Products", to: "/admin/products", icon: Package },
  { label: "Order Requests", to: "/admin/orders", icon: ShoppingBag },
  { label: "Trade-In Requests", to: "/admin/trade-ins", icon: Tag },
  { label: "Device Requests", to: "/admin/device-requests", icon: Bell },
  { label: "Contact Messages", to: "/admin/contact-messages", icon: Bell },
  { label: "Reviews", to: "/admin/reviews", icon: Star },
  { label: "Promotions", to: "/admin/promotions", icon: Tag },
  { label: "Business Settings", to: "/admin/settings", icon: Settings },
  { label: "Admin Account", to: "/admin/account", icon: UserCircle },
];

export function AdminLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { logout, session } = useAdminAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const shellRef = useRef<HTMLDivElement>(null);
  const topbarRef = useRef<HTMLElement>(null);
  const reviewingOrders = location.pathname === "/admin/orders" || location.pathname.startsWith("/admin/orders/");
  const {
    notifications,
    unreadCount,
    soundEnabled,
    toggleSound,
    dismissNotification,
    markOrdersRead,
  } = useAdminOrderNotifications({ userId: session?.userId ?? "admin", reviewingOrders });

  useLayoutEffect(() => {
    const shell = shellRef.current;
    const topbar = topbarRef.current;
    if (!shell || !topbar) return;
    const updateOffset = () => shell.style.setProperty("--admin-sticky-offset", `${topbar.getBoundingClientRect().height}px`);
    updateOffset();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(updateOffset);
    observer.observe(topbar);
    return () => observer.disconnect();
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate("/admin/login", { replace: true });
  };

  return (
    <div className="admin-shell" ref={shellRef}>
      <aside className={`admin-sidebar ${menuOpen ? "is-open" : ""}`}>
        <div className="admin-sidebar-header">
          <Logo />
          <button className="icon-button lg:hidden" type="button" aria-label="Close admin menu" onClick={() => setMenuOpen(false)}>
            <X size={20} />
          </button>
        </div>
        <nav className="admin-nav" aria-label="Admin navigation">
          {adminLinks.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                className={({ isActive }) => `admin-nav-link ${isActive ? "is-active" : ""}`}
                end={item.to === "/admin"}
                key={item.to}
                onClick={() => {
                  setMenuOpen(false);
                  if (item.to === "/admin/orders") markOrdersRead();
                }}
                to={item.to}
              >
                <Icon size={18} />
                <span>{item.label}</span>
                {item.to === "/admin/orders" && unreadCount > 0 && <span className="admin-nav-badge" aria-label={`${unreadCount} unread orders`}>{unreadCount}</span>}
              </NavLink>
            );
          })}
        </nav>
        <button className="admin-logout" type="button" onClick={() => void handleLogout()}>
          <LogOut size={18} />
          Logout
        </button>
      </aside>

      {menuOpen && <button className="admin-menu-backdrop lg:hidden" type="button" aria-label="Close admin menu" onClick={() => setMenuOpen(false)} />}

      <div className="admin-main">
        <header className="admin-topbar" ref={topbarRef}>
          <button className="icon-button lg:hidden" type="button" aria-label="Open admin menu" onClick={() => setMenuOpen(true)}>
            <Menu size={22} />
          </button>
          <div>
            <p className="eyebrow-dark">Admin Dashboard</p>
            <h1>{business.name}</h1>
          </div>
          <div className="admin-topbar-actions">
            <AdminOrderSoundButton enabled={soundEnabled} onToggle={toggleSound} />
            <div className="admin-account-pill">
              <ShieldCheck size={18} />
              <span>{session?.email} | MFA</span>
            </div>
          </div>
        </header>
        <AdminOrderNotificationStack notifications={notifications} dismissNotification={dismissNotification} />
        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
