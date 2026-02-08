import React, { useState, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  FlatList,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '@/contexts/ThemeContext';
import { typography } from '@/constants/typography';
import { spacing } from '@/constants/spacing';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface OnboardingSlide {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
}

const ONBOARDING_SLIDES: OnboardingSlide[] = [
  {
    id: '1',
    icon: 'bulb-outline',
    title: 'Learn Any Topic',
    description: 'Generate AI-powered quizzes on any subject you want to master. From science to history, we\'ve got you covered.',
  },
  {
    id: '2',
    icon: 'flame-outline',
    title: 'Build Your Streak',
    description: 'Complete quizzes daily to build your streak. Stay consistent and watch your knowledge grow over time.',
  },
  {
    id: '3',
    icon: 'trophy-outline',
    title: 'Track Your Mastery',
    description: 'See your progress with detailed statistics. Identify your strongest topics and areas for improvement.',
  },
  {
    id: '4',
    icon: 'game-controller-outline',
    title: 'Compete & Climb',
    description: 'Challenge friends to real-time quizzes and see who comes out on top. Climb the friends leaderboard and stay on your toes.',
  },
];

const ONBOARDING_KEY = '@boulder_onboarding_complete';

export default function OnboardingScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: { flex: 1, backgroundColor: colors.background },
        header: { flexDirection: 'row', justifyContent: 'flex-end', paddingHorizontal: spacing.xl, paddingTop: spacing.sm },
        skipButton: { padding: spacing.sm },
        skipText: { ...typography.body, color: colors.sage },
        slide: {
          width: SCREEN_WIDTH,
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          paddingHorizontal: spacing.section,
        },
        iconContainer: {
          width: 160,
          height: 160,
          borderRadius: 80,
          backgroundColor: colors.darkGrey,
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: spacing.xxxl + spacing.lg,
        },
        title: {
          ...typography.title,
          fontSize: 28,
          color: colors.textPrimary,
          textAlign: 'center',
          marginBottom: spacing.lg,
        },
        description: {
          ...typography.body,
          color: colors.textPrimary,
          opacity: 0.8,
          textAlign: 'center',
        },
        bottomSection: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xl },
        dotsContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: spacing.xxxl },
        dot: {
          height: spacing.sm,
          borderRadius: spacing.xs,
          backgroundColor: colors.greenGlow,
          marginHorizontal: spacing.xs,
        },
        nextButton: {
          backgroundColor: colors.sage,
          borderRadius: 16,
          paddingVertical: spacing.xl,
          paddingHorizontal: spacing.xxl,
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          gap: spacing.sm,
        },
        nextButtonText: { ...typography.titleSmall, fontSize: 18, color: colors.charcoal, letterSpacing: 0.5 },
      }),
    [colors]
  );

  const handleComplete = async () => {
    try {
      await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
      router.replace('/login');
    } catch (error) {
      console.error('Error saving onboarding state:', error);
      router.replace('/login');
    }
  };

  const handleSkip = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    handleComplete();
  };

  const handleNext = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (currentIndex < ONBOARDING_SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
    } else {
      handleComplete();
    }
  };

  const renderSlide = ({ item }: { item: OnboardingSlide }) => (
    <View style={styles.slide}>
      <View style={styles.iconContainer}>
        <Ionicons name={item.icon} size={80} color={colors.greenGlow} />
      </View>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.description}>{item.description}</Text>
    </View>
  );

  const renderDots = () => (
    <View style={styles.dotsContainer}>
      {ONBOARDING_SLIDES.map((_, index) => {
        const inputRange = [
          (index - 1) * SCREEN_WIDTH,
          index * SCREEN_WIDTH,
          (index + 1) * SCREEN_WIDTH,
        ];

        const dotWidth = scrollX.interpolate({
          inputRange,
          outputRange: [8, 24, 8],
          extrapolate: 'clamp',
        });

        const dotOpacity = scrollX.interpolate({
          inputRange,
          outputRange: [0.4, 1, 0.4],
          extrapolate: 'clamp',
        });

        return (
          <Animated.View
            key={index}
            style={[
              styles.dot,
              {
                width: dotWidth,
                opacity: dotOpacity,
              },
            ]}
          />
        );
      })}
    </View>
  );

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index || 0);
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  const isLastSlide = currentIndex === ONBOARDING_SLIDES.length - 1;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Skip Button */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={handleSkip}
          style={styles.skipButton}
          accessibilityLabel="Skip onboarding"
          accessibilityRole="button"
        >
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>

      {/* Slides */}
      <Animated.FlatList
        ref={flatListRef}
        data={ONBOARDING_SLIDES}
        renderItem={renderSlide}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        scrollEventThrottle={16}
      />

      {/* Bottom Section */}
      <View style={styles.bottomSection}>
        {renderDots()}

        <TouchableOpacity
          style={styles.nextButton}
          onPress={handleNext}
          accessibilityLabel={isLastSlide ? 'Get started' : 'Next slide'}
          accessibilityRole="button"
        >
          <Text style={styles.nextButtonText}>
            {isLastSlide ? 'Get Started' : 'Next'}
          </Text>
          <Ionicons
            name={isLastSlide ? 'checkmark' : 'arrow-forward'}
            size={20}
            color={colors.charcoal}
          />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

