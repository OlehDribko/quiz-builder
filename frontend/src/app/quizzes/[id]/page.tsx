import type { Metadata } from "next";

import QuizDetails from "@/components/quiz/QuizDetails";

export const metadata: Metadata = {
  title: "Quiz Details",
};

// Matches the backend: positive integers within the PostgreSQL INTEGER range.
const MAX_QUIZ_ID = 2_147_483_647;

function parseQuizId(value: string): number | null {
  if (!/^\d+$/.test(value)) {
    return null;
  }
  const id = Number(value);
  return id >= 1 && id <= MAX_QUIZ_ID ? id : null;
}

export default async function QuizDetailsPage({ params }: PageProps<"/quizzes/[id]">) {
  const { id } = await params;
  const quizId = parseQuizId(id);

  // key resets local state when navigating between quizzes.
  return <QuizDetails key={id} quizId={quizId} />;
}
