import { business } from "../config/business";
import type { OrderRequestPayload } from "../types/order";
import type { Product } from "../types/product";
import { formatGhs } from "./format";

export type WhatsAppIntent = "general" | "product" | "trade" | "request" | "delivery";

const defaultMessages: Record<WhatsAppIntent, string> = {
  general: "Hello Buy & Sell GH, I would like to make an enquiry about your original devices.",
  product: "Hello Buy & Sell GH, I am interested in a device. Please confirm availability and price.",
  trade: "Hello Buy & Sell GH, I would like to sell or trade in my phone. Please assist me.",
  request: "Hello Buy & Sell GH, I would like to request a device that is not currently listed.",
  delivery: "Hello Buy & Sell GH, please tell me more about delivery and pickup options.",
};

export const whatsappUrl = (message: string, number = business.whatsapp.primary) =>
  `https://wa.me/${number}?text=${encodeURIComponent(message)}`;

export const intentWhatsAppUrl = (intent: WhatsAppIntent) => whatsappUrl(defaultMessages[intent]);

export const productWhatsAppUrl = (product: Product, storage: string, color: string, pageUrl?: string) =>
  whatsappUrl(
    [
      `Hello Buy & Sell GH, I'm interested in the ${product.name}, ${storage}, ${color}.`,
      `Condition: ${product.condition}.`,
      `Listed price: ${formatGhs(product.price)}.`,
      pageUrl ? `Product page: ${pageUrl}` : "",
      "Please confirm availability and final details.",
    ].filter(Boolean).join(" "),
  );

export const orderRequestWhatsAppUrl = (order: OrderRequestPayload) => {
  const lines = order.items.map(
    (item, index) =>
      `${index + 1}. ${item.quantity}x ${item.productName} - ${item.storage}, ${item.colour}, ${item.condition} (${formatGhs(
        item.lineTotal,
      )})`,
  );
  const location = order.customer.fulfilmentType === "delivery"
    ? [order.customer.region, order.customer.city, order.customer.deliveryAddress, order.customer.landmark].filter(Boolean).join(", ")
    : "Store Pickup";

  return whatsappUrl(
    [
      "Hello Buy & Sell GH,",
      "I just placed an order on your website.",
      "",
      `Reference: ${order.referenceNumber}`,
      `Name: ${order.customer.fullName}`,
      `Phone: ${order.customer.phone}`,
      `WhatsApp: ${order.customer.whatsapp}`,
      order.customer.email ? `Email: ${order.customer.email}` : "",
      "",
      "Items:",
      ...lines,
      "",
      `Order total: ${formatGhs(order.total)}`,
      `Delivery method: ${order.customer.fulfilmentType === "delivery" ? "Delivery" : "Store Pickup"}`,
      `Location: ${location || "To confirm"}`,
      `Payment preference: ${order.customer.preferredPaymentMethod}`,
      order.customer.additionalNote ? `Additional note: ${order.customer.additionalNote}` : "Additional note: None",
      "",
      "Please confirm availability and payment details.",
    ].filter(Boolean).join("\n"),
  );
};
