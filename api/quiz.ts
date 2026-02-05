import { instance } from "./instance";

export async function createQuiz(topic: string, difficulty: string) {
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