import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useMemo } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useQuery, useMutation } from "@tanstack/react-query";
import { colors } from "@/constants/colors";
import { spacing } from "@/constants/spacing";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Circle } from "react-native-svg";
import ConfettiCannon from "react-native-confetti-cannon";
import { getQuizById, createQuiz } from "@/api/quiz";
import QuizLoadingOverlay from "@/components/QuizLoadingOverlay";

const { width: screenWidth } = Dimensions.get("window");

interface Question {
  _id: string;
  question: string;
  options: string[];
  correct_answer: string;
  score: number;
}

interface QuizResult {
  topic: string;
  difficulty: string;
  questions: Question[];
  answers: Record<string, string>;
  totalScore: number;
  earnedScore: number;
  correctCount: number;
}

export default function QuizSummaryScreen() {
  const router = useRouter();
  const { resultData: resultDataParam, quizId } = useLocalSearchParams<{ 
    resultData?: string;
    quizId?: string;
  }>();

  // Fetch quiz data from API if quizId is provided (from history)
  const { data: quizFromApi, isLoading, isError } = useQuery({
    queryKey: ['quiz', quizId],
    queryFn: () => getQuizById(quizId!),
    enabled: !!quizId && !resultDataParam,
  });

  // Mutation for creating a new quiz on the same topic
  const { mutate: startNewQuiz, isPending: isGenerating } = useMutation({
    mutationFn: createQuiz,
    onSuccess: (quizData) => {
      console.log("Quiz created successfully:", quizData);
      router.replace({
        pathname: "/(protected)/(tabs)/quiz/quizScreen",
        params: { quizData: JSON.stringify(quizData) },
      });
    },
    onError: (error: Error) => {
      console.log("Quiz creation error:", error);
      Alert.alert("Error", error.message || "Failed to generate quiz. Please try again.");
    },
  });

  // Parse result data from params (from fresh quiz submission)
  const resultFromParams = useMemo<QuizResult | null>(() => {
    if (!resultDataParam) return null;
    try {
      return JSON.parse(resultDataParam);
    } catch {
      console.error("Failed to parse result data");
      return null;
    }
  }, [resultDataParam]);

  // Convert API data to result format
  const resultFromApi = useMemo<QuizResult | null>(() => {
    if (!quizFromApi) return null;
    return {
      topic: quizFromApi.topic,
      difficulty: quizFromApi.difficulty,
      questions: quizFromApi.questions,
      answers: quizFromApi.answers || {},
      totalScore: quizFromApi.totalScore,
      earnedScore: quizFromApi.earnedScore,
      correctCount: quizFromApi.correctCount,
    };
  }, [quizFromApi]);

  // Use whichever result is available
  const result = resultFromParams || resultFromApi;

  // Loading state (only when loading from API)
  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.errorContainer}>
          <ActivityIndicator size="large" color={colors.greenGlow} />
          <Text style={styles.loadingText}>Loading quiz results...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // If no result data, show error
  if (!result || isError) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>No result data found</Text>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.replace("/(protected)/(tabs)/home")}
          >
            <Text style={styles.actionButtonText}>Go Home</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const { topic, difficulty, questions, answers, correctCount } = result;
  const percentage = Math.round((correctCount / questions.length) * 100);

  // Handle starting a new session on the same topic
  const handleStartNewSession = () => {
    if (isGenerating) return;
    startNewQuiz({ topic, difficulty });
  };

  // Circle progress properties
  const size = 160;
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const progressOffset = circumference - (percentage / 100) * circumference;

  const isPerfectScore = percentage === 100;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Quiz Loading Overlay */}
      <QuizLoadingOverlay topic={topic} visible={isGenerating} />

      {/* Confetti for perfect score */}
      {isPerfectScore && (
        <ConfettiCannon
          count={150}
          origin={{ x: screenWidth / 2, y: -20 }}
          autoStart={true}
          fadeOut={true}
          fallSpeed={2500}
          explosionSpeed={300}
          colors={[
            colors.greenGlow,
            colors.sage,
            colors.offWhite,
            "#7ED47A",
            "#D4E5D0",
          ]}
        />
      )}

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Text style={styles.headerLabel}>QUIZ SUMMARY</Text>
        <Text style={styles.topicTitle}>{topic}</Text>

        {/* Circular Progress */}
        <View style={styles.progressContainer}>
          <Svg width={size} height={size} style={styles.progressSvg}>
            {/* Background Circle */}
            <Circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={colors.darkGrey}
              strokeWidth={strokeWidth}
              fill="transparent"
            />
            {/* Progress Circle */}
            <Circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={colors.greenGlow}
              strokeWidth={strokeWidth}
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={progressOffset}
              strokeLinecap="round"
              rotation="-90"
              origin={`${size / 2}, ${size / 2}`}
            />
          </Svg>
          <View style={styles.progressTextContainer}>
            <Text style={styles.percentageText}>{percentage}%</Text>
            <Text style={styles.completedText}>COMPLETED</Text>
          </View>
        </View>

        {/* Question Breakdown Header */}
        <View style={styles.breakdownHeader}>
          <Text style={styles.breakdownTitle}>QUESTION BREAKDOWN</Text>
          <Text style={styles.breakdownCount}>{correctCount}/{questions.length} Correct</Text>
        </View>

        {/* Questions List */}
        <View style={styles.questionsList}>
          {questions.map((q, index) => {
            const userAnswer = answers[q._id];
            const isCorrect = userAnswer === q.correct_answer;

            return (
              <View key={q._id} style={styles.questionItem}>
                {/* Icon */}
                <View style={[styles.iconContainer, isCorrect ? styles.iconCorrect : styles.iconIncorrect]}>
                  <Ionicons
                    name={isCorrect ? "checkmark" : "close"}
                    size={16}
                    color={isCorrect ? colors.success : colors.error}
                  />
                </View>

                {/* Question Content */}
                <View style={styles.questionContent}>
                  <Text style={styles.questionLabel}>QUESTION {index + 1}</Text>
                  <Text style={styles.questionText} numberOfLines={3}>{q.question}</Text>
                  
                  {/* User's Answer */}
                  <View style={[
                    styles.answerPill,
                    isCorrect ? styles.answerCorrect : styles.answerIncorrect
                  ]}>
                    <Text style={[
                      styles.answerText,
                      isCorrect ? styles.answerTextCorrect : styles.answerTextIncorrect
                    ]}>
                      {userAnswer || "No answer"}
                    </Text>
                  </View>

                  {/* Show correct answer if wrong */}
                  {!isCorrect && (
                    <Text style={styles.correctAnswerHint}>
                      Correct: {q.correct_answer}
                    </Text>
                  )}
                </View>
              </View>
            );
          })}
        </View>

        {/* Start New Session Button */}
        <TouchableOpacity
          style={[styles.actionButton, isGenerating && styles.actionButtonDisabled]}
          onPress={handleStartNewSession}
          disabled={isGenerating}
        >
          <Text style={styles.actionButtonText}>START NEW SESSION</Text>
        </TouchableOpacity>

        {/* Exit Summary Button - goes to history if came from there, otherwise main quiz tab */}
        <TouchableOpacity
          style={styles.exitButton}
          onPress={() => router.replace(
            quizId 
              ? "/(protected)/(tabs)/bookmarks" 
              : "/(protected)/(tabs)/quiz"
          )}
        >
          <Text style={styles.exitButtonText}>
            {quizId ? "BACK TO HISTORY" : "EXIT SUMMARY"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.charcoal,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    color: colors.offWhite,
    fontSize: 18,
    marginBottom: 20,
  },
  loadingText: {
    color: colors.sage,
    fontSize: 14,
    marginTop: 12,
  },
  headerLabel: {
    color: colors.sage,
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 1.5,
    marginTop: 20,
    marginBottom: 8,
  },
  topicTitle: {
    color: colors.offWhite,
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 32,
  },
  progressContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 40,
    height: 160,
  },
  progressSvg: {
    position: "absolute",
  },
  progressTextContainer: {
    alignItems: "center",
  },
  percentageText: {
    color: colors.offWhite,
    fontSize: 42,
    fontWeight: "700",
  },
  completedText: {
    color: colors.sage,
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 1,
    marginTop: 4,
  },
  breakdownHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  breakdownTitle: {
    color: colors.offWhite,
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 1,
  },
  breakdownCount: {
    color: colors.sage,
    fontSize: 12,
    fontWeight: "500",
  },
  questionsList: {
    marginBottom: spacing.xxl,
  },
  questionItem: {
    flexDirection: "row",
    backgroundColor: colors.darkGrey,
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  iconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.md,
  },
  iconCorrect: {
    backgroundColor: "rgba(159, 242, 148, 0.15)",
  },
  iconIncorrect: {
    backgroundColor: colors.error + "26",
  },
  questionContent: {
    flex: 1,
  },
  questionLabel: {
    color: colors.sage,
    fontSize: 10,
    fontWeight: "600",
    letterSpacing: 1,
    marginBottom: 6,
  },
  questionText: {
    color: colors.offWhite,
    fontSize: 15,
    fontWeight: "500",
    lineHeight: 22,
    marginBottom: spacing.md,
  },
  answerPill: {
    alignSelf: "flex-start",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  answerCorrect: {
    backgroundColor: colors.sage,
  },
  answerIncorrect: {
    backgroundColor: colors.darkGrey,
    borderWidth: 1,
    borderColor: colors.error + "4D",
  },
  answerText: {
    fontSize: 14,
    fontWeight: "600",
  },
  answerTextCorrect: {
    color: colors.charcoal,
  },
  answerTextIncorrect: {
    color: colors.offWhite,
  },
  correctAnswerHint: {
    color: colors.greenGlow,
    fontSize: 12,
    marginTop: 8,
    fontStyle: "italic",
  },
  actionButton: {
    backgroundColor: colors.sage,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
  },
  actionButtonDisabled: {
    opacity: 0.7,
  },
  actionButtonText: {
    color: colors.charcoal,
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 1,
  },
  generatingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  exitButton: {
    marginTop: 12,
    marginBottom: 20,
    paddingVertical: 14,
    alignItems: "center",
  },
  exitButtonDisabled: {
    opacity: 0.5,
  },
  exitButtonText: {
    color: colors.sage,
    fontSize: 14,
    fontWeight: "500",
    letterSpacing: 0.5,
  },
});
