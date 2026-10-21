import { business } from "../config/business";
import type { OrderRequestPayload } from "../types/order";
import type { Product } from "../types/product";
import { formatGhs } from "./format";
import { resolveProductColorImage } from "./productColorImages";
import { hasOwnerUploadedProductImages, resolveProductImage } from "./productImages";

export type WhatsAppIntent = "general" | "product" | "trade" | "request" | "delivery";

const defaultMessages: Record<WhatsAppIntent, string> = {
  general: "Hello Buy & Sell GH, I would like to make an enquiry about your original devices.",
  product: "Hello Buy & Sell GH, I am interested in a device. Please confirm availability and price.",
  trade: "Hello Buy & Sell GH, I would like to sell or trade in my phone. Please assist me.",
  request: "Hello Buy & Sell GH, I would like to pre-order a device that is not currently available on the website.",
  delivery: "Hello Buy & Sell GH, please tell me more about delivery and pickup options.",
};

export const toAbsoluteProductImageUrl = (imageSrc?: string): string => {
  const clean = (imageSrc ?? "").trim();
  if (!clean) return "";
  if (/^https?:\/\//i.test(clean)) return clean;
  const base = business.siteUrl.replace(/\/+$/, "");
  return clean.startsWith("/") ? `${base}${clean}` : `${base}/${clean}`;
};

export const whatsappUrl = (message: string, number = business.whatsapp.primary) =>
  `https://wa.me/${number}?text=${encodeURIComponent(message)}`;

export const intentWhatsAppUrl = (intent: WhatsAppIntent) => whatsappUrl(defaultMessages[intent]);

export const productWhatsAppUrl = (
  product: Product,
  storage: string,
  color: string,
  pageUrl?: string,
  price?: number,
  imageSrc?: string,
) => {
  const ownerOrPrimary = resolveProductImage(product)?.src;
  const resolvedImage =
    imageSrc ||
    (hasOwnerUploadedProductImages(product) ? ownerOrPrimary : undefined) ||
    resolveProductColorImage(product, color) ||
    ownerOrPrimary;
  const photoUrl = toAbsoluteProductImageUrl(resolvedImage);

  return whatsappUrl(
    [
      `Hello Buy & Sell GH, I'm interested in the ${product.name}, ${storage}, ${color}.`,
      `Condition: ${product.condition}.`,
      product.priceOnRequest || (price ?? product.price) <= 0 ? "Price: Please confirm the current price." : `Listed price: ${formatGhs(price ?? product.price)}.`,
      pageUrl ? `Product page: ${pageUrl}` : "",
      photoUrl ? `Product photo: ${photoUrl}` : "",
      "Please confirm availability and final details.",
    ].filter(Boolean).join(" "),
  );
};

export const orderRequestWhatsAppUrl = (order: OrderRequestPayload) => {
  const lines = order.items.flatMap((item, index) => {
    const line = `${index + 1}. ${item.quantity}x ${item.productName} - ${item.storage}, ${item.colour}, ${item.condition} (${formatGhs(
      item.lineTotal,
    )})`;
    const photoUrl = toAbsoluteProductImageUrl(item.productImage);
    return photoUrl ? [line, `   Photo: ${photoUrl}`] : [line];
  });
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
