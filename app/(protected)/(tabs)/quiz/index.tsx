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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useQuery, useMutation } from '@tanstack/react-query';
import { colors } from '@/constants/colors';
import { getQuizHistory, createQuiz, QuizHistoryItem } from '@/api/quiz';
import QuizLoadingOverlay from '@/components/QuizLoadingOverlay';

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
    router.push("/(protected)/(tabs)/quiz/CreateQuiz");
  };

  const handleViewHistory = () => {
    router.push("/(protected)/(tabs)/bookmarks");
  };

  const handleTopicPress = (topic: string, difficulty: string) => {
    if (isGenerating) return;
    setGeneratingTopic(topic);
    startQuiz({ topic, difficulty });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" />
      
      {/* Quiz Loading Overlay */}
      <QuizLoadingOverlay topic={generatingTopic} visible={isGenerating} />

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
      >
        {/* Title Section */}
        <View style={styles.titleSection}>
          <Text style={styles.title}>Quiz Hub</Text>
          <Text style={styles.subtitle}>Deep knowledge made approachable.</Text>
        </View>

        {/* Create New Quiz Button */}
        <TouchableOpacity 
          style={styles.createButton}
          onPress={handleCreateQuiz}
          activeOpacity={0.7}
          disabled={isGenerating}
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
            <TouchableOpacity onPress={handleViewHistory}>
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
            <View style={styles.emptyState}>
              <Ionicons name="help-circle-outline" size={32} color={colors.sage} />
              <Text style={styles.emptyText}>No quizzes yet</Text>
              <Text style={styles.emptySubtext}>Create your first quiz above!</Text>
            </View>
          )}

          {/* Topic Grid */}
          {!isLoading && recentTopics.length > 0 && (
            <View style={styles.topicGrid}>
              {recentTopics.map((quiz, index) => (
                <TouchableOpacity
                  key={quiz._id}
                  style={styles.topicCard}
                  onPress={() => handleTopicPress(quiz.topic, quiz.difficulty)}
                  activeOpacity={0.7}
                  disabled={isGenerating}
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
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  titleSection: {
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.offWhite,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: colors.offWhite,
    opacity: 0.7,
  },
  createButton: {
    backgroundColor: '#3A3D40',
    borderRadius: 16,
    padding: 20,
    marginBottom: 32,
  },
  createButtonContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  createButtonTextContainer: {
    flex: 1,
  },
  createButtonTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.offWhite,
    marginBottom: 4,
  },
  createButtonSubtitle: {
    fontSize: 12,
    color: colors.offWhite,
    opacity: 0.7,
  },
  recentSection: {
    marginBottom: 24,
  },
  recentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  recentTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.offWhite,
    letterSpacing: 1,
  },
  viewHistoryLink: {
    fontSize: 12,
    color: colors.greenGlow,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 8,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.offWhite,
  },
  emptySubtext: {
    fontSize: 13,
    color: colors.sage,
  },
  topicGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: CARD_GAP,
  },
  topicCard: {
    width: CARD_SIZE,
    height: CARD_SIZE,
    backgroundColor: colors.darkGrey,
    borderRadius: 16,
    padding: 16,
    justifyContent: 'space-between',
  },
  topicIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.charcoal,
    justifyContent: 'center',
    alignItems: 'center',
  },
  topicTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.offWhite,
    lineHeight: 20,
  },
  topicMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  topicScore: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.greenGlow,
  },
  topicDifficulty: {
    backgroundColor: colors.charcoal,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  topicDifficultyText: {
    fontSize: 9,
    fontWeight: '600',
    color: colors.sage,
    letterSpacing: 0.5,
  },
  retakeHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  retakeText: {
    fontSize: 11,
    color: colors.sage,
  },
});
