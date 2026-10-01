import { Link } from "react-router-dom";
import type { ProductFamilyKey } from "../../../catalog/productExperience";
import type { Product } from "../../../types/product";
import { accessoryProducts } from "../../../data/accessoryProducts";
import { StoreCarousel } from "../StoreCarousel";
import { resolveCatalogueProductImage } from "../../../utils/productImages";
import { ProductImagePlaceholder } from "./ProductImagePlaceholder";
import { formatGhs } from "../../../utils/format";

interface StoreCategoryAccessoriesRailProps {
  family: ProductFamilyKey;
}

export function StoreCategoryAccessoriesRail({ family }: StoreCategoryAccessoriesRailProps) {
  // If we are on the Accessories page itself, we show categorized accessory collections
  if (family === "accessories") {
    const chargingItems = accessoryProducts.filter((p) => p.subcategory === "Charging & Power");
    const cableItems = accessoryProducts.filter((p) => p.subcategory === "Cables");
    const inputItems = accessoryProducts.filter((p) =>
      p.slug.includes("keyboard") || p.slug.includes("mouse") || p.slug.includes("pencil") || p.slug.includes("trackpad")
    );

    return (
      <div className="store-cat-accessories-multi-section">
        {chargingItems.length > 0 && (
          <section className="store-cat-acc-rail-wrap" aria-labelledby="charging-rail-title">
            <div className="store-cat-acc-rail-container">
              <StoreCarousel
                eyebrow="POWER & CHARGING"
                title="Keep your devices charged anywhere."
                subtitle="Genuine Apple USB-C adapters and magnetic wireless chargers. Confirm availability before ordering."
                controlsAriaLabel="Charging accessories carousel"
                trackClassName="store-cat-acc-track"
              >
                {chargingItems.map((item) => (
                  <AccessoryMiniCard key={item.id} product={item} />
                ))}
              </StoreCarousel>
            </div>
          </section>
        )}

        {inputItems.length > 0 && (
          <section className="store-cat-acc-rail-wrap" aria-labelledby="input-rail-title">
            <div className="store-cat-acc-rail-container">
              <StoreCarousel
                eyebrow="INPUT & PRODUCTIVITY"
                title="Precision tools for your Mac and iPad."
                subtitle="Original Apple Magic Keyboards, Magic Mouse, Trackpads, and Apple Pencil Pro."
                controlsAriaLabel="Productivity accessories carousel"
                trackClassName="store-cat-acc-track"
              >
                {inputItems.map((item) => (
                  <AccessoryMiniCard key={item.id} product={item} />
                ))}
              </StoreCarousel>
            </div>
          </section>
        )}

        {cableItems.length > 0 && (
          <section className="store-cat-acc-rail-wrap" aria-labelledby="cables-rail-title">
            <div className="store-cat-acc-rail-container">
              <StoreCarousel
                eyebrow="CABLES & CONNECTIVITY"
                title="Durable braided cables for fast transfer and power."
                subtitle="Apple 60W, 240W braided cables and MagSafe 3 cables."
                controlsAriaLabel="Cables carousel"
                trackClassName="store-cat-acc-track"
              >
                {cableItems.map((item) => (
                  <AccessoryMiniCard key={item.id} product={item} />
                ))}
              </StoreCarousel>
            </div>
          </section>
        )}
      </div>
    );
  }

  // Filter relevant accessories for this device category
  const relevantAccessories = accessoryProducts.filter((product) => {
    const slug = product.slug;
    if (family === "mac") {
      return (
        slug.includes("magic-mouse") ||
        slug.includes("magic-keyboard") ||
        slug.includes("70w") ||
        slug.includes("140w") ||
        slug.includes("240w") ||
        slug.includes("trackpad") ||
        slug.includes("magsafe-3")
      );
    }
    if (family === "iphone") {
      return (
        slug.includes("magsafe-charger") ||
        slug.includes("20w") ||
        slug.includes("magsafe-iphone-case") ||
        slug.includes("clear-iphone-case") ||
        slug.includes("usb-c-charge-cable") ||
        slug.includes("usb-c-to-lightning")
      );
    }
    if (family === "ipad") {
      return (
        slug.includes("pencil") ||
        slug.includes("magic-keyboard-ipad") ||
        slug.includes("magic-keyboard-folio") ||
        slug.includes("30w") ||
        slug.includes("usb-c-charge-cable")
      );
    }
    if (family === "watch") {
      return (
        slug.includes("watch-magnetic-fast-charger") ||
        slug.includes("magsafe-charger") ||
        slug.includes("20w")
      );
    }
    if (family === "airpods") {
      return (
        slug.includes("20w") ||
        slug.includes("magsafe-charger") ||
        slug.includes("usb-c-charge-cable")
      );
    }
    return true;
  });

  if (relevantAccessories.length === 0) return null;

  const titles: Record<ProductFamilyKey, { eyebrow: string; title: string; subtitle: string }> = {
    iphone: {
      eyebrow: "ESSENTIAL ACCESSORIES",
      title: "Complete your iPhone setup.",
      subtitle: "MagSafe chargers, certified 20W power bricks, and genuine protective cases.",
    },
    mac: {
      eyebrow: "MAC ESSENTIALS",
      title: "Power and precision for your Mac.",
      subtitle: "Magic Keyboards, Magic Mouse, high-wattage power adapters, and braided cables.",
    },
    ipad: {
      eyebrow: "CREATIVE TOOLS",
      title: "Take your iPad further.",
      subtitle: "Apple Pencil Pro, Magic Keyboards, and fast USB-C adapters for study and illustration.",
    },
    watch: {
      eyebrow: "WATCH ACCESSORIES",
      title: "Fast magnetic charging on the go.",
      subtitle: "Genuine Apple Watch fast chargers and compact power companions.",
    },
    airpods: {
      eyebrow: "AUDIO ACCESSORIES",
      title: "Reliable power for your listening.",
      subtitle: "Compact power adapters and USB-C cables to keep your AirPods ready to go.",
    },
    accessories: {
      eyebrow: "ACCESSORIES",
      title: "Essential companions.",
      subtitle: "Everyday essentials.",
    },
  };

  const { eyebrow, title, subtitle } = titles[family];

  return (
    <section className="store-cat-acc-rail-wrap" aria-labelledby="category-essentials-title">
      <div className="store-cat-acc-rail-container">
        <StoreCarousel
          eyebrow={eyebrow}
          title={title}
          subtitle={subtitle}
          controlsAriaLabel={`${family} accessories carousel`}
          trackClassName="store-cat-acc-track"
        >
          {relevantAccessories.map((product) => (
            <AccessoryMiniCard key={product.id} product={product} />
          ))}
        </StoreCarousel>
      </div>
    </section>
  );
}

function AccessoryMiniCard({ product }: { product: Product }) {
  const resolvedImg = resolveCatalogueProductImage(product);
  const priceDisplay = product.priceOnRequest || product.price <= 0
    ? "Contact for price"
    : formatGhs(product.price);

  return (
    <article className="store-cat-acc-card">
      <div className="store-cat-acc-card-media">
        {resolvedImg ? (
          <img
            src={resolvedImg.src}
            alt={resolvedImg.alt || product.name}
            loading="lazy"
            decoding="async"
            className="store-cat-acc-card-img"
          />
        ) : (
          <ProductImagePlaceholder />
        )}
      </div>

      <div className="store-cat-acc-card-content">
        <span className="store-cat-acc-card-family">{product.subcategory || "Accessory"}</span>
        <h4 className="store-cat-acc-card-title">{product.name}</h4>
        <span className="store-cat-acc-card-price">{priceDisplay}</span>

        <Link
          to={`/shop/buy-accessory/${product.slug}`}
          className="store-cat-acc-card-btn"
          aria-label={`Buy or enquire ${product.name}`}
        >
          View Options
        </Link>
      </div>
    </article>
  );
}
