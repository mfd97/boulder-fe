import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
  withSequence,
} from 'react-native-reanimated';
import { colors } from '@/constants/colors';
import { useSocket } from '@/contexts/SocketContext';

export default function WaitingRoomScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    topic: string;
    difficulty: string;
    rounds: string;
    guestName: string;
  }>();

  const { 
    leaveGame, 
    onGameStarted, 
    offGameStarted,
    onDeclined,
    offDeclined,
    onError,
    offError,
  } = useSocket();

  const [gameId, setGameId] = useState<string | null>(null);

  // Pulse animation for waiting indicator
  const pulseScale = useSharedValue(1);
  const pulseOpacity = useSharedValue(1);

  useEffect(() => {
    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.3, { duration: 1000, easing: Easing.out(Easing.ease) }),
        withTiming(1, { duration: 1000, easing: Easing.in(Easing.ease) })
      ),
      -1,
      false
    );
    pulseOpacity.value = withRepeat(
      withSequence(
        withTiming(0.3, { duration: 1000 }),
        withTiming(1, { duration: 1000 })
      ),
      -1,
      false
    );
  }, []);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
    opacity: pulseOpacity.value,
  }));

  // Listen for game events
  useEffect(() => {
    const handleGameStarted = (data: { 
      gameId: string;
      topic: string;
      hostName: string;
      guestName: string;
    }) => {
      console.log('[waiting] Game started:', data);
      router.replace({
        pathname: '/(protected)/game/play',
        params: { gameId: data.gameId, isHost: 'true' },
      });
    };

    const handleDeclined = (data: { gameId: string }) => {
      console.log('[waiting] Game declined:', data);
      Alert.alert(
        'Challenge Declined',
        `${params.guestName} declined your challenge.`,
        [{ text: 'OK', onPress: () => router.replace('/(protected)/(tabs)/home') }]
      );
    };

    const handleError = (data: { message: string }) => {
      console.log('[waiting] Error:', data);
      Alert.alert('Error', data.message, [
        { text: 'OK', onPress: () => router.replace('/(protected)/(tabs)/home') }
      ]);
    };

    onGameStarted(handleGameStarted);
    onDeclined(handleDeclined);
    onError(handleError);

    return () => {
      offGameStarted(handleGameStarted);
      offDeclined(handleDeclined);
      offError(handleError);
    };
  }, [onGameStarted, offGameStarted, onDeclined, offDeclined, onError, offError, params.guestName, router]);

  const handleCancel = () => {
    Alert.alert(
      'Cancel Challenge',
      'Are you sure you want to cancel this challenge?',
      [
        { text: 'No', style: 'cancel' },
        { 
          text: 'Yes', 
          style: 'destructive',
          onPress: () => {
            if (gameId) {
              leaveGame(gameId);
            }
            router.replace('/(protected)/(tabs)/home');
          }
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleCancel} style={styles.cancelButton}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {/* Waiting Animation */}
        <View style={styles.waitingContainer}>
          <Animated.View style={[styles.pulseOuter, pulseStyle]} />
          <View style={styles.waitingIcon}>
            <Ionicons name="game-controller" size={48} color={colors.greenGlow} />
          </View>
        </View>

        {/* Status Text */}
        <Text style={styles.waitingTitle}>Waiting for opponent...</Text>
        <Text style={styles.waitingSubtitle}>
          Challenge sent to {params.guestName}
        </Text>

        {/* Game Details */}
        <View style={styles.detailsCard}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Topic</Text>
            <Text style={styles.detailValue}>{params.topic}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Difficulty</Text>
            <Text style={styles.detailValue}>
              {params.difficulty?.charAt(0).toUpperCase() + params.difficulty?.slice(1)}
            </Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Rounds</Text>
            <Text style={styles.detailValue}>
              {params.rounds} ({Number(params.rounds) * 5} questions)
            </Text>
          </View>
        </View>

        {/* Tip */}
        <View style={styles.tipContainer}>
          <Ionicons name="information-circle" size={20} color={colors.sage} />
          <Text style={styles.tipText}>
            Your friend will receive a notification to join the game.
            The challenge expires in 5 minutes.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.charcoal,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  cancelButton: {
    padding: 8,
  },
  cancelText: {
    fontSize: 16,
    color: colors.sage,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingBottom: 60,
  },
  waitingContainer: {
    width: 140,
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  pulseOuter: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: colors.greenGlow + '30',
  },
  waitingIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.darkGrey,
    justifyContent: 'center',
    alignItems: 'center',
  },
  waitingTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.offWhite,
    marginBottom: 8,
  },
  waitingSubtitle: {
    fontSize: 16,
    color: colors.sage,
    marginBottom: 32,
  },
  detailsCard: {
    width: '100%',
    backgroundColor: colors.darkGrey,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: colors.sage,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.offWhite,
  },
  divider: {
    height: 1,
    backgroundColor: colors.charcoal,
    marginVertical: 4,
  },
  tipContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.darkGrey + '80',
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  tipText: {
    flex: 1,
    fontSize: 13,
    color: colors.sage,
    lineHeight: 20,
  },
});
