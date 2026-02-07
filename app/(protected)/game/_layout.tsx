import { Stack } from "expo-router";
import React from "react";
import { colors } from "@/constants/colors";

export default function GameLayout() {
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
}
