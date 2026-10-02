import Link from "next/link";

import { formatQuestionCount } from "@/lib/format";
import type { QuizListItem } from "@/types/quiz";

interface QuizCardProps {
  quiz: QuizListItem;
  onDelete: (quiz: QuizListItem) => void;
}

export default function QuizCard({ quiz, onDelete }: QuizCardProps) {
  return (
    <li className="flex flex-col rounded-lg border border-zinc-200 bg-white shadow-sm transition hover:border-zinc-300 hover:shadow">
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
          onClick={(event) => {
            // Removing a card shifts the next card under the cursor; ignore the rest of a double click
            // so it cannot delete a second quiz. Keyboard activation reports detail 0.
            if (event.detail > 1) {
              return;
            }
            onDelete(quiz);
          }}
          aria-label={`Delete quiz "${quiz.title}"`}
          className="rounded-md px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700"
        >
          Delete
        </button>
      </div>
    </li>
  );
}
