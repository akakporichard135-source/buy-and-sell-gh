import type { OrderCustomerDetails, OrderRequestPayload, StoredOrderRequest } from "../types/order";
import { cartItemsToOrderItems } from "../types/order";
import type { CartItem } from "../types/product";

export type OrderSubmissionResult =
  | { status: "saved"; order: StoredOrderRequest }
  | { status: "storage-inactive"; order: OrderRequestPayload };

export const generateOrderReference = (date = new Date()) => {
  const stamp = date.toISOString().slice(0, 10).replace(/-/g, "");
  const random = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `BSGH-${stamp}-${random}`;
};

export const buildOrderRequestPayload = (
  items: CartItem[],
  customer: OrderCustomerDetails,
  referenceNumber = generateOrderReference(),
): OrderRequestPayload => {
  const orderItems = cartItemsToOrderItems(items);
  const subtotal = orderItems.reduce((sum, item) => sum + item.lineTotal, 0);

  return {
    referenceNumber,
    customer,
    items: orderItems,
    subtotal,
    total: subtotal,
    status: "New",
    adminNote: "",
    createdAt: new Date().toISOString(),
  };
};

export const isOrderStorageActive = () => false;

export const submitOrderRequest = async (order: OrderRequestPayload): Promise<OrderSubmissionResult> => {
  if (!isOrderStorageActive()) {
    return { status: "storage-inactive", order };
  }

  // Future Supabase implementation should insert order_requests and order_request_items here.
  return { status: "storage-inactive", order };
};
