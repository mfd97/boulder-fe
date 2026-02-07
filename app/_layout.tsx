import { Stack, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { View, StatusBar } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from "react-native-reanimated";
import * as SplashScreen from "expo-splash-screen";
import * as SecureStore from "expo-secure-store";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import LaunchScreen from "@/components/LaunchScreen";
import { AuthContext } from "@/context/AuthContext";
import { SocketProvider, useSocket } from "@/contexts/SocketContext";
import { ThemeProvider, useTheme } from "@/contexts/ThemeContext";
import { onUnauthorized } from "@/lib/authEvents";

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  const [isLaunching, setIsLaunching] = useState(true);
  const appOpacity = useSharedValue(0);
  const [isAuth, setIsAuth] = useState(false);
  const router = useRouter();
  const { disconnect } = useSocket();
  const { colors, isDark } = useTheme();

  const checkToken = async () => {
    const token = await SecureStore.getItemAsync("token");
    if (token) setIsAuth(true);
  };

  useEffect(() => {
    checkToken();
    const timer = setTimeout(() => {
      SplashScreen.hideAsync();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const unsub = onUnauthorized(() => {
      disconnect();
      setIsAuth(false);
      router.replace("/login");
    });
    return unsub;
  }, [disconnect, router]);

  const handleAnimationComplete = () => {
    appOpacity.value = withTiming(1, {
      duration: 500,
      easing: Easing.out(Easing.ease),
    });
    setTimeout(() => {
      setIsLaunching(false);
    }, 100);
  };

  const appAnimatedStyle = useAnimatedStyle(() => ({
    opacity: appOpacity.value,
  }));

  return (
    <AuthContext.Provider value={{isAuth, setIsAuth}}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        {isLaunching && (
          <LaunchScreen onAnimationComplete={handleAnimationComplete} />
        )}
        <Animated.View
          style={[
            { flex: 1, backgroundColor: colors.background },
            appAnimatedStyle,
            { position: isLaunching ? "absolute" : "relative" },
          ]}
        >
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: {
                backgroundColor: colors.background,
              },
            }}
          />
        </Animated.View>
      </View>
    </AuthContext.Provider>
  );
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <SocketProvider>
        <ThemeProvider>
          <RootLayoutNav />
        </ThemeProvider>
      </SocketProvider>
    </QueryClientProvider>
  );
}
