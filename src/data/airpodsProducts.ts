import airpods2 from "../assets/products/airpods-2nd-generation-premium.webp";
import airpods3 from "../assets/products/airpods-3rd-generation-premium.webp";
import airpods4 from "../assets/products/airpods-4-premium.webp";
import airpods4Anc from "../assets/products/airpods-4-anc-premium.webp";
import airpodsPro1 from "../assets/products/airpods-pro-1-premium.webp";
import airpodsPro2 from "../assets/products/airpods-pro-2-premium.webp";
import airpodsPro3 from "../assets/products/airpods-pro-3-premium.webp";
import airpodsMaxLightning from "../assets/products/airpods-max-lightning-premium.webp";
import airpodsMaxUsbC from "../assets/products/airpods-max-usb-c-premium.webp";
import airpodsMax2 from "../assets/products/airpods-max-2-premium.webp";
import type { Product } from "../types/product";

interface CatalogueAirpodsInput {
  slug: string;
  name: string;
  family: "AirPods" | "AirPods Pro" | "AirPods Max";
  generation: string;
  image: string;
  caseOptions: string[];
  colors: string[];
  specs: string[];
  includedItems: string[];
}

const createCatalogueAirpods = ({ slug, name, family, generation, image, caseOptions, colors, specs, includedItems }: CatalogueAirpodsInput): Product => ({
  id: slug,
  slug,
  name,
  category: "AirPods",
  subcategory: family,
  brand: "Apple",
  model: name,
  generation,
  price: 0,
  priceOnRequest: true,
  storage: caseOptions,
  condition: "To Confirm",
  colors,
  defaultColor: colors[0],
  stockStatus: "Out of Stock",
  stockQuantity: 0,
  available: true,
  imageTone: "from-stone-100 via-white to-yellow-100",
  badges: [],
  tags: ["airpods", family.toLowerCase(), name.toLowerCase(), generation.toLowerCase(), "contact for price"],
  images: [{ src: image, alt: `${name} premium product image for Buy & Sell GH` }],
  warrantyInfo: "Warranty terms are confirmed when inventory is configured.",
  deliveryNote: "Availability, price, condition, case configuration, pickup and delivery details must be confirmed before payment.",
  conditionReport: ["Condition to be confirmed", "Stock to be confirmed", "Final model and case configuration are verified before payment"],
  description: `${name} catalogue listing with verified Apple generation, charging and audio feature information. Contact Buy & Sell GH to confirm current inventory, condition and price.`,
  specs,
  box: includedItems,
});

export const airpodsProducts: Product[] = [
  createCatalogueAirpods({
    slug: "airpods-2nd-generation", name: "AirPods (2nd generation)", family: "AirPods", generation: "2nd generation", image: airpods2,
    caseOptions: ["Lightning Charging Case"], colors: ["White"],
    specs: ["Apple H1 headphone chip", "Up to 5 hours of listening time on one charge", "Lightning Charging Case", "Bluetooth 5.0"],
    includedItems: ["AirPods (2nd generation)", "Lightning Charging Case", "Lightning to USB-A Cable"],
  }),
  createCatalogueAirpods({
    slug: "airpods-3rd-generation", name: "AirPods (3rd generation)", family: "AirPods", generation: "3rd generation", image: airpods3,
    caseOptions: ["Lightning Charging Case", "MagSafe Charging Case"], colors: ["White"],
    specs: ["Apple H1 headphone chip", "Personalized Spatial Audio with dynamic head tracking", "Adaptive EQ", "Up to 6 hours of listening time on one charge", "Sweat and water resistant (IPX4)"],
    includedItems: ["AirPods (3rd generation)", "Selected Charging Case", "Lightning to USB-C Cable"],
  }),
  createCatalogueAirpods({
    slug: "airpods-4", name: "AirPods 4", family: "AirPods", generation: "4th generation", image: airpods4,
    caseOptions: ["USB-C Charging Case"], colors: ["White"],
    specs: ["Apple H2 headphone chip", "Personalized Spatial Audio with dynamic head tracking", "Voice Isolation", "Up to 5 hours of listening time on one charge", "Dust, sweat and water resistant (IP54)"],
    includedItems: ["AirPods 4", "USB-C Charging Case", "Documentation"],
  }),
  createCatalogueAirpods({
    slug: "airpods-4-anc", name: "AirPods 4 with Active Noise Cancellation", family: "AirPods", generation: "4th generation", image: airpods4Anc,
    caseOptions: ["USB-C Wireless Charging Case"], colors: ["White"],
    specs: ["Apple H2 headphone chip", "Active Noise Cancellation", "Adaptive Audio and Transparency mode", "Up to 4 hours of listening time with Active Noise Cancellation", "Dust, sweat and water resistant (IP54)"],
    includedItems: ["AirPods 4 with Active Noise Cancellation", "USB-C Charging Case with speaker", "Documentation"],
  }),
  createCatalogueAirpods({
    slug: "airpods-pro-1", name: "AirPods Pro (1st generation)", family: "AirPods Pro", generation: "1st generation", image: airpodsPro1,
    caseOptions: ["Lightning Charging Case"], colors: ["White"],
    specs: ["Apple H1 headphone chip", "Active Noise Cancellation", "Transparency mode", "Spatial Audio with dynamic head tracking", "Sweat and water resistant (IPX4)"],
    includedItems: ["AirPods Pro (1st generation)", "Lightning Charging Case", "Silicone ear tips", "Lightning to USB-C Cable"],
  }),
  createCatalogueAirpods({
    slug: "airpods-pro-2", name: "AirPods Pro 2", family: "AirPods Pro", generation: "2nd generation", image: airpodsPro2,
    caseOptions: ["USB-C MagSafe Charging Case"], colors: ["White"],
    specs: ["Apple H2 headphone chip", "Active Noise Cancellation", "Adaptive Audio and Transparency mode", "Up to 6 hours of listening time with Active Noise Cancellation", "Dust, sweat and water resistant (IP54)"],
    includedItems: ["AirPods Pro 2", "MagSafe Charging Case (USB-C)", "Silicone ear tips", "USB-C Charge Cable"],
  }),
  createCatalogueAirpods({
    slug: "airpods-pro-3", name: "AirPods Pro 3", family: "AirPods Pro", generation: "3rd generation", image: airpodsPro3,
    caseOptions: ["USB-C MagSafe Charging Case"], colors: ["White"],
    specs: ["Apple H2 headphone chip", "Active Noise Cancellation and Adaptive Audio", "Heart rate sensing during workouts", "Up to 8 hours of listening time with Active Noise Cancellation", "Dust, sweat and water resistant (IP57)"],
    includedItems: ["AirPods Pro 3", "MagSafe Charging Case (USB-C) with speaker and lanyard loop", "Silicone ear tips", "Documentation"],
  }),
  createCatalogueAirpods({
    slug: "airpods-max-lightning", name: "AirPods Max (Lightning)", family: "AirPods Max", generation: "1st generation", image: airpodsMaxLightning,
    caseOptions: ["Lightning"], colors: ["Silver", "Space Gray", "Sky Blue", "Pink", "Green"],
    specs: ["Apple H1 headphone chip in each ear cup", "Active Noise Cancellation and Transparency mode", "Personalized Spatial Audio with dynamic head tracking", "Up to 20 hours of listening time", "Lightning connector"],
    includedItems: ["AirPods Max (Lightning)", "Smart Case", "Lightning to USB-C Cable"],
  }),
  createCatalogueAirpods({
    slug: "airpods-max-usb-c", name: "AirPods Max (USB-C)", family: "AirPods Max", generation: "1st generation", image: airpodsMaxUsbC,
    caseOptions: ["USB-C"], colors: ["Midnight", "Starlight", "Blue", "Purple", "Orange"],
    specs: ["Apple H1 headphone chip in each ear cup", "Active Noise Cancellation and Transparency mode", "Personalized Spatial Audio with dynamic head tracking", "Up to 20 hours of listening time", "USB-C connector"],
    includedItems: ["AirPods Max (USB-C)", "Smart Case", "USB-C Charge Cable"],
  }),
  createCatalogueAirpods({
    slug: "airpods-max-2", name: "AirPods Max 2", family: "AirPods Max", generation: "2nd generation", image: airpodsMax2,
    caseOptions: ["USB-C"], colors: ["Midnight", "Starlight", "Blue", "Purple", "Orange"],
    specs: ["Apple H2 headphone chip in each ear cup", "Active Noise Cancellation", "Adaptive Audio and Transparency mode", "Lossless Audio and ultra-low latency audio via USB-C", "USB-C connector"],
    includedItems: ["AirPods Max 2", "Smart Case", "USB-C Charge Cable"],
  }),
];
