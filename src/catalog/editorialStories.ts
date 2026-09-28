import macMiniHero from "../assets/homepage/homepage-mac-mini-white.webp";
import macMiniDetail from "../assets/homepage/homepage-mac-mini-m6-launch.webp";
import macbookAirHero from "../assets/homepage/homepage-macbook-air-m5-cutout.webp";

export type EditorialTone = "light" | "ink" | "blue" | "plum" | "sage";

export type EditorialImage = {
  src: string;
  alt: string;
  fit?: "contain" | "cover";
  position?: string;
};

export type EditorialStory = {
  slug: string;
  name: string;
  eyebrow: string;
  tagline: string;
  buyPath: string;
  buyLabel?: string;
  hero: EditorialImage;
  heroTone: EditorialTone;
  highlights: Array<{ label: string; title: string; image: EditorialImage; tone: EditorialTone }>;
  chapters: Array<{
    id: string;
    label: string;
    title: string;
    copy?: string;
    image: EditorialImage;
    tone: EditorialTone;
    layout: "stage" | "split";
  }>;
  closingLine: string;
  closingImage?: EditorialImage;
};

const campaign = "/products/campaigns";
const homepage = "/products/homepage";

export const editorialStories: Record<string, EditorialStory> = {
  "iphone-18-pro": {
    slug: "iphone-18-pro",
    name: "iPhone 18 Pro",
    eyebrow: "A new perspective on Pro",
    tagline: "Pro further.",
    buyPath: "/shop/buy-iphone/iphone-18-pro",
    hero: { src: `${campaign}/iphone-18-pro-lineup.webp`, alt: "iPhone 18 Pro concept shown in three finishes" },
    heroTone: "ink",
    highlights: [
      { label: "Design", title: "A presence from every angle.", image: { src: `${campaign}/iphone-18-pro-silver.webp`, alt: "Silver iPhone 18 Pro concept, rear view" }, tone: "light" },
      { label: "Camera", title: "Make the moment yours.", image: { src: `${campaign}/iphone-18-pro-coffee.webp`, alt: "Close view of an iPhone 18 Pro concept camera area" }, tone: "plum" },
      { label: "Finishes", title: "A finish that feels like you.", image: { src: `${campaign}/iphone-18-pro-colors.webp`, alt: "iPhone 18 Pro concept finishes" }, tone: "blue" },
      { label: "Experience", title: "Every detail in focus.", image: { src: `${campaign}/iphone-18-pro-front.webp`, alt: "Front view of iPhone 18 Pro concept" }, tone: "ink" },
    ],
    chapters: [
      { id: "design", label: "Design", title: "Considered from every side.", copy: "A distinctive silhouette makes the product the whole story.", image: { src: `${campaign}/iphone-18-pro-silver.webp`, alt: "Silver iPhone 18 Pro concept viewed from behind" }, tone: "light", layout: "split" },
      { id: "camera", label: "Camera", title: "A closer look changes everything.", image: { src: `${campaign}/iphone-18-pro-coffee.webp`, alt: "Close view of the iPhone 18 Pro concept camera design", fit: "cover" }, tone: "ink", layout: "stage" },
      { id: "finishes", label: "Finishes", title: "Find your point of view.", copy: "Explore the look, then confirm the exact model and finish with our team.", image: { src: `${campaign}/iphone-18-pro-colors.webp`, alt: "iPhone 18 Pro concept in several finishes" }, tone: "blue", layout: "split" },
    ],
    closingLine: "Pro further.",
    closingImage: { src: `${campaign}/iphone-18-pro-front.webp`, alt: "iPhone 18 Pro concept front view" },
  },
  "iphone-duo": {
    slug: "iphone-duo",
    name: "iPhone Duo",
    eyebrow: "Room to unfold",
    tagline: "A different way to see more.",
    buyPath: "/shop/buy-iphone/iphone-duo",
    hero: { src: `${campaign}/iphone-duo-open.webp`, alt: "iPhone Duo foldable concept opened wide" },
    heroTone: "light",
    highlights: [
      { label: "The fold", title: "Small moment. Bigger canvas.", image: { src: `${campaign}/iphone-duo-folded.webp`, alt: "Folded iPhone Duo concept" }, tone: "light" },
      { label: "Open", title: "Make space for more.", image: { src: `${campaign}/iphone-duo-open.webp`, alt: "Open iPhone Duo concept" }, tone: "blue" },
      { label: "Profile", title: "The form tells the story.", image: { src: `${campaign}/iphone-duo-side.webp`, alt: "Side profile of an iPhone Duo concept" }, tone: "ink" },
      { label: "Together", title: "Two sides of one idea.", image: { src: `${campaign}/iphone-duo-pair.webp`, alt: "Two iPhone Duo foldable concepts" }, tone: "sage" },
    ],
    chapters: [
      { id: "fold", label: "The fold", title: "Open up the possibilities.", copy: "A compact shape opens into a broad visual canvas.", image: { src: `${campaign}/iphone-duo-open.webp`, alt: "iPhone Duo concept unfolded" }, tone: "blue", layout: "stage" },
      { id: "design", label: "Design", title: "A new angle on everyday.", image: { src: `${campaign}/iphone-duo-side.webp`, alt: "iPhone Duo concept held at its edge" }, tone: "ink", layout: "split" },
      { id: "everyday", label: "Everyday", title: "Made for the way you move.", image: { src: `${homepage}/iphone-duo.webp`, alt: "Open foldable phone held in two hands", fit: "cover" }, tone: "light", layout: "stage" },
    ],
    closingLine: "See what opens up.",
    closingImage: { src: `${campaign}/iphone-duo-pair.webp`, alt: "Pair of iPhone Duo concepts" },
  },
  "apple-watch-series-12": {
    slug: "apple-watch-series-12",
    name: "Apple Watch Series 12",
    eyebrow: "Made for your day",
    tagline: "A little closer to everything.",
    buyPath: "/shop/buy-watch/apple-watch-series-12",
    hero: { src: `${homepage}/watch-series-12.webp`, alt: "Apple Watch Series 12 concept presentation" },
    heroTone: "light",
    highlights: [
      { label: "Design", title: "A look that moves with you.", image: { src: `${campaign}/watch-series-12-product.webp`, alt: "Apple Watch Series 12 concept and band" }, tone: "light" },
      { label: "At a glance", title: "Your day, within reach.", image: { src: `${homepage}/watch-series-12.webp`, alt: "Apple Watch Series 12 concept face" }, tone: "blue" },
      { label: "Everyday", title: "Present for every moment.", image: { src: `${campaign}/watch-generic-product.webp`, alt: "Watch with a light band" }, tone: "sage" },
    ],
    chapters: [
      { id: "design", label: "Design", title: "A personal way to show up.", image: { src: `${campaign}/watch-series-12-product.webp`, alt: "Apple Watch Series 12 concept on a clean background" }, tone: "light", layout: "stage" },
      { id: "everyday", label: "Everyday", title: "Keep your moments close.", copy: "An easy-to-wear form that belongs wherever the day takes you.", image: { src: `${homepage}/watch-series-12.webp`, alt: "Apple Watch Series 12 concept presentation" }, tone: "blue", layout: "split" },
    ],
    closingLine: "Make it your day.",
    closingImage: { src: `${campaign}/watch-generic-product.webp`, alt: "Watch with a light band" },
  },
  "apple-watch-ultra-4": {
    slug: "apple-watch-ultra-4",
    name: "Apple Watch Ultra 4",
    eyebrow: "Go beyond familiar",
    tagline: "For the journey ahead.",
    buyPath: "/shop/buy-watch/apple-watch-ultra-4",
    hero: { src: `${homepage}/watch-ultra-4.webp`, alt: "Apple Watch Ultra 4 concept with orange band" },
    heroTone: "ink",
    highlights: [
      { label: "Design", title: "Bold by nature.", image: { src: `${campaign}/watch-ultra-4-hero.webp`, alt: "Apple Watch Ultra concept close view" }, tone: "ink" },
      { label: "Control", title: "Details you can feel.", image: { src: `${campaign}/watch-ultra-4-interface.webp`, alt: "Apple Watch Ultra concept side and display" }, tone: "light" },
      { label: "Adventure", title: "Take the long way round.", image: { src: `${homepage}/watch-ultra-4.webp`, alt: "Apple Watch Ultra concept with orange band" }, tone: "plum" },
    ],
    chapters: [
      { id: "design", label: "Design", title: "Built to stand out there.", image: { src: `${campaign}/watch-ultra-4-hero.webp`, alt: "Apple Watch Ultra concept shown close up" }, tone: "ink", layout: "stage" },
      { id: "details", label: "Details", title: "Every angle has purpose.", copy: "A distinctive case and controls give the design its unmistakable character.", image: { src: `${campaign}/watch-ultra-4-interface.webp`, alt: "Close view of Apple Watch Ultra concept controls" }, tone: "light", layout: "split" },
    ],
    closingLine: "The next adventure starts here.",
    closingImage: { src: `${homepage}/watch-ultra-4.webp`, alt: "Apple Watch Ultra 4 concept" },
  },
  "airpods-5": {
    slug: "airpods-5",
    name: "AirPods 5",
    eyebrow: "Listen your way",
    tagline: "Take your sound with you.",
    buyPath: "/shop/buy-airpods/airpods-5",
    hero: { src: `${campaign}/airpods-5-product.webp`, alt: "White wireless earbuds in an open charging case" },
    heroTone: "light",
    highlights: [
      { label: "Design", title: "Open. Listen. Go.", image: { src: `${campaign}/airpods-5-product.webp`, alt: "White earbuds in their case" }, tone: "light" },
      { label: "Listening", title: "Your moments, your soundtrack.", image: { src: `${campaign}/airpods-5-lifestyle.webp`, alt: "Wireless earbuds in a lifestyle scene", fit: "cover" }, tone: "blue" },
      { label: "On the move", title: "Easy to take along.", image: { src: `${campaign}/airpods-5-dark.webp`, alt: "Wireless earbud case on a dark background" }, tone: "ink" },
    ],
    chapters: [
      { id: "design", label: "Design", title: "Simple from the first touch.", image: { src: `${campaign}/airpods-5-product.webp`, alt: "Open earbud charging case" }, tone: "light", layout: "stage" },
      { id: "listening", label: "Listening", title: "Make room for the music.", copy: "A listening companion for the places and moments that are yours.", image: { src: `${campaign}/airpods-5-lifestyle.webp`, alt: "Earbuds in an everyday setting", fit: "cover" }, tone: "blue", layout: "split" },
    ],
    closingLine: "Hear your day differently.",
    closingImage: { src: `${campaign}/airpods-5-dark.webp`, alt: "Earbud charging case on a dark stage" },
  },
  "macbook-air": {
    slug: "macbook-air",
    name: "MacBook Air",
    eyebrow: "Ready to go",
    tagline: "Light work. Big ideas.",
    buyPath: "/shop/buy-mac/macbook-air",
    hero: { src: macbookAirHero, alt: "MacBook Air in an open, angled presentation" },
    heroTone: "light",
    highlights: [
      { label: "Portable", title: "Take your workspace anywhere.", image: { src: `${campaign}/macbook-air-floating.webp`, alt: "MacBook Air in a floating view" }, tone: "blue" },
      { label: "Design", title: "Thin looks good from here.", image: { src: `${campaign}/macbook-air-midnight-shell.webp`, alt: "MacBook Air slim profile" }, tone: "ink" },
      { label: "Choice", title: "Find the Air for you.", image: { src: `${campaign}/macbook-air-lineup.webp`, alt: "MacBook Air in several views" }, tone: "light" },
    ],
    chapters: [
      { id: "design", label: "Design", title: "A lighter way to work.", copy: "An open screen, a comfortable keyboard, and a shape that goes where you go.", image: { src: `${campaign}/macbook-air-midnight-shell.webp`, alt: "MacBook Air seen from the side" }, tone: "light", layout: "stage" },
      { id: "workspace", label: "Workspace", title: "Make room for what matters.", image: { src: `${campaign}/macbook-air-floating.webp`, alt: "MacBook Air floating product presentation" }, tone: "blue", layout: "split" },
    ],
    closingLine: "Your next idea can go anywhere.",
    closingImage: { src: `${campaign}/macbook-air-lineup.webp`, alt: "MacBook Air in several views" },
  },
  "mac-mini": {
    slug: "mac-mini",
    name: "Mac mini",
    eyebrow: "A desktop with room to think",
    tagline: "Small on your desk. Big in your day.",
    buyPath: "/pre-order?category=Mac&model=Mac%20mini",
    buyLabel: "Pre-order",
    hero: { src: macMiniDetail, alt: "Silver Mac mini shown from the front" },
    heroTone: "light",
    highlights: [
      { label: "Design", title: "Make more of your space.", image: { src: macMiniDetail, alt: "Compact silver Mac mini" }, tone: "light" },
      { label: "At hand", title: "The details are right there.", image: { src: `${homepage}/mac-mini-device.jpg`, alt: "Mac mini front and port detail" }, tone: "blue" },
      { label: "Workspace", title: "A setup that feels like yours.", image: { src: macMiniDetail, alt: "Mac mini desktop concept" }, tone: "ink" },
    ],
    chapters: [
      { id: "design", label: "Design", title: "A small form with a clear purpose.", copy: "Give the work more room, without giving the computer more desk.", image: { src: macMiniDetail, alt: "Silver Mac mini product view" }, tone: "light", layout: "stage" },
      { id: "details", label: "Details", title: "A closer look at the setup.", image: { src: `${homepage}/mac-mini-device.jpg`, alt: "Mac mini front detail" }, tone: "blue", layout: "split" },
    ],
    closingLine: "Make space for the next thing.",
    closingImage: { src: macMiniHero, alt: "Compact silver Mac mini" },
  },
  "ipad-air": {
    slug: "ipad-air",
    name: "iPad Air",
    eyebrow: "More ways to make it yours",
    tagline: "A canvas for wherever the day goes.",
    buyPath: "/shop/buy-ipad/ipad-air",
    hero: { src: `${campaign}/ipad-air-colors.webp`, alt: "iPad Air concept in several finishes" },
    heroTone: "blue",
    highlights: [
      { label: "Colour", title: "Pick a fresh perspective.", image: { src: `${campaign}/ipad-air-colors.webp`, alt: "iPad Air concept colour range" }, tone: "blue" },
      { label: "Canvas", title: "Give every idea more room.", image: { src: `${campaign}/ipad-air-blue.webp`, alt: "Blue iPad Air concept from front and back" }, tone: "light" },
      { label: "Design", title: "Beautifully simple to carry.", image: { src: `${campaign}/ipad-air-detail.webp`, alt: "Close iPad Air concept enclosure detail" }, tone: "plum" },
      { label: "Your way", title: "Make the moment yours.", image: { src: `${campaign}/ipad-air-space-gray.webp`, alt: "Space gray iPad Air concept" }, tone: "sage" },
    ],
    chapters: [
      { id: "design", label: "Design", title: "A canvas with character.", copy: "A portable form that leaves the focus on whatever you are making.", image: { src: `${campaign}/ipad-air-colors.webp`, alt: "iPad Air concept finish range" }, tone: "blue", layout: "stage" },
      { id: "creativity", label: "Creativity", title: "Start with a blank screen.", image: { src: `${campaign}/ipad-air-blue.webp`, alt: "Blue iPad Air concept screen and rear view" }, tone: "light", layout: "split" },
      { id: "details", label: "Details", title: "The little things make it yours.", image: { src: `${campaign}/ipad-air-detail.webp`, alt: "iPad Air concept camera and finish detail" }, tone: "plum", layout: "split" },
    ],
    closingLine: "Make more of every day.",
    closingImage: { src: `${campaign}/ipad-air-space-gray.webp`, alt: "Space gray iPad Air concept" },
  },
};
