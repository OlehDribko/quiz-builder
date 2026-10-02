import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";

import { getApiErrorMessage } from "@/lib/api-error";
import * as quizzesService from "@/services/quizzes.service";
import type { QuizListItem } from "@/types/quiz";

export interface QuizzesState {
  items: QuizListItem[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
  /** Quizzes hidden from the list while their delete can still be undone. */
  pendingDeletionIds: number[];
}

const initialState: QuizzesState = {
  items: [],
  status: "idle",
  error: null,
  pendingDeletionIds: [],
};

interface ThunkConfig {
  state: { quizzes: QuizzesState };
  rejectValue: string;
}

export const fetchQuizzes = createAsyncThunk<QuizListItem[], void, ThunkConfig>(
  "quizzes/fetchQuizzes",
  async (_, { rejectWithValue }) => {
    try {
      return await quizzesService.getQuizzes();
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error, "Failed to load quizzes."));
    }
  },
  {
    // Prevents duplicate requests, e.g. from React Strict Mode running effects twice.
    condition: (_, { getState }) => getState().quizzes.status !== "loading",
  },
);

const quizzesSlice = createSlice({
  name: "quizzes",
  initialState,
  reducers: {
    // Newest first, matching the order returned by GET /quizzes.
    quizAdded(state, action: PayloadAction<QuizListItem>) {
      if (!state.items.some((quiz) => quiz.id === action.payload.id)) {
        state.items.unshift(action.payload);
      }
    },
    quizRemovedOptimistically(state, action: PayloadAction<number>) {
      state.items = state.items.filter((quiz) => quiz.id !== action.payload);
      if (!state.pendingDeletionIds.includes(action.payload)) {
        state.pendingDeletionIds.push(action.payload);
      }
    },
    quizRestored(state, action: PayloadAction<QuizListItem>) {
      const quiz = action.payload;
      state.pendingDeletionIds = state.pendingDeletionIds.filter((id) => id !== quiz.id);
      if (state.items.some((item) => item.id === quiz.id)) {
        return;
      }
      // The list is newest first and ids grow with creation time, so ordering by id restores
      // the original position even when several quizzes are restored in any order.
      const position = state.items.findIndex((item) => item.id < quiz.id);
      state.items.splice(position === -1 ? state.items.length : position, 0, quiz);
    },
    quizDeletionCompleted(state, action: PayloadAction<number>) {
      state.pendingDeletionIds = state.pendingDeletionIds.filter((id) => id !== action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchQuizzes.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchQuizzes.fulfilled, (state, action) => {
        state.status = "succeeded";
        // Keep quizzes awaiting permanent deletion hidden if the list is reloaded meanwhile.
        state.items = action.payload.filter((quiz) => !state.pendingDeletionIds.includes(quiz.id));
      })
      .addCase(fetchQuizzes.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload ?? "Failed to load quizzes.";
      });
  },
});

export const { quizAdded, quizRemovedOptimistically, quizRestored, quizDeletionCompleted } =
  quizzesSlice.actions;

export default quizzesSlice.reducer;
