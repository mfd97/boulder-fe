import React, { useEffect, useRef, useMemo } from 'react';
import { View, StyleSheet, Animated, ViewStyle } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

interface SkeletonProps {
  width: number | string;
  height: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export function Skeleton({ width, height, borderRadius = 8, style }: SkeletonProps) {
  const { colors } = useTheme();
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
        Animated.timing(shimmerAnim, { toValue: 0, duration: 1000, useNativeDriver: true }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, []);

  const opacity = shimmerAnim.interpolate({ inputRange: [0, 1], outputRange: [0.3, 0.6] });

  return (
    <Animated.View
      style={[{ width: width as ViewStyle['width'], height, borderRadius, backgroundColor: colors.darkGrey, opacity }, style]}
    />
  );
}

function createSkeletonStyles(colors: ReturnType<typeof useTheme>['colors']) {
  return StyleSheet.create({
    streakContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 },
    streakLeft: { flex: 1 },
    masteryContainer: { marginBottom: 32 },
    masteryHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
    masteryCard: { backgroundColor: colors.darkGrey, borderRadius: 16, padding: 20 },
    masteryRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
    starsRow: { flexDirection: 'row', gap: 4 },
    masteryStats: { flexDirection: 'row', alignItems: 'center' },
    waveRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 4, height: 14, marginTop: 8 },
    historyItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: colors.darkGrey,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
    },
    historyLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
    topicCard: {
      backgroundColor: colors.darkGrey,
      borderRadius: 16,
      padding: 16,
      width: '48%',
      aspectRatio: 1,
      marginBottom: 12,
    },
    topicMeta: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 'auto' },
  });
}

export function StreakSkeleton() {
  const { colors } = useTheme();
  const skeletonStyles = useMemo(() => createSkeletonStyles(colors), [colors]);
  return (
    <View style={skeletonStyles.streakContainer}>
      <View style={skeletonStyles.streakLeft}>
        <Skeleton width={60} height={48} borderRadius={8} />
        <Skeleton width={120} height={14} borderRadius={4} style={{ marginTop: 8 }} />
      </View>
      <Skeleton width={100} height={100} borderRadius={50} />
    </View>
  );
}

export function MasterySkeleton() {
  const { colors } = useTheme();
  const skeletonStyles = useMemo(() => createSkeletonStyles(colors), [colors]);
  return (
    <View style={skeletonStyles.masteryContainer}>
      <View style={skeletonStyles.masteryHeader}>
        <Skeleton width={140} height={18} borderRadius={4} />
        <Skeleton width={24} height={24} borderRadius={4} />
      </View>
      <View style={skeletonStyles.masteryCard}>
        <Skeleton width={100} height={10} borderRadius={4} />
        <View style={skeletonStyles.masteryRow}>
          <Skeleton width={180} height={20} borderRadius={4} style={{ marginTop: 12 }} />
          <View style={skeletonStyles.starsRow}>
            <Skeleton width={16} height={16} borderRadius={8} />
            <Skeleton width={16} height={16} borderRadius={8} />
          </View>
        </View>
        <View style={skeletonStyles.masteryStats}>
          <Skeleton width={60} height={32} borderRadius={4} />
          <View style={{ flex: 1, marginLeft: 16 }}>
            <Skeleton width={100} height={10} borderRadius={4} />
            <View style={skeletonStyles.waveRow}>
              {[8, 12, 6, 10, 14].map((h, i) => (
                <Skeleton key={i} width={4} height={h} borderRadius={2} />
              ))}
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

export function HistoryItemSkeleton() {
  const { colors } = useTheme();
  const skeletonStyles = useMemo(() => createSkeletonStyles(colors), [colors]);
  return (
    <View style={skeletonStyles.historyItem}>
      <View style={skeletonStyles.historyLeft}>
        <Skeleton width={48} height={48} borderRadius={12} />
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Skeleton width="70%" height={16} borderRadius={4} />
          <Skeleton width={100} height={12} borderRadius={4} style={{ marginTop: 6 }} />
        </View>
      </View>
      <Skeleton width={50} height={24} borderRadius={4} />
    </View>
  );
}

export function TopicCardSkeleton() {
  const { colors } = useTheme();
  const skeletonStyles = useMemo(() => createSkeletonStyles(colors), [colors]);
  return (
    <View style={skeletonStyles.topicCard}>
      <Skeleton width={48} height={48} borderRadius={12} />
      <Skeleton width="80%" height={16} borderRadius={4} style={{ marginTop: 12 }} />
      <View style={skeletonStyles.topicMeta}>
        <Skeleton width={40} height={18} borderRadius={4} />
        <Skeleton width={50} height={16} borderRadius={4} />
      </View>
      <Skeleton width={80} height={12} borderRadius={4} style={{ marginTop: 8 }} />
    </View>
  );
}
