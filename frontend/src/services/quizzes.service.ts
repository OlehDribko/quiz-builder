import { api } from "@/lib/api";
import type { CreateQuizPayload, Quiz, QuizListItem } from "@/types/quiz";

export async function getQuizzes(): Promise<QuizListItem[]> {
  const { data } = await api.get<QuizListItem[]>("/quizzes");
  return data;
}

export async function getQuizById(id: number): Promise<Quiz> {
  const { data } = await api.get<Quiz>(`/quizzes/${id}`);
  return data;
}

export async function createQuiz(payload: CreateQuizPayload): Promise<Quiz> {
  const { data } = await api.post<Quiz>("/quizzes", payload);
  return data;
}

export async function deleteQuiz(id: number): Promise<void> {
  await api.delete(`/quizzes/${id}`);
}
