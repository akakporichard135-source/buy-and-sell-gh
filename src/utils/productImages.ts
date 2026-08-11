import airpodsProPremium from "../assets/products/airpods-pro-premium.webp";
import appleWatchPremium from "../assets/products/apple-watch-premium.webp";
import appleWatchSe2Premium from "../assets/products/apple-watch-se-2-premium.webp";
import appleWatchSe3Premium from "../assets/products/apple-watch-se-3-premium.webp";
import appleWatchSeries7Premium from "../assets/products/apple-watch-series-7-premium.webp";
import appleWatchSeries8Premium from "../assets/products/apple-watch-series-8-premium.webp";
import appleWatchSeries9Premium from "../assets/products/apple-watch-series-9-premium.webp";
import appleWatchSeries10Premium from "../assets/products/apple-watch-series-10-premium.webp";
import appleWatchSeries11Premium from "../assets/products/apple-watch-series-11-premium.webp";
import appleWatchUltraPremium from "../assets/products/apple-watch-ultra-premium.webp";
import appleWatchUltra2Premium from "../assets/products/apple-watch-ultra-2-premium.webp";
import appleWatchUltra3Premium from "../assets/products/apple-watch-ultra-3-premium.webp";
import ipad10thGenerationPremium from "../assets/products/ipad-10th-generation-premium.webp";
import ipad11thGenerationPremium from "../assets/products/ipad-11th-generation-premium.webp";
import ipadAir5Premium from "../assets/products/ipad-air-5-premium.webp";
import ipadAir11M2Premium from "../assets/products/ipad-air-11-inch-m2-premium.webp";
import ipadAir11M3Premium from "../assets/products/ipad-air-11-inch-m3-premium.webp";
import ipadAir11M4Premium from "../assets/products/ipad-air-11-inch-m4-premium.webp";
import ipadAir13M2Premium from "../assets/products/ipad-air-13-inch-m2-premium.webp";
import ipadAir13M3Premium from "../assets/products/ipad-air-13-inch-m3-premium.webp";
import ipadAir13M4Premium from "../assets/products/ipad-air-13-inch-m4-premium.webp";
import ipadMini6Premium from "../assets/products/ipad-mini-6-premium.webp";
import ipadMini7Premium from "../assets/products/ipad-mini-7-premium.webp";
import ipadPro11M2Premium from "../assets/products/ipad-pro-11-inch-m2-premium.webp";
import ipadPro11M4Premium from "../assets/products/ipad-pro-11-inch-m4-premium.webp";
import ipadPro11M5Premium from "../assets/products/ipad-pro-11-inch-m5-premium.webp";
import ipadPro129M2Premium from "../assets/products/ipad-pro-12-9-inch-m2-premium.webp";
import ipadPro13M4Premium from "../assets/products/ipad-pro-13-inch-m4-premium.webp";
import ipadPro13M5Premium from "../assets/products/ipad-pro-13-inch-m5-premium.webp";
import ipadProPremium from "../assets/products/ipad-pro-premium.webp";
import iphone11ProMaxPremium from "../assets/products/iphone-11-pro-max-premium.webp";
import iphone12MiniPremium from "../assets/products/iphone-12-mini-premium.webp";
import iphone12Premium from "../assets/products/iphone-12-premium.webp";
import iphone12ProPremium from "../assets/products/iphone-12-pro-premium.webp";
import iphone12ProMaxPremium from "../assets/products/iphone-12-pro-max-premium.webp";
import iphone13MiniPremium from "../assets/products/iphone-13-mini-premium.webp";
import iphone13Premium from "../assets/products/iphone-13-premium.webp";
import iphone13ProPremium from "../assets/products/iphone-13-pro-premium.webp";
import iphone13ProMaxPremium from "../assets/products/iphone-13-pro-max-premium.webp";
import iphone14Premium from "../assets/products/iphone-14-premium.webp";
import iphone14PlusPremium from "../assets/products/iphone-14-plus-premium.webp";
import iphone14ProPremium from "../assets/products/iphone-14-pro-premium.webp";
import iphone14ProMaxPremium from "../assets/products/iphone-14-pro-max-premium.webp";
import iphone15Premium from "../assets/products/iphone-15-premium.webp";
import iphone15PlusPremium from "../assets/products/iphone-15-plus-premium.webp";
import iphone15ProPremium from "../assets/products/iphone-15-pro-premium.webp";
import iphone15ProMaxPremium from "../assets/products/iphone-15-pro-max-premium.webp";
import iphone16ePremium from "../assets/products/iphone-16e-premium.webp";
import iphone16Premium from "../assets/products/iphone-16-premium.webp";
import iphone16PlusPremium from "../assets/products/iphone-16-plus-premium.webp";
import iphone16ProPremium from "../assets/products/iphone-16-pro-premium.webp";
import iphone16ProMaxPremium from "../assets/products/iphone-16-pro-max-premium.webp";
import iphone17Premium from "../assets/products/iphone-17-premium.webp";
import iphoneAirPremium from "../assets/products/iphone-air-premium.webp";
import iphone17ProPremium from "../assets/products/iphone-17-pro-premium.webp";
import iphone17ProMaxPremium from "../assets/products/iphone-17-pro-max-premium.webp";
import type { Product, ProductImage } from "../types/product";

const localPremiumImageBySlug: Record<string, string> = {
  "iphone-16-pro-max": iphone16ProMaxPremium,
  "iphone-16-pro": iphone16ProPremium,
  "iphone-16-plus": iphone16PlusPremium,
  "iphone-16": iphone16Premium,
  "iphone-16e": iphone16ePremium,
  "iphone-17-pro-max": iphone17ProMaxPremium,
  "iphone-17-pro": iphone17ProPremium,
  "iphone-air": iphoneAirPremium,
  "iphone-17": iphone17Premium,
  "iphone-15": iphone15Premium,
  "iphone-15-plus": iphone15PlusPremium,
  "iphone-15-pro": iphone15ProPremium,
  "iphone-15-pro-max": iphone15ProMaxPremium,
  "iphone-14": iphone14Premium,
  "iphone-14-plus": iphone14PlusPremium,
  "iphone-14-pro": iphone14ProPremium,
  "iphone-14-pro-max": iphone14ProMaxPremium,
  "iphone-13-mini": iphone13MiniPremium,
  "iphone-13": iphone13Premium,
  "iphone-13-pro": iphone13ProPremium,
  "iphone-13-pro-max": iphone13ProMaxPremium,
  "iphone-12-mini": iphone12MiniPremium,
  "iphone-12": iphone12Premium,
  "iphone-12-pro": iphone12ProPremium,
  "iphone-12-pro-max": iphone12ProMaxPremium,
  "iphone-11-pro-max": iphone11ProMaxPremium,
  "ipad-10th-generation": ipad10thGenerationPremium,
  "ipad-a16": ipad11thGenerationPremium,
  "ipad-mini-6": ipadMini6Premium,
  "ipad-mini-a17-pro": ipadMini7Premium,
  "ipad-air-5": ipadAir5Premium,
  "ipad-air-11-inch-m2": ipadAir11M2Premium,
  "ipad-air-13-inch-m2": ipadAir13M2Premium,
  "ipad-air-11-inch-m3": ipadAir11M3Premium,
  "ipad-air-13-inch-m3": ipadAir13M3Premium,
  "ipad-air-11-inch-m4": ipadAir11M4Premium,
  "ipad-air-13-inch-m4": ipadAir13M4Premium,
  "ipad-pro-11-inch-m2": ipadPro11M2Premium,
  "ipad-pro-12-9-inch-m2": ipadPro129M2Premium,
  "ipad-pro-11-inch-m4": ipadPro11M4Premium,
  "ipad-pro-13-inch-m4": ipadPro13M4Premium,
  "ipad-pro-11-inch-m5": ipadPro11M5Premium,
  "ipad-pro-13-inch-m5": ipadPro13M5Premium,
  "ipad-pro": ipadProPremium,
  "apple-watch-se-2": appleWatchSe2Premium,
  "apple-watch-se-3": appleWatchSe3Premium,
  "apple-watch-series-7": appleWatchSeries7Premium,
  "apple-watch-series-8": appleWatchSeries8Premium,
  "apple-watch-series-9": appleWatchSeries9Premium,
  "apple-watch-series-10": appleWatchSeries10Premium,
  "apple-watch-series-11": appleWatchSeries11Premium,
  "apple-watch-ultra": appleWatchUltraPremium,
  "apple-watch-ultra-2": appleWatchUltra2Premium,
  "apple-watch-ultra-3": appleWatchUltra3Premium,
  "apple-watch": appleWatchPremium,
  "airpods-pro": airpodsProPremium,
};

export function hasLocalPremiumImage(slug: string) {
  return Boolean(localPremiumImageBySlug[slug]);
}

export function isValidProductImage(image?: ProductImage | null): image is ProductImage {
  const src = image?.src?.trim();
  if (!src) return false;
  const lower = src.toLowerCase();
  return lower !== "null" && lower !== "undefined" && lower !== "about:blank" && lower !== "#";
}

export function getLocalPremiumImage(product: Pick<Product, "slug" | "name">): ProductImage | undefined {
  const src = localPremiumImageBySlug[product.slug];
  if (!src) return undefined;
  return {
    src,
    alt: `${product.name} premium product image for Buy & Sell GH`,
  };
}

export function resolveProductGallery(product: Product): ProductImage[] {
  const images = product.images ?? [];
  const primaryIndex = Math.max(0, product.primaryImageIndex ?? 0);
  const primaryImage = images[primaryIndex];
  const validImages = images.filter(isValidProductImage);

  if (isValidProductImage(primaryImage)) {
    return [primaryImage, ...validImages.filter((image) => image.src !== primaryImage.src)];
  }

  if (validImages.length > 0) return validImages;

  const localImage = getLocalPremiumImage(product);
  return localImage ? [localImage] : [];
}

export function resolveProductImage(product: Product): ProductImage | undefined {
  return resolveProductGallery(product)[0];
}
