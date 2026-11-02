import {
  Bell,
  BellRing,
  Check,
  CheckCheck,
  Clock,
  ExternalLink,
  Gift,
  Inbox,
  MessageCircle,
  MessageSquare,
  Package,
  PackageCheck,
  Settings,
  Share2,
  ShoppingBag,
  Square,
  Tag,
  Volume2,
  VolumeX,
  Wrench,
  X,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import {
  fetchAdminOrderNotifications,
  subscribeToNewAdminOrders,
  type AdminOrderNotificationRecord,
} from "../orders/supabaseOrderRepository";
import { listServiceRequests, type ServiceRequest, type ServiceType } from "../services/serviceRequestRepository";
import {
  getAudioContext,
  isAlertActive,
  isAudioUnlocked,
  stopAlertSound,
  triggerAlertSound,
  unlockAudio,
} from "./adminNotificationAudio";
import {
  getNotificationSettings,
  markAlertSeen,
  readSeenAlertIds,
  readUnreadAlertIds,
  saveUnreadAlertIds,
  type AdminNotificationSettings,
} from "./adminNotificationState";

export type NotificationCategory =
  | "order"
  | "installment"
  | "repair"
  | "trade-in"
  | "visa-card"
  | "pre-order"
  | "referral"
  | "contact";

export interface UnifiedNotification {
  id: string; // unique ID
  sourceId: string;
  category: NotificationCategory;
  title: string;
  reference: string;
  customerName: string;
  summary: string;
  createdAt: string;
  targetUrl: string;
}

const FALLBACK_POLL_MS = 12_000;
const TOAST_LIFETIME_MS = 10_000;

const categoryIcons: Record<NotificationCategory, typeof ShoppingBag> = {
  order: ShoppingBag,
  installment: Clock,
  repair: Wrench,
  "trade-in": Tag,
  "visa-card": Gift,
  "pre-order": PackageCheck,
  referral: Share2,
  contact: MessageSquare,
};

const categoryLabels: Record<NotificationCategory, string> = {
  order: "Order Request",
  installment: "Installment",
  repair: "Repairs",
  "trade-in": "Trade-In",
  "visa-card": "Visa Card",
  "pre-order": "Pre-Order",
  referral: "Referral",
  contact: "Contact Msg",
};

const categoryBadgeColors: Record<NotificationCategory, string> = {
  order: "bg-blue-100 text-blue-800 border-blue-200",
  installment: "bg-amber-100 text-amber-800 border-amber-200",
  repair: "bg-purple-100 text-purple-800 border-purple-200",
  "trade-in": "bg-emerald-100 text-emerald-800 border-emerald-200",
  "visa-card": "bg-rose-100 text-rose-800 border-rose-200",
  "pre-order": "bg-indigo-100 text-indigo-800 border-indigo-200",
  referral: "bg-teal-100 text-teal-800 border-teal-200",
  contact: "bg-slate-100 text-slate-800 border-slate-200",
};

export function AdminNotificationBell({ userId }: { userId: string }) {
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [filterCategory, setFilterCategory] = useState<"all" | "orders" | "services">("all");
  const [notifications, setNotifications] = useState<UnifiedNotification[]>([]);
  const [unreadIds, setUnreadIds] = useState<string[]>(() => readUnreadAlertIds(userId));
  const [activeToasts, setActiveToasts] = useState<UnifiedNotification[]>([]);
  const [audioUnlocked, setAudioUnlocked] = useState(false);
  const [repeatingActive, setRepeatingActive] = useState(false);
  const [settings, setSettings] = useState<AdminNotificationSettings>(getNotificationSettings);

  const seenIds = useRef<Set<string>>(readSeenAlertIds());
  const toastTimers = useRef<Map<string, number>>(new Map());
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Sync settings updates from Settings page
  useEffect(() => {
    const handleSettingsChange = (e: Event) => {
      const custom = e as CustomEvent<AdminNotificationSettings>;
      if (custom.detail) setSettings(custom.detail);
    };
    window.addEventListener("buyandsell:notification-settings-changed", handleSettingsChange);
    return () => window.removeEventListener("buyandsell:notification-settings-changed", handleSettingsChange);
  }, []);

  // Check audio unlock status
  useEffect(() => {
    setAudioUnlocked(isAudioUnlocked());
    const handleUserInteraction = () => {
      void (async () => {
        const ctx = await getAudioContext();
        if (ctx && ctx.state === "running") setAudioUnlocked(true);
      })();
    };
    window.addEventListener("pointerdown", handleUserInteraction, { once: true });
    window.addEventListener("keydown", handleUserInteraction, { once: true });
    return () => {
      window.removeEventListener("pointerdown", handleUserInteraction);
      window.removeEventListener("keydown", handleUserInteraction);
    };
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    window.addEventListener("click", handleClickOutside);
    return () => window.removeEventListener("click", handleClickOutside);
  }, []);

  // Update repeating alert status poll
  useEffect(() => {
    const interval = window.setInterval(() => {
      setRepeatingActive(isAlertActive());
    }, 1000);
    return () => window.clearInterval(interval);
  }, []);

  // Dismiss a single toast
  const dismissToast = useCallback((id: string) => {
    const timer = toastTimers.current.get(id);
    if (timer) window.clearTimeout(timer);
    toastTimers.current.delete(id);
    setActiveToasts((current) => current.filter((item) => item.id !== id));
  }, []);

  // Trigger browser notification for background tab
  const fireBrowserNotification = useCallback((item: UnifiedNotification) => {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    if (Notification.permission === "granted" && document.hidden) {
      try {
        const notif = new Notification(item.title, {
          body: `${item.customerName ? `${item.customerName}: ` : ""}${item.summary} (${item.reference})`,
          icon: "/favicon.ico",
        });
        notif.onclick = () => {
          window.focus();
          navigate(item.targetUrl);
          notif.close();
        };
      } catch {
        // Non-blocking browser notification
      }
    }
  }, [navigate]);

  // Dispatch new incoming alert
  const dispatchIncomingAlert = useCallback((item: UnifiedNotification) => {
    if (seenIds.current.has(item.id)) return;
    markAlertSeen(item.id, seenIds.current);

    // 1. Update notification list & unread state
    setNotifications((prev) => [item, ...prev.filter((i) => i.id !== item.id)].slice(0, 50));
    setUnreadIds((prev) => {
      const next = [...new Set([...prev, item.id])];
      saveUnreadAlertIds(userId, next);
      return next;
    });

    // 2. Add to active toast stack
    setActiveToasts((prev) => [item, ...prev.filter((t) => t.id !== item.id)].slice(0, 4));
    const timer = window.setTimeout(() => dismissToast(item.id), TOAST_LIFETIME_MS);
    toastTimers.current.set(item.id, timer);

    // 3. Play audio if sound enabled
    if (settings.soundEnabled) {
      void triggerAlertSound(
        settings.soundType,
        settings.volume,
        settings.repeatAlerts,
        settings.repeatIntervalSeconds
      );
    }

    // 4. Background browser notification
    if (settings.browserNotifications) {
      fireBrowserNotification(item);
    }
  }, [userId, settings, dismissToast, fireBrowserNotification]);

  // Transform order to UnifiedNotification
  const orderToNotification = useCallback((order: AdminOrderNotificationRecord): UnifiedNotification => {
    return {
      id: `order-${order.id}`,
      sourceId: order.id,
      category: "order",
      title: "New Customer Order",
      reference: order.referenceNumber,
      customerName: order.customerName || "Customer",
      summary: "New Order Submitted",
      createdAt: order.createdAt,
      targetUrl: `/admin/orders/${order.id}`,
    };
  }, []);

  // Transform service request to UnifiedNotification
  const serviceToNotification = useCallback((sr: ServiceRequest): UnifiedNotification => {
    const details = sr.details || {};
    let summary = "";
    if (sr.service_type === "installment") {
      summary = `${details.model || "iPhone"} • GH₵ ${details.budget || ""} • ${details.planDuration || "Plan"}`;
    } else if (sr.service_type === "trade-in" || sr.service_type === "upgrade") {
      summary = `${details.brand || ""} ${details.model || "Device"}${details.condition ? ` (${details.condition})` : ""}`;
    } else if (sr.service_type === "repair") {
      summary = `${details.model || "Device"}: ${details.issue || "Repair request"}`;
    } else if (sr.service_type === "pre-order") {
      summary = `${details.model || "Requested device"} • Budget: GH₵ ${details.budget || ""}`;
    } else if (sr.service_type === "visa-card") {
      summary = `${details.cardType || "Card"} • Value: ${details.cardValue || ""}`;
    } else if (sr.service_type === "referral") {
      summary = `Friend: ${details.friendName || ""} • ${details.friendPhone || ""}`;
    } else {
      summary = details.message || "Customer message submitted";
    }

    return {
      id: `service-${sr.id}`,
      sourceId: sr.id,
      category: sr.service_type as NotificationCategory,
      title: `New ${serviceNames[sr.service_type] || "Service Request"}`,
      reference: sr.reference,
      customerName: sr.customer_name,
      summary: summary.trim() || "Service request received",
      createdAt: sr.created_at,
      targetUrl: `/admin/services`,
    };
  }, []);

  // Main listener and polling synchronization
  useEffect(() => {
    let disposed = false;
    let removeOrderSub: (() => void) | undefined;
    let pollTimer = 0;

    const syncLatest = async () => {
      try {
        const [orders, services] = await Promise.all([
          fetchAdminOrderNotifications().catch(() => []),
          listServiceRequests().catch(() => []),
        ]);

        if (disposed) return;

        // Process orders
        orders.forEach((ord) => {
          const item = orderToNotification(ord);
          if (!seenIds.current.has(item.id)) {
            dispatchIncomingAlert(item);
          }
        });

        // Process services (only consider requests from the last 7 days)
        const recentServices = services.slice(0, 30);
        recentServices.forEach((sr) => {
          const item = serviceToNotification(sr);
          if (!seenIds.current.has(item.id)) {
            dispatchIncomingAlert(item);
          }
        });

        // Also build notifications history list
        const combined = [
          ...orders.map(orderToNotification),
          ...recentServices.map(serviceToNotification),
        ].sort((a, b) => b.createdAt.localeCompare(a.createdAt));

        setNotifications(combined.slice(0, 50));
      } catch {
        // Polling will retry smoothly
      }
    };

    // Initialize historical items to prevent false alarms on first load
    const initialize = async () => {
      try {
        const [histOrders, histServices] = await Promise.all([
          fetchAdminOrderNotifications().catch(() => []),
          listServiceRequests().catch(() => []),
        ]);
        if (disposed) return;

        // If this is the very first time, seed seenIds so historical orders don't blast sound
        if (seenIds.current.size === 0) {
          histOrders.forEach((o) => seenIds.current.add(`order-${o.id}`));
          histServices.forEach((s) => seenIds.current.add(`service-${s.id}`));
          markAlertSeen("init", seenIds.current);
        }

        const combined = [
          ...histOrders.map(orderToNotification),
          ...histServices.slice(0, 30).map(serviceToNotification),
        ].sort((a, b) => b.createdAt.localeCompare(a.createdAt));

        setNotifications(combined.slice(0, 50));

        // Subscribe to real-time orders
        removeOrderSub = subscribeToNewAdminOrders(
          (newOrd) => {
            dispatchIncomingAlert(orderToNotification(newOrd));
          },
          () => {}
        );

        // Subscribe to real-time service requests if Supabase channel available
        try {
          if (supabase) {
            const channel = supabase
              .channel("admin-service-requests-realtime")
              .on(
                "postgres_changes",
                { event: "INSERT", schema: "public", table: "service_requests" },
                (payload) => {
                  const newSr = payload.new as ServiceRequest;
                  if (newSr?.id) dispatchIncomingAlert(serviceToNotification(newSr));
                }
              )
              .subscribe();

            return () => {
              void supabase?.removeChannel(channel);
            };
          }
        } catch {
          // Handled by polling
        }
      } catch {
        // Retry
      }
    };

    void initialize();

    // Start fallback polling
    pollTimer = window.setInterval(() => void syncLatest(), FALLBACK_POLL_MS);

    // Sync on tab visibility / focus
    const handleFocus = () => {
      if (!disposed && document.visibilityState === "visible") {
        void syncLatest();
      }
    };
    document.addEventListener("visibilitychange", handleFocus);
    window.addEventListener("focus", handleFocus);

    return () => {
      disposed = true;
      document.removeEventListener("visibilitychange", handleFocus);
      window.removeEventListener("focus", handleFocus);
      removeOrderSub?.();
      if (pollTimer) window.clearInterval(pollTimer);
    };
  }, [dispatchIncomingAlert, orderToNotification, serviceToNotification]);

  // Acknowledge & stop sound
  const handleAcknowledgeAndStopSound = () => {
    stopAlertSound();
    setRepeatingActive(false);
  };

  // Mark all read
  const handleMarkAllRead = () => {
    setUnreadIds([]);
    saveUnreadAlertIds(userId, []);
    handleAcknowledgeAndStopSound();
  };

  // Handle click on a single notification
  const handleSelectNotification = (item: UnifiedNotification) => {
    setUnreadIds((prev) => {
      const next = prev.filter((id) => id !== item.id);
      saveUnreadAlertIds(userId, next);
      return next;
    });
    handleAcknowledgeAndStopSound();
    setDropdownOpen(false);
    navigate(item.targetUrl);
  };

  // Explicit audio unlock button action
  const handleUnlockAudio = async () => {
    const success = await unlockAudio();
    if (success) setAudioUnlocked(true);
  };

  const filteredList = notifications.filter((item) => {
    if (filterCategory === "orders") return item.category === "order";
    if (filterCategory === "services") return item.category !== "order";
    return true;
  });

  const unreadCount = unreadIds.length;

  return (
    <div className="relative inline-flex items-center" ref={dropdownRef}>
      {/* Toast Notification Stack (Floating Top-Right) */}
      {activeToasts.length > 0 && (
        <div
          className="fixed top-4 right-4 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-auto"
          aria-live="assertive"
          role="region"
          aria-label="New inbound alerts"
        >
          {activeToasts.map((toast) => {
            const Icon = categoryIcons[toast.category] || ShoppingBag;
            const badgeStyle = categoryBadgeColors[toast.category];
            return (
              <div
                key={toast.id}
                className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-900 text-white shadow-2xl border border-slate-700 animate-in slide-in-from-top-2 duration-200"
              >
                <div className="p-2 rounded-lg bg-white/10 text-amber-400 shrink-0 mt-0.5">
                  <Icon size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className={`px-2 py-0.2 rounded text-[0.62rem] font-bold border ${badgeStyle}`}>
                      {categoryLabels[toast.category]}
                    </span>
                    <span className="font-mono text-xs text-slate-300 font-bold">{toast.reference}</span>
                  </div>
                  <strong className="block text-xs font-bold text-white truncate">{toast.title}</strong>
                  <p className="text-[0.72rem] text-slate-300 truncate mt-0.5">
                    {toast.customerName} {toast.summary ? `• ${toast.summary}` : ""}
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleSelectNotification(toast)}
                      className="px-2.5 py-1 rounded bg-[#d4af37] text-slate-900 text-[0.68rem] font-bold hover:bg-[#e5be48] transition"
                    >
                      Review Now
                    </button>
                    <button
                      type="button"
                      onClick={() => dismissToast(toast.id)}
                      className="px-2 py-1 rounded bg-white/10 text-slate-300 text-[0.68rem] hover:text-white transition"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => dismissToast(toast.id)}
                  aria-label="Dismiss notification"
                  className="p-1 rounded text-slate-400 hover:text-white"
                >
                  <X size={15} />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Repeating Sound Alert Alert Banner */}
      {repeatingActive && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-4 py-3 rounded-full bg-amber-500 text-slate-950 shadow-2xl border-2 border-amber-300 animate-bounce">
          <BellRing size={20} className="animate-spin" />
          <span className="text-xs font-bold">New Unacknowledged Alert Sounding!</span>
          <button
            type="button"
            onClick={handleAcknowledgeAndStopSound}
            className="px-3 py-1 rounded-full bg-slate-950 text-white text-xs font-black uppercase tracking-wider hover:bg-slate-900 shadow transition"
          >
            Acknowledge &amp; Stop
          </button>
        </div>
      )}

      {/* Topbar Bell Button */}
      <button
        type="button"
        onClick={() => setDropdownOpen((prev) => !prev)}
        className={`relative p-2 rounded-xl transition ${
          dropdownOpen
            ? "bg-slate-200 text-slate-900"
            : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
        }`}
        aria-label="Notifications"
        title="Admin Notifications & Alerts"
      >
        <Bell size={19} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-rose-600 px-1 text-[0.62rem] font-black text-white shadow-sm ring-2 ring-white animate-pulse">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Notifications Popover Dropdown */}
      {dropdownOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 rounded-2xl bg-white shadow-2xl border border-slate-200 z-50 overflow-hidden animate-in fade-in-50 zoom-in-95 duration-150">
          {/* Header */}
          <div className="flex items-center justify-between p-3.5 bg-slate-50 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs uppercase tracking-wider text-slate-900">
                Notifications
              </span>
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-rose-100 text-rose-700 text-[0.65rem] font-black">
                  {unreadCount} unread
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAllRead}
                  className="text-[0.7rem] font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1"
                  title="Mark all as read"
                >
                  <CheckCheck size={13} />
                  <span>Mark all read</span>
                </button>
              )}
              <Link
                to="/admin/settings"
                onClick={() => setDropdownOpen(false)}
                className="p-1 rounded text-slate-400 hover:text-slate-700"
                title="Notification Settings"
              >
                <Settings size={15} />
              </Link>
            </div>
          </div>

          {/* Autoplay Unlock Notice (if locked by browser) */}
          {!audioUnlocked && settings.soundEnabled && (
            <div className="flex items-center justify-between p-2.5 bg-amber-50 border-b border-amber-200 text-xs text-amber-900">
              <div className="flex items-center gap-2">
                <VolumeX size={15} className="text-amber-700 shrink-0" />
                <span className="text-[0.72rem] font-semibold">Audio playback waiting for permission</span>
              </div>
              <button
                type="button"
                onClick={() => void handleUnlockAudio()}
                className="px-2 py-1 rounded bg-amber-600 text-white text-[0.68rem] font-bold hover:bg-amber-700"
              >
                Enable Sound
              </button>
            </div>
          )}

          {/* Active Repeating Alert Bar */}
          {repeatingActive && (
            <div className="flex items-center justify-between p-2.5 bg-rose-50 border-b border-rose-200 text-xs text-rose-900">
              <span className="font-bold text-[0.72rem] flex items-center gap-1.5">
                <BellRing size={14} className="text-rose-600 animate-spin" />
                Alert sound repeating
              </span>
              <button
                type="button"
                onClick={handleAcknowledgeAndStopSound}
                className="px-2 py-1 rounded bg-rose-600 text-white text-[0.68rem] font-bold hover:bg-rose-700"
              >
                Stop Sound
              </button>
            </div>
          )}

          {/* Filter Pills */}
          <div className="flex items-center gap-1 p-2 bg-slate-100/70 border-b border-slate-200 text-[0.68rem] font-bold">
            <button
              type="button"
              onClick={() => setFilterCategory("all")}
              className={`px-2.5 py-1 rounded-md transition ${
                filterCategory === "all" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterCategory("orders")}
              className={`px-2.5 py-1 rounded-md transition ${
                filterCategory === "orders" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Orders
            </button>
            <button
              type="button"
              onClick={() => setFilterCategory("services")}
              className={`px-2.5 py-1 rounded-md transition ${
                filterCategory === "services" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Services &amp; Inquiries
            </button>
          </div>

          {/* Notifications Scroll Area */}
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
            {filteredList.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                No notifications right now.
              </div>
            ) : (
              filteredList.map((item) => {
                const isUnread = unreadIds.includes(item.id);
                const Icon = categoryIcons[item.category] || ShoppingBag;
                const badgeStyle = categoryBadgeColors[item.category];

                return (
                  <div
                    key={item.id}
                    onClick={() => handleSelectNotification(item)}
                    className={`flex items-start gap-3 p-3 cursor-pointer transition hover:bg-slate-50 ${
                      isUnread ? "bg-amber-50/40" : ""
                    }`}
                  >
                    <div className="p-2 rounded-lg bg-slate-100 text-slate-700 shrink-0 mt-0.5">
                      <Icon size={16} />
                    </div>
                    <div className="flex-1 min-w-0 text-xs">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <span className={`px-1.5 py-0.2 rounded text-[0.62rem] font-bold border ${badgeStyle}`}>
                          {categoryLabels[item.category]}
                        </span>
                        <span className="text-[0.65rem] text-slate-400">
                          {new Date(item.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                      <div className="font-bold text-slate-900 truncate flex items-center gap-1.5">
                        <span>{item.title}</span>
                        {isUnread && <span className="w-1.5 h-1.5 rounded-full bg-rose-600 shrink-0" />}
                      </div>
                      <div className="text-[0.72rem] text-slate-600 font-medium truncate mt-0.5">
                        <span className="font-bold">{item.customerName}</span>
                        {item.summary && ` • ${item.summary}`}
                      </div>
                      <div className="font-mono text-[0.68rem] text-[#b17d12] mt-0.5">
                        {item.reference}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="p-2.5 bg-slate-50 border-t border-slate-200 text-center">
            <Link
              to="/admin/settings"
              onClick={() => setDropdownOpen(false)}
              className="text-xs font-bold text-[#b17d12] hover:underline"
            >
              Configure Sound Alerts &amp; Volume Settings &rarr;
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

const serviceNames: Record<ServiceType, string> = {
  installment: "Installment Payment",
  repair: "Expert Repairs",
  "trade-in": "Trade-In",
  upgrade: "Upgrade & Save",
  "visa-card": "Visa Card Trading",
  "pre-order": "Pre-Order",
  referral: "Refer a Friend",
  contact: "Contact Message",
};
