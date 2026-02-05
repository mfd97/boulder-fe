import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import { colors } from "@/constants/colors";

interface Question {
  id: number;
  question: string;
  options: string[];
}

const QUESTIONS: Question[] = [
  {
    id: 1,
    question: "What is JavaScript mainly used for?",
    options: [
      "Styling websites",
      "Making websites interactive",
      "Database storage",
    ],
  },
  {
    id: 2,
    question: "What does HTML stand for?",
    options: [
      "Hyper Trainer Marking Language",
      "Hyper Text Markup Language",
      "High Text Machine Language",
    ],
  },
  {
    id: 3,
    question: "Which keyword is used to declare a variable in JS?",
    options: ["var", "int", "define"],
  },
  {
    id: 4,
    question: "What is React?",
    options: ["A database", "A JavaScript library", "A programming language"],
  },
  {
    id: 5,
    question: "Which one is a frontend framework?",
    options: ["Node.js", "Express", "React"],
  },
];

export default function QuizScreen() {
  const router = useRouter();
  const [answers, setAnswers] = useState<Record<number, string>>({});

  const handleSelect = (questionId: number, option: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: option,
    }));
  };

  const handleSubmit = () => {
    if (Object.keys(answers).length < QUESTIONS.length) {
      Alert.alert("Incomplete Quiz", "Please answer all questions.");
      return;
    }

    Alert.alert("Quiz Submitted", "Your answers have been submitted.");
    router.replace("/"); // أو summary لاحقًا
  };

  const handleQuit = () => {
    Alert.alert("Quit Quiz", "Are you sure you want to quit?", [
      { text: "Cancel", style: "cancel" },
      { text: "Quit", style: "destructive", onPress: () => router.back() },
    ]);
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Quiz</Text>

        {QUESTIONS.map((q) => (
          <View key={q.id} style={styles.card}>
            <Text style={styles.question}>{q.question}</Text>

            {q.options.map((option) => {
              const selected = answers[q.id] === option;

              return (
                <TouchableOpacity
                  key={option}
                  style={[styles.option, selected && styles.optionSelected]}
                  onPress={() => handleSelect(q.id, option)}
                  accessibilityLabel={`option-${option}`}
                >
                  <Text
                    style={[
                      styles.optionText,
                      selected && styles.optionTextSelected,
                    ]}
                  >
                    {option}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}

        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSubmit}
          accessibilityLabel="submit-quiz"
        >
          <Text style={styles.submitText}>Submit Quiz</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quitButton}
          onPress={handleQuit}
          accessibilityLabel="quit-quiz"
        >
          <Text style={styles.quitText}>Quit</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.charcoal,
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    color: colors.offWhite,
    marginBottom: 24,
    textAlign: "center",
  },
  card: {
    backgroundColor: colors.darkGrey,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  question: {
    color: colors.offWhite,
    fontSize: 16,
    marginBottom: 12,
  },
  option: {
    borderWidth: 1,
    borderColor: colors.sage,
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  optionSelected: {
    backgroundColor: colors.greenGlow,
    borderColor: colors.greenGlow,
  },
  optionText: {
    color: colors.offWhite,
  },
  optionTextSelected: {
    color: colors.charcoal,
    fontWeight: "600",
  },
  submitButton: {
    backgroundColor: colors.greenGlow,
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
    alignItems: "center",
  },
  submitText: {
    color: colors.charcoal,
    fontSize: 16,
    fontWeight: "600",
  },
  quitButton: {
    marginTop: 12,
    alignItems: "center",
  },
  quitText: {
    color: colors.sage,
    fontSize: 14,
  },
});
