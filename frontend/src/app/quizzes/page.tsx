import type { Metadata } from "next";
import Link from "next/link";

import QuizList from "@/components/QuizList";

export const metadata: Metadata = {
  title: "Quizzes",
};

export default function QuizzesPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Quizzes</h1>
          <p className="text-zinc-600">Browse your quizzes or create a new one.</p>
        </div>
        <Link
          href="/create"
          className="inline-flex justify-center rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900"
        >
          Create Quiz
        </Link>
      </div>
      <QuizList />
    </div>
  );
}
