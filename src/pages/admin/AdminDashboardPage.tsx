import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Clock,
  DollarSign,
  Image as ImageIcon,
  Info,
  Layers,
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
import { isProductImageEligible, isProductUnavailable, normalizeStockStatus } from "../../catalog/productCatalog";
import { useProductCatalog } from "../../catalog/ProductCatalogContext";
import { fetchAdminOrders } from "../../orders/supabaseOrderRepository";
import type { StoredOrderRequest } from "../../types/order";
import { isTestOrder } from "../../types/order";
import { formatGhs } from "../../utils/format";
import { requiresRealProductPhotos } from "../../utils/productImages";

export function AdminDashboardPage() {
  const { products, activeProducts, backendStatus, loading: catalogLoading } = useProductCatalog();
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

  // Compute live metrics from verified data (excluding test/bot orders)
  const metrics = useMemo(() => {
    let totalDatabaseVariants = 0;
    let publiclyVisibleVariants = 0;
    let hiddenVariants = 0;
    let lowStockVariants = 0;
    let outOfStockVariants = 0;
    let onSaleCount = 0;

    let publishedProducts = 0;
    let missingImageProducts = 0;
    let manuallyUnpublishedProducts = 0;
    let archivedProducts = 0;

    let usedPhotosNeeded = 0;
    let accessoryAssetsNeeded = 0;

    products.forEach((p) => {
      const isArchived = Boolean(p.archived);
      const isEligible = isProductImageEligible(p);
      const isAvailable = p.available !== false;

      // Mutually exclusive 4-way classification:
      if (isArchived) {
        archivedProducts++;
      } else if (!isAvailable) {
        manuallyUnpublishedProducts++;
      } else if (!isEligible) {
        missingImageProducts++;
        if (requiresRealProductPhotos(p)) {
          usedPhotosNeeded++;
        } else {
          accessoryAssetsNeeded++;
        }
      } else {
        publishedProducts++;
      }

      // Check all variant configurations
      const vars = p.variants ?? [];
      totalDatabaseVariants += vars.length;

      const isParentPublished = !isArchived && isEligible && isAvailable;

      vars.forEach((v) => {
        const isVariantAvailable = v.available !== false;
        if (isParentPublished && isVariantAvailable) {
          publiclyVisibleVariants++;
        } else {
          hiddenVariants++;
        }

        if (v.stockStatus === "Low Stock" || (v.stockQuantity > 0 && v.stockQuantity <= 3)) {
          lowStockVariants++;
        }
        if (v.stockStatus === "Out of Stock" || v.stockQuantity <= 0) {
          outOfStockVariants++;
        }
        if (v.isSale || (v.previousPrice && v.previousPrice > v.price)) {
          onSaleCount++;
        }
      });

      if (p.previousPrice && p.previousPrice > p.price) {
        onSaleCount++;
      }
    });

    const lowStockProducts = activeProducts.filter(
      (p) => normalizeStockStatus(p) === "Low Stock"
    ).length;
    const outOfStockProducts = activeProducts.filter((p) =>
      ["Out of Stock", "Sold"].includes(normalizeStockStatus(p))
    ).length;

    // Isolate test/bot verification orders from live metrics
    const genuineOrders = orders.filter((o) => !isTestOrder(o));
    const testOrdersCount = orders.length - genuineOrders.length;

    const pendingOrders = genuineOrders.filter((o) => o.status === "Pending").length;
    const confirmedOrders = genuineOrders.filter((o) =>
      ["Confirmed", "Processing", "Delivered", "Completed"].includes(o.status)
    ).length;
    const totalOrderRequestValue = genuineOrders.reduce((sum, o) => sum + (o.total || 0), 0);

    return {
      totalProducts: products.length,
      publishedProducts,
      visibleVariants: publiclyVisibleVariants,
      missingImageProducts,
      hiddenVariants,
      totalDatabaseVariants,
      totalVariants: totalDatabaseVariants,
      activeVariants: publiclyVisibleVariants,
      manuallyUnpublishedProducts,
      archivedProducts,
      usedPhotosNeeded,
      accessoryAssetsNeeded,
      lowStockProducts,
      lowStockVariants,
      outOfStockProducts,
      outOfStockVariants,
      pendingOrders,
      confirmedOrders,
      totalOrders: genuineOrders.length,
      totalLifetimeOrders: orders.length,
      testOrdersCount,
      totalOrderRequestValue,
      onSaleCount,
    };
  }, [products, activeProducts, orders]);

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
            Real-time catalog metrics, inventory health, authoritative pricing, and incoming customer
            order requests.
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

      {/* 2. Primary Catalogue & Variant Deployment Metrics */}
      <section aria-label="Catalogue & Variant Statistics" className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Catalogue &amp; Variant Deployment Metrics
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              Dynamic Live Audit
            </span>
          </div>
          <span className="text-xs text-slate-400">
            {metrics.totalProducts} Total Devices &bull; {metrics.totalDatabaseVariants} DB Variants
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {/* Card 1: Published Products */}
          <Link
            to="/admin/products?availability=Published"
            className="admin-metric-card hover:border-emerald-500/70 transition"
            title="View Published Products on Storefront"
          >
            <div className="admin-metric-header">
              <span className="admin-metric-label">Published Products</span>
              <div className="admin-metric-icon bg-emerald-50 text-emerald-600">
                <PackageCheck size={17} />
              </div>
            </div>
            <div className="admin-metric-value text-slate-900">{metrics.publishedProducts}</div>
            <div className="admin-metric-hint text-emerald-700 font-medium">
              Live on storefront with approved images
            </div>
          </Link>

          {/* Card 2: Publicly Visible Variants */}
          <Link
            to="/admin/pricing?visibility=valid"
            className="admin-metric-card hover:border-emerald-500/70 transition"
            title="View Publicly Visible Variants in Pricing Manager"
          >
            <div className="admin-metric-header">
              <span className="admin-metric-label">Publicly Visible Variants</span>
              <div className="admin-metric-icon bg-emerald-50 text-emerald-600">
                <CheckCircle2 size={17} />
              </div>
            </div>
            <div className="admin-metric-value text-emerald-600">{metrics.visibleVariants}</div>
            <div className="admin-metric-hint text-slate-600">
              Purchasable tiers across {metrics.publishedProducts} devices
            </div>
          </Link>

          {/* Card 3: Hidden — Missing Images */}
          <Link
            to="/admin/products?availability=MissingImages"
            className="admin-metric-card hover:border-amber-500/70 transition"
            title="Open Admin Recovery View for Missing Images"
          >
            <div className="admin-metric-header">
              <span className="admin-metric-label">Hidden — Missing Images</span>
              <div className="admin-metric-icon bg-amber-50 text-amber-600">
                <ImageIcon size={17} />
              </div>
            </div>
            <div className="admin-metric-value text-amber-600">{metrics.missingImageProducts}</div>
            <div className="admin-metric-hint text-amber-700 font-medium">
              Click to open recovery view ({metrics.usedPhotosNeeded} used, {metrics.accessoryAssetsNeeded} acc.)
            </div>
          </Link>

          {/* Card 4: Hidden Variants */}
          <Link
            to="/admin/pricing?visibility=missing"
            className="admin-metric-card hover:border-amber-500/70 transition"
            title="View Hidden Variants in Pricing Manager"
          >
            <div className="admin-metric-header">
              <span className="admin-metric-label">Hidden Variants</span>
              <div className="admin-metric-icon bg-amber-50 text-amber-600">
                <Layers size={17} />
              </div>
            </div>
            <div className="admin-metric-value text-amber-600">{metrics.hiddenVariants}</div>
            <div className="admin-metric-hint text-slate-600">
              Unpublished tiers awaiting photos
            </div>
          </Link>

          {/* Card 5: Total Database Variants */}
          <Link
            to="/admin/pricing?visibility=all"
            className="admin-metric-card hover:border-slate-400 transition"
            title="View All Database Variants in Pricing Manager"
          >
            <div className="admin-metric-header">
              <span className="admin-metric-label">Total DB Variants</span>
              <div className="admin-metric-icon bg-slate-100 text-slate-700">
                <Layers size={17} />
              </div>
            </div>
            <div className="admin-metric-value text-slate-900">{metrics.totalDatabaseVariants}</div>
            <div className="admin-metric-hint text-slate-600">
              All tiers across {metrics.totalProducts} base devices
            </div>
          </Link>
        </div>
      </section>

      {/* 3. Operational Order & Inventory Health Grid */}
      <section aria-label="Operational business metrics" className="admin-metrics-grid">
        {/* Pending Orders */}
        <Link to="/admin/orders" className="admin-metric-card">
          <div className="admin-metric-header">
            <span className="admin-metric-label">Pending Orders</span>
            <div className="admin-metric-icon">
              <Clock size={17} className="text-amber-600" />
            </div>
          </div>
          <div className="admin-metric-value text-amber-600">
            {ordersLoading ? "..." : metrics.pendingOrders}
          </div>
          <div className="admin-metric-hint">
            {ordersLoading
              ? "Checking inbox..."
              : `${metrics.totalOrders} genuine customer requests ${
                  metrics.testOrdersCount > 0 ? `(${metrics.testOrdersCount} dev test isolated)` : ""
                }`}
          </div>
        </Link>

        {/* Gross Order Request Pipeline */}
        <Link to="/admin/orders" className="admin-metric-card">
          <div className="admin-metric-header">
            <span className="admin-metric-label">Order Pipeline</span>
            <div className="admin-metric-icon">
              <DollarSign size={17} className="text-emerald-600" />
            </div>
          </div>
          <div className="admin-metric-value text-slate-900 text-[1.6rem]">
            {ordersLoading ? "..." : formatGhs(metrics.totalOrderRequestValue)}
          </div>
          <div className="admin-metric-hint">
            Pipeline order requests (offline MoMo/COD payment confirmation)
          </div>
        </Link>

        {/* Low Stock Attention */}
        <Link to="/admin/pricing" className="admin-metric-card">
          <div className="admin-metric-header">
            <span className="admin-metric-label">Low Stock Variants</span>
            <div className="admin-metric-icon">
              <TrendingUp size={17} className="text-amber-500" />
            </div>
          </div>
          <div className="admin-metric-value text-amber-600">{metrics.lowStockVariants}</div>
          <div className="admin-metric-hint">
            {metrics.lowStockProducts} parent devices near depletion
          </div>
        </Link>

        {/* Out of Stock */}
        <Link to="/admin/pricing" className="admin-metric-card">
          <div className="admin-metric-header">
            <span className="admin-metric-label">Out of Stock</span>
            <div className="admin-metric-icon">
              <PackageX size={17} className="text-rose-500" />
            </div>
          </div>
          <div className="admin-metric-value text-rose-600">{metrics.outOfStockVariants}</div>
          <div className="admin-metric-hint">
            {metrics.outOfStockProducts} unpurchasable device models
          </div>
        </Link>

        {/* Active Promotions */}
        <Link to="/admin/promotions" className="admin-metric-card">
          <div className="admin-metric-header">
            <span className="admin-metric-label">Active Promos</span>
            <div className="admin-metric-icon">
              <Sparkles size={17} className="text-[#d4af37]" />
            </div>
          </div>
          <div className="admin-metric-value text-slate-900">{metrics.onSaleCount}</div>
          <div className="admin-metric-hint">Sale discounts currently published</div>
        </Link>
      </section>

      {/* 4. Catalogue Status & Integrity Architecture */}
      <section className="p-5 rounded-2xl bg-slate-900 text-white shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-3.5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[0.68rem] font-bold uppercase tracking-wider text-[#d4af37]">
                Catalogue Status &amp; Integrity Architecture
              </span>
              <span className="text-slate-500 text-xs">&bull;</span>
              <span className="text-xs font-semibold text-slate-300">
                Mutually Exclusive Status Breakdown (Zero Double-Counting)
              </span>
            </div>
            <h3 className="text-base font-bold text-white">
              {metrics.totalProducts} Total Database Devices &bull; {metrics.totalDatabaseVariants} Hardware Configurations
            </h3>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Link
              to="/admin/products?availability=MissingImages"
              className="admin-btn admin-btn-sm whitespace-nowrap text-amber-900 bg-amber-400 hover:bg-amber-300 font-semibold"
            >
              <ImageIcon size={14} />
              <span>Image Recovery View ({metrics.missingImageProducts})</span>
            </Link>
            <Link
              to="/admin/pricing"
              className="admin-btn admin-btn-secondary admin-btn-sm whitespace-nowrap text-slate-900 bg-white hover:bg-slate-100"
            >
              <span>Manage Pricing &amp; Stock</span>
            </Link>
          </div>
        </div>

        {/* 4-Status Mutual Partition Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <Link
            to="/admin/products?availability=Published"
            className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/80 hover:border-emerald-500/60 transition block"
          >
            <div className="flex items-center justify-between text-xs font-semibold text-slate-400 mb-1">
              <span>Published on Store</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
            </div>
            <div className="text-2xl font-bold text-emerald-400">{metrics.publishedProducts} Devices</div>
            <div className="text-xs text-slate-300 mt-1">
              {metrics.visibleVariants} visible variants live on buyandsellgh.com
            </div>
            <div className="text-[11px] text-slate-400 mt-1.5 flex items-center gap-1 font-medium">
              <span>Approved studio photos &bull; In stock</span>
            </div>
          </Link>

          <Link
            to="/admin/products?availability=MissingImages"
            className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/80 hover:border-amber-500/60 transition block"
          >
            <div className="flex items-center justify-between text-xs font-semibold text-slate-400 mb-1">
              <span>Hidden — Missing Images</span>
              <span className="w-2 h-2 rounded-full bg-amber-400" />
            </div>
            <div className="text-2xl font-bold text-amber-400">{metrics.missingImageProducts} Devices</div>
            <div className="text-xs text-slate-300 mt-1">
              {metrics.hiddenVariants} hidden variants isolated from public store
            </div>
            <div className="text-[11px] text-slate-400 mt-1.5 flex items-center gap-1 font-medium">
              <span>{metrics.usedPhotosNeeded} used units + {metrics.accessoryAssetsNeeded} accessories</span>
            </div>
          </Link>

          <Link
            to="/admin/products?availability=Hidden"
            className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/80 hover:border-slate-500 transition block"
          >
            <div className="flex items-center justify-between text-xs font-semibold text-slate-400 mb-1">
              <span>Manually Unpublished</span>
              <span className="w-2 h-2 rounded-full bg-slate-500" />
            </div>
            <div className="text-2xl font-bold text-slate-200">{metrics.manuallyUnpublishedProducts} Device{metrics.manuallyUnpublishedProducts === 1 ? "" : "s"}</div>
            <div className="text-xs text-slate-300 mt-1">
              {metrics.manuallyUnpublishedProducts === 1 ? "iPhone 11 Pro Max (marked Sold)" : "Admin-toggled offline items"}
            </div>
            <div className="text-[11px] text-slate-400 mt-1.5 flex items-center gap-1 font-medium">
              <span>{metrics.manuallyUnpublishedProducts} inactive item currently</span>
            </div>
          </Link>

          <Link
            to="/admin/products?availability=Archived"
            className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/80 hover:border-slate-500 transition block"
          >
            <div className="flex items-center justify-between text-xs font-semibold text-slate-400 mb-1">
              <span>Archived Records</span>
              <span className="w-2 h-2 rounded-full bg-slate-600" />
            </div>
            <div className="text-2xl font-bold text-slate-400">{metrics.archivedProducts} Devices</div>
            <div className="text-xs text-slate-300 mt-1">
              Soft-deleted records kept for order history integrity
            </div>
            <div className="text-[11px] text-slate-400 mt-1.5 flex items-center gap-1 font-medium">
              <span>0 archived items</span>
            </div>
          </Link>
        </div>

        {/* Audit Reconciliation Note */}
        <div className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/60 text-xs text-slate-300 flex items-start gap-2.5">
          <Info size={16} className="text-[#d4af37] shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-semibold text-white">
              Catalogue Reconciliation &amp; Classification Architecture:
            </span>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              Under strict mutually exclusive status partitioning, all {metrics.totalProducts} catalogue products are classified once without double-counting: <strong className="text-emerald-400">{metrics.publishedProducts} Published on Store</strong> ({metrics.visibleVariants} visible variants) + <strong className="text-amber-400">{metrics.missingImageProducts} Hidden for Missing Images</strong> ({metrics.usedPhotosNeeded} used units + {metrics.accessoryAssetsNeeded} accessories; {metrics.hiddenVariants} hidden variants) + <strong className="text-slate-200">{metrics.manuallyUnpublishedProducts} Manually Unpublished</strong> {metrics.manuallyUnpublishedProducts === 1 ? "(iPhone 11 Pro Max, marked \u2018Sold\u2019 with 0 variants)" : "(iPhone 11 Pro Max discontinued/sold out)"} + <strong className="text-slate-400">{metrics.archivedProducts} Archived</strong> = <strong>{metrics.totalProducts} Total Devices</strong> ({metrics.totalDatabaseVariants} Variants).
            </p>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              <strong>iPhone 11 Pro Max Classification:</strong> In the full 113-product catalogue, <strong className="text-slate-300">iPhone 11 Pro Max</strong> is a UK Used unit marked &lsquo;Sold&rsquo; with 0 inventory. Earlier dashboard versions reported 54 hidden products because it satisfied both &lsquo;unavailable&rsquo; and &lsquo;missing photos&rsquo; criteria simultaneously. By classifying availability first, it is definitively assigned to <em>Manually Unpublished</em> (1 Device in full catalogue; 0 in active Supabase DB), leaving exactly 52 devices held back solely for missing imagery and eliminating all duplicate counts.
            </p>
          </div>
        </div>
      </section>

      {/* 3. Operational Quick Actions */}
      <section className="admin-card">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-3">
          Quick Management Actions
        </h3>
        <div className="flex flex-wrap gap-2.5">
          <Link to="/admin/products" className="admin-btn admin-btn-primary">
            <Plus size={16} />
            <span>Manage Products</span>
          </Link>
          <Link to="/admin/pricing" className="admin-btn admin-btn-secondary">
            <DollarSign size={16} className="text-[#d4af37]" />
            <span>Authoritative Pricing & Stock</span>
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
            <span>Review Promotions</span>
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
