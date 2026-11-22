import type { CSSProperties } from "react";
import type { HomepageMediaFit, ResponsiveImageTransform } from "./types";

export const HERO_IMAGE_SCALE_MIN = 50;
export const HERO_IMAGE_SCALE_MAX = 160;
export const HERO_IMAGE_SCALE_DEFAULT = 100;

export const HERO_IMAGE_OFFSET_MIN = -45;
export const HERO_IMAGE_OFFSET_MAX = 45;
export const HERO_IMAGE_OFFSET_DEFAULT = 0;

export type NormalizedHeroImageTransform = Required<ResponsiveImageTransform>;

export const DEFAULT_HERO_IMAGE_TRANSFORM: NormalizedHeroImageTransform = {
  desktopScale: HERO_IMAGE_SCALE_DEFAULT,
  desktopOffsetX: HERO_IMAGE_OFFSET_DEFAULT,
  desktopOffsetY: HERO_IMAGE_OFFSET_DEFAULT,
  mobileScale: HERO_IMAGE_SCALE_DEFAULT,
  mobileOffsetX: HERO_IMAGE_OFFSET_DEFAULT,
  mobileOffsetY: HERO_IMAGE_OFFSET_DEFAULT,
};

function clampNumber(value: unknown, min: number, max: number, fallback: number): number {
  const num = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(num)) return fallback;
  return Math.round(Math.min(max, Math.max(min, num)));
}

export function normalizeHeroImageTransform(
  raw?: ResponsiveImageTransform | null
): NormalizedHeroImageTransform {
  if (!raw || typeof raw !== "object") {
    return { ...DEFAULT_HERO_IMAGE_TRANSFORM };
  }
  return {
    desktopScale: clampNumber(
      raw.desktopScale,
      HERO_IMAGE_SCALE_MIN,
      HERO_IMAGE_SCALE_MAX,
      HERO_IMAGE_SCALE_DEFAULT
    ),
    desktopOffsetX: clampNumber(
      raw.desktopOffsetX,
      HERO_IMAGE_OFFSET_MIN,
      HERO_IMAGE_OFFSET_MAX,
      HERO_IMAGE_OFFSET_DEFAULT
    ),
    desktopOffsetY: clampNumber(
      raw.desktopOffsetY,
      HERO_IMAGE_OFFSET_MIN,
      HERO_IMAGE_OFFSET_MAX,
      HERO_IMAGE_OFFSET_DEFAULT
    ),
    mobileScale: clampNumber(
      raw.mobileScale,
      HERO_IMAGE_SCALE_MIN,
      HERO_IMAGE_SCALE_MAX,
      HERO_IMAGE_SCALE_DEFAULT
    ),
    mobileOffsetX: clampNumber(
      raw.mobileOffsetX,
      HERO_IMAGE_OFFSET_MIN,
      HERO_IMAGE_OFFSET_MAX,
      HERO_IMAGE_OFFSET_DEFAULT
    ),
    mobileOffsetY: clampNumber(
      raw.mobileOffsetY,
      HERO_IMAGE_OFFSET_MIN,
      HERO_IMAGE_OFFSET_MAX,
      HERO_IMAGE_OFFSET_DEFAULT
    ),
  };
}

export function hasCustomHeroImageTransform(
  raw?: ResponsiveImageTransform | null,
  viewport: "desktop" | "mobile" | "any" = "any"
): boolean {
  const n = normalizeHeroImageTransform(raw);
  const desktopChanged =
    n.desktopScale !== HERO_IMAGE_SCALE_DEFAULT ||
    n.desktopOffsetX !== HERO_IMAGE_OFFSET_DEFAULT ||
    n.desktopOffsetY !== HERO_IMAGE_OFFSET_DEFAULT;
  const mobileChanged =
    n.mobileScale !== HERO_IMAGE_SCALE_DEFAULT ||
    n.mobileOffsetX !== HERO_IMAGE_OFFSET_DEFAULT ||
    n.mobileOffsetY !== HERO_IMAGE_OFFSET_DEFAULT;

  if (viewport === "desktop") return desktopChanged;
  if (viewport === "mobile") return mobileChanged;
  return desktopChanged || mobileChanged;
}

/**
 * Strips default-only transform payloads down to `undefined` so existing untouched
 * campaigns remain byte-clean and backward-compatible in Supabase JSONB storage.
 */
export function sanitizeHeroImageTransformForStorage(
  raw?: ResponsiveImageTransform | null
): ResponsiveImageTransform | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const normalized = normalizeHeroImageTransform(raw);
  if (!hasCustomHeroImageTransform(normalized, "any")) {
    return undefined;
  }
  return normalized;
}

export function resetHeroImageTransformViewport(
  raw: ResponsiveImageTransform | null | undefined,
  viewport: "desktop" | "mobile" | "all"
): ResponsiveImageTransform | undefined {
  if (viewport === "all") return undefined;
  const current = normalizeHeroImageTransform(raw);
  if (viewport === "desktop") {
    return sanitizeHeroImageTransformForStorage({
      ...current,
      desktopScale: HERO_IMAGE_SCALE_DEFAULT,
      desktopOffsetX: HERO_IMAGE_OFFSET_DEFAULT,
      desktopOffsetY: HERO_IMAGE_OFFSET_DEFAULT,
    });
  }
  return sanitizeHeroImageTransformForStorage({
    ...current,
    mobileScale: HERO_IMAGE_SCALE_DEFAULT,
    mobileOffsetX: HERO_IMAGE_OFFSET_DEFAULT,
    mobileOffsetY: HERO_IMAGE_OFFSET_DEFAULT,
  });
}

export function copyDesktopToMobileHeroTransform(
  raw?: ResponsiveImageTransform | null
): ResponsiveImageTransform | undefined {
  const current = normalizeHeroImageTransform(raw);
  return sanitizeHeroImageTransformForStorage({
    ...current,
    mobileScale: current.desktopScale,
    mobileOffsetX: current.desktopOffsetX,
    mobileOffsetY: current.desktopOffsetY,
  });
}

export function resolveAnchorCoords(pos?: string): { x: number; y: number; css: string } {
  switch ((pos || "").trim().toLowerCase()) {
    case "top":
    case "center top":
      return { x: 50, y: 0, css: "center top" };
    case "bottom":
    case "center bottom":
      return { x: 50, y: 100, css: "center bottom" };
    case "left":
    case "left center":
      return { x: 0, y: 50, css: "left center" };
    case "right":
    case "right center":
      return { x: 100, y: 50, css: "right center" };
    case "center":
    case "center center":
      return { x: 50, y: 50, css: "center center" };
    default:
      return { x: 50, y: 100, css: pos?.trim() || "center bottom" };
  }
}

export interface ResolvedHeroImagePresentation {
  style: CSSProperties;
  scale: number;
  offsetX: number;
  offsetY: number;
  isCustomized: boolean;
}

/**
 * Computes proportional, aspect-ratio-safe CSS presentation styles for Homepage Hero images.
 * - Strictly preserves aspect ratio via uniform scale() + object-fit (never independent X/Y stretch).
 * - In `contain` mode (default): anchors transform-origin to `mediaPosition` (e.g. `center bottom`)
 *   so scaling up/down never crops the anchored base edge, while independent X/Y offsets translate
 *   smoothly on both axes regardless of container aspect ratio.
 * - In `cover` mode: shifts `object-position` cleanly within 0%..100% and zooms proportionally
 *   around the chosen focal point so full-bleed heroes never expose unintended bare gaps when panned.
 * - When all controls for the active viewport are at default (100% / 0% / 0%), emits zero CSS
 *   transform properties so existing campaigns render identically to before.
 */
export function resolveHeroImagePresentationStyle(params: {
  transform?: ResponsiveImageTransform | null;
  isMobile: boolean;
  mediaFit?: HomepageMediaFit;
  mediaPosition?: string;
  mixBlendMode?: "normal" | "multiply";
}): ResolvedHeroImagePresentation {
  const mediaFit: HomepageMediaFit = params.mediaFit === "cover" ? "cover" : "contain";
  const anchor = resolveAnchorCoords(
    params.mediaPosition || (mediaFit === "cover" ? "center" : "bottom")
  );
  const normalized = normalizeHeroImageTransform(params.transform);

  const scale = params.isMobile ? normalized.mobileScale : normalized.desktopScale;
  const offsetX = params.isMobile ? normalized.mobileOffsetX : normalized.desktopOffsetX;
  const offsetY = params.isMobile ? normalized.mobileOffsetY : normalized.desktopOffsetY;

  const isCustomized =
    scale !== HERO_IMAGE_SCALE_DEFAULT ||
    offsetX !== HERO_IMAGE_OFFSET_DEFAULT ||
    offsetY !== HERO_IMAGE_OFFSET_DEFAULT;

  const baseStyle: CSSProperties = {
    objectFit: mediaFit,
    objectPosition: anchor.css,
    ...(params.mixBlendMode ? { mixBlendMode: params.mixBlendMode } : {}),
  };

  if (!isCustomized) {
    return {
      style: baseStyle,
      scale,
      offsetX,
      offsetY,
      isCustomized: false,
    };
  }

  const scaleFactor = Number((scale / 100).toFixed(4));

  if (mediaFit === "cover") {
    const posX = Math.min(100, Math.max(0, anchor.x + offsetX));
    const posY = Math.min(100, Math.max(0, anchor.y + offsetY));
    const focalCss = `${posX}% ${posY}%`;
    return {
      style: {
        ...baseStyle,
        objectPosition: focalCss,
        ...(scale !== HERO_IMAGE_SCALE_DEFAULT
          ? {
              transform: `scale(${scaleFactor})`,
              transformOrigin: focalCss,
            }
          : {}),
      },
      scale,
      offsetX,
      offsetY,
      isCustomized: true,
    };
  }

  // `contain` mode: uniform scale anchored to `anchor.css` + independent horizontal & vertical positioning
  const transformParts: string[] = [];
  if (offsetX !== 0 || offsetY !== 0) {
    transformParts.push(`translate3d(${offsetX}%, ${offsetY}%, 0)`);
  }
  if (scale !== HERO_IMAGE_SCALE_DEFAULT) {
    transformParts.push(`scale(${scaleFactor})`);
  }

  return {
    style: {
      ...baseStyle,
      transform: transformParts.join(" "),
      transformOrigin: anchor.css,
    },
    scale,
    offsetX,
    offsetY,
    isCustomized: true,
  };
}

export function isHeroFramingNearBoundary(params: {
  scale: number;
  offsetX: number;
  offsetY: number;
}): boolean {
  return (
    params.scale > 135 ||
    Math.abs(params.offsetX) > 28 ||
    params.offsetY < -24 ||
    params.offsetY > 28
  );
}
