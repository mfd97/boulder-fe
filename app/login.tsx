import React, { useContext, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/constants/colors';
import { router } from 'expo-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { login } from '@/api/auth';
import { AuthContext } from '@/context/AuthContext';
import { setItemAsync } from 'expo-secure-store';
import Input from './components/Input';
import type { AxiosError } from 'axios';

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginScreen() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loginError, setLoginError] = useState<string | null>(null)
  const [emailTouched, setEmailTouched] = useState(false)
  const { setIsAuth} = useContext(AuthContext)
  const queryClient = useQueryClient()

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
      
      // 3. Set user to use
      setIsAuth(true)     

      // 4. navigate to home page
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
      >
        <View style={styles.content}>
          {/* Logo - Hexagonal shape */}
          <View style={styles.logoContainer}>
            <View style={styles.hexagon}>
              <View style={styles.hexagonInner} />
            </View>
          </View>

          {/* Welcome Message */}
          <Text style={styles.welcomeText}>Welcome Back.</Text>

          {/* Subtitle */}
          <Text style={styles.subtitle}>Log in to continue your learning journey.</Text>

          {/* Form */}
          <View style={styles.form}>
            {/* Login Error Banner */}
            {loginError && (
              <View style={styles.errorBanner}>
                <Text style={styles.errorBannerText}>{loginError}</Text>
              </View>
            )}

            {/* Email Input */}
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

            {/* Password Input */}
            <View style={styles.passwordSection}>
              <TouchableOpacity style={styles.forgotPasswordBtn}>
                <Text style={styles.forgotPassword}>Forgot Password?</Text>
              </TouchableOpacity>
              <Input
                label="Password"
                value={password}
                onChangeText={handlePasswordChange}
                secureTextEntry
                autoComplete="password"
                editable={!isPending}
              />
            </View>

            {/* Login Button */}
            <TouchableOpacity 
              style={[
                styles.loginButton,
                isPending && styles.loginButtonDisabled
              ]} 
              onPress={handleLogin}
              disabled={isPending}
            >
              {isPending ? (
                <ActivityIndicator color={colors.charcoal} size="small" />
              ) : (
                <Text style={styles.loginButtonText}>LOGIN</Text>
              )}
            </TouchableOpacity>

            {/* Sign Up Link */}
            <View style={styles.signUpContainer}>
              <Text style={styles.signUpText}>Dont have an account? </Text>
              <TouchableOpacity onPress={()=>router.push("/register")}>
                <Text style={styles.signUpLink}>Sign Up</Text>
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
    paddingTop: 60,
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  hexagon: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  hexagonInner: {
    width: 60,
    height: 60,
    backgroundColor: colors.greenGlow,
    transform: [{ rotate: '30deg' }],
    borderRadius: 8,
  },
  welcomeText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.offWhite,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: colors.offWhite,
    opacity: 0.7,
    marginBottom: 40,
  },
  form: {
    width: '100%',
  },
  passwordSection: {
    position: 'relative',
  },
  forgotPasswordBtn: {
    alignSelf: 'flex-end',
    marginBottom: 8,
  },
  forgotPassword: {
    fontSize: 12,
    color: colors.offWhite,
    opacity: 0.7,
  },
  loginButton: {
    backgroundColor: colors.sage,
    borderRadius: 8,
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
  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signUpText: {
    fontSize: 14,
    color: colors.offWhite,
    opacity: 0.7,
  },
  signUpLink: {
    fontSize: 14,
    color: colors.offWhite,
    fontWeight: '600',
  },
});