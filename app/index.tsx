import { AuthContext } from '@/context/AuthContext';
import { Redirect } from 'expo-router';
import { useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ONBOARDING_KEY = '@boulder_onboarding_complete';

export default function Index() {
  const [isReady, setIsReady] = useState(false);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState<boolean | null>(null);
  const { isAuth } = useContext(AuthContext);

  useEffect(() => {
    const checkOnboarding = async () => {
      try {
        const value = await AsyncStorage.getItem(ONBOARDING_KEY);
        setHasSeenOnboarding(value === 'true');
      } catch (error) {
        console.error('Error checking onboarding state:', error);
        setHasSeenOnboarding(true); // Default to true on error
      }
      
      // Small delay to ensure smooth transition
      setTimeout(() => {
        setIsReady(true);
      }, 100);
    };

    checkOnboarding();
  }, []);

  if (!isReady || hasSeenOnboarding === null) {
    return null;
  }

  // First-time user: show onboarding
  if (!hasSeenOnboarding) {
    return <Redirect href="/onboarding" />;
  }

  // Returning user: check auth
  if (!isAuth) {
    return <Redirect href="/login" />;
  }

  return <Redirect href="/(protected)/(tabs)/home" />;
}
