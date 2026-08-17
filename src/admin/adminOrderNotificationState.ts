import type { AdminOrderNotificationRecord } from "../orders/supabaseOrderRepository";

const SOUND_PREFERENCE_KEY = "buyandsell-admin-order-sounds";
const UNREAD_ORDER_IDS_PREFIX = "buyandsell-admin-unread-orders";
const MAX_STORED_ORDER_IDS = 250;

type StorageLike = Pick<Storage, "getItem" | "setItem">;

export const getOrderSoundPreference = (storage?: StorageLike | null) => {
  if (!storage) return true;
  try {
    return storage.getItem(SOUND_PREFERENCE_KEY) !== "off";
  } catch {
    return true;
  }
};

export const saveOrderSoundPreference = (storage: StorageLike | null | undefined, enabled: boolean) => {
  if (!storage) return;
  try {
    storage.setItem(SOUND_PREFERENCE_KEY, enabled ? "on" : "off");
  } catch {
    // The visual notification remains available when browser storage is blocked.
  }
};

const unreadStorageKey = (userId: string) => `${UNREAD_ORDER_IDS_PREFIX}:${userId}`;

export const readUnreadOrderIds = (storage: StorageLike | null | undefined, userId: string) => {
  if (!storage) return [];
  try {
    const saved = JSON.parse(storage.getItem(unreadStorageKey(userId)) ?? "[]");
    return Array.isArray(saved) ? saved.filter((item): item is string => typeof item === "string").slice(-MAX_STORED_ORDER_IDS) : [];
  } catch {
    return [];
  }
};

export const saveUnreadOrderIds = (storage: StorageLike | null | undefined, userId: string, orderIds: string[]) => {
  if (!storage) return;
  try {
    storage.setItem(unreadStorageKey(userId), JSON.stringify([...new Set(orderIds)].slice(-MAX_STORED_ORDER_IDS)));
  } catch {
    // Unread state can safely remain in memory for this session.
  }
};

export const collectUnseenOrders = (
  orders: AdminOrderNotificationRecord[],
  seenOrderIds: Set<string>,
) => orders.filter((order) => {
  if (seenOrderIds.has(order.id)) return false;
  seenOrderIds.add(order.id);
  return true;
});
