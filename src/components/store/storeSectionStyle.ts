import type { CSSProperties } from "react";

/**
 * Built-in Store sections default to the Apple Store #f5f5f7 studio canvas.
 * Legacy saved CMS configs often contain "#ffffff" from the previous factory default;
 * we let empty or legacy-white values inherit the unified canvas while still respecting
 * any intentional custom Admin background color (e.g. obsidian dark or warm tint).
 */
export function resolveBuiltInSectionBgStyle(backgroundColor?: string): CSSProperties | undefined {
  const trimmed = backgroundColor?.trim();
  if (!trimmed) return undefined;
  const lower = trimmed.toLowerCase();
  if (lower === "#ffffff" || lower === "#fff" || lower === "white" || lower === "#f5f5f7") {
    return undefined;
  }
  return { backgroundColor: trimmed };
}
