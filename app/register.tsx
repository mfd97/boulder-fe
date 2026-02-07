import { register } from '@/api/auth';
import { colors } from '@/constants/colors';
import { AuthContext } from '@/context/AuthContext';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Input from './components/Input';

// Validation constants
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;

// Password strength calculator
const calculatePasswordStrength = (password: string): { score: number; label: string; color: string } => {
  let score = 0;
  
  if (password.length >= MIN_PASSWORD_LENGTH) score += 1;
  if (password.length >= 12) score += 1;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 1;
  
  if (score <= 1) return { score, label: 'Weak', color: '#FF6B6B' };
  if (score <= 2) return { score, label: 'Fair', color: '#FFB347' };
  if (score <= 3) return { score, label: 'Good', color: '#FFD93D' };
  if (score <= 4) return { score, label: 'Strong', color: colors.greenGlow };
  return { score, label: 'Very Strong', color: colors.greenGlow };
};

export default function RegisterScreen() {
  const router = useRouter();
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
  const passwordStrength = useMemo(() => calculatePasswordStrength(password), [password]);
  
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
      >
        <View style={styles.content}>
          {/* Title */}
          <Text style={styles.title}>Begin Your Ascent</Text>

          {/* Form */}
          <View style={styles.form}>
            {/* Registration Error Banner */}
            {registerError && (
              <View style={styles.errorBanner}>
                <Text style={styles.errorBannerText}>{registerError}</Text>
              </View>
            )}

            {/* Full Name Input */}
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

            {/* Email Input */}
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

            {/* Password Input */}
            <View>
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
              
              {/* Password Strength Meter */}
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

            {/* Create Account Button */}
            <TouchableOpacity 
              style={[
                styles.createButton,
                registerMutation.isPending && styles.createButtonDisabled
              ]}
              onPress={handleRegister}
              disabled={registerMutation.isPending}
            >
              {registerMutation.isPending ? (
                <ActivityIndicator color={colors.charcoal} size="small" />
              ) : (
                <Text style={styles.createButtonText}>CREATE ACCOUNT</Text>
              )}
            </TouchableOpacity>

            {/* Terms of Service */}
            <Text style={styles.termsText}>
              By signing up, you agree to our terms of service.
            </Text>

            {/* Login Link */}
            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>Already a member? </Text>
              <TouchableOpacity onPress={() => router.push('/login')}>
                <Text style={styles.loginLink}>Login</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.charcoal,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.offWhite,
    marginBottom: 40,
  },
  form: {
    flex: 1,
  },
  createButton: {
    backgroundColor: colors.sage,
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16,
    minHeight: 52,
    justifyContent: 'center',
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.charcoal,
    letterSpacing: 0.5,
  },
  errorBanner: {
    backgroundColor: 'rgba(255, 107, 107, 0.15)',
    borderWidth: 1,
    borderColor: '#FF6B6B',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorBannerText: {
    color: '#FF6B6B',
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
  },
  strengthContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: -16,
    marginBottom: 24,
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
    fontSize: 12,
    color: colors.offWhite,
    textAlign: 'center',
    opacity: 0.8,
    marginBottom: 24,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    fontSize: 14,
    color: colors.offWhite,
  },
  loginLink: {
    fontSize: 14,
    color: colors.offWhite,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  createButtonDisabled: {
    opacity: 0.6,
  },
});