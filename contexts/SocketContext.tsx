import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';

// Dynamic base URL detection for development
const getSocketUrl = (): string => {
  if (__DEV__) {
    const hostUri = Constants.expoConfig?.hostUri;
    if (hostUri) {
      const host = hostUri.split(':')[0];
      return `http://${host}:8000`;
    }
    return 'http://localhost:8000';
  }
  return 'https://your-api.com';
};

interface GameInvitation {
  gameId: string;
  hostId: string;
  hostName: string;
  topic: string;
  difficulty: string;
  rounds: number;
}

interface GameQuestion {
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

interface GameStarted {
  gameId: string;
  topic: string;
  difficulty: string;
  rounds: number;
  totalQuestions: number;
  hostName: string;
  guestName: string;
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

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
  // Game events
  onInvitation: (callback: (data: GameInvitation) => void) => void;
  offInvitation: (callback: (data: GameInvitation) => void) => void;
  onGameStarted: (callback: (data: GameStarted) => void) => void;
  offGameStarted: (callback: (data: GameStarted) => void) => void;
  onQuestion: (callback: (data: GameQuestion) => void) => void;
  offQuestion: (callback: (data: GameQuestion) => void) => void;
  onOpponentAnswered: (callback: (data: { gameId: string; questionIndex: number }) => void) => void;
  offOpponentAnswered: (callback: (data: { gameId: string; questionIndex: number }) => void) => void;
  onAnswerResult: (callback: (data: AnswerResult) => void) => void;
  offAnswerResult: (callback: (data: AnswerResult) => void) => void;
  onGameFinished: (callback: (data: GameFinished) => void) => void;
  offGameFinished: (callback: (data: GameFinished) => void) => void;
  onTimeout: (callback: (data: { gameId: string; questionIndex: number; correctAnswer: string }) => void) => void;
  offTimeout: (callback: (data: { gameId: string; questionIndex: number; correctAnswer: string }) => void) => void;
  onDeclined: (callback: (data: { gameId: string }) => void) => void;
  offDeclined: (callback: (data: { gameId: string }) => void) => void;
  onCancelled: (callback: (data: { gameId: string }) => void) => void;
  offCancelled: (callback: (data: { gameId: string }) => void) => void;
  onError: (callback: (data: { message: string }) => void) => void;
  offError: (callback: (data: { message: string }) => void) => void;
  // Game actions
  createGame: (data: { topic: string; difficulty: string; rounds: number; guestId: string }) => void;
  acceptGame: (gameId: string) => void;
  declineGame: (gameId: string) => void;
  submitAnswer: (gameId: string, answer: string) => void;
  leaveGame: (gameId: string) => void;
}

const SocketContext = createContext<SocketContextType | null>(null);

export function SocketProvider({ children }: { children: ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const connect = useCallback(async () => {
    const token = await SecureStore.getItemAsync('token');
    if (!token) {
      console.log('[socket] No token, cannot connect');
      return;
    }

    const socketUrl = getSocketUrl();
    console.log('[socket] Connecting to:', socketUrl);

    const newSocket = io(socketUrl, {
      auth: { token },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    newSocket.on('connect', () => {
      console.log('[socket] Connected');
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('[socket] Disconnected');
      setIsConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('[socket] Connection error:', error.message);
      setIsConnected(false);
    });

    setSocket(newSocket);
  }, []);

  const disconnect = useCallback(() => {
    if (socket) {
      socket.disconnect();
      setSocket(null);
      setIsConnected(false);
    }
  }, [socket]);

  // Event listeners
  const onInvitation = useCallback((callback: (data: GameInvitation) => void) => {
    socket?.on('game:invitation', callback);
  }, [socket]);

  const offInvitation = useCallback((callback: (data: GameInvitation) => void) => {
    socket?.off('game:invitation', callback);
  }, [socket]);

  const onGameStarted = useCallback((callback: (data: GameStarted) => void) => {
    socket?.on('game:started', callback);
  }, [socket]);

  const offGameStarted = useCallback((callback: (data: GameStarted) => void) => {
    socket?.off('game:started', callback);
  }, [socket]);

  const onQuestion = useCallback((callback: (data: GameQuestion) => void) => {
    socket?.on('game:question', callback);
  }, [socket]);

  const offQuestion = useCallback((callback: (data: GameQuestion) => void) => {
    socket?.off('game:question', callback);
  }, [socket]);

  const onOpponentAnswered = useCallback((callback: (data: { gameId: string; questionIndex: number }) => void) => {
    socket?.on('game:opponent_answered', callback);
  }, [socket]);

  const offOpponentAnswered = useCallback((callback: (data: { gameId: string; questionIndex: number }) => void) => {
    socket?.off('game:opponent_answered', callback);
  }, [socket]);

  const onAnswerResult = useCallback((callback: (data: AnswerResult) => void) => {
    socket?.on('game:answer_result', callback);
  }, [socket]);

  const offAnswerResult = useCallback((callback: (data: AnswerResult) => void) => {
    socket?.off('game:answer_result', callback);
  }, [socket]);

  const onGameFinished = useCallback((callback: (data: GameFinished) => void) => {
    socket?.on('game:finished', callback);
  }, [socket]);

  const offGameFinished = useCallback((callback: (data: GameFinished) => void) => {
    socket?.off('game:finished', callback);
  }, [socket]);

  const onTimeout = useCallback((callback: (data: { gameId: string; questionIndex: number; correctAnswer: string }) => void) => {
    socket?.on('game:timeout', callback);
  }, [socket]);

  const offTimeout = useCallback((callback: (data: { gameId: string; questionIndex: number; correctAnswer: string }) => void) => {
    socket?.off('game:timeout', callback);
  }, [socket]);

  const onDeclined = useCallback((callback: (data: { gameId: string }) => void) => {
    socket?.on('game:declined', callback);
  }, [socket]);

  const offDeclined = useCallback((callback: (data: { gameId: string }) => void) => {
    socket?.off('game:declined', callback);
  }, [socket]);

  const onCancelled = useCallback((callback: (data: { gameId: string }) => void) => {
    socket?.on('game:cancelled', callback);
  }, [socket]);

  const offCancelled = useCallback((callback: (data: { gameId: string }) => void) => {
    socket?.off('game:cancelled', callback);
  }, [socket]);

  const onError = useCallback((callback: (data: { message: string }) => void) => {
    socket?.on('game:error', callback);
  }, [socket]);

  const offError = useCallback((callback: (data: { message: string }) => void) => {
    socket?.off('game:error', callback);
  }, [socket]);

  // Game actions
  const createGame = useCallback((data: { topic: string; difficulty: string; rounds: number; guestId: string }) => {
    socket?.emit('game:create', data);
  }, [socket]);

  const acceptGame = useCallback((gameId: string) => {
    socket?.emit('game:accept', { gameId });
  }, [socket]);

  const declineGame = useCallback((gameId: string) => {
    socket?.emit('game:decline', { gameId });
  }, [socket]);

  const submitAnswer = useCallback((gameId: string, answer: string) => {
    socket?.emit('game:answer', { gameId, answer });
  }, [socket]);

  const leaveGame = useCallback((gameId: string) => {
    socket?.emit('game:leave', { gameId });
  }, [socket]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [socket]);

  const value: SocketContextType = {
    socket,
    isConnected,
    connect,
    disconnect,
    onInvitation,
    offInvitation,
    onGameStarted,
    offGameStarted,
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
    onDeclined,
    offDeclined,
    onCancelled,
    offCancelled,
    onError,
    offError,
    createGame,
    acceptGame,
    declineGame,
    submitAnswer,
    leaveGame,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
}
