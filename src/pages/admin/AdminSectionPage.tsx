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

const sectionCopy: Record<AdminSection, { title: string; eyebrow: string; description: string; next: string }> = {
  products: {
    eyebrow: "Product Management",
    title: "Products",
    description: "Manage the catalogue source that powers public products, homepage sections, search, filters, cart and product detail pages.",
    next: "Next step: connect Supabase products, categories, image storage and RLS policies for production persistence.",
  },
  orders: {
    eyebrow: "Order Requests",
    title: "Order Requests",
    description: "Review saved website order requests, customer details, product snapshots, fulfilment choices and status updates.",
    next: "Next step: create the owner account and run the orders migration in Supabase.",
  },
  "trade-ins": {
    eyebrow: "Trade-In Requests",
    title: "Trade-In Requests",
    description: "This page is ready for submitted trade-in records once the backend table and image uploads are configured.",
    next: "Next step: create trade_in_requests and trade_in_images with admin-only read policies.",
  },
  "device-requests": {
    eyebrow: "Device Requests",
    title: "Device Requests",
    description: "This page is ready for device sourcing requests once Supabase request storage is active.",
    next: "Next step: connect the public device request form to Supabase.",
  },
  "contact-messages": {
    eyebrow: "Contact Messages",
    title: "Contact Messages",
    description: "This page is ready for private contact submissions after backend storage and RLS are configured.",
    next: "Next step: create contact_messages and admin status controls.",
  },
  reviews: {
    eyebrow: "Reviews",
    title: "Reviews",
    description: "Approved review management belongs here. No fake reviews are shown.",
    next: "Next step: add reviews table with approval and featured flags.",
  },
  promotions: {
    eyebrow: "Promotions",
    title: "Promotions",
    description: "Promotion scheduling and activation will appear here once the promotions table is connected.",
    next: "Next step: create promotions table and public active-promotion reads.",
  },
  settings: {
    eyebrow: "Business Settings",
    title: "Business Settings",
    description: "Business name, phone numbers, WhatsApp, hours, SEO and public copy can be managed here after settings storage exists.",
    next: "Next step: create a safe public business_settings read policy and admin write policy.",
  },
  account: {
    eyebrow: "Admin Account",
    title: "Admin Account",
    description: "Production password reset and real account management require Supabase Authentication or another secure backend auth service.",
    next: "Next step: connect Supabase email/password sessions.",
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
          <p className="mt-3 text-sm font-bold leading-7 text-ink/65">Real password management is intentionally not implemented until Supabase Authentication or another secure auth backend is connected.</p>
        </section>
      )}

      <section className="admin-panel">
        <p className="eyebrow-dark">Backend status</p>
        <h2>Supabase setup required</h2>
        <p>{copy.next}</p>
      </section>
    </div>
  );
}
