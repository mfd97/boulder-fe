import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';

const CARD_PADDING = spacing.lg;
const CARD_RADIUS = 16;

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  padding?: number;
}

export default function Card({ children, style, padding = CARD_PADDING }: CardProps) {
  return (
    <View style={[styles.card, padding !== CARD_PADDING && { padding }, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.darkGrey,
    borderRadius: CARD_RADIUS,
    padding: CARD_PADDING,
  },
});

/** Shared card style for use in StyleSheet (e.g. pressable cards). */
export const cardStyle = {
  backgroundColor: colors.darkGrey as const,
  borderRadius: CARD_RADIUS,
  padding: CARD_PADDING,
};
