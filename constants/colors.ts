export const colors = {
  charcoal: "#181A1D",
  offWhite: "#F0EDE8",
  sage: "#BDCCB5",
  greenGlow: "#9FF294",
  darkGrey: "#24272B", // Card background color
  // Semantic
  error: "#FF6B6B",
  success: "#9FF294", // same as greenGlow for consistency
  warning: "#FFA726",
} as const;

export type ColorName = keyof typeof colors;
