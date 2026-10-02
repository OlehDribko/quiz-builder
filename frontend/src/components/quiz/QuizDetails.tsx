"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { toast } from "react-toastify";

import { getApiErrorMessage, isNotFoundError } from "@/lib/api-error";
import { formatDate, formatQuestionCount } from "@/lib/format";
import { getQuizById } from "@/services/quizzes.service";
import type { Quiz } from "@/types/quiz";

import QuestionView from "./QuestionView";

type DetailsState =
  | { status: "loading" }
  | { status: "succeeded"; quiz: Quiz }
  | { status: "notFound" }
  | { status: "failed"; error: string };

const linkButtonClassName =
  "mt-4 inline-block rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900";

function MessagePanel({
  title,
  children,
  tone = "neutral",
}: {
  title: string;
  children: ReactNode;
  tone?: "neutral" | "error";
}) {
  const toneClassName =
    tone === "error"
      ? "border-red-200 bg-red-50 text-red-800"
      : "border-dashed border-zinc-300 text-zinc-900";

  return (
    <div role="alert" className={`rounded-lg border p-6 text-center sm:p-10 ${toneClassName}`}>
      <h1 className="text-lg font-semibold">{title}</h1>
      {children}
    </div>
  );
}

function BackToQuizzesButton() {
  return (
    <Link href="/quizzes" className={linkButtonClassName}>
      Back to quizzes
    </Link>
  );
}

function LoadingState() {
  return (
    <div role="status" aria-live="polite" className="space-y-4">
      <span className="sr-only">Loading quiz…</span>
      <div aria-hidden="true" className="space-y-2">
        <div className="h-8 w-2/3 animate-pulse rounded bg-zinc-200" />
        <div className="h-4 w-1/3 animate-pulse rounded bg-zinc-100" />
      </div>
      {[0, 1, 2].map((key) => (
        <div
          key={key}
          aria-hidden="true"
          className="h-32 animate-pulse rounded-lg border border-zinc-200 bg-zinc-100"
        />
      ))}
    </div>
  );
}

interface QuizDetailsProps {
  /** `null` when the route id is not a valid quiz id; no request is made in that case. */
  quizId: number | null;
}

export default function QuizDetails({ quizId }: QuizDetailsProps) {
  const [state, setState] = useState<DetailsState>({ status: "loading" });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (quizId === null) {
      return;
    }

    let ignore = false;

    getQuizById(quizId)
      .then((quiz) => {
        if (!ignore) setState({ status: "succeeded", quiz });
      })
      .catch((error: unknown) => {
        if (ignore) return;
        if (isNotFoundError(error)) {
          setState({ status: "notFound" });
          return;
        }
        setState({
          status: "failed",
          error: getApiErrorMessage(error, "Failed to load the quiz."),
        });
        // The inline panel covers the first failure; a toast confirms that a retry also failed.
        if (attempt > 0) {
          toast.error("Still unable to load the quiz. Please try again later.", {
            toastId: "quiz-details-retry-failed",
          });
        }
      });

    return () => {
      ignore = true;
    };
  }, [quizId, attempt]);

  const retry = () => {
    setState({ status: "loading" });
    setAttempt((value) => value + 1);
  };

  const content = (() => {
    if (quizId === null) {
      return (
        <MessagePanel title="Invalid quiz link">
          <p className="mt-1 text-sm text-zinc-600">
            The quiz id in this address is not valid. Quiz ids are positive whole numbers.
          </p>
          <BackToQuizzesButton />
        </MessagePanel>
      );
    }

    switch (state.status) {
      case "loading":
        return <LoadingState />;
      case "notFound":
        return (
          <MessagePanel title="Quiz not found">
            <p className="mt-1 text-sm text-zinc-600">
              This quiz does not exist or may have been deleted.
            </p>
            <BackToQuizzesButton />
          </MessagePanel>
        );
      case "failed":
        return (
          <MessagePanel title="Could not load quiz" tone="error">
            <p className="mt-1 text-sm text-red-700">{state.error}</p>
            <button
              type="button"
              onClick={retry}
              className="mt-4 rounded-md bg-red-700 px-4 py-2 text-sm font-medium text-white hover:bg-red-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700"
            >
              Try again
            </button>
          </MessagePanel>
        );
      case "succeeded": {
        const { quiz } = state;
        return (
          <div className="space-y-6">
            <div className="space-y-1">
              <h1 className="text-2xl font-semibold tracking-tight break-words sm:text-3xl">
                {quiz.title}
              </h1>
              <p className="text-sm text-zinc-600">
                {formatQuestionCount(quiz.questions.length)}
                <span aria-hidden="true"> · </span>
                <span className="sr-only">, </span>
                Created <time dateTime={quiz.createdAt}>{formatDate(quiz.createdAt)}</time>
              </p>
            </div>
            <ol className="space-y-4" aria-label="Questions">
              {quiz.questions.map((question, index) => (
                <QuestionView key={question.id} question={question} number={index + 1} />
              ))}
            </ol>
          </div>
        );
      }
    }
  })();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link
        href="/quizzes"
        className="inline-flex items-center gap-1 rounded-md text-sm font-medium text-zinc-600 hover:text-zinc-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900"
      >
        <span aria-hidden="true">←</span> Back to quizzes
      </Link>
      {content}
    </div>
  );
}
