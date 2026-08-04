import tradeInBanner from "../assets/banners/trade-in-upgrade.png";

export interface Promotion {
  id: string;
  title: string;
  description: string;
  buttonText: string;
  buttonLink: string;
  bannerImage: string;
  backgroundStyle: string;
  startDate?: string;
  endDate?: string;
  isActive: boolean;
}

export const promotions: Promotion[] = [
  {
    id: "trade-in-upgrade",
    title: "Trade In and Upgrade",
    description: "Use the value of your current phone toward your next device.",
    buttonText: "Start a Trade-In",
    buttonLink: "/sell-or-trade",
    bannerImage: tradeInBanner,
    backgroundStyle: "gold",
    startDate: "",
    endDate: "",
    isActive: false,
  },
];
