import { configureStore } from "@reduxjs/toolkit";

import quizzesReducer from "./quizzesSlice";

// A new store per request keeps server renders from sharing state between users.
export function makeStore() {
  return configureStore({
    reducer: {
      quizzes: quizzesReducer,
    },
  });
}

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
