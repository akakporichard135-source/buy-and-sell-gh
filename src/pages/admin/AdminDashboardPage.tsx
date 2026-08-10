import { AlertTriangle, Package, ShoppingBag, Smartphone, Tag } from "lucide-react";
import { Link } from "react-router-dom";
import { useProductCatalog } from "../../catalog/ProductCatalogContext";
import { isProductUnavailable, normalizeStockStatus } from "../../catalog/productCatalog";
import { ORDER_STATUSES } from "../../types/order";
import { isSupabaseConfigured } from "../../admin/AdminAuth";

export function AdminDashboardPage() {
  const { products, activeProducts, backendStatus } = useProductCatalog();
  const productStats = [
    { label: "Total products", value: products.length },
    { label: "Published products", value: activeProducts.filter((product) => product.available !== false).length },
    { label: "Archived products", value: products.filter((product) => product.archived).length },
    { label: "In-stock products", value: activeProducts.filter((product) => normalizeStockStatus(product) === "In Stock").length },
    { label: "Low-stock products", value: activeProducts.filter((product) => normalizeStockStatus(product) === "Low Stock").length },
    { label: "Unavailable products", value: activeProducts.filter(isProductUnavailable).length },
  ];
  const recentProducts = activeProducts.slice(0, 5);

  return (
    <div className="admin-page-grid">
      <section className="admin-panel admin-panel-hero">
        <div>
          <p className="eyebrow-dark">Overview</p>
          <h2>Dashboard overview</h2>
          <p>The dashboard is prepared for real catalogue and order management. Customer order data appears after the orders migration is run and an authorized owner/admin signs in.</p>
        </div>
        <div className="admin-status-pill">
          <AlertTriangle size={18} />
          {isSupabaseConfigured() ? "Supabase env detected" : `${backendStatus === "local-catalog" ? "Local catalogue" : "Production auth required"}`}
        </div>
      </section>

      <section className="admin-stat-grid">
        {productStats.map((stat) => (
          <article className="admin-stat-card" key={stat.label}>
            <span>{stat.label}</span>
            <strong>{stat.value}</strong>
          </article>
        ))}
      </section>

      <section className="admin-panel">
        <div className="admin-section-title">
          <div>
            <p className="eyebrow-dark">Requests</p>
            <h2>Customer request readiness</h2>
          </div>
        </div>
        <div className="admin-request-grid">
          {[
            ["New order requests", "Requires Supabase orders table", ShoppingBag],
            ["New trade-in requests", "Requires Supabase trade_in_requests table", Smartphone],
            ["New device requests", "Requires Supabase device_requests table", Package],
            ["New contact messages", "Requires Supabase contact_messages table", Tag],
          ].map(([label, note, Icon]) => (
            <article className="admin-request-card" key={label as string}>
              <Icon size={20} />
              <strong>0</strong>
              <span>{label as string}</span>
              <small>{note as string}</small>
            </article>
          ))}
        </div>
      </section>

      <section className="admin-panel">
        <div className="admin-section-title">
          <div>
            <p className="eyebrow-dark">Products</p>
            <h2>Recent products</h2>
          </div>
          <Link className="btn-secondary" to="/admin/products">View Products</Link>
        </div>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr><th>Name</th><th>Price</th><th>Condition</th><th>Stock</th></tr>
            </thead>
            <tbody>
              {recentProducts.map((product) => (
                <tr key={product.id}>
                  <td>{product.name}</td>
                  <td>GHS {product.price.toLocaleString("en-GH")}</td>
                  <td>{product.condition}</td>
                  <td>{product.stockStatus}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="admin-panel">
        <div className="admin-section-title">
          <div>
            <p className="eyebrow-dark">Order status model</p>
            <h2>Prepared for future order management</h2>
          </div>
        </div>
        <div className="admin-status-grid">
          {ORDER_STATUSES.map((status) => <span key={status}>{status}</span>)}
        </div>
      </section>
    </div>
  );
}
