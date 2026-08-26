import macMiniLaunchImage from "../assets/homepage/homepage-mac-mini-m6-launch.webp";
import macStudioLaunchImage from "../assets/homepage/homepage-mac-studio-m5-launch.webp";

export type NewMacLaunchKey = "mac-mini" | "mac-studio";

export type NewMacLaunch = {
  key: NewMacLaunchKey;
  name: string;
  chips: string;
  subtitle: string;
  preorderModel: string;
  learnMoreTo: string;
  preorderTo: string;
  image: string;
  imageAlt: string;
  theme: "light" | "dark";
};

export const newMacLaunches: Record<NewMacLaunchKey, NewMacLaunch> = {
  "mac-mini": {
    key: "mac-mini",
    name: "Mac mini",
    chips: "M6 and M5 Pro",
    subtitle: "Now with M6 and M5 Pro.",
    preorderModel: "Mac mini (M6 or M5 Pro)",
    learnMoreTo: "/mac-mini",
    preorderTo: "/pre-order?category=Mac&model=Mac%20mini%20(M6%20or%20M5%20Pro)",
    image: macMiniLaunchImage,
    imageAlt: "Original Buy and Sell GH studio render of the new silver Mac mini",
    theme: "light",
  },
  "mac-studio": {
    key: "mac-studio",
    name: "Mac Studio",
    chips: "M5 Max and M5 Ultra",
    subtitle: "Now with M5 Max and M5 Ultra.",
    preorderModel: "Mac Studio (M5 Max or M5 Ultra)",
    learnMoreTo: "/mac-studio",
    preorderTo: "/pre-order?category=Mac&model=Mac%20Studio%20(M5%20Max%20or%20M5%20Ultra)",
    image: macStudioLaunchImage,
    imageAlt: "Original Buy and Sell GH cinematic render of the new silver Mac Studio",
    theme: "dark",
  },
};
