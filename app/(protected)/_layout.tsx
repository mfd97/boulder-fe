import { useEffect, useState, useContext } from 'react';
import { Stack, useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { colors } from '@/constants/colors';
import { AuthContext } from '@/context/AuthContext';

export default function ProtectedLayout() {
  const router = useRouter();
  const { setIsAuth } = useContext(AuthContext);
  const [hasCheckedToken, setHasCheckedToken] = useState(false);
  const [hasToken, setHasToken] = useState(false);

  useEffect(() => {
    let cancelled = false;
    SecureStore.getItemAsync('token').then((token) => {
      if (cancelled) return;
      setHasCheckedToken(true);
      if (token) {
        setHasToken(true);
      } else {
        setIsAuth(false);
        router.replace('/login');
      }
    });
    return () => {
      cancelled = true;
    };
  }, [setIsAuth, router]);

  if (!hasCheckedToken || !hasToken) {
    return null;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: colors.charcoal,
        },
        animation: 'slide_from_right',
        animationDuration: 250,
      }}
    />
  );
}
