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
const FALLBACK_REFRESH_MS = 12_000;
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

  const getOrCreateAudioContext = useCallback(async (): Promise<AudioContext | null> => {
    try {
      const AudioContextClass = window.AudioContext ?? (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) return null;
      let context = audioContextRef.current;
      if (!context || context.state === "closed") {
        context = new AudioContextClass();
        audioContextRef.current = context;
      }
      if (context.state === "suspended") {
        await context.resume();
      }
      audioReadyRef.current = context.state === "running";
      return context;
    } catch {
      audioReadyRef.current = false;
      return null;
    }
  }, []);

  const playChimeTone = useCallback((context: AudioContext) => {
    try {
      const now = context.currentTime;
      // High-clarity Apple dual chime: 784 Hz (G5) -> 1046.5 Hz (C6)
      [
        { freq: 784, start: 0, dur: 0.16 },
        { freq: 1046.5, start: 0.12, dur: 0.28 },
      ].forEach(({ freq, start, dur }) => {
        const osc = context.createOscillator();
        const gain = context.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now + start);
        gain.gain.setValueAtTime(0.0001, now + start);
        gain.gain.exponentialRampToValueAtTime(0.12, now + start + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + start + dur);
        osc.connect(gain);
        gain.connect(context.destination);
        osc.start(now + start);
        osc.stop(now + start + dur + 0.02);
      });
    } catch {
      audioReadyRef.current = false;
    }
  }, []);

  const playOrderSound = useCallback(async () => {
    if (!soundEnabledRef.current) return;
    const context = await getOrCreateAudioContext();
    if (context && context.state === "running") {
      playChimeTone(context);
    }
  }, [getOrCreateAudioContext, playChimeTone]);

  useEffect(() => {
    const enableAfterInteraction = () => {
      void getOrCreateAudioContext();
    };
    window.addEventListener("pointerdown", enableAfterInteraction, { once: true });
    window.addEventListener("keydown", enableAfterInteraction, { once: true });
    return () => {
      window.removeEventListener("pointerdown", enableAfterInteraction);
      window.removeEventListener("keydown", enableAfterInteraction);
    };
  }, [getOrCreateAudioContext]);

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
    void playOrderSound();
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

    const handleVisibilityOrFocus = () => {
      if (!disposed && document.visibilityState === "visible") {
        void refreshForNewOrders();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityOrFocus);
    window.addEventListener("focus", handleVisibilityOrFocus);

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
      document.removeEventListener("visibilitychange", handleVisibilityOrFocus);
      window.removeEventListener("focus", handleVisibilityOrFocus);
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

  const toggleSound = useCallback(async () => {
    setSoundEnabled((current) => {
      const next = !current;
      soundEnabledRef.current = next;
      saveOrderSoundPreference(window.localStorage, next);
      if (next) {
        // Enable and test playback immediately so the administrator confirms sound is working
        void (async () => {
          const context = await getOrCreateAudioContext();
          if (context && context.state === "running") {
            playChimeTone(context);
          }
        })();
      }
      return next;
    });
  }, [getOrCreateAudioContext, playChimeTone]);

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
