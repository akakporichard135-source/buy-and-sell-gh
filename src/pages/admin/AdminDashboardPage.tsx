import {
  AlertCircle,
  ArrowRight,
  Clock,
  DollarSign,
  Package,
  PackageCheck,
  PackageX,
  Plus,
  RefreshCw,
  ShoppingBag,
  Sparkles,
  Tag,
  TrendingUp,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { isProductImageEligible, normalizeStockStatus } from "../../catalog/productCatalog";
import { useProductCatalog } from "../../catalog/ProductCatalogContext";
import { fetchAdminOrders } from "../../orders/supabaseOrderRepository";
import type { StoredOrderRequest } from "../../types/order";
import { isTestOrder } from "../../types/order";
import { formatGhs } from "../../utils/format";

export function AdminDashboardPage() {
  const { products, backendStatus, loading: catalogLoading } = useProductCatalog();
  const [orders, setOrders] = useState<StoredOrderRequest[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [ordersError, setOrdersError] = useState("");

  const loadOrders = () => {
    setOrdersLoading(true);
    setOrdersError("");
    fetchAdminOrders()
      .then((data) => {
        setOrders(data);
      })
      .catch(() => {
        setOrdersError("Order summaries could not be loaded from database.");
      })
      .finally(() => {
        setOrdersLoading(false);
      });
  };

  useEffect(() => {
    loadOrders();
  }, []);

  // Compute live business metrics from verified data (excluding dev/test orders)
  const metrics = useMemo(() => {
    // 1. Published Storefront Products
    const publishedProductsList = products.filter(
      (p) => !p.archived && p.available !== false && isProductImageEligible(p)
    );
    const productsOnStore = publishedProductsList.length;

    let visibleVariants = 0;
    let lowStockProducts = 0;
    let outOfStockProducts = 0;
    let lowStockVariants = 0;
    let outOfStockVariants = 0;
    let onSaleCount = 0;

    publishedProductsList.forEach((p) => {
      const pStatus = normalizeStockStatus(p);
      const isParentLow = pStatus === "Low Stock" || (p.stockQuantity > 0 && p.stockQuantity <= 3);
      const isParentOut = pStatus === "Out of Stock" || pStatus === "Sold" || p.stockQuantity <= 0;

      const vars = (p.variants ?? []).filter((v) => v.available !== false);
      visibleVariants += vars.length;

      let hasLowVariant = false;
      let hasOutVariant = false;

      vars.forEach((v) => {
        if (v.stockStatus === "Low Stock" || (v.stockQuantity > 0 && v.stockQuantity <= 3)) {
          lowStockVariants++;
          hasLowVariant = true;
        }
        if (v.stockStatus === "Out of Stock" || v.stockQuantity <= 0) {
          outOfStockVariants++;
          hasOutVariant = true;
        }
        if (v.isSale || (v.previousPrice && v.previousPrice > v.price)) {
          onSaleCount++;
        }
      });

      if (isParentLow || hasLowVariant) {
        lowStockProducts++;
      }
      if (
        isParentOut ||
        (vars.length > 0 && vars.every((v) => v.stockStatus === "Out of Stock" || v.stockQuantity <= 0))
      ) {
        outOfStockProducts++;
      }

      if (p.previousPrice && p.previousPrice > p.price) {
        onSaleCount++;
      }
    });

    // 2. Genuine Customer Orders (excluding dev/test orders)
    const genuineOrders = orders.filter((o) => !isTestOrder(o));
    const testOrdersCount = orders.length - genuineOrders.length;

    const pendingOrders = genuineOrders.filter((o) => o.status === "Pending").length;

    // Order Pipeline: Value of incoming customer requests awaiting completion
    const pipelineOrders = genuineOrders.filter((o) =>
      ["Pending", "Confirmed", "Processing"].includes(o.status)
    );
    const orderPipelineValue = pipelineOrders.reduce((sum, o) => sum + (o.total || 0), 0);

    // Completed revenue: fulfilled & delivered orders
    const completedOrders = genuineOrders.filter((o) =>
      ["Delivered", "Completed"].includes(o.status)
    );
    const completedRevenue = completedOrders.reduce((sum, o) => sum + (o.total || 0), 0);
    const completedOrdersCount = completedOrders.length;

    return {
      productsOnStore,
      visibleVariants,
      lowStockProducts,
      lowStockVariants,
      outOfStockProducts,
      outOfStockVariants,
      pendingOrders,
      orderPipelineValue,
      completedRevenue,
      completedOrdersCount,
      totalOrders: genuineOrders.length,
      testOrdersCount,
      onSaleCount,
    };
  }, [products, orders]);

  const recentOrders = useMemo(() => {
    const genuine = orders.filter((o) => !isTestOrder(o));
    return genuine.slice(0, 6);
  }, [orders]);

  return (
    <div className="space-y-6">
      {/* 1. Header & Live Connection Status */}
      <div className="admin-header-card">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-[#d4af37]">
              Operations Overview
            </span>
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-slate-300" />
            <span className="text-xs font-semibold text-slate-500">Live Production System</span>
          </div>
          <h2>E-Commerce Command Center</h2>
          <p>
            Real-time storefront metrics, customer order requests, inventory health, and authoritative pricing.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold border ${
              backendStatus === "supabase"
                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                : "bg-amber-50 text-amber-800 border-amber-200"
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                backendStatus === "supabase" ? "bg-emerald-500" : "bg-amber-500 animate-ping"
              }`}
            />
            <span>
              {backendStatus === "supabase"
                ? "Authoritative Supabase DB Connected"
                : "Checking Catalog Source..."}
            </span>
          </div>
          <button
            type="button"
            onClick={loadOrders}
            className="admin-btn admin-btn-secondary admin-btn-sm"
            title="Refresh Orders"
          >
            <RefreshCw size={14} className={ordersLoading ? "animate-spin" : ""} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* 2. Core Business Overview (5 Key Metrics) */}
      <section aria-label="Business Overview Metrics" className="space-y-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {/* 1. Products on Store */}
          <Link
            to="/admin/products"
            className="admin-metric-card hover:border-emerald-500/70 transition"
            title="Manage Published Storefront Products"
          >
            <div className="admin-metric-header">
              <span className="admin-metric-label">Products on Store</span>
              <div className="admin-metric-icon bg-emerald-50 text-emerald-600">
                <PackageCheck size={17} />
              </div>
            </div>
            <div className="admin-metric-value text-slate-900">
              {catalogLoading ? "..." : metrics.productsOnStore}
            </div>
            <div className="admin-metric-hint text-emerald-700 font-medium">
              {catalogLoading
                ? "Auditing store..."
                : `${metrics.visibleVariants} purchasable variants live`}
            </div>
          </Link>

          {/* 2. Pending Orders */}
          <Link
            to="/admin/orders"
            className="admin-metric-card hover:border-amber-500/70 transition"
            title="View Pending Customer Orders"
          >
            <div className="admin-metric-header">
              <span className="admin-metric-label">Pending Orders</span>
              <div className="admin-metric-icon bg-amber-50 text-amber-600">
                <Clock size={17} />
              </div>
            </div>
            <div className="admin-metric-value text-amber-600">
              {ordersLoading ? "..." : metrics.pendingOrders}
            </div>
            <div className="admin-metric-hint text-slate-600">
              {ordersLoading
                ? "Checking inbox..."
                : `${metrics.pendingOrders} order${metrics.pendingOrders === 1 ? "" : "s"} requiring attention`}
            </div>
          </Link>

          {/* 3. Low Stock */}
          <Link
            to="/admin/pricing"
            className="admin-metric-card hover:border-amber-500/70 transition"
            title="View Low Stock Products in Pricing & Stock"
          >
            <div className="admin-metric-header">
              <span className="admin-metric-label">Low Stock</span>
              <div className="admin-metric-icon bg-amber-50 text-amber-500">
                <TrendingUp size={17} />
              </div>
            </div>
            <div className="admin-metric-value text-amber-600">
              {catalogLoading ? "..." : metrics.lowStockProducts}
            </div>
            <div className="admin-metric-hint text-slate-600">
              {metrics.lowStockVariants} published variants near depletion
            </div>
          </Link>

          {/* 4. Out of Stock */}
          <Link
            to="/admin/pricing"
            className="admin-metric-card hover:border-rose-500/70 transition"
            title="View Out of Stock Products in Pricing & Stock"
          >
            <div className="admin-metric-header">
              <span className="admin-metric-label">Out of Stock</span>
              <div className="admin-metric-icon bg-rose-50 text-rose-500">
                <PackageX size={17} />
              </div>
            </div>
            <div className="admin-metric-value text-rose-600">
              {catalogLoading ? "..." : metrics.outOfStockProducts}
            </div>
            <div className="admin-metric-hint text-slate-600">
              {metrics.outOfStockVariants} published variants unavailable
            </div>
          </Link>

          {/* 5. Order Pipeline */}
          <Link
            to="/admin/orders"
            className="admin-metric-card hover:border-[#d4af37]/70 transition"
            title="View Order Pipeline in Orders"
          >
            <div className="admin-metric-header">
              <span className="admin-metric-label">Order Pipeline</span>
              <div className="admin-metric-icon bg-[#d4af37]/10 text-[#d4af37]">
                <DollarSign size={17} />
              </div>
            </div>
            <div className="admin-metric-value text-slate-900 text-[1.45rem]">
              {ordersLoading ? "..." : formatGhs(metrics.orderPipelineValue)}
            </div>
            <div className="admin-metric-hint text-slate-500 truncate" title={`Fulfilled revenue: ${formatGhs(metrics.completedRevenue)}`}>
              {ordersLoading
                ? "Calculating pipeline..."
                : `Fulfilled: ${formatGhs(metrics.completedRevenue)} (${metrics.completedOrdersCount} orders)`}
            </div>
          </Link>
        </div>
      </section>

      {/* 3. Operational Quick Actions */}
      <section className="admin-card">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-3">
          Quick Management Actions
        </h3>
        <div className="flex flex-wrap gap-2.5">
          <Link to="/admin/products?action=new" className="admin-btn admin-btn-primary">
            <Plus size={16} />
            <span>Add New Product</span>
          </Link>
          <Link to="/admin/products" className="admin-btn admin-btn-secondary">
            <Package size={16} />
            <span>Manage Store Products</span>
          </Link>
          <Link to="/admin/pricing" className="admin-btn admin-btn-secondary">
            <DollarSign size={16} className="text-[#d4af37]" />
            <span>Authoritative Pricing &amp; Stock</span>
          </Link>
          <Link to="/admin/orders" className="admin-btn admin-btn-secondary">
            <ShoppingBag size={16} />
            <span>Review Customer Orders</span>
          </Link>
          <Link to="/admin/trade-ins" className="admin-btn admin-btn-secondary">
            <Tag size={16} />
            <span>Trade-In Inquiries</span>
          </Link>
          <Link to="/admin/promotions" className="admin-btn admin-btn-secondary">
            <Sparkles size={16} className="text-[#d4af37]" />
            <span>Review Promotions ({metrics.onSaleCount} active)</span>
          </Link>
        </div>
      </section>

      {/* 4. Recent Order Requests Section */}
      <section className="admin-table-shell">
        <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">Recent Customer Order Requests</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Verified orders placed on buyandsellgh.com storefront. Payment &amp; fulfilment details available in Orders.
            </p>
          </div>
          <Link to="/admin/orders" className="admin-btn admin-btn-secondary admin-btn-sm shrink-0">
            <span>View All Orders</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        {ordersError && (
          <div className="m-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
            <AlertCircle size={16} />
            <span>{ordersError}</span>
          </div>
        )}

        {/* Desktop & Tablet Table (sm+) - Compact 5-column layout without horizontal scroll */}
        <div className="hidden sm:block overflow-hidden">
          <table className="w-full text-left text-xs divide-y divide-slate-200">
            <thead className="bg-slate-50/80">
              <tr>
                <th scope="col" className="py-3 px-4 font-bold text-slate-500 uppercase tracking-wider text-[0.7rem] w-[20%]">
                  Reference
                </th>
                <th scope="col" className="py-3 px-4 font-bold text-slate-500 uppercase tracking-wider text-[0.7rem] w-[35%]">
                  Customer
                </th>
                <th scope="col" className="py-3 px-4 font-bold text-slate-500 uppercase tracking-wider text-[0.7rem] w-[18%]">
                  Total
                </th>
                <th scope="col" className="py-3 px-4 font-bold text-slate-500 uppercase tracking-wider text-[0.7rem] w-[15%]">
                  Status
                </th>
                <th scope="col" className="py-3 px-4 font-bold text-slate-500 uppercase tracking-wider text-[0.7rem] w-[12%] text-right">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {ordersLoading ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-slate-400 font-medium">
                    Loading verified orders from database...
                  </td>
                </tr>
              ) : recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-slate-400 font-medium">
                    No orders recorded yet.
                  </td>
                </tr>
              ) : (
                recentOrders.map((order) => {
                  const isPending = order.status === "Pending";
                  const isCompleted = ["Delivered", "Completed"].includes(order.status);
                  return (
                    <tr key={order.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="font-mono font-bold text-slate-900">{order.referenceNumber}</div>
                        <div className="text-[11px] text-slate-400">
                          {new Date(order.createdAt).toLocaleDateString("en-GH", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900 truncate max-w-[220px]">
                          {order.customer.fullName}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate max-w-[220px]">
                          {order.customer.phone || order.customer.email}
                        </div>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap font-bold text-slate-900">
                        {formatGhs(order.total)}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`admin-badge text-[0.7rem] ${
                            isCompleted
                              ? "admin-badge-emerald"
                              : isPending
                              ? "admin-badge-amber"
                              : "admin-badge-slate"
                          }`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap text-right">
                        <Link
                          to={`/admin/orders/${order.id}`}
                          className="admin-btn admin-btn-secondary admin-btn-sm"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards (<sm) - Zero horizontal scroll, touch-optimised */}
        <div className="sm:hidden divide-y divide-slate-100">
          {ordersLoading ? (
            <div className="p-6 text-center text-slate-400 font-medium text-xs">
              Loading verified orders from database...
            </div>
          ) : recentOrders.length === 0 ? (
            <div className="p-6 text-center text-slate-400 font-medium text-xs">
              No orders recorded yet.
            </div>
          ) : (
            recentOrders.map((order) => {
              const isPending = order.status === "Pending";
              const isCompleted = ["Delivered", "Completed"].includes(order.status);
              return (
                <div key={order.id} className="p-3.5 space-y-2 hover:bg-slate-50/50 transition-colors">
                  <div className="flex items-center justify-between gap-2">
                    <div className="font-mono font-bold text-slate-900 text-xs">
                      {order.referenceNumber}
                    </div>
                    <span
                      className={`admin-badge text-[0.68rem] ${
                        isCompleted
                          ? "admin-badge-emerald"
                          : isPending
                          ? "admin-badge-amber"
                          : "admin-badge-slate"
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between gap-2 text-xs">
                    <div>
                      <div className="font-semibold text-slate-900">{order.customer.fullName}</div>
                      <div className="text-[11px] text-slate-500">
                        {order.customer.phone || order.customer.email}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-bold text-slate-900">{formatGhs(order.total)}</div>
                      <div className="text-[10px] text-slate-400">
                        {new Date(order.createdAt).toLocaleDateString("en-GH", {
                          month: "short",
                          day: "numeric",
                        })}
                      </div>
                    </div>
                  </div>
                  <div className="pt-1 flex justify-end">
                    <Link
                      to={`/admin/orders/${order.id}`}
                      className="admin-btn admin-btn-secondary admin-btn-sm w-full justify-center"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
}
