import type { CartItem } from "./product";

export const ORDER_STATUSES = [
  "New",
  "Awaiting Confirmation",
  "Confirmed",
  "Awaiting Payment",
  "Paid",
  "Ready for Pickup",
  "Dispatched",
  "Completed",
  "Cancelled",
  "Archived",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];
export type FulfilmentType = "pickup" | "delivery";

export interface OrderCustomerDetails {
  fullName: string;
  phone: string;
  email?: string;
  fulfilmentType: FulfilmentType;
  deliveryLocation?: string;
  preferredPaymentMethod: string;
  additionalNote?: string;
}

export interface OrderRequestItem {
  productId: string;
  productSlug: string;
  productName: string;
  productImage: string;
  storage: string;
  colour: string;
  condition: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface OrderRequestPayload {
  referenceNumber: string;
  customer: OrderCustomerDetails;
  items: OrderRequestItem[];
  subtotal: number;
  total: number;
  status: OrderStatus;
  adminNote: string;
  createdAt: string;
}

export interface StoredOrderRequest extends OrderRequestPayload {
  id: string;
}

export const cartItemsToOrderItems = (items: CartItem[]): OrderRequestItem[] =>
  items.map((item) => ({
    productId: item.product.id,
    productSlug: item.product.slug,
    productName: item.product.name,
    productImage: item.product.images[0]?.src ?? "",
    storage: item.storage,
    colour: item.color,
    condition: item.product.condition,
    quantity: item.quantity,
    unitPrice: item.product.price,
    lineTotal: item.product.price * item.quantity,
  }));
