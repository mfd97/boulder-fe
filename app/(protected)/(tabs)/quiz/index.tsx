import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  Dimensions,
  Alert,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useQuery, useMutation } from '@tanstack/react-query';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import type { ThemeColors } from '@/constants/colors';
import { useTheme } from '@/contexts/ThemeContext';
import { typography } from '@/constants/typography';
import { spacing } from '@/constants/spacing';
import { getQuizHistory, createQuiz, QuizHistoryItem } from '@/api/quiz';
import QuizLoadingOverlay from '@/components/QuizLoadingOverlay';
import EmptyState from '@/components/EmptyState';
import AppHeader from '@/components/AppHeader';
import { useCardStyle } from '@/components/Card';

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
      disabled={disabled}
      {...rest}
    >
      <Animated.View style={[style, animatedStyle]}>
        {children}
      </Animated.View>
    </Pressable>
  );
}

const { width: screenWidth } = Dimensions.get('window');
const CARD_GAP = 12;
const CARD_SIZE = (screenWidth - 40 - CARD_GAP) / 2; // 40 = padding (20 * 2)

// Icons for different topics (rotating through them)
const TOPIC_ICONS: Array<keyof typeof Ionicons.glyphMap> = [
  'bulb-outline',
  'code-slash-outline',
  'flask-outline',
  'book-outline',
  'rocket-outline',
  'cube-outline',
];

export default function QuizHubScreen() {
  const { colors } = useTheme();
  const cardStyle = useCardStyle();
  const styles = useMemo(() => makeStyles(colors, cardStyle), [colors, cardStyle]);
  const router = useRouter();
  const [generatingTopic, setGeneratingTopic] = useState('');

  // Fetch quiz history
  const { data: quizHistory, isLoading } = useQuery({
    queryKey: ['quizHistory'],
    queryFn: getQuizHistory,
  });

  // Mutation for creating a new quiz
  const { mutate: startQuiz, isPending: isGenerating } = useMutation({
    mutationFn: createQuiz,
    onSuccess: (data) => {
      setGeneratingTopic('');
      router.push({
        pathname: "/(protected)/(tabs)/quiz/quizScreen",
        params: { quizData: JSON.stringify(data) },
      });
    },
    onError: (error) => {
      setGeneratingTopic('');
      console.error(error);
      Alert.alert("Error", "Failed to generate quiz. Please try again.");
    },
  });

  // Extract unique recent topics (max 6)
  const recentTopics = useMemo(() => {
    if (!quizHistory || quizHistory.length === 0) return [];
    
    // Get unique topics with their latest quiz info
    const topicMap = new Map<string, QuizHistoryItem>();
    quizHistory.forEach((quiz) => {
      if (!topicMap.has(quiz.topic)) {
        topicMap.set(quiz.topic, quiz);
      }
    });
    
    // Convert to array and take first 6
    return Array.from(topicMap.values()).slice(0, 6);
  }, [quizHistory]);

  const handleCreateQuiz = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push("/(protected)/(tabs)/quiz/CreateQuiz");
  };

  const handleViewHistory = () => {
    router.push("/(protected)/(tabs)/bookmarks");
  };

  const handleTopicPress = (topic: string, difficulty: string) => {
    if (isGenerating) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setGeneratingTopic(topic);
    startQuiz({ topic, difficulty });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" />
      
      {/* Quiz Loading Overlay */}
      <QuizLoadingOverlay topic={generatingTopic} visible={isGenerating} />

      <AppHeader />

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Title Section */}
        <View style={styles.titleSection}>
          <Text style={styles.title}>Quiz Hub</Text>
          <Text style={styles.subtitle}>Deep knowledge made approachable.</Text>
        </View>

        {/* Create New Quiz Button */}
        <TouchableOpacity 
          style={[styles.createButton, isGenerating && styles.createButtonDisabled]}
          onPress={handleCreateQuiz}
          activeOpacity={0.7}
          disabled={isGenerating}
          accessibilityLabel="Create new quiz"
          accessibilityRole="button"
          accessibilityHint="Generate a new quiz with AI"
        >
          <View style={styles.createButtonContent}>
            <View style={styles.createButtonTextContainer}>
              <Text style={styles.createButtonTitle}>Create New Quiz</Text>
              <Text style={styles.createButtonSubtitle}>Generate with AI assistance</Text>
            </View>
            <Ionicons name="add-circle" size={32} color={colors.charcoal} />
          </View>
        </TouchableOpacity>

        {/* Recent Learning Section */}
        <View style={styles.recentSection}>
          <View style={styles.recentHeader}>
            <Text style={styles.recentTitle}>RECENT TOPICS</Text>
            <TouchableOpacity 
              onPress={handleViewHistory}
              accessibilityLabel="View history"
              accessibilityRole="button"
            >
              <Text style={styles.viewHistoryLink}>View History</Text>
            </TouchableOpacity>
          </View>

          {/* Loading State */}
          {isLoading && (
            <View style={styles.emptyState}>
              <ActivityIndicator size="small" color={colors.greenGlow} />
              <Text style={styles.emptyText}>Loading topics...</Text>
            </View>
          )}

          {/* Empty State */}
          {!isLoading && recentTopics.length === 0 && (
            <EmptyState
              illustration="rocket"
              title="Ready to Learn?"
              subtitle="Pick any topic and challenge yourself with AI-generated questions"
              actionLabel="Create Your First Quiz"
              onAction={() => router.push('/(protected)/(tabs)/quiz/CreateQuiz')}
            />
          )}

          {/* Topic Grid */}
          {!isLoading && recentTopics.length > 0 && (
            <View style={styles.topicGrid}>
              {recentTopics.map((quiz, index) => (
                <AnimatedPressable
                  key={quiz._id}
                  style={styles.topicCard}
                  onPress={() => handleTopicPress(quiz.topic, quiz.difficulty)}
                  disabled={isGenerating}
                  accessibilityLabel={`Retake quiz: ${quiz.topic}, ${quiz.difficulty}`}
                  accessibilityRole="button"
                >
                  <View style={styles.topicIconContainer}>
                    <Ionicons 
                      name={TOPIC_ICONS[index % TOPIC_ICONS.length]} 
                      size={28} 
                      color={colors.greenGlow} 
                    />
                  </View>
                  <Text style={styles.topicTitle} numberOfLines={2}>
                    {quiz.topic}
                  </Text>
                  <View style={styles.topicMeta}>
                    <Text style={styles.topicScore}>{quiz.percentage}%</Text>
                    <View style={styles.topicDifficulty}>
                      <Text style={styles.topicDifficultyText}>
                        {quiz.difficulty.toUpperCase()}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.retakeHint}>
                    <Ionicons name="refresh" size={12} color={colors.sage} />
                    <Text style={styles.retakeText}>Tap to retake</Text>
                  </View>
                </AnimatedPressable>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function makeStyles(colors: ThemeColors, cardStyle: ReturnType<typeof useCardStyle>) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    scrollView: { flex: 1 },
    scrollContent: { paddingHorizontal: spacing.xl, paddingTop: spacing.xl, paddingBottom: spacing.section },
    titleSection: { marginBottom: spacing.xxl },
    title: { ...typography.title, color: colors.textPrimary, marginBottom: spacing.sm },
    subtitle: { ...typography.bodySmall, color: colors.sage, marginTop: spacing.xs },
    createButton: { backgroundColor: colors.darkGrey, borderRadius: 16, padding: spacing.xl, marginBottom: spacing.xxxl },
    createButtonContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    createButtonTextContainer: { flex: 1 },
    createButtonTitle: { ...typography.titleSmall, fontSize: 18, color: colors.textPrimary, marginBottom: spacing.xs },
    createButtonSubtitle: { ...typography.caption, color: colors.textPrimary, opacity: 0.7 },
    createButtonDisabled: { opacity: 0.6 },
    recentSection: { marginBottom: spacing.xxl },
    recentHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg },
    recentTitle: { ...typography.caption, color: colors.textPrimary, letterSpacing: 1 },
    viewHistoryLink: { ...typography.caption, color: colors.greenGlow },
    emptyState: { alignItems: 'center', paddingVertical: spacing.section, gap: spacing.sm },
    emptyText: { ...typography.body, color: colors.textPrimary },
    emptySubtext: { fontSize: 13, color: colors.sage },
    topicGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: CARD_GAP },
    topicCard: { width: CARD_SIZE, height: CARD_SIZE, ...cardStyle, justifyContent: 'space-between' },
    topicIconContainer: { width: 48, height: 48, borderRadius: 12, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' },
    topicTitle: { ...typography.body, fontSize: 15, color: colors.textPrimary, lineHeight: 20 },
    topicMeta: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
    topicScore: { ...typography.titleSmall, fontSize: 18, color: colors.greenGlow },
    topicDifficulty: { backgroundColor: colors.background, paddingHorizontal: spacing.sm, paddingVertical: 3, borderRadius: 6 },
    topicDifficultyText: { ...typography.label, fontSize: 9, color: colors.sage, letterSpacing: 0.5 },
    retakeHint: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
    retakeText: { fontSize: 11, color: colors.sage },
  });
}
