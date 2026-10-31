import { Link } from "react-router-dom";
import { useCms } from "../../cms/CmsContext";
import { defaultMainStoreConfig } from "../../cms/defaultCmsData";
import type { MainStoreConfig, MainStorePromoCard, StorePageSection } from "../../cms/types";
import { productBuyPath, productStoryPath, type ProductFamilyKey } from "../../catalog/productExperience";
import { getPublicPurchaseAction } from "../../catalog/productPurchaseAction";
import { whatsappUrl } from "../../utils/whatsapp";
import { newMacLaunches } from "../../data/newMacLaunches";
import type { Product } from "../../types/product";
import { resolveCatalogueProductImage } from "../../utils/productImages";
import macMiniImage from "../../assets/homepage/homepage-mac-mini-white.webp";
import { StoreCarousel } from "./StoreCarousel";

interface FeaturedProduct {
  id: string;
  theme: "dark" | "light";
  eyebrow: string;
  name: string;
  statement: string;
  image: string;
  alt: string;
  learnMorePath: string;
  actionPath: string;
  actionLabel: string;
}

function resolveCardImage(card: MainStorePromoCard, products: Product[]): { src: string; alt: string } {
  // If the admin has configured an image in CMS, use it directly
  if (card.image && card.image.trim() !== "") {
    return {
      src: card.image,
      alt: card.alt || card.name,
    };
  }

  // Fallback defaults for special hardware
  if (card.id === "mac-mini") {
    return {
      src: macMiniImage,
      alt: card.alt || "Silver Mac mini desktop",
    };
  }

  if (card.id === "mac-studio") {
    return {
      src: newMacLaunches["mac-studio"].image,
      alt: newMacLaunches["mac-studio"].imageAlt || card.alt || "Mac Studio desktop powerhouse",
    };
  }

  // Look up catalog product image
  const product = products.find((item) => item.slug === card.id);
  if (product) {
    const catalogImg = resolveCatalogueProductImage(product);
    if (catalogImg?.src) {
      return {
        src: catalogImg.src,
        alt: catalogImg.alt || card.alt || product.name,
      };
    }
  }

  return {
    src: card.image || "",
    alt: card.alt || card.name,
  };
}

function featuredRail({
  products,
  type,
  cards,
  section,
}: {
  products: Product[];
  type: "latest" | "more";
  cards: MainStorePromoCard[];
  section?: StorePageSection;
}) {
  const items: FeaturedProduct[] = cards.map((card) => {
    const product = products.find((item) => item.slug === card.id);
    const resolvedMedia = resolveCardImage(card, products);
    const eyebrow = card.eyebrow || (product ? product.subcategory || product.category : "");
    const name = card.name || (product ? product.name : card.id);
    const statement = card.statement || "";
    const theme = card.theme || "light";
    const action = product ? getPublicPurchaseAction(product) : undefined;
    const actionLabel = action
      ? action === "buy"
        ? "Buy"
        : action === "enquire"
        ? "Enquire on WhatsApp"
        : "View Pricing"
      : card.actionLabel || "View Pricing";

    let learnMorePath = card.learnMorePath;
    let actionPath = card.actionPath;

    if (!learnMorePath && product) {
      learnMorePath = productStoryPath(product.category as ProductFamilyKey, product.slug);
    }
    if (!actionPath && product) {
      actionPath =
        action === "enquire"
          ? whatsappUrl(
              `Hello Buy & Sell GH, I would like to enquire about ${product.name}. Please confirm availability and pricing.`
            )
          : productBuyPath(product.category as ProductFamilyKey, product.slug);
    }

    return {
      id: card.id,
      theme,
      eyebrow,
      name,
      statement,
      image: resolvedMedia.src,
      alt: resolvedMedia.alt,
      learnMorePath: learnMorePath || "#",
      actionPath: actionPath || "#",
      actionLabel,
    };
  });

  const eyebrow = section?.eyebrow !== undefined && section.eyebrow !== ""
    ? section.eyebrow
    : type === "latest" ? "THE LATEST" : "MORE TO LOVE";
  const title = section?.heading?.trim()
    ? section.heading
    : type === "latest" ? "Take a look at what's new." : "Find your new favorites.";
  const subtitle = section?.subtitle?.trim() || undefined;
  const bgStyle = section?.backgroundColor ? { backgroundColor: section.backgroundColor } : undefined;
  const headerRight =
    section?.buttonLabel && section?.buttonDestination ? (
      <Link to={section.buttonDestination} className="store-section-header-link">
        {section.buttonLabel}
      </Link>
    ) : undefined;

  return (
    <section
      className={`store-section store-latest-section store-feature-section-${type}`}
      aria-label={title}
      style={bgStyle}
      data-section-id={section?.id || (type === "latest" ? "section-latest-carousel" : "section-more-to-love")}
    >
      <div className="store-container">
        <StoreCarousel
          eyebrow={eyebrow}
          title={title}
          subtitle={subtitle}
          controlsAriaLabel={type === "latest" ? "The latest products carousel navigation" : "More to love carousel navigation"}
          trackClassName="store-latest-track"
          headerRight={headerRight}
        >
          {items.map((product) => (
            <article key={product.id} className={`store-latest-card store-latest-card-${product.theme}`}>
              <div className="store-latest-card-header">
                <p className="store-latest-card-eyebrow">{product.eyebrow}</p>
                <h3 className="store-latest-card-name">{product.name}</h3>
                <p className="store-latest-card-statement">{product.statement}</p>
              </div>
              <Link to={product.learnMorePath} className="store-latest-card-media" aria-label={`Learn more about ${product.name}`}>
                {product.image ? (
                  <img key={product.image} src={product.image} alt={product.alt} loading="lazy" decoding="async" className="store-latest-card-img" />
                ) : (
                  <span className="store-feature-image-pending">Image coming soon</span>
                )}
              </Link>
              <div className="store-latest-card-actions">
                <Link to={product.learnMorePath} className="btn-store-secondary" aria-label={`Learn more about ${product.name}`}>Learn more</Link>
                {product.actionPath.startsWith("http") ? (
                  <a
                    href={product.actionPath}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-store-primary"
                    aria-label={`${product.actionLabel} for ${product.name}`}
                  >
                    {product.actionLabel}
                  </a>
                ) : (
                  <Link to={product.actionPath} className="btn-store-primary" aria-label={`${product.actionLabel} for ${product.name}`}>{product.actionLabel}</Link>
                )}
              </div>
            </article>
          ))}
        </StoreCarousel>
      </div>
    </section>
  );
}

export function StoreLatestCarousel({
  products,
  section,
  configOverride,
}: {
  products: Product[];
  section?: StorePageSection;
  configOverride?: MainStoreConfig;
}) {
  const { mainStore } = useCms();
  const activeConfig = configOverride || mainStore;
  const cards = activeConfig?.latestCards?.length ? activeConfig.latestCards : defaultMainStoreConfig.latestCards;
  return featuredRail({ products, type: "latest", cards, section });
}

export function StoreMoreToLoveCarousel({
  products,
  section,
  configOverride,
}: {
  products: Product[];
  section?: StorePageSection;
  configOverride?: MainStoreConfig;
}) {
  const { mainStore } = useCms();
  const activeConfig = configOverride || mainStore;
  const cards = activeConfig?.moreToLoveCards?.length ? activeConfig.moreToLoveCards : defaultMainStoreConfig.moreToLoveCards;
  return featuredRail({ products, type: "more", cards, section });
}

