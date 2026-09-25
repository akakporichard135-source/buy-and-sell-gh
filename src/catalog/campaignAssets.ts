import type { ProductFamilyKey } from "./productExperience";
import macbookProCampaignArt from "../assets/homepage/homepage-macbook-pro-cinematic.webp";

export interface CampaignMedia {
  src: string;
  alt: string;
  mobileSrc?: string;
  position?: string;
}

export interface FamilyCampaign {
  eyebrow: string;
  title: string;
  copy: string;
  storyPath: string;
  buyPath: string;
  media: CampaignMedia;
  tone: "light" | "dark" | "blue";
  availability?: string;
}

const root = "/products/campaigns";

export const campaignAssets = {
  iphone18: {
    hero: {
      src: "/products/homepage/iphone-18-pro-hero.webp",
      fallback: `${root}/iphone-18-pro-hero.webp`,
      mobileSrc: "/products/homepage/iphone-18-pro-hero-mobile.webp",
      alt: "iPhone 18 Pro in titanium finish with glowing PRO stage",
    },
    lineup: { src: `${root}/iphone-18-pro-lineup.webp`, alt: "Three iPhone 18 Pro campaign concepts in dark, burgundy and blue" },
    coffee: { src: `${root}/iphone-18-pro-coffee.webp`, alt: "Coffee finish iPhone 18 Pro campaign concept shown in profile" },
    front: { src: `${root}/iphone-18-pro-front.webp`, alt: "Front view of an iPhone 18 Pro campaign concept" },
    silver: { src: `${root}/iphone-18-pro-silver.webp`, alt: "Silver iPhone 18 Pro campaign concept shown from the back" },
    colors: { src: `${root}/iphone-18-pro-colors.webp`, alt: "Four iPhone 18 Pro campaign finish concepts" },
  },
  duo: {
    hero: { src: "/products/homepage/iphone-duo.webp", alt: "An open premium foldable phone held naturally in two hands" },
    folded: { src: `${root}/iphone-duo-folded.webp`, alt: "Folded white iPhone Duo campaign concept" },
    open: { src: `${root}/iphone-duo-open.webp`, alt: "Open iPhone Duo campaign concept with a two-panel display" },
    side: { src: `${root}/iphone-duo-side.webp`, alt: "Slim folded iPhone Duo campaign concept held from the side" },
    pair: { src: `${root}/iphone-duo-pair.webp`, alt: "Black and white foldable phone campaign concepts" },
  },
  watch: {
    series12: { src: "/products/homepage/watch-series-12.webp", fallback: `${root}/watch-series-12-product.webp`, alt: "Apple Watch Series 12 everyday smartwatch presentation" },
    ultraHero: { src: "/products/homepage/watch-ultra-4.webp", fallback: `${root}/watch-ultra-4-hero.webp`, alt: "Apple Watch Ultra 4 rugged titanium smartwatch with orange band" },
    ultraInterface: { src: `${root}/watch-ultra-4-interface.webp`, alt: "Apple Watch Ultra campaign interface presentation" },
    sensor: { src: `${root}/watch-sensor-detail.webp`, alt: "Close product demonstration of watch sensor lights" },
    comparison: { src: `${root}/watch-generic-product.webp`, alt: "White-band Apple Watch product presentation" },
  },
  airpods: {
    lifestyle: { src: "/products/homepage/airpods-5-lifestyle.webp", fallback: `${root}/airpods-5-lifestyle.webp`, alt: "AirPods 5 wireless earbuds presentation" },
    product: { src: `${root}/airpods-5-product.webp`, alt: "White wireless earbuds in an open charging case" },
    dark: { src: `${root}/airpods-5-dark.webp`, alt: "AirPods 5 campaign case on a dark background" },
    cases: { src: `${root}/airpods-cases.webp`, alt: "Wireless earbud cases in several protective colours" },
  },
  ipad: {
    colors: { src: `${root}/ipad-air-colors.webp`, alt: "iPad Air finishes arranged in a fan" },
    blue: { src: `${root}/ipad-air-blue.webp`, alt: "Blue iPad Air shown from the front and back" },
    spaceGray: { src: `${root}/ipad-air-space-gray.webp`, alt: "Space gray iPad Air shown from the front and back" },
    detail: { src: `${root}/ipad-air-detail.webp`, alt: "Close view of the pale pink iPad Air camera and enclosure" },
  },
  mac: {
    midnight: { src: `${root}/macbook-air-midnight-shell.webp`, alt: "Midnight MacBook Air shown in a slim open profile" },
    floating: { src: `${root}/macbook-air-floating.webp`, alt: "Midnight MacBook Air in a floating product presentation" },
    lineup: { src: `${root}/macbook-air-lineup.webp`, alt: "MacBook Air shown from front, side and top" },
  },
  accessories: {
    usbC: { src: `${root}/accessory-usbc-cables.webp`, alt: "Two white braided USB-C cables" },
    chargingStand: { src: `${root}/accessory-belkin-3-in-1.webp`, alt: "Foldable three-device wireless charging stand" },
    magneticCharger: { src: `${root}/accessory-magsafe-puck.webp`, alt: "Magnetic phone charging puck with USB-C connector" },
    colorCables: { src: `${root}/accessory-color-cables.webp`, alt: "Colourful charging adapters and braided cables" },
    macCharger: { src: `${root}/accessory-macbook-charger.webp`, alt: "USB-C power adapter and magnetic Mac charging cable" },
  },
} as const;

export const familyCampaigns: Record<ProductFamilyKey, FamilyCampaign[]> = {
  iphone: [
    {
      eyebrow: "Campaign concept",
      title: "iPhone 18 Pro",
      copy: "A cinematic Pro story, with final finish, configuration and availability confirmed before payment.",
      storyPath: "/iphone/iphone-18-pro",
      buyPath: "/shop/buy-iphone/iphone-18-pro",
      media: campaignAssets.iphone18.coffee,
      tone: "dark",
      availability: "Available on request",
    },
    {
      eyebrow: "Campaign concept",
      title: "iPhone Duo",
      copy: "A foldable format that opens into more room. Exact specifications remain subject to sourcing confirmation.",
      storyPath: "/iphone/iphone-duo",
      buyPath: "/shop/buy-iphone/iphone-duo",
      media: campaignAssets.duo.open,
      tone: "light",
      availability: "Available on request",
    },
  ],
  mac: [
    {
      eyebrow: "MacBook Air",
      title: "Light work. Serious capability.",
      copy: "Explore current MacBook Air configurations from the real Store catalogue.",
      storyPath: "/mac/macbook-air",
      buyPath: "/shop/buy-mac/macbook-air",
      media: campaignAssets.mac.midnight,
      tone: "blue",
    },
    {
      eyebrow: "MacBook Pro",
      title: "Power for ideas without limits.",
      copy: "A focused notebook experience for creative, technical and professional workflows.",
      storyPath: "/mac/macbook-pro",
      buyPath: "/shop/buy-mac/macbook-pro",
      media: { src: macbookProCampaignArt, alt: "MacBook Pro in a dark product presentation" },
      tone: "dark",
    },
  ],
  ipad: [
    {
      eyebrow: "iPad Air",
      title: "A flexible canvas for every day.",
      copy: "Move between study, work, creativity and entertainment in one portable form.",
      storyPath: "/ipad/ipad-air",
      buyPath: "/shop/buy-ipad/ipad-air",
      media: campaignAssets.ipad.blue,
      tone: "blue",
    },
  ],
  watch: [
    {
      eyebrow: "Campaign concept",
      title: "Apple Watch Series 12",
      copy: "An everyday watch story centered on movement, connection and information at a glance.",
      storyPath: "/watch/apple-watch-series-12",
      buyPath: "/shop/buy-watch/apple-watch-series-12",
      media: campaignAssets.watch.series12,
      tone: "light",
      availability: "Available on request",
    },
    {
      eyebrow: "Campaign concept",
      title: "Apple Watch Ultra 4",
      copy: "A larger, adventure-focused watch presentation with bold controls and a rugged silhouette.",
      storyPath: "/watch/apple-watch-ultra-4",
      buyPath: "/shop/buy-watch/apple-watch-ultra-4",
      media: campaignAssets.watch.ultraHero,
      tone: "dark",
      availability: "Available on request",
    },
  ],
  airpods: [
    {
      eyebrow: "Campaign concept",
      title: "AirPods 5",
      copy: "A compact wireless listening story with exact model and charging case confirmed during enquiry.",
      storyPath: "/airpods/airpods-5",
      buyPath: "/shop/buy-airpods/airpods-5",
      media: campaignAssets.airpods.lifestyle,
      tone: "blue",
      availability: "Available on request",
    },
  ],
  accessories: [
    {
      eyebrow: "Charging",
      title: "Power more of your setup.",
      copy: "Explore charging stands, adapters and cables, then confirm compatibility with the team.",
      storyPath: "/accessories/charging-and-power",
      buyPath: "/shop?category=Accessories",
      media: campaignAssets.accessories.chargingStand,
      tone: "dark",
    },
    {
      eyebrow: "Cables and adapters",
      title: "The right connection matters.",
      copy: "Start with your device and connector. Compatibility is confirmed before payment.",
      storyPath: "/accessories/charging-and-power",
      buyPath: "/shop?category=Accessories",
      media: campaignAssets.accessories.usbC,
      tone: "light",
    },
  ],
};
