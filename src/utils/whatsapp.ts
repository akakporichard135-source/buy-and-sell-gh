import { business } from "../config/business";
import type { CartItem, Product } from "../types/product";
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

export const checkoutWhatsAppUrl = (items: CartItem[], customerNote = "Customer details to be confirmed on WhatsApp.") => {
  const lines = items.map(
    (item, index) =>
      `${index + 1}. ${item.product.name} - ${item.storage}, ${item.color} x${item.quantity} (${formatGhs(
        item.product.price * item.quantity,
      )})`,
  );
  const total = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  return whatsappUrl(
    [
      "Hello Buy & Sell GH, I would like to checkout with these items:",
      ...lines,
      `Subtotal: ${formatGhs(total)}`,
      "Delivery/pickup: Please confirm the best option.",
      customerNote,
    ].join("\n"),
  );
};
