import {
  BarChart3,
  DollarSign,
  FileText,
  Grid,
  Image as ImageIcon,
  Inbox,
  Layout,
  LogOut,
  Menu,
  MessageSquare,
  Package,
  Settings,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Star,
  Tag,
  UserCheck,
  Wrench,
  X,
} from "lucide-react";
import { useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAdminAuth } from "../admin/AdminAuth";
import {
  AdminOrderNotificationStack,
  AdminOrderSoundButton,
  useAdminOrderNotifications,
} from "../admin/AdminOrderNotifications";
import { Logo } from "../components/Logo";
import "../styles/admin.css";

interface NavGroup {
  title: string;
  items: {
    label: string;
    to: string;
    icon: typeof BarChart3;
    badgeKey?: "orders";
  }[];
}

const navGroups: NavGroup[] = [
  {
    title: "Operations",
    items: [
      { label: "Overview", to: "/admin", icon: BarChart3 },
      { label: "Products", to: "/admin/products", icon: Package },
      { label: "Pricing & Stock", to: "/admin/pricing", icon: DollarSign },
      { label: "Orders", to: "/admin/orders", icon: ShoppingBag, badgeKey: "orders" },
    ],
  },
  {
    title: "Content & Media",
    items: [
      { label: "Media Library", to: "/admin/media", icon: ImageIcon },
      { label: "Homepage", to: "/admin/homepage", icon: Layout },
      { label: "Storefront", to: "/admin/storefront", icon: Grid },
      { label: "Services", to: "/admin/services", icon: Wrench },
      { label: "Pages & Content", to: "/admin/pages", icon: FileText },
      { label: "Promotions", to: "/admin/promotions", icon: Sparkles },
    ],
  },
  {
    title: "Customer Inboxes",
    items: [
      { label: "Trade-In Requests", to: "/admin/trade-ins", icon: Tag },
      { label: "Device Requests", to: "/admin/device-requests", icon: Inbox },
      { label: "Contact Messages", to: "/admin/contact-messages", icon: MessageSquare },
      { label: "Customer Reviews", to: "/admin/reviews", icon: Star },
    ],
  },
  {
    title: "Configuration",
    items: [
      { label: "Business Settings", to: "/admin/settings", icon: Settings },
      { label: "Security & Account", to: "/admin/account", icon: ShieldCheck },
    ],
  },
];

const pageTitles: Record<string, string> = {
  "/admin": "Overview Dashboard",
  "/admin/products": "Product Management",
  "/admin/pricing": "Authoritative Pricing & Stock",
  "/admin/orders": "Order Requests",
  "/admin/media": "Media Library & Digital Assets",
  "/admin/homepage": "Homepage Content & Campaigns",
  "/admin/storefront": "Storefront & Categories",
  "/admin/services": "Services & Trade-In",
  "/admin/pages": "Pages, Contact & Policy Management",
  "/admin/trade-ins": "Trade-In Inquiries",
  "/admin/device-requests": "Device Pre-Orders",
  "/admin/contact-messages": "Customer Contact Messages",
  "/admin/promotions": "Promotions & Discounts",
  "/admin/reviews": "Customer Review Moderation",
  "/admin/settings": "Business & Store Settings",
  "/admin/account": "Admin Account & Security",
};

export function AdminLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { logout, session } = useAdminAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const reviewingOrders =
    location.pathname === "/admin/orders" || location.pathname.startsWith("/admin/orders/");

  const {
    notifications,
    unreadCount,
    soundEnabled,
    toggleSound,
    dismissNotification,
    markOrdersRead,
  } = useAdminOrderNotifications({
    userId: session?.userId ?? "admin",
    reviewingOrders,
  });

  const handleLogout = async () => {
    await logout();
    navigate("/admin/login", { replace: true });
  };

  const currentTitle =
    pageTitles[location.pathname] ||
    (location.pathname.startsWith("/admin/orders/") ? "Order Details" : "Admin Dashboard");

  return (
    <div className="admin-shell">
      {/* Mobile Drawer Backdrop */}
      {menuOpen && (
        <div
          className="admin-mobile-backdrop lg:hidden"
          onClick={() => setMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Navigation */}
      <aside className={`admin-sidebar ${menuOpen ? "is-open" : ""}`} aria-label="Admin sidebar">
        <div className="admin-sidebar-header">
          <Logo to="/admin" />
          <button
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 lg:hidden"
            type="button"
            aria-label="Close admin menu"
            onClick={() => setMenuOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        <nav className="admin-nav" aria-label="Admin main navigation">
          {navGroups.map((group) => (
            <div key={group.title} className="mb-3">
              <div className="px-3 py-1.5 text-[0.68rem] font-bold uppercase tracking-wider text-slate-400">
                {group.title}
              </div>
              <div className="flex flex-col gap-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const hasBadge = item.badgeKey === "orders" && unreadCount > 0;
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      end={item.to === "/admin"}
                      className={({ isActive }) =>
                        `admin-nav-link ${isActive ? "is-active" : ""}`
                      }
                      onClick={() => {
                        setMenuOpen(false);
                        if (item.badgeKey === "orders") markOrdersRead();
                      }}
                    >
                      <Icon size={17} className="shrink-0" />
                      <span>{item.label}</span>
                      {hasBadge && (
                        <span
                          className="admin-nav-badge"
                          aria-label={`${unreadCount} unread order requests`}
                        >
                          {unreadCount}
                        </span>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="admin-sidebar-footer">
          <div className="admin-user-pill">
            <ShieldCheck size={16} className="text-[#d4af37] shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-slate-200 truncate">
                {session?.email || "Administrator"}
              </p>
              <p className="text-[0.68rem] font-medium text-emerald-400">AAL2 MFA Verified</p>
            </div>
          </div>
          <button
            className="admin-logout-btn"
            type="button"
            onClick={() => void handleLogout()}
            aria-label="Sign out of admin session"
          >
            <LogOut size={15} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Container */}
      <div className="admin-main">
        <header className="admin-topbar">
          <div className="flex items-center gap-3 min-w-0">
            <button
              className="p-2 -ml-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 lg:hidden"
              type="button"
              aria-label="Open navigation menu"
              onClick={() => setMenuOpen(true)}
            >
              <Menu size={20} />
            </button>
            <div className="min-w-0">
              <h1 className="text-base sm:text-lg font-bold text-slate-900 truncate">
                {currentTitle}
              </h1>
            </div>
          </div>

          <div className="admin-topbar-actions">
            <AdminOrderSoundButton enabled={soundEnabled} onToggle={toggleSound} />
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Production Admin</span>
            </div>
          </div>
        </header>

        {/* Real-Time Order Toast Notifications */}
        <AdminOrderNotificationStack
          notifications={notifications}
          dismissNotification={dismissNotification}
        />

        {/* Routed Admin Page Body */}
        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
