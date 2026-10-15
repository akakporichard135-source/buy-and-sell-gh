import { newMacLaunches } from "./newMacLaunches";

export interface MacStudioPanel {
  id: string;
  enabled: boolean;
  eyebrow: string;
  title: string;
  description: string;
  icon: "zap" | "cpu" | "sparkles" | "braces" | "workflow";
  facts: string[];
  tone: "light" | "dark" | "gold" | "blue";
}

export interface MacStudioStory {
  slug: "mac-studio";
  name: string;
  eyebrow: string;
  chips: string;
  availability: string;
  image: { src: string; alt: string; mobileSrc: string };
  preorderLabel: string;
  preorderTo: string;
  exploreLabel: string;
  exploreTo: string;
  panels: MacStudioPanel[];
  conclusion: { eyebrow: string; title: string; body: string; buttonLabel: string; buttonTo: string };
}

const launch = newMacLaunches["mac-studio"];

export const macStudioStory: MacStudioStory = {
  slug: "mac-studio", name: launch.name, eyebrow: "New Mac · Pre-order", chips: launch.chips,
  availability: "Local availability and final pricing will be confirmed by Buy & Sell GH.",
  image: { src: launch.image, alt: launch.imageAlt, mobileSrc: "" },
  preorderLabel: `Pre-order ${launch.name}`, preorderTo: launch.preorderTo,
  exploreLabel: "Explore available Macs", exploreTo: "/macbooks",
  panels: [
    { id: "power", enabled: true, eyebrow: "Choose your power", title: "Built around demanding work.", description: "Mac Studio scales from advanced creative production to large on-device AI and technical workflows.", icon: "zap", facts: ["M5 Max for serious pro workflows", "M5 Ultra for the most intensive workloads", "Compact professional workstation design"], tone: "dark" },
    { id: "max", enabled: true, eyebrow: "M5 Max", title: "Creative and technical power.", description: "A high-performance option for video, 3D, development and accelerated local AI work.", icon: "cpu", facts: ["18-core CPU", "Up to 40-core GPU", "Up to 128GB unified memory"], tone: "gold" },
    { id: "ultra", enabled: true, eyebrow: "M5 Ultra", title: "Scale up the hardest projects.", description: "Designed for exceptionally large models, complex rendering and high-end professional media pipelines.", icon: "sparkles", facts: ["Up to 36-core CPU", "Up to 80-core GPU", "Up to 512GB unified memory"], tone: "blue" },
    { id: "workflows", enabled: true, eyebrow: "Pro workflows", title: "From first frame to final build.", description: "Handle professional video, 3D rendering, code compilation, game development and data-heavy projects.", icon: "braces", facts: ["Professional video workflows", "3D and visual effects", "Development and local model workloads"], tone: "dark" },
    { id: "connectivity", enabled: true, eyebrow: "Connectivity", title: "A workstation that connects broadly.", description: "High-bandwidth I/O supports fast storage, displays, expansion and advanced professional setups.", icon: "workflow", facts: ["Thunderbolt 5", "Wi-Fi 7 and Bluetooth 6", "Front and rear professional connectivity"], tone: "light" },
  ],
  conclusion: {
    eyebrow: "Buy & Sell GH pre-order", title: `Tell us which ${launch.name} you want.`,
    body: "Prepare your request now. Buy & Sell GH will confirm Ghana availability, configuration, price, payment and delivery details before anything is final.",
    buttonLabel: "Start pre-order", buttonTo: launch.preorderTo,
  },
};
