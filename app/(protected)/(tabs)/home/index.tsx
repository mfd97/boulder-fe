import React, { useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import Svg, { Circle } from "react-native-svg";
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  useAnimatedStyle,
  withSpring,
  Easing,
  FadeIn,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import type { ThemeColors } from "@/constants/colors";
import { useTheme } from "@/contexts/ThemeContext";
import { typography } from "@/constants/typography";
import { spacing } from "@/constants/spacing";
import AnimatedMeshGradient from "@/components/AnimatedMeshGradient";
import { router } from "expo-router";
import { getStreak, getMastery } from "@/api/quiz";
import { getFriendsLeaderboard, getPendingCount } from "@/api/friends";
import { getGameInvitationCount } from "@/api/game";
import { StreakSkeleton, MasterySkeleton } from "@/components/Skeleton";
import EmptyState from "@/components/EmptyState";
import Leaderboard from "@/components/Leaderboard";
import AppHeader from "@/components/AppHeader";
import Card from "@/components/Card";

// Progress ring dimensions
const RING_SIZE = 100;
const RING_STROKE_WIDTH = 8;
const RING_RADIUS = (RING_SIZE - RING_STROKE_WIDTH) / 2;
const RING_CIRCUMFERENCE = RING_RADIUS * 2 * Math.PI;

// Create animated Circle component
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

// Pressable card wrapper with scale animation
function AnimatedPressable({ 
  children, 
  onPress, 
  style,
  disabled = false,
  ...rest
}: { 
  children: React.ReactNode; 
  onPress?: () => void; 
  style?: any;
  disabled?: boolean;
  accessibilityLabel?: string;
  accessibilityRole?: "button" | "link" | "none";
  accessibilityHint?: string;
}) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => { scale.value = withSpring(0.97, { damping: 15 }); }}
      onPressOut={() => { scale.value = withSpring(1, { damping: 15 }); }}
      disabled={disabled}
      {...rest}
    >
      <Animated.View style={[style, animatedStyle]}>
        {children}
      </Animated.View>
    </Pressable>
  );
}

export default function HomeScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  // Fetch streak data
  const { data: streakData, isLoading } = useQuery({
    queryKey: ['streak'],
    queryFn: getStreak,
    refetchOnMount: 'always', // Always refresh when component mounts
    staleTime: 0, // Consider data stale immediately
  });

  // Fetch mastery data
  const { data: masteryData, isLoading: isMasteryLoading } = useQuery({
    queryKey: ['mastery'],
    queryFn: getMastery,
    refetchOnMount: 'always',
    staleTime: 0,
  });

  // Fetch leaderboard data
  const { data: leaderboardData = [], isLoading: isLeaderboardLoading } = useQuery({
    queryKey: ['friendsLeaderboard'],
    queryFn: getFriendsLeaderboard,
    refetchOnMount: 'always',
    staleTime: 0,
  });

  // Fetch pending friend request count
  const { data: pendingCount = 0 } = useQuery({
    queryKey: ['pendingCount'],
    queryFn: getPendingCount,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Fetch pending game invitation count
  const { data: gameInvitationCount = 0 } = useQuery({
    queryKey: ['gameInvitationCount'],
    queryFn: getGameInvitationCount,
    refetchInterval: 10000, // Refresh every 10 seconds
  });

  const streak = streakData?.streak ?? 0;
  const hasCompletedToday = streakData?.hasCompletedToday ?? false;
  const todayAverageScore = streakData?.todayAverageScore ?? 0;
  const todayQuizCount = streakData?.todayQuizCount ?? 0;

  // Mastery data
  const masteryTopic = masteryData?.topic ?? 'No data yet';
  const masteryScore = masteryData?.averageScore ?? 0;
  const masteryDifficulty = masteryData?.difficulty ?? 'easy';

  // Get star count based on difficulty (easy = 1, medium = 2, hard = 3)
  const getStarCount = (difficulty: string): number => {
    switch (difficulty.toLowerCase()) {
      case 'hard': return 3;
      case 'medium': return 2;
      default: return 1;
    }
  };
  const starCount = getStarCount(masteryDifficulty);

  // Animated progress ring
  const progressAnimation = useSharedValue(0);

  useEffect(() => {
    if (hasCompletedToday && todayAverageScore > 0) {
      // Animate from 0 to actual score
      progressAnimation.value = withTiming(todayAverageScore / 100, {
        duration: 1200,
        easing: Easing.out(Easing.cubic),
      });
    } else {
      progressAnimation.value = 0;
    }
    // progressAnimation is a stable shared value reference from useSharedValue
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasCompletedToday, todayAverageScore]);

  const animatedCircleProps = useAnimatedProps(() => ({
    strokeDashoffset: RING_CIRCUMFERENCE - progressAnimation.value * RING_CIRCUMFERENCE,
  }));

  return (
    <View style={styles.wrapper}>
      <AnimatedMeshGradient />
      <SafeAreaView style={styles.container} edges={["top"]}>
        <StatusBar barStyle="light-content" />

        <AppHeader />

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Streak Section */}
          <View style={styles.streakSection}>
            <Text style={styles.sectionLabel}>STREAK</Text>
            {isLoading ? (
              <StreakSkeleton />
            ) : (
              <Animated.View entering={FadeIn.duration(400)} style={styles.streakRow}>
                <View style={styles.streakLeft}>
                  <Text style={styles.streakNumber}>{streak}</Text>
                  <Text style={styles.streakSubtext}>
                    {streak === 1 ? "Day consistency" : "Days consistency"}
                  </Text>
                </View>
                <View style={styles.progressCircleContainer}>
                  {/* SVG Progress Ring */}
                  <Svg width={RING_SIZE} height={RING_SIZE} style={styles.progressSvg}>
                    {/* Background Circle */}
                    <Circle
                      cx={RING_SIZE / 2}
                      cy={RING_SIZE / 2}
                      r={RING_RADIUS}
                      stroke={colors.darkGrey}
                      strokeWidth={RING_STROKE_WIDTH}
                      fill="transparent"
                    />
                    {/* Animated Progress Circle */}
                    {hasCompletedToday && (
                      <AnimatedCircle
                        cx={RING_SIZE / 2}
                        cy={RING_SIZE / 2}
                        r={RING_RADIUS}
                        stroke={colors.greenGlow}
                        strokeWidth={RING_STROKE_WIDTH}
                        fill="transparent"
                        strokeDasharray={RING_CIRCUMFERENCE}
                        animatedProps={animatedCircleProps}
                        strokeLinecap="round"
                        rotation="-90"
                        origin={`${RING_SIZE / 2}, ${RING_SIZE / 2}`}
                      />
                    )}
                  </Svg>
                  {/* Center Content */}
                  <View style={styles.progressInner}>
                    {hasCompletedToday ? (
                      <>
                        <Text style={styles.progressScore}>{todayAverageScore}%</Text>
                        <Text style={styles.progressLabel}>
                          {todayQuizCount === 1 ? "1 QUIZ" : `${todayQuizCount} QUIZZES`}
                        </Text>
                      </>
                    ) : (
                      <>
                        <Ionicons name="time-outline" size={28} color={colors.sage} />
                        <Text style={[styles.progressLabel, { color: colors.sage }]}>TODAY</Text>
                      </>
                    )}
                  </View>
                </View>
              </Animated.View>
            )}
          </View>

          {/* Mastery Tracker Section */}
          {isMasteryLoading ? (
            <MasterySkeleton />
          ) : masteryData?.topic ? (
            <Animated.View entering={FadeIn.duration(400)} style={styles.masterySection}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Mastery Tracker</Text>
                <Ionicons
                  name="bar-chart-outline"
                  size={20}
                  color={colors.offWhite}
                />
              </View>

              <Card>
                <Text style={styles.cardLabel}>CURRENT PEAK</Text>
                <View style={styles.masteryHeader}>
                  <Text style={styles.masterySubject}>{masteryTopic}</Text>
                  <View style={styles.starsContainer}>
                    {Array.from({ length: starCount }).map((_, index) => (
                      <Ionicons key={index} name="star" size={16} color={colors.greenGlow} />
                    ))}
                  </View>
                </View>
                <View style={styles.masteryStats}>
                  <Text style={styles.masteryPercentage}>{masteryScore}%</Text>
                  <View style={styles.masteryInfo}>
                    <Text style={styles.masteryLevel}>MASTERY LEVEL</Text>
                    <View style={styles.waveGraph}>
                      <View style={[styles.waveBar, { height: 8 }]} />
                      <View style={[styles.waveBar, { height: 12 }]} />
                      <View style={[styles.waveBar, { height: 6 }]} />
                      <View style={[styles.waveBar, { height: 10 }]} />
                      <View style={[styles.waveBar, { height: 14 }]} />
                    </View>
                  </View>
                </View>
              </Card>
            </Animated.View>
          ) : (
            <Animated.View entering={FadeIn.duration(400)} style={styles.masterySection}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Mastery Tracker</Text>
                <Ionicons
                  name="bar-chart-outline"
                  size={20}
                  color={colors.offWhite}
                />
              </View>
              <Card style={styles.masteryEmptyCard}>
                <EmptyState
                  illustration="trophy"
                  title="Build Your Mastery"
                  subtitle="Complete quizzes to discover your strongest topics"
                  actionLabel="Start Learning"
                  onAction={() => router.push('/(protected)/(tabs)/quiz')}
                />
              </Card>
            </Animated.View>
          )}

          {/* Leaderboard Section */}
          <View style={styles.leaderboardSection}>
            <View style={styles.leaderboardHeader}>
              <View>
                <Text style={styles.sectionTitle}>Top Contenders</Text>
                <Text style={styles.leaderboardLabel}>FRIENDS LEADERBOARD</Text>
              </View>
              <TouchableOpacity 
                style={styles.friendsButton}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.push('/(protected)/(tabs)/home/friends');
                }}
                accessibilityLabel="Friends"
                accessibilityRole="button"
                accessibilityHint="Open friends and leaderboard"
              >
                <Ionicons name="people" size={20} color={colors.charcoal} />
                {pendingCount > 0 && (
                  <View style={styles.pendingBadge}>
                    <Text style={styles.pendingBadgeText}>{pendingCount}</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
            <Leaderboard
              data={leaderboardData}
              isLoading={isLeaderboardLoading}
              onAddFriends={() => router.push('/(protected)/(tabs)/home/friends')}
            />
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            {/* Multiplayer Button */}
            <AnimatedPressable 
              style={styles.multiplayerButton} 
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push('/(protected)/(tabs)/home/game');
              }}
              accessibilityLabel="Multiplayer"
              accessibilityRole="button"
              accessibilityHint="Opens multiplayer game hub"
            >
              <View style={styles.multiplayerContent}>
                <Ionicons name="game-controller" size={22} color={colors.greenGlow} />
                <Text style={styles.multiplayerText}>MULTIPLAYER</Text>
              </View>
              {gameInvitationCount > 0 && (
                <View style={styles.gameInviteBadge}>
                  <Text style={styles.gameInviteBadgeText}>{gameInvitationCount}</Text>
                </View>
              )}
            </AnimatedPressable>

            {/* Start Quiz Button */}
            <AnimatedPressable 
              style={styles.startQuizButton} 
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push(`/quiz/CreateQuiz`);
              }}
              accessibilityLabel="Start quiz"
              accessibilityRole="button"
              accessibilityHint="Create and start a new quiz"
            >
              <Text style={styles.startQuizText}>START QUIZ</Text>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={colors.charcoal}
              />
            </AnimatedPressable>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function makeStyles(colors: ThemeColors) {
  return StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
  },
  streakSection: {
    marginTop: spacing.sm,
    marginBottom: spacing.xxxl,
  },
  sectionLabel: {
    ...typography.caption,
    color: colors.textPrimary,
    marginBottom: spacing.lg,
    letterSpacing: 1,
  },
  streakRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  streakLeft: {
    flex: 1,
  },
  streakNumber: {
    ...typography.display,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  streakSubtext: {
    ...typography.bodySmall,
    color: colors.textPrimary,
    opacity: 0.8,
  },
  progressCircleContainer: {
    width: 100,
    height: 100,
    justifyContent: "center",
    alignItems: "center",
  },
  progressSvg: {
    position: "absolute",
  },
  progressInner: {
    alignItems: "center",
  },
  progressScore: {
    ...typography.titleSmall,
    fontSize: 22,
    color: colors.greenGlow,
  },
  progressLabel: {
    ...typography.label,
    fontSize: 9,
    color: colors.greenGlow,
    marginTop: 2,
  },
  masterySection: {
    marginBottom: spacing.xxxl,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.titleSmall,
    fontSize: 18,
    color: colors.textPrimary,
  },
  masteryEmptyCard: {
    paddingVertical: spacing.sm,
  },
  cardLabel: {
    ...typography.label,
    color: colors.textPrimary,
    opacity: 0.7,
    letterSpacing: 1,
    marginBottom: spacing.md,
  },
  masteryHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  masterySubject: {
    ...typography.titleSmall,
    color: colors.textPrimary,
    flex: 1,
  },
  starsContainer: {
    flexDirection: "row",
    gap: spacing.xs,
  },
  masteryStats: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.lg,
  },
  masteryPercentage: {
    ...typography.title,
    color: colors.greenGlow,
  },
  masteryInfo: {
    flex: 1,
  },
  masteryLevel: {
    ...typography.label,
    color: colors.textPrimary,
    opacity: 0.7,
    letterSpacing: 1,
    marginBottom: spacing.sm,
  },
  waveGraph: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 4,
    height: 14,
  },
  waveBar: {
    width: 4,
    backgroundColor: colors.greenGlow,
    borderRadius: 2,
  },
  leaderboardSection: {
    marginBottom: spacing.xxl,
  },
  leaderboardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  leaderboardLabel: {
    ...typography.caption,
    color: colors.textPrimary,
    opacity: 0.7,
    letterSpacing: 1,
    marginTop: spacing.xs,
  },
  friendsButton: {
    backgroundColor: colors.greenGlow,
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  pendingBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: colors.error,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  pendingBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  actionButtons: {
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  multiplayerButton: {
    backgroundColor: colors.darkGrey,
    borderRadius: 16,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xxl,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: colors.greenGlow + "40",
    position: "relative",
  },
  multiplayerContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  multiplayerText: {
    ...typography.body,
    fontSize: 15,
    fontWeight: "700",
    color: colors.greenGlow,
    letterSpacing: 1,
  },
  gameInviteBadge: {
    position: "absolute",
    top: -6,
    right: -6,
    backgroundColor: colors.error,
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
  },
  gameInviteBadgeText: {
    ...typography.caption,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  startQuizButton: {
    backgroundColor: colors.sage,
    borderRadius: 16,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.xxl,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: spacing.sm,
  },
  startQuizText: {
    ...typography.titleSmall,
    fontSize: 18,
    color: colors.charcoal,
    letterSpacing: 0.5,
  },
  });
}
