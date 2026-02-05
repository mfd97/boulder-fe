import { register } from '@/api/auth';
import { colors } from '@/constants/colors';
import { AuthContext } from '@/context/AuthContext';
import { useMutation } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import React, { useContext, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Input from './components/Input';

export default function RegisterScreen() {
  const router = useRouter();
  const { setIsAuth } = useContext(AuthContext);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const registerMutation = useMutation({
    mutationFn: register,
    onSuccess: async (data) => {
      try {
        // Store token in SecureStore
        await SecureStore.setItemAsync('token', data.token);

        // Update AuthContext and navigate to home
        setIsAuth(true);
        router.replace('/(protected)/(tabs)/home');
      } catch (error) {
        Alert.alert('Error', 'Failed to save authentication data. Please try again.');
      }
    },
    onError: (error: AxiosError<{ error?: string }>) => {
      const errorMessage = 
        error?.response?.data?.error || 
        error?.message || 
        'Registration failed. Please try again.';
      Alert.alert('Registration Failed', errorMessage);
    },
  });

  const handleRegister = () => {
    if (!fullName.trim() || !email.trim() || !password.trim()) {
      Alert.alert('Validation Error', 'Please fill in all fields.');
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
            {/* Full Name Input */}
            <Input
              label="Full Name"
              value={fullName}
              onChangeText={setFullName}
              autoCapitalize="words"
              autoComplete="name"
              editable={!registerMutation.isPending}
            />

            {/* Email Input */}
            <Input
              label="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              editable={!registerMutation.isPending}
            />

            {/* Password Input */}
            <Input
              label="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoComplete="password-new"
              editable={!registerMutation.isPending}
            />

            {/* Create Account Button */}
            <TouchableOpacity 
              style={[
                styles.createButton,
                registerMutation.isPending && styles.createButtonDisabled
              ]}
              onPress={handleRegister}
              disabled={registerMutation.isPending}
            >
              <Text style={styles.createButtonText}>
                {registerMutation.isPending ? 'CREATING...' : 'CREATE ACCOUNT'}
              </Text>
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
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.charcoal,
    letterSpacing: 0.5,
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