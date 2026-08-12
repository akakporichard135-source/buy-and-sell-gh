import macbookAir13M1 from "../assets/products/macbook-air-13-inch-m1-premium.webp";
import macbookAir13M2 from "../assets/products/macbook-air-13-inch-m2-premium.webp";
import macbookAir15M2 from "../assets/products/macbook-air-15-inch-m2-premium.webp";
import macbookAir13M3 from "../assets/products/macbook-air-13-inch-m3-premium.webp";
import macbookAir15M3 from "../assets/products/macbook-air-15-inch-m3-premium.webp";
import macbookAir13M4 from "../assets/products/macbook-air-13-inch-m4-premium.webp";
import macbookAir15M4 from "../assets/products/macbook-air-15-inch-m4-premium.webp";
import macbookAir13M5 from "../assets/products/macbook-air-13-inch-m5-premium.webp";
import macbookAir15M5 from "../assets/products/macbook-air-15-inch-m5-premium.webp";
import macbookPro13M1 from "../assets/products/macbook-pro-13-inch-m1-premium.webp";
import macbookPro14M1 from "../assets/products/macbook-pro-14-inch-m1-pro-max-premium.webp";
import macbookPro16M1 from "../assets/products/macbook-pro-16-inch-m1-pro-max-premium.webp";
import macbookPro13M2 from "../assets/products/macbook-pro-13-inch-m2-premium.webp";
import macbookPro14M2 from "../assets/products/macbook-pro-14-inch-m2-pro-max-premium.webp";
import macbookPro16M2 from "../assets/products/macbook-pro-16-inch-m2-pro-max-premium.webp";
import macbookPro14M3 from "../assets/products/macbook-pro-14-inch-m3-premium.webp";
import macbookPro14M3ProMax from "../assets/products/macbook-pro-14-inch-m3-pro-max-premium.webp";
import macbookPro16M3 from "../assets/products/macbook-pro-16-inch-m3-pro-max-premium.webp";
import macbookPro14M4 from "../assets/products/macbook-pro-14-inch-m4-premium.webp";
import macbookPro14M4ProMax from "../assets/products/macbook-pro-14-inch-m4-pro-max-premium.webp";
import macbookPro16M4 from "../assets/products/macbook-pro-16-inch-m4-pro-max-premium.webp";
import macbookPro14M5 from "../assets/products/macbook-pro-14-inch-m5-premium.webp";
import macbookPro14M5ProMax from "../assets/products/macbook-pro-14-inch-m5-pro-max-premium.webp";
import macbookPro16M5 from "../assets/products/macbook-pro-16-inch-m5-pro-max-premium.webp";
import type { Product } from "../types/product";

interface CatalogueMacbookInput {
  slug: string;
  name: string;
  generation: "M1" | "M2" | "M3" | "M4" | "M5";
  subcategory: "MacBook Air" | "MacBook Pro";
  image: string;
  storage: string[];
  colors: string[];
  memory: string[];
  specs: string[];
  includedItems: string[];
}

const createCatalogueMacbook = ({ slug, name, generation, subcategory, image, storage, colors, memory, specs, includedItems }: CatalogueMacbookInput): Product => ({
  id: slug,
  slug,
  name,
  category: "MacBooks",
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
  tags: ["macbook", subcategory.toLowerCase(), name.toLowerCase(), generation.toLowerCase(), ...memory.map((item) => item.toLowerCase()), "contact for price"],
  images: [{ src: image, alt: `${name} premium product image for Buy & Sell GH` }],
  warrantyInfo: "Warranty terms are confirmed when inventory is configured.",
  deliveryNote: "Availability, price, condition, configuration, pickup and delivery details must be confirmed before payment.",
  conditionReport: ["Condition to be confirmed", "Stock to be confirmed", "Final configuration and unit details are verified before payment"],
  description: `${name} catalogue listing with verified Apple memory, storage, finish and hardware options. Contact Buy & Sell GH to confirm current inventory, condition, configuration and price.`,
  specs: [`Memory options: ${memory.join(", ")}`, ...specs],
  box: includedItems,
});

const macbookAirPorts = "MagSafe 3 charging port, 3.5mm headphone jack and two Thunderbolt ports";
const macbookAirThunderbolt4Ports = "MagSafe 3 charging port, 3.5mm headphone jack and two Thunderbolt 4 ports";
const modernProPorts = "MagSafe 3, HDMI, SDXC, 3.5mm headphone jack and three Thunderbolt 4 ports";

export const macbookProducts: Product[] = [
  createCatalogueMacbook({
    slug: "macbook-air-13-m5", name: "MacBook Air 13-inch (M5)", generation: "M5", subcategory: "MacBook Air", image: macbookAir13M5,
    memory: ["16GB", "24GB", "32GB"], storage: ["512GB", "1TB", "2TB", "4TB"], colors: ["Sky Blue", "Silver", "Starlight", "Midnight"],
    specs: ["13.6-inch Liquid Retina display", "Apple M5 chip", macbookAirThunderbolt4Ports, "12MP Center Stage camera", "Wi-Fi 7 and Bluetooth 6"],
    includedItems: ["MacBook Air 13-inch (M5)", "USB-C Power Adapter", "USB-C to MagSafe 3 Cable"],
  }),
  createCatalogueMacbook({
    slug: "macbook-air-15-m5", name: "MacBook Air 15-inch (M5)", generation: "M5", subcategory: "MacBook Air", image: macbookAir15M5,
    memory: ["16GB", "24GB", "32GB"], storage: ["512GB", "1TB", "2TB", "4TB"], colors: ["Sky Blue", "Silver", "Starlight", "Midnight"],
    specs: ["15.3-inch Liquid Retina display", "Apple M5 chip", macbookAirThunderbolt4Ports, "12MP Center Stage camera", "Wi-Fi 7 and Bluetooth 6"],
    includedItems: ["MacBook Air 15-inch (M5)", "USB-C Power Adapter", "USB-C to MagSafe 3 Cable"],
  }),
  createCatalogueMacbook({
    slug: "macbook-air-13-m4", name: "MacBook Air 13-inch (M4)", generation: "M4", subcategory: "MacBook Air", image: macbookAir13M4,
    memory: ["16GB", "24GB", "32GB"], storage: ["256GB", "512GB", "1TB", "2TB"], colors: ["Sky Blue", "Silver", "Starlight", "Midnight"],
    specs: ["13.6-inch Liquid Retina display", "Apple M4 chip", macbookAirThunderbolt4Ports, "12MP Center Stage camera", "Wi-Fi 6E and Bluetooth 5.3"],
    includedItems: ["MacBook Air 13-inch (M4)", "USB-C Power Adapter", "USB-C to MagSafe 3 Cable"],
  }),
  createCatalogueMacbook({
    slug: "macbook-air-15-m4", name: "MacBook Air 15-inch (M4)", generation: "M4", subcategory: "MacBook Air", image: macbookAir15M4,
    memory: ["16GB", "24GB", "32GB"], storage: ["256GB", "512GB", "1TB", "2TB"], colors: ["Sky Blue", "Silver", "Starlight", "Midnight"],
    specs: ["15.3-inch Liquid Retina display", "Apple M4 chip", macbookAirThunderbolt4Ports, "12MP Center Stage camera", "Wi-Fi 6E and Bluetooth 5.3"],
    includedItems: ["MacBook Air 15-inch (M4)", "USB-C Power Adapter", "USB-C to MagSafe 3 Cable"],
  }),
  createCatalogueMacbook({
    slug: "macbook-air-13-m3", name: "MacBook Air 13-inch (M3)", generation: "M3", subcategory: "MacBook Air", image: macbookAir13M3,
    memory: ["8GB", "16GB", "24GB"], storage: ["256GB", "512GB", "1TB", "2TB"], colors: ["Midnight", "Starlight", "Space Gray", "Silver"],
    specs: ["13.6-inch Liquid Retina display", "Apple M3 chip", macbookAirPorts, "1080p FaceTime HD camera", "Wi-Fi 6E and Bluetooth 5.3"],
    includedItems: ["MacBook Air 13-inch (M3)", "USB-C Power Adapter", "USB-C to MagSafe 3 Cable"],
  }),
  createCatalogueMacbook({
    slug: "macbook-air-15-m3", name: "MacBook Air 15-inch (M3)", generation: "M3", subcategory: "MacBook Air", image: macbookAir15M3,
    memory: ["8GB", "16GB", "24GB"], storage: ["256GB", "512GB", "1TB", "2TB"], colors: ["Midnight", "Starlight", "Space Gray", "Silver"],
    specs: ["15.3-inch Liquid Retina display", "Apple M3 chip", macbookAirPorts, "1080p FaceTime HD camera", "Wi-Fi 6E and Bluetooth 5.3"],
    includedItems: ["MacBook Air 15-inch (M3)", "USB-C Power Adapter", "USB-C to MagSafe 3 Cable"],
  }),
  createCatalogueMacbook({
    slug: "macbook-air-13-m2", name: "MacBook Air 13-inch (M2)", generation: "M2", subcategory: "MacBook Air", image: macbookAir13M2,
    memory: ["8GB", "16GB", "24GB"], storage: ["256GB", "512GB", "1TB", "2TB"], colors: ["Midnight", "Starlight", "Space Gray", "Silver"],
    specs: ["13.6-inch Liquid Retina display", "Apple M2 chip", macbookAirPorts, "1080p FaceTime HD camera", "Wi-Fi 6 and Bluetooth 5.3"],
    includedItems: ["MacBook Air 13-inch (M2)", "USB-C Power Adapter", "USB-C to MagSafe 3 Cable"],
  }),
  createCatalogueMacbook({
    slug: "macbook-air-15-m2", name: "MacBook Air 15-inch (M2)", generation: "M2", subcategory: "MacBook Air", image: macbookAir15M2,
    memory: ["8GB", "16GB", "24GB"], storage: ["256GB", "512GB", "1TB", "2TB"], colors: ["Midnight", "Starlight", "Space Gray", "Silver"],
    specs: ["15.3-inch Liquid Retina display", "Apple M2 chip", macbookAirPorts, "1080p FaceTime HD camera", "Wi-Fi 6 and Bluetooth 5.3"],
    includedItems: ["MacBook Air 15-inch (M2)", "USB-C Power Adapter", "USB-C to MagSafe 3 Cable"],
  }),
  createCatalogueMacbook({
    slug: "macbook-air-13-m1", name: "MacBook Air 13-inch (M1)", generation: "M1", subcategory: "MacBook Air", image: macbookAir13M1,
    memory: ["8GB", "16GB"], storage: ["256GB", "512GB", "1TB", "2TB"], colors: ["Gold", "Silver", "Space Gray"],
    specs: ["13.3-inch Retina display", "Apple M1 chip", "Two Thunderbolt / USB 4 ports and 3.5mm headphone jack", "720p FaceTime HD camera", "Wi-Fi 6 and Bluetooth 5.0"],
    includedItems: ["MacBook Air 13-inch (M1)", "30W USB-C Power Adapter", "USB-C Charge Cable"],
  }),
  createCatalogueMacbook({
    slug: "macbook-pro-14-m5", name: "MacBook Pro 14-inch (M5)", generation: "M5", subcategory: "MacBook Pro", image: macbookPro14M5,
    memory: ["16GB", "24GB", "32GB"], storage: ["512GB", "1TB", "2TB", "4TB"], colors: ["Space Black", "Silver"],
    specs: ["14.2-inch Liquid Retina XDR display with ProMotion", "Apple M5 chip", modernProPorts, "12MP Center Stage camera", "Wi-Fi 6E and Bluetooth 5.3"],
    includedItems: ["MacBook Pro 14-inch (M5)", "USB-C Power Adapter", "USB-C to MagSafe 3 Cable"],
  }),
  createCatalogueMacbook({
    slug: "macbook-pro-14-m5-pro-max", name: "MacBook Pro 14-inch (M5 Pro / M5 Max)", generation: "M5", subcategory: "MacBook Pro", image: macbookPro14M5ProMax,
    memory: ["24GB", "36GB", "48GB", "64GB", "128GB"], storage: ["1TB", "2TB", "4TB", "8TB"], colors: ["Space Black", "Silver"],
    specs: ["14.2-inch Liquid Retina XDR display with ProMotion", "Apple M5 Pro or M5 Max chip", modernProPorts.replace("Thunderbolt 4", "Thunderbolt 5"), "12MP Center Stage camera", "Wi-Fi 7 and Bluetooth 6"],
    includedItems: ["MacBook Pro 14-inch (M5 Pro / M5 Max)", "USB-C Power Adapter", "USB-C to MagSafe 3 Cable"],
  }),
  createCatalogueMacbook({
    slug: "macbook-pro-16-m5-pro-max", name: "MacBook Pro 16-inch (M5 Pro / M5 Max)", generation: "M5", subcategory: "MacBook Pro", image: macbookPro16M5,
    memory: ["24GB", "36GB", "48GB", "64GB", "128GB"], storage: ["1TB", "2TB", "4TB", "8TB"], colors: ["Space Black", "Silver"],
    specs: ["16.2-inch Liquid Retina XDR display with ProMotion", "Apple M5 Pro or M5 Max chip", modernProPorts.replace("Thunderbolt 4", "Thunderbolt 5"), "12MP Center Stage camera", "Wi-Fi 7 and Bluetooth 6"],
    includedItems: ["MacBook Pro 16-inch (M5 Pro / M5 Max)", "USB-C Power Adapter", "USB-C to MagSafe 3 Cable"],
  }),
  createCatalogueMacbook({
    slug: "macbook-pro-14-m4", name: "MacBook Pro 14-inch (M4)", generation: "M4", subcategory: "MacBook Pro", image: macbookPro14M4,
    memory: ["16GB", "24GB", "32GB"], storage: ["512GB", "1TB", "2TB"], colors: ["Space Black", "Silver"],
    specs: ["14.2-inch Liquid Retina XDR display with ProMotion", "Apple M4 chip", modernProPorts, "12MP Center Stage camera", "Wi-Fi 6E and Bluetooth 5.3"],
    includedItems: ["MacBook Pro 14-inch (M4)", "USB-C Power Adapter", "USB-C to MagSafe 3 Cable"],
  }),
  createCatalogueMacbook({
    slug: "macbook-pro-14-m4-pro-max", name: "MacBook Pro 14-inch (M4 Pro / M4 Max)", generation: "M4", subcategory: "MacBook Pro", image: macbookPro14M4ProMax,
    memory: ["24GB", "36GB", "48GB", "64GB", "128GB"], storage: ["512GB", "1TB", "2TB", "4TB", "8TB"], colors: ["Space Black", "Silver"],
    specs: ["14.2-inch Liquid Retina XDR display with ProMotion", "Apple M4 Pro or M4 Max chip", modernProPorts.replace("Thunderbolt 4", "Thunderbolt 5"), "12MP Center Stage camera", "Wi-Fi 6E and Bluetooth 5.3"],
    includedItems: ["MacBook Pro 14-inch (M4 Pro / M4 Max)", "USB-C Power Adapter", "USB-C to MagSafe 3 Cable"],
  }),
  createCatalogueMacbook({
    slug: "macbook-pro-16-m4-pro-max", name: "MacBook Pro 16-inch (M4 Pro / M4 Max)", generation: "M4", subcategory: "MacBook Pro", image: macbookPro16M4,
    memory: ["24GB", "36GB", "48GB", "64GB", "128GB"], storage: ["512GB", "1TB", "2TB", "4TB", "8TB"], colors: ["Space Black", "Silver"],
    specs: ["16.2-inch Liquid Retina XDR display with ProMotion", "Apple M4 Pro or M4 Max chip", modernProPorts.replace("Thunderbolt 4", "Thunderbolt 5"), "12MP Center Stage camera", "Wi-Fi 6E and Bluetooth 5.3"],
    includedItems: ["MacBook Pro 16-inch (M4 Pro / M4 Max)", "USB-C Power Adapter", "USB-C to MagSafe 3 Cable"],
  }),
  createCatalogueMacbook({
    slug: "macbook-pro-14-m3", name: "MacBook Pro 14-inch (M3)", generation: "M3", subcategory: "MacBook Pro", image: macbookPro14M3,
    memory: ["8GB", "16GB", "24GB"], storage: ["512GB", "1TB", "2TB"], colors: ["Silver", "Space Gray"],
    specs: ["14.2-inch Liquid Retina XDR display with ProMotion", "Apple M3 chip", "MagSafe 3, HDMI, SDXC, 3.5mm headphone jack and two Thunderbolt / USB 4 ports", "1080p FaceTime HD camera", "Wi-Fi 6E and Bluetooth 5.3"],
    includedItems: ["MacBook Pro 14-inch (M3)", "USB-C Power Adapter", "USB-C to MagSafe 3 Cable"],
  }),
  createCatalogueMacbook({
    slug: "macbook-pro-14-m3-pro-max", name: "MacBook Pro 14-inch (M3 Pro / M3 Max)", generation: "M3", subcategory: "MacBook Pro", image: macbookPro14M3ProMax,
    memory: ["18GB", "36GB", "48GB", "64GB", "96GB", "128GB"], storage: ["512GB", "1TB", "2TB", "4TB", "8TB"], colors: ["Space Black", "Silver"],
    specs: ["14.2-inch Liquid Retina XDR display with ProMotion", "Apple M3 Pro or M3 Max chip", modernProPorts, "1080p FaceTime HD camera", "Wi-Fi 6E and Bluetooth 5.3"],
    includedItems: ["MacBook Pro 14-inch (M3 Pro / M3 Max)", "USB-C Power Adapter", "USB-C to MagSafe 3 Cable"],
  }),
  createCatalogueMacbook({
    slug: "macbook-pro-16-m3-pro-max", name: "MacBook Pro 16-inch (M3 Pro / M3 Max)", generation: "M3", subcategory: "MacBook Pro", image: macbookPro16M3,
    memory: ["18GB", "36GB", "48GB", "64GB", "96GB", "128GB"], storage: ["512GB", "1TB", "2TB", "4TB", "8TB"], colors: ["Space Black", "Silver"],
    specs: ["16.2-inch Liquid Retina XDR display with ProMotion", "Apple M3 Pro or M3 Max chip", modernProPorts, "1080p FaceTime HD camera", "Wi-Fi 6E and Bluetooth 5.3"],
    includedItems: ["MacBook Pro 16-inch (M3 Pro / M3 Max)", "USB-C Power Adapter", "USB-C to MagSafe 3 Cable"],
  }),
  createCatalogueMacbook({
    slug: "macbook-pro-13-m2", name: "MacBook Pro 13-inch (M2)", generation: "M2", subcategory: "MacBook Pro", image: macbookPro13M2,
    memory: ["8GB", "16GB", "24GB"], storage: ["256GB", "512GB", "1TB", "2TB"], colors: ["Silver", "Space Gray"],
    specs: ["13.3-inch Retina display", "Apple M2 chip", "Touch Bar and Touch ID", "Two Thunderbolt / USB 4 ports and 3.5mm headphone jack", "720p FaceTime HD camera", "Wi-Fi 6 and Bluetooth 5.0"],
    includedItems: ["MacBook Pro 13-inch (M2)", "67W USB-C Power Adapter", "USB-C Charge Cable"],
  }),
  createCatalogueMacbook({
    slug: "macbook-pro-14-m2-pro-max", name: "MacBook Pro 14-inch (M2 Pro / M2 Max)", generation: "M2", subcategory: "MacBook Pro", image: macbookPro14M2,
    memory: ["16GB", "32GB", "64GB", "96GB"], storage: ["512GB", "1TB", "2TB", "4TB", "8TB"], colors: ["Silver", "Space Gray"],
    specs: ["14.2-inch Liquid Retina XDR display with ProMotion", "Apple M2 Pro or M2 Max chip", modernProPorts, "1080p FaceTime HD camera", "Wi-Fi 6E and Bluetooth 5.3"],
    includedItems: ["MacBook Pro 14-inch (M2 Pro / M2 Max)", "USB-C Power Adapter", "USB-C to MagSafe 3 Cable"],
  }),
  createCatalogueMacbook({
    slug: "macbook-pro-16-m2-pro-max", name: "MacBook Pro 16-inch (M2 Pro / M2 Max)", generation: "M2", subcategory: "MacBook Pro", image: macbookPro16M2,
    memory: ["16GB", "32GB", "64GB", "96GB"], storage: ["512GB", "1TB", "2TB", "4TB", "8TB"], colors: ["Silver", "Space Gray"],
    specs: ["16.2-inch Liquid Retina XDR display with ProMotion", "Apple M2 Pro or M2 Max chip", modernProPorts, "1080p FaceTime HD camera", "Wi-Fi 6E and Bluetooth 5.3"],
    includedItems: ["MacBook Pro 16-inch (M2 Pro / M2 Max)", "USB-C Power Adapter", "USB-C to MagSafe 3 Cable"],
  }),
  createCatalogueMacbook({
    slug: "macbook-pro-13-m1", name: "MacBook Pro 13-inch (M1)", generation: "M1", subcategory: "MacBook Pro", image: macbookPro13M1,
    memory: ["8GB", "16GB"], storage: ["256GB", "512GB", "1TB", "2TB"], colors: ["Silver", "Space Gray"],
    specs: ["13.3-inch Retina display", "Apple M1 chip", "Touch Bar and Touch ID", "Two Thunderbolt / USB 4 ports and 3.5mm headphone jack", "720p FaceTime HD camera", "Wi-Fi 6 and Bluetooth 5.0"],
    includedItems: ["MacBook Pro 13-inch (M1)", "61W USB-C Power Adapter", "USB-C Charge Cable"],
  }),
  createCatalogueMacbook({
    slug: "macbook-pro-14-m1-pro-max", name: "MacBook Pro 14-inch (M1 Pro / M1 Max)", generation: "M1", subcategory: "MacBook Pro", image: macbookPro14M1,
    memory: ["16GB", "32GB", "64GB"], storage: ["512GB", "1TB", "2TB", "4TB", "8TB"], colors: ["Silver", "Space Gray"],
    specs: ["14.2-inch Liquid Retina XDR display with ProMotion", "Apple M1 Pro or M1 Max chip", modernProPorts, "1080p FaceTime HD camera", "Wi-Fi 6 and Bluetooth 5.0"],
    includedItems: ["MacBook Pro 14-inch (M1 Pro / M1 Max)", "USB-C Power Adapter", "USB-C to MagSafe 3 Cable"],
  }),
  createCatalogueMacbook({
    slug: "macbook-pro-16-m1-pro-max", name: "MacBook Pro 16-inch (M1 Pro / M1 Max)", generation: "M1", subcategory: "MacBook Pro", image: macbookPro16M1,
    memory: ["16GB", "32GB", "64GB"], storage: ["512GB", "1TB", "2TB", "4TB", "8TB"], colors: ["Silver", "Space Gray"],
    specs: ["16.2-inch Liquid Retina XDR display with ProMotion", "Apple M1 Pro or M1 Max chip", modernProPorts, "1080p FaceTime HD camera", "Wi-Fi 6 and Bluetooth 5.0"],
    includedItems: ["MacBook Pro 16-inch (M1 Pro / M1 Max)", "USB-C Power Adapter", "USB-C to MagSafe 3 Cable"],
  }),
];
