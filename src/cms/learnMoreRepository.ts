import * as tus from "tus-js-client";
import { assertAdminAal2 } from "../admin/adminAuthorization";
import type { EditorialStory } from "../catalog/editorialStories";
import type { ProductStoryDefinition } from "../catalog/productExperience";
import type { IphoneEducationContent } from "../data/iphone18ProEducation";
import type { MacStudioStory } from "../data/macStudioStory";
import { getSupabaseOrThrow, supabase } from "../lib/supabase";

export type LearnMoreSectionType =
  | "text-image" | "large-image" | "gallery" | "video" | "highlights"
  | "finishes" | "camera" | "performance" | "battery" | "specifications"
  | "comparison" | "cta";

export interface LearnMoreSection {
  id: string;
  type: LearnMoreSectionType;
  enabled: boolean;
  placement?: string;
  eyebrow: string;
  title: string;
  body: string;
  image?: string;
  mobileImage?: string;
  images?: string[];
  alt?: string;
  fit?: "contain" | "cover";
  position?: string;
  video?: string;
  mobileVideo?: string;
  poster?: string;
  autoplay?: boolean;
  muted?: boolean;
  loop?: boolean;
  controls?: boolean;
  buttonLabel?: string;
  buttonTo?: string;
}

export function sectionsAt(sections: LearnMoreSection[], placement: string): LearnMoreSection[] {
  return sections.filter((section) => (section.placement || "end") === placement);
}

export type LearnMoreContent =
  | { kind: "editorial"; story: EditorialStory; sections: LearnMoreSection[]; education?: IphoneEducationContent }
  | { kind: "catalog"; story: ProductStoryDefinition; sections: LearnMoreSection[] }
  | { kind: "mac-studio"; story: MacStudioStory; sections: LearnMoreSection[] };

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
    return Object.fromEntries(Object.entries(published).map(([key, value]) => [
      key, refreshBundledStoryAssets(value, (current as Record<string, unknown>)[key]),
    ])) as T;
  }
  if (typeof published === "string" && published.startsWith("/assets/") && typeof current === "string" && current.startsWith("/assets/")) {
    return current as T;
  }
  return published;
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
}
const publicCache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 60 * 1000; // 60s TTL

export function invalidateLearnMoreCache(id?: string) {
  if (id) {
    publicCache.delete(id);
  } else {
    publicCache.clear();
  }
}

export async function fetchPublishedLearnMore(id: string): Promise<LearnMoreContent | null> {
  const cached = publicCache.get(id);
  const now = Date.now();
  if (cached && now - cached.fetchedAt < CACHE_TTL_MS) {
    return cached.content;
  }

  if (!supabase) return null;
  const { data, error } = await supabase.from("learn_more_published")
    .select("content").eq("id", id).maybeSingle();
  if (error) return null;
  const content = validContent(data?.content, id) ? data.content : null;
  publicCache.set(id, { content, fetchedAt: now });
  return content;
}

export async function fetchDraftLearnMore(id: string): Promise<LearnMoreContent | null> {
  await assertAdminAal2();
  const { data, error } = await getSupabaseOrThrow().from("learn_more_drafts")
    .select("content").eq("id", id).maybeSingle();
  if (error) throw error;
  return validContent(data?.content, id) ? data.content : null;
}

export async function saveDraftLearnMore(content: LearnMoreContent): Promise<void> {
  await assertAdminAal2();
  const { error } = await getSupabaseOrThrow().from("learn_more_drafts").upsert({
    id: content.story.slug, content, updated_at: new Date().toISOString(),
  });
  if (error) throw error;
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

export async function publishLearnMore(content: LearnMoreContent, notes?: string): Promise<number> {
  await assertAdminAal2();
  const client = getSupabaseOrThrow();
  const pageId = content.story.slug;

  // 1. Attempt atomic RPC call if available
  try {
    const { data: revNum, error: rpcError } = await client.rpc("publish_learn_more_page", {
      p_page_id: pageId,
      p_content: content,
      p_notes: notes || "Published via Visual Admin Editor",
    });
    if (!rpcError && typeof revNum === "number") {
      invalidateLearnMoreCache(pageId);
      return revNum;
    }
  } catch (err) {
    console.warn("RPC publish_learn_more_page fallback to direct operations:", err);
  }

  // 2. Direct fallback
  const { error } = await client.from("learn_more_published").upsert({
    id: pageId, content, updated_at: new Date().toISOString(),
  });
  if (error) throw error;

  // Insert revision record
  try {
    const { data: revData } = await client
      .from("learn_more_revisions")
      .select("revision_number")
      .eq("page_id", pageId)
      .order("revision_number", { ascending: false })
      .limit(1);
    const nextRev = (((revData?.[0]?.revision_number as number) || 0) + 1);
    await client.from("learn_more_revisions").insert({
      page_id: pageId,
      revision_number: nextRev,
      content,
      notes: notes || "Published via Visual Admin Editor",
      created_at: new Date().toISOString(),
    });
    await client.from("learn_more_drafts").delete().eq("id", pageId);
    invalidateLearnMoreCache(pageId);
    return nextRev;
  } catch {
    await client.from("learn_more_drafts").delete().eq("id", pageId);
    invalidateLearnMoreCache(pageId);
    return 1;
  }
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
  invalidateLearnMoreCache(pageId);
  return revisionNumber;
}

export async function unpublishLearnMore(pageId: string): Promise<void> {
  await assertAdminAal2();
  const client = getSupabaseOrThrow();
  const { error } = await client.from("learn_more_published").delete().eq("id", pageId);
  if (error) throw error;
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
