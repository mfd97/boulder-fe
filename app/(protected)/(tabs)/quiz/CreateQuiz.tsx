import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { colors } from "@/constants/colors";
import { createQuiz } from "@/api/quiz";
import { useMutation } from "@tanstack/react-query";

export default function StartQuizScreen() {
  // 1. Hooks
  const [topic, setTopic] = useState<string>("");

  // 2. Derived values
  const level = "easy"; // MVP: fixed level

  const { mutate, isPending } = useMutation({
    mutationFn: () => createQuiz(topic, level),
    onSuccess: (data) => {
      console.log(data);
      Alert.alert("Quiz Ready!", `Your quiz on "${topic}" has been created.`);
      setTopic("");
    },
    onError: (error) => {
      console.error(error);
      Alert.alert("Error", "Failed to generate quiz. Please try again.");
    },
  });

  // 3. Handlers
  const handleSubmit = () => {
    if (!topic.trim()) {
      Alert.alert("Missing topic", "Please enter what you are learning.");
      return;
    }

    console.log("Starting quiz with:", { topic, level });
    mutate();
  };

  // 4. JSX
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Start a New Quiz</Text>

      <Text style={styles.subtitle}>What are you learning today?</Text>

      <TextInput
        style={styles.input}
        placeholder="e.g. JavaScript closures"
        placeholderTextColor={colors.sage}
        value={topic}
        onChangeText={setTopic}
        editable={!isPending}
        accessibilityLabel="Learning topic input"
      />

      <TouchableOpacity
        style={[styles.button, isPending && styles.buttonDisabled]}
        onPress={handleSubmit}
        accessibilityLabel="Start quiz button"
        disabled={isPending}
      >
        {isPending ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={colors.charcoal} />
            <Text style={styles.buttonText}>  Generating...</Text>
          </View>
        ) : (
          <Text style={styles.buttonText}>Start Quiz</Text>
        )}
      </TouchableOpacity>

      {isPending && (
        <Text style={styles.loadingHint}>
          AI is creating your quiz. This may take 30-60 seconds...
        </Text>
      )}

      <Text style={styles.levelText}>Level: Beginner</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.charcoal,
    padding: 16,
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    color: colors.offWhite,
    marginBottom: 8,
    fontWeight: "600",
  },
  subtitle: {
    fontSize: 16,
    color: colors.sage,
    marginBottom: 24,
  },
  input: {
    backgroundColor: colors.darkGrey,
    color: colors.offWhite,
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    fontSize: 16,
  },
  button: {
    backgroundColor: colors.greenGlow,
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: colors.charcoal,
    fontSize: 16,
    fontWeight: "600",
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  loadingHint: {
    marginTop: 12,
    color: colors.sage,
    fontSize: 13,
    textAlign: "center",
    fontStyle: "italic",
  },
  levelText: {
    marginTop: 16,
    color: colors.sage,
    fontSize: 14,
    textAlign: "center",
  },
});
