// ==============================================================================
// Universal Apple Finish Color Definitions for Buy & Sell GH
// Provides visually accurate hex values and accessibility metadata for genuine Apple hardware finishes.
// ==============================================================================

export interface ColorOption {
  name: string;
  hex: string;
  border?: boolean; // True if the color needs a subtle inner border on pure white backgrounds
}

export const APPLE_FINISH_PALETTE: Record<string, ColorOption> = {
  // --- Titanium Finishes ---
  "Natural Titanium": { name: "Natural Titanium", hex: "#b5b0a8" },
  "Desert Titanium": { name: "Desert Titanium", hex: "#c4a88f" },
  "Black Titanium": { name: "Black Titanium", hex: "#3b3a38" },
  "White Titanium": { name: "White Titanium", hex: "#f2f1ed", border: true },
  "Blue Titanium": { name: "Blue Titanium", hex: "#3d4753" },
  "Titanium": { name: "Titanium", hex: "#b5b0a8" },
  "Natural": { name: "Natural", hex: "#b5b0a8" },

  // --- Dark / Black / Space Finishes ---
  "Space Black": { name: "Space Black", hex: "#2b2b2d" },
  "Jet Black": { name: "Jet Black", hex: "#111111" },
  "Black": { name: "Black", hex: "#232426" },
  "Midnight": { name: "Midnight", hex: "#1e2530" },
  "Space Gray": { name: "Space Gray", hex: "#707175" },
  "Graphite": { name: "Graphite", hex: "#54524f" },
  "Slate": { name: "Slate", hex: "#404044" },
  "Black Keys": { name: "Black Keys", hex: "#1d1d1f" },
  "Black Multi-Touch Surface": { name: "Black Multi-Touch Surface", hex: "#1d1d1f" },

  // --- Light / Silver / Starlight Finishes ---
  "Silver": { name: "Silver", hex: "#e3e4e5", border: true },
  "White": { name: "White", hex: "#f7f7f7", border: true },
  "Starlight": { name: "Starlight", hex: "#e8dfd4", border: true },
  "Cloud White": { name: "Cloud White", hex: "#f5f5f7", border: true },
  "White Keys": { name: "White Keys", hex: "#ffffff", border: true },
  "White Multi-Touch Surface": { name: "White Multi-Touch Surface", hex: "#ffffff", border: true },
  "Clear": { name: "Clear", hex: "#e5e7eb", border: true },

  // --- Gold & Warm Tones ---
  "Gold": { name: "Gold", hex: "#f0e5d3", border: true },
  "Rose Gold": { name: "Rose Gold", hex: "#e0b0a8" },
  "Light Gold": { name: "Light Gold", hex: "#f5ecd7", border: true },
  "Yellow": { name: "Yellow", hex: "#f5df82" },

  // --- Blue & Teal Tones ---
  "Light Blue": { name: "Light Blue", hex: "#7e9bb5" },
  "Blue": { name: "Blue", hex: "#4a7b9d" },
  "Deep Blue": { name: "Deep Blue", hex: "#2c3e50" },
  "Mist Blue": { name: "Mist Blue", hex: "#7e9bb5" },
  "Sky Blue": { name: "Sky Blue", hex: "#7b9ec4" },
  "Sierra Blue": { name: "Sierra Blue", hex: "#9ab3c6" },
  "Pacific Blue": { name: "Pacific Blue", hex: "#2d4452" },
  "Ultramarine": { name: "Ultramarine", hex: "#3c4e78" },
  "Teal": { name: "Teal", hex: "#7ba59b" },

  // --- Red, Pink & Orange Tones ---
  "Deep Burgundy": { name: "Deep Burgundy", hex: "#4e1b24" },
  "Burgundy": { name: "Burgundy", hex: "#4e1b24" },
  "(PRODUCT)RED": { name: "(PRODUCT)RED", hex: "#e11c2a" },
  "Red": { name: "Red", hex: "#e11c2a" },
  "Pink": { name: "Pink", hex: "#e8a8b8" },
  "Orange": { name: "Orange", hex: "#d9724b" },
  "Cosmic Orange": { name: "Cosmic Orange", hex: "#e65c00" },

  // --- Purple & Green Tones ---
  "Purple": { name: "Purple", hex: "#b5a5c6" },
  "Deep Purple": { name: "Deep Purple", hex: "#483e50" },
  "Lavender": { name: "Lavender", hex: "#b8a8c8" },
  "Green": { name: "Green", hex: "#a4bba4" },
  "Alpine Green": { name: "Alpine Green", hex: "#505c4e" },
  "Sage": { name: "Sage", hex: "#8b9c8b" },

  // --- Fallback ---
  "Colour to Confirm": { name: "Colour to Confirm", hex: "#d2d2d7" },
};

/**
 * Resolves a given color string into an accurate ColorOption with valid hex.
 * Normalizes case, trims whitespace, handles synonyms, and provides clean fallbacks.
 */
export function resolveColorOption(colorName: string): ColorOption {
  if (!colorName || typeof colorName !== "string") {
    return { name: "Standard", hex: "#707175" };
  }

  const trimmed = colorName.trim();
  if (APPLE_FINISH_PALETTE[trimmed]) {
    return APPLE_FINISH_PALETTE[trimmed];
  }

  // Case-insensitive lookup
  const lower = trimmed.toLowerCase();
  for (const [key, option] of Object.entries(APPLE_FINISH_PALETTE)) {
    if (key.toLowerCase() === lower) {
      return { ...option, name: trimmed };
    }
  }

  // Substring matching for compound labels (e.g. "Natural Titanium / Sport Loop")
  if (lower.includes("burgundy")) return { name: trimmed, hex: "#4e1b24" };
  if (lower.includes("desert")) return { name: trimmed, hex: "#c4a88f" };
  if (lower.includes("natural titanium") || lower.includes("natural")) return { name: trimmed, hex: "#b5b0a8" };
  if (lower.includes("space black")) return { name: trimmed, hex: "#2b2b2d" };
  if (lower.includes("jet black")) return { name: trimmed, hex: "#111111" };
  if (lower.includes("space gray") || lower.includes("space grey")) return { name: trimmed, hex: "#707175" };
  if (lower.includes("midnight")) return { name: trimmed, hex: "#1e2530" };
  if (lower.includes("starlight")) return { name: trimmed, hex: "#e8dfd4", border: true };
  if (lower.includes("silver")) return { name: trimmed, hex: "#e3e4e5", border: true };
  if (lower.includes("white")) return { name: trimmed, hex: "#f7f7f7", border: true };
  if (lower.includes("ultramarine")) return { name: trimmed, hex: "#3c4e78" };
  if (lower.includes("teal")) return { name: trimmed, hex: "#7ba59b" };
  if (lower.includes("pink")) return { name: trimmed, hex: "#e8a8b8" };
  if (lower.includes("yellow")) return { name: trimmed, hex: "#f5df82" };
  if (lower.includes("green")) return { name: trimmed, hex: "#a4bba4" };
  if (lower.includes("purple")) return { name: trimmed, hex: "#b5a5c6" };
  if (lower.includes("blue")) return { name: trimmed, hex: "#4a7b9d" };
  if (lower.includes("red")) return { name: trimmed, hex: "#e11c2a" };
  if (lower.includes("gold")) return { name: trimmed, hex: "#f0e5d3", border: true };
  if (lower.includes("black")) return { name: trimmed, hex: "#232426" };

  return { name: trimmed, hex: "#8e8e93" };
}

/**
 * Normalizes an array of color strings into distinct, valid ColorOptions.
 */
export function resolveColorOptions(colors: string[] = []): ColorOption[] {
  const seen = new Set<string>();
  const result: ColorOption[] = [];

  for (const c of colors) {
    if (!c || typeof c !== "string") continue;
    const resolved = resolveColorOption(c);
    const key = resolved.name.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      result.push(resolved);
    }
  }

  return result;
}
