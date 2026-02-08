import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Alert,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedProps,
  withTiming,
  withSpring,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import type { ThemeColors } from '@/constants/colors';
import { useTheme } from '@/contexts/ThemeContext';
import { useSocket } from '@/contexts/SocketContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const TIMER_SIZE = 60;
const TIMER_STROKE = 4;
const TIMER_RADIUS = (TIMER_SIZE - TIMER_STROKE) / 2;
const TIMER_CIRCUMFERENCE = TIMER_RADIUS * 2 * Math.PI;

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface Question {
  gameId: string;
  questionIndex: number;
  round: number;
  questionInRound: number;
  totalRounds: number;
  question: string;
  options: string[];
  timeLimit: number;
  hostScore: number;
  guestScore: number;
}

interface AnswerResult {
  correctAnswer: string;
  hostAnswer: string;
  hostCorrect: boolean;
  hostScore: number;
  guestAnswer: string;
  guestCorrect: boolean;
  guestScore: number;
}

export default function GamePlayScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const router = useRouter();
  const params = useLocalSearchParams<{ gameId: string; isHost?: string }>();
  const gameId = params.gameId;
  const isHost = params.isHost === 'true';

  const {
    submitAnswer,
    leaveGame,
    onQuestion,
    offQuestion,
    onOpponentAnswered,
    offOpponentAnswered,
    onAnswerResult,
    offAnswerResult,
    onGameFinished,
    offGameFinished,
    onTimeout,
    offTimeout,
  } = useSocket();

  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [opponentAnswered, setOpponentAnswered] = useState(false);
  const [showingResult, setShowingResult] = useState(false);
  const [answerResult, setAnswerResult] = useState<AnswerResult | null>(null);
  const [timeLeft, setTimeLeft] = useState(20);
  const [hostScore, setHostScore] = useState(0);
  const [guestScore, setGuestScore] = useState(0);
  const [countdown, setCountdown] = useState<number | null>(3);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timerProgress = useSharedValue(0);

  // Start countdown animation
  useEffect(() => {
    if (countdown === null) return;
    
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setCountdown(null);
    }
  }, [countdown]);

  // Handle incoming questions
  useEffect(() => {
    const handleQuestion = (data: Question) => {
      console.log('[play] Question received:', data);
      setCurrentQuestion(data);
      setSelectedAnswer(null);
      setOpponentAnswered(false);
      setShowingResult(false);
      setAnswerResult(null);
      setTimeLeft(data.timeLimit / 1000);
      setHostScore(data.hostScore);
      setGuestScore(data.guestScore);
      // Start timer animation
      timerProgress.value = 0;
      timerProgress.value = withTiming(1, {
        duration: data.timeLimit,
        easing: Easing.linear,
      });

      // Start countdown timer
      if (timerRef.current) clearInterval(timerRef.current);
      let remaining = data.timeLimit / 1000;
      timerRef.current = setInterval(() => {
        remaining -= 1;
        if (remaining <= 0) {
          if (timerRef.current) clearInterval(timerRef.current);
          setTimeLeft(0);
        } else {
          setTimeLeft(remaining);
        }
      }, 1000);
    };

    onQuestion(handleQuestion);
    return () => offQuestion(handleQuestion);
  }, [onQuestion, offQuestion, timerProgress]);

  // Handle opponent answered
  useEffect(() => {
    const handleOpponentAnswered = () => {
      setOpponentAnswered(true);
    };

    onOpponentAnswered(handleOpponentAnswered);
    return () => offOpponentAnswered(handleOpponentAnswered);
  }, [onOpponentAnswered, offOpponentAnswered]);

  // Handle answer results
  useEffect(() => {
    const handleAnswerResult = (data: AnswerResult & { gameId: string; questionIndex: number }) => {
      console.log('[play] Answer result:', data);
      if (timerRef.current) clearInterval(timerRef.current);
      setAnswerResult(data);
      setShowingResult(true);
      setHostScore(data.hostScore);
      setGuestScore(data.guestScore);
    };

    onAnswerResult(handleAnswerResult);
    return () => offAnswerResult(handleAnswerResult);
  }, [onAnswerResult, offAnswerResult]);

  // Handle timeout
  useEffect(() => {
    const handleTimeout = (data: { correctAnswer: string }) => {
      if (timerRef.current) clearInterval(timerRef.current);
      setShowingResult(true);
    };

    onTimeout(handleTimeout);
    return () => offTimeout(handleTimeout);
  }, [onTimeout, offTimeout]);

  // Handle game finished
  useEffect(() => {
    const handleGameFinished = (data: {
      gameId: string;
      winnerId: string | null;
      hostScore: number;
      guestScore: number;
    }) => {
      console.log('[play] Game finished:', data);
      if (timerRef.current) clearInterval(timerRef.current);
      
      // Navigate to results after a short delay
      setTimeout(() => {
        router.replace({
          pathname: '/(protected)/game/results',
          params: { gameId: data.gameId },
        });
      }, 2000);
    };

    onGameFinished(handleGameFinished);
    return () => offGameFinished(handleGameFinished);
  }, [onGameFinished, offGameFinished, router]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const handleSelectAnswer = (answer: string) => {
    if (selectedAnswer || showingResult) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedAnswer(answer);
    submitAnswer(gameId, answer);
  };

  const handleLeaveGame = () => {
    Alert.alert(
      'Leave Game',
      'Are you sure you want to forfeit this game?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Forfeit',
          style: 'destructive',
          onPress: () => {
            if (timerRef.current) clearInterval(timerRef.current);
            leaveGame(gameId);
            router.replace('/(protected)/(tabs)/home');
          },
        },
      ]
    );
  };

  const timerAnimatedProps = useAnimatedProps(() => ({
    strokeDashoffset: TIMER_CIRCUMFERENCE * timerProgress.value,
  }));

  const getOptionStyle = (option: string) => {
    if (!showingResult) {
      if (selectedAnswer === option) {
        return [styles.optionButton, styles.optionSelected];
      }
      return styles.optionButton;
    }

    // Show results
    if (answerResult?.correctAnswer === option) {
      return [styles.optionButton, styles.optionCorrect];
    }
    if (selectedAnswer === option && answerResult?.correctAnswer !== option) {
      return [styles.optionButton, styles.optionIncorrect];
    }
    return [styles.optionButton, styles.optionDisabled];
  };

  // Show countdown
  if (countdown !== null) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <StatusBar barStyle="light-content" />
        <View style={styles.countdownContainer}>
          <Text style={styles.countdownText}>
            {countdown === 0 ? 'GO!' : countdown}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Show loading if no question yet
  if (!currentQuestion) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <StatusBar barStyle="light-content" />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading question...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleLeaveGame}>
          <Ionicons name="close" size={24} color={colors.offWhite} />
        </TouchableOpacity>

        <View style={styles.progressContainer}>
          <Text style={styles.roundText}>
            Round {currentQuestion.round}/{currentQuestion.totalRounds}
          </Text>
          <Text style={styles.questionText}>
            Q{currentQuestion.questionInRound}/5
          </Text>
        </View>

        {/* Timer */}
        <View style={styles.timerContainer}>
          <Svg width={TIMER_SIZE} height={TIMER_SIZE}>
            <Circle
              cx={TIMER_SIZE / 2}
              cy={TIMER_SIZE / 2}
              r={TIMER_RADIUS}
              stroke={colors.darkGrey}
              strokeWidth={TIMER_STROKE}
              fill="transparent"
            />
            <AnimatedCircle
              cx={TIMER_SIZE / 2}
              cy={TIMER_SIZE / 2}
              r={TIMER_RADIUS}
              stroke={timeLeft <= 5 ? colors.error : colors.greenGlow}
              strokeWidth={TIMER_STROKE}
              fill="transparent"
              strokeDasharray={TIMER_CIRCUMFERENCE}
              animatedProps={timerAnimatedProps}
              strokeLinecap="round"
              rotation="-90"
              origin={`${TIMER_SIZE / 2}, ${TIMER_SIZE / 2}`}
            />
          </Svg>
          <Text style={[
            styles.timerText,
            timeLeft <= 5 && styles.timerTextWarning,
          ]}>
            {timeLeft}
          </Text>
        </View>
      </View>

      {/* Scores */}
      <View style={styles.scoresBar}>
        <View style={styles.scoreItem}>
          <Text style={styles.scoreLabel}>You</Text>
          <Text style={styles.scoreValue}>{isHost ? hostScore : guestScore}</Text>
        </View>
        <View style={styles.scoreDivider}>
          <Text style={styles.vs}>VS</Text>
        </View>
        <View style={styles.scoreItem}>
          <Text style={styles.scoreLabel}>Opponent</Text>
          <Text style={styles.scoreValue}>{isHost ? guestScore : hostScore}</Text>
          {opponentAnswered && !showingResult && (
            <View style={styles.answeredBadge}>
              <Ionicons name="checkmark" size={12} color={colors.greenGlow} />
            </View>
          )}
        </View>
      </View>

      {/* Question */}
      <View style={styles.questionContainer}>
        <Text style={styles.questionTitle}>{currentQuestion.question}</Text>
      </View>

      {/* Options */}
      <View style={styles.optionsContainer}>
        {currentQuestion.options.map((option, index) => (
          <TouchableOpacity
            key={index}
            style={getOptionStyle(option)}
            onPress={() => handleSelectAnswer(option)}
            disabled={selectedAnswer !== null || showingResult}
          >
            <View style={styles.optionContent}>
              <Text style={styles.optionLetter}>
                {String.fromCharCode(65 + index)}
              </Text>
              <Text style={styles.optionText}>{option}</Text>
            </View>
            {showingResult && answerResult?.correctAnswer === option && (
              <Ionicons name="checkmark-circle" size={24} color={colors.success} />
            )}
            {showingResult && selectedAnswer === option && answerResult?.correctAnswer !== option && (
              <Ionicons name="close-circle" size={24} color={colors.error} />
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* Status */}
      {selectedAnswer && !showingResult && (
        <View style={styles.statusBar}>
          <Text style={styles.statusText}>
            {opponentAnswered ? 'Both answered! Calculating...' : 'Waiting for opponent...'}
          </Text>
        </View>
      )}

      {showingResult && answerResult && (
        <View style={styles.resultBar}>
          <Text style={styles.resultText}>
            {(isHost ? answerResult.hostCorrect : answerResult.guestCorrect)
              ? '✓ Correct!'
              : selectedAnswer
                ? '✗ Incorrect'
                : '⏱ Out of time'}
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}

function makeStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loadingText: { fontSize: 18, color: colors.sage },
    countdownContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    countdownText: { fontSize: 120, fontWeight: '700', color: colors.greenGlow },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12 },
    progressContainer: { alignItems: 'center' },
    roundText: { fontSize: 12, fontWeight: '600', color: colors.sage, letterSpacing: 1 },
    questionText: { fontSize: 16, fontWeight: '700', color: colors.textPrimary },
    timerContainer: { width: TIMER_SIZE, height: TIMER_SIZE, justifyContent: 'center', alignItems: 'center' },
    timerText: { position: 'absolute', fontSize: 18, fontWeight: '700', color: colors.textPrimary },
    timerTextWarning: { color: colors.error },
    scoresBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, paddingHorizontal: 24, backgroundColor: colors.darkGrey, marginHorizontal: 16, borderRadius: 12, marginBottom: 20 },
    scoreItem: { flex: 1, alignItems: 'center', position: 'relative' },
    scoreLabel: { fontSize: 12, color: colors.sage, marginBottom: 4 },
    scoreValue: { fontSize: 28, fontWeight: '700', color: colors.textPrimary },
    scoreDivider: { paddingHorizontal: 20 },
    vs: { fontSize: 14, fontWeight: '600', color: colors.sage },
    answeredBadge: { position: 'absolute', top: 0, right: 20, backgroundColor: colors.greenGlow + '30', borderRadius: 10, padding: 4 },
    questionContainer: { paddingHorizontal: 20, marginBottom: 24 },
    questionTitle: { fontSize: 22, fontWeight: '600', color: colors.textPrimary, lineHeight: 32, textAlign: 'center' },
    optionsContainer: { flex: 1, paddingHorizontal: 16, gap: 12 },
    optionButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.darkGrey, borderRadius: 12, padding: 16, borderWidth: 2, borderColor: 'transparent' },
    optionSelected: { borderColor: colors.greenGlow, backgroundColor: colors.greenGlow + '20' },
    optionCorrect: { borderColor: colors.success, backgroundColor: colors.success + '20' },
    optionIncorrect: { borderColor: colors.error, backgroundColor: colors.error + '20' },
    optionDisabled: { opacity: 0.5 },
    optionContent: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 },
    optionLetter: { width: 28, height: 28, borderRadius: 14, backgroundColor: colors.background, textAlign: 'center', lineHeight: 28, fontSize: 14, fontWeight: '600', color: colors.textPrimary },
    optionText: { flex: 1, fontSize: 16, color: colors.textPrimary },
    statusBar: { padding: 16, alignItems: 'center' },
    statusText: { fontSize: 14, color: colors.sage },
    resultBar: { padding: 16, alignItems: 'center', backgroundColor: colors.darkGrey, marginHorizontal: 16, marginBottom: 16, borderRadius: 12 },
    resultText: { fontSize: 18, fontWeight: '600', color: colors.textPrimary },
  });
}
