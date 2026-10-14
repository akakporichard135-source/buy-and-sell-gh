import fs from "node:fs";

let content = fs.readFileSync("src/pages/admin/AdminPricingManager.tsx", "utf8");

// 1. Add ChevronLeft, ChevronRight to lucide-react imports if not present
if (!content.includes("ChevronLeft")) {
  content = content.replace(
    '  ChevronDown,\n  ChevronUp,',
    '  ChevronDown,\n  ChevronUp,\n  ChevronLeft,\n  ChevronRight,'
  );
}

// 2. Add pagination state and reset effect
const paginationState = `  const [expandedProductIds, setExpandedProductIds] = useState<Record<string, boolean>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

  React.useEffect(() => {
    setCurrentPage(1);
  }, [query, selectedCategory, selectedStockStatus, selectedPromo]);`;

content = content.replace(
  '  const [expandedProductIds, setExpandedProductIds] = useState<Record<string, boolean>>({});',
  paginationState
);

// 3. Add totalPages and paginatedProducts after filteredProducts useMemo
const paginatedHook = `
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / pageSize));
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredProducts.slice(start, start + pageSize);
  }, [filteredProducts, currentPage, pageSize]);
`;

content = content.replace(
  '  }, [products, query, selectedCategory, selectedStockStatus, selectedPromo]);\n',
  '  }, [products, query, selectedCategory, selectedStockStatus, selectedPromo]);\n' + paginatedHook
);

// 4. Force collapse by default: only expanded if explicitly in expandedProductIds
content = content.replace(
  'const isExpanded = expandedProductIds[product.id] ?? (variants.length > 0 && variants.length <= 4);',
  'const isExpanded = Boolean(expandedProductIds[product.id]);'
);

// 5. Use paginatedProducts instead of filteredProducts in map
content = content.replace(
  '{filteredProducts.map((product) => {',
  '{paginatedProducts.map((product) => {'
);

// 6. Add pagination bar after products list
const paginationBar = `
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
                        className={\`w-7 h-7 rounded-lg text-xs font-bold transition-all \${
                          currentPage === page
                            ? "bg-slate-900 text-white shadow-sm"
                            : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
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
  '            })}\n          </div>\n        )}\n      </section>',
  '            })}\n          </div>\n        )}\n' + paginationBar + '\n      </section>'
);

fs.writeFileSync("src/pages/admin/AdminPricingManager.tsx", content, "utf8");
console.log("Updated AdminPricingManager.tsx successfully");
