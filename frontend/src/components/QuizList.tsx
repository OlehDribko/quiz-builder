"use client";

import Link from "next/link";
import { useEffect } from "react";
import { toast } from "react-toastify";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { requestQuizDeletion } from "@/store/quizDeletion";
import { fetchQuizzes } from "@/store/quizzesSlice";
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
  const { items, status, error } = useAppSelector((state) => state.quizzes);

  useEffect(() => {
    if (status === "idle") {
      void dispatch(fetchQuizzes());
    }
  }, [status, dispatch]);

  // No confirmation dialog: the quiz is hidden immediately and an Undo toast offers recovery.
  const handleDelete = (quiz: QuizListItem) => {
    dispatch(requestQuizDeletion(quiz));
  };

  // The inline error panel covers the first failure; a toast confirms that a retry also failed.
  const handleRetry = () => {
    dispatch(fetchQuizzes())
      .unwrap()
      .catch(() => {
        toast.error("Still unable to load quizzes. Please try again later.", {
          toastId: "quizzes-retry-failed",
        });
      });
  };

  if (status === "idle" || status === "loading") {
    return <LoadingState />;
  }

  if (status === "failed") {
    return <ErrorState message={error ?? "Failed to load quizzes."} onRetry={handleRetry} />;
  }

  if (items.length === 0) {
    return <EmptyState />;
  }

  return (
    <ul className={gridClassName}>
      {items.map((quiz) => (
        <QuizCard key={quiz.id} quiz={quiz} onDelete={handleDelete} />
      ))}
    </ul>
  );
}
