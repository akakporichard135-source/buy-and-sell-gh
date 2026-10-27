import * as tus from "tus-js-client";
import { assertAdminAal2 } from "../admin/adminAuthorization";
import { editorialStories, type EditorialStory } from "../catalog/editorialStories";
import { defaultEditorialShowcases } from "../catalog/minimalEditorialSections";
import { getProductFamily, productBuyPath, productStories, type ProductFamilyKey, type ProductStoryDefinition } from "../catalog/productExperience";
import { seedCatalog } from "../catalog/productCatalog";
import { iphone18ProEducation, type IphoneEducationContent } from "../data/iphone18ProEducation";
import { macStudioStory, type MacStudioStory } from "../data/macStudioStory";
import { getSupabaseOrThrow, supabase } from "../lib/supabase";
import type { Product } from "../types/product";
import { localCatalogueImageBySlug } from "../utils/catalogueProductImages";
import { broadcastPublishedUpdate } from "../utils/imageVersioning";
import { localPremiumImageBySlug, resolveAdminProductImage } from "../utils/productImages";

export type LearnMoreSectionType =
  | "text-image"
  | "large-image"
  | "gallery"
  | "video"
  | "highlights"
  | "finishes"
  | "camera"
  | "performance"
  | "battery"
  | "specifications"
  | "comparison"
  | "cta"
  | "feature-cards"
  | "hardware-close-up"
  | "scroll-reveal"
  | "sticky-story"
  | "full-bleed";

export interface LearnMoreSectionItem {
  label: string;
  value: string;
  description?: string;
  image?: string;
}

export interface LearnMoreSection {
  id: string;
  type: LearnMoreSectionType;
  enabled: boolean;
  placement?: string;
  eyebrow: string;
  title: string;
  body: string;
  supportingText?: string;
  backgroundColor?: "white" | "soft-gray" | "dark" | string;
  textAlignment?: "left" | "center" | "right";
  layout?: "split-left" | "split-right" | "stacked" | "grid-2" | "grid-3" | "carousel";
  animationPreset?: "fade" | "slide-up" | "zoom" | "none";
  image?: string;
  mobileImage?: string;
  images?: string[];
  alt?: string;
  fit?: "contain" | "cover";
  position?: string;
  frameAspectRatio?: number;
  video?: string;
  mobileVideo?: string;
  poster?: string;
  autoplay?: boolean;
  muted?: boolean;
  loop?: boolean;
  controls?: boolean;
  buttonLabel?: string;
  buttonTo?: string;
  items?: LearnMoreSectionItem[];
}

export function sectionsAt(
  sections: LearnMoreSection[],
  placement: string,
  handledPlacements?: string[]
): LearnMoreSection[] {
  if (placement === "end" && handledPlacements && handledPlacements.length > 0) {
    const handledSet = new Set(handledPlacements);
    return sections.filter((section) => {
      const p = section.placement || "end";
      return p === "end" || !handledSet.has(p);
    });
  }
  return sections.filter((section) => (section.placement || "end") === placement);
}

export type LearnMoreContent =
  | { kind: "editorial"; story: EditorialStory; sections: LearnMoreSection[]; education?: IphoneEducationContent; isEmptyPage?: boolean }
  | { kind: "catalog"; story: ProductStoryDefinition; sections: LearnMoreSection[]; isEmptyPage?: boolean }
  | { kind: "mac-studio"; story: MacStudioStory; sections: LearnMoreSection[]; isEmptyPage?: boolean };

const validContent = (value: unknown, id: string): value is LearnMoreContent => {
  if (!value || typeof value !== "object") return false;
  const item = value as Partial<LearnMoreContent>;
  return (item.kind === "editorial" || item.kind === "catalog" || item.kind === "mac-studio") &&
    item.story?.slug === id && Array.isArray(item.sections);
};

export function refreshBundledStoryAssets<T>(published: T, current: T): T {
  if (Array.isArray(published) && Array.isArray(current)) {
    return published.map((item, index) => {
      const record = item && typeof item === "object" ? item as Record<string, unknown> : null;
      const identity = record?.id ?? record?.label;
      const match = identity === undefined ? current[index] : current.find((candidate) =>
        candidate && typeof candidate === "object" &&
        ((candidate as Record<string, unknown>).id ?? (candidate as Record<string, unknown>).label) === identity);
      return refreshBundledStoryAssets(item, match);
    }) as T;
  }
  if (published && current && typeof published === "object" && typeof current === "object") {
    return Object.fromEntries(Object.entries(published).map(([key, value]) => {
      if (
        (key === "src" || key === "image" || key === "mobileImage" || key === "poster" || key === "video" || key === "mobileVideo") &&
        typeof value === "string" &&
        value.trim() !== ""
      ) {
        const publishedStr = value.trim();
        const currentStr = typeof (current as Record<string, unknown>)?.[key] === "string"
          ? ((current as Record<string, unknown>)[key] as string).trim() : "";
        const isLegacyWatch12Poster =
          key === "poster" &&
          (publishedStr === "/products/homepage/watch-series-12.webp" ||
            publishedStr === "/products/campaigns/watch-series-12-product.webp" ||
            publishedStr.includes("watch-series-12.webp"));
        if (isLegacyWatch12Poster && currentStr) {
          return [key, currentStr];
        }
        if (
          (published as Record<string, unknown>).cmsAssetOverride === true ||
          publishedStr.startsWith("http://") ||
          publishedStr.startsWith("https://") ||
          publishedStr.startsWith("data:") ||
          publishedStr.includes("/storage/v1/object/") ||
          publishedStr !== currentStr
        ) {
          return [key, publishedStr];
        }
      }
      return [
        key,
        key === "src" && (published as Record<string, unknown>).cmsAssetOverride === true
          ? value
          : refreshBundledStoryAssets(value, (current as Record<string, unknown>)[key]),
      ];
    })) as T;
  }
  if (typeof published === "string" && published.startsWith("/assets/") && typeof current === "string" && current.startsWith("/assets/")) {
    return current as T;
  }
  return published;
}

export function normalizeLearnMoreContent(content: LearnMoreContent, id?: string): LearnMoreContent {
  if (!content) return content;
  const pageId = id || content.story?.slug;
  const normalized = structuredClone(content);

  if (normalized.kind === "editorial" && normalized.story) {
    // TASK 4: Apple Watch Series 12 cinematic showcase is strictly removed from Admin and Public
    if (pageId === "apple-watch-series-12" || normalized.story.slug === "apple-watch-series-12") {
      delete normalized.story.cinematicVideo;
    }
  }

  if (Array.isArray(normalized.sections)) {
    for (const section of normalized.sections) {
      if (pageId === "apple-watch-series-12" || normalized.story?.slug === "apple-watch-series-12") {
        if (
          section.poster === "/products/homepage/watch-series-12.webp" ||
          section.poster === "/products/campaigns/watch-series-12-product.webp" ||
          (typeof section.poster === "string" && section.poster.includes("watch-series-12.webp"))
        ) {
          section.poster = "/products/campaigns/watch-series-12-cinematic.webp";
        }
      }
    }
  }

  return normalized;
}

export interface LearnMoreRevision {
  id: string;
  page_id: string;
  revision_number: number;
  content: LearnMoreContent;
  notes?: string;
  author_id?: string;
  author_email?: string;
  created_at: string;
}

interface CacheEntry {
  content: LearnMoreContent | null;
  fetchedAt: number;
  isNetworkFresh?: boolean;
}
const publicCache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 60 * 1000; // 60s TTL
const FAST_CACHE_PREFIX = "buyandsell_learn_more_pub_v2_";

/**
 * Synchronously retrieves cached published Learn More content to prevent
 * flash of default bundled content during page mount or refresh.
 */
export function getPublishedLearnMoreSync(id: string): LearnMoreContent | null {
  const memory = publicCache.get(id);
  if (memory && memory.content) {
    return normalizeLearnMoreContent(memory.content, id);
  }
  if (typeof window !== "undefined") {
    try {
      const raw = sessionStorage.getItem(`${FAST_CACHE_PREFIX}${id}`) || localStorage.getItem(`${FAST_CACHE_PREFIX}${id}`);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (validContent(parsed, id)) {
          const norm = normalizeLearnMoreContent(parsed, id);
          // Do not mark as network fresh so fetchPublishedLearnMore still revalidates from Supabase
          publicCache.set(id, { content: norm, fetchedAt: Date.now(), isNetworkFresh: false });
          return norm;
        }
      }
    } catch {
      // ignore
    }
  }
  return null;
}

export function savePublishedLearnMoreToFastCache(id: string, content: LearnMoreContent | null): void {
  if (typeof window === "undefined") return;
  const key = `${FAST_CACHE_PREFIX}${id}`;
  try {
    if (content) {
      const norm = normalizeLearnMoreContent(content, id);
      const json = JSON.stringify(norm);
      sessionStorage.setItem(key, json);
      localStorage.setItem(key, json);
    } else {
      sessionStorage.removeItem(key);
      localStorage.removeItem(key);
    }
  } catch {
    // ignore
  }
}

export function invalidateLearnMoreCache(id?: string) {
  if (id) {
    publicCache.delete(id);
    if (typeof window !== "undefined") {
      try {
        sessionStorage.removeItem(`${FAST_CACHE_PREFIX}${id}`);
        localStorage.removeItem(`${FAST_CACHE_PREFIX}${id}`);
      } catch {}
    }
    broadcastPublishedUpdate("learn-more", id);
  } else {
    publicCache.clear();
    if (typeof window !== "undefined") {
      try {
        const toRemove: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (k && k.startsWith(FAST_CACHE_PREFIX)) toRemove.push(k);
        }
        toRemove.forEach((k) => localStorage.removeItem(k));

        const toRemoveSession: string[] = [];
        for (let i = 0; i < sessionStorage.length; i++) {
          const k = sessionStorage.key(i);
          if (k && k.startsWith(FAST_CACHE_PREFIX)) toRemoveSession.push(k);
        }
        toRemoveSession.forEach((k) => sessionStorage.removeItem(k));
      } catch {}
    }
    broadcastPublishedUpdate("learn-more");
  }
}

export async function fetchPublishedLearnMore(id: string, forceRefresh = false): Promise<LearnMoreContent | null> {
  const syncCached = getPublishedLearnMoreSync(id);
  const memory = publicCache.get(id);
  const now = Date.now();
  if (!forceRefresh && memory && memory.isNetworkFresh && now - memory.fetchedAt < CACHE_TTL_MS && memory.content) {
    return normalizeLearnMoreContent(memory.content, id);
  }

  if (!supabase) return syncCached;
  const { data, error } = await supabase.from("learn_more_published")
    .select("content").eq("id", id).maybeSingle();
  if (error) return syncCached;
  const content = validContent(data?.content, id) ? normalizeLearnMoreContent(data.content, id) : null;
  publicCache.set(id, { content, fetchedAt: now, isNetworkFresh: true });
  savePublishedLearnMoreToFastCache(id, content);
  return content;
}

export async function fetchDraftLearnMore(id: string): Promise<LearnMoreContent | null> {
  await assertAdminAal2();
  const { data, error } = await getSupabaseOrThrow().from("learn_more_drafts")
    .select("content").eq("id", id).maybeSingle();
  if (error) throw error;
  return validContent(data?.content, id) ? normalizeLearnMoreContent(data.content, id) : null;
}

export async function saveDraftLearnMore(content: LearnMoreContent): Promise<void> {
  await assertAdminAal2();
  const client = getSupabaseOrThrow();
  const normalized = normalizeLearnMoreContent(content);
  const pageId = normalized.story.slug;
  const { error } = await client.from("learn_more_drafts").upsert({
    id: pageId, content: normalized, updated_at: new Date().toISOString(),
  });
  if (error) throw error;

  // Strict read-back verification: confirm all expected section IDs were persisted in draft
  const { data: verifyDraft, error: verifyErr } = await client
    .from("learn_more_drafts")
    .select("content")
    .eq("id", pageId)
    .single();

  if (verifyErr || !verifyDraft?.content) {
    throw new Error(
      `Draft persistence verification failed: could not confirm saved draft in Supabase (${verifyErr?.message || "empty response"}).`
    );
  }

  const persistedDraft = normalizeLearnMoreContent(verifyDraft.content as LearnMoreContent, pageId);
  const expectedSectionIds = (normalized.sections || []).map((s) => s.id);
  const persistedSectionIds = new Set((persistedDraft.sections || []).map((s) => s.id));

  for (const expectedId of expectedSectionIds) {
    if (!persistedSectionIds.has(expectedId)) {
      throw new Error(
        `Draft persistence verification failed: newly created section ID "${expectedId}" was not preserved in Supabase draft.`
      );
    }
  }
}

export async function fetchLearnMoreRevisions(id: string): Promise<LearnMoreRevision[]> {
  await assertAdminAal2();
  try {
    const { data, error } = await getSupabaseOrThrow()
      .from("learn_more_revisions")
      .select("id, page_id, revision_number, content, notes, author_id, author_email, created_at")
      .eq("page_id", id)
      .order("revision_number", { ascending: false });
    if (error) {
      console.warn("Could not fetch revisions:", error.message);
      return [];
    }
    return (data || []).map((row) => ({
      ...row,
      content: validContent(row.content, id) ? row.content : (row.content as LearnMoreContent),
    }));
  } catch {
    return [];
  }
}

export interface PublishResult {
  revisionNumber: number;
  verifiedContent: LearnMoreContent;
  persistedSectionIds: string[];
}

export async function publishLearnMore(content: LearnMoreContent, notes?: string): Promise<PublishResult> {
  await assertAdminAal2();
  const client = getSupabaseOrThrow();
  const normalized = normalizeLearnMoreContent(content);
  const pageId = normalized.story.slug;
  let nextRev = 1;

  // 1. Attempt atomic RPC call if available
  let rpcSucceeded = false;
  try {
    const { data: revNum, error: rpcError } = await client.rpc("publish_learn_more_page", {
      p_page_id: pageId,
      p_content: normalized,
      p_notes: notes || "Published via Visual Admin Editor",
    });
    if (!rpcError && typeof revNum === "number") {
      nextRev = revNum;
      rpcSucceeded = true;
    } else if (rpcError) {
      console.warn("RPC publish_learn_more_page returned error, falling back to direct operations:", rpcError);
    }
  } catch (err) {
    console.warn("RPC publish_learn_more_page threw error, falling back to direct operations:", err);
  }

  // 2. Direct fallback if RPC did not succeed
  if (!rpcSucceeded) {
    const { error: pubError } = await client.from("learn_more_published").upsert({
      id: pageId, content: normalized, updated_at: new Date().toISOString(),
    });
    if (pubError) throw pubError;

    // Insert revision record
    try {
      const { data: revData } = await client
        .from("learn_more_revisions")
        .select("revision_number")
        .eq("page_id", pageId)
        .order("revision_number", { ascending: false })
        .limit(1);
      nextRev = (((revData?.[0]?.revision_number as number) || 0) + 1);
      await client.from("learn_more_revisions").insert({
        page_id: pageId,
        revision_number: nextRev,
        content: normalized,
        notes: notes || "Published via Visual Admin Editor",
        created_at: new Date().toISOString(),
      });
      await client.from("learn_more_drafts").delete().eq("id", pageId);
    } catch {
      await client.from("learn_more_drafts").delete().eq("id", pageId);
      nextRev = 1;
    }
  }

  // 3. STRICT READ-BACK VERIFICATION:
  // Query Supabase directly to verify the published record was persisted and contains every single section ID
  const { data: readBack, error: readBackErr } = await client
    .from("learn_more_published")
    .select("content, updated_at")
    .eq("id", pageId)
    .single();

  if (readBackErr || !readBack?.content) {
    throw new Error(
      `Publish verification failed: could not confirm published record in Supabase (${readBackErr?.message || "empty response"}).`
    );
  }

  const rawPersisted = readBack.content as LearnMoreContent;
  if (!validContent(rawPersisted, pageId)) {
    throw new Error(
      `Publish verification failed: persisted content in Supabase does not match valid Learn More schema.`
    );
  }

  const persistedContent = normalizeLearnMoreContent(rawPersisted, pageId);
  const expectedSectionIds = (normalized.sections || []).map((s) => s.id);
  const persistedSections = persistedContent.sections || [];
  const persistedSectionIds = persistedSections.map((s) => s.id);
  const persistedIdSet = new Set(persistedSectionIds);

  for (const expectedId of expectedSectionIds) {
    if (!persistedIdSet.has(expectedId)) {
      throw new Error(
        `Publish verification failed: newly created section ID "${expectedId}" is missing from the persisted Supabase record.`
      );
    }
  }

  // 4. Verification passed: update fast-cache, memory cache, and broadcast live update across tabs
  invalidateLearnMoreCache(pageId);
  savePublishedLearnMoreToFastCache(pageId, persistedContent);
  publicCache.set(pageId, { content: persistedContent, fetchedAt: Date.now(), isNetworkFresh: true });

  return {
    revisionNumber: nextRev,
    verifiedContent: persistedContent,
    persistedSectionIds,
  };
}

export async function rollbackLearnMoreRevision(pageId: string, revisionNumber: number): Promise<number> {
  await assertAdminAal2();
  const client = getSupabaseOrThrow();

  try {
    const { data: newRev, error: rpcError } = await client.rpc("rollback_learn_more_revision", {
      p_page_id: pageId,
      p_target_revision: revisionNumber,
    });
    if (!rpcError && typeof newRev === "number") {
      invalidateLearnMoreCache(pageId);
      return newRev;
    }
  } catch (err) {
    console.warn("RPC rollback_learn_more_revision fallback to direct operations:", err);
  }

  // Direct fallback
  const { data: rev, error: fetchErr } = await client
    .from("learn_more_revisions")
    .select("content")
    .eq("page_id", pageId)
    .eq("revision_number", revisionNumber)
    .single();
  if (fetchErr || !rev) throw new Error(`Could not find revision ${revisionNumber}`);

  const content = rev.content as LearnMoreContent;
  const { error: pubErr } = await client.from("learn_more_published").upsert({
    id: pageId, content, updated_at: new Date().toISOString(),
  });
  if (pubErr) throw pubErr;

  await client.from("learn_more_drafts").delete().eq("id", pageId);
  savePublishedLearnMoreToFastCache(pageId, content);
  invalidateLearnMoreCache(pageId);
  return revisionNumber;
}

export async function unpublishLearnMore(pageId: string): Promise<void> {
  await assertAdminAal2();
  const client = getSupabaseOrThrow();
  const { error } = await client.from("learn_more_published").delete().eq("id", pageId);
  if (error) throw error;
  savePublishedLearnMoreToFastCache(pageId, null);
  invalidateLearnMoreCache(pageId);
}

export async function uploadLearnMoreMedia(
  file: File, onProgress?: (percentage: number) => void
): Promise<string> {
  await assertAdminAal2();
  const imageTypes = ["image/jpeg", "image/png", "image/webp", "image/avif"];
  const videoTypes = ["video/mp4", "video/webm"];
  const isImage = imageTypes.includes(file.type);
  const isVideo = videoTypes.includes(file.type);
  if (!isImage && !isVideo) throw new Error("Use JPG, PNG, WebP, AVIF, MP4 or WebM media.");
  if (file.size > (isImage ? 5 : 200) * 1024 * 1024) {
    throw new Error(isImage ? "Images must be 5 MB or less." : "Videos must be 200 MB or less.");
  }
  const signature = new Uint8Array(await file.slice(0, 12).arrayBuffer());
  const ascii = (start: number, end: number) => String.fromCharCode(...signature.slice(start, end));
  const validSignature = file.type === "image/jpeg" ? signature[0] === 0xff && signature[1] === 0xd8 :
    file.type === "image/png" ? signature[0] === 0x89 && ascii(1, 4) === "PNG" :
    file.type === "image/webp" ? ascii(0, 4) === "RIFF" && ascii(8, 12) === "WEBP" :
    file.type === "image/avif" ? ascii(4, 8) === "ftyp" && ["avif", "avis"].includes(ascii(8, 12)) :
    file.type === "video/mp4" ? ascii(4, 8) === "ftyp" :
    signature[0] === 0x1a && signature[1] === 0x45 && signature[2] === 0xdf && signature[3] === 0xa3;
  if (!validSignature) throw new Error("The file signature does not match its media format.");
  const client = getSupabaseOrThrow();
  const extension = file.type.split("/")[1].replace("jpeg", "jpg");
  const path = `${isImage ? "images" : "videos"}/${crypto.randomUUID()}.${extension}`;
  if (isImage || file.size <= 6 * 1024 * 1024) {
    const { error } = await client.storage.from("learn-more-media").upload(path, file, {
      contentType: file.type, cacheControl: "31536000", upsert: false,
    });
    if (error) throw error;
  } else {
    const { data } = await client.auth.getSession();
    const token = data.session?.access_token;
    if (!token) throw new Error("Your admin session expired. Sign in again.");
    const projectUrl = import.meta.env.VITE_SUPABASE_URL as string;
    const projectId = new URL(projectUrl).hostname.split(".")[0];
    await new Promise<void>((resolve, reject) => {
      const upload = new tus.Upload(file, {
        endpoint: `https://${projectId}.storage.supabase.co/storage/v1/upload/resumable`,
        headers: { authorization: `Bearer ${token}`, "x-upsert": "false" },
        metadata: { bucketName: "learn-more-media", objectName: path, contentType: file.type, cacheControl: "31536000" },
        chunkSize: 6 * 1024 * 1024,
        retryDelays: [0, 3000, 5000, 10000, 20000],
        uploadDataDuringCreation: true,
        removeFingerprintOnSuccess: true,
        onError: reject,
        onSuccess: () => resolve(),
        onProgress: (sent, total) => onProgress?.(Math.round(sent / total * 100)),
      });
      void upload.findPreviousUploads().then((previous) => {
        if (previous.length) upload.resumeFromPreviousUpload(previous[0]);
        upload.start();
      }).catch(reject);
    });
  }
  return client.storage.from("learn-more-media").getPublicUrl(path).data.publicUrl;
}

export async function listLearnMoreMedia(): Promise<string[]> {
  await assertAdminAal2();
  const client = getSupabaseOrThrow();
  const folders = await Promise.all(["images", "videos"].map(async (folder) => {
    const { data, error } = await client.storage.from("learn-more-media").list(folder, { limit: 1000 });
    if (error) throw error;
    return (data || []).filter((file) => file.name && file.metadata).map((file) =>
      client.storage.from("learn-more-media").getPublicUrl(`${folder}/${file.name}`).data.publicUrl);
  }));
  return folders.flat();
}

export interface LearnMorePageStatus {
  published: boolean;
  hasDraft: boolean;
  updatedAt?: string;
}

export async function fetchLearnMoreStatusMap(): Promise<Record<string, LearnMorePageStatus>> {
  if (!supabase) return {};
  try {
    const [pubRes, draftRes] = await Promise.all([
      supabase.from("learn_more_published").select("id, updated_at"),
      supabase.from("learn_more_drafts").select("id, updated_at"),
    ]);
    const map: Record<string, LearnMorePageStatus> = {};
    for (const row of pubRes.data || []) {
      map[row.id] = {
        published: true,
        hasDraft: false,
        updatedAt: row.updated_at,
      };
    }
    for (const row of draftRes.data || []) {
      map[row.id] = {
        published: map[row.id]?.published ?? false,
        hasDraft: true,
        updatedAt: row.updated_at || map[row.id]?.updatedAt,
      };
    }
    return map;
  } catch {
    return {};
  }
}

export function getLearnMoreFamily(content: LearnMoreContent): ProductFamilyKey {
  if (content.kind === "catalog") {
    return content.story.family;
  }
  if (content.kind === "mac-studio") {
    return "mac";
  }
  const slug = content.story.slug.toLowerCase();
  const buyPath = (content.story.buyPath || "").toLowerCase();
  if (buyPath.includes("/buy-iphone/") || slug.includes("iphone")) return "iphone";
  if (buyPath.includes("/buy-mac/") || slug.includes("mac")) return "mac";
  if (buyPath.includes("/buy-ipad/") || slug.includes("ipad")) return "ipad";
  if (buyPath.includes("/buy-watch/") || slug.includes("watch")) return "watch";
  if (buyPath.includes("/buy-airpods/") || slug.includes("airpod")) return "airpods";
  return "accessories";
}

export function getLearnMorePublicPath(content: LearnMoreContent): string {
  const slug = content.story.slug;
  if (slug === "mac-mini") return "/mac-mini";
  if (slug === "mac-studio") return "/mac-studio";
  const family = getLearnMoreFamily(content);
  return `/${family}/${slug}`;
}

export function getLearnMoreHeroThumbnail(content: LearnMoreContent): string {
  if (content.kind === "editorial") {
    return content.story.hero.src || content.story.cinematicVideo?.poster || "";
  }
  if (content.kind === "mac-studio") {
    return content.story.image.src || "";
  }
  if (content.story.media.type === "image") {
    return content.story.media.src || "";
  }
  return content.story.designMedia?.src || content.story.galleryMedia?.[0]?.src || "";
}

export function createEmptyLearnMorePage(product: Product): LearnMoreContent {
  const family = getProductFamily(product);
  const buyPath = productBuyPath(family, product.slug);
  const primaryImg = resolveAdminProductImage(product)?.src || "";

  return {
    kind: "catalog",
    story: {
      family,
      slug: product.slug,
      name: product.name,
      eyebrow: product.generation || product.subcategory || product.category,
      tagline: "",
      introduction: "",
      media: {
        type: "image",
        src: primaryImg,
        alt: product.name,
      },
      theme: family === "mac" || family === "watch" ? "ink" : "light",
      buyPath,
      highlights: [],
      designTitle: "",
      designCopy: "",
      finalCtaHeadline: "",
      detailGroups: [],
    },
    sections: [],
    isEmptyPage: true,
  };
}

export function resolveApprovedProductThumbnail(
  slug: string,
  content?: LearnMoreContent | null,
  catalogProduct?: Product | null
): string {
  // 1. If catalogProduct is provided and has images, use latest product catalog image
  if (catalogProduct) {
    const adminImg = resolveAdminProductImage(catalogProduct);
    if (adminImg?.src) return adminImg.src;
    if (Array.isArray(catalogProduct.images) && catalogProduct.images.length > 0) {
      const idx = catalogProduct.primaryImageIndex ?? 0;
      const primary = catalogProduct.images[idx]?.src || catalogProduct.images[0]?.src;
      if (primary) return primary;
    }
  }

  // 2. If content has an active/published hero or visual asset
  if (content) {
    if (content.kind === "editorial" && content.story.hero?.src) {
      return content.story.hero.src;
    }
    if (content.kind === "mac-studio" && content.story.image?.src) {
      return content.story.image.src;
    }
    if (content.kind === "catalog" && content.story.media?.src) {
      return content.story.media.src;
    }
    if (Array.isArray(content.sections)) {
      for (const s of content.sections) {
        if (s.image) return s.image;
        if (s.poster) return s.poster;
      }
    }
  }

  // 3. Check local clean catalog images
  const cleanCatalogue = localCatalogueImageBySlug[slug];
  if (cleanCatalogue) return cleanCatalogue;

  const cleanPremium = localPremiumImageBySlug[slug];
  if (cleanPremium) return cleanPremium;

  // 4. Check editorial stories
  const edStory = editorialStories[slug];
  if (edStory?.hero?.src) return edStory.hero.src;

  return "";
}

export function hasUsableLearnMoreContent(
  slug: string,
  publishedContent?: LearnMoreContent | null
): boolean {
  const content = publishedContent ?? getPublishedLearnMoreSync(slug);
  if (content) {
    if (content.sections && content.sections.some((s) => s.enabled)) return true;
    if (content.kind === "editorial" && content.story.hero?.src) return true;
    if (content.kind === "catalog" && !content.isEmptyPage && content.story.introduction) return true;
  }

  // Editorial stories that have approved content
  if (editorialStories[slug]) return true;
  if (slug === "mac-studio") return true;

  return false;
}

/**
 * Returns Learn More page configurations for every product in the catalog.
 * Preserves existing editorial and catalog stories while generating
 * clean, empty Learn More pages for all other products across
 * iPhone, Mac, iPad, Apple Watch, AirPods, and Accessories.
 */
export function getEligibleLearnMoreProducts(
  catalogProducts: Product[] = [],
  extraRegistered: LearnMoreContent[] = []
): LearnMoreContent[] {
  const choices: LearnMoreContent[] = [
    ...Object.values(editorialStories).map((story) => ({
      kind: "editorial" as const,
      story,
      sections: defaultEditorialShowcases(story),
      ...(story.slug === "iphone-18-pro" ? { education: iphone18ProEducation } : {}),
    })),
    ...productStories
      .filter((story) => !editorialStories[story.slug])
      .map((story) => ({
        kind: "catalog" as const,
        story,
        sections: [],
      })),
    ...(!editorialStories[macStudioStory.slug]
      ? [{ kind: "mac-studio" as const, story: macStudioStory, sections: [] }]
      : []),
  ];

  const seenSlugs = new Set(choices.map((item) => item.story.slug));
  for (const extra of extraRegistered) {
    if (extra?.story?.slug && !seenSlugs.has(extra.story.slug)) {
      seenSlugs.add(extra.story.slug);
      choices.push(extra);
    }
  }

  // Ensure every product from catalog (Supabase or seedCatalog) has an editable Learn More entry
  const productsToProcess = catalogProducts.length > 0 ? catalogProducts : seedCatalog;
  for (const product of productsToProcess) {
    if (!product || !product.slug) continue;
    if (seenSlugs.has(product.slug)) continue;

    seenSlugs.add(product.slug);
    choices.push(createEmptyLearnMorePage(product));
  }

  return choices;
}

export function getBuiltInLearnMoreMedia(): string[] {
  const urls = new Set<string>();
  for (const story of Object.values(editorialStories)) {
    if (story.hero?.src) urls.add(story.hero.src);
    if (story.cinematicVideo?.src) urls.add(story.cinematicVideo.src);
    if (story.cinematicVideo?.poster) urls.add(story.cinematicVideo.poster);
    for (const h of story.highlights || []) {
      if (h.image?.src) urls.add(h.image.src);
    }
    for (const ch of story.chapters || []) {
      if (ch.image?.src) urls.add(ch.image.src);
    }
    if (story.finalImage?.src) urls.add(story.finalImage.src);
  }
  for (const story of productStories) {
    if (story.media?.src) urls.add(story.media.src);
    if (story.designMedia?.src) urls.add(story.designMedia.src);
    for (const g of story.galleryMedia || []) {
      if (g.src) urls.add(g.src);
    }
  }
  if (macStudioStory.image?.src) urls.add(macStudioStory.image.src);
  return Array.from(urls);
}
