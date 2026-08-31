import type { Product } from "../types/product";
import { getMacbookGeneration } from "./productPresentation";

export const STORE_BATCH_SIZE = 24;

export function storeCardFacts(product: Product): string[] {
  const laptop = product.category === "MacBooks" || product.category === "Laptops";
  const chip = laptop ? getMacbookGeneration(product) : "";
  const memory = laptop
    ? (product.specifications ?? product.specs).find((spec) => spec.startsWith("Memory options:"))?.replace("Memory options:", "").trim()
    : "";
  const storage = product.storage.filter(Boolean).slice(0, 3).join(" / ");
  const condition = product.condition === "To Confirm" ? "Condition to confirm" : product.condition;
  return [...new Set([chip, memory, storage, condition].filter((value): value is string => Boolean(value)))].slice(0, 3);
}

export function storeFilterChoices(values: (string | undefined)[], selected = "All"): string[] {
  return [...new Set([...values, ...(selected !== "All" ? [selected] : [])].map((value) => value?.trim() ?? "").filter(Boolean))]
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
}
