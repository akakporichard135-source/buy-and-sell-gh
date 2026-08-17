import { ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { useAdminAuth } from "../../admin/AdminAuth";
import { AdminOrdersPage } from "./AdminOrdersPage";
import { AdminProductManager } from "./AdminProductManager";

type AdminSection =
  | "products"
  | "orders"
  | "trade-ins"
  | "device-requests"
  | "contact-messages"
  | "reviews"
  | "promotions"
  | "settings"
  | "account";

const sectionCopy: Record<AdminSection, { title: string; eyebrow: string; description: string; availability: string }> = {
  products: {
    eyebrow: "Product Management",
    title: "Products",
    description: "Manage the catalogue source that powers public products, homepage sections, search, filters, cart and product detail pages.",
    availability: "Product management is active.",
  },
  orders: {
    eyebrow: "Order Requests",
    title: "Order Requests",
    description: "Review saved website order requests, customer details, product snapshots, fulfilment choices and status updates.",
    availability: "Order management is active for authorized administrators.",
  },
  "trade-ins": {
    eyebrow: "Trade-In Requests",
    title: "Trade-In Requests",
    description: "Trade-in requests are currently handled through WhatsApp after customers prepare their details on the public form.",
    availability: "A saved trade-in inbox is not active yet.",
  },
  "device-requests": {
    eyebrow: "Device Requests",
    title: "Device Requests",
    description: "Pre-order requests are currently prepared on the website and sent to Buy & Sell GH through WhatsApp.",
    availability: "A saved pre-order inbox is not active yet.",
  },
  "contact-messages": {
    eyebrow: "Contact Messages",
    title: "Contact Messages",
    description: "Contact-form details are currently prepared on the website and sent through WhatsApp.",
    availability: "A saved contact-message inbox is not active yet.",
  },
  reviews: {
    eyebrow: "Reviews",
    title: "Reviews",
    description: "Verified customer reviews can be managed here when review publishing is enabled.",
    availability: "Review publishing is not active. No placeholder reviews are shown publicly.",
  },
  promotions: {
    eyebrow: "Promotions",
    title: "Promotions",
    description: "Public promotions are currently maintained outside this dashboard.",
    availability: "Promotion editing is not active in this dashboard.",
  },
  settings: {
    eyebrow: "Business Settings",
    title: "Business Settings",
    description: "Business contact details, opening hours and public website information are currently maintained outside this dashboard.",
    availability: "Business settings are not editable here yet.",
  },
  account: {
    eyebrow: "Admin Account",
    title: "Admin Account",
    description: "View the email address attached to the current authenticated admin session.",
    availability: "Password and role changes are managed securely through Supabase Authentication.",
  },
};

export function AdminSectionPage({ section }: { section: AdminSection }) {
  const copy = sectionCopy[section];
  const { session } = useAdminAuth();

  if (section === "products") return <AdminProductManager />;
  if (section === "orders") return <AdminOrdersPage />;

  return (
    <div className="admin-page-grid">
      <section className="admin-panel admin-panel-hero">
        <div>
          <p className="eyebrow-dark">{copy.eyebrow}</p>
          <h2>{copy.title}</h2>
          <p>{copy.description}</p>
        </div>
        <Link className="btn-secondary" to="/admin">
          <ExternalLink size={17} />
          Overview
        </Link>
      </section>

      {section === "account" && (
        <section className="admin-panel">
          <p className="eyebrow-dark">Signed in as</p>
          <h2>{session?.email}</h2>
          <p className="mt-3 text-sm font-bold leading-7 text-ink/65">Password and access changes should be completed through the secure Supabase Authentication account controls.</p>
        </section>
      )}

      <section className="admin-panel">
        <p className="eyebrow-dark">Availability</p>
        <h2>Current workflow</h2>
        <p>{copy.availability}</p>
      </section>
    </div>
  );
}
