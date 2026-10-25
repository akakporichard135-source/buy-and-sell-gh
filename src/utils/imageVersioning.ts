/**
 * Image Versioning and Published Content Synchronization Helper
 *
 * Provides:
 * 1. Cross-tab synchronization via BroadcastChannel for instant cache invalidation
 * 2. URL versioning to prevent browser stale disk caching when images are updated
 * 3. Safe fast-cache helpers for synchronously hydrating published CMS content
 */

const SYNC_CHANNEL_NAME = "buyandsell_cms_published_sync";
const PUBLISHED_TIMESTAMP_KEY = "buyandsell_published_v_timestamp";

export interface PublishedSyncMessage {
  type: "homepage" | "learn-more" | "product" | "storefront" | "main-store" | "media";
  id?: string;
  timestamp: number;
}

let syncChannel: BroadcastChannel | null = null;

function getSyncChannel(): BroadcastChannel | null {
  if (typeof window === "undefined" || typeof BroadcastChannel === "undefined") {
    return null;
  }
  if (!syncChannel) {
    try {
      syncChannel = new BroadcastChannel(SYNC_CHANNEL_NAME);
    } catch {
      syncChannel = null;
    }
  }
  return syncChannel;
}

/**
 * Broadcast an update when content is saved or published in the Admin Dashboard
 */
export function broadcastPublishedUpdate(
  type: PublishedSyncMessage["type"],
  id?: string
): void {
  const timestamp = Date.now();
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(PUBLISHED_TIMESTAMP_KEY, String(timestamp));
    } catch {
      // ignore
    }

    const message: PublishedSyncMessage = { type, id, timestamp };

    const channel = getSyncChannel();
    if (channel) {
      try {
        channel.postMessage(message);
      } catch {
        // ignore
      }
    }

    // Also dispatch a window event in the current tab
    try {
      window.dispatchEvent(
        new CustomEvent("buyandsell:published-update", { detail: message })
      );
    } catch {
      // ignore
    }
  }
}

/**
 * Subscribe to published content updates across tabs and within the current tab
 */
export function subscribeToPublishedUpdates(
  callback: (message: PublishedSyncMessage) => void
): () => void {
  if (typeof window === "undefined") {
    return () => {};
  }

  const channel = getSyncChannel();
  const channelHandler = (event: MessageEvent<PublishedSyncMessage>) => {
    if (event?.data?.type) {
      callback(event.data);
    }
  };

  const windowHandler = (event: Event) => {
    const customEvent = event as CustomEvent<PublishedSyncMessage>;
    if (customEvent?.detail?.type) {
      callback(customEvent.detail);
    }
  };

  const storageHandler = (event: StorageEvent) => {
    if (event.key === PUBLISHED_TIMESTAMP_KEY) {
      callback({
        type: "homepage",
        timestamp: Number(event.newValue) || Date.now(),
      });
    }
  };

  if (channel) {
    channel.addEventListener("message", channelHandler);
  }
  window.addEventListener("buyandsell:published-update", windowHandler);
  window.addEventListener("storage", storageHandler);

  return () => {
    if (channel) {
      channel.removeEventListener("message", channelHandler);
    }
    window.removeEventListener("buyandsell:published-update", windowHandler);
    window.removeEventListener("storage", storageHandler);
  };
}

/**
 * Ensures an image URL has an attached cache-busting version parameter if it is a
 * frequently mutable Supabase storage URL or custom asset without an explicit timestamp.
 */
export function getVersionedImageUrl(url?: string | null, version?: number | string): string {
  if (!url) return "";
  const trimmed = url.trim();
  if (!trimmed) return "";

  // If it's a data URL, inline SVG or already has a timestamp or unique UUID in its filename, keep it clean
  if (
    trimmed.startsWith("data:") ||
    trimmed.startsWith("blob:") ||
    /\/\d{10,13}-[a-z0-9_-]+\.[a-z0-9]+$/i.test(trimmed) ||
    /\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.[a-z0-9]+$/i.test(trimmed)
  ) {
    return trimmed;
  }

  if (version) {
    const separator = trimmed.includes("?") ? "&" : "?";
    return `${trimmed}${separator}v=${version}`;
  }

  return trimmed;
}
