// ==============================================================================
// Universal Product Color Image & Gallery Resolution System for Buy & Sell GH
// Ensures every product and genuine Apple finish has an authentic, high-res image
// with instant switching, angle gallery thumbnails, and preloading.
// ==============================================================================

import type { Product } from "../types/product";
import { localCatalogueImageBySlug } from "./catalogueProductImages";
import { hasOwnerUploadedProductImages } from "./productImages";

// Cache for preloaded image URLs so they are only fetched once per session
const PRELOADED_CACHE = new Set<string>();

/**
 * Preload an array of image URLs to guarantee zero-flicker instant switching
 */
export function preloadProductImages(urls: (string | undefined | null)[]): void {
  if (typeof window === "undefined") return;

  for (const url of urls) {
    if (!url || typeof url !== "string" || PRELOADED_CACHE.has(url)) continue;
    PRELOADED_CACHE.add(url);
    const img = new Image();
    img.decoding = "async";
    img.src = url;
  }
}

// --------------------------------------------------------------------------
// iPhone 18 Pro & Pro Max Special Visual Assets
// --------------------------------------------------------------------------
const IPHONE_18_PRO_COLOR_MAP: Record<string, string> = {
  "deep burgundy": "/products/campaigns/iphone-18-pro-burgundy-finish.webp",
  burgundy: "/products/campaigns/iphone-18-pro-burgundy-finish.webp",
  "space black": "/products/buy/iphone-18-pro-colors-white.png",
  black: "/products/buy/iphone-18-pro-colors-white.png",
  "natural titanium": "/products/campaigns/iphone-18-pro-silver.webp",
  natural: "/products/campaigns/iphone-18-pro-silver.webp",
  silver: "/products/campaigns/iphone-18-pro-silver.webp",
  "light blue": "/products/story/iphone-18-pro-supplied-blue-front-back.jpg",
  blue: "/products/story/iphone-18-pro-supplied-blue-front-back.jpg",
};

// --------------------------------------------------------------------------
// MacBook Air Special Visual Assets
// --------------------------------------------------------------------------
const MACBOOK_AIR_COLOR_MAP: Record<string, string> = {
  midnight: "/products/buy/macbook-air-buy-showcase.jpg",
  starlight: "/products/campaigns/macbook-air-starlight-studio.jpg",
  "space gray": localCatalogueImageBySlug["macbook-air-13-m3"] || "/products/campaigns/macbook-air-floating.webp",
  "space grey": localCatalogueImageBySlug["macbook-air-13-m3"] || "/products/campaigns/macbook-air-floating.webp",
  silver: localCatalogueImageBySlug["macbook-air-13-m4"] || "/products/campaigns/macbook-air-lineup.webp",
  "sky blue": localCatalogueImageBySlug["macbook-air-15-m5"] || "/products/campaigns/macbook-air-cinematic.webp",
  gold: localCatalogueImageBySlug["macbook-air-13-m1"] || "/products/campaigns/macbook-air-floating.webp",
};

// --------------------------------------------------------------------------
// MacBook Pro Special Visual Assets
// --------------------------------------------------------------------------
const MACBOOK_PRO_COLOR_MAP: Record<string, string> = {
  "space black": localCatalogueImageBySlug["macbook-pro-14-m4"] || "/products/campaigns/macbook-pro-cutout.webp",
  black: localCatalogueImageBySlug["macbook-pro-14-m4"] || "/products/campaigns/macbook-pro-cutout.webp",
  silver: localCatalogueImageBySlug["macbook-pro-14-m4-pro-max"] || localCatalogueImageBySlug["macbook-pro-14-m3"] || "/products/campaigns/macbook-pro-cinematic.webp",
  "space gray": localCatalogueImageBySlug["macbook-pro-14-m1-pro-max"] || localCatalogueImageBySlug["macbook-pro-16-m2-pro-max"] || "/products/campaigns/macbook-pro-cutout.webp",
  "space grey": localCatalogueImageBySlug["macbook-pro-14-m1-pro-max"] || localCatalogueImageBySlug["macbook-pro-16-m2-pro-max"] || "/products/campaigns/macbook-pro-cutout.webp",
};

// --------------------------------------------------------------------------
// iPad Pro Special Visual Assets
// --------------------------------------------------------------------------
const IPAD_PRO_COLOR_MAP: Record<string, string> = {
  "space black": localCatalogueImageBySlug["ipad-pro-11-inch-m4"] || "/products/campaigns/ipad-pro-11.webp",
  black: localCatalogueImageBySlug["ipad-pro-11-inch-m4"] || "/products/campaigns/ipad-pro-11.webp",
  silver: localCatalogueImageBySlug["ipad-pro-13-inch-m4"] || "/products/campaigns/ipad-pro-13.webp",
  "space gray": localCatalogueImageBySlug["ipad-pro-11-inch-m2"] || localCatalogueImageBySlug["ipad-pro-12-9-inch-m2"] || "/products/campaigns/ipad-pro-cinematic.webp",
  "space grey": localCatalogueImageBySlug["ipad-pro-11-inch-m2"] || localCatalogueImageBySlug["ipad-pro-12-9-inch-m2"] || "/products/campaigns/ipad-pro-cinematic.webp",
};

// --------------------------------------------------------------------------
// iPad Air Special Visual Assets
// --------------------------------------------------------------------------
const IPAD_AIR_COLOR_MAP: Record<string, string> = {
  blue: "/products/campaigns/ipad-air-blue.webp",
  "space gray": "/products/campaigns/ipad-air-space-gray.webp",
  "space grey": "/products/campaigns/ipad-air-space-gray.webp",
  starlight: "/products/campaigns/ipad-air-editorial-pure-white.png",
  purple: localCatalogueImageBySlug["ipad-air-13-inch-m3"] || "/products/campaigns/ipad-air-colors.webp",
  pink: localCatalogueImageBySlug["ipad-air-5"] || "/products/campaigns/ipad-air-colors.webp",
};

// --------------------------------------------------------------------------
// Apple Watch Ultra Special Visual Assets
// --------------------------------------------------------------------------
const WATCH_ULTRA_COLOR_MAP: Record<string, string> = {
  "natural titanium": "/products/campaigns/watch-ultra-4-rugged.webp",
  natural: "/products/campaigns/watch-ultra-4-rugged.webp",
  titanium: "/products/campaigns/watch-ultra-4-rugged.webp",
  "black titanium": localCatalogueImageBySlug["apple-watch-ultra-3"] || "/products/campaigns/watch-ultra-4-hero.webp",
  black: localCatalogueImageBySlug["apple-watch-ultra-3"] || "/products/campaigns/watch-ultra-4-hero.webp",
  orange: "/products/campaigns/watch-ultra-4-orange.webp",
  "safety orange": "/products/campaigns/watch-ultra-4-orange.webp",
};

// --------------------------------------------------------------------------
// Apple Watch Series 10 / 11 / 12 Special Visual Assets
// --------------------------------------------------------------------------
const WATCH_SERIES_COLOR_MAP: Record<string, string> = {
  "jet black": "/products/campaigns/watch-series-12-hero.webp",
  black: "/products/campaigns/watch-series-12-hero.webp",
  silver: localCatalogueImageBySlug["apple-watch-series-11"] || "/products/campaigns/watch-series-12-product.webp",
  "rose gold": localCatalogueImageBySlug["apple-watch-series-11"] || "/products/campaigns/watch-series-12-angle.webp",
  gold: localCatalogueImageBySlug["apple-watch-series-9"] || "/products/campaigns/watch-series-12-product.webp",
  "natural titanium": "/products/buy/watch-series-12-angle-white.png",
  natural: "/products/buy/watch-series-12-angle-white.png",
  slate: localCatalogueImageBySlug["apple-watch-series-10"] || "/products/campaigns/watch-series-12-cinematic.webp",
  midnight: localCatalogueImageBySlug["apple-watch-series-8"] || "/products/campaigns/watch-generic-product.webp",
  starlight: localCatalogueImageBySlug["apple-watch-se-3"] || "/products/campaigns/watch-series-12-angle.webp",
};

// --------------------------------------------------------------------------
// iPhone 16 / 16 Pro Specific Finish Images
// --------------------------------------------------------------------------
const IPHONE_16_PRO_COLOR_MAP: Record<string, string> = {
  "desert titanium": localCatalogueImageBySlug["iphone-16-pro-max"] || "/products/colors/iphone-16-pro-natural-titanium.png",
  desert: localCatalogueImageBySlug["iphone-16-pro-max"] || "/products/colors/iphone-16-pro-natural-titanium.png",
  "natural titanium": "/products/colors/iphone-16-pro-natural-titanium.png",
  natural: "/products/colors/iphone-16-pro-natural-titanium.png",
  "black titanium": localCatalogueImageBySlug["iphone-16-pro"] || localCatalogueImageBySlug["iphone-15-pro"],
  black: localCatalogueImageBySlug["iphone-16-pro"] || localCatalogueImageBySlug["iphone-15-pro"],
  "white titanium": localCatalogueImageBySlug["iphone-15-pro-max"] || localCatalogueImageBySlug["iphone-16-pro"],
  white: localCatalogueImageBySlug["iphone-15-pro-max"] || localCatalogueImageBySlug["iphone-16-pro"],
};

const IPHONE_16_BASE_COLOR_MAP: Record<string, string> = {
  black: localCatalogueImageBySlug["iphone-16"] || localCatalogueImageBySlug["iphone-16e"],
  white: localCatalogueImageBySlug["iphone-16e"] || localCatalogueImageBySlug["iphone-16"],
  ultramarine: localCatalogueImageBySlug["iphone-16"] || localCatalogueImageBySlug["iphone-16-plus"],
  teal: localCatalogueImageBySlug["iphone-16-plus"] || localCatalogueImageBySlug["iphone-16"],
  pink: localCatalogueImageBySlug["iphone-15"] || localCatalogueImageBySlug["iphone-16-plus"],
};

// --------------------------------------------------------------------------
// Universal Resolution Function
// --------------------------------------------------------------------------
export function resolveProductColorImage(
  product?: Product,
  color?: string,
  fallback?: string
): string | undefined {
  if (!product && !fallback) return undefined;
  const slug = product?.slug || "";
  const normColor = (color || "").trim().toLowerCase();

  // If product has owner uploaded images, respect those first unless color is explicitly switched
  if (product && hasOwnerUploadedProductImages(product)) {
    const ownerImg = product.images?.[0]?.src;
    if (ownerImg) return ownerImg;
  }

  // 1. iPhone 18 Pro / 18 Pro Max
  if (slug.includes("iphone-18-pro")) {
    if (normColor && IPHONE_18_PRO_COLOR_MAP[normColor]) {
      return IPHONE_18_PRO_COLOR_MAP[normColor];
    }
    return IPHONE_18_PRO_COLOR_MAP["deep burgundy"];
  }

  // 2. MacBook Air
  if (slug.includes("macbook-air") || (product?.category === "MacBooks" && product?.name?.toLowerCase().includes("air"))) {
    if (normColor && MACBOOK_AIR_COLOR_MAP[normColor]) {
      return MACBOOK_AIR_COLOR_MAP[normColor];
    }
    return MACBOOK_AIR_COLOR_MAP.midnight;
  }

  // 3. MacBook Pro
  if (slug.includes("macbook-pro") || (product?.category === "MacBooks" && product?.name?.toLowerCase().includes("pro"))) {
    if (normColor && MACBOOK_PRO_COLOR_MAP[normColor]) {
      return MACBOOK_PRO_COLOR_MAP[normColor];
    }
    return MACBOOK_PRO_COLOR_MAP["space black"];
  }

  // 4. iPad Pro
  if (slug.includes("ipad-pro") || (product?.category === "iPads" && product?.name?.toLowerCase().includes("pro"))) {
    if (normColor && IPAD_PRO_COLOR_MAP[normColor]) {
      return IPAD_PRO_COLOR_MAP[normColor];
    }
    return IPAD_PRO_COLOR_MAP["space black"];
  }

  // 5. iPad Air
  if (slug.includes("ipad-air") || (product?.category === "iPads" && product?.name?.toLowerCase().includes("air"))) {
    if (normColor && IPAD_AIR_COLOR_MAP[normColor]) {
      return IPAD_AIR_COLOR_MAP[normColor];
    }
    return IPAD_AIR_COLOR_MAP.blue;
  }

  // 6. Apple Watch Ultra
  if (slug.includes("ultra") || (product?.category === "Apple Watches" && product?.name?.toLowerCase().includes("ultra"))) {
    if (normColor && WATCH_ULTRA_COLOR_MAP[normColor]) {
      return WATCH_ULTRA_COLOR_MAP[normColor];
    }
    return WATCH_ULTRA_COLOR_MAP["natural titanium"];
  }

  // 7. Apple Watch Series (Series 12, 11, 10, etc.)
  if (slug.includes("series") || slug.includes("apple-watch") || product?.category === "Apple Watches") {
    if (normColor && WATCH_SERIES_COLOR_MAP[normColor]) {
      return WATCH_SERIES_COLOR_MAP[normColor];
    }
    return WATCH_SERIES_COLOR_MAP["jet black"];
  }

  // 8. iPhone 16 Pro / 16 Pro Max
  if (slug === "iphone-16-pro" || slug === "iphone-16-pro-max") {
    if (normColor && IPHONE_16_PRO_COLOR_MAP[normColor]) {
      return IPHONE_16_PRO_COLOR_MAP[normColor];
    }
    return IPHONE_16_PRO_COLOR_MAP["desert titanium"];
  }

  // 9. iPhone 16 / 16 Plus
  if (slug === "iphone-16" || slug === "iphone-16-plus") {
    if (normColor && IPHONE_16_BASE_COLOR_MAP[normColor]) {
      return IPHONE_16_BASE_COLOR_MAP[normColor];
    }
    return IPHONE_16_BASE_COLOR_MAP.black;
  }

  // 10. Accessories with finishes (Magic Keyboard, Magic Mouse, Trackpad)
  if (slug.includes("magic-mouse") || slug.includes("magic-trackpad")) {
    if (normColor.includes("black")) {
      return localCatalogueImageBySlug["apple-magic-mouse"];
    }
    return localCatalogueImageBySlug["apple-magic-mouse"];
  }
  if (slug.includes("magic-keyboard")) {
    if (normColor.includes("black")) {
      return localCatalogueImageBySlug["apple-magic-keyboard-ipad"] || localCatalogueImageBySlug["apple-magic-keyboard-touch-id"];
    }
    return localCatalogueImageBySlug["apple-magic-keyboard-touch-id"] || localCatalogueImageBySlug["apple-magic-keyboard-ipad"];
  }

  // 11. Generic Catalogue Match
  if (slug && localCatalogueImageBySlug[slug]) {
    return localCatalogueImageBySlug[slug];
  }

  // 12. Fallback to product images or provided fallback
  if (product && product.images && product.images.length > 0) {
    return product.images[0].src;
  }

  return fallback;
}

/**
 * Universal Gallery Resolver
 * Returns the matching primary image along with authentic complementary angle thumbnails
 */
export function resolveProductColorGallery(
  product?: Product,
  color?: string,
  fallbackGallery: { src: string; alt: string }[] = []
): { src: string; alt: string }[] {
  const primaryImg = resolveProductColorImage(product, color);
  const name = product?.name || "Product";
  const colorLabel = color ? ` in ${color}` : "";

  if (!primaryImg) {
    return fallbackGallery;
  }

  const gallery: { src: string; alt: string }[] = [
    { src: primaryImg, alt: `${name}${colorLabel}` },
  ];

  const slug = product?.slug || "";

  // Add authentic secondary angles for key flagship models
  if (slug.includes("iphone-18-pro")) {
    if (primaryImg !== "/products/buy/iphone-18-pro-gallery-2-silver.jpg") {
      gallery.push({ src: "/products/buy/iphone-18-pro-gallery-2-silver.jpg", alt: `${name} Silver / Natural Titanium dual view` });
    }
    if (primaryImg !== "/products/buy/iphone-18-pro-gallery-3-blue.jpg") {
      gallery.push({ src: "/products/buy/iphone-18-pro-gallery-3-blue.jpg", alt: `${name} Light Blue dual view` });
    }
  } else if (slug.includes("macbook-air")) {
    const showcase = "/products/buy/macbook-air-buy-showcase.jpg";
    if (primaryImg !== showcase) {
      gallery.push({ src: showcase, alt: `${name} Midnight front view` });
    }
    gallery.push({ src: "/products/campaigns/macbook-air-lineup.webp", alt: `${name} profile and ports` });
  } else if (slug.includes("macbook-pro")) {
    const altCutout = "/products/campaigns/macbook-pro-cutout.webp";
    if (primaryImg !== altCutout) {
      gallery.push({ src: altCutout, alt: `${name} Liquid Retina XDR display` });
    }
  } else if (slug.includes("ipad-pro")) {
    const cinematic = "/products/campaigns/ipad-pro-cinematic.webp";
    if (primaryImg !== cinematic) {
      gallery.push({ src: cinematic, alt: `${name} Ultra Retina XDR tandem OLED` });
    }
  } else if (slug.includes("ipad-air")) {
    gallery.push({ src: "/products/campaigns/ipad-air-colors.webp", alt: `${name} anodized aluminum finishes` });
  } else if (slug.includes("ultra")) {
    const orange = "/products/campaigns/watch-ultra-4-orange.webp";
    if (primaryImg !== orange) {
      gallery.push({ src: orange, alt: `${name} Titanium case and Alpine Loop` });
    }
  } else if (slug.includes("watch")) {
    gallery.push({ src: "/products/buy/watch-series-12-angle-white.png", alt: `${name} contoured case profile` });
  }

  // If user provided a fallbackGallery with extra photos, append non-duplicates
  for (const item of fallbackGallery) {
    if (!gallery.some((g) => g.src === item.src)) {
      gallery.push(item);
    }
  }

  return gallery;
}
