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
  legacy_table?: "trade_in_requests" | "device_requests";
}

const client = () => {
  if (!supabase) throw new Error("Request submission is unavailable. Please try again later.");
  return supabase;
};

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
  let data: any[] | null = null;
  const directSelect = await client().from("service_requests")
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
    client().from("trade_in_requests").select("id,customer_name,phone,whatsapp,email,device_type,brand,model,storage,condition,desired_action,replacement_device,known_issues,battery_health,message,admin_notes,status,source,created_at"),
    client().from("device_requests").select("id,customer_name,phone,whatsapp,email,brand,model,storage,color,budget,message,admin_notes,status,source,created_at"),
  ]);
  const missingTable = (code?: string) => code === "PGRST205" || code === "42P01";
  if (trade.error && !missingTable(trade.error.code)) throw trade.error;
  if (devices.error && !missingTable(devices.error.code)) throw devices.error;
  const oldTrade = (trade.data ?? []).map((row) => ({
    id: row.id, reference: `TRADE-${row.id.slice(0, 8).toUpperCase()}`,
    service_type: "trade-in" as const, customer_name: row.customer_name, phone: row.phone,
    details: compact({ whatsapp: row.whatsapp, email: row.email, deviceType: row.device_type, brand: row.brand,
      model: row.model, storage: row.storage, condition: row.condition, desiredAction: row.desired_action,
      replacementDevice: row.replacement_device, knownIssues: row.known_issues, batteryHealth: row.battery_health, message: row.message }),
    status: oldStatus(row.status), admin_notes: row.admin_notes ?? "", source: row.source,
    created_at: row.created_at, legacy_table: "trade_in_requests" as const,
  }));
  const oldDevices = (devices.data ?? []).map((row) => ({
    id: row.id, reference: `DEVICE-${row.id.slice(0, 8).toUpperCase()}`,
    service_type: "pre-order" as const, customer_name: row.customer_name, phone: row.phone,
    details: compact({ whatsapp: row.whatsapp, email: row.email, brand: row.brand, model: row.model,
      storage: row.storage, color: row.color, budget: row.budget, message: row.message }),
    status: oldStatus(row.status), admin_notes: row.admin_notes ?? "", source: row.source,
    created_at: row.created_at, legacy_table: "device_requests" as const,
  }));
  return [...(data ?? []) as ServiceRequest[], ...oldTrade, ...oldDevices];
}

const compact = (values: Record<string, string | null>) => Object.fromEntries(
  Object.entries(values).filter((entry): entry is [string, string] => typeof entry[1] === "string" && Boolean(entry[1]))
);
const oldStatus = (status: string): ServiceStatus => status === "Under Review" || status === "Appraised"
  ? "In Review" : status === "Archived" ? "Closed" : status === "Fulfilled" || status === "Sourced"
    ? "Completed" : statuses.has(status as ServiceStatus) ? status as ServiceStatus : "New";
const statuses = new Set<ServiceStatus>(["New", "In Review", "Contacted", "Completed", "Closed"]);

export async function updateServiceRequest(
  request: ServiceRequest,
  changes: Partial<Pick<ServiceRequest, "status" | "admin_notes">>,
): Promise<ServiceRequest> {
  await assertAdminAal2();
  if (request.legacy_table) {
    const status = changes.status === "In Review" ? "Under Review" : changes.status === "Closed" ? "Archived"
      : changes.status === "Completed" && request.legacy_table === "device_requests" ? "Fulfilled" : changes.status;
    const { data, error } = await client().from(request.legacy_table)
      .update({ ...(status ? { status } : {}), ...(changes.admin_notes !== undefined ? { admin_notes: changes.admin_notes } : {}), updated_at: new Date().toISOString() })
      .eq("id", request.id).select("id").single();
    if (error || !data) throw error ?? new Error("Request update could not be verified.");
    return { ...request, ...changes };
  }
  const { data, error } = await client().from("service_requests")
    .update({ ...changes, updated_at: new Date().toISOString() })
    .eq("id", request.id)
    .select("id,reference,service_type,customer_name,phone,details,status,admin_notes,source,created_at")
    .single();
  if (error || !data) {
    const rpcRes = await client().rpc("admin_update_service_request", {
      p_id: request.id,
      p_status: changes.status ?? null,
      p_admin_notes: changes.admin_notes ?? null,
    });
    if (rpcRes.error || !rpcRes.data || rpcRes.data.length === 0) {
      throw error ?? rpcRes.error ?? new Error("Request update could not be verified.");
    }
    const updated = rpcRes.data[0];
    return {
      id: updated.id,
      reference: updated.reference,
      service_type: updated.service_type as ServiceType,
      customer_name: updated.customer_name,
      phone: updated.phone,
      details: updated.details,
      status: updated.status as ServiceStatus,
      admin_notes: updated.admin_notes ?? "",
      source: updated.source,
      created_at: updated.created_at,
    };
  }
  return data as ServiceRequest;
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
  const { data, error } = await client().from("service_requests")
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
