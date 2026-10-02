import { createSlice } from "@reduxjs/toolkit";

import type { QuizListItem } from "@/types/quiz";

export interface QuizzesState {
  items: QuizListItem[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: QuizzesState = {
  items: [],
  status: "idle",
  error: null,
};

const quizzesSlice = createSlice({
  name: "quizzes",
  initialState,
  reducers: {},
});

export default quizzesSlice.reducer;
