import { ArrowUpRight, ChevronRight, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import type { MainStoreAccessoryItem, MainStoreEditorialTile } from "../../cms/types";
import {
  getProductFamily,
  productBuyPath,
  productStoryPath,
  type ProductFamilyKey,
} from "../../catalog/productExperience";
import { getPublicPurchaseAction } from "../../catalog/productPurchaseAction";
import type { Product } from "../../types/product";
import { resolveCatalogueProductImage, resolveProductImage } from "../../utils/productImages";
import { getCardPriceDisplay } from "../../utils/productPricing";
import { whatsappUrl } from "../../utils/whatsapp";

export function getSwatchHex(name: string): string {
  const n = name.toLowerCase();
  if (n.includes("space black") || n.includes("jet black") || n.includes("obsidian") || n.includes("midnight") || n.includes("black") || n.includes("graphite")) return "#1f1f22";
  if (n.includes("titanium") && n.includes("desert")) return "#bfa488";
  if (n.includes("titanium") && n.includes("natural")) return "#b8b4ad";
  if (n.includes("titanium")) return "#8e8c87";
  if (n.includes("white") || n.includes("starlight") || n.includes("clear") || n.includes("cloud")) return "#ececef";
  if (n.includes("silver")) return "#cfd1d6";
  if (n.includes("gold") || n.includes("champagne")) return "#d4af37";
  if (n.includes("sky") || n.includes("mist blue")) return "#9ab8dc";
  if (n.includes("blue") || n.includes("ultramarine") || n.includes("deep blue")) return "#335c8d";
  if (n.includes("green") || n.includes("sage") || n.includes("emerald")) return "#53755c";
  if (n.includes("pink") || n.includes("rose") || n.includes("blush")) return "#e2a2b6";
  if (n.includes("burgundy") || n.includes("wine") || n.includes("crimson") || n.includes("red")) return "#7a1d32";
  if (n.includes("orange") || n.includes("cosmic") || n.includes("terracotta")) return "#d96b27";
  if (n.includes("purple") || n.includes("lavender")) return "#8c7ab5";
  if (n.includes("yellow") || n.includes("lemon")) return "#ebd275";
  return "#86868b";
}

export function getAutoProductEyebrow(product: Product): string {
  const name = product.name.toLowerCase();
  if (name.includes("power adapter") || name.includes("adapter")) return "Power & Charging";
  if (name.includes("cable") || name.includes("cord")) return "Cables & Connectors";
  if (name.includes("magsafe") || name.includes("fast charger")) return "MagSafe Wireless";
  if (name.includes("pencil")) return "Creative Tools";
  if (name.includes("keyboard")) return "Keyboards";
  if (name.includes("mouse") || name.includes("trackpad")) return "Mice & Trackpads";
  if (name.includes("case") || name.includes("cover")) return "Cases & Protection";
  if (product.condition && product.condition !== "To Confirm") return product.condition;
  return product.category || "Original Apple";
}

/**
 * Full-bleed 400×500 vibrant editorial promo tile (Red, Lavender, Split Emerald/Sky,
 * Forest Green, Deep Navy, Warm Peach, Mint Shelves, Gift Cards) matching the screenshots.
 */
export function StoreEditorialPromoTile({ tile }: { tile: MainStoreEditorialTile }) {
  const isDark = tile.theme === "dark";
  const isExternal = /^https?:\/\//i.test(tile.destination || "");
  const cardStyle = tile.backgroundColor ? { backgroundColor: tile.backgroundColor } : undefined;

  const inner = (
    <>
      {tile.image && (
        <img
          src={tile.image}
          alt={tile.alt || tile.title}
          loading="eager"
          decoding="async"
          className="store-editorial-tile-bg"
        />
      )}
      <div className="store-editorial-tile-copy">
        {tile.eyebrow && <p className="store-editorial-tile-eyebrow">{tile.eyebrow}</p>}
        <h3 className="store-editorial-tile-title">{tile.title}</h3>
        {tile.subtitle && <p className="store-editorial-tile-subtitle">{tile.subtitle}</p>}
      </div>
      <span className="store-tile-circle-cta" aria-hidden="true">
        {isExternal ? <ArrowUpRight size={17} strokeWidth={2.2} /> : <ChevronRight size={18} strokeWidth={2.3} />}
      </span>
    </>
  );

  if (isExternal) {
    return (
      <a
        href={tile.destination}
        target="_blank"
        rel="noopener noreferrer"
        className={`store-editorial-tile ${isDark ? "is-dark" : "is-light"}`}
        style={cardStyle}
        aria-label={tile.actionLabel ? `${tile.title} — ${tile.actionLabel}` : tile.title}
      >
        {inner}
      </a>
    );
  }

  return (
    <Link
      to={tile.destination || "/store"}
      className={`store-editorial-tile ${isDark ? "is-dark" : "is-light"}`}
      style={cardStyle}
      aria-label={tile.actionLabel ? `${tile.title} — ${tile.actionLabel}` : tile.title}
    >
      {inner}
    </Link>
  );
}

/**
 * Crisp 313×500 white studio product card matching the uploaded reference screenshots:
 * centered hardware cutout, centered color dots, warm amber violator, bold title,
 * bottom-left live Supabase GH₵ price, and bottom-right circular > purchasing button.
 */
export function StoreWhiteProductTile({
  item,
  product,
}: {
  item: MainStoreAccessoryItem;
  product: Product;
}) {
  const family: ProductFamilyKey = item.family || getProductFamily(product);
  const buyPath = productBuyPath(family, product.slug);
  const detailsPath = productStoryPath(family, product.slug);
  const priceDisplay = getCardPriceDisplay(product);
  const action = getPublicPurchaseAction(product);

  let imageSrc = "";
  let imageAlt = item.alt || product.name;
  if (item.image && item.image.trim() !== "") {
    imageSrc = item.image.trim();
  } else {
    const resolved = resolveCatalogueProductImage(product) || resolveProductImage(product);
    imageSrc = resolved?.src || "";
    imageAlt = resolved?.alt || product.name;
  }

  const displayName = item.name?.trim() || product.name;
  const violator =
    action === "buy"
      ? item.eyebrow?.trim() || "In Stock"
      : item.eyebrow?.trim() || getAutoProductEyebrow(product);

  const colorSwatches = (product.colors ?? []).filter(Boolean).slice(0, 6);
  const isEnquire = action === "enquire";
  const ctaHref = isEnquire
    ? whatsappUrl(
        `Hello Buy & Sell GH, I would like to enquire about ${product.name}. Please confirm availability and pricing.`
      )
    : buyPath;
  const ctaTitle =
    action === "buy"
      ? `Buy ${displayName}`
      : isEnquire
      ? `Enquire about ${displayName} on WhatsApp`
      : `View pricing for ${displayName}`;

  return (
    <article
      className="store-recomm-card"
      data-product-id={product.id}
      data-product-slug={product.slug}
    >
      <Link to={buyPath} className="store-recomm-media" aria-label={`Configure ${displayName}`}>
        {imageSrc ? (
          <img
            src={imageSrc}
            alt={imageAlt}
            loading="eager"
            decoding="sync"
            className="store-recomm-img"
          />
        ) : (
          <div className="store-recomm-placeholder">
            <ShieldCheck size={30} strokeWidth={1.6} />
            <span>Original Hardware</span>
          </div>
        )}
      </Link>

      <div className="store-recomm-swatches" aria-hidden={colorSwatches.length <= 1}>
        {colorSwatches.length > 1 &&
          colorSwatches.map((colorName) => (
            <span
              key={colorName}
              className="store-recomm-swatch-dot"
              style={{ backgroundColor: getSwatchHex(colorName) }}
              title={colorName}
            />
          ))}
      </div>

      <div className="store-recomm-body">
        <p className={`store-recomm-violator ${action === "buy" ? "is-in-stock" : ""}`}>
          {violator}
        </p>
        <h3 className="store-recomm-title">
          <Link to={detailsPath}>{displayName}</Link>
        </h3>
      </div>

      <div className="store-recomm-footer">
        <div className="store-recomm-price-stack">
          <span className={`store-recomm-price ${priceDisplay.isEnquiry ? "is-muted" : ""}`}>
            {priceDisplay.current}
          </span>
          {priceDisplay.previous && (
            <span className="store-recomm-price-old">{priceDisplay.previous}</span>
          )}
        </div>

        {isEnquire ? (
          <a
            href={ctaHref}
            target="_blank"
            rel="noopener noreferrer"
            className="store-recomm-action-btn"
            aria-label={ctaTitle}
            title={ctaTitle}
          >
            <ChevronRight size={17} strokeWidth={2.3} aria-hidden="true" />
          </a>
        ) : (
          <Link
            to={buyPath}
            className="store-recomm-action-btn"
            aria-label={ctaTitle}
            title={ctaTitle}
          >
            <ChevronRight size={17} strokeWidth={2.3} aria-hidden="true" />
          </Link>
        )}
      </div>
    </article>
  );
}

export type MixedShelfEntry =
  | { kind: "editorial"; tile: MainStoreEditorialTile }
  | { kind: "product"; item: MainStoreAccessoryItem; product: Product };

export function buildMixedShelfEntries(
  editorialTiles: MainStoreEditorialTile[],
  productItems: MainStoreAccessoryItem[],
  catalogProducts: Product[]
): MixedShelfEntry[] {
  const resolvedProducts: Array<{ item: MainStoreAccessoryItem; product: Product }> = [];
  for (const item of productItems) {
    const product = catalogProducts.find((p) => p.slug === item.id || p.id === item.id);
    if (product) resolvedProducts.push({ item, product });
  }

  const sortedEditorials = [...editorialTiles].sort(
    (a, b) => (a.position ?? 0) - (b.position ?? 0)
  );

  const result: MixedShelfEntry[] = [];
  const placedEditorialIds = new Set<string>();

  for (let i = 0; i <= resolvedProducts.length; i++) {
    for (const tile of sortedEditorials) {
      if (placedEditorialIds.has(tile.id)) continue;
      const pos = tile.position ?? 0;
      if (pos <= i) {
        result.push({ kind: "editorial", tile });
        placedEditorialIds.add(tile.id);
      }
    }
    if (i < resolvedProducts.length) {
      result.push({
        kind: "product",
        item: resolvedProducts[i].item,
        product: resolvedProducts[i].product,
      });
    }
  }

  for (const tile of sortedEditorials) {
    if (!placedEditorialIds.has(tile.id)) {
      result.push({ kind: "editorial", tile });
    }
  }

  return result;
}
