import { Stack } from "expo-router";
import React from "react";
import { colors } from "@/constants/colors";

const _layout = () => {
  return (
    <Stack 
      screenOptions={{ 
        headerShown: false,
        contentStyle: {
          backgroundColor: colors.charcoal,
        },
        animation: 'slide_from_right',
        animationDuration: 250,
      }} 
    />
  );
};

export default _layout;