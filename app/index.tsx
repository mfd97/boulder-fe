import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';

export default function Index() {
  const [isReady, setIsReady] = useState(false);

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

  return <Redirect href="/(protected)/(tabs)/home" />;
}
