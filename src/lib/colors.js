import namer from 'color-namer';

export const colorMap = {
  // Base Colors
  "red": "#EF4444",
  "blue": "#3B82F6",
  "green": "#22C55E",
  "yellow": "#EAB308",
  "black": "#000000",
  "white": "#FFFFFF",
  "orange": "#F97316",
  "purple": "#A855F7",
  "pink": "#EC4899",
  "brown": "#78350F",
  "gray": "#6B7280",
  "grey": "#6B7280",
  
  // Extended Colors
  "silver": "#C0C0C0",
  "gold": "#FFD700",
  "maroon": "#800000",
  "navy": "#000080",
  "darkblue": "#00008B",
  "midnightblue": "#191970",
  "teal": "#008080",
  "lime": "#84CC16",
  "aqua": "#06B6D4",
  "olive": "#808000",
  "indigo": "#6366F1",
  "violet": "#8B5CF6",
  "cyan": "#06B6D4",
  "magenta": "#D946EF",
  "beige": "#F5F5DC",
  "ivory": "#FFFFF0",
  "khaki": "#F0E68C",
  "lavender": "#E6E6FA",
  "cream": "#FFFDD0",
  "charcoal": "#36454F",
  "slate": "#64748B",
  "crimson": "#DC143C",
  "coral": "#FF7F50",
  "salmon": "#FA8072",
  "gold": "#FFD700",
  "plum": "#DDA0DD",
  "turquoise": "#40E0D0",
  "emerald": "#50C878",
  "burgundy": "#800020",
  "mustard": "#FFDB58",
  "peach": "#FFE5B4",
  "rust": "#B7410E",
  "mint": "#3EB489",
  "forest": "#228B22",
  "copper": "#B87333",
  "bronze": "#CD7F32",
};

export function getColorValue(colorName) {
  if (!colorName) return "transparent";
  
  const lower = colorName.toLowerCase().trim();
  
  // 1. Check if it contains a formatted hex code like "Name (#HEX)"
  const hexMatch = colorName.match(/\(#([A-Fa-f0-9]{3,6})\)/);
  if (hexMatch) {
      return `#${hexMatch[1]}`;
  }

  // 2. Check if it's already just a hex code
  if (/^#([A-Fa-f0-9]{3}){1,12}$/.test(lower)) return lower;
  
  // 2. Check if it's rgb or hsl
  if (lower.startsWith("rgb") || lower.startsWith("hsl")) return lower;
  
  // 3. Search for known color names within the string
  // Sort keys by length descending to match "darkblue" before "blue"
  const sortedNames = Object.keys(colorMap).sort((a, b) => b.length - a.length);
  
  for (const name of sortedNames) {
    if (lower.includes(name)) return colorMap[name];
  }
  
// 4. Default fallback: use the string as is (for standard CSS colors not in map)
  return lower;
}

export function getBaseColor(colorName) {
  if (!colorName) return null;
  const lower = colorName.toLowerCase().trim();
  
  // 1. Check if it contains a formatted hex code like "Name (#HEX)"
  const hexMatch = colorName.match(/\(#([A-Fa-f0-9]{3,6})\)/);
  if (hexMatch) {
      return `#${hexMatch[1]}`;
  }

  // 2. Check if it's already just a hex code
  if (/^#([A-Fa-f0-9]{3}){1,12}$/.test(lower)) return lower;
  
  const sortedNames = Object.keys(colorMap).sort((a, b) => b.length - a.length);
  for (const name of sortedNames) {
    if (lower.includes(name)) return name;
  }
  return null;
}

export function getClosestColorName(hexStr) {
  try {
    const names = namer(hexStr);
    // Use the Name That Color (ntc) palette as it has highly recognizable standard names
    if (names && names.ntc && names.ntc.length > 0) {
      return names.ntc[0].name;
    }
  } catch (error) {
    console.error("Error naming color:", error);
  }
  return null;
}

export function formatColorInput(input) {
  return input;
}
