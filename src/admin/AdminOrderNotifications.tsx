import { BellRing, Volume2, VolumeX, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  fetchAdminOrderNotifications,
  subscribeToNewAdminOrders,
  type AdminOrderNotificationRecord,
} from "../orders/supabaseOrderRepository";
import {
  collectUnseenOrders,
  getOrderSoundPreference,
  readUnreadOrderIds,
  saveOrderSoundPreference,
  saveUnreadOrderIds,
} from "./adminOrderNotificationState";

export const ADMIN_NEW_ORDER_EVENT = "buyandsell:admin-new-order";
const FALLBACK_REFRESH_MS = 60_000;
const NOTIFICATION_LIFETIME_MS = 10_000;

interface UseAdminOrderNotificationsOptions {
  userId: string;
  reviewingOrders: boolean;
}

export function useAdminOrderNotifications({ userId, reviewingOrders }: UseAdminOrderNotificationsOptions) {
  const [notifications, setNotifications] = useState<AdminOrderNotificationRecord[]>([]);
  const [unreadOrderIds, setUnreadOrderIds] = useState<string[]>(() =>
    readUnreadOrderIds(typeof window === "undefined" ? null : window.sessionStorage, userId));
  const [soundEnabled, setSoundEnabled] = useState(() =>
    getOrderSoundPreference(typeof window === "undefined" ? null : window.localStorage));
  const seenOrderIds = useRef(new Set<string>());
  const reviewingOrdersRef = useRef(reviewingOrders);
  const userIdRef = useRef(userId);
  const soundEnabledRef = useRef(soundEnabled);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioReadyRef = useRef(false);
  const notificationTimers = useRef(new Map<string, number>());

  useEffect(() => {
    reviewingOrdersRef.current = reviewingOrders;
    if (!reviewingOrders) return;
    setUnreadOrderIds([]);
    saveUnreadOrderIds(window.sessionStorage, userId, []);
  }, [reviewingOrders, userId]);

  useEffect(() => {
    userIdRef.current = userId;
    seenOrderIds.current.clear();
    setUnreadOrderIds(readUnreadOrderIds(window.sessionStorage, userId));
  }, [userId]);

  useEffect(() => {
    soundEnabledRef.current = soundEnabled;
  }, [soundEnabled]);

  const unlockAudio = useCallback(async (force = false) => {
    if (!force && !soundEnabledRef.current) return;
    try {
      const AudioContextClass = window.AudioContext ?? (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) return;
      const context = audioContextRef.current ?? new AudioContextClass();
      audioContextRef.current = context;
      if (context.state === "suspended") await context.resume();
      audioReadyRef.current = context.state === "running";
    } catch {
      audioReadyRef.current = false;
    }
  }, []);

  useEffect(() => {
    const enableAfterInteraction = () => void unlockAudio();
    window.addEventListener("pointerdown", enableAfterInteraction, { once: true });
    window.addEventListener("keydown", enableAfterInteraction, { once: true });
    return () => {
      window.removeEventListener("pointerdown", enableAfterInteraction);
      window.removeEventListener("keydown", enableAfterInteraction);
    };
  }, [unlockAudio]);

  const playOrderSound = useCallback(() => {
    const context = audioContextRef.current;
    if (!soundEnabledRef.current || !audioReadyRef.current || !context || context.state !== "running") return;
    try {
      const now = context.currentTime;
      [0, 0.16].forEach((offset, index) => {
        const oscillator = context.createOscillator();
        const gain = context.createGain();
        oscillator.type = "sine";
        oscillator.frequency.value = index === 0 ? 740 : 988;
        gain.gain.setValueAtTime(0.0001, now + offset);
        gain.gain.exponentialRampToValueAtTime(0.08, now + offset + 0.012);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + offset + 0.14);
        oscillator.connect(gain);
        gain.connect(context.destination);
        oscillator.start(now + offset);
        oscillator.stop(now + offset + 0.15);
      });
    } catch {
      audioReadyRef.current = false;
    }
  }, []);

  const dismissNotification = useCallback((orderId: string) => {
    const timer = notificationTimers.current.get(orderId);
    if (timer) window.clearTimeout(timer);
    notificationTimers.current.delete(orderId);
    setNotifications((current) => current.filter((order) => order.id !== orderId));
  }, []);

  const receiveOrder = useCallback((order: AdminOrderNotificationRecord) => {
    const [newOrder] = collectUnseenOrders([order], seenOrderIds.current);
    if (!newOrder) return;

    setNotifications((current) => [newOrder, ...current.filter((item) => item.id !== newOrder.id)].slice(0, 4));
    if (!reviewingOrdersRef.current) {
      setUnreadOrderIds((current) => {
        const next = [...new Set([...current, newOrder.id])];
        saveUnreadOrderIds(window.sessionStorage, userIdRef.current, next);
        return next;
      });
    }
    playOrderSound();
    window.dispatchEvent(new CustomEvent(ADMIN_NEW_ORDER_EVENT, { detail: { orderId: newOrder.id } }));
    const timer = window.setTimeout(() => dismissNotification(newOrder.id), NOTIFICATION_LIFETIME_MS);
    notificationTimers.current.set(newOrder.id, timer);
  }, [dismissNotification, playOrderSound]);

  useEffect(() => {
    let disposed = false;
    let removeSubscription: (() => void) | undefined;
    let pollingTimer = 0;
    let retryTimer = 0;

    const stopPolling = () => {
      if (pollingTimer) window.clearInterval(pollingTimer);
      pollingTimer = 0;
    };

    const refreshForNewOrders = async () => {
      try {
        const orders = await fetchAdminOrderNotifications();
        if (disposed) return;
        [...orders].reverse().forEach(receiveOrder);
      } catch {
        // Existing admin order pages remain usable; the next fallback cycle retries quietly.
      }
    };

    const startPolling = () => {
      if (pollingTimer || disposed) return;
      pollingTimer = window.setInterval(() => void refreshForNewOrders(), FALLBACK_REFRESH_MS);
    };

    const initialize = async () => {
      try {
        const historicalOrders = await fetchAdminOrderNotifications();
        if (disposed) return;
        historicalOrders.forEach((order) => seenOrderIds.current.add(order.id));
        removeSubscription = subscribeToNewAdminOrders(receiveOrder, (status) => {
          if (status === "connected") {
            void refreshForNewOrders();
          } else {
            startPolling();
          }
        });
        startPolling();
      } catch {
        if (!disposed) retryTimer = window.setTimeout(() => void initialize(), FALLBACK_REFRESH_MS);
      }
    };

    void initialize();
    return () => {
      disposed = true;
      removeSubscription?.();
      stopPolling();
      if (retryTimer) window.clearTimeout(retryTimer);
    };
  }, [receiveOrder, userId]);

  useEffect(() => () => {
    notificationTimers.current.forEach((timer) => window.clearTimeout(timer));
    notificationTimers.current.clear();
    void audioContextRef.current?.close();
  }, []);

  const toggleSound = useCallback(() => {
    setSoundEnabled((current) => {
      const next = !current;
      soundEnabledRef.current = next;
      saveOrderSoundPreference(window.localStorage, next);
      if (next) void unlockAudio(true);
      return next;
    });
  }, [unlockAudio]);

  const markOrdersRead = useCallback(() => {
    setUnreadOrderIds([]);
    saveUnreadOrderIds(window.sessionStorage, userIdRef.current, []);
  }, []);

  return {
    notifications,
    unreadCount: unreadOrderIds.length,
    soundEnabled,
    toggleSound,
    dismissNotification,
    markOrdersRead,
  };
}

export function AdminOrderNotificationStack({
  notifications,
  dismissNotification,
}: {
  notifications: AdminOrderNotificationRecord[];
  dismissNotification: (orderId: string) => void;
}) {
  if (notifications.length === 0) return null;
  return (
    <div className="admin-order-notification-stack" aria-live="polite" aria-label="New order notifications">
      {notifications.map((order) => (
        <article className="admin-order-notification" key={order.id} role="status">
          <BellRing size={20} aria-hidden="true" />
          <div>
            <strong>New order received</strong>
            <span>{order.referenceNumber}{order.customerName ? ` | ${order.customerName}` : ""}</span>
            <Link to={`/admin/orders/${order.id}`}>Review order</Link>
          </div>
          <button type="button" aria-label={`Dismiss ${order.referenceNumber} notification`} onClick={() => dismissNotification(order.id)}>
            <X size={18} />
          </button>
        </article>
      ))}
    </div>
  );
}

export function AdminOrderSoundButton({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) {
  return (
    <button className="admin-sound-toggle" type="button" aria-pressed={enabled} onClick={onToggle}>
      {enabled ? <Volume2 size={17} /> : <VolumeX size={17} />}
      <span>Order sounds: {enabled ? "On" : "Off"}</span>
    </button>
  );
}
