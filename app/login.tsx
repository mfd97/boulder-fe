import React, { useContext, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/contexts/ThemeContext';
import { router } from 'expo-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { login } from '@/api/auth';
import { AuthContext } from '@/context/AuthContext';
import { setItemAsync } from 'expo-secure-store';
import Input from './components/Input';
import type { AxiosError } from 'axios';
import { useSocket } from '@/contexts/SocketContext';

function AnimatedButton({
  children,
  onPress,
  style,
  disabled,
  accessibilityLabel: a11yLabel,
  accessibilityHint: a11yHint,
}: {
  children: React.ReactNode;
  onPress: () => void;
  style?: any;
  disabled?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return (
    <Pressable
      onPress={() => {
        if (disabled) return;
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
      }}
      onPressIn={() => { scale.value = withSpring(0.97, { damping: 15 }); }}
      onPressOut={() => { scale.value = withSpring(1, { damping: 15 }); }}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={a11yLabel}
      accessibilityHint={a11yHint}
    >
      <Animated.View style={[style, animatedStyle]}>{children}</Animated.View>
    </Pressable>
  );
}

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginScreen() {
  const { colors } = useTheme();
  const styles = useLoginStyles(colors);
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loginError, setLoginError] = useState<string | null>(null)
  const [emailTouched, setEmailTouched] = useState(false)
  const { setIsAuth} = useContext(AuthContext)
  const queryClient = useQueryClient()
  const { connect } = useSocket()

  // Validation helpers
  const isEmailValid = EMAIL_REGEX.test(email);
  const emailError = emailTouched && email.length > 0 && !isEmailValid 
    ? "Please enter a valid email address" 
    : undefined;

  const handleEmailChange = useCallback((text: string) => {
    setEmail(text);
    setEmailTouched(true);
    // Clear login error when user starts typing
    if (loginError) setLoginError(null);
  }, [loginError]);

  const handlePasswordChange = useCallback((text: string) => {
    setPassword(text);
    // Clear login error when user starts typing
    if (loginError) setLoginError(null);
  }, [loginError]);

  const {mutate, isPending} = useMutation({
    mutationKey:["login"],
    mutationFn: ()=>login({email:email, password:password }),
    onSuccess: async (data) =>{
      // 1. Store the token
      await setItemAsync("token", data.token)
      
      // 2. Clear all cached data from previous user
      queryClient.clear()
      
      // 3. Connect to socket for real-time features
      connect()
      
      // 4. Set user to use
      setIsAuth(true)     

      // 5. Navigate to home page
      router.replace("/(protected)/(tabs)/home")
    },
    onError(err: AxiosError<{ error?: string }>){
      // Extract error message from response or use generic message
      const errorMessage = 
        err?.response?.data?.error || 
        err?.message || 
        'Invalid email or password. Please try again.';
      setLoginError(errorMessage);
    }
  })

  const handleLogin = () => {
    // Clear previous errors
    setLoginError(null);
    
    // Validate before submitting
    if (!email.trim() || !password.trim()) {
      setLoginError('Please enter both email and password.');
      return;
    }
    
    if (!isEmailValid) {
      setLoginError('Please enter a valid email address.');
      return;
    }
    
    mutate()
  } 

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            {/* Logo - B brand */}
            <View style={styles.logoContainer}>
              <View style={styles.logoIcon}>
                <Text style={styles.logoText}>B</Text>
              </View>
              <Text style={styles.brandText}>BOULDER</Text>
            </View>

            <Text style={styles.welcomeText}>Welcome Back.</Text>
            <Text style={styles.subtitle}>Log in to continue your learning journey.</Text>

            <View style={styles.form}>
              {loginError && (
                <View style={styles.errorBanner} accessibilityRole="alert">
                  <Text style={styles.errorBannerText}>{loginError}</Text>
                </View>
              )}

              <Input
                label="Email"
                value={email}
                onChangeText={handleEmailChange}
                autoCapitalize="none"
                keyboardType="email-address"
                autoComplete="email"
                error={emailError}
                isValid={isEmailValid}
                showValidation={emailTouched && email.length > 0}
                editable={!isPending}
              />

              <View style={styles.passwordSection}>
                <Input
                  label="Password"
                  value={password}
                  onChangeText={handlePasswordChange}
                  secureTextEntry
                  autoComplete="password"
                  editable={!isPending}
                />
              </View>

              <AnimatedButton
                onPress={handleLogin}
                disabled={isPending}
                style={[styles.loginButton, isPending && styles.loginButtonDisabled]}
                accessibilityLabel="Log in"
                accessibilityHint="Submits your email and password to sign in"
              >
                {isPending ? (
                  <ActivityIndicator color={colors.charcoal} size="small" />
                ) : (
                  <Text style={styles.loginButtonText}>LOGIN</Text>
                )}
              </AnimatedButton>

              <View style={styles.signUpContainer}>
                <Text style={styles.signUpText}>Don&apos;t have an account? </Text>
                <TouchableOpacity
                  onPress={() => router.push("/register")}
                  accessibilityRole="link"
                  accessibilityLabel="Sign up"
                  accessibilityHint="Opens the sign up screen to create an account"
                >
                  <Text style={styles.signUpLink}>Sign Up</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function useLoginStyles(colors: ReturnType<typeof useTheme>['colors']) {
  return useMemo(
    () =>
      StyleSheet.create({
        container: { flex: 1, backgroundColor: colors.background },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 48,
    paddingBottom: 32,
    justifyContent: 'center',
  },
  content: {
    width: '100%',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 40,
  },
  logoIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: colors.greenGlow,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.charcoal,
  },
  brandText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.textPrimary,
    letterSpacing: 1,
  },
  welcomeText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textPrimary,
    opacity: 0.7,
    marginBottom: 40,
  },
  form: {
    width: '100%',
  },
  passwordSection: {
    position: 'relative',
  },
  loginButton: {
    backgroundColor: colors.sage,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 24,
    minHeight: 52,
    justifyContent: 'center',
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.charcoal,
    letterSpacing: 1,
  },
  errorBanner: {
    backgroundColor: 'rgba(255, 107, 107, 0.15)',
    borderWidth: 1,
    borderColor: colors.error,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorBannerText: {
    color: colors.error,
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
  },
  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signUpText: {
    fontSize: 14,
    color: colors.textPrimary,
    opacity: 0.8,
  },
  signUpLink: {
    fontSize: 15,
    color: colors.greenGlow,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
      }),
    [colors]
  );
}