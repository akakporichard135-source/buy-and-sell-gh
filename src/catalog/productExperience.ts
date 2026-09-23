import type { Product } from "../types/product";
import accessoriesHero from "../assets/catalogue-products/apple-magsafe-charger-premium.webp";
import ipadAirHero from "../assets/homepage/homepage-ipad-air-white.webp";
import iphoneFamilyHero from "../assets/homepage/homepage-iphone-17-lineup-light.webp";
import macbookAirHero from "../assets/homepage/homepage-macbook-air-m5-cutout.webp";
import macbookProHero from "../assets/homepage/homepage-macbook-pro-m5-cutout.webp";

export type ProductFamilyKey = "iphone" | "mac" | "ipad" | "watch" | "airpods" | "accessories";

export interface ProductFamilyDefinition {
  key: ProductFamilyKey;
  label: string;
  path: string;
  buySegment: string;
  eyebrow: string;
  title: string;
  description: string;
  heroMedia: string;
  heroAlt: string;
  heroTone: "light" | "dark" | "blue";
  featuredStorySlug: string;
  featuredStoryName: string;
}

export interface StoryHighlight {
  label: string;
  title: string;
  description: string;
  tone: "ink" | "light" | "gold" | "blue";
}

export interface ProductStoryDefinition {
  family: ProductFamilyKey;
  slug: string;
  name: string;
  eyebrow: string;
  tagline: string;
  introduction: string;
  media: { type: "image" | "video"; src: string; alt: string };
  designMedia?: { type: "image"; src: string; alt: string };
  theme: "ink" | "light" | "blue";
  buyPath: string;
  highlights: StoryHighlight[];
  designTitle: string;
  designCopy: string;
  detailGroups: Array<{ title: string; items: string[] }>;
}

export const productFamilies: Record<ProductFamilyKey, ProductFamilyDefinition> = {
  iphone: {
    key: "iphone",
    label: "iPhone",
    path: "/iphone",
    buySegment: "iphone",
    eyebrow: "iPhone",
    title: "Find the iPhone that fits your day.",
    description: "Explore the latest campaign devices and real iPhone inventory available from Buy & Sell GH.",
    heroMedia: iphoneFamilyHero,
    heroAlt: "A lineup of current iPhone models",
    heroTone: "light",
    featuredStorySlug: "iphone-18-pro",
    featuredStoryName: "iPhone 18 Pro",
  },
  mac: {
    key: "mac",
    label: "Mac",
    path: "/mac",
    buySegment: "mac",
    eyebrow: "Mac",
    title: "Serious capability. Beautifully focused.",
    description: "Discover MacBook options for work, study and demanding creative workflows.",
    heroMedia: macbookAirHero,
    heroAlt: "MacBook Air in a clean product presentation",
    heroTone: "blue",
    featuredStorySlug: "macbook-air",
    featuredStoryName: "MacBook Air",
  },
  ipad: {
    key: "ipad",
    label: "iPad",
    path: "/ipad",
    buySegment: "ipad",
    eyebrow: "iPad",
    title: "A flexible canvas for every kind of day.",
    description: "Compare iPad models for study, creativity, entertainment and professional work.",
    heroMedia: ipadAirHero,
    heroAlt: "iPad Air in a layered product presentation",
    heroTone: "light",
    featuredStorySlug: "ipad-air",
    featuredStoryName: "iPad Air",
  },
  watch: {
    key: "watch",
    label: "Watch",
    path: "/watch",
    buySegment: "watch",
    eyebrow: "Apple Watch",
    title: "Move through your day more connected.",
    description: "Explore everyday and rugged Apple Watch options, then confirm the exact model with our team.",
    heroMedia: "/products/homepage/watch-series-12.webp",
    heroAlt: "Apple Watch Series 12 campaign presentation",
    heroTone: "dark",
    featuredStorySlug: "apple-watch-series-12",
    featuredStoryName: "Apple Watch Series 12",
  },
  airpods: {
    key: "airpods",
    label: "AirPods",
    path: "/airpods",
    buySegment: "airpods",
    eyebrow: "AirPods",
    title: "Your sound, wherever the day takes you.",
    description: "Explore wireless listening options and confirm current model availability with Buy & Sell GH.",
    heroMedia: "/products/homepage/airpods-5-lifestyle.webp",
    heroAlt: "A listener wearing a white wireless earbud",
    heroTone: "dark",
    featuredStorySlug: "airpods-5",
    featuredStoryName: "AirPods 5",
  },
  accessories: {
    key: "accessories",
    label: "Accessories",
    path: "/accessories",
    buySegment: "accessory",
    eyebrow: "Accessories",
    title: "The right finishing touch.",
    description: "Browse genuine charging, protection and productivity accessories from the Store catalogue.",
    heroMedia: accessoriesHero,
    heroAlt: "Apple MagSafe charger on a clean white background",
    heroTone: "light",
    featuredStorySlug: "charging-and-power",
    featuredStoryName: "Charging & Power",
  },
};

export const productStories: ProductStoryDefinition[] = [
  {
    family: "iphone",
    slug: "iphone-18-pro",
    name: "iPhone 18 Pro",
    eyebrow: "A new era of Pro",
    tagline: "Built for ambitious ideas and demanding days.",
    introduction: "A flagship iPhone experience with a Pro display, a new generation of Apple silicon and a versatile Pro Fusion camera system.",
    media: { type: "video", src: "/videos/homepage/iphone-18-pro.mp4", alt: "iPhone 18 Pro cinematic product film" },
    designMedia: { type: "image", src: "/products/story/iphone-18-pro-clean-frame.webp", alt: "iPhone 18 Pro shown in a clean horizontal product profile" },
    theme: "ink",
    buyPath: "/shop/buy-iphone/iphone-18-pro",
    highlights: [
      { label: "Display", title: "Made to feel immediate.", description: "The announced Pro lineup pairs Super Retina XDR displays with ProMotion and Always-On technology.", tone: "blue" },
      { label: "Camera", title: "More room to shape the shot.", description: "A three-camera 48MP Pro Fusion system is designed for wide, ultrawide and telephoto perspectives.", tone: "ink" },
      { label: "Performance", title: "Pro power, thoughtfully focused.", description: "A20 Pro brings a new generation of CPU, GPU and neural processing capability.", tone: "gold" },
      { label: "Everyday", title: "A flagship that keeps moving.", description: "Exact storage, finish, price and availability are confirmed by Buy & Sell GH before payment.", tone: "light" },
    ],
    designTitle: "A focused Pro design.",
    designCopy: "The unibody form brings the controls, display and camera system into one confident silhouette. Final finish and size availability are confirmed during enquiry.",
    detailGroups: [
      { title: "Display", items: ["6.3-inch or 6.9-inch Super Retina XDR display", "ProMotion technology", "Always-On display and Dynamic Island"] },
      { title: "Performance", items: ["A20 Pro chip", "6-core CPU and 7-core GPU", "Dual 16-core Neural Engine"] },
      { title: "Camera system", items: ["48MP Pro Fusion Main camera", "48MP Pro Fusion Ultra Wide", "48MP Pro Fusion Telephoto", "18MP Center Stage front camera"] },
      { title: "Buying from Buy & Sell GH", items: ["Available for enquiry", "Price and exact configuration confirmed before payment", "Pickup and delivery details confirmed with the team"] },
    ],
  },
  {
    family: "iphone",
    slug: "iphone-duo",
    name: "iPhone Duo",
    eyebrow: "A new way to unfold",
    tagline: "Open up more room for everything you do.",
    introduction: "A foldable iPhone format presented through the approved Buy & Sell GH campaign. Exact configurations are confirmed during enquiry.",
    media: { type: "image", src: "/products/homepage/iphone-duo.webp", alt: "An open foldable phone held naturally in two hands" },
    theme: "light",
    buyPath: "/shop/buy-iphone/iphone-duo",
    highlights: [
      { label: "Form", title: "Compact when closed. Expansive when open.", description: "A flexible format designed to give everyday tasks more room.", tone: "light" },
      { label: "Experience", title: "One device, two ways to work.", description: "Move from quick interactions to a broader canvas without changing devices.", tone: "blue" },
      { label: "Availability", title: "Configured through enquiry.", description: "Buy & Sell GH confirms exact specifications, pricing and timing before payment.", tone: "ink" },
    ],
    designTitle: "Designed around the fold.",
    designCopy: "The campaign focuses on a device that changes shape without losing the directness of an iPhone experience.",
    detailGroups: [{ title: "Availability", items: ["Pre-order enquiry", "Configuration confirmed by Buy & Sell GH", "No payment requested before availability is reviewed"] }],
  },
  {
    family: "watch",
    slug: "apple-watch-series-12",
    name: "Apple Watch Series 12",
    eyebrow: "Everyday momentum",
    tagline: "Stay connected to what moves you.",
    introduction: "An everyday Apple Watch campaign centered on movement, connection and a glanceable experience.",
    media: { type: "image", src: "/products/homepage/watch-series-12.webp", alt: "Apple Watch Series 12 campaign presentation" },
    theme: "ink",
    buyPath: "/shop/buy-watch/apple-watch-series-12",
    highlights: [
      { label: "Everyday", title: "Important information, close at hand.", description: "A wearable format for notifications, movement and daily routines.", tone: "ink" },
      { label: "Fit", title: "Choose the configuration that works for you.", description: "Case, band, connectivity and availability are confirmed during enquiry.", tone: "light" },
    ],
    designTitle: "Made to live on your wrist.",
    designCopy: "The approved campaign gives the display and case a clean, direct visual focus.",
    detailGroups: [{ title: "Availability", items: ["Available for enquiry", "Exact case and band configuration confirmed before payment", "Current price confirmed by Buy & Sell GH"] }],
  },
  {
    family: "watch",
    slug: "apple-watch-ultra-4",
    name: "Apple Watch Ultra 4",
    eyebrow: "Built for beyond",
    tagline: "Rugged capability. Precision without compromise.",
    introduction: "A larger, adventure-focused Apple Watch campaign with a bold case and high-visibility details.",
    media: { type: "image", src: "/products/homepage/watch-ultra-4.webp", alt: "A rugged titanium smartwatch with an orange band" },
    theme: "ink",
    buyPath: "/shop/buy-watch/apple-watch-ultra-4",
    highlights: [
      { label: "Purpose", title: "Ready for demanding days.", description: "A rugged visual direction for customers who want a larger, more capable watch format.", tone: "gold" },
      { label: "Configuration", title: "Details confirmed one to one.", description: "Buy & Sell GH confirms the exact model, band, connectivity and price before payment.", tone: "ink" },
    ],
    designTitle: "A bold tool-watch silhouette.",
    designCopy: "The campaign balances a substantial case with clear controls and a bright orange action detail.",
    detailGroups: [{ title: "Availability", items: ["Available for enquiry", "Exact model and configuration confirmed before payment", "Pickup or delivery arranged with the team"] }],
  },
  {
    family: "airpods",
    slug: "airpods-5",
    name: "AirPods 5",
    eyebrow: "Move with your music",
    tagline: "Freedom to listen wherever the rhythm takes you.",
    introduction: "A lifestyle-focused AirPods campaign built around effortless wireless listening.",
    media: { type: "image", src: "/products/homepage/airpods-5-lifestyle.webp", alt: "A listener wearing a white wireless earbud" },
    theme: "ink",
    buyPath: "/shop/buy-airpods/airpods-5",
    highlights: [
      { label: "Listening", title: "Sound that travels lightly.", description: "A compact wireless format designed to move naturally through the day.", tone: "ink" },
      { label: "Availability", title: "The right model, clearly confirmed.", description: "Buy & Sell GH confirms the exact model, case and current price before payment.", tone: "light" },
    ],
    designTitle: "Small product. Easy presence.",
    designCopy: "The approved campaign keeps the earbud visible while letting the listening experience lead.",
    detailGroups: [{ title: "Availability", items: ["Available for enquiry", "Exact model and charging case confirmed before payment", "Current price confirmed by Buy & Sell GH"] }],
  },
  {
    family: "mac",
    slug: "macbook-air",
    name: "MacBook Air",
    eyebrow: "Light. Capable. Ready.",
    tagline: "A focused Mac for work, study and everyday creativity.",
    introduction: "Explore the MacBook Air family through real Store configurations and imagery already in the Buy & Sell GH catalogue.",
    media: { type: "image", src: macbookAirHero, alt: "MacBook Air in a clean product presentation" },
    theme: "blue",
    buyPath: "/shop/buy-mac/macbook-air",
    highlights: [
      { label: "Portable", title: "Built to move with the work.", description: "A thin notebook format for flexible desks, classrooms and creative sessions.", tone: "blue" },
      { label: "Catalogue", title: "Choose from real listed configurations.", description: "Chip, memory, storage, condition and availability come directly from Store data.", tone: "light" },
    ],
    designTitle: "A clean, portable workspace.",
    designCopy: "MacBook Air keeps the screen, keyboard and trackpad in a restrained form that works almost anywhere.",
    detailGroups: [{ title: "Before you buy", items: ["Select a real listed model", "Review its stored chip, memory and storage details", "Confirm final availability before payment"] }],
  },
  {
    family: "mac",
    slug: "macbook-pro",
    name: "MacBook Pro",
    eyebrow: "For demanding workflows",
    tagline: "Power for ideas without limits.",
    introduction: "Explore MacBook Pro models for creative, technical and professional work using real Store catalogue information.",
    media: { type: "image", src: macbookProHero, alt: "MacBook Pro in a dark cinematic product presentation" },
    theme: "ink",
    buyPath: "/shop/buy-mac/macbook-pro",
    highlights: [
      { label: "Performance", title: "A platform for bigger projects.", description: "Choose from the chip and memory configurations actually listed in the Store catalogue.", tone: "ink" },
      { label: "Display", title: "A large canvas for precise work.", description: "Review the exact screen size and model details on the selected listing.", tone: "gold" },
    ],
    designTitle: "Built around serious work.",
    designCopy: "A considered notebook design that gives demanding applications room to breathe.",
    detailGroups: [{ title: "Before you buy", items: ["Select a real listed model", "Review stored configuration details", "Confirm final availability before payment"] }],
  },
  {
    family: "ipad",
    slug: "ipad-air",
    name: "iPad Air",
    eyebrow: "Fresh. Powerful. Colourful.",
    tagline: "Made for work, study, creativity and everything in between.",
    introduction: "Explore iPad Air models through real Store listings and approved Buy & Sell GH campaign media.",
    media: { type: "image", src: ipadAirHero, alt: "iPad Air in a layered product presentation" },
    theme: "light",
    buyPath: "/shop/buy-ipad/ipad-air",
    highlights: [
      { label: "Flexible", title: "A canvas that changes with the task.", description: "Move between notes, study, entertainment and creative work in one portable format.", tone: "light" },
      { label: "Catalogue", title: "Choose a real listed iPad Air.", description: "Screen size, generation, storage, finish and availability come from Store data.", tone: "blue" },
    ],
    designTitle: "Light in the hand. Open in possibility.",
    designCopy: "The approved campaign layers the iPad display and finishes into one clean product composition.",
    detailGroups: [{ title: "Before you buy", items: ["Select a real listed model", "Review its stored generation and storage", "Confirm final availability before payment"] }],
  },
  {
    family: "accessories",
    slug: "charging-and-power",
    name: "Charging & Power",
    eyebrow: "Accessories",
    tagline: "Power for the devices you use every day.",
    introduction: "Explore charging accessories through real Buy & Sell GH Store listings, with the exact product, compatibility and availability confirmed before payment.",
    media: { type: "image", src: accessoriesHero, alt: "Apple MagSafe charger on a clean white background" },
    theme: "light",
    buyPath: "/shop/buy-accessory/charging-and-power",
    highlights: [
      { label: "Catalogue", title: "Start with the device you need to charge.", description: "Choose only from chargers, cables and adapters currently published in the Store catalogue.", tone: "light" },
      { label: "Compatibility", title: "The right connection, clearly confirmed.", description: "Compatibility and power details come from the selected listing or are confirmed directly by the team.", tone: "gold" },
      { label: "Support", title: "Ask before you connect.", description: "Buy & Sell GH can help check the intended device and current accessory availability before payment.", tone: "ink" },
    ],
    designTitle: "Useful accessories, simply presented.",
    designCopy: "The Store keeps product photography and compatibility details in focus so it is easier to choose the right charging accessory.",
    detailGroups: [
      { title: "Before you buy", items: ["Select a real Store listing", "Review its stored compatibility and specification details", "Confirm final availability before payment"] },
    ],
  },
];

export function getProductStory(family: ProductFamilyKey, slug: string) {
  return productStories.find((story) => story.family === family && story.slug === slug);
}

export function familyMatchesProduct(product: Product, family: ProductFamilyKey) {
  if (family === "iphone") return product.category === "iPhones";
  if (family === "mac") return product.category === "MacBooks";
  if (family === "ipad") return product.category === "iPads";
  if (family === "watch") return product.category === "Apple Watches";
  if (family === "airpods") return product.category === "AirPods";
  return product.category === "Accessories";
}

export function productStoryPath(family: ProductFamilyKey, slug: string) {
  return `${productFamilies[family].path}/${slug}`;
}

export function productBuyPath(family: ProductFamilyKey, slug: string) {
  return `/shop/buy-${productFamilies[family].buySegment}/${slug}`;
}
