import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { colors } from '@/constants/colors';

type IllustrationType = 'mountain' | 'book' | 'trophy' | 'rocket' | 'history';

interface EmptyStateProps {
  illustration: IllustrationType;
  title: string;
  subtitle: string;
  actionLabel?: string;
  onAction?: () => void;
}

// Custom illustration components that match the app's dark theme and green accents
function MountainIllustration() {
  return (
    <View style={illustrationStyles.container}>
      <View style={illustrationStyles.circleBackground}>
        {/* Mountain peaks */}
        <View style={illustrationStyles.mountainContainer}>
          <View style={[illustrationStyles.mountain, illustrationStyles.mountainLeft]} />
          <View style={[illustrationStyles.mountain, illustrationStyles.mountainCenter]} />
          <View style={[illustrationStyles.mountain, illustrationStyles.mountainRight]} />
        </View>
        {/* Flag on top */}
        <View style={illustrationStyles.flagContainer}>
          <View style={illustrationStyles.flagPole} />
          <Ionicons name="flag" size={16} color={colors.greenGlow} />
        </View>
      </View>
    </View>
  );
}

function BookIllustration() {
  return (
    <View style={illustrationStyles.container}>
      <View style={illustrationStyles.circleBackground}>
        <Ionicons name="book" size={48} color={colors.greenGlow} />
        <View style={illustrationStyles.sparkleContainer}>
          <Ionicons name="sparkles" size={16} color={colors.sage} style={illustrationStyles.sparkle1} />
          <Ionicons name="sparkles" size={12} color={colors.sage} style={illustrationStyles.sparkle2} />
        </View>
      </View>
    </View>
  );
}

function TrophyIllustration() {
  return (
    <View style={illustrationStyles.container}>
      <View style={illustrationStyles.circleBackground}>
        <Ionicons name="trophy" size={48} color={colors.greenGlow} />
        <View style={illustrationStyles.starsContainer}>
          <Ionicons name="star" size={14} color={colors.sage} style={illustrationStyles.star1} />
          <Ionicons name="star" size={10} color={colors.sage} style={illustrationStyles.star2} />
          <Ionicons name="star" size={12} color={colors.sage} style={illustrationStyles.star3} />
        </View>
      </View>
    </View>
  );
}

function RocketIllustration() {
  return (
    <View style={illustrationStyles.container}>
      <View style={illustrationStyles.circleBackground}>
        <Ionicons name="rocket" size={48} color={colors.greenGlow} />
        <View style={illustrationStyles.trailContainer}>
          <View style={[illustrationStyles.trail, illustrationStyles.trail1]} />
          <View style={[illustrationStyles.trail, illustrationStyles.trail2]} />
          <View style={[illustrationStyles.trail, illustrationStyles.trail3]} />
        </View>
      </View>
    </View>
  );
}

function HistoryIllustration() {
  return (
    <View style={illustrationStyles.container}>
      <View style={illustrationStyles.circleBackground}>
        <Ionicons name="time" size={48} color={colors.greenGlow} />
        <View style={illustrationStyles.clockAccent}>
          <View style={illustrationStyles.clockDot} />
        </View>
      </View>
    </View>
  );
}

function getIllustration(type: IllustrationType) {
  switch (type) {
    case 'mountain':
      return <MountainIllustration />;
    case 'book':
      return <BookIllustration />;
    case 'trophy':
      return <TrophyIllustration />;
    case 'rocket':
      return <RocketIllustration />;
    case 'history':
      return <HistoryIllustration />;
    default:
      return <MountainIllustration />;
  }
}

export default function EmptyState({
  illustration,
  title,
  subtitle,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <Animated.View 
      entering={FadeInDown.duration(400).springify()}
      style={styles.container}
    >
      {getIllustration(illustration)}
      
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
      
      {actionLabel && onAction && (
        <TouchableOpacity 
          style={styles.actionButton} 
          onPress={onAction}
          activeOpacity={0.8}
        >
          <Text style={styles.actionText}>{actionLabel}</Text>
          <Ionicons name="arrow-forward" size={18} color={colors.charcoal} />
        </TouchableOpacity>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 32,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.offWhite,
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
  actionText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.charcoal,
  },
});

const illustrationStyles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleBackground: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.darkGrey,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(159, 242, 148, 0.2)',
  },
  // Mountain styles
  mountainContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 50,
    gap: -10,
  },
  mountain: {
    width: 0,
    height: 0,
    borderLeftWidth: 20,
    borderRightWidth: 20,
    borderBottomWidth: 35,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
  mountainLeft: {
    borderBottomColor: colors.sage,
    opacity: 0.6,
    transform: [{ translateY: 5 }],
  },
  mountainCenter: {
    borderBottomColor: colors.greenGlow,
    borderLeftWidth: 25,
    borderRightWidth: 25,
    borderBottomWidth: 45,
    zIndex: 1,
  },
  mountainRight: {
    borderBottomColor: colors.sage,
    opacity: 0.6,
    transform: [{ translateY: 8 }],
  },
  flagContainer: {
    position: 'absolute',
    top: 20,
    alignItems: 'center',
  },
  flagPole: {
    width: 2,
    height: 20,
    backgroundColor: colors.greenGlow,
  },
  // Sparkle styles
  sparkleContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  sparkle1: {
    position: 'absolute',
    top: 15,
    right: 20,
  },
  sparkle2: {
    position: 'absolute',
    bottom: 25,
    left: 18,
  },
  // Stars styles
  starsContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  star1: {
    position: 'absolute',
    top: 18,
    right: 22,
  },
  star2: {
    position: 'absolute',
    top: 30,
    left: 20,
  },
  star3: {
    position: 'absolute',
    bottom: 25,
    right: 28,
  },
  // Trail styles
  trailContainer: {
    position: 'absolute',
    bottom: 20,
    left: '50%',
    marginLeft: -15,
  },
  trail: {
    width: 6,
    borderRadius: 3,
    backgroundColor: colors.sage,
    marginTop: 3,
    alignSelf: 'center',
  },
  trail1: {
    height: 12,
    opacity: 0.8,
  },
  trail2: {
    height: 8,
    opacity: 0.5,
    width: 4,
  },
  trail3: {
    height: 5,
    opacity: 0.3,
    width: 3,
  },
  // Clock styles
  clockAccent: {
    position: 'absolute',
    top: 15,
    right: 25,
  },
  clockDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.sage,
  },
});
