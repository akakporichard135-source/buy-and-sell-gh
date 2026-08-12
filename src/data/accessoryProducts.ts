import adapter20W from "../assets/products/apple-20w-usb-c-power-adapter-premium.webp";
import adapter30W from "../assets/products/apple-30w-usb-c-power-adapter-premium.webp";
import adapter35WDual from "../assets/products/apple-35w-dual-usb-c-power-adapter-premium.webp";
import adapter70W from "../assets/products/apple-70w-usb-c-power-adapter-premium.webp";
import adapter96W from "../assets/products/apple-96w-usb-c-power-adapter-premium.webp";
import adapter140W from "../assets/products/apple-140w-usb-c-power-adapter-premium.webp";
import magsafeCharger from "../assets/products/apple-magsafe-charger-premium.webp";
import usbCChargeCable from "../assets/products/apple-usb-c-charge-cable-premium.webp";
import usbCToLightning from "../assets/products/apple-usb-c-to-lightning-cable-premium.webp";
import cable60W from "../assets/products/apple-60w-usb-c-charge-cable-premium.webp";
import cable240W from "../assets/products/apple-240w-usb-c-charge-cable-premium.webp";
import magsafe3Cable from "../assets/products/apple-usb-c-to-magsafe-3-cable-premium.webp";
import magsafeIphoneCase from "../assets/products/apple-magsafe-iphone-case-premium.webp";
import clearIphoneCase from "../assets/products/apple-clear-iphone-case-magsafe-premium.webp";
import pencilUsbC from "../assets/products/apple-pencil-usb-c-premium.webp";
import pencilPro from "../assets/products/apple-pencil-pro-premium.webp";
import magicKeyboardIpad from "../assets/products/apple-magic-keyboard-ipad-premium.webp";
import magicKeyboardFolio from "../assets/products/apple-magic-keyboard-folio-premium.webp";
import magicMouse from "../assets/products/apple-magic-mouse-premium.webp";
import magicTrackpad from "../assets/products/apple-magic-trackpad-premium.webp";
import magicKeyboard from "../assets/products/apple-magic-keyboard-premium.webp";
import magicKeyboardTouchId from "../assets/products/apple-magic-keyboard-touch-id-premium.webp";
import watchFastCharger from "../assets/products/apple-watch-fast-charger-usb-c-premium.webp";
import type { Product } from "../types/product";

export type AccessoryFamily = "Charging & Power" | "Cables" | "iPhone Accessories" | "iPad Accessories" | "Mac Accessories" | "Watch Accessories";

interface AccessoryInput {
  slug: string;
  name: string;
  family: AccessoryFamily;
  image: string;
  options: string[];
  colors?: string[];
  specs: string[];
  includedItems: string[];
}

const createAccessory = ({ slug, name, family, image, options, colors = ["White"], specs, includedItems }: AccessoryInput): Product => ({
  id: slug,
  slug,
  name,
  category: "Accessories",
  subcategory: family,
  brand: "Apple",
  model: name,
  price: 0,
  priceOnRequest: true,
  storage: options,
  condition: "To Confirm",
  colors,
  defaultColor: colors[0],
  stockStatus: "Out of Stock",
  stockQuantity: 0,
  available: true,
  imageTone: "from-stone-100 via-white to-yellow-100",
  badges: [],
  tags: ["apple accessory", family.toLowerCase(), name.toLowerCase(), "contact for price"],
  images: [{ src: image, alt: `${name} premium product image for Buy & Sell GH` }],
  warrantyInfo: "Warranty and packaging are confirmed when inventory is configured.",
  deliveryNote: "Availability, compatibility, price, condition, pickup and delivery details must be confirmed before payment.",
  conditionReport: ["Condition to be confirmed", "Stock to be confirmed", "Compatibility is verified before payment"],
  description: `${name} catalogue listing with verified connector, charging and compatibility information. Contact Buy & Sell GH to confirm current inventory, condition and price.`,
  specs,
  box: includedItems,
});

export const accessoryProducts: Product[] = [
  createAccessory({ slug: "apple-20w-usb-c-power-adapter", name: "Apple 20W USB-C Power Adapter", family: "Charging & Power", image: adapter20W, options: ["20W USB-C"], specs: ["Wattage: 20W", "Connector: USB-C", "Compatibility: USB-C enabled iPhone and iPad models; other USB-C devices", "Charging: Fast charging supported with a compatible cable and device"], includedItems: ["Apple 20W USB-C Power Adapter"] }),
  createAccessory({ slug: "apple-30w-usb-c-power-adapter", name: "Apple 30W USB-C Power Adapter", family: "Charging & Power", image: adapter30W, options: ["30W USB-C"], specs: ["Wattage: 30W", "Connector: USB-C", "Compatibility: MacBook Air and compatible USB-C Apple devices", "Charging: USB-C Power Delivery"], includedItems: ["Apple 30W USB-C Power Adapter"] }),
  createAccessory({ slug: "apple-35w-dual-usb-c-power-adapter", name: "Apple 35W Dual USB-C Port Power Adapter", family: "Charging & Power", image: adapter35WDual, options: ["35W Dual USB-C"], specs: ["Wattage: 35W total", "Connector: Two USB-C ports", "Compatibility: Compatible USB-C Apple devices", "Charging: Charge two devices at the same time"], includedItems: ["Apple 35W Dual USB-C Port Power Adapter"] }),
  createAccessory({ slug: "apple-70w-usb-c-power-adapter", name: "Apple 70W USB-C Power Adapter", family: "Charging & Power", image: adapter70W, options: ["70W USB-C"], specs: ["Wattage: 70W", "Connector: USB-C", "Compatibility: Compatible MacBook and USB-C Apple devices", "Charging: Fast charging supported on compatible MacBook models"], includedItems: ["Apple 70W USB-C Power Adapter"] }),
  createAccessory({ slug: "apple-96w-usb-c-power-adapter", name: "Apple 96W USB-C Power Adapter", family: "Charging & Power", image: adapter96W, options: ["96W USB-C"], specs: ["Wattage: 96W", "Connector: USB-C", "Compatibility: Compatible MacBook Pro and USB-C devices", "Charging: USB-C Power Delivery"], includedItems: ["Apple 96W USB-C Power Adapter"] }),
  createAccessory({ slug: "apple-140w-usb-c-power-adapter", name: "Apple 140W USB-C Power Adapter", family: "Charging & Power", image: adapter140W, options: ["140W USB-C"], specs: ["Wattage: 140W", "Connector: USB-C", "Compatibility: Compatible MacBook Pro and USB-C devices", "Charging: USB-C Power Delivery 3.1"], includedItems: ["Apple 140W USB-C Power Adapter"] }),
  createAccessory({ slug: "apple-magsafe-charger", name: "Apple MagSafe Charger", family: "Charging & Power", image: magsafeCharger, options: ["USB-C / 1m"], specs: ["Connector: USB-C", "Cable length: 1 metre", "MagSafe support: Magnetic alignment for compatible iPhone models", "Compatibility: MagSafe iPhone models, Qi-compatible iPhone and AirPods charging cases"], includedItems: ["MagSafe Charger with integrated 1m USB-C cable"] }),
  createAccessory({ slug: "apple-usb-c-charge-cable", name: "Apple USB-C Charge Cable", family: "Cables", image: usbCChargeCable, options: ["USB-C to USB-C / 1m"], specs: ["Connector: USB-C to USB-C", "Cable length: 1 metre", "Charging: Charging and USB 2 data transfer", "Compatibility: USB-C Apple devices and power adapters"], includedItems: ["Apple USB-C Charge Cable"] }),
  createAccessory({ slug: "apple-usb-c-to-lightning-cable", name: "Apple USB-C to Lightning Cable", family: "Cables", image: usbCToLightning, options: ["USB-C to Lightning / 1m"], specs: ["Connector: USB-C to Lightning", "Cable length: 1 metre", "Charging: Charging and syncing", "Compatibility: Lightning-equipped iPhone, iPad, AirPods and Apple accessories"], includedItems: ["Apple USB-C to Lightning Cable"] }),
  createAccessory({ slug: "apple-60w-usb-c-charge-cable", name: "Apple 60W USB-C Charge Cable", family: "Cables", image: cable60W, options: ["USB-C to USB-C / 1m"], specs: ["Wattage: Up to 60W charging", "Connector: USB-C to USB-C", "Cable length: 1 metre", "Compatibility: USB-C Apple devices and displays; USB 2 data transfer"], includedItems: ["Apple 60W USB-C Charge Cable (1m)"] }),
  createAccessory({ slug: "apple-240w-usb-c-charge-cable", name: "Apple 240W USB-C Charge Cable", family: "Cables", image: cable240W, options: ["USB-C to USB-C / 2m"], specs: ["Wattage: Up to 240W charging", "Connector: USB-C to USB-C", "Cable length: 2 metres", "Compatibility: USB-C Apple devices; USB 2 data transfer"], includedItems: ["Apple 240W USB-C Charge Cable (2m)"] }),
  createAccessory({ slug: "apple-usb-c-to-magsafe-3-cable", name: "Apple USB-C to MagSafe 3 Cable", family: "Cables", image: magsafe3Cable, options: ["USB-C to MagSafe 3 / 2m"], colors: ["Silver", "Space Gray", "Midnight", "Starlight", "Space Black", "Sky Blue"], specs: ["Connector: USB-C to MagSafe 3", "Cable length: 2 metres", "Charging: Magnetic Mac notebook charging connection", "Compatibility: MacBook Air and MacBook Pro models with MagSafe 3"], includedItems: ["Apple USB-C to MagSafe 3 Cable (2m)"] }),
  createAccessory({ slug: "apple-magsafe-iphone-case", name: "Apple MagSafe iPhone Case", family: "iPhone Accessories", image: magsafeIphoneCase, options: ["Confirm iPhone model"], colors: ["Colour to Confirm"], specs: ["MagSafe support: Built-in magnets for MagSafe alignment", "Compatibility: Exact iPhone model must be confirmed", "Material: Official Apple case material varies by selected model", "Charging: Works with compatible MagSafe chargers"], includedItems: ["Apple MagSafe iPhone Case"] }),
  createAccessory({ slug: "apple-clear-iphone-case-magsafe", name: "Apple iPhone Clear Case with MagSafe", family: "iPhone Accessories", image: clearIphoneCase, options: ["Confirm iPhone model"], colors: ["Clear"], specs: ["MagSafe support: Built-in magnets for MagSafe alignment", "Compatibility: Exact iPhone model must be confirmed", "Material: Clear polycarbonate and flexible materials", "Charging: Works with compatible MagSafe chargers"], includedItems: ["Apple iPhone Clear Case with MagSafe"] }),
  createAccessory({ slug: "apple-pencil-usb-c", name: "Apple Pencil (USB-C)", family: "iPad Accessories", image: pencilUsbC, options: ["USB-C"], specs: ["Connector: USB-C under sliding cap", "Charging: USB-C cable pairing and charging", "Compatibility: Compatible USB-C iPad models; confirm exact iPad before payment", "Features: Pixel-perfect precision, low latency and tilt sensitivity"], includedItems: ["Apple Pencil (USB-C)"] }),
  createAccessory({ slug: "apple-pencil-pro", name: "Apple Pencil Pro", family: "iPad Accessories", image: pencilPro, options: ["Magnetic charging"], specs: ["Charging: Magnetic pairing and charging", "Compatibility: Compatible iPad Pro and iPad Air models; confirm exact model", "Features: Squeeze, barrel roll, haptic feedback and Find My support", "Connector: Magnetic iPad attachment"], includedItems: ["Apple Pencil Pro"] }),
  createAccessory({ slug: "apple-magic-keyboard-ipad", name: "Magic Keyboard for iPad", family: "iPad Accessories", image: magicKeyboardIpad, options: ["Confirm iPad size/model"], colors: ["Black", "White"], specs: ["Connector: Smart Connector and USB-C pass-through charging", "Compatibility: Model-specific iPad Pro or iPad Air versions", "Features: Trackpad, function row and adjustable floating design", "Charging: Pass-through USB-C charging"], includedItems: ["Magic Keyboard for iPad"] }),
  createAccessory({ slug: "apple-magic-keyboard-folio", name: "Magic Keyboard Folio", family: "iPad Accessories", image: magicKeyboardFolio, options: ["iPad (A16) / iPad 10th generation"], colors: ["White"], specs: ["Connector: Smart Connector", "Compatibility: iPad (A16) and iPad (10th generation)", "Features: Detachable keyboard, trackpad, 14-key function row and adjustable back panel", "Charging: Powered by iPad; no separate charging required"], includedItems: ["Magic Keyboard Folio keyboard", "Adjustable back panel"] }),
  createAccessory({ slug: "apple-magic-mouse", name: "Magic Mouse", family: "Mac Accessories", image: magicMouse, options: ["USB-C"], colors: ["White Multi-Touch Surface", "Black Multi-Touch Surface"], specs: ["Connector: USB-C charging cable", "Compatibility: Bluetooth-enabled Mac and iPad models", "Features: Wireless Multi-Touch surface", "Charging: Rechargeable internal battery"], includedItems: ["Magic Mouse", "USB-C Charge Cable"] }),
  createAccessory({ slug: "apple-magic-trackpad", name: "Magic Trackpad", family: "Mac Accessories", image: magicTrackpad, options: ["USB-C"], colors: ["White Multi-Touch Surface", "Black Multi-Touch Surface"], specs: ["Connector: USB-C charging cable", "Compatibility: Bluetooth-enabled Mac and iPad models", "Features: Force Touch, Multi-Touch gestures and edge-to-edge glass surface", "Charging: Rechargeable internal battery"], includedItems: ["Magic Trackpad", "USB-C Charge Cable"] }),
  createAccessory({ slug: "apple-magic-keyboard", name: "Magic Keyboard", family: "Mac Accessories", image: magicKeyboard, options: ["USB-C"], colors: ["White Keys"], specs: ["Connector: USB-C charging cable", "Compatibility: Bluetooth-enabled Mac, iPad and iPhone models", "Features: Compact wireless keyboard with scissor mechanism", "Charging: Rechargeable internal battery"], includedItems: ["Magic Keyboard", "USB-C Charge Cable"] }),
  createAccessory({ slug: "apple-magic-keyboard-touch-id", name: "Magic Keyboard with Touch ID", family: "Mac Accessories", image: magicKeyboardTouchId, options: ["USB-C / Touch ID"], colors: ["White Keys", "Black Keys"], specs: ["Connector: USB-C charging cable", "Compatibility: Mac models with Apple silicon", "Features: Touch ID, compact wireless keyboard and scissor mechanism", "Charging: Rechargeable internal battery"], includedItems: ["Magic Keyboard with Touch ID", "USB-C Charge Cable"] }),
  createAccessory({ slug: "apple-watch-magnetic-fast-charger-usb-c", name: "Apple Watch Magnetic Fast Charger to USB-C Cable", family: "Watch Accessories", image: watchFastCharger, options: ["USB-C / 1m"], specs: ["Connector: USB-C", "Cable length: 1 metre", "Charging: Magnetic fast charging on supported Apple Watch models", "Compatibility: Apple Watch models; fast-charge support varies by model"], includedItems: ["Apple Watch Magnetic Fast Charger to USB-C Cable (1m)"] }),
];
