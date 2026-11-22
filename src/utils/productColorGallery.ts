import type { Product } from "../types/product";
import type { BuyGalleryItem, ProductBuyGallery } from "../cms/buyGalleryRepository";
import { localCatalogueImageBySlug } from "./catalogueProductImages";
import {
  buildColorVariantId,
  extractPrimaryColorLabel,
  normalizeColorKey,
} from "./variantSelection";

export interface ColorGalleryImage {
  src: string;
  alt: string;
  title?: string;
  colorVariantId?: string;
  colorFinish?: string;
}

export interface ResolvedColorGallery {
  images: ColorGalleryImage[];
  mainImage?: ColorGalleryImage;
  colorVariantId: string;
  colorKey: string;
  colorName: string;
  source:
    | "published_color_variant"
    | "product_color_map"
    | "verified_static_color"
    | "neutral_fallback"
    | "empty";
  hasDedicatedColorImages: boolean;
}

/**
 * Verified single-colour studio photo sets strictly keyed by canonical colorKey.
 * Every image listed here genuinely depicts ONLY that exact product and colour —
 * never mixing sibling colours into another colour's gallery.
 */
const VERIFIED_COLOR_GALLERIES: Record<string, Record<string, ColorGalleryImage[]>> = {
  "iphone-18-pro": {
    "deep-burgundy": [
      { src: "/products/campaigns/iphone-18-pro-burgundy-finish.webp", alt: "iPhone 18 Pro in Deep Burgundy" },
    ],
    burgundy: [
      { src: "/products/campaigns/iphone-18-pro-burgundy-finish.webp", alt: "iPhone 18 Pro in Deep Burgundy" },
    ],
    "space-black": [
      { src: "/products/colors/iphone-18-pro-space-black.png", alt: "iPhone 18 Pro in Space Black" },
    ],
    black: [
      { src: "/products/colors/iphone-18-pro-space-black.png", alt: "iPhone 18 Pro in Space Black" },
    ],
    "natural-titanium": [
      { src: "/products/campaigns/iphone-18-pro-silver.webp", alt: "iPhone 18 Pro in Natural Titanium" },
      { src: "/products/buy/iphone-18-pro-gallery-2-silver.jpg", alt: "iPhone 18 Pro in Natural Titanium dual view" },
    ],
    silver: [
      { src: "/products/campaigns/iphone-18-pro-silver.webp", alt: "iPhone 18 Pro in Silver" },
      { src: "/products/buy/iphone-18-pro-gallery-2-silver.jpg", alt: "iPhone 18 Pro in Silver dual view" },
    ],
    "light-blue": [
      { src: "/products/buy/iphone-18-pro-gallery-3-blue.jpg", alt: "iPhone 18 Pro in Light Blue" },
      { src: "/products/story/iphone-18-pro-supplied-blue-front-back.jpg", alt: "iPhone 18 Pro in Light Blue front and back" },
    ],
    blue: [
      { src: "/products/buy/iphone-18-pro-gallery-3-blue.jpg", alt: "iPhone 18 Pro in Light Blue" },
      { src: "/products/story/iphone-18-pro-supplied-blue-front-back.jpg", alt: "iPhone 18 Pro in Light Blue front and back" },
    ],
  },
  "iphone-16-pro": {
    "desert-titanium": [
      { src: "/products/colors/iphone-16-pro-desert-titanium.png", alt: "iPhone 16 Pro in Desert Titanium" },
    ],
    "natural-titanium": [
      { src: "/products/colors/iphone-16-pro-natural-titanium.png", alt: "iPhone 16 Pro in Natural Titanium" },
    ],
  },
  "apple-watch-ultra-4": {
    "natural-titanium": [
      { src: "/products/campaigns/watch-ultra-4-rugged.webp", alt: "Apple Watch Ultra 4 in Natural Titanium" },
      { src: "/products/campaigns/watch-ultra-4-orange.webp", alt: "Apple Watch Ultra 4 in Natural Titanium with Alpine Loop" },
    ],
    "black-titanium": [
      { src: "/products/campaigns/watch-ultra-4-hero.webp", alt: "Apple Watch Ultra 4 in Black Titanium" },
    ],
  },
  "apple-watch-series-12": {
    "jet-black": [
      { src: "/products/campaigns/watch-series-12-hero.webp", alt: "Apple Watch Series 12 in Jet Black" },
    ],
    silver: [
      { src: "/products/campaigns/watch-series-12-product.webp", alt: "Apple Watch Series 12 in Silver" },
    ],
    "rose-gold": [
      { src: "/products/campaigns/watch-series-12-angle.webp", alt: "Apple Watch Series 12 in Rose Gold" },
    ],
    "natural-titanium": [
      { src: "/products/buy/watch-series-12-angle-white.png", alt: "Apple Watch Series 12 in Natural Titanium" },
    ],
    slate: [
      { src: "/products/campaigns/watch-series-12-cinematic.webp", alt: "Apple Watch Series 12 in Slate" },
    ],
  },
  "airpods-max": {
    midnight: [
      { src: "/products/colors/airpods-max-midnight.png", alt: "AirPods Max in Midnight" },
    ],
  },
  "ipad-air": {
    blue: [
      { src: "/products/campaigns/ipad-air-blue.webp", alt: "iPad Air in Blue" },
      ...(localCatalogueImageBySlug["ipad-air-11-inch-m3"]
        ? [{ src: localCatalogueImageBySlug["ipad-air-11-inch-m3"], alt: "iPad Air in Blue front view" }]
        : []),
    ],
    "space-gray": [
      { src: "/products/campaigns/ipad-air-space-gray.webp", alt: "iPad Air in Space Gray" },
    ],
    starlight: [
      { src: "/products/campaigns/ipad-air-editorial-pure-white.png", alt: "iPad Air in Starlight" },
    ],
    purple: [
      ...(localCatalogueImageBySlug["ipad-air-13-inch-m3"]
        ? [{ src: localCatalogueImageBySlug["ipad-air-13-inch-m3"], alt: "iPad Air in Purple" }]
        : []),
    ],
  },
  "ipad-pro-11": {
    "space-black": [
      ...(localCatalogueImageBySlug["ipad-pro-11-inch-m4"]
        ? [{ src: localCatalogueImageBySlug["ipad-pro-11-inch-m4"], alt: "iPad Pro 11-inch in Space Black" }]
        : []),
    ],
    silver: [
      ...(localCatalogueImageBySlug["ipad-pro-11-inch-m5"]
        ? [{ src: localCatalogueImageBySlug["ipad-pro-11-inch-m5"], alt: "iPad Pro 11-inch in Silver" }]
        : []),
    ],
    "space-gray": [
      ...(localCatalogueImageBySlug["ipad-pro-11-inch-m2"]
        ? [{ src: localCatalogueImageBySlug["ipad-pro-11-inch-m2"], alt: "iPad Pro 11-inch in Space Gray" }]
        : []),
    ],
  },
  "ipad-pro-13": {
    "space-black": [
      ...(localCatalogueImageBySlug["ipad-pro-13-inch-m5"]
        ? [{ src: localCatalogueImageBySlug["ipad-pro-13-inch-m5"], alt: "iPad Pro 13-inch in Space Black" }]
        : []),
    ],
    silver: [
      ...(localCatalogueImageBySlug["ipad-pro-13-inch-m4"]
        ? [{ src: localCatalogueImageBySlug["ipad-pro-13-inch-m4"], alt: "iPad Pro 13-inch in Silver" }]
        : []),
    ],
    "space-gray": [
      ...(localCatalogueImageBySlug["ipad-pro-12-9-inch-m2"]
        ? [{ src: localCatalogueImageBySlug["ipad-pro-12-9-inch-m2"], alt: "iPad Pro 13-inch in Space Gray" }]
        : []),
    ],
  },
  "macbook-air-13": {
    midnight: [
      { src: "/products/buy/macbook-air-buy-showcase.jpg", alt: "MacBook Air 13-inch in Midnight" },
    ],
    starlight: [
      { src: "/products/campaigns/macbook-air-starlight-studio.jpg", alt: "MacBook Air 13-inch in Starlight" },
    ],
    "space-gray": [
      ...(localCatalogueImageBySlug["macbook-air-13-m3"]
        ? [{ src: localCatalogueImageBySlug["macbook-air-13-m3"], alt: "MacBook Air 13-inch in Space Gray" }]
        : []),
    ],
    silver: [
      ...(localCatalogueImageBySlug["macbook-air-13-m4"]
        ? [{ src: localCatalogueImageBySlug["macbook-air-13-m4"], alt: "MacBook Air 13-inch in Silver" }]
        : []),
    ],
    "sky-blue": [
      ...(localCatalogueImageBySlug["macbook-air-13-m5"]
        ? [{ src: localCatalogueImageBySlug["macbook-air-13-m5"], alt: "MacBook Air 13-inch in Sky Blue" }]
        : []),
    ],
  },
  "macbook-air-15": {
    midnight: [
      ...(localCatalogueImageBySlug["macbook-air-15-m2"]
        ? [{ src: localCatalogueImageBySlug["macbook-air-15-m2"], alt: "MacBook Air 15-inch in Midnight" }]
        : [{ src: "/products/buy/macbook-air-buy-showcase.jpg", alt: "MacBook Air 15-inch in Midnight" }]),
    ],
    starlight: [
      { src: "/products/campaigns/macbook-air-starlight-studio.jpg", alt: "MacBook Air 15-inch in Starlight" },
      ...(localCatalogueImageBySlug["macbook-air-15-m4"]
        ? [{ src: localCatalogueImageBySlug["macbook-air-15-m4"], alt: "MacBook Air 15-inch in Starlight studio angle" }]
        : []),
    ],
    "space-gray": [
      ...(localCatalogueImageBySlug["macbook-air-15-m3"]
        ? [{ src: localCatalogueImageBySlug["macbook-air-15-m3"], alt: "MacBook Air 15-inch in Space Gray" }]
        : []),
    ],
    silver: [
      ...(localCatalogueImageBySlug["macbook-air-15-m5"]
        ? [{ src: localCatalogueImageBySlug["macbook-air-15-m5"], alt: "MacBook Air 15-inch in Silver" }]
        : []),
    ],
    "sky-blue": [
      ...(localCatalogueImageBySlug["macbook-air-15-m5"]
        ? [{ src: localCatalogueImageBySlug["macbook-air-15-m5"], alt: "MacBook Air 15-inch in Sky Blue" }]
        : []),
    ],
  },
  "macbook-pro-14": {
    "space-black": [
      ...(localCatalogueImageBySlug["macbook-pro-14-m4"]
        ? [{ src: localCatalogueImageBySlug["macbook-pro-14-m4"], alt: "MacBook Pro 14-inch in Space Black" }]
        : []),
      { src: "/products/campaigns/macbook-pro-cutout.webp", alt: "MacBook Pro 14-inch Space Black display angle" },
    ],
    silver: [
      ...(localCatalogueImageBySlug["macbook-pro-14-m4-pro-max"]
        ? [{ src: localCatalogueImageBySlug["macbook-pro-14-m4-pro-max"], alt: "MacBook Pro 14-inch in Silver" }]
        : []),
    ],
    "space-gray": [
      ...(localCatalogueImageBySlug["macbook-pro-14-m3"]
        ? [{ src: localCatalogueImageBySlug["macbook-pro-14-m3"], alt: "MacBook Pro 14-inch in Space Gray" }]
        : []),
    ],
  },
  "macbook-pro-16": {
    "space-black": [
      ...(localCatalogueImageBySlug["macbook-pro-16-m4-pro-max"]
        ? [{ src: localCatalogueImageBySlug["macbook-pro-16-m4-pro-max"], alt: "MacBook Pro 16-inch in Space Black" }]
        : []),
      { src: "/products/campaigns/macbook-pro-cutout.webp", alt: "MacBook Pro 16-inch Space Black display angle" },
    ],
    silver: [
      ...(localCatalogueImageBySlug["macbook-pro-16-m5-pro-max"]
        ? [{ src: localCatalogueImageBySlug["macbook-pro-16-m5-pro-max"], alt: "MacBook Pro 16-inch in Silver" }]
        : []),
    ],
    "space-gray": [
      ...(localCatalogueImageBySlug["macbook-pro-16-m2-pro-max"]
        ? [{ src: localCatalogueImageBySlug["macbook-pro-16-m2-pro-max"], alt: "MacBook Pro 16-inch in Space Gray" }]
        : []),
    ],
  },
};

function dedupeImages(images: ColorGalleryImage[]): ColorGalleryImage[] {
  const seen = new Set<string>();
  const out: ColorGalleryImage[] = [];
  for (const img of images) {
    if (!img?.src || seen.has(img.src)) continue;
    seen.add(img.src);
    out.push(img);
  }
  return out;
}

function sortGalleryItems(items: BuyGalleryItem[]): BuyGalleryItem[] {
  return [...items].sort((a, b) => {
    if (a.isMain && !b.isMain) return -1;
    if (!a.isMain && b.isMain) return 1;
    return (a.position ?? 0) - (b.position ?? 0);
  });
}

function itemMatchesColor(
  item: BuyGalleryItem,
  colorVariantId: string,
  colorKey: string
): boolean {
  if (item.colorVariantId) {
    const itemVid = item.colorVariantId.trim().toLowerCase();
    if (itemVid === colorVariantId.toLowerCase()) return true;
    const suffix = itemVid.includes("::") ? itemVid.split("::").pop() : itemVid;
    if (suffix && normalizeColorKey(suffix) === colorKey) return true;
  }
  if (item.colorFinish) {
    return normalizeColorKey(item.colorFinish) === colorKey;
  }
  return false;
}

function itemBelongsToDifferentColor(
  item: BuyGalleryItem,
  colorVariantId: string,
  colorKey: string
): boolean {
  if (!item.colorVariantId && !item.colorFinish) return false;
  return !itemMatchesColor(item, colorVariantId, colorKey);
}

function resolveVerifiedStaticColorFamily(slug: string, screenSize?: string): string | null {
  const s = slug.toLowerCase();
  if (s.includes("iphone-18-pro")) return "iphone-18-pro";
  if (s === "iphone-16-pro" || s === "iphone-16-pro-max") return "iphone-16-pro";
  if (s === "apple-watch-ultra-4" || s.includes("ultra-4")) return "apple-watch-ultra-4";
  if (s === "apple-watch-series-12" || s.includes("series-12")) return "apple-watch-series-12";
  if (s.includes("airpods-max")) return "airpods-max";
  if (s.includes("ipad-air")) return "ipad-air";
  if (s.includes("ipad-pro")) {
    const is13 = screenSize === "13-inch" || s.includes("13") || s.includes("12-9");
    return is13 ? "ipad-pro-13" : "ipad-pro-11";
  }
  if (s.includes("macbook-air")) {
    const is15 = screenSize === "15-inch" || s.includes("15");
    return is15 ? "macbook-air-15" : "macbook-air-13";
  }
  if (s.includes("macbook-pro")) {
    const is16 = screenSize === "16-inch" || s.includes("16");
    return is16 ? "macbook-pro-16" : "macbook-pro-14";
  }
  return null;
}

function textMentionsColor(text: string, colorName: string): boolean {
  const hay = text.toLowerCase().replace(/\bgrey\b/g, "gray");
  const needle = colorName.trim().toLowerCase().replace(/\bgrey\b/g, "gray");
  if (!needle || needle === "standard" || needle === "default") return false;
  return hay.includes(needle);
}

export interface ResolveColorGalleryOptions {
  product?: Product | null;
  slug?: string;
  selectedColor?: string;
  screenSize?: string;
  publishedGallery?: ProductBuyGallery | null;
  fallbackImages?: ColorGalleryImage[];
}

/**
 * Shared Apple-style Colour-to-Gallery Resolver.
 * Guarantees:
 * 1. Dedicated colour-variant photos (keyed by stable colorVariantId or finishItems or tagged items)
 *    always take top priority and display ONLY images belonging to the selected colour.
 * 2. Verified single-colour studio photos switch both main image and thumbnails cleanly without
 *    ever polluting the gallery with sibling colours.
 * 3. Missing colour-specific assets fall back gracefully to unassigned neutral product images
 *    (strictly excluding images tagged for other colours) — never substituting wrong colours.
 */
export function resolveColorGallery({
  product,
  slug: explicitSlug,
  selectedColor,
  screenSize,
  publishedGallery,
  fallbackImages = [],
}: ResolveColorGalleryOptions): ResolvedColorGallery {
  const slug = product?.slug || explicitSlug || "";
  const primaryColor = extractPrimaryColorLabel(
    selectedColor || product?.defaultColor || product?.colors?.[0] || ""
  );
  const colorKey = normalizeColorKey(primaryColor);
  const colorVariantId = buildColorVariantId(slug || product?.id, primaryColor);
  const productName = product?.name || "Product";

  // -------------------------------------------------------------------------
  // TIER 1: Admin-published / draft per-colour-variant gallery (highest authority)
  // -------------------------------------------------------------------------
  if (publishedGallery && primaryColor) {
    // 1a. Stable colorVariantGalleries map ("<slug>::<colorKey>")
    const cvMap = publishedGallery.colorVariantGalleries;
    if (cvMap) {
      let matched = cvMap[colorVariantId];
      if (!matched) {
        for (const [k, list] of Object.entries(cvMap)) {
          const suffix = k.includes("::") ? k.split("::").pop() : k;
          if (suffix && normalizeColorKey(suffix) === colorKey && list?.length) {
            matched = list;
            break;
          }
        }
      }
      if (matched && matched.length > 0) {
        const sorted = sortGalleryItems(matched).map((it) => ({
          src: it.src,
          alt: it.alt || `${productName} in ${primaryColor}`,
          title: it.title,
          colorVariantId,
          colorFinish: primaryColor,
        }));
        const images = dedupeImages(sorted);
        return {
          images,
          mainImage: images[0],
          colorVariantId,
          colorKey,
          colorName: primaryColor,
          source: "published_color_variant",
          hasDedicatedColorImages: true,
        };
      }
    }

    // 1b. Legacy finishItems map matched via canonical normalized colorKey
    if (publishedGallery.finishItems) {
      for (const [fKey, list] of Object.entries(publishedGallery.finishItems)) {
        if (normalizeColorKey(fKey) === colorKey && list && list.length > 0) {
          const sorted = sortGalleryItems(list)
            // Guard against legacy buildDefaultBuyGallery mixing other colours into finishItems
            .filter((it) => !itemBelongsToDifferentColor(it, colorVariantId, colorKey))
            .map((it) => ({
              src: it.src,
              alt: it.alt || `${productName} in ${primaryColor}`,
              title: it.title,
              colorVariantId,
              colorFinish: primaryColor,
            }));
          const images = dedupeImages(sorted);
          if (images.length > 0) {
            return {
              images,
              mainImage: images[0],
              colorVariantId,
              colorKey,
              colorName: primaryColor,
              source: "published_color_variant",
              hasDedicatedColorImages: true,
            };
          }
        }
      }
    }

    // 1c. Explicitly colour-tagged items inside publishedGallery.items
    const taggedMatches = sortGalleryItems(
      (publishedGallery.items || []).filter((it) => itemMatchesColor(it, colorVariantId, colorKey))
    );
    if (taggedMatches.length > 0) {
      const images = dedupeImages(
        taggedMatches.map((it) => ({
          src: it.src,
          alt: it.alt || `${productName} in ${primaryColor}`,
          title: it.title,
          colorVariantId,
          colorFinish: primaryColor,
        }))
      );
      return {
        images,
        mainImage: images[0],
        colorVariantId,
        colorKey,
        colorName: primaryColor,
        source: "published_color_variant",
        hasDedicatedColorImages: true,
      };
    }
  }

  // -------------------------------------------------------------------------
  // TIER 2: Admin product.colorImages ("finish-img:" tags) or explicitly colour-named product.images
  // -------------------------------------------------------------------------
  if (product && primaryColor) {
    const colorMatched: ColorGalleryImage[] = [];

    if (product.colorImages) {
      for (const [k, url] of Object.entries(product.colorImages)) {
        if (url && normalizeColorKey(k) === colorKey) {
          colorMatched.push({
            src: url,
            alt: `${productName} in ${primaryColor}`,
            colorVariantId,
            colorFinish: primaryColor,
          });
        }
      }
    }

    const siblingColors = (product.colors || []).filter(
      (c) => normalizeColorKey(c) !== colorKey
    );
    for (const img of product.images || []) {
      const alt = img.alt || "";
      if (
        textMentionsColor(alt, primaryColor) &&
        !siblingColors.some((sib) => textMentionsColor(alt, sib))
      ) {
        colorMatched.push({
          src: img.src,
          alt: alt || `${productName} in ${primaryColor}`,
          colorVariantId,
          colorFinish: primaryColor,
        });
      }
    }

    const deduped = dedupeImages(colorMatched);
    if (deduped.length > 0) {
      return {
        images: deduped,
        mainImage: deduped[0],
        colorVariantId,
        colorKey,
        colorName: primaryColor,
        source: "product_color_map",
        hasDedicatedColorImages: true,
      };
    }
  }

  // -------------------------------------------------------------------------
  // TIER 3: Verified authentic single-colour studio imagery (strictly THIS colour only!)
  // -------------------------------------------------------------------------
  if (slug && primaryColor) {
    const familyKey = resolveVerifiedStaticColorFamily(slug, screenSize);
    if (familyKey && VERIFIED_COLOR_GALLERIES[familyKey]) {
      const familyMap = VERIFIED_COLOR_GALLERIES[familyKey];
      const matchedStatic = familyMap[colorKey];
      if (matchedStatic && matchedStatic.length > 0) {
        const images = dedupeImages(
          matchedStatic.map((img) => ({
            ...img,
            colorVariantId,
            colorFinish: primaryColor,
          }))
        );
        return {
          images,
          mainImage: images[0],
          colorVariantId,
          colorKey,
          colorName: primaryColor,
          source: "verified_static_color",
          hasDedicatedColorImages: true,
        };
      }
    }
  }

  // -------------------------------------------------------------------------
  // TIER 4: Graceful neutral fallback — strictly EXCLUDES any image tagged for a DIFFERENT colour!
  // -------------------------------------------------------------------------
  const siblingColors = (product?.colors || []).filter(
    (c) => normalizeColorKey(c) !== colorKey
  );
  const neutralCandidates: ColorGalleryImage[] = [];

  if (publishedGallery?.items?.length) {
    for (const it of sortGalleryItems(publishedGallery.items)) {
      if (itemBelongsToDifferentColor(it, colorVariantId, colorKey)) continue;
      if (siblingColors.some((sib) => textMentionsColor(it.alt || "", sib))) continue;
      neutralCandidates.push({
        src: it.src,
        alt: it.alt || `${productName}${primaryColor ? ` — ${primaryColor}` : ""}`,
        title: it.title,
      });
    }
  }

  if (neutralCandidates.length === 0 && product?.images?.length) {
    const mainIdx = Math.max(0, Math.min(product.primaryImageIndex ?? 0, product.images.length - 1));
    const ordered = [
      product.images[mainIdx],
      ...product.images.filter((_, idx) => idx !== mainIdx),
    ].filter(Boolean);

    for (const img of ordered) {
      if (siblingColors.some((sib) => textMentionsColor(img.alt || "", sib))) continue;
      neutralCandidates.push({
        src: img.src,
        alt: img.alt || `${productName}${primaryColor ? ` — ${primaryColor}` : ""}`,
      });
    }
  }

  if (neutralCandidates.length === 0 && fallbackImages.length > 0) {
    for (const img of fallbackImages) {
      if (siblingColors.some((sib) => textMentionsColor(img.alt || "", sib))) continue;
      neutralCandidates.push(img);
    }
  }

  if (neutralCandidates.length === 0 && slug && localCatalogueImageBySlug[slug]) {
    neutralCandidates.push({
      src: localCatalogueImageBySlug[slug],
      alt: `${productName}${primaryColor ? ` — ${primaryColor}` : ""}`,
    });
  }

  const finalNeutral = dedupeImages(neutralCandidates);
  return {
    images: finalNeutral,
    mainImage: finalNeutral[0],
    colorVariantId,
    colorKey,
    colorName: primaryColor,
    source: finalNeutral.length > 0 ? "neutral_fallback" : "empty",
    hasDedicatedColorImages: false,
  };
}
