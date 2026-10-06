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

export type EditorialCinematicVideo = {
  src?: string;
  mobileSrc?: string;
  poster: string;
  alt: string;
  eyebrow?: string;
  headline?: string;
  subheadline?: string;
  aspectRatio?: string;
  isClean?: boolean;
  isDesktopClean?: boolean;
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
  cinematicVideo?: EditorialCinematicVideo;
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
    hero: { src: `${campaign}/iphone-18-pro-burgundy-finish.webp`, alt: "iPhone 18 Pro dual front and rear presentation in Deep Burgundy" },
    heroTone: "ink",
    highlights: [
      { label: "Camera", title: "Pro optical plateau.", image: { src: `${campaign}/iphone-18-pro-camera-macro.jpg`, alt: "Triple-lens camera plateau macro with titanium knurled bezels", fit: "cover" }, tone: "ink" },
      { label: "Silicon", title: "A19 Pro architecture.", image: { src: `${campaign}/iphone-18-pro-chip-a19.jpg`, alt: "A19 Pro silicon architecture with gold traces", fit: "cover" }, tone: "ink" },
      { label: "Craftsmanship", title: "Contoured titanium rail.", image: { src: `${campaign}/iphone-18-pro-coffee.webp`, alt: "Brushed titanium frame and tactile buttons in profile" }, tone: "ink" },
      { label: "Display", title: "Super Retina XDR canvas.", image: { src: `${campaign}/iphone-18-pro-front.webp`, alt: "Front view of edge-to-edge Super Retina XDR display" }, tone: "light" },
      { label: "Finishes", title: "Four titanium expressions.", image: { src: `${campaign}/iphone-18-pro-colors.webp`, alt: "Four iPhone 18 Pro titanium finishes in Space Black, Natural Titanium, Light Blue and Deep Burgundy" }, tone: "light" },
    ],
    cinematicVideo: {
      src: "",
      mobileSrc: "/videos/homepage/iphone-18-pro-mobile.webm?v=clean-20261006",
      poster: "/products/story/iphone-18-pro-clean-frame.webp?v=clean-20261006",
      alt: "iPhone 18 Pro in aerospace titanium cinematic presentation",
      eyebrow: "Cinematic Hardware",
      headline: "Precision in continuous motion.",
      subheadline: "Grade 5 titanium sculpted to catch every highlight, contoured for effortless grip.",
      aspectRatio: "16/9",
      isClean: true,
      isDesktopClean: false,
    },
    chapters: [
      {
        id: "craftsmanship",
        label: "Craftsmanship",
        title: "Forged in aerospace-grade titanium.",
        copy: "The contoured grade 5 titanium enclosure gives iPhone 18 Pro an unmistakable presence in hand. Softened edges, refined satin finishes, and precision-engineered glass meet to create our lightest, strongest, and most ergonomically balanced Pro device ever crafted.",
        image: { src: `${campaign}/iphone-18-pro-coffee.webp`, alt: "Close profile view of iPhone 18 Pro titanium frame and contoured edges" },
        tone: "ink",
        layout: "split",
      },
      {
        id: "display",
        label: "Super Retina XDR",
        title: "Borders pushed to the absolute edge.",
        copy: "An expansive all-screen OLED canvas featuring ProMotion technology with adaptive refresh rates up to 120Hz. With peak outdoor brightness of 2500 nits and ultra-thin borders, every HDR video, photograph, and graphic renders with extraordinary clarity and depth.",
        image: { src: `${campaign}/iphone-18-pro-front.webp`, alt: "Front view of iPhone 18 Pro Super Retina XDR display with edge-to-edge glass" },
        tone: "light",
        layout: "stage",
      },
      {
        id: "camera",
        label: "Pro Optical Architecture",
        title: "A studio in your pocket. From macro to telephoto.",
        copy: "A knurled titanium plateau houses three breakthrough sensors: a 48MP Fusion primary sensor with 2nd-gen Sensor-shift OIS, a high-resolution Ultra Wide, and a dedicated 5x Telephoto periscope lens. Capture cinema-grade ProRes log video and authentic skin tones in any lighting.",
        image: { src: `${campaign}/iphone-18-pro-camera-macro.jpg`, alt: "Close-up macro of the iPhone 18 Pro triple camera system plateau with knurled titanium lens bezels", fit: "cover" },
        tone: "ink",
        layout: "split",
      },
      {
        id: "silicon",
        label: "A19 Pro Silicon",
        title: "Monumental speed. Relentless efficiency.",
        copy: "Built on an advanced 3nm architecture, the A19 Pro chip delivers unprecedented CPU computing power and hardware-accelerated ray tracing. Experience console-quality gaming, instant AI intelligence, and phenomenal power efficiency for true all-day battery life.",
        image: { src: `${campaign}/iphone-18-pro-chip-a19.jpg`, alt: "A19 Pro silicon chip architecture on dark circuit board", fit: "cover" },
        tone: "ink",
        layout: "stage",
      },
      {
        id: "lifestyle",
        label: "Everyday Ambition",
        title: "Engineered for Ghana's brightest creators.",
        copy: "From sunrise creative sessions in Cantonments to dusk meetings overlooking the Accra skyline, iPhone 18 Pro is built to keep pace with visionary entrepreneurs, artists, and leaders shaping the future of West Africa. Trusted original hardware backed by Buy & Sell GH.",
        image: { src: `${campaign}/iphone-18-pro-lifestyle-accra.jpg`, alt: "Ghanaian creative director holding iPhone 18 Pro in a modern Accra penthouse at sunset", fit: "cover" },
        tone: "light",
        layout: "stage",
      },
      {
        id: "finishes",
        label: "Finishes",
        title: "Four expressions of pure titanium.",
        copy: "Available in Deep Burgundy, Space Black, Natural Titanium, and Light Blue. Each finish utilizes an advanced physical vapor deposition process to bond color directly into the titanium matrix for enduring beauty and scratch resistance.",
        image: { src: `${campaign}/iphone-18-pro-colors.webp`, alt: "Four iPhone 18 Pro finishes: Space Black, Natural Titanium, Light Blue, Deep Burgundy" },
        tone: "light",
        layout: "stage",
      },
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
    buyLabel: "View Pricing",
    hero: { src: `${campaign}/iphone-duo-open.webp`, alt: "iPhone Duo foldable phone opened wide" },
    heroTone: "light",
    highlights: [
      { label: "The fold", title: "Small moment. Bigger canvas.", image: { src: `${campaign}/iphone-duo-folded.webp`, alt: "Folded iPhone Duo in compact pocket-ready form" }, tone: "light" },
      { label: "Open", title: "Make space for more.", image: { src: `${campaign}/iphone-duo-open.webp`, alt: "Open iPhone Duo showing dual-screen expansive canvas" }, tone: "light" },
      { label: "Profile", title: "The form tells the story.", image: { src: `${campaign}/iphone-duo-side.webp`, alt: "Side profile of iPhone Duo highlighting ultra-slim hinge" }, tone: "light" },
      { label: "Together", title: "Two sides of one idea.", image: { src: `${campaign}/iphone-duo-pair.webp`, alt: "Two iPhone Duo devices showing open and closed versatility" }, tone: "ink" },
    ],
    cinematicVideo: {
      src: "",
      poster: "/products/homepage/iphone-duo.webp?v=clean-20261006",
      alt: "iPhone Duo dual-screen foldable phone in motion",
      eyebrow: "Dual Canvas",
      headline: "Engineered to unfold seamlessly.",
      subheadline: "A continuous dual-display experience articulated on a precision multi-axis hinge.",
      aspectRatio: "16/9",
      isClean: false,
      isDesktopClean: false,
    },
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
    eyebrow: "Sleek. Brilliant. Indispensable.",
    tagline: "A little closer to everything.",
    buyPath: "/shop/buy-watch/apple-watch-series-12",
    hero: { src: `${campaign}/watch-series-12-hero.webp`, alt: "Apple Watch Series 12 on clean display", fit: "contain" },
    heroTone: "light",
    highlights: [
      { label: "Design", title: "Nearly 10% thinner. Fits every wrist seamlessly.", image: { src: `${campaign}/watch-series-12-hero.webp`, alt: "Apple Watch Series 12 with sport band" }, tone: "light" },
      { label: "Display", title: "Wide-Angle OLED with 40% brighter off-axis view.", image: { src: `${campaign}/watch-series-12-display.webp`, alt: "Apple Watch Series 12 wide-angle OLED display" }, tone: "light" },
      { label: "Health", title: "Sleep apnea notifications and depth sensing.", image: { src: `${campaign}/watch-sensor-detail.webp`, alt: "Apple Watch Series 12 back crystal biosensors" }, tone: "ink" },
      { label: "Fast Charge", title: "80% battery in 30 minutes before leaving home.", image: { src: `${campaign}/watch-series-12-angle.webp`, alt: "Apple Watch Series 12 angled profile in space black finish" }, tone: "light" },
      { label: "Finishes", title: "Jet Black aluminum and polished titanium.", image: { src: `${campaign}/watch-series-12-product.webp`, alt: "Apple Watch Series 12 case options and premium materials" }, tone: "light" },
    ],
    cinematicVideo: {
      src: "",
      poster: "/products/homepage/watch-series-12.webp?v=clean-20261006",
      alt: "Apple Watch Series 12 slim profile and wide-angle OLED display",
      eyebrow: "Sleek Geometry",
      headline: "Thin. Vibrant. Built for the pulse of Accra.",
      subheadline: "Wide-angle OLED brilliance in our thinnest case architecture ever made.",
      aspectRatio: "16/9",
      isClean: false,
      isDesktopClean: false,
    },
    chapters: [
      {
        id: "silhouette",
        label: "Silhouette",
        title: "Nearly 10% thinner. Infinitely more comfortable.",
        copy: "Re-engineered from the crystal inward, Series 12 is the thinnest Apple Watch ever made without compromising a single minute of battery life. The reduced profile sits naturally under tailored shirts during boardroom meetings in Airport Residential or during intensive evening workouts along the Labadi beach strip.",
        image: { src: `${campaign}/watch-series-12-hero.webp`, alt: "Apple Watch Series 12 case contour" },
        tone: "light",
        layout: "stage",
      },
      {
        id: "display",
        label: "Display",
        title: "Wide-angle OLED brilliance in harsh afternoon sun.",
        copy: "The revolutionary wide-angle OLED display emits more light at wider angles, making it up to 40 percent brighter when viewed off-axis. Glance at notifications, split times, and messages discreetly under Accra’s bright midday sunlight without rotating your wrist toward your face.",
        image: { src: `${campaign}/watch-series-12-display.webp`, alt: "Apple Watch Series 12 wide-angle OLED screen" },
        tone: "light",
        layout: "split",
      },
      {
        id: "health",
        label: "Health Insights",
        title: "Comprehensive wellness monitoring on your wrist.",
        copy: "Advanced optical and electrical heart sensors track heart rate, blood oxygen trends, ECG recordings, and ground-breaking sleep apnea notifications. Series 12 actively safeguards your health and provides longitudinal wellness metrics you can share directly with your physician.",
        image: { src: `${campaign}/watch-sensor-detail.webp`, alt: "Apple Watch Series 12 health sensor suite" },
        tone: "ink",
        layout: "stage",
      },
      {
        id: "connectivity",
        label: "Connectivity",
        title: "Stay in touch across Ghana without missing a beat.",
        copy: "With built-in cellular connectivity, you can answer calls, reply to WhatsApp messages, and stream Apple Music even when your iPhone is left safely at home. Streamlined cellular antennae ensure strong coverage across MTN, Telecel, and AT networks throughout Accra and Kumasi.",
        image: { src: `${campaign}/watch-series-12-angle.webp`, alt: "Apple Watch Series 12 connectivity and profile" },
        tone: "light",
        layout: "split",
      },
      {
        id: "charge",
        label: "Endurance",
        title: "Rapid fast-charging for seamless day-to-night wear.",
        copy: "An upgraded charging coil and metal back design recharge Series 12 to 80 percent in approximately thirty minutes. Top up while taking your morning shower, and wear your watch through a full day of meetings and an entire night of detailed sleep tracking without pause.",
        image: { src: `${campaign}/watch-series-12-product.webp`, alt: "Apple Watch Series 12 charging and battery architecture" },
        tone: "light",
        layout: "stage",
      },
      {
        id: "craft",
        label: "Craftsmanship",
        title: "Polished Jet Black and grade 5 titanium.",
        copy: "Engineered in brilliant high-gloss Jet Black aluminum achieved through a 30-step anodization process, or featherlight grade 5 aerospace titanium. Each case pairs seamlessly with interchangeable sport loops, Milanese meshes, and leather bands for any occasion in Ghana.",
        image: { src: `${campaign}/watch-series-12-cinematic.webp`, alt: "Apple Watch Series 12 precision finishes" },
        tone: "light",
        layout: "split",
      },
    ],
    information: {
      eyebrow: "EVERYTHING TO KNOW",
      title: "A timepiece tailored to your everyday.",
      intro: "Apple Watch Series 12 brings advanced health insights, seamless connectivity, and all-day comfort together in our most refined wearable profile.",
      items: [
        {
          category: "DESIGN & DISPLAY",
          heading: "Ultra-thin case with wide-angle OLED.",
          description: "Nearly 10 percent thinner than previous generations with up to 40 percent brighter off-axis display viewing under bright outdoor sun.",
        },
        {
          category: "HEALTH SENSORS",
          heading: "Cardiovascular and sleep intelligence.",
          description: "Equipped with sleep apnea detection, ECG, blood oxygen estimation, high and low heart rate notifications, and depth and water temperature sensors.",
        },
        {
          category: "BATTERY & CHARGE",
          heading: "All-day battery with 30-minute fast charging.",
          description: "Up to 18 hours of typical use and up to 36 hours in Low Power Mode, reaching 80% charge in approximately 30 minutes with the included USB-C cable.",
        },
        {
          category: "LOCAL FULFILLMENT",
          heading: "Verified authentic inventory in Accra.",
          description: "Supplied brand new with full Apple manufacturer warranty, authentic accessories in-box, and immediate same-day pickup at Dome Pillar 2 or swift delivery across Ghana.",
        },
      ],
    },
  },
  "apple-watch-ultra-4": {
    slug: "apple-watch-ultra-4",
    name: "Apple Watch Ultra 4",
    eyebrow: "Rugged. Capable. Unstoppable.",
    tagline: "For the journey ahead.",
    buyPath: "/shop/buy-watch/apple-watch-ultra-4",
    hero: { src: `${campaign}/watch-ultra-4-hero.webp`, alt: "Apple Watch Ultra 4 titanium case and bezel close view", fit: "contain" },
    heroTone: "ink",
    highlights: [
      { label: "Titanium", title: "49mm corrosion-resistant aerospace titanium.", image: { src: `${campaign}/watch-ultra-4-hero.webp`, alt: "Apple Watch Ultra 4 titanium case and bezel close view" }, tone: "ink" },
      { label: "Display", title: "3000 nits edge-to-edge sapphire crystal.", image: { src: `${campaign}/watch-ultra-4-interface.webp`, alt: "Apple Watch Ultra 4 interface with high-contrast night mode", fit: "cover" }, tone: "light" },
      { label: "Action Button", title: "Tactile customization in International Orange.", image: { src: `${campaign}/watch-ultra-4-orange.webp`, alt: "Apple Watch Ultra 4 with rugged orange Alpine Loop", fit: "contain" }, tone: "light" },
      { label: "Endurance", title: "Up to 72 hours of battery in Low Power Mode.", image: { src: `${campaign}/watch-sensor-detail.webp`, alt: "Apple Watch Ultra 4 robust biometric sensor suite" }, tone: "ink" },
      { label: "Expedition", title: "Dual-frequency GPS and 100m water resistance.", image: { src: `${campaign}/watch-ultra-4-rugged.webp`, alt: "Apple Watch Ultra 4 expedition endurance" }, tone: "ink" },
    ],
    cinematicVideo: {
      src: "",
      poster: "/products/homepage/watch-ultra-4.webp?v=clean-20261006",
      alt: "Apple Watch Ultra 4 rugged 49mm aerospace titanium in motion",
      eyebrow: "Extreme Environments",
      headline: "49mm of uncompromising titanium.",
      subheadline: "Built to endure tropical trails, Atlantic currents, and multi-day expeditions across Ghana.",
      aspectRatio: "16/9",
      isClean: false,
      isDesktopClean: false,
    },
    chapters: [
      {
        id: "titanium",
        label: "Titanium Armor",
        title: "Built for unforgiving environments and endurance.",
        copy: "Forged from corrosion-resistant 49mm aerospace-grade titanium, Ultra 4 features a raised bezel that completely protects the flat sapphire front crystal from direct edge impacts. It is engineered to withstand tropical downpours, coastal humidity, and demanding trail environments without compromise.",
        image: { src: `${campaign}/watch-ultra-4-hero.webp`, alt: "Apple Watch Ultra 4 shown close up in titanium" },
        tone: "ink",
        layout: "stage",
      },
      {
        id: "display",
        label: "3000 Nits Display",
        title: "Peak legibility under the brightest tropical sun.",
        copy: "The largest and brightest Apple Watch display ever peaks at an astonishing 3,000 nits, ensuring instant legibility whether you are running midday in Accra, hiking Mount Afadja, or out on the open Atlantic waters. Night Mode automatically engages in low light, shifting the display to crimson.",
        image: { src: `${campaign}/watch-ultra-4-interface.webp`, alt: "Close view of Apple Watch Ultra 4 tactile controls", fit: "cover" },
        tone: "light",
        layout: "split",
      },
      {
        id: "action",
        label: "Action Button",
        title: "Physical, instantaneous control you can count on.",
        copy: "The customizable Action button in International Orange offers direct, tactile tactile control when starting workouts, marking GPS waypoints, or activating the 86-decibel emergency siren. Designed with a textured profile, it responds reliably even when wearing diving gloves or cycling mitts.",
        image: { src: `${campaign}/watch-ultra-4-orange.webp`, alt: "Apple Watch Ultra 4 International Orange Action button" },
        tone: "light",
        layout: "stage",
      },
      {
        id: "endurance",
        label: "Battery Life",
        title: "Endurance to power multi-day expeditions.",
        copy: "With up to 36 hours of battery life during standard operation and up to 72 hours in Low Power Mode, Ultra 4 eliminates daily charging anxiety. Take weekend trips outside Accra to Cape Coast, Ada Foah, or the Volta region without ever having to pack a charging cable.",
        image: { src: `${campaign}/watch-sensor-detail.webp`, alt: "Apple Watch Ultra 4 long-lasting battery and sensors" },
        tone: "ink",
        layout: "split",
      },
      {
        id: "ocean",
        label: "Water & Ocean",
        title: "EN13319 certified dive computer on your wrist.",
        copy: "Certified to 100 meters water resistance and EN13319 standard for dive accessories, Ultra 4 incorporates a depth gauge accurate to 40 meters alongside a water temperature sensor. It transforms into a capable dive computer with the Oceanic+ app for recreational scuba and freediving.",
        image: { src: `${campaign}/watch-ultra-4-rugged.webp`, alt: "Apple Watch Ultra 4 waterproof depth resilience" },
        tone: "ink",
        layout: "stage",
      },
      {
        id: "bands",
        label: "Specialized Bands",
        title: "Alpine Loop, Trail Loop, and Ocean Band.",
        copy: "Choose from three specialized band styles: the seamless high-strength Alpine Loop with titanium G-hook, the featherlight elastic Trail Loop for runners, or the molded fluoroelastomer Ocean Band designed to securely fit over wetsuits. Each band is purpose-built for extreme conditions.",
        image: { src: `${campaign}/watch-ultra-4-hero.webp`, alt: "Apple Watch Ultra 4 bands and straps" },
        tone: "light",
        layout: "split",
      },
    ],
    information: {
      eyebrow: "EVERYTHING TO KNOW",
      title: "Engineered for extreme performance.",
      intro: "Apple Watch Ultra 4 delivers unmatched durability, precision dual-frequency GPS, and long battery endurance for endurance athletes, outdoor explorers, and ocean adventurers.",
      items: [
        {
          category: "CASE & GLASS",
          heading: "49mm grade 5 titanium and sapphire crystal.",
          description: "Raised titanium bezel surrounds the flat sapphire crystal for unmatched impact resistance, dust tightness (IP6X), and water resistance to 100 meters.",
        },
        {
          category: "NAVIGATION & AUDIO",
          heading: "Precision dual-frequency GPS & 86dB siren.",
          description: "L1 and L5 GPS integration delivers exact route metrics in dense cityscapes and remote wilderness, paired with a dual-speaker system and an 86-decibel audible emergency siren.",
        },
        {
          category: "BATTERY ENDURANCE",
          heading: "Up to 72 hours in Low Power Mode.",
          description: "36 hours of normal battery endurance and up to 72 hours in Low Power Mode, with fast charging capable of restoring 80 percent capacity in approximately one hour.",
        },
        {
          category: "ACCRA FULFILLMENT",
          heading: "Same-day collection and nationwide delivery.",
          description: "Inspected and sealed with full manufacturer warranty. Collect immediately at Dome Pillar 2 in Accra or arrange tracked courier delivery anywhere in Ghana.",
        },
      ],
    },
  },
  "airpods-5": {
    slug: "airpods-5",
    name: "AirPods 5",
    eyebrow: "Pure Sound. Open Air.",
    tagline: "Iconic comfort. Now with Active Noise Cancellation.",
    buyPath: "/shop/buy-airpods/airpods-5",
    hero: { src: `${campaign}/airpods-5-product.webp`, alt: "AirPods 5 wireless earbuds resting in precision open USB-C charging case" },
    heroTone: "light",
    highlights: [
      { label: "Acoustics", title: "Custom distortion-reducing drivers and high-dynamic amplifier.", image: { src: `${campaign}/airpods-5-product.webp`, alt: "AirPods 5 earbuds resting in open USB-C charging case" }, tone: "light" },
      { label: "Active Noise Cancellation", title: "Now available in an open-ear design for total focus.", image: { src: `${campaign}/airpods-5-earbuds.webp`, alt: "AirPods 5 precision-engineered acoustic vents and ports" }, tone: "ink" },
      { label: "Spatial Audio", title: "Dynamic head tracking places sound all around you.", image: { src: `${campaign}/airpods-5-lifestyle.webp`, alt: "AirPods 5 in-ear spatial audio listening" }, tone: "blue" },
      { label: "Wireless Case", title: "Compact USB-C case with built-in speaker for Find My.", image: { src: `${campaign}/airpods-5-front.webp`, alt: "AirPods 5 front-facing case with status LED" }, tone: "light" },
      { label: "Battery Life", title: "Up to 30 hours of total immersive listening time.", image: { src: `${campaign}/airpods-5-dark.webp`, alt: "AirPods 5 dark studio acoustic profile" }, tone: "ink" },
    ],
    chapters: [
      { id: "acoustics", label: "Acoustic Seal", title: "Sculpted for acoustic clarity.", copy: "Engineered with a newly contoured acoustic cavity, custom low-distortion driver, and high-dynamic-range amplifier, AirPods 5 deliver punchy bass, crystal-clear mids, and immaculate highs. The refined shape rests securely without intrusive pressure, creating a balanced acoustic seal across diverse ear geometries.", image: { src: `${campaign}/airpods-5-product.webp`, alt: "AirPods 5 open charging case in studio light" }, tone: "light", layout: "stage" },
      { id: "anc", label: "Active Noise Cancellation", title: "Hear what you want. Silence what you don't.", copy: "For the first time in an open-ear design, AirPods 5 offer Active Noise Cancellation powered by the H2 chip. Advanced computational audio cancels ambient traffic noise, cafe rumble, and aircraft hum while Adaptive Audio and Transparency mode automatically blend environmental awareness when conversations begin.", image: { src: `${campaign}/airpods-5-earbuds.webp`, alt: "AirPods 5 dual acoustic microphones and noise-cancelling vents" }, tone: "ink", layout: "split" },
      { id: "spatial", label: "Spatial Audio", title: "Surround sound calibrated to your motion.", copy: "Personalized Spatial Audio with dynamic head tracking transforms every playlist, podcast, and Apple TV movie into a private three-dimensional concert hall. Gyroscopes and accelerometers track your head movement so acoustic sources remain anchored in place, providing an astonishing sense of presence.", image: { src: `${campaign}/airpods-5-lifestyle.webp`, alt: "AirPods 5 personalized spatial audio listening experience" }, tone: "blue", layout: "split" },
      { id: "case", label: "Engineered Case", title: "Smallest case ever. Wireless and Find My ready.", copy: "The redesigned charging case is over 10 percent smaller than previous generations yet packs full USB-C fast charging, wireless charging pad compatibility, and an integrated acoustic speaker that chirps loud, clear tones when locating your misplaced case via Find My across your home or office.", image: { src: `${campaign}/airpods-5-front.webp`, alt: "AirPods 5 compact wireless charging case with speaker grille" }, tone: "light", layout: "stage" },
      { id: "h2-chip", label: "Apple Silicon", title: "The H2 chip. The brains behind the brilliance.", copy: "Powered by Apple's H2 audio processor, AirPods 5 unlock intelligent voice isolation that removes harsh wind and background street noise during phone calls across Accra. Enjoy ultra-low gaming latency, seamless automatic switching across Mac and iPhone, and instant hands-free Siri interactions.", image: { src: `${campaign}/airpods-5-dark.webp`, alt: "AirPods 5 advanced H2 processing architecture" }, tone: "sage", layout: "split" },
      { id: "comfort", label: "Ergonomics", title: "Featherlight endurance for the entire day.", copy: "Refined through 50 million data points of 3D ear scans, the optimized geometry stays firmly positioned during vigorous workouts, busy commutes, and extended conference calls. Enjoy up to 30 hours of total playback with the pocketable case, ensuring your music stays continuous from dawn to dusk.", image: { src: `${campaign}/airpods-cases.webp`, alt: "AirPods 5 pocketable case profile" }, tone: "plum", layout: "split" },
    ],
    information: {
      eyebrow: "EVERYTHING TO KNOW",
      title: "Effortless sound wherever you go.",
      intro: "AirPods 5 deliver refined acoustics, personalized spatial audio, and all-day battery life in an ultra-portable design built for seamless everyday listening.",
      items: [
        {
          category: "ACOUSTIC PERFORMANCE",
          heading: "Custom low-distortion drivers with H2 compute.",
          description: "The H2 silicon powers computational audio to adapt frequency curves in real time, delivering deep bass notes and shimmering high frequencies tailored precisely to your ear shape.",
        },
        {
          category: "ACTIVE NOISE CANCELLATION",
          heading: "Open-ear ANC with Adaptive Audio.",
          description: "Select the ANC edition to silence background city rumble while Adaptive Audio and Conversation Awareness smoothly lower media volume whenever you speak to someone nearby.",
        },
        {
          category: "POCKET-SIZED ENDURANCE",
          heading: "Universal USB-C and wireless charging.",
          description: "Recharge quickly via universal USB-C or snap onto Apple Watch chargers and Qi wireless pads. Up to 30 hours of listening time with the case ensures uncompromised all-day stamina.",
        },
        {
          category: "ACCRA FULFILLMENT & TRUST",
          heading: "Authentic Apple warranty and local Dome pickup.",
          description: "Every unit purchased from Buy & Sell GH includes authentic Apple international warranty, free inspection and pickup at Dome Pillar 2, Accra, or rapid doorstep delivery with Momo confirmation.",
        },
      ],
    },
  },
  "macbook-air": {
    slug: "macbook-air",
    name: "MacBook Air",
    eyebrow: "Featherlight Power",
    tagline: "Lean. Mean. Apple Silicon machine.",
    buyPath: "/shop/buy-mac/macbook-air",
    hero: { src: `${campaign}/macbook-air-cinematic.webp`, alt: "MacBook Air Liquid Retina display in Midnight aluminum chassis" },
    heroTone: "light",
    highlights: [
      { label: "Liquid Retina", title: "1 billion colors. Razor-sharp clarity.", image: { src: `${campaign}/macbook-air-cutout.webp`, alt: "MacBook Air open Liquid Retina display" }, tone: "ink" },
      { label: "Design", title: "Under half an inch thin. Solid unibody.", image: { src: `${campaign}/macbook-air-midnight-shell.webp`, alt: "MacBook Air contoured anodized aluminum shell" }, tone: "ink" },
      { label: "Silence", title: "Zero fan noise. Pure uninterrupted focus.", image: { src: `${campaign}/macbook-air-starlight-studio.jpg`, alt: "MacBook Air in Starlight on studio stage" }, tone: "light" },
      { label: "Pro Power", title: "Extreme energy efficiency for heavy workflows.", image: { src: `${campaign}/macbook-pro-cinematic.webp`, alt: "MacBook Pro Liquid Retina XDR workstation" }, tone: "ink" },
      { label: "MagSafe", title: "MagSafe 3, Spatial Audio, 1080p FaceTime.", image: { src: `${campaign}/accessory-macbook-charger.webp`, alt: "MacBook MagSafe 3 charging cable and power adapter" }, tone: "light" },
    ],
    chapters: [
      { id: "craftsmanship", label: "Aerospace Aluminum", title: "Strikingly thin. Built to last.", copy: "Measuring less than half an inch thin, MacBook Air is precision-machined from 100 percent recycled aerospace-grade aluminum. It slides weightlessly into your bag while delivering the rigid, flex-free unibody durability required for demanding daily commutes across Greater Accra.", image: { src: `${campaign}/macbook-air-midnight-shell.webp`, alt: "MacBook Air contoured unibody aluminum profile" }, tone: "light", layout: "stage" },
      { id: "display", label: "Liquid Retina", title: "A brilliant window for your ideas.", copy: "The stunning Liquid Retina display supports 1 billion colors, 500 nits of peak brightness, and P3 wide color gamut. Whether reviewing high-resolution photographic shoots, editing 4K footage, or drafting complex proposals, contrast is deep and text is razor-sharp.", image: { src: `${campaign}/macbook-air-cutout.webp`, alt: "MacBook Air Liquid Retina display screen" }, tone: "blue", layout: "split" },
      { id: "thermal", label: "Fanless Silence", title: "Total quiet. Zero distraction.", copy: "Thanks to the remarkable power efficiency of Apple Silicon, MacBook Air stays completely cool and whisper-quiet without a cooling fan. Tackle heavy multi-tab web research, photo libraries, and intensive coding sessions in complete, uninterrupted acoustic peace.", image: { src: `${campaign}/macbook-air-starlight-studio.jpg`, alt: "MacBook Air fanless architecture and keyboard deck" }, tone: "light", layout: "stage" },
      { id: "workflow", label: "Everyday Ambition", title: "Engineered for Ghana's brightest creators.", copy: "From student lecture halls at Legon to tech hubs across Osu, Airport City, and Ridge, MacBook Air delivers all-day 18-hour battery endurance. Work untethered through power fluctuations with full confidence and trusted warranty support from Buy & Sell GH in Dome Pillar 2.", image: { src: `${campaign}/macbook-air-cinematic.webp`, alt: "MacBook Air professional workstation in Accra" }, tone: "light", layout: "split" },
      { id: "connectivity", label: "MagSafe & Ports", title: "Snap into power. Connect to everything.", copy: "The color-matched MagSafe 3 charging port releases safely if stepped on, protecting your investment. With two ultra-fast Thunderbolt ports available for external 6K studio displays and rapid NVMe storage arrays, your desktop workspace expands effortlessly.", image: { src: `${campaign}/accessory-macbook-charger.webp`, alt: "MacBook MagSafe 3 magnetic connector and Thunderbolt ports" }, tone: "light", layout: "stage" },
      { id: "two-sizes", label: "13-inch & 15-inch", title: "Two perfect sizes. One seamless experience.", copy: "Choose the featherlight 13-inch model for unmatched everyday portability, or step up to the expansive 15-inch canvas for effortless side-by-side window multitasking and a room-filling six-speaker sound system with force-cancelling woofers.", image: { src: `${campaign}/macbook-pro-cinematic.webp`, alt: "MacBook Pro and MacBook Air comparative displays" }, tone: "blue", layout: "split" },
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
    buyPath: "/shop/buy-mac/mac-mini",
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
    eyebrow: "Fresh Air",
    tagline: "Light. Speed. Two sizes. Endless possibilities.",
    buyPath: "/shop/buy-ipad/ipad-air",
    hero: { src: `${campaign}/ipad-air-cinematic.webp`, alt: "iPad Air in vibrant anodized finishes floating above studio reflective stage" },
    heroTone: "light",
    highlights: [
      { label: "Two Sizes", title: "11-inch or all-new 13-inch. Infinite room for thought.", image: { src: `${campaign}/ipad-air-cinematic.webp`, alt: "iPad Air 11-inch and 13-inch displayed together" }, tone: "light" },
      { label: "Apple Silicon", title: "M-Series power unleashed for Apple Intelligence.", image: { src: `${campaign}/ipad-air-11.webp`, alt: "iPad Air Liquid Retina display showing graphics workflow" }, tone: "light" },
      { label: "Apple Pencil Pro", title: "Squeeze, barrel roll, and haptics for boundless artistry.", image: { src: `${campaign}/ipad-air-blue.webp`, alt: "iPad Air in Blue with edge-to-edge Liquid Retina canvas" }, tone: "blue" },
      { label: "Magic Keyboard", title: "Floating cantilever design with function keys and trackpad.", image: { src: `${campaign}/ipad-keyboard-accessory.webp`, alt: "iPad Magic Keyboard accessory with trackpad and backlit keyboard" }, tone: "ink" },
      { label: "Colour Palette", title: "Four exquisite anodized finishes in recycled aluminum.", image: { src: `${campaign}/ipad-air-colors.webp`, alt: "iPad Air color range showing full palette" }, tone: "light" },
    ],
    chapters: [
      { id: "display", label: "Canvas", title: "Two sizes. Brilliant Liquid Retina.", copy: "Choose between the ultraportable 11-inch model and the expansive new 13-inch display offering 30 percent more viewable area. Built with anti-reflective coating, P3 wide colour gamut, and 500 nits of True Tone brilliance, every document, sketch comp, and streaming video renders with razor-sharp fidelity in indoor or outdoor Ghanaian light.", image: { src: `${campaign}/ipad-air-cinematic.webp`, alt: "iPad Air Liquid Retina display in studio light" }, tone: "light", layout: "stage" },
      { id: "performance", label: "Silicon", title: "M-Series power engineered for Apple Intelligence.", copy: "Driven by an 8-core CPU and 10-core GPU, iPad Air speeds through demanding tasks like 4K multi-stream video editing, architectural 3D rendering in SketchUp, and fluid gaming. The dedicated 16-core Neural Engine accelerates on-device AI workflows with instant responsiveness while maintaining true all-day battery endurance.", image: { src: `${campaign}/ipad-air-11.webp`, alt: "iPad Air 11-inch displaying intensive app workflow" }, tone: "sage", layout: "split" },
      { id: "pencil", label: "Input", title: "Apple Pencil Pro. Magic at your fingertips.", copy: "Unlock unprecedented creative control with squeeze sensing, barrel roll rotation for precision calligraphy, and tactile haptic feedback that simulates traditional drawing media. Magnetic pairing and charging keep your Apple Pencil Pro permanently charged and mounted to the chassis, ready for instant brainstorming.", image: { src: `${campaign}/ipad-air-blue.webp`, alt: "Blue iPad Air with magnetic Apple Pencil pairing edge" }, tone: "blue", layout: "split" },
      { id: "keyboard", label: "Workstation", title: "Magic Keyboard. Complete laptop versatility.", copy: "Snap iPad Air onto the floating cantilever Magic Keyboard to instantly transition into a dedicated production workstation. Enjoy backlit scissor-switch keys with 1mm travel, a dedicated 14-key function row, pass-through USB-C charging, and a responsive glass trackpad that makes spreadsheet editing and typing effortless.", image: { src: `${campaign}/ipad-keyboard-accessory.webp`, alt: "iPad Air mounted on Magic Keyboard floating cantilever" }, tone: "ink", layout: "stage" },
      { id: "connectivity", label: "Connectivity", title: "Superfast Wi-Fi 6E and eSIM 5G in Ghana.", copy: "Stay seamlessly connected on high-speed Wi-Fi 6E networks or configure cellular 5G with local eSIM profiles from MTN and Telecel Ghana. Enjoy blazing download rates, lag-free FaceTime HD calls with Center Stage camera framing, and instant cloud sync whether working from airport lounges, co-working studios, or home.", image: { src: `${campaign}/ipad-air-space-gray.webp`, alt: "Space Gray iPad Air positioned on modern desk setup" }, tone: "light", layout: "split" },
      { id: "craft", label: "Materials", title: "Anodized aluminum in four expressive finishes.", copy: "Precision-machined from 100 percent recycled aluminum enclosures, iPad Air pairs structural rigidity with a featherlight profile weighing around one pound. Explore fresh colorways including Blue, Purple, Starlight, and Space Gray — each detailed with fine acoustic speaker grilles and integrated Touch ID power buttons.", image: { src: `${campaign}/ipad-air-colors.webp`, alt: "iPad Air anodized aluminum color finishes arrayed in studio" }, tone: "plum", layout: "split" },
    ],
    information: {
      eyebrow: "EVERYTHING TO KNOW",
      title: "The versatile powerhouse built for modern creators.",
      intro: "iPad Air brings together expansive Liquid Retina displays, pro-grade Apple Silicon, full desktop-class accessory support, and all-day battery life for students, designers, and entrepreneurs in Ghana.",
      items: [
        {
          category: "PORTABLE CANVAS",
          heading: "Two sizes. Endless creative versatility.",
          description: "The 11-inch model offers featherweight portability for reading and travel, while the 13-inch model provides 30 percent more room for split-view multitasking, full-score musical arrangements, and expansive digital illustration.",
        },
        {
          category: "APPLE SILICON & AI",
          heading: "Blazing CPU speed with 16-core Neural Engine.",
          description: "Process intensive photo retouching in Adobe Lightroom, compose complex multitrack audio in Logic Pro, and execute on-device AI operations with remarkable efficiency and up to 10 hours of uninterrupted battery performance.",
        },
        {
          category: "PRO ACCESSORY ECOSYSTEM",
          heading: "Seamless Apple Pencil Pro and Magic Keyboard pairing.",
          description: "Magnetically snap Apple Pencil Pro to charge instantly while enjoying squeeze sensors and haptic feedback. Attach the Magic Keyboard for an authentic laptop experience with dedicated shortcut keys and precision trackpad.",
        },
        {
          category: "ACCRA FULFILLMENT & TRUST",
          heading: "Same-day delivery and authentic Apple warranty.",
          description: "Every iPad Air purchased through Buy & Sell GH includes authentic Apple international warranty coverage, free in-person collection at Dome Pillar 2, Accra, or rapid doorstep dispatch with secure Mobile Money payment confirmation.",
        },
      ],
    },
  },
};
