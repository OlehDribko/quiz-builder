import { toast, type Id } from "react-toastify";

import UndoDeleteToast, { type UndoDeleteToastData } from "@/components/UndoDeleteToast";
import { getApiErrorMessage, isNotFoundError } from "@/lib/api-error";
import * as quizzesService from "@/services/quizzes.service";
import type { QuizListItem } from "@/types/quiz";

import { quizDeletionCompleted, quizRemovedOptimistically, quizRestored } from "./quizzesSlice";
import type { AppDispatch, RootState } from "./store";

export const UNDO_WINDOW_MS = 5000;

interface PendingDeletion {
  quiz: QuizListItem;
  timer: ReturnType<typeof setTimeout>;
  toastId: Id;
}

// Kept outside React so pending deletions survive client-side navigation.
// Only populated from user actions, so it exists in the browser only (not shared on the server).
const pendingDeletions = new Map<number, PendingDeletion>();

function finalizeQuizDeletion(id: number) {
  return async (dispatch: AppDispatch): Promise<void> => {
    const pending = pendingDeletions.get(id);
    if (!pending) {
      return;
    }
    // Removing the entry first makes a late Undo click a no-op.
    pendingDeletions.delete(id);
    toast.dismiss(pending.toastId);

    try {
      await quizzesService.deleteQuiz(id);
    } catch (error) {
      // A 404 means the quiz is already gone, which is the outcome the user asked for.
      if (!isNotFoundError(error)) {
        dispatch(quizRestored(pending.quiz));
        toast.error(
          `Could not delete “${pending.quiz.title}”. ${getApiErrorMessage(error, "Please try again.")}`,
        );
        return;
      }
    }

    dispatch(quizDeletionCompleted(id));
    toast.success(`Quiz “${pending.quiz.title}” deleted permanently.`, { autoClose: 3000 });
  };
}

export function undoQuizDeletion(id: number) {
  return (dispatch: AppDispatch): void => {
    const pending = pendingDeletions.get(id);
    if (!pending) {
      return;
    }
    clearTimeout(pending.timer);
    pendingDeletions.delete(id);
    toast.dismiss(pending.toastId);
    dispatch(quizRestored(pending.quiz));
    toast.info(`Quiz “${pending.quiz.title}” restored.`, { autoClose: 2500 });
  };
}

/**
 * Hides the quiz immediately and only sends DELETE after the undo window passes.
 */
export function requestQuizDeletion(quiz: QuizListItem) {
  return (dispatch: AppDispatch, getState: () => RootState): void => {
    if (pendingDeletions.has(quiz.id)) {
      return;
    }
    if (!getState().quizzes.items.some((item) => item.id === quiz.id)) {
      return;
    }

    dispatch(quizRemovedOptimistically(quiz.id));

    const toastId = toast<UndoDeleteToastData>(UndoDeleteToast, {
      data: { title: quiz.title, onUndo: () => dispatch(undoQuizDeletion(quiz.id)) },
      // The toast countdown must match the delete timer, so it never pauses.
      autoClose: UNDO_WINDOW_MS,
      pauseOnHover: false,
      pauseOnFocusLoss: false,
      closeOnClick: false,
      draggable: false,
    });
    const timer = setTimeout(() => void dispatch(finalizeQuizDeletion(quiz.id)), UNDO_WINDOW_MS);

    pendingDeletions.set(quiz.id, { quiz, timer, toastId });
  };
}
