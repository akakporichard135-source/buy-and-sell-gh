import type { CartItem } from "../types/product";
import { localCatalogueImageBySlug } from "./catalogueProductImages";
import { resolveProductColorImage } from "./productColorImages";
import { hasOwnerUploadedProductImages, resolveProductImage } from "./productImages";

/**
 * Approved single-device rear-view image mapping for iPhones by finish.
 * Guarantees that multi-phone / front-and-back images are NEVER shown in cart/checkout.
 */
const IPHONE_SINGLE_REAR_MAP: Record<string, Record<string, string>> = {
  "iphone-18-pro": {
    "deep burgundy": "/products/campaigns/iphone-18-pro-burgundy-finish.webp",
    burgundy: "/products/campaigns/iphone-18-pro-burgundy-finish.webp",
    "space black": "/products/colors/iphone-18-pro-space-black.png",
    black: "/products/colors/iphone-18-pro-space-black.png",
    "natural titanium": "/products/campaigns/iphone-18-pro-silver.webp",
    natural: "/products/campaigns/iphone-18-pro-silver.webp",
    silver: "/products/campaigns/iphone-18-pro-silver.webp",
    white: "/products/campaigns/iphone-18-pro-silver.webp",
    "light blue": "/products/buy/iphone-18-pro-gallery-3-blue.jpg",
    blue: "/products/buy/iphone-18-pro-gallery-3-blue.jpg",
  },
  "iphone-18-pro-max": {
    "deep burgundy": "/products/campaigns/iphone-18-pro-burgundy-finish.webp",
    burgundy: "/products/campaigns/iphone-18-pro-burgundy-finish.webp",
    "space black": "/products/colors/iphone-18-pro-space-black.png",
    black: "/products/colors/iphone-18-pro-space-black.png",
    "natural titanium": "/products/campaigns/iphone-18-pro-silver.webp",
    natural: "/products/campaigns/iphone-18-pro-silver.webp",
    silver: "/products/campaigns/iphone-18-pro-silver.webp",
    white: "/products/campaigns/iphone-18-pro-silver.webp",
    "light blue": "/products/buy/iphone-18-pro-gallery-3-blue.jpg",
    blue: "/products/buy/iphone-18-pro-gallery-3-blue.jpg",
  },
  "iphone-16-pro": {
    "desert titanium": "/products/colors/iphone-16-pro-desert-titanium.png",
    desert: "/products/colors/iphone-16-pro-desert-titanium.png",
    "natural titanium": "/products/colors/iphone-16-pro-natural-titanium.png",
    natural: "/products/colors/iphone-16-pro-natural-titanium.png",
    "black titanium": "/products/colors/iphone-18-pro-space-black.png",
    black: "/products/colors/iphone-18-pro-space-black.png",
    "white titanium": "/products/campaigns/iphone-18-pro-silver.webp",
    white: "/products/campaigns/iphone-18-pro-silver.webp",
  },
  "iphone-16-pro-max": {
    "desert titanium": "/products/colors/iphone-16-pro-desert-titanium.png",
    desert: "/products/colors/iphone-16-pro-desert-titanium.png",
    "natural titanium": "/products/colors/iphone-16-pro-natural-titanium.png",
    natural: "/products/colors/iphone-16-pro-natural-titanium.png",
    "black titanium": "/products/colors/iphone-18-pro-space-black.png",
    black: "/products/colors/iphone-18-pro-space-black.png",
    "white titanium": "/products/campaigns/iphone-18-pro-silver.webp",
    white: "/products/campaigns/iphone-18-pro-silver.webp",
  },
};

/**
 * Checks if an image URL points to a multi-device or front-and-back image.
 */
function isMultiDeviceImage(url: string | undefined): boolean {
  if (!url) return false;
  const lower = url.toLowerCase();
  return (
    lower.includes("front-back") ||
    lower.includes("front_back") ||
    lower.includes("pair") ||
    lower.includes("duo") ||
    lower.includes("lineup") ||
    lower.includes("four-finishes") ||
    lower.includes("colors-white")
  );
}

/**
 * Resolves a single, clean, approved thumbnail for cart item rendering across:
 * - Shopping Bag Drawer
 * - Cart Review Page (/cart and /bag)
 * - Checkout Summary Sidebar (/checkout)
 * - Order Confirmation Page (/order-success)
 */
export function resolveCartItemThumbnail(item: CartItem): string {
  const slug = item.product?.slug || "";
  const colorNorm = (item.color || "").trim().toLowerCase();
  const isIphone = slug.startsWith("iphone") || item.product?.category?.toLowerCase() === "phones";

  // 1. If it's an iPhone, check the approved single-rear map for the selected finish
  if (isIphone) {
    const modelMap = IPHONE_SINGLE_REAR_MAP[slug];
    if (modelMap && colorNorm && modelMap[colorNorm]) {
      return modelMap[colorNorm];
    }
    // Check fallback for any known iPhone finish
    for (const map of Object.values(IPHONE_SINGLE_REAR_MAP)) {
      if (colorNorm && map[colorNorm]) {
        return map[colorNorm];
      }
    }
  }

  // 2. If a colorImageSrc is provided and is NOT a multi-device front-and-back image, use it
  if (item.colorImageSrc && !isMultiDeviceImage(item.colorImageSrc)) {
    return item.colorImageSrc;
  }

  // 3. If owner uploaded custom photos for this specific item and not multi-device, use primary
  if (hasOwnerUploadedProductImages(item.product)) {
    const ownerPrimary = resolveProductImage(item.product)?.src;
    if (ownerPrimary && !isMultiDeviceImage(ownerPrimary)) {
      return ownerPrimary;
    }
  }

  // 4. Resolve color image from universal system, filtering out multi-device assets
  const colorResolved = resolveProductColorImage(item.product, item.color);
  if (colorResolved && !isMultiDeviceImage(colorResolved)) {
    return colorResolved;
  }

  // 5. Use approved single-device cutout from localCatalogueImageBySlug
  const catalogueSingle = localCatalogueImageBySlug[slug];
  if (catalogueSingle && !isMultiDeviceImage(catalogueSingle)) {
    return catalogueSingle;
  }

  // 6. Safe fallback to resolveProductImage
  const fallback = resolveProductImage(item.product)?.src;
  return fallback || "";
}
