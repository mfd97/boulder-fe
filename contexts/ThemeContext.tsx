import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colorsDark, colorsLight, type ThemeColors } from '@/constants/colors';

const COLOR_SCHEME_KEY = '@app/colorScheme';

export type ColorSchemePreference = 'light' | 'dark' | 'system';

type ResolvedScheme = 'light' | 'dark';

interface ThemeContextValue {
  colorScheme: ColorSchemePreference;
  setColorScheme: (value: ColorSchemePreference) => void;
  colors: ThemeColors;
  isDark: boolean;
  resolvedScheme: ResolvedScheme;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function resolveScheme(preference: ColorSchemePreference, systemScheme: 'light' | 'dark' | null | undefined): ResolvedScheme {
  if (preference === 'system') {
    return systemScheme === 'light' ? 'light' : 'dark';
  }
  return preference;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemColorScheme = useColorScheme();
  const [colorScheme, setColorSchemeState] = useState<ColorSchemePreference>('dark');

  useEffect(() => {
    AsyncStorage.getItem(COLOR_SCHEME_KEY).then((stored) => {
      if (stored === 'light' || stored === 'dark' || stored === 'system') {
        setColorSchemeState(stored);
      }
    });
  }, []);

  const setColorScheme = useCallback((value: ColorSchemePreference) => {
    setColorSchemeState(value);
    AsyncStorage.setItem(COLOR_SCHEME_KEY, value);
  }, []);

  const resolvedScheme = useMemo(
    () => resolveScheme(colorScheme, systemColorScheme ?? null),
    [colorScheme, systemColorScheme]
  );

  const colors = useMemo(
    () => (resolvedScheme === 'dark' ? colorsDark : colorsLight),
    [resolvedScheme]
  );

  const isDark = resolvedScheme === 'dark';

  const value = useMemo<ThemeContextValue>(
    () => ({
      colorScheme,
      setColorScheme,
      colors,
      isDark,
      resolvedScheme,
    }),
    [colorScheme, setColorScheme, colors, isDark, resolvedScheme]
  );

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return ctx;
}
