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

const orderFromResponse = (row: OrderRpcResponse | OrderRow): StoredOrderRequest => {
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
    adminNote: "",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
};

export const isOrderDatabaseConfigured = () => Boolean(supabase);

export const submitOrderToSupabase = async (input: OrderSubmissionInput) => {
  const client = getSupabaseOrThrow();
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
    items_payload: input.items.map((item) => ({
      product_id: item.productId,
      product_slug: item.productSlug,
      selected_storage: item.selectedStorage,
      selected_colour: item.selectedColour,
      quantity: item.quantity,
    })),
    submission_token: input.submissionToken,
  });
  if (error) throw new Error(error.message || "Order request could not be saved.");
  return orderFromResponse(data as OrderRpcResponse);
};

export const fetchAdminOrders = async () => {
  const client = getSupabaseOrThrow();
  const { data, error } = await client.from("orders").select(orderSelect).order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((row) => orderFromResponse(row as OrderRow));
};

export const fetchAdminOrderNotifications = async (): Promise<AdminOrderNotificationRecord[]> => {
  await assertAdminAal2();
  const client = getSupabaseOrThrow();
  const { data, error } = await client
    .from("orders")
    .select("id, reference_number, customer_name, created_at")
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
  const client = getSupabaseOrThrow();
  const { data, error } = await client.from("orders").select(orderSelect).eq("id", orderId).single();
  if (error) throw error;
  return orderFromResponse(data as OrderRow);
};

export const updateAdminOrderStatus = async (orderId: string, status: StoredOrderRequest["status"]) => {
  await assertAdminAal2();
  const client = getSupabaseOrThrow();
  const { data, error } = await client
    .from("orders")
    .update({ order_status: status })
    .eq("id", orderId)
    .select(orderSelect)
    .single();
  if (error) throw error;
  return orderFromResponse(data as OrderRow);
};
