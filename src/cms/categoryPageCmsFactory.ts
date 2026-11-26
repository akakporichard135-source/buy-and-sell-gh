import { assertAdminAal2, isLocalAdminActive } from "../admin/adminAuthorization";
import { getSupabaseOrThrow, supabase } from "../lib/supabase";
import { broadcastPublishedUpdate, type PublishedSyncMessage } from "../utils/imageVersioning";

export interface CategoryPageCmsStoreOptions<T extends { hasDraft?: boolean; updatedAt?: string }> {
  label: string;
  supabaseKey: string;
  supabaseDraftKey: string;
  storageKey: string;
  storageDraftKey: string;
  storageLocalPubKey: string;
  broadcastType: PublishedSyncMessage["type"];
  defaultConfig: T;
  mergeWithDefaults: (incoming?: Partial<T> | null) => T;
  notifyListeners: () => void;
}

const readLocalJson = <T,>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
};

const writeLocalJson = <T,>(key: string, data: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {
    // ignore storage quota failures
  }
};

export function createCategoryPageCmsStore<T extends { hasDraft?: boolean; updatedAt?: string }>(
  opts: CategoryPageCmsStoreOptions<T>
) {
  const getInitial = (): T => {
    try {
      if (
        typeof window !== "undefined" &&
        (isLocalAdminActive() || localStorage.getItem("admin_preview_active") === "1")
      ) {
        const localPubRaw = localStorage.getItem(opts.storageLocalPubKey);
        if (localPubRaw && localPubRaw.startsWith("{")) {
          return opts.mergeWithDefaults(JSON.parse(localPubRaw) as Partial<T>);
        }
      }
    } catch {
      // ignore
    }
    return opts.mergeWithDefaults(readLocalJson<T>(opts.storageKey, opts.defaultConfig));
  };

  const getInitialDraft = (): T | null => {
    try {
      const raw = localStorage.getItem(opts.storageDraftKey);
      if (!raw) return null;
      return opts.mergeWithDefaults(JSON.parse(raw) as Partial<T>);
    } catch {
      return null;
    }
  };

  const fetchContent = async (): Promise<T> => {
    const mergedLocal = getInitial();
    try {
      if (
        typeof window !== "undefined" &&
        Boolean(localStorage.getItem(opts.storageLocalPubKey)) &&
        (isLocalAdminActive() || localStorage.getItem("admin_preview_active") === "1")
      ) {
        return mergedLocal;
      }
    } catch {
      // ignore
    }
    if (!supabase) return mergedLocal;

    try {
      const { data, error } = await supabase
        .from("storefront_content")
        .select("config")
        .eq("key", opts.supabaseKey)
        .maybeSingle();

      if (!error && data?.config) {
        const merged = opts.mergeWithDefaults(data.config as Partial<T>);
        writeLocalJson(opts.storageKey, merged);
        return merged;
      }
    } catch {
      // Non-blocking fallback
    }
    return mergedLocal;
  };

  const fetchDraft = async (): Promise<T | null> => {
    const localDraft = getInitialDraft();
    if (isLocalAdminActive() || !supabase) return localDraft;

    try {
      const { data, error } = await supabase
        .from("storefront_content")
        .select("config")
        .eq("key", opts.supabaseDraftKey)
        .maybeSingle();

      if (!error && data?.config) {
        const merged = opts.mergeWithDefaults({
          ...(data.config as Partial<T>),
          hasDraft: true,
        });
        writeLocalJson(opts.storageDraftKey, merged);
        return merged;
      }
    } catch {
      // Non-blocking fallback
    }
    return localDraft;
  };

  const saveDraft = async (config: T): Promise<T> => {
    await assertAdminAal2();
    const normalized = opts.mergeWithDefaults({
      ...config,
      hasDraft: true,
      updatedAt: new Date().toISOString(),
    });

    if (isLocalAdminActive()) {
      writeLocalJson(opts.storageDraftKey, normalized);
      opts.notifyListeners();
      return normalized;
    }

    const client = getSupabaseOrThrow();
    const { error } = await client.from("storefront_content").upsert({
      key: opts.supabaseDraftKey,
      config: normalized,
      updated_at: normalized.updatedAt,
    });

    if (error) {
      throw new Error(
        `Failed to save ${opts.label} draft to Supabase (${error.message}, code: ${error.code || "ERR"}).`
      );
    }

    writeLocalJson(opts.storageDraftKey, normalized);
    opts.notifyListeners();
    return normalized;
  };

  const discardDraft = async (): Promise<void> => {
    await assertAdminAal2();
    try {
      localStorage.removeItem(opts.storageDraftKey);
    } catch {
      // ignore
    }
    if (!isLocalAdminActive() && supabase) {
      try {
        await supabase.from("storefront_content").delete().eq("key", opts.supabaseDraftKey);
      } catch {
        // ignore
      }
    }
    opts.notifyListeners();
  };

  const saveContent = async (config: T): Promise<T> => {
    await assertAdminAal2();
    const normalized = opts.mergeWithDefaults({
      ...config,
      hasDraft: false,
      updatedAt: new Date().toISOString(),
    });

    if (isLocalAdminActive()) {
      writeLocalJson(opts.storageKey, normalized);
      writeLocalJson(opts.storageLocalPubKey, normalized);
      try {
        localStorage.removeItem(opts.storageDraftKey);
      } catch {
        // ignore
      }
      broadcastPublishedUpdate(opts.broadcastType);
      opts.notifyListeners();
      return normalized;
    }

    const client = getSupabaseOrThrow();
    const { error } = await client.from("storefront_content").upsert({
      key: opts.supabaseKey,
      config: normalized,
      updated_at: normalized.updatedAt,
    });

    if (error) {
      throw new Error(
        `Failed to publish ${opts.label} configuration to Supabase (${error.message}, code: ${error.code || "ERR"}).`
      );
    }

    try {
      await client.from("storefront_content").delete().eq("key", opts.supabaseDraftKey);
    } catch {
      // ignore
    }

    writeLocalJson(opts.storageKey, normalized);
    try {
      localStorage.removeItem(opts.storageDraftKey);
    } catch {
      // ignore
    }
    broadcastPublishedUpdate(opts.broadcastType);
    opts.notifyListeners();
    return normalized;
  };

  return {
    getInitial,
    getInitialDraft,
    fetchContent,
    fetchDraft,
    saveDraft,
    discardDraft,
    saveContent,
  };
}
