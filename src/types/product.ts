export type ProductCategory =
  | "Phones"
  | "iPhones"
  | "Tablets"
  | "iPads"
  | "Watches"
  | "Apple Watches"
  | "Audio"
  | "AirPods"
  | "Laptops"
  | "MacBooks"
  | "Game Consoles"
  | "Accessories"
  | "UK Used Devices"
  | "Brand New Devices";

export type ProductBrand = string;

export type ProductCondition = "Brand New" | "UK Used" | "Excellent" | "Very Good" | "To Confirm";
export type StockStatus = "In Stock" | "Low Stock" | "Out of Stock" | "Sold";

export interface ProductImage {
  src: string;
  alt: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  category: ProductCategory;
  subcategory?: string;
  brand: ProductBrand;
  model: string;
  generation?: string;
  price: number;
  previousPrice?: number;
  oldPrice?: number;
  priceOnRequest?: boolean;
  storage: string[];
  condition: ProductCondition;
  colors: string[];
  defaultColor?: string;
  stockStatus: StockStatus;
  stockQuantity: number;
  imageTone: string;
  badge?: string;
  badges?: string[];
  isPopular?: boolean;
  isNewArrival?: boolean;
  isFeatured?: boolean;
  popular?: boolean;
  newArrival?: boolean;
  featured?: boolean;
  available?: boolean;
  tags?: string[];
  images: ProductImage[];
  thumbnail?: string;
  primaryImageIndex?: number;
  batteryHealth?: string;
  faceIdStatus?: string;
  simStatus?: string;
  warrantyInfo?: string;
  warranty?: string;
  deliveryNote?: string;
  deliveryInfo?: string;
  conditionReport?: string[];
  description: string;
  shortDescription?: string;
  specs: string[];
  specifications?: string[];
  box: string[];
  includedItems?: string[];
  archived?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CartItem {
  product: Product;
  storage: string;
  color: string;
  quantity: number;
}
