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
      `${index + 1}. ${item.productName} - ${item.storage}, ${item.colour}, ${item.condition} x${item.quantity} (${formatGhs(
        item.lineTotal,
      )})`,
  );

  return whatsappUrl(
    [
      "Hello Buy & Sell GH, I would like to send this order request:",
      `Order reference: ${order.referenceNumber}`,
      `Customer name: ${order.customer.fullName}`,
      `Phone: ${order.customer.phone}`,
      order.customer.email ? `Email: ${order.customer.email}` : "",
      ...lines,
      `Total: ${formatGhs(order.total)}`,
      `Delivery or pickup: ${order.customer.fulfilmentType === "delivery" ? "Delivery" : "Pickup"}`,
      order.customer.deliveryLocation ? `Delivery location: ${order.customer.deliveryLocation}` : "",
      `Preferred payment method: ${order.customer.preferredPaymentMethod}`,
      order.customer.additionalNote ? `Additional note: ${order.customer.additionalNote}` : "Additional note: None",
      "Please verify product availability, price, payment and delivery details.",
    ].filter(Boolean).join("\n"),
  );
};
