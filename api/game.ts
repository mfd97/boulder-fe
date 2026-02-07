import { instance } from './instance';

export interface GameInvitation {
  gameId: string;
  hostId: {
    _id: string;
    fullName: string;
    email: string;
  };
  topic: string;
  difficulty: string;
  rounds: number;
  createdAt: string;
  expiresAt: string;
}

export interface ActiveGame {
  gameId: string;
  hostId: {
    _id: string;
    fullName: string;
    email: string;
  };
  guestId: {
    _id: string;
    fullName: string;
    email: string;
  };
  topic: string;
  difficulty: string;
  rounds: number;
  status: 'waiting' | 'in_progress' | 'completed' | 'cancelled';
  currentQuestionIndex: number;
  currentRound: number;
  hostScore: number;
  guestScore: number;
  totalQuestions: number;
  createdAt: string;
  startedAt: string | null;
}

export interface GameHistoryItem {
  gameId: string;
  topic: string;
  difficulty: string;
  rounds: number;
  myScore: number;
  opponentScore: number;
  opponent: {
    _id: string;
    fullName: string;
    email: string;
  };
  result: 'won' | 'lost' | 'draw';
  completedAt: string;
}

export interface GameDetails {
  gameId: string;
  hostId: {
    _id: string;
    fullName: string;
    email: string;
  };
  guestId: {
    _id: string;
    fullName: string;
    email: string;
  };
  topic: string;
  difficulty: string;
  rounds: number;
  status: string;
  hostScore: number;
  guestScore: number;
  winnerId: {
    _id: string;
    fullName: string;
    email: string;
  } | null;
  totalQuestions: number;
  createdAt: string;
  startedAt: string | null;
  completedAt: string | null;
}

// Get pending game invitations
export const getPendingInvitations = async (): Promise<GameInvitation[]> => {
  const response = await instance.get('/game/invitations');
  return response.data.data;
};

// Get count of pending game invitations
export const getGameInvitationCount = async (): Promise<number> => {
  const response = await instance.get('/game/invitations/count');
  return response.data.data;
};

// Get active game (if any)
export const getActiveGame = async (): Promise<ActiveGame | null> => {
  const response = await instance.get('/game/active');
  return response.data.data;
};

// Get game history
export const getGameHistory = async (): Promise<GameHistoryItem[]> => {
  const response = await instance.get('/game/history');
  return response.data.data;
};

// Get game by ID
export const getGameById = async (gameId: string): Promise<GameDetails> => {
  const response = await instance.get(`/game/${gameId}`);
  return response.data.data;
};
