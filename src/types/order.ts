import type { CartItem } from "./product";
import { resolveProductImage } from "../utils/productImages";

export const ORDER_STATUSES = [
  "Pending",
  "Confirmed",
  "Processing",
  "Ready for Pickup",
  "Out for Delivery",
  "Delivered",
  "Cancelled",
] as const;

export const PAYMENT_STATUSES = ["Unpaid", "Pending", "Paid", "Failed", "Refunded"] as const;

export const PAYMENT_METHODS = ["Pay on Pickup", "Mobile Money on Confirmation", "Bank Transfer on Confirmation"] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];
export type FulfilmentType = "pickup" | "delivery";

export interface OrderCustomerDetails {
  fullName: string;
  phone: string;
  whatsapp: string;
  email?: string;
  fulfilmentType: FulfilmentType;
  region?: string;
  city?: string;
  deliveryAddress?: string;
  landmark?: string;
  deliveryNotes?: string;
  preferredPaymentMethod: PaymentMethod;
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
  batteryHealth?: string;
  warranty?: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface OrderRequestPayload {
  referenceNumber: string;
  customer: OrderCustomerDetails;
  items: OrderRequestItem[];
  subtotal: number;
  deliveryFee: number | null;
  total: number;
  paymentStatus: PaymentStatus;
  status: OrderStatus;
  adminNote: string;
  createdAt: string;
}

export interface StoredOrderRequest extends OrderRequestPayload {
  id: string;
  updatedAt?: string;
}

export interface OrderSubmissionInput {
  submissionToken: string;
  customer: OrderCustomerDetails;
  items: Array<{
    productId: string;
    productSlug: string;
    selectedStorage: string;
    selectedColour: string;
    quantity: number;
  }>;
}

export const cartItemsToOrderItems = (items: CartItem[]): OrderRequestItem[] =>
  items.map((item) => {
    const image = resolveProductImage(item.product);
    return {
      productId: item.product.id,
      productSlug: item.product.slug,
      productName: item.product.name,
      productImage: image?.src ?? "",
      storage: item.storage,
      colour: item.color,
      condition: item.product.condition,
      batteryHealth: item.product.batteryHealth,
      warranty: item.product.warranty ?? item.product.warrantyInfo,
      quantity: item.quantity,
      unitPrice: item.product.price,
      lineTotal: item.product.price * item.quantity,
    };
  });
