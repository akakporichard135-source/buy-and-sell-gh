import React, { useState, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  Search,
  Tag,
  DollarSign,
  Package,
  Check,
  AlertCircle,
  Save,
  RotateCcw,
  Sparkles,
  Layers,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Percent,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";
import { useProductCatalog } from "../../catalog/ProductCatalogContext";
import { useAdminAuth } from "../../admin/AdminAuth";
import type { Product, ProductVariant, StockStatus } from "../../types/product";
import { formatPrice } from "../../utils/productPricing";
import { formatGhs } from "../../utils/format";
import { isProductImageEligible, resolveAdminProductImage } from "../../utils/productImages";

interface VariantDraft {
  price: number;
  previousPrice: number | null;
  stockQuantity: number;
  stockStatus: StockStatus;
  available: boolean;
}

export function AdminPricingManager() {
  const { session } = useAdminAuth();
  const {
    products,
    updateVariantPriceAndStock,
    updateProductBasePrice,
    backendStatus,
    loading,
  } = useProductCatalog();

  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedStockStatus, setSelectedStockStatus] = useState("All");
  const [selectedPromo, setSelectedPromo] = useState<"All" | "Sale" | "Regular">("All");
  const [searchParams, setSearchParams] = useSearchParams();
  const initialVisibility = (searchParams.get("visibility") as "valid" | "missing" | "all") || "valid";
  const [selectedVisibility, setSelectedVisibility] = useState<"valid" | "missing" | "all">(initialVisibility);
  const [expandedProductIds, setExpandedProductIds] = useState<Record<string, boolean>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

  React.useEffect(() => {
    const param = searchParams.get("visibility") as "valid" | "missing" | "all";
    if (param && (param === "valid" || param === "missing" || param === "all") && param !== selectedVisibility) {
      setSelectedVisibility(param);
    }
  }, [searchParams]);

  const handleVisibilityChange = (newVal: "valid" | "missing" | "all") => {
    setSelectedVisibility(newVal);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (newVal === "valid") {
        next.delete("visibility");
      } else {
        next.set("visibility", newVal);
      }
      return next;
    });
  };

  React.useEffect(() => {
    setCurrentPage(1);
  }, [query, selectedCategory, selectedStockStatus, selectedPromo, selectedVisibility]);

  // Local draft changes: variantId -> draft values
  const [variantDrafts, setVariantDrafts] = useState<Record<string, VariantDraft>>({});
  // Saving states: variantId -> boolean
  const [savingVariantIds, setSavingVariantIds] = useState<Record<string, boolean>>({});
  // Saved indicators: variantId -> boolean
  const [savedVariantIds, setSavedVariantIds] = useState<Record<string, boolean>>({});
  // Status message
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Editable Base Price states
  const [basePriceDrafts, setBasePriceDrafts] = useState<Record<string, { price: number; previousPrice: number | null }>>({});
  const [savingBaseIds, setSavingBaseIds] = useState<Record<string, boolean>>({});

  // Categories list
  const categoriesList = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return Array.from(set).sort();
  }, [products]);

  // Overall Statistics
  const stats = useMemo(() => {
    let totalEligibleProducts = 0;
    let totalMissingProducts = 0;
    let totalVariants = 0;
    let onSaleVariants = 0;
    let inStockVariants = 0;
    let outOfStockVariants = 0;

    products.forEach((p) => {
      const isEligible = isProductImageEligible(p);
      if (isEligible) {
        totalEligibleProducts++;
      } else {
        totalMissingProducts++;
      }

      const isIncluded =
        selectedVisibility === "valid"
          ? isEligible
          : selectedVisibility === "missing"
          ? !isEligible
          : true;

      if (isIncluded) {
        const vars = p.variants ?? [];
        totalVariants += vars.length;
        vars.forEach((v) => {
          if (v.isSale || (v.previousPrice && v.previousPrice > v.price)) {
            onSaleVariants++;
          }
          if (v.stockStatus === "In Stock") {
            inStockVariants++;
          } else if (v.stockStatus === "Out of Stock") {
            outOfStockVariants++;
          }
        });
      }
    });

    return {
      totalProducts:
        selectedVisibility === "valid"
          ? totalEligibleProducts
          : selectedVisibility === "missing"
          ? totalMissingProducts
          : products.length,
      totalEligibleProducts,
      totalMissingProducts,
      totalVariants,
      onSaleVariants,
      inStockVariants,
      outOfStockVariants,
    };
  }, [products, selectedVisibility]);

  // Filter products
  const filteredProducts = useMemo(() => {
    const q = query.trim().toLowerCase();

    return products.filter((product) => {
      // 0. Image / Visibility Filter
      const isEligible = isProductImageEligible(product);
      if (selectedVisibility === "valid" && !isEligible) {
        return false;
      }
      if (selectedVisibility === "missing" && isEligible) {
        return false;
      }

      // 1. Category Filter
      if (selectedCategory !== "All" && product.category !== selectedCategory) {
        return false;
      }

      // 2. Query filter (matches product name, slug, model, or variant titles/specs)
      const variants = product.variants ?? [];
      const matchesProduct =
        !q ||
        product.name.toLowerCase().includes(q) ||
        product.slug.toLowerCase().includes(q) ||
        product.model.toLowerCase().includes(q) ||
        variants.some((v) => v.title.toLowerCase().includes(q) || (v.storage && v.storage.toLowerCase().includes(q)));

      if (!matchesProduct) return false;

      // 3. Stock Status filter
      if (selectedStockStatus !== "All") {
        const hasMatchingStock =
          product.stockStatus === selectedStockStatus ||
          variants.some((v) => v.stockStatus === selectedStockStatus);
        if (!hasMatchingStock) return false;
      }

      // 4. Promo filter
      if (selectedPromo === "Sale") {
        const hasSale =
          Boolean(product.previousPrice && product.previousPrice > product.price) ||
          variants.some((v) => v.isSale || (v.previousPrice && v.previousPrice > v.price));
        if (!hasSale) return false;
      } else if (selectedPromo === "Regular") {
        const allRegular =
          !product.previousPrice &&
          variants.every((v) => !v.isSale && (!v.previousPrice || v.previousPrice <= v.price));
        if (!allRegular) return false;
      }

      return true;
    });
  }, [products, query, selectedCategory, selectedStockStatus, selectedPromo, selectedVisibility]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / pageSize));
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredProducts.slice(start, start + pageSize);
  }, [filteredProducts, currentPage, pageSize]);

  // Toggle expand
  const toggleExpand = (productId: string) => {
    setExpandedProductIds((prev) => ({
      ...prev,
      [productId]: !prev[productId],
    }));
  };

  const expandAll = () => {
    const next: Record<string, boolean> = {};
    filteredProducts.forEach((p) => {
      next[p.id] = true;
    });
    setExpandedProductIds(next);
  };

  const collapseAll = () => {
    setExpandedProductIds({});
  };

  // Draft variant handlers
  const getDraft = (variant: ProductVariant): VariantDraft => {
    if (variantDrafts[variant.id]) {
      return variantDrafts[variant.id];
    }
    return {
      price: variant.price,
      previousPrice: variant.previousPrice ?? null,
      stockQuantity: variant.stockQuantity,
      stockStatus: variant.stockStatus,
      available: variant.available !== false,
    };
  };

  const updateDraft = (variantId: string, updates: Partial<VariantDraft>, current: ProductVariant) => {
    const existing = getDraft(current);
    setVariantDrafts((prev) => ({
      ...prev,
      [variantId]: {
        ...existing,
        ...updates,
      },
    }));
  };

  const isVariantDirty = (variant: ProductVariant): boolean => {
    const draft = variantDrafts[variant.id];
    if (!draft) return false;
    return (
      draft.price !== variant.price ||
      draft.previousPrice !== (variant.previousPrice ?? null) ||
      draft.stockQuantity !== variant.stockQuantity ||
      draft.stockStatus !== variant.stockStatus ||
      draft.available !== (variant.available !== false)
    );
  };

  const revertVariant = (variantId: string) => {
    setVariantDrafts((prev) => {
      const next = { ...prev };
      delete next[variantId];
      return next;
    });
  };

  const saveVariant = async (variant: ProductVariant) => {
    const draft = getDraft(variant);
    setSavingVariantIds((prev) => ({ ...prev, [variant.id]: true }));

    try {
      const isSale = Boolean(draft.previousPrice && draft.previousPrice > draft.price);
      await updateVariantPriceAndStock(variant.id, {
        price: draft.price,
        previousPrice: draft.previousPrice,
        isSale,
        stockQuantity: draft.stockQuantity,
        stockStatus: draft.stockStatus,
        available: draft.available,
      });

      // Clear draft
      revertVariant(variant.id);
      setSavedVariantIds((prev) => ({ ...prev, [variant.id]: true }));
      setTimeout(() => {
        setSavedVariantIds((prev) => {
          const next = { ...prev };
          delete next[variant.id];
          return next;
        });
      }, 2500);

      showToast(`Updated pricing for ${variant.title}`);
    } catch (err: any) {
      alert(`Failed to update variant price: ${err?.message || err}`);
    } finally {
      setSavingVariantIds((prev) => ({ ...prev, [variant.id]: false }));
    }
  };

  // Base price handlers
  const saveBasePrice = async (product: Product) => {
    const draft = basePriceDrafts[product.id];
    if (!draft) return;
    setSavingBaseIds((prev) => ({ ...prev, [product.id]: true }));

    try {
      await updateProductBasePrice(product.id, draft.price, draft.previousPrice);
      setBasePriceDrafts((prev) => {
        const next = { ...prev };
        delete next[product.id];
        return next;
      });
      showToast(`Updated base price for ${product.name}`);
    } catch (err: any) {
      alert(`Failed to update base price: ${err?.message || err}`);
    } finally {
      setSavingBaseIds((prev) => ({ ...prev, [product.id]: false }));
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Check if any drafts are dirty
  const dirtyVariantCount = useMemo(() => {
    return Object.keys(variantDrafts).length;
  }, [variantDrafts]);

  const saveAllDirtyVariants = async () => {
    const variantIdList = Object.keys(variantDrafts);
    if (variantIdList.length === 0) return;

    for (const vid of variantIdList) {
      // Find variant across products
      for (const p of products) {
        const found = p.variants?.find((v) => v.id === vid);
        if (found) {
          await saveVariant(found);
          break;
        }
      }
    }
    showToast(`Successfully saved all ${variantIdList.length} variant pricing changes!`);
  };

  return (
    <div className="admin-page-grid" style={{ maxWidth: "1400px", margin: "0 auto" }}>
      {/* Toast Notification */}
      {toastMessage && (
        <div
          style={{
            position: "fixed",
            bottom: "28px",
            right: "28px",
            backgroundColor: "#111",
            color: "#fff",
            padding: "14px 22px",
            borderRadius: "12px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            zIndex: 9999,
            fontWeight: 600,
            fontSize: "14px",
            border: "1px solid rgba(255,255,255,0.15)",
          }}
        >
          <CheckCircle2 size={18} color="#34c759" />
          {toastMessage}
        </div>
      )}

      {/* Hero Header */}
      <section className="admin-panel admin-panel-hero">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px", width: "100%" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
              <span className="eyebrow-dark" style={{ margin: 0 }}>AUTHORITATIVE CATALOG PRICING</span>
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: 700,
                  padding: "2px 8px",
                  borderRadius: "999px",
                  backgroundColor: backendStatus === "supabase" ? "#e8f8ed" : "#fff3dc",
                  color: backendStatus === "supabase" ? "#1e7e34" : "#b25e00",
                }}
              >
                {backendStatus === "supabase" ? "Supabase Live (AAL2)" : "Local Engine"}
              </span>
            </div>
            <h2>Pricing &amp; Inventory Manager</h2>
            <p style={{ maxWidth: "700px" }}>
              Update selling prices, configure sale prices with strikethrough comparison, and manage real-time inventory.
              Changes become authoritative across the entire public store and cart without code changes or redeployments.
            </p>
          </div>

          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            {dirtyVariantCount > 0 && (
              <button
                type="button"
                className="btn-primary"
                onClick={saveAllDirtyVariants}
                style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
              >
                <Save size={16} />
                Save All Changes ({dirtyVariantCount})
              </button>
            )}
            <Link to="/admin/products" className="btn-secondary" style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
              <Layers size={16} />
              Product Catalog
            </Link>
          </div>
        </div>

        {/* Quick KPI Bar */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "14px",
            marginTop: "24px",
            paddingTop: "20px",
            borderTop: "1px solid rgba(0,0,0,0.06)",
          }}
        >
          <div style={{ padding: "12px 16px", backgroundColor: "#fff", borderRadius: "10px", border: "1px solid #ebebeb" }}>
            <span style={{ fontSize: "12px", color: "#666", fontWeight: 500 }}>Active Catalog</span>
            <div style={{ fontSize: "20px", fontWeight: 700, color: "#111", marginTop: "2px" }}>
              {stats.totalProducts} Products
            </div>
          </div>
          <div style={{ padding: "12px 16px", backgroundColor: "#fff", borderRadius: "10px", border: "1px solid #ebebeb" }}>
            <span style={{ fontSize: "12px", color: "#666", fontWeight: 500 }}>Priced Variants</span>
            <div style={{ fontSize: "20px", fontWeight: 700, color: "#0071e3", marginTop: "2px" }}>
              {stats.totalVariants} Configurations
            </div>
          </div>
          <div style={{ padding: "12px 16px", backgroundColor: "#fff", borderRadius: "10px", border: "1px solid #ebebeb" }}>
            <span style={{ fontSize: "12px", color: "#666", fontWeight: 500 }}>Promotional Items</span>
            <div style={{ fontSize: "20px", fontWeight: 700, color: "#e30000", marginTop: "2px" }}>
              {stats.onSaleVariants} on Sale
            </div>
          </div>
          <div style={{ padding: "12px 16px", backgroundColor: "#fff", borderRadius: "10px", border: "1px solid #ebebeb" }}>
            <span style={{ fontSize: "12px", color: "#666", fontWeight: 500 }}>In-Stock Units</span>
            <div style={{ fontSize: "20px", fontWeight: 700, color: "#34c759", marginTop: "2px" }}>
              {stats.inStockVariants} Available
            </div>
          </div>
        </div>
      </section>

      {/* Filter and Search Bar */}
      <section className="admin-panel" style={{ padding: "20px" }}>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "12px",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", flex: "1 1 500px" }}>
            {/* Search */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "8px 14px",
                backgroundColor: "#f5f5f7",
                borderRadius: "8px",
                border: "1px solid #e5e5e7",
                flex: "1 1 240px",
              }}
            >
              <Search size={16} color="#888" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search product, model, or configuration..."
                style={{
                  border: "none",
                  backgroundColor: "transparent",
                  outline: "none",
                  fontSize: "14px",
                  width: "100%",
                }}
              />
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              style={{
                padding: "8px 12px",
                borderRadius: "8px",
                border: "1px solid #e5e5e7",
                backgroundColor: "#fff",
                fontSize: "14px",
                fontWeight: 500,
              }}
            >
              <option value="All">All Categories ({categoriesList.length})</option>
              {categoriesList.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            {/* Stock Filter */}
            <select
              value={selectedStockStatus}
              onChange={(e) => setSelectedStockStatus(e.target.value)}
              style={{
                padding: "8px 12px",
                borderRadius: "8px",
                border: "1px solid #e5e5e7",
                backgroundColor: "#fff",
                fontSize: "14px",
                fontWeight: 500,
              }}
            >
              <option value="All">All Stock Statuses</option>
              <option value="In Stock">In Stock</option>
              <option value="Low Stock">Low Stock</option>
              <option value="Out of Stock">Out of Stock</option>
              <option value="Pre-order">Pre-order</option>
            </select>

            {/* Promo Filter */}
            <select
              value={selectedPromo}
              onChange={(e) => setSelectedPromo(e.target.value as any)}
              style={{
                padding: "8px 12px",
                borderRadius: "8px",
                border: "1px solid #e5e5e7",
                backgroundColor: "#fff",
                fontSize: "14px",
                fontWeight: 500,
              }}
            >
              <option value="All">All Pricing Types</option>
              <option value="Sale">Sale / Promo Only</option>
              <option value="Regular">Regular Price Only</option>
            </select>

            {/* Visibility / Image Filter */}
            <select
              value={selectedVisibility}
              onChange={(e) => handleVisibilityChange(e.target.value as any)}
              style={{
                padding: "8px 12px",
                borderRadius: "8px",
                border: selectedVisibility === "missing" ? "1px solid #d4af37" : "1px solid #e5e5e7",
                backgroundColor: selectedVisibility === "missing" ? "#fffbf0" : "#fff",
                fontSize: "14px",
                fontWeight: 600,
                color: selectedVisibility === "missing" ? "#b25e00" : "#111",
              }}
            >
              <option value="valid">Visible Products ({stats.totalEligibleProducts})</option>
              <option value="missing">Hidden — Missing Images ({stats.totalMissingProducts})</option>
              <option value="all">All Catalog Records ({products.length})</option>
            </select>
          </div>

          {/* Quick expand/collapse controls */}
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              type="button"
              className="btn-secondary"
              onClick={expandAll}
              style={{ padding: "7px 12px", fontSize: "13px" }}
            >
              Expand All
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={collapseAll}
              style={{ padding: "7px 12px", fontSize: "13px" }}
            >
              Collapse All
            </button>
          </div>
        </div>
      </section>

      {/* Recovery View Banner for Missing Images */}
      {selectedVisibility === "missing" && (
        <div
          style={{
            margin: "0 0 20px 0",
            padding: "16px 20px",
            borderRadius: "12px",
            backgroundColor: "#fffbf0",
            border: "1px solid #fed7aa",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "16px",
            flexWrap: "wrap",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span style={{ width: "10px", height: "10px", borderRadius: "999px", backgroundColor: "#f59e0b", flexShrink: 0 }} />
            <div>
              <div style={{ fontWeight: 700, fontSize: "14px", color: "#92400e" }}>
                Recovery View: Missing Images ({stats.totalMissingProducts} Products, {stats.totalVariants} Variants)
              </div>
              <div style={{ fontSize: "13px", color: "#b45309", marginTop: "2px" }}>
                These products are hidden from the live store because they require unit photos or studio assets. You can adjust their prices and stock levels here; they will remain hidden until genuine photos are uploaded.
              </div>
            </div>
          </div>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => handleVisibilityChange("valid")}
            style={{ fontSize: "13px", padding: "6px 14px", backgroundColor: "#fff", borderColor: "#fcd34d" }}
          >
            Back to Visible Products
          </button>
        </div>
      )}

      {/* Pricing Matrix Listing */}
      <section className="admin-panel" style={{ padding: "0", overflow: "hidden" }}>
        {loading ? (
          <div style={{ padding: "40px", textAlign: "center", color: "#666" }}>
            Loading products and variant matrices...
          </div>
        ) : filteredProducts.length === 0 ? (
          <div style={{ padding: "48px", textAlign: "center" }}>
            <p style={{ fontSize: "16px", fontWeight: 600, color: "#111" }}>No products match your filters</p>
            <p style={{ fontSize: "14px", color: "#666", marginTop: "4px" }}>
              Try searching a different keyword or resetting the category filter.
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column" }}>
            {paginatedProducts.map((product) => {
              const variants = product.variants ?? [];
              const isExpanded = Boolean(expandedProductIds[product.id]);
              const baseDraft = basePriceDrafts[product.id];
              const isEditingBase = Boolean(baseDraft);

              return (
                <div
                  key={product.id}
                  style={{
                    borderBottom: "1px solid #f0f0f2",
                    backgroundColor: isExpanded ? "#fcfcfd" : "#fff",
                    transition: "background-color 0.15s ease",
                  }}
                >
                  {/* Product Header Row */}
                  <div
                    style={{
                      padding: "16px 24px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "16px",
                      flexWrap: "wrap",
                      cursor: "pointer",
                    }}
                    onClick={() => toggleExpand(product.id)}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "16px", flex: "1 1 300px" }}>
                      {/* Product Thumbnail */}
                      {(() => {
                        const adminImage = resolveAdminProductImage(product) || (product.images && product.images[0]?.src ? product.images[0] : null);
                        return (
                          <div
                            style={{
                              width: "48px",
                              height: "48px",
                              borderRadius: "8px",
                              backgroundColor: "#ffffff",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              overflow: "hidden",
                              flexShrink: 0,
                              border: "1px solid #e8e8ed",
                              padding: "2px",
                            }}
                          >
                            {adminImage?.src ? (
                              <img
                                src={adminImage.src}
                                alt={product.name}
                                style={{ width: "100%", height: "100%", objectFit: "contain" }}
                              />
                            ) : (
                              <Package size={22} color="#999" />
                            )}
                          </div>
                        );
                      })()}

                      {/* Product Info */}
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                          <h4 style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: "#111" }}>
                            {product.name}
                          </h4>
                          <span
                            style={{
                              fontSize: "11px",
                              padding: "2px 8px",
                              backgroundColor: "#f2f2f7",
                              color: "#555",
                              borderRadius: "4px",
                              fontWeight: 600,
                            }}
                          >
                            {product.category}
                          </span>
                          {product.condition && (
                            <span
                              style={{
                                fontSize: "11px",
                                padding: "2px 8px",
                                backgroundColor: product.condition === "Brand New" ? "#e8f8ed" : "#f2f2f7",
                                color: product.condition === "Brand New" ? "#1e7e34" : "#555",
                                borderRadius: "4px",
                                fontWeight: 600,
                              }}
                            >
                              {product.condition}
                            </span>
                          )}
                          {!isProductImageEligible(product) && (
                            <span
                              style={{
                                fontSize: "11px",
                                padding: "2px 8px",
                                backgroundColor: "#fff3dc",
                                color: "#b25e00",
                                borderRadius: "4px",
                                fontWeight: 700,
                                border: "1px solid #fed7aa",
                              }}
                            >
                              Hidden — Missing Image
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: "13px", color: "#666", marginTop: "2px" }}>
                          Slug: <code style={{ fontSize: "12px", color: "#888" }}>{product.slug}</code>
                        </div>
                      </div>
                    </div>

                    {/* Price and Variant Badges */}
                    <div
                      style={{ display: "flex", alignItems: "center", gap: "16px" }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {/* Base Price Display / Editor */}
                      <div style={{ textAlign: "right" }}>
                        {!isEditingBase ? (
                          <div>
                            <div style={{ display: "flex", alignItems: "baseline", gap: "6px", justifyContent: "flex-end" }}>
                              <span style={{ fontSize: "15px", fontWeight: 700, color: "#111" }}>
                                {product.price > 0 ? formatPrice(product.price) : "Enquiry"}
                              </span>
                              {product.previousPrice && product.previousPrice > product.price && (
                                <span style={{ fontSize: "12px", textDecoration: "line-through", color: "#888" }}>
                                  {formatPrice(product.previousPrice)}
                                </span>
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={() =>
                                setBasePriceDrafts((prev) => ({
                                  ...prev,
                                  [product.id]: {
                                    price: product.price,
                                    previousPrice: product.previousPrice ?? null,
                                  },
                                }))
                              }
                              style={{
                                background: "none",
                                border: "none",
                                color: "#0071e3",
                                fontSize: "12px",
                                cursor: "pointer",
                                padding: "0",
                                fontWeight: 600,
                              }}
                            >
                              Edit Base Price
                            </button>
                          </div>
                        ) : (
                          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            <input
                              type="number"
                              value={baseDraft.price}
                              onChange={(e) =>
                                setBasePriceDrafts((prev) => ({
                                  ...prev,
                                  [product.id]: {
                                    ...baseDraft,
                                    price: Number(e.target.value) || 0,
                                  },
                                }))
                              }
                              placeholder="Price GH₵"
                              style={{
                                width: "100px",
                                padding: "4px 8px",
                                border: "1px solid #0071e3",
                                borderRadius: "6px",
                                fontSize: "13px",
                                fontWeight: 600,
                              }}
                            />
                            <input
                              type="number"
                              value={baseDraft.previousPrice ?? ""}
                              onChange={(e) =>
                                setBasePriceDrafts((prev) => ({
                                  ...prev,
                                  [product.id]: {
                                    ...baseDraft,
                                    previousPrice: e.target.value ? Number(e.target.value) : null,
                                  },
                                }))
                              }
                              placeholder="Old GH₵"
                              style={{
                                width: "90px",
                                padding: "4px 8px",
                                border: "1px solid #d2d2d7",
                                borderRadius: "6px",
                                fontSize: "12px",
                              }}
                            />
                            <button
                              type="button"
                              className="btn-primary"
                              disabled={savingBaseIds[product.id]}
                              onClick={() => saveBasePrice(product)}
                              style={{ padding: "4px 10px", fontSize: "12px" }}
                            >
                              {savingBaseIds[product.id] ? "Saving..." : "Save"}
                            </button>
                            <button
                              type="button"
                              className="btn-secondary"
                              onClick={() =>
                                setBasePriceDrafts((prev) => {
                                  const next = { ...prev };
                                  delete next[product.id];
                                  return next;
                                })
                              }
                              style={{ padding: "4px 8px", fontSize: "12px" }}
                            >
                              ✕
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Variant Count Badge */}
                      <span
                        style={{
                          fontSize: "12px",
                          fontWeight: 600,
                          padding: "4px 10px",
                          borderRadius: "999px",
                          backgroundColor: variants.length > 0 ? "#eef3fc" : "#f5f5f7",
                          color: variants.length > 0 ? "#0071e3" : "#666",
                        }}
                      >
                        {variants.length} {variants.length === 1 ? "variant" : "variants"}
                      </span>

                      {/* Expand / Collapse Icon */}
                      <button
                        type="button"
                        onClick={() => toggleExpand(product.id)}
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          padding: "6px",
                          display: "flex",
                          alignItems: "center",
                          color: "#666",
                        }}
                        aria-label={isExpanded ? "Collapse variants" : "Expand variants"}
                      >
                        {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Variant Matrix Table */}
                  {isExpanded && variants.length > 0 && (
                    <div
                      style={{
                        padding: "0 24px 20px 24px",
                        backgroundColor: "#fafafc",
                        borderTop: "1px solid #f0f0f2",
                      }}
                    >
                      {/* Desktop Table View: Compact and fits 100% without horizontal scrollbar */}
                      <div className="hidden md:block overflow-x-auto">
                        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
                          <thead>
                            <tr style={{ borderBottom: "1px solid #e5e5e7", textAlign: "left", color: "#666" }}>
                              <th style={{ padding: "8px 8px", fontWeight: 600 }}>Configuration Title</th>
                              <th style={{ padding: "8px 8px", fontWeight: 600 }}>Selling Price (GH₵)</th>
                              <th style={{ padding: "8px 8px", fontWeight: 600 }}>Sale / Strike (GH₵)</th>
                              <th style={{ padding: "8px 8px", fontWeight: 600 }}>Stock Status</th>
                              <th style={{ padding: "8px 8px", fontWeight: 600 }}>Qty</th>
                              <th style={{ padding: "8px 8px", fontWeight: 600 }}>Status</th>
                              <th style={{ padding: "8px 8px", fontWeight: 600, textAlign: "right" }}>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {variants.map((v) => {
                              const draft = getDraft(v);
                              const dirty = isVariantDirty(v);
                              const isSaving = savingVariantIds[v.id] ?? false;
                              const isSaved = savedVariantIds[v.id] ?? false;
                              const isOnSale = Boolean(draft.previousPrice && draft.previousPrice > draft.price);

                              return (
                                <tr
                                  key={v.id}
                                  style={{
                                    borderBottom: "1px solid #f0f0f2",
                                    backgroundColor: dirty ? "#fffbe6" : "#fff",
                                    transition: "background-color 0.2s ease",
                                  }}
                                >
                                  {/* Title / Specs */}
                                  <td style={{ padding: "8px 8px", verticalAlign: "middle" }}>
                                    <div style={{ fontWeight: 600, color: "#111", fontSize: "12px" }}>{v.title}</div>
                                    <div style={{ fontSize: "10px", color: "#888", marginTop: "1px" }}>
                                      {[v.storage, v.chip, v.memory, v.screenSize, v.connectivity]
                                        .filter(Boolean)
                                        .join(" • ")}
                                    </div>
                                  </td>

                                  {/* Selling Price */}
                                  <td style={{ padding: "8px 8px", verticalAlign: "middle" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                                      <span style={{ fontSize: "11px", fontWeight: 700, color: "#555" }}>GH₵</span>
                                      <input
                                        type="number"
                                        min="0"
                                        step="50"
                                        value={draft.price}
                                        onChange={(e) =>
                                          updateDraft(v.id, { price: Number(e.target.value) || 0 }, v)
                                        }
                                        style={{
                                          width: "88px",
                                          padding: "4px 6px",
                                          borderRadius: "6px",
                                          border: dirty ? "1.5px solid #d48800" : "1px solid #d2d2d7",
                                          fontWeight: 700,
                                          fontSize: "13px",
                                          backgroundColor: "#fff",
                                        }}
                                      />
                                    </div>
                                  </td>

                                  {/* Strikethrough / Sale Price */}
                                  <td style={{ padding: "8px 8px", verticalAlign: "middle" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                                      <span style={{ fontSize: "11px", fontWeight: 500, color: "#888" }}>GH₵</span>
                                      <input
                                        type="number"
                                        min="0"
                                        step="50"
                                        placeholder="Optional"
                                        value={draft.previousPrice ?? ""}
                                        onChange={(e) => {
                                          const val = e.target.value.trim() ? Number(e.target.value) : null;
                                          updateDraft(v.id, { previousPrice: val }, v);
                                        }}
                                        style={{
                                          width: "84px",
                                          padding: "4px 6px",
                                          borderRadius: "6px",
                                          border: isOnSale ? "1px solid #ff4d4f" : "1px solid #d2d2d7",
                                          fontSize: "12px",
                                          color: isOnSale ? "#cf1322" : "#555",
                                          backgroundColor: isOnSale ? "#fff1f0" : "#fff",
                                        }}
                                      />
                                      {isOnSale && (
                                        <span
                                          style={{
                                            fontSize: "9px",
                                            fontWeight: 700,
                                            padding: "1px 4px",
                                            borderRadius: "3px",
                                            backgroundColor: "#ff4d4f",
                                            color: "#fff",
                                          }}
                                        >
                                          SALE
                                        </span>
                                      )}
                                    </div>
                                  </td>

                                  {/* Stock Status */}
                                  <td style={{ padding: "8px 8px", verticalAlign: "middle" }}>
                                    <select
                                      value={draft.stockStatus}
                                      onChange={(e) =>
                                        updateDraft(v.id, { stockStatus: e.target.value as StockStatus }, v)
                                      }
                                      style={{
                                        padding: "4px 6px",
                                        borderRadius: "6px",
                                        border: "1px solid #d2d2d7",
                                        fontSize: "12px",
                                        fontWeight: 600,
                                        backgroundColor:
                                          draft.stockStatus === "In Stock"
                                            ? "#e8f8ed"
                                            : draft.stockStatus === "Out of Stock"
                                            ? "#fff1f0"
                                            : "#fff",
                                        color:
                                          draft.stockStatus === "In Stock"
                                            ? "#1e7e34"
                                            : draft.stockStatus === "Out of Stock"
                                            ? "#cf1322"
                                            : "#111",
                                      }}
                                    >
                                      <option value="In Stock">In Stock</option>
                                      <option value="Low Stock">Low Stock</option>
                                      <option value="Out of Stock">Out of Stock</option>
                                      <option value="Pre-order">Pre-order</option>
                                      <option value="Sold">Sold</option>
                                    </select>
                                  </td>

                                  {/* Qty */}
                                  <td style={{ padding: "8px 8px", verticalAlign: "middle" }}>
                                    <input
                                      type="number"
                                      min="0"
                                      value={draft.stockQuantity}
                                      onChange={(e) =>
                                        updateDraft(
                                          v.id,
                                          { stockQuantity: Math.max(0, parseInt(e.target.value, 10) || 0) },
                                          v
                                        )
                                      }
                                      style={{
                                        width: "50px",
                                        padding: "4px 6px",
                                        borderRadius: "6px",
                                        border: "1px solid #d2d2d7",
                                        fontSize: "12px",
                                        textAlign: "center",
                                      }}
                                    />
                                  </td>

                                  {/* Available Toggle */}
                                  <td style={{ padding: "8px 8px", verticalAlign: "middle" }}>
                                    <label
                                      style={{
                                        display: "inline-flex",
                                        alignItems: "center",
                                        gap: "4px",
                                        cursor: "pointer",
                                        fontSize: "11px",
                                        fontWeight: 600,
                                        color: draft.available ? "#1e7e34" : "#888",
                                      }}
                                    >
                                      <input
                                        type="checkbox"
                                        checked={draft.available}
                                        onChange={(e) =>
                                          updateDraft(v.id, { available: e.target.checked }, v)
                                        }
                                        style={{ width: "14px", height: "14px", cursor: "pointer" }}
                                      />
                                      {draft.available ? "Active" : "Hidden"}
                                    </label>
                                  </td>

                                  {/* Actions */}
                                  <td style={{ padding: "8px 8px", verticalAlign: "middle", textAlign: "right" }}>
                                    <div style={{ display: "inline-flex", gap: "4px", alignItems: "center" }}>
                                      {dirty && (
                                        <button
                                          type="button"
                                          onClick={() => revertVariant(v.id)}
                                          title="Discard unsaved changes"
                                          style={{
                                            border: "none",
                                            background: "none",
                                            color: "#888",
                                            cursor: "pointer",
                                            padding: "4px",
                                            borderRadius: "4px",
                                          }}
                                        >
                                          <RotateCcw size={14} />
                                        </button>
                                      )}

                                      <button
                                        type="button"
                                        disabled={!dirty || isSaving}
                                        onClick={() => saveVariant(v)}
                                        className={dirty ? "btn-primary" : "btn-secondary"}
                                        style={{
                                          padding: "4px 10px",
                                          fontSize: "11px",
                                          display: "inline-flex",
                                          alignItems: "center",
                                          gap: "4px",
                                          opacity: dirty ? 1 : 0.6,
                                          cursor: dirty ? "pointer" : "default",
                                        }}
                                      >
                                        {isSaving ? (
                                          "Saving..."
                                        ) : isSaved ? (
                                          <>
                                            <Check size={13} color="#34c759" /> Saved
                                          </>
                                        ) : (
                                          <>
                                            <Save size={13} /> Save
                                          </>
                                        )}
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>

                      {/* Mobile Card Stack View (No horizontal scrolling on phones/tablets) */}
                      <div className="md:hidden space-y-3 pt-3">
                        {variants.map((v) => {
                          const draft = getDraft(v);
                          const dirty = isVariantDirty(v);
                          const isSaving = savingVariantIds[v.id] ?? false;
                          const isSaved = savedVariantIds[v.id] ?? false;

                          return (
                            <div
                              key={v.id}
                              className={`p-3.5 rounded-xl border ${dirty ? "bg-amber-50/50 border-amber-300" : "bg-white border-slate-200"} space-y-3 shadow-sm`}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <h5 className="font-bold text-slate-900 text-sm">{v.title}</h5>
                                  <p className="text-xs text-slate-500 mt-0.5">
                                    {[v.storage, v.chip, v.memory, v.screenSize, v.connectivity].filter(Boolean).join(" • ")}
                                  </p>
                                </div>
                                <label className="flex items-center gap-1.5 text-xs font-semibold shrink-0 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={draft.available}
                                    onChange={(e) => updateDraft(v.id, { available: e.target.checked }, v)}
                                    className="rounded"
                                  />
                                  <span className={draft.available ? "text-emerald-700" : "text-slate-400"}>
                                    {draft.available ? "Active" : "Hidden"}
                                  </span>
                                </label>
                              </div>

                              <div className="grid grid-cols-2 gap-2 text-xs">
                                <div>
                                  <span className="text-slate-500 font-medium block mb-1">Selling (GH₵)</span>
                                  <input
                                    type="number"
                                    min="0"
                                    step="50"
                                    value={draft.price}
                                    onChange={(e) => updateDraft(v.id, { price: Number(e.target.value) || 0 }, v)}
                                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 font-bold text-sm bg-white"
                                  />
                                </div>
                                <div>
                                  <span className="text-slate-500 font-medium block mb-1">Sale / Strike (GH₵)</span>
                                  <input
                                    type="number"
                                    min="0"
                                    step="50"
                                    placeholder="Optional"
                                    value={draft.previousPrice ?? ""}
                                    onChange={(e) => {
                                      const val = e.target.value.trim() ? Number(e.target.value) : null;
                                      updateDraft(v.id, { previousPrice: val }, v);
                                    }}
                                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs bg-white"
                                  />
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-2 text-xs">
                                <div>
                                  <span className="text-slate-500 font-medium block mb-1">Stock Status</span>
                                  <select
                                    value={draft.stockStatus}
                                    onChange={(e) => updateDraft(v.id, { stockStatus: e.target.value as StockStatus }, v)}
                                    className="w-full px-2 py-1.5 rounded-lg border border-slate-300 font-semibold text-xs bg-white"
                                  >
                                    <option value="In Stock">In Stock</option>
                                    <option value="Low Stock">Low Stock</option>
                                    <option value="Out of Stock">Out of Stock</option>
                                    <option value="Pre-order">Pre-order</option>
                                    <option value="Sold">Sold</option>
                                  </select>
                                </div>
                                <div>
                                  <span className="text-slate-500 font-medium block mb-1">Qty</span>
                                  <input
                                    type="number"
                                    min="0"
                                    value={draft.stockQuantity}
                                    onChange={(e) => updateDraft(v.id, { stockQuantity: Math.max(0, parseInt(e.target.value, 10) || 0) }, v)}
                                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs text-center bg-white"
                                  />
                                </div>
                              </div>

                              <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-100">
                                {dirty && (
                                  <button
                                    type="button"
                                    onClick={() => revertVariant(v.id)}
                                    className="px-2.5 py-1 text-xs text-slate-500 hover:text-slate-800"
                                  >
                                    Discard
                                  </button>
                                )}
                                <button
                                  type="button"
                                  disabled={!dirty || isSaving}
                                  onClick={() => saveVariant(v)}
                                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 ${dirty ? "bg-[#d4af37] text-white hover:bg-[#b89726]" : "bg-slate-100 text-slate-400"}`}
                                >
                                  {isSaving ? "Saving..." : isSaved ? <><Check size={13} /> Saved</> : <><Save size={13} /> Save</>}
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Empty variants notice */}
                  {isExpanded && variants.length === 0 && (
                    <div style={{ padding: "16px 24px", color: "#666", fontSize: "13px" }}>
                      This product currently uses unified base pricing ({formatPrice(product.price)}). You can edit the base price above or define variants in the product editor.
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination Bar */}
        {filteredProducts.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 border-t border-slate-200 bg-slate-50/50">
            <div className="text-xs text-slate-500 font-medium">
              Showing <span className="font-bold text-slate-800">{(currentPage - 1) * pageSize + 1}</span> to{" "}
              <span className="font-bold text-slate-800">{Math.min(currentPage * pageSize, filteredProducts.length)}</span> of{" "}
              <span className="font-bold text-slate-800">{filteredProducts.length}</span> products
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="admin-btn admin-btn-secondary admin-btn-sm disabled:opacity-40 disabled:cursor-not-allowed"
                aria-label="Previous page"
              >
                <ChevronLeft size={15} />
                <span className="hidden sm:inline">Prev</span>
              </button>

              <div className="flex items-center gap-1 px-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                  if (
                    page === 1 ||
                    page === totalPages ||
                    (page >= currentPage - 1 && page <= currentPage + 1)
                  ) {
                    return (
                      <button
                        key={page}
                        type="button"
                        onClick={() => setCurrentPage(page)}
                        className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${
                          currentPage === page
                            ? "bg-slate-900 text-white shadow-sm"
                            : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        {page}
                      </button>
                    );
                  }
                  if (page === currentPage - 2 || page === currentPage + 2) {
                    return (
                      <span key={page} className="text-xs text-slate-400 px-0.5">
                        ...
                      </span>
                    );
                  }
                  return null;
                })}
              </div>

              <button
                type="button"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="admin-btn admin-btn-secondary admin-btn-sm disabled:opacity-40 disabled:cursor-not-allowed"
                aria-label="Next page"
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        )}

      </section>
    </div>
  );
}
