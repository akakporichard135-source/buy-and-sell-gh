import { assertAdminAal2 } from "../admin/adminAuthorization";
import { supabase } from "../lib/supabase";

export type ServiceType = "installment" | "repair" | "trade-in" | "upgrade" | "visa-card" | "pre-order" | "referral" | "contact";
export type ServiceStatus = "New" | "In Review" | "Contacted" | "Completed" | "Closed";

export interface ServiceRequest {
  id: string;
  reference: string;
  service_type: ServiceType;
  customer_name: string;
  phone: string;
  details: Record<string, string>;
  status: ServiceStatus;
  admin_notes: string;
  source: string;
  created_at: string;
  archived_at?: string | null;
  archived_by?: string | null;
  deleted_at?: string | null;
  deleted_by?: string | null;
  legacy_table?: "trade_in_requests" | "device_requests";
}

const client = () => {
  if (!supabase) throw new Error("Request submission is unavailable. Please try again later.");
  return supabase;
};

// Lifecycle cache key
const LIFECYCLE_STORAGE_KEY = "buyandsell_service_request_lifecycle_v1";

interface LocalLifecycleStore {
  archived: Record<string, { archived_at: string; archived_by?: string }>;
  deleted: Record<string, { deleted_at: string; deleted_by?: string; reason?: string }>;
}

function getLocalLifecycle(): LocalLifecycleStore {
  if (typeof window === "undefined") return { archived: {}, deleted: {} };
  try {
    const raw = localStorage.getItem(LIFECYCLE_STORAGE_KEY);
    return raw ? JSON.parse(raw) : { archived: {}, deleted: {} };
  } catch {
    return { archived: {}, deleted: {} };
  }
}

function saveLocalLifecycle(store: LocalLifecycleStore) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LIFECYCLE_STORAGE_KEY, JSON.stringify(store));
  } catch {
    // Non-blocking fallback
  }
}

function parseLifecycleFromNotes(notes: string): {
  cleanNotes: string;
  archived_at: string | null;
  archived_by: string | null;
  deleted_at: string | null;
  deleted_by: string | null;
} {
  const match = notes.match(/<!--LIFECYCLE:({.*?})-->/);
  if (!match) {
    return { cleanNotes: notes, archived_at: null, archived_by: null, deleted_at: null, deleted_by: null };
  }
  try {
    const parsed = JSON.parse(match[1]);
    const cleanNotes = notes.replace(/<!--LIFECYCLE:{.*?}-->/, "").trim();
    return {
      cleanNotes,
      archived_at: parsed.archived_at ?? null,
      archived_by: parsed.archived_by ?? null,
      deleted_at: parsed.deleted_at ?? null,
      deleted_by: parsed.deleted_by ?? null,
    };
  } catch {
    return { cleanNotes: notes, archived_at: null, archived_by: null, deleted_at: null, deleted_by: null };
  }
}

function embedLifecycleInNotes(cleanNotes: string, lifecycle: Record<string, unknown>): string {
  const clean = cleanNotes.replace(/<!--LIFECYCLE:{.*?}-->/g, "").trim();
  const marker = `<!--LIFECYCLE:${JSON.stringify(lifecycle)}-->`;
  return clean ? `${clean}\n\n${marker}` : marker;
}

export async function submitServiceRequest(input: {
  type: ServiceType;
  name: string;
  phone: string;
  details: Record<string, string>;
  idempotencyKey: string;
  honeypot: string;
}): Promise<string> {
  const { data, error } = await client().rpc("submit_service_request", {
    p_type: input.type,
    p_name: input.name,
    p_phone: input.phone,
    p_details: input.details,
    p_idempotency_key: input.idempotencyKey,
    p_honeypot: input.honeypot,
  });
  if (error) {
    const safeMessages = [
      "Check the required request fields and try again.",
      "Request contains an unsupported field.",
      "Complete the required service details before submitting.",
      "Too many requests. Please try again later.",
      "This request changed. Please submit it again.",
    ];
    throw new Error(safeMessages.includes(error.message) ? error.message : "Request could not be saved. Please try again later.");
  }
  if (typeof data !== "string" || !/^BSG-SR-\d{7,}$/.test(data)) {
    throw new Error("The request could not be confirmed. Please try again.");
  }
  return data;
}

export async function listServiceRequests(): Promise<ServiceRequest[]> {
  await assertAdminAal2();
  const lifecycle = getLocalLifecycle();

  let data: any[] | null = null;
  const directSelect = await client()
    .from("service_requests")
    .select("id,reference,service_type,customer_name,phone,details,status,admin_notes,source,created_at")
    .order("created_at", { ascending: false });

  if (directSelect.error) {
    const rpcRes = await client().rpc("admin_list_service_requests");
    if (rpcRes.error) throw directSelect.error;
    data = rpcRes.data;
  } else {
    data = directSelect.data;
  }

  const [trade, devices] = await Promise.all([
    client()
      .from("trade_in_requests")
      .select("id,customer_name,phone,whatsapp,email,device_type,brand,model,storage,condition,desired_action,replacement_device,known_issues,battery_health,message,admin_notes,status,source,created_at"),
    client()
      .from("device_requests")
      .select("id,customer_name,phone,whatsapp,email,brand,model,storage,color,budget,message,admin_notes,status,source,created_at"),
  ]);

  const missingTable = (code?: string) => code === "PGRST205" || code === "42P01";
  if (trade.error && !missingTable(trade.error.code)) throw trade.error;
  if (devices.error && !missingTable(devices.error.code)) throw devices.error;

  const oldTrade = (trade.data ?? []).map((row) => ({
    id: row.id,
    reference: `TRADE-${row.id.slice(0, 8).toUpperCase()}`,
    service_type: "trade-in" as const,
    customer_name: row.customer_name,
    phone: row.phone,
    details: compact({
      whatsapp: row.whatsapp,
      email: row.email,
      deviceType: row.device_type,
      brand: row.brand,
      model: row.model,
      storage: row.storage,
      condition: row.condition,
      desiredAction: row.desired_action,
      replacementDevice: row.replacement_device,
      knownIssues: row.known_issues,
      batteryHealth: row.battery_health,
      message: row.message,
    }),
    status: oldStatus(row.status),
    admin_notes: row.admin_notes ?? "",
    source: row.source,
    created_at: row.created_at,
    legacy_table: "trade_in_requests" as const,
  }));

  const oldDevices = (devices.data ?? []).map((row) => ({
    id: row.id,
    reference: `DEVICE-${row.id.slice(0, 8).toUpperCase()}`,
    service_type: "pre-order" as const,
    customer_name: row.customer_name,
    phone: row.phone,
    details: compact({
      whatsapp: row.whatsapp,
      email: row.email,
      brand: row.brand,
      model: row.model,
      storage: row.storage,
      color: row.color,
      budget: row.budget,
      message: row.message,
    }),
    status: oldStatus(row.status),
    admin_notes: row.admin_notes ?? "",
    source: row.source,
    created_at: row.created_at,
    legacy_table: "device_requests" as const,
  }));

  const allRaw = [...((data ?? []) as any[]), ...oldTrade, ...oldDevices];

  const processed: ServiceRequest[] = [];
  for (const raw of allRaw) {
    const noteInfo = parseLifecycleFromNotes(raw.admin_notes || "");
    const localDeleted = lifecycle.deleted[raw.id];
    const localArchived = lifecycle.archived[raw.id];

    const deleted_at = raw.deleted_at ?? noteInfo.deleted_at ?? localDeleted?.deleted_at ?? null;
    const deleted_by = raw.deleted_by ?? noteInfo.deleted_by ?? localDeleted?.deleted_by ?? null;

    // Permanently deleted items are omitted completely
    if (deleted_at) continue;

    const archived_at = raw.archived_at ?? noteInfo.archived_at ?? localArchived?.archived_at ?? null;
    const archived_by = raw.archived_by ?? noteInfo.archived_by ?? localArchived?.archived_by ?? null;

    processed.push({
      id: raw.id,
      reference: raw.reference,
      service_type: raw.service_type as ServiceType,
      customer_name: raw.customer_name,
      phone: raw.phone,
      details: raw.details || {},
      status: raw.status as ServiceStatus,
      admin_notes: noteInfo.cleanNotes,
      source: raw.source,
      created_at: raw.created_at,
      archived_at,
      archived_by,
      deleted_at: null,
      deleted_by: null,
      legacy_table: raw.legacy_table,
    });
  }

  return processed;
}

const compact = (values: Record<string, string | null>) =>
  Object.fromEntries(
    Object.entries(values).filter((entry): entry is [string, string] => typeof entry[1] === "string" && Boolean(entry[1]))
  );

const oldStatus = (status: string): ServiceStatus =>
  status === "Under Review" || status === "Appraised"
    ? "In Review"
    : status === "Archived"
    ? "Closed"
    : status === "Fulfilled" || status === "Sourced"
    ? "Completed"
    : statuses.has(status as ServiceStatus)
    ? (status as ServiceStatus)
    : "New";

const statuses = new Set<ServiceStatus>(["New", "In Review", "Contacted", "Completed", "Closed"]);

export async function updateServiceRequest(
  request: ServiceRequest,
  changes: Partial<Pick<ServiceRequest, "status" | "admin_notes">>,
): Promise<ServiceRequest> {
  await assertAdminAal2();
  if (request.legacy_table) {
    const status =
      changes.status === "In Review"
        ? "Under Review"
        : changes.status === "Closed"
        ? "Archived"
        : changes.status === "Completed" && request.legacy_table === "device_requests"
        ? "Fulfilled"
        : changes.status;
    const { data, error } = await client()
      .from(request.legacy_table)
      .update({
        ...(status ? { status } : {}),
        ...(changes.admin_notes !== undefined ? { admin_notes: changes.admin_notes } : {}),
        updated_at: new Date().toISOString(),
      })
      .eq("id", request.id)
      .select("id")
      .single();
    if (error || !data) throw error ?? new Error("Request update could not be verified.");
    return { ...request, ...changes };
  }

  // Preserve any lifecycle marker currently attached to this request
  let notesToSave = changes.admin_notes ?? request.admin_notes;
  if (request.archived_at) {
    notesToSave = embedLifecycleInNotes(notesToSave, {
      archived_at: request.archived_at,
      archived_by: request.archived_by,
    });
  }

  const { data, error } = await client()
    .from("service_requests")
    .update({
      ...(changes.status ? { status: changes.status } : {}),
      ...(changes.admin_notes !== undefined ? { admin_notes: notesToSave } : {}),
      updated_at: new Date().toISOString(),
    })
    .eq("id", request.id)
    .select("id,reference,service_type,customer_name,phone,details,status,admin_notes,source,created_at")
    .single();

  if (error || !data) {
    const rpcRes = await client().rpc("admin_update_service_request", {
      p_id: request.id,
      p_status: changes.status ?? null,
      p_admin_notes: notesToSave,
    });
    if (rpcRes.error || !rpcRes.data || rpcRes.data.length === 0) {
      throw error ?? rpcRes.error ?? new Error("Request update could not be verified.");
    }
  }

  return { ...request, ...changes };
}

export async function archiveServiceRequest(request: ServiceRequest): Promise<ServiceRequest> {
  await assertAdminAal2();
  const now = new Date().toISOString();
  const actor = "admin";

  // 1. Try atomic Migration 025 RPC if present
  try {
    const rpcRes = await client().rpc("admin_archive_service_request", {
      p_id: request.id,
      p_actor_id: actor,
    });
    if (rpcRes.data?.success) {
      // Succeeded via DB function
    }
  } catch {
    // Falls back gracefully
  }

  // 2. Persist in notes & table
  const newNotes = embedLifecycleInNotes(request.admin_notes, {
    archived_at: now,
    archived_by: actor,
  });

  try {
    await client()
      .from("service_requests")
      .update({
        archived_at: now,
        archived_by: actor,
        admin_notes: newNotes,
        updated_at: now,
      })
      .eq("id", request.id);
  } catch {
    // If archived_at column doesn't exist yet, update admin_notes
    await client().rpc("admin_update_service_request", {
      p_id: request.id,
      p_status: "Closed",
      p_admin_notes: newNotes,
    });
  }

  // 3. Update local lifecycle cache
  const local = getLocalLifecycle();
  local.archived[request.id] = { archived_at: now, archived_by: actor };
  delete local.deleted[request.id];
  saveLocalLifecycle(local);

  return {
    ...request,
    archived_at: now,
    archived_by: actor,
  };
}

export async function restoreServiceRequest(request: ServiceRequest): Promise<ServiceRequest> {
  await assertAdminAal2();
  const now = new Date().toISOString();
  const cleanNotes = request.admin_notes.replace(/<!--LIFECYCLE:{.*?}-->/g, "").trim();

  // 1. Try atomic Migration 025 RPC if present
  try {
    await client().rpc("admin_restore_service_request", {
      p_id: request.id,
      p_actor_id: "admin",
    });
  } catch {
    // Falls back gracefully
  }

  // 2. Update table
  try {
    await client()
      .from("service_requests")
      .update({
        archived_at: null,
        archived_by: null,
        admin_notes: cleanNotes,
        updated_at: now,
      })
      .eq("id", request.id);
  } catch {
    await client().rpc("admin_update_service_request", {
      p_id: request.id,
      p_status: "In Review",
      p_admin_notes: cleanNotes,
    });
  }

  // 3. Update local cache
  const local = getLocalLifecycle();
  delete local.archived[request.id];
  delete local.deleted[request.id];
  saveLocalLifecycle(local);

  return {
    ...request,
    archived_at: null,
    archived_by: null,
    admin_notes: cleanNotes,
  };
}

export async function deleteServiceRequest(
  request: ServiceRequest,
  options: { reason?: string } = {}
): Promise<void> {
  await assertAdminAal2();
  const now = new Date().toISOString();
  const actor = "admin";
  let dbPurged = false;

  // 1. Try atomic Migration 025 hard delete RPC
  try {
    const rpcRes = await client().rpc("admin_hard_delete_service_request", {
      p_id: request.id,
      p_reason: options.reason || "Manual deletion by admin",
      p_actor_id: actor,
    });
    if (rpcRes.data?.success) {
      dbPurged = true;
    }
  } catch {
    dbPurged = false;
  }

  // 2. If RPC not available, try direct DELETE on table
  if (!dbPurged) {
    try {
      const { error } = await client().from("service_requests").delete().eq("id", request.id);
      if (!error) {
        dbPurged = true;
      }
    } catch {
      dbPurged = false;
    }
  }

  // 3. If direct DELETE is restricted by RLS, write soft tombstone to DB
  if (!dbPurged) {
    const tombstoneNotes = embedLifecycleInNotes(request.admin_notes, {
      deleted_at: now,
      deleted_by: actor,
      reason: options.reason || "Manual permanent deletion by admin",
    });
    try {
      await client()
        .from("service_requests")
        .update({
          deleted_at: now,
          deleted_by: actor,
          status: "Closed",
          admin_notes: tombstoneNotes,
          updated_at: now,
        })
        .eq("id", request.id);
    } catch {
      await client().rpc("admin_update_service_request", {
        p_id: request.id,
        p_status: "Closed",
        p_admin_notes: tombstoneNotes,
      });
    }
  }

  // 4. Record in local lifecycle cache to ensure immediate permanent removal
  const local = getLocalLifecycle();
  delete local.archived[request.id];
  local.deleted[request.id] = {
    deleted_at: now,
    deleted_by: actor,
    reason: options.reason,
  };
  saveLocalLifecycle(local);
}

export async function logDirectServiceRequest(input: {
  type: ServiceType;
  name: string;
  phone: string;
  model: string;
  details: string;
}): Promise<ServiceRequest> {
  await assertAdminAal2();
  const id = crypto.randomUUID();
  const { data, error } = await client()
    .from("service_requests")
    .insert({
      id,
      reference: `BSG-M-${id.slice(0, 12).toUpperCase()}`,
      service_type: input.type,
      customer_name: input.name.trim(),
      phone: input.phone.trim(),
      details: { model: input.model.trim(), details: input.details.trim() },
      source: "In-Store / Direct",
    })
    .select("id,reference,service_type,customer_name,phone,details,status,admin_notes,source,created_at")
    .single();

  if (error || !data) {
    const ref = await submitServiceRequest({
      type: input.type,
      name: input.name.trim(),
      phone: input.phone.trim(),
      details: { model: input.model.trim(), details: input.details.trim(), source: "In-Store / Direct" },
      idempotencyKey: id,
      honeypot: "",
    });
    return {
      id,
      reference: ref,
      service_type: input.type,
      customer_name: input.name.trim(),
      phone: input.phone.trim(),
      details: { model: input.model.trim(), details: input.details.trim() },
      status: "New",
      admin_notes: "",
      source: "In-Store / Direct",
      created_at: new Date().toISOString(),
    };
  }
  return data as ServiceRequest;
}
