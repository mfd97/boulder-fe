export const colorsDark = {
  charcoal: "#181A1D",
  offWhite: "#F0EDE8",
  sage: "#BDCCB5",
  greenGlow: "#9FF294",
  darkGrey: "#24272B", // Card background color
  background: "#181A1D",
  textPrimary: "#F0EDE8",
  // Semantic
  error: "#FF6B6B",
  success: "#9FF294", // same as greenGlow for consistency
  warning: "#FFA726",
} as const;

export const colorsLight = {
  charcoal: "#1C1E21", // text on light
  offWhite: "#F5F3F0", // background
  sage: "#B5C4AC",
  greenGlow: "#6BCB77", // slightly darker for contrast on light
  darkGrey: "#FFFFFF", // card/surface
  background: "#F5F3F0",
  textPrimary: "#2A2C2F",
  // Semantic
  error: "#FF6B6B",
  success: "#6BCB77",
  warning: "#FFA726",
} as const;

export type ThemeColors = {
  charcoal: string;
  offWhite: string;
  sage: string;
  greenGlow: string;
  darkGrey: string;
  background: string;
  textPrimary: string;
  error: string;
  success: string;
  warning: string;
};

// Legacy export for backwards compatibility during migration; prefer useTheme().colors
export const colors = colorsDark;

export type ColorName = keyof ThemeColors;
