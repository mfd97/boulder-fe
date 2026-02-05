import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from "react-native";
import { colors } from "@/constants/colors";

export default function StartQuizScreen() {
  // 1. Hooks
  const [topic, setTopic] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  // 2. Derived values
  const level = "beginner"; // MVP: fixed level

  // 3. Handlers
  const handleSubmit = () => {
    if (!topic.trim()) {
      Alert.alert("Missing topic", "Please enter what you are learning.");
      return;
    }

    setLoading(true);

    // Placeholder for quiz generation logic
    console.log("Starting quiz with:", {
      topic,
      level,
    });

    setLoading(false);
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
        accessibilityLabel="Learning topic input"
      />

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleSubmit}
        accessibilityLabel="Start quiz button"
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? "Starting..." : "Start Quiz"}
        </Text>
      </TouchableOpacity>

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
  levelText: {
    marginTop: 16,
    color: colors.sage,
    fontSize: 14,
    textAlign: "center",
  },
});
