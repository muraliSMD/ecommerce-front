export const colorMap = {
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
  "silver": "#C0C0C0",
  "gold": "#FFD700",
  "maroon": "#800000",
  "navy": "#000080",
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
};

export function getColorValue(colorName) {
  if (!colorName) return "transparent";
  
  const lower = colorName.toLowerCase().trim();
  
  // 1. Check if it's already a hex code
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
