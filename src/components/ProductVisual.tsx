import { ImageOff } from "lucide-react";
import type { Product } from "../types/product";
import { requiresRealProductPhotos, resolveProductImage } from "../utils/productImages";

export function ProductVisual({ product, size = "card", priority = false }: { product: Product; size?: "card" | "large"; priority?: boolean }) {
  const image = resolveProductImage(product);
  if (image) {
    return (
      <div
        className={`product-visual product-image-frame relative grid min-w-0 overflow-hidden rounded-2xl bg-gradient-to-br ${product.imageTone} ${
          size === "large" ? "min-h-[360px]" : "min-h-[230px]"
        } place-items-center`}
      >
        <img
          src={image.src}
          alt={image.alt}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          className="product-render-image"
        />
      </div>
    );
  }

  if (requiresRealProductPhotos(product)) {
    return (
      <div
        className={`product-visual product-photo-placeholder relative grid min-w-0 overflow-hidden rounded-2xl ${
          size === "large" ? "min-h-[360px]" : "min-h-[230px]"
        } place-items-center`}
        role="img"
        aria-label={`Real photos of ${product.name} are coming soon`}
      >
        <span><ImageOff size={28} /> Real photos coming soon</span>
      </div>
    );
  }

  const isAirPods = product.category === "AirPods";
  const isWatch = product.category === "Apple Watches";
  const isTablet = product.category === "iPads" || product.category === "MacBooks";
  const modelClass = getDeviceClass(product.slug);

  return (
    <div
      className={`product-visual relative grid min-w-0 overflow-hidden rounded-2xl bg-gradient-to-br ${product.imageTone} ${
        size === "large" ? "min-h-[360px]" : "min-h-[230px]"
      } place-items-center`}
      role="img"
      aria-label={`${product.name} product visual`}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_28%_18%,rgba(255,255,255,.9),transparent_24%),radial-gradient(circle_at_82%_74%,rgba(214,160,37,.28),transparent_30%)]" />
      {isAirPods ? (
        <div className="airpods-device">
          <span />
          <span />
          <i />
        </div>
      ) : isWatch ? (
        <div className="watch-device">
          <span />
          <i />
        </div>
      ) : isTablet ? (
        <div className="tablet-device">
          <span />
        </div>
      ) : (
        <div className={`phone-device ${modelClass}`}>
          <span className="dynamic-island" />
          <span className="screen-shine" />
          <span className="camera-stack"><i /><i /><i /></span>
        </div>
      )}
    </div>
  );
}

function getDeviceClass(slug: string) {
  if (slug.includes("16-pro-max")) return "phone-16-pro-max";
  if (slug.includes("16-pro")) return "phone-16-pro";
  if (slug.includes("15-pro-max")) return "phone-15-pro-max";
  if (slug.includes("iphone-15")) return "phone-15";
  if (slug.includes("14-pro-max")) return "phone-14-pro-max";
  if (slug.includes("13-pro-max")) return "phone-13-pro-max";
  if (slug.includes("12-pro-max")) return "phone-12-pro-max";
  if (slug.includes("11-pro-max")) return "phone-11-pro-max";
  return "phone-default";
}
