import type { Product } from "../types/product";
import accessoriesHero from "../assets/catalogue-products/apple-magsafe-charger-premium.webp";
import ipadAirHero from "../assets/homepage/homepage-ipad-air-white.webp";
import macbookAirHero from "../assets/homepage/homepage-macbook-air-m5-cutout.webp";
import macbookProHero from "../assets/homepage/homepage-macbook-pro-m5-cutout.webp";
import { campaignAssets } from "./campaignAssets";

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
  media?: { src: string; alt: string; position?: string };
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
  galleryMedia?: Array<{ src: string; alt: string }>;
  colorStory?: {
    title: string;
    copy: string;
    media: { src: string; alt: string };
  };
  campaignStatus?: string;
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
    heroMedia: campaignAssets.iphone18.lineup.src,
    heroAlt: campaignAssets.iphone18.lineup.alt,
    heroTone: "dark",
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
    heroMedia: campaignAssets.ipad.colors.src,
    heroAlt: campaignAssets.ipad.colors.alt,
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
    heroMedia: campaignAssets.airpods.lifestyle.src,
    heroAlt: campaignAssets.airpods.lifestyle.alt,
    heroTone: "blue",
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
    heroMedia: campaignAssets.accessories.chargingStand.src,
    heroAlt: campaignAssets.accessories.chargingStand.alt,
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
    tagline: "Pro further. Built for ambitious ideas and demanding days.",
    introduction: "A flagship iPhone experience featuring glowing PRO titanium design, an expansive ProMotion display, Apple silicon with A20 Pro, and the versatile Pro Fusion camera system.",
    media: { type: "video", src: "/videos/homepage/iphone-18-pro.mp4", alt: "iPhone 18 Pro cinematic product film" },
    designMedia: { type: "image", src: "/products/campaigns/iphone-18-pro-banner.webp", alt: "iPhone 18 Pro cinematic banner with PRO glass letters" },
    galleryMedia: [
      { src: "/products/campaigns/iphone-18-pro-hero.webp", alt: "iPhone 18 Pro PRO stage presentation" },
      { src: "/products/campaigns/iphone-18-pro-banner.webp", alt: "iPhone 18 Pro cinematic banner" },
      campaignAssets.iphone18.lineup,
      campaignAssets.iphone18.coffee,
      campaignAssets.iphone18.front,
      campaignAssets.iphone18.silver,
      campaignAssets.iphone18.colors,
    ],
    colorStory: {
      title: "A campaign study in four finishes.",
      copy: "These finishes appear in supplied concept media. Buy & Sell GH confirms the exact finish that can be sourced before payment.",
      media: campaignAssets.iphone18.colors,
    },
    campaignStatus: "Campaign concept · availability confirmed on request",
    theme: "ink",
    buyPath: "/shop/buy-iphone/iphone-18-pro",
    highlights: [
      { label: "Design", title: "Pro further from every angle.", description: "Iridescent PRO typographic glass staging frames the titanium body and camera island.", tone: "blue", media: { src: "/products/campaigns/iphone-18-pro-hero.webp", alt: "iPhone 18 Pro PRO stage" } },
      { label: "Camera", title: "More room to shape the shot.", description: "A three-camera 48MP Pro Fusion system is designed for wide, ultrawide and telephoto perspectives.", tone: "ink", media: campaignAssets.iphone18.silver },
      { label: "Performance", title: "Pro power, thoughtfully focused.", description: "A20 Pro brings a new generation of CPU, GPU and neural processing capability.", tone: "gold", media: campaignAssets.iphone18.lineup },
      { label: "Everyday", title: "A flagship that keeps moving.", description: "Exact storage, finish, price and availability are confirmed by Buy & Sell GH before payment.", tone: "light", media: campaignAssets.iphone18.coffee },
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
    designMedia: { type: "image", src: campaignAssets.duo.open.src, alt: campaignAssets.duo.open.alt },
    galleryMedia: [
      campaignAssets.duo.open,
      campaignAssets.duo.folded,
      campaignAssets.duo.side,
      campaignAssets.duo.pair,
      { src: "/products/homepage/iphone-duo.webp", alt: "Open foldable phone held naturally in two hands" },
    ],
    campaignStatus: "Campaign concept · availability confirmed on request",
    theme: "light",
    buyPath: "/shop/buy-iphone/iphone-duo",
    highlights: [
      { label: "Form", title: "Compact when closed. Expansive when open.", description: "A flexible format designed to give everyday tasks more room.", tone: "light", media: campaignAssets.duo.folded },
      { label: "Experience", title: "One device, two ways to work.", description: "Move from quick interactions to a broader canvas without changing devices.", tone: "blue", media: campaignAssets.duo.open },
      { label: "Detail", title: "A fold you can see from every angle.", description: "Supplied concept media presents the closed profile and open canvas without claiming final production specifications.", tone: "ink", media: campaignAssets.duo.side },
      { label: "Availability", title: "Configured through enquiry.", description: "Buy & Sell GH confirms exact specifications, pricing and timing before payment.", tone: "ink", media: campaignAssets.duo.pair },
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
    introduction: "Apple Watch Series 12 introduces the all-new S12 chip with Siri AI, advanced biosensors with improved high blood pressure notifications, and significantly extended battery life in the iconic refined form.",
    media: { type: "video", src: "/videos/homepage/watch-series-12.mp4", alt: "Apple Watch Series 12 cinematic showcase" },
    designMedia: { type: "image", src: "/products/campaigns/watch-series-12-product.webp", alt: "Apple Watch Series 12 with new features overview" },
    galleryMedia: [
      { src: "/products/homepage/watch-series-12.webp", alt: "Apple Watch Series 12 campaign presentation" },
      { src: "/products/campaigns/watch-series-12-product.webp", alt: "Apple Watch Series 12 features" },
      campaignAssets.watch.sensor,
      campaignAssets.watch.comparison,
    ],
    campaignStatus: "Campaign concept · availability confirmed on request",
    theme: "ink",
    buyPath: "/shop/buy-watch/apple-watch-series-12",
    highlights: [
      { label: "Intelligence", title: "New S12 chip with Siri AI.", description: "Next-generation Apple silicon delivers real-time conversational intelligence and instant responsiveness right on your wrist.", tone: "blue", media: { src: "/products/campaigns/watch-series-12-product.webp", alt: "Apple Watch Series 12 features" } },
      { label: "Health", title: "New health sensors & BP alerts.", description: "Advanced biosensors deliver improved high blood pressure notifications and continuous cardio-vital monitoring.", tone: "gold", media: campaignAssets.watch.sensor },
      { label: "Fitness", title: "More ways to stay in rhythm.", description: "Custom workout views, training load metrics, and 50m water resistance empower workouts from the track to open water.", tone: "ink", media: campaignAssets.watch.comparison },
      { label: "Battery", title: "Better battery life all day long.", description: "Re-engineered power management delivers extended battery runtimes, ensuring continuous tracking through intensive workouts and sleep.", tone: "light" },
    ],
    designTitle: "Refined slim architecture.",
    designCopy: "The beloved iconic form with rounded sapphire crystal corners designed to sit weightlessly on the wrist all day.",
    detailGroups: [
      { title: "Design & Sizes", items: ["41mm and 45mm case options", "Polished aluminum and lightweight titanium finishes", "Ion-X glass front (aluminum) or sapphire crystal (titanium)"] },
      { title: "Performance & Sensors", items: ["All-new S12 SiP with Siri AI engine", "Improved high blood pressure notification system", "Electrical heart sensor and 3rd-generation optical heart sensor", "Temperature sensing and high-g accelerometer"] },
      { title: "Battery & Charging", items: ["Enhanced all-day battery life", "Fast charging to 80% in approximately 45 minutes", "Magnetic fast charger to USB-C cable included"] },
      { title: "Ordering with Buy & Sell GH", items: ["Available for pre-order and enquiry", "Case size, band type and cellular options confirmed prior to payment", "Pickup and delivery options available throughout Ghana"] },
    ],
  },
  {
    family: "watch",
    slug: "apple-watch-ultra-4",
    name: "Apple Watch Ultra 4",
    eyebrow: "Built for beyond",
    tagline: "Rugged capability. Precision without compromise.",
    introduction: "Engineered for endurance athletes, outdoor adventurers, and ocean explorers. The most capable and rugged Apple Watch ever conceived.",
    media: { type: "video", src: "/videos/homepage/watch-ultra-4.mp4", alt: "Apple Watch Ultra 4 cinematic showcase" },
    designMedia: { type: "image", src: "/products/homepage/watch-ultra-4.webp", alt: "Apple Watch Ultra 4 rugged titanium smartwatch" },
    galleryMedia: [
      { src: "/products/homepage/watch-ultra-4.webp", alt: "Apple Watch Ultra 4 on pure black cinematic stage" },
      campaignAssets.watch.ultraHero,
      campaignAssets.watch.ultraInterface,
    ],
    campaignStatus: "Campaign concept · availability confirmed on request",
    theme: "ink",
    buyPath: "/shop/buy-watch/apple-watch-ultra-4",
    highlights: [
      { label: "Titanium", title: "Aerospace-grade durability.", description: "A 49mm corrosion-resistant titanium case with raised bezel shields the flat sapphire front crystal from edge impacts.", tone: "gold", media: { src: "/products/homepage/watch-ultra-4.webp", alt: "Apple Watch Ultra 4 titanium profile" } },
      { label: "Action Button", title: "Tactile, instant control.", description: "The customizable Action button gives immediate physical access to workouts, compass waypoints, or custom shortcuts.", tone: "ink", media: campaignAssets.watch.ultraInterface },
      { label: "Display", title: "3000 nits peak outdoor brightness.", description: "The largest, brightest Apple Watch display yet, with automatic Night mode and Wayfinder watch face with live compass.", tone: "blue" },
      { label: "Battery", title: "Up to 72 hours of adventure.", description: "Designed for multi-day expeditions with up to 36 hours normal use and up to 72 hours in low-power mode.", tone: "light" },
    ],
    designTitle: "A singular tool-watch form.",
    designCopy: "Every detail was purpose-built for harsh environments, from the knurled Digital Crown to the dual speakers and siren.",
    detailGroups: [
      { title: "Case & Display", items: ["49mm aerospace-grade titanium case", "Flat sapphire crystal display with 3000 nits peak brightness", "Water resistance to 100m; certified to EN13319 with depth gauge"] },
      { title: "Extreme Capability", items: ["Precision dual-frequency GPS (L1 and L5)", "Customizable Action button in international orange", "86-decibel Emergency Siren audible up to 180 meters"] },
      { title: "Endurance & Power", items: ["Up to 36 hours normal battery life", "Up to 72 hours in Low Power Mode", "Fast charging architecture"] },
      { title: "Ordering with Buy & Sell GH", items: ["Available on request / pre-order", "Alpine Loop, Trail Loop, and Ocean Band pairings confirmed directly", "Price and warranty terms verified before payment"] },
    ],
  },
  {
    family: "airpods",
    slug: "airpods-5",
    name: "AirPods 5",
    eyebrow: "Move with your music",
    tagline: "Freedom to listen wherever the rhythm takes you.",
    introduction: "Next-generation acoustic architecture delivering studio-quality sound, personalized spatial audio, and transformative active noise cancellation.",
    media: { type: "image", src: "/products/homepage/airpods-5-lifestyle.webp", alt: "AirPods 5 wireless earbuds presentation" },
    designMedia: { type: "image", src: "/products/homepage/airpods-5-lifestyle.webp", alt: "AirPods 5 in-ear lifestyle and MagSafe charging case" },
    galleryMedia: [
      campaignAssets.airpods.lifestyle,
      campaignAssets.airpods.product,
      campaignAssets.airpods.dark,
      campaignAssets.airpods.cases,
    ],
    campaignStatus: "Campaign concept · availability confirmed on request",
    theme: "ink",
    buyPath: "/shop/buy-airpods/airpods-5",
    highlights: [
      { label: "Lifestyle", title: "Sculpted for effortless movement.", description: "Ergonomically contoured to stay comfortable and secure all day, with the iconic white stem and pocket-sized USB-C case.", tone: "blue", media: { src: "/products/homepage/airpods-5-lifestyle.webp", alt: "AirPods 5 lifestyle presentation" } },
      { label: "Acoustics", title: "Pro-level Active Noise Cancellation.", description: "Up to 2x more noise cancellation than previous generations, with Adaptive Audio and Conversation Awareness.", tone: "light", media: campaignAssets.airpods.product },
      { label: "Battery", title: "Up to 30 hours of continuous sound.", description: "Get up to 6 hours of listening time on a single charge and up to 30 hours total with the compact MagSafe USB-C case.", tone: "gold", media: campaignAssets.airpods.dark },
      { label: "Protection", title: "Crafted for active everyday movement.", description: "IP54 dust, sweat, and water resistance for both earbuds and charging case.", tone: "blue", media: campaignAssets.airpods.cases },
    ],
    designTitle: "Ergonomically tuned contours.",
    designCopy: "A streamlined stem and refined acoustic geometry ensure effortless comfort and secure fit during workouts and travel.",
    detailGroups: [
      { title: "Acoustic Technologies", items: ["Custom high-excursion Apple driver", "Personalized Spatial Audio with dynamic head tracking", "Active Noise Cancellation, Transparency mode, and Adaptive Audio"] },
      { title: "Sensors & Controls", items: ["Dual beamforming microphones and inward-facing mic", "Touch control for volume, track skip, and call answering", "Skin-detect sensor for instant play/pause"] },
      { title: "Charging Case & Battery", items: ["MagSafe charging case with USB-C and built-in speaker for Find My", "Up to 30 hours total listening time with ANC enabled", "5 minutes in the case provides about 1 hour of listening time"] },
      { title: "Ordering with Buy & Sell GH", items: ["Stock and pre-order availability clearly labelled", "Genuine sealed units with verified authenticity", "Express delivery across Accra and nationwide shipping"] },
    ],
  },
  {
    family: "mac",
    slug: "macbook-air",
    name: "MacBook Air",
    eyebrow: "Light. Capable. Ready.",
    tagline: "A focused Mac for work, study and everyday creativity.",
    introduction: "Explore the MacBook Air family through real Store configurations and imagery already in the Buy & Sell GH catalogue.",
    media: { type: "image", src: macbookAirHero, alt: "MacBook Air in a clean product presentation" },
    designMedia: { type: "image", src: campaignAssets.mac.midnight.src, alt: campaignAssets.mac.midnight.alt },
    galleryMedia: [
      { src: macbookAirHero, alt: "MacBook Air in a clean product presentation" },
      campaignAssets.mac.midnight,
      campaignAssets.mac.floating,
      campaignAssets.mac.lineup,
    ],
    theme: "blue",
    buyPath: "/shop/buy-mac/macbook-air",
    highlights: [
      { label: "Portable", title: "Built to move with the work.", description: "A thin notebook format for flexible desks, classrooms and creative sessions.", tone: "blue", media: campaignAssets.mac.floating },
      { label: "Design", title: "Thin from every angle.", description: "The supplied profile view keeps the enclosure and keyboard relationship in focus.", tone: "ink", media: campaignAssets.mac.midnight },
      { label: "Lineup", title: "Choose from real listed configurations.", description: "Chip, memory, storage, condition and availability come directly from Store data.", tone: "light", media: campaignAssets.mac.lineup },
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
    galleryMedia: [{ src: macbookProHero, alt: "MacBook Pro in a dark cinematic product presentation" }],
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
    media: { type: "image", src: campaignAssets.ipad.colors.src, alt: campaignAssets.ipad.colors.alt },
    designMedia: { type: "image", src: campaignAssets.ipad.blue.src, alt: campaignAssets.ipad.blue.alt },
    galleryMedia: [
      campaignAssets.ipad.colors,
      campaignAssets.ipad.blue,
      campaignAssets.ipad.spaceGray,
      campaignAssets.ipad.detail,
      { src: ipadAirHero, alt: "iPad Air in a layered product presentation" },
    ],
    theme: "light",
    buyPath: "/shop/buy-ipad/ipad-air",
    highlights: [
      { label: "Flexible", title: "A canvas that changes with the task.", description: "Move between notes, study, entertainment and creative work in one portable format.", tone: "light", media: campaignAssets.ipad.blue },
      { label: "Finishes", title: "Colour, carefully considered.", description: "Available finish and storage combinations come from the selected Store listing.", tone: "blue", media: campaignAssets.ipad.colors },
      { label: "Design", title: "Every detail serves the canvas.", description: "A close product view gives the slim enclosure and camera area room to breathe.", tone: "ink", media: campaignAssets.ipad.detail },
      { label: "Catalogue", title: "Choose a real listed iPad Air.", description: "Screen size, generation, storage, finish and availability come from Store data.", tone: "gold", media: campaignAssets.ipad.spaceGray },
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
    media: { type: "image", src: campaignAssets.accessories.chargingStand.src, alt: campaignAssets.accessories.chargingStand.alt },
    designMedia: { type: "image", src: campaignAssets.accessories.usbC.src, alt: campaignAssets.accessories.usbC.alt },
    galleryMedia: [
      campaignAssets.accessories.chargingStand,
      campaignAssets.accessories.usbC,
      campaignAssets.accessories.magneticCharger,
      campaignAssets.accessories.colorCables,
      campaignAssets.accessories.macCharger,
      { src: accessoriesHero, alt: "Magnetic charger on a clean white background" },
    ],
    theme: "light",
    buyPath: "/shop/buy-accessory/charging-and-power",
    highlights: [
      { label: "Charging", title: "Start with the device you need to charge.", description: "Choose only from chargers, cables and adapters currently published in the Store catalogue.", tone: "light", media: campaignAssets.accessories.chargingStand },
      { label: "Cables", title: "The right connection, clearly confirmed.", description: "Compatibility and power details come from the selected listing or are confirmed directly by the team.", tone: "blue", media: campaignAssets.accessories.usbC },
      { label: "Magnetic charging", title: "A simpler place to land.", description: "Magnetic charging compatibility is confirmed for the intended device before payment.", tone: "gold", media: campaignAssets.accessories.magneticCharger },
      { label: "Options", title: "Colour where it is useful.", description: "Adapter and cable options are shown as campaign media; the exact listed item is confirmed separately.", tone: "light", media: campaignAssets.accessories.colorCables },
      { label: "Mac", title: "Power for a portable workspace.", description: "Mac charging accessories are matched to the intended notebook and connector before payment.", tone: "ink", media: campaignAssets.accessories.macCharger },
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
