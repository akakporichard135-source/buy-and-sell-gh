import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
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
  Percent,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";
import { useProductCatalog } from "../../catalog/ProductCatalogContext";
import { useAdminAuth } from "../../admin/AdminAuth";
import type { Product, ProductVariant, StockStatus } from "../../types/product";
import { formatPrice } from "../../utils/productPricing";
import { formatGhs } from "../../utils/format";

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
  const [expandedProductIds, setExpandedProductIds] = useState<Record<string, boolean>>({});

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
    let totalVariants = 0;
    let onSaleVariants = 0;
    let inStockVariants = 0;
    let outOfStockVariants = 0;

    products.forEach((p) => {
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
    });

    return {
      totalProducts: products.length,
      totalVariants,
      onSaleVariants,
      inStockVariants,
      outOfStockVariants,
    };
  }, [products]);

  // Filter products
  const filteredProducts = useMemo(() => {
    const q = query.trim().toLowerCase();

    return products.filter((product) => {
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
  }, [products, query, selectedCategory, selectedStockStatus, selectedPromo]);

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
            {filteredProducts.map((product) => {
              const variants = product.variants ?? [];
              const isExpanded = expandedProductIds[product.id] ?? (variants.length > 0 && variants.length <= 4);
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
                      <div
                        style={{
                          width: "48px",
                          height: "48px",
                          borderRadius: "8px",
                          backgroundColor: "#f5f5f7",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          overflow: "hidden",
                          flexShrink: 0,
                          border: "1px solid #e8e8ed",
                        }}
                      >
                        {product.images && product.images[0]?.src ? (
                          <img
                            src={product.images[0].src}
                            alt={product.name}
                            style={{ width: "100%", height: "100%", objectFit: "contain", padding: "4px" }}
                          />
                        ) : (
                          <Package size={22} color="#999" />
                        )}
                      </div>

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
                      <div style={{ overflowX: "auto" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                          <thead>
                            <tr style={{ borderBottom: "1px solid #e5e5e7", textAlign: "left", color: "#666" }}>
                              <th style={{ padding: "10px 12px", fontWeight: 600 }}>Configuration Title</th>
                              <th style={{ padding: "10px 12px", fontWeight: 600 }}>Selling Price (GH₵)</th>
                              <th style={{ padding: "10px 12px", fontWeight: 600 }}>
                                <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                                  Strikethrough / Sale (GH₵)
                                </span>
                              </th>
                              <th style={{ padding: "10px 12px", fontWeight: 600 }}>Stock Status</th>
                              <th style={{ padding: "10px 12px", fontWeight: 600 }}>Qty</th>
                              <th style={{ padding: "10px 12px", fontWeight: 600 }}>Status</th>
                              <th style={{ padding: "10px 12px", fontWeight: 600, textAlign: "right" }}>Actions</th>
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
                                  <td style={{ padding: "12px", verticalAlign: "middle" }}>
                                    <div style={{ fontWeight: 600, color: "#111" }}>{v.title}</div>
                                    <div style={{ fontSize: "11px", color: "#888", marginTop: "2px" }}>
                                      {[v.storage, v.chip, v.memory, v.screenSize, v.connectivity]
                                        .filter(Boolean)
                                        .join(" • ")}
                                    </div>
                                  </td>

                                  {/* Selling Price */}
                                  <td style={{ padding: "12px", verticalAlign: "middle" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                      <span style={{ fontSize: "12px", fontWeight: 700, color: "#555" }}>GH₵</span>
                                      <input
                                        type="number"
                                        min="0"
                                        step="50"
                                        value={draft.price}
                                        onChange={(e) =>
                                          updateDraft(v.id, { price: Number(e.target.value) || 0 }, v)
                                        }
                                        style={{
                                          width: "110px",
                                          padding: "6px 8px",
                                          borderRadius: "6px",
                                          border: dirty ? "1.5px solid #d48800" : "1px solid #d2d2d7",
                                          fontWeight: 700,
                                          fontSize: "14px",
                                          backgroundColor: "#fff",
                                        }}
                                      />
                                    </div>
                                  </td>

                                  {/* Strikethrough / Sale Price */}
                                  <td style={{ padding: "12px", verticalAlign: "middle" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                      <span style={{ fontSize: "12px", fontWeight: 500, color: "#888" }}>GH₵</span>
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
                                          width: "110px",
                                          padding: "6px 8px",
                                          borderRadius: "6px",
                                          border: isOnSale ? "1px solid #ff4d4f" : "1px solid #d2d2d7",
                                          fontSize: "13px",
                                          color: isOnSale ? "#cf1322" : "#555",
                                          backgroundColor: isOnSale ? "#fff1f0" : "#fff",
                                        }}
                                      />
                                      {isOnSale && (
                                        <span
                                          style={{
                                            fontSize: "11px",
                                            fontWeight: 700,
                                            padding: "2px 6px",
                                            borderRadius: "4px",
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
                                  <td style={{ padding: "12px", verticalAlign: "middle" }}>
                                    <select
                                      value={draft.stockStatus}
                                      onChange={(e) =>
                                        updateDraft(v.id, { stockStatus: e.target.value as StockStatus }, v)
                                      }
                                      style={{
                                        padding: "6px 8px",
                                        borderRadius: "6px",
                                        border: "1px solid #d2d2d7",
                                        fontSize: "13px",
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
                                  <td style={{ padding: "12px", verticalAlign: "middle" }}>
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
                                        width: "65px",
                                        padding: "6px 8px",
                                        borderRadius: "6px",
                                        border: "1px solid #d2d2d7",
                                        fontSize: "13px",
                                        textAlign: "center",
                                      }}
                                    />
                                  </td>

                                  {/* Available Toggle */}
                                  <td style={{ padding: "12px", verticalAlign: "middle" }}>
                                    <label
                                      style={{
                                        display: "inline-flex",
                                        alignItems: "center",
                                        gap: "6px",
                                        cursor: "pointer",
                                        fontSize: "12px",
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
                                        style={{ width: "16px", height: "16px", cursor: "pointer" }}
                                      />
                                      {draft.available ? "Active" : "Hidden"}
                                    </label>
                                  </td>

                                  {/* Actions */}
                                  <td style={{ padding: "12px", verticalAlign: "middle", textAlign: "right" }}>
                                    <div style={{ display: "inline-flex", gap: "6px", alignItems: "center" }}>
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
                                            padding: "6px",
                                            borderRadius: "4px",
                                          }}
                                        >
                                          <RotateCcw size={15} />
                                        </button>
                                      )}

                                      <button
                                        type="button"
                                        disabled={!dirty || isSaving}
                                        onClick={() => saveVariant(v)}
                                        className={dirty ? "btn-primary" : "btn-secondary"}
                                        style={{
                                          padding: "6px 12px",
                                          fontSize: "12px",
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
                                            <Check size={14} color="#34c759" /> Saved
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
      </section>
    </div>
  );
}
