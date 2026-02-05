import React, { useContext, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/constants/colors';
import { router } from 'expo-router';
import { useMutation } from '@tanstack/react-query';
import { login } from '@/api/auth';
import { AuthContext } from '@/context/AuthContext';
import { setItemAsync } from 'expo-secure-store';
import Input from './components/Input';

export default function LoginScreen() {
  const [Email, setEmail] = useState("")
  const [Password, setPassword] = useState("")
  const { setIsAuth} = useContext(AuthContext)
  
  // console.log(Email, Password)

  const {mutate} = useMutation({
    mutationKey:["login"],
    mutationFn: ()=>login({email:Email, password:Password }),
    onSuccess: async (data, variables, onMutateResult, context) =>{
      console.log(data)
      // 1. Store the token
      await setItemAsync("token", data.token)
      // 2. Set user to use
      setIsAuth(true)     

      //3. navigate to home page
      router.replace("/(protected)/(tabs)/home")
    },
    onError(err){
      console.log(err)
    }
  })

  const handleLogin = () => {
    console.log("here")
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
            {/* Email Input */}
            <Input
              label="Email"
              value={Email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
            />

            {/* Password Input */}
            <View style={styles.passwordSection}>
              <TouchableOpacity style={styles.forgotPasswordBtn}>
                <Text style={styles.forgotPassword}>Forgot Password?</Text>
              </TouchableOpacity>
              <Input
                label="Password"
                value={Password}
                onChangeText={setPassword}
                secureTextEntry
                autoComplete="password"
              />
            </View>

            {/* Login Button */}
            <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
              <Text style={styles.loginButtonText}>LOGIN</Text>
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
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.charcoal,
    letterSpacing: 1,
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