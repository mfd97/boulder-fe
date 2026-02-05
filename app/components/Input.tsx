import React, { useState, useRef, useEffect } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  Animated,
  TouchableOpacity,
  TextInputProps,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/constants/colors";

interface InputProps extends Omit<TextInputProps, "placeholder"> {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  rightElement?: React.ReactNode;
}

export default function Input({
  label,
  value,
  onChangeText,
  secureTextEntry = false,
  rightElement,
  ...rest
}: InputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const animatedValue = useRef(new Animated.Value(value ? 1 : 0)).current;

  const hasValue = value.length > 0;

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: isFocused || hasValue ? 1 : 0,
      duration: 150,
      useNativeDriver: false,
    }).start();
  }, [isFocused, hasValue, animatedValue]);

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
      outputRange: [colors.sage, colors.greenGlow],
    }),
  };

  const handleFocus = () => setIsFocused(true);
  const handleBlur = () => setIsFocused(false);

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.inputWrapper,
          isFocused && styles.inputWrapperFocused,
        ]}
      >
        <Animated.Text style={[styles.label, labelStyle]}>
          {label}
        </Animated.Text>

        <TextInput
          style={[
            styles.input,
            secureTextEntry && styles.inputWithIcon,
          ]}
          value={value}
          onChangeText={onChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          secureTextEntry={secureTextEntry && !isPasswordVisible}
          placeholderTextColor="transparent"
          {...rest}
        />

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
  inputWrapperFocused: {
    borderColor: colors.greenGlow,
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
});
