import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";

export async function testArchiveAndDeleteNotifications(projectRoot) {
  // 1. Verify Migration 025
  const migration025 = await readFile(
    path.join(projectRoot, "supabase/migrations/025_service_requests_archive_and_delete.sql"),
    "utf8"
  );
  assert.match(migration025, /archived_at\s+timestamptz/i, "Migration 025 adds archived_at to public.service_requests");
  assert.match(migration025, /deleted_at\s+timestamptz/i, "Migration 025 adds deleted_at to public.service_requests");
  assert.match(migration025, /create table if not exists public\.service_request_action_logs/i, "Migration 025 creates service_request_action_logs audit table");
  assert.match(migration025, /admin_archive_service_request/i, "Migration 025 creates admin_archive_service_request RPC");
  assert.match(migration025, /admin_restore_service_request/i, "Migration 025 creates admin_restore_service_request RPC");
  assert.match(migration025, /admin_hard_delete_service_request/i, "Migration 025 creates admin_hard_delete_service_request RPC");
  assert.match(migration025, /ALTER PUBLICATION supabase_realtime ADD TABLE public\.service_requests/i, "Migration 025 adds service_requests to realtime publication");

  // 2. Verify Service Request Repository Layer
  const serviceRepoSource = await readFile(
    path.join(projectRoot, "src/services/serviceRequestRepository.ts"),
    "utf8"
  );
  assert.match(serviceRepoSource, /export async function archiveServiceRequest/, "Service repository exports archiveServiceRequest");
  assert.match(serviceRepoSource, /export async function restoreServiceRequest/, "Service repository exports restoreServiceRequest");
  assert.match(serviceRepoSource, /export async function deleteServiceRequest/, "Service repository exports deleteServiceRequest");
  assert.match(serviceRepoSource, /archived_at\?: string \| null/, "ServiceRequest interface has archived_at");
  assert.match(serviceRepoSource, /deleted_at\?: string \| null/, "ServiceRequest interface has deleted_at");

  // 3. Verify Admin Inquiries Page (Active/Archived tabs, Two-step delete modal)
  const adminInquiriesSource = await readFile(
    path.join(projectRoot, "src/pages/admin/AdminInquiriesPage.tsx"),
    "utf8"
  );
  assert.match(adminInquiriesSource, /Active Requests/, "AdminInquiriesPage provides Active Requests tab");
  assert.match(adminInquiriesSource, /Archived Requests/, "AdminInquiriesPage provides Archived Requests tab");
  assert.match(adminInquiriesSource, /handleArchive/, "AdminInquiriesPage supports archive action");
  assert.match(adminInquiriesSource, /handleRestore/, "AdminInquiriesPage supports restore action");
  assert.match(adminInquiriesSource, /handleConfirmDelete/, "AdminInquiriesPage supports confirmed deletion");
  assert.match(adminInquiriesSource, /Permanently Delete Request/, "AdminInquiriesPage provides permanent delete dialog");
  assert.match(adminInquiriesSource, /Type DELETE here/i, "AdminInquiriesPage requires typing DELETE for confirmation");

  // 4. Verify Admin Notification Audio & Bell
  const audioSource = await readFile(
    path.join(projectRoot, "src/admin/adminNotificationAudio.ts"),
    "utf8"
  );
  assert.match(audioSource, /SOUND_OPTIONS/, "adminNotificationAudio defines sound options");
  assert.match(audioSource, /loud-chime/, "adminNotificationAudio provides loud chime");
  assert.match(audioSource, /urgent-pulse/, "adminNotificationAudio provides urgent pulse");
  assert.match(audioSource, /store-chime/, "adminNotificationAudio provides store chime");
  assert.match(audioSource, /triggerAlertSound/, "adminNotificationAudio provides triggerAlertSound");
  assert.match(audioSource, /stopAlertSound/, "adminNotificationAudio provides stopAlertSound");

  const bellSource = await readFile(
    path.join(projectRoot, "src/admin/AdminNotificationBell.tsx"),
    "utf8"
  );
  assert.match(bellSource, /AdminNotificationBell/, "AdminNotificationBell component exported");
  assert.match(bellSource, /orderToNotification/, "AdminNotificationBell handles incoming orders");
  assert.match(bellSource, /serviceToNotification/, "AdminNotificationBell handles incoming service requests");
  assert.match(bellSource, /Enable Sound/, "AdminNotificationBell provides audio unlock for autoplay");

  // 5. Verify Admin Settings Page (Sound, Volume, Repeating alert, Desktop permission)
  const settingsSource = await readFile(
    path.join(projectRoot, "src/pages/admin/AdminSettingsPage.tsx"),
    "utf8"
  );
  assert.match(settingsSource, /Notification Alerts &(amp;)? Sound/i, "AdminSettingsPage provides Notification Alerts & Sound tab");
  assert.match(settingsSource, /Select Alert Sound/, "AdminSettingsPage allows sound selection");
  assert.match(settingsSource, /Alert Volume/, "AdminSettingsPage provides volume slider");
  assert.match(settingsSource, /Repeat Alerts Until Acknowledged/, "AdminSettingsPage provides repeating alert toggle");
  assert.match(settingsSource, /Background &(amp;)? Mobile Alerts/i, "AdminSettingsPage provides background alerts section");

  console.log("Archive, Delete and Loud Notification tests passed successfully!");
}
