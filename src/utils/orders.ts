import { submitOrderToSupabase } from "../orders/supabaseOrderRepository";
import type { OrderCustomerDetails, OrderRequestPayload, OrderSubmissionInput, StoredOrderRequest } from "../types/order";
import { cartItemsToOrderItems } from "../types/order";
import type { CartItem } from "../types/product";

export type OrderSubmissionResult =
  | { status: "saved"; order: StoredOrderRequest }
  | { status: "failed"; message: string; order: OrderRequestPayload };

export const generateOrderReference = (date = new Date()) => {
  const stamp = date.toISOString().slice(2, 10).replace(/-/g, "");
  const random = Math.random().toString(16).slice(2, 6).toUpperCase();
  return `BSG-${stamp}-${random}`;
};

export const generateSubmissionToken = () => {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  return `submission-${Date.now()}-${Math.random().toString(36).slice(2)}`;
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
    deliveryFee: null,
    total: subtotal,
    paymentStatus: "Unpaid",
    status: "Pending",
    adminNote: "",
    createdAt: new Date().toISOString(),
  };
};

export const buildOrderSubmissionInput = (
  items: CartItem[],
  customer: OrderCustomerDetails,
  submissionToken: string,
): OrderSubmissionInput => ({
  submissionToken,
  customer,
  items: items.map((item) => ({
    productId: item.product.id,
    productSlug: item.product.slug,
    selectedStorage: item.storage,
    selectedColour: item.color,
    quantity: item.quantity,
  })),
});

export const submitOrderRequest = async (
  order: OrderRequestPayload,
  input: OrderSubmissionInput,
): Promise<OrderSubmissionResult> => {
  try {
    const saved = await submitOrderToSupabase(input);
    return { status: "saved", order: saved };
  } catch (failure) {
    return {
      status: "failed",
      order,
      message: failure instanceof Error ? failure.message : "Order request could not be saved. Please try again.",
    };
  }
};
