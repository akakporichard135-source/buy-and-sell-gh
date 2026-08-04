export type ProductCategory =
  | "iPhones"
  | "iPads"
  | "Apple Watches"
  | "AirPods"
  | "MacBooks"
  | "Accessories"
  | "UK Used Devices"
  | "Brand New Devices";

export type ProductCondition = "Brand New" | "UK Used" | "Excellent" | "Very Good";
export type StockStatus = "In stock" | "Limited stock" | "Low stock" | "On request" | "Sold Out";

export interface ProductImage {
  src: string;
  alt: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  category: ProductCategory;
  brand: "Apple";
  model: string;
  price: number;
  oldPrice?: number;
  storage: string[];
  condition: ProductCondition;
  colors: string[];
  stockStatus: StockStatus;
  stockQuantity: number;
  imageTone: string;
  badge?: string;
  badges?: string[];
  isPopular?: boolean;
  isNewArrival?: boolean;
  isFeatured?: boolean;
  tags?: string[];
  images: ProductImage[];
  batteryHealth?: string;
  faceIdStatus?: string;
  simStatus?: string;
  warrantyInfo?: string;
  deliveryNote?: string;
  conditionReport?: string[];
  description: string;
  specs: string[];
  box: string[];
}

export interface CartItem {
  product: Product;
  storage: string;
  color: string;
  quantity: number;
}
