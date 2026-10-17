import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";

export async function testOrderManagement(projectRoot) {
  // 1. Verify Migration 020
  const migration020 = await readFile(
    path.join(projectRoot, "supabase/migrations/020_order_archive_and_delete.sql"),
    "utf8"
  );
  assert.match(migration020, /archived_at\s+timestamptz/i, "Migration 020 adds archived_at to public.orders");
  assert.match(migration020, /deleted_at\s+timestamptz/i, "Migration 020 adds deleted_at to public.orders");
  assert.match(migration020, /create table if not exists public\.order_action_logs/i, "Migration 020 creates order_action_logs audit table");
  assert.match(migration020, /create policy "Admins can delete orders"/i, "Migration 020 enforces orders delete policy");
  assert.match(migration020, /auth\.jwt\(\)\s*->>\s*'aal'\s*=\s*'aal2'/i, "Migration 020 restricts order hard delete to AAL2 MFA");

  // 2. Verify Order Repository Layer
  const orderRepoSource = await readFile(
    path.join(projectRoot, "src/orders/supabaseOrderRepository.ts"),
    "utf8"
  );
  assert.match(orderRepoSource, /export const archiveAdminOrder\s*=\s*async/, "Order repository exports archiveAdminOrder");
  assert.match(orderRepoSource, /export const restoreAdminOrder\s*=\s*async/, "Order repository exports restoreAdminOrder");
  assert.match(orderRepoSource, /export const archiveAdminOrdersBulk\s*=\s*async/, "Order repository exports archiveAdminOrdersBulk");
  assert.match(orderRepoSource, /export const restoreAdminOrdersBulk\s*=\s*async/, "Order repository exports restoreAdminOrdersBulk");
  assert.match(orderRepoSource, /export const clearCompletedOrders\s*=\s*async/, "Order repository exports clearCompletedOrders");
  assert.match(orderRepoSource, /export const deleteAdminOrder\s*=\s*async/, "Order repository exports deleteAdminOrder");
  assert.match(orderRepoSource, /export const deleteAdminOrdersBulk\s*=\s*async/, "Order repository exports deleteAdminOrdersBulk");
  assert.match(orderRepoSource, /\.is\("deleted_at", null\)/, "fetchAdminOrders omits soft-deleted orders");

  // 3. Verify Admin Orders Page (Bulk management, tabs, filters, modals)
  const adminOrdersPageSource = await readFile(
    path.join(projectRoot, "src/pages/admin/AdminOrdersPage.tsx"),
    "utf8"
  );
  assert.match(adminOrdersPageSource, /Active Orders/, "AdminOrdersPage provides Active Orders tab");
  assert.match(adminOrdersPageSource, /Archived Orders/, "AdminOrdersPage provides Archived Orders tab");
  assert.match(adminOrdersPageSource, /Clear Completed/, "AdminOrdersPage provides Clear Completed action");
  assert.match(adminOrdersPageSource, /Archive Selected/, "AdminOrdersPage provides Archive Selected bulk action");
  assert.match(adminOrdersPageSource, /Restore Selected/, "AdminOrdersPage provides Restore Selected bulk action");
  assert.match(adminOrdersPageSource, /Delete Selected/, "AdminOrdersPage provides Delete Selected bulk action");
  assert.match(adminOrdersPageSource, /Soft Delete \(Recommended\)/, "AdminOrdersPage supports safe soft deletion");
  assert.match(adminOrdersPageSource, /Permanent Purge \(Hard Delete\)/, "AdminOrdersPage supports audited hard deletion");

  // 4. Verify Admin Order Detail Page (Archive, restore, delete actions)
  const adminOrderDetailPageSource = await readFile(
    path.join(projectRoot, "src/pages/admin/AdminOrderDetailPage.tsx"),
    "utf8"
  );
  assert.match(adminOrderDetailPageSource, /Archive Order/, "AdminOrderDetailPage provides Archive Order action");
  assert.match(adminOrderDetailPageSource, /Restore Order/, "AdminOrderDetailPage provides Restore Order action");
  assert.match(adminOrderDetailPageSource, /Delete Order Safely/, "AdminOrderDetailPage provides Delete modal");
  assert.match(adminOrderDetailPageSource, /This order is currently archived/, "AdminOrderDetailPage renders archived notice banner");

  console.log("Order management tests passed successfully!");
}
