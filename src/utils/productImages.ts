import airpodsProPremium from "../assets/products/airpods-pro-premium.webp";
import appleWatchPremium from "../assets/products/apple-watch-premium.webp";
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
  "ipad-pro": ipadProPremium,
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
