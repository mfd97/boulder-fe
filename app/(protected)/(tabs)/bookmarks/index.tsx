import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { colors } from '@/constants/colors';
import { getQuizHistory, QuizHistoryItem } from '@/api/quiz';
import { HistoryItemSkeleton } from '@/components/Skeleton';
import EmptyState from '@/components/EmptyState';

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
      month: 'SHORT',
      day: 'numeric',
      year: 'numeric',
    }).toUpperCase();
  }
}

function getDifficultyColor(difficulty: string): string {
  switch (difficulty.toLowerCase()) {
    case 'easy':
      return colors.greenGlow;
    case 'medium':
      return '#FFA726'; // Orange
    case 'hard':
      return '#EF5350'; // Red
    default:
      return colors.sage;
  }
}

export default function HistoryScreen() {
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
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <View style={styles.logoIcon}>
            <Text style={styles.logoText}>B</Text>
          </View>
          <Text style={styles.brandText}>BOULDER</Text>
        </View>
      </View>

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
              <TouchableOpacity 
                key={quiz._id} 
                style={styles.historyCard}
                onPress={() => handleQuizPress(quiz._id)}
                activeOpacity={0.7}
              >
                <View style={styles.cardHeader}>
                  <Text style={styles.timeText}>
                    {formatTimeAgo(quiz.completedAt || quiz.createdAt)}
                  </Text>
                  <View 
                    style={[
                      styles.difficultyBadge, 
                      { backgroundColor: getDifficultyColor(quiz.difficulty) + '20' }
                    ]}
                  >
                    <Text 
                      style={[
                        styles.difficultyText, 
                        { color: getDifficultyColor(quiz.difficulty) }
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
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.charcoal,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: colors.greenGlow,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.charcoal,
  },
  brandText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.offWhite,
    letterSpacing: 1,
  },
  titleSection: {
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.offWhite,
  },
  subtitle: {
    fontSize: 14,
    color: colors.sage,
    marginTop: 4,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  centerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.offWhite,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.sage,
    marginTop: 8,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 16,
    backgroundColor: colors.darkGrey,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.offWhite,
  },
  historyList: {
    gap: 16,
  },
  historyCard: {
    backgroundColor: colors.darkGrey,
    borderRadius: 12,
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  timeText: {
    fontSize: 11,
    color: colors.offWhite,
    opacity: 0.6,
    letterSpacing: 0.5,
  },
  difficultyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  difficultyText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  topicText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.offWhite,
    lineHeight: 24,
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.charcoal,
  },
  questionCountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  questionCountText: {
    fontSize: 13,
    color: colors.sage,
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  scoreText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.greenGlow,
  },
});
