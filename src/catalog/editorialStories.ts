import macMiniHero from "../assets/homepage/homepage-mac-mini-white.webp";
import macMiniDetail from "../assets/homepage/homepage-mac-mini-m6-launch.webp";

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
      { label: "Profile", title: "A striking silhouette.", image: { src: `${campaign}/iphone-18-pro-coffee.webp`, alt: "Close profile view of an iPhone 18 Pro concept" }, tone: "ink" },
      { label: "Finishes", title: "A finish that feels like you.", image: { src: `${campaign}/iphone-18-pro-burgundy-finish.jpg`, alt: "Burgundy iPhone 18 Pro concept shown from the front and back" }, tone: "light" },
      { label: "Experience", title: "Every detail in focus.", image: { src: `${campaign}/iphone-18-pro-front.webp`, alt: "Front view of iPhone 18 Pro concept" }, tone: "light" },
    ],
    chapters: [
      { id: "design", label: "Design", title: "Considered from every side.", copy: "The camera arrangement gives this concept an unmistakable profile. Look closer at the silver finish, the rounded corners, and the way each detail contributes to the overall shape.", image: { src: `${campaign}/iphone-18-pro-silver.webp`, alt: "Silver iPhone 18 Pro concept viewed from behind" }, tone: "light", layout: "split" },
    ],
    information: {
      eyebrow: "EVERYTHING TO KNOW",
      title: "A closer look at the concept.",
      intro: "This iPhone 18 Pro presentation explores a possible direction for the Pro design. The imagery is conceptual, so final materials, features, and specifications should be checked against a confirmed product listing.",
      items: [
        {
          category: "DESIGN",
          heading: "A distinctive shape.",
          description: "The render puts the rear camera area at the center of the design. Its softened edges and restrained finish give the phone a clean, deliberate look from the back and the side.",
        },
        {
          category: "DISPLAY",
          heading: "Space for what matters.",
          description: "A full-screen phone is a natural fit for reading, sharing photos, and keeping your day in view. Display technology and dimensions are not established by these concept images.",
        },
        {
          category: "CAMERA",
          heading: "A camera-first visual identity.",
          description: "Three prominent lenses define the rear view in this concept. Their appearance shows a design idea, not verified photographic performance or camera specifications.",
        },
        {
          category: "PERFORMANCE",
          heading: "Built around everyday possibilities.",
          description: "From messages to creative work, a Pro phone should feel comfortable across many daily tasks. Processor, battery, and performance claims will need confirmation for any final model.",
        },
      ],
    },
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
      { id: "fold", label: "The fold", title: "Open up the possibilities.", copy: "Closed, the idea is familiar: a phone ready to travel with you. Open it and the wider canvas invites a different way to read, look, and create.", image: { src: `${campaign}/iphone-duo-open.webp`, alt: "iPhone Duo concept unfolded" }, tone: "light", layout: "stage" },
      { id: "design", label: "Design", title: "A new angle on everyday.", copy: "The side view makes the fold the story. It is a simple visual shift that changes how the same device can sit in your hand or on a table.", image: { src: `${campaign}/iphone-duo-side.webp`, alt: "iPhone Duo concept held at its edge" }, tone: "blue", layout: "split" },
      { id: "everyday", label: "Everyday", title: "Made for the way you move.", copy: "A larger view can make room for shared photos, a longer read, or an idea in progress. This is a look at the concept in use, not a promise of specific software features.", image: { src: `${homepage}/iphone-duo.webp`, alt: "Open foldable phone held in two hands", fit: "cover" }, tone: "light", layout: "stage" },
    ],
    information: {
      eyebrow: "EVERYTHING TO KNOW",
      title: "Two ways to see the day.",
      intro: "iPhone Duo is presented here as a foldable concept. Its open and closed forms suggest different ways to use one device; final hardware and software behavior are not confirmed by the imagery.",
      items: [
        {
          category: "THE CANVAS",
          heading: "Compact when closed. Expansive when open.",
          description: "The closed silhouette keeps the shape familiar. The open view offers a broader surface for reading and looking at content, without making claims about exact screen size or app support.",
        },
        {
          category: "DESIGN",
          heading: "A fold at the center of the idea.",
          description: "The profile images show how the two halves meet. They communicate the design direction, while hinge construction and long-term durability remain unverified.",
        },
        {
          category: "MULTITASKING",
          heading: "Room to imagine more.",
          description: "A wider canvas could change how you move between a message, a document, and a photo. Specific multitasking modes will depend on the finished device and its software.",
        },
        {
          category: "EXPERIENCE",
          heading: "Familiar, then different.",
          description: "The appeal is in moving from a compact phone shape to an open visual surface. The renders are a design exploration rather than a technical feature list.",
        },
      ],
    },
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
      { id: "design", label: "Design", title: "A personal way to show up.", copy: "A watch is one of the few things you carry into nearly every part of the day. This concept pairs a simple face with a band that brings its own character to the look.", image: { src: `${campaign}/watch-series-12-angle.webp`, alt: "Apple Watch Series 12 angled profile on clean background" }, tone: "light", layout: "stage" },
      { id: "everyday", label: "Everyday", title: "Keep your moments close.", copy: "The appeal is in having a useful glance nearby without interrupting what you are doing. The renders focus on the feel of wearing it, not an unconfirmed list of functions.", image: { src: `${homepage}/watch-series-12.webp`, alt: "Apple Watch Series 12 concept presentation" }, tone: "light", layout: "split" },
    ],
    information: {
      eyebrow: "EVERYTHING TO KNOW",
      title: "A watch for the everyday.",
      intro: "The Series 12 imagery explores a wearable that feels at home throughout the day. It shows a design direction; any final health, display, and connectivity features need confirmation from a product listing.",
      items: [
        {
          category: "DESIGN",
          heading: "Lightweight, refined, and comfortable all day.",
          description: "A rounded case and soft-looking band create an easygoing profile. The images offer a sense of style and scale, while materials and band compatibility remain to be confirmed.",
        },
        {
          category: "GLANCEABLE INFO",
          heading: "A small screen, close at hand.",
          description: "The watch face is designed to be read in a moment. Whether a final model supports specific alerts or an always-on display depends on its confirmed specifications.",
        },
        {
          category: "ACTIVITY & MOVEMENT",
          heading: "Stay motivated and in rhythm.",
          description: "A watch can be a companion for walks, workouts, and quieter routines alike. The concept imagery does not establish which activity or health measurements a finished device includes.",
        },
        {
          category: "CONVENIENCE",
          heading: "Part of your routine.",
          description: "Its compact form makes the wrist a natural place for a quick glance. Calling, messaging, and other connected features should be verified before purchase.",
        },
      ],
    },
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
      { label: "Adventure", title: "Take the long way round.", image: { src: `${campaign}/watch-ultra-4-orange.webp`, alt: "Apple Watch Ultra concept with orange band", fit: "contain" }, tone: "light" },
    ],
    chapters: [
      { id: "design", label: "Design", title: "Built to stand out there.", copy: "The bolder case and expressive band give this concept a different presence from an everyday watch. Large, legible details keep the visual focus on the wrist, even against a wide outdoor scene.", image: { src: `${campaign}/watch-ultra-4-hero.webp`, alt: "Apple Watch Ultra concept shown close up" }, tone: "ink", layout: "stage" },
      { id: "details", label: "Details", title: "Every angle has purpose.", copy: "A distinctive case and visible side controls give the design its character. The imagery invites a closer look at their placement without promising a particular control behavior.", image: { src: `${campaign}/watch-ultra-4-interface.webp`, alt: "Close view of Apple Watch Ultra concept controls", fit: "cover" }, tone: "light", layout: "split" },
    ],
    information: {
      eyebrow: "EVERYTHING TO KNOW",
      title: "An adventurous design direction.",
      intro: "This Ultra 4 presentation emphasizes a strong case, prominent controls, and an outdoor-ready look. It is a concept showcase, not a verified account of materials, navigation, endurance, or safety features.",
      items: [
        {
          category: "RUGGED DESIGN",
          heading: "A case with presence.",
          description: "The broad case and raised edge make a visual statement. The render cannot establish the metal, crystal, or protection rating used by a final product.",
        },
        {
          category: "TACTILE CONTROLS",
          heading: "Details you can see and feel.",
          description: "A prominent crown and side controls are central to the concept's look. Their exact functions and usability in demanding conditions would need real product documentation.",
        },
        {
          category: "ADVENTURE & NAVIGATION",
          heading: "A look made for open spaces.",
          description: "The visual story leans into exploration and movement. GPS capability, water resistance, and supported activities are not confirmed by the concept images.",
        },
        {
          category: "ENDURANCE",
          heading: "Ready in spirit for longer days.",
          description: "A watch for the outdoors has to earn trust over time. Battery life and emergency features should be taken from the final specifications, not inferred from a render.",
        },
      ],
    },
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
      { id: "design", label: "Design", title: "Simple from the first touch.", copy: "The open case puts the earbuds front and center, with a shape meant to be easy to take along. The clean presentation keeps attention on the object rather than an unverified feature list.", image: { src: `${campaign}/airpods-5-product.webp`, alt: "Open earbud charging case" }, tone: "light", layout: "stage" },
      { id: "listening", label: "Listening", title: "Make room for the music.", copy: "Music and conversation follow us through work, travel, and quiet time. This scene captures that everyday rhythm without claiming a specific listening mode or sound profile.", image: { src: `${campaign}/airpods-5-lifestyle.webp`, alt: "Earbuds in an everyday setting", fit: "cover" }, tone: "blue", layout: "split" },
    ],
    information: {
      eyebrow: "EVERYTHING TO KNOW",
      title: "A simple idea for everyday listening.",
      intro: "The AirPods 5 concept centers on a familiar pair of wireless earbuds and a compact case. Audio performance, battery life, charging, and device compatibility should be checked against confirmed product details.",
      items: [
        {
          category: "ACOUSTICS",
          heading: "Made with listening in mind.",
          description: "The earbuds are presented as a companion for music, podcasts, and calls. Driver design and sound quality cannot be judged from the visual concept alone.",
        },
        {
          category: "COMFORT & FIT",
          heading: "An understated shape.",
          description: "The open-ear silhouette looks compact and familiar. Comfort and fit are personal, so the final design and wearing experience deserve a hands-on check.",
        },
        {
          category: "PORTABILITY & POWER",
          heading: "A case made to travel.",
          description: "The rounded case keeps the pair together between listening sessions. Its charging connector and battery capacity are not established by these images.",
        },
        {
          category: "INTUITIVE CONTROLS",
          heading: "Keep it easy.",
          description: "Quick, familiar interactions are part of the appeal of wireless earbuds. Supported gestures and voice controls will depend on the finished product.",
        },
      ],
    },
  },
  "macbook-air": {
    slug: "macbook-air",
    name: "MacBook Air",
    eyebrow: "Ready to go",
    tagline: "Light work. Big ideas.",
    buyPath: "/shop/buy-mac/macbook-air",
    hero: { src: `${campaign}/macbook-air-midnight-shell.webp`, alt: "MacBook Air in an open, angled presentation" },
    heroTone: "light",
    highlights: [
      { label: "Portable", title: "Take your workspace anywhere.", image: { src: `${campaign}/macbook-air-floating.webp`, alt: "MacBook Air in a floating view" }, tone: "light" },
      { label: "Design", title: "Thin looks good from here.", image: { src: `${campaign}/macbook-air-midnight-shell.webp`, alt: "MacBook Air slim profile" }, tone: "light" },
      { label: "Choice", title: "Find the Air for you.", image: { src: `${campaign}/macbook-air-lineup.webp`, alt: "MacBook Air in several views" }, tone: "light" },
    ],
    chapters: [
      { id: "design", label: "Design", title: "A lighter way to work.", copy: "A slim laptop makes it easier to take a familiar workspace from one place to the next. The angled view puts the screen, keyboard, and profile together in a single glance.", image: { src: `${campaign}/macbook-air-midnight-shell.webp`, alt: "MacBook Air seen from the side" }, tone: "light", layout: "stage" },
      { id: "workspace", label: "Workspace", title: "Make room for what matters.", copy: "At a desk or on the move, the appeal is having your work and ideas ready when you are. The exact performance and connections depend on the MacBook Air configuration you choose.", image: { src: `${campaign}/macbook-air-floating.webp`, alt: "MacBook Air floating product presentation" }, tone: "blue", layout: "split" },
    ],
    information: {
      eyebrow: "EVERYTHING TO KNOW",
      title: "A closer look at MacBook Air.",
      intro: "This page focuses on the portable form and the everyday workspace it creates. For a specific purchase, compare the listed chip, memory, storage, display, and port configuration before choosing.",
      items: [
        {
          category: "PORTABILITY",
          heading: "Easy to make room for.",
          description: "A slim profile is the defining visual feature here. Check the dimensions and weight of the exact model to see how it fits your bag and your routine.",
        },
        {
          category: "DISPLAY & KEYBOARD",
          heading: "A familiar place to focus.",
          description: "The open design keeps the display and keyboard close to the task at hand. Screen size, panel details, and keyboard layout vary by model and region.",
        },
        {
          category: "WORK & CREATIVITY",
          heading: "Choose for the work you do.",
          description: "Writing, studying, meetings, and creative projects place different demands on a laptop. Review the actual processor and memory options when deciding which configuration suits you.",
        },
        {
          category: "CONNECTIVITY",
          heading: "Plan your setup.",
          description: "Think about the monitor, storage, and accessories you use every day. Confirm the available ports and charging method on the selected model before you order.",
        },
      ],
    },
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
      { id: "design", label: "Design", title: "A small form with a clear purpose.", copy: "A compact desktop gives more of the desk back to you. The quiet shape is easy to place beside a display, leaving the rest of the setup open to your preferences.", image: { src: macMiniHero, alt: "Silver Mac mini product view" }, tone: "light", layout: "stage" },
      { id: "details", label: "Details", title: "A closer look at the setup.", copy: "The front view brings the compact proportions and visible connections into focus. Before planning a full workstation, check the exact port layout of the model offered for pre-order.", image: { src: `${homepage}/mac-mini-device.jpg`, alt: "Mac mini front detail" }, tone: "blue", layout: "split" },
    ],
    information: {
      eyebrow: "EVERYTHING TO KNOW",
      title: "Small desktop, flexible setup.",
      intro: "Mac mini leaves the choice of display and accessories to you. This overview is about its compact form; the processor, ports, and display support should be verified for the specific model offered.",
      items: [
        {
          category: "COMPACT FORM",
          heading: "More room on the desk.",
          description: "Its compact enclosure can sit beside a display without taking over the workspace. Measure the space you have and compare the listed dimensions when planning the setup.",
        },
        {
          category: "VERSATILITY",
          heading: "Build your dream desk arrangement.",
          description: "Choose the display, keyboard, pointing device, and audio gear that suit your work. Compatibility depends on the connections and software supported by the selected model.",
        },
        {
          category: "PRODUCTIVITY & CREATIVITY",
          heading: "Match the machine to the task.",
          description: "A small desktop can support many kinds of work, from documents to creative projects. Compare the listed chip, memory, and storage before deciding what it can handle for you.",
        },
        {
          category: "PORTS & CONNECTIVITY",
          heading: "Connect what you need.",
          description: "The images show visible connection points, but not the full specification. Check the exact port types and external display support on the product listing.",
        },
      ],
    },
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
      { id: "design", label: "Design", title: "A canvas with character.", copy: "The broad screen gives content room to breathe, while the finish adds a little personality. These views invite you to look at the form from the front and back.", image: { src: `${campaign}/ipad-air-colors.webp`, alt: "iPad Air concept finish range" }, tone: "light", layout: "stage" },
      { id: "creativity", label: "Creativity", title: "Start with a blank screen.", copy: "A tablet can be a place to collect notes, read closely, or work through a visual idea. The blue presentation shows that open canvas without promising a particular accessory or app.", image: { src: `${campaign}/ipad-air-blue.webp`, alt: "Blue iPad Air concept screen and rear view" }, tone: "blue", layout: "split" },
      { id: "details", label: "Details", title: "The little things make it yours.", copy: "The camera, edges, and color are easier to appreciate up close. Small choices in the form can make the whole device feel more personal.", image: { src: `${campaign}/ipad-air-detail.webp`, alt: "iPad Air concept camera and finish detail" }, tone: "plum", layout: "split" },
    ],
    information: {
      eyebrow: "EVERYTHING TO KNOW",
      title: "A canvas for different kinds of days.",
      intro: "The iPad Air story is about a portable screen that can move between reading, viewing, and making. Check the exact model and accessory compatibility before relying on any particular creative or work feature.",
      items: [
        {
          category: "VERSATILITY",
          heading: "From sketchpad to digital notebook.",
          description: "A tablet offers a flexible space for documents, images, and ideas. Handwriting and typing workflows depend on the apps and accessories you choose.",
        },
        {
          category: "DISPLAY",
          heading: "A broad view for your content.",
          description: "The front view highlights the screen as the center of the experience. Display size, coating, and color performance should be checked on the selected model.",
        },
        {
          category: "ACCESSORY INTEGRATION",
          heading: "Make it work your way.",
          description: "A stylus or keyboard can change how you use a tablet. Confirm which accessories are supported and sold separately for the version you are considering.",
        },
        {
          category: "PORTABILITY",
          heading: "Take your space with you.",
          description: "The slim form is easy to picture in a bag or on a desk. Compare the actual weight and dimensions to your everyday carry needs.",
        },
      ],
    },
  },
};
