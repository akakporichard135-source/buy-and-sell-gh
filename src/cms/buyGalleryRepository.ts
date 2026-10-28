// ==============================================================================
// Buy Page Gallery Repository for Buy & Sell GH
// Manages draft and published Buy Page image galleries for every product in the catalog.
// Supports view, upload, replace, delete, reorder, primary designation, and finish mapping.
// ==============================================================================

import { useState, useEffect } from "react";
import { supabase, isSupabaseConfigured } from "../lib/supabase";

import { broadcastPublishedUpdate, subscribeToPublishedUpdates } from "../utils/imageVersioning";
import type { Product, ProductImage } from "../types/product";
import { resolveProductColorGallery, resolveProductColorImage } from "../utils/productColorImages";
import { resolveAdminProductImage } from "../utils/productImages";
import { localCatalogueImageBySlug } from "../utils/catalogueProductImages";

export interface BuyGalleryItem {
  id: string;
  src: string;
  alt: string;
  title?: string;
  colorFinish?: string;
  isMain?: boolean;
  position: number;
  uploadedAt?: string;
}

export interface ProductBuyGallery {
  slug: string;
  productName: string;
  updatedAt: string;
  publishedAt?: string;
  isPublished: boolean;
  hasDraft?: boolean;
  items: BuyGalleryItem[];
  finishItems?: Record<string, BuyGalleryItem[]>;
}

const STORAGE_KEY_PUBLISHED = "buy_galleries_published_v1";
const STORAGE_KEY_DRAFTS = "buy_galleries_drafts_v1";

// In-memory fast cache
let publishedCache: Record<string, ProductBuyGallery> | null = null;
let draftCache: Record<string, ProductBuyGallery> | null = null;
let publishedLoaded = false;
let publishedLoadPromise: Promise<Record<string, ProductBuyGallery>> | null = null;

function readStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeStorage<T>(key: string, data: T): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {
    // Non-blocking quota safe
  }
}

function isPreviewEnvironment(): boolean {
  if (typeof window === "undefined") return false;
  const host = window.location.hostname;
  return host.includes("vercel.app") || host.includes("localhost") || host === "127.0.0.1";
}

/**
 * Generate default seed gallery for any product based on verified catalogue assets
 */
export function buildDefaultBuyGallery(product: Product, finish?: string): ProductBuyGallery {
  const slug = product.slug;
  const name = product.name;
  const defaultFinish = finish || product.defaultColor || product.colors?.[0] || "";

  // 1. If product has custom uploaded images in its record
  if (product.images && product.images.length > 0) {
    const mainIdx = Math.max(0, product.primaryImageIndex ?? 0);
    const items: BuyGalleryItem[] = product.images.map((img, idx) => ({
      id: `${slug}-img-${idx}-${Date.now()}`,
      src: img.src,
      alt: img.alt || `${name} view ${idx + 1}`,
      title: idx === mainIdx ? "Primary View" : `Gallery Angle ${idx + 1}`,
      isMain: idx === mainIdx,
      position: idx,
      uploadedAt: new Date().toISOString(),
    }));

    return {
      slug,
      productName: name,
      updatedAt: new Date().toISOString(),
      isPublished: true,
      hasDraft: false,
      items,
    };
  }

  // 2. Resolve via authentic catalogue color gallery
  const defaultGalleryImages = resolveProductColorGallery(product, defaultFinish);
  const items: BuyGalleryItem[] = defaultGalleryImages.map((img, idx) => ({
    id: `${slug}-seed-${idx}`,
    src: img.src,
    alt: img.alt || `${name} view ${idx + 1}`,
    title: idx === 0 ? "Hero Presentation" : `Angle ${idx + 1}`,
    isMain: idx === 0,
    position: idx,
    colorFinish: defaultFinish,
    uploadedAt: new Date().toISOString(),
  }));

  // Build per-finish items if product has colors
  const finishItems: Record<string, BuyGalleryItem[]> = {};
  if (product.colors && product.colors.length > 0) {
    for (const c of product.colors) {
      const cImg = resolveProductColorImage(product, c);
      if (cImg) {
        finishItems[c] = [
          {
            id: `${slug}-finish-${c}`,
            src: cImg,
            alt: `${name} in ${c}`,
            title: `${c} Finish View`,
            colorFinish: c,
            isMain: true,
            position: 0,
            uploadedAt: new Date().toISOString(),
          },
          ...items.filter((it, idx) => idx > 0).map((it, idx) => ({
            ...it,
            id: `${slug}-finish-${c}-angle-${idx}`,
            position: idx + 1,
          })),
        ];
      }
    }
  }

  return {
    slug,
    productName: name,
    updatedAt: new Date().toISOString(),
    isPublished: true,
    hasDraft: false,
    items: items.length > 0 ? items : [
      {
        id: `${slug}-fallback`,
        src: localCatalogueImageBySlug[slug] || "/brand/buy-sell-gh-logo-scene.webp",
        alt: `${name} official product presentation`,
        title: "Standard Presentation",
        isMain: true,
        position: 0,
        uploadedAt: new Date().toISOString(),
      },
    ],
    finishItems: Object.keys(finishItems).length > 0 ? finishItems : undefined,
  };
}

/**
 * Synchronous read of published gallery from cache or localStorage
 */
export function getPublishedBuyGallerySync(slug: string, fallbackCandidates?: string[]): ProductBuyGallery | null {
  if (!slug) return null;
  if (!publishedCache) {
    publishedCache = isSupabaseConfigured() && !isPreviewEnvironment()
      ? {}
      : readStorage<Record<string, ProductBuyGallery>>(STORAGE_KEY_PUBLISHED, {});
  }
  if (publishedCache[slug]) return publishedCache[slug];

  // Check normalized slug (e.g. without "-inch-")
  const normSlug = slug.replace(/-inch-/g, "-").toLowerCase();
  for (const [key, val] of Object.entries(publishedCache)) {
    if (key.replace(/-inch-/g, "-").toLowerCase() === normSlug) {
      return val;
    }
  }

  // Check fallback candidates
  if (fallbackCandidates && fallbackCandidates.length > 0) {
    for (const cand of fallbackCandidates) {
      if (publishedCache[cand]) return publishedCache[cand];
      const normCand = cand.replace(/-inch-/g, "-").toLowerCase();
      for (const [key, val] of Object.entries(publishedCache)) {
        if (key.replace(/-inch-/g, "-").toLowerCase() === normCand) {
          return val;
        }
      }
    }
  }

  return null;
}

/**
 * Synchronous read of draft gallery from cache or localStorage
 */
export function getDraftBuyGallerySync(slug: string): ProductBuyGallery | null {
  if (!slug) return null;
  if (!draftCache) {
    draftCache = readStorage<Record<string, ProductBuyGallery>>(STORAGE_KEY_DRAFTS, {});
  }
  return draftCache[slug] || null;
}

/**
 * Fetch all published galleries from Supabase storefront_content
 */
export async function fetchAllPublishedBuyGalleries(force = false): Promise<Record<string, ProductBuyGallery>> {
  const local = readStorage<Record<string, ProductBuyGallery>>(STORAGE_KEY_PUBLISHED, {});
  if (!supabase || !isSupabaseConfigured()) {
    publishedCache = local;
    publishedLoaded = true;
    return local;
  }
  if (publishedLoaded && !force) return publishedCache ?? {};
  if (publishedLoadPromise) return publishedLoadPromise;

  publishedLoadPromise = (async () => {
    const { data, error } = await supabase
      .from("storefront_content")
      .select("config")
      .eq("key", "buy_galleries")
      .maybeSingle();
    if (error) throw new Error(`Could not load published Buy galleries: ${error.message}`);
    const remote = data?.config && typeof data.config === "object" && !Array.isArray(data.config)
      ? data.config as Record<string, ProductBuyGallery>
      : {};
    const resolved = isPreviewEnvironment() ? { ...remote, ...local } : remote;
    publishedCache = resolved;
    publishedLoaded = true;
    writeStorage(STORAGE_KEY_PUBLISHED, resolved);
    return resolved;
  })();
  try {
    return await publishedLoadPromise;
  } catch (error) {
    if (!isPreviewEnvironment()) publishedCache = {};
    throw error;
  } finally {
    publishedLoadPromise = null;
  }
}

/**
 * Fetch single product published gallery
 */
export async function fetchPublishedBuyGallery(slug: string): Promise<ProductBuyGallery | null> {
  if (!slug) return null;
  const all = await fetchAllPublishedBuyGalleries();
  return all[slug] || null;
}

/**
 * Save draft gallery
 */
export async function saveDraftBuyGallery(
  slug: string,
  gallery: ProductBuyGallery
): Promise<ProductBuyGallery> {
  if (!slug) throw new Error("Product slug is required");

  const updatedDraft: ProductBuyGallery = {
    ...gallery,
    slug,
    updatedAt: new Date().toISOString(),
    hasDraft: true,
  };

  const drafts = { ...readStorage<Record<string, ProductBuyGallery>>(STORAGE_KEY_DRAFTS, {}) };
  drafts[slug] = updatedDraft;

  if (supabase && isSupabaseConfigured() && !isPreviewEnvironment()) {
    const { data, error: readError } = await supabase.from("storefront_content")
      .select("config").eq("key", "buy_galleries_drafts").maybeSingle();
    if (readError) throw new Error(`Could not load gallery drafts: ${readError.message}`);
    const remoteDrafts = data?.config && typeof data.config === "object" && !Array.isArray(data.config)
      ? data.config as Record<string, ProductBuyGallery>
      : {};
    const { error: saveError } = await supabase.from("storefront_content").upsert({
      key: "buy_galleries_drafts",
      config: { ...remoteDrafts, [slug]: updatedDraft },
      updated_at: new Date().toISOString(),
    });
    if (saveError) throw new Error(`Could not save gallery draft: ${saveError.message}`);
  }

  draftCache = drafts;
  writeStorage(STORAGE_KEY_DRAFTS, drafts);

  broadcastPublishedUpdate("product", slug);
  return updatedDraft;
}

/**
 * Publish gallery live
 * Saves to published collection, updates product record's primary image & thumbnail,
 * and clears draft.
 */
export async function publishBuyGallery(
  slug: string,
  gallery: ProductBuyGallery,
  catalogProduct?: Product,
  onProductUpdated?: (updated: Product) => void
): Promise<ProductBuyGallery> {
  if (!slug) throw new Error("Product slug is required");

  // Re-sort items by position and ensure primary image is index 0
  const sortedItems = gallery.items.map((item) => ({ ...item })).sort((a, b) => a.position - b.position);
  let mainItemIndex = sortedItems.findIndex((it) => it.isMain);
  if (mainItemIndex < 0 && sortedItems.length > 0) {
    sortedItems[0].isMain = true;
    mainItemIndex = 0;
  }

  // Put main item at index 0 for consistent storefront ordering
  if (mainItemIndex > 0) {
    const [mainItem] = sortedItems.splice(mainItemIndex, 1);
    sortedItems.unshift(mainItem);
    // Re-index positions
    sortedItems.forEach((it, idx) => {
      it.position = idx;
    });
  }

  const remoteWrite = Boolean(supabase && isSupabaseConfigured() && !isPreviewEnvironment());
  const currentPublished = remoteWrite
    ? await fetchAllPublishedBuyGalleries(true)
    : readStorage<Record<string, ProductBuyGallery>>(STORAGE_KEY_PUBLISHED, {});
  const previousItems = currentPublished[slug]?.items;
  const mainGalleryChanged = gallery.hasDraft && (!previousItems ||
    JSON.stringify(previousItems) !== JSON.stringify(sortedItems));
  const published: ProductBuyGallery = {
    ...gallery,
    slug,
    items: sortedItems,
    finishItems: mainGalleryChanged ? undefined : gallery.finishItems,
    updatedAt: new Date().toISOString(),
    publishedAt: new Date().toISOString(),
    isPublished: true,
    hasDraft: false,
  };
  const publishedMap = { ...currentPublished, [slug]: published };
  if (remoteWrite && supabase) {
    const { error: sbError } = await supabase.from("storefront_content").upsert({
      key: "buy_galleries",
      config: publishedMap,
      updated_at: new Date().toISOString(),
    });
    if (sbError) throw new Error(`Failed to save published gallery to database: ${sbError.message}`);
  }

  publishedCache = publishedMap;
  publishedLoaded = true;
  writeStorage(STORAGE_KEY_PUBLISHED, publishedMap);
  const drafts = { ...readStorage<Record<string, ProductBuyGallery>>(STORAGE_KEY_DRAFTS, {}) };
  delete drafts[slug];
  draftCache = drafts;
  writeStorage(STORAGE_KEY_DRAFTS, drafts);

  if (remoteWrite && supabase) {
    const { data, error: readError } = await supabase.from("storefront_content")
      .select("config").eq("key", "buy_galleries_drafts").maybeSingle();
    if (readError) {
      console.warn("Published gallery is live, but draft cleanup could not load drafts:", readError);
    }
    const remoteDrafts = data?.config && typeof data.config === "object" && !Array.isArray(data.config)
      ? { ...data.config as Record<string, ProductBuyGallery> }
      : {};
    delete remoteDrafts[slug];
    const { error: draftError } = await supabase.from("storefront_content").upsert({
      key: "buy_galleries_drafts",
      config: remoteDrafts,
      updated_at: new Date().toISOString(),
    });
    if (draftError) console.warn("Published gallery is live, but draft cleanup failed:", draftError);
  }

  // 4. Synchronize with Product record (images, thumbnail, primary_image)
  if (catalogProduct) {
    const updatedImages: ProductImage[] = sortedItems.map((it) => ({
      src: it.src,
      alt: it.alt || catalogProduct.name,
    }));

    const primarySrc = sortedItems[0]?.src || catalogProduct.thumbnail || "";

    const updatedProduct: Product = {
      ...catalogProduct,
      images: updatedImages,
      thumbnail: primarySrc,
      primaryImageIndex: 0,
    };

    if (onProductUpdated) {
      onProductUpdated(updatedProduct);
    }

    // Try direct DB update on products table if available
    if (supabase && isSupabaseConfigured() && !isPreviewEnvironment()) {
      try {
        await supabase
          .from("products")
          .update({
            images: updatedImages,
            primary_image: 0,
            updated_at: new Date().toISOString(),
          })
          .eq("slug", slug);
      } catch {
        // Non-blocking fallback
      }
    }
  }

  // 5. Broadcast update to all open tabs and windows
  broadcastPublishedUpdate("product", slug);
  broadcastPublishedUpdate("storefront");

  return published;
}

/**
 * Discard draft and revert to published
 */
export async function discardDraftBuyGallery(slug: string): Promise<void> {
  if (supabase && isSupabaseConfigured() && !isPreviewEnvironment()) {
    const { data, error: readError } = await supabase.from("storefront_content")
      .select("config").eq("key", "buy_galleries_drafts").maybeSingle();
    if (readError) throw new Error(`Could not load gallery drafts: ${readError.message}`);
    const remoteDrafts = data?.config && typeof data.config === "object" && !Array.isArray(data.config)
      ? { ...data.config as Record<string, ProductBuyGallery> }
      : {};
    delete remoteDrafts[slug];
    const { error } = await supabase.from("storefront_content").upsert({
      key: "buy_galleries_drafts",
      config: remoteDrafts,
      updated_at: new Date().toISOString(),
    });
    if (error) throw new Error(`Could not discard gallery draft: ${error.message}`);
  }

  const drafts = { ...readStorage<Record<string, ProductBuyGallery>>(STORAGE_KEY_DRAFTS, {}) };
  delete drafts[slug];
  draftCache = drafts;
  writeStorage(STORAGE_KEY_DRAFTS, drafts);

  broadcastPublishedUpdate("product", slug);
}

/**
 * React Hook for consuming the active Buy Gallery in Buy experiences
 */
export function useBuyGallery(
  product?: Product,
  selectedFinish?: string
): {
  gallery: ProductBuyGallery;
  images: { src: string; alt: string }[];
  mainImage: { src: string; alt: string };
  isCustomPublished: boolean;
} {
  const slug = product?.slug || "";
  const [, setVersion] = useState(0);

  useEffect(() => {
    let mounted = true;
    const refresh = () => {
      void fetchAllPublishedBuyGalleries(true)
        .catch(() => null)
        .then(() => {
          if (mounted) setVersion((v) => v + 1);
        });
    };
    refresh();
    const unsubscribe = subscribeToPublishedUpdates((msg) => {
      if ((msg.type === "product" && (!msg.id || msg.id === slug)) || msg.type === "storefront") {
        refresh();
      }
    });
    return () => {
      mounted = false;
      unsubscribe();
    };
  }, [slug]);

  // Read published or build default
  const published = getPublishedBuyGallerySync(slug);
  const defaultGallery = product ? buildDefaultBuyGallery(product, selectedFinish) : null;
  const activeGallery = published || defaultGallery;

  // Resolve finish-specific images if available
  let resolvedItems = activeGallery?.items || [];
  if (selectedFinish && activeGallery?.finishItems?.[selectedFinish]?.length) {
    resolvedItems = activeGallery.finishItems[selectedFinish];
  }

  // If a finish is selected and an item matches it, prioritize that finish item
  if (selectedFinish && !activeGallery?.finishItems?.[selectedFinish]) {
    const matchingFinishItem = resolvedItems.find(
      (it) => it.colorFinish && it.colorFinish.toLowerCase() === selectedFinish.toLowerCase()
    );
    if (matchingFinishItem) {
      resolvedItems = [
        matchingFinishItem,
        ...resolvedItems.filter((it) => it.id !== matchingFinishItem.id),
      ];
    }
  }

  const images = resolvedItems.map((it) => ({
    src: it.src,
    alt: it.alt || product?.name || "Product image",
  }));

  const mainImage = images[0] || {
    src: product?.thumbnail || "/brand/buy-sell-gh-logo-scene.webp",
    alt: product?.name || "Product",
  };

  return {
    gallery: activeGallery || {
      slug,
      productName: product?.name || "",
      updatedAt: new Date().toISOString(),
      isPublished: false,
      items: [],
    },
    images: images.length > 0 ? images : [mainImage],
    mainImage,
    isCustomPublished: Boolean(published),
  };
}
