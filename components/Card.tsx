import React, { useMemo } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { spacing } from '@/constants/spacing';

const CARD_PADDING = spacing.lg;
const CARD_RADIUS = 16;

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  padding?: number;
}

/** Theme-aware card style for use in StyleSheet or inline (e.g. pressable cards). */
export function useCardStyle() {
  const { colors } = useTheme();
  return useMemo(
    () => ({
      backgroundColor: colors.darkGrey,
      borderRadius: CARD_RADIUS,
      padding: CARD_PADDING,
    }),
    [colors]
  );
}

export default function Card({ children, style, padding = CARD_PADDING }: CardProps) {
  const { colors } = useTheme();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        card: {
          backgroundColor: colors.darkGrey,
          borderRadius: CARD_RADIUS,
          padding: CARD_PADDING,
        },
      }),
    [colors]
  );
  return (
    <View style={[styles.card, padding !== CARD_PADDING && { padding }, style]}>
      {children}
    </View>
  );
}
