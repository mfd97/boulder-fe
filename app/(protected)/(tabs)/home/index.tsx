import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import Svg, { Circle } from "react-native-svg";
import { colors } from "@/constants/colors";
import AnimatedMeshGradient from "@/components/AnimatedMeshGradient";
import { router } from "expo-router";
import { getStreak, getMastery } from "@/api/quiz";
import { StreakSkeleton, MasterySkeleton } from "@/components/Skeleton";
import EmptyState from "@/components/EmptyState";

// Progress ring dimensions
const RING_SIZE = 100;
const RING_STROKE_WIDTH = 8;
const RING_RADIUS = (RING_SIZE - RING_STROKE_WIDTH) / 2;
const RING_CIRCUMFERENCE = RING_RADIUS * 2 * Math.PI;

export default function HomeScreen() {
  // Fetch streak data
  const { data: streakData, isLoading, error } = useQuery({
    queryKey: ['streak'],
    queryFn: getStreak,
    refetchOnMount: 'always', // Always refresh when component mounts
    staleTime: 0, // Consider data stale immediately
  });

  // Fetch mastery data
  const { data: masteryData, isLoading: isMasteryLoading, error: masteryError } = useQuery({
    queryKey: ['mastery'],
    queryFn: getMastery,
    refetchOnMount: 'always',
    staleTime: 0,
  });

  // Debug logging
  console.log('[HomeScreen] Streak data:', streakData);
  console.log('[HomeScreen] Streak error:', error);
  console.log('[HomeScreen] Mastery data:', masteryData);
  console.log('[HomeScreen] Mastery error:', masteryError);

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

  return (
    <View style={styles.wrapper}>
      <AnimatedMeshGradient />
      <SafeAreaView style={styles.container} edges={["top"]}>
        <StatusBar barStyle="light-content" />

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <View style={styles.logoIcon}>
              <Text style={styles.logoText}>B</Text>
            </View>
            <Text style={styles.brandText}>BOULDER</Text>
          </View>
          <TouchableOpacity>
            <Ionicons
              name="person-circle-outline"
              size={32}
              color={colors.offWhite}
            />
          </TouchableOpacity>
        </View>

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
              <View style={styles.streakRow}>
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
                    {/* Progress Circle - only show when there's a score */}
                    {hasCompletedToday && (
                      <Circle
                        cx={RING_SIZE / 2}
                        cy={RING_SIZE / 2}
                        r={RING_RADIUS}
                        stroke={colors.greenGlow}
                        strokeWidth={RING_STROKE_WIDTH}
                        fill="transparent"
                        strokeDasharray={RING_CIRCUMFERENCE}
                        strokeDashoffset={RING_CIRCUMFERENCE - (todayAverageScore / 100) * RING_CIRCUMFERENCE}
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
              </View>
            )}
          </View>

          {/* Mastery Tracker Section */}
          {isMasteryLoading ? (
            <MasterySkeleton />
          ) : masteryData?.topic ? (
            <View style={styles.masterySection}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Mastery Tracker</Text>
                <Ionicons
                  name="bar-chart-outline"
                  size={20}
                  color={colors.offWhite}
                />
              </View>

              <View style={styles.masteryCard}>
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
              </View>
            </View>
          ) : (
            <View style={styles.masterySection}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Mastery Tracker</Text>
                <Ionicons
                  name="bar-chart-outline"
                  size={20}
                  color={colors.offWhite}
                />
              </View>
              <View style={styles.masteryEmptyCard}>
                <EmptyState
                  illustration="trophy"
                  title="Build Your Mastery"
                  subtitle="Complete quizzes to discover your strongest topics"
                  actionLabel="Start Learning"
                  onAction={() => router.push('/(protected)/(tabs)/quiz')}
                />
              </View>
            </View>
          )}

          {/* Leaderboard Section */}
          <View style={styles.leaderboardSection}>
            <Text style={styles.sectionTitle}>Top Contenders</Text>
            <Text style={styles.leaderboardLabel}>LIVE LEADERBOARD</Text>
          </View>

          {/* Start Quiz Button */}
          <TouchableOpacity style={styles.startQuizButton} onPress={() => router.push(`/quiz/CreateQuiz`)}>
            <Text
              style={styles.startQuizText}
            >
              START QUIZ
            </Text>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={colors.charcoal}
            />
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: colors.charcoal,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  logoIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: colors.greenGlow,
    justifyContent: "center",
    alignItems: "center",
  },
  logoText: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.charcoal,
  },
  brandText: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.offWhite,
    letterSpacing: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  streakSection: {
    marginTop: 8,
    marginBottom: 32,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.offWhite,
    marginBottom: 16,
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
    fontSize: 48,
    fontWeight: "bold",
    color: colors.offWhite,
    marginBottom: 4,
  },
  streakSubtext: {
    fontSize: 14,
    color: colors.offWhite,
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
    fontSize: 22,
    fontWeight: "bold",
    color: colors.greenGlow,
  },
  progressLabel: {
    fontSize: 9,
    color: colors.greenGlow,
    fontWeight: "600",
    letterSpacing: 0.5,
    marginTop: 2,
  },
  masterySection: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.offWhite,
  },
  masteryCard: {
    backgroundColor: colors.darkGrey,
    borderRadius: 16,
    padding: 20,
  },
  masteryEmptyCard: {
    backgroundColor: colors.darkGrey,
    borderRadius: 16,
    paddingVertical: 8,
  },
  cardLabel: {
    fontSize: 10,
    fontWeight: "600",
    color: colors.offWhite,
    opacity: 0.7,
    letterSpacing: 1,
    marginBottom: 12,
  },
  masteryHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  masterySubject: {
    fontSize: 20,
    fontWeight: "600",
    color: colors.offWhite,
    flex: 1,
  },
  starsContainer: {
    flexDirection: "row",
    gap: 4,
  },
  masteryStats: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  masteryPercentage: {
    fontSize: 32,
    fontWeight: "bold",
    color: colors.greenGlow,
  },
  masteryInfo: {
    flex: 1,
  },
  masteryLevel: {
    fontSize: 10,
    fontWeight: "600",
    color: colors.offWhite,
    opacity: 0.7,
    letterSpacing: 1,
    marginBottom: 8,
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
    marginBottom: 24,
  },
  leaderboardLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.offWhite,
    opacity: 0.7,
    letterSpacing: 1,
    marginTop: 8,
  },
  startQuizButton: {
    backgroundColor: colors.sage,
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 24,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    marginBottom: 20,
  },
  startQuizText: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.charcoal,
    letterSpacing: 0.5,
  },
});
