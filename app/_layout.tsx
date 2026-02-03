import { Stack } from "expo-router";
import { useEffect, useState } from "react";
import { View } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from "react-native-reanimated";
import * as SplashScreen from "expo-splash-screen";
import LaunchScreen from "@/components/LaunchScreen";
import { colors } from "@/constants/colors";

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [isLaunching, setIsLaunching] = useState(true);
  const appOpacity = useSharedValue(0);

  useEffect(() => {
    // Hide native splash screen after a delay
    const timer = setTimeout(() => {
      SplashScreen.hideAsync();
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const handleAnimationComplete = () => {
    // Start fading in the main app before hiding launch screen
    appOpacity.value = withTiming(1, {
      duration: 500,
      easing: Easing.out(Easing.ease),
    });
    // Small delay to ensure smooth cross-fade
    setTimeout(() => {
      setIsLaunching(false);
    }, 100);
  };

  const appAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: appOpacity.value,
    };
  });

  return (
    <View style={{ flex: 1, backgroundColor: colors.charcoal }}>
      {isLaunching && (
        <LaunchScreen onAnimationComplete={handleAnimationComplete} />
      )}
      <Animated.View
        style={[
          { flex: 1, backgroundColor: colors.charcoal },
          appAnimatedStyle,
          { position: isLaunching ? 'absolute' : 'relative' },
        ]}
      >
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: {
              backgroundColor: colors.charcoal,
            },
          }}
        />
      </Animated.View>
    </View>
  );
}
