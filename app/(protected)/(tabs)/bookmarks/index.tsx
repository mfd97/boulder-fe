import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  RefreshControl,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import type { ThemeColors } from '@/constants/colors';
import { useTheme } from '@/contexts/ThemeContext';
import { typography } from '@/constants/typography';
import { spacing } from '@/constants/spacing';
import { getQuizHistory, QuizHistoryItem } from '@/api/quiz';
import { HistoryItemSkeleton } from '@/components/Skeleton';
import EmptyState from '@/components/EmptyState';
import AppHeader from '@/components/AppHeader';
import { useCardStyle } from '@/components/Card';

// Pressable card wrapper with scale animation
function AnimatedPressable({ 
  children, 
  onPress, 
  style,
  ...rest
}: { 
  children: React.ReactNode; 
  onPress?: () => void; 
  style?: any;
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
      onPressIn={() => { scale.value = withSpring(0.98, { damping: 15 }); }}
      onPressOut={() => { scale.value = withSpring(1, { damping: 15 }); }}
      {...rest}
    >
      <Animated.View style={[style, animatedStyle]}>
        {children}
      </Animated.View>
    </Pressable>
  );
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInMinutes < 1) {
    return 'JUST NOW';
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes} MINUTE${diffInMinutes > 1 ? 'S' : ''} AGO`;
  } else if (diffInHours < 24) {
    return `${diffInHours} HOUR${diffInHours > 1 ? 'S' : ''} AGO`;
  } else if (diffInDays < 7) {
    return `${diffInDays} DAY${diffInDays > 1 ? 'S' : ''} AGO`;
  } else {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).toUpperCase();
  }
}

function getDifficultyColor(difficulty: string, colors: ThemeColors): string {
  switch (difficulty.toLowerCase()) {
    case 'easy':
      return colors.greenGlow;
    case 'medium':
      return '#FFA726';
    case 'hard':
      return '#EF5350';
    default:
      return colors.sage;
  }
}

export default function HistoryScreen() {
  const { colors } = useTheme();
  const cardStyle = useCardStyle();
  const styles = useMemo(() => makeStyles(colors, cardStyle), [colors, cardStyle]);
  const router = useRouter();
  const { 
    data: quizzes, 
    isLoading, 
    isError, 
    refetch,
    isRefetching 
  } = useQuery({
    queryKey: ['quizHistory'],
    queryFn: getQuizHistory,
  });

  const handleQuizPress = (quizId: string) => {
    router.push({
      pathname: "/(protected)/(tabs)/bookmarks/historySummary",
      params: { quizId },
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" />
      
      <AppHeader />

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={colors.greenGlow}
          />
        }
      >
        {/* Title Section */}
        <View style={styles.titleSection}>
          <Text style={styles.title}>Quiz History</Text>
          <Text style={styles.subtitle}>Your completed quizzes</Text>
        </View>

        {/* Loading State with Skeletons */}
        {isLoading && (
          <View style={styles.historyList}>
            <HistoryItemSkeleton />
            <HistoryItemSkeleton />
            <HistoryItemSkeleton />
            <HistoryItemSkeleton />
            <HistoryItemSkeleton />
          </View>
        )}

        {/* Error State */}
        {isError && (
          <View style={styles.centerContainer}>
            <Ionicons name="alert-circle-outline" size={48} color={colors.sage} />
            <Text style={styles.emptyText}>Failed to load history</Text>
            <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
              <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Empty State */}
        {!isLoading && !isError && quizzes?.length === 0 && (
          <EmptyState
            illustration="history"
            title="Your Journey Awaits"
            subtitle="Complete your first quiz to start tracking your learning progress"
            actionLabel="Take a Quiz"
            onAction={() => router.push('/(protected)/(tabs)/quiz')}
          />
        )}

        {/* History Cards */}
        {!isLoading && !isError && quizzes && quizzes.length > 0 && (
          <View style={styles.historyList}>
            {quizzes.map((quiz: QuizHistoryItem) => (
              <AnimatedPressable 
                key={quiz._id} 
                style={styles.historyCard}
                onPress={() => handleQuizPress(quiz._id)}
                accessibilityLabel={`Quiz: ${quiz.topic}, ${quiz.percentage}%`}
                accessibilityRole="button"
                accessibilityHint="View quiz summary"
              >
                <View style={styles.cardHeader}>
                  <Text style={styles.timeText}>
                    {formatTimeAgo(quiz.completedAt || quiz.createdAt)}
                  </Text>
                  <View 
                    style={[
                      styles.difficultyBadge, 
                      { backgroundColor: getDifficultyColor(quiz.difficulty, colors) + '20' }
                    ]}
                  >
                    <Text 
                      style={[
                        styles.difficultyText, 
                        { color: getDifficultyColor(quiz.difficulty, colors) }
                      ]}
                    >
                      {quiz.difficulty.toUpperCase()}
                    </Text>
                  </View>
                </View>
                
                <Text style={styles.topicText}>{quiz.topic}</Text>
                
                <View style={styles.cardFooter}>
                  <View style={styles.questionCountContainer}>
                    <Ionicons name="help-circle-outline" size={16} color={colors.sage} />
                    <Text style={styles.questionCountText}>
                      {quiz.correctCount}/{quiz.questionCount} correct
                    </Text>
                  </View>
                  <View style={styles.scoreContainer}>
                    <Text style={styles.scoreText}>{quiz.percentage}%</Text>
                    <Ionicons name="chevron-forward" size={18} color={colors.sage} />
                  </View>
                </View>
              </AnimatedPressable>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function makeStyles(
  colors: ThemeColors,
  cardStyle: ReturnType<typeof useCardStyle>
) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    titleSection: { marginBottom: spacing.xxl },
    title: { ...typography.title, color: colors.textPrimary, marginBottom: spacing.sm },
    subtitle: { ...typography.bodySmall, color: colors.sage, marginTop: spacing.xs },
    scrollView: { flex: 1 },
    scrollContent: { paddingHorizontal: spacing.xl, paddingTop: spacing.xl, paddingBottom: spacing.section },
    centerContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
    emptyText: { ...typography.titleSmall, fontSize: 18, color: colors.textPrimary, marginTop: spacing.lg },
    emptySubtext: { ...typography.bodySmall, color: colors.sage, marginTop: spacing.sm, textAlign: 'center' },
    retryButton: { marginTop: spacing.lg, backgroundColor: colors.darkGrey, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 },
    retryButtonText: { fontSize: 14, fontWeight: '600', color: colors.textPrimary },
    historyList: { gap: spacing.lg },
    historyCard: { ...cardStyle },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
    timeText: { fontSize: 11, color: colors.textPrimary, opacity: 0.6, letterSpacing: 0.5 },
    difficultyBadge: { paddingHorizontal: 10, paddingVertical: spacing.xs, borderRadius: 12 },
    difficultyText: { ...typography.label, fontWeight: '700', letterSpacing: 0.5 },
    topicText: { ...typography.titleSmall, fontSize: 18, color: colors.textPrimary, lineHeight: 24, marginBottom: spacing.md },
    cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: colors.background },
    questionCountContainer: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    questionCountText: { fontSize: 13, color: colors.sage },
    scoreContainer: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
    scoreText: { ...typography.body, fontWeight: '700', color: colors.greenGlow },
  });
}
