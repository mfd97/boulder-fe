/**
 * Typography scale for consistent type hierarchy.
 * Display = hero numbers; Title = section titles; Body = content; Caption = metadata.
 */
export const typography = {
  display: {
    fontSize: 48,
    fontWeight: '700' as const,
    lineHeight: 52,
  },
  title: {
    fontSize: 32,
    fontWeight: '700' as const,
    lineHeight: 40,
  },
  titleSmall: {
    fontSize: 20,
    fontWeight: '700' as const,
    lineHeight: 28,
  },
  body: {
    fontSize: 16,
    fontWeight: '500' as const,
    lineHeight: 24,
  },
  bodySmall: {
    fontSize: 14,
    fontWeight: '500' as const,
    lineHeight: 20,
  },
  caption: {
    fontSize: 12,
    fontWeight: '600' as const,
    lineHeight: 16,
  },
  label: {
    fontSize: 10,
    fontWeight: '600' as const,
    lineHeight: 14,
  },
} as const;

export type TypographyKey = keyof typeof typography;
