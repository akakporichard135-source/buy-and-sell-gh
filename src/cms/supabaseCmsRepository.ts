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

// 1. SITE SETTINGS
export const fetchSiteSettings = async (): Promise<SiteSettings> => {
  const local = readLocal<SiteSettings>(CMS_STORAGE_KEY_SETTINGS, defaultSiteSettings);
  if (!supabase) return local;

  try {
    const { data, error } = await supabase
      .from("site_settings")
      .select("settings")
      .eq("id", "global")
      .maybeSingle();

    if (!error && data?.settings) {
      const merged = { ...defaultSiteSettings, ...(data.settings as Partial<SiteSettings>) };
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
      const merged = { ...defaultHomepageContent, ...(data.content as Partial<HomepageContent>) };
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
export const fetchMediaLibrary = async (): Promise<MediaItem[]> => {
  const local = readLocal<MediaItem[]>(CMS_STORAGE_KEY_MEDIA, defaultMediaItems);
  if (!supabase) return local;

  try {
    const { data, error } = await supabase
      .from("media_library")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data && data.length > 0) {
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
      writeLocal(CMS_STORAGE_KEY_MEDIA, mapped);
      return mapped;
    }
  } catch {
    // Non-blocking fallback
  }

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

export const deleteMediaItemById = async (id: string): Promise<void> => {
  await assertAdminAal2();
  const client = getSupabaseOrThrow();
  const current = await fetchMediaLibrary();
  const target = current.find((m) => m.id === id);

  if (target?.storagePath) {
    const { error: removeErr } = await client.storage
      .from(productImagesBucket)
      .remove([target.storagePath]);
    if (removeErr) {
      console.warn("Storage removal warning:", removeErr.message);
    }
  }

  const { error } = await client.from("media_library").delete().eq("id", id);
  if (error) {
    throw new Error(
      `Failed to delete media asset from Supabase (${error.message}, code: ${error.code || "ERR"}).`
    );
  }

  const updatedList = current.filter((m) => m.id !== id);
  writeLocal(CMS_STORAGE_KEY_MEDIA, updatedList);
  notifyListeners();
};

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
  const local = readLocal<Record<string, CategoryDepartmentConfig>>(CMS_STORAGE_KEY_STOREFRONT, CATEGORY_DEPARTMENTS);
  if (!supabase) return local;

  try {
    const { data, error } = await supabase
      .from("storefront_content")
      .select("config")
      .eq("key", "departments")
      .maybeSingle();

    if (!error && data?.config) {
      const merged = { ...CATEGORY_DEPARTMENTS, ...(data.config as Record<string, CategoryDepartmentConfig>) };
      writeLocal(CMS_STORAGE_KEY_STOREFRONT, merged);
      return merged;
    }
  } catch {
    // Non-blocking fallback
  }

  return local;
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
