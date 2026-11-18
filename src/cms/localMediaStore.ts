import { useEffect, useState } from "react";

const DB_NAME = "buyandsell_local_media_db_v1";
const DB_VERSION = 1;
const STORE_NAME = "media_files";
export const LOCAL_MEDIA_PREFIX = "local-media://";

export type LocalMediaKind = "image" | "video";

export interface LocalStagedMediaRecord {
  id: string;
  uri: string;
  filename: string;
  mimeType: string;
  size: number;
  kind: LocalMediaKind;
  createdAt: string;
  blob: Blob;
}

export interface LocalStagedMediaMeta {
  id: string;
  uri: string;
  filename: string;
  mimeType: string;
  size: number;
  kind: LocalMediaKind;
  createdAt: string;
  objectUrl: string;
}

export type MediaSourceBadgeKind =
  | "existing-local"
  | "media-library"
  | "newly-uploaded-local"
  | "missing";

export interface MediaSourceClassification {
  kind: MediaSourceBadgeKind;
  label:
    | "Existing Local Asset"
    | "Media Library Asset"
    | "Newly Uploaded Local Asset"
    | "Missing / Awaiting Upload";
}

const objectUrlCache = new Map<string, string>();
const metaCache = new Map<string, LocalStagedMediaMeta>();
const recordCache = new Map<string, LocalStagedMediaRecord>();
const listeners = new Set<() => void>();

const notifyMediaListeners = () => {
  listeners.forEach((fn) => {
    try {
      fn();
    } catch {
      // ignore
    }
  });
};

export const subscribeToLocalMedia = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

export const isLocalMediaUri = (url?: string | null): boolean =>
  Boolean(url && url.trim().startsWith(LOCAL_MEDIA_PREFIX));

export const extractLocalMediaId = (uriOrId: string): string =>
  uriOrId.startsWith(LOCAL_MEDIA_PREFIX)
    ? uriOrId.slice(LOCAL_MEDIA_PREFIX.length)
    : uriOrId;

export const classifyMediaSource = (
  rawUrl?: string | null
): MediaSourceClassification => {
  const trimmed = (rawUrl || "").trim();
  if (!trimmed) {
    return {
      kind: "missing",
      label: "Missing / Awaiting Upload",
    };
  }
  if (isLocalMediaUri(trimmed) || trimmed.startsWith("blob:")) {
    return {
      kind: "newly-uploaded-local",
      label: "Newly Uploaded Local Asset",
    };
  }
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return {
      kind: "media-library",
      label: "Media Library Asset",
    };
  }
  return {
    kind: "existing-local",
    label: "Existing Local Asset",
  };
};

let cachedDbPromise: Promise<IDBDatabase | null> | null = null;
let cachedIdbFactory: IDBFactory | null = null;

const openMediaDb = (): Promise<IDBDatabase | null> => {
  if (typeof window === "undefined" || !("indexedDB" in window) || !window.indexedDB) {
    return Promise.resolve(null);
  }

  if (cachedDbPromise && cachedIdbFactory === window.indexedDB) {
    return cachedDbPromise;
  }

  cachedIdbFactory = window.indexedDB;
  cachedDbPromise = new Promise((resolve) => {
    try {
      const request = window.indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: "id" });
        }
      };
      request.onsuccess = () => {
        const db = request.result;
        db.onversionchange = () => {
          db.close();
          cachedDbPromise = null;
        };
        resolve(db);
      };
      request.onerror = () => {
        cachedDbPromise = null;
        resolve(null);
      };
      request.onblocked = () => {
        resolve(null);
      };
    } catch {
      cachedDbPromise = null;
      resolve(null);
    }
  });

  return cachedDbPromise;
};

const VIDEO_EXT_RE = /\.(mp4|webm|mov|m4v|ogg|ogv)$/i;
const IMAGE_MAX_BYTES = 5 * 1024 * 1024;
const VIDEO_MAX_BYTES = 200 * 1024 * 1024;

export interface ValidatedLocalMediaResult {
  kind: LocalMediaKind;
  normalizedMimeType: string;
  extension: string;
}

const IMAGE_EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
};

const readFileHeaderBytes = async (
  file: Pick<File, "slice">,
  byteCount = 16
): Promise<Uint8Array> => {
  const chunk = file.slice(0, byteCount);
  if (typeof chunk.arrayBuffer === "function") {
    return new Uint8Array(await chunk.arrayBuffer());
  }
  return new Uint8Array(0);
};

const asciiSlice = (bytes: Uint8Array, start: number, end: number): string =>
  bytes.length >= end ? String.fromCharCode(...bytes.slice(start, end)) : "";

const detectImageMimeFromBytes = (bytes: Uint8Array): string | null => {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return "image/jpeg";
  }
  if (
    bytes.length >= 8 &&
    [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a].every((v, i) => bytes[i] === v)
  ) {
    return "image/png";
  }
  if (bytes.length >= 12 && asciiSlice(bytes, 0, 4) === "RIFF" && asciiSlice(bytes, 8, 12) === "WEBP") {
    return "image/webp";
  }
  if (
    bytes.length >= 12 &&
    asciiSlice(bytes, 4, 8) === "ftyp" &&
    ["avif", "avis"].includes(asciiSlice(bytes, 8, 12))
  ) {
    return "image/avif";
  }
  return null;
};

const checkBrowserVideoCodecSupport = (mime: string): boolean => {
  if (typeof document === "undefined" || typeof document.createElement !== "function") {
    return true;
  }
  try {
    const video = document.createElement("video");
    if (typeof video.canPlayType !== "function") return true;
    return video.canPlayType(mime) !== "";
  } catch {
    return true;
  }
};

export const validateLocalMediaFile = async (
  file: Pick<File, "name" | "type" | "size" | "slice">,
  expectedKind?: LocalMediaKind
): Promise<ValidatedLocalMediaResult> => {
  if (!file || typeof file.size !== "number" || file.size <= 0) {
    throw new Error("The selected media file is empty (0 bytes). Please choose a valid image or video file.");
  }

  const ext = (file.name || "").split(".").pop()?.toLowerCase() || "";
  const inferredKind = inferLocalMediaKind(file);
  if (expectedKind && inferredKind !== expectedKind) {
    throw new Error(
      expectedKind === "image"
        ? `This slot expects an image file (JPG, PNG, WebP, or AVIF). "${file.name}" looks like a video.`
        : `This slot expects a video file (MP4 or WebM). "${file.name}" looks like an image.`
    );
  }

  const bytes = await readFileHeaderBytes(file, 16);

  if (inferredKind === "image") {
    const allowedImages = ["image/jpeg", "image/png", "image/webp", "image/avif"];
    if (file.type && !allowedImages.includes(file.type)) {
      throw new Error(`Unsupported image format "${file.type}". Use JPG, PNG, WebP, or AVIF.`);
    }
    if (file.size > IMAGE_MAX_BYTES) {
      throw new Error(`"${file.name}" exceeds the 5 MB image upload limit.`);
    }
    const detected = detectImageMimeFromBytes(bytes);
    if (!detected || (file.type && detected !== file.type)) {
      throw new Error(
        `Invalid image file signature for "${file.name}". Please upload an authentic JPG, PNG, WebP, or AVIF image.`
      );
    }
    return {
      kind: "image",
      normalizedMimeType: detected,
      extension: IMAGE_EXTENSIONS[detected] || "webp",
    };
  }

  if (file.size > VIDEO_MAX_BYTES) {
    throw new Error(`"${file.name}" exceeds the 200 MB video upload limit.`);
  }

  const rawType = (file.type || "").toLowerCase();
  if (rawType === "video/quicktime" || ext === "mov") {
    throw new Error(
      `QuickTime (.mov) videos cannot be played across all visitor browsers or uploaded to cloud video storage. Supported formats: MP4 (.mp4) and WebM (.webm). Please export "${file.name}" as MP4 or WebM.`
    );
  }

  const isWebmExt = ext === "webm" || rawType === "video/webm";
  const isMp4Ext = ext === "mp4" || rawType === "video/mp4";

  if (!isWebmExt && !isMp4Ext) {
    throw new Error(
      `Unsupported video format "${rawType || ext || file.name}". Supported formats: MP4 (.mp4) and WebM (.webm).`
    );
  }

  if (isWebmExt) {
    const validEbml =
      bytes.length >= 4 &&
      bytes[0] === 0x1a &&
      bytes[1] === 0x45 &&
      bytes[2] === 0xdf &&
      bytes[3] === 0xa3;
    if (!validEbml) {
      throw new Error(`Invalid WebM video signature for "${file.name}". Please upload an authentic WebM (.webm) video.`);
    }
    if (!checkBrowserVideoCodecSupport("video/webm")) {
      throw new Error(`This browser cannot play WebM videos cleanly. Please use H.264 MP4 (.mp4) instead.`);
    }
    return { kind: "video", normalizedMimeType: "video/webm", extension: "webm" };
  }

  // ISO Base Media File Format (MP4)
  const ftypMarker = asciiSlice(bytes, 4, 8);
  const majorBrand = asciiSlice(bytes, 8, 12);
  if (ftypMarker !== "ftyp" || majorBrand === "qt  ") {
    throw new Error(
      `Invalid MP4 video header for "${file.name}". Export as standard ISO MP4 (H.264/AAC) or WebM (.webm).`
    );
  }
  if (!checkBrowserVideoCodecSupport("video/mp4")) {
    throw new Error(`This browser cannot decode MP4 video playback for "${file.name}".`);
  }

  return { kind: "video", normalizedMimeType: "video/mp4", extension: "mp4" };
};

export const inferLocalMediaKind = (file: Pick<File, "name" | "type">): LocalMediaKind => {
  if (file.type?.startsWith("video/")) return "video";
  if (VIDEO_EXT_RE.test(file.name || "")) return "video";
  return "image";
};

export const saveLocalStagedMedia = async (
  file: File
): Promise<LocalStagedMediaMeta> => {
  const id = `media-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const uri = `${LOCAL_MEDIA_PREFIX}${id}`;
  const kind: LocalMediaKind = inferLocalMediaKind(file);
  const createdAt = new Date().toISOString();

  const ext = (file.name || "").split(".").pop()?.toLowerCase();
  const fallbackVideoMime =
    ext === "webm" ? "video/webm" : ext === "mov" ? "video/quicktime" : "video/mp4";

  const record: LocalStagedMediaRecord = {
    id,
    uri,
    filename: file.name,
    mimeType: file.type || (kind === "video" ? fallbackVideoMime : "image/webp"),
    size: file.size,
    kind,
    createdAt,
    blob: file,
  };

  const objectUrl =
    typeof URL !== "undefined" && typeof URL.createObjectURL === "function"
      ? URL.createObjectURL(file)
      : uri;

  const meta: LocalStagedMediaMeta = {
    id,
    uri,
    filename: record.filename,
    mimeType: record.mimeType,
    size: record.size,
    kind: record.kind,
    createdAt: record.createdAt,
    objectUrl,
  };

  objectUrlCache.set(id, objectUrl);
  metaCache.set(id, meta);
  recordCache.set(id, record);

  const db = await openMediaDb();
  if (db) {
    await new Promise<void>((resolve) => {
      try {
        const tx = db.transaction(STORE_NAME, "readwrite");
        const store = tx.objectStore(STORE_NAME);
        store.put(record);
        tx.oncomplete = () => resolve();
        tx.onerror = () => resolve();
        tx.onabort = () => resolve();
      } catch {
        resolve();
      }
    });
  }

  notifyMediaListeners();
  return meta;
};

export const resolveLocalMediaUri = async (
  rawUrl?: string | null
): Promise<string> => {
  const trimmed = (rawUrl || "").trim();
  if (!trimmed) return "";
  if (!isLocalMediaUri(trimmed)) return trimmed;

  const id = extractLocalMediaId(trimmed);
  const cached = objectUrlCache.get(id);
  if (cached) return cached;

  const db = await openMediaDb();
  if (!db) return "";

  return new Promise<string>((resolve) => {
    try {
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(id);
      req.onsuccess = () => {
        const record = req.result as LocalStagedMediaRecord | undefined;
        if (record?.blob && typeof URL !== "undefined" && typeof URL.createObjectURL === "function") {
          const objUrl = URL.createObjectURL(record.blob);
          objectUrlCache.set(id, objUrl);
          metaCache.set(id, {
            id: record.id,
            uri: record.uri,
            filename: record.filename,
            mimeType: record.mimeType,
            size: record.size,
            kind: record.kind,
            createdAt: record.createdAt,
            objectUrl: objUrl,
          });
          recordCache.set(id, record);
          resolve(objUrl);
        } else {
          resolve("");
        }
      };
      req.onerror = () => resolve("");
    } catch {
      resolve("");
    }
  });
};

export const getLocalStagedMediaRecord = async (
  uriOrId: string
): Promise<LocalStagedMediaRecord | null> => {
  const id = extractLocalMediaId((uriOrId || "").trim());
  if (!id) return null;

  const cached = recordCache.get(id);
  if (cached) return cached;

  const db = await openMediaDb();
  if (!db) return null;

  return new Promise<LocalStagedMediaRecord | null>((resolve) => {
    try {
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(id);
      req.onsuccess = () => {
        const record = req.result as LocalStagedMediaRecord | undefined;
        if (record?.blob) {
          recordCache.set(id, record);
          resolve(record);
        } else {
          resolve(null);
        }
      };
      req.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
};

export const listLocalStagedMedia = async (): Promise<LocalStagedMediaMeta[]> => {
  const db = await openMediaDb();
  if (!db) {
    return Array.from(metaCache.values()).sort((a, b) =>
      b.createdAt.localeCompare(a.createdAt)
    );
  }

  return new Promise<LocalStagedMediaMeta[]>((resolve) => {
    try {
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAll();
      req.onsuccess = () => {
        const records = (req.result || []) as LocalStagedMediaRecord[];
        const metas: LocalStagedMediaMeta[] = records.map((rec) => {
          let objUrl = objectUrlCache.get(rec.id);
          if (!objUrl && rec.blob && typeof URL !== "undefined" && typeof URL.createObjectURL === "function") {
            objUrl = URL.createObjectURL(rec.blob);
            objectUrlCache.set(rec.id, objUrl);
          }
          const meta: LocalStagedMediaMeta = {
            id: rec.id,
            uri: rec.uri,
            filename: rec.filename,
            mimeType: rec.mimeType,
            size: rec.size,
            kind: rec.kind,
            createdAt: rec.createdAt,
            objectUrl: objUrl || "",
          };
          metaCache.set(rec.id, meta);
          return meta;
        });
        metas.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
        resolve(metas);
      };
      req.onerror = () => resolve(Array.from(metaCache.values()));
    } catch {
      resolve(Array.from(metaCache.values()));
    }
  });
};

export const deleteLocalStagedMedia = async (uriOrId: string): Promise<void> => {
  const id = extractLocalMediaId(uriOrId);
  const existingUrl = objectUrlCache.get(id);
  if (existingUrl && typeof URL !== "undefined" && typeof URL.revokeObjectURL === "function") {
    try {
      URL.revokeObjectURL(existingUrl);
    } catch {
      // ignore
    }
  }
  objectUrlCache.delete(id);
  metaCache.delete(id);
  recordCache.delete(id);

  const db = await openMediaDb();
  if (db) {
    await new Promise<void>((resolve) => {
      try {
        const tx = db.transaction(STORE_NAME, "readwrite");
        const store = tx.objectStore(STORE_NAME);
        store.delete(id);
        tx.oncomplete = () => resolve();
        tx.onerror = () => resolve();
      } catch {
        resolve();
      }
    });
  }
  notifyMediaListeners();
};

export const useResolvedMediaUrl = (rawUrl?: string | null) => {
  const trimmed = (rawUrl || "").trim();
  const classification = classifyMediaSource(trimmed);
  const [resolvedUrl, setResolvedUrl] = useState<string>(() => {
    if (!trimmed) return "";
    if (!isLocalMediaUri(trimmed)) return trimmed;
    const id = extractLocalMediaId(trimmed);
    return objectUrlCache.get(id) || "";
  });
  const [isLoading, setIsLoading] = useState<boolean>(() =>
    Boolean(isLocalMediaUri(trimmed) && !objectUrlCache.has(extractLocalMediaId(trimmed)))
  );

  useEffect(() => {
    let active = true;
    if (!trimmed) {
      setResolvedUrl("");
      setIsLoading(false);
      return;
    }
    if (!isLocalMediaUri(trimmed)) {
      setResolvedUrl(trimmed);
      setIsLoading(false);
      return;
    }

    const id = extractLocalMediaId(trimmed);
    const cached = objectUrlCache.get(id);
    if (cached) {
      setResolvedUrl(cached);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    resolveLocalMediaUri(trimmed).then((url) => {
      if (active) {
        setResolvedUrl(url);
        setIsLoading(false);
      }
    });

    const unsub = subscribeToLocalMedia(() => {
      resolveLocalMediaUri(trimmed).then((url) => {
        if (active) {
          setResolvedUrl(url);
          setIsLoading(false);
        }
      });
    });

    return () => {
      active = false;
      unsub();
    };
  }, [trimmed]);

  return {
    resolvedUrl,
    isLoading,
    sourceKind: classification.kind,
    sourceLabel: classification.label,
  };
};
