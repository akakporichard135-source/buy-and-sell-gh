import airpodsPro from "../assets/products/airpods-pro-premium.webp";
import appleWatch from "../assets/products/apple-watch-premium.webp";
import appleWatchSe2 from "../assets/products/apple-watch-se-2-premium.webp";
import appleWatchSe3 from "../assets/products/apple-watch-se-3-premium.webp";
import appleWatchSeries7 from "../assets/products/apple-watch-series-7-premium.webp";
import appleWatchSeries8 from "../assets/products/apple-watch-series-8-premium.webp";
import appleWatchSeries9 from "../assets/products/apple-watch-series-9-premium.webp";
import appleWatchSeries10 from "../assets/products/apple-watch-series-10-premium.webp";
import appleWatchSeries11 from "../assets/products/apple-watch-series-11-premium.webp";
import appleWatchUltra from "../assets/products/apple-watch-ultra-premium.webp";
import appleWatchUltra2 from "../assets/products/apple-watch-ultra-2-premium.webp";
import appleWatchUltra3 from "../assets/products/apple-watch-ultra-3-premium.webp";
import ipad10thGeneration from "../assets/products/ipad-10th-generation-premium.webp";
import ipad11thGeneration from "../assets/products/ipad-11th-generation-premium.webp";
import ipadAir5 from "../assets/products/ipad-air-5-premium.webp";
import ipadAir11M2 from "../assets/products/ipad-air-11-inch-m2-premium.webp";
import ipadAir11M3 from "../assets/products/ipad-air-11-inch-m3-premium.webp";
import ipadAir11M4 from "../assets/products/ipad-air-11-inch-m4-premium.webp";
import ipadAir13M2 from "../assets/products/ipad-air-13-inch-m2-premium.webp";
import ipadAir13M3 from "../assets/products/ipad-air-13-inch-m3-premium.webp";
import ipadAir13M4 from "../assets/products/ipad-air-13-inch-m4-premium.webp";
import ipadMini6 from "../assets/products/ipad-mini-6-premium.webp";
import ipadMini7 from "../assets/products/ipad-mini-7-premium.webp";
import ipadPro11M2 from "../assets/products/ipad-pro-11-inch-m2-premium.webp";
import ipadPro11M4 from "../assets/products/ipad-pro-11-inch-m4-premium.webp";
import ipadPro11M5 from "../assets/products/ipad-pro-11-inch-m5-premium.webp";
import ipadPro129M2 from "../assets/products/ipad-pro-12-9-inch-m2-premium.webp";
import ipadPro13M4 from "../assets/products/ipad-pro-13-inch-m4-premium.webp";
import ipadPro13M5 from "../assets/products/ipad-pro-13-inch-m5-premium.webp";
import ipadPro from "../assets/products/ipad-pro-premium.webp";
import iphone11ProMax from "../assets/products/iphone-11-pro-max-premium.webp";
import iphone12Mini from "../assets/products/iphone-12-mini-premium.webp";
import iphone12 from "../assets/products/iphone-12-premium.webp";
import iphone12Pro from "../assets/products/iphone-12-pro-premium.webp";
import iphone12ProMax from "../assets/products/iphone-12-pro-max-premium.webp";
import iphone13Mini from "../assets/products/iphone-13-mini-premium.webp";
import iphone13 from "../assets/products/iphone-13-premium.webp";
import iphone13Pro from "../assets/products/iphone-13-pro-premium.webp";
import iphone13ProMax from "../assets/products/iphone-13-pro-max-premium.webp";
import iphone14 from "../assets/products/iphone-14-premium.webp";
import iphone14Plus from "../assets/products/iphone-14-plus-premium.webp";
import iphone14Pro from "../assets/products/iphone-14-pro-premium.webp";
import iphone14ProMax from "../assets/products/iphone-14-pro-max-premium.webp";
import iphone15 from "../assets/products/iphone-15-premium.webp";
import iphone15Plus from "../assets/products/iphone-15-plus-premium.webp";
import iphone15Pro from "../assets/products/iphone-15-pro-premium.webp";
import iphone15ProMax from "../assets/products/iphone-15-pro-max-premium.webp";
import iphone16e from "../assets/products/iphone-16e-premium.webp";
import iphone16 from "../assets/products/iphone-16-premium.webp";
import iphone16Plus from "../assets/products/iphone-16-plus-premium.webp";
import iphone16Pro from "../assets/products/iphone-16-pro-premium.webp";
import iphone16ProMax from "../assets/products/iphone-16-pro-max-premium.webp";
import iphone17 from "../assets/products/iphone-17-premium.webp";
import iphoneAir from "../assets/products/iphone-air-premium.webp";
import iphone17Pro from "../assets/products/iphone-17-pro-premium.webp";
import iphone17ProMax from "../assets/products/iphone-17-pro-max-premium.webp";
import type { Product, ProductCategory, ProductCondition } from "../types/product";
import { accessoryProducts } from "./accessoryProducts";
import { airpodsProducts } from "./airpodsProducts";
import { macbookProducts } from "./macbookProducts";

export const categories: ProductCategory[] = [
  "Phones",
  "iPhones",
  "Tablets",
  "iPads",
  "Watches",
  "Apple Watches",
  "Audio",
  "AirPods",
  "Laptops",
  "MacBooks",
  "Game Consoles",
  "Accessories",
  "UK Used Devices",
  "Brand New Devices",
];

export const conditions: ProductCondition[] = ["Brand New", "UK Used", "Excellent", "Very Good", "To Confirm"];

interface CatalogueIphoneInput {
  slug: string;
  name: string;
  generation: string;
  image: string;
  storage: string[];
  colors: string[];
  specs: string[];
  includedItems: string[];
}

const createCatalogueIphone = ({ slug, name, generation, image, storage, colors, specs, includedItems }: CatalogueIphoneInput): Product => ({
  id: slug,
  slug,
  name,
  category: "iPhones",
  brand: "Apple",
  model: name,
  generation,
  price: 0,
  priceOnRequest: true,
  storage,
  condition: "To Confirm",
  colors,
  defaultColor: colors[0],
  stockStatus: "Out of Stock",
  stockQuantity: 0,
  available: true,
  imageTone: "from-stone-100 via-white to-yellow-100",
  badges: [],
  tags: ["iphone", name.toLowerCase(), generation.toLowerCase(), "contact for price"],
  images: [{ src: image, alt: `${name} premium product image for Buy & Sell GH` }],
  warrantyInfo: "Warranty terms are confirmed when inventory is configured.",
  deliveryNote: "Availability, price, condition, pickup and delivery details must be confirmed before payment.",
  conditionReport: ["Condition to be confirmed", "Stock to be confirmed", "Final unit details are verified before payment"],
  description: `${name} catalogue listing with verified Apple storage and colour options. Contact Buy & Sell GH to confirm current inventory, condition and price.`,
  specs,
  box: includedItems,
});

interface CatalogueIpadInput {
  slug: string;
  name: string;
  generation: string;
  subcategory: "iPad" | "iPad mini" | "iPad Air" | "iPad Pro";
  image: string;
  storage: string[];
  colors: string[];
  specs: string[];
  includedItems: string[];
}

const createCatalogueIpad = ({ slug, name, generation, subcategory, image, storage, colors, specs, includedItems }: CatalogueIpadInput): Product => ({
  id: slug,
  slug,
  name,
  category: "iPads",
  subcategory,
  brand: "Apple",
  model: name,
  generation,
  price: 0,
  priceOnRequest: true,
  storage,
  condition: "To Confirm",
  colors,
  defaultColor: colors[0],
  stockStatus: "Out of Stock",
  stockQuantity: 0,
  available: true,
  imageTone: "from-stone-100 via-white to-yellow-100",
  badges: [],
  tags: ["ipad", subcategory.toLowerCase(), name.toLowerCase(), generation.toLowerCase(), "contact for price"],
  images: [{ src: image, alt: `${name} premium product image for Buy & Sell GH` }],
  warrantyInfo: "Warranty terms are confirmed when inventory is configured.",
  deliveryNote: "Availability, price, condition, pickup and delivery details must be confirmed before payment.",
  conditionReport: ["Condition to be confirmed", "Stock to be confirmed", "Final unit details are verified before payment"],
  description: `${name} catalogue listing with verified Apple storage, colour and hardware details. Contact Buy & Sell GH to confirm current inventory, condition and price.`,
  specs,
  box: includedItems,
});

interface CatalogueWatchInput {
  slug: string;
  name: string;
  generation: string;
  subcategory: "Apple Watch SE" | "Apple Watch Series" | "Apple Watch Ultra";
  image: string;
  connectivity: string[];
  colors: string[];
  specs: string[];
  includedItems: string[];
}

const createCatalogueWatch = ({ slug, name, generation, subcategory, image, connectivity, colors, specs, includedItems }: CatalogueWatchInput): Product => ({
  id: slug,
  slug,
  name,
  category: "Apple Watches",
  subcategory,
  brand: "Apple",
  model: name,
  generation,
  price: 0,
  priceOnRequest: true,
  storage: connectivity,
  condition: "To Confirm",
  colors,
  defaultColor: colors[0],
  stockStatus: "Out of Stock",
  stockQuantity: 0,
  available: true,
  imageTone: "from-stone-100 via-white to-yellow-100",
  badges: [],
  tags: ["apple watch", subcategory.toLowerCase(), name.toLowerCase(), generation.toLowerCase(), "contact for price"],
  images: [{ src: image, alt: `${name} premium product image for Buy & Sell GH` }],
  warrantyInfo: "Warranty terms are confirmed when inventory is configured.",
  deliveryNote: "Availability, price, condition, pickup and delivery details must be confirmed before payment.",
  conditionReport: ["Condition to be confirmed", "Stock to be confirmed", "Final unit details are verified before payment"],
  description: `${name} catalogue listing with verified Apple case, connectivity, finish and hardware details. Contact Buy & Sell GH to confirm current inventory, condition and price.`,
  specs,
  box: includedItems,
});

// Draft catalogue values are intentionally centralized here so the owner can replace prices and product details later.
export const products: Product[] = [
  createCatalogueIphone({
    slug: "iphone-17-pro-max", name: "iPhone 17 Pro Max", generation: "iPhone 17", image: iphone17ProMax,
    storage: ["256GB", "512GB", "1TB", "2TB"], colors: ["Silver", "Cosmic Orange", "Deep Blue"],
    specs: ["6.9-inch Super Retina XDR display", "A19 Pro chip", "Triple 48MP Fusion camera system", "USB-C charging"],
    includedItems: ["iPhone 17 Pro Max", "USB-C cable", "Documentation"],
  }),
  createCatalogueIphone({
    slug: "iphone-17-pro", name: "iPhone 17 Pro", generation: "iPhone 17", image: iphone17Pro,
    storage: ["256GB", "512GB", "1TB"], colors: ["Silver", "Cosmic Orange", "Deep Blue"],
    specs: ["6.3-inch Super Retina XDR display", "A19 Pro chip", "Triple 48MP Fusion camera system", "USB-C charging"],
    includedItems: ["iPhone 17 Pro", "USB-C cable", "Documentation"],
  }),
  createCatalogueIphone({
    slug: "iphone-air", name: "iPhone Air", generation: "iPhone 17", image: iphoneAir,
    storage: ["256GB", "512GB", "1TB"], colors: ["Space Black", "Cloud White", "Light Gold", "Sky Blue"],
    specs: ["6.5-inch Super Retina XDR display", "A19 Pro chip", "48MP Fusion camera", "USB-C charging"],
    includedItems: ["iPhone Air", "USB-C cable", "Documentation"],
  }),
  createCatalogueIphone({
    slug: "iphone-17", name: "iPhone 17", generation: "iPhone 17", image: iphone17,
    storage: ["256GB", "512GB"], colors: ["Black", "White", "Mist Blue", "Sage", "Lavender"],
    specs: ["6.3-inch Super Retina XDR display", "A19 chip", "Dual Fusion camera system", "USB-C charging"],
    includedItems: ["iPhone 17", "USB-C cable", "Documentation"],
  }),
  createCatalogueIphone({
    slug: "iphone-16-plus", name: "iPhone 16 Plus", generation: "iPhone 16", image: iphone16Plus,
    storage: ["128GB", "256GB", "512GB"], colors: ["Black", "White", "Pink", "Teal", "Ultramarine"],
    specs: ["6.7-inch Super Retina XDR display", "A18 chip", "Dual camera system", "USB-C charging"],
    includedItems: ["iPhone 16 Plus", "USB-C cable", "Documentation"],
  }),
  createCatalogueIphone({
    slug: "iphone-16", name: "iPhone 16", generation: "iPhone 16", image: iphone16,
    storage: ["128GB", "256GB", "512GB"], colors: ["Black", "White", "Pink", "Teal", "Ultramarine"],
    specs: ["6.1-inch Super Retina XDR display", "A18 chip", "Dual camera system", "USB-C charging"],
    includedItems: ["iPhone 16", "USB-C cable", "Documentation"],
  }),
  createCatalogueIphone({
    slug: "iphone-16e", name: "iPhone 16e", generation: "iPhone 16", image: iphone16e,
    storage: ["128GB", "256GB", "512GB"], colors: ["Black", "White"],
    specs: ["6.1-inch Super Retina XDR display", "A18 chip", "48MP Fusion camera", "USB-C charging"],
    includedItems: ["iPhone 16e", "USB-C cable", "Documentation"],
  }),
  createCatalogueIphone({
    slug: "iphone-15-pro", name: "iPhone 15 Pro", generation: "iPhone 15", image: iphone15Pro,
    storage: ["128GB", "256GB", "512GB", "1TB"], colors: ["Black Titanium", "White Titanium", "Blue Titanium", "Natural Titanium"],
    specs: ["6.1-inch Super Retina XDR display", "A17 Pro chip", "Pro camera system", "USB-C charging"],
    includedItems: ["iPhone 15 Pro", "USB-C cable", "Documentation"],
  }),
  createCatalogueIphone({
    slug: "iphone-15-plus", name: "iPhone 15 Plus", generation: "iPhone 15", image: iphone15Plus,
    storage: ["128GB", "256GB", "512GB"], colors: ["Black", "Blue", "Green", "Yellow", "Pink"],
    specs: ["6.7-inch Super Retina XDR display", "A16 Bionic chip", "Dual camera system", "USB-C charging"],
    includedItems: ["iPhone 15 Plus", "USB-C cable", "Documentation"],
  }),
  createCatalogueIphone({
    slug: "iphone-14-pro", name: "iPhone 14 Pro", generation: "iPhone 14", image: iphone14Pro,
    storage: ["128GB", "256GB", "512GB", "1TB"], colors: ["Space Black", "Silver", "Gold", "Deep Purple"],
    specs: ["6.1-inch Super Retina XDR display", "A16 Bionic chip", "Pro camera system", "Lightning connector"],
    includedItems: ["iPhone 14 Pro", "USB-C to Lightning cable", "Documentation"],
  }),
  createCatalogueIphone({
    slug: "iphone-14-plus", name: "iPhone 14 Plus", generation: "iPhone 14", image: iphone14Plus,
    storage: ["128GB", "256GB", "512GB"], colors: ["Midnight", "Purple", "Starlight", "Red", "Blue", "Yellow"],
    specs: ["6.7-inch Super Retina XDR display", "A15 Bionic chip", "Dual camera system", "Lightning connector"],
    includedItems: ["iPhone 14 Plus", "USB-C to Lightning cable", "Documentation"],
  }),
  createCatalogueIphone({
    slug: "iphone-14", name: "iPhone 14", generation: "iPhone 14", image: iphone14,
    storage: ["128GB", "256GB", "512GB"], colors: ["Midnight", "Purple", "Starlight", "Red", "Blue", "Yellow"],
    specs: ["6.1-inch Super Retina XDR display", "A15 Bionic chip", "Dual camera system", "Lightning connector"],
    includedItems: ["iPhone 14", "USB-C to Lightning cable", "Documentation"],
  }),
  createCatalogueIphone({
    slug: "iphone-13-pro", name: "iPhone 13 Pro", generation: "iPhone 13", image: iphone13Pro,
    storage: ["128GB", "256GB", "512GB", "1TB"], colors: ["Graphite", "Gold", "Silver", "Sierra Blue", "Alpine Green"],
    specs: ["6.1-inch Super Retina XDR display", "A15 Bionic chip", "Pro camera system", "Lightning connector"],
    includedItems: ["iPhone 13 Pro", "USB-C to Lightning cable", "Documentation"],
  }),
  createCatalogueIphone({
    slug: "iphone-13", name: "iPhone 13", generation: "iPhone 13", image: iphone13,
    storage: ["128GB", "256GB", "512GB"], colors: ["Pink", "Blue", "Midnight", "Starlight", "Red", "Green"],
    specs: ["6.1-inch Super Retina XDR display", "A15 Bionic chip", "Dual camera system", "Lightning connector"],
    includedItems: ["iPhone 13", "USB-C to Lightning cable", "Documentation"],
  }),
  createCatalogueIphone({
    slug: "iphone-13-mini", name: "iPhone 13 mini", generation: "iPhone 13", image: iphone13Mini,
    storage: ["128GB", "256GB", "512GB"], colors: ["Pink", "Blue", "Midnight", "Starlight", "Red", "Green"],
    specs: ["5.4-inch Super Retina XDR display", "A15 Bionic chip", "Dual camera system", "Lightning connector"],
    includedItems: ["iPhone 13 mini", "USB-C to Lightning cable", "Documentation"],
  }),
  createCatalogueIphone({
    slug: "iphone-12-pro", name: "iPhone 12 Pro", generation: "iPhone 12", image: iphone12Pro,
    storage: ["128GB", "256GB", "512GB"], colors: ["Silver", "Graphite", "Gold", "Pacific Blue"],
    specs: ["6.1-inch Super Retina XDR display", "A14 Bionic chip", "Pro camera system", "Lightning connector"],
    includedItems: ["iPhone 12 Pro", "USB-C to Lightning cable", "Documentation"],
  }),
  createCatalogueIphone({
    slug: "iphone-12", name: "iPhone 12", generation: "iPhone 12", image: iphone12,
    storage: ["64GB", "128GB", "256GB"], colors: ["Black", "White", "Red", "Green", "Blue", "Purple"],
    specs: ["6.1-inch Super Retina XDR display", "A14 Bionic chip", "Dual camera system", "Lightning connector"],
    includedItems: ["iPhone 12", "USB-C to Lightning cable", "Documentation"],
  }),
  createCatalogueIphone({
    slug: "iphone-12-mini", name: "iPhone 12 mini", generation: "iPhone 12", image: iphone12Mini,
    storage: ["64GB", "128GB", "256GB"], colors: ["Black", "White", "Red", "Green", "Blue", "Purple"],
    specs: ["5.4-inch Super Retina XDR display", "A14 Bionic chip", "Dual camera system", "Lightning connector"],
    includedItems: ["iPhone 12 mini", "USB-C to Lightning cable", "Documentation"],
  }),
  {
    id: "iphone-16-pro-max",
    name: "iPhone 16 Pro Max",
    slug: "iphone-16-pro-max",
    category: "iPhones",
    brand: "Apple",
    model: "iPhone 16 Pro Max",
    generation: "iPhone 16",
    price: 20500,
    oldPrice: 21800,
    storage: ["256GB", "512GB", "1TB"],
    condition: "Brand New",
    colors: ["Desert Titanium", "Natural Titanium", "Black Titanium"],
    stockStatus: "Low Stock",
    stockQuantity: 2,
    imageTone: "from-stone-200 via-zinc-100 to-yellow-100",
    badge: "New Arrival",
    badges: ["New Arrival", "Low Stock", "Brand New"],
    isPopular: true,
    isNewArrival: true,
    isFeatured: true,
    tags: ["iphone", "iphone 16", "pro max", "titanium", "brand new", "limited stock"],
    images: [{ src: iphone16ProMax, alt: "iPhone 16 Pro Max product render for Buy & Sell GH" }],
    faceIdStatus: "Working",
    simStatus: "Unlocked options to confirm",
    warrantyInfo: "Warranty terms are confirmed per unit before payment.",
    deliveryNote: "Pickup in Dome or delivery options can be confirmed on WhatsApp.",
    conditionReport: ["Brand new unit options", "Cosmetic condition confirmed before payment", "Accessories depend on selected unit"],
    description: "A flagship Apple device with premium performance, strong camera features and elegant titanium finishes.",
    specs: ["6.9-inch Super Retina XDR display", "A18 Pro chip", "Pro camera system", "USB-C charging"],
    box: ["Device", "USB-C cable", "SIM pin where applicable"],
  },
  {
    id: "iphone-16-pro",
    name: "iPhone 16 Pro",
    slug: "iphone-16-pro",
    category: "iPhones",
    brand: "Apple",
    model: "iPhone 16 Pro",
    generation: "iPhone 16",
    price: 17800,
    storage: ["128GB", "256GB", "512GB"],
    condition: "Brand New",
    colors: ["Natural Titanium", "White Titanium", "Black Titanium"],
    stockStatus: "In Stock",
    stockQuantity: 4,
    imageTone: "from-neutral-100 via-slate-100 to-zinc-300",
    badges: ["New Arrival", "Popular Choice", "Brand New"],
    isPopular: true,
    isNewArrival: true,
    tags: ["iphone", "iphone 16 pro", "128gb", "256gb", "titanium", "brand new"],
    images: [{ src: iphone16Pro, alt: "iPhone 16 Pro product render for Buy & Sell GH" }],
    faceIdStatus: "Working",
    simStatus: "Unlocked options to confirm",
    warrantyInfo: "Warranty terms are confirmed per unit before payment.",
    deliveryNote: "Pickup and delivery options are confirmed before an order request is finalized.",
    conditionReport: ["Brand new unit options", "Colour availability varies", "Final details confirmed by the shop"],
    description: "Compact Pro iPhone for customers who want flagship speed, cameras and a premium Apple feel.",
    specs: ["6.3-inch Super Retina XDR display", "A18 Pro chip", "ProMotion display", "USB-C charging"],
    box: ["Device", "USB-C cable"],
  },
  {
    id: "iphone-15-pro-max",
    name: "iPhone 15 Pro Max",
    slug: "iphone-15-pro-max",
    category: "iPhones",
    brand: "Apple",
    model: "iPhone 15 Pro Max",
    generation: "iPhone 15",
    price: 14500,
    oldPrice: 15500,
    storage: ["256GB", "512GB"],
    condition: "UK Used",
    colors: ["Natural Titanium", "Blue Titanium", "Black Titanium"],
    stockStatus: "In Stock",
    stockQuantity: 5,
    imageTone: "from-blue-100 via-zinc-100 to-stone-200",
    badge: "Popular Choice",
    badges: ["Popular Choice", "UK Used", "Excellent Condition"],
    isPopular: true,
    tags: ["iphone", "iphone 15 pro max", "256gb", "512gb", "natural titanium", "uk used"],
    images: [{ src: iphone15ProMax, alt: "iPhone 15 Pro Max product render for Buy & Sell GH" }],
    batteryHealth: "90%+ options available, confirm selected unit",
    faceIdStatus: "Working options available",
    simStatus: "Unlocked options available",
    warrantyInfo: "Contact the shop to confirm warranty for the selected unit.",
    deliveryNote: "Pickup in Dome or delivery options can be discussed on WhatsApp.",
    conditionReport: ["Clean UK used options", "Battery health varies by unit", "Physical inspection encouraged before payment"],
    description: "A high-demand UK used option with strong battery choices and Pro Max camera quality.",
    specs: ["6.7-inch Super Retina XDR display", "A17 Pro chip", "Titanium design", "Action Button"],
    box: ["Device", "Charging cable where available"],
  },
  {
    id: "iphone-15",
    name: "iPhone 15",
    slug: "iphone-15",
    category: "iPhones",
    brand: "Apple",
    model: "iPhone 15",
    generation: "iPhone 15",
    price: 9800,
    storage: ["128GB", "256GB"],
    condition: "Excellent",
    colors: ["Pink", "Blue", "Black", "Green"],
    stockStatus: "In Stock",
    stockQuantity: 7,
    imageTone: "from-pink-100 via-sky-100 to-zinc-100",
    badges: ["New Arrival", "Excellent Condition"],
    isNewArrival: true,
    tags: ["iphone 15", "128gb", "256gb", "pink", "blue", "excellent"],
    images: [{ src: iphone15, alt: "iPhone 15 product render for Buy & Sell GH" }],
    batteryHealth: "Confirm selected unit",
    faceIdStatus: "Working options available",
    simStatus: "Unlocked options available",
    warrantyInfo: "Warranty terms are confirmed per unit before purchase.",
    deliveryNote: "Pickup and delivery details are confirmed on WhatsApp.",
    conditionReport: ["Excellent condition options", "Colour availability can change", "Inspect before payment"],
    description: "A clean everyday iPhone for buyers who want modern Apple features at a balanced price.",
    specs: ["6.1-inch Super Retina XDR display", "Dynamic Island", "48MP main camera", "USB-C charging"],
    box: ["Device", "Charging cable where available"],
  },
  {
    id: "iphone-14-pro-max",
    name: "iPhone 14 Pro Max",
    slug: "iphone-14-pro-max",
    category: "iPhones",
    brand: "Apple",
    model: "iPhone 14 Pro Max",
    generation: "iPhone 14",
    price: 11200,
    storage: ["128GB", "256GB", "512GB"],
    condition: "UK Used",
    colors: ["Deep Purple", "Gold", "Silver", "Space Black"],
    stockStatus: "Low Stock",
    stockQuantity: 2,
    imageTone: "from-purple-100 via-yellow-100 to-zinc-200",
    badges: ["Popular Choice", "UK Used", "Low Stock"],
    isPopular: true,
    tags: ["iphone 14 pro max", "uk used", "deep purple", "gold", "128gb", "256gb"],
    images: [{ src: iphone14ProMax, alt: "iPhone 14 Pro Max product render for Buy & Sell GH" }],
    batteryHealth: "88%+ options available, confirm selected unit",
    faceIdStatus: "Working options available",
    simStatus: "Unlocked options available",
    warrantyInfo: "Contact the shop to confirm warranty for the selected unit.",
    deliveryNote: "Pickup in Dome or delivery options can be discussed on WhatsApp.",
    conditionReport: ["Large display Pro Max options", "Battery health varies by unit", "Inspection encouraged"],
    description: "Popular Pro Max option with a large display, strong battery life and premium build.",
    specs: ["6.7-inch Super Retina XDR display", "A16 Bionic chip", "Dynamic Island", "Pro camera system"],
    box: ["Device", "Charging cable where available"],
  },
  {
    id: "iphone-13-pro-max",
    name: "iPhone 13 Pro Max",
    slug: "iphone-13-pro-max",
    category: "iPhones",
    brand: "Apple",
    model: "iPhone 13 Pro Max",
    generation: "iPhone 13",
    price: 8200,
    storage: ["128GB", "256GB"],
    condition: "Very Good",
    colors: ["Sierra Blue", "Gold", "Graphite"],
    stockStatus: "In Stock",
    stockQuantity: 6,
    imageTone: "from-sky-100 via-zinc-100 to-yellow-100",
    badges: ["UK Used", "Popular Choice"],
    isPopular: true,
    tags: ["iphone 13 pro max", "uk used", "sierra blue", "gold", "128gb", "256gb"],
    images: [{ src: iphone13ProMax, alt: "iPhone 13 Pro Max product render for Buy & Sell GH" }],
    batteryHealth: "85%+ options available, confirm selected unit",
    faceIdStatus: "Working options available",
    simStatus: "Unlocked options available",
    warrantyInfo: "Contact the shop to confirm warranty for the selected unit.",
    deliveryNote: "Pickup and delivery options are confirmed before an order request is finalized.",
    conditionReport: ["Very good UK used options", "Screen and body condition vary by unit", "Physical inspection encouraged"],
    description: "Strong value Pro Max option for buyers who want size, camera quality and reliable performance.",
    specs: ["6.7-inch Super Retina XDR display", "A15 Bionic chip", "120Hz ProMotion", "Triple camera system"],
    box: ["Device"],
  },
  {
    id: "iphone-12-pro-max",
    name: "iPhone 12 Pro Max",
    slug: "iphone-12-pro-max",
    category: "iPhones",
    brand: "Apple",
    model: "iPhone 12 Pro Max",
    generation: "iPhone 12",
    price: 6400,
    storage: ["128GB", "256GB"],
    condition: "Very Good",
    colors: ["Pacific Blue", "Gold", "Graphite"],
    stockStatus: "Low Stock",
    stockQuantity: 1,
    imageTone: "from-cyan-100 via-zinc-100 to-amber-100",
    badges: ["UK Used", "Low Stock"],
    tags: ["iphone 12 pro max", "uk used", "pacific blue", "gold", "128gb", "low stock"],
    images: [{ src: iphone12ProMax, alt: "iPhone 12 Pro Max product render for Buy & Sell GH" }],
    batteryHealth: "Varies by unit",
    faceIdStatus: "Confirm selected unit",
    simStatus: "Confirm selected unit",
    warrantyInfo: "Contact the shop to confirm warranty for the selected unit.",
    deliveryNote: "Pickup and delivery details are confirmed on WhatsApp.",
    conditionReport: ["Value-focused Pro Max option", "Unit condition varies", "Inspection recommended before payment"],
    description: "Large-display UK used option for customers upgrading on a careful budget.",
    specs: ["6.7-inch Super Retina XDR display", "A14 Bionic chip", "5G capable", "MagSafe support"],
    box: ["Device"],
  },
  {
    id: "iphone-11-pro-max",
    name: "iPhone 11 Pro Max",
    slug: "iphone-11-pro-max",
    category: "iPhones",
    brand: "Apple",
    model: "iPhone 11 Pro Max",
    generation: "iPhone 11",
    price: 4700,
    storage: ["64GB", "256GB"],
    condition: "Very Good",
    colors: ["Midnight Green", "Space Gray", "Gold"],
    stockStatus: "Sold",
    stockQuantity: 0,
    imageTone: "from-emerald-100 via-zinc-100 to-yellow-100",
    badges: ["Sold", "UK Used"],
    tags: ["iphone 11 pro max", "uk used", "midnight green", "64gb", "sold out"],
    images: [{ src: iphone11ProMax, alt: "iPhone 11 Pro Max product render for Buy & Sell GH" }],
    batteryHealth: "Restock details to confirm",
    faceIdStatus: "Confirm when restocked",
    simStatus: "Confirm when restocked",
    warrantyInfo: "Warranty terms will be confirmed when the device is available.",
    deliveryNote: "Customers can request restock through WhatsApp.",
    conditionReport: ["Currently sold out", "Use WhatsApp enquiry to request restock", "Final unit details will be confirmed when available"],
    description: "Budget-friendly Pro Max option for buyers who want a premium Apple experience at a lower price.",
    specs: ["6.5-inch Super Retina XDR display", "A13 Bionic chip", "Triple camera system", "Face ID"],
    box: ["Device"],
  },
  createCatalogueIpad({
    slug: "ipad-10th-generation", name: "iPad (10th generation)", generation: "iPad 10th generation", subcategory: "iPad", image: ipad10thGeneration,
    storage: ["64GB", "256GB"], colors: ["Silver", "Blue", "Pink", "Yellow"],
    specs: ["10.9-inch Liquid Retina display", "A14 Bionic chip", "Touch ID in the top button", "USB-C connector"],
    includedItems: ["iPad (10th generation)", "USB-C Charge Cable"],
  }),
  createCatalogueIpad({
    slug: "ipad-a16", name: "iPad (A16)", generation: "iPad (A16)", subcategory: "iPad", image: ipad11thGeneration,
    storage: ["128GB", "256GB", "512GB"], colors: ["Silver", "Blue", "Pink", "Yellow"],
    specs: ["10.86-inch Liquid Retina display", "A16 chip", "Touch ID in the top button", "USB-C connector"],
    includedItems: ["iPad (A16)", "USB-C Charge Cable"],
  }),
  createCatalogueIpad({
    slug: "ipad-mini-6", name: "iPad mini (6th generation)", generation: "iPad mini 6", subcategory: "iPad mini", image: ipadMini6,
    storage: ["64GB", "256GB"], colors: ["Space Gray", "Pink", "Purple", "Starlight"],
    specs: ["8.3-inch Liquid Retina display", "A15 Bionic chip", "Touch ID in the top button", "USB-C connector"],
    includedItems: ["iPad mini (6th generation)", "USB-C Charge Cable"],
  }),
  createCatalogueIpad({
    slug: "ipad-mini-a17-pro", name: "iPad mini (A17 Pro)", generation: "iPad mini 7", subcategory: "iPad mini", image: ipadMini7,
    storage: ["128GB", "256GB", "512GB"], colors: ["Blue", "Purple", "Starlight", "Space Gray"],
    specs: ["8.3-inch Liquid Retina display", "A17 Pro chip", "Apple Pencil Pro support", "USB-C connector"],
    includedItems: ["iPad mini (A17 Pro)", "USB-C Charge Cable"],
  }),
  createCatalogueIpad({
    slug: "ipad-air-5", name: "iPad Air (5th generation)", generation: "iPad Air 5", subcategory: "iPad Air", image: ipadAir5,
    storage: ["64GB", "256GB"], colors: ["Space Gray", "Starlight", "Pink", "Purple", "Blue"],
    specs: ["10.9-inch Liquid Retina display", "Apple M1 chip", "Apple Pencil (2nd generation) support", "USB-C connector"],
    includedItems: ["iPad Air (5th generation)", "USB-C Charge Cable"],
  }),
  createCatalogueIpad({
    slug: "ipad-air-11-inch-m2", name: "iPad Air 11-inch (M2)", generation: "iPad Air M2", subcategory: "iPad Air", image: ipadAir11M2,
    storage: ["128GB", "256GB", "512GB", "1TB"], colors: ["Blue", "Purple", "Starlight", "Space Gray"],
    specs: ["11-inch Liquid Retina display", "Apple M2 chip", "Apple Pencil Pro support", "USB-C connector"],
    includedItems: ["iPad Air 11-inch (M2)", "USB-C Charge Cable"],
  }),
  createCatalogueIpad({
    slug: "ipad-air-13-inch-m2", name: "iPad Air 13-inch (M2)", generation: "iPad Air M2", subcategory: "iPad Air", image: ipadAir13M2,
    storage: ["128GB", "256GB", "512GB", "1TB"], colors: ["Blue", "Purple", "Starlight", "Space Gray"],
    specs: ["13-inch Liquid Retina display", "Apple M2 chip", "Apple Pencil Pro support", "USB-C connector"],
    includedItems: ["iPad Air 13-inch (M2)", "USB-C Charge Cable"],
  }),
  createCatalogueIpad({
    slug: "ipad-air-11-inch-m3", name: "iPad Air 11-inch (M3)", generation: "iPad Air M3", subcategory: "iPad Air", image: ipadAir11M3,
    storage: ["128GB", "256GB", "512GB", "1TB"], colors: ["Blue", "Purple", "Starlight", "Space Gray"],
    specs: ["11-inch Liquid Retina display", "Apple M3 chip", "Apple Pencil Pro support", "USB-C connector"],
    includedItems: ["iPad Air 11-inch (M3)", "USB-C Charge Cable"],
  }),
  createCatalogueIpad({
    slug: "ipad-air-13-inch-m3", name: "iPad Air 13-inch (M3)", generation: "iPad Air M3", subcategory: "iPad Air", image: ipadAir13M3,
    storage: ["128GB", "256GB", "512GB", "1TB"], colors: ["Blue", "Purple", "Starlight", "Space Gray"],
    specs: ["13-inch Liquid Retina display", "Apple M3 chip", "Apple Pencil Pro support", "USB-C connector"],
    includedItems: ["iPad Air 13-inch (M3)", "USB-C Charge Cable"],
  }),
  createCatalogueIpad({
    slug: "ipad-air-11-inch-m4", name: "iPad Air 11-inch (M4)", generation: "iPad Air M4", subcategory: "iPad Air", image: ipadAir11M4,
    storage: ["128GB", "256GB", "512GB", "1TB"], colors: ["Blue", "Purple", "Starlight", "Space Gray"],
    specs: ["11-inch Liquid Retina display", "Apple M4 chip", "Apple Pencil Pro support", "USB-C connector"],
    includedItems: ["iPad Air 11-inch (M4)", "USB-C Charge Cable"],
  }),
  createCatalogueIpad({
    slug: "ipad-air-13-inch-m4", name: "iPad Air 13-inch (M4)", generation: "iPad Air M4", subcategory: "iPad Air", image: ipadAir13M4,
    storage: ["128GB", "256GB", "512GB", "1TB"], colors: ["Blue", "Purple", "Starlight", "Space Gray"],
    specs: ["13-inch Liquid Retina display", "Apple M4 chip", "Apple Pencil Pro support", "USB-C connector"],
    includedItems: ["iPad Air 13-inch (M4)", "USB-C Charge Cable"],
  }),
  createCatalogueIpad({
    slug: "ipad-pro-11-inch-m2", name: "iPad Pro 11-inch (M2)", generation: "iPad Pro M2", subcategory: "iPad Pro", image: ipadPro11M2,
    storage: ["128GB", "256GB", "512GB", "1TB", "2TB"], colors: ["Silver", "Space Gray"],
    specs: ["11-inch Liquid Retina display with ProMotion", "Apple M2 chip", "Dual rear cameras with LiDAR Scanner", "Thunderbolt / USB 4 connector"],
    includedItems: ["iPad Pro 11-inch (M2)", "USB-C Charge Cable"],
  }),
  createCatalogueIpad({
    slug: "ipad-pro-12-9-inch-m2", name: "iPad Pro 12.9-inch (M2)", generation: "iPad Pro M2", subcategory: "iPad Pro", image: ipadPro129M2,
    storage: ["128GB", "256GB", "512GB", "1TB", "2TB"], colors: ["Silver", "Space Gray"],
    specs: ["12.9-inch Liquid Retina XDR display with ProMotion", "Apple M2 chip", "Dual rear cameras with LiDAR Scanner", "Thunderbolt / USB 4 connector"],
    includedItems: ["iPad Pro 12.9-inch (M2)", "USB-C Charge Cable"],
  }),
  createCatalogueIpad({
    slug: "ipad-pro-11-inch-m4", name: "iPad Pro 11-inch (M4)", generation: "iPad Pro M4", subcategory: "iPad Pro", image: ipadPro11M4,
    storage: ["256GB", "512GB", "1TB", "2TB"], colors: ["Silver", "Space Black"],
    specs: ["11.1-inch Ultra Retina XDR display with ProMotion", "Apple M4 chip", "12MP Wide camera with LiDAR Scanner", "Thunderbolt / USB 4 connector"],
    includedItems: ["iPad Pro 11-inch (M4)", "USB-C Charge Cable"],
  }),
  createCatalogueIpad({
    slug: "ipad-pro-13-inch-m4", name: "iPad Pro 13-inch (M4)", generation: "iPad Pro M4", subcategory: "iPad Pro", image: ipadPro13M4,
    storage: ["256GB", "512GB", "1TB", "2TB"], colors: ["Silver", "Space Black"],
    specs: ["13-inch Ultra Retina XDR display with ProMotion", "Apple M4 chip", "12MP Wide camera with LiDAR Scanner", "Thunderbolt / USB 4 connector"],
    includedItems: ["iPad Pro 13-inch (M4)", "USB-C Charge Cable"],
  }),
  createCatalogueIpad({
    slug: "ipad-pro-11-inch-m5", name: "iPad Pro 11-inch (M5)", generation: "iPad Pro M5", subcategory: "iPad Pro", image: ipadPro11M5,
    storage: ["256GB", "512GB", "1TB", "2TB"], colors: ["Silver", "Space Black"],
    specs: ["11.1-inch Ultra Retina XDR display with ProMotion", "Apple M5 chip", "12MP Wide camera with LiDAR Scanner", "Thunderbolt / USB 4 connector"],
    includedItems: ["iPad Pro 11-inch (M5)", "USB-C Charge Cable"],
  }),
  createCatalogueIpad({
    slug: "ipad-pro-13-inch-m5", name: "iPad Pro 13-inch (M5)", generation: "iPad Pro M5", subcategory: "iPad Pro", image: ipadPro13M5,
    storage: ["256GB", "512GB", "1TB", "2TB"], colors: ["Silver", "Space Black"],
    specs: ["13-inch Ultra Retina XDR display with ProMotion", "Apple M5 chip", "12MP Wide camera with LiDAR Scanner", "Thunderbolt / USB 4 connector"],
    includedItems: ["iPad Pro 13-inch (M5)", "USB-C Charge Cable"],
  }),
  {
    id: "ipad-pro",
    name: "iPad Pro",
    slug: "ipad-pro",
    category: "iPads",
    brand: "Apple",
    model: "iPad Pro",
    price: 13800,
    storage: ["256GB", "512GB"],
    condition: "Excellent",
    colors: ["Silver", "Space Black"],
    stockStatus: "Low Stock",
    stockQuantity: 2,
    imageTone: "from-zinc-100 via-white to-slate-200",
    badges: ["New Arrival", "Low Stock"],
    isNewArrival: true,
    tags: ["ipad", "ipad pro", "256gb", "512gb", "silver", "space black"],
    images: [{ src: ipadPro, alt: "iPad Pro product render for Buy & Sell GH" }],
    simStatus: "Wi-Fi and cellular options to confirm",
    warrantyInfo: "Warranty terms are confirmed per unit before purchase.",
    deliveryNote: "Pickup and delivery options are confirmed on WhatsApp.",
    conditionReport: ["Premium iPad options", "Storage availability varies", "Inspect before payment"],
    description: "Premium iPad option for work, design, school and entertainment.",
    specs: ["Liquid Retina display", "Apple Pencil support", "USB-C charging", "Wi-Fi options"],
    box: ["iPad", "Charging cable where available"],
  },
  createCatalogueWatch({
    slug: "apple-watch-ultra-3", name: "Apple Watch Ultra 3", generation: "Apple Watch Ultra 3", subcategory: "Apple Watch Ultra", image: appleWatchUltra3,
    connectivity: ["GPS + Cellular"], colors: ["Natural Titanium", "Black Titanium"],
    specs: ["49mm titanium case", "S10 chip with 64GB capacity", "Always-On Retina LTPO3 OLED display", "100m water resistance"],
    includedItems: ["Apple Watch Ultra 3", "Band", "Apple Watch Magnetic Fast Charger to USB-C Cable (1m)"],
  }),
  createCatalogueWatch({
    slug: "apple-watch-series-11", name: "Apple Watch Series 11", generation: "Apple Watch Series 11", subcategory: "Apple Watch Series", image: appleWatchSeries11,
    connectivity: ["GPS", "GPS + Cellular"], colors: ["Rose Gold", "Silver", "Space Gray", "Jet Black", "Gold", "Natural", "Slate"],
    specs: ["42mm or 46mm case", "S10 chip with 64GB capacity", "Always-On wide-angle OLED LTPO3 display", "50m water resistance and IP6X dust resistance"],
    includedItems: ["Apple Watch Series 11", "Band", "Apple Watch Magnetic Fast Charger to USB-C Cable (1m)"],
  }),
  createCatalogueWatch({
    slug: "apple-watch-se-3", name: "Apple Watch SE 3", generation: "Apple Watch SE 3", subcategory: "Apple Watch SE", image: appleWatchSe3,
    connectivity: ["GPS", "GPS + Cellular"], colors: ["Starlight", "Midnight"],
    specs: ["40mm or 44mm aluminum case", "S10 chip with 64GB capacity", "Always-On Retina OLED display", "50m water resistance"],
    includedItems: ["Apple Watch SE 3", "Band", "Apple Watch Magnetic Fast Charger to USB-C Cable (1m)"],
  }),
  createCatalogueWatch({
    slug: "apple-watch-series-10", name: "Apple Watch Series 10", generation: "Apple Watch Series 10", subcategory: "Apple Watch Series", image: appleWatchSeries10,
    connectivity: ["GPS", "GPS + Cellular"], colors: ["Jet Black", "Rose Gold", "Silver", "Slate", "Gold", "Natural"],
    specs: ["42mm or 46mm case", "S10 chip with 64GB capacity", "Always-On wide-angle OLED LTPO3 display", "50m water resistance"],
    includedItems: ["Apple Watch Series 10", "Band", "Apple Watch Magnetic Fast Charger to USB-C Cable (1m)"],
  }),
  createCatalogueWatch({
    slug: "apple-watch-ultra-2", name: "Apple Watch Ultra 2", generation: "Apple Watch Ultra 2", subcategory: "Apple Watch Ultra", image: appleWatchUltra2,
    connectivity: ["GPS + Cellular"], colors: ["Natural Titanium", "Black Titanium"],
    specs: ["49mm titanium case", "S9 chip with 64GB capacity", "Always-On Retina LTPO2 OLED display up to 3000 nits", "100m water resistance"],
    includedItems: ["Apple Watch Ultra 2", "Band", "Apple Watch Magnetic Fast Charger to USB-C Cable (1m)"],
  }),
  createCatalogueWatch({
    slug: "apple-watch-series-9", name: "Apple Watch Series 9", generation: "Apple Watch Series 9", subcategory: "Apple Watch Series", image: appleWatchSeries9,
    connectivity: ["GPS", "GPS + Cellular"], colors: ["Pink", "Midnight", "Starlight", "Silver", "(PRODUCT)RED", "Gold", "Graphite"],
    specs: ["41mm or 45mm case", "S9 chip with 64GB capacity", "Always-On Retina LTPO OLED display up to 2000 nits", "50m water resistance"],
    includedItems: ["Apple Watch Series 9", "Band", "Apple Watch Magnetic Fast Charger to USB-C Cable (1m)"],
  }),
  createCatalogueWatch({
    slug: "apple-watch-series-8", name: "Apple Watch Series 8", generation: "Apple Watch Series 8", subcategory: "Apple Watch Series", image: appleWatchSeries8,
    connectivity: ["GPS", "GPS + Cellular"], colors: ["Midnight", "Starlight", "Silver", "(PRODUCT)RED", "Graphite", "Gold"],
    specs: ["41mm or 45mm case", "S8 chip with 32GB capacity", "Always-On Retina LTPO OLED display", "50m water resistance and IP6X dust resistance"],
    includedItems: ["Apple Watch Series 8", "Band", "Apple Watch Magnetic Fast Charger to USB-C Cable (1m)"],
  }),
  createCatalogueWatch({
    slug: "apple-watch-ultra", name: "Apple Watch Ultra", generation: "Apple Watch Ultra", subcategory: "Apple Watch Ultra", image: appleWatchUltra,
    connectivity: ["GPS + Cellular"], colors: ["Natural Titanium"],
    specs: ["49mm titanium case", "S8 chip with 32GB capacity", "Always-On Retina LTPO2 OLED display up to 2000 nits", "100m water resistance"],
    includedItems: ["Apple Watch Ultra", "Band", "Apple Watch Magnetic Fast Charger to USB-C Cable (1m)"],
  }),
  createCatalogueWatch({
    slug: "apple-watch-series-7", name: "Apple Watch Series 7", generation: "Apple Watch Series 7", subcategory: "Apple Watch Series", image: appleWatchSeries7,
    connectivity: ["GPS", "GPS + Cellular"], colors: ["Midnight", "Starlight", "Green", "Blue", "(PRODUCT)RED", "Graphite", "Silver", "Gold", "Titanium", "Space Black"],
    specs: ["41mm or 45mm case", "S7 chip with 32GB capacity", "Always-On Retina LTPO OLED display", "50m water resistance"],
    includedItems: ["Apple Watch Series 7", "Band", "Apple Watch Magnetic Fast Charger to USB-C Cable (1m)"],
  }),
  createCatalogueWatch({
    slug: "apple-watch-se-2", name: "Apple Watch SE (2nd generation)", generation: "Apple Watch SE 2", subcategory: "Apple Watch SE", image: appleWatchSe2,
    connectivity: ["GPS", "GPS + Cellular"], colors: ["Midnight", "Starlight", "Silver"],
    specs: ["40mm or 44mm aluminum case", "S8 chip with 32GB capacity", "Retina LTPO OLED display up to 1000 nits", "50m water resistance"],
    includedItems: ["Apple Watch SE (2nd generation)", "Band", "Apple Watch Magnetic Fast Charger to USB-C Cable (1m)"],
  }),
  {
    id: "apple-watch",
    name: "Apple Watch",
    slug: "apple-watch",
    category: "Apple Watches",
    brand: "Apple",
    model: "Apple Watch",
    price: 2600,
    storage: ["GPS", "GPS + Cellular"],
    condition: "Excellent",
    colors: ["Midnight", "Silver", "Starlight"],
    stockStatus: "In Stock",
    stockQuantity: 8,
    imageTone: "from-neutral-900 via-zinc-700 to-yellow-200",
    badges: ["Popular Choice", "Excellent Condition"],
    isPopular: true,
    tags: ["apple watch", "watch", "gps", "cellular", "midnight", "silver"],
    images: [{ src: appleWatch, alt: "Apple Watch product render for Buy & Sell GH" }],
    warrantyInfo: "Warranty terms are confirmed per unit before purchase.",
    deliveryNote: "Pickup and delivery options are confirmed on WhatsApp.",
    conditionReport: ["Clean watch options", "Band availability varies", "Pairing support available"],
    description: "Apple Watch option for fitness, notifications and everyday convenience.",
    specs: ["Health tracking", "Workout modes", "Water resistance", "iPhone pairing"],
    box: ["Watch", "Band", "Charging cable where available"],
  },
  {
    id: "airpods-pro",
    name: "AirPods Pro",
    slug: "airpods-pro",
    category: "AirPods",
    brand: "Apple",
    model: "AirPods Pro",
    price: 2200,
    storage: ["USB-C Case"],
    condition: "Brand New",
    colors: ["White"],
    stockStatus: "In Stock",
    stockQuantity: 10,
    imageTone: "from-white via-zinc-100 to-yellow-100",
    badge: "Accessory Pick",
    badges: ["New Arrival", "Brand New"],
    isNewArrival: true,
    tags: ["airpods", "airpods pro", "usb-c", "white", "brand new"],
    images: [{ src: airpodsPro, alt: "AirPods Pro product render for Buy & Sell GH" }],
    warrantyInfo: "Warranty terms are confirmed before purchase.",
    deliveryNote: "Pickup and delivery options are confirmed on WhatsApp.",
    conditionReport: ["Brand new accessory options", "Final packaging details confirmed by the shop"],
    description: "Original AirPods Pro option for crisp audio, noise control and Apple ecosystem convenience.",
    specs: ["Active Noise Cancellation", "Transparency mode", "USB-C case", "Spatial audio support"],
    box: ["AirPods Pro", "Charging case", "Ear tips", "Cable"],
  },
  ...airpodsProducts,
  ...macbookProducts,
  ...accessoryProducts,
];

export const getProductBySlug = (slug: string) => products.find((product) => product.slug === slug);
