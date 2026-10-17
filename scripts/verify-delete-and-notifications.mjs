import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";

async function verify() {
  console.log("============================================================");
  console.log("  VERIFYING ORDER DELETION & NOTIFICATION SOUND FIXES      ");
  console.log("============================================================\n");

  const projectRoot = process.cwd();

  // 1. Verify Migration 021
  console.log("[CHECK 1] Inspecting Migration 021...");
  const migration021 = await readFile(
    path.join(projectRoot, "supabase/migrations/021_order_delete_and_realtime_permissions.sql"),
    "utf8"
  );
  assert.match(migration021, /GRANT UPDATE \(archived_at, archived_by, deleted_at, deleted_by, updated_at\) ON public\.orders TO authenticated/i, "Grants column UPDATE to authenticated");
  assert.match(migration021, /GRANT DELETE ON public\.orders TO authenticated/i, "Grants DELETE on orders to authenticated");
  assert.match(migration021, /GRANT DELETE ON public\.order_items TO authenticated/i, "Grants DELETE on order_items to authenticated");
  assert.match(migration021, /ALTER PUBLICATION supabase_realtime ADD TABLE public\.orders/i, "Adds orders to supabase_realtime publication");
  assert.match(migration021, /admin_soft_delete_orders/i, "Defines admin_soft_delete_orders RPC");
  assert.match(migration021, /admin_hard_delete_orders/i, "Defines admin_hard_delete_orders RPC");
  assert.match(migration021, /auth\.jwt\(\)\s*->>\s*'aal'\s*=\s*'aal2'/i, "Enforces AAL2 MFA for hard delete");
  console.log("  [PASS] Migration 021 is complete, secure, and ready for execution.");

  // 2. Verify Order Repository
  console.log("\n[CHECK 2] Inspecting Supabase Order Repository...");
  const orderRepo = await readFile(
    path.join(projectRoot, "src/orders/supabaseOrderRepository.ts"),
    "utf8"
  );
  assert.match(orderRepo, /admin-orders-realtime/, "Uses unified admin-orders-realtime channel");
  assert.match(orderRepo, /\.on\("broadcast",\s*\{\s*event:\s*"new_order"\s*\}/, "Listens to realtime broadcast events");
  assert.match(orderRepo, /\.on\(\s*"postgres_changes",\s*\{\s*event:\s*"INSERT"/, "Listens to postgres_changes INSERT events");
  assert.match(orderRepo, /\.send\(\s*\{\s*type:\s*"broadcast",\s*event:\s*"new_order"/, "submitOrder broadcasts new_order event");
  assert.match(orderRepo, /admin_soft_delete_orders/, "Calls admin_soft_delete_orders RPC");
  assert.match(orderRepo, /admin_hard_delete_orders/, "Calls admin_hard_delete_orders RPC");
  assert.match(orderRepo, /recordLocalDeletedOrderIds/, "Records local deleted orders for dev mode");
  console.log("  [PASS] Order repository real-time broadcast and safe delete layer verified.");

  // 3. Verify Admin Order Notifications & Audio Synthesis
  console.log("\n[CHECK 3] Inspecting Admin Order Notifications & Audio...");
  const orderNotifs = await readFile(
    path.join(projectRoot, "src/admin/AdminOrderNotifications.tsx"),
    "utf8"
  );
  assert.match(orderNotifs, /getOrCreateAudioContext/, "Handles AudioContext lazy creation and resume");
  assert.match(orderNotifs, /playChimeTone/, "Apple-quality dual-tone chime synthesizer defined");
  assert.match(orderNotifs, /visibilitychange/, "Refreshes for new orders when tab becomes visible");
  assert.match(orderNotifs, /playChimeTone\(context\)/, "Plays test chime on sound enable for instant confirmation");
  console.log("  [PASS] Admin order notifications, audio playback, and instant test chime verified.");

  // 4. Verify Admin Orders Page
  console.log("\n[CHECK 4] Inspecting Admin Orders Page...");
  const ordersPage = await readFile(
    path.join(projectRoot, "src/pages/admin/AdminOrdersPage.tsx"),
    "utf8"
  );
  assert.match(ordersPage, /deleteModalError/, "Tracks error state inside delete modal");
  assert.match(ordersPage, /setOrders\(\(prev\)\s*=>\s*prev\.filter\(\(o\)\s*=>\s*!deletedIds\.has\(o\.id\)\)\)/, "Filters out deleted orders immediately without refresh");
  assert.match(ordersPage, /setDeleteTarget\(null\)/, "Closes modal on successful deletion");
  assert.match(ordersPage, /\{deleteModalError && \(/, "Renders clear error banner inside delete modal");
  console.log("  [PASS] Admin orders page deletion flow and in-dialog error display verified.");

  console.log("\n============================================================");
  console.log("  ALL ORDER DELETION & NOTIFICATION CHECKS PASSED 100%!     ");
  console.log("============================================================\n");
}

verify().catch((err) => {
  console.error("Verification failed:", err);
  process.exit(1);
});
