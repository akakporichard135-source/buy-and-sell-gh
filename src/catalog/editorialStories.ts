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
    hero: { src: `${campaign}/iphone-18-pro-lineup.webp`, alt: "iPhone 18 Pro shown in titanium finishes" },
    heroTone: "ink",
    highlights: [
      { label: "Design", title: "A presence from every angle.", image: { src: `${campaign}/iphone-18-pro-silver.webp`, alt: "Silver iPhone 18 Pro, rear view" }, tone: "light" },
      { label: "Profile", title: "A striking silhouette.", image: { src: `${campaign}/iphone-18-pro-coffee.webp`, alt: "Close profile view of iPhone 18 Pro titanium frame" }, tone: "ink" },
      { label: "Finishes", title: "A finish that feels like you.", image: { src: `${campaign}/iphone-18-pro-burgundy-finish.webp`, alt: "Burgundy iPhone 18 Pro shown from the front and back" }, tone: "light" },
      { label: "Experience", title: "Every detail in focus.", image: { src: `${campaign}/iphone-18-pro-front.webp`, alt: "Front view of iPhone 18 Pro Super Retina XDR display" }, tone: "light" },
    ],
    chapters: [
      { id: "design", label: "Design", title: "Considered from every side.", copy: "The contoured titanium enclosure gives iPhone 18 Pro an unmistakable presence in hand. Softened edges, refined finishes, and precision-engineered glass meet to create an exceptionally durable, balanced flagship.", image: { src: `${campaign}/iphone-18-pro-silver.webp`, alt: "Silver iPhone 18 Pro viewed from behind" }, tone: "light", layout: "split" },
    ],
    information: {
      eyebrow: "EVERYTHING TO KNOW",
      title: "Designed for what matters most.",
      intro: "iPhone 18 Pro combines aerospace-grade titanium, our most advanced camera system, and an immersive all-screen experience crafted for peak everyday performance.",
      items: [
        {
          category: "DESIGN",
          heading: "Precision titanium craftsmanship.",
          description: "Aerospace-grade titanium combines exceptional strength with a remarkably lightweight feel. Contoured edges and textured matte glass create a secure, comfortable hold from morning to night.",
        },
        {
          category: "DISPLAY",
          heading: "Immersive Super Retina display.",
          description: "An edge-to-edge display with razor-thin borders offers deep contrast, vivid colors, and exceptional clarity for reading, editing photos, and enjoying HDR content in any lighting.",
        },
        {
          category: "CAMERA",
          heading: "Pro optical versatility.",
          description: "A three-lens system engineered for professional flexibility, giving you ultra-wide expanses, crisp everyday captures, and dedicated telephoto reach with rich depth and authentic color fidelity.",
        },
        {
          category: "PERFORMANCE",
          heading: "Engineered for endurance and speed.",
          description: "Designed to power high-framerate gaming, smooth multitasking, and intensive creative workflows while maximizing energy efficiency for all-day battery confidence.",
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
    hero: { src: `${campaign}/iphone-duo-open.webp`, alt: "iPhone Duo foldable phone opened wide" },
    heroTone: "light",
    highlights: [
      { label: "The fold", title: "Small moment. Bigger canvas.", image: { src: `${campaign}/iphone-duo-folded.webp`, alt: "Folded iPhone Duo in compact pocket-ready form" }, tone: "light" },
      { label: "Open", title: "Make space for more.", image: { src: `${campaign}/iphone-duo-open.webp`, alt: "Open iPhone Duo showing dual-screen expansive canvas" }, tone: "light" },
      { label: "Profile", title: "The form tells the story.", image: { src: `${campaign}/iphone-duo-side.webp`, alt: "Side profile of iPhone Duo highlighting ultra-slim hinge" }, tone: "light" },
      { label: "Together", title: "Two sides of one idea.", image: { src: `${campaign}/iphone-duo-pair.webp`, alt: "Two iPhone Duo devices showing open and closed versatility" }, tone: "ink" },
    ],
    chapters: [
      { id: "fold", label: "The fold", title: "Open up the possibilities.", copy: "Closed, iPhone Duo travels effortlessly as a compact, pocket-ready phone. Unfold it, and an expansive dual-display canvas opens up new ways to read, multitask, and collaborate side by side.", image: { src: `${campaign}/iphone-duo-open.webp`, alt: "iPhone Duo unfolded showcasing wide canvas" }, tone: "light", layout: "stage" },
      { id: "design", label: "Design", title: "A new angle on everyday.", copy: "A precision hinge engineered for smooth, stable articulation at every angle. It allows the device to rest freestanding on a table for video calls or fold seamlessly flat in your palm.", image: { src: `${campaign}/iphone-duo-side.webp`, alt: "iPhone Duo held at its slim edge" }, tone: "blue", layout: "split" },
      { id: "everyday", label: "Everyday", title: "Made for the way you move.", copy: "Run two full apps concurrently, reference documents while taking notes, or enjoy wide-aspect media. The expanded surface gives your daily workflows room to breathe without sacrificing portability.", image: { src: `${homepage}/iphone-duo.webp`, alt: "Open foldable phone held comfortably in two hands", fit: "cover" }, tone: "light", layout: "stage" },
    ],
    information: {
      eyebrow: "EVERYTHING TO KNOW",
      title: "Two ways to experience your day.",
      intro: "iPhone Duo redefines mobile versatility, bridging the convenience of a compact phone with the productivity of an expansive foldable canvas.",
      items: [
        {
          category: "THE CANVAS",
          heading: "Compact when folded. Expansive when open.",
          description: "Slip it into your pocket with ease, then open the dual display to spread out spreadsheets, read side-by-side documents, or immerse yourself in widescreen video.",
        },
        {
          category: "DESIGN",
          heading: "Precision hinge engineering.",
          description: "Crafted with durable materials and smooth resistance, the hinge holds steady at multiple viewing angles for hands-free photography, typing, and video meetings.",
        },
        {
          category: "MULTITASKING",
          heading: "Effortless side-by-side workflows.",
          description: "Drag and drop content between windows, compare notes while browsing, and switch between tasks fluidly on an expansive split-screen workspace.",
        },
        {
          category: "DURABILITY",
          heading: "Built for continuous folding.",
          description: "Engineered with resilient display layers and a reinforced frame designed to maintain a smooth touch response and reliable structural integrity through daily use.",
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
    hero: { src: `${campaign}/watch-series-12-hero.webp`, alt: "Apple Watch Series 12 on clean display", fit: "contain" },
    heroTone: "light",
    highlights: [
      { label: "Design", title: "A look that moves with you.", image: { src: `${campaign}/watch-series-12-hero.webp`, alt: "Apple Watch Series 12 with sport band" }, tone: "light" },
      { label: "Display", title: "Wide-angle OLED brilliance.", image: { src: `${campaign}/watch-series-12-display.webp`, alt: "Apple Watch Series 12 wide-angle OLED display" }, tone: "light" },
      { label: "Everyday", title: "Present for every moment.", image: { src: `${campaign}/watch-series-12-angle.webp`, alt: "Apple Watch Series 12 in space black finish" }, tone: "light" },
    ],
    chapters: [
      { id: "design", label: "Design", title: "A personal way to show up.", copy: "A watch is one of the few devices you carry into every hour of your life. Series 12 pairs an ultra-thin case with thoughtfully crafted bands, bringing effortless sophistication to workouts and formal occasions alike.", image: { src: `${campaign}/watch-series-12-angle.webp`, alt: "Apple Watch Series 12 angled profile on clean background" }, tone: "light", layout: "stage" },
      { id: "everyday", label: "Everyday", title: "Keep your moments close.", copy: "Get glanceable metrics, respond to urgent notifications, and track your wellness rings with a subtle lift of the wrist. Intuitive interactions keep you connected while staying present in the moment.", image: { src: `${campaign}/watch-series-12-hero.webp`, alt: "Apple Watch Series 12 presentation" }, tone: "light", layout: "split" },
    ],
    information: {
      eyebrow: "EVERYTHING TO KNOW",
      title: "A timepiece tailored to your everyday.",
      intro: "Apple Watch Series 12 brings advanced health insights, seamless connectivity, and all-day comfort together in our most refined wearable profile.",
      items: [
        {
          category: "DESIGN",
          heading: "Refined comfort from dawn to dusk.",
          description: "A featherlight case profile with softly curved edges sits naturally against the wrist, paired with interchangeable bands that transition smoothly from workouts to evening wear.",
        },
        {
          category: "DISPLAY",
          heading: "Brilliant edge-to-edge clarity.",
          description: "An expansive, always-on display offers exceptional brightness outdoors and dims subtly in dark rooms, making notifications and metrics instantly legible at a glance.",
        },
        {
          category: "HEALTH & ACTIVITY",
          heading: "Comprehensive wellness tracking.",
          description: "Stay in tune with your body through intuitive Activity rings, advanced heart rate monitoring, sleep tracking insights, and gentle movement reminders throughout the day.",
        },
        {
          category: "CONNECTIVITY",
          heading: "Effortless everyday convenience.",
          description: "Take calls, reply to messages on the go, check boarding passes with Apple Pay, and control music playback without ever reaching for your phone.",
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
    hero: { src: `${homepage}/watch-ultra-4.webp`, alt: "Apple Watch Ultra 4 with high-visibility orange band" },
    heroTone: "ink",
    highlights: [
      { label: "Design", title: "Bold by nature.", image: { src: `${campaign}/watch-ultra-4-hero.webp`, alt: "Apple Watch Ultra 4 titanium case and bezel close view" }, tone: "ink" },
      { label: "Control", title: "Details you can feel.", image: { src: `${campaign}/watch-ultra-4-interface.webp`, alt: "Apple Watch Ultra 4 interface with high-contrast night mode", fit: "cover" }, tone: "light" },
      { label: "Adventure", title: "Take the long way round.", image: { src: `${campaign}/watch-ultra-4-orange.webp`, alt: "Apple Watch Ultra 4 with rugged orange Alpine Loop", fit: "contain" }, tone: "light" },
    ],
    chapters: [
      { id: "design", label: "Design", title: "Built to stand out there.", copy: "Forged from aerospace titanium with a raised bezel to protect the sapphire crystal, Ultra 4 is built to withstand extreme elements. Robust materials and high-contrast typography keep critical data instantly readable in blinding sun or freezing conditions.", image: { src: `${campaign}/watch-ultra-4-hero.webp`, alt: "Apple Watch Ultra 4 shown close up in titanium" }, tone: "ink", layout: "stage" },
      { id: "details", label: "Details", title: "Every angle has purpose.", copy: "A customizable Action button provides tactile, instantaneous control even when wearing heavy gloves. Prominent digital crowns and textured side buttons ensure positive feedback when navigating backcountry trails or open waters.", image: { src: `${campaign}/watch-ultra-4-interface.webp`, alt: "Close view of Apple Watch Ultra 4 tactile controls", fit: "cover" }, tone: "light", layout: "split" },
    ],
    information: {
      eyebrow: "EVERYTHING TO KNOW",
      title: "Engineered for extreme performance.",
      intro: "Apple Watch Ultra 4 delivers unmatched durability, precision dual-frequency GPS, and long battery endurance for endurance athletes, outdoor explorers, and ocean adventurers.",
      items: [
        {
          category: "RUGGED DESIGN",
          heading: "Corrosion-resistant titanium armor.",
          description: "A robust 49mm titanium enclosure shields internal sensors from harsh impacts, while the flat sapphire front crystal is recessed behind raised edges for maximum rock and trail protection.",
        },
        {
          category: "TACTILE CONTROLS",
          heading: "Physical controls built for action.",
          description: "The high-visibility International Orange Action button provides instant physical access to compass waypoints, workouts, or dive functions, operable even with wet hands or winter gloves.",
        },
        {
          category: "ADVENTURE & NAVIGATION",
          heading: "Precision dual-frequency GPS.",
          description: "Dual-frequency GPS combines L1 and L5 satellites to deliver pinpoint trail accuracy, dense city navigation, and reliable backtrack guidance when charting unknown terrain.",
        },
        {
          category: "WATER & DEPTH",
          heading: "Certified for diving and water sports.",
          description: "Engineered with EN13319 certification, water resistance to 100 meters, and a dedicated depth gauge that activates automatically upon entering the water.",
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
    hero: { src: `${campaign}/airpods-5-product.webp`, alt: "AirPods 5 wireless earbuds in open charging case" },
    heroTone: "light",
    highlights: [
      { label: "Design", title: "Open. Listen. Go.", image: { src: `${campaign}/airpods-5-product.webp`, alt: "AirPods 5 earbuds resting in open USB-C charging case" }, tone: "light" },
      { label: "Acoustics", title: "Sculpted for acoustic clarity.", image: { src: `${campaign}/airpods-5-earbuds.webp`, alt: "AirPods 5 precision-engineered earbuds and charging case" }, tone: "light" },
      { label: "Fit & Finish", title: "All-day comfort. Instant connection.", image: { src: `${campaign}/airpods-5-front.webp`, alt: "AirPods 5 open charging case and front-facing earbuds" }, tone: "light" },
    ],
    chapters: [
      { id: "design", label: "Design", title: "Simple from the first touch.", copy: "The sculpted open-ear contour rests effortlessly in your ear, delivering balanced acoustic seal without feeling intrusive. The compact pocket-friendly case opens with a reassuring magnetic snap.", image: { src: `${campaign}/airpods-5-product.webp`, alt: "Open AirPods 5 charging case" }, tone: "light", layout: "stage" },
      { id: "listening", label: "Listening", title: "Make room for the music.", copy: "Custom high-excursion acoustic drivers and advanced computational audio deliver crisp highs, clean midranges, and punchy bass whether you are listening to podcasts on a commute or focusing at your desk.", image: { src: `${campaign}/airpods-5-earbuds.webp`, alt: "AirPods 5 acoustic architecture and open charging case" }, tone: "light", layout: "split" },
    ],
    information: {
      eyebrow: "EVERYTHING TO KNOW",
      title: "Effortless sound wherever you go.",
      intro: "AirPods 5 deliver refined acoustics, personalized spatial audio, and all-day battery life in an ultra-portable design built for seamless everyday listening.",
      items: [
        {
          category: "ACOUSTICS",
          heading: "Rich, balanced computational audio.",
          description: "Custom acoustic architecture delivers clear vocals, nuanced instrument separation, and deep bass that automatically adapts to the unique geometry of your ear.",
        },
        {
          category: "COMFORT & FIT",
          heading: "All-day featherlight comfort.",
          description: "Refined through thousands of ear shape scans, the ergonomic contour distributes contact evenly, staying secure during brisk walks, commutes, and long calls.",
        },
        {
          category: "CASE & CHARGING",
          heading: "Pocket-sized endurance with USB-C.",
          description: "The sleek charging case provides multiple full recharges on the go, supporting universal USB-C charging and magnetic snap closure for quick pocket storage.",
        },
        {
          category: "SMART INTERACTIONS",
          heading: "Seamless device switching.",
          description: "Instantly connect across your Apple devices with one-tap setup, automatic audio handover from Mac to iPhone, and responsive stem controls for volume and playback.",
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
    hero: { src: `${campaign}/macbook-air-midnight-shell.webp`, alt: "MacBook Air in Midnight finish with open display" },
    heroTone: "light",
    highlights: [
      { label: "Portable", title: "Take your workspace anywhere.", image: { src: `${campaign}/macbook-air-floating.webp`, alt: "MacBook Air floating profile showcasing ultra-thin chassis" }, tone: "light" },
      { label: "Design", title: "Thin looks good from here.", image: { src: `${campaign}/macbook-air-midnight-shell.webp`, alt: "MacBook Air slim side view with MagSafe charging port" }, tone: "light" },
      { label: "Choice", title: "Find the Air for you.", image: { src: `${campaign}/macbook-air-lineup.webp`, alt: "MacBook Air lineup showing color finishes" }, tone: "light" },
    ],
    chapters: [
      { id: "design", label: "Design", title: "A lighter way to work.", copy: "Incredibly thin and remarkably durable, the all-aluminum enclosure makes MacBook Air the ultimate portable workstation. It slides effortlessly into any backpack while feeling solid and rigid in your hands.", image: { src: `${campaign}/macbook-air-midnight-shell.webp`, alt: "MacBook Air seen from the side" }, tone: "light", layout: "stage" },
      { id: "workspace", label: "Workspace", title: "Make room for what matters.", copy: "With silent fanless thermal architecture and a vibrant Liquid Retina display, MacBook Air lets you tackle photo editing, code compilation, and multi-tab research in complete silence wherever inspiration strikes.", image: { src: `${campaign}/macbook-air-floating.webp`, alt: "MacBook Air floating presentation" }, tone: "blue", layout: "split" },
    ],
    information: {
      eyebrow: "EVERYTHING TO KNOW",
      title: "Lightweight design. Heavyweight capability.",
      intro: "MacBook Air combines an ultra-thin unibody aluminum design, brilliant Liquid Retina display, and silent fanless performance for work, study, and creativity on the move.",
      items: [
        {
          category: "PORTABILITY",
          heading: "Under half an inch thin.",
          description: "An all-aluminum unibody enclosure pairs striking durability with featherlight weight, making it effortless to carry between meeting rooms, coffee shops, and travel destinations.",
        },
        {
          category: "DISPLAY & SOUND",
          heading: "Vibrant Liquid Retina immersion.",
          description: "Support for 1 billion colors, 500 nits of peak brightness, and razor-sharp text ensures your designs, films, and spreadsheets look rich and true to life.",
        },
        {
          category: "PERFORMANCE",
          heading: "Silent, fanless efficiency.",
          description: "Advanced Apple Silicon delivers responsive app launches and effortless multitasking without a whisper of fan noise, staying cool and quiet through demanding projects.",
        },
        {
          category: "BATTERY & PORTS",
          heading: "All-day battery confidence.",
          description: "Work untethered for up to 18 hours on a single charge. MagSafe charging frees up two high-speed Thunderbolt ports for high-resolution external monitors and fast storage.",
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
    hero: { src: macMiniHero, alt: "Silver Mac mini desktop computer shown from the front" },
    heroTone: "light",
    highlights: [
      { label: "Design", title: "Make more of your space.", image: { src: macMiniHero, alt: "Compact silver Mac mini desktop" }, tone: "light" },
      { label: "At hand", title: "The details are right there.", image: { src: `${homepage}/mac-mini-device.jpg`, alt: "Mac mini front with visible USB-C and headphone connections" }, tone: "light" },
      { label: "Workspace", title: "A setup that feels like yours.", image: { src: macMiniDetail, alt: "Mac mini positioned neatly on a minimalist desk setup" }, tone: "light" },
    ],
    chapters: [
      { id: "design", label: "Design", title: "A small form with a clear purpose.", copy: "Mac mini packs full desktop power into an astonishingly compact footprint. Its quiet silver aluminum enclosure sits elegantly beside any display, freeing up your desk space for big ideas and creative projects.", image: { src: macMiniHero, alt: "Silver Mac mini product view" }, tone: "light", layout: "stage" },
      { id: "details", label: "Details", title: "A closer look at the setup.", copy: "Convenient front-facing ports bring fast connectivity directly to your fingertips, while comprehensive rear I/O supports multiple high-resolution displays, external storage arrays, and gigabit networking.", image: { src: `${homepage}/mac-mini-device.jpg`, alt: "Mac mini front and connection detail" }, tone: "blue", layout: "split" },
    ],
    information: {
      eyebrow: "EVERYTHING TO KNOW",
      title: "Small footprint. Boundless capability.",
      intro: "Mac mini transforms any desk into a high-performance workstation, pairing incredible processing power with flexible connectivity in an ultra-compact enclosure.",
      items: [
        {
          category: "COMPACT FOOTPRINT",
          heading: "Desktop power that fits anywhere.",
          description: "At just five inches square, Mac mini occupies minimal desk real estate while leaving ample space for dual monitors, studio monitors, and drawing tablets.",
        },
        {
          category: "FLEXIBLE CONNECTIVITY",
          heading: "Versatile front and rear I/O.",
          description: "Equipped with high-speed Thunderbolt ports, HDMI, gigabit Ethernet, and front-facing USB-C connections for frictionless peripheral access and multi-display setups.",
        },
        {
          category: "WORKFLOW READY",
          heading: "From coding to 4K creative suites.",
          description: "Engineered to handle complex code compilation, audio production, photo libraries, and 4K video editing smoothly with whisper-quiet thermal efficiency.",
        },
        {
          category: "ECOSYSTEM INTEGRATION",
          heading: "Your peripherals, your way.",
          description: "Pair with your favorite keyboard, mouse, and external displays. Mac mini integrates seamlessly into your existing accessories and Apple ecosystem.",
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
    hero: { src: `${campaign}/ipad-air-colors.webp`, alt: "iPad Air shown in a fan of five vibrant finishes" },
    heroTone: "light",
    highlights: [
      { label: "Colour", title: "Pick a fresh perspective.", image: { src: `${campaign}/ipad-air-colors.webp`, alt: "iPad Air color range showing full palette" }, tone: "light" },
      { label: "Canvas", title: "Give every idea more room.", image: { src: `${campaign}/ipad-air-blue.webp`, alt: "Blue iPad Air showing front Liquid Retina display and back" }, tone: "light" },
      { label: "Design", title: "Beautifully simple to carry.", image: { src: `${campaign}/ipad-air-detail.webp`, alt: "Close detail of iPad Air camera and flat-edge aluminum enclosure" }, tone: "light" },
      { label: "Your way", title: "Make the moment yours.", image: { src: `${campaign}/ipad-air-space-gray.webp`, alt: "Space gray iPad Air in a sleek workspace presentation" }, tone: "light" },
    ],
    chapters: [
      { id: "design", label: "Design", title: "A canvas with character.", copy: "An expansive Liquid Retina display with anti-reflective coating brings your artwork, lecture notes, and games to life with edge-to-edge brilliance and rich P3 wide color.", image: { src: `${campaign}/ipad-air-colors.webp`, alt: "iPad Air finish range" }, tone: "light", layout: "stage" },
      { id: "creativity", label: "Creativity", title: "Start with a blank screen.", copy: "Pair with Apple Pencil for pixel-perfect drawing, note-taking, and PDF markup. The magnetic attachment charges your stylus instantly, keeping your creative tools ready at a moment's notice.", image: { src: `${campaign}/ipad-air-blue.webp`, alt: "Blue iPad Air screen and rear view" }, tone: "blue", layout: "split" },
      { id: "details", label: "Details", title: "The little things make it yours.", copy: "Precision flat edges, touch-integrated power button, and a durable recycled aluminum body ensure iPad Air feels solid, modern, and perfectly balanced in portrait or landscape.", image: { src: `${campaign}/ipad-air-detail.webp`, alt: "iPad Air camera and finish detail" }, tone: "plum", layout: "split" },
    ],
    information: {
      eyebrow: "EVERYTHING TO KNOW",
      title: "A versatile canvas for every ambition.",
      intro: "iPad Air brings together a stunning Liquid Retina display, versatile accessory support, and lightweight portability for students, creators, and professionals on the move.",
      items: [
        {
          category: "VERSATILE CANVAS",
          heading: "From sketchbook to digital workstation.",
          description: "Seamlessly switch from handwritten notes and digital illustration to multi-window multitasking with Stage Manager and external display support.",
        },
        {
          category: "DISPLAY QUALITY",
          heading: "Liquid Retina with True Tone.",
          description: "Engineered with anti-reflective coating, P3 wide color accuracy, and high brightness to keep documents and creative projects legible indoors and out.",
        },
        {
          category: "ACCESSORY SUPPORT",
          heading: "Apple Pencil and Magic Keyboard ready.",
          description: "Attach Apple Pencil magnetically for charging and precision drawing, or snap on a Magic Keyboard with built-in trackpad for a full laptop typing experience.",
        },
        {
          category: "PORTABILITY & POWER",
          heading: "All-day battery in a featherlight form.",
          description: "Weighing just over a pound, iPad Air slips into any tote bag with ease, delivering up to 10 hours of web browsing and video playback on a single charge.",
        },
      ],
    },
  },
};
