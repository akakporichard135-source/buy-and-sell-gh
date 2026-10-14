import fs from "node:fs";

let content = fs.readFileSync("src/pages/admin/AdminOrdersPage.tsx", "utf8");

// 1. Add ChevronLeft, ChevronRight to lucide-react imports if not present
if (!content.includes("ChevronLeft")) {
  content = content.replace(
    '  Download,\n  Eye,',
    '  ChevronLeft,\n  ChevronRight,\n  Download,\n  Eye,'
  );
}

// 2. Add pagination state and reset hook
const paginationState = `  const [orderCategory, setOrderCategory] = useState<"genuine" | "all" | "test">("genuine");
  const [loadVersion, setLoadVersion] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

  useEffect(() => {
    setCurrentPage(1);
  }, [query, status, orderCategory]);`;

content = content.replace(
  '  const [orderCategory, setOrderCategory] = useState<"genuine" | "all" | "test">("genuine");\n  const [loadVersion, setLoadVersion] = useState(0);',
  paginationState
);

// 3. Add totalPages and paginatedOrders after filtered useMemo
const paginatedHook = `
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage, pageSize]);
`;

content = content.replace(
  '  }, [categoryFilteredOrders, query, status]);\n',
  '  }, [categoryFilteredOrders, query, status]);\n' + paginatedHook
);

// 4. Replace the table section with streamlined desktop table + responsive mobile cards + pagination
const newTableAndMobileSection = `      {/* 4. Streamlined Desktop Orders Table (hidden on mobile) */}
      <div className="admin-table-shell hidden md:block">
        <div className="admin-table-scroll">
          <table className="admin-data-table">
            <thead>
              <tr>
                <th style={{ width: "20%" }}>Order &amp; Date</th>
                <th style={{ width: "22%" }}>Customer</th>
                <th style={{ width: "22%" }}>Purchased Items</th>
                <th style={{ width: "16%" }}>Total &amp; Payment</th>
                <th style={{ width: "12%" }}>Status</th>
                <th style={{ width: "8%", textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-slate-400 font-medium">
                    Loading customer orders...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-slate-400 font-medium">
                    {orderCategory === "test"
                      ? "No automated test orders found."
                      : "No orders match the selected filters."}
                  </td>
                </tr>
              ) : (
                paginatedOrders.map((order) => {
                  const isPending = order.status === "Pending";
                  const isCompleted = ["Delivered", "Completed"].includes(order.status);
                  const isCancelled = order.status === "Cancelled";
                  const isTest = isTestOrder(order);

                  return (
                    <tr key={order.id} className="hover:bg-slate-50/70">
                      {/* 1. Reference & Date */}
                      <td>
                        <div className="flex flex-col gap-0.5">
                          <Link
                            to={\`/admin/orders/\${order.id}\`}
                            className="font-mono font-bold text-slate-900 hover:text-[#d4af37] transition-colors"
                          >
                            {order.referenceNumber}
                          </Link>
                          <span className="text-xs text-slate-400">
                            {new Date(order.createdAt).toLocaleDateString("en-GH", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                          {isTest && (
                            <span className="inline-block text-[0.65rem] px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 font-sans font-bold w-fit mt-0.5">
                              Dev Test
                            </span>
                          )}
                        </div>
                      </td>

                      {/* 2. Customer */}
                      <td>
                        <div className="font-bold text-slate-900">{order.customer.fullName}</div>
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                          <span>{order.customer.phone}</span>
                          <a
                            href={\`https://wa.me/233\${order.customer.phone.replace(/^0/, "").replace(/\\s+/g, "")}\`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-emerald-600 hover:text-emerald-700 transition-colors"
                            title="Chat on WhatsApp"
                          >
                            <MessageCircle size={13} />
                          </a>
                        </div>
                      </td>

                      {/* 3. Items */}
                      <td>
                        <div className="text-xs font-semibold text-slate-800 truncate max-w-[220px]">
                          {order.items?.map((i) => \`\${i.quantity}x \${i.productName}\`).join(", ") ||
                            "Item snapshot"}
                        </div>
                        <span className="text-[0.68rem] text-slate-400">
                          {order.items?.length || 0} item{(order.items?.length || 0) === 1 ? "" : "s"}
                        </span>
                      </td>

                      {/* 4. Total & Payment */}
                      <td>
                        <div className="font-extrabold text-slate-900">{formatGhs(order.total)}</div>
                        <span
                          className={\`admin-badge text-[0.68rem] mt-0.5 \${
                            order.paymentStatus === "Paid"
                              ? "admin-badge-emerald"
                              : "admin-badge-amber"
                          }\`}
                        >
                          {order.paymentStatus}
                        </span>
                      </td>

                      {/* 5. Status & Fulfilment */}
                      <td>
                        <div className="flex flex-col gap-1 items-start">
                          <span
                            className={\`admin-badge text-[0.68rem] \${
                              isCompleted
                                ? "admin-badge-emerald"
                                : isPending
                                ? "admin-badge-amber"
                                : isCancelled
                                ? "admin-badge-rose"
                                : "admin-badge-blue"
                            }\`}
                          >
                            {order.status}
                          </span>
                          <span className="text-[0.68rem] font-medium text-slate-500">
                            {order.customer.fulfilmentType === "delivery" ? "Delivery" : "Pickup"}
                          </span>
                        </div>
                      </td>

                      {/* 6. Actions */}
                      <td style={{ textAlign: "right" }}>
                        <Link
                          to={\`/admin/orders/\${order.id}\`}
                          className="admin-btn admin-btn-secondary admin-btn-sm"
                        >
                          <Eye size={13} />
                          <span>Details</span>
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Responsive Mobile Orders Stack (md:hidden) */}
      <div className="md:hidden flex flex-col gap-3">
        {loading ? (
          <div className="admin-card p-6 text-center text-slate-400 font-medium text-xs">
            Loading customer orders...
          </div>
        ) : filtered.length === 0 ? (
          <div className="admin-card p-6 text-center text-slate-400 font-medium text-xs">
            {orderCategory === "test"
              ? "No automated test orders found."
              : "No orders match the selected filters."}
          </div>
        ) : (
          paginatedOrders.map((order) => {
            const isPending = order.status === "Pending";
            const isCompleted = ["Delivered", "Completed"].includes(order.status);
            const isCancelled = order.status === "Cancelled";
            const isTest = isTestOrder(order);

            return (
              <div key={order.id} className="admin-card p-4 flex flex-col gap-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <Link
                        to={\`/admin/orders/\${order.id}\`}
                        className="font-mono font-bold text-slate-900 text-sm hover:text-[#d4af37]"
                      >
                        {order.referenceNumber}
                      </Link>
                      {isTest && (
                        <span className="text-[0.65rem] px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 font-bold">
                          Dev Test
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-slate-400">
                      {new Date(order.createdAt).toLocaleDateString("en-GH", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>

                  <span
                    className={\`admin-badge text-[0.68rem] \${
                      isCompleted
                        ? "admin-badge-emerald"
                        : isPending
                        ? "admin-badge-amber"
                        : isCancelled
                        ? "admin-badge-rose"
                        : "admin-badge-blue"
                    }\`}
                  >
                    {order.status}
                  </span>
                </div>

                <div className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  <div className="font-semibold text-slate-900">{order.customer.fullName}</div>
                  <div className="flex items-center justify-between mt-1 text-slate-500">
                    <span>{order.customer.phone}</span>
                    <a
                      href={\`https://wa.me/233\${order.customer.phone.replace(/^0/, "").replace(/\\s+/g, "")}\`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-600 font-semibold flex items-center gap-1"
                    >
                      <MessageCircle size={13} />
                      <span>WhatsApp</span>
                    </a>
                  </div>
                  <div className="mt-1.5 pt-1.5 border-t border-slate-200/60 truncate font-medium">
                    {order.items?.map((i) => \`\${i.quantity}x \${i.productName}\`).join(", ") ||
                      "Item snapshot"}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div>
                    <div className="font-extrabold text-slate-900 text-base">{formatGhs(order.total)}</div>
                    <span
                      className={\`admin-badge text-[0.68rem] \${
                        order.paymentStatus === "Paid"
                          ? "admin-badge-emerald"
                          : "admin-badge-amber"
                      }\`}
                    >
                      {order.paymentStatus} &bull; {order.customer.fulfilmentType === "delivery" ? "Delivery" : "Pickup"}
                    </span>
                  </div>

                  <Link
                    to={\`/admin/orders/\${order.id}\`}
                    className="admin-btn admin-btn-secondary admin-btn-sm"
                  >
                    <Eye size={13} />
                    <span>View Details</span>
                  </Link>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 6. Orders Pagination Bar */}
      {filtered.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 rounded-xl bg-white border border-slate-200 shadow-sm">
          <div className="text-xs text-slate-500 font-medium">
            Showing <span className="font-bold text-slate-800">{(currentPage - 1) * pageSize + 1}</span> to{" "}
            <span className="font-bold text-slate-800">{Math.min(currentPage * pageSize, filtered.length)}</span> of{" "}
            <span className="font-bold text-slate-800">{filtered.length}</span> orders
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
      )}`;

// Replace old table shell
content = content.replace(
  /\{\/\* 4\. Orders Table \*\/\}[\s\S]*?<\/table>\s*<\/div>\s*<\/div>/,
  newTableAndMobileSection
);

fs.writeFileSync("src/pages/admin/AdminOrdersPage.tsx", content, "utf8");
console.log("Updated AdminOrdersPage.tsx successfully");
