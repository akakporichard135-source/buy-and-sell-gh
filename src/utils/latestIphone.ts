import type { Product } from "../types/product";
import { resolveProductImage } from "./productImages";

export type LatestIphoneLineup = {
  generationNumber: number | null;
  generationLabel: string;
  featuredName: string;
  variants: Product[];
  image: string;
  galleryImages: { src: string; alt: string }[];
  imageAlt: string;
  learnMoreTo: string;
};

export function getLatestIphoneLineup(products: Product[], safeFallbackImage: string): LatestIphoneLineup {
  const ranked = products
    .map((product) => ({ product, generationNumber: getIphoneGenerationNumber(product) }))
    .filter((entry): entry is { product: Product; generationNumber: number } => entry.generationNumber !== null);
  const generationNumber = ranked.length ? Math.max(...ranked.map((entry) => entry.generationNumber)) : null;
  const generationLabel = generationNumber ? `iPhone ${generationNumber}` : "iPhone";
  const variants = generationNumber
    ? ranked
      .filter((entry) => entry.generationNumber === generationNumber)
      .map((entry) => entry.product)
      .sort(compareIphoneVariants)
    : [];
  const featuredProduct = variants[0];
  const galleryImages = getLatestIphoneGalleryImages(variants);

  return {
    generationNumber,
    generationLabel,
    featuredName: featuredProduct?.name ?? generationLabel,
    variants,
    image: galleryImages[0]?.src ?? safeFallbackImage,
    galleryImages,
    imageAlt: featuredProduct
      ? `${generationLabel} lineup led by ${featuredProduct.name}`
      : "Premium iPhone lineup artwork for Buy & Sell GH",
    learnMoreTo: generationNumber
      ? `/shop?category=Phones&brand=Apple&generation=${encodeURIComponent(generationLabel)}`
      : "/iphones",
  };
}

export function getIphoneGenerationNumber(product: Product) {
  if (product.brand.toLowerCase() !== "apple" || product.category.toLowerCase() !== "iphones") return null;
  const searchable = [product.generation, product.name, product.model, product.slug].filter(Boolean).join(" ");
  const match = searchable.match(/\biPhone[\s-]*(\d{1,3})\b/i);
  return match ? Number(match[1]) : null;
}

function getLatestIphoneGalleryImages(variants: Product[]) {
  const uniqueImages = new Map<string, { src: string; alt: string }>();

  variants.forEach((product) => {
    const image = resolveProductImage(product);
    if (image && !uniqueImages.has(image.src)) {
      uniqueImages.set(image.src, { src: image.src, alt: image.alt || product.name });
    }
  });

  return [...uniqueImages.values()].slice(0, 4);
}

function compareIphoneVariants(a: Product, b: Product) {
  const rankDifference = iphoneVariantRank(b) - iphoneVariantRank(a);
  return rankDifference || a.name.localeCompare(b.name);
}

function iphoneVariantRank(product: Product) {
  const searchable = `${product.name} ${product.model} ${product.slug}`.toLowerCase();
  if (searchable.includes("pro-max") || searchable.includes("pro max")) return 5;
  if (searchable.includes("pro")) return 4;
  if (searchable.includes("plus")) return 3;
  if (searchable.includes("air")) return 2;
  return 1;
}
