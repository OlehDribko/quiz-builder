import type { Metadata } from "next";

import QuizForm from "@/components/quiz/QuizForm";

export const metadata: Metadata = {
  title: "Create Quiz",
};

export default function CreateQuizPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Create Quiz</h1>
        <p className="text-zinc-600">Add a title and at least one question.</p>
      </div>
      <QuizForm />
    </div>
  );
}
