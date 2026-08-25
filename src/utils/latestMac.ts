import type { Product } from "../types/product";
import { getMacbookFamily, getMacbookGeneration } from "./productPresentation";

export type MacbookFamily = "MacBook Air" | "MacBook Pro";

export interface LatestMacLaunch {
  family: MacbookFamily;
  generation: string;
  variants: Product[];
  featuredProduct: Product;
  image: string;
  imageAlt: string;
  galleryImages: { src: string; alt: string }[];
  learnMoreTo: string;
  preorderTo: string;
}

export function getLatestMacLaunch(products: Product[], family: MacbookFamily): LatestMacLaunch | null {
  const familyProducts = products.filter(
    (product) => product.category === "MacBooks" && getMacbookFamily(product) === family,
  );
  const latestGeneration = familyProducts
    .map(getMacbookGeneration)
    .filter(Boolean)
    .sort(compareMacGenerationLabels)[0];

  if (!latestGeneration) return null;

  const variants = familyProducts
    .filter((product) => getMacbookGeneration(product) === latestGeneration)
    .sort((a, b) => compareMacVariants(a, b, family));
  const featuredProduct = variants[0];

  if (!featuredProduct) return null;

  const galleryImages = variants
    .map((product) => {
      const image = getPrimaryProductImage(product);
      return image ? { src: image.src, alt: image.alt || product.name } : null;
    })
    .filter((image): image is { src: string; alt: string } => Boolean(image))
    .filter((image, index, images) => images.findIndex((candidate) => candidate.src === image.src) === index)
    .slice(0, 3);
  const featuredImage = galleryImages[0] ?? getPrimaryProductImage(featuredProduct);

  if (!featuredImage) return null;

  return {
    family,
    generation: latestGeneration,
    variants,
    featuredProduct,
    image: featuredImage.src,
    imageAlt: featuredImage.alt || featuredProduct.name,
    galleryImages,
    learnMoreTo: `/macbooks?family=${encodeURIComponent(family)}&generation=${encodeURIComponent(latestGeneration)}`,
    preorderTo: `/pre-order?category=MacBooks&model=${encodeURIComponent(featuredProduct.name)}`,
  };
}

export function compareMacGenerationLabels(a: string, b: string) {
  return getMacGenerationNumber(b) - getMacGenerationNumber(a) || b.localeCompare(a);
}

function compareMacVariants(a: Product, b: Product, family: MacbookFamily) {
  const aText = `${a.name} ${a.model}`;
  const bText = `${b.name} ${b.model}`;
  const aScore = getMacVariantScore(aText, family);
  const bScore = getMacVariantScore(bText, family);
  return bScore - aScore || a.name.localeCompare(b.name);
}

function getMacVariantScore(value: string, family: MacbookFamily) {
  const size = Number(value.match(/(\d{2})(?:-inch|\s*inch)/i)?.[1] ?? 0);
  const chipTier = /max/i.test(value) ? 30 : /\bpro\b/i.test(value.replace(family, "")) ? 20 : 10;
  return chipTier * 100 + size;
}

function getMacGenerationNumber(value: string) {
  return Number(value.match(/M(\d+)/i)?.[1] ?? -1);
}

function getPrimaryProductImage(product: Product) {
  const primaryIndex = product.primaryImageIndex ?? 0;
  return product.images[primaryIndex] ?? product.images[0] ?? (product.thumbnail ? { src: product.thumbnail, alt: product.name } : null);
}
