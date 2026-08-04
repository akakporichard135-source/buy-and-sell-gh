import { ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { products } from "../../data/products";
import { useAdminAuth } from "../../admin/AdminAuth";

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
    description: "Product list visibility is available from the current public catalogue. Create, edit, upload and publish controls require Supabase tables and storage.",
    next: "Next step: connect Supabase products, categories, image storage and RLS policies.",
  },
  orders: {
    eyebrow: "Order Requests",
    title: "Order Requests",
    description: "The public cart now prepares order request payloads. Saving, status updates and private customer details require Supabase order_requests and order_request_items.",
    next: "Next step: connect the cart form to Supabase and render saved order requests here.",
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
    description: "Temporary local access is active. Password reset and real account management require Supabase Authentication.",
    next: "Next step: replace temporary auth with Supabase email/password sessions.",
  },
};

export function AdminSectionPage({ section }: { section: AdminSection }) {
  const copy = sectionCopy[section];
  const { session } = useAdminAuth();

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

      {section === "products" && (
        <section className="admin-panel">
          <div className="admin-section-title">
            <div>
              <p className="eyebrow-dark">Current catalogue</p>
              <h2>Public product fallback</h2>
            </div>
          </div>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr><th>Name</th><th>Category</th><th>Price</th><th>Stock</th></tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id}>
                    <td>{product.name}</td>
                    <td>{product.category}</td>
                    <td>GHS {product.price.toLocaleString("en-GH")}</td>
                    <td>{product.stockStatus}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {section === "account" && (
        <section className="admin-panel">
          <p className="eyebrow-dark">Signed in as</p>
          <h2>{session?.email}</h2>
          <p className="mt-3 text-sm font-bold leading-7 text-ink/65">Temporary local session. Real password management is intentionally not implemented until Supabase Authentication is connected.</p>
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
