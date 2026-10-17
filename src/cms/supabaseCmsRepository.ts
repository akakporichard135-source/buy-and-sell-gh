import { getSupabaseOrThrow, productImagesBucket, supabase } from "../lib/supabase";
import { assertAdminAal2 } from "../admin/adminAuthorization";
import { CATEGORY_DEPARTMENTS } from "../components/store/category/categoryData";
import {
  defaultFaqs,
  defaultHomepageContent,
  defaultMediaItems,
  defaultPageContent,
  defaultSiteSettings,
} from "./defaultCmsData";
import type {
  CategoryDepartmentConfig,
  FaqItem,
  HomepageContent,
  MediaItem,
  PageContentRegistry,
  SiteSettings,
} from "./types";

const CMS_STORAGE_KEY_SETTINGS = "buyandsell_cms_settings_v1";
const CMS_STORAGE_KEY_HOMEPAGE = "buyandsell_cms_homepage_v1";
const CMS_STORAGE_KEY_MEDIA = "buyandsell_cms_media_v1";
const CMS_STORAGE_KEY_FAQS = "buyandsell_cms_faqs_v1";
const CMS_STORAGE_KEY_PAGES = "buyandsell_cms_pages_v1";
const CMS_STORAGE_KEY_STOREFRONT = "buyandsell_cms_storefront_v1";

// Cache listeners for reactive UI across tabs and components
type CmsListener = () => void;
const listeners: Set<CmsListener> = new Set();
export const subscribeToCms = (listener: CmsListener) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};
const notifyListeners = () => {
  listeners.forEach((fn) => {
    try {
      fn();
    } catch {
      // ignore
    }
  });
};

// Safe LocalStorage helpers (used as client cache only, never authoritative over Supabase)
const readLocal = <T>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
};

const writeLocal = <T>(key: string, data: T) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {
    // ignore
  }
};

const sanitizeSiteSettings = (settings: SiteSettings): SiteSettings => {
  const oldPhoneDigits = "0244182149";
  const oldWaDigits = "233244182149";
  const newPhone = "055 197 5451";
  const newWa = "233551975451";

  const rawPhones = Array.isArray(settings.phones) ? settings.phones : [];
  const phones = rawPhones
    .map((p) => (p.replace(/\s+/g, "") === oldPhoneDigits ? newPhone : p))
    .filter((p, i, arr) => arr.indexOf(p) === i);
  if (phones.length === 0) phones.push(newPhone);

  const primary = (settings.whatsapp?.primary || "").replace(/\s+/g, "").replace(/^\+/, "");
  const secondary = (settings.whatsapp?.secondary || "").replace(/\s+/g, "").replace(/^\+/, "");

  return {
    ...settings,
    phones,
    whatsapp: {
      primary: primary === oldWaDigits || !primary ? newWa : primary,
      secondary: secondary === oldWaDigits || !secondary ? newWa : secondary,
    },
  };
};

// 1. SITE SETTINGS
export const fetchSiteSettings = async (): Promise<SiteSettings> => {
  const local = sanitizeSiteSettings(readLocal<SiteSettings>(CMS_STORAGE_KEY_SETTINGS, defaultSiteSettings));
  if (!supabase) return local;

  try {
    const { data, error } = await supabase
      .from("site_settings")
      .select("settings")
      .eq("id", "global")
      .maybeSingle();

    if (!error && data?.settings) {
      const merged = sanitizeSiteSettings({ ...defaultSiteSettings, ...(data.settings as Partial<SiteSettings>) });
      writeLocal(CMS_STORAGE_KEY_SETTINGS, merged);
      return merged;
    }
  } catch {
    // Non-blocking fallback to default/local cache
  }

  return local;
};

export const saveSiteSettings = async (settings: Partial<SiteSettings>): Promise<SiteSettings> => {
  await assertAdminAal2();
  const client = getSupabaseOrThrow();
  const current = await fetchSiteSettings();
  const updated: SiteSettings = {
    ...current,
    ...settings,
    whatsapp: {
      ...current.whatsapp,
      ...(settings.whatsapp ?? {}),
    },
    social: {
      ...current.social,
      ...(settings.social ?? {}),
    },
  };

  const { error } = await client.from("site_settings").upsert({
    id: "global",
    settings: updated,
    updated_at: new Date().toISOString(),
  });

  if (error) {
    throw new Error(
      `Failed to save site settings to Supabase (${error.message}, code: ${error.code || "ERR"}). Ensure migration 016 has been run in Supabase SQL Editor.`
    );
  }

  // Only update client cache after authoritative Supabase write succeeds
  writeLocal(CMS_STORAGE_KEY_SETTINGS, updated);
  notifyListeners();
  return updated;
};

// 2. HOMEPAGE CONTENT
export const fetchHomepageContent = async (): Promise<HomepageContent> => {
  const local = readLocal<HomepageContent>(CMS_STORAGE_KEY_HOMEPAGE, defaultHomepageContent);
  if (!supabase) return local;

  try {
    const { data, error } = await supabase
      .from("homepage_content")
      .select("content")
      .eq("id", "main")
      .maybeSingle();

    if (!error && data?.content) {
      const savedContent = data.content as Partial<HomepageContent>;
      const normalizeSecondary = <T extends { id: string; secondary?: { label: string; to: string } }>(item: T): T => {
        if (item.id === "iphone-duo") return item;
        if (item.secondary && item.secondary.label === "View pricing") {
          return {
            ...item,
            secondary: {
              ...item.secondary,
              label: "Buy",
            },
          };
        }
        return item;
      };

      const mergedHeroes = (savedContent.heroes || defaultHomepageContent.heroes).map((h) => {
        const def = defaultHomepageContent.heroes.find((d) => d.id === h.id);
        const combined = {
          ...def,
          ...h,
          mobileImage: h.mobileImage || def?.mobileImage,
        };
        return normalizeSecondary(combined);
      });

      const mergedTiles = (savedContent.tiles || defaultHomepageContent.tiles).map((t) => {
        const def = defaultHomepageContent.tiles.find((d) => d.id === t.id);
        const combined = { ...def, ...t };
        return normalizeSecondary(combined);
      });

      const merged: HomepageContent = {
        ...defaultHomepageContent,
        ...savedContent,
        heroes: mergedHeroes,
        tiles: mergedTiles,
      };
      writeLocal(CMS_STORAGE_KEY_HOMEPAGE, merged);
      return merged;
    }
  } catch {
    // Non-blocking fallback
  }

  return local;
};

export const saveHomepageContent = async (
  content: HomepageContent
): Promise<HomepageContent> => {
  await assertAdminAal2();
  const client = getSupabaseOrThrow();

  const { error } = await client.from("homepage_content").upsert({
    id: "main",
    content,
    updated_at: new Date().toISOString(),
  });

  if (error) {
    throw new Error(
      `Failed to save homepage changes to Supabase (${error.message}, code: ${error.code || "ERR"}). Ensure migration 016 has been run in Supabase SQL Editor.`
    );
  }

  // Only update client cache after authoritative Supabase write succeeds
  writeLocal(CMS_STORAGE_KEY_HOMEPAGE, content);
  notifyListeners();
  return content;
};

// 3. MEDIA LIBRARY
const CMS_STORAGE_KEY_DELETED_MEDIA = "buyandsellgh_cms_deleted_media_ids_v1";

export const getDeletedMediaIds = (): Set<string> => {
  const local = readLocal<string[]>(CMS_STORAGE_KEY_DELETED_MEDIA, []);
  return new Set(local);
};

export const recordDeletedMediaId = async (id: string): Promise<void> => {
  const current = getDeletedMediaIds();
  current.add(id);
  const arr = Array.from(current);
  writeLocal(CMS_STORAGE_KEY_DELETED_MEDIA, arr);

  // Best-effort sync to site_settings so deletion persists across devices
  try {
    const settings = await fetchSiteSettings();
    const updated = Array.from(new Set([...(settings.deletedMediaIds || []), id]));
    await saveSiteSettings({ ...settings, deletedMediaIds: updated });
  } catch {
    // Non-blocking fallback
  }
};

export interface MediaAssetUsage {
  location: string;
  type: "hero" | "tile" | "flyer" | "storefront" | "brand" | "settings";
  identifier: string;
}

export const getMediaAssetUsages = (
  item: MediaItem,
  homepage?: HomepageContent | null,
  storefront?: Record<string, CategoryDepartmentConfig> | null,
  settings?: SiteSettings | null
): MediaAssetUsage[] => {
  const usages: MediaAssetUsage[] = [];
  if (!item) return usages;

  const cleanUrl = (u?: string) => (u || "").trim().toLowerCase();
  const itemUrl = cleanUrl(item.url);
  const itemFilename = (item.filename || "").toLowerCase();

  const urlMatches = (candidate?: string) => {
    if (!candidate) return false;
    const c = cleanUrl(candidate);
    if (c === itemUrl) return true;
    if (itemUrl.length > 5 && c.endsWith(itemUrl)) return true;
    if (c.length > 5 && itemUrl.endsWith(c)) return true;
    if (itemFilename && itemFilename.length > 5 && c.includes(itemFilename)) return true;
    return false;
  };

  // 1. Homepage Heroes
  if (homepage?.heroes) {
    for (const hero of homepage.heroes) {
      const desktopMatch =
        urlMatches(hero.image) ||
        (item.id === "media-hero-iphone18" && hero.id === "iphone-18-pro") ||
        (item.id.startsWith("media-hero-") && !item.id.endsWith("-mobile") && hero.id === item.id.replace("media-hero-", ""));

      const mobileMatch =
        urlMatches(hero.mobileImage) ||
        (item.id === "media-hero-iphone18-mobile" && hero.id === "iphone-18-pro") ||
        (item.id.startsWith("media-hero-") && item.id.endsWith("-mobile") && hero.id === item.id.replace("media-hero-", "").replace("-mobile", ""));

      if (desktopMatch) {
        usages.push({
          location: `Homepage Hero Banner (Desktop): "${hero.title || hero.id}"`,
          type: "hero",
          identifier: `${hero.id}-desktop`,
        });
      }
      if (mobileMatch) {
        usages.push({
          location: `Homepage Hero Banner (Mobile): "${hero.title || hero.id}"`,
          type: "hero",
          identifier: `${hero.id}-mobile`,
        });
      }
    }
  }

  // 2. Promotional Tiles
  if (homepage?.tiles) {
    for (const tile of homepage.tiles) {
      const matches =
        urlMatches(tile.image) ||
        (item.id.startsWith("media-tile-") && tile.id === item.id.replace("media-tile-", "")) ||
        (item.id === "media-tile-ipad-air" && tile.id === "ipad-air") ||
        (item.id === "media-product-ipad-air-white" && tile.id === "ipad-air");
      if (matches) {
        usages.push({
          location: `Promotional Tile: "${tile.title || tile.id}"`,
          type: "tile",
          identifier: tile.id,
        });
      }
    }
  }

  // 3. Service Flyers
  if (homepage?.serviceFlyers) {
    for (const flyer of homepage.serviceFlyers) {
      const matches =
        urlMatches(flyer.image) ||
        (item.id.startsWith("media-flyer-") && flyer.id === item.id.replace("media-flyer-", "")) ||
        (item.id === "media-flyer-repairs" && flyer.id === "flyer-repairs") ||
        (item.id === "media-flyer-installment" && flyer.id === "flyer-installment") ||
        (item.id === "media-flyer-tradein" && flyer.id === "flyer-tradein") ||
        (item.id === "media-flyer-sell" && flyer.id === "flyer-sell") ||
        (item.id === "media-flyer-refer" && flyer.id === "flyer-refer");
      if (matches) {
        usages.push({
          location: `Service Flyer: "${flyer.title || flyer.id}"`,
          type: "flyer",
          identifier: flyer.id,
        });
      }
    }
  }

  // 4. Storefront Featured Cards
  if (storefront) {
    for (const [deptKey, dept] of Object.entries(storefront)) {
      if (dept?.featuredCards) {
        for (const card of dept.featuredCards) {
          const matches =
            urlMatches(card.image) ||
            (item.id === "media-tile-ipad-air" && card.id?.includes("ipad-air")) ||
            (item.id === "media-product-ipad-air-colors" && (urlMatches(card.image) || card.id?.includes("ipad-air")));
          if (matches) {
            usages.push({
              location: `Storefront [${dept.label || deptKey}] Featured Card: "${card.title || card.id}"`,
              type: "storefront",
              identifier: card.id || deptKey,
            });
          }
        }
      }
    }
  }

  // 5. Brand Identity Assets
  if (
    item.category === "brand" ||
    item.id === "media-brand-logo" ||
    item.id === "media-brand-owner" ||
    item.id === "media-brand-rollup"
  ) {
    usages.push({
      location: `Brand Identity Asset (${item.title || "Primary Brand Logo / Seal"})`,
      type: "brand",
      identifier: item.id,
    });
  }

  return usages;
};

export const mergeMediaItems = (
  primary: MediaItem[],
  defaults: MediaItem[],
  deletedIds?: Set<string>
): MediaItem[] => {
  const map = new Map<string, MediaItem>();
  // 1. Seed defaults first (skipping deleted)
  for (const item of defaults) {
    if (!deletedIds || !deletedIds.has(item.id)) {
      map.set(item.id, item);
    }
  }
  // 2. Overlay primary (skipping deleted)
  for (const item of primary) {
    if (!deletedIds || !deletedIds.has(item.id)) {
      map.set(item.id, item);
    }
  }
  return Array.from(map.values());
};

export const syncMissingMediaToSupabase = async (missingItems: MediaItem[]): Promise<void> => {
  if (!supabase || missingItems.length === 0) return;
  try {
    const deletedIds = getDeletedMediaIds();
    const toInsert = missingItems.filter((item) => !deletedIds.has(item.id));
    if (toInsert.length === 0) return;

    const rows = toInsert.map((item) => ({
      id: item.id,
      title: item.title,
      filename: item.filename,
      url: item.url,
      storage_path: item.storagePath || null,
      file_size: item.fileSize || null,
      mime_type: item.mimeType || "image/webp",
      category: item.category,
      alt: item.alt || "",
      fit: item.fit || "contain",
      position: item.position || "center",
      created_at: item.createdAt || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));

    await supabase.from("media_library").upsert(rows, { onConflict: "id", ignoreDuplicates: true });
  } catch {
    // Non-blocking fallback if unauthenticated
  }
};

export const fetchMediaLibrary = async (): Promise<MediaItem[]> => {
  const deletedIds = getDeletedMediaIds();
  const localSettings = readLocal<SiteSettings>(CMS_STORAGE_KEY_SETTINGS, defaultSiteSettings);
  if (localSettings?.deletedMediaIds) {
    localSettings.deletedMediaIds.forEach((id) => deletedIds.add(id));
  }

  const rawLocal = readLocal<MediaItem[]>(CMS_STORAGE_KEY_MEDIA, defaultMediaItems);
  const local = mergeMediaItems(rawLocal, defaultMediaItems, deletedIds);
  if (!supabase) return local;

  try {
    const { data, error } = await supabase
      .from("media_library")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      const mapped: MediaItem[] = data.map((row) => ({
        id: row.id,
        title: row.title || row.filename,
        filename: row.filename,
        url: row.url,
        storagePath: row.storage_path,
        fileSize: row.file_size,
        mimeType: row.mime_type || "image/jpeg",
        category: row.category || "other",
        alt: row.alt || "",
        fit: row.fit || "cover",
        position: row.position || "center",
        createdAt: row.created_at || new Date().toISOString(),
        updatedAt: row.updated_at || new Date().toISOString(),
      }));

      // Filter out deleted IDs from database records as well
      const activeMapped = mapped.filter((m) => !deletedIds.has(m.id));
      const completeList = mergeMediaItems(activeMapped, defaultMediaItems, deletedIds);
      writeLocal(CMS_STORAGE_KEY_MEDIA, completeList);

      // Check if any default items are missing from Supabase (excluding deleted items)
      const dbIds = new Set(mapped.map((m) => m.id));
      const missingFromDb = defaultMediaItems.filter(
        (d) => !dbIds.has(d.id) && !deletedIds.has(d.id)
      );

      if (missingFromDb.length > 0) {
        syncMissingMediaToSupabase(missingFromDb).catch(() => {});
      }

      return completeList;
    }
  } catch {
    // Non-blocking fallback
  }

  writeLocal(CMS_STORAGE_KEY_MEDIA, local);
  return local;
};

export const saveMediaItem = async (item: MediaItem): Promise<MediaItem> => {
  await assertAdminAal2();
  const client = getSupabaseOrThrow();

  const { error } = await client.from("media_library").upsert({
    id: item.id,
    title: item.title,
    filename: item.filename,
    url: item.url,
    storage_path: item.storagePath,
    file_size: item.fileSize,
    mime_type: item.mimeType,
    category: item.category,
    alt: item.alt,
    fit: item.fit,
    position: item.position,
    updated_at: new Date().toISOString(),
  });

  if (error) {
    throw new Error(
      `Failed to save media asset to Supabase (${error.message}, code: ${error.code || "ERR"}). Ensure migration 016 has been run in Supabase SQL Editor.`
    );
  }

  const current = await fetchMediaLibrary();
  const existingIndex = current.findIndex((m) => m.id === item.id);
  const updatedList =
    existingIndex >= 0
      ? current.map((m) => (m.id === item.id ? item : m))
      : [item, ...current];

  writeLocal(CMS_STORAGE_KEY_MEDIA, updatedList);
  notifyListeners();
  return item;
};

export const removeMediaItemFromLibrary = async (id: string): Promise<void> => {
  await assertAdminAal2();
  const client = getSupabaseOrThrow();
  const current = await fetchMediaLibrary();
  const target = current.find((m) => m.id === id);

  if (!target) {
    throw new Error(`Media asset with ID "${id}" was not found.`);
  }

  // Remove metadata row from Supabase media_library table (verified)
  const { data: existingRow } = await client
    .from("media_library")
    .select("id")
    .eq("id", id)
    .maybeSingle();

  if (existingRow) {
    const { data: deletedRows, error: deleteErr } = await client
      .from("media_library")
      .delete()
      .eq("id", id)
      .select();

    if (deleteErr) {
      throw new Error(`Failed to remove media asset from Supabase: ${deleteErr.message}`);
    }

    if (!deletedRows || deletedRows.length === 0) {
      throw new Error(
        "Supabase security policy prevented removing this media asset. Ensure you are signed in with an active AAL2 administrator session."
      );
    }
  }

  // Record deleted ID to prevent resurrection from defaultMediaItems or database sync
  await recordDeletedMediaId(id);

  // Update local cache and notify listeners without touching storage files or public references
  const updatedList = current.filter((m) => m.id !== id);
  writeLocal(CMS_STORAGE_KEY_MEDIA, updatedList);
  notifyListeners();
};

export const deleteMediaItemPermanently = async (id: string): Promise<void> => {
  await assertAdminAal2();
  const client = getSupabaseOrThrow();
  const current = await fetchMediaLibrary();
  const target = current.find((m) => m.id === id);

  if (!target) {
    throw new Error(`Media asset with ID "${id}" was not found.`);
  }

  // Safety Check: In-Use Protection
  const [homepage, storefront, settings] = await Promise.all([
    fetchHomepageContent(),
    fetchStorefrontContent(),
    fetchSiteSettings(),
  ]);

  const usages = getMediaAssetUsages(target, homepage, storefront, settings);
  if (usages.length > 0) {
    const locationsSummary = usages.map((u) => u.location).join(", ");
    throw new Error(
      `Cannot delete "${target.title}" permanently: this asset is actively used on the live website in ${locationsSummary}. To delete permanently, replace or unlink it first, or use "Remove from Library" to safely hide it from this view.`
    );
  }

  // Safe Storage Deletion: Only remove managed uploads from storage, and only if not shared
  if (target.storagePath && target.storagePath.startsWith("media/")) {
    const isShared = current.some((m) => m.id !== id && m.storagePath === target.storagePath);
    if (!isShared) {
      const { error: removeErr } = await client.storage
        .from(productImagesBucket)
        .remove([target.storagePath]);
      if (removeErr) {
        console.warn("Storage removal warning:", removeErr.message);
      }
    }
  }

  // Delete from Supabase media_library table with verification
  const { data: existingRow } = await client
    .from("media_library")
    .select("id")
    .eq("id", id)
    .maybeSingle();

  if (existingRow) {
    const { data: deletedRows, error: deleteErr } = await client
      .from("media_library")
      .delete()
      .eq("id", id)
      .select();

    if (deleteErr) {
      throw new Error(`Failed to delete media asset from Supabase: ${deleteErr.message}`);
    }

    if (!deletedRows || deletedRows.length === 0) {
      throw new Error(
        "Supabase security policy prevented deleting this media asset. Ensure you are signed in with an active AAL2 administrator session."
      );
    }
  }

  // Record deleted ID to prevent resurrection from defaultMediaItems
  await recordDeletedMediaId(id);

  const updatedList = current.filter((m) => m.id !== id);
  writeLocal(CMS_STORAGE_KEY_MEDIA, updatedList);
  notifyListeners();
};

export const deleteMediaItemById = deleteMediaItemPermanently;

const imageExtensions: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
};

const hasValidImageSignature = async (file: File): Promise<boolean> => {
  const bytes = new Uint8Array(await file.slice(0, 16).arrayBuffer());
  if (file.type === "image/jpeg") {
    return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  }
  if (file.type === "image/png") {
    return [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a].every(
      (v, i) => bytes[i] === v
    );
  }
  if (file.type === "image/webp") {
    return (
      String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" &&
      String.fromCharCode(...bytes.slice(8, 12)) === "WEBP"
    );
  }
  if (file.type === "image/avif") {
    return (
      String.fromCharCode(...bytes.slice(4, 8)) === "ftyp" &&
      ["avif", "avis"].includes(String.fromCharCode(...bytes.slice(8, 12)))
    );
  }
  return false;
};

export const uploadMediaAsset = async (
  file: File,
  category: MediaItem["category"] = "other",
  customTitle?: string
): Promise<MediaItem> => {
  await assertAdminAal2();
  const client = getSupabaseOrThrow();

  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/avif"];
  const maxBytes = 5 * 1024 * 1024; // 5 MB

  if (!allowedTypes.includes(file.type)) {
    throw new Error("Only JPEG, PNG, WebP and AVIF formats are allowed.");
  }
  if (file.size > maxBytes) {
    throw new Error("Image file exceeds the 5MB upload limit.");
  }
  if (!(await hasValidImageSignature(file))) {
    throw new Error("Invalid image header signature. Please choose an authentic image file.");
  }

  const ext = imageExtensions[file.type] || "jpg";
  const cleanBase = file.name
    .toLowerCase()
    .replace(/\.[^.]+$/, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60) || "asset";
  const safeFilename = `${cleanBase}.${ext}`;
  const storagePath = `media/${category}/${Date.now()}-${safeFilename}`;

  const { error: uploadErr } = await client.storage
    .from(productImagesBucket)
    .upload(storagePath, file, {
      cacheControl: "31536000",
      upsert: false,
      contentType: file.type,
    });

  if (uploadErr) {
    throw new Error(`Failed to upload asset to Supabase Storage: ${uploadErr.message}`);
  }

  const { data: urlData } = client.storage
    .from(productImagesBucket)
    .getPublicUrl(storagePath);

  const newMediaItem: MediaItem = {
    id: `media-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    title: customTitle || file.name.replace(/\.[^.]+$/, ""),
    filename: file.name,
    url: urlData.publicUrl,
    storagePath,
    fileSize: file.size,
    mimeType: file.type,
    category,
    alt: customTitle || `${file.name} asset`,
    fit: "cover",
    position: "center",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await saveMediaItem(newMediaItem);
  return newMediaItem;
};

export const updateMediaAsset = async (
  id: string,
  updates: {
    title?: string;
    alt?: string;
    category?: MediaItem["category"];
    fit?: "cover" | "contain";
    position?: "center" | "top" | "bottom";
  },
  replacementFile?: File
): Promise<MediaItem> => {
  await assertAdminAal2();
  const client = getSupabaseOrThrow();

  const currentList = await fetchMediaLibrary();
  const existing = currentList.find((m) => m.id === id);
  if (!existing) {
    throw new Error(`Media asset with ID "${id}" was not found.`);
  }

  let finalUrl = existing.url;
  let finalStoragePath = existing.storagePath;
  let finalFileSize = existing.fileSize;
  let finalMimeType = existing.mimeType;
  let finalFilename = existing.filename;

  if (replacementFile) {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/avif"];
    const maxBytes = 5 * 1024 * 1024; // 5 MB

    if (!allowedTypes.includes(replacementFile.type)) {
      throw new Error("Only JPEG, PNG, WebP and AVIF formats are allowed.");
    }
    if (replacementFile.size > maxBytes) {
      throw new Error("Replacement image exceeds the 5MB upload limit.");
    }
    if (!(await hasValidImageSignature(replacementFile))) {
      throw new Error("Invalid image header signature. Please choose an authentic image file.");
    }

    const cat = updates.category || existing.category || "other";
    const ext = imageExtensions[replacementFile.type] || "jpg";
    const cleanBase = replacementFile.name
      .toLowerCase()
      .replace(/\.[^.]+$/, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 60) || "asset";
    const safeFilename = `${cleanBase}.${ext}`;
    const storagePath = `media/${cat}/${Date.now()}-${safeFilename}`;

    const { error: uploadErr } = await client.storage
      .from(productImagesBucket)
      .upload(storagePath, replacementFile, {
        cacheControl: "31536000",
        upsert: false,
        contentType: replacementFile.type,
      });

    if (uploadErr) {
      throw new Error(`Failed to upload replacement asset to Supabase Storage: ${uploadErr.message}`);
    }

    const { data: urlData } = client.storage
      .from(productImagesBucket)
      .getPublicUrl(storagePath);

    // If there was an old Supabase storage object, remove it
    if (existing.storagePath && existing.storagePath.startsWith("media/")) {
      await client.storage.from(productImagesBucket).remove([existing.storagePath]).catch(() => {});
    }

    finalUrl = urlData.publicUrl;
    finalStoragePath = storagePath;
    finalFileSize = replacementFile.size;
    finalMimeType = replacementFile.type;
    finalFilename = replacementFile.name;
  }

  const updatedItem: MediaItem = {
    ...existing,
    title: updates.title !== undefined ? updates.title.trim() : existing.title,
    alt: updates.alt !== undefined ? updates.alt.trim() : existing.alt,
    category: updates.category || existing.category,
    fit: updates.fit || existing.fit || "cover",
    position: updates.position || existing.position || "center",
    url: finalUrl,
    filename: finalFilename,
    storagePath: finalStoragePath,
    fileSize: finalFileSize,
    mimeType: finalMimeType,
    updatedAt: new Date().toISOString(),
  };

  const { error: dbErr } = await client.from("media_library").upsert({
    id: updatedItem.id,
    title: updatedItem.title,
    filename: updatedItem.filename,
    url: updatedItem.url,
    storage_path: updatedItem.storagePath,
    file_size: updatedItem.fileSize,
    mime_type: updatedItem.mimeType,
    category: updatedItem.category,
    alt: updatedItem.alt,
    fit: updatedItem.fit,
    position: updatedItem.position,
    updated_at: updatedItem.updatedAt,
  });

  if (dbErr) {
    throw new Error(`Failed to save asset updates to Supabase (${dbErr.message}).`);
  }

  const updatedList = currentList.map((m) => (m.id === id ? updatedItem : m));
  writeLocal(CMS_STORAGE_KEY_MEDIA, updatedList);
  notifyListeners();

  if (finalUrl !== existing.url) {
    await cascadeMediaUrlUpdate(existing, updatedItem, updates);
  }

  return updatedItem;
};

// 4. FAQS
export const fetchFaqs = async (): Promise<FaqItem[]> => {
  const local = readLocal<FaqItem[]>(CMS_STORAGE_KEY_FAQS, defaultFaqs);
  if (!supabase) return local;

  try {
    const { data, error } = await supabase
      .from("site_faqs")
      .select("*")
      .order("order", { ascending: true });

    if (!error && data && data.length > 0) {
      writeLocal(CMS_STORAGE_KEY_FAQS, data);
      return data as FaqItem[];
    }
  } catch {
    // Non-blocking fallback
  }

  return local;
};

export const saveFaqs = async (faqs: FaqItem[]): Promise<FaqItem[]> => {
  await assertAdminAal2();
  const client = getSupabaseOrThrow();

  const { error } = await client.from("site_faqs").upsert(faqs);
  if (error) {
    throw new Error(
      `Failed to save FAQs to Supabase (${error.message}, code: ${error.code || "ERR"}). Ensure migration 016 has been run in Supabase SQL Editor.`
    );
  }

  writeLocal(CMS_STORAGE_KEY_FAQS, faqs);
  notifyListeners();
  return faqs;
};

// 5. PAGE CONTENT (About, Repairs, Trade-In)
export const fetchPageContent = async (): Promise<PageContentRegistry> => {
  const local = readLocal<PageContentRegistry>(CMS_STORAGE_KEY_PAGES, defaultPageContent);
  if (!supabase) return local;

  try {
    const { data, error } = await supabase
      .from("page_content")
      .select("id, content");

    if (!error && data && data.length > 0) {
      const merged = { ...defaultPageContent };
      data.forEach((row) => {
        if (row.id === "about") merged.about = row.content;
        if (row.id === "repairs") merged.repairs = row.content;
        if (row.id === "tradeIn") merged.tradeIn = row.content;
      });
      writeLocal(CMS_STORAGE_KEY_PAGES, merged);
      return merged;
    }
  } catch {
    // Non-blocking fallback
  }

  return local;
};

export const savePageContent = async <K extends keyof PageContentRegistry>(
  key: K,
  content: PageContentRegistry[K]
): Promise<PageContentRegistry[K]> => {
  await assertAdminAal2();
  const client = getSupabaseOrThrow();

  const { error } = await client.from("page_content").upsert({
    id: key,
    content,
    updated_at: new Date().toISOString(),
  });

  if (error) {
    throw new Error(
      `Failed to save ${String(key)} page content to Supabase (${error.message}, code: ${error.code || "ERR"}). Ensure migration 016 has been run in Supabase SQL Editor.`
    );
  }

  const current = await fetchPageContent();
  const updated = { ...current, [key]: content };
  writeLocal(CMS_STORAGE_KEY_PAGES, updated);
  notifyListeners();
  return content;
};

// 6. STOREFRONT CONTENT (Category Departments & Showcase Collections)
export const fetchStorefrontContent = async (): Promise<Record<string, CategoryDepartmentConfig>> => {
  const mergeWithDefaults = (source: Record<string, CategoryDepartmentConfig>) => {
    const res: Record<string, CategoryDepartmentConfig> = { ...CATEGORY_DEPARTMENTS };
    for (const [key, def] of Object.entries(CATEGORY_DEPARTMENTS)) {
      const s = source[key];
      if (s) {
        res[key] = {
          ...def,
          ...s,
          featuredCards: s.featuredCards && s.featuredCards.length > 0 ? s.featuredCards : def.featuredCards,
          accessoryOverrides: {
            ...(def.accessoryOverrides || {}),
            ...(s.accessoryOverrides || {}),
          },
        };
      }
    }
    return res;
  };

  const local = readLocal<Record<string, CategoryDepartmentConfig>>(CMS_STORAGE_KEY_STOREFRONT, CATEGORY_DEPARTMENTS);
  const mergedLocal = mergeWithDefaults(local);
  if (!supabase) return mergedLocal;

  try {
    const { data, error } = await supabase
      .from("storefront_content")
      .select("config")
      .eq("key", "departments")
      .maybeSingle();

    if (!error && data?.config) {
      const merged = mergeWithDefaults(data.config as Record<string, CategoryDepartmentConfig>);
      writeLocal(CMS_STORAGE_KEY_STOREFRONT, merged);
      return merged;
    }
  } catch {
    // Non-blocking fallback
  }

  return mergedLocal;
};

export const saveStorefrontContent = async (
  departments: Record<string, CategoryDepartmentConfig>
): Promise<Record<string, CategoryDepartmentConfig>> => {
  await assertAdminAal2();
  const client = getSupabaseOrThrow();

  const { error } = await client.from("storefront_content").upsert({
    key: "departments",
    config: departments,
    updated_at: new Date().toISOString(),
  });

  if (error) {
    throw new Error(
      `Failed to save storefront departments to Supabase (${error.message}, code: ${error.code || "ERR"}). Ensure migration 016 has been run in Supabase SQL Editor.`
    );
  }

  writeLocal(CMS_STORAGE_KEY_STOREFRONT, departments);
  notifyListeners();
  return departments;
};

// Cascades replaced media URLs to homepage content and storefront departments
async function cascadeMediaUrlUpdate(
  oldItem: MediaItem,
  newItem: MediaItem,
  updates: { alt?: string }
): Promise<void> {
  if (newItem.url === oldItem.url) return;

  try {
    // 1. Homepage content cascade (heroes, tiles, service flyers)
    const currentHomepage = await fetchHomepageContent();
    let homepageChanged = false;

    const updatedHeroes = currentHomepage.heroes.map((hero) => {
      let heroUpdated = false;
      let newImage = hero.image;
      let newMobile = hero.mobileImage;

      const isDesktopMatch =
        hero.image === oldItem.url ||
        (oldItem.id === "media-hero-iphone18" && hero.id === "iphone-18-pro") ||
        (oldItem.id.startsWith("media-hero-") && !oldItem.id.endsWith("-mobile") && hero.id === oldItem.id.replace("media-hero-", ""));

      const isMobileMatch =
        hero.mobileImage === oldItem.url ||
        (oldItem.id === "media-hero-iphone18-mobile" && hero.id === "iphone-18-pro") ||
        (oldItem.id.startsWith("media-hero-") && oldItem.id.endsWith("-mobile") && hero.id === oldItem.id.replace("media-hero-", "").replace("-mobile", ""));

      if (isDesktopMatch) {
        newImage = newItem.url;
        heroUpdated = true;
      }
      if (isMobileMatch) {
        newMobile = newItem.url;
        heroUpdated = true;
      }
      if (heroUpdated) {
        homepageChanged = true;
        return {
          ...hero,
          image: newImage,
          mobileImage: newMobile,
          alt: updates.alt !== undefined ? updates.alt.trim() : hero.alt,
        };
      }
      return hero;
    });

    const updatedTiles = currentHomepage.tiles.map((tile) => {
      if (
        tile.image === oldItem.url ||
        (oldItem.id === "media-tile-ipad-air" && tile.id === "ipad-air") ||
        (oldItem.id === "media-product-ipad-air-white" && tile.id === "ipad-air") ||
        (oldItem.id.startsWith("media-tile-") && tile.id === oldItem.id.replace("media-tile-", ""))
      ) {
        homepageChanged = true;
        return {
          ...tile,
          image: newItem.url,
          alt: updates.alt !== undefined ? updates.alt.trim() : tile.alt,
        };
      }
      return tile;
    });

    const updatedFlyers = (currentHomepage.serviceFlyers || []).map((flyer) => {
      if (
        flyer.image === oldItem.url ||
        (oldItem.id.startsWith("media-flyer-") && flyer.id === oldItem.id.replace("media-flyer-", ""))
      ) {
        homepageChanged = true;
        return {
          ...flyer,
          image: newItem.url,
          alt: updates.alt !== undefined ? updates.alt.trim() : flyer.alt,
        };
      }
      return flyer;
    });

    if (homepageChanged) {
      await saveHomepageContent({
        ...currentHomepage,
        heroes: updatedHeroes,
        tiles: updatedTiles,
        serviceFlyers: updatedFlyers,
      });
    }

    // 2. Storefront content cascade (department featured cards and accessory overrides)
    const currentStorefront = await fetchStorefrontContent();
    let storefrontChanged = false;
    const updatedStorefront: Record<string, CategoryDepartmentConfig> = {};

    for (const [deptKey, dept] of Object.entries(currentStorefront)) {
      const updatedCards = dept.featuredCards.map((card) => {
        if (
          card.image === oldItem.url ||
          (oldItem.id === "media-tile-ipad-air" && card.id.includes("ipad-air")) ||
          (oldItem.id === "media-product-ipad-air-colors" && (card.image.includes("ipad-air-colors") || card.id.includes("ipad-air"))) ||
          (oldItem.id && card.id && (card.id === oldItem.id || oldItem.id.endsWith(card.id)))
        ) {
          storefrontChanged = true;
          return {
            ...card,
            image: newItem.url,
            alt: updates.alt !== undefined ? updates.alt.trim() : card.alt,
          };
        }
        return card;
      });

      const updatedOverrides = { ...(dept.accessoryOverrides || {}) };
      for (const [accSlug, override] of Object.entries(updatedOverrides)) {
        if (override.image === oldItem.url || oldItem.id.includes(accSlug) || oldItem.filename.includes(accSlug)) {
          storefrontChanged = true;
          updatedOverrides[accSlug] = {
            ...override,
            image: newItem.url,
            alt: updates.alt !== undefined ? updates.alt.trim() : override.alt,
          };
        }
      }

      updatedStorefront[deptKey] = {
        ...dept,
        featuredCards: updatedCards,
        accessoryOverrides: updatedOverrides,
      };
    }

    if (storefrontChanged) {
      await saveStorefrontContent(updatedStorefront);
    }

    // 3. Products table cascade (update any product referencing this image in Supabase)
    if (supabase) {
      try {
        const { data: dbProducts } = await supabase
          .from("products")
          .select("id, images");

        if (dbProducts) {
          for (const prod of dbProducts) {
            const rawImages = Array.isArray(prod.images) ? prod.images : [];
            let prodChanged = false;
            const nextImages = rawImages.map((img: { src?: string; alt?: string }) => {
              if (img?.src === oldItem.url) {
                prodChanged = true;
                return {
                  ...img,
                  src: newItem.url,
                  alt: updates.alt !== undefined ? updates.alt.trim() : img.alt,
                };
              }
              return img;
            });

            if (prodChanged) {
              await supabase
                .from("products")
                .update({ images: nextImages, updated_at: new Date().toISOString() })
                .eq("id", prod.id);
            }
          }
        }
      } catch (prodCascadeErr) {
        console.warn("Product image cascade update failed:", prodCascadeErr);
      }
    }
  } catch (cascadeErr) {
    console.warn("Cascade URL update to content failed:", cascadeErr);
  }
}

