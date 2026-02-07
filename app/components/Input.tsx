import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Animated,
  TouchableOpacity,
  TextInputProps,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/constants/colors";

const ERROR_COLOR = "#FF6B6B";
const SUCCESS_COLOR = colors.greenGlow;

interface InputProps extends Omit<TextInputProps, "placeholder"> {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  rightElement?: React.ReactNode;
  error?: string;
  isValid?: boolean;
  showValidation?: boolean;
}

export default function Input({
  label,
  value,
  onChangeText,
  secureTextEntry = false,
  rightElement,
  error,
  isValid,
  showValidation = false,
  ...rest
}: InputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const animatedValue = useRef(new Animated.Value(value ? 1 : 0)).current;

  const hasValue = value.length > 0;
  const hasError = !!error;
  const showSuccess = showValidation && isValid && hasValue && !hasError;

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: isFocused || hasValue ? 1 : 0,
      duration: 150,
      useNativeDriver: false,
    }).start();
  }, [isFocused, hasValue, animatedValue]);

  // Determine border color based on state
  const getBorderColor = () => {
    if (hasError) return ERROR_COLOR;
    if (showSuccess) return SUCCESS_COLOR;
    if (isFocused) return colors.greenGlow;
    return "transparent";
  };

  // Determine label color based on state
  const getLabelColor = () => {
    if (hasError) return ERROR_COLOR;
    if (showSuccess) return SUCCESS_COLOR;
    return colors.greenGlow;
  };

  const labelStyle = {
    top: animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [16, -10],
    }),
    fontSize: animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [16, 12],
    }),
    color: animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [colors.sage, getLabelColor()],
    }),
  };

  const handleFocus = () => setIsFocused(true);
  const handleBlur = () => setIsFocused(false);

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  // Determine if we need extra padding for validation icon
  const hasValidationIcon = showValidation && hasValue;
  const hasRightIcon = secureTextEntry || hasValidationIcon;

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.inputWrapper,
          { borderColor: getBorderColor() },
        ]}
      >
        <Animated.Text style={[styles.label, labelStyle]}>
          {label}
        </Animated.Text>

        <TextInput
          style={[
            styles.input,
            hasRightIcon && styles.inputWithIcon,
          ]}
          value={value}
          onChangeText={onChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          secureTextEntry={secureTextEntry && !isPasswordVisible}
          placeholderTextColor="transparent"
          {...rest}
        />

        {/* Validation Icon (for non-password fields) */}
        {showValidation && hasValue && !secureTextEntry && (
          <View style={styles.validationIcon}>
            <Ionicons
              name={hasError ? "close-circle" : "checkmark-circle"}
              size={20}
              color={hasError ? ERROR_COLOR : SUCCESS_COLOR}
            />
          </View>
        )}

        {/* Password Toggle Icon */}
        {secureTextEntry && (
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={togglePasswordVisibility}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons
              name={isPasswordVisible ? "eye-outline" : "eye-off-outline"}
              size={20}
              color={colors.offWhite}
            />
          </TouchableOpacity>
        )}

        {rightElement}
      </View>

      {/* Error Message */}
      {hasError && (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={14} color={ERROR_COLOR} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  inputWrapper: {
    backgroundColor: colors.darkGrey,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: "transparent",
    flexDirection: "row",
    alignItems: "center",
    position: "relative",
    minHeight: 56,
  },
  label: {
    position: "absolute",
    left: 16,
    backgroundColor: colors.darkGrey,
    paddingHorizontal: 4,
    fontWeight: "600",
    letterSpacing: 0.5,
    zIndex: 1,
  },
  input: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: colors.offWhite,
  },
  inputWithIcon: {
    paddingRight: 50,
  },
  eyeIcon: {
    position: "absolute",
    right: 16,
    padding: 4,
  },
  validationIcon: {
    position: "absolute",
    right: 16,
    padding: 4,
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
    paddingHorizontal: 4,
  },
  errorText: {
    color: ERROR_COLOR,
    fontSize: 12,
    marginLeft: 4,
    fontWeight: "500",
  },
});
