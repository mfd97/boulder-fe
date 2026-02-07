import React, { useEffect, useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withSequence } from 'react-native-reanimated';
import { useTheme } from '@/contexts/ThemeContext';
import { typography } from '@/constants/typography';
import { spacing } from '@/constants/spacing';

const TOAST_DURATION = 2500;

interface ToastProps {
  message: string;
  visible: boolean;
  onHide: () => void;
}

export default function Toast({ message, visible, onHide }: ToastProps) {
  const { colors } = useTheme();
  const opacity = useSharedValue(0);
  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          position: 'absolute',
          bottom: spacing.section + 60,
          left: spacing.xl,
          right: spacing.xl,
          alignItems: 'center',
          zIndex: 1000,
        },
        toast: {
          backgroundColor: colors.darkGrey,
          paddingVertical: spacing.lg,
          paddingHorizontal: spacing.xxl,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: colors.greenGlow + '40',
          maxWidth: '100%',
        },
        text: {
          ...typography.bodySmall,
          color: colors.textPrimary,
        },
      }),
    [colors]
  );

  useEffect(() => {
    if (!visible || !message) return;
    opacity.value = withSequence(
      withTiming(1, { duration: 200 }),
      withTiming(1, { duration: TOAST_DURATION - 400 }),
      withTiming(0, { duration: 200 })
    );
    const t = setTimeout(onHide, TOAST_DURATION);
    return () => clearTimeout(t);
  }, [visible, message, onHide]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  if (!visible) return null;

  return (
    <Animated.View style={[styles.container, animatedStyle]} pointerEvents="none">
      <View style={styles.toast}>
        <Text style={styles.text}>{message}</Text>
      </View>
    </Animated.View>
  );
}
