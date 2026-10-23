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
    variantId: item.variantId,
  })),
});

export const submitOrderRequest = async (
  order: OrderRequestPayload,
  input: OrderSubmissionInput,
): Promise<OrderSubmissionResult> => {
  try {
    const saved = await submitOrderToSupabase(input);
    const enrichedItems = saved.items.map((savedItem, index) => {
      const matchingPayloadItem =
        order.items.find(
          (candidate) =>
            (candidate.productId === savedItem.productId || candidate.productSlug === savedItem.productSlug) &&
            candidate.storage === savedItem.storage &&
            candidate.colour === savedItem.colour,
        ) ?? order.items[index];
      const quantity = savedItem.quantity || matchingPayloadItem?.quantity || 1;
      return {
        ...savedItem,
        productSlug: matchingPayloadItem?.productSlug || savedItem.productSlug,
        productName: matchingPayloadItem?.productName || savedItem.productName,
        productImage: matchingPayloadItem?.productImage || savedItem.productImage || "",
        condition: matchingPayloadItem?.condition || savedItem.condition,
        specifications: matchingPayloadItem?.specifications,
        unitPrice: savedItem.unitPrice,
        lineTotal: savedItem.unitPrice * quantity,
      };
    });
    const subtotal = enrichedItems.reduce((sum, item) => sum + item.lineTotal, 0);
    return {
      status: "saved",
      order: {
        ...saved,
        items: enrichedItems,
        subtotal,
        total: subtotal + (saved.deliveryFee ?? 0),
      },
    };
  } catch (failure) {
    return {
      status: "failed",
      order,
      message: orderSubmissionMessage(failure),
    };
  }
};

function orderSubmissionMessage(failure: unknown) {
  const message = failure instanceof Error ? failure.message.toLowerCase() : "";
  if (message.includes("stock") || message.includes("sold") || message.includes("available")) {
    return "One or more products are no longer available in the selected quantity. Review your cart or contact Buy & Sell GH.";
  }
  if (message.includes("storage") || message.includes("colour") || message.includes("color") || message.includes("variant")) {
    return "A selected product option is no longer available. Return to the product page and choose an available option.";
  }
  return "Your order request could not be submitted right now. Check your connection and try again. Your cart has not been cleared.";
}
