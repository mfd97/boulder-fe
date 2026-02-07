import React, { useEffect, useMemo } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
  Easing,
  type SharedValue,
} from 'react-native-reanimated';
import { useTheme } from '@/contexts/ThemeContext';

const { width, height } = Dimensions.get('window');

interface MeshBlob {
  id: number;
  colors: [string, string];
  startX: number;
  startY: number;
  size: number;
  duration: number;
}

function buildMeshBlobs(colors: ReturnType<typeof useTheme>['colors']): MeshBlob[] {
  return [
    { id: 1, colors: [colors.charcoal, colors.greenGlow], startX: 0.2, startY: 0.3, size: 300, duration: 8000 },
    { id: 2, colors: [colors.sage, colors.charcoal], startX: 0.7, startY: 0.5, size: 250, duration: 10000 },
    { id: 3, colors: [colors.greenGlow, colors.sage], startX: 0.5, startY: 0.7, size: 280, duration: 12000 },
    { id: 4, colors: [colors.darkGrey, colors.greenGlow], startX: 0.3, startY: 0.8, size: 200, duration: 9000 },
    { id: 5, colors: [colors.charcoal, colors.darkGrey], startX: 0.8, startY: 0.2, size: 320, duration: 11000 },
  ];
}

interface AnimatedBlobProps {
  blob: MeshBlob;
  progress: SharedValue<number>;
}

function AnimatedBlob({ blob, progress }: AnimatedBlobProps) {
  const animatedStyle = useAnimatedStyle(() => {
    const x = interpolate(
      progress.value,
      [0, 1],
      [
        blob.startX * width - blob.size / 2,
        (blob.startX + 0.3) * width - blob.size / 2,
      ]
    );
    const y = interpolate(
      progress.value,
      [0, 1],
      [
        blob.startY * height - blob.size / 2,
        (blob.startY + 0.2) * height - blob.size / 2,
      ]
    );
    const rotation = interpolate(progress.value, [0, 1], [0, 360]);
    const scale = interpolate(
      progress.value,
      [0, 0.5, 1],
      [1, 1.2, 1],
      'clamp'
    );

    return {
      transform: [
        { translateX: x },
        { translateY: y },
        { rotate: `${rotation}deg` },
        { scale },
      ],
    };
  });

  return (
    <Animated.View
      style={[
        styles.blob,
        {
          width: blob.size,
          height: blob.size,
          borderRadius: blob.size / 2,
        },
        animatedStyle,
      ]}
      pointerEvents="none"
    >
      <BlurView intensity={80} tint="dark" style={styles.blurView}>
        <LinearGradient
          colors={blob.colors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        />
      </BlurView>
    </Animated.View>
  );
}

export default function AnimatedMeshGradient() {
  const { colors } = useTheme();
  const progress = useSharedValue(0);
  const meshBlobs = useMemo(() => buildMeshBlobs(colors), [colors]);

  useEffect(() => {
    progress.value = withRepeat(
      withTiming(1, {
        duration: 20000,
        easing: Easing.linear,
      }),
      -1,
      false
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View style={styles.container}>
      {meshBlobs.map((blob) => (
        <AnimatedBlob key={blob.id} blob={blob} progress={progress} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  blob: {
    position: 'absolute',
    opacity: 0.35,
  },
  blurView: {
    flex: 1,
    borderRadius: 150,
    overflow: 'hidden',
  },
  gradient: {
    flex: 1,
    borderRadius: 150,
  },
});
