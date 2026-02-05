import { AuthContext } from '@/context/AuthContext';
import { Redirect } from 'expo-router';
import { useContext, useEffect, useState } from 'react';

export default function Index() {
  const [isReady, setIsReady] = useState(false);
  const { isAuth } = useContext(AuthContext);

  useEffect(() => {
    // Small delay to ensure smooth transition
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  if (!isReady) {
    return null;
  }

  if (!isAuth) {
    return <Redirect href="/login" />;
  }


  return <Redirect href="/(protected)/(tabs)/home" />;

}
