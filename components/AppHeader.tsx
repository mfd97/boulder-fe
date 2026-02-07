import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@/constants/colors';
import { typography } from '@/constants/typography';
import { spacing } from '@/constants/spacing';

export default function AppHeader() {
  return (
    <View style={styles.header}>
      <View style={styles.logoContainer}>
        <View style={styles.logoIcon}>
          <Text style={styles.logoText}>B</Text>
        </View>
        <Text style={styles.brandText}>BOULDER</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  logoIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: colors.greenGlow,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    ...typography.titleSmall,
    fontSize: 20,
    color: colors.charcoal,
  },
  brandText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.offWhite,
    letterSpacing: 1,
  },
});
