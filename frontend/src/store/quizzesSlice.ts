import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";

import { getApiErrorMessage } from "@/lib/api-error";
import * as quizzesService from "@/services/quizzes.service";
import type { QuizListItem } from "@/types/quiz";

export interface QuizzesState {
  items: QuizListItem[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
  deletingIds: number[];
  deleteError: string | null;
}

const initialState: QuizzesState = {
  items: [],
  status: "idle",
  error: null,
  deletingIds: [],
  deleteError: null,
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

export const deleteQuiz = createAsyncThunk<number, number, ThunkConfig>(
  "quizzes/deleteQuiz",
  async (id, { rejectWithValue }) => {
    try {
      await quizzesService.deleteQuiz(id);
      return id;
    } catch (error) {
      // The quiz is already gone on the server, so removing it locally is the correct outcome.
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return id;
      }
      return rejectWithValue(getApiErrorMessage(error, "Failed to delete the quiz."));
    }
  },
  {
    condition: (id, { getState }) => !getState().quizzes.deletingIds.includes(id),
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
    clearDeleteError(state) {
      state.deleteError = null;
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
        state.items = action.payload;
      })
      .addCase(fetchQuizzes.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload ?? "Failed to load quizzes.";
      })
      .addCase(deleteQuiz.pending, (state, action) => {
        state.deletingIds.push(action.meta.arg);
        state.deleteError = null;
      })
      .addCase(deleteQuiz.fulfilled, (state, action) => {
        state.items = state.items.filter((quiz) => quiz.id !== action.payload);
        state.deletingIds = state.deletingIds.filter((id) => id !== action.payload);
      })
      .addCase(deleteQuiz.rejected, (state, action) => {
        state.deletingIds = state.deletingIds.filter((id) => id !== action.meta.arg);
        state.deleteError = action.payload ?? "Failed to delete the quiz.";
      });
  },
});

export const { quizAdded, clearDeleteError } = quizzesSlice.actions;

export default quizzesSlice.reducer;
