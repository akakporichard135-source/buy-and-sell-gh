import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { familyMatchesProduct, productBuyPath, type ProductFamilyKey } from "../catalog/productExperience";
import { ORDER_SUCCESS_STORAGE_KEY, type FulfilmentType, type OrderCustomerDetails, type StoredOrderRequest } from "../types/order";
import type { CartItem, Product, ProductVariant } from "../types/product";
import { buildOrderRequestPayload, buildOrderSubmissionInput, generateSubmissionToken, submitOrderRequest } from "../utils/orders";
import { orderRequestWhatsAppUrl } from "../utils/whatsapp";
import { cartItemKey } from "./cartOperations";
import { useCart } from "./CartContext";

export interface CustomerDraft {
  fullName: string;
  whatsapp: string;
  fulfilmentType: FulfilmentType;
  region: string;
  city: string;
  deliveryAddress: string;
  additionalNote: string;
}

type CustomerField = keyof CustomerDraft;
type CustomerErrors = Partial<Record<CustomerField | "quantity", string>>;

interface BuyJourneyValue {
  customer: CustomerDraft;
  errors: CustomerErrors;
  quantity: number;
  setQuantity: (quantity: number) => void;
  updateCustomer: <K extends CustomerField>(field: K, value: CustomerDraft[K]) => void;
  bagOpen: boolean;
  openBag: () => void;
  closeBag: () => void;
  editingItem: CartItem | null;
  beginEdit: (item: CartItem) => void;
  addConfiguredItem: (product: Product, storage: string, color: string, variant?: ProductVariant, imageSrc?: string, options?: Record<string, string>) => boolean;
  placingOrder: boolean;
  orderError: string;
  placeOrder: () => Promise<void>;
}

const DRAFT_KEY = "buyandsell-gh-customer-draft";
const initialCustomer: CustomerDraft = {
  fullName: "",
  whatsapp: "",
  fulfilmentType: "pickup",
  region: "",
  city: "",
  deliveryAddress: "",
  additionalNote: "",
};
const phonePattern = /^(?:\+?233|0)[25]\d{8}$/;

const BuyJourneyContext = createContext<BuyJourneyValue | null>(null);

function readCustomerDraft(): CustomerDraft {
  try {
    const stored = JSON.parse(sessionStorage.getItem(DRAFT_KEY) || "null");
    if (!stored || typeof stored !== "object") return initialCustomer;
    return {
      fullName: typeof stored.fullName === "string" ? stored.fullName : "",
      whatsapp: typeof stored.whatsapp === "string" ? stored.whatsapp : "",
      fulfilmentType: stored.fulfilmentType === "delivery" ? "delivery" : "pickup",
      region: typeof stored.region === "string" ? stored.region : "",
      city: typeof stored.city === "string" ? stored.city : "",
      deliveryAddress: typeof stored.deliveryAddress === "string" ? stored.deliveryAddress : "",
      additionalNote: typeof stored.additionalNote === "string" ? stored.additionalNote : "",
    };
  } catch {
    return initialCustomer;
  }
}

export function cleanCustomerPhone(value: string): string {
  return value.replace(/[\s-]/g, "").trim();
}

export function validateCustomerDraft(customer: CustomerDraft, quantity: number): CustomerErrors {
  const errors: CustomerErrors = {};
  if (!customer.fullName.trim()) errors.fullName = "Enter your full name.";
  else if (customer.fullName.trim().length > 120) errors.fullName = "Keep your name under 120 characters.";
  if (!phonePattern.test(cleanCustomerPhone(customer.whatsapp))) errors.whatsapp = "Enter a valid Ghana WhatsApp number.";
  if (customer.fulfilmentType === "delivery") {
    if (!customer.region.trim()) errors.region = "Enter your region.";
    if (!customer.city.trim()) errors.city = "Enter your city or area.";
    if (!customer.deliveryAddress.trim()) errors.deliveryAddress = "Enter your delivery address.";
  }
  if (customer.additionalNote.trim().length > 2000) errors.additionalNote = "Keep notes under 2,000 characters.";
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 999) errors.quantity = "Choose a quantity from 1 to 999.";
  return errors;
}

export function customerDraftToOrderDetails(customer: CustomerDraft): OrderCustomerDetails {
  const whatsapp = cleanCustomerPhone(customer.whatsapp);
  return {
    fullName: customer.fullName.trim(),
    phone: whatsapp,
    whatsapp,
    fulfilmentType: customer.fulfilmentType,
    region: customer.fulfilmentType === "delivery" ? customer.region.trim() : undefined,
    city: customer.fulfilmentType === "delivery" ? customer.city.trim() : undefined,
    deliveryAddress: customer.fulfilmentType === "delivery" ? customer.deliveryAddress.trim() : undefined,
    preferredPaymentMethod: customer.fulfilmentType === "pickup" ? "Pay on Pickup" : "Mobile Money on Confirmation",
    additionalNote: customer.additionalNote.trim() || undefined,
  };
}

function buyPathForProduct(product: Product): string {
  const families: ProductFamilyKey[] = ["iphone", "mac", "ipad", "watch", "airpods", "accessories"];
  const family = families.find((candidate) => familyMatchesProduct(product, candidate)) ?? "accessories";
  return productBuyPath(family, product.slug);
}

function cartEditKey(item: CartItem): string {
  return JSON.stringify([item.product.slug, item.storage, item.color, item.variantId ?? ""]);
}

export function BuyJourneyProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const { items, addItem, replaceItem, clearCart, dismissToast } = useCart();
  const [customer, setCustomer] = useState<CustomerDraft>(readCustomerDraft);
  const [errors, setErrors] = useState<CustomerErrors>({});
  const [quantity, setQuantity] = useState(1);
  const [bagOpen, setBagOpen] = useState(false);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [orderError, setOrderError] = useState("");
  const submissionToken = useRef(generateSubmissionToken());
  const submissionInFlight = useRef(false);
  const openBag = useCallback(() => setBagOpen(true), []);
  const closeBag = useCallback(() => setBagOpen(false), []);

  useEffect(() => {
    try {
      sessionStorage.setItem(DRAFT_KEY, JSON.stringify(customer));
    } catch {
      // The draft remains available in memory when session storage is unavailable.
    }
  }, [customer]);

  const editingItem = useMemo(() => items.find((item) => cartEditKey(item) === editingKey) ?? null, [editingKey, items]);

  const updateCustomer: BuyJourneyValue["updateCustomer"] = (field, value) => {
    setCustomer((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setOrderError("");
  };

  const requireCustomer = (requestedQuantity: number) => {
    const nextErrors = validateCustomerDraft(customer, requestedQuantity);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length === 0) return true;
    document.getElementById("buy-customer-details")?.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
      block: "center",
    });
    return false;
  };

  const addConfiguredItem: BuyJourneyValue["addConfiguredItem"] = (product, storage, color, variant, imageSrc, options) => {
    if (!requireCustomer(quantity)) return false;
    const added = editingItem && editingKey
      ? replaceItem(cartItemKey(editingItem), product, storage, color, quantity, variant, imageSrc, options)
      : addItem(product, storage, color, quantity, variant, imageSrc, options);
    if (added) {
      dismissToast();
      setEditingKey(null);
      setQuantity(1);
      setOrderError("");
      setBagOpen(true);
    }
    return added;
  };

  const beginEdit = (item: CartItem) => {
    dismissToast();
    setEditingKey(cartEditKey(item));
    setQuantity(item.quantity);
    setBagOpen(false);
    navigate(buyPathForProduct(item.product));
  };

  const placeOrder = async () => {
    if (submissionInFlight.current || items.length === 0) return;
    if (!requireCustomer(1)) {
      setOrderError("Contact or delivery details need attention. Edit an item to update them on its Buy page.");
      return;
    }
    submissionInFlight.current = true;
    setPlacingOrder(true);
    setOrderError("");
    const details = customerDraftToOrderDetails(customer);
    const preview = buildOrderRequestPayload(items, details);
    const input = buildOrderSubmissionInput(items, details, submissionToken.current);
    const result = await submitOrderRequest(preview, input);
    setPlacingOrder(false);
    submissionInFlight.current = false;
    if (result.status === "failed") {
      setOrderError(result.message);
      return;
    }
    const order: StoredOrderRequest = result.order;
    try {
      sessionStorage.setItem(ORDER_SUCCESS_STORAGE_KEY, JSON.stringify(order));
      sessionStorage.removeItem(DRAFT_KEY);
    } catch {
      // Router state still carries the saved order confirmation.
    }
    clearCart();
    setCustomer(initialCustomer);
    setBagOpen(false);
    submissionToken.current = generateSubmissionToken();
    navigate(`/order-success/${order.referenceNumber}`, { replace: true, state: { order } });
    window.location.assign(orderRequestWhatsAppUrl(order));
  };

  return (
    <BuyJourneyContext.Provider value={{
      customer, errors, quantity, setQuantity, updateCustomer,
      bagOpen, openBag, closeBag,
      editingItem, beginEdit, addConfiguredItem, placingOrder, orderError, placeOrder,
    }}>
      {children}
    </BuyJourneyContext.Provider>
  );
}

export function useBuyJourney(): BuyJourneyValue {
  const value = useContext(BuyJourneyContext);
  if (!value) throw new Error("useBuyJourney must be used inside BuyJourneyProvider");
  return value;
}
