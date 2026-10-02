"use client";

import Link from "next/link";
import { useEffect } from "react";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { clearDeleteError, deleteQuiz, fetchQuizzes } from "@/store/quizzesSlice";
import type { QuizListItem } from "@/types/quiz";

import QuizCard from "./QuizCard";

const gridClassName = "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3";

function LoadingState() {
  return (
    <div role="status" aria-live="polite">
      <span className="sr-only">Loading quizzes…</span>
      <ul className={gridClassName} aria-hidden="true">
        {[0, 1, 2].map((key) => (
          <li
            key={key}
            className="h-32 animate-pulse rounded-lg border border-zinc-200 bg-zinc-100"
          />
        ))}
      </ul>
    </div>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-4 sm:p-6">
      <p className="font-medium text-red-800">Could not load quizzes</p>
      <p className="mt-1 text-sm text-red-700">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-4 rounded-md bg-red-700 px-4 py-2 text-sm font-medium text-white hover:bg-red-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700"
      >
        Try again
      </button>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-lg border border-dashed border-zinc-300 p-8 text-center sm:p-12">
      <p className="text-lg font-semibold text-zinc-900">No quizzes yet</p>
      <p className="mt-1 text-sm text-zinc-600">Create your first quiz to see it here.</p>
      <Link
        href="/create"
        className="mt-4 inline-block rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900"
      >
        Create Quiz
      </Link>
    </div>
  );
}

export default function QuizList() {
  const dispatch = useAppDispatch();
  const { items, status, error, deletingIds, deleteError } = useAppSelector(
    (state) => state.quizzes,
  );

  useEffect(() => {
    if (status === "idle") {
      void dispatch(fetchQuizzes());
    }
  }, [status, dispatch]);

  const handleDelete = (quiz: QuizListItem) => {
    if (window.confirm(`Delete "${quiz.title}"? This cannot be undone.`)) {
      void dispatch(deleteQuiz(quiz.id));
    }
  };

  if (status === "idle" || status === "loading") {
    return <LoadingState />;
  }

  if (status === "failed") {
    return (
      <ErrorState
        message={error ?? "Failed to load quizzes."}
        onRetry={() => void dispatch(fetchQuizzes())}
      />
    );
  }

  if (items.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="space-y-4">
      {deleteError && (
        <div
          role="alert"
          className="flex items-start justify-between gap-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
        >
          <p>{deleteError}</p>
          <button
            type="button"
            onClick={() => dispatch(clearDeleteError())}
            aria-label="Dismiss error"
            className="shrink-0 rounded font-medium hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700"
          >
            Dismiss
          </button>
        </div>
      )}
      <ul className={gridClassName}>
        {items.map((quiz) => (
          <QuizCard
            key={quiz.id}
            quiz={quiz}
            isDeleting={deletingIds.includes(quiz.id)}
            onDelete={handleDelete}
          />
        ))}
      </ul>
    </div>
  );
}
