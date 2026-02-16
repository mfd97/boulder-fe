import { useState, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Modal,
  FlatList,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import type { ThemeColors } from "@/constants/colors";
import { useTheme } from "@/contexts/ThemeContext";
import { createQuiz } from "@/api/quiz";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import QuizLoadingOverlay from "@/components/QuizLoadingOverlay";

// Difficulty options with display labels and API values
const DIFFICULTY_OPTIONS = [
  { label: "Beginner", value: "easy" },
  { label: "Intermediate", value: "medium" },
  { label: "Advanced", value: "hard" },
];

export default function StartQuizScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const router = useRouter();
  const [topic, setTopic] = useState<string>("");
  const [selectedDifficulty, setSelectedDifficulty] = useState(DIFFICULTY_OPTIONS[0]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const { mutate, isPending } = useMutation({
    mutationFn: () => createQuiz({ topic, difficulty: selectedDifficulty.value }),
    onSuccess: (data) => {
      console.log("Quiz created:", data);
      setTopic("");
      // Navigate to quiz screen with quiz data
      router.push({
        pathname: "/(protected)/(tabs)/quiz/quizScreen",
        params: { quizData: JSON.stringify(data) },
      });
    },
    onError: (error: unknown) => {
      const msg = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
      Alert.alert("Error", msg || "Failed to generate quiz. Please try again.");
    },
  });

  // 3. Handlers
  const handleSubmit = () => {
    if (!topic.trim()) {
      Alert.alert("Missing topic", "Please enter what you are learning.");
      return;
    }

    console.log("Starting quiz with:", { topic, level: selectedDifficulty.value });
    mutate();
  };

  const handleSelectDifficulty = (option: typeof DIFFICULTY_OPTIONS[0]) => {
    setSelectedDifficulty(option);
    setIsDropdownOpen(false);
  };

  // 4. JSX
  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar barStyle="light-content" />
      
      {/* Quiz Loading Overlay */}
      <QuizLoadingOverlay topic={topic} visible={isPending} />
      
      {/* Header with Back Button */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
          disabled={isPending}
        >
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Quiz</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.content}>
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

      {/* Difficulty Dropdown */}
      <Text style={styles.dropdownLabel}>Difficulty Level</Text>
      <TouchableOpacity
        style={styles.dropdown}
        onPress={() => setIsDropdownOpen(true)}
        disabled={isPending}
        activeOpacity={0.7}
      >
        <Text style={styles.dropdownText}>{selectedDifficulty.label}</Text>
        <Ionicons name="chevron-down" size={20} color={colors.textPrimary} />
      </TouchableOpacity>

      {/* Dropdown Modal */}
      <Modal
        visible={isDropdownOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsDropdownOpen(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsDropdownOpen(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Difficulty</Text>
            <FlatList
              data={DIFFICULTY_OPTIONS}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.optionItem,
                    item.value === selectedDifficulty.value && styles.optionItemSelected,
                  ]}
                  onPress={() => handleSelectDifficulty(item)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      item.value === selectedDifficulty.value && styles.optionTextSelected,
                    ]}
                  >
                    {item.label}
                  </Text>
                  {item.value === selectedDifficulty.value && (
                    <Ionicons name="checkmark" size={20} color={colors.greenGlow} />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>

      <TouchableOpacity
        style={styles.button}
        onPress={handleSubmit}
        accessibilityLabel="Start quiz button"
        disabled={isPending}
      >
        <Text style={styles.buttonText}>Start Quiz</Text>
      </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function makeStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.darkGrey },
    backButton: { width: 40, height: 40, justifyContent: "center", alignItems: "center" },
    headerTitle: { fontSize: 18, fontWeight: "600", color: colors.textPrimary },
    headerSpacer: { width: 40 },
    content: { flex: 1, padding: 16, justifyContent: "center" },
    title: { fontSize: 24, color: colors.textPrimary, marginBottom: 8, fontWeight: "600" },
    subtitle: { fontSize: 16, color: colors.sage, marginBottom: 24 },
    input: { backgroundColor: colors.darkGrey, color: colors.textPrimary, padding: 12, borderRadius: 8, marginBottom: 20, fontSize: 16 },
    dropdownLabel: { fontSize: 14, color: colors.sage, marginBottom: 8 },
    dropdown: { backgroundColor: colors.darkGrey, padding: 14, borderRadius: 8, marginBottom: 24, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    dropdownText: { color: colors.textPrimary, fontSize: 16 },
    button: { backgroundColor: colors.greenGlow, padding: 16, borderRadius: 8, alignItems: "center" },
    buttonText: { color: colors.charcoal, fontSize: 16, fontWeight: "600" },
    modalOverlay: { flex: 1, backgroundColor: "rgba(0, 0, 0, 0.7)", justifyContent: "center", alignItems: "center", padding: 20 },
    modalContent: { backgroundColor: colors.darkGrey, borderRadius: 16, padding: 20, width: "100%", maxWidth: 320 },
    modalTitle: { fontSize: 18, fontWeight: "600", color: colors.textPrimary, marginBottom: 16, textAlign: "center" },
    optionItem: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 14, paddingHorizontal: 16, borderRadius: 8, marginBottom: 8, backgroundColor: colors.background },
    optionItemSelected: { backgroundColor: colors.greenGlow + "26", borderWidth: 1, borderColor: colors.greenGlow },
    optionText: { fontSize: 16, color: colors.textPrimary },
    optionTextSelected: { color: colors.greenGlow, fontWeight: "600" },
  });
}
