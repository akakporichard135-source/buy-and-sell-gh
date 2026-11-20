import { isOthersProduct } from "./catalogueDiscovery";
import {
  familyMatchesProduct,
  productBuyPath,
  type ProductFamilyKey,
} from "./productExperience";
import type { Product } from "../types/product";

export type DesktopNavCategoryId =
  | "store"
  | "mac"
  | "ipad"
  | "iphone"
  | "watch"
  | "airpods"
  | "accessories"
  | "others"
  | "support";

export interface DesktopMenuItem {
  label: string;
  to: string;
  badge?: string;
}

export interface DesktopMenuColumn {
  id: string;
  heading: string;
  variant: "primary" | "secondary";
  items: DesktopMenuItem[];
}

export interface DesktopMegaMenuData {
  categoryId: DesktopNavCategoryId;
  categoryLabel: string;
  columns: DesktopMenuColumn[];
}

const GENERIC_PLACEHOLDER_SLUGS = new Set([
  "iphone",
  "apple-watch",
  "ipad",
  "mac",
  "airpods",
  "accessories",
  "others",
]);

const PRIORITY_SLUGS_BY_FAMILY: Record<ProductFamilyKey, string[]> = {
  mac: [
    "macbook-air",
    "macbook-pro",
    "macbook-pro-14-inch-m5-pro-m5-max",
    "macbook-pro-16-inch-m5-pro-m5-max",
    "macbook-pro-14-inch-m4-pro-m4-max",
    "macbook-pro-14-inch-m4",
    "macbook-air-15-inch-m5",
    "macbook-air-13-inch-m4",
    "mac-mini",
    "mac-studio",
  ],
  ipad: [
    "ipad-pro",
    "ipad-pro-13-inch-m5",
    "ipad-pro-11-inch-m5",
    "ipad-air",
    "ipad-air-13-inch-m4",
    "ipad-air-11-inch-m4",
    "ipad-a16",
    "ipad-10th-generation",
    "ipad-mini-a17-pro",
  ],
  iphone: [
    "iphone-18-pro-max",
    "iphone-18-pro",
    "iphone-duo",
    "iphone-air",
    "iphone-17-pro-max",
    "iphone-17-pro",
    "iphone-17",
    "iphone-16-pro-max",
    "iphone-16e",
  ],
  watch: [
    "apple-watch-series-12",
    "apple-watch-ultra-4",
    "apple-watch-se-3",
    "apple-watch-series-11",
    "apple-watch-ultra-3",
    "apple-watch-series-10",
    "apple-watch-ultra-2",
  ],
  airpods: [
    "airpods-pro-3",
    "airpods-5",
    "airpods-4-anc",
    "airpods-4",
    "airpods-max-usb-c",
    "airpods-max-2",
    "airpods-pro-2",
  ],
  accessories: [
    "apple-magsafe-charger",
    "apple-magsafe-iphone-case",
    "apple-clear-iphone-case-magsafe",
    "apple-pencil-pro",
    "magic-keyboard-for-ipad",
    "magic-keyboard-with-touch-id",
    "magic-mouse",
    "apple-magic-trackpad",
    "apple-35w-dual-usb-c-port-power-adapter",
    "apple-20w-usb-c-power-adapter",
  ],
};

function cleanProductName(name: string): string {
  return name.replace(/\s+/g, " ").trim();
}

function isUsableNavProduct(product: Product): boolean {
  if (!product || product.archived) return false;
  const name = cleanProductName(product.name || "");
  if (!name || name.length < 3) return false;
  if (GENERIC_PLACEHOLDER_SLUGS.has((product.slug || "").toLowerCase())) return false;
  return true;
}

function resolveCanonicalProductRoute(product: Product, family?: ProductFamilyKey): string {
  if (product.slug === "mac-mini") return "/mac-mini";
  if (product.slug === "mac-studio") return "/mac-studio";
  if (isOthersProduct(product)) return `/product/${product.slug}`;
  const resolvedFamily =
    family ||
    (["iphone", "mac", "ipad", "watch", "airpods", "accessories"] as ProductFamilyKey[]).find(
      (f) => familyMatchesProduct(product, f)
    ) ||
    "accessories";
  return productBuyPath(resolvedFamily, product.slug);
}

function isAccessoryItem(product: Product): boolean {
  const cat = (product.category || "").toLowerCase();
  const sub = (product.subcategory || "").toLowerCase();
  const name = (product.name || "").toLowerCase();
  return (
    cat === "accessories" ||
    sub.includes("accessory") ||
    name.includes("case") ||
    name.includes("charger") ||
    name.includes("cable") ||
    name.includes("adapter") ||
    name.includes("band") ||
    name.includes("pencil") ||
    name.includes("magic keyboard") ||
    name.includes("magic mouse") ||
    name.includes("magic trackpad")
  );
}

/**
 * Picks up to `limit` real active products for a device family, prioritizing:
 * 1) Distinct new/non-baseline products added to the catalogue (so newly added models appear automatically),
 * 2) Flagship models in `PRIORITY_SLUGS_BY_FAMILY`,
 * 3) Remaining active catalog products sorted by featured/availability.
 */
function pickFamilyProducts(
  products: Product[],
  family: ProductFamilyKey,
  limit: number,
  options: { excludeAccessories?: boolean } = {}
): DesktopMenuItem[] {
  const prioritySlugs = PRIORITY_SLUGS_BY_FAMILY[family] || [];
  const priorityMap = new Map(prioritySlugs.map((slug, idx) => [slug, idx]));

  const matching = products.filter((product) => {
    if (!isUsableNavProduct(product)) return false;
    if (options.excludeAccessories && isAccessoryItem(product)) return false;
    return familyMatchesProduct(product, family);
  });

  const sorted = [...matching].sort((a, b) => {
    const aPri = priorityMap.has(a.slug) ? priorityMap.get(a.slug)! : 999;
    const bPri = priorityMap.has(b.slug) ? priorityMap.get(b.slug)! : 999;

    // Prioritize curated flagships first; surface newly added featured models cleanly alongside them
    const aScore = aPri !== 999 ? aPri : a.featured ? 5.5 : 999;
    const bScore = bPri !== 999 ? bPri : b.featured ? 5.5 : 999;
    if (aScore !== bScore) return aScore - bScore;

    if (Boolean(a.available) !== Boolean(b.available)) return a.available ? -1 : 1;
    return cleanProductName(a.name).localeCompare(cleanProductName(b.name));
  });

  const seenNames = new Set<string>();
  const picked: DesktopMenuItem[] = [];
  for (const product of sorted) {
    const label = cleanProductName(product.name);
    const key = label.toLowerCase();
    if (seenNames.has(key)) continue;
    seenNames.add(key);
    picked.push({
      label,
      to: resolveCanonicalProductRoute(product, family),
    });
    if (picked.length >= limit) break;
  }
  return picked;
}

function pickRelatedAccessories(
  products: Product[],
  matcher: (p: Product) => boolean,
  limit: number
): DesktopMenuItem[] {
  const matches = products
    .filter((p) => isUsableNavProduct(p) && isAccessoryItem(p) && matcher(p))
    .sort((a, b) => {
      if (Boolean(a.featured) !== Boolean(b.featured)) return a.featured ? -1 : 1;
      return cleanProductName(a.name).localeCompare(cleanProductName(b.name));
    });

  return matches.slice(0, limit).map((p) => ({
    label: cleanProductName(p.name),
    to: resolveCanonicalProductRoute(p, "accessories"),
  }));
}

function deduplicateColumns(columns: DesktopMenuColumn[]): DesktopMenuColumn[] {
  const seenDestinations = new Set<string>();
  const seenLabels = new Set<string>();

  return columns
    .map((col) => {
      const uniqueItems: DesktopMenuItem[] = [];
      for (const item of col.items) {
        const destKey = item.to.trim().toLowerCase();
        const labelKey = item.label.trim().toLowerCase();
        if (!destKey || !labelKey) continue;
        if (seenDestinations.has(destKey) || seenLabels.has(labelKey)) continue;
        seenDestinations.add(destKey);
        seenLabels.add(labelKey);
        uniqueItems.push(item);
      }
      return { ...col, items: uniqueItems };
    })
    .filter((col) => col.items.length > 0);
}

export function buildDesktopMegaMenu(
  categoryId: DesktopNavCategoryId,
  products: Product[]
): DesktopMegaMenuData {
  const activeProducts = products.filter(isUsableNavProduct);

  switch (categoryId) {
    case "store": {
      return {
        categoryId,
        categoryLabel: "Store",
        columns: deduplicateColumns([
          {
            id: "store-shop",
            heading: "Shop",
            variant: "primary",
            items: [
              { label: "Shop All Products", to: "/store" },
              { label: "Featured Products", to: "/shop" },
              { label: "iPhone", to: "/iphone" },
              { label: "Mac", to: "/mac" },
              { label: "iPad", to: "/ipad" },
              { label: "Watch", to: "/watch" },
              { label: "AirPods", to: "/airpods" },
              { label: "Accessories", to: "/accessories" },
              { label: "Others & Marketplace", to: "/others" },
            ],
          },
          {
            id: "store-quick-links",
            heading: "Quick Links",
            variant: "secondary",
            items: [
              { label: "Special Offers", to: "/offers" },
              { label: "Trade In & Upgrade", to: "/sell-or-trade" },
              { label: "Installment Plans", to: "/installment" },
              { label: "Pre-Order & Device Request", to: "/pre-order" },
              { label: "Gift Cards", to: "/gift-cards" },
              { label: "Refer a Friend", to: "/refer-a-friend" },
            ],
          },
          {
            id: "store-ways",
            heading: "Shop with Buy & Sell GH",
            variant: "secondary",
            items: [
              { label: "Delivery & Pickup Info", to: "/shopping-information" },
              { label: "Repairs & Diagnostics", to: "/repairs" },
              { label: "Contact Us", to: "/contact" },
              { label: "FAQs", to: "/faq" },
            ],
          },
        ]),
      };
    }

    case "mac": {
      const macModels = pickFamilyProducts(activeProducts, "mac", 6, { excludeAccessories: true });
      const hasMacMini = macModels.some((m) => m.to === "/mac-mini");
      const hasMacStudio = macModels.some((m) => m.to === "/mac-studio");
      const macPrimary: DesktopMenuItem[] = [
        { label: "Explore All Mac", to: "/mac" },
        ...macModels,
        ...(!hasMacMini ? [{ label: "Mac mini", to: "/mac-mini" }] : []),
        ...(!hasMacStudio ? [{ label: "Mac Studio", to: "/mac-studio" }] : []),
      ];

      const macAccessories = pickRelatedAccessories(
        activeProducts,
        (p) => {
          const n = p.name.toLowerCase();
          return (
            n.includes("magic mouse") ||
            n.includes("magic trackpad") ||
            n.includes("magic keyboard with touch") ||
            n.includes("magsafe 3") ||
            n.includes("70w") ||
            n.includes("96w") ||
            n.includes("140w") ||
            n.includes("mac")
          );
        },
        4
      );

      return {
        categoryId,
        categoryLabel: "Mac",
        columns: deduplicateColumns([
          {
            id: "mac-explore",
            heading: "Explore Mac",
            variant: "primary",
            items: macPrimary,
          },
          {
            id: "mac-shop",
            heading: "Shop Mac & Accessories",
            variant: "secondary",
            items: [
              ...macAccessories,
              { label: "All Accessories", to: "/accessories" },
              { label: "Trade In & Upgrade", to: "/sell-or-trade" },
              { label: "Installment Plans", to: "/installment" },
            ],
          },
          {
            id: "mac-more",
            heading: "More from Mac",
            variant: "secondary",
            items: [
              { label: "Learn More MacBook Air", to: "/mac/macbook-air" },
              { label: "Learn More MacBook Pro", to: "/mac/macbook-pro" },
              { label: "Pre-Order & Device Request", to: "/pre-order" },
              { label: "Delivery & Warranty Info", to: "/shopping-information" },
            ],
          },
        ]),
      };
    }

    case "ipad": {
      const ipadModels = pickFamilyProducts(activeProducts, "ipad", 7, { excludeAccessories: true });
      const ipadAccessories = pickRelatedAccessories(
        activeProducts,
        (p) => {
          const n = p.name.toLowerCase();
          const sec = (p.mainWebsiteSection || "").toLowerCase();
          return (
            sec === "ipad" ||
            n.includes("ipad") ||
            n.includes("apple pencil") ||
            n.includes("keyboard folio")
          );
        },
        5
      );

      return {
        categoryId,
        categoryLabel: "iPad",
        columns: deduplicateColumns([
          {
            id: "ipad-explore",
            heading: "Explore iPad",
            variant: "primary",
            items: [{ label: "Explore All iPad", to: "/ipad" }, ...ipadModels],
          },
          {
            id: "ipad-accessories",
            heading: "iPad Accessories",
            variant: "secondary",
            items: [
              ...ipadAccessories,
              { label: "All Accessories", to: "/accessories" },
              { label: "Trade In & Upgrade", to: "/sell-or-trade" },
            ],
          },
          {
            id: "ipad-more",
            heading: "More from iPad",
            variant: "secondary",
            items: [
              { label: "Learn More iPad Pro", to: "/ipad/ipad-pro" },
              { label: "Learn More iPad Air", to: "/ipad/ipad-air" },
              { label: "Installment Plans", to: "/installment" },
              { label: "Delivery & Warranty Info", to: "/shopping-information" },
            ],
          },
        ]),
      };
    }

    case "iphone": {
      const iphoneModels = pickFamilyProducts(activeProducts, "iphone", 7, {
        excludeAccessories: true,
      });
      const iphoneAccessories = pickRelatedAccessories(
        activeProducts,
        (p) => {
          const n = p.name.toLowerCase();
          const sec = (p.mainWebsiteSection || "").toLowerCase();
          return (
            sec === "iphone" ||
            n.includes("iphone") ||
            n.includes("magsafe charger") ||
            n.includes("20w") ||
            n.includes("lightning")
          );
        },
        5
      );

      return {
        categoryId,
        categoryLabel: "iPhone",
        columns: deduplicateColumns([
          {
            id: "iphone-explore",
            heading: "Explore iPhone",
            variant: "primary",
            items: [{ label: "Explore All iPhone", to: "/iphone" }, ...iphoneModels],
          },
          {
            id: "iphone-shop",
            heading: "iPhone Accessories & Deals",
            variant: "secondary",
            items: [
              ...iphoneAccessories,
              { label: "All Accessories", to: "/accessories" },
              { label: "Trade In & Upgrade", to: "/sell-or-trade" },
              { label: "Installment Plans", to: "/installment" },
            ],
          },
          {
            id: "iphone-more",
            heading: "More from iPhone",
            variant: "secondary",
            items: [
              { label: "Learn More iPhone 18 Pro", to: "/iphone/iphone-18-pro" },
              { label: "Learn More iPhone Duo", to: "/iphone/iphone-duo" },
              { label: "Special Offers", to: "/offers" },
              { label: "Delivery & Warranty Info", to: "/shopping-information" },
            ],
          },
        ]),
      };
    }

    case "watch": {
      const watchModels = pickFamilyProducts(activeProducts, "watch", 6, {
        excludeAccessories: true,
      });
      const watchAccessories = pickRelatedAccessories(
        activeProducts,
        (p) => {
          const n = p.name.toLowerCase();
          const sec = (p.mainWebsiteSection || "").toLowerCase();
          return (
            sec === "watch" ||
            n.includes("watch") ||
            n.includes("band") ||
            n.includes("strap") ||
            n.includes("magsafe charger")
          );
        },
        5
      );

      return {
        categoryId,
        categoryLabel: "Watch",
        columns: deduplicateColumns([
          {
            id: "watch-explore",
            heading: "Explore Apple Watch",
            variant: "primary",
            items: [{ label: "Explore All Apple Watch", to: "/watch" }, ...watchModels],
          },
          {
            id: "watch-accessories",
            heading: "Watch Chargers & Accessories",
            variant: "secondary",
            items: [
              ...watchAccessories,
              { label: "All Accessories", to: "/accessories" },
              { label: "Trade In & Upgrade", to: "/sell-or-trade" },
            ],
          },
          {
            id: "watch-more",
            heading: "More from Watch",
            variant: "secondary",
            items: [
              { label: "Learn More Series 12", to: "/watch/apple-watch-series-12" },
              { label: "Learn More Ultra 4", to: "/watch/apple-watch-ultra-4" },
              { label: "Installment Plans", to: "/installment" },
              { label: "Delivery & Warranty Info", to: "/shopping-information" },
            ],
          },
        ]),
      };
    }

    case "airpods": {
      const airpodsModels = pickFamilyProducts(activeProducts, "airpods", 6, {
        excludeAccessories: true,
      });
      const airpodsAccessories = pickRelatedAccessories(
        activeProducts,
        (p) => {
          const n = p.name.toLowerCase();
          return (
            n.includes("airpods") ||
            n.includes("magsafe charger") ||
            n.includes("20w") ||
            n.includes("usb-c charge cable")
          );
        },
        4
      );

      return {
        categoryId,
        categoryLabel: "AirPods",
        columns: deduplicateColumns([
          {
            id: "airpods-explore",
            heading: "Explore AirPods",
            variant: "primary",
            items: [{ label: "Explore All AirPods", to: "/airpods" }, ...airpodsModels],
          },
          {
            id: "airpods-accessories",
            heading: "Charging & Accessories",
            variant: "secondary",
            items: [
              ...airpodsAccessories,
              { label: "All Accessories", to: "/accessories" },
              { label: "Special Offers", to: "/offers" },
            ],
          },
          {
            id: "airpods-more",
            heading: "More from AirPods",
            variant: "secondary",
            items: [
              { label: "Learn More AirPods Pro 3", to: "/airpods/airpods-pro-3" },
              { label: "Learn More AirPods 5", to: "/airpods/airpods-5" },
              { label: "Delivery & Warranty Info", to: "/shopping-information" },
            ],
          },
        ]),
      };
    }

    case "accessories": {
      const featuredAccessories = pickFamilyProducts(activeProducts, "accessories", 7);
      const chargingItems = pickRelatedAccessories(
        activeProducts,
        (p) => {
          const n = p.name.toLowerCase();
          return n.includes("adapter") || n.includes("cable") || n.includes("charger");
        },
        5
      );
      const inputAndCases = pickRelatedAccessories(
        activeProducts,
        (p) => {
          const n = p.name.toLowerCase();
          return (
            n.includes("case") ||
            n.includes("pencil") ||
            n.includes("keyboard") ||
            n.includes("mouse") ||
            n.includes("trackpad")
          );
        },
        5
      );

      return {
        categoryId,
        categoryLabel: "Accessories",
        columns: deduplicateColumns([
          {
            id: "acc-explore",
            heading: "Explore Accessories",
            variant: "primary",
            items: [
              { label: "Explore All Accessories", to: "/accessories" },
              ...featuredAccessories,
            ],
          },
          {
            id: "acc-power",
            heading: "Power & Charging",
            variant: "secondary",
            items: [
              ...chargingItems,
              { label: "Charging & Power Guide", to: "/accessories/apple-magsafe-charger" },
            ],
          },
          {
            id: "acc-addons",
            heading: "Cases, Input & Add-ons",
            variant: "secondary",
            items: [
              ...inputAndCases,
              { label: "Gift Cards", to: "/gift-cards" },
              { label: "Special Offers", to: "/offers" },
            ],
          },
        ]),
      };
    }

    case "others": {
      const othersProducts = activeProducts
        .filter(isOthersProduct)
        .sort((a, b) => {
          if (Boolean(a.featured) !== Boolean(b.featured)) return a.featured ? -1 : 1;
          return cleanProductName(a.name).localeCompare(cleanProductName(b.name));
        })
        .slice(0, 6)
        .map((p) => ({
          label: cleanProductName(p.name),
          to: `/product/${p.slug}`,
        }));

      return {
        categoryId,
        categoryLabel: "Others",
        columns: deduplicateColumns([
          {
            id: "others-explore",
            heading: "Marketplace & Add-ons",
            variant: "primary",
            items: [
              { label: "Explore Others Marketplace", to: "/others" },
              { label: "Mobile Phones & Tablets", to: "/phones-tablets" },
              { label: "Electronics & Consoles", to: "/electronics" },
              ...othersProducts,
            ],
          },
          {
            id: "others-addons",
            heading: "Services & Add-ons",
            variant: "secondary",
            items: [
              { label: "Pre-Order & Device Request", to: "/pre-order" },
              { label: "Gift Cards", to: "/gift-cards" },
              { label: "Special Offers", to: "/offers" },
              { label: "Refer a Friend", to: "/refer-a-friend" },
            ],
          },
          {
            id: "others-shop",
            heading: "More from Buy & Sell GH",
            variant: "secondary",
            items: [
              { label: "Trade In & Upgrade", to: "/sell-or-trade" },
              { label: "Installment Plans", to: "/installment" },
              { label: "Delivery & Pickup Info", to: "/shopping-information" },
            ],
          },
        ]),
      };
    }

    case "support":
    default: {
      return {
        categoryId: "support",
        categoryLabel: "Support",
        columns: deduplicateColumns([
          {
            id: "support-help",
            heading: "Get Help",
            variant: "primary",
            items: [
              { label: "Contact Us", to: "/contact" },
              { label: "FAQs", to: "/faq" },
              { label: "Delivery & Pickup Info", to: "/shopping-information" },
              { label: "Repairs & Diagnostics", to: "/repairs" },
            ],
          },
          {
            id: "support-services",
            heading: "Order & Device Support",
            variant: "secondary",
            items: [
              { label: "Trade In & Upgrade", to: "/sell-or-trade" },
              { label: "Installment Plans", to: "/installment" },
              { label: "Pre-Order & Device Request", to: "/pre-order" },
              { label: "Special Offers", to: "/offers" },
            ],
          },
          {
            id: "support-about",
            heading: "Buy & Sell GH",
            variant: "secondary",
            items: [
              { label: "About Buy & Sell GH", to: "/about" },
              { label: "Gift Cards", to: "/gift-cards" },
              { label: "Refer a Friend", to: "/refer-a-friend" },
              { label: "Shop All Products", to: "/store" },
            ],
          },
        ]),
      };
    }
  }
}
