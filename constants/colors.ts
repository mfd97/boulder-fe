export const colors = {
    charcoal: '#181A1D',
    offWhite: '#F0EDE8',
    sage: '#BDCCB5',
    greenGlow: '#9FF294', // Note: Original had #9GF294 (invalid hex), using #9FF294 as correction
    darkGrey: '#24272B', // Card background color
} as const;

export type ColorName = keyof typeof colors;