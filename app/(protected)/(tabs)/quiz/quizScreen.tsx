import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { useState, useMemo } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useQueryClient } from "@tanstack/react-query";
import { colors } from "@/constants/colors";
import { SafeAreaView } from "react-native-safe-area-context";
import { submitQuizResult } from "@/api/quiz";

interface Question {
  _id: string;
  question: string;
  options: string[];
  correct_answer: string;
  score: number;
}

interface QuizData {
  _id: string;
  topic: string;
  difficulty: string;
  questions: Question[];
  createdAt: string;
}

export default function QuizScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { quizData: quizDataParam } = useLocalSearchParams<{ quizData: string }>();
  const [answers, setAnswers] = useState<Record<string, string>>({});

  // Parse quiz data from params
  const quizData = useMemo<QuizData | null>(() => {
    if (!quizDataParam) return null;
    try {
      return JSON.parse(quizDataParam);
    } catch {
      console.error("Failed to parse quiz data");
      return null;
    }
  }, [quizDataParam]);

  // If no quiz data, show error
  if (!quizData) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>No quiz data found</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const { topic, difficulty, questions } = quizData;

  const handleSelect = (questionId: string, option: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: option,
    }));
  };

  const handleSubmit = async () => {
    if (Object.keys(answers).length < questions.length) {
      Alert.alert("Incomplete Quiz", "Please answer all questions.");
      return;
    }

    // Calculate score
    let totalScore = 0;
    let earnedScore = 0;
    let correctCount = 0;
    questions.forEach((q) => {
      totalScore += q.score;
      if (answers[q._id] === q.correct_answer) {
        earnedScore += q.score;
        correctCount++;
      }
    });

    // Save results to backend
    try {
      await submitQuizResult({
        quizId: quizData._id,
        answers,
        correctCount,
        totalScore,
        earnedScore,
      });
      // Invalidate queries so they refetch with new data
      queryClient.invalidateQueries({ queryKey: ['streak'] });
      queryClient.invalidateQueries({ queryKey: ['quizHistory'] });
    } catch (error) {
      console.log("Failed to save quiz result:", error);
      // Continue to show summary even if save fails
    }

    // Navigate to summary with result data
    const resultData = {
      quizId: quizData._id,
      topic,
      difficulty,
      questions,
      answers,
      totalScore,
      earnedScore,
      correctCount,
    };

    router.replace({
      pathname: "/(protected)/(tabs)/quiz/quizSummary",
      params: { resultData: JSON.stringify(resultData) },
    });
  };

  // Calculate progress percentage
  const progress = Math.round((Object.keys(answers).length / questions.length) * 100);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Progress Header */}
      <View style={styles.header}>
        <View style={styles.progressContainer}>
          <Text style={styles.progressLabel}>PROGRESS</Text>
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBar, { width: `${progress}%` }]} />
          </View>
          <Text style={styles.progressPercent}>{progress}</Text>
        </View>

        {/* Quiz Title */}
        <Text style={styles.quizTitle}>{topic}</Text>
        <Text style={styles.quizSubtitle}>
          {difficulty.toUpperCase()} QUIZ
        </Text>
      </View>

      {/* Questions */}
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {questions.map((q, index) => (
          <View key={q._id} style={styles.questionContainer}>
            {/* Question Header */}
            <View style={styles.questionHeader}>
              <Text style={styles.questionText}>{q.question}</Text>
              <Text style={styles.questionNumber}>#{index + 1}</Text>
            </View>

            {/* Options */}
            {q.options.map((option) => {
              const selected = answers[q._id] === option;

              return (
                <TouchableOpacity
                  key={option}
                  style={[styles.option, selected && styles.optionSelected]}
                  onPress={() => handleSelect(q._id, option)}
                  accessibilityLabel={`option-${option}`}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.optionText,
                      selected && styles.optionTextSelected,
                    ]}
                  >
                    {option}
                  </Text>
                  {selected && (
                    <Ionicons
                      name="checkmark"
                      size={18}
                      color={colors.charcoal}
                      style={styles.checkmark}
                    />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        ))}

        {/* Submit Button */}
        <TouchableOpacity
          style={[
            styles.submitButton,
            Object.keys(answers).length < questions.length && styles.submitButtonDisabled,
          ]}
          onPress={handleSubmit}
          accessibilityLabel="submit-quiz"
        >
          <Text style={styles.submitText}>Submit Quiz</Text>
        </TouchableOpacity>

        {/* Quit Button */}
        <TouchableOpacity
          style={styles.quitButton}
          onPress={() => {
            Alert.alert("Quit Quiz", "Are you sure you want to quit? Your progress will be lost.", [
              { text: "Cancel", style: "cancel" },
              { text: "Quit", style: "destructive", onPress: () => router.back() },
            ]);
          }}
          accessibilityLabel="quit-quiz"
        >
          <Text style={styles.quitText}>Quit</Text>
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
  backButton: {
    backgroundColor: colors.sage,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  backButtonText: {
    color: colors.charcoal,
    fontSize: 16,
    fontWeight: "600",
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  progressLabel: {
    color: colors.offWhite,
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 1,
    marginRight: 12,
  },
  progressBarContainer: {
    flex: 1,
    height: 6,
    backgroundColor: colors.darkGrey,
    borderRadius: 3,
    marginRight: 12,
  },
  progressBar: {
    height: "100%",
    backgroundColor: colors.sage,
    borderRadius: 3,
  },
  progressPercent: {
    color: colors.charcoal,
    fontSize: 12,
    fontWeight: "700",
    backgroundColor: colors.sage,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    overflow: "hidden",
  },
  quizTitle: {
    color: colors.offWhite,
    fontSize: 28,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 8,
  },
  quizSubtitle: {
    color: colors.sage,
    fontSize: 11,
    fontWeight: "500",
    letterSpacing: 1.5,
    textAlign: "center",
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  questionContainer: {
    marginBottom: 24,
  },
  questionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  questionText: {
    color: colors.offWhite,
    fontSize: 17,
    fontWeight: "600",
    lineHeight: 24,
    flex: 1,
    marginRight: 12,
  },
  questionNumber: {
    color: colors.sage,
    fontSize: 13,
    fontWeight: "500",
    opacity: 0.6,
  },
  option: {
    backgroundColor: colors.darkGrey,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "transparent",
  },
  optionSelected: {
    backgroundColor: colors.sage,
    borderColor: colors.sage,
  },
  optionText: {
    color: colors.offWhite,
    fontSize: 15,
    flex: 1,
  },
  optionTextSelected: {
    color: colors.charcoal,
    fontWeight: "600",
  },
  checkmark: {
    marginLeft: 8,
  },
  submitButton: {
    backgroundColor: colors.greenGlow,
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 16,
    alignItems: "center",
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitText: {
    color: colors.charcoal,
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  quitButton: {
    marginTop: 16,
    marginBottom: 20,
    alignItems: "center",
    paddingVertical: 12,
  },
  quitText: {
    color: colors.sage,
    fontSize: 15,
    fontWeight: "500",
  },
});
