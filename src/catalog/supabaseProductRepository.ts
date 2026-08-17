import { getSupabaseOrThrow, productImagesBucket, supabase } from "../lib/supabase";
import { assertAdminAal2 } from "../admin/adminAuthorization";
import type { Product, ProductImage } from "../types/product";
import { normalizeProduct } from "./productCatalog";

interface ProductRow {
  id: string;
  slug: string;
  name: string;
  brand: "Apple";
  category: Product["category"];
  subcategory: string | null;
  model: string;
  generation: string | null;
  description: string;
  short_description: string | null;
  price: number;
  previous_price: number | null;
  price_on_request: boolean;
  condition: Product["condition"];
  storage_options: string[];
  colour_options: string[];
  default_colour: string | null;
  battery_health: string | null;
  warranty: string | null;
  stock_quantity: number;
  stock_status: Product["stockStatus"];
  featured: boolean;
  new_arrival: boolean;
  popular: boolean;
  available: boolean;
  images: ProductImage[];
  primary_image: number;
  specifications: string[];
  included_items: string[];
  delivery_information: string | null;
  created_at: string;
  updated_at: string;
  archived: boolean;
  tags: string[] | null;
}

const productSelect = "*";

export const isProductDatabaseConfigured = () => Boolean(supabase);

export const rowToProduct = (row: ProductRow): Product =>
  normalizeProduct({
    id: row.id,
    slug: row.slug,
    name: row.name,
    brand: row.brand,
    category: row.category,
    subcategory: row.subcategory ?? "",
    model: row.model,
    generation: row.generation ?? "",
    description: row.description,
    shortDescription: row.short_description ?? row.description,
    price: row.price,
    previousPrice: row.previous_price ?? undefined,
    oldPrice: row.previous_price ?? undefined,
    priceOnRequest: row.price_on_request,
    condition: row.condition,
    storage: row.storage_options ?? [],
    colors: row.colour_options ?? [],
    defaultColor: row.default_colour ?? row.colour_options?.[0] ?? "",
    batteryHealth: row.battery_health ?? "",
    warranty: row.warranty ?? "",
    warrantyInfo: row.warranty ?? "",
    stockQuantity: row.stock_quantity,
    stockStatus: row.stock_status,
    featured: row.featured,
    isFeatured: row.featured,
    newArrival: row.new_arrival,
    isNewArrival: row.new_arrival,
    popular: row.popular,
    isPopular: row.popular,
    available: row.available,
    images: row.images ?? [],
    primaryImageIndex: row.primary_image ?? 0,
    thumbnail: row.images?.[row.primary_image ?? 0]?.src ?? row.images?.[0]?.src,
    specifications: row.specifications ?? [],
    specs: row.specifications ?? [],
    includedItems: row.included_items ?? [],
    box: row.included_items ?? [],
    deliveryInfo: row.delivery_information ?? "",
    deliveryNote: row.delivery_information ?? "",
    imageTone: "from-white via-zinc-100 to-yellow-100",
    badges: [row.new_arrival ? "New Arrival" : "", row.condition, row.stock_status === "Sold" ? "Sold" : ""].filter(Boolean),
    tags: row.tags ?? [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    archived: row.archived,
  });

export const productToRow = (product: Product): Partial<ProductRow> => {
  const normalized = normalizeProduct(product);
  return {
    id: normalized.id,
    slug: normalized.slug,
    name: normalized.name,
    brand: normalized.brand,
    category: normalized.category,
    subcategory: normalized.subcategory || null,
    model: normalized.model,
    generation: normalized.generation || null,
    description: normalized.description,
    short_description: normalized.shortDescription || normalized.description,
    price: normalized.price,
    previous_price: normalized.previousPrice ?? null,
    price_on_request: normalized.priceOnRequest ?? false,
    condition: normalized.condition,
    storage_options: normalized.storage,
    colour_options: normalized.colors,
    default_colour: normalized.defaultColor || normalized.colors[0] || null,
    battery_health: normalized.batteryHealth || null,
    warranty: normalized.warranty ?? normalized.warrantyInfo ?? null,
    stock_quantity: normalized.stockQuantity,
    stock_status: normalized.stockStatus,
    featured: normalized.featured ?? normalized.isFeatured ?? false,
    new_arrival: normalized.newArrival ?? normalized.isNewArrival ?? false,
    popular: normalized.popular ?? normalized.isPopular ?? false,
    available: normalized.available ?? true,
    images: normalized.images,
    primary_image: normalized.primaryImageIndex ?? 0,
    specifications: normalized.specifications ?? normalized.specs,
    included_items: normalized.includedItems ?? normalized.box,
    delivery_information: normalized.deliveryInfo ?? normalized.deliveryNote ?? null,
    archived: normalized.archived ?? false,
    tags: normalized.tags ?? [],
    updated_at: new Date().toISOString(),
  };
};

export const fetchProducts = async () => {
  const client = getSupabaseOrThrow();
  const { data, error } = await client.from("products").select(productSelect).order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((row) => rowToProduct(row as ProductRow));
};

export const fetchProductBySlug = async (slug: string) => {
  const client = getSupabaseOrThrow();
  const { data, error } = await client.from("products").select(productSelect).eq("slug", slug).maybeSingle();
  if (error) throw error;
  return data ? rowToProduct(data as ProductRow) : undefined;
};

export const upsertProduct = async (product: Product) => {
  await assertAdminAal2();
  const client = getSupabaseOrThrow();
  const row = productToRow(product);
  const { data, error } = await client.from("products").upsert(row, { onConflict: "id" }).select(productSelect).single();
  if (error) throw error;
  return rowToProduct(data as ProductRow);
};

export const updateProductFields = async (productId: string, fields: Partial<ProductRow>) => {
  await assertAdminAal2();
  const client = getSupabaseOrThrow();
  const { data, error } = await client.from("products").update({ ...fields, updated_at: new Date().toISOString() }).eq("id", productId).select(productSelect).single();
  if (error) throw error;
  return rowToProduct(data as ProductRow);
};

export const archiveProductById = (productId: string) => updateProductFields(productId, { archived: true, available: false });
export const deleteProductById = async (productId: string) => {
  await assertAdminAal2("owner");
  const client = getSupabaseOrThrow();
  const { error } = await client.from("products").delete().eq("id", productId);
  if (error) throw error;
};
export const markProductSoldById = (productId: string) => updateProductFields(productId, { stock_status: "Sold", stock_quantity: 0, available: false });
export const markProductOutOfStockById = (productId: string) => updateProductFields(productId, { stock_status: "Out of Stock", stock_quantity: 0, available: false });

export const uploadProductImage = async (file: File, productId: string, onProgress?: (progress: number) => void): Promise<ProductImage> => {
  await assertAdminAal2();
  const client = getSupabaseOrThrow();
  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/avif"];
  const maxBytes = 5 * 1024 * 1024;
  if (!allowedTypes.includes(file.type)) throw new Error("Use JPEG, PNG, WebP or AVIF product images only.");
  if (file.size > maxBytes) throw new Error("Product image must be 5MB or smaller.");
  if (!(await hasValidImageSignature(file))) throw new Error("The selected file does not contain a valid supported image.");

  onProgress?.(10);
  const extension = imageExtensions[file.type as keyof typeof imageExtensions];
  const safeBaseName = file.name.toLowerCase().replace(/\.[^.]+$/, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80) || "product-image";
  const safeName = `${safeBaseName}.${extension}`;
  const safeProductId = productId.toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-|-$/g, "") || "product";
  const path = `${safeProductId}/${Date.now()}-${safeName}`;
  const { error } = await client.storage.from(productImagesBucket).upload(path, file, {
    cacheControl: "31536000",
    upsert: false,
    contentType: file.type,
  });
  if (error) throw error;
  onProgress?.(90);
  const { data } = client.storage.from(productImagesBucket).getPublicUrl(path);
  onProgress?.(100);
  return { src: data.publicUrl, alt: file.name.replace(/\.[^.]+$/, "").replace(/[\u0000-\u001f\u007f]/g, " ").trim().slice(0, 120) || "Product image" };
};

const imageExtensions = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/avif": "avif" } as const;

const hasValidImageSignature = async (file: File) => {
  const bytes = new Uint8Array(await file.slice(0, 16).arrayBuffer());
  if (file.type === "image/jpeg") return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  if (file.type === "image/png") return [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a].every((value, index) => bytes[index] === value);
  if (file.type === "image/webp") return String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" && String.fromCharCode(...bytes.slice(8, 12)) === "WEBP";
  if (file.type === "image/avif") return String.fromCharCode(...bytes.slice(4, 8)) === "ftyp" && ["avif", "avis"].includes(String.fromCharCode(...bytes.slice(8, 12)));
  return false;
};

export const removeProductImage = async (publicUrlOrPath: string) => {
  await assertAdminAal2();
  const client = getSupabaseOrThrow();
  const marker = `/${productImagesBucket}/`;
  const path = publicUrlOrPath.includes(marker) ? publicUrlOrPath.split(marker)[1] : publicUrlOrPath;
  if (!path || /^https?:\/\//.test(path) && !publicUrlOrPath.includes(marker)) return;
  const { error } = await client.storage.from(productImagesBucket).remove([path]);
  if (error) throw error;
};
