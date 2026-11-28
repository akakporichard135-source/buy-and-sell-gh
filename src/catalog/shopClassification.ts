import type { Product, ProductCondition, ProductImage } from "../types/product";
import type { ShopCategoryKey, ShopExperienceConfig } from "../cms/types";
import { familyMatchesProduct } from "./productExperience";
import { getPublicPurchaseAction } from "./productPurchaseAction";
import { isProductOrderable } from "./productCatalog";
import { getCardPriceDisplay } from "../utils/productPricing";
import {
  isUsedProductCondition,
  isValidProductImage,
  resolveCatalogueProductImage,
  resolveProductGallery,
  resolveProductImage,
} from "../utils/productImages";
import {
  compareIpadsNewest,
  compareIphonesNewest,
  compareMacbooksNewest,
  compareWatchesNewest,
} from "../utils/productPresentation";
import { getSelectableStorageOptions, normalizeSpecToken } from "../utils/variantSelection";

export interface ShopFamilyGroup {
  id: string;
  title: string;
  eyebrow?: string;
  tagline: string;
  category: ShopCategoryKey;
  products: Product[];
  primaryProduct: Product;
  startingPriceText: string;
  hasInStock: boolean;
  screenSizes: string[];
  colors: string[];
  imageSrc: string;
  imageAlt: string;
}

export interface ShopSearchResult {
  product: Product;
  category: ShopCategoryKey | "airpods" | "accessories";
  isUkUsed: boolean;
  effectiveCondition: ProductCondition;
  familyLabel: string;
  screenSize?: string;
  matchedFields: string[];
  score: number;
  priceDisplay: string;
  canBuy: boolean;
  imageSrc: string;
  buyPath: string;
}

// ============================================================================
// 1. AUTHORITATIVE IPHONE UK USED RULE & CONDITION CLASSIFICATION
// ============================================================================

/**
 * Explicit Buy & Sell GH Owner Classification Rule:
 * Every iPhone model from the iPhone 15 Pro generation downwards (iPhone 15 Pro Max,
 * iPhone 15 Pro, iPhone 15 Plus, iPhone 15, iPhone 14*, 13*, 12*, 11*, XS/XR/X/SE/8...)
 * MUST be classified and displayed under UK Used.
 * Newer models (iPhone Duo, 18 Pro/Pro Max, Air, 17*, 16*) remain Brand New unless explicitly marked used.
 */
export function isIphoneUkUsedGeneration(
  product: Pick<Product, "slug" | "name" | "model" | "category" | "mainWebsiteSection">
): boolean {
  const sec = (product.mainWebsiteSection || "").toLowerCase();
  const cat = (product.category || "").toLowerCase();
  const text = `${product.slug || ""} ${product.name || ""} ${product.model || ""}`.toLowerCase();

  // Exclude cases/cables/chargers that merely mention "iPhone"
  if (
    cat === "accessories" ||
    sec === "accessories" ||
    /\b(case|charger|cable|adapter|magsafe|pencil|keyboard|mouse|trackpad)\b/.test(text)
  ) {
    return false;
  }

  const isIphone = sec === "iphone" || cat === "iphones" || /\biphone\b/.test(text);
  if (!isIphone) return false;

  // Newer Brand New generations stay Brand New
  if (/\biphone[\s-]*(duo|air|18|17|16)\b/.test(text)) return false;

  // iPhone 15 generation (15 Pro Max, 15 Pro, 15 Plus, 15) and everything older -> UK Used
  if (/\biphone[\s-]*(15|14|13|12|11|xs|xr|x|se|8|7|6)\b/.test(text)) return true;

  return false;
}

/**
 * Determines whether a product belongs in the UK Used inventory section.
 * - For iPhone: iPhone 15 Pro generation downwards OR explicit used condition.
 * - For Mac / iPad / Watch: ONLY genuine existing or Admin-added UK Used / Pre-Owned
 *   conditions ("UK Used", "Excellent", "Very Good") — never invents used stock by age.
 */
export function isUkUsedProduct(
  product: Pick<Product, "slug" | "name" | "model" | "category" | "mainWebsiteSection" | "condition" | "tags">
): boolean {
  if (product.tags?.includes("inventory:uk-used")) return true;
  if (product.tags?.includes("inventory:brand-new") && !isIphoneUkUsedGeneration(product)) return false;
  if (isIphoneUkUsedGeneration(product)) return true;
  return isUsedProductCondition(product.condition);
}

/**
 * Authoritative display condition for cards, configurators, search, and cart.
 * Resolves conflicting DB condition="Brand New" on iPhone 15 & older to "UK Used"
 * without altering product IDs, slugs, pricing, or order history.
 */
export function getEffectiveCondition(
  product: Pick<Product, "slug" | "name" | "model" | "category" | "mainWebsiteSection" | "condition" | "tags">
): ProductCondition {
  if (isIphoneUkUsedGeneration(product)) {
    if (product.condition === "Brand New" || product.condition === "To Confirm") {
      return "UK Used";
    }
    return product.condition;
  }
  return product.condition;
}

/**
 * True when a product is a genuine device belonging to one of the 4 core Shop categories
 * (excludes accessories like Magic Keyboard for iPad or Watch Chargers from device shelves).
 */
export function isShopDeviceForCategory(product: Product, category: ShopCategoryKey): boolean {
  if (product.archived) return false;
  const text = `${product.slug} ${product.name}`.toLowerCase();

  // Exclude accessories that live in Accessories shelves instead of device lineups
  if (
    product.category === "Accessories" ||
    product.mainWebsiteSection === "Accessories" ||
    /\b(magic keyboard|magic mouse|magic trackpad|apple pencil|power adapter|charge cable|magsafe charger|magsafe.*case|clear.*case|fast charger)\b/.test(
      text
    )
  ) {
    return false;
  }

  // Exclude empty placeholder legacy record `slug === "iphone"` with blank model name & priceOnRequest
  if (category === "iphone" && product.slug === "iphone" && product.priceOnRequest && product.variants?.length === 0) {
    return false;
  }

  return familyMatchesProduct(product, category);
}

export function sortShopDevicesNewest(products: Product[], category: ShopCategoryKey): Product[] {
  return [...products].sort((a, b) => {
    if (category === "mac") return compareMacbooksNewest(a, b);
    if (category === "ipad") return compareIpadsNewest(a, b);
    if (category === "iphone") return compareIphonesNewest(a, b);
    if (category === "watch") return compareWatchesNewest(a, b);
    return a.name.localeCompare(b.name);
  });
}

// ============================================================================
// 2. REAL SPEC EXTRACTION (STRICTLY FROM REAL CATALOGUE RECORDS — NEVER INVENTED)
// ============================================================================

export function isDesktopMac(product: Pick<Product, "slug" | "name" | "model">): boolean {
  const t = `${product.slug} ${product.name} ${product.model || ""}`.toLowerCase();
  return /\b(mac[\s-]?mini|mac[\s-]?studio|mac[\s-]?pro)\b/.test(t);
}

export function extractScreenSize(
  product: Pick<Product, "slug" | "name" | "model" | "specs" | "variants">,
  category?: ShopCategoryKey
): string | undefined {
  const t = `${product.name} ${product.slug} ${product.model || ""}`.toLowerCase();

  // Desktop Macs never show laptop screen size selections
  if (category === "mac" && isDesktopMac(product)) return undefined;

  // Check explicit variant screenSize first if single uniform size
  const varSizes = Array.from(
    new Set((product.variants ?? []).map((v) => v.screenSize?.trim()).filter(Boolean) as string[])
  );
  if (varSizes.length === 1) return varSizes[0];

  // Explicit inch measurement in name/slug (e.g., 16-inch, 15-inch, 14-inch, 13-inch, 12.9-inch, 11-inch)
  const inchMatch = t.match(/\b(16|15|14|13\.6|13|12\.9|11|10\.9|8\.3)[\s-]*inch\b/);
  if (inchMatch) return `${inchMatch[1]}-inch`;

  // Watch mm case size in name/slug
  const mmMatch = t.match(/\b(49|46|45|44|42|41|40)\s*mm\b/);
  if (mmMatch) return `${mmMatch[1]}mm`;

  // Authentic Apple screen sizes by iPhone model (display-only informational spec, never invented choices!)
  if (category === "iphone" || /\biphone\b/.test(t)) {
    if (/\biphone[\s-]*duo\b/.test(t)) return "Dual Foldable Display";
    if (/\biphone[\s-]*air\b/.test(t)) return "6.6-inch";
    if (/\biphone[\s-]*(18|17|16)[\s-]*pro[\s-]*max\b/.test(t)) return "6.9-inch";
    if (/\biphone[\s-]*(18|17|16)[\s-]*pro\b/.test(t)) return "6.3-inch";
    if (/\biphone[\s-]*17\b/.test(t)) return "6.3-inch";
    if (/\biphone[\s-]*(16|15|14)[\s-]*plus\b/.test(t)) return "6.7-inch";
    if (/\biphone[\s-]*(15|14|13|12)[\s-]*pro[\s-]*max\b/.test(t)) return "6.7-inch";
    if (/\biphone[\s-]*11[\s-]*pro[\s-]*max\b/.test(t)) return "6.5-inch";
    if (/\biphone[\s-]*(13|12)[\s-]*mini\b/.test(t)) return "5.4-inch";
    if (/\biphone[\s-]*(16e|16|15|14|13|12|11)\b/.test(t)) return "6.1-inch";
  }

  // Authentic iPad screen sizes for standard/mini models
  if (category === "ipad" || /\bipad\b/.test(t)) {
    if (/\bipad[\s-]*mini\b/.test(t)) return "8.3-inch";
    if (/\bipad[\s-]*(a16|10th|11th)\b/.test(t)) return "10.9-inch";
    if (/\bipad[\s-]*air[\s-]*(5th|5)\b/.test(t)) return "10.9-inch";
    if (product.slug === "ipad-air") return "11-inch / 13-inch";
    if (product.slug === "ipad-pro") return "11-inch";
  }

  // Authentic MacBook Neo / generic MacBook Air sizes
  if (category === "mac") {
    if (product.slug === "macbook-neo") return "13-inch";
    if (product.slug === "macbook-air") return "13-inch";
  }

  return undefined;
}

export function extractChipOptions(product: Product): string[] {
  const fromVars = Array.from(
    new Set((product.variants ?? []).map((v) => v.chip?.trim()).filter(Boolean) as string[])
  );
  if (fromVars.length > 0) return fromVars;

  const text = `${product.name} ${product.slug} ${(product.specs ?? []).join(" ")}`;
  const found: string[] = [];
  const patterns = [
    /\bM5\s+Max\b/i,
    /\bM5\s+Pro\b/i,
    /\bM5\b/i,
    /\bM4\s+Max\b/i,
    /\bM4\s+Pro\b/i,
    /\bM4\b/i,
    /\bM3\s+Max\b/i,
    /\bM3\s+Pro\b/i,
    /\bM3\b/i,
    /\bM2\s+Max\b/i,
    /\bM2\s+Pro\b/i,
    /\bM2\b/i,
    /\bM1\s+Max\b/i,
    /\bM1\s+Pro\b/i,
    /\bM1\b/i,
    /\bA20\s+Pro\b/i,
    /\bA19\s+Pro\b/i,
    /\bA18\s+Pro\b/i,
    /\bA18\b/i,
    /\bA17\s+Pro\b/i,
    /\bA16\b/i,
  ];
  for (const pat of patterns) {
    const m = text.match(pat);
    if (m) {
      const normalized = m[0].replace(/\s+/g, " ");
      if (!found.some((x) => x.toLowerCase() === normalized.toLowerCase())) {
        // Don't add bare "M4" if "M4 Pro" or "M4 Max" is already matched from a Pro/Max slug
        if (
          /^M\d$/i.test(normalized) &&
          found.some((x) => x.toLowerCase().startsWith(normalized.toLowerCase() + " "))
        ) {
          continue;
        }
        found.push(normalized);
      }
    }
  }
  return found;
}

export function extractMemoryOptions(product: Product): string[] {
  return Array.from(
    new Set((product.variants ?? []).map((v) => v.memory?.trim()).filter(Boolean) as string[])
  );
}

export function extractConnectivityOptions(product: Product): string[] {
  const fromVars = Array.from(
    new Set((product.variants ?? []).map((v) => v.connectivity?.trim()).filter(Boolean) as string[])
  );
  if (fromVars.length > 0) return fromVars;

  // Watch records store GPS / GPS + Cellular inside storage_options when variants aren't present
  const fromStorage = (product.storage ?? []).filter((s) => /gps|wi-?fi|cellular/i.test(s));
  if (fromStorage.length > 0) return fromStorage;
  return [];
}

export function extractWatchCaseSizes(product: Product): string[] {
  const fromVars = Array.from(
    new Set((product.variants ?? []).map((v) => v.screenSize?.trim()).filter(Boolean) as string[])
  );
  if (fromVars.length > 0) return fromVars;

  const text = `${product.name} ${product.slug} ${(product.specs ?? []).join(" ")}`.toLowerCase();
  if (text.includes("ultra")) return ["49mm"];
  if (text.includes("series 12") || text.includes("series-12") || text.includes("series 11") || text.includes("series 10")) {
    return ["42mm", "46mm"];
  }
  if (text.includes("series 9") || text.includes("series 8") || text.includes("series 7")) {
    return ["41mm", "45mm"];
  }
  if (text.includes("se")) return ["40mm", "44mm"];
  return [];
}

// ============================================================================
// 3. INDEPENDENT IMAGE RESOLUTION (BRAND NEW PRESERVED; UK USED SEPARATE)
// ============================================================================

export function resolveShopProductGallery(
  product: Product,
  shopConfig?: ShopExperienceConfig | null
): ProductImage[] {
  const isUsed = isUkUsedProduct(product);

  // 1. For UK Used products, independent UK Used CMS photos take highest priority
  // (never touching or overwriting Brand New image assignments)
  if (isUsed && shopConfig?.ukUsedOverrides) {
    const override =
      shopConfig.ukUsedOverrides[product.id] || shopConfig.ukUsedOverrides[product.slug];
    const customImgs = (override?.customImages ?? []).filter(isValidProductImage);
    if (customImgs.length > 0) return customImgs;
  }

  // 2. Existing owner-uploaded photos or Brand New catalogue imagery
  const existing = resolveProductGallery(product, { allowRepresentativeForUsed: true });
  if (existing.length > 0) return existing;

  // 3. Catalogue image fallback
  const catImg = resolveCatalogueProductImage(product) || resolveProductImage(product, { allowRepresentativeForUsed: true });
  if (catImg) return [catImg];

  return [];
}

export function resolveShopProductImageSrc(
  product: Product,
  shopConfig?: ShopExperienceConfig | null
): string {
  return resolveShopProductGallery(product, shopConfig)[0]?.src || "";
}

// ============================================================================
// 4. PRODUCT FAMILY GROUPING (APPLE SHOP ARCHITECTURE — NEWEST FIRST)
// ============================================================================

export interface FamilyBucketMeta {
  id: string;
  title: string;
  tagline: string;
  eyebrow?: string;
  order: number;
}

export function getProductFamilyBucket(product: Product, category: ShopCategoryKey): FamilyBucketMeta {
  const text = `${product.slug} ${product.name}`.toLowerCase();

  if (category === "mac") {
    if (text.includes("macbook-neo") || text.includes("macbook neo")) {
      return { id: "macbook-neo", title: "MacBook Neo", eyebrow: "NEW", tagline: "Everyday Apple Silicon portability at an accessible GH₵ price.", order: 0 };
    }
    if (text.includes("macbook-air") || text.includes("macbook air")) {
      return { id: "macbook-air", title: "MacBook Air", eyebrow: "M5 & M4", tagline: "Strikingly thin 13-inch and 15-inch powerhouses built for work anywhere.", order: 1 };
    }
    if (text.includes("macbook-pro") || text.includes("macbook pro")) {
      return { id: "macbook-pro", title: "MacBook Pro", eyebrow: "M5 PRO & M4", tagline: "14-inch and 16-inch Liquid Retina XDR pro laptops for heavy workflows.", order: 2 };
    }
    if (text.includes("mac-mini") || text.includes("mac mini")) {
      return { id: "mac-mini", title: "Mac mini", eyebrow: "DESKTOP", tagline: "Compact Apple Silicon desktop built for desks, studios, and offices.", order: 3 };
    }
    if (text.includes("mac-studio") || text.includes("mac studio")) {
      return { id: "mac-studio", title: "Mac Studio", eyebrow: "PRO DESKTOP", tagline: "Extreme desktop performance for pro audio, video, and 3D work.", order: 4 };
    }
    return { id: "mac-other", title: "More Mac", tagline: "Genuine Apple desktop and laptop systems verified in Accra.", order: 5 };
  }

  if (category === "ipad") {
    if (text.includes("ipad-pro") || text.includes("ipad pro")) {
      return { id: "ipad-pro", title: "iPad Pro", eyebrow: "M5 & M4", tagline: "11-inch and 13-inch Ultra Retina XDR display with flagship Apple Silicon.", order: 0 };
    }
    if (text.includes("ipad-air") || text.includes("ipad air")) {
      return { id: "ipad-air", title: "iPad Air", eyebrow: "POPULAR", tagline: "Serious M-series performance in 11-inch and 13-inch finishes.", order: 1 };
    }
    if (text.includes("ipad-mini") || text.includes("ipad mini")) {
      return { id: "ipad-mini", title: "iPad mini", eyebrow: "COMPACT", tagline: "The full 8.3-inch iPad experience sized to fit in one hand.", order: 3 };
    }
    return { id: "ipad-standard", title: "iPad", eyebrow: "EVERYDAY", tagline: "Colorful all-screen iPad built for study, notes, and everyday life.", order: 2 };
  }

  if (category === "iphone") {
    if (text.includes("iphone-duo") || text.includes("iphone duo")) {
      return { id: "iphone-duo", title: "iPhone Duo", eyebrow: "NEW FOLDABLE", tagline: "Dual-canvas foldable flagship iPhone available in Accra.", order: 0 };
    }
    if (/\biphone[\s-]*18[a-z]?\b/.test(text)) {
      return { id: "iphone-18-pro", title: "iPhone 18 Pro", eyebrow: "NEW FLAGSHIP", tagline: "6.3-inch Pro and 6.9-inch Pro Max titanium flagships.", order: 1 };
    }
    if (text.includes("iphone-air") || text.includes("iphone air")) {
      return { id: "iphone-air", title: "iPhone Air", eyebrow: "ULTRA-THIN", tagline: "Featherlight 6.6-inch design with flagship pro performance.", order: 2 };
    }
    if (/\biphone[\s-]*17[a-z]?\b/.test(text)) {
      return { id: "iphone-17", title: "iPhone 17 Series", eyebrow: "PRO & STANDARD", tagline: "iPhone 17 Pro Max, 17 Pro, and iPhone 17 in Brand New stock.", order: 3 };
    }
    if (/\biphone[\s-]*16[a-z]?\b/.test(text)) {
      return { id: "iphone-16", title: "iPhone 16 Series", eyebrow: "IN STOCK", tagline: "iPhone 16 Pro Max, 16 Pro, 16 Plus, 16, and 16e.", order: 4 };
    }
    if (/\biphone[\s-]*15\b/.test(text)) {
      return { id: "iphone-15-uk", title: "iPhone 15 Series", eyebrow: "UK USED", tagline: "Verified UK Used iPhone 15 Pro Max, 15 Pro, 15 Plus & 15.", order: 10 };
    }
    if (/\biphone[\s-]*14\b/.test(text)) {
      return { id: "iphone-14-uk", title: "iPhone 14 Series", eyebrow: "UK USED", tagline: "Verified UK Used iPhone 14 Pro Max, 14 Pro, 14 Plus & 14.", order: 11 };
    }
    if (/\biphone[\s-]*13\b/.test(text)) {
      return { id: "iphone-13-uk", title: "iPhone 13 Series", eyebrow: "UK USED", tagline: "Verified UK Used iPhone 13 Pro Max, 13 Pro, 13 & 13 mini.", order: 12 };
    }
    if (/\biphone[\s-]*12\b/.test(text)) {
      return { id: "iphone-12-uk", title: "iPhone 12 Series", eyebrow: "UK USED", tagline: "Verified UK Used iPhone 12 Pro Max, 12 Pro, 12 & 12 mini.", order: 13 };
    }
    return { id: "iphone-11-uk", title: "iPhone 11 & Earlier", eyebrow: "UK USED", tagline: "Inspected classic UK Used iPhones verified in Accra.", order: 14 };
  }

  // Apple Watch
  if (text.includes("series-12") || text.includes("series 12")) {
    return { id: "watch-series-12", title: "Apple Watch Series 12", eyebrow: "NEW", tagline: "42mm and 46mm ultra-slim display with advanced health sensors.", order: 0 };
  }
  if (text.includes("ultra-4") || text.includes("ultra 4")) {
    return { id: "watch-ultra-4", title: "Apple Watch Ultra 4", eyebrow: "NEW TITANIUM", tagline: "49mm Grade 5 titanium adventure watch ready in Accra.", order: 1 };
  }
  if (text.includes("se-3") || text.includes("se 3")) {
    return { id: "watch-se-3", title: "Apple Watch SE 3", eyebrow: "GREAT VALUE", tagline: "40mm and 44mm essential health, fitness, and connectivity.", order: 2 };
  }
  if (text.includes("ultra")) {
    return { id: "watch-ultra", title: "Apple Watch Ultra", eyebrow: "49MM TITANIUM", tagline: "Rugged multi-day GPS + Cellular titanium editions.", order: 3 };
  }
  if (text.includes("series-11") || text.includes("series 11") || text.includes("series-10") || text.includes("series 10")) {
    return { id: "watch-series-recent", title: "Apple Watch Series 11 & 10", eyebrow: "42MM & 46MM", tagline: "Wide-angle OLED Series models in GPS and Cellular.", order: 4 };
  }
  return { id: "watch-classic", title: "Apple Watch Series & SE", eyebrow: "UK USED", tagline: "Verified pre-owned Apple Watch Series and SE models.", order: 5 };
}

export function buildShopFamilyGroups(
  products: Product[],
  category: ShopCategoryKey,
  shopConfig?: ShopExperienceConfig | null
): ShopFamilyGroup[] {
  const sorted = sortShopDevicesNewest(products, category);
  const map = new Map<string, { meta: FamilyBucketMeta; products: Product[] }>();

  for (const product of sorted) {
    const meta = getProductFamilyBucket(product, category);
    const existing = map.get(meta.id);
    if (existing) {
      existing.products.push(product);
    } else {
      map.set(meta.id, { meta, products: [product] });
    }
  }

  const customOrder = shopConfig?.categories?.[category]?.familyOrder ?? [];
  const hiddenFamilies = new Set(shopConfig?.categories?.[category]?.hiddenFamilyIds ?? []);

  return Array.from(map.values())
    .filter(({ meta }) => !hiddenFamilies.has(meta.id))
    .sort((a, b) => {
      const idxA = customOrder.indexOf(a.meta.id);
      const idxB = customOrder.indexOf(b.meta.id);
      if (idxA !== -1 || idxB !== -1) {
        return (idxA === -1 ? 999 : idxA) - (idxB === -1 ? 999 : idxB);
      }
      return a.meta.order - b.meta.order;
    })
    .map(({ meta, products: familyProducts }) => {
      // Pick best representative product: prefer in-stock newest model
      const primaryProduct =
        familyProducts.find((p) => isProductOrderable(p) && getPublicPurchaseAction(p) === "buy") ||
        familyProducts[0];

      const priced = familyProducts
        .map((p) => {
          const variants = (p.variants ?? []).filter((v) => v.available !== false && v.price > 0);
          const minVar = variants.length > 0 ? Math.min(...variants.map((v) => v.price)) : 0;
          return minVar > 0 ? minVar : p.price;
        })
        .filter((price) => Number.isFinite(price) && price > 0);

      const minPrice = priced.length > 0 ? Math.min(...priced) : 0;
      const startingPriceText =
        minPrice > 0
          ? familyProducts.length > 1 || (primaryProduct.variants?.length ?? 0) > 1
            ? `From GH₵ ${Math.round(minPrice).toLocaleString("en-US")}`
            : `GH₵ ${Math.round(minPrice).toLocaleString("en-US")}`
          : getCardPriceDisplay(primaryProduct).current;

      const screenSizes = Array.from(
        new Set(
          familyProducts
            .flatMap((p) => {
              if (category === "watch") return extractWatchCaseSizes(p);
              const sz = extractScreenSize(p, category);
              if (!sz) return [];
              return sz
                .split("/")
                .map((part) => part.trim())
                .filter(Boolean);
            })
            .filter(Boolean)
        )
      );

      const colors = Array.from(
        new Set(familyProducts.flatMap((p) => p.colors ?? []).filter(Boolean))
      ).slice(0, 6);

      const imageSrc =
        resolveShopProductImageSrc(primaryProduct, shopConfig) ||
        familyProducts.map((p) => resolveShopProductImageSrc(p, shopConfig)).find(Boolean) ||
        "";

      return {
        id: meta.id,
        title: meta.title,
        eyebrow: meta.eyebrow,
        tagline: meta.tagline,
        category,
        products: familyProducts,
        primaryProduct,
        startingPriceText,
        hasInStock: familyProducts.some((p) => isProductOrderable(p)),
        screenSizes,
        colors,
        imageSrc,
        imageAlt: `${meta.title} at Buy & Sell GH`,
      };
    });
}

// ============================================================================
// 5. CATEGORY-RELEVANT REAL ACCESSORIES MAPPER
// ============================================================================

const CATEGORY_ACCESSORY_SLUGS: Record<ShopCategoryKey, string[]> = {
  mac: [
    "magic-keyboard-with-touch-id",
    "apple-magic-keyboard",
    "magic-mouse",
    "apple-magic-trackpad",
    "apple-usb-c-to-magsafe-3-cable",
    "apple-240w-usb-c-charge-cable",
    "apple-140w-usb-c-power-adapter",
    "apple-96w-usb-c-power-adapter",
    "apple-70w-usb-c-power-adapter",
    "apple-35w-dual-usb-c-port-power-adapter",
    "airpods-pro-3",
    "airpods-max-2",
  ],
  ipad: [
    "apple-pencil-pro",
    "apple-pencil-usb-c",
    "magic-keyboard-for-ipad",
    "apple-magic-keyboard-folio",
    "apple-20w-usb-c-power-adapter",
    "apple-35w-dual-usb-c-port-power-adapter",
    "apple-60w-usb-c-charge-cable",
    "apple-usb-c-charge-cable",
    "airpods-pro-3",
  ],
  iphone: [
    "apple-magsafe-iphone-case",
    "apple-clear-iphone-case-magsafe",
    "apple-magsafe-charger",
    "apple-20w-usb-c-power-adapter",
    "apple-35w-dual-usb-c-port-power-adapter",
    "apple-60w-usb-c-charge-cable",
    "apple-usb-c-charge-cable",
    "apple-usb-c-to-lightning-cable",
    "airpods-pro-3",
    "airpods-4-anc",
  ],
  watch: [
    "apple-watch-magnetic-fast-charger-to-usb-c-cable",
    "apple-20w-usb-c-power-adapter",
    "apple-35w-dual-usb-c-port-power-adapter",
    "airpods-pro-3",
    "airpods-4-anc",
  ],
};

export function getShopAccessoriesForCategory(
  allProducts: Product[],
  category: ShopCategoryKey,
  customSlugs?: string[]
): Product[] {
  const orderedSlugs =
    customSlugs && customSlugs.length > 0 ? customSlugs : CATEGORY_ACCESSORY_SLUGS[category];
  const bySlug = new Map(allProducts.filter((p) => !p.archived).map((p) => [p.slug, p]));
  const picked: Product[] = [];

  for (const slug of orderedSlugs) {
    const match = bySlug.get(slug);
    if (match) picked.push(match);
  }

  // Also include any accessory in Supabase whose name explicitly mentions this category
  for (const p of allProducts) {
    if (p.archived || picked.some((x) => x.id === p.id)) continue;
    const isAcc =
      p.category === "Accessories" ||
      p.mainWebsiteSection === "Accessories" ||
      p.slug === "magic-keyboard-for-ipad";
    if (!isAcc) continue;
    const text = `${p.name} ${p.slug} ${p.description}`.toLowerCase();
    if (
      (category === "mac" && /\b(mac|magsafe 3|magic mouse|magic trackpad|touch id|70w|96w|140w)\b/.test(text)) ||
      (category === "ipad" && /\b(ipad|pencil|keyboard folio)\b/.test(text)) ||
      (category === "iphone" && /\b(iphone|magsafe|lightning|20w)\b/.test(text)) ||
      (category === "watch" && /\b(watch|magnetic fast charger)\b/.test(text))
    ) {
      picked.push(p);
    }
  }

  return picked;
}

// ============================================================================
// 6. WORKING LIVE PRODUCT SEARCH ENGINE
// ============================================================================

export function getProductShopBuyPath(product: Product): string {
  const t = `${product.slug} ${product.name}`.toLowerCase();
  if (
    product.category === "Accessories" ||
    product.mainWebsiteSection === "Accessories" ||
    product.slug === "magic-keyboard-for-ipad" ||
    /\b(apple pencil|magic keyboard|magic mouse|magic trackpad|power adapter|charge cable|magsafe charger|magsafe.*case|clear.*case|fast charger)\b/.test(
      t
    )
  ) {
    return `/shop/buy-accessory/${product.slug}`;
  }
  if (familyMatchesProduct(product, "mac")) return `/shop/buy-mac/${product.slug}`;
  if (familyMatchesProduct(product, "ipad")) return `/shop/buy-ipad/${product.slug}`;
  if (familyMatchesProduct(product, "iphone")) return `/shop/buy-iphone/${product.slug}`;
  if (familyMatchesProduct(product, "watch")) return `/shop/buy-watch/${product.slug}`;
  if (familyMatchesProduct(product, "airpods")) return `/shop/buy-airpods/${product.slug}`;
  return `/product/${product.slug}`;
}

export function searchShopCatalog(
  allProducts: Product[],
  rawQuery: string,
  options?: {
    category?: ShopCategoryKey | "all";
    conditionFilter?: "all" | "brand-new" | "uk-used";
    inStockOnly?: boolean;
    shopConfig?: ShopExperienceConfig | null;
  }
): ShopSearchResult[] {
  const query = rawQuery.trim().toLowerCase();
  const tokens = query
    .split(/\s+/)
    .map((t) => t.trim())
    .filter(Boolean);

  const results: ShopSearchResult[] = [];
  const active = allProducts.filter((p) => !p.archived);

  for (const product of active) {
    // Skip placeholder blank iPhone draft
    if (product.slug === "iphone" && product.priceOnRequest && (product.variants?.length ?? 0) === 0) {
      continue;
    }

    let productCat: ShopCategoryKey | "airpods" | "accessories" = "accessories";
    if (isShopDeviceForCategory(product, "mac")) productCat = "mac";
    else if (isShopDeviceForCategory(product, "ipad")) productCat = "ipad";
    else if (isShopDeviceForCategory(product, "iphone")) productCat = "iphone";
    else if (isShopDeviceForCategory(product, "watch")) productCat = "watch";
    else if (familyMatchesProduct(product, "airpods")) productCat = "airpods";

    if (options?.category && options.category !== "all") {
      // In category search, include that category's devices AND that category's accessories
      const catAccSlugs = new Set(
        getShopAccessoriesForCategory(active, options.category).map((a) => a.slug)
      );
      if (productCat !== options.category && !catAccSlugs.has(product.slug)) {
        continue;
      }
    }

    const isUsed = isUkUsedProduct(product);
    if (options?.conditionFilter === "brand-new" && isUsed) continue;
    if (options?.conditionFilter === "uk-used" && !isUsed) continue;

    const canBuy = isProductOrderable(product) && getPublicPurchaseAction(product) === "buy";
    if (options?.inStockOnly && !canBuy) continue;

    const effectiveCondition = getEffectiveCondition(product);
    const screenSize =
      productCat === "mac" || productCat === "ipad" || productCat === "iphone" || productCat === "watch"
        ? extractScreenSize(product, productCat)
        : undefined;
    const watchSizes = productCat === "watch" ? extractWatchCaseSizes(product) : [];
    const familyLabel =
      productCat === "mac" || productCat === "ipad" || productCat === "iphone" || productCat === "watch"
        ? getProductFamilyBucket(product, productCat).title
        : productCat === "airpods"
        ? "AirPods"
        : "Accessories";

    const storages = getSelectableStorageOptions(product);
    const chips = extractChipOptions(product);
    const memories = extractMemoryOptions(product);
    const connectivities = extractConnectivityOptions(product);

    const searchableBuckets: Array<{ label: string; text: string; weight: number }> = [
      { label: "Name", text: `${product.name} ${product.model} ${product.slug}`, weight: 10 },
      { label: "Family", text: `${familyLabel} ${product.generation || ""} ${product.category}`, weight: 7 },
      { label: "Condition", text: `${effectiveCondition} ${isUsed ? "uk used pre-owned used" : "brand new sealed"}`, weight: 6 },
      { label: "Size", text: `${screenSize || ""} ${watchSizes.join(" ")} ${(screenSize || "").replace("-inch", "\"")}`, weight: 7 },
      { label: "Storage", text: storages.join(" "), weight: 5 },
      { label: "Chip & RAM", text: `${chips.join(" ")} ${memories.join(" ")}`, weight: 6 },
      { label: "Colour", text: `${(product.colors ?? []).join(" ")} ${(product.variants ?? []).map((v) => v.finish || "").join(" ")}`, weight: 5 },
      { label: "Specs", text: `${connectivities.join(" ")} ${(product.specs ?? []).join(" ")} ${product.description || ""}`, weight: 3 },
    ];

    let score = 0;
    const matchedFields: string[] = [];

    if (tokens.length === 0) {
      score = canBuy ? 10 : 5;
    } else {
      let allMatched = true;
      for (const tok of tokens) {
        const normTok = normalizeSpecToken(tok);
        let tokMatched = false;
        for (const bucket of searchableBuckets) {
          const lower = bucket.text.toLowerCase();
          const normBucket = normalizeSpecToken(bucket.text);
          if (lower.includes(tok) || (normTok.length >= 2 && normBucket.includes(normTok))) {
            tokMatched = true;
            score += bucket.weight;
            if (!matchedFields.includes(bucket.label)) matchedFields.push(bucket.label);
          }
        }
        if (!tokMatched) {
          allMatched = false;
          break;
        }
      }
      if (!allMatched) continue;
    }

    if (canBuy) score += 3;
    if (!isUsed) score += 1;

    const priceDisp = getCardPriceDisplay(product);
    results.push({
      product,
      category: productCat,
      isUkUsed: isUsed,
      effectiveCondition,
      familyLabel,
      screenSize: screenSize || watchSizes.join(" / ") || undefined,
      matchedFields,
      score,
      priceDisplay: priceDisp.current,
      canBuy,
      imageSrc: resolveShopProductImageSrc(product, options?.shopConfig),
      buyPath: getProductShopBuyPath(product),
    });
  }

  return results.sort((a, b) => b.score - a.score || a.product.name.localeCompare(b.product.name));
}
