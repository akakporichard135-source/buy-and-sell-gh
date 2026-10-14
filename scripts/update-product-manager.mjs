import fs from "node:fs";

let content = fs.readFileSync("src/pages/admin/AdminProductManager.tsx", "utf8");

// 1. Add ChevronLeft, ChevronRight to imports
if (!content.includes("ChevronLeft")) {
  content = content.replace(
    '  CheckCircle2,\n  Edit3,',
    '  CheckCircle2,\n  ChevronLeft,\n  ChevronRight,\n  Edit3,'
  );
}

// 2. Add pagination state and reset hook
const stateHook = `  const [availability, setAvailability] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 25;

  useEffect(() => {
    setCurrentPage(1);
  }, [query, brand, category, condition, stock, availability]);`;

content = content.replace(
  '  const [availability, setAvailability] = useState("All");',
  stateHook
);

// 3. Update searchable in filtered to include SKU and variant details
content = content.replace(
  `        product.condition,
        product.stockStatus,
        ...(product.tags ?? []),
      ]`,
  `        product.condition,
        product.stockStatus,
        ...(product.tags ?? []),
        ...(product.variants?.flatMap((v) => [v.title, v.sku || "", v.storage || "", v.color || ""]) ?? []),
      ]`
);

// 4. Add totalPages and paginatedProducts after filtered useMemo
const paginatedHook = `
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage, pageSize]);
`;

content = content.replace(
  '  }, [availability, brand, category, condition, products, query, stock]);\n',
  '  }, [availability, brand, category, condition, products, query, stock]);\n' + paginatedHook
);

// 5. In desktop table: use paginatedProducts instead of filtered
content = content.replace(
  '<div className="admin-table-shell">\n        <div className="admin-table-scroll">\n          <table className="admin-data-table">',
  '<div className="admin-table-shell hidden md:block">\n        <div className="admin-table-scroll">\n          <table className="admin-data-table">'
);

content = content.replace(
  'filtered.map((product) => {',
  'paginatedProducts.map((product) => {'
);

// 6. Add responsive mobile cards stack and pagination bar right after table shell
const mobileAndPagination = `
      {/* Responsive Mobile Product Cards (md:hidden) */}
      <div className="md:hidden flex flex-col gap-3">
        {loading ? (
          <div className="admin-card p-6 text-center text-slate-400 font-medium text-xs">
            Loading product catalog...
          </div>
        ) : filtered.length === 0 ? (
          <div className="admin-card p-6 text-center text-slate-400 font-medium text-xs">
            No products match the selected filters.
          </div>
        ) : (
          paginatedProducts.map((product) => {
            const image = getPrimaryImage(product);
            const isArchived = Boolean(product.archived);

            return (
              <div
                key={product.id}
                className={\`admin-card p-3.5 flex flex-col gap-3 \${isArchived ? "opacity-60" : ""}\`}
              >
                <div className="flex items-center gap-3">
                  {image?.src ? (
                    <img
                      src={image.src}
                      alt={image.alt || product.name}
                      className="w-12 h-12 rounded-lg object-contain bg-white border border-slate-200 shrink-0 p-1"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-slate-100 border border-slate-200 grid place-items-center text-[0.65rem] text-slate-400 font-semibold shrink-0">
                      No pic
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <span className="font-bold text-slate-900 block truncate text-sm">
                      {product.name}
                    </span>
                    <span className="text-xs text-slate-500 block">
                      {product.brand} &bull; {product.model}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-1.5 text-xs">
                  <span className="admin-badge admin-badge-slate text-[0.68rem]">{product.category}</span>
                  <span
                    className={\`admin-badge text-[0.68rem] \${
                      product.condition.includes("Brand New")
                        ? "admin-badge-emerald"
                        : "admin-badge-amber"
                    }\`}
                  >
                    {product.condition}
                  </span>
                  <span
                    className={\`admin-badge text-[0.68rem] \${
                      product.stockStatus === "In Stock"
                        ? "admin-badge-emerald"
                        : product.stockStatus === "Low Stock"
                        ? "admin-badge-amber"
                        : "admin-badge-rose"
                    }\`}
                  >
                    {product.stockStatus} ({product.stockQuantity})
                  </span>
                  <span
                    className={\`admin-badge text-[0.68rem] \${
                      isArchived
                        ? "admin-badge-rose"
                        : product.available !== false
                        ? "admin-badge-emerald"
                        : "admin-badge-slate"
                    }\`}
                  >
                    {isArchived ? "Archived" : product.available !== false ? "Published" : "Hidden"}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <span className="font-extrabold text-slate-900 text-sm">
                    {product.priceOnRequest || product.price <= 0
                      ? "Contact for Price"
                      : formatGhs(product.price)}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => startEdit(product)}
                      className="admin-btn admin-btn-secondary admin-btn-sm"
                    >
                      <Edit3 size={13} />
                      <span>Edit</span>
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        promptConfirm(
                          isArchived ? "Restore Product" : "Archive Product",
                          \`Are you sure you want to \${isArchived ? "restore" : "archive"} "\${product.name}"?\`,
                          isArchived ? "Restore" : "Archive",
                          false,
                          () => archiveProduct(product.id),
                          \`\${product.name} \${isArchived ? "restored" : "archived"}.\`
                        )
                      }
                      className="p-1.5 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100"
                      title="Toggle Archive"
                    >
                      <Archive size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 4. Pagination Controls Bar */}
      {filtered.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 rounded-xl bg-white border border-slate-200 shadow-sm">
          <div className="text-xs text-slate-500 font-medium">
            Showing <span className="font-bold text-slate-800">{(currentPage - 1) * pageSize + 1}</span> to{" "}
            <span className="font-bold text-slate-800">{Math.min(currentPage * pageSize, filtered.length)}</span> of{" "}
            <span className="font-bold text-slate-800">{filtered.length}</span> products
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
                      className={\`w-7 h-7 rounded-lg text-xs font-bold transition-all \${
                        currentPage === page
                          ? "bg-slate-900 text-white shadow-sm"
                          : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                      }\`}
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
`;

content = content.replace(
  '        </div>\n      </div>\n\n      {/* 4. Product Editor Drawer Modal */}',
  '        </div>\n      </div>' + mobileAndPagination + '\n\n      {/* 5. Product Editor Drawer Modal */}'
);

fs.writeFileSync("src/pages/admin/AdminProductManager.tsx", content, "utf8");
console.log("Updated AdminProductManager.tsx successfully");
