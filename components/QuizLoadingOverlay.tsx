import React, { useEffect, useState, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface QuizLoadingOverlayProps {
  topic: string;
  visible: boolean;
}

// Progress steps for quiz generation
const PROGRESS_STEPS = [
  { icon: 'search-outline' as const, text: 'Analyzing your topic...' },
  { icon: 'bulb-outline' as const, text: 'Crafting questions...' },
  { icon: 'shuffle-outline' as const, text: 'Mixing up the answers...' },
  { icon: 'checkmark-circle-outline' as const, text: 'Almost ready!' },
];

// Fun tips to show while loading
const LOADING_TIPS = [
  "Did you know? Quizzing yourself is one of the most effective study techniques!",
  "Tip: Taking quizzes helps move information from short-term to long-term memory.",
  "Fun fact: The 'testing effect' shows that recalling info strengthens memory more than re-reading.",
  "Pro tip: Don't worry about wrong answers - they help you learn what to focus on!",
  "Research shows: Spacing your quizzes over time leads to better retention.",
  "Remember: Making mistakes is a crucial part of the learning process!",
];

export default function QuizLoadingOverlay({ topic, visible }: QuizLoadingOverlayProps) {
  const { colors } = useTheme();
  const [currentStep, setCurrentStep] = useState(0);
  const [currentTip, setCurrentTip] = useState(0);
  const spinValue = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const stepProgress = useRef(new Animated.Value(0)).current;
  const styles = useMemo(
    () =>
      StyleSheet.create({
        overlay: {
          ...StyleSheet.absoluteFillObject,
          backgroundColor: colors.background,
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
        },
        content: { alignItems: 'center', paddingHorizontal: 32, width: '100%' },
        iconContainer: {
          width: 100,
          height: 100,
          borderRadius: 50,
          backgroundColor: colors.darkGrey,
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: 32,
        },
        topicLabel: { fontSize: 14, color: colors.sage, marginBottom: 8 },
        topicText: {
          fontSize: 22,
          fontWeight: '600',
          color: colors.textPrimary,
          textAlign: 'center',
          marginBottom: 40,
          maxWidth: SCREEN_WIDTH * 0.8,
        },
        stepsContainer: {
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 24,
          marginBottom: 16,
        },
        step: {
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundColor: colors.darkGrey,
          justifyContent: 'center',
          alignItems: 'center',
          borderWidth: 2,
          borderColor: 'transparent',
        },
        stepActive: {
          borderColor: colors.greenGlow,
          backgroundColor: colors.greenGlow + '1A',
        },
        progressBarContainer: {
          width: '80%',
          height: 4,
          backgroundColor: colors.darkGrey,
          borderRadius: 2,
          marginBottom: 24,
          overflow: 'hidden',
        },
        progressBar: { height: '100%', backgroundColor: colors.greenGlow, borderRadius: 2 },
        stepText: {
          fontSize: 18,
          fontWeight: '500',
          color: colors.textPrimary,
          marginBottom: 48,
        },
        tipContainer: {
          flexDirection: 'row',
          alignItems: 'flex-start',
          gap: 10,
          backgroundColor: colors.darkGrey,
          padding: 16,
          borderRadius: 12,
          maxWidth: SCREEN_WIDTH * 0.85,
        },
        tipText: { flex: 1, fontSize: 14, color: colors.sage, lineHeight: 20 },
        timeWarning: { marginTop: 32, fontSize: 12, color: colors.sage, opacity: 0.7 },
      }),
    [colors]
  );

  // Reset when visibility changes
  useEffect(() => {
    if (visible) {
      setCurrentStep(0);
      setCurrentTip(Math.floor(Math.random() * LOADING_TIPS.length));
      fadeAnim.setValue(0);
      stepProgress.setValue(0);
      
      // Fade in
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

      // Start spinning animation
      Animated.loop(
        Animated.timing(spinValue, {
          toValue: 1,
          duration: 2000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();
    }
  }, [visible]);

  // Progress through steps
  useEffect(() => {
    if (!visible) return;

    const stepInterval = setInterval(() => {
      setCurrentStep(prev => {
        if (prev < PROGRESS_STEPS.length - 1) {
          // Animate progress bar
          Animated.timing(stepProgress, {
            toValue: (prev + 1) / (PROGRESS_STEPS.length - 1),
            duration: 500,
            useNativeDriver: false,
          }).start();
          return prev + 1;
        }
        return prev;
      });
    }, 8000); // Change step every 8 seconds

    return () => clearInterval(stepInterval);
  }, [visible]);

  // Rotate tips
  useEffect(() => {
    if (!visible) return;

    const tipInterval = setInterval(() => {
      setCurrentTip(prev => (prev + 1) % LOADING_TIPS.length);
    }, 6000); // Change tip every 6 seconds

    return () => clearInterval(tipInterval);
  }, [visible]);

  if (!visible) return null;

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const progressWidth = stepProgress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
      <View style={styles.content}>
        {/* Spinning Icon */}
        <Animated.View style={[styles.iconContainer, { transform: [{ rotate: spin }] }]}>
          <Ionicons name="sparkles" size={48} color={colors.greenGlow} />
        </Animated.View>

        {/* Topic */}
        <Text style={styles.topicLabel}>Generating quiz for</Text>
        <Text style={styles.topicText} numberOfLines={2}>
          "{topic}"
        </Text>

        {/* Progress Steps */}
        <View style={styles.stepsContainer}>
          {PROGRESS_STEPS.map((step, index) => (
            <View
              key={index}
              style={[
                styles.step,
                index <= currentStep && styles.stepActive,
              ]}
            >
              <Ionicons
                name={step.icon}
                size={20}
                color={index <= currentStep ? colors.greenGlow : colors.sage}
              />
            </View>
          ))}
        </View>

        {/* Progress Bar */}
        <View style={styles.progressBarContainer}>
          <Animated.View
            style={[
              styles.progressBar,
              { width: progressWidth },
            ]}
          />
        </View>

        {/* Current Step Text */}
        <Text style={styles.stepText}>
          {PROGRESS_STEPS[currentStep].text}
        </Text>

        {/* Tip Section */}
        <View style={styles.tipContainer}>
          <Ionicons name="bulb" size={16} color={colors.sage} />
          <Text style={styles.tipText}>{LOADING_TIPS[currentTip]}</Text>
        </View>

        {/* Time Warning */}
        <Text style={styles.timeWarning}>
          This usually takes 30-60 seconds
        </Text>
      </View>
    </Animated.View>
  );
}

