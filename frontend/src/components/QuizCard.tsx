import Link from "next/link";

import type { QuizListItem } from "@/types/quiz";

interface QuizCardProps {
  quiz: QuizListItem;
  isDeleting: boolean;
  onDelete: (quiz: QuizListItem) => void;
}

function formatQuestionCount(count: number): string {
  return `${count} ${count === 1 ? "question" : "questions"}`;
}

export default function QuizCard({ quiz, isDeleting, onDelete }: QuizCardProps) {
  return (
    <li
      className={`flex flex-col rounded-lg border border-zinc-200 bg-white shadow-sm transition hover:border-zinc-300 hover:shadow ${
        isDeleting ? "opacity-60" : ""
      }`}
    >
      <Link
        href={`/quizzes/${quiz.id}`}
        className="group flex flex-1 flex-col gap-1 rounded-t-lg p-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900"
      >
        <h2 className="text-base font-semibold break-words text-zinc-900 group-hover:underline">
          {quiz.title}
        </h2>
        <p className="text-sm text-zinc-600">{formatQuestionCount(quiz.questionCount)}</p>
        <span className="mt-2 text-sm font-medium text-zinc-900" aria-hidden="true">
          View quiz →
        </span>
      </Link>
      <div className="flex justify-end border-t border-zinc-100 px-4 py-2">
        <button
          type="button"
          onClick={() => onDelete(quiz)}
          disabled={isDeleting}
          aria-label={isDeleting ? `Deleting quiz "${quiz.title}"` : `Delete quiz "${quiz.title}"`}
          className="rounded-md px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700 disabled:cursor-not-allowed disabled:text-zinc-500 disabled:hover:bg-transparent"
        >
          {isDeleting ? "Deleting…" : "Delete"}
        </button>
      </div>
    </li>
  );
}
