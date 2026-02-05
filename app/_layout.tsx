import { Stack } from "expo-router";
import { useEffect, useState, useCallback } from "react";
import { View } from "react-native";
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
import { colors } from "@/constants/colors";
import { AuthContext } from "@/context/AuthContext";

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  const [isLaunching, setIsLaunching] = useState(true);
  const appOpacity = useSharedValue(0);
  const [isAuth, setIsAuth] = useState(false);

  // const logout = useCallback(async () => {
  //   await SecureStore.deleteItemAsync("token");
  //   setUser(null);
  // }, []);

  const checkToken = async () => {
    const token = await SecureStore.getItemAsync("token")
    if(token){
      setIsAuth(true)
    }
  }


  useEffect(() => {
    checkToken()
    const timer = setTimeout(() => {
      SplashScreen.hideAsync();
    }, 100);
    return () => clearTimeout(timer);


  }, []);

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
      <View style={{ flex: 1, backgroundColor: colors.charcoal }}>
        {isLaunching && (
          <LaunchScreen onAnimationComplete={handleAnimationComplete} />
        )}
        <Animated.View
          style={[
            { flex: 1, backgroundColor: colors.charcoal },
            appAnimatedStyle,
            { position: isLaunching ? "absolute" : "relative" },
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
    </AuthContext.Provider>
  );
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <RootLayoutNav />
    </QueryClientProvider>
  );
}
