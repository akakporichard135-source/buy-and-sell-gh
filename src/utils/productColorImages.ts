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
// --------------------------------------------------------------------------
// iPhone 18 Pro & Pro Max Special Visual Assets
// --------------------------------------------------------------------------
const IPHONE_18_PRO_COLOR_MAP: Record<string, string> = {
  "deep burgundy": "/products/campaigns/iphone-18-pro-burgundy-finish.webp",
  burgundy: "/products/campaigns/iphone-18-pro-burgundy-finish.webp",
  "space black": "/products/colors/iphone-18-pro-space-black.png",
  black: "/products/colors/iphone-18-pro-space-black.png",
  "natural titanium": "/products/campaigns/iphone-18-pro-silver.webp",
  natural: "/products/campaigns/iphone-18-pro-silver.webp",
  silver: "/products/campaigns/iphone-18-pro-silver.webp",
  "light blue": "/products/story/iphone-18-pro-supplied-blue-front-back.jpg",
  blue: "/products/story/iphone-18-pro-supplied-blue-front-back.jpg",
};

// --------------------------------------------------------------------------
// iPhone 16 / 16 Pro Specific Finish Images
// --------------------------------------------------------------------------
const IPHONE_16_PRO_COLOR_MAP: Record<string, string> = {
  "desert titanium": "/products/colors/iphone-16-pro-desert-titanium.png",
  desert: "/products/colors/iphone-16-pro-desert-titanium.png",
  "natural titanium": "/products/colors/iphone-16-pro-natural-titanium.png",
  natural: "/products/colors/iphone-16-pro-natural-titanium.png",
  "black titanium": localCatalogueImageBySlug["iphone-16-pro"] || "/products/colors/iphone-16-pro-natural-titanium.png",
  black: localCatalogueImageBySlug["iphone-16-pro"] || "/products/colors/iphone-16-pro-natural-titanium.png",
  "white titanium": localCatalogueImageBySlug["iphone-16-pro-max"] || "/products/colors/iphone-16-pro-natural-titanium.png",
  white: localCatalogueImageBySlug["iphone-16-pro-max"] || "/products/colors/iphone-16-pro-natural-titanium.png",
};

const IPHONE_16_BASE_COLOR_MAP: Record<string, string> = {
  black: localCatalogueImageBySlug["iphone-16"] || localCatalogueImageBySlug["iphone-16e"],
  white: localCatalogueImageBySlug["iphone-16e"] || localCatalogueImageBySlug["iphone-16"],
  ultramarine: localCatalogueImageBySlug["iphone-16-plus"] || localCatalogueImageBySlug["iphone-16"],
  teal: localCatalogueImageBySlug["iphone-16-plus"] || localCatalogueImageBySlug["iphone-16"],
  pink: localCatalogueImageBySlug["iphone-15"] || localCatalogueImageBySlug["iphone-16"],
};

const IPHONE_15_PRO_COLOR_MAP: Record<string, string> = {
  "natural titanium": localCatalogueImageBySlug["iphone-15-pro-max"] || localCatalogueImageBySlug["iphone-15-pro"],
  natural: localCatalogueImageBySlug["iphone-15-pro-max"] || localCatalogueImageBySlug["iphone-15-pro"],
  "white titanium": localCatalogueImageBySlug["iphone-15-pro"] || localCatalogueImageBySlug["iphone-15-pro-max"],
  white: localCatalogueImageBySlug["iphone-15-pro"] || localCatalogueImageBySlug["iphone-15-pro-max"],
  "black titanium": localCatalogueImageBySlug["iphone-15-pro"] || localCatalogueImageBySlug["iphone-15-pro-max"],
  black: localCatalogueImageBySlug["iphone-15-pro"] || localCatalogueImageBySlug["iphone-15-pro-max"],
  "blue titanium": localCatalogueImageBySlug["iphone-15-pro-max"] || localCatalogueImageBySlug["iphone-15-pro"],
  blue: localCatalogueImageBySlug["iphone-15-pro-max"] || localCatalogueImageBySlug["iphone-15-pro"],
};

// --------------------------------------------------------------------------
// Apple Watch Ultra 4 & Series 12 Visual Assets
// --------------------------------------------------------------------------
const WATCH_ULTRA_4_COLOR_MAP: Record<string, string> = {
  "natural titanium": "/products/campaigns/watch-ultra-4-rugged.webp",
  natural: "/products/campaigns/watch-ultra-4-rugged.webp",
  titanium: "/products/campaigns/watch-ultra-4-rugged.webp",
  "black titanium": "/products/campaigns/watch-ultra-4-hero.webp",
  black: "/products/campaigns/watch-ultra-4-hero.webp",
  orange: "/products/campaigns/watch-ultra-4-orange.webp",
  "safety orange": "/products/campaigns/watch-ultra-4-orange.webp",
};

const WATCH_SERIES_12_COLOR_MAP: Record<string, string> = {
  "jet black": "/products/campaigns/watch-series-12-hero.webp",
  black: "/products/campaigns/watch-series-12-hero.webp",
  silver: "/products/campaigns/watch-series-12-product.webp",
  "rose gold": "/products/campaigns/watch-series-12-angle.webp",
  "natural titanium": "/products/buy/watch-series-12-angle-white.png",
  natural: "/products/buy/watch-series-12-angle-white.png",
  slate: "/products/campaigns/watch-series-12-cinematic.webp",
};

// --------------------------------------------------------------------------
// AirPods Max Visual Assets
// --------------------------------------------------------------------------
const AIRPODS_MAX_COLOR_MAP: Record<string, string> = {
  midnight: "/products/colors/airpods-max-midnight.png",
  starlight: localCatalogueImageBySlug["airpods-max-usb-c"],
  blue: localCatalogueImageBySlug["airpods-max-2"],
  purple: localCatalogueImageBySlug["airpods-max-usb-c"],
  orange: localCatalogueImageBySlug["airpods-max-2"],
  silver: localCatalogueImageBySlug["airpods-max-usb-c"],
  "space gray": localCatalogueImageBySlug["airpods-max-lightning"],
  "space grey": localCatalogueImageBySlug["airpods-max-lightning"],
  pink: localCatalogueImageBySlug["airpods-max-lightning"],
  green: localCatalogueImageBySlug["airpods-max-lightning"],
  "sky blue": localCatalogueImageBySlug["airpods-max-lightning"],
};

// --------------------------------------------------------------------------
// MacBook Air Size-Specific Finish Mappings
// --------------------------------------------------------------------------
const MACBOOK_AIR_13_COLOR_MAP: Record<string, string> = {
  midnight: "/products/buy/macbook-air-buy-showcase.jpg",
  starlight: "/products/campaigns/macbook-air-starlight-studio.jpg",
  "space gray": localCatalogueImageBySlug["macbook-air-13-m3"] || "/products/campaigns/macbook-air-floating.webp",
  "space grey": localCatalogueImageBySlug["macbook-air-13-m3"] || "/products/campaigns/macbook-air-floating.webp",
  silver: localCatalogueImageBySlug["macbook-air-13-m4"] || "/products/campaigns/macbook-air-lineup.webp",
  "sky blue": localCatalogueImageBySlug["macbook-air-13-m5"] || "/products/campaigns/macbook-air-cinematic.webp",
  gold: localCatalogueImageBySlug["macbook-air-13-m1"] || "/products/campaigns/macbook-air-floating.webp",
};

const MACBOOK_AIR_15_COLOR_MAP: Record<string, string> = {
  midnight: localCatalogueImageBySlug["macbook-air-15-m2"] || "/products/buy/macbook-air-buy-showcase.jpg",
  starlight: localCatalogueImageBySlug["macbook-air-15-m4"] || "/products/campaigns/macbook-air-starlight-studio.jpg",
  "space gray": localCatalogueImageBySlug["macbook-air-15-m3"] || "/products/campaigns/macbook-air-floating.webp",
  "space grey": localCatalogueImageBySlug["macbook-air-15-m3"] || "/products/campaigns/macbook-air-floating.webp",
  silver: localCatalogueImageBySlug["macbook-air-15-m5"] || "/products/campaigns/macbook-air-lineup.webp",
  "sky blue": localCatalogueImageBySlug["macbook-air-15-m5"] || "/products/campaigns/macbook-air-cinematic.webp",
};

// --------------------------------------------------------------------------
// MacBook Pro Size-Specific Finish Mappings
// --------------------------------------------------------------------------
const MACBOOK_PRO_14_COLOR_MAP: Record<string, string> = {
  "space black": localCatalogueImageBySlug["macbook-pro-14-m4"] || "/products/campaigns/macbook-pro-cutout.webp",
  black: localCatalogueImageBySlug["macbook-pro-14-m4"] || "/products/campaigns/macbook-pro-cutout.webp",
  silver: localCatalogueImageBySlug["macbook-pro-14-m4-pro-max"] || "/products/campaigns/macbook-pro-cinematic.webp",
  "space gray": localCatalogueImageBySlug["macbook-pro-14-m3"] || localCatalogueImageBySlug["macbook-pro-14-m1-pro-max"] || "/products/campaigns/macbook-pro-cutout.webp",
  "space grey": localCatalogueImageBySlug["macbook-pro-14-m3"] || localCatalogueImageBySlug["macbook-pro-14-m1-pro-max"] || "/products/campaigns/macbook-pro-cutout.webp",
};

const MACBOOK_PRO_16_COLOR_MAP: Record<string, string> = {
  "space black": localCatalogueImageBySlug["macbook-pro-16-m4-pro-max"] || "/products/campaigns/macbook-pro-cutout.webp",
  black: localCatalogueImageBySlug["macbook-pro-16-m4-pro-max"] || "/products/campaigns/macbook-pro-cutout.webp",
  silver: localCatalogueImageBySlug["macbook-pro-16-m5-pro-max"] || "/products/campaigns/macbook-pro-cinematic.webp",
  "space gray": localCatalogueImageBySlug["macbook-pro-16-m2-pro-max"] || "/products/campaigns/macbook-pro-cutout.webp",
  "space grey": localCatalogueImageBySlug["macbook-pro-16-m2-pro-max"] || "/products/campaigns/macbook-pro-cutout.webp",
};

// --------------------------------------------------------------------------
// iPad Pro Size-Specific Finish Mappings
// --------------------------------------------------------------------------
const IPAD_PRO_11_COLOR_MAP: Record<string, string> = {
  "space black": localCatalogueImageBySlug["ipad-pro-11-inch-m4"] || "/products/campaigns/ipad-pro-11.webp",
  black: localCatalogueImageBySlug["ipad-pro-11-inch-m4"] || "/products/campaigns/ipad-pro-11.webp",
  silver: localCatalogueImageBySlug["ipad-pro-11-inch-m5"] || "/products/campaigns/ipad-pro-11.webp",
  "space gray": localCatalogueImageBySlug["ipad-pro-11-inch-m2"] || "/products/campaigns/ipad-pro-cinematic.webp",
  "space grey": localCatalogueImageBySlug["ipad-pro-11-inch-m2"] || "/products/campaigns/ipad-pro-cinematic.webp",
};

const IPAD_PRO_13_COLOR_MAP: Record<string, string> = {
  "space black": localCatalogueImageBySlug["ipad-pro-13-inch-m5"] || "/products/campaigns/ipad-pro-13.webp",
  black: localCatalogueImageBySlug["ipad-pro-13-inch-m5"] || "/products/campaigns/ipad-pro-13.webp",
  silver: localCatalogueImageBySlug["ipad-pro-13-inch-m4"] || "/products/campaigns/ipad-pro-13.webp",
  "space gray": localCatalogueImageBySlug["ipad-pro-12-9-inch-m2"] || "/products/campaigns/ipad-pro-cinematic.webp",
  "space grey": localCatalogueImageBySlug["ipad-pro-12-9-inch-m2"] || "/products/campaigns/ipad-pro-cinematic.webp",
};

// --------------------------------------------------------------------------
// iPad Air Finish Assets
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
// Universal Resolution Function
// --------------------------------------------------------------------------
function matchColorMap(map: Record<string, string>, normColor: string): string | undefined {
  if (!normColor) return undefined;
  if (map[normColor]) return map[normColor];
  const segments = normColor.split(/[\/|]/).map((s) => s.trim()).filter(Boolean);
  for (const seg of segments) {
    if (map[seg]) return map[seg];
  }
  for (const [key, val] of Object.entries(map)) {
    if (normColor.includes(key)) return val;
  }
  return undefined;
}

export function resolveProductColorImage(
  product?: Product,
  color?: string,
  fallback?: string
): string | undefined {
  if (!product && !fallback) return undefined;
  const slug = product?.slug || "";
  const normColor = (color || "").trim().toLowerCase();

  // 0. Check admin-configured colorImages mapping first
  if (product?.colorImages) {
    if (color && product.colorImages[color]) {
      return product.colorImages[color];
    }
    if (normColor && product.colorImages[normColor]) {
      return product.colorImages[normColor];
    }
    // Case-insensitive key match
    for (const [k, v] of Object.entries(product.colorImages)) {
      if (k.toLowerCase() === normColor && v) return v;
    }
  }

  // 0.1 Check if any custom uploaded image has alt text containing this finish
  if (normColor && product?.images && product.images.length > 0) {
    const matchingAltImg = product.images.find(
      (img) => img.alt && img.alt.toLowerCase().includes(normColor)
    );
    if (matchingAltImg) return matchingAltImg.src;
  }

  // 1. iPhone 18 Pro / 18 Pro Max
  if (slug.includes("iphone-18-pro")) {
    return matchColorMap(IPHONE_18_PRO_COLOR_MAP, normColor) || IPHONE_18_PRO_COLOR_MAP["deep burgundy"];
  }

  // 2. iPhone 16 Pro / 16 Pro Max
  if (slug === "iphone-16-pro" || slug === "iphone-16-pro-max") {
    return matchColorMap(IPHONE_16_PRO_COLOR_MAP, normColor) || IPHONE_16_PRO_COLOR_MAP["desert titanium"];
  }

  // 3. iPhone 16 / 16 Plus
  if (slug === "iphone-16" || slug === "iphone-16-plus") {
    return matchColorMap(IPHONE_16_BASE_COLOR_MAP, normColor) || IPHONE_16_BASE_COLOR_MAP.black;
  }

  // 4. iPhone 15 Pro / 15 Pro Max
  if (slug === "iphone-15-pro" || slug === "iphone-15-pro-max") {
    return matchColorMap(IPHONE_15_PRO_COLOR_MAP, normColor) || IPHONE_15_PRO_COLOR_MAP["natural titanium"];
  }

  // 5. Apple Watch Ultra 4
  if (slug === "apple-watch-ultra-4" || slug.includes("ultra-4")) {
    return matchColorMap(WATCH_ULTRA_4_COLOR_MAP, normColor) || WATCH_ULTRA_4_COLOR_MAP["natural titanium"];
  }

  // 5.1 Other Apple Watch Ultra models
  if (slug.includes("ultra") || (product?.category === "Apple Watches" && product?.name?.toLowerCase().includes("ultra"))) {
    if (normColor.includes("black")) {
      return localCatalogueImageBySlug["apple-watch-ultra-3"] || WATCH_ULTRA_4_COLOR_MAP["black titanium"];
    }
    return localCatalogueImageBySlug[slug] || WATCH_ULTRA_4_COLOR_MAP["natural titanium"];
  }

  // 6. Apple Watch Series 12
  if (slug === "apple-watch-series-12" || slug.includes("series-12")) {
    return matchColorMap(WATCH_SERIES_12_COLOR_MAP, normColor) || WATCH_SERIES_12_COLOR_MAP["jet black"];
  }

  // 6.1 Other specific Apple Watch models (Series 11, 10, 9, 8, 7, SE)
  if (slug && localCatalogueImageBySlug[slug] && (slug.includes("series") || slug.includes("apple-watch") || product?.category === "Apple Watches")) {
    return localCatalogueImageBySlug[slug];
  }

  // 7. AirPods Max & AirPods 5 / Pro 3
  if (slug === "airpods-5" || slug.includes("airpods-5")) {
    return "/products/campaigns/airpods-5-product.webp";
  }
  if (slug === "airpods-pro-3" || slug.includes("airpods-pro-3")) {
    return localCatalogueImageBySlug["airpods-pro-3"] || "/products/story/airpods-pro-3-apple.jpg";
  }
  if (slug.includes("airpods-max")) {
    return matchColorMap(AIRPODS_MAX_COLOR_MAP, normColor) || localCatalogueImageBySlug[slug] || AIRPODS_MAX_COLOR_MAP.midnight;
  }

  // 8. iPad Pro (Size & Generation aware)
  if (slug.includes("ipad-pro") || (product?.category === "iPads" && product?.name?.toLowerCase().includes("pro"))) {
    if (slug.includes("13") || slug.includes("12-9") || normColor.includes("13-inch")) {
      return matchColorMap(IPAD_PRO_13_COLOR_MAP, normColor) || localCatalogueImageBySlug[slug] || IPAD_PRO_13_COLOR_MAP["space black"];
    }
    return matchColorMap(IPAD_PRO_11_COLOR_MAP, normColor) || localCatalogueImageBySlug[slug] || IPAD_PRO_11_COLOR_MAP["space black"];
  }

  // 9. iPad Air
  if (slug.includes("ipad-air") || (product?.category === "iPads" && product?.name?.toLowerCase().includes("air"))) {
    return matchColorMap(IPAD_AIR_COLOR_MAP, normColor) || localCatalogueImageBySlug[slug] || IPAD_AIR_COLOR_MAP.blue;
  }

  // 10. MacBook Air (15-inch vs 13-inch)
  if (slug.includes("macbook-air") || (product?.category === "MacBooks" && product?.name?.toLowerCase().includes("air"))) {
    if (slug.includes("15") || normColor.includes("15-inch")) {
      return matchColorMap(MACBOOK_AIR_15_COLOR_MAP, normColor) || localCatalogueImageBySlug[slug] || MACBOOK_AIR_15_COLOR_MAP.midnight;
    }
    return matchColorMap(MACBOOK_AIR_13_COLOR_MAP, normColor) || localCatalogueImageBySlug[slug] || MACBOOK_AIR_13_COLOR_MAP.midnight;
  }

  // 11. MacBook Pro (16-inch vs 14-inch)
  if (slug.includes("macbook-pro") || (product?.category === "MacBooks" && product?.name?.toLowerCase().includes("pro"))) {
    if (slug.includes("16") || normColor.includes("16-inch")) {
      return matchColorMap(MACBOOK_PRO_16_COLOR_MAP, normColor) || localCatalogueImageBySlug[slug] || MACBOOK_PRO_16_COLOR_MAP["space black"];
    }
    return matchColorMap(MACBOOK_PRO_14_COLOR_MAP, normColor) || localCatalogueImageBySlug[slug] || MACBOOK_PRO_14_COLOR_MAP["space black"];
  }

  // 12. Accessories with finishes (Magic Keyboard, Magic Mouse, Trackpad)
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

  // 13. Exact Catalogue Match for any specific Apple device
  if (slug && localCatalogueImageBySlug[slug]) {
    return localCatalogueImageBySlug[slug];
  }

  // 14. Fallback to product images or provided fallback
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
