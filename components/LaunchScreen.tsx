import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { colors } from '@/constants/colors';
import AnimatedMeshGradient from './AnimatedMeshGradient';

const { width, height } = Dimensions.get('window');

interface LaunchScreenProps {
  onAnimationComplete: () => void;
}

export default function LaunchScreen({ onAnimationComplete }: LaunchScreenProps) {
  const logoScale = useSharedValue(0);
  const logoOpacity = useSharedValue(0);
  const textOpacity = useSharedValue(0);
  const textTranslateY = useSharedValue(20);
  const containerOpacity = useSharedValue(1);

  useEffect(() => {
    // Logo animation - scale and fade in
    logoScale.value = withSequence(
      withTiming(1.2, {
        duration: 600,
        easing: Easing.out(Easing.cubic),
      }),
      withTiming(1, {
        duration: 300,
        easing: Easing.inOut(Easing.ease),
      })
    );
    logoOpacity.value = withTiming(1, {
      duration: 600,
      easing: Easing.out(Easing.ease),
    });

    // Text animation - fade in and slide up
    textOpacity.value = withDelay(
      400,
      withTiming(1, {
        duration: 500,
        easing: Easing.out(Easing.ease),
      })
    );
    textTranslateY.value = withDelay(
      400,
      withTiming(0, {
        duration: 500,
        easing: Easing.out(Easing.ease),
      })
    );

    // Fade out animation before navigating
    const fadeOutTimer = setTimeout(() => {
      containerOpacity.value = withTiming(0, {
        duration: 500,
        easing: Easing.inOut(Easing.ease),
      });
    }, 1800);

    // Complete animation and navigate after fade out
    const completeTimer = setTimeout(() => {
      onAnimationComplete();
    }, 2300);

    return () => {
      clearTimeout(fadeOutTimer);
      clearTimeout(completeTimer);
    };
  }, [onAnimationComplete]);

  const logoAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: logoScale.value }],
      opacity: logoOpacity.value,
    };
  });

  const textAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: textOpacity.value,
      transform: [{ translateY: textTranslateY.value }],
    };
  });

  const containerAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: containerOpacity.value,
    };
  });

  return (
    <Animated.View style={[styles.container, containerAnimatedStyle]}>
      <AnimatedMeshGradient />
      <View style={styles.content}>
        {/* Logo/B Icon */}
        <Animated.View style={[styles.logoContainer, logoAnimatedStyle]}>
          <View style={styles.logoIcon}>
            <Text style={styles.logoText}>B</Text>
          </View>
        </Animated.View>

        {/* App Name */}
        <Animated.View style={textAnimatedStyle}>
          <Text style={styles.appName}>BOULDER</Text>
        </Animated.View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.charcoal,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    marginBottom: 24,
  },
  logoIcon: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: colors.greenGlow,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.greenGlow,
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  logoText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: colors.charcoal,
  },
  appName: {
    fontSize: 36,
    fontWeight: 'bold',
    color: colors.offWhite,
    letterSpacing: 4,
  },
});
