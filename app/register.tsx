import { register } from '@/api/auth';
import type { ThemeColors } from '@/constants/colors';
import { AuthContext } from '@/context/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import * as Haptics from 'expo-haptics';
import React, { useContext, useState, useCallback, useMemo } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  ScrollView,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import Input from './components/Input';

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

// Validation constants
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;

function calculatePasswordStrength(
  password: string,
  colors: ThemeColors
): { score: number; label: string; color: string } {
  let score = 0;
  if (password.length >= MIN_PASSWORD_LENGTH) score += 1;
  if (password.length >= 12) score += 1;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 1;
  if (score <= 1) return { score, label: 'Weak', color: colors.error };
  if (score <= 2) return { score, label: 'Fair', color: '#FFB347' };
  if (score <= 3) return { score, label: 'Good', color: '#FFD93D' };
  if (score <= 4) return { score, label: 'Strong', color: colors.greenGlow };
  return { score, label: 'Very Strong', color: colors.greenGlow };
}

export default function RegisterScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const styles = useRegisterStyles(colors);
  const { setIsAuth } = useContext(AuthContext);
  const queryClient = useQueryClient();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [registerError, setRegisterError] = useState<string | null>(null);
  
  // Touch states for validation
  const [fullNameTouched, setFullNameTouched] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  
  // Validation states
  const isFullNameValid = fullName.trim().length >= 2;
  const isEmailValid = EMAIL_REGEX.test(email);
  const isPasswordValid = password.length >= MIN_PASSWORD_LENGTH;
  
  // Password strength
  const passwordStrength = useMemo(() => calculatePasswordStrength(password, colors), [password, colors]);
  
  // Error messages
  const fullNameError = fullNameTouched && fullName.length > 0 && !isFullNameValid
    ? 'Name must be at least 2 characters'
    : undefined;
  
  const emailError = emailTouched && email.length > 0 && !isEmailValid
    ? 'Please enter a valid email address'
    : undefined;
  
  const passwordError = passwordTouched && password.length > 0 && !isPasswordValid
    ? `Password must be at least ${MIN_PASSWORD_LENGTH} characters`
    : undefined;
  
  // Input change handlers
  const handleFullNameChange = useCallback((text: string) => {
    setFullName(text);
    setFullNameTouched(true);
    if (registerError) setRegisterError(null);
  }, [registerError]);
  
  const handleEmailChange = useCallback((text: string) => {
    setEmail(text);
    setEmailTouched(true);
    if (registerError) setRegisterError(null);
  }, [registerError]);
  
  const handlePasswordChange = useCallback((text: string) => {
    setPassword(text);
    setPasswordTouched(true);
    if (registerError) setRegisterError(null);
  }, [registerError]);

  const registerMutation = useMutation({
    mutationFn: register,
    onSuccess: async (data) => {
      try {
        // Store token in SecureStore
        await SecureStore.setItemAsync('token', data.token);

        // Clear all cached data (fresh start for new user)
        queryClient.clear();

        // Update AuthContext and navigate to home
        setIsAuth(true);
        router.replace('/(protected)/(tabs)/home');
      } catch {
        setRegisterError('Failed to save authentication data. Please try again.');
      }
    },
    onError: (error: AxiosError<{ error?: string }>) => {
      const errorMessage = 
        error?.response?.data?.error || 
        error?.message || 
        'Registration failed. Please try again.';
      setRegisterError(errorMessage);
    },
  });

  const handleRegister = () => {
    // Clear previous errors
    setRegisterError(null);
    
    // Mark all fields as touched to show validation
    setFullNameTouched(true);
    setEmailTouched(true);
    setPasswordTouched(true);
    
    // Validate all fields
    if (!fullName.trim() || !email.trim() || !password.trim()) {
      setRegisterError('Please fill in all fields.');
      return;
    }
    
    if (!isFullNameValid) {
      setRegisterError('Please enter a valid name (at least 2 characters).');
      return;
    }
    
    if (!isEmailValid) {
      setRegisterError('Please enter a valid email address.');
      return;
    }
    
    if (!isPasswordValid) {
      setRegisterError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
      return;
    }

    registerMutation.mutate({
      fullName: fullName.trim(),
      email: email.trim(),
      password,
    });
  };

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

            <Text style={styles.title}>Begin Your Ascent</Text>

            <View style={styles.form}>
              {registerError && (
                <View style={styles.errorBanner} accessibilityRole="alert">
                  <Text style={styles.errorBannerText}>{registerError}</Text>
                </View>
              )}

              <Input
                label="Full Name"
                value={fullName}
                onChangeText={handleFullNameChange}
                autoCapitalize="words"
                autoComplete="name"
                editable={!registerMutation.isPending}
                error={fullNameError}
                isValid={isFullNameValid}
                showValidation={fullNameTouched && fullName.length > 0}
              />

              <Input
                label="Email"
                value={email}
                onChangeText={handleEmailChange}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                editable={!registerMutation.isPending}
                error={emailError}
                isValid={isEmailValid}
                showValidation={emailTouched && email.length > 0}
              />

              <View style={styles.passwordSection}>
                <Text style={styles.passwordHint}>
                  Use 8+ characters, mix of letters and numbers for a stronger password.
                </Text>
                <Input
                  label="Password"
                  value={password}
                  onChangeText={handlePasswordChange}
                  secureTextEntry
                  autoComplete="password-new"
                  editable={!registerMutation.isPending}
                  error={passwordError}
                  isValid={isPasswordValid}
                  showValidation={passwordTouched && password.length > 0}
                />
                {password.length > 0 && (
                  <View style={styles.strengthContainer}>
                    <View style={styles.strengthBarContainer}>
                      {[1, 2, 3, 4, 5].map((level) => (
                        <View
                          key={level}
                          style={[
                            styles.strengthBar,
                            {
                              backgroundColor: level <= passwordStrength.score
                                ? passwordStrength.color
                                : colors.darkGrey,
                            },
                          ]}
                        />
                      ))}
                    </View>
                    <Text style={[styles.strengthLabel, { color: passwordStrength.color }]}>
                      {passwordStrength.label}
                    </Text>
                  </View>
                )}
              </View>

              <AnimatedButton
                onPress={handleRegister}
                disabled={registerMutation.isPending}
                style={[
                  styles.createButton,
                  registerMutation.isPending && styles.createButtonDisabled,
                ]}
                accessibilityLabel="Create account"
                accessibilityHint="Submits the form to register a new account"
              >
                {registerMutation.isPending ? (
                  <ActivityIndicator color={colors.charcoal} size="small" />
                ) : (
                  <Text style={styles.createButtonText}>CREATE ACCOUNT</Text>
                )}
              </AnimatedButton>

              <Text style={styles.termsText}>
                By signing up, you agree to our terms of service.
              </Text>

              <View style={styles.loginContainer}>
                <Text style={styles.loginText}>Already a member? </Text>
                <TouchableOpacity
                  onPress={() => router.push('/login')}
                  accessibilityRole="link"
                  accessibilityLabel="Log in"
                  accessibilityHint="Opens the login screen"
                >
                  <Text style={styles.loginLink}>Login</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function useRegisterStyles(colors: ThemeColors) {
  return useMemo(() => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 32,
  },
  content: {
    width: '100%',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 32,
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
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 32,
  },
  form: {
    width: '100%',
  },
  passwordSection: {
    marginBottom: 4,
  },
  passwordHint: {
    fontSize: 12,
    color: colors.sage,
    marginBottom: 8,
    lineHeight: 18,
  },
  createButton: {
    backgroundColor: colors.sage,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 12,
    minHeight: 52,
    justifyContent: 'center',
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.charcoal,
    letterSpacing: 0.5,
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
  strengthContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  strengthBarContainer: {
    flexDirection: 'row',
    flex: 1,
    gap: 4,
    marginRight: 12,
  },
  strengthBar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
  strengthLabel: {
    fontSize: 12,
    fontWeight: '600',
    minWidth: 80,
    textAlign: 'right',
  },
  termsText: {
    fontSize: 11,
    color: colors.textPrimary,
    textAlign: 'center',
    opacity: 0.6,
    marginBottom: 24,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    fontSize: 14,
    color: colors.textPrimary,
    opacity: 0.8,
  },
  loginLink: {
    fontSize: 15,
    color: colors.greenGlow,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  createButtonDisabled: {
    opacity: 0.6,
  },
  }), [colors]);
}