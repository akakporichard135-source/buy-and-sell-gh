import type { AlertSoundType } from "./adminNotificationAudio";

export interface AdminNotificationSettings {
  soundEnabled: boolean;
  soundType: AlertSoundType;
  volume: number; // 0 - 100
  repeatAlerts: boolean;
  repeatIntervalSeconds: number; // 15, 30, 60, 120
  browserNotifications: boolean;
}

const SETTINGS_KEY = "buyandsell_admin_notification_settings_v3";
const UNREAD_PREFIX = "buyandsell_admin_unread_alerts_v3";
const SEEN_ALERTS_KEY = "buyandsell_admin_seen_alert_ids_v3";
const MAX_STORED_IDS = 300;

export const DEFAULT_NOTIFICATION_SETTINGS: AdminNotificationSettings = {
  soundEnabled: true,
  soundType: "loud-chime",
  volume: 85,
  repeatAlerts: true,
  repeatIntervalSeconds: 30,
  browserNotifications: false,
};

export const getNotificationSettings = (): AdminNotificationSettings => {
  if (typeof window === "undefined") return DEFAULT_NOTIFICATION_SETTINGS;
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_NOTIFICATION_SETTINGS;
    const parsed = JSON.parse(raw);
    return {
      soundEnabled: typeof parsed.soundEnabled === "boolean" ? parsed.soundEnabled : true,
      soundType: ["loud-chime", "urgent-pulse", "store-chime", "digital-beep"].includes(parsed.soundType)
        ? parsed.soundType
        : "loud-chime",
      volume: typeof parsed.volume === "number" ? Math.max(0, Math.min(100, parsed.volume)) : 85,
      repeatAlerts: typeof parsed.repeatAlerts === "boolean" ? parsed.repeatAlerts : true,
      repeatIntervalSeconds: typeof parsed.repeatIntervalSeconds === "number" ? parsed.repeatIntervalSeconds : 30,
      browserNotifications: typeof parsed.browserNotifications === "boolean" ? parsed.browserNotifications : false,
    };
  } catch {
    return DEFAULT_NOTIFICATION_SETTINGS;
  }
};

export const saveNotificationSettings = (settings: AdminNotificationSettings) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    window.dispatchEvent(new CustomEvent("buyandsell:notification-settings-changed", { detail: settings }));
  } catch {
    // Non-blocking fallback
  }
};

const unreadStorageKey = (userId: string) => `${UNREAD_PREFIX}:${userId}`;

export const readUnreadAlertIds = (userId: string): string[] => {
  if (typeof window === "undefined") return [];
  try {
    const saved = JSON.parse(sessionStorage.getItem(unreadStorageKey(userId)) ?? "[]");
    return Array.isArray(saved)
      ? saved.filter((id): id is string => typeof id === "string").slice(-MAX_STORED_IDS)
      : [];
  } catch {
    return [];
  }
};

export const saveUnreadAlertIds = (userId: string, ids: string[]) => {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(unreadStorageKey(userId), JSON.stringify([...new Set(ids)].slice(-MAX_STORED_IDS)));
  } catch {
    // Non-blocking fallback
  }
};

export const readSeenAlertIds = (): Set<string> => {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = sessionStorage.getItem(SEEN_ALERTS_KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw);
    return new Set(Array.isArray(arr) ? arr : []);
  } catch {
    return new Set();
  }
};

export const markAlertSeen = (id: string, seenSet: Set<string>) => {
  seenSet.add(id);
  if (typeof window === "undefined") return;
  try {
    const list = Array.from(seenSet).slice(-MAX_STORED_IDS);
    sessionStorage.setItem(SEEN_ALERTS_KEY, JSON.stringify(list));
  } catch {
    // Non-blocking fallback
  }
};
