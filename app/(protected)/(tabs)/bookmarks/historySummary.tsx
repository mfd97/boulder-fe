import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useMemo } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import type { ThemeColors } from "@/constants/colors";
import { useTheme } from "@/contexts/ThemeContext";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Circle } from "react-native-svg";
import { getQuizById } from "@/api/quiz";

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

export default function HistorySummaryScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const router = useRouter();
  const { quizId } = useLocalSearchParams<{ quizId: string }>();

  // Fetch quiz data from API
  const { data: quizFromApi, isLoading, isError } = useQuery({
    queryKey: ['quiz', quizId],
    queryFn: () => getQuizById(quizId!),
    enabled: !!quizId,
  });

  // Convert API data to result format
  const result = useMemo<QuizResult | null>(() => {
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

  // Loading state
  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.centerContainer}>
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
        <View style={styles.centerContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={colors.sage} />
          <Text style={styles.errorText}>No result data found</Text>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.back()}
          >
            <Text style={styles.actionButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const { topic, questions, answers, correctCount } = result;
  const percentage = Math.round((correctCount / questions.length) * 100);

  // Circle progress properties
  const size = 160;
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const progressOffset = circumference - (percentage / 100) * circumference;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header with Back Button */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Quiz Summary</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Topic Title */}
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
            <Text style={styles.completedText}>SCORE</Text>
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
                  <Text style={styles.questionText} numberOfLines={2}>{q.question}</Text>
                  
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

        {/* Back to History Button */}
        <TouchableOpacity
          style={styles.backToHistoryButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backToHistoryText}>BACK TO HISTORY</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function makeStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.darkGrey },
    backButton: { width: 40, height: 40, justifyContent: "center", alignItems: "center" },
    headerTitle: { color: colors.textPrimary, fontSize: 18, fontWeight: "600" },
    headerSpacer: { width: 40 },
    scrollView: { flex: 1 },
    content: { paddingHorizontal: 20, paddingBottom: 40 },
    centerContainer: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
    errorText: { color: colors.textPrimary, fontSize: 18, marginTop: 16, marginBottom: 20 },
    loadingText: { color: colors.sage, fontSize: 14, marginTop: 12 },
    topicTitle: { color: colors.textPrimary, fontSize: 28, fontWeight: "700", marginTop: 20, marginBottom: 32 },
    progressContainer: { alignItems: "center", justifyContent: "center", marginBottom: 40, height: 160 },
    progressSvg: { position: "absolute" },
    progressTextContainer: { alignItems: "center" },
    percentageText: { color: colors.textPrimary, fontSize: 42, fontWeight: "700" },
    completedText: { color: colors.sage, fontSize: 11, fontWeight: "600", letterSpacing: 1, marginTop: 4 },
    breakdownHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
    breakdownTitle: { color: colors.textPrimary, fontSize: 12, fontWeight: "600", letterSpacing: 1 },
    breakdownCount: { color: colors.sage, fontSize: 12, fontWeight: "500" },
    questionsList: { marginBottom: 24 },
    questionItem: { flexDirection: "row", backgroundColor: colors.darkGrey, borderRadius: 12, padding: 16, marginBottom: 12 },
    iconContainer: { width: 28, height: 28, borderRadius: 14, justifyContent: "center", alignItems: "center", marginRight: 12 },
    iconCorrect: { backgroundColor: "rgba(159, 242, 148, 0.15)" },
    iconIncorrect: { backgroundColor: "rgba(255, 107, 107, 0.15)" },
    questionContent: { flex: 1 },
    questionLabel: { color: colors.sage, fontSize: 10, fontWeight: "600", letterSpacing: 1, marginBottom: 6 },
    questionText: { color: colors.textPrimary, fontSize: 15, fontWeight: "500", lineHeight: 20, marginBottom: 12 },
    answerPill: { alignSelf: "flex-start", paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8 },
    answerCorrect: { backgroundColor: colors.sage },
    answerIncorrect: { backgroundColor: colors.darkGrey, borderWidth: 1, borderColor: "rgba(255, 107, 107, 0.3)" },
    answerText: { fontSize: 14, fontWeight: "600" },
    answerTextCorrect: { color: colors.charcoal },
    answerTextIncorrect: { color: colors.textPrimary },
    correctAnswerHint: { color: colors.greenGlow, fontSize: 12, marginTop: 8, fontStyle: "italic" },
    actionButton: { backgroundColor: colors.sage, paddingVertical: 16, paddingHorizontal: 32, borderRadius: 12, alignItems: "center" },
    actionButtonText: { color: colors.charcoal, fontSize: 14, fontWeight: "700", letterSpacing: 1 },
    backToHistoryButton: { backgroundColor: colors.sage, paddingVertical: 16, borderRadius: 12, alignItems: "center", marginTop: 8 },
    backToHistoryText: { color: colors.charcoal, fontSize: 14, fontWeight: "700", letterSpacing: 1 },
  });
}
