import { instance } from "./instance";

export interface CreateQuizParams {
    topic: string;
    difficulty: string;
}

export async function createQuiz({ topic, difficulty }: CreateQuizParams) {
    try {
        const response = await instance.post(
            "/quiz",
            { topic, difficulty }
        );
        return response.data.data;
    } catch (error) {
        console.log("createQuiz error:", error);
        throw error;
    }
}

export interface QuizHistoryItem {
    _id: string;
    topic: string;
    difficulty: string;
    createdAt: string;
    completedAt: string;
    questionCount: number;
    correctCount: number;
    totalScore: number;
    earnedScore: number;
    percentage: number;
}

export async function getQuizHistory(): Promise<QuizHistoryItem[]> {
    try {
        const response = await instance.get("/quiz/history");
        return response.data.data;
    } catch (error) {
        console.log("getQuizHistory error:", error);
        throw error;
    }
}

export interface QuizSubmitData {
    quizId: string;
    answers: Record<string, string>;
    correctCount: number;
    totalScore: number;
    earnedScore: number;
}

export async function submitQuizResult(data: QuizSubmitData) {
    try {
        const response = await instance.post("/quiz/submit", data);
        return response.data.data;
    } catch (error) {
        console.log("submitQuizResult error:", error);
        throw error;
    }
}

export interface QuizQuestion {
    _id: string;
    question: string;
    options: string[];
    correct_answer: string;
    score: number;
}

export interface QuizDetail {
    _id: string;
    topic: string;
    difficulty: string;
    questions: QuizQuestion[];
    isCompleted: boolean;
    answers: Record<string, string>;
    correctCount: number;
    totalScore: number;
    earnedScore: number;
    createdAt: string;
    completedAt: string;
}

export async function getQuizById(id: string): Promise<QuizDetail> {
    try {
        const response = await instance.get(`/quiz/${id}`);
        return response.data.data;
    } catch (error) {
        console.log("getQuizById error:", error);
        throw error;
    }
}

export interface StreakData {
    streak: number;
    hasCompletedToday: boolean;
    todayAverageScore: number;
    todayQuizCount: number;
    lastCompletedDate?: string;
}

export async function getStreak(): Promise<StreakData> {
    try {
        const response = await instance.get("/quiz/streak");
        return response.data.data;
    } catch (error) {
        console.log("getStreak error:", error);
        throw error;
    }
}

export interface MasteryData {
    topic: string;
    averageScore: number;
    difficulty: 'easy' | 'medium' | 'hard';
    quizCount: number;
}

export async function getMastery(): Promise<MasteryData | null> {
    try {
        const response = await instance.get("/quiz/mastery");
        return response.data.data;
    } catch (error) {
        console.log("getMastery error:", error);
        throw error;
    }
}

export interface ProfileStats {
    totalCompletions: number;
    averageMastery: number;
    topicsStudied: number;
    currentStreak: number;
}

export async function getProfileStats(): Promise<ProfileStats> {
    try {
        const response = await instance.get("/quiz/profile-stats");
        return response.data.data;
    } catch (error) {
        console.log("getProfileStats error:", error);
        throw error;
    }
}