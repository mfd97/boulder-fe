import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withDelay,
  FadeInDown,
  FadeInUp,
} from 'react-native-reanimated';
import ConfettiCannon from 'react-native-confetti-cannon';
import { colors } from '@/constants/colors';
import { getGameById } from '@/api/game';
import * as SecureStore from 'expo-secure-store';
import { jwtDecode } from 'jwt-decode';

// Animated pressable for buttons
function AnimatedButton({ 
  children, 
  onPress, 
  style,
}: { 
  children: React.ReactNode; 
  onPress?: () => void; 
  style?: any;
}) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => { scale.value = withSpring(0.96, { damping: 15 }); }}
      onPressOut={() => { scale.value = withSpring(1, { damping: 15 }); }}
    >
      <Animated.View style={[style, animatedStyle]}>
        {children}
      </Animated.View>
    </Pressable>
  );
}

export default function GameResultsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ gameId: string }>();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  // Fetch game details
  const { data: game, isLoading } = useQuery({
    queryKey: ['game', params.gameId],
    queryFn: () => getGameById(params.gameId),
    enabled: !!params.gameId,
  });

  // Get current user ID from token (payload uses userId, not _id)
  useEffect(() => {
    const getUserId = async () => {
      const token = await SecureStore.getItemAsync('token');
      if (token) {
        try {
          const decoded = jwtDecode<{ userId: string }>(token);
          setCurrentUserId(decoded.userId);
        } catch {
          console.error('Failed to decode token');
        }
      }
    };
    getUserId();
  }, []);

  // Show confetti if user won
  useEffect(() => {
    if (game && currentUserId) {
      const isWinner = game.winnerId?._id === currentUserId;
      if (isWinner) {
        setShowConfetti(true);
      }
    }
  }, [game, currentUserId]);

  if (isLoading || !game || !currentUserId) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <StatusBar barStyle="light-content" />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading results...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const isHost = game.hostId._id === currentUserId;
  const myScore = isHost ? game.hostScore : game.guestScore;
  const opponentScore = isHost ? game.guestScore : game.hostScore;
  const opponent = isHost ? game.guestId : game.hostId;
  const isWinner = game.winnerId?._id === currentUserId;
  const isDraw = game.winnerId === null;
  const isLoser = !isDraw && !isWinner;

  const getResultConfig = () => {
    if (isDraw) {
      return {
        icon: 'remove-circle' as const,
        title: "It's a Draw!",
        subtitle: 'Great minds think alike',
        color: colors.sage,
      };
    }
    if (isWinner) {
      return {
        icon: 'trophy' as const,
        title: 'Victory!',
        subtitle: 'You crushed it!',
        color: '#FFD700',
      };
    }
    return {
      icon: 'sad' as const,
      title: 'Defeat',
      subtitle: 'Better luck next time',
      color: '#FF6B6B',
    };
  };

  const resultConfig = getResultConfig();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" />

      {showConfetti && (
        <ConfettiCannon
          count={150}
          origin={{ x: 200, y: 0 }}
          fadeOut
          explosionSpeed={300}
          fallSpeed={2500}
        />
      )}

      <View style={styles.content}>
        {/* Result Icon */}
        <Animated.View 
          entering={FadeInDown.delay(200).springify()}
          style={styles.resultIconContainer}
        >
          <View style={[styles.resultIconBg, { backgroundColor: resultConfig.color + '30' }]}>
            <Ionicons 
              name={resultConfig.icon} 
              size={80} 
              color={resultConfig.color} 
            />
          </View>
        </Animated.View>

        {/* Result Title */}
        <Animated.Text 
          entering={FadeInUp.delay(400).springify()}
          style={[styles.resultTitle, { color: resultConfig.color }]}
        >
          {resultConfig.title}
        </Animated.Text>
        <Animated.Text 
          entering={FadeInUp.delay(500).springify()}
          style={styles.resultSubtitle}
        >
          {resultConfig.subtitle}
        </Animated.Text>

        {/* Score Comparison */}
        <Animated.View 
          entering={FadeInUp.delay(600).springify()}
          style={styles.scoreCard}
        >
          <View style={styles.scoreSection}>
            <Text style={styles.playerLabel}>You</Text>
            <Text style={[
              styles.finalScore, 
              isWinner && styles.winnerScore
            ]}>
              {myScore}
            </Text>
            {isWinner && (
              <View style={styles.winnerBadge}>
                <Ionicons name="trophy" size={14} color="#FFD700" />
              </View>
            )}
          </View>

          <View style={styles.scoreDivider}>
            <Text style={styles.vsText}>-</Text>
          </View>

          <View style={styles.scoreSection}>
            <Text style={styles.playerLabel}>{opponent.fullName}</Text>
            <Text style={[
              styles.finalScore,
              isLoser && styles.winnerScore
            ]}>
              {opponentScore}
            </Text>
            {isLoser && (
              <View style={styles.winnerBadge}>
                <Ionicons name="trophy" size={14} color="#FFD700" />
              </View>
            )}
          </View>
        </Animated.View>

        {/* Game Stats */}
        <Animated.View 
          entering={FadeInUp.delay(700).springify()}
          style={styles.statsCard}
        >
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Topic</Text>
            <Text style={styles.statValue}>{game.topic}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Difficulty</Text>
            <Text style={styles.statValue}>
              {game.difficulty.charAt(0).toUpperCase() + game.difficulty.slice(1)}
            </Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Questions</Text>
            <Text style={styles.statValue}>{game.totalQuestions}</Text>
          </View>
        </Animated.View>

        {/* Action Buttons */}
        <Animated.View 
          entering={FadeInUp.delay(800).springify()}
          style={styles.buttonsContainer}
        >
          <AnimatedButton 
            style={styles.primaryButton}
            onPress={() => router.replace('/(protected)/game/create')}
          >
            <Ionicons name="refresh" size={20} color={colors.charcoal} />
            <Text style={styles.primaryButtonText}>Play Again</Text>
          </AnimatedButton>

          <TouchableOpacity 
            style={styles.secondaryButton}
            onPress={() => router.replace('/(protected)/(tabs)/home')}
          >
            <Text style={styles.secondaryButtonText}>Back to Home</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.charcoal,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: colors.sage,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  resultIconContainer: {
    marginBottom: 24,
  },
  resultIconBg: {
    width: 140,
    height: 140,
    borderRadius: 70,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultTitle: {
    fontSize: 40,
    fontWeight: '800',
    marginBottom: 8,
  },
  resultSubtitle: {
    fontSize: 18,
    color: colors.sage,
    marginBottom: 32,
  },
  scoreCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.darkGrey,
    borderRadius: 20,
    padding: 24,
    width: '100%',
    marginBottom: 20,
  },
  scoreSection: {
    flex: 1,
    alignItems: 'center',
    position: 'relative',
  },
  playerLabel: {
    fontSize: 14,
    color: colors.sage,
    marginBottom: 8,
  },
  finalScore: {
    fontSize: 48,
    fontWeight: '700',
    color: colors.offWhite,
  },
  winnerScore: {
    color: '#FFD700',
  },
  winnerBadge: {
    position: 'absolute',
    top: -5,
    right: 20,
  },
  scoreDivider: {
    paddingHorizontal: 16,
  },
  vsText: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.sage,
  },
  statsCard: {
    backgroundColor: colors.darkGrey,
    borderRadius: 16,
    padding: 20,
    width: '100%',
    marginBottom: 32,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  statLabel: {
    fontSize: 14,
    color: colors.sage,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.offWhite,
  },
  statDivider: {
    height: 1,
    backgroundColor: colors.charcoal,
    marginVertical: 4,
  },
  buttonsContainer: {
    width: '100%',
    gap: 12,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.greenGlow,
    borderRadius: 12,
    paddingVertical: 16,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.charcoal,
  },
  secondaryButton: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  secondaryButtonText: {
    fontSize: 16,
    color: colors.sage,
  },
});
