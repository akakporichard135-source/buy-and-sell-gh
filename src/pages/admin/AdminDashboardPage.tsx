import { AlertCircle, Image, MessageCircle, PackageSearch, ShoppingBag } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { isProductUnavailable, normalizeStockStatus } from "../../catalog/productCatalog";
import { useProductCatalog } from "../../catalog/ProductCatalogContext";
import { fetchAdminOrders } from "../../orders/supabaseOrderRepository";
import type { StoredOrderRequest } from "../../types/order";
import { formatGhs } from "../../utils/format";
import { requiresRealProductPhotos } from "../../utils/productImages";

export function AdminDashboardPage() {
  const { products, activeProducts, backendStatus } = useProductCatalog();
  const [orders, setOrders] = useState<StoredOrderRequest[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [ordersError, setOrdersError] = useState("");

  useEffect(() => {
    let active = true;
    fetchAdminOrders()
      .then((data) => {
        if (active) setOrders(data);
      })
      .catch(() => {
        if (active) setOrdersError("Order summaries could not be loaded. Open Orders to try again.");
      })
      .finally(() => {
        if (active) setOrdersLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const lowStockCount = activeProducts.filter((product) => normalizeStockStatus(product) === "Low Stock").length;
  const outOfStockCount = activeProducts.filter((product) => ["Out of Stock", "Sold"].includes(normalizeStockStatus(product))).length;
  const enquiryOnlyCount = activeProducts.filter((product) => product.priceOnRequest || product.price <= 0).length;
  const photosNeededCount = activeProducts.filter(requiresRealProductPhotos).length;
  const pendingOrders = orders.filter((order) => order.status === "Pending").length;
  const recentProducts = [...activeProducts]
    .sort((a, b) => new Date(b.updatedAt ?? b.createdAt ?? "").getTime() - new Date(a.updatedAt ?? a.createdAt ?? "").getTime())
    .slice(0, 5);
  const recentOrders = orders.slice(0, 5);

  const productStats = [
    { label: "Published products", value: activeProducts.length, note: `${products.length - activeProducts.length} hidden or archived`, to: "/admin/products" },
    { label: "Low-stock products", value: lowStockCount, note: "Review quantities", to: "/admin/products" },
    { label: "Out of stock or sold", value: outOfStockCount, note: "Not purchasable", to: "/admin/products" },
    { label: "Enquiry-only products", value: enquiryOnlyCount, note: "Contact for Price", to: "/admin/products" },
    { label: "Used photos needed", value: photosNeededCount, note: "Real photos pending", to: "/admin/products" },
    { label: "Pending orders", value: ordersLoading ? "..." : pendingOrders, note: ordersError ? "Orders unavailable" : `${orders.length} total order requests`, to: "/admin/orders" },
  ];

  return (
    <div className="admin-page-grid">
      <section className="admin-panel admin-panel-hero">
        <div>
          <p className="eyebrow-dark">Overview</p>
          <h2>Business dashboard</h2>
          <p>Review catalogue health, products needing attention and recent customer order requests.</p>
        </div>
        <div className={`admin-status-pill ${backendStatus === "supabase" ? "is-ready" : ""}`}>
          <PackageSearch size={18} />
          {backendStatus === "supabase" ? "Live catalogue connected" : "Catalogue connection needs attention"}
        </div>
      </section>

      <section className="admin-stat-grid" aria-label="Business summaries">
        {productStats.map((stat) => (
          <Link className="admin-stat-card" key={stat.label} to={stat.to}>
            <span>{stat.label}</span>
            <strong>{stat.value}</strong>
            <small>{stat.note}</small>
          </Link>
        ))}
      </section>

      {ordersError && <div className="admin-warning" role="alert"><AlertCircle size={18} /> {ordersError}</div>}

      <section className="admin-panel">
        <div className="admin-section-title">
          <div>
            <p className="eyebrow-dark">Order requests</p>
            <h2>Recent orders</h2>
          </div>
          <Link className="btn-secondary" to="/admin/orders"><ShoppingBag size={17} /> View Orders</Link>
        </div>
        {ordersLoading ? (
          <p className="admin-empty-copy">Loading current order requests...</p>
        ) : recentOrders.length > 0 ? (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead><tr><th>Reference</th><th>Customer</th><th>Total</th><th>Status</th><th>Date</th></tr></thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id}>
                    <td><Link to={`/admin/orders/${order.id}`}>{order.referenceNumber}</Link></td>
                    <td>{order.customer.fullName}<br /><span className="text-xs text-ink/55">{order.customer.phone}</span></td>
                    <td>{formatGhs(order.total)}</td>
                    <td>{order.status}</td>
                    <td>{new Date(order.createdAt).toLocaleDateString("en-GH")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="admin-empty-state"><ShoppingBag size={22} /><strong>No order requests yet</strong><span>New website order requests will appear here.</span></div>
        )}
      </section>

      <section className="admin-panel">
        <div className="admin-section-title">
          <div>
            <p className="eyebrow-dark">Catalogue</p>
            <h2>Recently updated products</h2>
          </div>
          <Link className="btn-secondary" to="/admin/products">View Products</Link>
        </div>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead><tr><th>Name</th><th>Price</th><th>Condition</th><th>Stock</th></tr></thead>
            <tbody>
              {recentProducts.map((product) => (
                <tr key={product.id}>
                  <td>{product.name}</td>
                  <td>{product.priceOnRequest || product.price <= 0 ? "Contact for Price" : formatGhs(product.price)}</td>
                  <td>{product.condition}</td>
                  <td>{normalizeStockStatus(product)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="admin-attention-grid">
        <Link className="admin-request-card" to="/admin/products"><Image size={20} /><strong>{photosNeededCount}</strong><span>Used products need real photos</span><small>Upload exact-device photos before publishing.</small></Link>
        <Link className="admin-request-card" to="/admin/products"><MessageCircle size={20} /><strong>{enquiryOnlyCount}</strong><span>Products are enquiry-only</span><small>Add a confirmed price and valid stock when ready.</small></Link>
        <Link className="admin-request-card" to="/admin/products"><AlertCircle size={20} /><strong>{activeProducts.filter(isProductUnavailable).length}</strong><span>Products cannot enter cart</span><small>Review price, stock and published availability.</small></Link>
      </section>
    </div>
  );
}
