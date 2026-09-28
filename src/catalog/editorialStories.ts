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

export type EditorialInfoItem = {
  category: string;
  heading: string;
  description: string;
};

export type EditorialInformation = {
  eyebrow?: string;
  title: string;
  intro: string;
  items: EditorialInfoItem[];
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
  information: EditorialInformation;
  closingLine: string;
  closingImage?: EditorialImage;
  closingTone?: EditorialTone;
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
      { label: "Profile", title: "Sculpted titanium silhouette.", image: { src: `${campaign}/iphone-18-pro-coffee.webp`, alt: "Close profile view of an iPhone 18 Pro concept" }, tone: "ink" },
      { label: "Finishes", title: "A finish that feels like you.", image: { src: `${campaign}/iphone-18-pro-colors.webp`, alt: "iPhone 18 Pro concept finishes" }, tone: "light" },
      { label: "Experience", title: "Every detail in focus.", image: { src: `${campaign}/iphone-18-pro-front.webp`, alt: "Front view of iPhone 18 Pro concept" }, tone: "light" },
    ],
    chapters: [
      { id: "design", label: "Design", title: "Considered from every side.", copy: "A distinctive silhouette makes the product the whole story.", image: { src: `${campaign}/iphone-18-pro-silver.webp`, alt: "Silver iPhone 18 Pro concept viewed from behind" }, tone: "light", layout: "split" },
    ],
    information: {
      eyebrow: "EVERYTHING TO KNOW",
      title: "Engineered for ambitious days.",
      intro: "A flagship smartphone designed to combine a durable titanium form, an expansive high-resolution display, and an advanced camera system that brings studio-level versatility into your everyday routine.",
      items: [
        {
          category: "DESIGN",
          heading: "Sculpted with purposeful refinement.",
          description: "A contoured titanium enclosure brings strength, balance, and lightweight comfort to hand, engineered with clean seamless transitions from the tactile buttons to the precision glass back.",
        },
        {
          category: "DISPLAY",
          heading: "Vibrant, expansive, and always ready.",
          description: "The Super Retina XDR display delivers fluid responsiveness, edge-to-edge clarity, and an Always-On glanceable experience whether you are viewing documents under bright daylight or unwinding with media at night.",
        },
        {
          category: "CAMERA",
          heading: "A complete optical studio in your pocket.",
          description: "The multi-lens camera system lets you seamlessly frame wide landscapes, natural portraits, and distant subjects with remarkable detail, rich color accuracy, and effortless low-light capture.",
        },
        {
          category: "PERFORMANCE",
          heading: "Fast, responsive, and effortlessly capable.",
          description: "Built to handle demanding multitasking, high-fidelity gaming, and real-time photo processing with smooth efficiency and all-day power reliability.",
        },
      ],
    },
    closingLine: "Pro further.",
    closingTone: "ink",
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
      { label: "Open", title: "Make space for more.", image: { src: `${campaign}/iphone-duo-open.webp`, alt: "Open iPhone Duo concept" }, tone: "light" },
      { label: "Profile", title: "The form tells the story.", image: { src: `${campaign}/iphone-duo-side.webp`, alt: "Side profile of an iPhone Duo concept" }, tone: "light" },
      { label: "Together", title: "Two sides of one idea.", image: { src: `${campaign}/iphone-duo-pair.webp`, alt: "Two iPhone Duo foldable concepts" }, tone: "ink" },
    ],
    chapters: [
      { id: "fold", label: "The fold", title: "Open up the possibilities.", copy: "A compact shape opens into a broad visual canvas.", image: { src: `${campaign}/iphone-duo-open.webp`, alt: "iPhone Duo concept unfolded" }, tone: "light", layout: "stage" },
      { id: "design", label: "Design", title: "A new angle on everyday.", image: { src: `${campaign}/iphone-duo-side.webp`, alt: "iPhone Duo concept held at its edge" }, tone: "light", layout: "split" },
      { id: "everyday", label: "Everyday", title: "Made for the way you move.", image: { src: `${homepage}/iphone-duo.webp`, alt: "Open foldable phone held in two hands", fit: "cover" }, tone: "light", layout: "stage" },
    ],
    information: {
      eyebrow: "EVERYTHING TO KNOW",
      title: "A new perspective on mobile productivity.",
      intro: "An innovative dual-experience device designed to offer the familiarity of a pocketable phone with the freedom of an expansive unfoldable workspace whenever you need more room.",
      items: [
        {
          category: "THE CANVAS",
          heading: "Compact when closed. Expansive when open.",
          description: "Move seamlessly from quick messages and one-handed pocket use to an immersive wide display designed for reading, side-by-side apps, and creative projects.",
        },
        {
          category: "DESIGN",
          heading: "Precision hinge architecture.",
          description: "Engineered to fold flat with a tactile, confident motion, balanced weight distribution in both folded and unfolded orientations, and durable materials crafted for daily use.",
        },
        {
          category: "MULTITASKING",
          heading: "Two sides of the same workflow.",
          description: "Run two applications simultaneously, review documents while taking notes, or view media with an integrated stand posture without requiring extra accessories.",
        },
        {
          category: "EXPERIENCE",
          heading: "Everyday interactions, expanded.",
          description: "Enjoy intuitive touch gestures, vibrant visual clarity across both inner and outer displays, and a fluid software environment tuned for flexible screen layouts.",
        },
      ],
    },
    closingLine: "See what opens up.",
    closingTone: "ink",
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
      { label: "Design", title: "A look that moves with you.", image: { src: `${homepage}/watch-series-12.webp`, alt: "Apple Watch Series 12 concept and band" }, tone: "light" },
      { label: "At a glance", title: "Your day, within reach.", image: { src: `${campaign}/watch-series-12-angle.webp`, alt: "Apple Watch Series 12 glowing display" }, tone: "light" },
      { label: "Everyday", title: "Present for every moment.", image: { src: `${campaign}/watch-generic-product.webp`, alt: "Watch with a light band" }, tone: "light" },
    ],
    chapters: [
      { id: "design", label: "Design", title: "A personal way to show up.", image: { src: `${campaign}/watch-series-12-angle.webp`, alt: "Apple Watch Series 12 angled profile on clean background" }, tone: "light", layout: "stage" },
      { id: "everyday", label: "Everyday", title: "Keep your moments close.", copy: "An easy-to-wear form that belongs wherever the day takes you.", image: { src: `${homepage}/watch-series-12.webp`, alt: "Apple Watch Series 12 concept presentation" }, tone: "light", layout: "split" },
    ],
    information: {
      eyebrow: "EVERYTHING TO KNOW",
      title: "Essential connection for every part of your day.",
      intro: "A versatile smartwatch designed to keep your schedule, health metrics, and daily communications effortlessly accessible right from your wrist.",
      items: [
        {
          category: "DESIGN",
          heading: "Lightweight, refined, and comfortable all day.",
          description: "Designed with a sleek curved case and smooth crystal front that sits naturally against the wrist, paired with quick-change band options for workouts, office, and evening wear.",
        },
        {
          category: "GLANCEABLE INFO",
          heading: "Important updates at a glance.",
          description: "The bright always-on display delivers incoming messages, reminders, calendar alerts, and navigation prompts without needing to reach for your phone.",
        },
        {
          category: "ACTIVITY & MOVEMENT",
          heading: "Stay motivated and in rhythm.",
          description: "Track daily movement, workouts, and exercise milestones with custom workout views and comprehensive activity metrics that encourage continuous progress.",
        },
        {
          category: "CONVENIENCE",
          heading: "Seamless everyday communication.",
          description: "Take quick calls, respond to texts, trigger smart timers, and stay connected with family and colleagues wherever the day takes you.",
        },
      ],
    },
    closingLine: "Make it your day.",
    closingTone: "ink",
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
      { label: "Control", title: "Details you can feel.", image: { src: `${campaign}/watch-ultra-4-interface.webp`, alt: "Apple Watch Ultra concept side and display", fit: "cover" }, tone: "light" },
      { label: "Adventure", title: "Take the long way round.", image: { src: `${campaign}/watch-ultra-4-orange.webp`, alt: "Apple Watch Ultra concept with orange band", fit: "cover" }, tone: "light" },
    ],
    chapters: [
      { id: "design", label: "Design", title: "Built to stand out there.", image: { src: `${campaign}/watch-ultra-4-hero.webp`, alt: "Apple Watch Ultra concept shown close up" }, tone: "ink", layout: "stage" },
      { id: "details", label: "Details", title: "Every angle has purpose.", copy: "A distinctive case and controls give the design its unmistakable character.", image: { src: `${campaign}/watch-ultra-4-interface.webp`, alt: "Close view of Apple Watch Ultra concept controls", fit: "cover" }, tone: "light", layout: "split" },
    ],
    information: {
      eyebrow: "EVERYTHING TO KNOW",
      title: "Rugged capability for the path ahead.",
      intro: "Built for outdoor enthusiasts, endurance athletes, and adventurers who require durable materials, tactile physical controls, and reliable navigation in challenging environments.",
      items: [
        {
          category: "RUGGED DESIGN",
          heading: "Aerospace-grade titanium enclosure.",
          description: "A raised bezel shields the flat sapphire crystal display against edge impacts, corrosion, and rough terrain while maintaining lightweight wrist comfort.",
        },
        {
          category: "TACTILE CONTROLS",
          heading: "Instant physical responsiveness.",
          description: "The knurled Digital Crown and customizable Action button provide immediate tactile control, easy to operate even while wearing gloves or moving through wet weather.",
        },
        {
          category: "ADVENTURE & NAVIGATION",
          heading: "Engineered for demanding expeditions.",
          description: "High-precision dual-frequency location tracking, dedicated outdoor compass waypoints, and specialized metrics support trail runs, hikes, and ocean activities.",
        },
        {
          category: "ENDURANCE",
          heading: "Power management built for distance.",
          description: "Intelligent power efficiency ensures the watch keeps recording metrics, tracking routes, and providing emergency safety features across long adventures.",
        },
      ],
    },
    closingLine: "The next adventure starts here.",
    closingTone: "ink",
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
      { id: "design", label: "Design", title: "Simple from the first touch.", image: { src: `${homepage}/airpods-5.webp`, alt: "Open earbud charging case" }, tone: "light", layout: "stage" },
      { id: "listening", label: "Listening", title: "Make room for the music.", copy: "A listening companion for the places and moments that are yours.", image: { src: `${campaign}/airpods-5-lifestyle.webp`, alt: "Earbuds in an everyday setting", fit: "cover" }, tone: "blue", layout: "split" },
    ],
    information: {
      eyebrow: "EVERYTHING TO KNOW",
      title: "Effortless sound that moves with you.",
      intro: "Wireless earbuds designed to deliver rich, immersive audio, seamless device switching, and all-day listening comfort in a compact pocket-sized case.",
      items: [
        {
          category: "ACOUSTICS",
          heading: "Rich, detailed sound architecture.",
          description: "Custom-tuned acoustic drivers deliver crisp highs, balanced mid-tones, and deep resonant bass for music, podcasts, and clear phone conversations.",
        },
        {
          category: "COMFORT & FIT",
          heading: "Contoured for all-day wear.",
          description: "An ergonomic shape sits securely and lightly in the ear, providing natural acoustic seal and breathability through workouts, commutes, and long work sessions.",
        },
        {
          category: "PORTABILITY & POWER",
          heading: "Compact charging case with USB-C.",
          description: "Slip the sleek case into any pocket, enjoy extended battery life across multiple recharges, and top up quickly when you need sound on the go.",
        },
        {
          category: "INTUITIVE CONTROLS",
          heading: "Touch and voice at your command.",
          description: "Effortlessly manage playback, answer incoming calls, and interact with your connected devices through intuitive stem touch gestures.",
        },
      ],
    },
    closingLine: "Hear your day differently.",
    closingTone: "ink",
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
      { label: "Portable", title: "Take your workspace anywhere.", image: { src: `${campaign}/macbook-air-floating.webp`, alt: "MacBook Air in a floating view" }, tone: "light" },
      { label: "Design", title: "Thin looks good from here.", image: { src: `${campaign}/macbook-air-midnight-shell.webp`, alt: "MacBook Air slim profile" }, tone: "light" },
      { label: "Choice", title: "Find the Air for you.", image: { src: `${campaign}/macbook-air-lineup.webp`, alt: "MacBook Air in several views" }, tone: "light" },
    ],
    chapters: [
      { id: "design", label: "Design", title: "A lighter way to work.", copy: "An open screen, a comfortable keyboard, and a shape that goes where you go.", image: { src: `${campaign}/macbook-air-midnight-shell.webp`, alt: "MacBook Air seen from the side" }, tone: "light", layout: "stage" },
      { id: "workspace", label: "Workspace", title: "Make room for what matters.", image: { src: `${campaign}/macbook-air-floating.webp`, alt: "MacBook Air floating product presentation" }, tone: "light", layout: "split" },
    ],
    information: {
      eyebrow: "EVERYTHING TO KNOW",
      title: "Thin, light, and ready for serious work.",
      intro: "The quintessential portable laptop, combining a slender aluminum unibody design, an expansive high-resolution display, and silent all-day efficiency for students, creators, and professionals.",
      items: [
        {
          category: "PORTABILITY",
          heading: "Ultra-thin unibody craftsmanship.",
          description: "Incredibly slim and lightweight, MacBook Air slips into any backpack or sleeve, giving you full desktop-class capability wherever you choose to work.",
        },
        {
          category: "DISPLAY & KEYBOARD",
          heading: "Comfortable viewing and effortless typing.",
          description: "The vibrant Liquid Retina display renders text with pin-sharp clarity and rich color accuracy, complemented by the backlit Magic Keyboard and spacious Force Touch trackpad.",
        },
        {
          category: "WORK & CREATIVITY",
          heading: "Quiet, responsive everyday performance.",
          description: "Tackle intensive spreadsheets, photo editing, software development, and everyday video meetings with fluid responsiveness and silent, fanless operation.",
        },
        {
          category: "CONNECTIVITY",
          heading: "Essential modern ports.",
          description: "High-speed USB-C / Thunderbolt ports, MagSafe charging with quick-release safety, and a reliable headphone jack make connecting displays, external drives, and accessories simple.",
        },
      ],
    },
    closingLine: "Your next idea can go anywhere.",
    closingTone: "light",
  },
  "mac-mini": {
    slug: "mac-mini",
    name: "Mac mini",
    eyebrow: "A desktop with room to think",
    tagline: "Small on your desk. Big in your day.",
    buyPath: "/pre-order?category=Mac&model=Mac%20mini",
    buyLabel: "Pre-order",
    hero: { src: macMiniHero, alt: "Silver Mac mini shown from the front" },
    heroTone: "light",
    highlights: [
      { label: "Design", title: "Make more of your space.", image: { src: macMiniHero, alt: "Compact silver Mac mini" }, tone: "light" },
      { label: "At hand", title: "The details are right there.", image: { src: `${homepage}/mac-mini-device.jpg`, alt: "Mac mini front and port detail" }, tone: "light" },
      { label: "Workspace", title: "A setup that feels like yours.", image: { src: macMiniDetail, alt: "Mac mini desktop concept" }, tone: "light" },
    ],
    chapters: [
      { id: "design", label: "Design", title: "A small form with a clear purpose.", copy: "Give the work more room, without giving the computer more desk.", image: { src: macMiniHero, alt: "Silver Mac mini product view" }, tone: "light", layout: "stage" },
      { id: "details", label: "Details", title: "A closer look at the setup.", image: { src: `${homepage}/mac-mini-device.jpg`, alt: "Mac mini front detail" }, tone: "light", layout: "split" },
    ],
    information: {
      eyebrow: "EVERYTHING TO KNOW",
      title: "Compact desktop power that transforms your workspace.",
      intro: "A versatile small-form-factor desktop that fits into any desk arrangement, delivering robust computing power, quiet thermal efficiency, and wide display connectivity.",
      items: [
        {
          category: "COMPACT FORM",
          heading: "Minimal footprint, maximum desk room.",
          description: "An iconic compact square aluminum enclosure that sits unobtrusively under a display or beside your workspace, leaving more room for your creative setup.",
        },
        {
          category: "VERSATILITY",
          heading: "Build your dream desk arrangement.",
          description: "Pair with your preferred monitor, keyboard, mouse, and audio setup to create a tailored workstation for home, studio, or corporate environments.",
        },
        {
          category: "PRODUCTIVITY & CREATIVITY",
          heading: "Handles demanding everyday workloads.",
          description: "Optimized for multi-app multitasking, code compilation, creative photo and video editing, and high-throughput data processing.",
        },
        {
          category: "PORTS & CONNECTIVITY",
          heading: "Versatile high-speed connections.",
          description: "Convenient front and rear ports accommodate fast external storage, multiple high-resolution displays, and high-speed networking with ease.",
        },
      ],
    },
    closingLine: "Make space for the next thing.",
    closingTone: "light",
  },
  "ipad-air": {
    slug: "ipad-air",
    name: "iPad Air",
    eyebrow: "More ways to make it yours",
    tagline: "A canvas for wherever the day goes.",
    buyPath: "/shop/buy-ipad/ipad-air",
    hero: { src: `${campaign}/ipad-air-colors.webp`, alt: "iPad Air concept in several finishes" },
    heroTone: "light",
    highlights: [
      { label: "Colour", title: "Pick a fresh perspective.", image: { src: `${campaign}/ipad-air-colors.webp`, alt: "iPad Air concept colour range" }, tone: "light" },
      { label: "Canvas", title: "Give every idea more room.", image: { src: `${campaign}/ipad-air-blue.webp`, alt: "Blue iPad Air concept from front and back" }, tone: "light" },
      { label: "Design", title: "Beautifully simple to carry.", image: { src: `${campaign}/ipad-air-detail.webp`, alt: "Close iPad Air concept enclosure detail" }, tone: "light" },
      { label: "Your way", title: "Make the moment yours.", image: { src: `${campaign}/ipad-air-space-gray.webp`, alt: "Space gray iPad Air concept" }, tone: "light" },
    ],
    chapters: [
      { id: "design", label: "Design", title: "A canvas with character.", copy: "A portable form that leaves the focus on whatever you are making.", image: { src: `${campaign}/ipad-air-colors.webp`, alt: "iPad Air concept finish range" }, tone: "light", layout: "stage" },
      { id: "creativity", label: "Creativity", title: "Start with a blank screen.", image: { src: `${campaign}/ipad-air-blue.webp`, alt: "Blue iPad Air concept screen and rear view" }, tone: "light", layout: "split" },
      { id: "details", label: "Details", title: "The little things make it yours.", image: { src: `${campaign}/ipad-air-detail.webp`, alt: "iPad Air concept camera and finish detail" }, tone: "light", layout: "split" },
    ],
    information: {
      eyebrow: "EVERYTHING TO KNOW",
      title: "The versatile canvas for ideas, study, and creativity.",
      intro: "A lightweight, powerful tablet engineered to bridge the gap between portable reading, handwritten notes, high-precision drawing, and laptop-style productivity.",
      items: [
        {
          category: "VERSATILITY",
          heading: "From sketchpad to digital notebook.",
          description: "Seamlessly transition between reading documents, taking handwritten notes, sketching creative illustrations, and typing out reports in one portable slab.",
        },
        {
          category: "LIQUID RETINA DISPLAY",
          heading: "Stunning visual immersion.",
          description: "An expansive edge-to-edge display with rich color reproduction, anti-reflective coating, and crisp detail brings books, movies, and designs vividly to life.",
        },
        {
          category: "ACCESSORY INTEGRATION",
          heading: "Pair with Pencil and Keyboard.",
          description: "Transform iPad Air into a precision creative drawing surface or a capable typing workstation with magnetic snap-on accessories and keyboard support.",
        },
        {
          category: "PORTABILITY",
          heading: "Lightweight freedom on the move.",
          description: "Slim profile and featherlight feel make it the ideal companion for campus lectures, business travel, coffee shop work sessions, and home leisure.",
        },
      ],
    },
    closingLine: "Make more of every day.",
    closingTone: "light",
  },
};
