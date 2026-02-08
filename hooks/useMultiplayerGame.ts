import { useState, useEffect, useCallback, useRef } from 'react';
import { useSocket } from '@/contexts/SocketContext';

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
  gameId: string;
  questionIndex: number;
  correctAnswer: string;
  hostAnswer: string;
  hostCorrect: boolean;
  hostScore: number;
  guestAnswer: string;
  guestCorrect: boolean;
  guestScore: number;
}

interface GameFinished {
  gameId: string;
  winnerId: string | null;
  winnerName: string | null;
  isDraw: boolean;
  hostId: string;
  hostName: string;
  hostScore: number;
  guestId: string;
  guestName: string;
  guestScore: number;
  totalQuestions: number;
  forfeit?: boolean;
  forfeitedBy?: string;
}

interface GameState {
  status: 'countdown' | 'playing' | 'waiting' | 'result' | 'finished';
  currentQuestion: Question | null;
  selectedAnswer: string | null;
  opponentAnswered: boolean;
  answerResult: AnswerResult | null;
  gameResult: GameFinished | null;
  hostScore: number;
  guestScore: number;
  timeLeft: number;
  countdown: number | null;
}

export function useMultiplayerGame(gameId: string) {
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

  const [state, setState] = useState<GameState>({
    status: 'countdown',
    currentQuestion: null,
    selectedAnswer: null,
    opponentAnswered: false,
    answerResult: null,
    gameResult: null,
    hostScore: 0,
    guestScore: 0,
    timeLeft: 20,
    countdown: 3,
  });

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Countdown logic
  useEffect(() => {
    if (state.countdown === null) return;
    
    if (state.countdown > 0) {
      const timer = setTimeout(() => {
        setState(prev => ({ ...prev, countdown: prev.countdown! - 1 }));
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setState(prev => ({ ...prev, countdown: null, status: 'playing' }));
    }
  }, [state.countdown]);

  // Handle incoming questions
  useEffect(() => {
    const handleQuestion = (data: Question) => {
      console.log('[useMultiplayerGame] Question received:', data);
      
      // Clear existing timer
      if (timerRef.current) clearInterval(timerRef.current);
      
      setState(prev => ({
        ...prev,
        status: 'playing',
        currentQuestion: data,
        selectedAnswer: null,
        opponentAnswered: false,
        answerResult: null,
        hostScore: data.hostScore,
        guestScore: data.guestScore,
        timeLeft: data.timeLimit / 1000,
      }));

      // Start countdown timer
      let remaining = data.timeLimit / 1000;
      timerRef.current = setInterval(() => {
        remaining -= 1;
        if (remaining <= 0) {
          if (timerRef.current) clearInterval(timerRef.current);
          setState(prev => ({ ...prev, timeLeft: 0 }));
        } else {
          setState(prev => ({ ...prev, timeLeft: remaining }));
        }
      }, 1000);
    };

    onQuestion(handleQuestion);
    return () => offQuestion(handleQuestion);
  }, [onQuestion, offQuestion]);

  // Handle opponent answered
  useEffect(() => {
    const handleOpponentAnswered = () => {
      setState(prev => ({ ...prev, opponentAnswered: true }));
    };

    onOpponentAnswered(handleOpponentAnswered);
    return () => offOpponentAnswered(handleOpponentAnswered);
  }, [onOpponentAnswered, offOpponentAnswered]);

  // Handle answer results
  useEffect(() => {
    const handleAnswerResult = (data: AnswerResult) => {
      console.log('[useMultiplayerGame] Answer result:', data);
      if (timerRef.current) clearInterval(timerRef.current);
      
      setState(prev => ({
        ...prev,
        status: 'result',
        answerResult: data,
        hostScore: data.hostScore,
        guestScore: data.guestScore,
      }));
    };

    onAnswerResult(handleAnswerResult);
    return () => offAnswerResult(handleAnswerResult);
  }, [onAnswerResult, offAnswerResult]);

  // Handle timeout
  useEffect(() => {
    const handleTimeout = () => {
      if (timerRef.current) clearInterval(timerRef.current);
      setState(prev => ({ ...prev, status: 'result' }));
    };

    onTimeout(handleTimeout);
    return () => offTimeout(handleTimeout);
  }, [onTimeout, offTimeout]);

  // Handle game finished
  useEffect(() => {
    const handleGameFinished = (data: GameFinished) => {
      console.log('[useMultiplayerGame] Game finished:', data);
      if (timerRef.current) clearInterval(timerRef.current);
      
      setState(prev => ({
        ...prev,
        status: 'finished',
        gameResult: data,
        hostScore: data.hostScore,
        guestScore: data.guestScore,
      }));
    };

    onGameFinished(handleGameFinished);
    return () => offGameFinished(handleGameFinished);
  }, [onGameFinished, offGameFinished]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const selectAnswer = useCallback((answer: string) => {
    if (state.selectedAnswer || state.status !== 'playing') return;
    
    setState(prev => ({ ...prev, selectedAnswer: answer, status: 'waiting' }));
    submitAnswer(gameId, answer);
  }, [state.selectedAnswer, state.status, gameId, submitAnswer]);

  const forfeitGame = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    leaveGame(gameId);
  }, [gameId, leaveGame]);

  return {
    ...state,
    selectAnswer,
    forfeitGame,
  };
}
