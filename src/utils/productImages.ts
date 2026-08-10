import airpodsProPremium from "../assets/products/airpods-pro-premium.webp";
import appleWatchPremium from "../assets/products/apple-watch-premium.webp";
import ipadProPremium from "../assets/products/ipad-pro-premium.webp";
import iphone11ProMaxPremium from "../assets/products/iphone-11-pro-max-premium.webp";
import iphone12ProMaxPremium from "../assets/products/iphone-12-pro-max-premium.webp";
import iphone13ProMaxPremium from "../assets/products/iphone-13-pro-max-premium.webp";
import iphone14ProMaxPremium from "../assets/products/iphone-14-pro-max-premium.webp";
import iphone15Premium from "../assets/products/iphone-15-premium.webp";
import iphone15ProMaxPremium from "../assets/products/iphone-15-pro-max-premium.webp";
import iphone16ProPremium from "../assets/products/iphone-16-pro-premium.webp";
import iphone16ProMaxPremium from "../assets/products/iphone-16-pro-max-premium.webp";
import type { Product, ProductImage } from "../types/product";

const localPremiumImageBySlug: Record<string, string> = {
  "iphone-16-pro-max": iphone16ProMaxPremium,
  "iphone-16-pro": iphone16ProPremium,
  "iphone-15": iphone15Premium,
  "iphone-15-pro-max": iphone15ProMaxPremium,
  "iphone-14-pro-max": iphone14ProMaxPremium,
  "iphone-13-pro-max": iphone13ProMaxPremium,
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
