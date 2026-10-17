import { getSupabaseOrThrow, supabase } from "../lib/supabase";
import { assertAdminAal2 } from "../admin/adminAuthorization";
import type { OrderCustomerDetails, OrderRequestItem, OrderSubmissionInput, StoredOrderRequest } from "../types/order";

interface OrderRpcItem {
  product_id: string;
  product_slug: string;
  product_name: string;
  product_image: string;
  selected_storage: string;
  selected_colour: string;
  selected_condition: string;
  battery_health: string | null;
  warranty: string | null;
  quantity: number;
  unit_price: number;
  line_total: number;
}

interface OrderRpcResponse {
  id: string;
  reference_number: string;
  customer_name: string;
  customer_email: string | null;
  customer_phone: string;
  customer_whatsapp: string;
  delivery_method: "pickup" | "delivery";
  delivery_address: string | null;
  region: string | null;
  city: string | null;
  landmark: string | null;
  customer_notes: string | null;
  subtotal: number;
  delivery_fee: number | null;
  total_amount: number;
  payment_method: string;
  payment_status: StoredOrderRequest["paymentStatus"];
  order_status: StoredOrderRequest["status"];
  admin_note?: string | null;
  created_at: string;
  updated_at: string;
  items: OrderRpcItem[];
}

interface OrderRow {
  id: string;
  reference_number: string;
  customer_name: string;
  customer_email: string | null;
  customer_phone: string;
  customer_whatsapp: string;
  delivery_method: "pickup" | "delivery";
  delivery_address: string | null;
  region: string | null;
  city: string | null;
  landmark: string | null;
  customer_notes: string | null;
  subtotal: number;
  delivery_fee: number | null;
  total_amount: number;
  payment_method: string;
  payment_status: StoredOrderRequest["paymentStatus"];
  order_status: StoredOrderRequest["status"];
  admin_note?: string | null;
  archived_at?: string | null;
  archived_by?: string | null;
  deleted_at?: string | null;
  deleted_by?: string | null;
  created_at: string;
  updated_at: string;
  order_items?: OrderRpcItem[];
}

export interface AdminOrderNotificationRecord {
  id: string;
  referenceNumber: string;
  customerName: string;
  createdAt: string;
}

interface AdminOrderNotificationRow {
  id: string;
  reference_number: string;
  customer_name: string;
  created_at: string;
}

const orderSelect = `
  id,
  reference_number,
  customer_name,
  customer_email,
  customer_phone,
  customer_whatsapp,
  delivery_method,
  delivery_address,
  region,
  city,
  landmark,
  customer_notes,
  subtotal,
  delivery_fee,
  total_amount,
  payment_method,
  payment_status,
  order_status,
  admin_note,
  archived_at,
  archived_by,
  deleted_at,
  deleted_by,
  created_at,
  updated_at,
  order_items (
    product_id,
    product_slug,
    product_name,
    product_image,
    selected_storage,
    selected_colour,
    selected_condition,
    battery_health,
    warranty,
    quantity,
    unit_price,
    line_total
  )
`;

const customerFromResponse = (row: OrderRpcResponse | OrderRow): OrderCustomerDetails => ({
  fullName: row.customer_name,
  phone: row.customer_phone,
  whatsapp: row.customer_whatsapp,
  email: row.customer_email ?? undefined,
  fulfilmentType: row.delivery_method,
  region: row.region ?? undefined,
  city: row.city ?? undefined,
  deliveryAddress: row.delivery_address ?? undefined,
  landmark: row.landmark ?? undefined,
  additionalNote: row.customer_notes ?? undefined,
  preferredPaymentMethod: row.payment_method as OrderCustomerDetails["preferredPaymentMethod"],
});

const itemFromResponse = (item: OrderRpcItem): OrderRequestItem => ({
  productId: item.product_id,
  productSlug: item.product_slug,
  productName: item.product_name,
  productImage: item.product_image,
  storage: item.selected_storage,
  colour: item.selected_colour,
  condition: item.selected_condition,
  batteryHealth: item.battery_health ?? undefined,
  warranty: item.warranty ?? undefined,
  quantity: item.quantity,
  unitPrice: Number(item.unit_price),
  lineTotal: Number(item.line_total),
});

export const orderFromResponse = (row: OrderRpcResponse | OrderRow): StoredOrderRequest => {
  const items = "items" in row ? row.items : row.order_items ?? [];
  return {
    id: row.id,
    referenceNumber: row.reference_number,
    customer: customerFromResponse(row),
    items: items.map(itemFromResponse),
    subtotal: Number(row.subtotal),
    deliveryFee: row.delivery_fee === null ? null : Number(row.delivery_fee),
    total: Number(row.total_amount),
    paymentStatus: row.payment_status,
    status: row.order_status,
    adminNote: (row.admin_note ?? "").trim(),
    archivedAt: "archived_at" in row ? (row.archived_at ?? null) : null,
    archivedBy: "archived_by" in row ? (row.archived_by ?? null) : null,
    deletedAt: "deleted_at" in row ? (row.deleted_at ?? null) : null,
    deletedBy: "deleted_by" in row ? (row.deleted_by ?? null) : null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
};

export const isOrderDatabaseConfigured = () => Boolean(supabase);

export const submitOrderToSupabase = async (input: OrderSubmissionInput) => {
  const client = getSupabaseOrThrow();

  // Authoritative item resolution: ensure product_id matches active database product
  const resolvedItems = await Promise.all(
    input.items.map(async (item) => {
      let resolvedProductId = item.productId;
      let resolvedVariantId = item.variantId ?? null;

      try {
        // 1. Verify if product_id exists directly
        const { data: exactProduct } = await client
          .from("products")
          .select("id, slug")
          .eq("id", resolvedProductId)
          .maybeSingle();

        if (!exactProduct && item.productSlug) {
          // Resolve by slug if id was synthetic/fallback
          const { data: slugProduct } = await client
            .from("products")
            .select("id, slug")
            .eq("slug", item.productSlug)
            .maybeSingle();
          if (slugProduct?.id) {
            resolvedProductId = slugProduct.id;
          }
        }

        // 2. Verify variant_id in product_variants table
        if (resolvedVariantId) {
          const { data: exactVariant } = await client
            .from("product_variants")
            .select("id")
            .eq("id", resolvedVariantId)
            .eq("product_id", resolvedProductId)
            .maybeSingle();

          if (!exactVariant) {
            // Check if matching storage variant exists in product_variants
            if (item.selectedStorage) {
              const { data: storageVariant } = await client
                .from("product_variants")
                .select("id")
                .eq("product_id", resolvedProductId)
                .eq("storage", item.selectedStorage)
                .eq("available", true)
                .order("position", { ascending: true })
                .limit(1)
                .maybeSingle();

              resolvedVariantId = storageVariant?.id ?? null;
            } else {
              resolvedVariantId = null;
            }
          }
        }
      } catch {
        // Non-blocking fallback
      }

      return {
        product_id: resolvedProductId,
        product_slug: item.productSlug,
        selected_storage: item.selectedStorage,
        selected_colour: item.selectedColour,
        quantity: item.quantity,
        variant_id: resolvedVariantId,
      };
    })
  );

  const { data, error } = await client.rpc("create_order_request", {
    customer_payload: {
      full_name: input.customer.fullName,
      phone: input.customer.phone,
      whatsapp: input.customer.whatsapp,
      email: input.customer.email ?? null,
      fulfilment_type: input.customer.fulfilmentType,
      region: input.customer.region ?? null,
      city: input.customer.city ?? null,
      delivery_address: input.customer.deliveryAddress ?? null,
      landmark: input.customer.landmark ?? null,
      delivery_notes: input.customer.deliveryNotes ?? null,
      additional_note: input.customer.additionalNote ?? null,
      payment_method: input.customer.preferredPaymentMethod,
    },
    items_payload: resolvedItems,
    submission_token: input.submissionToken,
  });
  if (error) throw new Error(error.message || "Order request could not be saved.");
  return orderFromResponse(data as OrderRpcResponse);
};

export const fetchAdminOrders = async () => {
  await assertAdminAal2();
  const client = getSupabaseOrThrow();
  const { data, error } = await client
    .from("orders")
    .select(orderSelect)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((row) => orderFromResponse(row as OrderRow));
};

export const fetchAdminOrderNotifications = async (): Promise<AdminOrderNotificationRecord[]> => {
  await assertAdminAal2();
  const client = getSupabaseOrThrow();
  const { data, error } = await client
    .from("orders")
    .select("id, reference_number, customer_name, created_at")
    .is("deleted_at", null)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((row) => {
    const order = row as AdminOrderNotificationRow;
    return {
      id: order.id,
      referenceNumber: order.reference_number,
      customerName: order.customer_name,
      createdAt: order.created_at,
    };
  });
};

export const subscribeToNewAdminOrders = (
  onOrder: (order: AdminOrderNotificationRecord) => void,
  onStatus: (status: "connected" | "disconnected") => void,
) => {
  const client = getSupabaseOrThrow();
  const channel = client
    .channel(`admin-order-notifications-${Date.now()}`)
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "orders" },
      (payload) => {
        const row = payload.new as Partial<AdminOrderNotificationRow>;
        if (
          typeof row.id !== "string" ||
          typeof row.reference_number !== "string" ||
          typeof row.customer_name !== "string" ||
          typeof row.created_at !== "string"
        ) return;
        onOrder({
          id: row.id,
          referenceNumber: row.reference_number,
          customerName: row.customer_name,
          createdAt: row.created_at,
        });
      },
    )
    .subscribe((status) => {
      onStatus(status === "SUBSCRIBED" ? "connected" : "disconnected");
    });

  return () => {
    void client.removeChannel(channel);
  };
};

export const fetchAdminOrderById = async (orderId: string) => {
  await assertAdminAal2();
  const client = getSupabaseOrThrow();
  const { data, error } = await client
    .from("orders")
    .select(orderSelect)
    .eq("id", orderId)
    .single();
  if (error) throw error;
  return orderFromResponse(data as OrderRow);
};

export const updateAdminOrderStatus = async (orderId: string, status: StoredOrderRequest["status"]) => {
  return updateAdminOrder(orderId, { status });
};

export const updateAdminOrder = async (
  orderId: string,
  fields: {
    status?: StoredOrderRequest["status"];
    paymentStatus?: StoredOrderRequest["paymentStatus"];
    adminNote?: string;
  }
) => {
  await assertAdminAal2();
  const client = getSupabaseOrThrow();
  const payload: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };
  if (fields.status !== undefined) payload.order_status = fields.status;
  if (fields.paymentStatus !== undefined) payload.payment_status = fields.paymentStatus;
  if (fields.adminNote !== undefined) payload.admin_note = fields.adminNote;

  const { data, error } = await client
    .from("orders")
    .update(payload)
    .eq("id", orderId)
    .select(orderSelect)
    .single();
  if (error) throw error;
  return orderFromResponse(data as OrderRow);
};

async function logOrderAction(
  orderId: string,
  referenceNumber: string,
  action: "archive" | "restore" | "soft_delete" | "hard_delete",
  reason?: string,
  metadata?: Record<string, unknown>
) {
  try {
    const client = getSupabaseOrThrow();
    const { data: userData } = await client.auth.getUser();
    const actorId = userData?.user?.id ?? "admin";
    const actorEmail = userData?.user?.email ?? null;

    await client.from("order_action_logs").insert({
      order_id: orderId,
      reference_number: referenceNumber,
      action,
      actor_id: actorId,
      actor_email: actorEmail,
      reason: reason ?? null,
      metadata: metadata ?? {},
    });
  } catch (err) {
    console.warn("Failed to log order action to order_action_logs:", err);
  }
}

export const archiveAdminOrder = async (orderId: string, referenceNumber?: string) => {
  await assertAdminAal2();
  const client = getSupabaseOrThrow();
  const { data: userData } = await client.auth.getUser();
  const actorId = userData?.user?.id ?? "admin";
  const now = new Date().toISOString();

  const { data, error } = await client
    .from("orders")
    .update({ archived_at: now, archived_by: actorId, updated_at: now })
    .eq("id", orderId)
    .select(orderSelect)
    .single();
  if (error) throw error;

  const order = orderFromResponse(data as OrderRow);
  await logOrderAction(orderId, referenceNumber || order.referenceNumber, "archive");
  return order;
};

export const restoreAdminOrder = async (orderId: string, referenceNumber?: string) => {
  await assertAdminAal2();
  const client = getSupabaseOrThrow();
  const now = new Date().toISOString();

  const { data, error } = await client
    .from("orders")
    .update({ archived_at: null, archived_by: null, updated_at: now })
    .eq("id", orderId)
    .select(orderSelect)
    .single();
  if (error) throw error;

  const order = orderFromResponse(data as OrderRow);
  await logOrderAction(orderId, referenceNumber || order.referenceNumber, "restore");
  return order;
};

export const archiveAdminOrdersBulk = async (orders: { id: string; referenceNumber: string }[]) => {
  if (orders.length === 0) return;
  await assertAdminAal2();
  const client = getSupabaseOrThrow();
  const { data: userData } = await client.auth.getUser();
  const actorId = userData?.user?.id ?? "admin";
  const now = new Date().toISOString();
  const ids = orders.map((o) => o.id);

  const { error } = await client
    .from("orders")
    .update({ archived_at: now, archived_by: actorId, updated_at: now })
    .in("id", ids);
  if (error) throw error;

  for (const o of orders) {
    await logOrderAction(o.id, o.referenceNumber, "archive", "Bulk archive");
  }
};

export const restoreAdminOrdersBulk = async (orders: { id: string; referenceNumber: string }[]) => {
  if (orders.length === 0) return;
  await assertAdminAal2();
  const client = getSupabaseOrThrow();
  const now = new Date().toISOString();
  const ids = orders.map((o) => o.id);

  const { error } = await client
    .from("orders")
    .update({ archived_at: null, archived_by: null, updated_at: now })
    .in("id", ids);
  if (error) throw error;

  for (const o of orders) {
    await logOrderAction(o.id, o.referenceNumber, "restore", "Bulk restore");
  }
};

export const clearCompletedOrders = async (completedOrders: { id: string; referenceNumber: string }[]) => {
  if (completedOrders.length === 0) return 0;
  await assertAdminAal2();
  const client = getSupabaseOrThrow();
  const { data: userData } = await client.auth.getUser();
  const actorId = userData?.user?.id ?? "admin";
  const now = new Date().toISOString();
  const ids = completedOrders.map((o) => o.id);

  const { error } = await client
    .from("orders")
    .update({ archived_at: now, archived_by: actorId, updated_at: now })
    .in("id", ids);
  if (error) throw error;

  for (const o of completedOrders) {
    await logOrderAction(o.id, o.referenceNumber, "archive", "Clear completed orders action");
  }
  return completedOrders.length;
};

export const deleteAdminOrder = async (
  order: { id: string; referenceNumber: string; total?: number; customerName?: string },
  options: { hard?: boolean; reason?: string } = {}
) => {
  await assertAdminAal2();
  const client = getSupabaseOrThrow();
  const { data: userData } = await client.auth.getUser();
  const actorId = userData?.user?.id ?? "admin";
  const now = new Date().toISOString();

  if (options.hard) {
    await logOrderAction(order.id, order.referenceNumber, "hard_delete", options.reason, {
      total: order.total,
      customerName: order.customerName,
      hard: true,
    });

    const { error: itemsError } = await client.from("order_items").delete().eq("order_id", order.id);
    if (itemsError) throw itemsError;

    const { error: orderError } = await client.from("orders").delete().eq("id", order.id);
    if (orderError) throw orderError;
  } else {
    const { error } = await client
      .from("orders")
      .update({ deleted_at: now, deleted_by: actorId, updated_at: now })
      .eq("id", order.id);
    if (error) throw error;

    await logOrderAction(order.id, order.referenceNumber, "soft_delete", options.reason, {
      total: order.total,
      customerName: order.customerName,
    });
  }
};

export const deleteAdminOrdersBulk = async (
  orders: { id: string; referenceNumber: string; total?: number; customerName?: string }[],
  options: { hard?: boolean; reason?: string } = {}
) => {
  if (orders.length === 0) return;
  await assertAdminAal2();
  const client = getSupabaseOrThrow();
  const { data: userData } = await client.auth.getUser();
  const actorId = userData?.user?.id ?? "admin";
  const now = new Date().toISOString();
  const ids = orders.map((o) => o.id);

  if (options.hard) {
    for (const o of orders) {
      await logOrderAction(o.id, o.referenceNumber, "hard_delete", options.reason, {
        total: o.total,
        customerName: o.customerName,
        bulk: true,
      });
    }

    const { error: itemsError } = await client.from("order_items").delete().in("order_id", ids);
    if (itemsError) throw itemsError;

    const { error: ordersError } = await client.from("orders").delete().in("id", ids);
    if (ordersError) throw ordersError;
  } else {
    const { error } = await client
      .from("orders")
      .update({ deleted_at: now, deleted_by: actorId, updated_at: now })
      .in("id", ids);
    if (error) throw error;

    for (const o of orders) {
      await logOrderAction(o.id, o.referenceNumber, "soft_delete", options.reason, {
        total: o.total,
        customerName: o.customerName,
        bulk: true,
      });
    }
  }
};
