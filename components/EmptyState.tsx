import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import type { ThemeColors } from '@/constants/colors';
import { useTheme } from '@/contexts/ThemeContext';

type IllustrationType = 'mountain' | 'book' | 'trophy' | 'rocket' | 'history';

interface EmptyStateProps {
  illustration: IllustrationType;
  title: string;
  subtitle: string;
  actionLabel?: string;
  onAction?: () => void;
}

function buildIllustrationStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: { alignItems: 'center', justifyContent: 'center' },
    circleBackground: {
      width: 120,
      height: 120,
      borderRadius: 60,
      backgroundColor: colors.darkGrey,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
      borderColor: colors.greenGlow + '33',
    },
    mountainContainer: { flexDirection: 'row' as const, alignItems: 'flex-end' as const, height: 50, gap: -10 },
    mountain: {
      width: 0,
      height: 0,
      borderLeftWidth: 20,
      borderRightWidth: 20,
      borderBottomWidth: 35,
      borderLeftColor: 'transparent',
      borderRightColor: 'transparent',
    },
    mountainLeft: { borderBottomColor: colors.sage, opacity: 0.6, transform: [{ translateY: 5 }] },
    mountainCenter: {
      borderBottomColor: colors.greenGlow,
      borderLeftWidth: 25,
      borderRightWidth: 25,
      borderBottomWidth: 45,
      zIndex: 1,
    },
    mountainRight: { borderBottomColor: colors.sage, opacity: 0.6, transform: [{ translateY: 8 }] },
    flagContainer: { position: 'absolute' as const, top: 20, alignItems: 'center' },
    flagPole: { width: 2, height: 20, backgroundColor: colors.greenGlow },
    sparkleContainer: { position: 'absolute' as const, width: '100%', height: '100%' },
    sparkle1: { position: 'absolute' as const, top: 15, right: 20 },
    sparkle2: { position: 'absolute' as const, bottom: 25, left: 18 },
    starsContainer: { position: 'absolute' as const, width: '100%', height: '100%' },
    star1: { position: 'absolute' as const, top: 18, right: 22 },
    star2: { position: 'absolute' as const, top: 30, left: 20 },
    star3: { position: 'absolute' as const, bottom: 25, right: 28 },
    trailContainer: { position: 'absolute' as const, bottom: 20, left: '50%', marginLeft: -15 },
    trail: { width: 6, borderRadius: 3, backgroundColor: colors.sage, marginTop: 3, alignSelf: 'center' as const },
    trail1: { height: 12, opacity: 0.8 },
    trail2: { height: 8, opacity: 0.5, width: 4 },
    trail3: { height: 5, opacity: 0.3, width: 3 },
    clockAccent: { position: 'absolute' as const, top: 15, right: 25 },
    clockDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.sage },
  });
}

function MountainIllustration({ colors, ill }: { colors: ThemeColors; ill: ReturnType<typeof buildIllustrationStyles> }) {
  return (
    <View style={ill.container}>
      <View style={ill.circleBackground}>
        <View style={ill.mountainContainer}>
          <View style={[ill.mountain, ill.mountainLeft]} />
          <View style={[ill.mountain, ill.mountainCenter]} />
          <View style={[ill.mountain, ill.mountainRight]} />
        </View>
        <View style={ill.flagContainer}>
          <View style={ill.flagPole} />
          <Ionicons name="flag" size={16} color={colors.greenGlow} />
        </View>
      </View>
    </View>
  );
}

function BookIllustration({ colors, ill }: { colors: ThemeColors; ill: ReturnType<typeof buildIllustrationStyles> }) {
  return (
    <View style={ill.container}>
      <View style={ill.circleBackground}>
        <Ionicons name="book" size={48} color={colors.greenGlow} />
        <View style={ill.sparkleContainer}>
          <Ionicons name="sparkles" size={16} color={colors.sage} style={ill.sparkle1} />
          <Ionicons name="sparkles" size={12} color={colors.sage} style={ill.sparkle2} />
        </View>
      </View>
    </View>
  );
}

function TrophyIllustration({ colors, ill }: { colors: ThemeColors; ill: ReturnType<typeof buildIllustrationStyles> }) {
  return (
    <View style={ill.container}>
      <View style={ill.circleBackground}>
        <Ionicons name="trophy" size={48} color={colors.greenGlow} />
        <View style={ill.starsContainer}>
          <Ionicons name="star" size={14} color={colors.sage} style={ill.star1} />
          <Ionicons name="star" size={10} color={colors.sage} style={ill.star2} />
          <Ionicons name="star" size={12} color={colors.sage} style={ill.star3} />
        </View>
      </View>
    </View>
  );
}

function RocketIllustration({ colors, ill }: { colors: ThemeColors; ill: ReturnType<typeof buildIllustrationStyles> }) {
  return (
    <View style={ill.container}>
      <View style={ill.circleBackground}>
        <Ionicons name="rocket" size={48} color={colors.greenGlow} />
        <View style={ill.trailContainer}>
          <View style={[ill.trail, ill.trail1]} />
          <View style={[ill.trail, ill.trail2]} />
          <View style={[ill.trail, ill.trail3]} />
        </View>
      </View>
    </View>
  );
}

function HistoryIllustration({ colors, ill }: { colors: ThemeColors; ill: ReturnType<typeof buildIllustrationStyles> }) {
  return (
    <View style={ill.container}>
      <View style={ill.circleBackground}>
        <Ionicons name="time" size={48} color={colors.greenGlow} />
        <View style={ill.clockAccent}>
          <View style={ill.clockDot} />
        </View>
      </View>
    </View>
  );
}

export default function EmptyState({
  illustration,
  title,
  subtitle,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  const { colors } = useTheme();
  const illustrationStyles = useMemo(() => buildIllustrationStyles(colors), [colors]);
  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: { alignItems: 'center', justifyContent: 'center', paddingVertical: 40, paddingHorizontal: 32 },
        title: {
          fontSize: 20,
          fontWeight: '700',
          color: colors.textPrimary,
          marginTop: 24,
          textAlign: 'center',
        },
        subtitle: {
          fontSize: 14,
          color: colors.sage,
          marginTop: 8,
          textAlign: 'center',
          lineHeight: 20,
          opacity: 0.9,
        },
        actionButton: {
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: colors.greenGlow,
          paddingVertical: 14,
          paddingHorizontal: 24,
          borderRadius: 12,
          marginTop: 24,
          gap: 8,
        },
        actionText: { fontSize: 16, fontWeight: '600', color: colors.charcoal },
      }),
    [colors]
  );

  const illustrationEl = (() => {
    const ill = illustrationStyles;
    const c = colors;
    switch (illustration) {
      case 'mountain':
        return <MountainIllustration colors={c} ill={ill} />;
      case 'book':
        return <BookIllustration colors={c} ill={ill} />;
      case 'trophy':
        return <TrophyIllustration colors={c} ill={ill} />;
      case 'rocket':
        return <RocketIllustration colors={c} ill={ill} />;
      case 'history':
        return <HistoryIllustration colors={c} ill={ill} />;
      default:
        return <MountainIllustration colors={c} ill={ill} />;
    }
  })();

  return (
    <Animated.View entering={FadeInDown.duration(400).springify()} style={styles.container}>
      {illustrationEl}
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
      {actionLabel && onAction && (
        <TouchableOpacity style={styles.actionButton} onPress={onAction} activeOpacity={0.8}>
          <Text style={styles.actionText}>{actionLabel}</Text>
          <Ionicons name="arrow-forward" size={18} color={colors.charcoal} />
        </TouchableOpacity>
      )}
    </Animated.View>
  );
}
